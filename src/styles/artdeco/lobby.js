// The Empire State Building's lobby of 1931 (docs/settlements/new-york.md §1e): from the Fifth Avenue doors a
// long hall, three storeys high, "focusing on a modernistic aluminum silhouette of the Empire State Building
// on the far wall"; its walls of ribbed, book-matched marble; the ceiling zig-zag ribbed, its mural a sky of
// gold and aluminium leaf with sunbursts, stars and the gears and wheels of the Machine Age; across it the
// corridor to 33rd and 34th Streets with the elevator banks, their doors gilded and framed in metal, and the
// aluminium mezzanine bridges spanning the corridor where it opens off the hall.

import { box, lathe } from '../../core/geom.js';

const MB = 'marble_pink', MD = 'marble_dark', AL = 'aluminium_dull', GD = 'gold', GB = 'gilt_bronze';

/** A lining on a wall face (axis 'x': the face at x = p, spanning z u0…u1; 'z': at z = p, spanning x), out into the room by sg. */
function lin(bag, mat, axis, p, sg, u0, u1, y0, y1, d0 = 0, d1 = 0.04) {
  const a = p + sg * d0, b = p + sg * d1;
  bag.add(mat, axis === 'x' ? box(Math.min(a, b), y0, Math.min(u0, u1), Math.max(a, b), y1, Math.max(u0, u1)) : box(Math.min(u0, u1), y0, Math.min(a, b), Math.max(u0, u1), y1, Math.max(a, b)));
}
/** A marble wall: the book-matched slabs, the ribs standing out every 0.6 m, a dark skirting, an aluminium band at the top. */
function ribbedWall(bag, axis, p, sg, u0, u1, y0, y1) {
  if (u1 - u0 < 0.2) return;
  lin(bag, MB, axis, p, sg, u0, u1, y0 + 0.32, y1);
  lin(bag, MD, axis, p, sg, u0, u1, y0, y0 + 0.32, 0, 0.07);
  lin(bag, AL, axis, p, sg, u0, u1, y1 - 0.35, y1, 0.04, 0.1);
  const n = Math.floor((u1 - u0) / 0.6);
  for (let i = 1; i < n; i++) { const u = u0 + i * (u1 - u0) / n; lin(bag, MB, axis, p, sg, u - 0.06, u + 0.06, y0 + 0.32, y1 - 0.35, 0.04, 0.1); }
}
/** A sunburst of the ceiling at (x, z) on its underside at y: a gold boss, rays of gold and aluminium, a toothed wheel round it. */
function sunburst(bag, x, y, z, R) {
  bag.add(GD, lathe([[0.001, 0], [R * 0.2, 0], [R * 0.18, -0.05], [0.001, -0.07]], 16, null, x, y, z));
  for (let k = 0; k < 24; k++) {
    const t = k / 24 * Math.PI * 2, L2 = R * (k % 2 ? 0.75 : 1.0);
    bag.add(k % 2 ? AL : GD, box(R * 0.22, -0.03, -0.025, L2, 0, 0.025).rotateY(t).translate(x, y, z));
  }
  // the wheel: a ring with its teeth
  bag.add(AL, lathe([[R * 1.08, 0], [R * 1.08, -0.035], [R * 1.18, -0.035], [R * 1.18, 0]], 32, null, x, y, z));
  for (let k = 0; k < 20; k++) bag.add(AL, box(R * 1.18, -0.035, -0.05, R * 1.27, 0, 0.05).rotateY(k / 20 * Math.PI * 2).translate(x, y, z));
}
/** A star of the mural: four points of gold leaf. */
const star = (bag, x, y, z, r) => { for (const t of [0, Math.PI / 2]) bag.add(GD, box(-r, -0.02, -r * 0.18, r, 0, r * 0.18).rotateY(t + Math.PI / 4).translate(x, y, z)); };

/**
 * The lobby inside the base: H1 the hall [x0, z0, x1, z1] (entered from x1), hTop its height; H2 the corridor across it,
 * cTop its height; y the street, yF the lobby's floor.
 */
export function esbLobby(bag, col, lights, { H1, H2, y, yF, hTop, cTop }) {
  const [hx0, hz0, hx1, hz1] = H1, [cx0, cz0, cx1, cz1] = H2, hzc = (hz0 + hz1) / 2;
  // the floors: marble laid with a dark border
  for (const [a, b, c, d] of [H1, [cx0, cz0, cx1, hz0], [cx0, hz1, cx1, cz1]]) {
    bag.add('marble_floor', box(a, y - 0.5, b, c, yF, d)); col.floor([a, b, c, d], yF);
  }
  for (const [a, b, c, d] of [[hx0, hz0, hx1, hz0 + 0.4], [hx0, hz1 - 0.4, hx1, hz1]]) bag.add(MD, box(a, yF, b, c, yF + 0.006, d));
  // the hall's walls: north and south broken by the corridor's mouths, the far wall behind the silhouette
  for (const [p, sg] of [[hz0, 1], [hz1, -1]]) {
    ribbedWall(bag, 'z', p, sg, hx0, cx0, yF, hTop);
    ribbedWall(bag, 'z', p, sg, cx1, hx1, yF, hTop);
    ribbedWall(bag, 'z', p, sg, cx0, cx1, cTop, hTop);
  }
  ribbedWall(bag, 'x', hx0, 1, hz0, hz1, yF, hTop);
  // the corridor's walls, with the elevator banks: doors of gilded metal in aluminium frames, the indicators over them
  for (const [p, sg] of [[cx0, 1], [cx1, -1]]) for (const [a, b] of [[cz0, hz0], [hz1, cz1]]) {
    ribbedWall(bag, 'x', p, sg, a, b, yF, cTop);
    for (let z = a + 1.6; z < b - 1.2; z += 2.4) {
      lin(bag, AL, 'x', p, sg, z - 0.68, z + 0.68, yF, yF + 2.75, 0.04, 0.12);
      lin(bag, GB, 'x', p, sg, z - 0.55, z - 0.01, yF, yF + 2.5, 0.12, 0.14);
      lin(bag, GB, 'x', p, sg, z + 0.01, z + 0.55, yF, yF + 2.5, 0.12, 0.14);
      lin(bag, AL, 'x', p, sg, z - 0.3, z + 0.3, yF + 2.85, yF + 3.15, 0.1, 0.16);
      lin(bag, GD, 'x', p, sg, z - 0.22, z + 0.22, yF + 2.92, yF + 3.08, 0.16, 0.17);
    }
  }
  for (const [p, sg] of [[cz0, 1], [cz1, -1]]) ribbedWall(bag, 'z', p, sg, cx0, cx1, yF, cTop);
  // the ceilings: the gilded ground, stepped ribs along the walls, cross ribs, the sunbursts, wheels and stars
  const ceil = ([a, b, c, d], top, sb) => {
    bag.add(GB, box(a, top - 0.06, b, c, top, d));
    for (let k = 1; k <= 3; k++) { const s = k * 0.18; bag.add(AL, box(a, top - 0.06 - k * 0.14, b, c, top - 0.06 - (k - 1) * 0.14, b + s)); bag.add(AL, box(a, top - 0.06 - k * 0.14, d - s, c, top - 0.06 - (k - 1) * 0.14, d)); }
    for (let x = a + (sb ? 0.9 : 1.8); x < c - 0.5; x += sb ? 2.7 : 1.8) if (!sb || Math.round((x - a - 0.9) / 2.7) % 2 === 0 || x > c - 2.5) bag.add(AL, box(x - 0.05, top - 0.16, b + 0.54, x + 0.05, top - 0.06, d - 0.54));
    if (sb) for (let x = a + 3.6; x < c - 2; x += 5.4) sunburst(bag, x, top - 0.06, (b + d) / 2, Math.min(1.6, (d - b) / 2 - 1.2));
    for (let x = a + 1.2, k = 0; x < c - 0.5; x += 1.8, k++) for (const f of [0.15, 0.85]) star(bag, x + (k % 2) * 0.3, top - 0.06, b + (d - b) * f, 0.18);
  };
  ceil(H1, hTop, true);
  ceil([cx0, cz0, cx1, hz0], cTop, false); ceil([cx0, hz1, cx1, cz1], cTop, false);
  // the bridges across the corridor's mouths at the mezzanine: a deck, its fascia with fins, railings of aluminium
  const yb = yF + 4.9;
  for (const [z0, z1] of [[hz0 - 1.5, hz0], [hz1, hz1 + 1.5]]) {
    bag.add(AL, box(cx0, yb, z0, cx1, yb + 0.35, z1));
    for (let x = cx0 + 0.3; x < cx1 - 0.2; x += 0.6) for (const z of [z0, z1]) bag.add(AL, box(x - 0.04, yb - 0.25, z - 0.03, x + 0.04, yb + 0.35, z + 0.03));
    for (const z of [z0 + 0.05, z1 - 0.05]) {
      bag.add(AL, box(cx0, yb + 1.0, z - 0.05, cx1, yb + 1.08, z + 0.05));
      for (let x = cx0 + 0.15; x < cx1; x += 0.15) bag.add(AL, box(x - 0.012, yb + 0.35, z - 0.012, x + 0.012, yb + 1.0, z + 0.012));
    }
    col.rect([cx0, z0, cx1, z1], yb, yb + 1.08);
  }
  // the silhouette on the far wall: a panel of dark marble, the rays of gold and aluminium, the tower of aluminium stepping back to its mast
  const xw = hx0 + 0.04, ys = yF + 1.6;
  lin(bag, MD, 'x', hx0, 1, hzc - 3.2, hzc + 3.2, yF + 1.0, yF + 12.6, 0.04, 0.1);
  for (let k = 0; k < 15; k++) {
    const t = -Math.PI / 2.3 + k * (Math.PI / 2.3 * 2) / 14, L2 = k % 2 ? 2.6 : 3.4;
    bag.add(k % 2 ? AL : GD, box(-0.015, 0, -0.04, 0.015, L2, 0.04).rotateX(t).translate(xw + 0.08, ys + 7.2, hzc));
  }
  const steps = [[1.8, 0, 1.4], [1.25, 1.4, 1.0], [0.95, 2.4, 4.4], [0.62, 6.8, 1.0], [0.45, 7.8, 0.5], [0.28, 8.3, 0.7], [0.16, 9.0, 0.9], [0.05, 9.9, 0.8]];
  for (const [hw, y0, h] of steps) bag.add(AL, box(xw + 0.06, ys + y0, hzc - hw, xw + 0.2, ys + y0 + h, hzc + hw));
  for (let k = -3; k <= 3; k++) bag.add(GD, box(xw + 0.2, ys + 2.4, hzc + k * 0.27 - 0.025, xw + 0.23, ys + 6.8, hzc + k * 0.27 + 0.025));
  lin(bag, AL, 'x', hx0, 1, hzc - 2.6, hzc + 2.6, ys - 0.25, ys, 0.1, 0.26);
  // the lights: bronze sconces of glass up the long walls, their glow; three over the hall's middle
  for (let x = hx0 + 4; x < hx1 - 2; x += 6) for (const [p, sg] of [[hz0, 1], [hz1, -1]]) {
    if (x > cx0 - 1 && x < cx1 + 1) continue;
    lin(bag, AL, 'z', p, sg, x - 0.2, x + 0.2, yF + 3.4, yF + 4.4, 0.1, 0.22);
    lin(bag, 'lamp_glass', 'z', p, sg, x - 0.16, x + 0.16, yF + 3.5, yF + 4.3, 0.22, 0.36);
    lights.push({ at: [x, yF + 4.0, p + sg * 0.6], color: '#ffd9a0', intensity: 3, distance: 9 });
  }
  for (let x = hx0 + 6; x < hx1 - 3; x += 9) lights.push({ at: [x, hTop - 2, hzc], color: '#ffe2b8', intensity: 5, distance: 16 });
}
