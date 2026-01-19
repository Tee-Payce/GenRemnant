const fetch = require('node-fetch');
require('dotenv').config();

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_D1_DB = process.env.CF_D1_DB_UUID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

function maskToken(token) {
  if (!token) return '<no-token>';
  return token.length > 10 ? `${token.slice(0,6)}...${token.slice(-4)}` : '***';
}

async function fetchAndLog(url, opts = {}, label = '') {
  console.log('\n---');
  console.log(label || 'REQUEST');
  console.log('URL:', url);
  console.log('Method:', (opts.method || 'GET'));
  if (opts.headers) {
    const headers = Object.assign({}, opts.headers);
    if (headers.Authorization) headers.Authorization = `Bearer ${maskToken(CF_API_TOKEN)}`;
    console.log('Request headers:', headers);
  }
  if (opts.body) {
    try {
      console.log('Request body:', typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    } catch (e) {
      console.log('Request body: <unprintable>');
    }
  }

  const res = await fetch(url, opts);
  const status = res.status;
  let text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = text;
  }

  console.log('Response status:', status);
  try {
    // print a compact version of response headers
    const raw = {};
    res.headers && res.headers.forEach && res.headers.forEach((v, k) => { raw[k] = v; });
    console.log('Response headers:', raw);
  } catch (e) {
    // ignore header serialisation errors
  }

  console.log('Response body:');
  console.log(parsed);
  return { status, body: parsed };
}

async function listDbs() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/databases`;
  return fetchAndLog(url, { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } }, 'LIST DBs');
}

async function runSelect() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/databases/${CF_D1_DB}/query`;
  const body = { sql: 'SELECT 1', params: [] };
  return fetchAndLog(url, { method: 'POST', headers: { Authorization: `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 'SELECT 1');
}

async function main() {
  try {
    console.log('CF_ACCOUNT_ID:', CF_ACCOUNT_ID || '<not-set>');
    console.log('CF_D1_DB:', CF_D1_DB || '<not-set>');
    console.log('CF_API_TOKEN (masked):', maskToken(CF_API_TOKEN));

    const list = await listDbs();
    const select = await runSelect();

    // return non-zero exit if both calls failed
    if ((list.status >= 400 || (list.body && list.body.success === false)) && (select.status >= 400 || (select.body && select.body.success === false))) {
      console.error('\nBoth D1 list and query failed. Please verify the account has D1 enabled and the token is scoped to that account.');
      process.exit(2);
    }
  } catch (err) {
    console.error('Error during D1 test:', err && (err.message || err));
    process.exit(1);
  }
}

main();
