// The Tigris and the Isa canal (docs/settlements/abbasid-baghdad.md §9): the river's water, the bridges of boats (a line of hulls side by
// side under a plank deck, cabled to the banks), jetties on palm piles, the boats at their moorings (the zawraq, the round quffa, the
// cargo barge), the canal between brick quays and its arched bridges.

import { box, fromTriangles, lathe, rod } from '../../core/geom.js';
import { local, rng, polyGeo, archPoly, wallRun, merlons, archBand } from './kit.js';

const upward = (out) => { for (let i = 0; i < out.length; i += 9) { const ux = out[i + 3] - out[i], uz = out[i + 5] - out[i + 2], vx = out[i + 6] - out[i], vz = out[i + 8] - out[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = out[i + 3 + k]; out[i + 3 + k] = out[i + 6 + k]; out[i + 6 + k] = t; } } return out; };
const sq = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);

/** tigris: { pts: [[x, z]…] the river's middle line (north to south), w, y } — a strip of water. */
function tigris(el, { bag }) {
  const out = [];
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const [ax, az] = el.pts[i], [bx, bz] = el.pts[i + 1], h = el.w / 2;
    sq(out, [ax - h, el.y, az], [bx - h, el.y, bz], [bx + h, el.y, bz], [ax + h, el.y, az]);
  }
  bag.add('water', fromTriangles(upward(out)));
}

/**
 * A boat's hull, lofted from stems: length L (along z, bow at −z), beam B, depth D, sheer S (the rise of bow and stern). Returns triangles
 * of the outer skin, two-sided by the caller; a gunwale rail and ribs on top.
 */
function hull(L, B, D, S, y = 0) {
  const n = 14, out = [], prof = (t) => {
    const k = Math.max(0, 1 - Math.abs(t) ** 2.4), b = B / 2 * Math.pow(k, 0.55), top = y + D * 0.5 + S * Math.abs(t) ** 3;
    return [[0, y - D * 0.5], [b * 0.7, y - D * 0.32], [b, y + D * 0.0], [b, top]];
  };
  for (let i = 0; i < n; i++) {
    const t0 = -1 + 2 * i / n, t1 = -1 + 2 * (i + 1) / n, z0 = t0 * L / 2, z1 = t1 * L / 2, p0 = prof(t0), p1 = prof(t1);
    for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) {
      const a = [sd * p0[j][0], p0[j][1], z0], b = [sd * p0[j + 1][0], p0[j + 1][1], z0], c = [sd * p1[j + 1][0], p1[j + 1][1], z1], d = [sd * p1[j][0], p1[j][1], z1];
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  return { tris: out, prof };
}
const dbl = (t) => { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); };

/** A zawraq: the long Tigris boat, bitumen-black, high stem and stern; thwarts; optionally a load. In the local frame at the origin (waterline y = 0). */
export function zawraq(bag, { L = 9, B = 2.5, load = null, rand = rng(1), y = 0, mast = false } = {}) {
  const D = 1.0, S = 0.7, { tris, prof } = hull(L, B, D, S, y);
  bag.add('bitumen', dbl(tris));
  const n = 14;
  // the gunwale: a plank along each side, the thwarts across, a floor of boards
  for (const sd of [-1, 1]) for (let i = 0; i < n; i++) {
    const t0 = -1 + 2 * i / n, t1 = -1 + 2 * (i + 1) / n, a = prof(t0)[3], b = prof(t1)[3], z0 = t0 * L / 2, z1 = t1 * L / 2;
    bag.add('timber', fromTriangles(upward([sd * (a[0] - 0.06), a[1] + 0.05, z0, sd * (a[0] + 0.06), a[1] + 0.05, z0, sd * (b[0] + 0.06), b[1] + 0.05, z1, sd * (a[0] - 0.06), a[1] + 0.05, z0, sd * (b[0] + 0.06), b[1] + 0.05, z1, sd * (b[0] - 0.06), b[1] + 0.05, z1].map((v, i2) => (i2 % 3 === 0 ? v : v)))));
  }
  bag.add('timber', box(-B * 0.32, y - D * 0.3, -L * 0.42, B * 0.32, y - D * 0.3 + 0.05, L * 0.42));
  for (let k = -3; k <= 3; k++) { if (k === 0 && load) continue; bag.add('cedar', box(-B * 0.48, y + D * 0.12, k * L * 0.12 - 0.07, B * 0.48, y + D * 0.12 + 0.07, k * L * 0.12 + 0.07)); }
  if (load === 'sacks') for (let k = 0; k < 7; k++) bag.add('sacking', box(-0.5 + (k % 2) * 0.55, y - D * 0.3 + 0.05, -1.4 + Math.floor(k / 2) * 0.62, -0.02 + (k % 2) * 0.55, y - D * 0.3 + 0.55, -0.85 + Math.floor(k / 2) * 0.62));
  if (load === 'jars') for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.32, 0.4], [0.2, 0.8], [0.22, 0.86], [0.001, 0.82]], 9, null, -0.4 + (k % 2) * 0.8, y - D * 0.3 + 0.05, -1.6 + Math.floor(k / 2) * 0.9));
  if (load === 'melons') for (let k = 0; k < 14; k++) bag.add(k % 3 ? 'palm_leaf' : 'cloth_ochre', lathe(Array.from({ length: 5 }, (_, i) => { const t = i / 4 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.17), 0.17 - Math.cos(t) * 0.17]; }), 8, null, -0.6 + (k % 4) * 0.4, y - D * 0.3 + 0.1 + Math.floor(k / 8) * 0.25, -1.1 + Math.floor((k % 8) / 4) * 0.4 + Math.floor(k / 8) * 0.1));
  if (mast) { bag.add('cedar', lathe([[0.07, 0], [0.05, 5.0], [0.001, 5.05]], 8, null, 0, y - D * 0.3, -L * 0.18)); bag.add('cloth_white', fromTriangles([0, y + 4.6, -L * 0.18, 0, y + 1.6, -L * 0.18, 2.4, y + 1.6, -L * 0.18 + 0.2, 0, y + 4.6, -L * 0.18, 2.4, y + 1.6, -L * 0.18 + 0.2, 0.2, y + 4.7, -L * 0.18 + 0.05, 0, y + 4.6, -L * 0.18, 2.4, y + 1.6, -L * 0.18 + 0.2, 0, y + 1.6, -L * 0.18])); }
  void rand;
}

/** A quffa: the round pitch-coated basket-boat of the Tigris, a woven bowl 2.4 m across, with its paddle. */
export function quffa(bag, { r = 1.2, y = 0, rand = rng(2), cargo = false } = {}) {
  bag.add('bitumen', lathe([[0.001, -0.42], [r * 0.5, -0.4], [r * 0.82, -0.24], [r * 0.98, 0.0], [r, 0.25], [r * 0.98, 0.28]], 18, null, 0, y, 0));
  bag.add('wicker', lathe([[r * 0.96, 0.27], [r * 0.9, 0.0], [r * 0.5, -0.32], [0.001, -0.36]], 18, null, 0, y, 0));
  bag.add('bitumen', lathe([[r * 1.01, 0.22], [r * 1.0, 0.31], [r * 0.93, 0.31], [r * 0.94, 0.24]], 18, null, 0, y, 0));
  if (cargo) for (let k = 0; k < 4; k++) bag.add('sacking', box(-0.4 + (k % 2) * 0.45, y - 0.3, -0.45 + Math.floor(k / 2) * 0.55, 0.0 + (k % 2) * 0.45, y + 0.1, 0.05 + Math.floor(k / 2) * 0.55));
  bag.add('timber', rod([r * 0.4, y + 0.3, -r * 0.2], [r * 1.5, y + 0.9, -r * 0.55], 0.03, 6)); bag.add('timber', box(r * 1.35, y + 0.75, -r * 0.62, r * 1.7, y + 1.0, -r * 0.42));
  void rand;
}

/** moored_boat: { at: [x, z], rot (radians), kind: 'zawraq'|'quffa'|'barge', y (waterline), load, seed } */
function moored(el, ctx) {
  local(ctx, el.at, el.rot ?? 0, (c) => {
    const rand = rng(el.seed ?? 1);
    if (el.kind === 'quffa') quffa(c.bag, { y: el.y ?? 0, r: 1.0 + rand() * 0.5, rand, cargo: !!el.load });
    else zawraq(c.bag, { L: el.L ?? 8 + rand() * 3, B: el.B ?? 2.4 + rand() * 0.3, y: el.y ?? 0, load: el.load ?? null, rand, mast: el.mast });
  });
}

/** jetty: { a: [x, z], len, w, y (deck), bed, dir (+1: into +x) } — planks on palm-trunk piles, a bollard post at the end; walkable. */
function jetty(el, { bag, col }) {
  const [ax, az] = el.a, d = el.dir ?? 1, x1 = ax + d * el.len, lo = Math.min(ax, x1), hi = Math.max(ax, x1), w = el.w ?? 2.2;
  bag.add('timber', box(lo, el.y - 0.12, az - w / 2, hi, el.y, az + w / 2));
  for (let x = lo + 0.3; x < hi; x += 0.32) bag.add('cedar', box(x, el.y, az - w / 2, x + 0.2, el.y + 0.04, az + w / 2));
  for (let x = lo + 0.3; x <= hi - 0.2; x += 2.4) for (const s of [-1, 1]) bag.add('palm_trunk', lathe([[0.13, 0], [0.12, el.y - el.bed - 0.12], [0.001, el.y - el.bed - 0.12]], 7, null, x, el.bed, az + s * (w / 2 - 0.15)));
  bag.add('cedar', lathe([[0.1, 0], [0.09, 0.7], [0.001, 0.72]], 7, null, d > 0 ? hi - 0.2 : lo + 0.2, el.y, az - w / 2 + 0.15)); bag.add('cedar', lathe([[0.1, 0], [0.09, 0.7], [0.001, 0.72]], 7, null, d > 0 ? hi - 0.2 : lo + 0.2, el.y, az + w / 2 - 0.15));
  col.floor([lo, az - w / 2, hi, az + w / 2], el.y);
}

/**
 * boat_bridge: { a: [x, z], b: [x, z] (west landing to east; the river runs along z), w (deck width), y (deck), water, bed, seed } — about 4.4 m
 * between boats, each a zawraq lying with the stream, a deck of planks on beams across them, rails of rope on posts, the
 * landings of timber, a guard-post at the west end with a green dome (the toll and the post of the bridge's watch).
 */
function boatBridge(el, ctx) {
  const [ax, az] = el.a, [bx] = el.b, w = el.w ?? 4.4, y = el.y, wy = el.water, rand = rng(el.seed ?? 5);
  local(ctx, [0, az], 0, (c) => {
    const { bag, col } = c, lo = Math.min(ax, bx), hi = Math.max(ax, bx), nb = Math.floor((hi - lo) / 4.4);
    // the deck: beams across the boats, planks along the bridge
    bag.add('timber', box(lo, y - 0.3, -w / 2, hi, y - 0.12, w / 2)); bag.add('cedar', box(lo, y - 0.12, -w / 2, hi, y, w / 2));
    for (let x = lo + 0.15; x < hi - 0.1; x += 0.34) bag.add('timber', box(x, y, -w / 2, x + 0.28, y + 0.05, w / 2));
    col.floor([lo, -w / 2, hi, w / 2], y + 0.05);
    for (let k = 0; k < nb; k++) {
      const x = lo + 2.2 + k * 4.4;
      local(c, [x, 0], Math.PI / 2, (c2) => zawraq(c2.bag, { L: 8.6, B: 2.5, y: wy + 0.05, rand }));
      // a cable from the bow to the bank upstream: a rope strung down to the water (drawn as a thin rod to the next boat's bow)
      bag.add('rope_fibre', rod([x, wy + 0.5, -4.2], [x + 2.2, wy + 0.5, -4.2 - 0.6], 0.025, 5));
      // the boat's beam under the deck rests on the gunwales: posts
      bag.add('cedar', box(x - 0.15, wy + 0.4, -1.4, x + 0.15, y - 0.3, -1.1)); bag.add('cedar', box(x - 0.15, wy + 0.4, 1.1, x + 0.15, y - 0.3, 1.4));
    }
    // rails: posts every 2.2 m and two ropes
    for (const s of [-1, 1]) {
      for (let x = lo + 0.2; x <= hi; x += 2.2) bag.add('cedar', box(x - 0.05, y + 0.05, s * (w / 2 - 0.08) - 0.05, x + 0.05, y + 1.05, s * (w / 2 - 0.08) + 0.05));
      bag.add('rope_fibre', box(lo, y + 1.0, s * (w / 2 - 0.08) - 0.015, hi, y + 1.03, s * (w / 2 - 0.08) + 0.015)); bag.add('rope_fibre', box(lo, y + 0.55, s * (w / 2 - 0.08) - 0.015, hi, y + 0.58, s * (w / 2 - 0.08) + 0.015));
      col.segment([lo, s * (w / 2 - 0.08)], [hi, s * (w / 2 - 0.08)], 0.12, y, y + 1.05);
    }
    // the landing piers: a brick pier on each bank holding the first and last beams, and the west guard-post
    for (const [px, sd] of [[lo, -1], [hi, 1]]) { bag.add('brick_baked', box(px - (sd < 0 ? 4 : 0), el.bed + 0.5, -w / 2 - 0.3, px + (sd < 0 ? 0 : 4), y - 0.0, w / 2 + 0.3)); }
    {
      const gx = lo - 6, S = 4.2;
      bag.add('brick_buff', box(gx - S / 2, 0, -w / 2 - 4.8, gx + S / 2, 3.4, -w / 2 - 0.6)); col.rect([gx - S / 2, -w / 2 - 4.8, gx + S / 2, -w / 2 - 0.6], 0, 3.4);
      bag.add('tile_green', lathe([[S * 0.62, 0], [S * 0.5, 0.35], [S * 0.3, 0.75], [0.001, 1.0]], 12, null, gx, 3.4, -w / 2 - 2.7));
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.04], [0.04, 0.3], [0.001, 0.4]], 8, null, gx, 4.38, -w / 2 - 2.7));
      bag.add('opening', box(gx - 0.6, 0, -w / 2 - 0.62, gx + 0.6, 2.2, -w / 2 - 0.58));
    }
  });
}

/** canal: { rect: [x0, z0, x1, z1] (a straight reach, its water between the quay walls), y (water), bed, along ('x'|'z') } — water and brick quays with a stepped landing here and there. */
function canal(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, bed = el.bed, along = el.along ?? 'x';
  bag.add('water', fromTriangles(upward([x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0])));
  const walls = along === 'x' ? [[x0, z0 - 0.5, x1, z0], [x0, z1, x1, z1 + 0.5]] : [[x0 - 0.5, z0, x0, z1], [x1, z0, x1 + 0.5, z1]];
  for (const r of walls) { bag.add('brick_baked', box(r[0], bed, r[1], r[2], 0.35, r[3])); bag.add('limestone', box(r[0] - (along === 'z' ? 0.05 : 0), 0.3, r[1] - (along === 'x' ? 0.05 : 0), r[2] + (along === 'z' ? 0.05 : 0), 0.42, r[3] + (along === 'x' ? 0.05 : 0))); col.rect(r, bed, 0.42); }
  bag.add('silt', box(x0, bed - 0.3, z0, x1, bed, z1));
  // mooring rings of iron every 8 m on the quay face
  const L = along === 'x' ? x1 - x0 : z1 - z0;
  for (let u = 3; u < L - 1; u += 8) for (const sd of [0, 1]) {
    const x = along === 'x' ? x0 + u : (sd ? x1 : x0), z = along === 'x' ? (sd ? z1 : z0) : z0 + u;
    bag.add('iron', box(x - 0.12 + (along === 'z' ? (sd ? -0.05 : 0.05) : 0), y + 0.4, z - 0.12 + (along === 'x' ? (sd ? -0.05 : 0.05) : 0), x + 0.12 + (along === 'z' ? (sd ? -0.05 : 0.05) : 0), y + 0.65, z + 0.12 + (along === 'x' ? (sd ? -0.05 : 0.05) : 0)));
  }
}

/** The points of a segmental arch (chord w, rise h) from its left base: [[u, v]…], the base at v = 0; with `off` the curve pushed out by that much (a ring). */
function segArch(u0, v0, w, h, off = 0, n = 14) {
  const R = (w * w / 4 + h * h) / (2 * h), cy = h - R, pts = [];
  for (let i = 0; i <= n; i++) { const x = -w / 2 + w * i / n, ang = Math.atan2(x, Math.sqrt(R * R - x * x) ), r = R + off; pts.push([u0 + w / 2 + Math.sin(ang) * r, v0 + cy + Math.cos(ang) * r]); }
  return pts;
}
/**
 * canal_bridge: { at: [x, z] (centre), span (the canal's width, along z), width (of the road), deck (the height of the crown), y (the water), rot } — baked brick,
 * a segmental arch over the water, ramps up and down at a gentle slope; parapets; the road across the canal (running along x, 34 m).
 */
function canalBridge(el, ctx) {
  const span = el.span ?? 14, H = el.deck ?? 2.5, Lr = 34, rw = el.width ?? 7, rampL = 8, flat = Lr / 2 - rampL, v0 = el.y - 0.2, ah = H - v0 - 1.0;
  local(ctx, el.at, el.rot ?? 0, (c) => {
    const { bag, col } = c, fr = { O: [0, -rw / 2], U: [1, 0], N: [0, 1] };
    const prof = [[-Lr / 2, -3.8], [Lr / 2, -3.8], [Lr / 2, 0], [flat, H], [-flat, H], [-Lr / 2, 0]];
    const a0 = segArch(-(span - 2) / 2, v0, span - 2, ah), arch = [[a0[0][0], -3.5], ...a0, [a0[a0.length - 1][0], -3.5]];
    bag.add('brick_baked', polyGeo(fr, prof, 0, rw, [arch]));
    // parapets along the slopes and the crown
    const slope = (x0, y0, x1, y1, sd) => bag.add('brick_buff', polyGeo({ O: [0, sd * (rw / 2 - 0.2) - 0.2], U: [1, 0], N: [0, 1] }, [[x0, y0], [x1, y1], [x1, y1 + 0.9], [x0, y0 + 0.9]], 0, 0.4));
    for (const sd of [-1, 1]) { slope(-Lr / 2, 0, -flat, H, sd); slope(-flat, H, flat, H, sd); slope(flat, H, Lr / 2, 0, sd); col.segment([-Lr / 2, sd * (rw / 2 - 0.2)], [Lr / 2, sd * (rw / 2 - 0.2)], 0.4, 0, H + 0.9); }
    col.ramp([-Lr / 2, -rw / 2, -flat, rw / 2], 0, H, 'e'); col.floor([-flat, -rw / 2, flat, rw / 2], H); col.ramp([flat, -rw / 2, Lr / 2, rw / 2], H, 0, 'w');
    bag.add('brick_paving', box(-flat, H, -rw / 2 + 0.4, flat, H + 0.02, rw / 2 - 0.4));
    // the ring of voussoirs on both faces
    const inner = segArch(-(span - 2) / 2, v0, span - 2, ah), outer = segArch(-(span - 2) / 2, v0, span - 2, ah, 0.5);
    for (const sd of [-1, 1]) for (let i = 0; i + 1 < inner.length; i++) bag.add(i % 2 ? 'brick_buff' : 'brick_baked', polyGeo({ O: [0, sd * rw / 2 - (sd < 0 ? 0 : 0.1)], U: [1, 0], N: [0, 1] }, [inner[i], inner[i + 1], outer[i + 1], outer[i]], 0, 0.1));
  });
}

export const riverElements = { tigris, moored_boat: moored, jetty, boat_bridge: boatBridge, canal, canal_bridge: canalBridge };
void wallRun; void merlons;
