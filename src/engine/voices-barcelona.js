// The voices of Barcelona about 1910 (docs/settlements/barcelona.md §14.3), added to the placed voices of voices.js through addVoices: the electric trams on the
// Passeig and the Marina, the cabs and mules on the setts, the goatherd and his milk goats, the knife-grinder's pan-pipe, the criers, the night watchman (the sereno) with his
// keys and staff, the works' masons and hoist, Gaudí's workshop, the Schools' bell and children, the market's fishmongers, the café, the trades of the shops. The same
// synthesised terms as the others (noise, oscillators, formant filters, struck partials; no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music,
// scheduled from the fixed emitters and the passing tracks of the map (src/settlements/barcelona/soundmap.js); the tracks' voices get the moving path as a fourth argument.
// Every name carries the prefix `bcn`. [inferred throughout: no recording of 1910 exists; the sounds are those the period's sources name (the tram's gong, the sereno's
// keys and call, the knife-grinder's pan-pipe, the milk goats' bells, the lottery sellers); every melody is ours and no word is sung.]

import { addVoices, inHours } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** The cries of the streets: [semitones above the voice's base, seconds, vowel], wordless; `hours` local clock hours. */
export const BCN_CRIES = {
  lleter: { cry: [[7, 0.3, 'a'], [4, 0.25, 'a'], [0, 0.9, 'o']], fem: false, w: 1.0, hours: [6, 10] },                         // the milkman's call: a fall to a held low note
  newsboy: { cry: [[9, 0.2, 'e'], [12, 0.3, 'a'], [9, 0.3, 'a'], [5, 0.6, 'o']], fem: false, w: 1.0, hours: [7, 21], base: 270 }, // the papers: a boy's high call
  loteria: { cry: [[0, 0.3, 'o'], [5, 0.3, 'a'], [7, 0.7, 'a'], [4, 0.8, 'o']], fem: null, w: 1.0, hours: [10, 20.5] },           // the lottery seller, a number sung
  drapaire: { cry: [[0, 0.5, 'a'], [-2, 0.4, 'a'], [2, 0.8, 'e']], fem: false, w: 0.7, hours: [9, 17], base: 125 },                // the rag-and-bone man
  castanyera: { cry: [[4, 0.3, 'a'], [7, 0.3, 'a'], [4, 0.3, 'o'], [0, 1.0, 'o']], fem: true, w: 0.8, hours: [16, 22] },        // the chestnut woman by her brazier
};
export function pickCry(hour, rnd = R()) {
  const list = Object.entries(BCN_CRIES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** An iron shoe on a sett: tick and ring. */
function hoof(m, x, bus, lv, heavy) {
  m.burst(x, 0.045, heavy ? 1500 : 2100, 2.2, 0.09 * lv, bus);
  m.tone(x, [[0, heavy ? 520 : 760], [0.06, heavy ? 430 : 640]], 0.09, 0.012 * lv, bus, 'triangle');
}
/** A small bell's clonk (a collar bell, a goat's): a short bright ring with a lower partial. */
function clonk(m, x, f, bus, lv) { m.struck(x, f, 0.012 * lv, bus, [[1, 1, 0.28], [2.76, 0.5, 0.16], [5.4, 0.2, 0.08]]); }

export const BARCELONA_VOICES = {
  // ── the traffic ─────────────────────────────────────────────────────────────
  /** An electric tram: the motors' whine rising as it picks up, the wheels' rumble, the clack of the rail joints, the trolley wheel's sizzle on the wire; the gong now and then. */
  bcnTram(t, bus, lv, f) {
    const dur = f?.dur ?? 8, v0 = 150 + R() * 20;
    this.tone(t, [[0, v0], [dur * 0.4, v0 * 1.7], [dur, v0 * 1.45]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 520]);
    this.rasp(t, dur, 260, 0.5, 0.026 * lv, bus, 14, 0.8);
    this.rasp(t, dur, 4800, 1.4, 0.006 * lv, bus, 90, 0.9);
    for (let k = 0, n = Math.floor(dur / 0.62); k < n; k++) this.cue(t + k * 0.62, (x) => { this.knock(x, 210, 0.04 * lv, bus, 0.06); this.knock(x + 0.07, 190, 0.03 * lv, bus, 0.05); });
    if (R() < 0.6) this.cue(t + dur * (0.1 + 0.5 * R()), (x) => { this.struck(x, 690, 0.03 * lv, bus, [[1, 1, 0.5], [2.4, 0.5, 0.25]]); this.struck(x + 0.17, 690, 0.03 * lv, bus, [[1, 1, 0.5], [2.4, 0.5, 0.25]]); });
    return dur;
  },
  /** A tram standing at its stop: the motorman's foot-gong, two or three double strokes. */
  bcnTramBell(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) for (const d of [0, 0.16]) this.cue(t + k * 0.9 + d, (x) => this.struck(x, 700, 0.03 * lv, bus, [[1, 1, 0.6], [2.4, 0.5, 0.3], [4.2, 0.25, 0.15]]));
    return 3;
  },
  /** A hackney cab at the trot: the horse's two-beat on the setts, the iron tyres, the harness, a click of the tongue. */
  bcnCab(t, bus, lv, f) {
    const dur = f?.dur ?? 5, p = 0.34 + R() * 0.04;
    this.rasp(t, dur, 320, 0.5, 0.011 * lv, bus, 17, 0.7);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, false); hoof(this, x + 0.1 + R() * 0.03, bus, lv * 0.8, false); if (k % 2 === 0) this.struck(x, 3300 + R() * 300, 0.004 * lv, bus, [[1, 1, 0.12], [1.7, 0.4, 0.08]]); });
    if (R() < 0.35) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.burst(x, 0.05, 1900, 3, 0.03 * lv, bus));
    return dur;
  },
  /** A mule cart with iron tyres: slow heavy hoofs, the tyres' grind, the collar bells, a carter's word. */
  bcnCart(t, bus, lv, f) {
    const dur = f?.dur ?? 10, p = 0.66;
    this.rasp(t, dur, 190, 0.5, 0.03 * lv, bus, 9, 0.8);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, true); hoof(this, x + 0.33, bus, lv * 0.8, true); clonk(this, x + 0.05, 1500 + (k % 3) * 120, bus, lv * 0.5); clonk(this, x + 0.38, 1380, bus, lv * 0.4); });
    if (R() < 0.5) this.cue(t + dur * 0.5, (x) => this.cry(x, 120, [[0, 0.3, 'o'], [-2, 0.5, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
  /** The goatherd and his milk goats going door to door: the bells out of step, a bleat now and then, his call and his stick on the paving. */
  bcnGoats(t, bus, lv, f) {
    const dur = f?.dur ?? 20, p = 0.7;
    for (let g = 0; g < 4; g++) { const fq = 820 + g * 170 + R() * 60; for (let k = 0, n = Math.floor(dur / (p * (0.9 + g * 0.08))); k < n; k++) this.cue(t + g * 0.17 + k * p * (0.9 + g * 0.08) + R() * 0.12, (x) => clonk(this, x, fq, bus, lv)); }
    for (let k = 0, n = 1 + Math.floor(dur / 7); k < n; k++) this.cue(t + 1 + R() * (dur - 2), (x) => { const b = 380 + R() * 120; this.tone(x, [[0, b], [0.12, b * 1.08], [0.4, b * 0.78]], 0.45, 0.014 * lv, bus, 'sawtooth', ['bandpass', 1100, 2.2]); });
    for (let k = 0, n = Math.floor(dur / 1.1); k < n; k++) this.cue(t + k * 1.1, (x) => this.step(x, 0.02 * lv, bus, 'clog', 0.1));
    if (R() < 0.7) this.cue(t + dur * (0.2 + 0.4 * R()), (x) => this.cry(x, 135, [[0, 0.3, 'e'], [4, 0.35, 'a'], [7, 0.8, 'a'], [4, 0.6, 'o']], 0.045 * lv, bus, { cutoff: 3600 }));
    return dur;
  },
  /** The knife-grinder (afilador) with his pan-pipe: a quick rising run on the pipes, twice, the wheel's hiss between. */
  bcnGrinder(t, bus, lv, f) {
    const dur = f?.dur ?? 14;
    for (let r = 0, w = t + 0.5; w < t + dur - 2; r++, w += 5 + R() * 3) {
      const base = 72 + Math.floor(R() * 3), sc = [0, 2, 4, 5, 7, 9, 11, 12];
      for (let k = 0; k < 8; k++) this.cue(w + k * 0.085, (x) => this.tone(x, [[0, mtof(base + sc[k]) * 1.01]], 0.16, 0.012 * lv, bus, 'sine', ['bandpass', mtof(base + sc[k]), 4]));
      this.cue(w + 0.9, (x) => this.rasp(x, 1.4 + R(), 2700, 1.1, 0.014 * lv, bus, 36, 0.5));
    }
    return dur;
  },
  /** A crier of the streets walking the pavement: his trade's cry (by the hour) every few seconds. */
  bcnCry(t, bus, lv, f) {
    const hour = this.plc.hourNow ?? 12, k = pickCry(hour);
    if (!k) return 0.1;
    const T = BCN_CRIES[k], dur = f?.dur ?? 20;
    for (let w = t + 0.05; w < t + dur - 3; w += 8 + R() * 5) {
      const fem = T.fem === null ? R() < 0.5 : T.fem, f0 = (T.base || (fem ? 300 : 175)) * (0.93 + R() * 0.14);
      this.cue(w, (x) => this.cry(x, f0, T.cry, 0.05 * lv, bus, { fem, cutoff: 4200 }));
    }
    return dur;
  },
  /** The sereno on his round at night: his keys jingling at every step, the iron-shod staff (chuzo) on the paving every second step, and at the hours his long call. */
  bcnSereno(t, bus, lv, f) {
    const dur = f?.dur ?? 20, p = 0.7;
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => {
      this.step(x, 0.05 * lv, bus, 'clog', 0.15);
      for (let j = 0; j < 3; j++) this.struck(x + 0.03 + j * 0.05, 3000 + R() * 900, 0.005 * lv, bus, [[1, 1, 0.12], [1.8, 0.5, 0.08]]);
      if (k % 2) this.knock(x + 0.35, 760, 0.03 * lv, bus, 0.06);
    });
    if (R() < 0.5) this.cue(t + dur * (0.3 + 0.3 * R()), (x) => this.cry(x, 128, [[0, 0.5, 'a'], [0, 0.3, 'e'], [0, 0.3, 'i'], [-2, 0.35, 'a'], [-2, 0.3, 'e'], [-4, 1.4, 'o']], 0.045 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** Hands clapped in the street to call the sereno to a door: two or three claps, then a faint shout. */
  bcnClap(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * (0.5 + R() * 0.2), (x) => { this.burst(x, 0.05, 1900, 1.3, 0.05 * lv, bus); this.burst(x + 0.012, 0.04, 3400, 1.5, 0.03 * lv, bus); });
    this.cue(t + 2.2, (x) => this.cry(x, 150, [[0, 0.3, 'e'], [4, 0.9, 'e']], 0.04 * lv, bus, { cutoff: 3000 }));
    return 4;
  },
  /** The lamplighter's round at dusk and dawn: the pole's tap on each lamp, the soft pop of the gas taking. */
  bcnLamplighter(t, bus, lv, f) {
    const dur = f?.dur ?? 20;
    for (let w = t + 1, k = 0; w < t + dur - 1; w += 4 + R() * 2, k++) this.cue(w, (x) => { this.knock(x, 520, 0.03 * lv, bus, 0.07); this.burst(x + 0.3, 0.2, 260, 0.7, 0.03 * lv, bus, 0.01); for (let j = 0; j < 3; j++) this.step(x - 1.6 + j * 0.55, 0.03 * lv, bus, 'clog', 0.1); });
    return dur;
  },

  // ── the works ───────────────────────────────────────────────────────────────
  /** A mason dressing a block: mallet and chisel, a run of strokes, the stone ringing and the dust. */
  bcnChisel(t, bus, lv) {
    const n = 6 + Math.floor(R() * 7);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.26 + R() * 0.1), (x) => { this.knock(x, 330, 0.03 * lv, bus, 0.04); this.struck(x, 2500 + R() * 400, 0.012 * lv, bus, [[1, 1, 0.1], [2.3, 0.4, 0.06]]); });
    return n * 0.32 + 0.5;
  },
  /** The derrick's winch: the pawl's clicks, the rope grinding in the block, one squeal of the sheave. */
  bcnHoist(t, bus, lv) {
    const n = 14 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.38, (x) => this.burst(x, 0.03, 1300, 2, 0.04 * lv, bus));
    this.rasp(t, n * 0.38, 700, 0.9, 0.012 * lv, bus, 3, 0.9);
    this.tone(t + n * 0.38 * 0.5, [[0, 900], [0.5, 1150]], 0.6, 0.007 * lv, bus, 'triangle', ['bandpass', 1000, 3]);
    return n * 0.38 + 0.5;
  },
  /** A hammer on the scaffold's iron and timber: three or four blows, a plank's hollow knock. */
  bcnScaffold(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.33 + R() * 0.1), (x) => { this.knock(x, 520, 0.04 * lv, bus, 0.07); this.struck(x, 1700, 0.006 * lv, bus, [[1, 1, 0.15]]); });
    return 2.5;
  },
  /** Gaudí's modellers: plaster scraped smooth, a knife on a model, now and then the saw on a lath. */
  bcnPlaster(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.9, (x) => this.rasp(x, 0.7, 2400, 0.8, 0.014 * lv, bus, 14, 0.8));
    this.cue(t + 3, (x) => { for (let j = 0; j < 4; j++) this.cue(x + j * 0.22, (y) => this.rasp(y, 0.2, 1500, 0.7, 0.018 * lv, bus, 60, 0.9)); });
    return 4.5;
  },

  // ── the Schools, the market, the café ────────────────────────────────────────
  /** The Schools' handbell, rung by the teacher at the door: a hard run of strokes. */
  bcnSchoolBell(t, bus, lv) {
    for (let k = 0; k < 14; k++) this.cue(t + k * 0.17, (x) => this.struck(x, 1320 + (k % 2) * 60, 0.025 * lv, bus, [[1, 1, 0.4], [2.4, 0.45, 0.25], [4.1, 0.2, 0.12]]));
    return 3.4;
  },
  /** Children in their classroom: a murmur of small voices, a chair scraped, a high laugh, the teacher's one level voice. */
  bcnChildren(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 900 + R() * 300, 0.6, 0.02 * lv, bus, 5, 0.85);
    this.rasp(t, dur, 1900, 0.8, 0.009 * lv, bus, 7.3, 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * dur, (x) => this.cry(x, 360 + R() * 80, [[0, 0.12, 'a'], [3, 0.12, 'e'], [0, 0.2, 'a']], 0.022 * lv, bus, { fem: true, cutoff: 4200 }));
    this.cue(t + R() * dur * 0.5, (x) => this.rasp(x, 0.3, 500, 0.8, 0.02 * lv, bus, 20, 0.7));
    if (R() < 0.6) this.cue(t + 1 + R() * 2, (x) => this.cry(x, 150, [[0, 0.5, 'o'], [-2, 0.5, 'a'], [0, 0.9, 'o']], 0.03 * lv, bus, { cutoff: 2600 }));
    return dur;
  },
  /** A market seller's cry (fish, greens, melons): a fall or a climb, shouted over the stalls. */
  bcnMarketCry(t, bus, lv) {
    const notes = [[[9, 0.25, 'u'], [7, 0.25, 'u'], [4, 0.3, 'o'], [0, 0.9, 'o']], [[0, 0.3, 'a'], [4, 0.3, 'a'], [7, 0.3, 'e'], [9, 1.0, 'e']], [[5, 0.3, 'e'], [9, 0.3, 'a'], [5, 0.3, 'a'], [2, 0.8, 'o']]][Math.floor(R() * 3)];
    const fem = R() < 0.45;
    this.cry(t, (fem ? 300 : 170) * (0.93 + R() * 0.14), notes, 0.05 * lv, bus, { fem, cutoff: 4200 });
    return 3;
  },
  /** The fishmonger's cleaver on his block: a few chops, the scale-scrape between. */
  bcnCleaver(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.4 + R() * 0.3), (x) => { this.knock(x, 190, 0.05 * lv, bus, 0.1); this.burst(x, 0.04, 1800, 1.5, 0.03 * lv, bus); });
    this.cue(t + 2.4, (x) => this.rasp(x, 0.5, 3200, 0.8, 0.012 * lv, bus, 40, 0.7));
    return 3.5;
  },
  /** A café: the espresso machine's steam, cups set on saucers, a billiard clack, the talk. */
  bcnCafe(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 520 + R() * 200, 0.7, 0.02 * lv, bus, 4.5, 0.8);
    this.rasp(t, dur, 1100, 0.9, 0.008 * lv, bus, 6.1, 0.9);
    if (R() < 0.5) this.cue(t + 0.5 + R() * 2, (x) => this.rasp(x, 1.4, 5200, 0.8, 0.016 * lv, bus, 30, 0.5));
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * dur, (x) => this.struck(x, 2700 + R() * 700, 0.008 * lv, bus, [[1, 1, 0.12], [2.7, 0.4, 0.06]]));
    if (R() < 0.45) this.cue(t + R() * dur, (x) => { this.burst(x, 0.03, 1900, 3, 0.04 * lv, bus); this.tone(x, [[0, 1250], [0.03, 900]], 0.05, 0.012 * lv, bus, 'triangle'); });
    return dur;
  },
  /** The flat's upright piano: a habanera over its two-note bass, a little out of tune. */
  bcnPiano(t, bus, lv) {
    const base = 45 + Math.floor(R() * 3), tune = [12, 14, 16, 12, 14, 17, 16, 12];
    let w = t;
    for (let b = 0; b < 4; b++) {
      for (const [d, n] of [[0, 0], [0.75, 7], [1.0, 0], [1.5, 7]]) this.cue(w + d * 0.5, (x) => this.tone(x, [[0, mtof(base + n) * 1.005]], 0.7, 0.012 * lv, bus, 'triangle', ['lowpass', 1800]));
      for (const d of [0, 0.75, 1.0]) { const nn = tune[(b * 2 + (d > 0.8 ? 1 : 0)) % tune.length]; this.cue(w + d * 0.5 + 0.02, (x) => this.tone(x, [[0, mtof(base + 12 + nn) * 1.008]], d === 0.75 ? 0.28 : 0.5, 0.014 * lv, bus, 'triangle', ['lowpass', 3200])); }
      w += 1.0;
    }
    return w - t + 1;
  },
  /** A street guitarist: a rasgueado strum and a run of picked notes in the Phrygian mode, the strings ringing. */
  bcnGuitar(t, bus, lv) {
    const base = 40, ch = [0, 7, 12, 16, 19, 24];
    let w = t;
    for (let b = 0; b < 4; b++) {
      ch.forEach((n, k) => this.cue(w + k * 0.028, (x) => this.tone(x, [[0, mtof(base + n)]], 1.0, 0.011 * lv, bus, 'triangle', ['lowpass', 2600])));
      for (let k = 0; k < 5; k++) { const nn = [24, 25, 28, 27, 24][k]; this.cue(w + 0.6 + k * 0.17, (x) => this.tone(x, [[0, mtof(base + nn)]], 0.4, 0.012 * lv, bus, 'triangle', ['lowpass', 3000])); }
      w += 1.8;
    }
    return w - t + 1;
  },
  /** A gas lamp's faint hiss in the still of the night. */
  bcnGasHiss(t, bus, lv) { this.rasp(t, 5, 4300, 1.1, 0.004 * lv, bus, 3, 0.4); return 5; },

  // ── trades at work, heard from the open shops ───────────────────────────────
  bcnSlice(t, bus, lv) { for (let k = 0; k < 3; k++) this.cue(t + k * 0.55, (x) => this.rasp(x, 0.42, 3000, 0.9, 0.013 * lv, bus, 26, 0.6)); this.cue(t + 1.8, (x) => this.knock(x, 280, 0.03 * lv, bus, 0.06)); return 2.4; },
  bcnOven(t, bus, lv) { this.knock(t, 150, 0.05 * lv, bus, 0.15); this.rasp(t + 0.2, 0.7, 800, 0.8, 0.02 * lv, bus, 10, 0.8); for (let k = 0; k < 6; k++) this.cue(t + 0.9 + k * 0.14, (x) => this.burst(x, 0.02, 3800, 2, 0.012 * lv, bus)); return 2; },
  bcnBarrel(t, bus, lv) { for (let k = 0; k < 2; k++) this.cue(t + k * 0.5, (x) => this.knock(x, 130, 0.05 * lv, bus, 0.14)); const d = this.pour(t + 1.1, bus, lv * 0.8); return 1.6 + (typeof d === 'number' ? d : 1); },
  bcnMetal(t, bus, lv) { for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.3 + R() * 0.15), (x) => this.struck(x, 640 + R() * 140, 0.014 * lv, bus, [[1, 1, 0.3], [2.1, 0.5, 0.18], [3.4, 0.3, 0.1]])); return 2.2; },
  bcnShears(t, bus, lv) { this.rasp(t, 0.7, 2200, 0.7, 0.02 * lv, bus, 22, 0.8); for (let k = 0; k < 3; k++) this.cue(t + 1 + k * 0.3, (x) => this.burst(x, 0.09, 4400, 2, 0.016 * lv, bus)); return 2.2; },
  bcnTack(t, bus, lv) { for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) this.cue(t + k * (0.2 + R() * 0.1), (x) => this.knock(x, 1150 + R() * 150, 0.03 * lv, bus, 0.04)); return 2.2; },
};
addVoices('voices-barcelona.js', BARCELONA_VOICES, { bcnTram: 1.0, bcnGoats: 1.0, bcnCry: 1.2, bcnChildren: 1.2 });
