// The placed voices of Delphi about 400 BC (docs/settlements/delphi.md §15.3; src/settlements/delphi/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `dl`; the engine's own voices that suit (the mason's mallet, the hand-mill,
// the jar filled at the spout, the herald, the aulos and the kithara of Athens, the wreath-sellers' cry, the potter's wheel, the smith's hammer, the kitchen,
// the jars' lids, the little owl) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of ancient Greece exists; the sounds are those the dossier names: the spring into its
// basin, the paean of the processions (a wordless hymn on the Dorian species), the pine fire of Apollo's hearth, the choughs of the Phaedriades, the goats and
// their bells, the warp-weighted loom, the runners in the stadium. The pitches and patterns are ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);

export const DL_VOICES = {
  /** The Castalian spring from its lion-head spouts into the basin: a breath of falling water, a lighter patter over it, now and then a drop. More in the wet months. */
  dlSpring(t, bus, lv) {
    const wet = 0.6 + 0.4 * Math.max(inSeason(seasonDoy(this), 300, 120, 20), 0), d = 6 + R() * 3;
    this.rasp(t, d, 1400 + R() * 400, 0.55, 0.02 * lv * wet, bus, 10 + R() * 4, 0.5);
    this.rasp(t + 0.2, d - 0.5, 3600, 0.8, 0.007 * lv * wet, bus, 21, 0.8);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + R() * (d - 0.5), (x) => this.tone(x, [[0, 1500 + R() * 800], [0.05, 2300 + R() * 900]], 0.08, 0.006 * lv, bus, 'sine'));
    return d;
  },
  /** The paean of a procession: a few men's voices (wordless) singing the same phrase on the Dorian species, a hair apart, rising, held, and falling to the tonic; twice. */
  dlPaean(t, bus, lv) {
    const f0 = 118 * (0.94 + R() * 0.12), line = [[0, 0.5, 'e'], [3, 0.45, 'a'], [7, 0.45, 'a'], [8, 0.9, 'a'], [5, 0.45, 'e'], [3, 0.5, 'o'], [1, 0.4, 'o'], [0, 1.6, 'o']];
    const len = line.reduce((s, c) => s + c[1], 0);
    for (let rep = 0; rep < 2; rep++) for (let v = 0; v < 4; v++) this.cue(t + rep * (len + 1.2) + v * 0.04 + R() * 0.05, (x) => this.cry(x, f0 * [1, 1.005, 0.995, 0.5][v], line, 0.03 * lv, bus, { cutoff: 2600, fem: false }));
    return 2 * len + 1.8;
  },
  /** A goat's bleat, trembling, and often a second's; the nasal "meh" of the herd on the slope or in the pen. */
  dlGoat(t, bus, lv) {
    const n = 1 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const f = 340 + R() * 220;
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.1, f * 1.12], [0.55, f * 0.9]], 0.6, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1150, 1.6]); this.burst(x, 0.5, 1700, 1.2, 0.006 * lv, bus, 0.04); });
      w += 0.8 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** The flock's bells: small iron clanks of three or four bells out of step, as the goats graze and move. */
  dlBell(t, bus, lv) {
    const fs = [0, 1, 2].map(() => 900 + R() * 900);
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 7); k < n; k++) {
      const f = fs[Math.floor(R() * fs.length)];
      this.cue(w, (x) => this.struck(x, f, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.45, 0.3], [4.2, 0.2, 0.15]]));
      w += 0.3 + R() * 0.8;
    }
    return w - t + 0.6;
  },
  /** The choughs of the Phaedriades: a flock's high, ringing "kyaa", falling, one after another, from far up the cliffs. */
  dlChough(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) {
      const f = 1700 + R() * 500;
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.05, f * 1.15], [0.28, f * 0.62]], 0.3, 0.012 * lv, bus, 'sawtooth', ['bandpass', 2400, 2.2]); this.burst(x, 0.15, 3200, 1.5, 0.004 * lv, bus, 0.01); });
      w += 0.25 + R() * 0.7;
    }
    return w - t + 0.4;
  },
  /** The warp-weighted loom: the weaver beats the weft up with the comb, the clay weights knocking softly together at the bottom of the warp, and a pause for the shed. */
  dlLoom(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 260, 0.04 * lv, bus, 0.08); this.knock(x + 0.06, 380, 0.025 * lv, bus, 0.05); this.rasp(x + 0.12, 0.25, 2400, 1.2, 0.006 * lv, bus, 30, 0.6); });
      w += 1.0 + R() * 1.4;
    }
    return w - t + 1;
  },
  /** The fire of pine: the soft roar of the flame, with the crackle and the pops of resin, sparse. */
  dlFire(t, bus, lv) {
    const d = 5 + R() * 3;
    this.rasp(t, d, 500 + R() * 200, 0.5, 0.008 * lv, bus, 6 + R() * 3, 0.5);
    for (let k = 0, n = 6 + Math.floor(R() * 10); k < n; k++) this.cue(t + R() * d, (x) => this.burst(x, 0.02 + R() * 0.03, 2200 + R() * 2600, 1.4, 0.014 * lv, bus));
    return d;
  },
  /** The murmur of those waiting before the temple: many voices at no one pitch, a low swell and fall, a cough, a name called. */
  dlMurmur(t, bus, lv) {
    const d = 7 + R() * 4;
    this.rasp(t, d, 340 + R() * 80, 0.8, 0.012 * lv, bus, 2.2 + R() * 1.5, 0.6);
    this.rasp(t + 0.4, d - 0.8, 760, 0.9, 0.006 * lv, bus, 3.1, 0.7);
    if (R() < 0.5) this.cue(t + 1 + R() * (d - 2), (x) => this.cry(x, 135 + R() * 30, [[0, 0.3, 'o'], [3, 0.5, 'a']], 0.012 * lv, bus, { cutoff: 2200, fem: false }));
    return d;
  },
  /** The runners at their training on the earthen track: bare feet in quick soft strokes that grow and fade as they pass, the trainer's short call. */
  dlRunners(t, bus, lv) {
    const n = 14 + Math.floor(R() * 10), gap = 0.2 + R() * 0.04;
    for (let k = 0; k < n; k++) { const a = Math.sin(Math.PI * (k + 1) / (n + 1)); this.cue(t + k * gap, (x) => this.knock(x, 140 + R() * 40, 0.02 * lv * (0.3 + a), bus, 0.05)); }
    this.cue(t + n * gap * 0.3, (x) => this.cry(x, 150 + R() * 20, [[0, 0.25, 'a'], [4, 0.5, 'e']], 0.025 * lv, bus, { cutoff: 2800, fem: false }));
    return n * gap + 0.6;
  },
};
/** Loudness relative to each voice's own scale: tuned by tools/sound-render.mjs (about 4.5e-3 RMS at the source). */
export const DL_GAIN = { dlSpring: 3.2, dlPaean: 1.0, dlGoat: 3.0, dlBell: 1.5, dlChough: 3.2, dlLoom: 1.8, dlFire: 3.5, dlMurmur: 3.0, dlRunners: 2.5 };

addVoices('voices-delphi.js', DL_VOICES, DL_GAIN);
