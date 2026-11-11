// The older blocks of Midtown in 1931 (docs/settlements/new-york.md §1h): brownstone and brick rowhouses with their stoops,
// areaway railings, enframed doors and bracketed cornices; cast-iron loft fronts (painted iron columns and entablatures
// over plate glass); the chimney stacks of the coal-fired roofs; and the subway's railed stair-heads with their globe lamps.
// All laid out on a face: u along it from the rect's corner, d outward from the wall.

import { box, rod, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The frame of a street face f of a rect: { R(u0, u1, y0, y1, d0, d1) → box, P(u, d, y) → point, L, a0, o, sg, along, ext }. */
function face([x0, z0, x1, z1], f) {
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  const ext = along ? z1 - z0 : x1 - x0;
  const R = (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(a0 + u0, y0, Math.min(a, b), a0 + u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, a0 + u0, Math.max(a, b), y1, a0 + u1); };
  const P = (u, d, yy) => along ? [a0 + u, yy, o + sg * d] : [o + sg * d, yy, a0 + u];
  const rc = (u0, u1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? [a0 + u0, Math.min(a, b), a0 + u1, Math.max(a, b)] : [Math.min(a, b), a0 + u0, Math.max(a, b), a0 + u1]; };
  return { R, P, rc, L, a0, o, sg, along, ext };
}
const BROWN = ['pottery_dark', 'brick', 'pottery_dark', 'brick_buff', 'pottery_dark', 'brick_grey'];
const STONE = 'limestone';

/** The houses of a row on a front: { c0, c1 (along the face), nf (storeys over the raised basement), H (their height above the pavement), mat, mir } — from the lot's seed alone, so the smoke can find the stacks. */
export function rowPlan(rect, front, h, seed) {
  const L = (front === 'n' || front === 's') ? rect[2] - rect[0] : rect[3] - rect[1], n = Math.max(1, Math.round(L / 5.8)), W = L / n, B = 1.75, r = rng((seed >>> 0) ^ 0x5bd1e995);
  const nfBase = Math.max(2, Math.min(4, Math.round((h - B) / 3.4)));
  return Array.from({ length: n }, (_, i) => {
    const nf = Math.max(2, Math.min(4, nfBase + (r() < 0.25 ? (r() < 0.5 ? -1 : 1) : 0)));
    return { c0: i * W, c1: (i + 1) * W, nf, H: B + nf * 3.4, mat: BROWN[Math.floor(r() * BROWN.length)], mir: i % 2 === 1 };
  });
}
/** The chimney stacks of a row, in the grid's frame: { x, z, y0 (base above the pavement), y1 (the pots' top) } — one at each pair's party wall, the last odd house's at its middle. */
export function rowStacks(rect, front, h, seed) {
  const F = face(rect, front), plan = rowPlan(rect, front, h, seed), out = [];
  for (let i = 0; i < plan.length; i += 2) {
    const a = plan[i], b = plan[i + 1], u = b ? a.c1 : (a.c0 + a.c1) / 2, y0 = b ? Math.min(a.H, b.H) : a.H, y1 = b ? Math.max(a.H, b.H) : a.H;
    const P = F.P(u, -F.ext * 0.45, 0);
    out.push({ x: P[0], z: P[2], y0, y1: y1 + 0.5 + 2.3 });
  }
  return out;
}
/**
 * rowhouses: { rect, y, front ('n' | 's'), h (about), seed } — the front cut into houses of about 5.8 m (the 20-foot lot), each of
 * brownstone or brick, three to five storeys on a raised basement; a stoop at the party wall (the doors paired), the areaway
 * railing, windows with lintels and sills, a bracketed cornice, a chimney stack at each pair's party wall.
 */
export function rowhouses(bag, col, rect, front, y, h, seed) {
  const F = face(rect, front), { R, L, ext } = F, plan = rowPlan(rect, front, h, seed), W = L / plan.length, B = 1.75;
  for (const st of rowStacks(rect, front, h, seed)) chimney(bag, st.x, y + st.y0 - 0.1, st.z, rng(seed + 7), st.y1 - st.y0 + 0.1);
  for (const { c0, c1, nf, H, mat, mir } of plan) {
    // (a house-local u written once for the even houses, mirrored for the odd: the doors paired at the party walls)
    const left = (u) => (mir ? c1 - u : c0 + u);
    const Rm = (a, b, y0, y1, d0, d1) => R(Math.min(left(a), left(b)), Math.max(left(a), left(b)), y0, y1, d0, d1);
    // the body: a raised basement of rusticated stone, the storeys in brownstone or brick
    bag.add(mat, R(c0, c1, y - 0.5, y + H, -ext * 0.9, 0));
    bag.add('granite_grey', R(c0 + 0.0, c1 - 0.0, y - 0.5, y + B, 0, 0.12));
    col.rect(F.rc(c0, c1, -ext * 0.9, 0), y - 0.5, y + H);
    for (let k = 1; k <= nf; k++) bag.add(STONE, R(c0, c1, y + B + (k - 1) * 3.4 + 0.02, y + B + (k - 1) * 3.4 + 0.2, 0, 0.1));       // the stringcourses at each floor
    // the stoop (side-run): a landing at the door and seven steps running along the front, a solid stringer down to the pavement
    const dU = 0.35, dW = 1.15, land = 0.95, sd = 0.85;                              // the door's place from the party wall, its width; the stoop's depth
    const sU0 = dU + dW + 0.15, steps = 7, run = 2.2, top0 = B - 0.04, rise = top0 / steps;
    bag.add('granite_grey', Rm(dU - 0.05, sU0, y - 0.5, y + top0, 0, land));                                    // the landing
    for (let j = 0; j < steps - 1; j++) bag.add('granite_grey', Rm(sU0, sU0 + (j + 1) * run / steps, y - 0.5, y + top0 - (j + 1) * rise, 0, sd));
    if (!mir) { col.ramp(F.rc(c0 + sU0, c0 + sU0 + run, 0, sd), y + rise * 0.5, y + top0, F.along ? 'w' : 'n'); col.floor(F.rc(c0 + dU, c0 + sU0, 0, land), y + top0); }
    else { col.ramp(F.rc(c1 - sU0 - run, c1 - sU0, 0, sd), y + rise * 0.5, y + top0, F.along ? 'e' : 's'); col.floor(F.rc(c1 - sU0, c1 - dU, 0, land), y + top0); }
    // its railing: pickets along the stairs' edge under a sloping rail, and along the landing's front; the newel lamp at the foot
    for (let k = 0; k <= 12; k++) { const t = run * k / 12, hh = y + top0 * (1 - t / run); bag.add('iron', Rm(sU0 + t - 0.012, sU0 + t + 0.012, hh, hh + 0.9, sd - 0.03, sd - 0.006)); }
    bag.add('iron', rod(F.P(left(sU0), sd - 0.018, y + top0 + 0.92), F.P(left(sU0 + run), sd - 0.018, y + 0.92), 0.022, 4));
    bag.add('iron', Rm(dU - 0.03, sU0, y + top0 + 0.88, y + top0 + 0.94, land - 0.03, land - 0.005));
    for (let u = dU + 0.08; u < sU0 - 0.02; u += 0.14) bag.add('iron', Rm(u - 0.012, u + 0.012, y + top0, y + top0 + 0.9, land - 0.03, land - 0.006));
    bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.06], [0.12, 0.17], [0.07, 0.25], [0.001, 0.27]], 8, null, ...F.P(left(sU0 + run), sd - 0.02, y + 0.92)));
    // the door: a surround of stone (jambs and a hood on brackets), the dark leaves, a transom
    const dY = y + B;
    bag.add(STONE, Rm(dU - 0.22, dU, dY, dY + 2.95, 0, 0.14)); bag.add(STONE, Rm(dU + dW, dU + dW + 0.22, dY, dY + 2.95, 0, 0.14)); bag.add(STONE, Rm(dU, dU + dW, dY + 2.55, dY + 2.95, 0, 0.14));
    bag.add('opening', Rm(dU, dU + dW, dY, dY + 2.55, 0, 0.05));
    bag.add('wood_painted', Rm(dU + 0.06, dU + dW - 0.06, dY, dY + 2.15, 0.05, 0.09));
    bag.add('glass_outer', Rm(dU + 0.06, dU + dW - 0.06, dY + 2.25, dY + 2.5, 0.05, 0.08));
    bag.add('gilt_bronze', Rm(dU + dW - 0.2, dU + dW - 0.14, dY + 1.0, dY + 1.06, 0.09, 0.13));
    bag.add(STONE, Rm(dU - 0.4, dU + dW + 0.4, dY + 2.95, dY + 3.25, 0, 0.4));
    for (const s of [0, 1]) bag.add(STONE, Rm(s ? dU + dW + 0.1 : dU - 0.22, s ? dU + dW + 0.4 : dU + 0.1, dY + 2.35, dY + 2.95, 0.14, 0.32));   // its brackets
    // windows: the parlor floor's two beside the door, the floors above three, the basement's two small ones with grilles
    const win = (ua, ub, ya, yb, depth = 0.05) => {
      bag.add('glass_outer', Rm(ua, ub, ya, yb, -0.02, depth));
      bag.add(STONE, Rm(ua - 0.16, ub + 0.16, yb, yb + 0.24, 0, 0.14));                  // the lintel
      bag.add(STONE, Rm(ua - 0.12, ub + 0.12, ya - 0.1, ya, 0, 0.2));                    // the sill
      bag.add('paint_white', Rm((ua + ub) / 2 - 0.02, (ua + ub) / 2 + 0.02, ya, yb, depth - 0.01, depth + 0.02));   // the mullion
      bag.add('paint_white', Rm(ua, ub, (ya + yb) / 2 - 0.02, (ya + yb) / 2 + 0.02, depth - 0.01, depth + 0.02));    // the transom
    };
    const uA = dU + dW + 0.55;                                                                          // the parlor's windows right of the door
    for (let k = 0; k < 2; k++) { const ua = uA + k * 1.5; if (ua + 1.0 < W - 0.3) win(ua, ua + 1.0, dY + 0.45, dY + 2.55); }
    for (let f = 1; f < nf; f++) {
      const ya = y + B + f * 3.4 + 0.35, yb = ya + (f === 1 ? 2.35 : 2.05);
      for (let k = 0; k < 3; k++) { const ua = 0.5 + k * ((W - 1.0 - 1.0) / 2); win(ua, ua + 1.0, ya, yb); }
    }
    { const ua = sU0 + run + 0.15; if (ua + 0.9 < W - 0.25) { bag.add('opening', Rm(ua, ua + 0.9, y + 0.2, y + 1.3, 0, 0.05)); for (let g = 0; g < 4; g++) bag.add('iron', Rm(ua + 0.1 + g * 0.23 - 0.012, ua + 0.1 + g * 0.23 + 0.012, y + 0.2, y + 1.3, 0.05, 0.09)); bag.add(STONE, Rm(ua - 0.1, ua + 1.0, y + 1.3, y + 1.45, 0, 0.12)); } }
    // the cornice: a stone frieze, the bracketed projecting cornice, the parapet's coping; pressed-metal in fact, here stone
    bag.add(STONE, R(c0 - 0.02, c1 + 0.02, y + H - 0.8, y + H - 0.25, 0, 0.12));
    bag.add(STONE, R(c0 - 0.02, c1 + 0.02, y + H - 0.25, y + H + 0.12, 0, 0.62));
    for (let u = c0 + 0.3; u < c1 - 0.2; u += 0.55) bag.add(STONE, R(u, u + 0.16, y + H - 0.8, y + H - 0.25, 0.1, 0.5));
    bag.add(STONE, R(c0 - 0.02, c1 + 0.02, y + H + 0.12, y + H + 0.5, 0.2, 0.55));
    // the areaway's railing along the pavement: iron pickets between a top and a base rail, stone posts; open where the stoop comes down
    const fd = 1.05, lo = Math.min(left(dU - 0.05), left(sU0 + run + 0.05)), hi = Math.max(left(dU - 0.05), left(sU0 + run + 0.05));
    for (let u = c0 + 0.1; u < c1 - 0.05; u += 0.16) if (u < lo - 0.05 || u > hi + 0.05) bag.add('iron', R(u - 0.012, u + 0.012, y, y + 0.95, fd - 0.012, fd + 0.012));
    for (const [a0, a1] of [[c0, lo - 0.05], [hi + 0.05, c1]]) if (a1 - a0 > 0.2) { bag.add('iron', R(a0, a1, y + 0.88, y + 0.94, fd - 0.025, fd + 0.025)); bag.add('iron', R(a0, a1, y + 0.1, y + 0.15, fd - 0.02, fd + 0.02)); col.rect(F.rc(a0, a1, fd - 0.04, fd + 0.04), y, y + 1.0); }
    bag.add(STONE, R(c0, c0 + 0.14, y, y + 1.05, fd - 0.07, fd + 0.07));
    bag.add('tar_wood', R(c0, c1, y + H, y + H + 0.04, -ext * 0.9, -0.1));
  }
}

/**
 * castIronFront: { rect, y, front, h (storeys' top), seed } — a loft front of painted cast iron over the shop fronts: from the
 * second floor up, slender columns at each bay, an entablature at each floor, plate glass between, a bracketed cornice.
 */
export function castIronFront(bag, rect, front, y, h, rand) {
  const F = face(rect, front), { R, L } = F, bay = 2.2, n = Math.max(2, Math.round(L / bay)), W = L / n;
  const y0 = y + 4.4, floors = Math.max(2, Math.floor((h - 4.4 - 1.2) / 3.4)), SH = (h - 4.4 - 1.2) / floors;
  const m = ['paint_white', 'stucco_cream', 'shutter_green', 'stucco_pale'][Math.floor(rand() * 4)];
  for (let f = 0; f < floors; f++) {
    const ya = y0 + f * SH, yb = ya + SH;
    bag.add('glass_outer', R(0.15, L - 0.15, ya + 0.5, yb, 0.14, 0.2));                             // the plate glass of the floor
    bag.add(m, R(0, L, ya, ya + 0.5, 0, 0.3));                                                             // the spandrel and entablature
    bag.add(m, R(0, L, ya + 0.5, ya + 0.62, 0, 0.36));                                                     // its moulding
    for (let i = 0; i <= n; i++) {
      const u = i * W; bag.add(m, R(Math.max(0, u - 0.17), Math.min(L, u + 0.17), ya + 0.5, yb, 0.0, 0.32));  // the column (square-sectioned, fluted by a slot)
      if (i < n) bag.add('iron', R(u + W / 2 - 0.015, u + W / 2 + 0.015, ya + 0.5, yb, 0.19, 0.23)); // (the glass's mullion)
    }
    for (let i = 0; i <= n; i++) { const u = i * W; bag.add(m, R(Math.max(0, u - 0.24), Math.min(L, u + 0.24), ya + 0.5, ya + 0.72, 0, 0.42)); bag.add(m, R(Math.max(0, u - 0.24), Math.min(L, u + 0.24), yb - 0.58, yb - 0.45, 0, 0.42)); }   // the capitals and bases
  }
  const top = y + h;
  bag.add(m, R(0, L, top - 1.2, top - 0.5, 0, 0.3));
  bag.add(m, R(-0.05, L + 0.05, top - 0.5, top - 0.1, 0, 0.9));
  for (let i = 0; i < n; i++) for (const s of [0.25, 0.75]) bag.add(m, R(i * W + W * s - 0.1, i * W + W * s + 0.1, top - 1.2, top - 0.5, 0.3, 0.8));   // its brackets
  bag.add(m, R(-0.05, L + 0.05, top - 0.1, top + 0.55, 0.45, 0.9));
  // the pilasters at the party walls, a date and name panel between the cornice's brackets
  bag.add(m, R(L * 0.3, L * 0.7, top - 1.2, top - 0.5, 0.3, 0.42));
}

/** A brick chimney stack with its capped flue pots: at [x, z] on a roof at height y. */
export function chimney(bag, x, y, z, rand, hh) {
  const w = 0.8 + rand() * 0.3, h = (hh ?? 2.2 + rand() * 1.2) - 0.1 - 0.4;
  bag.add('brick', box(x - w / 2, y, z - w / 2, x + w / 2, y + h, z + w / 2));
  bag.add(STONE, box(x - w / 2 - 0.08, y + h, z - w / 2 - 0.08, x + w / 2 + 0.08, y + h + 0.1, z + w / 2 + 0.08));
  for (const dx of [-0.2, 0.2]) bag.add('terracotta', lathe([[0.001, 0], [0.12, 0], [0.14, 0.4], [0.17, 0.46], [0.11, 0.48], [0.001, 0.48]], 8, null, x + dx * w, y + h + 0.1, z));
}
/** A roof bulkhead (the stairhead) and its door, on a roof: a small brick box. */
export function bulkhead(bag, x, y, z, rand) {
  const w = 1.6 + rand() * 0.6, d = 2.0;
  bag.add('brick', box(x - w / 2, y, z - d / 2, x + w / 2, y + 2.4, z + d / 2));
  bag.add('tar_wood', box(x - w / 2 - 0.1, y + 2.4, z - d / 2 - 0.1, x + w / 2 + 0.1, y + 2.5, z + d / 2 + 0.1));
  bag.add('opening', box(x - 0.45, y, z + d / 2, x + 0.45, y + 2.0, z + d / 2 + 0.03));
}

/**
 * subway_entrance: { at: [x, z], y, rot (the stair's mouth toward +z, turned), seed } — a stair-head of the subway on the
 * pavement: the stair's dark opening ringed by cast-iron railing with newel posts, two green-globed lamp standards at the
 * mouth, and the blue enamel sign over the head. (The stair itself goes down below the pavement and is not modelled.)
 */
export function subwayEntrance(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, parts = [];
  const B = (m, x0, y0, z0, x1, y1, z1) => parts.push([m, box(x0, y0, z0, x1, y1, z1)]);
  const hw = 0.75, hl = 2.1;                                    // half-width, half-length (the mouth at +z)
  B('granite_grey', -hw - 0.12, 0.0, -hl - 0.1, hw + 0.12, 0.05, hl + 0.12);                                                      // the curb of the opening, under the rails
  B('opening', -hw + 0.05, 0.05, -hl + 0.05, hw - 0.05, 0.056, hl - 0.05);                                                         // the stair's dark opening
  for (let i = 0; i < 6; i++) B('steel_grey', -hw + 0.08, 0.056, -hl + 0.3 + i * 0.55, hw - 0.08, 0.064, -hl + 0.38 + i * 0.55);   // the treads' nosings
  // the railing: pickets between a top rail and a base rail along the sides and the far end, newels at the corners and the mouth
  const post = (px, pz) => { B('iron', px - 0.05, 0.05, pz - 0.05, px + 0.05, 1.12, pz + 0.05); parts.push(['gilt_bronze', lathe([[0.001, 0], [0.06, 0.02], [0.04, 0.08], [0.001, 0.12]], 6, null, px, 1.12, pz)]); };
  const run = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), nx = Math.max(1, Math.round(L / 0.16));
    B('iron', Math.min(x0, x1) - 0.02, 1.02, Math.min(z0, z1) - 0.02, Math.max(x0, x1) + 0.02, 1.07, Math.max(z0, z1) + 0.02);
    B('iron', Math.min(x0, x1) - 0.02, 0.18, Math.min(z0, z1) - 0.02, Math.max(x0, x1) + 0.02, 0.22, Math.max(z0, z1) + 0.02);
    for (let k = 1; k < nx; k++) { const px = x0 + (x1 - x0) * k / nx, pz = z0 + (z1 - z0) * k / nx; B('iron', px - 0.012, 0.05, pz - 0.012, px + 0.012, 1.02, pz + 0.012); }
  };
  run(-hw, -hl, hw, -hl); run(-hw, -hl, -hw, hl); run(hw, -hl, hw, hl);
  for (const [px, pz] of [[-hw, -hl], [hw, -hl], [-hw, hl], [hw, hl]]) post(px, pz);
  // the lamp standards at the mouth: a fluted iron shaft, a bracket, and the globe (green glass: the subway's mark)
  for (const s of [-1, 1]) {
    const px = s * (hw + 0.12), pz = hl + 0.1;
    parts.push(['iron', lathe([[0.1, 0], [0.1, 0.2], [0.06, 0.3], [0.05, 2.6], [0.07, 2.7], [0.001, 2.75]], 8, null, px, 0.05, pz)]);
    parts.push(['lamp_glass', lathe([[0.001, 0], [0.14, 0.05], [0.2, 0.2], [0.18, 0.38], [0.1, 0.48], [0.001, 0.5]], 10, null, px, 2.75, pz)]);
    parts.push(['glaze_green', lathe([[0.001, 0.5], [0.13, 0.5], [0.1, 0.57], [0.001, 0.62]], 10, null, px, 2.75, pz)]);
  }
  // the sign over the head: a blue enamel board with a white band, on two iron posts at the far end (no lettering at this scale)
  B('iron', -hw + 0.05, 0.07, -hl - 0.06, -hw + 0.12, 2.5, -hl + 0.02); B('iron', hw - 0.12, 0.07, -hl - 0.06, hw - 0.05, 2.5, -hl + 0.02);
  B('paint_blue', -hw - 0.1, 2.5, -hl - 0.08, hw + 0.1, 3.05, -hl); B('paint_white', -hw + 0.05, 2.62, -hl - 0.085, hw - 0.05, 2.78, -hl - 0.075);
  for (let k = 0; k < 6; k++) B('paint_blue', -hw + 0.12 + k * 0.23, 2.64, -hl - 0.09, -hw + 0.2 + k * 0.23, 2.76, -hl - 0.08);
  for (const [m, g] of parts) { g.rotateY(rot); g.translate(x, y, z); bag.add(m, g); }
  const c = Math.cos(rot), s = Math.sin(rot);
  // the railing blocks the way: its three sides, in the turned frame
  for (const [lx, lz, w, d] of [[0, -hl, hw, 0.06], [-hw, 0, 0.06, hl], [hw, 0, 0.06, hl]]) {
    const cx = x + lx * c + lz * s, cz = z - lx * s + lz * c, ex = Math.abs(w * c) + Math.abs(d * s), ez = Math.abs(w * s) + Math.abs(d * c);
    col.rect([cx - ex, cz - ez, cx + ex, cz + ez], y, y + 1.1);
  }
}
