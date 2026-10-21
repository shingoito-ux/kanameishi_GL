#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// Plain static file server. html/common/header.html and footer.html are
// loaded into every page client-side (see js/main.js) via [data-include],
// so this works the same as any other static host (Netlify, GitHub Pages,
// VSCode Live Server, ...) — no server-side templating required.
http
  .createServer((req, res) => {
    const reqPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(ROOT, reqPath === '/' ? '/index.html' : reqPath);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Same behaviour as Netlify / GitHub Pages: serve the root 404.html
        fs.readFile(path.join(ROOT, '404.html'), (err404, page) => {
          res.writeHead(404, { 'Content-Type': err404 ? 'text/plain' : TYPES['.html'] });
          res.end(err404 ? 'Not found: ' + reqPath : page);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Serving http://localhost:${PORT}`));
