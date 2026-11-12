// Baroque Rome about 1670 — the layout (docs/settlements/baroque-rome.md §2): St Peter's at the west
// facing east, Bernini's piazza before it — the straight piazza retta and the oval with its two
// colonnades, the obelisk and two fountains; the Vatican Palace to the north; the Borgo's houses to
// the east between the Borgo Vecchio and Borgo Nuovo, the Passetto wall running to Castel
// Sant'Angelo; the Tiber and the Ponte Sant'Angelo; the Vatican gardens on the rising ground west.
// Distances compressed (the Borgo is ~900 m long). Pure data. +x east, +z south.

export const RADIUS = 380;
export const CROSSING = [-210, 0];
export const FRONT_X = -82;                                  // the east front of the basilica
export const FLOOR = 3;                                      // the church's floor above the piazza (Bernini's steps)
export const OVAL = { c: [40, 0], ax: 70, bz: 95 };
export const RETTA = [-78, -50, -28, 50];
export const PALACE = [-150, -175, -70, -112];
export const SISTINE = [-205, -138, -165, -118];
export const GARDEN = [-285, 84, -195, 150];                  // the Vatican gardens' parterre, south-west of the church
export const CASTEL = { c: [172, -60], r: 22 };
export const TIBER = { x: 268, w: 64, level: -5, bed: -8 };
export const BORGO = [-14, 14];                              // the Borgo Nuovo and Borgo Vecchio (z)
// The Borgo's fronts (docs/settlements/baroque-rome.md §5): three rows of palazzi and houses east of the oval,
// the spina's two rows back to back with an alley between them, the Borgo Nuovo (z -26..-12) and Borgo Vecchio
// (z 10..24) on either side; three lanes cross the spina.
export const BORGO_X = [132, 228];
export const LANES = [[159, 162], [194, 197]];
export const ROW_DEFS = [
  { id: 'N', rect: [132, -12, 228, -1.5], face: 'n' },     // the spina's north row, facing the Borgo Nuovo
  { id: 'S', rect: [132, 1.5, 228, 10], face: 's' },       // the spina's south row, facing the Borgo Vecchio
  { id: 'V', rect: [132, 24, 228, 38], face: 'n', lanes: [[180, 183]] },   // the south side of the Borgo Vecchio
];
const PAL_H = [5.0, 5.4, 4.6, 3.4], CAS_H = [3.9, 3.4, 3.2, 2.9];
let ROWS = null;
export function rows() {
  if (ROWS) return ROWS;
  ROWS = [];
  const TRADES = ['grocer', 'baker', 'cloth', 'wine', 'apothecary', 'osteria', 'cobbler', 'grocer', 'baker', 'cloth', 'wine', 'osteria'];
  let seed = 4000, shops = 0;
  for (const def of ROW_DEFS) {
    const rand = rng(seed += 17), lanes = [...(def.id === 'V' ? def.lanes : LANES)].sort((a, b) => a[0] - b[0]);
    const spans = []; let x = def.rect[0];
    for (const [a, b] of lanes) { spans.push([x, a]); x = b; } spans.push([x, def.rect[2]]);
    const units = [];
    for (const [a, b] of spans) {
      let cur = a;
      while (b - cur > 0.01) {
        const rem = b - cur, pal = rem >= 16 && rand() < 0.5;
        let w = pal ? 17 + rand() * 7 : 7 + rand() * 3.2;
        if (rem - w < 7) w = rem;
        const kind = w >= 14 ? 'palazzo' : 'casa', storeys = kind === 'palazzo' ? 3 + (rand() < 0.45 ? 1 : 0) : 3 + (rand() < 0.5 ? 1 : 0);
        const hs = kind === 'palazzo' ? PAL_H : CAS_H;
        // u runs along the face: from the east end for a north face (x falls), from the west for a south face
        const u0 = def.face === 'n' ? def.rect[2] - (cur + w) : cur - def.rect[0];
        const un = { x0: cur, x1: cur + w, u0, w, kind, storeys, H: hs.slice(0, storeys).reduce((p, q) => p + q, 0), seed: Math.floor(rand() * 1e6), trade: TRADES[shops % TRADES.length], madonna: kind === 'casa' && rand() < 0.4, flip: rand() < 0.5, altana: kind === 'palazzo' && rand() < 0.4, fountain: false, awning: kind === 'casa' && rand() < 0.4, cat: rand() < 0.3, birdcage: rand() < 0.2 };
        if (kind === 'casa') shops++;
        units.push(un); cur += w;
      }
    }
    // a wall fountain in one house of the north and the south-Vecchio rows; two houses in three with a shop can be entered
    const casas = units.filter((u) => u.kind === 'casa' && u.w >= 7.2);
    if (def.id !== 'S' && casas[1]) { casas[1].fountain = true; casas[1].madonna = false; }
    casas.forEach((u, i) => { if (!u.fountain && i % 3 !== 2) u.open = true; });
    ROWS.push({ ...def, units });
  }
  return ROWS;
}
/** A point in a row's own frame (u along the face as the units' u0, inward metres from the front) in the world, and the yaw of a figure facing out of the front. */
export function frontPt(row, u, inward) {
  const r = row.rect;
  return row.face === 'n' ? { at: [r[2] - u, r[1] + inward], out: 0 } : { at: [r[0] + u, r[3] - inward], out: Math.PI };
}
export const inRow = (x, z, m = 0) => ROW_DEFS.some((r) => inRect(r.rect, x, z, m));
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const tiberX = (z) => TIBER.x + 14 * Math.sin(z / 110);
export const inTiber = (x, z) => Math.abs(x - tiberX(z)) < TIBER.w / 2 + 6 && height(x, z) < TIBER.level - 0.3;
export const inOval = (x, z, m = 0) => ((x - OVAL.c[0]) / (OVAL.ax * 1.18 + m)) ** 2 + ((z - OVAL.c[1]) / (OVAL.bz * 1.15 + m)) ** 2 < 1;
export const inBasilica = (x, z, m = 0) => inRect([CROSSING[0] - 70, -75, FRONT_X + 10, 75], x, z, m);
export function height(x, z) {
  const d = Math.abs(x - tiberX(z)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const river = TIBER.bed * smooth(TIBER.w / 2 + 6, TIBER.w / 2 - 6, d);
  const hill = 9 * smooth(-290, -400, x);
  return (river + hill) * (1 - edge);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1667);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 12) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 9 + rand() * 2, d = 9 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || cx < -150 || inBasilica(cx, cz, 8) || inOval(cx, cz, 8) || inRect(RETTA, cx, cz, 8) || inRect(PALACE, cx, cz, 10) || inRect(SISTINE, cx, cz, 10)
      || Math.hypot(cx - CASTEL.c[0], cz - CASTEL.c[1]) < CASTEL.r * 1.5 + 28 || Math.abs(cx - tiberX(cz)) < TIBER.w / 2 + 12
      || BORGO.some((b) => Math.abs(cz - b) < 6 && cx > 100) || Math.abs(cz - CASTEL.c[1]) < 9 && cx > 100 || Math.abs(cz + 158) < 6 && cx > -70 && cx < CASTEL.c[0]
      || Math.abs((cz + 420) % 60 - 30) < 3 || Math.abs((cx + 420) % 72 - 36) < 3 && Math.abs(cz) > 30 || inRow(cx, cz, 5) || rand() < 0.08) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(0, height(cx, cz)), foot: -0.3, storeys: 3 + (rand() < 0.5 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: rand() < 0.75, fronted: Math.hypot(cx - 175, cz) < 115 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The ways walked: the oval (less the obelisk and the fountains), the piazza retta, the mouth of the oval, the Borgo's two streets, the alley and the lanes. */
export function walkRects() {
  const R = [], [ox, oz] = OVAL.c, holes = [[ox - 7, oz - 7, ox + 7, oz + 7], [ox - 8, oz - 50, ox + 8, oz - 34], [ox - 8, oz + 34, ox + 8, oz + 50]];
  const cut = (r) => { let list = [r]; for (const h of holes) list = list.flatMap((q) => (q[0] < h[2] && q[2] > h[0] && q[1] < h[3] && q[3] > h[1] ? [[q[0], q[1], q[2], h[1]], [q[0], h[3], q[2], q[3]], [q[0], Math.max(q[1], h[1]), h[0], Math.min(q[3], h[3])], [h[2], Math.max(q[1], h[1]), q[2], Math.min(q[3], h[3])]].filter((a) => a[2] - a[0] > 0.5 && a[3] - a[1] > 0.5) : [q])); return list; };
  for (let z = -80; z < 80; z += 8) { const e = Math.sqrt(1 - ((z + 4) / 88) ** 2), x0 = Math.max(ox - 64 * e, -54), x1 = ox + 64 * e; for (const q of cut([x0, z, x1, z + 8])) R.push({ r: q, weight: 1.2, market: 0.2, kind: 'street' }); }
  R.push({ r: [-54, -50, -28, 50], weight: 1, market: 0.1, kind: 'street' });
  R.push({ r: [100, -26, 134, 24], weight: 1.4, market: 0.6, kind: 'street' });
  R.push({ r: [134, -26, 226, -12], weight: 1.6, market: 0.7, kind: 'street' }, { r: [134, 10, 226, 24], weight: 1.6, market: 0.7, kind: 'street' });
  R.push({ r: [134, -1.5, 226, 1.5], weight: 0.4, market: 0.2, kind: 'lane' });
  for (const [a, b] of LANES) R.push({ r: [a, -12, b, 10], weight: 0.5, market: 0.2, kind: 'lane' });
  R.push({ r: [180, 24, 183, 38], weight: 0.4, market: 0.2, kind: 'lane' });
  return R;
}
