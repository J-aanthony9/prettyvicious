"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { DROPS } from "@/lib/brand";

const LINKS = [
  { label: "Shop", href: "/products" },
  { label: `Drop ${DROPS.current.number}`, href: `/collections/${DROPS.current.handle}` },
  { label: "About", href: "/story" },
  { label: "The Club", href: "/#club" },
];

const NAV_ITEM =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--bone-dim)] transition-colors duration-300 hover:text-bone";

export default function Nav({ cartCount }: { cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-[color:var(--hairline-soft)] bg-[rgba(12,10,11,0.82)] px-[clamp(20px,4vw,48px)] backdrop-blur-[14px]">
        <div className="hidden gap-7 md:flex">
          {LINKS.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} className={NAV_ITEM}>
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="justify-self-start text-bone md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6h18M2 11h18M2 16h18" />
          </svg>
        </button>

        <Link href="/" aria-label="Pretty Vicious home" className="justify-self-center">
          <Wordmark />
        </Link>

        <div className="flex items-center justify-end gap-6">
          {LINKS.slice(2).map((link) => (
            <Link key={link.href} href={link.href} className={`${NAV_ITEM} hidden md:inline-block`}>
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className={NAV_ITEM}>
            Bag ({cartCount})
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col gap-2 bg-ink px-[clamp(20px,4vw,48px)] py-8 md:hidden">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="text-bone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-[color:var(--hairline-soft)] py-2.5 font-[family-name:var(--font-display)] text-[34px] font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
