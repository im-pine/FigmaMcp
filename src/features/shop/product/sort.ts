import type { ProductSort } from "@/shared/constants/catalog";

export type SortValue = ProductSort;

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
];

/** ?sort= 값을 검증한다. 모르는 값은 기본(인기순) */
export function sortFromParam(param: string | string[] | undefined): SortValue {
  return param === "latest" ? "latest" : "popular";
}
