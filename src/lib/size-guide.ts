import type { GarmentKey } from "@/lib/garments";

/**
 * Flat, laid-flat measurements for each garment type.
 *
 * Centimetres are the source of truth because that is how the blanks are
 * specified. Inches are derived at render time, which reproduces the
 * supplier's inch charts to the hundredth.
 */

export const SIZE_GUIDE_COLUMNS = [
  { key: "length", label: "Length" },
  { key: "shoulder", label: "Shoulder" },
  { key: "chest", label: "Chest" },
  { key: "sleeve", label: "Sleeve" },
] as const;

export type SizeGuideColumn = (typeof SIZE_GUIDE_COLUMNS)[number]["key"];

export type SizeGuideRow = { size: string } & Record<SizeGuideColumn, number>;

/** Centimetres. */
export const SIZE_CHARTS: Record<GarmentKey, SizeGuideRow[]> = {
  // Snow washed oversized tee. The same blank Drop 001 used, and it matches
  // the chart Tapstitch attaches to the snow washed listings.
  "oversized-tee": [
    { size: "S", length: 70, shoulder: 53, chest: 56, sleeve: 20.8 },
    { size: "M", length: 72, shoulder: 55, chest: 58, sleeve: 21.5 },
    { size: "L", length: 74, shoulder: 57, chest: 60, sleeve: 22.2 },
    { size: "XL", length: 76, shoulder: 59, chest: 62, sleeve: 22.9 },
    { size: "2XL", length: 78, shoulder: 61, chest: 64, sleeve: 23.6 },
    { size: "3XL", length: 79, shoulder: 63, chest: 67, sleeve: 23.6 },
  ],
  "essential-tee": [
    { size: "S", length: 67.5, shoulder: 48, chest: 50, sleeve: 21.5 },
    { size: "M", length: 69.5, shoulder: 50.5, chest: 52.5, sleeve: 22 },
    { size: "L", length: 72, shoulder: 53, chest: 55, sleeve: 22.5 },
    { size: "XL", length: 74.5, shoulder: 55.5, chest: 57.5, sleeve: 23 },
    { size: "2XL", length: 76.5, shoulder: 58, chest: 60, sleeve: 23.5 },
    { size: "3XL", length: 78, shoulder: 60.5, chest: 62.5, sleeve: 24 },
  ],
  // Long sleeve, so the sleeve runs from the shoulder seam to the cuff.
  crewneck: [
    { size: "S", length: 67.5, shoulder: 45, chest: 52, sleeve: 58.5 },
    { size: "M", length: 70, shoulder: 49, chest: 57, sleeve: 60 },
    { size: "L", length: 72.5, shoulder: 55, chest: 62, sleeve: 61.5 },
    { size: "XL", length: 75, shoulder: 60, chest: 67, sleeve: 63 },
    { size: "2XL", length: 77.5, shoulder: 65, chest: 72, sleeve: 64.5 },
    { size: "3XL", length: 80, shoulder: 70, chest: 77, sleeve: 66 },
  ],
};

export const HOW_TO_MEASURE: Array<{ key: SizeGuideColumn; label: string; body: string }> = [
  {
    key: "length",
    label: "Length",
    body: "From where the shoulder seam meets the collar, straight down to the hem.",
  },
  {
    key: "shoulder",
    label: "Shoulder",
    body: "From where the shoulder seam meets the sleeve on one side, across to the other.",
  },
  {
    key: "chest",
    label: "Chest",
    body: "From the stitching just below one armpit, across to the other.",
  },
  {
    key: "sleeve",
    label: "Sleeve",
    body: "From where the shoulder seam meets the armhole, out to the cuff.",
  },
];

export const SIZE_GUIDE_TOLERANCE =
  "Allow 1 to 3 cm (up to about an inch) of variance. Every piece is cut and sewn, not stamped.";

export function toInches(cm: number): number {
  return Math.round((cm / 2.54) * 100) / 100;
}
