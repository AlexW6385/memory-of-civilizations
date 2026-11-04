// The Neolithic monuments of Salisbury Plain (about 2500 BC; docs/settlements/stonehenge.md §4):
// sarsen uprights and lintels, the trilithons, the bluestones; the round bank and ditch; square
// houses of timber and wattle with chalk floors and steep thatch (after Durrington Walls).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { Matrix4 } from 'three';
import '../qing/index.js';

const SAR = 'sandstone', BLUE = 'basalt';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A rough stone block, tapering a little, turned to face the centre. */
function stone(bag, col, x, z, a, w, d, h, y, mat, rand) {
  const g = frustum([-w / 2, -d / 2, w / 2, d / 2], -0.5, h, w * 0.08, w * 0.08, d * 0.05, d * 0.05);
  g.applyMatrix4(new Matrix4().makeRotationY(-a + (rand() - 0.5) * 0.06).setPosition(x, y, z));
  bag.add(mat, g); col.circle(x, z, Math.max(w, d) * 0.55, y, y + h);
}
function lintel(bag, x0, z0, x1, z1, y, mat) {
  const L = Math.hypot(x1 - x0, z1 - z0), g = box(-L / 2, 0, -0.55, L / 2, 0.8, 0.55);
  g.applyMatrix4(new Matrix4().makeRotationY(-Math.atan2(z1 - z0, x1 - x0)).setPosition((x0 + x1) / 2, y, (z0 + z1) / 2)); bag.add(mat, g);
}
/** henge: { c, y } — the sarsen circle and its lintels, the trilithon horseshoe, the bluestone circle and horseshoe, the altar, the slaughter and heel stones. */
function henge(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, rand = rng(2500), R = 16.5, H = 4.1;
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2, x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R;
    stone(bag, col, x, z, a, 2.1, 1.1, H, y, SAR, rand);
    const a1 = (i + 1) / 30 * Math.PI * 2;
    lintel(bag, x, z, cx + Math.cos(a1) * R, cz + Math.sin(a1) * R, y + H, SAR);
  }
  // the five trilithons, open toward the north-east (−z +x here: the axis runs to the sunrise)
  const axis = -Math.PI / 4;
  [[-2, 6.0], [-1, 6.6], [0, 7.3], [1, 6.6], [2, 6.0]].forEach(([k, h]) => {
    const a = axis + Math.PI + k * 0.55, r = 9 - Math.abs(k) * 0.6, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, t = a + Math.PI / 2;
    const p = [x + Math.cos(t) * 1.3, z + Math.sin(t) * 1.3], q = [x - Math.cos(t) * 1.3, z - Math.sin(t) * 1.3];
    stone(bag, col, p[0], p[1], a, 2.2, 1.2, h, y, SAR, rand); stone(bag, col, q[0], q[1], a, 2.2, 1.2, h, y, SAR, rand);
    lintel(bag, p[0], p[1], q[0], q[1], y + h, SAR);
  });
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; stone(bag, col, cx + Math.cos(a) * 12, cz + Math.sin(a) * 12, a, 0.7, 0.5, 2 + rand() * 0.5, y, BLUE, rand); }
  for (let k = -9; k <= 9; k++) { if (Math.abs(k) < 1) continue; const a = axis + Math.PI + k * 0.14, r = 6.2; stone(bag, col, cx + Math.cos(a) * r, cz + Math.sin(a) * r, a, 0.6, 0.5, 2.2 + Math.abs(k) * 0.05, y, BLUE, rand); }
  stone(bag, col, cx + Math.cos(axis + Math.PI) * 4, cz + Math.sin(axis + Math.PI) * 4, axis, 4.9, 1, 0.5, y, 'sandstone_red', rand);           // the altar stone, fallen flat
  stone(bag, col, cx + Math.cos(axis) * 32, cz + Math.sin(axis) * 32, axis, 2.4, 2, 4.7, y, SAR, rand);     // the slaughter stone (standing)
  stone(bag, col, cx + Math.cos(axis) * 78, cz + Math.sin(axis) * 78, axis, 2.6, 2.4, 4.7, y, SAR, rand);   // the heel stone
}
/** neolithic_house: { c, s, yaw, y } — a square house of wattle and daub on a chalk floor, a steep thatched roof. */
function house(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 5, y = el.y ?? 0, a = el.yaw ?? 0, h = 1.9;
  const m = new Matrix4().makeRotationY(a).setPosition(x, y, z);
  const wall = box(-s / 2, -0.2, -s / 2, s / 2, h, s / 2); wall.applyMatrix4(m); bag.add('mud_plaster', wall);
  const roof = frustum([-s / 2 - 0.6, -s / 2 - 0.6, s / 2 + 0.6, s / 2 + 0.6], h - 0.1, h + s * 0.85, s / 2 + 0.55, s / 2 + 0.55, s / 2 + 0.55, s / 2 + 0.55); roof.applyMatrix4(m); bag.add('thatch', roof);
  col.circle(x, z, s * 0.6, y, y + h);
}
registerStyle('neolithic', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, henge, neolithic_house: house },
  objects: {},
});
void lathe;
