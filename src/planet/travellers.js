// Travellers on the roads between a region's settlements (src/planet/relief.js ROADS, DESIGN §4.1):
// walkers, porters under their poles, pairs, small caravans of pack animals led and followed on
// foot, and now and then a rider — in the dress of the settlements nearest the road (their movers'
// walkers: src/settlements/<id>/movers.js), going along the road both ways, fewer at night and in rain.
//
// The movers of src/engine/movers.js belong to a settlement (a street graph, its frame, a worker
// that works out lanes); outside one there is no graph and no frame. What is reused is what does not
// need them: the walkers' figures and limb animation (movers-kit.js, movers-gpu.js MoverSet: one
// instanced mesh per material group, four draws) and the beasts of wild-gpu.js. What is new is the
// smallest thing that can run on a road: each traveller is a distance along it (a line on the
// sphere, wandering as relief.js draws it), a speed and a side, spawned out of sight, let go beyond
// reach or on reaching a settlement's edge. People stand in a flat frame set at the visitor
// (re-set every 300 m); the beasts in planet coordinates.

import * as THREE from 'three/webgpu';
import { ROADS, BUILT, heightAt, PLANET_RADIUS as R, surface } from './relief.js';
import { enuFrame, toLocal, dot, angle } from './geo.js';
import { MoverSet } from '../engine/movers-gpu.js';
import { factor } from '../engine/movers-kit.js';
import { MOVER_SITES } from '../engine/movers-sites.js';
import { biomeAt } from './wild-biome.js';

const TAU = Math.PI * 2;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const TRAVELLER_QUALITY = {
  low: { reach: 190, groups: 3, people: 6 },
  medium: { reach: 240, groups: 4, people: 8 },
  high: { reach: 300, groups: 5, people: 10 },
  cinema: { reach: 340, groups: 6, people: 14 },
};
const PEOPLE_MAX = 24;

function hash(a, b, c, d = 0) {
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(c + 0x165667b1, 0x27d4eb2f) ^ Math.imul(d + 0x61c88647, 0x9e3779b1);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const lenv = (a) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a) => { const l = lenv(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const onGround = (u, h) => [u[0] * (R + h), u[1] * (R + h), u[2] * (R + h)];

// ── the road as a line ───────────────────────────────────────────────────────
/** The road's wander at m metres along it (relief.js coverAt lays the road along this). */
const wander = (r, m) => (22 * Math.sin(m / 210 + r.seed) + 9 * Math.sin(m / 67 + r.seed * 3.1)) * Math.min(1, m / 300, (r.ang * R - m) / 300);
/** The unit direction of the point m metres along road r, lane metres to its right (the arc's pole side). */
function roadU(r, m, lane) {
  const t = m / R, c = Math.cos(t), s = Math.sin(t), o = (wander(r, m) + lane) / R;
  return nrm([r.a[0] * c + r.t[0] * s + r.n[0] * o, r.a[1] * c + r.t[1] * s + r.n[1] * o, r.a[2] * c + r.t[2] * s + r.n[2] * o]);
}
/** Where a unit direction u is on the road: { m (along), off (across), d }. */
function alongOf(r, u) { return { m: Math.atan2(dot(u, r.t), dot(u, r.a)) * R, off: dot(u, r.n) * R }; }

/** What a road is made of, once: its length, where the towns' edges are, whose dress and which pack animal. */
function infoOf(r) {
  if (r.info) return r.info;
  const len = r.ang * R, [A, B] = r.ends;
  const mid = roadU(r, len / 2, 0), dressed = BUILT.filter((S) => MOVER_SITES[S.id]).map((S) => [angle(S.u, mid) - (r.ends.includes(S) ? 1 : 0), S.id]).sort((p, q) => p[0] - q[0]);
  const ids = dressed.slice(0, 2).map((x) => x[1]);
  const bio = biomeAt(mid, surface(mid));
  const pack = bio.cls === 'desert' || (bio.cls === 'steppe' && bio.moist < 0.3) ? 'camelPack' : bio.cls === 'mountain' && bio.lat < 0 ? 'llama' : 'donkeyPack';
  r.info = { len, ra: A.radius + 20, rb: len - B.radius - 20, ids, key: ids.slice().sort().join('+'), pack, ru: biomeAt(mid, surface(mid)).cls };
  return r.info;
}

export class Travellers {
  /** group: the planet's group; beasts: the wild animals' BeastSet (pack animals and horses are drawn as its kinds). */
  constructor(group, beasts) {
    this.group = group; this.beasts = beasts;
    this.frameGroup = new THREE.Group(); this.frameGroup.name = 'travellers'; this.frameGroup.matrixAutoUpdate = false;
    group.add(this.frameGroup);
    this.frame = null; this.set = null; this.key = null; this.building = null; this.kinds = [];
    this.groups = []; this.t = 0; this.nextSpawn = 2; this.serial = 0;
    this.worker = null; this.pending = new Map();
    this.precompile = null;
    this.c = new Float32Array(12);
  }

  clear() {
    this.groups.length = 0;
    if (this.set) for (const m of this.set.meshes) m.visible = false;
  }

  /** The people's set for a road's dress, made in a worker (the old one kept until the new is there). */
  want(key, ids) {
    if (key === this.key || this.building === key || !ids.length) return;
    this.building = key;
    this.worker ??= (() => {
      const w = new Worker(new URL('./travellers-worker.js', import.meta.url), { type: 'module' });
      w.onmessage = (e) => this.built(e.data);
      w.onerror = (e) => { console.warn('travellers worker', e.message); this.building = null; };
      return w;
    })();
    this.worker.postMessage({ key, ids });
  }

  built(d) {
    if (d.error) { console.warn('travellers', d.error); this.building = null; this.failed = d.key; return; }
    if (this.set) { this.set.dispose(); this.set = null; }
    this.groups.length = 0;
    this.set = new MoverSet(`travellers:${d.key}`, d.sets, PEOPLE_MAX, { layer: 0, cast: false });
    this.kinds = d.kinds;
    this.key = d.key; this.building = null;
    this.ready = !this.precompile;
    for (const m of this.set.meshes) m.visible = false;
    this.frameGroup.add(this.set.group);
    if (this.precompile) this.precompile(this.set.meshes).then(() => { this.ready = true; }).catch(() => { this.ready = true; });
  }

  /**
   * One frame: the roads near the visitor, the travellers on them. cam: his planet position; alt his
   * height; night 0…1, rain 0… ; off: draw nothing (in a settlement, high up).
   */
  update(dt, cam, alt, { night = 0, rain = 0, quality = 'low', off = false, time = 0 } = {}) {
    if (off || alt > 220) { this.clear(); return; }
    const Q = TRAVELLER_QUALITY[quality] || TRAVELLER_QUALITY.low;
    this.t = time;
    const cl = lenv(cam), cu = [cam[0] / cl, cam[1] / cl, cam[2] / cl];
    // the roads whose line passes within reach of the visitor
    const near = [];
    for (const r of ROADS) {
      const { m, off: o } = alongOf(r, cu);
      if (Math.abs(o) > Q.reach + 60 || m < -Q.reach || m > r.ang * R + Q.reach) continue;
      near.push({ r, m, o });
    }
    if (!near.length) { if (this.groups.length) this.groups.length = 0; this.drawNone(); return; }
    near.sort((a, b) => Math.abs(a.o) - Math.abs(b.o));
    const info = infoOf(near[0].r);
    this.want(info.key, info.ids);
    if (!this.set || !this.kinds.length) { this.drawNone(); return; }
    // the visitor's flat frame, re-set when he has gone 300 m from its centre
    if (!this.frame || Math.hypot(cam[0] - this.frame.o[0], cam[1] - this.frame.o[1], cam[2] - this.frame.o[2]) > 300) {
      this.frame = enuFrame(cu, R + 0);
      const f = this.frame, m = new THREE.Matrix4().makeBasis(new THREE.Vector3(...f.x), new THREE.Vector3(...f.y), new THREE.Vector3(...f.z)).setPosition(f.o[0], f.o[1], f.o[2]);
      this.frameGroup.matrix.copy(m); this.frameGroup.matrixWorldNeedsUpdate = true;
    }
    // new groups: fewer at night and in the rain
    const k = (1 - night * 0.85) * (1 - Math.min(1, rain) * 0.6), maxG = Math.round(Q.groups * k);
    if (this.forceAhead) { const a = this.forceAhead; this.forceAhead = 0; for (let k = 0; k < 4; k++) this.spawn(near, cam, cu, Q, time + k, a); }
    if (time > this.nextSpawn) {
      this.nextSpawn = time + 3 + hash(Math.floor(time), 1, 1, 1) * 7 / Math.max(0.15, k);
      if (this.groups.length < maxG && this.ready !== false) this.spawn(near, cam, cu, Q, time);
    }
    this.step(dt, cam, cu, Q);
  }

  drawNone() { this.groups.length = 0; if (this.set) { this.set.commit(0); for (const m of this.set.meshes) m.visible = false; } }

  spawn(near, cam, cu, Q, time, force = 0) {
    const pick = near[Math.floor(hash(Math.floor(time), 2, 2, 2) * Math.min(near.length, 2))], r = pick.r, I = infoOf(r);
    this.serial++;
    const s = (x) => hash(this.serial, x, 3, 4);
    // where: out of reach along the road, on one side of the visitor or the other; the way: toward him or away, by chance
    const side = s(1) < 0.5 ? -1 : 1, ahead = force ? force * (0.8 + s(2) * 0.6) : Q.reach * (0.95 + s(2) * 0.25), m0 = pick.m + side * ahead;
    if (m0 < I.ra + 40 || m0 > I.rb - 40) return;
    const dir = s(3) < 0.62 ? -side : side;
    const roll = s(4);
    const kinds = this.kinds, walkers = kinds.filter((x) => !x.rider && !x.pole), porters = kinds.filter((x) => x.pole), rider = kinds.find((x) => x.rider);
    const wk = (x) => { let tot = 0; for (const k of x) tot += k.weight; let rr = s(x.length + 10) * tot; for (const k of x) { rr -= k.weight; if (rr <= 0) return k; } return x[0]; };
    const speed = 1.1 + s(5) * 0.35, lane = (s(6) < 0.5 ? -1 : 1) * (0.7 + s(7) * 0.9);
    const G = { r, dir, v: speed, members: [], life: 0 };
    const add = (m, kind, extra) => G.members.push({ m, lane: lane + (extra?.lane ?? 0), kind, beast: extra?.beast ?? null, rider: !!extra?.rider, ph: s(20 + G.members.length) * TAU, h: 0, hT: 0, acc: 99, size: 0.95 + s(30 + G.members.length) * 0.1, seed: s(40 + G.members.length), c: null, hp: null, mv: 0, mode: 'walk' });
    const back = -dir;                                         // behind the leader, along the road
    if (roll < 0.3 && walkers.length) add(m0, wk(walkers));
    else if (roll < 0.48 && walkers.length) { add(m0, wk(walkers)); add(m0 + back * 1.4, wk(walkers), { lane: 0.9 }); }
    else if (roll < 0.62 && porters.length) { add(m0, wk(porters)); if (s(8) < 0.5) add(m0 + back * 3, wk(porters)); }
    else if (roll < 0.9 && (walkers.length || porters.length)) {
      // a small caravan: a leader on foot, two or three pack animals, a driver at the back
      const n = 2 + (s(9) < 0.5 ? 1 : 0), pool = walkers.length ? walkers : porters;
      add(m0, wk(pool));
      for (let i = 0; i < n; i++) add(m0 + back * (3.4 + i * 3.0), null, { beast: I.pack, lane: 0.3 });
      add(m0 + back * (3.4 + n * 3.0 + 1.5), wk(pool), { lane: -0.6 });
      G.v *= 0.82;
    } else if (rider) { add(m0, rider, { rider: true, beast: 'horseGear' }); G.v = 1.9 + s(10) * 0.8; }
    else if (walkers.length) add(m0, wk(walkers));
    if (!force && this.people(G) + this.peopleTotal() > Q.people) return;
    for (const M of G.members) {
      const u = roadU(r, M.m, M.lane), g = surface(u);
      if (g.h < 0.9 || g.s) return;                           // (a ford or a town: not here)
      M.hT = M.h = g.h; M.u = u;
    }
    this.groups.push(G);
  }
  people(G) { let n = 0; for (const M of G.members) if (M.kind) n += M.rider ? 2 : 1; return n; }
  peopleTotal() { let n = 0; for (const G of this.groups) n += this.people(G); return n; }

  step(dt, cam, cu, Q) {
    const set = this.set, S = this.beasts;
    let k = 0;
    const F = this.frame;
    for (let gi = this.groups.length - 1; gi >= 0; gi--) {
      const G = this.groups[gi], r = G.r, I = infoOf(r);
      G.life += dt;
      let dMin = 1e9, gone = false;
      for (const M of G.members) {
        M.m += G.dir * G.v * dt;
        if (M.m < I.ra || M.m > I.rb) { gone = true; break; }
        const u = roadU(r, M.m, M.lane);
        M.acc += G.v * dt;
        if (M.acc > 2) { M.acc = 0; const h = heightAt(u); M.hT = h < 0.9 ? M.h : h; }
        M.h += (M.hT - M.h) * Math.min(1, dt * 5);
        const u2 = roadU(r, M.m + G.dir * 2.5, M.lane);
        M.u = u; M.f = [u2[0] - u[0], u2[1] - u[1], u2[2] - u[2]];
        const P = onGround(u, M.h);
        M.P = P;
        dMin = Math.min(dMin, Math.hypot(P[0] - cam[0], P[1] - cam[1], P[2] - cam[2]));
        M.ph += dt * TAU * G.v / (M.beast ? 1.5 : (M.kind?.stride ?? 1.4));
      }
      // let go beyond reach (once they have been near), or when the road has run out
      if (gone || dMin > Q.reach + 70 || (G.life > 20 && dMin > Q.reach + 20 && G.life > 80)) { this.groups.splice(gi, 1); continue; }
      for (const M of G.members) {
        const P = M.P, d = Math.hypot(P[0] - cam[0], P[1] - cam[1], P[2] - cam[2]);
        const fade = sm(Q.reach + 60, Q.reach, d);
        if (fade <= 0) continue;
        if (M.beast) {
          const flags = 0, col = M.beast === 'camelPack' ? [0.5, 0.36, 0.22] : M.beast === 'horseGear' ? [0.33, 0.21, 0.12] : M.beast === 'llama' ? [0.45, 0.33, 0.2] : [0.3, 0.26, 0.22];
          const model = M.beast === 'llama' ? 'llama' : M.beast;
          S.put(model, P, M.f, M.size * fade, M.ph, Math.min(1.1, 0.5 + G.v * 0.18), 0, 0, flags, col[0], col[1], col[2], M.seed);
        }
        if (M.kind && set && k < PEOPLE_MAX) {
          const kind = M.kind, L = toLocal(F, onGround(M.u, M.h + (M.rider ? 0.55 : 0)));
          const Lf = toLocal(F, [P[0] + M.f[0], P[1] + M.f[1], P[2] + M.f[2]]), fx = Lf[0] - toLocal(F, P)[0], fz = Lf[2] - toLocal(F, P)[2];
          if (!M.c) M.c = this.colours(kind, M.seed);
          const hh = kind.h ? kind.h[0] + (kind.h[1] - kind.h[0]) * M.seed : 0.95 + M.seed * 0.1, girth = 0.93 + M.seed * 0.14;
          const o = _S;
          o.x = L[0]; o.y = L[1]; o.z = L[2]; o.yaw = Math.atan2(-fx, -fz); o.roll = 0; o.sx = girth * fade; o.sy = hh * fade; o.sz = girth * 0.97 * fade;
          o.ph = M.rider ? 0 : M.ph; o.amp = M.rider ? 0 : Math.min(1, G.v / 0.8); o.v = kind.v; o.mode = 0; o.swing = kind.swing ?? 1; o.legs = 1; o.bounce = kind.pole ? 1 : 0;
          set.put(k++, o, M.c);
        }
      }
    }
    if (set) {
      set.commit(k);
      for (const m of set.meshes) m.visible = this.ready !== false && k > 0;
    }
  }

  colours(kind, seed) {
    const out = new Float32Array(12), pick = (a, x) => a[Math.floor(hash(Math.floor(seed * 1e5), x, 9, 9) * a.length)], sh = (x) => 0.88 + hash(Math.floor(seed * 1e5), x, 8, 8) * 0.22;
    out.set(factor('cloth', pick(kind.c1, 1), sh(1)), 0);
    out.set(factor('cloth', pick(kind.c2, 2), sh(2)), 3);
    out.set(factor('skin', hash(Math.floor(seed * 1e5), 3, 7, 7) < 0.75 ? 'skin_light' : 'skin_medium', 0.9 + hash(Math.floor(seed * 1e5), 4, 6, 6) * 0.18), 6);
    out.set(factor('cloth', pick(kind.c3, 5), sh(5)), 9);
    return out;
  }
}
const _S = { x: 0, y: 0, z: 0, yaw: 0, roll: 0, sx: 1, sy: 1, sz: 1, ph: 0, amp: 0, v: 0, mode: 0, swing: 1, legs: 1, bounce: 0 };
export { roadU, alongOf, infoOf, wander };
