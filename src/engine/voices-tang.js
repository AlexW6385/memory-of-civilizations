// The placed voices of Tang Chang'an about 750 (docs/settlements/tang-changan.md §19), added to voices.js's VOICES from the map that
// places them (src/settlements/tang-changan/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from
// `src()` and returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock, gong, creak, step) and
// nothing else: no samples. Pitches and contours are [inferred]: no recording of Tang Chang'an exists; what each sound is, and when, rests on
// the sources of §19 (the drums of the streets and the markets, the gong, the ward gates shut at night, the camel trains of the Silk Road,
// the Hu pipa and drum). Every name is prefixed `tc` (VOICES is one shared table).
//
// The scheduler `tcPlaced` hands the map the hour first (the streets and the market answer by it: nobody is out in the curfew), then lets
// voices.js's `placed` run the map's emitters, tracks and rooms.

import { VOICES, addVoices } from './voices.js';

const R = Math.random;

/** The map without its own `schedule` (so `placed` runs its common scheduler on it), one copy per map. */
const PLAIN = new WeakMap();

export const TANG_VOICES = {
  /** The scheduler: the clock first, then the common one (the map's emitters, tracks, rooms). */
  tcPlaced(L, t) {
    const P = this.plc, l = this.lis(), M = L.map;
    M.clock.hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1);
    let plain = PLAIN.get(M);
    if (!plain) PLAIN.set(M, plain = { ...M, schedule: undefined });
    return VOICES.placed.call(this, { ...L, map: plain }, t);
  },

  /**
   * The street drums (jiegu) of the dusk and of the fifth watch: a long, slow roll of deep hide-drum strokes, the first widely spaced, then
   * quicker, answered from a farther drum, ending on a single beat [stated: drums beaten to open and close the gates and markets; the
   * number of strokes (some 800) is far shortened here].
   */
  tcJiegu(t, bus, lv) {
    let w = t, gap = 1.5;
    for (let k = 0; k < 24; k++) {
      const x = w, a = 0.085 * lv * (k % 4 === 0 ? 1.15 : 1);
      this.cue(x, (u) => { this.tone(u, [[0, 118], [0.18, 54]], 0.4, a, bus, 'sine'); this.burst(u, 0.05, 420, 0.9, a * 0.5, bus); this.burst(u, 0.9, 200, 0.5, a * 0.14, bus, 0.01); });
      if (k > 11) this.cue(x + gap * 0.5, (u) => this.tone(u, [[0, 150], [0.12, 80]], 0.25, a * 0.4, bus, 'sine'));      // the far drum answers, softer
      w += gap; gap = Math.max(0.55, gap * 0.93);
    }
    this.cue(w + 0.6, (u) => { this.tone(u, [[0, 105], [0.3, 46]], 0.7, 0.1 * lv, bus, 'sine'); this.burst(u, 0.07, 380, 0.9, 0.05 * lv, bus); });
    return w - t + 2.5;
  },
  /** The drum of the West Market at noon: six slow strokes of a great drum, a pause between each (the market is opened). */
  tcMarketDrum(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 1.7, (u) => { this.tone(u, [[0, 100], [0.22, 48]], 0.5, 0.1 * lv, bus, 'sine'); this.burst(u, 0.06, 360, 0.9, 0.05 * lv, bus); });
    return 15;
  },
  /** The market's gong at the closing, before dusk: strokes of a bronze gong, evenly spaced and ringing on [stated: closed at 300 gong beats; here a run of eight]. */
  tcMarketGong(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 1.5, (u) => { this.gong(u, 196, 0.06 * lv, bus, 1.5); this.struck(u, 196 * 0.5, 0.025 * lv, bus, [[1, 1, 2.4]]); });
    return 15;
  },
  /** A ward gate shut for the night (and opened at the fifth watch): the heavy leaves swung to with a hinge's groan, the wooden bar dropped into its brackets, a low thud. */
  tcGateBar(t, bus, lv) {
    this.cue(t, (u) => this.creak(u, lv * 1.1, bus, false));
    this.cue(t + 0.8, (u) => this.creak(u, lv * 0.9, bus, true));
    this.cue(t + 1.7, (u) => { this.tone(u, [[0, 150], [0.1, 70]], 0.2, 0.09 * lv, bus, 'sine'); this.burst(u, 0.05, 700, 1.1, 0.06 * lv, bus); });
    this.cue(t + 2.4, (u) => { this.knock(u, 210, 0.07 * lv, bus, 0.16); this.burst(u + 0.08, 0.2, 2400, 1.6, 0.015 * lv, bus); });
    return 4;
  },
  /** A camel couched or standing in a caravanserai yard: the dull, double note of its wooden bells, a chew, and now and then a groan. */
  tcCamelBell(t, bus, lv) {
    const n = 2 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.7 + R() * 0.5), (u) => { const f = R() < 0.5 ? 410 : 330; this.knock(u, f, 0.035 * lv, bus, 0.1); this.struck(u + 0.01, f * 2.7, 0.01 * lv, bus, [[1, 1, 0.12]]); });
    if (R() < 0.35) this.cue(t + 1.2 + R() * 2, (u) => { this.tone(u, [[0, 95], [0.4, 150], [0.9, 80]], 1.0, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520]); this.burst(u + 0.1, 0.8, 700, 0.8, 0.012 * lv, bus, 0.2); });
    return 6;
  },
  /** Hu music (the pipa's plucked run and tremolo in a mode of the western regions, a hand drum under it): a short air heard from a wine shop or a yard. [inferred: pitches] */
  tcHuMusic(t, bus, lv) {
    const base = [220, 247, 277, 330, 370][Math.floor(R() * 5)], steps = [0, 2, 4, 7, 9, 12, 14];
    let w = t + 0.2;
    const n = 14 + Math.floor(R() * 10);
    for (let k = 0; k < n; k++) {
      const s = steps[Math.floor(R() * 5) + (k % 4 === 3 ? 2 : 0)], f = base * Math.pow(2, s / 12), d = k % 5 === 4 ? 0.5 : 0.26;
      const x = w;
      if (k % 7 === 6) for (let i = 0; i < 6; i++) this.cue(x + i * 0.07, (u) => this.tone(u, [[0, f * 2], [0.12, f * 1.99]], 0.18, 0.018 * lv, bus, 'triangle', ['lowpass', 3200]));   // the tremolo
      else this.cue(x, (u) => { this.tone(u, [[0, f], [0.35, f * 0.995]], 0.45, 0.03 * lv, bus, 'triangle', ['lowpass', 2600]); this.burst(u, 0.02, 2800, 1.5, 0.008 * lv, bus); });
      if (k % 2 === 0) this.cue(x, (u) => { this.tone(u, [[0, 190], [0.08, 110]], 0.15, 0.035 * lv, bus, 'sine'); });                  // the drum
      w += d;
    }
    return w - t + 1.5;
  },
  /** The wooden fish (muyu) of a hall's service, a few hollow knocks at a chanter's pace (voices.js's `woodfish` is a layer tool of the engine, not a placed voice). */
  tcWoodfish(t, bus, lv) {
    const n = 4 + Math.floor(R() * 6), gap = 0.7 + R() * 0.25;
    for (let k = 0; k < n; k++) this.cue(t + k * gap, (u) => this.knock(u, 760 - (k % 3) * 30, 0.04 * lv, bus, 0.12));
    return n * gap + 1;
  },
  /** The bronze bells at the eaves of the pagoda: a few small strokes in the wind's gusts, thin partials ringing on. */
  tcWindBell(t, bus, lv) {
    const w = this.wind || 0, n = 1 + Math.floor(R() * (1 + 3 * w));
    for (let k = 0; k < n; k++) this.cue(t + k * (0.25 + R() * 0.5), (u) => { const f = 1500 + R() * 900; this.struck(u, f, (0.03 + 0.03 * w) * lv, bus, [[1, 1, 1.8], [2.4, 0.35, 0.9], [3.9, 0.12, 0.4]]); });
    return 3.5;
  },
  /**
   * A camel string along the avenue: the soft, long steps of padded feet (a dull thump, a hiss of sand), the wooden bells swinging two to a
   * beast, the ropes' creak, a driver's call, a camel's groan. Slow, a stately pace.
   */
  tcCamelTrain(t, bus, lv, f) {
    const dur = f.dur, pace = 1.15;
    for (let k = 0, n = Math.floor(dur / pace); k < n; k++) this.cue(t + k * pace, (u) => {
      this.tone(u, [[0, 95], [0.1, 55]], 0.12, 0.04 * lv, bus, 'sine'); this.burst(u + 0.02, 0.18, 650, 0.7, 0.012 * lv, bus, 0.03);
      const fb = k % 2 ? 410 : 330; this.knock(u + 0.05, fb, 0.03 * lv, bus, 0.1); this.knock(u + 0.31, fb * 1.18, 0.02 * lv, bus, 0.1);
      if (k % 3 === 0) this.creak(u + 0.1, lv * 0.5, bus, k % 2 === 0);
    });
    if (R() < 0.6) this.cue(t + dur * (0.2 + 0.5 * R()), (u) => this.tone(u, [[0, 90], [0.5, 140], [1.1, 75]], 1.2, 0.045 * lv, bus, 'sawtooth', ['lowpass', 500]));
    if (R() < 0.5) this.cue(t + dur * 0.5, (u) => this.cry(u, 135 * (0.95 + R() * 0.1), [[0, 0.3, 'a'], [3, 0.5, 'o'], [0, 0.4, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
  /** An ox-cart with solid wooden wheels: the slow turn of the axle (a low rumble and creak), the oxen's heavy steps, the carter's call. */
  tcCart(t, bus, lv, f) {
    const dur = f.dur, pace = 0.95;
    this.rasp(t, dur, 170, 0.7, 0.03 * lv, bus, 2.4, 0.8);
    this.rasp(t, dur, 800, 0.8, 0.008 * lv, bus, 7, 0.7);
    for (let k = 0, n = Math.floor(dur / pace); k < n; k++) this.cue(t + k * pace, (u) => { this.tone(u, [[0, 100], [0.1, 58]], 0.1, 0.045 * lv, bus, 'sine'); this.tone(u + 0.4, [[0, 96], [0.1, 56]], 0.1, 0.04 * lv, bus, 'sine'); if (k % 2 === 0) this.creak(u + 0.2, lv * 0.45, bus, k % 4 === 0); });
    if (R() < 0.5) this.cue(t + dur * 0.5, (u) => this.cry(u, 128, [[0, 0.3, 'o'], [-2, 0.5, 'e'], [0, 0.4, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
  /** The night patrol of mounted guards along the avenue (Lin 2015: guarded wards and crossroads): hoofbeats on the beaten earth in a walk, harness and scabbard jingling, a low challenge. */
  tcPatrol(t, bus, lv, f) {
    const dur = f.dur, pace = 0.58;
    for (let k = 0, n = Math.floor(dur / pace); k < n; k++) this.cue(t + k * pace, (u) => {
      for (const [d, a] of [[0, 1], [0.15, 0.8], [0.29, 0.9], [0.43, 0.7]]) { this.tone(u + d, [[0, 130], [0.06, 70]], 0.07, 0.03 * lv * a, bus, 'sine'); this.burst(u + d, 0.04, 900 + 150 * a, 1.3, 0.045 * lv * a, bus); }
      if (k % 2 === 0) this.struck(u + 0.05, 2200 + R() * 500, 0.006 * lv, bus, [[1, 1, 0.25], [1.6, 0.5, 0.15]]);
    });
    if (R() < 0.6) this.cue(t + dur * (0.25 + 0.4 * R()), (u) => this.cry(u, 118, [[0, 0.35, 'a'], [-2, 0.3, 'a'], [0, 0.6, 'o']], 0.045 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
};
export const TANG_GAIN = { tcHuMusic: 0.9, tcWindBell: 1 };

addVoices('voices-tang.js', TANG_VOICES, TANG_GAIN);
