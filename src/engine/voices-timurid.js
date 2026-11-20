// Voices of Timurid Samarkand about 1420 (docs/settlements/timurid-samarkand.md §20.3), added to the placed voices of voices.js through addVoices
// (every name begins `tim`): the Registan's hawkers, the dusk's drums and long trumpets, the dutar and the frame drum of the tea-houses, the lecture
// and the recitation of the madrasa, the coppersmith, the aryk's trickle, doves, a camel with its bell, the water carrier. Synthesised in the same
// terms as the other settlements' (noise, oscillators, formant filters, struck partials; no samples); each is a method `name(t, bus, lv)` of the
// audio engine's Music returning how long it lasts; each level was set by measuring a render (tools/sound-render.mjs), not by ear.
// [inferred throughout: no recording of 1420 exists, and the melodies and patterns are ours, in a seven-note mode of the Central Asian maqam type
// (Mixolydian-like, as the Rost of the shashmaqom is described), on D. Stated: the nawbat of drums and trumpets (naqqara-khana) as part of a Timurid
// court's state (Wikipedia, Naqqara / Naubat); the long trumpet karnay of Central Asia; the dutar and doira as the instruments of the region's music.]

import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
/** The mode, semitones above the tonic: D E F# G A B C (the seventh flat). */
const MODE = [0, 2, 4, 5, 7, 9, 10];
const hz = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 7) * 12 + MODE[((deg % 7) + 7) % 7]) / 12);

/** The hawkers' cries (wordless): [semitones above the voice's base, seconds, vowel]. */
export const CRIES = {
  melon: { cry: [[0, 0.3, 'a'], [4, 0.3, 'a'], [7, 0.55, 'o'], [4, 0.4, 'a'], [0, 1.0, 'u']], fem: false },      // the melon seller (melons of the valley)
  bread: { cry: [[9, 0.25, 'i'], [7, 0.25, 'e'], [4, 0.8, 'a']], fem: null },                                      // the baker's boy with flat bread (nan)
  cloth: { cry: [[5, 0.2, 'a'], [7, 0.2, 'a'], [9, 0.4, 'o'], [5, 0.3, 'e'], [0, 1.1, 'u']], fem: false },        // the cloth broker
};
const hawkOf = (kind) => function hawk(t, bus, lv) {
  const C = CRIES[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const fem = C.fem === null ? R() < 0.5 : C.fem, f0 = (fem ? 270 : 150) * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C.cry, 0.05 * lv, bus, { fem, cutoff: 4000 }));
    w += C.cry.reduce((s, c) => s + c[1], 0) + 1.4 + R() * 2;
  }
  return w - t;
};

export const TIMURID_VOICES = {
  timHawkMelon: hawkOf('melon'), timHawkBread: hawkOf('bread'), timHawkCloth: hawkOf('cloth'),

  /**
   * The nawbat at dusk: a pair of kettledrums beating a pattern of six (low and high), a long straight trumpet (karnay) holding two long notes a fifth
   * apart over them and a shorter shawm-like line between, the whole about sixteen seconds.
   */
  timNawbat(t, bus, lv) {
    const pat = [1, 0.5, 0.8, 0.5, 0.9, 0.6], P = 0.36 + R() * 0.04, bars = 8 + Math.floor(R() * 3), dur = bars * 6 * P;
    for (let b = 0; b < bars; b++) for (let k = 0; k < 6; k++) {
      const a = pat[k] * (0.5 + 0.5 * Math.sin(Math.PI * (b + 0.5) / bars)), x = t + (b * 6 + k) * P, hi = k % 2 === 1;
      this.cue(x, (y) => { this.tone(y, [[0, hi ? 140 : 92], [0.18, hi ? 105 : 64]], 0.32, 0.06 * lv * a, bus, 'sine'); this.burst(y, 0.07, hi ? 1400 : 760, 1.2, 0.022 * lv * a, bus); });
    }
    const f0 = 146.8 * (0.97 + R() * 0.06);
    for (const [at, len, m] of [[0.1, 0.34, 1], [0.52, 0.34, 1.5]]) {
      const x = t + at * dur, d = len * dur, ctx = this.ctx, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * m * 0.96, x); o.frequency.linearRampToValueAtTime(f0 * m, x + 0.5); o2.frequency.value = f0 * m * 1.005;
      lp.type = 'lowpass'; lp.frequency.value = 800;
      g.gain.setValueAtTime(0.0001, x); g.gain.exponentialRampToValueAtTime(0.045 * lv, x + d * 0.3); g.gain.setValueAtTime(0.045 * lv, x + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, x + d);
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(bus); o.start(x); o2.start(x); o.stop(x + d + 0.05); o2.stop(x + d + 0.05);
    }
    // the shawm's line between the trumpet's notes
    let deg = 7, w = t + dur * 0.46;
    for (let k = 0; k < 6; k++) {
      deg = clamp(deg + (R() < 0.5 ? -1 : 1), 5, 10);
      const f = hz(deg, 146.8 * 2), len = 0.18 + R() * 0.2;
      this.cue(w, (x) => this.tone(x, [[0, f], [len, f * 1.002]], len, 0.028 * lv, bus, 'sawtooth', ['bandpass', 1400, 2]));
      w += len;
    }
    return dur + 1;
  },

  /** The dutar (a two-stringed long-necked lute) in the tea-house: a phrase of plucked notes in the mode, runs on the upper string, a drone on the lower, each pluck ringing on and dying. */
  timDutar(t, bus, lv) {
    const tonic = 220, n = 12 + Math.floor(R() * 10);
    let w = t, deg = 7;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + (R() < 0.5 ? -1 : 1) * (R() < 0.75 ? 1 : 2), 3, 12);
      if (k === n - 1) deg = 7;
      const f = hz(deg, tonic), len = k === n - 1 ? 1.2 : 0.14 + R() * 0.2;
      this.cue(w, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.9], [2.01, 0.4, 0.45], [3.02, 0.2, 0.25], [4.05, 0.08, 0.14]]));
      if (k % 4 === 0) this.cue(w, (x) => this.struck(x, tonic / 2, 0.02 * lv, bus, [[1, 1, 1.2], [2.0, 0.3, 0.5]]));      // the drone string
      w += len;
    }
    return w - t + 1.2;
  },

  /** A frame drum with rings (doira) played with the fingers: the deep stroke from the middle, the bright from the rim, the rings jingling, a rhythm of six. */
  timDoira(t, bus, lv) {
    const pat = [['d', 1], ['t', 0.6], ['t', 0.5], ['d', 0.9], ['t', 0.6], ['t', 0.5]], P = 0.24 + R() * 0.04, bars = 4 + Math.floor(R() * 4);
    for (let b = 0; b < bars; b++) for (let k = 0; k < 6; k++) {
      const [s, a] = pat[k], x = t + (b * 6 + k) * P;
      if (R() < 0.05) continue;
      this.cue(x, (y) => {
        if (s === 'd') this.tone(y, [[0, 165], [0.1, 100]], 0.22, 0.05 * lv * a, bus, 'sine'); else { this.burst(y, 0.05, 3000, 1.4, 0.07 * lv * a, bus); this.tone(y, [[0, 500], [0.06, 390]], 0.08, 0.02 * lv * a, bus, 'sine'); }
        this.burst(y, 0.16, 5200, 2.5, 0.03 * lv * a, bus);
      });
    }
    return bars * 6 * P + 0.4;
  },

  /** The teacher in the classroom: measured wordless declaiming (a phrase, a pause for the students), and the murmur of the students repeating it low and together. */
  timLecture(t, bus, lv) {
    const f0 = 125 * (0.94 + R() * 0.12), n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const notes = [[0, 0.3, 'o'], [2, 0.25, 'a'], [3, 0.25, 'e'], [2, 0.3, 'a'], [0, 0.5 + R() * 0.3, 'u']], len = notes.reduce((s, c) => s + c[1], 0);
      this.cue(w, (x) => this.cry(x, f0, notes, 0.055 * lv, bus, { cutoff: 2600 }));
      this.cue(w + len + 0.5, (x) => { for (let s = 0; s < 3; s++) this.cry(x + s * 0.04, f0 * (0.8 + 0.08 * s), notes, 0.02 * lv, bus, { cutoff: 1800 }); });
      w += len * 2 + 1.2 + R();
    }
    return w - t + 0.5;
  },

  /** A recitation in the mosque (wordless): a slow chant on a few notes of the mode, each phrase rising to a held note and falling back, the room's hush in it. */
  timRecite(t, bus, lv) {
    const f0 = 110 * (0.95 + R() * 0.1), n = 2 + Math.floor(R() * 2);
    let w = t;
    for (let k = 0; k < n; k++) {
      const hi = 4 + Math.floor(R() * 3), notes = [[0, 0.5, 'o'], [MODE[1], 0.4, 'a'], [MODE[2], 0.4, 'a'], [MODE[hi], 1.0 + R() * 0.8, 'a'], [MODE[2], 0.5, 'e'], [0, 1.3, 'u']];
      this.cue(w, (x) => this.cry(x, f0, notes, 0.05 * lv, bus, { cutoff: 2400 }));
      w += notes.reduce((s, c) => s + c[1], 0) + 1.0 + R() * 1.5;
    }
    return w - t + 0.5;
  },

  /** A coppersmith beating a pot on the stake: rounds of quick hollow taps with the ring of the rim, a pause, another round. */
  timCopper(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 2), f0 = 760 + R() * 360;
    for (let r = 0; r < rounds; r++) {
      const n = 12 + Math.floor(R() * 12), P = 0.13 + R() * 0.04;
      for (let i = 0; i < n; i++) {
        const a = i % 4 === 0 ? 1 : 0.55, f = f0 * (1 + 0.1 * (i % 3));
        this.cue(w + i * P, (x) => { this.struck(x, f, 0.04 * lv * a, bus, [[1, 1, 0.14], [2.76, 0.5, 0.09], [5.4, 0.25, 0.05]]); this.burst(x, 0.012, 2600, 1, 0.02 * lv * a, bus); });
      }
      w += n * P + 0.7 + R() * 1.2;
    }
    return w - t;
  },

  /** The aryk: water running in a narrow brick-lined channel, a light bright trickle with small chuckles where it drops over the sills of the footbridges. */
  timAryk(t, bus, lv) {
    const dur = 6 + R() * 3, ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.014 * lv, t + 1); g.gain.setValueAtTime(0.014 * lv, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
    for (let k = 0, m = 6 + Math.floor(R() * 6); k < m; k++) this.cue(t + R() * dur, (x) => this.tone(x, [[0, 500 + R() * 400], [0.09, 800 + R() * 500]], 0.09, 0.011 * lv, bus, 'sine', ['lowpass', 1800]));
    return dur;
  },

  /** Doves on a cornice: a soft rolling coo of a few birds out of step, a clap of wings as one goes. */
  timDoves(t, bus, lv) {
    const dur = 4 + R() * 3;
    for (let b = 0; b < 3; b++) for (let k = 0, m = 2 + Math.floor(R() * 2); k < m; k++) {
      const x = t + R() * (dur - 1), f = 400 + R() * 80;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.1, f * 0.9]], 0.15, 0.02 * lv, bus, 'triangle', ['lowpass', 800]); this.tone(y + 0.2, [[0, f * 1.05], [0.14, f * 0.82]], 0.28, 0.024 * lv, bus, 'triangle', ['lowpass', 800]); });
    }
    if (R() < 0.4) { const x = t + R() * dur; for (let k = 0; k < 6; k++) this.cue(x + k * 0.06, (y) => this.burst(y, 0.05, 2200, 1.1, 0.018 * (1 - k / 8) * lv, bus)); }
    return dur + 0.8;
  },

  /** A camel's groan with the bell at its neck. */
  timCamel(t, bus, lv) {
    this.tone(t, [[0, 118], [0.5, 86], [1.3, 60]], 1.5, 0.05 * lv, bus, 'sawtooth', ['lowpass', 500]);
    this.rasp(t, 1.4, 230, 1.2, 0.02 * lv, bus, 22, 0.8);
    for (const dt of [0.2, 0.9, 1.7, 2.4]) this.cue(t + dt, (x) => this.struck(x, 340 * (0.97 + R() * 0.06), 0.03 * lv, bus, [[1, 1, 0.5], [2.3, 0.5, 0.3], [3.8, 0.25, 0.15]]));
    return 3.2;
  },

  /** A caravan passing along a street: the camels' long slow steps (a pace of 1.1 s) with the bell at each, the cameleer's low call now and then. */
  timCaravan(t, bus, lv, f) {
    const dur = f.dur, pace = 1.1, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => {
      this.tone(x, [[0, 90], [0.12, 55]], 0.16, 0.05 * lv, bus, 'sine'); this.burst(x, 0.05, 420, 1.2, 0.02 * lv, bus);
      this.struck(x + 0.02, 330 * (0.97 + 0.06 * (k % 3) / 3), 0.022 * lv, bus, [[1, 1, 0.5], [2.3, 0.45, 0.28]]);
    });
    for (let k = 0; k < 2 && 2 + k * 6 < dur - 2; k++) this.cue(t + 2 + k * 6, (x) => this.cry(x, 135 * (0.95 + R() * 0.1), [[0, 0.3, 'o'], [5, 0.6, 'a'], [3, 0.5, 'u']], 0.04 * lv, bus, { cutoff: 3000 }));
    return dur;
  },

  /** The water carrier (saqqo) with his skin and brass cup: his call, the cup rung against the bowl, steps along the street. */
  timSaqqo(t, bus, lv, f) {
    const dur = f.dur, pace = 0.55, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => this.step(x, 0.04 * lv, bus, 'cloth', 0.3));
    for (let k = 0; k < 2 && 1.5 + k * 7 < dur - 2; k++) {
      const f0 = 145 * (0.94 + R() * 0.12);
      this.cue(t + 1.5 + k * 7, (x) => this.cry(x, f0, [[0, 0.35, 'a'], [5, 0.35, 'a'], [3, 0.35, 'a'], [0, 1.0, 'u']], 0.05 * lv, bus, { cutoff: 3400 }));
      for (const dt of [2.1, 2.5]) this.cue(t + 1.5 + k * 7 + dt, (x) => this.struck(x, 1850 * (0.96 + R() * 0.08), 0.02 * lv, bus, [[1, 1, 0.3], [2.7, 0.5, 0.18], [5.1, 0.2, 0.1]]));
    }
    return dur;
  },

  /** The night watch's rounds: the beat of a staff on the paving at a walker's pace, now and then a call from the kotwal's man. */
  timWatch(t, bus, lv, f) {
    const dur = f.dur, pace = 0.7, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.step(x, 0.035 * lv, bus, 'cloth', 0.2); if (k % 3 === 0) this.knock(x + 0.05, 600, 0.03 * lv, bus, 0.06); });
    for (let k = 0; k < 2 && 3 + k * 8 < dur - 2; k++) this.cue(t + 3 + k * 8, (x) => this.cry(x, 128 * (0.95 + R() * 0.1), [[0, 0.3, 'o'], [4, 0.7, 'a'], [0, 0.6, 'u']], 0.04 * lv, bus, { cutoff: 2800 }));
    return dur;
  },
};
/** Levels of the voices (relative to their own scale), set by measuring renders (tools/sound-render.mjs). */
export const TIMURID_GAIN = { timNawbat: 0.3, timDutar: 0.6, timDoira: 0.4, timCopper: 1.0, timAryk: 1.0, timDoves: 0.5, timCamel: 0.5, timCaravan: 0.5 };
addVoices('voices-timurid.js', TIMURID_VOICES, TIMURID_GAIN);
