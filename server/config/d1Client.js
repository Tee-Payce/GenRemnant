const fetch = require('node-fetch');

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
let CF_D1_DB_UUID = process.env.CF_D1_DB_UUID; // may be name or uuid; we'll validate
const CF_API_TOKEN = process.env.CF_API_TOKEN;

if (!CF_ACCOUNT_ID || !CF_D1_DB_UUID || !CF_API_TOKEN) {
  // It's okay to not have these in local dev; the code will guard when USE_CLOUD_D1
}

const D1_QUERY_URL = (accountId, db) => `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/databases/${db}/query`;
const D1_LIST_URL = (accountId) => `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/databases`;

// cache resolved database id (to avoid repeated list calls)
let _resolvedDbId = CF_D1_DB_UUID;

async function query(sql, params = []) {
  // If the worker proxy is configured, call it instead of the raw D1 HTTP API.
  if (process.env.USE_CLOUD_D1_WORKER === 'true') {
    const workerUrl = process.env.CF_WORKER_URL;
    const workerSecret = process.env.WORKER_SECRET;
    if (!workerUrl || !workerSecret) throw new Error('Worker proxy not configured: set CF_WORKER_URL and WORKER_SECRET');

    const res = await fetch(`${workerUrl.replace(/\/$/, '')}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-secret': workerSecret,
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!res.ok) {
      const txt = await res.text();
      const err = new Error(`Worker proxy query failed: ${res.status} ${res.statusText} - ${txt}`);
      err.status = res.status;
      throw err;
    }

    const json = await res.json();

    if (!json.success) {
      const err = new Error(`Worker error: ${json.error || JSON.stringify(json)}`);
      err.payload = json;
      throw err;
    }

    // For SELECT, Worker returns { success:true, results: [...] }
    if (json.results) return json.results;
    // For insert/update/delete the worker returns { success:true, result }
    if (json.result) return Array.isArray(json.result) ? json.result : [json.result];
    return [];
  }

  if (!process.env.USE_CLOUD_D1 || !CF_ACCOUNT_ID || !_resolvedDbId || !CF_API_TOKEN) {
    throw new Error('Cloud D1 not configured. Set USE_CLOUD_D1 and CF_* env vars');
  }

  const body = { sql, params };

  // Helper to call D1 query endpoint and normalize errors
  const callD1 = async (dbId, accountId = CF_ACCOUNT_ID) => {
    const url = D1_QUERY_URL(accountId, dbId);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res;
  };

  let res = await callD1(_resolvedDbId);

  // If 404 route not found, try to list databases and resolve a proper db id
  if (!res.ok) {
    const txt = await res.text();
    // Try to detect route-not-found and fallback to listing DBs
    if (res.status === 404 || (txt && txt.includes('Route not found'))) {
      // Attempt to list databases to validate account/token and find matching DB
      const listRes = await fetch(D1_LIST_URL(CF_ACCOUNT_ID), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      });
      let listJson = null;
      try { listJson = await listRes.json(); } catch (e) { /* ignore */ }

      if (!listRes.ok) {
        // If listing DBs for the provided account failed, try to list accounts accessible to the token
        const accountsUrl = `https://api.cloudflare.com/client/v4/accounts`;
        const accRes = await fetch(accountsUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' } });
        let accJson = null;
        try { accJson = await accRes.json(); } catch (e) { /* ignore */ }

        if (!accRes.ok) {
          const listTxt = listJson ? JSON.stringify(listJson) : await listRes.text();
          const err = new Error(`D1 list failed: ${listRes.status} ${listRes.statusText} - ${listTxt}. Also failed to list accounts: ${accRes.status} ${accRes.statusText}`);
          err.status = listRes.status;
          throw err;
        }

        const accounts = accJson?.result || accJson?.results || accJson || [];
        // iterate accounts to find DB
        let foundDb = null;
        for (const a of accounts) {
          const aid = a.id || a.account_id || a.accountId;
          if (!aid) continue;
          const r = await fetch(D1_LIST_URL(aid), { method: 'GET', headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' } });
          let j = null;
          try { j = await r.json(); } catch (e) { j = null; }
          if (!r.ok) continue;
          const dbs2 = j?.result?.databases || j?.result || j?.databases || j?.results || j || [];
          const found = (Array.isArray(dbs2) ? dbs2 : Object.values(dbs2)).find(d => d.id === CF_D1_DB_UUID || d.name === CF_D1_DB_UUID || d.database_name === CF_D1_DB_UUID || d.database_id === CF_D1_DB_UUID);
          if (found) {
            foundDb = { accountId: aid, db: found };
            break;
          }
        }

        if (foundDb) {
          // update account id and resolved db id and retry
          _resolvedDbId = foundDb.db.id || foundDb.db.database_id || foundDb.db.databaseId || foundDb.db.name || foundDb.db.database_name;
          // Retry with found account
          res = await callD1(_resolvedDbId, foundDb.accountId);
        } else {
          const dbs = listJson?.result?.databases || listJson?.result || listJson?.databases || listJson?.results || listJson || [];
          const err = new Error(`D1 database '${CF_D1_DB_UUID}' not found in account ${CF_ACCOUNT_ID}. Available DBs for that account: ${JSON.stringify(dbs).slice(0,1000)}. Token has access to accounts: ${JSON.stringify(accounts).slice(0,1000)}`);
          err.payload = { listJson, accounts: accJson };
          throw err;
        }
      } else {
        // proceed with previous behavior when listRes.ok
        const dbs = listJson?.result?.databases || listJson?.result || listJson?.databases || listJson?.results || listJson || [];
        // Try to find by id or by name
        const found = (Array.isArray(dbs) ? dbs : Object.values(dbs)).find(d => d.id === CF_D1_DB_UUID || d.name === CF_D1_DB_UUID || d.database_name === CF_D1_DB_UUID || d.database_id === CF_D1_DB_UUID);
        if (found && (found.id || found.database_id || found.databaseName)) {
          // pick the proper id field
          const resolved = found.id || found.database_id || found.databaseId || found.database_id || found.database_name || found.name;
          // use id if present
          _resolvedDbId = found.id || found.database_id || found.databaseId || found.database_name || found.name || resolved;
          // try again with resolved id
          res = await callD1(_resolvedDbId);
        } else {
          const err = new Error(`D1 database '${CF_D1_DB_UUID}' not found in account. Available DBs: ${JSON.stringify(dbs).slice(0,1000)}`);
          err.payload = listJson;
          throw err;
        }
      }
    } else {
      const err = new Error(`D1 query failed: ${res.status} ${res.statusText} - ${txt}`);
      err.status = res.status;
      throw err;
    }
  }

  const json = await res.json();
  // If Cloudflare returned a failure shape, surface the error messages
  if (json && json.success === false) {
    const errs = json.errors || json.result?.errors || json;
    const msg = Array.isArray(errs) ? errs.map(e => e.message || JSON.stringify(e)).join('; ') : JSON.stringify(errs);
    const err = new Error(`D1 API error: ${msg}`);
    err.payload = json;
    throw err;
  }

  // Cloudflare D1 responses may nest results in different places.
  // Normalize to always return an array of rows.
  let rows = null;
  if (json && Array.isArray(json)) rows = json;
  else if (json?.results && Array.isArray(json.results)) rows = json.results;
  else if (json?.result && Array.isArray(json.result.results)) rows = json.result.results;
  else if (json?.result && Array.isArray(json.result)) rows = json.result;
  else if (json?.result && typeof json.result === 'object') {
    // single-row object
    rows = [json.result];
  } else if (json && typeof json === 'object') {
    // fallback: wrap object
    rows = [json];
  } else {
    rows = [];
  }

  return rows;
}

module.exports = { query };
