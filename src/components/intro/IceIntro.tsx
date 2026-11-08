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
 *   writing   0.6 to 2.0s   "Pretty Vicious" traced into the fog, stroke by
 *                           stroke, each stroke wiping the glass clear, with
 *                           a couple of drips running down after
 *   prompt    from ~2.0s    "Tap to break the ice", gently pulsing
 *   shatter   ~1.3s         cracks run out from the tap, the glass breaks
 *                           into shards that fall and fade
 *
 * A tap at any point goes straight to the shatter. Escape or Skip just
 * fades it. A swipe or wheel (someone trying to scroll) fades it too, so it
 * is never a wall. Reduced motion gets a still, already-written pane that
 * fades on tap.
 *
 * Drawn on one 2D canvas. The fog texture, the cleared writing and each
 * shard are prepared once on their own offscreen canvases, so every frame
 * is a handful of image draws.
 */

const FOG_MS = 600;
const WRITE_MS = 1400;
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
};

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
  // Two drips: off the second t and the o, which sit on the baseline.
  const drips = [4, 10].map((letter) => ({ letter, at: lowest[letter] }));
  const penWidth = Math.max(5, scale * 3.1);
  const bottom = oy + SCRIPT_BOTTOM * scale + penWidth * 6;
  return { strokes, total, width: penWidth, drips, bottom };
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
        total += bottom - top;
      }
    }
    cursor += advance;
  });
  const width = Math.max(10, size * 0.42);
  return { plan: { strokes, total, width, drips: [], bottom: bottom + 8 } as Plan, letters };
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
      advancePen(plan.total, now);
      for (const d of drips) d.start = now - 900;
      drawDrips(now);
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      if (current === "fog") {
        paintFog(Math.min(1, elapsed / FOG_MS));
        if (elapsed >= FOG_MS) {
          setP("writing");
          start = now;
        }
      } else if (current === "writing") {
        const t = Math.min(1, elapsed / WRITE_MS);
        advancePen(plan.total * t, now);
        drawDrips(now);
        if (t >= 1) {
          setP("prompt");
          start = now;
        }
      } else if (current === "prompt") {
        // Let the last drips finish running, then stop drawing altogether.
        drawDrips(now);
        if (drips.every((d) => now - d.start > 900)) return;
      }
      raf = requestAnimationFrame(frame);
    };

    /* ----- Shatter ----- */
    const shatter = (tapX: number, tapY: number) => {
      cancelAnimationFrame(raf);
      const now = performance.now();
      if (current === "fog" || current === "writing") completeWriting(now);
      setP("shatter");
      navigator.vibrate?.(28);
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

    breakRef.current = (x = w / 2, y = h * WORD_Y) => {
      if (current === "shatter" || current === "fading" || finished) return;
      if (still) {
        fadeOut();
        return;
      }
      shatter(x, y);
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
    const safety = window.setTimeout(fadeOut, 15000);

    if (still) {
      // Reduced motion: no creeping fog, no writing, no shatter. The pane is
      // simply there, already written, and fades when tapped.
      paintFog(1);
      advancePen(plan.total, performance.now());
      setP("prompt");
    } else {
      raf = requestAnimationFrame(frame);
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

  const prompt = touch ? ICE_INTRO_COPY.promptTouch : ICE_INTRO_COPY.promptPointer;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Pretty Vicious. Tap, click or press Enter to enter the site."
      tabIndex={-1}
      className={`ice ${phase === "fading" ? "ice-fading" : ""}`}
    >
      <div className={`ice-wet ${still ? "ice-wet-still" : ""}`} aria-hidden="true" />
      <canvas ref={canvasRef} className="ice-canvas" aria-hidden="true" />
      {phase === "prompt" ? (
        <p className={`ice-prompt ${still ? "" : "ice-prompt-pulse"}`}>{prompt}</p>
      ) : null}
      {phase !== "shatter" && phase !== "fading" ? (
        <button type="button" data-ice-skip className="ice-skip" onClick={() => skipRef.current()}>
          Skip
        </button>
      ) : null}
    </div>
  );
}
