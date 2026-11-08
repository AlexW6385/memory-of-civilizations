// The tour: one click and the visitor is carried from settlement to settlement, about a minute in each:
// the arrival view held for a few seconds, then the free camera lifts off from the walker's own eye (from
// rest, first straight up) and flies a smooth low route across the whole town, past the landmark, so the
// city is seen from just above its roofs. Any input ends it.
import { footing, EYE } from '../core/walk.js';
import { ARRIVALS } from '../planet/arrivals.js';
import { BUILT } from '../planet/relief.js';
import { nearest, take, visit } from './order.js';

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const yawTo = (dx, dz) => Math.atan2(-dx, -dz);       // the camera looks along (-sin yaw, -cos yaw)
const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const HOLD = 3, RISE = 8, FLY = 49;                   // seconds: the arrival view, the climb, the flyover (60 s in all)
const INPUTS = ['keydown', 'pointerdown', 'mousedown', 'mousemove', 'wheel', 'touchstart', 'touchmove'];
const CLEAR = 8;                                      // m the camera keeps above the ground and buildings

export class Tour {
  /**
   * @param {object} o  controls, world, go(S) → Promise (travels and waits until the place is ready),
   *                    onChange(active)
   */
  constructor(o) {
    Object.assign(this, o);
    this.active = false;
    this.leg = null;
    this.runId = 0;
    // any input ends the tour (the first half second is ignored, and the repeat of the start key)
    this._stop = (e) => {
      if (!this.active || performance.now() - this.t0 < 500) return;
      if (e.type === 'keydown' && e.repeat && e.code === this.startKey) return;
      // R skips to the next settlement (main.js) and the tour goes on there
      if (e.type === 'keydown' && (e.code === 'KeyR' || e.code === 'KeyM' || (e.code === 'Escape' && !document.getElementById('map')?.hidden)) && !e.ctrlKey && !e.metaKey && !e.altKey) return;
      if (e.type === 'mousemove' && !e.buttons) return;
      // the page's own controls (sound, language, the corner map and its zoom, the panels, the clock) do
      // not end the tour: only input on the world itself (the view, the walking stick) or a key does
      if (e.type !== 'keydown' && e.target instanceof Element && !(e.target.id === 'view' || e.target.id === 'stick' || e.target === document.body || e.target === document.documentElement)) return;
      e.stopImmediatePropagation(); e.preventDefault?.();
      this.stop();
    };
  }

  /** Whether the camera is being moved by the tour (the frame loop keeps drawing at full rate). */
  get moving() { return this.active && !!this.leg; }

  start(startKey = null) {
    if (this.active) return;
    this.startKey = startKey;
    this.active = true; this.t0 = performance.now(); this.leg = null;
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

  /** Skip to the next settlement of the shared random order: the current leg ends, the tour goes on there. */
  skip() { if (this.active && this.leg) this.leg.done?.(); }

  /** The next settlement: the nearest to the visitor first, then the page's shared random order (src/ui/order.js). */
  next() {
    if (this.first) {
      this.first = false;
      const best = nearest(this.world.here(this.controls));
      visit(best);
      return best;
    }
    return take(this.last);
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

  /** The leg for S: hold the arrival view, lift off, fly a low route over the whole town. */
  begin(S) {
    const id = S.site.id;
    const R = clamp(S.radius || 150, 60, 380);
    const A = ARRIVALS[id] || [0, null, 60, 0, 0.1];
    const ax = A[0], az = A[2], ayaw = A[3], apitch = A[4];
    // the landmark: where the arrival's line of sight comes closest to the centre (if that is near it), else the centre
    const dx = -Math.sin(ayaw), dz = -Math.cos(ayaw);
    const t = Math.max(0, -(ax * dx + az * dz));
    let tx = ax + dx * t, tz = az + dz * t;
    if (Math.hypot(tx, tz) > 0.35 * R) { tx = 0; tz = 0; }
    const ty = this.ground(tx, tz) + 0.1 * R;
    this.arrival = { site: world_site(this.world), x: ax, y: A[1], z: az, yaw: ayaw, pitch: apitch };
    // the route: one even loop round the landmark at about 0.4 R, from the arrival side and back to it,
    // so a minute shows the whole town close below without weaving
    const rr = clamp(0.4 * R, 45, 150), a0 = Math.atan2(ax - tx, az - tz);
    const pts = [[ax, az]];
    for (let k = 1; k <= 12; k++) {
      const a = a0 + (k / 12) * Math.PI * 2;
      pts.push([tx + Math.sin(a) * rr, tz + Math.cos(a) * rr]);
    }
    pts.push([ax, az]);
    // centripetal Catmull-Rom through them, resampled at even spacing
    const dense = [];
    const ext = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts, [2 * pts.at(-1)[0] - pts.at(-2)[0], 2 * pts.at(-1)[1] - pts.at(-2)[1]]];
    for (let i = 1; i < ext.length - 2; i++) crSeg(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], 40, dense);
    dense.push(pts.at(-1));
    const STEP = 2, X = [dense[0][0]], Z = [dense[0][1]];
    let acc = 0;
    for (let i = 1; i < dense.length; i++) {
      let [px, pz] = dense[i - 1]; const [qx, qz] = dense[i];
      let seg = Math.hypot(qx - px, qz - pz);
      while (acc + seg >= STEP) {
        const k = (STEP - acc) / seg;
        px += (qx - px) * k; pz += (qz - pz) * k; seg = Math.hypot(qx - px, qz - pz); acc = 0;
        X.push(px); Z.push(pz);
      }
      acc += seg;
    }
    const M = X.length;
    // altitude: sample the ground and buildings densely along the path and 6 m to each side, take the upper
    // envelope (max over +-12 m), add clearance, then shape it with limited climb/descent slopes and a smoothing
    // that never goes below the envelope (limit, average, re-max, repeated)
    const base = 10;
    const g = X.map((x, i) => {
      const a = Math.max(0, i - 1), b = Math.min(M - 1, i + 1);
      const tx = X[b] - X[a], tz = Z[b] - Z[a], l = Math.hypot(tx, tz) || 1, nx = -tz / l * 10, nz = tx / l * 10;
      return Math.max(this.ground(x, Z[i]), this.ground(x + nx, Z[i] + nz), this.ground(x - nx, Z[i] - nz));
    });
    const W = Math.round(90 / STEP), WA = Math.round(120 / STEP), KC = 0.08, KD = 0.05;   // (wide: the line runs level over the roofs and the lanes between them, climbing only for what really rises)
    const env = g.map((v, i) => {
      let m = v; for (let j = Math.max(0, i - W); j <= Math.min(M - 1, i + W); j++) m = Math.max(m, g[j]);
      return m + CLEAR;
    });
    let Y = env.slice();
    const limit = () => {
      for (let i = 1; i < M; i++) Y[i] = Math.max(Y[i], Y[i - 1] - KD * STEP);     // no steeper descent
      for (let i = M - 2; i >= 0; i--) Y[i] = Math.max(Y[i], Y[i + 1] - KC * STEP); // no steeper climb: start earlier
    };
    for (let pass = 0; pass < 10; pass++) {
      limit();
      const Y0 = Y;
      Y = Y0.map((_, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - WA); j <= Math.min(M - 1, i + WA); j++) { s += Y0[j]; n++; } return Math.max(s / n, env[i]); });
    }
    limit();
    this.leg = { site: world_site(this.world), t: 0, R, tx, ty, tz, X, Z, Y, M, STEP, base, lift: 0, liftV: 0, start: null, s: 0 };
  }

  /** The route's point at arc length s: [x, z, y]. */
  at(L, s) {
    const f = clamp(s / L.STEP, 0, L.M - 1), i = Math.min(L.M - 2, Math.floor(f)), k = f - i;
    return [L.X[i] + (L.X[i + 1] - L.X[i]) * k, L.Z[i] + (L.Z[i + 1] - L.Z[i]) * k, L.Y[i] + (L.Y[i + 1] - L.Y[i]) * k];
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
    const END = HOLD + RISE + FLY;
    // the frame changed under us (left the settlement's zone) or the minute is spent: this leg is over
    if (world_site(this.world) !== L.site || L.t > END) { L.done?.(); return; }
    if (L.t <= HOLD) return;                         // holding the arrival view (the walker stands there)
    const total = (L.M - 1) * L.STEP;
    if (!L.start) {
      // the hand-over: the free camera starts exactly where the walker's eye is, looking where it looks
      L.start = { x: F.x, y: F.y + EYE, z: F.z, yaw: C.yaw, pitch: C.pitch };
      L.yaw = C.yaw; L.pitch = C.pitch; L.wy = 0; L.wp = 0;
      L.s0 = Math.min(0.15 * L.R, total * 0.2);
      const [qx, qz, qy] = this.at(L, L.s0), [rx, rz, ry] = this.at(L, L.s0 + L.STEP);
      const tl = Math.hypot(rx - qx, rz - qz) || 1;
      L.V = (total - L.s0) / (FLY - 1.5);
      L.end = { x: qx, y: qy, z: qz, tx: (rx - qx) / tl, tz: (rz - qz) / tl, ty: (ry - qy) / tl };
      L.s = L.s0;
      C.free = true; this.pp = null; this.vel = null;
    }
    const S0 = L.start, E = L.end;
    let x, y, z, look;                               // look: the arc length the gaze aims ahead of
    const tr = (L.t - HOLD) / RISE;
    if (tr < 1) {
      // lift-off: a Hermite curve that leaves the eye from rest, first straight up, then leaning out and
      // joining the route at its cruising velocity (time warped by u = t²(2 − t): zero speed at the start)
      const u = tr * tr * (2 - tr), u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      const m = L.V * RISE;
      const m0y = 1.3 * (E.y - S0.y);
      x = h00 * S0.x + h01 * E.x + h11 * m * E.tx;
      z = h00 * S0.z + h01 * E.z + h11 * m * E.tz;
      y = h00 * S0.y + h10 * m0y + h01 * E.y + h11 * m * E.ty;
      look = L.s0 * ease(tr);
    } else {
      const sm = ease(clamp((END - L.t) / 2.5, 0, 1));   // the last seconds ease to a halt: no snap into the next travel
      L.s = Math.min(total, L.s + L.V * sm * dt);
      [x, z, y] = this.at(L, L.s);
      look = L.s;
      // over buildings and rising ground, beyond what the route already clears: lift, rate-limited
      // (an emergency margin only: the planned line already clears everything, so the small differences
      // between roofs and lanes never move the camera)
      const gr = this.ground(x, z);
      const need = Math.max(0, gr + 3 - y);
      // critically damped: no jump
      const w = 0.8, acc = w * w * (need - L.lift) - 2 * w * L.liftV;
      L.liftV += acc * dt; L.lift += L.liftV * dt;
      y += Math.max(0, L.lift);
    }
    // gaze: ahead along the route and down, turned toward the landmark when near it; rate- and
    // acceleration-limited so it never jerks
    const lk = clamp(0.2 * L.R, 25, 70);
    const [gx, gz] = this.at(L, look + lk);
    let wantYaw = yawTo(gx - x, gz - z), wantPitch = -0.3;
    const ldx = L.tx - x, ldz = L.tz - z;
    wantYaw += wrap(yawTo(ldx, ldz) - wantYaw) * 0.35;   // a steady quarter-turn in toward the landmark
    if (tr < 1) { const k = ease(tr); wantYaw = S0.yaw + wrap(wantYaw - S0.yaw) * k; wantPitch = S0.pitch + (wantPitch - S0.pitch) * k; }
    // never look into a wall close ahead: raise the gaze over whatever stands within 45 m of it
    {
      const fx = -Math.sin(L.yaw), fz = -Math.cos(L.yaw);
      for (const d of [6, 12, 20, 32, 45]) {
        const req = Math.atan2(this.ground(x + fx * d, z + fz * d) + 3 - y, d);
        if (req > wantPitch) wantPitch = Math.min(req, 0.35);
      }
    }
    const steer = (cur, vel, want, wrapIt, max) => {
      const err = wrapIt ? wrap(want - cur) : want - cur;
      const goal = clamp(err * 1.4, -max, max);
      vel += clamp(goal - vel, -0.5 * dt, 0.5 * dt);
      return [cur + vel * dt, vel];
    };
    // always rate- and acceleration-limited, from the walker's own view on
    [L.yaw, L.wy] = steer(L.yaw, L.wy, wantYaw, true, 0.5);
    [L.pitch, L.wp] = steer(L.pitch, L.wp, wantPitch, false, 0.3);
    C.yaw = wrap(L.yaw); C.pitch = L.pitch;
    if (this.pp && dt > 0) { this.vel = { x: (x - this.pp.x) / dt, y: (y - this.pp.y) / dt, z: (z - this.pp.z) / dt }; }
    this.pp = { x, y, z };
    F.x = x; F.z = z; F.y = y - EYE; F.vy = 0; C.vy = 0;
    C.apply();
  }

  /** Stay exactly where the camera is: if airborne, float there (cruise) with the same yaw and pitch and the pace it had. */
  land() {
    const C = this.controls;
    if (!C.free) return;
    const v = this.vel || { x: 0, y: 0, z: 0 };
    C.free = false; C.glide = true; C._aloft = true;
    C.vel = { x: v.x, z: v.z }; C.vy = C.feet.vy = v.y;
    C.setCruise(true);
  }
}

/** Centripetal Catmull-Rom segment p1→p2 (Barry-Goldman), n samples appended to out. */
function crSeg(p0, p1, p2, p3, n, out) {
  const d = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1]));
  const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
  const mix = (a, b, ta, tb, t) => [(a[0] * (tb - t) + b[0] * (t - ta)) / (tb - ta), (a[1] * (tb - t) + b[1] * (t - ta)) / (tb - ta)];
  for (let k = 0; k < n; k++) {
    const t = t1 + (t2 - t1) * k / n;
    const A1 = mix(p0, p1, t0, t1, t), A2 = mix(p1, p2, t1, t2, t), A3 = mix(p2, p3, t2, t3, t);
    out.push(mix(mix(A1, A2, t0, t2, t), mix(A2, A3, t1, t3, t), t1, t2, t));
  }
}

function world_site(world) { return world.anchor?.site || null; }
