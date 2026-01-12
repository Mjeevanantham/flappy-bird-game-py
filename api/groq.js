export default async function handler(req, res) {
  // Simple proxy to a Groq-compatible AI endpoint. Set GROQ_API_KEY env var in Vercel.
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const body = req.body || {};
  const endpoint = process.env.GROQ_ENDPOINT || 'https://api.groq.ai/v1/predict';
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
  try {
    const fetchRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });
    const json = await fetchRes.json();
    return res.status(200).json(json);
  } catch (e) {
    console.error('groq proxy error', e);
    return res.status(500).json({ error: 'proxy failed' });
  }
}
