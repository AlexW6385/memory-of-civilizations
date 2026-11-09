// The scene a settlement's light bake traces (tools/bake.mjs), and what says whether a bake is
// still current: for one landmark plan of a settlement (src/settlements/<id>/), its built
// triangles with their albedo and light transmission, its lamps, the settlement's ground round it,
// its climate (the hour it is baked at), and the boxes the probes fill — one per group of its
// indoor rooms. The geometry hash ties a bake to the geometry it was traced from
// (data/gi/index.json); `status()` lists the bakes whose landmark has changed since.

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BufferGeometry, Float32BufferAttribute, Ray, Vector3, DoubleSide } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { MODULES, GROUNDS } from '../../src/settlements/grounds.js';
import { buildPlan, flatParts, toWorld } from '../../src/core/build.js';
import { albedo, MATERIALS } from '../../src/core/palette.js';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const INDEX = `${ROOT}data/gi/index.json`;
/** Bumped when the tracer or the box rules change in a way that should mark every bake stale. */
export const BAKE_VERSION = 5;
/** Probes per landmark (all its boxes): ~15 bytes each in the shipped file. */
export const PROBE_BUDGET = 80000;

// light let through: coloured by stained glass; whole through the clear skins the viewer casts no
// shadow from (glass, window openings, daylight planes, lamps). Paper behind a lattice is a
// diffuser (encoded 2 + its diffuse transmission): a ray that meets it stops there and sees the
// paper lit through from the far side, as the viewer draws it (src/engine/materials.js paperLight,
// whose numbers these are); the sun passes straight through only the little the paper leaks.
const CLEAR = new Set(['glass_outer', 'glass_topaz', 'opening', 'daylight', 'daylight_plain', 'glass_lamp']);
/** The paper's diffuse transmission, its straight leak (both × its share of the lattice), its share. */
export const PAPER = { T: 0.55, leak: 0.04, share: (spec) => (spec.ice ? 0.82 : 0.62) };
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = (hex) => { const h = parseInt(hex.slice(1), 16); return [lin((h >> 16) & 255), lin((h >> 8) & 255), lin(h & 255)]; };
/** A lattice backed by light paper (not the dark openings of a grille): { tint, share }, or null. */
export function paperOf(mat) {
  const spec = MATERIALS[mat];
  if (spec?.kind !== 'lattice' || !spec.paper) return null;
  const p = rgb(spec.paper), m = Math.max(...p);
  if (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] < 0.35) return null;
  return { paper: p, tint: p.map((v) => v / m), share: PAPER.share(spec) };
}
function transmission(mat) {
  if (mat === 'stained_glass') return [0.45, 0.24, 0.5];
  const kind = MATERIALS[mat]?.kind;
  if (CLEAR.has(mat) || kind === 'glow' || kind === 'daylight') return [1, 1, 1];
  const pp = paperOf(mat);
  if (pp) return pp.tint.map((t) => 2 + PAPER.T * pp.share * t);
  if (kind === 'lattice') return [0.3, 0.3, 0.28];
  return null;
}
/** The albedo the tracer gives a material: a paper lattice's bars and paper together. */
function albedoOf(mat) {
  const a = albedo(mat), pp = paperOf(mat);
  return pp ? a.map((v, k) => v * (1 - pp.share) + pp.paper[k] * (1 - PAPER.T) * pp.share) : a;
}
const SKIP = new Set(['water', 'flame']);
const SKIP_KINDS = new Set(['water', 'foam']);

/** Every settlement's landmark plans: [{ site, plan }] (features and plans without rooms included). */
export async function landmarkPlans(only = null) {
  const out = [];
  for (const site of Object.keys(MODULES)) {
    if (only && !only.some((x) => x === site)) continue;
    const mod = await MODULES[site]();
    for (const L of mod.landmarks || []) out.push({ site, plan: L.plan });
  }
  return out;
}

/** Find a plan by settlement id or plan id: [{ site, plan }]. */
export async function resolve(ids) {
  const sites = Object.keys(MODULES);
  const bySite = ids.filter((i) => sites.includes(i));
  const all = await landmarkPlans(bySite.length === ids.length ? bySite : null);
  return all.filter(({ site, plan }) => ids.includes(site) || ids.includes(plan.id));
}

/**
 * The landmark built, as triangle soup: { pos, alb, tr, lights, tris } (ground not yet added).
 * A plan's `bakeElements` are built with it for the bake only: rooms whose walls and ceilings the
 * viewer shows from a feature plan of their own (the Great Pyramid's passages and chambers).
 */
function landmarkTriangles(plan) {
  const built = buildPlan(plan.bakeElements ? { ...plan, elements: [...plan.elements, ...plan.bakeElements] } : plan, { detail: true });
  const parts = flatParts(built).filter(({ mat }) => !SKIP.has(mat) && !SKIP_KINDS.has(MATERIALS[mat]?.kind));
  let n = 0;
  for (const { geometry } of parts) n += geometry.attributes.position.count / 3;
  const pos = new Float32Array(n * 9), alb = new Float32Array(n * 3), tr = new Float32Array(n * 3);
  let t = 0;
  for (const { mat, geometry } of parts) {
    const p = geometry.attributes.position.array, a = albedoOf(mat), T = transmission(mat) || [-1, -1, -1];
    pos.set(p, t * 9);
    for (let k = 0; k < p.length / 9; k++, t++) { alb.set(a, t * 3); tr.set(T, t * 3); }
    geometry.dispose();
  }
  return { pos, alb, tr, lights: built.lights, tris: n };
}

const bvhOf = (pos) => {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return new MeshBVH(g, { targetLeafSize: 8 });
};

/**
 * The boxes the probes fill: one per indoor room (any room not 'open' whose floor has a ceiling
 * above it within 70 m), from 2 m outside its walls and 0.5 m below its floor to 1 m above the
 * highest surface over it (within 70 m, and below the plan's bakeTop); rooms near each other merged when that adds little empty volume. A plan may
 * give its own: `bakeBoxes: [[x0, z0, x1, z1, y0, y1], ...]` (plan coordinates, y above its base).
 * Returns [{ min: [x, y, z], max: [x, y, z], rooms: [id] }] in the settlement's frame.
 */
export function roomBoxes(plan, bvh) {
  const base = plan.base || 0;
  const W = (x0, z0, x1, z1) => { const a = toWorld(plan, x0, z0), b = toWorld(plan, x1, z1); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; };
  if (plan.bakeBoxes) {
    return plan.bakeBoxes.map(([x0, z0, x1, z1, y0, y1], i) => { const r = W(x0, z0, x1, z1); return { min: [r[0], base + y0, r[1]], max: [r[2], base + y1, r[3]], rooms: ['box ' + i] }; });
  }
  const ray = new Ray(new Vector3(), new Vector3(0, 1, 0));
  const boxes = [];
  for (const room of plan.rooms || []) {
    if (room.kind === 'open' || !room.rect) continue;
    const [x0, z0, x1, z1] = W(...room.rect), floor = base + (room.y || 0);
    let hits = 0, top = -Infinity, n = 0;
    for (const u of [0.2, 0.5, 0.8]) for (const v of [0.2, 0.5, 0.8]) {
      n++;
      // the highest surface above (past hanging lamps and canopies, up to a dome's outer shell)
      ray.origin.set(x0 + (x1 - x0) * u, floor + 1.0, z0 + (z1 - z0) * v);
      let h = bvh.raycastFirst(ray, DoubleSide, 0, 70), y = -Infinity;
      if (h) hits++;
      while (h) { y = h.point.y; ray.origin.y = y + 0.05; h = bvh.raycastFirst(ray, DoubleSide, 0, floor + 71 - ray.origin.y); }
      top = Math.max(top, Math.min(y, plan.bakeTop != null ? base + plan.bakeTop : Infinity));
    }
    if (hits < n * 0.6) continue;                            // open to the sky: not an interior
    boxes.push({ min: [x0 - 2, floor - 0.5, z0 - 2], max: [x1 + 2, Math.max(top + 1, floor + 3), z1 + 2], rooms: [room.id] });
  }
  const vol = (b) => (b.max[0] - b.min[0]) * (b.max[1] - b.min[1]) * (b.max[2] - b.min[2]);
  const union = (a, b) => ({ min: a.min.map((v, k) => Math.min(v, b.min[k])), max: a.max.map((v, k) => Math.max(v, b.max[k])), rooms: [...a.rooms, ...b.rooms] });
  for (let merged = true; merged;) {
    merged = false;
    let best = null;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j], U = union(A, B), waste = vol(U) / (vol(A) + vol(B));
      // the gap between them (0 if they touch or overlap): rooms side by side are one volume, so
      // that the walls of the next room seen through a door are lit from the same bake
      const gap = Math.max(...[0, 1, 2].map((k) => Math.max(A.min[k] - B.max[k], B.min[k] - A.max[k], 0)));
      if ((waste < 1.5 || (gap < 8 && waste < 4)) && (!best || waste < best.waste)) best = { i, j, U, waste };
    }
    if (best) { boxes.splice(best.j, 1); boxes[best.i] = best.U; merged = true; }
  }
  return boxes;
}

/** Probe grids for the boxes: a common spacing, coarsened until the probes fit the budget. */
export function grids(boxes, spacing0) {
  const count = (s) => boxes.reduce((a, b) => a + [0, 1, 2].reduce((m, k) => m * (Math.max(2, Math.round((b.max[k] - b.min[k]) / s) + 1)), 1), 0);
  let s = spacing0;
  while (count(s) > PROBE_BUDGET && s < 3) s = Math.round((s + 0.05) * 100) / 100;
  return boxes.map((b) => ({ min: b.min.slice(), n: [0, 1, 2].map((k) => Math.max(2, Math.round((b.max[k] - b.min[k]) / s) + 1)), spacing: s, rooms: b.rooms }));
}

/** The settlement's ground round the boxes (150 m beyond), 4 m cells, with its cover's albedo. */
function groundTriangles(site, boxes) {
  const G = GROUNDS[site];
  const x0 = Math.min(...boxes.map((b) => b.min[0])) - 150, x1 = Math.max(...boxes.map((b) => b.max[0])) + 150;
  const z0 = Math.min(...boxes.map((b) => b.min[2])) - 150, z1 = Math.max(...boxes.map((b) => b.max[2])) + 150;
  const C = 4, nx = Math.ceil((x1 - x0) / C), nz = Math.ceil((z1 - z0) / C);
  const cov = { sand: [0.54, 0.4, 0.22], grass: [0.16, 0.18, 0.08], rock: [0.4, 0.37, 0.32], soil: [0.15, 0.1, 0.06], fields: [0.15, 0.2, 0.07], road: [0.3, 0.27, 0.22], snow: [0.8, 0.8, 0.82] };
  const H = new Float32Array((nx + 1) * (nz + 1));
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) H[j * (nx + 1) + i] = G.height(x0 + i * C, z0 + j * C) - 0.02;
  const pos = new Float32Array(nx * nz * 18), alb = new Float32Array(nx * nz * 6), tr = new Float32Array(nx * nz * 6).fill(-1);
  let t = 0;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const X = x0 + i * C, Z = z0 + j * C, h = (a, b) => H[(j + b) * (nx + 1) + i + a];
    const c = G.cover ? G.cover(X + C / 2, Z + C / 2, h(0, 0)) : { grass: 1 };
    const A = [0, 1, 2].map((k) => { let s = 0, w = 0; for (const key in cov) if (c[key] > 0) { s += cov[key][k] * c[key]; w += c[key]; } return w ? s / w : 0.2; });
    // two triangles facing up (counter-clockwise seen from above)
    pos.set([X, h(0, 0), Z, X, h(0, 1), Z + C, X + C, h(1, 0), Z, X + C, h(1, 0), Z, X, h(0, 1), Z + C, X + C, h(1, 1), Z + C], t * 9);
    alb.set([...A, ...A], t * 3);
    t += 2;
  }
  return { pos, alb, tr, tris: t };
}

const cat = (a, b) => { const o = new Float32Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };

/**
 * The whole scene of one landmark's bake: { site, plan, pos, alb, tr, lights, climate, grids, hash, tris }.
 * `null` grids (no indoor room) means there is nothing to bake.
 */
export function bakeScene(site, plan, { rays = 128 } = {}) {
  const L = landmarkTriangles(plan);
  const bvh = bvhOf(L.pos);
  const boxes = roomBoxes(plan, bvh);
  const climate = GROUNDS[site].climate;
  const G = boxes.length ? grids(boxes, Math.min(plan.bakeSpacing ?? 1, 1)) : null;
  const ground = boxes.length ? groundTriangles(site, boxes) : { pos: new Float32Array(0), alb: new Float32Array(0), tr: new Float32Array(0), tris: 0 };
  const S = { site, plan, pos: cat(L.pos, ground.pos), alb: cat(L.alb, ground.alb), tr: cat(L.tr, ground.tr), lights: L.lights, climate, grids: G, tris: L.tris + ground.tris, landmarkTris: L.tris };
  S.hash = sceneHash(S, L, rays);
  return S;
}

/**
 * A hash of what the bake is traced from: the landmark's triangles (to the centimetre), their
 * albedo and transmission, its lamps, the climate's sun and sky, the probe grids, the ray count.
 * The ground is left out (it changes rarely, and its effect indoors is small).
 */
function sceneHash(S, L, rays) {
  const h = createHash('sha256');
  h.update(`v${BAKE_VERSION} rays ${rays}\n`);
  // (the triangles as a set: the order they come in from the build does not change the light, so each
  // triangle's own hash is summed in two independent 32-bit lanes, which no reordering changes)
  let s1 = 0, s2 = 0, x1 = 0;
  for (let t = 0; t < L.tris; t++) {
    let a = 2166136261, b = 5381;
    const mix = (v) => { a = Math.imul(a ^ v, 16777619); b = (Math.imul(b, 33) + v) | 0; };
    for (let k = 0; k < 9; k++) mix(Math.round(L.pos[t * 9 + k] * 100));
    for (let k = 0; k < 3; k++) mix(Math.round(L.alb[t * 3 + k] * 1000));
    for (let k = 0; k < 3; k++) mix(Math.round((L.tr[t * 3 + k] + 1) * 1000));
    s1 = (s1 + (a >>> 0)) % 4294967296; s2 = (s2 + (b >>> 0)) % 4294967296; x1 ^= a;
  }
  h.update(`tris ${L.tris} ${s1} ${s2} ${x1}\n`);
  h.update(JSON.stringify(L.lights.map((l) => [l.at.map((v) => Math.round(v * 100)), l.color, l.intensity, l.distance])));
  h.update(JSON.stringify({ sun: S.climate.sun, sky: S.climate.sky }));
  h.update(JSON.stringify(S.grids));
  return h.digest('hex').slice(0, 16);
}

export function readIndex() {
  return existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {};
}

/**
 * Every landmark's bake state: [{ site, id, state, ... }], state one of
 *   'current'  baked from the geometry as it is now
 *   'stale'    baked, but the landmark (or its climate, or the tracer) has changed since
 *   'unbaked'  has indoor rooms and no bake
 *   'none'     nothing to bake (no indoor room, or a feature)
 *   'orphan'   a bake file whose plan is gone
 * `onlyBaked` limits it to the landmarks that have a bake (fast: no room tracing for the rest).
 */
export async function status({ ids = null, onlyBaked = false, rays = 128 } = {}) {
  const index = readIndex();
  const plans = ids ? await resolve(ids) : await landmarkPlans();
  const out = [];
  const seen = new Set();
  for (const { site, plan } of plans) {
    seen.add(plan.id);
    const entry = index[plan.id];
    const file = `${ROOT}data/gi/${plan.id}.gi`;
    if (plan.feature) { out.push({ site, id: plan.id, state: 'none' }); continue; }
    if (onlyBaked && !entry && !existsSync(file)) continue;
    if (!onlyBaked || entry || existsSync(file)) {
      const S = bakeScene(site, plan, { rays: entry?.rays ?? rays });
      if (!S.grids) { out.push({ site, id: plan.id, state: existsSync(file) ? 'stale' : 'none', hash: S.hash }); continue; }
      const probes = S.grids.reduce((a, g) => a + g.n[0] * g.n[1] * g.n[2], 0);
      const state = !existsSync(file) ? 'unbaked' : entry?.hash === S.hash ? 'current' : 'stale';
      out.push({ site, id: plan.id, state, hash: S.hash, baked: entry?.hash, probes, boxes: S.grids.length, spacing: S.grids[0].spacing });
    }
  }
  if (!ids) for (const id of Object.keys(index)) if (!seen.has(id)) out.push({ site: index[id].site, id, state: 'orphan' });
  return out;
}
