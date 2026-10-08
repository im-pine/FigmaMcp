"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import type { PaymentMethod } from "@/generated/prisma/enums";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/Chip";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { CartSkeleton } from "@/features/shop/cart/components/CartView";
import { OrderSummary } from "@/features/shop/cart/components/OrderSummary";
import { summarizeCart, useCartHydrated, useCartStore } from "@/features/shop/cart/store";
import { placeOrder, quoteOrder } from "../actions";
import { PAYMENT_METHODS } from "../payment-methods";
import { parseCheckout, type CheckoutErrors, type CheckoutField, type CheckoutInput } from "../schema";
import { PaymentModal } from "./PaymentModal";

const FORM_ID = "checkout-form";

/** 주문서 화면 (Figma: 데스크톱 8:742 · 모바일 11:1329) */
export function CheckoutView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const [placedOrderNo, setPlacedOrderNo] = useState<string | null>(null);

  let content: React.ReactNode;
  if (placedOrderNo) {
    content = (
      <p className="py-20 text-center type-body-md text-caption">주문 완료 화면으로 이동하고 있어요…</p>
    );
  } else if (!hydrated) {
    content = <CartSkeleton />;
  } else if (items.length === 0) {
    content = <CheckoutEmpty />;
  } else {
    content = <CheckoutForm onPlaced={setPlacedOrderNo} />;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-6 pb-16 lg:px-20 lg:pt-16 lg:pb-32">
      <h1 className="type-h2 text-heading lg:type-h1">주문서 작성</h1>
      <p className="mt-5 flex items-start gap-3 rounded-input bg-badge px-4 py-3.5 type-body-sm text-body lg:mt-8 lg:items-center lg:px-5">
        <Lock className="mt-0.5 size-5 shrink-0 text-heading lg:mt-0" strokeWidth={1.5} />
        포트폴리오용 데모 사이트입니다. 실제 개인정보를 입력하지 마세요. 실제 결제는 진행되지 않습니다.
      </p>
      <div className="mt-8 lg:mt-7">{content}</div>
    </section>
  );
}

function CheckoutForm({ onPlaced }: { onPlaced: (orderNo: string) => void }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const { subtotal, shippingFee, total } = summarizeCart(items);

  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [payload, setPayload] = useState<CheckoutInput | null>(null);
  const [quote, setQuote] = useState(0);
  const [payError, setPayError] = useState<string>();
  const [pending, startTransition] = useTransition();

  /** 주문서 확인 → 통과하면 결제창을 연다 */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = parseCheckout({
      ...form,
      paymentMethod: method,
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity, giftWrap: i.giftWrap })),
    });
    if (!parsed.success) {
      setErrors(parsed.errors);
      focusFirstError();
      return;
    }
    setErrors({});
    setPayError(undefined);
    // 결제창 금액은 서버가 DB 가격으로 계산한 값을 보여 준다
    startTransition(async () => {
      const result = await quoteOrder(parsed.data.items);
      if ("error" in result) {
        setErrors({ form: [result.error] });
        return;
      }
      setQuote(result.total);
      setPayload(parsed.data);
    });
  };

  /** 결제하기 → 서버에서 다시 검증 · 금액 계산 후 주문 생성 */
  const handlePay = () => {
    if (!payload) return;
    startTransition(async () => {
      const result = await placeOrder(payload);
      if ("orderNo" in result) {
        onPlaced(result.orderNo);
        clearCart();
        router.replace(`/orders/complete?orderNo=${encodeURIComponent(result.orderNo)}`);
        return;
      }
      const { form, ...fieldErrors } = result.errors;
      if (Object.keys(fieldErrors).length > 0) {
        setPayload(null);
        setErrors(result.errors);
        focusFirstError();
      } else {
        setPayError(form?.[0] ?? "주문을 처리하지 못했어요. 다시 시도해 주세요.");
      }
    });
  };

  const clearError = (field: CheckoutField) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const field = (
    name: CheckoutField,
    label: string,
    props: Omit<React.ComponentProps<"input">, "name"> = {},
  ) => <FormField {...props} name={name} label={label} error={errors[name]?.[0]} onEdit={clearError} />;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-15">
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-10 lg:gap-12">
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 type-h3 text-heading">주문자 정보</legend>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-4">
            {field("ordererName", "이름", { placeholder: "홍길동" })}
            {field("ordererPhone", "연락처", { type: "tel", inputMode: "tel", placeholder: "010-0000-0000" })}
          </div>
          {field("ordererEmail", "이메일", { type: "email", placeholder: "example@email.com" })}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 type-h3 text-heading">배송 정보</legend>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-4">
            {field("recipientName", "받는 분", { placeholder: "홍길동" })}
            {field("recipientPhone", "연락처", {
              type: "tel",
              inputMode: "tel",
              placeholder: "010-0000-0000",
            })}
          </div>
          {field("address", "주소", { placeholder: "도로명 주소 검색" })}
          {field("addressDetail", "상세 주소", { placeholder: "상세 주소를 입력하세요" })}
          {field("requestNote", "배송 요청사항", { placeholder: "문 앞에 놓아주세요" })}
        </fieldset>

        <fieldset>
          <legend className="mb-5 type-h3 text-heading">결제 수단</legend>
          <div role="radiogroup" aria-label="결제 수단" className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <Chip
                key={m.value}
                role="radio"
                aria-checked={method === m.value}
                selected={method === m.value}
                onClick={() => setMethod(m.value)}
              >
                {m.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        {(errors.items || errors.form) && (
          <p role="alert" className="type-body-sm text-destructive">
            {errors.items?.[0] ?? errors.form?.[0]}{" "}
            <Link href="/cart" className="underline">
              장바구니로 가기
            </Link>
          </p>
        )}
      </form>

      <OrderSummary
        subtotal={subtotal}
        shippingFee={shippingFee}
        total={total}
        className="mt-10 lg:sticky lg:top-28 lg:mt-0"
        action={
          <Button type="submit" form={FORM_ID} disabled={pending}>
            {formatPrice(total)} 결제하기
          </Button>
        }
      />

      <PaymentModal
        open={payload !== null}
        onOpenChange={(open) => !open && setPayload(null)}
        method={method}
        amount={quote}
        priceChanged={quote !== total}
        pending={pending}
        error={payError}
        onPay={handlePay}
      />
    </div>
  );
}

function FormField({
  name,
  label,
  error,
  onEdit,
  ...props
}: React.ComponentProps<"input"> & {
  name: CheckoutField;
  label: string;
  error?: string;
  onEdit: (name: CheckoutField) => void;
}) {
  const id = `checkout-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="type-body-sm font-normal text-heading">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={() => onEdit(name)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="type-body-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** 오류 표시가 그려진 뒤 화면 순서상 첫 오류 칸으로 이동한다 */
function focusFirstError() {
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>(`#${FORM_ID} [aria-invalid="true"]`)?.focus(),
  );
}

function CheckoutEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-card px-6 py-20 text-center">
      <p className="type-title text-heading">주문할 상품이 없어요</p>
      <p className="type-body-md text-caption">장바구니에 상품을 담은 뒤 주문해 주세요.</p>
      <Button asChild className="mt-2">
        <Link href="/products">상품 보러 가기</Link>
      </Button>
    </div>
  );
}
