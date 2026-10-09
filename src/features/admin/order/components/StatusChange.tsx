"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { BottomSheet } from "@/features/admin/common/BottomSheet";
import { PasswordConfirm } from "@/features/admin/common/PasswordConfirm";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { changeOrderStatus } from "../actions";
import { ORDER_STATUSES, nextStatus, singleChangeDescription, statusRo } from "../status";

/** 상태 메뉴 공통 모양 (Figma: StatusMenu 63:3853) */
export const MENU_CONTENT_CLASS = "min-w-[124px] rounded-input border-line bg-card p-1.5 shadow-card";
export const MENU_ITEM_CLASS =
  "justify-between gap-3 rounded-input px-2.5 py-2 focus:bg-section data-[highlighted]:bg-section";

/** 모바일 시트의 56px 라디오 줄 (Figma: MobileStatusSheet 71:4708) */
export function StatusRadioRows({
  value,
  onSelect,
}: {
  value: OrderStatus | null;
  onSelect: (status: OrderStatus) => void;
}) {
  return (
    <ul role="radiogroup" className="flex flex-col">
      {ORDER_STATUSES.map((s) => {
        const checked = s === value;
        return (
          <li key={s} className="border-b border-line last:border-b-0">
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(s)}
              className="flex h-14 w-full items-center justify-between outline-none focus-visible:bg-section"
            >
              <StatusBadge status={s} />
              <span
                aria-hidden
                className={cn(
                  "flex size-[22px] items-center justify-center rounded-full",
                  checked ? "bg-action text-on-action" : "border-[1.5px] border-line-strong",
                )}
              >
                {checked && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 주문 1건의 상태 변경 — 데스크톱은 드롭다운 메뉴(mode="menu"), 모바일은 하단 시트(mode="sheet").
 * 다른 상태를 고르면 비밀번호 확인 후 저장한다.
 */
export function StatusChangeTrigger({
  orderNo,
  status,
  mode,
  className,
  children,
  align = "end",
}: {
  orderNo: string;
  status: OrderStatus;
  mode: "menu" | "sheet";
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<OrderStatus | null>(null);

  function choose(next: OrderStatus) {
    setSheetOpen(false);
    if (next !== status) setTarget(next);
  }

  return (
    <>
      {mode === "menu" ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            aria-label={`주문 ${orderNo} 상태 변경`}
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align}
            className={MENU_CONTENT_CLASS}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel className="px-2.5 pt-1.5 pb-1 type-label text-caption">
              상태 변경
            </DropdownMenuLabel>
            {ORDER_STATUSES.map((s) => (
              <DropdownMenuItem key={s} onSelect={() => choose(s)} className={MENU_ITEM_CLASS}>
                <StatusBadge status={s} />
                {s === status && <Check aria-label="현재 상태" className="size-4 text-link" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          type="button"
          aria-label={`주문 ${orderNo} 상태 변경`}
          className={className}
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(true);
          }}
        >
          {children}
        </button>
      )}

      {mode === "sheet" && (
        <BottomSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="상태 변경"
          description={`주문 ${orderNo}`}
        >
          <StatusRadioRows value={status} onSelect={choose} />
        </BottomSheet>
      )}

      <PasswordConfirm
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        description={target ? singleChangeDescription(orderNo, status, target) : ""}
        onConfirm={(password) => changeOrderStatus(password, [orderNo], target!)}
      />
    </>
  );
}

/** 목록 상태 칸: 배지 + ▾ */
export function StatusBadgeTrigger({
  orderNo,
  status,
  mode,
}: {
  orderNo: string;
  status: OrderStatus;
  mode: "menu" | "sheet";
}) {
  return (
    <StatusChangeTrigger
      orderNo={orderNo}
      status={status}
      mode={mode}
      className="relative -m-1.5 flex items-center gap-1 rounded-pill p-1.5 text-heading outline-none hover:bg-section focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-section"
    >
      <StatusBadge status={status} />
      <ChevronDown aria-hidden className="size-4" strokeWidth={1.75} />
    </StatusChangeTrigger>
  );
}

/** 다음 단계로 바로 바꾸는 Primary 버튼. 다음 단계가 없으면(완료 · 취소) 그리지 않는다 */
export function NextStepButton({
  orderNo,
  status,
  className,
}: {
  orderNo: string;
  status: OrderStatus;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const next = nextStatus(status);
  if (!next) return null;
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {statusRo(next)} 변경
      </Button>
      <PasswordConfirm
        open={open}
        onOpenChange={setOpen}
        description={singleChangeDescription(orderNo, status, next)}
        onConfirm={(password) => changeOrderStatus(password, [orderNo], next)}
      />
    </>
  );
}
