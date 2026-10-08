import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Figma 상품 목록과 같은 12종. 이미지는 public/images/products/{slug}.jpg
const items = [
  {
    slug: "butter-croissant",
    name: "버터 크루아상",
    nameEn: "Butter Croissant",
    price: 4500,
    category: "BREAD",
    isBest: true,
    description:
      "프랑스산 발효 버터를 27겹으로 접어 구운 크루아상입니다. 겉은 바삭하고 속은 촉촉한 결을 살렸습니다.",
    ingredients: "밀가루(프랑스산), 발효 버터, 우유, 설탕, 효모, 소금",
    storageGuide: "당일 섭취 권장 · 실온 보관 후 오븐에 3분 데워 드세요",
    allergens: "밀, 우유",
  },
  {
    slug: "campagne",
    name: "캄파뉴",
    nameEn: "Pain de Campagne",
    price: 7800,
    category: "BREAD",
    isBest: true,
    description: "천연 발효종으로 하룻밤 저온 숙성한 시골빵입니다. 구수하고 쫄깃한 속살이 특징입니다.",
    ingredients: "밀가루, 호밀가루, 천연 발효종, 소금",
    storageGuide: "실온 2일 · 냉동 보관 시 2주",
    allergens: "밀",
  },
  {
    slug: "salt-bread",
    name: "소금빵",
    nameEn: "Salt Bread",
    price: 3500,
    category: "BREAD",
    description: "버터를 품고 구워 바닥은 바삭하고 위에는 굵은 소금을 올린 소금빵입니다.",
    ingredients: "밀가루, 버터, 우유, 설탕, 효모, 천일염",
    storageGuide: "당일 섭취 권장",
    allergens: "밀, 우유",
  },
  {
    slug: "baguette",
    name: "바게트",
    nameEn: "Baguette",
    price: 4800,
    category: "BREAD",
    description: "겉은 단단하고 속은 가벼운 정통 바게트입니다.",
    ingredients: "밀가루, 효모, 소금, 물",
    storageGuide: "당일 섭취 권장 · 남으면 냉동 보관",
    allergens: "밀",
  },
  {
    slug: "strawberry-cake",
    name: "딸기 생크림 케이크",
    nameEn: "Strawberry Cream Cake",
    price: 32000,
    category: "CAKE",
    description: "부드러운 시트에 생크림과 제철 딸기를 듬뿍 올린 케이크입니다.",
    ingredients: "생크림, 딸기, 밀가루, 달걀, 설탕, 우유",
    storageGuide: "냉장 보관 · 당일 섭취 권장",
    allergens: "밀, 우유, 달걀",
  },
  {
    slug: "basque-cheesecake",
    name: "바스크 치즈케이크",
    nameEn: "Basque Cheesecake",
    price: 6500,
    category: "CAKE",
    description: "겉은 진하게 그을리고 속은 크리미한 바스크 치즈케이크입니다.",
    ingredients: "크림치즈, 생크림, 달걀, 설탕, 밀가루",
    storageGuide: "냉장 3일",
    allergens: "밀, 우유, 달걀",
  },
  {
    slug: "chocolate-brownie",
    name: "초코 브라우니",
    nameEn: "Chocolate Brownie",
    price: 5200,
    category: "CAKE",
    isBest: true,
    description: "다크 초콜릿을 듬뿍 넣어 꾸덕하게 구운 브라우니입니다.",
    ingredients: "다크 초콜릿, 버터, 설탕, 달걀, 밀가루",
    storageGuide: "실온 2일 · 냉장 5일",
    allergens: "밀, 우유, 달걀, 대두",
  },
  {
    slug: "chocolate-chip-cookie",
    name: "초코칩 쿠키",
    nameEn: "Chocolate Chip Cookie",
    price: 3200,
    category: "COOKIE",
    description: "겉은 바삭하고 속은 쫀득한 두툼한 초코칩 쿠키입니다.",
    ingredients: "밀가루, 버터, 흑설탕, 초콜릿, 달걀",
    storageGuide: "실온 5일",
    allergens: "밀, 우유, 달걀, 대두",
  },
  {
    slug: "earl-grey-scone",
    name: "얼그레이 스콘",
    nameEn: "Earl Grey Scone",
    price: 3900,
    category: "COOKIE",
    isBest: true,
    description: "얼그레이 찻잎을 넣어 은은한 향이 나는 스콘입니다.",
    ingredients: "밀가루, 버터, 우유, 얼그레이 찻잎, 설탕",
    storageGuide: "실온 2일 · 데워 드시면 더 맛있습니다",
    allergens: "밀, 우유",
  },
  {
    slug: "butter-cookie",
    name: "버터 쿠키",
    nameEn: "Butter Cookie",
    price: 2800,
    category: "COOKIE",
    description: "버터 향이 진한 바삭한 짤주머니 쿠키입니다.",
    ingredients: "밀가루, 버터, 설탕, 달걀",
    storageGuide: "실온 7일",
    allergens: "밀, 우유, 달걀",
  },
  {
    slug: "americano",
    name: "아메리카노",
    nameEn: "Americano",
    price: 4000,
    category: "BEVERAGE",
    description: "빵과 잘 어울리는 고소한 블렌드 원두의 아메리카노입니다.",
    ingredients: "원두, 물",
    storageGuide: "제조 후 바로 드세요",
    allergens: "없음",
  },
  {
    slug: "royal-milk-tea",
    name: "로열 밀크티",
    nameEn: "Royal Milk Tea",
    price: 5500,
    category: "BEVERAGE",
    description: "홍차를 우유에 진하게 우려낸 로열 밀크티입니다.",
    ingredients: "홍차, 우유, 설탕",
    storageGuide: "제조 후 바로 드세요",
    allergens: "우유",
  },
] satisfies Omit<Prisma.ProductCreateInput, "imagePath">[];

const products: Prisma.ProductCreateInput[] = items.map((p) => ({
  ...p,
  imagePath: `/images/products/${p.slug}.jpg`,
}));

async function main() {
  for (const product of products) {
    await db.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  }
  console.log(`seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
