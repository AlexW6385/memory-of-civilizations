// The voices of Muscovy about 1600 (docs/settlements/muscovy.md §14), added to the placed voices of voices.js through addVoices: the bells of the
// Kremlin rung as the Orthodox rite rings them (the blagovest, the trezvon, the perebor), the znamenny chant, the sledge and the cart, the street
// cries, the gusli and frame drum of the skomorokhi, the axe, the stove, the watchman's clapper. Synthesised (noise, oscillators, struck partials), no samples.
// Every name carries the prefix `mos`. [inferred throughout: no recording of 1600 exists; the ringing kinds are from Wikipedia "Russian Orthodox bell
// ringing" (bells chimed, never swung; zazvonny, podzvonny, blagovestnik groups; blagovest = measured strokes on the great bell; trezvon = all bells in
// 3/4 or 4/4, three times, opened by three slow tolls and closed by three chords; perebor = the funeral toll, smallest to largest, then all).]
import { addVoices, inHours } from './voices.js';

const R = Math.random;
const mapOf = (m) => m.plc?.life?.map;
const winterNow = (m) => { const d = m.seasonDoy?.() ?? 125; return d > 320 || d < 80; };

/** The street cries (wordless): [semitones above the base, seconds, vowel]; `hours` local. [inferred: pies, kvass, spiced honey drink, milk] */
export const MOS_CRIES = {
  pies: { cry: [[0, 0.3, 'i'], [4, 0.3, 'o'], [7, 0.4, 'a'], [4, 0.9, 'i']], w: 1.0, hours: [8, 17] },
  kvass: { cry: [[2, 0.4, 'a'], [0, 0.3, 'a'], [-3, 1.0, 'o']], w: 1.0, hours: [10, 19], base: 140 },
  sbiten: { cry: [[0, 0.25, 'e'], [5, 0.3, 'e'], [9, 0.3, 'a'], [5, 0.9, 'o']], w: 0.8, hours: [6, 12] },
  milk: { cry: [[7, 0.3, 'o'], [4, 0.3, 'o'], [0, 1.0, 'u']], w: 0.7, hours: [5.5, 10] },
};
export function mosPickCry(hour, rnd = R()) {
  const l = Object.entries(MOS_CRIES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w : 0]), tot = l.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of l) if ((x -= w) <= 0 && w > 0) return k;
  return l.find(([, w]) => w > 0)[0];
}

export const MOS_VOICES = {
  /** The blagovest: three slow strokes on the great bell, then measured strokes (about 2.6 s apart). */
  mosBlagovest(t, bus, lv) {
    const n = 12, wf = winterNow(this) ? 1.15 : 1;
    for (let k = 0; k < n; k++) this.cue(t + (k < 3 ? k * 4.2 : 12.6 + (k - 3) * 2.7), (x) => this.strike(x, 92 * (1 + 0.003 * (k % 2)), 0.06 * lv * wf, bus, 1.8));
    return 12.6 + 9 * 2.7 + 4;
  },
  /** The trezvon: three slow tolls on the blagovestnik, then all three groups of bells in a four-beat, three rounds, closed by three chords. */
  mosTrezvon(t, bus, lv) {
    const wf = winterNow(this) ? 1.15 : 1;
    for (let k = 0; k < 3; k++) this.cue(t + k * 3.4, (x) => this.strike(x, 98, 0.06 * lv * wf, bus, 1.6));
    const w0 = t + 11, beat = 0.34;
    for (let round = 0; round < 3; round++) for (let k = 0; k < 16; k++) {
      const w = w0 + (round * 16 + k) * beat;
      this.cue(w, (x) => {
        if (k % 4 === 0) this.strike(x, 98, 0.045 * lv * wf, bus, 1.4);
        if (k % 2 === 0) this.strike(x, [294, 330, 392][(k >> 1) % 3], 0.03 * lv, bus, 0.7);
        this.strike(x + 0.04, [587, 659, 784, 880][(k + round) % 4], 0.016 * lv, bus, 0.35);
      });
    }
    const e = w0 + 48 * beat + 0.4;
    for (let c = 0; c < 3; c++) this.cue(e + c * 0.9, (x) => { for (const f of [98, 294, 392, 784]) this.strike(x, f, 0.04 * lv * wf, bus, 1.8); });
    return e + 8 - t;
  },
  /** The perebor: each bell once, smallest to largest, then all together. */
  mosPerebor(t, bus, lv) {
    const fs = [880, 740, 587, 440, 330, 247, 165, 110, 92];
    fs.forEach((f, k) => this.cue(t + k * 2.4, (x) => this.strike(x, f, 0.035 * lv, bus, 1.4)));
    this.cue(t + fs.length * 2.4 + 0.6, (x) => { for (const f of fs) this.strike(x, f, 0.03 * lv, bus, 2); });
    return fs.length * 2.4 + 8;
  },
  /** A small parish bell of the posad, rung in a quick run. */
  mosSmallBell(t, bus, lv) {
    const n = 14 + Math.floor(R() * 8), f = 520 + R() * 160;
    for (let k = 0; k < n; k++) this.cue(t + k * (0.5 + R() * 0.06), (x) => this.strike(x, f * (k % 3 ? 1 : 0.75), 0.016 * lv, bus, 0.6));
    return n * 0.55 + 2;
  },
  /** Jackdaws round the bell tower: short dry calls. */
  mosJackdaw(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.25 + R() * 0.2), (x) => this.tone(x, [[0, 2300 + R() * 400], [0.06, 1700]], 0.08, 0.01 * lv, bus, 'square', ['bandpass', 2000, 3]));
    return 2;
  },
  /** The znamenny chant: a unison line of men's voices in stepwise phrases over a held low note (ison), in the church. */
  mosChant(t, bus, lv) {
    const f0 = 98, phr = [[0, 1.6, 'o'], [2, 1.2, 'a'], [3, 1.4, 'o'], [2, 1.0, 'e'], [0, 2.4, 'o'], [-2, 1.4, 'u'], [0, 2.6, 'o'], [2, 1.2, 'a'], [0, 3.0, 'o']];
    const dur = phr.reduce((s, p) => s + p[1], 0) + 2;
    this.cry(t, f0, phr, 0.03 * lv, bus, { cutoff: 1800 });
    this.cue(t, (x) => this.tone(x, [[0, f0 / 2], [dur, f0 / 2]], dur, 0.012 * lv, bus, 'triangle', ['lowpass', 300]));
    return dur + 4;
  },
  /** A horse-drawn sledge passing: the runners' hiss (snow in winter, dry grit in summer), muffled hoofs, harness bells, the driver's word. */
  mosSledge(t, bus, lv, f) {
    const dur = f?.dur ?? 6, snow = winterNow(this), p = 0.5 + R() * 0.05;
    this.rasp(t, dur, snow ? 1800 : 900, snow ? 1.2 : 0.8, (snow ? 0.014 : 0.012) * lv, bus, snow ? 22 : 9, 0.5);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.05, snow ? 700 : 1500, 2, (snow ? 0.05 : 0.08) * lv, bus); if (snow || k % 2) this.struck(x + 0.02, 2400 + 300 * (k % 3), 0.003 * lv, bus, [[1, 1, 0.25], [1.6, 0.5, 0.15]]); });
    if (R() < 0.5) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.cry(x, 120, [[0, 0.3, 'o'], [3, 0.7, 'o']], 0.04 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** A two-wheeled cart on the log paving: the beat of the wheels over the logs, the axle's creak, iron-shod hoofs. */
  mosCart(t, bus, lv, f) {
    const dur = f?.dur ?? 6, p = 0.46;
    this.rasp(t, dur, 650, 1.5, 0.012 * lv, bus, 3, 0.8);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.knock(x, 150, 0.06 * lv, bus, 0.1); this.burst(x + 0.01, 0.04, 1700, 2, 0.07 * lv, bus); this.knock(x + 0.23, 140, 0.04 * lv, bus, 0.09); });
    return dur;
  },
  /** A pedlar's cry along a street (wordless). */
  mosCry(t, bus, lv, f, trade) {
    const T = MOS_CRIES[trade || mosPickCry(this.plc?.hourNow ?? 12) || 'pies'] || MOS_CRIES.pies, dur = f?.dur ?? 5;
    for (let k = 0, n = Math.max(1, Math.floor(dur / 3.2)); k < n; k++) this.cue(t + 0.3 + k * 3.2, (x) => this.cry(x, T.base ?? 170, T.cry, 0.05 * lv, bus, { cutoff: 3600 }));
    return dur;
  },
  /** The night watch: a wooden clapper beaten as he walks, now and then a low call. */
  mosWatch(t, bus, lv, f) {
    const dur = f?.dur ?? 8;
    for (let k = 0, n = Math.floor(dur / 0.7); k < n; k++) if (k % 5 !== 4) this.cue(t + k * 0.7, (x) => { this.knock(x, 1200, 0.03 * lv, bus, 0.05); this.knock(x + 0.11, 1000, 0.025 * lv, bus, 0.05); });
    if (R() < 0.6) this.cue(t + dur * 0.4, (x) => this.cry(x, 110, [[0, 0.5, 'a'], [-2, 1.1, 'o']], 0.05 * lv, bus, { cutoff: 2500 }));
    return dur;
  },
  /** A barge or boat on the Moskva: sweeps creaking in their pins, the blades' wash, a call. */
  mosBoat(t, bus, lv, f) {
    const dur = f?.dur ?? 12, T = 3.2;
    for (let k = 0, n = Math.floor(dur / T); k < n; k++) this.cue(t + k * T, (x) => { this.rasp(x, 0.9, 420, 3, 0.02 * lv, bus, 7, 0.9); this.burst(x + 0.8, 0.5, 1100, 0.7, 0.02 * lv, bus, 0.1); });
    if (R() < 0.5) this.cue(t + dur * 0.5, (x) => this.cry(x, 125, [[0, 0.4, 'o'], [5, 0.9, 'a'], [0, 0.8, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
  /** The skomorokhi: a gusli strummed in runs on a few notes of a mode, a frame drum under it. */
  mosGusli(t, bus, lv) {
    const root = 220, mode = [0, 2, 3, 5, 7, 8, 10, 12], dur = 18 + R() * 8;
    let w = t;
    while (w < t + dur) {
      const run = 3 + Math.floor(R() * 5);
      for (let k = 0; k < run; k++) { const f = root * Math.pow(2, mode[Math.floor(R() * mode.length)] / 12); this.cue(w + k * 0.14, (x) => this.struck(x, f, 0.014 * lv, bus, [[1, 1, 1.2], [2, 0.4, 0.7], [3, 0.2, 0.4]])); }
      w += run * 0.14 + 0.5 + R() * 0.9;
    }
    for (let k = 0; k * 0.62 < dur; k++) this.cue(t + k * 0.62, (x) => { this.knock(x, k % 2 ? 160 : 110, 0.05 * lv, bus, 0.12); if (k % 2) this.burst(x, 0.08, 4500, 1, 0.012 * lv, bus); });
    return dur + 1;
  },
  /** A carpenter's axe on a log: the blow and the chip. */
  mosAxe(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.55 + R() * 0.1), (x) => { this.knock(x, 260, 0.07 * lv, bus, 0.1); this.burst(x, 0.06, 900, 1.5, 0.05 * lv, bus); });
    return 4;
  },
  /** The stove: logs settling and the fire's small cracks. */
  mosStove(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) this.cue(t + R() * 3, (x) => this.burst(x, 0.03 + R() * 0.03, 2200 + R() * 1800, 3, 0.03 * lv, bus));
    this.rasp(t, 3, 500, 0.5, 0.006 * lv, bus, 11, 0.9);
    return 3.5;
  },
  /** A well-sweep (zhuravl): the long pole creaking, the bucket's splash. */
  mosSweep(t, bus, lv) {
    this.rasp(t, 2.2, 350, 4, 0.02 * lv, bus, 5, 0.9);
    this.cue(t + 2.2, (x) => { this.burst(x, 0.3, 800, 0.8, 0.03 * lv, bus); this.drip(x + 0.4, lv * 0.6, bus); });
    return 3.5;
  },
};
addVoices('voices-muscovy.js', MOS_VOICES, { mosBlagovest: 1, mosTrezvon: 1, mosChant: 1, mosSledge: 1 });
void mapOf;
