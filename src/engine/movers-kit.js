// The moving life of a settlement (src/engine/movers.js), the part made off the main thread
// (movers-worker.js): the shapes of the movers gathered into a few meshes, and the ways they move
// along (a street graph, a canal graph), from a settlement's own data (src/settlements/<id>/movers.js).
//
// Shapes. A set of movers (the walkers, the boats) is drawn as one instanced mesh per material
// group (skin, cloth, fibre, wood): each mesh holds the union of the pieces of every variant (a
// robed man, a porter with his pole, the same with an umbrella, each near and far), welded and
// indexed, each piece once however many variants share it; every vertex carries the variants it
// belongs to as bits (12 to a float, three floats: 36 variants), a colour slot (the instance's
// garment, second garment, skin or hat colour, or none), a fixed colour (hair, shoes, bamboo...)
// and a limb class that says how the vertex shader moves it (arms swinging, legs striding,
// baskets swaying on the pole...). An instance names its variant; the shader collapses every vertex
// not in it. So a set is one draw per group, whatever the mix of figures.
//
// Ways. Streets given as rectangles become a graph along their middle lines, nodes where they
// cross or meet, edges at most EDGE_MAX long; links (bridges) join it. Canals become a graph the
// same way. Pure data, posted to the page.
//
// Imports three.js only through src/core/three.js (the worker has no import map).

import { Color } from '../core/three.js';
import { MATERIALS } from '../core/palette.js';

/** Limb classes (the vertex shader, movers.js): how a vertex moves. */
export const LIMB = { rigid: 0, arms: 1, armL: 2, robe: 3, legs: 4, basketF: 5, basketB: 6, pole: 7, scull: 8 };
/** Colour slots: the instance's colours (iC1…iC4), or 4: none (the fixed colour alone). */
export const SLOT = { c1: 0, c2: 1, skin: 2, c3: 3, none: 4 };
/** The base palette material of each group: the fixed and instance colours are factors over it. */
export const GROUP_BASE = { skin: 'skin_light', cloth: 'cloth_white', fibre: 'wicker', wood: 'timber' };

const _a = new Color(), _b = new Color();
/** The factor (linear rgb) taking a group's base colour to a palette material's colour (or a hex), times shade. */
export function factor(group, mat, shade = 1) {
  const base = MATERIALS[GROUP_BASE[group]];
  _a.set(mat.startsWith?.('#') ? mat : (MATERIALS[mat]?.color ?? '#ffffff'));
  _b.set(base.color);
  return [_a.r / _b.r * shade, _a.g / _b.g * shade, _a.b / _b.b * shade];
}

// ── shapes ───────────────────────────────────────────────────────────────────
/** Weld a non-indexed geometry's position + normal into indexed arrays. */
function weld(pos, nor) {
  const map = new Map(), P = [], N = [], I = new Uint32Array(pos.length / 3);
  const q = (v) => Math.round(v * 2e4);
  for (let i = 0, n = pos.length / 3; i < n; i++) {
    const k = `${q(pos[i * 3])},${q(pos[i * 3 + 1])},${q(pos[i * 3 + 2])},${Math.round(nor[i * 3] * 50)},${Math.round(nor[i * 3 + 1] * 50)},${Math.round(nor[i * 3 + 2] * 50)}`;
    let j = map.get(k);
    if (j === undefined) { j = P.length / 3; map.set(k, j); P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); N.push(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]); }
    I[i] = j;
  }
  return { pos: P, nor: N, idx: I };
}
/** A cheap hash of a piece (its vertices and how it is drawn), to find the same piece in two variants. */
function hashPiece(pos, extra) {
  let h = 2166136261 >>> 0;
  const step = Math.max(1, Math.floor(pos.length / 512));
  for (let i = 0; i < pos.length; i += step) h = Math.imul(h ^ Math.round(pos[i] * 1e4), 16777619) >>> 0;
  return `${pos.length}|${h}|${extra}`;
}

/**
 * The meshes of a set of movers being gathered: addPiece(variant, group, geometry, { slot, limb,
 * col }) for each piece of each variant (geometry: non-indexed position + normal, in the mover's own
 * frame: a figure on the ground facing −z, a boat's bow toward −z, its waterline at y 0).
 */
export class SetBuilder {
  constructor(groups) {
    this.groups = groups;
    this.pieces = new Map();             // key → { group, pos, nor, idx, slot, limb, col, mask: [4 floats] }
    this.variants = [];                  // names
  }
  variant(name) {
    let i = this.variants.indexOf(name);
    if (i < 0) { i = this.variants.length; this.variants.push(name); if (i >= 36) throw new Error('movers: more than 36 variants in a set'); }
    return i;
  }
  addPiece(v, group, g, { slot = SLOT.none, limb = LIMB.rigid, col = [1, 1, 1] } = {}) {
    if (!this.groups.includes(group)) throw new Error(`movers: no group ${group}`);
    const pos = g.attributes ? g.attributes.position.array : g.pos, nor = g.attributes ? g.attributes.normal.array : g.nor;
    if (!pos.length) return;
    const key = hashPiece(pos, `${group}|${slot}|${limb}|${col.map((c) => c.toFixed(3)).join(',')}`);
    let p = this.pieces.get(key);
    if (!p) { p = { group, ...weld(pos, nor), slot, limb, col, mask: [0, 0, 0, 0] }; this.pieces.set(key, p); }
    p.mask[Math.floor(v / 12)] += (Math.floor(p.mask[Math.floor(v / 12)] / 2 ** (v % 12)) % 2) ? 0 : 2 ** (v % 12);
  }
  /** Per group: { position, normal, index, mvM (vec4: the variants' bits in x, y, z; w = slot · 16 + limb), mvC (vec3 fixed colour) } (typed arrays, transferable). */
  finish() {
    const out = {};
    for (const group of this.groups) {
      const list = [...this.pieces.values()].filter((p) => p.group === group);
      let nv = 0, ni = 0;
      for (const p of list) { nv += p.pos.length / 3; ni += p.idx.length; }
      if (!nv) continue;
      const position = new Float32Array(nv * 3), normal = new Float32Array(nv * 3), mvM = new Float32Array(nv * 4), mvC = new Float32Array(nv * 3);
      const index = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
      let ov = 0, oi = 0;
      for (const p of list) {
        const n = p.pos.length / 3;
        position.set(p.pos, ov * 3); normal.set(p.nor, ov * 3);
        for (let i = 0; i < n; i++) { mvM[(ov + i) * 4] = p.mask[0]; mvM[(ov + i) * 4 + 1] = p.mask[1]; mvM[(ov + i) * 4 + 2] = p.mask[2]; mvM[(ov + i) * 4 + 3] = p.slot * 16 + p.limb; mvC.set(p.col, (ov + i) * 3); }
        for (let i = 0; i < p.idx.length; i++) index[oi + i] = p.idx[i] + ov;
        ov += n; oi += p.idx.length;
      }
      out[group] = { position, normal, index, mvM, mvC };
    }
    return out;
  }
}

/** Split a non-indexed geometry's triangles by a test of their centroid: [kept, others] as { pos, nor }. */
export function splitTris(g, test) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, a = { pos: [], nor: [] }, b = { pos: [], nor: [] };
  for (let t = 0; t < P.length; t += 9) {
    const cx = (P[t] + P[t + 3] + P[t + 6]) / 3, cy = (P[t + 1] + P[t + 4] + P[t + 7]) / 3, cz = (P[t + 2] + P[t + 5] + P[t + 8]) / 3;
    const o = test(cx, cy, cz) ? a : b;
    for (let k = 0; k < 9; k++) { o.pos.push(P[t + k]); o.nor.push(N[t + k]); }
  }
  return [a, b];
}
/** The bounds [minX, minY, minZ, maxX, maxY, maxZ] of a geometry. */
export function bounds(g) {
  const P = g.attributes ? g.attributes.position.array : g.pos, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], P[i + k]); b[k + 3] = Math.max(b[k + 3], P[i + k]); }
  return b;
}
/** Triangles (flat xyz list) → { pos, nor } with flat normals. */
export function flat(tris) {
  const nor = new Float32Array(tris.length);
  for (let i = 0; i < tris.length; i += 9) {
    const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2];
    const vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (let k = 0; k < 3; k++) { nor[i + k * 3] = nx; nor[i + k * 3 + 1] = ny; nor[i + k * 3 + 2] = nz; }
  }
  return { pos: Float32Array.from(tris), nor };
}

// ── ways ─────────────────────────────────────────────────────────────────────
/** The longest edge of a graph (m): long streets are cut, so that an edge's lanes are worked out quickly and near things are found by edge. */
export const EDGE_MAX = 36;

/**
 * A graph along rectangles' middle lines: rects [{ r: [x0, z0, x1, z1], weight }], links [{ a, b, w,
 * kind }] (straight ways added: bridges), clip (a radius: the graph stops inside it). Nodes where
 * two ways cross or one ends on another (within its half-width + 1 m), at the links' ends, and
 * every EDGE_MAX. Returns { nodes: [[x, z]], edges: [{ a, b (node ids), w (half-width), weight, kind }] }.
 */
export function graphFromRects(rects, links = [], clip = Infinity) {
  const segs = rects.map(({ r, weight = 1, kind = 'street', market = 0 }) => {
    const horiz = r[2] - r[0] >= r[3] - r[1];
    return horiz ? { horiz, c: (r[1] + r[3]) / 2, a0: r[0], a1: r[2], w: (r[3] - r[1]) / 2, weight, kind, market, cuts: [] }
      : { horiz, c: (r[0] + r[2]) / 2, a0: r[1], a1: r[3], w: (r[2] - r[0]) / 2, weight, kind, market, cuts: [] };
  });
  const pt = (s, a) => (s.horiz ? [a, s.c] : [s.c, a]);
  // crossings and ends on another way
  for (const s of segs) for (const t of segs) {
    if (s === t || s.horiz === t.horiz) continue;
    // t's middle line crosses s's line (or t ends within reach of it)
    if (t.c < s.a0 - 0.5 || t.c > s.a1 + 0.5) continue;
    if (t.a0 > s.c + s.w + 1.0 || t.a1 < s.c - s.w - 1.0) continue;
    s.cuts.push(Math.max(s.a0, Math.min(s.a1, t.c)));
    t.cuts.push(s.c);                                   // (may lie beyond t's end by up to s's half-width + 1: t is carried on to it)
  }
  // collinear ways meeting end to end (one street cut in two): their ends joined
  for (const s of segs) for (const t of segs) {
    if (s === t || s.horiz !== t.horiz || Math.abs(s.c - t.c) > 0.5 * Math.min(s.w, t.w)) continue;
    if (t.a0 >= s.a1 - 0.01 && t.a0 - s.a1 < 1.2) { s.cuts.push(s.a1 + (t.a0 - s.a1) / 2); t.cuts.push(s.a1 + (t.a0 - s.a1) / 2); }
  }
  const nodes = [], edges = [];
  const node = ([x, z]) => {
    for (let i = 0; i < nodes.length; i++) if (Math.abs(nodes[i][0] - x) < 0.6 && Math.abs(nodes[i][1] - z) < 0.6) return i;
    nodes.push([x, z]); return nodes.length - 1;
  };
  const inClip = ([x, z]) => Math.hypot(x, z) <= clip;
  const addEdge = (p, q, w, weight, kind, market = 0) => {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (L < 0.4) return;
    const n = Math.max(1, Math.ceil(L / EDGE_MAX));
    let prev = node(p);
    for (let k = 1; k <= n; k++) {
      const f = k / n, nx = node([p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]);
      if (nx !== prev) edges.push({ a: prev, b: nx, w, weight, kind, market });
      prev = nx;
    }
  };
  // a link's ends become cuts on the ways they stand on
  for (const l of links) for (const e of [l.a, l.b]) for (const s of segs) {
    const along = s.horiz ? e[0] : e[1], across = s.horiz ? e[1] : e[0];
    if (along >= s.a0 - 0.5 && along <= s.a1 + 0.5 && Math.abs(across - s.c) <= s.w + 0.5) s.cuts.push(along);
  }
  for (const s of segs) {
    const cuts = [...new Set([s.a0, s.a1, ...s.cuts].map((v) => Math.round(v * 100) / 100))].sort((p, q) => p - q);
    // the ends: a way that does not meet another at its end stops 0.6 m short of the house fronts that close it
    for (let i = 0; i + 1 < cuts.length; i++) {
      let p = pt(s, cuts[i]), q = pt(s, cuts[i + 1]);
      if (!inClip(p) && !inClip(q)) continue;
      // clipped to the disc
      if (!inClip(p) || !inClip(q)) {
        const [o, f] = inClip(p) ? [p, q] : [q, p];
        let lo = 0, hi = 1;
        for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2, x = [o[0] + (f[0] - o[0]) * m, o[1] + (f[1] - o[1]) * m]; if (inClip(x)) lo = m; else hi = m; }
        const e = [o[0] + (f[0] - o[0]) * lo, o[1] + (f[1] - o[1]) * lo];
        if (inClip(p)) q = e; else p = e;
      }
      addEdge(p, q, s.w, s.weight, s.kind, s.market);
    }
  }
  for (const l of links) {
    // (snapped to an existing node at each end where one is near: the cut put there)
    addEdge(nodes[node(l.a)], nodes[node(l.b)], l.w, l.weight ?? 1, l.kind ?? 'bridge');
  }
  // a node met by two edges of one straight way in line, and nothing else, is kept (it bounds an edge's length)
  return { nodes, edges };
}

// ── figures as movers ────────────────────────────────────────────────────────
/** The arm poses of src/objects/figures.js and how a mover's arms then move. */
const ARMS_LIMB = { hang: LIMB.arms, pole: LIMB.armL, staff: LIMB.armL, pull: LIMB.scull };
/** A seed whose figure is built at girth 1 (figures.js draws the girth first when the height is given): the movers' own scale makes each one's build. */
export const UNIT_SEED = 512;
/** Material names standing for the figure's slots while it is built (figures.js passes them through). */
const MARK = { cloth: 'C1', cloth2: 'C2', skin: 'SKIN', hairMat: 'HAIR', hatMat: 'HAT' };

/**
 * Add a still figure of src/objects/figures.js (its el without at, seed, h, materials) to a set as
 * variant v: its pieces sorted into the groups (skin, cloth, fibre, wood) with their colour slots and
 * limb classes. opts: { far (leave out the hands, the face and the shoes: the far version), cape
 * (the over-garment of el.over 'cloak' is a straw rain cape: fibre, coloured as `cape`), extra(add)
 * (more pieces in the figure's frame: add(group, geometry, { slot, limb, col })) }.
 */
export function addFigure(sb, v, figure, el, { far = false, cape = null, extra = null } = {}) {
  const got = [];
  const bag = { add: (mat, g) => got.push([mat, g]) };
  figure({ t: 'figure', at: [0, 0], rot: 0, y: 0, h: 1.65, seed: UNIT_SEED, beard: false, ...el, ...MARK }, { bag, col: { circle() {}, box() {}, rect() {} } });
  const robe = (el.dress ?? 'robe') !== 'trousers' && el.dress !== 'tunic';
  const armLimb = ARMS_LIMB[el.arms] ?? LIMB.rigid, legLimb = el.pose && el.pose !== 'stand' ? LIMB.rigid : robe ? LIMB.robe : LIMB.legs;
  let hairSeen = 0;
  const add = (group, g, o) => sb.addPiece(v, group, g, o);
  for (const [mat, g] of got) {
    const b = bounds(g);
    if (mat === 'SKIN') {
      if (b[1] > 1.3) add('skin', g, { slot: SLOT.skin });
      else if (!far) add('skin', g, { slot: SLOT.skin, limb: armLimb });
    } else if (mat === 'C1') {
      add('cloth', g, { slot: SLOT.c1, limb: b[4] > 1.2 ? armLimb : robe ? legLimb : LIMB.rigid });
    } else if (mat === 'C2') {
      if (cape) {
        const [c, rest] = splitTris(g, (x, y, z) => Math.hypot(x, z) > 0.2 || y > 0.95);
        add('fibre', c, { col: factor('fibre', cape) });
        add('cloth', rest, { slot: SLOT.c2, limb: legLimb });
      } else add('cloth', g, { slot: SLOT.c2, limb: legLimb });
    } else if (mat === 'HAIR') {
      if (hairSeen++ === 0 && far) continue;                    // the face (eyes, brows, mouth)
      add('cloth', g, { col: factor('cloth', 'hide_black', 0.7) });
    } else if (mat === 'HAT') {
      if (el.hat === 'straw') add('fibre', g, { col: factor('fibre', 'thatch', 1.15) });
      else add('cloth', g, { slot: SLOT.c3 });
    } else if (mat === 'cloth_brown' && b[4] < 0.25) {
      if (!far) add('cloth', g, { col: factor('cloth', 'cloth_black', 1.2), limb: legLimb });
    } else if (el.carry === 'pole' || el.carry === 'pails') {
      // the carrying pole and what hangs from it, front (−z) and back
      if (mat === 'bamboo_culm') { add('wood', g, { col: factor('wood', 'bamboo_culm', 1.1), limb: LIMB.pole }); continue; }
      if (mat === 'timber' && far) continue;                     // the cords
      const group = mat === 'wicker' ? 'fibre' : mat === 'timber' ? 'wood' : 'cloth';
      const col = factor(group, mat === 'timber' ? 'sacking' : mat);
      const [f, bk] = splitTris(g, (x, y, z) => z < 0);
      add(group, f, { col, limb: LIMB.basketF }); add(group, bk, { col, limb: LIMB.basketB });
    } else {
      const group = /wicker|thatch|reed|sacking/.test(mat) ? 'fibre' : /timber|wood|bamboo/.test(mat) ? 'wood' : mat === 'skin_light' ? 'skin' : 'cloth';
      add(group, g, { col: factor(group, mat) });
    }
  }
  if (extra) extra((group, g, o) => add(group, g, o));
}
