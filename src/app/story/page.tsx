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
        Pretty Vicious was born in the world where beauty actually gets made:
        the suites, the studios, the after-hours appointments. Drop{" "}
        {DROPS.current.number} is for the professionals. The brand doesn&apos;t
        stop there.
      </p>
      <p>Tees today, more to come as the club grows.</p>

      <div className="rule my-4 w-24" />

      <p className="display text-[10px] tracking-[0.5em]">{BRAND.ownerInitials}</p>

      <p className="mt-6">
        <Link href={`/collections/${DROPS.current.handle}`} className="btn inline-flex">
          Shop Drop {DROPS.current.number}
        </Link>
      </p>
    </PageShell>
  );
}
