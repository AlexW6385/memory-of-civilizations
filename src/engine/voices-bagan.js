// The placed voices of Pagan about 1200 (docs/settlements/bagan.md §15.3; src/settlements/bagan/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `bgn`; the engine's own voices that suit (the potter's clay, the loom, the betel mortar, the lacquerer's brush,
// the well's bucket, the broom, cloth, the kitchen, the jars, the crows, doves, cicadas and frogs) are used by the map as they are. Each is `name(t, bus, lv[, track])`: it makes its
// events from `t` into a bus from `src()` and returns how long it lasts. All synthesised (noise, oscillators, formant filters, struck partials; no samples), every cry and chant WORDLESS
// (vowel contours: no Pali, Mon or Burmese is sung). [inferred throughout: no recording of Pagan exists. What sounded is from the dossier (§8) and from the plain's life as the later
// travellers and the Burmese village record it: the great bell struck from outside with a wooden log, the tinkling bells and vanes of the hti, the monks' chant, the arched harp, the oxcart
// with its wooden bell, the foot-lever rice pounder, the paddle at the gunwale, the tokay in the thatch, the jackal on the plain. The scale is the pentatonic of music.js; the hsaing
// ensemble is later than 1200 and stands here for the gongs, drums and oboe of the festival, as the dossier's music does.]
import { addVoices } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const pick = (a) => a[Math.floor(R() * a.length)];
const SC = [0, 2, 5, 7, 9];                                     // the five-note mode over the tonic

export const BGN_VOICES = {
  /** The great bell of the temple (bronze, hung without a clapper) struck from outside with a wooden log: three strokes a few seconds apart, each ringing for ten. */
  bgnBell(t, bus, lv) {
    const f = 150 + R() * 70, n = 3, gap = 4.2 + R() * 2;
    for (let k = 0; k < n; k++) this.cue(t + k * gap, (x) => { this.templeBell(x, f, 0.05 * lv, bus, 1); this.knock(x, 260, 0.03 * lv, bus, 0.05); });
    return gap * (n - 1) + 11;
  },
  /** The tinkling of the small bells and vanes hung from the gilded hti, in the wind: a scatter of tiny struck bronzes, many in a gust, few in a calm. */
  bgnHtiBells(t, bus, lv) {
    const w = Math.max(0.1, Math.min(1, this.wind || 0.3)), n = 3 + Math.floor(R() * 4 + w * 8);
    let at = t;
    for (let k = 0; k < n; k++) {
      const f = 2600 + R() * 2400, x = at;
      this.cue(x, (y) => this.struck(y, f, 0.011 * lv, bus, [[1, 1, 0.9], [2.76, 0.4, 0.45], [5.4, 0.15, 0.2]]));
      at += 0.1 + R() * (1.4 - w);
    }
    return at - t + 1.2;
  },
  /** The monks' chant (paritta, wordless): four low men's voices on one drone in turn, a phrase of vowels that rises and falls, answered, with the breath between. */
  bgnPaliChant(t, bus, lv) {
    const f0 = 98 * (0.94 + R() * 0.12), P = [[[0, 1.0, 'a'], [0, 0.8, 'u'], [2, 1.0, 'o'], [0, 1.2, 'a'], [-2, 1.6, 'u']], [[0, 0.8, 'o'], [2, 0.9, 'a'], [3, 0.8, 'o'], [2, 0.9, 'a'], [0, 1.8, 'u']]];
    let w = t;
    this.tone(t, [[0, f0 / 2], [14, f0 / 2]], 14, 0.012 * lv, bus, 'sine', ['lowpass', 220]);
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const c = pick(P), x = w;
      for (const [d, off] of [[0, 1], [0.03, 1.008], [0.06, 0.994]]) this.cue(x + d, (y) => this.cry(y, f0 * off, c, 0.026 * lv, bus, { cutoff: 1800 }));
      w += c.reduce((s, q) => s + q[1], 0) + 0.9 + R() * 1.1;
    }
    return w - t + 0.5;
  },
  /** The pilgrims at a porch: two or three murmuring a prayer on one low note, a hand bell tapped when they rise. */
  bgnPray(t, bus, lv) {
    const f0 = 120 * (0.9 + R() * 0.3), d = 4 + R() * 3;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.4, (x) => this.cry(x, f0 * (1 + 0.06 * k), [[0, d * 0.5, 'o'], [-1, d * 0.5, 'u']], 0.012 * lv, bus, { cutoff: 1500, fem: k === 1 }));
    this.cue(t + d + 0.5, (x) => this.struck(x, 1180 + R() * 120, 0.012 * lv, bus, [[1, 1, 1.4], [2.4, 0.4, 0.8]]));
    return d + 2.5;
  },
  /** The arched harp (saung) in a courtyard: soft plucked notes of the pentatonic mode in a slow phrase, each ringing and dying, now and then two together. */
  bgnSaung(t, bus, lv) {
    const root = 60 + Math.floor(R() * 5), n = 8 + Math.floor(R() * 7);
    let w = t, k = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + pick([-2, -1, -1, 1, 1, 2])));
      const f = mtof(root + SC[k % 5] + 12 * Math.floor(k / 5)), x = w;
      this.cue(x, (y) => { this.struck(y, f, 0.026 * lv, bus, [[1, 1, 1.5], [2, 0.3, 0.8], [3.01, 0.12, 0.4]]); if (R() < 0.2) this.struck(y + 0.015, f * 1.5, 0.014 * lv, bus, [[1, 1, 1.0], [2, 0.2, 0.5]]); });
      w += 0.5 + R() * 0.8;
    }
    return w - t + 1.6;
  },
  /** The festival ensemble (a ring of tuned gongs, barrel drums, an oboe over a drone): a quick pattering of drums, the gongs running through the mode, the oboe's nasal line. */
  bgnHsaing(t, bus, lv) {
    const root = 55 + Math.floor(R() * 4), beat = 0.17, n = 40 + Math.floor(R() * 24), drone = mtof(root - 12);
    this.tone(t, [[0, drone], [n * beat + 1, drone * 1.002]], n * beat + 1, 0.012 * lv, bus, 'sawtooth', ['bandpass', 700, 2]);
    let deg = 0;
    for (let k = 0; k < n; k++) {
      const x = t + k * beat * (k > n - 7 ? 0.6 : 1), hit = k % 8 !== 5;
      if (hit) this.cue(x, (y) => { this.tone(y, [[0, 260 * (1 + 0.06 * (k % 3))], [0.05, 170]], 0.1, 0.03 * lv, bus); this.burst(y, 0.03, 2200, 1.2, 0.025 * lv, bus); });
      if (k % 4 === 0) { deg = Math.max(0, Math.min(9, deg + pick([-2, -1, 1, 1, 2, 3]))); const f = mtof(root + 12 + SC[deg % 5] + 12 * Math.floor(deg / 5)); this.cue(x, (y) => this.gong(y, f, 0.026 * lv, bus, 0.7)); }
    }
    let w = t + 1;
    for (let k = 0, m = 8 + Math.floor(R() * 6); k < m; k++) {
      deg = Math.max(0, Math.min(9, deg + pick([-2, -1, -1, 1, 1, 2]))); const f = mtof(root + 24 + SC[deg % 5] + 12 * Math.floor(deg / 5)), d = 0.25 + R() * 0.7, x = w;
      this.cue(x, (y) => this.tone(y, [[0, f * 0.97], [0.06, f], [d, f * 1.006]], d, 0.02 * lv, bus, 'sawtooth', ['bandpass', f * 2.5, 2.8]));
      w += d + 0.04;
    }
    return Math.max(n * beat, w - t) + 1.5;
  },
  /** An ox-cart on the road (a track): the axle's creak at each turn of the wheel, the wooden bell at the ox's neck knocking at his step, now and then a grunt. */
  bgnCart(t, bus, lv, f) {
    const dur = f?.dur ?? 20;
    for (let s = 0; s < dur; s += 0.85 + R() * 0.15) this.cue(t + s, (x) => this.rasp(x, 0.5, 780 + R() * 260, 3, 0.02 * lv, bus, 7, 0.8));
    for (let s = 0.2; s < dur; s += 0.62 + R() * 0.1) this.cue(t + s, (x) => { this.knock(x, 520 + R() * 80, 0.03 * lv, bus, 0.06); this.knock(x + 0.07, 410 + R() * 60, 0.018 * lv, bus, 0.05); });
    for (let s = 1.5 + R() * 3; s < dur; s += 6 + R() * 8) this.cue(t + s, (x) => this.tone(x, [[0, 90], [0.5, 62]], 0.7, 0.014 * lv, bus, 'sawtooth', ['lowpass', 260]));
    return dur + 1;
  },
  /** The foot-lever rice pounder: the beam's heavy fall into the mortar and the clack of the lever, in an even beat with a woman's breath between. */
  bgnPounder(t, bus, lv) {
    const T = 1.25 + R() * 0.3, n = 8 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * T, (x) => { this.tone(x, [[0, 150], [0.12, 60]], 0.22, 0.04 * lv, bus, 'sine'); this.burst(x, 0.05, 700, 1.2, 0.03 * lv, bus); this.knock(x + T * 0.5, 360, 0.012 * lv, bus, 0.05); });
    return n * T + 1;
  },
  /** A paddled river boat (a track): the blade dipping at the gunwale at each stroke, the swirl, a fisherman's low call now and then. */
  bgnPaddle(t, bus, lv, f) {
    const dur = f?.dur ?? 20, T = 1.5 + R() * 0.4;
    for (let s = 0; s < dur; s += T) this.cue(t + s, (x) => { this.knock(x, 300, 0.016 * lv, bus, 0.05); this.rasp(x + 0.12, 0.7, 520, 0.8, 0.014 * lv, bus, 14, 0.7); });
    for (let s = 3 + R() * 6; s < dur - 3; s += 12 + R() * 14) this.cue(t + s, (x) => this.cry(x, 125, [[0, 0.5, 'o'], [3, 0.9, 'a']], 0.03 * lv, bus, { cutoff: 2200 }));
    return dur + 1;
  },
  /** The river's wash at the bank: a broad low swell of water that comes up and ebbs over seven or eight seconds, a slap now and then. */
  bgnRiver(t, bus, lv) {
    const d = 7 + R() * 3, ctx = this.ctx, s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; lp.type = 'lowpass'; lp.frequency.value = 380;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09 * lv, t + d * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(lp); lp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + d + 0.05);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.rasp(x, 0.35, 900, 0.7, 0.012 * lv, bus, 20, 0.8));
    return d + 0.5;
  },
  /** The tokay in the thatch at night: a loud rattle that opens a series of "to-kay" calls, each a little slower than the last. */
  bgnGecko(t, bus, lv) {
    let w = t + 0.1;
    this.cue(w, (x) => this.rasp(x, 0.5, 1500, 2, 0.02 * lv, bus, 38, 0.9));
    w += 0.7;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.tone(y, [[0, 1100], [0.12, 900]], 0.16, 0.026 * lv, bus, 'sawtooth', ['bandpass', 1200, 3]); this.tone(y + 0.2, [[0, 760], [0.2, 520]], 0.26, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 3]); });
      w += 0.62 + k * 0.1;
    }
    return w - t + 0.5;
  },
  /** A jackal on the plain, far off at night: one rising wail held and let fall, a few yips after it. */
  bgnJackal(t, bus, lv) {
    const f = 520 + R() * 120;
    this.tone(t, [[0, f * 0.8], [1.4, f * 1.3], [2.6, f * 1.05], [3.8, f * 0.7]], 3.9, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 1.6, 2.2]);
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + 4.4 + k * 0.28, (x) => this.tone(x, [[0, f * 1.2], [0.1, f * 1.5]], 0.14, 0.022 * lv, bus, 'sawtooth', ['bandpass', f * 2, 3]));
    return 6.2;
  },
  /** A hawker with a loaded pole (a track): the pole creaking at his step, his wordless call now and then. */
  bgnHawker(t, bus, lv, f) {
    const dur = f?.dur ?? 20, f0 = (R() < 0.5 ? 170 : 250) * (0.94 + R() * 0.12), fem = f0 > 200;
    for (let s = 0; s < dur; s += 0.9) this.cue(t + s, (x) => this.rasp(x, 0.4, 1000 + R() * 300, 3, 0.01 * lv, bus, 6, 0.8));
    const C = [[[0, 0.4, 'a'], [4, 0.4, 'a'], [2, 0.7, 'o'], [0, 0.6, 'a']], [[2, 0.3, 'o'], [5, 0.6, 'a'], [3, 0.5, 'a'], [0, 0.8, 'o']]];
    for (let s = 2 + R() * 4; s < dur - 2; s += 8 + R() * 10) this.cue(t + s, (x) => this.cry(x, f0, pick(C), 0.05 * lv, bus, { cutoff: 3000, fem }));
    return dur + 1;
  },
  /** The gong at the palace that marks the watches of the night: one deep stroke and, after a pause, its echo in the courts. */
  bgnWatchGong(t, bus, lv) {
    this.gong(t, 78, 0.07 * lv, bus, 2.2);
    this.cue(t + 3.2, (x) => this.gong(x, 78, 0.025 * lv, bus, 1.2));
    return 8;
  },
};
export const BGN_GAIN = { bgnBell: 1, bgnHtiBells: 1, bgnPaliChant: 1, bgnPray: 1, bgnSaung: 1, bgnHsaing: 1, bgnCart: 1, bgnPounder: 1, bgnPaddle: 1, bgnRiver: 1, bgnGecko: 1, bgnJackal: 1, bgnHawker: 1, bgnWatchGong: 1 };
addVoices('voices-bagan.js', BGN_VOICES, BGN_GAIN);
