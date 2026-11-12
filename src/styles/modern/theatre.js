// The Opera Theatre of the Sydney Opera House as it opened in September 1973 (docs/settlements/sydney.md §1h; since 2012 the Joan
// Sutherland Theatre): under the smaller shells to the east, a proscenium theatre of 1,507 seats with a cramped orchestra pit, the
// stage house at the north end, the stalls rising south and a circle over their back rows. Entered from the south through a door in
// the west wall from the podium between the halls. The finishes are ours: dark-stained timber, maroon seats, a red curtain.

import { box, lathe, rod } from '../../core/geom.js';

const BB = 'brushbox', DK = 'wood_dark', SEAT = 'cloth_maroon';

function seat(bag, x, y, z) {
  bag.add(DK, box(x - 0.25, y, z - 0.22, x + 0.25, y + 0.42, z + 0.22));
  bag.add(SEAT, box(x - 0.23, y + 0.42, z - 0.22, x + 0.23, y + 0.5, z + 0.2));
  bag.add(SEAT, box(x - 0.23, y + 0.5, z + 0.12, x + 0.23, y + 0.98, z + 0.2));
  bag.add(DK, box(x - 0.25, y + 0.42, z + 0.2, x + 0.25, y + 1.0, z + 0.26));
}

/** operaTheatre(bag, col, lights, { x, aw, zS (south end), zN (north wall), yf (floor), env }) — the theatre's enclosure built hollow and furnished. */
export function operaTheatre(bag, col, lights, { x: cx, aw, zS: zS0, zN, yf, env }) {
  const zS = zS0 - 16, W = 0.6, xi0 = cx - aw + W, xi1 = cx + aw - W, zi1 = zS - W, zi0 = zN;
  for (let zz = zS0; zz > zS; zz -= 4) { const zb = zz - 4, hh = Math.min(env(cx - aw, zz), env(cx - aw, zb), env(cx + aw, zz), env(cx + aw, zb)) * 0.82; if (hh >= 3) { bag.add(BB, box(cx - aw, yf, zb, cx + aw, yf + hh, zz)); col.rect([cx - aw, zb, cx + aw, zz], yf, yf + hh); } }
  const dw = 2.0, dh = 3.0, dz = zi1 - 1.5;
  let prev = null;
  for (let zz = zS; zz > zN; zz -= 4) {
    const zb = Math.max(zN, zz - 4), hh = Math.min(env(cx - aw, zz), env(cx - aw, zb), env(cx + aw, zz), env(cx + aw, zb)) * 0.82;
    if (hh < 3) continue;
    for (const [a, b] of [[cx - aw, xi0], [xi1, cx + aw]]) {
      const dz0 = zS - W - 2.5, dz1 = zS - W - 0.5;                                       // (the west door's gap, 2 m wide, 3 m high)
      if (a < cx && zb < dz1 && zz > dz0) {
        for (const [p, q] of [[zb, dz0], [dz1, zz]]) if (q - p > 0.01) { bag.add(BB, box(a, yf, p, b, yf + hh, q)); col.rect([a, p, b, q], yf, yf + hh); }
        bag.add(BB, box(a, yf + 3.0, Math.max(zb, dz0), b, yf + hh, Math.min(zz, dz1)));
      } else { bag.add(BB, box(a, yf, zb, b, yf + hh, zz)); col.rect([a, zb, b, zz], yf, yf + hh); }
    }
    bag.add(BB, box(cx - aw, yf + hh - 0.6, zb, cx + aw, yf + hh, zz));
    bag.add(DK, box(xi0, yf + hh - 1.3, zb, xi1, yf + hh - 1.2, zz));                   // the dark ceiling
    for (let x = xi0 + 1.5; x < xi1 - 0.5; x += 1.5) bag.add(DK, box(x - 0.07, yf + hh - 1.55, zb, x + 0.07, yf + hh - 1.3, zz));
    for (const [a, b] of [[xi0, xi0 + 0.05], [xi1 - 0.05, xi1]]) bag.add(DK, box(a, yf + hh - 1.3, zb, b, yf + hh - 0.6, zz));
    // the walls' lining of dark timber battens
    for (const [a, b] of [[xi0, xi0 + 0.05], [xi1 - 0.05, xi1]]) bag.add(DK, box(a, yf, zb, b, yf + hh - 1.3, zz));
    if (prev !== null && Math.abs(prev - hh) > 0.01) {
      const lo = Math.min(prev, hh), hi = Math.max(prev, hh);
      bag.add(BB, box(cx - aw, yf + lo - 0.6, zz - 0.3, cx + aw, yf + hi, zz + 0.3));
      bag.add(DK, box(xi0, yf + lo - 1.3, zz - 0.32, xi1, yf + hi - 1.2, zz + 0.32));
    }
    prev = hh;
  }
  // the south wall, the door's frame, the floor
  bag.add(BB, box(xi0, yf, zi1, xi1, yf + Math.min(env(cx - aw, zS), env(cx + aw, zS)) * 0.82, zS)); col.rect([xi0, zi1, xi1, zS], yf, yf + 10);
  bag.add('steel_grey', box(cx - aw - 0.05, yf + dh, dz - dw / 2 - 0.1, cx - aw, yf + dh + 0.12, dz + dw / 2 + 0.1));
  for (const s of [-1, 1]) bag.add(BB, box(xi0 + 0.62, yf, dz + s * dw / 2, xi0 + 1.1, yf + dh - 0.02, dz + s * (dw / 2 - 0.06)));
  const F = yf + 0.04, sh = 1.1, zp = zN + 16, pitW = 7.5, pit0 = zp + 0.4, pit1 = pit0 + 4.2, pitD = 2.0;   // the stage's front edge, the pit, its floor
  // the floor in pieces round the orchestra pit
  const floor = (a, b, c, d) => { bag.add(BB, box(a, yf, c, b, F, d)); col.floor([a, c, b, d], F); };
  floor(xi0, xi1, pit1, zi1); floor(xi0, cx - pitW, pit0, pit1); floor(cx + pitW, xi1, pit0, pit1);
  bag.add(BB, box(cx - pitW, F - pitD - 0.1, pit0, cx + pitW, F - pitD, pit1)); col.floor([cx - pitW, pit0, cx + pitW, pit1], F - pitD);
  // the pit's rail and walls; its cramped chairs and stands; the conductor's podium
  for (const [a, b, c, d] of [[cx - pitW - 0.1, cx - pitW, pit0, pit1], [cx + pitW, cx + pitW + 0.1, pit0, pit1], [cx - pitW, cx + pitW, pit1, pit1 + 0.1]]) { bag.add(DK, box(a, F - pitD, c, b, F + 1.0, d)); col.rect([a, c, b, d], F - pitD, F + 1.0); }
  bag.add('gilt_bronze', box(cx - pitW, F + 1.0, pit1 - 0.02, cx + pitW, F + 1.05, pit1 + 0.12));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) {
    const x = cx - pitW + 1.0 + k * 1.5, z = pit0 + 0.9 + r * 1.1; if (r === 2 && k % 2) continue;
    bag.add('steel_grey', box(x - 0.2, F - pitD + 0.43, z - 0.2, x + 0.2, F - pitD + 0.47, z + 0.2)); for (const [ex, ez] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) bag.add('steel_grey', box(x + ex - 0.015, F - pitD, z + ez - 0.015, x + ex + 0.015, F - pitD + 0.43, z + ez + 0.015));
    bag.add('iron', box(x - 0.01, F - pitD, z - 0.5, x + 0.01, F - pitD + 1.05, z - 0.49)); bag.add('iron', box(x - 0.22, F - pitD + 1.05, z - 0.53, x + 0.22, F - pitD + 1.33, z - 0.5));
  }
  bag.add(DK, box(cx - 0.5, F - pitD, pit1 - 1.0, cx + 0.5, F - pitD + 0.25, pit1 - 0.2));
  // the stage: boards of timber, raised, wings either side behind the proscenium's walls, a painted backcloth, flats, the red curtain
  const sx0 = xi0, sx1 = xi1, opening = 6.2;
  bag.add(BB, box(sx0, F, zi0 + 0.2, sx1, F + sh, zp)); col.rect([sx0, zi0 + 0.2, sx1, zp], F, F + sh); col.floor([sx0, zi0 + 0.2, sx1, zp], F + sh);
  for (let k = 1; k <= 4; k++) bag.add(BB, box(cx + opening - 2.4, F, zp, cx + opening - 0.6, F + sh * k / 5, zp + 0.3 * (5 - k)));
  col.ramp([cx + opening - 2.4, zp, cx + opening - 0.6, zp + 1.5], F, F + sh, 'n');
  const hp = (z) => Math.min(env(cx - aw, z), env(cx + aw, z)) * 0.82 - 1.4;                // the roof's height at z
  for (const s of [-1, 1]) {                                                                 // the proscenium's walls and the arch's lintel
    bag.add(DK, box(s < 0 ? sx0 : cx + opening, F + sh, zp - 0.5, s < 0 ? cx - opening : sx1, yf + hp(zp), zp)); col.rect([s < 0 ? sx0 : cx + opening, zp - 0.5, s < 0 ? cx - opening : sx1, zp], F + sh, yf + hp(zp));
  }
  bag.add(DK, box(cx - opening, F + sh + 7.2, zp - 0.5, cx + opening, yf + hp(zp), zp));
  bag.add('gilt_bronze', box(cx - opening - 0.05, F + sh + 7.15, zp, cx + opening + 0.05, F + sh + 7.25, zp + 0.08));
  for (const s of [-1, 1]) { bag.add('cloth_red', box(cx + s * (opening - 1.4) - 1.4, F + sh, zp - 0.25, cx + s * (opening - 1.4) + 1.4, F + sh + 7.15, zp - 0.1)); }   // the curtain, drawn back to both sides
  bag.add('cloth_red', box(cx - opening, F + sh + 6.2, zp - 0.3, cx + opening, F + sh + 7.15, zp - 0.15));      // the valance
  bag.add('cloth_indigo', box(sx0 + 0.3, F + sh, zi0 + 0.3, sx1 - 0.3, yf + hp(zi0 + 3) - 1, zi0 + 0.4));    // the backcloth
  bag.add('paint_white', lathe([[0.001, 0], [2.2, 0], [2.2, 0.05], [0.001, 0.05]], 24, null, 0, 0, 0).rotateX(Math.PI / 2).translate(cx + 1.5, F + sh + 7.0, zi0 + 0.45));   // a painted moon
  for (const [a, h, w] of [[-4, 4.2, 3], [3.5, 3.4, 4.5], [-1.0, 2.6, 2.4]]) { bag.add('wood_painted', box(cx + a, F + sh, zi0 + 4 + Math.abs(a), cx + a + w, F + sh + h, zi0 + 4.2 + Math.abs(a))); col.rect([cx + a, zi0 + 4 + Math.abs(a), cx + a + w, zi0 + 4.2 + Math.abs(a)], F + sh, F + sh + h); }
  // the stalls: raked rows rising south from the pit, a central aisle and a side aisle each side
  const za0 = pit1 + 1.8, rise = 0.24, dep = 0.95, aw1 = 1.3;
  const roofAt = (z) => hp(z + 1.5);
  let lastZ = za0, lastY = F, rows = 0;
  for (let r = 0, z = za0; z < zi1 - 4.4 && r < 14; r++, z += dep) {
    const yy = F + rise * (r + 1);
    if (yy + 3.2 > yf + roofAt(z)) break;
    for (const [a, b] of [[xi0 + 1.3, cx - aw1], [cx + aw1, xi1 - 1.3]]) {
      bag.add(BB, box(a, F, z, b, yy, z + dep));
      for (let x = a + 0.35; x < b - 0.25; x += 0.55) seat(bag, x, yy, z + 0.45);
      col.rect([a, z, b, z + dep], F, yy + 0.9);
    }
    // the stairs of the side aisles, and the rail of the central one
    for (const [a, b] of [[xi0, xi0 + 1.3], [xi1 - 1.3, xi1]]) { bag.add(BB, box(a, F, z, b, yy, z + dep)); col.floor([a, z, b, z + dep], yy); }
    for (const [a, b] of [[cx - aw1 - 0.06, cx - aw1], [cx + aw1, cx + aw1 + 0.06]]) bag.add(DK, box(a, F, z, b, yy + 0.9, z + dep));
    lastZ = z + dep; lastY = yy; rows++;
  }
  // the circle: a gallery over the back rows, its front curved in a rail, its rows of seats, a soffit of dark timber
  if (rows > 10) {
    const g0 = lastZ - 9, gy = lastY + 2.6;
    bag.add(DK, box(xi0, gy - 0.5, g0, xi1, gy, lastZ + 4)); bag.add(BB, box(xi0, gy, g0 - 0.15, xi1, gy + 0.95, g0));
    for (let r = 0; r < 4; r++) for (let x = xi0 + 0.5; x < xi1 - 0.3; x += 0.55) seat(bag, x, gy + 0.18 * r, g0 + 1.4 + r * 0.95);
  }
  // the lights: work lights over the stage, pendants over the stalls
  lights.push({ at: [cx, F + sh + 6, zi0 + 7], color: '#ffeacc', intensity: 8, distance: 24 }, { at: [cx, F + 5, pit1 + 6], color: '#ffd9b0', intensity: 5, distance: 22 });
  for (let z = zp + 10; z < zS - 6; z += 10) for (const dx of [-4.5, 4.5]) lights.push({ at: [cx + dx, yf + Math.max(7, env(cx, z) * 0.82 - 3), z], color: '#ffe0b8', intensity: 5, distance: 20 });
  void rod;
}
