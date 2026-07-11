import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getGroqResponse = async (history, memories = []) => {
  try {
    const memoryText =
      memories.length > 0
        ? `\n\nThings you remember about this user:\n${memories.map((m) => `- ${m.content}`).join("\n")}\nUse this naturally in conversation when relevant, without explicitly saying "I remember that..." every time.`
        : "";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are SAKHA, a warm, friendly AI companion — like a close friend, not a formal assistant. Talk casually and naturally, use short conversational sentences, show genuine interest, and avoid sounding robotic or overly formal. Don't use markdown formatting — just plain natural sentences, since your replies are also spoken aloud. Keep replies concise unless the person asks for detail." +
            memoryText,
        },
        ...history,
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, no response generated.";
  } catch (error) {
    console.error("Groq API error:", error.message);
    throw new Error("Failed to get response from SAKHA");
  }
};