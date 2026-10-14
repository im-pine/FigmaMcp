// 상품 이미지 저해상도(썸네일) 만들기 — pnpm images:thumbnails
//
// 같은 이미지를 고해상도(원본)와 저해상도(<이름>_thumbnail)로 함께 둔다.
// 목록(상품 카드 · 장바구니 · 주문 · 관리자 목록)은 저해상도, 상품 상세의 큰 사진은 고해상도를 쓴다.
// 사용자가 이미지를 올리는 서비스라면 저장할 때 서버에서 이 두 장을 함께 만든다 (이 프로젝트는 관리자가 정해진 이미지 중에서 고르므로 미리 만들어 커밋).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(import.meta.dirname, "../../public/images/products");
// 목록에서 가장 크게 보이는 상품 카드(데스크톱 300px)를 레티나(2배)에서도 선명하게
const WIDTH = 640;

let made = 0;
for (const file of fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f) && !/_thumbnail\./.test(f))) {
  const { name, ext } = path.parse(file);
  const src = path.join(DIR, file);
  const out = path.join(DIR, `${name}_thumbnail${ext}`);
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
  await sharp(src).resize(WIDTH).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  console.log(`${file} (${kb(src)}KB) → ${name}_thumbnail${ext} (${kb(out)}KB, ${WIDTH}px)`);
  made++;
}
console.log(`썸네일 ${made}개 만듦`);
