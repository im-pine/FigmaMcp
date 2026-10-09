"use client";

import { ChevronDown, Lock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { Checkbox } from "@/features/admin/common/Checkbox";
import { PasswordConfirm } from "@/features/admin/common/PasswordConfirm";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { BottomSheet } from "@/features/admin/common/BottomSheet";
import type { AdminOrderRow } from "@/server/services/order/admin";
import { ORDER_STATUS_LABEL, formatOrderDate } from "@/shared/constants/order";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/Chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { changeOrderStatus } from "../actions";
import { ORDER_STATUSES, ORDER_STATUS_SHORT, bulkChangeDescription, statusRo } from "../status";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS, StatusBadgeTrigger, StatusRadioRows } from "./StatusChange";

type Counts = Record<OrderStatus, number> & { ALL: number };

const FILTERS: { value: OrderStatus | undefined; label: string; short: string }[] = [
  { value: undefined, label: "전체", short: "전체" },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s], short: ORDER_STATUS_SHORT[s] })),
];

const hrefFor = (status: OrderStatus | undefined) =>
  status ? `/admin/orders?status=${status}` : "/admin/orders";
/** 포털(메뉴 · 시트 · 비밀번호 창) 안의 클릭도 React에서는 행까지 올라오므로, 실제 행 안에서 눌렀을 때만 반응한다 */
const fromInside = (e: React.MouseEvent<HTMLElement>) => e.currentTarget.contains(e.target as Node);
const detailHref = (orderNo: string) => `/admin/orders/${encodeURIComponent(orderNo)}`;

/**
 * 관리자 주문 목록 (Figma: Admin Orders 63:3542 / Mobile 70:4274).
 * 데스크톱: 상태 칩 + 표 + 체크박스 일괄 변경 바. 모바일: 밑줄 탭 + 카드 + 선택 모드 하단 바.
 */
export function OrderList({
  rows,
  counts,
  status,
}: {
  rows: AdminOrderRow[];
  counts: Counts;
  status: OrderStatus | undefined;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  const [bulkChoice, setBulkChoice] = useState<OrderStatus | null>(null);
  const [bulkTarget, setBulkTarget] = useState<OrderStatus | null>(null);

  // 필터가 바뀌어 목록에서 빠진 주문은 선택에서도 뺀다
  const visible = new Set(rows.map((r) => r.orderNo));
  const selectedNos = [...selected].filter((no) => visible.has(no));
  const count = selectedNos.length;
  const allChecked = rows.length > 0 && count === rows.length;
  const someChecked = count > 0 && !allChecked;

  const toggle = (orderNo: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(orderNo);
      else next.delete(orderNo);
      return next;
    });
  const toggleAll = (on: boolean) => setSelected(on ? new Set(rows.map((r) => r.orderNo)) : new Set());
  const clear = () => setSelected(new Set());
  const exitSelectMode = () => {
    setSelectMode(false);
    clear();
  };

  const go = (s: OrderStatus | undefined) => router.push(hrefFor(s), { scroll: false });
  const received = status === "RECEIVED";

  return (
    <>
      {/* ───────── 데스크톱 ───────── */}
      <div className="hidden flex-col gap-6 p-8 lg:flex">
        <div className="flex flex-col gap-1">
          <h1 className="type-h2 text-heading">주문</h1>
          <p className="type-body-sm text-caption">
            주문 {rows.length}건 · 개인정보는 일부를 가려서 보여 줍니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="주문 상태 필터">
          {FILTERS.map((f) => (
            <Chip key={f.label} selected={f.value === status} onClick={() => go(f.value)}>
              {f.label} {f.value ? counts[f.value] : counts.ALL}
            </Chip>
          ))}
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-card">
          <Table className="table-fixed">
            <TableHeader className="bg-section [&_tr]:border-line">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 pl-6">
                  <Checkbox
                    aria-label="전체 선택"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onCheckedChange={() => toggleAll(!allChecked && !someChecked)}
                  />
                </TableHead>
                {[
                  ["주문", "w-[170px]"],
                  ["주문자", "w-[90px]"],
                  ["연락처", "w-[130px]"],
                  ["주소", ""],
                  ["상품", "w-[170px]"],
                  ["금액", "w-[100px]"],
                  ["상태", "w-[130px]"],
                ].map(([label, w]) => (
                  <TableHead key={label} className={cn("h-11 px-3 type-label text-heading", w)}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-16 text-center type-body-md text-caption">
                    해당하는 주문이 없어요.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => {
                const checked = selected.has(r.orderNo);
                return (
                  <TableRow
                    key={r.orderNo}
                    onClick={(e) => fromInside(e) && router.push(detailHref(r.orderNo))}
                    className={cn(
                      "h-[72px] cursor-pointer border-line type-body-sm text-body",
                      checked ? "bg-primary-100 hover:bg-primary-100" : "hover:bg-section/60",
                    )}
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        aria-label={`주문 ${r.orderNo} 선택`}
                        checked={checked}
                        onCheckedChange={(on) => toggle(r.orderNo, on)}
                      />
                    </TableCell>
                    <TableCell className="px-3">
                      <Link
                        href={detailHref(r.orderNo)}
                        onClick={(e) => e.stopPropagation()}
                        className="block font-medium text-heading hover:underline"
                      >
                        {r.orderNo}
                      </Link>
                      <span className="block text-caption">{formatOrderDate(r.createdAt)}</span>
                    </TableCell>
                    <TableCell className="px-3">{r.ordererName}</TableCell>
                    <TableCell className="px-3">{r.ordererPhone}</TableCell>
                    <TableCell className="truncate px-3">{r.address}</TableCell>
                    <TableCell className="px-3">
                      <ItemSummary row={r} />
                    </TableCell>
                    <TableCell className="px-3">{formatPrice(r.total)}</TableCell>
                    <TableCell className="px-3">
                      <span className="inline-flex">
                        <StatusBadgeTrigger orderNo={r.orderNo} status={r.status} mode="menu" />
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="type-body-sm break-keep text-caption">
          상태 배지 옆 ▾로 1건씩, 체크박스로 여러 건을 골라 한 번에 바꿉니다. 변경은 비밀번호 확인 후
          저장됩니다.
        </p>

        {/* 일괄 변경 바 — 본문 영역(사이드바 240px 제외) 가운데 아래 */}
        {count > 0 && (
          <div className="fixed bottom-8 left-[calc(50%+120px)] z-40 flex -translate-x-1/2 items-center gap-4 rounded-pill bg-inverse py-2 pr-3 pl-6 shadow-card">
            <span className="type-body-md font-medium whitespace-nowrap text-on-inverse">
              {count}건 선택됨
            </span>
            <span aria-hidden className="h-5 w-px bg-on-inverse/30" />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="inverse" size="sm">
                  상태 일괄 변경 <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" sideOffset={10} className={MENU_CONTENT_CLASS}>
                <DropdownMenuLabel className="px-2.5 pt-1.5 pb-1 type-label text-caption">
                  선택한 {count}건을 이 상태로
                </DropdownMenuLabel>
                {ORDER_STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setBulkTarget(s)} className={MENU_ITEM_CLASS}>
                    <StatusBadge status={s} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={clear}
              className="flex h-9 items-center gap-1 rounded-pill px-3 type-body-sm whitespace-nowrap text-on-inverse hover:bg-on-inverse/10"
            >
              <X className="size-4" aria-hidden />
              선택 해제
            </button>
          </div>
        )}
      </div>

      {/* ───────── 모바일 ───────── */}
      <div className={cn("flex flex-col lg:hidden", selectMode && "pb-8")}>
        <div className="flex flex-col gap-1.5 px-4 pt-5 pb-3">
          <div className="flex items-center justify-between">
            {selectMode ? (
              <h1 className="type-h3 text-heading">{count}건 선택됨</h1>
            ) : (
              <h1 className="flex items-baseline gap-2">
                <span className="type-h3 text-heading">{received ? "주문 접수" : "주문"}</span>
                <span className="type-body-sm text-caption">{rows.length}건</span>
              </h1>
            )}
            <button
              type="button"
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className="-mr-2 flex h-10 items-center px-2 type-body-md font-medium text-link"
            >
              {selectMode ? "취소" : "선택"}
            </button>
          </div>
          <p className="flex items-center gap-1.5 type-body-sm text-caption">
            {received ? (
              "준비를 시작하면 상태를 바꿔 주세요"
            ) : (
              <>
                <Lock className="size-3.5" strokeWidth={1.75} aria-hidden />
                개인정보는 일부를 가려서 보여 줍니다
              </>
            )}
          </p>
        </div>

        <nav aria-label="주문 상태 필터" className="flex border-b border-line px-1">
          {FILTERS.map((f) => {
            const active = f.value === status;
            return (
              <button
                key={f.label}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => go(f.value)}
                className={cn(
                  "-mb-px flex h-11 flex-1 items-center justify-center border-b-2 type-body-sm whitespace-nowrap",
                  active ? "border-action font-medium text-link" : "border-transparent text-body",
                )}
              >
                {f.short} {f.value ? counts[f.value] : counts.ALL}
              </button>
            );
          })}
        </nav>

        <ul className="flex flex-col gap-3 px-4 py-4">
          {rows.length === 0 && (
            <li className="py-16 text-center type-body-md text-caption">해당하는 주문이 없어요.</li>
          )}
          {rows.map((r) => {
            const checked = selected.has(r.orderNo);
            return (
              <li key={r.orderNo}>
                <div
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    if (!fromInside(e)) return;
                    if (selectMode) toggle(r.orderNo, !checked);
                    else router.push(detailHref(r.orderNo));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget && !selectMode)
                      router.push(detailHref(r.orderNo));
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-card p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selectMode && checked
                      ? "border-2 border-action bg-primary-50"
                      : "border border-line bg-card",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {selectMode && (
                        <Checkbox
                          aria-label={`주문 ${r.orderNo} 선택`}
                          checked={checked}
                          onCheckedChange={(on) => toggle(r.orderNo, on)}
                          className="mt-0.5"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="type-body-md font-medium text-heading">{r.orderNo}</span>
                        <span className="type-body-sm text-caption">{formatOrderDate(r.createdAt)}</span>
                      </div>
                    </div>
                    {selectMode ? (
                      <StatusBadge status={r.status} />
                    ) : (
                      <StatusBadgeTrigger orderNo={r.orderNo} status={r.status} mode="sheet" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <ItemSummary row={r} className="type-body-md text-heading" />
                    <span className="shrink-0 type-body-md font-bold text-heading">
                      {formatPrice(r.total)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-line pt-3 type-body-sm text-caption">
                    <span>
                      {r.ordererName} · {r.ordererPhone}
                    </span>
                    <span className="truncate">{r.address}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 선택 모드 하단 바 — 탭 바(z-40)를 덮는다 */}
        {selectMode && (
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
            <div className="flex h-16 items-center justify-between px-4">
              <label className="flex items-center gap-2.5 type-body-sm text-body">
                <Checkbox
                  aria-label="전체 선택"
                  checked={allChecked}
                  indeterminate={someChecked}
                  onCheckedChange={() => toggleAll(!allChecked && !someChecked)}
                />
                전체 선택
              </label>
              <Button
                size="sm"
                className="h-11 px-6"
                disabled={count === 0}
                onClick={() => {
                  setBulkChoice(null);
                  setBulkSheetOpen(true);
                }}
              >
                {count}건 상태 변경
              </Button>
            </div>
          </div>
        )}

        <BottomSheet
          open={bulkSheetOpen}
          onOpenChange={setBulkSheetOpen}
          title="상태 일괄 변경"
          description={`선택한 주문 ${count}건을 아래 상태로 맞춥니다`}
        >
          <StatusRadioRows value={bulkChoice} onSelect={setBulkChoice} />
          <Button
            className="w-full"
            disabled={!bulkChoice}
            onClick={() => {
              setBulkSheetOpen(false);
              setBulkTarget(bulkChoice);
            }}
          >
            {bulkChoice ? `${count}건을 ${statusRo(bulkChoice)} 변경` : "상태를 골라 주세요"}
          </Button>
        </BottomSheet>
      </div>

      <PasswordConfirm
        open={bulkTarget !== null}
        onOpenChange={(open) => !open && setBulkTarget(null)}
        title="상태 일괄 변경"
        description={bulkTarget ? bulkChangeDescription(count, bulkTarget) : ""}
        onConfirm={(password) => changeOrderStatus(password, selectedNos, bulkTarget!)}
        onSuccess={exitSelectMode}
      />
    </>
  );
}

/** 첫 상품명 외 N건 — 칸이 좁으면 상품명만 말줄임 */
function ItemSummary({ row, className }: { row: AdminOrderRow; className?: string }) {
  return (
    <span className={cn("flex min-w-0", className)}>
      <span className="truncate">{row.firstItemName}</span>
      {row.extraItemCount > 0 && <span className="shrink-0 whitespace-pre"> 외 {row.extraItemCount}건</span>}
    </span>
  );
}
