// Netlify Function - Google Gemini API (2026)

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_OUTPUT_TOKENS = 8192;

export const handler = async (event) => {
  const response = (status, body) => ({
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  });

  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response(500, {
      error: "Missing GEMINI_API_KEY"
    });
  }

  let body;

  try {
    body = JSON.parse(event.body);
  } catch {
    return response(400, {
      error: "Invalid JSON"
    });
  }

  const { system, messages } = body;

  const contents = [];

  if (system) {
    contents.push({
      role: "user",
      parts: [{ text: system }]
    });
  }

  for (const msg of messages) {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    });
  }

  try {

    const api = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: MAX_OUTPUT_TOKENS
        }
      })
    });

    const data = await api.json();

    if (!api.ok) {
      return response(api.status, data);
    }

    return response(200, data);

  } catch (e) {

    return response(500, {
      error: e.message
    });

  }

};
