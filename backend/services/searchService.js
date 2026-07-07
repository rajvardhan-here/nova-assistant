import dotenv from "dotenv";
dotenv.config();

export const webSearch = async (query) => {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
    }),
  });

  if (!res.ok) {
    throw new Error("Web search failed");
  }

  return res.json(); // { answer, results: [{ title, url, content }] }
};