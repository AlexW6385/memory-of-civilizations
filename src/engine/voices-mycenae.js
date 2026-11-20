// The placed voices of Mycenae about 1250 BC (docs/settlements/mycenae.md §16.3; src/settlements/mycenae/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `my`; the engine's own voices that suit (the smith's hammer, the potter's wheel and clay, the kitchen,
// the jars' lids, the well's bucket, goats, sheep bells, donkeys, dogs, the owl, cicadas) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: no recording of Mycenaean music or work exists; the lyre is the instrument of the bard in the Pylos megaron's fresco and of Mycenaean seals and vases, the
// quern, the loom weights and the bellows are the commonest finds of its houses; pitches and patterns are ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const MODE = [0, 2, 3, 7, 8];                                          // a five-note mode over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const MY_VOICES = {
  /** The bard's lyre: a seven-string frame lyre, a slow phrase of plucked strings over a drone of the open string, each note ringing and dying. */
  myLyre(t, bus, lv) {
    const root = 196, n = 7 + Math.floor(R() * 6);
    let w = t, k = Math.floor(R() * MODE.length);
    this.cue(t, (x) => this.struck(x, root, 0.03 * lv, bus, [[1, 1, 1.8], [2, 0.3, 1.0], [3, 0.12, 0.5]]));
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(MODE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const f = hz(root, MODE[k % MODE.length] + 12 * Math.floor(k / MODE.length)), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.028 * lv, bus, [[1, 1, 1.2], [2, 0.3, 0.7], [3, 0.12, 0.4], [4.02, 0.05, 0.25]]));
      w += 0.5 + R() * 0.9;
    }
    return w - t + 1.6;
  },
  /** The saddle quern in a house: the upper stone pushed and drawn over the lower, a dry scrape each way, a steady beat, a pause to sweep the meal. */
  myQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.5, 1200 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.8; }
    this.rasp(w + 0.2, 0.5, 2300, 0.7, 0.012 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** The smith's bellows: a goatskin bag pressed and drawn, a soft rush of air each stroke through the clay nozzle, the coals answering with a hiss. */
  myBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.55, 700 + R() * 200, 0.6, 0.02 * lv, bus, 5, 0.6); this.rasp(w + 0.15, 0.4, 3000, 0.5, 0.006 * lv, bus, 18, 0.8); w += 1.1 + R() * 0.3; }
    return w - t + 0.5;
  },
  /** The clay loom weights: the weaver beats the weft up, a soft double knock of the weights and the beater's thud, a pause for the shed. */
  myLoomWeights(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 200, 0.05 * lv, bus, 0.09); this.knock(x + 0.07, 330, 0.03 * lv, bus, 0.05); });
      w += 1.2 + R() * 1.6;
    }
    return w - t + 1;
  },
  /** The sentry's call from the wall: wordless, two long falling notes, answered after a breath by the next post; carries far over the ravine. */
  myGuardCall(t, bus, lv) {
    for (const [d, f] of [[0, 150], [2.6, 140]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.9, 'a'], [-4, 0.9, 'o']], 0.05 * lv, bus, { cutoff: 2200, fem: false }));
    return 5;
  },
  /** A drover to his pack-asses on the road: wordless, a rising call and two falling notes, from a distance. */
  myDrover(t, bus, lv) {
    for (const [d, f] of [[0, 160], [0.6, 190], [1.3, 150]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.4, 'o'], [-3, 0.5, 'a']], 0.04 * lv, bus, { cutoff: 2600, fem: false }));
    return 3;
  },
  /** Winnowing on a threshing floor (in the weeks of the harvest, early summer): the fan thrown up, a soft rush of chaff and grain falling, a pause, again. */
  myWinnow(t, bus, lv) {
    const on = Math.max(inSeason(seasonDoy(this), 140, 200, 12), 0.15);
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.5, 2600, 0.8, 0.07 * lv * on, bus, 6, 0.8); this.rasp(w + 0.2, 0.7, 1500, 0.6, 0.03 * lv * on, bus, 12, 0.7); w += 1.4 + R() * 0.8; }
    return w - t + 1;
  },
};

addVoices('voices-mycenae.js', MY_VOICES);
