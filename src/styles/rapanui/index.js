// Rapa Nui (about 1500; docs/settlements/rapa-nui.md §4): moai of Rano Raraku tuff — long heads
// with heavy brows, long noses and ears, hands on the belly — standing on ahu platforms of fitted
// basalt with a paved ramp before them, some crowned with red scoria pukao; moai half-cut in the
// quarry and standing buried to the shoulders on its slopes; boat-shaped thatched houses (hare
// paenga) on curbs of dressed basalt; stone chicken houses (hare moa); round garden walls (manavai).

import { Matrix4 } from '../../core/three.js';
import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const T = 'tuff_moai', B = 'basalt_ahu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const yawOf = (f) => typeof f === 'number' ? f : { n: 0, w: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 }[f] ?? 0;

/** The moai's parts in its own frame (facing −z, feet at y = 0, height h), as [material, geometry]. */
function moaiParts(h, pukao, simple) {
  const s = h / 7, out = [];
  const add = (m, g) => out.push([m, g]);
  // the torso, narrowing upward, its belly forward
  add(T, frustum([-1.15 * s, -0.75 * s, 1.15 * s, 0.75 * s], 0, 3.4 * s, 0.15 * s, 0.15 * s, 0.05 * s, 0.25 * s));
  // the neck and the head: a long block leaning a little back, the brow, the nose, the chin, the ears
  add(T, box(-0.75 * s, 3.4 * s, -0.55 * s, 0.75 * s, 3.9 * s, 0.6 * s));
  add(T, frustum([-0.85 * s, -0.75 * s, 0.85 * s, 0.7 * s], 3.9 * s, 6.85 * s, 0.05 * s, 0.05 * s, 0.1 * s, 0.25 * s));
  if (!simple) {
    add(T, box(-0.8 * s, 5.55 * s, -0.95 * s, 0.8 * s, 5.95 * s, -0.6 * s));                 // brow
    add(T, frustum([-0.2 * s, -1.05 * s, 0.2 * s, -0.7 * s], 4.6 * s, 5.6 * s, 0.05 * s, 0.05 * s, 0.3 * s, 0));   // nose
    add(T, box(-0.55 * s, 3.9 * s, -0.95 * s, 0.55 * s, 4.45 * s, -0.6 * s));                // chin and lips
    for (const k of [-1, 1]) add(T, box(k * 0.85 * s - 0.12 * s, 4.4 * s, -0.25 * s, k * 0.85 * s + 0.12 * s, 6.0 * s, 0.3 * s));   // ears
    for (const k of [-1, 1]) add('opening', box(k * 0.42 * s - 0.25 * s, 5.2 * s, -0.78 * s, k * 0.42 * s + 0.25 * s, 5.5 * s, -0.72 * s));   // the shadowed eye sockets
    for (const k of [-1, 1]) add(T, box(k * 0.55 * s - 0.4 * s, 1.5 * s, -0.83 * s, k * 0.55 * s + 0.4 * s, 1.7 * s, -0.7 * s));  // hands on the belly
  }
  if (pukao) add('scoria_red', lathe([[0.9 * s, 0], [1.0 * s, 0.6 * s], [0.95 * s, 1.1 * s], [0.55 * s, 1.25 * s], [0.001, 1.3 * s]], 12, null, 0, 6.8 * s, -0.05 * s));
  return out;
}
/** moai: { at, y, h, facing, pukao, lie (true: lying on its back, head toward `facing`), buried (depth) }. */
function moai(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 6, yaw = yawOf(el.facing ?? 'n');
  const m = new Matrix4();
  if (el.lie) m.makeRotationY(yaw).multiply(new Matrix4().makeRotationX(Math.PI / 2 - (el.tilt ?? 0)));
  else m.makeRotationY(yaw);
  m.setPosition(x, y - (el.buried ?? 0), z);
  for (const [mat, g] of moaiParts(h, el.pukao, el.simple)) { g.applyMatrix4(m); bag.add(mat, g); }
  const r = h / 7 * 1.2;
  if (el.lie) col.circle(x, z, r * 1.2, y - 1, y + r * 1.5);
  else col.circle(x, z, r, y - 1, y + h);
}

/** ahu: { rect, y, h, facing (the side the moai face; the ramp lies there), ramp (depth) } — a basalt platform. */
function ahu(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3, rp = el.ramp ?? 12, f = el.facing ?? 'n';
  bag.add(B, box(x0, y - 1, z0, x1, y + h, z1)); col.rect(el.rect, y - 1, y + h); col.floor(el.rect, y + h);
  bag.add(B, box(x0 - 0.2, y + h, z0 - 0.2, x1 + 0.2, y + h + 0.3, z1 + 0.2));
  // the paved ramp of rounded stones sloping down from the platform's front
  const n = 10;
  for (let i = 0; i < n; i++) {
    const hh = y + h * 0.6 * (1 - i / n), a = rp * i / n, b = rp * (i + 1) / n;
    const r = f === 'n' ? [x0 - 4, z0 - b, x1 + 4, z0 - a] : f === 's' ? [x0 - 4, z1 + a, x1 + 4, z1 + b] : f === 'w' ? [x0 - b, z0 - 4, x0 - a, z1 + 4] : [x1 + a, z0 - 4, x1 + b, z1 + 4];
    bag.add('pebbles', box(r[0], y - 0.5, r[1], r[2], hh, r[3])); col.floor(r, hh);
  }
}

/** hare_paenga: a boat-shaped house { c, len, w, yaw (radians: its long axis), seed }: a curb of dressed basalt, a thatched hull, a low door. */
function harePaenga(el, { bag, col }) {
  const [x, z] = el.c, L = el.len ?? 12, W = el.w ?? 2.6, H = el.h ?? 2.2, yaw = el.yaw ?? 0;
  const prof = []; for (let k = 0; k <= 8; k++) { const a = Math.PI / 2 * k / 8; prof.push([Math.max(0.001, Math.cos(a) * W / 2), Math.sin(a) * H]); }
  const hull = lathe(prof, 16, null, 0, 0, 0);
  hull.applyMatrix4(new Matrix4().makeScale(L / W, 1, 1)); hull.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, 0.25, z));
  bag.add('thatch', hull);
  const curb = lathe([[W / 2 + 0.35, 0], [W / 2 + 0.35, 0.3], [W / 2, 0.3]], 16, null, 0, 0, 0);
  curb.applyMatrix4(new Matrix4().makeScale((L + 0.7) / (W + 0.7), 1, 1)); curb.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, -0.05, z));
  bag.add(B, curb);
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  col.circle(x, z, W / 2, 0, H);
  for (const t of [-1, 1]) col.circle(x + ca * t * L * 0.3, z - sa * t * L * 0.3, W / 2, 0, H);
  // the forecourt of rounded stones before the door (on the side +perpendicular)
  const px = x - sa * (W / 2 + 1.2), pz = z - ca * (W / 2 + 1.2);
  bag.add('pebbles', box(px - 1.5, -0.2, pz - 1.5, px + 1.5, 0.08, pz + 1.5));
}
/** hare_moa: a chicken house { c, yaw }: a long cairn of stones. */
function hareMoa(el, { bag, col }) { const [x, z] = el.c; bag.add(B, frustum([x - 3, z - 1.2, x + 3, z + 1.2], -0.3, 1.8, 0.6, 0.6, 0.4, 0.4)); col.rect([x - 3, z - 1.2, x + 3, z + 1.2], 0, 1.8); }
/** manavai: a round garden wall { c, r }. */
function manavai(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 3;
  bag.add(B, lathe([[r + 0.6, 0], [r + 0.4, 1.3], [r, 1.3], [r, 0.001]], 14, null, x, -0.3, z));
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, b = (k + 1) / 10 * Math.PI * 2; col.segment([x + Math.cos(a) * (r + 0.3), z + Math.sin(a) * (r + 0.3)], [x + Math.cos(b) * (r + 0.3), z + Math.sin(b) * (r + 0.3)], 0.6, 0, 1.3); }
}

registerStyle('rapanui', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, moai, ahu, hare_paenga: harePaenga, hare_moa: hareMoa, manavai },
  objects: {},
});
