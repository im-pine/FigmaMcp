// Lighthouse CLI 반복 측정 — 화면 × 기기마다 N회, JSON 원본 저장
// pnpm perf:lighthouse --base <주소> [--out perf-results/<이름>] [--runs 5] [--pages all|home,products] [--devices mobile,desktop]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { args, baseHeaders, CHROME, orderAccessCookie, PAGES, ROOT } from "./lib.mjs";

const opt = args({
  out: `perf-results/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`,
  runs: "5",
  pages: "all",
  devices: "mobile,desktop",
});
const keys = opt.pages === "all" ? Object.keys(PAGES) : opt.pages.split(",");
const devices = opt.devices.split(",");
const outDir = path.resolve(ROOT, opt.out);
fs.mkdirSync(outDir, { recursive: true });
const lighthouse = path.join(ROOT, "node_modules/.bin/lighthouse");

// 예열: 한동안 요청이 없던 배포는 첫 요청만 크게 느리다(콜드 스타트). 기록하지 않는 요청을 2번씩 보낸다
const warm = { ...baseHeaders(opt.base), Cookie: "member_session=demo" };
for (const key of keys)
  for (let i = 0; i < 2; i++) await fetch(opt.base + PAGES[key], { headers: warm }).catch(() => {});

// 회차를 바깥 반복으로 돌려 같은 화면이 연달아 측정되지 않게 한다 (시간대 편차 분산)
for (let run = 1; run <= Number(opt.runs); run++) {
  for (const key of keys) {
    for (const device of devices) {
      const headers = { ...baseHeaders(opt.base) };
      const cookies = [];
      if (key === "orders" || key === "odetail") cookies.push("member_session=demo");
      if (key === "odetail") cookies.push(await orderAccessCookie(opt.base));
      if (cookies.length) headers.Cookie = cookies.filter(Boolean).join("; ");

      const out = path.join(outDir, `${key}-${device}-${run}.json`);
      const cli = [
        opt.base + PAGES[key],
        "--only-categories=performance",
        "--output=json",
        `--output-path=${out}`,
        "--quiet",
        "--chrome-flags=--headless=new",
        `--extra-headers=${JSON.stringify(headers)}`,
      ];
      if (device === "desktop") cli.push("--preset=desktop");
      try {
        execFileSync(lighthouse, cli, { stdio: "ignore", env: { ...process.env, CHROME_PATH: CHROME } });
        const report = JSON.parse(fs.readFileSync(out, "utf8"));
        const a = report.audits;
        console.log(
          `${key} ${device} #${run} score=${Math.round(report.categories.performance.score * 100)}` +
            ` lcp=${Math.round(a["largest-contentful-paint"].numericValue)}` +
            ` cls=${a["cumulative-layout-shift"].numericValue.toFixed(3)}`,
        );
      } catch (error) {
        console.log(`${key} ${device} #${run} FAILED ${String(error.message).split("\n")[0]}`);
      }
    }
  }
}
console.log(
  `\n저장: ${path.relative(ROOT, outDir)} → pnpm perf:summary --dir ${path.relative(ROOT, outDir)}`,
);
