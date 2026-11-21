// The placed voices of a Balinese temple village about 1900 (docs/settlements/bali-village.md §13.3; src/settlements/bali-village/soundmap.js says where each is made and
// when). Added to the engine's VOICES from here (addVoices), every name prefixed `bal`; the engine's own voices that suit (the loom, the smith's hammer, the chisel, the
// kitchen's pots, the potter's wheel, the split bamboo, the broom, cicadas, frogs and birds) are used by the map as they are. All synthesised, no samples. [inferred
// throughout: no recording of Bali in 1900 exists. Stated in outline only: a Balinese gamelan is tuned in PAIRS, one instrument of each pair a little sharp of the other,
// so that the two beat against each other ("ombak", the wave) and the sound shimmers; the metallophones play in interlocking figures (kotekan); the gong ageng closes
// the phrase; the kulkul is a hollow log struck for calls and alarms [Wikipedia "Gamelan"; "Balinese architecture", §3, §8]. The five-note mode's pitches, the patterns,
// the bells and the crowd are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** A five-note pelog-like mode (semitones from the tonic, uneven steps) and a note of it by degree. */
const MODE = [0, 1.15, 3.4, 7.1, 8.2];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 5) * 12 + MODE[((deg % 5) + 5) % 5]) / 12);
/** The sellers' calls of the market (wordless): [semitones, seconds, vowel]. */
export const BAL_CRIES = {
  fruit: [[0, 0.3, 'a'], [3, 0.35, 'o'], [1, 0.9, 'a']],
  rice: [[2, 0.3, 'e'], [0, 0.3, 'a'], [-3, 1.0, 'o']],
  cake: [[4, 0.3, 'o'], [1, 0.4, 'a'], [0, 0.8, 'o']],
};

/** One key of a gangsa pair: the pengumbang and the pengisep a few Hz apart, so that the two beat (the wave). */
function key(m, x, f, lvl, bus, dec = 1.3) {
  const d = 3 + R() * 2;
  m.struck(x, f - d / 2, lvl, bus, [[1, 1, dec], [2.72, 0.3, dec * 0.6], [5.3, 0.1, dec * 0.3]]);
  m.struck(x, f + d / 2, lvl * 0.9, bus, [[1, 1, dec], [2.72, 0.3, dec * 0.6]]);
}

export const BALI_VOICES = {
  /** The banjar's gamelan: a slow melody on the jegogan (low keys) with a pair of gangsa players interlocking over it (each takes the beats the other leaves), the cymbals chattering,
   *  a gong stroke to close the phrase. */
  balGamelan(t, bus, lv) {
    const tonic = 294 * (0.98 + R() * 0.04), u = 0.17 + R() * 0.03, bars = 3 + Math.floor(R() * 3);
    let deg = 5 + Math.floor(R() * 5);
    const polos = [1, 0, 1, 1, 0, 1, 0, 1], sangsih = [0, 1, 0, 0, 1, 0, 1, 0];
    for (let b = 0; b < bars; b++) {
      deg = clamp(deg + pick([-2, -1, -1, 1, 1, 2, 0]), 3, 11);
      const t0 = t + b * 8 * u;
      this.cue(t0, (x) => key(this, x, note(deg - 5, tonic) * 0.5, 0.026 * lv, bus, 3.2));                      // the jegogan's low note on the beat
      for (let k = 0; k < 8; k++) {
        const at = t0 + k * u;
        if (polos[k]) this.cue(at, (x) => key(this, x, note(deg + (k % 4 === 3 ? 1 : 0), tonic), 0.05 * lv, bus));
        if (sangsih[k]) this.cue(at, (x) => key(this, x, note(deg + (k % 4 === 1 ? 1 : -1), tonic) * 1.0, 0.046 * lv, bus));
        if (k % 2 === 1) this.cue(at, (x) => this.burst(x, 0.05, 6200, 1.8, 0.012 * lv, bus));              // the ceng-ceng
      }
    }
    const end = t + bars * 8 * u;
    this.cue(end, (x) => this.struck(x, 61 - 1.2, 0.035 * lv, bus, [[1, 1, 7], [1.01, 0.8, 6], [2.0, 0.5, 5], [2.97, 0.25, 3.2], [4.2, 0.12, 1.8]]));
    return end - t + 7.5;
  },
  /** The gong ageng alone: one deep stroke, or three in the slow call of the pavilion, the sound swelling and sinking with its beat. */
  balGong(t, bus, lv) {
    const n = R() < 0.6 ? 1 : 3, f = 58 * (0.97 + R() * 0.06);
    for (let k = 0; k < n; k++) this.cue(t + k * (4.2 + R()), (x) => { this.burst(x, 0.06, 800, 1, 0.03 * lv, bus); this.struck(x, f, 0.08 * lv, bus, [[1, 1, 7.5], [1.012, 0.85, 6.5], [2.01, 0.5, 5], [2.96, 0.3, 3.5], [4.3, 0.16, 2]]); });
    return n * 5 + 6;
  },
  /** The kulkul: a hollow log of the tower struck with a mallet — a call to the banjar: a slow opening, a run that quickens, two last strokes. */
  balKulkul(t, bus, lv) {
    const f = 230 * (0.95 + R() * 0.1), n = 9 + Math.floor(R() * 6);
    let w = t, g = 0.62;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, f, 0.09 * lv, bus, 0.22); this.knock(x + 0.012, f * 1.52, 0.04 * lv, bus, 0.1); });
      g = Math.max(0.2, g * 0.9); w += g;
    }
    w += 0.7;
    for (let k = 0; k < 2; k++) { this.cue(w + k * 0.55, (x) => { this.knock(x, f * 0.96, 0.1 * lv, bus, 0.25); this.knock(x + 0.012, f * 1.5, 0.045 * lv, bus, 0.1); }); }
    return w - t + 2.5;
  },
  /** The kulkul's alarm (titir): a fast unbroken roll of the log, for a fire or a thief, a long half-minute. */
  balKulkulAlarm(t, bus, lv) {
    const f = 240 * (0.95 + R() * 0.1), n = 70 + Math.floor(R() * 30);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.14, (x) => this.knock(x, f * (k % 2 ? 1 : 1.05), 0.07 * lv, bus, 0.15));
    return n * 0.14 + 2;
  },
  /** A priest's hand bell (genta) rung in the offering, and his low chant under it: the bell in runs, the chant a drone with a slow turn. */
  balGenta(t, bus, lv) {
    const f = 1650 * (0.97 + R() * 0.06), n = 10 + Math.floor(R() * 12), f0 = 118 * (0.97 + R() * 0.06);
    this.cry(t + 0.3, f0, [[0, 3.0, 'o'], [-2, 2.4, 'u'], [0, 3.4, 'o']], 0.045 * lv, bus, { cutoff: 1500 });
    let w = t + 1.0, g = 0.4;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.struck(x, f, 0.02 * lv, bus, [[1, 1, 2.2], [2.31, 0.5, 1.4], [4.4, 0.2, 0.6]])); g = Math.max(0.15, g * 0.94 + R() * 0.04); w += g; }
    return Math.max(w - t, 9) + 2;
  },
  /** Men round the cockpit: a rising murmur of calls and bets, wordless, a roar when the birds meet, then the groan. */
  balCrowd(t, bus, lv) {
    const n = 8 + Math.floor(R() * 6), d = 7 + R() * 4;
    this.rasp(t, d, 700, 0.7, 0.03 * lv, bus, 6, 0.5);
    for (let k = 0; k < n; k++) {
      const at = t + 0.3 + R() * (d - 0.8), f0 = 128 * (0.8 + R() * 0.5) * (R() < 0.3 ? 1.5 : 1);
      this.cue(at, (x) => this.cry(x, f0, [[0, 0.22, pick(['a', 'o', 'e'])], [pick([2, 3, -2]), 0.4, pick(['a', 'o'])]], 0.045 * lv, bus, { cutoff: 2600 }));
    }
    this.cue(t + d * 0.7, (x) => this.rasp(x, 1.8, 900, 0.8, 0.045 * lv, bus, 9, 0.5));
    return d + 2;
  },
  /** Rice pounded in the long trough (lesung) by several women, the pestles falling in turn in an interlocking pattern, the trough's ends ringing. */
  balLesung(t, bus, lv) {
    const u = 0.22 + R() * 0.03, bars = 4 + Math.floor(R() * 4), A = [1, 0, 1, 0, 1, 1, 0, 0], B = [0, 1, 0, 1, 0, 0, 1, 1];
    for (let b = 0; b < bars; b++) for (let k = 0; k < 8; k++) {
      const at = t + (b * 8 + k) * u;
      if (A[k]) this.cue(at, (x) => this.knock(x, 175 + R() * 20, 0.06 * lv, bus, 0.13));
      if (B[k]) this.cue(at, (x) => this.knock(x, 270 + R() * 25, 0.045 * lv, bus, 0.09));
      if (k === 7 && b % 2) this.cue(at + 0.05, (x) => this.knock(x, 560, 0.02 * lv, bus, 0.05));
    }
    return bars * 8 * u + 1.5;
  },
  /** The tokay gecko in the thatch at night: a run of clicks, slowing, then the call, slowing. */
  balTokek(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 8; k++) { this.cue(w, (x) => this.knock(x, 1500 - k * 40, 0.02 * lv, bus, 0.03)); w += 0.07 + k * 0.016; }
    w += 0.4;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 760], [0.14, 700]], 0.17, 0.03 * lv, bus, 'square', ['bandpass', 1100, 2]));
      this.cue(w + 0.24, (x) => this.tone(x, [[0, 560], [0.22, 470]], 0.3, 0.03 * lv, bus, 'square', ['bandpass', 850, 2]));
      w += 1.1 + k * 0.16;
    }
    return w - t + 1;
  },
  /** The water of a pancuran: a bright continuous splash from the bamboo spouts into the trough, here and there a droplet, for a while. */
  balSpout(t, bus, lv) {
    const d = 7 + R() * 5;
    this.rasp(t, d, 2300 + R() * 300, 0.7, 0.02 * lv, bus, 17 + R() * 6, 0.85);
    this.rasp(t, d, 900, 0.9, 0.012 * lv, bus, 9, 0.7);
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + 0.5 + R() * (d - 1), (x) => this.knock(x, 1500 + R() * 600, 0.01 * lv, bus, 0.04));
    return d + 1;
  },
  /** The subak's water over a weir's lip or a bund: a low running trickle, long. */
  balTrickle(t, bus, lv) {
    const d = 9 + R() * 6;
    this.rasp(t, d, 1350 + R() * 300, 0.6, 0.016 * lv, bus, 11 + R() * 4, 0.9);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.knock(x, 1150 + R() * 400, 0.011 * lv, bus, 0.04));
    return d + 1;
  },
  /** The bird-scarers over the paddy: a cord is pulled and a line of bamboo clappers clatter, dying away. */
  balClatter(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t, g = 0.07;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.knock(x, 950 + R() * 500, 0.04 * lv, bus, 0.035)); g += 0.014 + R() * 0.02; w += g; }
    return w - t + 0.5;
  },
  /** A wooden bell on a buffalo's neck at the plough: hollow knocks at the irregular pace of its steps. */
  balBuffaloBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 7); k < n; k++) { this.cue(w, (x) => { this.knock(x, 400 + R() * 70, 0.04 * lv, bus, 0.1); this.knock(x + 0.07, 610, 0.017 * lv, bus, 0.06); }); w += 0.85 + R() * 1.2; }
    return w - t + 0.5;
  },
  /** Ducks in the flooded paddy: a run of hoarse quacks, a few of them answering. */
  balDuck(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) {
      const f = 520 * (0.85 + R() * 0.3);
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.1, f * 0.7]], 0.14, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 1.5]); this.burst(x, 0.1, 1500, 1, 0.006 * lv, bus); });
      w += 0.16 + R() * 0.35;
    }
    return w - t + 1;
  },
  /** A seller's cry in the market (wordless): fruit, rice or cakes, a few seconds. */
  balSeller(t, bus, lv) {
    const C = BAL_CRIES[pick(Object.keys(BAL_CRIES))], n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.cry(x, 300 * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem: true, cutoff: 4000 })); w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2; }
    return w - t;
  },
  /** A bamboo flute (suling) practising behind the gamelan: a breathy, wavering phrase on the mode. */
  balSuling(t, bus, lv) {
    const tonic = 588 * (0.98 + R() * 0.04), n = 7 + Math.floor(R() * 6);
    let w = t, deg = 4;
    for (let k = 0; k < n; k++) {
      deg = clamp(deg + pick([-2, -1, 0, 1, 1, 2]), 0, 9);
      const f = note(deg, tonic), d = 0.5 + R() * 0.9;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.97], [0.08, f], [d, f * 1.004]], d, 0.03 * lv, bus, 'triangle', ['bandpass', f * 1.4, 2.5]); this.burst(x, d, f * 2, 1.2, 0.004 * lv, bus, 0.05); });
      w += d + 0.06 + R() * 0.35;
    }
    return w - t + 1;
  },
  /** The baleganjur: the processional gamelan of a festival marching by — gongs on the beat, the pulse of the kempli, drums, cymbals chattering, passing along `f`'s track. */
  balBaleganjur(t, bus, lv, f) {
    const dur = f?.dur ?? 24, u = 0.2 + R() * 0.02, steps = Math.floor(dur / u);
    for (let k = 0; k < steps; k++) {
      const at = t + k * u;
      if (k % 32 === 0) this.cue(at, (x) => this.struck(x, 60, 0.03 * lv, bus, [[1, 1, 5], [1.012, 0.8, 4.4], [2.0, 0.4, 3], [2.95, 0.2, 1.8]]));
      if (k % 32 === 16) this.cue(at, (x) => this.struck(x, 88, 0.03 * lv, bus, [[1, 1, 3.2], [2.0, 0.4, 1.8]]));
      if (k % 4 === 0) this.cue(at, (x) => this.struck(x, 540, 0.03 * lv, bus, [[1, 1, 0.5], [2.4, 0.3, 0.3]]));
      if (k % 8 === 2 || k % 8 === 5 || k % 8 === 6) this.cue(at, (x) => this.knock(x, 170 + R() * 20, 0.06 * lv, bus, 0.14));
      if (k % 2 === 1 || k % 8 === 0) this.cue(at, (x) => this.burst(x, 0.05, 5800 + R() * 800, 1.8, 0.04 * lv, bus));
      if (k % 8 === 7) this.cue(at, (x) => this.knock(x, 520 + R() * 50, 0.03 * lv, bus, 0.05));
    }
    return dur + 6;
  },
  /** A bullock cart in the street: the axle's creak, the wheels' rumble on the earth, the beast's wooden bell, for as long as it takes to pass. */
  balCart(t, bus, lv, f) {
    const dur = f?.dur ?? 14;
    this.rasp(t, dur, 320, 0.8, 0.03 * lv, bus, 6, 0.8);
    this.rasp(t, dur, 1000, 1.6, 0.012 * lv, bus, 3.3, 0.9);
    for (let w = t; w < t + dur - 0.5; w += 0.9 + R() * 0.7) this.cue(w, (x) => this.knock(x, 410 + R() * 60, 0.03 * lv, bus, 0.09));
    return dur + 1;
  },
};
export const BALI_GAIN = {
  balGamelan: 1.0, balGong: 1.2, balKulkul: 1.4, balKulkulAlarm: 1.3, balGenta: 1.3, balCrowd: 1.3, balLesung: 1.5, balTokek: 1.6, balSpout: 1.4, balTrickle: 1.3,
  balClatter: 1.6, balBuffaloBell: 1.5, balDuck: 1.5, balSeller: 2.2, balSuling: 1.0, balBaleganjur: 1.2, balCart: 1.3,
};
addVoices('voices-bali.js', BALI_VOICES, BALI_GAIN);
