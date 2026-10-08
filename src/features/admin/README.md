# features/admin — 관리자 전용

도메인별 폴더에 화면 컴포넌트 · 훅 · Server Action을 둔다.

| 폴더 | 내용 |
| --- | --- |
| `layout/` | 사이드바 · 헤더(데스크톱), 로고 헤더 · 하단 탭 바(모바일) |
| `common/` | StatusBadge · CategoryBadge · Checkbox · PasswordConfirm(데스크톱 Dialog / 모바일 시트) · BottomSheet · `useIsDesktop` · `AdminActionResult` |
| `product/` | 상품 목록 · 등록 · 수정 · 삭제 |
| `order/` | 주문 목록 · 상세 · 상태 변경 · 일괄 상태 변경 |

- `features/shop`은 import할 수 없다 (ESLint로 차단). 양쪽에서 쓰면 `shared/`로 옮긴다.
- 데이터를 바꾸는 Server Action은 실행 전에 `verifyAdminPassword()`(`@/server/auth/admin-password`)로 비밀번호를 확인하고, 결과는 `AdminActionResult`로 돌려준다.
- 데스크톱(lg 이상)과 모바일은 구조가 다르다 (Figma Admin 페이지: 데스크톱 y=0, 모바일 y=1500). 같은 컴포넌트를 CSS로 줄이지 말고 `lg:` 분기나 `useIsDesktop()`으로 나눈다.
