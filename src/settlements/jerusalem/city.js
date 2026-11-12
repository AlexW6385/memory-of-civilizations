// The city of Jerusalem about 700 (docs/settlements/jerusalem.md §4a, §1b, §10): the wall round the
// west from the Haram's north-east corner to its south-east corner, with its towers and three gates;
// the column in the square inside the north gate; the Cardo from the north gate to the south gate,
// its colonnades, porticoes and shops; the Church of the Holy Sepulchre on the Cardo's west side;
// and the markets: stalls, people and beasts in the Cardo and in the street to the Haram.

import { gardenWalls, gardenLife, laneArchElements, laneLife } from './lanes.js';
import { sepulchreFurnish, sepulchreLife } from './sepulchre-detail.js';
import { haramFurnish, haramLife } from './haram-detail.js';
import { STREET, RADIUS, HARAM, SEPULCHRE, SEP_Y, SEP_STAIR, CARDO, CARDO_Y, WALL, GATES, PALACES, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const plan = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-180, 0], facing: 'e' }, ...extra });
const D2R = Math.PI / 180;

// ── the wall, towers and gates ──────────────────────────────────────────────────────────────────
function walls() {
  const E = [], R = WALL.r, X = WALL.east, zE = Math.sqrt(R * R - X * X), [, hz0, , hz1] = HARAM.rect;
  // the path: down the east side south of the Haram, round the west, up the east side north of the Haram (outside on the left)
  const a0 = Math.atan2(zE, X), a1 = 2 * Math.PI - a0, n = Math.ceil((a1 - a0) * R / 8);
  const gap = (g) => (g.kind === 'triple' ? 21 : 12) / 2 + 7.0;
  const cuts = GATES.map((g) => { let a = Math.atan2(g.at[1], g.at[0]); if (a < a0) a += 2 * Math.PI; return [a, (gap(g) - 0.8) / R]; });
  const angles = [];
  for (let k = 0; k <= n; k++) angles.push(a0 + (a1 - a0) * k / n);
  for (const [a, d] of cuts) angles.push(a - d, a + d);
  angles.sort((p, q) => p - q);
  const pieces = [[]];
  for (let z = hz1 + 3; z < zE; z += 12) pieces[0].push([X, z]);
  for (const a of angles) {
    if (cuts.some(([c, d]) => a > c - d + 1e-6 && a < c + d - 1e-6)) continue;
    const p = [Math.cos(a) * R, Math.sin(a) * R];
    pieces[pieces.length - 1].push(p);
    if (cuts.some(([c, d]) => Math.abs(a - (c - d)) < 1e-6)) pieces.push([]);
  }
  for (let z = -zE + 12; z <= hz0 - 3; z += 12) pieces[pieces.length - 1].push([X, z]);
  if (pieces[pieces.length - 1].at(-1)[1] < hz0 - 3) pieces[pieces.length - 1].push([X, hz0 - 3]);
  const path = pieces.flat();
  // close each piece up to the gate's tower
  // the ground under each point: the lowest across the wall's foot, outside to inside
  const low = (x, z, r) => { const a = Math.atan2(z, x), k = Math.abs(x - X) < 1e-6 ? [1, 0] : [Math.cos(a), Math.sin(a)]; return Math.min(...[-r, 0, r].map((d) => height(x + k[0] * d, z + k[1] * d))); };
  for (const pc of pieces) if (pc.length > 1) E.push({ t: 'city_wall', pts: pc.map(([x, z]) => [x, z, height(x, z), low(x, z, 2.5)]), th: 2.8, h: 9 });
  // the towers, about every 40 m along the arc, clear of the gates
  let run = 0;
  for (let i = 1; i < path.length - 1; i++) {
    run += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    if (run < 40) continue;
    const [x, z] = path[i];
    if (GATES.some((g) => Math.hypot(g.at[0] - x, g.at[1] - z) < gap(g) + 14) || Math.abs(z) < 210 && x > 100) continue;
    const L = Math.hypot(path[i + 1][0] - path[i - 1][0], path[i + 1][1] - path[i - 1][1]);
    E.push({ t: 'wall_tower', at: [x, z], u: [(path[i + 1][0] - path[i - 1][0]) / L, (path[i + 1][1] - path[i - 1][1]) / L], g: height(x, z), gmin: low(x, z, 7.5), w: 7, d: 6, h: 12.5 });
    run = 0;
  }
  for (const g of GATES) {
    const a = Math.atan2(g.at[1], g.at[0]), u = [-Math.sin(a), Math.cos(a)];        // the arc's direction, counter-clockwise
    E.push({ t: 'city_gate', at: g.at, u, g: height(g.at[0], g.at[1]), gmin: Math.min(...[-18, -9, 0, 9, 18].map((d) => low(g.at[0] + u[0] * d, g.at[1] + u[1] * d, 8))), kind: g.kind, th: 2.8, h: 9 });
  }
  return E;
}

// ── the Cardo ───────────────────────────────────────────────────────────────────────────────────
const ZN = -286, ZS = 286;
function cardo() {
  const E = [], X = CARDO.x, hr = CARDO.road / 2, y = CARDO_Y;
  const gaps = { w: [[-6, 6], [SEPULCHRE[1], SEPULCHRE[3]]], e: [[-6, 6]] };
  for (const [sideName, x, side] of [['w', X - hr, 1], ['e', X + hr, -1]]) {
    // stretches between the gaps, each cut into lengths of about 48 m
    let z = ZN;
    const ends = [...gaps[sideName].sort((p, q) => p[0] - q[0]), [ZS, ZS]];
    for (const [g0, g1] of ends) {
      const L = g0 - z, n = Math.max(1, Math.round(L / 48));
      for (let k = 0; k < n; k++) {
        const za = z + L * k / n, zb = z + L * (k + 1) / n;
        if (zb - za > 3) E.push({ t: 'colonnade', a: [x, za], b: [x, zb], y: height(x, (za + zb) / 2), side, depth: CARDO.portico, shops: CARDO.shops, h: 5, spacing: 5.77 });
      }
      z = g1;
    }
  }
  // the column in the square inside the north gate (the Madaba map), its statue long gone
  const cz = ZN - 6, gy = height(X, cz);
  E.push({ t: 'block', rect: [X - 2.2, cz - 2.2, X + 2.2, cz + 2.2], y0: gy - 0.5, y1: gy + 0.6, mat: 'limestone' });
  E.push({ t: 'block', rect: [X - 1.5, cz - 1.5, X + 1.5, cz + 1.5], y0: gy + 0.6, y1: gy + 2.6, mat: 'marble' });
  E.push({ t: 'reused_column', at: [X, cz], y: gy + 2.6, h: 13, d: 1.2, shaft: 'granite_grey' });
  E.push({ t: 'block', rect: [X - 1.0, cz - 1.0, X + 1.0, cz + 1.0], y0: gy + 15.6, y1: gy + 16.2, mat: 'marble' });
  return E;
}

// ── the Church of the Holy Sepulchre ──────────────────────────────────────────────────────────────
function sepulchre() {
  const E = [], Y = SEP_Y, [sx0, sz0, sx1, sz1] = SEPULCHRE, zc = (sz0 + sz1) / 2, xs = sx1 - SEP_STAIR;     // xs: the top of the stair
  const pw = (o) => E.push({ t: 'planar_wall', mat: 'limestone', ...o });
  const col = (x, z, y, h, d, shaft) => E.push({ t: 'reused_column', at: [x, z], y, h, d, shaft });
  // the stair up from the Cardo between two terraces; the propylaea's columns on the Cardo
  E.push({ t: 'stair', rect: [xs, zc - 15, sx1, zc + 15], dir: 'w', y0: CARDO_Y + 0.18, y1: Y, riser: 0.17, base: CARDO_Y - 0.5, mat: 'limestone' });
  for (const [a, b] of [[sz0, zc - 15], [zc + 15, sz1]]) E.push({ t: 'block', rect: [xs, a, sx1, b], y0: CARDO_Y - 1, y1: Y, mat: 'limestone', walk: true });
  for (let k = 0; k < 6; k++) col(CARDO.x - CARDO.road / 2 - 2.5, zc - 15 + 3 + k * 4.8, CARDO_Y + 0.18, 8.5, 0.95, 'granite_grey');
  E.push({ t: 'beam', a: [CARDO.x - CARDO.road / 2 - 2.5, zc - 15], b: [CARDO.x - CARDO.road / 2 - 2.5, zc + 15], y: CARDO_Y + 8.68, w: 1.3, h: 1.0, mat: 'limestone' });
  // the terrace: paved courts, the church floors in marble
  E.push({ t: 'floor', rect: [sx0, sz0, xs, sz1], y: Y, mat: 'flagstone', th: 0.6 });
  // the enclosure: north and south walls, the west wall, the east wall with three doors into the atrium
  pw({ o: [sx0, sz0 + 0.6], u: [1, 0], th: 1.2, u0: 0, u1: xs - sx0, y0: Y - 0.6, y1: Y + 9 });
  pw({ o: [sx0, sz1 - 0.6], u: [1, 0], th: 1.2, u0: 0, u1: xs - sx0, y0: Y - 0.6, y1: Y + 9 });
  pw({ o: [sx0 + 0.6, sz0 + 1.2], u: [0, 1], th: 1.2, u0: 0, u1: sz1 - sz0 - 2.4, y0: Y - 0.6, y1: Y + 9 });
  pw({ o: [xs - 0.6, sz0 + 1.2], u: [0, 1], th: 1.2, u0: 0, u1: sz1 - sz0 - 2.4, y0: Y - 0.6, y1: Y + 10, arches: [{ uc: 30 - 1.2, r: 2.4, spring: Y + 4.6, sill: Y }, { uc: 30 - 1.2 - 9, r: 1.6, spring: Y + 3.6, sill: Y }, { uc: 30 - 1.2 + 9, r: 1.6, spring: Y + 3.6, sill: Y }] });
  // the basilica (the Martyrium): five aisles, the apse at the west ringed by twelve columns
  const bx1 = xs - 14, bx0 = bx1 - 40, nz = [zc - 7, zc + 7], iz = [zc - 13.5, zc + 13.5], oz = [zc - 20, zc + 20], nb = 10, b = 40 / nb;
  E.push({ t: 'floor', rect: [bx0, oz[0], bx1, oz[1]], y: Y + 0.06, mat: 'opus_sectile', th: 0.3 });
  for (const z of nz) {
    pw({ o: [bx0, z], u: [1, 0], th: 0.9, u0: 0.6, u1: 40 - 0.6, y0: Y, y1: Y + 15, arcade: true, noEnds: true, arches: Array.from({ length: nb }, (_, k) => ({ uc: (k + 0.5) * b, r: (b - 0.95) / 2, spring: Y + 7.0 })), holes: Array.from({ length: nb }, (_, k) => ({ u0: (k + 0.5) * b - 0.6, u1: (k + 0.5) * b + 0.6, y0: Y + 11, y1: Y + 13.2 })) });
    for (let k = 1; k < nb; k++) col(bx0 + k * b, z, Y + 0.06, 6.6, 0.75, 'proconnesian');
  }
  for (const z of iz) {
    pw({ o: [bx0, z], u: [1, 0], th: 0.8, u0: 0.6, u1: 40 - 0.6, y0: Y, y1: Y + 9.5, arcade: true, noEnds: true, arches: Array.from({ length: nb }, (_, k) => ({ uc: (k + 0.5) * b, r: (b - 0.9) / 2, spring: Y + 5.4 })) });
    for (let k = 1; k < nb; k++) col(bx0 + k * b, z, Y + 0.06, 5.0, 0.6, 'marble_smooth');
  }
  for (const z of oz) pw({ o: [bx0, z], u: [1, 0], th: 1.2, u0: -0.6, u1: 40.6, y0: Y - 0.6, y1: Y + 9.5, arches: Array.from({ length: nb }, (_, k) => ({ uc: (k + 0.5) * b, r: 0.8, spring: Y + 6.6, sill: Y + 4.4 })) });
  // the east façade, three doors; the west wall with the apse arch
  const fz = (z) => z - oz[0];
  pw({ o: [bx1, oz[0]], u: [0, 1], th: 1.2, u0: 0.6, u1: 39.4, y0: Y - 0.6, y1: Y + 9.5, arches: [{ uc: 20, r: 2.2, spring: Y + 4.8, sill: Y }, { uc: fz(zc - 10.25), r: 1.4, spring: Y + 3.6, sill: Y }, { uc: fz(zc + 10.25), r: 1.4, spring: Y + 3.6, sill: Y }, { uc: fz(zc - 16.75), r: 1.2, spring: Y + 3.4, sill: Y }, { uc: fz(zc + 16.75), r: 1.2, spring: Y + 3.4, sill: Y }] });
  pw({ o: [bx1, oz[0]], u: [0, 1], th: 1.2, u0: 12.55, u1: 27.45, y0: Y + 9.5, y1: Y + 15, arches: [{ uc: 20, r: 1.4, spring: Y + 11.8, sill: Y + 10.4 }] });
  pw({ o: [bx0, oz[0]], u: [0, 1], th: 1.2, u0: 0.6, u1: 39.4, y0: Y - 0.6, y1: Y + 9.5, arches: [{ uc: 20, r: 6.0, spring: Y + 2.8, sill: Y }] });
  pw({ o: [bx0, oz[0]], u: [0, 1], th: 1.2, u0: 12.55, u1: 27.45, y0: Y + 9.5, y1: Y + 15 });
  E.push({ t: 'arc_wall', c: [bx0, zc], r0: 7.0, r1: 8.2, a0: 90, a1: 270, y0: Y - 0.6, y1: Y + 8.8, mat: 'limestone' });
  E.push({ t: 'sphere', c: [bx0, Y + 8.8, zc], R: 7.0, a0: 90, a1: 270, e0: 0, e1: 90, segA: 48, segE: 14, mat: 'mosaic_gold', outer: { t: 1.2, mat: 'roof_tile' } });
  for (let k = 0; k < 12; k++) { const a = (90 + 180 * (k + 0.5) / 12) * D2R; col(bx0 + Math.cos(a) * 6.0, zc + Math.sin(a) * 6.0, Y + 0.06, 4.6, 0.45, 'giallo'); }
  // roofs: the nave gabled, the double aisles under lean-to roofs, timber ceilings beneath
  E.push({ t: 'slab', rect: [bx0 + 0.6, nz[0] + 0.45, bx1 - 0.6, nz[1] - 0.45], y0: Y + 14.7, y1: Y + 15, mat: 'ceiling_painted' });
  E.push({ t: 'block', rect: [bx0 - 0.6, nz[0] - 0.45, bx1 + 0.6, nz[1] + 0.45], y0: Y + 15, y1: Y + 19.6, batter: [0, 0, 7.45, 7.45], mat: 'roof_tile', collide: false });
  for (const s of [-1, 1]) {
    const a = s < 0 ? oz[0] - 0.6 : nz[1] + 0.45, c = s < 0 ? nz[0] - 0.45 : oz[1] + 0.6;
    E.push({ t: 'slab', rect: [bx0 + 0.6, s < 0 ? oz[0] + 0.6 : nz[1] + 0.45, bx1 - 0.6, s < 0 ? nz[0] - 0.45 : oz[1] - 0.6], y0: Y + 9.2, y1: Y + 9.5, mat: 'ceiling_painted' });
    E.push({ t: 'block', rect: [bx0 - 0.6, a, bx1 + 0.6, c], y0: Y + 9.5, y1: Y + 12.2, batter: s < 0 ? [0, 0, c - a, 0] : [0, 0, 0, c - a], mat: 'roof_tile', collide: false });
  }
  // the inner court (the Holy Garden): the rock of Golgotha in its south-east corner, a great cross on it
  E.push({ t: 'obj', kind: 'rock', at: [bx0 - 9.5, sz1 - 10.5], y: Y, rx: 3.4, rz: 3.0, h: 4.6 });
  E.push({ t: 'block', rect: [bx0 - 9.65, sz1 - 10.65, bx0 - 9.35, sz1 - 10.35], y0: Y + 3.5, y1: Y + 8.6, mat: 'silver', collide: false });
  E.push({ t: 'block', rect: [bx0 - 9.65, sz1 - 11.9, bx0 - 9.35, sz1 - 9.1], y0: Y + 7.0, y1: Y + 7.3, mat: 'silver', collide: false });
  // the Anastasis: the rotunda over the Tomb — its outer wall, twelve columns in threes between four pairs of piers,
  // the drum with its windows, a conical timber roof open to the sky at the top; the Tomb's shrine in the middle
  const rc = [sx0 + 18.4, zc], RI = 16.85;
  E.push({ t: 'floor', rect: [rc[0] - RI, zc - RI, rc[0] + RI, zc + RI], y: Y + 0.06, mat: 'marble_floor', th: 0.3 });
  E.push({ t: 'arc_wall', c: rc, r0: RI, r1: RI + 1.4, a0: 0, a1: 360, y0: Y - 0.6, y1: Y + 11.5, mat: 'limestone',
    gaps: [{ a: 0, w: 4.4, y0: Y, y1: Y + 6.0 }, { a: 330, w: 2.6, y0: Y, y1: Y + 4.6 }, { a: 30, w: 2.6, y0: Y, y1: Y + 4.6 }, ...[90, 135, 180, 225, 270].map((a) => ({ a, w: 1.4, y0: Y + 6.6, y1: Y + 9.2 }))] });
  const RA = 11.0, sup = Array.from({ length: 20 }, (_, k) => { const a = (9 + 18 * k) * D2R; return { a, p: [rc[0] + Math.cos(a) * RA, rc[1] + Math.sin(a) * RA], pier: k % 5 < 2 }; });
  for (let k = 0; k < 20; k++) {
    const s = sup[k], t = sup[(k + 1) % 20], L = Math.hypot(t.p[0] - s.p[0], t.p[1] - s.p[1]), u = [(t.p[0] - s.p[0]) / L, (t.p[1] - s.p[1]) / L];
    pw({ o: s.p, u, th: 1.0, u0: 0, u1: L, y0: Y + 6.2, y1: Y + 9.6, arches: [{ uc: L / 2, r: (L - 1.1) / 2, spring: Y + 6.2 }], arcade: true, noEnds: true, collide: false });
    if (s.pier) E.push({ t: 'block', rect: [s.p[0] - 0.75, s.p[1] - 0.75, s.p[0] + 0.75, s.p[1] + 0.75], y0: Y, y1: Y + 6.2, mat: 'limestone' });
    else col(s.p[0], s.p[1], Y + 0.06, 5.8, 0.7, 'marble_smooth');
  }
  E.push({ t: 'arc_wall', c: rc, r0: RA - 0.5, r1: RA + 0.5, a0: 0, a1: 360, y0: Y + 9.6, y1: Y + 20, mat: 'limestone', collide: false, step: 4,
    gaps: Array.from({ length: 16 }, (_, k) => ({ a: 11.25 + 22.5 * k, w: 1.2, y0: Y + 15, y1: Y + 18.2 })) });
  E.push({ t: 'ring_slab', c: rc, outer: { n: 0, a: RI }, inner: { n: 0, a: RA + 0.5 }, y0: Y + 10.6, y1: Y + 10.9, mat: 'ceiling_painted', seg: 64 });
  E.push({ t: 'ring_slab', c: rc, outer: { n: 0, a: RI + 1.6 }, inner: { n: 0, a: RA + 0.5 }, y0: Y + 11.5, y1: Y + 14.0, slope: true, mat: 'roof_tile', seg: 64 });
  E.push({ t: 'lathe_shell', c: rc, y: Y + 20, profile: [[RA + 0.55, 0], [RA + 0.55, 0.3], [2.6, 9.0], [2.4, 9.0]], seg: 64, mat: 'lead' });
  E.push({ t: 'lathe_shell', c: rc, y: Y + 20, profile: [[RA - 0.5, 0], [2.4, 8.4], [2.4, 9.0]], seg: 64, inward: true, mat: 'timber' });
  // the shrine of the Tomb (the Edicule): a round marble aedicule under a conical silver roof, a porch on the east
  E.push({ t: 'lathe_shell', c: rc, y: Y + 0.06, profile: [[3.0, 0], [3.0, 0.4], [2.6, 0.5], [2.6, 4.2], [2.9, 4.4], [2.9, 4.7], [0.0001, 4.7]], seg: 32, mat: 'marble' });
  E.push({ t: 'lathe_shell', c: rc, y: Y + 4.76, profile: [[2.95, 0], [0.2, 2.6], [0.0001, 3.0]], seg: 32, mat: 'silver' });
  for (const s of [-1, 1]) col(rc[0] + 4.4, rc[1] + s * 1.5, Y + 0.06, 3.6, 0.32, 'marble_smooth');
  E.push({ t: 'slab', rect: [rc[0] + 2.4, rc[1] - 2.0, rc[0] + 4.9, rc[1] + 2.0], y0: Y + 3.66, y1: Y + 4.0, mat: 'marble', holes: [] });
  return E;
}

// ── the Umayyad palaces south of the Haram ──────────────────────────────────────────────────────────
function palaces() {
  const E = [];
  for (const [i, p] of PALACES.entries()) {
    const y = height((p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2);
    E.push({ t: 'umayyad_palace', y, h: HARAM.top - y, seed: 705 + i, ...p });
    // the paved street round it
    const [x0, z0, x1, z1] = p.rect;
    for (const r of [[x0 - 6, z0 - 6, x1 + 6, z0], [x0 - 6, z1, x1 + 6, z1 + 6], [x0 - 6, z0, x0, z1], [x1, z0, x1 + 6, z1]]) E.push({ t: 'floor', rect: r, y: y + 0.02, mat: 'flagstone', th: 0.4 });
  }
  const b = PALACES[0].bridge, y = height(b.x0, HARAM.rect[3] + 6);
  E.push({ t: 'palace_bridge', x0: b.x0, x1: b.x1, z0: HARAM.rect[3] + 3, z1: PALACES[0].rect[1], g: y, top: HARAM.top });
  return E;
}

// ── the bazaar: the shop rows either side of the street from the west gate to the Haram (§4e) ────────────────
/** One plan per span: a colonnade of one shop each (so that each floor follows the slope's steps), a row on either side of the roadway. */
function bazaar(span) {
  const E = [], [xa, xb] = span, n = Math.floor((xb - xa) / STREET.shopW);
  for (const side of [-1, 1]) for (let k = 0; k < n; k++) {
    const x0 = xa + k * STREET.shopW, xm = x0 + STREET.shopW / 2;
    E.push({ t: 'colonnade', a: [x0, side * STREET.road], b: [x0 + STREET.shopW, side * STREET.road], y: height(xm, side * (STREET.road + 1)), side, depth: STREET.portico, shops: STREET.shops, h: 4.2, spacing: STREET.shopW, noEnd: k < n - 1 });
  }
  return E;
}

// ── the markets and the people ───────────────────────────────────────────────────────────────────
function markets() {
  const rand = rng(691), L = [], X = CARDO.x, hr = CARDO.road / 2;
  const CL = ['cloth_white', 'cloth_brown', 'cloth_ochre', 'cloth_indigo', 'cloth_grey', 'cloth_black', 'cloth_red'];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CL[Math.floor(rand() * CL.length)], cloth2: CL[Math.floor(rand() * CL.length)], skin: 'skin_medium', hat: rand() < 0.45 ? 'turban' : rand() < 0.6 ? 'veil' : 'none', hatMat: rand() < 0.6 ? 'cloth_white' : CL[Math.floor(rand() * CL.length)], ...o });
  const GOODS = [['pottery', ['water_pot', 'amphora', 'dark_pot']], ['cloth', ['cloth']], ['produce', ['produce', 'basket']], ['glass', ['glazed_jar', 'blue_jar', 'water_pot']], ['grain', ['basket', 'produce']]];
  const AW = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'linen'];
  // stalls along both edges of the Cardo's roadway, their backs to the colonnades; buyers before them
  for (let z = ZN + 10; z < ZS - 8; z += 9 + rand() * 9) {
    if (Math.abs(z) < 12) continue;
    for (const s of [-1, 1]) {
      if (rand() < 0.35) continue;
      const x = X + s * (hr - 1.5), y = height(x, z), g = GOODS[Math.floor(rand() * GOODS.length)][1];
      L.push({ t: 'stall', at: [x, z], y, rot: s > 0 ? -Math.PI / 2 : Math.PI / 2, seed: Math.floor(rand() * 1e9), w: 2.6, d: 1.3, awning: AW[Math.floor(rand() * AW.length)], goods: g });
      fig([x + s * 0.9, z + (rand() - 0.5) * 1.2], s > 0 ? -Math.PI / 2 : Math.PI / 2, { pose: rand() < 0.4 ? 'sit' : 'stand' });       // the seller behind it
      if (rand() < 0.7) fig([x - s * 2.4, z + (rand() - 0.5) * 2], s > 0 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none' });
    }
  }
  // people walking the Cardo and the porticoes; donkeys with their drivers; a few camels from the caravans
  for (let k = 0; k < 70; k++) { const z = ZN + rand() * (ZS - ZN), x = X + (rand() - 0.5) * 2 * (rand() < 0.3 ? hr + 4 : hr - 4); fig([x, z], rand() < 0.5 ? 0 : Math.PI, { pose: rand() < 0.2 ? 'talk' : 'stand', carry: rand() < 0.12 ? 'pot' : rand() < 0.1 ? 'basket' : 'none' }); }
  for (let k = 0; k < 14; k++) {
    const z = ZN + 20 + rand() * (ZS - ZN - 40), x = X + (rand() - 0.5) * 5, rot = rand() < 0.5 ? 0 : Math.PI, kind = k < 10 ? 'donkey' : 'camel';
    L.push({ t: 'animal', kind, at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e9) });
    fig([x + 0.9, z + (rot ? 1.2 : -1.2)], rot, {});
  }
  // the street from the west gate to the Haram: stalls at its edges, people on it
  for (let x = -365; x < HARAM.rect[0] - 30; x += 8 + rand() * 10) {
    if (Math.abs(x - X) < 20) continue;
    for (const s of [-1, 1]) {
      if (rand() < 0.5 || x > STREET.x0 + 1 && x < STREET.x1 + 3) continue;
      const z = s * 3.6, g = GOODS[Math.floor(rand() * GOODS.length)][1];
      L.push({ t: 'stall', at: [x, z], y: height(x, z), rot: s > 0 ? Math.PI : 0, seed: Math.floor(rand() * 1e9), w: 2.4, d: 1.1, awning: AW[Math.floor(rand() * AW.length)], goods: g });
      fig([x + (rand() - 0.5), z + s * 0.9], s > 0 ? Math.PI : 0, { pose: rand() < 0.5 ? 'sit' : 'stand' });
    }
    if (rand() < 0.6) fig([x + rand() * 4, (rand() - 0.5) * 3], rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  // worshippers crossing the Haram toward the Aqsa and the Dome
  for (let k = 0; k < 40; k++) {
    const x = (rand() - 0.5) * 240, z = -150 + rand() * 260;
    if ((Math.abs(x) < 82 && z > -92 && z < 52) || (Math.abs(x) < 46 && z > 110)) continue;
    fig([x, z], rand() * 6.28, { pose: rand() < 0.2 ? 'talk' : 'stand', y: HARAM.top });
  }
  // the palaces: a cistern's well-head in each court, officials and servants in the courts and the
  // portico, people in the street along the Haram's south wall and before the Double Gate
  for (const p of PALACES) {
    const [x0, z0, x1, z1] = p.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = height(cx, cz);
    L.push({ t: 'well', kind: 'pulley', at: [cx, cz], y: y + 0.03, seed: Math.floor(rand() * 1e9) });
    for (let k = 0; k < 9; k++) { const a = rand() * 6.28, r = 4 + rand() * 14; fig([cx + Math.cos(a) * r, cz + Math.sin(a) * r * 1.2], rand() * 6.28, { y: y + 0.03, pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.15 ? 'pot' : 'none' }); }
  }
  for (let x = -140; x < 140; x += 7 + rand() * 10) fig([x, HARAM.rect[3] + 5 + rand() * 6], rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.25 ? 'talk' : 'stand' });
  L.push({ t: 'animal', kind: 'donkey', at: [20, 209], y: height(20, 209), rot: Math.PI / 2, seed: 3 });
  return L;
}

export function city() {
  return [
    plan('jerusalem-walls', 'islamic', walls()),
    plan('jerusalem-cardo', 'islamic', cardo()),
    plan('jerusalem-sepulchre', 'islamic', sepulchre(), { entrance: { at: [CARDO.x, (SEPULCHRE[1] + SEPULCHRE[3]) / 2], facing: 'w' }, bounds: [SEPULCHRE[0] - 2, SEPULCHRE[1] - 2, CARDO.x, SEPULCHRE[3] + 2] }),
    plan('jerusalem-sepulchre-furnish', 'islamic', sepulchreFurnish(), { entrance: { at: [CARDO.x, (SEPULCHRE[1] + SEPULCHRE[3]) / 2], facing: 'w' }, bounds: [SEPULCHRE[0] - 2, SEPULCHRE[1] - 2, CARDO.x, SEPULCHRE[3] + 2] }),
    plan('jerusalem-sepulchre-life', 'life', sepulchreLife(), { bounds: [SEPULCHRE[0] - 2, SEPULCHRE[1] - 2, CARDO.x, SEPULCHRE[3] + 2] }),
    plan('jerusalem-gardens', 'islamic', [...gardenWalls(), ...laneArchElements()]),
    plan('jerusalem-garden-life', 'life', [...gardenLife(), ...laneLife()]),
    plan('jerusalem-palaces', 'islamic', palaces()),
    ...STREET.spans.map((sp, i) => plan(`jerusalem-bazaar-${i}`, 'islamic', bazaar(sp), { bounds: [sp[0] - 4, -STREET.half - 2, sp[1] + 4, STREET.half + 2] })),
    plan('jerusalem-markets', 'life', markets()),
    plan('jerusalem-haram-furnish', 'islamic', haramFurnish(), { bounds: [HARAM.rect[0] - 6, HARAM.rect[1] - 6, HARAM.rect[2] + 6, HARAM.rect[3] + 6] }),
    plan('jerusalem-haram-life', 'life', haramLife(), { bounds: [HARAM.rect[0] - 6, HARAM.rect[1] - 6, HARAM.rect[2] + 6, HARAM.rect[3] + 6] }),
  ];
}
