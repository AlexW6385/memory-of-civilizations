// The row of monasteries and temples, the tanks, the votive stupas, the village and the people of Nalanda (docs/settlements/nalanda.md §3, §9).
import { openLots, lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import { RADIUS, MONASTERIES, TEMPLES, TANKS, LEVEL, WAY, T3, M1, LIBRARY, mgate, lots, yards, tankD, WAY_LAMPS, BOOTHS, JALS, OTLAS, ANNEXES, GATE, STUPA_END } from './layout.js';
import { HALL, TOWERS } from './plan.js';
import '../../styles/nalanda/index.js';
import '../../styles/vernacular/index.js';
import '../../objects/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

/** The votive stupas: lining the way on both sides, and ringing the temples. */
function votives() {
  const at = [];
  const gates = MONASTERIES.map((m) => mgate(m)[1]);
  for (let z = -128; z <= 128; z += 7) {
    if (Math.abs(z) < 30 || Math.abs(z + 92) < 3.5 || z > 112) continue;                                           // before Temple 3's stair the way stays open
    at.push([WAY.x0 - 2.5, z, 0.85]);
    if (!gates.some((g) => Math.abs(g - z) < 5)) at.push([WAY.x1 + 2.5, z, 0.85]);
  }
  const ring = (t, gap) => {
    const h = t.half + t.tierH * 1.04 + 4;
    for (let i = -h; i <= h; i += 6.5) for (const [x, z] of [[t.c[0] + i, t.c[1] - h], [t.c[0] + i, t.c[1] + h], [t.c[0] - h, t.c[1] + i], [t.c[0] + h, t.c[1] + i]]) {
      if (x > t.c[0] + h - 1 && Math.abs(z - t.c[1]) < gap) continue;
      at.push([x, z, 0.7]);
    }
  };
  ring(T3, 7); for (const t of TEMPLES.slice(1)) ring(t, 5);
  return { t: 'votives', at: [...at.filter(([x, z]) => !(x > WAY.x0 - 1 && x < WAY.x1 + 1)).map(([x, z, s]) => [x, z, s]), STUPA_END] };
}

/** Monks, teachers, students, lay people, a few animals. */
function people() {
  const r = rng(640), P = [];
  let seed = 7;
  const skin = () => (r() < 0.6 ? 'skin_medium' : 'skin_dark');
  const monk = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'robe', cloth: r() < 0.6 ? 'cloth_ochre' : 'cloth_maroon', cloth2: 'cloth_ochre', over: 'sash', hair: 'shaven', feet: 'bare', skin: skin(), hat: 'none', carry: 'none', pose: 'stand', ...o });
  const lay = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'shawl', hair: 'short', feet: 'bare', skin: skin(), hat: r() < 0.4 ? 'turban' : 'none', carry: 'none', pose: 'stand', ...o });
  const woman = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(r() * 3)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', feet: 'bare', skin: skin(), hat: 'none', carry: 'pot', pose: 'stand', h: 0.95, ...o });
  // Monastery 1's court: the teacher on the podium, the students on their mats before it, two debaters at the well, a monk at the shrine
  const [x0, z0, x1, z1] = M1.rect, zc = (z0 + z1) / 2, mx = (x0 + 7.6 + x1 - 7.6) / 2, c0 = x0 + 7.6;
  const lz1 = zc + 10.6;
  monk([mx - 1.8, lz1 - 0.8], 1.62, [0, -1], { pose: 'cross', cloth: 'cloth_maroon' });
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
    const sx = mx - 7.4 + k * 1.9 + (row % 2) * 0.6, sz = zc + 2.1 + row * 1.35;
    if (Math.hypot(sx - (mx - 8), sz - (zc - 5.5)) < 2.2 || r() < 0.3) continue;
    (r() < 0.8 ? monk : lay)([sx, sz - 0.05], 0.03, [0, 1], { pose: 'cross' });
  }
  monk([c0 + 7.4, zc - 4.6], 0, [1, 0.3], { pose: 'talk' }); monk([c0 + 9.0, zc - 4.2], 0, [-1, -0.2], { pose: 'talk' });
  monk([mx + 7.4, zc + 0.2], 0.35, [1, 0], { pose: 'kneel', arms: 'pray' });
  // in two cells: a monk reading on the bed, below and above
  const nc = 15, pitch = (x1 - x0) / nc;
  monk([x0 + 7.5 * pitch - 0.98, z0 + 2.0], 0.45, [0, 1], { pose: 'cross' });
  monk([x0 + 6.5 * pitch - 0.98, z0 + 2.0], 3.7 + 0.45, [0, 1], { pose: 'cross' });
  // the library's ground hall: copyists at the desks
  for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) if (r() < 0.7) { const dx = HALL.c[0] - 3 + i * 3.2, dz = HALL.c[1] + sz * 2.6; monk([dx, dz + sz * 0.95], 0.03, [0, -sz], { pose: 'cross', cloth: 'cloth_ochre' }); }
  // before Temple 3's stair: a flower seller and her buyers, monks going up, a few pilgrims
  const ts = T3.c[0] + T3.half + T3.tierH * 1.04 + 3;
  P.push({ t: 'goods_mat', at: [ts + 2.5, 8], y: 0, rot: face([-1, 0]), seed: 5, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_red', 'cloth_ochre'] });
  woman([ts + 3.5, 8.5], 0, [-1, 0], { pose: 'sit_ground', carry: 'none' }); lay([ts + 0.5, 7.8], 0, [1, 0.2], { pose: 'talk' });
  monk([ts - 7, -2.5], 0, [-1, 0]); monk([ts - 4, 3], 0, [-1, 0], { pose: 'talk' }); monk([ts - 3, 4.5], 0, [-1, 0], { pose: 'talk' });
  // at the east tank's ghats: women filling pots, a monk washing, a boy
  for (const [gz, k] of [[-75, 2], [-25, 0], [25, 1], [75, 2]]) {
    const gx = TANKS[0].rect[0] - 3.7;
    woman([gx - 0.6, gz + 1.0], 0, [1, 0], { pose: 'stand' });
    if (k === 0) monk([gx - 1.2, gz - 1.6], 0, [1, 0.2], { pose: 'squat', carry: 'none' });
  }
  // the village: women at the doors with pots and baskets, men and porters, zebu and dogs
  const L = lots();
  for (let i = 0; i < L.length; i += 3) {
    const [rx0, rz0, rx1, rz1] = L[i].rect, f = L[i].front, x = f === 'w' ? rx0 - 1.6 : (rx0 + rx1) / 2 + 2, z = f === 'n' ? rz0 - 1.6 : (rz0 + rz1) / 2;
    if (tankD(x, z) < 6) continue;
    const t = r();
    if (t < 0.4) woman([x, z], 0, f === 'w' ? [1, 0] : [0, 1], { pose: 'stand', carry: r() < 0.5 ? 'basket' : 'pot' });
    else if (t < 0.7) lay([x, z], 0, f === 'w' ? [1, 0] : [0, 1], { pose: 'talk' });
    else P.push({ t: 'animal', kind: r() < 0.7 ? 'zebu' : 'dog', at: [x + 2, z + 0.5], y: 0, rot: r() * 6.28, seed: i + 3 });
  }
  // the booths: the seller on her mat behind the counter, a buyer before it
  const SD = { w: [-1, 0], e: [1, 0], n: [0, -1], s: [0, 1] };
  const bth = [...BOOTHS, ...bazaar()];
  bth.forEach(([x, z, f, kind], i) => {
    const d = SD[f], sx = x - d[0] * 1.45, sz = z - d[1] * 1.45;
    (kind === 'pots' || kind === 'grain' ? lay : woman)([sx, sz], 0.03, d, { pose: 'sit_ground', carry: 'none' });
    if (i % 2 === 0) (r() < 0.5 ? lay : monk)([x + d[0] * 1.3, z + d[1] * 1.3 + (d[0] ? 0.4 : 0)], 0, [-d[0], -d[1]], { pose: 'stand' });
  });
  // the water-sheds: an attendant at the pots, a monk drinking
  for (const [x, z, f] of JALS) { const d = SD[f]; lay([x - d[0] * 0.9, z - d[1] * 0.9 - 0.2], 0, d, { pose: 'stand', hat: 'none' }); monk([x + d[0] * 1.2, z + d[1] * 1.2 + 0.6], 0, [-d[0], -d[1]], { pose: 'stand' }); }
  // monks on the benches against the monasteries' fronts, looking out on the way
  OTLAS.forEach((o, i) => { if (i % 2 === 0 || r() < 0.5) monk([o[0] - 0.1, (o[1] + o[3]) / 2 + (r() - 0.5) * 6], 0.5, [-1, 0], { pose: r() < 0.6 ? 'cross' : 'talk' }); });
  // the other monasteries: devotees in the stupa courts, a teacher with students under the pavilion
  for (const m of MONASTERIES) {
    if (m === M1) continue;
    const [a0, b0, a1, b1] = m.rect, cz = (b0 + b1) / 2, cxm = (a0 + 7.6 + a1 - 7.6) / 2;
    if (m.court === 'stupa') {
      for (let k = 0; k < 4; k++) monk([cxm - 4.6 + k * 2.2, cz + 2.6], 0.03, [0, 1], { pose: 'cross' });
      monk([cxm - 2, cz + 3.9], 0.03, [0, 1], { pose: 'kneel', arms: 'pray' }); monk([cxm + 4, cz - 8], 0, [-1, 0.3], { pose: 'talk' }); monk([cxm + 5.4, cz - 7.6], 0, [-1, -0.3], { pose: 'talk' });
    } else {
      const bx = cxm - 3.75, bz = cz + 8.2;
      monk([bx - 2.6, bz], 0.43, [1, 0], { pose: 'cross', cloth: 'cloth_maroon' }); monk([bx + 2.5, bz], 0.43, [-1, 0], { pose: 'cross' }); monk([bx, bz + 2.7], 0.43, [0, -1], { pose: 'cross' });
      monk([cxm + 6, cz + 6], 0, [-1, 0], { pose: 'stand' });
    }
    // a monk reading in a cell, one on each floor, as in the first
    const pitch = (a1 - a0) / 15;
    monk([a0 + 4.5 * pitch - 0.98, b0 + 2.0], 0.45, [0, 1], { pose: 'cross' }); monk([a0 + 9.5 * pitch - 0.98, b0 + 2.0], 3.7 + 0.45, [0, 1], { pose: 'cross' });
  }
  // the annexes: cooks at the hearths, monks at their meal, a porter in the granary, the physician and his patients
  for (const a of ANNEXES) {
    const [x0, z0, x1, z1] = a.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (a.kind === 'kitchen') { lay([cx - 3, z0 + 3], 0, [0, -1], { pose: 'stand', hat: 'none' }); woman([cx + 3, z0 + 3], 0, [0, -1], { pose: 'stand', carry: 'none' }); lay([cx, cz], 0, [1, 0], { pose: 'talk', hat: 'none' }); }
    else if (a.kind === 'refectory') for (let k = 0; k < 6; k++) monk([x0 + 4.6 + k * 1.8, z0 + 2.2 + 1.2 + (k % 2) * 3.1], 0.03, [0, k % 2 ? -1 : 1], { pose: 'cross' });
    else if (a.kind === 'granary') { lay([cx, cz + 0.6], 0, [1, 0], { pose: 'stand', hat: 'none', carry: 'sack' }); lay([cx + 2.4, cz + 1.2], 0, [-1, 0], { pose: 'talk' }); }
    else { monk([x0 + 3.8, z0 + 1.7], 0.48, [0, 1], { pose: 'cross' }); lay([cx, cz + 1.3], 0, [0, -1], { pose: 'stand', hat: 'none' }); monk([x0 + 9.6, z1 - 1.7], 0.48, [0, -1], { pose: 'cross' }); }
  }
  // the library: readers in the upper hall and in the other two halls, a guard at the yard's gate
  { const [hx0, hz0] = HALL.c, SY = 4.1;
    for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) if (r() < 0.6) monk([hx0 - 4 + i * 3.4, hz0 + sz * 2.4 + sz * 0.8], SY + 0.03, [0, -sz], { pose: 'cross', cloth: 'cloth_ochre' });
    for (const t of TOWERS.slice(0, 2)) monk([t.c[0] - 1, t.c[1] + 1.8], 0.03, [0, -1], { pose: 'cross' });
    lay([LIBRARY.yard[2] - 1.5, (LIBRARY.yard[1] + LIBRARY.yard[3]) / 2 + 3.2], 0, [-1, 0], { pose: 'stand', hat: 'none' }); monk([LIBRARY.yard[2] - 4, -92 - 6], 0, [-1, 0.4], { pose: 'talk' }); monk([LIBRARY.yard[2] - 5.2, -92 - 5.6], 0, [1, 0], { pose: 'talk' }); }
  // the gate: two guards, pilgrims coming in with their bundles
  lay([-6.2, GATE.c[1] + 5.2], 0, [0, -1], { pose: 'stand', hat: 'none' }); lay([6.2, GATE.c[1] + 5.2], 0, [0, -1], { pose: 'stand', hat: 'none' });
  lay([-1.5, GATE.c[1] + 9], 0, [0, -1], { pose: 'stand', carry: 'bundle' }); woman([1.8, GATE.c[1] + 11], 0, [0, -1], { pose: 'stand', carry: 'basket' });
  // the yards: zebu and goats in the pens, hay
  yards().forEach((y, i) => { const [a0, b0, a1, b1] = y.rect; if (i % 3 === 2) return; P.push({ t: 'animal', kind: 'zebu', at: [(a0 + a1) / 2 - 1, (b0 + b1) / 2], y: 0, rot: r() * 6, seed: 300 + i }, { t: 'animal', kind: i % 2 ? 'goat' : 'zebu', at: [(a0 + a1) / 2 + 1.5, (b0 + b1) / 2 + 1], y: 0, rot: r() * 6, seed: 400 + i }); });
  void LEVEL;
  return base('nalanda-people', 'life', P);
}

/** The bazaar of the village: booths along the road to it, south of the way's end, facing the road. */
function bazaar() {
  const B = [], kinds = ['grain', 'veg', 'pots', 'cloth', 'flowers', 'veg', 'grain'];
  for (let i = 0; i < 7; i++) B.push([52 + i * 10, 128.2, 'n', kinds[i], 700 + i]);
  for (let z = -84; z < 80; z += 15) B.push([130.2, z, 'w', kinds[Math.floor((z + 84) / 15) % 7], 800 + z]);
  return B.filter(([x, z]) => tankD(x, z) > 8);
}
/** What stands behind the houses and in the yards: dung-cake stacks, clay bins, charpoys, hay, the pens and the potter's yard. */
function villageItems() {
  const r = rng(77), I = [];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, south = l.front === 'n', strip = south ? z0 + 8.6 - z1 : x0 + 10.2 - x1;
    if (strip < 1.5 || r() < 0.25) continue;
    const t = r(), at = (u) => (south ? [x0 + u * (x1 - x0), z1 + 0.85] : [x1 + 0.85, z0 + u * (z1 - z0)]), [px, pz] = at(0.2 + r() * 0.6);
    if (t < 0.4) I.push({ k: 'dung', x: px, z: pz, s: 0.8 + r() * 0.3 });
    else if (t < 0.65) I.push({ k: 'kothi', x: px, z: pz, s: 0.8 + r() * 0.2 });
    else if (t < 0.85 && strip >= 1.9) I.push({ k: 'charpoy', x: px, z: pz, rot: south ? 0 : 1, cloth: r() < 0.5 ? 'cloth_white' : 'cloth_red' });
    else I.push({ k: 'haypile', x: px, z: pz, s: 0.6 });
    if (r() < 0.3) { const [qx, qz] = at(r() < 0.5 ? 0.08 : 0.92); I.push({ k: 'dung', x: qx, z: qz, s: 0.7 }); }
  }
  yards().forEach((y, i) => {
    const [x0, z0, x1, z1] = y.rect, f = (a, b) => ({ k: 'fence', seg: [...a, ...b] }), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (i % 4 === 0) { I.push({ k: 'kiln', x: cx - 1.5, z: cz - 0.5 }, { k: 'potstack', x: cx + 2.6, z: z1 - 1.2 }, { k: 'dung', x: x0 + 0.9, z: z1 - 0.9, s: 1 }); return; }
    const fr = y.back === 's' ? 'n' : 'w';       // the open side: the yard's front
    const m = 0.3, X0 = x0 + m, X1 = x1 - m, Z0 = z0 + m, Z1 = z1 - m;
    if (fr !== 'n') { I.push(f([X0, Z0], [X1, Z0])); } else { I.push(f([X0, Z0], [cx - 1.2, Z0]), f([cx + 1.2, Z0], [X1, Z0])); }
    I.push(f([X0, Z1], [X1, Z1]), f([X1, Z0], [X1, Z1]));
    if (fr === 'w') I.push(f([X0, Z0], [X0, cz - 1.2]), f([X0, cz + 1.2], [X0, Z1])); else I.push(f([X0, Z0], [X0, Z1]));
    I.push({ k: 'haypile', x: X1 - 1.2, z: Z1 - 1.2, s: 0.9 });
  });
  return I;
}

export async function town() {
  const E = [];
  for (const m of MONASTERIES) if (m !== M1) E.push({ t: 'monastery', rect: m.rect, enter: true, court: m.court, seed: m.seed });
  for (const t of TEMPLES.slice(1)) E.push({ t: 'temple', ...t, y: 0, niches: true });
  for (const t of TANKS) E.push({ t: 'tank', rect: t.rect, level: LEVEL, ghats: t.ghats });
  TANKS.forEach((t, i) => {
    const [x0, z0, x1, z1] = t.rect, avoid = t.ghats.map((g) => (g.side === 'w' ? [x0, g.at - 5, x0 + 5, g.at + 5] : g.side === 'e' ? [x1 - 5, g.at - 5, x1, g.at + 5] : g.side === 'n' ? [g.at - 5, z0, g.at + 5, z0 + 5] : [g.at - 5, z1 - 5, g.at + 5, z1]));
    E.push({ t: 'lotus', rect: t.rect, level: LEVEL, n: [150, 70, 40][i], seed: 31 + i, avoid });
  });
  E.push({ t: 'pavilion', at: TANKS[0].ghats.map((g) => [TANKS[0].rect[0] - 4.4, g.at + 5.5, 'e']) });
  E.push(votives());
  const foot = (t) => t.c[0] + t.half + t.tierH * 1.04 + 1.5;
  E.push({ t: 'lamps', at: [...WAY_LAMPS, [foot(T3), -5.4], [foot(T3), 5.4], ...TEMPLES.slice(1).flatMap((t) => [[foot(t), t.c[1] - 4.6], [foot(t), t.c[1] + 4.6]]), [LIBRARY.yard[2] - 3, -88.6], [LIBRARY.yard[2] - 3, -95.4], [HALL.c[0] + HALL.half[0] + 2.2, HALL.c[1] - 3], [HALL.c[0] + HALL.half[0] + 2.2, HALL.c[1] + 3]] });
  E.push({ t: 'booth', at: BOOTHS }, { t: 'booth', at: bazaar() });
  E.push({ t: 'jal', at: [...JALS, [LIBRARY.yard[2] - 6, -80, 'e']] });
  E.push({ t: 'otla', runs: OTLAS });
  for (const a of ANNEXES) E.push({ t: 'annex', ...a });
  E.push({ t: 'gate', ...GATE, c: GATE.c });
  E.push({ t: 'village', items: villageItems() });
  const all = lots(), houses = [], open = openLots(all, [ARRIVALS['nalanda'][0], ARRIVALS['nalanda'][2]], 16);
  const hl = all.map((l) => ({ t: 'house_india', ...l, ...(open.has(l) ? { open: true } : {}) }));
  houses.push(...lodTiles('nalanda-houses', 'vernacular', hl, { near: 130, R: RADIUS, entrance: { at: [0, 40], facing: 'n' } }));
  return [base('nalanda-town', 'nalanda', E), people(), ...houses];
}
