// The Parthenon's west room, the treasury (docs/buildings/parthenon.md §6a): what the temple kept for Athena — chests,
// gold and silver bowls on a table, a throne with silver feet, a gilt cuirass and a sword among the spoils, round
// shields hung on the cross wall, tripods in the corners, one lamp. Local coordinates of the Parthenon plan (+x east,
// +z south); the room lies x -22.2…-8.8, z -9.6…9.6, its floor at el.y. The walking line of the plan runs along
// z = ±8 and x = -10, and z = 0 from the west door: nothing stands within 0.5 m of those.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/greek/index.js';
import '../../styles/greek/slope.js';   // votive (the tripods)

/** A chest (kiste): a body of boards on a plinth, a lid a little arched, bronze corner bands and a ring. */
function chest(bag, col, x, z, y, w, d, h, along) {
  const hw = (along ? w : d) / 2, hd = (along ? d : w) / 2;
  bag.add('wood_dark', box(x - hw, y, z - hd, x + hw, y + h, z + hd));
  bag.add('timber', box(x - hw - 0.02, y + h, z - hd - 0.02, x + hw + 0.02, y + h + 0.07, z + hd + 0.02));
  bag.add('wood_dark', box(x - hw + 0.04, y + h + 0.07, z - hd + 0.04, x + hw - 0.04, y + h + 0.11, z + hd - 0.04));
  for (const f of [-0.35, 0.35]) {
    const u = along ? [x + f * w - 0.03, z - hd - 0.015, x + f * w + 0.03, z + hd + 0.015] : [x - hw - 0.015, z + f * w - 0.03, x + hw + 0.015, z + f * w + 0.03];
    bag.add('bronze', box(u[0], y + 0.02, u[1], u[2], y + h + 0.1, u[3]));
  }
  const rz = along ? [x - 0.04, z + hd, x + 0.04, z + hd + 0.03] : [x + hw, z - 0.04, x + hw + 0.03, z + 0.04];
  bag.add('bronze', box(rz[0], y + h * 0.6, rz[1], rz[2], y + h * 0.6 + 0.08, rz[3]));
  col.rect([x - hw, z - hd, x + hw, z + hd], y, y + h + 0.11);
}
/** A shallow bowl (phiale) with its boss (omphalos), on a table top at height y. */
function phiale(bag, x, y, z, mat) {
  bag.add(mat, lathe([[0.001, 0], [0.04, 0], [0.1, 0.018], [0.125, 0.04], [0.118, 0.043], [0.09, 0.026], [0.03, 0.022], [0.001, 0.034]], 14, null, x, y, z));
}
/** A round shield hung on the cross wall (its face to the west), bronze with a gilt rim and boss. */
function shield(bag, x, y, z, r) {
  const g = (p) => lathe(p, 16).rotateZ(Math.PI / 2).translate(x, y, z);
  bag.add('bronze', g([[0.001, 0], [r, 0], [r, 0.045], [r * 0.25, 0.07], [0.001, 0.1]]));
  bag.add('gilt_bronze', g([[r * 0.86, 0.045], [r, 0.045], [r, 0.058], [r * 0.86, 0.058]]));
  bag.add('gilt_bronze', g([[0.001, 0.1], [r * 0.2, 0.09], [r * 0.14, 0.14], [0.001, 0.15]]));
}

function parthenonTreasury(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y;
  // chests along the north wall (z -9.6): four of them, the lids shut
  [[-19.2, 1.2], [-17.8, 1.3], [-16.3, 1.1], [-14.9, 1.3], [-13.4, 1.2]].forEach(([x, w], i) => chest(bag, col, x, -9.1, y, w, 0.62, 0.62 + (i % 2) * 0.1, true));
  // a taller cupboard of boards on the same wall, doors shut (the inventories were kept in the room)
  bag.add('wood_dark', box(-12.5, y, -9.5, -11.0, y + 1.7, -8.8)); col.rect([-12.5, -9.5, -11.0, -8.8], y, y + 1.7);
  bag.add('bronze', box(-11.78, y + 0.85, -8.82, -11.72, y + 1.2, -8.8));
  // along the south wall: two chests and a table with the gold and silver bowls
  chest(bag, col, -19.2, 9.1, y, 1.2, 0.62, 0.64, true); chest(bag, col, -17.8, 9.1, y, 1.3, 0.62, 0.72, true);
  const tx0 = -14.4, tx1 = -10.9, tz0 = 8.8, tz1 = 9.5, th = 0.86;
  bag.add('wood_dark', box(tx0, y + th - 0.06, tz0, tx1, y + th, tz1));
  for (const [x, z] of [[tx0 + 0.05, tz0 + 0.05], [tx1 - 0.1, tz0 + 0.05], [tx0 + 0.05, tz1 - 0.1], [tx1 - 0.1, tz1 - 0.1]]) bag.add('wood_dark', box(x, y, z, x + 0.05, y + th - 0.06, z + 0.05));
  col.rect([tx0, tz0, tx1, tz1], y, y + th);
  for (let k = 0; k < 7; k++) phiale(bag, tx0 + 0.35 + k * 0.46, y + th, 9.15 + (k % 2) * 0.08, k % 3 === 1 ? 'silver' : 'gold');
  bag.add('silver', lathe([[0.001, 0], [0.06, 0], [0.04, 0.1], [0.09, 0.22], [0.001, 0.22]], 10, null, tx1 - 0.3, y + th, 9.15));            // a ewer
  // the throne with silver feet (the Persian king's chair among the spoils): seat, back, arms, a footstool
  const tx = -20.4, tzz = -2.9, sh = 0.46;
  bag.add('wood_dark', box(tx - 0.28, y + sh, tzz - 0.3, tx + 0.28, y + sh + 0.07, tzz + 0.3));
  bag.add('cloth_red', box(tx - 0.26, y + sh + 0.07, tzz - 0.28, tx + 0.26, y + sh + 0.12, tzz + 0.28));
  bag.add('wood_dark', box(tx - 0.3, y + sh + 0.07, tzz - 0.3, tx - 0.22, y + sh + 0.75, tzz + 0.3));
  bag.add('wood_dark', box(tx - 0.3, y + sh + 0.75, tzz - 0.34, tx - 0.2, y + sh + 0.82, tzz + 0.34));
  for (const s of [-1, 1]) bag.add('wood_dark', box(tx - 0.28, y + sh + 0.22, tzz + s * 0.3 - 0.025, tx + 0.28, y + sh + 0.27, tzz + s * 0.3 + 0.025));
  for (const dx of [-1, 1]) for (const s of [-1, 1]) {
    const lx = tx + dx * 0.24, lz = tzz + s * 0.26;
    bag.add('silver', lathe([[0.001, 0], [0.05, 0], [0.04, 0.06], [0.05, 0.12], [0.001, 0.12]], 8, null, lx, y, lz));
    bag.add('wood_dark', box(lx - 0.025, y + 0.12, lz - 0.025, lx + 0.025, y + sh, lz + 0.025));
  }
  col.rect([tx - 0.32, tzz - 0.36, tx + 0.3, tzz + 0.36], y, y + sh + 0.82);
  bag.add('wood_dark', box(tx + 0.4, y, tzz - 0.2, tx + 0.8, y + 0.16, tzz + 0.2)); bag.add('cloth_red', box(tx + 0.42, y + 0.16, tzz - 0.18, tx + 0.78, y + 0.19, tzz + 0.18));
  col.rect([tx + 0.4, tzz - 0.2, tx + 0.8, tzz + 0.2], y, y + 0.19);
  // a klismos with a cushion across from it
  const kx = -20.4, kz = 2.9;
  bag.add('wood_dark', box(kx - 0.25, y + 0.44, kz - 0.25, kx + 0.25, y + 0.49, kz + 0.25));
  bag.add('cloth_ochre', box(kx - 0.23, y + 0.49, kz - 0.23, kx + 0.23, y + 0.54, kz + 0.23));
  bag.add('wood_dark', box(kx - 0.27, y + 0.49, kz - 0.22, kx - 0.22, y + 0.95, kz + 0.22));
  for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) bag.add('wood_dark', box(kx + dx - 0.02, y, kz + dz - 0.02, kx + dx + 0.02, y + 0.44, kz + dz + 0.02));
  col.rect([kx - 0.28, kz - 0.28, kx + 0.26, kz + 0.28], y, y + 0.95);
  // the spoils: a gilt cuirass on its post and a short sword (akinakes) laid on a stand
  const cx = -12.6, cz = -6.4;
  bag.add('wood_dark', rod([cx, y, cz], [cx, y + 1.35, cz], 0.035, 6));
  bag.add('wood_dark', box(cx - 0.3, y, cz - 0.3, cx + 0.3, y + 0.06, cz + 0.3));
  bag.add('gilt_bronze', lathe([[0.2, 1.0], [0.24, 1.25], [0.22, 1.5], [0.12, 1.58], [0.12, 1.52], [0.18, 1.45], [0.2, 1.2], [0.17, 1.02]], 12, null, cx, y, cz));
  bag.add('gold', lathe([[0.18, 1.2], [0.185, 1.2], [0.2, 1.46], [0.19, 1.46]], 10, null, cx, y, cz));
  col.rect([cx - 0.3, cz - 0.3, cx + 0.3, cz + 0.3], y, y + 1.6);
  const sx = -12.6, sz = -5.45;
  bag.add('wood_dark', box(sx - 0.4, y + 0.72, sz - 0.22, sx + 0.4, y + 0.78, sz + 0.22)); col.rect([sx - 0.4, sz - 0.22, sx + 0.4, sz + 0.22], y, y + 0.78);
  for (const [dx, dz] of [[-0.34, -0.16], [0.34, -0.16], [-0.34, 0.16], [0.34, 0.16]]) bag.add('wood_dark', box(sx + dx - 0.02, y, sz + dz - 0.02, sx + dx + 0.02, y + 0.72, sz + dz + 0.02));
  bag.add('iron', box(sx - 0.3, y + 0.78, sz - 0.03, sx + 0.12, y + 0.8, sz + 0.03)); bag.add('gold', box(sx + 0.12, y + 0.78, sz - 0.035, sx + 0.3, y + 0.82, sz + 0.035));
  // round shields on the cross wall (its face at x = -8.8), two rows by the doorless wall
  [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4].forEach((z, i) => shield(bag, -8.82, y + 3.4 + (i % 2) * 0.5, z, 0.52));
  // tripods in the west corners, the lamp on its stand by the cross wall
  for (const z of [-8.75, 8.75]) STYLES.greek.elements.votive({ kind: 'tripod', at: [-21.5, z], y }, ctx);
  const lx = -11.8, lz = 6.2, lh = 1.5;
  bag.add('bronze', lathe([[0.001, 0], [0.18, 0], [0.12, 0.06], [0.025, 0.1], [0.02, lh - 0.05], [0.09, lh - 0.02], [0.1, lh], [0.001, lh]], 10, null, lx, y, lz));
  bag.add('gold', lathe([[0.001, 0], [0.06, 0.005], [0.065, 0.03], [0.025, 0.05], [0.001, 0.05]], 10, null, lx, y + lh, lz));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.012], [0.001, 0.055]], 6, null, lx + 0.06, y + lh + 0.04, lz));
  col.circle(lx, lz, 0.2, y, y + lh + 0.06);
  lights.push({ at: [lx, y + lh + 0.3, lz], color: '#ffb46b', intensity: 2.0, distance: 7 });
}

STYLES.greek.elements.parthenon_treasury = parthenonTreasury;
export default parthenonTreasury;
