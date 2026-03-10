import http from 'node:http';
import { URL } from 'node:url';
import { fetchEvents, getLastRawSample } from './services/eventsService.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MS || 120000);

let cache = {
  events: [],
  fetchedAt: null,
  source: 'cold-start'
};

async function refreshCache() {
  try {
    const { events, source } = await fetchEvents();
    cache = {
      events,
      fetchedAt: new Date().toISOString(),
      source
    };
    console.log(`[refresh] ${cache.events.length} events from ${source} at ${cache.fetchedAt}`);
  } catch (error) {
    console.error('[refresh] failed:', error.message);
  }
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (req.method === 'GET' && reqUrl.pathname === '/health') {
    return sendJson(res, 200, { ok: true, service: 'unievent-events-api', fetchedAt: cache.fetchedAt });
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/events') {
    const forceRefresh = reqUrl.searchParams.get('refresh') === '1';

    if (forceRefresh || cache.events.length === 0) {
      await refreshCache();
    }

    return sendJson(res, 200, {
      source: cache.source,
      fetchedAt: cache.fetchedAt,
      count: cache.events.length,
      events: cache.events
    });
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/events/raw-sample') {
    return sendJson(res, 200, {
      provider: 'kudago',
      sample: getLastRawSample()
    });
  }

  return sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, HOST, async () => {
  console.log(`UniEvent backend listening on http://${HOST}:${PORT}`);
  await refreshCache();
  setInterval(refreshCache, REFRESH_INTERVAL_MS);
});
