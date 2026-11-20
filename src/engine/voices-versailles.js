// The voices of Versailles about 1690 (docs/settlements/versailles.md §11.4), added to the placed voices of voices.js through addVoices: the water of the
// fountains and the urns of the parterre, the gardeners' rakes and hoes, the sculptors' mallets, the joiners' planes, the fontainiers' cocks, the stables
// (hooves, a farrier's hammer, a whinny), the iron-shod coaches on the stones, the Cent-Suisses' drum and fife at the gate, the violins of the apartment
// evenings, the royal Mass, the gondoliers on the Grand Canal, the cries of the streets, the watch, the shops' work. The same synthesised terms as voices.js
// (noise, oscillators, formant filters, struck partials; no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music; the moving ones take
// the track `f` as a fourth argument. Every name starts with `ver` (a duplicate throws: addVoices). [inferred throughout: no recording of 1690 exists; the
// sources of what sounded and when are in the dossier §11.4.]

import { addVoices } from './voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

/** The cries of the streets of the town: [semitones above the voice's base, seconds, vowel], wordless; hours as local clock hours (the Paris cries, the trades inferred). */
export const CRIES = {
  water: { cry: [[0, 0.3, 'o'], [-3, 0.9, 'o'], [0, 0.3, 'o'], [-5, 1.1, 'u']], fem: false, w: 1.0, hours: [6, 18], base: 150 },       // the water-carrier's "à l'eau"
  clothes: { cry: [[2, 0.3, 'e'], [2, 0.3, 'e'], [7, 0.5, 'a'], [4, 0.4, 'a'], [0, 1.0, 'o']], fem: false, w: 0.8, hours: [8, 17.5] },   // old clothes and old lace
  greens: { cry: [[7, 0.2, 'e'], [9, 0.2, 'e'], [12, 0.5, 'o'], [9, 0.3, 'o'], [4, 0.8, 'a']], fem: true, w: 1.1, hours: [6, 12] },     // the greens-woman
  fish: { cry: [[10, 0.25, 'a'], [7, 0.25, 'a'], [3, 0.3, 'e'], [0, 1.0, 'o']], fem: false, w: 0.8, hours: [6, 13] },               // a fall from high to low
  milk: { cry: [[0, 0.4, 'a'], [5, 0.4, 'e'], [3, 1.0, 'u']], fem: true, w: 0.8, hours: [6, 10] },
  rabbit: { cry: [[4, 0.3, 'o'], [7, 0.3, 'o'], [4, 0.3, 'o'], [0, 1.0, 'a']], fem: false, w: 0.6, hours: [9, 17] },                // skins of rabbits bought at the door
};
/** The hour's cry (a key of CRIES) or null. */
export function pickCry(hour, rnd = R()) {
  const list = Object.entries(CRIES).map(([k, T]) => [k, (T.hours[0] <= T.hours[1] ? hour >= T.hours[0] && hour < T.hours[1] : hour >= T.hours[0] || hour < T.hours[1]) ? T.w : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (!(tot > 0)) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if (w > 0 && (x -= w) <= 0) return k;
  return list.find(([, w]) => w > 0)[0];
}
/** A minuet's lines in D major (Lully's court dances: the scale degrees of a violin and its bass over two bars of three beats); a few phrases to choose from. */
export const MINUET = [
  { v: [7, 9, 7, 5, 4, 2], b: [0, -3] },
  { v: [4, 5, 7, 9, 7, 5], b: [-3, 0] },
  { v: [9, 11, 9, 7, 5, 7], b: [-5, -3] },
  { v: [7, 5, 4, 2, 4, 0], b: [-5, 0] },
];
const DEG = [0, 2, 4, 5, 7, 9, 11];
const semi = (d) => Math.floor(d / 7) * 12 + DEG[((d % 7) + 7) % 7];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const VERSAILLES_VOICES = {
  // ── water ───────────────────────────────────────────────────────────────────
  /** A great fountain at play: the falling water's broad hush with a slap and drip of the basin, twelve seconds at a time (the map schedules it from its end). */
  verFountain(t, bus, lv) {
    const dur = 11 + R() * 3;
    this.rasp(t, dur, 1500 + R() * 400, 0.35, 0.05 * lv, bus, 17, 0.5);
    this.rasp(t, dur, 520, 0.5, 0.045 * lv, bus, 6, 0.35);
    this.rasp(t + 0.3, dur - 0.6, 4200, 0.7, 0.012 * lv, bus, 29, 0.6);
    for (let k = 0; k < 5; k++) this.cue(t + 1 + R() * (dur - 2), (w) => { this.drip(w, lv * 0.7, bus); });
    return dur;
  },
  /** A bronze urn pouring into a basin: a thin stream's hiss and the water's chuckle where it lands, twelve seconds. */
  verUrn(t, bus, lv) {
    const dur = 8 + R() * 3;
    this.rasp(t, dur, 3000 + R() * 600, 0.9, 0.022 * lv, bus, 23, 0.55);
    this.rasp(t, dur, 780, 1.4, 0.018 * lv, bus, 9, 0.6);
    for (let k = 0; k < 6; k++) this.cue(t + R() * dur, (w) => this.drip(w, lv * 0.55, bus));
    return dur;
  },
  /** A fontainier opening a cock in the pipe-room: the iron's creak under the key, a gulp of water in the lead, then a steady rush. */
  verValve(t, bus, lv) {
    this.tone(t, [[0, 150], [0.55, 235]], 0.6, 0.03 * lv, bus, 'sawtooth', ['lowpass', 700, 1]);
    this.knock(t + 0.7, 210, 0.05 * lv, bus, 0.12);
    this.rasp(t + 0.75, 2.4, 900, 0.5, 0.04 * lv, bus, 14, 0.4);
    this.cue(t + 1.0, (w) => this.burst(w, 0.4, 340, 0.8, 0.04 * lv, bus, 0.05));
    return 3.4;
  },

  // ── the gardens' work ───────────────────────────────────────────────────────
  /** A gardener raking the gravel: long dry scrapes with a pause between, the tines catching on a stone now and then. */
  verRake(t, bus, lv) {
    const n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) { const d = 0.9 + R() * 0.5; this.rasp(w, d, 2600 + R() * 500, 1.1, 0.03 * lv, bus, 2.4, 0.7); if (R() < 0.3) this.knock(w + d * 0.5, 1600, 0.02 * lv, bus, 0.03); w += d + 0.5 + R() * 0.7; }
    return w - t;
  },
  /** A gardener hoeing the beds: the blade biting earth, the clod falling away. */
  verHoe(t, bus, lv) {
    const n = 4 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) { this.knock(w, 170 + R() * 40, 0.05 * lv, bus, 0.1); this.burst(w + 0.03, 0.18, 800, 0.8, 0.025 * lv, bus); w += 0.85 + R() * 0.4; }
    return w - t;
  },
  /** A sculptor's mallet on the chisel: quick strokes that ring on the stone and die; a breath between runs. */
  verChisel(t, bus, lv) {
    let w = t;
    const runs = 1 + Math.floor(R() * 2);
    for (let r = 0; r < runs; r++) { const n = 4 + Math.floor(R() * 6), f = 1700 + R() * 700; for (let k = 0; k < n; k++) { this.struck(w, f * (0.97 + R() * 0.06), 0.03 * lv, bus, [[1, 1, 0.09], [2.7, 0.45, 0.05], [5.1, 0.2, 0.03]]); this.burst(w, 0.025, 3400, 1.2, 0.025 * lv, bus); w += 0.17 + R() * 0.07; } w += 0.9 + R() * 1.2; }
    return w - t;
  },
  /** A joiner's plane: long shaving strokes, a saw between them. */
  verPlane(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 3; k++) { this.rasp(w, 0.7 + R() * 0.2, 2100, 1.6, 0.032 * lv, bus, 9, 0.5); w += 1.1 + R() * 0.6; }
    if (R() < 0.5) { this.rasp(w, 1.4, 1200, 1.0, 0.03 * lv, bus, 7, 0.8); w += 1.6; }
    return w - t;
  },

  // ── the stables, the coaches ────────────────────────────────────────────────
  /** The great stables: hooves stamping on the stone, a snort, a whinny now and then, a hand-pump's squeal at the trough. */
  verStable(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 3 + Math.floor(R() * 3); k++) { this.knock(w, 85 + R() * 25, 0.06 * lv, bus, 0.12); this.burst(w + 0.01, 0.06, 1500, 2, 0.02 * lv, bus); w += 0.35 + R() * 0.5; }
    this.burst(w, 0.4, 750, 0.6, 0.04 * lv, bus, 0.04); w += 0.6;
    if (R() < 0.35) { const f = 620 + R() * 160; this.tone(w, [[0, f], [0.22, f * 2.0], [0.7, f * 1.1]], 1.0, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1600, 1.2]); w += 1.1; }
    return w - t;
  },
  /** A farrier's hammer on the shoe: the ring of iron on iron, struck in runs of five to nine, a pause to look at the work. */
  verFarrier(t, bus, lv) {
    let w = t;
    const n = 5 + Math.floor(R() * 5), f = 820 + R() * 200;
    for (let k = 0; k < n; k++) { this.struck(w, f, 0.05 * lv, bus, [[1, 1, 0.22], [2.4, 0.5, 0.12], [4.1, 0.25, 0.06]]); w += 0.24 + (k % 3 === 2 ? 0.2 : 0) + R() * 0.04; }
    return w - t;
  },
  /** A coach (or a cart) passing along `f`: the iron-shod wheels grinding on the stones, the horses' hooves in a trot, the harness's jingle. */
  verCoach(t, bus, lv, f) {
    const dur = f.dur, trot = 2.6 + R() * 0.5;
    this.rasp(t, dur, 190, 0.7, 0.05 * lv, bus, 11, 0.5);
    this.rasp(t, dur, 1500, 0.8, 0.012 * lv, bus, 17, 0.7);
    for (let k = 0, n = Math.floor(dur * trot); k < n; k++) { const w = t + k / trot; this.cue(w, (x) => { this.burst(x, 0.035, 1100, 3, 0.05 * lv, bus); this.knock(x, 140, 0.035 * lv, bus, 0.05); }); if (k % 2) this.cue(w + 0.12, (x) => this.burst(x, 0.03, 1250, 3, 0.04 * lv, bus)); }
    for (let k = 0, n = Math.floor(dur * 1.5); k < n; k++) this.cue(t + k / 1.5 + R() * 0.3, (x) => this.struck(x, 2600 + R() * 600, 0.006 * lv, bus, [[1, 1, 0.12], [1.51, 0.4, 0.08]]));
    return dur;
  },

  // ── the court ───────────────────────────────────────────────────────────────
  /** The Cent-Suisses' drum at the gate: a roll swelling and ending on two strokes, then a fife's air over the beat. */
  verDrum(t, bus, lv) {
    let w = t;
    const n = 30;
    for (let k = 0; k < n; k++) { this.burst(w, 0.05, 1700, 1.2, (0.012 + 0.03 * k / n) * lv, bus); w += 0.05 - 0.012 * k / n; }
    this.knock(w + 0.1, 130, 0.06 * lv, bus, 0.12); this.knock(w + 0.4, 130, 0.06 * lv, bus, 0.12); w += 1.0;
    const air = [0, 2, 4, 5, 4, 2, 4, 0].map((d) => 74 + semi(d));
    air.forEach((m, k) => this.tone(w + k * 0.28, [[0, mtof(m)]], 0.26, 0.04 * lv, bus, 'triangle', ['lowpass', 3800, 0.7]));
    for (let k = 0; k < 8; k++) this.cue(w + k * 0.28, (x) => this.burst(x, 0.04, 1600, 1.5, 0.014 * lv, bus));
    return w - t + 2.4;
  },
  /** Violins in the Grand Apartment (Lully's court dances, at the evenings of the "appartement"): a minuet's phrase, a violin's line over a bass, in D. */
  verStrings(t, bus, lv) {
    const ph = pick(MINUET), beat = 0.52 + R() * 0.06;
    let w = t;
    for (let rep = 0; rep < 2; rep++) {
      ph.v.forEach((d, k) => { const f = mtof(74 + semi(d)), dur = beat * (k % 3 === 0 ? 1.3 : 0.85); this.tone(w + k * beat, [[0, f], [dur * 0.5, f * 1.003]], dur, 0.022 * lv, bus, 'sawtooth', ['lowpass', 2300, 0.8]); this.tone(w + k * beat, [[0, f * 1.004]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 1900, 0.8]); });
      ph.b.forEach((d, k) => this.tone(w + k * beat * 3, [[0, mtof(50 + semi(d))]], beat * 2.8, 0.016 * lv, bus, 'triangle', ['lowpass', 800, 0.7]));
      w += beat * 6;
    }
    return w - t + 1.5;
  },
  /** The King's Mass at the chapel: men's voices in a slow plainsong over the organ's low fifth, a long phrase and its answer. */
  verMass(t, bus, lv) {
    const f0 = 118;
    this.tone(t, [[0, 73.4]], 16, 0.01 * lv, bus, 'sine'); this.tone(t, [[0, 110]], 16, 0.008 * lv, bus, 'triangle', ['lowpass', 500, 0.7]);
    this.cry(t + 0.5, f0, [[0, 1.3, 'o'], [2, 1.2, 'a'], [3, 1.4, 'a'], [2, 1.0, 'o'], [0, 2.2, 'u']], 0.08 * lv, bus, { cutoff: 2600 });
    this.cry(t + 8.2, f0, [[3, 1.2, 'a'], [5, 1.3, 'e'], [3, 1.3, 'a'], [2, 1.1, 'o'], [0, 2.4, 'u']], 0.08 * lv, bus, { cutoff: 2600 });
    return 16;
  },

  // ── the town ────────────────────────────────────────────────────────────────
  /** A street cry passing along `f` (CRIES; wordless). */
  verCry(t, bus, lv, f) {
    const k = pickCry(this.plc.hourNow ?? this.lis().hour ?? 10), C = k && CRIES[k];
    if (!C) return 0.1;
    const base = (C.base ?? (C.fem ? 300 : 175)) * (0.93 + R() * 0.14), at = f.dur * (0.15 + 0.4 * R());
    this.cue(t + at, (w) => this.cry(w, base, C.cry, 0.05 * lv, bus, { fem: C.fem, cutoff: 4200 }));
    if (R() < 0.45) this.cue(t + at + 8 + R() * 6, (w) => this.cry(w, base, C.cry, 0.045 * lv, bus, { fem: C.fem, cutoff: 3800 }));
    return f.dur;
  },
  /** The night watch along `f`: steady steps on the stones, a halberd's butt knocked down at the corners, the low call "qui vive". */
  verWatch(t, bus, lv, f) {
    const dur = f.dur, T = 0.62;
    for (let k = 0, n = Math.floor(dur / T); k < n; k++) this.cue(t + k * T, (w) => this.step(w, 0.05 * lv, bus, 'cloth', 0.2));
    for (const a of [0.35, 0.75]) this.cue(t + dur * a, (w) => { this.knock(w, 220, 0.05 * lv, bus, 0.1); this.cry(w + 0.3, 125 * (0.95 + R() * 0.1), [[0, 0.4, 'a'], [5, 0.5, 'i'], [3, 0.8, 'e']], 0.04 * lv, bus, { cutoff: 2600 }); });
    return dur;
  },
  /** A gondolier on the Grand Canal: the oar dipping in its fork, a wordless barcarolle in six-eight over it. */
  verGondola(t, bus, lv, f) {
    const dur = f?.dur ?? 13;
    for (let k = 0, n = Math.max(2, Math.floor(dur / 2.1)); k < n; k++) { const w = t + 0.4 + k * 2.1; this.cue(w, (x) => { this.knock(x, 260, 0.03 * lv, bus, 0.07); this.burst(x + 0.05, 0.45, 1100, 0.9, 0.02 * lv, bus, 0.04); }); this.cue(w + 1.2, (x) => this.drip(x, lv * 0.6, bus)); }
    this.cry(t + dur * 0.15, 175, [[0, 0.5, 'o'], [4, 0.25, 'a'], [7, 0.5, 'a'], [4, 0.25, 'o'], [2, 0.5, 'o'], [0, 1.4, 'u']], 0.05 * lv, bus, { cutoff: 3000 });
    if (dur > 14) this.cry(t + dur * 0.55, 175, [[4, 0.5, 'a'], [7, 0.25, 'e'], [9, 0.5, 'a'], [7, 0.25, 'o'], [4, 0.5, 'o'], [0, 1.6, 'u']], 0.05 * lv, bus, { cutoff: 3000 });
    return dur;
  },

  // ── the trades' work (the opened shops) ─────────────────────────────────────
  /** The baker's oven: the iron door swung back, the peel scraping the brick floor, loaves slid out; a knock on the crust. */
  verBake(t, bus, lv) {
    this.struck(t, 380, 0.04 * lv, bus, [[1, 1, 0.3], [2.1, 0.4, 0.14]]); this.rasp(t + 0.25, 0.9, 1400, 1.0, 0.03 * lv, bus, 5, 0.7);
    for (let k = 0; k < 3; k++) this.cue(t + 1.4 + k * 0.5, (w) => { this.knock(w, 330, 0.035 * lv, bus, 0.06); });
    return 3;
  },
  /** The butcher's cleaver through bone onto the block: a hard chop and the block's boom, once or twice. */
  verCleave(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 1 + Math.floor(R() * 3); k++) { this.knock(w, 420, 0.07 * lv, bus, 0.1); this.burst(w, 0.05, 2300, 1.5, 0.07 * lv, bus); this.tone(w, [[0, 110], [0.2, 80]], 0.22, 0.04 * lv, bus, 'sine'); w += 0.55 + R() * 0.4; }
    return w - t;
  },
  /** The cobbler's awl and hammer: taps on a last, the thread drawn through the leather. */
  verAwl(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 4 + Math.floor(R() * 4); k++) { this.knock(w, 480 + R() * 80, 0.035 * lv, bus, 0.05); w += 0.3 + R() * 0.2; }
    this.rasp(w, 0.5, 2600, 1.2, 0.015 * lv, bus, 18, 0.5);
    return w - t + 0.5;
  },
  /** The chandler dipping candles: the rods lowered into the tallow vat, the wick-rods knocked on the frame. */
  verTallow(t, bus, lv) {
    this.burst(t, 0.5, 520, 0.7, 0.03 * lv, bus, 0.06); this.burst(t + 0.9, 0.5, 560, 0.7, 0.028 * lv, bus, 0.06);
    for (let k = 0; k < 3; k++) this.cue(t + 1.6 + k * 0.4, (w) => this.knock(w, 300, 0.03 * lv, bus, 0.05));
    return 3;
  },
  /** The cutler's grindstone: a wet wheel's steady hiss with the blade's scream rising when it is laid on, then a tap to try the edge. */
  verGrind(t, bus, lv) {
    this.rasp(t, 1.6, 900, 0.8, 0.02 * lv, bus, 36, 0.4);
    this.rasp(t + 0.3, 1.2, 3300, 1.8, 0.03 * lv, bus, 55, 0.5);
    this.cue(t + 2.0, (w) => this.struck(w, 1900, 0.025 * lv, bus, [[1, 1, 0.25], [2.76, 0.4, 0.12]]));
    return 2.8;
  },
  /** A cask knocked and rolled on the vintner's stones, a bung driven home. */
  verCask(t, bus, lv) {
    this.rasp(t, 1.4, 160, 0.8, 0.045 * lv, bus, 6, 0.6); this.knock(t + 1.5, 150, 0.05 * lv, bus, 0.15);
    this.cue(t + 2.1, (w) => { this.knock(w, 900, 0.04 * lv, bus, 0.05); this.knock(w + 0.2, 900, 0.04 * lv, bus, 0.05); });
    return 3;
  },
};
/** The levels of the voices above (the engine multiplies each event by its own). */
export const VERSAILLES_GAIN = { verFountain: 1, verUrn: 1, verValve: 1, verRake: 1, verHoe: 1, verChisel: 1, verPlane: 1, verStable: 1, verFarrier: 1, verCoach: 1, verDrum: 1, verStrings: 1, verMass: 1, verCry: 1, verWatch: 1, verGondola: 1, verBake: 1, verCleave: 1, verAwl: 1, verTallow: 1, verCask: 1, verGrind: 1 };
addVoices('voices-versailles.js', VERSAILLES_VOICES, VERSAILLES_GAIN);
