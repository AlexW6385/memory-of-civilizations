// The placed voices of Ye about AD 215 (docs/settlements/wei-ye.md §17; src/settlements/wei-ye/soundmap.js says where each is made and when). Added to the engine's
// VOICES (addVoices), every name prefixed `wei`; the Han voices (bells, stones, zither, reed organ, drum, watch, pounder, cart: voices-han.js) and the engine's own
// are used by the map as they are. All synthesised; no recording of Ye exists, the forms are ours. [inferred throughout]
import { addVoices, inSeason } from './voices.js';

const R = Math.random;

export const WEI_VOICES = {
  /** The ice cutters at the Ice Well, in the cold months only: the long rasp of a saw through ice, then the knock of a pick and the crack of a block coming free. */
  weiIce(t, bus, lv) {
    if (!inSeason(this.seasonDoy(), 335, 55, 12)) return 0.3;                // (cut on the frozen Zhang in the depth of winter)
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const d = 0.5 + R() * 0.2; this.cue(w, (x) => this.rasp(x, d, 3000 + R() * 600, 1.4, 0.03 * lv, bus, 70, 0.6)); w += d + 0.25; }
    this.cue(w + 0.2, (x) => { this.knock(x, 300, 0.05 * lv, bus, 0.06); this.burst(x, 0.05, 4200, 2, 0.05 * lv, bus); });
    this.cue(w + 0.9, (x) => { this.knock(x, 150, 0.06 * lv, bus, 0.2); this.burst(x, 0.3, 1800, 1, 0.025 * lv, bus, 0.02); });
    return w - t + 1.8;
  },
  /** The military horn from a gate at dawn and at the closing of the gates: a long low note that swells and falls, twice. */
  weiHorn(t, bus, lv) {
    for (const d of [0, 4.2]) this.tone(t + d, [[0, 175], [1.0, 200], [3.0, 190]], 3.2, 0.03 * lv, bus, 'sawtooth', ['bandpass', 650, 3]);
    return 8;
  },
  /** The guards at their posts: the clink of a halberd's iron head against a shield rim and a shifting step, now and then a muttered call. */
  weiClank(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => this.struck(x, 1750 * (0.95 + R() * 0.1), 0.03 * lv, bus, [[1, 1, 0.16], [2.7, 0.4, 0.1]])); this.cue(w + 0.12, (x) => this.knock(x, 260, 0.025 * lv, bus, 0.05)); w += 0.8 + R() * 1.2; }
    return w - t + 0.5;
  },
};
export const WEI_GAIN = {};
addVoices('voices-wei.js', WEI_VOICES, WEI_GAIN);
