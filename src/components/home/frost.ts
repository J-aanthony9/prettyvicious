/**
 * Engraved ice for the Naughty List hero, drawn as SVG path data on the
 * server. A seeded random keeps every render identical, so nothing is
 * computed in the browser and nothing shifts between visits.
 */

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Frost grown from a corner at 0,0 into the square 0..300, the way ice
 * ferns feather across a window pane: a handful of long, gently curving
 * spines reaching in from the two edges, each lined with short needles
 * swept forward, longest near the root and fading to nothing at the tip.
 * Needles never branch twice, which keeps it feathered rather than webbed.
 * Mirror it for the other corners.
 */
export function frostCorner(seed = 11): string {
  const rand = seeded(seed);
  const parts: string[] = [];

  const fern = (
    x: number,
    y: number,
    angle: number,
    length: number,
    needleBase: number,
    forks: number,
  ) => {
    const step = 4;
    const steps = Math.round(length / step);
    // Each spine curls one way, a little more toward its tip, like frost.
    const curl = (rand() < 0.5 ? -1 : 1) * (0.012 + rand() * 0.022);
    let px = x;
    let py = y;
    let a = angle;
    let side = rand() < 0.5 ? -1 : 1;
    const spine: string[] = [`M${r1(px)} ${r1(py)}`];
    const forkAt = forks > 0 ? Math.round(steps * (0.3 + rand() * 0.3)) : -1;
    for (let i = 0; i < steps; i += 1) {
      const t = i / steps;
      a += curl * (0.5 + t) + (rand() - 0.5) * 0.06;
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      spine.push(`L${r1(px)} ${r1(py)}`);
      if (i === forkAt) {
        fern(px, py, a - curl * 30 + (rand() < 0.5 ? -1 : 1) * (0.45 + rand() * 0.2), length * (0.45 + rand() * 0.2), needleBase * 0.8, forks - 1);
      }
      if (i < 1) continue;
      // Needles alternate sides, swept forward, finer toward the tip.
      const reach = needleBase * Math.pow(1 - t, 0.9) * (0.6 + rand() * 0.7);
      if (reach < 1.2) continue;
      side = -side;
      const na = a + side * (0.5 + rand() * 0.25);
      parts.push(`M${r1(px)} ${r1(py)} l${r1(Math.cos(na) * reach)} ${r1(Math.sin(na) * reach)}`);
    }
    parts.push(spine.join(" "));
  };

  // Spines crowd into the corner, fanned across it, and reach inward.
  for (let i = 0; i < 9; i += 1) {
    const along = rand() * 130;
    const fromLeftEdge = i % 2 === 0;
    const x = fromLeftEdge ? 0 : along;
    const y = fromLeftEdge ? along : 0;
    const angle = (i / 8) * (Math.PI / 2) * 0.9 + 0.08 + (rand() - 0.5) * 0.25;
    fern(x, y, angle, 90 + rand() * 130, 8 + rand() * 6, 1);
  }
  return parts.join(" ");
}

/**
 * A faint web of cracked ice radiating from the centre of a 400 square:
 * jittered rays, joined here and there by short ring segments.
 */
export function crackWeb(seed = 3): string {
  const rand = seeded(seed);
  const rays = 13;
  const rings = [46, 92, 140, 182];
  const points: Array<Array<[number, number]>> = [];
  const parts: string[] = [];

  for (let i = 0; i < rays; i += 1) {
    const base = (i / rays) * Math.PI * 2 + (rand() - 0.5) * 0.3;
    const line: Array<[number, number]> = [[200, 200]];
    let angle = base;
    for (const radius of rings) {
      angle += (rand() - 0.5) * 0.16;
      line.push([200 + Math.cos(angle) * radius, 200 + Math.sin(angle) * radius]);
    }
    points.push(line);
    parts.push(line.map(([x, y], j) => `${j ? "L" : "M"}${r1(x)} ${r1(y)}`).join(" "));
  }
  for (let ring = 1; ring < rings.length + 1; ring += 1) {
    for (let i = 0; i < rays; i += 1) {
      if (rand() < 0.45) continue;
      const [ax, ay] = points[i][ring];
      const [bx, by] = points[(i + 1) % rays][ring];
      const mx = (ax + bx) / 2 + (rand() - 0.5) * 10;
      const my = (ay + by) / 2 + (rand() - 0.5) * 10;
      parts.push(`M${r1(ax)} ${r1(ay)} Q${r1(mx)} ${r1(my)} ${r1(bx)} ${r1(by)}`);
    }
  }
  return parts.join(" ");
}
