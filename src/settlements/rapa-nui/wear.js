// Rapa Nui about 1500 — wear on what is used (docs/settlements/rapa-nui.md §10.5): the earth trodden dark along the way over each doorsill, the ash and soot
// strewn round every earth oven and every hearth, the mat floor darkened round the hearth inside a house. Added from here to the style's elements (the style
// files stay as they were), in materials the plan already holds (no new draw); pure functions of each element's own numbers. Nothing is written anywhere:
// rongorongo, the island's script, is undeciphered and is not imitated (§10.5); the weathering of the moai and the thatch are the style's (§4c, §4f).
import '../../styles/rapanui/index.js';
import './nightlight.js';
import { lathe } from '../../core/geom.js';
import { wearPatches } from '../../core/wearpatch.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';
import { ROAD, height } from './layout.js';

const frame = (c, yaw) => { const ca = Math.cos(yaw), sa = Math.sin(yaw); return (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca]; };
/** Ash and charcoal thrown out round an oven or hearth at (x, y, z): a ragged annulus of dark ash-and-charcoal earth from the ring's stones out. */
function ash(bag, x, y, z, r0, r1) {
  const j = hashAt(x, z, 21) * 6;
  bag.add('bark_dark', lathe([[r1 * 1.07, 0.036], [r1, 0.05], [r0, 0.05]], 14, (t, i) => 0.78 + 0.3 * Math.abs(Math.sin(t * 3 + j + i * 0.2)) + 0.12 * Math.sin(t * 7 + j), x, y, z));
  bag.add('bark_dark', lathe([[r0 * 1.56, 0.05], [r0 * 1.5, 0.057], [r0 * 1.02, 0.057]], 12, (t, i) => 0.7 + 0.45 * Math.abs(Math.sin(t * 2 + j * 1.3 + i * 0.3)), x, y, z));
}
/** A trodden way along a line: a run of ragged patches of darker earth of different sizes, strewn a little either side of the line, not a stripe. */
function tread(bag, a, b, y, w, seed, mat = 'bark_dark', rs = 1) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, n = Math.max(3, Math.round(L / 0.45));
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n + (hashAt(a[0], a[1], seed + k) - 0.5) * 0.5 / n, side = (hashAt(b[0], b[1], seed + k * 3) - 0.5) * w * 0.8, r = (0.16 + 0.2 * hashAt(a[1], b[0], seed + k * 7)) * rs;
    const x = a[0] + dx * t - dz / L * side, z = a[1] + dz * t + dx / L * side, ph = k * 1.7 + seed;
    bag.add(mat, lathe([[r * 1.08, -0.003], [r, 0.0], [0.001, 0.0]], 9, (th) => 1 + 0.3 * Math.sin(th * 3 + ph) + 0.12 * Math.sin(th * 5 + ph * 2)).scale(1, 1, 0.7 + 0.5 * hashAt(x, z, seed)).translate(x, y + k * 0.0006, z));
  }
}
const wrap = (fn, wear) => function worn(el, ctx) { const r = fn.call(this, el, ctx); if (ctx?.bag && !el.strip) wear(el, ctx.bag); return r; };
const oven = (L, W, el, extra = 2.4) => frame(el.c, el.yaw ?? 0)(L * 0.3 * ((el.seed ?? 11) % 2 ? -1 : 1), -W / 2 - extra);
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.rapanui.elements;
  E.hare_house = wrap(E.hare_house, (el, bag) => {
    const [L, W] = [el.len ?? 13, el.w ?? 3.1], y0 = el.y ?? 0, P = frame(el.c, el.yaw ?? 0), [ox, oz] = oven(L, W, el, 3.25);
    ash(bag, ox, y0, oz, 0.68, 1.15);
    tread(bag, P(0, -W / 2 - 0.1), P(0, -W / 2 - 1.9), y0 + 0.098, 0.8, 5);           // the way over the pavement to the door, worn dark
    tread(bag, P(0, -W / 2 + 0.2), P(0.1, 0.0), y0 + 0.088, 0.7, 6);                  // and in over the mat floor
    const [hx, hz] = P(-1.9, 0); bag.add('bark_dark', lathe([[1.0, 0.077], [0.95, 0.083], [0.5, 0.083]], 14, (t) => 0.8 + 0.3 * Math.abs(Math.sin(t * 2.3 + hashAt(hx, hz, 8) * 5)), hx, y0, hz));   // the mat darkened with soot round the hearth
  });
  E.hare_paenga = wrap(E.hare_paenga, (el, bag) => {
    const [L, W] = [el.len ?? 12, el.w ?? 2.6], y0 = el.y ?? 0, [ox, oz] = oven(L, W, el, 2.4);
    ash(bag, ox, y0, oz, 0.58, 1.0);
  });
  E.hare_paenga_long = wrap(E.hare_paenga_long, (el, bag) => {
    const [L, W] = [el.len ?? 26, el.w ?? 4.4], y0 = el.y ?? 0, P = frame(el.c, el.yaw ?? 0);
    const [ox, oz] = P(L * 0.16, -W / 2 - 0.55 - 3.2); ash(bag, ox, y0, oz, 0.78, 1.3);
    tread(bag, P(0, -W / 2 - 0.1), P(0, -W / 2 - 2.6), y0 + 0.098, 1.1, 7);
    tread(bag, P(0, -W / 2 + 0.2), P(-2.2, 0.0), y0 + 0.088, 0.9, 8);
    const [hx, hz] = P(-3, 0); bag.add('bark_dark', lathe([[1.16, 0.077], [1.1, 0.083], [0.55, 0.083]], 14, (t) => 0.8 + 0.3 * Math.abs(Math.sin(t * 2.1 + 1.7)), hx, y0, hz));
  });
  E.plaza_dress = wrap(E.plaza_dress, (el, bag) => {
    const y0 = el.y ?? 0.12; for (const [x, z] of [[-34, 71], [37, 69], [-16, 94]]) ash(bag, x, y0 - 0.02, z, 1.4, 2.1);
    // the statue road's last stretches: the earth beaten hard by the hauling teams, along the way into the village, in ragged overlapping patches on the ground under them [inferred]
    const P = [];
    for (let i = ROAD.length - 3; i < ROAD.length - 1; i++) {
      const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 1.5), ang = Math.atan2(bz - az, bx - ax);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n, off = (hashAt(ax, az, 90 + k) - 0.5) * 1.6, x = ax + (bx - ax) * t - (bz - az) / L * off, z = az + (bz - az) * t + (bx - ax) / L * off;
        P.push([x, z, 1.1 + 0.5 * hashAt(x, z, 91), 0.85 + 0.3 * hashAt(x, z, 92), ang + (hashAt(x, z, 93) - 0.5) * 0.6, { layers: 3, flecks: 3 }]);
      }
    }
    bag.add('earth_trodden', wearPatches(P, { ground: height, lift: 0.012 }));
    // the plaza's middle walk: from the road's end straight across the pebbles toward the ahu, the pebbles scuffed bare in a ragged strip
    const W = [];
    for (let z = 61; z < 97; z += 1.3) { const x = -4 + (z - 61) * 0.11 + (hashAt(z, 5, 94) - 0.5) * 1.1; W.push([x, z, 0.95 + 0.3 * hashAt(x, z, 95), 0.8 + 0.2 * hashAt(x, z, 96), Math.PI / 2 + (hashAt(x, z, 97) - 0.5) * 0.5, { y: y0, layers: 3, flecks: 3 }]); }
    bag.add('earth_trodden', wearPatches(W, { lift: 0.006 }));
  });
  E.approach_dress = wrap(E.approach_dress, (el, bag) => ash(bag, 8, el.ground(8, 60) - 0.02, 60, 0.9, 1.5));
}
registerWear();
