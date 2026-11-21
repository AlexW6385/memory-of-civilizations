// The placed voices of Djenne, 14th c. (docs/settlements/djenne.md 20.3; src/settlements/djenne/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `dj`. All synthesised, no samples. [inferred throughout: no recording exists;
// the instruments are those the dossier names (the griot's kora and the balafon, section 9); the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 4, 7, 9];                                          // a pentatonic over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const DJ_VOICES = {
  /** The kora: a run of plucked strings over a steady ostinato, bright and short-ringing. */
  djKora(t, bus, lv) {
    const root = 330, n = 14 + Math.floor(R() * 10);
    let w = t, k = Math.floor(R() * 5);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % 5] + 12 * Math.floor(k / 5)), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.026 * lv, bus, [[1, 1, 0.9], [2, 0.4, 0.5], [3, 0.16, 0.3], [4.01, 0.06, 0.2]]));
      if (i % 2 === 0) this.cue(at + 0.002, (x) => this.struck(x, hz(root, SCALE[(k + 2) % 5] - 12), 0.016 * lv, bus, [[1, 1, 1.2], [2, 0.3, 0.6]]));
      w += 0.2 + R() * 0.12;
    }
    return w - t + 1.2;
  },
  /** The balafon: struck wooden bars in quick pairs and runs, each dying fast, with the gourd resonators' buzz. */
  djBalafon(t, bus, lv) {
    const root = 262, n = 10 + Math.floor(R() * 10);
    let w = t, k = 2 + Math.floor(R() * 4);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % 5] + 12 * Math.floor(k / 5));
      this.cue(w, (x) => { this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.22], [3.9, 0.3, 0.08], [9.2, 0.08, 0.04]]); this.rasp(x, 0.2, 2200, 1.5, 0.006 * lv, bus, 90, 0.8); });
      if (R() < 0.5) this.cue(w + 0.11, (x) => this.struck(x, f * 1.5, 0.02 * lv, bus, [[1, 1, 0.2], [3.9, 0.25, 0.07]]));
      w += 0.17 + R() * 0.14;
    }
    return w - t + 0.8;
  },
  /** The smith's bellows: two skin bags pressed in turn, a breath of air through the tuyere, the charcoal's hiss. */
  djBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.6, 1800, 0.5, 0.012 * lv, bus, 6, 0.4); w += 0.7 + R() * 0.1; }
    return w - t + 0.4;
  },
  /** Pestles in a mortar: two women pounding millet in turn, a dull knock and its answer, a pause to turn the grain. */
  djPound(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) {
      this.cue(w, (x) => this.knock(x, 130 + (k % 2) * 25, 0.07 * lv, bus, 0.12));
      w += 0.52 + (k % 2 ? 0.08 : 0) + R() * 0.03;
    }
    return w - t + 0.8;
  },
  /** A pirogue's pole in the water: the knock of the pole on the bottom and the drip as it comes up, a slow rhythm. */
  djPole(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => { this.knock(x, 170, 0.04 * lv, bus, 0.1); this.rasp(x + 0.15, 0.5, 2600, 0.8, 0.008 * lv, bus, 30, 0.8); }); w += 2.3 + R() * 0.6; }
    return w - t + 1;
  },
  /** The Qur'anic school: a teacher's line and the pupils' answer in a sing-song murmur, wordless, rising and falling on a few notes. */
  djRecite(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      const f = 130 + R() * 20;
      this.cue(w, (x) => this.cry(x, f, [[0, 0.5, 'a'], [3, 0.5, 'o'], [1, 0.6, 'a'], [-2, 0.7, 'o']], 0.03 * lv, bus, { cutoff: 2200, fem: false }));
      this.cue(w + 2.4, (x) => this.cry(x, f * 1.12, [[0, 0.5, 'a'], [3, 0.5, 'o'], [1, 0.6, 'a'], [-2, 0.7, 'o']], 0.045 * lv, bus, { cutoff: 2000, fem: R() < 0.5 }));
      w += 5 + R() * 2;
    }
    return w - t + 1.5;
  },
  /** A market call: a seller's wordless cry, two falling notes, now from a man, now from a woman. */
  djCall(t, bus, lv) {
    const f = 150 + R() * 70, fem = R() < 0.5;
    this.cry(t, fem ? f * 1.6 : f, [[0, 0.5, 'a'], [-3, 0.7, 'o']], 0.04 * lv, bus, { cutoff: 2800, fem });
    return 2;
  },
};
addVoices('voices-djenne.js', DJ_VOICES);
