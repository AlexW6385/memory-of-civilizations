// The placed voices of Çatalhöyük about 6500 BC (docs/settlements/catalhoyuk.md §14.3; src/settlements/catalhoyuk/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `cat`; the engine's own voices that suit (the kitchen's pots, the jars' lids,
// sacks, clay, the mortar, the owl, far dogs) are used by the map as they are. All synthesised, no samples. [inferred throughout: nothing of the sound of the
// town survives; the works are those the dossier names (quern and grinding, obsidian knapping, plaster laid by hand, hides, reed mats, ovens, penned sheep
// and cattle, the marsh) and the pitches and patterns are ours. The flute and drum are the bone flute and hand drum of dossier §9.]
import { addVoices } from './voices.js';

const R = Math.random;
const SCALE = [0, 2, 5, 7, 9];                                          // a pentatonic over the tonic (the flute)
const hz = (root, st) => root * Math.pow(2, st / 12);

export const CAT_VOICES = {
  /** The saddle quern: the rubbing stone pushed and drawn along the slab, a dry scrape each way, now and then a hummed note between strokes. */
  catQuern(t, bus, lv) {
    let w = t;
    const n = 14 + Math.floor(R() * 12), beat = 0.75 + R() * 0.12;
    for (let k = 0; k < n; k++) {
      this.rasp(w, beat * 0.62, 1300 + R() * 300, 0.8, 0.02 * lv, bus, 5, 0.7);
      if (k % 7 === 4 && R() < 0.55) this.cue(w + 0.1, (x) => this.cry(x, 175 + R() * 25, [[0, 0.5, 'o'], [-2, 0.6, 'o']], 0.013 * lv, bus, { cutoff: 1400, fem: true }));
      w += beat;
    }
    this.rasp(w + 0.2, 0.4, 2200, 0.7, 0.01 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** Pressure flaking of obsidian: a run of small sharp ticks and a flake falling, with a pause between each blade. */
  catKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 7 + Math.floor(R() * 7); k < n; k++) {
      this.cue(w, (x) => { this.struck(x, 2600 + R() * 1100, 0.011 * lv, bus, [[1, 1, 0.03], [2.4, 0.4, 0.015]]); if (R() < 0.35) this.struck(x + 0.07, 4200 + R() * 800, 0.005 * lv, bus, [[1, 1, 0.02]]); });
      w += 0.35 + R() * 1.1;
    }
    return w - t + 0.6;
  },
  /** Plaster smoothed on a wall with the hand: wet slaps and a long soft drag, the wall being renewed. */
  catPlaster(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 170, 0.026 * lv, bus, 0.06); this.rasp(x + 0.05, 0.6, 900, 0.7, 0.011 * lv, bus, 8, 0.7); });
      w += 1.0 + R() * 0.8;
    }
    return w - t + 0.6;
  },
  /** A fire: dry pops and a soft rush, an oven or hearth burning reed and dung. */
  catCrackle(t, bus, lv) {
    const d = 4 + R() * 4;
    this.rasp(t, d, 1100, 0.5, 0.009 * lv, bus, 30, 0.6);
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) { const at = t + R() * d; this.cue(at, (x) => this.burst(x, 0.02 + R() * 0.03, 1800 + R() * 2200, 1.4, 0.016 * lv, bus)); }
    return d + 0.4;
  },
  /** A hide scraped over a frame or the knee with a stone scraper: long dry strokes. */
  catScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.55, 1800 + R() * 350, 0.9, 0.017 * lv, bus, 11, 0.8); w += 0.8 + R() * 0.2; }
    return w - t + 0.6;
  },
  /** Reeds plaited into a mat: a dry rustle, a pull, a tap of the pressing bone. */
  catPlait(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.5, 3300, 0.6, 0.011 * lv, bus, 26, 0.9); if (k % 3 === 2) this.cue(w + 0.45, (x) => this.knock(x, 800, 0.012 * lv, bus, 0.04)); w += 0.7 + R() * 0.5; }
    return w - t + 0.5;
  },
  /** Sheep and goats in the pens: a few thin bleats and a deeper answer, from several throats. */
  catBleat(t, bus, lv) {
    const n = 2 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) {
      const f = (k % 2 ? 330 : 480) * (0.9 + R() * 0.2), len = 0.5 + R() * 0.4;
      this.cue(w, (x) => this.tone(x, [[0, f * 1.04], [0.08, f], [len, f * 0.9]], len, 0.032 * lv, bus, 'sawtooth', ['bandpass', f * 1.7, 2.2]));
      w += len * 0.6 + R() * 0.7;
    }
    return w - t + 0.6;
  },
  /** An ox lowing: one long low note, rising a little and falling. */
  catLow(t, bus, lv) {
    const f = 125 * (0.9 + R() * 0.2), d = 1.4 + R() * 0.7;
    this.tone(t, [[0, f * 0.9], [0.3, f * 1.08], [d, f * 0.82]], d, 0.034 * lv, bus, 'sawtooth', ['bandpass', f * 3, 1.6]);
    return d + 0.8;
  },
  /** The murmur of voices from the roofs and the courts: two or three low wordless phrases, overlapping, never words. */
  catMurmur(t, bus, lv) {
    const n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const f0 = 130 + R() * 90, notes = [[0, 0.3 + R() * 0.2, 'a'], [-1 + Math.floor(R() * 3), 0.25 + R() * 0.2, 'o'], [-3 * R(), 0.4, 'a']].slice(0, 2 + Math.floor(R() * 2));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.017 * lv, bus, { cutoff: 1500, fem: R() < 0.55 }));
      w += notes.reduce((s, c) => s + c[1], 0) * (0.5 + R() * 0.5) + 0.2 + R() * 0.5;
    }
    return w - t + 1;
  },
  /** A call across the roofs, one voice, a falling two notes, and an answer (children and women calling). */
  catCall(t, bus, lv) {
    const f0 = 330 + R() * 120;
    this.cue(t, (x) => this.cry(x, f0, [[0, 0.3, 'a'], [-4, 0.5, 'o']], 0.024 * lv, bus, { cutoff: 2400, fem: true }));
    if (R() < 0.7) this.cue(t + 1.3 + R() * 0.8, (x) => this.cry(x, f0 * 0.82, [[0, 0.25, 'e'], [-3, 0.45, 'a']], 0.018 * lv, bus, { cutoff: 2200, fem: R() < 0.5 }));
    return 3.6;
  },
  /** A hand drum (a skin over a clay pot or a wooden bowl): a slow steady beat in groups, a stronger first, soft and low. */
  catDrum(t, bus, lv) {
    let w = t;
    const groups = 3 + Math.floor(R() * 3), step = 0.7 + R() * 0.15;
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) { const strong = i === 0; this.cue(w, (x) => { this.knock(x, strong ? 104 : 140, (strong ? 0.065 : 0.04) * lv, bus, strong ? 0.22 : 0.14); this.burst(x, 0.03, 380, 1.2, 0.009 * lv, bus); }); w += step; }
      w += 0.6 + R() * 0.6;
    }
    return w - t + 0.8;
  },
  /** A flute of bird bone: thin and breathy, a slow pentatonic line, each note swelling and falling. */
  catFlute(t, bus, lv) {
    const root = 440, n = 6 + Math.floor(R() * 6);
    let w = t, k = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length)), len = 0.5 + R() * 1.2, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.03, len * 0.6, f * 2, 3, 0.003 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.97], [0.08, f], [len, f * 1.004]], len, 0.014 * lv, bus, 'triangle', ['bandpass', f * 1.4, 1.4]);
      });
      w += len + 0.15 + R() * 0.7;
    }
    return w - t + 1.2;
  },
  /** Wind through the reed beds of the marsh: a long breath of filtered noise, swelling and falling. */
  catReeds(t, bus, lv) {
    const d = 6 + R() * 4;
    this.rasp(t, d, 2600 + R() * 600, 0.4, 0.012 * lv, bus, 4, 0.5);
    this.rasp(t + 0.4, d - 0.8, 1200, 0.5, 0.006 * lv, bus, 3, 0.5);
    return d;
  },
  /** Cranes in the marsh: a loud rolling trumpet, two or three calls in answer, far off. */
  catCrane(t, bus, lv) {
    const n = 2 + Math.floor(R() * 3), f = 780 * (0.9 + R() * 0.2);
    let w = t;
    for (let k = 0; k < n; k++) { const len = 0.5 + R() * 0.3; this.cue(w, (x) => this.tone(x, [[0, f], [0.1, f * 1.15], [len, f * 0.95]], len, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 1.5, 2.5])); w += len + 0.2 + R() * 0.5; }
    return w - t + 1;
  },
  /** A jackal at night, off on the plain: a run of short yips climbing to a thin wavering howl. */
  catJackal(t, bus, lv) {
    const n = 4 + Math.floor(R() * 5), f = 700 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.16, (x) => this.tone(x, [[0, f * (0.9 + k * 0.03)], [0.07, f * 1.12]], 0.1, 0.028 * lv, bus, 'sawtooth', ['bandpass', 1200, 3]));
    const hw = t + n * 0.16 + 0.2;
    this.cue(hw, (x) => this.tone(x, [[0, f * 0.9], [0.5, f * 1.5], [1.5, f * 1.4], [2.2, f * 1.1]], 2.2, 0.028 * lv, bus, 'sawtooth', ['bandpass', 1100, 3]));
    return n * 0.16 + 3;
  },
};

addVoices('voices-catal.js', CAT_VOICES);
