// The placed voices of Shaolin about 1600 (docs/settlements/shaolin.md §11.3; src/settlements/shaolin/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `sl`; the engine's own voices that suit (the chant and wooden fish, the smith's hammer,
// the kitchen, the mortar, the well's bucket, cloth, the vendors and the watchman) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: no recording of Ming Shaolin exists; what each sound is rests on the dossier (staff drills, the pitted floor of the training hall, the
// chanting hall, the bronze wind bells hung from eaves and pagoda tiers, the board struck to wake and to call to meals); the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;

export const SL_VOICES = {
  /** The recitation in the Mahavira Hall: the engine's chorus on one low note with the wooden fish keeping time, a long breath under it, ended by the bowl-bell. */
  slChant(t, bus, lv) {
    const n = 18 + Math.floor(R() * 18), end = this.chant(t, n, 0.03 * lv, bus, true);
    this.cue(end + 0.3, (x) => this.struck(x, 860, 0.02 * lv, bus, [[1, 1, 3.4], [2.71, 0.4, 1.8], [5.1, 0.12, 0.8]]));
    return end - t + 4;
  },
  /** Staff drill in the court: the whirr of the staff through the air, the crack of wood on wood, the stamp of the front foot, a short shout on each set. */
  slStaff(t, bus, lv) {
    let w = t;
    for (let set = 0, ns = 2 + Math.floor(R() * 3); set < ns; set++) {
      for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) {
        const x = w + k * 0.52;
        this.cue(x, (y) => {
          this.burst(y, 0.14, 1700 + R() * 600, 0.8, 0.026 * lv, bus, 0.06);
          this.knock(y + 0.13, 1250 + R() * 250, 0.045 * lv, bus, 0.06);
          this.tone(y + 0.13, [[0, 120], [0.08, 64]], 0.12, 0.014 * lv, bus, 'sine');
        });
      }
      this.cue(w + 0.1, (y) => this.tone(y, [[0, 210], [0.14, 160]], 0.2, 0.022 * lv, bus, 'sawtooth', ['bandpass', 900, 1.5]));
      w += 5 * 0.52 + 2.5 + R() * 1.5;
    }
    return w - t + 1;
  },
  /** The forms drilled on the brick floor of the training hall: the heavy stamp of a row of monks together, then the next, the floor booming under them. */
  slStomp(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.tone(y, [[0, 150], [0.1, 58]], 0.28, 0.04 * lv, bus, 'sine'); this.burst(y, 0.07, 520, 0.9, 0.05 * lv, bus); });
      w += k % 4 === 3 ? 1.5 : 0.78;
    }
    return w - t + 1;
  },
  /** The little bronze bells hung from the eave corners and the tiers of the pagodas: a few bright rings, each one a struck bell, uneven in the wind. */
  slEaveBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) {
      const f = 1700 + R() * 900, x = w;
      this.cue(x, (y) => this.struck(y, f, 0.02 * lv, bus, [[1, 1, 1.7], [2.76, 0.35, 0.8], [5.4, 0.12, 0.35]]));
      w += 0.35 + R() * 1.3;
    }
    return w - t + 1.8;
  },
  /** The hanging wooden board struck to wake the house and to call to the meal: slow, deep clacks that quicken and then thin out and stop. */
  slBoard(t, bus, lv) {
    let w = t, gap = 1.6;
    for (let k = 0; k < 26; k++) { const x = w; this.cue(x, (y) => this.knock(y, 330 + R() * 20, 0.05 * lv, bus, 0.2)); w += gap; gap = Math.max(0.16, gap * 0.82); }
    for (let k = 0; k < 14; k++) { const x = w; this.cue(x, (y) => this.knock(y, 330, 0.045 * lv * (1 - k / 16), bus, 0.2)); w += 0.16 + k * 0.1; }
    return w - t + 1;
  },
  /** A little owl on the hill: a low double hoot, a pause, again. */
  slOwl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      const x = w, f = 400 + R() * 40;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.25, f * 0.93]], 0.3, 0.03 * lv, bus, 'sine'); this.tone(y + 0.5, [[0, f * 0.9], [0.3, f * 0.8]], 0.4, 0.025 * lv, bus, 'sine'); });
      w += 3 + R() * 2;
    }
    return w - t + 1;
  },
};

addVoices('voices-shaolin.js', SL_VOICES);
