import { ANNOUNCEMENT } from "@/lib/brand";

export default function AnnouncementBar() {
  return (
    <div className="relative z-30 border-b border-[color:var(--hairline-soft)] bg-wine">
      <p className="mx-auto max-w-7xl px-5 py-2.5 text-center text-[10px] uppercase tracking-[0.34em] text-[color:var(--bone-dim)] sm:text-[11px]">
        {ANNOUNCEMENT}
      </p>
    </div>
  );
}
