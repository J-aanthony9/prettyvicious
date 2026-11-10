/**
 * Writes the engraved frost corners to public/frost/frost-<seed>.svg.
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
