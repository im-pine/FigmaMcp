"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import * as z from "zod";
import type { Category, Product } from "@/generated/prisma/client";
import type { AdminActionResult } from "@/features/admin/common/action-result";
import { Checkbox } from "@/features/admin/common/Checkbox";
import { PasswordConfirm } from "@/features/admin/common/PasswordConfirm";
import { CATEGORIES } from "@/shared/constants/catalog";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/ui/sheet";
import { createProduct, updateProduct } from "../actions";
import { PRODUCT_IMAGES, ProductInputSchema, type ProductInput } from "../schema";

type FieldErrors = Partial<Record<keyof ProductInput, string[] | undefined>>;

const EMPTY: ProductInput = {
  name: "",
  nameEn: "",
  description: "",
  price: 0,
  category: "BREAD",
  imagePath: PRODUCT_IMAGES[0],
  isBest: false,
  ingredients: "",
  allergens: "",
  storageGuide: "",
};

function initialValues(product: Product | null): ProductInput {
  if (!product) return EMPTY;
  return {
    name: product.name,
    nameEn: product.nameEn,
    description: product.description,
    price: product.price,
    category: product.category,
    imagePath: (PRODUCT_IMAGES as readonly string[]).includes(product.imagePath)
      ? (product.imagePath as ProductInput["imagePath"])
      : PRODUCT_IMAGES[0],
    isBest: product.isBest,
    ingredients: product.ingredients,
    allergens: product.allergens,
    storageGuide: product.storageGuide,
  };
}

/**
 * 상품 등록 · 수정 폼 (Figma: 63:3133 데스크톱 Dialog / 71:4629 모바일 전체 화면).
 * 저장 → 입력 검증 → 비밀번호 확인 → Server Action 순서로 진행한다.
 */
export function ProductForm({
  product,
  isDesktop,
  onClose,
}: {
  /** null이면 등록 */
  product: Product | null;
  isDesktop: boolean;
  onClose: () => void;
}) {
  const [values, setValues] = useState<ProductInput>(() => initialValues(product));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const title = product ? "상품 수정" : "상품 등록";

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ProductInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }
    setConfirmOpen(true);
  }

  async function save(password: string): Promise<AdminActionResult> {
    const result = product
      ? await updateProduct(password, { id: product.id, data: values })
      : await createProduct(password, values);
    if (!result.ok && result.error === "invalid") setErrors(result.fieldErrors);
    return result;
  }

  const formId = useId();
  const fields = (
    <ProductFields id={formId} values={values} errors={errors} set={set} isDesktop={isDesktop} />
  );

  const confirm = (
    <PasswordConfirm
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      description={"저장하면 쇼핑몰에 바로 반영됩니다.\n계속하려면 관리자 비밀번호를 입력해 주세요."}
      confirmLabel="저장"
      onConfirm={save}
      onSuccess={onClose}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] max-w-[640px] gap-0 overflow-y-auto rounded-[16px] border-none bg-card p-8 shadow-card sm:max-w-[640px]"
        >
          <div className="flex items-start justify-between gap-4 pb-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="type-h3 text-heading">{title}</DialogTitle>
              <DialogDescription className="type-body-sm text-caption">
                저장하면 비밀번호를 확인한 뒤 쇼핑몰에 바로 반영됩니다.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-input text-heading hover:bg-section"
            >
              <X className="size-5" strokeWidth={1.5} />
            </DialogClose>
          </div>
          <form id={formId} onSubmit={submit} noValidate>
            {fields}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="secondary" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
          {confirm}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className="h-dvh gap-0 border-none bg-page p-0">
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-line">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute left-2 flex size-10 items-center justify-center text-heading"
          >
            <X className="size-6" strokeWidth={1.5} />
          </button>
          <SheetTitle className="type-title text-heading">{title}</SheetTitle>
          <SheetDescription className="sr-only">
            저장하면 비밀번호를 확인한 뒤 쇼핑몰에 바로 반영됩니다.
          </SheetDescription>
        </header>
        <form id={formId} onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-5">{fields}</div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-page px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button type="submit" className="w-full">
              저장
            </Button>
            <p className="text-center type-body-sm break-keep text-caption">
              저장하면 비밀번호를 확인한 뒤 바로 반영됩니다.
            </p>
          </div>
        </form>
        {confirm}
      </SheetContent>
    </Sheet>
  );
}

const FIELD_CLASS = "h-12 bg-page";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full resize-none rounded-input border border-line bg-page px-4 py-3 type-body-md text-heading outline-none placeholder:text-caption focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

function ProductFields({
  id,
  values,
  errors,
  set,
  isDesktop,
}: {
  id: string;
  values: ProductInput;
  errors: FieldErrors;
  set: <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => void;
  isDesktop: boolean;
}) {
  const fid = (key: keyof ProductInput) => `${id}-${key}`;
  const text = (key: "name" | "nameEn" | "ingredients" | "allergens" | "storageGuide", label: string) => (
    <Field id={fid(key)} label={label} error={errors[key]?.[0]}>
      <Input
        id={fid(key)}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={errors[key] ? true : undefined}
        className={FIELD_CLASS}
      />
    </Field>
  );
  const row = isDesktop ? "grid grid-cols-2 gap-3" : "flex flex-col gap-5";

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 type-body-sm font-medium text-heading">이미지</legend>
        <div className={cn("grid", isDesktop ? "grid-cols-6 gap-3" : "grid-cols-4 gap-3")}>
          {PRODUCT_IMAGES.map((src) => {
            const selected = values.imagePath === src;
            return (
              <button
                key={src}
                type="button"
                aria-pressed={selected}
                aria-label={src.split("/").pop()}
                onClick={() => set("imagePath", src)}
                className={cn(
                  "relative aspect-square w-full overflow-hidden",
                  isDesktop ? "max-w-[86px] rounded-[10px]" : "mx-auto max-w-[76px] rounded-full",
                  selected && "ring-[3px] ring-action",
                )}
              >
                <Image src={src} alt="" fill sizes="86px" className="object-cover" />
                {selected && (
                  <span
                    className={cn(
                      "absolute flex size-5 items-center justify-center rounded-full bg-action text-on-action",
                      isDesktop ? "bottom-1.5 left-1/2 -translate-x-1/2" : "bottom-2 left-2",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {isDesktop && (
          <p className="type-body-sm text-caption">
            public/images/products/의 고정 이미지 중 하나를 고릅니다.
          </p>
        )}
      </fieldset>

      <div className={row}>
        {text("name", "상품명")}
        {text("nameEn", "영문 이름")}
      </div>

      <div className={row}>
        <Field id={fid("category")} label="카테고리" error={errors.category?.[0]}>
          <Select value={values.category} onValueChange={(v) => set("category", v as Category)}>
            <SelectTrigger
              id={fid("category")}
              className={FIELD_CLASS}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-input border-line bg-card">
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="h-10 type-body-md text-heading">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id={fid("price")} label="가격 (원)" error={errors.price?.[0]}>
          <Input
            id={fid("price")}
            inputMode="numeric"
            value={values.price ? values.price.toLocaleString("ko-KR") : ""}
            onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "").slice(0, 9)))}
            aria-invalid={errors.price ? true : undefined}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field id={fid("description")} label="설명" error={errors.description?.[0]}>
        <textarea
          id={fid("description")}
          rows={3}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          aria-invalid={errors.description ? true : undefined}
          className={TEXTAREA_CLASS}
        />
      </Field>

      <div className={row}>
        {text("ingredients", "원재료")}
        {text("allergens", "알레르기")}
      </div>

      {text("storageGuide", "보관 방법")}

      <label className="flex items-center gap-2.5 type-body-sm text-heading">
        <Checkbox
          checked={values.isBest}
          onCheckedChange={(checked) => set("isBest", checked)}
          aria-label="추천 상품으로 표시"
        />
        추천 상품으로 표시 (홈 추천 영역)
      </label>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="type-body-sm font-medium text-heading">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="type-body-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
