// Classic Maya Tikal (c. 750) — the layout (docs/settlements/maya-tikal.md §3): the Great Plaza between Temple I (east) and
// Temple II (west), the North Acropolis on its north, the Central Acropolis on its south, the small ball court, the causeways
// (Tozzer west to Temple IV, Maler north, Maudslay north-east, Méndez south-east), two reservoirs, patio groups in the forest.
// Pure data. Metres, +x east, +z south; the plaza's middle at 0, 0.

export const RADIUS = 330;
export const PLAZA = [-36, -42, 36, 42];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// the pyramids: c = centre, a = half-sizes (x, z) at the foot and at the top, H = height of the top terrace, the stair on the face `face`
export const T1 = { c: [62.1, 0], base: [16, 17.5], top: [8.5, 9.5], H: 34, tiers: 9, face: 'w', stairW: 8, foot: 34 };
export const T2 = { c: [-58.8, 0], base: [18.8, 20.5], top: [14.5, 16], H: 17.9, tiers: 3, face: 'e', stairW: 10.4, foot: -34 };
export const NA = { rect: [-50, -122, 50, -42], H: 7 };                       // the North Acropolis platform
export const NA_TEMPLE = { c: [0, -76], base: [14, 14], top: [8, 8], H: 12, tiers: 5, face: 's', stairW: 7 };    // its tallest temple (to about 33 m with its shrine)
export const NA_SMALL = [[-38, -56, 'e'], [38, -56, 'w'], [-34, -94, 'e'], [34, -94, 'w'], [-12, -108, 's'], [12, -108, 's']];
export const CA = { rect: [-58, 46, 40, 128], H: 5.2 };                       // the Central Acropolis platform
export const BALL = { alley: [46, 22, 54, 40], mound: 5 };
export const T4 = { c: [-262, 0], base: [30, 30], top: [13, 13], H: 40, tiers: 9, face: 'e', stairW: 8 };   // Temple IV, brought in
// causeways: polylines, width, height
export const CAUSEWAYS = [
  { id: 'tozzer', pts: [[-36, 33], [-224, 33], [-224, 6]], w: 14 },
  { id: 'maler', pts: [[36, -30], [100, -30], [100, -300]], w: 8 },
  { id: 'maudslay', pts: [[100, -90], [250, -200]], w: 8 },
  { id: 'mendez', pts: [[64, 44], [230, 180]], w: 8 },
];
export const CW_H = 0.9;
export const RESERVOIRS = [
  { id: 'palace', c: [-5, 205], a: 38, b: 24, rot: 0.2, bed: -3.4, water: -1.5 },
  { id: 'temple', c: [180, 20], a: 30, b: 22, rot: -0.3, bed: -3.2, water: -1.5 },
];
export const resDist = (R, x, z) => {                       // < 0 inside the oval
  const dx = x - R.c[0], dz = z - R.c[1], c = Math.cos(R.rot), s = Math.sin(R.rot), u = dx * c + dz * s, v = -dx * s + dz * c;
  return (Math.hypot(u / R.a, v / R.b) - 1) * Math.min(R.a, R.b);
};
export const inReservoir = (x, z, m = 0) => RESERVOIRS.some((R) => resDist(R, x, z) < m);
/** Distance of a point from a polyline segment. */
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
export const onCauseway = (x, z, m = 0) => CAUSEWAYS.some((c) => { for (let i = 0; i + 1 < c.pts.length; i++) if (segD(x, z, c.pts[i], c.pts[i + 1]) < c.w / 2 + m) return true; return false; });
/** The monumental core: no patio groups inside. */
export const CORE = [-120, -140, 140, 150];
export const inCore = (x, z, m = 0) => inRect(CORE, x, z, m) || Math.hypot(x + 262, z) < 70 + m;

let GROUPS = null;
/** Patio groups { rect, platform h, shrine, houses: [{ c, w, d, dir, seed, kitchen }], seed } on a 38 m grid, not on the core, the causeways or the reservoirs. */
export function groups() {
  if (GROUPS) return GROUPS;
  GROUPS = [];
  const rand = rng(750);
  for (let gx = -300; gx < 300; gx += 38) for (let gz = -300; gz < 300; gz += 38) {
    const x0 = gx + 3 + rand() * 4, z0 = gz + 3 + rand() * 4, w = 24 + rand() * 4, d = 20 + rand() * 4, cx = x0 + w / 2, cz = z0 + d / 2;
    const far = Math.hypot(Math.abs(cx) + w / 2, Math.abs(cz) + d / 2);
    if (far > RADIUS - 26) continue;
    if (inCore(cx, cz, 14) || inReservoir(cx, cz, 28)) continue;
    if ([[x0, z0], [x0 + w, z0], [x0, z0 + d], [x0 + w, z0 + d], [cx, cz]].some(([x, z]) => onCauseway(x, z, 6))) continue;
    const dense = 1 - smooth(120, 300, Math.hypot(cx, cz)) * 0.75;
    if (rand() > 0.85 * dense + 0.1) continue;
    const houses = [], hw = 4.8 + rand() * 1.4, hd = 3.2 + rand() * 0.6;
    // houses on the north, south and west sides of the patio, the shrine on the east
    houses.push({ c: [cx - w / 2 + hd / 2 + 1.6, cz + (rand() - 0.5) * 3], w: hd, d: hw, dir: 'z', seed: Math.floor(rand() * 1e6), kitchen: rand() < 0.35, door: 'e' });
    houses.push({ c: [cx + (rand() - 0.5) * 4 - 1, z0 + hd / 2 + 1.6], w: hw, d: hd, dir: 'x', seed: Math.floor(rand() * 1e6), kitchen: rand() < 0.2, door: 's' });
    if (rand() < 0.8) houses.push({ c: [cx + (rand() - 0.5) * 4 - 1, z0 + d - hd / 2 - 1.6], w: hw, d: hd, dir: 'x', seed: Math.floor(rand() * 1e6), kitchen: rand() < 0.2, door: 'n' });
    GROUPS.push({ rect: [x0, z0, x0 + w, z0 + d], h: 0.7 + rand() * 0.5, shrine: [x0 + w - 5, cz], houses, seed: Math.floor(rand() * 1e6) });
  }
  return GROUPS;
}
// the groups sit on a 38 m grid (one at most to a cell, never leaving it): a point only needs the nine cells about it (the relief, the cover
// and the planting ask these a million times)
let CELLS = null;
const cellAt = (i, j) => {
  if (!CELLS) { CELLS = new Array(32 * 32).fill(null); for (const g of groups()) CELLS[Math.floor((g.rect[0] + 300) / 38) * 32 + Math.floor((g.rect[1] + 300) / 38)] = g; }
  return i < 0 || j < 0 || i > 31 || j > 31 ? null : CELLS[i * 32 + j];
};
/** The first group of the nine cells about (x, z) for which f(group) is truthy. */
const anyNear = (x, z, f) => {
  const i = Math.floor((x + 300) / 38), j = Math.floor((z + 300) / 38);
  for (let a = i - 1; a <= i + 1; a++) for (let b = j - 1; b <= j + 1; b++) { const g = cellAt(a, b); if (g && f(g)) return true; }
  return false;
};
export const inGroup = (x, z, m = 0) => anyNear(x, z, (g) => inRect(g.rect, x, z, m));
export const nearHouse = (x, z, m) => anyNear(x, z, (g) => g.houses.some((h) => Math.abs(x - h.c[0]) < (h.dir === 'x' ? h.w : h.d) / 2 + m + 1 && Math.abs(z - h.c[1]) < (h.dir === 'x' ? h.d : h.w) / 2 + m + 1));
/** Distance (m) to the nearest patio group's rectangle (large when far): the ground is levelled under and about the groups. */
export const groupDist = (x, z) => { let m = 1e9; anyNear(x, z, (g) => { const r = g.rect, dx = Math.max(r[0] - x, 0, x - r[2]), dz = Math.max(r[1] - z, 0, z - r[3]); if (dx < 30 && dz < 30) m = Math.min(m, Math.hypot(dx, dz)); return false; }); return m; };
