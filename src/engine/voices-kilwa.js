// The placed voices of Kilwa about 1330 (docs/settlements/kilwa.md §22.3; src/settlements/kilwa/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `kw`. All synthesised [inferred throughout: no recording exists; the instruments are
// those the dossier names (ngoma drums, the zumari's reed, a plucked lute), the pitches and patterns are ours; recitation and work-chant are wordless].
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 3, 5, 7, 8, 10];                                 // a minor-ish coastal mode over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const KW_VOICES = {
  /** Ngoma: a goblet drum's low open stroke and a high slap in a short-long pattern, a few rounds. */
  kwNgoma(t, bus, lv) {
    const pat = [[0, 'lo'], [0.5, 'hi'], [0.75, 'hi'], [1.5, 'lo'], [2, 'hi'], [2.5, 'lo'], [3, 'hi']];
    let w = t;
    for (let r = 0, n = 3 + Math.floor(R() * 3); r < n; r++) {
      for (const [d, k] of pat) this.cue(w + d * 0.32, (x) => (k === 'lo' ? this.knock(x, 120, 0.07 * lv, bus, 0.22) : this.knock(x, 460 + R() * 60, 0.04 * lv, bus, 0.07)));
      w += 4 * 0.32 + 0.1;
    }
    return w - t + 0.8;
  },
  /** Zumari: the reed oboe, a nasal sustained line over a drone, settling on the tonic. */
  kwZumari(t, bus, lv) {
    const dur = 12 + R() * 8, root = 233;
    this.tone(t, [[0, root / 2], [dur, root / 2]], dur, 0.01 * lv, bus, 'sawtooth', ['bandpass', 600, 3]);
    let w = t + 1.2, k = 2;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(10, k + Math.floor(R() * 3) - 1));
      const f = hz(root, SCALE[k % 7] + 12 * Math.floor(k / 7)), len = 0.35 + R() * 1.1;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.97], [0.06, f], [len, f * 1.006]], len, 0.017 * lv, bus, 'sawtooth', ['bandpass', 1700, 5]));
      w += len + 0.08 + R() * 0.3;
    }
    return dur + 1;
  },
  /** A plucked lute: a slow phrase of strings ringing and dying, a drone string under it. */
  kwLute(t, bus, lv) {
    const root = 196, n = 7 + Math.floor(R() * 5);
    let w = t, k = 3;
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % 7] + 12 * Math.floor(k / 7)), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.028 * lv, bus, [[1, 1, 1.2], [2, 0.3, 0.6], [3, 0.12, 0.35]]));
      if (i % 3 === 0) this.cue(at, (x) => this.struck(x, root / 2, 0.02 * lv, bus, [[1, 1, 1.6], [2, 0.2, 0.8]]));
      w += 0.45 + R() * 0.6;
    }
    return w - t + 1.4;
  },
  /** Qur'an recited in a school or a hall: wordless, a chorus of boys' voices on one reciting note with a falling cadence, led by the teacher's phrase. */
  kwRecite(t, bus, lv) {
    let w = t;
    for (let ph = 0, n = 3 + Math.floor(R() * 3); ph < n; ph++) {
      const f = 175 + R() * 12, len = 2.2 + R() * 1.6;
      this.cue(w, (x) => this.cry(x, f, [[0, 0.5, 'a'], [-2, 0.5, 'i'], [-4, 0.7, 'a']], 0.03 * lv, bus, { cutoff: 2200, fem: false }));
      this.cue(w + 0.5, (x) => this.cry(x, f * 1.9, [[0, 0.6, 'a'], [-3, 0.8, 'u']], 0.016 * lv, bus, { cutoff: 2600, fem: true }));
      w += len;
    }
    return w - t + 0.6;
  },
  /** Kinu: the wooden mortar pounded by two women in turn, a dull thud and its answer, a pause to turn the grain. */
  kwMortar(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { this.cue(w, (x) => this.knock(x, k % 2 ? 130 : 150, 0.06 * lv, bus, 0.14)); w += 0.42 + (k % 2 ? 0.1 : 0.02); }
    return w - t + 0.6;
  },
  /** The shipwright's adze and mallet at a hull on the beach: a run of dry taps, a heavier blow. */
  kwAdze(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => this.knock(x, 820 + R() * 120, 0.04 * lv, bus, 0.05)); w += 0.3 + R() * 0.15; if (k % 5 === 4) { this.cue(w, (x) => this.knock(x, 300, 0.05 * lv, bus, 0.1)); w += 0.5; } }
    return w - t + 0.6;
  },
  /** The boatmen's work-chant on the beach or the water: a call and a falling answer, wordless, far off. */
  kwShanty(t, bus, lv) {
    for (const [d, f, v] of [[0, 150, 'o'], [1.6, 135, 'a'], [3.4, 150, 'o'], [5.0, 120, 'a']]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.6, v], [-3, 0.7, 'a']], 0.035 * lv, bus, { cutoff: 2400, fem: false }));
    return 6.5;
  },
  /** Surf over the reef: a long swell breathing in and out, a hiss at the break. */
  kwSurf(t, bus, lv) {
    const d = 8 + R() * 4;
    this.rasp(t, d, 500 + R() * 200, 0.4, 0.022 * lv, bus, 7 + R() * 3, 0.5);
    this.rasp(t + d * 0.35, d * 0.5, 2600, 0.6, 0.008 * lv, bus, 15, 0.7);
    return d;
  },
};

addVoices('voices-kilwa.js', KW_VOICES);
