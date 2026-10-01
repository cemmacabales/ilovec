// Proxies the few TMDB endpoints the app uses, adding the API key server-side
// so it stays out of the client bundle. Set TMDB_API_KEY in the Netlify site's
// environment (and in .env for `npm run dev`, which serves this same handler).

const TMDB = 'https://api.themoviedb.org/3';

const ALLOWED = [
  /^\/search\/(multi|movie|tv)$/,
  /^\/trending\/(all|movie|tv)\/(day|week)$/,
  /^\/(movie|tv)\/\d+$/,
];

const PARAMS = new Set(['query', 'page', 'language', 'include_adult']);

export default async function handler(req: Request): Promise<Response> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return Response.json({ error: 'TMDB_API_KEY is not set' }, { status: 500 });
  if (req.method !== 'GET') return new Response(null, { status: 405 });

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/tmdb/, '');
  if (!ALLOWED.some((re) => re.test(path))) return Response.json({ error: 'Not allowed' }, { status: 404 });

  const upstream = new URL(TMDB + path);
  for (const [name, value] of url.searchParams) {
    if (PARAMS.has(name)) upstream.searchParams.set(name, value);
  }
  upstream.searchParams.set('api_key', key);

  const res = await fetch(upstream);
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      // Search results barely change; let the CDN and browser reuse them briefly.
      'Cache-Control': res.ok ? 'public, max-age=300' : 'no-store',
    },
  });
}

export const config = { path: '/api/tmdb/*' };
