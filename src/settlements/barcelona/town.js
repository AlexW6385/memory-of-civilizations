// The Eixample's blocks (docs/settlements/barcelona.md §5): every block a ring of houses round its
// court; Casa Milà's block keeps its north-west corner for the house, Casa Batlló's block a gap on
// the Passeig for it (both built with the landmark). The street life of 1910 (§5a): the trams on the
// Passeig de Gràcia and on a line that turns off it round the cut corners, east along a cross street
// and up the Carrer de la Marina past the Nativity façade; hackney carriages at the kerbs.
import { blockShops } from '../../styles/modernisme/index.js';
import { RADIUS, PITCH, BLOCK, BATLLO, CASA, GRACIA_X, MERCAT, SAGRADA, shopCore, blocks, height, onDiagonal, bancsFanals } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements) => ({ id, style: 'modernisme', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 46], facing: 'n' } });
const Y = (x, z) => height(x, z);

/** A straight run from a to b, sampled every 4 m (the ground's slope followed). */
function straight(a, b) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 4)), out = []; for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; out.push([x, z, Y(x, z)]); } return out; }
/** A quarter turn about the centre c, radius r, from angle a0 to a1. */
function arc(c, r, a0, a1) { const n = 12, out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r; out.push([x, z, Y(x, z)]); } return out; }

/** The tram lines: runs and their curves (each an element, the poles closer round the curves). */
function tramLines() {
  const R = 14, X1 = GRACIA_X, ZS = PITCH / 2, XM = PITCH * 2.5;              // the Passeig, the cross street, the Marina
  const avoid = blocks().map((b) => [b.c[0] - BLOCK / 2, b.c[1] - BLOCK / 2, b.c[0] + BLOCK / 2, b.c[1] + BLOCK / 2]);
  const runs = [
    { pts: straight([X1, -330], [X1, ZS - R]), every: 30 },                                       // the Passeig from Gràcia down to the turn
    { pts: arc([X1 + R, ZS - R], R, Math.PI, Math.PI / 2), every: 6, skipFirst: true },            // round the cut corner, east
    { pts: straight([X1 + R, ZS], [XM - R, ZS]), every: 30, skipFirst: true },                     // along the cross street
    { pts: arc([XM - R, ZS - R], R, Math.PI / 2, 0), every: 6, skipFirst: true },                  // round the corner, north
    { pts: straight([XM, ZS - R], [XM, -220]), every: 36, skipFirst: true },                       // up the Marina past the façade (poles at z -76 and -112, clear of the arrival's view of the portals)
    { pts: straight([X1, ZS - R], [X1, 330]), every: 30, skipFirst: true },                        // the Passeig on toward the old city
  ];
  return runs.map((r) => ({ t: 'tram_line', ...r, avoid }));
}
/** Trams on the lines: on the right-hand track for the line's direction or the left for the other way. */
function trams(lines, rand) {
  const out = [], put = (pts, s, side, kind) => {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let i = 0; while (i < pts.length - 2 && cum[i + 1] < s) i++;
    const f = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, z = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
    const d = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]], l = Math.hypot(...d), o = [-d[1] / l, d[0] / l];
    const px = x + o[0] * side * 1.55, pz = z + o[1] * side * 1.55, dir = side > 0 ? d : [-d[0], -d[1]];
    if (Math.hypot(px, pz) > RADIUS - 40) return;
    if (Math.abs(px - PITCH * 2.5) < 4 && Math.abs(pz + 90) < 11) return;                       // (none standing across the walk from the Marina to the façade)
    out.push({ t: 'tram', at: [px, pz], y: Y(px, pz) + 0.03, rot: Math.atan2(-dir[0], -dir[1]), kind, wire: 5.87, seed: Math.floor(rand() * 1e9) });
  };
  const len = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  for (const ln of lines) {
    if (ln.every < 10) continue;                                                                  // none standing on the curves
    const L = len(ln.pts);
    for (let s = 20 + rand() * 30; s < L - 12; s += 70 + rand() * 60) put(ln.pts, s, rand() < 0.5 ? 1 : -1, rand() < 0.45 ? 'open' : 'closed');
  }
  return out;
}
/** Hackney carriages at the kerbs (two of them at a rank on the Passeig), clear of the crossings and the tracks. */
function carriages(rand) {
  const out = [], half = (PITCH - BLOCK) / 2;
  const crossing = (x, z) => { const m = (v) => Math.abs(((v % PITCH) + PITCH) % PITCH - PITCH / 2); return m(x) < half + 3 && m(z) < half + 3; };
  const add = (x, z, rot) => { if (Math.hypot(x, z) > RADIUS - 45 || crossing(x, z) || onDiagonal(x, z, 6)) return; out.push({ t: 'carriage', at: [x, z], y: Y(x, z), rot, rect: Math.abs(Math.sin(rot)) > 0.5 ? [x - 2.6, z - 0.9, x + 2.6, z + 0.9] : [x - 0.9, z - 2.6, x + 0.9, z + 2.6], seed: Math.floor(rand() * 1e9) }); };
  // the rank on the Passeig's west side, facing down toward the old city
  for (const z of [-120, -112.5, 120, 127.5]) add(GRACIA_X - 5.6, z, Math.PI);
  // here and there in the cross streets and the streets, kept to the right
  for (let i = -4; i <= 4; i++) for (let k = -4; k <= 4; k++) {
    if (rand() > 0.22) continue;
    const ns = rand() < 0.5, c = (ns ? i : k) * PITCH + PITCH / 2, along = (ns ? k : i) * PITCH + (rand() - 0.5) * 40, dir = rand() < 0.5 ? 1 : -1;
    if (ns) { if (Math.abs(c - GRACIA_X) < 1 || Math.abs(c - PITCH * 2.5) < 1) continue; add(c + dir * 5.5, along, dir > 0 ? 0 : Math.PI); }
    else { if (Math.abs(c - PITCH / 2) < 1) continue; add(along, c - dir * 5.5, dir > 0 ? Math.PI / 2 : -Math.PI / 2); }
  }
  return out;
}

/** The people of the house with the café (layout.js CASA): customers, the waiter and the barman, the confectioner's assistant, the flat's piano and kitchen. */
function casaLife() {
  const L = [], rand = rng(1909), { fx, z0 } = CASA, y0 = height(fx - 9, z0 + 8), F0 = y0 + 0.12, PF = y0 + 7.4;
  const W3 = (a, b) => [fx - b, z0 + a], pick = (a) => a[Math.floor(rand() * a.length)];
  // facing from (a, b) toward (ta, tb): the figure's front is −z, a runs to +z and b to −x
  const face = (a, b, ta, tb) => Math.atan2(-(-(tb - b)), -(ta - a));
  const put = (a, b, ta, tb, y, o) => L.push({ t: 'figure', at: W3(a, b), y, rot: face(a, b, ta, tb), seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'stand', hair: 'short', ...o });
  const man = (o = {}) => ({ dress: 'trousers', cloth: pick(['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo']), cloth2: pick(['cloth_black', 'cloth_grey']), hat: pick(['brim', 'brim', 'cap', 'none']), hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']), beard: rand() < 0.5 ? 0.8 : 0, ...o });
  const lady = (o = {}) => ({ dress: 'robe', cloth: pick(['cloth_white', 'cloth_maroon', 'cloth_indigo', 'cloth_grey', 'cloth_green']), cloth2: 'cloth_white', hat: 'brim', hatMat: pick(['cloth_white', 'cloth_black', 'cloth_maroon']), hair: 'bun', over: 'shawl', ...o });
  // the café: the customers on the chairs of the tables (the chair is 0.62 m from the table's centre on the side given)
  const seat = (ta, tb, fa, fb, o) => put(ta + fa * 0.62, tb + fb * 0.62, ta, tb, F0, { pose: 'sit', ...o });
  seat(1.5, 2.0, 1, 0, man()); seat(1.5, 2.0, 0, 1, man({ pose: 'talk' })); seat(7.4, 4.7, -1, 0, lady()); seat(7.4, 4.7, 0, -1, man()); seat(7.4, 9.5, 0, 1, man()); seat(4.6, 9.4, 1, 0, man()); seat(4.6, 9.4, -1, 0, lady({ pose: 'talk' }));
  seat(7.4, 12.0, 0, -1, man());
  put(1.1, 12.2, 2.0, 12.2, F0, man({ dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_black', over: 'apron', hat: 'none' }));           // the barman behind the counter
  put(5.0, 6.0, 7.4, 7.1, F0, man({ cloth: 'cloth_black', cloth2: 'cloth_black', over: 'apron', hat: 'none', pose: 'stand' }));               // the waiter
  put(3.4, 13.6, 4.5, 14.8, F0, man({ pose: 'stand', hat: 'none' })); put(5.7, 15.6, 4.6, 15.2, F0, man({ pose: 'stand', hat: 'cap' }));      // two at the billiard table
  // the terrace on the pavement: a gentleman with his paper and a lady (the chairs sit north and south of each table)
  for (const [zt, who] of [[-99.3, 'm'], [-92.7, 'l']]) {
    const gx = fx + 1.7, y = height(gx, zt);
    L.push({ t: 'figure', at: [gx, zt - 0.55], y, rot: Math.PI, seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'sit', hair: 'short', ...(who === 'm' ? man() : lady()) });
  }
  // the confectioner's: the assistant behind the counter, a lady buying
  put(15.4, 4.2, 14.5, 4.2, F0, lady({ dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'apron', hat: 'none', hair: 'bun' }));
  put(13.8, 3.6, 14.7, 3.6, F0, lady({ pose: 'stand' }));
  // the flat: a lady at the piano, a man in the armchair with his paper, the cook at the range
  put(1.4, 2.6, 0.6, 2.6, PF, lady({ pose: 'sit', hat: 'none' }));
  put(6.6, 4.1, 5.0, 5.0, PF, man({ pose: 'sit', hat: 'none', cloth: 'cloth_grey' }));
  put(13.9, 15.4, 13.9, 16.6, PF, lady({ cloth: 'cloth_grey', cloth2: 'cloth_white', over: 'apron', hat: 'none', hair: 'bun' }));
  return L;
}
function mercatLife() {
  const L = [], rand = rng(1888), [cx, cz] = MERCAT, y = Math.max(Y(cx, cz - 27), Y(cx, cz + 27)) + 0.07, pick = (a) => a[Math.floor(rand() * a.length)];
  const GOODS = [['fish', 'fish', 'heap'], ['greens', 'melons', 'heap'], ['bread', 'baskets'], ['heap', 'greens'], ['fish', 'heap'], ['melons', 'greens', 'baskets']];
  const who = (at, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'trousers', cloth: pick(['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_white']), cloth2: pick(['cloth_white', 'linen', 'cloth_black']), skin: 'skin_light', hat: pick(['none', 'cap', 'brim']), hatMat: pick(['cloth_black', 'cloth_brown']), ...o });
  // the stalls back to back down the middle nave and along the side naves, their sellers behind and the buyers before
  for (const [zr, face] of [[-3.2, -1], [3.2, 1], [-15.5, 1], [15.5, -1]]) for (let x = cx - 25.5; x <= cx + 25.5; x += 3.4) {
    if (Math.abs(x - cx) < 2) continue;
    const rot = face > 0 ? 0 : Math.PI;
    L.push({ t: 'stall', at: [x, cz + zr], y, rot, w: 2.8, d: 1.3, goods: pick(GOODS), awning: 'cloth_white', seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.7) who([x + (rand() - 0.5), cz + zr - face * 1.2], rot, { dress: 'robe', over: 'apron', hat: 'none' });
    if (rand() < 0.45) who([x + (rand() - 0.5) * 1.5, cz + zr + face * 2.1], rot + Math.PI, { carry: rand() < 0.5 ? 'basket' : 'none' });
  }
  // the flower sellers on the pavement before the north side, a cart unloading
  for (let x = cx - 24; x <= cx + 24; x += 6) { L.push({ t: 'goods_mat', goods: ['baskets', 'greens'], at: [x, cz - 25], y, rot: 0, seed: Math.floor(x * 7 + 1e4) }); who([x + 0.9, cz - 25.8], Math.PI, { dress: 'robe', hat: 'none', pose: rand() < 0.5 ? 'sit_ground' : 'stand' }); }
  L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'horse', at: [cx + 33, cz + 4], y, rot: 0, seed: 1888 });
  return L;
}
/** The people of the shops (§9): the shopkeeper behind the counter in the dress of the trade, a customer in some, a few keepers on their doorsteps. */
function shopLife(els) {
  const out = [];
  els.forEach((el, bi) => {
    const rand = rng(7000 + bi * 13), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
    for (const sh of blockShops(el)) {
      const white = sh.trade === 'farmacia' || sh.trade === 'perruqueria' || sh.trade === 'forn';
      const rot = (f) => Math.atan2(-f[0], -f[1]);
      const o = { skin: 'skin_light', pose: 'stand', seed: 0 };
      for (const q of sh.people) {
        if (q.role === 'customer' && rand() > 0.38) continue;
        const keeper = q.role === 'keeper', lady = !keeper && rand() < 0.55;
        if (keeper && rand() < 0.07) continue;
        L.push({ t: 'figure', at: q.at, y: sh.y + 0.12, rot: rot(q.face), ...o, seed: Math.floor(rand() * 1e9), hair: lady ? 'bun' : 'short',
          ...(lady ? { dress: 'robe', cloth: pick(['cloth_maroon', 'cloth_indigo', 'cloth_grey', 'cloth_green']), cloth2: 'cloth_white', over: 'shawl', hat: 'none' }
            : keeper ? { dress: 'trousers', cloth: white ? 'cloth_white' : pick(['cloth_brown', 'cloth_grey', 'cloth_black']), cloth2: 'cloth_black', over: white ? 'none' : 'apron', hat: sh.trade === 'forn' ? 'cap' : 'none', hatMat: 'cloth_white', beard: rand() < 0.4 ? 0.8 : 0 }
              : { dress: 'trousers', cloth: pick(['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo']), cloth2: 'cloth_black', hat: pick(['brim', 'cap']), hatMat: pick(['cloth_black', 'cloth_grey']), beard: rand() < 0.4 ? 0.8 : 0 }) });
      }
      if (rand() < 0.22) { const d = sh.door, nx = sh.n[0], nz = sh.n[1]; L.push({ t: 'figure', at: [d[0] + nx * 1.1 + nz * 0.9, d[1] + nz * 1.1 - nx * 0.9], y: sh.y + 0.04, rot: rot([nx, nz]), ...o, seed: Math.floor(rand() * 1e9), hair: 'short', dress: 'trousers', cloth: white ? 'cloth_white' : 'cloth_brown', cloth2: 'cloth_black', over: white ? 'none' : 'apron', hat: 'none', beard: 0.8, pose: rand() < 0.5 ? 'talk' : 'stand' }); }
    }
    if (L.length) out.push(L);
  });
  return out;
}
/** Street sellers on the pavements of the arrival's streets and the Passeig's house (not on the tram streets, where the poles stand): a fruiterer's stall under an awning, flower and bread sellers on mats, with their buyers. */
function vendors(els) {
  const L = [], rand = rng(1911), pick = (a) => a[Math.floor(rand() * a.length)];
  const half = BLOCK / 2 + 2.6, tramX = [GRACIA_X, PITCH * 2.5], tramZ = [PITCH / 2];
  els.forEach((el) => {
    if (!el.shops) return;
    const [cx, cz] = el.c, sides = [];
    for (const sg of [-1, 1]) {
      if (!tramX.some((t) => Math.abs(cx + sg * (BLOCK / 2 + 11) - t) < 1)) sides.push({ f: [sg, 0], p: [cx + sg * half, cz] });
      if (!tramZ.some((t) => Math.abs(cz + sg * (BLOCK / 2 + 11) - t) < 1)) sides.push({ f: [0, sg], p: [cx, cz + sg * half] });
    }
    for (let n = 0; n < 2; n++) {
      if (!sides.length || rand() < 0.2) continue;
      const sd = sides.splice(Math.floor(rand() * sides.length), 1)[0], al = (rand() - 0.5) * 36;
      const x = sd.p[0] + (sd.f[0] ? 0 : al), z = sd.p[1] + (sd.f[1] ? 0 : al), y = height(x, z) + 0.05, fx = sd.f[0] * 0 + 0;
      // the stall's front is toward the house wall (the buyers on the pavement's inner side), its seller by the kerb
      const wx = -sd.f[0], wz = -sd.f[1], rot = Math.atan2(wx, wz), ax = x + sd.f[0] * 0.2, az = z + sd.f[1] * 0.2;
      void fx;
      if (Math.hypot(x, z) > RADIUS - 60 || onDiagonal(x, z, 8)) continue;
      const kind = rand();
      const cust = () => L.push({ t: 'figure', at: [ax + wx * 1.9 + (rand() - 0.5) * 0.8 * Math.abs(wz), az + wz * 1.9 + (rand() - 0.5) * 0.8 * Math.abs(wx)], y, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'stand', hair: 'bun', dress: 'robe', cloth: pick(['cloth_maroon', 'cloth_indigo', 'cloth_grey']), cloth2: 'cloth_white', over: 'shawl', hat: 'none', carry: 'basket' });
      if (kind < 0.5) {
        L.push({ t: 'stall', at: [ax, az], y, rot, w: 2.4, d: 1.1, goods: pick([['melons', 'greens'], ['greens', 'heap'], ['bread', 'baskets'], ['fish', 'heap']]), awning: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white']), seed: Math.floor(rand() * 1e6) });
        L.push({ t: 'figure', at: [ax - wx * 1.2, az - wz * 1.2], y, rot: rot + Math.PI, seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'stand', hair: 'short', dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey']), cloth2: 'cloth_black', over: 'apron', hat: 'cap', hatMat: 'cloth_brown', beard: 0.8 });
      } else {
        L.push({ t: 'goods_mat', at: [ax, az], y, rot, goods: kind < 0.75 ? ['baskets', 'greens'] : ['bread', 'baskets'], seed: Math.floor(rand() * 1e9) });
        L.push({ t: 'figure', at: [ax - wx * 0.95, az - wz * 0.95], y, rot: rot + Math.PI, seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'sit_ground', hair: 'bun', dress: 'robe', cloth: pick(['cloth_maroon', 'cloth_green', 'cloth_grey']), cloth2: 'cloth_white', over: 'shawl', hat: 'none' });
      }
      if (rand() < 0.7) cust();
    }
  });
  return L;
}
/** The people of the works (§10): the modellers at Gaudí's bench and the drawing table, a teacher at the board of each classroom of the Schools. */
function worksLife() {
  const L = [], r = rng(1909), [cx, cz] = SAGRADA, wy = height(cx - 30, cz + 3) + 0.06, sy = height(cx - 12, cz + 25) + 0.08;
  const fig = (at, y, face, o) => L.push({ t: 'figure', at, y, rot: Math.atan2(-face[0], -face[1]), seed: Math.floor(r() * 1e9), skin: 'skin_light', pose: 'stand', hair: 'short', ...o });
  const man = (o = {}) => ({ dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', over: 'apron', hat: 'cap', hatMat: 'cloth_grey', beard: r() < 0.5 ? 0.8 : 0, ...o });
  const xw = cx - 33 + 0.28 + 1.45;
  fig([xw, cz - 2], wy, [-1, 0], man({ cloth: 'cloth_white', pose: 'talk' })); fig([xw, cz + 6.2], wy, [-1, 0], man()); fig([xw, cz - 5.8], wy, [-1, 0], man({ cloth: 'cloth_brown' }));
  fig([cx - 27 - 0.28 - 1.6, cz + 11], wy, [1, 0], man({ cloth: 'cloth_white', hat: 'none', beard: 0.8 }));
  for (let k = 0; k < 3; k++) fig([cx - 12 - 10 + 0.32 + k * (20 / 3) + (k ? 0.1 : 0) + 0.45, cz + 25 + 2.4], sy + 0.12, [-1, 0], { dress: 'robe', cloth: ['cloth_black', 'cloth_grey', 'cloth_indigo'][k], cloth2: 'cloth_white', hair: 'bun', hat: 'none', over: 'shawl' });
  return L;
}
/** The Eixample's block elements (the smoke finds the chimneys from the same plan). */
export function blockElements() {
  return blocks().filter((b) => b.special !== 'sagrada' && b.special !== 'mercat').map((b) => ({
    t: 'eixample_block', shops: shopCore(b.c), pave: Math.abs(b.c[0] - GRACIA_X) < 60 ? 'tile_grey' : 'flagstone', c: b.c, s: BLOCK, d: 18, ch: 12, y: height(...b.c), dz: (height(b.c[0], b.c[1] + 1) - height(b.c[0], b.c[1] - 1)) / 2, seed: b.seed,
    ...(b.special === 'pedrera' ? { cut: { corner: 3, a: 22, b: 22 } } : {}),
    ...(Math.hypot(b.c[0] - CASA.block[0], b.c[1] - CASA.block[1]) < 1 ? { gaps: [{ side: CASA.side, s0: CASA.s0, s1: CASA.s1 }] } : {}),
    ...(b.special === 'batllo' ? { gaps: [{ side: 1, s0: BATLLO.s0, s1: BATLLO.s1 }] } : {}),
  }));
}
export async function town() {
  const els = blockElements();
  // in plans of a few blocks each, so that the town streams in pieces
  const plans = [];
  for (let i = 0; i < els.length; i += 6) plans.push(base(`barcelona-eixample-${i / 6}`, els.slice(i, i + 6)));
  const rand = rng(1910), lines = tramLines();
  plans.push(base('barcelona-casa', [{ t: 'casa_cafe', fx: CASA.fx, z0: CASA.z0, y: height(CASA.fx - 9, CASA.z0 + 8), h: CASA.h, seed: 1910 }]));
  plans.push({ ...base('barcelona-casa-life', casaLife()), style: 'life' });
  // the shops' people, a plan to a few blocks
  shopLife(els).forEach((L, i) => plans.push({ ...base(`barcelona-shop-life-${i}`, L), style: 'life' }));
  plans.push({ ...base('barcelona-works-life', worksLife()), style: 'life' });
  plans.push({ ...base('barcelona-vendors', vendors(els)), style: 'life' });
  plans.push(base('barcelona-trams', [...lines.map((l) => ({ ...l, wires: false })), ...trams(lines, rand)]));
  // the wires apart, colliding with nothing
  plans.push({ ...base('barcelona-wires', lines.map((l) => ({ ...l, wires: 'only' }))), nocollide: true });
  plans.push(base('barcelona-carriages', carriages(rand)));
  // the Mercat de la Concepció on its block, and its life: the stalls in rows down the naves, the sellers and the
  // buyers, the flower sellers outside (§5d)
  plans.push(base('barcelona-mercat', [{ t: 'mercat', c: MERCAT, y: Math.max(Y(MERCAT[0], MERCAT[1] - 27), Y(MERCAT[0], MERCAT[1] + 27)) + 0.02, L: 60, W: 44 }]));
  plans.push({ ...base('barcelona-mercat-life', mercatLife()), style: 'life' });
  // the café's terrace on the pavement before it (clear of the tram pole at z −90) and the newspaper kiosks of the Passeig
  const ty = (x, z) => height(x, z);
  plans.push(base('barcelona-street-furniture', [
    ...[-99.3, -92.7].map((z) => ({ t: 'terrace_set', at: [CASA.fx + 1.7, z], y: ty(CASA.fx + 1.7, z), seed: 3 })),
    { t: 'kiosk', at: [GRACIA_X - 9.2, -114], y: ty(GRACIA_X - 9.2, -114), rot: 0.1, seed: 1 },
    { t: 'kiosk', at: [GRACIA_X + 9.5, -45], y: ty(GRACIA_X + 9.5, -45), rot: 0.2, seed: 2 },
    { t: 'kiosk', at: [GRACIA_X - 9.2, 160], y: ty(GRACIA_X - 9.2, 160), rot: 0, seed: 3 },
  ]));
  plans.push(base('barcelona-passeig', bancsFanals().map(([x, z], i) => ({ t: 'banc_fanal', at: [x, z], y: Y(x, z), rect: [x - 0.9, z - 2.3, x + 0.9, z + 2.3], seed: 1906 + i }))));
  return plans;
}
