import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Task from "../models/Task.js";
import Memory from "../models/Memory.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { getGroqResponse } from "../services/groqService.js";
import { detectIntent } from "../services/intentService.js";
import { webSearch } from "../services/searchService.js";
import { createCalendarEvent } from "../services/calendarService.js";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.userId, title: "New Chat" });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({ pinned: -1, updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const togglePinChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    chat.pinned = !chat.pinned;
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, userId: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    await Message.deleteMany({ chatId: req.params.chatId });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const typeLabels = {
  note: "📝 Note saved",
  reminder: "⏰ Reminder set",
  alarm: "⏰ Alarm set",
  event: "📅 Event added",
};

const formatDueDate = (dueDate) => {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const answerFromSearch = async (query, searchData) => {
  const context = (searchData.results || [])
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.content} (URL: ${r.url})`)
    .join("\n\n");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are SAKHA, a friendly AI. Use the search results below to answer the user's question naturally and conversationally. At the end, on a new line, include the single most relevant source URL in this exact format: SOURCE: <url>. Keep the spoken answer concise. No markdown formatting in the main answer.",
      },
      { role: "user", content: `Question: ${query}\n\nInformation found:\n${context}` },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "I couldn't find current information on that.";
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const googleAccessToken = req.headers["x-google-token"];

    if (!chatId || !content) {
      return res.status(400).json({ error: "chatId and content are required" });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const userMessage = await Message.create({ chatId, role: "user", content });

    const intent = await detectIntent(content);
    let aiReply;

    if (intent.type === "chat") {
      const pastMessages = await Message.find({ chatId }).sort({ createdAt: 1 });
      const history = pastMessages.map((m) => ({ role: m.role, content: m.content }));
      const memories = await Memory.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30);
      aiReply = await getGroqResponse(history, memories);
    } else if (intent.type === "memory") {
      const memory = await Memory.create({ userId: req.userId, content: intent.content || content });
      aiReply = `🧠 Got it, I'll remember: "${memory.content}"`;
    } else if (intent.type === "search") {
      try {
        const searchData = await webSearch(intent.content || content);
        const rawReply = await answerFromSearch(intent.content || content, searchData);
        const sourceMatch = rawReply.match(/SOURCE:\s*(\S+)/i);
        const cleanReply = rawReply.replace(/SOURCE:\s*\S+/i, "").trim();
        aiReply = sourceMatch ? `${cleanReply}\n\n🔗 ${sourceMatch[1]}` : cleanReply;
      } catch (err) {
        console.error("Search error:", err.message);
        aiReply = "I couldn't fetch that information right now, sorry!";
      }
    } else if (intent.type === "event" && googleAccessToken) {
      try {
        await createCalendarEvent({
          accessToken: googleAccessToken,
          summary: intent.content || content,
          description: "Added by SAKHA",
          startDateTime: intent.dueDate || new Date().toISOString(),
        });
        aiReply = `📅 Added to your Google Calendar: "${intent.content}" for ${formatDueDate(intent.dueDate)} ✅`;
      } catch (err) {
        console.error("Calendar error:", err.message);
        const task = await Task.create({
          userId: req.userId,
          type: "event",
          content: intent.content || content,
          dueDate: intent.dueDate || null,
        });
        aiReply = `📅 Event saved in SAKHA: "${task.content}" for ${formatDueDate(task.dueDate)} (couldn't sync to Google Calendar) ✅`;
      }
    } else {
      const task = await Task.create({
        userId: req.userId,
        type: intent.type,
        content: intent.content || content,
        dueDate: intent.dueDate || null,
      });
      const label = typeLabels[intent.type] || "Task saved";
      const dueText = task.dueDate ? ` for ${formatDueDate(task.dueDate)}` : "";
      aiReply = `${label}: "${task.content}"${dueText} ✅`;
    }

    const assistantMessage = await Message.create({ chatId, role: "assistant", content: aiReply });

    if (chat.title === "New Chat") {
      chat.title = content.slice(0, 40);
      await chat.save();
    }

    res.json({ userMessage, assistantMessage });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ error: error.message });
  }
};