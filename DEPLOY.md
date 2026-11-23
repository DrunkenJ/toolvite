# 툴바이트 브랜드 사이트 배포 (www.toolvite.com)

## 구성
```
toolvite-site/
├── server.js             Express 정적 서버 (포트 3400)
├── ecosystem.config.js   PM2 설정
├── package.json
└── public/
    ├── index.html  brand.html  product.html  features.html  gallery.html  buy.html  404.html
    ├── css/style.css   js/site.js
    ├── images/         (WebP 최적화본, og.jpg, logo.png, kc-mark.png)
    ├── robots.txt  sitemap.xml  favicon.svg
```
주소: `/` `/brand` `/product` `/features` `/gallery` `/buy`
`toolvite.com`(www 없이)으로 들어오면 서버가 `https://www.toolvite.com`으로 301 이동시킵니다.

## 1. NAS에 올리기
1. File Station에서 `toolvite-site.zip`을 `/volume1/srv/`에 올리고 압축 해제 → `/volume1/srv/toolvite-site/`
2. SSH 접속 후:
```bash
cd /volume1/srv/toolvite-site
npm install --omit=dev
pm2 start ecosystem.config.js      # pm2가 PATH에 없으면: npx pm2 start ecosystem.config.js
pm2 save
curl http://localhost:3400/healthz  # ok 가 나오면 정상
```
3400 포트를 이미 쓰고 있다면 `ecosystem.config.js`의 PORT만 바꾸고 아래 Tunnel 주소도 같이 바꾸세요.

## 2. Cloudflare 연결
1. **DNS 정리**: Cloudflare 대시보드 → toolvite.com → DNS에서 `www`(또는 `toolvite.com` 루트)에 기존 레코드(예: 다른 서비스로 가는 CNAME/A)가 있으면 먼저 삭제합니다. 남아 있으면 Tunnel 라우트 추가가 실패합니다.
2. **Tunnel 라우트 추가**: Zero Trust → Networks → Tunnels → 기존 NAS 터널 → Public Hostname → Add
   - Subdomain `www` / Domain `toolvite.com` / Service `HTTP` · `localhost:3400`
   - (선택) Subdomain 비움 / Domain `toolvite.com` / Service `HTTP` · `localhost:3400` → 루트 도메인도 www로 이동
3. **Access 확인**: Zero Trust → Access → Applications에 `*.toolvite.com` 같은 와일드카드 앱이 있으면 www가 로그인으로 잠깁니다. 그 경우 www용 Bypass(Everyone) 정책을 추가하거나 와일드카드를 portal 전용으로 바꾸세요.
4. SSL/TLS → Edge Certificates → **Always Use HTTPS** 켜기.

## 3. 오픈 확인
- 휴대폰 LTE와 PC 시크릿 창에서 https://www.toolvite.com 접속
- https://toolvite.com → www로 이동되는지
- 카카오톡에 링크 붙여 미리보기(og 이미지) 확인 — 이전 캐시가 보이면 developers.kakao.com/tool/clear/og 에서 초기화

## 4. 검색 등록
- Google Search Console: 도메인 속성 `toolvite.com` 추가(Cloudflare DNS TXT 인증) → Sitemaps에 `https://www.toolvite.com/sitemap.xml`
- 네이버 서치어드바이저: 사이트 `https://www.toolvite.com` 등록 → HTML 태그 인증 메타태그를 받으면 `public/index.html`의 `<head>`에 넣고 → 사이트맵 제출

## 수정할 때
`public/` 안의 파일만 덮어쓰면 바로 반영됩니다(서버 재시작 불필요). CSS/JS를 바꾼 뒤 캐시 때문에 옛 화면이 보이면 HTML의 `style.css?v=1`, `site.js?v=1` 숫자를 올리세요.
`server.js`를 바꿨을 때만 `pm2 restart toolvite-site`.
