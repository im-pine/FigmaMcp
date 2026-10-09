"use client";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/ui/sheet";

/** 모바일 하단 시트 공통 틀 (Figma: Mobile*Sheet) — 손잡이 + 제목 + 내용 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-4 rounded-t-[20px] border-none bg-card px-5 pt-2.5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
      >
        <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-line" />
        <div className="flex flex-col gap-0.5">
          <SheetTitle className="type-h3 text-heading">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="type-body-sm text-caption">{description}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">{title}</SheetDescription>
          )}
        </div>
        {children}
      </SheetContent>
    </Sheet>
  );
}
