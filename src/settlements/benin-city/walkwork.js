// Benin City about 1600 — what stands along the visitor's walk besides the compounds (docs/settlements/benin-city.md §15): the wayside shrine at the crossing of the
// great street and the cross street and the water jars on forked stands at the lane mouths. Registered into the style from here (the style's files stay as they were);
// each is a function of its own place, built of materials the street tiles already hold (no new draw).
import '../../styles/benin/index.js';
import '../../objects/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../styles/benin/kit.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * benin_shrine: { at: [x, z], y } — a wayside shrine at a crossing [inferred: Esu, the god of crossroads, is honoured at Edo crossings; no source fetched]: a low round
 * mound of red earth ringed with chalk, five iron staves of different heights with leaf-shaped heads, a black pot of offerings and a calabash, a few cowries (white) round the foot.
 */
function shrine({ at, y = 0, simple }, { bag, col }) {
  const [x, z] = at, q = hashAt(x, z, 3);
  bag.add('tuff_red', lathe([[0.001, 0], [0.78, 0], [0.74, 0.16], [0.52, 0.32], [0.001, 0.36]], 12, null, x, y, z));
  col.circle(x, z, 0.8, y, y + 0.4);
  if (simple) return;
  bag.add('chalk', lathe([[0.82, 0], [0.86, 0.02], [0.86, 0.05], [0.82, 0.05]], 14, null, x, y, z));
  for (let i = 0; i < 5; i++) {
    const a = i * 1.257 + q * 2, r = 0.2 + 0.1 * ((i * 3) % 2), h = 1.0 + 0.2 * ((i * 7) % 4) + 0.15 * q, sx = x + Math.cos(a) * r, sz = z + Math.sin(a) * r;
    const hv = hashAt(sx, sz, 8);
    bag.add('iron', rod([sx, y + 0.3, sz], [sx, y + 0.3 + h, sz], 0.014 + 0.005 * hv, 5));
    bag.add('iron', lathe([[0.001, 0], [0.05 + 0.025 * hv, 0.1], [0.04 + 0.015 * hv, 0.2 + 0.04 * hv], [0.001, 0.28 + 0.06 * hv]], 6, null, sx, y + 0.3 + h, sz));
  }
  bag.add('pottery_dark', lathe([[0.001, 0], [0.13, 0.02], [0.2, 0.14], [0.14, 0.26], [0.16, 0.3], [0.1, 0.3], [0.001, 0.26]], 8, null, x + 0.55 * Math.cos(q * 6), y + 0.04, z + 0.55 * Math.sin(q * 6)));
  bag.add('wicker', lathe([[0.001, 0], [0.1, 0.03], [0.14, 0.11], [0.09, 0.17], [0.001, 0.15]], 7, null, x - 0.5 * Math.sin(q * 6), y + 0.2, z + 0.5 * Math.cos(q * 6)));
  for (let k = 0; k < 6; k++) { const a = k * 1.05 + q * 4, cx = x + Math.cos(a) * 0.93, cz = z + Math.sin(a) * 0.93, cv = hashAt(cx, cz, 9); bag.add('ivory', lathe([[0.001, 0], [0.036 + 0.01 * cv, 0.01], [0.03 + 0.012 * cv, 0.035], [0.001, 0.04 + 0.01 * cv]], 5, null, cx, y, cz)); }
}

/**
 * benin_waypot: { at: [x, z], y } — the water jar of the lane's mouth, set for any passer-by [inferred: no source; the houses have wells (Dapper), the jar at the
 * lane is the visitor's drink]: a great terracotta jar on a ring of clay between three posts that carry a crossbar, a calabash dipper hung from it, a cloth lid.
 */
function waypot({ at, y = 0, simple }, { bag, col }) {
  const [x, z] = at, q = hashAt(x, z, 5), s = 0.92 + 0.16 * q;
  bag.add('plaster_damp', lathe([[0.5, 0.012], [1.0 * s, 0.012], [1.0 * s, 0.016], [0.5, 0.016]], 12, null, x, y, z));      // the ground dark with splashed water
  bag.add('terracotta', lathe([[0.001, 0.12], [0.2 * s, 0.14], [0.36 * s, 0.4], [0.4 * s, 0.62], [0.3 * s, 0.9], [0.2 * s, 0.98], [0.24 * s, 1.04], [0.21 * s, 1.06], [0.15 * s, 1.0]], 10, null, x, y, z));
  bag.add('tuff_red', lathe([[0.001, 0], [0.5, 0], [0.46, 0.14], [0.3, 0.16], [0.001, 0.16]], 10, null, x, y, z));
  col.circle(x, z, 0.52, y, y + 1.1);
  if (simple) return;
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + q * 3, px = x + Math.cos(a) * 0.68, pz = z + Math.sin(a) * 0.68; bag.add('palm_trunk', rod([px, y, pz], [px, y + 1.7, pz], 0.045, 5)); }
  const a0 = q * 3, b0 = a0 + 2.094; bag.add('timber', rod([x + Math.cos(a0) * 0.68, y + 1.64, z + Math.sin(a0) * 0.68], [x + Math.cos(b0) * 0.68, y + 1.64, z + Math.sin(b0) * 0.68], 0.03 + 0.01 * q, 5));
  const hx = (Math.cos(a0) + Math.cos(b0)) * 0.34, hz = (Math.sin(a0) + Math.sin(b0)) * 0.34;
  bag.add('rope_fibre', rod([x + hx, y + 1.62, z + hz], [x + hx, y + 1.3, z + hz], 0.01, 4));
  bag.add('wicker', lathe([[0.001, 0], [0.09, 0.03], [0.12, 0.1], [0.07, 0.15], [0.001, 0.13]], 7, null, x + hx, y + 1.18, z + hz));
  bag.add('cloth_white', lathe([[0.001, 1.07], [0.22 * s, 1.07], [0.26 * s, 1.03], [0.2 * s, 1.0]], 9, null, x, y, z));
}

/** bn_keepers { list: [figure parameters] }: the sellers of the market's stalls, built into the near plan of the stalls they stand behind (a life element's figures reach 170 m wherever they stand). */
function keepers(el, ctx) {
  const fig = STYLES.life?.elements?.figure;
  if (!fig || el.simple) return;
  for (const f of el.list) fig({ ...f }, { bag: ctx.bag, col: ctx.col });
}

let done = false;
export function registerWalkwork() {
  if (done) return; done = true;
  STYLES.benin.elements.benin_shrine = shrine;
  STYLES.benin.elements.benin_waypot = waypot;
  STYLES.benin.elements.bn_keepers = keepers;
  void box;
}
registerWalkwork();
