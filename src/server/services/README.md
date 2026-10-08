# server/services — 데이터 로직 (쇼핑몰 · 관리자 공용)

- 파일 맨 위에 `import "server-only"`를 둔다.
- 입력은 `unknown`으로 받아 Zod(`@/generated/zod`)로 검증한 뒤 Prisma(`@/server/db`)로 처리한다.
- Server Action(`features/*/.../actions.ts`)이 이 함수를 호출한다. 외부 API가 필요해지면 같은 함수를 Route Handler로 감싼다.
