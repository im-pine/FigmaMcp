# FigmaMcp — AI 기반 베이커리 쇼핑몰 제작 시간 측정 프로젝트

> Figma MCP로 디자인을 자동 생성하고 그 디자인을 바탕으로 Next.js 쇼핑몰을 구현하면서, **AI를 활용한 쇼핑몰 제작이 실제로 얼마나 걸리는지** 단계별로 측정하는 프로젝트입니다.

<details>
<summary>📋 목차</summary>

- [🚀 Project Overview](#-project-overview)
- [🔗 결과물](#-결과물)
- [⏱ 시간 측정](#-시간-측정)
- [✨ 주요 기능](#-주요-기능)
- [🎨 Design](#-design)
- [🛠 Core Stack](#-core-stack)
- [🧠 Technical Highlights](#-technical-highlights)
- [🔄 주요 동작 흐름](#-주요-동작-흐름)
- [⚙️ Getting Started](#️-getting-started)
- [🚀 Deployment](#-deployment)

</details>

---

## 🚀 Project Overview

이 프로젝트의 목적은 쇼핑몰 자체보다 **제작 과정에 걸리는 시간**을 확인하는 데 있습니다.

Figma MCP를 이용해 Figma에 웹 디자인을 자동으로 만들고, 그 디자인을 기준으로 실제 웹 사이트를 구현합니다. 프로젝트 설계부터 마무리까지 모든 단계를 나누어 소요 시간을 기록하고, **목표 시간(1일, 업무 시간 기준 8시간)** 과 실제 소요 시간을 비교합니다.

도메인은 **베이커리 쇼핑몰**입니다. 제작 범위는 **쇼핑몰(사용자)** 과 **관리자 페이지** 두 영역입니다.

---

## 🔗 결과물

- [Figma 디자인 파일](https://www.figma.com/design/K2JSj6AYetrUr0BpoN4R7u) — 쇼핑몰 데스크톱 · 모바일 화면, 컴포넌트, 디자인 토큰
- [디자인 브리프](./docs/design-brief.md) — 색 · 타이포그래피 · 화면 구성 · 이미지 규칙

---

## ⏱ 시간 측정

### 측정 단계

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

### 측정 방식

- 측정 도구: macOS 타이머 앱 [Session](https://www.stayinsession.com/)
- 각 단계는 Session의 [URL Scheme](https://www.stayinsession.com/learn/session-url-scheme)으로 시작하고 종료합니다.
- `intent`는 `[Figma-MCP] 단계명` 형식으로 기록해 Session 통계에서 단계별 시간을 구분합니다.

```bash
# 예: [Figma-MCP] 쇼핑몰 디자인
open "session:///start?intent=%5BFigma-MCP%5D%20%EC%87%BC%ED%95%91%EB%AA%B0%20%EB%94%94%EC%9E%90%EC%9D%B8&categoryId=<Session 카테고리 ID>&duration=240"
open "session:///finish"
```

- 단계 사이의 휴식 시간과 단계 중 일시정지 구간은 측정에서 제외합니다.
- `duration`은 넉넉히 둡니다. Session은 설정한 집중 시간이 지나면 자동으로 종료됩니다.
- 각 단계가 끝나면 위 표에 실제 소요 시간을 기록합니다.

---

## ✨ 주요 기능

로그인과 실제 결제는 범위에서 제외합니다. **비회원**이 쇼핑몰을 이용한다는 전제로 구현합니다.

### 쇼핑몰 (사용자)

- 베이커리 상품 목록 및 상세 조회
- 장바구니 담기 / 수량 변경 / 삭제 (새로고침 후에도 유지)
- 주문서 작성 후 결제창 표시까지 진행 (실제 결제 연동 없음)
- 주문서에 "데모용이므로 실제 개인정보를 입력하지 마세요" 안내 표시
- 마이페이지: 비회원은 주문번호 + 주문자 연락처로 해당 주문의 상세(배송 진행 단계, 주문 상품, 마스킹된 배송 정보, 결제 정보)를 조회. 주문 내역 목록은 회원 전용으로, 카카오 로그인 도입 후 사용 (현재는 비활성 로그인 버튼만 표시)
- 모바일은 하단 고정 탭 바(검색 · 장바구니 · 상품 · 마이페이지 · 관리자)로 이동하며, 상품 버튼을 누르면 카테고리 버블이 떠오름

### 관리자

- 상품 등록 / 수정 / 삭제
- 주문 내역 조회 및 상태 관리 (주문자 이름 · 연락처 · 주소는 마스킹 처리)
- 포트폴리오 확인용으로 **조회는 누구나 가능**하며, 쇼핑몰 화면에서 버튼으로 바로 진입할 수 있습니다.
- 데이터 변경(등록 · 수정 · 삭제 · 주문 상태 변경)은 **관리자 비밀번호**를 입력해야 실행됩니다.
- 상품 이미지는 `public/`에 미리 넣어 둔 고정 이미지 중에서 선택합니다.

### 제외 범위

| 기능 | 처리 방식 |
| --- | --- |
| 로그인 / 회원가입 | 구현하지 않음. 비회원 이용을 전제로 함 (관리자 페이지 포함) |
| 결제 | PG 연동 없이 결제창 UI까지만 구현 |
| 이미지 업로드 | 구현하지 않음. `public/`의 고정 이미지 사용 |

---

## 🎨 Design

Figma MCP로 Figma 파일에 디자인 토큰, 컴포넌트, 화면을 직접 생성했습니다. 상세 규칙은 [디자인 브리프](./docs/design-brief.md)에 있습니다.

### 콘셉트

**우아하면서 따뜻한, 갓 구운 빵 냄새가 나는 베이커리.** 배경은 밝고 단순하게 두고, 개성은 상품 사진과 포인트 색 하나로 냅니다. 레퍼런스(Sugar Bliss, SLOY, CAKÉ 랜딩과 shadcn/ui 대시보드 예시)에서 상품 카드 · 상세 · 카테고리 카드 구성을 가져오고, 구현 비용이 큰 장식(손글씨, 스크롤 연출, 360° 회전 등)은 뺐습니다.

### 디자인 시스템

| 구분 | 내용 |
| --- | --- |
| 색 스케일 | brown(바탕 · 글자) · primary(브랜드 그린, 클릭 요소 전용) · secondary(브랜드 핑크) · honey · mauve. 모든 스케일을 **같은 단계 = 같은 밝기**로 맞춰, 단계만 바꿔 섞어 써도 대비 규칙이 유지됨 |
| 시맨틱 토큰 | `bg/*`, `text/*`, `border/*`, `action/*`, `badge/*`, `category/*` — Figma Variables에 CSS 변수명(`var(--bg-page)` 등)을 함께 기록해 Tailwind 설정으로 그대로 옮김 |
| 카테고리 색 | 빵 brown · 케이크 secondary(핑크) · 쿠키 honey · 음료 mauve. 네 색을 같은 밝기로 맞춰 나란히 놓여도 무게가 같음 |
| 타이포그래피 | 제목 Noto Serif KR, 본문 Noto Sans KR (둘 다 Google Fonts → `next/font`로 디자인과 같은 서체 사용) |
| 컴포넌트 | Button, Badge, Chip, Input, SearchBar, QuantityStepper, ProductCard, CategoryCard, CartItem, OrderSummary, OrderCard, OrderItemRow, Header/Footer, 모바일 전용(MobileHeader, BottomTabBar, CategoryTab 등) |

### 화면

| 영역 | 화면 |
| --- | --- |
| 쇼핑몰 (데스크톱 · 모바일) | 홈, 상품 목록, 검색, 검색 결과, 상품 상세, 장바구니, 주문서, 결제창, 주문 완료, 마이페이지(로그인 + 비회원 주문조회), 주문 내역(회원), 주문 상세 |
| 관리자 | 관리자 디자인 단계에서 작성 예정 |

### 모바일은 축소가 아니라 재설계

데스크톱 구조를 그대로 줄이지 않고 모바일 사용 패턴에 맞게 바꿨습니다.

| 데스크톱 | 모바일 |
| --- | --- |
| 헤더 메뉴 + 검색 · 장바구니 · 관리자 버튼 | 로고만 있는 헤더 + **하단 고정 탭 바**(검색 · 장바구니 · 상품 · 마이페이지 · 관리자) |
| 카테고리 카드 4장 (사각 이미지) | 원형 카테고리 아이콘 탭 → 탭하면 아래 상품 목록이 바뀜 |
| 헤더의 카테고리 메뉴 | 가운데 **상품 버튼**을 누르면 카테고리 버블이 부채꼴로 떠오름 (모션 사양은 Figma 노트) |
| 검색 모달 | 전체 화면 검색 |
| 결제 다이얼로그 | 하단에서 올라오는 결제 시트 |

### 이미지

상품 · 배너 · 카테고리 이미지 20장은 Figma MCP의 이미지 생성으로 만들고 `public/images/`에 저장했습니다. 상품 사진은 같은 프롬프트 틀(아침 햇살, 리넨 위 나무 도마, 크림 · 브라운 톤)로 톤을 통일했습니다.
카테고리 이미지는 배경 없는 PNG가 필요했는데, 이미지 생성 모델은 투명 배경을 출력하지 못합니다. 그래서 순수 파란색 크로마키 배경으로 생성한 뒤 로컬 스크립트로 파란색만 지웠습니다. AI 피사체 분리(macOS Vision)는 크림색 접시나 어두운 빵의 가장자리를 잘라내서 쓰지 않았습니다.

### Figma MCP 사용 메모

- Figma MCP는 Starter 플랜(View 시트)에서 월 20회 호출로 제한되며, 화면을 그리는 `use_figma`도 한도에 포함됩니다. 디자인 단계 도중 한도에 걸려 Professional 플랜 Full 시트(하루 200회)로 전환했습니다.
- 이미지 생성은 Figma AI 크레딧을 사용합니다 (기본 모델 기준 1장 6크레딧).

---

## 🛠 Core Stack

| 영역 | 기술 | 선택 이유 (요약) |
| --- | --- | --- |
| Framework | Next.js (App Router) | 별도 백엔드 서버 없이 화면과 API를 한 프로젝트에서 구현 |
| Language | TypeScript | 데이터 모델부터 UI까지 타입 안정성 확보 |
| ORM | Prisma | DB 스키마에서 생성된 타입을 애플리케이션 타입으로 그대로 사용 |
| Validation | Zod | Prisma 스키마에서 자동 생성한 Zod 스키마로 서버 입력값 검증 |
| Database | PostgreSQL | Prisma 최신 아키텍처(Prisma 8)가 우선 지원하는 DB |
| Server State | TanStack Query | 상품·주문 데이터의 캐싱과 변경 후 동기화 |
| Client State | Zustand | 장바구니 같은 단순한 전역 상태를 store 하나로 관리 |
| Styling | Tailwind CSS | 디자인을 빠르게 반영하고 수정할 수 있는 utility 방식 |
| UI Components | shadcn/ui | Tailwind 구조를 유지하면서 반복 UI 구현 시간 단축 |
| Testing | Jest | 마무리 단계의 테스트 코드 작성 |

각 기술의 선택 근거는 아래 [Technical Highlights](#-technical-highlights)에 정리했습니다.

---

## 🧠 Technical Highlights

이 프로젝트의 기술 선택 기준은 **8시간 안에 완성할 수 있는가**입니다. 그래서 설정과 중복 작업을 줄이는 쪽으로 선택했습니다.

### 1. 백엔드 서버 없는 풀스택 구조 — Next.js

상품, 장바구니, 주문을 다루려면 DB에 접근하는 API가 필요합니다. 하지만 별도 백엔드 서버를 두면 서버 구축과 배포에 시간이 더 듭니다.
Next.js는 Server Component와 Server Action으로 서버 로직을 같은 프로젝트에서 처리할 수 있어서 **하나의 코드베이스에서 쇼핑몰, 관리자 페이지, API를 함께 구현**합니다.

### 1-1. 데이터 흐름 — Server Component 조회 + Server Action 변경

| 작업 | 방식 |
| --- | --- |
| 조회 | Server Component에서 Prisma로 직접 조회 |
| 변경 (생성·수정·삭제) | Server Action (Next.js가 POST 엔드포인트를 자동 생성) |
| 입력 검증 | Server Action 안에서 Zod로 검증한 뒤 DB 반영 |

Route Handler로 REST API를 직접 정의하는 대신 Server Action을 사용합니다. 외부에 공개할 API가 없고, Server Action은 JSON을 거치지 않아 `Date` 같은 값이 Prisma 타입 그대로 전달되기 때문입니다.

DB 로직은 Server Action 안에 직접 쓰지 않고 `lib/services`의 함수로 분리합니다. 외부 API가 필요해지면 같은 함수를 Route Handler로 감싸기만 하면 됩니다.

```text
lib/services/*     ← Zod 검증 + Prisma 로직
  ├── Server Action   (현재 사용)
  └── Route Handler   (외부 API가 필요할 때 추가)
```

클라이언트 컴포넌트는 Prisma 타입을 `import type`으로만 가져와 Prisma 클라이언트가 브라우저 번들에 포함되지 않게 합니다.

### 1-2. 인증 없는 공개 관리자 페이지 보호

관리자 페이지는 포트폴리오 확인을 위해 누구나 볼 수 있게 공개합니다. 하지만 Server Action은 화면을 거치지 않고도 호출할 수 있는 공개 엔드포인트이므로, 화면에서 버튼을 숨기는 것만으로는 데이터를 보호할 수 없습니다.

| 위험 | 대응 |
| --- | --- |
| 방문자가 상품 · 주문 데이터를 임의로 변경 | 변경 Server Action마다 **서버에서** 환경 변수 `ADMIN_PASSWORD`와 입력 비밀번호를 비교한 뒤 실행 |
| 비회원 주문의 개인정보 노출 | 주문서에 실제 정보 입력 금지 안내, 관리자 조회 시 이름 · 연락처 · 주소를 **서버에서 마스킹한 뒤** 전달 |

마스킹은 화면 표시 단계가 아니라 서버의 조회 단계에서 처리합니다. 원본 값이 브라우저로 전달되지 않게 하기 위해서입니다.

### 2. DB 스키마를 타입의 기준으로 사용 — TypeScript + Prisma

데이터 타입을 직접 선언하면 DB 스키마와 TypeScript 타입을 따로 관리해야 하고, 둘 중 하나만 바뀌면 불일치가 생깁니다.
그래서 **Prisma 스키마를 데이터 구조의 단일 기준**으로 두고, Prisma가 생성한 모델 타입을 애플리케이션에서 그대로 사용합니다.

```ts
// 프론트엔드에서 interface Product를 따로 선언하지 않고, Prisma가 생성한 타입을 그대로 사용
import type { Product } from '@/generated/prisma/client';
```

```text
schema.prisma 수정 → Prisma 타입 재생성 → 해당 타입을 쓰는 코드에서 컴파일 에러로 변경 지점 확인
```

DB와 타입이 함께 갱신되기 때문에 별도의 타입 선언 파일을 관리할 필요가 없습니다.
단, `Decimal`은 Server Component에서 Client Component로 전달할 수 없어서, 원 단위 가격은 `Int`로 저장합니다.

### 2-1. 입력값 검증 — Zod (Prisma 스키마에서 자동 생성)

TypeScript 타입은 실행 시점에 사라지기 때문에, 주문서나 관리자 상품 등록처럼 **사용자가 보낸 값**은 서버에서 따로 검증해야 합니다.
Zod 스키마를 직접 작성하면 Prisma 스키마와 같은 정의를 두 번 관리하게 되므로, `prisma-zod-generator`로 **`schema.prisma`에서 Zod 스키마를 자동 생성**합니다. 검증 규칙도 `schema.prisma` 주석에 작성합니다.

```prisma
model Product {
  id    Int    @id @default(autoincrement())
  /// @zod.min(1)
  name  String
  /// @zod.positive()
  price Int
}
```

```text
schema.prisma 수정 → prisma generate → Prisma 타입 + Zod 스키마 동시 재생성
```

| 데이터 방향 | 담당 |
| --- | --- |
| DB → 화면 (조회 결과) | Prisma 생성 타입 |
| 사용자 → DB (폼 입력) | Prisma 스키마에서 생성된 Zod 스키마로 Server Action에서 검증 |

자동 생성된 스키마가 의도대로 검증하는지는 Jest 테스트로 확인합니다.

### 3. PostgreSQL 선택

Prisma 7은 PostgreSQL과 MySQL을 모두 지원합니다. 다만 차세대 버전인 Prisma 8은 PostgreSQL을 먼저 지원하며, Data Contract(`contract.d.ts`)를 기준으로 타입을 관리하는 구조를 제공합니다.
**Prisma의 최신 타입 시스템과 migration 구조로 넘어갈 수 있도록** PostgreSQL을 선택했습니다.

### 4. 서버 상태와 클라이언트 상태 분리 — TanStack Query + Zustand

| 구분 | 데이터 | 관리 도구 |
| --- | --- | --- |
| Server State | 상품, 주문, 주문 상태 | TanStack Query |
| Client State | 장바구니, 상품 옵션 선택, UI 상태 | Zustand |

- **TanStack Query**: 관리자가 상품이나 주문 상태를 변경하면 목록 화면에 바로 반영되어야 합니다. 캐싱, 재요청, mutation 이후 invalidation을 Query Layer에서 처리해서 컴포넌트가 동기화 로직을 직접 갖지 않게 합니다. Server Component에서 미리 조회한 데이터는 `HydrationBoundary`로 Query 캐시에 넘겨 첫 화면을 바로 표시합니다.
- **Zustand**: 클라이언트 상태는 단순한 전역 상태가 대부분입니다. Jotai처럼 atom 단위로 나누기보다 장바구니의 상태와 action(담기, 수량 변경, 삭제)을 **하나의 store로 묶는 편이 도메인을 이해하기 쉽다**고 판단했습니다. 보일러플레이트가 적고 `persist` middleware로 비회원 장바구니를 localStorage에 쉽게 유지할 수 있습니다.

### 5. Figma 디자인을 그대로 옮기는 UI 구조 — Tailwind CSS + shadcn/ui

디자인은 전적으로 Figma MCP 결과물을 따릅니다. 따라서 UI 도구는 **Figma 디자인과 충돌이 적어야 합니다**.

- **Tailwind CSS**: Figma의 색상, 간격, 타이포그래피를 utility class로 바로 옮길 수 있어 디자인 반영과 수정이 빠릅니다.
- **shadcn/ui**: 스타일이 정해진 패키지가 아니라 **Radix UI 기반 컴포넌트 코드를 프로젝트에 복사해 사용하는 방식**입니다. 접근성과 동작(Dialog의 포커스 관리, Select의 키보드 조작 등)은 headless primitive가 처리하고, 스타일은 Tailwind로 직접 수정할 수 있습니다. 그래서 Figma 디자인을 따르면서 Dialog·Select·Table 같은 반복 UI의 구현 시간을 줄이고 화면 간 통일성을 유지합니다.

### 6. 테스트 — Jest

마무리 단계에서 Jest로 테스트 코드를 작성합니다. 테스트 범위는 `[추가 정보 필요: 테스트 범위 확정 후 작성]`

---

## 🔄 주요 동작 흐름

### 제작 흐름

```text
프로젝트 설계 (README · 기능 범위 · 기술 스택 · 데이터 구조)
    ↓
레퍼런스 조사 (레퍼런스 디자인)
    ↓
Figma MCP로 쇼핑몰 디자인 생성
    ↓
디자인 기반 쇼핑몰 개발
    ↓
Figma MCP로 관리자 디자인 생성
    ↓
디자인 기반 관리자 개발
    ↓
마무리 (테스트 · 점검) → 목표 시간과 비교
```

### 비회원 주문 흐름

```text
상품 목록 → 상품 상세 → 장바구니 담기 (Zustand + persist)
    ↓
주문서 작성 (주문자 · 배송 정보)
    ↓
결제창 표시 (실제 결제 없음)
    ↓
Server Action: Zod 검증 → DB에서 상품 가격 재조회 → 주문 생성
    ↓
장바구니 비우기 → 주문 완료 → 관리자 페이지에서 주문 확인
```

장바구니는 브라우저에 저장되므로, 주문 금액은 클라이언트가 보낸 가격이 아니라 DB의 가격으로 계산합니다.

### 관리자 데이터 변경 흐름

```text
관리자 폼 입력
    ↓
useMutation → Server Action 호출
    ↓
Zod 검증 → Prisma로 DB 반영
    ↓
invalidateQueries → 목록 자동 갱신
```

---

## ⚙️ Getting Started

> 프로젝트 초기화 전입니다. 개발 환경이 구성되면 아래 내용을 갱신합니다.

### Requirements

- Node.js `[추가 정보 필요: 버전]`
- Docker (로컬 PostgreSQL 실행용, 기존 PostgreSQL 컨테이너에 이 프로젝트 전용 DB를 생성해 사용)

### Environment Variables

```dotenv
DATABASE_URL=
ADMIN_PASSWORD=
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 정보. 로컬과 배포 환경은 이 값만 바꿔서 구분합니다. |
| `ADMIN_PASSWORD` | 관리자 데이터 변경 시 확인하는 비밀번호. 서버에서만 읽으므로 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. |

### Installation & Development

`[추가 정보 필요: 패키지 매니저 및 package.json scripts]`

---

## 🚀 Deployment

- Hosting: Vercel
- 배포 환경의 DB 연결 정보는 Vercel 환경 변수 `DATABASE_URL`로 주입합니다.
