// The placed voices of Borgund about 1250 (docs/settlements/norse-borgund.md, Round 6 §R6.3; src/settlements/norse-borgund/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `nb`; the engine's own voices that suit (the smith's hammer, the kitchen, the owl,
// the sack) are used by the map as they are. All synthesised, no samples. [inferred throughout: no recording of 13th-century life exists. The chant is a
// recitation on one tone in the vowels of Latin with the cadence of a psalm tone; the kulning is the herding call of Scandinavian women as described in the
// dossier's sources (high, carrying, falling), its pitches ours; the lur is a wooden or birch-bark herding horn, its timbre ours. The trades are those the
// dossier names for the tun: the quern, the warp-weighted loom, the byre, the forge, the woodpile, the washing at the river, the landing.]
import { addVoices } from './voices.js';

const R = Math.random;
/** 0…1: how much of the summer pasture season it is (doy 120–280; the beasts are at the summer farms, the milking calls are heard), a smooth ramp at each end. */
const summer = (m) => { const d = m.seasonDoy?.() ?? 180; return Math.max(0, Math.min(1, (d - 110) / 25, (290 - d) / 25)); };

export const NB_VOICES = {
  /** The Lærdalselvi over its stones: a steep glacial river, a broad roar with a harder hiss above and the rumble of rolled stones below. */
  nbRiver(t, bus, lv) {
    const d = 9 + R() * 4;
    this.rasp(t, d, 520 + R() * 200, 0.5, 0.034 * lv, bus, 6 + R() * 4, 0.5);
    this.rasp(t + 0.3, d - 0.6, 2600, 0.6, 0.014 * lv, bus, 13, 0.7);
    this.rasp(t, d, 160, 0.6, 0.026 * lv, bus, 2.5, 0.4);
    if (R() < 0.6) this.cue(t + 2 + R() * (d - 4), (x) => { this.knock(x, 130 + R() * 60, 0.03 * lv, bus, 0.16); this.knock(x + 0.2, 170, 0.02 * lv, bus, 0.1); });     // a stone shifting in the bed
    return d;
  },
  /** The hearth in a smoke-room house: the small pops of burning logs, the long settle of embers, a hiss of resin. */
  nbHearth(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + R() * 4, (x) => this.burst(x, 0.03 + R() * 0.05, 1500 + R() * 2000, 1.6, 0.03 * lv, bus));
    this.rasp(t, 2.6, 3400, 0.6, 0.006 * lv, bus, 28, 0.9);
    this.cue(t + 1 + R() * 2, (x) => this.knock(x, 110, 0.02 * lv, bus, 0.14));        // a log falling in on itself
    return 4.5;
  },
  /** The rotary quern: the upper stone turned by its handle, a long grating rumble that rises and falls with each turn, grain trickling. */
  nbQuern(t, bus, lv) {
    const turns = 8 + Math.floor(R() * 8), T = 0.9 + R() * 0.2;
    for (let k = 0; k < turns; k++) this.rasp(t + k * T, T * 0.9, 240 + R() * 60, 0.8, 0.026 * lv, bus, 7, 0.9);
    this.rasp(t, turns * T, 2400, 0.7, 0.007 * lv, bus, 26, 0.9);
    return turns * T + 0.4;
  },
  /** The warp-weighted loom: the wooden sword beating the weft up (a dull, hollow tak), the soapstone weights clicking together, a pause for the pick. */
  nbLoom(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 7 + Math.floor(R() * 7); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 300, 0.05 * lv, bus, 0.09); this.knock(x + 0.09, 210, 0.03 * lv, bus, 0.07); for (let j = 0; j < 3; j++) this.knock(x + 0.14 + j * 0.05 + R() * 0.03, 1700 + R() * 700, 0.011 * lv, bus, 0.03); });
      w += 1.5 + R() * 0.7;
    }
    return w - t + 0.5;
  },
  /** The threshing flail on the barn's plank floor: the hinged swingle falling flat, pairs of knocks, in time, with the grain's hiss between. */
  nbFlail(t, bus, lv) {
    if (summer(this) > 0.8) return 0.2;            // the corn is threshed after harvest, not in the pasture months
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { this.cue(w, (x) => { this.knock(x, 170, 0.06 * lv, bus, 0.1); this.knock(x + 0.07, 520, 0.02 * lv, bus, 0.04); }); w += 0.52 + (k % 2 ? 0.08 : 0) + R() * 0.03; }
    this.rasp(t, w - t, 3000, 0.7, 0.005 * lv, bus, 12, 0.8);
    return w - t + 0.4;
  },
  /** A beast in its stall: hooves shifting on planks, a blown breath, the chain, the munch of hay. */
  nbStall(t, bus, lv) {
    this.cue(t, (x) => { this.knock(x, 120, 0.04 * lv, bus, 0.12); this.knock(x + 0.3, 140, 0.03 * lv, bus, 0.1); });
    this.cue(t + 1.2 + R() * 1.5, (x) => this.burst(x, 0.5, 900, 0.7, 0.014 * lv, bus, 0.1));
    this.rasp(t + 2, 3 + R() * 2, 2000, 0.6, 0.009 * lv, bus, 4.5, 0.8);
    this.cue(t + 2.4, (x) => this.struck(x, 1350, 0.006 * lv, bus, [[1, 1, 0.3], [2.3, 0.4, 0.2]]));
    return 6;
  },
  /** The forge's bellows: the leather's long breath in and out, the fire's roar swelling with each, the coals' crackle. */
  nbBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 0.55, 1200, 0.5, 0.022 * lv, bus, 5, 0.7); this.rasp(w + 0.5, 0.7, 380, 0.6, 0.016 * lv, bus, 4, 0.5); w += 1.3 + R() * 0.2; }
    for (let k = 0; k < 6; k++) this.cue(t + R() * (w - t), (x) => this.burst(x, 0.04, 2500 + R() * 1500, 1.4, 0.02 * lv, bus));
    return w - t + 0.4;
  },
  /** The axe at the block: a bite into wood, the log's crack as it parts, the halves falling; two or three logs. */
  nbChop(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 330, 0.07 * lv, bus, 0.07); this.burst(x, 0.05, 1900, 1, 0.03 * lv, bus); });
      if (R() < 0.6) this.cue(w + 0.55, (x) => { this.knock(x, 280, 0.06 * lv, bus, 0.07); this.burst(x + 0.01, 0.08, 1200, 1.2, 0.03 * lv, bus); this.knock(x + 0.12, 190, 0.03 * lv, bus, 0.09); });
      w += 1.8 + R() * 1.4;
    }
    return w - t + 0.5;
  },
  /** Linen washed at the river's edge: cloth rubbed and wrung, wet slaps on a flat stone, water poured, a woman's low talk. */
  nbWash(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.5, 1500, 0.6, 0.012 * lv, bus, 10, 0.8); this.cue(w + 0.5, (x) => { this.burst(x, 0.1, 480 + R() * 120, 1.1, 0.038 * lv, bus); this.knock(x, 190, 0.02 * lv, bus, 0.08); }); w += 0.95 + R() * 0.45; }
    this.cue(t + 2, (x) => this.cry(x, 190 * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [2, 0.4, 'a'], [-1, 0.6, 'o']], 0.012 * lv, bus, { cutoff: 1800, fem: true }));
    return w - t + 0.6;
  },
  /** The herding call (kulning) from a summer farm: a very high, sustained women's voice, a rise with a swell, long falling cadences with small turns, answered far off. */
  nbKulning(t, bus, lv) {
    const s = summer(this); if (s < 0.2) return 0.3;
    const f = 760 + R() * 120;
    const call = [[0, 0.7, 'a'], [5, 1.5, 'a'], [7, 1.1, 'e'], [5, 0.5, 'a'], [3, 0.6, 'a'], [0, 1.2, 'o'], [-2, 1.8, 'o']];
    this.cue(t, (x) => this.cry(x, f, call, 0.04 * lv * s, bus, { cutoff: 4200, fem: true }));
    this.cue(t + 0.02, (x) => this.cry(x, f * 2.005, call.map(([a, d, v]) => [a, d, v]), 0.008 * lv * s, bus, { cutoff: 5200, fem: true }));
    const d = call.reduce((a, n) => a + n[1], 0);
    this.cue(t + d + 2.5, (x) => this.cry(x, f * 0.9, call.slice(1, 6), 0.012 * lv * s, bus, { cutoff: 2600, fem: true }));    // an answer, thin with distance
    return d + 6;
  },
  /** The lur, a wooden or birch-bark herding horn: two or three long notes on its low harmonics, a rough nasal edge, the last one falling. */
  nbLur(t, bus, lv) {
    const f = 196 * (0.96 + R() * 0.08);
    let w = t;
    for (const [m, d] of [[1, 1.4], [1.5, 1.0], [1, 2.0]].slice(0, 2 + Math.floor(R() * 2))) {
      this.tone(w, [[0, f * m * 0.96], [0.12, f * m], [d, f * m * (d > 1.9 ? 0.93 : 1)]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * m * 3, 1.2]);
      this.tone(w, [[0, f * m * 2], [d, f * m * 2]], d, 0.008 * lv, bus, 'triangle');
      w += d + 0.5;
    }
    return w - t + 1.5;
  },
  /** The bells of cattle at pasture (iron and bronze, low and dull against the sheep's): a few clanks, each its own note, as the beasts graze. */
  nbCowBell(t, bus, lv) {
    const s = summer(this); if (s < 0.2) return 0.3;
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) { const f = 430 + (k * 7919 % 4) * 90 + R() * 30; this.cue(w, (x) => this.struck(x, f, 0.014 * lv * s, bus, [[1, 1, 0.6], [2.4, 0.5, 0.35], [4.3, 0.2, 0.2]])); w += 0.5 + R() * 1.8; }
    return w - t + 0.7;
  },
  /** Plainchant in the church: the priest alone, a recitation on a tone in the vowels of Latin, the half-cadence at each verse's middle and the close; the nave's own answer in the reverb. */
  nbChant(t, bus, lv) {
    const root = 98, T = 4, V = ['a', 'e', 'u', 'o', 'i', 'o', 'e', 'a'];       // G2: a priest's voice
    let w = t;
    const verses = 2 + Math.floor(R() * 3);
    for (let v = 0; v < verses; v++) {
      const n = 12 + Math.floor(R() * 8), notes = [[T - 2, 0.55, 'o'], [T - 1, 0.35, 'e']];
      for (let k = 0; k < n; k++) notes.push([T, 0.28 + R() * 0.05, V[(k + v) % V.length]]);
      notes.push([T - 2, 0.4, 'e'], [T - 4, 0.4, 'u'], [T - 4, 1.0, 'o']);
      this.cue(w, (x) => this.cry(x, root, notes, 0.034 * lv, bus, { cutoff: 1700 }));
      w += notes.reduce((a, q) => a + q[1], 0) + 1.6;
    }
    return w - t + 1.5;
  },
  /** A walking party on the trodden track: soles on packed earth, the stir of cloth and a wordless low murmur between two or three. */
  nbWalkers(t, bus, lv, f) {
    const dur = f.dur, pace = 0.64, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace * (1 + (R() - 0.5) * 0.1), (x) => this.step(x, 0.04 * lv, bus, 'cloth', 0.15));
    for (let k = 0; k < 2 && 1.5 + k * 6 < dur - 2; k++) this.cue(t + 1.5 + k * 6, (x) => this.cry(x, 120 * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [2, 0.45, 'a'], [-2, 0.6, 'e'], [0, 0.5, 'o']], 0.016 * lv, bus, { cutoff: 1600 }));
    return dur;
  },
  /** A packhorse with its load on the track from the river: slow hooves on earth, the straps' creak, a bell. */
  nbPack(t, bus, lv, f) {
    const dur = f.dur, pace = 0.8, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.knock(x, 230, 0.03 * lv, bus, 0.07); this.knock(x + 0.2, 270, 0.025 * lv, bus, 0.06); if (k % 3 === 0) this.struck(x, 900, 0.006 * lv, bus, [[1, 1, 0.5], [2.5, 0.3, 0.2]]); });
    this.cue(t + 0.4, (x) => this.creak(x, 0.5 * lv, bus, true));
    return dur;
  },
  /** The landing on the river: a boat's strakes and the mooring rope creaking against the post as the water pushes, a wet slap on the planking. */
  nbMoor(t, bus, lv) {
    this.cue(t, (x) => this.creak(x, 0.7 * lv, bus, true)); this.cue(t + 1.8, (x) => this.creak(x, 0.6 * lv, bus, false));
    for (let k = 0; k < 3; k++) this.cue(t + 0.5 + k * 1.3 + R() * 0.4, (x) => { this.burst(x, 0.14, 420, 1, 0.022 * lv, bus); this.knock(x, 150, 0.02 * lv, bus, 0.1); });
    return 4.5;
  },
  /** Swallows over the yards: quick twittering, rising and falling. */
  nbSwallow(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) { const f = 3300 + R() * 1400; this.tone(w, [[0, f], [0.04, f * 1.3], [0.09, f * 0.9]], 0.1, 0.006 * lv, bus, 'triangle'); w += 0.07 + R() * 0.12; }
    return w - t + 0.2;
  },
  /** Hooded crows about the church's roofs: hoarse caws, one answering another. */
  nbCrow(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { const f = 340 + R() * 80; this.tone(w, [[0, f * 1.1], [0.1, f], [0.22, f * 0.8]], 0.27, 0.016 * lv, bus, 'sawtooth', ['bandpass', 900, 2]); w += 0.4 + R() * 0.5; }
    return w - t + 0.4;
  },
  /** House sparrows in the yards: a run of rough chirps. */
  nbSparrow(t, bus, lv) {
    const n = 4 + Math.floor(R() * 6), f = 3400 + R() * 1200;
    for (let k = 0; k < n; k++) this.tone(t + k * (0.13 + R() * 0.06), [[0, f], [0.05, f * 0.8]], 0.06, 0.008 * lv, bus, 'triangle');
    return n * 0.17 + 0.2;
  },
};
export const NB_GAIN = {};

addVoices('voices-norse-borgund.js', NB_VOICES, NB_GAIN);
