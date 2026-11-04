// New York Art Deco and Beaux-Arts (1900s–1930s; docs/settlements/new-york.md §4): towers of steel
// clad in limestone and brick that step back as they rise under the zoning law of 1916; the Empire
// State Building's setbacks, shaft and mooring mast; the Chrysler Building's stainless crown of
// sunbursts and its spire; the Beaux-Arts of Grand Central and the Public Library; loft buildings
// with water tanks on their roofs; the steel viaduct of the elevated railway.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const LS = 'facade_limestone', CH = 'steel_chrome';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const block = (bag, mat, [x0, z0, x1, z1], y0, y1) => bag.add(mat, box(x0, y0, z0, x1, y1, z1));
const inset = ([x0, z0, x1, z1], ix, iz = ix) => [x0 + ix, z0 + iz, x1 - ix, z1 - iz];
/** A water tank on its stilts, the New York roof's mark. */
function tank(bag, x, y, z, r = 2.2) {
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('iron', box(x + dx * r * 0.6 - 0.1, y, z + dz * r * 0.6 - 0.1, x + dx * r * 0.6 + 0.1, y + 3, z + dz * r * 0.6 + 0.1));
  bag.add('timber', lathe([[r, 0], [r, 4], [0.001, 4]], 12, null, x, y + 3, z));
  bag.add('timber', lathe([[r + 0.1, 0], [0.001, 1.3]], 12, null, x, y + 7, z));
}
/** skyscraper: { rect, y, h, mat, seed } — a block that steps back as it rises when tall; a cornice or a crown; a tank on lower roofs. */
function skyscraper(el, { bag, col }) {
  const rand = rng(el.seed || 1), y = el.y ?? 0, h = el.h ?? 40, mat = el.mat ?? LS;
  let r = el.rect;
  col.rect(r, y - 0.5, y + h);
  if (h < 70) {
    block(bag, mat, r, y - 0.5, y + h);
    block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 4.5);
    block(bag, mat, inset(r, -0.5), y + h - 0.2, y + h + 0.8);
    if (rand() < 0.4) tank(bag, (r[0] + r[2]) / 2 + (rand() - 0.5) * 4, y + h + 0.8, (r[1] + r[3]) / 2 + (rand() - 0.5) * 4);
    return;
  }
  // the setbacks: base, tower, top stage
  const base = 25 + rand() * 20, w = r[2] - r[0], d = r[3] - r[1];
  block(bag, mat, r, y - 0.5, y + base); block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 5);
  let yy = y + base;
  const steps = h > 150 ? 3 : 2;
  for (let s = 0; s < steps; s++) {
    const f = s === steps - 1 ? 1 : 0.55 + s * 0.25, top = y + h * f, k = 0.12 + s * 0.08;
    r = inset(r, w * k / 1.3, d * k / 1.3);
    if (r[2] - r[0] < 6 || r[3] - r[1] < 6) break;
    block(bag, mat, r, yy - 0.3, top); yy = top;
  }
  if (h > 150) { const c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], s0 = Math.min(r[2] - r[0], r[3] - r[1]) / 2; bag.add(rand() < 0.5 ? 'lead' : mat, frustum([c[0] - s0, c[1] - s0, c[0] + s0, c[1] + s0], yy, yy + s0 * 1.4, s0 * 0.9, s0 * 0.9, s0 * 0.9, s0 * 0.9, { noBottom: true })); }
  else block(bag, mat, inset(r, -0.4), yy - 0.2, yy + 0.8);
}
/** empire_state: { rect (the full lot), y } — the five-storey base, the setbacks, the shaft with its piers, the 86th-floor observatory and the mooring mast to 381 m. */
function empireState(el, { bag, col }) {
  const r = el.rect, y = el.y ?? 0, cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, W = r[2] - r[0], D = r[3] - r[1];
  const stage = (hw, hd, y0, y1) => { const q = [cx - hw, cz - hd, cx + hw, cz + hd]; block(bag, LS, q, y + y0, y + y1); return q; };
  block(bag, LS, r, y - 0.5, y + 22); block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 6); col.rect(r, y - 0.5, y + 22); col.floor(r, y + 22);
  bag.add('opening', box(r[2] - 0.05, y, cz - 4, r[2] + 0.05, y + 9, cz + 4));          // the 5th Avenue entrance
  stage(W / 2 - 12, D / 2 - 5, 22, 88);
  stage(W / 2 - 20, D / 2 - 7, 88, 104);
  const shaft = stage(30, 17, 104, 268);
  // the piers of chrome-nickel steel running up the shaft between the window columns
  for (let i = 0; i <= 12; i++) { const x = shaft[0] + i * 60 / 12; for (const z of [shaft[1] - 0.15, shaft[3] - 0.05]) bag.add(CH, box(x - 0.25, y + 104, z, x + 0.25, y + 268, z + 0.2)); }
  for (let i = 0; i <= 7; i++) { const z = shaft[1] + i * 34 / 7; for (const x of [shaft[0] - 0.15, shaft[2] - 0.05]) bag.add(CH, box(x, y + 104, z - 0.25, x + 0.2, y + 268, z + 0.25)); }
  stage(22, 13, 268, 296);
  stage(15, 10, 296, 312);
  stage(10, 8, 312, 320);                                                                 // the 86th-floor observatory
  bag.add(CH, lathe([[7, 0], [6.5, 6], [5, 8], [5, 30], [3.5, 34], [2.8, 48], [1.6, 54], [0.6, 60], [0.001, 61]], 8, null, cx, y + 320, cz));
}
/** chrysler: { rect, y } — the base, the tower with its eagles, the stainless crown of seven tiers of sunbursts with triangular windows, the spire to 319 m. */
function chrysler(el, { bag, col }) {
  const r = el.rect, y = el.y ?? 0, cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
  block(bag, 'facade_grey', r, y - 0.5, y + 60); block(bag, 'granite_black', inset(r, -0.15), y - 0.5, y + 6); col.rect(r, y - 0.5, y + 60); col.floor(r, y + 60);
  const t1 = [cx - 18, cz - 18, cx + 18, cz + 18];
  block(bag, 'facade_grey', t1, y + 60, y + 120);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(CH, box(cx + dx * 18 - 1.2, y + 118, cz + dz * 18 - 1.2, cx + dx * 18 + 1.2, y + 121, cz + dz * 18 + 1.2));   // the radiator caps
  const t2 = [cx - 15, cz - 15, cx + 15, cz + 15];
  block(bag, 'facade_grey', t2, y + 120, y + 240);
  for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const g = box(-0.8, -0.8, 0, 0.8, 0.8, 4.5); g.rotateY(Math.atan2(dx, dz)); g.translate(cx + dx * 15, y + 238, cz + dz * 15); bag.add(CH, g); }   // the eagles
  // the crown: seven diminishing tiers, each a ring of sunburst arches
  let s = 13, yy = y + 240;
  for (let k = 0; k < 7; k++) {
    const hgt = 6.5 - k * 0.4;
    const g = lathe([[s * Math.SQRT2, 0], [s * Math.SQRT2, hgt * 0.4], [s * 0.86 * Math.SQRT2, hgt], [0.001, hgt]], 4); g.rotateY(Math.PI / 4); g.translate(cx, yy, cz); bag.add(CH, g);
    for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; for (let j = -2; j <= 2; j++) { const u = j * s * 0.28, px = cx + Math.cos(a) * s * 0.75 - Math.sin(a) * u, pz = cz + Math.sin(a) * s * 0.75 + Math.cos(a) * u; bag.add('glass_lamp', box(px - 0.35, yy + hgt * 0.35, pz - 0.35, px + 0.35, yy + hgt * 0.75, pz + 0.35)); } }
    yy += hgt; s *= 0.8;
  }
  bag.add(CH, lathe([[s, 0], [1.2, 6], [0.4, 22], [0.001, 319 - (yy - y)]], 8, null, cx, yy, cz));
}
/** beaux_arts: { rect, y, h, front ('n'|'s'|'e'|'w'), arches (count), cols (count), mat, attic } — a terminal or library: the rusticated block, the front of columns or great arched windows, the attic. */
function beauxArts(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 28, mat = el.mat ?? 'limestone', f = el.front ?? 's';
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.5, y + h); col.floor(el.rect, y + h);
  bag.add(mat, box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 1.5, z1 + 0.6));
  if (el.attic) bag.add(mat, box(x0 + 3, y + h + 1.5, z0 + 3, x1 - 3, y + h + 6, z1 - 3));
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, face = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  const put = (u0, u1, v0, v1, m, dd = 0.06) => { const q = along ? [a0 + u0, face - (sg < 0 ? dd : 0), a0 + u1, face + (sg > 0 ? dd : 0)] : [face - (sg < 0 ? dd : 0), a0 + u0, face + (sg > 0 ? dd : 0), a0 + u1]; bag.add(m, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
  const na = el.arches ?? 0;
  for (let i = 0; i < na; i++) { const u = L / 2 + (i - (na - 1) / 2) * L * 0.22; put(u - L * 0.08, u + L * 0.08, h * 0.2, h * 0.85, 'opening'); }
  const nc = el.cols ?? 0;
  for (let i = 0; i < nc; i++) { const u = L * 0.25 + i * L * 0.5 / Math.max(1, nc - 1), p = along ? [a0 + u, face + sg * 1.6] : [face + sg * 1.6, a0 + u]; bag.add(mat, lathe([[0.75, 0], [0.75, 0.5], [0.6, 0.8], [0.55, h * 0.62], [0.8, h * 0.66], [0.8, h * 0.7]], 12, null, p[0], y + h * 0.18, p[1])); }
  if (nc) put(L * 0.22, L * 0.78, h * 0.88, h * 0.95, mat, 2.2);
  put(L * 0.2, L * 0.8, -0.5, h * 0.18, mat, 3.5);                                            // the steps or the base
}
/** el_track: { x, z0, z1, y } — the elevated railway: a steel deck on bents every 15 m, the rails. */
function elTrack(el, { bag, col }) {
  const x = el.x, z0 = el.z0, z1 = el.z1, y = el.y ?? 0, w = 9, H = 9;
  for (let z = z0; z <= z1; z += 15) for (const dx of [-w / 2 + 0.6, w / 2 - 0.6]) { bag.add('iron', box(x + dx - 0.25, y - 0.3, z - 0.25, x + dx + 0.25, y + H, z + 0.25)); col.rect([x + dx - 0.25, z - 0.25, x + dx + 0.25, z + 0.25], y, y + H); }
  bag.add('iron', box(x - w / 2, y + H, z0, x + w / 2, y + H + 1.1, z1));
  for (const dx of [-2.4, -1, 1, 2.4]) bag.add(CH, box(x + dx - 0.05, y + H + 1.1, z0, x + dx + 0.05, y + H + 1.25, z1));
}
/** park: { rect, y } — a level lawn with paths (the trees come from the ground's planting). */
function park(el, { bag }) { const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0; bag.add('granite_grey', box(x0, y - 0.3, z0, x1, y + 0.25, z0 + 1.5)); bag.add('granite_grey', box(x0, y - 0.3, z1 - 1.5, x1, y + 0.25, z1)); }
registerStyle('artdeco', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, skyscraper, empire_state: empireState, chrysler, beaux_arts: beauxArts, el_track: elTrack, park },
  objects: {},
});
