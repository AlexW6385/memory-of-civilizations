// The placed voices of Petra about AD 50 (docs/settlements/petra.md §25; src/settlements/petra/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `pt`; the engine's own voices that suit (the potter's wheel and clay, the
// jars' lids, the oil poured, cloth, the sack, the coin, the well's bucket) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of Nabataean music or work exists; the instruments are those the dossier names (a
// lyre, a reed pipe, a frame drum: caravan music of Arabia, §9; Strabo's two musicians to each company, §14), the camels' wooden bells and groans
// are those of any caravan, the pitches and patterns are ours. The birds are those of Petra today (Tristram's starling, the brown-necked raven, the
// desert eagle-owl, the golden jackal), which the place had then too.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 1, 4, 5, 7, 8, 10];                                       // the scale of music.js (a Phrygian-dominant mode over the tonic)
const hz = (root, deg) => root * Math.pow(2, (Math.floor(deg / 7) * 12 + SCALE[((deg % 7) + 7) % 7]) / 12);

/** The sellers' cries (wordless): [semitones above the voice's base, seconds, vowel]. */
const CRIES = {
  incense: [[0, 0.35, 'a'], [5, 0.4, 'o'], [7, 1.0, 'a']],
  spice: [[2, 0.3, 'e'], [7, 0.3, 'a'], [4, 0.9, 'o']],
  water: [[0, 0.25, 'u'], [3, 0.25, 'o'], [-2, 1.1, 'a']],
};

export const PT_VOICES = {
  /** The lyre: a slow phrase of plucked strings over a drone string, each ringing and dying. */
  ptLyre(t, bus, lv) {
    const root = 196, n = 6 + Math.floor(R() * 6);
    this.cue(t, (x) => this.struck(x, root / 2, 0.026 * lv, bus, [[1, 1, 2.2], [2, 0.3, 1.2], [3, 0.12, 0.6]]));
    let w = t + 0.4, k = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(11, k + Math.floor(R() * 5) - 2));
      const f = hz(root, k), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.4], [2, 0.34, 0.8], [3, 0.14, 0.45], [4.03, 0.06, 0.25]]));
      w += 0.5 + R() * 0.8;
    }
    this.cue(w, (x) => this.struck(x, root, 0.03 * lv, bus, [[1, 1, 2.0], [2, 0.3, 1.0]]));
    return w - t + 2.2;
  },
  /** A reed pipe: breathy held notes with a little vibrato, a phrase that falls back to the tonic. */
  ptPipe(t, bus, lv) {
    const root = 392, n = 5 + Math.floor(R() * 5);
    let w = t, k = 4 + Math.floor(R() * 2);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, i === n - 1 ? 0 : k + Math.floor(R() * 3) - 1));
      const f = hz(root, k), len = 0.45 + R() * 1.3, at = w;
      this.cue(at, (x) => { this.tone(x, [[0, f * 0.97], [0.07, f], [len * 0.5, f * 1.006], [len, f * 0.995]], len, 0.016 * lv, bus, 'triangle', ['bandpass', f * 1.6, 2.5]); this.rasp(x, len, f * 2, 1.4, 0.004 * lv, bus, 7, 0.4); });
      w += len + 0.08 + R() * 0.35;
    }
    return w - t + 0.8;
  },
  /** A frame drum (the tof): the deep stroke at the middle, the high one at the rim, in a pattern of eight, a roll to end it. */
  ptFrameDrum(t, bus, lv) {
    const pat = ['D', 't', 't', 'D', 't', 'D', 't', 't'], beat = 0.34 + R() * 0.06, bars = 3 + Math.floor(R() * 3);
    let w = t;
    for (let b = 0; b < bars; b++) for (const s of pat) {
      const at = w;
      this.cue(at, (x) => { if (s === 'D') { this.tone(x, [[0, 150], [0.1, 95]], 0.35, 0.05 * lv, bus, 'sine', ['lowpass', 420]); this.knock(x, 110, 0.03 * lv, bus, 0.1); } else { this.burst(x, 0.05, 2200, 1.2, 0.02 * lv, bus); this.knock(x, 330, 0.012 * lv, bus, 0.05); } });
      w += beat;
    }
    for (let k = 0; k < 8; k++) this.cue(w + k * 0.07, (x) => this.knock(x, 140 + k * 8, (0.014 + k * 0.003) * lv, bus, 0.07));
    return w - t + 1.2;
  },
  /** A camel's groan and bubbling bleat: a low sawtooth sliding up and settling, a gargle of noise. */
  ptCamel(t, bus, lv) {
    const f = 88 + R() * 25, d = 1.1 + R() * 0.9;
    this.tone(t, [[0, f], [0.25, f * 1.5], [d * 0.6, f * 1.25], [d, f * 0.8]], d, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520]);
    this.rasp(t + 0.1, d, 420, 1.1, 0.016 * lv, bus, 22, 0.9);
    if (R() < 0.4) this.cue(t + d + 0.5, (x) => this.tone(x, [[0, f * 1.1], [0.4, f * 0.75]], 0.6, 0.035 * lv, bus, 'sawtooth', ['lowpass', 480]));
    return d + 1.4;
  },
  /** A caravan passing: the wooden bells knocking at the camels' pace, the soft footfalls, a driver's low call, a groan; for as long as it takes to pass (`f.dur`). */
  ptCaravan(t, bus, lv, f) {
    const dur = f.dur, step = 0.95 + R() * 0.2, notes = [236, 262, 294, 330];
    for (let k = 0, n = Math.floor(dur / step); k < n; k++) {
      const w = t + k * step + R() * 0.12, c = notes[(k * 3 + Math.floor(R() * 2)) % notes.length];
      this.cue(w, (x) => { this.knock(x, c, 0.03 * lv, bus, 0.14); this.knock(x + 0.18 + R() * 0.1, c * 1.25, 0.018 * lv, bus, 0.1); this.burst(x, 0.12, 200, 0.9, 0.02 * lv, bus); });
    }
    this.rasp(t, dur, 160, 0.7, 0.01 * lv, bus, 1.1, 0.8);
    this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.cry(x, 140 * (0.93 + R() * 0.14), [[0, 0.4, 'o'], [-3, 0.4, 'a'], [-5, 1.0, 'o']], 0.04 * lv, bus, { cutoff: 2600 }));
    if (R() < 0.6) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.tone(x, [[0, 95], [0.3, 135], [1.0, 80]], 1.1, 0.04 * lv, bus, 'sawtooth', ['lowpass', 500]));
    return dur + 1;
  },
  /** The wind in the Siq: a long hollow breath between the walls, now and then a thin whistle in a crack. */
  ptSiqWind(t, bus, lv) {
    const d = 6 + R() * 4;
    this.rasp(t, d, 260 + R() * 80, 0.6, 0.028 * lv, bus, 0.35, 0.9);
    this.rasp(t + 0.5, d - 1, 700, 1.6, 0.007 * lv, bus, 0.5, 0.9);
    if (R() < 0.35) this.tone(t + d * 0.3, [[0, 520], [1.5, 600], [3, 540]], 3, 0.004 * lv, bus, 'sine', ['bandpass', 560, 6]);
    return d;
  },
  /** Water in the channel cut in the Siq's wall and in the clay pipe: a thin running, plinks, a gurgle where the pipe's sections join. */
  ptChannel(t, bus, lv) {
    const d = 6 + R() * 3;
    this.rasp(t, d, 1700 + R() * 400, 0.8, 0.012 * lv, bus, 28, 0.7);
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) this.cue(t + R() * d, (x) => this.tone(x, [[0, 900 + R() * 600], [0.04, 1900 + R() * 900]], 0.05, 0.012 * lv, bus, 'sine'));
    if (R() < 0.5) this.cue(t + d * 0.5, (x) => { this.tone(x, [[0, 220], [0.2, 330], [0.4, 250]], 0.5, 0.012 * lv, bus, 'sine', ['bandpass', 400, 3]); });
    return d;
  },
  /** The Nymphaeum's lion-head spouts and the street's basins: water falling into water, louder and fuller. */
  ptFountain(t, bus, lv) {
    const d = 8 + R() * 4;
    this.rasp(t, d, 1400 + R() * 400, 0.5, 0.022 * lv, bus, 45, 0.5);
    this.rasp(t + 0.2, d - 0.4, 3200, 0.8, 0.007 * lv, bus, 60, 0.6);
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + R() * d, (x) => this.tone(x, [[0, 600 + R() * 500], [0.06, 1300 + R() * 700]], 0.07, 0.013 * lv, bus, 'sine'));
    return d;
  },
  /** A saddle quern: the upper stone pushed and drawn over the lower, a dry scrape each way in a steady rhythm; a pause to sweep the meal. */
  ptQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.5, 1250 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.8; }
    this.rasp(w + 0.2, 0.5, 2300, 0.7, 0.012 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** A seller's cry along the colonnaded street: wordless, the contour of the trade (incense, spice, water). */
  ptHawk(t, bus, lv) {
    const keys = Object.keys(CRIES), C = CRIES[keys[Math.floor(R() * keys.length)]], n = R() < 0.35 ? 2 : 1, fem = R() < 0.3;
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.cry(x, (fem ? 260 : 148) * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem, cutoff: 3600 }));
      w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2;
    }
    return w - t;
  },
  /** Tristram's starling: clear whistled glides, up and over, three or four in a phrase. */
  ptStarling(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const f = 1700 + R() * 700, len = 0.25 + R() * 0.25;
      this.cue(w, (x) => this.tone(x, [[0, f], [len * 0.5, f * 1.35], [len, f * 1.1]], len, 0.016 * lv, bus, 'sine'));
      w += len + 0.12 + R() * 0.25;
    }
    return w - t + 0.4;
  },
  /** The chant at the great altar: low voices on a long drone, a slow phrase above it, ending on the drone (wordless). */
  ptChant(t, bus, lv) {
    const f0 = 98 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 3.0, 'o'], [0, 2.2, 'a']], 0.05 * lv, bus, { cutoff: 2000 });
    this.cry(t + 0.3, f0 * 1.5, [[0, 2.6, 'u'], [1, 2.4, 'o']], 0.03 * lv, bus, { cutoff: 1900 });
    this.cry(t + 5.4, f0 * 2, [[0, 1.3, 'a'], [-1, 1.0, 'o'], [-5, 1.3, 'a'], [-1, 1.0, 'o'], [-5, 2.6, 'u']], 0.05 * lv, bus, { cutoff: 2400 });
    this.cry(t + 5.6, f0, [[0, 6.0, 'o']], 0.035 * lv, bus, { cutoff: 1700 });
    return 12.5;
  },
  /** A jackal's howl from the massif at night, answered by yips. */
  ptJackal(t, bus, lv) {
    const f = 380 + R() * 80;
    this.tone(t, [[0, f], [0.7, f * 1.65], [1.9, f * 1.5], [2.8, f * 1.05]], 2.8, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1000, 2.5]);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 3.3 + k * (0.22 + R() * 0.1), (x) => this.tone(x, [[0, f * 1.4], [0.07, f * 1.9], [0.14, f * 1.3]], 0.15, 0.022 * lv, bus, 'sawtooth', ['bandpass', 1300, 3]));
    return 5.2;
  },
  /** The desert eagle-owl: a deep two-note hoot, the second a little lower, repeated after a pause. */
  ptOwl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 360], [0.15, 330], [0.55, 300]], 0.6, 0.03 * lv, bus, 'sine', ['lowpass', 800]));
      this.cue(w + 0.8, (x) => this.tone(x, [[0, 340], [0.15, 310], [0.7, 270]], 0.8, 0.028 * lv, bus, 'sine', ['lowpass', 760]));
      w += 3.2 + R() * 1.2;
    }
    return w - t;
  },
};

addVoices('voices-petra.js', PT_VOICES);
