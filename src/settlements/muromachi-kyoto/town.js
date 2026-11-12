// The town of Muromachi Kyoto (docs/settlements/muromachi-kyoto.md §5): the machiya of boards under stone-weighted roofs on every
// street, a quarter of them open as shops; the stream in its stone channel with the bridge to Ginkaku-ji; the shrine with its
// torii, hall and the Noh stage with the players at their places; a tea hut in a yard; bamboo fences, wells and lanterns in the
// yards; the shopkeepers at their counters, monks, samurai.
import { RADIUS, STREAM, BRIDGES, SHRINE, TEA, GINKAKU, RYOAN, lots, yards, isOpen, inRect } from './layout.js';
import { lifeTiles } from './life.js';
import { gutters, furniture, yardWork, streamWork, templeWork } from './streetwork.js';

const base = (id, elements, style = 'muromachi') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [190, 100], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TURN = { s: [1, 0, Math.PI], e: [0, 1, -Math.PI / 2], n: [-1, 0, 0], w: [0, -1, Math.PI / 2] };
/** The world position of a point of a building's frame (x across, z toward its front), and the heading for facing 'front'. */
const W = (el, x, z) => { const [co, si] = TURN[el.facing || 's']; return [el.at[0] + x * co + z * si, el.at[1] - x * si + z * co]; };
const heading = (el, dz = 0) => { const f = TURN[el.facing || 's'][2]; return dz ? f + Math.PI : f; };

function civic() {
  const E = [];
  const zr = 275;
  E.push({ t: 'stream', x0: STREAM.x0, x1: STREAM.x1, z0: -zr, z1: zr, level: STREAM.level, bed: STREAM.bed, top: STREAM.top });
  for (const [x, z] of BRIDGES) E.push({ t: 'slab_bridge', at: [x, z], across: 'x', len: 12.5, w: 6, y: 0.12, plank: true });
  // the shrine: the torii on the approach, the hall at its end, the Noh stage in its court, lanterns along the way, a fence
  E.push({ t: 'torii', at: SHRINE.torii, y: 0, facing: 's' });
  E.push({ t: 'torii', at: [SHRINE.torii[0], SHRINE.torii[1] + 22], y: 0, facing: 's', s: 0.8 });
  E.push({ t: 'shrine_hall', at: SHRINE.hall, y: 0, facing: 'n', w: 9, d: 6 });
  E.push({ t: 'noh_stage', at: SHRINE.noh, y: 0, facing: 's' });
  for (let z = SHRINE.torii[1] + 6; z < SHRINE.hall[1] - 8; z += 7) for (const sx of [-1, 1]) E.push({ t: 'ishidoro', at: [SHRINE.torii[0] + sx * 4.2, z], y: 0, s: 0.9 });
  const [sx0, sz0, sx1, sz1] = SHRINE.rect;
  E.push({ t: 'bamboo_fence', a: [sx0, sz1], b: [sx1, sz1], h: 1.4 }, { t: 'bamboo_fence', a: [sx0, sz0 + 8], b: [sx0, sz1], h: 1.4 }, { t: 'bamboo_fence', a: [sx1, sz0 + 8], b: [sx1, sz1], h: 1.4 });
  // the tea hut in a block's yard, its roji garden and fence
  E.push({ t: 'tea_hut', at: TEA.hut, y: 0, facing: 's' }, { t: 'roji', at: [TEA.hut[0], TEA.hut[1] + 2], y: 0, facing: 's', seed: 7 });
  E.push({ t: 'ishidoro', at: [TEA.hut[0] + 4.5, TEA.hut[1] + 6], y: 0, s: 0.7 });
  E.push({ t: 'bamboo_fence', a: [TEA.hut[0] - 8, TEA.hut[1] - 5], b: [TEA.hut[0] + 8, TEA.hut[1] - 5], h: 1.6 }, { t: 'bamboo_fence', a: [TEA.hut[0] - 8, TEA.hut[1] - 5], b: [TEA.hut[0] - 8, TEA.hut[1] + 14], h: 1.6 }, { t: 'bamboo_fence', a: [TEA.hut[0] + 8, TEA.hut[1] - 5], b: [TEA.hut[0] + 8, TEA.hut[1] + 14], h: 1.6 });
  // yards: a well and a fence in the yard of every block
  const r = rng(77);
  for (const y of yards()) {
    if (inRect([TEA.hut[0] - 10, TEA.hut[1] - 7, TEA.hut[0] + 10, TEA.hut[1] + 16], (y[0] + y[2]) / 2, (y[1] + y[3]) / 2)) continue;
    const cx = (y[0] + y[2]) / 2, cz = (y[1] + y[3]) / 2;
    E.push({ t: 'ido', at: [cx + (r() - 0.5) * 8, cz + (r() - 0.5) * 8], y: 0, rot: 0 });
    E.push({ t: 'bamboo_fence', a: [y[0] + 1, cz - 3], b: [y[0] + 1 + (y[2] - y[0]) * 0.35, cz - 3], h: 1.5 });
  }
  return E;
}

function people() {
  const P = [], rand = rng(1490);
  const fig = (at, rot, o = {}) => P.push({ t: 'figure', at, y: o.y ?? 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_ochre'][Math.floor(rand() * 4)], cloth2: 'cloth_grey', skin: 'skin_light', hat: 'none', hair: 'topknot', hairMat: 'hair_dark', beard: 0, feet: 'shod', over: 'sash', ...o });
  const monk = (at, rot, o = {}) => fig(at, rot, { cloth: 'cloth_black', cloth2: 'cloth_grey', hair: 'shaven', over: 'collar', ...o });
  // the shopkeepers kneeling at their counters in the open shops
  for (const l of lots()) if (isOpen(l)) { const d = l.d, w = l.w, p = W(l, -w / 2 + 1.2, -1.3); if (d > 9) fig(p, heading(l), l.keeper ? { y: 0.45, pose: 'seiza', cloth: 'cloth_black', cloth2: 'cloth_grey', hair: 'shaven', over: 'collar' } : { y: 0.45, pose: 'seiza', cloth: 'cloth_brown', over: 'apron', cloth2: 'cloth_indigo' }); }
  // Ryōan-ji: a monk seated on the veranda before the garden, one in the Buddha room; Ginkaku-ji: a monk at the Dōjinsai's desk
  const hoj = { at: RYOAN.hojo, facing: 'n' };
  monk(W(hoj, -5, 6.9), heading(hoj), { y: 0.85, pose: 'seiza' }); monk(W(hoj, -1.2, 7.0), heading(hoj), { y: 0.85, pose: 'seiza' });
  monk(W(hoj, 4.3, -3.5), heading(hoj), { y: 0.85, pose: 'seiza' });
  const tg = { at: GINKAKU.togudo, facing: 'e' };
  monk(W(tg, 2.3, -0.3), 0, { y: 0.7, pose: 'seiza' });
  // the Noh stage: the shite on the stage, four players at the rear seat, the chorus at the right
  const nh = { at: SHRINE.noh, facing: 's' };
  fig(W(nh, 0.2, 0.3), Math.PI, { y: 0.95, cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'cap', h: 1.62 });
  for (const x of [-2.2, -0.9, 0.5, 1.8]) fig(W(nh, x, -3.9), 0, { y: 0.95, pose: 'seiza', cloth: 'cloth_indigo' });
  for (const z of [-1.2, -0.4, 0.4, 1.2]) fig(W(nh, 3.7, z), -Math.PI / 2 + Math.PI, { y: 0.95, pose: 'seiza', cloth: 'cloth_black' });
  // samurai at the temple gates, with the sword at the hip (a tachi, hung)
  for (const [x, z, rot] of [[GINKAKU.gate[0] - 3.5, GINKAKU.gate[1] + 4, 0], [GINKAKU.gate[0] + 3.5, GINKAKU.gate[1] + 4, Math.PI * 0.1]]) fig([x, z], rot, { cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'cap', over: 'collar' });
  return P;
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 60) plans.push(base(`muromachi-town-${i / 60}`, all.slice(i, i + 60).map((l) => ({ t: 'machiya_m', at: l.at, facing: l.facing, w: l.w, d: l.d, seed: l.seed, trade: l.trade, open: isOpen(l), y: 0 }))));
  plans.push(base('muromachi-civic', civic()));
  plans.push(base('muromachi-gutters', gutters()));
  plans.push(base('muromachi-furniture', [...furniture(), ...streamWork(), ...templeWork()]));
  plans.push(base('muromachi-yards', yardWork()));
  plans.push(base('muromachi-people', people(), 'life'));
  for (const t of lifeTiles()) plans.push({ ...base(t.id, t.elements, 'life'), center: t.center, near: 230 });
  return plans;
}
