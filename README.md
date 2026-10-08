# FigmaMcp — AI 기반 베이커리 쇼핑몰 제작 시간 측정 프로젝트

> Figma MCP로 디자인을 자동 생성하고 그 디자인을 바탕으로 Next.js 쇼핑몰을 구현하면서, **AI를 활용한 쇼핑몰 제작이 실제로 얼마나 걸리는지** 단계별로 측정하는 프로젝트입니다.

---

## 🚀 Project Overview

이 프로젝트의 목적은 쇼핑몰 자체보다 **제작 과정에 걸리는 시간**을 확인하는 데 있습니다.

Figma MCP를 이용해 Figma에 웹 디자인을 자동으로 만들고, 그 디자인을 기준으로 실제 웹 사이트를 구현합니다. 프로젝트 설계부터 마무리까지 모든 단계를 나누어 소요 시간을 기록하고, **목표 시간(1일, 업무 시간 기준 8시간)** 과 실제 소요 시간을 비교합니다.

도메인은 **베이커리 쇼핑몰**입니다. 제작 범위는 **쇼핑몰(사용자)** 과 **관리자 페이지** 두 영역입니다.

## 🔗 결과물

- [프로젝트 Wiki](https://github.com/im-pine/FigmaMcp/wiki) — 디자인 시스템, 아키텍처, 시간 측정 기록 등 상세 문서
- [Figma 디자인 파일](https://www.figma.com/design/K2JSj6AYetrUr0BpoN4R7u) — 쇼핑몰 데스크톱 · 모바일 화면, 컴포넌트, 디자인 토큰
- [디자인 브리프](./docs/design-brief.md) — 색 · 타이포그래피 · 화면 구성 · 이미지 규칙

---

## ⏱ 시간 측정

| 순서 | 단계 | 범위 | 실제 소요 시간 |
| --- | --- | --- | --- |
| 1 | 프로젝트 설계 | README 작성, 기능 범위 정의, 기술 스택 및 데이터 구조 결정 | 1시간 10분 |
| 2 | 레퍼런스 조사 | 레퍼런스 디자인 조사, 디자인 방향 결정 | 44분 |
| 3 | 쇼핑몰 디자인 | Figma MCP로 사용자 페이지 디자인 (데스크톱 · 모바일, 이미지 생성 포함) | 2시간 |
| 4 | 쇼핑몰 개발 | 사용자 페이지 구현 | |
| 5 | 관리자 디자인 | Figma MCP로 관리자 페이지 디자인 | |
| 6 | 관리자 개발 | 관리자 페이지 구현 | |
| 7 | 마무리 | 테스트 코드 작성, 점검 | |
| | **합계** | **목표: 8시간 이내** | 3시간 54분 (진행 중) |

macOS 타이머 앱 [Session](https://www.stayinsession.com/)으로 측정하며, 휴식과 일시정지 구간은 제외합니다.
측정 방식과 단계별 회고는 [Wiki — Time](https://github.com/im-pine/FigmaMcp/wiki/Project%E2%80%90Time)에 정리했습니다.

---

## ✨ 주요 기능

로그인과 실제 결제는 범위에서 제외합니다. **비회원**이 쇼핑몰을 이용한다는 전제로 구현합니다.

### 쇼핑몰

- 상품 목록 · 카테고리 필터 · 검색 · 상세 조회
- 장바구니 담기 / 수량 변경 / 삭제 (새로고침 후에도 유지)
- 주문서 작성 후 결제창 표시까지 진행 (실제 결제 없음, 실제 개인정보 입력 금지 안내)
- 마이페이지: 주문번호 + 연락처로 비회원 주문 상세 조회 (카카오 로그인은 추후 도입)
- 모바일 전용 내비게이션: 하단 고정 탭 바, 카테고리 버블 메뉴

### 관리자

- 상품 등록 / 수정 / 삭제, 주문 조회 및 상태 관리
- 포트폴리오 확인용으로 **조회는 누구나 가능**, 데이터 변경은 **관리자 비밀번호** 확인 후 실행
- 주문자 개인정보는 마스킹해서 표시

### 제외 범위

| 기능 | 처리 방식 |
| --- | --- |
| 로그인 / 회원가입 | 구현하지 않음 (카카오 로그인 추후 도입 예정) |
| 결제 | PG 연동 없이 결제창 UI까지만 구현 |
| 이미지 업로드 | `public/`의 고정 이미지 사용 |

---

## 🎨 Design

**우아하면서 따뜻한, 갓 구운 빵 냄새가 나는 베이커리.** 베이지 바탕에 브라운을 조합하고, 브랜드 그린을 클릭 요소의 포인트 색으로 씁니다. 디자인 토큰 · 컴포넌트 · 화면 · 이미지는 모두 Figma MCP로 생성했습니다.

| 문서 | 내용 |
| --- | --- |
| [Colors](https://github.com/im-pine/FigmaMcp/wiki/FrontEnd%E2%80%90Colors) | 색 스케일 5종(같은 단계 = 같은 밝기), 시맨틱 토큰, 카테고리 색 |
| [Design](https://github.com/im-pine/FigmaMcp/wiki/FrontEnd%E2%80%90Design) | 콘셉트 · 레퍼런스, 화면 목록, 모바일 재설계, 사용자 흐름 |
| [Components](https://github.com/im-pine/FigmaMcp/wiki/FrontEnd%E2%80%90Components) | 공통 · 데스크톱 · 모바일 컴포넌트 |
| [Figma MCP](https://github.com/im-pine/FigmaMcp/wiki/Project%E2%80%90Figma%E2%80%90MCP) | 플랜 한도, 이미지 생성 · 배경 제거 방법 |

---

## 🛠 Core Stack

이 프로젝트의 기술 선택 기준은 **8시간 안에 완성할 수 있는가**입니다.

| 영역 | 기술 | 선택 이유 (요약) |
| --- | --- | --- |
| Framework | Next.js (App Router) | 별도 백엔드 서버 없이 화면과 API를 한 프로젝트에서 구현 |
| Language | TypeScript | 데이터 모델부터 UI까지 타입 안정성 확보 |
| ORM | Prisma | DB 스키마에서 생성된 타입을 애플리케이션 타입으로 그대로 사용 |
| Validation | Zod | Prisma 스키마에서 자동 생성한 Zod 스키마로 서버 입력값 검증 |
| Database | PostgreSQL | Prisma 최신 아키텍처(Prisma 8)가 우선 지원하는 DB |
| Server State | TanStack Query | 상품 · 주문 데이터의 캐싱과 변경 후 동기화 |
| Client State | Zustand | 장바구니 같은 단순한 전역 상태를 store 하나로 관리 |
| Styling | Tailwind CSS | 디자인 토큰을 utility로 바로 옮겨 빠르게 반영 |
| UI Components | shadcn/ui | Tailwind 구조를 유지하면서 반복 UI 구현 시간 단축 |
| Testing | Jest | 마무리 단계의 테스트 코드 작성 |

## 🧠 핵심 설계

- **Server Component 조회 + Server Action 변경** — Route Handler 없이 서버 로직을 처리하고, DB 로직은 `lib/services`로 분리 → [Architecture](https://github.com/im-pine/FigmaMcp/wiki/BackEnd%E2%80%90Architecture)
- **Prisma 스키마를 타입의 단일 기준으로** — 프론트엔드 interface를 따로 만들지 않고 Prisma 생성 타입과 자동 생성 Zod 스키마 사용 → [Data](https://github.com/im-pine/FigmaMcp/wiki/BackEnd%E2%80%90Data)
- **인증 없는 공개 관리자 페이지 보호** — 변경은 서버에서 비밀번호 확인, 개인정보는 서버에서 마스킹 → [Architecture](https://github.com/im-pine/FigmaMcp/wiki/BackEnd%E2%80%90Architecture)
- **서버 상태와 클라이언트 상태 분리** — 상품 · 주문은 TanStack Query, 장바구니는 Zustand + persist → [State](https://github.com/im-pine/FigmaMcp/wiki/FrontEnd%E2%80%90State)

---

## ⚙️ Getting Started

### Requirements

- Node.js 24 이상
- pnpm 10 (`corepack enable pnpm`)
- Docker (로컬 PostgreSQL)

### Environment Variables

```bash
cp .env.example .env
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 정보. 로컬과 배포 환경은 이 값만 바꿔서 구분합니다. |
| `ADMIN_PASSWORD` | 관리자 데이터 변경 시 확인하는 비밀번호. 서버에서만 읽으므로 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. |

### Installation & Development

```bash
pnpm install        # 설치 후 Prisma client · Zod 스키마 자동 생성
pnpm db:migrate     # DB 마이그레이션
pnpm db:seed        # 상품 12종 시드
pnpm dev            # http://localhost:3000  (디자인 시스템 미리보기: /dev/ui)
```

| Command | Description |
| --- | --- |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint (영역 경계 규칙 포함) |
| `pnpm typecheck` | 라우트 타입 생성 + TypeScript 검사 |
| `pnpm format` | Prettier |
| `pnpm db:studio` | Prisma Studio |

폴더 구조와 개발 규칙은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

---

## 🚀 Deployment

- Hosting: Vercel
- 배포 환경의 DB 연결 정보는 Vercel 환경 변수 `DATABASE_URL`로 주입합니다.
