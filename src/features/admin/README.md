# features/admin — 관리자 전용

도메인별 폴더(`layout/`, `product/`, `order/`, `auth/`)에 화면 컴포넌트 · 훅 · Server Action을 둔다.

- `features/shop`은 import할 수 없다 (ESLint로 차단). 양쪽에서 쓰면 `shared/`로 옮긴다.
- 데이터를 바꾸는 Server Action은 실행 전에 `@/server/auth/admin-password`로 비밀번호를 확인한다.
