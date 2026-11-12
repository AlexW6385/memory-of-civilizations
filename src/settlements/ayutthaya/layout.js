// Ayutthaya about 1687 — the layout (docs/settlements/ayutthaya.md §2): the city island in the loop of the river, a grid of brick-faced
// canals across it, the great river on its west and south, the royal wat (Wat Phra Si Sanphet) in the north with the palace west of it,
// stilt houses along the canals, the floating houses moored on the river, the floating market on its reach below the palace.
// Compressed from several kilometres to this disc. Pure data. +x east, +z south.

export const RADIUS = 330;
export const WATER = -0.8, BED = -2.3, LAND = 0;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The island's dry land (the rest outside it is country, with the river along its west and south). */
export const ISLAND = [-235, -250, 300, 225];
/** The great river: west and south of the island, as two bands; its banks slope gently (no walls). */
export const RIVER_W = [-330, -330, -235, 330];
export const RIVER_S = [-330, 225, 330, 330];
/** The canals, brick-faced (rects x0, z0, x1, z1; 8 m wide), with names for the town's plans. */
export const CANALS = [
  { id: 'north', rect: [-235, -270, 300, -250] },        // the old river's loop on the north, 20 m
  { id: 'z1', rect: [-235, -82, 300, -74] },
  { id: 'z2', rect: [-235, 60, 300, 68] },
  { id: 'x1', rect: [-96, -250, -88, -82] },
  { id: 'x2', rect: [150, -250, 158, 225] },
  { id: 'x3', rect: [-150, -74, -142, 225] },
  { id: 'x4', rect: [40, 68, 48, 225] },
];
export const BRIDGES = [
  // a brick bridge in the axis of the wat's gate, and others where the ways cross the canals ({ rect (the canal's width over the bridge), dir ('x' or 'z' the way's direction), kind })
  { c: [10, -78], dir: 'z', kind: 'brick' }, { c: [-92, -140], dir: 'x', kind: 'brick' }, { c: [-146, 10], dir: 'x', kind: 'hurdle' },
  { c: [154, -20], dir: 'x', kind: 'hurdle' }, { c: [154, 120], dir: 'x', kind: 'brick' }, { c: [44, 150], dir: 'x', kind: 'hurdle' },
  { c: [-60, 64], dir: 'z', kind: 'brick' }, { c: [100, 64], dir: 'z', kind: 'hurdle' }, { c: [220, 64], dir: 'z', kind: 'brick' },
  { c: [100, -78], dir: 'z', kind: 'hurdle' }, { c: [220, -78], dir: 'z', kind: 'hurdle' }, { c: [-190, -78], dir: 'z', kind: 'hurdle' },
  { c: [-190, 64], dir: 'z', kind: 'hurdle' },
];
export const onBridge = (x, z, m = 0) => BRIDGES.some((b) => (b.dir === 'z' ? inRect([b.c[0] - 3 - m, b.c[1] - 8 - m, b.c[0] + 3 + m, b.c[1] + 8 + m], x, z) : inRect([b.c[0] - 8 - m, b.c[1] - 3 - m, b.c[0] + 8 + m, b.c[1] + 3 + m], x, z)));

/** The royal wat's compound, the palace's, and the pieces of both (docs §4). */
export const WAT = { wall: [-80, -185, 130, -95], gate: [10, -95], axisX: 10 };
export const PLATFORM = { cloister: [-34, -158, 54, -122], chedis: [[-14, -140], [10, -140], [34, -140]], mandapa: [[-2, -140], [22, -140]], y: 0.8, w: 14, h: 36 };
export const WIHAN = [62, -147, 94, -133];
export const BELL = [108, -143, 116, -135];
export const PRASAT = [-62, -148, -46, -132];
export const UBOSOT = [76, -118, 109, -103];
export const PALACE = { wall: [-226, -240, -100, -100], halls: [[-210, -230, -150, -208], [-196, -196, -128, -172], [-212, -150, -164, -126]] };
/** The floating market's reach (the river by the palace) and the moorings along the river's east bank. */
export const MARKET = [-300, -150, -246, 60];

/** Distance onto land from the river's bank (negative in the river). */
function riverW(x) { return x + 235; }
function riverS(z) { return 225 - z; }
export function wetRiver(x, z) { return Math.min(riverW(x), riverS(z)); }
function wetCanal(x, z) {
  let w = 99;
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, dx = Math.max(a - x, 0, x - c1), dz = Math.max(b - z, 0, z - d);
    w = Math.min(w, dx || dz ? Math.hypot(dx, dz) : -Math.min(x - a, c1 - x, z - b, d - z));
  }
  return w;
}
/** How far onto dry land (negative inside water): rivers and canals. */
export function wet(x, z) {
  const rim = RADIUS - 30 - Math.hypot(x, z);
  let w = Math.min(wetRiver(x, z) / 8, 99);        // a gentle slope: the river's bank spreads over 8 m
  const wc = wetCanal(x, z);
  if (wc < 90) w = Math.min(w, wc);
  return Math.min(w, rim);
}
export const inWater = (x, z) => (wetRiver(x, z) < -1 || wetCanal(x, z) < -0.5) && Math.hypot(x, z) < RADIUS - 30;
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const wr = wetRiver(x, z), wc = wetCanal(x, z);
  let h = LAND;
  if (wr < 6) h = Math.min(h, BED + (LAND - BED) * smooth(-14, 6, wr) * 1.0);
  if (wc < 0.5) h = Math.min(h, BED + (LAND - BED) * smooth(-0.5, 0.5, wc));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r)) + 0;
}
export const isCanalFloor = (x, z) => wetCanal(x, z) < 0.5;

// ── the houses: along the canals and the river, fronts to the water ────────────────────────────────────────────────
let LOTS = null;
/** { rect, seed, front ('n'|'s'|'e'|'w': toward the water or lane), kind ('plain'|'big'|'small'), shop }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1687);
  const keep = (rect) => {
    const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!inRect(ISLAND, cx, cz, -14) || Math.hypot(cx, cz) > RADIUS - 44) return false;
    if (inRect(WAT.wall, cx, cz, 8) || inRect(PALACE.wall, cx, cz, 8)) return false;
    if (inRect(UBOSOT, cx, cz, 10) || onBridge(cx, cz, 5)) return false;
    for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [cx, cz]]) if (wetCanal(px, pz) < 3.5 || wetRiver(px, pz) < 10) return false;
    return true;
  };
  const place = (rect, front, row) => {
    if (!keep(rect) || (row && rand() < 0.2)) return;
    if (LOTS.some((l) => l.rect[0] < rect[2] + 0.9 && l.rect[2] > rect[0] - 0.9 && l.rect[1] < rect[3] + 0.9 && l.rect[3] > rect[1] - 0.9)) return;
    const w = rect[2] - rect[0], d = rect[3] - rect[1];
    const depth = front === 'n' || front === 's' ? d : w, across = front === 'n' || front === 's' ? w : d;
    const shop = !row && depth >= 6 && across >= 5 && rand() < 0.34;
    LOTS.push({ rect, front, seed: Math.floor(rand() * 1e6), kind: shop ? 'shop' : w * d >= 42 ? 'big' : w * d < 33 ? 'small' : 'plain', row });
  };
  // rows beside the E–W canals (the houses' fronts to the south or north: toward the canal)
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, ew = c1 - a > d - b;
    for (const row of [0, 1]) for (const side of [-1, 1]) {
      if (ew) {
        const off = 7 + row * 17;
        for (let x = a + 4; x < c1 - 8;) {
          const w = 5 + Math.floor(rand() * 4), dp = 5 + Math.floor(rand() * 3), step = w + 1.6 + (rand() < 0.08 ? 4 : 0);
          const z = side < 0 ? b - off - dp : d + off;
          place([x, z, x + w, z + dp], side < 0 ? 's' : 'n', row);
          x += step;
        }
      } else {
        const off = 7 + row * 17;
        for (let z = b + 4; z < d - 8;) {
          const w = 5 + Math.floor(rand() * 3), dp = 5 + Math.floor(rand() * 4), step = dp + 1.6 + (rand() < 0.08 ? 4 : 0);
          const x = side < 0 ? a - off - w : c1 + off;
          place([x, z, x + w, z + dp], side < 0 ? 'e' : 'w', row);
          z += step;
        }
      }
    }
  }
  // along the river's east bank (the bank road runs between them and the water) and the south bank
  for (let z = -230; z < 215;) { const w = 5 + Math.floor(rand() * 3), dp = 5 + Math.floor(rand() * 3); place([-235 + 12, z, -235 + 12 + w, z + dp], 'w', 0); z += dp + 1.4 + (rand() < 0.1 ? 4 : 0); }
  for (let x = -220; x < 290;) { const w = 5 + Math.floor(rand() * 4), dp = 5 + Math.floor(rand() * 3); place([x, 225 - 12 - dp, x + w, 225 - 12], 's', 0); x += w + 1.4 + (rand() < 0.1 ? 4 : 0); }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The strips of the ways on foot along the canals' banks and the river's, cut where they would cross water. */
function cut(r, rects) {
  let parts = [r];
  const ew = r[2] - r[0] > r[3] - r[1];
  for (const q of rects) {
    const next = [];
    for (const p of parts) {
      if (!(p[0] < q[2] + 1.2 && p[2] > q[0] - 1.2 && p[1] < q[3] + 1.2 && p[3] > q[1] - 1.2)) { next.push(p); continue; }
      if (ew) { if (q[0] - 1.2 > p[0] + 2) next.push([p[0], p[1], q[0] - 1.2, p[3]]); if (q[2] + 1.2 < p[2] - 2) next.push([q[2] + 1.2, p[1], p[2], p[3]]); }
      else { if (q[1] - 1.2 > p[1] + 2) next.push([p[0], p[1], p[2], q[1] - 1.2]); if (q[3] + 1.2 < p[3] - 2) next.push([p[0], q[3] + 1.2, p[2], p[3]]); }
    }
    parts = next;
  }
  return parts;
}
let PATHS = null;
/** The ways on foot: earth paths along the canals' banks (3 m wide, 2 m from the water), cut at the canals, and the river-bank road: { r, weight }. */
export function paths() {
  if (PATHS) return PATHS;
  const out = [], water = CANALS.map((c) => c.rect);
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, ew = c1 - a > d - b;
    for (const s of [-1, 1]) for (const r of cut(ew ? [a + 2, s < 0 ? b - 5 : d + 2, c1 - 2, s < 0 ? b - 2 : d + 5] : [s < 0 ? a - 5 : c1 + 2, b + 2, s < 0 ? a - 2 : c1 + 5, d - 2], water)) out.push({ r, weight: 1 });
  }
  for (const r of cut([-235 + 2, -240, -235 + 6, 215], water)) out.push({ r, weight: 1.2 });
  return (PATHS = out);
}
/** The bridges as links between the strips either bank. */
export function bridgeLinks() {
  return BRIDGES.map((b) => (b.dir === 'z' ? { a: [b.c[0], b.c[1] - 7.5], b: [b.c[0], b.c[1] + 7.5], w: 2.4, kind: 'bridge', weight: 1.4 } : { a: [b.c[0] - 7.5, b.c[1]], b: [b.c[0] + 7.5, b.c[1]], w: 2.4, kind: 'bridge', weight: 1.4 }));
}
export const onPath = (x, z, m = 0) => paths().some((p) => inRect(p.r, x, z, m));
