// The Registan c. 1420 (docs/settlements/timurid-samarkand.md §2): the open square where the trade streets meet, Ulugh
// Beg's madrasa on its west side with its pishtaq, minarets, court and cells (the north-east corner hall a furnished
// classroom), the khanqah on the east, the rows of shops on the north and south. The other monuments are in town.js.

import { SQUARE, MADRASA, KHANQAH, SHOPS_N, SHOPS_S, TAPCHANS, marketLayout, houses, houseGeom } from './layout.js';
import { ENTERED } from './soundmap.js';
import { upperRoute } from '../../styles/timurid/upper.js';

const E = [];
E.push({ t: 'tim_madrasa', rect: MADRASA });
E.push({ t: 'khanqah', rect: KHANQAH.rect });
E.push({ t: 'shop_row', rect: SHOPS_N, front: 's', unit: 3.6, enter: [3, 8, 14, 19, 24], seed: 14 });
E.push({ t: 'shop_row', rect: SHOPS_S, front: 'n', unit: 3.6, enter: [5, 11, 17, 21, 24], seed: 15 });

// the market on the square: two rows of stalls under awnings, goods spread on mats between them and the shops
{
  const { stalls, spreads } = marketLayout();
  E.push({ t: 'tim_market', rect: SQUARE, seed: 5, stalls, spreads, litter: 260 });
  for (const [x, z, yaw] of TAPCHANS) E.push({ t: 'tim_tapchan', at: [x, z], yaw, seed: Math.floor(x * 7 + z) });
}
// worn sills at the doors of the madrasa's and the khanqah's portal passages (wear.js; the back wall of each iwan, pishtaq() in the style's index.js)
E.push({ t: 'tim_wear', doors: [{ at: [-54.4, 0], axis: 'z', w: 4.5, dep: 0.5 }, { at: [KHANQAH.rect[0] + 0.6 + 5.8, 0], axis: 'z', w: 3.5, dep: 0.5 }] });
// the night's lamps of the square: stands, braziers, hung lanterns, the tea-houses' lamps (nightlight.js)
E.push({ t: 'tim_night', part: 'square' });
// a paved apron of limestone flags before the pishtaq, worn in the middle (the students' and the faithful's way), edged with a kerb of dressed stone
E.push({ t: 'block', walk: true, rect: [-45, -9, -33, 9], y0: 0, y1: 0.04, mat: 'flagstone' });
E.push({ t: 'block', walk: true, rect: [-33.3, -9, -33, 9], y0: 0.04, y1: 0.09, mat: 'limestone' });
const [mx0, mz0, mx1, mz1] = MADRASA, zm = (mz0 + mz1) / 2;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('registan', SQUARE, 0, 'open'),
  room('madrasa court', [-107, -18, -59, 18], 0, 'open'),
  room('classroom', [-58, -25.6, -47.4, -18.5], 0, 'hall'),
  room('khanqah hall', [KHANQAH.rect[2] - 17, -6, KHANQAH.rect[2] - 5, 6], 0, 'hall'),
  room('library', [-58, 18.5, -47.4, 25.6], 0, 'hall'),
  room('lecture hall', [-117.4, -24.4, -108, -18], 0, 'hall'),
  room('hall of the sciences', [-117.4, 18, -108, 24.4], 0, 'hall'),
  room('mosque', [-117.4, -17.4, -114, 17.4], 0, 'hall'),
  room('pishtaq passage', [-59, zm - 6, -45, zm + 6], 0, 'hall'),
];
const walks = [[[40, 0], [0, 0], [-40, 0], [-52, 0], [-66, 0], [-83, 0]]];
walks[0].y0 = 0;
// from the lane to an upper room of the houses nearest the arrival: three merchant's houses and one of each trade's (stair of the court, roof, upper room)
{
  const near = houses().filter((h) => !h.garden && h.full).map((h) => ({ h, d: Math.hypot((h.rect[0] + h.rect[2]) / 2 - 14, (h.rect[1] + h.rect[3]) / 2) })).sort((a, b) => a.d - b.d);
  const seen = new Map();
  for (const { h } of near) {
    const key = h.rich ? 'rich' : h.trade, cap = h.rich ? 3 : 1;
    if ((seen.get(key) || 0) >= cap) continue;
    const R = upperRoute(h);
    if (!R) continue;
    seen.set(key, (seen.get(key) || 0) + 1);
    const G = houseGeom(h), w = R.map(([x, z]) => G.toWorld(x, z));
    w.y0 = 0; walks.push(w);
  }
}

// ---- the visitor's walk into the opened places (match pass, docs §20.2): every route below is walked by tools/walk-check.mjs
// the shops: a gap of the stalls' rows (the market's rows leave a column here and there), then in at the side of the sill's tray table
{
  const AISLE = { 'shop:n3': -40.5, 'shop:n8': -16, 'shop:n14': 7, 'shop:n19': 22.5, 'shop:n24': 43, 'shop:s5': -37.5, 'shop:s11': -15, 'shop:s17': 31.5, 'shop:s21': 34, 'shop:s24': 43 };
  for (const s of ENTERED) {
    const g = s.rect[1] > 0 ? 1 : -1, xe = (s.rect[0] + s.rect[2]) / 2 - 0.8, xp = AISLE[s.id];
    if (xp === undefined) continue;
    const w = [[14, 0], [xp, 0], [xp, g * 40], [xe, g * 40], [xe, g * 44.5], [xe, g * 46.5]];
    w.y0 = 0; walks.push(w);
  }
}
// the madrasa's two corner halls from the court's gallery, the khanqah's hall through its portal
{
  const a = [[14, 0], [-40, 0], [-52, 0], [-66, 0], [-64, -17], [-60, -17], [-56.5, -21.5]];
  const b = [[14, 0], [-40, 0], [-52, 0], [-66, 0], [-64, 17], [-60, 17], [-56.5, 21.5]];
  const k = [[14, 0], [40, 0], [KHANQAH.rect[2] - 17 + 0.5, 0], [KHANQAH.rect[2] - 11, 0]];
  // the west range (docs §21): the lecture hall and the hall of the sciences from the gallery, the mosque through the west iwan's door
  const lh = [[14, 0], [-40, 0], [-52, 0], [-66, 0], [-80, -12], [-100, -17], [-104, -20.15], [-112, -20.15]];
  const hs = [[14, 0], [-40, 0], [-52, 0], [-66, 0], [-80, 12], [-100, 17], [-104, 20.15], [-112, 20.15]];
  const mo = [[14, 0], [-40, 0], [-52, 0], [-66, 0], [-100, 0], [-107, 0], [-112, 0], [-115.5, 0]];
  for (const w of [a, b, k, lh, hs, mo]) { w.y0 = 0; walks.push(w); }
}
// the houses nearest the arrival: lane, the passage of the street door, the court, the talar (the porch of the court), and the room of the trade at its wing
{
  const FLIP = new Set([954925, 423350]);      // courts whose screen leaves too little room at the passage's mouth: the lateral leg runs further out (a walked check)
  const SHUT = new Set([725441]);      // the carpenter's court whose planks shut the long way across: not walked
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const near = houses().filter((h) => h.full && !h.garden && !SHUT.has(h.seed)).map((h) => ({ h, d: Math.hypot((h.rect[0] + h.rect[2]) / 2 - 14, (h.rect[1] + h.rect[3]) / 2) })).sort((x, y) => x.d - y.d).slice(0, 13);
  near.forEach(({ h }, i) => {
    const G = houseGeom(h), W = G.W, D = G.D, zf = -D / 2 + 4.8, zs = D / 2 - 4.6, xl = -W / 2 + 4.3, xr = W / 2 - 4.3, zc = (zf + zs) / 2;
    const xd = Math.max(-W / 2 + 3.2, Math.min(W / 2 - 3.2, h.xd));
    const q = rng(h.seed + 7); q(); if (!h.rich) q(); const rsgn = (q() < 0.5 ? -1 : 1), X = 2.4 * rsgn;
    const zl = FLIP.has(h.seed) ? 0.8 : 0.3;      // (lateral past the passage's screen, in the clear band between the wing's wall and the screen)
    let r;
    if (i % 2 === 0 || h.trade === 'smith') r = [[xd, D / 2 + 3], [xd, zs + 1], [xd, zs - zl], [X, zs - zl], [X, zf + 0.6], [X, zf - 1.2]];
    else { const ex = rsgn < 0 ? xl + 1.6 : xr - 1.6, dx = rsgn < 0 ? xl - 0.25 : xr + 0.25, ix = rsgn < 0 ? -W / 2 + 2.2 : W / 2 - 2.2; r = [[xd, D / 2 + 3], [xd, zs + 1], [xd, zs - 0.3], [X, zs - 0.3], [X, zc], [ex, zc], [dx, zc], [ix, zc]]; }
    const w = r.map(([u, v]) => G.toWorld(u, v)); w.y0 = 0; walks.push(w);
  });
}

export const registan = {
  id: 'samarkand-registan',
  name: { en: 'The Registan and the Ulugh Beg Madrasa', zh: '雷吉斯坦广场与兀鲁伯经学院' },
  era: { en: 'Timurid, c. 1420', zh: '帖木儿王朝，约1420年' },
  style: 'timurid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [14, 0], facing: 'w' },
  bounds: [mx0 - 8, -62, KHANQAH.rect[2] + 8, 62],
  bakeBounds: [mx0 - 4, -56, KHANQAH.rect[2] + 4, 56],
  view: [-60, -30, 60, 30],
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default registan;
void mx1;
