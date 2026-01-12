export default async function handler(req, res) {
  // Accept run reports from the client and log them. Optionally require REPORT_SECRET env var.
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const secret = process.env.REPORT_SECRET;
  if (secret && req.headers['x-report-secret'] !== secret) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body || {};
  console.log('AI run report received:', JSON.stringify(body));
  // In serverless environment logs are available in Vercel / functions. You can extend this to store runs in a DB.
  return res.status(200).json({ ok: true });
}
