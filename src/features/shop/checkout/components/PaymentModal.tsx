"use client";

import { X } from "lucide-react";
import type { PaymentMethod } from "@/generated/prisma/enums";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/ui/sheet";
import { useMediaQuery } from "../hooks/use-media-query";
import { paymentLabel } from "../payment-methods";

type PaymentModalProps = {
  /** 닫힐 때 포커스를 돌려줄 요소 (결제창은 프로그램으로 열리므로 직접 지정한다) */
  returnFocus?: () => HTMLElement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: PaymentMethod;
  amount: number;
  /** 장바구니에 저장된 가격과 서버 계산 금액이 다를 때 */
  priceChanged?: boolean;
  pending: boolean;
  error?: string;
  onPay: () => void;
};

/**
 * 결제창 (실제 결제 없음) — 데스크톱은 가운데 Dialog(Figma 8:865), 모바일은 하단 Sheet(Figma 12:1341).
 * 카드 입력칸은 데모용이라 값을 서버로 보내지 않는다.
 */
export function PaymentModal({ open, onOpenChange, pending, returnFocus, ...props }: PaymentModalProps) {
  const handleCloseAutoFocus = (e: Event) => {
    const target = returnFocus?.();
    if (!target) return;
    e.preventDefault();
    target.focus();
  };
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // 결제 처리 중에는 닫지 않는다
  const handleOpenChange = (next: boolean) => {
    if (!pending) onOpenChange(next);
  };
  const title = props.method === "EASY_PAY" ? "간편결제" : `${paymentLabel(props.method)} 결제`;
  const body = (
    <PaymentBody
      {...props}
      title={title}
      pending={pending}
      isDesktop={isDesktop}
      onClose={() => handleOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={handleCloseAutoFocus}
          className="gap-0 rounded-card border-0 bg-page p-10 shadow-card sm:max-w-[520px]"
        >
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        // 모바일에서 첫 입력칸에 자동 포커스되면 키보드가 시트를 가리므로 막는다
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={handleCloseAutoFocus}
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-[20px] border-0 bg-page px-5 pt-3 pb-[calc(32px+env(safe-area-inset-bottom))]"
      >
        <div aria-hidden className="mx-auto mb-5 h-1 w-10 rounded-pill bg-line" />
        {body}
      </SheetContent>
    </Sheet>
  );
}

function PaymentBody({
  title,
  method,
  amount,
  priceChanged,
  pending,
  error,
  onPay,
  isDesktop,
  onClose,
}: Omit<PaymentModalProps, "open" | "onOpenChange"> & {
  title: string;
  isDesktop: boolean;
  onClose: () => void;
}) {
  const Title = isDesktop ? DialogTitle : SheetTitle;
  const Description = isDesktop ? DialogDescription : SheetDescription;

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        onPay();
      }}
    >
      <div className="flex items-center justify-between">
        <Title className="type-h3 text-heading">{title}</Title>
        <button
          type="button"
          aria-label="결제창 닫기"
          onClick={onClose}
          disabled={pending}
          className="-mr-1.5 flex size-9 items-center justify-center text-heading disabled:text-decor"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-input bg-section px-5 py-4">
        <span className="type-body-md text-body">결제 금액</span>
        <span className="type-h3 text-heading">{formatPrice(amount)}</span>
      </div>
      {priceChanged && (
        <p className="mt-2 type-body-sm text-caption">
          가격이 바뀐 상품이 있어 현재 판매가로 다시 계산했어요.
        </p>
      )}

      {method === "CARD" ? (
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-card-number" className="type-body-sm font-normal text-heading">
              카드 번호
            </Label>
            <Input
              id="demo-card-number"
              inputMode="numeric"
              autoComplete="off"
              maxLength={19}
              placeholder="0000 - 0000 - 0000 - 0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-card-exp" className="type-body-sm font-normal text-heading">
                유효기간
              </Label>
              <Input
                id="demo-card-exp"
                inputMode="numeric"
                autoComplete="off"
                maxLength={7}
                placeholder="MM / YY"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-card-cvc" className="type-body-sm font-normal text-heading">
                CVC
              </Label>
              <Input
                id="demo-card-cvc"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="000"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-input border border-line bg-card px-5 py-4 type-body-sm text-body">
          {method === "BANK_TRANSFER"
            ? "데모 계좌(파인은행 000-000000-00000)로 입금한 것으로 처리합니다."
            : "데모 간편결제로 바로 승인한 것으로 처리합니다."}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 type-body-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-7 w-full">
        {pending ? "주문을 처리하고 있어요…" : `${formatPrice(amount)} 결제하기`}
      </Button>
      <Description className="mt-5 type-body-sm text-caption">
        데모 결제입니다. 결제하기를 누르면 실제 결제 없이 주문이 완료됩니다.
      </Description>
    </form>
  );
}
