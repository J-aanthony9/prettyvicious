import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { DROPS, ORIGIN } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our story",
  description: ORIGIN.teaser,
};

/** Verbatim, one entry per paragraph. Do not reflow or edit. */
const STORY = [
  "Pretty Vicious started in the last month of my pregnancy.",
  "Creating has always been my thing. It's what drew me to lashes, and eventually to building my own business as an esthetician.",
  "But when you're your own boss, there's no maternity leave, and the booth rent doesn't pause for a baby. So I found a new way to create, one I could do from home.",
  "I spent those final weeks pouring myself into it, and just one week after my baby boy was born, Pretty Vicious was too.",
  "This brand is for the artists behind the beauty. The ones who bet on themselves, took the leap, and turned their talent into something real.",
  "If you're holding onto a dream right now, this is your reminder that it's allowed to be real. Go after it, and trust God with the parts you can't see yet. He's already ahead of you.",
];

export default function StoryPage() {
  return (
    <PageShell
      eyebrow={ORIGIN.eyebrow}
      title={
        <>
          {ORIGIN.headingLead}{" "}
          <span className="gothic text-[1.08em] normal-case text-accent">
            {ORIGIN.headingAccent}
          </span>
          .
        </>
      }
    >
      {STORY.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {/* The MM signature's hairline dash, with tighter tracking: the wide
          spacing that suits two initials pulls a full name apart. */}
      <p className="flex items-center gap-3.5 font-[family-name:var(--font-display)] text-[18px] italic tracking-[0.12em] text-accent">
        <span
          aria-hidden="true"
          className="inline-block h-px w-3.5 bg-[color:var(--color-accent-deep)]"
        />
        {ORIGIN.signature}
      </p>

      <p>
        <Link href={`/collections/${DROPS.current.handle}`} className="btn inline-flex">
          Shop Drop {DROPS.current.number}
        </Link>
      </p>
    </PageShell>
  );
}
