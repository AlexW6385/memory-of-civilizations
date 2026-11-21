// The placed voices of Zagwe Lalibela about 1220 (docs/settlements/lalibela.md §20; src/settlements/lalibela/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `la`. All synthesised, no samples. [inferred throughout: no recording of the
// twelfth century exists; the instruments are those the dossier names (the kebero, the tsenatsel sistrum, the begena) and the work is the highland
// household's (the pestle and mortar, the loom, the stone gong of the church); pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const PENT = [0, 2, 4, 7, 9];                                          // the tizita-like pentatonic of the music profile
const hz = (root, st) => root * Math.pow(2, st / 12);

export const LA_VOICES = {
  /** The kebero: a large two-headed drum struck with the hands, a slow pattern of low and high strokes (a dull boom and a slap). */
  laKebero(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) {
      const low = k % 4 !== 1 && k % 4 !== 3;
      this.cue(w, (x) => this.knock(x, low ? 95 + R() * 10 : 210 + R() * 20, (low ? 0.07 : 0.04) * lv, bus, low ? 0.22 : 0.09));
      w += (k % 4 === 2 ? 0.28 : 0.42) + R() * 0.03;
    }
    return w - t + 0.8;
  },
  /** The tsenatsel: a sistrum shaken in runs, the loose discs on their rods, with the shaker's own pauses. */
  laSistrum(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 5 + Math.floor(R() * 6); s < ns; s++) {
      for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) this.cue(w + k * 0.05, (x) => this.struck(x, 3600 + R() * 1800, 0.009 * lv, bus, [[1, 1, 0.08], [1.6, 0.5, 0.05], [2.4, 0.2, 0.04]]));
      w += 0.55 + R() * 0.5;
    }
    return w - t + 0.4;
  },
  /** The deacons' chant: wordless men's voices on a drone, a long phrase on the five-note mode rising and settling, the vowels open. */
  laChant(t, bus, lv) {
    const root = 130, dur = 16 + R() * 10;
    this.tone(t, [[0, root], [dur, root]], dur, 0.012 * lv, bus, 'sawtooth', ['bandpass', 700, 2]);
    let w = t + 1.0, k = 2;
    while (w < t + dur - 2) {
      k = Math.max(0, Math.min(8, k + Math.floor(R() * 3) - 1));
      const st = PENT[k % PENT.length] + 12 * Math.floor(k / PENT.length), len = 0.8 + R() * 1.6, v = ['a', 'o', 'e', 'a', 'u'][Math.floor(R() * 5)];
      this.cue(w, (x) => this.cry(x, hz(root * 2, st), [[0, len * 0.5, v], [-1, len * 0.5, v]], 0.04 * lv, bus, { cutoff: 2200, fem: false }));
      w += len + 0.15 + R() * 0.4;
    }
    return dur + 1;
  },
  /** The begena: the big bass lyre, a buzzing string plucked slowly, each note with the rattle of its leather-wrapped bridge, a drone beneath. */
  laBegena(t, bus, lv) {
    const root = 98, n = 5 + Math.floor(R() * 5);
    let w = t, k = Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(7, k + Math.floor(R() * 3) - 1));
      const st = PENT[k % PENT.length] + 12 * Math.floor(k / PENT.length), f = hz(root, st);
      this.cue(w, (x) => { this.struck(x, f, 0.035 * lv, bus, [[1, 1, 2.0], [2, 0.5, 1.4], [3, 0.3, 1.0], [4.01, 0.15, 0.6]]); this.rasp(x, 1.4, 1800, 1.5, 0.006 * lv, bus, 140, 0.9); });
      w += 1.1 + R() * 1.2;
    }
    return w - t + 2.0;
  },
  /** The dawal: the church's stone slab struck with a mallet to call the hours, three slow strokes and a run, ringing. */
  laStoneGong(t, bus, lv) {
    let w = t;
    for (const [d, f] of [[0, 640], [1.6, 640], [3.2, 700], [4.4, 560], [4.9, 600], [5.4, 640], [5.8, 700]]) this.cue(t + d, (x) => this.struck(x, f * (1 + R() * 0.01), 0.05 * lv, bus, [[1, 1, 1.6], [2.3, 0.4, 0.9], [3.9, 0.2, 0.5]]));
    w += 6.5; return w - t + 1.0;
  },
  /** The pestle and mortar: grain pounded in a hollowed log, a dull double thud in a steady rhythm, the pause to turn the grain. */
  laMortar(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { this.cue(w, (x) => { this.knock(x, 150, 0.05 * lv, bus, 0.12); this.knock(x + 0.45, 170, 0.04 * lv, bus, 0.1); }); w += 0.95 + (k % 6 === 5 ? 0.8 : 0); }
    return w - t + 0.8;
  },
  /** The mitad: the clay griddle's hiss as the injera batter is poured, the scrape of the wooden spreader. */
  laGriddle(t, bus, lv) {
    this.rasp(t, 1.4, 3200, 0.8, 0.012 * lv, bus, 30, 0.9);
    this.rasp(t + 1.6, 0.5, 1500, 1.0, 0.012 * lv, bus, 6, 0.5);
    return 2.4;
  },
  /** The weaver's loom: the shuttle's knock and the beater's thud, the creak of the frame, in an even rhythm. */
  laLoom(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 380, 0.025 * lv, bus, 0.04); this.knock(x + 0.35, 190, 0.04 * lv, bus, 0.08); }); w += 1.1 + R() * 0.3; }
    return w - t + 0.8;
  },
  /** The mason's mallet on the chisel in the rock: a bright tap, a ring, quick runs and pauses. */
  laChisel(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 14 + Math.floor(R() * 10); k < n; k++) { this.cue(w, (x) => this.struck(x, 2100 + R() * 300, 0.03 * lv, bus, [[1, 1, 0.12], [2.7, 0.3, 0.07]])); w += (k % 5 === 4 ? 0.9 : 0.34) + R() * 0.05; }
    return w - t + 0.6;
  },
  /** A wind in the juniper and the thatch, a long breath of filtered noise. */
  laWind(t, bus, lv) { const d = 6 + R() * 5; this.rasp(t, d, 700 + R() * 300, 0.4, 0.012 * lv, bus, 3 + R() * 2, 0.6); return d; },
  /** A herd boy's call to his goats, wordless, two notes falling, from the slope. */
  laHerder(t, bus, lv) {
    for (const [d, f] of [[0, 210], [0.6, 170], [1.4, 150]]) this.cue(t + d, (x) => this.cry(x, f, [[0, 0.5, 'o'], [-3, 0.6, 'a']], 0.04 * lv, bus, { cutoff: 2800, fem: R() < 0.3 }));
    return 3;
  },
};
addVoices('voices-lalibela.js', LA_VOICES);
