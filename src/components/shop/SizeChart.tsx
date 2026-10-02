"use client";

import { useState } from "react";
import type { GarmentKey } from "@/lib/garments";
import { SIZE_CHARTS, SIZE_GUIDE_COLUMNS, toInches } from "@/lib/size-guide";

type Unit = "in" | "cm";

/** Narrow padding on phones so five columns fit a 360px screen without scrolling. */
const CELL = "px-2 py-3 text-[14px] sm:px-4";
const HEAD =
  "px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--bone-dim)] sm:px-4 sm:text-[11px] sm:tracking-[0.22em]";

export default function SizeChart({ garment }: { garment: GarmentKey }) {
  const [unit, setUnit] = useState<Unit>("in");
  const rows = SIZE_CHARTS[garment];
  const format = (cm: number) =>
    unit === "cm" ? cm.toFixed(1).replace(/\.0$/, "") : toInches(cm).toFixed(2);

  return (
    <div>
      <div
        role="group"
        aria-label="Units"
        className="mb-5 inline-flex border border-[color:var(--hairline)]"
      >
        {(["in", "cm"] as Unit[]).map((candidate) => (
          <button
            key={candidate}
            type="button"
            onClick={() => setUnit(candidate)}
            aria-pressed={unit === candidate}
            className={`min-h-[44px] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
              unit === candidate ? "bg-bone text-ink" : "text-[color:var(--bone-dim)] hover:text-bone"
            }`}
          >
            {candidate === "in" ? "Inches" : "Centimetres"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Flat measurements in {unit === "in" ? "inches" : "centimetres"}
          </caption>
          <thead>
            <tr className="border-b border-[color:var(--hairline)]">
              <th scope="col" className={HEAD}>
                Size
              </th>
              {SIZE_GUIDE_COLUMNS.map((column) => (
                <th key={column.key} scope="col" className={HEAD}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-[color:var(--hairline-soft)]">
                <th scope="row" className={`${CELL} font-semibold text-bone`}>
                  {row.size}
                </th>
                {SIZE_GUIDE_COLUMNS.map((column) => (
                  <td key={column.key} className={`${CELL} tabular-nums text-[color:var(--bone-dim)]`}>
                    {format(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
