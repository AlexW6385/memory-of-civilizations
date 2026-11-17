// The detail of the palace terrace (docs/settlements/qin-xianyang.md §9d): the courses of the ramming showing on the battered faces,
// timber wall-posts standing proud of the lower tier's face, the lower tier paved with a kerb at its edge, and the covered gallery that
// runs round the upper tier's foot (the Xianyang palace platform carried "rooms such as bedrooms and galleries"; covered corridors
// joined its parts): posts on stone bases, a black beam, a lean-to of grey tile against the upper tier's face, mitred at the corners
// and open at the stair. Decoration only: the lower tier is not walked (the colliders are those of qin_terrace).
import { box, frustum, lathe, quad, fromTriangles } from '../../core/geom.js';
import { TERRACE, STAIR } from '../../settlements/qin-xianyang/layout.js';

const { x0, z0, x1, z1, rim, h: TOP, h1: T1 } = TERRACE;

/** qin_terrace_detail: {} */
export function qinTerraceDetail(el, { bag }) {
  const sx = STAIR.x, gap = STAIR.w / 2 + 2.0;                                   // the stair's opening: |x − sx| < gap
  const BA = 0.6, BU = 0.5;                                                      // the batter of the lower and of the upper tier
  // ── ramming courses on the faces of both tiers: thin light bands, each following the lean of the face
  for (let y = 0.45; y < T1 - 0.2; y += 0.45) {
    const i = BA * y / T1, a = x0 - rim + i, b = x1 + rim - i, c = z0 - rim + i, d = z1 + rim - i;
    bag.add('mud_plaster', box(a - 0.02, y, c - 0.03, b + 0.02, y + 0.05, c + 0.03));
    bag.add('mud_plaster', box(a - 0.02, y, d - 0.03, sx - gap, y + 0.05, d + 0.03)); bag.add('mud_plaster', box(sx + gap, y, d - 0.03, b + 0.02, y + 0.05, d + 0.03));
    bag.add('mud_plaster', box(a - 0.03, y, c - 0.02, a + 0.03, y + 0.05, d + 0.02)); bag.add('mud_plaster', box(b - 0.03, y, c - 0.02, b + 0.03, y + 0.05, d + 0.02));
  }
  for (let y = T1 + 0.45; y < TOP - 0.15; y += 0.45) {
    const i = BU * (y - T1) / (TOP - T1), a = x0 + i, b = x1 - i, c = z0 + i, d = z1 - i;
    bag.add('mud_plaster', box(a - 0.02, y, c - 0.03, b + 0.02, y + 0.05, c + 0.03));
    bag.add('mud_plaster', box(a - 0.02, y, d - 0.03, sx - gap, y + 0.05, d + 0.03)); bag.add('mud_plaster', box(sx + gap, y, d - 0.03, b + 0.02, y + 0.05, d + 0.03));
    bag.add('mud_plaster', box(a - 0.03, y, c - 0.02, a + 0.03, y + 0.05, d + 0.02)); bag.add('mud_plaster', box(b - 0.03, y, c - 0.02, b + 0.03, y + 0.05, d + 0.02));
  }
  // ── wall-posts of timber proud of the lower tier's face every 6 m (each leans with the face; its top stops 5 cm under the tier's edge)
  const hr = T1 - 0.05;
  const lx = x1 - x0 + 2 * rim, lz = z1 - z0 + 2 * rim;
  for (let u = 3; u < lx - 1; u += 6) {
    const px = x0 - rim + u;
    bag.add('timber', frustum([px - 0.15, z0 - rim - 0.1, px + 0.15, z0 - rim + 1.3], 0, hr, 0, 0, BA, 0));
    if (Math.abs(px - sx) > gap) bag.add('timber', frustum([px - 0.15, z1 + rim - 1.3, px + 0.15, z1 + rim + 0.1], 0, hr, 0, 0, 0, BA));
  }
  for (let u = 3; u < lz - 1; u += 6) {
    const pz = z0 - rim + u;
    bag.add('timber', frustum([x0 - rim - 0.1, pz - 0.15, x0 - rim + 1.3, pz + 0.15], 0, hr, BA, 0, 0, 0));
    bag.add('timber', frustum([x1 + rim - 1.3, pz - 0.15, x1 + rim + 0.1, pz + 0.15], 0, hr, 0, BA, 0, 0));
  }
  // ── the lower tier's paving (grey brick, 3 cm) and the kerb of brick at its outer edge
  const P = 4.9, ke = rim - 0.6;                                                 // paved out to P from the upper tier's foot; the kerb from P to the edge (5.4)
  for (const [a, b, c, d] of [[x0 - P, z0 - P, x1 + P, z0], [x0 - P, z1, sx - gap, z1 + P], [sx + gap, z1, x1 + P, z1 + P], [x0 - P, z0, x0, z1], [x1, z0, x1 + P, z1]]) bag.add('brick_grey', box(a, T1, b, c, T1 + 0.03, d));
  for (const [a, b, c, d] of [[x0 - ke, z0 - ke, x1 + ke, z0 - P], [x0 - ke, z1 + P, sx - gap, z1 + ke], [sx + gap, z1 + P, x1 + ke, z1 + ke], [x0 - ke, z0 - P, x0 - P, z1 + P], [x1 + P, z0 - P, x1 + ke, z1 + P]]) bag.add('brick_grey', box(a, T1, b, c, T1 + 0.3, d));
  // ── the gallery: posts 2.4 m out from the upper tier's foot every 3.6 m, a black beam, the roof's fascia, the lean-to of tile
  const g = 2.4, pyTop = T1 + 2.6, by = T1 + 2.9;
  const post = (px, pz) => {
    bag.add('granite_grey', box(px - 0.26, T1 + 0.03, pz - 0.26, px + 0.26, T1 + 0.15, pz + 0.26));
    bag.add('timber_red', lathe([[0.17, 0], [0.15, 2.6 - 0.12]], 8, null, px, T1 + 0.15, pz));
  };
  const along = (a, b, fn) => { const n = Math.max(1, Math.round((b - a) / 3.6)); for (let k = 0; k <= n; k++) fn(a + k * (b - a) / n); };
  along(x0 - g, x1 + g, (px) => post(px, z0 - g));
  along(x0 - g, x1 + g, (px) => { if (Math.abs(px - sx) > gap + 0.5) post(px, z1 + g); });
  along(z0 - g, z1 + g, (pz) => { if (pz > z0 - g + 0.01 && pz < z1 + g - 0.01) { post(x0 - g, pz); post(x1 + g, pz); } });
  const bm = (a, b, c, d) => bag.add('lacquer_black', box(a, pyTop, b, c, by, d));
  bm(x0 - g - 0.15, z0 - g - 0.15, x1 + g + 0.15, z0 - g + 0.15);
  bm(x0 - g - 0.15, z1 + g - 0.15, sx - gap, z1 + g + 0.15); bm(sx + gap, z1 + g - 0.15, x1 + g + 0.15, z1 + g + 0.15);
  bm(x0 - g - 0.15, z0 - g + 0.15, x0 - g + 0.15, z1 + g - 0.15); bm(x1 + g - 0.15, z0 - g + 0.15, x1 + g + 0.15, z1 + g - 0.15);
  const dO = 2.9, dI = 0.5, yE = by + 0.02, yH = TOP - 0.05;
  const Ro = [x0 - dO, z0 - dO, x1 + dO, z1 + dO], Ri = [x0 + dI, z0 + dI, x1 - dI, z1 - dI];
  const T = [], sheet = (a, b, c, d) => { quad(T, a, b, c, d); quad(T, d, c, b, a); };
  sheet([Ro[0], yE, Ro[1]], [Ro[2], yE, Ro[1]], [Ri[2], yH, Ri[1]], [Ri[0], yH, Ri[1]]);
  sheet([Ro[2], yE, Ro[1]], [Ro[2], yE, Ro[3]], [Ri[2], yH, Ri[3]], [Ri[2], yH, Ri[1]]);
  sheet([Ro[0], yE, Ro[3]], [Ro[0], yE, Ro[1]], [Ri[0], yH, Ri[1]], [Ri[0], yH, Ri[3]]);
  for (const [xa, xb] of [[Ro[0], sx - gap], [sx + gap, Ro[2]]]) sheet([xa, yE, Ro[3]], [xb, yE, Ro[3]], [xb === Ro[2] ? Ri[2] : xb, yH, Ri[3]], [xa === Ro[0] ? Ri[0] : xa, yH, Ri[3]]);
  bag.add('tile_grey', fromTriangles(T));
  // the fascia and the tile-ends along the eave
  const fa = (a, b, c, d) => bag.add('timber_red', box(a, yE - 0.22, b, c, yE, d));
  fa(Ro[0] - 0.08, Ro[1] - 0.08, Ro[2] + 0.08, Ro[1]); fa(Ro[0] - 0.08, Ro[3], sx - gap, Ro[3] + 0.08); fa(sx + gap, Ro[3], Ro[2] + 0.08, Ro[3] + 0.08);
  fa(Ro[0] - 0.08, Ro[1], Ro[0], Ro[3]); fa(Ro[2], Ro[1], Ro[2] + 0.08, Ro[3]);
}
