/** 라우트 골격용 임시 화면. 각 기능 PR에서 실제 화면으로 교체한다. */
export function PagePlaceholder({ title, owner }: { title: string; owner: string }) {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-16 lg:px-20">
      <p className="type-label text-link">COMING SOON</p>
      <h1 className="type-h2 text-heading lg:type-h1">{title}</h1>
      <p className="type-body-sm text-caption">구현 브랜치: {owner}</p>
    </section>
  );
}
