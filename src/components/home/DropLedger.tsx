import Link from "next/link";
import { DROPS } from "@/lib/brand";

const ITEM =
  "flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--bone-dim)]";

/**
 * The ledger strip. The drop that is live, and a nod to what is next, so
 * the site never looks empty between drops.
 */
export default function DropLedger() {
  const next = DROPS.next;

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-[18px] gap-y-3 border-y border-[color:var(--hairline-soft)] bg-ink px-[clamp(20px,4vw,48px)] py-[15px] text-center md:justify-between">
      <Link href={`/collections/${DROPS.current.handle}`} className={`${ITEM} group py-1`}>
        Drop {DROPS.current.number}{" "}
        <span className="text-accent transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>{" "}
        <span className="text-bone">{DROPS.current.title}</span>
      </Link>
      <span className={ITEM}>
        Next <span className="tracking-normal text-accent">✦</span>{" "}
        {next ? `Drop ${next.number} · ${next.title}` : "Under wraps"}
      </span>
    </div>
  );
}
