// 성능 측정 스크립트 공통: 측정 화면 목록, 배포 보호 우회 헤더, 주문 상세 접근 쿠키
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** 데모 회원의 주문 — 시드 데이터에 있는 주문번호 */
export const DEMO_ORDER = "20261009-0010";

export const PAGES = {
  home: "/",
  products: "/products",
  detail: "/products/salt-bread",
  orders: "/mypage/orders",
  odetail: `/mypage/orders/${DEMO_ORDER}`,
  aproducts: "/admin/products",
  aorders: "/admin/orders",
  aodetail: `/admin/orders/${DEMO_ORDER}`,
};

/** 환경 변수 또는 저장소 .env에서 읽는다 (값은 출력하지 않는다) */
function env(name) {
  if (process.env[name]) return process.env[name];
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return "";
  const line = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${name}=`));
  return line
    ? line
        .slice(name.length + 1)
        .trim()
        .replace(/^["']|["']$/g, "")
    : "";
}

/** Vercel 미리보기 · dev 배포는 배포 보호가 있어 Protection Bypass for Automation 헤더가 필요하다 */
export function baseHeaders(base) {
  const secret = base.includes(".vercel.app") ? env("VERCEL_AUTOMATION_BYPASS_SECRET") : "";
  return secret ? { "x-vercel-protection-bypass": secret } : {};
}

export function launch() {
  return puppeteer.launch({ executablePath: CHROME, headless: true });
}

/** 주문 상세 접근 쿠키(order_access, 10분)를 실제 '상세 보기' 클릭으로 받아온다 */
export async function orderAccessCookie(base) {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(baseHeaders(base));
    await page.setCookie({ name: "member_session", value: "demo", url: base });
    await page.goto(base + "/mypage/orders", { waitUntil: "networkidle0" });
    await page.evaluate((no) => {
      const input = [...document.querySelectorAll("article input[name=orderNo]")].find((x) => x.value === no);
      input.closest("form").querySelector("button").click();
    }, DEMO_ORDER);
    await page.waitForFunction((no) => location.pathname.includes(no), { timeout: 30000 }, DEMO_ORDER);
    const cookie = (await page.cookies()).find((c) => c.name === "order_access");
    return cookie ? `order_access=${cookie.value}` : "";
  } finally {
    await browser.close();
  }
}

export const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** --key value 형태의 인자 */
export function args(defaults) {
  const out = { ...defaults };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) out[argv[i].replace(/^--/, "")] = argv[i + 1];
  if (!out.base) {
    console.error("사용법: --base <배포 주소> (예: https://bakery.im-pine.com)");
    process.exit(1);
  }
  out.base = out.base.replace(/\/$/, "");
  return out;
}
