// Dynamic resolution (DESIGN §8): on the high preset the picture's pixel ratio is lowered a step
// (1.5 → 1.25 → 1.0, never below 1.0) when the frames stay slow, and raised again when there is
// room for a while. `?dpr=1.25` pins the ratio (on any preset) and turns this off.
//
// Slow: the frame interval, smoothed over ~20 frames drawn at the full rate (the frames of a view
// held still, drawn at 24 fps on purpose, are not counted), above SLOW ms for DOWN_HOLD ms, with
// the GPU a good part of it. Room: the GPU's time for a frame (the time from a frame's submission
// until the GPU has done it, sampled every few frames), scaled to the next step's pixel count,
// under ROOM ms for UP_HOLD ms. A change re-makes the passes' targets (a stall of up to a second
// on a slow machine): changes are kept apart by GAP ms at least, and a step up followed soon by a
// step down doubles the wait before the next step up (to at most four minutes).

const STEPS = [1.5, 1.25, 1.0];
const SLOW = 20, ROOM = 13, DOWN_HOLD = 2000, UP_HOLD = 6000, GAP = 5000;

export class DynamicResolution {
  /** R: the Renderer; pin: the pixel ratio asked for in the address (a number), or null. */
  constructor(R, pin = null) {
    this.R = R;
    this.pin = Number.isFinite(pin) && pin > 0 ? pin : null;
    if (this.pin) { R.dprPin = this.pin; R.setPixelRatio(this.pin); }
    this.ms = 0; this.gpu = 0; this.n = 0;
    this.slowFor = 0; this.roomFor = 0; this.changed = -1e9; this.upWait = UP_HOLD; this.lastUp = -1e9;
    this.level = 0;
    this.history = [];                     // [time s, ratio] of each change (window.palace.dynres)
  }

  /** The steps for this screen (none above the screen's own ratio). */
  get steps() { return [...new Set(STEPS.map((s) => Math.min(s, globalThis.devicePixelRatio || 1)))]; }

  get active() { return !this.pin && this.R.quality === 'high' && this.steps.length > 1; }

  get ratio() { return this.R.renderer.getPixelRatio(); }

  /**
   * After a drawn frame: now (ms), dt its interval from the frame before (ms), full whether this
   * and the frame before were drawn at the full rate (not the held view's 24 fps).
   */
  update(now, dt, full) {
    if (!this.active) return;
    const steps = this.steps;
    // the level the renderer is at (a quality change may have set the ratio)
    const r = this.ratio;
    let lv = steps.findIndex((s) => Math.abs(s - r) < 0.01);
    if (lv < 0) lv = r > steps[0] ? 0 : steps.length - 1;
    this.level = lv;
    // the GPU's time, every eighth frame
    const device = this.R.renderer.backend?.device;
    if (device && !this.waiting && (this.n++ & 7) === 0) {
      this.waiting = true;
      const t0 = performance.now();
      device.queue.onSubmittedWorkDone().then(() => {
        const g = performance.now() - t0;
        this.gpu = this.gpu ? this.gpu + (g - this.gpu) * 0.25 : g;
        this.waiting = false;
      }, () => { this.waiting = false; });
    }
    if (!full || dt > 250) { this.slowFor = 0; this.roomFor = 0; this.lastT = now; return; }
    this.ms = this.ms ? this.ms + (dt - this.ms) * 0.05 : dt;
    const step = Math.min(100, now - (this.lastT ?? now));
    this.lastT = now;
    // (without a measure of the GPU's time, the interval alone decides)
    const gpuBound = !device || this.gpu > this.ms * 0.6;
    this.slowFor = this.ms > SLOW && gpuBound ? this.slowFor + step : 0;
    const up = lv > 0 ? steps[lv - 1] : null;
    const predicted = up && device ? this.gpu * (up / r) ** 2 : Infinity;
    this.roomFor = up && this.ms < SLOW - 2 && predicted < ROOM ? this.roomFor + step : 0;
    if (now - this.changed < GAP) return;
    if (this.slowFor > DOWN_HOLD && lv < steps.length - 1) {
      // down soon after going up: wait twice as long before the next step up
      if (now - this.lastUp < 20000) this.upWait = Math.min(240000, this.upWait * 2);
      this.set(steps[lv + 1], now);
    } else if (this.roomFor > this.upWait && up) {
      this.lastUp = now;
      this.set(up, now);
    }
  }

  set(ratio, now) {
    this.R.setPixelRatio(ratio);
    this.changed = now; this.slowFor = 0; this.roomFor = 0;
    // the smoothed times start again from the new ratio's
    this.ms = 0; this.gpu = 0;
    this.history.push([+(now / 1000).toFixed(1), ratio]);
    if (this.history.length > 40) this.history.shift();
  }
}
