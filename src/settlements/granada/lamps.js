// Where the lamps of Nasrid Granada hung and stood (docs/settlements/granada.md §21): pure data of layout.js for nightlight.js's `gr_night` element.
// The palaces' rooms are given their lamps here because the builders hang none: bracket lamps on the Court of the Myrtles' side walls, lamps hung from the crown of the
// Barca's vault, a corona of small lamps from the star ceiling of the Hall of the Ambassadors, lamps on stands in the halls round the Court of the Lions and in the Partal's tower.
import { HILL, MYRTLES, COMARES, LIONS, PARTAL, lots } from './layout.js';
import { frameOf, kindOf } from './walk.js';
import { hashAt } from './hash.js';

const T = HILL.top;
/** The lamps of the landmark's plan: [{ k, x, z, y, yt?, n? }]. */
export function palaceLamps() {
  const L = [], [mx0, mz0, mx1] = MYRTLES, cx = (mx0 + mx1) / 2;
  // the court's side walls: a bracket lamp every nine metres or so (clear of the side walks: the arm reaches 0.5 m)
  for (const z of [-25, -16, -7, 0.5]) { L.push({ k: 'wall', x: mx0 + 0.02, z, y: T + 2.8, n: [1, 0] }, { k: 'wall', x: mx1 - 0.02, z: z + 1.6, y: T + 2.8, n: [-1, 0] }); }
  // the Barca: five lamps hung from the crown of the vault (5.0 m springing, 1.55 m rise)
  const bz = mz0 - 7.45;
  for (const x of [cx - 7, cx - 3.5, cx, cx + 3.5, cx + 7]) L.push({ k: 'hang', x, z: bz, y: T + 3.7, yt: T + 6.5 });
  // the Hall of the Ambassadors: the corona from the star ceiling's crown, four stands before the alcoves
  const hc = [(COMARES[0] + COMARES[2]) / 2, (COMARES[1] + COMARES[3]) / 2];
  L.push({ k: 'corona', x: hc[0], z: hc[1], y: T + 11.0, yt: T + 16.8 });
  for (const [dx, dz] of [[-3.6, 4.2], [3.6, 4.2], [-3.6, -4.0], [3.6, -4.0]]) L.push({ k: 'stand', x: hc[0] + dx, z: hc[1] + dz, y: T + 0.06 });
  // the Court of the Lions: a stand each side of the three halls' doors, in the galleries
  const [lx0, lz0, lx1, lz1] = LIONS, lcx = (lx0 + lx1) / 2, lcz = (lz0 + lz1) / 2;
  for (const dx of [-2.1, 2.1]) L.push({ k: 'stand', x: lcx + dx, z: lz0 + 1.2, y: T + 0.06 }, { k: 'stand', x: lcx + dx, z: lz1 - 1.2, y: T + 0.06 });
  for (const dz of [-2.1, 2.1]) L.push({ k: 'stand', x: lx1 - 1.2, z: lcz + dz, y: T + 0.06 });
  // inside the halls: the Two Sisters, the Abencerrajes, the Kings
  for (const [x, z] of [[lcx - 2.6, lz0 - 3.4], [lcx + 2.6, lz0 - 3.4], [lcx - 2.6, lz0 - 8.2], [lcx + 2.6, lz0 - 8.2]]) L.push({ k: 'stand', x, z, y: T + 0.06 });
  for (const [x, z] of [[lcx - 2.4, lz1 + 2.2], [lcx + 2.4, lz1 + 2.2], [lcx - 2.4, lz1 + 6.4], [lcx + 2.4, lz1 + 6.4]]) L.push({ k: 'stand', x, z, y: T + 0.06 });
  for (const z of [lcz - 6, lcz + 6]) L.push({ k: 'stand', x: lx1 + 4.2, z, y: T + 0.06 });
  // the Partal's tower room
  const pc = [(PARTAL.tower[0] + PARTAL.tower[2]) / 2, (PARTAL.tower[1] + PARTAL.tower[3]) / 2];
  for (const dx of [-2.4, 2.4]) L.push({ k: 'stand', x: pc[0] + dx, z: pc[1], y: T + 0.06 });
  return L;
}
/**
 * The spill of light from the medina's open doors onto the lane (docs §25): a pool on the paving before each shop (always, its lamp and its fire behind the counter) and before
 * three houses in four (a lamp in the room, the hearth). Each: { x, z, y, r, shop }. Pure data of the lots and the house's frame.
 */
export function townLamps() {
  const out = [];
  for (const l of lots()) {
    if (l.y !== T) continue;
    const h = frameOf(l), shop = kindOf(l).startsWith('shop');
    if (!shop && hashAt(l.rect[0], l.rect[1], 41) > 0.75) continue;
    const [x, z] = h.F(h.du, -1.3);
    out.push({ x, z, y: T + 0.04, r: shop ? 2.5 : 1.9, shop });
  }
  return out;
}
