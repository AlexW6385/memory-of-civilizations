// Florence about 1480 — the layout (docs/settlements/florence.md §2): the cathedral with its dome in
// the middle, the campanile at its south-west corner, the Baptistery before its west front; the Piazza
// della Signoria to the south with the Palazzo della Signoria and its tower and the Loggia; the Arno
// at the south edge with the Ponte Vecchio and its shops; tiled houses and palaces in the streets
// between. Distances compressed a little. Pure data. +x east, +z south.

export const RADIUS = 400;
export const DUOMO = { c: [40, -60], nave: 90, w: 40, h: 40, d: 45.5 };
export const CAMPANILE = [-63, -30];
export const BAPTISTERY = [-125, -60];
export const PIAZZA_DUOMO = [-160, -110, 100, -10];
export const SIGNORIA = [0, 110, 110, 205];
export const PALAZZO = [62, 120, 102, 160];
export const LOGGIA = [12, 165, 50, 182];
export const ORSAN = [16, 20, 48.4, 42.1];                      // Orsanmichele, between the cathedral and the Signoria (32.4 × 22.1 m)
export const MEDICI = [-12, -196, 28, -156];                   // the Palazzo Medici on the Via Larga, north of the cathedral (40 × 40 m)
export const MERCATO = [-82, 8, -18, 72];                      // the Mercato Vecchio, on the Roman forum west of Orsanmichele
export const NOVELLA = [-266, -222, -233, -150];               // Santa Maria Novella, its front on the south (33 m: the side of its square)
export const NOVELLA_PIAZZA = [-292, -150, -205, -110];        // the piazza before it
export const BOTTEGA = [-104, 2, -92, 12];                     // a painter's and sculptor's bottega on the street south of the cathedral's square
export const TINTORI = [100, 222, 240, 247];                   // the dyers' yard and the drying sheds on the Arno's north bank, east of the bridge
export const ARNO = { z: 275, w: 60, level: -4, bed: -7 };
export const BRIDGE = { x: 40 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const arnoZ = (x) => ARNO.z + 12 * Math.sin(x / 130);
export const inArno = (x, z) => Math.abs(z - arnoZ(x)) < ARNO.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 55;
export function height(x, z) {
  const d = Math.abs(z - arnoZ(x)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  return ARNO.bed * smooth(ARNO.w / 2 + 6, ARNO.w / 2 - 6, d) * (1 - edge);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const overlaps = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;

// ── what stands on its own and is not a street: the landmarks' footprints (streets and lots keep clear of them)
export const KEEP = [
  [-74, -82, 20, -38],            // the cathedral's nave and aisles
  [14, -106, 90, -14],            // the crossing, the dome and the tribunes
  [-72, -38.5, -54, -21.5],       // the campanile
  [-147, -75, -110, -45],         // the Baptistery and its scarsella
  [56, 112, 106, 164],            // the Palazzo della Signoria and its tower
  [8, 161, 54, 186],              // the Loggia
  [14, 18, 50.4, 44.1],           // Orsanmichele
  [MEDICI[0] - 2, MEDICI[1] - 2, MEDICI[2] + 2, MEDICI[3] + 2],
  MERCATO,
  [NOVELLA[0] - 3, NOVELLA[1] - 3, NOVELLA[2] + 3, NOVELLA[3] + 1],
  NOVELLA_PIAZZA,
  PIAZZA_DUOMO, SIGNORIA,
  [BOTTEGA[0] - 1, BOTTEGA[1] - 1, BOTTEGA[2] + 1, BOTTEGA[3] + 1],
  TINTORI,
];

/** Rectangle r with the rectangles `cuts` (each grown by m) taken out: a list of rectangles. */
export function subtract(r, cuts, m = 0) {
  let list = [r];
  for (const c0 of cuts) {
    const c = [c0[0] - m, c0[1] - m, c0[2] + m, c0[3] + m], next = [];
    for (const q of list) {
      if (!overlaps(q, c)) { next.push(q); continue; }
      if (q[0] < c[0]) next.push([q[0], q[1], c[0], q[3]]);
      if (q[2] > c[2]) next.push([c[2], q[1], q[2], q[3]]);
      const x0 = Math.max(q[0], c[0]), x1 = Math.min(q[2], c[2]);
      if (q[1] < c[1]) next.push([x0, q[1], x1, c[1]]);
      if (q[3] > c[3]) next.push([x0, c[3], x1, q[3]]);
    }
    list = next;
  }
  return list;
}

// ── the streets (docs/settlements/florence.md §5): a loose grid of narrow streets round the squares, as
// the old Roman grid had left it. [x or z of the middle line, width, name]. Each is cut by the landmarks.
const EW = [[-330, 6], [-290, 6], [-250, 6], [-203, 6], [-150, 6, 'Via de\' Gori'], [-117, 6], [-60, 6], [-3, 6], [48, 6], [100, 6], [150, 6], [212, 7, 'Lungarno']];
const NS = [[-352, 5], [-308, 5], [-262, 5], [-200, 5], [-166, 5], [-112, 5], [-58, 5], [-6, 8, 'Via Calzaiuoli'], [40, 9, 'Via Larga'], [76, 5], [116, 6], [160, 5], [204, 5], [248, 5], [292, 5], [336, 5]];
const RS = RADIUS - 50;
let STREET_LIST = null;
/** The street pieces: { r: [x0, z0, x1, z1], w, horiz, name }. */
export function streets() {
  if (STREET_LIST) return STREET_LIST;
  const out = [];
  const add = (r, w, horiz, name) => { for (const p of subtract(r, KEEP, 1)) if (Math.max(p[2] - p[0], p[3] - p[1]) >= 10 && Math.min(p[2] - p[0], p[3] - p[1]) >= w - 0.01) out.push({ r: p, w, horiz, name }); };
  for (const [z, w, name] of EW) { const h = Math.sqrt(Math.max(0, RS * RS - z * z)); if (h > 20) add([-h, z - w / 2, h, z + w / 2], w, true, name); }
  for (const [x, w, name] of NS) { const h = Math.sqrt(Math.max(0, RS * RS - x * x)); if (h > 20) add([x - w / 2, -h, x + w / 2, Math.min(h, arnoZ(x) - ARNO.w / 2 - 7)], w, false, name); }
  STREET_LIST = out;
  return out;
}
export const inStreet = (x, z, m = 0) => streets().some((s) => inRect(s.r, x, z, m));

/** The open ground people may walk on besides the streets: the squares less the buildings standing in them. */
export function squares() {
  const cut = KEEP.filter((k) => k !== PIAZZA_DUOMO && k !== SIGNORIA && k !== MERCATO && k !== NOVELLA_PIAZZA && k !== TINTORI && !(k[0] === BOTTEGA[0] - 1));
  const out = [];
  const mk = (r, extra, weight, market = 0, m = 1.5) => { for (const p of subtract([r[0] - 2, r[1] - 2, r[2] + 2, r[3] + 2], [...cut, ...extra], m)) if (p[2] - p[0] >= 3 && p[3] - p[1] >= 3) out.push({ r: p, weight, market }); };
  mk(PIAZZA_DUOMO, [], 1.3, 0.2, 2);
  mk(SIGNORIA, [], 1.5, 0.3, 2.5);
  mk([MERCATO[0] + 2, MERCATO[1] + 2, MERCATO[2] - 2, MERCATO[3] - 2], [[-53.5, 36.5, -46.5, 43.5], [MERCATO[0] + 8, MERCATO[3] - 15, MERCATO[2] - 22, MERCATO[3] - 6]], 1.8, 1, 0);
  mk(NOVELLA_PIAZZA, [], 0.9, 0.1, 1);
  return out;
}

let LOTS = null;
/**
 * The lots along the streets, each a house, a shop-house (bottega), a palace or a tower house: built
 * out along both sides of every street piece, side by side with a slit between them, as deep as
 * the ground free of other lots, streets and landmarks allows. { rect, seed, y, foot, storeys, front, kind, trade, plaster, exposed }
 */
export function lots() {
  if (LOTS) return LOTS;
  const rand = rng(1480), placed = [], S = streets();
  const bad = (r) => KEEP.some((k) => overlaps(r, k, 2.5)) || S.some((s) => overlaps(r, s.r, -0.05)) || placed.some((p) => overlaps(r, p, 0.12)) || Math.abs((r[1] + r[3]) / 2 - arnoZ((r[0] + r[2]) / 2)) < ARNO.w / 2 + 14 || Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > RADIUS - 42;
  const TRADES = ['cloth', 'cloth', 'wine', 'bread', 'spice', 'leather', 'smith', 'goldsmith', 'woodwork', 'candles'];
  for (const s of S) {
    const [x0, z0, x1, z1] = s.r, horiz = s.horiz;
    const a0 = horiz ? x0 : z0, a1 = horiz ? x1 : z1;
    const mid = horiz ? (z0 + z1) / 2 : (x0 + x1) / 2;
    const centre = Math.hypot(horiz ? 0 : mid, horiz ? mid : 0);
    for (const side of [-1, 1]) {
      let u = a0 + rand() * 3;
      while (u < a1 - 4) {
        const r0 = rand(), palace = r0 < (s.w >= 6 ? 0.13 : 0.06), tower = !palace && r0 > 0.965;
        const w = palace ? 15 + rand() * 9 : tower ? 7.5 + rand() * 2 : 5.5 + rand() * 5.5, d0 = palace ? 19 + rand() * 8 : tower ? 8 + rand() * 3 : 15 + rand() * 11;
        let ok = null;
        const rectAt = (dd) => (horiz ? (side < 0 ? [u, z0 - dd, u + w, z0] : [u, z1, u + w, z1 + dd]) : (side < 0 ? [x0 - dd, u, x0, u + w] : [x1, u, x1 + dd, u + w]));
        // the deepest the ground allows (to the lots of the next street, or the landmark); the house takes it all if that is not much more than it wanted
        for (let dd = 30; dd >= 8; dd -= 1) if (!bad(rectAt(dd))) { ok = rectAt(dd <= d0 + 8 ? dd : d0); break; }
        if (!ok) { u += 1.5; continue; }
        const front = horiz ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w');
        const quarter = Math.hypot((ok[0] + ok[2]) / 2 - MERCATO[0] - 32, (ok[1] + ok[3]) / 2 - 40);
        const shopP = s.name === 'Via Calzaiuoli' || s.name === 'Via Larga' ? 0.7 : quarter < 150 ? 0.6 : 0.28;
        const kind = palace ? 'palazzo' : tower ? 'torre' : rand() < shopP ? 'bottega' : 'casa';
        const sc = Math.hypot((ok[0] + ok[2]) / 2, (ok[1] + ok[3]) / 2);
        const storeys = kind === 'palazzo' ? 3 : kind === 'torre' ? 6 + (rand() < 0.4 ? 1 : 0) : (sc > 270 ? 2 : 3) + (rand() < 0.35 ? 1 : 0) - (rand() < 0.1 ? 1 : 0);
        placed.push(ok);
        LOTS_RAW.push({ rect: ok, seed: Math.floor(rand() * 1e6), y: 0, foot: -0.3, storeys, front, kind, trade: TRADES[Math.floor(rand() * TRADES.length)], plaster: rand() < 0.65, tower: kind === 'torre' });
        u += (horiz ? ok[2] - ok[0] : ok[3] - ok[1]) + 0.25 + (rand() < 0.07 ? 2 + rand() * 3 : 0);
        void centre;
      }
    }
  }
  // the sides a lot shows (free ground a little beyond it): the street front always, the others where no lot or landmark stands
  LOTS = LOTS_RAW.splice(0);
  const probe = (l, f) => {
    const [x0, z0, x1, z1] = l.rect, e = 1.4;
    const p = f === 'n' ? [x0 + 0.5, z0 - e, x1 - 0.5, z0 - 0.3] : f === 's' ? [x0 + 0.5, z1 + 0.3, x1 - 0.5, z1 + e] : f === 'w' ? [x0 - e, z0 + 0.5, x0 - 0.3, z1 - 0.5] : [x1 + 0.3, z0 + 0.5, x1 + e, z1 - 0.5];
    return p;
  };
  for (const l of LOTS) {
    l.exposed = 'nsew'.split('').filter((f) => f === l.front || !LOTS.some((o) => o !== l && overlaps(probe(l, f), o.rect)));
  }
  return LOTS;
}
const LOTS_RAW = [];
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The rectangles people walk in: the street pieces and the squares, with their weight and the share of market. */
export function walkRects() {
  const S = streets().map((s) => {
    const mid = s.horiz ? (s.r[1] + s.r[3]) / 2 : (s.r[0] + s.r[2]) / 2, a = s.horiz ? [(s.r[0] + s.r[2]) / 2, mid] : [mid, (s.r[1] + s.r[3]) / 2];
    const quarter = Math.hypot(a[0] - MERCATO[0] - 32, a[1] - 40), shops = s.name === 'Via Calzaiuoli' || s.name === 'Via Larga' ? 0.8 : quarter < 150 ? 0.6 : 0.25;
    return { r: s.r, weight: (s.w > 5.5 ? 1.5 : 0.8) * (1 + 3 * shops), market: shops, kind: s.w > 5.5 ? 'street' : 'lane' };
  });
  return [...S, ...squares().map((q) => ({ ...q, kind: 'street' }))];
}
