// The placed voices of Qin Xianyang about 210 BC (docs/settlements/qin-xianyang.md §12; src/settlements/qin-xianyang/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `qin`; the engine's own voices that suit (the hammer, the kitchen, the loom, the chisel, the
// brush, the sack, the well's bucket, clay, cicadas and birds) are used by the map as they are. (The engine's `qin` is the zither; these are the town's.)
// All synthesised, no samples. [inferred throughout: no recording of Qin sound exists; the dossier names the palace's bronze bells, the beat of the rammers with their
// chant, the kiln's roar, the carts' axles, the market's drum; pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);

export const QIN_VOICES = {
  /** A bronze bell of the palace's set (zhong): a struck note with the inharmonic partials of a flat-mouthed bell, a long ring, two or three strokes of a descending run. */
  qinChime(t, bus, lv) {
    const root = 130.8, steps = [0, 3, 5, 7, 10], n = 2 + Math.floor(R() * 3);
    let w = t, k = 4;
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(4, k - (R() < 0.7 ? 1 : 0)));
      const f = hz(root, steps[k] + (R() < 0.3 ? 12 : 0));
      this.cue(w, (x) => this.struck(x, f, 0.045 * lv, bus, [[1, 1, 3.4], [1.5, 0.5, 2.3], [2.42, 0.3, 1.5], [3.2, 0.13, 1.0], [4.3, 0.06, 0.6]]));
      w += 1.9 + R() * 2.2;
    }
    return w - t + 3;
  },
  /** The market's drum from the tower (the officer's drum opens and shuts the market): a slow roll of low strokes, quickening, ending in a heavy beat. */
  qinDrum(t, bus, lv) {
    let w = t, gap = 1.0;
    for (let k = 0; k < 14; k++) { this.cue(w, (x) => this.knock(x, 88 + R() * 10, 0.075 * lv, bus, 0.2)); w += gap; gap = Math.max(0.36, gap * 0.89); }
    this.cue(w + 0.2, (x) => this.knock(x, 74, 0.11 * lv, bus, 0.34));
    return w - t + 1.3;
  },
  /** The watch's clapper: two hard wooden knocks and a pause, three times, from a lane's gate (the night's watch calling the hour) [inferred]. */
  qinWatch(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 3; k++) { this.cue(w, (x) => this.knock(x, 820, 0.05 * lv, bus, 0.05)); this.cue(w + 0.38, (x) => this.knock(x, 760, 0.045 * lv, bus, 0.05)); w += 1.7; }
    return w - t + 0.6;
  },
  /** The rammers (hang-tu): a gang of labourers beating the earth, a dull thud of the stone ram in a steady stroke, one voice calling a short chant over every fourth. */
  qinRammer(t, bus, lv) {
    let w = t;
    const n = 12 + Math.floor(R() * 8), beat = 0.78 + R() * 0.1;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 110, 0.06 * lv, bus, 0.16); this.burst(x, 0.1, 380, 0.8, 0.02 * lv, bus); });
      if (k % 4 === 0) this.cue(w + beat * 0.3, (x) => this.cry(x, 150, [[0, 0.5, 'o'], [-2, 0.45, 'a']], 0.035 * lv, bus, { cutoff: 2200, fem: false }));
      w += beat;
    }
    return w - t + 1;
  },
  /** The kiln's roar: the draught of a great updraught kiln under fire, a low breath of noise with a slow swell, a pop of settling logs now and then. */
  qinKiln(t, bus, lv) {
    const d = 9 + R() * 5;
    this.rasp(t, d, 190, 0.5, 0.03 * lv, bus, 0.35, 0.7);
    this.rasp(t, d, 520, 0.7, 0.01 * lv, bus, 2.4, 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.knock(x, 260, 0.03 * lv, bus, 0.06));
    return d + 1;
  },
  /** The sledge gang: the timber runners dragged over packed earth, a rope's creak, the haulers' short call on the stroke. */
  qinSledge(t, bus, lv) {
    const d = 7 + R() * 4;
    this.rasp(t, d, 300, 0.6, 0.02 * lv, bus, 1.6, 0.85);
    this.tone(t, [[0, 210], [d * 0.5, 235], [d, 205]], d, 0.004 * lv, bus, 'sawtooth', ['bandpass', 640, 6]);
    for (let k = 0, n = Math.floor(d / 2.1); k < n; k++) this.cue(t + 0.6 + k * 2.1, (x) => this.cry(x, 140, [[0, 0.4, 'o']], 0.025 * lv, bus, { cutoff: 2000, fem: false }));
    return d + 0.5;
  },
  /** A ward gate's bar dropped or lifted: the heavy knock of a timber bar into its brackets, the leaves' creak, a second knock. */
  qinGate(t, bus, lv) {
    this.rasp(t, 1.1, 480, 0.8, 0.016 * lv, bus, 6, 0.8);
    this.cue(t + 1.2, (x) => this.knock(x, 150, 0.08 * lv, bus, 0.14));
    this.cue(t + 1.65, (x) => this.knock(x, 175, 0.05 * lv, bus, 0.1));
    return 2.6;
  },
  /** The ox-cart on packed earth: a slow creak of the axle and a low rumble. */
  qinCart(t, bus, lv) {
    const d = 5 + R() * 3;
    this.rasp(t, d, 400, 0.7, 0.014 * lv, bus, 4 + R() * 3, 0.8);
    this.tone(t, [[0, 320], [d * 0.5, 350], [d, 310]], d, 0.004 * lv, bus, 'sawtooth', ['bandpass', 680, 6]);
    return d + 0.5;
  },
  /** The pit's lamps: the small tick and sputter of oil lamps in a long cold hall, and the draught along the corridors. */
  qinLamp(t, bus, lv) {
    const d = 6 + R() * 4;
    this.rasp(t, d, 260, 0.4, 0.008 * lv, bus, 0.3, 0.8);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.5 + R() * (d - 1), (x) => this.burst(x, 0.05, 2600, 1, 0.012 * lv, bus));
    return d + 0.5;
  },
};
export const QIN_GAIN = {};

addVoices('voices-qin.js', QIN_VOICES, QIN_GAIN);
