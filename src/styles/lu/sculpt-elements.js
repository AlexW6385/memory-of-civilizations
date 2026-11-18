// The sculpture elements of the Dacheng Hall (docs/settlements/lu-qufu.md §13): registered in the 'lu' style by index.js.
import { placeColumn } from './colwork.js';

/** lu_dragon_column: { at: [x, z], y, h, level: 'R' | 'F' } — one dragon column; level 'F' is the fine layer drawn over 'R' near. */
export function dragonColumnEl(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 2.1, h = el.h ?? 8.0, level = el.level ?? 'R';
  placeColumn(bag, x, z, y, h, level);
  if (el.solid) col.circle(x, z, 0.52, y, y + h);
}

import { Matrix4, Vector3 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { merge } from '../qing/carving.js';
import { rampParts } from '../../settlements/qing-beijing/ramp.js';

const reliefCache = new Map();
/** The relief of a carved imperial way (yulu) in its own frame (x across, y up the slope, z out of the stone), built once per size and level. */
function ramp(W, S, fine) {
  const key = `${W.toFixed(2)}x${S.toFixed(2)}${fine ? 'f' : ''}`;
  if (!reliefCache.has(key)) reliefCache.set(key, rampParts(W, S, fine));
  return reliefCache.get(key);
}
function rampRelief(bag, el, fine) {
  const [x0, z0, x1, z1] = el.rect, dir = el.dir, alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, rise = el.y1 - el.y0, S = Math.hypot(len, rise), W = alongZ ? x1 - x0 : z1 - z0;
  const P = ramp(W, S, fine), qc = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
  const [fx, fz] = dir === 'n' ? [qc, z1] : dir === 's' ? [qc, z0] : dir === 'e' ? [x0, qc] : [x1, qc];
  const h = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir], c = len / S, sn = rise / S;
  const Y = new Vector3(h[0] * c, sn, h[1] * c), Z = new Vector3(-h[0] * sn, c, -h[1] * sn), X = new Vector3().crossVectors(Y, Z);
  const M4 = new Matrix4().makeBasis(X, Y, Z).setPosition(fx, el.y0, fz);
  for (const [mat, list] of P.m) bag.add(mat, merge(list).applyMatrix4(M4));
}
/** lu_ramp: the imperial way, a marble slab with a modelled relief of two... one dragon among clouds over waves and mountains (the Beijing kit, ramp.js). */
export function luRamp(el, ctx) {
  STYLES.qing.elements.stairs({ ...el, carve: false }, ctx);
  rampRelief(ctx.bag, el, false);
}
/** lu_ramp_fine: the fine layer of the relief (scales, the finer teeth) over lu_ramp, drawn near. */
export function luRampFine(el, ctx) { rampRelief(ctx.bag, el, true); }

import { confucius, correlate } from './statue.js';
/** lu_statue: { at: [x, z], y, kind: 'confucius' | 'correlate', robe, seed, s, yaw, level } — a seated sage at the place given (the fine layer: level 'F'). */
export function luStatue(el, { bag }) {
  const [x, z] = el.at, P = el.kind === 'correlate' ? correlate(el.robe ?? 'clay_robe', el.seed ?? 0, el.level ?? 'R') : confucius(el.level ?? 'R');
  P.emit(bag, x, el.y ?? 0, z, el.yaw ?? 0, el.s ?? 1);
}

import { Parts } from '../qing/carving.js';
import { burner, lionPair } from './beasts.js';
/** lu_burner: { at: [x, z], y, s, level } — a bronze tripod censer on its stone base, facing the court. */
export function luBurner(el, { bag, col }) {
  const [x, z] = el.at, s = el.s ?? 1, P = new Parts();
  burner(P, el.level ?? 'R', Math.round(x * 3 + z));
  P.emit(bag, x, el.y ?? 0, z, 0, s);
  if (!el.level || el.level === 'R') col?.rect([x - 0.9 * s, z - 0.9 * s, x + 0.9 * s, z + 0.9 * s], el.y ?? 0, (el.y ?? 0) + 3.3 * s);
}
/** lu_lion: { at: [x, z], y, s, ball (male with the ball; else the female with her cub), face: [fx, fz], level } — a stone lion on its sumeru seat. */
export function luLion(el, { bag, col }) {
  const [x, z] = el.at, s = el.s ?? 1, f = el.face ?? [0, 1], P = new Parts();
  lionPair(P, el.level ?? 'R', !!el.ball);
  P.emit(bag, x, el.y ?? 0, z, Math.atan2(f[0], f[1]), s);
  if (!el.level || el.level === 'R') col?.rect([x - 1.1 * s, z - 1.5 * s, x + 1.1 * s, z + 1.5 * s], el.y ?? 0, (el.y ?? 0) + 3.2 * s);
}
/** lu_block: a collider only { rect, y0, y1 } (what a near plan's sculpture stands in, which the main plan must keep solid). */
export function luBlock(el, { col }) { col.rect(el.rect, el.y0, el.y1); }

import { biXiParts } from './bixi.js';
/** lu_bixi: { at: [x, z], y, s, yaw, level } — the tortoise-borne stele; level 'F' the fine layer over the pavilion's 'R'. */
export function luBixi(el, { bag }) { const [x, z] = el.at; biXiParts(el.level ?? 'R', Math.round(x * 7 + z)).emit(bag, x, el.y ?? 0, z, el.yaw ?? 0, el.s ?? 1); }
