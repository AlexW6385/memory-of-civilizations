// Ajanta about 480 — wear and weathering (docs/settlements/ajanta.md §20): what the feet of pilgrims and monks and the monsoon leave on rock and mud. Wraps the ajanta
// style's `aj_cliff`, `aj_ledge`, `aj_house` and `aj_ford` from here (the style files stay as they were); pure functions of the element's own numbers, hashes of their
// own places (no counters, no Math.random). Nothing is written anywhere: no inscription is drawn (§20: the Brahmi of the cave inscriptions cannot be checked glyph by
// glyph here, and none is invented).
import '../../styles/ajanta/index.js';
import './nightlight.js';
import { box, lathe, frustum } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { XF, FLOOR, STAIR, STAIR2, C1, C19, C12, FORD, riverX, rng } from './layout.js';
import { hashAt } from './nightlight.js';

const POL = 'sandstone_white', HPOL = 'limewash_white', Y1 = FLOOR[1];       // (materials already in each plan: a new one near the arrival would cost a draw)
/** A worn pad of polished stone on a floor (top at y), x0..x1 by z0..z1, 6 mm thick, 3 mm over what it lies on. */
// (a pad leans in a little at its edges, each differently: boxes of one shape at twelve places would be an instanced draw of their own)
const pad = (bag, x0, z0, x1, z1, y, mat = POL) => {
  const h = (k) => 0.004 + 0.006 * hashAt(x0 + k, z0, 77 + k), w = Math.min(x1 - x0, z1 - z0) * 0.3;
  bag.add(mat, frustum([x0, z0, x1, z1], y + 0.003, y + 0.009, Math.min(w, h(1) * 6), Math.min(w, h(2) * 6), Math.min(w, h(3) * 6), Math.min(w, h(4) * 6)));
};

/** The rock-cut stairs: every tread worn pale and smooth along its middle where bare feet climb (the width and the place differ by tread), and the approaches to the caves' doors. */
function cliffWear(bag) {
  const n = Math.round((FLOOR[1] - FLOOR[0]) / 0.17), dy = (FLOOR[1] - FLOOR[0]) / n;
  { const { x0, x1, z0, z1 } = STAIR, L = (z1 - z0) / n, c = (x0 + x1) / 2;
    for (let k = 0; k < n; k++) { const h = hashAt(k, 3, 61), w = 0.4 + 0.32 * h, cx = c + (hashAt(k, 5, 63) - 0.5) * 0.35, top = FLOOR[0] + dy * (k + 1); pad(bag, cx - w, z0 + k * L + 0.05, cx + w, z0 + (k + 1) * L - 0.03, top, 'lime_plaster'); } }
  { const { x0, x1, z0, z1 } = STAIR2, L = (z1 - z0) / n, c = (x0 + x1) / 2;
    for (let k = 0; k < n; k++) { const h = hashAt(k, 7, 65), w = 0.36 + 0.3 * h, cx = c + (hashAt(k, 9, 67) - 0.5) * 0.35, top = FLOOR[0] + dy * (k + 1); pad(bag, cx - w, z1 - (k + 1) * L + 0.03, cx + w, z1 - k * L - 0.05, top, 'lime_plaster'); } }
  // Cave 1: the porch's three doors (x −63.8 porch side, −65.7 hall side), worn in front of each by the sangha's feet
  for (const [dz, hw] of [[0, 1.3], [-5.4, 0.8], [5.4, 0.8]]) {
    const z = C1.z + dz, a = hw * (0.5 + 0.2 * hashAt(dz, 1, 71));
    pad(bag, XF - 3.8 + 0.02, z - a, XF - 3.8 + 0.95, z + a * 0.9, Y1);
    pad(bag, XF - 4.8 - 0.9, z - a * 0.8, XF - 4.8 - 0.02, z + a, Y1);
  }
  // the chaitya hall's and the cell hall's thresholds on the ledge before their doors (the ledge floor, the walk's line at x −56 left clear of nothing: the pad is flat)
  pad(bag, XF + 0.35, C19.z - 1.1, XF + 2.1, C19.z + 1.0, Y1); pad(bag, XF + 0.4, C12.z - 0.7, XF + 1.9, C12.z + 0.65, Y1);
}
/** The ledge: round each votive stupa a ring worn pale by circumambulation (pilgrims walk round clockwise keeping the stupa on the right), r 0.75–1.0 m. */
function ledgeWear(bag, cx) {
  // the lane along the ledge from the stair's head to the chaitya hall's door, a pale smooth strip worn where the sangha walks (a pad a metre long, its width and line its own)
  for (let z = -41; z < C19.z - 1.5; z += 1.15) { const w = 0.22 + 0.16 * hashAt(z, 2, 81), c = cx - 2.1 + (hashAt(z, 4, 83) - 0.5) * 0.3; pad(bag, c - w, z, c + w, z + 1.0 - 0.1 * hashAt(z, 6, 85), Y1); }
  for (const z of [-3, 18, 41.5]) bag.add(POL, lathe([[0.75, 0.003], [0.78, 0.009], [0.97, 0.009], [1.0, 0.003]], 24, null, cx, Y1, z));
}
/** A house's door: a worn hollow in the middle of the granite threshold (the open houses and one in three of the others), and the monsoon's dark streaks down the front wall from the eave. */
function houseWear(el, bag) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', W = x1 - x0, t = 0.35, H = el.variant === 3 ? 2.55 : 2.3, dw = el.open ? 0.82 : 0.52;
  const xz = (u, v) => (f === 's' ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
  const uc = W * (0.38 + rng(el.seed ?? 1)() * 0.24);
  if (el.open || hashAt(x0, z0, 41) < 0.33) {
    const w = 0.32 + 0.15 * hashAt(x0, z0, 43), a = xz(uc - w, -0.28), b = xz(uc + w, t - 0.05);
    bag.add(HPOL, box(Math.min(a[0], b[0]), 0.1 + 0.003, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 0.1 + 0.009, Math.max(a[1], b[1])));
  }
  // streaks: two or three narrow dark runs from the eave down the wall (mud of the other kind than the wall's), clear of the door, window and garlands
  const k = 2 + Math.floor(hashAt(x0, z0, 47) * 2);
  for (let i = 0; i < k; i++) {
    const u = W * (0.08 + 0.84 * hashAt(x0, z0, 51 + i)); if (Math.abs(u - uc) < dw + 0.35) continue;
    const h = 0.5 + 0.9 * hashAt(x0, z0, 55 + i), w = 0.06 + 0.07 * hashAt(x0, z0, 59 + i), a = xz(u - w, -0.016), b = xz(u + w, -0.006);
    bag.add(el.mud === 'earth_wall' ? 'mud_plaster' : 'earth_wall', box(Math.min(a[0], b[0]), H - 0.5 - h, Math.min(a[1], b[1]), Math.max(a[0], b[0]), H - 0.55, Math.max(a[1], b[1])));
  }
}
/** The ford's stones: the top of each worn smooth by the feet that cross (a pad on each, the size of its own). */
function fordWear(bag) {
  const z = FORD.z, xr = riverX(z), n = 13;
  for (let i = 0; i < n; i++) { const x = xr - 6.2 + i * 1.04, dz = Math.sin(i * 2.1) * 0.25, w = 0.28 + 0.2 * hashAt(i, 2, 73); pad(bag, x - w, z + dz - 0.4, x + w, z + dz + 0.4, -0.02); }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.ajanta.elements, wrap = (name, fn, wear) => {
    E[name] = function worn(el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple && ctx?.bag) wear(el, ctx.bag); return r; };
  };
  wrap('aj_cliff', E.aj_cliff, (el, bag) => cliffWear(bag));
  wrap('aj_ledge', E.aj_ledge, (el, bag) => ledgeWear(bag, XF + 4.85));
  wrap('aj_house', E.aj_house, houseWear);
  wrap('aj_ford', E.aj_ford, (el, bag) => fordWear(bag));
}
registerWear();
