// The placed voices of Mohenjo-daro about 2500 BC (docs/settlements/mohenjo-daro.md §16.3; src/settlements/mohenjo-daro/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `md`; the engine's own voices that suit (the potter's wheel and clay, the hammer, the kitchen,
// the jars' lids, the well's bucket, the pour, cloth, sacks, the boat, cicadas, frogs and birds) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: nothing of the city's sound survives; clay rattles and bird-shaped whistles are known finds, the bull-cart's creak is the sound of solid wheels on an
// axle, the instruments are stand-ins: a reed pipe, a hand drum.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 2, 3, 5, 7, 9, 10];                                  // the Dorian-like mode of music.js
const hz = (root, st) => root * Math.pow(2, st / 12);

export const MD_VOICES = {
  /** The clay rattle of a child: runs of tiny pebbles in a hollow, a few shakes, some quick, some slow. */
  mdRattle(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 2 + Math.floor(R() * 4); s < ns; s++) {
      for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) this.cue(w + k * 0.05, (x) => this.struck(x, 2600 + R() * 1500, 0.009 * lv, bus, [[1, 1, 0.07], [1.6, 0.4, 0.05]]));
      w += 0.45 + R() * 0.9;
    }
    return w - t + 0.4;
  },
  /** The bird-shaped whistle: two or three short warbling notes, high and thin. */
  mdWhistle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { const f = 1700 + R() * 700, len = 0.12 + R() * 0.1; this.cue(w, (x) => this.tone(x, [[0, f], [len * 0.4, f * 1.18], [len, f * 0.96]], len, 0.012 * lv, bus, 'sine')); w += len + 0.08 + R() * 0.2; }
    return w - t + 0.3;
  },
  /** The bead-maker's drill: the thin hiss of the stone bit in the carnelian, backward and forward under the bow, a tap now and then. */
  mdDrill(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.45, 3400 + R() * 500, 1.4, 0.012 * lv, bus, 30, 0.85); w += 0.5 + R() * 0.12; if (R() < 0.12) this.cue(w, (x) => this.knock(x, 900, 0.015 * lv, bus, 0.04)); }
    return w - t + 0.5;
  },
  /** The shell-worker's saw: a coarse rasp, long strokes pushed and drawn through a conch, pauses to turn the shell. */
  mdShellSaw(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.5, 1500 + R() * 300, 0.7, 0.02 * lv, bus, 14, 0.8); w += 0.6; if (k % 5 === 4) w += 0.7; }
    return w - t + 0.5;
  },
  /** The saddle quern: the upper stone pushed and drawn over the lower, a dry scrape each way, steady. */
  mdQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.5, 1200 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.8; }
    return w - t + 1;
  },
  /** The bellows at the bronze-smith's hearth: a breath of air in and out, a low roar of the fire answering. */
  mdBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.7, 520, 0.5, 0.018 * lv, bus, 3, 0.4); this.rasp(w + 0.7, 0.5, 900, 0.5, 0.01 * lv, bus, 5, 0.4); w += 1.5; }
    return w - t + 0.5;
  },
  /** An ox-cart on solid wheels: the long groan of the wooden axle turning in its bearing, a bump of the disc wheels, the dull bell of the ox; passes along `f` (a place that moves). */
  mdCart(t, bus, lv, f) {
    const dur = f?.dur ?? 8;
    for (let w = 0; w < dur; w += 1.1 + R() * 0.3) {
      const g = 380 + R() * 80;
      this.cue(t + w, (x) => this.tone(x, [[0, g], [0.5, g * 1.12], [0.9, g * 0.94]], 0.9, 0.006 * lv, bus, 'sawtooth', ['bandpass', 700, 5]));
      this.cue(t + w + 0.2, (x) => this.knock(x, 130, 0.03 * lv, bus, 0.08));
    }
    for (let w = 0.4; w < dur; w += 1.6 + R() * 0.6) this.cue(t + w, (x) => this.struck(x, 640, 0.012 * lv, bus, [[1, 1, 0.5], [2.4, 0.3, 0.25]]));
    return dur;
  },
  /** The ox's bell alone: a dull clay-and-bronze clank, two or three, as the beast shifts. */
  mdOxBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => this.struck(x, 560 + R() * 80, 0.016 * lv, bus, [[1, 1, 0.55], [2.3, 0.35, 0.3]])); w += 0.5 + R() * 0.7; }
    return w - t + 0.6;
  },
  /** The Indus at its bank: a long breath of brown water, louder in the flood (summer melt), low in the winter. */
  mdRiver(t, bus, lv) {
    const flood = 0.45 + 0.55 * Math.max(inSeason(seasonDoy(this), 150, 260, 30), 0), d = 8 + R() * 4;
    this.rasp(t, d, 450 + R() * 150, 0.5, 0.03 * lv * flood, bus, 5 + R() * 3, 0.5);
    this.rasp(t + 0.3, d - 0.6, 1800, 0.7, 0.007 * lv * flood, bus, 13, 0.7);
    return d;
  },
  /** The drip of the Great Bath's drain: single drops into the stone channel, spaced and slow. */
  mdDrip(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => this.struck(x, 1500 + R() * 600, 0.012 * lv, bus, [[1, 1, 0.12], [1.9, 0.3, 0.06]])); w += 0.7 + R() * 1.4; }
    return w - t + 0.3;
  },
  /** A reed pipe: a thin held drone and a short line over it in the mode, settling back. */
  mdPipe(t, bus, lv) {
    const dur = 10 + R() * 6, root = 294;
    this.tone(t, [[0, root], [dur, root]], dur, 0.012 * lv, bus, 'triangle', ['bandpass', 900, 2]);
    let w = t + 1.2, k = 2;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(10, k + Math.floor(R() * 3) - 1));
      const f = hz(root, SCALE[k % 7] + 12 * Math.floor(k / 7)), len = 0.4 + R() * 1.1;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.985], [0.07, f], [len, f * 1.003]], len, 0.026 * lv, bus, 'triangle', ['bandpass', 1400, 3]));
      w += len + 0.12 + R() * 0.4;
    }
    return dur + 1;
  },
  /** The hand drum of the market: a slow pattern of low and high strokes. */
  mdDrum(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { const hi = [0, 2, 3, 6].includes(k % 8); this.cue(w, (x) => this.knock(x, hi ? 330 : 170, (hi ? 0.03 : 0.045) * lv, bus, 0.12)); w += k % 4 === 3 ? 0.9 : 0.45; }
    return w - t + 0.6;
  },
  /** A boatman's call over the water: wordless, two falling notes, from far off. */
  mdCall(t, bus, lv) {
    for (const [d, f] of [[0, 210], [0.6, 180], [1.4, 150]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.4, 'o'], [-3, 0.5, 'a']], 0.035 * lv, bus, { cutoff: 2400, fem: false }));
    return 3;
  },
};

addVoices('voices-mohenjo-daro.js', MD_VOICES);
