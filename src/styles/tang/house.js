// The houses and shops of Tang Chang'an: courtyard houses in their rammed-earth walls (gate, main hall, wings), huts of earth
// and thatch, and the rows of open-fronted shops of the market (party walls, a counter and the goods of each trade, the
// wine flag on its pole). Lot-based, like the other towns: a lot { rect, front, kind, seed, det } becomes one house.

import { box, lathe } from '../../core/geom.js';
import { inFrame, YAW, rng, wallRun, tangRoof } from './kit.js';
import { buildHall } from './hall.js';
import { furnishHouse } from './interior.js';
import { furnishRoom, furnishHut, courtDress } from './court.js';

const ext = (rect, front) => { const w = rect[2] - rect[0], d = rect[3] - rect[1], al = front === 'n' || front === 's'; return al ? [w, d] : [d, w]; };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The gate of a courtyard house in the front wall (local +z side) at x = gx: two posts, a lintel and a small gabled roof. */
function plainGate(L, gx, z, rich, hwG = 1.25, tile = null) {
  const { bag, col } = L;
  for (const s of [-1, 1]) { bag.add('timber_red', box(gx + s * hwG - 0.2, 0, z - 0.3, gx + s * hwG + 0.2, 3.0, z + 0.3)); }
  bag.add('timber_red', box(gx - hwG - 0.2, 2.65, z - 0.3, gx + hwG + 0.2, 3.0, z + 0.3));
  tangRoof(L.bag, { cx: gx, cz: z, A: hwG + 1.25, B: 1.6, y: 3.05, rise: 0.75, gable: !rich, thick: 0.18, chi: 0.5, ...(tile ? { tile, soffit: tile, ridge: tile, chiwei: false } : {}) });
  bag.add('wood_dark', box(gx - hwG + 0.05, 0, z + 0.22, gx - 0.15, 2.65, z + 0.3));      // one door leaf open against the post
  void col;
}

/** The brushwood gate of a poor house: two posts, a wattle leaf hung on one, a ragged lintel of poles. */
function brushGate(L, gx, z) {
  const { bag } = L;
  for (const s of [-1, 1]) bag.add('wood_dark', box(gx + s * 0.9 - 0.07, 0, z - 0.08, gx + s * 0.9 + 0.07, 2.0, z + 0.08));
  bag.add('wood_dark', box(gx - 1.0, 1.9, z - 0.06, gx + 1.0, 2.0, z + 0.06)); bag.add('thatch', box(gx - 1.1, 2.0, z - 0.2, gx + 1.1, 2.2, z + 0.2));
  bag.add('wicker', box(gx - 0.85, 0.05, z + 0.12, gx - 0.1, 1.5, z + 0.18)); bag.add('wood_dark', box(gx - 0.85, 0.7, z + 0.18, gx - 0.1, 0.74, z + 0.2));
}
/** The gate of an official's house (rank): lacquered door leaves ajar, a name board under the gate building's eaves, the stone drums, a rack of halberds, a mounting block. */
function rankGate(L, gx, z, wt, W) {
  const { bag, col } = L, zo = z + wt / 2, dir = gx > 0 ? -1 : 1;
  for (const s of [-1, 1]) {   // the drum stones (menmo) beside the gate's porch: a block with a drum-shaped stone upon it
    const x = gx + s * 4.9; bag.add('granite_block', box(x - 0.3, 0, zo + 0.15, x + 0.3, 0.2, zo + 0.75)); bag.add('granite_block', lathe([[0.001, 0.2], [0.26, 0.2], [0.3, 0.34], [0.3, 0.6], [0.26, 0.72], [0.001, 0.72]], 12, null, x, 0, zo + 0.45)); col.circle(x, zo + 0.45, 0.32, 0, 0.72);
  }
  bag.add('lacquer_black', box(gx - 0.7, 3.0, z + 2.4, gx + 0.7, 3.45, z + 2.44)); bag.add('gilt_bronze', box(gx - 0.6, 3.07, z + 2.44, gx + 0.6, 3.38, z + 2.46));   // the name board under the gate building's eaves
  // the halberd rack (lieji): two posts and a bar, five halberds with their pennons, at the wall's foot beside the gate
  const rx = gx + dir * 7.6, rz = zo + 0.5;
  for (const s of [-1, 1]) bag.add('wood_dark', box(rx + s * 0.9 - 0.04, 0, rz - 0.04, rx + s * 0.9 + 0.04, 1.35, rz + 0.04));
  bag.add('wood_dark', box(rx - 0.94, 0.6, rz - 0.05, rx + 0.94, 0.66, rz + 0.05)); col.rect([rx - 0.95, rz - 0.08, rx + 0.95, rz + 0.08], 0, 1.4);
  for (let k = 0; k < 5; k++) { const x = rx - 0.7 + k * 0.35; bag.add('wood_dark', box(x - 0.015, 0.1, rz - 0.015, x + 0.015, 2.5, rz + 0.015)); bag.add('iron', box(x - 0.045, 2.5, rz - 0.01, x + 0.045, 2.75, rz + 0.01)); bag.add('iron', box(x - 0.01, 2.4, rz - 0.07, x + 0.01, 2.55, rz + 0.07)); bag.add('cloth_red', box(x + 0.015, 2.1, rz - 0.005, x + 0.2, 2.4, rz + 0.005)); }
  // the mounting block (xiamashi) on the other side, if the wall is long enough
  const mx = gx - dir * 7.4;
  if (Math.abs(mx) < W / 2 - 1.2) { bag.add('granite_block', box(mx - 0.5, 0, zo + 0.2, mx + 0.5, 0.3, zo + 0.8)); bag.add('granite_block', box(mx - 0.4, 0.3, zo + 0.3, mx + 0.4, 0.55, zo + 0.7)); col.rect([mx - 0.5, zo + 0.2, mx + 0.5, zo + 0.8], 0, 0.55); }
}
/** A small earth-god niche (tudi) in the foot of a common house's wall: a shelf under a tiny tiled roof, an incense bowl, a lamp. */
function wallShrine(L, x, zo) {
  const { bag } = L;
  bag.add('wood_dark', box(x - 0.3, 0.85, zo, x + 0.3, 0.9, zo + 0.32)); for (const s of [-1, 1]) bag.add('wood_dark', box(x + s * 0.28 - 0.02, 0.9, zo, x + s * 0.28 + 0.02, 1.4, zo + 0.02));
  bag.add('tile_grey', box(x - 0.36, 1.4, zo - 0.02, x + 0.36, 1.46, zo + 0.38)); bag.add('tile_grey', box(x - 0.3, 1.46, zo + 0.04, x + 0.3, 1.52, zo + 0.3));
  bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.09, 0.05], [0.001, 0.06]], 8, null, x, 0.9, zo + 0.17)); bag.add('paint_white', box(x - 0.012, 0.96, zo + 0.17, x + 0.012, 1.2, zo + 0.19)); bag.add('cloth_red', box(x - 0.2, 0.92, zo + 0.0, x + 0.2, 1.38, zo + 0.01));
}

/** The weathering of a lot's wall of rammed earth on its outer faces: the damp skirt, blotches, rain streaks, a patch of repair; the gate's gap kept clear. */
function weatherFront(L, W, D, wh, th, gx, gw, rand) {
  const { bag } = L, p = 0.03;
  const run = (x0, z0, x1, z1, nx, nz, gate) => {   // an outer face from (x0,z0) to (x1,z1), pushed out along (nx,nz)
    const Lw = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / Lw, uz = (z1 - z0) / Lw;
    const seg = (s0, s1, a, b, mat) => {
      if (s1 - s0 < 0.2) return;
      const px0 = x0 + ux * s0, pz0 = z0 + uz * s0, px1 = x0 + ux * s1, pz1 = z0 + uz * s1;
      const xr = nx ? [Math.min(px0 - nx * 0.15, px0 + nx * p), Math.max(px0 - nx * 0.15, px0 + nx * p)] : [Math.min(px0, px1), Math.max(px0, px1)];
      const zr = nz ? [Math.min(pz0 - nz * 0.15, pz0 + nz * p), Math.max(pz0 - nz * 0.15, pz0 + nz * p)] : [Math.min(pz0, pz1), Math.max(pz0, pz1)];
      bag.add(mat, box(xr[0], a, zr[0], xr[1], b, zr[1]));
    };
    const gaps = gate == null ? [] : [[gate - gw / 2 - 0.2, gate + gw / 2 + 0.2]];
    const spans = []; let s = 0; for (const [g0, g1] of gaps) { spans.push([s, g0]); s = g1; } spans.push([s, Lw]);
    for (const [s0, s1] of spans) {
      seg(s0, s1, 0, Math.min(0.5, wh * 0.5), 'plaster_damp');
      for (let t = s0 + 1 + rand() * 3; t < s1 - 2; t += 4 + rand() * 6) {
        const w = 0.7 + rand() * 1.8, r = rand();
        if (r < 0.4) seg(t, t + w, 0.5, 0.8 + rand() * 0.5, 'plaster_damp'); else if (r < 0.7) seg(t, t + w, 0.9 + rand() * 0.4, Math.min(wh - 0.3, 1.8 + rand() * 0.4), 'mud_plaster'); else seg(t, t + 0.3, Math.max(0.5, wh - 1.3), wh - 0.05, 'plaster_streak');
      }
    }
  };
  const ox = W / 2 + th / 2, oz = D / 2 + th / 2;
  run(-W / 2, oz, W / 2, oz, 0, 1, gx + W / 2); run(-W / 2, -oz, W / 2, -oz, 0, -1, null);
  run(-ox, -D / 2, -ox, D / 2, -1, 0, null); run(ox, -D / 2, ox, D / 2, 1, 0, null);
}

/** The kind of room a house's main hall holds, by its class (the rooms of the great houses: study, music, guests, shrine; of the common: weaving, physician, store). */
export function houseVariant(el, rr = rng((el.seed || 1) + 99)) {
  const kind = el.kind || 'house', wk = el.wk || 'official';
  if (el.furnished) return 'dais';
  if (kind === 'mansion' && rr() < 0.35) return 'dais2';
  const pool = kind === 'mansion' ? ['study', 'bedroom', 'dining', 'music', 'shrine', 'guest', 'study', 'bedroom'] : wk === 'official' ? ['study', 'bedroom', 'dining', 'shrine', 'guest', 'weaver', 'store'] : ['dining', 'weaver', 'store', 'shrine', 'physician', 'bedroom', 'weaver'];
  return pool[Math.floor(rr() * pool.length)];
}
/** tang_house { rect, front, kind: 'mansion' | 'house' | 'hut', seed, det }. */
export function tangHouse(el, ctx) {
  const rect = el.rect, f = el.front || 's', [W, D] = ext(rect, f), det = el.det ?? 1, kind = el.kind || 'house', rand = rng(el.seed || 1);
  const c = mid(rect), gx = (rand() < 0.5 ? -1 : 1) * W * 0.2;
  inFrame(ctx, c, YAW[f], (L) => {
    // the front by rule: the class of the house (rank of an official's, gentry, common, poor) sets the wall's height and capping, the gate and its furniture
    const wk = el.wk || 'official', cls = kind === 'hut' ? 'poor' : kind === 'mansion' ? 'rank' : wk === 'official' ? 'gentry' : wk === 'common' ? 'common' : 'poor';
    const { bag, col } = L, wh = kind === 'hut' ? 1.1 : { rank: 3.0, gentry: 2.8, common: 2.4, poor: 1.9 }[cls], th = 0.55, capMat = cls === 'common' ? 'thatch' : 'tile_grey';
    const gateW = cls === 'rank' || cls === 'gentry' ? 2.5 : 1.8;
    const op = [{ at: W / 2 + gx, w: kind === 'hut' ? 1.6 : 2.5, h: 4, y0: 0 }];
    // the wall of rammed earth round the lot, capped with tile; the gate in the front wall
    const ring = [[[-W / 2, -D / 2], [W / 2, -D / 2]], [[-W / 2, -D / 2], [-W / 2, D / 2]], [[W / 2, -D / 2], [W / 2, D / 2]]];
    for (const [a, b] of ring) wallRun(L, 'earth_wall', a, b, th, 0, wh);
    wallRun(L, 'earth_wall', [-W / 2, D / 2], [W / 2, D / 2], th, 0, wh, kind === 'hut' ? [{ at: W / 2 + gx, w: 1.6, h: wh, y0: 0 }] : [{ at: W / 2 + gx, w: gateW, h: Math.max(wh + 0.1, cls === 'rank' || cls === 'gentry' ? 4.2 : 2.1), y0: 0 }]);
    if (kind !== 'hut' && cls !== 'poor') {
      for (const [a, b, o] of [[ring[0][0], ring[0][1], []], [ring[1][0], ring[1][1], []], [ring[2][0], ring[2][1], []], [[-W / 2, D / 2], [W / 2, D / 2], []]]) void o, a, b;
      const cap = (a, b, o) => { const Lw = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Lw, uz = (b[1] - a[1]) / Lw; let s = 0; for (const q of [...o, { s0: Lw, s1: Lw }]) { if (q.s0 - s > 0.1) bag.add(capMat, Math.abs(ux) > 0.5 ? box(Math.min(a[0] + ux * s, a[0] + ux * q.s0) - 0.0, wh, a[1] - 0.45, Math.max(a[0] + ux * s, a[0] + ux * q.s0), wh + (cls === 'common' ? 0.34 : 0.28), a[1] + 0.45) : box(a[0] - 0.45, wh, Math.min(a[1] + uz * s, a[1] + uz * q.s0), a[0] + 0.45, wh + (cls === 'common' ? 0.34 : 0.28), Math.max(a[1] + uz * s, a[1] + uz * q.s0))); s = q.s1; } };
      cap(ring[0][0], ring[0][1], []); cap(ring[1][0], ring[1][1], []); cap(ring[2][0], ring[2][1], []);
      cap([-W / 2, D / 2], [W / 2, D / 2], [{ s0: W / 2 + gx - gateW / 2 - 0.25, s1: W / 2 + gx + gateW / 2 + 0.25 }]);
    }
    weatherFront(L, W, D, wh, th, gx, gateW, rand);
    if (kind === 'hut') {
      // a hut of earth: walls of rammed earth with a doorway and a window, a low thatched gable roof, a bed platform and a stove inside; a yard before it
      const hw = Math.min(W - 3, 6.4), hd = 4.4, hz = -D / 2 + hd / 2 + 1.5, y = 0.12;
      const doorAt = hw / 2 + (rand() - 0.5) * 2;
      wallRun(L, 'mud_plaster', [-hw / 2, hz - hd / 2], [hw / 2, hz - hd / 2], 0.4, 0, 2.3);
      wallRun(L, 'mud_plaster', [-hw / 2, hz - hd / 2], [-hw / 2, hz + hd / 2], 0.4, 0, 2.3); wallRun(L, 'mud_plaster', [hw / 2, hz - hd / 2], [hw / 2, hz + hd / 2], 0.4, 0, 2.3);
      wallRun(L, 'mud_plaster', [-hw / 2, hz + hd / 2], [hw / 2, hz + hd / 2], 0.4, 0, 2.3, [{ at: doorAt, w: 1.1, h: 1.85, y0: 0 }, { at: doorAt < hw / 2 ? hw - 0.9 : 0.9, w: 0.7, h: 0.6, y0: 1.1 }]);
      bag.add('wood_dark', box(doorAt - hw / 2 - 0.62, 0, hz + hd / 2 - 0.25, doorAt - hw / 2 - 0.56, 1.85, hz + hd / 2 + 0.2)); bag.add('timber', box(doorAt - hw / 2 - 0.62, 1.85, hz + hd / 2 - 0.25, doorAt - hw / 2 + 0.62, 1.95, hz + hd / 2 + 0.2));
      bag.add('earth_wall', box(-hw / 2 - 0.2, 0, hz - hd / 2 - 0.2, hw / 2 + 0.2, 0.12, hz + hd / 2 + 0.2));
      col.floor([-hw / 2, hz - hd / 2, hw / 2, hz + hd / 2], y);
      if (det >= 1) inFrame(L, [0, hz], 0, (H) => furnishHut(H, { w: hw - 0.8, d: hd - 0.8, y, seed: el.seed || 1 })); col.floor([-hw / 2 - 0.2, hz + hd / 2 - 0.1, hw / 2 + 0.2, hz + hd / 2 + 0.2], 0.1);
      tangRoof(bag, { cx: 0, cz: hz, A: hw / 2 + 0.5, B: hd / 2 + 0.6, y: 2.25, rise: 1.35, gable: true, tile: 'thatch', soffit: 'thatch', ridge: 'thatch', chiwei: false, thick: 0.3, gableMat: 'mud_plaster' });
      // the yard: a hurdle fence, a drying mat with grain, a stack of firewood, a pot
      bag.add('wicker', box(-W / 2 + 1.0, 0, hz + hd / 2 + 2.5, -W / 2 + 4.5, 0.8, hz + hd / 2 + 2.62)); bag.add('reed_mat', box(W / 2 - 4.2, 0, hz + hd / 2 + 1.6, W / 2 - 1.6, 0.02, hz + hd / 2 + 3.4)); bag.add('cloth_ochre', box(W / 2 - 4.0, 0.02, hz + hd / 2 + 1.8, W / 2 - 1.8, 0.05, hz + hd / 2 + 3.2));
      bag.add('bark_pine', box(-hw / 2 - 1.3, 0, hz - 0.8, -hw / 2 - 0.5, 0.9, hz + 1.2)); bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.12], [0.4, 0.34], [0.36, 0.6], [0.001, 0.62]], 10, null, hw / 2 + 1.0, 0, hz + hd / 2 + 0.6));
      return;
    }
    // the gate
    if (kind === 'mansion') inFrame(L, [gx, D / 2], 0, (G) => buildHall(G, { w: 7.2, d: 4.4, y: 0, plat: 0.3, H: 3.3, nb: 3, kind: 'open', det: Math.max(1, det), bh: 0.95, over: 1.7, steps: false, roof: 'hip', through: true }));
    if (cls === 'rank') rankGate(L, gx, D / 2, th, W);
    if (cls === 'gentry') { plainGate(L, gx, D / 2, true); bag.add('lacquer_black', box(gx - 0.5, 2.68, D / 2 + 0.3, gx + 0.5, 2.98, D / 2 + 0.34)); bag.add('gilt_bronze', box(gx - 0.42, 2.73, D / 2 + 0.34, gx + 0.42, 2.93, D / 2 + 0.36)); }
    if (cls === 'common') { plainGate(L, gx, D / 2, false, 1.0, 'thatch'); wallShrine(L, gx + (gx > 0 ? -2.8 : 2.8), D / 2 + th / 2 + 0.04); }
    if (cls === 'poor') { brushGate(L, gx, D / 2); }
    // the main hall at the back, facing the gate; the wings on both sides of the court
    const hw = Math.min(W - 5.5, kind === 'mansion' ? 17.5 : 11.5), hd = kind === 'mansion' ? 7.4 : 5.8, nb = hw > 15 ? 5 : 3, hz = -D / 2 + hd / 2 + 2.0;
    const rr = rng((el.seed || 1) + 99), variant = houseVariant(el, rr);
    inFrame(L, [0, hz], 0, (H) => {
      const plat = kind === 'mansion' ? 0.55 : 0.4;
      buildHall(H, { w: hw, d: hd, y: 0, plat, H: kind === 'mansion' ? 4.0 : 3.3, nb, kind: 'hall', det, bh: kind === 'mansion' ? 1.2 : 0.9, over: kind === 'mansion' ? 2.2 : 1.8, roof: rr() < 0.5 || kind === 'mansion' ? 'hip' : 'gable', doorW: 2.4, steps: true, bq: det >= 2 ? 'med' : 'low', interior: true });
      if (variant === 'dais' || variant === 'dais2') furnishHouse(H, { w: hw, d: hd, y: plat });
      else furnishRoom(H, variant, { w: hw, d: hd, y: plat, seed: el.seed, light: det >= 2 });
    });
    if (D > 24 && W > 20) for (const s of [-1, 1]) {
      const wl = Math.min(D * 0.36, 11.6), wx = s * (W / 2 - 3.6), wz = hz + hd / 2 + 1.4 + wl / 2 + 1.5;
      if (wz + wl / 2 > D / 2 - 5) continue;
      inFrame(L, [wx, wz], s > 0 ? Math.PI / 2 * -1 : Math.PI / 2, (H) => {
        buildHall(H, { w: wl, d: 4.2, y: 0, plat: 0.3, H: 2.9, nb: 3, kind: 'hall', det: Math.min(det, 1), bh: 0.75, over: 1.4, roof: 'gable', steps: false, doorW: 1.8, interior: true });
        furnishRoom(H, s < 0 ? 'kitchen' : 'store', { w: wl, d: 4.2, y: 0.3, seed: (el.seed || 1) + s, light: false });
      });
    }
    courtDress(L, { W, D, gx, hz, hd, kind, det, seed: el.seed });
  });
}

// ── the market's rows of shops ─────────────────────────────────────────────────────────────────────────────────────
const GOODS = {
  cloth: ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green'], silk: ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_white'],
  grain: ['sacking', 'sacking', 'wicker'], medicine: ['wood_dark', 'lacquer_red', 'paint_white'], books: ['paint_white', 'cloth_indigo'],
  pottery: ['terracotta', 'pottery_dark', 'glaze_green', 'glaze_white'], iron: ['iron', 'iron', 'wood_dark'], saddlery: ['hide_brown', 'hide_black', 'iron'],
  lacquer: ['lacquer_red', 'lacquer_black', 'glaze_white'], carpet: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon'], spice: ['wicker', 'cloth_ochre', 'terracotta', 'cloth_brown'],
  jade: ['glaze_green', 'glaze_white', 'cloth_red'], food: ['wicker', 'glaze_white', 'iron'], wine: ['pottery_dark', 'terracotta'], dye: ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green'], paper: ['paint_white', 'lime_plaster'],
};
export const TRADE_LIST = Object.keys(GOODS);

function jar(bag, x, y, z, r, h, mat) {
  bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, h * 0.4], [r * 0.5, h * 0.92], [0.001, h]], 7, null, x, y, z));
}
/** The goods on a counter between x0 and x1 at depth z (top y): by trade. */
function goods(bag, trade, x0, x1, z, y, rand) {
  const mats = GOODS[trade] || GOODS.cloth, step = trade === 'wine' ? 0.62 : 0.4;
  for (let x = x0 + 0.25; x < x1 - 0.2; x += step) {
    const m = mats[Math.floor(rand() * mats.length)];
    if (trade === 'wine' || trade === 'pottery' || trade === 'spice') jar(bag, x, y, z, 0.16, 0.3 + rand() * 0.12, m);
    else if (trade === 'cloth' || trade === 'silk' || trade === 'carpet' || trade === 'dye') bag.add(m, box(x - 0.14, y, z - 0.2, x + 0.14, y + 0.2 + rand() * 0.25, z + 0.2));
    else bag.add(m, box(x - 0.13, y, z - 0.14, x + 0.13, y + 0.18 + rand() * 0.14, z + 0.14));
  }
}


/** The frontage of a shop by its trade, outside the platform (z from zf, +z the street): racks, stacks, the stove, the lanterns and the signboard; x0…x1 the unit. */
function frontage(L, trade, x0, x1, zf, rand, det) {
  const { bag, col } = L, mx = (x0 + x1) / 2, bolts = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon', 'cloth_blue'];
  const sack = (x, z, h = 0.6) => bag.add('sacking', lathe([[0.001, 0], [0.26, 0.04], [0.3, 0.2], [0.17, h * 0.85], [0.001, h]], 8, null, x, 0, z));
  const pot = (x, z, r, h, m) => { jar(bag, x, 0, z, r, h, m); col.circle(x, z, r, 0, h); };
  // the lanterns at the unit's ends and the signboard hung from the architrave
  for (const x of [x0 + 0.5, x1 - 0.5]) { bag.add('wood_dark', box(x - 0.006, 3.0, zf - 0.55, x + 0.006, 3.3, zf - 0.54)); bag.add('lamp_paper', box(x - 0.13, 2.62, zf - 0.68, x + 0.13, 3.02, zf - 0.42)); }
  bag.add('lacquer_black', box(mx - 0.45, 2.5, zf - 0.6, mx + 0.45, 3.0, zf - 0.55)); bag.add('gilt_bronze', box(mx - 0.38, 2.57, zf - 0.57, mx + 0.38, 2.93, zf - 0.52)); bag.add('cloth_red', box(mx - 0.03, 2.1, zf - 0.6, mx + 0.03, 2.5, zf - 0.57));
  if (det < 1) return;
  const rackAt = (a, b, hmin, hmax, mats) => {
    for (const x of [a, b]) { bag.add('bamboo_culm', box(x - 0.04, 0, zf + 0.5, x + 0.04, hmax + 0.15, zf + 0.58)); col.circle(x, zf + 0.54, 0.08, 0, hmax); }
    bag.add('bamboo_culm', box(a, hmax + 0.05, zf + 0.5, b, hmax + 0.12, zf + 0.58));
    for (let x = a + 0.15, k = 0; x < b - 0.4; x += 0.42, k++) bag.add(mats[(k + Math.floor(rand() * 3)) % mats.length], box(x, hmin + rand() * 0.2, zf + 0.52, x + 0.34, hmax + 0.05, zf + 0.57));
  };
  if (trade === 'cloth' || trade === 'silk' || trade === 'dye') rackAt(mx - 1.4, mx + 1.4, 1.0, 2.3, trade === 'dye' ? ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green'] : bolts);
  else if (trade === 'carpet') { rackAt(mx - 1.5, mx + 1.5, 0.9, 2.2, ['cloth_red', 'cloth_indigo', 'cloth_maroon', 'cloth_ochre']); bag.add('cloth_red', box(mx - 1.0, 0, zf + 1.4, mx + 1.0, 0.03, zf + 2.4)); bag.add('cloth_indigo', box(mx - 0.8, 0.03, zf + 1.55, mx + 0.8, 0.045, zf + 2.25)); }
  else if (trade === 'pottery' || trade === 'jade' || trade === 'lacquer') { for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) pot(mx - 1.0 + r * 0.3 + k * 0.62, zf + 0.9 + r * 0.45, 0.25, 0.5 + r * 0.04, trade === 'pottery' ? ['terracotta', 'pottery_dark', 'glaze_green'][k % 3] : ['glaze_green', 'glaze_white', 'lacquer_red'][k % 3]); }
  else if (trade === 'grain') { for (let k = 0; k < 6; k++) sack(mx - 1.0 + (k % 3) * 0.62, zf + 0.9 + Math.floor(k / 3) * 0.5); col.rect([mx - 1.3, zf + 0.6, mx + 1.0, zf + 1.6], 0, 0.6); bag.add('timber', box(mx + 1.2, 0, zf + 0.9, mx + 1.7, 0.3, zf + 1.4)); }
  else if (trade === 'iron') { bag.add('bark_pine', box(mx - 0.3, 0, zf + 1.0, mx + 0.3, 0.55, zf + 1.6)); bag.add('iron', box(mx - 0.28, 0.55, zf + 1.1, mx + 0.28, 0.72, zf + 1.5)); col.rect([mx - 0.3, zf + 1.0, mx + 0.3, zf + 1.6], 0, 0.72); for (let k = 0; k < 5; k++) bag.add('iron', box(mx + 0.9 + k * 0.1, 0.2, zf + 1.0, mx + 0.94 + k * 0.1, 1.2 + (k % 2) * 0.3, zf + 1.04)); bag.add('wood_dark', box(mx + 0.8, 0, zf + 0.95, mx + 1.5, 0.3, zf + 1.1)); }
  else if (trade === 'saddlery') { bag.add('wood_dark', box(mx - 0.4, 0, zf + 1.0, mx + 0.4, 0.6, zf + 1.1)); bag.add('hide_brown', box(mx - 0.45, 0.6, zf + 0.85, mx + 0.45, 0.8, zf + 1.3)); bag.add('hide_black', box(mx - 0.1, 0.8, zf + 0.9, mx + 0.1, 0.95, zf + 1.25)); rackAt(mx + 0.9, mx + 2.0, 1.0, 2.0, ['hide_brown', 'hide_tan', 'hide_black']); }
  else if (trade === 'spice' || trade === 'medicine') { for (let k = 0; k < 5; k++) { const x = mx - 1.2 + k * 0.6; bag.add('wicker', lathe([[0.22, 0], [0.28, 0.22], [0.001, 0.22]], 9, null, x, 0, zf + 1.0)); bag.add(['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_green', 'cloth_ochre'][k], lathe([[0.2, 0], [0.12, 0.1], [0.001, 0.14]], 8, null, x, 0.2, zf + 1.0)); col.circle(x, zf + 1.0, 0.28, 0, 0.3); } if (trade === 'medicine') bag.add('glaze_yellow', lathe([[0.001, 0], [0.1, 0.06], [0.1, 0.2], [0.05, 0.3], [0.001, 0.36]], 8, null, mx, 2.2, zf - 0.5)); }
  else if (trade === 'books' || trade === 'paper') { bag.add('lacquer_red', box(mx - 0.6, 0.55, zf + 1.0, mx + 0.6, 0.6, zf + 1.6)); for (const dx of [-0.5, 0.5]) bag.add('wood_dark', box(mx + dx - 0.03, 0, zf + 1.05, mx + dx + 0.03, 0.55, zf + 1.55)); col.rect([mx - 0.6, zf + 1.0, mx + 0.6, zf + 1.6], 0, 0.6); bag.add('paint_white', box(mx - 0.4, 0.6, zf + 1.1, mx + 0.1, 0.72, zf + 1.5)); }
  else if (trade === 'food') { bag.add('mud_plaster', box(mx - 0.8, 0, zf + 0.9, mx + 0.0, 0.8, zf + 1.6)); bag.add('iron', lathe([[0.001, 0], [0.3, 0.04], [0.36, 0.2], [0.001, 0.24]], 10, null, mx - 0.4, 0.8, zf + 1.25)); col.rect([mx - 0.8, zf + 0.9, mx, zf + 1.6], 0, 1.0); bag.add('bark_pine', box(mx - 0.8, 0, zf + 1.65, mx - 0.2, 0.3, zf + 1.95)); for (const dx of [0.5, 1.2]) { bag.add('wood_dark', box(mx + dx - 0.22, 0.4, zf + 1.4, mx + dx + 0.22, 0.44, zf + 1.8)); for (const sx of [-1, 1]) bag.add('wood_dark', box(mx + dx + sx * 0.18 - 0.02, 0, zf + 1.42, mx + dx + sx * 0.18 + 0.02, 0.4, zf + 1.78)); } }
  else if (trade === 'wine') { for (const dx of [-0.2, 1.0]) { bag.add('wood_dark', box(mx + dx - 0.22, 0.4, zf + 1.4, mx + dx + 0.22, 0.44, zf + 1.8)); for (const sx of [-1, 1]) bag.add('wood_dark', box(mx + dx + sx * 0.18 - 0.02, 0, zf + 1.42, mx + dx + sx * 0.18 + 0.02, 0.4, zf + 1.78)); } bag.add('lacquer_red', box(mx + 0.2, 0.0, zf + 1.45, mx + 0.6, 0.55, zf + 1.75)); col.rect([mx + 0.2, zf + 1.45, mx + 0.6, zf + 1.75], 0, 0.55); }
}

/**
 * tang_shop_row { foot, front, units: [{ nb, trade }], seed, det }: a run of shops under one roof — the front open between posts, a counter
 * in the outer bays and the door in the middle one, party walls between the units, the goods, a sign pole at each unit's end.
 */
export function tangShopRow(el, ctx) {
  const f = el.front || 's', [W, D] = ext(el.foot, f), rand = rng(el.seed || 1), units = el.units, nbT = units.reduce((s, u) => s + u.nb, 0);
  const hw = W - 1.6, hd = D - 1.6, bay = hw / nbT;
  inFrame(ctx, mid(el.foot), YAW[f], (L) => {
    const { bag, col } = L;
    buildHall(L, { w: hw, d: hd, y: 0, plat: 0.3, H: 3.5, nb: nbT, kind: 'open', det: el.det ?? 1, bq: 'low', bh: 0.8, over: 1.5, steps: false, roof: el.roof || 'gable', counter: false, pal: { plinth: 'brick_grey' } });
    let k = 0;
    units.forEach((u, ui) => {
      const x0 = -hw / 2 + k * bay, x1 = x0 + u.nb * bay;
      if (ui > 0) { bag.add('plaster_white', box(x0 - 0.15, 0.3, -hd / 2, x0 + 0.15, 3.1, hd / 2 - 0.2)); col.rect([x0 - 0.15, -hd / 2, x0 + 0.15, hd / 2 - 0.2], 0.3, 3.1); }
      if ((el.det ?? 1) >= 1) {
        for (let b = 0; b < u.nb; b++) {
          if (u.nb >= 3 && b === Math.floor(u.nb / 2)) continue;                       // the door bay
          const a0 = x0 + b * bay + 0.2, a1 = x0 + (b + 1) * bay - 0.2;
          bag.add('wood_dark', box(a0, 0.3, hd / 2 - 0.55, a1, 1.2, hd / 2 - 0.1)); bag.add('timber', box(a0 - 0.05, 1.2, hd / 2 - 0.6, a1 + 0.05, 1.26, hd / 2 - 0.04));
          col.rect([a0, hd / 2 - 0.6, a1, hd / 2], 0.3, 1.26);
          goods(bag, u.trade, a0, a1, hd / 2 - 0.35, 1.26, rand);
        }
        // the shelves along the back wall with the goods, a lamp bracket
        bag.add('wood_dark', box(x0 + 0.4, 0.3, -hd / 2 + 0.2, x1 - 0.4, 2.2, -hd / 2 + 0.55)); goods(bag, u.trade, x0 + 0.4, x1 - 0.4, -hd / 2 + 0.55, 1.2, rand);
        col.rect([x0 + 0.4, -hd / 2 + 0.2, x1 - 0.4, -hd / 2 + 0.55], 0.3, 2.2);
        // the sign pole at the unit's end, before the platform, its flag
        const px = x0 + 0.5, pz = hd / 2 + 1.35;
        bag.add('bamboo_culm', box(px - 0.05, 0, pz - 0.05, px + 0.05, 5.2, pz + 0.05)); col.circle(px, pz, 0.1, 0, 5.2);
        bag.add(u.trade === 'wine' ? 'cloth_ochre' : (['cloth_indigo', 'cloth_red', 'cloth_white'][(ui + (el.seed | 0)) % 3]), box(px + 0.05, 3.6, pz - 0.02, px + 0.6, 5.0, pz + 0.02));
        if (u.trade === 'wine') for (let j = 0; j < 3; j++) jar(bag, x0 + 1.0 + j * 0.8, 0, hd / 2 + 1.0 + 1.4 * 0, 0.2, 0.55, 'pottery_dark');
        frontage(L, u.trade, x0 + 0.7, x1 - 0.2, hd / 2 + 0.9, rand, el.det ?? 1);
        // inside: a table with two stools by the back, a scale on the counter's end
        { const tx = x1 - 1.3, tz = -hd / 2 + 2.6; bag.add('lacquer_red', box(tx - 0.5, 0.3 + 0.7, tz - 0.3, tx + 0.5, 0.3 + 0.75, tz + 0.3)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(tx + sx * 0.44 - 0.025, 0.3, tz + sz * 0.24 - 0.025, tx + sx * 0.44 + 0.025, 1.0, tz + sz * 0.24 + 0.025)); col.rect([tx - 0.5, tz - 0.3, tx + 0.5, tz + 0.3], 0.3, 1.05); bag.add('hide_tan', box(tx - 0.2, 0.3, tz + 0.55, tx + 0.2, 0.7, tz + 0.95)); }
      }
      k += u.nb;
    });
  });
}

export const HOUSE_ELEMENTS = { tang_house: tangHouse, tang_shop_row: tangShopRow };
