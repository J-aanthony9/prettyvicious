import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { BRAND, DROPS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our story",
  description: "Pretty Vicious was built behind the chair. Alternative apparel for artists.",
};

export default function StoryPage() {
  return (
    <PageShell eyebrow="The origin" title="It Started Behind the Chair.">
      <p>
        Pretty Vicious was born in the rooms where beauty really gets made. The
        suites, the studios, the after-hours. Drop {DROPS.current.number} is
        for the professionals. The brand doesn&apos;t stop there.
      </p>
      <p>Tees today, more to come as the club grows.</p>

      <p className="flex items-center gap-3.5 font-[family-name:var(--font-display)] text-[16px] italic tracking-[0.32em] text-accent">
        <span
          aria-hidden="true"
          className="inline-block h-px w-3.5 bg-[color:var(--color-accent-deep)]"
        />
        {BRAND.ownerInitials}
      </p>

      <p>
        <Link href={`/collections/${DROPS.current.handle}`} className="btn inline-flex">
          Shop Drop {DROPS.current.number}
        </Link>
      </p>
    </PageShell>
  );
}
