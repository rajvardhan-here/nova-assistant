import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { getGroqResponse } from "../services/groqService.js";

// Create a new chat thread
export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({ title: "New Chat" });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all chat threads (for sidebar)
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message and get AI reply
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ error: "chatId and content are required" });
    }

    // Save user message
    const userMessage = await Message.create({
      chatId,
      role: "user",
      content,
    });

    // Get past messages for context
    const pastMessages = await Message.find({ chatId }).sort({ createdAt: 1 });
    const history = pastMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiReply = await getGroqResponse(history);

    // Save AI message
    const assistantMessage = await Message.create({
      chatId,
      role: "assistant",
      content: aiReply,
    });

    // Auto-update chat title if it's still "New Chat"
    const chat = await Chat.findById(chatId);
    if (chat && chat.title === "New Chat") {
      chat.title = content.slice(0, 40);
      await chat.save();
    }

    res.json({ userMessage, assistantMessage });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ error: error.message });
  }
};