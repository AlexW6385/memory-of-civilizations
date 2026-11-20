// The placed voices of Mughal Agra about 1650 (docs/settlements/mughal-agra.md §17.3), added to voices.js's table from
// src/settlements/mughal-agra/soundmap.js. Each is `name(t, bus, lv[, track])`: it makes its events from `t` into a bus from
// `src()` and returns how long it lasts. Made of the engine's tools only (no samples); every cry and recitation is WORDLESS
// (vowel contours): no text is sung or written. Pitches, contours and levels are [inferred]; what sounds when is in the dossier.

import { addVoices } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const pick = (a) => a[Math.floor(R() * a.length)];
const SA = [0, 1, 4, 5, 7, 8, 11];                                  // the scale of music.js (a Bhairav-like raga)

export const AGRA_VOICES = {
  /** A fountain jet of the garden's channels and tank: a fall of water into marble and a few drops. */
  agraFountain(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 2200, 0.9, 0.016 * lv, bus, 15, 0.5);
    this.rasp(t, dur, 800, 0.7, 0.01 * lv, bus, 5, 0.6);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.5 + R() * (dur - 1), (x) => this.tone(x, [[0, 1000 + R() * 500], [0.05, 1800 + R() * 400]], 0.05, 0.01 * lv, bus, 'sine'));
    return dur;
  },
  /** A reciter of the Quran (the hafiz who sat in the mausoleum): a slow wordless chant, phrases rising to a held note and falling in turns to the tonic. */
  agraRecite(t, bus, lv) {
    const f0 = 125 * (0.94 + R() * 0.14), P = [
      [[0, 0.6, 'a'], [3, 0.8, 'a'], [5, 1.6, 'o'], [3, 0.4, 'a'], [1.5, 0.4, 'a'], [0, 1.9, 'a']],
      [[0, 0.5, 'o'], [2, 0.6, 'a'], [5, 0.9, 'a'], [7, 1.5, 'o'], [5, 0.5, 'a'], [3, 0.5, 'a'], [1.5, 0.5, 'o'], [0, 2.2, 'u']],
      [[3, 0.7, 'a'], [5, 1.2, 'o'], [3, 0.5, 'a'], [0, 1.6, 'u']]];
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) {
      const c = pick(P), len = c.reduce((s, q) => s + q[1], 0), x = w;
      this.cue(x, (y) => this.cry(y, f0, c, 0.045 * lv, bus, { cutoff: 2400 }));
      w += len + 1.2 + R() * 1.2;
    }
    return w - t;
  },
  /** The surna of the naubat (nine blown together in Abu'l-Fazl; one here): a loud nasal double reed winding through the raga over its drone. */
  agraSurna(t, bus, lv) {
    const base = 62 + (R() < 0.5 ? 0 : -2), n = 9 + Math.floor(R() * 5), drone = mtof(base - 12);
    let w = t, deg = 0;
    this.tone(t, [[0, drone], [n * 0.7 + 1, drone * 1.002]], n * 0.7 + 1, 0.016 * lv, bus, 'sawtooth', ['bandpass', 900, 2]);
    for (let k = 0; k < n; k++) {
      deg = Math.max(0, Math.min(6, deg + pick([-2, -1, -1, 1, 1, 2])));
      const f = mtof(base + SA[deg]), d = 0.35 + R() * 0.7, x = w;
      this.cue(x, (y) => { this.tone(y, [[0, f * 0.96], [0.08, f], [d, f * 1.01]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.5, 2.4]); this.tone(y, [[0, f * 2.01], [d, f * 2.02]], d, 0.008 * lv, bus, 'square', ['bandpass', 2400, 3]); });
      w += d + 0.04;
    }
    return w - t + 0.8;
  },
  /** The nakkara and kuwarga (kettledrums): a deep stroke and a sharp one in a rolling pattern that quickens to a roll, ended with the sanj (cymbals). */
  agraNaqara(t, bus, lv) {
    const pat = [1, 0, 0.6, 1, 0, 0.6, 0.6, 0], T = 0.19, n = 24 + Math.floor(R() * 16);
    let w = t;
    for (let k = 0; k < n; k++) {
      const a = pat[k % 8], x = w, deep = k % 8 === 0 || k % 8 === 3;
      if (a) this.cue(x, (y) => { this.tone(y, deep ? [[0, 95], [0.12, 52]] : [[0, 190], [0.06, 130]], deep ? 0.35 : 0.1, 0.05 * a * lv, bus); this.burst(y, 0.03, deep ? 700 : 2200, 1, 0.035 * a * lv, bus); });
      w += T * (k > n - 8 ? 0.6 : 1);
    }
    this.cue(w, (y) => { this.burst(y, 0.5, 5200, 0.8, 0.05 * lv, bus); this.struck(y, 1900, 0.018 * lv, bus, [[1, 1, 0.9], [1.47, 0.6, 0.7], [2.09, 0.5, 0.5], [2.9, 0.3, 0.35]]); });
    return w - t + 1;
  },
  /** The karna: a long copper trumpet blown low, two or three blasts. */
  agraKarna(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) { this.horn(w, 69 + (k % 2) * 2, 3 + R(), 0.05 * lv, bus); w += 4.5 + R(); }
    return w - t;
  },
  /** Buyers and sellers bargaining: the wordless murmur of the engine, now and then a weight set on the pan, coins on the board. */
  agraBargain(t, bus, lv) {
    const d = this.teaTalk(t, bus, lv * 0.85);
    for (let k = 0, n = Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.agraCoin(x, bus, lv));
    return d;
  },
  /** Coins counted onto a wooden board: bright short rings, three to six. */
  agraCoin(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { const x = w, f = 3000 + R() * 1500; this.cue(x, (y) => this.struck(y, f, 0.012 * lv, bus, [[1, 1, 0.12], [1.6, 0.4, 0.07]])); w += 0.14 + R() * 0.2; }
    return w - t + 0.2;
  },
  /** A seller's cry in the street: four wordless contours (water, sweets, fruit, cloth), two or three times, slides between the notes. */
  agraHawker(t, bus, lv) {
    const C = [
      [[7, 0.4, 'a'], [5, 0.3, 'a'], [3, 0.3, 'o'], [0, 1.3, 'o']],
      [[0, 0.3, 'i'], [4, 0.3, 'a'], [7, 0.3, 'a'], [5, 0.3, 'e'], [4, 1.0, 'a']],
      [[3, 0.5, 'o'], [7, 1.1, 'a'], [5, 0.4, 'a'], [0, 0.9, 'u']],
      [[0, 0.25, 'a'], [1, 0.25, 'a'], [4, 0.9, 'e'], [1, 0.3, 'a'], [0, 1.0, 'o']]];
    const c = pick(C), f0 = 150 * (0.9 + R() * 0.25);
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) { const x = w; this.cue(x, (y) => this.cry(y, f0, c, 0.05 * lv, bus, { cutoff: 4000 })); w += c.reduce((s, q) => s + q[1], 0) + 2.2 + R() * 1.5; }
    return w - t;
  },
  /** The bhishti with his goatskin: water thrown on the dust of the street in sweeps, the leather's squeak, his call. */
  agraBhishti(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) { const x = w; this.cue(x, (y) => { this.burst(y, 0.7, 1700, 0.6, 0.04 * lv, bus, 0.05); this.tone(y, [[0, 200], [0.3, 110]], 0.3, 0.02 * lv, bus); this.creak(y + 0.2, lv * 0.35, bus, true); }); w += 2 + R(); }
    this.cue(t + 1, (y) => this.cry(y, 140, [[0, 0.4, 'a'], [5, 1.0, 'o'], [0, 0.8, 'o']], 0.045 * lv, bus, { cutoff: 3800 }));
    return w - t + 1;
  },
  /** A coppersmith (thathera) beating a brass vessel: strokes in pairs on the ringing metal, one pitch and then another as it is turned. */
  agraHammer(t, bus, lv) {
    const f = 480 + R() * 300;
    let w = t;
    for (let k = 0, n = 14 + Math.floor(R() * 10); k < n; k++) { const x = w, g = k % 4 === 3 ? f * 1.26 : f; this.cue(x, (y) => { this.burst(y, 0.02, 3000, 1, 0.04 * lv, bus); this.struck(y, g, 0.03 * lv, bus, [[1, 1, 0.45], [1.5, 0.5, 0.3], [2.4, 0.3, 0.2], [3.1, 0.2, 0.12]]); }); w += k % 2 ? 0.17 : 0.25; }
    return w - t + 0.5;
  },
  /** The inlayer's lapidary wheel (turned by a bow) and file on marble, the tap of a small hammer on a chisel. */
  agraInlay(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const x = w, d = 1.2 + R() * 1.2;
      this.cue(x, (y) => { this.rasp(y, d, 2600, 1.2, 0.02 * lv, bus, 26, 0.7); });
      this.cue(x + d + 0.2, (y) => { for (let j = 0; j < 3; j++) this.knock(y + j * 0.22, 900 + R() * 150, 0.03 * lv, bus, 0.04); });
      w += d + 1.2 + R();
    }
    return w - t;
  },
  /** A hand mill (chakki) turned: the upper stone's rumble, the handle's knock once a turn, grain trickling. */
  agraGrind(t, bus, lv) {
    const dur = 8 + R() * 6, T = 1.1;
    this.rasp(t, dur, 200, 0.8, 0.035 * lv, bus, 1 / T * 2, 0.8);
    this.rasp(t, dur, 3200, 0.8, 0.006 * lv, bus, 40, 0.8);
    for (let w = t + 0.3; w < t + dur - 0.4; w += T) this.cue(w, (x) => this.tone(x, [[0, 100], [0.08, 60]], 0.1, 0.03 * lv, bus));
    return dur;
  },
  /** Flat bread made: dough slapped from palm to palm, then the iron griddle's sizzle. */
  agraTawa(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) { const x = w; this.cue(x, (y) => this.burst(y, 0.07, k % 2 ? 900 : 1200, 1, 0.05 * lv, bus)); w += 0.32 + R() * 0.1; }
    this.rasp(w, 1.6, 4500, 0.6, 0.014 * lv, bus, 30, 0.6);
    return w - t + 1.6;
  },
  /** A camel (a caravan's) led: the low bell clonking at each stride, soft pads, now and then a groan. */
  agraCamel(t, bus, lv, f) {
    const n = Math.min(40, f ? Math.floor(f.dur / 1.25) : 6), fb = 330 + R() * 90;
    for (let k = 0; k < n; k++) {
      const w = t + k * 1.25;
      this.cue(w, (x) => { this.struck(x, k % 2 ? fb : fb * 1.19, 0.03 * lv, bus, [[1, 1, 0.5], [2.1, 0.4, 0.25]]); this.tone(x, [[0, 80], [0.1, 48]], 0.14, 0.03 * lv, bus); });
    }
    this.cue(t + 1.5 + R() * Math.max(1, n * 0.8), (x) => this.tone(x, [[0, 150], [0.4, 105], [1.1, 75]], 1.1, 0.03 * lv, bus, 'sawtooth', ['bandpass', 420, 2]));
    return n * 1.25 + 1;
  },
  /** A bullock cart: the dry axle creaking at every turn of the wooden wheels, hoofs, the bells at the bullocks' necks. */
  agraCart(t, bus, lv, f) {
    const n = Math.min(40, f ? Math.floor(f.dur / 0.9) : 6);
    for (let k = 0; k < n; k++) {
      const w = t + k * 0.9;
      this.cue(w, (x) => { this.creak(x, lv * 0.6, bus, k % 2 === 0); this.tone(x + 0.3, [[0, 95], [0.1, 55]], 0.12, 0.035 * lv, bus); this.struck(x, 1700 + R() * 300, 0.01 * lv, bus, [[1, 1, 0.2], [1.5, 0.4, 0.1]]); });
    }
    return n * 0.9 + 1;
  },
  /** The night watchman (chowkidar): the staff struck on the ground in fours, a long wordless call between. */
  agraChowkidar(t, bus, lv, f) {
    const n = Math.min(6, f ? Math.max(1, Math.floor(f.dur / 8)) : 2);
    for (let k = 0; k < n; k++) {
      const w = t + k * 8;
      for (let j = 0; j < 4; j++) this.cue(w + j * 0.8, (x) => this.knock(x, 200, 0.07 * lv, bus, 0.08));
      this.cue(w + 3.6, (x) => this.cry(x, 135, [[0, 0.5, 'a'], [5, 1.8, 'o'], [3, 0.5, 'o'], [0, 1.4, 'u']], 0.06 * lv, bus, { cutoff: 3200 }));
    }
    return n * 8;
  },
  /** A Yamuna barge poled along the bank: the pole's knock and the wash at each thrust, the thatch and rope creaking, a boatman's call. */
  agraBoat(t, bus, lv, f) {
    const T = 2.3, n = Math.min(30, f ? Math.floor(f.dur / T) : 6);
    for (let k = 0; k < n; k++) {
      const w = t + k * T;
      this.cue(w, (x) => { this.knock(x, 260, 0.05 * lv, bus, 0.1); this.burst(x + 0.1, 0.8, 600, 0.7, 0.025 * lv, bus, 0.2); });
      if (k % 2) this.cue(w + 1, (x) => this.creak(x, lv * 0.5, bus, false));
    }
    this.cue(t + 3 + R() * 6, (x) => this.cry(x, 140, [[0, 0.5, 'o'], [5, 1.4, 'a'], [3, 0.6, 'o'], [0, 1.0, 'u']], 0.05 * lv, bus, { cutoff: 3600 }));
    return n * T + 1;
  },
  /** A peacock's cry: a harsh two-note scream rising and falling, answered, now and then the short alarm. */
  agraPeacock(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) { const x = w, f = 640 * (1 + k * 0.06); this.cue(x, (y) => { this.tone(y, [[0, f], [0.25, f * 1.45], [0.6, f * 1.1]], 0.65, 0.025 * lv, bus, 'sawtooth', ['bandpass', 1500, 3]); this.tone(y, [[0, f * 1.02], [0.25, f * 1.48], [0.6, f * 1.12]], 0.65, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1800, 3]); }); w += 1.3 + R() * 0.8; }
    return w - t + 0.6;
  },
  /** Rose-ringed parakeets: a few quick shrill 'kee-ak' pairs as they cross the garden. */
  agraParakeet(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) { const x = w, f = 2500 + R() * 700; this.cue(x, (y) => { this.tone(y, [[0, f], [0.07, f * 1.3]], 0.09, 0.012 * lv, bus, 'triangle'); this.tone(y + 0.11, [[0, f * 1.1], [0.09, f * 0.75]], 0.11, 0.012 * lv, bus, 'triangle'); }); w += 0.22 + R() * 0.25; }
    return w - t + 0.3;
  },
  /** Jackals from the river's far bank at night: a wavering howl, then the yipping chorus. */
  agraJackal(t, bus, lv) {
    const f = 520 + R() * 120;
    this.tone(t, [[0, f * 0.7], [0.5, f], [1.2, f * 1.05], [1.8, f * 0.8], [2.6, f * 0.6]], 2.6, 0.03 * lv, bus, 'sawtooth', ['bandpass', 900, 2]);
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) this.cue(t + 3 + k * 0.28 + R() * 0.1, (x) => this.tone(x, [[0, f * 1.1], [0.1, f * 1.5]], 0.12, 0.025 * lv, bus, 'sawtooth', ['bandpass', 1100, 2]));
    return 6.5;
  },
  /** The dhobi at the river: wet cloth swung and beaten on a flat stone, a rinse between, the grunt of the stroke. */
  agraDhobi(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 6); k < n; k++) { const x = w; this.cue(x, (y) => { this.burst(y, 0.1, 800, 1, 0.06 * lv, bus); this.tone(y, [[0, 150], [0.07, 85]], 0.1, 0.04 * lv, bus); this.rasp(y - 0.25, 0.22, 3000, 0.8, 0.012 * lv, bus, 20, 0.5); }); w += 0.85 + R() * 0.25; }
    return w - t + 0.4;
  },
  /** An elephant at the forecourt (visitors dismounted from them): the trumpet, a rumble under it, the bell at its neck. */
  agraElephant(t, bus, lv) {
    this.tone(t, [[0, 380], [0.35, 880], [1.0, 640]], 1.1, 0.04 * lv, bus, 'sawtooth', ['bandpass', 900, 2]);
    this.burst(t, 1, 1400, 1, 0.02 * lv, bus, 0.1);
    this.tone(t + 1.4, [[0, 55], [1.6, 42]], 1.8, 0.05 * lv, bus, 'sine');
    for (let k = 0; k < 2; k++) this.cue(t + 0.5 + k * 1.1, (x) => this.struck(x, 640, 0.02 * lv, bus, [[1, 1, 0.4], [2.2, 0.3, 0.2]]));
    return 3.5;
  },
  /** A hookah's water bubbling as it is drawn: a run of low bubbles, a soft breath out. */
  agraHookah(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) { const x = w; this.cue(x, (y) => this.tone(y, [[0, 160 + R() * 40], [0.06, 320 + R() * 60]], 0.08, 0.025 * lv, bus, 'sine')); w += 0.11 + R() * 0.07; }
    this.burst(w + 0.3, 1.2, 1200, 0.5, 0.008 * lv, bus, 0.3);
    return w - t + 1.6;
  },
  /** Sandals on marble under a high dome: three or four slow steps and their long hollow answer. */
  agraSteps(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const x = w; this.cue(x, (y) => { this.step(y, 0.05 * lv, bus, 'cloth', 1.4); this.tone(y + 0.05, [[0, 95], [0.7, 80]], 0.7, 0.008 * lv, bus, 'sine'); }); w += 0.8 + R() * 0.4; }
    return w - t + 1;
  },
};
addVoices('voices-agra.js', AGRA_VOICES, { agraRecite: 1.6, agraSurna: 1.0, agraNaqara: 0.3, agraHammer: 0.6, agraPeacock: 1.4, agraKarna: 1.0, agraParakeet: 1.0, agraJackal: 1.0 });
