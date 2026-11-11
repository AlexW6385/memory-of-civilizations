// The Treasury of Atreus (docs/settlements/mycenae.md §4.5): the dromos between conglomerate walls rising to the façade, the doorway with its lintel,
// the green half-columns and the relieving triangle, the tholos of 33 corbelled courses, the side chamber. And Grave Circle A (§4.3).

import { box, lathe, disc, frustum, fromTriangles, place } from '../../core/geom.js';
import { rng, mergeG, courses } from './util.js';
import { wallRun } from './wall.js';

const STONE = 'limestone_yellow';

/** An inward- or downward-facing triangle fan helper for the dome: triangles pushed so that each normal agrees with `want(nx, ny, nz, px, py, pz)`. */
function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const p = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
  if (want(n, p) < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}

/** The dome's inside: a beehive of 33 corbelled courses, each leaning a little and stepping in over the one below; sectors left open for the two doors. */
function dome(el) {
  const { x, z, y, R, H } = el, N = 40, K = 33, hc = H / K, out = [];
  const rad = (t) => R * Math.pow(Math.max(0, 1 - Math.pow(t / H, 1.9)), 0.52);       // the beehive's profile
  const skip = (k, a) => {
    const yh = (k + 1) * hc, d1 = Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))), d2 = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)));
    return (d1 < 0.19 && yh <= 5.8) || (d2 < 0.17 && yh <= 2.5);
  };
  const inward = (n, p) => -(n[0] * (p[0] - x) + n[2] * (p[2] - z)) * 1 + 0;
  const down = (n) => -n[1];
  for (let k = 0; k < K; k++) {
    const y0 = k * hc, y1 = (k + 1) * hc, rb = rad(y0), rt = rad(y1) + 0.04, rl = rad(y1 + 0.0001);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      if (skip(k, (a0 + a1) / 2)) continue;
      const P = (r, a, yy) => [x + Math.cos(a) * r, y + yy, z + Math.sin(a) * r];
      tri(out, P(rb, a0, y0), P(rb, a1, y0), P(rt, a1, y1), inward); tri(out, P(rb, a0, y0), P(rt, a1, y1), P(rt, a0, y1), inward);
      // the ledge: the next course steps in over this one's top
      const rn = k + 1 < K ? rad(y1) : 0.001;
      if (rt - rn > 0.001) { tri(out, P(rt, a0, y1), P(rt, a1, y1), P(rn, a1, y1), down); tri(out, P(rt, a0, y1), P(rn, a1, y1), P(rn, a0, y1), down); }
    }
    void rl;
  }
  return fromTriangles(out);
}

/** A zigzag shaft for the half-columns of the façade: green stone, chevrons, tapering downward. */
function zigzagColumn(x, y, z, h, r) {
  const prof = [[r * 0.8, 0], [r * 0.95, 0.12]];
  const rows = Math.round(h / 0.22);
  for (let i = 0; i <= rows; i++) { const t = i / rows, rr = r * (0.8 + 0.2 * t); prof.push([rr * (i % 2 ? 1.07 : 0.96), 0.12 + (h - 0.4) * t]); }
  prof.push([r * 1.25, h - 0.28], [r * 1.35, h - 0.1], [r * 1.2, h], [0.001, h]);
  return lathe(prof, 14, null, x, y, z);
}

/**
 * treasury: { x, z, y, R, H, xf, x0, front, dromos, seed } — the whole tomb. The dromos runs west from the façade at x = xf; the tholos centre (x, z), the floor y.
 */
export function treasury(el, ctx) {
  const { bag, col, lights } = ctx, { x: Tx, z: Tz, y, R, H, xf, x0, front } = el, rand = rng(el.seed ?? 11);
  const dromosTh = (x) => 2 + (x - x0) / el.dromos;
  const top = (x) => y + 0.5 + (front - 0.5) * Math.max(0, Math.min(1, (x - x0) / el.dromos));
  // the dromos: the floor, the walls in dressed conglomerate rising toward the façade
  bag.add('flagstone', box(x0, y - 0.4, Tz - 3, xf + 5.4, y, Tz + 3)); col.floor([x0, Tz - 3, xf + 5.4, Tz + 3], y);
  for (const s of [-1, 1]) for (let x = x0; x < xf - 0.01; x += 4) {
    const xe = Math.min(xf, x + 4), xm = (x + xe) / 2, t = dromosTh(xm), zc = Tz + s * (3 + t / 2);
    wallRun({ a: s < 0 ? [x, zc] : [xe, zc], b: s < 0 ? [xe, zc] : [x, zc], th: t, y0: y - 0.5, y1: top(xe), yi: y, ashlar: true, seed: Math.floor(x * 7 + s), ext: 0.02 }, ctx);
  }
  // the façade: face courses round the doorway and the triangle, a core behind, the lintels
  const hw = 1.4, zE = 6, doorTop = y + el.door, lintelTop = doorTop + 1.2, triH = 3.2, yTop = y + front;
  const dressed = [], core = [];
  for (const s of [-1, 1]) {
    const inner = (ya) => (ya < lintelTop - 0.01 ? hw : Math.max(0, 1.7 * (1 - (ya - lintelTop) / triH)));
    for (const r of courses(rand, 0, zE, y - 0.5, yTop, { h: [0.55, 0.8], w: [1.2, 2.2], taper: 0, cut: (ya) => [inner(ya), zE] })) {
      const [ua, ya, ub, yb] = r, rect = s > 0 ? [xf, Tz + ua + 0.02, xf + 0.9, Tz + ub - 0.02] : [xf, Tz - ub + 0.02, xf + 0.9, Tz - ua - 0.02];
      dressed.push(frustum(rect, ya + 0.02, yb - 0.02, 0, 0, 0, 0, { noBottom: true, noTop: yb < yTop - 0.01, noXp: true }));
    }
    core.push(box(xf + 0.9, y - 0.5, s > 0 ? Tz + hw : Tz - zE, xf + 5.4, yTop - 0.2, s > 0 ? Tz + zE : Tz - hw));
    col.rect(s > 0 ? [xf, Tz + hw, xf + 5.4, Tz + zE] : [xf, Tz - zE, xf + 5.4, Tz - hw], y - 0.5, yTop);
  }
  core.push(box(xf + 0.9, lintelTop, Tz - hw, xf + 5.4, yTop - 0.2, Tz + hw)); col.rect([xf, Tz - hw, xf + 5.4, Tz + hw], doorTop, yTop);
  // the lintels: the outer, and the great inner block (8 × 5 × 1.2 m) over the passage's end
  dressed.push(box(xf, doorTop, Tz - 3.4, xf + 2.4, lintelTop, Tz + 3.4), box(xf + 2.4, doorTop, Tz - 4, xf + 5.4, lintelTop, Tz + 4));
  bag.add(STONE, mergeG(dressed)); bag.add('rubble', mergeG(core));
  // the relieving triangle closed by a slab of red stone with spirals, the rosette frieze above the lintel, the green half-columns
  const tx = xf + 0.1, tz0 = Tz - 1.7, tz1 = Tz + 1.7, ty = lintelTop;
  bag.add('breccia_red', fromTriangles([tx, ty, tz0, tx, ty, tz1, tx, ty + triH, Tz].map((v, i) => v)).clone());
  const rosettes = [];
  for (let u = -1.3; u <= 1.31; u += 0.4) rosettes.push(lathe([[0.11, 0], [0.11, 0.03], [0.04, 0.05], [0.001, 0.06]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(xf - 0.02, doorTop + 0.6, Tz + u));
  bag.add('breccia_red', mergeG(rosettes));
  for (const s of [-1, 1]) {
    bag.add('serpentine', zigzagColumn(xf - 0.12, y, Tz + s * (hw + 0.62), el.door - 0.35, 0.5)); col.circle(xf - 0.12, Tz + s * (hw + 0.62), 0.5, y, y + el.door);
    bag.add('serpentine', zigzagColumn(xf - 0.1, lintelTop, Tz + s * 2.2, 2.9, 0.26));
  }
  // the passage: walls and the roof slabs, the floor already laid
  for (const s of [-1, 1]) { bag.add(STONE, box(xf + 0.9, y, s > 0 ? Tz + hw - 0.0 : Tz - hw - 0.3, xf + 5.4 + 0.3, doorTop, s > 0 ? Tz + hw + 0.3 : Tz - hw)); }
  // ── the tholos ──
  bag.add(STONE, dome(el));
  bag.add('flagstone', frustum([Tx - R - 0.3, Tz - R - 0.3, Tx + R + 0.3, Tz + R + 0.3], y - 0.4, y, 0, 0, 0, 0, { noBottom: true })); col.floor([Tx - R, Tz - R, Tx + R, Tz + R], y);
  bag.add(STONE, disc(0.5, y + H, 10, Tx, Tz, false));
  // the wall as the walker meets it: a ring of chords of the dome's foot, left open at the two doors
  const NS = 32;
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * Math.PI * 2, a1 = ((i + 1) / NS) * Math.PI * 2, am = (a0 + a1) / 2;
    const d1 = Math.abs(Math.atan2(Math.sin(am - Math.PI), Math.cos(am - Math.PI))), d2 = Math.abs(Math.atan2(Math.sin(am + Math.PI / 2), Math.cos(am + Math.PI / 2)));
    if (d1 < 0.3 || d2 < 0.27) continue;
    const r = R + 0.6;
    col.segment([Tx + Math.cos(a0) * r, Tz + Math.sin(a0) * r], [Tx + Math.cos(a1) * r, Tz + Math.sin(a1) * r], 1.4, y, y + H);
  }
  // the side chamber: through a doorway 2.5 m high in the north of the tholos, a room 6 m square
  const cz1 = Tz - R - 3, cz0 = cz1 - 6, cx0 = Tx - 3, cx1 = Tx + 3, ch = 4.2, w = 0.8;
  bag.add('flagstone', box(cx0, y - 0.4, cz0, cx1, y, cz1 + 3)); col.floor([cx0, cz0, cx1, cz1 + 3.2], y);
  for (const [r] of [[[cx0 - w, cz0 - w, cx1 + w, cz0]], [[cx0 - w, cz0, cx0, cz1]], [[cx1, cz0, cx1 + w, cz1]]].map((q) => q)) { bag.add(STONE, box(r[0], y, r[1], r[2], y + ch, r[3])); col.rect(r, y, y + ch); }
  for (const s of [-1, 1]) {
    const r = s < 0 ? [cx0 - w, cz1, Tx - 1.25, cz1 + 0.8] : [Tx + 1.25, cz1, cx1 + w, cz1 + 0.8];
    bag.add(STONE, box(r[0], y, r[1], r[2], y + ch, r[3])); col.rect(r, y, y + ch);
    const p = s < 0 ? [Tx - 1.25 - 0.8, cz1 + 0.8, Tx - 1.25, cz1 + 3.2] : [Tx + 1.25, cz1 + 0.8, Tx + 1.25 + 0.8, cz1 + 3.2];
    bag.add(STONE, box(p[0], y, p[1], p[2], y + 2.7, p[3])); col.rect(p, y, y + 2.7);
  }
  bag.add(STONE, box(cx0 - w, y + ch, cz0 - w, cx1 + w, y + ch + 0.6, cz1 + 0.8));
  bag.add(STONE, box(Tx - 1.3, y + 2.5, cz1 + 0.8, Tx + 1.3, y + 3.1, cz1 + 3.2)); col.rect([Tx - 1.3, cz1 + 0.8, Tx + 1.3, cz1 + 3.2], y + 2.5, y + 3.1);
  bag.add(STONE, box(Tx - 1.3, y + 3.1, cz1 - 0.1, Tx + 1.3, y + ch, cz1 + 0.9));
  col.rect([Tx - 1.3, cz1 - 0.1, Tx + 1.3, cz1 + 0.9], y + 3.1, y + ch);
  // a bench of stone in the chamber, and the lamps
  bag.add(STONE, box(cx0 + 0.3, y, cz0 + 0.3, cx1 - 0.3, y + 0.35, cz0 + 1.1)); col.rect([cx0 + 0.3, cz0 + 0.3, cx1 - 0.3, cz0 + 1.1], y, y + 0.35);
  lights.push({ at: [Tx - R + 1.5, y + 2.6, Tz], color: '#ffb46b', intensity: 6, distance: 14 }, { at: [Tx + 1.5, y + 1.6, Tz + 1.5], color: '#ffb46b', intensity: 4, distance: 12 }, { at: [Tx, y + 1.8, cz0 + 2.5], color: '#ffb46b', intensity: 3, distance: 8 });
  lights.push({ at: [xf + 2.7, y + 3.2, Tz], color: '#ffb46b', intensity: 3, distance: 8 });
}

/** grave_circle: { c: [x, z], r, y, entrance (the angle left open), seed } — the peribolos of two rings of upright slabs capped with flat ones, the paved temenos, six shaft graves with their stelae, the altar over one. */
export function graveCircle(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y, rand = rng(el.seed ?? 9), N = 44, up = [], cap = [];
  bag.add('limestone_yellow', disc(r + 0.2, y + 0.03, 40, cx, cz, true));
  col.floor([cx - r, cz - r, cx + r, cz + r], y + 0.03);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, d = Math.abs(Math.atan2(Math.sin(a - el.entrance), Math.cos(a - el.entrance)));
    if (d < 0.14) continue;
    const w = (Math.PI * 2 * r) / N * 0.92, hgt = 1.15 + rand() * 0.2;
    for (const [rr, t] of [[r + 0.25, 0.3], [r - 0.35, 0.3]]) up.push(place(box(-w / 2, 0, -t / 2, w / 2, hgt, t / 2), cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr, -a + Math.PI / 2));
    cap.push(place(box(-w / 2, 0, -0.55, w / 2, 0.22, 0.55), cx + Math.cos(a) * (r - 0.05), y + 1.28, cz + Math.sin(a) * (r - 0.05), -a + Math.PI / 2));
    const a1 = ((i + 1) / N) * Math.PI * 2;
    col.segment([cx + Math.cos(a) * (r - 0.05), cz + Math.sin(a) * (r - 0.05)], [cx + Math.cos(a1) * (r - 0.05), cz + Math.sin(a1) * (r - 0.05)], 1.1, y, y + 1.5);
  }
  bag.add('limestone_yellow', mergeG(up)); bag.add('limestone_yellow', mergeG(cap));
  // six shaft graves: low covers of stones, each with its stele upright at the head (the chariot reliefs on three of them)
  const G = [[-5.2, -3.4, 0.2], [0.3, -6.4, 0.5], [5.0, -1.8, 1.4], [-2.2, 2.6, 0.1], [3.6, 5.6, 0.8], [-6.0, 4.6, 1.2]];
  const mounds = [], stelae = [], relief = [];
  G.forEach(([gx, gz, ang], i) => {
    const x = cx + gx, z = cz + gz;
    mounds.push(place(box(-1.5, 0, -1.1, 1.5, 0.28, 1.1), x, y + 0.03, z, ang));
    const sx = x + Math.cos(ang) * -1.9, sz = z - Math.sin(ang) * -1.9;
    stelae.push(place(box(-0.4, 0, -0.1, 0.4, 1.3 + rand() * 0.6, 0.1), sx, y, sz, ang + Math.PI / 2));
    col.circle(sx, sz, 0.5, y, y + 1.8);
    if (i < 3) relief.push(place(box(-0.3, 0.45, -0.115, 0.3, 0.75, 0.0), sx, y, sz, ang + Math.PI / 2));
  });
  bag.add('rubble', mergeG(mounds)); bag.add('sandstone_relief', mergeG(stelae)); bag.add('sandstone_dressed', mergeG(relief));
  // the altar over the middle grave: a low round structure
  bag.add('limestone_yellow', lathe([[0.9, 0], [0.8, 0.5], [0.001, 0.5]], 14, null, cx + G[3][0], y + 0.03, cz + G[3][1])); col.circle(cx + G[3][0], cz + G[3][1], 0.9, y, y + 0.5);
}
