// The canal houses (docs/settlements/amsterdam.md §5); the life of the Dam (§5.6): greengrocers' stalls, the
// porters at the Weigh House among the bales and casks, the fishwives at their benches, the carters walking
// beside their horses and sledges, burghers in conversation, boats at the Damrak's head.
import { RADIUS, GROUND, WATER, WAAG, DAMRAK, VOC, lots } from './layout.js';
import { SLEDGES, BOATS } from './plan.js';
export const ARRIVAL = [20, -210];
const base = (id, elements) => ({ id, style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, -207], facing: 'n' } });
/** Is this lot built open (a furnished ground floor you can walk into)? The Dam's south row, and one house in four near the Dam (one in nine beyond 190 m). */
export const isOpen = (l) => (l.front === 'n' && l.rect[1] === -203) || l.seed % (Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 + 230) < 190 ? 4 : 9) === 0;
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`amsterdam-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'canal_house', ...l, open: isOpen(l) }))));
  plans.push(...houseLights());
  return plans;
}

/**
 * The lit halls of the open houses near the arrival (the dutch style's canal_house hangs its brass chandelier in the hall but lights no candle): one light
 * at the chandelier of each, and in every second house a burgher or his wife standing under it. The hall's geometry is the style's own (styles/dutch/house.js
 * and interior.js: the house's dice, the annex that shortens the main block, the partition at 0.47 of its depth, the stair's well); replayed here.
 */
function houseLights() {
  const faces = { n: (r, u, d) => [r[2] - u, r[1] - d], s: (r, u, d) => [r[0] + u, r[3] + d], e: (r, u, d) => [r[2] + d, r[3] - u], w: (r, u, d) => [r[0] - d, r[1] + u] };
  const out = [], people = [], rand = rng(1671);
  for (const l of lots()) {
    if (!isOpen(l) || Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]) > 140) continue;
    const r = rng(l.seed || 1); r(); r(); r(); const kr = r(), kind = l.gable ?? (kr > 0.9 ? 'spout' : kr < 0.3 ? 'step' : kr < 0.65 ? 'neck' : 'bell');
    if (kind === 'spout') continue;
    const turned = l.front === 'n' || l.front === 's', w = turned ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], D = turned ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0];
    const annex = D >= 11 && rng((l.seed || 1) * 7 + 13)() < 0.55, Dm = annex ? D - 3.4 : D, dP = -Math.max(3.4, Math.min(5.8, Dm * 0.47)), cd = (dP + 2.9 - 0.32) / 2;
    const [x, z] = faces[l.front](l.rect, w / 2, cd);
    out.push({ t: 'lamp', at: [x, GROUND + 4.65, z], color: '#ffc27a', intensity: 4, distance: 8 });
    if (l.seed % 2 === 0) {
      const dx = { n: 0, s: 0, e: 1, w: -1 }[l.front], dz = { n: -1, s: 1, e: 0, w: 0 }[l.front];
      people.push(person(rand, l.seed % 4 === 0 ? 'wife' : 'burgher', [x, z], Math.atan2(-dx, -dz), { y: GROUND + 1.03, pose: l.seed % 8 === 0 ? 'talk' : 'stand' }));
    }
  }
  return [base('amsterdam-hall-lamps', out), { ...base('amsterdam-hall-people', people), style: 'life', center: ARRIVAL, near: 170 }];
}

/** The VOC's warehouses along the IJ's quay (docs §5.11). */
export function warehouses() {
  return [base('amsterdam-voc', VOC.map((r, k) => ({ t: 'voc_warehouse', rect: [r[0], r[1], r[2], r[3]], front: 'n', y: GROUND, seed: 300 + k, open: !!r[4] })))];
}

const Y = GROUND + 0.05;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A figure of 1670 Amsterdam: a burgher in black with a broad hat and collar, a woman in a hood, a working man or woman. */
export function person(rand, kind, at, rot, extra = {}) {
  const c = (l) => l[Math.floor(rand() * l.length)], hair = [['hide_brown', 0.7], ['hide_tan', 0.85], ['hide_black', 0.7], ['hide_brown', 0.55]][Math.floor(rand() * 4)];
  const o = { t: 'figure', at, y: Y, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', hairMat: hair[0], hairShade: hair[1], legs: 'hose', ...extra };
  if (kind === 'burgher') Object.assign(o, { dress: 'robe', cloth: c(['cloth_black', 'cloth_black', 'cloth_brown']), cloth2: 'cloth_white', over: 'collar', hat: 'brim', hatMat: 'cloth_black', hair: 'long', beard: rand() < 0.4 });
  else if (kind === 'lady') Object.assign(o, { dress: 'robe', cloth: c(['cloth_black', 'cloth_brown', 'cloth_grey', 'cloth_indigo']), cloth2: 'cloth_white', over: c(['collar', 'cape']), hat: 'veil', hatMat: c(['cloth_black', 'cloth_white']), beard: false });
  else if (kind === 'wife') Object.assign(o, { dress: 'robe', cloth: c(['cloth_brown', 'cloth_red', 'cloth_grey', 'cloth_indigo']), cloth2: 'cloth_white', over: 'sash', hat: 'veil', hatMat: 'cloth_white', beard: false });
  else Object.assign(o, { dress: c(['trousers', 'tunic']), cloth: c(['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_white']), cloth2: c(['cloth_brown', 'cloth_grey']), hat: kind === 'porter' ? c(['cap', 'brim']) : c(['cap', 'none']), hatMat: kind === 'porter' ? c(['cloth_red', 'cloth_black']) : c(['cloth_grey', 'cloth_brown']), hair: 'short', beard: rand() < 0.35 });
  return o;
}
/** The life of the Dam: explicit, so that the Weigh House, the fish market and the sledges have their people. */
export function damLife() {
  const rand = rng(1670), E = [], P = (k, x, z, rot, ex) => E.push(person(rand, k, [x, z], rot, ex));
  const [wx0, wz0, wx1, wz1] = WAAG;
  // the greengrocers along the south of the square, their sellers behind, buyers before them
  for (const [k, x] of [-22, -15.5, -9, -2.5].entries()) {
    E.push({ t: 'stall', at: [x, -217], y: Y, rot: 0, seed: 50 + k, awning: ['cloth_white', 'cloth_ochre', 'cloth_white', 'cloth_green'][k], stripe: null, goods: ['produce', 'basket', 'produce'], w: 2.6, d: 1.3 });
    P(k % 2 ? 'wife' : 'worker', x + 0.4, -218.4, Math.PI);
    if (k !== 2) P(rand() < 0.5 ? 'lady' : 'wife', x - 0.5 + rand(), -214.6, 0, { pose: 'talk' });
  }
  // the porters at the Weigh House: at the balances in the south gateways, among the goods under the porch roof
  for (const u of [3, 9, 15]) { P('porter', wx0 + u + 1.3, wz1 - 1.6, Math.PI * 0.5 + 0.3); }
  P('porter', wx0 + 9 - 1.4, wz1 - 1.9, -Math.PI * 0.5, { pose: 'talk' });
  P('burgher', wx0 + 9.4, wz1 + 1.4, 0.2, { pose: 'talk' });                                    // a merchant watching his goods weighed
  E.push({ t: 'barrel', at: [wx0 + 5.6, wz1 + 1.3], y: Y, n: 3, seed: 1, rot: 0.1 }, { t: 'sacks', at: [wx0 + 12.5, wz1 + 1.2], y: Y, n: 5, seed: 2 }, { t: 'crates', at: [wx0 + 0.8, wz1 + 1.6], y: Y, n: 3, seed: 3 });
  E.push({ t: 'barrel', at: [wx1 + 1.6, wz0 + 3], y: Y, n: 2, seed: 4, rot: Math.PI / 2 }, { t: 'sacks', at: [wx0 + 7, wz0 - 1.4], y: Y, n: 4, seed: 5 });
  P('porter', wx1 + 2.2, wz0 + 4.6, Math.PI * 0.8);
  // the fishwives at their benches by the Damrak, buyers before them
  for (const x of [15.5, 22.5, 29.5, 36.5]) { P('wife', x + (rand() - 0.5), -253.9, 0); if (rand() < 0.8) P(rand() < 0.5 ? 'lady' : 'wife', x + (rand() - 0.5) * 1.2, -250.6, Math.PI + (rand() - 0.5) * 0.6, { pose: 'talk' }); }
  for (const x of [17, 25, 33]) { P(rand() < 0.5 ? 'wife' : 'worker', x + (rand() - 0.5), -246.3, Math.PI); if (rand() < 0.6) P('burgher', x + (rand() - 0.5), -249.6, (rand() - 0.5) * 0.6, { pose: 'talk' }); }
  E.push({ t: 'basket', at: [14, -246.4], y: Y, n: 3, seed: 9 }, { t: 'basket', at: [38.6, -251], y: Y, n: 2, seed: 10 });
  // the sledges' horses and their carters walking beside them
  for (const [x, z, rot] of SLEDGES) {
    const c = Math.cos(rot), s = Math.sin(rot), at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    E.push({ t: 'animal', kind: 'horse', at: at(0, -2.75), y: Y, rot, seed: Math.floor(rand() * 1e9) });
    E.push(person(rand, 'worker', at(-1.05, -1.6), rot, { pose: 'stand' }));
  }
  // burghers and their wives in conversation in the open square, a few alone
  for (const [x, z] of [[2, -228], [-12, -224], [24, -236], [14, -224], [30, -214]]) {
    const n = 2 + (rand() < 0.4 ? 1 : 0), a0 = rand() * 6.28;
    for (let q = 0; q < n; q++) { const a = a0 + q * 6.28 / n, px = x + Math.cos(a) * 0.6, pz = z + Math.sin(a) * 0.6; P(q === 1 && rand() < 0.6 ? 'lady' : 'burgher', px, pz, Math.atan2(px - x, pz - z), { pose: q === 0 ? 'talk' : 'stand' }); }
  }
  for (const [x, z, r] of [[-26, -246, 2.2], [36, -232, -1.4], [-4, -207.4, 0.4]]) P(rand() < 0.5 ? 'burgher' : 'worker', x, z, r);
  E.push({ t: 'animal', kind: 'dog', at: [6, -220], y: Y, rot: 1.1, seed: 77 });
  // boats moored at the Damrak's head and along its quays, the fishermen's catch sold live from them
  for (const [x, z, rot] of [[17.5, -261.5, 0], [24.5, -262.2, 0.08], [15.6, -270, 0], [26.4, -275, Math.PI], [15.6, -280, 0.03]]) E.push({ t: 'boat', kind: 'rowboat', at: [x, z], y: WATER, rot, len: 5.2, seed: Math.floor(rand() * 1e9) });
  // the boatmen on the praams' after decks, their poles in hand (docs §5.10)
  const canal = [];
  for (const [x, z, rot, len] of BOATS) { const k = len / 2 - 1.25; canal.push(person(rand, 'worker', [x + Math.sin(rot) * k, z + Math.cos(rot) * k], rot, { y: WATER + 0.42, pose: rand() < 0.5 ? 'punt' : 'stand', len: 4.5 })); }
  return [{ ...base('amsterdam-dam-life', E), style: 'life', center: [5, -235], near: 230 }, { ...base('amsterdam-boatmen', canal), style: 'life' }];
}
