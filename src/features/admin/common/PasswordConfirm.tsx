"use client";

import { Lock } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/ui/sheet";
import type { AdminActionResult } from "./action-result";
import { useIsDesktop } from "./use-is-desktop";

type PasswordConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** 무엇이 바뀌는지. 줄바꿈(\n)은 그대로 보여 준다 (한글 단어 중간 줄바꿈 방지용) */
  description: string;
  confirmLabel?: string;
  /** 비밀번호를 받아 Server Action을 실행한다. ok면 닫고 onSuccess를 부른다 */
  onConfirm: (password: string) => Promise<AdminActionResult>;
  onSuccess?: () => void;
};

/**
 * 데이터 변경 전 관리자 비밀번호 확인 (Figma: PasswordDialog · MobilePasswordSheet).
 * 데스크톱은 가운데 Dialog, 모바일은 키보드가 올라와도 입력칸이 보이도록 하단 시트.
 */
export function PasswordConfirm({
  open,
  onOpenChange,
  title = "관리자 비밀번호 확인",
  description,
  confirmLabel = "확인",
  onConfirm,
  onSuccess,
}: PasswordConfirmProps) {
  const isDesktop = useIsDesktop();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = useId();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPassword("");
      setError(null);
    }
    onOpenChange(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await onConfirm(password);
      if (result.ok) {
        handleOpenChange(false);
        onSuccess?.();
        return;
      }
      setError(
        result.error === "password"
          ? "비밀번호가 맞지 않아요."
          : result.error === "invalid"
            ? "입력값을 확인해 주세요."
            : (result.message ?? "처리하지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
    });
  }

  const body = (
    Title: typeof DialogTitle | typeof SheetTitle,
    Desc: typeof DialogDescription | typeof SheetDescription,
  ) => (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <span className="flex size-12 items-center justify-center rounded-full bg-section text-heading">
        <Lock className="size-6" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1.5">
        <Title className="type-h3 text-heading">{title}</Title>
        <Desc className="type-body-sm whitespace-pre-line text-body">{description}</Desc>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId} className="type-body-sm text-body">
          비밀번호
        </Label>
        <Input
          id={inputId}
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="type-body-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => handleOpenChange(false)}>
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={pending || password.length === 0}>
          {pending ? "확인 중…" : confirmLabel}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[440px] rounded-[16px] border-none bg-card p-8 shadow-card sm:max-w-[440px]"
        >
          {body(DialogTitle, DialogDescription)}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-[20px] border-none bg-card px-5 pt-2.5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
      >
        <span aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {body(SheetTitle, SheetDescription)}
      </SheetContent>
    </Sheet>
  );
}
