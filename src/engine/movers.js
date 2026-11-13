// The moving life of a settlement (src/engine/systems.js): people walking the streets, lanes and
// bridges, boats sculled along the canals — for the settlements that have the data for it
// (movers-sites.js: src/settlements/<id>/movers.js).
//
// On attach a worker (movers-worker.js) builds the shapes and the ways; the page makes two sets of
// instanced meshes (movers-gpu.js: the walkers with the boats' crews, four groups; the boats and
// their oars, two groups) and the boats' wakes, compiles them and shows them. Every frame the
// movers near the visitor are moved here — a few dozen walkers, half a dozen to ten boats — and
// written to the instance buffers (no allocation); their limbs move in the vertex shader. In all
// seven draws (and the walkers' and boats' shadows in the near cascades).
//
// Walkers follow the street graph at a lane offset to the right of their way, steering a little
// ahead, keeping off what stands in the street (the lanes' samples blocked in the collision world,
// worked out in idle time), slowing behind one another and stepping aside for those coming; at a
// junction they turn into another way, at a dead end they turn round (or, unseen, go indoors).
// There are many by day, more in the market streets, few at night; in the rain umbrellas open and
// rain capes go on. Boats keep to the right-hand side of the canal clear of the boats standing in it (to
// the side away from one they meet), keep a following distance behind a slower one, slow and keep
// to the middle under the bridges; the bridges, the narrows beside the standing boats and the
// junctions are passed one way at a time, the others waiting at the side; at a canal's end they tie
// up. Their hulls are their own length and beam (a cheap all-pairs check each frame: a dozen at most).

import * as THREE from 'three/webgpu';
import { registerSystem } from './systems.js';
import { MOVER_SITES } from './movers-sites.js';
import { MoverSet, WakeSet } from './movers-gpu.js';
import { factor } from './movers-kit.js';
import { ENV } from './env.js';
import { SMALL, MID } from './layers.js';
import { spawnAllowed, inArrivalCircle, holdBack, ARRIVAL_QUIET } from './walker-rules.js';

const STATES = new Map();                // site → state
const TAU = Math.PI * 2;
/** The instance being written (its fields filled in place: numbers passed as arguments would be boxed). */
const _S = { x: 0.5, y: 0.5, z: 0.5, yaw: 0.5, roll: 0.5, sx: 0.5, sy: 0.5, sz: 0.5, ph: 0.5, amp: 0.5, v: 0, mode: 0, swing: 0.5, legs: 0.5, bounce: 0.5 };
/** Numbers handed to the per-frame helpers (in place: as arguments they would be boxed). */
const _q = { x: 0.5, z: 0.5, o: 0.5 };
const _at = [0, 0], _inv = new THREE.Matrix4(), _cam = new THREE.Vector3(), _fwd = new THREE.Vector3();
let seed = 1;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
// (not Math.hypot: it allocates in V8, and this runs every frame)
const len2 = (x, z) => Math.sqrt(x * x + z * z), len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
/** A point of a boat's frame (lx, lz) in the settlement's (into a scratch pair). */
const at = (b, cy, sy, lx, lz) => { _at[0] = b.x + lx * cy + lz * sy; _at[1] = b.z - lx * sy + lz * cy; return _at; };
/** The speed (m/s) from which a boat stops within x metres (it slows at 0.35 m/s², taken as 0.25). */
const stopV = (x) => (x <= 0 ? 0 : Math.sqrt(0.5 * x));
/** A boat's half-extent across canal e as it lies (its heading against the canal's). */
const across = (q, e) => { const sn = Math.min(1, Math.abs(q.hx * e.uz - q.hz * e.ux)); return q.hl * sn + q.hw * Math.sqrt(1 - sn * sn); };
/** The clearance (m; < 0: overlapping) between a hull at (x, z) heading (hx, hz), half-length hl, half-beam hw, and boat o's (separating axes). */
function hullGap(x, z, hx, hz, hl, hw, o) {
  const dx = o.x - x, dz = o.z - z;
  let g = -Infinity;
  for (let i = 0; i < 4; i++) {
    const nx = i === 0 ? hx : i === 1 ? -hz : i === 2 ? o.hx : -o.hz, nz = i === 0 ? hz : i === 1 ? hx : i === 2 ? o.hz : o.hx;
    const ra = hl * Math.abs(hx * nx + hz * nz) + hw * Math.abs(-hz * nx + hx * nz), rb = o.hl * Math.abs(o.hx * nx + o.hz * nz) + o.hw * Math.abs(-o.hz * nx + o.hx * nz);
    g = Math.max(g, Math.abs(dx * nx + dz * nz) - ra - rb);
  }
  return g;
}
const acrossOf = (q, e) => across(q, e);
const angleTo = (from, to) => { let d = (to - from) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };

// ── the ways on the page ─────────────────────────────────────────────────────
/** A graph from the worker: edges with their direction, normal (to the right of a → b), and their lanes when worked out. */
class Net {
  constructor(g) {
    this.nodes = g.nodes;
    this.adj = g.nodes.map(() => []);
    this.edges = g.edges.map((e, i) => {
      const [ax, az] = g.nodes[e.a], [bx, bz] = g.nodes[e.b], L = len2(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
      const E = { ...e, i, ax, az, bx, bz, L, ux, uz, nx: -uz, nz: ux, mx: (ax + bx) / 2, mz: (az + bz) / 2, ready: false, off: null, K: 0, n: 0, step: 0.5, blocked: null, y: null, limA: L, limB: 0 };
      this.adj[e.a].push(i); this.adj[e.b].push(i);
      return E;
    });
  }
  /** A lane of edge e free over samples j0…j1 nearest the offset _q.o (or −1). */
  freeLane(e, j0, j1 = j0) {
    const o = _q.o, K = e.K, off = e.off, a = Math.max(0, Math.min(e.n - 1, Math.min(j0, j1))), b = Math.max(0, Math.min(e.n - 1, Math.max(j0, j1)));
    let best = -1, bd = Infinity;
    for (let k = 0; k < K; k++) {
      let free = true;
      for (let j = a; j <= b; j++) if (e.blocked[j * K + k]) { free = false; break; }
      if (!free) continue;
      const d = Math.abs(off[k] - o); if (d < bd) { bd = d; best = k; }
    }
    return best;
  }
  /**
   * A lane of edge f free over its samples j2…j3 and, on the edge e in line before it (the same lanes, in
   * the same or the opposite sense: flip), over e's samples j0…j1, nearest f's offset _q.o (or −1).
   */
  freeLaneOn2(e, j0, j1, f, j2, j3, flip) {
    if (e.K !== f.K) return this.freeLane(f, j2, j3);
    const o = _q.o, K = f.K;
    const a0 = Math.max(0, Math.min(e.n - 1, Math.min(j0, j1))), a1 = Math.max(0, Math.min(e.n - 1, Math.max(j0, j1)));
    const b0 = Math.max(0, Math.min(f.n - 1, Math.min(j2, j3))), b1 = Math.max(0, Math.min(f.n - 1, Math.max(j2, j3)));
    let best = -1, bd = Infinity;
    for (let k = 0; k < K; k++) {
      const ke = flip ? K - 1 - k : k;
      let free = true;
      for (let j = b0; j <= b1 && free; j++) if (f.blocked[j * K + k]) free = false;
      for (let j = a0; j <= a1 && free; j++) if (e.blocked[j * K + ke]) free = false;
      if (!free) continue;
      const d = Math.abs(f.off[k] - o); if (d < bd) { bd = d; best = k; }
    }
    return best;
  }
  /** Is (_q.x, _q.z) on edge e's band of lanes (with a margin), at a free lane? */
  okOn(e) {
    if (!e) return false;
    const x = _q.x, z = _q.z;
    const s = (x - e.ax) * e.ux + (z - e.az) * e.uz, o = (x - e.ax) * e.nx + (z - e.az) * e.nz;
    if (s < -0.6 || s > e.L + 0.6 || Math.abs(o) > e.off[e.K - 1] + 0.3) return false;
    // (the samples on both sides, the lanes on both sides: the obstacles' clearance holds between them)
    const f = Math.max(0, Math.min(e.n - 1, s / e.step)), j0 = Math.floor(f), j1 = Math.min(e.n - 1, j0 + 1);
    const g = e.K > 1 ? Math.max(0, Math.min(e.K - 1, (o - e.off[0]) / (e.off[1] - e.off[0]))) : 0, k0 = Math.floor(g), k1 = Math.min(e.K - 1, k0 + 1);
    const B = e.blocked, K = e.K;
    return !(B[j0 * K + k0] || B[j0 * K + k1] || B[j1 * K + k0] || B[j1 * K + k1]);
  }
  heightAt(e, s) {
    if (!e.y) return 0;
    const f = Math.max(0, Math.min(e.n - 1.001, s / e.step)), j = Math.floor(f);
    return e.y[j] + (e.y[j + 1] - e.y[j]) * (f - j);
  }
}
/** The limits of travel along an edge set by a stretch where every lane is blocked (a house closing a lane). */
function limits(e) {
  let first = -1, last = -1;
  for (let j = 0; j < e.n; j++) {
    let all = true;
    for (let k = 0; k < e.K; k++) if (!e.blocked[j * e.K + k]) { all = false; break; }
    if (all) { if (first < 0) first = j; last = j; }
  }
  e.limA = first < 0 ? e.L + 99 : first * e.step - 0.8;          // going a → b, stop before
  e.limB = last < 0 ? -99 : last * e.step + 0.8;                   // going b → a
}
/** Work out a street edge's lanes against the collision world: free samples every 0.5 m, the walking height. */
function walkLanes(e, C) {
  const u = Math.max(0, e.w - (e.w >= 2 ? 0.7 : 0.52)), K = u > 0.3 ? 2 * Math.floor(u / 0.35) + 1 : 1;
  e.off = Array.from({ length: K }, (_, k) => (K === 1 ? 0 : -u + 2 * u * k / (K - 1)));
  e.K = K; e.n = Math.floor(e.L / 0.5) + 1; e.step = e.L / (e.n - 1 || 1);
  e.blocked = new Uint8Array(e.n * K); e.y = new Float32Array(e.n);
  const bridge = e.kind === 'bridge';
  // (a bridge's deck is a ramp of floors: climbed from the deck at its start, never dropped through to the canal's bed)
  let y = C.groundAt(e.ax, e.az, bridge ? 3.5 : 1.0);
  if (!Number.isFinite(y)) y = 0;
  for (let j = 0; j < e.n; j++) {
    const s = j * e.step, x = e.ax + e.ux * s, z = e.az + e.uz * s;
    if (bridge) {
      // up the arch as the visitor climbs it: the highest footing within a step of the last
      const g = C.groundAt(x, z, y + 0.8);
      if (Number.isFinite(g) && g > y - 0.8) y = g;
    } else { const g = C.groundAt(x, z, 1.0); y = Number.isFinite(g) ? g : 0; }
    e.y[j] = y;
    for (let k = 0; k < K; k++) {
      const px = x + e.nx * e.off[k], pz = z + e.nz * e.off[k];
      if (C.blockedAt(px, pz, 0.28, y + 0.3, y + 1.6)) e.blocked[j * K + k] = 1;
    }
  }
  limits(e);
  e.ready = true;
}

/**
 * The stretches of the canals passed one way at a time: the bridges, and the narrows beside the boats
 * standing in a canal, where two cannot pass (their free lanes span less than two beams), the free
 * lane's side of the middle known (free: a point on it); those less than 25 m apart along one canal
 * joined into one (a boat could not get back to its side between them). [{ at, half, ux, uz, free }]
 */
function narrows(net, bridges) {
  const R = bridges.map((b) => {
    const e = net.edges.find((f) => Math.abs((b.at[0] - f.ax) * f.nx + (b.at[1] - f.az) * f.nz) < 2);
    return { at: b.at, half: b.half, ux: e ? e.ux : 1, uz: e ? e.uz : 0, free: null };
  });
  for (const e of net.edges) {
    let j0 = -1, fo = 0, fn = 0;
    for (let j = 0; j <= e.n; j++) {
      let lo = Infinity, hi = -Infinity;
      if (j < e.n) for (let k = 0; k < e.K; k++) if (!e.blocked[j * e.K + k]) { lo = Math.min(lo, e.off[k]); hi = Math.max(hi, e.off[k]); }
      const narrow = j < e.n && hi - lo < 2.9;
      if (narrow) { if (j0 < 0) { j0 = j; fo = 0; fn = 0; } if (hi >= lo) { fo += (lo + hi) / 2; fn++; } }
      if (!narrow && j0 >= 0) {
        const s0 = j0 * e.step - 1, s1 = (j - 1) * e.step + 1, m = (s0 + s1) / 2, f = fn ? fo / fn : 0;
        R.push({ at: [e.ax + e.ux * m, e.az + e.uz * m], half: (s1 - s0) / 2, ux: e.ux, uz: e.uz, free: [e.ax + e.ux * m + e.nx * f, e.az + e.uz * m + e.nz * f] });
        j0 = -1;
      }
    }
  }
  // joined: along one canal (in line), less than 25 m between them (no room to wait between) (a narrow cut by a node into two edges is one)
  for (let again = true; again;) {
    again = false;
    for (let i = 0; i < R.length && !again; i++) for (let k = i + 1; k < R.length && !again; k++) {
      const A = R[i], B = R[k];
      if (Math.abs(A.ux * B.uz - A.uz * B.ux) > 0.05) continue;
      const dx = B.at[0] - A.at[0], dz = B.at[1] - A.at[1], along = dx * A.ux + dz * A.uz;
      if (Math.abs(dx * -A.uz + dz * A.ux) > 1 || Math.abs(along) - A.half - B.half > 25) continue;
      const lo = Math.min(-A.half, along - B.half), hi = Math.max(A.half, along + B.half), c = (lo + hi) / 2;
      A.at = [A.at[0] + A.ux * c, A.at[1] + A.uz * c]; A.half = (hi - lo) / 2; A.free = A.free ?? B.free;
      R.splice(k, 1); again = true;
    }
  }
  return R;
}

// ── a settlement's movers ────────────────────────────────────────────────────
export class SiteMovers {
  constructor(site, world, d) {
    this.site = site; this.world = world; this.P = d.params; this.kinds = d.kinds;
    this.walk = new Net(d.walk);
    this.water = new Net(d.water);
    // the canals' lanes came worked out (the boats standing in them known in the worker)
    d.water.lanes.forEach((l, i) => { const e = this.water.edges[i]; e.off = l.off; e.K = l.off.length; e.n = l.n; e.step = l.step; e.blocked = l.blocked; limits(e); e.ready = true; });
    // the bridges along each canal edge
    for (const e of this.water.edges) {
      e.bridges = [];
      for (const b of d.water.bridges) {
        const s = (b.at[0] - e.ax) * e.ux + (b.at[1] - e.az) * e.uz, o = (b.at[0] - e.ax) * e.nx + (b.at[1] - e.az) * e.nz;
        if (Math.abs(o) < 2 && s > -12 && s < e.L + 12) e.bridges.push({ s, half: b.half });
      }
    }
    // the bridges and the junctions of the canals: each passed by one boat at a time (or by those going the same way)
    this.bridges = narrows(this.water, d.water.bridges);
    this.junctions = this.water.nodes.map((_, i) => i).filter((i) => this.water.adj[i].length > 2);
    const V = (set, name) => set.variants.indexOf(name);
    this.wv = d.sets.walkers; this.bv = d.sets.boats;
    this.walkers = new MoverSet('walkers', d.sets.walkers, 96, { layer: SMALL, cast: true });
    this.boatSet = new MoverSet('boats', d.sets.boats, 32, { layer: SMALL, cast: true });   // (their shadows in the first cascade only: farther they cost a dynamic redraw of the second and are not seen)
    this.wakes = new WakeSet(16);
    this.root = new THREE.Group(); this.root.name = 'movers';
    this.root.add(this.walkers.group, this.boatSet.group, this.wakes.mesh);
    // the kinds of walkers with their variants' ids
    this.kindsW = d.kinds.walkers.map((k) => ({ ...k, v: this.variantsOf(k.id, V) }));
    this.crew = { boatman: { ...d.kinds.crew.boatman, v: this.variantsOf('boatman', V) }, passenger: { ...d.kinds.crew.passenger, v: this.variantsOf('passenger', V) } };
    this.boatV = { covered: [V(this.bv, 'covered|near'), V(this.bv, 'covered|far')], cargo: [V(this.bv, 'cargo|near'), V(this.bv, 'cargo|far')], oar: V(this.bv, 'oar') };
    // (every field there from the start: one shape for all, no slow dictionary objects)
    this.W = Array.from({ length: 80 }, () => ({ on: false, K: null, e: null, dir: 1, x: 0, z: 0, y: 0, yaw: 0, v: 0, vT: 0, cruise: 0, prefR: 0, bias: 0, ph: 0, sx: 1, sy: 1, sz: 1,
      wet: false, wetAt: 0, next: null, nd: 1, prev: null, stuck: 0, turning: 0, born: 0, c: new Float32Array(12) }));
    this.B = Array.from({ length: 14 }, () => ({ on: false, e: null, dir: 1, x: 0, z: 0, yaw: 0, v: 0, cruise: 0, ph: 0, amp: 0, kind: 'covered', sx: 1, sz: 1, next: null, nd: 1, moored: 0, wait: 0, born: 0,
      c: new Float32Array(12), cm: new Float32Array(12), cp: new Float32Array(12), passenger: false,
      hl: 3.5, hw: 1, hx: 0, hz: -1, stuck: 0, guard: null, give: null, giveZ: -1, giveT: 0, exI: -1, brI: -1, brT: 0, brRel: 0, jI: -1, jT: 0, jD: 0, jRel: 0 }));
    this.t = 0; this.nextList = 0; this.cands = []; this.wetness = 0;
    this.queue = null; this.idle = 0;
    // the visitor's arrival (World.noteArrival), if it was a moment ago: nobody spawns on it
    this.arr = null;
    const A = world.arrival;
    if (A && A.site === site && performance.now() - A.at < ARRIVAL_QUIET * 1000) this.arrive(A.x, A.z, (ARRIVAL_QUIET * 1000 - (performance.now() - A.at)) / 1000);
    site.group.add(this.root);
    this.root.visible = false;
    this.ready = false;
  }
  /** The visitor has arrived at (x, z): the walkers within the arrival's circle let go of, none spawned there for a while. */
  arrive(x, z, quiet = ARRIVAL_QUIET) {
    this.arr = { x, z, until: this.t + quiet };
    for (const w of this.W) if (w.on && inArrivalCircle(w.x, w.z, x, z)) w.on = false;
  }
  variantsOf(id, V) {
    const n = (w, f) => V(this.wv, `${id}|${w}|${f}`);
    const dryN = n('dry', 'near'), dryF = n('dry', 'far'), wetN = n('wet', 'near'), wetF = n('wet', 'far');
    return { dryN, dryF, wetN: wetN < 0 ? dryN : wetN, wetF: wetF < 0 ? dryF : wetF };
  }
  async show() {
    await this.world.r?.precompile?.(this.root);
    if (this.dead) return;
    this.root.visible = true; this.ready = true;
  }
  dispose() {
    this.dead = true;
    if (this.idle && globalThis.cancelIdleCallback) cancelIdleCallback(this.idle);
    this.walkers.dispose(); this.boatSet.dispose(); this.wakes.dispose(); this.root.removeFromParent();
  }

  /** The street edges' lanes, nearest the visitor first, in the page's idle time. */
  workLanes() {
    if (this.dead || this.idle) return;
    const go = (dl) => {
      this.idle = 0;
      if (this.dead) return;
      if (!this.queue || this.queue.moved) {
        this.queue = this.walk.edges.filter((e) => !e.ready).sort((a, b) => len2(a.mx - _cam.x, a.mz - _cam.z) - len2(b.mx - _cam.x, b.mz - _cam.z));
        this.queue.at = [_cam.x, _cam.z];
      }
      const t0 = performance.now();
      while (this.queue.length && (dl ? dl.timeRemaining() > 2 : performance.now() - t0 < 3)) walkLanes(this.queue.shift(), this.site.collide);
      if (this.queue.length) this.idle = globalThis.requestIdleCallback ? requestIdleCallback(go, { timeout: 500 }) : setTimeout(go, 30);
    };
    this.idle = globalThis.requestIdleCallback ? requestIdleCallback(go, { timeout: 500 }) : setTimeout(go, 30);
  }

  /** The visitor in the settlement's frame (_cam, _fwd). */
  view(camera) {
    _inv.copy(this.site.group.matrixWorld).invert();
    _cam.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(_inv);
    _fwd.set(0, 0, -1).transformDirection(camera.matrixWorld).transformDirection(_inv);
  }
  /** Is (x, y, z) within the view (a generous cone) or very near? */
  seen(x, y, z, near = 22) {
    const dx = x - _cam.x, dy = y - _cam.y, dz = z - _cam.z, d = len3(dx, dy, dz);
    return d < near || (dx * _fwd.x + dy * _fwd.y + dz * _fwd.z) / d > 0.2;
  }

  update(dt) {
    this.t += dt;
    const rain = ENV.rain.value, night = ENV.night.value;
    this.wetness = rain > 0.15 ? 1 : rain < 0.06 ? 0 : this.wetness;
    if (this.queue && len2(_cam.x - this.queue.at[0], _cam.z - this.queue.at[1]) > 40) this.queue.moved = true;
    if (!this.idle && !this.allReady) { this.allReady = this.walk.edges.every((e) => e.ready); if (!this.allReady) this.workLanes(); }
    this.stepWalkers(dt, night);
    this.stepBoats(dt);
    this.draw();
  }

  // ── the walkers ──
  colours(k, out) {
    // c1, c2 over the cloth's base; the skin over its own; c3 the cap or the umbrella
    const sh = () => 0.88 + rand() * 0.22;
    out.set(factor('cloth', pick(k.c1), sh()), 0);
    out.set(factor('cloth', pick(k.c2), sh()), 3);
    out.set(factor('skin', rand() < 0.75 ? 'skin_light' : 'skin_medium', 0.9 + rand() * 0.18), 6);
    out.set(factor('cloth', pick(k.c3 ?? ['cloth_black']), sh()), 9);
    return out;
  }
  candidates(night) {
    // the street edges near enough to spawn on, weighted by length and busyness (the markets by day)
    const P = this.P.walkers, list = this.cands, cum = this.cum ??= new Float64Array(this.walk.edges.length); list.length = 0; let tot = 0;
    for (const e of this.walk.edges) {
      if (!e.ready) continue;
      const d = len2(e.mx - _cam.x, e.mz - _cam.z);
      if (d > P.reach - 8 || d < 4) continue;
      tot += e.L * e.weight * (1 + (e.market || 0) * 3 * (1 - night)); cum[list.length] = tot; list.push(e);
    }
    this.candTot = tot;
  }
  spawnWalker(night) {
    const P = this.P.walkers, list = this.cands;
    if (!list.length) return;
    const r = rand() * this.candTot; let e = list[list.length - 1];
    for (let i = 0; i < list.length; i++) if (this.cum[i] >= r) { e = list[i]; break; }
    const dir = rand() < 0.5 ? 1 : -1, lo = Math.max(0.5, e.limB + 0.5), hi = Math.min(e.L - 0.5, e.limA - 0.5);
    if (hi <= lo) return;
    const s = lo + rand() * (hi - lo), prefR = 0.25 + rand() * 0.7, u = e.off[e.K - 1];
    const j = Math.floor(s / e.step), k = (_q.o = dir * prefR * u, this.walk.freeLane(e, j - 1, j + 2));
    if (k < 0) return;
    const x = e.ax + e.ux * s + e.nx * e.off[k], z = e.az + e.uz * s + e.nz * e.off[k], y = this.walk.heightAt(e, s);
    const d = len2(x - _cam.x, z - _cam.z);
    if (d > P.reach - 5 || (d < P.spawnMin && this.seen(x, y + 1, z, 8))) return;
    if (!spawnAllowed(this.arr, this.t, x, z)) return;
    for (const w of this.W) if (w.on && Math.abs(w.x - x) < 1.2 && Math.abs(w.z - z) < 1.2) return;
    let w = null; for (const q of this.W) if (!q.on) { w = q; break; }
    if (!w) return false;
    // who: by the street (the market's people where the shops are)
    let tot = 0; for (const k2 of this.kindsW) tot += k2.weight * (e.market > 0.3 ? k2.market : 1);
    let rr = rand() * tot, K = this.kindsW[0];
    for (const k2 of this.kindsW) { rr -= k2.weight * (e.market > 0.3 ? k2.market : 1); if (rr <= 0) { K = k2; break; } }
    const h = K.h ? lerp(K.h[0], K.h[1], rand()) : 0.95 + rand() * 0.1, girth = 0.93 + rand() * 0.14;
    w.on = true; w.K = K; w.e = e; w.dir = dir; w.x = x; w.z = z; w.y = y; w.yaw = Math.atan2(-e.ux * dir, -e.uz * dir); w.v = 0.5;
    w.vT = w.cruise = lerp(K.speed[0], K.speed[1], rand()); w.prefR = prefR; w.bias = 0; w.ph = rand() * TAU;
    w.sx = girth; w.sy = h; w.sz = girth * 0.97; w.wet = this.wetness > 0.5; w.wetAt = 0; w.next = null; w.prev = null; w.stuck = 0; w.turning = 0; w.born = this.t;
    this.colours(K, w.c);
    return true;
  }
  /** May walker w stand at (x, z): on its edge's lanes, the next one's or the last one's, free? */
  okW(w, x, z) { _q.x = x; _q.z = z; const net = this.walk; return net.okOn(w.e) || (!!w.next && net.okOn(w.next)) || net.okOn(w.prev); }
  /** The next edge from the node at the end of w's way (not back, unless nothing else), or null. */
  nextEdge(w) {
    const e = w.e, node = w.dir > 0 ? e.b : e.a, opts = this.walk.adj[node];
    let tot = 0, best = null, bd = 1;
    for (const i of opts) {
      const f = this.walk.edges[i];
      if (f === e || !f.ready) continue;
      const fd = f.a === node ? 1 : -1, room = fd > 0 ? f.limA : f.L - f.limB;
      if (room < 2.5) continue;
      // going on straight is likelier than turning
      const str = (fd * f.ux * w.dir * e.ux + fd * f.uz * w.dir * e.uz) > 0.7 ? 2.2 : 1;
      const wt = str * (0.4 + f.weight) * (f.kind === 'bridge' ? 0.8 : 1);
      tot += wt; if (rand() * tot < wt) { best = f; bd = fd; }
    }
    w.nd = bd;
    return best;
  }
  stepWalkers(dt, night) {
    const P = this.P.walkers, N = Math.round((P.day * (1 - night) + P.night * night) * (this.wetness > 0.5 ? P.rain : 1));
    if (this.t > this.nextList) { this.nextList = this.t + 0.7; this.candidates(night); }
    let n = 0; for (const w of this.W) if (w.on) n++;
    if (n < N) for (let i = 0; i < 3 && n < N; i++) if (this.spawnWalker(night)) n++;
    const net = this.walk, LOOK = 1.5;
    for (const w of this.W) {
      if (!w.on) continue;
      const e = w.e;
      let s = (w.x - e.ax) * e.ux + (w.z - e.az) * e.uz;
      const d = len2(w.x - _cam.x, w.z - _cam.z);
      // let go of: far, or too many (unseen)
      if (d > P.reach || (n > N + 2 && d > 40 && !this.seen(w.x, w.y + 1, w.z) && this.t - w.born > 4)) { w.on = false; n--; continue; }
      // the wet: umbrellas and capes, each in its own moment
      const wantWet = this.wetness > 0.5;
      if (wantWet !== w.wet) { if (!w.wetAt) w.wetAt = this.t + rand() * 12; else if (this.t > w.wetAt) { w.wet = wantWet; w.wetAt = 0; } } else w.wetAt = 0;
      // where the way goes on: on this edge to its limit, then the next one chosen at the node
      const lim = w.dir > 0 ? Math.min(e.L, e.limA) : Math.max(0, e.limB);
      let sT = s + w.dir * LOOK, te = e, tdir = w.dir;
      let vT = w.cruise;
      const endOfEdge = w.dir > 0 ? sT > e.L : sT < 0;
      const blockedAhead = w.dir > 0 ? e.limA < e.L && sT > lim : e.limB > 0 && sT < lim;
      if (endOfEdge && !blockedAhead) {
        if (w.next === null) w.next = this.nextEdge(w) ?? false;
        if (w.next) { const over = w.dir > 0 ? sT - e.L : -sT; te = w.next; tdir = w.nd; sT = tdir > 0 ? over : te.L - over; }
      }
      const dead = blockedAhead || (endOfEdge && !w.next);
      if (dead) {
        sT = w.dir > 0 ? Math.min(sT, lim) : Math.max(sT, lim);
        if (Math.abs(s - lim) < 0.9 || w.turning) {
          // at a dead end: unseen, gone indoors; else turned round
          if (!this.seen(w.x, w.y + 1, w.z, 25)) { w.on = false; n--; continue; }
          if (!w.turning) { w.turning = 1; w.dir = -w.dir; w.next = null; w.bias = 0; }
          sT = s + w.dir * LOOK; te = e; tdir = w.dir;
        }
        vT = Math.min(vT, 0.3 + Math.abs(s - lim) * 0.5);
      }
      if (w.turning && Math.abs(angleTo(w.yaw, Math.atan2(-e.ux * w.dir, -e.uz * w.dir))) < 0.3) w.turning = 0;
      // the lane: to the right of the way, aside for those met, round what stands in the street
      const uT = te.off[te.K - 1], oWant = Math.max(-uT, Math.min(uT, tdir * (w.prefR * uT + w.bias)));
      // (free all the way there: from here, on this edge, to the point ahead)
      const jT = Math.round(Math.max(0, Math.min(te.L, sT)) / te.step), jN = te === e ? Math.round(Math.max(0, Math.min(e.L, s)) / e.step) : (tdir > 0 ? 0 : te.n - 1);
      let k = (_q.o = oWant, net.freeLane(te, jT, jN));
      if (k < 0) k = (_q.o = oWant, net.freeLane(te, jT));
      if (k < 0) { k = (_q.o = 0, net.freeLane(te, jT)); vT = 0; }
      const oT = k >= 0 ? te.off[k] : 0, sC = Math.max(0, Math.min(te.L, sT));
      const tx = te.ax + te.ux * sC + te.nx * oT, tz = te.az + te.uz * sC + te.nz * oT;
      // others ahead: slow behind, step aside for those coming
      const hx = -Math.sin(w.yaw), hz = -Math.cos(w.yaw);
      for (const o of this.W) {
        if (o === w || !o.on) continue;
        const dx = o.x - w.x, dz = o.z - w.z;
        if (Math.abs(dx) > 2.6 || Math.abs(dz) > 2.6) continue;
        const dd = len2(dx, dz), ahead = (dx * hx + dz * hz) / (dd || 1);
        if (dd < 0.45) { w.x -= dx / (dd || 1) * 0.02; w.z -= dz / (dd || 1) * 0.02; }
        if (ahead < 0.75 || dd > 2.4) continue;
        const same = hx * -Math.sin(o.yaw) + hz * -Math.cos(o.yaw);
        if (same > 0.3) vT = Math.min(vT, Math.max(0, o.v - 0.05) * (dd < 1.1 ? 0.5 : 1));
        else w.bias = Math.min(uT, w.bias + dt * 1.5);
      }
      w.bias = Math.max(0, w.bias - dt * 0.25);
      // a visitor standing in the way: held back short of them (walker-rules.js)
      vT = holdBack(vT, w.x, w.z, w.y, w.yaw, _cam.x, _cam.y, _cam.z);
      if (vT < 0.05) { w.stuck += dt; if (w.stuck > 4 && !w.turning) { w.turning = 1; w.dir = -w.dir; w.next = null; w.stuck = 0; } } else w.stuck = 0;
      // steer toward the point ahead, walk
      const want = Math.atan2(-(tx - w.x), -(tz - w.z));
      const turnRate = w.turning ? 2.2 : 2.8;
      w.yaw += Math.max(-turnRate * dt, Math.min(turnRate * dt, angleTo(w.yaw, want)));
      const vTurn = w.turning ? 0.35 : 1;
      w.v += Math.max(-1.6 * dt, Math.min(0.9 * dt, vT * vTurn - w.v));
      // (never into what stands in the street or out of the way: the step checked against the lanes; along the way only, else none)
      let nx2 = w.x - Math.sin(w.yaw) * w.v * dt, nz2 = w.z - Math.cos(w.yaw) * w.v * dt;
      if (!this.okW(w, nx2, nz2)) {
        const along = (-Math.sin(w.yaw) * e.ux - Math.cos(w.yaw) * e.uz) * w.v * dt;
        nx2 = w.x + e.ux * along; nz2 = w.z + e.uz * along;
        if (!this.okW(w, nx2, nz2)) { nx2 = w.x; nz2 = w.z; w.v *= 0.5; }
      }
      w.x = nx2; w.z = nz2;
      w.ph = (w.ph + w.v * dt / w.K.stride * TAU) % TAU;
      // on to the next edge once past this one's end
      s = (w.x - e.ax) * e.ux + (w.z - e.az) * e.uz;
      if (w.prev && Math.abs((w.x - w.e.ax) * w.e.ux + (w.z - w.e.az) * w.e.uz - (w.dir > 0 ? 0 : w.e.L)) > 3) w.prev = null;
      if (w.next && (w.dir > 0 ? s > e.L : s < 0)) { w.prev = e; w.e = w.next; w.dir = w.nd; w.next = null; s = (w.x - w.e.ax) * w.e.ux + (w.z - w.e.az) * w.e.uz; }
      w.y = net.heightAt(w.e, Math.max(0, Math.min(w.e.L, s)));
    }
  }

  // ── the boats ──
  spawnBoat() {
    const P = this.P.boats;
    let e = null, seen = 0;
    for (const f of this.water.edges) if (len2(f.mx - _cam.x, f.mz - _cam.z) < P.reach - 10 && rand() * ++seen < 1) e = f;
    if (!e) return;
    const dir = rand() < 0.5 ? 1 : -1, s = 6 + rand() * Math.max(0, e.L - 12);
    // its size first (its hull's half-beam and half-length at scale 1 from the settlement's boat; the oar's loom trails 1.6 m past the stern)
    const H = this.kinds.boat.hull ?? [1.34, 3.55], sx = 0.74 + rand() * 0.08, sz = (6.4 + rand() * 1.0) / 7, hl = H[1] * sz, hw = H[0] * sx;
    const u = e.off[e.K - 1], k = (_q.o = dir * this.side(u, hw), this.water.freeLane(e, Math.floor(s - hl), Math.ceil(s + hl)));
    if (k < 0) return;
    const x = e.ax + e.ux * s + e.nx * e.off[k], z = e.az + e.uz * s + e.nz * e.off[k];
    const d = len2(x - _cam.x, z - _cam.z);
    if (d > P.reach || (d < P.spawnMin && this.seen(x, 1, z, 10))) return;
    // never overlapping one: well clear of the others, of the bridges and of the junctions
    for (const o of this.B) if (o.on && len2(o.x - x, o.z - z) < hl + o.hl + 12) return;
    for (const br of this.bridges) if (len2(br.at[0] - x, br.at[1] - z) < br.half + hl + 10) return;
    for (const n of this.junctions) if (len2(this.water.nodes[n][0] - x, this.water.nodes[n][1] - z) < hl + 16) return;
    let b = null; for (const q of this.B) if (!q.on) { b = q; break; }
    if (!b) return;
    // the water decides the boat where the settlement marks it (Lin'an: pleasure boats on the lake, cargo on the canals)
    const kind = e.kind === 'lake' ? 'covered' : e.kind === 'canal' ? 'cargo' : rand() < 0.6 ? 'covered' : 'cargo';
    const cb = b.c, cm = b.cm, cp = b.cp;
    const tone = 0.85 + rand() * 0.25; cb.set([tone, tone * (0.96 + rand() * 0.06), tone * 0.95], 0);
    const mt = 0.7 + rand() * 0.45; cb.set([mt * 0.95, mt * 0.92, mt * 0.85], 3);       // the matting, new and pale or old and dark
    cb.set([1, 1, 1], 6); cb.set(factor('fibre', pick(['sacking', 'reed_mat', 'thatch_palm']), 0.95 + rand() * 0.1), 9);
    this.colours(this.crew.boatman, cm); this.colours(this.crew.passenger, cp);
    b.on = true; b.e = e; b.dir = dir; b.x = x; b.z = z; b.yaw = Math.atan2(-e.ux * dir, -e.uz * dir); b.cruise = lerp(P.speed[0], P.speed[1], rand()); b.v = b.cruise * 0.8;
    b.ph = rand() * TAU; b.amp = 1; b.kind = kind; b.sx = sx; b.sz = sz; b.next = null; b.moored = 0; b.wait = 0; b.born = this.t;
    b.passenger = kind === 'covered' && rand() < 0.55; b.hl = hl; b.hw = hw; b.hx = -Math.sin(b.yaw); b.hz = -Math.cos(b.yaw);
    b.brI = -1; b.exI = -1; b.jI = -1; b.give = null; b.stuck = 0;
  }
  /** How far boat q can go astern on its lane (m, to 30): clear of the boats behind, those standing in the canal, its edge's start. */
  roomBehind(q) {
    const e = q.e, s = (q.x - e.ax) * e.ux + (q.z - e.az) * e.uz, pe = this.prevCanal(q);
    // (never back into a junction: short of the node behind by its length and 6 m)
    const back = q.dir > 0 ? s : e.L - s, jn = this.water.adj[q.dir > 0 ? e.a : e.b].length > 2;
    const node = q.dir > 0 ? e.a : e.b, far = pe ? (pe.a === node ? pe.b : pe.a) : -1;
    const more = pe ? (this.water.adj[far].length > 2 ? pe.L - q.hl - 6 : pe.L) : 0;
    let room = Math.min(30, jn ? back - q.hl - 6 : back + (pe ? more : -1));
    if (e.K > 1) {
      const o = (q.x - e.ax) * e.nx + (q.z - e.az) * e.nz, kk = Math.max(0, Math.min(e.K - 1, Math.round((o - e.off[0]) / (e.off[1] - e.off[0])))), j0 = Math.round(s / e.step);
      for (let i = 1; i <= 30; i++) {
        const j = j0 - q.dir * i;
        if (j < 0 || j >= e.n) break;
        if (e.blocked[j * e.K + kk]) { room = Math.min(room, i * e.step - 0.6); break; }
      }
    }
    for (const o of this.B) {
      if (o === q || !o.on) continue;
      const dx = o.x - q.x, dz = o.z - q.z, fwd = dx * q.hx + dz * q.hz;
      if (fwd >= 0 || fwd < -40) continue;
      const cs = q.hx * o.hx + q.hz * o.hz, sn = Math.abs(q.hx * o.hz - q.hz * o.hx);
      if (Math.abs(dx * -q.hz + dz * q.hx) > q.hw + o.hl * sn + o.hw * Math.abs(cs) + 0.35) continue;
      room = Math.min(room, -fwd - q.hl - (o.hl * Math.abs(cs) + o.hw * sn) - 1.6 - 1);       // (its own oar trailing astern)
    }
    return Math.max(0, room);
  }
  /**
   * Is boat b's giving way to o done: o gone, or by (behind b), or out of b's way (clear of its beam with 0.4 m, and
   * 2 m off), as both lie; or, giving way out of a narrow or bridge, out of it.
   */
  giveDone(b, o) {
    if (!o || !o.on) return true;
    if (b.giveZ >= 0) return !(b.brI === b.giveZ && Math.abs(b.brRel) < this.bridges[b.giveZ].half + b.hl + 2);
    const dx = o.x - b.x, dz = o.z - b.z, fwd = dx * b.hx + dz * b.hz, lat = Math.abs(dx * -b.hz + dz * b.hx);
    const sn = Math.abs(b.hx * o.hz - b.hz * o.hx), cs = Math.abs(b.hx * o.hx + b.hz * o.hz);
    return fwd < -(b.hl + o.hl) || (lat > b.hw + o.hl * sn + o.hw * cs + 0.4 && hullGap(b.x, b.z, b.hx, b.hz, b.hl, b.hw, o) > 2);
  }
  /** The stretch of the same canal behind boat q's edge (in line with it, from the node at its back), or null. */
  prevCanal(q) {
    const e = q.e, node = q.dir > 0 ? e.a : e.b;
    if (this.water.adj[node].length > 2) return null;
    for (const i of this.water.adj[node]) { const f = this.water.edges[i]; if (f !== e && Math.abs(f.ux * e.ux + f.uz * e.uz) > 0.99) return f; }
    return null;
  }
  /** Would boat b, moved st across canal e (signed, along its normal), come within 0.5 m of a boat alongside (their extents across as they lie)? */
  alongside(b, e, st) {
    const ab = across(b, e);
    for (const o of this.B) {
      if (o === b || !o.on || Math.abs(o.x - b.x) > 14 || Math.abs(o.z - b.z) > 14) continue;
      const ds = (o.x - b.x) * e.ux + (o.z - b.z) * e.uz, dn = (o.x - b.x) * e.nx + (o.z - b.z) * e.nz;
      if (Math.abs(ds) < b.hl + o.hl + 1 && Math.sign(dn) === Math.sign(st) && Math.abs(dn) - Math.abs(st) < ab + across(o, e) + 0.5) return true;
    }
    return false;
  }
  /** The offset of a boat's own (right-hand) side of a canal whose lanes reach u: its beam's width off the middle, at least. */
  side(u, hw) { return Math.min(u, Math.max(0.6 * u, hw + 0.5)); }
  /** Which bridge and which junction boat b is coming to or is in (they are passed one at a time), since when. */
  claims(b) {
    // (along its way, not its heading: a boat swinging across the canal still knows what it is coming to)
    const px = b.e.ux * b.dir, pz = b.e.uz * b.dir;
    let bi = -1, br = 1e9;
    for (let i = 0; i < this.bridges.length; i++) {
      const B = this.bridges[i], dx = B.at[0] - b.x, dz = B.at[1] - b.z, rel = dx * px + dz * pz, lat = Math.abs(dx * -pz + dz * px);
      if (lat < 4.5 && rel > -(B.half + b.hl + 1) && rel < Math.max(36, B.half + 2 * b.hl + 20) && rel < br) { bi = i; br = rel; }
    }
    if (bi !== b.brI) { b.brI = bi; b.brT = this.t; }
    b.brRel = br;
    // (the one it has just come through, till it is past those waiting there)
    b.exI = -1;
    for (let i = 0; i < this.bridges.length; i++) {
      const B = this.bridges[i], dx = B.at[0] - b.x, dz = B.at[1] - b.z, rel = dx * px + dz * pz, lat = Math.abs(dx * -pz + dz * px);
      if (i !== bi && lat < 4.5 && rel <= -(B.half + b.hl + 1) && rel > -(B.half + 2 * b.hl + 10)) b.exI = i;
    }
    let ji = -1, jd = 1e9, jr = 0;
    for (const n of this.junctions) {
      const dx = this.water.nodes[n][0] - b.x, dz = this.water.nodes[n][1] - b.z, dd = len2(dx, dz), rel = dx * px + dz * pz;
      if (dd < 36 && (rel > 0 || dd < b.hl + 6) && dd < jd) { ji = n; jd = dd; jr = rel; }
    }
    if (ji !== b.jI) { b.jI = ji; b.jT = this.t; }
    b.jD = jd; b.jRel = jr;
  }
  nextCanal(b) {
    const e = b.e, node = b.dir > 0 ? e.b : e.a;
    let best = null, seen = 0;
    for (const i of this.water.adj[node]) {
      const f = this.water.edges[i];
      if (f === e || !(f.a === node ? f.limA > 12 : f.L - f.limB > 12)) continue;
      if (rand() * ++seen < 1) best = f;
    }
    if (best) b.nd = best.a === node ? 1 : -1;
    return best;
  }
  stepBoats(dt) {
    const P = this.P.boats;
    let n = 0; for (const b of this.B) if (b.on) n++;
    if (n < P.count && rand() < 0.2) this.spawnBoat();
    const net = this.water, LOOK = 7;
    for (const b of this.B) if (b.on) { b.hx = -Math.sin(b.yaw); b.hz = -Math.cos(b.yaw); this.claims(b); }
    // which way each single-file stretch is open: the way of those in it (all one way); none in it, the way of the
    // first still coming to it; boats in it both ways (one giving way), as it was
    for (const R of this.bridges) { R.nP = 0; R.nM = 0; R.first = 1e9; R.fd = 0; }
    for (const b of this.B) {
      if (!b.on || b.brI < 0 || b.moored) continue;
      const R = this.bridges[b.brI], sg = Math.sign((b.e.ux * R.ux + b.e.uz * R.uz) * b.dir);
      // (in it, or on the last 6 m into it and still going)
      if (Math.abs(b.brRel) < R.half + b.hl || (b.brRel > 0 && b.brRel < R.half + b.hl + 6 && b.v > 0.2)) { if (sg > 0) R.nP++; else R.nM++; }
      else if (!b.give && b.brT < R.first) { R.first = b.brT; R.fd = sg; }
    }
    for (const R of this.bridges) R.lock = R.nP && !R.nM ? 1 : R.nM && !R.nP ? -1 : R.nP && R.nM ? (R.lock ?? 0) : R.fd;
    for (const b of this.B) {
      if (!b.on) continue;
      const e = b.e;
      let s = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
      const d = len2(b.x - _cam.x, b.z - _cam.z);
      // (let go of: far; tied up a while, or, the last resort, stuck facing another long after giving way failed, or waiting
      // very long, out of sight)
      if (d > P.reach + 10 || ((b.moored > 20 || b.stuck > 40 || b.wait > 150) && (d > 70 || !this.seen(b.x, 1, b.z, 30)))) { b.on = false; continue; }
      let sT = s + b.dir * LOOK, te = e, tdir = b.dir, vT = b.cruise;
      // a stretch no boat can pass (the standing boats leave no room): stop short of it and wait there, as at a canal's end
      const lim = b.dir > 0 ? e.limA : e.limB, shut = b.dir > 0 ? e.limA < e.L : e.limB > 0;
      const endOf = shut ? (b.dir > 0 ? sT > lim - 3 : sT < lim + 3) : (b.dir > 0 ? sT > e.L : sT < 0);
      if (endOf && shut) {
        const left = Math.abs(lim - s);
        sT = b.dir > 0 ? Math.min(sT, lim) : Math.max(sT, lim); vT = Math.min(vT, Math.max(0, (left - 5) * 0.25));
        if (vT < 0.02) b.moored += dt;
      } else if (endOf) {
        if (b.next === null) b.next = this.nextCanal(b) ?? false;
        if (b.next) { const over = b.dir > 0 ? sT - e.L : -sT; te = b.next; tdir = b.nd; sT = tdir > 0 ? Math.min(over, te.L) : Math.max(te.L - over, 0); }
        else {
          // the canal's end: slow, stop short of it and tie up
          const left = b.dir > 0 ? e.L - s : s;
          sT = b.dir > 0 ? e.L : 0; vT = Math.min(vT, Math.max(0, (left - 5) * 0.25));
          if (vT < 0.02) b.moored += dt;
        }
      }
      const sC = Math.max(0, Math.min(te.L, sT));
      // under a bridge: slow and in the middle of the arch
      let under = false;
      for (const br of te.bridges) if (Math.abs(br.s - sC) < br.half + 6) under = true;
      for (const br of e.bridges) if (Math.abs(br.s - s) < br.half + 4) under = true;
      if (under) vT = Math.min(vT, P.bridgeSpeed);
      // slow into a turn at a junction (the hull swings round tighter, never wide across the other lane)
      if (te !== e && (te.ux * tdir * e.ux * b.dir + te.uz * tdir * e.uz * b.dir) < 0.7) vT = Math.min(vT, 0.6);
      const u = te.off[te.K - 1];
      let oWant = tdir * this.side(u, b.hw), held = false, meet = false, meetD = 1e9, meetO = 0, heldBy = -1, queued = false, blk = null, blkG = 1e9, blkZ = -1;
      // others (their hulls as they lie, seen from b): wait for the one through a bridge or a junction first; follow the
      // one ahead on the lane at a distance; keep to the bank meeting one, and (the later of the two) stop short if still in the way
      const hx = b.hx, hz = b.hz, me = this.B.indexOf(b);
      for (const o of this.B) {
        if (o === b || !o.on) continue;
        const dx = o.x - b.x, dz = o.z - b.z;
        if (Math.abs(dx) > 44 || Math.abs(dz) > 44) continue;
        const cs = hx * o.hx + hz * o.hz, sn = Math.abs(hx * o.hz - hz * o.hx), mine = me > this.B.indexOf(o);
        // (one giving way holds nothing up, but the narrow or bridge it is in or going astern back into)
        if (!o.moored) {
          // a bridge: one way at a time (the one already under it, else the one there first)
          // (and the one just through it, coming on past those waiting, first of all)
          // (only while o is still ahead: once they are abreast, it has passed)
          const gIn = !!o.give && b.brI >= 0 && o.brI === b.brI && Math.abs(o.brRel) < this.bridges[b.brI].half + o.hl;
          if (b.brI >= 0 && (!o.give || gIn) && (o.brI === b.brI || o.exI === b.brI) && cs < -0.3 && dx * e.ux * b.dir + dz * e.uz * b.dir > 1) {
            // (before a narrow, room besides to cross over to its free lane once the way is clear)
            const hold = this.bridges[b.brI].half + b.hl + o.hl + (this.bridges[b.brI].free ? 14 : 8), bIn = b.brRel < hold, oIn = o.brRel < hold;
            // (the way it is open: those going it are in it, or the first to come wanted it; else as before)
            const lk = this.bridges[b.brI].lock, bs = Math.sign((e.ux * this.bridges[b.brI].ux + e.uz * this.bridges[b.brI].uz) * b.dir);
            if (gIn || o.exI === b.brI || (lk ? lk !== bs : oIn !== bIn ? oIn : o.brT !== b.brT ? o.brT < b.brT : mine)) {
              // (waiting at its side, below: on slowly till there, if it stopped short of it)
              const W = this.bridges[b.brI].free, off = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, lim = b.brRel - hold;
              const side = (W ? -Math.sign((W[0] - e.ax) * e.nx + (W[1] - e.az) * e.nz) || b.dir : b.dir) * e.off[e.K - 1];
              vT = Math.min(vT, Math.abs(off - side) > 0.5 && lim > -6 ? Math.max(0.25, stopV(lim)) : stopV(lim)); held = true; heldBy = b.brI;
              // (held up by one standing in it, itself held up: it is the one to give way, if it can)
              if (!blk && o.v < 0.05 && Math.abs(o.brRel) < this.bridges[b.brI].half + o.hl) { blk = o; blkZ = b.brI; }
            }
          }
          // a junction: one at a time, but for those going the same way
          if (b.jI >= 0 && o.jI === b.jI && cs < 0.7 && b.jRel > 0 && !o.give) {
            // (one leaving it holds it only while still in it: else a queue beyond it would hold it for good)
            const hb = 4.5 + b.hl + o.hl + 10, bIn = b.jD < hb, oIn = o.jD < hb, gone = o.jRel < 0 && o.jD > 4.5 + o.hl + 1;
            if (!gone && (oIn !== bIn ? oIn : o.jT !== b.jT ? o.jT < b.jT : mine)) { vT = Math.min(vT, stopV(b.jD - hb)); held = true; }
          }
        }
        const fwd = dx * hx + dz * hz, lat = dx * -hz + dz * hx;
        if (fwd <= 0) continue;
        // (one coming the other way, all but touching ahead, in the way whatever the lanes: a face-off if neither gets on)
        if (cs < 0.3 && fwd < 12 && !blk && hullGap(b.x, b.z, hx, hz, b.hl, b.hw, o) < 1.5 &&
          Math.abs(dx * e.nx + dz * e.nz) - acrossOf(b, e) - acrossOf(o, e) <= 0.4) { blk = o; blkG = 0; }
        if (cs < 0.5 && fwd < 36 && fwd < meetD) { meet = true; meetD = fwd; meetO = (o.x - te.ax) * te.nx + (o.z - te.az) * te.nz; }
        // o's extent across and along b's heading; in b's way if within b's beam of it with 0.6 m to spare
        const across = o.hl * sn + o.hw * Math.abs(cs), along = o.hl * Math.abs(cs) + o.hw * sn;
        if (Math.abs(lat) > b.hw + across + (cs > 0.5 ? 0.6 : 0.35)) continue;
        // (one coming the other way with room between across the canal passes: the last check below keeps the hulls apart)
        if (cs <= 0.5 && Math.abs(dx * e.nx + dz * e.nz) - acrossOf(b, e) - acrossOf(o, e) > 0.4) continue;
        const gap = fwd - b.hl - along;
        // (not into a bridge or a narrow while the one ahead going the same way stands, or nearly, short of its far side:
        // it would stand in it, holding up those coming the other way; it waits before it instead)
        if (cs > 0.5 && b.brI >= 0 && o.v < 0.3 && !o.moored) {
          const R = this.bridges[b.brI], c0 = R.half + b.hl;
          if (b.brRel > c0 && fwd < b.brRel + R.half + b.hl + o.hl + 6) { vT = Math.min(vT, stopV(b.brRel - c0 - 1)); held = true; heldBy = b.brI; }
        }
        if (cs > 0.5) {
          // following: 2.5 m clear of its oar, at its pace
          const g = gap - 1.6 * cs;
          vT = Math.min(vT, Math.max(0, o.v * cs + 0.25 * (g - 2.5)), stopV(g - 1.2));
          if (o.moored && g < 6) queued = true;
        } else {
          vT = Math.min(vT, stopV(gap - (mine ? 2.5 : 0.8)));
          if (gap < 8 && gap < blkG) { blk = o; blkG = gap; }
        }
      }
      // (never on into a boat standing in the canal: stop short of the first blocked sample ahead on the lane it is in)
      let standing = 0;
      if (e.K > 1) {
        const o = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, kk = Math.max(0, Math.min(e.K - 1, Math.round((o - e.off[0]) / (e.off[1] - e.off[0])))), j0 = Math.round(s / e.step);
        // (and the lanes it is crossing toward, its hull sweeping them as it goes)
        const lv = -Math.sin(b.yaw) * e.nx - Math.cos(b.yaw) * e.nz, k1 = Math.max(0, Math.min(e.K - 1, kk + (Math.abs(lv) > 0.05 ? 2 * Math.sign(lv) : 0)));
        for (let i = 0; i <= 14; i++) {
          const j = j0 + b.dir * i;
          if (j < 0 || j >= e.n) break;
          let bl = e.blocked[j * e.K + kk];
          if (i >= 2) for (let q = Math.min(kk, k1); q <= Math.max(kk, k1); q++) bl |= e.blocked[j * e.K + q];
          if (bl) { vT = Math.min(vT, Math.max(stopV(i * e.step - 0.6), i > 1 ? 0.2 : 0)); standing = Math.max(0.1, i * e.step); break; }
        }
      }
      // face to face with one, neither getting on (8 s): the one with more room behind (else the lower id) gives way,
      // sculling astern to a passing place and over to the side till the other is by; it then comes after it
      if (b.give) {
        if (this.giveDone(b, b.give) || this.t - b.giveT > 90) { b.give = null; b.wait = 0; }
      }
      if (!blk && b.guard && b.guard.hx * b.hx + b.guard.hz * b.hz < 0.5) blk = b.guard;
      b.stuck = blk && b.wait > 0 && !held ? b.stuck + dt : 0;
      if (!b.give && blk && b.wait > 8 && blk.give !== b && !blk.give) {
        const rb = this.roomBehind(b), ro = this.roomBehind(blk);
        // (both in one narrow or under one bridge: the one with less of it behind backs out; one held by one standing in
        // it: that one; else the one with more room behind, or the lower id)
        let g = blkZ >= 0 && ro >= 1.5 ? blk : Math.abs(rb - ro) < 2 ? (me < this.B.indexOf(blk) ? b : blk) : rb > ro ? b : blk;
        if (b.brI >= 0 && blk.brI === b.brI) {
          const R = this.bridges[b.brI], ob = R.half + b.hl - b.brRel, oo = R.half + blk.hl - blk.brRel;
          if (ob > 0 && oo > 0) g = (ob <= oo && rb >= Math.min(ob, 1.5)) || ro < Math.min(oo, 1.5) ? b : blk;
        }
        g.give = g === b ? blk : b; g.giveT = this.t; g.wait = 0; g.giveZ = g.brI >= 0 && Math.abs(g.brRel) < this.bridges[g.brI].half + g.hl ? g.brI : -1;
        // (not one that would be done at once: the other then, if not done either, else neither)
        if (this.giveDone(g, g.give)) {
          g.give = null; const h = g === b ? blk : b;
          h.give = g; h.giveT = this.t; h.wait = 0; h.giveZ = -1;
          if (this.giveDone(h, g)) h.give = null;
        }
      }
      // (one that cannot go astern hands it to the other, if that one can)
      if (b.give && this.t - b.giveT > 3 && this.roomBehind(b) < 1.5 && !b.give.give && this.roomBehind(b.give) >= 1.5) {
        const o = b.give; o.give = b; o.giveT = this.t; o.wait = 0; o.giveZ = -1; b.give = null; b.wait = 0;
      }
      if (b.give) {
        const o = b.give, r = this.roomBehind(b), dd = len2(o.x - b.x, o.z - b.z);
        b.brT = b.jT = this.t;                        // (and the others go first through what it was waiting for)
        // (astern out of the narrow or from under the bridge it is in, else till 6 m clear of the other's bow)
        const inZ = b.brI >= 0 && Math.abs(b.brRel) < this.bridges[b.brI].half + b.hl;
        vT = r > 1.5 && (inZ || dd - b.hl - o.hl < 6) ? -Math.min(0.45, stopV(r - 1.5)) : Math.min(vT, 0);
        // (to its waiting side if it is waiting for one, else away from the other)
        under = false;
        if (!held) { meet = true; meetO = (o.x - te.ax) * te.nx + (o.z - te.az) * te.nz; }
      }
      // meeting one: to the side away from it (both so: they part); waiting for a bridge, at its own bank; for a narrow,
      // on the other side from its free lane (the one coming through it keeps to that lane till past)
      const mine0 = (b.x - te.ax) * te.nx + (b.z - te.az) * te.nz;
      if (meet && !held) oWant = Math.abs(mine0 - meetO) < 0.3 ? tdir * u : Math.sign(mine0 - meetO) * u;
      if (held) {
        under = false; oWant = tdir * u;
        const W = heldBy >= 0 ? this.bridges[heldBy].free : null;
        if (W) oWant = -Math.sign((W[0] - te.ax) * te.nx + (W[1] - te.az) * te.nz) * u || oWant;
      }
      if (under) oWant = 0;
      // (in line behind one tied up at a canal's end: tied up too)
      if (queued && vT < 0.02 && b.v < 0.05) b.moored += dt;
      b.wait = vT < 0.02 && !b.moored && !b.give ? b.wait + dt : 0;
      const jT = Math.round(sC / te.step), jN = te === e ? Math.round(Math.max(0, Math.min(e.L, s)) / e.step) : jT;
      // (a lane free well ahead first: a boat takes 15 m to cross the canal round one standing in it; but not
      // meeting another or waiting for one, when it keeps to its own bank)
      const jF = Math.round(Math.max(0, Math.min(e.L, s + b.dir * 20)) / e.step);
      let k = -1;
      if (held || (meet && !standing)) k = -1;
      else if (te === e) k = (_q.o = oWant, net.freeLane(e, jN, jF));
      else if (Math.abs(te.ux * e.ux + te.uz * e.uz) > 0.99) {
        // (on into the next stretch of the same canal: free from here to its end and on along the next to as far ahead)
        const jE = b.dir > 0 ? e.n - 1 : 0, rest = 20 - (b.dir > 0 ? e.L - s : s), jF2 = Math.round(Math.max(0, Math.min(te.L, tdir > 0 ? rest : te.L - rest)) / te.step);
        const j0 = tdir > 0 ? 0 : te.n - 1, j1 = tdir > 0 ? Math.max(jT, jF2) : Math.min(jT, jF2);
        k = (_q.o = oWant, net.freeLaneOn2(e, jN, jE, te, j0, j1, (te.ux * e.ux + te.uz * e.uz) < 0));
      }
      if (k < 0) k = (_q.o = oWant, net.freeLane(te, jT, jN));
      if (k < 0) k = (_q.o = oWant, net.freeLane(te, jT));
      if (k < 0) { vT = Math.min(vT, 0); k = (_q.o = 0, net.freeLane(te, jT)); }
      // the lane eased toward, not jumped to
      const oL = k >= 0 ? te.off[k] : 0;
      // (aimed nearer, to turn harder, when the lane it is in runs into a boat standing in the canal)
      const sA = standing && te === e ? Math.max(0, Math.min(e.L, s + b.dir * Math.max(2, Math.min(LOOK, standing * 0.5)))) : sC;
      const tx = te.ax + te.ux * sA + te.nx * oL, tz = te.az + te.uz * sA + te.nz * oL;
      // (going astern: held in line with the canal)
      const want = b.v < 0 || vT < 0 ? Math.atan2(-e.ux * b.dir, -e.uz * b.dir) : Math.atan2(-(tx - b.x), -(tz - b.z));
      // (a boat turns as it moves through the water: never round on the spot, sweeping its ends into a neighbour)
      const rate = 0.32 * Math.min(1, Math.abs(b.v) / 0.6);
      const yaw0 = b.yaw, x0 = b.x, z0 = b.z;
      b.yaw += Math.max(-rate * dt, Math.min(rate * dt, angleTo(b.yaw, want)));
      b.v += Math.max(-0.35 * dt, Math.min(0.12 * dt, vT - b.v));
      if (b.v < 0 && !b.give) b.v = Math.min(0, b.v + 0.35 * dt);
      // (kept along the canal and inside its lanes away from the junctions: the hull never swings to a wall)
      const sNow = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
      const nearJ = (sNow < 10 && net.adj[e.a].length > 2) || (sNow > e.L - 10 && net.adj[e.b].length > 2);
      if (!nearJ) {
        // (the bow swung out no nearer the wall than the lanes allow)
        const axis = Math.atan2(-e.ux * b.dir, -e.uz * b.dir), dev = angleTo(axis, b.yaw);
        const o = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, u = e.off[e.K - 1];
        const outward = Math.sign(-Math.sin(b.yaw) * e.nx - Math.cos(b.yaw) * e.nz) === Math.sign(o);
        const cap = outward ? Math.asin(Math.min(0.28, Math.max(0, u + 0.25 - Math.abs(o)) / 3.5)) : 0.28;
        if (Math.abs(dev) > cap) b.yaw = axis + Math.sign(dev) * cap;
        // (nor across toward a boat alongside: kept in line with the canal till clear of it)
        const lv = (-Math.sin(b.yaw) * e.nx - Math.cos(b.yaw) * e.nz) * b.v * dt;
        if (Math.abs(lv) > 1e-5 && this.alongside(b, e, lv)) b.yaw = axis;
        // (nor turned, its ends swinging out, if that brings it near one alongside)
        const sn0 = Math.abs(Math.sin(angleTo(axis, yaw0))), sn1 = Math.abs(Math.sin(angleTo(axis, b.yaw)));
        if (sn1 > sn0) {
          b.hx = -Math.sin(b.yaw); b.hz = -Math.cos(b.yaw);
          if (this.alongside(b, e, 1e-4) || this.alongside(b, e, -1e-4)) b.yaw = yaw0;
        }
      }
      b.hx = -Math.sin(b.yaw); b.hz = -Math.cos(b.yaw);
      b.x -= Math.sin(b.yaw) * b.v * dt; b.z -= Math.cos(b.yaw) * b.v * dt;
      // waiting, the boatman sculls the boat sideways to its lane (the yuloh can), if that brings it near no other
      const inLine = te === e ? 1 : Math.abs(te.ux * e.ux + te.uz * e.uz) > 0.99 ? Math.sign(te.ux * e.ux + te.uz * e.uz) : 0;
      if (inLine && b.v < 0.1 && vT < 0.1 && !nearJ) {
        const cur = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, df = oL * inLine - cur;
        if (Math.abs(df) > 0.05) {
          const st = Math.sign(df) * Math.min(Math.abs(df), 0.2 * dt);
          // (into no lane blocked by a boat standing there)
          const kk = e.K > 1 ? Math.max(0, Math.min(e.K - 1, Math.round((cur + st - e.off[0]) / (e.off[1] - e.off[0])))) : 0, jj = Math.max(0, Math.min(e.n - 1, Math.round(s / e.step)));
          const k0 = e.K > 1 ? Math.max(0, Math.min(e.K - 1, Math.round((cur - e.off[0]) / (e.off[1] - e.off[0])))) : 0;
          // (or out of one, toward its free lane)
          const kb = Math.max(0, Math.min(e.K - 1, k0 - Math.sign(st)));
          if ((!e.blocked[jj * e.K + kk] || (e.blocked[jj * e.K + k0] && e.blocked[jj * e.K + kb] && kb !== k0)) && !this.alongside(b, e, st)) {
            b.x += e.nx * st; b.z += e.nz * st;
            // (and brought round in line with the canal as it goes)
            const axis = Math.atan2(-e.ux * b.dir, -e.uz * b.dir), dv = angleTo(b.yaw, axis);
            b.yaw += Math.max(-0.04 * dt, Math.min(0.04 * dt, dv));
          }
        }
      }
      { const o = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, u = e.off[e.K - 1], s2 = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
        if (!nearJ && s2 > -1 && s2 < e.L + 1 && Math.abs(o) > u) { const c = Math.sign(o) * u - o; b.x += e.nx * c; b.z += e.nz * c; } }
      // (last of all: the hulls as they lie, never moved or turned nearer than 0.3 m to another's; else held where it was)
      b.hx = -Math.sin(b.yaw); b.hz = -Math.cos(b.yaw); b.guard = null;
      for (const o of this.B) {
        if (o === b || !o.on || Math.abs(o.x - b.x) > 12 || Math.abs(o.z - b.z) > 12) continue;
        const now = hullGap(b.x, b.z, b.hx, b.hz, b.hl, b.hw, o), was = hullGap(x0, z0, -Math.sin(yaw0), -Math.cos(yaw0), b.hl, b.hw, o);
        if (now < 0.3 && now < was) { b.x = x0; b.z = z0; b.yaw = yaw0; b.hx = -Math.sin(yaw0); b.hz = -Math.cos(yaw0); b.v = 0; b.guard = o; break; }
      }
      if (b.guard && !b.give && !b.moored) b.wait += dt;
      // the stroke: about one in 1.8 s under way, slowing to rest
      b.amp += (Math.min(1, Math.abs(b.v) / 0.6) - b.amp) * Math.min(1, dt * 0.8);
      b.ph = (b.ph + dt * TAU / 1.8 * (0.35 + 0.65 * b.amp)) % TAU;
      s = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
      // (on to the next canal once past the node, along it: a boat turning a corner may cut it, never passing the end of this one)
      // (going astern back past the node behind: on to the stretch of the canal there, the same way round)
      if (b.v < 0 && (b.dir > 0 ? s < 0 : s > e.L)) {
        const f = this.prevCanal(b);
        if (f) { b.dir = Math.sign(f.ux * e.ux + f.uz * e.uz) * b.dir; b.e = f; b.next = null; }
      }
      else if (b.next) {
        const nd = net.nodes[b.dir > 0 ? e.b : e.a], past = (b.x - nd[0]) * b.next.ux * b.nd + (b.z - nd[1]) * b.next.uz * b.nd > 0.5;
        if (past || (b.dir > 0 ? s > e.L : s < 0)) { b.e = b.next; b.dir = b.nd; b.next = null; }
      }
    }
  }

  // ── into the instance buffers ──
  draw() {
    const PW = this.P.walkers, PB = this.P.boats, W = this.walkers, B = this.boatSet;
    let k = 0;
    for (const w of this.W) {
      if (!w.on || k >= W.max) continue;
      const d = len2(w.x - _cam.x, w.z - _cam.z);
      if (!this.seen(w.x, w.y + 1, w.z, 26)) continue;
      const V = w.K.v, far = d > PW.far, v = w.wet ? (far ? V.wetF : V.wetN) : (far ? V.dryF : V.dryN);
      const amp = Math.min(1, w.v / 0.8);
      _S.x = w.x; _S.y = w.y; _S.z = w.z; _S.yaw = w.yaw; _S.roll = 0; _S.sx = w.sx; _S.sy = w.sy; _S.sz = w.sz; _S.ph = w.ph; _S.amp = amp; _S.v = v; _S.mode = 0; _S.swing = w.K.swing ?? 1; _S.legs = 1; _S.bounce = w.K.pole ? 1 : 0;
      W.put(k++, _S, w.c);
    }
    let kb = 0, kw = 0;
    const BO = this.kinds.boat, water = this.P.water;
    for (const b of this.B) {
      if (!b.on || kb + 2 > B.max) continue;
      const d = len2(b.x - _cam.x, b.z - _cam.z);
      if (!this.seen(b.x, 1, b.z, 40)) continue;
      const far = d > PB.far;
      const heave = Math.sin(b.ph * 2) * 0.012 * b.amp + Math.sin(this.t * 0.9 + b.sx * 40) * 0.006, roll = Math.sin(b.ph) * 0.012 * b.amp;
      const yaw = b.yaw + Math.sin(b.ph + 1) * 0.008 * b.amp, y = water + heave;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      _S.x = b.x; _S.y = y; _S.z = b.z; _S.yaw = yaw; _S.roll = roll; _S.sx = b.sx; _S.sy = 1; _S.sz = b.sz; _S.ph = 0; _S.amp = 0; _S.v = this.boatV[b.kind][far ? 1 : 0]; _S.mode = 0; _S.swing = 0; _S.legs = 0; _S.bounce = 0;
      B.put(kb++, _S, b.c);
      // the yuloh on its pin, swaying side to side as the sculler works it, its blade feathering
      const pin = at(b, cy, sy, BO.pin[0] * b.sx, BO.pin[2] * b.sz), psi = -0.27 * Math.sin(b.ph) * b.amp;
      _S.x = pin[0]; _S.y = y + BO.pin[1]; _S.z = pin[1]; _S.yaw = yaw + psi; _S.roll = 0.3 * Math.cos(b.ph) * b.amp; _S.sx = 1; _S.sy = 1; _S.sz = 1; _S.ph = 0; _S.amp = 0; _S.v = this.boatV.oar; _S.mode = 0; _S.swing = 0; _S.legs = 0; _S.bounce = 0;
      B.put(kb++, _S, b.c);
      // the boatman at the stern, across the boat, rocking with the oar; a passenger under the awning
      if (k < W.max) {
        const m = at(b, cy, sy, -0.38 * b.sx, BO.stern * b.sz), Cv = this.crew.boatman.v, wet = this.wetness > 0.5;
        _S.x = m[0]; _S.y = y + BO.deck; _S.z = m[1]; _S.yaw = yaw - Math.PI / 2; _S.roll = 0; _S.sx = 1; _S.sy = 1; _S.sz = 1; _S.ph = b.ph; _S.amp = b.amp; _S.v = wet ? (far ? Cv.wetF : Cv.wetN) : (far ? Cv.dryF : Cv.dryN); _S.mode = 1; _S.swing = 1; _S.legs = 0; _S.bounce = 0;
        W.put(k++, _S, b.cm);
      }
      if (b.passenger && k < W.max) {
        const m = at(b, cy, sy, BO.passenger[0] * b.sx, BO.passenger[2] * b.sz), Cv = this.crew.passenger.v;
        _S.x = m[0]; _S.y = y + BO.passenger[1]; _S.z = m[1]; _S.yaw = yaw + 0.25; _S.roll = 0; _S.sx = 1; _S.sy = 1; _S.sz = 1; _S.ph = 0; _S.amp = 0; _S.v = far ? Cv.dryF : Cv.dryN; _S.mode = 0; _S.swing = 0; _S.legs = 0; _S.bounce = 0;
        W.put(k++, _S, b.cp);
      }
      if (kw < this.wakes.max && b.v > 0.05) { _S.x = b.x; _S.y = water + 0.02; _S.z = b.z; _S.yaw = yaw; _S.sx = b.sx; _S.sz = b.sz; _S.amp = Math.min(1, b.v / 1.2); this.wakes.put(kw++, _S); }
    }
    W.commit(k); B.commit(kb); this.wakes.commit(kw);
  }
}

/** (for the checks in Node: tools or tests may drive a settlement's movers without the page) */
export { walkLanes };

registerSystem({
  attach(site, world) {
    if (!MOVER_SITES[site.id] || STATES.has(site)) return;
    const st = { dead: false, m: null };
    STATES.set(site, st);
    let worker;
    try { worker = new Worker(new URL('./movers-worker.js', import.meta.url), { type: 'module' }); } catch (e) { console.warn('movers: no worker', e); return; }
    st.worker = worker;
    worker.onmessage = (ev) => {
      worker.terminate(); st.worker = null;
      const d = ev.data;
      if (st.dead) return;
      if (d.error) { console.warn('movers', site.id, d.error); return; }
      try { st.m = new SiteMovers(site, world, d); st.m.show(); } catch (e) { console.warn('movers', site.id, e); }
    };
    worker.onerror = (e) => { console.warn('movers worker', e.message); worker.terminate(); st.worker = null; };
    worker.postMessage({ id: site.id });
  },
  arrived(site, x, z) { STATES.get(site)?.m?.arrive(x, z); },
  detach(site) {
    const st = STATES.get(site);
    if (!st) return;
    st.dead = true; st.worker?.terminate(); st.m?.dispose();
    STATES.delete(site);
  },
  update(dt, camera) {
    for (const st of STATES.values()) {
      const m = st.m;
      if (!m?.ready || m.site.state !== 'ready' || !m.site.group.visible) continue;
      m.view(camera);
      m.update(Math.min(0.1, dt));
    }
  },
});
