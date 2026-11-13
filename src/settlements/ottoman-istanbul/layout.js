// Ottoman Istanbul about 1560 — the layout (docs/settlements/ottoman-istanbul.md §2): the
// Süleymaniye on the crown of the third hill, its terrace looking north over the Golden Horn; the
// mosque in its outer court, the madrasas east and west, the soup kitchen and hospital to the
// north-west, Süleyman's tomb behind the qibla wall; timber houses down the slopes. Pure data.
// +x east, +z south (the qibla toward +z).

export const RADIUS = 400;
export const TOP = 22;
export const MOSQUE = { c: [0, 20], d: 26.5, h: 53 };
export const PRECINCT = [-75, -95, 75, 90];
// the külliye round the precinct (docs/settlements/ottoman-istanbul.md §4.4–§4.9), on the real plan turned so
// that the qibla is +z: the medreses Sani and Evvel west of the mosque, Salis and Rabi east (on the side
// toward the Horn), each 11 modules of 4.2 m square; the vaulted shops before them along the avenues; the
// hospital at the north-west corner, the soup kitchen at the north-east; the bath and the dar'ül-hadis at
// the south-east end
const MW = 11 * 4.2;
export const MEDRESES = [
  { id: 'sani', rect: [-95.8 - MW, -56, -95.8, -56 + MW], out: 'w' },
  { id: 'evvel', rect: [-95.8 - MW, -6.8, -95.8, -6.8 + MW], out: 'w' },
  { id: 'salis', rect: [95.8, -56, 95.8 + MW, -56 + MW], out: 'e' },
  { id: 'rabi', rect: [95.8, -6.8, 95.8 + MW, -6.8 + MW], out: 'e' },
];
export const ARASTA = { w: -95.8, e: 95.8, z0: -56, z1: -6.8 + MW, d: 4.4 };
export const DARUSSIFA = [-96 - 12 * 4.4, -107, -96, -107 + 10 * 4.4];
export const IMARET = [100, -107, 100 + 10 * 4.4, -107 + 10 * 4.4];
export const HAMAM = [98, 58, 141.6, 74];
export const DARULHADIS = { at: [72, 92], m: 4.0 };
/** The footprints of the külliye's buildings (no trees or houses there). */
export const KULLIYE_RECTS = [
  ...MEDRESES.map((q) => q.out === 'w' ? [q.rect[0] - 4.4, q.rect[1], q.rect[2] + ARASTA.d + 1.5, q.rect[3]] : [q.rect[0] - ARASTA.d - 1.5, q.rect[1], q.rect[2] + 4.4, q.rect[3]]),
  DARUSSIFA, IMARET, [HAMAM[0] - 1, HAMAM[1], HAMAM[2] + 3.5, HAMAM[3]], [DARULHADIS.at[0] - 1, DARULHADIS.at[1] - 1, DARULHADIS.at[0] + 21 * 4 + 0.5, DARULHADIS.at[1] + 16.5],
];
export const inKulliye = (x, z, m = 0) => KULLIYE_RECTS.some((r) => inRect(r, x, z, m));
export const TERRACE = [-160, -110, 160, 156];
/**
 * The covered market of the quarter south of the külliye (docs/settlements/ottoman-istanbul.md §11): the old bedesten (a domed
 * hall of 5 × 3 bays, after the Old Bedesten of the Grand Bazaar, 43.3 × 29.5 m) with a vaulted lane of shops through its west
 * and east gates and cross lanes, each lane a trade. Lanes: { id, horiz, c (the axis: z when horiz, else x), a, b (the ends along it), trade }.
 */
export const CARSI = {
  y: TOP, w: 4.6, sd: 2.6, ys: 3.7,
  bedesten: [-81.65, 116.25, -38.35, 145.75],
  lanes: [
    { id: 'zenneciler', horiz: true, c: 131, a: -150, b: -81.65, trade: 'cloth' },
    { id: 'kuyumcular', horiz: true, c: 131, a: -38.35, b: 62, trade: 'brass' },
    { id: 'sahaflar', horiz: false, c: -60, a: 106, b: 116.25, trade: 'books' },
    { id: 'takkeciler', horiz: false, c: -60, a: 145.75, b: 154, trade: 'caps' },
    { id: 'haffaflar', horiz: false, c: -120, a: 110, b: 154, trade: 'shoes' },
    { id: 'bahariye', horiz: false, c: 15, a: 110, b: 154, trade: 'spice' },
  ],
};
export const inCarsi = (x, z, m = 0) => inRect([-152, 104, 64, 156], x, z, m);
/** The street fountains (çeşme): [x, z (the centre of the back), the way it faces], backed on the outer court's wall. */
export const CESMES = [[-75, -80, 'w'], [75, -80, 'e'], [-75, 60, 'w'], [75, 20, 'e'], [-40, 90, 's'], [40, 90, 's']];
// behind the qibla wall: Hürrem Sultan's tomb (1558) in the burial garden; Süleyman's own (1566) is not yet built
export const TOMB = { c: [22, 68], r: 4.4 };
export const CEMETERY = [-62, 54, 64, 86];
/** The graves of the burial garden in 1560 — still few [inferred] — and its rose bushes. */
export const GRAVES = [[-40, 60, 'man'], [-36.5, 60, 'woman'], [-28, 63.5, 'man'], [-44, 70, 'man'], [-31, 72, 'woman'], [-18, 76, 'man'], [-48, 79, 'woman'], [-26, 81, 'man'], [40, 62, 'man'], [44, 74, 'woman'], [50, 80, 'man'], [6, 82, 'man']].map(([x, z, kind]) => ({ at: [x, z], len: kind === 'man' ? 2.1 : 1.9, yaw: 0, kind }));
export const ROSES = [[-34, 66], [-22, 69], [-39, 75], [-12, 63], [-6, 72], [-30, 84], [-52, 66], [8, 62], [10, 74], [34, 70], [37, 81], [56, 68], [-14, 84], [28, 84]];
export const inCemetery = (x, z) => inRect(CEMETERY, x, z);
export const nearGrave = (x, z, m) => Math.hypot(x - TOMB.c[0], z - TOMB.c[1]) < TOMB.r + 2.6 + m || GRAVES.some((g) => Math.abs(x - g.at[0]) < 1.4 + m && Math.abs(z - g.at[1]) < 0.8 + m) || ROSES.some(([a, b]) => Math.hypot(x - a, z - b) < 0.8 + m);
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill: level on its crown (the terrace), falling to the north toward the Golden Horn and on all sides to the rim. */
export function height(x, z) {
  const dx = Math.max(Math.abs(x) - 160, 0), dz = z < 0 ? Math.max(-z - 110, 0) * 1.4 : Math.max(z - 156, 0);
  const d = Math.hypot(dx, dz);
  return TOP * smooth(240, 0, d) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The timber quarter (docs/settlements/ottoman-istanbul.md §13): blocks of 39 × 35 m between lanes of 3.4 m, each lined on
 * its four sides with houses that touch (party walls, fronts 4.5–8.5 m wide, 10 m deep) round a garden or yard of
 * fig and cypress; the lanes run on the grid and are cobbled (laneAt).
 */
export const LANE = 3.4, BX = 42, BZ = 38, OX = 1.6, OZ = 38, DEPTH = 10;
const nearTerrace = (x, z, m) => inRect(TERRACE, x, z, m);
/** The block of the terrace's south-east corner, south of the dar'ül-hadis (its houses round a yard with the quarter's mescit and its minaret). */
export const SE_BLOCK = [66, 114, 156, 154];
export const MESCIT = { rect: [96, 126, 108, 141.5], minaret: [110.4, 128], y: TOP };
let BLOCKS = null, LOTS = null, YARDS = null;
/** The blocks of the quarter: { rect (inside the lanes), c }. */
export function blocks() {
  if (BLOCKS) return BLOCKS;
  BLOCKS = [];
  for (let i = Math.floor(-RADIUS / BX) - 1; i <= Math.ceil(RADIUS / BX); i++) for (let j = Math.floor(-RADIUS / BZ) - 1; j <= Math.ceil(RADIUS / BZ); j++) {
    const x0 = OX + i * BX + LANE, z0 = OZ + j * BZ + LANE, x1 = OX + (i + 1) * BX, z1 = OZ + (j + 1) * BZ, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (Math.hypot(cx, cz) > RADIUS - 48) continue;
    if (x1 > TERRACE[0] - 6 && x0 < TERRACE[2] + 6 && z1 > TERRACE[1] - 6 && z0 < TERRACE[3] + 6) continue;
    BLOCKS.push({ rect: [x0, z0, x1, z1], c: [cx, cz], i, j });
  }
  const [a, b, c, d] = SE_BLOCK; BLOCKS.push({ rect: SE_BLOCK, c: [(a + c) / 2, (b + d) / 2], i: 99, j: 99 });
  return BLOCKS;
}
/** The lanes (rects) of the grid within the disc, for paving and for the walkers. */
export function lanes() {
  const out = [], R = RADIUS - 30;
  for (let i = Math.floor(-RADIUS / BX) - 1; i <= Math.ceil(RADIUS / BX); i++) { const x = OX + i * BX; if (Math.abs(x) < R) out.push({ r: [x, -R, x + LANE, R], vert: true }); }
  for (let j = Math.floor(-RADIUS / BZ) - 1; j <= Math.ceil(RADIUS / BZ); j++) { const z = OZ + j * BZ; if (Math.abs(z) < R) out.push({ r: [-R, z, R, z + LANE], vert: false }); }
  return out;
}
/** Is (x, z) on a lane (outside the terrace)? */
export const laneAt = (x, z, m = 0) => {
  if (nearTerrace(x, z, -2) || Math.hypot(x, z) > RADIUS - 28) return false;
  const u = ((x - OX) % BX + BX) % BX, v = ((z - OZ) % BZ + BZ) % BZ;
  return u < LANE + m || u > BX - m || v < LANE + m || v > BZ - m;
};
/** Split a length into widths of 4.5–8.5 m that sum to it (the first may be given). */
function split(len, rand, first = 0) {
  const w = []; let rest = len;
  if (first) { w.push(Math.min(first, len)); rest -= w[0]; }
  while (rest > 0.01) {
    if (rest < 9.5) { if (rest >= 4.5 || !w.length) w.push(rest); else w[w.length - 1] += rest; break; }
    const a = 4.5 + rand() * 4; w.push(a); rest -= a;
  }
  return w;
}
const slopeY = (r) => { const ys = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].map(([a, b]) => height(a, b)); return [Math.max(...ys), Math.min(...ys)]; };
/** The target of the coffee house: the lot's block nearest it gives its east column's first lot 10 m. */
const TRADE_LIST = ['baker', 'grocer', 'cobbler', 'coppersmith', 'weaver', 'barber', 'potter', 'butcher', 'sherbet', 'saddler', 'grocer', 'baker'];
const COFFEE_AT = [-178, -20];
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; YARDS = [];
  const rand = rng(1560), bl = blocks();
  let cb = null, cd = 1e9; for (const b of bl) { const d = Math.hypot(b.rect[2] + 1.7 - COFFEE_AT[0], b.c[1] - COFFEE_AT[1]); if (b.rect[2] < TERRACE[0] && d < cd) { cd = d; cb = b; } }
  for (const b of bl) {
    const [x0, z0, x1, z1] = b.rect, W = x1 - x0, H = z1 - z0, ch = H - 2 * DEPTH;
    const add = (rect, front, o = {}) => {
      const [y, foot] = slopeY(rect);
      if (y - foot > 5) return;
      const storeys = rand() < 0.55 ? 2 : rand() < 0.7 ? 3 : 1 + (rand() < 0.5 ? 1 : 0);
      const mx = (rect[0] + rect[2]) / 2, mz = (rect[1] + rect[3]) / 2, dT = Math.max(TERRACE[0] - mx, mx - TERRACE[2], TERRACE[1] - mz, mz - TERRACE[3], 0);
      const shop = rect[2] - rect[0] >= 4.4 && rect[3] - rect[1] >= 4.4 && rand() < (dT < 60 ? 0.6 : dT < 140 ? 0.25 : 0.07);
      LOTS.push({ rect, seed: Math.floor(rand() * 1e6), y, foot, storeys, front, plaster: rand() < 0.5, ...(shop ? { shop: true, trade: TRADE_LIST[Math.floor(rand() * TRADE_LIST.length)] } : {}), ...o });
    };
    let x = x0; for (const w of split(W, rand)) { add([x, z0, x + w, z0 + DEPTH], 'n'); x += w; }
    x = x0; for (const w of split(W, rand)) { add([x, z1 - DEPTH, x + w, z1], 's'); x += w; }
    let z = z0 + DEPTH; for (const w of split(ch, rand)) { add([x0, z, x0 + DEPTH, z + w], 'w'); z += w; }
    z = z0 + DEPTH; const first = b === cb ? 10 : 0;
    for (const w of split(ch, rand, first)) { add([x1 - DEPTH, z, x1, z + w], 'e', first && z === z0 + DEPTH ? { coffee: true } : {}); z += w; }
    YARDS.push({ rect: [x0 + DEPTH, z0 + DEPTH, x1 - DEPTH, z1 - DEPTH], block: b });
  }
  return LOTS;
}
export const yards = () => { lots(); return YARDS; };
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const inYard = (x, z) => yards().some((y) => inRect(y.rect, x, z));
/** The coffee house (docs/settlements/ottoman-istanbul.md §10): the 10 m lot on the east column of the block nearest the lane west of the terrace. */
export const COFFEE = () => lots().find((l) => l.coffee) ?? lots()[0];

/** The houses and shops that can be entered (many): the nearest to six points round the terrace, the shops by preference (the open ones are furnished: styles/ottoman/konak.js). */
let OPENED = null;
export function openSet() {
  if (OPENED) return OPENED;
  const coffee = COFFEE(), all = lots().filter((l) => l !== coffee), out = new Set();
  // (not where the door's step would stand more than a walker's step (0.5 m) above the lane: on the steeper slopes the floor is cut into the hill above it)
  const stepOK = (l) => { const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, p = l.front === 's' ? [mx, z1 + 0.5] : l.front === 'n' ? [mx, z0 - 0.5] : l.front === 'e' ? [x1 + 0.5, mz] : [x0 - 0.5, mz]; return l.y + 0.3 - height(p[0], p[1]) <= 0.45; };
  const ok = all.filter((l) => l.rect[2] - l.rect[0] >= 4.5 && l.rect[3] - l.rect[1] >= 4.5 && stepOK(l));
  for (const [px, pz, nShop, nHome] of [[0, -135, 8, 4], [-176, 40, 8, 4], [176, 40, 8, 4], [0, 185, 8, 4], [-176, -80, 4, 2], [176, -80, 4, 2]]) {
    const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - px, (l.rect[1] + l.rect[3]) / 2 - pz), srt = ok.filter((l) => !out.has(l)).sort((a, b) => d(a) - d(b)).slice(0, 60);
    srt.filter((l) => l.shop).slice(0, nShop).forEach((l) => out.add(l)); srt.filter((l) => !l.shop).slice(0, nHome).forEach((l) => out.add(l));
  }
  return (OPENED = out);
}
/** A point inside an open house's ground room: u along its front, v in from the door's wall (the frame of styles/ottoman/konak.js room()). */
export function roomPoint(l, u, v) {
  const [x0, z0, x1, z1] = l.rect;
  return l.front === 's' ? [x1 - u, z1 - v] : l.front === 'n' ? [x0 + u, z0 + v] : l.front === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u];
}
