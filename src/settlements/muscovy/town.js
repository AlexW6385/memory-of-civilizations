// The log houses (izby) of the boyars' courts and the posad (docs/settlements/muscovy.md §5).
import { RADIUS, ROWS, LOBNOYE, CATHEDRALS, SPASSKY, MOAT, lots, height, wallX, gateZ } from './layout.js';
const base = (id, elements) => ({ id, style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, 20], facing: 's' } });
// the gable end of each house turned to the nearer street (the streets of layout.js: x = 42 − 420 + 84k, z = 35 − 420 + 70k)
function front([x0, z0, x1, z1]) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (x1 - x0 >= z1 - z0) { const sx = Math.round((cx + 378) / 84) * 84 - 378; return sx < cx ? 'x0' : 'x1'; }
  const sz = Math.round((cz + 385) / 70) * 70 - 385; return sz < cz ? 'z0' : 'z1';
}
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`muscovy-houses-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'izba', ...l, front: front(l.rect) }))));
  plans.push({ ...base('muscovy-people', people()), style: 'life' });
  return plans;
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_grey', 'cloth_ochre', 'cloth_brown'];
/**
 * The people (docs/settlements/muscovy.md §10): the booksellers on the Spassky bridge, merchants at their
 * shop fronts in the rows and buyers in the lanes, a crowd at the Lobnoye Mesto, a priest and the
 * faithful in the Dormition.
 */
export function people() {
  const rand = rng(1600), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: rand() < 0.6 ? 'cap' : 'none', hatMat: rand() < 0.5 ? 'hide_brown' : 'cloth_red', hair: rand() < 0.6 ? 'short' : 'long', beard: rand() < 0.75 ? 1 : 0, legs: 'hose', feet: 'shod', over: rand() < 0.4 ? 'sash' : 'none', ...o });
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  // the booksellers at the square's end of the Spassky bridge, their books in crates by the railing
  const zb = gateZ(SPASSKY[1]), xe = wallX(zb) + MOAT.d1 + 2.4;
  for (const e of [-1, 1]) { const at = [xe + 1.6, zb + e * 4.2]; L.push({ t: 'crates', at, y: height(...at), rot: 0, seed: Math.floor(rand() * 1e9), n: 3 }); fig([at[0] + 0.9, at[1] - e * 0.6], -Math.PI / 2 + (rand() - 0.5) * 0.5, { pose: 'stand' }); }
  for (let k = 0; k < 4; k++) { const at = [xe + 2 + rand() * 4, zb + (rand() - 0.5) * 6]; fig(at, face(at, [xe, zb]) + (rand() - 0.5) * 1.5, { pose: rand() < 0.5 ? 'talk' : 'stand' }); }
  // the rows: a merchant at a shop front now and then, buyers in the lanes and on the square before them
  const [x0, z0, x1, z1] = ROWS, k = (x1 - x0) / 20;
  for (const lane of [x0 - 1.4, x0 + 5.5 * k, x0 + 15.5 * k]) for (let z = z0 + 4; z < z1 - 4; z += 5 + rand() * 7) {
    const at = [lane + (rand() - 0.5) * 0.8, z];
    fig(at, rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none' });
  }
  // the crowd at the Lobnoye Mesto, facing the platform; a crier on it reading a decree
  const ly = height(...LOBNOYE) + 1.0;
  fig([LOBNOYE[0] - 1, LOBNOYE[1]], -Math.PI / 2, { y: ly, pose: 'talk', cloth: 'cloth_red', hat: 'cap', hatMat: 'hide_black' });
  for (let q = 0; q < 22; q++) { const a = Math.PI * 0.55 + rand() * Math.PI * 0.9, d = 8.5 + rand() * 6, at = [LOBNOYE[0] + Math.cos(a) * d, LOBNOYE[1] + Math.sin(a) * d]; fig(at, face(at, LOBNOYE) + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'talk' : 'stand' }); }
  // in the Dormition: a priest before the royal doors, the faithful standing in the nave
  const D = CATHEDRALS.dormition, F = height((D[0] + D[2]) / 2, (D[1] + D[3]) / 2) + 0.15, xI = D[0] + 1.3 + 3 * (D[2] - D[0] - 2.6) / 4, cz = (D[1] + D[3]) / 2;
  fig([xI - 1.6, cz], -Math.PI / 2, { y: F, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cape', hat: 'none', beard: 1, hair: 'long' });
  for (let q = 0; q < 14; q++) { const at = [xI - 5 - rand() * 9, cz + (rand() - 0.5) * 5.2]; fig(at, -Math.PI / 2 + (rand() - 0.5) * 0.3, { y: F, pose: 'stand', hat: 'none', over: rand() < 0.5 ? 'cape' : 'none' }); }
  return L;
}
