// The wayside of Uji's crossings (docs/settlements/heian-uji.md §19): at the crossings of the roads a small shrine (hokora) on a stone footing, or a
// boulder wrapped in straw rope with strips of paper hung from it — the road gods (sae no kami, chimata no kami) of the boundaries and forks of the
// roads; the bridge's own, Hashihime at the san-no-ma, is on the bridge (§4). Elements `uji_hokora` and `uji_stone` of the japanese style, and the
// plan that sets them at the crossings. Pure data and builders, no shared file touched.

import '../../styles/japanese/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod, place } from '../../core/geom.js';
import { tiled } from './street.js';
import { STREETS, RADIUS, lots, inRect, height } from './layout.js';

function hash(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** The little shrine: a footing of stone, four posts, walls of boards and a front of red doors, a hipped roof of bark, a rope across the front with its paper strips. { at, y, rot (the front faces +z turned by rot) }. */
function hokora(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a);
  const W = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const boxAt = (m, u0, v0, u1, v1, y0, y1) => { const p = W(u0, v0), q = W(u1, v1); bag.add(m, box(Math.min(p[0], q[0]), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1, Math.max(p[1], q[1]))); };
  boxAt('limestone', -0.4, -0.4, 0.4, 0.4, -0.05, 0.22);
  for (const [u, v] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]]) boxAt('wood_dark', u - 0.035, v - 0.035, u + 0.035, v + 0.035, 0.22, 1.0);
  boxAt('timber', -0.27, -0.27, 0.27, -0.23, 0.26, 0.98); boxAt('timber', -0.27, -0.27, -0.23, 0.27, 0.26, 0.98); boxAt('timber', 0.23, -0.27, 0.27, 0.27, 0.26, 0.98);
  boxAt('lacquer_red', -0.23, 0.24, 0.0, 0.27, 0.3, 0.9); boxAt('lacquer_red', 0.0, 0.24, 0.23, 0.27, 0.3, 0.9);      // the two doors
  boxAt('wood_dark', -0.01, 0.235, 0.01, 0.275, 0.3, 0.9);
  boxAt('wood_dark', -0.3, 0.23, 0.3, 0.3, 0.9, 1.0);                                                                    // the lintel
  boxAt('wood_dark', -0.14, 0.4, 0.14, 0.62, 0.22, 0.26);                                                                // a step of plank
  const g = lathe([[0.64, 0], [0.5, 0.06], [0.0, 0.34], [0.0, 0.3], [0.45, 0.02]], 4, null, 0, 0, 0);
  bag.add('roof_bark', place(g, x, y + 1.0, z, a + Math.PI / 4, 1));
  const A = W(-0.3, 0.33), B = W(0.3, 0.33);
  bag.add('rope_fibre', rod([A[0], y + 0.88, A[1]], [B[0], y + 0.88, B[1]], 0.014, 4));
  for (const u of [-0.17, 0, 0.17]) { const p = W(u, 0.33); bag.add('cloth_white', box(p[0] - 0.02, y + 0.7, p[1] - 0.02, p[0] + 0.02, y + 0.87, p[1] + 0.02)); }
  col.rect(boxRect(W, -0.4, -0.4, 0.4, 0.4), y - 0.1, y + 1.4);
}
const boxRect = (W, u0, v0, u1, v1) => { const p = W(u0, v0), q = W(u1, v1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };

/** The boulder of the road god: a rounded stone on a low heap, a rope of rice straw round its waist with paper strips, a small offering of rice in a dish at its foot. { at, y, size } */
function stone(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, k = el.size ?? 1, r = hash(x, z, 4);
  bag.add('rock_boulder', lathe([[0.001, 0], [0.4 * k, 0.04 * k], [0.46 * k, 0.28 * k], [0.36 * k, 0.6 * k], [0.18 * k, 0.78 * k], [0.001, 0.84 * k]], 9, null, x, y, z));
  bag.add('rope_fibre', lathe([[0.425 * k, 0.3 * k], [0.47 * k, 0.3 * k], [0.47 * k, 0.37 * k], [0.425 * k, 0.37 * k]], 9, null, x, y, z));
  for (let i = 0; i < 4; i++) { const a = r * 6.28 + i * 1.57, px = x + Math.cos(a) * 0.47 * k, pz = z + Math.sin(a) * 0.47 * k; bag.add('cloth_white', box(px - 0.02, y + 0.14 * k, pz - 0.02, px + 0.02, y + 0.3 * k, pz + 0.02)); }
  bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0], [0.11, 0.04], [0.001, 0.04]], 8, null, x + 0.6 * k, y, z + 0.1));
  col.circle(x, z, 0.48 * k, y - 0.1, y + 0.9 * k);
}
STYLES.japanese.elements.uji_hokora = hokora;
STYLES.japanese.elements.uji_stone = stone;

/** The crossings of the roads where a wayside stands: a spot beside the crossing clear of every house, the lanes and the water. */
export function waysideSpots() {
  const out = [], H = STREETS.filter((s) => s.a[1] === s.b[1]), V = STREETS.filter((s) => s.a[0] === s.b[0]), all = lots();
  for (const h of H) for (const v of V) {
    const x = v.a[0], zc = h.a[1];
    if (x < Math.min(h.a[0], h.b[0]) || x > Math.max(h.a[0], h.b[0]) || zc < Math.min(v.a[1], v.b[1]) || zc > Math.max(v.a[1], v.b[1]) || Math.hypot(x, zc) > RADIUS - 70) continue;
    const off = Math.max(h.hw, v.hw) + 1.3;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const p = [x + sx * off, zc + sz * off];
      if (all.some((l) => inRect(l.rect, p[0], p[1], 1.6)) || Math.abs(height(p[0], p[1])) > 0.5) continue;
      out.push({ at: p, y: height(p[0], p[1]), c: [x, zc], seed: hash(p[0], p[1]) });
      break;
    }
  }
  return out;
}
/** The plans (one a tile): a hokora or a boulder at each crossing (by the spot's own hash), the shrine facing the crossing's middle. */
export function waysidePlan() {
  const E = [];
  for (const s of waysideSpots()) {
    if (s.seed < 0.5) E.push({ t: 'uji_hokora', at: s.at, y: s.y, rot: Math.atan2(s.c[0] - s.at[0], s.c[1] - s.at[1]) });
    else E.push({ t: 'uji_stone', at: s.at, y: s.y, size: 0.9 + 0.3 * hash(s.at[0], s.at[1], 2) });
  }
  return tiled('heian-uji-waysides', 'japanese', E, 230);
}
