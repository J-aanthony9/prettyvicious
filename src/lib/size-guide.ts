/**
 * Flat, laid-flat measurements for the drop 001 tee.
 *
 * Centimetres are the source of truth because that is how the blank is
 * specified. Inches are derived at render time, which reproduces the
 * supplier's chart to the hundredth.
 *
 * Every product in a drop is on the same blank, so one chart covers the drop.
 * If a future drop mixes blanks, this becomes a per product lookup.
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
export const SIZE_GUIDE_ROWS: SizeGuideRow[] = [
  { size: "S", length: 70, shoulder: 53, chest: 56, sleeve: 20.8 },
  { size: "M", length: 72, shoulder: 55, chest: 58, sleeve: 21.5 },
  { size: "L", length: 74, shoulder: 57, chest: 60, sleeve: 22.2 },
  { size: "XL", length: 76, shoulder: 59, chest: 62, sleeve: 22.9 },
  { size: "2XL", length: 78, shoulder: 61, chest: 64, sleeve: 23.6 },
  { size: "3XL", length: 79, shoulder: 63, chest: 67, sleeve: 23.6 },
];

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
