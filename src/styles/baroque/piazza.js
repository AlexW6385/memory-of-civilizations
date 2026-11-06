// The sculpture and water of Bernini's Rome about 1670 (docs/settlements/baroque-rome.md §4a): the
// Vatican obelisk on its pedestal and Fontana's four double-bodied bronze lions, the emblem and the
// cross on its tip; Maderno's fountain — the lobed travertine basin, the octagonal pedestal, the
// granite bowl and the upturned bowl above it, the water falling from each in a veil; the saints on
// the colonnade; the Ponte Sant'Angelo with Bernini's ten angels carrying the instruments of the
// Passion (set up in 1670) and the saints Peter and Paul at the city end.

import { box, lathe, rod, frustum } from '../../core/geom.js';
import { Local, ext, sheet } from '../renaissance/face.js';
import { human, blob, limb } from '../greek/sculpture.js';

const T = 'travertine', GB = 'gilt_bronze', BR = 'bronze', W = 'water', MB = 'marble';

/** A couchant lion facing +x, about 1.6 m long, its body at the origin's height. */
function lion(L, mat, s = 1, headless = false) {
  const B = (c, r, k) => L.add(mat, blob(c.map((v) => v * s), r * s, k, 8));
  B([0, 0.32, 0], 0.32, [2.0, 0.95, 1.1]);                                                  // the body lying
  if (!headless) {
    B([0.62, 0.48, 0], 0.3, [0.9, 1.1, 1.15]);                                              // the mane
    B([0.86, 0.5, 0], 0.2, [1.1, 1, 0.95]);                                                 // the head
    B([1.04, 0.44, 0], 0.1, [1.2, 0.8, 1]);                                                 // the muzzle
  }
  for (const z of [-0.16, 0.16]) { L.add(mat, limb([0.5 * s, 0.12 * s, z * s], [1.0 * s, 0.07 * s, z * s], 0.07 * s, 0.06 * s, 6)); B([-0.42, 0.24, z * 1.4], 0.2, [1.2, 1, 0.8]); }
  L.add(mat, limb([-0.62 * s, 0.25 * s, 0], [-1.0 * s, 0.08 * s, 0.25 * s], 0.05 * s, 0.035 * s, 5));
}

/** obelisk: { c, h (the shaft), y } — the pedestal, the four lions bearing the shaft, the emblem (mounts and star) and the cross. */
export function obelisk(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 25.3, y = el.y ?? 0, L = new Local();
  // the steps, the plinth, the die with its base and cornice mouldings, the attic block
  for (let i = 0; i < 3; i++) L.add(T, box(x - 5.2 + i * 0.45, y - 0.3, z - 5.2 + i * 0.45, x + 5.2 - i * 0.45, y + 0.2 + i * 0.25, z + 5.2 - i * 0.45));
  const p0 = y + 0.95, die = 2.9;
  L.add(T, box(x - 3.9, p0, z - 3.9, x + 3.9, p0 + 0.9, z + 3.9));
  L.add(T, frustum([x - 3.9, z - 3.9, x + 3.9, z + 3.9], p0 + 0.9, p0 + 1.3, 0.5, 0.5, 0.5, 0.5));
  L.add(T, box(x - die, p0 + 1.3, z - die, x + die, p0 + 5.6, z + die));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {                           // the inscription panels, framed
    const fx = x + dx * die, fz = z + dz * die, ax = dz !== 0 ? 1.9 : 0.1, az = dx !== 0 ? 1.9 : 0.1;
    L.add(T, box(fx - ax + dx * 0.0, p0 + 2.0, fz - az, fx + ax, p0 + 2.15, fz + az)); L.add(T, box(fx - ax, p0 + 4.75, fz - az, fx + ax, p0 + 4.9, fz + az));
  }
  L.add(T, frustum([x - die, z - die, x + die, z + die], p0 + 5.6, p0 + 6.0, -0.45, -0.45, -0.45, -0.45));
  L.add(T, box(x - die - 0.45, p0 + 6.0, z - die - 0.45, x + die + 0.45, p0 + 6.35, z + die + 0.45));
  L.add(T, box(x - 2.3, p0 + 6.35, z - 2.3, x + 2.3, p0 + 6.9, z + 2.3));
  col.rect([x - 5.2, z - 5.2, x + 5.2, z + 5.2], y, y + 8);
  // Fontana's lions at the corners, each with two bodies along the sides, the heads out on the corners
  const yl = p0 + 6.9, Lb = new Local();
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    for (const along of ['x', 'z']) {
      const Lc = new Local(); lion(Lc, BR, 1.2, along === 'z');                                // one head, two bodies
      const yaw = along === 'x' ? (sx > 0 ? 0 : Math.PI) : (sz > 0 ? -Math.PI / 2 : Math.PI / 2);
      const off = along === 'x' ? [sx * 0.85, sz * 1.65] : [sx * 1.65, sz * 0.55];
      for (const list of Lc.m.values()) for (const g of list) { g.rotateY(yaw); g.translate(x + off[0], yl, z + off[1]); Lb.add(BR, g); }
    }
  }
  Lb.add(BR, box(x - 1.45, yl + 0.74, z - 1.45, x + 1.45, yl + 0.9, z + 1.45));          // the bronze bed the shaft stands on
  Lb.emit(bag);
  // the shaft (its faces square to the axes), the emblem of Sixtus V — three mounts and the star — and the cross
  const sh = lathe([[1.9, 0], [1.3, h * 0.94], [0.001, h]], 4, null, 0, 0, 0); sh.rotateY(Math.PI / 4); sh.translate(x, yl + 0.9, z);
  bag.add('granite_red', sh);
  const top = yl + 0.9 + h;
  L.add(GB, box(x - 0.55, top - 0.15, z - 0.4, x + 0.55, top + 0.1, z + 0.4));
  for (const [dx, r, hh] of [[-0.35, 0.28, 0.45], [0.35, 0.28, 0.45], [0, 0.32, 0.7]]) L.add(GB, lathe([[r, 0], [r * 0.7, hh * 0.6], [0.001, hh]], 8, null, x + dx, top + 0.1, z));
  const star = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? 0.17 : 0.42; star.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  L.add(GB, ext(star, [], -0.05, 0.05).translate(x, top + 1.25, z));
  L.add(GB, box(x - 0.07, top + 1.6, z - 0.07, x + 0.07, top + 3.6, z + 0.07));
  L.add(GB, box(x - 0.5, top + 2.85, z - 0.07, x + 0.5, top + 3.0, z + 0.07));
  L.emit(bag);
}

/** fountain: { c, r, y } — Maderno's fountain. */
export function fountain(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 6, y = el.y ?? 0, L = new Local();
  // the basin: a low travertine wall on a lobed plan (eight lobes), its rounded rim, a step round it
  const lobed = (rr, k = 0.07) => { const p = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; p.push([Math.cos(a) * rr * (1 + k * Math.cos(8 * a)), Math.sin(a) * rr * (1 + k * Math.cos(8 * a))]); } return p; };
  const flat = (g, yy) => { g.rotateX(-Math.PI / 2); g.translate(x, yy, z); return g; };
  L.add(T, flat(ext(lobed(r + 0.6), [], 0, 0.25), y - 0.2));
  const outer = lobed(r), inner = lobed(r - 0.55);
  L.add(T, flat(ext(outer.map(([a, b]) => [a, -b]), [inner.map(([a, b]) => [a, -b])], 0, 0.95), y + 0.05));
  L.add(T, flat(ext(lobed(r + 0.12).map(([a, b]) => [a, -b]), [lobed(r - 0.67).map(([a, b]) => [a, -b])], 0, 0.14), y + 0.9));
  L.add(W, flat(ext(inner.map(([a, b]) => [a, -b]), [], 0, 0.01), y + 0.68));
  col.circle(x, z, r + 0.1, y, y + 1.0);
  // the octagonal pedestal in the water, the stem, the granite bowl, the stem, the upturned bowl, the jet
  L.add(T, lathe([[1.9, 0], [1.9, 0.3], [1.65, 0.45], [1.6, 1.5], [1.85, 1.7], [1.85, 1.9], [0.001, 1.9]], 8, null, x, y + 0.2, z));
  L.add(T, lathe([[0.9, 0], [0.62, 0.35], [0.55, 0.9], [0.8, 1.2], [0.001, 1.2]], 16, null, x, y + 2.1, z));
  const yb = y + 3.3;
  L.add('granite_grey', lathe([[0.7, 0], [1.6, 0.3], [2.7, 0.75], [3.35, 1.0], [3.4, 1.15], [3.25, 1.2], [2.6, 0.95], [0.001, 0.85]], 32, null, x, yb, z));
  L.add(W, lathe([[3.2, 0], [0.001, 0]], 32, null, x, yb + 1.05, z));
  L.add(T, lathe([[0.55, 0], [0.38, 0.4], [0.34, 1.3], [0.5, 1.6], [0.001, 1.6]], 12, null, x, yb + 0.9, z));
  const yu = yb + 2.5;
  L.add(T, lathe([[0.4, 0], [2.0, 0.25], [2.5, 0.42], [2.55, 0.55], [2.0, 0.85], [1.0, 1.05], [0.35, 1.15], [0.2, 1.4], [0.001, 1.45]], 32, null, x, yu, z));
  // the water falling from the rims in streams: from the upturned bowl into the granite one, from that into the basin
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    L.add(W, limb([x + c * 2.58, yu + 0.48, z + sn * 2.58], [x + c * 2.95, yb + 1.05, z + sn * 2.95], 0.025, 0.045, 4));
    const b2 = a + Math.PI / 48; L.add(W, limb([x + Math.cos(b2) * 3.44, yb + 1.1, z + Math.sin(b2) * 3.44], [x + Math.cos(b2) * 4.1, y + 0.68, z + Math.sin(b2) * 4.1], 0.025, 0.05, 4));
  }
  L.add(W, lathe([[0.12, 0], [0.08, 1.2], [0.001, 1.6]], 8, null, x, yu + 1.45, z));
  L.emit(bag);
}

/** A saint for the colonnade, ~3.1 m, in travertine, at the origin facing +z; k picks the pose and the attribute. */
export function saint(k) {
  const poses = [{ pose: 'ease' }, { pose: 'ease', mirror: true }, { pose: 'stand' }, { pose: 'ease', lean: 6 }, { pose: 'ease', mirror: true, lean: -6 }];
  const arms = [{ r: [[0.16, 0.66, 0.06], [0.14, 0.86, 0.12]] }, { r: [[0.16, 0.64, 0.04], [0.21, 0.5, 0.14]], l: [[-0.15, 0.68, 0.06], [-0.1, 0.84, 0.13]] }, { r: [[0.17, 0.7, 0.02], [0.22, 0.95, 0.05]] }, {}];
  const o = { ...poses[k % poses.length], arms: arms[k % arms.length], h: 3.1, drape: 'mantle', n: 6 };
  const fig = human(o), out = fig.stone.slice();
  // the attribute: a cross, a book, a palm, a staff
  const a = k % 4, hx = (o.mirror ? -1 : 1) * 0.45, hy = 3.1 * 0.8;
  if (a === 0) { out.push(box(hx - 0.04, 0.8, 0.3, hx + 0.04, 3.4, 0.38), box(hx - 0.3, 2.9, 0.3, hx + 0.3, 2.98, 0.38)); }
  else if (a === 1) out.push(box(-hx - 0.18, 1.55, 0.28, -hx + 0.08, 1.9, 0.42));
  else if (a === 2) out.push(limb([hx, 1.9, 0.35], [hx + 0.15, 3.3, 0.4], 0.04, 0.02, 5), blob([hx + 0.16, 3.25, 0.4], 0.16, [0.6, 1.8, 0.4], 6));
  else out.push(rod([hx, 0.05, 0.25], [hx, hy + 0.5, 0.3], 0.04, 5));
  return out;
}

/** An angel with its instrument of the Passion (k = 0…9), ~2.8 m, marble, facing +z. */
function angel(k) {
  const mirror = k % 2 === 1;
  const fig = human({ pose: 'ease', mirror, h: 2.8, drape: 'peplos', lean: mirror ? -5 : 5, arms: { r: [[0.15, 0.66, 0.08], [0.1, 0.8, 0.18]], l: [[-0.15, 0.66, 0.08], [-0.08, 0.78, 0.18]] }, n: 6 });
  const out = fig.stone.slice();
  // the wings: two broad feathered blades rising behind the shoulders
  for (const sg of [-1, 1]) {
    const pts = [[0, 0], [0.5, 0.35], [0.85, 1.1], [0.9, 1.7], [0.62, 1.3], [0.55, 1.45], [0.35, 0.95], [0.25, 1.05], [0.05, 0.4]];
    const wing = ext(sg > 0 ? pts : pts.map(([a, b]) => [-a, b]).reverse(), [], -0.04, 0.04);
    wing.rotateY(sg * 0.5); wing.translate(sg * 0.12, 2.05, -0.18); out.push(wing);
  }
  // the instrument held before the body
  const c = [0, 2.2, 0.55];
  switch (k) {
    case 0: out.push(lathe([[0.2, 0], [0.17, 1.4], [0.24, 1.5], [0.001, 1.5]], 8, null, 0.2, 1.1, 0.5)); break;          // the column
    case 1: for (const d of [-0.1, 0, 0.1]) out.push(limb([d, 2.25, 0.5], [d * 2, 1.4, 0.62], 0.025, 0.015, 4)); break;  // the scourges
    case 2: out.push(lathe([[0.22, -0.04], [0.26, 0], [0.22, 0.04], [0.18, 0]], 10, null, c[0], c[1], c[2])); break;     // the crown of thorns
    case 3: out.push(box(-0.5, 1.5, 0.48, 0.5, 2.3, 0.52)); break;                                                        // the veil
    case 4: out.push(box(-0.3, 1.2, 0.45, 0.35, 2.1, 0.6)); break;                                                        // the garment
    case 5: for (const d of [-0.12, 0, 0.12]) out.push(limb([d, 2.1, 0.5], [d, 2.4, 0.56], 0.02, 0.012, 4)); break;     // the nails
    case 6: out.push(box(-0.05, 0.6, 0.45, 0.05, 3.2, 0.55), box(-0.5, 2.45, 0.45, 0.5, 2.55, 0.55)); break;          // the cross
    case 7: out.push(box(-0.45, 1.75, 0.46, 0.45, 2.45, 0.54)); break;                                                    // the title (the cartouche)
    case 8: out.push(limb([0.2, 1.2, 0.45], [0.35, 3.4, 0.5], 0.02, 0.015, 4), blob([0.35, 3.45, 0.5], 0.09, [1, 1, 1], 6)); break; // the sponge on its reed
    default: out.push(limb([0.25, 0.7, 0.5], [0.4, 3.6, 0.5], 0.03, 0.02, 4), lathe([[0.05, 0], [0.001, 0.3]], 4, null, 0.4, 3.6, 0.5)); // the lance
  }
  return out;
}

/** ponte_angeli: { span, w, y, bed, water, city ('e' | 'w': the end opposite the castle) } — along x, centred at the origin. */
export function ponteAngeli(el, { bag, col }) {
  const S = el.span ?? 76, Wd = el.w ?? 11, y = el.y ?? 0.5, bed = el.bed ?? -8, wl = el.water ?? -5, half = S / 2, deck = y - 0.5;
  const L = new Local();
  // the five arches: the three great Roman ones in the middle, a small one at each end
  const pw = 4.5, small = 5, big = (S - 2 * small - 4 * pw) / 3;
  const spans = []; let u = -half;
  for (const w of [small, big, big, big, small]) { spans.push([u, u + w]); u += w + pw; }
  const piers = spans.slice(0, -1).map(([, b]) => b);
  const yS = wl + 0.6, crown = deck - 1.0;
  const arcs = spans.map(([a, b]) => { const c = (a + b) / 2, hw = (b - a) / 2, rise = Math.min(crown - yS, hw), R0 = (hw * hw + rise * rise) / (2 * rise); return { a, b, c, R0, cy: crown - R0, ys: crown - rise }; });
  const arcY = (s, uu) => s.cy + Math.sqrt(Math.max(0, s.R0 * s.R0 - (uu - s.c) ** 2));
  // the stands of the ten angels, five a side: the crowns of the three great arches and the two piers between them
  const stands = [arcs[1].c, piers[1] + pw / 2, arcs[2].c, piers[2] + pw / 2, arcs[3].c];
  for (const sz of [-1, 1]) {
    const F = new Local(), bottom = [[half + 4, deck], [half + 4, bed]];
    for (let j = arcs.length - 1; j >= 0; j--) { const s = arcs[j]; bottom.push([s.b, bed], [s.b, s.ys]); for (let i = 19; i >= 1; i--) { const uu = s.a + (s.b - s.a) * i / 20; bottom.push([uu, arcY(s, uu)]); } bottom.push([s.a, s.ys], [s.a, bed]); }
    bottom.push([-half - 4, bed], [-half - 4, deck]);
    F.add(T, ext(bottom, [], -0.9, 0));
    for (const s of arcs) for (let i = 0; i < 18; i++) { const u0 = s.a + (s.b - s.a) * i / 18, u1 = s.a + (s.b - s.a) * (i + 1) / 18, um = (u0 + u1) / 2, ym = arcY(s, um), ang = Math.atan2(ym - s.cy, um - s.c), t = (u1 - u0) * 0.46; const g = box(0, -t, 0, 0.9, t, 0.12); g.rotateZ(ang); g.translate(um, ym, 0); F.add(T, g); }
    F.add(T, box(-half - 4, deck - 0.35, -0.9, half + 4, deck, 0.2));
    // the parapet: a balustrade between pedestals; the angels on their pedestals over it
    const zP = -0.45;
    F.add(T, box(-half - 4, deck, zP - 0.35, half + 4, deck + 0.25, zP + 0.35));
    F.add(T, box(-half - 4, deck + 1.15, zP - 0.32, half + 4, deck + 1.32, zP + 0.32));
    for (let uu = -half - 3.8; uu < half + 3.8; uu += 0.42) F.add(T, lathe([[0.09, 0], [0.15, 0.3], [0.08, 0.6], [0.11, 0.85], [0.1, 0.9]], 6, null, uu, deck + 0.25, zP));
    for (const uu of stands) F.add(T, box(uu - 0.7, deck, zP - 0.7, uu + 0.7, deck + 1.9, zP + 0.7));
    for (const list of F.m.values()) for (const g of list) { if (sz < 0) g.rotateY(Math.PI); g.translate(0, 0, sz * Wd / 2); L.add(T, g); }
    col.rect([-half - 4, Math.min(sz * (Wd / 2 - 1.15), sz * Wd / 2), half + 4, Math.max(sz * (Wd / 2 - 1.15), sz * Wd / 2)], y, y + 1.9);
  }
  // the vault soffits and the piers with their cutwaters
  for (const s of arcs) { const rows = []; for (const zz of [-Wd / 2 + 0.85, Wd / 2 - 0.85]) { const row = []; for (let i = 0; i <= 20; i++) { const uu = s.a + (s.b - s.a) * i / 20; row.push([uu, arcY(s, uu), zz]); } rows.push(row); } L.add(T, sheet(rows)); }
  for (const p of piers) {
    L.add(T, box(p, bed, -Wd / 2 + 0.85, p + pw, Math.max(arcs[0].ys, yS), Wd / 2 - 0.85));
    for (const sz of [-1, 1]) { const zb = sz * Wd / 2, tip = sz * (Wd / 2 + 2.6); const g = ext([[p, -zb], [p + pw, -zb], [p + pw / 2, -tip]], [], 0, wl + 1.4 - bed); g.rotateX(-Math.PI / 2); g.translate(0, bed, 0); L.add(T, g); }
  }
  L.add('flagstone', box(-half - 4, deck - 0.3, -Wd / 2 + 0.75, half + 4, y, Wd / 2 - 0.75)); col.floor([-half - 4, -Wd / 2 + 0.8, half + 4, Wd / 2 - 0.8], y);
  // the ten angels, facing across the road
  let k = 0;
  for (const sz of [-1, 1]) for (const uu of stands) {
    const parts = angel(k++), yaw = sz > 0 ? Math.PI : 0;
    for (const g of parts) { g.rotateY(yaw); g.translate(uu, deck + 1.9, sz * (Wd / 2 - 0.45)); L.add(MB, g); }
  }
  // Peter with the keys and Paul with the sword at the city end
  const ce = (el.city ?? 'e') === 'e' ? 1 : -1;
  for (const sz of [-1, 1]) {
    const ux = ce * (half + 2.2), fig = human({ pose: 'ease', mirror: sz > 0, h: 3.0, drape: 'mantle', arms: { r: [[0.16, 0.64, 0.05], [0.15, 0.82, 0.14]] }, n: 6 });
    L.add(T, box(ux - 1.0, deck, sz * (Wd / 2 - 0.45) - 1.0, ux + 1.0, deck + 2.6, sz * (Wd / 2 - 0.45) + 1.0));
    const parts = fig.stone.slice();
    parts.push(sz < 0 ? box(0.35, 2.2, 0.3, 0.45, 2.6, 0.45) : box(-0.03, 1.0, 0.35, 0.03, 2.5, 0.42));
    for (const g of parts) { g.rotateY(ce > 0 ? -Math.PI / 2 : Math.PI / 2); g.translate(ux, deck + 2.6, sz * (Wd / 2 - 0.45)); L.add(MB, g); }
  }
  L.emit(bag);
}

/**
 * palace_roman: { rect, h, y, hall (a single tall hall: the Sistine Chapel) } — the Vatican Palace's ranges about 1670: a
 * travertine base, stuccoed storeys with windows framed in travertine under alternating pediments, the crowning cornice,
 * a low tiled roof; or the Sistine Chapel's plain brick hall with its row of tall round-headed windows high up.
 */
export function palaceRoman(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 24, y = el.y ?? 0, hall = !!el.hall, L = new Local();
  L.add(hall ? 'brick' : 'stucco_ochre', box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  if (!hall) L.add(T, box(x0 - 0.2, y - 0.5, z0 - 0.2, x1 + 0.2, y + 4.2, z1 + 0.2));
  L.add(T, box(x0 - 0.9, y + h - 1.0, z0 - 0.9, x1 + 0.9, y + h, z1 + 0.9));
  L.add(T, box(x0 - 0.5, y + h - 1.6, z0 - 0.5, x1 + 0.5, y + h - 1.0, z1 + 0.5));
  L.add('roof_tile', frustum([x0 - 0.8, z0 - 0.8, x1 + 0.8, z1 + 0.8], y + h, y + h + 4, 0, 0, (z1 - z0) / 2 + 0.8, (z1 - z0) / 2 + 0.8));
  // the windows on the four faces
  const faces = [['n', x0, x1, z0], ['s', x0, x1, z1], ['w', z0, z1, x0], ['e', z0, z1, x1]];
  for (const [f, a, b, c] of faces) {
    const along = f === 'n' || f === 's', out = f === 'n' || f === 'w' ? -1 : 1, n = Math.floor((b - a) / (hall ? 6.5 : 4.4));
    const P = (u, v, d0, d1) => along ? [u, c + out * d0, v, c + out * d1] : [c + out * d0, u, c + out * d1, v];
    const B = (mat, u0, u1, y0, y1, d0, d1) => { const q = P(u0, u1, d0, d1); L.add(mat, box(Math.min(q[0], q[2]), y0, Math.min(q[1], q[3]), Math.max(q[0], q[2]), y1, Math.max(q[1], q[3]))); };
    const rows = hall ? [[h * 0.6, 5.5]] : [[-99, 0], [6.0, 2.6], [11.5, 2.6], [17.0, 2.0]].filter(([wy]) => wy + 3 < h - 1.6);
    for (let i = 0; i < n; i++) {
      const u = a + (i + 0.5) * (b - a) / n;
      rows.forEach(([wy, wh], r) => {
        if (wy < 0) return;                                                                 // (the base storey: blind)
        const ww = hall ? 1.1 : 0.75, yy = y + wy;
        B('opening', u - ww, u + ww, yy, yy + wh, -0.02, 0.03);
        if (hall) { const head = []; for (let k = 0; k <= 8; k++) { const t = Math.PI * k / 8; head.push([Math.cos(t) * ww, Math.sin(t) * ww]); } const g = ext([[ww, -0.01], ...head, [-ww, -0.01]], [], -0.02, 0.03); g.rotateY({ s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[f]); g.translate(along ? u : c, yy + wh, along ? c : u); L.add('opening', g); return; }
        B(T, u - ww - 0.25, u - ww, yy - 0.1, yy + wh, 0, 0.18); B(T, u + ww, u + ww + 0.25, yy - 0.1, yy + wh, 0, 0.18);
        B(T, u - ww - 0.4, u + ww + 0.4, yy - 0.3, yy - 0.1, 0, 0.3);
        if (r === 1 || r === 2) { B(T, u - ww - 0.45, u + ww + 0.45, yy + wh, yy + wh + 0.25, 0, 0.35); for (let k = 0; k < 4; k++) { const t0 = k / 4, w0 = (ww + 0.5) * (1 - t0); B(T, u - w0, u + w0, yy + wh + 0.25 + k * 0.17, yy + wh + 0.42 + k * 0.17, 0, (i + r) % 2 ? 0.35 : 0.3); } }
        else B(T, u - ww - 0.3, u + ww + 0.3, yy + wh, yy + wh + 0.2, 0, 0.25);
      });
    }
  }
  L.emit(bag);
}
