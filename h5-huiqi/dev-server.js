/* 本地开发服务器：静态托管 H5 + 同源反代 /app-api -> 后端 48080（芋道 yudao-server 默认端口） */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5173);
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:48080';
const target = new URL(API_TARGET);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // 1) 反代 app-api / admin-api 到后端，保持同源
  if (req.url.startsWith('/app-api') || req.url.startsWith('/admin-api')) {
    const opts = {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      method: req.method,
      path: req.url,
      headers: Object.assign({}, req.headers, { host: target.host })
    };
    const proxy = http.request(opts, (up) => {
      // AI 助手为 SSE 流式响应，需即时下发，禁用缓冲与超时
      if ((up.headers['content-type'] || '').includes('text/event-stream')) {
        res.setTimeout(0);
        if (res.socket) res.socket.setNoDelay(true);
      }
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    });
    proxy.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        code: 502,
        msg: '后端 app-api 未启动（需要 liqi-saas 全栈包的后端，端口 48080）'
      }));
    });
    req.pipe(proxy);
    return;
  }

  // 2) 静态文件
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^([\\/])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }

  fs.readFile(file, (err, buf) => {
    if (err) {
      // SPA 兜底
      fs.readFile(path.join(ROOT, 'index.html'), (e2, idx) => {
        if (e2) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(idx);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`H5  : http://127.0.0.1:${PORT}/`);
  console.log(`API : /app-api -> ${API_TARGET}`);
});
