// Vienna, spring 1902 — the layout (docs/settlements/vienna.md §2). Compressed: the Secession at the middle (its front north to
// Friedrichstraße), the Naschmarkt along the Wienzeile to the west and south, the walled Wien and its bridges to the south, the
// Karlsplatz with Wagner's pavilions and the Karlskirche to the east, the Ring and the Opera to the north, tenement blocks
// round every street. Pure data. +x east, +z south.

import { subtractRects } from '../../core/build.js';

export const RADIUS = 330;
export const SEC = [-17, -40, 17, -12];
export const SEC_COURT = [-31, -54, 31, -40];
export const OPERA = [-62, -200, 52, -142];
export const KARLSKIRCHE = [235, -10];
export const CAFE = [27, -81, 51, -67];
export const KARLSPLATZ = [62, -53, 246, 30];
export const WIEN = { x0: -285, x1: 285, z0: 62, z1: 78, top: 0, bed: -3.6, water: -2.9 };
export const PAVILIONS = [[98, -22, 0], [98, 8, 0]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** East–west streets: centre z, width, x range. */
export const EW = [
  { z: -230, w: 50, x0: -330, x1: 330, name: 'ring' }, { z: -130, w: 12, x0: -276, x1: 246 }, { z: -60, w: 14, x0: -276, x1: 246 },
  { z: 40, w: 20, x0: -276, x1: 246, name: 'wienzeile' }, { z: 95, w: 16, x0: -276, x1: 246 }, { z: 175, w: 12, x0: -276, x1: 246 }, { z: 255, w: 12, x0: -276, x1: 246 },
];
/** North–south streets: centre x, width, z range. */
export const NS = [
  { x: -270, w: 12, z0: -255, z1: 261 }, { x: -195, w: 12, z0: -255, z1: 261 }, { x: -125, w: 12, z0: -255, z1: 261 },
  { x: -58, w: 14, z0: -136, z1: 261 }, { x: 58, w: 14, z0: -136, z1: 261 },
  { x: 150, w: 12, z0: -136, z1: -53 }, { x: 150, w: 12, z0: 50, z1: 261 }, { x: 240, w: 12, z0: -136, z1: -53 }, { x: 240, w: 12, z0: 50, z1: 261 },
];
export const streetRects = () => [...EW.map((s) => [s.x0, s.z - s.w / 2, s.x1, s.z + s.w / 2]), ...NS.map((s) => [s.x - s.w / 2, s.z0, s.x + s.w / 2, s.z1])];
export const onStreet = (x, z, m = 0) => streetRects().some((r) => inRect(r, x, z, m));

/** The paths of the Karlsplatz gardens: polylines with a width. */
export const PATHS = [
  { w: 3.2, pts: [[62, -7], [196, -7]] },
  { w: 2.8, pts: [[112, -53], [112, 30]] },
  { w: 2.2, pts: [[103.5, -22], [112, -22]] },
  { w: 2.6, pts: [[112, 8], [180, 8], [180, 26]] },
  { w: 2.6, pts: [[150, -45], [150, -7]] },
  { w: 2.4, pts: [[-26, -12], [-26, 15]] }, { w: 2.4, pts: [[26, -12], [26, 15]] }, { w: 2.4, pts: [[-36, 1], [36, 1]] },
];
/** The small garden behind the Secession (the Resselpark of the time): lawns, paths, benches, planes. */
export const SQUARE = [-36, -12, 36, 15];
export const nearPath = (x, z, m = 0) => PATHS.some(({ w, pts }) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(x - ax - t * dx, z - az - t * dz) < w / 2 + m) return true; } return false; });

/** The Wien: how far into the channel's footprint (positive: inside, between the walls). */
export const inChannel = (x, z, m = 0) => z > WIEN.z0 + m && z < WIEN.z1 - m && x > WIEN.x0 && x < WIEN.x1;
export const BRIDGES = [-270, -195, -125, -58, 58, 150, 240];
/** The Stadtbahn's ledge between the channel's south wall and the Rechte Wienzeile (z), its level, and the street's face. */
export const LEDGE = { z0: WIEN.z1 + 1.2, z1: 87, y: -1.4 };

// ── the blocks and their lots ────────────────────────────────────────────────
const DEPTH = 15;
const RESERVED = [[-31, -54, 31, -12], [OPERA[0] - 1, OPERA[1] - 1, OPERA[2] + 1, OPERA[3] + 1], [CAFE[0], CAFE[1], CAFE[2], CAFE[3]], KARLSPLATZ, [-18, 16, 18, 30]];
const SPECIAL = [{ rect: [-18, 16, -2, 30], front: 's', storeys: 5, kind: 'gruender', faience: true, seed: 4001, mat: 'stucco_rose' }, { rect: [-2, 16, 18, 30], front: 's', storeys: 5, kind: 'gruender', medallions: true, seed: 4002, mat: 'stucco_cream' }];
/** The cells between the streets: [x0, z0, x1, z1, edges]. */
function cells() {
  const out = [], ez = EW.map((s) => [s.z - s.w / 2, s.z + s.w / 2]).sort((a, b) => a[0] - b[0]);
  const rows = [[-296, ez[0][0]]]; for (let i = 0; i + 1 < ez.length; i++) rows.push([ez[i][1], ez[i + 1][0]]);
  for (const [z0, z1] of rows) {
    const active = NS.filter((s) => s.z0 <= z0 + 1 && s.z1 >= z1 - 1).sort((a, b) => a.x - b.x);
    const xs = [[-276 + 0, null], ...active.flatMap((s) => [[s.x - s.w / 2, 'end'], [s.x + s.w / 2, 'start']])];
    const edges = []; let start = -276 + 6;
    for (const s of active) { edges.push([start, s.x - s.w / 2]); start = s.x + s.w / 2; }
    edges.push([start, 246]);
    void xs;
    for (const [a, b] of edges) if (b - a > 20) out.push([a, z0, b, z1]);
  }
  return out;
}
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  const rand = rng(1902); LOTS = [];
  const hit = (r) => RESERVED.some((q) => !(r[2] <= q[0] || r[0] >= q[2] || r[3] <= q[1] || r[1] >= q[3]));
  for (const [x0, z0, x1, z1] of cells()) {
    if (z0 === 50 || (inRect(KARLSPLATZ, (x0 + x1) / 2, (z0 + z1) / 2) && x0 >= 60)) continue;
    const northBand = z1 <= -255 + 1, ringSouth = z0 >= -205 - 1 && z0 <= -204, ringFront = (e) => (northBand && e === 's') || (ringSouth && e === 'n');
    const edge = (e, a, b) => {
      for (let u = a; u < b - 5.5;) {
        let w = 7 + Math.floor(rand() * 6) + rand(); if (b - u - w < 6.5) w = b - u;
        const rect = e === 'n' ? [u, z0, u + w, z0 + DEPTH] : e === 's' ? [u, z1 - DEPTH, u + w, z1] : e === 'w' ? [x0, u, x0 + DEPTH, u + w] : [x1 - DEPTH, u, x1, u + w];
        u += w;
        if (hit(rect)) continue;
        const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2, r = Math.hypot(cx, cz);
        if (r > RADIUS - 42) continue;
        const ring = ringFront(e), far = Math.max(0, r - 170) / 120 + (cz > 100 || cx < -200 ? 0.25 : 0);
        const kind = ring ? 'ring' : rand() < far * 0.55 + 0.04 ? 'biedermeier' : 'gruender';
        const storeys = kind === 'ring' ? 5 + (rand() < 0.4 ? 1 : 0) : kind === 'biedermeier' ? 2 + (rand() < 0.4 ? 1 : 0) : 4 + (rand() < 0.45 ? 1 : 0) + (r < 160 && rand() < 0.2 ? 1 : 0);
        const o = { rect, front: e, kind, storeys, seed: Math.floor(rand() * 1e6), lod: r > 170 ? 1 : 0 };
        // corner lots turn a second face to the cross street
        if ((e === 'n' || e === 's') && Math.abs(rect[0] - x0) < 0.01) o.side = 'w';
        else if ((e === 'n' || e === 's') && Math.abs(rect[2] - x1) < 0.01) o.side = 'e';
        LOTS.push(o);
      }
    };
    const runs = (e, a, b) => (z0 === -53 && x0 === -51 && e === 's' ? [[a, -18], [18, b]] : [[a, b]]);
    for (const e of ringSouth ? ['n', 's', 'w', 'e'] : northBand ? ['s'] : ['n', 's', 'w', 'e']) {
      const [a, b] = e === 'n' || e === 's' ? [x0, x1] : [z0 + DEPTH, z1 - DEPTH];
      for (const [p, q] of runs(e, a, b)) edge(e, p, q);
    }
  }
  for (const s of SPECIAL) LOTS.push({ ...s, lod: 0 });
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || inRect(CAFE, x, z, m);

// ── ground, water and the paved ways ────────────────────────────────────────────────────────────
export const GROUND = 0;
export const NASCH = { x0: -250, x1: -64, rows: [{ z0: 51.2, z1: 54.4, front: 's' }, { z0: 56.8, z1: 60.0, front: 'n' }] };   // the Naschmarkt: two rows of stalls round an aisle, between the Wienzeile's kerb and the Wien's wall
export const PROMENADE = [WIEN.x0, 50, WIEN.x1, WIEN.z0 - 1.6];
export const RING_TRACKS = [-233, -227];
/** Signed distance outside the Wien's water (negative: in the channel). */
export const wet = (x, z) => (x > WIEN.x0 && x < WIEN.x1 ? Math.max(WIEN.z0 - z, z - WIEN.z1) : 20);
export const inWater = (x, z) => x > WIEN.x0 + 0.6 && x < WIEN.x1 - 0.6 && z > WIEN.z0 + 0.1 && z < WIEN.z1 - 0.1;
/** The ground: level, but for the Wien's channel (the bed between the walls) and the Stadtbahn's ledge on its south side. */
export function height(x, z) {
  if (x <= WIEN.x0 + 0.6 || x >= WIEN.x1 - 0.6) return GROUND;
  if (z > WIEN.z0 - 1.0 && z < WIEN.z1 + 1.2) return z < WIEN.z0 + 0.1 || z > WIEN.z1 - 0.1 ? (z > WIEN.z1 + 0.1 ? LEDGE.y : GROUND + WIEN.bed * smooth(WIEN.z0 + 0.1, WIEN.z0 - 0.9, z)) : WIEN.bed;
  if (z >= LEDGE.z0 && z <= LEDGE.z1 + 0.6) return LEDGE.y;
  return GROUND;
}
export const fromWater = (x, z) => Math.max(-5, Math.min(40, height(x, z) - WIEN.water));
/** The carriageways and kerbs of every street (rects), cut at the channel; bridges carry the streets over it. */
export const CHANNEL_CUT = [-WIEN.x1 - 2, WIEN.z0 - 1.6, WIEN.x1 + 2, LEDGE.z1 + 1.0];
export function paving() {
  const ring = (s) => s.name === 'ring', kerb = (s) => (ring(s) ? 7 : 2.6);
  const strips = [], carr = [];
  for (const s of EW) { const k = kerb(s); carr.push({ r: [s.x0, s.z - s.w / 2 + k, s.x1, s.z + s.w / 2 - k], ring: ring(s) }); strips.push([s.x0, s.z - s.w / 2, s.x1, s.z - s.w / 2 + k], [s.x0, s.z + s.w / 2 - k, s.x1, s.z + s.w / 2]); }
  const ewc = carr.map((c) => c.r);
  for (const s of NS) { const k = kerb(s); carr.push({ r: [s.x - s.w / 2 + k, s.z0, s.x + s.w / 2 - k, s.z1], ns: true }); strips.push([s.x - s.w / 2, s.z0, s.x - s.w / 2 + k, s.z1], [s.x + s.w / 2 - k, s.z0, s.x + s.w / 2, s.z1]); }
  const cut = (rs, holes) => rs.flatMap((r) => subtractRects(r, holes)).filter((r) => r[2] - r[0] > 0.3 && r[3] - r[1] > 0.3);
  const drive = [], walk = [];
  for (const c of carr) for (const r of cut([c.r], [...(c.ns ? ewc : []), CHANNEL_CUT])) drive.push({ r, ring: c.ring });
  let have = [CHANNEL_CUT, ...drive.map((d) => d.r)];
  for (const st of strips) for (const r of cut([st], have)) { walk.push(r); have = [...have, r]; }
  return { drive, walk };
}
