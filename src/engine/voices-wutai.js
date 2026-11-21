// The placed voices of Mount Wutai in 857 (docs/settlements/tang-wutai.md §21; src/settlements/tang-wutai/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `wt`; the engine's own voices that suit (the wooden fish, the smith's hammer,
// the loom and spinning wheel, the well's bucket, the mortar, the kitchen) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: no recording of Tang Wutai exists; what each sound is rests on the dossier (the hall's chant before the Buddhas, the bronze eave bells,
// the wooden board that calls the monks, a stone roller mill, a forge's bellows, owls on the pine hill, the hermit's bowl); the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;

export const WT_VOICES = {
  /** The recitation in the Great East Hall: the engine's chorus on one low note with the wooden fish keeping time, ended by the bowl-bell. */
  wtChant(t, bus, lv) {
    const n = 18 + Math.floor(R() * 16), end = this.chant(t, n, 0.03 * lv, bus, true);
    this.cue(end + 0.3, (x) => this.struck(x, 780, 0.02 * lv, bus, [[1, 1, 3.6], [2.71, 0.4, 1.9], [5.1, 0.12, 0.8]]));
    return end - t + 4;
  },
  /** The bronze bells at the eave corners: a few bright rings, uneven in the wind (larger and lower than a pagoda's tiers). */
  wtEaveBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) {
      const f = 1500 + R() * 800, x = w;
      this.cue(x, (y) => this.struck(y, f, 0.012 * lv, bus, [[1, 1, 1.9], [2.76, 0.35, 0.9], [5.4, 0.12, 0.35]]));
      w += 0.4 + R() * 1.4;
    }
    return w - t + 1.9;
  },
  /** The hanging wooden board struck to call the monks: slow deep clacks that quicken, then thin out and stop. */
  wtBoard(t, bus, lv) {
    let w = t, gap = 1.5;
    for (let k = 0; k < 22; k++) { const x = w; this.cue(x, (y) => this.knock(y, 340 + R() * 20, 0.05 * lv, bus, 0.2)); w += gap; gap = Math.max(0.17, gap * 0.82); }
    for (let k = 0; k < 10; k++) { const x = w; this.cue(x, (y) => this.knock(y, 340, 0.045 * lv * (1 - k / 12), bus, 0.2)); w += 0.17 + k * 0.1; }
    return w - t + 1;
  },
  /** The stone roller on its bed of stone, drawn round by a donkey: a low grinding rumble swelling and fading each turn, a knock of the pole on the frame. */
  wtMill(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.rasp(y, 2.4, 260, 0.8, 0.03 * lv, bus, 7, 0.9); this.knock(y + 1.9, 190, 0.025 * lv, bus, 0.12); });
      w += 3.2 + R() * 0.6;
    }
    return w - t + 1;
  },
  /** The forge's bellows: a push of air through the nozzle and the soft suck of the return, a few strokes, the coals' hiss. */
  wtBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.burst(y, 0.7, 520, 0.6, 0.03 * lv, bus, 0.15); this.burst(y + 0.8, 0.5, 380, 0.5, 0.012 * lv, bus, 0.2); });
      w += 1.5 + R() * 0.3;
    }
    return w - t + 1;
  },
  /** A little owl on the pine hill: a low double hoot, a pause, again. */
  wtOwl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      const x = w, f = 380 + R() * 40;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.25, f * 0.93]], 0.3, 0.03 * lv, bus, 'sine'); this.tone(y + 0.5, [[0, f * 0.9], [0.3, f * 0.8]], 0.4, 0.025 * lv, bus, 'sine'); });
      w += 3 + R() * 2;
    }
    return w - t + 1;
  },
  /** The hermit's bowl-bell struck at dawn and dusk: one clear note ringing a long time, then a second. */
  wtBowl(t, bus, lv) {
    this.cue(t, (x) => this.struck(x, 640, 0.02 * lv, bus, [[1, 1, 5], [2.71, 0.4, 2.5], [5.1, 0.1, 1.1]]));
    this.cue(t + 6, (x) => this.struck(x, 640, 0.016 * lv, bus, [[1, 1, 5], [2.71, 0.4, 2.5], [5.1, 0.1, 1.1]]));
    return 12;
  },
};

addVoices('voices-wutai.js', WT_VOICES);
