/**
 * 상품 이미지의 저해상도(썸네일) 경로 — /images/products/salt-bread.jpg → /images/products/salt-bread_thumbnail.jpg
 * 목록(카드 · 장바구니 · 주문 · 관리자 목록)은 저해상도, 상품 상세의 큰 사진은 원본(고해상도)을 쓴다.
 * DB에는 원본 경로만 저장하고 썸네일은 이 이름 규칙으로 찾는다 (scripts/images/make-thumbnails.mjs가 만든다).
 */
export function thumbnailOf(imagePath: string) {
  return imagePath.replace(/(\.[a-z]+)$/i, "_thumbnail$1");
}
