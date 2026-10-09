import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { CATEGORY_LINKS, CUSTOMER_CARE, SHOP_INFO } from "./nav";

/** 푸터 (Figma: Footer · MobileFooter) — 데스크톱 4단, 모바일 1단 */
export function ShopFooter() {
  return (
    <footer className="bg-inverse text-on-inverse">
      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-20 lg:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-20">
          <div className="flex flex-col gap-2 lg:flex-1 lg:gap-3">
            <BrandLogo height={60} tone="outline" />
            <p className="type-body-sm opacity-80">{SHOP_INFO.description}</p>
            <p className="type-body-sm opacity-60">{SHOP_INFO.copyright}</p>
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
