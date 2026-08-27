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
        Pretty Vicious was built by someone who spent years behind the chair.
        Long days, tired hands, and a client in front of you who leaves feeling
        like a different person. That work is art. It just never got dressed like
        it.
      </p>
      <p>
        So we made something for the people doing it. Not a uniform, and not a
        novelty tee with a cute pun on the front. Pieces with weight, cut
        relaxed, printed dark, made for the walk in and the walk out.
      </p>
      <p>
        Drop {DROPS.current.number} is the {DROPS.current.title}, for the lash
        artists, the nail techs, and the stylists. But the club was never meant
        to stop at one room. If you make something with your hands and you take
        it seriously, you already belong here.
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
