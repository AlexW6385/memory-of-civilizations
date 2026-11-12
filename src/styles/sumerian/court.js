// The Court of Nanna furnished (docs/settlements/ur.md §4.4): the court before the ziggurat's terrace was not a bare
// pavement — benches of baked brick along its walls for the people who waited, the great altar of burnt offering and
// the table of offerings, basins of bitumen-lined brick for the washing of hands, stelae of the king on plinths,
// tripod braziers of bronze, a shaded pavilion of reed mats for the musicians and the scribes, a pen of reed
// for the beasts of the offering, stacks of fuel, jars of water on their stands, date palms in brick-edged pits.
// el.rect = the court. All small things are detail; the colliders are for the large ones.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { palm } from '../egyptian/objects.js';
import { crescent } from './index.js';

const BB = 'brick_baked', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const jarP = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];

export function courtDress(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(4711), y = el.y ?? 0;
  const B = (mat, a, b, c, d, e, f) => bag.add(mat, box(a, b, c, d, e, f));
  const L = (mat, prof, x, yy, z, seg = 12) => bag.add(mat, lathe(prof, seg, null, x, yy, z));
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const jar = (x, yy, z, s) => L('terracotta', jarP(s), x, yy, z);
  const bowl = (x, yy, z, r, mat = 'terracotta') => L(mat, [[0.001, 0], [r * 0.45, 0.005], [r, r * 0.45], [r * 0.93, r * 0.47], [r * 0.4, r * 0.12], [0.001, r * 0.1]], x, yy, z);
  // ---- benches along the inner faces of the walls (the wall's face stands 1.25 m in from the rect's edge)
  const bench = (a0, b0, a1, b1) => { B(BB, a0, y, b0, a1, y + 0.43, b1); B(MP, a0 - 0.01, y + 0.43, b0 - 0.01, a1 + 0.01, y + 0.47, b1 + 0.01); col.rect([a0, b0, a1, b1], y, y + 0.47); };
  for (const s of [-1, 1]) {
    const fx = s < 0 ? x0 + 1.25 : x1 - 1.25;
    for (let z = z0 + 9; z < z1 - 12; z += 8.5) bench(s < 0 ? fx : fx - 0.55, z, s < 0 ? fx + 0.55 : fx, z + 6.5);
  }
  for (const s of [-1, 1]) for (let x = 14; x < 44; x += 8.5) bench(s < 0 ? -x - 6.5 : x, z0 + 1.25, s < 0 ? -x : x + 6.5, z0 + 1.8);
  // ---- the great altar of burnt offering: a stepped block of baked brick, its top blackened by the fire, horns of brick at the corners
  { const ax = -17, az = z0 + 40;
    for (let k = 0; k < 3; k++) B(BB, ax - 1.2, y, az + 1.2 + (2 - k) * 0.4, ax + 1.2, y + (k + 1) * 0.3, az + 1.2 + (3 - k) * 0.4);
    B(BB, ax - 1.7, y, az - 1.2, ax + 1.7, y + 1.15, az + 1.2); col.rect([ax - 1.9, az - 1.4, ax + 1.9, az + 2.6], y, y + 1.2);
    B('pottery_dark', ax - 1.5, y + 1.15, az - 1.0, ax + 1.5, y + 1.18, az + 1.0);
    for (const [dx, dz] of [[-1.55, -1.05], [1.55, -1.05], [-1.55, 1.05], [1.55, 1.05]]) B(BB, ax + dx - 0.15, y + 1.18, az + dz - 0.15, ax + dx + 0.15, y + 1.5, az + dz + 0.15);
    B('flame', ax - 0.3, y + 1.18, az - 0.3, ax + 0.3, y + 1.9, az + 0.3);
    lights.push({ at: [ax, y + 2.2, az], color: '#ff9a4a', intensity: 7, distance: 16 });
  }
  // ---- the table of offerings: a long brick table with bowls, loaves, a jar of beer, a lamb's carcass on a tray
  { const tx = 17, tz = z0 + 40; B(BB, tx - 1.6, y, tz - 0.6, tx + 1.6, y + 0.85, tz + 0.6); B(MP, tx - 1.7, y + 0.85, tz - 0.7, tx + 1.7, y + 0.92, tz + 0.7); col.rect([tx - 1.7, tz - 0.7, tx + 1.7, tz + 0.7], y, y + 0.92);
    for (let k = 0; k < 6; k++) bowl(tx - 1.3 + k * 0.5, y + 0.92, tz - 0.25 + (k % 2) * 0.45, 0.14);
    for (let k = 0; k < 5; k++) L('cloth_ochre', [[0.001, 0], [0.12, 0.0], [0.13, 0.025], [0.001, 0.035]], tx - 1.0 + k * 0.4, y + 0.92, tz + 0.05, 10);
    jar(tx + 1.3, y + 0.92, tz - 0.1, 0.85); }
  // ---- the basins for washing the hands: bitumen-lined troughs on brick plinths either side of the way in
  for (const s of [-1, 1]) { const bx = s * 12, bz = z0 + 14;
    B(BB, bx - 1.4, y, bz - 0.6, bx + 1.4, y + 0.7, bz + 0.6); B('bitumen', bx - 1.2, y + 0.68, bz - 0.4, bx + 1.2, y + 0.72, bz + 0.4); B(BB, bx - 1.4, y + 0.7, bz - 0.6, bx + 1.4, y + 0.78, bz - 0.4); B(BB, bx - 1.4, y + 0.7, bz + 0.4, bx + 1.4, y + 0.78, bz + 0.6);
    col.rect([bx - 1.4, bz - 0.6, bx + 1.4, bz + 0.6], y, y + 0.78); jar(bx + s * 1.9, y, bz, 1.2); jar(bx + s * 2.3, y, bz + 0.3, 1.0); }
  // ---- stelae of the king on plinths: a slab of limestone with a rounded top and bands of relief in registers (the Ur-Nammu stela's)
  for (const s of [-1, 1]) { const sx = s * 31, sz = z0 + 28;
    B(BB, sx - 1.0, y, sz - 0.8, sx + 1.0, y + 0.55, sz + 0.8); col.rect([sx - 1.0, sz - 0.8, sx + 1.0, sz + 0.8], y, y + 0.6);
    B('limestone', sx - 0.5, y + 0.55, sz - 0.14, sx + 0.5, y + 3.0, sz + 0.14);
    bag.add('limestone', lathe([[0.001, 0], [0.5, 0], [0.5, 0.28], [0.001, 0.28]], 16).rotateX(Math.PI / 2).translate(sx, y + 3.0, sz - 0.14));
    for (let k = 0; k < 4; k++) { const yy = y + 0.8 + k * 0.52; B('limestone_carved', sx - 0.42, yy, sz - 0.152, sx + 0.42, yy + 0.4, sz - 0.14); for (let j = 0; j < 3; j++) B('limestone', sx - 0.3 + j * 0.27, yy + 0.08, sz - 0.158, sx - 0.12 + j * 0.27, yy + 0.32, sz - 0.152); }
    col.rect([sx - 0.5, sz - 0.2, sx + 0.5, sz + 0.2], y, y + 3.2); }
  // ---- tripod braziers of bronze, lit, along the axis
  for (const [bx, bz, lit] of [[-7, z0 + 20, true], [7, z0 + 20, false], [-7, z0 + 44, false], [7, z0 + 44, true]]) {
    L('bronze', [[0.001, 0.85], [0.3, 0.9], [0.34, 1.05], [0.3, 1.07], [0.001, 0.95]], bx, y, bz, 12);
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; beam('bronze', [bx + Math.cos(a) * 0.3, y + 0.9, bz + Math.sin(a) * 0.3], [bx + Math.cos(a) * 0.1, y + 0.0, bz + Math.sin(a) * 0.1], 0.025, 0.03); beam('bronze', [bx + Math.cos(a) * 0.3, y + 0.9, bz + Math.sin(a) * 0.3], [bx + Math.cos(a) * 0.46, y + 0.0, bz + Math.sin(a) * 0.46], 0.025, 0.03); }
    L('pottery_dark', [[0.001, 1.0], [0.26, 1.04], [0.001, 1.04]], bx, y, bz, 10);
    if (lit) { B('flame', bx - 0.12, y + 1.04, bz - 0.12, bx + 0.12, y + 1.4, bz + 0.12); lights.push({ at: [bx, y + 1.6, bz], color: '#ff9a4a', intensity: 4, distance: 10 }); }
    col.circle(bx, bz, 0.4, y, y + 1.1);
  }
  // ---- the pavilion of reed mats on palm posts: shade for the musicians and the scribes (east side)
  { const px = 33, pz = z0 + 52, w = 8, d = 5;
    for (const dx of [-w / 2, 0, w / 2]) for (const dz of [-d / 2, d / 2]) { B('palm_trunk', px + dx - 0.1, y, pz + dz - 0.1, px + dx + 0.1, y + 3.3, pz + dz + 0.1); col.circle(px + dx, pz + dz, 0.12, y, y + 3.3); }
    for (const dz of [-d / 2, d / 2]) beam('palm_trunk', [px - w / 2 - 0.2, y + 3.2, pz + dz], [px + w / 2 + 0.2, y + 3.2, pz + dz], 0.08, 0.14);
    for (let x = px - w / 2; x <= px + w / 2; x += 0.9) beam('palm_trunk', [x, y + 3.34, pz - d / 2 - 0.3], [x, y + 3.34, pz + d / 2 + 0.3], 0.05, 0.08);
    B('reed_mat', px - w / 2 - 0.3, y + 3.42, pz - d / 2 - 0.4, px + w / 2 + 0.3, y + 3.47, pz + d / 2 + 0.4);
    B('reed_mat', px - w / 2 + 0.3, y + 0.0, pz - d / 2 + 0.3, px + w / 2 - 0.3, y + 0.012, pz + d / 2 - 0.3);
    bench(px - 3.4, pz + d / 2 - 0.7, px + 3.4, pz + d / 2 - 0.2); }
  // ---- the pen of reed mats for the beasts of the offering (west side): a fence of mats on posts, a gate gap, a trough and a heap of fodder
  { const qx = -33, qz = z0 + 52, w = 9, d = 6, h = 1.15;
    const wallx = (a, b, z) => { B('reed_mat', a, y, z - 0.04, b, y + h, z + 0.04); col.rect([a, z - 0.1, b, z + 0.1], y, y + h); for (let x = a; x <= b + 0.01; x += 1.5) B('palm_trunk', x - 0.05, y, z - 0.07, x + 0.05, y + h + 0.2, z + 0.07); };
    const wallz = (a, b, x) => { B('reed_mat', x - 0.04, y, a, x + 0.04, y + h, b); col.rect([x - 0.1, a, x + 0.1, b], y, y + h); for (let z = a; z <= b + 0.01; z += 1.5) B('palm_trunk', x - 0.07, y, z - 0.05, x + 0.07, y + h + 0.2, z + 0.05); };
    wallx(qx - w / 2, qx + w / 2, qz - d / 2); wallx(qx - w / 2, qx - 1.3, qz + d / 2); wallx(qx + 1.3, qx + w / 2, qz + d / 2); wallz(qz - d / 2, qz + d / 2, qx - w / 2); wallz(qz - d / 2, qz + d / 2, qx + w / 2);
    B('timber', qx - 3.5, y, qz - d / 2 + 0.3, qx - 0.5, y + 0.3, qz - d / 2 + 0.7); B('bitumen', qx - 3.4, y + 0.26, qz - d / 2 + 0.36, qx - 0.6, y + 0.3, qz - d / 2 + 0.64);
    for (let k = 0; k < 7; k++) beam('reed_mat', [qx + 1.5, y + 0.0 + (k > 4 ? 0.15 : 0), qz - d / 2 + 0.5 + (k % 5) * 0.14], [qx + 3.3, y + 0.0 + (k > 4 ? 0.15 : 0), qz - d / 2 + 0.5 + (k % 5) * 0.14], 0.06, 0.13); }
  // ---- stacks of fuel (split palm trunks) by the altar, water jars on ring stands by the entrance
  for (const [fx, fz] of [[-24, z0 + 33], [-24, z0 + 36.5]]) for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - (r >> 1); k++) beam('palm_trunk', [fx - 1.0, y + 0.1 + r * 0.2, fz + (k - 2 + (r & 1) * 0.5) * 0.0], [fx + 1.0, y + 0.1 + r * 0.2, fz], 0.1, 0.18);
  for (let k = 0; k < 5; k++) { const jx = (k < 3 ? -9 - k * 1.8 : 9 + (k - 3) * 1.8), jz = z0 + 7; L(BB, [[0.28, 0], [0.28, 0.12], [0.18, 0.12]], jx, y, jz, 10); L('terracotta', jarP(1.25), jx, y + 0.12, jz, 12); col.circle(jx, jz, 0.3, y, y + 1.1); }
  // ---- date palms in brick-edged pits (the temple's grove)
  const palms = [[-40, z0 + 14], [40, z0 + 14], [-42, z0 + 40], [42, z0 + 38], [-24, z0 + 58], [24, z0 + 58], [-15, z0 + 33], [15, z0 + 33], [-15, z0 + 50], [15, z0 + 50]];   // (the last four line the way to the stairs)
  palms.forEach(([px, pz], i) => {
    bag.add(BB, lathe([[1.05, 0], [1.05, 0.2], [0.85, 0.2], [0.85, 0]], 16, null, px, y, pz)); bag.add('silt', lathe([[0.001, 0.12], [0.85, 0.12], [0.85, 0.15], [0.001, 0.15]], 14, null, px, y, pz));
    palm({ at: [px, pz], y, h: 8 + rand() * 3, lean: (rand() - 0.5) * 0.012, seed: 100 + i }, { bag, col }); col.circle(px, pz, 0.5, y, y + 6);
  });
  // ---- the pavement (docs/settlements/ur.md §4.4a): the court was paved in baked brick set in bitumen; down its axis the sacred way of
  // pale buff brick, 11 m wide, kerbed in limestone; the ash of the altar's fires blackening the bricks round it
  const tp = 0.035;
  { const px0 = x0 + 1.25, px1 = x1 - 1.25, pz0 = z0 + 1.25, wy = 0.05;
    B(BB, px0, y - 0.03, pz0, px1, y + tp, z1); col.floor([px0, pz0, px1, z1], y + tp);
    B('brick_buff', -5.5, y + tp, pz0, 5.5, y + wy, z1); col.floor([-5.5, pz0, 5.5, z1], y + wy);
    B('reed_mat', 4.1, wy, z0 + 35.4, 5.45, wy + 0.008, z0 + 40.2);                                                  // the musicians' mat at the way's east edge
    for (const sx of [-1, 1]) B('limestone', sx * 5.5 - (sx > 0 ? 0 : 0.28), y + tp, pz0, sx * 5.5 + (sx > 0 ? 0.28 : 0), y + 0.13, z1);
    for (const [ax, az, r] of [[-17, z0 + 40, 2.9], [17, z0 + 40, 2.2], [-7, z0 + 20, 1.1], [7, z0 + 44, 1.1]]) bag.add('pottery_dark', lathe([[0.001, y + tp + 0.002], [r, y + tp + 0.002], [r * 0.97, y + tp]], 18, null, ax, 0, az)); }
  // ---- the standards of the gods along the way: palm-trunk poles on brick plinths bearing the gilded crescent of Nanna, a pennant under each
  const flag = (x, yt, z, dir, mat, len = 1.7, w = 0.85) => {
    const T = [], a = [x, yt, z], b = [x + dir * w, yt - 0.1, z], c = [x + dir * w, yt - len, z], d = [x, yt - len + 0.1, z];
    T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); bag.add(mat + '+wind', fromTriangles(T));
  };
  for (const sx of [-1, 1]) for (const [k, dz] of [[0, 33], [1, 41.5], [2, 50]]) {
    const px = sx * 10.5, pz = z0 + dz, top = y + 6.2;
    B(BB, px - 0.5, y, pz - 0.5, px + 0.5, y + 0.55, pz + 0.5); col.rect([px - 0.5, pz - 0.5, px + 0.5, pz + 0.5], y, y + 0.55);
    L('palm_trunk', [[0.12, 0.55], [0.09, 3], [0.065, 6.2]], px, y, pz, 8); col.circle(px, pz, 0.14, y, top);
    crescent(bag, px, top + 0.62, pz - 0.07, 0.62, 0.42, 0.14);
    flag(px, top - 0.35, pz - 0.1, -sx, ['cloth_red', 'cloth_white', 'cloth_blue'][(k + (sx > 0 ? 1 : 0)) % 3]);
  }
  // ---- two altars of libation flanking the foot of the stairs, bowls of fire on them
  for (const sx of [-1, 1]) { const ax = sx * 9.5, az = z1 - 7.5;
    B(BB, ax - 1.0, y, az - 0.65, ax + 1.0, y + 1.05, az + 0.65); B(MP, ax - 1.1, y + 1.05, az - 0.75, ax + 1.1, y + 1.12, az + 0.75); col.rect([ax - 1.1, az - 0.75, ax + 1.1, az + 0.75], y, y + 1.12);
    L('pottery_dark', [[0.001, 0], [0.3, 0], [0.34, 0.12], [0.001, 0.12]], ax, y + 1.12, az, 12); B('flame', ax - 0.12, y + 1.24, az - 0.12, ax + 0.12, y + 1.62, az + 0.12);
    for (const dx of [-0.6, 0.6]) bowl(ax + dx, y + 1.12, az, 0.12); }
  // ---- the walls of the court (docs/settlements/ur.md §4.4a): a coping of buff brick along their tops, and between the buttresses the
  // tall blind niches of a temple's recessed panelling, dark against the plaster
  { const n = Math.floor((z1 - z0) / 4), run = (z1 - z0) / n;
    for (const sx of [-1, 1]) {
      const fx = sx < 0 ? x0 + 1.25 : x1 - 1.25, wx0 = sx < 0 ? x0 - 1.4 : x1 - 1.4, wx1 = sx < 0 ? x0 + 1.4 : x1 + 1.4;
      B('brick_buff', wx0, 5.0, z0 - 1.4, wx1, 5.32, z1);
      for (let i = 0; i < n; i++) { const zc = z0 + (i + 0.5) * run; B('opening', sx < 0 ? fx : fx - 0.03, 1.15, zc - 0.7, sx < 0 ? fx + 0.03 : fx, 3.9, zc + 0.7); B('brick_buff', sx < 0 ? fx : fx - 0.05, 3.9, zc - 0.85, sx < 0 ? fx + 0.05 : fx, 4.1, zc + 0.85); }
    }
    B('brick_buff', x0 - 1.4, 5.0, z0 - 1.4, x1 + 1.4, 5.32, z0 + 1.4); }
  // ---- the donkeys' loads set down by the fuel stack: sacks of grain, a rack of beer jars
  for (let k = 0; k < 9; k++) { const sx0 = -26.2 + (k % 3) * 0.62, sz0 = z0 + 24 + Math.floor(k / 3) * 0.5 + (k % 2) * 0.1, lay = k > 5 ? 1 : 0;
    B('sacking', sx0 - 0.28, y + tp + lay * 0.26, sz0 - 0.2, sx0 + 0.28, y + tp + lay * 0.26 + 0.3, sz0 + 0.2); }
}

/**
 * The terrace before the ziggurat (docs/settlements/ur.md §4.1c) { rect, y }: the way from the terrace stair's head to the foot of the central
 * stair paved in buff brick between two rows of date palms in brick pits, and along the enclosure's side walls the bays of the temple's
 * storerooms — a reed-mat roof on palm posts against the wall, great jars, sacks and stacked bricks under it — and a basin of lustration at
 * the stair's head. The enclosure's inner faces stand 1.25 m inside the lines 2.5 m in from the terrace's edge.
 */
export function terraceDress(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 2.5, rand = rng(5150);
  const B = (mat, a, b, c, d, e, f) => bag.add(mat, box(a, b, c, d, e, f));
  const L = (mat, prof, x, yy, z, seg = 12) => bag.add(mat, lathe(prof, seg, null, x, yy, z));
  const wx = x1 - 2.5 - 1.25, zf = -51.5;                          // the side walls' inner faces; the foot of the central stair
  // the way, kerbed, and the palms either side of it
  B('brick_buff', -5.5, y - 0.02, z0 + 0.7, 5.5, y + 0.03, zf); col.floor([-5.5, z0 + 0.7, 5.5, zf], y + 0.03);
  for (const sx of [-1, 1]) B('limestone', sx * 5.5 - (sx > 0 ? 0 : 0.26), y - 0.02, z0 + 0.7, sx * 5.5 + (sx > 0 ? 0.26 : 0), y + 0.11, zf);
  const palms = []; for (const sx of [-1, 1]) for (let z = z0 + 8; z < zf - 2; z += 9) palms.push([sx * 11.5, z]);
  palms.forEach(([px, pz], i) => {
    bag.add(BB, lathe([[1.05, 0], [1.05, 0.2], [0.85, 0.2], [0.85, 0]], 16, null, px, y, pz)); bag.add('silt', lathe([[0.001, 0.12], [0.85, 0.12], [0.85, 0.15], [0.001, 0.15]], 14, null, px, y, pz));
    palm({ at: [px, pz], y, h: 7.5 + rand() * 2.5, lean: (rand() - 0.5) * 0.012, seed: 300 + i }, { bag, col }); col.circle(px, pz, 0.5, y, y + 6);
  });
  // the basin of lustration at the stair's head, either side of the way
  for (const sx of [-1, 1]) { const bx = sx * 8.6, bz = z0 + 3.6;
    B(BB, bx - 1.2, y, bz - 0.55, bx + 1.2, y + 0.7, bz + 0.55); B('bitumen', bx - 1.0, y + 0.68, bz - 0.35, bx + 1.0, y + 0.72, bz + 0.35); B('water', bx - 0.98, y + 0.69, bz - 0.33, bx + 0.98, y + 0.695, bz + 0.33);
    col.rect([bx - 1.2, bz - 0.55, bx + 1.2, bz + 0.55], y, y + 0.72); }
  // the storeroom bays along the side walls: a roof of reed mats on palm posts, jars, sacks, bricks under it
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) {
    const za = z0 + 8 + k * 8.5, zb = za + 6.2, xi = sx * wx, xo = sx * (wx - 3.2), lo = Math.min(xi, xo), hi = Math.max(xi, xo), H = 2.9;
    for (const [px, pz] of [[xo, za + 0.1], [xo, zb - 0.1]]) { B('palm_trunk', px - 0.1, y, pz - 0.1, px + 0.1, y + H, pz + 0.1); col.circle(px, pz, 0.12, y, y + H); }
    for (const pz of [za + 0.1, zb - 0.1]) { const T = []; beamTris(T, [xi, y + H, pz], [xo, y + H, pz], 0.08, 0.14); bag.add('palm_trunk', fromTriangles(T)); }
    B('reed_mat', lo - 0.1, y + H + 0.1, za - 0.15, hi, y + H + 0.18, zb + 0.15);
    B(BB, lo, y, za, hi, y + 0.06, zb);
    const what = (k + (sx > 0 ? 1 : 0)) % 3;
    for (let j = 0; j < 4; j++) {
      const jx = xi - sx * 1.05, jz = za + 0.8 + j * 1.35;
      if (what === 0) { L(BB, [[0.3, 0], [0.3, 0.12], [0.2, 0.12]], jx, y + 0.06, jz, 10); L('terracotta', jarP(1.5), jx, y + 0.18, jz, 12); col.circle(jx, jz, 0.4, y, y + 1.4); }
      else if (what === 1) { B('sacking', jx - 0.5, y + 0.06, jz - 0.3, jx + 0.5, y + 0.4, jz + 0.3); B('sacking', jx - 0.4 - sx * 1.0, y + 0.06, jz - 0.3, jx + 0.4 - sx * 1.0, y + 0.38, jz + 0.3); if (j % 2) B('sacking', jx - 0.4, y + 0.4, jz - 0.28, jx + 0.4, y + 0.74, jz + 0.28); col.rect([jx - 0.5, jz - 0.3, jx + 0.5, jz + 0.3], y, y + 0.5); }
      else { for (let r = 0; r < 4 - (j % 2); r++) B(BB, jx - 0.45, y + 0.06 + r * 0.14, jz - 0.35, jx + 0.45, y + 0.06 + (r + 1) * 0.14, jz + 0.35); col.rect([jx - 0.45, jz - 0.35, jx + 0.45, jz + 0.35], y, y + 0.6); }
    }
  }
}
