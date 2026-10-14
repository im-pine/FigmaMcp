// 상품 이미지 썸네일 미리 만들기 — pnpm install(postinstall)에서 실행
//
// 상품 이미지는 관리자가 정해진 12장 중에서 고르므로(업로드 없음) 크기별 파일을 미리 만들 수 있다.
// 요청 때 변환(/_next/image)하면 캐시가 없을 때 장당 약 1.1초 걸리므로, 정적 파일로 CDN에서 바로 준다.
// - public/images/products/thumbs/<이름>-<폭>.webp
// - src/generated/product-images.json  { "<원본 경로>": { widths, colors } }  — colors는 흐린 미리보기용 3×3 색(CSS 그라데이션으로 그림)
// 원본보다 새 썸네일이 있으면 다시 만들지 않는다.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC_DIR = path.join(ROOT, "public/images/products");
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const MANIFEST = path.join(ROOT, "src/generated/product-images.json");

// 화면에서 쓰는 크기: 장바구니 · 관리자 목록(52–96px) → 128 · 256, 상품 카드(모바일 50vw · 데스크톱 300px) → 384 · 640,
// 상세 큰 사진(모바일 100vw · 데스크톱 640px) → 750 · 828 · 1024. 원본(1024)보다 크게는 만들지 않는다
// (750은 next/image 기본 크기 목록에도 있다 — 빼면 모바일 상세가 한 단계 큰 828을 받아 LCP가 늦어졌다)
const WIDTHS = [128, 256, 384, 640, 750, 828, 1024];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const manifest = {};
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

  // 흐린 미리보기: 3×3으로 줄인 색. 이미지(data URL)로 넣으면 Lighthouse가 요청으로 세어 LCP 계산이 늦어져 CSS로 그린다
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
  manifest[`/images/products/${file}`] = { widths, colors };
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `상품 썸네일: ${Object.keys(manifest).length}장 × ${WIDTHS.length}크기 · 새로 만든 파일 ${made}개 (${Date.now() - started}ms)`,
);
