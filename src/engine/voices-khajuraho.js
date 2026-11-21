// The placed voices of Khajuraho about 1050 (docs/settlements/khajuraho.md §20; src/settlements/khajuraho/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `kha`; the engine's own voices that suit (the well's bucket, the pour of water, the
// grinder, the oil-presser's mortar, the potter's wheel and clay, the kitchen, the hammer, the sack, a jar's lid, cloth) are used by the map as they are. Each is
// `name(t, bus, lv)`: it makes its events from `t` into a bus from `src()` and returns how long it lasts. All synthesised (noise, oscillators, formant filters,
// struck partials; no samples), every human voice WORDLESS (vowel contours: no Sanskrit is recited). [inferred throughout: no recording of Chandela Khajuraho
// exists. What sounded is from the dossier (§9, §11, §18): the bell hung in each porch, the drum and the chant of the evening worship, the flower-sellers' calls,
// the sweet-makers' pans, the zebu carts' wooden bells; the peafowl and the spotted owlet are the birds of the dry Bundelkhand country. Pitches, rhythms and levels are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const pick = (a) => a[Math.floor(R() * a.length)];

export const KHA_VOICES = {
  /** The bell hung from the porch ceiling, rung by each pilgrim on entering: one to three strokes of bronze, the first strongest, a long hum under them. */
  khaPorchBell(t, bus, lv) {
    const n = 1 + Math.floor(R() * 3), f = 520 + R() * 120;
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.struck(x, f, 0.05 * lv * (1 - k * 0.2), bus, [[1, 1, 2.6], [2.01, 0.55, 1.5], [2.76, 0.4, 1.1], [4.1, 0.22, 0.6], [5.4, 0.12, 0.35]]));
      w += 0.7 + R() * 0.8;
    }
    return w - t + 2.6;
  },
  /** The temple drum at the evening lamp-waving (ārati) and at dawn: a slow beat on a deep skin that quickens to a roll and ends on a stroke, a bronze gong under the last. */
  khaDrum(t, bus, lv) {
    const f = 108 + R() * 14, n = 16 + Math.floor(R() * 8);
    let w = t, gap = 1.1;
    for (let k = 0; k < n; k++) {
      const loud = 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, k / (n - 1)) * 0.9 + 0.3);
      this.cue(w, (x) => { this.knock(x, f * (k % 3 === 2 ? 1.35 : 1), 0.12 * lv * loud, bus, 0.22); this.burst(x, 0.06, 700 + R() * 300, 1.0, 0.06 * lv * loud, bus); });
      w += gap; gap = Math.max(0.2, gap * 0.86);
    }
    this.cue(w, (x) => { this.knock(x, f, 0.13 * lv, bus, 0.35); this.struck(x, 210, 0.04 * lv, bus, [[1, 1, 3.2], [1.52, 0.5, 2.2], [2.4, 0.3, 1.4]]); });
    return w - t + 3.4;
  },
  /** The priests' recitation: men's voices on a drone, a reciting note held and turned in the way of the Vedic chant (three notes, the middle one the highest), each phrase falling to the tonic; ten to fifteen seconds. */
  khaChant(t, bus, lv) {
    const dur = 10 + R() * 5, root = hz(110, Math.floor(R() * 3));
    this.tone(t, [[0, root], [dur, root * 1.002]], dur, 0.012 * lv, bus, 'sawtooth', ['bandpass', 500, 3]);
    this.tone(t + 0.3, [[0, root * 1.5], [dur - 0.6, root * 1.499]], dur - 0.6, 0.004 * lv, bus, 'sawtooth', ['bandpass', 680, 3]);
    let w = t + 0.7;
    while (w < t + dur - 3.2) {
      const len = 1.8 + R() * 1.2;
      this.cue(w, (x) => this.cry(x, root * 2, [[-2, len * 0.3, 'a'], [0, len * 0.4, 'a'], [-2, len * 0.2, 'o'], [-5, len * 0.35, 'u']], 0.02 * lv, bus, { cutoff: 1900, fem: false }));
      w += len + 0.6 + R() * 0.9;
    }
    return dur + 1;
  },
  /** A flower-seller's call on the pilgrims' lane: a woman's voice, a long open vowel falling and a short one rising to answer, wordless; and sometimes the rustle of a leaf plate. */
  khaCall(t, bus, lv) {
    const f = 330 + R() * 60, up = pick([2, 3, 5]);
    this.cry(t, f, [[0, 0.5, 'a'], [up, 0.9, 'a'], [up - 3, 0.5, 'o'], [-2, 0.5, 'u']], 0.03 * lv, bus, { cutoff: 2600, fem: true });
    if (R() < 0.5) this.cry(t + 2.6, f * 0.84, [[0, 0.3, 'e'], [3, 0.5, 'a']], 0.018 * lv, bus, { cutoff: 2400, fem: false });
    if (R() < 0.4) this.rasp(t + 3.4, 0.5, 2400, 0.8, 0.008 * lv, bus, 18, 0.9);
    return 4.2;
  },
  /** The sweet-maker's spoon on his iron pan (kaṛāhī): quick ringing taps on the rim between stirring scrapes, the hiss of the oil under them. */
  khaPan(t, bus, lv) {
    let w = t;
    this.rasp(w, 3.5, 3800, 0.7, 0.007 * lv, bus, 60, 0.9);
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) {
      this.cue(w, (x) => this.struck(x, 900 + R() * 150, 0.016 * lv, bus, [[1, 1, 0.22], [2.3, 0.4, 0.12]]));
      if (k % 3 === 2) this.rasp(w + 0.12, 0.35, 1600, 1.2, 0.01 * lv, bus, 14, 0.9);
      w += 0.22 + R() * 0.2;
    }
    return w - t + 0.7;
  },
  /** A zebu cart on the road: the hollow clack of the wooden bell at the beast's neck at each step (a carved box with a clapper of wood), the creak of the axle; a few strides passing. */
  khaCartBell(t, bus, lv) {
    const f = 330 + R() * 80, n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, f * (k % 2 ? 1 : 1.12), 0.03 * lv, bus, 0.1); this.knock(x + 0.07, f * 0.7, 0.012 * lv, bus, 0.08); });
      if (k % 3 === 0) this.rasp(w + 0.1, 0.9, 520 + R() * 120, 3, 0.006 * lv, bus, 7, 0.9);
      w += 0.9 + R() * 0.3;
    }
    return w - t + 0.8;
  },
  /** The peafowl (mor): the loud far-carrying cry, a rising 'may-awe' repeated three to six times at gaps, at dawn and dusk and before the rains. */
  khaPeafowl(t, bus, lv) {
    const n = 3 + Math.floor(R() * 4), f = 560 + R() * 80;
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.8], [0.22, f * 1.55], [0.5, f * 1.2]], 0.55, 0.045 * lv, bus, 'sawtooth', ['bandpass', 1500, 2.5]); this.tone(x + 0.05, [[0, f * 1.6], [0.2, f * 3.1], [0.45, f * 2.4]], 0.45, 0.015 * lv, bus, 'square', ['bandpass', 3000, 3]); });
      w += 1.3 + R() * 0.9;
    }
    return w - t + 0.8;
  },
  /** The spotted owlet (Athene brama) at dusk and in the night: a harsh run of chirrups that quickens and breaks into a cackle, and a pause. */
  khaOwl(t, bus, lv) {
    let w = t, gap = 0.34;
    const f = 1150 + R() * 150;
    for (let k = 0, n = 8 + Math.floor(R() * 6); k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.08, f * 1.25], [0.14, f * 0.95]], 0.16, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1800, 4]); });
      w += gap; gap = Math.max(0.12, gap * 0.86);
    }
    return w - t + 0.8;
  },
};

addVoices('voices-khajuraho.js', KHA_VOICES);
