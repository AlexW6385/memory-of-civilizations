// Pure data of the houses of Parsa (no geometry; usable in workers): the lot's frame, make, door, vent and room.

export const RAND = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** The frame of a lot seen from its front: P(a, b) a along the front, b inward from it; R(a0, a1, b0, b1) the rectangle. */
export function frameOf(rect, front) {
  const [x0, z0, x1, z1] = rect;
  const P = front === 'n' ? (a, b) => [x0 + a, z0 + b] : front === 's' ? (a, b) => [x0 + a, z1 - b] : front === 'w' ? (a, b) => [x0 + b, z0 + a] : (a, b) => [x1 - b, z0 + a];
  const R = (a0, a1, b0, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const along = front === 'n' || front === 's';
  const out = front === 'n' ? [0, -1] : front === 's' ? [0, 1] : front === 'w' ? [-1, 0] : [1, 0];
  return { P, R, L: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0, out };
}

/** The house's make from its lot (rect, seed, front, kind 'court' | 'home' | 'shop', enter, trade). */
export function houseMake(el) {
  const rect = el.rect, seed = el.seed || 1, front = el.front ?? 'n', rand = RAND(seed), { L, D } = frameOf(rect, front);
  const kind = el.kind ?? (RAND(seed)() < 0.58 ? 'court' : 'home'), court = kind === 'court';
  const h = 3.3 + rand() * 0.9, da = L * (0.3 + rand() * 0.4), upper = !court && rand() < (kind === 'shop' ? 0.5 : 0.45);
  return { kind, court, h, da, upper, L, D, front, rect, seed, enter: !!el.enter, trade: el.trade ?? null };
}

/** The doorway on the street face: its middle in the world (x, z), the way out into the street, its width, and the house's height. */
export function houseDoor(el) {
  const m = houseMake(el), { P, out } = frameOf(m.rect, m.front);
  return { p: P(m.da, 0), out, w: m.kind === 'shop' ? 3.0 : m.court ? 1.5 : 1.1, a: m.da, h: m.h, m };
}

/** Where the kitchen smoke of a house leaves (x, y, z): the vent on the roof, or null (a third of the houses cook indoors without one). */
export function houseVent(el) {
  const m = houseMake(el), { P } = frameOf(m.rect, m.front), r = RAND(m.seed + 77);
  if (r() < 0.4) return null;
  const [x, z] = P(m.L * 0.7, m.court ? m.D * 0.8 : m.D * 0.35);
  return [x, m.h + (m.upper ? 2.7 : 0) + 1.25, z];
}

/** The room of an enterable house (its rectangle, for the plan's room list), or null. */
export function houseRoom(el) {
  const m = houseMake(el);
  if (!m.enter) return null;
  const { R, D } = frameOf(m.rect, m.front), bd = m.court ? D * 0.46 : D * 0.62, b0 = m.court ? D - bd : 0;
  return R(0.55, m.L - 0.55, b0 + 0.55, b0 + bd - 0.55);
}

