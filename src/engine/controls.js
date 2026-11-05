// First-person walking and flying: keyboard and mouse (pointer lock) on desktop, a thumb stick,
// drag-to-look and a fly button on touch screens. Collision against the world's floors and
// obstacles; steps, stairs and ramps are climbed by following the floor height. Holding Space (or
// the fly button) rises, let go one falls, both at a top speed set by the height above the ground,
// reached smoothly in a second or so, slow near the ground. Cruising (Space twice quickly; on touch, slide from the
// fly button onto the cruise button that shows beside it) holds one aloft while the speed
// dies away; flying again ends it.

import { EYE, STEP, WALK, RUN, flightSpeeds, move } from '../core/walk.js';

const DOUBLE_TAP = 0.32;   // s
// Braking aloft without keys, dv/dt = -(c + k v): from v0 it stops in ln(1 + k v0 / c) / k seconds;
// c is chosen so that the top speed (300 m/s) stops in T.
const brake = (k, T) => ({ k, c: 300 * k / (Math.exp(k * T) - 1) });
const BRAKE_FLY = brake(1.2, 3), BRAKE_CRUISE = brake(0.6, 5);

export class Controls {
  constructor(camera, canvas, collide) {
    this.camera = camera;
    this.canvas = canvas;
    this.collide = collide;
    this.feet = { x: 0, y: 0, z: 0 };
    this.vy = 0;
    this.yaw = 0; this.pitch = 0;
    this.keys = new Set();
    this.stick = { x: 0, y: 0 };
    this.sensitivity = 1;
    this.enabled = false;
    this.locked = false;
    this.touch = matchMedia('(pointer: coarse)').matches;
    this.flyHeld = false;           // Space or the fly button held
    this.glide = false;             // came up by flying: comes down gently
    this.cruise = false;            // aloft, the speed dying away, nothing pulling down
    this.vel = { x: 0, z: 0 };      // horizontal velocity aloft (m/s): flight has momentum
    this.speedNow = 0;              // horizontal speed (m/s), smoothed, for the display
    this._bind();
  }

  setPose(x, y, z, yaw = 0, pitch = 0) {
    this.free = false;
    this.feet = { x, y, z };
    this.feet.y = this.collide.groundAt(x, z, y + STEP);
    if (!Number.isFinite(this.feet.y)) this.feet.y = y;
    this.yaw = yaw; this.pitch = pitch; this.vy = 0; this.glide = false; this.setCruise(false); this.vel = { x: 0, z: 0 };
    this.apply();
  }

  apply() {
    const c = this.camera;
    c.position.set(this.feet.x, this.feet.y + EYE, this.feet.z);
    c.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  _bind() {
    const cv = this.canvas;
    addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, select')) return;
      this.keys.add(e.code);
      if (!this.enabled) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        const now = performance.now() / 1000, twice = now - (this._spaceAt ?? -9) < DOUBLE_TAP;
        this._spaceAt = twice ? -9 : now;
        if (twice && this.glide) { this.setCruise(true); this._spaceCruise = true; }   // this press does not lift
        else this.setCruise(false);
      }
    });
    addEventListener('keyup', (e) => { this.keys.delete(e.code); if (e.code === 'Space') this._spaceCruise = false; });
    addEventListener('blur', () => { this.keys.clear(); this.flyHeld = false; });
    // the fly button: held to rise; while it is held the cruise button shows beside it, and letting
    // go on it cruises
    const fly = document.getElementById('btn-fly'), cb = document.getElementById('btn-cruise');
    if (fly) {
      let over = false;
      const onCruise = (e) => { if (!cb || cb.hidden) return false; const r = cb.getBoundingClientRect(), m = 14;
        return e.clientX > r.left - m && e.clientX < r.right + m && e.clientY > r.top - m && e.clientY < r.bottom + m; };
      fly.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); fly.setPointerCapture(e.pointerId);
        this.setCruise(false); this.flyHeld = true; fly.classList.add('on');
        if (cb) cb.hidden = false;
      });
      fly.addEventListener('pointermove', (e) => {
        if (!this.flyHeld) return;
        over = onCruise(e); cb?.classList.toggle('on', over);
      });
      const off = (e) => {
        const cruise = e.type === 'pointerup' && onCruise(e);
        this.flyHeld = false; over = false; fly.classList.remove('on');
        if (cb) { cb.hidden = true; cb.classList.remove('on'); }
        if (cruise) this.setCruise(true);
      };
      fly.addEventListener('pointerup', off);
      fly.addEventListener('pointercancel', off);
    }
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === cv;
      this.onLockChange?.(this.locked);
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked || !this.enabled) return;
      this.look(e.movementX, e.movementY, 0.0022);
    });
    // touch: drag anywhere outside the stick to look
    let lookId = null, lx = 0, ly = 0;
    cv.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      lookId = e.pointerId; lx = e.clientX; ly = e.clientY;
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      if (e.pointerId !== lookId || !this.enabled) return;
      this.look(e.clientX - lx, e.clientY - ly, 0.0042);
      lx = e.clientX; ly = e.clientY;
    });
    const end = (e) => { if (e.pointerId === lookId) lookId = null; };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);

    const stick = document.getElementById('stick'), knob = document.getElementById('stick-knob');
    let sid = null;
    const setStick = (e) => {
      const r = stick.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const l = Math.hypot(dx, dy);
      if (l > 1) { dx /= l; dy /= l; }
      this.stick = { x: dx, y: dy };
      knob.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`;
    };
    stick.addEventListener('pointerdown', (e) => { sid = e.pointerId; stick.setPointerCapture(sid); setStick(e); e.stopPropagation(); });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === sid) setStick(e); });
    const stop = (e) => { if (e.pointerId !== sid) return; sid = null; this.stick = { x: 0, y: 0 }; knob.style.transform = ''; };
    stick.addEventListener('pointerup', stop);
    stick.addEventListener('pointercancel', stop);
  }

  /** Cruise on or off (only aloft). */
  setCruise(on) {
    on = !!on && this.glide;
    if (on === this.cruise) return;
    this.cruise = on;
    document.getElementById('btn-fly')?.classList.toggle('cruise', on);
    this.onCruise?.(on);
  }

  /** Is the visitor off the ground (flying or coming down)? */
  get airborne() { return this.glide || this.vy !== 0; }

  /** How the visitor is moving now: 'still', 'walk', 'run' or 'fly'. */
  get gait() {
    if (this.cruise) return 'cruise';
    if (this.airborne) return 'fly';
    if (this.speedNow < 0.3) return 'still';
    return this.speedNow > (WALK + RUN) / 2 ? 'run' : 'walk';
  }

  look(dx, dy, k) {
    this.yaw -= dx * k * this.sensitivity;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * k * this.sensitivity));
  }

  lock() { if (!this.touch) this.canvas.requestPointerLock?.()?.catch?.(() => {}); }
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); }

  update(dt) {
    if (this.free) return;            // camera placed directly (tools)
    dt = Math.min(dt, 0.1);
    let f = 0, s = 0;
    if (this.enabled) {
      const k = this.keys;
      if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
      if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
      if (k.has('KeyD') || k.has('ArrowRight')) s += 1;
      if (k.has('KeyA') || k.has('ArrowLeft')) s -= 1;
      f -= this.stick.y; s += this.stick.x;
      if (k.has('KeyQ')) this.yaw += 1.6 * dt;
      if (k.has('KeyE')) this.yaw -= 1.6 * dt;
    }
    const l = Math.hypot(f, s);
    if (l > 1) { f /= l; s /= l; }
    const run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || Math.hypot(this.stick.x, this.stick.y) > 0.92;
    const lift = this.enabled && (this.flyHeld || (this.keys.has('Space') && !this._spaceCruise));
    if (lift) { this.glide = true; this.setCruise(false); }
    // aloft, faster the higher (src/core/walk.js)
    const alt = this.glide ? this.feet.y - this.collide.terrain(this.feet.x, this.feet.z) : 0;
    this.altitude = alt;
    const fs = flightSpeeds(alt);
    const speed = this.glide ? (run ? fs.fast : fs.fly) : run ? RUN : WALK;
    this.feet.fs = fs; this.feet.cruise = this.cruise;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    let dx = (-sin * f + cos * s) * speed * dt, dz = (-cos * f - sin * s) * speed * dt;
    if (this.glide) {
      // aloft there is momentum: the velocity eases toward what the keys ask for, and without them
      // slows to a full stop: within 3 s, 5 s when cruising
      const V = this.vel, tx = dx / dt, tz = dz / dt, steer = l > 0.01;
      if (!this._aloft) { V.x = tx; V.z = tz; }        // taking off keeps the pace one had
      if (steer) { const k = 1 - Math.exp(-2.8 * dt); V.x += (tx - V.x) * k; V.z += (tz - V.z) * k; }
      else {
        // slowing by a small fixed part and a part in proportion to the speed: natural, and a
        // full stop from even the top speed within the time given
        const B = this.cruise ? BRAKE_CRUISE : BRAKE_FLY, v = Math.hypot(V.x, V.z);
        const r = v > 1e-3 ? Math.max(0, v - (B.c + B.k * v) * dt) / v : 0;
        V.x *= r; V.z *= r;
      }
      dx = V.x * dt; dz = V.z * dt;
    } else this.vel.x = this.vel.z = 0;
    this._aloft = this.glide;

    const x0 = this.feet.x, z0 = this.feet.z;
    this.feet.vy = this.vy; this.feet.lift = lift; this.feet.glide = this.glide;
    move(this.feet, dx, dz, dt, this.collide);
    this.vy = this.feet.vy;
    // never below the open ground (flying fast into a hillside, a frame of the ground not yet
    // where it should be): unless standing on a floor there, up onto the ground
    {
      const F = this.feet, T = this.collide.terrain(F.x, F.z);
      if (F.y < T - 0.05 && this.collide.groundAt(F.x, F.z, F.y + 0.05) < F.y - 0.05) { F.y = T; this.vy = F.vy = 0; }
    }
    if (this.glide && this.vy === 0 && !lift) {          // landed?
      const C = this.collide, F = this.feet;
      const g = Math.max(C.groundAt(F.x, F.z, F.y + 0.01), C.topAt(F.x, F.z, 0.18, F.y + 0.01));
      if (F.y <= g + 1e-3) { this.glide = false; this.setCruise(false); }
    }
    const v = Math.hypot(this.feet.x - x0, this.feet.z - z0) / Math.max(dt, 1e-3);
    if (this.glide) {                  // blocked aloft (a wall, a tower): the momentum goes with it
      const want = Math.hypot(dx, dz) / Math.max(dt, 1e-3);
      if (want > 0.1 && v < want * 0.5) { const r = v / want; this.vel.x *= r; this.vel.z *= r; }
    }
    this.speedNow += (v - this.speedNow) * Math.min(1, dt * 6);
    this.apply();
  }
}
