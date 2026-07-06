import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// history: array of { role, content } messages
export const getGroqResponse = async (history) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are SAKHA, a helpful and friendly AI assistant. Keep responses clear and concise.",
        },
        ...history,
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, no response generated.";
  } catch (error) {
    console.error("Groq API error:", error.message);
    throw new Error("Failed to get response from SAKHA");
  }
};