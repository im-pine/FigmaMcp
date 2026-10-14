// 클릭 흐름 측정 (Lighthouse가 재지 못하는 화면 이동) — 데스크톱 1440×900, 감속 없음
// pnpm perf:flow --base <주소> [--runs 5]
import { args, baseHeaders, launch, median } from "./lib.mjs";

const opt = args({ runs: "5" });

async function timed(page, action, until) {
  const start = Date.now();
  await action();
  await page.waitForFunction(until, { timeout: 30000, polling: 20 });
  return Date.now() - start;
}

const result = { login: [], reload: [], filter: [], detail: [], productCard: [] };
for (let run = 0; run < Number(opt.runs); run++) {
  const browser = await launch();
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders(baseHeaders(opt.base));
  await page.setViewport({ width: 1440, height: 900 });
  const hasOrders = () =>
    location.pathname === "/mypage/orders" && document.querySelectorAll("ul li article h2").length > 0;

  // 마이페이지 → 임시 로그인 → 주문 목록
  await page.goto(opt.base + "/mypage", { waitUntil: "networkidle0" });
  result.login.push(
    await timed(
      page,
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll("button")].find((b) => b.textContent.includes("임시 로그인")).click(),
        ),
      hasOrders,
    ),
  );
  await page.waitForNetworkIdle({ idleTime: 300 });

  // 주문 내역 새로고침
  result.reload.push(
    await timed(
      page,
      () => page.goto(opt.base + "/mypage/orders", { waitUntil: "domcontentloaded" }),
      hasOrders,
    ),
  );
  await page.waitForNetworkIdle({ idleTime: 300 });

  // 상태 필터 클릭
  result.filter.push(
    await timed(
      page,
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll("button, a")]
            .filter((e) => /배송|완료|준비|결제/.test(e.textContent) && !e.closest("article"))[0]
            .click(),
        ),
      () => location.search.includes("status") && !document.querySelector('[aria-busy="true"]'),
    ),
  );

  // 주문 '상세 보기' → 주문 상세 (서버 액션 → 이동 → 상세 렌더)
  await page.goto(opt.base + "/mypage/orders", { waitUntil: "networkidle0" });
  result.detail.push(
    await timed(
      page,
      () => page.evaluate(() => document.querySelector("article form button[type=submit]").click()),
      () =>
        /^\/mypage\/orders\/.+/.test(location.pathname) &&
        document.querySelector("h1") &&
        !document.querySelector('[aria-busy="true"]'),
    ),
  );

  // 상품 목록 → 상품 카드 → 상세 제목
  await page.goto(opt.base + "/products", { waitUntil: "networkidle0" });
  result.productCard.push(
    await timed(
      page,
      () => page.evaluate(() => document.querySelector('main a[href^="/products/"]').click()),
      () => /^\/products\/.+/.test(location.pathname) && document.querySelector("main h1"),
    ),
  );

  await browser.close();
}
for (const [name, values] of Object.entries(result))
  console.log(name.padEnd(12), `중앙값 ${median(values)}ms`, `(${values.join(", ")})`);
