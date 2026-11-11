// The small bridges, wells and the squero of Venice about 1500 (docs/settlements/venice.md §5, §6).
//
// ponte: a single stone arch over a canal, no parapet (Venetian bridges had none until the 18th century), steps of Istrian
//   stone up and down, the arch of brick under a ring of stone. { c, ax ('x' | 'z'), f: [a, b] (to the quay faces), w, y, sea }.
// pozzo: a vera da pozzo — the wellhead of Istrian stone on a stepped base, the drains of the cistern round it.
// squero: a boatyard — the tezon (an open timber shed) with a gondola on the stocks, the slipway, planks and ribs.

import { box, lathe, rod, fromTriangles, orientOutward, frustum } from '../../core/geom.js';
import { gondola } from './boats.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** A convex prism along u: the bottom from yb0 to yb1, the top from yt0 to yt1, across v0…v1. */
function prism(u0, u1, yb0, yb1, yt0, yt1, v0, v1) {
  const P = [[u0, yb0, v0], [u1, yb1, v0], [u1, yb1, v1], [u0, yb0, v1], [u0, yt0, v0], [u1, yt1, v0], [u1, yt1, v1], [u0, yt0, v1]], t = [];
  for (const [a, b, c, d] of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]) t.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
  return fromTriangles(orientOutward(t));
}

export function ponte(el, { bag, col }) {
  const [cx, cz] = el.c, ax = el.ax ?? 'z', [fa, fb] = el.f ?? [4.4, 4.4], W = el.w ?? 4.4, y = el.y ?? 0, rise = 1.9, ext = 3.6, step = 0.173, tread = 0.4;
  // u runs along the way across from the quay face a to face b, centred on c (u = 0 at c)
  const ua = -fa, ub = fb, crown = (ua + ub) / 2, half = (ub - ua) / 2;
  const deckAt = (u) => { const d = Math.abs(u - crown); const flat = 0.4; return d <= flat ? rise : Math.max(0, rise - Math.ceil((d - flat) / tread) * step); };
  const R = (half * half + 1.75 * 1.75) / (2 * 1.75);
  const soffit = (u) => { const d = Math.abs(u - crown); return d >= half ? y - 0.4 : y + 1.4 - (R - Math.sqrt(R * R - d * d)) + 0; };
  // build directly in the world frame with u along the axis
  const mk = (m, u0, u1, yb0, yb1, yt0, yt1, v0, v1) => {
    const g = prism(u0, u1, yb0, yb1, yt0, yt1, v0, v1);                       // x = u, z = v
    if (ax === 'z') { g.rotateY(-Math.PI / 2); }                               // x → +z (rotateY(−90°): (1,0,0) → (0,0,1)), z → +x
    g.translate(cx, 0, cz); bag.add(m, g);
  };
  const uMin = ua - ext, uMax = ub + ext;
  // the body, in slices as wide as a tread
  const edges = [];
  for (let u = uMin; u < uMax - 1e-6; u += tread) edges.push(u);
  edges.push(uMax);
  for (let i = 0; i + 1 < edges.length; i++) {
    const u0 = edges[i], u1 = edges[i + 1], um = (u0 + u1) / 2, yt = y + deckAt(um) - 0.0, sb0 = soffit(u0), sb1 = soffit(u1);
    if (yt - Math.max(sb0, sb1) < 0.05) continue;
    mk('brick', u0, u1, sb0, sb1, yt - 0.1, yt - 0.1, -W / 2, W / 2);
    mk('limestone', u0, u1, yt - 0.1, yt - 0.1, yt, yt, -W / 2 - 0.05, W / 2 + 0.05);       // the stone tread, a hair wider than the body
  }
  // the ring of the arch in white stone on both faces
  for (const s of [-1, 1]) for (let u = ua; u < ub - 1e-6; u += 0.5) {
    const u1 = Math.min(ub, u + 0.5), s0 = soffit(u), s1 = soffit(u1);
    mk('limestone', u, u1, s0 - 0.22, s1 - 0.22, s0, s1, s < 0 ? -W / 2 - 0.08 : W / 2 - 0.04, s < 0 ? -W / 2 + 0.04 : W / 2 + 0.08);
  }
  // the soffit's underside needs no more; collision: the steps as two ramps and the crown's floor
  const g0 = (u) => (ax === 'z' ? [cx - W / 2, cz + u] : [cx + u, cz - W / 2]);
  const rect = (u0, u1) => { const a = g0(u0), b = ax === 'z' ? [cx + W / 2, cz + u1] : [cx + u1, cz + W / 2]; return [a[0], a[1], b[0], b[1]]; };
  const uc0 = crown - 0.4, uc1 = crown + 0.4, dirFor = (up) => (ax === 'z' ? (up > 0 ? 's' : 'n') : (up > 0 ? 'e' : 'w'));
  col.floor(rect(uc0, uc1), y + rise);
  col.ramp(rect(uMin, uc0), y + deckAt(uMin) - 0.0, y + rise, dirFor(1));
  col.ramp(rect(uc1, uMax), y + deckAt(uMax), y + rise, dirFor(-1));
}

/** pozzo: { at: [x, z], y } — the wellhead and its drains. */
export function pozzo(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('limestone', lathe([[1.0, 0], [1.0, 0.1], [0.82, 0.1], [0.82, 0.2], [0.001, 0.2]], 12, null, x, y, z));            // the stepped base
  bag.add('limestone', lathe([[0.55, 0], [0.55, 0.08], [0.5, 0.12], [0.5, 0.78], [0.56, 0.82], [0.6, 0.9], [0.6, 0.95], [0.4, 0.95], [0.4, 0.8], [0.001, 0.8]], 12, null, x, y + 0.2, z));
  bag.add('iron', box(x - 0.55, y + 1.15, z - 0.02, x + 0.55, y + 1.18, z + 0.02));
  for (const s of [-1, 1]) bag.add('iron', box(x + s * 0.5 - 0.02, y + 1.15, z - 0.02, x + s * 0.5 + 0.02, y + 1.0, z + 0.02));
  bag.add('iron', lathe([[0.06, 0], [0.06, 0.1], [0.001, 0.1]], 6, null, x, y + 1.05, z));                                      // the pulley
  for (const [dx, dz] of [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) bag.add('limestone', box(x + dx - 0.35, y + 0.0, z + dz - 0.35, x + dx + 0.35, y + 0.035, z + dz + 0.35));     // the drains (pilelle) in the paving
}

/**
 * squero: { c: [x, z] (the quay's edge, the middle of the yard), yaw (the canal's heading), y, sea, seed } — built with the canal along +x, the
 * yard to its +z: the slipway into the water, the tezon, a gondola on the stocks, ribs and planks.
 */
export function squero(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, y = el.y ?? 0, sea = el.sea ?? -2.5, rand = rng(el.seed ?? 5);
  const put = (m, g) => { g.rotateY(-yaw); g.translate(cx, 0, cz); bag.add(m, g); };
  const B = (m, x0, y0, z0, x1, y1, z1) => put(m, box(x0, y0, z0, x1, y1, z1));
  // the slipway: two timber ways stepping down from the yard into the water, sleepers across them
  for (let i = 0; i < 20; i++) {
    const zz = 0.3 - i * 0.4, yt = y - 0.05 - i * 0.2;
    if (yt < sea - 0.3) break;
    for (const [a, b] of [[-6.2, -5.7], [-3.3, -2.8]]) B('timber', a, sea - 0.8, zz - 0.4, b, yt, zz);
    if (i % 2 === 0) B('wood_dark', -6.4, yt - 0.12, zz - 0.3, -2.6, yt - 0.02, zz - 0.15);
  }
  // the tezon: a long open shed of timber, a roof of tile on posts, the gable to the canal side open
  const x0 = -8, x1 = 9, z0 = 4.5, z1 = 12.5, h = 3.4;
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [(x0 + x1) / 2, z0], [(x0 + x1) / 2, z1], [x0, (z0 + z1) / 2], [x1, (z0 + z1) / 2]]) B('timber', px - 0.12, y - 0.1, pz - 0.12, px + 0.12, y + h, pz + 0.12);
  B('planks_grey', x0 - 0.02, y, z1 - 0.06, x1 + 0.02, y + h, z1);                          // the back wall of boards
  for (const sx of [x0, x1]) B('planks_grey', sx - 0.04, y, z0, sx + 0.04, y + h, z1);
  B('timber', x0 - 0.3, y + h, z0 - 0.5, x1 + 0.3, y + h + 0.2, z1 + 0.4);
  const rg = frustum([x0 - 0.5, z0 - 0.9, x1 + 0.5, z1 + 0.6], y + h + 0.2, y + h + 2.4, 0.3, 0.3, 4.2, 4.2);
  rg.rotateY(0); put('roof_tile', rg);
  col.segment([cx + Math.cos(yaw) * x0 - Math.sin(yaw) * (z1 - 0.1), cz + Math.sin(yaw) * x0 + Math.cos(yaw) * (z1 - 0.1)], [cx + Math.cos(yaw) * x1 - Math.sin(yaw) * (z1 - 0.1), cz + Math.sin(yaw) * x1 + Math.cos(yaw) * (z1 - 0.1)], 0.4, y - 1, y + h);
  // a hull on the stocks inside: the gondola on its trestles, and another bare, only its ribs and a keel
  for (const u of [-4, -1.5, 1]) { B('timber', u - 0.15, y, 7.8, u + 0.15, y + 0.7, 8.4); B('timber', u - 0.15, y, 9.2, u + 0.15, y + 0.7, 9.8); }
  const g = [];
  gondola({ at: [0, 0], yaw: 0, y: 0, len: 10.2 }, { bag: { add: (m, geo) => g.push([m, geo]) } });
  for (const [m, geo] of g) { geo.rotateY(-0.0); geo.translate(-1.2, y + 0.7 + 0.12, 8.8); put(m, geo); }
  B('timber', 1.5, y + 0.05, 10.5, 6.5, y + 0.14, 10.8);                                      // the keel of the next
  for (let i = 0; i < 9; i++) { const u = 1.8 + i * 0.52, hh = 0.5 + 0.5 * Math.sin(Math.PI * (i + 0.5) / 9); for (const s of [-1, 1]) put('timber', rod([u, y + 0.14, 10.65], [u, y + 0.14 + hh, 10.65 + s * (0.3 + hh * 0.45)], 0.035, 4)); }
  // planks stacked to season, a pile of ribs, barrels of pitch
  for (let k = 0; k < 4; k++) B('timber', 2 + 0, y + k * 0.1, 5.1 + 0, 7.5, y + k * 0.1 + 0.08, 5.3);
  for (let k = 0; k < 6; k++) B('wood_ochre', 3.5 - k * 0.0, y + 0.0 + k * 0.08, 5.6, 8.0, y + 0.08 + k * 0.08, 6.1);
  for (const [bx, bz] of [[-7, 5.4], [-6.3, 5.8]]) put('wood_dark', lathe([[0.32, 0], [0.4, 0.4], [0.32, 0.85], [0.001, 0.85]], 10, null, bx, y, bz));
  put('bitumen', box(-6.9, y + 0.85, 5.3, -6.4, y + 0.9, 5.7));
  void rand;
}
