import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 클래스 병합 (shadcn/ui 공용 유틸) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
