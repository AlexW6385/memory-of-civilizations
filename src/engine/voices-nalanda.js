// The placed voices of Nalanda about 640 (docs/settlements/nalanda.md §20; src/settlements/nalanda/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `nal`; the engine's own voices that suit (the loom, the oil-presser's mortar, the
// grinder, the kitchen, the well's bucket, the pour of water, the potter's wheel and clay, the broom, cloth, the crows, doves, cicadas and frogs, the hand
// bell and conch of the 'puja' bells) are used by the map as they are. Each is `name(t, bus, lv)`: it makes its events from `t` into a bus from `src()` and
// returns how long it lasts. All synthesised (noise, oscillators, formant filters, struck partials; no samples), every voice WORDLESS (vowel contours: no
// Sanskrit or Pali is recited). [inferred throughout: no recording of seventh-century Nalanda exists. What sounded is from the dossier (§10, §13): the wooden
// gong that called the monks' day, the recited chant of the shrines and the court's lectures, the claps of the debaters, the stylus on the palm leaf, the zebu
// bell and the cart. The pitches, rhythms and levels are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const pick = (a) => a[Math.floor(R() * a.length)];

export const NAL_VOICES = {
  /** The wooden gong (a board or a plank of hard wood hung from a corner and struck with a mallet): slow strokes that quicken and then die away, the call of the monastic day. */
  nalWoodGong(t, bus, lv) {
    const n = 14 + Math.floor(R() * 8), f = 330 + R() * 90;
    let w = t, gap = 1.7;
    for (let k = 0; k < n; k++) {
      const loud = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, k / (n - 1)));
      this.cue(w, (x) => { this.knock(x, f, 0.05 * lv * loud, bus, 0.16); this.struck(x, f * 0.5, 0.03 * lv * loud, bus, [[1, 1, 0.5], [2.3, 0.35, 0.28], [3.9, 0.12, 0.15]]); });
      w += gap; gap = Math.max(0.32, gap * 0.82);
    }
    return w - t + 1.2;
  },
  /** The monks' recitation: low men's voices on a drone, a reciting note held and turned, each phrase falling to the tonic, a second voice a fifth above answering; ten to fifteen seconds. */
  nalChant(t, bus, lv) {
    const dur = 11 + R() * 5, root = hz(98, Math.floor(R() * 3));
    this.tone(t, [[0, root], [dur, root * 1.003]], dur, 0.011 * lv, bus, 'sawtooth', ['bandpass', 520, 3]);
    this.tone(t + 0.4, [[0, root * 1.5], [dur - 0.8, root * 1.498]], dur - 0.8, 0.005 * lv, bus, 'sawtooth', ['bandpass', 700, 3]);
    let w = t + 0.8;
    while (w < t + dur - 3) {
      const len = 1.6 + R() * 1.4, up = pick([0, 2, 2, 3]);
      this.cue(w, (x) => this.cry(x, root * 2, [[up, len * 0.45, 'a'], [up, len * 0.3, 'o'], [-2, len * 0.25, 'u'], [-5, 0.5, 'u']], 0.022 * lv, bus, { cutoff: 1800, fem: false }));
      if (R() < 0.5) this.cue(w + 0.25, (x) => this.cry(x, root * 3, [[0, len * 0.6, 'o'], [-3, len * 0.4, 'u']], 0.009 * lv, bus, { cutoff: 1600, fem: false }));
      w += len + 0.5 + R() * 0.9;
    }
    return dur + 1;
  },
  /** The debaters: the challenger's sharp clap of the hands and a rising call, the answer a low murmur; three to six rounds in the court, a few seconds apart. */
  nalDebateClap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => {
        this.burst(x, 0.05, 2300 + R() * 500, 1.5, 0.05 * lv, bus); this.knock(x, 900, 0.012 * lv, bus, 0.03);
        this.cry(x + 0.12, 150 + R() * 25, [[0, 0.3, 'a'], [3, 0.45, 'a']], 0.03 * lv, bus, { cutoff: 2600, fem: false });
      });
      this.cue(w + 1.4, (x) => this.cry(x, 120 + R() * 20, [[0, 0.5, 'o'], [-2, 0.7, 'u']], 0.016 * lv, bus, { cutoff: 1500, fem: false }));
      w += 2.6 + R() * 2.4;
    }
    return w - t + 1;
  },
  /** The stylus on a palm leaf and the turning of the leaves in the library: short dry scratches in lines, a pause, the soft flutter of a leaf lifted and laid down. */
  nalStylus(t, bus, lv) {
    let w = t;
    for (let line = 0, nl = 2 + Math.floor(R() * 3); line < nl; line++) {
      for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.13, 3600 + R() * 900, 1.3, 0.02 * lv, bus, 38, 0.9); w += 0.2 + R() * 0.12; }
      w += 0.5 + R() * 0.8;
    }
    this.rasp(w, 0.35, 5200, 0.8, 0.008 * lv, bus, 16, 0.9);
    return w - t + 0.7;
  },
  /** A zebu cart on the way: the dull clank of the bell at the beast's neck at each step, the creak of the axle, slow; a few strides of it passing. */
  nalCartBell(t, bus, lv) {
    const f = 760 + R() * 160, n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.struck(x, f * (k % 2 ? 1 : 1.06), 0.014 * lv, bus, [[1, 1, 0.35], [2.4, 0.35, 0.18]]); this.knock(x + 0.05, 130, 0.02 * lv, bus, 0.07); });
      if (k % 3 === 0) this.rasp(w + 0.1, 0.9, 480 + R() * 120, 3, 0.006 * lv, bus, 7, 0.9);
      w += 0.85 + R() * 0.25;
    }
    return w - t + 0.8;
  },
};

addVoices('voices-nalanda.js', NAL_VOICES);
