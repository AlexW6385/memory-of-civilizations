// The rooms of the Albaicín's houses (docs/settlements/granada.md §5.2): the hall behind the patio's portico, furnished by
// the trade or the habit of the house — a divan-room with its brazier, a weaver's room with the loom, a scholar's room,
// a room for guests with the round tray. Built in the room's own rect, the lane wall to the north.

import { box, lathe, rod, clothBox, addCloth, fromTriangles } from '../../core/geom.js';
import { face, dress, script } from './halls.js';

export const USES = ['home', 'weaver', 'scholar', 'guests'];
const CUSH = ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_blue', 'cloth_white'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * hallRoom(bag, col, { room [x0, z0, x1, z1], y (the floor), pcx (the door's x), zd (the door's wall z: the room's south face),
 * ceil (the ceiling's height over y), use, seed })
 * The room's own surfaces and furniture; the walls and the door are built by the caller.
 */
export function hallRoom(bag, col, { room, y, pcx, ceil, use, seed }) {
  const [xa, za, xb, zb] = room, rand = rng(seed + 19), y0 = y + 0.05, yc = y + ceil, W = xb - xa;
  // the floor of brick set in a herringbone-free field, a rug on it; the ceiling of cedar boards on beams
  bag.add('brick_paving', box(xa, y - 0.1, za, xb, y0, zb));
  bag.add('cedar', box(xa, yc, za, xb, yc + 0.1, zb)); col.rect(room, yc - 0.1, yc + 0.1);
  for (let x = xa + 0.35; x < xb - 0.2; x += 0.62) bag.add('timber', box(x - 0.08, yc - 0.17, za, x + 0.08, yc, zb));
  bag.add('timber', box(xa, yc - 0.17, za, xb, yc - 0.1, za + 0.1)); bag.add('timber', box(xa, yc - 0.17, zb - 0.1, xb, yc - 0.1, zb));
  // the walls' lining: a tiled dado in the richer houses, a painted band and a stucco frieze in the rest, a band of script above
  const rich = seed % 3 === 1, holes = [[pcx - 0.5, pcx + 0.5, y0, y + 2.2]];
  const N = face('z', za, 1), S = face('z', zb, -1), Wf = face('x', xa, 1), Ef = face('x', xb, -1);
  const sHoles = [...holes, ...[xa + 1.3, xb - 1.3].filter((u) => Math.abs(u - pcx) > 1.6).map((u) => [u - 0.28, u + 0.28, y + 0.8, y + 1.8])];
  if (rich) {
    for (const [f, a, b, h] of [[N, xa, xb, []], [S, xa, xb, sHoles], [Wf, za, zb, []], [Ef, za, zb, []]]) dress(bag, f, a, b, y0, yc - 0.1, h, { dado: 0.95, shields: false, band: false, dadoScript: false });
  } else {
    for (const [f, a, b] of [[N, xa, xb], [Wf, za, zb], [Ef, za, zb]]) bag.add('glaze_blue', box(...(([r]) => [r[0], y0, r[1], r[2], y + 0.95, r[3]])([f.R(0, 0.03, a, b)])));
  }
  for (const [f, a, b] of [[N, xa, xb], [Wf, za, zb], [Ef, za, zb]]) {
    bag.add('stucco_cream', box(...(([r]) => [r[0], yc - 0.62, r[1], r[2], yc - 0.3, r[3]])([f.R(0, 0.035, a, b)])));
    script(bag, 'stucco_warm', f, a + 0.1, b - 0.1, yc - 0.6, 0.26, 0.035, 0.05, seed % 9);
  }
  // the door's leaf folded back against the wall, the lattices in the windows
  bag.add('wood_dark', box(pcx + 0.55, y0, zb - 0.07, pcx + 1.45, y + 2.1, zb - 0.01));
  for (const u of [xa + 1.3, xb - 1.3].filter((u) => Math.abs(u - pcx) > 1.6)) bag.add('lattice', box(u - 0.28, y + 0.8, zb + 0.02, u + 0.28, y + 1.8, zb + 0.06));
  // the lamp on its chain, over the room's middle
  const lampAt = (x, z) => { bag.add('iron', rod([x, yc, z], [x, yc - 0.65, z], 0.006, 3)); bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.05], [0.13, 0.17], [0.07, 0.27], [0.001, 0.29]], 10, null, x, yc - 0.95, z)); bag.add('iron', box(x - 0.1, yc - 0.67, z - 0.1, x + 0.1, yc - 0.65, z + 0.1)); };
  const divan = (u0, u1, depth = 0.62) => {
    bag.add('timber', box(u0, y0, za + 0.035, u1, y0 + 0.27, za + depth)); col.rect([u0, za, u1, za + depth], y0, y0 + 0.36);
    for (let u = u0 + 0.02; u < u1 - 0.3; u += 0.9) { const w = Math.min(0.9, u1 - u - 0.02) - 0.04; bag.add(CUSH[Math.floor(rand() * 5)], box(u, y0 + 0.27, za + 0.06, u + w, y0 + 0.35, za + depth - 0.03)); }
    for (const x of [u0 + 0.14, u1 - 0.14]) bag.add(CUSH[Math.floor(rand() * 5)], lathe([[0.001, 0], [0.16, 0.02], [0.17, 0.12], [0.001, 0.16]], 8, null, x, y0 + 0.35, za + depth / 2));
  };
  const rug = (cx, cz, w, d, a, b) => { bag.add(a, box(cx - w / 2, y0, cz - d / 2, cx + w / 2, y0 + 0.015, cz + d / 2)); bag.add(b, box(cx - w / 2 + 0.12, y0 + 0.015, cz - d / 2 + 0.12, cx + w / 2 - 0.12, y0 + 0.025, cz + d / 2 - 0.12)); };
  const jar = (x, z, s, on = y0) => bag.add('terracotta', lathe([[0.001, 0], [0.16 * s, 0.01], [0.27 * s, 0.25 * s], [0.31 * s, 0.5 * s], [0.25 * s, 0.7 * s], [0.14 * s, 0.82 * s], [0.17 * s, 0.9 * s], [0.001, 0.9 * s]], 10, null, x, on, z));
  const chest = (x0, z0, w, d) => { bag.add('wood_painted', box(x0, y0, z0, x0 + w, y0 + 0.55, z0 + d)); bag.add('wood_dark', box(x0 - 0.02, y0 + 0.55, z0 - 0.02, x0 + w + 0.02, y0 + 0.6, z0 + d + 0.02)); bag.add('iron', box(x0 + w / 2 - 0.04, y0 + 0.3, z0 + d, x0 + w / 2 + 0.04, y0 + 0.4, z0 + d + 0.015)); col.rect([x0, z0, x0 + w, z0 + d], y0, y0 + 0.6); };
  // the divan runs along the lane wall, the door's way left free
  const east = xb, mid = (za + zb) / 2;
  if (use === 'home') {
    // a divan, a rug, a brazier of copper on a stand (the houses were heated by braziers), a painted chest, jars
    divan(xa, xb);
    rug(pcx + 1.9, mid + 0.3, 2.2, 1.3, 'cloth_red', 'cloth_ochre');
    const bx = Math.min(east - 1.0, pcx + 3.0), bz = za + 1.25;
    bag.add('wood_dark', lathe([[0.3, 0], [0.2, 0.06], [0.2, 0.2], [0.3, 0.24], [0.001, 0.24]], 10, null, bx, y0, bz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.34, 0.01], [0.38, 0.1], [0.32, 0.11], [0.001, 0.09]], 12, null, bx, y0 + 0.24, bz));
    bag.add('cloth_red', lathe([[0.001, 0.09], [0.26, 0.095], [0.001, 0.1]], 10, null, bx, y0 + 0.25, bz)); col.circle(bx, bz, 0.4, y0, y0 + 0.4);
    chest(east - 0.62, mid + 0.35, 0.5, 1.0);
    jar(xa + 0.5, zb - 0.5, 0.9); jar(xa + 1.0, zb - 0.45, 0.7);
    lampAt(pcx + 1.9, za + 1.1);
  } else if (use === 'weaver') {
    // a silk-weaver's room (Granada's silk): the upright loom with its crimson warp and a woven band, a low stool, a basket of skeins
    divan(xa, Math.min(xb, pcx + 0.7) - 0.0, 0.55);
    const lx0 = pcx + 1.0, lx1 = Math.min(xb - 0.7, lx0 + 1.8), lz = za + 1.0;
    for (const x of [lx0, lx1]) { bag.add('timber', box(x - 0.05, y0, lz - 0.05, x + 0.05, y0 + 1.7, lz + 0.05)); bag.add('timber', box(x - 0.05, y0, lz - 0.5, x + 0.05, y0 + 0.06, lz + 0.5)); }
    bag.add('timber', rod([lx0, y0 + 1.6, lz], [lx1, y0 + 1.6, lz], 0.04, 6)); bag.add('timber', rod([lx0, y0 + 0.45, lz], [lx1, y0 + 0.45, lz], 0.04, 6));
    bag.add('cloth_red', box(lx0 + 0.05, y0 + 0.9, lz - 0.01, lx1 - 0.05, y0 + 1.58, lz + 0.01));
    for (let x = lx0 + 0.15; x < lx1 - 0.1; x += 0.07) bag.add('iron', box(x, y0 + 0.92, lz - 0.03, x + 0.012, y0 + 1.56, lz + 0.03));
    bag.add('cloth_ochre', box(lx0 + 0.05, y0 + 0.47, lz - 0.015, lx1 - 0.05, y0 + 0.9, lz + 0.015));
    for (let x = lx0 + 0.15; x < lx1 - 0.1; x += 0.3) bag.add('cloth_blue', box(x, y0 + 0.55, lz - 0.02, x + 0.12, y0 + 0.62, lz + 0.02));
    col.rect([lx0 - 0.06, lz - 0.5, lx1 + 0.06, lz + 0.5], y0, y0 + 1.7);
    const sx = (lx0 + lx1) / 2;
    bag.add('timber', box(sx - 0.2, y0, lz + 0.62, sx + 0.2, y0 + 0.28, lz + 0.98)); col.rect([sx - 0.2, lz + 0.62, sx + 0.2, lz + 0.98], y0, y0 + 0.3);
    const bk = [xa + 0.6, zb - 0.55];
    bag.add('wicker', lathe([[0.2, 0], [0.34, 0.35], [0.3, 0.38], [0.001, 0.38]], 10, null, bk[0], y0, bk[1]));
    for (let k = 0; k < 4; k++) bag.add(['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_white'][k], lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.1], [0.001, 0.12]], 7, null, bk[0] + (k % 2 - 0.5) * 0.18, y0 + 0.34, bk[1] + (k > 1 ? 0.1 : -0.1)));
    col.circle(bk[0], bk[1], 0.34, y0, y0 + 0.4);
    rug(pcx - 1.7, mid + 0.4, 1.8, 1.1, 'cloth_indigo', 'cloth_white');
    lampAt(sx, mid);
  } else if (use === 'scholar') {
    // a scholar's room: shelves of books in the end wall, a low desk with a folding book-rest, ink and scrolls, a cushion on a rug
    divan(xa, Math.min(xb, pcx + 0.7), 0.58);
    for (let q = 0; q < 3; q++) {
      const ys = y0 + 0.5 + q * 0.5; bag.add('wood_dark', box(east - 0.4, ys, za + 0.65, east - 0.04, ys + 0.04, zb - 0.65));
      for (let z = za + 0.7; z < zb - 0.8; z += 0.11) bag.add(['cloth_red', 'cloth_brown', 'cloth_green', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 5)], box(east - 0.36, ys + 0.04, z, east - 0.06, ys + 0.04 + 0.24 - rand() * 0.07, z + 0.085));
    }
    bag.add('wood_dark', box(east - 0.42, y0, za + 0.63, east - 0.04, y0 + 0.5, za + 0.67)); bag.add('wood_dark', box(east - 0.42, y0, zb - 0.67, east - 0.04, y0 + 0.5, zb - 0.63)); col.rect([east - 0.42, za + 0.63, east, zb - 0.63], y0, y0 + 1.8);
    const dx = pcx + 1.5, dz = za + 1.3;
    bag.add('wood_painted', box(dx - 0.5, y0 + 0.2, dz - 0.25, dx + 0.5, y0 + 0.25, dz + 0.25));
    for (const [a, b] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]]) bag.add('wood_dark', box(dx + a - 0.025, y0, dz + b - 0.025, dx + a + 0.025, y0 + 0.2, dz + b + 0.025));
    col.rect([dx - 0.5, dz - 0.25, dx + 0.5, dz + 0.25], y0, y0 + 0.25);
    const rest = []; for (const [p, q] of [[-0.18, 0], [0.18, 0]]) { rest.push(dx + p - 0.15, y0 + 0.25, dz - 0.15, dx + p + 0.15, y0 + 0.25, dz + 0.15); void q; }
    bag.add('wood_dark', fromTriangles([dx - 0.2, y0 + 0.25, dz - 0.16, dx + 0.2, y0 + 0.25, dz - 0.16, dx + 0.2, y0 + 0.43, dz + 0.0, dx - 0.2, y0 + 0.25, dz - 0.16, dx + 0.2, y0 + 0.43, dz + 0.0, dx - 0.2, y0 + 0.43, dz + 0.0, dx - 0.2, y0 + 0.25, dz + 0.16, dx + 0.2, y0 + 0.43, dz + 0.0, dx + 0.2, y0 + 0.25, dz + 0.16, dx - 0.2, y0 + 0.25, dz + 0.16, dx - 0.2, y0 + 0.43, dz + 0.0, dx + 0.2, y0 + 0.43, dz + 0.0]));
    bag.add('cloth_brown', box(dx - 0.17, y0 + 0.27, dz - 0.03, dx + 0.17, y0 + 0.31, dz + 0.1));
    bag.add('terracotta', lathe([[0.001, 0], [0.04, 0], [0.045, 0.06], [0.02, 0.08], [0.001, 0.08]], 8, null, dx + 0.38, y0 + 0.25, dz + 0.12));
    for (let k = 0; k < 2; k++) bag.add('cloth_white', rod([dx - 0.42, y0 + 0.28, dz - 0.1 + k * 0.1], [dx - 0.18, y0 + 0.28, dz - 0.1 + k * 0.1], 0.025, 6));
    rug(dx, dz + 0.75, 1.5, 1.0, 'cloth_green', 'cloth_ochre');
    bag.add(CUSH[1], box(dx - 0.28, y0 + 0.03, dz + 0.55, dx + 0.28, y0 + 0.13, dz + 0.95));
    lampAt(dx, dz + 0.5);
  } else {
    // a room for guests: the round tray (tabaque) on its low stand with cushions about it, a water jug, a cupboard of dishes, a curtain
    divan(xa, xb, 0.6);
    const tx = pcx + 1.7, tz = mid + 0.3;
    bag.add('wood_dark', lathe([[0.001, 0], [0.22, 0], [0.12, 0.05], [0.11, 0.3], [0.2, 0.36], [0.001, 0.36]], 10, null, tx, y0, tz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.42, 0.02], [0.45, 0.06], [0.001, 0.05]], 16, null, tx, y0 + 0.36, tz)); col.circle(tx, tz, 0.45, y0, y0 + 0.42);
    for (const [dx, dz] of [[-0.8, 0], [0.8, 0], [0, 0.8], [0, -0.8]]) { const x = tx + dx, z = tz + dz; if (z > za + 0.6 && z < zb - 0.35) bag.add(CUSH[(Math.abs(dx) + Math.abs(dz) > 0.9 ? 1 : 3)], box(x - 0.28, y0, z - 0.28, x + 0.28, y0 + 0.12, z + 0.28)); }
    jar(tx + 0.15, tz - 0.1, 0.36, y0 + 0.42);
    const cx0 = east - 0.45;
    bag.add('wood_painted', box(cx0, y0, za + 0.7, east - 0.04, y0 + 1.7, zb - 0.7)); col.rect([cx0, za + 0.7, east, zb - 0.7], y0, y0 + 1.7);
    for (let q = 0; q < 3; q++) for (let z = za + 0.9; z < zb - 0.9; z += 0.3) bag.add(q === 1 ? 'glaze_blue' : 'glaze_white', lathe([[0.001, 0], [0.09, 0.005], [0.12, 0.05], [0.001, 0.05]], 8, null, cx0 - 0.015, y0 + 0.55 + q * 0.45, z));
    jar(xa + 0.5, zb - 0.5, 1); jar(xa + 1.0, zb - 0.45, 0.75);
    lampAt(tx, tz - 0.1);
  }
}
void clothBox; void addCloth;
