// Placed voices of a place's life (the audio engine's Music gets them by installVoices): sounds that have
// a place in the settlement (soundscape.js's `LIFE.map`: for Suzhou, src/settlements/ming-suzhou/soundmap.js)
// and are heard from where they are — a distance (gain, a lowpass), a side (the pan), the walls between
// (the engine's own probes of the walls round), the room one is in — in their hour, season and weather.
//
// Everything is synthesised (noise, oscillators, formant filters, struck partials); no samples. A voice
// is a method `name(t, bus, lv)` making its events from `t` into `bus` (a node from `src()`) and returning
// how long it lasts; the scheduler `placed()` chooses what is due where the listener is. Nothing is looped:
// each event is made when it is due, with its own random pitch and timing.
//
// The listener (`place({ at: { x, z, yaw, y, hour } })` from main.js) is the camera in the settlement's frame;
// without one the way in stands in. [inferred throughout: no recordings of Ming Suzhou exist; the sources of the
// instruments and calls are in docs/settlements/ming-suzhou.md §22.]

import { ENV } from './env.js';
import { OTTOMAN_VOICES } from './voices-ottoman.js';

const R = Math.random;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** The vowels' formants (as audio.js: a male voice), for the wordless cries. */
const VOWEL = { a: [730, 1090, 2440], i: [270, 2290, 3010], u: [300, 870, 2240], o: [570, 840, 2410], e: [530, 1840, 2480] };

// ── the calendar ──────────────────────────────────────────────────────────────
/** The day of the year from the climate's two season numbers (winter: 1 mid-January … −1 mid-July; autumn: 1 mid-October … −1 mid-April). */
export function doyOf(winter, autumn) {
  if (!winter && !autumn) return 125;                              // no climate yet: late spring, as the dossier's chosen moment
  const th = Math.atan2(-autumn, winter);
  return (((15 + th * 365.25 / (2 * Math.PI)) % 365.25) + 365.25) % 365.25;
}
/** 0…1: how much of a season's window (days of the year from a to b, wrapping the year's end) the day is in, with `fade` days of ramp each end. */
export function inSeason(doy, a, b, fade = 14) {
  const len = ((b - a) % 365.25 + 365.25) % 365.25, x = ((doy - a) % 365.25 + 365.25) % 365.25;
  if (x > len) return 0;
  return clamp(Math.min(x, len - x) / fade, 0, 1);
}
/** Windows (day of the year) of the season-bound sounds. */
export const SEASON_OF = {
  cicada: [165, 255, 14], frog: [100, 285, 25], cricket: [215, 320, 14], katydid: [210, 280, 10],
  cuckoo: [95, 170, 8], oriole: [140, 235, 10], magpie: [250, 340, 12], tit: [335, 95, 12],
  flowers: [40, 300, 12], melon: [160, 250, 10], cake: [300, 120, 12],
};
export const seasonOf = (k, doy) => inSeason(doy, SEASON_OF[k][0], SEASON_OF[k][1], SEASON_OF[k][2]);

/** `h` (local hour) within [a, b] (wrapping midnight when a > b). */
export const inHours = (h, [a, b]) => (a <= b ? h >= a && h < b : h >= a || h < b);

// ── the trades' cries: [semitones above the voice's base, seconds, vowel], wordless ──
export const TRADES = {
  flowers: { cry: [[0, 0.26, 'i'], [2, 0.26, 'i'], [4, 0.8, 'a'], [7, 0.3, 'a'], [4, 0.3, 'a'], [2, 1.0, 'a']], fem: true, w: 1.2, hours: [6.5, 11], season: 'flowers' },       // "gardenia, magnolia"
  veg: { cry: [[0, 0.35, 'a'], [2, 0.3, 'a'], [4, 0.3, 'a'], [7, 1.1, 'i']], fem: false, w: 1.0, hours: [6, 10] },                                                              // a stepwise climb
  fish: { cry: [[9, 0.25, 'u'], [7, 0.25, 'u'], [4, 0.3, 'o'], [0, 0.9, 'o']], fem: false, w: 0.8, hours: [6, 10] },                                                              // a fall from high to low
  soup: { cry: [[4, 0.3, 'u'], [7, 0.3, 'a'], [4, 0.3, 'i'], [2, 0.3, 'o'], [0, 1.1, 'a']], fem: null, w: 1.0, hours: [14, 22] },                                                  // the sweet soup
  cake: { cry: [[4, 0.2, 'a'], [7, 0.2, 'i'], [4, 0.2, 'a'], [7, 0.2, 'i'], [2, 0.9, 'a']], fem: true, w: 0.8, hours: [7, 19], season: 'cake' },                                  // bouncing, two notes alternating
  oil: { cry: [[-4, 0.7, 'o'], [0, 0.5, 'o'], [-5, 1.5, 'u']], fem: false, w: 0.7, hours: [8, 16], base: 128 },                                                                   // low and long
  melon: { cry: [[2, 0.3, 'e'], [5, 0.3, 'e'], [9, 0.4, 'i'], [7, 0.8, 'i']], fem: false, w: 0.9, hours: [12, 19], season: 'melon' },
  goods: { cry: [[0, 0.5, 'o'], [5, 1.2, 'e'], [3, 0.5, 'e']], fem: false, w: 0.7, hours: [8, 18] },
  rattle: { inst: 'rattle', w: 0.8, hours: [8, 18] },                                                                                                                              // the pedlar's rattle-drum
  clapper: { inst: 'clapper', w: 1.0, hours: [18, 23] },                                                                                                                           // the bamboo clapper of the night's snack seller
};
/** Which trade is out at this hour and day of the year (weighted choice by rnd 0…1), or null. */
export function pickTrade(hour, doy, rnd = R()) {
  const list = Object.entries(TRADES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? seasonOf(T.season, doy) : 1) : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** How loud each voice is made relative to its own scale (set by measuring the render: tools/sound-render.mjs). */
export const GAIN = { loom: 0.6, hammer: 0.8, qin: 0.4, cicada: 2.2, frog: 1.4, scissors: 2.2, teaBlock: 0.7 };

export const VOICES = {
  // ── the place of a sound ────────────────────────────────────────────────────
  /** The listener: the engine's `at`, else the way in. */
  lis() {
    const P = this.plc, a = P?.at, M = P?.life?.map;
    if (a) return { x: a.x, z: a.z, yaw: a.yaw || 0, y: a.y || 0, hour: a.hour ?? null };
    const h = M?.HOME || [0, 0];
    return { x: h[0], z: h[1], yaw: 0, y: 0, hour: null };
  },

  /** 0…1 the gain of a source at `pos` of half-distance r50, as heard now (for deciding whether to make it at all). */
  gainAt(pos, r50) {
    const l = this.lis();
    return 1 / (1 + Math.hypot(pos[0] - l.x, pos[1] - l.z) / r50);
  },

  /**
   * A bus for a sound at `pos` ([x, z], or a function of seconds since the start giving one: a boat, a walker): gain by the
   * distance (1 / (1 + d/r50)), a lowpass for the air and the walls (darker the farther), a pan from the side it lies on.
   * `inside`: the id of the building the source is in (heard through its walls from outside, whole from the same room).
   * Returns the gain node to connect to; its `.emitter` is kept aimed every tick while it lasts (`until`).
   */
  src(pos, r50, { dur = 20, inside = null, dest = null, gain = 1 } = {}) {
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(), pn = ctx.createStereoPanner();
    lp.type = 'lowpass'; g.connect(lp); lp.connect(pn); pn.connect(dest || this.plc.out);
    const e = { g, lp, pn, pos, r50, inside, gain, from: t, until: t + dur };
    g.emitter = e;
    this.aim(e, t, true);
    (this.emit ||= []).push(e);
    return g;
  },

  aim(e, t, first = false) {
    const P = this.plc, l = this.lis();
    const p = typeof e.pos === 'function' ? e.pos(Math.max(0, t - e.from)) : e.pos;
    const dx = p[0] - l.x, dz = p[1] - l.z, d = Math.hypot(dx, dz);
    const sy = Math.sin(l.yaw), cy = Math.cos(l.yaw);
    const fwd = -dx * sy - dz * cy, rx = dx * cy - dz * sy;
    let g = e.gain / (1 + d / e.r50);
    let cut = Math.max(420, 14000 / (1 + d / (e.r50 * 0.6)));
    cut *= 0.8 + 0.2 * Math.max(0, fwd / Math.max(d, 1));                    // behind the head a little duller
    const room = P.room;
    if (P.indoors) {
      // from inside: what is outdoors comes through the walls and windows; what is in the room is whole
      const same = room && e.inside && e.inside === room.same;
      if (!same) { g *= 0.5 * (room?.hush ?? 0.7); cut = Math.min(cut, 1500) * 0.7; }
    } else {
      if (e.inside) { g *= 0.6; cut *= 0.6; }                                // a workshop heard from the lane
      const w = this.walls;
      if (w && d > 4) {                                                       // a wall across the way (the engine's probes: eight directions, ahead first)
        const idx = (((Math.round(Math.atan2(rx, fwd) / (Math.PI / 4)) % 8) + 8) % 8);
        if (Number.isFinite(w[idx]) && w[idx] < d * 0.8 - 1) { g *= 0.55; cut *= 0.55; }
      }
    }
    const pan = clamp(rx / Math.hypot(rx, fwd, 1.5), -1, 1) * 0.92;
    if (first) { e.g.gain.value = g; e.lp.frequency.value = cut; e.pn.pan.value = pan; }
    else { e.g.gain.setTargetAtTime(g, t, 0.12); e.lp.frequency.setTargetAtTime(cut, t, 0.12); e.pn.pan.setTargetAtTime(pan, t, 0.12); }
  },

  /** Each tick: keep the moving and the long sounds aimed at the listener as it walks; drop what has ended. */
  aimAll(t) {
    const q = this.emit;
    if (!q || !q.length) return;
    for (let i = q.length - 1; i >= 0; i--) {
      const e = q[i];
      if (t > e.until + 0.6) { q[i] = q[q.length - 1]; q.pop(); continue; }
      this.aim(e, t);
    }
  },

  /** A bus moving along a polyline of points at `speed` m/s from the start of the sound. */
  along(pts, speed) {
    const seg = [];
    let L = 0;
    for (let i = 0; i + 1 < pts.length; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); L += l; }
    const f = (s) => {
      let u = clamp(s * speed, 0, L);
      for (let i = 0; i < seg.length; i++) { if (u <= seg[i] || i === seg.length - 1) { const k = seg[i] ? u / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } u -= seg[i]; }
      return pts[0];
    };
    f.len = L; f.dur = L / speed;
    return f;
  },

  // ── small tools of the voices ───────────────────────────────────────────────
  /** Noise through a band, its amplitude chattering at `am` Hz (the rasp of a plane, a saw, a scrape). */
  rasp(when, dur, f, q, level, dest, am = 80, depth = 0.6) {
    const ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), env = ctx.createGain(), mod = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    mod.gain.value = 1 - depth / 2; lfo.frequency.value = am; lg.gain.value = depth / 2; lfo.connect(lg); lg.connect(mod.gain);
    env.gain.setValueAtTime(0.0001, when); env.gain.exponentialRampToValueAtTime(level, when + Math.min(0.06, dur * 0.3)); env.gain.setValueAtTime(level, when + dur * 0.65); env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.connect(bp); bp.connect(mod); mod.connect(env); env.connect(dest);
    s.start(when, R() * 3); s.stop(when + dur + 0.02); lfo.start(when); lfo.stop(when + dur + 0.02);
  },
  /** Several struck partials ringing and dying (a plate, an anvil, a bowl): [[ratio, amp, seconds]…] over f. */
  struck(when, f, level, dest, parts) {
    const ctx = this.ctx;
    for (const [r, a, d] of parts) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * r;
      g.gain.setValueAtTime(level * a, when); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
  },
  /** A step on stone: the thump of the body and the tick of the sole; clog: a wooden shoe's clack; hollow: an arch under it. */
  step(when, level, dest, shoe = 'cloth', hollow = 0) {
    this.tone(when, [[0, 150 * (0.85 + R() * 0.3)], [0.05, 70]], 0.06, level * 0.3, dest, 'sine');
    this.burst(when, 0.03, shoe === 'clog' ? 2300 : 1500, 1, level * (shoe === 'clog' ? 1.6 : 1.1), dest);
    if (shoe === 'clog') this.tone(when, [[0, 820], [0.03, 600]], 0.05, level * 0.5, dest, 'triangle');
    if (hollow) this.tone(when, [[0, 88], [0.2, 70]], 0.26, level * hollow * 0.3, dest, 'sine');
  },

  // ── water ───────────────────────────────────────────────────────────────────
  /** A boat's stern oar (the yuloh) sculled along `track.pts`: a creak and a swirl at every half stroke, the bow's wash, the boatman's call now and then. */
  boat(t, bus, lv, f) {
    const r = R, dur = f.dur, T = 1.7 + r() * 0.5;
    const n = Math.floor(dur / T);
    for (let k = 0; k < n; k++) {
      const w = t + k * T;
      this.cue(w, (x) => { this.creak(x, lv, bus, true); this.burst(x + 0.1, 0.9, 420, 0.7, 0.03 * lv, bus, 0.3); if (r() < 0.5) this.lap(x + 0.05, lv * 0.6, bus); });
      this.cue(w + T / 2, (x) => { this.creak(x, lv * 0.8, bus, false); this.burst(x + 0.1, 0.9, 380, 0.7, 0.025 * lv, bus, 0.3); });
    }
    this.rasp(t, dur, 520, 0.6, 0.012 * lv, bus, 0.7, 0.8);               // the hull's wash, a long breath
    if (r() < 0.45) this.cue(t + dur * (0.35 + 0.3 * r()), (x) => this.cry(x, 150 * (0.92 + r() * 0.16), [[0, 0.35, 'e'], [5, 0.9, 'o'], [2, 0.6, 'o'], [0, 1.0, 'u']], 0.045 * lv, bus, { cutoff: 4000 }));
    return dur;
  },
  /** A fish rising in the pond: the break of the surface, a bubble, rings lapping the stones. */
  fishRise(t, bus, lv) {
    this.burst(t, 0.07, 1700, 0.9, 0.05 * lv, bus);
    this.tone(t + 0.01, [[0, 280], [0.05, 760]], 0.07, 0.025 * lv, bus, 'sine');
    for (let k = 0; k < 3; k++) this.cue(t + 0.35 + k * 0.4, (x) => this.burst(x, 0.12, 700 + k * 150, 1.5, 0.014 * lv * (1 - k * 0.25), bus));
    return 2;
  },
  /** A bucket let down a well and drawn up: the windlass's creak, the knock on the curb, the splash, the water poured. */
  wellBucket(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 3; k++) { this.cue(w, (x) => this.creak(x, lv * 0.7, bus, false)); w += 0.75; }
    this.cue(w + 0.4, (x) => this.knock(x, 330, 0.04 * lv, bus, 0.07));
    this.cue(w + 1.4, (x) => { this.burst(x, 0.18, 800, 0.8, 0.06 * lv, bus); this.tone(x, [[0, 240], [0.1, 90]], 0.14, 0.04 * lv, bus); });
    w += 2.4;
    for (let k = 0; k < 5; k++) { this.cue(w, (x) => this.creak(x, lv * 0.75, bus, true)); w += 0.85; }
    for (let k = 0; k < 5; k++) this.cue(t + 3.8 + k * 0.5 + R() * 0.2, (x) => this.drip(x, lv * 0.8, bus));
    this.cue(w + 0.3, (x) => this.knock(x, 280, 0.05 * lv, bus, 0.08));
    this.cue(w + 1.0, (x) => this.pour(x, bus, lv * 0.7));
    return w + 3.5 - t;
  },
  /** Liquid poured into a bowl or a pail: a rush and a train of bubbles climbing in pitch. */
  pour(t, bus, lv) {
    const n = 5 + Math.floor(R() * 4);
    this.burst(t, 1.2, 1500, 1.6, 0.03 * lv, bus, 0.05);
    for (let k = 0; k < n; k++) this.cue(t + 0.1 + k * (0.13 + R() * 0.08), (x) => this.tone(x, [[0, 240 + k * 28], [0.05, 520 + k * 40]], 0.06, 0.02 * lv, bus, 'sine'));
    return 1.6;
  },

  // ── the town's work ─────────────────────────────────────────────────────────
  /** The weaver's loom: treadle, shuttle thrown, the beater's knock; at about a pick a second, a few dozen picks. */
  loom(t, bus, lv) {
    const n = 12 + Math.floor(R() * 12);
    let w = t;
    for (let k = 0; k < n; k++) {
      const P = 0.92 + R() * 0.2;
      this.cue(w, (x) => { this.tone(x, [[0, 110], [0.07, 70]], 0.08, 0.02 * lv, bus); this.burst(x, 0.04, 700, 1.2, 0.04 * lv, bus); });         // the treadle
      this.cue(w + 0.2, (x) => { this.burst(x, 0.03, 2600, 3, 0.07 * lv, bus); this.burst(x + 0.07, 0.025, 2100, 3, 0.05 * lv, bus); });       // the shuttle thrown and caught
      this.cue(w + 0.41, (x) => { this.knock(x, 520 + R() * 50, 0.09 * lv, bus, 0.07); this.burst(x, 0.04, 1500, 1, 0.06 * lv, bus); });         // the beater
      if (R() < 0.12) this.cue(w + 0.55, (x) => this.knock(x, 540, 0.06 * lv, bus, 0.06));
      w += P;
    }
    return w - t;
  },
  /** A smith's forge: the bellows' breath, the big hammer on the anvil (a ring) and the small hammer's tap between, in rounds. */
  hammer(t, bus, lv) {
    let w = t;
    const rounds = 3 + Math.floor(R() * 3);
    for (let k = 0; k < rounds; k++) {
      this.rasp(w, 1.3, 520, 0.7, 0.03 * lv, bus, 1.4, 0.9);               // the bellows
      w += 1.6;
      const pat = [[0, 1], [0.42, 0.4], [0.84, 1], [1.12, 0.4], [1.54, 1], [1.96, 0.4]];
      for (const [d, a] of pat) this.cue(w + d, (x) => {
        if (a > 0.8) { this.struck(x, 780 * (0.97 + R() * 0.06), 0.06 * lv, bus, [[1, 1, 0.36], [2.7, 0.55, 0.22], [4.6, 0.35, 0.13], [6.9, 0.2, 0.08]]); this.tone(x, [[0, 130], [0.08, 80]], 0.1, 0.05 * lv, bus); this.burst(x, 0.02, 2800, 1, 0.04 * lv, bus); }
        else this.struck(x, 1350, 0.03 * lv, bus, [[1, 1, 0.12], [2.9, 0.5, 0.07]]);
      });
      w += 2.0 + 0.8 + R() * 1.2;
    }
    return w - t;
  },
  /** Beads of the abacus: runs of quick clicks, then the sweep that clears it. */
  abacus(t, bus, lv) {
    let w = t;
    for (let run = 0, n = 2 + Math.floor(R() * 3); run < n; run++) {
      for (let k = 0, m = 3 + Math.floor(R() * 6); k < m; k++) { const x = w; this.cue(x, (y) => this.burst(y, 0.012, 1700 + R() * 1500, 3, 0.05 * lv, bus)); w += 0.06 + R() * 0.04; }
      w += 0.5 + R() * 1.0;
    }
    this.cue(w, (x) => { this.burst(x, 0.14, 2400, 1.2, 0.04 * lv, bus, 0.01); this.knock(x + 0.12, 620, 0.02 * lv, bus, 0.04); });
    return w - t + 0.3;
  },
  /** The wood plane: long rasping strokes with a pause between, the plane set down with a tap. */
  plane(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const d = 0.4 + R() * 0.15;
      this.cue(w, (x) => this.rasp(x, d, 2200 + R() * 500, 1.1, 0.045 * lv, bus, 88, 0.7));
      w += d + 0.35 + R() * 0.3;
    }
    this.cue(w, (x) => this.knock(x, 440, 0.05 * lv, bus, 0.08));
    return w - t + 0.3;
  },
  /** The knife grinder's iron plates shaken for custom, and the grindstone's scrape. */
  grinder(t, bus, lv) {
    let w = t;
    for (let burst = 0; burst < 2; burst++) {
      for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
        const x = w;
        this.cue(x, (y) => { const f = 2600 + R() * 2200; this.struck(y, f, 0.035 * lv, bus, [[1, 1, 0.1 + R() * 0.08], [1.47, 0.6, 0.08], [2.1, 0.3, 0.05]]); });
        w += 0.09 + R() * 0.07;
      }
      w += 0.9 + R();
    }
    this.cue(w, (x) => this.rasp(x, 1.4 + R(), 2100, 0.9, 0.03 * lv, bus, 55, 0.8));
    return w - t + 2.5;
  },
  /** The pedlar's rattle-drum twirled (two pellets on the skin) and the bamboo clapper. */
  rattle(t, bus, lv) {
    const n = 12 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.075, (w) => this.burst(w, 0.035, k % 2 ? 1500 : 1900, 2.5, 0.05 * lv, bus));
    return n * 0.075 + 0.1;
  },
  clapper(t, bus, lv) {
    for (const d of [0, 0.24, 0.95]) this.cue(t + d, (w) => this.knock(w, 780, 0.035 * lv, bus, 0.1));
    return 1.2;
  },
  /** A street vendor's call (his trade's contour) or instrument, with the interval between calls as he walks. */
  vendor(t, bus, lv, f, trade) {
    const T = TRADES[trade], dur = f.dur;
    let w = t;
    const gap = T.inst ? 6 + R() * 4 : 8 + R() * 4;
    for (let k = 0; w < t + dur - 3 && k < 4; k++) {
      const x = w, fem = T.fem === null ? R() < 0.5 : T.fem, f0 = (T.base || (fem ? 300 : 175)) * (0.93 + R() * 0.14);
      this.cue(x, (y) => (T.inst ? this[T.inst](y, bus, lv) : this.cry(y, f0, T.cry, 0.05 * lv, bus, { fem, cutoff: 4200 })));
      w += gap + R() * 3;
    }
    return dur;
  },
  /** A tea house: the murmur of a dozen voices at the tables (three bands of noise swelling at the rate of speech, drifting in colour), cups set down. */
  teaTalk(t, bus, lv) {
    const ctx = this.ctx, dur = 5 + R() * 5;
    const env = ctx.createGain(), stops = [];
    env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(1, t + 1.3); env.gain.setValueAtTime(1, t + dur - 1.5); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(bus);
    for (const [f, q, rate, a] of [[300, 1.8, 3.0, 1], [620, 1.6, 4.2, 0.8], [1250, 1.9, 5.6, 0.4]]) {
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); bp.frequency.linearRampToValueAtTime(f * (0.8 + R() * 0.5), t + dur); bp.Q.value = q;
      am.gain.value = 0.5 * a * 0.07 * lv; lfo.frequency.value = rate * (0.85 + R() * 0.3); lg.gain.value = 0.45 * a * 0.07 * lv;
      lfo.connect(lg); lg.connect(am.gain); s.connect(bp); bp.connect(am); am.connect(env);
      s.start(t, R() * 3); s.stop(t + dur + 0.05); lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.8 + R() * (dur - 1.5), (x) => this.clink(x, 0.012 * lv, bus));
    return dur;
  },
  teaClink(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => this.clink(x, 0.012 * lv, bus)); w += 0.12 + R() * 0.4; }
    if (R() < 0.4) for (let k = 0; k < 5; k++) this.cue(w + k * 0.045, (x) => this.clink(x, 0.005 * lv, bus));      // the lid
    if (R() < 0.5) this.cue(w + 0.5, (x) => this.pour(x, bus, lv * 0.5));
    return w - t + 1.5;
  },
  /** The storyteller's block (xingmu) slapped on the table. */
  teaBlock(t, bus, lv) {
    this.knock(t, 380, 0.07 * lv, bus, 0.07); this.burst(t, 0.05, 1600, 0.8, 0.05 * lv, bus);
    return 0.4;
  },
  scissors(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.burst(x, 0.035, 3600, 2.5, 0.03 * lv, bus); this.burst(x + 0.04, 0.03, 4400, 3, 0.02 * lv, bus); }); w += 0.28 + R() * 0.2; }
    return w - t + 0.3;
  },
  mortar(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) {
      this.cue(t + k * 0.5 + R() * 0.04, (x) => { this.struck(x, 1500 * (0.94 + R() * 0.12), 0.03 * lv * (0.7 + R() * 0.3), bus, [[1, 1, 0.22], [2.4, 0.4, 0.1]]); });
      this.cue(t + k * 0.5 + 0.2, (x) => this.rasp(x, 0.2, 900, 1, 0.012 * lv, bus, 40, 0.5));
    }
    return n * 0.5 + 0.3;
  },
  chisel(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.knock(x, 1100 + R() * 200, 0.035 * lv, bus, 0.04); this.burst(x, 0.015, 3000, 2, 0.02 * lv, bus); }); w += R() < 0.3 ? 0.5 + R() * 0.8 : 0.16 + R() * 0.1; }
    return w - t + 0.3;
  },
  pourWine(t, bus, lv) { const d = this.pour(t, bus, lv); this.cue(t + d, (x) => this.clink(x, 0.012 * lv, bus)); return d + 0.5; },
  kitchen(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => { this.knock(x, 250, 0.04 * lv, bus, 0.06); this.burst(x, 0.02, 1200, 1.2, 0.025 * lv, bus); }); w += 0.15 + R() * 0.05; }
    this.cue(w + 0.5, (x) => { this.rasp(x, 1.8, 5200, 0.7, 0.02 * lv, bus, 30, 0.3); this.struck(x, 1100, 0.025 * lv, bus, [[1, 1, 0.3], [2.3, 0.4, 0.15]]); });
    return w - t + 2.6;
  },
  wheel(t, bus, lv) {
    this.tone(t, [[0, 66], [2.5, 62], [5, 50]], 5, 0.02 * lv, bus, 'sawtooth', ['lowpass', 220, 1]);
    this.rasp(t, 5, 380, 1, 0.012 * lv, bus, 3, 0.5);                       // the whirr of the wet clay turning
    for (const d of [0.8, 2.6]) this.cue(t + d, (x) => this.burst(x, 0.3, 900, 0.8, 0.02 * lv, bus, 0.05));
    return 5;
  },
  splitBamboo(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.burst(x, 0.04, 1800, 1.2, 0.06 * lv, bus); this.tone(x, [[0, 900], [0.16, 320]], 0.18, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1400, 2]); }); w += 0.9 + R() * 0.8; }
    return w - t + 0.5;
  },
  // quiet small things of the rooms
  paper(t, bus, lv) { this.rasp(t, 0.5 + R() * 0.4, 3600, 0.7, 0.012 * lv, bus, 23, 0.9); return 1; },
  brush(t, bus, lv) { for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * 0.5, (x) => this.rasp(x, 0.4, 2800, 0.8, 0.008 * lv, bus, 35, 0.9)); return 2; },
  clothRustle(t, bus, lv) { this.rasp(t, 0.7, 1800, 0.6, 0.014 * lv, bus, 18, 0.9); return 1; },
  broom(t, bus, lv) { for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * 0.7, (x) => this.rasp(x, 0.55, 2000, 0.6, 0.02 * lv, bus, 120, 0.8)); return 4; },
  sack(t, bus, lv) { this.rasp(t, 0.6, 700, 0.8, 0.03 * lv, bus, 14, 0.9); this.knock(t + 0.5, 150, 0.04 * lv, bus, 0.08); return 1; },
  drawer(t, bus, lv) { this.rasp(t, 0.35, 900, 0.9, 0.025 * lv, bus, 50, 0.6); this.knock(t + 0.35, 300, 0.03 * lv, bus, 0.05); return 0.8; },
  coin(t, bus, lv) { for (let k = 0; k < 3; k++) this.cue(t + k * 0.09, (x) => this.struck(x, 3300 + R() * 600, 0.02 * lv, bus, [[1, 1, 0.2], [1.6, 0.4, 0.1]])); return 0.8; },
  bowlClack(t, bus, lv) { this.knock(t, 900, 0.03 * lv, bus, 0.05); this.clink(t + 0.12, 0.01 * lv, bus); return 0.5; },
  jarLid(t, bus, lv) { this.knock(t, 240, 0.04 * lv, bus, 0.1); this.rasp(t + 0.1, 0.3, 1200, 0.9, 0.01 * lv, bus, 30, 0.5); return 0.8; },
  brushLacquer(t, bus, lv) { this.rasp(t, 0.8, 2500, 0.8, 0.007 * lv, bus, 30, 0.7); return 1; },
  clay(t, bus, lv) { this.burst(t, 0.18, 700, 0.9, 0.025 * lv, bus, 0.03); return 0.4; },
  woodfish(t, bus, lv) { for (let k = 0; k < 6; k++) this.cue(t + k * 0.8, (x) => this.knock(x, 700, 0.03 * lv, bus, 0.11)); return 5; },
  teaTalkQuiet(t, bus, lv) { return this.teaTalk(t, bus, lv * 0.8); },

  // ── people passing ──────────────────────────────────────────────────────────
  /** A walker or two crossing a stone bridge (the arch hollow under the step); a pole bearer's creak with every second step. */
  crossing(t, bus, lv, f) {
    const r = R, dur = f.dur, pace = 0.5 + r() * 0.1, shoe = r() < 0.4 ? 'clog' : 'cloth', pole = r() < 0.3;
    const n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace * (1 + (r() - 0.5) * 0.08), (x) => {
      this.step(x, 0.05 * lv, bus, shoe, 0.7);
      if (pole && k % 2) this.tone(x + 0.04, [[0, 520], [0.13, 660]], 0.15, 0.015 * lv, bus, 'sawtooth', ['bandpass', 900, 3]);
    });
    return dur;
  },
  /** Sedan chair bearers: two pair of steps, the poles' creak, and the front bearer's call answered by the rear. */
  sedan(t, bus, lv, f) {
    const r = R, dur = f.dur, pace = 0.6;
    const n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => {
      this.step(x, 0.045 * lv, bus, 'cloth', 0.15); this.step(x + 0.1, 0.04 * lv, bus, 'cloth', 0);
      this.tone(x + 0.03, [[0, 480 + (k % 2) * 60], [0.2, 600 + (k % 2) * 80]], 0.22, 0.02 * lv, bus, 'sawtooth', ['bandpass', 850, 3]);
    });
    for (let k = 0; k < 3 && 1 + k * 5.2 < dur - 2; k++) {
      this.cue(t + 1 + k * 5.2, (x) => this.cry(x, 150 * (0.95 + r() * 0.1), [[0, 0.3, 'e'], [5, 0.55, 'o']], 0.05 * lv, bus, { cutoff: 3600 }));
      this.cue(t + 2 + k * 5.2, (x) => this.cry(x, 128 * (0.95 + r() * 0.1), [[0, 0.25, 'o'], [-3, 0.6, 'u']], 0.045 * lv, bus, { cutoff: 3200 }));
    }
    return dur;
  },
  /** The watchman's rounds along a street: clapper beats at a walker's pace (one, then two quick), the call now and then. */
  watchman(t, bus, lv, f) {
    const dur = f.dur;
    let w = t;
    for (let rep = 0; w < t + dur - 3; rep++) {
      for (const d of [0, 1.1, 1.4]) this.cue(w + d, (x) => this.knock(x, d ? 960 : 820, 0.04 * lv, bus));
      w += 3.4;
    }
    if (R() < 0.5) this.cue(w - 2.5, (x) => this.cry(x, 125 * (0.94 + R() * 0.12), [[0, 0.35, 'a'], [2, 0.3, 'i'], [0, 0.35, 'o'], [-3, 1.0, 'u']], 0.045 * lv, bus, { cutoff: 4000 }));
    return dur;
  },

  // ── the garden: the qin and the xiao ────────────────────────────────────────
  /**
   * One note of a qin (guqin): a silk string plucked — the partials of a string (the upper ones dying sooner), the soft
   * click of the finger and the string's tap on the board; `from` a slide into the note from so many semitones below (a
   * left-hand slide, with the whisper of the finger on silk), `vib` the slow vibrato of the hand (yin), `harm` a harmonic
   * (fanyin: a bell-like pure tone, the finger just touching the string).
   */
  qinNote(when, f, level, dest, { from = 0, vib = false, harm = false, long = 1 } = {}) {
    const ctx = this.ctx, out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = harm ? 5200 : Math.min(3400, f * 10); out.connect(lp); lp.connect(dest);
    const nP = harm ? 2 : 6;
    let lfo = null, lg = null;
    if (vib && !harm) { lfo = ctx.createOscillator(); lfo.frequency.value = 4.6 + R() * 1.2; lg = ctx.createGain(); lg.gain.setValueAtTime(0, when); lg.gain.linearRampToValueAtTime(0.014, when + 0.9); lfo.connect(lg); lfo.start(when); lfo.stop(when + 5 * long); }
    for (let n = 1; n <= nP; n++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const a = harm ? (n === 1 ? 1 : 0.12) : Math.pow(n, -1.35) * (0.8 + R() * 0.4), D = (harm ? 2.6 : 4.4) * long / (1 + 0.6 * (n - 1));
      const fn = f * n * (1 + 0.0003 * n * n);
      if (from) { o.frequency.setValueAtTime(fn * Math.pow(2, from / 12), when); o.frequency.exponentialRampToValueAtTime(fn, when + 0.22); }
      else o.frequency.value = fn;
      if (lg) { const vg = ctx.createGain(); vg.gain.value = fn; lg.connect(vg); vg.connect(o.frequency); }
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + (harm ? 0.004 : 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, when + D);
      o.connect(g); g.connect(out); o.start(when); o.stop(when + D + 0.05);
    }
    this.burst(when, 0.03, 650, 1.2, level * 0.45, dest);                                           // the finger's nail on silk
    if (!harm) this.tone(when, [[0, 96], [0.07, 68]], 0.08, level * 0.35, dest, 'sine');            // the string's tap on the board
    if (from || vib) this.burst(when + 0.03, from ? 0.25 : 0.7, 2600, 2, level * 0.1, dest, 0.06);   // the finger sliding on silk
    return 4 * long;
  },
  /** A short sparse phrase in the gong mode (do re mi sol la on C): an open string, stopped notes with slides, the harmonics to close. */
  qin(t, bus, lv) {
    const SC = [0, 2, 4, 7, 9], C = 130.81;               // C3
    const note = (deg) => C * Math.pow(2, (Math.floor(deg / 5) * 12 + SC[((deg % 5) + 5) % 5]) / 12);
    let w = t, deg = [5, 7, 10][Math.floor(R() * 3)];       // start on a low note of the second octave
    const n = 6 + Math.floor(R() * 5);
    this.qinNote(w, note(deg - 5), 0.06 * lv, bus, { long: 1.3 });                                // an open string
    w += 2.0 + R() * 1.2;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + [-2, -1, -1, 0, 1, 1, 2, 3][Math.floor(R() * 8)], 3, 13);
      const slide = R() < 0.45 ? (R() < 0.5 ? -2 : -3) : 0, vib = R() < 0.35;
      this.qinNote(w, note(deg), 0.05 * lv, bus, { from: slide, vib, long: 1 + R() * 0.4 });
      w += (R() < 0.3 ? 0.55 : 1.3) + R() * 1.6;
    }
    // the close: three harmonics, a fifth and an octave over the open string, then silence
    const base = note(0);
    for (const [k, m] of [[0, 4], [0.5, 3], [1.1, 2]]) this.qinNote(w + k, base * m * (k === 0.5 ? 1.5 : 1), 0.055 * lv, bus, { harm: true, long: 1.4 });
    return w - t + 5;
  },
  /** One note of the xiao: a breathy tone with a soft attack, a slide up into it, a slow vibrato that comes late, a breath. */
  xiaoNote(when, f, dur, level, dest, from = -1.5) {
    const ctx = this.ctx, g = ctx.createGain(), sr = ctx.sampleRate;
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + 0.22); g.gain.setValueAtTime(level * 0.9, when + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), og = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; og.gain.value = 0.3;
    o.frequency.setValueAtTime(f * Math.pow(2, from / 12), when); o.frequency.exponentialRampToValueAtTime(f, when + 0.2);
    o2.frequency.setValueAtTime(f * 2 * Math.pow(2, from / 12), when); o2.frequency.exponentialRampToValueAtTime(f * 2, when + 0.2);
    vib.frequency.value = 4.5 + R() * 0.8; vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(f * 0.009, when + dur * 0.6); vib.connect(vg); vg.connect(o.frequency);
    o.connect(g); o2.connect(og); og.connect(g);
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f * 2.1; bp.Q.value = 3; ng.gain.value = 0.45;
    n.connect(bp); bp.connect(ng); ng.connect(g); g.connect(dest);
    o.start(when); o.stop(when + dur + 0.05); o2.start(when); o2.stop(when + dur + 0.05); vib.start(when); vib.stop(when + dur + 0.05); n.start(when, R() * 3); n.stop(when + dur + 0.05);
    return dur;
  },
  /** A slow phrase on the xiao in the gong mode on G, rising and falling to the tonic. */
  xiao(t, bus, lv) {
    const SC = [0, 2, 4, 7, 9], G = 196;
    const note = (deg) => G * Math.pow(2, (Math.floor(deg / 5) * 12 + SC[((deg % 5) + 5) % 5]) / 12);
    const contour = [3, 4, 5, 4, 3, 2, 1, 0];
    let w = t;
    const n = 5 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const deg = contour[Math.min(contour.length - 1, Math.floor(k * contour.length / n))] + (R() < 0.2 ? 1 : 0), last = k === n - 1;
      const d = last ? 4 + R() * 1.5 : 1.4 + R() * 2.2;
      this.xiaoNote(w, note(deg), d, 0.05 * lv, bus, k ? -1 - R() * 1.5 : -3);
      w += d + 0.15 + R() * 0.5;
    }
    return w - t + 0.5;
  },

  // ── the creatures: cicadas, frogs, crickets, the seasonal bird, dogs far off ─
  /** One cicada's song: noise at 4-7 kHz chopped at the tymbals' rate, rising and falling over a few seconds. */
  cicada(t, bus, lv) {
    const ctx = this.ctx, dur = 2 + R() * 4, f = 4200 + R() * 2400;
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), am = ctx.createGain(), pulse = ctx.createOscillator(), pg = ctx.createGain(), env = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 4;
    am.gain.value = 0.5; pulse.type = 'square'; pulse.frequency.setValueAtTime(60 + R() * 20, t); pulse.frequency.linearRampToValueAtTime(95 + R() * 20, t + dur * 0.6); pg.gain.value = 0.5; pulse.connect(pg); pg.connect(am.gain);
    env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(0.035 * lv, t + dur * 0.4); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(am); am.connect(env); env.connect(bus);
    s.start(t, R() * 3); s.stop(t + dur + 0.05); pulse.start(t); pulse.stop(t + dur + 0.05);
    return dur;
  },
  /** A frog: the pond frog's train of croaks (gua gua gua), or the tree frog's quick high rattle. */
  frog(t, bus, lv, kind = 'pond') {
    if (kind === 'tree') {
      const n = 6 + Math.floor(R() * 8), f = 2300 + R() * 700;
      for (let k = 0; k < n; k++) this.cue(t + k * 0.07, (x) => this.tone(x, [[0, f], [0.025, f * 0.9]], 0.03, 0.02 * lv, bus, 'square', ['bandpass', f, 5]));
      return n * 0.07 + 0.1;
    }
    const f = 300 + R() * 160, n = 3 + Math.floor(R() * 5);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.13, (x) => this.tone(x, [[0, f * 1.1], [0.08, f * 0.82]], 0.09, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.4, 3]));
    return n * 0.13 + 0.2;
  },
  /** A cricket's chirp (three notes, ji-ji-ji, repeated) or a katydid's buzz (zhi-zhi-zhi). */
  cricket(t, bus, lv, kind = 'cricket') {
    const ctx = this.ctx;
    if (kind === 'katydid') {
      const n = 8 + Math.floor(R() * 8), f = 3300 + R() * 500;
      for (let k = 0; k < n; k++) this.cue(t + k * 0.1, (x) => this.tone(x, [[0, f], [0.05, f * 1.05]], 0.06, 0.012 * lv, bus, 'sawtooth', ['bandpass', f, 4]));
      return n * 0.1 + 0.1;
    }
    const f = 4200 + R() * 700, reps = 2 + Math.floor(R() * 4);
    let w = t;
    for (let rep = 0; rep < reps; rep++) {
      for (let k = 0; k < 3; k++) {
        const o = ctx.createOscillator(), g = ctx.createGain(), x = w + k * 0.065;
        o.frequency.value = f; g.gain.setValueAtTime(0, x); g.gain.linearRampToValueAtTime(0.012 * lv, x + 0.006); g.gain.linearRampToValueAtTime(0, x + 0.038);
        o.connect(g); g.connect(bus); o.start(x); o.stop(x + 0.05);
      }
      w += 0.5 + R() * 0.15;
    }
    return w - t + 0.1;
  },
  /** The bird of the season: cuckoo (spring: two falling notes, bu-gu, repeated), oriole (summer: a liquid whistled phrase), magpie (autumn: a harsh rattle), great tit (winter: ti-chuu ti-chuu). */
  seasonBird(t, bus, lv, kind) {
    if (kind === 'cuckoo') {
      const n = 5 + Math.floor(R() * 5), f = 820 + R() * 80;
      let w = t;
      for (let k = 0; k < n; k++) {
        const x = w;
        this.cue(x, (y) => { for (const [d, ff] of [[0, f], [0.27, f * 0.79]]) { this.tone(y + d, [[0, ff * 1.03], [0.2, ff]], 0.24, 0.025 * lv, bus, 'sine'); this.tone(y + d, [[0, ff * 2.05], [0.2, ff * 2]], 0.2, 0.004 * lv, bus, 'sine'); } });
        w += 1.15 - k * 0.02;
      }
      return w - t;
    }
    if (kind === 'oriole') {
      const f = 1050 + R() * 120;
      let w = t;
      for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
        const x = w;
        this.cue(x, (y) => {
          this.tone(y, [[0, f], [0.12, f * 1.75], [0.32, f * 1.4]], 0.36, 0.02 * lv, bus, 'sine');
          this.tone(y + 0.4, [[0, f * 1.3], [0.2, f * 2.2]], 0.3, 0.02 * lv, bus, 'sine');
          this.tone(y + 0.75, [[0, f * 1.9], [0.4, f * 1.15]], 0.46, 0.02 * lv, bus, 'sine');
        });
        w += 2 + R();
      }
      return w - t;
    }
    if (kind === 'magpie') {
      const n = 6 + Math.floor(R() * 4), f = 1500 + R() * 200;
      for (let k = 0; k < n; k++) this.cue(t + k * 0.11, (x) => this.tone(x, [[0, f * (1 - k * 0.012)], [0.05, f * 0.85]], 0.07, 0.04 * lv, bus, 'sawtooth', ['bandpass', 1500, 2]));
      return n * 0.11 + 0.1;
    }
    // great tit
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.tone(y, [[0, 4300], [0.05, 3900]], 0.07, 0.018 * lv, bus, 'sine'); this.tone(y + 0.1, [[0, 3300], [0.1, 3100]], 0.12, 0.018 * lv, bus, 'sine'); });
      w += 0.5;
    }
    return w - t + 0.2;
  },
  /** Dogs far off at night: a volley of barks and another dog answering. */
  dogFar(t, bus, lv) {
    const f = 300 + R() * 200, f2 = f * (1.2 + R() * 0.3);
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) { const x = w; this.cue(x, (y) => { this.tone(y, [[0, f], [0.04, f * 1.2], [0.15, f * 0.8]], 0.16, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 1.2]); this.burst(y, 0.1, 1100, 1, 0.012 * lv, bus); }); w += 0.45 + R() * 0.3; }
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { const x = w + 1.2; this.cue(x + k * 0.5, (y) => this.tone(y, [[0, f2], [0.05, f2 * 1.15], [0.17, f2 * 0.75]], 0.18, 0.025 * lv, bus, 'sawtooth', ['bandpass', 750, 1.2])); }
    return w - t + 4;
  },
  /** A culm of bamboo knocking against another and creaking in a gust. */
  culm(t, bus, lv) {
    this.knock(t, 420, 0.05 * lv, bus, 0.09);
    this.cue(t + 0.18 + R() * 0.2, (x) => this.knock(x, 380, 0.035 * lv, bus, 0.08));
    this.cue(t + 0.5, (x) => this.tone(x, [[0, 700], [0.35, 560]], 0.4, 0.012 * lv, bus, 'sawtooth', ['bandpass', 800, 5]));
    return 1.3;
  },

  // ── the scheduler: what is due where the listener stands ────────────────────
  /**
   * Called every tick for a place with a `map` (Suzhou): decide what is made now, by hour, season, weather and the
   * listener's place. Each source has its own next time, drawn at random between its gaps, so that nothing repeats evenly.
   */
  placed(L, t) {
    if (L.map.schedule) return this[L.map.schedule](L, t);     // a map with its own scheduler (Istanbul: voices-ottoman.js)
    const P = this.plc, M = L.map, l = this.lis(), r = R;
    const hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1), doy = this.seasonDoy(), rain = P.rain || 0;
    P.hourNow = hour;
    const dt = P.lastPlaced ? Math.min(2, t - P.lastPlaced) : 0;
    P.lastPlaced = t;
    P.eaveWet = Math.max(rain, (P.eaveWet || 0) * Math.exp(-dt / 70));       // the eaves drip on after the rain, a minute or two
    const day = hour >= 5.5 && hour < 18.5, night = hour >= 19.5 || hour < 4.5, dusk = hour >= 17 && hour < 20;
    const recent = (this.recentEv ||= []);
    while (recent.length && recent[0] < t - 2.5) recent.shift();
    const busy = () => recent.length >= 5;
    const stamp = () => recent.push(t);
    const due = (k, gap, first = 0.15) => { if (!P[k]) P[k] = t + gap * (first + 0.6 * r()); return t > P[k]; };
    const at = (k, a, b, mul = 1) => { P[k] = t + (a + (b - a) * r()) * mul; };
    const spawn = (pos, r50, lv, voice, opt = {}) => { const bus = this.src(pos, r50, { dur: 30, ...opt }); const d = this[voice](t + 0.05, bus, lv * (GAIN[voice] ?? 1), ...(opt.args || [])); bus.emitter.until = t + 0.05 + (typeof d === 'number' ? d : 8) + 1.5; stamp(); return bus; };
    const around = (a, b) => { const an = r() * Math.PI * 2, d = a + (b - a) * r(); return [l.x + Math.cos(an) * d, l.z + Math.sin(an) * d]; };
    const wind = this.wind || 0;
    const room = P.room;

    // the fixed emitters: the trades' work, the qin, the flutes, the wells, the carpenter's yard
    if (!P.stat) {
      P.stat = M.EMITTERS.map((e, i) => ({ ...e, id: 'e' + i }));
      for (const s of M.sites()) for (const [voice, gap, hours] of s.work) P.stat.push({ voice, at: s.at, r50: 7, gap, hours, inside: s.id, id: s.id + voice });
      M.WELLS.forEach((w, i) => P.stat.push({ voice: 'wellBucket', at: w, r50: 8, gap: [45, 110], hours: [6, 19], dry: true, id: 'well' + i }));
    }
    for (const e of P.stat) {
      if (!inHours(hour, e.hours) || rain > (e.rainMax ?? (e.dry ? 0.2 : 0.95))) continue;
      if (this.gainAt(e.at, e.r50) < 0.15) continue;
      const k = 'n:' + e.id;
      if (!due(k, e.gap[1])) continue;
      if (busy()) { P[k] = t + 2; continue; }
      const same = room && e.inside && e.inside === room.same;
      at(k, e.gap[0], e.gap[1], same ? 0.6 : 1);
      const bus = spawn(e.at, e.r50, e.lv ?? 1, e.voice, { inside: e.inside });
      if (e.after) P[k] += bus.emitter.until - t;              // the long ones (a qin phrase, a flute's) are spaced from their end
    }

    // the far hours' sounds: dogs at night, beyond the roofs
    if (night && rain < 0.7 && due('p:nextDog', 70)) { at('p:nextDog', 35, 95); if (!busy()) spawn(around(110, 380), 70, 1, 'dogFar'); }

    // the passing: boats on the canals, walkers on the bridges, vendors and sedan chairs and the watchman in the streets
    const track = (k, voice, speed, r50, gap, ok, get, lv = 1, extra = null) => {
      if (!ok || !due('t:' + k, gap[1])) return;
      at('t:' + k, gap[0], gap[1]);
      if (busy()) return;
      const tr = get();
      if (!tr) return;
      const f = this.along(tr.pts, speed);
      const bus = this.src(f, r50, { dur: f.dur + 2 });
      const d = this[voice](t + 0.05, bus, lv * (GAIN[voice] ?? 1), f, ...(extra ? [extra()] : []));
      bus.emitter.until = t + 0.05 + Math.max(f.dur, typeof d === 'number' ? d : 0) + 1.5;
      stamp();
    };
    track('boat', 'boat', 1.05 + r() * 0.25, 14, [30, 75], (hour >= 5.5 && hour < 20) && rain < 0.6, () => M.canalTrack(l.x, l.z, r));
    track('cross', 'crossing', 1.25, 9, [16, 40], hour >= 6 && hour < 21.5 && rain < 0.6, () => M.bridgeTrack(l.x, l.z, r));
    track('sedan', 'sedan', 1.5, 12, [110, 240], hour >= 8 && hour < 18 && rain < 0.2, () => M.streetTrack(l.x, l.z, r, 90, 40));
    const trade = day || hour < 23 ? pickTrade(hour, doy) : null;
    track('vendor', 'vendor', 1.0, 10, [34, 80], trade && rain < 0.4 && hour >= 5.5 && hour < 23, () => M.streetTrack(l.x, l.z, r, 80, 30), 1, () => trade);
    track('watch', 'watchman', 1.0, 12, [34, 70], night && rain < 0.5, () => M.streetTrack(l.x, l.z, r, 90, 34));
    for (const x of M.TRACKS || []) track(x.key, x.voice, x.speed, x.r50, x.gap, x.ok(hour, rain), () => x.get(l.x, l.z, r));   // a place's own passing sounds (Venice's gondolas, bridges, hawkers, patrol)

    // the waters: the canals' walls, the pond's stones, the fish; the eaves' drips
    const cs = M.canalSpot(l.x, l.z);
    if (cs && cs.d < 24 && due('p:nextLap', 1.2)) {
      at('p:nextLap', 0.3, 1.4, 1 / (0.5 + 1 / (1 + cs.d / 8)));
      const p = [cs.p[0] + (r() - 0.5) * 12, cs.p[1] + (r() - 0.5) * 12];
      const bus = this.src(p, 5, { dur: 1 }); this.lap(t + 0.02, 1.2 + rain * 0.5, bus); bus.emitter.until = t + 1;
    }
    const sh = M.shoreSpot(l.x, l.z, r);
    if (sh && due('p:nextShore', 2.5)) {
      at('p:nextShore', 1.2, 4);
      const bus = this.src(sh, 5, { dur: 1 }); this.lap(t + 0.02, 0.55, bus); bus.emitter.until = t + 1;
    }
    if (P.eaveWet > 0.08 && (!P.indoors || rain > 0.1) && due('p:nextDrip', 0.5)) {
      at('p:nextDrip', 0.12, 0.8, 1 / (P.eaveWet + 0.15));
      spawn(around(1.5, 6), 3, 0.7 + P.eaveWet * 0.5, 'eaveDrip');
    }
    if (day && rain < 0.6 && cs?.d !== undefined) {
      const pond = M.pondSpot(l.x, l.z, r);
      if (pond && due('p:nextFish', 14)) { at('p:nextFish', 9, 26, doy > 90 && doy < 300 ? 1 : 2.5); if (!busy()) spawn(pond, 8, 1, 'fishRise'); }
    }

    // the creatures of the season and the hour
    const green = M.greenNear(l.x, l.z), froggy = M.frogGround(l.x, l.z);
    const frogW = seasonOf('frog', doy) * (night ? 1 : hour >= 17 || hour < 7 ? 0.5 : 0.1) * (1 + rain) * froggy;
    if (frogW > 0.05 && due('p:nextFrog', 1.5)) {
      at('p:nextFrog', 0.9, 3.5, 1 / frogW);
      let p = M.pondSpot(l.x, l.z, r, 28);
      if (!p && froggy > 0.2) { const a = r() * Math.PI * 2, q = [Math.cos(a) * 195, Math.sin(a) * 195]; if (Math.hypot(q[0] - l.x, q[1] - l.z) < 140) p = q; }
      if (p && !busy()) spawn(p, 14, 0.8 + 0.4 * r(), 'frog', { args: [r() < 0.3 + 0.3 * rain ? 'tree' : 'pond'] });
    }
    const cricW = seasonOf('cricket', doy) * (hour >= 18 || hour < 5.5 ? 1 : 0.2) * (rain > 0.5 ? 0.2 : 1) * green, katW = seasonOf('katydid', doy) * (night || dusk ? 1 : 0.2) * (rain > 0.5 ? 0.2 : 1) * green;
    if (cricW + katW > 0.04 && due('p:nextCricket', 1)) {
      at('p:nextCricket', 0.7, 2.0, 1 / (cricW + katW));
      for (let k = 0; k < 6; k++) {
        const p = around(3, 16);
        if (M.greenNear(p[0], p[1]) > 0.35 + 0.3 * r()) { if (!busy()) spawn(p, 6, 0.8 + 0.4 * r(), 'cricket', { args: [r() * (cricW + katW) < katW ? 'katydid' : 'cricket'] }); break; }
      }
    }
    const cicW = seasonOf('cicada', doy) * (hour >= 11 && hour < 17 ? 1 : hour >= 8 && hour < 18.5 ? 0.5 : 0) * (rain > 0.3 ? 0.1 : 1) * green;
    if (cicW > 0.05 && due('p:nextCicada', 4)) {
      at('p:nextCicada', 1.5, 6, 1 / cicW);
      const p = M.treeSpot(l.x, l.z, r, 36);
      if (p && !busy()) spawn(p, 12, 1, 'cicada');
    }
    if (day && rain < 0.5 && due('p:nextBird', 30)) {
      at('p:nextBird', 14, 50);
      const W = { cuckoo: seasonOf('cuckoo', doy), oriole: seasonOf('oriole', doy), magpie: seasonOf('magpie', doy), tit: seasonOf('tit', doy) };
      const kind = Object.keys(W).sort((a, b) => W[b] - W[a])[0], p = M.treeSpot(l.x, l.z, r, 40);
      if (p && W[kind] > 0.15 && !busy()) spawn(p, 18, 1, 'seasonBird', { args: [kind] });
    }
    // bamboo knocking in a gust
    if (wind > 0.28 && M.bambooNear(l.x, l.z) > 0.35 && due('p:nextCulm', 4)) {
      at('p:nextCulm', 3, 9, 1 / wind);
      if (!busy()) spawn(around(5, 12), 6, 0.6 + wind, 'culm');
    }

    // inside: the small sounds of the room (by its use)
    if (P.indoors && room) {
      const R0 = room.upper ? M.UPPER : M.ROOMS[room.use] || M.ROOMS.house;
      for (const [voice, gap] of R0.work || []) {
        const k = 'rw:' + voice;
        if (!due(k, gap)) continue;
        at(k, gap * 0.6, gap * 1.4);
        const p = around(1.5, 4);
        spawn(p, 4, 1, voice, { inside: room.same });
      }
    }
  },

  /** A drip from the eaves: onto a stone gutter (a bright plink), into the canal or a puddle (a bubble), into the water vat (a hollow tonk). */
  eaveDrip(t, bus, lv) {
    const x = R();
    if (x < 0.5) this.drip(t, lv, bus);
    else if (x < 0.78) this.tone(t, [[0, 700 + R() * 500], [0.05, 1500 + R() * 600]], 0.07, 0.014 * lv, bus, 'sine');
    else this.tone(t, [[0, 430], [0.12, 340]], 0.16, 0.014 * lv, bus, 'sine', ['lowpass', 900]);
    return 0.3;
  },

  // ── the layers that run while wanted: bamboo, leaves, lotus under rain, the room's air, the roof over one ──
  /** `want` 0…1 sets a layer's loudness (made when first wanted, let go half a minute after it is not). */
  layer(name, want, k, make, t) {
    const P = this.plc, ls = (P.layers ||= {});
    let Ly = ls[name];
    if (want > 0.01 && !Ly) { Ly = ls[name] = make(); Ly.off = 0; }
    if (!Ly) return null;
    Ly.g.gain.setTargetAtTime(want * k, t, 1.5);
    if (want > 0.01) Ly.off = 0;
    else if (!Ly.off) Ly.off = t;
    else if (t - Ly.off > 30) { for (const o of Ly.stops) try { o.stop(); } catch { /* stopped */ } Ly.g.disconnect(); delete ls[name]; return null; }
    return Ly;
  },
  noiseSrc(stops) { const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; s.loopStart = R() * 3; s.start(); stops.push(s); return s; },
  /** Slow swelling of a gain by two sines out of step (gusts) and a quick flutter. */
  gusts(g, stops, slow, fast, depthSlow = 0.5, depthFast = 0.2) {
    const ctx = this.ctx;
    for (const [rate, d] of [[slow[0], depthSlow], [slow[1], depthSlow * 0.7], [fast, depthFast]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = rate; og.gain.value = d; o.connect(og); og.connect(g.gain); o.start(); stops.push(o); }
  },
  placedLayers(L, t) {
    const P = this.plc, M = L.map, l = this.lis(), ctx = this.ctx, wind = this.wind || 0, rain = P.rain || 0;
    const room = P.room, inRoom = !!(P.indoors && room);
    const doy = this.seasonDoy(), hour = P.hourNow ?? 12;
    const outdoor = P.indoors ? 0.35 : 1;
    // wind in bamboo: a high, narrow swish with a quick flutter and a hollow breath under it; in broad leaves: a lower, softer, wider rustle
    this.layer('bamboo', (0.1 + 0.9 * wind) * M.bambooNear(l.x, l.z) * outdoor, 0.03, () => {
      const stops = [], g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      const am = ctx.createGain(); am.gain.value = 0.5; am.connect(g);
      for (const [f, q, a] of [[3000, 2.4, 1], [1250, 1.1, 0.5]]) { const bp = ctx.createBiquadFilter(), ag = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; ag.gain.value = a; this.noiseSrc(stops).connect(bp); bp.connect(ag); ag.connect(am); }
      this.gusts(am, stops, [0.23, 0.37], 6.4, 0.4, 0.22);
      return { g, stops };
    }, t);
    this.layer('leaf', (0.1 + 0.9 * wind) * M.leafNear(l.x, l.z) * (1 - 0.6 * M.bambooNear(l.x, l.z)) * outdoor, 0.03, () => {
      const stops = [], g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      const am = ctx.createGain(); am.gain.value = 0.5; am.connect(g);
      const bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 950; bp.Q.value = 0.5; lp.type = 'lowpass'; lp.frequency.value = 2400;
      this.noiseSrc(stops).connect(bp); bp.connect(lp); lp.connect(am);
      this.gusts(am, stops, [0.13, 0.29], 2.7, 0.45, 0.12);
      return { g, stops };
    }, t);
    // rain on the lotus leaves: soft hollow pats, now and then a big drop tipped off a leaf
    this.layer('lotus', rain * M.lotusNear(l.x, l.z) * outdoor, 0.05, () => {
      const sr = ctx.sampleRate, n = sr * 2, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
      for (let k = 0; k < 150; k++) {
        const at = Math.floor(R() * n), a = 0.25 + R() * 0.75, f = 230 + R() * 420, len = Math.floor(sr * 0.05);
        for (let i = 0; i < len; i++) { const x = i / sr; d[(at + i) % n] += a * Math.exp(-x / 0.013) * Math.sin(2 * Math.PI * f * x) + (i < 40 ? a * 0.35 * (R() - 0.5) : 0); }
      }
      for (let k = 0; k < 7; k++) { const at = Math.floor(R() * n), f = 600 + R() * 500, len = Math.floor(sr * 0.08); for (let i = 0; i < len; i++) { const x = i / sr; d[(at + i) % n] += 0.8 * Math.exp(-x / 0.02) * Math.sin(2 * Math.PI * f * (x + 6 * x * x)); } }
      let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(d[i]));
      for (let i = 0; i < n; i++) d[i] /= m || 1;
      const g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.connect(g); s.start();
      return { g, stops: [s] };
    }, t);
    // the room: its air, coloured by its use; the roof overhead in rain (the louder the nearer the tiles: upstairs)
    const spec = inRoom ? (room.upper ? M.UPPER : M.ROOMS[room.use] || M.ROOMS.house) : null;
    const tone = this.layer('room', inRoom ? 1 : 0, spec ? spec.tone[1] * 0.012 : 0.003, () => {
      const stops = [], g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; this.noiseSrc(stops).connect(lp); lp.connect(g);
      return { g, stops, lp };
    }, t);
    if (tone && spec) { tone.lp.frequency.setTargetAtTime(spec.tone[0], t, 0.8); tone.g.gain.setTargetAtTime(inRoom ? spec.tone[1] * 0.012 : 0, t, 1.5); }
    this.layer('roof', inRoom ? rain * spec.roof : 0, 0.035, () => {
      const stops = [], g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      for (const [f, q, a] of [[190, 0.8, 1], [90, 1, 0.6]]) { const bp = ctx.createBiquadFilter(), ag = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; ag.gain.value = a; this.noiseSrc(stops).connect(bp); bp.connect(ag); ag.connect(g); }
      return { g, stops };
    }, t);
    // the tiles themselves louder from inside, by the room; the room's own muffle and how much of the town comes through
    P.patG.gain.setTargetAtTime(rain * (inRoom ? 0.16 * spec.roof : 0.07), t, 1.5);
    this.roomCut = inRoom ? (room.use === 'pavilion' ? 3000 : room.use === 'inn' ? 1600 : room.upper ? 1100 : room.use === 'hall' || room.use === 'temple' ? 700 : 1000) : null;
    P.out.gain.setTargetAtTime(inRoom ? spec.hush : 1, t, 0.8);
    // cicadas: only in their weeks, and by the green round; the engine's layer is made louder or quieter to suit
    P.cG.gain.setTargetAtTime((P.cicadas || 0) * 0.018 * seasonOf('cicada', doy) * Math.min(1.2, M.greenNear(l.x, l.z) * 1.3), t, 3);
  },
};

/** Put the voices on Music's prototype (audio.js does it once). */
export function installVoices(Music) {
  for (const [k, v] of Object.entries(VOICES)) if (!Music.prototype[k]) Music.prototype[k] = v;
  for (const [k, v] of Object.entries(OTTOMAN_VOICES)) if (!Music.prototype[k]) Music.prototype[k] = v;
  Music.prototype.seasonDoy = function seasonDoy() { return this.doyOverride ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value); };
}
import { VOICES_FLORENCE } from './voices-florence.js'; Object.assign(VOICES, VOICES_FLORENCE);       // (Florence's own: the market's cries, the chain, the cleaver, the weirs)
