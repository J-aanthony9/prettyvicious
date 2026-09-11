import type { Metadata } from "next";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import SizeChart from "@/components/shop/SizeChart";
import MeasureDiagram from "@/components/shop/MeasureDiagram";
import { BRAND, DROPS, FIT_NOTE } from "@/lib/brand";
import { HOW_TO_MEASURE, SIZE_GUIDE_TOLERANCE } from "@/lib/size-guide";

export const metadata: Metadata = {
  title: "Size guide",
  description:
    "Flat, laid-flat measurements for every size. Runs oversized: take your usual size for the relaxed fit, or size down.",
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHead
        eyebrow="Help"
        title="Size guide"
        sub={`Drop ${DROPS.current.number} tees. Measurements are flat, taken with the garment laid on a table.`}
        align="left"
      />

      {/* The refund preventer, first and unmissable. */}
      <div className="mt-12 border-l border-[color:var(--color-accent-deep)] bg-veil p-6">
        <h2 className="display text-[12px] tracking-[0.24em]">{FIT_NOTE.heading}</h2>
        <p className="dim mt-4 text-[15px] leading-[1.85]">{FIT_NOTE.body}</p>
      </div>

      <div className="mt-14">
        <SizeChart />
        <p className="mt-4 text-[13px] text-[color:var(--bone-faint)]">
          {SIZE_GUIDE_TOLERANCE}
        </p>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <h2 className="eyebrow mb-6">How to measure</h2>
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
            The quickest way to pick: lay a tee you already love flat and measure
            its chest. Match it to the chart. That beats guessing from a body
            measurement every time.
          </p>
        </div>
        <MeasureDiagram className="mx-auto w-full max-w-[320px]" />
      </div>

      <div className="rule mt-16" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="dim text-[14px]">
          Still unsure? Email{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet text-bone">
            {BRAND.supportEmail}
          </a>{" "}
          and we will help you pick.
        </p>
        <Link href={`/collections/${DROPS.current.handle}`} className="btn shrink-0">
          Shop Drop {DROPS.current.number}
        </Link>
      </div>
    </div>
  );
}
