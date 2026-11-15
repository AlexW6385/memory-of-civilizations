// The tour: one click and the visitor is carried from settlement to settlement, about a minute in each, at a
// good hour of its day: the arrival view held for a few seconds under a caption (name, time, one sentence);
// a low glide to where the landmark's own way in begins; a walk along that way at eye height, through its
// gates and courts and into its halls (the plan's walk route, checked to be walkable); then the free camera
// lifts off and flies a spiral out round the landmark, close at first, the town opening round it.
// The mouse looks about (the view comes back by itself), Space or a tap pauses, R goes on to the next, and
// a walking key, the stick or Esc hands the place over to the visitor where the camera is.
import { footing, move, EYE } from '../core/walk.js';
import { ARRIVALS } from '../planet/arrivals.js';
import { BUILT } from '../planet/relief.js';
import { nearest, take, visit } from './order.js';
import { CARDS } from '../planet/cards.js';
import { toWorld } from '../core/build.js';
import { t, tr, era, getLang } from './i18n.js';

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const yawTo = (dx, dz) => Math.atan2(-dx, -dz);       // the camera looks along (-sin yaw, -cos yaw)
const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const HOLD = 3, GLIDE = 7, WALK = 24, RISE = 7, FLY = 26;   // seconds: the arrival view, the glide to the landmark's way in (at most), the walk along it, the climb, the flight (about 65 s in all)
const INPUTS = ['keydown', 'pointerdown', 'mousemove'];
const TAKE = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const CLEAR = 8;                                      // m the camera keeps above the ground and buildings

export class Tour {
  /**
   * @param {object} o  controls, world, go(S) → Promise (travels and waits until the place is ready;
   *                    false if another travel asked for meanwhile took its place),
   *                    onChange(active)
   */
  constructor(o) {
    Object.assign(this, o);
    this.active = false;
    this.leg = null;
    this.runId = 0;
    this.paused = false; this.oy = 0; this.op = 0; this.lookedAt = -1e9;
    // input during the tour (the first half second is ignored, and the repeat of the start key)
    this._stop = (e) => {
      if (!this.active || performance.now() - this.t0 < 500) return;
      if (e.type === 'mousemove') {
        // the mouse looks about (dragging, or the pointer held by the page); the view eases back afterwards
        if (!e.buttons && !document.pointerLockElement) return;
        this.oy = clamp(this.oy - (e.movementX || 0) * 0.0025, -1.4, 1.4);
        this.op = clamp(this.op - (e.movementY || 0) * 0.0025, -0.7, 0.7);
        this.lookedAt = performance.now();
        return;
      }
      // the page's own controls (sound, language, the corner map and its zoom, the panels, the clock) are theirs
      const onWorld = !(e.target instanceof Element) || e.target.id === 'view' || e.target.id === 'stick' || e.target === document.body || e.target === document.documentElement;
      if (e.type === 'pointerdown') {
        if (!onWorld) return;
        if (e.target.id === 'stick') { this.stop(); return; }            // the walking stick: the visitor's from here
        e.stopImmediatePropagation();
        if (e.pointerType === 'touch') this.pause();                     // a tap pauses and goes on
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat && e.code === this.startKey) return;
      // R skips to the next settlement and M opens the map (main.js); T is the tour's own key
      if (e.code === 'KeyR' || e.code === 'KeyM' || e.code === 'KeyT' || (e.code === 'Escape' && !document.getElementById('map')?.hidden)) return;
      if (e.target instanceof Element && e.target.closest('input, select, button')) return;
      if (TAKE.includes(e.code)) { this.stop(); return; }                // a walking key: it already walks
      e.stopImmediatePropagation(); e.preventDefault?.();
      if (e.code === 'Space') { if (!e.repeat) this.pause(); return; }
      if (e.code === 'Escape') this.stop();
    };
  }

  /** A black veil over the view for the cut from under a roof to over it. */
  veil(on) {
    let el = this.veilEl;
    if (!el) { el = this.veilEl = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4'; document.body.appendChild(el); }
    el.style.opacity = on ? '1' : '0';
  }

  pause() { this.paused = !this.paused; this.caption(this.paused ? this.last : null, true); }

  /** (plain: without the tour's keys, for an arrival by the map or the random city.) */
  /** The caption under the arrival view: the name, the time shown and the first sentence of the settlement's card. */
  caption(S, keys = false, plain = false) {
    let el = this.cap;
    if (!el) { el = this.cap = document.createElement('div'); el.id = 'tour-cap'; el.className = 'tour-cap'; el.setAttribute('role', 'status'); el.hidden = true; document.body.appendChild(el); }
    clearTimeout(this.capT);
    if (!S) { el.classList.remove('on'); this.capT = setTimeout(() => { el.hidden = true; }, 700); return; }
    const para = (CARDS[S.site.id]?.[getLang()] || CARDS[S.site.id]?.en || [''])[0];
    const first = (/^.*?(?:[.!?](?=\s|$)|[。！？])/.exec(para) || [para])[0];
    el.textContent = '';
    const h = document.createElement('b'); h.textContent = tr(S.site.name);
    const e = document.createElement('span'); e.textContent = era(S.site.era);
    const p = document.createElement('p'); p.textContent = first;
    const k = document.createElement('small'); k.textContent = t(this.paused ? 'tour-paused' : 'tour-keys');
    if (plain) el.append(h, e, p); else el.append(h, e, p, k);
    el.hidden = false; void el.offsetWidth; el.classList.add('on');
    if (!this.paused) this.capT = setTimeout(() => this.caption(null), keys ? 4000 : 9000);
  }

  /** A good hour for S: mid-morning or mid-afternoon, whichever puts the sun behind the arrival view. */
  light(S) {
    const K = this.climate;
    if (!K) return;
    const A = ARRIVALS[S.site.id], east = A ? -Math.sin(A[3]) > 0 : false;
    const h = east ? 15.75 : 9.5;
    K.utc = ((h - (S.site.lon || 0) / 15) % 24 + 24) % 24;
    K.setTime('held');
  }

  /** Whether the camera is being moved by the tour (the frame loop keeps drawing at full rate). */
  get moving() { return this.active && !!this.leg; }

  start(startKey = null) {
    if (this.active) return;
    this.startKey = startKey;
    this.active = true; this.t0 = performance.now(); this.leg = null;
    this.paused = false; this.oy = this.op = 0;
    if (this.climate) this.clock = { mode: this.climate.mode, utc: this.climate.utc };
    this.controls.keys.clear(); this.controls.flyHeld = false;
    for (const t of INPUTS) addEventListener(t, this._stop, { capture: true, passive: false });
    this.onChange?.(true);
    this.run();
  }

  stop() {
    if (!this.active) return;
    this.active = false; this.leg?.done?.(); this.leg = null; this.runId++;
    this.paused = false; this.caption(null); this.veil(false);
    if (this.climate && this.clock) { this.climate.utc = this.clock.utc; this.climate.setTime(this.clock.mode); }
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
      let ok;
      // (the hour changes once the view has gone dark for the travel)
      setTimeout(() => { if (this.active && id === this.runId) this.light(S); }, this.last ? 450 : 0);
      try { ok = await this.go(S); } catch (e) { console.warn('[tour]', e); await new Promise((r) => setTimeout(r, 3000)); continue; }
      if (!this.active || id !== this.runId) break;
      // (a travel asked for elsewhere, the map, took the place of this one: the visitor chose; the tour ends)
      if (ok === false) break;
      this.last = S;
      this.begin(S);
      this.caption(S);
      // the leg ends by itself (the loop is closed or its time spent), or the tour is stopped
      await new Promise((resolve) => { this.leg.done = resolve; });
      if (id !== this.runId) return;
      this.leg = null;
    }
    if (id === this.runId) this.stop();
  }

  /** The clearest way on foot from F near the heading `yaw`: { dir (offset from yaw, rad), far (m walked before stopped, of 12) }. */
  way(F, yaw, was) {
    const C = this.controls.collide;
    let best = { dir: 0, far: -1, score: -1e9 };
    for (const d of [0, 0.2, -0.2, 0.42, -0.42, 0.7, -0.7, 1.0, -1.0, 1.4, -1.4]) {
      const a = yaw + d, ux = -Math.sin(a), uz = -Math.cos(a), P = { x: F.x, y: F.y, z: F.z, vy: 0 };
      let far = 0;
      try {
        for (let i = 0; i < 48; i++) {
          const x0 = P.x, z0 = P.z;
          move(P, ux * 0.25, uz * 0.25, 1 / 60, C);
          const adv = (P.x - x0) * ux + (P.z - z0) * uz;
          if (adv < 0.12 || Math.abs(P.y - F.y) > 3) break;
          far += adv;
        }
      } catch { /* this way is not tried */ }
      // (the straighter the better; not straight back into the way just found shut)
      const score = far - 3.5 * Math.abs(d) - (was !== undefined && Math.abs(d - was) < 0.05 ? 4 : 0);
      if (score > best.score) best = { dir: d, far, score };
    }
    return best;
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
    window.__tourLeg = id;   // (read by the promo recorder)
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
    // on foot: the landmark's own way in (its walk route nearest the arrival: checked to be walkable)
    let route = null;
    for (const r of this.world.plans?.values?.() || []) {
      if (r.site?.S !== S) continue;
      for (const w of r.plan.walks || []) {
        if (!Array.isArray(w) || w.length < 2) continue;
        const pts = w.map((q) => { const v = toWorld(r.plan, q[0], q[1]); return [v[0], v[2]]; });
        const d = Math.hypot(pts[0][0] - ax, pts[0][1] - az);
        if (!route || d < route.d) route = { pts, d, y0: (r.plan.base || 0) + (w.y0 ?? 0) };
      }
    }
    if (route && route.d > 260) route = null;
    this.leg = { site: world_site(this.world), t: 0, R, tx, ty, tz, route, lift: 0, liftV: 0, start: null, s: 0 };
  }

  /** Plans the flight of leg L from (fromX, fromZ): its line (X, Z at even spacing) and heights (Y). */
  plan(L, fromX, fromZ) {
    // the line: a spiral out from where the camera stands, three quarters of a turn round the landmark,
    // from close by it to about 0.42 R: first the landmark near and large, then the town opening round it
    const { R, tx, tz } = L;
    const rr = clamp(0.42 * R, 45, 160), a0 = Math.atan2(fromX - tx, fromZ - tz);
    const r0 = clamp(Math.hypot(fromX - tx, fromZ - tz), clamp(0.14 * R, 22, 55), rr);
    const pts = [[fromX, fromZ]];
    for (let k = 1; k <= 10; k++) {
      const u = k / 10, a = a0 + u * Math.PI * 1.5, r = r0 + (rr - r0) * ease(u);
      pts.push([tx + Math.sin(a) * r, tz + Math.cos(a) * r]);
    }
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
    Object.assign(L, { X, Z, Y, M, STEP, base });
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
    C.keys.clear();   // (no key reaches the walker while the tour has it: Space pauses, it does not lift)
    const L = this.leg;
    if (!L) return;
    dt = Math.min(dt, 0.1);
    // the look about: held while the mouse moves, then eased back to the tour's own view
    if (performance.now() - this.lookedAt > 2500) { const k = Math.exp(-1.6 * dt); this.oy *= k; this.op *= k; }
    if (!L.b) L.b = { yaw: C.yaw, pitch: C.pitch, x: F.x, z: F.z, w1: HOLD + GLIDE + WALK, still: 0, at: 0 };
    const B = L.b;
    if (!L.start) {
      // the arrival view, the glide and the walk: the view is the leg's own (B.yaw, B.pitch) and the visitor's look about
      C.enabled = !B.glide || B.walk;
      C.yaw = wrap(B.yaw + this.oy); C.pitch = clamp(B.pitch + this.op, -1.2, 1.2);
      if (B.glide && !B.walk && this.paused) C.apply();
    } else if (this.paused) { C.yaw = wrap(L.yaw + this.oy); C.pitch = clamp(L.pitch + this.op, -1.2, 1.2); C.apply(); }
    if (this.paused) return;
    L.t += dt;
    const END = B.w1 + RISE + FLY;
    // the frame changed under us (left the settlement's zone) or the minute is spent: this leg is over
    if (world_site(this.world) !== L.site || L.t > END) { L.done?.(); return; }
    if (L.t <= HOLD) return;                         // holding the arrival view (the walker stands there)
    const turn = (cur, want, rate) => cur + clamp(wrap(want - cur), -rate * dt, rate * dt);
    if (L.route && !B.walk) {
      // the glide: the free camera leaves the eye and goes low over the ground to the start of the landmark's
      // way in, over whatever stands between (never nearer than 2.5 m to it), turning to the way's first heading
      const P0 = L.route.pts[0], P1 = L.route.pts[1];
      if (!B.glide) {
        const y1 = footing(C.collide, P0[0], P0[1], L.route.y0 + 0.5);
        const d = Math.hypot(P0[0] - F.x, P0[1] - F.z);
        B.glide = { x0: F.x, y0: F.y + EYE, z0: F.z, y1: (Number.isFinite(y1) ? y1 : L.route.y0) + EYE, d, T: clamp(d / 11, 2.5, GLIDE), lift: 0, v: 0, yaw0: B.yaw, pitch0: B.pitch };
        B.w1 = HOLD + B.glide.T + WALK;
        C.free = true;
      }
      const G = B.glide, u0 = clamp((L.t - HOLD) / G.T, 0, 1), u = ease(u0);
      const x = G.x0 + (P0[0] - G.x0) * u, z = G.z0 + (P0[1] - G.z0) * u;
      let y = G.y0 + (G.y1 - G.y0) * u + Math.sin(Math.PI * u) * Math.min(6, 0.04 * G.d);
      // (over what stands under it and just ahead; not at the two ends, where the eye is at its own height)
      const dx = (P0[0] - G.x0) / (G.d || 1), dz = (P0[1] - G.z0) / (G.d || 1), edge = Math.min(1, u * G.d / 6, (1 - u) * G.d / 6);
      const need = edge > 0 ? Math.max(0, Math.max(this.ground(x, z), this.ground(x + dx * 5, z + dz * 5)) + 2.5 - y) * Math.max(0, edge) : 0;
      const w = 3, acc = w * w * (need - G.lift) - 2 * w * G.v;
      G.v += acc * dt; G.lift += G.v * dt; y += Math.max(0, G.lift);
      const along = yawTo(P0[0] - G.x0, P0[1] - G.z0), first = yawTo(P1[0] - P0[0], P1[1] - P0[1]);
      const want = G.d < 6 ? first : u0 < 0.65 ? along : first;
      B.yaw = turn(B.yaw, want, 1.1); B.pitch += (clamp(-0.02 - 0.1 * Math.sin(Math.PI * u), -0.3, 0.2) - B.pitch) * Math.min(1, 2.5 * dt);
      F.x = x; F.z = z; F.y = y - EYE; F.vy = 0; C.vy = 0;
      C.yaw = wrap(B.yaw + this.oy); C.pitch = clamp(B.pitch + this.op, -1.2, 1.2);
      C.apply();
      if (u0 >= 1) {
        // set down at the start of the way: the walker's own rules from here
        C.free = false; F.x = P0[0]; F.z = P0[1]; F.y = G.y1 - EYE; F.vy = 0; C.vy = 0;
        B.walk = { i: 1, t0: L.t }; B.x = F.x; B.z = F.z; B.still = 0;
        B.w1 = L.t + WALK;
      }
      return;
    }
    if (L.t <= B.w1) {
      if (B.cut) { C.stick.x = C.stick.y = 0; return; }       // (under the veil, before the lift-off from over a roof)
      if (B.walk) {
        // the walk: along the landmark's way in at a walking pace, the view turning with the way
        const Wk = B.walk, pts = L.route.pts;
        while (Wk.i < pts.length && Math.hypot(pts[Wk.i][0] - F.x, pts[Wk.i][1] - F.z) < 0.7) Wk.i++;
        if (Wk.i >= pts.length || B.still > 1.2) { B.w1 = L.t; C.stick.x = C.stick.y = 0; return; }
        const head = yawTo(pts[Wk.i][0] - F.x, pts[Wk.i][1] - F.z);
        B.yaw = turn(B.yaw, head, 1.7); B.pitch += (0.03 - B.pitch) * Math.min(1, 1.5 * dt);
        // (slower while the view is still turning to a new heading, and into and out of the walk)
        const k = Math.min(1, (L.t - Wk.t0) / 1.2, (B.w1 - L.t) / 1.2) * (0.45 + 0.55 * Math.max(0, Math.cos(wrap(head - B.yaw)))), dl = wrap(B.yaw + this.oy - head);
        C.stick.x = Math.sin(dl) * k; C.stick.y = -Math.cos(dl) * k;
        const moved = Math.hypot(F.x - B.x, F.z - B.z); B.x = F.x; B.z = F.z;
        B.still = moved < 0.2 * dt && k > 0.4 ? B.still + dt : 0;
        return;
      }
      // (no way in is known here: forward along the arrival's own line at a stroll, by the clearest heading
      // within 80° of it, tried again whenever the walker is stopped; shut in, the camera lifts off)
      if (B.w1 > HOLD + 14) B.w1 = HOLD + 14;
      if (B.dir === undefined || B.still > 0.5) {
        const way = this.way(F, B.yaw, B.dir);
        B.still = 0; B.dir = way.dir;
        if (way.far < 2.5) { B.w1 = L.t; C.stick.x = C.stick.y = 0; return; }
      }
      const k = Math.min(1, (L.t - HOLD) / 1.5, (B.w1 - L.t) / 1.5), dl = this.oy - B.dir;
      C.stick.x = Math.sin(dl) * 0.5 * k; C.stick.y = -Math.cos(dl) * 0.5 * k;
      const moved = Math.hypot(F.x - B.x, F.z - B.z); B.x = F.x; B.z = F.z;
      B.still = moved < 0.25 * dt && k > 0.5 ? B.still + dt : 0;
      return;
    }
    // under a roof (the way led indoors): the view dips to black for a moment and the flight begins over the roof
    const roof = L.start ? 0 : this.ground(F.x, F.z);
    if (!L.start && !B.cut && roof > F.y + 2.6) { B.cut = true; B.w1 = L.t + 0.45; this.veil(true); C.stick.x = C.stick.y = 0; return; }
    C.enabled = false; C.stick.x = C.stick.y = 0;
    if (!L.X) this.plan(L, F.x, F.z);
    const total = (L.M - 1) * L.STEP;
    if (!L.start) {
      // the hand-over: the free camera starts exactly where the walker's eye is, looking where it looks
      L.start = { x: F.x, y: B.cut ? roof + 2.5 : F.y + EYE, z: F.z, yaw: B.yaw, pitch: B.pitch };
      this.veil(false);
      L.yaw = B.yaw; L.pitch = B.pitch; L.wy = 0; L.wp = 0;
      L.s0 = Math.min(0.15 * L.R, total * 0.2);
      const [qx, qz, qy] = this.at(L, L.s0), [rx, rz, ry] = this.at(L, L.s0 + L.STEP);
      const tl = Math.hypot(rx - qx, rz - qz) || 1;
      L.V = (total - L.s0) / (FLY + 0.4);
      L.end = { x: qx, y: qy, z: qz, tx: (rx - qx) / tl, tz: (rz - qz) / tl, ty: (ry - qy) / tl };
      L.s = L.s0;
      C.free = true; this.pp = null; this.vel = null;
    }
    const S0 = L.start, E = L.end;
    let x, y, z, look;                               // look: the arc length the gaze aims ahead of
    const tr = (L.t - B.w1) / RISE;
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
      const sm = 1;   // no slowing at the end: the leg flies on at its pace into the fade to the next settlement
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
    wantYaw += wrap(yawTo(ldx, ldz) - wantYaw) * 0.6;    // turned well in toward the landmark: it stays in the frame
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
    C.yaw = wrap(L.yaw + this.oy); C.pitch = clamp(L.pitch + this.op, -1.2, 1.2);
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
