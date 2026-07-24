// Netlify Function — proxy gọi Google Gemini API.
// Giữ GEMINI_API_KEY ở phía server (biến môi trường trên Netlify),
// KHÔNG bao giờ lộ ra trình duyệt của người dùng.
//
// Thiết lập trên Netlify: Site configuration → Environment variables
//   GEMINI_API_KEY = AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Model: gemini-2.5-flash
// Docs:  https://ai.google.dev/gemini-api/docs
//
// Được gọi từ trình duyệt qua route /api/generate, redirect sang
// /.netlify/functions/generate theo cấu hình trong netlify.toml.

const GEMINI_MODEL = 'gemini-2.5-flash-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Giáo án dài & chi tiết hơn cần nhiều token đầu ra hơn hẳn mức mặc định.
const MAX_OUTPUT_TOKENS = 32768;

export const handler = async (event) => {
  const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      error: 'Thiếu GEMINI_API_KEY trên server. Vào Netlify → Site configuration → Environment variables để thêm.'
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonResponse(400, { error: 'Body gửi lên không phải JSON hợp lệ.' });
  }

  const { system, messages } = payload;
  if (!system || !messages) {
    return jsonResponse(400, { error: 'Thiếu tham số system hoặc messages.' });
  }

  // Chuyển đổi messages (dạng { role, content }) sang định dạng "contents" của Gemini.
  // Gemini dùng role "model" thay cho "assistant".
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 1,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return jsonResponse(geminiRes.status, data);
    }

    return jsonResponse(200, data);
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Lỗi không xác định khi gọi Gemini API.' });
  }
};
