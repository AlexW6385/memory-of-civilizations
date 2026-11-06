// Muscovite (15th–16th c.; docs/settlements/muscovy.md §4): the Kremlin's red-brick walls with
// swallowtail merlons and their towers (round at the corners); the cross-domed cathedrals of white
// stone with their zakomary and five drums under helmet domes; Ivan the Great's bell tower in
// stacked octagons; St Basil's — the central tented church among eight chapels with onion domes on a
// raised gallery; the log houses of the posad under plank roofs.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { Shape, Path } from '../../core/three.js';
import '../qing/index.js';
import { slab, hexa, pitched, pyr } from '../norse/index.js';
import { cathedralInside } from './dormition.js';

const BR = 'brick_kremlin', WS = 'limestone', G = 'gilt_bronze', LOG = 'log_pine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** An onion dome of radius r on its drum (drum height dh) at (x, y, z): the drum with its slit windows and white-stone cornice, the sheet dome with its standing seams (ribs), the cross on top. */
function onion(bag, x, y, z, r, dh, mat, drum = BR, ribs = 16) {
  bag.add(drum, lathe([[r * 0.8, 0], [r * 0.8, dh], [r * 0.9, dh + 0.3], [0.001, dh + 0.3]], 16, null, x, y, z));
  bag.add(WS, lathe([[r * 0.8 + 0.01, 0], [r * 0.8 + 0.12, 0.08], [r * 0.8 + 0.12, 0.26], [r * 0.8 + 0.01, 0.34]], 16, null, x, y + dh - 0.42, z));
  bag.add(WS, lathe([[r * 0.8 + 0.01, 0], [r * 0.8 + 0.1, 0.06], [r * 0.8 + 0.1, 0.2], [r * 0.8 + 0.01, 0.26]], 16, null, x, y + 0.05, z));
  if (dh > 1.2) for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, R = r * 0.8 + 0.02, w = Math.min(0.22, r * 0.09), c = Math.cos(a), sn = Math.sin(a);
    bag.add('opening', orientedBox([x + c * R - sn * w, z + sn * R + c * w], [x + c * R + sn * w, z + sn * R - c * w], 0.05, y + dh * 0.3, y + dh * 0.72));
  }
  const prof = [[r * 0.85, 0], [r * 1.15, r * 0.55], [r * 1.1, r * 0.95], [r * 0.7, r * 1.45], [r * 0.2, r * 1.95], [0.06, r * 2.3], [0.001, r * 2.3]];
  const last = prof.length - 1, mod = ribs ? (th, i) => (i === 0 || i >= last - 1 ? 1 : 1 + 0.035 * Math.max(0, Math.cos(th * ribs)) ** 24) : null;
  bag.add(mat, lathe(prof, ribs ? ribs * 4 : 16, mod, x, y + dh + 0.3, z));
  const top = y + dh + 0.3 + r * 2.3;
  bag.add(G, lathe([[0.001, 0], [r * 0.14, r * 0.05], [r * 0.16, r * 0.16], [r * 0.12, r * 0.28], [0.001, r * 0.3]], 10, null, x, top - 0.02, z));   // the apple under the cross
  bag.add(G, box(x - 0.06, top, z - 0.06, x + 0.06, top + r * 0.9 + 0.5, z + 0.06));
  bag.add(G, box(x - r * 0.25 - 0.1, top + r * 0.55, z - 0.05, x + r * 0.25 + 0.1, top + r * 0.62 + 0.05, z + 0.05));
  bag.add(G, box(x - r * 0.12 - 0.05, top + r * 0.2, z - 0.05, x + r * 0.12 + 0.05, top + r * 0.25 + 0.05, z + 0.05));
}
/** A kokoshnik's outline: w wide, straight sides h1 high, then the keel-shaped head rising to a point at h1 + h2. */
function kokoshnikShape(w, h1, h2) {
  const sh = new Shape();
  sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, h1);
  sh.bezierCurveTo(w + w * 0.04, h1 + h2 * 0.55, w * 0.52, h1 + h2 * 0.62, w / 2, h1 + h2);
  sh.bezierCurveTo(w * 0.48, h1 + h2 * 0.62, -w * 0.04, h1 + h2 * 0.55, 0, h1);
  sh.lineTo(0, 0);
  return sh;
}
/** A kokoshnik gable standing on a polygonal drum: brick face, white-stone border behind; centre at angle a, apothem R, from y. */
function kokoshnik(bag, cx, cz, a, R, y, w, h1, h2, th = 0.5) {
  const c = Math.cos(a), sn = Math.sin(a), at = (rr, u) => [cx + c * rr - sn * u, cz + sn * rr + c * u];
  bag.add(WS, slab(kokoshnikShape(w + 0.4, h1 + 0.1, h2 + 0.2), th * 0.6, at(R - th * 0.25, -(w + 0.4) / 2), at(R - th * 0.25, (w + 0.4) / 2), y, 10));
  bag.add(BR, slab(kokoshnikShape(w, h1, h2), th * 0.5, at(R + th * 0.25, -w / 2), at(R + th * 0.25, w / 2), y + 0.1, 10));
}
/** A helmet dome (shlem) — the older, flatter Muscovite dome. */
function helmet(bag, x, y, z, r, dh, mat, drum = WS) {
  bag.add(drum, lathe([[r, 0], [r, dh], [r * 1.05, dh + 0.3], [0.001, dh + 0.3]], 16, null, x, y, z));
  bag.add(mat, lathe([[r, 0], [r * 0.98, r * 0.55], [r * 0.7, r * 1.05], [r * 0.25, r * 1.4], [0.06, r * 1.65], [0.001, r * 1.65]], 16, null, x, y + dh + 0.3, z));
  const top = y + dh + 0.3 + r * 1.65;
  bag.add(G, box(x - 0.08, top, z - 0.08, x + 0.08, top + r * 0.7 + 0.5, z + 0.08));
}
/** russian_church: { rect, h, y, domes: [[x, z, r, dh]], mat, dome (material), apses (count, on the east) } — a cross-domed church with zakomary arches along its tops. */
function russianChurch(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, h = el.h ?? 20, y = el.y ?? 0, mat = el.mat ?? WS, dm = el.dome ?? G;
  // the top: the zakomary (round-topped gables along each side), the roof, the apses on the east, the domes
  const top = () => {
    for (const [a, b, zz, along] of [[x0, x1, z0, true], [x0, x1, z1, true], [z0, z1, x0, false], [z0, z1, x1, false]]) {
      const n = 4, L = (b - a) / n;
      for (let i = 0; i < n; i++) { const m = a + (i + 0.5) * L, r = L / 2 - 0.2; const g = lathe([[r, 0], [r * 0.7, r * 0.7], [0.001, r]], 8, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.scale(1, 1, 0.12); if (!along) g.rotateY(Math.PI / 2); g.translate(along ? m : zz, y + h, along ? zz : m); bag.add(mat, g); }
    }
    bag.add('lead', box(x0 + 0.5, y + h, z0 + 0.5, x1 - 0.5, y + h + 1.2, z1 - 0.5));
    for (let k = 0; k < (el.apses ?? 3); k++) { const n = el.apses ?? 3, z = z0 + (k + 0.5) * (z1 - z0) / n, r = Math.min((z1 - z0) / n / 2 - 0.3, 4.5); bag.add(mat, lathe([[r, 0], [r, h * 0.75], [0.001, h * 0.75]], 16, null, x1, y - 0.5, z)); col.circle(x1, z, r, y, y + h * 0.75); }
    for (const [dx, dz, r, dh] of el.domes ?? []) helmet(bag, dx, y + h + 1.2, dz, r, dh, dm, mat);
  };
  if (el.interior) { col.floor(el.rect, y + h); return cathedralInside(el, ctx, top); }
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  top();
  for (const f of [z0, z1]) for (let i = 0; i < 4; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / 4; bag.add('opening', box(x - 0.5, y + h * 0.5, f - 0.04, x + 0.5, y + h * 0.5 + 2.6, f + 0.04)); }
  bag.add('opening', box(x0 - 0.05, y, (z0 + z1) / 2 - 1.5, x0 + 0.05, y + 5, (z0 + z1) / 2 + 1.5));
}
/** bell_tower: { c, y, tiers: [[r, h]], dome } — stacked octagons with open arcades and a gilded helmet on top. */
function bellTower(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, tiers = el.tiers ?? [[8.5, 25], [7, 15], [5.5, 12], [4.5, 10]];
  let yy = y - 0.5;
  tiers.forEach(([r, h], i) => {
    bag.add(WS, lathe([[r, 0], [r, h], [r + 0.5, h + 0.4], [r + 0.5, h + 1], [0.001, h + 1]], 8, null, x, yy, z));
    if (i === 0) col.circle(x, z, r, y, yy + h);
    if (i > 0) for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2, rr = r * 0.93; bag.add('opening', box(x + Math.cos(a) * rr - 0.8, yy + h * 0.25, z + Math.sin(a) * rr - 0.8, x + Math.cos(a) * rr + 0.8, yy + h * 0.8, z + Math.sin(a) * rr + 0.8)); }
    yy += h + 1;
  });
  helmet(bag, x, yy, z, tiers[tiers.length - 1][0] * 0.75, 5, el.dome ?? G);
}
/**
 * pokrov: { c, y, s } — St Basil's as about 1600: the ground storey (podklet) with its open arcades,
 * the open platform above with a parapet, the wooden stairs under their plank shelters (north and
 * west); the central tented church rising from tiers of kokoshniks; four great and four small
 * chapels, each crowned by a ring of kokoshniks and an onion dome on its drum.
 */
function pokrov(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, P = 4 * s, E = 21 * s;
  col.rect([cx - E, cz - E, cx + E, cz + E], y, y + P); col.floor([cx - E, cz - E, cx + E, cz + E], y + P);
  // the podklet: an arcaded outer wall (seven open bays a side), the solid core behind it, the platform's slab on top
  const bays = 7, bw = 2 * E / bays, aw = bw * 0.62, sp = P - 0.6 - aw / 2 - 0.35;
  const arc = new Shape(); arc.moveTo(0, 0); arc.lineTo(2 * E, 0); arc.lineTo(2 * E, P - 0.5); arc.lineTo(0, P - 0.5); arc.lineTo(0, 0);
  for (let i = 0; i < bays; i++) { const uc = (i + 0.5) * bw, p = new Path(); p.moveTo(uc - aw / 2, 0.45); p.lineTo(uc + aw / 2, 0.45); p.lineTo(uc + aw / 2, sp); p.absarc(uc, sp, aw / 2, 0, Math.PI, false); p.lineTo(uc - aw / 2, 0.45); arc.holes.push(p); }
  for (const [a, b] of [[[cx - E, cz - E + 0.6], [cx + E, cz - E + 0.6]], [[cx + E, cz + E - 0.6], [cx - E, cz + E - 0.6]], [[cx - E + 0.6, cz + E], [cx - E + 0.6, cz - E]], [[cx + E - 0.6, cz - E], [cx + E - 0.6, cz + E]]]) bag.add(BR, slab(arc, 1.2, a, b, y - 0.5, 12));
  bag.add(WS, box(cx - E - 0.12, y - 0.5, cz - E - 0.12, cx + E + 0.12, y - 0.05 + 0.45, cz + E + 0.12));          // the white-stone footing
  const I = E - 4.2 * s;
  bag.add(BR, box(cx - I, y - 0.5, cz - I, cx + I, y + P - 0.5, cz + I));
  bag.add(BR, box(cx - E, y + P - 0.5, cz - E, cx + E, y + P, cz + E));
  bag.add(WS, box(cx - E - 0.15, y + P - 0.75, cz - E - 0.15, cx + E + 0.15, y + P - 0.45, cz + E + 0.15));     // the white cornice under the platform
  // the platform's parapet, white-capped, open at the stairheads
  const gap = 3 * s;
  for (const [a, b] of [[[cx - E + 0.3, cz - E + 0.3], [cx + E - 0.3, cz - E + 0.3]], [[cx - E + 0.3, cz + E - 0.3], [cx + E - 0.3, cz + E - 0.3]], [[cx - E + 0.3, cz - E + 0.3], [cx - E + 0.3, cz + E - 0.3]], [[cx + E - 0.3, cz - E + 0.3], [cx + E - 0.3, cz + E - 0.3]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, open = (a[1] === b[1] && a[1] < cz) || (a[0] === b[0] && a[0] < cx);
    const runs = open ? [[0, L / 2 - gap], [L / 2 + gap, L]] : [[0, L]];
    for (const [u0, u1] of runs) { const p0 = [a[0] + ux * u0, a[1] + uz * u0], p1 = [a[0] + ux * u1, a[1] + uz * u1]; bag.add(BR, orientedBox(p0, p1, 0.5, y + P, y + P + 0.95)); bag.add(WS, orientedBox(p0, p1, 0.62, y + P + 0.95, y + P + 1.1, 0.06)); }
  }
  // the wooden stairs up to the platform (west and north), each under a plank roof on posts
  const stair = (dirx, dirz) => {
    const n = Math.round(P / 0.2), run = 0.3, L = n * run, hw = gap - 0.2;
    for (let k = 0; k < n; k++) {
      const d0 = E + L - (k + 1) * run, d1 = d0 + run + 0.02, yy = y + (k + 1) * P / n;
      if (dirx) bag.add('planks_grey', box(cx - d1, yy - 0.12, cz - hw, cx - d0, yy, cz + hw)); else bag.add('planks_grey', box(cx - hw, yy - 0.12, cz - d1, cx + hw, yy, cz - d0));
    }
    for (const sd of [-1, 1]) {
      const a0 = E + L, P8 = (d, yy, w) => dirx ? [cx - d, yy, cz + sd * (hw + w)] : [cx + sd * (hw + w), yy, cz - d];
      bag.add('planks_grey', hexa([P8(a0, y - 0.1, 0), P8(E, y + P - 0.4, 0), P8(E, y + P - 0.4, 0.1), P8(a0, y - 0.1, 0.1), P8(a0, y + 0.25, 0), P8(E, y + P, 0), P8(E, y + P, 0.1), P8(a0, y + 0.25, 0.1)]));
      for (const d of [E + 0.3, E + L / 2, E + L - 0.2]) { const p = P8(d, 0, 0.18), yb = y + Math.max(0, (E + L - d) / L) * P - 0.1; bag.add('timber', box(p[0] - 0.1, yb, p[2] - 0.1, p[0] + 0.1, y + P + 2.6, p[2] + 0.1)); }
    }
    const r = dirx ? [cx - E - L - 0.2, cz - hw - 0.3, cx - E + 0.2, cz + hw + 0.3] : [cx - hw - 0.3, cz - E - L - 0.2, cx + hw + 0.3, cz - E + 0.2];
    bag.add('timber', box(r[0], y + P + 2.6, r[1], r[2], y + P + 2.8, r[3]));
    pitched(bag, 'planks_grey', 'planks_grey', r, y + P + 2.8, 0.9, 0.35, dirx);
  };
  stair(true, false); stair(false, true);
  const yb = y + P;
  // the central church: an octagon, the tiers of kokoshniks at its head, the tall tent and its small onion
  bag.add(BR, lathe([[7.5 * s, 0], [7.5 * s, 20 * s], [8 * s, 20.2 * s], [8 * s, 20.5 * s], [7.3 * s, 20.5 * s], [7.3 * s, 25 * s], [0.001, 25 * s]], 8, null, cx, yb, cz)); col.circle(cx, cz, 7.5 * s, yb, yb + 20 * s);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add(WS, orientedBox([cx + Math.cos(a) * 7.6 * s, cz + Math.sin(a) * 7.6 * s], [cx + Math.cos(a + Math.PI / 4) * 7.6 * s, cz + Math.sin(a + Math.PI / 4) * 7.6 * s], 0.25, yb + 19.6 * s, yb + 20 * s)); }
  const ap = Math.cos(Math.PI / 8);
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2;
    kokoshnik(bag, cx, cz, a, 7.3 * s * ap + 0.3, yb + 20.5 * s, 4.6 * s, 1.1 * s, 2.5 * s, 0.6);
    kokoshnik(bag, cx, cz, a, 7.3 * s * ap + 0.0, yb + 23.2 * s, 3.2 * s, 0.9 * s, 2.1 * s, 0.4);
    // tall windows in the octagon's faces, white-framed
    const R = 7.5 * s * ap + 0.02, c = Math.cos(a), sn = Math.sin(a), w = 0.55 * s;
    bag.add('opening', orientedBox([cx + c * R - sn * w, cz + sn * R + c * w], [cx + c * R + sn * w, cz + sn * R - c * w], 0.06, yb + 9 * s, yb + 13.5 * s));
    bag.add(WS, orientedBox([cx + c * R - sn * (w + 0.3), cz + sn * R + c * (w + 0.3)], [cx + c * R + sn * (w + 0.3), cz + sn * R - c * (w + 0.3)], 0.04, yb + 8.7 * s, yb + 14.1 * s));
  }
  bag.add(BR, lathe([[6.2 * s, 0], [1.4 * s, 18 * s], [0.001, 18 * s]], 8, null, cx, yb + 25 * s, cz));
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; for (const t of [0.15, 0.45, 0.75]) { const r = (6.2 * s * (1 - t) + 1.4 * s * t) * ap; bag.add(WS, box(cx + Math.cos(a) * r - 0.15, yb + 25 * s + 18 * s * t - 0.15, cz + Math.sin(a) * r - 0.15, cx + Math.cos(a) * r + 0.15, yb + 25 * s + 18 * s * t + 0.15, cz + Math.sin(a) * r + 0.15)); } }
  onion(bag, cx, yb + 43 * s, cz, 1.4 * s, 1.5 * s, G, BR, 12);
  // the four great chapels on the axes, the four small ones on the diagonals
  const mats = ['tile_green', G, 'tile_green', G, G, 'tile_green', G, 'tile_green'];
  for (let k = 0; k < 8; k++) {
    const big = k % 2 === 0, a = k / 8 * Math.PI * 2 + Math.PI / 2, d = (big ? 14 : 12) * s, r = (big ? 4.6 : 3) * s, h = (big ? 15 : 11) * s, seg = big ? 8 : 12;
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    bag.add(BR, lathe([[r, 0], [r, h], [r + 0.3, h + 0.3], [r * 0.85, h + 0.6], [r * 0.85, h + 2.5 * s], [0.001, h + 2.5 * s]], seg, null, x, yb, z)); col.circle(x, z, r, yb, yb + h);
    bag.add(WS, lathe([[r + 0.01, 0], [r + 0.2, 0.15], [r + 0.2, 0.45], [r + 0.01, 0.6]], seg, null, x, yb + h * 0.42, z));      // a white band round the chapel's middle
    const ap2 = Math.cos(Math.PI / seg), nk = big ? 8 : 6;
    for (let q = 0; q < nk; q++) {
      const qa = big ? (q + 0.5) / 8 * Math.PI * 2 : (q * 2 + 0.5) / 12 * Math.PI * 2, R = r * 0.85 * ap2 + 0.2;
      kokoshnik(bag, x, z, qa, R, yb + h + 0.6, (big ? 2.4 : 1.7) * s * (big ? 0.95 : 1), 0.5 * s, (big ? 1.5 : 1.1) * s, 0.4);
      const Rw = r * Math.cos(Math.PI / seg) + 0.02, c = Math.cos(qa), sn = Math.sin(qa), w = (big ? 0.45 : 0.32) * s;
      bag.add('opening', orientedBox([x + c * Rw - sn * w, z + sn * Rw + c * w], [x + c * Rw + sn * w, z + sn * Rw - c * w], 0.06, yb + h * 0.55, yb + h * 0.75));
    }
    onion(bag, x, yb + h + 2.5 * s, z, (big ? 2.4 : 1.8) * s, (big ? 3 : 2.2) * s, mats[k], BR, big ? 16 : 12);
  }
}
/** A swallowtail merlon's outline: w wide, H high to the horns' tips, the V notch `notch` deep, a loophole slit in it. */
function merlonShape(w, H, notch = 0.6) {
  const sh = new Shape();
  sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, H); sh.lineTo(w / 2, H - notch); sh.lineTo(0, H); sh.lineTo(0, 0);
  const p = new Path(), q = 0.08; p.moveTo(w / 2 - q, 0.55); p.lineTo(w / 2 + q, 0.55); p.lineTo(w / 2 + q, 1.25); p.lineTo(w / 2 - q, 1.25); p.lineTo(w / 2 - q, 0.55); sh.holes.push(p);
  return sh;
}
const MERLON = merlonShape(1.6, 2.4), MW = 1.6, MPITCH = 2.5, MH = 2.4;
/** Merlons along a→b, set `off` metres out along the outward normal o, standing on height y. */
function merlons(bag, a, b, o, off, y) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.floor(L / MPITCH));
  for (let q = 0; q < n; q++) {
    const u0 = (q + 0.5) * L / n - MW / 2, p0 = [a[0] + ux * u0 + o[0] * off, a[1] + uz * u0 + o[1] * off], p1 = [p0[0] + ux * MW, p0[1] + uz * MW];
    bag.add(BR, slab(MERLON, 0.7, p0, p1, y, 1));
  }
}
/**
 * kremlin_wall: { pts (closed polygon), h, th, y (fn of x, z), every (tower spacing), round (indices of round corner towers), gates: [[i, t]] }
 * As about 1600: the brick wall with its swallowtail merlons on the outer edge and the wall-walk under
 * a plank span roof carried on the merlons and on posts along the inner edge; the towers under their
 * wooden tents (the stone tents came after 1624), the gate towers with their tall superstructure and
 * a tent on columns over the bell.
 */
function kremlinWall(el, { bag, col }) {
  const pts = el.pts, h = el.h ?? 12, th = el.th ?? 4, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, every = el.every ?? 55, gates = el.gates ?? [];
  // the polygon's outside: the side away from its centroid
  const C = [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.round(L / every));
    let o = [uz, -ux];
    if (((a[0] + b[0]) / 2 - C[0]) * o[0] + ((a[1] + b[1]) / 2 - C[1]) * o[1] < 0) o = [-o[0], -o[1]];
    const gate = gates.filter(([gi]) => gi === i).map(([, t]) => t);
    const segs = [];
    let t0 = 0;
    for (const t of gate.sort()) { segs.push([t0, t - 5 / L]); t0 = t + 5 / L; }
    segs.push([t0, 1]);
    for (const [s0, s1] of segs) {
      const m = 12, stepT = (s1 - s0) / m;
      for (let k = 0; k < m; k++) {
        const ta = s0 + k * stepT, tb = ta + stepT, pa = [a[0] + ux * L * ta, a[1] + uz * L * ta], pb = [a[0] + ux * L * tb, a[1] + uz * L * tb], yy = Math.min(yf(...pa), yf(...pb));
        bag.add(BR, orientedBox(pa, pb, th, yy - 3, yy + h, 0.05)); col.segment(pa, pb, th, yy - 3, yy + h);
        merlons(bag, pa, pb, o, th / 2 - 0.35, yy + h);
        // the span roof over the wall-walk: its outer slope resting on the merlons, the inner on posts
        const sl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), P3 = (u, off, yv) => [pa[0] + ux * u + o[0] * off, yv, pa[1] + uz * u + o[1] * off];
        const eo = th / 2 + 0.35, ei = -(th / 2 + 0.35), ye = yy + h + MH + 0.04, yr = ye + 2.1, t = 0.14;
        for (const e of [eo, ei]) bag.add('planks_grey', hexa([P3(-0.04, e, ye), P3(sl + 0.04, e, ye), P3(sl + 0.04, 0, yr), P3(-0.04, 0, yr), P3(-0.04, e, ye + t), P3(sl + 0.04, e, ye + t), P3(sl + 0.04, 0, yr + t), P3(-0.04, 0, yr + t)]));
        bag.add('planks_grey', hexa([P3(0, th / 2 - 0.05, yy + h + MH - 0.04), P3(sl, th / 2 - 0.05, yy + h + MH - 0.04), P3(sl, -th / 2 + 0.05, yy + h + MH - 0.04), P3(0, -th / 2 + 0.05, yy + h + MH - 0.04), P3(0, th / 2 - 0.05, ye + 0.02), P3(sl, th / 2 - 0.05, ye + 0.02), P3(sl, -th / 2 + 0.05, ye + 0.02), P3(0, -th / 2 + 0.05, ye + 0.02)]));   // the tie-beams' deck
        const np = Math.max(1, Math.round(sl / 3.2));
        for (let q = 0; q < np; q++) { const p = P3((q + 0.5) * sl / np, -th / 2 + 0.2, 0); bag.add('timber', box(p[0] - 0.12, yy + h, p[2] - 0.12, p[0] + 0.12, yy + h + MH - 0.04, p[2] + 0.12)); }
      }
    }
    // towers: at the corner (round where asked) and along the side; gate towers taller
    const tower = (x, z, round, tall) => {
      const yy = yf(x, z), r = round ? 7 : 5.5, H = tall ? h + 22 : h + 8;
      let top;
      if (round) {
        bag.add(BR, lathe([[r + 0.8, 0], [r, 4], [r, H], [r + 0.6, H + 0.4], [r + 0.6, H + 2], [0.001, H + 2]], 24, null, x, yy - 3, z)); col.circle(x, z, r + 0.8, yy - 3, yy - 3 + H);
        top = yy - 1 + H;
        const nm = 14;
        for (let q = 0; q < nm; q++) { const a0 = q / nm * Math.PI * 2, a1 = a0 + MW / (r + 0.25), R = r + 0.25; bag.add(BR, slab(MERLON, 0.7, [x + Math.cos(a0) * R, z + Math.sin(a0) * R], [x + Math.cos(a1) * R, z + Math.sin(a1) * R], top, 1)); }
        for (let q = 0; q < 6; q++) { const a = (q + 0.3) / 6 * Math.PI * 2; bag.add('opening', orientedBox([x + Math.cos(a) * (r + 0.02) - Math.sin(a) * 0.12, z + Math.sin(a) * (r + 0.02) + Math.cos(a) * 0.12], [x + Math.cos(a) * (r + 0.02) + Math.sin(a) * 0.12, z + Math.sin(a) * (r + 0.02) - Math.cos(a) * 0.12], 0.05, yy + H * 0.45, yy + H * 0.45 + 1.4)); }
        bag.add('planks_grey', lathe([[0.001, 0], [r + 1.5, 0], [r + 1.2, 0.5], [0.3, 2.2 * r], [0.001, 2.2 * r + 0.3]], 24, null, x, top + MH + 0.05, z));
        bag.add('iron', box(x - 0.05, top + MH + 2.2 * r, z - 0.05, x + 0.05, top + MH + 2.2 * r + 2.2, z + 0.05));
        bag.add('iron', box(x, top + MH + 2.2 * r + 1.3, z - 0.03, x + 0.9, top + MH + 2.2 * r + 2, z + 0.03));
        return;
      }
      if (tall) {
        // the gate tower: its body round the vaulted passage through it (along x where the wall runs north–south)
        const g = 2.4, gh = yy + 4.2, ax = Math.abs(uz) > Math.abs(ux), Bx = (a0, a1, b0, b1, y0, y1) => ax ? box(x + a0, y0, z + b0, x + a1, y1, z + b1) : box(x + b0, y0, z + a0, x + b1, y1, z + a1);
        const Rx = (a0, a1, b0, b1) => ax ? [x + a0, z + b0, x + a1, z + b1] : [x + b0, z + a0, x + b1, z + a1];
        bag.add(BR, Bx(-r, r, -r, -g, yy - 3, yy - 3 + H)); bag.add(BR, Bx(-r, r, g, r, yy - 3, yy - 3 + H)); bag.add(BR, Bx(-r, r, -g, g, gh, yy - 3 + H));
        col.rect(Rx(-r, r, -r, -g), yy - 3, yy - 3 + H); col.rect(Rx(-r, r, g, r), yy - 3, yy - 3 + H); col.rect(Rx(-r, r, -g, g), gh, yy - 3 + H);
        // the white-stone frames of its two mouths, the oak leaves standing open against the passage's sides, iron-bound
        for (const e of [-1, 1]) {
          bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, -g - 0.5, -g, yy - 3, gh + 0.5)); bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, g, g + 0.5, yy - 3, gh + 0.5)); bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, -g, g, gh, gh + 0.5));
          const l0 = e > 0 ? r - 2.9 : -r + 0.8;
          bag.add('timber', Bx(l0, l0 + 2.1, -g + 0.02, -g + 0.14, yy - 1, gh - 0.3)); bag.add('timber', Bx(l0, l0 + 2.1, g - 0.14, g - 0.02, yy - 1, gh - 0.3));
          for (const yb of [yy + 0.4, yy + 2.6]) { bag.add('iron', Bx(l0 + 0.1, l0 + 2.0, -g + 0.14, -g + 0.16, yb, yb + 0.08)); bag.add('iron', Bx(l0 + 0.1, l0 + 2.0, g - 0.16, g - 0.14, yb, yb + 0.08)); }
        }
      } else { bag.add(BR, box(x - r, yy - 3, z - r, x + r, yy - 3 + H, z + r)); col.rect([x - r, z - r, x + r, z + r], yy - 3, yy - 3 + H); }
      bag.add(BR, box(x - r - 0.5, yy - 3 + H, z - r - 0.5, x + r + 0.5, yy - 1.5 + H, z + r + 0.5));        // the machicolated parapet's corbelled band
      for (let q = 0; q < 6; q++) { const zz = z - r + (q + 0.5) * 2 * r / 6; for (const sx of [-1, 1]) bag.add(BR, box(x + sx * (r + 0.25) - 0.25, yy - 4.2 + H, zz - 0.3, x + sx * (r + 0.25) + 0.25, yy - 3 + H, zz + 0.3)); }
      for (let q = 0; q < 6; q++) { const xx = x - r + (q + 0.5) * 2 * r / 6; for (const sz of [-1, 1]) bag.add(BR, box(xx - 0.3, yy - 4.2 + H, z + sz * (r + 0.25) - 0.25, xx + 0.3, yy - 3 + H, z + sz * (r + 0.25) + 0.25)); }
      for (const sz of [-1, 1]) for (const sx of [-1, 1]) bag.add('opening', box(x + sx * r * 0.45 - 0.13 + (0), yy + H * 0.4, z + sz * (r + 0.01) - 0.03, x + sx * r * 0.45 + 0.13, yy + H * 0.4 + 1.3, z + sz * (r + 0.01) + 0.03));
      top = yy - 1.5 + H;
      const R = r + 0.5 - 0.35;
      for (const [p0, p1] of [[[x - R, z - R], [x + R, z - R]], [[x + R, z - R], [x + R, z + R]], [[x + R, z + R], [x - R, z + R]], [[x - R, z + R], [x - R, z - R]]]) {
        const Ls = 2 * R, ux2 = (p1[0] - p0[0]) / Ls, uz2 = (p1[1] - p0[1]) / Ls;
        for (let q = 0; q < 4; q++) { const u0 = (q + 0.5) * Ls / 4 - MW / 2; const a0 = [p0[0] + ux2 * u0, p0[1] + uz2 * u0]; bag.add(BR, slab(MERLON, 0.7, a0, [a0[0] + ux2 * MW, a0[1] + uz2 * MW], top, 1)); }
      }
      if (!tall) {
        bag.add('planks_grey', box(x - r - 0.3, top + MH, z - r - 0.3, x + r + 0.3, top + MH + 0.2, z + r + 0.3));
        bag.add('planks_grey', pyr(x, z, r + 1.3, top + MH + 0.2, 0, top + MH + 2.3 * r));
        bag.add('iron', box(x - 0.05, top + MH + 2.3 * r - 0.3, z - 0.05, x + 0.05, top + MH + 2.3 * r + 1.8, z + 0.05));
        return;
      }
      // the gate tower: the gateway, the superstructure above the parapet, the open stage on columns with its bell, the stone tent
      const a = r * 0.65, y1 = top + 0.2, y2 = y1 + 7, y3 = y2 + 4.5;
      bag.add(BR, box(x - a, top - 0.5, z - a, x + a, y2, z + a));
      bag.add(WS, box(x - a - 0.15, y2 - 0.4, z - a - 0.15, x + a + 0.15, y2, z + a + 0.15));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add(BR, box(x + sx * a - (sx > 0 ? 0.8 : 0), y2, z + sz * a - (sz > 0 ? 0.8 : 0), x + sx * a + (sx < 0 ? 0.8 : 0), y3, z + sz * a + (sz < 0 ? 0.8 : 0)));
      const ar = new Shape(), Lg = 2 * a - 1.6; ar.moveTo(0, 0); ar.lineTo(0.15, 0); ar.absarc(Lg / 2, 0, Lg / 2 - 0.15, Math.PI, 0, true); ar.lineTo(Lg, 0); ar.lineTo(Lg, Lg / 2 + 0.5); ar.lineTo(0, Lg / 2 + 0.5); ar.lineTo(0, 0);
      const ys = y3 - Lg / 2 - 0.5;
      for (const [p0, p1] of [[[x - a + 0.8, z - a + 0.4], [x + a - 0.8, z - a + 0.4]], [[x - a + 0.8, z + a - 0.4], [x + a - 0.8, z + a - 0.4]], [[x - a + 0.4, z - a + 0.8], [x - a + 0.4, z + a - 0.8]], [[x + a - 0.4, z - a + 0.8], [x + a - 0.4, z + a - 0.8]]]) bag.add(BR, slab(ar, 0.8, p0, p1, ys, 10));
      bag.add(WS, box(x - a - 0.2, y3, z - a - 0.2, x + a + 0.2, y3 + 0.5, z + a + 0.2));
      bag.add('bronze', lathe([[0.001, 0], [1.0, 0], [0.95, 0.15], [0.7, 0.6], [0.6, 1.3], [0.45, 1.5], [0.001, 1.55]], 16, null, x, y2 + 1.2, z));     // the bell
      bag.add('timber', box(x - a + 0.8, y2 + 2.75, z - 0.12, x + a - 0.8, y2 + 3.0, z + 0.12));
      bag.add(BR, pyr(x, z, a + 0.1, y3 + 0.5, 0.25, y3 + 12));
      for (const t of [0.25, 0.5, 0.75]) { const ah = (a + 0.1) * (1 - t) + 0.25 * t + 0.08; bag.add(WS, pyr(x, z, ah, y3 + 0.5 + 11.5 * t - 0.12, ah - 0.02, y3 + 0.5 + 11.5 * t + 0.12)); }
      bag.add(G, lathe([[0.001, 0], [0.35, 0.1], [0.42, 0.4], [0.3, 0.7], [0.001, 0.8]], 12, null, x, y3 + 11.9, z));
      bag.add(G, box(x - 0.06, y3 + 12.6, z - 0.06, x + 0.06, y3 + 14.2, z + 0.06));
    };
    tower(a[0], a[1], (el.round ?? []).includes(i), false);
    for (let k = 1; k < n; k++) { const t = k / n; if (gate.some((g) => Math.abs(g - t) < 0.08)) continue; tower(a[0] + ux * L * t, a[1] + uz * L * t, false, false); }
    for (const t of gate) tower(a[0] + ux * L * t, a[1] + uz * L * t, false, true);
  }
}
/**
 * izba: { rect, y, foot, seed, front ('x0' | 'x1' | 'z0' | 'z1') } — a Muscovite log house: round-log
 * walls on a low storage storey (podklet), its gable end to the street with the three little windows
 * of the living room in board frames under small pediments, the steep plank roof with the barge
 * boards (prichelina) and the hanging "towel" board, and the ridge log (okhlupen) ending in a horse's head.
 */
function izba(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1);
  const alongX = x1 - x0 >= z1 - z0, front = el.front ?? (alongX ? (rand() < 0.5 ? 'x0' : 'x1') : (rand() < 0.5 ? 'z0' : 'z1'));
  const H = 3.3 + rand() * 0.5, ex = front[0] === 'x', f = el.rect[{ x0: 0, z0: 1, x1: 2, z1: 3 }[front]], sg = front.endsWith('0') ? -1 : 1;
  const u0 = ex ? z0 : x0, u1 = ex ? z1 : x1, um = (u0 + u1) / 2;
  // a box given in the front's frame: u along the face, v up, w out from the face
  const B = (a0, a1, v0, v1, w0, w1) => { const p = f + sg * w0, q = f + sg * w1; return ex ? box(Math.min(p, q), v0, a0, Math.max(p, q), v1, a1) : box(a0, v0, Math.min(p, q), a1, v1, Math.max(p, q)); };
  bag.add(LOG, box(x0, foot, z0, x1, y + H, z1)); col.rect(el.rect, foot, y + H);
  // the street front in round logs, their ends standing out at the corners
  for (let v = foot + 0.14; v < y + H - 0.05; v += 0.27) {
    const a = [ex ? f : u0 - 0.28, v, ex ? u0 - 0.28 : f], b = [ex ? f : u1 + 0.28, v, ex ? u1 + 0.28 : f];
    bag.add(LOG, lathe([[0.145, 0], [0.145, u1 - u0 + 0.56]], 5).rotateZ(ex ? 0 : -Math.PI / 2).rotateX(ex ? Math.PI / 2 : 0).translate(a[0], a[1], a[2]));
  }
  // the windows: board frames standing out from the logs, the dark panes, the pediments and sill boards
  const nw = u1 - u0 > 6.5 ? 3 : 2, wy = y + 1.55;
  for (let k = 0; k < nw; k++) {
    const c = um + (k - (nw - 1) / 2) * 1.35;
    bag.add('timber', B(c - 0.46, c + 0.46, wy - 0.12, wy + 0.82, 0.12, 0.2));
    bag.add('opening', B(c - 0.28, c + 0.28, wy + 0.04, wy + 0.66, 0.2, 0.215));
    bag.add('timber', B(c - 0.56, c + 0.56, wy - 0.24, wy - 0.12, 0.12, 0.26));
    const p = f + sg * 0.12, q = f + sg * 0.24;
    bag.add('timber', ex ? frustum([Math.min(p, q), c - 0.56, Math.max(p, q), c + 0.56], wy + 0.82, wy + 1.18, 0, 0, 0.56, 0.56, { noBottom: true }) : frustum([c - 0.56, Math.min(p, q), c + 0.56, Math.max(p, q)], wy + 0.82, wy + 1.18, 0.56, 0.56, 0, 0, { noBottom: true }));
  }
  // the door in a side wall, under a small lintel
  { const dz = ex ? z0 : z1, ds = ex ? -1 : 1, dx0 = ex ? (front === 'x0' ? x1 - 2.2 : x0 + 1.2) : x0 - 0.05, dc = ex ? dx0 : (front === 'z0' ? z1 - 2.2 : z0 + 1.2);
    if (ex) bag.add('timber', box(dc, y + 0.3, Math.min(dz, dz + ds * 0.08), dc + 0.95, y + 2.2, Math.max(dz, dz + ds * 0.08)));
    else bag.add('timber', box(Math.min(x0, x0 - 0.08), y + 0.3, dc, Math.max(x0, x0 - 0.08), y + 2.2, dc + 0.95)); }
  // the roof: steep planks, the gable in logs, the barge boards and the towel board, the ridge log and its horse's head
  const pitch = 1.05, o = 0.5, yt = y + H + o * pitch, half = (u1 - u0) / 2, yr = pitched(bag, 'planks_grey', LOG, el.rect, yt, pitch, o, !ex, 0.12);
  const P = (u, v, w) => ex ? [f + sg * w, v, u] : [u, v, f + sg * w], wb = o + 0.03;
  for (const [ua, ub] of [[u0 - o, um + 0.1], [u1 + o, um - 0.1]]) bag.add('timber', hexa([P(ua, yt - o * pitch - 0.3, wb), P(ub, yr - 0.3, wb), P(ub, yr - 0.3, wb + 0.07), P(ua, yt - o * pitch - 0.3, wb + 0.07), P(ua, yt - o * pitch + 0.04, wb), P(ub, yr + 0.04, wb), P(ub, yr + 0.04, wb + 0.07), P(ua, yt - o * pitch + 0.04, wb + 0.07)]));
  bag.add('timber', B(um - 0.13, um + 0.13, yr - 1.3, yr - 0.25, wb + 0.07, wb + 0.13));
  const back = -((ex ? x1 - x0 : z1 - z0)) - o;
  bag.add('timber', hexa([P(um - 0.16, yr - 0.08, back), P(um + 0.16, yr - 0.08, back), P(um + 0.16, yr - 0.08, wb + 0.25), P(um - 0.16, yr - 0.08, wb + 0.25), P(um - 0.16, yr + 0.24, back), P(um + 0.16, yr + 0.24, back), P(um + 0.16, yr + 0.24, wb + 0.25), P(um - 0.16, yr + 0.24, wb + 0.25)]));
  bag.add('timber', hexa([P(um - 0.1, yr + 0.05, wb + 0.1), P(um + 0.1, yr + 0.05, wb + 0.1), P(um + 0.1, yr + 0.05, wb + 0.42), P(um - 0.1, yr + 0.05, wb + 0.42), P(um - 0.1, yr + 0.75, wb + 0.32), P(um + 0.1, yr + 0.75, wb + 0.32), P(um + 0.1, yr + 0.75, wb + 0.56), P(um - 0.1, yr + 0.75, wb + 0.56)]));   // the neck
  bag.add('timber', hexa([P(um - 0.09, yr + 0.6, wb + 0.36), P(um + 0.09, yr + 0.6, wb + 0.36), P(um + 0.09, yr + 0.5, wb + 0.82), P(um - 0.09, yr + 0.5, wb + 0.82), P(um - 0.09, yr + 0.86, wb + 0.32), P(um + 0.09, yr + 0.86, wb + 0.32), P(um + 0.09, yr + 0.72, wb + 0.8), P(um - 0.09, yr + 0.72, wb + 0.8)]));   // the head
}
/** lobnoye: { c, r, y } — the round stone platform on the square. */
function lobnoye(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 6.5, y = el.y ?? 0;
  bag.add(WS, lathe([[r, 0], [r, 1.6], [r - 0.4, 1.6], [r - 0.4, 2.4], [r - 0.7, 2.4], [r - 0.7, 1.6], [0.001, 1.6]], 24, null, x, y - 0.3, z)); col.circle(x, z, r, y, y + 1.3); col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], y + 1.3);
}
/** rows: { rect, y, n } — the trading rows: a long range of low timber shops under one plank roof, open on the square. */
function rows(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.n ?? 20;
  bag.add('planks_grey', box(x0, y - 0.4, z0, x1, y + 3, z1)); col.rect(el.rect, y, y + 3);
  const L = z1 - z0;
  for (let i = 0; i < n; i++) { const z = z0 + (i + 0.5) * L / n; bag.add('opening', box(x0 - 0.05, y + 0.3, z - L / n * 0.35, x0, y + 2.4, z + L / n * 0.35)); }
  bag.add('planks_grey', orientedBox([x0 - 1.5, z0], [x0 - 1.5, z1], 2.5, y + 2.6, y + 2.8));
  bag.add('planks_grey', frustum([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], y + 3, y + 5, (x1 - x0) / 2 + 0.3, (x1 - x0) / 2 + 0.3, 0, 0, { noBottom: true, noTop: true }));
}
/**
 * moat: { wallX (fn of z: the wall's line; or line: [[x, z], [x, z]]), d0, d1 (the moat's sides, metres out from the wall), z0, z1, bed,
 * y (fn of x, z: the ground), bridges: [z, …] } — the Alevizov ditch along the wall on the square (1508–16):
 * its sides lined with white stone down to the water, the low brick walls along both edges (1533)
 * with white copings, and at each gate the wooden bridge on its timber trestles, with its railings.
 */
function moat(el, { bag, col }) {
  const L0 = el.line, wx = el.wallX ?? ((z) => L0[0][0] + (L0[1][0] - L0[0][0]) * (z - L0[0][1]) / (L0[1][1] - L0[0][1]));
  const { d0, d1, z0, z1, bed } = el, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, bridges = el.bridges ?? [], bw = el.bw ?? 3.2;
  const X = (d, z) => wx(z) + d;
  const quadPrism = (mat, a, b, c, d, ylo, yhiA, yhiB) => bag.add(mat, hexa([[a[0], ylo, a[1]], [b[0], ylo, b[1]], [c[0], ylo, c[1]], [d[0], ylo, d[1]], [a[0], yhiA, a[1]], [b[0], yhiB, b[1]], [c[0], yhiB, c[1]], [d[0], yhiA, d[1]]]));
  // the two sides, in lengths of about 4 m, stopping where a bridge crosses (its abutments stand there)
  const cuts = bridges.flatMap((zb) => [zb - bw, zb + bw]).sort((p, q) => p - q), spans = [];
  let za = z0;
  for (let i = 0; i < cuts.length; i += 2) { spans.push([za, cuts[i], true]); spans.push([cuts[i], cuts[i + 1], false]); za = cuts[i + 1]; }
  spans.push([za, z1, true]);
  for (const [s0, s1, parapet] of spans) {
    const n = Math.max(1, Math.round((s1 - s0) / 4));
    for (let k = 0; k < n; k++) {
      const a = s0 + (s1 - s0) * k / n, b = s0 + (s1 - s0) * (k + 1) / n;
      for (const [e0, e1] of [[d0 - 0.25, d0 + 0.6], [d1 - 0.6, d1 + 0.25]]) {
        const edge = e0 < d0 ? e0 : e1, ya = yf(X(edge, a), a), yb = yf(X(edge, b), b);
        quadPrism(WS, [X(e0, a), a], [X(e0, b), b], [X(e1, b), b], [X(e1, a), a], bed - 0.4, ya + 0.02, yb + 0.02);       // the white-stone lining
        if (!parapet) continue;
        const m0 = e0 < d0 ? d0 - 0.2 : d1 - 0.4, m1 = m0 + 0.6;
        quadPrism(BR, [X(m0, a), a], [X(m0, b), b], [X(m1, b), b], [X(m1, a), a], Math.min(ya, yb) - 0.1, ya + 1.0, yb + 1.0);
        quadPrism(WS, [X(m0 - 0.06, a), a], [X(m0 - 0.06, b), b], [X(m1 + 0.06, b), b], [X(m1 + 0.06, a), a], Math.min(ya, yb) + 0.9, ya + 1.12, yb + 1.12);
        col.segment([X((m0 + m1) / 2, a), a], [X((m0 + m1) / 2, b), b], 0.6, Math.min(ya, yb) - 0.1, Math.max(ya, yb) + 1.12);
      }
    }
  }
  // the ends of the ditch, walled across
  for (const [zz, sg] of [[z0, -1], [z1, 1]]) {
    const ya = yf(X(d0, zz), zz), yb = yf(X(d1, zz), zz);
    quadPrism(WS, [X(d0 - 0.25, zz), zz], [X(d1 + 0.25, zz), zz], [X(d1 + 0.25, zz + sg * 0.85), zz + sg * 0.85], [X(d0 - 0.25, zz + sg * 0.85), zz + sg * 0.85], bed - 0.4, ya + 0.02, yb + 0.02);
    bag.add(BR, orientedBox([X(d0 - 0.2, zz + sg * 0.4), zz + sg * 0.4], [X(d1 + 0.2, zz + sg * 0.4), zz + sg * 0.4], 0.6, Math.min(ya, yb) - 0.1, Math.max(ya, yb) + 1.0));
    bag.add(WS, orientedBox([X(d0 - 0.26, zz + sg * 0.4), zz + sg * 0.4], [X(d1 + 0.26, zz + sg * 0.4), zz + sg * 0.4], 0.72, Math.max(ya, yb) + 0.9, Math.max(ya, yb) + 1.12));
    col.segment([X(d0, zz + sg * 0.4), zz + sg * 0.4], [X(d1, zz + sg * 0.4), zz + sg * 0.4], 0.6, bed, Math.max(ya, yb) + 1.12);
  }
  // the bridges: a plank deck from the gate tower's mouth across to the square, on trestles standing in the water
  for (const zb of bridges) {
    const da = el.from ?? 5.6, db = d1 + 2.4, xa = X(da, zb), xb = X(db, zb), ya = yf(xa, zb), yb = yf(xb, zb), Y = (x) => ya + (yb - ya) * (x - xa) / (xb - xa);
    const hw = bw - 0.2, t = 0.22;
    bag.add('planks_grey', hexa([[xa, ya - t, zb - hw], [xb, yb - t, zb - hw], [xb, yb - t, zb + hw], [xa, ya - t, zb + hw], [xa, ya + 0.02, zb - hw], [xb, yb + 0.02, zb - hw], [xb, yb + 0.02, zb + hw], [xa, ya + 0.02, zb + hw]]));
    col.ramp([xa, zb - hw, xb, zb + hw], Math.min(ya, yb) + 0.02, Math.max(ya, yb) + 0.02, ya > yb ? 'w' : 'e');
    // the stringers under the planks, and the trestles: four posts, a cap beam, crossed braces, in the water
    for (const zz of [-hw + 0.3, -0.9, 0.9, hw - 0.3]) bag.add('timber', hexa([[xa, ya - t - 0.3, zb + zz - 0.13], [xb, yb - t - 0.3, zb + zz - 0.13], [xb, yb - t - 0.3, zb + zz + 0.13], [xa, ya - t - 0.3, zb + zz + 0.13], [xa, ya - t, zb + zz - 0.13], [xb, yb - t, zb + zz - 0.13], [xb, yb - t, zb + zz + 0.13], [xa, ya - t, zb + zz + 0.13]]));
    const nb = Math.max(2, Math.round((d1 - d0 - 1.2) / 3.3));
    for (let k = 0; k <= nb; k++) {
      const x = X(d0 + 0.6 + 0.3 + k * (d1 - d0 - 1.8) / nb, zb), yt = Y(x) - t - 0.3;
      for (const zz of [-hw + 0.3, -0.9, 0.9, hw - 0.3]) bag.add('timber', lathe([[0.16, 0], [0.16, yt - bed + 0.4], [0.001, yt - bed + 0.4]], 8, null, x, bed - 0.4, zb + zz));
      bag.add('timber', box(x - 0.17, yt - 0.3, zb - hw - 0.05, x + 0.17, yt, zb + hw + 0.05));
      for (const [p, q] of [[[x, bed + 0.5, zb - hw + 0.3], [x, yt - 0.3, zb + hw - 0.3]], [[x, yt - 0.3, zb - hw + 0.3], [x, bed + 0.5, zb + hw - 0.3]]]) bag.add('timber', beamBox(p, q, 0.1, 0.18));
    }
    // the railings: posts with a top rail and a mid rail on both sides
    for (const sg of [-1, 1]) {
      const zr = zb + sg * (hw - 0.08), np = Math.round((xb - xa) / 2);
      for (let k = 0; k <= np; k++) { const x = xa + (xb - xa) * k / np; bag.add('timber', box(x - 0.08, Y(x), zr - 0.08, x + 0.08, Y(x) + 1.15, zr + 0.08)); }
      for (const hh of [0.55, 1.05]) bag.add('timber', hexa([[xa, ya + hh, zr - 0.06], [xb, yb + hh, zr - 0.06], [xb, yb + hh, zr + 0.06], [xa, ya + hh, zr + 0.06], [xa, ya + hh + 0.1, zr - 0.06], [xb, yb + hh + 0.1, zr - 0.06], [xb, yb + hh + 0.1, zr + 0.06], [xa, ya + hh + 0.1, zr + 0.06]]));
      col.segment([xa, zr], [xb, zr], 0.16, Math.min(ya, yb), Math.max(ya, yb) + 1.15);
    }
  }
}
/** A squared timber between two points (w across, h deep). */
function beamBox(a, b, w, h) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), n = d.map((v) => v / L);
  let sx = -n[2], sz = n[0], sl = Math.hypot(sx, sz); if (sl < 1e-3) { sx = 1; sz = 0; sl = 1; }
  const side = [sx / sl, 0, sz / sl], up = [side[1] * n[2] - side[2] * n[1], side[2] * n[0] - side[0] * n[2], side[0] * n[1] - side[1] * n[0]];
  const P = (o, p, q) => [o[0] + side[0] * p * w / 2 + up[0] * q * h / 2, o[1] + side[1] * p * w / 2 + up[1] * q * h / 2, o[2] + side[2] * p * w / 2 + up[2] * q * h / 2];
  return hexa([P(a, -1, -1), P(a, 1, -1), P(a, 1, 1), P(a, -1, 1), P(b, -1, -1), P(b, 1, -1), P(b, 1, 1), P(b, -1, 1)]);
}
registerStyle('muscovite', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.norse.elements, russian_church: russianChurch, bell_tower: bellTower, pokrov, kremlin_wall: kremlinWall, izba, lobnoye, rows, moat },
  objects: {},
});
