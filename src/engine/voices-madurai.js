// The placed voices of Madurai about 1650 (docs/settlements/madurai.md §18), added to voices.js's table from
// src/settlements/madurai/soundmap.js. Each is `name(t, bus, lv[, track])`: it makes its events from `t` into a bus from `src()`
// and returns how long it lasts. Made of the engine's tools only (no samples); every call and chant is WORDLESS (vowel contours),
// no Tamil or Sanskrit text is sung. Pitches, contours and levels are [inferred]; what sounds where and when is in the dossier.

import { addVoices } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const pick = (a) => a[Math.floor(R() * a.length)];
const SA = [0, 1, 4, 5, 7, 8, 11];                                  // Mayamalavagowla, the raga of music.js

export const MDU_VOICES = {
  /** The nadaswaram (a long double-reed pipe with a bell of wood): a loud, nasal, steady line winding through the raga over a drone. */
  mduNadaswaram(t, bus, lv) {
    const base = 62, n = 10 + Math.floor(R() * 6), drone = mtof(base - 12);
    let w = t, deg = 0;
    this.tone(t, [[0, drone], [n * 0.6 + 1, drone * 1.002]], n * 0.6 + 1, 0.014 * lv, bus, 'sawtooth', ['bandpass', 800, 2]);
    for (let k = 0; k < n; k++) {
      deg = Math.max(0, Math.min(6, deg + pick([-2, -1, -1, 1, 1, 2, 3])));
      const f = mtof(base + SA[deg]), d = 0.3 + R() * 0.8, x = w;
      this.cue(x, (y) => { this.tone(y, [[0, f * 0.97], [0.07, f], [d, f * 1.008]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.6, 2.6]); this.tone(y, [[0, f * 2.01], [d, f * 2.02]], d, 0.007 * lv, bus, 'square', ['bandpass', f * 4, 2]); });
      w += d + 0.03;
    }
    return w - t + 0.8;
  },
  /** The tavil (a barrel drum struck with a stick on the right and the hand on the left): a quick, dry, rolling pattern with a ringing stroke. */
  mduTavil(t, bus, lv) {
    const pat = [1, 0.5, 0.6, 1, 0, 0.5, 0.7, 0.5], T = 0.16, n = 24 + Math.floor(R() * 16);
    let w = t;
    for (let k = 0; k < n; k++) {
      const a = pat[k % 8], x = w, hand = k % 4 === 2;
      if (a) this.cue(x, (y) => { this.tone(y, hand ? [[0, 130], [0.1, 80]] : [[0, 330], [0.05, 220]], hand ? 0.22 : 0.1, 0.04 * a * lv, bus); this.burst(y, 0.025, hand ? 600 : 2600, 1.2, 0.03 * a * lv, bus); });
      w += T * (k > n - 6 ? 0.55 : 1);
    }
    return w - t + 0.6;
  },
  /** The bell of the shrine (a hand bell rung in the worship): a quick even shaking, then the last stroke ringing out. */
  mduPujaBell(t, bus, lv) {
    const n = 14 + Math.floor(R() * 10);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.21, (x) => this.struck(x, 1500 + R() * 120, 0.028 * lv, bus, [[1, 1, 0.5], [2.4, 0.5, 0.3], [4.1, 0.25, 0.2]]));
    return n * 0.21 + 0.8;
  },
  /** The conch (shankha) blown at the opening of the shrine at dawn and the closing at night. */
  mduConch(t, bus, lv) {
    this.conch(t, 0.05 * lv, bus);
    if (R() < 0.5) this.cue(t + 4.2, (x) => this.conch(x, 0.045 * lv, bus));
    return 8;
  },
  /** A priest's chant, wordless: a slow monotone on three notes, ending on the tonic, in the echo of the court. */
  mduChant(t, bus, lv) {
    const f0 = 110 * (0.94 + R() * 0.12), P = [[[0, 0.9, 'a'], [0, 0.8, 'o'], [2, 0.9, 'a'], [0, 1.4, 'u']], [[2, 0.7, 'a'], [2, 0.7, 'a'], [3, 0.9, 'o'], [2, 0.6, 'a'], [0, 1.6, 'u']]];
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const c = pick(P), x = w; this.cue(x, (y) => this.cry(y, f0, c, 0.04 * lv, bus, { cutoff: 2000 })); w += c.reduce((s, q) => s + q[1], 0) + 1 + R(); }
    return w - t;
  },
  /** The jasmine seller's call (a woman's, rising and falling, wordless): from a mat on the Chitrai street. */
  mduFlowers(t, bus, lv) {
    const f0 = 290 * (0.94 + R() * 0.14), c = pick([[[0, 0.5, 'a'], [4, 0.5, 'a'], [2, 0.8, 'o'], [0, 0.6, 'a']], [[2, 0.4, 'o'], [5, 0.7, 'a'], [3, 0.5, 'a'], [0, 0.9, 'o']]]);
    this.cry(t, f0, c, 0.05 * lv, bus, { fem: true, cutoff: 3600 });
    return c.reduce((s, q) => s + q[1], 0) + 0.6;
  },
  /** Bathing in the Golden Lotus tank: water poured over the head and the slap of it on the steps, a splash. */
  mduBathe(t, bus, lv) {
    const d = this.pour(t, bus, lv * 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.8 + R() * 2, (x) => { this.rasp(x, 0.4, 1200, 0.6, 0.02 * lv, bus, 30, 0.8); this.knock(x, 200, 0.02 * lv, bus, 0.06); });
    return Math.max(d, 3);
  },
  /** A temple elephant: a rumble, the brass bell at its neck swinging, a chain dragged at the foot, now and then a trumpet. */
  mduElephant(t, bus, lv) {
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.8 + R() * 0.3), (x) => { this.struck(x, 780 + R() * 80, 0.012 * lv, bus, [[1, 1, 0.5], [2.1, 0.5, 0.3]]); this.rasp(x + 0.1, 0.4, 2600, 0.5, 0.01 * lv, bus, 40, 0.8); });
    this.tone(t + 0.3, [[0, 55], [1.5, 42]], 1.8, 0.03 * lv, bus, 'sawtooth', ['lowpass', 180]);
    if (R() < 0.25) this.cue(t + 3.5, (x) => this.tone(x, [[0, 320], [0.25, 700], [1.1, 520]], 1.3, 0.04 * lv, bus, 'sawtooth', ['bandpass', 900, 1.4]));
    return 7;
  },
  /** A bullock cart: the axle's creak under load, the bells at the bullocks' necks, hooves and the wheels on the beaten earth. */
  mduCart(t, bus, lv, f) {
    const d = 9 + R() * 3;
    this.rasp(t, d, 1100, 3, 0.012 * lv, bus, 3.2, 0.9);
    for (let k = 0; k < d * 2.2; k++) this.cue(t + k * 0.45, (x) => { this.struck(x, 900 + R() * 120, 0.009 * lv, bus, [[1, 1, 0.3], [2.3, 0.4, 0.2]]); this.knock(x + 0.1, 120, 0.012 * lv, bus, 0.05); });
    void f;
    return d;
  },
  /** The stone grinder (attu kal) of the morning kitchens: a slow heavy circling of stone on stone, a rattle of the pestle. */
  mduGrind(t, bus, lv) {
    const d = 5 + R() * 4;
    this.rasp(t, d, 520, 1.1, 0.02 * lv, bus, 2.4, 0.8);
    for (let k = 0; k < d * 1.4; k++) this.cue(t + k * 0.7, (x) => this.knock(x, 160, 0.012 * lv, bus, 0.04));
    return d;
  },
  /** Bangles on a seller's tray: a bright tinkling shaken and settled. */
  mduBangles(t, bus, lv) {
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) this.cue(t + k * 0.06 + R() * 0.03, (x) => this.struck(x, 3600 + R() * 1400, 0.012 * lv, bus, [[1, 1, 0.12], [1.5, 0.4, 0.08]]));
    return 1.6;
  },
  /** The beasts' own watch of the night: a brass bell on a cow in the lane, the slow chew, a breath. */
  mduCowBell(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (1.2 + R()), (x) => this.struck(x, 640 + R() * 60, 0.014 * lv, bus, [[1, 1, 0.6], [2.2, 0.4, 0.4]]));
    return 8;
  },
  /** The water of the tank's steps in the cloister: a drip and the lap of the pool on its stone. */
  mduTankLap(t, bus, lv) {
    this.rasp(t, 3, 900, 0.6, 0.008 * lv, bus, 6, 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.3 + R() * 2.4, (x) => this.tone(x, [[0, 900 + R() * 300], [0.06, 1500]], 0.1, 0.01 * lv, bus, 'sine'));
    return 3.2;
  },
  /** The Pudhu Mandapam's market: the murmur of buyers, now and then a bangle's tinkle. */
  mduMarket(t, bus, lv) {
    const d = this.teaTalk(t, bus, lv * 0.8);
    if (R() < 0.4) this.cue(t + 1 + R() * Math.max(1, d - 2), (x) => this.mduBangles(x, bus, lv));
    return d;
  },
  /** The house crow's caw over the roofs and the squirrel's chitter on the gopuram. */
  mduCrow(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * 0.45, (x) => { this.tone(x, [[0, 600], [0.12, 420]], 0.2, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1200, 2]); });
    return 2;
  },
};
/** Levels set so that each renders at about 4.5e-3 RMS at the source (tools/sound-render.mjs, as for the other settlements' voices). */
addVoices('voices-madurai.js', MDU_VOICES, { mduNadaswaram: 1.0, mduTavil: 0.45, mduPujaBell: 0.65, mduConch: 1.0, mduChant: 1.6, mduFlowers: 1.25, mduBathe: 1.4, mduElephant: 0.65, mduCart: 2.0, mduGrind: 3.5, mduBangles: 1.2, mduCowBell: 1.2, mduTankLap: 1.3, mduMarket: 1.0, mduCrow: 1.0 });
