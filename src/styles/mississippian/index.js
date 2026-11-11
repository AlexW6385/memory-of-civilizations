// Mississippian (11th–12th c.; docs/settlements/cahokia.md §4): earthen platform mounds (built in the
// ground itself) carrying buildings of poles set in wall trenches, plastered with clay and thatched
// with grass; the chief's great house on Monks Mound; the palisade of logs with its bastions; the
// woodhenge of red cedar posts; the houses of the town round their courtyards.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { Matrix4 } from '../../core/three.js';
import '../qing/index.js';

import { WALL, TH, rng, tri, thatchHip, doorway } from './kit.js';
import { neighbourhoodElements } from './neighbourhood.js';
import { chiefHall } from './hall.js';
/**
 * great_house: { rect, y, h, rise, post (a great post before the door: [x, z]) } — a large
 * building of posts set in wall trenches, daubed with clay: the walls, a tall hipped roof of thatch
 * in courses with its ridge roll and carved posts at the ridge's ends, the door on the south.
 */
function greatHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4, rise = el.rise ?? 10;
  bag.add(WALL, box(x0, y - 0.6, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.6, y + h);
  // the wall plate under the eaves
  bag.add('timber', box(x0 - 0.12, y + h - 0.34, z0 - 0.12, x1 + 0.12, y + h - 0.05, z1 + 0.12));
  const { a, b } = thatchHip(bag, el.rect, y + h - 0.1, rise, Math.min(1.1, 0.06 * (x1 - x0 + z1 - z0)), Math.max(4, Math.round(rise / 1.6)));
  // the carved posts standing at the ridge's ends
  for (const p of [a, b]) {
    bag.add('timber_red', rod([p[0], p[1] - 1.2, p[2]], [p[0], p[1] + 2.0, p[2]], 0.16, 8));
    bag.add('timber_red', lathe([[0.001, 0], [0.26, 0.08], [0.3, 0.3], [0.2, 0.5], [0.001, 0.62]], 8, null, p[0], p[1] + 2.0, p[2]));
  }
  doorway(bag, (x0 + x1) / 2, z1, y, 1, 1.0, 2.2);
  if (el.post) { const [px, pz] = el.post; bag.add('timber_red', lathe([[0.5, 0], [0.46, 9], [0.36, 9.6], [0.001, 9.8]], 12, null, px, y - 0.8, pz)); col.circle(px, pz, 0.5, y, y + 9); }
}
/** house: { rect, y, foot, seed } — a wall-trench house: low clay walls, a steep thatched hip or gable, a doorway. */
function house(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1);
  if (el.open) return openHouse(el, ctx);
  bag.add(WALL, box(x0, foot, z0, x1, y + 2, z1)); col.rect(el.rect, foot, y + 2);
  // earth banked against the foot of the walls [stated: "dirt banked along woven mat walls" — Illinois State Museum]
  bag.add('silt', frustum([x0 - 0.45, z0 - 0.45, x1 + 0.45, z1 + 0.45], foot, y + 0.32, 0.45, 0.45, 0.45, 0.45));
  const along = (x1 - x0) >= (z1 - z0), rise = 2.6 + rand() * 1.2, o = 0.4;
  if (rand() < 0.5) thatchHip(bag, el.rect, y + 2, rise, o + 0.1, 3);
  else {
    const r = [x0 - o, z0 - o, x1 + o, z1 + o];
    if (along) { const hz = (z1 - z0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, 0, 0, hz, hz, { noTop: true })); bag.add(TH, rod([x0 - o - 0.1, y + 2 + rise + 0.04, (z0 + z1) / 2], [x1 + o + 0.1, y + 2 + rise + 0.04, (z0 + z1) / 2], 0.2, 7)); }
    else { const hx = (x1 - x0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, hx, hx, 0, 0, { noTop: true })); bag.add(TH, rod([(x0 + x1) / 2, y + 2 + rise + 0.04, z0 - o - 0.1], [(x0 + x1) / 2, y + 2 + rise + 0.04, z1 + o + 0.1], 0.2, 7)); }
  }
  const f = el.door ? (el.door === 'n' ? z0 : z1) : rand() < 0.5 ? z0 : z1, sg = f === z0 ? -1 : 1, mx = (x0 + x1) / 2;
  bag.add('opening', box(mx - 0.4, y, f + sg * 0.01, mx + 0.4, y + 1.5, f + sg * 0.05));
  // the door posts and the lintel pole across them
  const z0d = Math.min(f, f + sg * 0.16), z1d = Math.max(f, f + sg * 0.16);
  for (const sd of [-1, 1]) bag.add('timber', box(mx + sd * 0.48 - 0.07, foot, z0d, mx + sd * 0.48 + 0.07, y + 1.72, z1d));
  bag.add('timber', box(mx - 0.68, y + 1.58, z0d - 0.005, mx + 0.68, y + 1.74, z1d + 0.005));
}
/**
 * A house opened and furnished (house with open: true; docs/settlements/cahokia.md §5.1): "a
 * four-sided, partially subterranean structure with dirt banked along woven mat walls and a steeply
 * pitched thatch roof"; inside "a number of storage pits"; "When it was present, the central hearth
 * was the focus of much activity, particularly in the winter" [stated: Illinois State Museum,
 * RiverWeb]; jars to store and cook in, bowls and plates of Powell Plain to eat from [stated:
 * Illinois State Museum, "Ceramic function"]. Built: the floor of beaten earth (not dug in: the ground here cannot be cut), the walls'
 * inside faced with mats, rafters under the thatch; a clay hearth in the middle with its fire; a
 * storage pit in a corner, a mat over half of it; a bench of poles and cane along the back wall with
 * hides and a robe on it; jars, bowls and a plate; baskets; a hoe of chert; a log mortar and its
 * pestle; maize hung from the rafters; the doorway toward the plaza, made a man's height [inferred:
 * the bench, the mortar and the arrangement after Southeastern practice].
 */
function openHouse(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1), t = 0.16, F = y + 0.04, top = y + 2.2;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, dw = 0.85, dh = 1.95;
  // the walls, the doorway in the south wall (toward the plaza)
  const W = [[x0, z0, x1, z0 + t], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t], [x0, z1 - t, cx - dw / 2, z1], [cx + dw / 2, z1 - t, x1, z1]];
  for (const r of W) { bag.add(WALL, box(r[0], foot, r[1], r[2], top, r[3])); col.rect(r, foot, top); }
  bag.add(WALL, box(cx - dw / 2, F + dh, z1 - t, cx + dw / 2, top, z1)); col.rect([cx - dw / 2, z1 - t, cx + dw / 2, z1], F + dh, top);
  // the earth banked outside, broken at the door
  for (const [r, ins] of [[[x0 - 0.45, z0 - 0.45, x1 + 0.45, z0], [0.45, 0.45, 0.45, 0]], [[x0 - 0.45, z0, x0, z1], [0.45, 0, 0, 0]], [[x1, z0, x1 + 0.45, z1], [0, 0.45, 0, 0]],
    [[x0 - 0.45, z1, cx - dw / 2 - 0.3, z1 + 0.45], [0.45, 0.3, 0, 0.45]], [[cx + dw / 2 + 0.3, z1, x1 + 0.45, z1 + 0.45], [0.3, 0.45, 0, 0.45]]]) bag.add('silt', frustum(r, foot, y + 0.32, ...ins));
  // the door frame: two posts, the lintel pole, the clay step down to the floor
  for (const sd of [-1, 1]) bag.add('timber', box(cx + sd * (dw / 2 + 0.07) - 0.07, foot, z1 - 0.02, cx + sd * (dw / 2 + 0.07) + 0.07, F + dh + 0.12, z1 + 0.14));
  bag.add('timber', box(cx - dw / 2 - 0.2, F + dh, z1 - 0.025, cx + dw / 2 + 0.2, F + dh + 0.14, z1 + 0.145));
  bag.add(WALL, box(cx - dw / 2, foot, z1 - t, cx + dw / 2, F, z1 + 0.5)); col.floor([cx - dw / 2, z1 - t, cx + dw / 2, z1 + 0.5], F);
  // the floor of beaten earth, dug in; the mats lining the walls inside
  bag.add('earth_wall', box(x0 + t, foot - 0.1, z0 + t, x1 - t, F, z1 - t)); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], F);
  const M = 0.02;
  for (const r of [[x0 + t, z0 + t, x1 - t, z0 + t + M], [x0 + t, z0 + t + M, x0 + t + M, z1 - t - M], [x1 - t - M, z0 + t + M, x1 - t, z1 - t - M], [x0 + t, z1 - t - M, cx - dw / 2, z1 - t], [cx + dw / 2, z1 - t - M, x1 - t, z1 - t]]) bag.add('reed_mat', box(r[0], F, r[1], r[2], top - 0.02, r[3]));
  // the roof: thatch in courses, its underside the ceiling; rafters of poles under it
  thatchHip(bag, el.rect, top, 2.8 + rand() * 0.8, 0.5, 3);
  const along = x1 - x0 >= z1 - z0;
  for (let k = 0; k < 7; k++) {
    const f = (k + 0.5) / 7;
    if (along) { const x = x0 + t + (x1 - x0 - 2 * t) * f; bag.add('timber', rod([x, top - 0.07, z0 + t + 0.05], [x, top - 0.07, z1 - t - 0.05], 0.05, 6)); }
    else { const z = z0 + t + (z1 - z0 - 2 * t) * f; bag.add('timber', rod([x0 + t + 0.05, top - 0.07, z], [x1 - t - 0.05, top - 0.07, z], 0.05, 6)); }
  }
  // the hearth: a basin of clay, the ash, embers and fire
  const hx = cx, hz = cz + 0.15;
  bag.add(WALL, lathe([[0.5, 0], [0.5, 0.07], [0.42, 0.09], [0.4, 0.03], [0.001, 0.03]], 16, null, hx, F, hz));
  bag.add('opening', lathe([[0.39, 0], [0.001, 0.005]], 12, null, hx, F + 0.035, hz));
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.2; bag.add('bark_dark', rod([hx + Math.cos(a) * 0.36, F + 0.06, hz + Math.sin(a) * 0.36], [hx + Math.cos(a) * 0.04, F + 0.1, hz + Math.sin(a) * 0.04], 0.03, 5)); }
  bag.add('flame', lathe([[0.1, 0], [0.08, 0.08], [0.04, 0.2], [0.001, 0.3]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), hx, F + 0.06, hz));
  col.circle(hx, hz, 0.5, F, F + 0.1);
  if (lights) lights.push({ at: [hx, F + 0.5, hz], color: '#ff9a4a', intensity: 3, distance: 6 });
  // the bench along the back (north) wall: posts, rails, a deck of split cane, hides and a robe on it
  const bz0 = z0 + t + M, bz1 = bz0 + 0.85, bx0 = x0 + t + 0.25, bx1 = x1 - t - 0.25, bh = 0.45;
  for (const x of [bx0 + 0.1, (bx0 + bx1) / 2, bx1 - 0.1]) for (const z of [bz0 + 0.08, bz1 - 0.08]) bag.add('timber', rod([x, F - 0.05, z], [x, F + bh, z], 0.04, 6));
  for (const z of [bz0 + 0.08, bz1 - 0.08]) bag.add('timber', rod([bx0, F + bh - 0.03, z], [bx1, F + bh - 0.03, z], 0.045, 6));
  bag.add('reed_mat', box(bx0, F + bh, bz0, bx1, F + bh + 0.04, bz1));
  col.rect([bx0, bz0, bx1, bz1], F, F + bh + 0.04);
  bag.add('hide_tan', box(bx0 + 0.15, F + bh + 0.04, bz0 + 0.08, bx0 + 1.6, F + bh + 0.065, bz1 - 0.05));
  bag.add('hide_brown', rod([bx1 - 1.3, F + bh + 0.16, bz0 + 0.35], [bx1 - 0.2, F + bh + 0.16, bz0 + 0.35], 0.12, 9));
  // the storage pit in the south-west corner, a mat over half of it
  const px = x0 + t + 0.65, pz = z1 - t - 0.75;
  bag.add(WALL, lathe([[0.48, 0], [0.48, 0.04], [0.4, 0.05], [0.001, 0.05]], 14, null, px, F - 0.04, pz));
  bag.add('opening', lathe([[0.4, 0], [0.001, 0.003]], 14, null, px, F + 0.012, pz));
  bag.add('reed_mat', box(px - 0.45, F + 0.05, pz - 0.45, px + 0.05, F + 0.07, pz + 0.45));
  // jars, bowls and a plate by the hearth and along the walls; baskets
  const jar = (x, z, k, mat = 'pottery_dark') => bag.add(mat, lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.13], [0.21, 0.24], [0.16, 0.33], [0.15, 0.37], [0.165, 0.39], [0.14, 0.39], [0.13, 0.35], [0.001, 0.34]].map(([r, h]) => [r * k, h * k]), 14, null, x, F, z));
  const bowl = (x, z, k = 1) => bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0.004], [0.13, 0.05], [0.15, 0.09], [0.14, 0.09], [0.12, 0.055], [0.001, 0.03]].map(([r, h]) => [r * k, h * k]), 12, null, x, F, z));
  jar(x1 - t - 0.35, z1 - t - 0.4, 1.4); jar(x1 - t - 0.8, z1 - t - 0.35, 1.1); jar(x0 + t + 0.4, cz - 0.1, 1.2);
  jar(hx + 0.62, hz + 0.1, 0.8);
  bowl(hx - 0.6, hz + 0.3); bowl(hx - 0.75, hz - 0.1, 0.8); bowl(hx + 0.2, hz + 0.65, 1.3);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.005], [0.2, 0.03], [0.22, 0.04], [0.21, 0.045], [0.12, 0.02], [0.001, 0.02]], 14, null, hx - 0.3, F, hz - 0.62));
  for (const [bx, bz, r] of [[x1 - t - 0.4, cz - 0.2, 0.22], [x1 - t - 0.45, cz + 0.35, 0.17]]) bag.add('wicker', lathe([[0.001, 0], [r * 0.8, 0.01], [r, r * 0.9], [r * 0.9, r * 0.9], [r * 0.72, 0.05], [0.001, 0.04]], 12, null, bx, F, bz));
  // the hoe of chert leaning on the west wall; the log mortar with its pestle by the door
  bag.add('timber', rod([x0 + t + M + 0.05, F, cz + 0.6], [x0 + t + M + 0.06, F + 1.15, cz + 0.9], 0.022, 6));
  bag.add('flagstone', box(x0 + t + M + 0.02, F + 0.02, cz + 0.52, x0 + t + M + 0.06, F + 0.26, cz + 0.68));
  const mx = cx + dw / 2 + 0.55, mz = z1 - t - 0.45;
  bag.add('timber', lathe([[0.001, 0], [0.19, 0], [0.18, 0.5], [0.15, 0.52], [0.12, 0.3], [0.001, 0.3]], 12, null, mx, F, mz));
  bag.add('timber', rod([mx, F + 0.32, mz], [mx + 0.05, F + 1.15, mz - 0.03], 0.035, 6));
  col.circle(mx, mz, 0.19, F, F + 0.52);
  // maize hung in bundles from the rafters
  for (let k = 0; k < 3; k++) {
    const hxk = x0 + t + 0.6 + k * 0.5, hzk = z0 + t + 1.1;
    bag.add('linen', rod([hxk, top - 0.1, hzk], [hxk, top - 0.45, hzk], 0.01, 4));
    for (let e = 0; e < 4; e++) { const a = e * 1.57 + k; bag.add(e % 3 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.001, 0], [0.03, 0.04], [0.035, 0.12], [0.02, 0.17], [0.001, 0.18]], 6, null, hxk + Math.cos(a) * 0.05, top - 0.65, hzk + Math.sin(a) * 0.05)); }
  }
}
/**
 * palisade: { rect, y (fn), every (bastion spacing), gates: [[side, t]] } — a wall of logs set in a
 * trench and daubed with clay, the logs' rounded tops standing above the daub; round bastions
 * standing out of the wall at intervals; at the gates the wall overlaps itself, the gap screened.
 */
function palisade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, every = el.every ?? 25, h = el.h ?? 4.5, gates = el.gates ?? [], half = 0.3;
  // a stretch of wall a→b: the daubed body, the post tops above it
  const tops = [], daub = [];
  const stretch = (pa, pb) => {
    const L = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), ux = (pb[0] - pa[0]) / L, uz = (pb[1] - pa[1]) / L, yy = Math.min(yf(...pa), yf(...pb));
    beamTris(daub, [pa[0], yy - 1, pa[1]], [pb[0], yy - 1, pb[1]], half, h + 1);
    col.segment(pa, pb, 2 * half, yy - 1, yy + h);
    for (let q = 0; q < Math.floor(L / 0.36); q++) {
      const t = (q + 0.5) * L / Math.floor(L / 0.36), x = pa[0] + ux * t, z = pa[1] + uz * t, r = 0.17 + ((q * 7919) % 5) * 0.012, hh = 0.55 + ((q * 104729) % 7) * 0.06;
      tops.push([x, yy + h - 0.25, z, r, hh]);
    }
  };
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], si) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, ox = uz, oz = -ux, n = Math.round(L / every);
    const gaps = gates.filter(([s]) => s === si).map(([, t]) => t * L);
    for (let k = 0; k < n; k++) {
      const s0 = k * L / n, s1 = (k + 1) * L / n, mid = (s0 + s1) / 2, P = (s) => [a[0] + ux * s, a[1] + uz * s];
      if (gaps.some((g) => Math.abs(g - mid) < L / n / 2)) {
        // the gate: the wall stops either side of a 3 m gap; a screen of wall outside overlaps it
        stretch(P(s0), P(mid - 1.5)); stretch(P(mid + 1.5), P(s1));
        const sa = P(mid - 7), sb = P(mid + 7);
        stretch([sa[0] + ox * 4, sa[1] + oz * 4], [sb[0] + ox * 4, sb[1] + oz * 4]);
      } else stretch(P(s0), P(s1));
      // the round bastion at the end of the stretch, standing out of the wall
      const pb = P(s1), bx = pb[0] + ox * 1.8, bz = pb[1] + oz * 1.8, yb = Math.min(yf(bx, bz), yf(...pb)), R = 2.6;
      bag.add(WALL, lathe([[R + 0.1, -1], [R, h + 1.0], [R - 0.5, h + 1.0], [R - 0.5, h + 0.2], [0.001, h + 0.2]], 20, null, bx, yb, bz));
      col.circle(bx, bz, R, yb - 1, yb + h + 1.0);
      for (let q = 0; q < 40; q++) { const ang = q / 40 * Math.PI * 2; tops.push([bx + Math.cos(ang) * (R - 0.22), yb + h + 0.8, bz + Math.sin(ang) * (R - 0.22), 0.18, 0.5 + (q % 3) * 0.08]); }
    }
  });
  bag.add(WALL, fromTriangles(daub));
  // the post tops: rounded log ends, a little uneven in height and girth — a few shapes, placed as instances
  const shapes = [0, 1, 2, 3].map((k) => { const r = 0.19, hh = 0.55 + 0.11 * k; return lathe([[r, 0], [r * 0.97, hh * 0.7], [r * 0.6, hh * 0.92], [0.001, hh]], 6); });
  const M = new Matrix4(), S = new Matrix4();
  tops.forEach(([x, yy, z, r, hh], i) => {
    M.makeRotationY((i * 2.399) % 6.283).premultiply(S.makeScale(r / 0.19, r / 0.19, r / 0.19)).setPosition(x, yy, z);
    const g = shapes[Math.min(3, Math.max(0, Math.round((hh - 0.55) / 0.11)))];
    if (bag.addInstance) bag.addInstance('palisade', g.clone(), M.clone(), { reach: 400 });
    else bag.add('palisade', g.clone().applyMatrix4(M));
  });
}
/**
 * woodhenge: { c, r, n, y, h, circles } — the circles of red cedar posts west of Monks Mound: five
 * concentric circles of 24, 36, 48, 60 and 72 posts were raised over the centuries (the 48-post one,
 * about 125 m across, is the best known), posts about 0.4 m across and perhaps 5–7 m tall, with a
 * tall observation post at the centre; seen from it the sun rose over marker posts at the equinoxes
 * and solstices [stated: Wikipedia "Woodhenge (Cahokia)"]. Here three circles (compressed), each post
 * in a mound of packed clay, a gap on the east where the sun comes up, the centre post taller.
 */
function woodhenge(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 45, y = el.y ?? 0, h = el.h ?? 6, rand = rng(7);
  const circles = el.circles ?? [[r * 0.6, 24], [r * 0.8, 36], [r, 48]];
  for (const [cr, n] of circles) for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, x = cx + Math.cos(a) * cr, z = cz + Math.sin(a) * cr, hh = h * (0.92 + rand() * 0.16), rr = 0.36 + rand() * 0.08;
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.045 * 48 / n && cr > r * 0.9) { bag.add('timber_red', lathe([[rr * 1.1, 0], [rr, hh * 1.25], [0.001, hh * 1.25 + 0.3]], 8, null, x, y - 0.6, z)); col.circle(x, z, rr, y, y + hh * 1.25); continue; }   // the sunrise marker post, taller
    bag.add('timber_red', lathe([[rr, 0], [rr * 0.95, hh * 0.96], [rr * 0.5, hh], [0.001, hh + 0.1]], 8, null, x, y - 0.6, z));
    bag.add('earth_wall', lathe([[1.0, 0], [0.8, 0.5], [rr + 0.1, 0.7], [0.001, 0.7]], 10, null, x, y - 0.2, z));
    col.circle(x, z, rr, y, y + hh);
  }
  bag.add('timber_red', lathe([[0.55, 0], [0.5, h + 2.6], [0.001, h + 2.9]], 10, null, cx, y - 0.6, cz)); col.circle(cx, cz, 0.55, y, y + h + 2.6);
  bag.add('earth_wall', lathe([[1.6, 0], [1.2, 0.6], [0.6, 0.8], [0.001, 0.8]], 12, null, cx, y - 0.2, cz));
}
/** chunkey_post: { c, y, h } — the tall pole at the plaza's centre. */
function pole(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 12;
  bag.add('timber_red', lathe([[0.45, 0], [0.3, h], [0.001, h + 0.2]], 8, null, x, y - 0.6, z)); col.circle(x, z, 0.45, y, y + h);
}
/**
 * chunkey_yard: { rect (long along x or z), y } — a chunkey yard on the plaza: a long strip of clay
 * beaten smooth and hard, low banks of earth down its long sides; a few discoidal stones and the
 * players' poles laid by.
 */
function chunkeyYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, along = x1 - x0 >= z1 - z0, rand = rng(el.seed || 3);
  bag.add(WALL, frustum([x0, z0, x1, z1], y - 0.3, y + 0.05, 0.25, 0.25, 0.25, 0.25));
  col.floor([x0, z0, x1, z1], y + 0.05);
  for (const s of [-1, 1]) {
    const r = along ? [x0, s < 0 ? z0 - 1.6 : z1 + 0.1, x1, s < 0 ? z0 - 0.1 : z1 + 1.6] : [s < 0 ? x0 - 1.6 : x1 + 0.1, z0, s < 0 ? x0 - 0.1 : x1 + 1.6, z1];
    bag.add('earth_wall', frustum(r, y - 0.4, y + 0.35, 0.6, 0.6, 0.6, 0.6));
  }
  // the stones: discs of polished stone, their faces dished; the poles, about six feet long, at the yard's end
  const end = along ? [x1 - 1.5, (z0 + z1) / 2] : [(x0 + x1) / 2, z1 - 1.5];
  for (let k = 0; k < 3; k++) {
    const sx = end[0] + (rand() - 0.5) * 1.5, sz = end[1] + (rand() - 0.5) * 1.5, r = 0.055 + rand() * 0.02;
    const g = lathe([[0.001, 0], [r * 0.6, 0.004], [r, 0.012], [r, 0.04], [r * 0.6, 0.048], [0.001, 0.052]], 12, null, 0, 0, 0);
    g.rotateZ(Math.PI / 2); g.translate(sx, y + 0.05 + r, sz);
    bag.add(k ? 'granite_red' : 'granite_grey', g);
  }
  for (let k = 0; k < 2; k++) {
    const a = rand() * Math.PI, cx = end[0] + (rand() - 0.5), cz = end[1] + (rand() - 0.5);
    bag.add('timber', rod([cx - Math.cos(a) * 0.9, y + 0.074, cz - Math.sin(a) * 0.9], [cx + Math.cos(a) * 0.9, y + 0.074, cz + Math.sin(a) * 0.9], 0.025, 6));
  }
}
/**
 * charnel_house: the house of the dead on the platform mound of the twin mounds { c, y, s (its
 * side), yaw (0: the door on the north) } — "probably a charnel house", the conical mound beside it
 * for burial [stated: Cahokia Mounds State Historic Site, "Twin Mounds"]; built after the temple of
 * the Natchez, the Mississippians' heirs, as Le Page du Pratz saw it: about thirty feet a side, the
 * four corner posts a foot and a half thick and rising ten feet, the walls of mud not nine inches
 * thick, the roof a vault on a ridge of six feet, three carved birds on flat boards along the ridge,
 * white with red feathers, facing east; inside a small wall dividing it into a front part of twenty
 * feet, where the eternal fire burns, and a dark back part of ten; an altar four feet high, six long
 * and two broad bearing a coffer of split cane; the door on the north; logs stacked near for the
 * fire [stated: Le Page du Pratz, Histoire de la Louisiane III.2; the transfer to Cahokia inferred].
 */
function charnelHouse(el, { bag, col, lights }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 9, h = 3.0, t = 0.23, hs = s / 2;
  const x0 = cx - hs, x1 = cx + hs, z0 = cz - hs, z1 = cz + hs, dw = 1.0, dh = 1.95;
  // the walls, the doorway in the north wall
  const walls = [[x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t], [x0, z0, cx - dw / 2, z0 + t], [cx + dw / 2, z0, x1, z0 + t]];
  for (const r of walls) { bag.add(WALL, box(r[0], y - 0.4, r[1], r[2], y + h, r[3])); col.rect(r, y - 0.4, y + h); }
  bag.add(WALL, box(cx - dw / 2, y + dh, z0, cx + dw / 2, y + h, z0 + t));
  col.rect([cx - dw / 2, z0, cx + dw / 2, z0 + t], y + dh, y + h);
  // the doorway left open: its two posts, the lintel pole over them, a sill of worn clay
  for (const sd of [-1, 1]) bag.add('timber', rod([cx + sd * (dw / 2 + 0.1), y - 0.3, z0 - 0.1], [cx + sd * (dw / 2 + 0.1), y + dh + 0.3, z0 - 0.1], 0.11, 7));
  bag.add('timber', rod([cx - dw / 2 - 0.35, y + dh + 0.12, z0 - 0.12], [cx + dw / 2 + 0.35, y + dh + 0.12, z0 - 0.12], 0.09, 7));
  bag.add(WALL, box(cx - dw / 2 - 0.25, y - 0.2, z0 - 0.5, cx + dw / 2 + 0.25, y + 0.06, z0 + t));
  // the floor of beaten clay, and the corner posts of cypress standing at the corners
  bag.add(WALL, box(x0 + t, y - 0.3, z0 + t, x1 - t, y + 0.05, z1 - t));
  col.floor([x0 + t, z0 + t, x1 - t, z1 - t], y + 0.05);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) bag.add('timber', rod([px, y - 0.4, pz], [px, y + h + 0.15, pz], 0.23, 10));
  // the wall plate, the roof: a steep vault of thatch on a short ridge
  bag.add('timber', box(x0 - 0.12, y + h - 0.3, z0 - 0.12, x1 + 0.12, y + h, z1 + 0.12));
  const rise = 6.2, ridge = 1.8, o = 0.7, T = [];
  const prof = (f) => Math.sin(f * Math.PI / 2) ** 0.8;                 // the vault's swell: steep at the eaves, rounding to the ridge
  const loop = (f, p) => { const ix = (hs + o) * f, iz = (hs + o) * f, yy = y + h - 0.15 + rise * prof(f) - p * 0.4; const rx = Math.max(ridge / 2, hs + o - ix) + p, rz = hs + o - iz + p; return [[cx - rx, yy, cz - rz], [cx + rx, yy, cz - rz], [cx + rx, yy, cz + rz], [cx - rx, yy, cz + rz]]; };
  const N = 7;
  for (let k = 0; k < N; k++) {
    const f0 = k / N, f1 = k === N - 1 ? 0.995 : (k + 1) / N + 0.05, butt = 0.28 * (1 - 0.6 * k / N);
    const lo = loop(f0, butt), hi = loop(Math.min(1, f1), 0), inn = loop(f0, 0);
    for (let e = 0; e < 4; e++) {
      const f = (e + 1) % 4, m = [(lo[e][0] + lo[f][0]) / 2 - cx, 0, (lo[e][2] + lo[f][2]) / 2 - cz], l = Math.hypot(m[0], m[2]);
      tri(T, lo[e], lo[f], hi[f], [m[0], l * 0.7, m[2]]); tri(T, lo[e], hi[f], hi[e], [m[0], l * 0.7, m[2]]);
      tri(T, lo[e], lo[f], inn[f], [m[0], -l * 2, m[2]]); tri(T, lo[e], inn[f], inn[e], [m[0], -l * 2, m[2]]);
    }
  }
  bag.add(TH, fromTriangles(T));
  // under the eaves, closed back to the wall plate; inside, a ceiling of cane mats at the wall-head
  { const E = [], e = hs + o, w = hs + 0.12, yy = y + h - 0.15;
    for (const [a, b, c, d] of [[[-e, -e], [e, -e], [w, -w], [-w, -w]], [[e, -e], [e, e], [w, w], [w, -w]], [[e, e], [-e, e], [-w, w], [w, w]], [[-e, e], [-e, -e], [-w, -w], [-w, w]]]) {
      const P = (q) => [cx + q[0], yy, cz + q[1]];
      tri(E, P(a), P(b), P(c), [0, -1, 0]); tri(E, P(a), P(c), P(d), [0, -1, 0]);
    }
    bag.add(TH, fromTriangles(E)); }
  bag.add('reed_mat', box(x0 + t, y + h - 0.32, z0 + t, x1 - t, y + h - 0.28, z1 - t));
  // the top: the ridge pole closing it, the flat boards along it and the three birds on them, facing east
  const top = loop(0.995, 0), ry = top[0][1];
  bag.add(TH, frustum([top[0][0] - 0.05, top[0][2] - 0.05, top[2][0] + 0.05, top[2][2] + 0.05], ry - 0.1, ry + 0.25, 0.1, 0.1, 0.25, 0.25));
  bag.add('timber', rod([cx - ridge / 2 - 0.4, ry + 0.3, cz], [cx + ridge / 2 + 0.4, ry + 0.3, cz], 0.12, 8));
  for (const bx of [cx - ridge / 2 - 0.25, cx, cx + ridge / 2 + 0.25]) {
    bag.add('timber', box(bx - 0.35, ry + 0.38, cz - 0.16, bx + 0.35, ry + 0.45, cz + 0.16));
    bird(bag, bx, ry + 0.45, cz);
  }
  // inside: the dividing wall and its doorway, the back part the darker
  const zp = z0 + t + (s - 2 * t) * 2 / 3;
  for (const r of [[x0 + t, zp, cx - 0.5, zp + 0.18], [cx + 0.5, zp, x1 - t, zp + 0.18]]) { bag.add(WALL, box(r[0], y, r[1], r[2], y + 2.3, r[3])); col.rect(r, y, y + 2.3); }
  bag.add('timber', rod([cx - 0.7, y + 1.75, zp + 0.09], [cx + 0.7, y + 1.75, zp + 0.09], 0.07, 6));
  bag.add(WALL, box(cx - 0.5, y + 1.8, zp, cx + 0.5, y + 2.3, zp + 0.18));
  // the eternal fire in the front part: a ring of clay, logs laid star-wise, the flame
  const fz = z0 + t + 2.4;
  bag.add(WALL, lathe([[0.62, 0], [0.62, 0.12], [0.5, 0.14], [0.48, 0.06], [0.001, 0.06]], 16, null, cx, y + 0.04, fz));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; bag.add('timber', rod([cx + Math.cos(a) * 0.6, y + 0.13, fz + Math.sin(a) * 0.6], [cx + Math.cos(a) * 0.08, y + 0.2, fz + Math.sin(a) * 0.08], 0.05, 6)); }
  bag.add('flame', lathe([[0.16, 0], [0.13, 0.12], [0.06, 0.32], [0.001, 0.45]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), cx, y + 0.12, fz));
  col.circle(cx, fz, 0.62, y, y + 0.3);
  if (lights) lights.push({ at: [cx, y + 0.6, fz], color: '#ff9a4a', intensity: 5, distance: 7 });
  // the altar in the back part, the coffer of split cane on it
  const az = (zp + 0.18 + z1 - t) / 2;
  bag.add(WALL, box(cx - 0.92, y, az - 0.31, cx + 0.92, y + 1.22, az + 0.31));
  col.rect([cx - 0.92, az - 0.31, cx + 0.92, az + 0.31], y, y + 1.22);
  bag.add('wicker', frustum([cx - 0.55, az - 0.22, cx + 0.55, az + 0.22], y + 1.22, y + 1.6, 0.02, 0.02, 0.02, 0.02));
  bag.add('reed_mat', box(cx - 0.58, y + 1.6, az - 0.25, cx + 0.58, y + 1.65, az + 0.25));
  // the logs stacked by the door for the fire
  const lx = x1 + 1.2, lz = z0 + 0.6;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) bag.add('timber', rod([lx - 0.9, y + 0.12 + r * 0.2, lz + (k - (3 - r) / 2) * 0.22], [lx + 0.9, y + 0.12 + r * 0.2, lz + (k - (3 - r) / 2) * 0.22], 0.1, 7));
  col.rect([lx - 0.9, lz - 0.5, lx + 0.9, lz + 0.5], y, y + 0.6);
}
/** A carved bird the size of two geese, without feet, white with red feathers, its head to +x (east), on its board at (x, y, z). */
function bird(bag, x, y, z) {
  const body = lathe([[0.001, 0], [0.13, 0.06], [0.2, 0.25], [0.19, 0.45], [0.13, 0.6], [0.05, 0.72], [0.001, 0.74]], 10, null, 0, 0, 0);
  body.scale(1, 1, 0.8).rotateZ(-Math.PI / 2).translate(x - 0.42, y + 0.22, z);
  bag.add('paint_white', body);
  bag.add('paint_white', rod([x + 0.22, y + 0.3, z], [x + 0.36, y + 0.62, z], 0.065, 7));
  bag.add('paint_white', lathe([[0.001, 0], [0.09, 0.05], [0.1, 0.12], [0.06, 0.2], [0.001, 0.22]], 8, null, x + 0.38, y + 0.56, z));
  bag.add('timber_red', rod([x + 0.46, y + 0.66, z], [x + 0.62, y + 0.63, z], 0.03, 5));
  // the red feathers: the wings laid along the sides, the tail fanned behind
  for (const sd of [-1, 1]) { const t = []; t.push(x - 0.3, y + 0.38, z + sd * 0.17, x + 0.15, y + 0.4, z + sd * 0.17, x - 0.4, y + 0.26, z + sd * 0.15); bag.add('timber_red', fromTriangles(t.concat(flip(t)))); }
  { const t = []; t.push(x - 0.4, y + 0.26, z, x - 0.72, y + 0.42, z - 0.14, x - 0.72, y + 0.42, z + 0.14); bag.add('timber_red', fromTriangles(t.concat(flip(t)))); }
}
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

registerStyle('mississippian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_house: greatHouse, chief_hall: chiefHall, ...neighbourhoodElements, miss_house: house, palisade, woodhenge, plaza_pole: pole, chunkey_yard: chunkeyYard, charnel_house: charnelHouse },
  objects: {},
});
