import { CATEGORIES } from "@/shared/constants/catalog";

/** 헤더 · 푸터 · 버블 메뉴에서 쓰는 카테고리 링크 (All 포함) */
export const CATEGORY_LINKS = [
  { label: "All", slug: "all", href: "/products" },
  ...CATEGORIES.map((c) => ({ label: c.label, slug: c.slug, href: `/products?category=${c.slug}` })),
];

export const SHOP_INFO = {
  name: "Pine Bakery",
  tagline: "BAKERY & DESSERT",
  description: "매일 아침 직접 굽는 빵과 디저트를 전합니다.",
  address: "서울시 성동구 베이커리로 12",
  phone: "02-000-0000",
  email: "hello@pinebakery.kr",
  copyright: "© 2026 Pine Bakery. 포트폴리오용 데모 사이트입니다.",
};

export const CUSTOMER_CARE = ["주문 안내", "배송 안내", "자주 묻는 질문"];
