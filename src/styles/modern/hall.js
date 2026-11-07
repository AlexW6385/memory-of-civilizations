// The Concert Hall of the Sydney Opera House as it opened in October 1973 (docs/settlements/sydney.md §1d): under
// the largest shells, an enclosure whose walls, stage and floor are of brush box and whose ceiling is of white
// birch; the seats with shells of birch upholstered in magenta wool (for both, the nearest materials: see the
// dossier); the stage near the north end with the choir's terraces behind it and the organ's case on the north
// wall — the organ itself still being built (completed only in 1979); over the stage the perspex rings, the
// "acoustic clouds", hung shortly before the opening. Entered from the south through a door and a passage under
// the raked stalls, which rise southward from the stage.

import { box, lathe } from '../../core/geom.js';

const BB = 'brushbox', BI = 'wood_ochre', SEAT = 'cloth_maroon';

/** One seat facing −z (the stage) with its foot at (x, y, z): the birch shell, the cushion, the back. */
function seat(bag, x, y, z) {
  bag.add(BI, box(x - 0.25, y, z - 0.22, x + 0.25, y + 0.42, z + 0.22));
  bag.add(SEAT, box(x - 0.23, y + 0.42, z - 0.22, x + 0.23, y + 0.5, z + 0.2));
  bag.add(SEAT, box(x - 0.23, y + 0.5, z + 0.12, x + 0.23, y + 0.98, z + 0.2));
  bag.add(BI, box(x - 0.25, y + 0.42, z + 0.2, x + 0.25, y + 1.0, z + 0.26));
}

/**
 * concertHall(bag, col, lights, { x, aw (half-width), zS (south end), zN (north wall), yf (floor), env(x, z) (the shells'
 * lowest inner height over a point, from yf) }) — builds the enclosure hollow instead of solid.
 */
export function concertHall(bag, col, lights, { x: cx, aw, zS: zS0, zN, yf, env }) {
  // (the south 16 m stay solid: the restaurant's shells come down over them)
  const zS = zS0 - 16, W = 0.6, xi0 = cx - aw + W, xi1 = cx + aw - W, zi1 = zS - W, zi0 = zN;
  for (let zz = zS0; zz > zS; zz -= 4) { const zb = zz - 4, hh = Math.min(env(cx - aw, zz), env(cx - aw, zb), env(cx + aw, zz), env(cx + aw, zb)) * 0.82; if (hh >= 3) { bag.add(BB, box(cx - aw, yf, zb, cx + aw, yf + hh, zz)); col.rect([cx - aw, zb, cx + aw, zz], yf, yf + hh); } }
  // the shell of the enclosure in strips of 4 m: side walls and roof following the shells' envelope (as the solid one did),
  // the risers closing the steps of the roof; inside, the ceiling of birch on its ribs a metre lower
  let prev = null;
  for (let zz = zS; zz > zN; zz -= 4) {
    const zb = Math.max(zN, zz - 4), hh = Math.min(env(cx - aw, zz), env(cx - aw, zb), env(cx + aw, zz), env(cx + aw, zb)) * 0.82;
    if (hh < 3) continue;
    for (const [a, b] of [[cx - aw, xi0], [xi1, cx + aw]]) {
      const dz0 = zS - W - 2.5, dz1 = zS - W - 0.5;                                     // (the east door's gap, 2 m wide, 3 m high)
      if (a > cx && zb < dz1 && zz > dz0) {
        for (const [p, q] of [[zb, dz0], [dz1, zz]]) if (q - p > 0.01) { bag.add(BB, box(a, yf, p, b, yf + hh, q)); col.rect([a, p, b, q], yf, yf + hh); }
        bag.add(BB, box(a, yf + 3.0, Math.max(zb, dz0), b, yf + hh, Math.min(zz, dz1)));
      } else { bag.add(BB, box(a, yf, zb, b, yf + hh, zz)); col.rect([a, zb, b, zz], yf, yf + hh); }
    }
    bag.add(BB, box(cx - aw, yf + hh - 0.6, zb, cx + aw, yf + hh, zz));
    bag.add(BI, box(xi0, yf + hh - 1.3, zb, xi1, yf + hh - 1.2, zz));
    for (let x = xi0 + 1.5; x < xi1 - 0.5; x += 1.5) bag.add(BI, box(x - 0.07, yf + hh - 1.55, zb, x + 0.07, yf + hh - 1.3, zz));
    // (the filler between the birch and the roof, behind the ceiling, so that no gap shows at the walls)
    for (const [a, b] of [[xi0, xi0 + 0.05], [xi1 - 0.05, xi1]]) bag.add(BI, box(a, yf + hh - 1.3, zb, b, yf + hh - 0.6, zz));
    if (prev !== null && Math.abs(prev - hh) > 0.01) {
      const lo = Math.min(prev, hh), hi = Math.max(prev, hh);
      bag.add(BB, box(cx - aw, yf + lo - 0.6, zz - 0.3, cx + aw, yf + hi, zz + 0.3));
      bag.add(BI, box(xi0, yf + lo - 1.3, zz - 0.32, xi1, yf + hi - 1.2, zz + 0.32));
    }
    prev = hh;
  }
  // the south wall; the door in the east wall near it, from the podium between the halls; the floor of brush box
  const dw = 2.0, dh = 3.0, dz = zi1 - 1.5, hE = Math.min(env(cx + aw, zS), env(cx + aw, zS - 4)) * 0.82;
  bag.add(BB, box(xi0, yf, zi1, xi1, yf + Math.min(env(cx - aw, zS), env(cx + aw, zS)) * 0.82, zS)); col.rect([xi0, zi1, xi1, zS], yf, yf + 10);
  bag.add('steel_grey', box(cx + aw, yf + dh, dz - dw / 2 - 0.1, cx + aw + 0.05, yf + dh + 0.12, dz + dw / 2 + 0.1));
  for (const s of [-1, 1]) bag.add(BB, box(xi1 - 1.1, yf, dz + s * dw / 2, xi1 - 0.62, yf + dh - 0.02, dz + s * (dw / 2 - 0.06)));
  bag.add(BB, box(xi0, yf, zi0, xi1, yf + 0.04, zi1)); col.floor([xi0, zi0, xi1, zi1], yf + 0.04);
  const F = yf + 0.04;
  // the stage: a platform of brush box, the steps up to it from the aisle
  const zs0 = zN + 20, zs1 = zs0 + 13, sh = 0.9, sx0 = cx - 8.5, sx1 = cx + 8.5;
  bag.add(BB, box(sx0, F, zs0, sx1, F + sh, zs1)); col.rect([sx0, zs0, sx1, zs1], F, F + sh); col.floor([sx0, zs0, sx1, zs1], F + sh);
  for (let k = 1; k <= 4; k++) bag.add(BB, box(cx - 1.4, F, zs1, cx + 1.4, F + sh * k / 5, zs1 + 0.3 * (5 - k)));
  col.ramp([cx - 1.4, zs1, cx + 1.4, zs1 + 1.2], F, F + sh, 'n');
  // the orchestra's chairs and stands in rows round the conductor's podium
  for (let r = 0; r < 4; r++) {
    const R = 3 + r * 1.6, n = 7 + r * 3;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (0.15 + 0.7 * k / (n - 1)), x = cx + Math.cos(a) * R, z = zs1 - 1.6 - Math.sin(a) * R;
      if (z < zs0 + 0.6 || Math.abs(x - cx) > 8) continue;
      bag.add('steel_grey', box(x - 0.2, F + sh + 0.43, z - 0.2, x + 0.2, F + sh + 0.47, z + 0.2));
      for (const [ex, ez] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) bag.add('steel_grey', box(x + ex - 0.015, F + sh, z + ez - 0.015, x + ex + 0.015, F + sh + 0.43, z + ez + 0.015));
      const sx = x + (cx - x) / R * 0.55, sz = z + (zs1 - 1.6 - z) / R * 0.55;
      bag.add('iron', box(sx - 0.01, F + sh, sz - 0.01, sx + 0.01, F + sh + 1.05, sz + 0.01)); bag.add('iron', box(sx - 0.22, F + sh + 1.05, sz - 0.02, sx + 0.22, F + sh + 1.35, sz + 0.02));
    }
  }
  bag.add(BB, box(cx - 0.5, F + sh, zs1 - 1.9, cx + 0.5, F + sh + 0.2, zs1 - 1.0));
  // the choir's terraces behind the stage, rising to the north wall, their benches
  for (let r = 0; r < 5; r++) {
    const za = zs0 - (r + 1) * 1.0, yy = F + sh + 0.45 * (r + 1);
    bag.add(BB, box(sx0, F, za, sx1, yy, za + 1.0)); col.rect([sx0, za, sx1, za + 1.0], F, yy);
    for (let x = sx0 + 0.4; x < sx1 - 0.3; x += 0.55) seat(bag, x, yy, za + 0.45);
  }
  // the organ's case on the north wall over the choir: brush box towers and flats, its pipes not yet in (1979)
  const ox0 = cx - 7, ox1 = cx + 7, oy0 = F + sh + 2.6, oy1 = oy0 + 13;
  bag.add(BB, box(ox0, oy0, zN, ox1, oy0 + 0.8, zN + 1.2));
  for (let k = 0; k < 7; k++) {
    const a = ox0 + k * 2, top = oy0 + 0.8 + (k === 3 ? 12 : k % 2 ? 7 : 9.5);
    bag.add(BB, box(a, oy0 + 0.8, zN, a + 0.25, top, zN + 1.0)); bag.add(BB, box(a + 1.75, oy0 + 0.8, zN, a + 2.0, top, zN + 1.0));
    bag.add('opening', box(a + 0.25, oy0 + 0.8, zN + 0.2, a + 1.75, top - 0.3, zN + 0.22));
    bag.add(BB, box(a, top - 0.3, zN, a + 2.0, top, zN + 1.05));
    if (k === 3) for (let p = 0; p < 9; p++) { const px = a + 0.35 + p * 0.16, ph = 7 - Math.abs(p - 4) * 0.6; bag.add('steel_chrome', lathe([[0.06, 0], [0.06, ph], [0.001, ph]], 8, null, px, oy0 + 1.1, zN + 0.6)); }
  }
  // scaffolding before the case, the organ builders' work going on
  for (const x of [ox0 - 0.4, cx, ox1 + 0.4]) bag.add('timber', box(x - 0.05, F + sh + 2.25, zN + 1.4, x + 0.05, oy1, zN + 1.5));
  for (let yy = oy0 + 2; yy < oy1; yy += 2) bag.add('timber', box(ox0 - 0.5, yy, zN + 1.35, ox1 + 0.5, yy + 0.06, zN + 1.55));
  // the stalls: rows rising southward from the stage, either side of the central aisle; under them solid
  const za0 = zs1 + 1.6, rise = 0.27, dep = 0.92, aw2 = 1.3;
  const roofAt = (z) => Math.min(env(cx - aw, z), env(cx + aw, z), env(cx - aw, z + 4), env(cx + aw, z + 4)) * 0.82 - 1.3;
  for (let r = 0, z = za0; z < zi1 - 3.4; r++, z += dep) {
    const yy = F + rise * (r + 1);
    if (yy + 3.2 > yf + roofAt(z)) break;
    for (const [a, b] of [[xi0, cx - aw2], [cx + aw2, xi1]]) {
      bag.add(BB, box(a, F, z, b, yy, z + dep));
      for (let x = a + 0.35; x < b - 0.25; x += 0.55) seat(bag, x, yy, z + 0.45);
      col.rect([a, z, b, z + dep], F, yy + 0.9);
    }
    // the rails of birch along the aisle, stepping with the rows
    for (const [a, b] of [[cx - aw2 - 0.06, cx - aw2], [cx + aw2, cx + aw2 + 0.06]]) bag.add(BI, box(a, F, z, b, yy + 0.9, z + dep));
  }
  // the acoustic clouds: rings of perspex hung over the stage on their rods
  const yc = F + sh + 11;
  for (let k = 0; k < 21; k++) {
    const a = k * 2.39996, rr = 1.2 + Math.sqrt(k) * 1.5, x = cx + Math.cos(a) * rr * 0.9, z = (zs0 + zs1) / 2 + Math.sin(a) * rr * 0.8, R = 1.1 - (k % 3) * 0.15, yk = yc + (k % 4) * 0.5;
    if (Math.abs(x - cx) > 8) continue;
    bag.add('glass_lamp', lathe([[R, -0.04], [R + 0.05, 0], [R, 0.04], [R - 0.05, 0], [R, -0.04]], 24, null, x, yk, z));
    bag.add('steel_grey', box(x - 0.008, yk, z - 0.008, x + 0.008, Math.max(yk + 0.5, yf + roofAt(z) - 0.1), z + 0.008));
  }
  // the lights: rows in the ceiling over the stalls and the stage
  for (let z = zN + 8; z < zS - 4; z += 9) for (const dx of [-5, 5]) lights.push({ at: [cx + dx, yf + Math.max(8, env(cx, z) * 0.82 - 2.5), z], color: '#ffe4c0', intensity: 6, distance: 22 });
}
