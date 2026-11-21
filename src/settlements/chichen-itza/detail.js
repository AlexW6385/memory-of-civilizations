// Chichén Itzá, detail pass (docs/settlements/chichen-itza.md §17): the Tzompantli with its rows of carved skulls and its
// rack, the Platform of the Eagles and Jaguars with its reliefs, the plumed serpent's body along the stair balustrades.
// Registered on the maya style from this folder (the style itself is shared and left alone).

import '../../styles/maya/index.js';
import { STYLES, subtractRects } from '../../core/build.js';
import { box, frustum, fromTriangles, orientOutward, place } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4 } from '../../core/three.js';
import { Kit } from '../../styles/maya/meso.js';
import { skullKit, eaglePanelKit, jaguarPanelKit } from './carvings.js';

const L = 'limestone_maya';

/** A kit's pieces merged into one geometry per material, kept on the kit. */
const MERGED = new WeakMap();
function merged(kit) {
  if (MERGED.has(kit)) return MERGED.get(kit);
  const out = [];
  for (const [mat, list] of kit.m) {
    const P = [], N = [];
    for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); } }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
    out.push([mat, g]);
  }
  MERGED.set(kit, out);
  return out;
}
/** Lay a kit at (x, y, z), its +z turned to (sin yaw, cos yaw), scaled s, as instances where the bag takes them. */
function lay(bag, kit, x, y, z, yaw = 0, s = 1, reach = 160) {
  const m = new Matrix4().makeRotationY(yaw); if (s !== 1) m.multiply(new Matrix4().makeScale(s, s, s)); m.setPosition(x, y, z);
  for (const [mat, g] of merged(kit)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { reach }); else bag.add(mat, g.clone().applyMatrix4(m)); }
}

/** A straight flight of steps up to a platform top { foot (the middle of the lowest step's front), dir (the way up, along an axis), w, H, steps }: a solid mass, closed wedge steps, plain balustrades, walked as a ramp. */
function flight(bag, col, foot, [dx, dz], w, H, steps, run = 0.3, back = 1.0, y0 = 0) {
  const nx = -dz, nz = dx, hw = w / 2, bw = 0.6, Lr = steps * run;
  const P = (d, o, y) => [foot[0] + dx * d + nx * o, y0 + y, foot[1] + dz * d + nz * o];
  const prism = (poly, o0, o1) => {
    const t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
    for (let i = 1; i + 1 < poly.length; i++) { t.push(...P(poly[0][0], o0, poly[0][1]), ...P(poly[i][0], o0, poly[i][1]), ...P(poly[i + 1][0], o0, poly[i + 1][1])); t.push(...P(poly[0][0], o1, poly[0][1]), ...P(poly[i][0], o1, poly[i][1]), ...P(poly[i + 1][0], o1, poly[i + 1][1])); }
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; q(P(a[0], o0, a[1]), P(b[0], o0, b[1]), P(b[0], o1, b[1]), P(a[0], o1, a[1])); }
    bag.add(L, fromTriangles(orientOutward(t)));
  };
  prism([[0, -0.2], [0, 0], [Lr, H - 0.02], [Lr + back, H - 0.02], [Lr + back, -0.2]], -(hw + bw), hw + bw);
  const t = [];
  for (let i = 0; i < steps; i++) {
    const d0 = i * run, d1 = (i + 1) * run, ya = H * i / steps, yb = H * (i + 1) / steps, e = hw + 0.05;
    const A = P(d0, -e, ya), B = P(d0, -e, yb), C = P(d1, -e, yb), A2 = P(d0, e, ya), B2 = P(d0, e, yb), C2 = P(d1, e, yb);
    t.push(...orientOutward([...A, ...B, ...C, ...A2, ...C2, ...B2, ...B, ...B2, ...C2, ...B, ...C2, ...C, ...A, ...A2, ...B2, ...A, ...B2, ...B]));
  }
  bag.add(L, fromTriangles(t));
  for (const s of [-1, 1]) prism([[0, 0], [-0.3, 0], [-0.3, 1.1], [Lr, H + 0.9], [Lr, H - 0.02]], s < 0 ? -(hw + bw) : hw, s < 0 ? -hw : hw + bw);
  const r = [Math.min(foot[0], foot[0] + dx * Lr) - (dx ? 0 : hw), Math.min(foot[1], foot[1] + dz * Lr) - (dz ? 0 : hw), Math.max(foot[0], foot[0] + dx * Lr) + (dx ? 0 : hw), Math.max(foot[1], foot[1] + dz * Lr) + (dz ? 0 : hw)];
  col.ramp(r, y0, y0 + H, dx > 0 ? 'e' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n');
}

/**
 * The body of the plumed serpent along the top of a stair's two balustrades (the same stair geometry as m_pyramid:
 * { c, base, top, h, tiers, stairW, stairOut, side }): from the head's block up to the platform, an undulating
 * band 0.4 m wide, painted feather bands across it.
 */
function stairSerpent(el, { bag }) {
  const [cx, cz] = el.c, n = el.tiers, H = el.h, A0 = el.base, A1 = el.top, sw = (el.stairW ?? 8.8) / 2, bw = 1.2;
  const STEP = (A0 - A1) / n, m = 0.64 * STEP + 0.2, foot = A0 + m + (el.stairOut ?? 0), head = A1 + m;
  const [dx, dz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.side], nx = -dz, nz = dx;
  const d0 = foot - 0.1, d1 = head + 0.3, y0 = 1.2, y1 = H + 1.0, dTop = foot + 0.4;
  const yAt = (d) => y0 + (dTop - d) * (y1 - y0) / (dTop - head);
  const len = d0 - d1, N = Math.round(len / 0.35), amp = 0.17, lam = 2.2;
  const k = new Kit();
  for (const s of [-1, 1]) {
    const pt = (i) => { const d = d0 - len * i / N, o = s * (sw + bw / 2) + amp * Math.sin(((len * i / N) / lam) * 2 * Math.PI + (s > 0 ? 0 : Math.PI)); return [cx + dx * d + nx * o, yAt(d) + 0.05, cz + dz * d + nz * o]; };
    for (let i = 0; i < N; i++) {
      const a = pt(i), b = pt(i + 1), taper = i > N - 4 ? 0.6 + 0.1 * (N - i) / 4 : 1;
      k.seg(L, a, b, 0.2 * taper, 0.06 * taper, 0.2 * taper, 0.06 * taper);
      if (i % 2 === 0) { const e = [a[0] + (b[0] - a[0]) * 0.2, a[1] + (b[1] - a[1]) * 0.2, a[2] + (b[2] - a[2]) * 0.2]; k.seg(i % 4 ? 'maya_blue' : 'stucco_red', a, e, 0.212 * taper, 0.072 * taper, 0.212 * taper, 0.072 * taper); }
    }
    // the rattle at the tail's end: six rings tapering, each a little higher than the last, alternate red, lying along the balustrade's end over the platform's edge (§20.4)
    const e = pt(N), o0 = (e[0] - cx - dx * d1) * nx + (e[2] - cz - dz * d1) * nz;
    for (let r = 0; r < 6; r++) {
      const dd = d1 - 0.08 - r * 0.15, w = 0.17 - r * 0.018, yy = e[1] + 0.02 + r * 0.012, off = o0 * 1;
      const p0 = [cx + dx * dd + nx * off, yy, cz + dz * dd + nz * off], p1 = [cx + dx * (dd - 0.12) + nx * off, yy + 0.01, cz + dz * (dd - 0.12) + nz * off];
      k.seg(r % 2 ? 'stucco_red' : L, p0, p1, w, w * 0.8, w * 0.92, w * 0.74);
    }
  }
  k.emit(bag, 0, 0, 0, 0, 1);
}

/**
 * cz_tzompantli: the platform of skulls { c, long (the bar's length, along z), wide, stem (its projection's depth, facing +x), stemLen, h }:
 * the battered foot, the lower panel with a row of skulls, a moulding, the centre panel with two rows, a moulding, the
 * projecting strip with a row and the cornice; a stair up the projection; on the top the rack of posts and crossbeams
 * threaded with skulls.
 */
function tzompantli(el, { bag, col }) {
  const [cx, cz] = el.c, BZ = (el.long ?? 44) / 2, BX = (el.wide ?? 11) / 2, SX = el.stem ?? 4, SZ = (el.stemLen ?? 16) / 2, H = el.h ?? 2.9;
  const bar = (u) => [cx - BX - u, cz - BZ - u, cx + BX + u, cz + BZ + u], stem = (u) => [cx + BX - 1, cz - SZ - u, cx + BX + SX + u, cz + SZ + u];
  const slab = (r, y0, y1) => bag.add(L, box(r[0], y0, r[1], r[2], y1, r[3]));
  const layers = [[0.45, 1.0, 0], [1.0, 1.12, 0.1], [1.12, 2.16, 0], [2.16, 2.28, 0.1], [2.28, 2.8, 0.22], [2.8, H, 0.3]];
  bag.add(L, frustum(bar(0.25), 0, 0.45, 0.25, 0.25, 0.25, 0.25));
  bag.add(L, frustum([cx + BX - 1, cz - SZ - 0.25, cx + BX + SX + 0.25, cz + SZ + 0.25], 0, 0.45, 0, 0.25, 0.25, 0.25));
  for (const [y0, y1, u] of layers) { slab(bar(u), y0, y1); slab(stem(u), y0, y1); }
  // the skulls: each register along the wall's faces (the stair's run left clear)
  const gap = 3.4, segs = [
    [[cx - BX, cz - BZ + 0.4], [0, 1], [-1, 0], 2 * BZ - 0.8], [[cx - BX + 0.4, cz - BZ], [1, 0], [0, -1], 2 * BX - 0.8], [[cx - BX + 0.4, cz + BZ], [1, 0], [0, 1], 2 * BX - 0.8],
    [[cx + BX, cz - BZ + 0.4], [0, 1], [1, 0], BZ - SZ - 0.8], [[cx + BX, cz + SZ + 0.4], [0, 1], [1, 0], BZ - SZ - 0.8],
    [[cx + BX + 0.4, cz - SZ], [1, 0], [0, -1], SX - 0.8], [[cx + BX + 0.4, cz + SZ], [1, 0], [0, 1], SX - 0.8],
    [[cx + BX + SX, cz - SZ + 0.4], [0, 1], [1, 0], SZ - gap - 0.4], [[cx + BX + SX, cz + gap], [0, 1], [1, 0], SZ - gap - 0.4],
  ];
  const rows = [[0.72, 0], [1.4, 0], [1.9, 0], [2.54, 0.22]], skull = skullKit();
  for (const [p, dir, nv, len] of segs) {
    const yaw = Math.atan2(nv[0], nv[1]);
    for (let s = 0.25; s < len; s += 0.5) for (const [y, u] of rows) lay(bag, skull, p[0] + dir[0] * s + nv[0] * u, y, p[1] + dir[1] * s + nv[1] * u, yaw);
  }
  // the stair up the projection's east face
  const steps = Math.round(H / 0.25), run = 0.3;
  flight(bag, col, [cx + BX + SX + steps * run, cz], [-1, 0], 4.4, H, steps, run, 1.0);
  // the body as an obstacle (the stair's run left open), the top as a floor
  col.rect(bar(0.3), -0.3, H - 0.31);
  for (const r of subtractRects([cx + BX, cz - SZ - 0.3, cx + BX + SX + 0.3, cz + SZ + 0.3], [[cx + BX, cz - 2.8, cx + BX + SX + 0.5, cz + 2.8]])) col.rect(r, -0.3, H - 0.31);
  col.floor([cx - BX, cz - BZ, cx + BX, cz + BZ], H); col.floor([cx + BX, cz - SZ, cx + BX + SX, cz + SZ], H);
  // the rack: pointed posts every 1.7 m, three crossbeams, small skulls threaded on them, both faces
  const rx = cx - 3.2, n = Math.floor((2 * BZ - 6) / 1.7), z0 = cz - (n * 1.7) / 2, small = skullKit();
  for (let i = 0; i <= n; i++) {
    const z = z0 + i * 1.7;
    bag.add('log_pine', box(rx - 0.07, H, z - 0.07, rx + 0.07, H + 2.3, z + 0.07));
    const t = [];
    const a = [[rx - 0.07, H + 2.3, z - 0.07], [rx + 0.07, H + 2.3, z - 0.07], [rx + 0.07, H + 2.3, z + 0.07], [rx - 0.07, H + 2.3, z + 0.07]], tip = [rx, H + 2.75, z];
    for (let j = 0; j < 4; j++) t.push(...a[j], ...a[(j + 1) % 4], ...tip);
    bag.add('log_pine', fromTriangles(orientOutward(t.concat([...a[0], ...a[2], ...a[1], ...a[0], ...a[3], ...a[2]]))));
    col.circle(rx, z, 0.12, H, H + 2.7);
    if (i < n) for (const hy of [0.55, 1.1, 1.65]) for (const k of [0.28, 0.85, 1.42]) for (const f of [-1, 1]) lay(bag, small, rx + f * 0.05, H + hy, z + k, f * Math.PI / 2, 0.6, 120);
  }
  for (const hy of [0.55, 1.1, 1.65]) bag.add('timber', box(rx - 0.035, H + hy - 0.035, z0, rx + 0.035, H + hy + 0.035, z0 + n * 1.7));
}

/**
 * cz_eagles: the Platform of the Eagles and Jaguars { c, a, h }: the platform of m_pyramid (plain, serpent heads at the foot of
 * its four stairs), the serpent bodies along the balustrades and, either side of each stair, a framed relief: an eagle
 * with a heart, a jaguar with a heart.
 */
function eagles(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, a = el.a, H = el.h, steps = Math.round(H / 0.25), stairOut = Math.max(0, steps * 0.27 - 0.6), sw = 2;
  const o = { c: el.c, base: a, top: a - 0.6, h: H, tiers: 1, stairs: 'nesw', stairW: 4, steps, serpents: 'nesw', stairOut, simple: true };
  STYLES.maya.elements.m_pyramid(o, ctx);
  for (const side of 'nesw') stairSerpent({ ...o, side }, ctx);
  const step = 0.6, ap = a - step * 0.42, pd = ap - step * 0.04 - 0.002, py0 = H * 0.55 + 0.06, edge = sw + 1.2 + 0.25, uc = edge + 0.15 + 1.15;
  for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) for (const sd of [-1, 1]) {
    // the animal faces the stair
    const f = fz ? sd * fz * -1 : sd * fx;
    const kit = sd < 0 ? eaglePanelKit(f) : jaguarPanelKit(f);
    const x = fz ? cx + sd * uc : cx + fx * pd, z = fz ? cz + fz * pd : cz + sd * uc;
    kit.emit(bag, x, py0, z, fx, fz);
  }
}

Object.assign(STYLES.maya.elements, { cz_tzompantli: tzompantli, cz_eagles: eagles, cz_stair_serpent: stairSerpent });
void place;
