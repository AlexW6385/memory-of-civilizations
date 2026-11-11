// The painted shelters (docs/settlements/kakadu.md §0–§2): each shelter's wall and ceiling surface, and the paintings laid over them in
// layers: faded old red first, then red outlines, then fresh white and yellow infill over and across the older ones. All motifs are
// generic and drawn by us (paint.js); a palette stone and lumps of pigment lie on the floor.
import { MAIN, SMALL, height, rng } from '../../settlements/kakadu/layout.js';
import { shelterSurfaces, wallZ, ceilY } from './rock.js';
import { Panel, PAL, fish, turtle, wallaby, goanna, person, goose, stencil } from './paint.js';
import { lathe } from '../../core/geom.js';

function wall(bag, S, seed, o = {}) {
  const rand = rng(seed), P = new Panel(bag, (u, v) => ({ p: [u, v, wallZ(S, u, v)], n: [0, 0, 1] }));
  const motif = (x, v, layer, tone) => {
    const dir = rand() < 0.5 ? 1 : -1, r = rand();
    const pal = tone === 0 ? { line: PAL.old } : tone === 1 ? { line: PAL.red } : rand() < 0.5 ? { line: PAL.red, fill: PAL.white, band: PAL.yellow, fresh: true } : { line: PAL.red, fill: PAL.yellow, band: PAL.white, fresh: true };
    if (r < 0.4) fish(P, x, v, 0.7 + rand() * 1.1, dir, pal, layer, rand);
    else if (r < 0.56) turtle(P, x, v, 0.7 + rand() * 0.5, dir, pal, layer);
    else if (r < 0.7) wallaby(P, x, v, 0.8 + rand() * 0.7, dir, pal, layer);
    else if (r < 0.84) person(P, x, v - 0.5, 0.9 + rand() * 0.5, dir, pal, layer, { spear: rand() < 0.45, bag: rand() < 0.35, fan: rand() < 0.2 });
    else if (r < 0.92) goanna(P, x, v, 0.9 + rand() * 0.6, dir, pal, layer);
    else goose(P, x, v, 0.6 + rand() * 0.4, dir, pal, layer);
  };
  const W = S.x1 - S.x0;
  // the oldest layer: faded dull red, large, sparse
  for (let x = S.x0 + 1.5; x < S.x1 - 1; x += 3.4 + rand() * 2) motif(x + (rand() - 0.5) * 1.5, 1.0 + rand() * 1.7, 1, 0);
  // red outline paintings
  for (let x = S.x0 + 1; x < S.x1 - 1; x += 2.2 + rand() * 1.6) motif(x + (rand() - 0.5) * 1.2, 0.8 + rand() * 1.8, 3, 1);
  // the newest: white and yellow over red, in clusters (a "panel" every ~8 m)
  for (let c = S.x0 + 3; c < S.x1 - 2; c += 7 + rand() * 4) for (let k = 0; k < 3; k++) motif(c + (rand() - 0.5) * 3, 0.7 + rand() * 1.9, 6 + k * 2, 2);
  // hand stencils, mostly in the low shelter
  const hands = o.hands ?? 4;
  for (let k = 0; k < hands; k++) {
    const cx = S.x0 + 2 + rand() * (W - 4), cy = 1.2 + rand() * 1.4;
    for (let q = 0; q < 1 + (rand() < 0.5 ? 1 : 0); q++) stencil(P, cx + q * 0.28, cy - q * 0.05, 1, (rand() - 0.5) * 0.8, rand() < 0.5 ? PAL.white : PAL.red, 12, rand);
  }
  P.flush();
}
function ceiling(bag, S, seed) {
  const rand = rng(seed), P = new Panel(bag, (u, v) => ({ p: [u, ceilY(S, u, v), v], n: [0, -1, 0] }));
  for (let x = S.x0 + 1.5; x < S.x1 - 1; x += 3 + rand() * 2.5) {
    const z = S.zb + 1.2 + rand() * (S.zl - S.zb - 3.4), dir = rand() < 0.5 ? 1 : -1, pal = rand() < 0.5 ? { line: PAL.red } : { line: PAL.red, fill: PAL.white, band: PAL.yellow, fresh: true };
    if (rand() < 0.55) fish(P, x, z, 0.8 + rand() * 0.9, dir, pal, 3, rand); else turtle(P, x, z, 0.7 + rand() * 0.4, dir, pal, 3);
  }
  P.flush();
}
export function gallery(el, { bag, col }) {
  shelterSurfaces(MAIN, 'sandstone_white', { bag });
  shelterSurfaces(SMALL, 'sandstone_yellow', { bag });
  wall(bag, MAIN, 501, { hands: 3 });
  wall(bag, SMALL, 502, { hands: 7 });
  ceiling(bag, MAIN, 503);
  ceiling(bag, SMALL, 504);
  // floor finds: a flat palette stone with its red smear, lumps of ochre and white clay
  const rand = rng(88);
  for (const [S, n] of [[MAIN, 3], [SMALL, 2]]) for (let k = 0; k < n; k++) {
    const x = S.x0 + 4 + rand() * (S.x1 - S.x0 - 8), z = S.zb + 0.9 + rand() * 1.2, y = height(x, z);
    bag.add('rock_boulder', lathe([[0.3, 0], [0.28, 0.05], [0.16, 0.07], [0.001, 0.07]], 8, (th) => 1 + 0.2 * Math.sin(th * 3 + k), x, y - 0.01, z));
    bag.add('clay_robe', lathe([[0.1, 0], [0.09, 0.012], [0.001, 0.014]], 8, null, x + 0.02, y + 0.065, z));
    for (let q = 0; q < 3; q++) bag.add(q % 2 ? 'paint_white' : 'paint_ochre', lathe([[0.04, 0], [0.03, 0.03], [0.001, 0.04]], 6, null, x + 0.35 + q * 0.07, y, z + 0.05 * q));
  }
}
