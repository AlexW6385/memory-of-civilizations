// The voices of Baroque Rome about 1670 that no other place has (docs/settlements/baroque-rome.md §6): Bernini's and Maderno's fountains in the piazza,
// the floating ship-mills of the Tiber, a gala coach over the setts, the confraternity's litany in a procession, the water-seller's and the pedlars' cries, the
// Swiss halberdiers' stamp, rosary beads at the medal-seller's, the night patrol of the Borgo. Each is a method `name(t, bus, lv[, track])` made from the
// engine's own tools (rasp, burst, tone, knock, clink, creak, cry, struck, step) as the other voices are, and returns how long it lasts. Wordless, as
// the street cries are: vowels on a contour. Every name begins `brm` (voices.js refuses a name defined twice). [inferred throughout: no recording of Rome
// in 1670 exists; what each sound is of, and when, is in the dossier §6.]
import { addVoices } from '../../engine/voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

/** The calls of the street trades: [semitones above the voice's base, seconds, vowel]; the acquarolo's long fall, the fruit-seller's climb, the chestnut-man's two notes. */
export const BRM_CRIES = [
  [[7, 0.3, 'a'], [4, 0.3, 'a'], [0, 1.2, 'o'], [-2, 0.6, 'o']],                       // the water-seller's: from high to low, held
  [[0, 0.3, 'a'], [2, 0.3, 'a'], [4, 0.3, 'e'], [7, 1.0, 'i'], [5, 0.5, 'a']],         // the fruit-seller's: a climb
  [[5, 0.25, 'o'], [5, 0.25, 'o'], [0, 0.35, 'a'], [0, 0.9, 'u']],                     // a call of two notes, repeated, and a fall
  [[0, 0.5, 'o'], [3, 0.35, 'o'], [0, 0.35, 'a'], [-3, 1.1, 'a']],                     // the old-clothes man's: low, a rock and a fall
];

/** The recitation tone of a litany: leader's phrase and the answer, wordless, on one note and its second. */
const PHRASES = [[[0, 0.55, 'o'], [0, 0.4, 'e'], [2, 0.4, 'e'], [0, 0.9, 'a']], [[0, 0.5, 'a'], [0, 0.5, 'o'], [-2, 0.5, 'o'], [0, 1.0, 'o']]];

const V = {
  /** Maderno's fountain in the piazza (and its twin): water leaping from the upper bowl and falling in sheets into the wide basin — a broad, steady rush with a bright top and a low body, drops pocking the basin. Long enough that one overlaps the next. */
  brmFountain(t, bus, lv) {
    const dur = 14;
    this.rasp(t, dur, 1900, 0.6, 0.03 * lv, bus, 23, 0.55);
    this.rasp(t, dur, 650, 0.5, 0.02 * lv, bus, 5, 0.5);
    this.rasp(t, dur, 4300, 0.8, 0.008 * lv, bus, 31, 0.5);
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) this.cue(t + 0.4 + R() * (dur - 1), (x) => this.tone(x, [[0, 800 + R() * 600], [0.05, 1600 + R() * 500]], 0.06, 0.012 * lv, bus, 'sine'));
    return dur;
  },
  /** A ship-mill moored in the Tiber: the undershot wheel's paddles striking the stream in turn (a slap and a wash a second), the hull's timbers creaking, the gear's low knock. */
  brmMill(t, bus, lv) {
    const dur = 13, T = 0.8 + R() * 0.15;
    this.rasp(t, dur, 750, 0.6, 0.045 * lv, bus, 1 / T, 0.7);
    this.rasp(t, dur, 1700, 0.8, 0.02 * lv, bus, 1 / T, 0.8);
    for (let w = t + 0.2; w < t + dur - 0.5; w += T) this.cue(w, (x) => { this.burst(x, 0.09, 900, 0.9, 0.05 * lv, bus, 0.01); this.tone(x, [[0, 120], [0.1, 70]], 0.12, 0.008 * lv, bus, 'sine'); });
    for (let w = t + 1.5; w < t + dur - 1; w += 3 + R() * 2) this.cue(w, (x) => this.creak(x, lv * 0.6, bus, R() < 0.5));
    for (let w = t + 0.6; w < t + dur - 1; w += 1.6 + R() * 0.4) this.cue(w, (x) => this.knock(x, 150, 0.022 * lv, bus, 0.1));
    return dur;
  },
  /** A coach at a walk along `f.pts`: the iron-shod hoofs of the pair, four beats a stride, over the setts; the wheels' grinding rumble and the body's creak on its leather braces; the harness's small jingle; the coachman's word now and then. */
  brmCoach(t, bus, lv, f) {
    const dur = f.dur, beat = 0.27 + R() * 0.04, n = Math.floor(dur / beat);
    for (let k = 0; k < n; k++) this.cue(t + k * beat, (x) => {
      const hi = k % 2 ? 1 : 0.8;
      this.burst(x, 0.03, 1900 + 250 * (k % 4), 1, 0.05 * lv * hi, bus); this.knock(x, 290 - 30 * (k % 3), 0.04 * lv, bus, 0.07);
      if (k % 2 === 0) { this.burst(x + 0.03, 0.025, 2300, 1, 0.03 * lv, bus); this.knock(x + 0.03, 330, 0.025 * lv, bus, 0.06); }
    });
    this.rasp(t, dur, 190, 0.7, 0.035 * lv, bus, 6.5, 0.7);
    this.rasp(t, dur, 900, 0.6, 0.012 * lv, bus, 14, 0.6);
    for (let w = t + 0.8; w < t + dur - 0.5; w += 2 + R() * 1.6) this.cue(w, (x) => this.creak(x, lv * 0.8, bus, R() < 0.5));
    for (let w = t + 0.5; w < t + dur - 0.5; w += 0.9 + R() * 0.5) this.cue(w, (x) => this.clink(x, 0.006 * lv, bus));
    if (R() < 0.5) this.cue(t + dur * (0.3 + 0.3 * R()), (x) => this.cry(x, 118 * (0.92 + R() * 0.16), [[0, 0.3, 'e'], [3, 0.5, 'o'], [0, 0.6, 'o']], 0.04 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** The brothers of a confraternity in procession along `f.pts` (a cross and gonfaloni, a handbell): a leader's phrase on a recitation tone and the file's answer, a hand-bell struck now and then, the shuffle of many feet. */
  brmLitany(t, bus, lv, f) {
    const dur = f.dur, f0 = 112 * (0.94 + R() * 0.12);
    for (let w = t + 0.5, k = 0; w < t + dur - 2.5; w += 6.2 + R() * 1.2, k++) {
      const ph = PHRASES[k % 2], len = ph.reduce((s, n) => s + n[1], 0);
      this.cue(w, (x) => this.cry(x, f0, ph, 0.05 * lv, bus, { cutoff: 2600 }));
      this.cue(w + len + 0.4, (x) => { for (const dv of [0, 0.01, -0.012]) this.cry(x + 0.01, f0 * (0.99 + dv * 4), PHRASES[(k + 1) % 2], 0.03 * lv, bus, { cutoff: 2300 }); });
    }
    for (let w = t + 1; w < t + dur - 1; w += 2.4 + R() * 1.2) this.cue(w, (x) => this.struck(x, 1350 + R() * 120, 0.016 * lv, bus, [[1, 1, 0.5], [2.7, 0.35, 0.25]]));
    this.rasp(t, dur, 700, 0.5, 0.01 * lv, bus, 3.2, 0.7);
    return dur;
  },
  /** A street cry, sung two or three times, along a street (with `f`) or from where the seller stands. */
  brmCry(t, bus, lv, f) {
    const c = pick(BRM_CRIES), f0 = 112 + R() * 40, n = f ? Math.max(1, Math.min(3, Math.floor(f.dur / 6))) : 1 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 5.5, (x) => this.cry(x, f0 * (1 + 0.02 * k), c, 0.05 * lv, bus, { cutoff: 3600 }));
    return f ? f.dur : n * 5.5;
  },
  /** The Swiss halberdiers at the change of guard: four men's measured steps on the paving, the butts of the halberds grounded together, a short order. */
  brmHalberd(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.55, (x) => { this.step(x, 0.05 * lv, bus, 'cloth', 0.2); this.step(x + 0.015, 0.04 * lv, bus, 'cloth', 0); });
    for (let k = 0; k < 2; k++) this.cue(t + 4.8 + k * 0.45, (x) => { this.knock(x, 135, 0.07 * lv, bus, 0.12); this.burst(x, 0.03, 3000, 1.2, 0.03 * lv, bus); });
    this.cue(t + 4.2, (x) => this.cry(x, 125, [[0, 0.25, 'a'], [0, 0.45, 'e']], 0.04 * lv, bus, { cutoff: 3000 }));
    return 6;
  },
  /** Rosary beads and medals handled at the counter: a run of small wooden ticks, a slide, a pause, the clink of a medal on the board. */
  brmBeads(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 7); k < n; k++) { const d = w; this.cue(d, (x) => this.knock(x, 1500 + R() * 400, 0.018 * lv, bus, 0.03)); w += k % 5 === 4 ? 0.5 : 0.1 + R() * 0.1; }
    this.cue(w, (x) => this.burst(x, 0.25, 3600, 0.8, 0.008 * lv, bus, 0.05));
    this.cue(w + 0.5, (x) => this.clink(x, 0.012 * lv, bus));
    return w - t + 1.2;
  },
  /** The patrol of the Borgo at night along `f.pts`: two men's steps a little out of time, a scabbard's clink, the chain of a lantern, a low challenge now and then. */
  brmPatrol(t, bus, lv, f) {
    const dur = f.dur, pace = 0.6, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => {
      this.step(x, 0.05 * lv, bus, 'cloth', 0.15); this.step(x + 0.08 + R() * 0.05, 0.042 * lv, bus, 'cloth', 0);
      if (k % 3 === 2) this.clink(x + 0.04, 0.012 * lv, bus);
      if (k % 5 === 4) this.creak(x + 0.1, lv * 0.35, bus, true);
    });
    if (R() < 0.6) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 112, [[0, 0.3, 'i'], [0, 0.35, 'a'], [-2, 0.5, 'a']], 0.04 * lv, bus, { cutoff: 2600 }));
    return dur;
  },
};
addVoices('baroque-rome/voices.js', V, { brmFountain: 1.1, brmMill: 1.2, brmCoach: 1.1, brmLitany: 1.2 });
export const BRM_VOICES = Object.keys(V);
