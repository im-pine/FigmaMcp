"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { lookupOrder, type LookupState } from "../actions";

const initialState: LookupState = {};

/** 비회원 주문조회 폼 — 주문번호 + 주문자 연락처 */
export function OrderLookupForm() {
  const [state, formAction, pending] = useActionState(lookupOrder, initialState);
  const errors = state.errors;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="orderNo" className="type-body-sm font-normal text-body">
          주문번호
        </Label>
        <Input
          id="orderNo"
          name="orderNo"
          placeholder="20261006-0001"
          autoComplete="off"
          defaultValue={state.values?.orderNo}
          aria-invalid={Boolean(errors?.orderNo) || undefined}
          aria-describedby={errors?.orderNo ? "orderNo-error" : undefined}
          required
        />
        {errors?.orderNo && (
          <p id="orderNo-error" className="type-body-sm text-destructive">
            {errors.orderNo[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ordererPhone" className="type-body-sm font-normal text-body">
          주문자 연락처
        </Label>
        <Input
          id="ordererPhone"
          name="ordererPhone"
          type="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          autoComplete="tel"
          defaultValue={state.values?.ordererPhone}
          aria-invalid={Boolean(errors?.ordererPhone) || undefined}
          aria-describedby={errors?.ordererPhone ? "ordererPhone-error" : undefined}
          required
        />
        {errors?.ordererPhone && (
          <p id="ordererPhone-error" className="type-body-sm text-destructive">
            {errors.ordererPhone[0]}
          </p>
        )}
      </div>

      <p aria-live="polite" className="type-body-sm text-destructive empty:hidden">
        {errors?.form?.[0]}
      </p>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "조회 중…" : "주문 조회"}
      </Button>
    </form>
  );
}
