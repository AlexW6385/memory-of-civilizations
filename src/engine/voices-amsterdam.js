// The voices of Amsterdam about 1670 (docs/settlements/amsterdam.md §10.3), added to the placed voices of voices.js through addVoices: the Dam, the canals, the
// Weigh House, the fish market, the quays of the IJ and the shops that stood open, in the same synthesised terms (noise, oscillators, formant filters, struck
// partials; no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music, scheduled from the fixed emitters and the passing tracks of the map
// (src/settlements/amsterdam/soundmap.js); the tracks' voices get the moving path as a fourth argument. Every name carries the prefix `am`.
// [inferred throughout: no recording of 1670 exists. What a source gives is marked [stated] in the dossier; every melody here is ours and no word is sung.]

import { addVoices, inHours } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** The cries of the streets: [semitones above the voice's base, seconds, vowel], wordless; `hours` as local clock hours. */
export const AM_CRIES = {
  milk: { cry: [[5, 0.3, 'o'], [2, 0.25, 'e'], [0, 0.9, 'o']], fem: true, w: 1.0, hours: [5.5, 10], base: 280 },                      // the milk-woman with her yoke and pails
  fish: { cry: [[9, 0.2, 'e'], [12, 0.3, 'a'], [9, 0.25, 'e'], [4, 0.8, 'a']], fem: true, w: 1.1, hours: [6, 14], base: 310 },          // the fishwife: high, quick, a fall
  turf: { cry: [[0, 0.4, 'o'], [4, 0.3, 'o'], [0, 0.4, 'o'], [-3, 0.9, 'u']], fem: false, w: 0.9, hours: [7, 16], base: 125 },          // the peat-seller from his boat
  sand: { cry: [[2, 0.3, 'a'], [5, 0.3, 'a'], [2, 0.3, 'a'], [-2, 0.8, 'o']], fem: false, w: 0.8, hours: [8, 16], base: 150 },          // scouring sand for the scrubbed floors
  clothes: { cry: [[0, 0.5, 'o'], [3, 0.3, 'e'], [-2, 0.8, 'o'], [0, 0.5, 'a']], fem: false, w: 0.7, hours: [9, 17], base: 120 },       // old clothes
};
export function pickCry(hour, rnd = R()) {
  const list = Object.entries(AM_CRIES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

export const AMSTERDAM_VOICES = {
  // ── the passing ──────────────────────────────────────────────────────────────
  /** A rowing boat or a peat barge on the canal: the oars knocking in their pins, the water at the bow. */
  amPraam(t, bus, lv, f) {
    const dur = f?.dur ?? 12, p = 1.5 + R() * 0.3;
    this.rasp(t, dur, 900, 0.5, 0.006 * lv, bus, 3.4, 0.9);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.knock(x, 330 + R() * 40, 0.02 * lv, bus, 0.06); this.cue(x + 0.5, (y) => this.drip(y, lv * 0.4, bus)); });
    return dur;
  },
  /** A sledge on the cobbles behind a walking horse (carts were forbidden on the quays; goods went on sledges [stated, dossier]): runners scraping, slow hoofs, a carter's word. */
  amSledge(t, bus, lv, f) {
    const dur = f?.dur ?? 9, p = 0.62 + R() * 0.05;
    this.rasp(t, dur, 520, 0.6, 0.016 * lv, bus, 6.5, 0.8);
    this.rasp(t, dur, 1500, 0.9, 0.006 * lv, bus, 2.2, 0.9);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.05, 1500, 2.2, 0.07 * lv, bus); this.tone(x, [[0, 520], [0.06, 430]], 0.09, 0.012 * lv, bus, 'triangle'); });
    if (R() < 0.4) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.cry(x, 130, [[0, 0.3, 'o'], [3, 0.5, 'a']], 0.035 * lv, bus, { cutoff: 3400 }));
    return dur;
  },
  /** A seller's cries as he or she walks the quay. */
  amCry(t, bus, lv, f) {
    const hour = this.plc.hourNow ?? 12, k = pickCry(hour);
    if (!k) return 0.1;
    const T = AM_CRIES[k], dur = f?.dur ?? 20, gap = 8 + R() * 4;
    for (let w = t + 0.05; w < t + dur - 3; w += gap + R() * 3) { const f0 = T.base * (0.93 + R() * 0.14); this.cue(w, (x) => this.cry(x, f0, T.cry, 0.05 * lv, bus, { fem: T.fem, cutoff: 4200 })); }
    return dur;
  },
  /** The rattle-watch at night [inferred: the night watch walked the streets with a rattle]: a slow tread and now and then the wooden rattle whirled. */
  amRattle(t, bus, lv, f) {
    const dur = f?.dur ?? 15;
    for (let k = 0, n = Math.floor(dur / 0.95); k < n; k++) this.cue(t + k * 0.95, (x) => this.knock(x, 150, 0.02 * lv, bus, 0.07));
    for (let w = t + 3 + R() * 4; w < t + dur - 2; w += 6 + R() * 5) this.cue(w, (x) => { for (let q = 0; q < 14; q++) this.burst(x + q * 0.045, 0.02, 2600 + R() * 600, 2, 0.02 * lv, bus); });
    return dur;
  },

  // ── places ───────────────────────────────────────────────────────────────────
  /** The Weigh House: iron weights set on the pans, the beam's chain, a clerk's call. */
  amWeigh(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.5 + R() * 0.3), (x) => this.struck(x, 1900 + R() * 400, 0.016 * lv, bus, [[1, 1, 0.2], [2.7, 0.5, 0.12]]));
    this.rasp(t + 0.2, 1.4, 3000, 0.9, 0.01 * lv, bus, 26, 0.6);
    this.cue(t + 2.4, (x) => this.cry(x, 150, [[0, 0.3, 'o'], [4, 0.4, 'a'], [0, 0.6, 'o']], 0.035 * lv, bus, { cutoff: 3200 }));
    return 4;
  },
  /** A treadwheel crane at a warehouse's gable: the wheel's creak, the beam's clack, a chain paying out. */
  amCrane(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 260, 0.9, 0.012 * lv, bus, 2.2, 0.6);
    this.rasp(t, dur, 1100, 1.3, 0.005 * lv, bus, 1.7, 0.8);
    for (let k = 0, n = Math.floor(dur / 0.8); k < n; k++) this.cue(t + k * 0.8, (x) => this.knock(x, 120, 0.02 * lv, bus, 0.1));
    this.rasp(t + dur * 0.5, 2.0, 3400, 1.2, 0.006 * lv, bus, 40, 0.6);
    return dur;
  },
  /** Caulkers at a hull in the IJ's yards: mallet on iron in a run, then on the planking. */
  amCaulk(t, bus, lv) {
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) this.cue(t + k * (0.26 + R() * 0.06), (x) => { this.knock(x, 700 + R() * 90, 0.025 * lv, bus, 0.04); if (k % 3 === 2) this.knock(x + 0.1, 190, 0.02 * lv, bus, 0.1); });
    return 4;
  },
  /** The fish market: fishwives crying over each other, a bench's knock, gulls kept by the engine. */
  amFishMarket(t, bus, lv) {
    const dur = 6;
    this.rasp(t, dur, 700, 0.6, 0.012 * lv, bus, 3, 0.7);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * (dur - 2), (x) => this.cry(x, 300 * (0.9 + R() * 0.2), AM_CRIES.fish.cry, 0.04 * lv, bus, { fem: true, cutoff: 4200 }));
    this.cue(t + 1 + R() * 3, (x) => this.knock(x, 250, 0.03 * lv, bus, 0.08));
    return dur;
  },
  /** A lute played on the Dam: a few plucked courses, slow, in a mode of D. */
  amLute(t, bus, lv) {
    const mode = [62, 65, 67, 69, 72, 74], n = 7 + Math.floor(R() * 6);
    let w = t;
    for (let k = 0; k < n; k++) { const m = mode[Math.floor(R() * mode.length)]; this.cue(w, (x) => this.tone(x, [[0, mtof(m)]], 0.9, 0.02 * lv, bus, 'triangle', ['lowpass', 2600])); w += 0.35 + R() * 0.45; }
    return w - t + 1;
  },
  /** A bell of the Nieuwe Kerk tolled before the sermon: a slow stroke, six times. */
  amKerkBell(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * 2.8, (x) => this.strike(x, mtof(52), 0.05 * lv, bus, 1.4));
    return 6 * 2.8 + 2;
  },
  /** The tavern: the room's murmur, a pot set down, now and then a laugh. */
  amTavern(t, bus, lv) {
    const dur = 4 + R() * 3;
    this.rasp(t, dur, 520 + R() * 200, 0.7, 0.024 * lv, bus, 4.5, 0.8);
    this.rasp(t, dur, 1100, 0.9, 0.01 * lv, bus, 6.1, 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * dur, (x) => this.struck(x, 1800 + R() * 400, 0.008 * lv, bus, [[1, 1, 0.12], [2.4, 0.4, 0.06]]));
    if (R() < 0.35) this.cue(t + R() * dur, (x) => this.cry(x, 150 + R() * 40, [[0, 0.12, 'a'], [2, 0.12, 'a'], [0, 0.12, 'a'], [-2, 0.2, 'a']], 0.025 * lv, bus, { cutoff: 2600 }));
    return dur;
  },

  // ── trades at work, heard from the open shops ───────────────────────────────
  amTray(t, bus, lv) { this.rasp(t, 0.6, 700, 0.8, 0.025 * lv, bus, 12, 0.8); this.knock(t + 0.6, 340, 0.04 * lv, bus, 0.08); return 1.2; },
  amCheese(t, bus, lv) { this.knock(t, 140, 0.05 * lv, bus, 0.12); this.rasp(t + 0.3, 0.5, 2000, 0.8, 0.01 * lv, bus, 14, 0.8); return 1; },
  amShears(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.3, (x) => this.burst(x, 0.09, 4400, 2, 0.016 * lv, bus));
    this.rasp(t + 1, 0.5, 1700, 0.6, 0.012 * lv, bus, 18, 0.9);
    return 1.8;
  },
  amScale(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 2200, 0.01 * lv, bus, [[1, 1, 0.2], [2.7, 0.5, 0.12]]); this.struck(x + 0.14, 2050, 0.008 * lv, bus, [[1, 1, 0.18]]); });
    this.rasp(t + 0.5, 0.4, 2500, 0.8, 0.012 * lv, bus, 22, 0.8);
    return 1.5;
  },
  amPlates(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * 0.25, (x) => this.struck(x, 3200 + R() * 700, 0.01 * lv, bus, [[1, 1, 0.1], [2.3, 0.5, 0.07]]));
    return 1.4;
  },
  amPipe(t, bus, lv) { this.knock(t, 420, 0.02 * lv, bus, 0.05); this.rasp(t + 0.3, 0.6, 1500, 0.6, 0.006 * lv, bus, 8, 0.9); return 1.2; },
  amHammer(t, bus, lv) {
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + k * (0.24 + R() * 0.12), (x) => this.knock(x, 780 + R() * 120, 0.03 * lv, bus, 0.05));
    return 2;
  },
  amCrate(t, bus, lv) { this.knock(t, 260, 0.04 * lv, bus, 0.1); this.rasp(t + 0.1, 0.5, 2200, 0.6, 0.012 * lv, bus, 16, 0.9); return 1; },
};
addVoices('voices-amsterdam.js', AMSTERDAM_VOICES, { amKerkBell: 0.5, amTavern: 1.2, amCry: 1.2 });
