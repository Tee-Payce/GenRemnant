/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-worker-secret'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Skip secret validation for now
    // const secret = request.headers.get('x-worker-secret');

    if (url.pathname === "/health") {
      return new Response("D1 API OK", { headers: corsHeaders });
    }

    if (url.pathname === "/query" && method === 'POST') {
      try {
        const { sql, params } = await request.json();
        console.log('SQL:', sql, 'Params:', params);
        console.log('DB binding:', env.DB);
        
        if (!env.DB) {
          throw new Error('D1 database binding not found');
        }
        
        const stmt = env.DB.prepare(sql);
        const result = params && params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
        console.log('Query result:', result);
        
        return Response.json({ success: true, results: result.results || [] }, { headers: corsHeaders });
      } catch (error) {
        console.error('Query error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};	