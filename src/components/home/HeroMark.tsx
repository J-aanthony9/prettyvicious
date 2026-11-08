import { FROST_BACKGROUND, SEASON } from "@/lib/brand";
import { crackWeb } from "@/components/home/frost";
import { BAT_PATH } from "@/components/bat-path";
import { BatHalf } from "@/components/BatEngraving";

const STROKE = { stroke: "#E9DFCE", strokeWidth: 0.7 } as const;

/** The default season: the slow turning star mandala. */
function Star() {
  return (
    <svg className="hero-mark hero-turn" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <g {...STROKE}>
        <path d="M200 8 L212 188 L392 200 L212 212 L200 392 L188 212 L8 200 L188 188 Z" />
        <path d="M200 60 L208 192 L340 200 L208 208 L200 340 L192 208 L60 200 L192 192 Z" />
        <circle cx="200" cy="200" r="150" strokeDasharray="1 7" />
        <circle cx="200" cy="200" r="192" strokeDasharray="1 10" opacity=".6" />
      </g>
    </svg>
  );
}

/**
 * All Hallows: a still, engraved bat inside the same dotted rings the star
 * had, with three small bats riding the rings round at the star's pace.
 * Two layers, so only the ring turns and the big bat never tips over.
 */
function Bats() {
  return (
    <>
      <svg className="hero-mark" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <BatHalf />
        <g transform="translate(400 0) scale(-1 1)">
          <BatHalf />
        </g>
      </svg>
      <svg className="hero-mark hero-turn" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <g {...STROKE}>
          <circle cx="200" cy="200" r="150" strokeDasharray="1 7" />
          <circle cx="200" cy="200" r="192" strokeDasharray="1 10" opacity=".6" />
          <path d={BAT_PATH} transform="translate(200 28)" />
          <path d={BAT_PATH} transform="translate(348.95 286) rotate(120) scale(1.1)" />
          <path d={BAT_PATH} transform="translate(51.05 286) rotate(240) scale(0.9)" />
        </g>
      </svg>
    </>
  );
}

/**
 * Naughty List, option one: engraved frost feathering in from all four
 * corners, as on a window pane. Each corner grows from its own seed so the
 * mirroring never shows. The drawings are static files (public/frost, made
 * by scripts/build-frost.mjs) so their long paths stay out of the HTML, and
 * they are drawn as CSS masks, so the browser never mistakes decoration for
 * the page's main content when it measures load speed.
 */
const CORNERS = [
  { corner: "tl", seed: 11 },
  { corner: "tr", seed: 23 },
  { corner: "bl", seed: 37 },
  { corner: "br", seed: 41 },
] as const;

function Frost() {
  return (
    <>
      {CORNERS.map(({ corner, seed }) => (
        <div
          key={corner}
          aria-hidden="true"
          className={`hero-frost frost-mask hero-frost-${corner}`}
          style={{ "--frost-src": `url(/frost/frost-${seed}.svg)` } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/** Naughty List, option two: a faint web of cracked ice behind the mark. */
const CRACKS = crackWeb();

function Cracks() {
  return (
    <svg className="hero-mark" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <path d={CRACKS} stroke="#DCE6EE" strokeWidth={0.6} strokeLinecap="round" />
      <circle cx="200" cy="200" r="192" stroke="#DCE6EE" strokeWidth={0.6} strokeDasharray="1 10" opacity=".6" />
    </svg>
  );
}

export default function HeroMark() {
  if (SEASON === "naughty-list") return FROST_BACKGROUND === "cracks" ? <Cracks /> : <Frost />;
  return SEASON === "all-hallows" ? <Bats /> : <Star />;
}
