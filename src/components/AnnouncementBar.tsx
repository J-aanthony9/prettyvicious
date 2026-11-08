import { ANNOUNCEMENT } from "@/lib/brand";
import { HOLIDAY_COPY, currentHolidayPhase } from "@/lib/holiday";

/** The Christmas order-by line while it applies, the free shipping line otherwise. */
export default function AnnouncementBar() {
  const holiday = HOLIDAY_COPY[currentHolidayPhase()];
  return (
    <div className="relative z-40 bg-accent px-4 py-2.5 text-center text-[11px] font-bold uppercase leading-normal tracking-[0.22em] text-[#171012]">
      {holiday ? holiday.banner : ANNOUNCEMENT}
    </div>
  );
}
