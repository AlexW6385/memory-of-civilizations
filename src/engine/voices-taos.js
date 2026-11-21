// The placed voices of Taos Pueblo about 1500 (docs/settlements/taos.md §10.3; src/settlements/taos/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `tao`; the engine's own voices that suit (the jars' lids, cloth, clay,
// the kitchen's pots) are used by the map as they are. All synthesised, no samples. [inferred throughout: no recording of the pueblo of 1500 exists;
// the instruments and works are those the dossier names (the hide drum and rattle, the cedar flute, the metate and mano, the loom's batten, puddled
// adobe laid by hand, turkeys kept in the pueblo); the pitches and patterns are ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 2, 5, 7, 9];                                         // a pentatonic over the tonic (the flute)
const hz = (root, st) => root * Math.pow(2, st / 12);

export const TAO_VOICES = {
  /** A hide drum beaten with a padded stick: a steady, slow beat in groups, a stronger first of each, soft and low, dying between phrases (a man drumming at his door, not a ceremony). */
  taoDrum(t, bus, lv) {
    let w = t;
    const groups = 3 + Math.floor(R() * 4), step = 0.62 + R() * 0.16;
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) { const strong = i === 0; this.cue(w, (x) => { this.knock(x, strong ? 92 : 120, (strong ? 0.07 : 0.045) * lv, bus, strong ? 0.26 : 0.16); this.burst(x, 0.04, 300, 1.2, 0.01 * lv, bus); }); w += step; }
      w += 0.5 + R() * 0.6;
    }
    return w - t + 0.8;
  },
  /** Low wordless voices in unison over the beat (a song without words as heard from across the plaza): a few long falling phrases on o and a. */
  taoSong(t, bus, lv) {
    const f0 = 150 + R() * 25, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.5, 'o'], [-2, 0.5, 'a'], [-5, 0.9, 'o'], [-7, 0.7, 'a']].slice(0, 2 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1800, fem: false }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.7 + R() * 1.0;
    }
    return w - t + 1;
  },
  /** The gourd rattle: a few shakes, a dry short rush each. */
  taoRattle(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 4 + Math.floor(R() * 5); s < ns; s++) {
      for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) this.cue(w + k * 0.05, (x) => this.struck(x, 2600 + R() * 1200, 0.007 * lv, bus, [[1, 1, 0.05], [1.8, 0.35, 0.03]]));
      w += 0.46 + R() * 0.12;
    }
    return w - t + 0.4;
  },
  /** The cedar flute: breathy, a slow pentatonic line, each note swelling and falling, a breath of air before it. */
  taoFlute(t, bus, lv) {
    const root = 294, n = 7 + Math.floor(R() * 6);
    let w = t, k = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const st = SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length), f = hz(root, st), len = 0.6 + R() * 1.3, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.03, len * 0.6, f * 2, 3, 0.004 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.97], [0.09, f], [len, f * 1.004]], len, 0.016 * lv, bus, 'triangle', ['bandpass', f * 1.4, 1.3]);
      });
      w += len + 0.1 + R() * 0.6;
    }
    return w - t + 1.2;
  },
  /** The metate: the mano pushed and drawn over the slab in a steady rhythm, a dry scrape each way, now and then a soft hum between the strokes. */
  taoMetate(t, bus, lv) {
    let w = t;
    const n = 14 + Math.floor(R() * 12), beat = 0.7 + R() * 0.12;
    for (let k = 0; k < n; k++) {
      this.rasp(w, beat * 0.6, 1500 + R() * 300, 0.8, 0.02 * lv, bus, 5, 0.7);
      if (k % 6 === 3 && R() < 0.6) this.cue(w + 0.1, (x) => this.cry(x, 180 + R() * 20, [[0, 0.5, 'o'], [-2, 0.6, 'o']], 0.014 * lv, bus, { cutoff: 1500, fem: true }));
      w += beat;
    }
    this.rasp(w + 0.2, 0.4, 2400, 0.7, 0.01 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** The upright loom's batten: the weaver beats the weft up, a flat wooden clap and a soft thud, a pause for the shed. */
  taoBatten(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 260, 0.05 * lv, bus, 0.07); this.burst(x, 0.03, 1800, 1.5, 0.01 * lv, bus); });
      w += 1.0 + R() * 1.6;
    }
    return w - t + 1;
  },
  /** A hide scraped taut in its frame: long dry strokes of a scraper, a rhythm of five or six. */
  taoScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.5, 1900 + R() * 400, 0.9, 0.018 * lv, bus, 12, 0.8); w += 0.75 + R() * 0.2; }
    return w - t + 0.6;
  },
  /** The potter's polishing stone on a dried jar: a soft, quick rubbing, then a pause. */
  taoPolish(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.rasp(w, 1.1 + R() * 0.6, 3000, 0.8, 0.009 * lv, bus, 24, 0.9); w += 1.8 + R() * 0.8; }
    return w - t + 0.6;
  },
  /** The flint knapper's chips: sharp small taps and a flake's tick, at uneven intervals. */
  taoKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.struck(x, 2100 + R() * 900, 0.012 * lv, bus, [[1, 1, 0.04], [2.3, 0.4, 0.02]]); this.knock(x, 520, 0.012 * lv, bus, 0.03); }); w += 0.5 + R() * 1.2; }
    return w - t + 0.6;
  },
  /** Wet mud laid on a wall by hand: soft slaps and a drag, in a rhythm. */
  taoMudSlap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.knock(x, 150, 0.03 * lv, bus, 0.07); this.burst(x, 0.09, 900, 0.8, 0.014 * lv, bus); }); w += 0.7 + R() * 0.7; }
    return w - t + 0.6;
  },
  /** A stone axe splitting piñon: a dull thud and the wood's crack, two or three times with a pause. */
  taoChop(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => { this.knock(x, 170, 0.07 * lv, bus, 0.1); this.burst(x + 0.01, 0.06, 1700, 1.5, 0.02 * lv, bus); }); w += 1.1 + R() * 0.9; }
    return w - t + 0.8;
  },
  /** A turkey's gobble: a run of rapid, rattling pulses falling in pitch, then soft clucking. */
  taoGobble(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), f = 470 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.08, (x) => this.tone(x, [[0, f * (1 - k * 0.02)], [0.05, f * 0.7]], 0.07, 0.045 * lv, bus, 'sawtooth', ['bandpass', 650, 2]));
    for (let k = 0; k < 3; k++) this.cue(t + n * 0.08 + 0.4 + k * 0.22, (x) => this.tone(x, [[0, 360], [0.04, 300]], 0.05, 0.02 * lv, bus, 'triangle'));
    return n * 0.08 + 1.3;
  },
  /** Red Willow Creek over its cobbles: a long breath of water noise, loud in the snowmelt (April to June), thin in the late summer and the frozen winter. */
  taoCreek(t, bus, lv) {
    const doy = seasonDoy(this), melt = 0.35 + 0.65 * Math.max(inSeason(doy, 95, 175, 20), 0), d = 7 + R() * 4;
    this.rasp(t, d, 1000 + R() * 300, 0.5, 0.024 * lv * melt, bus, 9 + R() * 4, 0.5);
    this.rasp(t + 0.3, d - 0.6, 2600, 0.7, 0.008 * lv * melt, bus, 17, 0.7);
    return d;
  },
  /** Coyotes far off on the mesa at night: a run of short yips climbing to a quavering howl. */
  taoCoyote(t, bus, lv) {
    const n = 5 + Math.floor(R() * 5), f = 640 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.17, (x) => this.tone(x, [[0, f * (0.9 + k * 0.03)], [0.07, f * 1.12]], 0.1, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1100, 3]));
    const hw = t + n * 0.17 + 0.2;
    this.cue(hw, (x) => this.tone(x, [[0, f * 0.9], [0.5, f * 1.5], [1.6, f * 1.4], [2.4, f * 1.1]], 2.4, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1000, 3]));
    return n * 0.17 + 3;
  },
};

addVoices('voices-taos.js', TAO_VOICES);
