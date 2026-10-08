import type { ProductSort } from "@/server/services/product";

export type SortValue = ProductSort;

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
];

/** ?sort= 값을 검증한다. 모르는 값은 기본(인기순) */
export function sortFromParam(param: string | string[] | undefined): SortValue {
  return param === "latest" ? "latest" : "popular";
}
