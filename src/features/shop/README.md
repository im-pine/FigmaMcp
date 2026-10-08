# features/shop — 쇼핑몰 전용

도메인별 폴더(`layout/`, `home/`, `product/`, `search/`, `cart/`, `checkout/`, `mypage/`)에 화면 컴포넌트 · 훅 · Server Action을 둔다.

- `features/admin`은 import할 수 없다 (ESLint로 차단). 양쪽에서 쓰면 `shared/`로 옮긴다.
- DB 접근은 `actions.ts`('use server') → `@/server/services/*`를 통해서만 한다.
