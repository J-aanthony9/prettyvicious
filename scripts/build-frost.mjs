/**
 * Writes the engraved frost corners to public/frost/frost-<seed>.svg, and
 * the four corners of the ice intro's cover to public/frost/cover-<corner>.svg
 * (the same seeds, corners, weight and tint the intro's fog draws, so the
 * cover hands over to the fog without a seam).
 *
 *   node --experimental-strip-types scripts/build-frost.mjs
 *
 * The drawings are long path strings, so they live as static, cacheable
 * files instead of being inlined into every page's HTML. Rerun after
 * changing frostCorner() in src/components/home/frost.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { frostCorner } from "../src/components/home/frost.ts";

const SEEDS = [11, 23, 37, 41, 53, 67, 71, 83];
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "public", "frost");
fs.mkdirSync(out, { recursive: true });
for (const seed of SEEDS) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">` +
    `<path d="${frostCorner(seed)}" stroke="#DCE6EE" stroke-width="0.65" stroke-linecap="round"/></svg>\n`;
  fs.writeFileSync(path.join(out, `frost-${seed}.svg`), svg);
  console.log(`frost-${seed}.svg`, svg.length, "bytes");
}

// The intro cover's corners, already mirrored into place, drawn with a
// fixed 0.9px line however large the corner is shown.
const COVER = [
  ["tl", 11, ""],
  ["tr", 23, "translate(300 0) scale(-1 1)"],
  ["bl", 37, "translate(0 300) scale(1 -1)"],
  ["br", 41, "translate(300 300) scale(-1 -1)"],
];
for (const [corner, seed, transform] of COVER) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">` +
    `<g${transform ? ` transform="${transform}"` : ""}>` +
    `<path d="${frostCorner(seed)}" stroke="#F0F2EE" stroke-opacity="0.42" stroke-width="0.9" vector-effect="non-scaling-stroke" stroke-linecap="round"/>` +
    `</g></svg>\n`;
  fs.writeFileSync(path.join(out, `cover-${corner}.svg`), svg);
  console.log(`cover-${corner}.svg`, svg.length, "bytes");
}
