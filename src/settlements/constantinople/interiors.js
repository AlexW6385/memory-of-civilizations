// The interiors of Constantinople (docs/settlements/constantinople.md §12): the Mese's shops furnished by
// trade, a house, a chapel and a small bath you can walk into, and the people in them. Placed on the
// layout's special lots and the stoas of plan.js (MESE_STOAS); the builders are the style's
// (src/styles/byzantine/interiors.js).
import '../../styles/byzantine/interiors.js';
import { height, special, EIRENE } from './layout.js';
import { MESE_STOAS } from './plan.js';
import { shopFrame, TRADES } from '../../styles/byzantine/interiors.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const shopsOf = () => {
  const out = [], rand = rng(5602);
  for (const st0 of MESE_STOAS) {
    if (!st0.shops) continue;
    const st = { ...st0, y: height(...st0.a), depth: st0.depth ?? 5 }, L = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]), ns = Math.max(1, Math.round(L / 4.4));
    for (let k = 0; k < ns; k++) if (rand() < 0.93) out.push({ st, k, ns, trade: TRADES[Math.floor(rand() * TRADES.length)], seed: Math.floor(rand() * 1e6) });
  }
  return out;
};
const specials = () => special();
const HOUSES = ['home', 'tavern', 'bakery', 'weaver', 'home2', 'home3'];

export function interiorPlan() {
  const S = specials(), shops = shopsOf();
  const elements = [
    ...HOUSES.filter((k) => S[k]).map((k, i) => ({ t: 'byz_home', rect: S[k].rect, y: S[k].y, seed: i + 1, variant: k === 'home2' || k === 'home3' ? 'home' : k })),
    { t: 'byz_chapel', rect: S.chapel.rect, y: S.chapel.y },
    { t: 'byz_bath', rect: S.bath.rect, y: S.bath.y },
    ...shops.map((s) => ({ t: 'byz_shopfit', ...s })),
  ];
  const rooms = [
    ...HOUSES.filter((k) => S[k]).map((k) => ({ id: k === 'home' ? 'house' : k, rect: S[k].rect, y: S[k].y + 0.2, kind: 'house' })),
    { id: 'chapel', rect: S.chapel.rect, y: S.chapel.y + 0.25, kind: 'hall' },
    { id: 'bath', rect: S.bath.rect, y: S.bath.y + 0.2, kind: 'hall' },
    { id: 'eirene', rect: [EIRENE[0] + 24.5, EIRENE[1] + 11.5, EIRENE[2] - 7.5, EIRENE[1] + 43.5], y: 0.1, kind: 'hall' },
  ];
  for (const st of MESE_STOAS) if (st.shops) {
    const [ax, az] = st.a, [bx, bz] = st.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], s = st.side, y = height(ax, az) + 0.18;
    const P = (d, t) => [ax + d * u[0] - t * s * u[1], az + d * u[1] + t * s * u[0]], A = P(0, 5.6), B = P(L, 9.4);
    rooms.push({ id: `shops-${rooms.length}`, rect: [Math.min(A[0], B[0]), Math.min(A[1], B[1]), Math.max(A[0], B[0]), Math.max(A[1], B[1])], y, kind: 'shop' });
  }
  return { id: 'constantinople-interiors', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-400, -160, 262, 362], entrance: { at: [-150, 110], facing: 'e' } };
}

/** The people of the interiors: keepers at their counters, a family at table, a priest and worshippers, bathers. */
export function interiorLife() {
  const out = [], rand = rng(9071), pick = (a) => a[Math.floor(rand() * a.length)];
  const CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_green', 'cloth_ochre', 'cloth_red'];
  const fig = (at, y, rot, o = {}) => out.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_light' : 'skin_medium', dress: 'tunic', legs: 'hose', cloth: pick(CL), cloth2: pick(CL), hat: 'none', pose: 'stand', ...o });
  const face = (p, q) => Math.atan2(-(q[0] - p[0]), -(q[1] - p[1]));
  for (const s of shopsOf()) {
    if (rand() < 0.4) continue;
    const { W, y } = shopFrame(s.st, s.k, s.ns), p = W(0.2, 1.3), q = W(0.2, -3);
    fig(p, y, face(p, q), { cloth: pick(['cloth_brown', 'cloth_white', 'cloth_ochre']) });
    if (rand() < 0.3) { const p2 = W(-0.9, 0.6); fig(p2, y, face(p2, W(0, 3)), { dress: 'robe', hat: 'veil', cloth: pick(CL), pose: 'talk' }); }
  }
  const S = specials(), [hx0, hz0, hx1, hz1] = S.home.rect, Y0 = S.home.y + 0.2, zc = (hz0 + hz1) / 2, tc = [hx0 + 5.5, zc + 0.2];
  fig([tc[0] - 2.1, tc[1]], Y0, face([tc[0] - 2.1, tc[1]], tc), { dress: 'robe', over: 'collar', cloth: 'cloth_green', cloth2: 'cloth_white', pose: 'sit' });
  fig([tc[0] + 2.1, tc[1]], Y0, face([tc[0] + 2.1, tc[1]], tc), { dress: 'robe', hat: 'veil', cloth: 'cloth_red', pose: 'sit' });
  fig([hx0 + 10.5, hz1 - 3.4], Y0, Math.PI, { dress: 'robe', hat: 'veil', cloth: 'cloth_ochre' });
  for (const k of ['home2', 'home3']) if (S[k]) { const [a0, b0, , b1] = S[k].rect, Yh = S[k].y + 0.2, zz = (b0 + b1) / 2; fig([a0 + 7.5, zz + 0.2], Yh, Math.PI, { dress: 'robe', hat: 'veil', cloth: pick(CL), pose: 'talk' }); fig([a0 + 8.6, zz + 0.4], Yh, Math.PI + 0.5, { dress: 'tunic', cloth: pick(CL), pose: 'talk' }); }
  if (S.tavern) { const [a0, b0, , b1] = S.tavern.rect, Yt = S.tavern.y + 0.2;
    fig([a0 + 6.6, b1 - 2.8], Yt, Math.PI, { cloth: 'cloth_white', cloth2: 'cloth_brown', pose: 'stand' });
    for (const [dx, dz, r] of [[2.8, 2.5, 0], [2.9, 4.2, Math.PI], [6.2, 6.6, 1.6], [6.0, 8.2, -1.6], [2.8, 6.6, 0.4]]) fig([a0 + dx, b0 + dz], Yt, r, { pose: 'sit', dress: rand() < 0.3 ? 'robe' : 'tunic', hat: 'none' }); }
  if (S.bakery) { const [a0, b0] = S.bakery.rect, Yb = S.bakery.y + 0.2; fig([a0 + 4.7, b0 + 3.0], Yb, 0, { dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_white' }); fig([a0 + 4.0, b0 + 6.4], Yb, Math.PI, { dress: 'robe', hat: 'veil', cloth: pick(CL) }); }
  if (S.weaver) { const [a0, b0] = S.weaver.rect, Yw = S.weaver.y + 0.2; for (const dx of [2.6, 6.2]) fig([a0 + dx, b0 + 3.2], Yw, Math.PI, { dress: 'robe', hat: 'veil', cloth: pick(CL), pose: 'sit' }); fig([a0 + 4.4, b0 + 8.0], Yw, Math.PI, { dress: 'tunic', cloth: pick(CL) }); }
  const [cx0, cz0, cx1, cz1] = S.chapel.rect, Yc = S.chapel.y + 0.25, ccz = (cz0 + cz1) / 2;
  fig([cx1 - 5.2, ccz], Yc, Math.PI / 2, { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', over: 'none' });
  for (let k = 0; k < 6; k++) { const x = cx0 + 3 + rand() * 6, z = ccz + (rand() - 0.5) * 7, woman = rand() < 0.5; fig([x, z], Yc, Math.PI / 2 + (rand() - 0.5) * 0.4, woman ? { dress: 'robe', hat: 'veil', cloth: pick(CL) } : { pose: rand() < 0.5 ? 'pray' : 'stand' }); }
  // Hagia Eirene: a priest at the altar, a deacon with the censer's smoke elsewhere (smoke.js), worshippers in the nave and aisles
  { const zc = EIRENE[1] + 27.5, xa = EIRENE[2] - 6.8, ax = xa - 6.2 * 0.55;
    fig([ax - 2.6, zc], 0.1, -Math.PI / 2, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', arms: 'clasp', hair: 'long' });
    for (let k = 0; k < 9; k++) { const x = xa - 24 + rand() * 11, z = zc + (rand() - 0.5) * 12, woman = z < zc - 6 || z > zc + 6 || rand() < 0.4; fig([x, z], 0.1, -Math.PI / 2 + (rand() - 0.5) * 0.5, woman ? { dress: 'robe', hat: 'veil', cloth: pick(CL), pose: rand() < 0.4 ? 'pray' : 'stand' } : { pose: rand() < 0.5 ? 'pray' : 'stand' }); } }
  const [bx0, bz0, bx1, bz1] = S.bath.rect, Yb = S.bath.y + 0.2;
  for (let k = 0; k < 4; k++) fig([bx0 + 1.5 + rand() * (bx1 - bx0 - 3), bz1 - 2.5 - rand() * 3], Yb, rand() * 6.28, { dress: 'wrap', cloth: 'cloth_white', pose: rand() < 0.4 ? 'sit' : 'stand' });
  return out;
}
export const interiorLifePlan = () => ({ id: 'constantinople-interior-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: interiorLife(), rooms: [], bounds: [-400, -160, 262, 362], entrance: { at: [-150, 110], facing: 'e' } });
