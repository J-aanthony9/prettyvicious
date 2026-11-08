import { CHRISTMAS_ORDER_BY, FREE_SHIPPING_THRESHOLD, STORE_TIME_ZONE } from "@/lib/brand";

/**
 * The Christmas order-by notice, in three phases, read in the store's own
 * time zone so the switch happens at the store's midnight, not the server's.
 *
 *   "order-by"  up to and including CHRISTMAS_ORDER_BY
 *   "late"      the day after, through Christmas Day
 *   "off"       from Dec 26 (and any year after): nothing seasonal shows
 *
 * The site only ever states the date. It never promises delivery and never
 * says "guaranteed".
 */
export type HolidayPhase = "order-by" | "late" | "off";

/** "YYYY-MM-DD" for a moment, in the store's time zone. */
export function storeDate(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function holidayPhase(now: Date, orderBy: string = CHRISTMAS_ORDER_BY): HolidayPhase {
  const today = storeDate(now);
  const christmas = `${orderBy.slice(0, 4)}-12-25`;
  // Plain string comparison works because both are YYYY-MM-DD.
  if (today <= orderBy) return "order-by";
  if (today <= christmas) return "late";
  return "off";
}

/**
 * The phase for this request. Outside production, PV_NOW (an ISO date or
 * time, such as 2026-12-10) stands in for the clock, to preview each phase.
 */
export function currentHolidayPhase(): HolidayPhase {
  const override = process.env.NODE_ENV !== "production" ? process.env.PV_NOW : undefined;
  const now = override ? new Date(override.length === 10 ? `${override}T12:00:00Z` : override) : new Date();
  return holidayPhase(Number.isNaN(now.getTime()) ? new Date() : now);
}

/** "Dec 8" and "December 8", from the order-by date. */
const [year, month, day] = CHRISTMAS_ORDER_BY.split("-").map(Number);
const orderByDate = new Date(Date.UTC(year, month - 1, day, 12));
const SHORT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(orderByDate);
const LONG = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(orderByDate);

const FREE = `Free U.S. shipping over $${FREE_SHIPPING_THRESHOLD}`;

export const HOLIDAY_COPY = {
  "order-by": {
    banner: `Order by ${SHORT} for Christmas delivery · ${FREE}`,
    /** Under add to bag, and in the bag. */
    note: `Order by ${LONG} for Christmas delivery.`,
  },
  late: {
    banner: `Orders placed now will arrive after Christmas · ${FREE}`,
    note: "Orders placed now will arrive after Christmas.",
  },
  off: null,
} as const;

/** The FAQ entry and shipping policy paragraph, while the season is on. */
export const HOLIDAY_FAQ = {
  q: "When should I order for Christmas?",
  a: `Order by ${LONG} for Christmas delivery. Every piece is made to order after you buy it, so orders placed after ${LONG} will arrive after Christmas.`,
} as const;
