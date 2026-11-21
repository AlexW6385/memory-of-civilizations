// The placed voices of SG̱ang Gwaay Llnagaay about 1850 (docs/settlements/sgang-gwaay.md §11c; src/settlements/sgang-gwaay/soundmap.js says where each is
// made and when). Added to the engine's VOICES from here (addVoices), every name prefixed `sga`. All synthesised, no samples. [inferred throughout: no
// recording of the village exists; the sounds are those of the dossier's places and works (surf on a pebble beach, the adze on the canoe log, bark beaten
// soft, split fish, the box drum and wordless singing of the great house, ravens and eagles, the drip of the rain forest); pitches and patterns are ours.
// No bell, no horse, no gun: the village of 1850 has none of its own that we show.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 2, 5, 7, 9];

export const SGA_VOICES = {
  /** Surf on a pebble beach: a long swell of noise rising and falling, the rattle of stones drawn back in its wake. */
  sgaSurf(t, bus, lv) {
    const d = 6 + R() * 4, g = 0.6 + 0.4 * Math.max(inSeason(seasonDoy(this), 270, 60, 30), 0);
    this.rasp(t, d, 700 + R() * 250, 0.5, 0.03 * lv * g, bus, 4 + R() * 2, 0.6);
    this.rasp(t + d * 0.45, d * 0.5, 2600, 0.6, 0.012 * lv * g, bus, 22 + R() * 8, 0.9);   // the stones running back
    return d;
  },
  /** Water dripping from the cedar boughs: a few soft plinks at uneven gaps. */
  sgaDrip(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) { const f = 900 + R() * 900; this.cue(w, (x) => this.struck(x, f, 0.007 * lv, bus, [[1, 1, 0.06], [1.7, 0.3, 0.03]])); w += 0.4 + R() * 1.6; }
    return w - t + 0.5;
  },
  /** The fire's crackle: a bed of small dry ticks and, now and then, a pop of resin. */
  sgaFire(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 10); k < n; k++) { this.burst(w, 0.02 + R() * 0.03, 1800 + R() * 2500, 1.2, 0.03 * lv, bus); if (R() < 0.12) this.cue(w, (x) => this.knock(x, 700, 0.02 * lv, bus, 0.03)); w += 0.08 + R() * 0.35; }
    return w - t + 0.4;
  },
  /** The box drum: a cedar box struck with a soft stick, slow groups of four with a stronger first, low and hollow. */
  sgaDrum(t, bus, lv) {
    let w = t;
    const groups = 3 + Math.floor(R() * 4), step = 0.7 + R() * 0.15;
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) { const s = i === 0; this.cue(w, (x) => { this.knock(x, s ? 110 : 140, (s ? 0.08 : 0.05) * lv, bus, s ? 0.22 : 0.14); this.burst(x, 0.03, 500, 1.2, 0.008 * lv, bus); }); w += step * (i === 3 ? 1.15 : 1); }
      w += 0.6 + R() * 0.7;
    }
    return w - t + 0.8;
  },
  /** Low wordless singing over the drum: long phrases of a few notes on a pentatonic, men and women together, falling at the end. */
  sgaSong(t, bus, lv) {
    const f0 = 140 + R() * 30, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.6, 'a'], [SCALE[1 + Math.floor(R() * 3)] - 12, 0.5, 'o'], [-5, 0.9, 'a'], [-7, 0.8, 'o']].slice(0, 2 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1700, fem: i % 2 === 0 }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.8 + R() * 1.1;
    }
    return w - t + 1;
  },
  /** The adze at a canoe log: a dull chop and a long chip's tick, rhythmic, a pause to look along the cut. */
  sgaAdze(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.knock(x, 240, 0.05 * lv, bus, 0.08); this.burst(x + 0.01, 0.05, 2200, 1.4, 0.014 * lv, bus); }); w += 0.55 + R() * 0.25; if (k === 4) w += 1.4; }
    return w - t + 0.7;
  },
  /** Cedar bark beaten soft with a grooved beater: even dull taps, a rustle between. */
  sgaBark(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 330, 0.03 * lv, bus, 0.05); this.burst(x, 0.05, 1200, 0.8, 0.008 * lv, bus); }); w += 0.42 + R() * 0.06; }
    return w - t + 0.6;
  },
  /** A woman's knife through split fish: short wet strokes, a pause, a rinse. */
  sgaKnife(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 0.35, 2800, 0.8, 0.01 * lv, bus, 14, 0.8); w += 0.7 + R() * 0.5; }
    this.rasp(w + 0.2, 0.5, 900, 0.6, 0.012 * lv, bus, 6, 0.7);
    return w - t + 1;
  },
  /** A hide scraped in its frame: long dry strokes of the scraper. */
  sgaScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.55, 1700 + R() * 300, 0.9, 0.016 * lv, bus, 12, 0.8); w += 0.8 + R() * 0.2; }
    return w - t + 0.6;
  },
  /** A wedge driven into cedar with a maul: a hollow knock and the plank's crack, two or three, a pause. */
  sgaSplit(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.knock(x, 200, 0.07 * lv, bus, 0.1); this.burst(x + 0.015, 0.07, 1500, 1.5, 0.02 * lv, bus); }); w += 0.9 + R() * 0.6; }
    this.cue(w, (x) => { this.burst(x, 0.25, 900, 0.8, 0.03 * lv, bus); });
    return w - t + 1;
  },
  /** A paddle laid on a canoe's gunwale and a dip: a wooden knock and a soft slop of water. */
  sgaPaddle(t, bus, lv) {
    this.cue(t, (x) => this.knock(x, 280, 0.04 * lv, bus, 0.07));
    this.rasp(t + 0.3, 0.6, 1300, 0.6, 0.012 * lv, bus, 7, 0.7);
    this.cue(t + 1.2, (x) => this.knock(x, 300, 0.03 * lv, bus, 0.06));
    return 2;
  },
  /** Weaving: the soft clack of the weaving sticks and the pull of the bark strip, steady. */
  sgaWeave(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.knock(x, 420, 0.02 * lv, bus, 0.04); this.burst(x, 0.04, 2000, 1.2, 0.006 * lv, bus); }); w += 0.6 + R() * 0.4; }
    return w - t + 0.6;
  },
  /** The cooking box: hot stones dropped into water with a hiss and a gurgle, and the tongs' knock. */
  sgaSteam(t, bus, lv) {
    this.cue(t, (x) => this.knock(x, 380, 0.03 * lv, bus, 0.05));
    this.rasp(t + 0.1, 1.2, 3600, 0.5, 0.016 * lv, bus, 30, 0.9);
    this.rasp(t + 0.4, 1.4, 500, 0.6, 0.012 * lv, bus, 5, 0.7);
    return 2;
  },
  /** A raven: a deep croak, three or four, with the odd liquid bell-like note [inferred: the ravens of the coast croak and "knock" and gurgle]. */
  sgaRaven(t, bus, lv) {
    const n = 2 + Math.floor(R() * 3), f = 320 * (0.9 + R() * 0.25);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.45, (x) => this.tone(x, [[0, f * 1.15], [0.12, f * 0.85]], 0.2, 0.04 * lv, bus, 'sawtooth', ['bandpass', 900, 2]));
    if (R() < 0.4) this.cue(t + n * 0.45 + 0.2, (x) => this.tone(x, [[0, 1100], [0.1, 700]], 0.14, 0.02 * lv, bus, 'sine'));
    return n * 0.45 + 0.8;
  },
  /** A bald eagle's high chittering piping, a run of thin notes falling [inferred: the bird's own weak, piping call]. */
  sgaEagle(t, bus, lv) {
    const n = 5 + Math.floor(R() * 5);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.13, (x) => this.tone(x, [[0, 3300 - k * 40], [0.06, 2700]], 0.1, 0.014 * lv, bus, 'triangle', ['bandpass', 3000, 3]));
    return n * 0.13 + 0.8;
  },
  /** A sea lion's low grunting bark across the water, far off. */
  sgaSeal(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => this.tone(x, [[0, 170], [0.2, 120]], 0.35, 0.04 * lv, bus, 'sawtooth', ['lowpass', 500, 1])); w += 0.6 + R() * 0.8; }
    return w - t + 1;
  },
  /** Children at play on the beach: high wordless calls and laughter, short. */
  sgaPlay(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { const f0 = 380 + R() * 80; this.cue(w, (x) => this.cry(x, f0, [[0, 0.25, 'a'], [3, 0.2, 'e'], [-2, 0.3, 'a']], 0.02 * lv, bus, { cutoff: 2600, fem: true })); w += 0.7 + R() * 1.1; }
    return w - t + 0.8;
  },
};

addVoices('voices-sgang.js', SGA_VOICES);
