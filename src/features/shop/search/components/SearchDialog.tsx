"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Dialog, DialogOverlay, DialogPortal, DialogTrigger } from "@/shared/ui/dialog";
import { SearchPanel } from "./SearchPanel";

/** 데스크톱 헤더의 검색 아이콘 → 검색 모달 (Figma: Search Modal 7:314) */
export function SearchDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger aria-label="검색">
        <Search className="size-6" strokeWidth={1.5} />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-inverse/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-[120px] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[760px] -translate-x-1/2 rounded-card bg-page p-12 shadow-card outline-none"
        >
          <div className="mb-8 flex items-center justify-between">
            <DialogPrimitive.Title className="type-h3 text-heading">무엇을 찾으세요?</DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="닫기" className="text-heading hover:text-caption">
              <X className="size-6" strokeWidth={1.5} />
            </DialogPrimitive.Close>
          </div>
          <SearchPanel
            autoFocus
            onNavigate={() => setOpen(false)}
            hint="Enter를 누르면 상품 목록에서 검색 결과를 필터링해 보여 드려요."
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
