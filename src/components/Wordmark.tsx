import Image from "next/image";
import wordmark from "@/../public/brand/wordmark-nav.webp";
import lockup from "@/../public/brand/lockup-footer.webp";
import { BRAND } from "@/lib/brand";

/**
 * The real logo artwork, lifted from the design prototype.
 * Bone recoloured wordmark for the nav, dusty burgundy full lockup (wordmark
 * plus "Beauty is an art") for the footer.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Image
      src={wordmark}
      alt={BRAND.name}
      priority
      unoptimized
      className={`h-[30px] w-auto ${className}`}
    />
  );
}

export function Lockup({ className = "" }: { className?: string }) {
  return (
    <Image
      src={lockup}
      alt={`${BRAND.name}. ${BRAND.tagline}`}
      unoptimized
      className={`h-auto w-[min(230px,60%)] ${className}`}
    />
  );
}
