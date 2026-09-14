/**
 * Composes the 1200x630 share card at public/og.png.
 *
 *   node scripts/make-og.mjs                      # expects a dev server on :3000
 *   ICON_ORIGIN=http://localhost:3014 node scripts/make-og.mjs
 *
 * Share cards are landscape, the emblem is square. Scaling a 1:1 emblem into
 * a 1.91:1 frame either crops the ring off or leaves it tiny, so instead the
 * emblem sits at full height on the left and the wordmark lockup sits beside
 * it, which fills the width without distorting either.
 *
 * Source of the emblem, in order of preference:
 *   public/brand/emblem.png        the full PV emblem, transparent background
 *   public/brand/lockup-footer.webp  fallback, so the card is never broken
 *
 * Rendered inside a page served by the app so the self hosted fonts are used.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const ORIGIN = process.env.ICON_ORIGIN ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? undefined;

const INK = "#0C0A0B";
const BONE = "#E9DFCE";

const EMBLEM = "public/brand/emblem.png";
const hasEmblem = existsSync(EMBLEM);
const emblemSrc = hasEmblem ? "/brand/emblem.png" : "/brand/lockup-footer.webp";

console.log(
  hasEmblem
    ? "  using public/brand/emblem.png"
    : "  public/brand/emblem.png not found, falling back to the footer lockup",
);

const browser = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  args: ["--disable-lcd-text", "--force-color-profile=srgb", "--font-render-hinting=none"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(ORIGIN, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.status === "loaded");

await page.evaluate(
  ({ INK, BONE, emblemSrc, hasEmblem }) => {
    document.body.style.margin = "0";
    document.documentElement.style.overflow = "hidden";
    document.body.innerHTML = `
      <div id="og" style="
        position:fixed; left:0; top:0; width:1200px; height:630px; overflow:hidden;
        background:
          radial-gradient(ellipse 70% 60% at 22% 50%, rgba(166,110,122,.20), transparent 66%),
          radial-gradient(ellipse 80% 50% at 50% 120%, rgba(107,69,79,.30), transparent 68%),
          ${INK};
        display:flex; align-items:center; gap:56px; padding:0 84px; box-sizing:border-box;
      ">
        <img src="${emblemSrc}" style="
          height:${hasEmblem ? 470 : 300}px; width:auto; display:block; flex:none;
        " />
        <div style="display:flex; flex-direction:column; gap:20px; min-width:0">
          ${
            // The fallback lockup already contains the wordmark, so repeating
            // it here would print the name twice. The emblem does not.
            hasEmblem
              ? `<div style="
                   font-family: var(--font-gothic), 'Pirata One', serif;
                   font-size:78px; line-height:1; color:${BONE}; letter-spacing:.01em;
                 ">Pretty Vicious</div>`
              : ""
          }
          <div style="
            font-family: var(--font-body), system-ui, sans-serif;
            font-size:17px; font-weight:600; letter-spacing:.34em; text-transform:uppercase;
            color:rgba(233,223,206,.66);
          ">Beauty Professionals Club</div>
          <div style="
            font-family: var(--font-display), Georgia, serif;
            font-size:27px; font-style:italic; letter-spacing:.04em; color:${BONE};
          ">Alternative apparel for artists.</div>
        </div>
      </div>`;
  },
  { INK, BONE, emblemSrc, hasEmblem },
);

// Wait for the emblem itself, or the card renders with a gap where it goes.
await page.waitForFunction(() => {
  const img = document.querySelector("#og img");
  return img && img.complete && img.naturalWidth > 0;
});
await page.waitForTimeout(300);

await page.screenshot({
  path: "public/og.png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
console.log("  public/og.png (1200x630)");

await browser.close();
