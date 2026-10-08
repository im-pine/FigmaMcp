import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * 영역 경계 규칙 — 공통(shared) · 쇼핑몰(features/shop) · 관리자(features/admin) · 서버(server)
 *   features/shop  ↛ features/admin
 *   features/admin ↛ features/shop
 *   shared         ↛ features, server
 * 병렬 세션이 서로의 영역에 의존하지 않도록 lint 단계에서 막는다.
 */
const restrict = (patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/features/shop/**"],
    rules: restrict([
      {
        group: ["@/features/admin/*", "@/features/admin"],
        message: "쇼핑몰 영역에서 관리자 영역을 import할 수 없습니다. 공통이면 shared로 옮기세요.",
      },
    ]),
  },
  {
    files: ["src/features/admin/**"],
    rules: restrict([
      {
        group: ["@/features/shop/*", "@/features/shop"],
        message: "관리자 영역에서 쇼핑몰 영역을 import할 수 없습니다. 공통이면 shared로 옮기세요.",
      },
    ]),
  },
  {
    files: ["src/shared/**"],
    rules: restrict([
      { group: ["@/features/*", "@/features"], message: "shared는 features에 의존할 수 없습니다." },
      { group: ["@/server/*", "@/server"], message: "shared는 server에 의존할 수 없습니다." },
    ]),
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"]),
]);

export default eslintConfig;
