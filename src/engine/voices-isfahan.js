// Voices of Safavid Isfahan about 1630 (docs/settlements/isfahan.md §26.3), added to the placed voices of voices.js through addVoices (every name
// begins `isf`): what the Naqsh-e Jahan Square, its bazaar, coffeehouses, canals and the pigeon towers sounded like, in the same synthesised terms
// as the other settlements' (noise, oscillators, formant filters, struck partials; no samples). Each is a method `name(t, bus, lv)` of the audio
// engine's Music returning how long it lasts; each level was set by measuring a render (tools/sound-render.mjs), not by ear.
// [inferred throughout: no recording of 1630 exists. Stated by travellers: the drums and trumpets of the naqqareh-khaneh at sunset and at midnight
// (Tavernier, via romeartlover.it/Isfahan3), the bagpipes and frame drums of the bazaar (García de Silva y Figueroa, 1618, via Ruiz Jiménez, Historical
// Soundscapes 5, 2019), a dervish calling the prayer from a minaret in the morning, at midday and in the afternoon (the same), reciters of the
// Shahnameh and storytellers in the coffeehouses and water pipes smoked there (Encyclopaedia Iranica, "Coffeehouse"). Every melody and pattern is ours.]

import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Dastgah-e Shur on D, as semitones above the tonic (the E is the koron, half-flat: 1.5): D E~ F G A B♭ C. */
const SHUR = [0, 1.5, 3, 5, 7, 8, 10];
const shur = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 7) * 12 + SHUR[((deg % 7) + 7) % 7]) / 12);

/** The hawkers' cries (wordless): [semitones above the voice's base, seconds, vowel]; each its own contour. */
export const CRIES = {
  melon: { cry: [[0, 0.3, 'e'], [4, 0.3, 'e'], [7, 0.5, 'a'], [5, 0.4, 'a'], [0, 1.0, 'o']], fem: false },     // the melon seller (Isfahan's melons: Archnet, the pigeon towers' dung)
  bread: { cry: [[9, 0.25, 'i'], [7, 0.25, 'i'], [4, 0.9, 'a']], fem: null },                                   // the baker's boy with flat bread
  broker: { cry: [[5, 0.2, 'a'], [5, 0.2, 'a'], [8, 0.35, 'a'], [5, 0.3, 'e'], [0, 1.2, 'u']], fem: false },      // the broker (dallal) crying a carpet's price
};
const hawkOf = (kind) => function hawk(t, bus, lv) {
  const C = CRIES[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const fem = C.fem === null ? R() < 0.5 : C.fem, f0 = (fem ? 280 : 160) * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C.cry, 0.05 * lv, bus, { fem, cutoff: 4200 }));
    w += C.cry.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2;
  }
  return w - t;
};

export const ISFAHAN_VOICES = {
  isfHawkMelon: hawkOf('melon'), isfHawkBread: hawkOf('bread'), isfHawkBroker: hawkOf('broker'),

  /**
   * The naqqareh-khaneh over the Qeysarieh portal at sunset (and at midnight and sunrise): a pair of kettledrums beating a pattern of eight
   * (the high one answering the low), a rolling dohol under them, and the karna's long bellowing notes swelling over it, three of them
   * (a long straight horn: a sawtooth through a low band, a little flat of its note), the whole about twenty seconds.
   */
  isfNaqqareh(t, bus, lv) {
    const pat = [1, 0.5, 0.7, 1, 0.5, 0.8, 0.5, 0.9], P = 0.34 + R() * 0.04, bars = 12 + Math.floor(R() * 4), dur = bars * 8 * P;
    for (let b = 0; b < bars; b++) for (let k = 0; k < 8; k++) {
      const a = pat[k] * (0.55 + 0.45 * Math.sin(Math.PI * (b + 0.5) / bars)), x = t + (b * 8 + k) * P, hi = k % 2 === 1;
      this.cue(x, (y) => {
        this.tone(y, [[0, hi ? 150 : 96], [0.18, hi ? 112 : 66]], 0.34, 0.06 * lv * a, bus, 'sine');
        this.burst(y, 0.07, hi ? 1500 : 800, 1.2, 0.022 * lv * a, bus);
      });
    }
    for (let k = 0; k < dur / 1.4; k++) this.cue(t + k * 1.4 + 0.17, (y) => this.burst(y, 0.12, 420, 1.2, 0.016 * lv, bus, 0.01));   // the dohol's roll under it
    const f0 = 138 * (0.96 + R() * 0.08);
    for (const [at, len, m] of [[0.12, 0.28, 1], [0.42, 0.26, 1.125], [0.74, 0.3, 1]]) {
      const x = t + at * dur, d = len * dur, ctx = this.ctx, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), bg = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * m * 0.97, x); o.frequency.linearRampToValueAtTime(f0 * m, x + 0.4); o2.frequency.value = f0 * m * 1.006;
      lp.type = 'lowpass'; lp.frequency.value = 900; bp.type = 'bandpass'; bp.frequency.value = 560; bp.Q.value = 2.5; bg.gain.value = 0.9;
      g.gain.setValueAtTime(0.0001, x); g.gain.exponentialRampToValueAtTime(0.05 * lv, x + d * 0.3); g.gain.setValueAtTime(0.05 * lv, x + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, x + d);
      o.connect(lp); o2.connect(lp); lp.connect(g); o.connect(bp); bp.connect(bg); bg.connect(g); g.connect(bus);
      o.start(x); o2.start(x); o.stop(x + d + 0.05); o2.stop(x + d + 0.05);
    }
    return dur + 1;
  },

  /** The bazaar's bagpipe (ney-anbān): a drone on D held under a chanter's running phrase in Shur, a few ornaments, no breath between. */
  isfNeyAnban(t, bus, lv) {
    const ctx = this.ctx, tonic = 146.83, n = 12 + Math.floor(R() * 8), dur = n * 0.36 + 1;
    const d = ctx.createOscillator(), dg = ctx.createGain(), dlp = ctx.createBiquadFilter();
    d.type = 'sawtooth'; d.frequency.value = tonic; dlp.type = 'lowpass'; dlp.frequency.value = 700; dg.gain.setValueAtTime(0.0001, t); dg.gain.exponentialRampToValueAtTime(0.018 * lv, t + 0.5); dg.gain.setValueAtTime(0.018 * lv, t + dur - 0.6); dg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    d.connect(dlp); dlp.connect(dg); dg.connect(bus);
    d.start(t); d.stop(t + dur + 0.05);
    let deg = 7, w = t + 0.4;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + (R() < 0.5 ? -1 : 1) * (R() < 0.7 ? 1 : 2), 4, 12);
      if (k === n - 1) deg = 7;
      const f = shur(deg, tonic * 2), len = 0.2 + R() * 0.28 + (k === n - 1 ? 0.5 : 0);
      this.cue(w, (x) => {
        this.tone(x, [[0, f], [len, f * (1 + 0.003)]], len, 0.04 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.4]);
        if (R() < 0.3) this.tone(x + len * 0.5, [[0, f * 1.12], [0.05, f * 1.12]], 0.06, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.4]);   // a grace note
      });
      w += len;
    }
    return w - t + 0.8;
  },

  /** A frame drum (daf / dayereh) played with the fingers: the low stroke from the middle, the bright one from the rim, the rings jingling, a rhythm of eight. */
  isfDaf(t, bus, lv) {
    const pat = [['d', 1], ['t', 0.6], ['t', 0.6], ['d', 0.9], ['t', 0.5], ['d', 0.8], ['t', 0.7], ['t', 0.5]], P = 0.2 + R() * 0.04, bars = 4 + Math.floor(R() * 4);
    for (let b = 0; b < bars; b++) for (let k = 0; k < 8; k++) {
      const [s, a] = pat[k], x = t + (b * 8 + k) * P;
      if (R() < 0.06) continue;
      this.cue(x, (y) => {
        if (s === 'd') this.tone(y, [[0, 170], [0.1, 105]], 0.22, 0.05 * lv * a, bus, 'sine'); else { this.burst(y, 0.05, 3000, 1.4, 0.07 * lv * a, bus); this.tone(y, [[0, 520], [0.06, 400]], 0.08, 0.02 * lv * a, bus, 'sine'); }
        this.burst(y, 0.16, 5200, 2.5, 0.03 * lv * a, bus);                                      // the rings
      });
    }
    return bars * 8 * P + 0.4;
  },

  /** The water seller (saqqā) with his brass cup: his call, and the cup's ring struck on the bowl he carries. */
  isfSaqqa(t, bus, lv) {
    const f0 = 150 * (0.94 + R() * 0.12);
    this.cue(t, (x) => this.cry(x, f0, [[0, 0.35, 'a'], [5, 0.35, 'a'], [3, 0.35, 'a'], [0, 1.1, 'u']], 0.05 * lv, bus, { cutoff: 3600 }));
    for (const dt of [2.2, 2.55, 3.1]) this.cue(t + dt, (x) => this.struck(x, 1900 * (0.96 + R() * 0.08), 0.022 * lv, bus, [[1, 1, 0.3], [2.7, 0.5, 0.18], [5.1, 0.2, 0.1]]));
    return 4.5;
  },

  /** A coppersmith beating a pot on the stake: rounds of quick hollow taps with the bright ring of the rim, a pause, another round. */
  isfCopper(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 2), f0 = 780 + R() * 360;
    for (let r = 0; r < rounds; r++) {
      const n = 12 + Math.floor(R() * 14), P = 0.13 + R() * 0.04;
      for (let i = 0; i < n; i++) {
        const a = i % 4 === 0 ? 1 : 0.55, f = f0 * (1 + 0.1 * (i % 3));
        this.cue(w + i * P, (x) => { this.struck(x, f, 0.04 * lv * a, bus, [[1, 1, 0.14], [2.76, 0.5, 0.09], [5.4, 0.25, 0.05]]); this.burst(x, 0.012, 2600, 1, 0.02 * lv * a, bus); });
      }
      w += n * P + 0.7 + R() * 1.2;
    }
    return w - t;
  },

  /** A basin's fountain: the jet falling on the water, a steady bright hiss that swells a little, with the plink of single drops. */
  isfFountain(t, bus, lv) {
    const dur = 6 + R() * 3, ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.022 * lv, t + 1); g.gain.setValueAtTime(0.022 * lv, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
    for (let k = 0, m = 5 + Math.floor(R() * 5); k < m; k++) this.cue(t + 0.3 + R() * (dur - 0.6), (x) => this.tone(x, [[0, 900 + R() * 700], [0.05, 1800 + R() * 800]], 0.07, 0.012 * lv, bus, 'sine'));
    return dur;
  },
  /** Water running down a stone channel from basin to basin: a soft low rush with a small fall at each step, uneven. */
  isfChannel(t, bus, lv) {
    const dur = 7 + R() * 4, ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02 * lv, t + 1.2); g.gain.setValueAtTime(0.02 * lv, t + dur - 1.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
    for (let k = 0, m = 8 + Math.floor(R() * 6); k < m; k++) this.cue(t + R() * dur, (x) => this.tone(x, [[0, 380 + R() * 260], [0.12, 560 + R() * 300]], 0.1, 0.014 * lv, bus, 'sine', ['lowpass', 1400]));
    return dur;
  },

  /** Pigeons on a dovecote: the low rolling coo of several birds out of step, now and then the clatter of a wing and a few taking off. */
  isfPigeons(t, bus, lv) {
    const dur = 5 + R() * 4;
    for (let b = 0; b < 4; b++) for (let k = 0, m = 2 + Math.floor(R() * 3); k < m; k++) {
      const x = t + R() * (dur - 1.2), f = 430 + R() * 90;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.1, f * 0.9]], 0.16, 0.022 * lv, bus, 'triangle', ['lowpass', 900]); this.tone(y + 0.2, [[0, f * 1.06], [0.14, f * 0.82]], 0.3, 0.026 * lv, bus, 'triangle', ['lowpass', 900]); this.tone(y + 0.55, [[0, f * 0.95], [0.1, f * 0.85]], 0.18, 0.018 * lv, bus, 'triangle', ['lowpass', 900]); });
    }
    if (R() < 0.5) { const x = t + R() * dur; for (let k = 0; k < 8; k++) this.cue(x + k * 0.06, (y) => this.burst(y, 0.05, 2300, 1.1, 0.02 * lv * (1 - k / 10), bus)); }
    return dur + 1;
  },

  /** A camel's groan: a low, rattling roar that drops and ends in a grunt; with it the knock of the bell at its neck. */
  isfCamel(t, bus, lv) {
    this.tone(t, [[0, 120], [0.5, 88], [1.3, 62]], 1.5, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520]);
    this.rasp(t, 1.4, 240, 1.2, 0.02 * lv, bus, 22, 0.8);
    this.cue(t + 1.8, (x) => this.tone(x, [[0, 80], [0.15, 58]], 0.2, 0.04 * lv, bus, 'sawtooth', ['lowpass', 420]));
    for (const dt of [0.2, 0.9, 1.7, 2.4]) this.cue(t + dt, (x) => this.struck(x, 360 * (0.97 + R() * 0.06), 0.03 * lv, bus, [[1, 1, 0.5], [2.33, 0.5, 0.3], [3.9, 0.25, 0.15]]));
    return 3.2;
  },

  /** A storyteller (naqqāl) reciting from the Shahnameh in the coffeehouse: wordless declaiming phrases, each swelling to a high held syllable and falling away, a stick tapped for the blows of the tale. */
  isfNaqqal(t, bus, lv) {
    const f0 = 118 * (0.94 + R() * 0.12), n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const hi = 6 + Math.floor(R() * 4), notes = [[0, 0.25, 'o'], [2, 0.2, 'a'], [4, 0.2, 'a'], [hi, 0.7 + R() * 0.5, 'a'], [hi - 2, 0.3, 'e'], [3, 0.4, 'o'], [0, 0.9, 'u']];
      this.cue(w, (x) => this.cry(x, f0, notes, 0.06 * lv, bus, { cutoff: 2800 }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.7 + R() * 1.2;
      if (R() < 0.5) this.cue(w - 0.4, (x) => this.knock(x, 520, 0.03 * lv, bus, 0.07));
    }
    return w - t + 0.5;
  },

  /** A water pipe (ghalyān) drawn on: slow, bubbling, a rolling run of low hollow bubbles that swells and dies, a breath out. */
  isfGhalyan(t, bus, lv) {
    const n = 7 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.08 + R() * 0.06), (x) => this.tone(x, [[0, 170 + R() * 110], [0.07, 330 + R() * 150]], 0.09, 0.03 * lv * Math.sin(Math.PI * (k + 0.5) / n), bus, 'sine'));
    this.burst(t + n * 0.12, 1.2, 900, 0.8, 0.008 * lv, bus, 0.3);
    return n * 0.12 + 1.6;
  },

  /** Polo on the packed earth: the gallop of a horse bearing down and past (four beats to the stride, swelling and falling), the mallet's crack on the ball, a shout. */
  isfPolo(t, bus, lv) {
    const dur = 5 + R() * 2, P = 0.3;
    for (let k = 0; k < dur / P; k++) {
      const a = 0.08 + Math.sin(Math.PI * k * P / dur), x = t + k * P;
      for (const [dt, f] of [[0, 520], [0.06, 640], [0.12, 560], [0.2, 760]]) this.cue(x + dt * P / 0.3, (y) => { this.tone(y, [[0, 110], [0.05, 70]], 0.08, 0.02 * lv * a, bus, 'sine'); this.burst(y, 0.05, f, 1.6, 0.06 * lv * a, bus); });
    }
    this.cue(t + dur * 0.55, (x) => { this.knock(x, 1900, 0.05 * lv, bus, 0.05); this.cry(x + 0.25, 170 * (0.95 + R() * 0.1), [[0, 0.2, 'a'], [5, 0.5, 'a']], 0.045 * lv, bus, { cutoff: 3600 }); });
    return dur + 1;
  },

  /** The santur in the music hall of Ali Qapu (a hammered dulcimer: bright paired strings struck with two light hammers, quick runs and trills in Shur, each ringing on). */
  isfSantur(t, bus, lv) {
    const tonic = 293.66, n = 14 + Math.floor(R() * 10);
    let w = t, deg = 7;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + (R() < 0.5 ? -1 : 1) * (R() < 0.75 ? 1 : 2), 3, 14);
      if (k === n - 1) deg = 7;
      const f = shur(deg, tonic), trill = R() < 0.18, len = k === n - 1 ? 1.2 : 0.16 + R() * 0.22;
      for (let s = 0, m = trill ? 4 : 1; s < m; s++) this.cue(w + s * 0.07, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 1.3], [2.003, 0.45, 0.7], [3.01, 0.25, 0.4], [4.02, 0.12, 0.25]]));
      w += len;
    }
    return w - t + 1.5;
  },

  /** The hand bell of a boy leading a laden donkey and the thud of its hooves: soft, slow, a walker's pace. */
  isfDonkeyBell(t, bus, lv) {
    const n = 7 + Math.floor(R() * 5);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.62, (x) => { this.struck(x, 640, 0.02 * lv, bus, [[1, 1, 0.3], [2.4, 0.4, 0.18]]); this.tone(x + 0.03, [[0, 95], [0.1, 62]], 0.12, 0.03 * lv, bus, 'sine'); });
    return n * 0.62 + 0.5;
  },
};
/** Levels of the voices (relative to their own scale), set by measuring renders (tools/sound-render.mjs). */
export const ISFAHAN_GAIN = { isfNaqqareh: 0.55, isfNeyAnban: 1.0, isfDaf: 0.6, isfCopper: 1.0, isfFountain: 1.0, isfChannel: 1.0, isfPigeons: 0.6, isfCamel: 0.7, isfSantur: 0.6, isfPolo: 1.0 };
addVoices('voices-isfahan.js', ISFAHAN_VOICES, ISFAHAN_GAIN);
