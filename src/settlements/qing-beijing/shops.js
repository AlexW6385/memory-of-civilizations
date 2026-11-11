// Ming–Qing Beijing — the shop street (docs/settlements/qing-beijing.md §16): booths and open shop
// fronts along both edges of the avenue south of the moat, each of a trade with its goods and its
// hanging sign (huangzi: shapes and colours that spoke for the trades when most could not read).
// Pure data (SHOP_SITES, from layout.js) and one builder, `bj_booth`, an element of the street life
// (registered by style.js). Local frame of a booth: x along the avenue's edge, z out into the street, y up.

import { AVENUE, TEMPLE, lanes, interiorShops } from './layout.js';
import { box, lathe } from '../../core/geom.js';
import { Parts, T, ball, limb } from '../../styles/qing/carving.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const TRADES = ['tea', 'wine', 'cloth', 'medicine', 'pawn', 'grain', 'fruit', 'chestnut', 'books', 'pottery'];
/**
 * The booths: { at: [x, z] (the booth's back middle), rot (facing out into the street), trade, seed, w }.
 * They stand only where the street has room and where no shop front stands: along an edge of the avenue
 * that has no shop strip behind it (the shop street's fronts carry their own trade signs, goods and
 * awnings: a booth before them would double the shop), clear of the lanes' mouths and the path to the temple's gate.
 */
export const SHOP_SITES = (() => {
  const out = [], rand = rng(1644), [ax0, az0, ax1, az1] = AVENUE;
  let k = 0;
  const [tcx, tcz] = TEMPLE.c;
  for (let z = az0 + 16; z < az1 - 14; z += 9 + rand() * 2.5) for (const s of [-1, 1]) {
    // (the west edge faces east: out = +x; rot turns local +z into the world)
    const x = s < 0 ? ax0 + 0.3 : ax1 - 0.3;
    const zz = z + (s > 0 ? 4 : 0), w = 4.2 + rand() * 1.4, trade = TRADES[(k++ + (s > 0 ? 3 : 0)) % TRADES.length], seed = 100 + k * 17;
    const edge = s < 0 ? ax0 : ax1;
    // stalls also stand before the shop fronts (Qianmen's street market), but not before a door that opens (the tea house, the pharmacy)
    // the shop fronts have their own goods now (shopfront.js, streetlife.js): booths only where no shop stands
    if ((s < 0 && zz + w / 2 > 211) || (s > 0 && zz + w / 2 > 355)) continue;
    if (s < 0 && interiorShops().some((p) => zz + w / 2 + 1.2 > p.z0 && zz - w / 2 - 1.2 < p.z1)) continue;
    // not over a lane's mouth (a hutong meets the avenue every 29 m), nor on the path to the temple
    if (lanes().some((l) => l[2] - l[0] > 40 && zz + w / 2 + 0.6 > l[1] && zz - w / 2 - 0.6 < l[3] && l[0] <= edge + 1 && l[2] >= edge - 1)) continue;
    if (s > 0 && Math.abs(zz - tcz) < 3 + w / 2 + 1) continue;
    out.push({ at: [x, zz], rot: s < 0 ? Math.PI / 2 : -Math.PI / 2, trade, seed, w });
  }
  return out;
})();

const SIGN = {
  tea: ['cloth_ochre', 'kettle'], wine: ['cloth_red', 'flag'], cloth: ['cloth_indigo', 'streamers'], medicine: ['cloth_white', 'gourd'], pawn: ['lacquer_black', 'disc'],
  grain: ['cloth_ochre', 'dou'], fruit: ['cloth_green', 'flag'], chestnut: ['cloth_brown', 'flag'], books: ['cloth_indigo', 'flag'], pottery: ['cloth_ochre', 'flag'],
};

export function goods(P, trade, w, rand) {
  const x0 = -w / 2 + 0.5, n = Math.floor((w - 1) / 0.75);
  const top = 0.92;
  switch (trade) {
    case 'tea': for (let i = 0; i < 3; i++) P.add('glaze_white', lathe([[0.001, 0], [0.08, 0], [0.12, 0.1], [0.1, 0.22], [0.05, 0.27], [0.06, 0.3], [0.001, 0.3]], 10, null, x0 + i * 0.7, top, 0.0)); P.add('pottery_dark', lathe([[0.18, 0], [0.2, 0.16], [0.14, 0.3], [0.001, 0.3]], 12, null, w / 2 - 0.7, top, 0.1)); break;
    case 'wine': for (let i = 0; i < n; i++) P.add('pottery_dark', lathe([[0.001, 0], [0.16, 0.03], [0.22, 0.3], [0.17, 0.52], [0.11, 0.6], [0.001, 0.6]], 10, null, x0 + i * 0.7, 0, 0.55)); for (let i = 0; i < 3; i++) P.add('cloth_red', lathe([[0.12, 0], [0.12, 0.05], [0.001, 0.05]], 8, null, x0 + i * 0.7 + 0.35, top, 0)); break;
    case 'cloth': for (let i = 0; i < 4; i++) P.add(['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 5)], box(x0 + i * 0.72 - 0.3, top, -0.2, x0 + i * 0.72 + 0.3, top + 0.12 + (i % 3) * 0.1, 0.2)); break;
    case 'medicine': for (let i = 0; i < n; i++) P.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.14], [0.06, 0.2], [0.001, 0.2]], 8, null, x0 + i * 0.5, top, (i % 2) * 0.12 - 0.05)); P.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.12], [0.001, 0.12]], 10, null, w / 2 - 0.6, top, 0.1)); break;
    case 'pawn': P.add('wood_dark', box(-w / 2 + 0.3, 0.92, -0.25, w / 2 - 0.3, 1.5, -0.2)); for (let i = 0; i < 4; i++) P.add('lattice', box(-w / 2 + 0.3 + i * (w - 0.6) / 4, 1.5, -0.24, -w / 2 + 0.3 + (i + 1) * (w - 0.6) / 4 - 0.05, 2.3, -0.21)); break;
    case 'grain': for (let i = 0; i < 3; i++) P.add('sacking', ball(0.26, 0.3, 0.22, 8, 5).translate(x0 + i * 0.8, 0.3, 0.45)); P.add('wood_dark', box(w / 2 - 1.0, 0, 0.3, w / 2 - 0.5, 0.55, 0.8)); P.add('wicker', lathe([[0.3, 0], [0.36, 0.2], [0.001, 0.2]], 12, null, 0.0, top, 0.0)); break;
    case 'fruit': for (let i = 0; i < 4; i++) { const c = i % 2 ? 'cloth_red' : 'cloth_ochre'; P.add('wicker', lathe([[0.2, 0], [0.26, 0.12], [0.001, 0.12]], 10, null, x0 + i * 0.72, top, 0.0)); for (let j = 0; j < 7; j++) P.add(c, ball(0.045, 0.045, 0.045, 6, 4).translate(x0 + i * 0.72 + Math.cos(j * 2.4) * 0.12 * (j % 3) / 2, top + 0.13, Math.sin(j * 2.4) * 0.12 * (j % 3) / 2)); } break;
    case 'chestnut': P.add('iron', lathe([[0.001, 0], [0.34, 0.0], [0.4, 0.18], [0.001, 0.18]], 14, null, 0.0, top, 0.0)); P.add('brick_grey', box(-0.4, 0, -0.4, 0.4, top, 0.4)); for (let j = 0; j < 12; j++) P.add('hide_brown', ball(0.03, 0.025, 0.03, 5, 3).translate(Math.cos(j) * 0.2 * (j % 3) / 2, top + 0.16, Math.sin(j) * 0.2 * (j % 3) / 2)); break;
    case 'books': for (let i = 0; i < 5; i++) P.add(['cloth_white', 'cloth_indigo', 'cloth_brown'][i % 3], box(x0 + i * 0.55 - 0.2, top, -0.15, x0 + i * 0.55 + 0.2, top + 0.1 + (i % 2) * 0.06, 0.15)); break;
    case 'pottery': for (let i = 0; i < n; i++) P.add(i % 2 ? 'glaze_blue' : 'pottery_dark', lathe([[0.001, 0], [0.1, 0.01], [0.15, 0.14], [0.09, 0.26], [0.07, 0.3], [0.001, 0.3]], 10, null, x0 + i * 0.55, i % 2 ? top : 0, 0.5 - (i % 2) * 0.5)); break;
    default: break;
  }
}

/**
 * bj_booth: { at, y, rot, trade, seed, w }: four poles, a roof of reed matting sloping toward the street,
 * the counter, the goods of the trade, the hanging sign on a pole at the front corner.
 */
export function bjBooth(el, { bag, col }) {
  const rand = rng(el.seed || 1), w = el.w ?? 4.6, d = 2.2, P = new Parts(), [m, kind] = SIGN[el.trade] ?? SIGN.tea;
  const hy = 2.7;
  for (const sx of [-1, 1]) {
    P.add('timber', limb([sx * (w / 2 - 0.08), 0, 0.1], [sx * (w / 2 - 0.08), hy + 0.25, 0.1], 0.05, 0.045, 6));
    P.add('timber', limb([sx * (w / 2 - 0.08), 0, d - 0.1], [sx * (w / 2 - 0.08), hy - 0.15, d - 0.1], 0.05, 0.045, 6));
  }
  // roof: matting on poles, high at the back
  const t = [], y0 = hy + 0.25, y1 = hy - 0.15;
  const A = [-w / 2 - 0.2, y0, -0.1], B = [w / 2 + 0.2, y0, -0.1], C = [w / 2 + 0.2, y1, d + 0.3], D = [-w / 2 - 0.2, y1, d + 0.3];
  t.push(...A, ...C, ...B, ...A, ...D, ...C);
  const lo = (v) => [v[0], v[1] - 0.03, v[2]];
  t.push(...lo(A), ...lo(B), ...lo(C), ...lo(A), ...lo(C), ...lo(D));
  P.add('reed_mat', { toTris: t });
  // counter, back table
  P.add('wood_dark', box(-w / 2 + 0.1, 0.84, 0.0, w / 2 - 0.1, 0.9, d * 0.5));
  for (const sx of [-1, 1]) P.add('wood_dark', box(sx * (w / 2 - 0.2) - 0.04, 0, 0.05, sx * (w / 2 - 0.2) + 0.04, 0.84, d * 0.5 - 0.05));
  P.add('wood_dark', box(-w / 2 + 0.1, 0.0, d * 0.5 - 0.1, w / 2 - 0.1, 0.5, d * 0.5));
  goods(P, el.trade, w, rand);
  // the sign: a pole at the front corner, an arm, the huangzi hung from it
  const sx = rand() < 0.5 ? -1 : 1, px = sx * (w / 2 + 0.05), pz = d + 0.35;
  P.add('timber', limb([px, 0, pz], [px, 3.9, pz], 0.045, 0.035, 6));
  P.add('timber', limb([px, 3.7, pz], [px - sx * 0.5, 3.7, pz], 0.03, 0.03, 5));
  const hx = px - sx * 0.5;
  if (kind === 'flag') P.add(m, box(hx - 0.02, 1.6, pz - 0.2, hx + 0.02, 3.62, pz + 0.2));
  else if (kind === 'streamers') for (let i = 0; i < 5; i++) P.add(['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green'][i], box(hx - 0.02 + (i - 2) * 0.01, 2.2 - (i % 2) * 0.3, pz - 0.3 + i * 0.12, hx + 0.02 + (i - 2) * 0.01, 3.6, pz - 0.2 + i * 0.12));
  else if (kind === 'gourd') { P.add('lacquer_red', ball(0.12, 0.14, 0.12, 8, 6).translate(hx, 3.3, pz)); P.add('lacquer_red', ball(0.17, 0.2, 0.17, 8, 6).translate(hx, 2.95, pz)); P.add('cloth_red', box(hx - 0.01, 2.2, pz - 0.01, hx + 0.01, 2.78, pz + 0.01)); }
  else if (kind === 'disc') { P.add('lacquer_black', lathe([[0.001, -0.03], [0.5, -0.03], [0.5, 0.03], [0.001, 0.03]], 20).rotateX(Math.PI / 2).translate(hx, 2.8, pz)); P.add('paint_white', lathe([[0.001, 0.031], [0.34, 0.031], [0.34, 0.036], [0.001, 0.036]], 20).rotateX(Math.PI / 2).translate(hx, 2.8, pz)); }
  else if (kind === 'dou') { P.add('wood_dark', box(hx - 0.2, 3.0, pz - 0.2, hx + 0.2, 3.35, pz + 0.2)); P.add('cloth_red', box(hx - 0.21, 3.15, pz - 0.21, hx + 0.21, 3.2, pz + 0.21)); }
  else if (kind === 'kettle') { P.add('bronze', ball(0.2, 0.18, 0.2, 10, 6).translate(hx, 3.2, pz)); P.add('bronze', limb([hx + 0.15, 3.2, pz], [hx + 0.34, 3.3, pz], 0.025, 0.02, 5)); }
  const yaw = el.rot;
  // (a Parts holds geometries; toTris entries are made into geometry here)
  const fix = new Parts();
  for (const [mat, list] of P.m) for (const g of list) fix.add(mat, g.toTris ? trisGeo(g.toTris) : g);
  fix.emit(bag, el.at[0], el.y ?? 0, el.at[1], yaw);
  const c = Math.cos(yaw), s = Math.sin(yaw), wx = (lx, lz) => [el.at[0] + lx * c + lz * s, el.at[1] - lx * s + lz * c];
  const [cx, cz] = wx(0, d * 0.25);
  col?.circle?.(cx, cz, w * 0.42, el.y ?? 0, (el.y ?? 0) + 1);
}
import { fromTriangles } from '../../core/geom.js';
const trisGeo = (t) => fromTriangles(t);
void T;
