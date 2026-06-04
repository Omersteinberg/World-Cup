// Vercel serverless function — all /api/football/* requests are rewritten here by vercel.json.
// The upstream path arrives as the query param ?p=competitions/WC/matches etc.
// The API key stays server-side and never reaches the browser.

export default async function handler(req, res) {
  const pathStr = (req.query.p ?? '').replace(/^\/+/, '');

  // Forward any extra query params the client sent (except our internal "p")
  const fwd = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'p') fwd.append(k, v);
  }
  const qs = fwd.toString();

  const upstreamUrl =
    `https://api.football-data.org/v4/${pathStr}${qs ? '?' + qs : ''}`;
  const apiKey = (process.env.VITE_FOOTBALL_API_KEY ?? '').trim();

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { 'X-Auth-Token': apiKey },
    });

    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: `Proxy fetch failed: ${err.message}` });
  }
}
