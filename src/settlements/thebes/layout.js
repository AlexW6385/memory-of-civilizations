// New Kingdom Thebes, c. 1250 BC — the layout (docs/settlements/thebes.md §2): the temple of Amun-Re at
// Karnak on its east–west axis (z = 0) with its door toward the Nile on the west — the avenue of ram sphinxes
// from the quay, the second pylon, the Great Hypostyle Hall, the third pylon, the obelisks, the inner pylons,
// the festival hall — the sacred lake south of the axis, the mudbrick enclosure; the town of houses in rows
// along streets round it, the workshop street, the market on the Nile quay. Pure data.
// Coordinates: metres, +x east, +z south, y up. The Nile runs north–south at the west edge.

export const RADIUS = 330;
export const RIVER = { x: -285, w: 70, level: -3.2, bed: -6.5 };
export const riverX = () => RIVER.x;
export const QUAY = { x: RIVER.x + RIVER.w / 2, z0: -122, z1: 140, y: 0, top: 9 };     // the stone face at x = −250; the walk 9 m wide behind it
export const QUAY_STAIRS = [0, -70, 70];                                              // z of the stairs (the first 12 m wide, on the avenue's axis)

export const ENCL = [-170, -150, 215, 175];                    // the enclosure wall's outer faces
export const ENCL_TH = 7;
export const PYLON2 = { x0: -112, x1: -98, h: 38 };
export const HALL = { x0: -98, x1: -45, z0: -52, z1: 52, wall: 3 };
export const PYLON3 = { x0: -45, x1: -31, h: 32 };
export const OBELISK1 = { x: -17, zs: [-6.5, 6.5], h: 19.5 };
export const PYLON4 = { x0: -12, x1: -2, h: 28, half: 36 };
export const OBELISK2 = { x: 4, zs: [-4.5, 4.5], h: 29.6 };
export const PYLON5 = { x0: 9, x1: 17, h: 24, half: 28 };
export const PYLON6 = { x0: 27, x1: 35, h: 20, half: 20 };
export const SANCT = [35, -22, 72, 22];                         // the sanctuary block and its chapels
export const FESTIVAL = [78, -30, 134, 30];                    // the festival hall of Thutmose III
export const LAKE = [38, 62, 166, 145];                        // 128 × 83 m
export const LAKE_Y = -2.2, LAKE_BED = -3.5;
export const MAGAZINES = [-86, -144, 60, -72];                 // the barrel-vaulted storerooms north of the hall
export const AVENUE = { x0: -244, x1: -114, rows: [-5.8, 5.8], spacing: 6.9 };
export const MARKET = [-238, 14, -194, 66];                    // the stalls on the quay
export const WORKSHOP_Z = -204;                                // the workshop street
export const TEMPLE_GATE = { x: -170, w: 8 };                  // the gateway in the enclosure's west wall

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const inRiver = (x, z) => Math.abs(x - RIVER.x) < RIVER.w / 2 + 6 && Math.hypot(x, z) < RADIUS + 5 && height(x, z) < RIVER.level - 0.3;
export const inLake = (x, z, m = 0) => inRect(LAKE, x, z, m);
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const d = Math.abs(x - RIVER.x), edge = smooth(RADIUS - 70, RADIUS - 40, r);
  let h = RIVER.bed * (1 - smooth(RIVER.w / 2 - 4, RIVER.w / 2 + 1, d)) * (1 - edge);
  // the lake: cut down inside the rectangle (the stone steps are built over the edge)
  const dl = Math.min(x - LAKE[0], LAKE[2] - x, z - LAKE[1], LAKE[3] - z);
  if (dl > -1) h = Math.min(h, LAKE_BED * smooth(-1, 1.2, dl));
  return h;
}

// ── the town: rows of lots along east–west streets ──
const ROW_D = 14, STREET_W = 4, PERIOD = 32;
export const STREET_ZS = Array.from({ length: 19 }, (_, k) => -300 + PERIOD * k);
export const LANES_X = [-206, -146, -86, -26, 34, 94, 154, 236, 266];
export const LANE_W = 3;
const X0 = -232, X1 = 300;
/** Rectangles kept free of houses. */
const RESERVED = [
  [ENCL[0] - 6, ENCL[1] - 6, ENCL[2] + 6, ENCL[3] + 6],
  [-260, -12, -166, 12],                                   // the avenue's approach
  MARKET.map((v, i) => v + (i < 2 ? -4 : 4)),
  [QUAY.x - 4, QUAY.z0, QUAY.x + QUAY.top + 2, QUAY.z1],
];
const inEncl = (x, z) => inRect(ENCL, x, z, 5);
let LOTS = null;
/**
 * The lots: { rect, front ('n' | 's'), kind ('row' | 'court' | 'villa' | 'granary' | 'workshop' | 'garden'), trade, seed, open }.
 * Rows back to back (the houses share their rear walls), the doors on the streets; lanes cut across the rows.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1250);
  const trades = ['potter', 'weaver', 'carpenter', 'mason', 'baker', 'smith', 'leather'];
  let wsi = 0, furnished = 0, shops = 0;
  for (const zs of STREET_ZS) for (const side of [-1, 1]) {
    const z0 = side < 0 ? zs - STREET_W / 2 - ROW_D : zs + STREET_W / 2, z1 = z0 + ROW_D, front = side < 0 ? 's' : 'n';
    let x = X0;
    while (x < X1) {
      // lanes break the row
      const lane = LANES_X.find((l) => x + 1 > l - LANE_W / 2 - 0.5 && x < l + LANE_W / 2 + 0.5);
      if (lane !== undefined) { x = lane + LANE_W / 2 + 0.5; continue; }
      const ws = zs === WORKSHOP_Z && x > -166 && x < 110;
      const r = rand();
      let w = ws ? 11 + Math.floor(rand() * 4) : r < 0.55 ? 5.6 + rand() * 1.2 : r < 0.85 ? 9 + rand() * 3 : r < 0.95 ? 14 + rand() * 3 : 7 + rand() * 2;
      let kind = ws ? 'workshop' : r < 0.55 ? 'row' : r < 0.85 ? 'court' : r < 0.95 ? 'villa' : 'granary';
      // a lane ahead shortens the lot to fit
      const next = LANES_X.find((l) => l - LANE_W / 2 > x && l - LANE_W / 2 < x + w + 1);
      if (next !== undefined) w = Math.max(5, next - LANE_W / 2 - 0.5 - x);
      const rect = [x, z0, x + w, z1], c = [x + w / 2, (z0 + z1) / 2];
      x += w;
      if (Math.hypot(c[0], c[1]) > RADIUS - 44) continue;
      if (RESERVED.some((q) => inRect(q, c[0], c[1], 0) || (rect[0] < q[2] && rect[2] > q[0] && rect[1] < q[3] && rect[3] > q[1]))) continue;
      if (inLake(c[0], c[1], 8) || Math.abs(c[0] - RIVER.x) < RIVER.w / 2 + 8) continue;
      if (!ws && rand() < 0.1) kind = 'garden';
      const seed = Math.floor(rand() * 1e6);
      const lot = { rect, front, kind, seed, open: false, row: zs };
      if (ws) lot.trade = trades[wsi++ % trades.length];
      // furnished and entered: every third near the temple, the workshops, the villas
      if (kind !== 'garden' && kind !== 'granary' && (ws || kind === 'villa' || (Math.hypot(c[0] - 0, c[1] - 0) < 255 && furnished++ % 3 === 0))) lot.open = true;
      LOTS.push(lot);
    }
  }
  templeLots(LOTS);
  return LOTS;
}
const SHOPS = ['bread', 'pots', 'beer', 'fruit', 'cloth', 'leather'];
/** How much detail a lot at c gets: 2 round the quay, the avenue and the hall, 1 in the middle town, 0 in the outskirts. */
const lodOf = (c) => { const d = Math.hypot(c[0] + 120, c[1]); return d < 150 ? 2 : d < 240 ? 1 : 0; };

/** The blocks inside the enclosure (the priests' houses, the temple's bakeries and gardens, docs/settlements/thebes.md §2): zones with their own rows. */
export const TEMPLE_ZONES = [[-161, -141, -90, -64], [-161, 64, -96, 166], [-92, 64, 10, 166], [64, -141, 206, -36], [138, 8, 206, 60], [173, 64, 206, 166]];
export const TEMPLE_STREETS = [];
function templeLots(out) {
  const rand = rng(1296);
  TEMPLE_STREETS.length = 0;
  TEMPLE_ZONES.forEach((z, zi) => {
    const [zx0, zz0, zx1, zz1] = z, n = Math.floor((zz1 - zz0) / PERIOD);
    const rows = [];
    for (let k = 0; k < n; k++) {
      const zs = zz0 + PERIOD * k + ROW_D + STREET_W / 2;
      TEMPLE_STREETS.push([zx0, zs - STREET_W / 2, zx1, zs + STREET_W / 2]);
      rows.push([zs - STREET_W / 2 - ROW_D, 's'], [zs + STREET_W / 2, 'n']);
    }
    if (zz1 - (zz0 + PERIOD * n) >= ROW_D) rows.push([zz0 + PERIOD * n, 'g']);
    for (const [r0, front] of rows) {
      let x = zx0;
      while (x < zx1 - 4) {
        const q = rand();
        let w = front === 'g' ? 8 + rand() * 6 : q < 0.35 ? 5.6 + rand() * 1.2 : q < 0.8 ? 9 + rand() * 3 : 12 + rand() * 3;
        if (x + w > zx1) w = zx1 - x;
        if (w < 5) break;
        const kind = front === 'g' ? 'garden' : q < 0.35 ? 'row' : q < 0.8 ? 'court' : q < 0.88 ? 'villa' : q < 0.94 ? 'granary' : 'garden';
        const rect = [x, r0, x + w, r0 + ROW_D], c = [x + w / 2, r0 + ROW_D / 2];
        x += w;
        if (kind === 'villa' && w < 12) continue;
        const open = kind !== 'garden' && kind !== 'granary' && (kind === 'villa' || out.length % 2 === 0);
        out.push({ rect, front: front === 'g' ? 's' : front, kind, seed: Math.floor(rand() * 1e6), open, row: zi, lod: 2, temple: true, shop: open && kind === 'row' && rand() < 0.3 ? 'bread' : undefined });
        void c;
      }
    }
  });
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The streets (rectangles, free of houses): the east–west streets and the lanes, outside the enclosure. */
export function streets() {
  lots();
  const out = [];
  for (const zs of STREET_ZS) {
    const r = [X0 - 4, zs - STREET_W / 2, X1, zs + STREET_W / 2];
    // the stretch of the street inside the enclosure is not a street
    if (zs > ENCL[1] - 8 && zs < ENCL[3] + 8) { out.push([r[0], r[1], ENCL[0] - 6, r[3]], [ENCL[2] + 6, r[1], r[2], r[3]]); }
    else out.push(r);
  }
  for (const lx of LANES_X) {
    const r0 = [lx - LANE_W / 2, -306, lx + LANE_W / 2, 300];
    if (lx > ENCL[0] - 6 && lx < ENCL[2] + 6) out.push([r0[0], r0[1], r0[2], ENCL[1] - 8], [r0[0], ENCL[3] + 8, r0[2], r0[3]]);
    else out.push(r0);
  }
  out.push(...TEMPLE_STREETS);
  // the promenade behind the quay, the market's lanes
  out.push([QUAY.x + 0.8, QUAY.z0 + 4, QUAY.x + 5.5, QUAY.z1 - 4]);
  return out.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2);
}

/** The ram sphinxes of the avenue (docs/settlements/thebes.md §2): { x, z, side }. */
export function sphinxes() {
  const out = [];
  for (let x = AVENUE.x0 + 4; x < AVENUE.x1; x += AVENUE.spacing) for (const z of AVENUE.rows) out.push({ x, z, side: Math.sign(z) });
  return out;
}
