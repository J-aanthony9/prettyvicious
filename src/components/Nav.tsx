"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { DROPS } from "@/lib/brand";

const LEFT_LINKS = [
  { label: `Drop ${DROPS.current.number}`, href: `/collections/${DROPS.current.handle}` },
  { label: "Shop all", href: "/products" },
];

const RIGHT_LINKS = [
  { label: "Story", href: "/story" },
  { label: "Club", href: "/#club" },
];

export default function Nav({ cartCount }: { cartCount: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-500 ${
        scrolled
          ? "border-[color:var(--hairline)] bg-ink/88 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 sm:px-8">
        {/* Left */}
        <div className="hidden items-center gap-8 md:flex">
          {LEFT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-quiet text-[10px] uppercase tracking-[0.3em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="justify-self-start text-[10px] uppercase tracking-[0.3em] text-[color:var(--bone-dim)] md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>

        {/* Centre */}
        <Link href="/" aria-label="Pretty Vicious home" className="justify-self-center">
          <Wordmark className="text-[22px] sm:text-[26px]" />
        </Link>

        {/* Right */}
        <div className="flex items-center justify-end gap-8">
          {RIGHT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-quiet hidden text-[10px] uppercase tracking-[0.3em] md:inline-block"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="link-quiet text-[10px] uppercase tracking-[0.3em]"
          >
            Bag{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] bg-ink/97 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Wordmark className="text-[22px]" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--bone-dim)]"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <ul className="mt-10 flex flex-col gap-8 px-8">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="display text-[18px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
