"use client";

import { useRef, useState } from "react";
import SizeChart from "@/components/shop/SizeChart";
import MeasureDiagram from "@/components/shop/MeasureDiagram";
import { FIT_NOTES } from "@/lib/brand";
import { GARMENTS, GARMENT_ORDER, type GarmentKey } from "@/lib/garments";
import { HOW_TO_MEASURE, SIZE_GUIDE_TOLERANCE } from "@/lib/size-guide";

/**
 * One chart per garment, behind tabs that fit a phone in a single row.
 * The chosen tab is written to the URL (?garment=), so a product page can
 * link straight to its own chart and a refresh keeps it.
 */
export default function SizeGuideTabs({ initial }: { initial: GarmentKey }) {
  const [active, setActive] = useState<GarmentKey>(initial);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const fitNote = FIT_NOTES[active];

  const select = (garment: GarmentKey, focus = false) => {
    setActive(garment);
    const url = new URL(window.location.href);
    url.searchParams.set("garment", garment);
    window.history.replaceState(null, "", url);
    if (focus) tabs.current[GARMENT_ORDER.indexOf(garment)]?.focus();
  };

  // Arrow keys move between tabs, the standard tablist behaviour.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = GARMENT_ORDER.indexOf(active);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = GARMENT_ORDER[(index + step + GARMENT_ORDER.length) % GARMENT_ORDER.length];
    select(next, true);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Garment"
        onKeyDown={onKeyDown}
        className="grid grid-cols-3 border border-[color:var(--hairline)]"
      >
        {GARMENT_ORDER.map((garment, index) => {
          const selected = garment === active;
          return (
            <button
              key={garment}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${garment}`}
              aria-selected={selected}
              aria-controls="size-guide-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(garment)}
              className={`min-h-[48px] px-2 py-3 text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.14em] transition-colors duration-300 sm:tracking-[0.22em] ${
                index > 0 ? "border-l border-[color:var(--hairline)]" : ""
              } ${selected ? "bg-bone text-ink" : "text-[color:var(--bone-dim)] hover:text-bone"}`}
            >
              {GARMENTS[garment].tab}
            </button>
          );
        })}
      </div>

      <div
        id="size-guide-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="mt-10"
      >
        <h2 className="display text-[clamp(1.1rem,3vw,1.4rem)]">{GARMENTS[active].label}</h2>

        {fitNote ? (
          <div className="mt-6 border-l border-[color:var(--color-accent-deep)] bg-veil p-6">
            <h3 className="display text-[12px] tracking-[0.24em]">{fitNote.heading}</h3>
            <p className="dim mt-4 text-[15px] leading-[1.85]">{fitNote.body}</p>
          </div>
        ) : null}

        <div className="mt-8">
          <SizeChart garment={active} />
          <p className="mt-4 text-[13px] text-[color:var(--bone-faint)]">{SIZE_GUIDE_TOLERANCE}</p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <h3 className="eyebrow mb-6">How to measure</h3>
            <ol className="flex flex-col gap-5">
              {HOW_TO_MEASURE.map((item, index) => (
                <li key={item.key} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-bone">{item.label}</p>
                    <p className="dim mt-1 text-[14px] leading-[1.75]">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="dim mt-8 text-[14px] leading-[1.8]">
              The quickest way to pick: lay a piece you already love flat and
              measure its chest. Match it to the chart. That beats guessing from a
              body measurement every time.
            </p>
          </div>
          <MeasureDiagram
            kind={active === "crewneck" ? "crewneck" : "tee"}
            className="mx-auto w-full max-w-[320px]"
          />
        </div>
      </div>
    </div>
  );
}
