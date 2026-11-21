// The placed voices of Qufu about 1730 (docs/settlements/lu-qufu.md §16; src/settlements/lu-qufu/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `qf`; the engine's own voices that suit (the kitchen, the loom, the abacus, the brush,
// paper, scissors, the well's bucket, the mortar, the clay, tea, the watchman, the hawkers' cries, the dogs and the cicadas) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of the Confucian ritual music of the Qing survives in a form we can use; the instruments are those
// of the Confucian ritual orchestra (the bronze bell chime bianzhong, the stone chime bianqing, the zither qin and se, the drum), the pitches are the five notes of the
// gong mode and the patterns are ours; the Drum Tower's drum, the yamen's drum and gong, the squeal of the single-wheel barrow and the stone roller of the threshing yard
// are the dossier's own things.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 4, 7, 9];                                         // gong mode, five notes, over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const QUFU_VOICES = {
  /** A bronze bell of the chime (bianzhong): one struck note with the long ring and inharmonic partials of a flattened bell, a second now and then. */
  qfBell(t, bus, lv) {
    const root = 130.8 * (R() < 0.5 ? 1 : 2), n = 1 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const f = hz(root, SCALE[Math.floor(R() * 5)]), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.045 * lv, bus, [[1, 1, 3.4], [1.5, 0.5, 2.4], [2.38, 0.3, 1.6], [3.05, 0.14, 1.0], [4.1, 0.07, 0.6]]));
      w += 2.0 + R() * 2.4;
    }
    return w - t + 3;
  },
  /** The stone chime (bianqing): a dry, short, bright knock of a stone, in runs of two or three. */
  qfChime(t, bus, lv) {
    let w = t;
    for (let i = 0, n = 2 + Math.floor(R() * 3); i < n; i++) { const f = hz(392, SCALE[Math.floor(R() * 5)]); this.cue(w, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.5], [2.7, 0.35, 0.25]])); w += 1.1 + R() * 0.9; }
    return w - t + 0.8;
  },
  /** A phrase of the zither (qin / se): slow plucked notes of the five-note mode, each ringing a while. */
  qfZither(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5);
    let w = t, k = Math.floor(R() * 5);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(196, SCALE[k % 5] + 12 * Math.floor(k / 5));
      this.cue(w, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.6], [2, 0.3, 0.8], [3, 0.12, 0.4]]));
      w += 0.8 + R() * 0.9;
    }
    return w - t + 1.8;
  },
  /** The Confucian ritual music rehearsed in the Jinsi Hall: a slow pulse, a bell on the beat, a stone between, the zither's notes in the gaps; wordless, solemn, long. */
  qfYayue(t, bus, lv) {
    const beats = 6 + Math.floor(R() * 3), beat = 3.6 + R() * 0.8;
    let w = t, k = Math.floor(R() * 5);
    for (let i = 0; i < beats; i++) {
      const fb = hz(130.8, SCALE[Math.floor(R() * 3)]), fs = hz(392, SCALE[Math.floor(R() * 5)]);
      this.cue(w, (x) => this.struck(x, fb, 0.045 * lv, bus, [[1, 1, 3.2], [1.5, 0.5, 2.2], [2.38, 0.3, 1.5], [3.05, 0.12, 0.9]]));
      this.cue(w + beat * 0.5, (x) => this.struck(x, fs, 0.026 * lv, bus, [[1, 1, 0.5], [2.7, 0.35, 0.25]]));
      for (let j = 1; j <= 2; j++) { k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2)); const fz = hz(196, SCALE[k % 5] + 12 * Math.floor(k / 5)); this.cue(w + beat * (j * 0.3), (x) => this.struck(x, fz, 0.024 * lv, bus, [[1, 1, 1.5], [2, 0.3, 0.7]])); }
      w += beat;
    }
    return w - t + 3;
  },
  /** The Drum Tower's great drum: a slow roll of low strokes that quickens and ends in three heavy beats (the evening drum, the watches). */
  qfDrum(t, bus, lv) {
    let w = t, gap = 1.0;
    for (let k = 0; k < 14; k++) { this.cue(w, (x) => this.knock(x, 88 + R() * 10, 0.075 * lv, bus, 0.22)); w += gap; gap = Math.max(0.32, gap * 0.87); }
    for (let k = 0; k < 3; k++) this.cue(w + 0.3 + k * 0.9, (x) => this.knock(x, 76, 0.1 * lv, bus, 0.34));
    return w - t + 3.4;
  },
  /** The yamen of the Duke's household opening court (the drum and the gong): three strokes of the drum, then three of the small gong, the cry of the runners (wordless) between. */
  qfYamen(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 1.3, (x) => this.knock(x, 100, 0.08 * lv, bus, 0.3));
    for (let k = 0; k < 3; k++) this.cue(t + 4.6 + k * 1.5, (x) => this.gong(x, 360, 0.04 * lv, bus, 0.8));
    this.cue(t + 9.2, (x) => this.cry(x, 140, [[0, 0.5, 'o'], [-2, 0.9, 'a']], 0.035 * lv, bus, { cutoff: 2600, fem: false }));
    return 11.5;
  },
  /** The single-wheel barrow of the carriers: the high dry squeal of the wooden axle on each turn of the wheel, a low rumble on the beaten road. */
  qfBarrow(t, bus, lv) {
    const d = 7 + R() * 4;
    this.rasp(t, d, 300, 0.7, 0.012 * lv, bus, 7, 0.8);
    for (let w = t + 0.2, k = 0; w < t + d - 0.6; k++, w += 0.85 + R() * 0.12) this.tone(w, [[0, 700 + R() * 90], [0.42, 940 + R() * 120]], 0.55, 0.0045 * lv, bus, 'sawtooth', ['bandpass', 1500, 5]);
    return d + 0.5;
  },
  /** The stone roller of the threshing yard, drawn round by the donkey: a low rumble, the frame's slow creak, the rattle of straw. */
  qfRoller(t, bus, lv) {
    const d = 9 + R() * 5;
    this.rasp(t, d, 200, 0.6, 0.02 * lv, bus, 2.2, 0.85);
    this.rasp(t + 0.4, d - 0.8, 2600, 1.5, 0.003 * lv, bus, 11, 0.9);
    this.tone(t, [[0, 260], [d * 0.5, 300], [d, 250]], d, 0.003 * lv, bus, 'sawtooth', ['bandpass', 520, 7]);
    return d + 0.8;
  },
};
export const QUFU_GAIN = { qfBarrow: 8, qfRoller: 6 };      // measured with tools/sound-render.mjs: their rms was 5e-4 against 1e-2 for the music

addVoices('voices-qufu.js', QUFU_VOICES, QUFU_GAIN);
