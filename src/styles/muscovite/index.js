// Muscovite (15th–16th c.; docs/settlements/muscovy.md §4): the Kremlin's red-brick walls with
// swallowtail merlons and their towers (round at the corners); the cross-domed cathedrals of white
// stone with their zakomary and five drums under helmet domes; Ivan the Great's bell tower in
// stacked octagons; St Basil's — the central tented church among eight chapels with onion domes on a
// raised gallery; the log houses of the posad under plank roofs.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';
import '../norse/index.js';

const BR = 'brick_kremlin', WS = 'limestone', G = 'gilt_bronze';
/** An onion dome of radius r on its drum (drum height dh) at (x, y, z); a cross on top. */
function onion(bag, x, y, z, r, dh, mat, drum = BR) {
  bag.add(drum, lathe([[r * 0.8, 0], [r * 0.8, dh], [r * 0.9, dh + 0.3], [0.001, dh + 0.3]], 12, null, x, y, z));
  bag.add(mat, lathe([[r * 0.85, 0], [r * 1.15, r * 0.55], [r * 1.1, r * 0.95], [r * 0.7, r * 1.45], [r * 0.2, r * 1.95], [0.06, r * 2.3], [0.001, r * 2.3]], 16, null, x, y + dh + 0.3, z));
  const top = y + dh + 0.3 + r * 2.3;
  bag.add(G, box(x - 0.06, top, z - 0.06, x + 0.06, top + r * 0.9 + 0.5, z + 0.06));
  bag.add(G, box(x - r * 0.25 - 0.1, top + r * 0.55, z - 0.05, x + r * 0.25 + 0.1, top + r * 0.62 + 0.05, z + 0.05));
}
/** A helmet dome (shlem) — the older, flatter Muscovite dome. */
function helmet(bag, x, y, z, r, dh, mat, drum = WS) {
  bag.add(drum, lathe([[r, 0], [r, dh], [r * 1.05, dh + 0.3], [0.001, dh + 0.3]], 16, null, x, y, z));
  bag.add(mat, lathe([[r, 0], [r * 0.98, r * 0.55], [r * 0.7, r * 1.05], [r * 0.25, r * 1.4], [0.06, r * 1.65], [0.001, r * 1.65]], 16, null, x, y + dh + 0.3, z));
  const top = y + dh + 0.3 + r * 1.65;
  bag.add(G, box(x - 0.08, top, z - 0.08, x + 0.08, top + r * 0.7 + 0.5, z + 0.08));
}
/** russian_church: { rect, h, y, domes: [[x, z, r, dh]], mat, dome (material), apses (count, on the east) } — a cross-domed church with zakomary arches along its tops. */
function russianChurch(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 20, y = el.y ?? 0, mat = el.mat ?? WS, dm = el.dome ?? G;
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  // the zakomary: round-topped gables along each side
  for (const [a, b, zz, along] of [[x0, x1, z0, true], [x0, x1, z1, true], [z0, z1, x0, false], [z0, z1, x1, false]]) {
    const n = 4, L = (b - a) / n;
    for (let i = 0; i < n; i++) { const m = a + (i + 0.5) * L, r = L / 2 - 0.2; const g = lathe([[r, 0], [r * 0.7, r * 0.7], [0.001, r]], 8, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.scale(1, 1, 0.12); if (!along) g.rotateY(Math.PI / 2); g.translate(along ? m : zz, y + h, along ? zz : m); bag.add(mat, g); }
  }
  bag.add('lead', box(x0 + 0.5, y + h, z0 + 0.5, x1 - 0.5, y + h + 1.2, z1 - 0.5));
  for (let k = 0; k < (el.apses ?? 3); k++) { const n = el.apses ?? 3, z = z0 + (k + 0.5) * (z1 - z0) / n, r = Math.min((z1 - z0) / n / 2 - 0.3, 4.5); bag.add(mat, lathe([[r, 0], [r, h * 0.75], [0.001, h * 0.75]], 16, null, x1, y - 0.5, z)); col.circle(x1, z, r, y, y + h * 0.75); }
  for (const [dx, dz, r, dh] of el.domes ?? []) helmet(bag, dx, y + h + 1.2, dz, r, dh, dm, mat);
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
/** pokrov: { c, y, s } — St Basil's: the raised gallery, the central tented church, four great and four small chapels with onion domes. */
function pokrov(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, P = 4 * s;
  bag.add(BR, box(cx - 21 * s, y - 0.5, cz - 21 * s, cx + 21 * s, y + P, cz + 21 * s)); col.rect([cx - 21 * s, cz - 21 * s, cx + 21 * s, cz + 21 * s], y, y + P); col.floor([cx - 21 * s, cz - 21 * s, cx + 21 * s, cz + 21 * s], y + P);
  for (const f of [-1, 1]) for (let k = -3; k <= 3; k++) { bag.add('opening', box(cx + k * 5 * s - 1, y + 0.8, cz + f * 21 * s - 0.04, cx + k * 5 * s + 1, y + P - 0.8, cz + f * 21 * s + 0.04)); bag.add('opening', box(cx + f * 21 * s - 0.04, y + 0.8, cz + k * 5 * s - 1, cx + f * 21 * s + 0.04, y + P - 0.8, cz + k * 5 * s + 1)); }
  const yb = y + P;
  // the central church: an octagon, its kokoshnik tiers, the tall tent and its small onion
  bag.add(BR, lathe([[7.5 * s, 0], [7.5 * s, 20 * s], [8 * s, 20.5 * s], [6.5 * s, 21 * s], [6.5 * s, 25 * s], [0.001, 25 * s]], 8, null, cx, yb, cz)); col.circle(cx, cz, 7.5 * s, yb, yb + 20 * s);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add(WS, orientedBox([cx + Math.cos(a) * 7.6 * s, cz + Math.sin(a) * 7.6 * s], [cx + Math.cos(a + Math.PI / 4) * 7.6 * s, cz + Math.sin(a + Math.PI / 4) * 7.6 * s], 0.25, yb + 20 * s, yb + 20.5 * s)); }
  bag.add(BR, lathe([[6.2 * s, 0], [1.4 * s, 18 * s], [0.001, 18 * s]], 8, null, cx, yb + 25 * s, cz));
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; for (const t of [0.15, 0.45, 0.75]) { const r = 6.2 * s * (1 - t) + 1.4 * s * t; bag.add(WS, box(cx + Math.cos(a) * r - 0.15, yb + 25 * s + 18 * s * t - 0.15, cz + Math.sin(a) * r - 0.15, cx + Math.cos(a) * r + 0.15, yb + 25 * s + 18 * s * t + 0.15, cz + Math.sin(a) * r + 0.15)); } }
  onion(bag, cx, yb + 43 * s, cz, 1.4 * s, 1.5 * s, G);
  // the four great chapels on the axes, the four small ones on the diagonals
  const mats = ['tile_green', G, 'tile_green', G, G, 'tile_green', G, 'tile_green'];
  for (let k = 0; k < 8; k++) {
    const big = k % 2 === 0, a = k / 8 * Math.PI * 2 + Math.PI / 2, d = (big ? 14 : 12) * s, r = (big ? 4.6 : 3) * s, h = (big ? 15 : 11) * s;
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    bag.add(BR, lathe([[r, 0], [r, h], [r + 0.3, h + 0.3], [r * 0.85, h + 0.6], [r * 0.85, h + 2.5 * s], [0.001, h + 2.5 * s]], big ? 8 : 12, null, x, yb, z)); col.circle(x, z, r, yb, yb + h);
    onion(bag, x, yb + h + 2.5 * s, z, (big ? 2.4 : 1.8) * s, (big ? 3 : 2.2) * s, mats[k]);
  }
  // the stairs up to the gallery (north and west)
  bag.add(BR, box(cx - 24 * s, y - 0.5, cz - 3 * s, cx - 21 * s, y + P * 0.5, cz + 3 * s));
}
/** kremlin_wall: { pts (closed polygon), h, th, y (fn of x, z), every (tower spacing), round (indices of round corner towers), gates: [[i, t]] } */
function kremlinWall(el, { bag, col }) {
  const pts = el.pts, h = el.h ?? 12, th = el.th ?? 4, yf = el.y ?? (() => 0), every = el.every ?? 55, gates = el.gates ?? [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.round(L / every));
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
        const ml = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), nm = Math.floor(ml / 2.2);
        for (let q = 0; q < nm; q++) { const c0 = (q + 0.2) / nm, c1 = (q + 0.75) / nm; const qa = [pa[0] + (pb[0] - pa[0]) * c0 - uz * th * 0.4, pa[1] + (pb[1] - pa[1]) * c0 + ux * th * 0.4], qb = [pa[0] + (pb[0] - pa[0]) * c1 - uz * th * 0.4, pa[1] + (pb[1] - pa[1]) * c1 + ux * th * 0.4]; bag.add(BR, orientedBox(qa, qb, 0.7, yy + h, yy + h + 2.2)); bag.add(BR, orientedBox([qa[0] + (qb[0] - qa[0]) * 0.4, qa[1] + (qb[1] - qa[1]) * 0.4], [qa[0] + (qb[0] - qa[0]) * 0.6, qa[1] + (qb[1] - qa[1]) * 0.6], 0.72, yy + h + 1.5, yy + h + 2.25)); }
      }
    }
    // towers: at the corner (round where asked) and along the side; gate towers taller
    const tower = (x, z, round, tall) => {
      const yy = yf(x, z), r = round ? 7 : 5.5, H = tall ? h + 22 : h + 8;
      if (round) { bag.add(BR, lathe([[r + 0.8, 0], [r, 4], [r, H], [r + 0.6, H + 0.4], [r + 0.6, H + 2], [0.001, H + 2]], 16, null, x, yy - 3, z)); col.circle(x, z, r + 0.8, yy - 3, yy - 3 + H); }
      else { bag.add(BR, box(x - r, yy - 3, z - r, x + r, yy - 3 + H, z + r)); col.rect([x - r, z - r, x + r, z + r], yy - 3, yy - 3 + H); bag.add(BR, box(x - r - 0.5, yy - 3 + H, z - r - 0.5, x + r + 0.5, yy - 1.5 + H, z + r + 0.5)); }
      if (tall) { bag.add(BR, box(x - r * 0.65, yy - 3 + H, z - r * 0.65, x + r * 0.65, yy + 4 + H, z + r * 0.65)); bag.add('opening', box(x - r - 0.04, yy - 3, z - 2.4, x + r + 0.04, yy + 4, z + 2.4)); }
    };
    tower(a[0], a[1], (el.round ?? []).includes(i), false);
    for (let k = 1; k < n; k++) { const t = k / n; if (gate.some((g) => Math.abs(g - t) < 0.08)) continue; tower(a[0] + ux * L * t, a[1] + uz * L * t, false, false); }
    for (const t of gate) tower(a[0] + ux * L * t, a[1] + uz * L * t, false, true);
  }
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
registerStyle('muscovite', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.norse.elements, russian_church: russianChurch, bell_tower: bellTower, pokrov, kremlin_wall: kremlinWall, lobnoye, rows },
  objects: {},
});
