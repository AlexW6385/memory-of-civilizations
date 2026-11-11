// Sumerian architecture of Ur III (c. 2100–2000 BC; docs/settlements/ur.md §4): the ziggurat —
// stages of mud brick faced with baked brick, their walls sloping in and broken by shallow
// buttresses, the three stairways on the front meeting at a gatehouse, the shrine on top —
// buttressed precinct walls, courtyard buildings and courtyard houses of plastered mud brick.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { loft, ring } from '../egyptian/objects.js';
import '../qing/index.js';
import { urHouseOpen, scribeKit, quayGoods } from './house.js';
import { giparu, urChapel } from './temple.js';
import { dressFront, roofLife } from './dress.js';

const BB = 'brick_baked', MB = 'mudbrick', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * A straight flight of brick steps rect, rising y0 → y1 toward dir: each step a slab half a metre deep under its
 * tread, the whole on a wedge of brickwork (only its sides and back built: the rest lies under the steps).
 */
export function stairs(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el, mat = el.mat || BB, alongZ = dir === 'n' || dir === 's';
  const len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.16)), rise = (y1 - y0) / n, tr = len / n, foot = y0 - 0.2;
  // s: distance along the run from its foot; (a, b): the plan coordinate across
  const at = (sd) => (dir === 's' ? z0 + sd : dir === 'n' ? z1 - sd : dir === 'e' ? x0 + sd : x1 - sd);
  for (let i = 0; i < n; i++) {
    const p0 = at(i * tr), p1 = at((i + 1) * tr), yy = y0 + (i + 1) * rise, lo = Math.max(foot, yy - 0.5), [q0, q1] = [Math.min(p0, p1), Math.max(p0, p1)];
    bag.add(mat, alongZ ? box(x0, lo, q0, x1, yy, q1) : box(q0, lo, z0, q1, yy, z1));
  }
  const top = y1 + rise - 0.5;
  if (top > foot + 0.05) {
    const T = [], pf = at(0), pb = at(len), P = (u, y, c) => (alongZ ? [c, y, u] : [u, y, c]), [c0, c1] = alongZ ? [x0, x1] : [z0, z1];
    for (const c of [c0, c1]) { const tri = [P(pf, foot, c), P(pb, foot, c), P(pb, top, c)]; T.push(...tri[0], ...tri[1], ...tri[2], ...tri[0], ...tri[2], ...tri[1]); }
    const q = [P(pb, foot, c0), P(pb, foot, c1), P(pb, top, c1), P(pb, top, c0)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
    bag.add(mat, fromTriangles(T));
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
}
/** Shallow buttresses along the faces of a sloping stage [x0, z0, x1, z1] from y to y + h (inset at the top by b). */
export function buttresses(bag, [x0, z0, x1, z1], y, h, b, step = 3.2, skip = null, mat = BB, hw = 0.55) {
  for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / step);
    for (let i = 1; i < n; i++) {
      const s = i * L / n, px = ax + (bx - ax) * s / L, pz = az + (bz - az) * s / L;
      if (skip && skip(px, pz)) continue;
      const tx = nz !== 0 ? hw : 0.35, tz = nx !== 0 ? hw : 0.35;
      bag.add(mat, frustum([px - tx + nx * 0.2, pz - tz + nz * 0.2, px + tx + nx * 0.2, pz + tz + nz * 0.2], y, y + h * 0.97, nx > 0 ? 0 : nx < 0 ? b : 0, nx > 0 ? b : 0, nz < 0 ? b : 0, nz > 0 ? b : 0));
    }
  }
}

/**
 * ziggurat: { c, y, stages: [{ w, d, h, batter }], front ('n' | 's'), shrine: { w, d, h } }: the stages
 * sloping in, buttressed; on the front the central stair projecting out to the first stage's top and
 * two stairs leaning on the wall from the corners, meeting at the gatehouse; a single stair on up;
 * the shrine on the top stage.
 */
function ziggurat(el, ctx) {
  if (el.front === 's') return ziggurat({ ...el, front: 'n' }, mirrored(ctx, el.c[1]));
  const { bag, col } = ctx, [cx, cz] = el.c;
  let y = el.y ?? 0;
  const tops = [];
  el.stages.forEach((s, i) => {
    const r = [cx - s.w / 2, cz + (s.dz ?? 0) - s.d / 2, cx + s.w / 2, cz + (s.dz ?? 0) + s.d / 2], b = s.batter ?? s.h * 0.12;   // dz: the upper stages set back
    bag.add(BB, frustum(r, y, y + s.h, b, b, b, b, { noBottom: true }));
    buttresses(bag, r, y, s.h, b, 3.2, (px) => Math.abs(px - cx) < 5);
    col.rect([r[0] + b * 0.4, r[1] + b * 0.4, r[2] - b * 0.4, r[3] - b * 0.4], y, y + s.h);
    col.floor([r[0] + b, r[1] + b, r[2] - b, r[3] - b], y + s.h);
    tops.push({ r, b, y0: y, y1: y + s.h });
    // the weeper holes: rows of small dark drains through the baked-brick skin, midway between the buttresses
    for (const [ax, az, bx, bz, nx, nz] of [[r[0], r[1], r[2], r[1], 0, -1], [r[0], r[3], r[2], r[3], 0, 1], [r[0], r[1], r[0], r[3], -1, 0], [r[2], r[1], r[2], r[3], 1, 0]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 3.2);
      for (let k = 0; k < n; k++) {
        const u = (k + 0.5) * L / n, px = ax + (bx - ax) * u / L, pz = az + (bz - az) * u / L;
        if (nz < 0 && Math.abs(px - cx) < 7) continue;                       // not behind the stairs
        if (nz < 0 && i === 0 && Math.abs(px - cx) > s.w / 2 - 4) continue;
        for (let yy = y + 1.4; yy < y + s.h - 1; yy += 1.8) {
          const f = (yy - y) / s.h, o = b * f, fx = px - nx * o, fz = pz - nz * o, hw = 0.13, hd = 0.09;
          bag.add('opening', nx ? box(fx - hd, yy, fz - hw, fx + hd, yy + 0.22, fz + hw) : box(fx - hw, yy, fz - hd, fx + hw, yy + 0.22, fz + hd));
        }
      }
    }
    y += s.h;
  });
  const S0 = tops[0], fz = S0.r[1];                          // the front face (north)
  // the central stair, out from the face to the first stage's top; the two leaning stairs
  const run = S0.y1 - S0.y0;
  stairs({ rect: [cx - 4, fz - run * 1.9, cx + 4, fz + S0.b + 0.5], y0: S0.y0, y1: S0.y1, dir: 's', mat: BB }, { bag, col });
  // the central stair's parapets: low walls rising with it
  for (const sx of [-1, 1]) {
    const t = [], za = fz - run * 1.9, zb = fz + S0.b + 0.5;
    beamTris(t, [cx + sx * 4.3, S0.y0, za], [cx + sx * 4.3, S0.y1, zb], 0.3, 1.0);
    bag.add(BB, fromTriangles(t)); col.segment([cx + sx * 4.3, za], [cx + sx * 4.3, zb], 0.6, S0.y0, S0.y1 + 1);
  }
  for (const s of [-1, 1]) {
    const x0 = cx + s * (S0.r[2] - cx - 3), x1 = cx + s * 5;
    stairs({ rect: [Math.min(x0, x1), fz - 1, Math.max(x0, x1), fz + 4], y0: S0.y0, y1: S0.y1, dir: s < 0 ? 'e' : 'w', mat: BB }, { bag, col });
    bag.add(BB, frustum([Math.min(x0, x1), fz - 1.4, Math.max(x0, x1), fz - 1], S0.y0, S0.y1 + 0.8, 0, 0, 0, 0));
  }
  // the gatehouse at the head of the stairs, its way 5 m wide and 4.8 m high, the single stair going on up through it
  const gz = fz + S0.b + 1, GH = 6.2, gw = 2.6;
  for (const sx of [-1, 1]) { const q = [Math.min(cx + sx * gw, cx + sx * 6.5), gz, Math.max(cx + sx * gw, cx + sx * 6.5), gz + 4]; bag.add(MP, box(q[0], S0.y1, q[1], q[2], S0.y1 + GH, q[3])); col.rect(q, S0.y1, S0.y1 + GH); col.floor(q, S0.y1 + GH); }
  bag.add(MP, box(cx - gw, S0.y1 + 4.8, gz, cx + gw, S0.y1 + GH, gz + 4)); col.floor([cx - gw, gz, cx + gw, gz + 4], S0.y1 + GH);
  bag.add('palm_trunk', box(cx - gw - 0.2, S0.y1 + 4.62, gz - 0.12, cx + gw + 0.2, S0.y1 + 4.8, gz + 0.3));
  // the stairs on up the second and third stages, each from the front edge of the stage below
  for (let i = 1; i < tops.length; i++) {
    const T = tops[i], P = tops[i - 1], foot = Math.max(P.r[1] + P.b + 0.6, i === 1 ? gz - 0.4 : -Infinity);
    stairs({ rect: [cx - 2.5, foot, cx + 2.5, T.r[1] + T.b + 0.3], y0: T.y0, y1: T.y1, dir: 's', mat: BB }, { bag, col });
  }
  // the shrine of Nanna on the top stage (§4.2)
  const tz = (tops[tops.length - 1].r[1] + tops[tops.length - 1].r[3]) / 2;
  shrine({ ...el.shrine, c: [cx, tz + 1], y: tops[tops.length - 1].y1 }, ctx);
}

/**
 * The house of the god on the ziggurat's top (docs/settlements/ur.md §4.2) { c, y, w, d, h }: a small temple of the
 * "house plan" — the entrance in the middle of the front between two towers, an antecella across the front, the
 * cella behind it on the same axis with the god's podium against its back wall and an offering table before it,
 * benches along its ends; walls of plastered mud brick broken outside by buttresses and recesses; a flat roof of
 * mud on reed matting over palm-trunk beams. Front to the north (−z).
 */
function shrine(el, { bag, col, lights }) {
  const [cx, cz] = el.c, y = el.y, W = el.w ?? 14, D = el.d ?? 11, H = el.h ?? 5, t = 1.3, ti = 1.0;
  const x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - D / 2, z1 = cz + D / 2, dw = 1.6, dh = 2.9;
  const zA = z0 + t + 3.0, zC = zA + ti;                                   // the cross wall between antecella and cella
  const wall = (r, y0 = y, y1 = y + H, m = MP) => { bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the outer walls; the front and the cross wall pierced on the axis
  wall([x0, z0, cx - dw / 2, z0 + t]); wall([cx + dw / 2, z0, x1, z0 + t]); wall([cx - dw / 2, z0, cx + dw / 2, z0 + t], y + dh, y + H);
  wall([x0, z1 - t, x1, z1]); wall([x0, z0 + t, x0 + t, z1 - t]); wall([x1 - t, z0 + t, x1, z1 - t]);
  const iw = 1.3, ih = 2.6;
  wall([x0 + t, zA, cx - iw / 2, zC]); wall([cx + iw / 2, zA, x1 - t, zC]); wall([cx - iw / 2, zA, cx + iw / 2, zC], y + ih, y + H);
  // the two towers either side of the entrance, standing proud of the front and above the roof
  const TH = H + 1.4;
  for (const s of [-1, 1]) {
    const a = cx + s * dw / 2, b = cx + s * (dw / 2 + 2.0), r = [Math.min(a, b), z0 - 1.1, Math.max(a, b), z0];
    wall(r, y, y + TH); col.floor(r, y + TH);
    bag.add(MP, box(r[0] - 0.06, y + TH - 0.35, r[1] - 0.06, r[2] + 0.06, y + TH - 0.2, r[3]));            // a band under the tower's top
  }
  // the lintel of palm trunk over the doorway, deep in its reveal between the towers; the cedar doors, open
  const lt = []; beamTris(lt, [cx - dw / 2 - 0.25, y + dh, z0 - 0.5], [cx + dw / 2 + 0.25, y + dh, z0 - 0.5], 0.14, 0.24); bag.add('palm_trunk', fromTriangles(lt));
  for (const s of [-1, 1]) {
    const q = [Math.min(cx + s * dw / 2, cx + s * (dw / 2 - 0.08)), z0 + 0.15, Math.max(cx + s * dw / 2, cx + s * (dw / 2 - 0.08)), z0 + 0.15 + dw / 2];
    bag.add('cedar', box(q[0], y + 0.06, q[1], q[2], y + dh - 0.05, q[3]));
    for (const v of [0.45, dh / 2, dh - 0.5]) bag.add('bronze', box(q[0] - 0.012, y + v - 0.05, q[1], q[2] + 0.012, y + v + 0.05, q[3]));
  }
  bag.add(BB, box(cx - dw / 2, y, z0 - 1.1, cx + dw / 2, y + 0.06, z0 + t));                            // the threshold
  // buttresses and recesses round the outside, clear of the towers
  buttresses(bag, [x0, z0, x1, z1], y, H, 0, 2.2, (px, pz) => pz < z0 + 0.01 && Math.abs(px - cx) < dw / 2 + 2.6, MP, 0.4);
  // the parapet round the roof, the roof itself: mud over reed mats over palm trunks
  for (const r of [[x0, z0, x1, z0 + 0.35], [x0, z1 - 0.35, x1, z1], [x0, z0, x0 + 0.35, z1], [x1 - 0.35, z0, x1, z1]]) bag.add(MP, box(r[0], y + H, r[1], r[2], y + H + 0.5, r[3]));
  bag.add(MP, box(x0 + 0.35, y + H - 0.25, z0 + 0.35, x1 - 0.35, y + H, z1 - 0.35)); col.floor([x0, z0, x1, z1], y + H);
  for (const [a, b] of [[z0 + t, zA], [zC, z1 - t]]) {
    bag.add('reed_mat', box(x0 + t, y + H - 0.31, a, x1 - t, y + H - 0.25, b));
    for (let x = x0 + t + 0.45; x < x1 - t - 0.2; x += 0.75) bag.add('palm_trunk', lathe([[0.13, 0], [0.13, b - a]], 8).rotateX(Math.PI / 2).translate(x, y + H - 0.44, a));
  }
  // inside: floor of baked brick; in the cella the podium of the god against the back wall, reached by two steps,
  // the emblem of Nanna on it (the crescent on its standard), the offering table, benches at the ends, a lamp
  bag.add(BB, box(x0 + t, y, z0 + t, x1 - t, y + 0.06, z1 - t));
  const pz1 = z1 - t, pz0 = pz1 - 1.5, pw = 1.9, py = y + 1.0;
  bag.add(MP, box(cx - pw, y + 0.06, pz0, cx + pw, py, pz1)); col.rect([cx - pw, pz0, cx + pw, pz1], y, py); col.floor([cx - pw, pz0, cx + pw, pz1], py);
  for (let k = 0; k < 3; k++) { const h0 = y + 0.06 + k * 0.31, d = 0.32 * (3 - k); bag.add(BB, box(cx - 1.0, h0, pz0 - d, cx + 1.0, h0 + 0.31, pz0)); }
  bag.add(MP, box(cx - pw - 0.1, py, pz1 - 0.5, cx + pw + 0.1, y + 3.2, pz1));                                  // the niche's back, raised behind the podium
  bag.add('bronze', lathe([[0.06, 0], [0.05, 0.25], [0.025, 0.3], [0.025, 1.9]], 8, null, cx, py, pz1 - 0.75));
  { const T = []; for (let i = 0; i < 14; i++) { const a0 = Math.PI * (0.08 + 0.84 * i / 14), a1 = Math.PI * (0.08 + 0.84 * (i + 1) / 14), r0 = 0.42, r1 = 0.3, P = (a, r, z) => [cx + Math.cos(a) * r, py + 1.9 + 0.38 - Math.sin(a) * r, z];
    const zz = [pz1 - 0.79, pz1 - 0.71], S = [];
    S.push(...P(a0, r0, zz[0]), ...P(a1, r0, zz[0]), ...P(a1, r1, zz[0]), ...P(a0, r0, zz[0]), ...P(a1, r1, zz[0]), ...P(a0, r1, zz[0]));
    S.push(...P(a0, r0, zz[1]), ...P(a1, r1, zz[1]), ...P(a1, r0, zz[1]), ...P(a0, r0, zz[1]), ...P(a0, r1, zz[1]), ...P(a1, r1, zz[1]));
    S.push(...P(a0, r0, zz[0]), ...P(a0, r0, zz[1]), ...P(a1, r0, zz[1]), ...P(a0, r0, zz[0]), ...P(a1, r0, zz[1]), ...P(a1, r0, zz[0]));
    S.push(...P(a0, r1, zz[0]), ...P(a1, r1, zz[1]), ...P(a0, r1, zz[1]), ...P(a0, r1, zz[0]), ...P(a1, r1, zz[0]), ...P(a1, r1, zz[1]));
    if (i === 0 || i === 13) { const a = i === 0 ? a0 : a1; S.push(...P(a, r0, zz[0]), ...P(a, r1, zz[0]), ...P(a, r1, zz[1]), ...P(a, r0, zz[0]), ...P(a, r1, zz[1]), ...P(a, r0, zz[1])); }
    T.push(...orientOutward(S)); }
    bag.add('gold', fromTriangles(T)); }
  const oz = pz0 - 1.6;
  bag.add(MP, box(cx - 0.55, y + 0.06, oz - 0.35, cx + 0.55, y + 0.9, oz + 0.35)); col.rect([cx - 0.55, oz - 0.35, cx + 0.55, oz + 0.35], y, y + 0.9);
  for (const dx of [-0.3, 0, 0.3]) bag.add('terracotta', lathe([[0.001, 0], [0.08, 0.01], [0.12, 0.06], [0.11, 0.07], [0.001, 0.03]], 10, null, cx + dx, y + 0.9, oz));
  for (const s of [-1, 1]) { const r = s < 0 ? [x0 + t, zC, x0 + t + 0.55, pz1] : [x1 - t - 0.55, zC, x1 - t, pz1]; bag.add(BB, box(r[0], y + 0.06, r[1], r[2], y + 0.45, r[3])); col.rect(r, y, y + 0.45); }
  lights.push({ at: [cx + 1.4, y + 1.2, oz], color: '#ffb46b', intensity: 4, distance: 7 });
  bag.add('terracotta', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.05], [0.04, 0.06]], 10, null, cx + 1.4, y + 0.9, oz));
  bag.add(MP, box(cx + 1.2, y + 0.06, oz - 0.2, cx + 1.6, y + 0.9, oz + 0.2));
}

/** The build context seen in a mirror across the line z = cz: what is built north of it lands south, the stairs turned. */
function mirrored(ctx, cz) {
  const fz = (r) => [r[0], 2 * cz - r[3], r[2], 2 * cz - r[1]];
  const bag = {
    add(mat, g) {
      if (!g) return;
      g = g.index ? g.toNonIndexed() : g;
      const P = g.attributes.position.array, N = g.attributes.normal.array;
      for (let i = 0; i < P.length; i += 3) { P[i + 2] = 2 * cz - P[i + 2]; N[i + 2] = -N[i + 2]; }
      for (let i = 0; i < P.length; i += 9) for (let k = 0; k < 3; k++) { let t = P[i + 3 + k]; P[i + 3 + k] = P[i + 6 + k]; P[i + 6 + k] = t; t = N[i + 3 + k]; N[i + 3 + k] = N[i + 6 + k]; N[i + 6 + k] = t; }
      g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
      ctx.bag.add(mat, g);
    },
  };
  const col = {
    rect: (r, y0, y1) => ctx.col.rect(fz(r), y0, y1),
    floor: (r, y, tag) => ctx.col.floor(fz(r), y, tag),
    ramp: (r, y0, y1, dir) => ctx.col.ramp(fz(r), y0, y1, dir === 'n' ? 's' : dir === 's' ? 'n' : dir),
    segment: (a, b, th, y0, y1) => ctx.col.segment([a[0], 2 * cz - a[1]], [b[0], 2 * cz - b[1]], th, y0, y1),
    circle: (x, z, r, y0, y1) => ctx.col.circle(x, 2 * cz - z, r, y0, y1),
  };
  return { ...ctx, bag, col };
}

/** precinct_wall: a buttressed mud-brick wall a→b { h, th }, plastered, its top a walk. */
function precinctWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 6, th = el.th ?? 3, t = [], y = el.y ?? 0;
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h); bag.add(el.mat ?? MB, fromTriangles(t));
  col.segment(a, b, th, y, y + h);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 4);
  for (let i = 1; i < n; i++) for (const s of [-1, 1]) {
    const px = a[0] + ux * i * L / n - uz * s * (th / 2 + 0.25), pz = a[1] + uz * i * L / n + ux * s * (th / 2 + 0.25), q = [];
    beamTris(q, [px - ux * 0.6, y, pz - uz * 0.6], [px + ux * 0.6, y, pz + uz * 0.6], 0.25, h - 0.1); bag.add(el.mat ?? MB, fromTriangles(q));
  }
}

/** courtyard_block: a great courtyard building { rect, h, ring (depth of the rooms), door ('n'|'s'|'e'|'w') }: rooms round an open court, buttressed outer walls, flat roofs. */
function courtyardBlock(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 6, d = el.ring ?? 10, m = el.mat ?? MP;
  const door = el.door || 's', xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, dc = door === 'n' || door === 's' ? xc : zc;
  const dw = Math.min(3.2, d * 0.3), dh = Math.min(h - 1.5, 4.2), dep = Math.min(1.4, d * 0.2);
  const wings = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] };
  for (const [f, r] of Object.entries(wings)) {
    // the gateway: a deep doorway in the middle of its side
    niched(bag, r, h, f, f === door ? [{ u0: dc - dw / 2, u1: dc + dw / 2, v0: -0.3, v1: dh, depth: dep }] : [], m, m, 0);
    col.rect(r, 0, h); col.floor(r, h);
  }
  // shallow buttresses, and at the gateway two towers projecting either side of it (Koldewey on Esagila: a great
  // gateway in the middle of each side between massive projecting towers)
  const tw = Math.min(4, d * 0.4), pr = 1.6, H = h + 1.5;
  buttresses(bag, [x0, z0, x1, z1], 0, h, 0, 3.5, (px, pz) => Math.abs((door === 'n' || door === 's' ? px : pz) - dc) < dw / 2 + tw + 1 && (door === 'n' ? pz <= z0 + 0.01 : door === 's' ? pz >= z1 - 0.01 : door === 'w' ? px <= x0 + 0.01 : px >= x1 - 0.01));
  const P = (u, v, w) => (door === 'n' ? [u, v, z0 + w] : door === 's' ? [u, v, z1 - w] : door === 'w' ? [x0 + w, v, u] : [x1 - w, v, u]);
  const pl = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); const q = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; bag.add(mat, box(q[0], a[1], q[1], q[2], b[1], q[3])); return q; };
  for (const sx of [-1, 1]) {
    const u0 = sx < 0 ? dc - dw / 2 - tw : dc + dw / 2, q = pl(m, u0, -0.3, u0 + tw, H, -pr, 0.4);
    col.rect(q, 0, H); col.floor(q, H);
    for (const k of [0.3, 0.7]) pl(m, u0 + k * tw - 0.3, -0.3, u0 + k * tw + 0.3, H - 0.1, -pr - 0.2, -pr + 0.05);   // its own buttresses
  }
  pl(m, dc - dw / 2, dh + 0.4, dc + dw / 2, h, -pr, 0);                                                  // the gateway's lintel mass between the towers
  // the doors: two leaves of cedar bound with bronze at the back of the doorway, a brick threshold
  pl('cedar', dc - dw / 2 + 0.02, 0.1, dc + dw / 2 - 0.02, dh, dep - 0.08, dep);
  for (const v of [0.5, dh / 2, dh - 0.5]) pl('bronze', dc - dw / 2 + 0.02, v - 0.07, dc + dw / 2 - 0.02, v + 0.07, dep - 0.1, dep - 0.08);
  pl('lacquer_black', dc - 0.02, 0.1, dc + 0.02, dh, dep - 0.1, dep - 0.08);
  pl(BB, dc - dw / 2, -0.3, dc + dw / 2, 0.1, -pr, dep - 0.08);
  bag.add(BB, box(x0 + d, 0, z0 + d, x1 - d, 0.08, z1 - d));
}

/**
 * A solid wing r = [x0, z0, x1, z1] from 0 to h with rectangular niches cut into its `face` (n|s|w|e): each
 * { u0, u1 (along the face), v0, v1 (up), depth }. Built in two materials: `low` up to `base`, `up` above it.
 */
function niched(bag, r, h, face, niches, low, up, base) {
  const [x0, z0, x1, z1] = r, alongX = face === 'n' || face === 's', A = alongX ? x0 : z0, Bn = alongX ? x1 : z1;
  const add = (q, y0, y1) => {
    if (y1 - y0 < 1e-3) return;
    if (y0 < base) bag.add(low, box(q[0], y0, q[1], q[2], Math.min(base, y1), q[3]));
    if (y1 > base) bag.add(up, box(q[0], Math.max(base, y0), q[1], q[2], y1, q[3]));
  };
  // q from an interval along the face and a depth range measured in from the face
  const slab = (u0, u1, d0, d1) => {
    if (face === 'n') return [u0, z0 + d0, u1, z0 + d1]; if (face === 's') return [u0, z1 - d1, u1, z1 - d0];
    if (face === 'w') return [x0 + d0, u0, x0 + d1, u1]; return [x1 - d1, u0, x1 - d0, u1];
  };
  const T = alongX ? z1 - z0 : x1 - x0, list = niches.filter((o) => o.u0 > A && o.u1 < Bn).sort((p, q) => p.u0 - q.u0);
  let u = A;
  for (const o of list) {
    add(slab(u, o.u0, 0, T), -0.3, h);
    add(slab(o.u0, o.u1, o.depth, T), -0.3, h);
    add(slab(o.u0, o.u1, 0, o.depth), -0.3, o.v0); add(slab(o.u0, o.u1, 0, o.depth), o.v1, h);
    u = o.u1;
  }
  add(slab(u, Bn, 0, T), -0.3, h);
}

/**
 * ur_house: a courtyard house { rect, seed } (Woolley's houses at Ur): rooms round a court paved in brick, one or
 * two storeys; the walls of baked brick in their lower courses and plastered mud brick above, some whitewashed;
 * blank to the lane but for a narrow doorway with a wooden door and lintel, and in two-storey houses a few small
 * latticed windows above; projecting gutters at the roof; a flat roof with a low parapet; a stair of brick in the
 * court to the roof or to the wooden gallery that runs round the court of a two-storey house.
 */
function urHouse(el, ctx) {
  if (el.open) return urHouseOpen(el, ctx);
  const { bag, col } = ctx;
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  const d = Math.min(3.8, Math.min(W, D) * 0.3), two = rand() < 0.45, H = two ? 6 : 3.4;
  const up = rand() < 0.3 ? 'limewash_white' : MP, base = 0.8 + Math.round(rand() * 3) * 0.15;
  const side = Math.floor(rand() * 4), faces = ['n', 's', 'w', 'e'];
  const wings = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] };
  // the doorway near a corner of its side (the lobby turns the visitor away from the court), windows above
  const span = (f) => (f === 'n' || f === 's' ? [x0 + 0.8, x1 - 0.8] : [z0 + d + 0.8, z1 - d - 0.8]);
  const [s0, s1] = span(faces[side]), du = s0 + (rand() < 0.5 ? 0.25 : 0.75) * (s1 - s0);
  const door = { u0: du - 0.5, u1: du + 0.5, v0: -0.3, v1: 2.1, depth: 0.3 };
  for (const f of faces) {
    const r = wings[f], niches = [];
    if (f === faces[side]) niches.push(door);
    if (two && (f === 'n' || f === 's' ? W : D) > 7 && rand() < 0.7) {
      const [a, b] = span(f);
      for (const k of [0.1, 0.9]) { const c = a + k * (b - a); if (f === faces[side] && Math.abs(c - du) < 1.2) continue; niches.push({ u0: c - 0.3, u1: c + 0.3, v0: 4.1, v1: 4.75, depth: 0.12, win: true }); }
    }
    niched(bag, r, H, f, niches, BB, up, base);
    col.rect(r, 0, H); col.floor(r, H);
    for (const o of niches) {
      const P = (u, v, w) => (f === 'n' ? [u, v, z0 + w] : f === 's' ? [u, v, z1 - w] : f === 'w' ? [x0 + w, v, u] : [x1 - w, v, u]);
      const pl = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
      if (o.win) { pl('lattice', o.u0, o.v0, o.u1, o.v1, o.depth - 0.04, o.depth); pl('cedar', o.u0 - 0.06, o.v0 - 0.08, o.u1 + 0.06, o.v0, -0.06, 0.02); continue; }
      pl('cedar', o.u0 + 0.01, 0.12, o.u1 - 0.01, o.v1, o.depth - 0.06, o.depth);        // the door, at the back of its reveal
      pl('cedar', o.u0 - 0.15, o.v1, o.u1 + 0.15, o.v1 + 0.16, -0.03, 0.02);            // the lintel, set in the wall face
      pl(BB, o.u0, -0.3, o.u1, 0.12, 0, o.depth);                                       // the threshold
    }
  }
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.15, 0.5); bag.add(up, fromTriangles(t)); }
  // eye-level dress and weather, and the life of the roof (docs/settlements/ur.md §5.6): full near the core, the door's and a patch far out
  const lod = el.lod ?? 1;
  if (lod > 0) dressFront(ctx, { rect: el.rect, face: faces[side], dc: du, trade: el.trade, seed: el.seed, foot: base, H, near: lod > 1 });
  if (lod > 1) roofLife(ctx, { wings: Object.values(wings), y: H, seed: el.seed });
  // gutters: short clay spouts through the parapet on to the lane
  for (const f of faces) {
    if (rand() < 0.35) continue;
    const l = f === 'n' || f === 's' ? W : D, a = (f === 'n' || f === 's' ? x0 : z0) + (0.35 + rand() * 0.3) * l, y = H + 0.05;
    const q = f === 'n' ? [a - 0.08, z0 - 0.55, a + 0.08, z0 + 0.2] : f === 's' ? [a - 0.08, z1 - 0.2, a + 0.08, z1 + 0.55] : f === 'w' ? [x0 - 0.55, a - 0.08, x0 + 0.2, a + 0.08] : [x1 - 0.2, a - 0.08, x1 + 0.55, a + 0.08];
    bag.add('terracotta', box(q[0], y, q[1], q[2], y + 0.13, q[3]));
  }
  // the court: brick paving sloping to a drain in the middle
  const ci = [x0 + d, z0 + d, x1 - d, z1 - d], cw = ci[2] - ci[0], cd = ci[3] - ci[1], cx = (ci[0] + ci[2]) / 2, cz = (ci[1] + ci[3]) / 2;
  bag.add(BB, box(ci[0], 0, ci[1], ci[2], 0.06, ci[3]));
  bag.add('opening', box(cx - 0.18, 0.06, cz - 0.18, cx + 0.18, 0.065, cz + 0.18));
  if (Math.max(cw, cd) < 2.6) return;
  // the stair along the court's longer side, against the north (or west) range, rising east (or south)
  const alongX = cw >= cd, top = two ? 3.0 : H, run = alongX ? cw : cd;
  if (run >= top / 0.85) {
    const sr = alongX ? [ci[0], ci[1], ci[2] - (two ? 0.9 : 0), ci[1] + 0.8] : [ci[0], ci[1], ci[0] + 0.8, ci[3] - (two ? 0.9 : 0)];
    stairs({ rect: sr, y0: 0.06, y1: top, dir: alongX ? 'e' : 's', mat: BB }, { bag, col });
  }
  if (!two || Math.min(cw, cd) < 3.4) return;
  // the gallery on posts round the other three sides at the upper floor, with its rail
  const g = 0.9, Y = 3.0, ring = alongX
    ? [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[0], ci[1] + 0.8, ci[0] + g, ci[3] - g], [ci[2] - g, ci[1], ci[2], ci[3] - g]]
    : [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[2] - g, ci[1], ci[2], ci[3] - g], [ci[0] + 0.8, ci[1], ci[2] - g, ci[1] + g]];
  for (const r of ring) { bag.add('timber', box(r[0], Y - 0.12, r[1], r[2], Y, r[3])); col.floor(r, Y); }
  const inner = alongX ? [ci[0] + g, ci[1] + 0.92, ci[2] - g, ci[3] - g] : [ci[0] + 0.92, ci[1] + g, ci[2] - g, ci[3] - g];
  for (const [px, pz] of [[inner[0], inner[1]], [inner[2], inner[1]], [inner[0], inner[3]], [inner[2], inner[3]]]) {
    bag.add('timber', box(px - 0.09, 0.06, pz - 0.09, px + 0.09, Y + 0.95, pz + 0.09)); col.rect([px - 0.09, pz - 0.09, px + 0.09, pz + 0.09], 0, Y + 0.95);
  }
  for (const [a, b] of [[[inner[0], inner[1]], [inner[2], inner[1]]], [[inner[0], inner[3]], [inner[2], inner[3]]], [[inner[0], inner[1]], [inner[0], inner[3]]], [[inner[2], inner[1]], [inner[2], inner[3]]]]) {
    if (alongX ? a[1] === inner[1] && b[1] === inner[1] : a[0] === inner[0] && b[0] === inner[0]) continue;   // the stair side stays open
    const t = []; beamTris(t, [a[0], Y + 0.85, a[1]], [b[0], Y + 0.85, b[1]], 0.05, 0.1); bag.add('timber', fromTriangles(t));
  }
}

/**
 * terrace: { rect, h, batter, gap: [x0, x1] (an opening on the north face for a stair) } — the ziggurat's terrace:
 * a massive retaining wall of mud brick, buttressed and sloping sharply inwards, with rows of clay cones set in
 * its face, their round heads forming a band (Penn Museum Journal, Woolley's report on Ur-Nammu's terrace wall).
 */
function terrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 2.5, b = el.batter ?? 0.6, y = el.y ?? 0;
  bag.add(MB, frustum([x0, z0, x1, z1], y - 0.3, y + h, b, b, b, b, { noBottom: true }));
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0 + b, z0 + b, x1 - b, z1 - b], y + h);
  const gap = el.gap, inGap = (px, pz) => gap && pz < z0 + 0.1 && px > gap[0] - 1 && px < gap[1] + 1;
  buttresses(bag, [x0, z0, x1, z1], y - 0.3, h + 0.3, b, 4, inGap);
  // the cones: two rows of round heads near the top of each face, following its slope
  const head = lathe([[0.06, 0], [0.055, 0.03], [0.03, 0.05], [0.001, 0.055]], 8);
  for (const [f, a0, a1] of [['n', x0, x1], ['s', x0, x1], ['w', z0, z1], ['e', z0, z1]]) {
    const n = Math.floor((a1 - a0 - 1) / 0.32);
    for (const v of [h - 0.55, h - 0.85]) for (let i = 0; i <= n; i++) {
      const u = a0 + 0.5 + i * (a1 - a0 - 1) / n, o = b * (v / h), g = head.clone();
      if (f === 'n' && inGap(u, z0)) continue;
      // tilted back with the slope of the face
      const tilt = Math.atan2(b, h);
      if (f === 'n') g.rotateX(-Math.PI / 2 + tilt).translate(u, y + v, z0 + o);
      else if (f === 's') g.rotateX(Math.PI / 2 - tilt).translate(u, y + v, z1 - o);
      else if (f === 'w') g.rotateZ(Math.PI / 2 - tilt).translate(x0 + o, y + v, u);
      else g.rotateZ(-Math.PI / 2 + tilt).translate(x1 - o, y + v, u);
      bag.add('terracotta', g);
    }
  }
}

/**
 * gate_tower: { rect, door ('n'|'s'|'e'|'w': the passage runs across the tower from this side), w (the passage), h,
 * dh (the doorway) } — a massive gate tower of baked brick (the Edublalmah, the gate before the ziggurat
 * stair): a passage through it with doorways at both ends, cedar doors, buttressed faces.
 */
function gateTower(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 9, w = el.w ?? 3, dh = el.dh ?? 4.2, ns = (el.door ?? 'n') === 'n' || el.door === 's';
  const c = ns ? (x0 + x1) / 2 : (z0 + z1) / 2, m = el.mat ?? BB;
  const parts = ns ? [[x0, z0, c - w / 2, z1], [c + w / 2, z0, x1, z1]] : [[x0, z0, x1, c - w / 2], [x0, c + w / 2, x1, z1]];
  for (const r of parts) { bag.add(m, frustum(r, -0.3, h, 0, 0, 0, 0, { noBottom: true })); col.rect(r, 0, h); col.floor(r, h); }
  const over = ns ? [c - w / 2, z0, c + w / 2, z1] : [x0, c - w / 2, x1, c + w / 2];
  bag.add(m, box(over[0], dh, over[1], over[2], h, over[3])); col.rect(over, dh, h); col.floor(over, h);
  bag.add(BB, frustum(over, -0.3, 0.1, 0, 0, 0, 0, { noBottom: true })); col.floor(over, 0.1);
  buttresses(bag, [x0, z0, x1, z1], -0.3, h + 0.3, 0, 2.6, (px, pz) => (ns ? Math.abs(px - c) < w / 2 + 0.8 : Math.abs(pz - c) < w / 2 + 0.8));
  // the doors, standing open against the passage walls a little way in
  const e = ns ? z0 : x0;
  for (const sx of [-1, 1]) {
    const q = ns ? [c + sx * (w / 2) - (sx > 0 ? 0.1 : 0), e + 0.6, c + sx * (w / 2) + (sx < 0 ? 0.1 : 0), e + 0.6 + w / 2] : [e + 0.6, c + sx * (w / 2) - (sx > 0 ? 0.1 : 0), e + 0.6 + w / 2, c + sx * (w / 2) + (sx < 0 ? 0.1 : 0)];
    const qq = ns ? [Math.min(q[0], q[2]), q[1], Math.max(q[0], q[2]), q[3]] : [q[0], Math.min(q[1], q[3]), q[2], Math.max(q[1], q[3])];
    bag.add('cedar', box(qq[0], 0.1, qq[1], qq[2], dh - 0.05, qq[3]));
    for (const v of [0.5, dh / 2, dh - 0.55]) bag.add('bronze', ns ? box(qq[0] - (sx > 0 ? 0.02 : 0), v - 0.07, qq[1], qq[2] + (sx < 0 ? 0.02 : 0), v + 0.07, qq[3]) : box(qq[0], v - 0.07, qq[1] - (sx > 0 ? 0.02 : 0), qq[2], v + 0.07, qq[3] + (sx < 0 ? 0.02 : 0)));
  }
}

/**
 * reed_boat: a boat of the Euphrates (docs/settlements/ur.md §6.1) { at, dir ([dx, dz] toward the bow), len, y (the
 * water), seed, cargo }: a long narrow hull of reed bundles coated with bitumen, open, its ends drawn up into high
 * horns curving inboard, the bundles bound with cord at intervals; thwarts across it, a punting pole, and a load of
 * jars or bundled reeds in some.
 */
function reedBoat(el, { bag }) {
  const L = el.len ?? 8, B = el.beam ?? L * 0.16, [X0, Z0] = el.at, Y0 = el.y ?? 0, rand = rng(el.seed ?? Math.floor(X0 * 13 + Z0 * 7));
  const dl = Math.hypot(el.dir?.[0] ?? 0, el.dir?.[1] ?? 1) || 1, ux = (el.dir?.[0] ?? 0) / dl, uz = (el.dir?.[1] ?? 1) / dl;
  // local frame: z from the bow (−L/2) to the stern (+L/2), x across, y up from the water
  const W = (x, y, z) => [X0 - ux * z - uz * x, Y0 + y, Z0 - uz * z + ux * x];
  const parts = { bitumen: [], reed_mat: [], timber: [], terracotta: [] };
  const wid = (t) => B / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 2.6)), 0.5) + 0.05;
  const gun = (t) => 0.35 + 0.25 * t * t, keel = -0.32;
  // the hull: U-shaped sections, the outer skin from gunwale to gunwale and the inner face back, a floor of reeds inside
  const rings = [];
  for (let i = 0; i <= 28; i++) {
    const t = -0.92 + 1.84 * i / 28, w = wid(t), g = gun(t), r = [], th = Math.min(0.12, w * 0.4);
    for (let j = 0; j <= 10; j++) { const a = Math.PI * j / 10; r.push([Math.cos(a) * w, g - Math.sin(a) * (g - keel * (1 - t * t * 0.6)), t * L / 2]); }
    for (let j = 10; j >= 0; j--) { const a = Math.PI * j / 10; r.push([Math.cos(a) * (w - th), Math.max(0.02, g - Math.sin(a) * (g - keel * (1 - t * t * 0.6))) + (j === 0 || j === 10 ? 0 : th * 0.6), t * L / 2]); }
    rings.push(r);
  }
  parts.bitumen.push(loft(rings));
  // the horns: the hull's ends gathered into a tapering bundle rising and curving in over the boat, bound with cord
  for (const e of [-1, 1]) {
    const hgt = e < 0 ? 1.9 : 1.6, pts = [];
    for (let k = 0; k <= 8; k++) { const f = k / 8, a = f * Math.PI * 0.62; pts.push([0, gun(0.92) - 0.1 + Math.sin(a) * hgt * 0.95, e * (L / 2 * 0.92 + Math.sin(a * 0.9) * 0.6 - (1 - Math.cos(a)) * 0.9)]); }
    const rr = (f) => wid(0.92) * 0.75 * (1 - f * 0.7) + 0.02;
    const frame = (k) => { const q = pts[Math.min(8, k + 1)], o = pts[Math.max(0, k - 1)], d = [q[1] - o[1], q[2] - o[2]], l = Math.hypot(...d) || 1; return [0, -d[1] / l, d[0] / l]; };
    parts.bitumen.push(loft(pts.map((p, k) => ring(p, [1, 0, 0], frame(k), rr(k / 8), rr(k / 8), 10))));
    for (let k = 1; k < 8; k += 1.5) {
      const i = Math.floor(k), p = pts[i], n = frame(i), r = rr(i / 8) + 0.015, v = [0, n[2], -n[1]];
      parts.reed_mat.push(loft([-0.04, 0.04].map((o) => ring([p[0], p[1] + v[1] * o, p[2] + v[2] * o], [1, 0, 0], n, r, r, 10))));
    }
  }
  // thwarts across the hull, a floor of reed mats, the punting pole along the side
  for (const t of [-0.45, -0.1, 0.25, 0.55]) { const w = wid(t) - 0.05, z = t * L / 2; parts.timber.push(box(-w, gun(t) - 0.12, z - 0.09, w, gun(t) - 0.04, z + 0.09)); }
  parts.reed_mat.push(box(-B * 0.28, 0.06, -L * 0.3, B * 0.28, 0.1, L * 0.3));
  { const T = []; beamTris(T, [B / 2 - 0.15, gun(0) + 0.03, -L * 0.42], [B / 2 - 0.25, gun(0) + 0.1, L * 0.5], 0.03, 0.06); parts.timber.push(fromTriangles(T)); }
  // the load: jars bedded on the mats, or bundles of reeds
  const cargo = el.cargo ?? (rand() < 0.4 ? 'jars' : rand() < 0.5 ? 'reeds' : 'none');
  if (cargo === 'jars') for (let k = 0; k < 6; k++) {
    const z = (-0.25 + (k >> 1) * 0.2) * L / 2 * 1.4, x = (k & 1 ? 1 : -1) * B * 0.14;
    parts.terracotta.push(lathe([[0.001, 0], [0.12, 0.05], [0.2, 0.25], [0.18, 0.45], [0.09, 0.55], [0.1, 0.62], [0.001, 0.6]], 10, null, x, 0.1, z));
  }
  if (cargo === 'reeds') for (let k = 0; k < 4; k++) {
    const T = []; beamTris(T, [-B * 0.2 + k * B * 0.13, 0.1, -L * 0.22], [-B * 0.2 + k * B * 0.13, 0.12, L * 0.22], 0.08, 0.16); parts.reed_mat.push(fromTriangles(T));
  }
  for (const [mat, list] of Object.entries(parts)) for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0, P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) {
      const w = W(P.getX(i), P.getY(i), P.getZ(i)); P.setXYZ(i, w[0], w[1], w[2]);
      const nx = N.getX(i), nz = N.getZ(i); N.setXYZ(i, -uz * nx - ux * nz, N.getY(i), ux * nx - uz * nz);
    }
    bag.add(mat, g);
  }
}

registerStyle('sumerian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ziggurat, precinct_wall: precinctWall, courtyard_block: courtyardBlock, ur_house: urHouse, giparu, ur_chapel: urChapel, reed_boat: reedBoat, terrace, gate_tower: gateTower, stairs, scribe_kit: scribeKit, quay_goods: quayGoods },
  objects: {},
});
