import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * 텍스트 스타일 유틸(type-h3 · type-title …, globals.css @utility)은 tailwind-merge가 모르는 클래스라
 * 기본값과 겹쳐도 하나로 합쳐지지 않는다. 한 그룹으로 알려 줘서 나중에 준 type-*가 기본값을 대신하게 한다.
 */
const twMerge = extendTailwindMerge<"type-style">({
  extend: {
    classGroups: {
      "type-style": [
        {
          type: [
            "display",
            "h1",
            "h2",
            "h3",
            "title",
            "body-lg",
            "body-md",
            "body-sm",
            "label",
            "button",
            "price",
          ],
        },
      ],
    },
  },
});

/** Tailwind 클래스 병합 (shadcn/ui 공용 유틸) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
