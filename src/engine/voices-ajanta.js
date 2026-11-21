// The placed voices of Ajanta about 480 (docs/settlements/ajanta.md §18; src/settlements/ajanta/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `aj`; the engine's own voices that suit (the chisel, the hammer, the loom, the potter's
// wheel and clay, the oil-presser's mortar, the grinder, the kitchen, the well's bucket, the pour of water, cloth, the owl and the far dogs) are used by the map as
// they are. Each is `name(t, bus, lv)`: it makes its events from `t` into a bus from `src()` and returns how long it lasts. All synthesised (noise, oscillators,
// formant filters, struck partials; no samples), every voice WORDLESS (vowel contours: no Pali or Sanskrit is recited). [inferred throughout: no recording of a
// fifth-century Deccan monastery exists. What sounded is from the dossier §9: the river and the fall, the monastery's bronze gong and small hand bells, chanting in
// the caves, the mason's chisel, the ox's bell. The pitches, rhythms and levels are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const pick = (a) => a[Math.floor(R() * a.length)];

export const AJ_VOICES = {
  /** The Waghora's fall into its pool: a broad low roar of noise with a slow swell, a hiss of spray above it, a hollow boom now and then; long, to be repeated end to end. */
  ajFall(t, bus, lv) {
    const dur = 12 + R() * 6;
    this.rasp(t, dur, 260 + R() * 60, 0.5, 0.12 * lv, bus, 0.35, 0.5);
    this.rasp(t + 0.3, dur - 0.6, 1500, 0.4, 0.05 * lv, bus, 0.6, 0.6);
    this.rasp(t + 0.1, dur - 0.2, 4200, 0.6, 0.016 * lv, bus, 7, 0.7);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1.5 + R() * (dur - 3), (x) => this.tone(x, [[0, 110], [0.5, 70]], 0.7, 0.003 * lv, bus, 'sine'));
    return dur;
  },
  /** The river over the stones of the ford: a run of small bubbling splashes, the pitch of each wavering, now quick, now slow. */
  ajRiver(t, bus, lv) {
    const dur = 6 + R() * 4;
    this.rasp(t, dur, 700, 0.7, 0.014 * lv, bus, 2.5, 0.6);
    let w = t;
    while (w < t + dur - 0.5) { const f = 500 + R() * 900; this.cue(w, (x) => this.tone(x, [[0, f], [0.07, f * 1.6]], 0.09, 0.012 * lv, bus, 'sine')); w += 0.05 + R() * 0.25; }
    return dur;
  },
  /** The bronze gong of the monastery: strokes slow at first and then quickening, each a deep boom with its long inharmonic ring; the call of the day. */
  ajGong(t, bus, lv) {
    const n = 9 + Math.floor(R() * 5), f = 150 + R() * 18;
    let w = t, gap = 3.2;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.struck(x, f, 0.05 * lv, bus, [[1, 1, 4.2], [1.52, 0.55, 3.2], [2.35, 0.4, 2.2], [3.7, 0.2, 1.4], [5.1, 0.1, 0.8]]); this.knock(x, 380, 0.012 * lv, bus, 0.05); });
      w += gap; gap = Math.max(0.9, gap * 0.88);
    }
    return w - t + 4;
  },
  /** The hand bell rung at the Buddha: a small bright bell in short rows of three or four strokes, a pause, again; the fine ring of it long. */
  ajHandBell(t, bus, lv) {
    const f = 1500 + R() * 400, rows = 3 + Math.floor(R() * 3);
    let w = t;
    for (let r = 0; r < rows; r++) {
      for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) { this.cue(w, (x) => this.struck(x, f * (k % 2 ? 1.005 : 1), 0.012 * lv, bus, [[1, 1, 1.4], [2.7, 0.35, 0.8], [5.2, 0.12, 0.4]])); w += 0.38 + R() * 0.1; }
      w += 1.6 + R() * 1.4;
    }
    return w - t + 1.2;
  },
  /** The chanting of the monks in the hall: low men's voices on a drone, a reciting note held and turned, a second voice a fifth above answering, phrases falling to the tonic; the hall's own length of ring is the engine's room. */
  ajChant(t, bus, lv) {
    const dur = 12 + R() * 6, root = hz(98, Math.floor(R() * 3));
    this.tone(t, [[0, root], [dur, root * 1.002]], dur, 0.012 * lv, bus, 'sawtooth', ['bandpass', 500, 3]);
    this.tone(t + 0.5, [[0, root * 1.5], [dur - 1, root * 1.497]], dur - 1, 0.005 * lv, bus, 'sawtooth', ['bandpass', 680, 3]);
    let w = t + 0.9;
    while (w < t + dur - 3) {
      const len = 1.8 + R() * 1.6, up = pick([0, 2, 2, 4]);
      this.cue(w, (x) => this.cry(x, root * 2, [[up, len * 0.4, 'a'], [up, len * 0.3, 'o'], [-2, len * 0.3, 'u'], [-4, 0.5, 'u']], 0.021 * lv, bus, { cutoff: 1700, fem: false }));
      if (R() < 0.45) this.cue(w + 0.3, (x) => this.cry(x, root * 3, [[0, len * 0.6, 'o'], [-3, len * 0.4, 'u']], 0.008 * lv, bus, { cutoff: 1500, fem: false }));
      w += len + 0.6 + R() * 1.0;
    }
    return dur + 1;
  },
  /** A bell at the neck of a zebu or an ox walking: a dull clank at each step, a little hollow knock after; slow, a few strides. */
  ajOxBell(t, bus, lv) {
    const f = 620 + R() * 120, n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.struck(x, f * (k % 2 ? 1 : 1.07), 0.014 * lv, bus, [[1, 1, 0.32], [2.3, 0.4, 0.16]]); this.knock(x + 0.04, 120, 0.016 * lv, bus, 0.06); }); w += 0.9 + R() * 0.3; }
    return w - t + 0.8;
  },
  /** The smith's goatskin bellows: a long soft rush of air out, a short intake, repeated; the fire's low crackle under it. */
  ajBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.7, 900 + R() * 200, 0.7, 0.02 * lv, bus, 5, 0.4); this.rasp(w + 0.8, 0.25, 600, 0.8, 0.007 * lv, bus, 4, 0.3); w += 1.35 + R() * 0.2; }
    this.rasp(t, w - t, 2600, 0.5, 0.005 * lv, bus, 23, 0.9);
    return w - t + 0.5;
  },
  /** Washing at the stones: wet cloth beaten on a rock, a soft slap and a little splash, in runs of four or five, a pause, again. */
  ajWash(t, bus, lv) {
    let w = t;
    for (let run = 0, nr = 2 + Math.floor(R() * 3); run < nr; run++) {
      for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.knock(x, 210 + R() * 40, 0.03 * lv, bus, 0.07); this.burst(x, 0.09, 1400, 0.8, 0.014 * lv, bus); }); w += 0.55 + R() * 0.15; }
      w += 1.6 + R() * 2;
    }
    return w - t + 0.5;
  },
};

addVoices('voices-ajanta.js', AJ_VOICES);
