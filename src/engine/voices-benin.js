// The placed voices of Benin City about 1600 (docs/settlements/benin-city.md §15.3; src/settlements/benin-city/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `bn`. All synthesised [inferred throughout: no recording of the Benin court of 1600 exists;
// the instruments are those the dossier names (the log drum and the bells of the palace, the hammer and the bellows of the guild yard, the women's voices of the market,
// the thumb piano of the court's music, §7) and the ivory horn of the court that the bronze plaques show; the pitches and patterns are ours; calls are wordless].
import { addVoices } from './voices.js';

const R = Math.random;
const PENT = [0, 2, 4, 7, 9];                                          // the pentatonic of music.js
const hz = (root, st) => root * Math.pow(2, st / 12);

export const BN_VOICES = {
  /** The slit log drum of the palace: two lips of different pitch, a call and its answer in a short-long pattern, then a rest and the pattern again, a little changed. */
  bnLogDrum(t, bus, lv) {
    const lo = 150, hi = 205;
    const pat = [[0, hi], [0.4, lo], [0.8, hi], [1.0, hi], [1.6, lo], [2.2, hi], [2.4, lo], [3.0, lo]];
    let w = t;
    for (let r = 0, n = 2 + Math.floor(R() * 2); r < n; r++) {
      for (const [d, f] of pat) if (R() < 0.94) this.cue(w + d * 0.5, (x) => { this.knock(x, f, 0.085 * lv, bus, 0.3); this.struck(x, f * 1.5, 0.012 * lv, bus, [[1, 1, 0.22]]); });
      w += 3.6 * 0.5 + 1.4 + R() * 0.8;
    }
    return w - t + 0.8;
  },
  /** The staff of bells and the brass hand-bell of the palace: single bright strokes, unhurried, each ringing out. */
  bnBells(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      const f = 760 + 150 * PENT[Math.floor(R() * 5)] / 4 + R() * 12;
      this.cue(w, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.8], [2.4, 0.45, 0.9], [3.9, 0.22, 0.45], [5.6, 0.1, 0.2]]));
      w += 0.5 + R() * 0.9;
    }
    return w - t + 1.8;
  },
  /** The ivory horn of the court (side-blown, one low blast with a falling end, once or twice) [inferred: the plaques show horn-blowers]. */
  bnHorn(t, bus, lv) {
    const f = 196 + R() * 6, dur = 2.6 + R() * 0.8;
    this.cue(t, (x) => this.tone(x, [[0, f * 0.9], [0.18, f], [dur * 0.7, f * 1.01], [dur, f * 0.86]], dur, 0.045 * lv, bus, 'sawtooth', ['bandpass', 520, 2.4]));
    if (R() < 0.6) this.cue(t + dur + 0.5, (x) => this.tone(x, [[0, f * 1.18], [0.12, f * 1.25], [1.2, f * 1.1]], 1.3, 0.035 * lv, bus, 'sawtooth', ['bandpass', 560, 2.4]));
    return dur + 2.2;
  },
  /** The thumb piano of the court: a few tines plucked, a buzz on each, a phrase in the pentatonic that ends on its root. */
  bnThumbPiano(t, bus, lv) {
    const root = 262, n = 9 + Math.floor(R() * 6);
    let w = t, k = 2;
    for (let i = 0; i < n; i++) {
      k = i === n - 1 ? 0 : Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, PENT[k % 5] + 12 * Math.floor(k / 5)), at = w;
      this.cue(at, (x) => { this.struck(x, f, 0.026 * lv, bus, [[1, 1, 0.9], [2.01, 0.25, 0.4], [5.9, 0.08, 0.15]]); this.burst(x, 0.05, 3200, 3, 0.006 * lv, bus); });
      w += 0.28 + R() * 0.32;
    }
    return w - t + 1.0;
  },
  /** The yam pounded in the wooden mortar by two women in turn: a dull thud and its answer, a pause to turn the yam. */
  bnPound(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { this.cue(w, (x) => this.knock(x, k % 2 ? 135 : 160, 0.07 * lv, bus, 0.16)); w += 0.46 + (k % 2 ? 0.12 : 0.02); if (k % 7 === 6) w += 0.9; }
    return w - t + 0.6;
  },
  /** The casters' bellows: the clay pot's skin pumped in turn, a puff of air through the furnace each stroke (a hiss that swells and drops). */
  bnBellows(t, bus, lv) {
    let w = t;
    const n = 8 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) { this.rasp(w, 0.42, 900 + 120 * (k % 2), 0.5, 0.018 * lv, bus, 14, 0.3); w += 0.7 + R() * 0.08; }
    return w - t + 0.5;
  },
  /** The hammer on hot brass at the guild yard: a few quick strokes on the anvil stone, a bright ring that dies fast, a pause. */
  bnBrassHammer(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const f = 1250 + R() * 80;
      this.cue(w, (x) => { this.knock(x, 330, 0.04 * lv, bus, 0.05); this.struck(x, f, 0.016 * lv, bus, [[1, 1, 0.35], [2.7, 0.3, 0.15]]); });
      w += 0.3 + R() * 0.18; if (k % 4 === 3) w += 0.6;
    }
    return w - t + 0.6;
  },
  /** The carver's mallet on the gouge in wood or ivory: a run of soft dry taps, one deeper blow now and then. */
  bnCarve(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => this.knock(x, 520 + R() * 90, 0.03 * lv, bus, 0.05)); w += 0.26 + R() * 0.16; if (k % 6 === 5) { this.cue(w, (x) => this.knock(x, 240, 0.04 * lv, bus, 0.09)); w += 0.5; } }
    return w - t + 0.6;
  },
  /** A woman seller's call in the market: a long wordless cry that rises and falls, answered a little later by a neighbour's. */
  bnCall(t, bus, lv) {
    const f = 330 + R() * 60;
    this.cue(t, (x) => this.cry(x, f, [[0, 0.5, 'a'], [3, 0.7, 'o'], [-2, 0.9, 'a']], 0.03 * lv, bus, { cutoff: 2800, fem: true }));
    if (R() < 0.6) this.cue(t + 2.2 + R(), (x) => this.cry(x, f * 1.12, [[0, 0.4, 'o'], [4, 0.6, 'a'], [-3, 0.8, 'o']], 0.024 * lv, bus, { cutoff: 2600, fem: true }));
    return 5;
  },
  /** The hornbill over the rampart's trees: a run of hollow barks, "pok pok pok", quickening and rising, then a long wail. */
  bnHornbill(t, bus, lv) {
    let w = t, g = 0.5;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) { const f = 640 + k * 28; this.cue(w, (x) => { this.knock(x, f, 0.02 * lv, bus, 0.07); this.tone(x, [[0, f * 1.4], [0.06, f]], 0.08, 0.008 * lv, bus, 'triangle'); }); w += g; g = Math.max(0.12, g * 0.82); }
    this.cue(w + 0.3, (x) => this.tone(x, [[0, 900], [0.4, 1250], [0.9, 1050]], 1.0, 0.012 * lv, bus, 'triangle', ['bandpass', 1300, 3]));
    return w - t + 1.8;
  },
};

addVoices('voices-benin.js', BN_VOICES);
