import type { Metadata } from "next";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import SizeGuideTabs from "@/components/shop/SizeGuideTabs";
import { BRAND, DROPS } from "@/lib/brand";
import { GARMENT_ORDER, isGarmentKey } from "@/lib/garments";

export const metadata: Metadata = {
  title: "Size guide",
  description:
    "Flat, laid-flat measurements for every size of the oversized tee, the essential tee and the crewneck.",
};

type Props = { searchParams: Promise<{ garment?: string | string[] }> };

export default async function SizeGuidePage({ searchParams }: Props) {
  const requested = (await searchParams).garment;
  const initial = isGarmentKey(requested) ? requested : GARMENT_ORDER[0];

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHead
        eyebrow="Help"
        title="Size guide"
        sub="Measurements are flat, taken with the garment laid on a table. Pick the piece you are looking at."
        align="left"
      />

      <div className="mt-12">
        <SizeGuideTabs initial={initial} />
      </div>

      <div className="rule mt-16" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="dim text-[14px]">
          Still unsure? Email{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet break-all text-bone">
            {BRAND.supportEmail}
          </a>{" "}
          and we will help you pick.
        </p>
        <Link href={`/collections/${DROPS.current.handle}`} className="btn shrink-0">
          Shop {DROPS.current.title}
        </Link>
      </div>
    </div>
  );
}
