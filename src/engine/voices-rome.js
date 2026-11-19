// The placed voices of the Campus Martius under Hadrian (docs/settlements/rome.md §4.19), added to voices.js's
// VOICES from src/settlements/rome/soundmap.js (the map that places them). Each is a method `name(t, bus, lv)`
// making its events from `t` into a bus from `src()` and returning how long it lasts, made of the audio engine's
// tools (burst, tone, struck, rasp, cry, cue, knock, creak, step) and nothing else: no samples. Pitches and
// contours are [inferred]: no recording of ancient Rome exists; what each sound is, and when, rests on the sources
// of §4.19 (Seneca's list of the noises about a bath, Juvenal's night, the vigiles, the baths' bronze).

import { addVoices } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const ROMAN_VOICES = {
  /** A fountain's spout running into its trough: a steady fall of water (noise at 2 kHz, a flutter), now and then a drop. */
  fountain(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 2300, 0.9, 0.022 * lv, bus, 17, 0.5);
    this.rasp(t, dur, 900, 0.7, 0.012 * lv, bus, 5, 0.6);
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + 0.5 + R() * (dur - 1), (x) => this.tone(x, [[0, 900 + R() * 600], [0.05, 1700 + R() * 500]], 0.06, 0.012 * lv, bus, 'sine'));
    return dur;
  },
  /**
   * The noises over Seneca's bath (Letter 56): a strong man grunting and breathing with weights of lead, the slap of the
   * masseur's hand on a shoulder (flat or cupped), the ball-player counting his throws, the plunge into the pool with its
   * churned water, the hair-plucker's thin shrill cry, and under them the murmur of the bathers. A few of them each time.
   */
  bathNoise(t, bus, lv) {
    const dur = 9 + R() * 5;
    this.teaTalk(t, bus, lv * 0.7);
    const pick = [0, 1, 2, 3, 4].sort(() => R() - 0.5).slice(0, 3 + Math.floor(R() * 2));
    for (const k of pick) {
      const w = t + 0.6 + R() * (dur - 3);
      if (k === 0) for (let i = 0, n = 3 + Math.floor(R() * 3); i < n; i++) this.cue(w + i * 0.8, (x) => { this.cry(x, 105 * (0.9 + R() * 0.2), [[0, 0.5, 'o']], 0.04 * lv, bus, { cutoff: 1800 }); this.burst(x + 0.3, 0.3, 1400, 0.8, 0.012 * lv, bus, 0.1); });     // grunts and hissing breath
      if (k === 1) for (let i = 0, n = 2 + Math.floor(R() * 3); i < n; i++) this.cue(w + i * (0.35 + R() * 0.2), (x) => { this.burst(x, 0.05, 1500 + (R() < 0.5 ? 900 : 0), 1.2, 0.07 * lv, bus); this.tone(x, [[0, 220], [0.06, 130]], 0.08, 0.015 * lv, bus); });  // the slap
      if (k === 2) { let x0 = w; for (let i = 0; i < 6; i++) { const d = x0; this.cue(d, (x) => this.cry(x, 150 * (0.95 + R() * 0.1), [[i % 3 * 2, 0.2, i % 2 ? 'e' : 'a']], 0.035 * lv, bus, { cutoff: 2800 })); x0 += 0.45; } }   // the count
      if (k === 3) this.cue(w, (x) => { this.burst(x, 0.7, 1100, 0.6, 0.07 * lv, bus, 0.03); this.tone(x, [[0, 160], [0.2, 70]], 0.3, 0.018 * lv, bus); for (let i = 0; i < 4; i++) this.burst(x + 0.3 + i * 0.2, 0.2, 900 + i * 200, 1.4, 0.02 * lv, bus); });   // the plunge
      if (k === 4) this.cue(w, (x) => this.cry(x, 560, [[0, 0.3, 'i'], [3, 0.5, 'i'], [0, 0.3, 'e'], [3, 0.7, 'i']], 0.035 * lv, bus, { cutoff: 5000, fem: false }));   // the plucker's thin, shrill voice
    }
    return dur;
  },
  /** The baths' bronze struck to say that they are open (Martial, Epigrams 14.163: "sonat aes thermarum"): three strokes, the bronze ringing on. */
  bathGong(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 1.6, (x) => { this.burst(x, 0.05, 1500, 1, 0.05 * lv, bus); this.struck(x, 392, 0.06 * lv, bus, [[1, 1, 1.8], [1.5, 0.5, 1.2], [2.1, 0.45, 0.9], [2.76, 0.3, 0.6], [4.2, 0.15, 0.3]]); });
    return 6.5;
  },
  /** A mill-bakery: the stones of a mill turning, drawn round by a mule (a low grinding with a slow beat), the mule's hoofs on the basalt, the bar creaking. */
  millstone(t, bus, lv) {
    const dur = 8 + R() * 6, beat = 1.5;
    this.rasp(t, dur, 190, 0.8, 0.05 * lv, bus, 1 / beat * 2.2, 0.8);
    this.rasp(t, dur, 760, 0.7, 0.014 * lv, bus, 55, 0.7);
    for (let w = t + 0.2; w < t + dur - 0.5; w += beat / 2) this.cue(w, (x) => this.tone(x, [[0, 110], [0.07, 62]], 0.09, 0.04 * lv * (R() < 0.5 ? 1 : 0.6), bus));
    for (let w = t + 1; w < t + dur - 1; w += 2.8 + R()) this.cue(w, (x) => this.creak(x, lv * 0.5, bus, R() < 0.5));
    if (R() < 0.5) this.cue(t + dur * 0.6, (x) => this.knock(x, 330, 0.05 * lv, bus, 0.09));
    return dur;
  },
  /** The fuller's vats: men treading cloth in the stale-smelling water, two or three at a time, a thump and a slosh at each step, now and then a bucket poured. */
  fullerTread(t, bus, lv) {
    const n = 14 + Math.floor(R() * 10);
    let w = t;
    for (let k = 0; k < n; k++) {
      const d = w;
      this.cue(d, (x) => { this.tone(x, [[0, 130], [0.08, 75]], 0.1, 0.045 * lv, bus); this.burst(x, 0.22, 650 + R() * 200, 0.8, 0.045 * lv, bus, 0.01); });
      w += 0.42 + R() * 0.12;
    }
    if (R() < 0.5) this.cue(t + 2 + R() * 3, (x) => this.pour(x, bus, lv * 0.8));
    return w - t + 0.4;
  },
  /** Wet cloth beaten on a stone: the laundresses' slap and the slosh of the rinsing at a landing. */
  clothBeat(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { const d = w; this.cue(d, (x) => { this.burst(x, 0.09, 1100, 1, 0.06 * lv, bus); this.tone(x, [[0, 170], [0.07, 100]], 0.1, 0.04 * lv, bus); if (R() < 0.4) this.burst(x + 0.1, 0.35, 600, 0.8, 0.02 * lv, bus, 0.05); }); w += 0.5 + R() * 0.4; }
    return w - t + 0.4;
  },
  /** A treadwheel crane at a quay: the wheel's groaning axle under the weight, a slow turn, the timbers knocking, a rope running. */
  craneCreak(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) { const d = w; this.cue(d, (x) => { this.creak(x, lv * 0.8, bus, true); this.rasp(x, 1.1, 300, 0.7, 0.02 * lv, bus, 6, 0.8); }); w += 1.5 + R() * 0.4; this.cue(w - 0.7, (x) => this.knock(x, 300, 0.04 * lv, bus, 0.08)); }
    this.cue(w + 0.2, (x) => this.rasp(x, 1.5, 1800, 1, 0.012 * lv, bus, 30, 0.5));
    return w - t + 1.8;
  },
  /** A tibia (the double pipe) at a sacrifice: a reedy line of seven or nine notes in the Lydian species on F, the pipes a fifth apart, a slow vibrato. */
  tibia(t, bus, lv) {
    const sc = [0, 2, 4, 5, 7, 9, 11, 12], base = 65 + (R() < 0.5 ? 0 : -5);
    let w = t, deg = 4;
    for (let k = 0, n = 7 + Math.floor(R() * 3); k < n; k++) {
      deg = Math.max(0, Math.min(7, deg + [-2, -1, -1, 0, 1, 1, 2][Math.floor(R() * 7)]));
      const f = mtof(base + sc[deg]), d = 0.35 + R() * 0.35;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.97], [0.05, f], [d, f * 1.005]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 3, 2.2]); this.tone(x, [[0, f * 1.5], [d, f * 1.5]], d, 0.012 * lv, bus, 'square', ['bandpass', 1500, 2]); });
      w += d + 0.05;
    }
    return w - t + 0.5;
  },
  /** A seller's cry in the street (Seneca names the drink-seller, the sausage-seller, the pastry-seller and the cookshops' men, "each with his own tone"): three wordless contours. */
  hawkerRome(t, bus, lv) {
    const C = [
      [[0, 0.3, 'a'], [5, 0.3, 'a'], [0, 0.3, 'a'], [5, 0.9, 'e']],                           // the sausage-seller: a rising fourth, twice
      [[7, 0.35, 'o'], [4, 0.35, 'o'], [0, 1.0, 'u']],                                         // the drink-seller: a fall
      [[0, 0.25, 'i'], [4, 0.25, 'i'], [7, 0.25, 'e'], [4, 0.25, 'i'], [2, 0.9, 'a']],        // the pastry-seller: up and down
    ];
    const c = C[Math.floor(R() * 3)], f0 = 150 * (0.92 + R() * 0.2);
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) { const x = w; this.cue(x, (y) => this.cry(y, f0, c, 0.05 * lv, bus, { cutoff: 4200 })); w += c.reduce((s, q) => s + q[1], 0) + 2.5 + R() * 2; }
    return w - t;
  },
  /** A cart by night (wheeled traffic was kept from the streets by day): iron-shod wheels grinding over the basalt, the axle's creak, a mule's hoofs, the load shifting, swelling and fading as it passes. */
  cartPass(t, bus, lv) {
    const dur = 12 + R() * 4;
    const hump = (u) => Math.sin(Math.PI * Math.min(1, Math.max(0, u / dur))) ** 1.5;
    for (let w = t; w < t + dur; w += 0.55 + R() * 0.12) { const h = hump(w - t), d = w; this.cue(d, (x) => { this.knock(x, 260, 0.05 * lv * h, bus, 0.08); this.burst(x + 0.28, 0.06, 900, 1, 0.025 * lv * h, bus); }); }
    for (let w = t + 0.5; w < t + dur - 1; w += 0.9 + R() * 0.7) { const h = hump(w - t), d = w; this.cue(d, (x) => { this.tone(x, [[0, 85], [0.12, 55]], 0.16, 0.05 * lv * h, bus); this.burst(x, 0.12, 400, 0.9, 0.035 * lv * h, bus); }); }
    for (let w = t + 1; w < t + dur - 1; w += 2.3 + R() * 1.5) { const h = hump(w - t), d = w; this.cue(d, (x) => this.creak(x, lv * 0.9 * h, bus, R() < 0.5)); }
    this.rasp(t, dur, 160, 0.7, 0.03 * lv, bus, 7, 0.8);
    return dur + 0.5;
  },
  /** The vigiles on their rounds: a file of men in hobnailed boots, in step, a bucket's handle ringing, a call. */
  vigilesPatrol(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8), T = 0.52 + R() * 0.06;
    for (let k = 0; k < n; k++) this.cue(t + k * T, (x) => { this.burst(x, 0.025, 2600, 1.4, 0.055 * lv, bus); this.tone(x, [[0, 140], [0.05, 75]], 0.07, 0.04 * lv, bus); if (k % 2) this.burst(x + 0.02, 0.05, 4200, 2, 0.02 * lv, bus); });
    for (let k = 0; k < 4; k++) this.cue(t + 0.7 + k * (1.2 + R()), (x) => this.struck(x, 1800 + R() * 500, 0.02 * lv, bus, [[1, 1, 0.1], [2.4, 0.4, 0.06]]));
    this.cue(t + n * T * 0.5, (x) => this.cry(x, 118, [[0, 0.4, 'a'], [-2, 0.9, 'o']], 0.05 * lv, bus, { cutoff: 3500 }));
    return n * T + 0.8;
  },
  /** Sandals on a marble floor under a high vault: three or four slow steps and their long hollow answer. */
  footfall(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const d = w; this.cue(d, (x) => { this.step(x, 0.05 * lv, bus, 'cloth', 1.4); this.tone(x + 0.05, [[0, 95], [0.7, 80]], 0.7, 0.01 * lv, bus, 'sine'); }); w += 0.7 + R() * 0.3; }
    return w - t + 1;
  },
  /** A murmured prayer or a few words in a temple: low, close, with no word in it. */
  murmur(t, bus, lv) {
    return this.teaTalk(t, bus, lv * 0.35);
  },
};
addVoices('voices-rome.js', ROMAN_VOICES, { fountain: 1.0, bathNoise: 1.2, bathGong: 1.0, millstone: 1.0, fullerTread: 1.0, clothBeat: 1.0, craneCreak: 1.0, tibia: 1.0, hawkerRome: 1.0, cartPass: 1.0, vigilesPatrol: 1.0, footfall: 1.0, murmur: 1.0 });
