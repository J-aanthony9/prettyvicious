"use client";

import { useState } from "react";
import {
  SIZE_GUIDE_COLUMNS,
  SIZE_GUIDE_ROWS,
  toInches,
} from "@/lib/size-guide";

type Unit = "cm" | "in";

const CELL = "px-3 py-3 text-[14px] sm:px-4";

export default function SizeChart({ highlight }: { highlight?: string }) {
  const [unit, setUnit] = useState<Unit>("in");
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
            className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
              unit === candidate
                ? "bg-bone text-ink"
                : "text-[color:var(--bone-dim)] hover:text-bone"
            }`}
          >
            {candidate === "in" ? "Inches" : "Centimetres"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--hairline)]">
              <th scope="col" className={`${CELL} eyebrow font-semibold normal-case`}>
                Size
              </th>
              {SIZE_GUIDE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${CELL} eyebrow font-semibold normal-case`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE_ROWS.map((row) => {
              const isHighlight = highlight?.toUpperCase() === row.size;
              return (
                <tr
                  key={row.size}
                  className={`border-b border-[color:var(--hairline-soft)] ${
                    isHighlight ? "bg-[rgba(166,110,122,0.14)]" : ""
                  }`}
                >
                  <th scope="row" className={`${CELL} font-semibold text-bone`}>
                    {row.size}
                  </th>
                  {SIZE_GUIDE_COLUMNS.map((column) => (
                    <td key={column.key} className={`${CELL} tabular-nums text-[color:var(--bone-dim)]`}>
                      {format(row[column.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
