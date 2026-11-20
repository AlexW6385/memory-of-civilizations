// The voices of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §13.2), added to the placed voices of voices.js through
// addVoices: the Jerónimos' canonical-hour bell and the Sé's curfew bell, the Ribeira das Naus's caulking mallets, pit-saw, adzes,
// pitch kettle, treadwheel crane and ropewalk, the gang hauling on the quay, the fishwives' and the porters' wordless cries, the
// murmur of a crowd, the fountains, an ox-cart on the cobbles, the scales of the Casa da Índia, the parrots of the Rua Nova, the
// plank-and-block creak of a quay. The same synthesised terms as the other places (noise, oscillators, formant filters, struck
// partials; no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music, scheduled from the emitters and tracks
// of src/settlements/manueline-lisbon/soundmap.js. Every name carries the prefix `lsb`.
// [inferred throughout: no recording of 1520 exists; the sounds are those of the trades the dossier lists (§6), and every contour is
// ours, wordless.]

import { addVoices } from './voices.js';

const R = Math.random;

/** The cries of the fishwives, the water-sellers and the boys of the quay: [semitones above the voice's base, seconds, vowel], wordless. */
export const LSB_CRIES = [
  [[7, 0.25, 'a'], [9, 0.3, 'e'], [4, 0.35, 'a'], [0, 0.9, 'o']],            // a fishwife's call: up, then a long fall
  [[0, 0.35, 'o'], [4, 0.3, 'a'], [7, 0.8, 'a'], [5, 0.5, 'o']],             // a second, held on the fifth
  [[5, 0.2, 'i'], [9, 0.2, 'i'], [5, 0.2, 'i'], [0, 0.9, 'a']],              // a boy's call, tossed
  [[0, 0.5, 'a'], [-2, 0.4, 'a'], [3, 0.8, 'e']],                            // a porter's: low, a dip and a rise
];

export const LISBON_VOICES = {
  /** The Jerónimos' bell for an office: a deep bell struck slowly five times, a small bell answering high between the last strokes. */
  lsbToll(t, bus, lv) {
    const f = 118 * (0.98 + R() * 0.04);
    for (let k = 0; k < 5; k++) this.cue(t + k * 3.4, (x) => this.strike(x, f, 0.05 * lv, bus, 1.4));
    for (let k = 0; k < 3; k++) this.cue(t + 11 + k * 1.1, (x) => this.strike(x, f * 2.7, 0.018 * lv, bus, 0.35));
    return 19;
  },
  /** The Sé's curfew bell: nine strokes, slow, a lower bell than the monastery's. */
  lsbCurfew(t, bus, lv) {
    for (let k = 0; k < 9; k++) this.cue(t + k * 4.0, (x) => this.strike(x, 92, 0.055 * lv, bus, 1.7));
    return 38;
  },
  /** A caulker's mallet on the caulking iron driving oakum into a seam: a run of knocks with an iron ring over each. */
  lsbMallet(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), p = 0.42 + R() * 0.08;
    for (let k = 0; k < n; k++) this.cue(t + k * p + R() * 0.03, (x) => { this.knock(x, 260 * (0.95 + R() * 0.1), 0.05 * lv, bus, 0.07); this.struck(x, 2300 + R() * 300, 0.006 * lv, bus, [[1, 1, 0.12]]); });
    return n * p + 0.4;
  },
  /** A pit-saw: the long rasp of the down-stroke, the lighter up-stroke, three or four strokes. */
  lsbSaw(t, bus, lv) {
    const n = 3 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) { this.rasp(t + k * 1.5, 0.95, 1700, 0.7, 0.022 * lv, bus, 7, 0.7); this.rasp(t + k * 1.5 + 0.9, 0.5, 1900, 0.7, 0.01 * lv, bus, 7, 0.7); }
    return n * 1.5 + 0.5;
  },
  /** An adze dressing a rib: chops, each a knock on green oak and a chip skittering off. */
  lsbAdze(t, bus, lv) {
    const n = 3 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.34 + R() * 0.1), (x) => { this.knock(x, 330 * (0.9 + R() * 0.2), 0.045 * lv, bus, 0.06); this.burst(x + 0.02, 0.04, 3000, 1, 0.01 * lv, bus); });
    return n * 0.45 + 0.4;
  },
  /** The pitch kettle: the slow pops of a thick boil under a low roar of fire. */
  lsbPitch(t, bus, lv) {
    this.rasp(t, 5, 520, 0.5, 0.014 * lv, bus, 5, 0.6);
    for (let k = 0; k < 9; k++) this.cue(t + 0.4 + k * (0.4 + R() * 0.3), (x) => this.tone(x, [[0, 160 + R() * 60], [0.07, 90]], 0.09, 0.02 * lv, bus, 'sine', ['lowpass', 500]));
    return 5.2;
  },
  /** The treadwheel crane: men walking the wheel, the axle creaking up in pitch with the load, the pawl's clicks. */
  lsbCrane(t, bus, lv) {
    const dur = 6 + R() * 2;
    this.tone(t, [[0, 150], [dur * 0.5, 215], [dur, 175]], dur, 0.01 * lv, bus, 'sawtooth', ['bandpass', 420]);
    for (let k = 0, n = Math.floor(dur / 0.55); k < n; k++) this.cue(t + k * 0.55, (x) => { this.knock(x, 150, 0.02 * lv, bus, 0.05); if (k % 2) this.burst(x + 0.08, 0.02, 2600, 2, 0.008 * lv, bus); });
    return dur + 0.5;
  },
  /** The ropewalk: the spinners' wheel and the twisting strands, a low hum with a faint ticking. */
  lsbRope(t, bus, lv) {
    this.rasp(t, 8, 300, 0.6, 0.016 * lv, bus, 21, 0.5);
    this.rasp(t, 8, 1300, 0.7, 0.006 * lv, bus, 33, 0.7);
    return 8;
  },
  /** A fountain: two bands of water, the lower slowly swelling; long enough that the next overlaps it. */
  lsbFountain(t, bus, lv) {
    this.rasp(t, 13, 900, 0.5, 0.02 * lv, bus, 0.3, 0.5);
    this.rasp(t, 13, 2800, 0.6, 0.011 * lv, bus, 0.45, 0.6);
    return 13;
  },
  /** A gang hauling on a rope: a chant of three men on one low note and a fall, the rope creaking, their steps together. */
  lsbHaul(t, bus, lv) {
    for (let r = 0; r < 2; r++) {
      const w = t + r * 3.2;
      this.cry(w, 108 * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [3, 0.4, 'o'], [0, 0.9, 'u']], 0.05 * lv, bus, { cutoff: 2600 });
      this.cry(w + 0.04, 82 * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [3, 0.4, 'o'], [0, 0.9, 'u']], 0.04 * lv, bus, { cutoff: 2200 });
      this.rasp(w, 1.9, 700, 1.2, 0.012 * lv, bus, 14, 0.9);
      for (const d of [0.55, 0.95, 1.7, 2.1]) this.cue(w + d, (x) => this.step(x, 0.06 * lv, bus, 'cloth', 0.3));
    }
    return 7;
  },
  /** A call across a market or a quay: one of the contours, in a woman's voice (a man's now and then), now and then answered. */
  lsbCry(t, bus, lv) {
    const k = Math.floor(R() * LSB_CRIES.length), fem = R() < 0.65, base = fem ? 230 * (0.95 + R() * 0.1) : 128 * (0.93 + R() * 0.14);
    this.cry(t, base, LSB_CRIES[k], 0.07 * lv, bus, { cutoff: 3800, fem });
    const len = LSB_CRIES[k].reduce((s, n) => s + n[1], 0);
    if (R() < 0.3) this.cue(t + len + 0.6 + R() * 0.8, (x) => this.cry(x, 125 * (0.95 + R() * 0.1), LSB_CRIES[(k + 1) % LSB_CRIES.length], 0.04 * lv, bus, { cutoff: 3400 }));
    return len + 2;
  },
  /** The murmur of a crowd or a street: three low voices on drifting vowels, without words, overlapping. */
  lsbMurmur(t, bus, lv) {
    for (let k = 0; k < 3; k++) {
      const w = t + k * (0.9 + R() * 0.8), v = 'aoeu'[Math.floor(R() * 4)], f = (R() < 0.35 ? 205 : 118) * (0.9 + R() * 0.25);
      this.cue(w, (x) => this.cry(x, f, [[0, 0.35, v], [2, 0.3, v], [-1, 0.5, 'o']], 0.02 * lv, bus, { cutoff: 1800 }));
    }
    return 4.5;
  },
  /** An ox-cart on the cobbles, passing: the slow beat of the hoofs, the wheels' rumble and the dry squeal of the axle (f.dur the passing's length). */
  lsbCart(t, bus, lv, f) {
    const dur = f?.dur ?? 10, p = 0.95;
    this.rasp(t, dur, 170, 0.5, 0.028 * lv, bus, 6, 0.8);
    this.tone(t, [[0, 520], [dur * 0.5, 610], [dur, 540]], dur, 0.0035 * lv, bus, 'sawtooth', ['bandpass', 900]);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.knock(x, 120, 0.05 * lv, bus, 0.1); this.burst(x, 0.04, 1500, 2, 0.04 * lv, bus); this.knock(x + 0.45, 115, 0.04 * lv, bus, 0.1); });
    return dur;
  },
  /** The scales of the Casa da Índia: a chain's run through a hand, the beam knocking, brass weights set down one on another, a pen's scratch. */
  lsbScales(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * (0.05 + R() * 0.03), (x) => this.clink(x, 0.01 * lv, bus));
    this.cue(t + 0.7, (x) => this.knock(x, 520, 0.03 * lv, bus, 0.05));
    for (let k = 0; k < 3; k++) this.cue(t + 1.2 + k * 0.3, (x) => this.struck(x, 1700 + k * 230, 0.012 * lv, bus, [[1, 1, 0.2], [2.3, 0.3, 0.1]]));
    this.rasp(t + 2.2, 0.8, 4200, 1.2, 0.006 * lv, bus, 12, 0.9);
    return 3.3;
  },
  /** A parrot in its cage: a harsh squawk or two and a run of chatter on rising whistles. */
  lsbParrot(t, bus, lv) {
    for (let k = 0, n = 1 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.5, (x) => { this.tone(x, [[0, 1300], [0.07, 2100], [0.2, 1500]], 0.22, 0.012 * lv, bus, 'sawtooth', ['bandpass', 2000]); });
    if (R() < 0.6) for (let k = 0; k < 5; k++) this.cue(t + 1.4 + k * 0.13, (x) => this.tone(x, [[0, 1700 + k * 150], [0.05, 2300 + k * 150]], 0.07, 0.007 * lv, bus, 'square', ['bandpass', 2400]));
    return 2.6;
  },
  /** A block and tackle on a quay: the sheave's creak under a load and a rope's slap against a bollard. */
  lsbBlock(t, bus, lv) {
    this.tone(t, [[0, 380], [0.5, 520], [1.1, 430]], 1.2, 0.006 * lv, bus, 'sawtooth', ['bandpass', 900]);
    this.cue(t + 1.4, (x) => { this.knock(x, 200, 0.03 * lv, bus, 0.06); this.rasp(x, 0.3, 1500, 1, 0.01 * lv, bus, 30, 0.9); });
    return 2;
  },
  /** A cooper's hoop driven down a cask with a drift: ringing taps, quickening. */
  lsbCooper(t, bus, lv) {
    let w = t, gap = 0.5;
    for (let k = 0; k < 7; k++) { this.cue(w, (x) => { this.knock(x, 210, 0.04 * lv, bus, 0.08); this.struck(x, 1400, 0.008 * lv, bus, [[1, 1, 0.15]]); }); w += gap; gap = Math.max(0.2, gap * 0.85); }
    return w - t + 0.4;
  },
};
addVoices('voices-lisbon.js', LISBON_VOICES, { lsbToll: 1.0, lsbCurfew: 1.0, lsbCry: 1.2, lsbHaul: 1.0 });
