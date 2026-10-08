"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/shared/ui/Chip";
import { SearchBar } from "@/shared/ui/SearchBar";

/*
 * 검색 입력 + 추천 검색어 (Figma: Search Modal 7:314 · Mobile Search 17:1758)
 * 검색하면 상품 목록(/products?q=…)으로 이동해 결과를 필터링한다.
 */
const SUGGESTED_KEYWORDS = ["크루아상", "소금빵", "케이크", "쿠키", "밀크티"];

type SearchPanelProps = {
  /** 이동 직후 호출 (모달 닫기) */
  onNavigate?: () => void;
  hint: string;
  autoFocus?: boolean;
};

export function SearchPanel({ onNavigate, hint, autoFocus }: SearchPanelProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const search = (keyword: string) => {
    const q = keyword.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search(value);
        }}
      >
        <SearchBar
          name="q"
          aria-label="상품 검색"
          placeholder="상품명을 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={50}
          autoFocus={autoFocus}
          enterKeyHint="search"
        />
      </form>

      <p className="mt-8 type-label tracking-[0.2em] text-caption">추천 검색어</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_KEYWORDS.map((k) => (
          <Chip key={k} onClick={() => search(k)}>
            {k}
          </Chip>
        ))}
      </div>

      <p className="mt-8 rounded-input bg-section px-4 py-3 type-body-sm text-body">{hint}</p>
    </div>
  );
}
