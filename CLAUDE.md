# FigmaMcp — 프로젝트 규칙

Figma MCP로 디자인하고 Next.js로 구현하는 베이커리 쇼핑몰. 목적은 **AI 활용 제작 시간 측정**(목표 8시간)이다.
worktree 세션은 Claude 메모리를 공유하지 않으므로, 프로젝트 규칙은 이 파일이 기준이다.

@AGENTS.md

## 먼저 읽을 것
- `docs/design-brief.md` — 색 · 서체 · 화면 구성 · 이미지 규칙
- Wiki: https://github.com/im-pine/FigmaMcp/wiki (Design, Components, Architecture, Data)
- Figma: fileKey `K2JSj6AYetrUr0BpoN4R7u` — Shop `0:1`(쇼핑몰 화면, 데스크톱 y=0 / 모바일 y=3500), Components `3:2`, Admin `3:3`
- Next.js 16 API는 학습 데이터와 다르다. 코드 작성 전에 `node_modules/next/dist/docs/`의 해당 문서를 확인한다.

## 폴더 구조와 경계
```
src/app/(shop)/…        쇼핑몰 라우트 (얇게: features 컴포넌트 조합만)
src/app/admin/…         관리자 라우트
src/features/shop/<도메인>/   쇼핑몰 전용: components/ · hooks/ · actions.ts · store.ts
src/features/admin/<도메인>/  관리자 전용
src/shared/             공통: ui/(디자인 시스템) · lib/ · constants/ · providers/ · styles/tokens.css
src/server/             서버 전용: db.ts · services/ · auth/  (모든 파일 import "server-only")
src/generated/          prisma client · zod (커밋하지 않음, postinstall에서 생성)
prisma/                 schema.prisma · migrations · seed.ts
```
- ESLint가 막는다: `features/shop ↛ features/admin`, `features/admin ↛ features/shop`, `shared ↛ features · server`
- 두 영역에서 쓰는 것은 `shared/`로. 파일명: 컴포넌트 `PascalCase.tsx`, 그 외 `kebab-case.ts` (shadcn 생성 파일은 소문자 유지)

## 디자인 구현
- 색은 시맨틱 유틸만 쓴다: `bg-page · bg-card · bg-section · bg-inverse`, `text-heading · text-body · text-caption · text-link · text-on-inverse · text-on-action`, `bg-action · hover:bg-action-hover`, `border-line · border-line-strong`, `bg-badge · text-on-badge`, `bg-category-{all,bread,cake,cookie,beverage}`. hex 직접 사용 금지
- 텍스트 스타일: `type-display · type-h1~h3 · type-title · type-body-lg/md/sm · type-label · type-button · type-price`
- 모양: `rounded-card · rounded-input · rounded-pill`, `shadow-card`
- 공통 컴포넌트(`@/shared/ui`): Button(primary · secondary · inverse · disabled), Badge, Chip, Input, SearchBar, QuantityStepper, Dialog, Sheet, Select, Table, DropdownMenu, Label. 미리보기: `/dev/ui`
- 브라운은 바탕 · 글자, 그린은 클릭 요소에만. 모바일은 데스크톱 축소가 아니라 모바일 패턴(하단 탭 바 등)으로 구현
- 메인 배너는 `hero-desktop.jpg` / `hero-mobile.jpg`를 `<picture>` + `getImageProps`로 화면 폭에 맞는 것만 로드

## 데이터 · 서버
- 조회: Server Component에서 `@/server/services` 호출. Cache Components가 켜져 있으므로 DB 조회는 `'use cache'` + `cacheLife` + `cacheTag`로 캐시하거나 `<Suspense>`로 감싼다
- 변경: `features/*/<도메인>/actions.ts`('use server') → services. 입력은 `@/generated/zod` 스키마로 `safeParse`, 실패 시 throw 대신 `{ errors }` 반환
- 변경 후: 서버 캐시는 `updateTag(<tag>)`로 갱신. 클라이언트에서 TanStack Query로 들고 있는 목록(관리자 등)은 `invalidateQueries`도 함께
- Prisma 타입을 그대로 쓴다(별도 interface 금지). 클라이언트에서는 `import type`만. 가격은 `Int`(원)
- 개인정보는 서버에서 `@/shared/lib/mask`로 가린 뒤 내려보낸다. 비회원 주문조회 실패 메시지는 원인을 구분하지 않는다
- 주문 금액은 클라이언트 값이 아니라 DB 가격으로 다시 계산한다
- 관리자 변경 액션은 `verifyAdminPassword()`(`@/server/auth/admin-password`)로 먼저 확인한다
- `schema.prisma` · `shared/ui` · `tokens.css` · `globals.css`는 공통 영역이다. 기능 작업 중 바꿔야 하면 직접 고치지 말고 사용자에게 알린다

## Git · PR
- 브랜치: `main` ← `dev` ← `<feat|fix|docs>/<shop|admin|common>-<기능>` (영문 소문자 · 하이픈). `main` · `dev`에 직접 커밋 금지
- 커밋: `<gitmoji> <type>(<scope>): <요약>` (✨ feat · 🐛 fix · 💄 style · ♻️ refactor · 📝 docs · ✅ test · 🔧 chore · 🍱 assets · 🔥 remove)
- PR: base `dev`, 제목 = 커밋 메시지 형식(squash 시 그대로 커밋됨), 본문은 `.github/pull_request_template.md`(What · Review 최대 3개 · How to test, 짧은 불릿). **제목 칸만 영문, 내용은 한글로 쓴다**. 머지는 사용자가 승인 후 squash
- **PR을 올리기 전에 Review 항목을 직접 검증한다.** 화면은 실제 브라우저로 확인한다(헤드리스 Chrome + DevTools 프로토콜로 스크린샷 · 탭 · 애니메이션 프레임, 모바일은 390px 에뮬레이션). 보고할 때 항목별로 "확인함 / 판단 필요"를 구분하고, 사람의 판단이 필요한 것만 묻는다
- PR 없이 하는 작업(문서 등)은 사용자가 요청할 때만 커밋 · 푸시
- 병렬 작업은 worktree로: `git worktree add ../FigmaMcp-<영역>-<기능> -b feat/<영역>-<기능> dev` → `.env` 복사 → `pnpm install`
- `gh`는 `~/.local/bin/gh`에 있다 (PATH에 없음)

## 명령
`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm format` · `pnpm db:migrate` · `pnpm db:seed` · `pnpm db:studio`
