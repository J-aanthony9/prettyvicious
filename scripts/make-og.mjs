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
 *
 * SEASON=naughty-list makes the Naughty List card instead, at
 * public/og-naughty-list.jpg: the frozen PV with its holographic sheen on
 * the frozen stone wall, beside "Drop 003 / Naughty List / Out now".
 *
 *   SEASON=naughty-list ICON_ORIGIN=http://localhost:3014 node scripts/make-og.mjs
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
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
// Skip the homepage's ice intro and snow: this page is only a font host.
await context.addCookies([
  { name: "pv-ice-intro", value: "1", url: ORIGIN },
  { name: "pv-snow", value: "1", url: ORIGIN },
]);
const page = await context.newPage();
await page.goto(ORIGIN, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.status === "loaded");

if (process.env.SEASON === "naughty-list") {
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-ice-cover");
    document.body.style.margin = "0";
    document.documentElement.style.overflow = "hidden";
    document.body.innerHTML = `
      <div id="og" style="
        position:fixed; left:0; top:0; width:1200px; height:630px; overflow:hidden;
        background:
          radial-gradient(ellipse 60% 75% at 30% 50%, rgba(10,12,16,.25), transparent 70%),
          linear-gradient(90deg, rgba(10,12,16,.15), rgba(10,12,16,.55) 70%),
          url(/brand/ice/wall.webp) center 38% / cover no-repeat, #0a0c10;
        display:flex; align-items:center; gap:64px; padding:0 96px; box-sizing:border-box;
      ">
        <div style="position:relative; height:500px; aspect-ratio:320/387; flex:none;">
          <img src="/brand/frozen-pv.png" style="position:absolute; inset:0; width:100%; height:100%;
            filter:drop-shadow(0 0 30px rgba(190,210,228,.2)) drop-shadow(0 20px 40px rgba(0,0,0,.6));" />
          <div style="position:absolute; inset:0; mix-blend-mode:multiply; opacity:.6;
            -webkit-mask:url(/brand/frozen-pv-520.webp) center / 100% 100% no-repeat;
            background:linear-gradient(115deg, rgba(255,255,255,0) 14%, rgb(150,214,255) 30%,
              rgb(204,170,255) 42%, rgb(255,178,218) 54%, rgb(160,255,222) 66%, rgba(255,255,255,0) 82%);"></div>
          <div style="position:absolute; inset:0; mix-blend-mode:screen;
            -webkit-mask:url(/brand/frozen-pv-520.webp) center / 100% 100% no-repeat;
            background:radial-gradient(circle at 38% 34%, rgba(255,255,255,.5), rgba(255,255,255,0) 30%);"></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:18px; min-width:0">
          <div style="font-family: var(--font-body), system-ui, sans-serif; font-size:20px; font-weight:600;
            letter-spacing:.42em; text-transform:uppercase; color:rgba(233,223,206,.7);">Drop 003</div>
          <div style="font-family: var(--font-gothic), 'Pirata One', serif; font-size:132px; line-height:.9;
            letter-spacing:.01em; background:linear-gradient(180deg,#f0e9dc 35%,#c3d3e0 100%);
            -webkit-background-clip:text; background-clip:text; color:transparent;">Naughty List</div>
          <div style="display:flex; align-items:center; gap:16px; font-family: var(--font-body), system-ui, sans-serif;
            font-size:20px; font-weight:700; letter-spacing:.42em; text-transform:uppercase; color:#e9dfce;">
            <span style="color:#a66e7a; letter-spacing:0">✦</span>Out now<span style="color:#a66e7a; letter-spacing:0">✦</span>
          </div>
          <div style="margin-top:22px; font-family: var(--font-gothic), 'Pirata One', serif; font-size:34px;
            color:rgba(233,223,206,.85);">Pretty Vicious</div>
        </div>
      </div>`;
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll("#og img")].every((i) => i.complete && i.naturalWidth > 0));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "public/og-naughty-list.jpg",
    type: "jpeg",
    quality: 86,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log("  public/og-naughty-list.jpg (1200x630)");
  await browser.close();
  process.exit(0);
}

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
