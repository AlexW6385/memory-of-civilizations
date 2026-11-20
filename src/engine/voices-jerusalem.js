// Voices of Umayyad Jerusalem about 700 (docs/settlements/jerusalem.md §12.3), added to the placed voices of voices.js through addVoices (every name
// begins `jer`): what the Haram, the Cardo's market, the workshops of the houses and the Holy Sepulchre sounded like, in the same synthesised terms
// as the other settlements' (noise, oscillators, formant filters, struck partials; no samples). Each is a method `name(t, bus, lv)` of the audio
// engine's Music returning how long it lasts (the walkers `jerDonkeyTrain(t, bus, lv, f)` also take the track they follow); the map is
// src/settlements/jerusalem/soundmap.js. Levels were set by measuring renders (tools/sound-render.mjs), not by ear.
// [inferred throughout: no recording of the year 700 exists. Stated by the sources of the dossier: the readers, the incense and the attendants of the
// Haram (Elad), the markets of the Cardo (Madain Project; Hebrew University study), the Christian worship of the Holy Sepulchre under Muslim rule
// (the pilgrim Arculf, about 680, saw the church in use); every melody, pattern and level here is ours.]

import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** The hawkers' cries (wordless): [semitones above the voice's base, seconds, vowel]; each its own contour. */
export const CRIES = {
  water: { cry: [[0, 0.35, 'a'], [5, 0.35, 'a'], [3, 0.35, 'a'], [0, 1.1, 'u']], fem: false },                                  // the water seller (saqqa), with his cup's ring
  fruit: { cry: [[7, 0.25, 'e'], [9, 0.25, 'e'], [12, 0.5, 'a'], [9, 0.35, 'a'], [4, 0.9, 'o']], fem: null },                     // figs, olives and grapes in their seasons
  bread: { cry: [[9, 0.22, 'i'], [7, 0.22, 'i'], [4, 0.3, 'a'], [0, 0.9, 'a']], fem: true },                                      // the woman with the loaves
};
const hawkOf = (kind, base) => function hawk(t, bus, lv) {
  const C = CRIES[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const fem = C.fem === null ? R() < 0.5 : C.fem, f0 = (base ?? (fem ? 270 : 150)) * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C.cry, 0.05 * lv, bus, { fem, cutoff: 4000 }));
    w += C.cry.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2;
  }
  return w - t;
};

export const JERUSALEM_VOICES = {
  jerHawkWater: hawkOf('water', 148), jerHawkFruit: hawkOf('fruit'), jerHawkBread: hawkOf('bread'),

  /** The water seller's brass cup, struck on the bowl he carries (after his call: the cry itself is jerHawkWater). */
  jerCup(t, bus, lv) {
    for (const dt of [0, 0.34, 0.9]) this.cue(t + dt, (x) => this.struck(x, 1850 * (0.96 + R() * 0.08), 0.022 * lv, bus, [[1, 1, 0.3], [2.7, 0.5, 0.18], [5.1, 0.2, 0.1]]));
    return 2;
  },

  /** A reader of the Qur'an: a slow wordless chant, phrases that climb through a mode with a three-quarter-tone second to a held note and fall in turns to the tonic. */
  jerRecite(t, bus, lv) {
    const f0 = 118 + R() * 24, ph = [
      [[0, 0.5, 'a'], [1.5, 0.45, 'a'], [3, 0.5, 'i'], [5, 0.9, 'a'], [3, 0.5, 'a'], [1.5, 0.5, 'o'], [0, 1.6, 'u']],
      [[5, 0.45, 'o'], [7, 0.5, 'a'], [8, 0.4, 'a'], [7, 0.9, 'a'], [5, 0.5, 'i'], [3, 0.5, 'a'], [0, 1.8, 'a']],
    ];
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      const p = ph[Math.floor(R() * ph.length)], d = p.reduce((s, q) => s + q[1], 0);
      this.cue(w, (x) => this.cry(x, f0, p, 0.04 * lv, bus, { cutoff: 3000 }));
      w += d + 1.0 + R() * 1.5;
    }
    return w - t;
  },

  /**
   * The plainchant of the Holy Sepulchre: a body of low voices on one note with inflections (a fourth up at the verse's middle, back at its end),
   * the long drone (the ison) under them, a pause between verses.
   */
  jerPsalm(t, bus, lv) {
    const f0 = 104 + R() * 8, nv = 2 + Math.floor(R() * 2), vs = [[0, 0.6, 'a'], [0, 0.4, 'o'], [0, 0.4, 'o'], [5, 0.5, 'a'], [3, 0.35, 'e'], [0, 0.4, 'o'], [0, 0.4, 'o'], [0, 0.35, 'e'], [-2, 0.9, 'o'], [0, 1.4, 'u']];
    let w = t;
    for (let k = 0; k < nv; k++) {
      const d = vs.reduce((s, q) => s + q[1], 0);
      this.cue(w, (x) => { this.cry(x, f0, vs, 0.04 * lv, bus, { cutoff: 2400 }); this.cry(x + 0.04, f0 * 2 * 0.998, vs, 0.018 * lv, bus, { cutoff: 2600 }); });
      w += d + 1.6 + R() * 1.4;
    }
    const dur = w - t, ctx = this.ctx, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 400;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.007 * lv, t + 2); g.gain.setValueAtTime(0.007 * lv, t + dur - 1.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [f, ty, a] of [[f0, 'sine', 1], [f0 * 1.5, 'triangle', 0.4]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = ty; o.frequency.value = f; og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.05); }
    lp.connect(g); g.connect(bus);
    return dur;
  },

  /** The semantron of the Holy Sepulchre: a board struck with a mallet in a call that quickens (the engine's semantron), the hollow of the court round it. */
  jerSemantron(t, bus, lv) { this.semantron(t, 0.06 * lv, bus); return 5.5; },

  /** A coppersmith beating a tray on the stake: rounds of quick hollow taps with the ring of the rim, a pause, another round (lower and duller than a bazaar's brass). */
  jerCopper(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 2), f0 = 560 + R() * 260;
    for (let r = 0; r < rounds; r++) {
      const n = 10 + Math.floor(R() * 12), P = 0.15 + R() * 0.05;
      for (let i = 0; i < n; i++) {
        const a = i % 4 === 0 ? 1 : 0.55, f = f0 * (1 + 0.09 * (i % 3));
        this.cue(w + i * P, (x) => { this.struck(x, f, 0.04 * lv * a, bus, [[1, 1, 0.16], [2.4, 0.5, 0.1], [4.9, 0.2, 0.05]]); this.burst(x, 0.012, 2200, 1, 0.02 * lv * a, bus); });
      }
      w += n * P + 0.8 + R() * 1.2;
    }
    return w - t;
  },

  /** An olive crusher: the great stone turned round its basin by a beam on a post, a low grating rumble rising and falling with the turn, the beam's creak, the pace of the beast. */
  jerOilMill(t, bus, lv) {
    const dur = 6 + R() * 3, turn = 2.6 + R() * 0.6, ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), am = ctx.createOscillator(), ag = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 210; bp.Q.value = 1.1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03 * lv, t + 1); g.gain.setValueAtTime(0.03 * lv, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    am.frequency.value = 1 / turn; ag.gain.value = 0.014 * lv; am.connect(ag); ag.connect(g.gain);
    s.connect(bp); bp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05); am.start(t); am.stop(t + dur + 0.05);
    for (let k = 0; k * turn < dur - 1; k++) this.cue(t + k * turn + 0.3, (x) => this.tone(x, [[0, 330], [0.5, 410], [0.9, 360]], 0.9, 0.012 * lv, bus, 'sawtooth', ['bandpass', 700, 4]));
    for (let k = 0; k * 0.7 < dur - 0.5; k++) this.cue(t + 0.2 + k * 0.7, (x) => this.tone(x, [[0, 90], [0.1, 60]], 0.12, 0.02 * lv, bus, 'sine'));
    return dur;
  },

  /** A hand quern turned for flour: the grating of the stone going round, a beat to each turn, a pause to pour more grain. */
  jerQuern(t, bus, lv) {
    let w = t;
    for (let r = 0, rounds = 2 + Math.floor(R() * 2); r < rounds; r++) {
      const n = 6 + Math.floor(R() * 6), P = 0.62 + R() * 0.12;
      for (let i = 0; i < n; i++) this.cue(w + i * P, (x) => { this.rasp(x, P * 0.8, 900, 0.9, 0.02 * lv, bus, 26, 0.7); this.burst(x, 0.04, 400, 1, 0.015 * lv, bus); });
      w += n * P + 0.6 + R() * 0.8;
    }
    return w - t;
  },

  /** The clay oven (tabun): the crackle of burning brush and dung cakes, now and then a collapse of embers, a low breath of draught. */
  jerTabun(t, bus, lv) {
    const dur = 6 + R() * 4, ctx = this.ctx, s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; lp.type = 'lowpass'; lp.frequency.value = 380;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * lv, t + 1); g.gain.setValueAtTime(0.012 * lv, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(lp); lp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
    for (let k = 0, n = 14 + Math.floor(R() * 14); k < n; k++) this.cue(t + 0.3 + R() * (dur - 0.6), (x) => this.burst(x, 0.012 + R() * 0.02, 1800 + R() * 2600, 1.2, 0.03 * lv * (0.4 + R() * 0.6), bus));
    if (R() < 0.5) this.cue(t + 1 + R() * (dur - 2), (x) => this.burst(x, 0.2, 500, 0.8, 0.03 * lv, bus, 0.01));
    return dur;
  },

  /** The glass-lamp makers' furnace: the fire's low roar swelling with the bellows, the blowpipe tapped on its iron rest, a hiss as a lamp is dipped to cool. */
  jerGlass(t, bus, lv) {
    const dur = 7 + R() * 3, ctx = this.ctx, s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; lp.type = 'lowpass'; lp.frequency.value = 260;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025 * lv, t + 1.2);
    for (let k = 1; k * 2.2 < dur - 1; k++) { g.gain.exponentialRampToValueAtTime(0.04 * lv, t + 1.2 + k * 2.2 - 0.9); g.gain.exponentialRampToValueAtTime(0.022 * lv, t + 1.2 + k * 2.2 + 0.2); }
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(lp); lp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 1 + k * 1.1 + R() * 0.3, (x) => this.struck(x, 1350 * (0.97 + R() * 0.06), 0.02 * lv, bus, [[1, 1, 0.2], [2.7, 0.4, 0.1]]));
    this.cue(t + dur - 2, (x) => this.rasp(x, 0.9, 5200, 0.7, 0.012 * lv, bus, 14, 0.3));
    return dur;
  },

  /** A circle of men listening to a reader or talking in low voices on the esplanade: a murmur of short wordless syllables, one now and then answering. */
  jerTalk(t, bus, lv) {
    const n = 5 + Math.floor(R() * 5), V = ['a', 'o', 'e', 'a', 'u'];
    let w = t;
    for (let k = 0; k < n; k++) {
      const f0 = 105 + R() * 25, m = 2 + Math.floor(R() * 2), notes = Array.from({ length: m }, (_, j) => [j ? R() * 3 : 0, 0.14 + R() * 0.12, V[Math.floor(R() * 5)]]);
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 2200 }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.3 + R() * 0.9;
    }
    return w - t + 0.4;
  },

  /** Rock doves on the paving and the ledges of the Haram: the soft rolling coo of several birds out of step, now and then a clatter of wings and a few taking off. */
  jerDoves(t, bus, lv) {
    const dur = 5 + R() * 4;
    for (let b = 0; b < 4; b++) for (let k = 0, m = 2 + Math.floor(R() * 3); k < m; k++) {
      const x = t + R() * (dur - 1.2), f = 410 + R() * 80;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.1, f * 0.92]], 0.15, 0.02 * lv, bus, 'triangle', ['lowpass', 850]); this.tone(y + 0.18, [[0, f * 1.07], [0.14, f * 0.84]], 0.28, 0.024 * lv, bus, 'triangle', ['lowpass', 850]); this.tone(y + 0.5, [[0, f * 0.96], [0.1, f * 0.86]], 0.16, 0.016 * lv, bus, 'triangle', ['lowpass', 850]); });
    }
    if (R() < 0.45) { const x = t + R() * dur; for (let k = 0; k < 8; k++) this.cue(x + k * 0.06, (y) => this.burst(y, 0.05, 2200, 1.1, 0.02 * lv * (1 - k / 10), bus)); }
    return dur + 1;
  },

  /** A camel's groan and the knock of the bell at its neck, as a caravan halts at a gate. */
  jerCamel(t, bus, lv) {
    this.tone(t, [[0, 118], [0.5, 90], [1.3, 64]], 1.5, 0.05 * lv, bus, 'sawtooth', ['lowpass', 500]);
    this.rasp(t, 1.4, 240, 1.2, 0.02 * lv, bus, 22, 0.8);
    this.cue(t + 1.8, (x) => this.tone(x, [[0, 82], [0.15, 60]], 0.2, 0.04 * lv, bus, 'sawtooth', ['lowpass', 420]));
    for (const dt of [0.2, 0.9, 1.7, 2.4]) this.cue(t + dt, (x) => this.struck(x, 340 * (0.97 + R() * 0.06), 0.03 * lv, bus, [[1, 1, 0.5], [2.33, 0.5, 0.3], [3.9, 0.25, 0.15]]));
    return 3.2;
  },

  /** A laden donkey led along the street (the track `f`): the soft knock of its hooves at a walking pace, the driver's low call now and then, a bell. */
  jerDonkeyTrain(t, bus, lv, f) {
    const dur = f.dur, pace = 0.62 + R() * 0.1, n = Math.floor(dur / pace), bell = R() < 0.6;
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.tone(x, [[0, 150], [0.07, 90]], 0.1, 0.026 * lv, bus, 'sine'); this.burst(x + 0.01, 0.025, 1200, 1.4, 0.016 * lv, bus); if (bell && k % 2 === 0) this.struck(x + 0.02, 700, 0.012 * lv, bus, [[1, 1, 0.3], [2.4, 0.4, 0.18]]); });
    if (dur > 6) this.cue(t + dur * (0.3 + R() * 0.4), (x) => this.cry(x, 135 * (0.95 + R() * 0.1), [[0, 0.3, 'o'], [4, 0.5, 'a'], [0, 0.7, 'o']], 0.035 * lv, bus, { cutoff: 2600 }));
    return dur;
  },

  /** A jackal on the slope of the Mount of Olives at night: one long wavering wail that rises and falls, answered by a few yaps from the others. */
  jerJackal(t, bus, lv) {
    const f = 620 + R() * 120, ctx = this.ctx;
    const o = ctx.createOscillator(), vib = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.8, t); o.frequency.linearRampToValueAtTime(f * 1.35, t + 0.9); o.frequency.linearRampToValueAtTime(f * 1.15, t + 1.7); o.frequency.linearRampToValueAtTime(f * 0.9, t + 2.3);
    vib.frequency.value = 7.5; vg.gain.value = f * 0.035; vib.connect(vg); vg.connect(o.frequency);
    bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03 * lv, t + 0.4); g.gain.setValueAtTime(0.03 * lv, t + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(bp); bp.connect(g); g.connect(bus); o.start(t); o.stop(t + 2.45); vib.start(t); vib.stop(t + 2.45);
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + 2.8 + k * 0.28 + R() * 0.08, (x) => this.tone(x, [[0, f * 1.2], [0.1, f * 0.9]], 0.12, 0.022 * lv, bus, 'sawtooth', ['bandpass', 1300, 2]));
    return 4.6;
  },
};
/** Levels of the voices (relative to their own scale), set by measuring renders (tools/sound-render.mjs). */
export const JERUSALEM_GAIN = { jerCamel: 0.7, jerDoves: 0.6, jerQuern: 1.5, jerTabun: 2.2, jerTalk: 1.6, jerGlass: 1.4, jerCup: 1.3, jerHawkBread: 1.2 };
addVoices('voices-jerusalem.js', JERUSALEM_VOICES, JERUSALEM_GAIN);
void clamp;
