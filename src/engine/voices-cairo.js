// The placed voices of Mamluk Cairo about 1363 (docs/settlements/mamluk-cairo.md §18.3), added to voices.js's table (addVoices; every name begins `cai`)
// from src/settlements/mamluk-cairo/soundmap.js. Each is `name(t, bus, lv[, track])`: it makes its events from `t` into a bus from `src()` and returns how
// long it lasts. Made of the engine's tools only (noise, oscillators, formant filters, struck partials; no samples). Every cry, chant and murmur is WORDLESS
// (vowel contours): no text of any language is sung. Pitches, contours and levels are [inferred]; no recording of 1363 exists. Levels were set by measuring a
// render (tools/sound-render.mjs), not by ear.

import { addVoices } from './voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
/** Maqam Rast on D, in semitones above the tonic (the third and the seventh a quarter tone flat: 3.5, 10.5). */
const RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12];

export const CAIRO_VOICES = {
  /** The water seller (saqqa): brass cups struck together to say he is passing, in a loose rhythm, a wordless call between. */
  caiSaqqa(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) {
      const x = w, f = 1500 + R() * 500;
      this.cue(x, (y) => { this.struck(y, f, 0.03 * lv, bus, [[1, 1, 0.22], [1.58, 0.55, 0.14], [2.4, 0.3, 0.08]]); this.struck(y + 0.07, f * 1.12, 0.02 * lv, bus, [[1, 1, 0.16], [1.6, 0.4, 0.1]]); });
      w += k % 3 === 2 ? 0.55 + R() * 0.3 : 0.2 + R() * 0.08;
    }
    this.cue(w + 0.3, (y) => this.cry(y, 150 * (0.94 + R() * 0.12), [[0, 0.3, 'a'], [4, 0.5, 'a'], [7, 0.8, 'o'], [5, 0.6, 'a'], [0, 1.1, 'u']], 0.045 * lv, bus, { cutoff: 3400 }));
    return w - t + 3.2;
  },
  /** The kuttab above a sabil: a teacher's line and the children answering it in chorus, five or six high voices a little apart in pitch, the line three times. */
  caiKuttab(t, bus, lv) {
    const line = [[0, 0.35, 'a'], [2, 0.35, 'a'], [4, 0.5, 'i'], [2, 0.35, 'a'], [0, 0.8, 'u']];
    const len = line.reduce((s, q) => s + q[1], 0);
    let w = t;
    this.cue(w, (y) => this.cry(y, 135 * (0.95 + R() * 0.1), line, 0.04 * lv, bus, { cutoff: 3000 }));
    w += len + 0.5;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const f0 = 300 * (0.94 + R() * 0.14), at = w + R() * 0.07;
        this.cue(at, (y) => this.cry(y, f0, line, 0.016 * lv, bus, { cutoff: 3600, fem: true }));
      }
      w += len + 0.4 + R() * 0.4;
    }
    return w - t + 0.8;
  },
  /** A lesson in a madrasa's iwan: the teacher's phrase in a low voice, the students' murmur answering, now and then a page turned. */
  caiLesson(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      const x = w, ph = [[0, 0.4, 'a'], [3, 0.5, 'a'], [2, 0.35, 'e'], [5, 0.7, 'a'], [0, 0.9, 'o']];
      this.cue(x, (y) => this.cry(y, 118 * (0.95 + R() * 0.1), ph, 0.04 * lv, bus, { cutoff: 2600 }));
      this.rasp(x + 2.9, 2.2, 900, 0.8, 0.012 * lv, bus, 6, 0.8);
      this.cue(x + 3.0, (y) => { for (let j = 0; j < 3; j++) this.cue(y + j * 0.18 + R() * 0.1, (z) => this.cry(z, 140 * (0.9 + R() * 0.2), [[0, 0.3, 'a'], [2, 0.5, 'o']], 0.012 * lv, bus, { cutoff: 2200 })); });
      w += 6 + R() * 3;
    }
    this.cue(w - 2, (y) => this.rasp(y, 0.35, 3000, 0.7, 0.01 * lv, bus, 30, 0.6));
    return w - t + 1;
  },
  /** The sultan's band (tablkhana) at the Citadel: pairs of kettledrums in a pattern of eight, small drums quickening, a shawm (zurna) winding over a drone, ending on a roll. */
  caiTabl(t, bus, lv) {
    const P = 0.3 + R() * 0.03, bars = 6 + Math.floor(R() * 3), pat = [1, 0, 0.6, 1, 0.5, 0.6, 0, 0.8];
    const dur = bars * 8 * P;
    for (let b = 0; b < bars; b++) for (let k = 0; k < 8; k++) {
      const a = pat[k] * (0.6 + 0.4 * Math.sin(Math.PI * (b + 0.5) / bars)), x = t + (b * 8 + k) * P, deep = k % 4 === 0 || k === 3;
      if (a) this.cue(x, (y) => { this.tone(y, deep ? [[0, 100], [0.14, 58]] : [[0, 210], [0.07, 150]], deep ? 0.32 : 0.12, 0.05 * a * lv, bus, 'sine'); this.burst(y, 0.04, deep ? 700 : 2400, 1, 0.03 * a * lv, bus); });
    }
    const base = 62, drone = mtof(base - 12);
    this.tone(t + 1, [[0, drone], [dur - 2, drone * 1.002]], dur - 2, 0.014 * lv, bus, 'sawtooth', ['bandpass', 800, 2]);
    let w = t + 1.6, deg = 0;
    for (let k = 0, n = 10 + Math.floor(R() * 6); k < n && w < t + dur - 1; k++) {
      deg = Math.max(0, Math.min(7, deg + pick([-2, -1, -1, 1, 1, 2])));
      const f = mtof(base + RAST[deg]), d = 0.3 + R() * 0.7, x = w;
      this.cue(x, (y) => { this.tone(y, [[0, f * 0.97], [0.07, f], [d, f * 1.01]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.4, 2.4]); this.tone(y, [[0, f * 2.01], [d, f * 2.02]], d, 0.008 * lv, bus, 'square', ['bandpass', 2300, 3]); });
      w += d + 0.05;
    }
    this.cue(t + dur - 1.4, (y) => { for (let i = 0; i < 14; i++) this.cue(y + i * 0.07, (z) => this.burst(z, 0.06, 1800, 1.2, 0.03 * lv, bus)); });
    return dur + 1;
  },
  /** A hawker's call in the market, wordless: a contour of his own (a seller of greens, a baker's boy, a sweet seller), once or twice. */
  caiHawk(t, bus, lv) {
    const C = [
      [[0, 0.3, 'a'], [5, 0.4, 'a'], [7, 0.4, 'a'], [5, 0.35, 'e'], [2, 0.9, 'o']],                     // greens: up and a long fall
      [[9, 0.22, 'i'], [7, 0.22, 'i'], [4, 0.8, 'a'], [0, 0.6, 'o']],                                    // the baker's boy: high and quick
      [[2, 0.5, 'o'], [5, 0.3, 'a'], [5, 0.3, 'a'], [9, 0.6, 'e'], [7, 1.0, 'a']],                      // sweets: two beats and a rise
    ], c = pick(C), n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) {
      const fem = R() < 0.15, f0 = (fem ? 280 : 150) * (0.93 + R() * 0.14), x = w;
      this.cue(x, (y) => this.cry(y, f0, c, 0.05 * lv, bus, { fem, cutoff: 4000 }));
      w += c.reduce((s, q) => s + q[1], 0) + 1.6 + R() * 1.8;
    }
    return w - t;
  },
  /** A hawker walking the street along `f`: his call every seven seconds or so, a porter's soft steps between. */
  caiVend(t, bus, lv, f) {
    const dur = f ? f.dur : 20;
    for (let s = 0; s * 0.62 < dur; s++) this.cue(t + s * 0.62, (x) => this.step(x, 0.025 * lv, bus, 'cloth'));
    for (let k = 0; 4 + k * (6.5 + R() * 3) < dur; k++) this.cue(t + 3 + k * (6.5 + R() * 3), (x) => this.caiHawk(x, bus, lv));
    return dur;
  },
  /** A camel's groan: a low rattling roar with its breath, rope and pack creaking, a dull bell at the neck. */
  caiCamel(t, bus, lv) {
    const f = 85 + R() * 25;
    this.tone(t, [[0, f * 0.8], [0.5, f * 1.2], [1.6, f], [2.4, f * 0.7]], 2.4, 0.04 * lv, bus, 'sawtooth', ['bandpass', 330, 1.6]);
    this.rasp(t, 2.3, 500, 0.9, 0.022 * lv, bus, 30, 0.9);
    this.cue(t + 2.6 + R(), (x) => this.creak(x, lv * 0.6, bus, false));
    for (let k = 0; k < 2; k++) this.cue(t + 0.6 + k * 1.2 + R() * 0.3, (x) => this.struck(x, 620, 0.018 * lv, bus, [[1, 1, 0.35], [2.3, 0.35, 0.18]]));
    return 4.2;
  },
  /** An oud in the merchant's qa'a at evening: a free run (taqsim) of plucked notes in maqam Rast over its tonic, two or three phrases, a held close. */
  caiOud(t, bus, lv) {
    const base = 50 + (R() < 0.5 ? 0 : 2);
    let w = t, deg = 2;
    for (let ph = 0, np = 2 + Math.floor(R() * 2); ph < np; ph++) {
      for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) {
        deg = Math.max(0, Math.min(7, deg + pick([-2, -1, -1, 1, 1, 2, 0])));
        const f = mtof(base + RAST[deg] + 12), d = 0.16 + R() * 0.3, x = w;
        this.cue(x, (y) => { this.struck(y, f, 0.045 * lv, bus, [[1, 1, 0.7], [2.0, 0.5, 0.45], [3.0, 0.3, 0.3], [4.1, 0.15, 0.2]]); this.burst(y, 0.02, 2600, 1, 0.012 * lv, bus); });
        w += d;
      }
      const f = mtof(base + 12);
      this.cue(w, (y) => this.struck(y, f, 0.05 * lv, bus, [[1, 1, 1.6], [2, 0.5, 1.1], [3, 0.3, 0.8]]));
      w += 1.4 + R() * 1.2;
    }
    return w - t + 1.5;
  },
  /** Pigeons of a roof's dovecote: wings clapping as a few rise, then the soft three-note coo. */
  caiDove(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.06 + R() * 0.05, (x) => this.burst(x, 0.05, 1700 + R() * 700, 1.2, 0.025 * lv, bus));
    let w = t + 1.1;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const f = 400 + R() * 80, x = w;
      for (let j = 0; j < 3; j++) this.cue(x + j * 0.22, (y) => this.tone(y, [[0, f * (j === 1 ? 1.12 : 1)], [0.14, f * 0.95]], 0.17, 0.011 * lv, bus, 'sine', ['lowpass', 900]));
      w += 1.0 + R() * 0.6;
    }
    return w - t + 0.4;
  },
  /** The strokes of the hammam's attendant's water: a bowl of water poured on marble and its echo in the dome, a slap of a wet cloth. */
  caiBathPour(t, bus, lv) {
    this.rasp(t, 1.4, 1800, 0.8, 0.02 * lv, bus, 14, 0.5);
    this.cue(t + 1.2, (x) => this.tone(x, [[0, 700], [0.08, 1100]], 0.1, 0.012 * lv, bus, 'sine'));
    this.cue(t + 2.2 + R(), (x) => { this.burst(x, 0.08, 900, 1, 0.03 * lv, bus); this.rasp(x + 0.1, 0.6, 2400, 0.7, 0.006 * lv, bus, 12, 0.5); });
    return 3.6;
  },
  /** Sandals on stone under a high vault: three or four slow steps and their hollow answer. */
  caiSteps(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const x = w; this.cue(x, (y) => { this.step(y, 0.05 * lv, bus, 'cloth', 1.3); this.tone(y + 0.05, [[0, 90], [0.7, 78]], 0.7, 0.008 * lv, bus, 'sine'); }); w += 0.8 + R() * 0.4; }
    return w - t + 1;
  },
  /** A donkey-boy's click and shout to his donkey, and the animal's hooves: a few quick hoof-falls on stone and a wordless short cry. */
  caiDonkeyBoy(t, bus, lv, f) {
    const dur = f ? f.dur : 14;
    for (let s = 0; s * 0.46 < dur; s++) this.cue(t + s * 0.46, (x) => { this.knock(x, 380, 0.03 * lv, bus, 0.07); if (s % 2) this.knock(x + 0.2, 330, 0.02 * lv, bus, 0.06); });
    this.cue(t + 2 + R() * 3, (x) => this.cry(x, 230 * (0.9 + R() * 0.2), [[4, 0.18, 'a'], [0, 0.45, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
};
export const CAIRO_GAIN = { caiTabl: 1.0, caiCamel: 1.0, caiKuttab: 1.0, caiOud: 1.0, caiHawk: 1.0 };
addVoices('voices-cairo.js', CAIRO_VOICES, CAIRO_GAIN);
