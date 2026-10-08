/** 원 단위 가격 표시: 4500 → "4,500원" */
export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
