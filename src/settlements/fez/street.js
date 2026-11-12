// The street life of Fez about 1350 (docs/settlements/fez.md §8), the part that stands still: the keeper in each dukkan and his
// customers, men on the masonry benches, the boys of the derbs, women at the wall fountains with their jars, sellers of herbs and
// bread on mats along the Talaa Kebira, donkeys under their loads, cats on the sills, washing across the derbs, and the wash-places
// on the quays. Tiled in 100 m pieces of the engine's life style, shown within 230 m. Deterministic.
import { RADIUS, K, S, lanes, fountains, riverZ, ground0, RIVER, quayY, BRIDGES, SITES } from './layout.js';
import { planOf } from '../../styles/marinid/house.js';
import { frame } from '../../styles/mamluk/kit.js';
import { houseList, washPlaces } from './houses.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const CL = ['cloth_white', 'cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_blue'];
const base = (id, elements) => ({ id, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } });

export function streetLife() {
  const L = [], rand = rng(1355), pick = (a) => a[Math.floor(rand() * a.length)];
  let seed = 7001;
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: (seed += 7919), skin: rand() < 0.75 ? 'skin_medium' : rand() < 0.5 ? 'skin_light' : 'skin_dark', dress: 'robe', pose: 'stand', ...o });
  const man = (at, y, rot, o = {}) => fig(at, y, rot, { cloth: pick(CL), cloth2: 'cloth_white', over: rand() < 0.65 ? 'cloak' : 'sash', hat: rand() < 0.7 ? 'turban' : 'cap', hatMat: 'cloth_white', hair: 'short', beard: rand() < 0.7, ...o });
  const woman = (at, y, rot, o = {}) => fig(at, y, rot, { cloth: pick(['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo']), cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.55, ...o });
  const boy = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'tunic', cloth: pick(['cloth_ochre', 'cloth_brown', 'cloth_white']), cloth2: 'cloth_white', hat: rand() < 0.6 ? 'cap' : 'none', hatMat: 'cloth_white', hair: 'short', h: 1.15 + rand() * 0.2, ...o });
  const near = (x, z, R = 250) => Math.hypot(x, z) < R;

  // the dukkans: the keeper cross-legged on his cushion, a customer in the lane, now and then a second talking
  const H = houseList();
  for (const h of H) {
    if (!h.shops) continue;
    const P = planOf(h), fr = frame(h.rect, h.door), [nx, nz] = fr.N, cx = (h.rect[0] + h.rect[2]) / 2, cz = (h.rect[1] + h.rect[3]) / 2;
    if (!near(cx, cz, 290)) continue;
    for (const b of P.bays) {
      const um = (b.u0 + b.u1) / 2, k = fr.P(um, -1.0), lane = fr.P(um, 1.3 + rand() * 0.5);
      if (rand() < 0.88) man(k, h.y + 0.38, faceTo([nx, nz]), { pose: 'cross', hat: rand() < 0.5 ? 'turban' : 'cap' });
      if (rand() < 0.55) { const c = [lane[0] + (rand() - 0.5) * 0.8, lane[1] + (rand() - 0.5) * 0.3]; (rand() < 0.35 ? woman : man)(c, h.y - 0.1, faceTo([-nx, -nz]), { carry: rand() < 0.3 ? 'basket' : undefined }); }
    }
    // masonry bench by the door of a house without dukkans: two old men sitting
    if (!P.bays.length && h.laneW >= 2.6 && (h.seed % 5) < 2 && P.Lw - (P.ud + P.dw / 2) > 2.4 && near(cx, cz, 220)) {
      const u = P.ud + P.dw / 2 + 1.15, s = fr.P(u, 0.25);
      for (const d of [-0.4, 0.4]) if (rand() < 0.75) { const q = h.door === 'n' || h.door === 's' ? [s[0] + d, s[1]] : [s[0], s[1] + d]; man(q, h.y, faceTo([nx, nz]), { pose: 'sit', cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_white']), hat: 'cap' }); }
    }
  }
  // the streets and lanes: walkers standing and talking, boys, women with baskets, porters, donkeys with loads, cats
  for (const q of lanes()) {
    const horiz = q.axis === 'x', len = horiz ? q.r[2] - q.r[0] : q.r[3] - q.r[1], c = horiz ? (q.r[1] + q.r[3]) / 2 : (q.r[0] + q.r[2]) / 2, u0 = horiz ? q.r[0] : q.r[1], w = q.w;
    const step = q.kind === 'street' ? 5.5 : q.kind === 'lane' ? 10 : 15, R = q.kind === 'street' ? 290 : q.kind === 'lane' ? 230 : 150;
    for (let u = u0 + 3 + rand() * step; u < u0 + len - 3; u += step * (0.7 + rand() * 0.6)) {
      const off = (rand() - 0.5) * Math.max(0, w - 1.0), at = horiz ? [u, c + off] : [c + off, u], y = ground0(at[0], at[1]);
      if (!near(at[0], at[1], R)) continue;
      const along = horiz ? [rand() < 0.5 ? 1 : -1, 0] : [0, rand() < 0.5 ? 1 : -1], k = rand();
      if (k < 0.3) man(at, y, faceTo(along), { carry: rand() < 0.2 ? 'basket' : undefined });
      else if (k < 0.45) woman(at, y, faceTo(along), { carry: rand() < 0.5 ? 'basket' : undefined });
      else if (k < 0.6) { man(at, y, faceTo(along), { pose: 'talk' }); const b = horiz ? [at[0] + 0.8, at[1] + 0.1] : [at[0] + 0.1, at[1] + 0.8]; (rand() < 0.4 ? woman : man)(b, y, faceTo(along) + Math.PI, { pose: 'talk' }); }
      else if (k < 0.72) { for (let j = 0; j < 1 + (rand() < 0.5); j++) boy([at[0] + j * 0.6, at[1] + j * 0.3], y, rand() * 6.28, { pose: rand() < 0.3 ? 'squat' : 'stand' }); }
      else if (k < 0.82 && w >= 2.2) {
        // a muleteer with his donkey laden with sacks or baskets
        L.push({ t: 'animal', kind: 'donkey', at, y, rot: faceTo(along) + Math.PI / 2 * 0, seed: Math.floor(rand() * 1e9) });
        man([at[0] - along[0] * 1.9, at[1] - along[1] * 1.9], y, faceTo(along), { dress: 'tunic', hat: 'cap', cloth: 'cloth_brown', legs: 'bare' });
      } else if (k < 0.92) L.push({ t: 'animal', kind: 'cat', at: [at[0] + (horiz ? 0 : w * 0.4), at[1] + (horiz ? w * 0.4 : 0)], y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      else man(at, y, faceTo(along), { dress: 'tunic', legs: 'bare', hat: 'cap', carry: 'basket' });
    }
  }
  // the wall fountains: a woman or a water-carrier filling a jar, another waiting
  for (const f of fountains()) {
    if (!near(f.at[0], f.at[1], 260)) continue;
    const out = f.face === 's' ? [0, 1] : f.face === 'n' ? [0, -1] : f.face === 'e' ? [1, 0] : [-1, 0], y = ground0(f.at[0] + out[0], f.at[1] + out[1]);
    const p = [f.at[0] + out[0] * 0.95, f.at[1] + out[1] * 0.95];
    (rand() < 0.6 ? woman : man)(p, y, faceTo([-out[0], -out[1]]), { carry: 'pot', pose: 'stand' });
    if (rand() < 0.6) woman([p[0] + out[1] * 0.9 + out[0] * 0.7, p[1] + out[0] * 0.9 + out[1] * 0.7], y, faceTo([-out[0], -out[1]]), { carry: 'basket' });
    if (rand() < 0.5) boy([p[0] - out[1] * 0.8 + out[0] * 0.5, p[1] - out[0] * 0.8 + out[1] * 0.5], y, rand() * 6.28);
  }
  // street sellers on mats along the Talaa Kebira and the Talaa Seghira: herbs, mint, bread, eggs
  for (const [zc, x0, x1] of [[K.z, -295, 40], [S.z, -295, 80]]) {
    for (let x = x0 + 8; x < x1; x += 22 + rand() * 20) {
      if (!near(x, zc, 280) || (x > -156 && x < -108)) continue;
      const side = rand() < 0.5 ? -1 : 1, z = zc + side * (K.w / 2 - 0.75), y = ground0(x, z);
      L.push({ t: 'goods_mat', at: [x, z], y, rot: side > 0 ? Math.PI : 0, goods: pick([['greens', 'baskets'], ['bread', 'baskets'], ['greens', 'heap'], ['melons', 'heap']]), produce: ['cloth_green', 'cloth_ochre', 'cloth_red'], seed: Math.floor(rand() * 1e9) });
      woman([x + 0.0, z - side * 0.8], y + 0.0, side > 0 ? 0 : Math.PI, { pose: 'sit_ground' });
      if (rand() < 0.5) woman([x + 0.5, z + side * 1.1], y, side > 0 ? 0 : Math.PI, { carry: 'basket' });
    }
  }
  // washing across the derbs: a line from window to window, now and then a second
  for (const q of lanes()) {
    if (q.kind !== 'derb') continue;
    const len = q.r[3] - q.r[1], cx = (q.r[0] + q.r[2]) / 2;
    if (len < 9 || !near(cx, q.r[1], 215)) continue;
    for (let z = q.r[1] + 3.5 + rand() * 3; z < q.r[3] - 3; z += 6 + rand() * 6) if (rand() < 0.4) L.push({ t: 'wash_line', at: [cx, z], y: ground0(cx, z) + 4.6 + rand() * 1.1, rot: 0, len: q.w + 0.5, emb: [0.2, 0.2], clear: [0.35, 0.35], drop: 0.9, seed: Math.floor(rand() * 1e9) });
  }
  // the quays: wash-places with women kneeling at the water, cloth spread on the stones, an angler, ducks
  for (const { x, side } of washPlaces()) {
    const hw = RIVER.w / 2, z = riverZ(x) + side * (hw + 1.5), y = quayY(x, side), out = [0, side];
    for (let k = 0; k < 1 + (rand() < 0.6); k++) woman([x + k * 0.9, riverZ(x) + side * (hw + 0.9)], y, faceTo([0, -side]), { pose: 'squat', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_ochre']) });
    L.push({ t: 'basket', at: [x - 1.0, z], y, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.5) L.push({ t: 'animal', kind: 'donkey', at: [x + 3.4, z + side * 0.3], y, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9) });
    void out;
  }
  for (let x = -230; x < 260; x += 70) { const side = rand() < 0.5 ? -1 : 1, z = riverZ(x) + side * (RIVER.w / 2 + 1.4); man([x, z], quayY(x, side), faceTo([0, -side]), { pose: 'sit_low', dress: 'tunic', hat: 'cap', cloth: 'cloth_brown' }); }
  for (let x = -240; x < 250; x += 26 + rand() * 20) { const side = rand() < 0.5 ? -1 : 1; L.push({ t: 'chickens', kind: 'duck', at: [x, riverZ(x) + side * (RIVER.w / 2 + 2.6)], y: quayY(x, side), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
  void SITES;
  return L;
}
/** The street life in tiles of 100 m, each shown within 230 m. */
export function streetPlans() {
  const tiles = new Map();
  for (const e of streetLife()) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`fez-street-${k}`, list), center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}
