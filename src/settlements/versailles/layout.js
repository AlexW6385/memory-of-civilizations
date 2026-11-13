// Versailles about 1690 — the layout (docs/settlements/versailles.md §2): the château on its rise
// facing west over the gardens — the central block with the Hall of Mirrors, the north and south
// wings, the courts opening east; the water parterre, the Latona fountain, the Tapis Vert, the Apollo
// fountain and the Grand Canal down the axis; the bosquets either side; the Place d'Armes and the
// town east with its three avenues. Compressed (the gardens run some 3 km). Pure data. +x east, +z south.

export const RADIUS = 420;
export const AXIS_Z = 0;
export const CHATEAU = [0, -55, 40, 55];
export const LOGIS = [40, -38, 92, 38];
export const MARBLE = [52, -12, 74, 12], MARBLE_RISE = 0.85;     // the Marble Court, raised over the Royal Court
export const WINGS = [[8, -200, 46, -55], [8, 55, 46, 200]];
export const PARTERRE = [-70, -55, -4, 55];
export const LATONA = [-120, 0];
export const TAPIS = [-300, -22, -140, 22];
export const APOLLO = [-320, 0];
// the canal's eastern reach; it is cut by the settlement's edge at a landing (end), its cross-arm lying beyond
export const CANAL = { x0: -340, w: 40, cross: -390, crossW: 24, end: -362 };
export const CHAPEL = [50, -106, 74, -64];
export const PLACE = [100, -70, 210, 70];
export const RISE = 6;
// the parterres de broderie north and south of the water parterre, the lawns of Latona, the hornbeam walls of the walks
export const BRODERIE = [[-68, -124, -8, -68], [-68, 68, -8, 124]];
export const LAWNS = [[-140, 10, -72, 34], [-140, -34, -72, -10]];
export const HEDGE_Z = 36;
// the first floor (§1c): the Hall of Mirrors along the garden front (bays 4–20 of its 25), the Salons of War and Peace,
// the King's Grand Apartment running east from the Salon of War into the block's extension, the Ambassadors' Staircase
// in the court north of the Royal Court (its rect is the hall inside its walls; the fronts stand outside it)
export const EXT = [40, -55, 49, -38], STAIR = [49.6, -54.4, 76.4, -40.6], FY = 14.3;
export const STATE_ROOMS = [
  ['hall of mirrors', [0.5, -37, 10, 37], FY], ['salon of war', [0.5, -50.2, 12, -38.6], FY], ['salon of peace', [0.5, 38.6, 12, 50.2], FY],
  ['salon of apollo', [13.3, -48.7, 21.7, -39.3], FY], ['salon of mercury', [22.9, -48.7, 30.1, -39.3], FY], ['salon of mars', [31.3, -48.7, 38.5, -39.3], FY],
  ['salon of diana', [39.7, -48.7, 46.9, -39.3], FY], ['salon of venus', [39.7, -54.1, 46.9, -49.9], FY],
  ['ambassadors staircase landing', [49.8, -54.2, 51.6, -40.8], FY], ['ambassadors staircase vestibule', [71.6, -54.2, 76.2, -40.8], RISE + 0.06],
];
export const LATONA_Y = RISE * 0.352;
// the service yards (docs/settlements/versailles.md §5d): two levelled terraces behind the hornbeam walls either side of the Latona walk, entered by the
// gate in each wall at x = -104 — the gardeners', fountain-keepers', sculptors' and guards' lodgings and workshops of the gardens
export const YARD_Y = 3.55;
export const YARDS = [[-121, 40, -87, 84], [-121, -84, -87, -40]];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));                 // the ground at the Latona basin (the slope's height there)
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inCanal = (x, z) => Math.hypot(x, z) < RADIUS - 50 && x > CANAL.end && ((x < CANAL.x0 && Math.abs(z - AXIS_Z) < CANAL.w / 2) || (Math.abs(x - CANAL.cross) < CANAL.crossW / 2 && Math.abs(z) < 260));
/** The rise of the château falling west down the gardens; the canal dug in. */
export function height(x, z) {
  let h = RISE * smooth(-160, -60, x);
  // the Latona basin stands on a level landing at the foot of the slope
  const dl = Math.hypot(x - LATONA[0], z - LATONA[1]);
  if (dl < 26) h = LATONA_Y + (h - LATONA_Y) * smooth(18, 26, dl);
  if (inCanal(x, z)) h = -2.2;
  for (const r of YARDS) { const d = rectDist(r, x, z); if (d < 8) h = YARD_Y + (h - YARD_Y) * smooth(0, 8, d); }
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
// the three avenues: Paris on the axis, Saint-Cloud and Sceaux leaving the Place's corners, the stables in the wedges between
export const AVE0 = 75;
export const STABLES = [{ x: 214, z: -40, side: -1 }, { x: 214, z: 40, side: 1 }];
export const onAvenue = (x, z, m = 0) => x > PLACE[2] - 5 && [[0, 0], [AVE0, 0.35], [-AVE0, -0.35]].some(([o, s]) => Math.abs(z - (o + (x - PLACE[2]) * s)) < 12 + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// ---- the town (docs/settlements/versailles.md §5, "The town's fabric"): terraced rows that touch, party wall to party wall,
// fronting the three avenues (on both sides) and the cross streets; blocks of two rows back to back between them.
export const STREET = 9, DEPTH = 13, PITCH = 2 * DEPTH + STREET, LANE = 5;
const avenueZ = (o, s, x) => o + (x - PLACE[2]) * s;
/** The three avenues' centre lines, [offset, slope]. */
export const AVENUES = [[0, 0], [AVE0, 0.35], [-AVE0, -0.35]];
const TRADES = ['baker', 'tavern', 'draper', 'apothecary', 'cobbler', 'barber', 'cutler', 'vintner', 'bookseller', 'butcher', 'hatter', 'chandler'];
let LOTS = null;
const inTown = (cx, cz) => Math.hypot(cx, cz) < RADIUS - 45 && !inRect(PLACE, cx, cz, 10) && !STABLES.some((s) => inRect([s.x - 16, s.z - 30, s.x + 62, s.z + 30], cx, cz, 5)) && !(cx < 160 && Math.abs(cz) < 230) && cx > 118;
const overlap = (a, b, m = -0.05) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
/** The town's houses east of the Place d'Armes: { rect, front, storeys, kind, trade, row, seed, y, foot }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1690), grid = new Map();
  const key = (x, z) => `${Math.floor(x / 40)},${Math.floor(z / 40)}`;
  const taken = (r) => { for (let i = Math.floor((r[0] - 1) / 40); i <= Math.floor((r[2] + 1) / 40); i++) for (let j = Math.floor((r[1] - 1) / 40); j <= Math.floor((r[3] + 1) / 40); j++) for (const q of grid.get(`${i},${j}`) ?? []) if (overlap(r, q.rect)) return true; return false; };
  const add = (rect, front, row, extra = {}) => {
    const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2;
    if (!inTown(cx, cz) || taken(rect)) return;
    const near = Math.hypot(cx - 215, cz), L = rect[2] - rect[0];
    const shopP = row === 'avenue' ? 0.62 : near < 110 ? 0.34 : 0.14;
    const hotel = row === 'avenue' && near < 200 && L >= 13.5;
    const shop = !hotel && rand() < shopP;
    const l = { rect, front, row, seed: Math.floor(rand() * 1e6), y: RISE, foot: RISE - 0.4, storeys: hotel ? 4 : row === 'avenue' || near < 120 ? 3 + (rand() < 0.25 ? 1 : 0) : 2 + (rand() < 0.55 ? 1 : 0), kind: hotel ? 'hotel' : shop ? 'shop' : 'house', shop, ...extra };
    if (shop) l.trade = TRADES[Math.floor(rand() * TRADES.length)];
    LOTS.push(l);
    const k = key(cx, cz); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(l);
  };
  // 1. the avenues' frontages: runs of houses sharing a line, stepping with the avenue's slope (the diagonal ones in steps of three or four)
  for (const [o, s] of AVENUES) for (const sg of [-1, 1]) {
    let x = o === 0 ? STABLES[0].x + 66 : PLACE[2] + 4;
    while (x < RADIUS - 40) {
      const run = 3 + Math.floor(rand() * 2), ws = [];
      for (let k = 0; k < run; k++) ws.push(rand() < 0.14 ? 14 + rand() * 2 : o === 0 ? 8 + rand() * 3.5 : 8.5 + rand() * 3.5);
      const total = ws.reduce((a, b) => a + b, 0), zc = avenueZ(o, s, x + total / 2), d = DEPTH - 1 + rand() * 2;
      let xx = x;
      for (const w of ws) {
        const e = sg > 0 ? [xx, zc + 12.5, xx + w, zc + 12.5 + d] : [xx, zc - 12.5 - d, xx + w, zc - 12.5];
        add(e, sg > 0 ? 'n' : 's', 'avenue');
        xx += w;
      }
      x = xx + (rand() < 0.35 ? LANE : 0);
    }
  }
  // 2. the blocks between: two rows back to back, a lane between runs of houses
  for (let b = -Math.ceil(RADIUS / PITCH); b <= Math.ceil(RADIUS / PITCH); b++) {
    const zb = b * PITCH + 4;
    for (const [z0, front] of [[zb, 'n'], [zb + DEPTH, 's']]) {
      let x = 118 + rand() * 6, run = 0, maxRun = 40 + rand() * 20;
      while (x < RADIUS - 40) {
        if (run > maxRun) { x += LANE; run = 0; maxRun = 40 + rand() * 20; continue; }
        const w = 8 + rand() * 4, d = DEPTH - 0.5 + rand();
        const rect = front === 'n' ? [x, z0, x + w, z0 + d] : [x, z0 + DEPTH - d, x + w, z0 + DEPTH];
        const cx = x + w / 2, cz = (rect[1] + rect[3]) / 2;
        if (!AVENUES.some(([o, s]) => Math.abs(cz - avenueZ(o, s, cx)) < 26 && cx > PLACE[2] - 5)) add(rect, front, 'block');
        x += w; run += w;
      }
    }
  }
  // the houses to open (§5): shops and homes about the avenue de Paris at the Place's east edge
  const o = openSet(LOTS); for (const [l, use] of o) { l.open = true; l.use = use; if (use !== 'home' && use !== 'hotel') l.trade = use; }
  return LOTS;
}
const THE_TRADES = ['baker', 'tavern', 'draper', 'apothecary', 'cobbler', 'barber', 'cutler', 'vintner', 'bookseller', 'butcher', 'hatter', 'chandler'];
function openSet(all, [px, pz] = [226, 0]) {
  const ok = all.filter((l) => l.rect[2] - l.rect[0] >= 6 && l.rect[3] - l.rect[1] >= 8 && (l.front === 'n' || l.front === 's'));
  const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - px, (l.rect[1] + l.rect[3]) / 2 - pz);
  const out = new Map(), used = new Set();
  const shops = ok.filter((l) => l.kind === 'shop').sort((a, b) => d(a) - d(b));
  // one of each trade, the nearest first
  for (const t of THE_TRADES) { const l = shops.find((q) => q.trade === t && !out.has(q)); if (l && d(l) < 330) { out.set(l, t); used.add(t); } }
  // two more of the busiest trades and homes
  for (const l of shops) { if (out.size >= 16) break; if (!out.has(l)) out.set(l, l.trade); }
  for (const l of ok.filter((q) => q.kind === 'house').sort((a, b) => d(a) - d(b)).slice(0, 8)) out.set(l, 'home');
  for (const l of ok.filter((q) => q.kind === 'hotel').sort((a, b) => d(a) - d(b)).slice(0, 2)) out.set(l, 'hotel');
  return out;
}
let LGRID = null;
/** Is (x, z) in a town lot (within m of it)? A 24 m grid of the lots. */
export function inLot(x, z, m = 0) {
  if (!LGRID) { LGRID = new Map(); for (const l of lots()) for (let i = Math.floor((l.rect[0] - 3) / 24); i <= Math.floor((l.rect[2] + 3) / 24); i++) for (let j = Math.floor((l.rect[1] - 3) / 24); j <= Math.floor((l.rect[3] + 3) / 24); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(l); } }
  const c = LGRID.get(Math.floor(x / 24) + ',' + Math.floor(z / 24));
  return !!c && c.some((l) => inRect(l.rect, x, z, m));
}
/** The paved streets of the town: inside its disc, east of the Place's line, off the lots (and the gardens). */
export const inStreets = (x, z) => x > 112 && Math.hypot(x, z) < RADIUS - 28 && !(x < 160 && Math.abs(z) < 230) && !inLot(x, z, -0.3);
/** A town house's height to its eave (townhouse.js: ground 3.7, then 3.9, 3.4, 3.1; a hotel's first floor 0.5 more). */
export const houseH = (l) => 3.7 + [3.9, 3.4, 3.1].slice(0, l.storeys - 1).reduce((a, b) => a + b, 0) + (l.kind === 'hotel' ? 0.5 : 0);
