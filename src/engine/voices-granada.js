// Voices of Nasrid Granada about 1390 (docs/settlements/granada.md §22), added to the placed voices of voices.js through addVoices (every name begins `gran`):
// what the Alhambra's courts and the medina below its walls sounded like, in the same synthesised terms as the other settlements' (noise, oscillators, formant
// filters, struck partials; no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music returning how long it lasts; each level was set by
// measuring a render (tools/sound-render.mjs: RMS 1e-3 to 6e-3, peak under 0.07 after the gain, as the other settlements' voices), not by ear. [inferred throughout: no recording of 1390 exists. Stated: the call to prayer five times a day and the
// ablution cistern of the Great Mosque, the Qur'an recited melodically (Historical Soundscapes, "Granada"); the Acequia Real's channels that fed the medina and
// its gardens, the potters' and glassmakers' furnaces, the tannery, the waterwheels and the mint of the Alhambra's upper area (Patronato de la Alhambra, "Urban
// structure"); the añafil (the long straight trumpet, nafir) and the atabales (kettledrums) of the Nasrid armies and ceremonies [inferred from Castilian chronicles
// of the war of Granada, where both words come from the Arabic]. Every melody and pattern is ours.]

import { addVoices } from './voices.js';

const R = Math.random;

/** The cries (wordless): [semitones above the voice's base, seconds, vowel]. */
const CRIES = {
  water: [[0, 0.3, 'a'], [5, 0.3, 'a'], [3, 0.4, 'a'], [0, 1.0, 'u']],        // the water carrier with his jar
  bread: [[9, 0.22, 'i'], [7, 0.22, 'i'], [4, 0.8, 'a']],                      // the baker's boy
  mule: [[2, 0.18, 'a'], [2, 0.18, 'a'], [7, 0.5, 'o']],                        // the muleteer urging his string up the slope
};
const cryOf = (kind, base) => function cry(t, bus, lv) {
  const C = CRIES[kind], fem = false, f0 = base * (0.93 + R() * 0.14);
  this.cue(t, (x) => this.cry(x, f0, C, 0.05 * lv, bus, { fem, cutoff: 4200 }));
  return C.reduce((s, c) => s + c[1], 0) + 1;
};

/** A water jet into a basin: the bright hiss and the plink of drops (a marble basin: clearer than a pool). */
function fall(m, t, bus, lv, dur, f, a) {
  const ctx = m.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = m.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 0.7;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a * lv, t + 1); g.gain.setValueAtTime(a * lv, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bp); bp.connect(g); g.connect(bus); s.start(t, R() * 3); s.stop(t + dur + 0.05);
}

export const GRANADA_VOICES = {
  granCry_water: cryOf('water', 150), granCry_bread: cryOf('bread', 285), granCry_mule: cryOf('mule', 135),

  /** A basin's jet in a court (the Lions' fountain, the Myrtles' ends, the Partal's pool): a bright hiss with single drops. */
  granFountain(t, bus, lv) {
    const dur = 6 + R() * 3;
    fall(this, t, bus, lv, dur, 2300, 0.022);
    for (let k = 0, m = 5 + Math.floor(R() * 5); k < m; k++) this.cue(t + 0.3 + R() * (dur - 0.6), (x) => this.tone(x, [[0, 950 + R() * 700], [0.05, 1900 + R() * 800]], 0.07, 0.012 * lv, bus, 'sine'));
    return dur;
  },
  /** Water running in a channel (the Acequia Real, the Lions' channels, the Generalife's long canal): a soft low rush with small falls, steady. */
  granChannel(t, bus, lv) {
    const dur = 7 + R() * 4;
    fall(this, t, bus, lv, dur, 750, 0.02);
    for (let k = 0, m = 8 + Math.floor(R() * 6); k < m; k++) this.cue(t + R() * dur, (x) => this.tone(x, [[0, 400 + R() * 260], [0.12, 580 + R() * 300]], 0.1, 0.014 * lv, bus, 'sine', ['lowpass', 1400]));
    return dur;
  },
  /** The Darro over its stones in the ravine: a broader, lower roar than a channel, with the knock of pebbles moved by the current. */
  granDarro(t, bus, lv) {
    const dur = 8 + R() * 4;
    fall(this, t, bus, lv, dur, 520, 0.026);
    fall(this, t, bus, lv * 0.6, dur, 1500, 0.012);
    for (let k = 0, m = 4 + Math.floor(R() * 5); k < m; k++) this.cue(t + R() * dur, (x) => this.knock(x, 300 + R() * 200, 0.012 * lv, bus, 0.06));
    return dur;
  },
  /** A waterwheel (noria) turning on the river: a slow wooden creak with each paddle's splash, and the pour from the pots at the top. */
  granWheel(t, bus, lv) {
    const n = 6 + Math.floor(R() * 4), P = 1.5 + R() * 0.3;
    for (let k = 0; k < n; k++) this.cue(t + k * P, (x) => {
      this.tone(x, [[0, 150 + R() * 40], [0.5, 190 + R() * 30], [1.0, 140]], 1.1, 0.012 * lv, bus, 'sawtooth', ['lowpass', 380]);
      this.burst(x + 0.4, 0.5, 900, 0.8, 0.02 * lv, bus, 0.05);
    });
    return n * P + 0.5;
  },
  /** A coppersmith beating a pan on the stake: rounds of quick hollow taps with the bright ring of the rim, a pause, another round. */
  granCopper(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 2), f0 = 760 + R() * 340;
    for (let r = 0; r < rounds; r++) {
      const n = 10 + Math.floor(R() * 12), P = 0.14 + R() * 0.04;
      for (let i = 0; i < n; i++) {
        const a = i % 4 === 0 ? 1 : 0.55, f = f0 * (1 + 0.1 * (i % 3));
        this.cue(w + i * P, (x) => { this.struck(x, f, 0.04 * lv * a, bus, [[1, 1, 0.14], [2.76, 0.5, 0.09], [5.4, 0.25, 0.05]]); this.burst(x, 0.012, 2600, 1, 0.02 * lv * a, bus); });
      }
      w += n * P + 0.7 + R() * 1.2;
    }
    return w - t;
  },
  /** The baker's oven: the scrape of the peel on the brick, a thud of loaves set down, the crackle of the fire when the mouth is opened. */
  granOven(t, bus, lv) {
    this.rasp(t, 0.5, 1100, 0.8, 0.03 * lv, bus, 30, 0.7);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 0.6 + k * 0.32, (x) => this.knock(x, 170, 0.04 * lv, bus, 0.08));
    for (let k = 0; k < 14; k++) this.cue(t + 1.4 + R() * 1.6, (x) => this.burst(x, 0.015, 2800 + R() * 1500, 1, 0.015 * lv, bus));
    return 3.4;
  },
  /** The smith's bellows at the forge: three slow breaths of air through the charcoal, then the ring of a tool set on the anvil. */
  granBellows(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 1.4, (x) => this.burst(x, 0.7, 450, 0.6, 0.025 * lv, bus, 0.25));
    this.cue(t + 4.5, (x) => this.struck(x, 1400, 0.02 * lv, bus, [[1, 1, 0.3], [2.4, 0.4, 0.2]]));
    return 5.5;
  },
  /** The mule string on the slope: a tin bell at each beast's neck and the clip of iron on cobbles, a walker's pace, now and then the muleteer's call. */
  granMules(t, bus, lv) {
    const n = 9 + Math.floor(R() * 6), P = 0.55;
    for (let k = 0; k < n; k++) this.cue(t + k * P, (x) => {
      this.struck(x, 780 * (0.98 + R() * 0.04), 0.016 * lv, bus, [[1, 1, 0.25], [2.5, 0.4, 0.15]]);
      this.burst(x + 0.02, 0.03, 1900, 1.2, 0.03 * lv, bus); this.burst(x + P / 2, 0.03, 1700, 1.2, 0.02 * lv, bus);
    });
    return n * P + 0.5;
  },
  /** Doves and pigeons on the roofs and towers: the low rolling coo of several birds out of step, a clatter of wings. */
  granDoves(t, bus, lv) {
    const dur = 5 + R() * 4;
    for (let b = 0; b < 4; b++) for (let k = 0, m = 2 + Math.floor(R() * 3); k < m; k++) {
      const x = t + R() * (dur - 1.2), f = 440 + R() * 90;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.1, f * 0.9]], 0.16, 0.022 * lv, bus, 'triangle', ['lowpass', 900]); this.tone(y + 0.2, [[0, f * 1.06], [0.14, f * 0.82]], 0.3, 0.026 * lv, bus, 'triangle', ['lowpass', 900]); });
    }
    if (R() < 0.5) { const x = t + R() * dur; for (let k = 0; k < 8; k++) this.cue(x + k * 0.06, (y) => this.burst(y, 0.05, 2300, 1.1, 0.02 * lv * (1 - k / 10), bus)); }
    return dur + 1;
  },
  /** Swifts screaming round the towers: shrill, rising "sreee" calls from a party of birds, overlapping, passing across the sky. */
  granSwifts(t, bus, lv) {
    const doy = this.seasonDoy?.() ?? 150;
    if (doy < 100 || doy > 235) return 0.6;       // they are in Africa from autumn to April
    const n = 8 + Math.floor(R() * 6), dur = 4 + R() * 3;
    for (let k = 0; k < n; k++) {
      const x = t + R() * dur, f = 3300 + R() * 900, len = 0.4 + R() * 0.3;
      this.cue(x, (y) => this.tone(y, [[0, f], [len * 0.7, f * 1.25], [len, f * 1.1]], len, 0.012 * lv, bus, 'sawtooth', ['bandpass', 4200]));
    }
    return dur + 1;
  },
  /** The añafil and the atabales at the Alcazaba at dawn and dusk (the guard's signal): a pair of kettledrums beating a slow pattern and two long notes of a straight trumpet over them. */
  granAnafil(t, bus, lv) {
    const pat = [1, 0.5, 0.7, 0.5], P = 0.5 + R() * 0.04, bars = 6 + Math.floor(R() * 3), dur = bars * 4 * P;
    for (let b = 0; b < bars; b++) for (let k = 0; k < 4; k++) {
      const a = pat[k] * (0.55 + 0.45 * Math.sin(Math.PI * (b + 0.5) / bars)), x = t + (b * 4 + k) * P, hi = k % 2 === 1;
      this.cue(x, (y) => { this.tone(y, [[0, hi ? 160 : 100], [0.2, hi ? 120 : 70]], 0.36, 0.06 * lv * a, bus, 'sine'); this.burst(y, 0.07, hi ? 1500 : 800, 1.2, 0.02 * lv * a, bus); });
    }
    const f0 = 233 * (0.97 + R() * 0.06), ctx = this.ctx;
    for (const [at, len] of [[0.1, 0.3], [0.5, 0.35]]) {
      const x = t + at * dur, d = len * dur, o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 0.98, x); o.frequency.linearRampToValueAtTime(f0, x + 0.3);
      lp.type = 'lowpass'; lp.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, x); g.gain.exponentialRampToValueAtTime(0.04 * lv, x + d * 0.25); g.gain.setValueAtTime(0.04 * lv, x + d * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, x + d);
      o.connect(lp); lp.connect(g); g.connect(bus); o.start(x); o.stop(x + d + 0.05);
    }
    return dur + 1;
  },
  /** The bath: water poured from a bucket onto stone, drips falling in the vaulted room, a murmur of men's voices with a long echo. */
  granBath(t, bus, lv) {
    this.rasp(t, 1.2, 1400, 0.7, 0.025 * lv, bus, 12, 0.5);
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + 0.4 + R() * 5, (x) => this.drip(x, 0.9 * lv, bus));
    return 6.5;
  },
  /** A loom's clack in the weaver's room: the beater, the shuttle thrown; the shed changed with a knock. */
  granLoom(t, bus, lv) {
    const n = 6 + Math.floor(R() * 6);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.9, (x) => { this.knock(x, 520, 0.03 * lv, bus, 0.05); this.knock(x + 0.18, 260, 0.04 * lv, bus, 0.08); });
    return n * 0.9 + 0.3;
  },
};
/** Levels of the voices (relative to their own scale), set by measuring renders (tools/sound-render.mjs). */
export const GRANADA_GAIN = { granCry_water: 1.0, granCry_bread: 1.0, granCry_mule: 1.0, granFountain: 1.0, granChannel: 1.0, granDarro: 1.0, granWheel: 0.9, granCopper: 1.0, granOven: 1.3, granBellows: 1.5, granMules: 0.7, granDoves: 0.5, granSwifts: 1.0, granAnafil: 0.4, granBath: 1.5, granLoom: 1.0 };
addVoices('voices-granada.js', GRANADA_VOICES, GRANADA_GAIN);
