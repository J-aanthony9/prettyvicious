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
import { existsSync } from "node:fs";

const ORIGIN = process.env.ICON_ORIGIN ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? undefined;

const INK = "#0C0A0B";
const BONE = "#E9DFCE";
const ACCENT = "#A66E7A";

const SIZES = [16, 32, 48, 96, 180, 192, 512];

// Two tiers. The full emblem is too detailed to read in a browser tab, so the
// tab sizes keep the PV monogram and the emblem is used only where there is
// room for it: the iOS home screen (180) and Android (192, 512). Until
// public/brand/emblem.png exists, every size falls back to the monogram.
const EMBLEM = "public/brand/emblem.png";
const hasEmblem = existsSync(EMBLEM);
const EMBLEM_SIZES = new Set([180, 192, 512]);

console.log(
  hasEmblem
    ? "  using public/brand/emblem.png for 180, 192 and 512"
    : "  public/brand/emblem.png not found, monogram at every size",
);

/**
 * The emblem on the ink field. `scale` is the share of the tile it fills.
 * Android masks icons marked maskable to a circle that can cut into the outer
 * 20%, so the maskable render passes a smaller scale to keep the ring whole.
 */
function emblemMarkup(size, scale) {
  const box = Math.round(size * scale);
  return `
    <div id="tile" style="
      position:fixed; left:0; top:0; width:${size}px; height:${size}px;
      overflow:hidden; background:${INK};
      display:flex; align-items:center; justify-content:center;
    ">
      <div style="
        position:absolute; inset:0; pointer-events:none;
        background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(166,110,122,.18), transparent 70%);
      "></div>
      <img src="/brand/emblem.png" style="
        position:relative; width:${box}px; height:${box}px; object-fit:contain; display:block;
      " />
    </div>`;
}

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

async function render(size, html, name) {
  await page.setViewportSize({ width: size, height: size });
  await page.evaluate((html) => {
    document.body.innerHTML = html;
    document.documentElement.style.overflow = "hidden";
    document.body.style.margin = "0";
  }, html);
  // Wait for the emblem to decode, or the tile renders empty.
  await page.waitForFunction(() => {
    const img = document.querySelector("#tile img");
    return !img || (img.complete && img.naturalWidth > 0);
  });
  await page.waitForTimeout(120);
  // omitBackground keeps the alpha channel. Chromium drops it when every
  // pixel is opaque, and Next's favicon.ico parser rejects non RGBA PNGs.
  await page
    .locator("#tile")
    .screenshot({ path: `public/icons/${name}`, omitBackground: true });
  console.log(`  ${name}`);
}

for (const size of SIZES) {
  const html =
    hasEmblem && EMBLEM_SIZES.has(size) ? emblemMarkup(size, 0.86) : markup(size);
  await render(size, html, `icon-${size}.png`);
}

// The maskable variant for Android. The monogram already sits well inside
// the safe zone, so without the emblem it is the same drawing as icon-512.
await render(
  512,
  hasEmblem ? emblemMarkup(512, 0.7) : markup(512),
  "icon-maskable-512.png",
);

await browser.close();

console.log("\n  now run: python3 scripts/make-favicon.py");
