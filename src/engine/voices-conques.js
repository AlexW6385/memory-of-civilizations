// The placed voices of Conques about 1120 (docs/settlements/conques.md §20.3; src/settlements/conques/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `cq`; the engine's own voices that suit (the smith's hammer, the kitchen, the
// jars' lids, cloth, the plane, the owl, the well's bucket) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of 12th-century life exists. The plainchant is a recitation on one tone with the
// cadences of the church modes (the third mode, Phrygian on E, as the dossier's music); the pitches and the patterns are ours. The animals and the
// trades are those the dossier names.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);

export const CQ_VOICES = {
  /** The Dourdou over its rocks in the gorge: a broad rush with a lower rumble, the pulses of the rapids. */
  cqRiver(t, bus, lv) {
    const d = 8 + R() * 4;
    this.rasp(t, d, 700 + R() * 300, 0.5, 0.026 * lv, bus, 7 + R() * 4, 0.55);
    this.rasp(t + 0.4, d - 0.8, 2200, 0.7, 0.01 * lv, bus, 15, 0.7);
    this.rasp(t, d, 200, 0.6, 0.02 * lv, bus, 3, 0.4);
    return d;
  },
  /** A fountain's spout into its stone tank: a thin falling stream and the plinks of the drops. */
  cqSpout(t, bus, lv) {
    const d = 4 + R() * 2;
    this.rasp(t, d, 3000 + R() * 600, 0.9, 0.012 * lv, bus, 22, 0.5);
    for (let k = 0, w = 0; w < d - 0.4; k++) { w += 0.18 + R() * 0.4; this.cue(t + w, (x) => this.tone(x, [[0, 900 + R() * 600], [0.05, 1500 + R() * 500]], 0.07, 0.01 * lv, bus, 'sine')); }
    return d;
  },
  /** The mill: the wheel's paddles striking the water in a slow round, the axle's creak, the stones grumbling above. */
  cqMillwheel(t, bus, lv) {
    const beat = 1.7 + R() * 0.3, n = 6 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) this.cue(t + k * beat, (x) => { this.burst(x, 0.35, 420, 0.8, 0.04 * lv, bus); this.burst(x + 0.08, 0.5, 1500, 0.6, 0.012 * lv, bus); });
    this.cue(t + 0.4, (x) => this.creak(x, lv, bus, true)); this.cue(t + beat * 3.5, (x) => this.creak(x, lv, bus, false));
    this.rasp(t, n * beat, 150, 1.0, 0.02 * lv, bus, 5, 0.6);
    return n * beat + 0.5;
  },
  /** A hide scraped over a beam in the tanner's yard: long rasps, a slap of water. */
  cqHide(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.55, 900 + R() * 300, 0.7, 0.02 * lv, bus, 9, 0.8); w += 0.8 + R() * 0.4; }
    this.cue(w, (x) => this.burst(x, 0.3, 380, 0.9, 0.03 * lv, bus));
    return w - t + 0.6;
  },
  /** The washerwomen's beetles on linen at the river: wet slaps, two or three together, out of step. */
  cqBeetle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.burst(x, 0.12, 520 + R() * 160, 1.1, 0.04 * lv, bus); this.knock(x, 200, 0.02 * lv, bus, 0.08); }); w += 0.45 + R() * 0.35; }
    return w - t + 0.3;
  },
  /** The weaver's loom: the beater's thump, the shuttle's clack, the treadles' tick, a pick every second or so. */
  cqLoom(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 9 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 190, 0.05 * lv, bus, 0.1); this.knock(x + 0.22, 1100, 0.025 * lv, bus, 0.05); this.knock(x + 0.6, 400, 0.015 * lv, bus, 0.04); });
      w += 1.0 + R() * 0.35;
    }
    return w - t + 0.5;
  },
  /** The baker's peel on the oven's floor: a long scrape, the thump of loaves on a board, the oven door's clank. */
  cqBread(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.rasp(w, 0.6, 700, 0.8, 0.02 * lv, bus, 6, 0.8); this.cue(w + 0.7, (x) => this.knock(x, 150, 0.05 * lv, bus, 0.12)); w += 1.6 + R() * 0.8; }
    this.cue(w, (x) => this.struck(x, 320, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.4, 0.3]]));
    return w - t + 0.8;
  },
  /** An inn's room: the murmur of men over their cups, the knock of a tankard on a board, a burst of laughter. */
  cqTavern(t, bus, lv) {
    const d = 9 + R() * 6;
    for (const [f, o] of [[150, 0.5], [118, 0.8], [185, 0.3]]) this.cue(t + o * R() * 3, (x) => this.cry(x, f * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [2, 0.4, 'a'], [-2, 0.6, 'e'], [0, 0.5, 'o']], 0.016 * lv, bus, { cutoff: 1700 }));
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + R() * (d - 2), (x) => this.knock(x, 230 + R() * 60, 0.035 * lv, bus, 0.08));
    if (R() < 0.5) this.cue(t + d * 0.6, (x) => this.cry(x, 170, [[0, 0.14, 'a'], [0, 0.14, 'a'], [2, 0.2, 'a'], [-1, 0.25, 'a']], 0.03 * lv, bus, { cutoff: 2400 }));
    return d;
  },
  /** The hearth: the small pops of burning wood and the hiss of a green log. */
  cqHearth(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + R() * 3.5, (x) => this.burst(x, 0.04 + R() * 0.05, 1800 + R() * 1800, 1.5, 0.03 * lv, bus));
    this.rasp(t, 2.2, 3600, 0.6, 0.006 * lv, bus, 30, 0.9);
    return 3.8;
  },
  /** The Office sung in the choir: a monk intones, the other side answers; a recitation on a tone with the half-cadences of the third mode, the vowels of Latin. */
  cqChant(t, bus, lv) {
    const root = 130.8, T = 5, V = ['a', 'e', 'u', 'o', 'i', 'a', 'o', 'e'];     // C3, the tenor a fourth-and-a-half over (E-mode: the tenor C over the final E)
    let w = t, side = 0;
    const verses = 2 + Math.floor(R() * 3);
    for (let v = 0; v < verses; v++) {
      const n = 11 + Math.floor(R() * 7), notes = [];
      notes.push([T - 3, 0.5, 'o'], [T - 1, 0.35, 'e']);                          // the intonation, rising to the tenor
      for (let k = 0; k < n; k++) notes.push([T, 0.27 + R() * 0.05, V[(k + v) % V.length]]);
      notes.push([T - 1, 0.35, 'e'], [T - 3, 0.35, 'u'], [T - 5, 0.9, 'o']);      // the flexa and the cadence
      const f0 = side ? root * 0.97 : root;
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1900 }));
      this.cue(w + 0.05, (x) => this.cry(x, f0 * 2, notes.map(([s, d, vo]) => [s, d, vo]), 0.009 * lv, bus, { cutoff: 2600 }));   // the boys' voices an octave above, thin
      w += notes.reduce((a, q) => a + q[1], 0) + 1.3; side ^= 1;
    }
    return w - t + 1.5;
  },
  /** The pilgrims on the road, in a company: steps of iron-shod staves and boots on the cobbles, a wordless refrain hummed on a few notes. */
  cqPilgrims(t, bus, lv, f) {
    const dur = f.dur, pace = 0.62, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace * (1 + (R() - 0.5) * 0.1), (x) => { this.step(x, 0.05 * lv, bus, k % 2 ? 'clog' : 'cloth', 0.4); if (k % 2) this.knock(x + 0.1, 640, 0.015 * lv, bus, 0.04); });
    const tune = [[0, 0.5, 'o'], [3, 0.5, 'o'], [5, 0.9, 'a'], [3, 0.4, 'o'], [0, 0.9, 'o']];
    for (let k = 0; k < 2 && 1 + k * 7 < dur - 3; k++) this.cue(t + 1 + k * 7, (x) => this.cry(x, 150 * (0.95 + R() * 0.1), tune, 0.03 * lv, bus, { cutoff: 2800 }));
    return dur;
  },
  /** A mule with panniers: slow hoof-falls on cobbles, the panniers' creak, a collar-bell. */
  cqMule(t, bus, lv, f) {
    const dur = f.dur, pace = 0.85, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.knock(x, 260, 0.035 * lv, bus, 0.07); this.knock(x + 0.18, 300, 0.03 * lv, bus, 0.06); if (k % 3 === 0) this.struck(x, 1250, 0.006 * lv, bus, [[1, 1, 0.4], [2.7, 0.3, 0.2]]); });
    this.cue(t + 0.5, (x) => this.creak(x, 0.5 * lv, bus, true));
    return dur;
  },
  /** A cock crowing: four syllables, the last long and falling. */
  cqCock(t, bus, lv) {
    const f = 520 + R() * 120;
    [[0, 0.16, 1], [0.2, 0.14, 1.25], [0.38, 0.18, 1.35], [0.62, 0.7, 1.3]].forEach(([dt, d, k], i) => this.tone(t + dt, [[0, f * k * 0.9], [d * 0.3, f * k], [d, f * k * (i === 3 ? 0.7 : 0.95)]], d, 0.014 * lv, bus, 'sawtooth', ['bandpass', 1500, 2.5]));
    return 1.5;
  },
  /** A donkey's bray: the in-drawn "hee" and the out-breathed "haw", three or four pairs, slowing. */
  cqDonkey(t, bus, lv) {
    let w = t, g = 0.7;
    for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) {
      this.tone(w, [[0, 650], [0.4, 900]], 0.45, 0.014 * lv, bus, 'sawtooth', ['bandpass', 1200, 2]);
      this.tone(w + 0.45, [[0, 560], [0.5, 280]], 0.55, 0.016 * lv, bus, 'sawtooth', ['bandpass', 700, 1.5]);
      w += 1.05 * g + 0.3; g *= 1.1;
    }
    return w - t + 0.6;
  },
  /** A dog's barking at a stranger: two to four barks. */
  cqDog(t, bus, lv) {
    const f = 330 + R() * 220;
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.tone(w, [[0, f], [0.04, f * 1.25], [0.14, f * 0.8]], 0.16, 0.016 * lv, bus, 'sawtooth', ['bandpass', 900, 1.5]); w += 0.32 + R() * 0.15; }
    return w - t + 0.3;
  },
  /** The bells of a flock grazing on the hillside: a few clanks of iron bells, each its own note. */
  cqSheepBell(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { const f = 700 + (k * 7919 % 5) * 160 + R() * 40; this.cue(w, (x) => this.struck(x, f, 0.012 * lv, bus, [[1, 1, 0.5], [2.4, 0.5, 0.3], [4.1, 0.2, 0.2]])); w += 0.4 + R() * 1.4; }
    return w - t + 0.6;
  },
  /** Swallows over the roofs: quick twittering, rising and falling, a few chips between. */
  cqSwallow(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) { const f = 3400 + R() * 1400; this.tone(w, [[0, f], [0.04, f * 1.3], [0.09, f * 0.9]], 0.1, 0.006 * lv, bus, 'triangle'); w += 0.07 + R() * 0.12; }
    return w - t + 0.2;
  },
  /** Crows about the church's ridge at twilight: hoarse caws, a few, one answering another. */
  cqCrow(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { const f = 360 + R() * 80; this.tone(w, [[0, f * 1.1], [0.1, f], [0.22, f * 0.8]], 0.26, 0.016 * lv, bus, 'sawtooth', ['bandpass', 900, 2]); w += 0.4 + R() * 0.5; }
    return w - t + 0.4;
  },
  /** House sparrows on the cobbles: a run of rough chirps. */
  cqSparrow(t, bus, lv) {
    const n = 4 + Math.floor(R() * 6), f = 3500 + R() * 1200;
    for (let k = 0; k < n; k++) this.tone(t + k * (0.13 + R() * 0.06), [[0, f], [0.05, f * 0.8]], 0.06, 0.008 * lv, bus, 'triangle');
    return n * 0.17 + 0.2;
  },
};
void hz;

addVoices('voices-conques.js', CQ_VOICES);
