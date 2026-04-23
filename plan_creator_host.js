// plan_creator_host.js
// Hosts:
//   GET /plan-creator.js  → Tampermonkey userscript
//   GET /                 → Fiuu Eform Plan Request Form
//   GET /health           → Health check

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = process.env.PORT || 3003;
const SCRIPT_FILE = path.join(__dirname, 'fiuu_bulk_plan_creator.js');
const FORM_FILE   = path.join(__dirname, 'plan_request_form.html');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // ── Health check ──────────────────────────────────────────────────────────
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'Fiuu Plan Creator Host' }));
    return;
  }

  // ── Serve Tampermonkey userscript ─────────────────────────────────────────
  if (url === '/plan-creator.js') {
    fs.readFile(SCRIPT_FILE, 'utf8', (err, data) => {
      if (err) { res.writeHead(500); res.end('Script not found'); return; }
      const v = (data.match(/@version\s+([^\s]+)/) || [])[1] || '?';
      console.log(`[${new Date().toISOString()}] Script served v${v}`);
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
    return;
  }

  // ── Serve Plan Request Form ───────────────────────────────────────────────
  if (url === '/' || url === '/index.html' || url === '/form') {
    fs.readFile(FORM_FILE, 'utf8', (err, data) => {
      if (err) { res.writeHead(500); res.end('Form not found'); return; }
      console.log(`[${new Date().toISOString()}] Form served`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Fiuu Plan Creator Host running on port ${PORT}`);
  console.log(`📋 Form URL:   https://YOUR_RAILWAY_URL/`);
  console.log(`📦 Script URL: https://YOUR_RAILWAY_URL/plan-creator.js`);
});
