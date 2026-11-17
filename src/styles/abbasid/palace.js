// The landmark (docs/settlements/abbasid-baghdad.md §5): the Palace of the Golden Gate with its Green Dome — a walled compound,
// the great iwan (14 m high, 9.1 m wide) before the square audience chamber, which rises as a tower to a green dome and a horseman
// 48 m up — and the Great Mosque of al-Mansur beside it: a hypostyle of teak columns under a flat roof. All in a local frame
// (front to +z, the south), turned by `face`.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { furnish, buildRooms, zir } from './dress.js';
import { greenDome, ceilY, HS } from './dome.js';
import { wallArcade, goldenGateFront, towerDetail } from './facade.js';
import { mosqueExterior, mihrab, minbar, rahla, hangLamp, MOSQUE_BAYS } from './mosque.js';
import { gardenTree, local, wallRun, barrel, domeShell, archBand, spandrel, stuccoPanel, merlons, lineFrame, rng, archCurve, archPoly, orientedBox, polyGeo, D2R } from './kit.js';

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** A passage through a mass along z: opening width w, apex hh, between z0 and z1 (z0 < z1), barrel-vaulted; faces spandrelled up to `top`. */
export function archway({ bag, col }, { x = 0, w, hh, z0, z1, top, mat = 'brick_baked', vault = 'plaster', ring = true }) {
  const spring = archCurve(w, hh).spring;
  for (const [z, sd] of [[z0, -1], [z1, 1]]) {
    const fr = { O: [x - w / 2, z], U: [1, 0], N: [0, sd] };
    bag.add(mat, spandrel(fr, 0, 0, w, hh, top, -0.3, 0.3));
    if (ring) archBand(bag, fr, 0, 0, w, hh, 0.5, 0.3, 0.42);
  }
  barrel(bag, vault, [x - w / 2, z0, x + w / 2, z1], spring, 'z', 10, hh - spring);
  col.rect([x - w / 2, z0, x + w / 2, z1], hh, top);
}

/** A row of columns of teak along a line, each with a capital block, on a base; returns nothing. h = to the top of the capital. */
export function teak(bag, col, x, z, y, h, r = 0.24) {
  // the shaft (palm-and-teak trunks were used whole or built up of glued pieces bolted with iron [stated: Wikipedia, Great Mosque of al-Mansur]): a turned
  // shaft and a capital of three glued blocks, an iron strap round the middle one, bolt heads on its faces
  bag.add('cedar', lathe([[r * 1.3, 0], [r * 1.25, 0.12], [r, 0.2], [r * 0.9, h * 0.5], [r * 0.92, h - 0.52], [r * 1.05, h - 0.5], [0.001, h - 0.5]], 10, null, x, y, z));
  bag.add('limestone', box(x - r * 1.5, y - 0.02, z - r * 1.5, x + r * 1.5, y + 0.14, z + r * 1.5));
  bag.add('cedar', box(x - r * 1.25, y + h - 0.5, z - r * 1.25, x + r * 1.25, y + h - 0.32, z + r * 1.25));
  bag.add('cedar', box(x - r * 1.6, y + h - 0.32, z - r * 1.6, x + r * 1.6, y + h - 0.12, z + r * 1.6));
  bag.add('iron', box(x - r * 1.66, y + h - 0.25, z - r * 1.66, x + r * 1.66, y + h - 0.2, z + r * 1.66));
  bag.add('cedar', box(x - r * 2.0, y + h - 0.12, z - r * 2.0, x + r * 2.0, y + h - 0.01, z + r * 2.0));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const bx = x + dx * r * 1.66, bz = z + dz * r * 1.66; bag.add('iron', box(bx - 0.035, y + h - 0.27, bz - 0.035, bx + 0.035, y + h - 0.23, bz + 0.035)); }
  col.circle(x, z, r * 1.2, y, y + h);
}

/** A rug laid on a floor: a field with a border and a few bands, rect centred (x, z), size w × d, at height y. */
export function rug(bag, x, z, w, d, y, c1 = 'cloth_maroon', c2 = 'cloth_indigo', c3 = 'cloth_ochre') {
  bag.add(c2, box(x - w / 2, y, z - d / 2, x + w / 2, y + 0.018, z + d / 2));
  bag.add(c1, box(x - w / 2 + 0.12, y + 0.018, z - d / 2 + 0.12, x + w / 2 - 0.12, y + 0.026, z + d / 2 - 0.12));
  bag.add(c3, box(x - w / 2 + 0.3, y + 0.026, z - d / 2 + 0.3, x + w / 2 - 0.3, y + 0.032, z + d / 2 - 0.3));
  bag.add(c1, box(x - w / 2 + 0.42, y + 0.032, z - d / 2 + 0.42, x + w / 2 - 0.42, y + 0.038, z + d / 2 - 0.42));
  bag.add(c2, lathe([[0.001, 0], [Math.min(w, d) * 0.2, 0], [Math.min(w, d) * 0.2, 0.006], [0.001, 0.006]], 12, null, x, y + 0.038, z));
}
/** A cushion, a bolster or a divan seat. */
export const cushion = (bag, mat, x, z, y, w = 0.6, d = 0.6, h = 0.16) => bag.add(mat, box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2));

// ── the palace ──────────────────────────────────────────────────────────────

/** The ranges of rooms round the palace's court (local frame, w the compound's half-width): rects with the side their door is on and their use. */
export function palaceRooms(w) {
  const out = [];
  const add = (name, [x0, z0, x1, z1], door, kinds) => {
    const alongZ = door === '+x' || door === '-x', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.floor(len / 6.4)), rl = len / n;
    for (let k = 0; k < n; k++) out.push({ id: `${name} ${k + 1}`, door, kind: kinds[k % kinds.length], band: [x0, z0, x1, z1], k, n, rect: alongZ ? [x0, z0 + k * rl, x1, z0 + (k + 1) * rl] : [x0 + k * rl, z0, x0 + (k + 1) * rl, z1] });
  };
  add('diwan range', [-w + 1.2, -w + 4, -w + 11, 6], '+x', ['guard', 'diwan', 'diwan', 'store', 'kitchen', 'barracks']);
  add('household range', [w - 11, -w + 4, w - 1.2, 6], '-x', ['reception', 'bedroom', 'bedroom', 'treasury', 'reception', 'store']);
  add('north range', [-26, -w + 1.2, 26, -w + 11], '+z', ['reception', 'treasury', 'diwan', 'kitchen', 'store', 'bedroom', 'reception', 'stable']);
  add('gate guard west', [-31, w - 7.2, -20, w - 1.2], '-z', ['guard']); add('gate guard east', [20, w - 7.2, 31, w - 1.2], '-z', ['guard']);
  return out;
}

/** palace: the compound (the walls, the Golden Gate on the south, the forecourt with its pool, the iwan front, the ranges round the court, the tower). */
function palace(el, ctx) {
  const [cx, cz] = mid(el.rect), W = (el.rect[2] - el.rect[0]) / 2, y = el.y ?? 0, rand = rng(el.seed ?? 762);
  local(ctx, [cx, cz], YAW[el.face || 's'], (c) => {
    const { bag, col } = c, w = W, T = 2.4, Hw = 9;
    // the enclosure: four walls, the south with the Golden Gate in the middle; corner towers; a merlon parapet
    const wallOf = (a, b, ops) => { wallRun(c, { a, b, th: T, y0: y, y1: y + Hw, mat: 'brick_buff', ops }); merlons(bag, 'brick_buff', [a[0], a[1]], [b[0], b[1]], T, y + Hw, { w: 0.9, gap: 0.8, h: 1.0 }); };
    wallOf([-w, -w], [w, -w]); wallOf([w, -w], [w, w]); wallOf([-w, w], [-w, -w]);
    wallOf([-w, w], [-5.4, w]); wallOf([5.4, w], [w, w]);
    wallArcade(bag, w, T, y, 5.4 + 0.9, w - 3.8); wallArcade(bag, w, T, y, -w + 3.8, -5.4 - 0.9);
    goldenGateFront(bag, w, T, y);
    // the Golden Gate: a gate-hall of 10.8 m across, arch 5.2 wide and 7.4 high, a gilt band and gilt-plated doors thrown open
    archway(c, { x: 0, w: 5.2, hh: 7.4, z0: w - T / 2 - 0.0, z1: w + T / 2 + 0.0, top: y + 12.5, mat: 'brick_buff', vault: 'plaster' });
    bag.add('brick_buff', box(-5.4, y, w - T / 2, -2.6, y + 12.5, w + T / 2)); bag.add('brick_buff', box(2.6, y, w - T / 2, 5.4, y + 12.5, w + T / 2));
    col.rect([-5.4, w - T / 2, -2.6, w + T / 2], y, y + 12.5); col.rect([2.6, w - T / 2, 5.4, w + T / 2], y, y + 12.5);
    bag.add('gilt_bronze', box(-5.4, y + 11.4, w + T / 2, 5.4, y + 11.9, w + T / 2 + 0.1));
    for (const sd of [-1, 1]) { bag.add('gilt_bronze', box(sd * 2.6 - 0.06, y + 0.03, w + T / 2 - 1.2, sd * 2.6 + 0.06 * (sd > 0 ? 1 : -1) - 0.06 * 0, y + 6.4, w + T / 2 - 0.1)); }
    merlons(bag, 'brick_buff', [-5.4, w], [5.4, w], T, y + 12.5, { w: 0.9, gap: 0.8, h: 1.0 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const tx = sx * w, tz = sz * w, R = 3.4, H = Hw + 4;
      bag.add('brick_buff', lathe([[R, -1], [R, H], [R + 0.35, H + 0.01], [R + 0.35, H + 0.4], [R - 0.2, H + 0.4]], 14, null, tx, y, tz));
      for (let j = 0; j < 10; j++) { const a = j / 10 * Math.PI * 2 + 0.1, x = tx + Math.cos(a) * (R + 0.1), z = tz + Math.sin(a) * (R + 0.1); bag.add('brick_buff', box(x - 0.3, y + H + 0.4, z - 0.3, x + 0.3, y + H + 1.4, z + 0.3)); }
      towerDetail(bag, tx, tz, R, H, y);
      col.circle(tx, tz, R, y, y + H);
    }
    // the forecourt: paved, a pool with a rim at its middle, the way from the gate to the iwan; flower beds either side
    bag.add('brick_paving', box(-w + 1.2, y - 0.2, 17, w - 1.2, y + 0.02, w - 1.2));
    bag.add('limestone', box(-5.6, y, 24.4, 5.6, y + 0.45, 31.6)); bag.add('water', fromTriangles([-5.0, y + 0.3, 25.0, -5.0, y + 0.3, 31.0, 5.0, y + 0.3, 31.0, -5.0, y + 0.3, 25.0, 5.0, y + 0.3, 31.0, 5.0, y + 0.3, 25.0]));
    col.rect([-5.6, 24.4, 5.6, 31.6], y, y + 0.45);
    // (the pool's rim is a solid box with the water laid over it; make the middle a shallow basin: the rim only)
    // the iwan front: a block 36 m wide and 15 m high from z = 2 to 16, the great arch in its middle, blind arcades either side
    const FZ = 16, FH = 15;
    for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? -18 : 4.55, x1 = sd < 0 ? -4.55 : 18;
      bag.add('brick_buff', box(x0, y - 0.5, -2, x1, y + FH, FZ)); col.rect([x0, -2, x1, FZ], y, y + FH);
      // beside the great arch a framed field of carved stucco 3 m wide (the pishtaq's pier); beyond it blind pointed arches in two ranks, their frames in baked brick
      const near = sd < 0 ? x1 : x0, pu0 = sd < 0 ? near - 3.0 : near + 0.25, pu1 = sd < 0 ? near - 0.25 : near + 3.0, ffr = { O: [0, FZ], U: [1, 0], N: [0, 1] };
      stuccoPanel(bag, ffr, pu0 + 0.2, pu1 - 0.2, y + 0.6, y + 7.3, 0.06, 'stucco', 0.62);
      stuccoPanel(bag, ffr, pu0 + 0.2, pu1 - 0.2, y + 7.9, y + 14.0, 0.06, 'stucco', 0.85);
      bag.add('plaster_white', box(pu0, y, FZ, pu0 + 0.2, y + 14.4, FZ + 0.16)); bag.add('plaster_white', box(pu1 - 0.2, y, FZ, pu1, y + 14.4, FZ + 0.16));
      bag.add('plaster_white', box(pu0, y + 7.3, FZ, pu1, y + 7.9, FZ + 0.16)); bag.add('plaster_white', box(pu0, y + 14.0, FZ, pu1, y + 14.4, FZ + 0.16)); bag.add('plaster_white', box(pu0, y, FZ, pu1, y + 0.6, FZ + 0.16));
      const ax0 = sd < 0 ? x0 : near + 3.4, ax1 = sd < 0 ? near - 3.4 : x1, n = 3, bw = (ax1 - ax0 - 0.8) / n;
      for (let k = 0; k < n; k++) {
        const u0 = ax0 + 0.4 + k * bw + 0.45, w2 = bw - 0.9, fr = { O: [u0, FZ], U: [1, 0], N: [0, 1] };
        bag.add('brick_baked', polyGeo(fr, archPoly(0, y + 0.8, w2, 5.0), 0, 0.04));
        archBand(bag, fr, 0, y + 0.8, w2, 5.0, 0.35, 0.0, 0.12, ['brick_baked', 'brick_buff']);
        bag.add('brick_baked', polyGeo(fr, archPoly(0, y + 8.4, w2, 4.0), 0, 0.04));
        archBand(bag, fr, 0, y + 8.4, w2, 4.0, 0.3, 0.0, 0.12, ['brick_baked', 'brick_buff']);
        stuccoPanel(bag, fr, 0.2, w2 - 0.2, y + 6.0, y + 7.2, 0.045, 'stucco', 0.34);
      }
      bag.add('plaster_white', box(x0 - 0.1, y + FH - 0.5, -2, x1 + 0.1, y + FH, FZ + 0.25));
      stuccoPanel(bag, ffr, x0 + 0.2, x1 - 0.2, y + FH - 1.5, y + FH - 0.7, 0.045, 'stucco', 0.3);
    }
    merlons(bag, 'plaster_white', [-18, FZ], [18, FZ], 0.9, y + FH, { w: 1.0, gap: 0.9, h: 1.2 });
    // the great iwan: 9.1 m wide, its arch 14 m high; a deep barrel vault, its back wall the tower's south face; floor of marble
    archway(c, { x: 0, w: 9.1, hh: 14, z0: -2, z1: FZ, top: y + FH, mat: 'brick_buff', vault: 'plaster_white' });
    bag.add('marble_floor', box(-4.55, y - 0.2, -2, 4.55, y + 0.05, FZ));
    col.floor([-4.55, -2, 4.55, FZ], y + 0.05);
    bag.add('gilt_bronze', box(-4.65, y + 14.2, FZ + 0.05, 4.65, y + 14.5, FZ + 0.14));
    // the tower at the iwan's back (the audience chamber, drum, dome)
    local(c, [0, -9.0], 0, (t) => {
      greenDome(t, y);
      t.bag.add('marble_floor', box(-HS, y - 0.2, -HS, HS, y + 0.4, HS)); t.col.floor([-HS, -HS, HS, HS], y + 0.4);
      // the furnishing of the chamber: the throne on a stepped dais against the north wall, rugs, cushions, hanging lamps, curtains
      furnishChamber(t, y + 0.4);
    });
    // the ranges round the court: east and west (rooms with an arcade on the court), the north range behind the tower
    buildRooms(c, palaceRooms(w), { y, RH: 6.4, TOP: 8.0, ceil: 4.8, floor: 'marble_floor', rand });
    // the court's gardens: beds of orange and pomegranate under the walls of the iwan block, the long court between the ranges, the forecourt's four beds
    for (const sx of [-1, 1]) {
      for (let z = -30; z <= 12; z += 6) gardenTree(bag, col, sx * 22.6, z, y, 2.6 + (Math.abs(z) % 7) * 0.08, 1.1);
      bag.add('brick_paving', box(sx * 20.6 - 0.6, y, -32, sx * 20.6 + 0.6, y + 0.02, 14));
      for (let k = 0; k < 4; k++) for (const sz of [-1, 1]) {
        const bx = sx * (14 + k * 6), bz = 27 + sz * 0 + (k % 2) * 0;
        void bx; void bz;
      }
      for (const [bx, bz] of [[sx * 14, 20.5], [sx * 21, 20.5], [sx * 28, 20.5], [sx * 14, 25], [sx * 21, 25], [sx * 28, 25]]) {
        bag.add('silt', box(bx - 1.8, y, bz - 1.8, bx + 1.8, y + 0.14, bz + 1.8)); gardenTree(bag, col, bx, bz, y + 0.14, 2.3, 1.0, true);
        for (let q = 0; q < 4; q++) bag.add(['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_maroon'][q], lathe([[0.001, 0], [0.12, 0.02], [0.16, 0.12], [0.001, 0.2]], 6, null, bx - 1.2 + (q % 2) * 2.4, y + 0.14, bz - 1.2 + Math.floor(q / 2) * 2.4));
      }
    }
    // a channel of water (nahr) running from the pool to the iwan's steps
    bag.add('limestone', box(-0.5, y, 17.4, 0.5, y + 0.12, 24.4)); bag.add('water', fromTriangles([-0.32, y + 0.08, 17.5, -0.32, y + 0.08, 24.4, 0.32, y + 0.08, 24.4, -0.32, y + 0.08, 17.5, 0.32, y + 0.08, 24.4, 0.32, y + 0.08, 17.5]));
    // the stairs of the iwan's front: three steps of marble
    for (let k = 0; k < 3; k++) bag.add('marble', box(-5.2 - k * 0.3, y, FZ + 0.2 + k * 0.4 - 0.2, 5.2 + k * 0.3, y + 0.45 - k * 0.15, FZ + 0.6 + k * 0.4));
    void rand;
  });
}

function furnishChamber({ bag, col, lights }, y) {
  // the dais: three steps up to a platform 2 m deep carpeted in maroon against the north wall; the throne a low seat with a high back; the curtains of black silk by the great arch
  for (let k = 0; k < 3; k++) { bag.add('marble', box(-3.2 + k * 0.3, y, -5.0 + (2 - k) * 0.3, 3.2 - k * 0.3, y + 0.18 * (k + 1), -3.0)); }
  col.rect([-3.2, -5.0, 3.2, -3.0], y, y + 0.54);
  rug(bag, 0, -4.0, 5.4, 1.8, y + 0.54, 'cloth_maroon', 'cloth_indigo', 'gilt_bronze');
  bag.add('cedar', box(-0.9, y + 0.54, -4.8, 0.9, y + 1.0, -3.6)); bag.add('cedar', box(-0.9, y + 1.0, -4.9, 0.9, y + 2.0, -4.7)); bag.add('gilt_bronze', box(-0.95, y + 1.95, -4.95, 0.95, y + 2.05, -4.65));
  cushion(bag, 'cloth_maroon', 0, -4.2, y + 1.0, 1.6, 1.0, 0.18);
  for (const sx of [-1, 1]) bag.add('cedar', box(sx * 0.9 - 0.06 * sx - 0.03, y + 0.54, -4.8, sx * 0.9 + 0.06 * sx, y + 1.5, -4.7));
  for (const sx of [-1, 1]) { bag.add('cloth_black', box(sx * 3.7 - 0.5, y + 0.2, 4.78, sx * 3.7 + 0.5, y + 9.4, 4.84)); bag.add('gilt_bronze', box(sx * 3.7 - 0.5, y + 9.2, 4.78, sx * 3.7 + 0.5, y + 9.4, 4.85)); }
  rug(bag, 0, 0.8, 7.0, 6.0, y, 'cloth_indigo', 'cloth_maroon', 'cloth_ochre');
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { cushion(bag, k % 2 ? 'cloth_maroon' : 'cloth_green', sx * 4.4, -2.2 + k * 1.7, y, 0.9, 0.9, 0.22); }
  // hanging lamps of glass and bronze on chains from the dome (each lit)
  for (const [lx, lz] of [[-2.6, -1.4], [2.6, -1.4], [0, 1.6], [-2.6, 3.0], [2.6, 3.0]]) {
    bag.add('bronze', lathe([[0.2, 0], [0.12, 0.2], [0.04, 0.26]], 10, null, lx, y + 7.2, lz)); bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.2], [0.001, 0.3]], 10, null, lx, y + 7.3, lz));
    bag.add('iron', box(lx - 0.01, y + 7.6, lz - 0.01, lx + 0.01, ceilY(y, lx, lz) + 0.05, lz + 0.01));
    lights.push({ at: [lx, y + 7.5, lz], color: '#ffc27a', intensity: 6, distance: 12 });
  }
  // stucco dado round the chamber walls (style C), 2.6 m high, with a band of lapis tile over it
  const S = HS;
  for (const [a, b, ox, oz] of [[[-S, -S], [S, -S], 0, 1], [[-S, -S], [-S, S], 1, 0], [[S, -S], [S, S], -1, 0]]) {
    const f2 = { O: [a[0], a[1]], U: [(b[0] - a[0]) / (2 * S), (b[1] - a[1]) / (2 * S)], N: [ox, oz] };
    const door = ox !== 0;                                              // the east and west walls have a door in the middle (3.4 m, apex 5.6)
    if (door) { for (const [u0, u1] of [[0, S - 1.8], [S + 1.8, 2 * S]]) stuccoPanel(bag, f2, u0, u1, y, y + 2.6, 0.04, 'stucco', 0.4); stuccoPanel(bag, f2, 0, 2 * S, y + 5.9, y + 8.6, 0.03, 'stucco', 0.85); for (const [u0, u1] of [[0, S - 1.8], [S + 1.8, 2 * S]]) stuccoPanel(bag, f2, u0, u1, y + 3.1, y + 5.8, 0.03, 'stucco', 0.85); }
    else { stuccoPanel(bag, f2, 0.0, 2 * S, y, y + 2.6, 0.04, 'stucco', 0.4); stuccoPanel(bag, f2, 0.0, 2 * S, y + 3.1, y + 8.6, 0.03, 'stucco', 0.85); }
    for (const [s0, s1] of door ? [[-S, -1.7], [1.7, S]] : [[-S, S]]) bag.add('tile_lapis', door ? box(ox > 0 ? -S : S - 0.04, y + 2.6, s0, ox > 0 ? -S + 0.04 : S, y + 2.9, s1) : box(s0, y + 2.6, -S, s1, y + 2.9, -S + 0.04));
  }
  lights.push({ at: [0, y + 4, 0], color: '#fff0d0', intensity: 3, distance: 16 });
}

// ── the Great Mosque of al-Mansur ───────────────────────────────────────────

/**
 * mosque: { rect, y, face, seed } — 52 m square: the sahn with its riwaqs of teak columns on the north, the prayer hall of five
 * aisles on the qibla (south) side, the qibla wall with its mihrab, a flat roof of teak beams and palm-rib laths, the doors.
 */
function mosque(el, ctx) {
  const [cx, cz] = mid(el.rect), H = (el.rect[2] - el.rect[0]) / 2, y = el.y ?? 0;
  local(ctx, [cx, cz], YAW[el.face || 's'], (c) => {
    const { bag, col, lights } = c, T = 1.5, WH = 9;
    const ops = (xs, w = 3.4, h = 4.6) => xs.map((at) => ({ at, w, h }));
    // the outer wall (baked brick with a white wash above 3 m); doors: north (into the sahn), east and west (into the sahn and the hall)
    const W = (a, b, o) => { wallRun(c, { a, b, th: T, y0: y, y1: y + WH, mat: 'mudbrick', ops: o }); bag.add('plaster_white', orientedBox([a[0], a[1]], [b[0], b[1]], T + 0.08, y + 6.2, y + WH)); };
    const bw = 2 * H / MOSQUE_BAYS, bayAt = (ks) => ks.map((k) => (k + 0.5) * bw);
    W([-H, -H], [H, -H], ops(bayAt([4]), 3.0, 4.4)); W([H, -H], [H, H], ops(bayAt([2, 7]), 3.0, 4.4)); W([-H, H], [-H, -H], ops(bayAt([1, 5]), 3.0, 4.4));
    W([-H, H], [H, H], [{ at: H, w: 1.8, h: 3.6 }]);                        // the qibla wall, cut for the mihrab's niche (its back is filled below, 0.7 m behind the inner face)
    mosqueExterior(c, { H, T, WH, y });
    // the sahn: the paved court 26 m deep, open; the riwaqs on its north, east and west sides, one bay deep, a flat roof on teak
    const hallZ0 = 2, hallZ1 = H - T / 2;
    bag.add('brick_paving', box(-H + T / 2, y - 0.2, -H + T / 2, H - T / 2, y + 0.02, H - T / 2));
    const rows = (x0, x1, z0, z1, nx, nz, ytop, rowsAt = null) => {
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const x = nx > 1 ? x0 + (x1 - x0) * i / (nx - 1) : x0, z = nz > 1 ? z0 + (z1 - z0) * j / (nz - 1) : z0;
        if (rowsAt && !rowsAt(i, j)) continue;
        teak(bag, col, x, z, y, ytop);
      }
    };
    const CH = 4.6, RY = y + CH;
    // the prayer hall: 11 columns across (4.6 m apart) in 5 rows from the sahn's edge (z = 2) to the qibla wall, an arcade of beams
    const nx = 11, nz = 5, xA = -23, xB = 23, zA = 4.5, zB = hallZ1 - 2.3;
    rows(xA, xB, zA, zB, nx, nz, CH);
    // the beams: along x on the columns' heads, across z above them; the roof slab of laths and earth
    for (let j = 0; j < nz; j++) { const z = zA + (zB - zA) * j / (nz - 1); bag.add('cedar', box(xA - 1.4, y + CH, z - 0.22, xB + 1.4, y + CH + 0.4, z + 0.22)); }
    for (let i = 0; i < 2 * (nx - 1) + 1; i++) { const x = xA + (xB - xA) * i / (2 * (nx - 1)); bag.add('cedar', box(x - 0.13, y + CH + 0.4, hallZ0, x + 0.13, y + CH + 0.72, hallZ1)); }
    bag.add('timber', box(-H + T / 2, y + CH + 0.72, hallZ0 - 0.4, H - T / 2, y + CH + 0.9, hallZ1)); bag.add('mud_plaster', box(-H + T / 2, y + CH + 0.9, hallZ0 - 0.4, H - T / 2, y + CH + 1.2, hallZ1));
    merlons(bag, 'plaster_white', [-H, hallZ0 - 0.4], [H, hallZ0 - 0.4], 0.3, y + CH + 1.2, { w: 0.0001, gap: 100, h: 0.001 });
    col.rect([-H + T / 2, hallZ0 - 0.4, H - T / 2, hallZ0 - 0.2], y, y + CH + 1.2);              // (the prayer hall's north face is the arcade: its beam wall stops the roof; open below)
    // the hall's floor of mats over beaten earth, the qibla wall's mihrab, the minbar
    bag.add('ground', box(-H + T / 2, y - 0.2, hallZ0, H - T / 2, y + 0.02, hallZ1));
    for (let k = 0; k < 11; k++) { const xx = -23.5 + k * 4.7; if (k % 2 === 0) bag.add('reed_mat', box(xx, y + 0.02, hallZ0 + 1.5, xx + 3.9, y + 0.05, hallZ1 - 0.4)); }
    // the riwaqs
    for (const [x0, x1, z0, z1, a, b] of [[-H + 3.4, H - 3.4, -H + 3.4, -H + 3.4, 11, 1], [-H + 3.4, -H + 3.4, -H + 7.4, hallZ0 - 3.0, 1, 4], [H - 3.4, H - 3.4, -H + 7.4, hallZ0 - 3.0, 1, 4]]) rows(x0, x1, z0, z1, a, b, CH - 0.8);
    const rh = CH - 0.8;
    bag.add('cedar', box(-H + T / 2, y + rh, -H + T / 2, H - T / 2, y + rh + 0.3, -H + 5.8)); bag.add('mud_plaster', box(-H + T / 2, y + rh + 0.3, -H + T / 2, H - T / 2, y + rh + 0.55, -H + 5.8));
    for (const sd of [-1, 1]) { const x0 = sd < 0 ? -H + T / 2 : H - 5.8, x1 = sd < 0 ? -H + 5.8 : H - T / 2; bag.add('cedar', box(x0, y + rh, -H + 5.8, x1, y + rh + 0.3, hallZ0 - 0.4)); bag.add('mud_plaster', box(x0, y + rh + 0.3, -H + 5.8, x1, y + rh + 0.55, hallZ0 - 0.4)); }
    // the basin in the sahn: an octagonal rim of stone, water, a spout
    bag.add('limestone', lathe([[2.5, 0], [2.5, 0.7], [2.1, 0.7], [2.1, 0.5]], 8, null, 0, y, -12)); bag.add('water', lathe([[0.001, 0], [2.1, 0]], 8, null, 0, y + 0.5, -12)); col.circle(0, -12, 2.5, y, y + 0.7);
    // the mihrab (a niche cut through the qibla wall, its back plugged 0.7 m deep), the minbar, the lamps
    const mz = hallZ1;
    bag.add('mudbrick', box(-0.9, y, mz + 0.7, 0.9, y + 3.6, H + T / 2 - 0.03)); col.rect([-0.9, mz + 0.7, 0.9, H + T / 2], y, y + 3.7);
    mihrab(c, { mz, y, T });
    minbar(c, { x: 6.9, zWall: mz, y });
    // Qur'an stands on the mats, jars of drinking water by the sahn's edge, glass lamps hung under the riwaq's beams
    for (const [rx, rz] of [[-15.4, 11.6], [-6.2, 11.6], [7.0, 16.2], [16.2, 16.2]]) rahla(c, rx, rz, y + 0.05);
    for (let k = 0; k < 4; k++) zir(bag, col, -13.8 + k * 9.2, hallZ0 + 0.6, y, 1.0);
    for (let k = 0; k < 10; k++) hangLamp(bag, -H + 3.4 + (H * 2 - 6.8) * (k + 0.5) / 10, -H + 3.4, y + rh, 0.7);
    for (const lx of [-9.2, -4.6, 0, 4.6, 9.2]) {
      bag.add('iron', box(lx - 0.01, y + 2.2, mz - 5.2 - 0.01, lx + 0.01, y + CH, mz - 5.2 + 0.01)); bag.add('lamp_glass', lathe([[0.001, 0], [0.16, 0.06], [0.18, 0.28], [0.001, 0.4]], 10, null, lx, y + 2.0, mz - 5.2));
      lights.push({ at: [lx, y + 2.2, mz - 5.2], color: '#ffc27a', intensity: 4, distance: 9 });
    }
    // windows high in the qibla wall, one in each bay: a pointed arch with a ring of brick and a colonette, a daylight pane
    { const wf = { O: [-H, mz], U: [1, 0], N: [0, -1] }, bw2 = 2 * H / MOSQUE_BAYS;
      for (let k = 0; k < MOSQUE_BAYS; k++) { const uc = (k + 0.5) * bw2; bag.add('daylight', polyGeo(wf, archPoly(uc - 0.6, y + 6.1, 1.2, 2.0), 0, 0.02)); archBand(bag, wf, uc - 0.6, y + 6.1, 1.2, 2.0, 0.22, 0, 0.09, ['brick_buff', 'plaster_white']); bag.add('cedar', box(-H + uc - 0.03, y + 6.1, mz - 0.1, -H + uc + 0.03, y + 7.6, mz - 0.04)); } }
  });
}

export const palaceElements = { golden_palace: palace, great_mosque: mosque };
void rng; void D2R;
