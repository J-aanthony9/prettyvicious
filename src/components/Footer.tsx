import Link from "next/link";
import { Lockup } from "@/components/Wordmark";
import { BRAND, FOOTER_LINKS } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="footer-bg relative z-10 border-t border-[color:var(--hairline-soft)]">
      <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,48px)]">
        <div className="grid grid-cols-1 gap-[clamp(28px,5vw,64px)] pb-[clamp(48px,6vw,72px)] pt-[clamp(56px,7vw,84px)] sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Lockup className="mb-5" />
            <p className="max-w-[260px] text-[14px] text-[color:var(--bone-dim)]">
              {BRAND.subLabel}. Made to order, printed and shipped in the USA.
            </p>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-[18px] text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--bone-dim)]">
                {column.heading}
              </h2>
              {column.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block py-[5px] text-[14px] text-[color:var(--bone-dim)] transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    key={link.label}
                    className="block py-[5px] text-[14px] text-[color:var(--bone-faint)]"
                  >
                    {link.label}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--hairline-soft)] pb-7 pt-[22px] text-[12px] tracking-[0.1em] text-[color:var(--bone-faint)]">
          <span>
            © {BRAND.established} {BRAND.name}. {BRAND.tagline}.
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/policies/shipping" className="transition-colors duration-300 hover:text-accent">
              Shipping policy
            </Link>
            <Link href="/policies/refunds" className="transition-colors duration-300 hover:text-accent">
              Refund policy
            </Link>
            <a href={`mailto:${BRAND.supportEmail}`} className="transition-colors duration-300 hover:text-accent">
              {BRAND.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
