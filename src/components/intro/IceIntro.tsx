"use client";

import { useEffect, useRef, useState } from "react";
import { ICE_INTRO_COPY } from "@/lib/brand";
import { frostCorner } from "@/components/home/frost";
import {
  SCRIPT_BOTTOM,
  SCRIPT_LETTERS,
  SCRIPT_TOP,
  SCRIPT_WIDTH,
} from "@/components/intro/script-strokes";

/*
 * The ice intro: looking at the site through a frozen window.
 *
 *   fog       0.0 to 0.6s   frost and fog creep in from the edges
 *   writing   0.6 to 2.9s   "Pretty Vicious" traced into the fog, stroke by
 *                           stroke, each stroke wiping the glass clear, with
 *                           a couple of drips running down after
 *   kiss      ~3.1s         a kiss pressed into the fog, at an angle, under
 *                           the end of "Vicious": breath clouds the glass,
 *                           then the lips press in, slightly parted
 *   prompt    from ~2.9s    "Tap to break the ice", gently pulsing
 *   taps      1st tap       cracks spread from the tap
 *             2nd tap       a bigger web of cracks
 *             3rd tap       the glass breaks into shards that fall and fade
 *
 * A tap while it is still writing finishes the writing and counts as the
 * first tap. Escape or Skip just fades it. A swipe or wheel (someone trying to scroll) fades it too, so it
 * is never a wall. Reduced motion gets a still, already-written pane that
 * fades on tap.
 *
 * Drawn on one 2D canvas. The fog texture, the cleared writing and each
 * shard are prepared once on their own offscreen canvases, so every frame
 * is a handful of image draws.
 */

const FOG_MS = 600;
const WRITE_MS = 2300;
/** How long the kiss takes to press in. */
const KISS_MS = 950;
const CRACK_MS = 200;
const FALL_MS = 1150;
const FADE_MS = 280;
/** Where the word sits, as a share of the screen height. */
const WORD_Y = 0.47;

type Phase = "fog" | "writing" | "prompt" | "shatter" | "fading";

type Point = [number, number];

type Shard = {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  spin: number;
};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  return canvas;
}

/** Fogged glass: pale haze, thicker toward the edges, mottled, with frost in the corners. */
function buildFog(w: number, h: number, dpr: number) {
  const canvas = makeCanvas(w * dpr, h * dpr);
  const g = canvas.getContext("2d")!;
  g.scale(dpr, dpr);

  const haze = g.createRadialGradient(w / 2, h * 0.44, 0, w / 2, h * 0.44, Math.hypot(w, h) * 0.6);
  // Cold blue-grey glass toward the middle, thickening to bone at the edges.
  haze.addColorStop(0, "rgba(108, 120, 133, 0.9)");
  haze.addColorStop(0.5, "rgba(136, 147, 158, 0.93)");
  haze.addColorStop(1, "rgba(206, 209, 207, 0.97)");
  g.fillStyle = haze;
  g.fillRect(0, 0, w, h);

  // Condensation: soft uneven blotches, then fine droplets.
  let seed = 9;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 160; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 8 + rand() * 46;
    const blot = g.createRadialGradient(x, y, 0, x, y, r);
    blot.addColorStop(0, `rgba(240, 242, 244, ${0.03 + rand() * 0.05})`);
    blot.addColorStop(1, "rgba(240, 242, 244, 0)");
    g.fillStyle = blot;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 420; i += 1) {
    g.fillStyle = rand() < 0.7 ? "rgba(255,255,255,0.22)" : "rgba(30,38,48,0.12)";
    g.beginPath();
    g.arc(rand() * w, rand() * h, 0.4 + rand() * 1.1, 0, Math.PI * 2);
    g.fill();
  }

  // Engraved frost gathering in the corners: the hero's own frost drawing.
  const size = Math.min(w, h) * 0.62;
  const scale = size / 300;
  g.strokeStyle = "rgba(240, 242, 238, 0.42)";
  g.lineCap = "round";
  g.lineWidth = 0.9 / scale;
  const corners: Array<[number, number, number, number, number]> = [
    [0, 0, 1, 1, 11],
    [w, 0, -1, 1, 23],
    [0, h, 1, -1, 37],
    [w, h, -1, -1, 41],
  ];
  for (const [x, y, sx, sy, s] of corners) {
    g.save();
    g.translate(x, y);
    g.scale(sx * scale, sy * scale);
    g.stroke(new Path2D(frostCorner(s)));
    g.restore();
  }
  return canvas;
}

/** A writing plan: every stroke as a polyline in screen pixels, in order. */
type Plan = {
  strokes: Array<{ points: Point[]; letter: number }>;
  total: number;
  width: number;
  /** The lowest point of the writing, drips included: the prompt sits below it. */
  bottom: number;
  drips: Array<{ letter: number; at: Point }>;
  /** Where the kiss is pressed: its centre, width and tilt. */
  kiss: { x: number; y: number; width: number; angle: number };
};

/** The kiss, tilted, tucked under the end of the word. */
function placeKiss(right: number, baseline: number, wordWidth: number) {
  const width = Math.min(Math.max(wordWidth * 0.2, 54), 118);
  return { x: right - width * 0.45, y: baseline + width * 0.44, width, angle: -0.4 };
}

/*
 * The kiss, as it prints on a fogged window: lips slightly parted in a
 * kiss, so there is a small opening in the middle and a fine line where
 * the lips meet either side of it, fine creases across each lip (where the
 * skin folds, the glass stays fogged), a few skipped specks, and lighter
 * pressure toward the corners. Drawn once at its final
 * size as a mask of where the fog is wiped.
 */
function buildKiss(width: number, dpr: number) {
  const u = width / 100;
  const W = 108 * u;
  const H = 64 * u;
  const mask = makeCanvas(W * dpr, H * dpr);
  const g = mask.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(W / 2, H * 0.44);
  g.scale(u, u);

  // Upper lip: the bow on top, its lower edge lifting into the opening.
  const upper = new Path2D(
    "M-46 3 C-40 -6 -28 -20 -13 -22 C-7 -23 -3 -18.5 0 -16 C3 -18.5 7 -23 13 -22 " +
      "C28 -20 40 -6 46 3 C36 1.6 22 0.2 9 -0.4 C6 -5.6 -6 -5.6 -9 -0.4 C-22 0.2 -36 1.6 -46 3 Z",
  );
  // Lower lip: fuller, its top edge dipping under the opening.
  const lower = new Path2D(
    "M-45 4.6 C-32 3 -20 2.2 -9 1.8 C-6 7.4 6 7.4 9 1.8 C20 2.2 32 3 45 4.6 " +
      "C38 21 22 30 0 30 C-22 30 -38 21 -44 6 Z",
  );
  g.shadowColor = "#000";
  g.shadowBlur = 2 * dpr;
  g.fillStyle = "#000";
  g.fill(upper);
  g.fill(lower);
  g.shadowBlur = 0;

  let seed = 21;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  g.globalCompositeOperation = "destination-out";
  g.lineCap = "round";
  // Lip creases: fine lines across each lip, fanning out slightly from the
  // middle, where the skin folds and the glass stays fogged.
  for (const [from, to, spread] of [
    [-1.5, -26, 0.12],
    [4, 31, 0.16],
  ] as const) {
    for (let x = -44; x <= 44; x += 1.9 + rand() * 1.6) {
      if (Math.abs(x) < 7 && rand() < 0.6) continue; // keep the opening clean
      const start = from + (to - from) * (0.12 + rand() * 0.2);
      const end = from + (to - from) * (0.5 + rand() * 0.45);
      const lean = x * spread + (rand() - 0.5) * 2;
      g.strokeStyle = `rgba(0,0,0,${0.35 + rand() * 0.4})`;
      g.lineWidth = 0.4 + rand() * 0.6;
      g.beginPath();
      g.moveTo(x, start);
      g.quadraticCurveTo(x + lean * 0.4, (start + end) / 2, x + lean, end);
      g.stroke();
    }
  }
  for (let i = 0; i < 140; i += 1) {
    g.fillStyle = `rgba(0,0,0,${0.3 + rand() * 0.5})`;
    g.beginPath();
    g.arc((rand() - 0.5) * 96, -24 + rand() * 55, 0.3 + rand() * 1.1, 0, Math.PI * 2);
    g.fill();
  }
  // Lighter pressure at the corners of the mouth.
  const corners = g.createLinearGradient(-50, 0, 50, 0);
  corners.addColorStop(0, "rgba(0,0,0,0.8)");
  corners.addColorStop(0.24, "rgba(0,0,0,0.12)");
  corners.addColorStop(0.5, "rgba(0,0,0,0)");
  corners.addColorStop(0.76, "rgba(0,0,0,0.12)");
  corners.addColorStop(1, "rgba(0,0,0,0.8)");
  g.fillStyle = corners;
  g.fillRect(-60, -30, 120, 64);
  return { mask, width: W, height: H, anchorY: H * 0.44 };
}

function scriptPlan(w: number, h: number): Plan {
  const width = Math.min(w * 0.86, 760);
  const scale = width / SCRIPT_WIDTH;
  const height = (SCRIPT_BOTTOM - SCRIPT_TOP) * scale;
  const ox = (w - width) / 2;
  const oy = WORD_Y * h - height / 2 - SCRIPT_TOP * scale;
  const strokes: Plan["strokes"] = [];
  let total = 0;
  const lowest: Point[] = [];
  SCRIPT_LETTERS.forEach((letter, index) => {
    let low: Point = [0, -Infinity];
    for (const stroke of letter) {
      const points = stroke.map(([x, y]) => [ox + x * scale, oy + y * scale] as Point);
      for (const p of points) if (p[1] > low[1]) low = p;
      strokes.push({ points, letter: index });
      for (let i = 1; i < points.length; i += 1) {
        total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
      }
    }
    lowest.push(low);
  });
  // Two drips: off the second t and the c, which sit on the baseline, well
  // clear of the kiss.
  const drips = [4, 8].map((letter) => ({ letter, at: lowest[letter] }));
  const penWidth = Math.max(5, scale * 3.1);
  const right = Math.max(...strokes.filter((s) => s.letter === 12).flatMap((s) => s.points.map((p) => p[0])));
  const kiss = placeKiss(right, Math.max(lowest[11][1], lowest[12][1]), width);
  const bottom = Math.max(oy + SCRIPT_BOTTOM * scale + penWidth * 6, kiss.y + kiss.width * 0.42);
  return { strokes, total, width: penWidth, drips, bottom, kiss };
}

/**
 * The blackletter option: the wordmark set in the site's gothic face, and a
 * broad brush that sweeps down through each letter in turn. Only where the
 * brush has passed AND a letter is does the glass clear.
 */
function blackletterPlan(w: number, h: number, dpr: number) {
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--font-pirata").trim() ||
    "'Pirata One', serif";
  const text = "Pretty Vicious";
  const letters = makeCanvas(w * dpr, h * dpr);
  const g = letters.getContext("2d")!;
  g.scale(dpr, dpr);
  let size = Math.min(w * 0.17, 132);
  g.font = `${size}px ${family}`;
  const measured = g.measureText(text).width;
  if (measured > w * 0.88) {
    size *= (w * 0.88) / measured;
    g.font = `${size}px ${family}`;
  }
  const textWidth = g.measureText(text).width;
  const x0 = (w - textWidth) / 2;
  const baseline = WORD_Y * h + size * 0.32;
  g.fillStyle = "#000";
  g.shadowColor = "#000";
  g.shadowBlur = 2;
  g.textBaseline = "alphabetic";
  g.fillText(text, x0, baseline);

  // Brush path: for each letter, two downstrokes and a lift, left to right.
  const strokes: Plan["strokes"] = [];
  let total = 0;
  let cursor = x0;
  const top = baseline - size * 0.82;
  const bottom = baseline + size * 0.22;
  [...text].forEach((ch, index) => {
    const advance = g.measureText(ch).width;
    if (ch !== " ") {
      for (const f of [0.28, 0.72]) {
        const x = cursor + advance * f;
        const points: Point[] = [
          [x - advance * 0.08, top],
          [x + advance * 0.04, (top + bottom) / 2],
          [x - advance * 0.02, bottom],
        ];
        strokes.push({ points, letter: index });
        for (let i = 1; i < points.length; i += 1) {
          total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
        }
      }
    }
    cursor += advance;
  });
  const width = Math.max(10, size * 0.42);
  const kiss = placeKiss(x0 + textWidth, baseline, textWidth);
  const planBottom = Math.max(bottom + 8, kiss.y + kiss.width * 0.42);
  return { plan: { strokes, total, width, drips: [], bottom: planBottom, kiss } as Plan, letters };
}

export default function IceIntro({
  lettering,
  onDone,
}: {
  lettering: "script" | "blackletter";
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const breakRef = useRef<(x?: number, y?: number) => void>(() => {});
  const skipRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("fog");
  const [hits, setHits] = useState(0);
  const [still] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [touch] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    root.focus({ preventScroll: true });
    document.documentElement.dataset.ice = "on";

    const w = window.innerWidth;
    const h = window.innerHeight;
    // Capped so a big phone screen stays cheap to draw. The fog is soft, so
    // the cap does not show.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d")!;
    const fog = buildFog(w, h, dpr);

    /*
     * The writing is wiped straight out of the fog on this one canvas, a few
     * short strokes per frame, so nothing full screen is redrawn while it
     * writes. The wet, darker look of wiped glass comes from a dim layer
     * sitting under the canvas (.ice-wet): wherever the fog is wiped, it
     * shows through.
     *
     * Script: the pen itself clears the fog. Blackletter: the pen is a broad
     * brush whose paint is the letter shapes (a pattern), so it only clears
     * where a letter is.
     */
    let plan: Plan;
    let paint: string | CanvasPattern = "#000";
    if (lettering === "blackletter") {
      const built = blackletterPlan(w, h, dpr);
      plan = built.plan;
      const pattern = ctx.createPattern(built.letters, "no-repeat");
      if (pattern) {
        pattern.setTransform(new DOMMatrix().scale(1 / dpr));
        paint = pattern;
      }
    } else {
      plan = scriptPlan(w, h);
    }

    // Where the pen has got to, so each frame only draws the new bit.
    let drawnLength = 0;
    let strokeIndex = 0;
    let pointIndex = 1;
    let carried = 0;
    let segmentCount = 0;
    const drips: Array<{ x: number; y: number; start: number; length: number }> = [];
    // The kiss is pressed a beat after the last letter, over KISS_MS.
    let kissAt = 0;
    let kissed = false;
    let kissBox: { x: number; y: number; size: number; under: HTMLCanvasElement } | null = null;
    let kissPrint: ReturnType<typeof buildKiss> | null = null;

    root.style.setProperty("--ice-prompt-top", `${Math.round(plan.bottom + 14)}px`);

    const penWidth = plan.width;
    const soft = lettering === "script";

    const wipeMode = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const advancePen = (target: number, now: number) => {
      wipeMode();
      ctx.strokeStyle = paint;
      // A fingertip leaves a soft, uneven edge. Shadow blur is in device
      // pixels, which is what a soft edge wants.
      ctx.shadowColor = "#000";
      ctx.shadowBlur = soft ? penWidth * 0.4 * dpr : 0;
      while (drawnLength < target && strokeIndex < plan.strokes.length) {
        const stroke = plan.strokes[strokeIndex];
        const [ax, ay] = stroke.points[pointIndex - 1];
        const [bx, by] = stroke.points[pointIndex];
        const segment = Math.hypot(bx - ax, by - ay);
        const take = Math.min(segment - carried, target - drawnLength);
        const t0 = carried / segment || 0;
        const t1 = (carried + take) / segment || 1;
        // A fingertip is never perfectly even: the width breathes a little.
        segmentCount += 1;
        ctx.lineWidth = penWidth * (0.86 + 0.28 * Math.abs(Math.sin(segmentCount * 1.7)));
        ctx.beginPath();
        ctx.moveTo(ax + (bx - ax) * t0, ay + (by - ay) * t0);
        ctx.lineTo(ax + (bx - ax) * t1, ay + (by - ay) * t1);
        ctx.stroke();
        drawnLength += take;
        carried += take;
        if (carried >= segment - 0.001) {
          carried = 0;
          pointIndex += 1;
          if (pointIndex >= stroke.points.length) {
            const letter = stroke.letter;
            strokeIndex += 1;
            pointIndex = 1;
            const next = plan.strokes[strokeIndex];
            const drip = !next || next.letter !== letter ? plan.drips.find((d) => d.letter === letter) : null;
            if (drip) {
              drips.push({
                x: drip.at[0] + (Math.sin(letter) * penWidth) / 3,
                y: drip.at[1] + penWidth * 0.3,
                start: now,
                length: penWidth * (3.2 + (letter % 3)),
              });
            }
          }
        }
      }
      ctx.shadowBlur = 0;
      if (!kissAt && strokeIndex >= plan.strokes.length) kissAt = now + 220;
    };

    /*
     * The kiss, pressed in like a real one: first a breath clouds the glass
     * around where the lips will land, then the lips press in, the print
     * growing from faint to firm. The print stays a little frosted rather
     * than wiped perfectly clear, so it reads as lips on fog, not a hole.
     * Each frame restores the glass under the kiss and redraws it at the
     * new strength, so the fade is exact.
     */
    const kissFrame = (t: number) => {
      const k = plan.kiss;
      if (!kissPrint) kissPrint = buildKiss(k.width, dpr);
      if (!kissBox) {
        const size = k.width * 2.2;
        const x = Math.max(0, Math.floor((k.x - size / 2) * dpr));
        const y = Math.max(0, Math.floor((k.y - size / 2) * dpr));
        const under = makeCanvas(size * dpr, size * dpr);
        under.getContext("2d")!.drawImage(canvas, x, y, under.width, under.height, 0, 0, under.width, under.height);
        kissBox = { x, y, size, under };
      }
      const box = kissBox;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(box.x, box.y, box.under.width, box.under.height);
      ctx.drawImage(box.under, box.x, box.y);

      // Breath builds, then settles back a little as the lips press.
      const breath = t < 0.45 ? t / 0.45 : 1 - ((t - 0.45) / 0.55) * 0.45;
      const press = ease(Math.max(0, Math.min(1, (t - 0.15) / 0.85)));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(k.x, k.y);
      ctx.rotate(k.angle);
      // Breath: the glass fogs up thicker round the mouth, then settles.
      ctx.save();
      ctx.scale(1, 0.72);
      const haze = ctx.createRadialGradient(0, 0, k.width * 0.1, 0, 0, k.width * 0.95);
      haze.addColorStop(0, `rgba(232, 236, 240, ${0.26 * breath})`);
      haze.addColorStop(1, "rgba(232, 236, 240, 0)");
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(0, 0, k.width * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (press > 0) {
        const print = kissPrint;
        const scale = 0.94 + 0.06 * press;
        ctx.scale(scale, scale);
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 0.74 * press;
        ctx.drawImage(print.mask, -print.width / 2, -print.anchorY, print.width, print.height);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    /** Presses the kiss to its finished state at once. */
    const pressKiss = () => {
      if (kissed) return;
      kissed = true;
      kissFrame(1);
    };

    /* ----- Cracks (the first two taps) -----
     * Each crack is a web of jagged rays from the tap, with a few forks and
     * some ring segments joining the rays. Its segments are sorted by how
     * far they start from the tap, so it is drawn growing outward, a few
     * segments per frame, on top of the glass, never redrawing the pane. */
    type Crack = { segs: number[][]; drawn: number; start: number; ms: number; radius: number; x: number; y: number };
    const cracks: Crack[] = [];
    let crackSeed = 7;
    const crand = () => {
      crackSeed = (crackSeed * 16807) % 2147483647;
      return crackSeed / 2147483647;
    };

    const buildCrack = (cx: number, cy: number, radius: number, rays: number, rings: number[], ms: number) => {
      const segs: number[][] = [];
      const steps = 12;
      const spokes: Point[][] = [];
      const offset = crand() * Math.PI * 2;
      for (let i = 0; i < rays; i += 1) {
        let a = offset + (i / rays) * Math.PI * 2 + (crand() - 0.5) * 0.5;
        const reach = radius * (0.55 + crand() * 0.45);
        let px = cx;
        let py = cy;
        const spoke: Point[] = [[px, py]];
        for (let k = 1; k <= steps; k += 1) {
          a += (crand() - 0.5) * 0.28;
          const r = (reach * k) / steps;
          const nx = cx + Math.cos(a) * r;
          const ny = cy + Math.sin(a) * r;
          segs.push([px, py, nx, ny, Math.hypot(px - cx, py - cy)]);
          // Now and then a short fork splits off.
          if (k > 2 && crand() < 0.16) {
            const fa = a + (crand() < 0.5 ? -1 : 1) * (0.4 + crand() * 0.4);
            const fl = reach * (0.08 + crand() * 0.14);
            segs.push([nx, ny, nx + Math.cos(fa) * fl, ny + Math.sin(fa) * fl, r]);
          }
          px = nx;
          py = ny;
          spoke.push([px, py]);
        }
        spokes.push(spoke);
      }
      for (const ring of rings) {
        const k = Math.max(1, Math.round(ring * steps));
        for (let i = 0; i < rays; i += 1) {
          if (crand() < 0.4) continue;
          const a = spokes[i][Math.min(k, spokes[i].length - 1)];
          const b = spokes[(i + 1) % rays][Math.min(k, spokes[(i + 1) % rays].length - 1)];
          segs.push([a[0], a[1], b[0], b[1], Math.hypot(a[0] - cx, a[1] - cy)]);
        }
      }
      segs.sort((m, n) => m[4] - n[4]);
      cracks.push({ segs, drawn: 0, start: performance.now(), ms, radius, x: cx, y: cy });
    };

    /** Draws whatever new crack segments have been reached. True while any is still growing. */
    const drawCracks = (now: number) => {
      let growing = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      for (const crack of cracks) {
        if (crack.drawn >= crack.segs.length) continue;
        if (crack.drawn === 0) {
          // The point of impact: a small bruise of crushed, whiter ice.
          const bruise = ctx.createRadialGradient(crack.x, crack.y, 0, crack.x, crack.y, 10);
          bruise.addColorStop(0, "rgba(255,255,255,0.7)");
          bruise.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = bruise;
          ctx.fillRect(crack.x - 10, crack.y - 10, 20, 20);
        }
        const t = Math.min(1, (now - crack.start) / crack.ms);
        const reach = ease(t) * crack.radius + 1;
        while (crack.drawn < crack.segs.length && (t >= 1 || crack.segs[crack.drawn][4] <= reach)) {
          const [x0, y0, x1, y1, d] = crack.segs[crack.drawn];
          const weight = Math.max(0.5, 1.5 - d / crack.radius);
          // A dark edge and a bright edge: a break catches light on one side.
          ctx.strokeStyle = "rgba(18, 26, 36, 0.35)";
          ctx.lineWidth = weight + 0.6;
          ctx.beginPath();
          ctx.moveTo(x0 + 0.7, y0 + 0.7);
          ctx.lineTo(x1 + 0.7, y1 + 0.7);
          ctx.stroke();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = weight;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          crack.drawn += 1;
        }
        if (crack.drawn < crack.segs.length) growing = true;
      }
      return growing;
    };

    // Condensation running down from a letter: a fine, slightly wandering
    // clear trail, thinning as it goes, with a bead of water at the end.
    // Clearing the same spot twice changes nothing, so it is simply redrawn
    // to its new length each frame.
    const drawDrips = (now: number) => {
      if (!drips.length) return;
      wipeMode();
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#000";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 1.5 * dpr;
      for (const drip of drips) {
        const t = Math.min(1, (now - drip.start) / 900);
        const reach = drip.length * ease(t);
        const steps = Math.max(2, Math.round(reach / 3));
        let px = drip.x;
        let py = drip.y;
        for (let i = 1; i <= steps; i += 1) {
          const y = drip.y + (reach * i) / steps;
          const x = drip.x + Math.sin(y * 0.09 + drip.x) * 0.9;
          ctx.lineWidth = Math.max(1.2, penWidth * (0.3 - (0.14 * i) / steps));
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
          px = x;
          py = y;
        }
        ctx.beginPath();
        ctx.ellipse(px, py, Math.max(1.6, penWidth * 0.26), Math.max(2, penWidth * 0.32), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    /** Fresh fog over the whole pane, `creep` 0..1 of the way in from the edges. */
    const paintFog = (creep: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "copy";
      ctx.globalAlpha = 1;
      ctx.drawImage(fog, 0, 0);
      if (creep < 1) {
        // A clear centre that closes up as the fog arrives.
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.45;
        const far = Math.hypot(canvas.width, canvas.height) * 0.62;
        const inner = far * (1 - ease(creep)) * 0.95;
        const mask = ctx.createRadialGradient(cx, cy, inner, cx, cy, inner + far * 0.4);
        mask.addColorStop(0, "rgba(0,0,0,0)");
        mask.addColorStop(1, "rgba(0,0,0,1)");
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = mask;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let start = performance.now();
    let current: Phase = "fog";
    let finished = false;
    const setP = (p: Phase) => {
      current = p;
      setPhase(p);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      cleanup();
      delete document.documentElement.dataset.ice;
      if (previousFocus && previousFocus !== document.body && document.contains(previousFocus)) {
        previousFocus.focus({ preventScroll: true });
      } else {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
      onDone();
    };

    const fadeOut = () => {
      if (current === "fading" || finished) return;
      cancelAnimationFrame(raf);
      setP("fading");
      delete document.documentElement.dataset.ice;
      window.setTimeout(finish, FADE_MS);
    };

    // Finish the writing at once (a tap that cannot wait).
    const completeWriting = (now: number) => {
      if (current === "fog") paintFog(1);
      advancePen(Number.POSITIVE_INFINITY, now);
      for (const d of drips) d.start = now - 900;
      drawDrips(now);
      pressKiss();
    };

    /** One frame. Returns whether anything is still moving. */
    const frame = (now: number): boolean => {
      const elapsed = now - start;
      if (current === "fog") {
        paintFog(Math.min(1, elapsed / FOG_MS));
        if (elapsed >= FOG_MS) {
          setP("writing");
          start = now;
        }
        return true;
      }
      if (current === "writing") {
        const t = Math.min(1, elapsed / WRITE_MS);
        advancePen(t >= 1 ? Number.POSITIVE_INFINITY : plan.total * t, now);
        drawDrips(now);
        if (t >= 1) {
          setP("prompt");
          start = now;
        }
        return true;
      }
      // Prompt: let the drips finish, press the kiss, grow any cracks, then
      // stop drawing altogether until the next tap.
      drawDrips(now);
      if (kissAt && now >= kissAt && !kissed) {
        const t = Math.min(1, (now - kissAt) / KISS_MS);
        kissFrame(t);
        if (t >= 1) kissed = true;
      }
      const growing = drawCracks(now);
      return growing || !kissed || drips.some((d) => now - d.start <= 900);
    };

    let running = false;
    const loop = (now: number) => {
      running = false;
      if (finished || current === "shatter" || current === "fading") return;
      if (frame(now)) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const kick = () => {
      if (running || finished) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    /* ----- Shatter ----- */
    const shatter = (tapX: number, tapY: number) => {
      cancelAnimationFrame(raf);
      running = false;
      const now = performance.now();
      if (current === "fog" || current === "writing") completeWriting(now);
      // Finish any crack still growing, so it is part of the broken pane.
      for (const crack of cracks) crack.start = now - crack.ms;
      drawCracks(now);
      setP("shatter");
      navigator.vibrate?.([30, 30, 60]);
      delete document.documentElement.dataset.ice;

      // Freeze the pane as it is, then cut it up.
      const glass = makeCanvas(canvas.width, canvas.height);
      glass.getContext("2d")!.drawImage(canvas, 0, 0);

      const rays = 13;
      const far = Math.hypot(Math.max(tapX, w - tapX), Math.max(tapY, h - tapY));
      const rings = [0.08, 0.2, 0.4, 0.7, 1.2].map((f) => f * far);
      const angles = Array.from({ length: rays }, (_, i) => (i / rays) * Math.PI * 2 + Math.sin(i * 7.3) * 0.18);
      const grid: Point[][] = angles.map((a, i) =>
        rings.map((r, j) => {
          const jitter = 1 + Math.sin(i * 3.1 + j * 1.7) * 0.12;
          const aa = a + Math.cos(i * 2.3 + j) * 0.06;
          return [tapX + Math.cos(aa) * r * jitter, tapY + Math.sin(aa) * r * jitter] as Point;
        }),
      );

      const polys: Point[][] = [];
      for (let i = 0; i < rays; i += 1) {
        const a = grid[i];
        const b = grid[(i + 1) % rays];
        polys.push([[tapX, tapY], a[0], b[0]]);
        for (let j = 0; j < rings.length - 1; j += 1) polys.push([a[j], a[j + 1], b[j + 1], b[j]]);
      }

      // Each shard is cut from just its own corner of the pane, at 1x: the
      // pieces are moving and fading, so the lower resolution never shows,
      // and it halves the drawing while they fall.
      const sd = Math.min(dpr, 1);
      const cut = (poly: Point[]): Shard | null => {
        const xs = poly.map((p) => p[0]);
        const ys = poly.map((p) => p[1]);
        const minX = Math.max(0, Math.min(...xs));
        const minY = Math.max(0, Math.min(...ys));
        const maxX = Math.min(w, Math.max(...xs));
        const maxY = Math.min(h, Math.max(...ys));
        if (maxX - minX < 1 || maxY - minY < 1) return null;
        const bw = maxX - minX;
        const bh = maxY - minY;
        const piece = makeCanvas(bw * sd, bh * sd);
        const p = piece.getContext("2d")!;
        p.scale(sd, sd);
        p.beginPath();
        poly.forEach(([x, y], k) => (k ? p.lineTo(x - minX, y - minY) : p.moveTo(x - minX, y - minY)));
        p.closePath();
        p.save();
        p.clip();
        p.drawImage(glass, minX * dpr, minY * dpr, bw * dpr, bh * dpr, 0, 0, bw, bh);
        p.restore();
        // A glint along the break, so the pieces read as glass.
        p.strokeStyle = "rgba(255,255,255,0.55)";
        p.lineWidth = 1;
        p.stroke();
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const dx = cx - tapX;
        const dy = cy - tapY;
        const dist = Math.hypot(dx, dy) || 1;
        const push = 90 + 260 * Math.max(0, 1 - dist / far);
        return {
          canvas: piece,
          x: minX,
          y: minY,
          cx: bw / 2,
          cy: bh / 2,
          vx: (dx / dist) * push,
          vy: (dy / dist) * push * 0.6 - 120,
          spin: Math.sin(cx * 0.05 + cy * 0.03) * 3.2,
        };
      };

      // The shards are cut a few at a time while the cracks run, so the tap
      // answers on the very next frame instead of after all the cutting.
      const shards: Shard[] = [];
      let next = 0;
      const cutSome = (count: number) => {
        for (let k = 0; k < count && next < polys.length; k += 1, next += 1) {
          const shard = cut(polys[next]);
          if (shard) shards.push(shard);
        }
      };

      const t0 = performance.now();
      const crack = (nowMs: number) => {
        const t = (nowMs - t0) / CRACK_MS;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(glass, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        const reach = Math.min(1, t) * rings.length;
        for (let i = 0; i < rays; i += 1) {
          ctx.moveTo(tapX, tapY);
          for (let j = 0; j < Math.min(rings.length, Math.ceil(reach)); j += 1) ctx.lineTo(grid[i][j][0], grid[i][j][1]);
        }
        for (let j = 0; j < Math.floor(reach) - 1; j += 1) {
          for (let i = 0; i < rays; i += 1) {
            ctx.moveTo(grid[i][j][0], grid[i][j][1]);
            ctx.lineTo(grid[(i + 1) % rays][j][0], grid[(i + 1) % rays][j][1]);
          }
        }
        ctx.stroke();
        cutSome(t < 1 ? 14 : polys.length);
        if (t < 1) raf = requestAnimationFrame(crack);
        else {
          root.classList.add("ice-broken");
          raf = requestAnimationFrame(fall);
        }
      };

      let fallStart = 0;
      const fall = (nowMs: number) => {
        if (!fallStart) fallStart = nowMs;
        const t = (nowMs - fallStart) / 1000;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 0.45) / (FALL_MS / 1000 - 0.45));
        for (const s of shards) {
          const x = s.x + s.vx * t;
          const y = s.y + s.vy * t + 0.5 * 2400 * t * t;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.translate(x + s.cx, y + s.cy);
          ctx.rotate(s.spin * t);
          ctx.drawImage(s.canvas, -s.cx, -s.cy, s.cx * 2, s.cy * 2);
        }
        ctx.globalAlpha = 1;
        if (nowMs - fallStart < FALL_MS) raf = requestAnimationFrame(fall);
        else finish();
      };
      raf = requestAnimationFrame(crack);
    };

    /* ----- Input ----- */
    let downAt: Point | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("[data-ice-skip]")) return;
      downAt = [event.clientX, event.clientY];
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!downAt) return;
      // A drag is someone trying to scroll: get out of their way.
      if (Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) > 14) {
        downAt = null;
        fadeOut();
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!downAt) return;
      downAt = null;
      breakRef.current(event.clientX, event.clientY);
    };
    const onWheel = () => fadeOut();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        // Focus stays on the pane and its Skip button while it is up.
        event.preventDefault();
        const skip = root.querySelector<HTMLElement>("[data-ice-skip]");
        (document.activeElement === skip ? root : (skip ?? root)).focus({ preventScroll: true });
      } else if (event.key === "Escape") fadeOut();
      else if ((event.key === "Enter" || event.key === " ") && !(event.target as HTMLElement).closest?.("[data-ice-skip]")) {
        event.preventDefault();
        breakRef.current();
      }
    };
    // A phone's address bar sliding changes only the height: ignore that.
    // A real change of width (rotation, a resized window) gets the page back.
    const onResize = () => {
      if (Math.abs(window.innerWidth - w) > 1) fadeOut();
    };

    // Three taps: a crack, a bigger web of cracks, then it breaks. Keyboard
    // presses land near the middle of the word, nudged so each is new ice.
    let hitCount = 0;
    const NUDGE: Point[] = [
      [0, 0],
      [34, -12],
      [-22, 10],
    ];
    breakRef.current = (tapX?: number, tapY?: number) => {
      if (current === "shatter" || current === "fading" || finished) return;
      if (still) {
        fadeOut();
        return;
      }
      const x = tapX ?? w / 2 + NUDGE[hitCount][0];
      const y = tapY ?? h * WORD_Y + NUDGE[hitCount][1];
      const now = performance.now();
      if (current === "fog" || current === "writing") {
        cancelAnimationFrame(raf);
        running = false;
        completeWriting(now);
        setP("prompt");
      }
      // A kiss still pressing in finishes now, so it never redraws over a crack.
      pressKiss();
      hitCount += 1;
      setHits(hitCount);
      window.clearTimeout(safety);
      safety = window.setTimeout(fadeOut, 15000);
      const short = Math.min(w, h);
      if (hitCount === 1) {
        navigator.vibrate?.(14);
        buildCrack(x, y, short * 0.34, 9, [0.35, 0.7], 190);
        kick();
      } else if (hitCount === 2) {
        navigator.vibrate?.([16, 40, 22]);
        buildCrack(x, y, Math.max(w, h) * 0.6, 13, [0.2, 0.42, 0.66], 280);
        kick();
      } else {
        shatter(x, y);
      }
    };
    skipRef.current = fadeOut;

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    function cleanup() {
      root!.removeEventListener("pointerdown", onPointerDown);
      root!.removeEventListener("pointermove", onPointerMove);
      root!.removeEventListener("pointerup", onPointerUp);
      root!.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    }

    // A safety net: whatever happens, the pane is gone within 15 seconds of
    // no input, and never strands the page.
    let safety = window.setTimeout(fadeOut, 15000);

    if (still) {
      // Reduced motion: no creeping fog, no writing, no shatter. The pane is
      // simply there, already written, and fades when tapped.
      paintFog(1);
      advancePen(Number.POSITIVE_INFINITY, performance.now());
      pressKiss();
      setP("prompt");
    } else {
      kick();
    }

    return () => {
      window.clearTimeout(safety);
      cancelAnimationFrame(raf);
      cleanup();
      delete document.documentElement.dataset.ice;
    };
    // Runs once for the life of the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prompt =
    hits === 0
      ? touch
        ? ICE_INTRO_COPY.promptTouch
        : ICE_INTRO_COPY.promptPointer
      : hits === 1
        ? ICE_INTRO_COPY.promptSecond
        : ICE_INTRO_COPY.promptThird;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Pretty Vicious. Tap, click or press Enter three times to break the ice, or press Escape to skip."
      tabIndex={-1}
      className={`ice ${phase === "fading" ? "ice-fading" : ""}`}
    >
      <div className={`ice-wet ${still ? "ice-wet-still" : ""}`} aria-hidden="true" />
      <canvas ref={canvasRef} className="ice-canvas" aria-hidden="true" />
      {phase === "prompt" ? (
        <p key={hits} className={`ice-prompt ${still ? "" : "ice-prompt-pulse"}`} aria-live="polite">
          {prompt}
        </p>
      ) : null}
      {phase !== "shatter" && phase !== "fading" ? (
        <button type="button" data-ice-skip className="ice-skip" onClick={() => skipRef.current()}>
          Skip
        </button>
      ) : null}
    </div>
  );
}
