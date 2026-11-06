// Swahili coral-stone architecture (14th–15th c.; docs/settlements/kilwa.md §4): walls of coral rag
// in lime mortar, plastered white; flat roofs on mangrove poles; the Great Mosque's prayer hall of
// bays on pillars, roofed with small domes and vaults, its great dome; the palace of Husuni Kubwa's
// courts and octagonal pool on the cliff; stone houses round courts; dhows on the shore.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, frustum, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';
import { pointedSpandrel, orientBy } from '../sahel/index.js';

const C = 'coral_plaster', R = 'rubble';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The points where rays from the centre at the given angles meet the rectangle (half sizes hx, hz). */
function rectRay(th, hx, hz) { const c = Math.cos(th), s = Math.sin(th), t = Math.min(hx / Math.max(1e-9, Math.abs(c)), hz / Math.max(1e-9, Math.abs(s))); return [c * t, s * t]; }
function bayAngles(hx, hz, N = 24) {
  const a = Array.from({ length: N }, (_, k) => (k / N) * Math.PI * 2);
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) a.push((Math.atan2(sz * hz, sx * hx) + Math.PI * 2) % (Math.PI * 2));
  return a.sort((p, q) => p - q);
}
/** Push the quad (or triangle when d is omitted) a b c d turned to face along w. */
function face(out, w, a, b, c, d) { const t = d ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...b, ...c]; out.push(...orientBy(t, () => w)); }
/**
 * A domed bay over the rectangle r: inside, pendentives from the rectangle (at yT) to the dome's
 * ring (yT + pd), a drum of height `drum`, the dome a little pointed; outside, the flat roof (yTop)
 * round the dome, the drum and the outer dome.
 */
function domeBay(out, r, yT, pd, yTop, drum = 0) {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, hx = (r[2] - r[0]) / 2, hz = (r[3] - r[1]) / 2, ri = Math.min(hx, hz) - 0.05, ro = ri + 0.22, A = bayAngles(hx, hz), M = 7;
  const C = (rr, th, yy) => [cx + Math.cos(th) * rr, yy, cz + Math.sin(th) * rr];
  const yR = yT + pd, yD = yR + drum, yO = yTop + drum, rise = 0.82;
  for (let j = 0; j < A.length; j++) {
    const a0 = A[j], a1 = j === A.length - 1 ? A[0] + Math.PI * 2 : A[j + 1], am = (a0 + a1) / 2, rad = [Math.cos(am), 0, Math.sin(am)];
    const [p0x, p0z] = rectRay(a0, hx, hz), [p1x, p1z] = rectRay(a1, hx, hz);
    face(out, [-rad[0], -0.6, -rad[2]], [cx + p0x, yT, cz + p0z], [cx + p1x, yT, cz + p1z], C(ri, a1, yR), C(ri, a0, yR));     // pendentive
    face(out, [0, 1, 0], [cx + p0x, yTop, cz + p0z], [cx + p1x, yTop, cz + p1z], C(ro, a1, yTop), C(ro, a0, yTop));             // the roof round it
    if (drum) { face(out, rad.map((v) => -v), C(ri, a0, yR), C(ri, a1, yR), C(ri, a1, yD), C(ri, a0, yD)); face(out, rad, C(ro, a0, yTop), C(ro, a1, yTop), C(ro, a1, yO), C(ro, a0, yO)); }
    for (let m = 0; m < M; m++) {
      const f0 = (m / M) * Math.PI / 2, f1 = ((m + 1) / M) * Math.PI / 2, fm = (f0 + f1) / 2, n = [Math.cos(fm) * rad[0], Math.sin(fm), Math.cos(fm) * rad[2]];
      for (const [rr, yb, sg] of [[ri, yD, -1], [ro, yO, 1]]) {
        const P = (f, th) => C(rr * Math.cos(f) + 0.001, th, yb + rr * rise * Math.sin(f));
        if (m === M - 1) face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a0));
        else face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a1), P(f1, a0));
      }
    }
  }
}
/** A bay roofed by a barrel vault running along z (open where the next bay is vaulted too, closed by a tympanum where not). */
function vaultBay(out, r, yT, pd, yTop, openN, openS) {
  const cx = (r[0] + r[2]) / 2, hx = (r[2] - r[0]) / 2, yR = yT + pd, N = 12, ri = hx, eo = yR + ri + 0.25 - yTop;
  const inner = (k) => { const f = Math.PI * k / N; return [cx + Math.cos(f) * ri, yR + Math.sin(f) * ri]; };
  const outer = (k) => { const f = Math.PI * k / N; return [cx + Math.cos(f) * hx, yTop + Math.sin(f) * eo]; };
  for (const sx of [-1, 1]) face(out, [-sx, 0, 0], [cx + sx * hx, yT, r[1]], [cx + sx * hx, yT, r[3]], [cx + sx * hx, yR, r[3]], [cx + sx * hx, yR, r[1]]);
  const ends = [[r[1], openN, -1], [r[3], openS, 1]];
  for (let k = 0; k < N; k++) {
    const [a, ay] = inner(k), [b, by] = inner(k + 1), [c, cy] = outer(k), [d, dy] = outer(k + 1), fm = Math.PI * (k + 0.5) / N;
    face(out, [-Math.cos(fm), -Math.sin(fm), 0], [a, ay, r[1]], [b, by, r[1]], [b, by, r[3]], [a, ay, r[3]]);
    face(out, [Math.cos(fm) * eo, Math.sin(fm) * hx, 0], [c, cy, r[1]], [d, dy, r[1]], [d, dy, r[3]], [c, cy, r[3]]);
    for (const [zz, open, sg] of ends) {
      if (open) continue;
      face(out, [0, 0, -sg], [cx, yT, zz], [a, ay, zz], [b, by, zz]);          // the tympanum, facing into the vault
      face(out, [0, 0, sg], [cx, yTop, zz], [c, cy, zz], [d, dy, zz]);         // the outer vault's end
    }
  }
  for (const [zz, open, sg] of ends) if (!open) for (const sx of [-1, 1]) face(out, [0, 0, -sg], [cx, yT, zz], [cx + sx * hx, yT, zz], [cx + sx * hx, yR, zz]);
}
/** swahili_mosque: { rect, y, bay, big (index of the bay carrying the great dome) } — a walled hall of bays on pillars, each bay roofed by a small dome. */
function mosque(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, b = el.bay ?? 4.5, yS = y + 3.4, yT = y + 6.1, PD = 0.5, yTop = yT + PD + 0.35, h = yTop - y - 0.6;
  for (const r of [[x0, z0, x1, z0 + 0.8], [x0, z1 - 0.8, x1, z1], [x0, z0, x0 + 0.8, z1], [x1 - 0.8, z0, x1, z1]]) { bag.add(C, box(r[0], y - 0.5, r[1], r[2], y + h + 0.6, r[3])); col.rect(r, y, y + h + 0.6); }
  // the walls' faces: doorways with their stepped stone frames along the sides, small windows above, buttresses at the corners and between
  for (const [a, b2, zz, alongX, sg] of [[x0, x1, z0, true, -1], [x0, x1, z1, true, 1], [z0, z1, x0, false, -1], [z0, z1, x1, false, 1]]) {
    const L = b2 - a, n = Math.floor(L / (b * 2));
    for (let i = 0; i < n; i++) {
      const u = a + (i + 0.5) * L / n, f = (m, u0, u1, v0, v1, d0, d1) => { const p0 = zz + sg * d0, p1 = zz + sg * d1; bag.add(m, alongX ? box(u + u0, y + v0, Math.min(p0, p1), u + u1, y + v1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + v0, u + u0, Math.max(p0, p1), y + v1, u + u1)); };
      if (i % 2 === 0) { f('limestone', -1.0, 1.0, 0, 3.0, -0.01, 0.12); f('opening', -0.7, 0.7, 0, 2.6, 0.11, 0.14); } else { f('limestone', -0.5, 0.5, 2.8, 4.0, -0.01, 0.1); f('opening', -0.35, 0.35, 3.0, 3.8, 0.09, 0.12); }
      f(C, L / n / 2 - 0.45, L / n / 2 + 0.45, -0.5, h + 0.6, -0.01, 0.55);
    }
  }
  // a stepped merlon cresting along the roof's edge
  for (let x = x0 + 0.6; x < x1 - 0.4; x += 1.4) for (const zz of [z0 + 0.1, z1 - 0.7]) bag.add(C, box(x, y + h + 0.6, zz, x + 0.7, y + h + 1.3, zz + 0.6));
  for (let z = z0 + 0.6; z < z1 - 0.4; z += 1.4) for (const xx of [x0 + 0.1, x1 - 0.7]) bag.add(C, box(xx, y + h + 0.6, z, xx + 0.6, y + h + 1.3, z + 0.7));
  // the hall's supports: coral columns, octagonal below and squared above, under capitals of one
  // block with concave brackets (docs/settlements/kilwa.md §4); pointed arches between them both ways
  const nx = Math.floor((x1 - x0) / b), nz = Math.floor((z1 - z0) / b), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  for (let i = 1; i < nx; i++) for (let k = 1; k < nz; k++) {
    const x = x0 + i * sx, z = z0 + k * sz;
    bag.add(R, lathe([[0.36, -0.05], [0.36, 0.25], [0.32, 0.3], [0.32, 1.6], [0.001, 1.6]], 8, null, x, y, z));
    bag.add(R, box(x - 0.26, y + 1.6, z - 0.26, x + 0.26, y + 3.0, z + 0.26));
    bag.add('limestone', frustum([x - 0.26, z - 0.26, x + 0.26, z + 0.26], y + 3.0, y + 3.16, -0.1, -0.1, -0.1, -0.1));
    bag.add('limestone', frustum([x - 0.36, z - 0.36, x + 0.36, z + 0.36], y + 3.16, y + 3.3, -0.1, -0.1, -0.1, -0.1));
    bag.add('limestone', box(x - 0.47, y + 3.3, z - 0.47, x + 0.47, y + 3.4, z + 0.47));
    bag.add(C, box(x - 0.35, y + 3.4, z - 0.35, x + 0.35, yT, z + 0.35));
    col.rect([x - 0.36, z - 0.36, x + 0.36, z + 0.36], y, yT);
  }
  const arches = [];
  for (let i = 1; i < nx; i++) { const x = x0 + i * sx; for (let k = 0; k < nz; k++) pointedSpandrel(arches, x, 0.3, k === 0 ? z0 + 0.8 : z0 + k * sz + 0.35, k === nz - 1 ? z1 - 0.8 : z0 + (k + 1) * sz - 0.35, yS, yT, false, 0.6); }
  for (let k = 1; k < nz; k++) { const z = z0 + k * sz; for (let i = 0; i < nx; i++) pointedSpandrel(arches, z, 0.3, i === 0 ? x0 + 0.8 : x0 + i * sx + 0.35, i === nx - 1 ? x1 - 0.8 : x0 + (i + 1) * sx - 0.35, yS, yT, true, 0.6); }
  bag.add(C, fromTriangles(arches));
  // the roof: over each bay a dome on pendentives, seen from below as from above; barrel vaults down
  // the central aisle; the great dome raised on its drum (Archnet: domes and vaults of lime-coral concrete)
  const mid = Math.floor(nx / 2), roof = [];
  const kindOf = (i, k) => (el.big && i === el.big[0] && k === el.big[1] ? 'great' : i === mid ? 'vault' : 'dome');
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const bx0 = i === 0 ? x0 + 0.8 : x0 + i * sx, bx1 = i === nx - 1 ? x1 - 0.8 : x0 + (i + 1) * sx;
    const bz0 = k === 0 ? z0 + 0.8 : z0 + k * sz, bz1 = k === nz - 1 ? z1 - 0.8 : z0 + (k + 1) * sz;
    const kind = kindOf(i, k);
    if (kind === 'vault') vaultBay(roof, [bx0, bz0, bx1, bz1], yT, PD, yTop, k > 0 && kindOf(i, k - 1) === 'vault', k < nz - 1 && kindOf(i, k + 1) === 'vault');
    else domeBay(roof, [bx0, bz0, bx1, bz1], yT, PD, yTop, kind === 'great' ? 1.4 : 0);
  }
  bag.add(C, fromTriangles(roof));
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  if (el.simple) return;
  // the mihrab in the middle of the qibla (north) wall: a stepped frame of dressed coral, the niche dark
  // within under its pointed head, a band of inset bowls over it; the minbar of three steps beside it
  const mx = (x0 + x1) / 2, qz = z0 + 0.8;
  for (let k = 0; k < 3; k++) bag.add('limestone', box(mx - 1.5 + k * 0.25, y, qz, mx + 1.5 - k * 0.25, y + 3.6 - k * 0.2, qz + 0.35 - k * 0.1));
  bag.add('opening', box(mx - 0.75, y + 0.05, qz + 0.36, mx + 0.75, y + 2.2, qz + 0.4));
  for (let k = 0; k < 5; k++) { const t0 = k / 5, w = 0.75 * (1 - t0 * 0.9); bag.add('opening', box(mx - w, y + 2.2 + k * 0.16, qz + 0.36, mx + w, y + 2.36 + k * 0.16, qz + 0.4)); }
  for (let k = -3; k <= 3; k++) { const g = lathe([[0.001, 0], [0.16, 0.01], [0.16, 0.05], [0.001, 0.05]], 10); g.rotateX(Math.PI / 2); g.translate(mx + k * 0.42, y + 3.85, qz + 0.36); bag.add('glaze_blue', g); }
  for (let k = 0; k < 3; k++) bag.add('wood_dark', box(mx + 2.0, y, qz + 0.4 + k * 0.5, mx + 2.8, y + 0.4 + k * 0.4, qz + 0.9 + k * 0.5));
  bag.add('wood_dark', box(mx + 2.0, y, qz + 0.4, mx + 2.8, y + 1.9, qz + 0.7));
  for (const sx of [2.0, 2.72]) bag.add('wood_dark', box(mx + sx, y + 0.4, qz + 0.7, mx + sx + 0.08, y + 1.6, qz + 1.9));
  // reed mats in rows facing the qibla, and lamps hanging in the bays on chains
  for (let z = qz + 2.2; z < z1 - 2; z += 1.6) for (let x = x0 + 1.6; x < x1 - 2.4; x += 2.6) bag.add('reed_mat', box(x, y + 0.05, z, x + 2.3, y + 0.075, z + 1.25));
  for (let i = 0; i < nx; i += 2) for (let k = 0; k < nz; k += 2) {
    const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (k + 0.5) * (z1 - z0) / nz;
    const crown = (i === mid ? yT + PD + sx / 2 - 0.05 : yT + PD + 0.82 * (Math.min(sx, sz) / 2 - 0.05)) - 0.05;
    bag.add('iron', box(x - 0.01, y + 2.9, z - 0.01, x + 0.01, crown, z + 0.01));
    bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.16, 0.2], [0.1, 0.32], [0.001, 0.34]], 8, null, x, y + 2.6, z));
  }
}
/** swahili_house: { rect, seed, y } — rooms of coral stone round a sunken court, flat roofs, a carved door. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.6 + (rand() < 0.3 ? 3 : 0), d = Math.min(4, (z1 - z0) * 0.4);
  for (const [r, hh] of [[[x0, z0, x1, z0 + d], h], [[x0, z0 + d, x0 + d * 0.8, z1], 3.6], [[x1 - d * 0.8, z0 + d, x1, z1], 3.6], [[x0 + d * 0.8, z1 - 0.6, x1 - d * 0.8, z1], 2.4]]) {
    bag.add(rand() < 0.2 ? R : C, box(r[0], y - 0.5, r[1], r[2], y + hh, r[3])); col.rect(r, y - 0.5, y + hh); col.floor(r, y + hh);
    if (!el.simple) bag.add('timber', box(r[0] - 0.12, y + hh - 0.35, r[1] - 0.12, r[2] + 0.12, y + hh - 0.25, r[3] + 0.12));
  }
  if (el.simple) return;
  // the street front (north): the carved door in its stone frame, small barred windows high up, mangrove pole ends under the roof
  const mx = (x0 + x1) / 2;
  bag.add('limestone', box(mx - 0.85, y, z0 - 0.1, mx + 0.85, y + 2.7, z0 + 0.02));
  bag.add('wood_dark', box(mx - 0.6, y, z0 - 0.14, mx + 0.6, y + 2.3, z0 - 0.08));
  for (let k = 0; k < 4; k++) bag.add('timber', box(mx - 0.55, y + 0.3 + k * 0.5, z0 - 0.18, mx + 0.55, y + 0.36 + k * 0.5, z0 - 0.13));   // the door's carved bands
  for (let x = x0 + 1.2; x < x1 - 1; x += 2.6) if (Math.abs(x - mx) > 1.3) { bag.add('opening', box(x - 0.3, y + 2.4, z0 - 0.04, x + 0.3, y + 3.1, z0 + 0.01)); for (const t of [-0.15, 0, 0.15]) bag.add('wood_dark', box(x + t - 0.02, y + 2.4, z0 - 0.07, x + t + 0.02, y + 3.1, z0 - 0.03)); }
  for (let x = x0 + 0.3; x < x1; x += 0.7) bag.add('timber', box(x - 0.06, y + h - 0.5, z0 - 0.22, x + 0.06, y + h - 0.38, z0 + 0.02));
  bag.add(C, box(x0 - 0.05, y + h - 0.02, z0 - 0.05, x1 + 0.05, y + h + 0.45, z0 + 0.35));
}
/** husuni: the palace { rect, y, pool (octagon centre and radius) } — courts ringed by rooms, the octagonal bathing pool. */
function husuni(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, mid = (x0 + x1) / 2;
  for (const r of [[x0, z0, mid - 2, z1], [mid + 2, z0, x1, z1]]) {
    const d = 6;
    for (const q of [[r[0], r[1], r[2], r[1] + d], [r[0], r[3] - d, r[2], r[3]], [r[0], r[1] + d, r[0] + d, r[3] - d], [r[2] - d, r[1] + d, r[2], r[3] - d]]) { bag.add(C, box(q[0], y - 0.5, q[1], q[2], y + 5, q[3])); col.rect(q, y, y + 5); col.floor(q, y + 5); }
    bag.add('flagstone', box(r[0] + d, y - 0.3, r[1] + d, r[2] - d, y + 0.05, r[3] - d)); col.floor([r[0] + d, r[1] + d, r[2] - d, r[3] - d], y + 0.05);
  }
  if (el.pool) {
    const [px, pz, pr] = el.pool;
    bag.add(C, lathe([[pr + 1.2, -2], [pr + 1.2, 0.4], [pr, 0.4], [pr, -1.6], [0.001, -1.6]], 8, null, px, y, pz));
    STYLES.qing.elements.water_cells({ rect: [px - pr, pz - pr, px + pr, pz + pr], y: y - 0.3, cell: 0.6, inside: (x, z) => Math.hypot(x - px, z - pz) < pr * 0.9 }, ctx);
    col.circle(px, pz, pr + 1.2, y - 2, y + 0.4);
  }
}
/**
 * mtepe: a sewn boat of the coast drawn up on the beach { at, dir, len, y (the sand), seed }: a
 * plank hull with sharp ends and strong sheer, the long raking stem-head forward, the planks' lines
 * of coir stitching, thwarts; a single mast stepped forward with its yard lowered and the square
 * mat sail furled along it; wooden props under the bilges, a stone anchor and coir rope by the bow.
 */
function mtepe(el, { bag, col }) {
  const [x, z] = el.at, L = el.len ?? 13, B = L * 0.24, D = L * 0.11, y = el.y ?? 0, rand = rng(el.seed || Math.floor(x * 31 + z * 17));
  const len = Math.hypot(el.dir[0], el.dir[1]), fx = el.dir[0] / len, fz = el.dir[1] / len, sx = -fz, sz = fx;   // forward, starboard
  const W = (u, v, w) => [x + fx * u + sx * v, y + w, z + fz * u + sz * v];
  const n = 16, m = 7, T = [];
  // the hull: half-breadth by sin^0.7 along, the section rounder toward the ends, the sheer rising fore and aft
  const P = (i, j) => { const t = i / n, uu = -L / 2 + L * t, half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2, s = j / m * 2 - 1, sh = 0.9 * (2 * t - 1) ** 4 + (t > 0.5 ? 0.3 * (2 * t - 1) ** 2 : 0); return W(uu, half * s, D + sh - D * (1 - Math.abs(s) ** 2.2) * Math.pow(Math.sin(Math.PI * t), 0.25)); };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...a, ...b, ...c, ...a, ...c, ...b, ...a, ...c, ...d, ...a, ...d, ...c); }
  bag.add('wood_dark', fromTriangles(T));
  // the stitching: dark lines of coir along two plank seams each side
  const S = [];
  for (const sj of [1, 2, m - 2, m - 1]) for (let i = 1; i < n - 1; i++) { const a = P(i, sj), b = P(i + 1, sj); const o = [0, 0.012, 0]; S.push(...a.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0)), ...a.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0)), ...a.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0))); }
  { const N2 = S.length; for (let k = 0; k < N2; k += 9) S.push(S[k], S[k + 1], S[k + 2], S[k + 6], S[k + 7], S[k + 8], S[k + 3], S[k + 4], S[k + 5]); }
  bag.add('hide_brown', fromTriangles(S));
  // the stem-head raking forward from the bow, the stern-post
  const bow = P(n, Math.floor(m / 2)), st = P(0, Math.floor(m / 2)), t1 = [];
  beamTris(t1, [bow[0] - fx * 0.3, bow[1] - 0.6, bow[2] - fz * 0.3], [bow[0] + fx * 1.6, bow[1] + 0.9, bow[2] + fz * 1.6], 0.09, 0.22);
  beamTris(t1, [st[0] + fx * 0.2, st[1] - 0.5, st[2] + fz * 0.2], [st[0] - fx * 0.5, st[1] + 0.5, st[2] - fz * 0.5], 0.09, 0.2);
  // thwarts
  for (const t of [0.3, 0.45, 0.62]) { const half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2 * 0.9, a = W(-L / 2 + L * t, -half, D - 0.15), b = W(-L / 2 + L * t, half, D - 0.15); beamTris(t1, a, b, 0.09, 0.07); }
  bag.add('timber', fromTriangles(t1));
  // the mast forward of amidships, the yard lowered along the boat with the furled mat sail
  const mb = W(L * 0.12, 0, 0.25), mh = L * 0.62;
  bag.add('timber', lathe([[0.12, 0], [0.08, mh], [0.001, mh + 0.05]], 8, null, mb[0], mb[1], mb[2]));
  const ya = W(-L * 0.38, 0.15, D + 0.75), yb = W(L * 0.42, 0.15, D + 0.95), ty = [];
  beamTris(ty, ya, yb, 0.06, 0.1); bag.add('timber', fromTriangles(ty));
  const sail = []; beamTris(sail, W(-L * 0.33, 0.15, D + 0.55), W(L * 0.36, 0.15, D + 0.75), 0.2, 0.32); bag.add('reed_mat', fromTriangles(sail));
  // a stay from the masthead to the stem, of coir
  const stay = []; beamTris(stay, [mb[0], mb[1] + mh - 0.3, mb[2]], [bow[0] + fx * 1.4, bow[1] + 0.8, bow[2] + fz * 1.4], 0.012, 0.025); bag.add('hide_brown', fromTriangles(stay));
  // props under the bilges, an anchor stone and a coil of rope on the sand
  for (const t of [0.35, 0.65]) for (const sg of [-1, 1]) { const half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2, tp = []; beamTris(tp, W(-L / 2 + L * t, sg * (half + 0.7), -0.1), W(-L / 2 + L * t, sg * half * 0.82, D * 0.55), 0.05, 0.1); bag.add('timber', fromTriangles(tp)); }
  const an = W(L / 2 + 1.2, 0.8, 0); bag.add('rubble', lathe([[0.001, -0.05], [0.28, 0.0], [0.3, 0.14], [0.2, 0.26], [0.001, 0.28]], 8, null, an[0], an[1], an[2]));
  bag.add('hide_brown', lathe([[0.18, 0], [0.3, 0.02], [0.3, 0.08], [0.18, 0.1], [0.18, 0]], 12, null, an[0] - sx * 0.7, an[1], an[2] - sz * 0.7));
  col.circle(x, z, B / 2, y, y + D + 1);
  void rand;
}
registerStyle('swahili', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, swahili_mosque: mosque, swahili_house: house, husuni, mtepe },
  objects: {},
});
