import { Button } from "@/shared/ui/button";
import { OrderLookupForm } from "./OrderLookupForm";

/** 마이페이지 (Figma: MyPage 17:1938 / Mobile 17:1817) — 로그인 카드 하나 */
export function MyPage() {
  return (
    <>
      <section className="lg:bg-section">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 pt-8 pb-5 lg:px-20 lg:py-16">
          <p className="hidden type-label text-link lg:block">MY PAGE</p>
          <h1 className="type-h2 text-heading lg:type-h1 lg:text-[44px]">마이페이지</h1>
          <p className="hidden type-body-md text-body lg:block">
            로그인하거나 주문번호로 비회원 주문을 조회하세요.
          </p>
        </div>
      </section>

      <div className="px-5 pb-12 lg:px-20 lg:pt-16 lg:pb-30">
        <section
          aria-labelledby="login-title"
          className="mx-auto flex w-full max-w-[440px] flex-col gap-5 rounded-card bg-card p-5 lg:gap-6 lg:p-10 lg:shadow-card"
        >
          <h2 id="login-title" className="type-h3 text-heading">
            로그인
          </h2>
          <Button type="button" disabled className="w-full disabled:border">
            카카오 로그인
          </Button>

          <div className="flex items-center gap-3" role="separator" aria-label="비회원 주문조회">
            <span className="h-px flex-1 bg-line" />
            <span className="type-body-sm text-caption">비회원 주문조회</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <OrderLookupForm />
        </section>
      </div>
    </>
  );
}
