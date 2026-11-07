// The tour: one click and the visitor is carried from settlement to settlement, about a minute in each:
// the arrival view held for a few seconds, then the free camera rises smoothly up and outward to an
// overview sized to the place and circles it once, always looking at the landmark, so the whole city is
// seen from the air. Any input ends it.
import { footing, EYE } from '../core/walk.js';
import { ARRIVALS } from '../planet/arrivals.js';
import { BUILT } from '../planet/relief.js';
import { dot } from '../planet/geo.js';

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const yawTo = (dx, dz) => Math.atan2(-dx, -dz);       // the camera looks along (-sin yaw, -cos yaw)
const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const HOLD = 3, RISE = 8, ORBIT = 48;                 // seconds: the arrival view, the climb, one full turn
const INPUTS = ['keydown', 'pointerdown', 'mousedown', 'mousemove', 'wheel', 'touchstart', 'touchmove'];
const CLEAR = 22;                                     // m the camera keeps above the ground and buildings

export class Tour {
  /**
   * @param {object} o  controls, world, go(S) → Promise (travels and waits until the place is ready),
   *                    onChange(active)
   */
  constructor(o) {
    Object.assign(this, o);
    this.active = false;
    this.queue = [];
    this.leg = null;
    this.runId = 0;
    // any input ends the tour (the first half second is ignored, and the repeat of the start key)
    this._stop = (e) => {
      if (!this.active || performance.now() - this.t0 < 500) return;
      if (e.type === 'keydown' && e.repeat && e.code === this.startKey) return;
      if (e.type === 'mousemove' && !e.buttons) return;
      e.stopImmediatePropagation(); e.preventDefault?.();
      this.stop();
    };
  }

  /** Whether the camera is being moved by the tour (the frame loop keeps drawing at full rate). */
  get moving() { return this.active && !!this.leg; }

  start(startKey = null) {
    if (this.active) return;
    this.startKey = startKey;
    this.active = true; this.t0 = performance.now(); this.leg = null; this.queue = [];
    this.controls.keys.clear(); this.controls.flyHeld = false;
    for (const t of INPUTS) addEventListener(t, this._stop, { capture: true, passive: false });
    this.onChange?.(true);
    this.run();
  }

  stop() {
    if (!this.active) return;
    this.active = false; this.leg?.done?.(); this.leg = null; this.runId++;
    for (const t of INPUTS) removeEventListener(t, this._stop, true);
    const C = this.controls;
    this.land();
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

  /** The height of the highest ground or building top under (x, z) in the settlement's frame. */
  ground(x, z) {
    const C = this.controls.collide;
    let t = 0;
    try { t = C.terrain(x, z); } catch { /* keep 0 */ }
    try { const g = footing(C, x, z, t + 400); if (Number.isFinite(g)) return Math.max(t, g); } catch { /* terrain only */ }
    return t;
  }

  /** The leg for S: hold the arrival pose, climb to the overview, circle the landmark once. */
  begin(S) {
    const C = this.controls, id = S.site.id;
    const R = clamp(S.radius || 150, 60, 380);
    const A = ARRIVALS[id] || [0, null, 60, 0, 0.1];
    const ax = A[0], az = A[2], ayaw = A[3], apitch = A[4];
    const ay = (A[1] ?? this.ground(ax, az)) ;
    // the landmark: where the arrival's line of sight comes closest to the centre (if that is near it), else the centre
    const dx = -Math.sin(ayaw), dz = -Math.cos(ayaw);
    const t = Math.max(0, -(ax * dx + az * dz));
    let tx = ax + dx * t, tz = az + dz * t;
    if (Math.hypot(tx, tz) > 0.35 * R) { tx = 0; tz = 0; }
    const ty = this.ground(tx, tz) + 0.1 * R;
    const rad = clamp(0.8 * R, 70, 300);
    const h = clamp(0.5 * R, 45, 190);
    const a0 = Math.atan2(ax - tx, az - tz);          // the arrival's side, as an angle round the landmark
    this.arrival = { site: world_site(this.world), x: ax, y: A[1], z: az, yaw: ayaw, pitch: apitch };
    this.leg = { site: world_site(this.world), t: 0, ax, ay: ay + EYE, az, ayaw, apitch, tx, ty, tz, rad, top: this.ground(tx, tz) + h, a0, lift: 0 };
  }

  /** Every frame, before the controls: move the camera along the leg. */
  update(dt) {
    if (!this.active) return;
    const C = this.controls, F = C.feet;
    // the camera is the tour's alone: keys, the stick, the mouse and the fly button do nothing meanwhile
    C.enabled = false; C.stick.x = C.stick.y = 0; C.flyHeld = false;
    const L = this.leg;
    if (!L) return;
    dt = Math.min(dt, 0.1);
    L.t += dt;
    // the frame changed under us (left the settlement's zone) or the minute is spent: this leg is over
    if (world_site(this.world) !== L.site || L.t > HOLD + RISE + ORBIT) { L.done?.(); return; }
    if (L.t <= HOLD) return;                         // holding the arrival view (the walker stands there)
    if (!C.free) C.free = true;
    const e = ease((L.t - HOLD) / RISE);
    const turn = clamp((L.t - HOLD - RISE) / ORBIT, 0, 1);
    // the orbit's start is on the arrival's side; the circle is run at constant angular speed
    const a = L.a0 + turn * 2 * Math.PI;
    const ox = L.tx + Math.sin(a) * L.rad, oz = L.tz + Math.cos(a) * L.rad;
    const x = L.ax + (ox - L.ax) * e, z = L.az + (oz - L.az) * e;
    let y = L.ay + (L.top - L.ay) * e;
    // over buildings and rising ground: lift (at once when needed, settling back slowly)
    const need = Math.max(0, this.ground(x, z) + CLEAR - y);
    L.lift = Math.max(need, L.lift + (need - L.lift) * Math.min(1, dt * 1.5));
    y += L.lift;
    const ddx = L.tx - x, ddz = L.tz - z, hd = Math.hypot(ddx, ddz) || 1;
    const lookYaw = yawTo(ddx, ddz), lookPitch = Math.atan2(L.ty - y, hd);
    C.yaw = L.ayaw + wrap(lookYaw - L.ayaw) * e;
    C.pitch = L.apitch + (lookPitch - L.apitch) * e;
    F.x = x; F.z = z; F.y = y - EYE; F.vy = 0; C.vy = 0;
    C.apply();
  }

  /** Back to walking: if the camera is airborne, at the arrival point of the current settlement. */
  land() {
    const C = this.controls, A = this.arrival;
    if (!C.free) return;
    if (A && A.site === world_site(this.world)) C.setPose(A.x, (A.y ?? this.ground(A.x, A.z)) + 0.02, A.z, A.yaw, A.pitch);
    else { const F = C.feet; C.setPose(F.x, F.y, F.z, C.yaw, C.pitch); }
  }
}

function world_site(world) { return world.anchor?.site || null; }
