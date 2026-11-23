// TOOLVITE 브랜드 사이트 (www.toolvite.com) — 정적 사이트 서버
// NAS에서 PM2로 실행, Cloudflare Tunnel이 https://www.toolvite.com → http://localhost:PORT 로 연결
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3400;
const CANONICAL_HOST = 'www.toolvite.com';
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// toolvite.com(루트 도메인)으로 들어오면 www로 301 이동
app.use((req, res, next) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
  if (host === 'toolvite.com') {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }
  next();
});

// 기본 보안 헤더
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// /index.html, /brand.html → 깔끔한 주소로 이동
app.get(/^\/(index|brand|product|features|gallery|buy)\.html$/, (req, res) => {
  const name = req.params[0];
  res.redirect(301, name === 'index' ? '/' : `/${name}`);
});

// 정적 파일: /brand → brand.html
app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  index: 'index.html',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.(webp|png|jpg|svg|css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  },
}));

// 헬스체크
app.get('/healthz', (req, res) => res.type('text').send('ok'));

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.listen(PORT, () => {
  console.log(`[toolvite-site] listening on http://localhost:${PORT}`);
});
