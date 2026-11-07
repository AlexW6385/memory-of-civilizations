// The tour: one click and the visitor is carried from settlement to settlement; in each the walker
// makes one brisk loop through the whole place (every known viewpoint plus points sampled round the
// landmark and over the open ground), using the walker's own movement (src/core/walk.js), and where
// it cannot get on the camera glides over the obstacle. Only Esc ends it; other input is ignored.
import { move, footing } from '../core/walk.js';
import { BUILT } from '../planet/relief.js';
import { dot } from '../planet/geo.js';

// Good places to stand and look in each settlement ([x, z, yaw, pitch] in its frame), taken from
// tools/viewpoints.json (the free-camera "air" views left out).
const VIEWS = {
  'amsterdam': [[20,-210,1.57,0.2]],
  'angkor': [[-178,2,-1.57,0.08],[-95,0,-1.57,0.14],[-15,-40,-2.36,0.32],[0,203,3.14,0.0]],
  'athens': [[75,18,1.57,0.1]],
  'babylon': [[-40,-360,3.14,0.2],[-40,-55,3.3,0.35]],
  'barcelona': [[232,-92,1.57,0.35]],
  'baroque-rome': [[110,0,1.57,0.25],[-40,30,1.2,0.45]],
  'borobudur': [[110,0,1.57,0.18],[46,-30,3.14,0.05],[20,10,1.0,0.1],[205,-60,1.2,0.05]],
  'cahokia': [[-25,20,0,0.25],[0,-160,3.14,-0.1]],
  'chichen-itza': [[30,75,0.38,0.17],[-115,25,0,0.05],[50,-14,-1.57,0.1],[0,-205,0,-0.08]],
  'conques': [[-45,0,-1.57,0.25]],
  'constantinople': [[-100,0,-1.57,0.2]],
  'djenne': [[95,30,1.25,0.13],[50,-2,1.57,0.22],[-70,-75,0.0,0.05],[0,232,0,0.03]],
  'edfu': [[0,150,0,0.2]],
  'edo-himeji': [[-20,-12,0,0.38],[0,268,0,0.14],[70,185,0.34,0.14],[-40,336,-1.57,0.04]],
  'florence': [[-150,-20,-1.2,0.3]],
  'giza': [[150,-190,2.36,0.25],[146,-40,1.57,0.35],[-200,-61,1.57,0.05],[20,230,3.14,0.0]],
  'granada': [[20,0,0,0.15]],
  'great-zimbabwe': [[46,60,3.14,0.1]],
  'heian-uji': [[52,0,1.57,0.1]],
  'isfahan': [[0,-120,3.14,0.06],[0,205,3.14,0.2],[-16,288,2.36,0.22],[40,-40,-1.57,0.25],[-35,-40,1.57,0.3],[0,-330,0,0.05]],
  'jerusalem': [[-95,-65,-1.98,0.2]],
  'joseon-seoul': [[0,80,0,0.15],[-60,-10,-1.57,0.08],[0,290,0,0.12]],
  'khajuraho': [[0,-60,1.57,0.3]],
  'kilwa': [[-10,-25,3.14,0.15]],
  'knossos': [[-110,10,-1.57,0.15],[0,22,0,0.05]],
  'lalibela': [[-218,112,-2.42,-0.55],[-210,140,-2.36,0.25],[10,-70,0,0.15],[-100,-14,-1.57,0.05]],
  'lhasa': [[-4,120,0,0.32],[-10,-64,3.14,-0.15]],
  'london': [[200,-170,1.9,0.2]],
  'machu-picchu': [[-20,-10,-2.2,0.05],[-38,20,3.14,0.03],[97,-60,-1.57,-0.25]],
  'madurai': [[-20,170,0,0.3],[-71,80,0,0.05]],
  'mamluk-cairo': [[-37,-14,3.14,0.3]],
  'maori': [[0,150,0,0.2],[0,25,0,-0.05]],
  'ming-suzhou': [[0,-24,0,-0.04],[-20,-21,1.02,-0.02],[-40,64,-1.57,-0.03],[0,51,0,0.02]],
  'mughal-agra': [[0,60,0,0.1],[45,-140,0.35,0.3],[0,215,0,0.15],[100,262,1.57,0.02]],
  'muscovy': [[40,40,3.14,0.3],[30,-60,1.57,0.15]],
  'nara': [[0,20,0,0.25]],
  'new-york': [[4,176,3.14,0.6],[100,-200,-1.57,0.35]],
  'norse-borgund': [[-24,-28,-1.57,0.3],[60,30,0.9,0.1]],
  'ottoman-istanbul': [[0,-90,3.14,0.25]],
  'paris': [[-250,-10,-1.57,0.25],[110,0,-1.57,0.3]],
  'persepolis': [[-200,-140,-1.57,0.15],[-30,-150,0,0.25]],
  'petra': [[160,-158,1.57,0.25],[40,12,1.57,0.05]],
  'qing-beijing': [[0,232,0,0.12],[0,70,0,0.1],[40,20,1.01,0.06],[240,260,1.57,0.0]],
  'rapa-nui': [[0,62,3.14,0.12],[-60,-40,0.8,0.2]],
  'rome': [[0,-120,3.14,0.15]],
  'sanchi': [[0,60,0,0.15]],
  'song-hangzhou': [[-110,138,0,0.32],[-135,100,-0.5,0.4],[132,60,0,0.05],[-20,146,1.2,0.1]],
  'song-kaifeng': [[160,-140,0,0.38],[60,55,1.2,0.05]],
  'stonehenge': [[45,-45,2.36,0.05]],
  'sydney': [[48,-97,-0.42,0.14],[-20,-2,0.6,0.15]],
  'tang-wutai': [[-40,0,-1.57,0.25],[38,0,-1.57,0.1]],
  'taos': [[0,25,0.3,0.12],[10,-30,3.14,0.1]],
  'tenochtitlan': [[-10,30,-1.9,0.25],[80,-8,1.57,-0.1],[-120,207,-1.57,0.03]],
  'teotihuacan': [[0,60,0,0.1],[10,-80,-1.57,0.28],[60,260,-1.57,0.15]],
  'ur': [[0,-118,3.14,0.22],[20,-21,2.6,0.2],[150,-20,1.57,0.05],[-270,-40,1.57,0.0]],
  'venice': [[-60,-5,-1.57,0.2]],
  'versailles': [[-60,0,-1.57,0.15]],
};

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const yawTo = (dx, dz) => Math.atan2(-dx, -dz);       // the camera looks along (-sin yaw, -cos yaw)
const GLIDE_UP = 4, GLIDE_SPEED = 9;                  // m above the ground, m/s of the free camera

export class Tour {
  /**
   * @param {object} o  controls, world, go(S) → Promise (travels and waits until the place is ready),
   *                    note (element), onChange(active)
   */
  constructor(o) {
    Object.assign(this, o);
    this.active = false;
    this.queue = [];
    this.leg = null;
    this.runId = 0;
    // only Esc ends the tour
    this._stop = (e) => { if (this.active && e.code === 'Escape') this.stop(); };
  }

  /** Whether the camera is being moved by the tour (the frame loop keeps drawing at full rate). */
  get moving() { return this.active && !!this.leg; }

  start() {
    if (this.active) return;
    this.active = true; this.t0 = performance.now(); this.leg = null; this.queue = [];
    this.controls.keys.clear(); this.controls.flyHeld = false;
    addEventListener('keydown', this._stop, true);
    if (this.note) this.note.hidden = false;
    this.onChange?.(true);
    this.run();
  }

  stop() {
    if (!this.active) return;
    this.active = false; this.leg?.done?.(); this.leg = null; this.runId++;
    removeEventListener('keydown', this._stop, true);
    if (this.note) this.note.hidden = true;
    const C = this.controls;
    if (C.free) { const F = C.feet; C.setPose(F.x, F.y, F.z, C.yaw, C.pitch); }   // (a glide cut short: come down here)
    C.keys.clear(); C.stick.x = C.stick.y = 0;
    C.enabled = true;
    this.onChange?.(false);
  }

  toggle() { if (this.active) this.stop(); else this.start(); }

  /** The next settlement: the nearest to the visitor first, then a shuffled round of all the others. */
  next() {
    if (this.first) {
      this.first = false;
      const u = this.world.here(this.controls);
      let best = null, bd = -2;
      for (const S of BUILT) { const d = dot(u, S.u); if (d > bd) { bd = d; best = S; } }
      this.queue = this.queue.filter((S) => S !== best);
      return best;
    }
    if (!this.queue.length) {
      this.queue = shuffle(BUILT.filter((S) => S !== this.last));
    }
    return this.queue.shift();
  }

  async run() {
    this.first = true; this.last = null;
    const id = this.runId;
    while (this.active && id === this.runId) {
      const S = this.next();
      if (!S) break;
      try { await this.go(S); } catch (e) { console.warn('[tour]', e); await new Promise((r) => setTimeout(r, 3000)); continue; }
      if (!this.active || id !== this.runId) break;
      this.last = S;
      this.begin(S);
      // the leg ends by itself (the loop is closed or its time spent), or the tour is stopped
      await new Promise((resolve) => { this.leg.done = resolve; });
      if (id !== this.runId) return;
      this.leg = null;
    }
    if (id === this.runId) this.stop();
  }

  /** A standable point at (x, z) in the settlement's frame, or null (water, inside something, no ground). */
  spot(x, z) {
    const C = this.controls.collide;
    try {
      const g = footing(C, x, z, C.terrain(x, z) + 2);
      if (!Number.isFinite(g)) return null;
      if (C.water?.(x, z, g)) return null;
      if (C.blockedAt(x, z, 0.4, g + 0.3, g + 1.8)) return null;
      return g;
    } catch { return null; }
  }

  /** One loop through the whole settlement: every viewpoint, the landmark's surroundings and the open
   *  ground, nearest neighbour first from where we stand, closing back at the start. */
  begin(S) {
    const id = S.site.id, C = this.controls, F = C.feet;
    const R = clamp(S.radius || 150, 60, 380);
    const pts = [];
    for (const v of VIEWS[id] || []) pts.push({ x: v[0], z: v[1], yaw: v[2], pitch: v[3], view: true });
    // sampled walkable points in rings round the centre (the landmark) and out over the open ground
    const want = clamp(Math.round(R / 16), 8, 20);
    const cand = [];
    for (const f of [0.18, 0.4, 0.62, 0.84]) {
      const n = Math.round(6 + f * 10), off = Math.random() * 6.283;
      for (let k = 0; k < n; k++) {
        const a = off + (k / n) * 6.283, r = f * R;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (this.spot(x, z) != null) cand.push({ x, z });
      }
    }
    // keep the extra points well spread: farthest-point selection against what is already chosen
    const chosen = pts.slice();
    if (!chosen.length) chosen.push({ x: F.x, z: F.z });
    while (chosen.length < want && cand.length) {
      let bi = 0, bd = -1;
      cand.forEach((c, i) => { let d = Infinity; for (const p of chosen) d = Math.min(d, Math.hypot(c.x - p.x, c.z - p.z)); if (d > bd) { bd = d; bi = i; } });
      const [c] = cand.splice(bi, 1);
      if (bd < 14) break;
      chosen.push(c); pts.push(c);
    }
    // nearest-neighbour order from here, then back to the start
    const order = [], start = { x: F.x, z: F.z };
    let cx = F.x, cz = F.z;
    const rest = pts.filter((p) => Math.hypot(p.x - cx, p.z - cz) > 6);
    while (rest.length) {
      let bi = 0, bd = Infinity;
      rest.forEach((p, i) => { const d = Math.hypot(p.x - cx, p.z - cz); if (d < bd) { bd = d; bi = i; } });
      const [p] = rest.splice(bi, 1);
      order.push(p); cx = p.x; cz = p.z;
    }
    order.push(start);
    for (const p of order) p.gy = this.spot(p.x, p.z) ?? C.collide.terrain(p.x, p.z);
    let len = 0; cx = F.x; cz = F.z;
    for (const p of order) { len += Math.hypot(p.x - cx, p.z - cz); cx = p.x; cz = p.z; }
    const speed = clamp(len / 65, 4, 6);
    const budget = clamp(len / speed * 1.5 + 12, 30, 140);
    this.leg = { site: world_site(this.world), S, order, i: 0, t: 0, budget, speed, v: 0, tries: 0, probe: 0, probeAt: [F.x, F.z], glide: null, R };
  }

  /** Every frame, before the controls: move the camera along the loop. */
  update(dt) {
    if (!this.active) return;
    const C = this.controls, F = C.feet;
    // the walker is the tour's alone: keys, the stick, the mouse and the fly button do nothing meanwhile
    C.enabled = false; C.stick.x = C.stick.y = 0; C.flyHeld = false;
    const L = this.leg;
    if (!L) return;
    dt = Math.min(dt, 0.1);
    L.t += dt;
    // the frame changed under us (left the settlement's zone) or the time is spent: this leg is over
    if (world_site(this.world) !== L.site || L.t > L.budget) { this.land(); L.done?.(); return; }
    if (L.glide) { this.glideStep(L, dt); return; }
    const tx = L.order[L.i];
    if (!tx) { this.land(); L.done?.(); return; }
    const dx = tx.x - F.x, dz = tx.z - F.z, dist = Math.hypot(dx, dz);
    if (dist < 2.2) { L.i++; L.tries = 0; L.probe = 0; L.probeAt = [F.x, F.z]; return this.finish(L, dt); }
    // the pace eases in over a second or so and does not drop for the points on the way (only the last)
    const want = L.speed * (L.i === L.order.length - 1 ? Math.min(1, dist / 8) : 1);
    L.v += (want - L.v) * Math.min(1, dt * 2.5);
    let a = Math.atan2(dz, dx);
    // round an obstacle: alternately to either side, wider each time
    if (L.tries) a += (L.tries % 2 ? 1 : -1) * Math.ceil(L.tries / 2) * 0.6;
    F.vy = 0;
    move(F, Math.cos(a) * L.v * dt, Math.sin(a) * L.v * dt, dt, C.collide);
    // blocked? (a second's walk gone for less than a quarter of it): round it, then over it
    L.probe += dt;
    if (L.probe >= 0.8) {
      const got = Math.hypot(F.x - L.probeAt[0], F.z - L.probeAt[1]);
      L.probe = 0; L.probeAt = [F.x, F.z];
      if (got < 0.25 * L.v * 0.8 && L.v > 0.6) { if (++L.tries > 2) { L.glide = { gy: F.y }; L.tries = 0; } }
      else if (got > 0.6 * L.v * 0.8) L.tries = 0;
    }
    // heading: toward the point, a little toward the one after (look-ahead)
    const nx = L.order[L.i + 1];
    let yawT = yawTo(dx, dz);
    if (nx && dist < 20) { const w = 0.35 * (1 - dist / 20); yawT += wrap(yawTo(nx.x - F.x, nx.z - F.z) - yawT) * w; }
    // looking slightly down while passing the landmark (the settlement's centre), level elsewhere
    const near = Math.hypot(F.x, F.z) < 0.3 * L.R + 25;
    const pitchT = near ? -0.07 : 0.04;
    this.turn(dt, yawT, pitchT);
    C.vy = F.vy || 0;
    C.apply();
  }

  /** The leg's closing step: when the loop is complete, it is over. */
  finish(L, dt) {
    if (L.i >= L.order.length) { this.land(); L.done?.(); }
  }

  turn(dt, yawT, pitchT) {
    const C = this.controls, k = 1 - Math.exp(-dt * 2.2);
    C.yaw += clamp(wrap(yawT - C.yaw) * k, -1.3 * dt, 1.3 * dt);
    C.pitch += (pitchT - C.pitch) * k;
  }

  /** Stuck: the camera glides, a few metres up, to the next point (the walker is put down there). */
  glideStep(L, dt) {
    const C = this.controls, F = C.feet, tx = L.order[L.i];
    if (!C.free) C.free = true;
    const dx = tx.x - F.x, dz = tx.z - F.z, dist = Math.hypot(dx, dz);
    const up = tx.gy + GLIDE_UP;
    if (dist < 1.5) {
      C.setPose(tx.x, tx.gy, tx.z, C.yaw, C.pitch);     // down again (and free = false)
      L.glide = null; L.v = 0; L.i++; L.probe = 0; L.probeAt = [C.feet.x, C.feet.z];
      if (L.i >= L.order.length) { L.done?.(); }
      return;
    }
    const step = Math.min(dist, GLIDE_SPEED * dt);
    F.x += dx / dist * step; F.z += dz / dist * step;
    F.y += clamp(up - F.y, -4 * dt, 4 * dt);
    this.turn(dt, yawTo(dx, dz), -0.05);
    C.apply();
  }

  /** Put the walker down where it is (after a glide cut short by the leg's end). */
  land() {
    const C = this.controls;
    if (C.free) { const F = C.feet; C.setPose(F.x, F.y, F.z, C.yaw, C.pitch); }
  }
}

function world_site(world) { return world.anchor?.site || null; }
