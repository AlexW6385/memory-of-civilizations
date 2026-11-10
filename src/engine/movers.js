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
// rain capes go on. Boats keep to their lane of the canal clear of the boats standing in it, slow
// and keep to the middle under the bridges, give way to one another, turn at junctions, and at a
// canal's end tie up.

import * as THREE from 'three/webgpu';
import { registerSystem } from './systems.js';
import { MOVER_SITES } from './movers-sites.js';
import { MoverSet, WakeSet } from './movers-gpu.js';
import { factor } from './movers-kit.js';
import { ENV } from './env.js';
import { SMALL, MID } from './layers.js';

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
    const V = (set, name) => set.variants.indexOf(name);
    this.wv = d.sets.walkers; this.bv = d.sets.boats;
    this.walkers = new MoverSet('walkers', d.sets.walkers, 96, { layer: SMALL, cast: true });
    this.boatSet = new MoverSet('boats', d.sets.boats, 32, { layer: MID, cast: true });
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
      c: new Float32Array(12), cm: new Float32Array(12), cp: new Float32Array(12), passenger: false, HB: 1, o: 0 }));
    this.t = 0; this.nextList = 0; this.cands = []; this.wetness = 0;
    this.queue = null; this.idle = 0;
    site.group.add(this.root);
    this.root.visible = false;
    this.ready = false;
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
    const HB = 1.0, u = e.off[e.K - 1], k = (_q.o = dir * u * 0.6, this.water.freeLane(e, Math.round(s)));
    if (k < 0) return;
    const x = e.ax + e.ux * s + e.nx * e.off[k], z = e.az + e.uz * s + e.nz * e.off[k];
    const d = len2(x - _cam.x, z - _cam.z);
    if (d > P.reach || (d < P.spawnMin && this.seen(x, 1, z, 10))) return;
    for (const b of this.B) if (b.on && len2(b.x - x, b.z - z) < 16) return;
    let b = null; for (const q of this.B) if (!q.on) { b = q; break; }
    if (!b) return;
    const kind = rand() < 0.6 ? 'covered' : 'cargo';
    const cb = b.c, cm = b.cm, cp = b.cp;
    const tone = 0.85 + rand() * 0.25; cb.set([tone, tone * (0.96 + rand() * 0.06), tone * 0.95], 0);
    const mt = 0.7 + rand() * 0.45; cb.set([mt * 0.95, mt * 0.92, mt * 0.85], 3);       // the matting, new and pale or old and dark
    cb.set([1, 1, 1], 6); cb.set(factor('fibre', pick(['sacking', 'reed_mat', 'thatch_palm']), 0.95 + rand() * 0.1), 9);
    this.colours(this.crew.boatman, cm); this.colours(this.crew.passenger, cp);
    b.on = true; b.e = e; b.dir = dir; b.x = x; b.z = z; b.yaw = Math.atan2(-e.ux * dir, -e.uz * dir); b.cruise = lerp(P.speed[0], P.speed[1], rand()); b.v = b.cruise * 0.8;
    b.ph = rand() * TAU; b.amp = 1; b.kind = kind; b.sx = 0.74 + rand() * 0.08; b.sz = (6.4 + rand() * 1.0) / 7; b.next = null; b.moored = 0; b.wait = 0; b.born = this.t;
    b.passenger = kind === 'covered' && rand() < 0.55; b.HB = HB; b.o = e.off[k];
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
    for (const b of this.B) {
      if (!b.on) continue;
      const e = b.e;
      let s = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
      const d = len2(b.x - _cam.x, b.z - _cam.z);
      if (d > P.reach + 10 || (b.moored > 20 && (d > 70 || !this.seen(b.x, 1, b.z, 30)))) { b.on = false; continue; }
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
      const u = te.off[te.K - 1];
      let oWant = under ? 0 : tdir * u * 0.55;
      // others: follow at a distance, give way to those coming (the one with the clear lane goes on)
      const hx = -Math.sin(b.yaw), hz = -Math.cos(b.yaw);
      for (const o of this.B) {
        if (o === b || !o.on) continue;
        const dx = o.x - b.x, dz = o.z - b.z, dd = len2(dx, dz);
        if (dd > 34) continue;
        const ahead = (dx * hx + dz * hz) / (dd || 1), same = hx * -Math.sin(o.yaw) + hz * -Math.cos(o.yaw);
        if (ahead < 0.5) continue;
        if (same > 0.3) { if (dd < 16) vT = Math.min(vT, o.v * (dd < 10 ? 0.5 : 0.95)); }
        else {
          oWant = tdir * u;
          const lat = Math.abs(dx * -hz + dz * hx);
          if (dd < 18 && lat < b.HB + o.HB + 0.3 && (under || this.B.indexOf(b) > this.B.indexOf(o))) vT = 0;
        }
      }
      const jT = Math.round(sC / te.step), jN = te === e ? Math.round(Math.max(0, Math.min(e.L, s)) / e.step) : jT;
      let k = (_q.o = oWant, net.freeLane(te, jT, jN));
      if (k < 0) k = (_q.o = oWant, net.freeLane(te, jT));
      if (k < 0) { vT = 0; k = (_q.o = 0, net.freeLane(te, jT)); }
      // the lane eased toward, not jumped to
      const oL = k >= 0 ? te.off[k] : 0;
      const tx = te.ax + te.ux * sC + te.nx * oL, tz = te.az + te.uz * sC + te.nz * oL;
      const want = Math.atan2(-(tx - b.x), -(tz - b.z));
      const rate = 0.32 * Math.min(1, b.v / 0.8 + 0.25);
      b.yaw += Math.max(-rate * dt, Math.min(rate * dt, angleTo(b.yaw, want)));
      b.v += Math.max(-0.35 * dt, Math.min(0.12 * dt, vT - b.v));
      if (b.v < 0) b.v = 0;
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
      }
      b.x -= Math.sin(b.yaw) * b.v * dt; b.z -= Math.cos(b.yaw) * b.v * dt;
      { const o = (b.x - e.ax) * e.nx + (b.z - e.az) * e.nz, u = e.off[e.K - 1], s2 = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
        if (!nearJ && s2 > -1 && s2 < e.L + 1 && Math.abs(o) > u) { const c = Math.sign(o) * u - o; b.x += e.nx * c; b.z += e.nz * c; } }
      // the stroke: about one in 1.8 s under way, slowing to rest
      b.amp += (Math.min(1, b.v / 0.6) - b.amp) * Math.min(1, dt * 0.8);
      b.ph = (b.ph + dt * TAU / 1.8 * (0.35 + 0.65 * b.amp)) % TAU;
      s = (b.x - e.ax) * e.ux + (b.z - e.az) * e.uz;
      if (b.next && (b.dir > 0 ? s > e.L : s < 0)) { b.e = b.next; b.dir = b.nd; b.next = null; }
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
