// The placed voices of Nan Madol about 1300 (docs/settlements/nan-madol.md §14.3; src/settlements/nan-madol/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `nan`. All synthesised, no samples. [inferred throughout: no recording of
// Pohnpei of 1300 exists; the works are those the dossier names — sakau pounded on a basalt slab with the call "Mut!" (Dana Lee Ling, "Sakau ceremony"),
// breadfruit pounded on a board, a canoe hull adzed, coconut grated and pressed, an earth oven, a conch trumpet, a men's chant; the pitches are ours.]
import { addVoices } from './voices.js';

const R = Math.random;

export const NAN_VOICES = {
  /** Sakau pounded on the peitehl: several men's stones fall in turn on the basalt slab, each blow ringing, a steady beat, and the call "Mut!" before a round. */
  nanSakau(t, bus, lv) {
    const n = 14 + Math.floor(R() * 14), gap = 0.5 + R() * 0.08;
    let w = t + 0.3;
    for (let k = 0; k < n; k++) {
      if (k % 7 === 0) this.cue(w - 0.25, (x) => this.tone(x, [[0, 170], [0.16, 120]], 0.22, 0.05 * lv, bus, 'sawtooth', ['bandpass', 520, 2]));
      this.cue(w, (x) => { this.struck(x, 780 + (k % 3) * 140 + R() * 40, 0.05 * lv, bus, [[1, 1, 0.5], [2.4, 0.35, 0.25], [4.1, 0.12, 0.12]]); this.knock(x, 190, 0.03 * lv, bus, 0.08); });
      w += gap;
    }
    return w - t + 0.8;
  },
  /** Breadfruit pounded hot on a board with a stone pestle: soft dull thuds, a steady slow beat. */
  nanBoard(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8), gap = 0.55 + R() * 0.1;
    for (let k = 0; k < n; k++) this.cue(t + k * gap, (x) => { this.knock(x, 130 + (k % 2) * 25, 0.05 * lv, bus, 0.11); this.burst(x, 0.07, 400, 0.8, 0.01 * lv, bus); });
    return n * gap + 0.6;
  },
  /** An adze shaping a canoe hull: a sharp tock and a chip's tick, uneven strokes. */
  nanAdze(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => { this.knock(x, 560 + R() * 120, 0.05 * lv, bus, 0.06); this.burst(x + 0.01, 0.05, 2400, 1.5, 0.012 * lv, bus); }); w += 0.55 + R() * 0.8; }
    return w - t + 0.6;
  },
  /** Coconut grated on a serrated shell: short dry rasps back and forth. */
  nanGrate(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.22, 2600, 0.8, 0.012 * lv, bus, 30, 0.8); w += 0.3 + R() * 0.1; }
    return w - t + 0.4;
  },
  /** The oil press: the lever's long wooden creak, then drops falling into the trough. */
  nanPress(t, bus, lv) {
    this.tone(t, [[0, 150], [0.9, 110], [1.6, 135]], 1.7, 0.02 * lv, bus, 'sawtooth', ['bandpass', 380, 4]);
    for (let k = 0; k < 4; k++) this.cue(t + 1.2 + k * (0.4 + R() * 0.3), (x) => this.drip(x, 0.8 * lv, bus));
    return 3.4;
  },
  /** An earth oven: leaves hissing on hot stones, a stone set down. */
  nanUmu(t, bus, lv) {
    this.rasp(t, 1.6 + R() * 0.8, 4200, 0.5, 0.012 * lv, bus, 11, 0.7);
    this.cue(t + 0.9, (x) => this.struck(x, 650, 0.02 * lv, bus, [[1, 1, 0.1], [2.1, 0.3, 0.06]]));
    return 2.6;
  },
  /** The conch trumpet from the inner court: two long breathy blasts on one low note that swell and die. */
  nanConch(t, bus, lv) {
    const f = 196 * (0.97 + R() * 0.06);
    let w = t;
    for (let k = 0; k < 2; k++) {
      const d = 3.6 + R() * 1.2;
      this.tone(w, [[0, f * 0.95], [0.6, f], [d, f * 0.98]], d, 0.05 * lv, bus, 'sawtooth', ['bandpass', 540, 2.2]);
      this.cue(w, (x) => this.burst(x, d, 880, 0.8, 0.01 * lv, bus, 0.3));
      w += d + 1.8;
    }
    return w - t + 1;
  },
  /** Men's wordless chant in unison from the court: a few long falling phrases, low. */
  nanChant(t, bus, lv) {
    const f0 = 118 + R() * 14, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.8, 'o'], [-2, 0.7, 'a'], [-5, 1.2, 'o'], [-7, 1.0, 'o']].slice(0, 2 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1500, fem: false }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.9 + R() * 1.2;
    }
    return w - t + 1;
  },
  /** Surf on the reef beyond the sea wall: a long wash that swells and withdraws. */
  nanSurf(t, bus, lv) {
    const d = 8 + R() * 4;
    this.rasp(t, d, 650 + R() * 200, 0.4, 0.03 * lv, bus, 7 + R() * 3, 0.6);
    this.rasp(t + 0.4, d - 1, 2200, 0.6, 0.008 * lv, bus, 13, 0.7);
    return d;
  },
  /** A night-heron's harsh flat call over the reef, once or twice. */
  nanHeron(t, bus, lv) {
    const n = 1 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.9, (x) => this.tone(x, [[0, 760], [0.22, 430]], 0.3, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 2.5]));
    return n * 0.9 + 0.5;
  },
};

addVoices('voices-nan-madol.js', NAN_VOICES);
