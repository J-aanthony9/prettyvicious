import Link from "next/link";
import { Lockup } from "@/components/Wordmark";
import { BRAND, FOOTER_LINKS } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 overflow-hidden border-t border-[color:var(--hairline)] bg-veil-deep/70">
      <div className="underglow" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Lockup className="items-start" />
            <p className="dim mt-7 max-w-xs text-[13px]">
              {BRAND.subLabel}. Made to order, printed and shipped in the USA.
            </p>
            <p className="eyebrow mt-7">Established {BRAND.established}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_LINKS.map((column) => (
              <div key={column.heading}>
                <h3 className="eyebrow mb-5">{column.heading}</h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link href={link.href} className="link-quiet text-[13px]">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-[color:var(--bone-faint)]">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rule mt-16" />

        <div className="mt-8 flex flex-col gap-5 text-[11px] text-[color:var(--bone-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {BRAND.establishedYear} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/policies/shipping" className="link-quiet">
              Shipping policy
            </Link>
            <Link href="/policies/refunds" className="link-quiet">
              Refund policy
            </Link>
            <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet">
              {BRAND.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
