// The castle town (docs/settlements/edo-himeji.md §5): samurai compounds round the inner moat, the merchants' machiya
// beyond the middle moat; some houses open inside (§5.1); the life of the street and the avenue (§5.2): a palanquin
// and its bearers, samurai with their two swords, pedlars with their carrying poles, the shopkeepers at their counters.
import { props } from './props.js';
import { OPENED } from './plan.js';
import { insidePeople } from '../../styles/edo/stores.js';
import { RADIUS, STREET, OUTER, MIDDLE, LEVEL, HON, DAI, NINO, lots, furniture } from './layout.js';
const base = (id, elements, style = 'edo') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 240], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Which houses are open inside: a machiya in three (its shop), a samurai house in six (its reception room). */
export const isOpen = (l) => (l.t === 'machiya' ? l.seed % 2 === 0 || l.trade === 'sake' || l.trade === 'tea' : l.seed % 3 === 0);

/**
 * The Honmaru's life as the visitor arrives (docs §5.2): the gate guards at the foot of the stair up to the keeps, a
 * servant sweeping the flagstones, two retainers in talk, a gardener at the pines, a porter with his pails crossing,
 * a groom with a horse at the wall; and in the Ninomaru a maid and a retainer. Static; all 7–45 m from the arrival at (-25, -3).
 */
function castleLife(fig, samurai, rand) {
  const y = HON.top, y2 = NINO.top, S = Math.PI;
  void DAI;
  samurai([-36.4, -21.2], S, y, { pose: 'stand' }); samurai([-25.6, -21.2], S, y);
  fig([-12, -14.5], 0.9, { y, carry: 'broom', dress: 'wrap', cloth: 'cloth_grey', hat: 'straw', feet: 'bare' });
  samurai([-6.5, -17], 0.6, y, { pose: 'talk' }); samurai([-5.3, -16.3], S + 0.6 + 0.2, y, { pose: 'talk' });
  fig([-44.2, -9.2], 0.4, { y, pose: 'squat', dress: 'wrap', cloth: 'cloth_indigo', hat: 'straw', feet: 'bare' });
  fig([5, -4.2], -Math.PI / 2, { y, carry: 'pails', dress: 'wrap', cloth: 'cloth_indigo', hat: 'straw', feet: 'bare' });
  fig([-16, -26], 2.4, { y, dress: 'robe', hair: 'bun', cloth: 'cloth_maroon', over: 'sash', cloth2: 'cloth_ochre', carry: 'basket' });
  fig([21.2, -10.6], S * 0.5, { y, dress: 'wrap', cloth: 'cloth_brown', hat: 'straw', feet: 'bare', h: 1.62 });
  // the Ninomaru, seen from the Hishi gate's stair
  fig([-14, 14.5], 0.2, { y: y2, dress: 'robe', hair: 'bun', cloth: 'cloth_indigo', over: 'sash', cloth2: 'cloth_white', feet: 'shod' });
  samurai([6, 9], -1.2, y2);
  // the Hishi gate's guards at the head of the long stair, facing down it
  samurai([-3.4, 28.2], S, y2 - 0.9); samurai([3.4, 28.2], S, y2 - 0.9);
  void rand;
}

function life() {
  const rand = rng(1620), P = [], E = [];
  const fig = (at, rot, o = {}) => P.push({ t: 'figure', at, y: o.y ?? 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_black'][Math.floor(rand() * 4)], cloth2: 'cloth_grey', skin: 'skin_light', hat: 'none', hair: 'topknot', hairMat: 'hair_dark', beard: 0, feet: 'shod', over: 'collar', ...o });
  // samurai on duty with the long and the short sword (the edict of 1629): on the avenue from the main gate and in the street
  const samurai = (at, rot, y = 0, o = {}) => { const h = 1.6 + rand() * 0.08; fig(at, rot, { h, y, cloth: rand() < 0.5 ? 'cloth_black' : 'cloth_indigo', cloth2: 'cloth_grey', over: 'collar', ...o }); E.push({ t: 'daisho', at, y, rot, h }); };
  for (const [x, z, r] of [[-6, OUTER[3] + 22, Math.PI], [-5.2, OUTER[3] + 23.2, Math.PI], [7, OUTER[3] + 48, 0.2], [5, 286, Math.PI * 0.9], [-30, 336.5, Math.PI / 2], [44, 335, -Math.PI / 2], [45.1, 336.1, -Math.PI / 2 + 0.3]]) samurai([x, z], r);
  // the palanquin on the avenue: the passenger seated in it, a bearer at each end of the pole, a retainer walking after
  { const x = 5, z = OUTER[3] + 36, rot = 0, ph = 1.44;
    E.push({ t: 'kago', at: [x, z], y: 0, rot, h: ph });
    for (const dz of [-1.55, 1.55]) fig([x, z + dz], rot, { h: 1.63, arms: 'pole', dress: 'wrap', top: 'bare', cloth: 'cloth_white', hair: 'topknot', over: 'none', feet: 'bare' });
    fig([x + 0.15, z + 0.0], rot, { y: 0.54, pose: 'cross', cloth: 'cloth_maroon', hair: 'bun' });
    samurai([x - 0.6, z + 3.4], rot); }
  // pedlars in the merchants' street with their carrying poles: water or soy in pails, greens and fish in baskets
  for (let k = 0; k < 9; k++) { const x = -260 + k * 62 + rand() * 20, z = STREET.z0 + 1.5 + rand() * 5; if (Math.abs(x) < 8) continue; fig([x, z], rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { carry: k % 2 ? 'pails' : 'pole', dress: 'wrap', cloth: 'cloth_indigo', hat: k % 3 ? 'straw' : 'none' }); }
  // the shopkeepers kneeling at their counters in the open shops, a customer sat on the shop's edge in some
  for (const l of lots()) if (l.t === 'machiya' && isOpen(l)) {
    const [x0, z0, x1, z1] = l.rect, f = l.front || 's', dep = Math.min(11, z1 - z0), s = f === 's' ? 1 : -1, fz = f === 's' ? z1 : z0, Z = (q) => fz - s * q;
    const qm = Math.min(4.6, dep * 0.45), q0 = qm - 1.7, ub = x1 - 0.15, du = x0 + 0.15 + 1.55, rot = f === 's' ? Math.PI : 0;
    if (q0 > 1.6) fig([ub - 1.5 + 0.75, Z(q0 + 0.95)], rot, { y: 0.45, pose: 'seiza', cloth: 'cloth_brown', over: 'apron', cloth2: 'cloth_indigo' });
    if (rand() < 0.5) fig([du + 1.4, Z(0.42)], rot, { pose: 'sit', y: 0, cloth: rand() < 0.5 ? 'cloth_maroon' : 'cloth_grey', hair: rand() < 0.5 ? 'bun' : 'topknot' });
  }
  // the moat's life: a fisherman sitting in every other moored boat, a woman kneeling at each landing washing greens
  furniture().filter((f) => f.t === 'moat_boat').forEach((f, i) => { if (i % 2 === 0) fig([f.at[0] + 0.4, f.at[1]], Math.PI / 2, { y: LEVEL.water - 0.08 + 0.08, pose: 'sit', hat: 'straw', dress: 'wrap', cloth: 'cloth_indigo', feet: 'bare' }); });
  furniture().filter((f) => f.t === 'landing').forEach((f, i) => fig([f.x + (i % 2 ? 1 : -1) * 0.6, f.z0 - 0.35], 0, { y: 0.3, pose: 'seiza', hair: 'bun', cloth: i % 2 ? 'cloth_maroon' : 'cloth_indigo', over: 'apron', cloth2: 'cloth_white' }));
  castleLife(fig, samurai, rand);
  // inside the opened storehouses and turrets (styles/edo/stores.js): the clerk kneeling at his desk before the rice, the watch on its raised mat and at the spear rack
  for (const k of OPENED.kura) for (const q of insidePeople('kura', k)) fig(q.at, q.rot, { y: q.y, pose: q.pose, dress: 'robe', cloth: 'cloth_brown', over: 'apron', cloth2: 'cloth_indigo', hair: 'topknot' });
  for (const t of OPENED.turrets) for (const q of insidePeople('turret', t)) {
    if (q.pose === 'stand') samurai(q.at, q.rot, q.y); else fig(q.at, q.rot, { y: q.y, pose: q.pose, cloth: 'cloth_black', cloth2: 'cloth_grey' });
  }
  return [base('edo-himeji-street', E), base('edo-himeji-people', P, 'life')];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 60) plans.push(base(`edo-himeji-town-${i / 60}`, all.slice(i, i + 60).map((l) => ({ ...l, simple: true, open: isOpen(l) }))));
  plans.push(base('edo-himeji-furniture', furniture().flatMap((f) => (f.t === 'landing'
    ? [{ t: 'stairs', rect: [f.x - 1.5, f.z0, f.x + 1.5, f.z0 + 1.7], y0: LEVEL.bed, y1: 0.3, dir: 'n', mat: 'ishigaki' }]
    : f.t === 'moat_boat' ? [{ ...f, y: LEVEL.water - 0.08 }] : [f]))));
  plans.push(...life(), ...props());
  return plans;
}
