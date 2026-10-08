import Link from "next/link";
import { CATEGORY_LINKS, CUSTOMER_CARE, SHOP_INFO } from "./nav";

/** 푸터 (Figma: Footer · MobileFooter) — 데스크톱 4단, 모바일 1단 */
export function ShopFooter() {
  return (
    <footer className="bg-inverse text-on-inverse">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-7 px-5 pt-12 pb-8 lg:gap-12 lg:px-20 lg:pt-16">
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-20">
          <div className="flex flex-col gap-2 lg:flex-1 lg:gap-3">
            <p className="type-h3">{SHOP_INFO.name}</p>
            <p className="type-body-sm opacity-80">{SHOP_INFO.description}</p>
          </div>
          <div className="flex gap-10 lg:gap-20">
            <FooterColumn title="SHOP">
              {CATEGORY_LINKS.map((c) => (
                <Link key={c.slug} href={c.href} className="type-body-sm">
                  {c.label}
                </Link>
              ))}
            </FooterColumn>
            <FooterColumn title="CUSTOMER CARE">
              {CUSTOMER_CARE.map((label) => (
                <span key={label} className="type-body-sm">
                  {label}
                </span>
              ))}
            </FooterColumn>
          </div>
          <FooterColumn title="VISIT US">
            <span className="type-body-sm">{SHOP_INFO.address}</span>
            <span className="type-body-sm">{SHOP_INFO.phone}</span>
            <span className="type-body-sm">{SHOP_INFO.email}</span>
          </FooterColumn>
        </div>
        <hr className="border-on-inverse/20" />
        <p className="type-body-sm opacity-60">{SHOP_INFO.copyright}</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 lg:w-[200px] lg:gap-2.5">
      <p className="type-label opacity-60">{title}</p>
      {children}
    </div>
  );
}
