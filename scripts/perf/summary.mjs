// Lighthouse 결과 폴더 → 화면 · 기기별 중앙값과 범위 (markdown 표)
// pnpm perf:summary --dir perf-results/<이름>
import fs from "node:fs";
import path from "node:path";
import { median, ROOT } from "./lib.mjs";

const i = process.argv.indexOf("--dir");
if (i < 0) {
  console.error("사용법: --dir <결과 폴더>");
  process.exit(1);
}
const dir = path.resolve(ROOT, process.argv[i + 1]);

const groups = {};
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const [key, device] = file.split("-");
  const report = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const a = report.audits;
  const requests = a["network-requests"].details.items;
  (groups[`${key}|${device}`] ??= []).push({
    score: Math.round(report.categories.performance.score * 100),
    fcp: a["first-contentful-paint"].numericValue,
    lcp: a["largest-contentful-paint"].numericValue,
    // 감속 없이 실제로 관찰한 LCP — 서버 · DB 쪽 개선은 모의 감속 LCP보다 이 값에 잘 보인다
    observedLcp: a.metrics.details.items[0].observedLargestContentfulPaint,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    kb: a["total-byte-weight"].numericValue / 1024,
    fontKb:
      requests.filter((r) => r.resourceType === "Font").reduce((sum, r) => sum + r.transferSize, 0) / 1024,
  });
}

const sec = (ms) => `${(ms / 1000).toFixed(2)}s`;
const range = (rows, k, f) =>
  `${f(Math.min(...rows.map((r) => r[k])))}–${f(Math.max(...rows.map((r) => r[k])))}`;
console.log("| 화면 | 기기 | n | 점수 (범위) | FCP | LCP (범위) | 실측 LCP | TBT | CLS | 전송량 | 폰트 |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|");
for (const [group, rows] of Object.entries(groups).sort()) {
  const [key, device] = group.split("|");
  const m = (k) => median(rows.map((r) => r[k]));
  console.log(
    `| ${key} | ${device} | ${rows.length} | ${m("score")} (${range(rows, "score", String)}) | ${sec(m("fcp"))}` +
      ` | ${sec(m("lcp"))} (${range(rows, "lcp", sec)}) | ${Math.round(m("observedLcp"))}ms | ${Math.round(m("tbt"))}ms` +
      ` | ${m("cls").toFixed(3)} | ${Math.round(m("kb"))}KB | ${Math.round(m("fontKb"))}KB |`,
  );
}
