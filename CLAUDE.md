# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

툴바이트(TOOLVITE) 아크릴 브러쉬 마카 브랜드 소개 사이트 (https://www.toolvite.com). 빌드 단계·프레임워크·테스트가 없는 순수 정적 HTML/CSS/JS 사이트를 Express가 서빙합니다. 사이트 문구는 모두 한국어입니다. 배포 절차 전체는 `DEPLOY.md` 참고.

## 명령어

```bash
npm install --omit=dev          # 의존성은 express 하나
npm start                       # node server.js (기본 포트 3400, PORT 환경변수로 변경)
curl http://localhost:3400/healthz   # "ok"
pm2 restart toolvite-site       # server.js를 바꿨을 때만 필요
```

lint/테스트 도구는 없습니다. 검증은 서버를 띄우고 curl로 각 경로(`/`, `/brand`, `/product`, `/features`, `/gallery`, `/buy`, 없는 경로 → 404)를 확인하는 식으로 합니다.

## 구조

- `server.js` — 동작 순서가 중요한 미들웨어 체인:
  1. `toolvite.com`(루트) 호스트 → `https://www.toolvite.com`으로 301 (Cloudflare Tunnel 뒤라 `x-forwarded-host`를 먼저 봄, `trust proxy` 켜짐)
  2. 보안 헤더
  3. `/<page>.html` → 확장자 없는 주소로 301 (페이지 목록이 정규식에 하드코딩됨)
  4. `express.static`에 `extensions: ['html']` → `/brand`가 `public/brand.html`로 매핑. HTML은 `no-cache`, 정적 자산은 7일 캐시
  5. `/healthz`, 그 외는 `public/404.html`
- `public/*.html` — 페이지마다 `<head>`(메타/OG/폰트)와 헤더 nav, 푸터가 **각 파일에 복붙**되어 있음. 템플릿/인클루드 없음 → 공통 부분을 고치면 7개 HTML 모두 수정해야 함.
- `public/css/style.css`, `public/js/site.js` — 전 페이지 공용. JS는 모바일 메뉴 토글과 갤러리 라이트박스(`<dialog class="lightbox">` + `.g-item` 버튼)만 담당.
- `public/images/` — WebP 최적화본 사용. `og.jpg`(1200×630)는 OG 미리보기용.

## 수정 시 주의

- `public/` 파일은 덮어쓰면 즉시 반영(재시작 불필요). CSS/JS를 바꾸면 모든 HTML의 `style.css?v=N` / `site.js?v=N` 숫자를 올려 캐시를 무효화.
- 페이지를 추가/이름변경할 때 함께 고칠 곳: `server.js`의 `.html` 리다이렉트 정규식, 모든 HTML의 nav, `public/sitemap.xml`, 해당 페이지의 `canonical`/`og:url`.
- 포트는 **3400** (`server.js` 기본값과 `ecosystem.config.js`). 포트를 바꾸면 `ecosystem.config.js`, `DEPLOY.md`, Cloudflare Tunnel 라우트(`localhost:PORT`)를 함께 바꿔야 함.
