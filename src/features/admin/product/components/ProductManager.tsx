"use client";

import { Lock, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Category, Product } from "@/generated/prisma/client";
import { BottomSheet } from "@/features/admin/common/BottomSheet";
import { CategoryBadge } from "@/features/admin/common/CategoryBadge";
import { PasswordConfirm } from "@/features/admin/common/PasswordConfirm";
import { useIsDesktop } from "@/features/admin/common/use-is-desktop";
import { CATEGORIES } from "@/shared/constants/catalog";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { deleteProduct } from "../actions";
import { CategoryChips, CategoryTabs, ProductSearch } from "./ProductFilters";
import { ProductForm } from "./ProductForm";

type Props = { products: Product[]; total: number; category?: Category; q?: string };

/** 폼 대상: 등록(null) · 수정(상품). undefined면 닫힘 */
type FormTarget = Product | null | undefined;

/**
 * 상품 목록 + 등록 · 수정 · 삭제 흐름.
 * 데스크톱(lg 이상): 테이블 + 행 … 메뉴 / 모바일: 원형 썸네일 목록 + 하단 액션 시트 + 떠 있는 추가 버튼.
 */
export function ProductManager({ products, total, category, q }: Props) {
  const isDesktop = useIsDesktop();
  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function openForm(product: Product | null) {
    setSheetProduct(null);
    setFormKey((k) => k + 1); // 열 때마다 폼 값을 새로 채운다
    setFormTarget(product);
  }

  function openDelete(product: Product) {
    setSheetProduct(null);
    setDeleteTarget(product);
  }

  return (
    <>
      {/* 데스크톱 */}
      <section className="hidden flex-col gap-6 p-8 lg:flex">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="type-h2 text-heading">상품</h1>
            <p className="type-body-sm text-caption">쇼핑몰에 보이는 상품 {total}개를 관리합니다.</p>
          </div>
          <Button onClick={() => openForm(null)}>
            <Plus className="size-[18px]" strokeWidth={2} />
            상품 추가
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <ProductSearch q={q} category={category} className="h-12 w-80" />
          <CategoryChips category={category} q={q} />
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-card">
          <table className="w-full table-fixed">
            <thead className="bg-section">
              <tr className="h-11 text-left type-label text-caption">
                <th className="px-6 font-medium">상품</th>
                <th className="w-40 px-4 font-medium">카테고리</th>
                <th className="w-[140px] px-4 font-medium">가격</th>
                <th className="w-[72px]">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="h-[76px] border-t border-line">
                  <td className="px-6">
                    <div className="flex items-center gap-4">
                      <Image
                        src={p.imagePath}
                        alt=""
                        width={52}
                        height={52}
                        className="size-[52px] shrink-0 rounded-[8px] object-cover"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate type-body-md font-medium text-heading">{p.name}</span>
                        <span className="truncate type-body-sm text-caption">{p.nameEn}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <CategoryBadge category={p.category} />
                  </td>
                  <td className="px-4 type-body-md text-heading">{formatPrice(p.price)}</td>
                  <td className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${p.name} 관리 메뉴`}
                          className="flex size-8 items-center justify-center rounded-input text-heading hover:bg-section"
                        >
                          <MoreHorizontal className="size-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-input border-line bg-card p-1.5 shadow-card"
                      >
                        <DropdownMenuItem
                          onSelect={() => openForm(p)}
                          className="h-10 gap-2.5 px-3 type-body-md text-heading"
                        >
                          <Pencil className="size-4 text-heading" strokeWidth={1.5} />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => openDelete(p)}
                          className="h-10 gap-2.5 px-3 type-body-md text-heading"
                        >
                          <Trash2 className="size-4 text-heading" strokeWidth={1.5} />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <EmptyResult />}
        </div>
      </section>

      {/* 모바일 */}
      <section className="flex flex-col lg:hidden">
        <div className="flex flex-col gap-4 px-4 pt-5 pb-3">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-baseline gap-2">
              <span className="type-h3 text-heading">상품</span>
              <span className="type-body-sm text-caption">{total}개</span>
            </h1>
            <p className="flex items-center gap-1.5 type-body-sm text-caption">
              <Lock className="size-3.5" strokeWidth={1.5} />
              조회는 누구나 · 변경은 비밀번호 확인 후
            </p>
          </div>
          <ProductSearch q={q} category={category} className="h-12" />
          <CategoryTabs category={category} q={q} />
        </div>

        <ul className="px-4">
          {products.map((p) => (
            <li key={p.id} className="flex h-20 items-center gap-3 border-b border-line">
              <Image
                src={p.imagePath}
                alt=""
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate type-body-md font-medium text-heading">{p.name}</span>
                <span className="flex items-center gap-2">
                  <CategoryBadge category={p.category} />
                  <span className="type-body-sm text-body">{formatPrice(p.price)}</span>
                </span>
              </div>
              <button
                type="button"
                aria-label={`${p.name} 관리 메뉴`}
                onClick={() => setSheetProduct(p)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-heading active:bg-section"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </li>
          ))}
        </ul>
        {products.length === 0 && <EmptyResult />}

        <Button
          onClick={() => openForm(null)}
          className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 shadow-card"
        >
          <Plus className="size-[18px]" strokeWidth={2} />
          상품 추가
        </Button>
      </section>

      {/* 모바일 … → 하단 액션 시트 */}
      <BottomSheet
        open={!isDesktop && sheetProduct !== null}
        onOpenChange={(open) => !open && setSheetProduct(null)}
        title="상품 관리"
      >
        {sheetProduct && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Image
                src={sheetProduct.imagePath}
                alt=""
                width={44}
                height={44}
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate type-body-md font-medium text-heading">{sheetProduct.name}</span>
                <span className="type-body-sm text-caption">
                  {CATEGORIES.find((c) => c.value === sheetProduct.category)?.label} ·{" "}
                  {formatPrice(sheetProduct.price)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openForm(sheetProduct)}
              className="flex h-14 items-center gap-3 type-body-lg text-heading"
            >
              <Pencil className="size-5" strokeWidth={1.5} />
              수정
            </button>
            <button
              type="button"
              onClick={() => openDelete(sheetProduct)}
              className="flex h-14 items-center gap-3 type-body-lg text-heading"
            >
              <Trash2 className="size-5" strokeWidth={1.5} />
              삭제
            </button>
            <Button variant="secondary" className="mt-2 w-full" onClick={() => setSheetProduct(null)}>
              닫기
            </Button>
          </div>
        )}
      </BottomSheet>

      {formTarget !== undefined && (
        <ProductForm
          key={formKey}
          product={formTarget}
          isDesktop={isDesktop}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <PasswordConfirm
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="상품을 삭제할까요?"
        description={`'${deleteTarget?.name ?? ""}'을 쇼핑몰에서 삭제합니다.\n삭제하면 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={(password) => deleteProduct(password, { id: deleteTarget?.id })}
      />
    </>
  );
}

function EmptyResult() {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
      <p className="type-title text-heading">찾는 상품이 없어요</p>
      <p className="type-body-sm break-keep text-caption">다른 검색어나 카테고리로 다시 찾아보세요.</p>
    </div>
  );
}
