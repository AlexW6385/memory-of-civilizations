// The low upper room (tsushi nikai) of the Muromachi machiya, opened (docs/settlements/muromachi-kyoto.md §11): a steep ladder-stair
// from the raised rooms beside the earth passage up through the floor to the room under the roof — boards or mats, a rail along
// the open side of the passage (the earth passage stays open to the roof), windows of plastered lattice (mushiko) that are open
// reveals onto the street, the roof's rafters and purlins bare overhead, the furnishing by the use of the house: guests' bedding
// (inn), stores (merchant), the work (craftsman), the family's sleeping (keepers' dwelling). Built in the machiya's frame (front +z).
import { rng, WD, TM, tatami, quad2 } from './kit.js';

const PLK = 'planks_grey';
const KIND = { food: 'inn', tea: 'inn', rice: 'merchant', sake: 'merchant', doso: 'merchant', wood: 'merchant', cloth: 'merchant', pottery: 'merchant', paper: 'craft', sandals: 'craft', dye: 'craft', smith: 'craft', lacquer: 'craft' };
export const useOf = (trade, keeper) => (keeper ? 'dwelling' : KIND[trade] || 'merchant');
/** A number in 0…1 from a place: the repeated pieces (bars, balusters, treads, joists) differ a little by where they stand, so none is one shape repeated. */
const jit = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };

/** Where the windows of the upper front are: the x of each 1.1 m opening, over the floored width (the earth passage's side has none). */
export function upWindows(w, x1) {
  const lo = -w / 2 + 0.35, hi = x1 - 0.3, nw = hi - lo >= 3.5 ? 2 : 1;
  return Array.from({ length: nw }, (_, k) => lo + (k + 0.5) * (hi - lo) / nw);
}
/** The stair's place: the foot z, the top z (where the floor begins), from the front room's depth qm. */
export const stairAt = (qm) => { const top = -(qm + 1.1); return { top, foot: top - 1.9, wall: top - 1.95 }; };

/** The front of the upper room: the wall of plaster between the posts with its openings (reveals), each filled with plastered lattice (mushiko): the walk-through
 * sill is 0.45 m, the head 1.5 m over the floor. */
export function upFront({ B }, { hw, y0, H, yT, wins }) {
  const yb = y0 + H, sill = yb + 0.45, head = yb + 1.5, z0 = -0.07, z1 = 0.03, xa = -hw + 0.1, xb = hw - 0.1;
  B('plaster_grey', xa, yb, z0, xb, sill, z1);
  B('plaster_grey', xa, head, z0, xb, yT - 0.28, z1);
  B('plaster_streak', xa, sill - 0.4, z1, xb, sill - 0.05, z1 + 0.004);
  let prev = xa;
  for (const xc of wins) {
    const a = xc - 0.55, b = xc + 0.55;
    B('plaster_grey', prev, sill, z0, a, head, z1); prev = b;
    B(WD, a - 0.06, sill, -0.1, a, head, 0.07); B(WD, b, sill, -0.1, b + 0.06, head, 0.07);        // the jambs
    B(WD, a - 0.06, sill - 0.05, -0.1, b + 0.06, sill, 0.09); B(WD, a - 0.06, head, -0.1, b + 0.06, head + 0.07, 0.07);   // the sill board and the lintel
    for (let x = a + 0.03; x < b - 0.04; x += 0.1) { const j = jit(x, a); B('plaster_white', x, sill, 0.0, x + 0.045 + 0.012 * j, head - 0.012 * jit(a, x), 0.065 + 0.012 * j); }                 // the lattice: bars of plastered wood, a hand apart
    B(WD, a, sill + 0.5, 0.03, b, sill + 0.54, 0.05);                                                                         // a cross-rail through the bars
  }
  B('plaster_grey', prev, sill, z0, xb, head, z1);
}

/** The ramp line of the stair as the heights it must have: the nosing plane through (top, yU) with the stair's slope. */
function stairLine(yU, f0, S) {
  const n = Math.round((yU - f0) / 0.27), run = (S.top - S.foot - 0.15) / (n - 1), rt = (yU - f0) / n;
  return { n, run, rt, slope: rt / run, nose: (k) => ({ z: S.top - (n - k) * run, y: yU - (n - k) * rt }) };
}

export function upperRooms({ B, T, col }, P) {
  const { hw, d, y0, H, yT, rise, x1, qm, fl, trade, keeper, seed, wins } = P;
  const yU = y0 + H, f0 = y0 + fl, xw = -hw + 0.1, zN = -0.1, S = stairAt(qm), zS = S.wall, ztop = S.top;
  const use = useOf(trade, keeper), r = rng(seed * 17 + 5), mats = use === 'inn' || use === 'dwelling';
  const xs1 = x1 - 0.06, xs0 = x1 - 1.34;                     // the stair between its stiles
  const xl = x1 - 1.6;                                        // the west part of the room: furniture; east of it the lane from the stair to the windows stays free
  // ---- the floor: boards on joists with the edge beams, the stairwell open (a trimmer beam round it), real colliders
  const slab = (xa, za, xb, zb) => { B(PLK, xa, yU - 0.12, za, xb, yU, zb); col.floor([xa, za, xb, zb], yU); };
  slab(xw, ztop, x1 - 0.1, zN); slab(xw, zS, x1 - 1.5, ztop);
  col.floor([x1 - 0.1, ztop, x1, zN], yU);
  B(WD, x1 - 0.1, yU - 0.32, zS - 0.06, x1 + 0.05, yU, zN);                                                 // the edge beam along the void of the earth passage
  B(WD, x1 - 1.5, yU - 0.32, zS - 0.06, x1 - 1.4, yU, ztop);                                               // the trimmer on the stairwell's west side
  B(WD, x1 - 1.5, yU - 0.25, zS - 0.06, x1 + 0.05, yU, zS + 0.06);                                          // the header over the stair's foot, which carries the partition
  for (let z = zN - 0.5; z > zS; z -= 0.9) { const j = jit(z, xw + hw); B(WD, xw, yU - 0.3 + 0.03 * j, z - 0.05 - 0.01 * j, z > ztop ? x1 - 0.1 : x1 - 1.5, yU - 0.12, z + 0.05 + 0.012 * j); }
  // the front wall's collider and the partition at the back of the room (boards to the beam; the roof space is open above it)
  col.rect([-hw, -0.1, hw, 0.05], yU, yT);
  B(PLK, xw, yU, zS - 0.04, x1 - 0.1, yT - 0.28, zS + 0.04); B(WD, xw, yT - 0.4, zS - 0.06, x1 - 0.1, yT - 0.28, zS + 0.06); col.rect([xw, zS - 0.04, x1 - 0.1, zS + 0.04], yU, yT);
  for (let x = xw + 0.5; x < x1 - 0.5; x += 0.75) B(WD, x, yU, zS + 0.04, x + 0.06, yT - 0.4, zS + 0.08);   // the posts of the partition, seen from the room
  // ---- the rail along the passage's void and round the stairwell: posts, a top rail and a mid rail (nothing lower than 0.6 m, so that it cannot be stepped on), balusters
  const rail = (xa, za, xb, zb, alongZ) => {
    const x = (xa + xb) / 2, len = alongZ ? zb - za : xb - xa;
    B(WD, xa, yU + 0.84, za, xb, yU + 0.92, zb); B(WD, xa, yU + 0.6, za, xb, yU + 0.65, zb);
    const n = Math.max(1, Math.round(len / 1.3));
    for (let i = 0; i <= n; i++) { const u = (alongZ ? za : xa) + len * i / n; { const j = jit(u, xa + za); alongZ ? B(WD, xa - 0.01, yU, u - 0.04 - 0.01 * j, xb + 0.01, yU + 0.84 - 0.02 * j, u + 0.04) : B(WD, u - 0.04 - 0.01 * j, yU, za - 0.01, u + 0.04, yU + 0.84 - 0.02 * j, zb + 0.01); } }
    for (let i = 0; i < len / 0.14; i++) { const u = (alongZ ? za : xa) + 0.07 + i * 0.14; if (u > (alongZ ? zb : xb) - 0.04) break; { const j = jit(u, x + zb); alongZ ? B(WD, x - 0.012, yU + 0.65, u - 0.012, x + 0.012 + 0.004 * j, yU + 0.84 - 0.01 * j, u + 0.012) : B(WD, u - 0.012, yU + 0.65, zb - 0.012, u + 0.012, yU + 0.84, zb + 0.012 + 0.004 * j); } }
  };
  rail(x1 - 0.06, zS, x1 - 0.01, zN, true); col.rect([x1 - 0.07, zS, x1 + 0.02, zN], yU, yU + 0.9);
  rail(x1 - 1.44, zS, x1 - 1.39, ztop, true); col.rect([x1 - 1.45, zS, x1 - 1.38, ztop], yU, yU + 0.9);
  // ---- the stair: steep ladder-stair of open treads between two stiles, the walkable ramp a little under the nosings (low end 0.5 m under the rung plane, 1.2 m wide)
  const st = stairLine(yU, f0, S), plane = (z) => yU - (ztop - z) * st.slope;
  for (let k = 1; k < st.n; k++) { const { z, y } = st.nose(k); B(WD, xs0 + 0.03, y - 0.05, z, xs1 - 0.03, y, z + 0.24 + 0.04 * jit(z, y)); }
  for (const [xa, xb] of [[x1 - 1.4, xs0 + 0.03], [xs1 - 0.03, x1 - 0.02]]) {
    const t = [], z0 = st.nose(1).z - 0.2, z1 = ztop;
    quad2(t, [xa, plane(z0) - 0.12, z0], [xb, plane(z0) - 0.12, z0], [xb, plane(z1) - 0.12, z1], [xa, plane(z1) - 0.12, z1]);
    quad2(t, [xa, plane(z0) + 0.14, z0], [xa, plane(z1) + 0.14, z1], [xa, plane(z1) - 0.12, z1], [xa, plane(z0) - 0.12, z0]);
    quad2(t, [xb, plane(z0) + 0.14, z0], [xb, plane(z1) + 0.14, z1], [xb, plane(z1) - 0.12, z1], [xb, plane(z0) - 0.12, z0]);
    T(WD, t);
    B(WD, xa, yU - 0.4, ztop - 0.02, xb, yU + 0.92, ztop + 0.05);                                           // the newel post at the floor's edge
  }
  const zA = S.foot - 0.35;
  col.ramp([xs0 + 0.07, zA, xs1 - 0.07, ztop], plane(zA) - 0.08, yU - 0.08, 's');
  // ---- the roof overhead: rafters and purlins bare (the roof of plankRoof: eave yT at z 1.0, ridge yT + rise at z = -d/2, back eave at -d - 0.8)
  { const zr = -d / 2, zf = 1.0, zbk = -d - 0.8, yf = (z) => yT + rise * (zf - z) / (zf - zr), yb = (z) => yT + rise * (z - zbk) / (zr - zbk), t = [];
    for (let x = -hw + 0.3; x < hw - 0.2; x += 0.62) {
      for (const [za, zb, f] of [[0.3, zr, yf], [zr, -d + 0.1, yb]]) {
        const a = f(za) - 0.18, b = f(zb) - 0.18;
        quad2(t, [x - 0.04, a - 0.09, za], [x + 0.04, a - 0.09, za], [x + 0.04, b - 0.09, zb], [x - 0.04, b - 0.09, zb]);
        quad2(t, [x - 0.04, a, za], [x - 0.04, b, zb], [x - 0.04, b - 0.09, zb], [x - 0.04, a - 0.09, za]);
        quad2(t, [x + 0.04, a, za], [x + 0.04, b, zb], [x + 0.04, b - 0.09, zb], [x + 0.04, a - 0.09, za]);
      }
    }
    T('timber', t);
    for (const [z, f] of [[zr + (zf - zr) * 0.5, yf], [zr + (zf - zr) * 0.1, yf], [zr + (zbk - zr) * 0.4, yb]]) B(WD, -hw + 0.1, f(z) - 0.18 - 0.09 - 0.12, z - 0.06, hw - 0.1, f(z) - 0.18 - 0.09, z + 0.06);
  }
  // ---- the furnishing by use, in the west part of the room (x from the wall to xl); the lane (xl … x1 - 0.1) is kept free
  const yF = mats ? yU + 0.03 : yU, X0 = xw + 0.06, X1 = xl, wd = X1 - X0;
  if (mats) { tatami(B, xw + 0.02, x1 - 0.12, ztop + 0.02, zN - 0.02, yF, false); B(WD, xw + 0.02, yU, ztop - 0.02, x1 - 0.12, yU + 0.03, ztop + 0.02); }
  const slots = [[-2.0, -0.35], [-3.7, -2.15], [-5.15, -3.8], [zS + 0.12, ztop - 0.12]];
  const futon = (z0, z1, cover) => { B('cloth_white', X0 + 0.1, yF, z0, X0 + 1.05, yF + 0.07, z1); B(cover, X0 + 0.12, yF + 0.07, z0 + 0.5, X0 + 1.03, yF + 0.11, z1 - 0.02); B('linen', X0 + 0.3, yF + 0.07, z0 + 0.08, X0 + 0.85, yF + 0.16, z0 + 0.38); };
  const folded = (z, k = 3) => { for (let i = 0; i < k; i++) B(['cloth_indigo', 'cloth_white', 'cloth_brown', 'cloth_maroon'][(i + (seed >> 3)) % 4], X0 + 0.05, yF + i * 0.16, z, X0 + 0.7, yF + i * 0.16 + 0.15, z + 0.9 - i * 0.04); col.rect([X0 + 0.05, z, X0 + 0.7, z + 0.9], yF, yF + 0.5); };
  const chest = (z, big) => { B('lacquer_black', X0, yF, z, X0 + 0.55, yF + (big ? 0.95 : 0.7), z + 0.95); B('iron', X0 + 0.55, yF + 0.2, z + 0.4, X0 + 0.58, yF + 0.34, z + 0.55); B('iron', X0 + 0.55, yF + (big ? 0.6 : 0.4), z + 0.1, X0 + 0.575, yF + (big ? 0.64 : 0.44), z + 0.85); col.rect([X0, z, X0 + 0.58, z + 0.95], yF, yF + (big ? 0.95 : 0.7)); };
  const jar = (x, z, k = 1, m = 'pottery_dark') => { B(m, x - 0.2 * k, yF, z - 0.2 * k, x + 0.2 * k, yF + 0.5 * k, z + 0.2 * k); B(m, x - 0.15 * k, yF + 0.5 * k, z - 0.15 * k, x + 0.15 * k, yF + 0.62 * k, z + 0.15 * k); B('rope_fibre', x - 0.21 * k, yF + 0.3 * k, z - 0.21 * k, x + 0.21 * k, yF + 0.33 * k, z + 0.21 * k); col.circle(x, z, 0.28 * k, yF, yF + 0.62 * k); };
  const desk = (z0, z1) => { B('wood_dark', X0 + 0.05, yF + 0.28, z0 + 0.1, X0 + 0.55, yF + 0.33, z1 - 0.1); for (const a of [0.08, 0.5]) for (const b of [z0 + 0.14, z1 - 0.14]) B(WD, X0 + a - 0.025, yF, b - 0.025, X0 + a + 0.025, yF + 0.28, b + 0.025); B('cloth_maroon', X0 + 0.7, yF, (z0 + z1) / 2 - 0.25, X0 + 1.2, yF + 0.05, (z0 + z1) / 2 + 0.25); };
  const lamp = (x, z) => { B(WD, x - 0.1, yF, z - 0.1, x + 0.1, yF + 0.04, z + 0.1); B('lamp_white', x - 0.08, yF + 0.04, z - 0.08, x + 0.08, yF + 0.5, z + 0.08); B(WD, x - 0.1, yF + 0.5, z - 0.1, x + 0.1, yF + 0.54, z + 0.1); };
  const pole = (z, mat, n, hg = 1.5) => { B(WD, X0, yF + hg, z - 0.02, X1, yF + hg + 0.05, z + 0.02); for (let i = 0; i < n; i++) { const x = X0 + 0.12 + i * (wd - 0.3) / Math.max(1, n - 1) * (n > 1 ? 1 : 0); B(Array.isArray(mat) ? mat[i % mat.length] : mat, Math.min(x, X1 - 0.5), yF + hg - 0.85, z - 0.012, Math.min(x, X1 - 0.5) + 0.42, yF + hg, z + 0.012); } };
  const bales = (z0, z1) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { const x = X0 + 0.25 + i * 0.4, z = z0 + 0.22 + j * 0.4 + (j > 1 ? 0 : 0); { B('thatch', x - 0.17, yF, z - 0.17, x + 0.17, yF + 0.6, z + 0.17); B('rope_fibre', x - 0.18, yF + 0.15, z - 0.18, x + 0.18, yF + 0.18, z + 0.18); B('rope_fibre', x - 0.18, yF + 0.42, z - 0.18, x + 0.18, yF + 0.45, z + 0.18); } } col.rect([X0 + 0.05, z0 + 0.05, X0 + 0.85, z0 + 1.3], yF, yF + 0.6); };
  const [s1, s2, s3, s4] = slots;
  if (use === 'inn') {
    futon(...s1, 'cloth_indigo'); futon(...s2, 'cloth_maroon');                                              // the guests' bedding laid out
    desk(...s3); lamp(X0 + 1.45, (s3[0] + s3[1]) / 2);
    folded(s4[0] + 0.1, 4); B(WD, X0 + 1.0, yF, s4[0] + 0.15, X0 + 1.3, yF + 0.3, s4[0] + 0.55);
  } else if (use === 'merchant') {
    desk(...s1); B('paint_white', X0 + 0.12, yF + 0.33, s1[0] + 0.3, X0 + 0.48, yF + 0.4, s1[0] + 0.55);       // the ledgers
    if (trade === 'rice') bales(s2[0], s2[1]);
    else if (trade === 'sake') { jar(X0 + 0.35, s2[0] + 0.4, 1.0, 'timber'); jar(X0 + 0.95, s2[0] + 0.45, 1.0, 'timber'); jar(X0 + 0.4, s2[1] - 0.4, 1.0, 'timber'); }
    else if (trade === 'doso') { chest(s2[0] + 0.2, true); chest(s3[0] + 0.1, true); for (let k = 0; k < 6; k++) B('bronze', X0 + 0.7 + (k % 3) * 0.1, yF + (k >> 1) * 0.04, s2[0] + 0.3, X0 + 0.76 + (k % 3) * 0.1, yF + (k >> 1) * 0.04 + 0.12, s2[0] + 0.5); }
    else if (trade === 'wood') { for (let i = 0; i < 4; i++) B(WD, X0 + 0.05, yF + i * 0.13, s2[0] + 0.1, X0 + 1.7, yF + i * 0.13 + 0.12, s2[0] + 0.45); col.rect([X0 + 0.05, s2[0] + 0.1, X0 + 1.7, s2[0] + 0.45], yF, yF + 0.5); }
    else if (trade === 'cloth') { for (let i = 0; i < 4; i++) B(['cloth_indigo', 'cloth_red', 'linen', 'cloth_ochre'][i], X0 + 0.05, yF + i * 0.2, s2[0] + 0.1, X0 + 0.65, yF + i * 0.2 + 0.19, s2[0] + 1.3); col.rect([X0 + 0.05, s2[0] + 0.1, X0 + 0.65, s2[0] + 1.3], yF, yF + 0.8); }
    else { jar(X0 + 0.35, s2[0] + 0.4); jar(X0 + 0.9, s2[0] + 0.45, 0.8); jar(X0 + 0.4, s2[1] - 0.4, 0.9); }
    if (trade !== 'doso') chest(s3[0] + 0.1, false);
    folded(s4[0] + 0.1, 3);
  } else if (use === 'craft') {
    // the work by the window's light, the stock beyond it, a pole across the room for what is drying, the bedding at the back
    if (trade === 'paper') { B(WD, X0 + 0.05, yF, s1[0] + 0.1, X0 + 0.6, yF + 0.42, s1[1] - 0.1); for (let k = 0; k < 3; k++) B('paint_white', X0 + 0.1, yF + 0.42, s1[0] + 0.2 + k * 0.5, X0 + 0.5, yF + 0.42 + 0.08 + k * 0.04, s1[0] + 0.6 + k * 0.5);
      for (let k = 0; k < 4; k++) { B(WD, X0 + 0.04, yF, s2[0] + 0.15 + k * 0.38, X0 + 0.08, yF + 1.3, s2[0] + 0.19 + k * 0.38); B('paint_white', X0 + 0.08, yF + 0.1, s2[0] + 0.15 + k * 0.38, X0 + 0.34, yF + 1.25, s2[0] + 0.17 + k * 0.38); }       // the drying boards, leaning
      pole(s3[0] + 0.7, 'linen', 4); }
    else if (trade === 'sandals') { B(WD, X0 + 0.05, yF, s1[0] + 0.1, X0 + 0.45, yF + 0.3, s1[0] + 0.5); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) B('thatch', X0 + 0.55 + j * 0.3, yF, s2[0] + 0.1 + i * 0.45, X0 + 0.85 + j * 0.3, yF + 0.5 - j * 0.1, s2[0] + 0.45 + i * 0.45); col.rect([X0 + 0.55, s2[0] + 0.1, X0 + 1.15, s2[0] + 1.45], yF, yF + 0.5); pole(s3[0] + 0.7, 'thatch', 5, 1.45); }
    else if (trade === 'dye') { pole(s2[0] + 0.5, ['cloth_indigo', 'cloth_white', 'cloth_blue'], 4); pole(s3[0] + 0.5, ['cloth_white', 'cloth_indigo'], 4, 1.4); B(WD, X0 + 0.05, yF, s1[0] + 0.1, X0 + 0.6, yF + 0.38, s1[1] - 0.1); B('cloth_indigo', X0 + 0.1, yF + 0.38, s1[0] + 0.2, X0 + 0.55, yF + 0.44, s1[0] + 0.8); }
    else if (trade === 'smith') { for (let k = 0; k < 2; k++) { B('iron', X0 + 0.1, yF, s1[0] + 0.15 + k * 0.7, X0 + 0.55, yF + 0.35, s1[0] + 0.75 + k * 0.7); } chest(s2[0] + 0.2, false); for (let k = 0; k < 3; k++) B('iron', X0 + 0.8 + k * 0.15, yF, s2[0] + 0.3, X0 + 0.85 + k * 0.15, yF + 0.6, s2[0] + 0.34); }
    else { B('lacquer_black', X0 + 0.1, yF, s1[0] + 0.1, X0 + 0.6, yF + 0.4, s1[1] - 0.1); for (let k = 0; k < 4; k++) B(k % 2 ? 'lacquer_red' : 'lacquer_black', X0 + 0.12 + (k % 2) * 0.2, yF + 0.4, s1[0] + 0.2 + k * 0.3, X0 + 0.3 + (k % 2) * 0.2, yF + 0.46, s1[0] + 0.45 + k * 0.3); chest(s2[0] + 0.2, false); }
    folded(s4[0] + 0.1, 3); if (trade !== 'paper' && trade !== 'sandals') chest(s3[0] + 0.1, false);
  } else {                                                                                                    // dwelling: the family's sleeping and what it keeps
    desk(...s1); B('iron', X0 + 0.9, yF, s1[0] + 0.5, X0 + 1.1, yF + 0.2, s1[0] + 0.7);                      // a low table and the brazier
    chest(s2[0] + 0.2, true); folded(s2[0] + 1.0 > s2[1] ? s2[0] : s3[0] + 0.1, 3);
    futon(s4[0] + 0.0, s4[1], 'cloth_brown'); lamp(X0 + 1.4, (s3[0] + s3[1]) / 2);
  }
  void r; void wd;
}
