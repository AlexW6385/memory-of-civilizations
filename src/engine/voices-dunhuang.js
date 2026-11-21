// The placed voices of Dunhuang and the Mogao caves c. 850 (docs/settlements/dunhuang.md §15.3; src/settlements/dunhuang/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `dh`; the engine's own voices that suit (the camels' bells, the donkey, the cart, the well's
// bucket, the smith's hammer, the kitchen, the potter's wheel and clay, the jars' lids, cloth, the dogs at night, the owl) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: nothing of the sound of 9th-century Shazhou is recorded; the instruments are those the dossier names (the
// bamboo flute qiang di, the pipa that came by the Silk Road, the eave bells), the work is that of the trades of §12, the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 5, 7, 9];                                    // the zhi pentatonic of music.js over the tonic
const hz = (root, st) => root * Math.pow(2, st / 12);

export const DH_VOICES = {
  /** The bells (fengling) hung from the eaves, stirred by the wind: a few small thin struck notes at irregular gaps, each long-ringing. */
  dhFengling(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) {
      const f = hz(1318, SCALE[Math.floor(R() * 5)] + (R() < 0.3 ? 12 : 0)), v = (0.4 + 0.6 * R()) * 0.012 * lv;
      this.cue(w, (x) => this.struck(x, f, v, bus, [[1, 1, 1.6], [2.76, 0.3, 0.7], [5.4, 0.1, 0.3]]));
      w += 0.25 + R() * 1.6;
    }
    return w - t + 1.8;
  },
  /** The pipa: a slow phrase of plucked strings with a tremolo roll at the end of a line (the lute came by the Silk Road). */
  dhPipa(t, bus, lv) {
    const root = 196, n = 7 + Math.floor(R() * 5);
    let w = t, k = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % 5] + 12 * Math.floor(k / 5)), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.9], [2, 0.45, 0.5], [3, 0.2, 0.3], [4.01, 0.08, 0.2]]));
      w += i % 4 === 3 ? 0.9 + R() * 0.5 : 0.28 + R() * 0.35;
    }
    for (let j = 0; j < 9; j++) { const f = hz(root, 7); this.cue(w + j * 0.075, (x) => this.struck(x, f * 2, 0.014 * lv * (1 - j / 12), bus, [[1, 1, 0.35], [2, 0.3, 0.2]])); }
    return w - t + 1.6;
  },
  /** The qiang di, a breathy end-blown flute: long falling and rising notes of the zhi mode with a little vibrato and breath. */
  dhQiangdi(t, bus, lv) {
    const root = 392, dur = 12 + R() * 8;
    let w = t + 0.5, k = 3;
    while (w < t + dur - 1.5) {
      k = Math.max(0, Math.min(8, k + Math.floor(R() * 3) - 1));
      const f = hz(root, SCALE[k % 5] + 12 * Math.floor(k / 5)), len = 0.9 + R() * 2.2;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.97], [0.12, f], [len, f * 1.003]], len, 0.02 * lv, bus, 'triangle', ['bandpass', f * 1.3, 2.5]); this.burst(x, len * 0.9, 3200, 0.8, 0.004 * lv, bus, 0.1); });
      w += len + 0.15 + R() * 0.6;
    }
    return dur + 1;
  },
  /** The Daquan's bed: a thin braided water over stones, a hiss and a chatter, quiet in the dry months. */
  dhStream(t, bus, lv) {
    const d = 7 + R() * 4;
    this.rasp(t, d, 1100 + R() * 400, 0.6, 0.016 * lv, bus, 11 + R() * 5, 0.55);
    this.rasp(t + 0.4, d - 0.8, 3000, 0.8, 0.006 * lv, bus, 19, 0.7);
    return d;
  },
  /** The smith's bellows: a long soft breath of air through a nozzle, in, out, in, and the hiss of the coals. */
  dhBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { this.burst(w, 0.7, 700, 0.5, 0.02 * lv, bus, 0.15); w += 1.15; }
    return w - t + 0.6;
  },
  /** Flatbread slapped on the wall of the clay oven: a soft wet slap, a pause, another, and the scrape of the peel. */
  dhOvenSlap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => { this.knock(x, 260, 0.04 * lv, bus, 0.07); this.burst(x, 0.06, 1800, 0.6, 0.012 * lv, bus); }); w += 0.7 + R() * 0.9; }
    this.rasp(w + 0.2, 0.5, 1900, 0.8, 0.012 * lv, bus, 14, 0.8);
    return w - t + 1;
  },
  /** The sweep well (shaduf): the creak of the pole's pivot as the bucket goes down and comes up, a splash. */
  dhShaduf(t, bus, lv) {
    this.tone(t, [[0, 280], [1.1, 330], [2.2, 250]], 2.4, 0.01 * lv, bus, 'sawtooth', ['bandpass', 600, 6]);
    this.cue(t + 1.2, (x) => this.burst(x, 0.35, 1400, 0.7, 0.02 * lv, bus));
    this.tone(t + 2.6, [[0, 250], [1.2, 300], [2.4, 230]], 2.6, 0.01 * lv, bus, 'sawtooth', ['bandpass', 560, 6]);
    return 5.4;
  },
  /** The mallet of the sculptor on his clay figure and the painter's tap on a pigment bowl: soft wooden knocks at uneven gaps. */
  dhMallet(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => this.knock(x, 330 + R() * 120, 0.03 * lv, bus, 0.08)); w += 0.5 + R() * 1.4; }
    return w - t + 0.6;
  },
  /** The reading of a sutra aloud in a cell: a low murmur on one note rising and falling, wordless (voice formants), a pause for breath. */
  dhMurmur(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const f = 110 + 12 * R(), len = 3 + R() * 3;
      this.cue(w, (x) => this.cry(x, f, [[0, 1.2, 'o'], [-1, 1.0, 'a'], [0, 1.2, 'o'], [-2, 1.4, 'a']], 0.03 * lv, bus, { cutoff: 1500, fem: false }));
      w += len;
    }
    return w - t + 1;
  },
};
export const DH_GAIN = {};
addVoices('voices-dunhuang.js', DH_VOICES, DH_GAIN);
