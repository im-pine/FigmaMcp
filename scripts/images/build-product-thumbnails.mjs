// 상품 이미지 썸네일 미리 만들기 — pnpm install(postinstall)에서 실행
//
// 상품 이미지는 관리자가 정해진 12장 중에서 고르므로(업로드 없음) 크기별 파일을 미리 만들 수 있다.
// 요청 때 변환(/_next/image)하면 캐시가 없을 때 장당 약 1.1초 걸리므로, 정적 파일로 CDN에서 바로 준다.
// - public/images/products/thumbs/<이름>-<폭>.webp
// - src/generated/product-images.json  { "<원본 경로>": { widths, lqip } }  — 크기 목록과 흐린 미리보기 클래스 이름
// - src/generated/product-images.css   흐린 미리보기: 3×3으로 줄인 색을 그라데이션으로 (HTML이 아니라 CSS에 둔다 — 아래 설명)
// 원본보다 새 썸네일이 있으면 다시 만들지 않는다.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC_DIR = path.join(ROOT, "public/images/products");
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const MANIFEST = path.join(ROOT, "src/generated/product-images.json");
const LQIP_CSS = path.join(ROOT, "src/generated/product-images.css");

// 화면에서 쓰는 크기: 장바구니 · 관리자 목록(52–96px) → 128 · 256, 상품 카드(모바일 50vw · 데스크톱 300px) → 384 · 640,
// 상세 큰 사진(모바일 100vw · 데스크톱 640px) → 750 · 828 · 1024. 원본(1024)보다 크게는 만들지 않는다
// (750은 next/image 기본 크기 목록에도 있다 — 빼면 모바일 상세가 한 단계 큰 828을 받아 LCP가 늦어졌다)
const WIDTHS = [128, 256, 384, 640, 750, 828, 1024];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const manifest = {};
const cssRules = [];
let made = 0;
const started = Date.now();
for (const file of fs
  .readdirSync(SRC_DIR)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort()) {
  const src = path.join(SRC_DIR, file);
  const name = path.parse(file).name;
  const srcTime = fs.statSync(src).mtimeMs;
  const { width: original } = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w <= original);

  for (const w of widths) {
    const out = path.join(OUT_DIR, `${name}-${w}.webp`);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
    await sharp(src).resize(w).webp({ quality: 75 }).toFile(out);
    made++;
  }

  // 흐린 미리보기: 3×3으로 줄인 색을 세로 그라데이션 세 줄로 그린다.
  // - 작은 이미지(data URL)로 넣으면 Lighthouse가 이미지마다 요청으로 세어 LCP 계산이 늦어졌다
  // - 색을 HTML(style)에 넣으면 문서가 TCP 첫 전송 한도(약 14KB) 근처를 넘어 왕복이 한 번 늘었다 → CSS 파일에 둔다
  const { data } = await sharp(src)
    .resize(3, 3, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const colors = [];
  for (let i = 0; i < data.length; i += 3)
    colors.push(
      `#${[data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
    );
  const lqip = `product-lqip-${name}`;
  const column = (i) => `linear-gradient(${colors[i]},${colors[i + 3]},${colors[i + 6]})`;
  cssRules.push(`.${lqip}{background-image:${column(0)},${column(1)},${column(2)}}`);
  manifest[`/images/products/${file}`] = { widths, lqip };
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(
  LQIP_CSS,
  "/* 자동 생성: scripts/images/build-product-thumbnails.mjs */\n" +
    ".product-lqip{background-size:33.4% 100%;background-position:0 0,50% 0,100% 0;background-repeat:no-repeat}\n" +
    cssRules.join("\n") +
    "\n",
);
console.log(
  `상품 썸네일: ${Object.keys(manifest).length}장 × ${WIDTHS.length}크기 · 새로 만든 파일 ${made}개 (${Date.now() - started}ms)`,
);
