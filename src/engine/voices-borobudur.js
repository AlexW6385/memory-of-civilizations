// The placed voices of Sailendra Java about 825 (docs/settlements/borobudur.md §20.3; src/settlements/borobudur/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `bor`; the engine's own voices that suit (the loom, the smith's hammer, the kitchen, the pot and
// jar, the well's bucket, the owl, the cicadas, frogs and birds) are used by the map as they are. All synthesised, no samples. [inferred throughout: no recording of 9th-century
// Java exists. What the reliefs of Borobudur show is a Javanese orchestra of the time: drums, bronze bells and gongs, plucked and bowed strings, flutes, bamboo xylophones
// and cymbals, and the Sound of Borobudur project rebuilds them from the panels [stated in outline: injourneydestination.id, "Ancient Musical Instruments in Sound of
// Borobudur"]; the keyed metallophones and the interlocking of the later gamelan, the pitches and the patterns are ours (a five-note slendro-like mode).]
import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** The five-note mode (semitones from the tonic, slendro-like) and a note of it by degree. */
const MODE = [0, 2, 5, 7, 9];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 5) * 12 + MODE[((deg % 5) + 5) % 5]) / 12);
/** The sellers' calls of the way (wordless): [semitones, seconds, vowel]. */
export const BOR_CRIES = {
  flowers: [[0, 0.3, 'a'], [4, 0.35, 'o'], [2, 0.9, 'a']],
  rice: [[3, 0.3, 'e'], [0, 0.3, 'a'], [-2, 1.0, 'o']],
  water: [[2, 0.35, 'o'], [5, 0.4, 'a'], [0, 0.9, 'o']],
};

export const BOROBUDUR_VOICES = {
  /** A bronze metallophone pair and a hung gong: the two players interlock their notes (each on the off-beats of the other) over a slow melody, a gong stroke to close the phrase. */
  borGamelan(t, bus, lv) {
    const tonic = 262 * (0.98 + R() * 0.04), beat = 0.42 + R() * 0.1, bars = 4 + Math.floor(R() * 3);
    let deg = 5 + Math.floor(R() * 5);
    for (let b = 0; b < bars * 8; b++) {
      if (b % 2 === 0) deg = clamp(deg + pick([-2, -1, -1, 0, 1, 1, 2]), 2, 12);
      const at = t + b * beat / 2, player = b % 2, f = note(deg + (player ? 5 : 0), tonic) * (player ? 2 : 1), lvl = (player ? 0.03 : 0.036) * lv;
      if (b % 4 === 3 && R() < 0.5) continue;                                         // a rest now and then
      this.cue(at, (x) => this.struck(x, f, lvl, bus, [[1, 1, 1.5], [2.76, 0.32, 0.9], [5.4, 0.1, 0.45], [8.9, 0.04, 0.2]]));
    }
    const end = t + bars * 8 * beat / 2;
    this.cue(end, (x) => this.struck(x, 66, 0.06 * lv, bus, [[1, 1, 5.5], [2.04, 0.6, 4], [2.9, 0.3, 2.6], [4.1, 0.15, 1.5]]));
    return end - t + 5;
  },
  /** The hung gong alone: a slow stroke or two, the sound swelling and sinking. */
  borGong(t, bus, lv) {
    const n = R() < 0.5 ? 1 : 3, f = 64 * (0.97 + R() * 0.06);
    for (let k = 0; k < n; k++) this.cue(t + k * (3.4 + R()), (x) => { this.burst(x, 0.05, 900, 1, 0.03 * lv, bus); this.struck(x, f, 0.07 * lv, bus, [[1, 1, 6], [1.98, 0.6, 4.4], [2.93, 0.34, 3], [4.2, 0.18, 1.8]]); });
    return n * 4 + 4;
  },
  /** A bamboo flute (suling): a breathy, wavering phrase on the mode, each note a little bent into. */
  borFlute(t, bus, lv) {
    const tonic = 392 * (0.98 + R() * 0.04), n = 7 + Math.floor(R() * 6);
    let w = t, deg = 4;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + pick([-2, -1, 0, 1, 1, 2]), 0, 9);
      const f = note(deg, tonic), d = 0.5 + R() * 0.9;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.97], [0.07, f], [d, f * 1.003]], d, 0.03 * lv, bus, 'triangle', ['bandpass', f * 1.4, 2.5]); this.burst(x, d, f * 2, 1.2, 0.004 * lv, bus, 0.05); });
      w += d + 0.08 + R() * 0.4;
    }
    return w - t + 1;
  },
  /** A hand drum (kendang): a pattern of dull strokes of the palm and sharp slaps of the fingers, repeated with a change. */
  borDrum(t, bus, lv) {
    const unit = 0.36 + R() * 0.08, pat = [['d', 0], ['s', 1], ['s', 1.5], ['d', 2], ['s', 3], ['d', 3.5], ['d', 4], ['s', 5], ['s', 5.5], ['d', 6.5]];
    for (let r = 0; r < 4; r++) for (const [k, b] of pat) {
      if (r === 3 && R() < 0.4) continue;
      const at = t + (r * 8 + b) * unit;
      this.cue(at, (x) => (k === 'd' ? this.knock(x, 150 + R() * 20, 0.07 * lv, bus, 0.16) : this.knock(x, 480 + R() * 60, 0.045 * lv, bus, 0.05)));
    }
    return 32 * unit + 0.5;
  },
  /** The monks' chant: a low murmur of several voices on one drone with a slow melody over it, wordless. */
  borChant(t, bus, lv) {
    const f0 = 104 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 3.2, 'o'], [0, 2.4, 'u']], 0.05 * lv, bus, { cutoff: 1900 });
    this.cry(t + 0.2, f0 * 1.5, [[0, 2.4, 'u'], [-2, 3.0, 'o']], 0.03 * lv, bus, { cutoff: 1800 });
    this.cry(t + 0.1, f0 * 0.5, [[0, 5.4, 'o']], 0.034 * lv, bus, { cutoff: 900 });
    for (let k = 0; k < 3; k++) this.cue(t + 6 + k * 3.6, (x) => this.cry(x, f0 * 2, [[0, 1.0, 'o'], [pick([2, 3, 5]), 1.0, 'a'], [0, 1.6, 'o']], 0.034 * lv, bus, { cutoff: 2300 }));
    return 17;
  },
  /** A small hand bell (ghanta) rung in the offering: a bright run of strokes, quicker and quieter. */
  borBell(t, bus, lv) {
    const n = 6 + Math.floor(R() * 8), f = 1480 * (0.97 + R() * 0.06);
    let w = t, g = 0.3;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.struck(x, f, 0.025 * lv, bus, [[1, 1, 1.8], [2.7, 0.4, 0.9], [4.9, 0.15, 0.4]])); g = Math.max(0.14, g * 0.93 + R() * 0.03); w += g; }
    return w - t + 2;
  },
  /** The conch: two long breathy blasts on one low note that swell and die, from the stair's foot at the dawn and dusk offices. */
  borConch(t, bus, lv) {
    const f = 208 * (0.97 + R() * 0.06);
    let w = t;
    for (let k = 0; k < 2; k++) {
      const d = 3.4 + R() * 1.2;
      this.tone(w, [[0, f * 0.96], [0.5, f], [d, f * 0.98]], d, 0.045 * lv, bus, 'sawtooth', ['bandpass', 560, 2.2]);
      this.cue(w, (x) => this.burst(x, d, 900, 0.8, 0.01 * lv, bus, 0.3));
      w += d + 1.8;
    }
    return w - t + 1;
  },
  /** Rice pounded in a wooden mortar (lesung) by two women with long pestles: the pestles fall in turn, the ends of the trough ringing, a pause now and then. */
  borLesung(t, bus, lv) {
    const n = 14 + Math.floor(R() * 14), gap = 0.34 + R() * 0.06;
    for (let k = 0; k < n; k++) {
      if (k > 0 && k % 8 === 0) { t += 0.5 + R() * 0.4; }
      const at = t + k * gap, end = k % 3 === 2;
      this.cue(at, (x) => { this.knock(x, end ? 330 : 190 + (k % 2) * 40, 0.06 * lv, bus, end ? 0.07 : 0.12); if (end) this.knock(x + 0.03, 640, 0.02 * lv, bus, 0.05); });
    }
    return n * gap + 1.5;
  },
  /** The bird-scarer's clapper line over the paddy: a cord is pulled and a row of bamboo clappers clatter, dying away. */
  borClapper(t, bus, lv) {
    const n = 9 + Math.floor(R() * 8);
    let w = t, g = 0.06;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.knock(x, 1100 + R() * 500, 0.04 * lv, bus, 0.03)); g += 0.012 + R() * 0.02; w += g; }
    return w - t + 0.5;
  },
  /** A wooden bell on a buffalo's neck: hollow knocks at the irregular pace of its steps. */
  borBuffaloBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 7); k < n; k++) { this.cue(w, (x) => { this.knock(x, 460 + R() * 70, 0.04 * lv, bus, 0.09); this.knock(x + 0.06, 700, 0.018 * lv, bus, 0.06); }); w += 0.8 + R() * 1.2; }
    return w - t + 0.5;
  },
  /** The tokay gecko in the thatch at night: a run of clicks, slowing, then the two-note call a few times. */
  borGecko(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 7; k++) { this.cue(w, (x) => this.knock(x, 1600 - k * 50, 0.022 * lv, bus, 0.03)); w += 0.08 + k * 0.014; }
    w += 0.35;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 880], [0.12, 760]], 0.14, 0.028 * lv, bus, 'square', ['bandpass', 1200, 2]));
      this.cue(w + 0.2, (x) => this.tone(x, [[0, 620], [0.2, 520]], 0.26, 0.028 * lv, bus, 'square', ['bandpass', 900, 2]));
      w += 1.0 + R() * 0.2 - k * 0.03;
    }
    return w - t + 1;
  },
  /** The Asian koel in the grove by day: a rising "ko-el" whistle, repeated higher and quicker. */
  borKoel(t, bus, lv) {
    let w = t, f = 720;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, f], [0.18, f * 1.06], [0.34, f * 1.34]], 0.36, 0.03 * lv, bus, 'sine', ['bandpass', f * 1.2, 3]));
      f *= 1.025; w += 0.55 - k * 0.02;
    }
    return w - t + 1.5;
  },
  /** A seller's cry on the way (wordless): flowers, rice or water, a few seconds. */
  borSeller(t, bus, lv) {
    const C = BOR_CRIES[pick(Object.keys(BOR_CRIES))], n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.cry(x, 300 * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem: true, cutoff: 4000 })); w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2; }
    return w - t;
  },
  /** Water over a paddy's bund: a low trickle that runs for a while, here and there a drip into the next field. */
  borTrickle(t, bus, lv) {
    const d = 8 + R() * 6;
    this.rasp(t, d, 1500 + R() * 400, 0.6, 0.016 * lv, bus, 13 + R() * 5, 0.9);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.knock(x, 1250 + R() * 400, 0.012 * lv, bus, 0.04));
    return d + 1;
  },
  /** A buffalo cart on the way: the axle's creak, the wheels' rumble over the stones, the animal's wooden bell, for as long as it takes to pass (`f` the track). */
  borCart(t, bus, lv, f) {
    const dur = f?.dur ?? 14;
    this.rasp(t, dur, 340, 0.8, 0.03 * lv, bus, 7, 0.8);
    this.rasp(t, dur, 1100, 1.6, 0.012 * lv, bus, 3.1, 0.9);
    for (let w = t, k = 0; w < t + dur - 0.5; k++) { this.cue(w, (x) => this.knock(x, 470 + R() * 60, 0.03 * lv, bus, 0.08)); w += 0.9 + R() * 0.7; }
    return dur + 1;
  },
};
export const BOROBUDUR_GAIN = {
  borGamelan: 1.0, borGong: 1.2, borFlute: 1.0, borDrum: 1.3, borChant: 1.0, borBell: 1.4, borConch: 1.2, borLesung: 1.5, borClapper: 1.6, borBuffaloBell: 1.5, borGecko: 1.6, borKoel: 1.2, borSeller: 2.2, borTrickle: 1.3, borCart: 1.3,
};
addVoices('voices-borobudur.js', BOROBUDUR_VOICES, BOROBUDUR_GAIN);
