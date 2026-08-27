import Link from "next/link";
import { DROPS } from "@/lib/brand";

/**
 * The ledger strip. Reads as a record of what has shipped and what is next,
 * so the site never looks empty between drops.
 */
export default function DropLedger() {
  return (
    <section className="relative border-y border-[color:var(--hairline)] bg-veil/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-5 py-6 text-center sm:flex-row sm:gap-8 sm:px-8">
        <Link
          href={`/collections/${DROPS.current.handle}`}
          className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.34em]"
        >
          <span className="text-[color:var(--bone-faint)]">
            Drop {DROPS.current.number}
          </span>
          <span className="text-accent transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
          <span className="text-bone">{DROPS.current.title}</span>
        </Link>

        <span
          aria-hidden="true"
          className="hidden h-3 w-px bg-[color:var(--hairline)] sm:block"
        />

        <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-[color:var(--bone-faint)]">
          <span>Next</span>
          <span className="text-accent">✦</span>
          <span>{DROPS.next.title}</span>
        </p>
      </div>
    </section>
  );
}
