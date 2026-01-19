addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(request, event) {
  const url = new URL(request.url);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-worker-secret',
      },
    });
  }

  if (url.pathname === '/query' && request.method === 'POST') {
    try {
      const secret = request.headers.get('x-worker-secret') || '';
      const env = event && event?.env ? event.env : globalThis;
      if (!env.WORKER_SECRET || secret !== env.WORKER_SECRET) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }

      const body = await request.json();
      const sql = body.sql;
      const params = Array.isArray(body.params) ? body.params : [];

      if (!sql) return new Response(JSON.stringify({ success: false, error: 'Missing sql in body' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

      // Prepare and bind params. D1's .prepare returns a statement.
      const stmt = env.DB.prepare(sql);
      if (params.length) stmt.bind(...params);

      const normalized = sql.trim().toUpperCase();
      if (normalized.startsWith('SELECT')) {
        const { results } = await stmt.all();
        return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } else {
        const r = await stmt.run();
        return new Response(JSON.stringify({ success: true, result: r }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message, stack: err.stack }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  }

  return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}

addEventListener('fetch', event => {
  event.respondWith(new Response('ok', { status: 200 }));
});
