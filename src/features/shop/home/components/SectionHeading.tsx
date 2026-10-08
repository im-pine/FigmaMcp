import { cn } from "@/shared/lib/utils";

/** 섹션 머리: 작은 영문 라벨 → 세리프 제목 (디자인 브리프의 반복 패턴) */
export function SectionHeading({
  label,
  title,
  className,
}: {
  label: string;
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 lg:gap-3", className)}>
      <p className="type-label text-caption">{label}</p>
      <h2 className="type-h2 text-heading">{title}</h2>
    </div>
  );
}
