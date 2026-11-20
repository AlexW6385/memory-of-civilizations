// The placed voices of Marinid Fez about 1350 (docs/settlements/fez.md §16), added to voices.js's table (addVoices; every name begins `fez`)
// from src/settlements/fez/soundmap.js. Each is `name(t, bus, lv[, track])`: it makes its events from `t` into a bus from `src()` and returns how
// long it lasts. Made of the engine's tools only (noise, oscillators, formant filters, struck partials; no samples). Every cry, chant and murmur is
// WORDLESS (vowel contours): no text of any language is sung or recited. Pitches, contours and levels are [inferred]: no recording of Fez in 1350
// exists, and the modes are named after the Andalusi-Maghribi tradition the dossier (§9) gives for the music, used as a gesture, not transcribed.
// Levels were set by measuring a render (tools/sound-render.mjs), not by ear.

import { addVoices } from './voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
/** A Maghribi mode on D in semitones above the tonic (a flat second and a flat sixth: the minor-with-lowered-second colour of the rasd / maya family). */
const MODE = [0, 1, 3, 5, 7, 8, 10, 12];

export const FEZ_VOICES = {
  /** A lesson in a madrasa's classroom or a circle round a pillar of the Qarawiyyin: the master's low phrase, the students answering in unison (five or six voices a little apart), a page turned. */
  fezLesson(t, bus, lv) {
    let w = t;
    const line = [[0, 0.45, 'a'], [3, 0.5, 'a'], [5, 0.4, 'e'], [3, 0.35, 'a'], [1, 0.9, 'o']];
    const len = line.reduce((s, q) => s + q[1], 0);
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      const x = w;
      this.cue(x, (y) => this.cry(y, 112 * (0.95 + R() * 0.1), line, 0.04 * lv, bus, { cutoff: 2700 }));
      for (let c = 0; c < 5; c++) this.cue(x + len + 0.5 + R() * 0.08, (y) => this.cry(y, 118 * (0.92 + R() * 0.16), line, 0.011 * lv, bus, { cutoff: 2500 }));
      this.rasp(x + len * 2 + 1.3, 0.5, 2600, 0.7, 0.01 * lv, bus, 20, 0.8);
      w += len * 2 + 3 + R() * 2.5;
    }
    return w - t + 0.5;
  },
  /** A hawker's call in the lane, wordless: a warning to make way (two short notes falling), a seller of mint (a long rise), a seller of hot bread (high and quick). */
  fezHawk(t, bus, lv) {
    const C = [
      [[7, 0.18, 'a'], [5, 0.22, 'a'], [0, 0.55, 'a']],                                // "make way": short, sharp, falling
      [[0, 0.4, 'u'], [3, 0.4, 'o'], [5, 0.5, 'a'], [8, 0.9, 'a']],                    // mint: a long rise
      [[9, 0.2, 'i'], [7, 0.2, 'i'], [9, 0.2, 'e'], [4, 0.8, 'a']],                    // hot bread: high and quick
      [[2, 0.5, 'o'], [0, 0.3, 'a'], [2, 0.3, 'a'], [5, 0.9, 'o']],                    // eggs and herbs
    ], c = pick(C), n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) {
      const fem = R() < 0.18, f0 = (fem ? 270 : 148) * (0.93 + R() * 0.14), x = w;
      this.cue(x, (y) => this.cry(y, f0, c, 0.05 * lv, bus, { fem, cutoff: 4000 }));
      w += c.reduce((s, q) => s + q[1], 0) + 1.5 + R() * 1.6;
    }
    return w - t;
  },
  /** A hawker walking the lane along `f`: soft soles, his call every seven seconds or so. */
  fezVend(t, bus, lv, f) {
    const dur = f ? f.dur : 20;
    for (let s = 0; s * 0.6 < dur; s++) this.cue(t + s * 0.6, (x) => this.step(x, 0.022 * lv, bus, 'cloth'));
    for (let k = 0; 3 + k * 7.5 < dur; k++) this.cue(t + 3 + k * (6.5 + R() * 3), (x) => this.fezHawk(x, bus, lv));
    return dur;
  },
  /** A string of mules along the lane: the hard two-beat of hooves on cobbles, the iron bell at the leader's neck, the pack frames creaking, the muleteer's short wordless cry to clear the way. */
  fezMule(t, bus, lv, f) {
    const dur = f ? f.dur : 16, T = 0.5 + R() * 0.06;
    for (let s = 0; s * T < dur; s++) this.cue(t + s * T, (x) => {
      this.knock(x, 330, 0.034 * lv, bus, 0.07); this.knock(x + 0.19, 290, 0.024 * lv, bus, 0.06);
      if (s % 4 === 1) this.knock(x + 0.31, 340, 0.016 * lv, bus, 0.06);
      if (s % 3 === 0) this.struck(x + 0.05, 760 + R() * 120, 0.02 * lv, bus, [[1, 1, 0.5], [2.7, 0.45, 0.28], [4.9, 0.2, 0.14]]);
    });
    for (let k = 0; k < 2; k++) this.cue(t + 1.5 + k * 5.5 + R() * 2, (x) => this.cry(x, 190 * (0.9 + R() * 0.2), [[5, 0.15, 'a'], [0, 0.5, 'a']], 0.045 * lv, bus, { cutoff: 3200 }));
    this.cue(t + 3 + R() * 4, (x) => this.creak(x, lv * 0.5, bus, false));
    return dur;
  },
  /** The water seller: brass cups struck against each other as he walks, now and then the call. */
  fezGerrab(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) {
      const x = w, f = 1700 + R() * 500;
      this.cue(x, (y) => { this.struck(y, f, 0.03 * lv, bus, [[1, 1, 0.2], [1.6, 0.5, 0.12], [2.5, 0.28, 0.07]]); this.struck(y + 0.06, f * 1.1, 0.02 * lv, bus, [[1, 1, 0.14], [1.58, 0.4, 0.09]]); });
      w += k % 3 === 2 ? 0.5 + R() * 0.3 : 0.18 + R() * 0.08;
    }
    this.cue(w + 0.3, (y) => this.cry(y, 150 * (0.94 + R() * 0.12), [[0, 0.3, 'u'], [5, 0.5, 'a'], [7, 0.7, 'a'], [3, 1.0, 'o']], 0.042 * lv, bus, { cutoff: 3400 }));
    return w - t + 2.6;
  },
  /** Women at the wash-place on the quay: wet cloth beaten on a stone (a dull slap and its splash, in a loose rhythm), the river's rush under it, their talk a murmur of three bands with no word in it. */
  fezWash(t, bus, lv) {
    const dur = 9 + R() * 5;
    for (let k = 0, w = 0.2; w < dur; k++) {
      const x = t + w;
      this.cue(x, (y) => { this.knock(y, 150 + R() * 40, 0.04 * lv, bus, 0.09); this.burst(y + 0.03, 0.2, 900 + R() * 500, 0.9, 0.025 * lv, bus); });
      w += 0.45 + R() * 0.35 + (k % 5 === 4 ? 0.9 : 0);
    }
    for (const [f, a] of [[420, 1], [900, 0.8], [1900, 0.35]]) this.rasp(t, dur, f, 0.9, 0.009 * lv * a, bus, 4 + R() * 2, 0.8);
    this.cue(t + dur * 0.5, (y) => this.cry(y, 255 * (0.93 + R() * 0.14), [[0, 0.3, 'a'], [3, 0.35, 'a'], [2, 0.5, 'e']], 0.012 * lv, bus, { fem: true, cutoff: 2800 }));
    return dur + 0.4;
  },
  /** The tannery: bare feet treading hides in a vat of liquor (slow wet pushes, a suck and a gurgle at each), a hide slapped on the stone, a man's call across the vats. */
  fezTannery(t, bus, lv) {
    const dur = 10 + R() * 4;
    for (let w = 0.3, k = 0; w < dur - 1; k++) {
      const x = t + w;
      this.cue(x, (y) => { this.burst(y, 0.35, 420 + R() * 250, 0.8, 0.032 * lv, bus, 0.04); this.tone(y + 0.12, [[0, 180 + R() * 60], [0.2, 340 + R() * 80]], 0.25, 0.008 * lv, bus, 'sine'); });
      w += 0.75 + R() * 0.5;
    }
    for (let k = 0; k < 2; k++) this.cue(t + 2 + k * 4.4 + R() * 1.5, (y) => { this.knock(y, 200, 0.045 * lv, bus, 0.1); this.burst(y, 0.14, 1400, 0.8, 0.03 * lv, bus); });
    this.rasp(t, dur, 300, 0.7, 0.008 * lv, bus, 3, 0.8);
    this.cue(t + 4 + R() * 3, (y) => this.cry(y, 135 * (0.93 + R() * 0.14), [[5, 0.25, 'a'], [0, 0.6, 'o']], 0.04 * lv, bus, { cutoff: 3000 }));
    return dur + 0.4;
  },
  /** The Oued Fes over a weir or between its quays: a broad rush that swells and thins over five or six seconds, now and then a gulp against the stones. */
  fezWeir(t, bus, lv) {
    const dur = 6 + R() * 3;
    this.rasp(t, dur, 650, 0.5, 0.03 * lv, bus, 2.4 + R(), 0.55);
    this.rasp(t, dur, 2300, 0.6, 0.012 * lv, bus, 7 + 3 * R(), 0.8);
    this.rasp(t, dur, 190, 0.7, 0.02 * lv, bus, 1.6, 0.4);
    for (let k = 0; k < 3; k++) this.cue(t + 0.6 + k * dur / 3 + R(), (y) => this.tone(y, [[0, 210 + R() * 90], [0.06, 460 + R() * 160]], 0.1, 0.01 * lv, bus, 'sine'));
    return dur + 0.4;
  },
  /** A slipper-maker's dukkan: the small hammer tapping a sole on the last (groups of four or five), the awl's squeak, thread drawn through. */
  fezSlipper(t, bus, lv) {
    let w = t;
    for (let g = 0, n = 2 + Math.floor(R() * 2); g < n; g++) {
      for (let k = 0, m = 4 + Math.floor(R() * 3); k < m; k++) this.cue(w + k * (0.13 + R() * 0.03), (x) => this.knock(x, 820 + R() * 140, 0.03 * lv, bus, 0.05));
      this.rasp(w + 1.1, 0.5, 3200, 0.8, 0.006 * lv, bus, 30, 0.7);
      w += 2 + R() * 1.4;
    }
    return w - t;
  },
  /** A leather-worker's dukkan: the scraper drawn along the hide (a long dry rasp, twice), a flat slap as it is turned. */
  fezLeather(t, bus, lv) {
    this.rasp(t, 0.9, 1500, 0.6, 0.016 * lv, bus, 12, 0.8);
    this.rasp(t + 1.4, 1.0, 1400, 0.6, 0.016 * lv, bus, 12, 0.8);
    this.cue(t + 2.7, (x) => { this.knock(x, 170, 0.035 * lv, bus, 0.08); this.burst(x, 0.08, 1200, 0.8, 0.02 * lv, bus); });
    return 3.4;
  },
  /** A baker's oven (a public or a dukkan's furnan): the long peel scraped over the brick floor, the dull knock of a loaf turned out, the low breath of the fire. */
  fezBake(t, bus, lv) {
    this.rasp(t, 3.2, 150, 0.8, 0.014 * lv, bus, 5, 0.7);
    this.rasp(t + 0.4, 0.7, 1500, 0.6, 0.012 * lv, bus, 14, 0.8);
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1.4 + k * 0.28 + R() * 0.1, (x) => { this.knock(x, 240 + R() * 50, 0.028 * lv, bus, 0.07); this.burst(x, 0.05, 1900, 1, 0.012 * lv, bus); });
    return 3.8;
  },
  /** A rebab (a bowed two-string fiddle) from a court at evening: a long drone-held note, then a slow phrase in the mode with slides between the notes and a late vibrato, closing on the tonic. */
  fezRabab(t, bus, lv) {
    const base = 50 + (R() < 0.5 ? 0 : 2), tonic = mtof(base + 12);
    let w = t, deg = 4;
    this.tone(t, [[0, tonic * 0.5], [10, tonic * 0.5]], 10, 0.012 * lv, bus, 'sawtooth', ['bandpass', 380, 2.2]);
    for (let k = 0, n = 8 + Math.floor(R() * 5); k < n; k++) {
      deg = Math.max(0, Math.min(7, deg + pick([-2, -1, -1, 1, 1, 2, 0])));
      const f = mtof(base + 12 + MODE[deg]), d = 0.5 + R() * 0.9, x = w;
      this.cue(x, (y) => {
        this.tone(y, [[0, f * 0.95], [0.1, f], [d * 0.7, f * 1.004], [d, f * 0.99]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.2, 2]);
        this.tone(y, [[0, f * 2.01], [d, f * 2.02]], d, 0.006 * lv, bus, 'sine');
        this.burst(y, 0.04, 2400, 1, 0.007 * lv, bus);
      });
      w += d + 0.06;
    }
    this.cue(w, (y) => this.tone(y, [[0, tonic], [1.8, tonic * 0.998]], 1.8, 0.03 * lv, bus, 'sawtooth', ['bandpass', tonic * 2.2, 2]));
    return w - t + 2.2;
  },
  /** Pigeons of the roofs and the tannery's cotes: wings clapping as a few rise, then the soft rolling coo. */
  fezPigeons(t, bus, lv) {
    for (let k = 0; k < 7; k++) this.cue(t + k * 0.06 + R() * 0.05, (x) => this.burst(x, 0.05, 1600 + R() * 700, 1.2, 0.024 * lv, bus));
    let w = t + 1.0;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const f = 390 + R() * 90, x = w;
      for (let j = 0; j < 3; j++) this.cue(x + j * 0.2, (y) => this.tone(y, [[0, f * (j === 1 ? 1.1 : 1)], [0.13, f * 0.93]], 0.16, 0.011 * lv, bus, 'sine', ['lowpass', 900]));
      w += 0.95 + R() * 0.6;
    }
    return w - t + 0.4;
  },
  /** Swifts screaming round a minaret at dusk: several birds' high, quivering shrieks that glide up and fade, at their own moments. */
  fezSwift(t, bus, lv) {
    let last = t;
    for (let b = 0, n = 3 + Math.floor(R() * 3); b < n; b++) {
      const x = t + R() * 3.2, f = 4300 + R() * 1200, d = 0.55 + R() * 0.35;
      this.cue(x, (y) => { this.tone(y, [[0, f], [d * 0.5, f * 1.22], [d, f * 1.08]], d, 0.012 * lv, bus, 'sawtooth', ['bandpass', f * 1.1, 4]); this.rasp(y, d, f, 3, 0.005 * lv, bus, 55, 0.9); });
      last = Math.max(last, x + d);
    }
    return last - t + 0.4;
  },
  /** Soles on marble under the arcades of a hall: three or four slow steps and their hollow answer. */
  fezSteps(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const x = w; this.cue(x, (y) => { this.step(y, 0.045 * lv, bus, 'cloth', 1.3); this.tone(y + 0.05, [[0, 96], [0.7, 82]], 0.7, 0.007 * lv, bus, 'sine', ['lowpass', 400]); }); w += 0.8 + R() * 0.5; }
    return w - t + 1;
  },
};
/** Levels measured with tools/sound-render.mjs (RMS of one event at lv 1 over 14 s, peaks 4.8e-3 to 1.8e-2 of full scale: lesson 7e-4, hawk 3.9e-4, mule 1.2e-3, gerrab 1.1e-3, wash 9.4e-4, tannery 7.7e-4, weir 9.0e-4, rabab 1.9e-3; the five quietest raised below). */
export const FEZ_GAIN = { fezHawk: 1.4, fezLesson: 1.3, fezBake: 1.4, fezLeather: 1.3, fezSlipper: 1.2 };
addVoices('voices-fez.js', FEZ_VOICES, FEZ_GAIN);
