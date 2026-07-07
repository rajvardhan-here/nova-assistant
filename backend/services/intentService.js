import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const detectIntent = async (message) => {
  const now = new Date();
  const nowIST = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

  const systemPrompt = `You are an intent classifier for an assistant called SAKHA.
Current date and time (India, IST): ${nowIST}

Classify the user's message into exactly one of these types:
- "chat": general conversation, opinions, or anything not requiring real-time data or a task
- "search": user is asking about current/real-time info — weather, live sports scores, news, stock prices, or any fact that could have changed recently
- "note": user wants to save a note (e.g. "add a note: buy milk")
- "reminder": user wants to be reminded of something at a specific time (e.g. "remind me to call mom at 5pm")
- "alarm": user wants an alarm set (e.g. "set an alarm for 7am")
- "event": user wants a calendar event added (e.g. "add event tomorrow 3pm meeting")

Respond with ONLY valid JSON, no explanation, no markdown, in this exact format:
{"type": "chat|search|note|reminder|alarm|event", "content": "short description or search query", "dueDate": "ISO 8601 datetime string or null"}

Rules:
- For "chat", set content to "" and dueDate to null.
- For "search", content should be a clean, focused search query extracted from the message.
- For "note", dueDate is always null.
- For "reminder", "alarm", "event": compute dueDate based on current date/time given above. If only a time is mentioned and it has already passed today, use tomorrow's date.
- Always return valid ISO 8601 format for dueDate (e.g. "2026-07-08T07:00:00+05:30") when applicable.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    if (!["chat", "search", "note", "reminder", "alarm", "event"].includes(parsed.type)) {
      return { type: "chat", content: "", dueDate: null };
    }

    return parsed;
  } catch (error) {
    console.error("Intent detection error:", error.message);
    return { type: "chat", content: "", dueDate: null };
  }
};