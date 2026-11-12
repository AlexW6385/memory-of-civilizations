// The set pieces of the terrace's courts (docs/settlements/persepolis.md §17): the stone incense stands with lion-claw feet that
// the reliefs show behind the throne, the cloth awnings under which the court's scribes and grooms waited in the shade, and the
// wear of the paving where the processions passed (replaced slabs, a polished way, the dust the feet carried up the stair).
import { box, lathe, rod } from '../../core/geom.js';

const C = 'marble_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * incense_stand: { at: [x, z], y, h } — a stand of dark stone about 1.2 m high: three lion-claw feet on a ring, a shaft with rolls,
 * the wide bowl of bronze on a gilt rim; its smoke is the settlement's (smoke.js).
 */
export function incenseStand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = (el.h ?? 1.2) / 1.2;
  col.circle(x, z, 0.32 * s, y, y + 1.2 * s);
  for (let k = 0; k < 3; k++) {
    const a = k * 2.0944 + 0.4, ca = Math.cos(a), sa = Math.sin(a);
    bag.add(C, rod([x + ca * 0.27 * s, y + 0.04 * s, z + sa * 0.27 * s], [x + ca * 0.1 * s, y + 0.34 * s, z + sa * 0.1 * s], 0.045 * s, 7));          // the leg, leaning in
    bag.add(C, box(x + ca * 0.27 * s - 0.06 * s, y, z + sa * 0.27 * s - 0.06 * s, x + ca * 0.27 * s + 0.06 * s, y + 0.06 * s, z + sa * 0.27 * s + 0.06 * s));   // the paw
  }
  bag.add(C, lathe([[0.16 * s, 0], [0.17 * s, 0.04 * s], [0.12 * s, 0.07 * s], [0.07 * s, 0.1 * s], [0.045 * s, 0.14 * s], [0.045 * s, 0.4 * s], [0.07 * s, 0.43 * s], [0.045 * s, 0.47 * s],
    [0.045 * s, 0.62 * s], [0.07 * s, 0.65 * s], [0.045 * s, 0.69 * s], [0.045 * s, 0.7 * s], [0.09 * s, 0.72 * s], [0.001, 0.72 * s]], 14, null, x, y + 0.3 * s, z));
  bag.add('bronze', lathe([[0.08 * s, 0], [0.16 * s, 0.05 * s], [0.23 * s, 0.14 * s], [0.25 * s, 0.17 * s], [0.225 * s, 0.17 * s], [0.14 * s, 0.1 * s], [0.001, 0.07 * s]], 20, null, x, y + 1.02 * s, z));
  bag.add('gilt_bronze', lathe([[0.25 * s, 0], [0.262 * s, 0.01 * s], [0.262 * s, 0.035 * s], [0.25 * s, 0.04 * s], [0.225 * s, 0.035 * s], [0.225 * s, 0.01 * s]], 20, null, x, y + 1.175 * s, z));
  bag.add('basalt', lathe([[0.001, 0], [0.2 * s, 0.002], [0.2 * s, 0.004], [0.001, 0.02 * s]], 14, null, x, y + 1.065 * s, z));                  // the embers' ash
}

/**
 * court_awning: { rect: [x0, z0, x1, z1], y, h, cloth, trim } — four poles, a sheet of cloth with a striped valance on its four edges
 * and guy ropes to pegs, over the court's scribes or grooms.
 */
export function courtAwning(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 2.9, cloth = el.cloth ?? 'cloth_white', trim = el.trim ?? 'cloth_red', r = 0.055;
  const P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  for (const [px, pz] of P) {
    bag.add('wood_dark', rod([px, y, pz], [px, y + h + 0.25, pz], r, 8)); col.circle(px, pz, 0.12, y, y + h);
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.05, 0.04], [0.04, 0.09], [0.001, 0.13]], 8, null, px, y + h + 0.25, pz));
  }
  // the sheet, sagging toward its middle by a hand: two sloped halves
  const m = (x0 + x1) / 2, ys = y + h + 0.02;
  bag.add(cloth, box(x0 - 0.35, ys + 0.03, z0 - 0.35, x1 + 0.35, ys + 0.07, z1 + 0.35));
  bag.add(cloth, box(m - 0.6, ys + 0.07, z0 - 0.2, m + 0.6, ys + 0.12, z1 + 0.2));
  // the valance: alternating drops of two colours
  const drop = (a0, a1, c0, c1, along) => {
    const n = Math.max(2, Math.round((a1 - a0) / 0.5)), w = (a1 - a0) / n;
    for (let i = 0; i < n; i++) {
      const u0 = a0 + i * w, u1 = u0 + w - 0.02, mat = i % 2 ? trim : cloth;
      bag.add(mat, along ? box(u0, ys - 0.38, c0 - 0.35, u1, ys + 0.05, c0 - 0.33) : box(c0 - 0.35, ys - 0.38, u0, c0 - 0.33, ys + 0.05, u1));
      bag.add(mat, along ? box(u0, ys - 0.38, c1 + 0.33, u1, ys + 0.05, c1 + 0.35) : box(c1 + 0.33, ys - 0.38, u0, c1 + 0.35, ys + 0.05, u1));
    }
  };
  drop(x0 - 0.35, x1 + 0.35, z0, z1, true); drop(z0 - 0.35, z1 + 0.35, x0, x1, false);
  // guy ropes to pegs
  for (const [px, pz] of P) {
    const dx = Math.sign(px - m) * 1.3, dz = Math.sign(pz - (z0 + z1) / 2) * 1.3;
    bag.add('rope_fibre', rod([px, y + h + 0.1, pz], [px + dx, y + 0.05, pz + dz], 0.012, 4));
    bag.add('wood_dark', box(px + dx - 0.03, y, pz + dz - 0.03, px + dx + 0.03, y + 0.16, pz + dz + 0.03));
  }
}

/**
 * court_wear: { rect: [x0, z0, x1, z1] (the paving, its joints every 3.6 m from the corner), y, way: [z0, z1] (the processional
 * way's two rows of slabs), seed, dust: [[x, z, rx, rz], …] } — the polished slabs of the way in dark stone, a scatter of
 * replaced slabs of another tone, and drifts of the dust the visitors carried up the stair, thin and irregular [inferred].
 */
export function courtWear(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, st = 3.6, rand = rng(el.seed ?? 77), i0 = 0.05;
  const slab = (mat, a, b, lift) => bag.add(mat, box(x0 + a * st + i0, y + 0.001, z0 + b * st + i0, x0 + (a + 1) * st - i0, y + lift, z0 + (b + 1) * st - i0));
  const nx = Math.floor((x1 - x0) / st), nz = Math.floor((z1 - z0) / st), wayRows = new Set();
  if (el.way) for (let b = 0; b < nz; b++) { const zc = z0 + (b + 0.5) * st; if (zc > el.way[0] && zc < el.way[1]) wayRows.add(b); }
  for (const b of wayRows) for (let a = 0; a < nx; a++) slab('marble_dark', a, b, 0.016);
  for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
    if (wayRows.has(b)) continue;
    if (rand() < 0.1) slab(rand() < 0.5 ? 'marble_dark' : 'schist_rubble', a, b, 0.014);
  }
  for (const [cx, cz, rx, rz] of el.dust ?? []) {
    for (let k = 0; k < 5; k++) {
      const ox = (rand() - 0.5) * rx, oz = (rand() - 0.5) * rz, w = rx * (0.25 + rand() * 0.3), d = rz * (0.25 + rand() * 0.3);
      bag.add('mud_plaster', box(cx + ox - w, y + 0.018, cz + oz - d, cx + ox + w, y + 0.03 + k * 0.001, cz + oz + d));
    }
  }
}

/** parasol: { at: [x, z], y, h, cloth } — the parasol a servant holds over a great man (the reliefs show it over the king): a pole, a ribbed disc, a fringe. */
export function parasol(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 2.35, cloth = el.cloth ?? 'cloth_red';
  bag.add('wood_dark', rod([x, y + 0.9, z], [x, y + h + 0.2, z], 0.022, 6));
  bag.add(cloth, lathe([[0.001, 0.2], [0.35, 0.14], [0.7, 0.04], [0.82, -0.02], [0.8, -0.05], [0.001, 0.12]], 16, null, x, y + h, z));
  bag.add('cloth_white', lathe([[0.82, -0.02], [0.83, -0.18], [0.78, -0.18], [0.77, -0.04]], 16, null, x, y + h, z));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.04, 0.03], [0.001, 0.1]], 8, null, x, y + h + 0.2, z));
}
