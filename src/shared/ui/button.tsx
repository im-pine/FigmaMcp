import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";
import { Slot } from "radix-ui";

/**
 * Figma: Button (Type = Primary · Secondary · Inverse · Disabled)
 * - primary   : 주요 행동 (장바구니 담기, 주문하기) — primary-600 + 흰 글자
 * - secondary : 보조 행동 — brown-900 테두리
 * - inverse   : 어두운 배너 위 — 크림 테두리
 * - Disabled  : disabled 속성으로 표현 (준비 중 기능)
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill type-button whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:border-line disabled:bg-section disabled:text-decor [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action hover:bg-action-hover",
        secondary: "border border-line-strong text-heading hover:bg-section",
        inverse: "border border-on-inverse text-on-inverse hover:bg-on-inverse/10",
        ghost: "text-heading hover:bg-section",
        link: "text-link underline-offset-4 hover:underline",
        // shadcn 내부 컴포넌트 호환용
        outline: "border border-line-strong text-heading hover:bg-section",
      },
      size: {
        md: "h-12 px-7",
        sm: "h-9 px-[18px] text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
