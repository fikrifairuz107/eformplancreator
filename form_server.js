// form_server.js
// Serves the Fiuu Plan Request Form
// Deploy on Railway alongside existing servers

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = process.env.PORT || 3004;
const HTML_FILE = path.join(__dirname, 'plan_request_form.html');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/index.html') {
    fs.readFile(HTML_FILE, 'utf8', (err, data) => {
      if (err) { res.writeHead(500); res.end('Form not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'Fiuu Plan Request Form' }));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Plan Request Form running on port ${PORT}`);
});
