import { HOLIDAY_COPY, currentHolidayPhase } from "@/lib/holiday";

/**
 * The Christmas order-by line, near add to bag and in the bag. Renders
 * nothing outside the season. Server rendered, read per request.
 */
export default function HolidayNote({ className = "" }: { className?: string }) {
  const copy = HOLIDAY_COPY[currentHolidayPhase()];
  if (!copy) return null;
  return (
    <p
      className={`border-l-2 border-[color:var(--color-winter)] pl-3 text-[13px] leading-[1.7] tracking-[0.04em] text-bone ${className}`}
    >
      {copy.note}
    </p>
  );
}
