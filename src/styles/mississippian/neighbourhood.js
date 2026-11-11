// The furnishings of Cahokia's neighbourhoods (docs/settlements/cahokia.md §5.3): the small plaza
// with its fire ring, benches and post; raised granaries of cane and thatch; drying racks for maize,
// hides and fish; open-sided arbors under which shell beads are made and pots are shaped and fired;
// garden plots of maize, squash and sunflower; the log stairs of Monks Mound.
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';
import { WALL, rng, thatchHip } from './kit.js';

const yAt = (el, x, z) => (typeof el.y === 'function' ? el.y(x, z) : el.y ?? 0);
const hi = (el, x0, z0, x1, z1) => Math.max(yAt(el, x0, z0), yAt(el, x1, z0), yAt(el, x0, z1), yAt(el, x1, z1));
const lo = (el, x0, z0, x1, z1) => Math.min(yAt(el, x0, z0), yAt(el, x1, z0), yAt(el, x0, z1), yAt(el, x1, z1));

/** granary: { c, y (fn or number), s (side), seed } — a crib of woven cane on four posts, a steep thatch roof, a notched log to climb by. */
function granary(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 2.3, h = s / 2, rand = rng(el.seed || 5);
  const x0 = cx - h, x1 = cx + h, z0 = cz - h, z1 = cz + h, y = hi(el, x0, z0, x1, z1), fl = y + 1.35;
  for (const [px, pz] of [[x0 + 0.15, z0 + 0.15], [x1 - 0.15, z0 + 0.15], [x1 - 0.15, z1 - 0.15], [x0 + 0.15, z1 - 0.15]]) {
    const yb = yAt(el, px, pz) - 0.3;
    bag.add('timber', rod([px, yb, pz], [px, fl + 0.1, pz], 0.1, 8));
    bag.add('timber', lathe([[0.17, 0], [0.17, 0.05], [0.1, 0.07], [0.001, 0.08]], 8, null, px, fl - 0.2, pz));   // the rat guard: a disc on each post
    col.circle(px, pz, 0.1, yb, fl);
  }
  for (let k = 0; k < 6; k++) bag.add('timber', rod([x0, fl, z0 + 0.2 + k * (s - 0.4) / 5], [x1, fl, z0 + 0.2 + k * (s - 0.4) / 5], 0.05, 6));
  const top = fl + 1.45;
  bag.add('wicker', box(x0 + 0.05, fl + 0.04, z0 + 0.05, x1 - 0.05, top, z1 - 0.05)); col.rect([x0, z0, x1, z1], fl, top);
  for (let k = 1; k < 5; k++) bag.add('timber', box(x0 + 0.03, fl + k * 0.29, z0 + 0.03, x1 - 0.03, fl + k * 0.29 + 0.03, z1 - 0.03));
  thatchHip(bag, [x0, z0, x1, z1], top, 2.0, 0.5, 4);
  // the small door under the eaves on the south, closed with a mat; a log notched into steps leaning on the platform
  bag.add('reed_mat', box(cx - 0.3, fl + 0.1, z1 - 0.03, cx + 0.3, fl + 0.85, z1 + 0.02));
  const lx = cx + 0.7, yb = yAt(el, lx, z1 + 0.9);
  bag.add('log_pine', rod([lx, yb, z1 + 1.0], [lx, fl + 0.08, z1 + 0.1], 0.1, 7));
  for (let k = 1; k <= 4; k++) { const f = k / 5; bag.add('timber', box(lx - 0.11, yb + (fl - yb) * f, z1 + 1.0 - 0.9 * f - 0.1, lx + 0.11, yb + (fl - yb) * f + 0.05, z1 + 1.0 - 0.9 * f + 0.1)); }
  void rand;
}

/** drying_rack: { rect (long along x or z), y, kind: 'maize'|'hide'|'fish' } — two or three trestles of forked posts with poles across; hung with maize in braids, stretched hides, or strips of fish and meat. */
function dryingRack(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, alongX = x1 - x0 >= z1 - z0, kind = el.kind || 'maize', rand = rng(el.seed || 9);
  const L = alongX ? x1 - x0 : z1 - z0, n = Math.max(2, Math.round(L / 2.4) + 1), P = (f, o = 0) => (alongX ? [x0 + L * f, (z0 + z1) / 2 + o] : [(x0 + x1) / 2 + o, z0 + L * f]);
  const yb = (p) => yAt(el, p[0], p[1]), H = 1.95;
  for (let k = 0; k < n; k++) for (const o of [-0.45, 0.45]) {
    const p = P(k / (n - 1), o), y0 = yb(p) - 0.3;
    bag.add('timber', rod([p[0], y0, p[1]], [p[0], y0 + H + 0.3, p[1]], 0.06, 6));
    col.circle(p[0], p[1], 0.06, y0, y0 + H);
  }
  const ymid = yb(P(0.5));
  for (const [dy, o] of [[H, -0.45], [H, 0.45], [H - 0.55, -0.45], [H - 0.55, 0.45]]) { const a = P(0, o), b = P(1, o); bag.add('timber', rod([a[0], ymid + dy, a[1]], [b[0], ymid + dy, b[1]], 0.035, 6)); }
  const m = Math.floor(L / 0.34);
  for (let k = 0; k < m; k++) {
    const f = (k + 0.5) / m, p = P(f), y = ymid + H - 0.02, j = rand();
    if (kind === 'maize') {
      // a braid of ears tied by their husks, hung over the pole: three or four ears, tan and ochre, husks drawn back
      const ln = 0.3 + j * 0.12;
      bag.add('linen', rod([p[0], y - 0.02, p[1] - 0.1], [p[0], y - ln, p[1] - 0.1], 0.015, 4));
      for (let e = 0; e < 3; e++) { const dz = (e - 1) * 0.07; bag.add(e === 1 ? 'paint_ochre' : 'cloth_ochre', lathe([[0.001, 0], [0.032, 0.03], [0.04, 0.12], [0.03, 0.2], [0.001, 0.22]], 6, null, p[0] + (alongX ? 0 : dz), y - ln - 0.2 + e * 0.03, p[1] - 0.1 + (alongX ? dz : 0))); }
    } else if (kind === 'hide') {
      if (k % 5 === 0) { const wdt = 0.5 + j * 0.2; bag.add(j < 0.5 ? 'hide_tan' : 'hide_brown', alongX ? box(p[0] - wdt / 2, y - 1.15, p[1] - 0.455, p[0] + wdt / 2, y - 0.1, p[1] - 0.435) : box(p[0] - 0.455, y - 1.15, p[1] - wdt / 2, p[0] - 0.435, y - 0.1, p[1] + wdt / 2)); }
    } else if (k % 2 === 0) {
      // fish split and hung by the tail, head down, or strips of meat
      const ln = 0.35 + j * 0.2;
      bag.add(j < 0.4 ? 'hide_brown' : 'hide_grey', alongX ? box(p[0] - 0.045, y - 0.1 - ln, p[1] - 0.46, p[0] + 0.045, y - 0.05, p[1] - 0.44) : box(p[0] - 0.46, y - 0.1 - ln, p[1] - 0.045, p[0] - 0.44, y - 0.05, p[1] + 0.045));
    }
  }
}

/** A woven mat on the ground: a rect of reed. */
const mat = (bag, el, x0, z0, x1, z1) => bag.add('reed_mat', box(x0, hi(el, x0, z0, x1, z1) + 0.0, z0, x1, hi(el, x0, z0, x1, z1) + 0.035, z1));

/**
 * craft_arbor: { rect, y, trade: 'shell'|'pottery', seed } — a shade of four posts and a roof of poles and
 * brush, open on all sides, where a craft is worked. Shell: marine whelk and conch from the Gulf, cut,
 * drilled with a stone drill and ground to beads, strung on cords hung from a bar; pottery: clay
 * tempered with crushed mussel shell, coiled, scraped and burnished, the pots left to dry on a plank
 * and fired in a pit under wood — a ring of ash and embers beside the arbor.
 */
function craftArbor(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, trade = el.trade || 'shell', rand = rng(el.seed || 3), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 2.4;
  const y = hi(el, x0, z0, x1, z1);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) { const yb = yAt(el, px, pz) - 0.4; bag.add('timber', rod([px, yb, pz], [px, y + H, pz], 0.09, 8)); col.circle(px, pz, 0.09, yb, y + H); }
  for (const z of [z0, z1]) bag.add('timber', rod([x0 - 0.3, y + H, z], [x1 + 0.3, y + H, z], 0.07, 6));
  for (let k = 0; k < 8; k++) { const x = x0 - 0.2 + (x1 - x0 + 0.4) * k / 7; bag.add('timber', rod([x, y + H + 0.07, z0 - 0.3], [x, y + H + 0.07, z1 + 0.3], 0.04, 5)); }
  bag.add('thatch', box(x0 - 0.35, y + H + 0.1, z0 - 0.35, x1 + 0.35, y + H + 0.3, z1 + 0.35));
  mat(bag, el, x0 + 0.2, z0 + 0.2, x1 - 0.2, z1 - 0.2);
  const fz = y + 0.04;
  if (trade === 'shell') {
    // the bar of beads: strings of shell discs hung from a pole; a heap of whole whelk shells; blanks cut, a slab of sandstone with a drill
    bag.add('timber', rod([x0 + 0.1, y + H - 0.4, z0 + 0.35], [x1 - 0.1, y + H - 0.4, z0 + 0.35], 0.03, 6));
    for (let k = 0; k < 9; k++) {
      const bx = x0 + 0.3 + k * (x1 - x0 - 0.6) / 8;
      bag.add('linen', rod([bx, y + H - 0.4, z0 + 0.35], [bx, y + H - 1.3 - rand() * 0.3, z0 + 0.35], 0.008, 4));
      for (let b = 0; b < 8; b++) bag.add(b % 3 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.02, 0.0], [0.02, 0.012], [0.001, 0.012]], 8, null, bx, y + H - 0.55 - b * 0.1, z0 + 0.35));
    }
    for (let k = 0; k < 9; k++) { const a = rand() * 6.28, r = 0.15 + rand() * 0.3; bag.add(k % 2 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.08, 0.02], [0.1, 0.09], [0.06, 0.17], [0.012, 0.22], [0.001, 0.23]], 8, null, cx - 0.4 + Math.cos(a) * r, fz, cz - 0.3 + Math.sin(a) * r)); }
    bag.add('flagstone', box(cx + 0.35, fz, cz - 0.1, cx + 1.0, fz + 0.09, cz + 0.4)); col.rect([cx + 0.35, cz - 0.1, cx + 1.0, cz + 0.4], fz, fz + 0.09);
    bag.add('shell_inlay', lathe([[0.001, 0], [0.12, 0.006], [0.2, 0.05], [0.18, 0.05], [0.001, 0.012]], 10, null, cx + 0.5, fz + 0.09, cz + 0.1));
    bag.add('timber', rod([cx + 0.7, fz + 0.09, cz + 0.15], [cx + 0.7, fz + 0.5, cz + 0.15], 0.012, 5));
    bag.add('wicker', lathe([[0.001, 0], [0.18, 0.01], [0.22, 0.12], [0.2, 0.12], [0.001, 0.04]], 10, null, cx - 1.0, fz, cz + 0.5));
  } else {
    // clay in a heap, coiled and finished pots drying on a plank, a bowl of water, a burnishing pebble
    bag.add('silt', lathe([[0.45, 0], [0.4, 0.14], [0.22, 0.26], [0.001, 0.3]], 10, null, cx + 0.9, fz, cz + 0.4));
    bag.add('timber', box(cx - 1.3, fz, cz - 0.55, cx + 0.2, fz + 0.07, cz - 0.15)); col.rect([cx - 1.3, cz - 0.55, cx + 0.2, cz - 0.15], fz, fz + 0.07);
    const jar = (x, z, k, yy) => bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.13], [0.21, 0.24], [0.16, 0.33], [0.15, 0.37], [0.165, 0.39], [0.14, 0.39], [0.13, 0.35], [0.001, 0.34]].map(([r, h]) => [r * k, h * k]), 12, null, x, yy, z));
    jar(cx - 1.0, cz - 0.35, 0.9, fz + 0.07); jar(cx - 0.55, cz - 0.35, 0.7, fz + 0.07); jar(cx - 0.1, cz - 0.35, 1.05, fz + 0.07);
    jar(cx - 0.5, cz + 0.5, 1.2, fz);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0.004], [0.13, 0.05], [0.15, 0.09], [0.14, 0.09], [0.12, 0.055], [0.001, 0.03]], 10, null, cx + 0.2, fz, cz + 0.6));
    // the firing pit beside the arbor: a ring of stones, ash, a heap of pots under embers and bark
    const px = x1 + 1.8, pz = cz, yp = yAt(el, px, pz);
    bag.add('bark_dark', lathe([[1.0, 0], [0.9, 0.03], [0.001, 0.03]], 14, null, px, yp + 0.0, pz));
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; bag.add('rock_boulder', lathe([[0.001, 0], [0.15, 0.04], [0.14, 0.14], [0.001, 0.17]], 6, null, px + Math.cos(a) * 1.0, yp, pz + Math.sin(a) * 1.0)); }
    for (let k = 0; k < 4; k++) jar(px + (k - 1.5) * 0.22, pz + (k % 2 - 0.5) * 0.3, 0.8, yp + 0.04);
    bag.add('flame', lathe([[0.3, 0], [0.22, 0.12], [0.1, 0.3], [0.001, 0.45]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), px, yp + 0.06, pz));
    for (let k = 0; k < 5; k++) { const a = k * 1.3; bag.add('timber', rod([px + Math.cos(a) * 0.5, yp + 0.1, pz + Math.sin(a) * 0.5], [px + Math.cos(a) * 0.05, yp + 0.3, pz + Math.sin(a) * 0.05], 0.04, 5)); }
    if (lights) lights.push({ at: [px, yp + 0.6, pz], color: '#ff8a3a', intensity: 3, distance: 7 });
    col.circle(px, pz, 1.0, yp, yp + 0.18);
  }
  void lo;
}

/** garden: { rect, y } — a plot of maize in hills with squash vines between and a row of sunflowers on the edge, fenced with brush. */
function garden(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 21), T = [];
  const stalk = (x, z, hgt) => {
    const y = yAt(el, x, z), r = 0.018;
    for (let b = 0; b < 3; b++) { const a = b * 2.1 + rand(), tx = x + Math.cos(a) * 0.04, tz = z + Math.sin(a) * 0.04, hh = hgt * (0.8 + rand() * 0.25);
      bag.add('flax_leaf', rod([x, y, z], [tx, y + hh, tz], r, 4));
      const dx = Math.cos(a + 1.5), dz = Math.sin(a + 1.5), lh = y + hh * 0.62;
      T.push(tx, lh, tz, tx + dx * 0.5, lh - 0.15, tz + dz * 0.5, tx + dx * 0.25, lh, tz + dz * 0.25, tx, lh, tz, tx + dx * 0.25, lh, tz + dz * 0.25, tx + dx * 0.5, lh - 0.15, tz + dz * 0.5);
    }
    bag.add('cloth_ochre', rod([x + 0.03, y + hgt * 0.55, z], [x + 0.05, y + hgt * 0.55 + 0.2, z], 0.03, 5));
  };
  for (let x = x0 + 0.5; x < x1; x += 0.95) for (let z = z0 + 0.5; z < z1; z += 0.95) { if (rand() < 0.1) continue; stalk(x + (rand() - 0.5) * 0.2, z + (rand() - 0.5) * 0.2, 1.8 + rand() * 0.5); }
  for (let x = x0 + 0.5; x < x1; x += 2.2) { const y = yAt(el, x, z1 + 0.5); bag.add('flax_leaf', rod([x, y, z1 + 0.5], [x, y + 1.9, z1 + 0.5], 0.02, 4)); bag.add('paint_ochre', lathe([[0.001, 0], [0.14, 0.01], [0.15, 0.03], [0.001, 0.05]], 8, null, x, y + 1.9, z1 + 0.5)); }
  if (T.length) bag.add('flax_leaf', fromTriangles(T));
  // the brush fence: stakes with brush laid between, on the south side only
  for (let x = x0; x <= x1; x += 1.2) { const y = yAt(el, x, z0 - 0.3); bag.add('timber', rod([x, y - 0.1, z0 - 0.3], [x, y + 0.9, z0 - 0.3], 0.025, 4)); }
  bag.add('thatch', box(x0, yAt(el, (x0 + x1) / 2, z0 - 0.3) + 0.0, z0 - 0.36, x1, yAt(el, (x0 + x1) / 2, z0 - 0.3) + 0.55, z0 - 0.24));
}

/** small_plaza: { c, y, seed } — the middle of a neighbourhood's plaza: a ring of stones round a fire, log benches, a post carved and painted. */
function smallPlaza(el, { bag, col }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 2), y = yAt(el, cx, cz);
  const ring = hi(el, cx - 1.2, cz - 1.2, cx + 1.2, cz + 1.2);
  bag.add(WALL, lathe([[1.15, -0.4], [1.15, ring - y + 0.1], [0.9, ring - y + 0.12], [0.001, ring - y + 0.04]], 16, null, cx, y, cz));
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; bag.add('granite_grey', lathe([[0.001, 0], [0.2, 0.04], [0.18, 0.18], [0.001, 0.22]], 7, null, cx + Math.cos(a) * 1.0, ring + 0.04, cz + Math.sin(a) * 1.0)); }
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283 + 0.4; bag.add('timber', rod([cx + Math.cos(a) * 0.7, ring + 0.12, cz + Math.sin(a) * 0.7], [cx + Math.cos(a) * 0.05, ring + 0.2, cz + Math.sin(a) * 0.05], 0.05, 6)); }
  col.circle(cx, cz, 1.15, y, ring + 0.2);
  for (const a of [0.5, 2.2, 3.9, 5.5]) {
    const bx = cx + Math.cos(a) * 3.4, bz = cz + Math.sin(a) * 3.4, yb = yAt(el, bx, bz), ux = -Math.sin(a), uz = Math.cos(a);
    bag.add('log_pine', rod([bx - ux * 1.2, yb + 0.22, bz - uz * 1.2], [bx + ux * 1.2, yb + 0.22, bz + uz * 1.2], 0.2, 8));
    col.segment([bx - ux * 1.2, bz - uz * 1.2], [bx + ux * 1.2, bz + uz * 1.2], 0.4, yb, yb + 0.45);
  }
  const px = cx + 5.2 * Math.cos(1.2), pz = cz + 5.2 * Math.sin(1.2), yp = yAt(el, px, pz);
  bag.add('timber_red', lathe([[0.26, 0], [0.22, 5.2], [0.17, 5.6], [0.001, 5.8]], 8, null, px, yp - 0.6, pz));
  bag.add('paint_white', lathe([[0.265, 0], [0.265, 0.2], [0.001, 0.2]], 8, null, px, yp + 1.6, pz));
  bag.add('paint_ochre', lathe([[0.235, 0], [0.235, 0.2], [0.001, 0.2]], 8, null, px, yp + 2.2, pz));
  col.circle(px, pz, 0.26, yp, yp + 5.6);
  void rand;
}

/** log_stair: { from: [x, z], to: [x, z], width, y (fn), step } — treads of logs laid across the slope, held by stakes at the ends. */
function logStair(el, { bag }) {
  const [ax, az] = el.from, [bx, bz] = el.to, w = el.width ?? 3, st = el.step ?? 1.4, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const n = Math.floor(L / st);
  for (let k = 1; k <= n; k++) {
    const x = ax + ux * st * k, z = az + uz * st * k, p = [x + nx * w / 2, z + nz * w / 2], q = [x - nx * w / 2, z - nz * w / 2];
    const y = yAt(el, x, z);
    bag.add('log_pine', rod([p[0], y + 0.02, p[1]], [q[0], y + 0.02, q[1]], 0.14, 7));
    for (const e of [p, q]) bag.add('timber', rod([e[0], y - 0.3, e[1]], [e[0], y + 0.25, e[1]], 0.06, 6));
  }
}

export const neighbourhoodElements = { granary, drying_rack: dryingRack, craft_arbor: craftArbor, garden, small_plaza: smallPlaza, log_stair: logStair };
void frustum;
