// The tour: one click and the visitor is carried from settlement to settlement, each shown from its
// arrival view and then walked through slowly, with the walker's own movement (src/core/walk.js:
// ground-following, stopped by walls), between known good places. Any key, click, drag or touch ends
// it where the camera is.
import { move, WALK } from '../core/walk.js';
import { ARRIVALS } from '../planet/arrivals.js';
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

const SPEED = 1.5 * WALK / 2;               // m/s: an easy stroll
const HOLD = 6;                             // s looking at the arrival view first
const PAUSE = 4;                            // s looking at each place reached
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

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
    this._stop = (e) => {
      if (!this.active || performance.now() - this.t0 < 700) return;
      if (e.type === 'keydown' && e.repeat && e.code === 'KeyT') return;
      this.stop();
    };
  }

  /** Whether the camera is being moved by the tour (the frame loop keeps drawing at full rate). */
  get moving() { return this.active && !!this.leg; }

  start() {
    if (this.active) return;
    this.active = true; this.t0 = performance.now(); this.leg = null; this.queue = [];
    for (const ev of ['keydown', 'pointerdown', 'mousedown', 'touchstart', 'wheel']) addEventListener(ev, this._stop, true);
    if (this.note) this.note.hidden = false;
    this.onChange?.(true);
    this.run();
  }

  stop() {
    if (!this.active) return;
    this.active = false; this.leg?.done?.(); this.leg = null; this.runId++;
    for (const ev of ['keydown', 'pointerdown', 'mousedown', 'touchstart', 'wheel']) removeEventListener(ev, this._stop, true);
    if (this.note) this.note.hidden = true;
    this.controls.stick.x = this.controls.stick.y = 0;
    this.controls.enabled = true;
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
      // the leg ends by itself (its time spent), or the tour is stopped
      await new Promise((resolve) => { this.leg.done = resolve; });
      if (id !== this.runId) return;
      this.leg = null;
    }
    if (id === this.runId) this.stop();
  }

  /** Start walking the settlement: its arrival view first, then its other places, then on ahead. */
  begin(S) {
    const id = S.site.id, C = this.controls, F = C.feet;
    const A = ARRIVALS[id];
    const here = [F.x, F.z];
    let pts = (VIEWS[id] || []).map((v) => ({ x: v[0], z: v[1], yaw: v[2], pitch: v[3] }));
    // nearest first, from where we stand
    const order = [];
    let cx = here[0], cz = here[1];
    while (pts.length) {
      let bi = 0, bd = Infinity;
      pts.forEach((p, i) => { const d = Math.hypot(p.x - cx, p.z - cz); if (d < bd) { bd = d; bi = i; } });
      const [p] = pts.splice(bi, 1);
      if (bd > 6) order.push(p);
      cx = p.x; cz = p.z;
    }
    // too few places: stroll on ahead, in the direction of the arrival view
    if (order.length < 2) {
      const yaw = A ? A[3] : C.yaw, d = 45;
      order.push({ x: here[0] - Math.sin(yaw) * d, z: here[1] - Math.cos(yaw) * d, yaw, pitch: Math.max(0.05, C.pitch * 0.6) });
    }
    this.leg = { site: world_site(this.world), S, order, i: 0, t: 0, hold: HOLD, budget: 40 + Math.random() * 20, v: 0, tries: 0, probe: 0, probeAt: [F.x, F.z], pause: 0 };
  }

  /** Every frame, before the controls: move the camera along the leg. */
  update(dt) {
    const L = this.leg;
    if (!L || !this.active) return;
    dt = Math.min(dt, 0.1);
    const C = this.controls, F = C.feet;
    L.t += dt;
    // the frame changed under us (walked out of the settlement's zone): this leg is over
    if (world_site(this.world) !== L.site || L.t > L.budget) { L.done?.(); return; }
    C.enabled = true;
    let tx = null;
    if (L.hold > 0) { L.hold -= dt; }
    else if (L.pause > 0) L.pause -= dt;
    else if (L.i < L.order.length) tx = L.order[L.i];
    let yawT = C.yaw, pitchT = C.pitch;
    if (tx) {
      const dx = tx.x - F.x, dz = tx.z - F.z, dist = Math.hypot(dx, dz);
      if (dist < 1.2) { L.i++; L.pause = PAUSE; L.v = 0; L.tries = 0; }
      else {
        // the speed eases in over about two seconds and out over the last few metres
        const want = SPEED * Math.min(1, dist / 6);
        L.v += (want - L.v) * Math.min(1, dt * 1.2);
        let a = Math.atan2(dz, dx);
        // round an obstacle: alternately to either side, wider each time
        if (L.tries) a += (L.tries % 2 ? 1 : -1) * Math.ceil(L.tries / 2) * 0.6;
        F.vy = 0;
        move(F, Math.cos(a) * L.v * dt, Math.sin(a) * L.v * dt, dt, C.collide);
        yawT = tx.yaw; pitchT = tx.pitch;
        // blocked? (a second's walk gone for less than a quarter of it)
        L.probe += dt;
        if (L.probe >= 1.2) {
          const got = Math.hypot(F.x - L.probeAt[0], F.z - L.probeAt[1]);
          L.probe = 0; L.probeAt = [F.x, F.z];
          if (got < 0.25 * L.v * 1.2 && L.v > 0.4) {
            if (++L.tries > 4) { L.i++; L.tries = 0; L.v = 0; L.pause = 1; }
          } else if (got > 0.6 * L.v * 1.2) L.tries = 0;
        }
      }
    } else if (L.i >= L.order.length && L.pause <= 0 && L.hold <= 0) {
      // nothing more to walk to: a slow look round until the time is up
      yawT = C.yaw + 0.12;
    } else {
      yawT = L.i > 0 ? L.order[L.i - 1].yaw : C.yaw;
    }
    // the view turns slowly and smoothly
    const k = 1 - Math.exp(-dt * 0.7);
    if (tx || L.pause > 0 || L.i >= L.order.length) {
      C.yaw += Math.max(-0.35 * dt, Math.min(0.35 * dt, wrap(yawT - C.yaw) * k * 1.6));
      C.pitch += (pitchT - C.pitch) * k;
    }
    C.vy = F.vy || 0;
    C.apply();
  }
}

function world_site(world) { return world.anchor?.site || null; }
