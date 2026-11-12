// Khajuraho about 1050 — the furnishing and the life of the temples (docs/settlements/khajuraho.md §11):
// in each porch the bell, the lamps and the flowers of the pūjā, garlands swagged between the front
// pillars; offerings before the Varaha; lotus on the tank; the priests, the pilgrims walking round
// the temples on their terraces, the flower sellers at the foot of the stairs, the cows on the lawns,
// the bathers and the water-carriers at the tank. Pure data.

import { TEMPLES, TANK, VARAHA, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FLOWERS = [['cloth_white'], ['cloth_white', 'cloth_red'], ['cloth_red', 'cloth_white', 'cloth_white']];   // jasmine, oleander (no marigold before the 16th c.)

/** The porch of a nagara_temple as the style builds it (src/styles/nagara: halls[4]): its rect, floor and ceiling. */
export function porchOf(t) {
  const [cx, cz] = t.c, W = t.w, L = t.len, H = t.h, J = t.jagati, plinth = H * 0.12, Lh = (L - W / 2) / 0.84;
  const x0 = cx + W / 2 + Lh * 0.66, x1 = x0 + Lh * 0.18, hw = W * 0.36;
  return { r: [x0, cz - hw, x1, cz + hw], floor: J + plinth + 0.9, ceil: J + plinth + H * 0.2 - 0.08, cz };
}
/** The terrace of a temple (its own or the style's default) and the plinth under the halls. */
const terraceOf = (t) => t.terrace || [t.c[0] - t.w * 0.85, t.c[1] - t.w * 0.95, t.c[0] + t.len + 4, t.c[1] + t.w * 0.95];

/** The things of the pūjā, built with the temples (style nagara, element `rite`). */
export function rites() {
  const E = [];
  TEMPLES.forEach((t, i) => {
    const { r, floor, ceil, cz } = porchOf(t), mats = FLOWERS[i % FLOWERS.length];
    // the bell hung from the porch ceiling on the axis, rung on entering
    E.push({ t: 'rite', kind: 'bell', at: [(r[0] + r[2]) / 2, cz], top: ceil, drop: Math.max(0.2, ceil - floor - 2.35), r: 0.13 });
    // at the sanctum's door (the porch's west end): two lamp stands, an offering of lamp, flowers and water pot
    for (const sz of [-1, 1]) E.push({ t: 'rite', kind: 'stand', at: [r[0] + 0.45, cz + sz * 0.9], y: floor, h: 1.0 });
    E.push({ t: 'rite', kind: 'offering', at: [r[0] + 0.9, cz], y: floor, n: [-1, 0], seed: i, mats });
    // garlands swagged between the front pillars, behind the torana, and looped on the inner pillars
    const px = r[2] - 0.6, gy = floor + 3.3, hz = (r[3] - r[1]) / 2 - 0.6;
    E.push({ t: 'rite', kind: 'garland', a: [px - 0.45, gy, cz - hz + 0.42], b: [px - 0.45, gy, cz + hz - 0.42], sag: 0.55, mats });
    E.push({ t: 'rite', kind: 'garland', a: [px - 0.45, gy - 0.05, cz - hz + 0.42], b: [px - 0.45, gy - 0.05, cz + hz - 0.42], sag: 0.35, mats: [mats[mats.length - 1]] });
    // a row of little lamps along the seat's edge on either side
    for (const sz of [-1, 1]) E.push({ t: 'rite', kind: 'lamps', at: [r[0] + 0.4, cz + sz * (hz - 0.15)], to: [r[2] - 1.2, cz + sz * (hz - 0.15)], y: floor, count: 5 });
  });
  // before the boar: lamps and flowers on the pavilion floor, on its north side where it looks
  const [vx0, vz0, vx1, vz1] = VARAHA, vcx = (vx0 + vx1) / 2, vcz = (vz0 + vz1) / 2;
  E.push({ t: 'rite', kind: 'offering', at: [vcx + 1.9, vcz], y: 2.6, n: [1, 0], seed: 3 });
  E.push({ t: 'rite', kind: 'lamps', at: [vcx - 1.2, vcz - 1.15], to: [vcx + 1.2, vcz - 1.15], y: 2.6, count: 7 });
  E.push({ t: 'rite', kind: 'loop', at: [vcx + 1.52, 2.6 + 1.4, vcz], ux: 0, uz: 1, w: 0.6, drop: 0.45, mats: ['cloth_white', 'cloth_red'] });
  // lotus pads in drifts along the tank's shallow margins
  const rand = rng(77), pts = [];
  for (let k = 0; k < 700 && pts.length < 140; k++) {
    const a = rand() * Math.PI * 2, f = 0.82 + rand() * 0.15, x = TANK.c[0] + Math.cos(a) * TANK.r[0] * f, z = TANK.c[1] + Math.sin(a) * TANK.r[1] * f;
    if (Math.sin(a * 3 + 1) < 0.1) continue;        // in drifts, not all round
    if (pts.some(([p, q]) => Math.hypot(p - x, q - z) < 0.9)) continue;
    pts.push([x, z]);
  }
  E.push({ t: 'rite', kind: 'pads', at: [0, 0], y: TANK.level + 0.015, pts, seed: 9 });
  return E;
}

/** The people and the cows (style life). */
export function people() {
  const L = [], rand = rng(1050), face = ([dx, dz]) => Math.atan2(-dx, -dz), pick = (a) => a[Math.floor(rand() * a.length)];
  let seed = 11;
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, feet: 'bare', hat: 'none', carry: 'none', pose: 'stand', skin: pick(['skin_medium', 'skin_dark']), ...o });
  const priest = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'topknot', over: 'sash', beard: false, ...o });
  const man = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', cloth: pick(['cloth_white', 'cloth_white', 'cloth_ochre']), cloth2: 'cloth_white', hat: pick(['turban', 'none']), hair: 'short', ...o });
  const woman = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', cloth: pick(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre']), cloth2: pick(['cloth_ochre', 'cloth_red', 'cloth_white']), hair: 'bun', h: 1.5, over: 'shawl', ...o });
  TEMPLES.forEach((t, i) => {
    const { r, floor, cz } = porchOf(t), T = terraceOf(t), [cx] = t.c, J = t.jagati;
    // in the porch: the priest at the sanctum's door, a devotee kneeling with joined hands
    priest([r[0] + 1.4, cz + 0.35], floor, [-1, 0], { arms: i % 2 ? 'pray' : undefined });
    if (i !== 1) fig([r[0] + 2.3, cz - 0.5], floor, [-1, 0], { dress: 'wrap', cloth: pick(['cloth_white', 'cloth_red']), cloth2: 'cloth_white', hair: 'long', pose: 'kneel', arms: 'pray' });
    // pilgrims walking round on the terrace, keeping the temple on their right (east → south → west → north)
    const zs = cz + t.w * 0.78, zn = cz - t.w * 0.78, xw = (T[0] + (cx - t.w / 2)) / 2;
    const ring = [[[cx + t.len * 0.4, Math.min(zs, T[3] - 1.5)], [-1, 0]], [[cx - 1, Math.min(zs, T[3] - 1.5)], [-1, 0]], [[Math.max(xw, T[0] + 1.2), cz + 2], [0, -1]], [[cx + t.len * 0.2, Math.max(zn, T[1] + 1.5)], [1, 0]]];
    for (const [k, [at, dir]] of ring.entries()) {
      if (rand() < 0.3) continue;
      if (k % 2) man(at, J, dir, { carry: rand() < 0.3 ? 'basket' : 'none' }); else woman(at, J, dir, { carry: rand() < 0.5 ? 'pot' : 'none' });
      if (rand() < 0.4) woman([at[0] + dir[1] * 0.7 + dir[0] * -0.6, at[1] - dir[0] * 0.7 + dir[1] * -0.6], J, dir, { carry: rand() < 0.5 ? 'child' : 'none' });
    }
    // at the foot of the terrace's stair: flower sellers on the ground behind their mats of jasmine and oleander
    const sx = T[2] + J * 2.2 + 2.2, sw = t.w * 0.14 + 2.4;
    for (const sz of [-1, 1]) {
      const mz = cz + sz * (sw + 0.9);
      L.push({ t: 'goods_mat', at: [sx, mz], y: 0, rot: face([0, -sz]), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_white', 'cloth_red'] });
      woman([sx, mz + sz * 0.95], 0, [0, -sz], { pose: 'sit_ground', carry: 'none' });
    }
    // a pilgrim coming to the stair with flowers bought, another going away
    man([sx + 3.5, cz + 0.6], 0, [-1, 0], { carry: 'basket' });
    if (i % 2 === 0) woman([sx + 6, cz - 0.8], 0, [1, 0.2]);
  });
  // cows on the lawns between the temples, one lying in the shade of a terrace, one by the tank
  for (const [x, z, rot, graze] of [[-40, -38, 0.8, true], [-36, 5, 2.2, false], [5, -48, 4.1, true], [-15, 52, 1.2, true], [70, 20, 3.3, false], [12, 102, 5.2, true], [60, -60, 0.3, false]]) {
    L.push({ t: 'animal', kind: 'zebu', at: [x, z], y: 0, rot, seed: seed++, graze, mat: pick(['hide_white', 'hide_white', 'hide_grey', 'hide_tan']) });
  }
  L.push({ t: 'figure', at: [-34, 6.8], y: 0, rot: face([0, -1]), seed: seed++, dress: 'wrap', top: 'bare', cloth: 'cloth_ochre', cloth2: 'cloth_white', skin: 'skin_dark', hat: 'none', hair: 'short', pose: 'sit_low', carry: 'none', feet: 'bare' });
  // at the tank: bathers standing in the shallows on the north margin, women filling pots, a priest at his prayers
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI / 2 + (k - 4) * 0.16, x = TANK.c[0] + Math.cos(a) * TANK.r[0] * 1.07, z = TANK.c[1] + Math.sin(a) * TANK.r[1] * 1.07;
    const y = height(x, z);
    if (k % 3 === 0) woman([x, z], y, [TANK.c[0] - x, TANK.c[1] - z], { carry: 'pot' });
    else if (k % 3 === 1) man([x, z], y, [TANK.c[0] - x, TANK.c[1] - z], { top: 'bare', hat: 'none', arms: 'pray' });
    else priest([x, z], y, [TANK.c[0] - x, TANK.c[1] - z], { pose: 'cross', arms: 'pray' });
  }
  return L;
}
