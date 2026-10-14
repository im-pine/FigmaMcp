// DB 조회 비용 측정 — 주문 상세를 접근 쿠키 없이(DB 조회 안 함) / 있게(주문 1건 조회) 번갈아 요청해 전체 응답 시간을 비교
// 서버 함수와 DB가 다른 지역이면 차이가 왕복 시간만큼 커진다 (같은 지역이면 수 ms)
// pnpm perf:db --base <주소> [--runs 10]
import { args, baseHeaders, DEMO_ORDER, median, orderAccessCookie } from "./lib.mjs";

const opt = args({ runs: "10" });
const url = `${opt.base}/mypage/orders/${DEMO_ORDER}`;
const access = await orderAccessCookie(opt.base);

async function total(cookie) {
  const start = performance.now();
  const res = await fetch(url, { headers: { ...baseHeaders(opt.base), Cookie: cookie }, cache: "no-store" });
  const body = await res.text(); // 스트리밍이 끝날 때까지
  return { ms: performance.now() - start, rendered: body.includes("받는 분") };
}

// 예열: 식어 있던 배포의 첫 요청은 크게 느리므로(콜드 스타트) 기록하지 않는 요청을 먼저 보낸다
for (let i = 0; i < 2; i++) {
  await total("member_session=demo");
  await total(`member_session=demo; ${access}`);
}

const withoutDb = [];
const withDb = [];
for (let i = 0; i < Number(opt.runs); i++) {
  const a = await total("member_session=demo");
  const b = await total(`member_session=demo; ${access}`);
  if (i === 0 && !b.rendered) console.warn("경고: 쿠키가 있는 요청에서 주문 상세가 그려지지 않았습니다");
  withoutDb.push(a.ms);
  withDb.push(b.ms);
}
const round = (values) => values.map(Math.round).join(", ");
console.log(`DB 조회 없음 중앙값 ${Math.round(median(withoutDb))}ms (${round(withoutDb)})`);
console.log(`DB 조회 있음 중앙값 ${Math.round(median(withDb))}ms (${round(withDb)})`);
console.log(`DB 조회 비용 ${Math.round(median(withDb) - median(withoutDb))}ms`);
