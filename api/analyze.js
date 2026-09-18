const DEFAULT_MODEL = "gemini-3.6-flash";
const ALLOWED_MODELS = ["gemini-3.6-flash"]; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "サーバーにGEMINI_API_KEYが設定されていません。" });
    return;
  }

  const { model, contents, generationConfig } = req.body || {};

  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: "contents が不正です。" });
    return;
  }
  const safeModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      })
    });
    
    const data = await geminiResponse.text();
    res.status(geminiResponse.status);
    res.setHeader("Content-Type", "application/json");
    res.send(data);

  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Gemini APIへの接続に失敗しました。" });
  }
}
