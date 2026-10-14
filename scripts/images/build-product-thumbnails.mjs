// 상품 이미지 썸네일 미리 만들기 — pnpm install(postinstall)에서 실행
//
// 상품 이미지는 관리자가 정해진 12장 중에서 고르므로(업로드 없음) 크기별 파일을 미리 만들 수 있다.
// 요청 때 변환(/_next/image)하면 캐시가 없을 때 장당 약 1.1초 걸리므로, 정적 파일로 CDN에서 바로 준다.
// - public/images/products/thumbs/<이름>-<폭>.avif · .webp  (AVIF가 WebP보다 약 38% 작다, WebP는 미지원 브라우저용)
// - src/generated/product-images.json  { "<원본 경로>": { widths, blur } }  — blur는 16px 흐린 미리보기(data URL)
// 원본보다 새 썸네일이 있으면 다시 만들지 않는다.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC_DIR = path.join(ROOT, "public/images/products");
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const MANIFEST = path.join(ROOT, "src/generated/product-images.json");

// 화면에서 쓰는 크기: 장바구니 · 관리자 목록(52–96px) → 128 · 256, 상품 카드(모바일 50vw · 데스크톱 300px) → 384 · 640,
// 상세 큰 사진(모바일 100vw · 데스크톱 640px) → 828 · 1024. 원본(1024)보다 크게는 만들지 않는다
const WIDTHS = [128, 256, 384, 640, 828, 1024];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const manifest = {};
let made = 0;
const started = Date.now();
for (const file of fs.readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const src = path.join(SRC_DIR, file);
  const name = path.parse(file).name;
  const srcTime = fs.statSync(src).mtimeMs;
  const { width: original } = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w <= original);

  for (const w of widths) {
    for (const [ext, encode] of [
      ["avif", (s) => s.avif({ quality: 50 })],
      ["webp", (s) => s.webp({ quality: 75 })],
    ]) {
      const out = path.join(OUT_DIR, `${name}-${w}.${ext}`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
      await encode(sharp(src).resize(w)).toFile(out);
      made++;
    }
  }

  const blur = await sharp(src).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[`/images/products/${file}`] = {
    widths,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `상품 썸네일: ${Object.keys(manifest).length}장 × ${WIDTHS.length}크기 · 새로 만든 파일 ${made}개 (${Date.now() - started}ms)`,
);
