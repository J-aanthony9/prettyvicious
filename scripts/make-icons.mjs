/**
 * Renders the Pretty Vicious app mark at every size the site needs.
 *
 *   node scripts/make-icons.mjs            # expects a dev server on :3000
 *   ICON_ORIGIN=http://localhost:3014 node scripts/make-icons.mjs
 *
 * The mark is drawn inside a page served by the app, so Cormorant Garamond is
 * already loaded and self hosted. Rendering it standalone would mean fetching
 * the font from Google, which the site deliberately does not do.
 *
 * Outputs PNGs to public/icons/. Then run scripts/make-favicon.py, which
 * normalises them to RGBA, builds favicon.ico, and copies the files Next
 * reads by convention (src/app/icon.png and src/app/apple-icon.png).
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ORIGIN = process.env.ICON_ORIGIN ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? undefined;

const INK = "#0C0A0B";
const BONE = "#E9DFCE";
const ACCENT = "#A66E7A";

const SIZES = [16, 32, 48, 96, 180, 192, 512];

/**
 * One tile. Proportions are expressed as fractions of the size so every
 * render is the same drawing, except below 32px where the rule is dropped:
 * at that scale it is sub-pixel and antialiases into a smudge, and the
 * letters can afford to be bigger without it.
 */
function markup(size) {
  // Below 32px the rule is sub-pixel and antialiases into a smudge, so it
  // goes and the letters take the space instead.
  const withRule = size >= 32;
  // "PV" is a wide pair, so the constraint is width, not height. These land
  // the letters at roughly 60% of the tile with real margin at the edges.
  const font = size * (withRule ? 0.44 : 0.5);
  const ruleW = size * 0.26;
  const ruleH = Math.max(1, Math.round(size * 0.028));
  const gap = size * 0.055;
  // Cormorant is a high contrast serif: at tab size its hairlines drop below
  // one pixel and the letters grey out. The heaviest weight the site loads is
  // 500, so small sizes get a stroke instead of a heavier cut, which thickens
  // the thin strokes without shipping another font file.
  // A light stroke plus extra tracking, chosen by rendering the candidates
  // side by side: it is the only combination where P and V stay separable at
  // 16px rather than merging into one blob.
  const stroke = size <= 24 ? size * 0.012 : 0;
  const tracking = size * (size <= 24 ? 0.02 : 0.012);

  return `
    <div id="tile" style="
      position:fixed; left:0; top:0; width:${size}px; height:${size}px;
      overflow:hidden; background:${INK};
      display:flex; flex-direction:column; align-items:center; justify-content:center;
    ">
      <div style="
        position:absolute; inset:0; pointer-events:none;
        background: radial-gradient(ellipse 86% 64% at 50% 124%, rgba(166,110,122,.34), transparent 70%);
      "></div>
      <div style="
        position:relative;
        font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
        font-weight:500; color:${BONE};
        font-size:${font}px; line-height:1; letter-spacing:${tracking}px;
        white-space:nowrap;
        ${stroke ? `-webkit-text-stroke:${stroke}px ${BONE};` : ""}
        /* Grayscale antialiasing. Subpixel AA bakes red and blue fringes into
           the letterforms, which is visible on an icon at any size. */
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      ">PV</div>
      ${
        withRule
          ? `<div style="
               position:relative; margin-top:${gap}px;
               width:${ruleW}px; height:${ruleH}px; background:${ACCENT};
             "></div>`
          : ""
      }
    </div>`;
}

// --disable-lcd-text is the part that matters: without it Chromium bakes red
// and blue subpixel fringes into the letterforms, which look like colour
// artefacts once the icon is composited anywhere but an LCD at 1x.
const browser = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  args: ["--disable-lcd-text", "--force-color-profile=srgb", "--font-render-hinting=none"],
});
const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
await page.goto(ORIGIN, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.status === "loaded");

await mkdir("public/icons", { recursive: true });

for (const size of SIZES) {
  await page.setViewportSize({ width: size, height: size });
  await page.evaluate((html) => {
    document.body.innerHTML = html;
    document.documentElement.style.overflow = "hidden";
    document.body.style.margin = "0";
  }, markup(size));
  await page.waitForTimeout(120);
  // omitBackground keeps the alpha channel. Chromium drops it when every
  // pixel is opaque, and Next's favicon.ico parser rejects non RGBA PNGs.
  await page
    .locator("#tile")
    .screenshot({ path: `public/icons/icon-${size}.png`, omitBackground: true });
  console.log(`  icon-${size}.png`);
}

await browser.close();

console.log("\n  now run: python3 scripts/make-favicon.py");
