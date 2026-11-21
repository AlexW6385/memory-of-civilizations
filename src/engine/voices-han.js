// The placed voices of Han Chang'an about 100 BC (docs/settlements/han-changan.md §15; src/settlements/han-changan/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `han`; the engine's own voices that suit (the smith's hammer, the kitchen, the loom,
// cloth, the jars' lids, the well's bucket, the camel string, the cicadas and birds) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of Han music exists; the instruments are those the dossier names (the bronze bell chime
// bianzhong, the stone chime bianqing, the drum, the zither and the free-reed organ yu); pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 4, 7, 9];                                         // gong mode, five notes, over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const HAN_VOICES = {
  /** A bronze bell of the chime (bianzhong): one struck note, a long ring with the inharmonic partials of a flattened (almond-section) bell, a second note below it now and then. */
  hanBell(t, bus, lv) {
    const root = 146.8 * (R() < 0.5 ? 1 : 2), st = SCALE[Math.floor(R() * 5)], f = hz(root, st), n = 2 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const ff = i ? hz(root, SCALE[Math.floor(R() * 5)]) : f, at = w;
      this.cue(at, (x) => this.struck(x, ff, 0.045 * lv, bus, [[1, 1, 3.2], [1.51, 0.5, 2.2], [2.4, 0.3, 1.5], [3.1, 0.14, 1.0], [4.2, 0.07, 0.6]]));
      w += 1.8 + R() * 2.4;
    }
    return w - t + 3;
  },
  /** The stone chime (bianqing): a dry, short, bright knock of a stone, in runs of two or three. */
  hanStone(t, bus, lv) {
    let w = t;
    for (let i = 0, n = 2 + Math.floor(R() * 3); i < n; i++) { const f = hz(392, SCALE[Math.floor(R() * 5)]); this.cue(w, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.5], [2.7, 0.35, 0.25]])); w += 0.7 + R() * 0.9; }
    return w - t + 0.8;
  },
  /** The market's drum from the tower (the market officer's drum opens and shuts the day): a slow roll of low strokes, quickening, ending in a heavy beat. */
  hanDrum(t, bus, lv) {
    let w = t, gap = 0.9;
    for (let k = 0; k < 12; k++) { this.cue(w, (x) => this.knock(x, 95 + R() * 12, 0.07 * lv, bus, 0.18)); w += gap; gap = Math.max(0.34, gap * 0.88); }
    this.cue(w + 0.2, (x) => this.knock(x, 80, 0.1 * lv, bus, 0.3));
    return w - t + 1.2;
  },
  /** A zither (qin / se) phrase from the court's rehearsal: slow plucked notes of the five-note mode, each ringing a while, now and then two together. */
  hanZither(t, bus, lv) {
    const root = 196, n = 6 + Math.floor(R() * 5);
    let w = t, k = Math.floor(R() * 5);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % 5] + 12 * Math.floor(k / 5)), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.6], [2, 0.3, 0.8], [3, 0.12, 0.4]]));
      if (R() < 0.2) this.cue(at + 0.03, (x) => this.struck(x, f * 1.5, 0.02 * lv, bus, [[1, 1, 1.2]]));
      w += 0.7 + R() * 0.9;
    }
    return w - t + 1.8;
  },
  /** The reed organ (yu / sheng): a held chord of three reeds that swells and fades, a breath of air in it. */
  hanYu(t, bus, lv) {
    const dur = 8 + R() * 6, root = 220, a = hz(root, SCALE[Math.floor(R() * 5)]);
    for (const m of [1, 1.5, 2]) this.tone(t, [[0, a * m], [dur, a * m * 1.002]], dur, 0.007 * lv, bus, 'sawtooth', ['bandpass', 900 * m, 4]);
    return dur + 1;
  },
  /** The watch's call at a gate: wordless, a long falling call of a guard on the wall (the night patrol), from afar. */
  hanWatch(t, bus, lv) {
    for (const [d, f] of [[0, 170], [0.7, 150], [1.5, 125]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.5, 'o'], [-3, 0.6, 'a']], 0.04 * lv, bus, { cutoff: 2400, fem: false }));
    return 3.5;
  },
  /** The foot-treadle pounder (dui) of a ward's house: a dull thud of the stone head falling into the mortar, steady, a pause between runs. */
  hanPounder(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => this.knock(x, 140, 0.05 * lv, bus, 0.12)); w += 1.1 + R() * 0.12; }
    return w - t + 0.8;
  },
  /** The ox-cart on packed earth: the slow creak of the axle and a low rumble, a cry to the ox. */
  hanCart(t, bus, lv) {
    const d = 5 + R() * 3;
    this.rasp(t, d, 420, 0.7, 0.014 * lv, bus, 5 + R() * 3, 0.8);
    this.tone(t, [[0, 330], [d * 0.5, 360], [d, 320]], d, 0.004 * lv, bus, 'sawtooth', ['bandpass', 700, 6]);
    return d + 0.5;
  },
};
export const HAN_GAIN = {};

addVoices('voices-han.js', HAN_VOICES, HAN_GAIN);
