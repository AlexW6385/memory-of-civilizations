// The placed voices of Abbasid Baghdad about 800 (docs/settlements/abbasid-baghdad.md §16), added to voices.js's table (addVoices; every name begins `bag`)
// from src/settlements/abbasid-baghdad/soundmap.js. Each is `name(t, bus, lv[, track])`: it makes its events from `t` into a bus from `src()` and returns how
// long it lasts. Made of the engine's tools only (noise, oscillators, formant filters, struck partials; no samples). Every cry, chant and murmur is WORDLESS
// (vowel contours): no text of any language is sung or spoken. Pitches, contours and levels are [inferred]; no recording of 800 exists, and the scale of the
// oud is the hijaz of music.js. Levels were set by measuring a render (tools/sound-render.mjs), not by ear.

import { addVoices } from './voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
/** Hijaz on D, in semitones above the tonic (the augmented second between the second and the third degree). */
const HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12];

export const BAGHDAD_VOICES = {
  /** The water-carrier (saqqa) with his goatskin: a wordless call, then the skin's gurgle as he pours a cup for a buyer. */
  bagSaqqa(t, bus, lv) {
    const c = [[2, 0.4, 'a'], [7, 0.45, 'a'], [9, 0.5, 'a'], [7, 0.35, 'e'], [2, 1.0, 'o']];
    this.cue(t, (y) => this.cry(y, 145 * (0.94 + R() * 0.12), c, 0.05 * lv, bus, { cutoff: 3400 }));
    const w = t + c.reduce((s, q) => s + q[1], 0) + 1.2;
    this.rasp(w, 1.3, 1400, 0.8, 0.02 * lv, bus, 16, 0.7);
    this.cue(w + 1.3, (x) => this.tone(x, [[0, 760], [0.07, 1100]], 0.09, 0.012 * lv, bus, 'sine'));
    return w - t + 2.6;
  },
  /** A hawker's cry in the suq, wordless, a contour of its own (greens, bread, melons), once or twice. */
  bagHawk(t, bus, lv) {
    const C = [
      [[0, 0.3, 'a'], [4, 0.4, 'a'], [7, 0.4, 'a'], [4, 0.3, 'e'], [0, 0.9, 'o']],
      [[7, 0.25, 'i'], [5, 0.25, 'i'], [2, 0.8, 'a'], [0, 0.6, 'u']],
      [[2, 0.45, 'o'], [5, 0.3, 'a'], [5, 0.3, 'a'], [8, 0.6, 'e'], [5, 1.0, 'a']],
    ], c = pick(C), n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) {
      const fem = R() < 0.12, f0 = (fem ? 270 : 148) * (0.93 + R() * 0.14), x = w;
      this.cue(x, (y) => this.cry(y, f0, c, 0.05 * lv, bus, { fem, cutoff: 4000 }));
      w += c.reduce((s, q) => s + q[1], 0) + 1.5 + R() * 1.8;
    }
    return w - t;
  },
  /** A vendor walking the street along `f`: soft leather steps, a call every seven seconds or so. */
  bagVend(t, bus, lv, f) {
    const dur = f ? f.dur : 20;
    for (let s = 0; s * 0.62 < dur; s++) this.cue(t + s * 0.62, (x) => this.step(x, 0.025 * lv, bus, 'cloth'));
    for (let k = 0; 4 + k * (6.5 + R() * 3) < dur; k++) this.cue(t + 3 + k * (6.5 + R() * 3), (x) => this.bagHawk(x, bus, lv));
    return dur;
  },
  /** The paper-seller's and the copyist's work: the reed pen scratching, the knife trimming its nib, a sheet burnished with a smooth stone, pages turned. */
  bagPen(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const x = w, d = 0.6 + R() * 0.9;
      this.rasp(x, d, 3600, 1.2, 0.011 * lv, bus, 28 + R() * 10, 0.8);
      w += d + 0.2 + R() * 0.5;
    }
    this.cue(w, (x) => { this.burst(x, 0.05, 2600, 2, 0.02 * lv, bus); this.burst(x + 0.18, 0.04, 3100, 2, 0.015 * lv, bus); });
    this.rasp(w + 0.7, 1.1, 1900, 0.7, 0.012 * lv, bus, 9, 0.9);
    this.cue(w + 2.2, (x) => this.rasp(x, 0.3, 4200, 0.6, 0.012 * lv, bus, 40, 0.5));
    return w - t + 2.8;
  },
  /** The reading hall: a reader's low murmur in a flat chant, a translator's answer, the pen, the leaf turned; a long pause, then again. */
  bagScribes(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      const ph = [[0, 0.35, 'a'], [2, 0.4, 'a'], [2, 0.35, 'e'], [0, 0.6, 'a'], [-2, 0.9, 'o']], x = w;
      this.cue(x, (y) => this.cry(y, 112 * (0.95 + R() * 0.1), ph, 0.035 * lv, bus, { cutoff: 2400 }));
      this.cue(x + 3.1, (y) => this.cry(y, 132 * (0.95 + R() * 0.1), [[0, 0.4, 'e'], [3, 0.5, 'a'], [0, 0.8, 'o']], 0.03 * lv, bus, { cutoff: 2600 }));
      this.cue(x + 5.2, (y) => this.bagPen(y, bus, lv * 0.8));
      w += 8.5 + R() * 3;
    }
    return w - t + 1;
  },
  /** A camel's groan and its neck-rope's creak, two bells at the throat, from the khan's court or the caravan on the esplanade. */
  bagCamel(t, bus, lv) {
    const f = 80 + R() * 25;
    this.tone(t, [[0, f * 0.8], [0.6, f * 1.25], [1.7, f], [2.5, f * 0.68]], 2.5, 0.04 * lv, bus, 'sawtooth', ['bandpass', 320, 1.6]);
    this.rasp(t, 2.4, 480, 0.9, 0.022 * lv, bus, 28, 0.9);
    this.cue(t + 2.7 + R(), (x) => this.creak(x, lv * 0.6, bus, false));
    for (let k = 0; k < 3; k++) this.cue(t + 0.5 + k * 1.1 + R() * 0.3, (x) => this.struck(x, 560 + k * 70, 0.016 * lv, bus, [[1, 1, 0.35], [2.4, 0.35, 0.18]]));
    return 4.4;
  },
  /** The horse-guard's barracks: a horse stamping and blowing, a whinny answered, a groom's wordless word, a bucket set down. */
  bagHorses(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.4 + R() * 0.3), (x) => { this.knock(x, 170, 0.04 * lv, bus, 0.1); this.burst(x + 0.04, 0.12, 500, 1, 0.012 * lv, bus); });
    const w = t + 2.4, f = 520 + R() * 80;
    this.cue(w, (x) => this.tone(x, [[0, f], [0.18, f * 1.5], [0.7, f * 1.1], [1.2, f * 0.8]], 1.2, 0.025 * lv, bus, 'sawtooth', ['bandpass', f * 1.6, 2.2]));
    this.cue(w + 2.2, (x) => this.cry(x, 125, [[2, 0.3, 'o'], [0, 0.5, 'a']], 0.03 * lv, bus, { cutoff: 2600 }));
    this.cue(w + 3.6, (x) => this.knock(x, 240, 0.03 * lv, bus, 0.12));
    return 6.5;
  },
  /** A rider passing along the esplanade's road: the beat of a walking horse on packed earth and brick, the harness's small jingle. */
  bagHooves(t, bus, lv, f) {
    const dur = f ? f.dur : 12;
    for (let s = 0; s * 0.5 < dur; s++) this.cue(t + s * 0.5, (x) => { this.knock(x, 210, 0.034 * lv, bus, 0.07); this.knock(x + 0.14, 180, 0.026 * lv, bus, 0.06); this.knock(x + 0.27, 230, 0.03 * lv, bus, 0.07); this.knock(x + 0.37, 190, 0.024 * lv, bus, 0.06); });
    for (let s = 0; s * 1.1 < dur; s++) this.cue(t + 0.3 + s * 1.1, (x) => this.struck(x, 2300 + R() * 300, 0.008 * lv, bus, [[1, 1, 0.12], [1.7, 0.4, 0.08]]));
    return dur;
  },
  /** A boatman on the Tigris in his round quffa: the paddle's dip and swirl at every stroke, a wordless call across the water now and then. */
  bagBoatman(t, bus, lv, f) {
    const dur = f ? f.dur : 24, T = 1.5;
    for (let s = 0; s * T < dur; s++) this.cue(t + s * T, (x) => { this.burst(x, 0.5, 520, 0.7, 0.025 * lv, bus, 0.15); this.lap(x + 0.1, lv * 0.7, bus); });
    for (let k = 0; 4 + k * (9 + R() * 4) < dur; k++) this.cue(t + 4 + k * (9 + R() * 4), (x) => this.cry(x, 140 * (0.94 + R() * 0.12), [[0, 0.5, 'a'], [5, 0.7, 'o'], [3, 0.5, 'a'], [0, 1.4, 'u']], 0.045 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** A bridge of boats: planks knocking on their hulls with the current, the cables creaking, water slapping the boats, a walker's steps over. */
  bagBridge(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.6 + R() * 0.6), (x) => { this.knock(x, 150 + R() * 40, 0.035 * lv, bus, 0.1); this.lap(x + 0.08, lv * 0.8, bus); });
    this.cue(t + 1.2, (x) => this.creak(x, lv * 0.7, bus, R() < 0.5));
    this.cue(t + 3.4, (x) => { for (let s = 0; s < 6; s++) this.cue(x + s * 0.5, (y) => this.step(y, 0.02 * lv, bus, 'cloth', 0.4)); });
    return 6.5;
  },
  /** A shaduf at the river's edge: the pole's creak as the bucket goes down and comes up, the dip, the water poured out into the channel. */
  bagShaduf(t, bus, lv) {
    this.creak(t, lv * 0.8, bus, false);
    this.cue(t + 1.6, (x) => { this.burst(x, 0.2, 700, 0.8, 0.03 * lv, bus); this.lap(x + 0.05, lv, bus); });
    this.cue(t + 2.4, (x) => this.creak(x, lv * 0.9, bus, true));
    this.rasp(t + 4.6, 1.5, 1500, 0.8, 0.02 * lv, bus, 14, 0.6);
    return 7;
  },
  /** Porters at the jetty: a wordless shout as a sack is swung up, the thud, a boatman's answer, a plank's knock. */
  bagPorters(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const x = w;
      this.cue(x, (y) => this.cry(y, 130 * (0.92 + R() * 0.16), [[2, 0.25, 'e'], [5, 0.35, 'a']], 0.045 * lv, bus, { cutoff: 3000 }));
      this.cue(x + 0.8, (y) => { this.knock(y, 110, 0.05 * lv, bus, 0.12); this.burst(y, 0.1, 500, 1, 0.02 * lv, bus); });
      this.cue(x + 1.8, (y) => this.knock(y, 160, 0.03 * lv, bus, 0.08));
      w += 2.8 + R() * 1.6;
    }
    this.cue(w, (y) => this.cry(y, 150, [[0, 0.4, 'o'], [3, 0.6, 'a']], 0.04 * lv, bus, { cutoff: 2800 }));
    return w - t + 1.4;
  },
  /** An oud and a frame drum at evening in the khan's court: a free run in hijaz (a taqsim) over the tonic, two or three phrases, a held close, the drum answering. */
  bagOud(t, bus, lv) {
    const base = 50 + (R() < 0.5 ? 0 : 2);
    let w = t, deg = 2;
    for (let ph = 0, np = 2 + Math.floor(R() * 2); ph < np; ph++) {
      for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) {
        deg = Math.max(0, Math.min(7, deg + pick([-2, -1, -1, 1, 1, 2, 0])));
        const f = mtof(base + HIJAZ[deg] + 12), d = 0.16 + R() * 0.3, x = w;
        this.cue(x, (y) => { this.struck(y, f, 0.045 * lv, bus, [[1, 1, 0.7], [2.0, 0.5, 0.45], [3.0, 0.3, 0.3], [4.1, 0.15, 0.2]]); this.burst(y, 0.02, 2600, 1, 0.012 * lv, bus); });
        w += d;
      }
      const f = mtof(base + 12);
      this.cue(w, (y) => this.struck(y, f, 0.05 * lv, bus, [[1, 1, 1.6], [2, 0.5, 1.1], [3, 0.3, 0.8]]));
      this.cue(w + 0.6, (y) => { this.tone(y, [[0, 140], [0.1, 90]], 0.2, 0.03 * lv, bus, 'sine'); this.burst(y + 0.3, 0.03, 3000, 1, 0.012 * lv, bus); this.burst(y + 0.55, 0.03, 3000, 1, 0.01 * lv, bus); });
      w += 1.6 + R() * 1.2;
    }
    return w - t + 1.5;
  },
};
/** Levels measured with tools/sound-render.mjs (RMS of one event at lv 1: saqqa 2.3e-3, hawk 2.9e-3, pen 1.0e-3, scribes 2.0e-3, camel 3.1e-3, horses 2.5e-3, bridge 1.6e-3, shaduf 1.0e-3, porters 2.1e-3; the oud 1.15e-2 before the gain below, against copperBeat 6.5e-3 and the Cairo voices' 2-4e-3). */
export const BAGHDAD_GAIN = { bagOud: 0.5 };
addVoices('voices-baghdad.js', BAGHDAD_VOICES, BAGHDAD_GAIN);
