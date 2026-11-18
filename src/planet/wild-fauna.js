// Wild animals of the open country (DESIGN §4.2). The ground is divided into cells of ~300 m (the
// faces of the terrain's cube, as the plants'); what a cell holds is a hash of its place — the same
// herd is found at the same spot — read through the biome there (wild-biome.js): deer and boar in the
// temperate forest, horses and antelope on the steppe, camels and oryx in the desert, zebra, giraffe
// and elephants on the savanna, kangaroos in Australia, bison on the American plains, guanaco in the
// Andes, reindeer and wolves in the north; birds of prey circling over the dry and the high country,
// flocks crossing, ducks, geese and herons on the great rivers. Only what is near the visitor is made
// (a herd when he is within ~400 m, let go beyond), at most about a hundred instances, drawn as one
// instanced mesh per kind of beast and one for the birds (wild-gpu.js).
//
// A herd grazes, its heads down, now and then one lifting its head to look; now and then it drifts
// a few tens of metres; when the visitor comes within its alert distance the heads come up and turn
// to him, and within its flight distance the herd runs off, away from him, for several seconds. The
// herd keeps off water. Everything is on the CPU in a few dozen small steps a frame (the ground's
// height is looked up only after each metre and a half an animal has moved).

import { faceDir, dirFace, tileRect } from './chunk.js';
import { surface, heightAt, PLANET_RADIUS as R } from './relief.js';
import { riverAt } from './rivers.js';
import { biomeAt, herdAt, raptorsAt } from './wild-biome.js';
import { eastNorth } from './geo.js';
import { beastModel } from './wild-models.js';
import { BeastSet, BirdSet } from './wild-gpu.js';

const LEVEL = 6, N2 = 1 << LEVEL, CELL = 2 / N2 * (Math.PI / 4) * R;
const TAU = Math.PI * 2;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** What each preset allows: the herds' reach, the animals and birds drawn. */
export const WILD_QUALITY = {
  low: { herdR: 300, birdR: 420, animals: 26, birds: 18, flocks: 1 },
  medium: { herdR: 380, birdR: 560, animals: 48, birds: 34, flocks: 2 },
  high: { herdR: 450, birdR: 700, animals: 60, birds: 44, flocks: 2 },
  cinema: { herdR: 520, birdR: 800, animals: 80, birds: 60, flocks: 3 },
};

const lin = (hex) => { const c = parseInt(hex.slice(1), 16); return [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255].map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); };

/** The kinds: the model, body scale, coats, how near the visitor may come (flee), walking and running speeds (m/s), and so on. */
export const SPECIES = {
  deer: { model: 'deer', size: [0.95, 1.15], coats: ['#8a5a3a', '#7a5233', '#9a6a44', '#6e4a30'], flee: 55, walk: 0.7, run: 9, hornless: 0.45 },
  boar: { model: 'boar', size: [0.85, 1.15], coats: ['#3b3029', '#4a3a2e', '#2f2a26'], flee: 30, walk: 0.8, run: 7 },
  wolf: { model: 'wolf', size: [0.9, 1.1], coats: ['#6d675f', '#8a8378', '#4d4943'], flee: 75, walk: 1.2, run: 9 },
  reindeer: { model: 'reindeer', size: [0.9, 1.1], coats: ['#7b6a58', '#a89a88', '#5e5144'], flee: 50, walk: 0.7, run: 8, hornless: 0.25 },
  antelope: { model: 'antelope', size: [0.85, 1.15], coats: ['#b58c5a', '#a07a4c', '#c29a68'], flee: 70, walk: 0.8, run: 12, hornless: 0.3 },
  oryx: { model: 'oryx', size: [0.9, 1.05], coats: ['#d8cdb5', '#cfc2a6'], flee: 60, walk: 0.8, run: 10, hornless: 0.1 },
  horse: { model: 'horse', size: [0.9, 1.0], coats: ['#7a5535', '#5d4129', '#9a7448', '#3d2e24'], flee: 55, walk: 1.0, run: 11 },
  zebra: { model: 'horse', size: [0.95, 1.05], coats: ['#d9d4c8'], pattern: 1, flee: 45, walk: 0.9, run: 11 },
  camel: { model: 'camel', size: [0.95, 1.05], coats: ['#a98258', '#b99668', '#8e6c48'], flee: 35, walk: 0.9, run: 6 },
  giraffe: { model: 'giraffe', size: [0.9, 1.05], coats: ['#c09a58'], pattern: 2, flee: 60, walk: 1.0, run: 9 },
  bison: { model: 'bison', size: [0.9, 1.05], coats: ['#43322a', '#3a2c25', '#52392b'], flee: 28, walk: 0.8, run: 8, hornless: 0.1 },
  guanaco: { model: 'llama', size: [0.9, 1.0], coats: ['#a07850', '#8e6a45', '#b08a5c'], flee: 55, walk: 0.9, run: 9 },
  ibex: { model: 'ibex', size: [0.9, 1.1], coats: ['#8a7660', '#6f5f4e', '#9c8a72'], flee: 50, walk: 0.8, run: 9, hornless: 0.3 },
  macaque: { model: 'macaque', size: [0.9, 1.15], coats: ['#7a6a52', '#6a5b48', '#8a7a60'], flee: 20, walk: 0.8, run: 5 },
  elephant: { model: 'elephant', size: [0.85, 1.05], coats: ['#7a7168', '#6a635b', '#857c70'], flee: 25, walk: 0.9, run: 5.5, calm: true },
  kangaroo: { model: 'kangaroo', size: [0.8, 1.1], coats: ['#a8774a', '#9a6a40', '#bf9262'], flee: 60, walk: 0.8, run: 9, hop: true },
};
for (const s of Object.values(SPECIES)) s.coats = s.coats.map(lin);

// ── hashes and vectors ───────────────────────────────────────────────────────
function hash(a, b, c, d = 0) {
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(c + 0x165667b1, 0x27d4eb2f) ^ Math.imul(d + 0x61c88647, 0x9e3779b1);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lenv = (a) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a) => { const l = lenv(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mulAdd = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
/** The tangent part of v at the unit vector u, normalised. */
const tang = (v, u) => nrm(mulAdd(v, u, -dot(v, u)));
const crossv = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** f turned about u (up) by at most max radians toward d (a tangent). */
function turnToward(f, u, d, max) {
  const ang = Math.atan2(dot(crossv(f, d), u), dot(f, d)), a = Math.max(-max, Math.min(max, ang)), c = Math.cos(a), s = Math.sin(a), l = crossv(u, f);
  return tang([f[0] * c + l[0] * s, f[1] * c + l[1] * s, f[2] * c + l[2] * s], u);
}
/** The point at tangent offsets (e, n metres) from unit direction u (not renormalised). */
const offsetDir = (u, E, N, e, n) => nrm([u[0] + (E[0] * e + N[0] * n) / R, u[1] + (E[1] * e + N[1] * n) / R, u[2] + (E[2] * e + N[2] * n) / R]);
const onGround = (u, h) => [u[0] * (R + h), u[1] * (R + h), u[2] * (R + h)];

// ── the cells ────────────────────────────────────────────────────────────────
function cellOf(key) {
  const [f, i, j] = key.split('/').map(Number), [s0, t0, size] = tileRect(LEVEL, i, j);
  return { key, f, i, j, u: faceDir(f, s0 + size / 2, t0 + size / 2), s0, t0, size };
}

export class WildFauna {
  /** group: the planet's group (instances stand in planet coordinates). */
  constructor(group) {
    this.group = group;
    this.beasts = new BeastSet(this.group);
    this.birds = new BirdSet(this.group);
    this.cells = new Map();
    this.flocks = [];
    this.q = WILD_QUALITY.low;
    this.last = null; this.nextScan = 0; this.nextFlock = 8; this.t = 0;
    this.shown = false;
  }
  set precompile(fn) { this._pre = fn; this.beasts.precompile = fn; if (fn) fn([this.birds.mesh]); }
  get precompile() { return this._pre; }

  /** The meshes hidden, everything let go. */
  clear() {
    if (!this.cells.size && !this.flocks.length && !this.shown) return;
    this.cells.clear(); this.flocks.length = 0; this.shown = false;
  }

  /**
   * One frame. cam: the visitor's planet position; alt: his height above the sea; night 0…1; quality
   * preset name. Draws nothing and makes nothing high up, or when `off`.
   */
  update(dt, cam, alt, { night = 0, rain = 0, quality = 'low', off = false, time = 0 } = {}) {
    this.beasts.begin(); this.birds.begin();
    if (off || alt > 260) { this.clear(); return; }
    this.shown = true;
    this.q = WILD_QUALITY[quality] || WILD_QUALITY.low;
    this.t = time;
    const camL = lenv(cam), cu = [cam[0] / camL, cam[1] / camL, cam[2] / camL];
    this.cu = cu; this.cam = cam;
    if (!this.last || Math.hypot(cam[0] - this.last[0], cam[1] - this.last[1], cam[2] - this.last[2]) > 40 || time > this.nextScan) { this.scan(cu); this.last = cam.slice(); this.nextScan = time + 1.5; }
    this.activate(cu, cam);
    let animals = 0, birds = 0;
    const [E, N] = eastNorth(cu);
    for (const c of this.cells.values()) {
      if (c.herd) animals += this.herdFrame(c.herd, dt, cam, animals);
      if (c.rap && night < 0.7) birds += this.raptorFrame(c.rap, cam, time, birds, night);
      if (c.water) birds += this.waterFrame(c.water, dt, cam, time, birds);
    }
    birds += this.flockFrames(dt, cam, cu, E, N, time, birds, night, rain);
  }

  /** End the frame: what was put is drawn (call after the travellers have put their beasts too). */
  finish() { this.beasts.end(); this.birds.end(); }

  /** The cells within reach of the visitor; those far off dropped. */
  scan(cu) {
    const reach = this.q.birdR + CELL, [E, N] = eastNorth(cu), want = new Set();
    for (let y = -reach; y <= reach; y += CELL * 0.5) for (let x = -reach; x <= reach; x += CELL * 0.5) {
      if (x * x + y * y > reach * reach) continue;
      const v = [cu[0] + (E[0] * x + N[0] * y) / R, cu[1] + (E[1] * x + N[1] * y) / R, cu[2] + (E[2] * x + N[2] * y) / R];
      const [f, s, t] = dirFace(v);
      const i = Math.min(N2 - 1, Math.floor((s + 1) / 2 * N2)), j = Math.min(N2 - 1, Math.floor((t + 1) / 2 * N2));
      want.add(`${f}/${i}/${j}`);
    }
    for (const k of want) if (!this.cells.has(k)) this.cells.set(k, { ...cellOf(k), state: 0 });
    for (const [k, c] of this.cells) if (!want.has(k)) {
      // (not let go while its animals are within sight: a herd run off to a cell's edge stays)
      this.cells.delete(k);
    }
  }

  /** Fill the cells nearest the visitor with their herds, raptors and waterfowl (a couple a frame). */
  activate(cu, cam) {
    let budget = 2;
    const order = [];
    for (const c of this.cells.values()) {
      if (c.herdDone && c.rapDone && c.waterDone) continue;
      const d = Math.hypot(c.u[0] * R - cu[0] * R, c.u[1] * R - cu[1] * R, c.u[2] * R - cu[2] * R);
      order.push([d, c]);
    }
    order.sort((a, b) => a[0] - b[0]);
    for (const [d, c] of order) {
      if (budget <= 0) break;
      if (d > this.q.birdR) continue;
      budget--;
      this.fill(c, d);
    }
  }

  fill(c, d) {
    const [f, i, j] = [c.f, c.i, c.j];
    if (!c.bio) { const g = surface(c.u); c.g = g.h; c.bio = biomeAt(c.u, g); c.ground = g; }
    const bio = c.bio;
    if (!c.herdDone && d < this.q.herdR + 40) {
      c.herdDone = true;
      const h = herdAt(bio, hash(f, i, j, 1), hash(f, i, j, 2));
      if (h && bio.land) c.herd = makeHerd(c, h, this.q);
    }
    if (!c.rapDone) {
      c.rapDone = true;
      const rp = raptorsAt(bio);
      if (bio.land && hash(f, i, j, 3) < rp.share) c.rap = makeRaptors(c, rp.kind);
    }
    if (!c.waterDone && d < this.q.herdR) {
      c.waterDone = true;
      const w = makeWater(c); if (w) c.water = w;
    }
  }

  // ── herds ──────────────────────────────────────────────────────────────────
  herdFrame(H, dt, cam, count) {
    const S = H.sp, q = this.q;
    if (count + H.animals.length > q.animals) return 0;
    const c = H.c, cp = onGround(c, H.hc), dc = Math.hypot(cp[0] - cam[0], cp[1] - cam[1], cp[2] - cam[2]);
    // the herd's mood
    H.t -= dt;
    if (H.mode === 'flee') {
      if (H.t <= 0) { H.mode = 'graze'; H.t = 6 + hash(H.seed, 5, Math.floor(this.t), 1) * 10; }
    } else {
      const alertD = S.flee * (S.calm ? 1.2 : 2.0);
      if (dc < S.flee && !S.calm) {
        H.mode = 'flee'; H.t = 6 + hash(H.seed, 7, Math.floor(this.t), 2) * 5;
        const away = tang([cp[0] - cam[0], cp[1] - cam[1], cp[2] - cam[2]], c);
        H.dir = away; H.fleeSpeed = S.run;
      } else if (dc < S.flee * 0.7 && S.calm) {
        H.mode = 'flee'; H.t = 8; H.dir = tang([cp[0] - cam[0], cp[1] - cam[1], cp[2] - cam[2]], c); H.fleeSpeed = S.walk * 1.6;
      } else if (dc < alertD) { H.mode = 'alert'; H.t = 2; }
      else if (H.mode === 'alert' && H.t <= 0) { H.mode = 'graze'; H.t = 5; }
      else if (H.t <= 0) {
        if (H.mode === 'graze') {
          // now and then the herd drifts to new grass
          if (hash(H.seed, Math.floor(this.t / 7), 3, 4) < 0.3) { H.mode = 'drift'; H.t = 8 + hash(H.seed, Math.floor(this.t), 4, 5) * 14; const a = hash(H.seed, Math.floor(this.t), 5, 6) * TAU; H.dir = nrm(mulAdd(mulAdd([0, 0, 0], H.E, Math.cos(a)), H.N, Math.sin(a))); H.dir = tang(H.dir, c); }
          else H.t = 6 + hash(H.seed, Math.floor(this.t), 6, 7) * 12;
        } else { H.mode = 'graze'; H.t = 12 + hash(H.seed, Math.floor(this.t), 7, 8) * 25; }
      }
    }
    // the herd's centre moves
    const v = H.mode === 'flee' ? H.fleeSpeed * 0.92 : H.mode === 'drift' ? S.walk * 0.6 : 0;
    if (v > 0) {
      const nc = nrm(mulAdd(c, H.dir, v * dt / R));
      H.walked += v * dt;
      if (H.walked > 3) {
        H.walked = 0;
        const h = heightAt(nc);
        if (h < 0.95) { H.dir = tang(mulAdd(H.dir, H.dir, -2), c); H.mode = H.mode === 'flee' ? 'flee' : 'drift'; }
        else { H.c = nc; H.hc = h; }
      } else H.c = nc;
      H.dir = tang(H.dir, H.c);
    }
    let n = 0;
    for (const A of H.animals) { if (count + n >= q.animals) break; this.animal(H, A, dt, cam); n++; }
    return n;
  }

  animal(H, A, dt, cam) {
    const S = H.sp, M = H.model, c = H.c, u = A.u;
    // where it wants to be: its place in the herd about the centre
    const goal = offsetDir(c, H.E, H.N, A.off[0], A.off[1]);
    const gv = tang(mulAdd(goal, u, -dot(goal, u)), u), gd = Math.acos(Math.max(-1, Math.min(1, dot(goal, u)))) * R;
    const P = onGround(u, A.h), toCam = [cam[0] - P[0], cam[1] - P[1], cam[2] - P[2]], dcam = lenv(toCam);
    let speed = 0, want = A.f, headT = A.headT, turn = 2.2;
    if (H.mode === 'flee') {
      speed = H.fleeSpeed * A.pace; want = gd > 25 ? gv : H.dir; turn = 4;
      headT = 0;
    } else if (H.mode === 'alert') {
      speed = 0; headT = 0; want = tang(toCam, u); turn = 1.8;
    } else if (H.mode === 'drift') {
      speed = S.walk * A.pace * (gd > 14 ? 1.3 : 1); want = gd > 14 ? gv : H.dir; headT = A.look > 0 ? 0 : 0.15;
    } else {
      // grazing: head down, a slow creep; every so often a look up
      A.t -= dt;
      if (A.t <= 0) { A.look = A.look > 0 ? 0 : (hash(A.is, Math.floor(this.t * 3), 8, 9) < 0.35 ? 1 : 0); A.t = A.look > 0 ? 1.5 + hash(A.is, Math.floor(this.t), 9, 1) * 3 : 3 + hash(A.is, Math.floor(this.t), 10, 2) * 9; A.wd = hash(A.is, Math.floor(this.t), 11, 3) * TAU; }
      headT = A.look > 0 ? 0 : 1;
      if (S.model === 'elephant' || S.model === 'giraffe' || S.model === 'camel') headT *= 0.0;
      if (gd > 18) { speed = S.walk * A.pace; want = gv; }
      else if (A.look > 0) { speed = 0; want = A.f; }
      else { speed = 0.22 * S.walk * (headT > 0.5 ? 1 : 0); want = tang(mulAdd(mulAdd([0, 0, 0], H.E, Math.cos(A.wd)), H.N, Math.sin(A.wd)), u); turn = 1.2; }
    }
    if (speed > 0.01 || H.mode === 'alert') A.f = turnToward(A.f, u, tang(want, u), turn * dt);
    A.headT = headT;
    A.head += (headT - A.head) * Math.min(1, dt * 2.2);
    A.v += (speed - A.v) * Math.min(1, dt * 3);
    if (A.v > 0.01) {
      const nu = nrm(mulAdd(u, A.f, A.v * dt / R));
      A.acc += A.v * dt;
      A.u = nu;
      if (A.acc > 1.5) {
        A.acc = 0;
        const h = heightAt(nu);
        if (h < 0.95) { A.u = A.pu; A.f = tang(mulAdd(A.f, A.f, -2), A.pu); }
        else { A.hT = h; A.pu = nu; }
      }
    }
    A.h += (A.hT - A.h) * Math.min(1, dt * 5);
    A.f = tang(A.f, A.u);
    // the gait: its phase advances with the ground covered
    const stride = 0.9 * M.length * A.size;
    A.ph += dt * TAU * (A.v / stride) * (S.hop ? 0.5 : 1);
    const amp = A.v < (S.hop ? 0.6 : 0.05) ? 0 : Math.min(1.4, 0.45 + A.v * 0.11);
    const Pn = onGround(A.u, A.h), d = Math.hypot(Pn[0] - cam[0], Pn[1] - cam[1], Pn[2] - cam[2]);
    const s = A.size * sm(this.q.herdR + 40, this.q.herdR - 40, d);
    if (s < 0.05) return;
    this.beasts.put(S.model, Pn, A.f, s, A.ph, amp, A.head, S.hop ? 1 : 0, (S.pattern ?? (H.spots ? 3 : 0)) + (A.hornless ? 4 : 0), A.coat[0], A.coat[1], A.coat[2], A.seed);
  }

  // ── birds of prey ──────────────────────────────────────────────────────────
  raptorFrame(Rp, cam, t, count, night) {
    if (count + Rp.n > this.q.birds) return 0;
    const [E, N] = Rp.EN;
    // (hidden beyond the reach, thinned by the hour: the eagles and kites are day birds)
    let n = 0;
    for (let k = 0; k < Rp.n; k++) {
      const th = Rp.th0 + Rp.dir * (Rp.v / Rp.r) * t + k * 2.1;
      const r = Rp.r * (1 + 0.25 * Math.sin(t * 0.07 + k * 3.1)), cs = Math.cos(th), sn = Math.sin(th);
      const x = r * cs + k * 9, y = r * sn - k * 7;
      const alt = Rp.alt + 6 * Math.sin(t * 0.11 + k * 1.9) + k * 8;
      const dir = nrm([Rp.c[0] + (E[0] * x + N[0] * y) / R, Rp.c[1] + (E[1] * x + N[1] * y) / R, Rp.c[2] + (E[2] * x + N[2] * y) / R]);
      const p = onGround(dir, Rp.h + alt);
      const d = Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]);
      if (d > this.q.birdR) continue;
      const hx = Rp.dir * (-sn), hy = Rp.dir * cs;
      const f = [E[0] * hx + N[0] * hy, E[1] * hx + N[1] * hy, E[2] * hx + N[2] * hy];
      const flap = Rp.flap * (0.5 + 0.5 * Math.sin(t * 0.3 + k * 5));
      if (this.birds.put(p, f, Rp.s, t * 6 + k, flap, 0, Rp.span, Rp.neck, Rp.col[0], Rp.col[1], Rp.col[2], Rp.bill, 0.3 * Rp.dir, 0.6)) n++;
    }
    return n;
  }

  // ── waterfowl and herons ───────────────────────────────────────────────────
  waterFrame(W, dt, cam, t, count) {
    if (count + W.birds.length > this.q.birds || W.gone) return 0;
    let n = 0;
    for (const B of W.birds) {
      const P = onGround(B.u, B.hAbs), d = Math.hypot(P[0] - cam[0], P[1] - cam[1], P[2] - cam[2]);
      if (!B.fly && d < B.flee) { B.fly = true; B.age = 0; B.f = tang([P[0] - cam[0], P[1] - cam[1], P[2] - cam[2]], B.u); }
      if (B.fly) {
        B.age += dt;
        if (B.age > 22) { B.dead = true; continue; }
        B.u = nrm(mulAdd(B.u, B.f, 13 * dt / R));
        B.hAbs = Math.min(B.h0 + 28, B.hAbs + 3 * dt);
      }
      if (B.dead) continue;
      const p = onGround(B.u, B.hAbs + (B.fly ? 0 : B.lift));
      const dd = Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]);
      if (dd > this.q.herdR + 50) continue;
      B.f = tang(B.f, B.u);
      const bob = B.fly ? 0 : Math.sin(t * 1.3 + B.seed * 9) * 0.02;
      const pp = B.fly ? p : onGround(B.u, B.hAbs + B.lift + bob);
      if (this.birds.put(pp, B.f, B.s, t * (B.fly ? 14 : 0) + B.seed * 5, B.fly ? 1 : 0, B.fly ? 0 : B.mode, 1, B.fly ? B.neckFly : B.neck, B.col[0], B.col[1], B.col[2], B.bill, 0, B.fly ? B.legs * 0.6 : B.legs)) n++;
    }
    if (W.birds.every((b) => b.dead)) W.gone = true;
    return n;
  }

  // ── flocks crossing ────────────────────────────────────────────────────────
  flockFrames(dt, cam, cu, E, N, t, count, night, rain) {
    const q = this.q;
    // new flocks, by day, out of the rain's thick
    if (t > this.nextFlock) {
      this.nextFlock = t + 18 + hash(Math.floor(t), 1, 2, 3) * 30;
      if (night < 0.5 && this.flocks.length < q.flocks && rain < 0.8) this.spawnFlock(cam, cu, E, N, t);
    }
    let n = 0;
    for (let k = this.flocks.length - 1; k >= 0; k--) {
      const F = this.flocks[k];
      F.age += dt;
      F.c = nrm(mulAdd(F.c, F.f, F.v * dt / R)); F.f = tang(F.f, F.c);
      const p0 = onGround(F.c, F.h), d = Math.hypot(p0[0] - cam[0], p0[1] - cam[1], p0[2] - cam[2]);
      if (d > q.birdR + 80 || F.age > 90) { this.flocks.splice(k, 1); continue; }
      const right = crossv(F.f, F.c);
      for (let m = 0; m < F.members.length; m++) {
        if (count + n >= q.birds) break;
        const B = F.members[m];
        const wob = Math.sin(this.t * 0.8 + B.seed * 7) * 0.8;
        const dir = nrm(mulAdd(mulAdd(F.c, F.f, B.along / R), right, B.side / R));
        const p = onGround(dir, F.h + B.up + wob);
        if (this.birds.put(p, F.f, F.s * B.k, t * F.rate + B.seed * 9, 1, 0, 1, F.neck, F.col[0] * B.shade, F.col[1] * B.shade, F.col[2] * B.shade, F.bill, 0, F.legs)) n++;
      }
    }
    return n;
  }

  spawnFlock(cam, cu, E, N, t) {
    const g = surface(cu), bio = biomeAt(cu, g), r = hash(Math.floor(t), 4, 5, 6);
    let kind;
    if (bio.cls === 'rain') kind = r < 0.6 ? 'hornbill' : 'starling';
    else if (bio.cls === 'savanna' || bio.cls === 'desert') kind = 'starling';
    else kind = r < 0.45 ? 'goose' : r < 0.65 ? 'crane' : 'starling';
    const KS = FLOCK_KINDS[kind], a = hash(Math.floor(t), 7, 8, 9) * TAU, dist = this.q.birdR * 0.8;
    const out = [Math.cos(a), Math.sin(a)];
    const start = offsetDir(cu, E, N, out[0] * dist, out[1] * dist);
    const lat = (hash(Math.floor(t), 9, 1, 2) - 0.5) * 240;
    // across the visitor's sky: toward the point lat metres to one side of him
    const aim = offsetDir(cu, E, N, -out[1] * lat, out[0] * lat);
    const f = tang(mulAdd(aim, start, -1), start);
    const n = KS.n[0] + Math.floor(hash(Math.floor(t), 2, 3, 4) * (KS.n[1] - KS.n[0] + 1));
    const members = [];
    for (let k = 0; k < n; k++) {
      const rank = Math.ceil(k / 2), side = k === 0 ? 0 : (k % 2 ? 1 : -1);
      const j = (s) => hash(Math.floor(t), k, s, 5) - 0.5;
      members.push(KS.vee
        ? { along: -rank * KS.gap + j(1) * 1.2, side: side * rank * KS.gap * 0.7 + j(2) * 1.2, up: j(3) * 1.5 - rank * 0.2, seed: hash(k, 1, 2, 3), k: 1 + j(4) * 0.15, shade: 1 + j(5) * 0.25 }
        : { along: j(1) * 22, side: j(2) * 18, up: j(3) * 9, seed: hash(k, 1, 2, 3), k: 1 + j(4) * 0.2, shade: 1 + j(5) * 0.4 });
    }
    this.flocks.push({ c: start, f, v: KS.v * (0.9 + hash(Math.floor(t), 5, 5, 5) * 0.2), h: surface(cu).h + KS.alt[0] + hash(Math.floor(t), 6, 6, 6) * (KS.alt[1] - KS.alt[0]), age: 0, members, s: KS.s, rate: KS.rate, neck: KS.neck, legs: KS.legs, col: KS.col, bill: KS.bill });
  }
}

const FLOCK_KINDS = {
  goose: { n: [6, 14], vee: true, gap: 3.4, v: 14, alt: [45, 95], s: 0.7, rate: 9, neck: 1.7, legs: 0.5, col: lin('#6b6258'), bill: 2 },
  crane: { n: [4, 9], vee: true, gap: 4.5, v: 11, alt: [60, 120], s: 0.95, rate: 5.5, neck: 1.9, legs: 1.7, col: lin('#b9b9b1'), bill: 3 },
  starling: { n: [16, 30], vee: false, v: 12, alt: [20, 60], s: 0.17, rate: 36, neck: 0.55, legs: 0.3, col: lin('#18150f'), bill: 1 },
  hornbill: { n: [2, 4], vee: false, v: 10, alt: [15, 40], s: 0.5, rate: 8, neck: 1.2, legs: 0.4, col: lin('#15120e'), bill: 1 },
};

// ── what a cell holds ────────────────────────────────────────────────────────
function makeHerd(c, h, q) {
  const S = SPECIES[h.species], M = beastModel(S.model), [E, N] = eastNorth(c.u);
  const n = Math.min(h.n, Math.floor(q.animals / 2));
  const seed = Math.floor(hash(c.f, c.i, c.j, 11) * 1e6);
  // the herd's place in its cell, and its spread (a few metres to a few tens)
  const cx = (hash(c.f, c.i, c.j, 12) - 0.5) * CELL * 0.7, cz = (hash(c.f, c.i, c.j, 13) - 0.5) * CELL * 0.7;
  const centre = offsetDir(c.u, E, N, cx, cz), hc = heightAt(centre);
  if (hc < 1.2) return null;
  const spread = 5 + Math.sqrt(n) * 3.5;
  const coatPick = Math.floor(hash(c.f, c.i, c.j, 14) * S.coats.length);
  const H = { sp: S, model: M, c: centre, hc, E, N, seed, mode: 'graze', t: 4 + hash(seed, 1, 1, 1) * 8, dir: tang(E, centre), fleeSpeed: S.run, walked: 0, animals: [], spots: S.model === 'deer' && (c.bio.lat > 5 && c.bio.lat < 30 && c.bio.lon > 66 && c.bio.lon < 100) };
  for (let k = 0; k < n; k++) {
    const r = (s) => hash(seed, k, s, 21);
    const ang = r(1) * TAU, rad = Math.sqrt(r(2)) * spread, off = [Math.cos(ang) * rad, Math.sin(ang) * rad];
    const u = offsetDir(centre, E, N, off[0], off[1]), h2 = heightAt(u);
    if (h2 < 1.1) continue;
    const a = r(3) * TAU, size = S.size[0] + (S.size[1] - S.size[0]) * r(4);
    const coat = S.coats[r(5) < 0.8 ? coatPick : Math.floor(r(6) * S.coats.length)].map((v) => v * (0.85 + r(7) * 0.3));
    H.animals.push({ u, pu: u, f: tang(nrm(mulAdd(mulAdd([0, 0, 0], E, Math.cos(a)), N, Math.sin(a))), u), h: h2, hT: h2, off, ph: r(8) * TAU, v: 0, acc: 0, head: r(9) < 0.7 ? 1 : 0, headT: 1, t: r(10) * 8, look: 0, wd: r(11) * TAU,
      size, pace: 0.85 + r(12) * 0.3, coat, seed: r(13), is: Math.floor(r(15) * 1e6), hornless: S.hornless ? r(14) < S.hornless : false });
  }
  if (!H.animals.length) return null;
  // (in the kind's own preferred stance: elephants and the tall do not lower their heads to graze)
  return H;
}

const RAPTORS = {
  eagle: { s: 1.15, col: lin('#2e2118'), bill: 1, v: 12, rad: [40, 90], alt: [90, 170], neck: 0.5, span: 1.0, flap: 0.05 },
  vulture: { s: 1.35, col: lin('#2a2219'), bill: 3, v: 11, rad: [50, 110], alt: [110, 190], neck: 0.4, span: 1.05, flap: 0.02 },
  hawk: { s: 0.55, col: lin('#5a4630'), bill: 0, v: 10, rad: [30, 60], alt: [60, 120], neck: 0.5, span: 1.0, flap: 0.25 },
  kite: { s: 0.8, col: lin('#6a3f26'), bill: 1, v: 11, rad: [35, 75], alt: [70, 140], neck: 0.55, span: 1.05, flap: 0.12 },
};
function makeRaptors(c, kind) {
  const K = RAPTORS[kind], r = (s) => hash(c.f, c.i, c.j, 30 + s), [E, N] = eastNorth(c.u);
  return { c: c.u, EN: [E, N], h: Math.max(0, c.g ?? 0), n: 1 + Math.floor(r(1) * 2.99), r: K.rad[0] + (K.rad[1] - K.rad[0]) * r(2), alt: K.alt[0] + (K.alt[1] - K.alt[0]) * r(3), v: K.v * (0.9 + r(4) * 0.2), th0: r(5) * TAU, dir: r(6) < 0.5 ? 1 : -1, s: K.s, col: K.col, bill: K.bill, neck: K.neck, span: K.span, flap: K.flap };
}

const WATERFOWL = [
  { s: 0.3, col: lin('#4a3e2c'), bill: 1, neck: 0.85, legs: 0, mode: 2, n: [3, 8], flee: 35, neckFly: 1.3 },        // ducks
  { s: 0.6, col: lin('#7a7468'), bill: 2, neck: 1.5, legs: 0, mode: 2, n: [2, 5], flee: 40, neckFly: 1.7 },         // geese
];
/** Birds on the great rivers: ducks or geese on the water, herons at the bank (null where no river is near). */
function makeWater(c) {
  const rv0 = riverAt(c.u);
  const [E, N] = eastNorth(c.u);
  const found = [];
  const water = [], bank = [];
  for (let k = 0; k < 6; k++) {
    const x = (hash(c.f, c.i, c.j, 50 + k) - 0.5) * CELL, z = (hash(c.f, c.i, c.j, 60 + k) - 0.5) * CELL;
    const u = offsetDir(c.u, E, N, x, z), rv = riverAt(u);
    if (!rv) continue;
    if (rv.d < rv.half * 0.55) water.push(u);
    else if (rv.d > rv.half + 1.5 && rv.d < rv.half + 7) bank.push(u);
  }
  if (!rv0 && !water.length && !bank.length) return null;
  const birds = [];
  const r = (s) => hash(c.f, c.i, c.j, 70 + s);
  if (water.length && r(1) < 0.7) {
    const K = WATERFOWL[r(2) < 0.6 ? 0 : 1], u0 = water[0], n = K.n[0] + Math.floor(r(3) * (K.n[1] - K.n[0] + 1));
    for (let k = 0; k < n; k++) {
      const a = hash(c.f, c.i, c.j, 80 + k) * TAU, d = 1 + hash(c.f, c.i, c.j, 100 + k) * 6;
      const u = offsetDir(u0, E, N, Math.cos(a) * d, Math.sin(a) * d), rv = riverAt(u);
      if (!rv || rv.d > rv.half * 0.8) continue;
      const a2 = hash(c.f, c.i, c.j, 120 + k) * TAU;
      birds.push({ u, f: tang(nrm(mulAdd(mulAdd([0, 0, 0], E, Math.cos(a2)), N, Math.sin(a2))), u), hAbs: 0.02, h0: 0.02, lift: 0.08 * K.s, s: K.s * (0.9 + 0.2 * hash(k, 1, 2, 3)), col: K.col.map((v) => v * (0.8 + 0.4 * hash(k, 3, 2, 1))), bill: K.bill, neck: K.neck, neckFly: K.neckFly, legs: 0, mode: K.mode, flee: K.flee, seed: hash(k, 5, 6, 7), fly: false, age: 0, dead: false });
    }
  }
  if (bank.length && r(4) < 0.55) {
    const u = bank[0], h = heightAt(u), legs = 2.2, s = 0.75;
    if (h > 0.7) birds.push({ u, f: tang(nrm(mulAdd(mulAdd([0, 0, 0], E, Math.cos(r(5) * TAU)), N, Math.sin(r(5) * TAU))), u), hAbs: h, h0: h, lift: 0.33 * legs * s, s, col: lin('#58626b'), bill: 1, neck: 2.0, neckFly: 0.9, legs, mode: 1, flee: 45, seed: r(6), fly: false, age: 0, dead: false });
  }
  return birds.length ? { birds, gone: false } : null;
}
