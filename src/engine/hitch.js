// The hitch logger (`?perf`, DESIGN §8): what a frame that came late spent its time on.
//
// The frame's main parts are timed with performance.now() — the scene pass and the shadow
// cascades, the world's per-frame updates (the settlements loaded and let go of, the ground, the
// plants and their rebuilds, the street life and the merged meshes chosen by distance, the sealed
// rooms, the lamps, the baked light), the sound, and what runs between frames: the workers'
// messages (each worker by its script's name), the settlements' meshes made and uploaded as they
// stream in, the merge. The GPU device is watched for new pipelines and shader modules, and three's
// node builds (a material's shader made for a new kind of object) are timed.
//
// Every frame whose interval is over HITCH_MS is kept with its breakdown (the work since the frame
// before: what ran between the two frames is counted too) in a ring of the last RING; the perf
// panel shows the last five and `window.palace.hitches` holds them all, for copying.
//
// Off (no `?perf`), every call here is a test of a flag.

/** A frame longer than this (ms, from the frame before) is a hitch. */
export const HITCH_MS = 50;
const RING = 60;

class HitchLog {
  constructor() {
    this.on = false;
    this.ring = [];
    this.cur = Object.create(null);      // name → ms since the last frame
    this.counts = Object.create(null);   // name → count since the last frame
    this.total = Object.create(null);    // name → count since the start (pipelines, shaders)
  }

  /** Start logging: from here on the workers made are watched (call before the world makes any). */
  enable() {
    if (this.on) return this;
    this.on = true;
    this.watchWorkers();
    // a frame after the page was hidden is late for no fault of its own
    globalThis.addEventListener?.('visibilitychange', () => { this.wasHidden = true; });
    return this;
  }

  /** performance.now() when logging (else 0): the start of a timed piece, closed by since(). */
  mark() { return this.on ? performance.now() : 0; }
  since(name, t0) { if (this.on) this.add(name, performance.now() - t0); }
  add(name, ms) { this.cur[name] = (this.cur[name] || 0) + ms; }
  count(name, n = 1) {
    if (!this.on) return;
    this.counts[name] = (this.counts[name] || 0) + n;
    this.total[name] = (this.total[name] || 0) + n;
  }
  /** fn() timed under name (its value returned). */
  time(name, fn) {
    if (!this.on) return fn();
    const t0 = performance.now();
    try { return fn(); } finally { this.add(name, performance.now() - t0); }
  }

  /**
   * The end of a drawn frame: dt its interval from the frame before (ms), js the frame's own work
   * (ms), info three's counts. A hitch is kept; the counters start again.
   */
  frame(now, dt, js, info = null) {
    if (!this.on) return;
    if (dt > HITCH_MS && !this.wasHidden) {
      const parts = Object.entries(this.cur).filter(([, v]) => v >= 0.5).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +v.toFixed(1)]);
      const h = { at: +(now / 1000).toFixed(2), dt: +dt.toFixed(1), js: +js.toFixed(1), parts: Object.fromEntries(parts), counts: { ...this.counts } };
      if (info) { h.draws = info.render.drawCalls; h.tris = Math.round(info.render.triangles); }
      this.ring.push(h);
      if (this.ring.length > RING) this.ring.shift();
    }
    this.cur = Object.create(null);
    this.counts = Object.create(null);
    this.wasHidden = false;
  }

  /** The hitches as lines for the panel: the last n, newest first. */
  lines(n = 5) {
    return this.ring.slice(-n).reverse().map((h) => {
      const parts = Object.entries(h.parts).slice(0, 5).map(([k, v]) => `${k} ${v}`).join(', ');
      const c = Object.entries(h.counts).map(([k, v]) => `${k}×${v}`).join(' ');
      return `${h.at}s ${h.dt} ms (js ${h.js}): ${parts}${c ? ' · ' + c : ''}`;
    });
  }

  /**
   * The renderer watched: the GPU device's pipelines and shader modules counted (and the time their
   * calls take on the main thread), three's node builds and pipeline look-ups timed.
   */
  watchRenderer(renderer) {
    if (!this.on || renderer._hitchWatched) return;
    renderer._hitchWatched = true;
    const device = renderer.backend?.device;
    if (device) {
      for (const k of ['createRenderPipeline', 'createRenderPipelineAsync', 'createComputePipeline', 'createComputePipelineAsync', 'createShaderModule']) {
        const f = device[k];
        if (typeof f !== 'function') continue;
        const name = k === 'createShaderModule' ? 'shaders' : k.includes('Compute') ? 'compute pipelines' : 'pipelines';
        device[k] = (...a) => {
          const t0 = performance.now();
          try { return f.apply(device, a); } finally { this.count(name); this.add('gpu ' + name, performance.now() - t0); }
        };
      }
    }
    // three's node build: a new material / object kind's shader made (JavaScript, on this thread)
    const wrap = (obj, key, name) => {
      const f = obj?.[key];
      if (typeof f !== 'function') return;
      obj[key] = function (...a) {
        const t0 = performance.now();
        try { return f.apply(this, a); } finally { const d = performance.now() - t0; if (d > 0.2) { HITCH.add(name, d); HITCH.count(name); } }
      };
    };
    wrap(renderer._nodes, 'getForRender', 'node builds');
    wrap(renderer._pipelines, 'getForRender', 'pipeline setup');
  }

  /** Every worker made from now on: its messages' handling timed, under its script's name. */
  watchWorkers() {
    const W = globalThis.Worker;
    if (!W || W._hitch) return;
    const log = this, wrapped = new WeakMap();
    const timed = (name, fn) => function (e) {
      const t0 = performance.now();
      try { return fn.call(this, e); } finally { log.add(name, performance.now() - t0); }
    };
    class TimedWorker extends W {
      constructor(url, opts) {
        super(url, opts);
        this._hitchName = 'worker ' + String(url).split('/').pop().replace(/[?#].*$/, '').replace(/\.m?js$/, '');
      }
      get onmessage() { return this._hitchOn ?? null; }
      set onmessage(fn) { this._hitchOn = fn; super.onmessage = typeof fn === 'function' ? timed(this._hitchName, fn) : fn; }
      addEventListener(type, fn, o) {
        if (type === 'message' && typeof fn === 'function') { let w = wrapped.get(fn); if (!w) wrapped.set(fn, (w = timed(this._hitchName, fn))); fn = w; }
        return super.addEventListener(type, fn, o);
      }
      removeEventListener(type, fn, o) { return super.removeEventListener(type, (type === 'message' && wrapped.get(fn)) || fn, o); }
    }
    TimedWorker._hitch = true;
    globalThis.Worker = TimedWorker;
  }
}

/** The one log (src/main.js turns it on with `?perf`). */
export const HITCH = new HitchLog();
