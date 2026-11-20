// Voices of Angkor c. 1150 (docs/settlements/angkor.md §33), added to the placed voices of voices.js through addVoices, every name prefixed `ak`.
// Each is a method `name(t, bus, lv)` of Music returning how long it lasts; all synthesised. [inferred throughout: no recording of 12th-century Angkor
// exists. What the reliefs of Angkor Wat show of the 12th century is drums (shoulder-carried, hourglass, goblet), conchs, trumpets and cymbals, and
// harps in the palace and offering scenes [stated: soundsofangkor.org, old orchestras 7th-16th c.]; gong chimes and oboes are of the 16th century and are
// not here. The pitches, contours and rhythms are ours.]

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** The arched harp's five-note mode: semitones from the tonic. */
const MODE = [0, 2, 4, 7, 9];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 5) * 12 + MODE[((deg % 5) + 5) % 5]) / 12);
/** The market women's cries (wordless): [semitones, seconds, vowel]. */
export const AK_CRIES = {
  greens: [[0, 0.3, 'a'], [5, 0.35, 'o'], [3, 0.9, 'a']],
  fish: [[4, 0.3, 'e'], [0, 0.3, 'a'], [-3, 1.0, 'o']],
  pots: [[2, 0.35, 'o'], [7, 0.4, 'a'], [4, 0.5, 'o'], [0, 0.8, 'a']],
};

export const ANGKOR_VOICES = {
  /** The conch: a long breathy blast on one low note that swells and dies, twice, from the terrace at the dawn and dusk offices. */
  akConch(t, bus, lv) {
    const f = 196 * (0.97 + R() * 0.06);
    let w = t;
    for (let k = 0; k < 2; k++) {
      const d = 3.2 + R() * 1.2;
      this.tone(w, [[0, f * 0.96], [0.4, f], [d, f * 0.98]], d, 0.05 * lv, bus, 'sawtooth', ['bandpass', 520, 2.2]);
      this.cue(w, (x) => this.burst(x, d, 900, 0.8, 0.012 * lv, bus, 0.3));
      w += d + 1.6;
    }
    return w - t + 1.5;
  },
  /** The hourglass drum: a short rhythmic phrase of dull and bright strokes, a few bars. */
  akDrum(t, bus, lv) {
    const beat = 0.2 + R() * 0.05, pat = [1, 0, 0.6, 0.6, 1, 0, 0.6, 0, 1, 0.6, 0.6, 0.6];
    const n = 2 + Math.floor(R() * 2);
    for (let b = 0; b < n; b++) pat.forEach((a, i) => { if (a) this.cue(t + (b * pat.length + i) * beat, (x) => { this.knock(x, a > 0.8 ? 150 : 260, 0.06 * lv * a, bus, 0.12); if (a > 0.8) this.burst(x, 0.05, 700, 1, 0.02 * lv, bus); }); });
    return n * pat.length * beat + 0.6;
  },
  /** A pair of small cymbals: a bright inharmonic clash and its ring, struck now and then on the drum's beat. */
  akCymbals(t, bus, lv) {
    const n = 3 + Math.floor(R() * 4), beat = 0.55 + R() * 0.2;
    for (let k = 0; k < n; k++) this.cue(t + k * beat, (x) => { this.struck(x, 3100 + R() * 400, 0.018 * lv, bus, [[1, 1, 0.5], [1.53, 0.7, 0.4], [2.4, 0.5, 0.3], [3.7, 0.3, 0.2]]); this.burst(x, 0.06, 5000, 1.5, 0.012 * lv, bus); });
    return n * beat + 0.8;
  },
  /** The arched harp's note: a plucked string, a triangle fundamental with two partials. */
  akHarpNote(when, f, level, dest) {
    const ctx = this.ctx;
    for (const [r, a, d, ty] of [[1, 1, 1.4, 'triangle'], [2, 0.28, 0.7, 'sine'], [3, 0.1, 0.3, 'sine']]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ty; o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
    this.burst(when, 0.02, 2200, 1.2, level * 0.3, dest);
    return 1.4;
  },
  /** The arched harp played by the temple's musicians: a slow wandering line in a five-note mode with a drone below. */
  akHarp(t, bus, lv) {
    const tonic = 261.63;
    let w = t, deg = 4 + Math.floor(R() * 3);
    for (let k = 0, n = 9 + Math.floor(R() * 8); k < n; k++) {
      const last = k === n - 1;
      this.cue(w, (x) => this.akHarpNote(x, note(last ? 0 : deg, tonic), 0.04 * lv, bus));
      if (k % 4 === 0) this.cue(w, (x) => this.akHarpNote(x, note(last ? -5 : deg - 5, tonic), 0.025 * lv, bus));
      w += last ? 0.9 : R() < 0.25 ? 0.7 : 0.38 + R() * 0.14;
      deg = clamp(deg + pick([-2, -1, -1, 1, 1, 2]), 0, 9);
    }
    return w - t + 1.5;
  },
  /** The Brahmins' chant: low men's voices on a drone, a fifth above answering, a phrase that rises and falls, ten seconds or so. */
  akChant(t, bus, lv) {
    const f0 = 110 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 2.6, 'o'], [0, 2.0, 'a']], 0.05 * lv, bus, { cutoff: 2200 });
    this.cry(t + 0.3, f0 * 1.5, [[0, 2.0, 'u'], [-2, 2.4, 'o']], 0.028 * lv, bus, { cutoff: 2000 });
    this.cry(t + 4.8, f0 * 2, [[0, 0.9, 'o'], [2, 0.9, 'a'], [3, 0.9, 'o'], [0, 2.4, 'a']], 0.05 * lv, bus, { cutoff: 2600 });
    this.cry(t + 5.0, f0, [[0, 5.0, 'o']], 0.034 * lv, bus, { cutoff: 1800 });
    return 11;
  },
  /** A market woman's cry (wordless), a few seconds. */
  akHawk(t, bus, lv) {
    const C = AK_CRIES[pick(Object.keys(AK_CRIES))], n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.cry(x, 300 * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem: true, cutoff: 4000 })); w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2; }
    return w - t;
  },
  /** The rice husker: the long beam's pestle dropped into the stone mortar, a dull thud and the beam's creak, at a treading pace. */
  akPestle(t, bus, lv) {
    const n = 8 + Math.floor(R() * 10), gap = 1.15 + R() * 0.25;
    for (let k = 0; k < n; k++) this.cue(t + k * gap, (x) => { this.knock(x, 110, 0.07 * lv, bus, 0.16); this.rasp(x + 0.1, 0.25, 600, 1, 0.012 * lv, bus, 30, 0.6); });
    return n * gap + 0.5;
  },
  /** The smith's bellows: two bamboo pistons, a soft double rush of air. */
  akBellows(t, bus, lv) {
    const n = 5 + Math.floor(R() * 5);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.9, (x) => { this.rasp(x, 0.35, 1400, 0.7, 0.02 * lv, bus, 12, 0.5); this.rasp(x + 0.4, 0.3, 1200, 0.7, 0.016 * lv, bus, 12, 0.5); });
    return n * 0.9 + 0.4;
  },
  /** A wooden cattle bell: a hollow knock, a few at the irregular pace of a grazing buffalo's step. */
  akCattleBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.knock(x, 520 + R() * 80, 0.04 * lv, bus, 0.08); this.knock(x + 0.05, 780, 0.02 * lv, bus, 0.06); }); w += 0.7 + R() * 1.2; }
    return w - t + 0.4;
  },
  /** A water buffalo's low call: a long hollow bellow that sags, a snort after. */
  akBuffalo(t, bus, lv) {
    const f = 95 + R() * 15, d = 1.6 + R() * 0.8;
    this.tone(t, [[0, f * 1.1], [d * 0.3, f * 1.25], [d, f * 0.8]], d, 0.05 * lv, bus, 'sawtooth', ['bandpass', 380, 1.6]);
    this.cue(t + d, (x) => this.rasp(x, 0.4, 700, 0.8, 0.02 * lv, bus, 40, 0.7));
    return d + 1.2;
  },
  /** The tokay gecko in the thatch at night: a run of rattling clicks, slowing, then the two-note "to-kay" a few times. */
  akGecko(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 8; k++) { this.cue(w, (x) => this.knock(x, 1500 - k * 40, 0.025 * lv, bus, 0.03)); w += 0.07 + k * 0.012; }
    w += 0.3;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 900], [0.12, 780]], 0.14, 0.03 * lv, bus, 'square', ['bandpass', 1200, 2]));
      this.cue(w + 0.2, (x) => this.tone(x, [[0, 640], [0.2, 540]], 0.25, 0.03 * lv, bus, 'square', ['bandpass', 900, 2]));
      w += 0.95 + R() * 0.2 - k * 0.03;
    }
    return w - t + 1;
  },
  /** An elephant's trumpet: a rising blare on a harsh reed-like tone, a falling rumble. */
  akElephant(t, bus, lv) {
    const f = 420 + R() * 80;
    this.tone(t, [[0, f * 0.7], [0.25, f * 1.5], [1.1, f * 1.4], [1.7, f * 0.8]], 1.8, 0.05 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.4]);
    this.cue(t + 1.8, (x) => this.tone(x, [[0, 70], [1.2, 55]], 1.4, 0.04 * lv, bus, 'sawtooth', ['lowpass', 220, 0.8]));
    return 3.6;
  },
};
export const ANGKOR_GAIN = {
  akConch: 1.2, akDrum: 1.4, akCymbals: 1.3, akHarp: 0.25, akChant: 1.0, akHawk: 2.2, akPestle: 1.6, akBellows: 1.8, akCattleBell: 1.5, akBuffalo: 1.2, akGecko: 1.6, akElephant: 1.0,
};
import { addVoices } from './voices.js';
// (registered here, not in voices.js: this module is imported by the sound map's profile line in soundscape.js)
addVoices('voices-angkor.js', ANGKOR_VOICES, ANGKOR_GAIN);
