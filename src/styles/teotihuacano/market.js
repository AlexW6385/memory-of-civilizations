// The market and the obsidian workshops of Teotihuacan (docs/settlements/teotihuacan.md §13): the Great
// Compound's walled market plaza west of the avenue, opposite the Ciudadela, with rows of stalls (mats on the
// ground under reed-mat shades, the goods laid out, sellers sitting by them); and, in the compounds, the
// obsidian workshop room — raw nodules, cores, blades, flake drifts, two knappers — and the flake midden.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { ollaKit, storeJarKit, bowlsKit, hearthKit, put } from '../maya/household.js';
import { inst, fig } from './street.js';

const S = 'stucco_ochre', RD = 'stucco_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Raw nodules (rough lumps), prismatic cores with their flutes, and a fan of blades; each lying on the floor, ~0.4 m across. */
export const nodulesKit = () => carved('obs-nodules', (k) => {
  for (let i = 0; i < 6; i++) { const a = i * 1.1, r = 0.07 + (i % 3) * 0.015; k.geo('obsidian', lathe([[0.001, 0], [r, 0.01], [r * 0.9, r * 1.4], [0.001, r * 1.7]], 7, (th) => 1 + 0.18 * Math.sin(th * 3 + i)).translate(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14)); }
});
export const coresKit = () => carved('obs-cores', (k) => {
  for (let i = 0; i < 4; i++) k.geo('obsidian', lathe([[0.001, 0], [0.05, 0], [0.046, 0.1], [0.028, 0.17], [0.001, 0.19]], 6).translate(-0.12 + i * 0.08, 0, (i % 2) * 0.07));
});
export const bladesKit = (n = 9) => carved(`obs-blades${n}`, (k) => {
  for (let i = 0; i < n; i++) { const a = (i - n / 2) * 0.12, l = 0.13 + (i % 3) * 0.02; k.seg('obsidian', [Math.sin(a) * 0.03, 0.01, 0], [Math.sin(a) * l, 0.012 + (i % 2) * 0.004, Math.cos(a) * l], 0.008, 0.004, 0.005, 0.003); }
});
/** A drift of flakes: a low mound and scattered shards, r about 0.4 (scaled by put). */
export const flakesKit = () => carved('obs-flakes', (k) => {
  const r = rng(11);
  k.geo('basalt', lathe([[0.001, 0], [0.4, 0], [0.3, 0.05], [0.14, 0.1], [0.001, 0.12]], 9, (th) => 0.9 + 0.12 * Math.sin(th * 3)));
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 0.2 + r() * 0.35, s = 0.015 + r() * 0.02; k.fy('obsidian', [-s, s, -s * 0.6, s * 0.6], [-s * 0.3, s * 0.3, -s * 0.2, s * 0.2], 0, s * 0.5 + 0.008 + (d < 0.35 ? 0.05 : 0)); const g = k.m.get('obsidian'); g[g.length - 1].translate(Math.cos(a) * d, 0, Math.sin(a) * d); }
});
const hammerKit = () => carved('hammerstones', (k) => { for (const [x, z] of [[0, 0], [0.12, 0.05], [0.05, -0.1]]) k.geo('andesite', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.045], [0.04, 0.085], [0.001, 0.095]], 8).translate(x, 0, z)); });
const anvilKit = () => carved('anvil', (k) => { k.fy('basalt', [-0.17, 0.17, -0.12, 0.12], [-0.14, 0.14, -0.1, 0.1], 0, 0.1); });
const basketBlades = () => carved('basket-blades', (k) => {
  k.geo('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.24, 0.24], [0.21, 0.22], [0.001, 0.12]], 12));
  for (let i = 0; i < 14; i++) { const a = i * 0.9, d = 0.05 + (i % 3) * 0.05; k.seg('obsidian', [Math.cos(a) * d, 0.12, Math.sin(a) * d], [Math.cos(a) * (d + 0.06), 0.4 + (i % 4) * 0.04, Math.sin(a) * (d + 0.06)], 0.011, 0.004, 0.006, 0.003); }
});

/**
 * The obsidian workshop in a compound's room (called from porticoRooms; the frame helpers are its own):
 * I the room's rectangle in the callers' (u, v) frame as A(u, v) → [x, z], f the floor, d the depth.
 */
export function workshopRoom(ctx, A, f, a0, a1, v0, v1, inward, rand) {
  const { bag, col } = ctx, L = STYLES.life.elements, at = (u, v) => { const [x, z] = A(u, v); return [x, f, z]; };
  // the cache against the back wall: raw nodules in a heap, a row of cores, a jar of water
  put(bag, nodulesKit(), ...at(a0 + 0.8, v1 - 0.5), 0.3); put(bag, nodulesKit(), ...at(a0 + 1.4, v1 - 0.45), 1.7); put(bag, coresKit(), ...at(a1 - 1.3, v1 - 0.45), inward);
  put(bag, storeJarKit(), ...at(a1 - 0.45, v1 - 0.5), 0); { const [x, z] = A(a1 - 0.45, v1 - 0.5); col.circle(x, z, 0.26, f, f + 0.6); }
  // two knappers sitting on a mat facing one another, each with an anvil stone, hammerstones, a drift of flakes at the knees
  const mu = (a0 + a1) / 2 - 0.2, mv = (v0 + v1) / 2 + 0.1, mt = A(mu, mv);
  { const w = 2.2, [x0, z0] = A(mu - w / 2, mv - 0.9), [x1, z1] = A(mu + w / 2, mv + 0.9); bag.add('reed_mat', box(Math.min(x0, x1), f, Math.min(z0, z1), Math.max(x0, x1), f + 0.02, Math.max(z0, z1))); }
  for (const s of [-1, 1]) {
    const [px, pz] = A(mu + s * 0.8, mv), uX = Math.abs(A(1, 0)[0] - A(0, 0)[0]) > 0.5, [dx, dz] = uX ? [-s, 0] : [0, -s], rot = Math.atan2(-dx, -dz);
    L.figure({ at: [px, pz], y: f + 0.02, rot, seed: Math.floor(rand() * 1e9), pose: 'squat', dress: 'tunic', legs: 'bare', cloth: 'cloth_white', cloth2: 'cloth_brown', skin: 'skin_medium', hair: 'long', hairMat: 'hide_black', feet: 'bare', over: 'none' }, ctx);
    put(bag, anvilKit(), ...at(mu + s * 0.05, mv + 0.15 * s), 0); put(bag, hammerKit(), ...at(mu + s * 0.12, mv - 0.25 * s), 0);
  }
  put(bag, flakesKit(), ...at(mu, mv - 0.7), 0, 0.9); put(bag, flakesKit(), ...at(mu + 0.5, mv + 0.55), 2, 0.6);
  col.circle(mt[0], mt[1], 0.7, f, f + 0.3);
  // the finished blades: a basket of them, a cloth with blades laid in rows by the door, a few drifts of flakes in the corners
  put(bag, basketBlades(), ...at(a0 + 0.55, v0 + 0.7), 0); { const [x, z] = A(a0 + 0.55, v0 + 0.7); col.circle(x, z, 0.27, f, f + 0.4); }
  { const [x0, z0] = A(a1 - 1.25, v0 + 0.4), [x1, z1] = A(a1 - 0.25, v0 + 1.1); bag.add('cloth_white', box(Math.min(x0, x1), f, Math.min(z0, z1), Math.max(x0, x1), f + 0.015, Math.max(z0, z1))); }
  for (let i = 0; i < 3; i++) put(bag, bladesKit(), ...at(a1 - 0.95 + i * 0.3, v0 + 0.75), inward + 1.57, 1);
  put(bag, flakesKit(), ...at(a0 + 0.5, v0 + 1.9), 1, 0.7); put(bag, flakesKit(), ...at(a1 - 0.5, v1 - 1.5), 0.5, 0.55);
}

/** The midden of a workshop compound's second patio: a heap of flakes and spent cores with a few blades, ~3 m across. */
export function midden(bag, col, x, y, z, seed) {
  const r = rng(seed);
  put(bag, flakesKit(), x, y, z, r() * 6, 3.4); put(bag, flakesKit(), x + 1.6, y, z + 0.7, r() * 6, 1.6);
  for (let i = 0; i < 3; i++) put(bag, coresKit(), x - 1.4 + r() * 2.8, y, z - 1.2 + r() * 2.4, r() * 6, 1);
  col.circle(x, z, 1.2, y, y + 0.35);
}

// ---- the market ----------------------------------------------------------------------------------------------
/** The wares of a stall, laid on its mat by kind, in a row of slots (u across, v toward the buyers) of the stall's frame. */
function wares(bag, kind, put3, rand, W) {
  const n = Math.floor(W / 0.62);
  for (let i = 0; i < n; i++) {
    const u = -W / 2 + (i + 0.5) * W / n;
    if (kind === 'pots') put3(i % 2 ? ollaKit() : storeJarKit(), u, 0.1 + rand() * 0.2, rand() * 6, 0.9 + rand() * 0.2);
    else if (kind === 'bowls') put3(bowlsKit(rand() < 0.5 ? RD : 'paint_ochre'), u, 0.15 + rand() * 0.15, rand() * 6, 1);
    else if (kind === 'obsidian') { put3(bladesKit(7), u, 0.15, 1.57, 1); if (i % 3 === 0) put3(coresKit(), u, 0.4, rand() * 6, 0.9); }
    else if (kind === 'baskets') put3(basketOf(['paint_ochre', 'cloth_brown', 'cloth_red', 'cloth_green'][i % 4]), u, 0.2, rand() * 6, 1);
    else if (kind === 'cloth') for (let q = 0; q < 2 + (i % 2); q++) put3(clothStack(['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_indigo'][(i + q) % 5], q), u, 0.2, 0, 1);
    else if (kind === 'food') { if (i === 0) put3(hearthKit('rubble'), u, 0.05, 0, 1.15); else if (i === 1) put3(tortillas(), u, 0.2, 0, 1); else put3(i % 2 ? ollaKit() : storeJarKit(), u, 0.1 + rand() * 0.15, rand() * 6, 0.85); }
    else if (kind === 'feathers') { if (i % 2 === 0) put3(featherJar(), u, 0.15, rand() * 6, 1); else put3(basketOf('cloth_white'), u, 0.2, rand() * 6, 0.9); }
    else if (kind === 'fibre') put3(clothStack('cloth_ochre', i % 2), u, 0.1, 0.3, 0.9);
    else put3(basketOf(['cloth_red', 'paint_cab_yellow', 'cloth_green', 'cloth_ochre', 'cloth_brown'][i % 5]), u, 0.2, rand() * 6, 1);     // produce: chilies, squash, maize, beans, nopal
  }
}
const basketOf = (goods) => carved(`mk-basket:${goods}`, (k) => {
  k.geo('wicker', lathe([[0.001, 0], [0.18, 0], [0.24, 0.15], [0.22, 0.17], [0.19, 0.15], [0.001, 0.06]], 10));
  k.geo(goods, lathe([[0.001, 0.1], [0.19, 0.12], [0.15, 0.2], [0.001, 0.26]], 8, (th) => 1 + 0.12 * Math.sin(th * 5)));
  for (let i = 0; i < 5; i++) { const a = i * 1.26; k.geo(goods, lathe([[0.001, 0], [0.04, 0.01], [0.03, 0.06], [0.001, 0.07]], 5).translate(Math.cos(a) * 0.1, 0.22 + (i % 2) * 0.02, Math.sin(a) * 0.1)); }
});
const clothStack = (c, q) => carved(`mk-cloth:${c}:${q}`, (k) => { for (let i = 0; i < 3 + q; i++) k.bx(i % 2 ? 'cloth_white' : c, -0.28, 0.28, i * 0.05, i * 0.05 + 0.048, -0.2 + (i % 2) * 0.02, 0.2); k.bx('cloth_red', -0.28, 0.28, 0.02, 0.028, -0.202, 0.202); });

const tortillas = () => carved('mk-tortillas', (k) => { for (let i = 0; i < 9; i++) k.geo('cloth_white', lathe([[0.001, i * 0.012], [0.11, i * 0.012], [0.11, i * 0.012 + 0.01], [0.001, i * 0.012 + 0.01]], 10).translate((i % 3) * 0.01, 0, 0)); k.geo('cloth_white', lathe([[0.001, 0.108], [0.2, 0.1], [0.2, 0.108], [0.001, 0.114]], 10).translate(0.0, 0, 0)); });
const featherJar = () => carved('mk-feathers', (k) => { k.geo('terracotta', lathe([[0.001, 0], [0.1, 0.01], [0.14, 0.14], [0.1, 0.3], [0.001, 0.3]], 10)); for (let i = 0; i < 9; i++) { const a = i * 0.7; k.seg(i % 3 ? 'stucco_leaf' : 'cloth_red', [Math.cos(a) * 0.04, 0.28, Math.sin(a) * 0.04], [Math.cos(a) * 0.14, 0.75 + (i % 3) * 0.08, Math.sin(a) * 0.14], 0.012, 0.004, 0.02, 0.004); } });
const KINDS = ['pots', 'produce', 'obsidian', 'baskets', 'cloth', 'bowls', 'produce', 'fibre', 'pots', 'produce', 'food', 'food', 'feathers', 'cloth', 'baskets'];

/**
 * tt_market: the Great Compound's market { rect, seed, hole: [x0, z0, x1, z1] (the central platform, kept clear) }:
 * a plastered plaza inside a wall with a gate in the middle of each side, crossed by two broad lanes, the stalls
 * in back-to-back rows between them.
 */
export function ttMarket(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, r = rng(el.seed || 1), L = STYLES.life.elements, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, gw = 4.5, T = 1.2, H = 3.0;
  // the plaza floor, patched
  bag.add('stucco_pale', frustum([x0, z0, x1, z1], -0.2, 0.04, 0, 0, 0, 0, { noBottom: true })); col.floor([x0, z0, x1, z1], 0.04);
  for (let i = 0; i < 40; i++) { const w = 3 + r() * 8, d = 3 + r() * 8, x = x0 + 2 + r() * (x1 - x0 - 4 - w), z = z0 + 2 + r() * (z1 - z0 - 4 - d); bag.add(r() < 0.5 ? 'plaster' : 'lime_plaster', frustum([x, z, x + w, z + d], 0.03, 0.05, 0, 0, 0, 0, { noBottom: true })); }
  // the wall, a gate in each side's middle: a plastered wall on a red foot, a red cornice, almenas
  const seg = (a, b, c, d) => { if (b - a < 0.1 || d - c < 0.1) return; bag.add(S, box(a, 0, c, b, H, d)); bag.add(RD, box(a - 0.05, 0, c - 0.05, b + 0.05, 0.7, d + 0.05)); bag.add(RD, box(a - 0.1, H - 0.4, c - 0.1, b + 0.1, H, d + 0.1)); col.rect([a, c, b, d], 0, H); };
  seg(x0 - T, cx - gw, z0 - T, z0); seg(cx + gw, x1 + T, z0 - T, z0); seg(x0 - T, cx - gw, z1, z1 + T); seg(cx + gw, x1 + T, z1, z1 + T);
  seg(x0 - T, x0, z0, cz - gw); seg(x0 - T, x0, cz + gw, z1); seg(x1, x1 + T, z0, cz - gw); seg(x1, x1 + T, cz + gw, z1);
  for (const [a, b, c, d, along] of [[x0 - T, x1 + T, z0 - T, z0, 1], [x0 - T, x1 + T, z1, z1 + T, 1], [x0 - T, x0, z0, z1, 0], [x1, x1 + T, z0, z1, 0]]) {
    const len = along ? b - a : d - c;
    for (let u = 1; u < len - 1; u += 1.8) { const p = (along ? a : c) + u, g = along ? Math.abs(p - cx) < gw + 0.6 : Math.abs(p - cz) < gw + 0.6; if (g) continue; bag.add(S, along ? box(p - 0.3, H, c + 0.4, p + 0.3, H + 0.7, d - 0.4) : box(a + 0.4, H, p - 0.3, b - 0.4, H + 0.7, p + 0.3)); }
  }
  // the stalls: in the four quadrants cut by the lanes through the gates, rows in pairs back to back, a lane between pairs
  const lane = 4.2, SW = 6.6, SD = 3.0, pitch = 2 * SD + 7.0, hole = el.hole ?? [cx - 15, cz - 15, cx + 15, cz + 15];
  const inHole = (x, z) => x > hole[0] - 2 && x < hole[2] + 2 && z > hole[1] - 2 && z < hole[3] + 2;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const qx0 = sx < 0 ? x0 + 4 : cx + lane, qx1 = sx < 0 ? cx - lane : x1 - 4, qz0 = sz < 0 ? z0 + 4 : cz + lane, qz1 = sz < 0 ? cz - lane : z1 - 4;
    const np = Math.max(1, Math.floor((qz1 - qz0 + 7.0) / pitch)), ns = Math.floor((qx1 - qx0) / SW);
    for (let p = 0; p < np; p++) for (let row = 0; row < 2; row++) for (let i = 0; i < ns; i++) {
      const x = qx0 + (i + 0.5) * (qx1 - qx0) / ns, z = qz0 + p * pitch + SD / 2 + row * SD, face = row ? 1 : -1;      // the front toward the lane: the north row faces north
      if (inHole(x, z) || r() < 0.3) continue;
      stall(ctx, x, z, face, KINDS[Math.floor(r() * KINDS.length)], r, SW - 0.6, SD, L);
    }
  }
  // people: bargainers and bearers in the lanes
  for (let i = 0; i < 46; i++) {
    const lx = r() < 0.5, u = lx ? x0 + 6 + r() * (x1 - x0 - 12) : z0 + 6 + r() * (z1 - z0 - 12), off = (r() - 0.5) * 5, [x, z] = lx ? [u, cz + off] : [cx + off, u];
    if (inHole(x, z)) continue;
    const man = r() < 0.55, car = ['basket', 'pot', 'none', 'bundle'][Math.floor(r() * 4)];
    if (i % 7 === 3) { fig(ctx, { who: 'child', at: [x, z], y: 0.04, rot: r() * 6.28, seed: Math.floor(r() * 1e9), pose: 'stand' }); continue; }
    if (i % 11 === 5) { L.chickens({ t: 'chickens', kind: 'turkey', n: 3, at: [x, z], y: 0.04, rot: r() * 6, seed: i }, ctx); continue; }
    if (i % 13 === 7) { L.animal({ t: 'animal', kind: 'dog', at: [x, z], y: 0.04, rot: r() * 6.28, seed: i, mat: 'hide_tan' }, ctx); continue; }
    L.figure(man ? { at: [x, z], y: 0.04, rot: r() * 6.28, seed: Math.floor(r() * 1e9), dress: 'tunic', legs: 'bare', over: r() < 0.5 ? 'cape' : 'none', cloth: ['cloth_white', 'cloth_ochre', 'cloth_brown'][Math.floor(r() * 3)], cloth2: 'cloth_white', skin: 'skin_medium', hair: 'long', hairMat: 'hide_black', feet: 'bare', carry: car, pose: r() < 0.4 ? 'talk' : 'stand' }
      : { at: [x, z], y: 0.04, rot: r() * 6.28, seed: Math.floor(r() * 1e9), dress: 'wrap', over: 'shawl', cloth: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][Math.floor(r() * 4)], cloth2: 'cloth_white', skin: 'skin_dark', hair: 'bun', hairMat: 'hide_black', feet: 'bare', carry: car, pose: 'stand' }, ctx);
  }
  // the gates: two watchers inside each, a pair of braziers at the lane's heads, a water-jar seller by the south gate
  for (const [gx, gz, fx, fz] of [[cx, z0, 0, 1], [cx, z1, 0, -1], [x0, cz, 1, 0], [x1, cz, -1, 0]]) {
    for (const sd of [-1, 1]) {
      const px = gx + fx * 2.2 + (fz ? sd * (gw + 0.2) : 0), pz = gz + fz * 2.2 + (fx ? sd * (gw + 0.2) : 0);
      fig(ctx, { who: 'man', at: [px, pz], y: 0.04, rot: Math.atan2(-fx, -fz), seed: Math.floor(r() * 1e9), pose: 'stand' });
      inst(bag, brazierK(), gx + fx * 5 + (fz ? sd * 3.4 : 0), 0.04, gz + fz * 5 + (fx ? sd * 3.4 : 0), 0, 1, 120);
    }
  }
  for (let i = 0; i < 30; i++) { const u = x0 + 5 + r() * (x1 - x0 - 10), v = cz + (r() - 0.5) * 6; if (!inHole(u, v)) inst(bag, huskK(), u, 0.045, v, r() * 6, 1, 45); }
  for (let i = 0; i < 30; i++) { const u = cx + (r() - 0.5) * 6, v = z0 + 5 + r() * (z1 - z0 - 10); if (!inHole(u, v)) inst(bag, huskK(), u, 0.045, v, r() * 6, 1, 45); }
}
const brazierK = () => carved('mk-brazier', (k) => { for (let i = 0; i < 3; i++) { const a = i * 2.094; k.seg('andesite', [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], [Math.cos(a) * 0.12, 0.42, Math.sin(a) * 0.12], 0.05, 0.05, 0.04, 0.04); } k.geo('andesite', lathe([[0.001, 0.4], [0.2, 0.42], [0.3, 0.6], [0.29, 0.66], [0.24, 0.62], [0.001, 0.5]], 14)); k.geo('plaster_grey', lathe([[0.001, 0.6], [0.24, 0.6], [0.001, 0.63]], 12)); });
const huskK = () => carved('mk-husk', (k) => { k.bx('cloth_ochre', -0.1, 0.1, 0, 0.008, -0.05, 0.05); });

/** (the gates' watchers and the market's lane litter are laid by ttMarket's tail; see below) */
/** One stall at (x, z), its front toward `face` (±1 along z): the mat, the goods, a reed-mat shade on four poles, the seller sitting behind. */
function stall(ctx, x, z, face, kind, r, W, D, L) {
  const { bag, col } = ctx, y = 0.04, hi = 2.3, lo = 1.9;
  const m = [x - W / 2, z - D / 2 + 0.2, x + W / 2, z + D / 2 - 0.2];
  bag.add('reed_mat', box(m[0], y, m[1], m[2], y + 0.025, m[3]));
  // goods in the front half, on the mat
  const put3 = (kit, u, v, yaw, s) => put(bag, kit, x + u, y + 0.025, z + face * (D * 0.5 - 0.55 - v * 1.3), yaw, s);
  wares(bag, kind, put3, r, W - 0.5);
  // the shade: two rows of poles, the mat roof sloping to the front
  for (const [px, pz, h] of [[m[0] + 0.05, z - face * (D / 2 - 0.15), hi], [m[2] - 0.05, z - face * (D / 2 - 0.15), hi], [m[0] + 0.05, z + face * (D / 2 - 0.1), lo], [m[2] - 0.05, z + face * (D / 2 - 0.1), lo]]) {
    bag.add('timber', box(px - 0.05, y, pz - 0.05, px + 0.05, h, pz + 0.05)); col.rect([px - 0.05, pz - 0.05, px + 0.05, pz + 0.05], y, h);
  }
  const zb = z - face * (D / 2 + 0.1), zf = z + face * (D / 2 + 0.25);
  const sheet = [[m[0] - 0.2, hi, zb], [m[2] + 0.2, hi, zb], [m[2] + 0.2, lo, zf], [m[0] - 0.2, lo, zf]];
  const t = [], P = sheet.map((p) => p), Q = P.map((p) => [p[0], p[1] + 0.07, p[2]]), tri = (a, b, c) => t.push(...a, ...b, ...c);
  tri(Q[0], Q[1], Q[2]); tri(Q[0], Q[2], Q[3]); tri(P[0], P[2], P[1]); tri(P[0], P[3], P[2]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri(P[i], P[j], Q[j]); tri(P[i], Q[j], Q[i]); }
  const g = trisToGeo(t); bag.add(r() < 0.3 ? ['cloth_ochre', 'cloth_red', 'cloth_white'][Math.floor(r() * 3)] : 'reed_mat', g);
  // strings of chilies and gourds hung from the shade's front edge
  if (r() < 0.5) for (let q = 0; q < 4; q++) { const hx = m[0] + 0.5 + q * (m[2] - m[0] - 1) / 3, hz = zf - face * 0.05; bag.add(q % 2 ? 'cloth_red' : 'paint_cab_yellow', box(hx - 0.04, lo - 0.55, hz - 0.03, hx + 0.04, lo - 0.05, hz + 0.03)); }
  // the seller sitting at the back of the mat
  if (r() < 0.88) {
    const woman = r() < 0.6, base = { at: [x + (r() - 0.5) * 1.6, z - face * (D / 2 - 0.5)], y: y + 0.025, rot: face > 0 ? Math.PI : 0, seed: Math.floor(r() * 1e9), pose: woman ? 'kneel' : 'squat', skin: 'skin_medium', hair: woman ? 'bun' : 'long', hairMat: 'hide_black', feet: 'bare', over: 'none' };
    L.figure(woman ? { ...base, dress: 'wrap', cloth: ['cloth_red', 'cloth_ochre', 'cloth_white'][Math.floor(r() * 3)], cloth2: 'cloth_white' } : { ...base, dress: 'tunic', legs: 'bare', cloth: 'cloth_white', cloth2: 'cloth_brown', pose: 'squat' }, ctx);
  }
}
import { fromTriangles, orientOutward } from '../../core/geom.js';
function trisToGeo(t) { return fromTriangles(orientOutward(t)); }
