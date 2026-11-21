// The placed voices of Sanchi in the 1st century (docs/settlements/sanchi.md §22; src/settlements/sanchi/soundmap.js says where each is made and when).
// Added to the engine's VOICES (addVoices), every name prefixed `san`; the engine's own voices that suit (the smith's forge, the grinder, the kitchen, the oil
// press's mortar, the potter's wheel and clay, the well's bucket, the pour of water, sacks, cloth, a bowl's clack, the crows, doves, kites, cicadas and frogs,
// the hand bell and conch of the 'puja' bells) are used by the map as they are. Each is `name(t, bus, lv)`. All synthesised, every voice WORDLESS (vowel
// contours: no Pali or Prakrit is recited). [inferred throughout: no recording exists. What sounded: the wooden gong (gaṇḍī) that called the monks together
// is in the monastic rules; recitation by the monks; peafowl on the hill; the bells of zebu; the ivory carvers of Vidisha named on the gateways. Pitches,
// rhythms and levels are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const pick = (a) => a[Math.floor(R() * a.length)];

export const SAN_VOICES = {
  /** The wooden gong (gaṇḍī): a hard plank struck with a mallet, slow strokes that quicken and fade, the call that gathered the monks. */
  sanGong(t, bus, lv) {
    const n = 12 + Math.floor(R() * 7), f = 300 + R() * 80;
    let w = t, gap = 1.9;
    for (let k = 0; k < n; k++) {
      const loud = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, k / (n - 1)));
      this.cue(w, (x) => { this.knock(x, f, 0.05 * lv * loud, bus, 0.18); this.struck(x, f * 0.5, 0.03 * lv * loud, bus, [[1, 1, 0.55], [2.2, 0.3, 0.3], [3.7, 0.1, 0.15]]); });
      w += gap; gap = Math.max(0.36, gap * 0.8);
    }
    return w - t + 1.2;
  },
  /** The monks' recitation before the stupa: low voices on a drone, a held reciting note turned and falling to the tonic, a second voice answering; ten to fifteen seconds. */
  sanChant(t, bus, lv) {
    const dur = 11 + R() * 5, root = hz(92, Math.floor(R() * 3));
    this.tone(t, [[0, root], [dur, root * 1.003]], dur, 0.011 * lv, bus, 'sawtooth', ['bandpass', 500, 3]);
    this.tone(t + 0.4, [[0, root * 1.5], [dur - 0.8, root * 1.497]], dur - 0.8, 0.005 * lv, bus, 'sawtooth', ['bandpass', 680, 3]);
    let w = t + 0.8;
    while (w < t + dur - 3) {
      const len = 1.8 + R() * 1.5, up = pick([0, 2, 3]);
      this.cue(w, (x) => this.cry(x, root * 2, [[up, len * 0.45, 'a'], [up, len * 0.3, 'o'], [-2, len * 0.25, 'u'], [-5, 0.5, 'u']], 0.022 * lv, bus, { cutoff: 1700, fem: false }));
      if (R() < 0.45) this.cue(w + 0.3, (x) => this.cry(x, root * 3, [[0, len * 0.6, 'o'], [-3, len * 0.4, 'u']], 0.009 * lv, bus, { cutoff: 1500, fem: false }));
      w += len + 0.6 + R() * 1.0;
    }
    return dur + 1;
  },
  /** The bell at a zebu's neck: a dull clank at each step of the beast, an axle's creak now and then; a few strides passing. */
  sanZebuBell(t, bus, lv) {
    const f = 700 + R() * 180, n = 9 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.struck(x, f * (k % 2 ? 1 : 1.07), 0.014 * lv, bus, [[1, 1, 0.33], [2.4, 0.3, 0.17]]); this.knock(x + 0.05, 120, 0.018 * lv, bus, 0.07); });
      if (k % 4 === 0) this.rasp(w + 0.1, 0.8, 460 + R() * 120, 3, 0.005 * lv, bus, 7, 0.9);
      w += 0.9 + R() * 0.3;
    }
    return w - t + 0.8;
  },
  /** The ivory carver's bench: a fine saw drawn through a tusk, then the light taps of a mallet on a chisel, in lines, with pauses. */
  sanIvory(t, bus, lv) {
    let w = t;
    for (let line = 0, nl = 2 + Math.floor(R() * 2); line < nl; line++) {
      this.rasp(w, 0.9 + R() * 0.5, 2600 + R() * 500, 1.4, 0.016 * lv, bus, 22, 0.8); w += 1.3 + R() * 0.6;
      for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => this.knock(x, 1500 + R() * 400, 0.016 * lv, bus, 0.03)); w += 0.14 + R() * 0.1; }
      w += 0.6 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** A peafowl's call on the hill: the loud, rising, nasal cry, two or three times, a few seconds apart. */
  sanPeacock(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      this.cue(w, (x) => this.cry(x, 480 + R() * 60, [[0, 0.22, 'a'], [6, 0.35, 'a'], [3, 0.4, 'e']], 0.04 * lv, bus, { cutoff: 3400, fem: true }));
      w += 2.2 + R() * 2.5;
    }
    return w - t + 1;
  },
};

addVoices('voices-sanchi.js', SAN_VOICES);
