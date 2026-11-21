// The placed voices of Karakorum, 1254 (docs/settlements/mongol-karakorum.md §14.3; src/settlements/mongol-karakorum/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `kk`; the engine's own voices that suit (the smith's hammer, the kitchen, the jars' lids, the
// wheel and clay, the well's bucket, cloth, the pouring) are used by the map as they are. All synthesised, no samples. [inferred throughout: no recording of 13th-century
// Mongol music or work exists; what is stated is only that the things sounded: Rubruck's kumiss churned with a stick "as big as a man's head at its lower end and hollowed
// out", the silver tree's hidden trumpeter, the bells and idol-temples; the horse-head fiddle is later than 1254 but of the type the court's strings are given in the dossier.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const PENT = [0, 2, 4, 7, 9];

export const KK_VOICES = {
  /** The horse-head fiddle: two strings bowed, a drone on the lower and a slow melody on the upper with long slides, a pentatonic line settling to the tonic. */
  kkMorin(t, bus, lv) {
    const root = 146.8, dur = 16 + R() * 8;
    this.tone(t, [[0, root], [dur, root]], dur, 0.011 * lv, bus, 'sawtooth', ['bandpass', 520, 2.5]);
    let w = t + 1.2, k = 3;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(8, k + Math.floor(R() * 3) - 1));
      const f = hz(root * 2, PENT[k % 5] + 12 * Math.floor(k / 5)), len = 0.8 + R() * 1.8, slide = R() < 0.4 ? 0.94 : 1;
      this.cue(w, (x) => this.tone(x, [[0, f * slide], [0.15, f], [len, f * 1.003]], len, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1100, 3]));
      w += len + 0.08 + R() * 0.35;
    }
    return dur + 1;
  },
  /** A long song: one voice holding a vowel for many seconds with a slow wave in it, rising and falling by a fourth or a fifth, then the next phrase. */
  kkLongSong(t, bus, lv) {
    let w = t;
    for (let ph = 0, n = 2 + Math.floor(R() * 2); ph < n; ph++) {
      const base = 150 + R() * 40, d = 4 + R() * 3;
      this.cue(w, (x) => this.cry(x, base, [[0, 0.6, 'o'], [4, 1.2, 'a'], [-2, d - 1.8, 'o']], 0.034 * lv, bus, { cutoff: 2400, fem: R() < 0.5 }));
      w += d + 0.8 + R() * 1.5;
    }
    return w - t + 0.6;
  },
  /** The churn: the stick with its hollow head struck down into the skin of mare's milk, a dull thud and the slosh, over and over [stated: Rubruck, ch. 4]. */
  kkChurn(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 14 + Math.floor(R() * 12); k < n; k++) { this.knock(w, 110 + R() * 25, 0.05 * lv, bus, 0.12); this.rasp(w + 0.06, 0.3, 700, 0.6, 0.012 * lv, bus, 14, 0.7); w += 0.62 + R() * 0.12; }
    return w - t + 0.8;
  },
  /** Felt beaten: the wool laid on a hide and struck with rods, a quick patter of soft knocks in pairs. */
  kkFeltBeat(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 12 + Math.floor(R() * 10); k < n; k++) { this.knock(w, 180, 0.035 * lv, bus, 0.07); this.knock(w + 0.13, 150, 0.03 * lv, bus, 0.07); w += 0.48 + R() * 0.1; }
    return w - t + 0.5;
  },
  /** The water-powered bellows of the forges [stated: UW]: a long breath of air through a nozzle, rising and dying away, with the roar of the fire under it. */
  kkBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 1.3, 900, 0.5, 0.03 * lv, bus, 6, 0.4); this.rasp(w + 0.1, 1.1, 2600, 0.6, 0.01 * lv, bus, 9, 0.5); w += 1.9; }
    return w - t + 0.4;
  },
  /** The kiln's fire: a low roar with a crackle in it, long. */
  kkKilnRoar(t, bus, lv) {
    const d = 9 + R() * 5;
    this.rasp(t, d, 260, 0.5, 0.03 * lv, bus, 5, 0.5); this.rasp(t + 0.4, d - 0.8, 1800, 0.8, 0.007 * lv, bus, 30, 0.9);
    return d;
  },
  /** The temple's drum and bell: a slow deep drum in threes, a bronze bell after, ringing out [inferred: the idol-temples of the Chinese quarter]. */
  kkTempleDrum(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 6 + Math.floor(R() * 4); k++) { this.knock(w, 82, 0.09 * lv, bus, 0.35); w += 1.4 + (k % 3 === 2 ? 1.0 : 0); }
    this.cue(w + 0.4, (x) => this.struck(x, 330, 0.03 * lv, bus, [[1, 1, 3.5], [2.7, 0.4, 2.2], [5.4, 0.15, 1.2]]));
    return w - t + 4;
  },
  /** The semantron: a long board struck with a mallet in a rolling pattern, the Nestorian church's call [inferred]. */
  kkBoard(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 6); k < n; k++) { this.knock(w, 640 + (k % 3) * 60, 0.04 * lv, bus, 0.08); w += k < 4 ? 0.7 - k * 0.12 : 0.22 + (k % 3 === 2 ? 0.3 : 0); }
    return w - t + 0.6;
  },
  /** A caravan camel's wooden bell: a dull double clack at the camel's stride, now and then a pause. */
  kkCamelBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.knock(w, 420, 0.03 * lv, bus, 0.05); this.knock(w + 0.11, 520, 0.025 * lv, bus, 0.05); w += 1.0 + R() * 0.25; }
    return w - t + 0.5;
  },
  /** The silver tree's trumpeter, hidden below: a brass blast of two notes when the drink is wanted [stated: Rubruck via Public Domain Review: the angel's trumpet blown by a man beneath]. */
  kkTrumpet(t, bus, lv) {
    for (const [d, f] of [[0, 233], [0.9, 311]]) this.tone(t + d, [[0, f * 0.97], [0.08, f], [0.8, f]], 0.85, 0.02 * lv, bus, 'sawtooth', ['lowpass', 1500, 1]);
    return 2.2;
  },
  /** A herdsman's call to his horses or sheep, wordless: a rising shout and a falling one from far off. */
  kkHerd(t, bus, lv) {
    for (const [d, f, n] of [[0, 150, 4], [1.0, 190, -5]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.5, 'a'], [n, 0.7, 'o']], 0.04 * lv, bus, { cutoff: 2600, fem: false }));
    return 3;
  },
  /** The wind in the standards of the court: cloth snapping and the poles creaking. */
  kkBanner(t, bus, lv) {
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) this.cue(t + k * (0.3 + R() * 0.3), (x) => this.rasp(x, 0.22, 2200, 0.7, 0.012 * lv, bus, 40, 0.9));
    this.rasp(t, 2.5, 380, 1.2, 0.006 * lv, bus, 3, 0.4);
    return 3;
  },
};

addVoices('voices-karakorum.js', KK_VOICES);
