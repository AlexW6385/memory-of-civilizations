// The placed voices of a Dogon village, c. 1930 (docs/settlements/dogon.md §16.3; src/settlements/dogon/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `dg`. All synthesised, no samples. [inferred throughout: no recording of
// this village exists; the dossier names millet pounded with work songs, call-and-response greetings, drums, the rattle of calabashes (§10), the
// smith's bellows (§12); pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const PENT = [0, 2, 4, 7, 9];

export const DG_VOICES = {
  /** Millet pounded in a wooden mortar by two women in turn: a deep knock, its answer a shade higher, the little ring of the pestle's rebound; a pause to turn the grain. */
  dgPound(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 12 + Math.floor(R() * 10); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 105 + (k % 2) * 22, 0.08 * lv, bus, 0.14); this.burst(x, 0.03, 900, 0.8, 0.02 * lv, bus); });
      w += 0.46 + (k % 2 ? 0.07 : 0) + R() * 0.03;
      if (k % 8 === 7) w += 0.9 + R() * 0.6;
    }
    return w - t + 0.8;
  },
  /** A pounding song: one woman's phrase on a few notes, the others' answer a beat later, wordless, in time with the pestles. */
  dgSong(t, bus, lv) {
    let w = t;
    const f = 190 + R() * 25;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const a = PENT[Math.floor(R() * 5)], b = PENT[Math.floor(R() * 5)];
      this.cue(w, (x) => this.cry(x, f, [[a, 0.45, 'a'], [b, 0.5, 'o'], [a - 2, 0.7, 'a']], 0.03 * lv, bus, { cutoff: 2400, fem: true }));
      this.cue(w + 2.1, (x) => this.cry(x, f * 1.02, [[a, 0.5, 'o'], [b, 0.5, 'a'], [a - 5, 0.8, 'o']], 0.036 * lv, bus, { cutoff: 2200, fem: true }));
      w += 4.6 + R() * 1.2;
    }
    return w - t + 1.5;
  },
  /** The smith's bellows: two goatskin bags pressed in turn, the breath through the tuyere, the charcoal's hiss. */
  dgBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.55, 1700, 0.5, 0.012 * lv, bus, 6, 0.4); w += 0.62 + R() * 0.1; }
    return w - t + 0.4;
  },
  /** A single-skin drum struck with a curved stick and the hand: a few open tones and a muted slap, a short phrase, then silence (not a funeral drum: no rite is made). */
  dgDrum(t, bus, lv) {
    let w = t;
    const pat = [0, 0.5, 0.75, 1.5, 2.0, 2.25, 3.0], tone = 120 + R() * 25;
    for (let rep = 0; rep < 3; rep++) for (const [i, p] of pat.entries()) {
      const at = w + p * 0.42 + rep * 3.4 * 0.42;
      this.cue(at, (x) => { if (i % 3 === 2) this.knock(x, tone * 1.9, 0.05 * lv, bus, 0.05); else this.knock(x, tone, 0.09 * lv, bus, 0.22); });
    }
    return 3 * 3.4 * 0.42 + 1.2;
  },
  /** The rattle of a rod hung with calabashes, shaken in short runs. */
  dgRattle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.16, 4200, 1.2, 0.02 * lv, bus, 60, 0.8); w += 0.2 + R() * 0.08; }
    return w - t + 0.5;
  },
  /** The bird-scarer's cord of dry gourds clacking together in a gust. */
  dgGourd(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => this.knock(x, 700 + R() * 300, 0.025 * lv, bus, 0.04)); w += 0.08 + R() * 0.25; }
    return w - t + 0.3;
  },
  /** The daba (hoe) in the millet's stubble: a dull chop and the drag, at a farmer's steady pace. */
  dgHoe(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 150, 0.05 * lv, bus, 0.08); this.rasp(x + 0.08, 0.25, 1400, 0.6, 0.007 * lv, bus, 20, 0.5); }); w += 1.5 + R() * 0.7; }
    return w - t + 0.8;
  },
  /** A greeting called across a lane: a long question, the answer in kind (the long Dogon greetings run back and forth), wordless, a man and a woman. */
  dgGreet(t, bus, lv) {
    const f = 140 + R() * 40;
    this.cry(t, f, [[0, 0.4, 'a'], [3, 0.4, 'o'], [0, 0.5, 'a'], [-2, 0.6, 'o']], 0.04 * lv, bus, { cutoff: 2500, fem: false });
    this.cry(t + 2.2, f * 1.7, [[0, 0.4, 'a'], [2, 0.4, 'o'], [-1, 0.7, 'a']], 0.04 * lv, bus, { cutoff: 2800, fem: true });
    if (R() < 0.6) this.cry(t + 4.2, f * 1.05, [[0, 0.5, 'o'], [-3, 0.7, 'a']], 0.03 * lv, bus, { cutoff: 2300, fem: false });
    return 6;
  },
  /** A well's rope and bucket: the cord's creak over the pole, a splash far down, the dripping bucket drawn up. */
  dgWell(t, bus, lv) {
    this.rasp(t, 1.1, 900, 2, 0.01 * lv, bus, 25, 0.5);
    this.cue(t + 1.3, (x) => this.drip(x, 1.2 * lv, bus));
    this.rasp(t + 2.2, 1.4, 800, 2, 0.01 * lv, bus, 25, 0.5);
    for (let k = 0; k < 5; k++) this.cue(t + 3.7 + k * 0.28, (x) => this.drip(x, 0.6 * lv, bus));
    return 5.5;
  },
};
addVoices('voices-dogon.js', DG_VOICES);
