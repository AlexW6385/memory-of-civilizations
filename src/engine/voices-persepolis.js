// The placed voices of Persepolis about 480 BC (docs/settlements/persepolis.md §23.3; src/settlements/persepolis/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `per`; the engine's own voices that suit (the hammer, the chisel, the plane, the potter's
// wheel and clay, the kitchen, the jars' lids, the pour, the well's bucket, cloth) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of Achaemenid music or work exists; the instruments are those the reliefs and finds of the Near
// East give (the arched harp and the double pipe of the Assyrian and Persian courts, the frame drum), the pitches and patterns are ours; the camels' bells and the
// drivers' calls are those of any caravan road.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 1, 4, 5, 7, 8, 11];                                  // a mode with the augmented second (an east-Mediterranean colour) over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const PER_VOICES = {
  /** The arched harp of the court: a slow phrase of plucked strings, each ringing and dying, now and then two together. */
  perHarp(t, bus, lv) {
    const root = 196, n = 7 + Math.floor(R() * 5);
    let w = t, k = Math.floor(R() * SCALE.length);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const st = SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length), f = hz(root, st), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.5], [2, 0.3, 0.8], [3, 0.12, 0.45], [4.03, 0.05, 0.25]]));
      if (R() < 0.3) this.cue(at + 0.02, (x) => this.struck(x, f * 1.5, 0.018 * lv, bus, [[1, 1, 1.0], [2, 0.25, 0.5]]));
      w += 0.5 + R() * 0.8;
    }
    return w - t + 1.5;
  },
  /** The double pipe: a drone on the tonic from the second pipe, a reedy line over it that settles on the tonic. */
  perPipe(t, bus, lv) {
    const dur = 12 + R() * 8, root = 174.6;
    this.tone(t, [[0, root], [dur, root]], dur, 0.011 * lv, bus, 'sawtooth', ['bandpass', 700, 3]);
    let w = t + 1.4, k = 2;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 3) - 1));
      const st = SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length), f = hz(root * 2, st), len = 0.45 + R() * 1.3;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.985], [0.07, f], [len, f * 1.004]], len, 0.017 * lv, bus, 'sawtooth', ['bandpass', 1400, 4]));
      w += len + 0.1 + R() * 0.4;
    }
    return dur + 1;
  },
  /** The frame drum: a slow pattern of deep strokes and rim taps (the signal and the dance of the court). */
  perDrum(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      const deep = k % 4 === 0 || k % 4 === 2;
      this.cue(w, (x) => { this.knock(x, deep ? 105 : 240, (deep ? 0.07 : 0.03) * lv, bus, deep ? 0.18 : 0.05); if (!deep) this.burst(x, 0.012, 3200, 2, 0.012 * lv, bus); });
      w += k % 4 === 1 ? 0.3 : 0.55;
    }
    return w - t + 1;
  },
  /** The bells of a camel train: a dull clank from the two bronze bells at each camel's neck, out of step with each other. */
  perCamelBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) {
      const f = 380 + R() * 140;
      this.cue(w, (x) => this.struck(x, f, 0.014 * lv, bus, [[1, 1, 0.5], [2.4, 0.3, 0.25], [3.9, 0.1, 0.12]]));
      if (R() < 0.6) this.cue(w + 0.17, (x) => this.struck(x, f * 1.32, 0.01 * lv, bus, [[1, 1, 0.4], [2.4, 0.25, 0.2]]));
      w += 0.85 + R() * 0.35;
    }
    return w - t + 0.6;
  },
  /** The grain on the saddle quern: the upper stone pushed and drawn, a dry scrape each way, in a steady rhythm. */
  perQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 9 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.5, 1250 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.78; }
    this.rasp(w + 0.2, 0.5, 2300, 0.7, 0.012 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** The water of the street channels (qanat water in its stone-lined rills): a low steady breath, a little more in the spring melt and none missed in the dry months. */
  perRill(t, bus, lv) {
    const melt = 0.5 + 0.5 * Math.max(inSeason(seasonDoy(this), 40, 140, 20), 0), d = 6 + R() * 4;
    this.rasp(t, d, 1000 + R() * 300, 0.5, 0.012 * lv * melt, bus, 8 + R() * 4, 0.5);
    this.rasp(t + 0.3, d - 0.6, 2600, 0.7, 0.005 * lv * melt, bus, 15, 0.7);
    return d;
  },
  /** A driver's call on the road to a camel or a donkey: wordless, two falling notes from a distance. */
  perDriver(t, bus, lv) {
    for (const [d, f] of [[0, 180], [0.55, 155], [1.3, 130]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.4, 'o'], [-3, 0.5, 'a']], 0.04 * lv, bus, { cutoff: 2500, fem: false }));
    return 3;
  },
};

addVoices('voices-persepolis.js', PER_VOICES);
