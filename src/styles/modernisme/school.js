// The Schools of the Sagrada Família (1909) inside (docs/settlements/barcelona.md §10): a plan of 10 × 20 m with three classrooms
// in a row, each with a blackboard on its west wall and rows of double desks with benches facing it, the teacher's desk, a
// stove with its pipe, maps and coat rails; a doorway in each end wall and in each partition; the level central beam of the
// conoid roof over all. Built in world coordinates from the schools' own functions of the waving walls.
import { box, lathe, rod, fromTriangles, quad } from '../../core/geom.js';

export function schoolRooms({ bag, col, lights }, { cx, cz, y, L, Wd, wz, roofAt, N }) {
  const FL = y + 0.08, T = [];
  // the floor: boards between the inner skins of the waving walls
  for (let i = 0; i < N; i++) {
    const xa = cx - L / 2 + L * i / N, xb = xa + L / N, a0 = wz(xa, -1) + 0.32, a1 = wz(xa, 1) - 0.32, b0 = wz(xb, -1) + 0.32, b1 = wz(xb, 1) - 0.32;
    quad(T, [xa, FL, a0], [xa, FL, a1], [xb, FL, b1], [xb, FL, b0]); quad(T, [xa, FL - 0.2, a0], [xb, FL - 0.2, b0], [xb, FL - 0.2, b1], [xa, FL - 0.2, a1]);
  }
  bag.add('wood_ochre', fromTriangles(T));
  col.floor([cx - L / 2 - 0.9, cz - 4.2, cx + L / 2 + 0.9, cz + 4.2], FL);
  // the level central beam of the roof, the rafters' meeting line
  const bl = L + 0.6; bag.add('wood_dark', box(cx - bl / 2, y + 5.1, cz - 0.16, cx + bl / 2, y + 5.38, cz + 0.16));
  const px = [cx - L / 6, cx + L / 6], third = L / 3;
  // the partitions with a doorway at the middle
  for (const x of px) {
    const z0 = wz(x, -1) + 0.3, z1 = wz(x, 1) - 0.3;
    bag.add('plaster_white', box(x - 0.1, FL, z0, x + 0.1, y + 5.3, cz - 0.6)); bag.add('plaster_white', box(x - 0.1, FL, cz + 0.6, x + 0.1, y + 5.3, z1)); bag.add('plaster_white', box(x - 0.1, y + 2.5, cz - 0.6, x + 0.1, y + 5.3, cz + 0.6));
    bag.add('wood_painted', box(x - 0.12, FL, cz - 0.66, x + 0.12, y + 2.52, cz - 0.6)); bag.add('wood_painted', box(x - 0.12, FL, cz + 0.6, x + 0.12, y + 2.52, cz + 0.66));
    col.rect([x - 0.1, z0, x + 0.1, cz - 0.6], FL, y + 5.3); col.rect([x - 0.1, cz + 0.6, x + 0.1, z1], FL, y + 5.3);
  }
  for (let r = 0; r < 3; r++) {
    const xa = cx - L / 2 + 0.32 + r * third + (r ? 0.1 : 0), xb = cx - L / 2 + (r + 1) * third - (r < 2 ? 0.1 : 0.32);
    // the blackboard on the west wall, right of the door, in a frame, with a ledge; a map on the east
    const bx = xa + 0.02;
    bag.add('wood_dark', box(bx, FL + 0.95, cz + 1.2, bx + 0.05, FL + 2.45, cz + 3.9)); bag.add('lacquer_black', box(bx + 0.05, FL + 1.02, cz + 1.28, bx + 0.07, FL + 2.38, cz + 3.82)); bag.add('wood_dark', box(bx, FL + 0.9, cz + 1.2, bx + 0.16, FL + 0.95, cz + 3.9));
    for (let k = 0; k < 3; k++) bag.add('paint_white', box(bx + 0.07, FL + 1.7 - k * 0.3, cz + 1.5 + k * 0.1, bx + 0.075, FL + 1.74 - k * 0.3, cz + 2.9 - k * 0.2));       // chalk lines
    const mx = xb - 0.12; bag.add('cloth_ochre', box(mx - 0.02, FL + 1.1, cz - 3.4, mx + 0.0, FL + 2.3, cz - 1.6)); bag.add('cloth_green', box(mx - 0.025, FL + 1.4, cz - 3.1, mx - 0.015, FL + 1.9, cz - 2.3));
    // the teacher's desk on a low platform with her chair
    bag.add('wood_painted', box(xa + 0.2, FL, cz + 1.1, xa + 1.5, FL + 0.12, cz + 3.1)); col.rect([xa + 0.2, cz + 1.1, xa + 1.5, cz + 3.1], FL, FL + 0.4);
    bag.add('wood_dark', box(xa + 0.6, FL + 0.12 + 0.72, cz + 1.5, xa + 1.2, FL + 0.12 + 0.77, cz + 2.7)); for (const [a, b] of [[xa + 0.64, cz + 1.54], [xa + 1.16, cz + 1.54], [xa + 0.64, cz + 2.66], [xa + 1.16, cz + 2.66]]) bag.add('wood_dark', box(a - 0.03, FL + 0.12, b - 0.03, a + 0.03, FL + 0.12 + 0.72, b + 0.03));
    col.rect([xa + 0.55, cz + 1.45, xa + 1.25, cz + 2.75], FL, FL + 0.9);
    // her chair
    bag.add('wood_dark', box(xa + 1.35, FL + 0.12 + 0.44, cz + 1.9, xa + 1.75, FL + 0.12 + 0.48, cz + 2.3)); bag.add('wood_dark', box(xa + 1.72, FL + 0.12 + 0.48, cz + 1.9, xa + 1.75, FL + 0.12 + 1.0, cz + 2.3));
    for (const [a, b] of [[xa + 1.38, cz + 1.93], [xa + 1.72, cz + 1.93], [xa + 1.38, cz + 2.27], [xa + 1.72, cz + 2.27]]) bag.add('wood_dark', box(a - 0.015, FL + 0.12, b - 0.015, a + 0.015, FL + 0.12 + 0.44, b + 0.015));
    // the double desks: four rows facing the board, a bench behind each, a left and a right set about the aisle
    for (let k = 0; k < 4; k++) {
      const dx = xa + 2.2 + k * 1.05;
      if (dx + 0.9 > xb) continue;
      for (const [z0, z1] of [[cz - 3.5, cz - 1.15], [cz + 1.15, cz + 3.5]]) {
        bag.add('wood_ochre', box(dx, FL + 0.7, z0, dx + 0.45, FL + 0.74, z1)); bag.add('wood_dark', box(dx, FL + 0.44, z0, dx + 0.03, FL + 0.7, z1)); bag.add('wood_dark', box(dx, FL + 0.66, z0, dx + 0.45, FL + 0.7, z0 + 0.03));
        bag.add('wood_dark', box(dx + 0.5, FL + 0.43, z0, dx + 0.82, FL + 0.47, z1));
        for (const zz of [z0 + 0.04, z1 - 0.1]) { bag.add('wood_dark', box(dx, FL, zz, dx + 0.04, FL + 0.7, zz + 0.06)); bag.add('wood_dark', box(dx + 0.7, FL, zz, dx + 0.74, FL + 0.43, zz + 0.06)); }
        for (let q = 0; q < 3; q++) { const zq = z0 + 0.35 + q * (z1 - z0 - 0.5) / 2; bag.add('plaster_white', box(dx + 0.1, FL + 0.74, zq, dx + 0.3, FL + 0.745, zq + 0.28)); }      // a slate or a copybook each
        col.rect([dx, z0, dx + 0.85, z1], FL, FL + 0.8);
      }
    }
    // a stove with its pipe in the south-east corner, a coat rail and a water jar by the door
    const sx = xb - 0.7, sz = cz - 3.6;
    bag.add('iron', lathe([[0.001, 0], [0.3, 0], [0.34, 0.2], [0.32, 0.8], [0.2, 0.9], [0.001, 0.9]], 10, null, sx, FL, sz)); bag.add('iron', rod([sx, FL + 0.9, sz], [sx, y + 5.2, sz], 0.05, 6)); col.circle(sx, sz, 0.38, FL, FL + 1.0);
    bag.add('wood_dark', box(xb - 0.1, FL + 1.55, cz + 0.8, xb - 0.04, FL + 1.62, cz + 3.8)); for (let k = 0; k < 6; k++) { const z = cz + 1.0 + k * 0.5; bag.add('iron', rod([xb - 0.07, FL + 1.55, z], [xb - 0.28, FL + 1.55, z], 0.012, 4)); if (k % 2 === 0) bag.add(['cloth_grey', 'cloth_brown', 'cloth_indigo'][(k + r) % 3], box(xb - 0.27, FL + 0.95, z - 0.1, xb - 0.07, FL + 1.55, z + 0.1)); }
    lights?.push({ at: [(xa + xb) / 2, y + 3.8, cz], color: '#ffd9a0', intensity: 5, distance: 8 });
    for (const zz of [cz - 2.3, cz + 2.3]) { bag.add('iron', rod([(xa + xb) / 2, y + 5.1, zz], [(xa + xb) / 2, y + 4.2, zz], 0.01, 4)); bag.add('lamp_glass', lathe([[0.11, 4.0], [0.16, 4.05], [0.001, 4.2], [0.001, 4.0]], 8, null, (xa + xb) / 2, y, zz)); }
  }
}
