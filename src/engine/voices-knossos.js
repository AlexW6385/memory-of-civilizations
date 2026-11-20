// The placed voices of Knossos about 1600 BC (docs/settlements/knossos.md §20.3; src/settlements/knossos/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `kn`; the engine's own voices that suit (the potter's wheel and clay, the smith's
// hammer, the kitchen, the jars' lids, the well's bucket, cloth, the cicadas and birds) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of Minoan music or work exists; the instruments are those the dossier names (the lyre, the double
// pipe, the rattle: Hagia Triada sarcophagus and the Harvester Vase, both later than 1600 BC, the rattle model of Archanes 2000-1800 BC), the pitches and
// patterns are ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 2, 3, 7, 9];                                         // a five-note mode (D dorian-ish pentatonic) over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const KN_VOICES = {
  /** A lyre: a slow phrase of plucked strings, each ringing and dying (a few partials), now and then two strings together. */
  knLyre(t, bus, lv) {
    const root = 220, n = 6 + Math.floor(R() * 5);
    let w = t, k = Math.floor(R() * SCALE.length);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const st = SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length), f = hz(root, st), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.3], [2, 0.32, 0.7], [3, 0.14, 0.4], [4.02, 0.06, 0.25]]));
      if (R() < 0.25) this.cue(at + 0.02, (x) => this.struck(x, f * 1.5, 0.02 * lv, bus, [[1, 1, 1.0], [2, 0.25, 0.5]]));
      w += 0.55 + R() * 0.7;
    }
    return w - t + 1.4;
  },
  /** The double pipe: a held drone on the tonic from the second pipe, a reedy line over it that settles back on the tonic. */
  knAulos(t, bus, lv) {
    const dur = 14 + R() * 8, root = 196;
    this.tone(t, [[0, root], [dur, root]], dur, 0.012 * lv, bus, 'sawtooth', ['bandpass', 800, 3]);
    let w = t + 1.5, k = 2;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(8, k + Math.floor(R() * 3) - 1));
      const st = SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length), f = hz(root * 2, st), len = 0.5 + R() * 1.4;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.985], [0.08, f], [len, f * 1.004]], len, 0.018 * lv, bus, 'sawtooth', ['bandpass', 1500, 4]));
      w += len + 0.1 + R() * 0.4;
    }
    return dur + 1;
  },
  /** The rattle shaken in the rite: runs of tiny struck discs, a handful of shakes. */
  knSistrum(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 3 + Math.floor(R() * 4); s < ns; s++) {
      for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) this.cue(w + k * 0.045, (x) => this.struck(x, 3200 + R() * 1400, 0.008 * lv, bus, [[1, 1, 0.06], [1.7, 0.4, 0.04]]));
      w += 0.7 + R() * 0.8;
    }
    return w - t + 0.4;
  },
  /** The saddle quern: the upper stone pushed and drawn over the lower, a dry scrape each way, in a steady rhythm; a pause to sweep the meal. */
  knQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.5, 1300 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.8; }
    this.rasp(w + 0.2, 0.5, 2400, 0.7, 0.012 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** The bow drill of the lapidary: the whirr of the bit backward and forward as the bow is drawn, the drill's sand hiss, now and then a tap of the stone. */
  knBowDrill(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.55, 2600 + R() * 400, 1.2, 0.016 * lv, bus, 26, 0.85); w += 0.62 + R() * 0.12; if (R() < 0.12) this.cue(w, (x) => this.knock(x, 520, 0.02 * lv, bus, 0.05)); }
    return w - t + 0.6;
  },
  /** The clay loom weights: the weaver beats the weft up, a soft double knock of the weights against each other and the beater's thud, a pause for the shed. */
  knLoomWeights(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 210, 0.05 * lv, bus, 0.09); this.knock(x + 0.07, 340, 0.03 * lv, bus, 0.05); });
      w += 1.2 + R() * 1.6;
    }
    return w - t + 1;
  },
  /** The Kairatos over its stones: a long breath of water noise, louder in the wet months (winter and spring), a trickle in the dry summer. */
  knBrook(t, bus, lv) {
    const wet = 0.3 + 0.7 * Math.max(inSeason(seasonDoy(this), 290, 140, 20), 0), d = 7 + R() * 4;
    this.rasp(t, d, 900 + R() * 300, 0.5, 0.024 * lv * wet, bus, 9 + R() * 4, 0.5);
    this.rasp(t + 0.3, d - 0.6, 2400, 0.7, 0.008 * lv * wet, bus, 17, 0.7);
    return d;
  },
  /** Porters' call along the Royal Road: wordless, two falling notes of a man to his donkey, from a distance. */
  knDrover(t, bus, lv) {
    for (const [d, f] of [[0, 190], [0.5, 165], [1.2, 140]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.4, 'o'], [-3, 0.5, 'a']], 0.04 * lv, bus, { cutoff: 2600, fem: false }));
    return 3;
  },
};

addVoices('voices-knossos.js', KN_VOICES);
