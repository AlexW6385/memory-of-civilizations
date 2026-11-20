// The voices of Victorian London about 1870 (docs/settlements/london.md §10.2), added to the placed voices of voices.js through addVoices: what the
// streets of Westminster and Lambeth sounded like, in the same synthesised terms (noise, oscillators, formant filters, struck partials; no samples).
// Each is a method `name(t, bus, lv)` of the audio engine's Music, scheduled from the fixed emitters and the passing tracks of the map
// (src/settlements/london/soundmap.js); the tracks' voices get the moving path as a fourth argument. Every name carries the prefix `lon`.
// [inferred throughout: no recording of 1870 exists. The trades and their cries are those of Mayhew's *London Labour and the London Poor*
// (https://dl.tufts.edu/teiviewer/parent/73666f96f/chapter/c4s7: butchers', chestnut-sellers' and costers' cries, flute, organ, street singers, a peepshow),
// but every melody is ours and no word is sung.]

import { addVoices, inHours } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const mapOf = (m) => m.plc?.life?.map;

/** The cries of the streets: [semitones above the voice's base, seconds, vowel], wordless; `hours` as local clock hours (the muffin-man rings a handbell instead of crying). */
export const LON_CRIES = {
  milk: { cry: [[7, 0.3, 'o'], [4, 0.25, 'o'], [0, 0.9, 'o']], fem: false, w: 1.0, hours: [5.5, 10] },                              // "Milk-o!": a fall to a held low note
  cress: { cry: [[9, 0.2, 'e'], [12, 0.25, 'e'], [9, 0.3, 'a'], [4, 0.9, 'a']], fem: true, w: 1.0, hours: [6, 10.5] },                // the watercress girl: high and quick
  sweep: { cry: [[5, 0.35, 'i'], [0, 0.9, 'i'], [5, 0.3, 'i'], [0, 1.0, 'i']], fem: false, w: 0.8, hours: [6, 12], base: 150 },       // "Sweep!": two long falling notes
  catsmeat: { cry: [[0, 0.35, 'a'], [4, 0.35, 'a'], [0, 0.4, 'a'], [-3, 1.0, 'o']], fem: false, w: 0.9, hours: [10, 17], base: 135 }, // the cats'-meat man, "meat, meat"
  oldclothes: { cry: [[0, 0.5, 'o'], [2, 0.3, 'o'], [-2, 0.8, 'o'], [0, 0.5, 'a']], fem: false, w: 0.8, hours: [9, 17], base: 120 },   // "Old clo'!"
  costers: { cry: [[2, 0.25, 'a'], [5, 0.25, 'a'], [9, 0.3, 'a'], [7, 0.3, 'e'], [4, 0.9, 'o']], fem: null, w: 1.2, hours: [8, 21.5] },// the barrow-men at the kerb: a rising run and a fall
  newsboy: { cry: [[9, 0.2, 'e'], [9, 0.2, 'e'], [12, 0.45, 'a'], [7, 0.5, 'a']], fem: false, w: 0.9, hours: [16, 22], base: 260 },   // the evening papers, a boy's high shout
  muffin: { inst: 'lonHandbell', w: 0.8, hours: [15, 19.5] },                                                                           // the muffin-man's bell on the tea-hour streets
};
export function pickCry(hour, rnd = R()) {
  const list = Object.entries(LON_CRIES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** One horse's pair of hoofs on the setts: the iron shoe's tick and the ring of it. */
function hoof(m, x, bus, lv, heavy) {
  m.burst(x, 0.045, heavy ? 1500 : 2100, 2.2, 0.09 * lv, bus);
  m.tone(x, [[0, heavy ? 520 : 760], [0.06, heavy ? 430 : 640]], 0.09, 0.012 * lv, bus, 'triangle');
}

export const LONDON_VOICES = {
  // ── the traffic of the streets ───────────────────────────────────────────────
  /** A hansom cab at the trot: the horse's two-beat on the granite, the iron tyres' rumble, the harness jingling, a click of the driver's tongue. */
  lonCab(t, bus, lv, f) {
    const dur = f?.dur ?? 5, p = 0.34 + R() * 0.04;
    this.rasp(t, dur, 320, 0.5, 0.011 * lv, bus, 17, 0.7);                                                                     // the tyres on the setts
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, false); hoof(this, x + 0.1 + R() * 0.03, bus, lv * 0.8, false); if (k % 2 === 0) this.struck(x, 3300 + R() * 300, 0.004 * lv, bus, [[1, 1, 0.12], [1.7, 0.5, 0.08]]); });
    if (R() < 0.35) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.burst(x, 0.05, 1900, 3, 0.03 * lv, bus));                    // the click of the tongue
    return dur;
  },
  /** A knifeboard omnibus: two horses, a heavier rumble and the body's creak, the conductor's call from the step now and then. */
  lonBus(t, bus, lv, f) {
    const dur = f?.dur ?? 7, p = 0.4;
    this.rasp(t, dur, 220, 0.5, 0.018 * lv, bus, 13, 0.8);
    this.rasp(t, dur, 760, 0.8, 0.008 * lv, bus, 3.2, 0.9);                                                                    // the body creaking on its springs
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, true); hoof(this, x + 0.05, bus, lv * 0.9, true); hoof(this, x + 0.2, bus, lv * 0.8, true); hoof(this, x + 0.26, bus, lv * 0.7, true); });
    if (R() < 0.55) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 150 * (0.9 + R() * 0.2), [[0, 0.3, 'a'], [4, 0.4, 'e'], [2, 0.7, 'a']], 0.045 * lv, bus, { cutoff: 3800 }));
    return dur;
  },
  /** A dray or coal cart behind a walking horse: slow heavy hoofs, the tyres, the chain's jingle, a carter's word. */
  lonCart(t, bus, lv, f) {
    const dur = f?.dur ?? 10, p = 0.62;
    this.rasp(t, dur, 190, 0.5, 0.03 * lv, bus, 9, 0.8);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, true); hoof(this, x + 0.31, bus, lv * 0.8, true); if (k % 2) this.struck(x, 2200, 0.005 * lv, bus, [[1, 1, 0.15], [2.3, 0.5, 0.1]]); });
    if (R() < 0.5) this.cue(t + dur * 0.5, (x) => this.cry(x, 120, [[0, 0.3, 'o'], [-2, 0.5, 'o']], 0.04 * lv, bus, { cutoff: 3200 }));
    return dur;
  },
  /** A penny steamer on the reach: the paddles' beat, the engine's thump, the wash; a whistle now and then. */
  lonSteamer(t, bus, lv, f) {
    const dur = f?.dur ?? 20, p = 0.62;
    this.rasp(t, dur, 260, 0.6, 0.03 * lv, bus, 1.6, 0.6);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.22, 380, 0.8, 0.06 * lv, bus, 0.02); this.tone(x, [[0, 95], [0.14, 62]], 0.2, 0.03 * lv, bus, 'sine'); this.burst(x + 0.31, 0.15, 700, 0.8, 0.03 * lv, bus, 0.02); });
    if (R() < 0.3) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => { this.tone(x, [[0, 520], [0.5, 540]], 0.9, 0.012 * lv, bus, 'sawtooth', ['lowpass', 1800]); });   // the steam whistle
    return dur;
  },
  /** A coal lighter drifting down on the tide under her sweep: the oar's creak in its crutch, a drip, the lighterman's long call. */
  lonLighter(t, bus, lv, f) {
    const dur = f?.dur ?? 25, T = 3.2 + R();
    for (let k = 0, n = Math.floor(dur / T); k < n; k++) this.cue(t + k * T, (x) => { this.tone(x, [[0, 310], [0.5, 270]], 0.6, 0.012 * lv, bus, 'triangle', ['bandpass', 600, 4]); this.burst(x + 0.4, 0.4, 900, 0.7, 0.02 * lv, bus, 0.05); this.cue(x + 1.4, (y) => this.drip(y, lv * 0.6, bus)); });
    this.rasp(t, dur, 420, 0.6, 0.008 * lv, bus, 0.5, 0.8);
    if (R() < 0.5) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 125, [[0, 0.4, 'o'], [5, 1.0, 'a'], [2, 0.7, 'o']], 0.045 * lv, bus, { cutoff: 3600 }));
    return dur;
  },
  /** A crier of the streets walking the pavement: his trade's cry (by the hour) every few seconds. */
  lonCry(t, bus, lv, f) {
    const hour = this.plc.hourNow ?? 12, k = pickCry(hour);
    if (!k) return 0.1;
    const T = LON_CRIES[k], dur = f?.dur ?? 20, gap = T.inst ? 6 + R() * 3 : 8 + R() * 4;
    for (let w = t + 0.05; w < t + dur - 3; w += gap + R() * 3) {
      const fem = T.fem === null ? R() < 0.5 : T.fem, f0 = (T.base || (fem ? 300 : 175)) * (0.93 + R() * 0.14);
      this.cue(w, (x) => (T.inst ? this[T.inst](x, bus, lv) : this.cry(x, f0, T.cry, 0.05 * lv, bus, { fem, cutoff: 4200 })));
    }
    return dur;
  },
  /** The muffin-man's handbell: a quick double stroke, over and over as he walks. */
  lonHandbell(t, bus, lv) {
    for (let k = 0; k < 7; k++) this.cue(t + k * 0.5, (x) => { this.struck(x, 1350, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.45, 0.3], [4.1, 0.2, 0.15]]); this.struck(x + 0.11, 1420, 0.016 * lv, bus, [[1, 1, 0.45], [2.4, 0.4, 0.25]]); });
    return 3.6;
  },
  /** A policeman on his beat at night: a slow measured tread in hobnailed boots, nothing else. */
  lonBeat(t, bus, lv, f) {
    const dur = f?.dur ?? 20, p = 0.66;
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => this.step(x, 0.05 * lv, bus, 'clog', 0.2));
    if (R() < 0.3) this.cue(t + dur * 0.5, (x) => this.cry(x, 118, [[0, 0.35, 'o'], [-2, 0.7, 'o']], 0.03 * lv, bus, { cutoff: 2800 }));
    return dur;
  },

  // ── the music of the streets ─────────────────────────────────────────────────
  /** The barrel organ in Parliament Square: a waltz ground out on reed pipes, the crank's tick under it, a little sharp as they all were. */
  lonBarrel(t, bus, lv) {
    const base = 57 + Math.floor(R() * 4), deg = [0, 2, 4, 7, 9, 12], step = 0.26, bars = 6;
    let d = 2;
    for (let b = 0; b < bars; b++) for (let k = 0; k < 3; k++) {
      d = Math.max(0, Math.min(deg.length - 1, d + [-2, -1, 1, 2, 0, 1][Math.floor(R() * 6)]));
      const w = t + (b * 3 + k) * step * 1.4, hz = mtof(base + deg[d]) * 1.012;
      this.cue(w, (x) => { this.tone(x, [[0, hz]], step * 1.3, 0.014 * lv, bus, 'square', ['lowpass', 1600]); if (k === 0) this.tone(x, [[0, hz / 2]], step * 1.3, 0.012 * lv, bus, 'sawtooth', ['lowpass', 700]); });
    }
    for (let k = 0, n = Math.floor(bars * 3 * 1.4 * step / 0.17); k < n; k++) this.cue(t + k * 0.17, (x) => this.burst(x, 0.012, 3200, 3, 0.012 * lv, bus));
    return bars * 3 * step * 1.4 + 1;
  },
  /** Punch and Judy: the swazzle's rasping voice in syllables, the drum, a run on the pan-pipes. */
  lonPunch(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 4); k < n; k++) {
      const len = 0.12 + R() * 0.2, hz = 900 + R() * 600;
      this.cue(w, (x) => this.tone(x, [[0, hz], [len, hz * (0.8 + R() * 0.5)]], len, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1500, 3]));
      if (k % 3 === 2) this.cue(w + len, (x) => this.knock(x, 130, 0.05 * lv, bus, 0.1));                                     // the drum's thump at the end of a phrase
      w += len + 0.08 + R() * 0.2;
    }
    for (let k = 0; k < 5; k++) this.cue(w + 0.3 + k * 0.17, (x) => this.tone(x, [[0, 700 + k * 110]], 0.2, 0.01 * lv, bus, 'sine'));   // the pipes
    return w - t + 1.5;
  },
  /** A stout old piano in a pub: out of tune, chords and a tune over them, the keys heavy-handed. */
  lonPiano(t, bus, lv) {
    const base = 55 + Math.floor(R() * 5), ch = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], tune = [12, 14, 16, 12, 14, 17, 16, 12];
    let w = t;
    for (let b = 0; b < 4; b++) {
      for (const n of ch[b]) this.cue(w + (n % 3) * 0.02, (x) => { this.tone(x, [[0, mtof(base + n) * 1.006]], 0.9, 0.012 * lv, bus, 'triangle', ['lowpass', 2400]); this.tone(x, [[0, mtof(base + n) * 0.995]], 0.9, 0.008 * lv, bus, 'sawtooth', ['lowpass', 1200]); });
      for (let k = 0; k < 2; k++) { const nn = tune[(b * 2 + k) % tune.length], x0 = w + 0.5 * k + 0.25; this.cue(x0, (x) => this.tone(x, [[0, mtof(base + nn) * 1.01]], 0.45, 0.014 * lv, bus, 'triangle', ['lowpass', 3000])); }
      w += 1.1;
    }
    return w - t + 1;
  },
  /** A public house's murmur: voices run together, a laugh, pots set down. */
  lonPubTalk(t, bus, lv) {
    const dur = 4 + R() * 3;
    this.rasp(t, dur, 520 + R() * 200, 0.7, 0.024 * lv, bus, 4.5, 0.8);
    this.rasp(t, dur, 1100, 0.9, 0.01 * lv, bus, 6.1, 0.9);
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * dur, (x) => this.struck(x, 2400 + R() * 500, 0.006 * lv, bus, [[1, 1, 0.09], [2.7, 0.4, 0.05]]));
    if (R() < 0.35) this.cue(t + R() * dur, (x) => this.cry(x, 160 + R() * 40, [[0, 0.12, 'a'], [2, 0.12, 'a'], [0, 0.12, 'a'], [-2, 0.2, 'a']], 0.025 * lv, bus, { cutoff: 2600 }));
    return dur;
  },

  // ── trades at work, heard from the open shops ───────────────────────────────
  lonCleaver(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.4 + R() * 0.3), (x) => { this.knock(x, 200, 0.05 * lv, bus, 0.1); this.burst(x, 0.04, 1800, 1.5, 0.03 * lv, bus); });
    return 2;
  },
  lonHammer(t, bus, lv) {
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + k * (0.22 + R() * 0.12), (x) => this.knock(x, 820 + R() * 120, 0.03 * lv, bus, 0.05));
    return 2;
  },
  lonStrop(t, bus, lv) {
    for (let k = 0; k < 4; k++) this.cue(t + k * 0.55, (x) => this.rasp(x, 0.38, 3300, 1.2, 0.012 * lv, bus, 30, 0.5));
    return 2.4;
  },
  lonPestle(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.8, (x) => this.rasp(x, 0.6, 1300, 0.9, 0.014 * lv, bus, 7, 0.7));
    this.cue(t + 2.5, (x) => this.struck(x, 1650, 0.012 * lv, bus, [[1, 1, 0.25], [2.5, 0.4, 0.12]]));
    return 3;
  },
  lonScale(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 2200, 0.01 * lv, bus, [[1, 1, 0.2], [2.7, 0.5, 0.12]]); this.struck(x + 0.14, 2050, 0.008 * lv, bus, [[1, 1, 0.18]]); });
    this.rasp(t + 0.5, 0.4, 2500, 0.8, 0.012 * lv, bus, 22, 0.8);
    return 1.5;
  },
  lonTill(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 3100, 0.012 * lv, bus, [[1, 1, 0.14], [2.1, 0.5, 0.08]]); this.struck(x + 0.1, 4000, 0.008 * lv, bus, [[1, 1, 0.1]]); this.rasp(x + 0.2, 0.3, 900, 0.9, 0.02 * lv, bus, 40, 0.6); });
    return 1;
  },
  lonCrate(t, bus, lv) { this.knock(t, 260, 0.04 * lv, bus, 0.1); this.rasp(t + 0.1, 0.5, 2200, 0.6, 0.012 * lv, bus, 16, 0.9); return 1; },
  lonTray(t, bus, lv) { this.rasp(t, 0.6, 700, 0.8, 0.025 * lv, bus, 12, 0.8); this.knock(t + 0.6, 340, 0.04 * lv, bus, 0.08); return 1.2; },
  lonShears(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.3, (x) => this.burst(x, 0.09, 4400, 2, 0.016 * lv, bus));
    this.rasp(t + 1, 0.5, 1700, 0.6, 0.012 * lv, bus, 18, 0.9);
    return 1.8;
  },

  // ── places ───────────────────────────────────────────────────────────────────
  /** The knife-grinder's wheel: the stone's hiss, the steel on it, the treadle's thump. */
  lonGrind(t, bus, lv) {
    const dur = 3 + R() * 2;
    this.rasp(t, dur, 2700, 1.1, 0.02 * lv, bus, 36, 0.5);
    for (let k = 0, n = Math.floor(dur / 0.9); k < n; k++) this.cue(t + k * 0.9, (x) => this.knock(x, 90, 0.04 * lv, bus, 0.12));
    this.rasp(t + 0.4, dur * 0.7, 5200, 1.5, 0.008 * lv, bus, 60, 0.9);
    return dur;
  },
  /** The drinking fountain's trickle into its basin. */
  lonFountain(t, bus, lv) {
    const dur = 4;
    this.rasp(t, dur, 1900, 0.6, 0.009 * lv, bus, 12, 0.6);
    for (let k = 0; k < 7; k++) this.cue(t + R() * dur, (x) => this.drip(x, lv * 0.5, bus));
    return dur;
  },
  /** The steamer's bell at the pier: the pier-master's handbell in a run, the gangway's thud, a call. */
  lonPierBell(t, bus, lv) {
    for (let k = 0; k < 5; k++) this.cue(t + k * 0.28, (x) => this.struck(x, 1250 + (k % 2) * 60, 0.025 * lv, bus, [[1, 1, 0.6], [2.4, 0.4, 0.3]]));
    this.cue(t + 2, (x) => this.knock(x, 110, 0.05 * lv, bus, 0.15));
    this.cue(t + 3, (x) => this.cry(x, 135, [[0, 0.35, 'o'], [5, 0.8, 'a']], 0.04 * lv, bus, { cutoff: 3600 }));
    return 5;
  },
  /** A bell of the Abbey tolled for a service: a slow stroke, eight times. */
  lonAbbeyBell(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 2.6, (x) => this.strike(x, mtof(55), 0.05 * lv, bus, 1.3));
    return 8 * 2.6 + 2;
  },
  /** Evensong in the Abbey: a choir chanting on one note, the boys over the men, an organ's pedal under it; wordless. */
  lonEvensong(t, bus, lv) {
    const f0 = 165, syl = ['a', 'e', 'o', 'u', 'i'];
    let w = t;
    for (let v = 0, V = 4 + Math.floor(R() * 3); v < V; v++) for (const [n, last] of [[7 + Math.floor(R() * 3), false], [6 + Math.floor(R() * 3), true]]) {
      const notes = [];
      for (let k = 0; k < n; k++) notes.push([0, 0.2 + R() * 0.1, syl[Math.floor(R() * syl.length)]]);
      notes.push([2, 0.3, 'e'], [-2, 0.5, 'o'], last ? [-3, 1.0, 'u'] : [-2, 0.6, 'a']);
      const dur = notes.reduce((s, q) => s + q[1], 0), x = w;
      this.cue(x, (q) => this.cry(q, f0 * 2, notes, 0.022 * lv, bus, { cutoff: 3200, fem: true }));
      this.cue(x, (q) => this.cry(q, f0, notes, 0.024 * lv, bus, { cutoff: 2200 }));
      w += dur + 0.8;
    }
    this.tone(t, [[0, 82]], w - t, 0.012 * lv, bus, 'sawtooth', ['lowpass', 300]);
    return w - t + 2;
  },
};
addVoices('voices-london.js', LONDON_VOICES, { lonAbbeyBell: 0.5, lonFountain: 1.6, lonPubTalk: 1.2, lonCry: 1.2 });
