// The voices of Lhasa in 1694 that no other place has (docs/settlements/lhasa.md §19): the long horns and the monastic orchestra of the Potala, the monks'
// low chant in the halls, the mantra murmured by pilgrims, a hand prayer wheel and the row of fixed wheels turning with their bells, a pilgrim prostrating
// with wooden pads on the stones, prayer flags snapping in the wind, the churn of the tea house and its bowls, the balance of a trading house, the printers'
// roller and whipped sheet, the juniper fire of the incense burner, a yak and the bells of a yak caravan, the chained mastiff of a gate, the murmur of a
// stall. Each is a method `name(t, bus, lv[, track])` made from the engine's own tools (rasp, burst, tone, knock, clink, struck, step, cry, conch, horn,
// strike, gong, templeBell, cue) as the other voices are, and returns how long it lasts. Wordless, as street calls are: vowels on a contour. Every
// name begins `lhs` (voices.js refuses a name defined twice). [inferred throughout: no recording of Lhasa in 1694 exists; what each sound is of, and when,
// is in the dossier §19.]
import { addVoices } from '../../engine/voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

/** The mantra's six syllables (om ma ni pad me hum) as vowels on one held note, the last falling a little. */
const MANI = [[0, 0.34, 'o'], [0, 0.28, 'a'], [0, 0.3, 'i'], [0, 0.28, 'a'], [0, 0.3, 'e'], [-2, 0.62, 'u']];
/** The gyaling's phrases (semitones over the tonic of the horns' drone): a rising run, a held note with a turn, a fall. */
const GYALING = [[[0, 0.5], [2, 0.3], [3, 0.3], [7, 0.9], [5, 0.3], [7, 0.3], [9, 1.3]], [[9, 0.8], [7, 0.3], [9, 0.3], [12, 1.4], [9, 0.4], [7, 0.4], [3, 1.0]], [[7, 0.4], [5, 0.4], [3, 0.4], [2, 0.4], [0, 1.6]]];

const V = {
  /** The long horns (dungchen) from the roofs of the Potala at dawn and dusk: pairs of low buzzing notes, each swelling and dying over six seconds, answering one another a tone apart; a conch at the end. About thirty-five seconds. */
  lhsDungchen(t, bus, lv) {
    const base = 57 + (R() < 0.5 ? 0 : 1);
    for (let k = 0; k < 4; k++) {
      this.horn(t + k * 7.4, base + (k % 2 ? 4 : 0), 6.6, 0.034 * lv, bus);
      if (k % 2 === 0) this.horn(t + k * 7.4 + 0.5, base - 1, 6.2, 0.02 * lv, bus);
    }
    this.conch(t + 31, 0.018 * lv, bus);
    return 36;
  },
  /** The monastic orchestra in the Deyang Shar (or before a hall): a pair of gyaling (the loud double-reed oboes) playing a phrase over the long horns' drone, the great drum and the cymbals marking an uneven beat, a bell at the phrase's end. About eighteen seconds. */
  lhsGyaling(t, bus, lv) {
    const f0 = 233 * (0.98 + R() * 0.04), hz = (s) => f0 * Math.pow(2, s / 12);
    this.horn(t, 55, 14, 0.016 * lv, bus);
    let w = t + 1.2;
    for (const ph of [pick(GYALING), pick(GYALING)]) {
      for (const [s, d] of ph) {
        const f = hz(s);
        this.cue(w, (x) => {
          this.tone(x, [[0, f * 0.985], [0.05, f], [d, f * 1.005]], d + 0.05, 0.03 * lv, bus, 'sawtooth', ['bandpass', f * 2.2, 1.6]);
          this.tone(x, [[0, f * 1.52], [d, f * 1.5]], d + 0.05, 0.012 * lv, bus, 'sawtooth', ['bandpass', f * 3.1, 2]);
        });
        w += d * 0.85;
      }
      w += 0.6;
    }
    for (let k = 0, n = Math.floor((w - t) / 1.1); k < n; k++) this.cue(t + 1 + k * 1.1 + R() * 0.12, (x) => {
      if (k % 4 === 0) { this.tone(x, [[0, 88], [0.4, 52]], 0.9, 0.06 * lv, bus, 'sine'); this.burst(x, 0.07, 380, 1, 0.03 * lv, bus); }
      else if (k % 2) { this.burst(x, 0.05, 2400, 1.2, 0.03 * lv, bus); this.struck(x, 3900 + R() * 400, 0.006 * lv, bus, [[1, 1, 0.25], [1.7, 0.5, 0.15]]); }
    });
    this.cue(w + 0.4, (x) => this.templeBell(x, 620, 0.012 * lv, bus, 0.6));
    return w - t + 3;
  },
  /** The monks' chant in a hall: a low drone of many voices in a fifth, a leader's phrase over it that rises and settles, swells and falls; the hand bell and the cymbals at the end of a section. About sixteen seconds. */
  lhsChant(t, bus, lv) {
    const dur = 16, f = 62 * (0.97 + R() * 0.06);
    this.tone(t, [[0, f], [dur, f * 0.995]], dur, 0.05 * lv, bus, 'sawtooth', ['lowpass', 240, 1]);
    this.tone(t + 0.4, [[0, f * 1.5], [dur, f * 1.5]], dur - 1, 0.026 * lv, bus, 'sawtooth', ['lowpass', 360, 1]);
    this.tone(t + 1, [[0, f * 2], [dur, f * 2.004]], dur - 2, 0.016 * lv, bus, 'triangle', ['bandpass', 640, 3]);        // the overtone of the throat singing
    for (let k = 0; k < 3; k++) this.cue(t + 1.5 + k * 4.6, (x) => this.cry(x, f * 2 * (1 + 0.01 * k), [[0, 0.7, 'o'], [2, 0.6, 'a'], [3, 0.9, 'o'], [0, 1.6, 'u']], 0.03 * lv, bus, { cutoff: 1500 }));
    this.cue(t + dur - 1.4, (x) => { this.strike(x, 1480, 0.007 * lv, bus, 0.3); this.burst(x + 0.4, 0.06, 2600, 1.4, 0.03 * lv, bus); });
    return dur + 2;
  },
  /** Pilgrims murmuring the mantra as they walk: the six syllables on one low note, over and over, two or three voices out of step, the beads' click between. */
  lhsMani(t, bus, lv) {
    const n = 2 + Math.floor(R() * 2), f0 = 105 + R() * 25;
    for (let v = 0; v < n; v++) for (let r = 0, rounds = 3 + Math.floor(R() * 2); r < rounds; r++)
      this.cue(t + v * 0.55 + r * (2.55 + 0.1 * v), (x) => this.cry(x, f0 * (1 + 0.04 * v), MANI, 0.022 * lv, bus, { cutoff: 1800, fem: v === 2 }));
    for (let k = 0; k < 8; k++) this.cue(t + 0.3 + k * 1.3 + R() * 0.4, (x) => this.struck(x, 2100 + R() * 500, 0.005 * lv, bus, [[1, 1, 0.05]]));
    return 12;
  },
  /** A hand prayer wheel turned by a walker (with `f`) or standing pilgrim: the drum's soft whirr, the weight's little knock on its chain at every turn. */
  lhsHandWheel(t, bus, lv, f) {
    const dur = f ? f.dur : 9, turn = 0.85 + R() * 0.2;
    this.rasp(t, dur, 900, 1, 0.005 * lv, bus, 1 / turn, 0.8);
    for (let w = t + 0.3; w < t + dur - 0.3; w += turn) this.cue(w, (x) => { this.knock(x, 520, 0.008 * lv, bus, 0.03); this.struck(x + 0.02, 1900, 0.003 * lv, bus, [[1, 1, 0.06]]); });
    if (f) for (let w = t + 0.5; w < t + dur - 0.5; w += 0.62 + R() * 0.1) this.cue(w, (x) => this.step(x, 0.018 * lv, bus, 'cloth', 0.1));
    return dur;
  },
  /** The row of fixed wheels along the circuit's north leg, each pushed round by a passing hand: a run of creaking spindles, the bells at the tops ringing once per turn in a ripple down the row. */
  lhsWheelRow(t, bus, lv) {
    const n = 7 + Math.floor(R() * 8), gap = 0.5 + R() * 0.2;
    for (let k = 0; k < n; k++) {
      const w = t + k * gap;
      this.cue(w, (x) => { this.creak(x, lv * 0.28, bus, k % 2 === 0); this.rasp(x + 0.05, 1.4, 1100, 1, 0.006 * lv, bus, 3.5, 0.7); });
      this.cue(w + 1.1, (x) => this.templeBell(x, 1290 * (0.97 + R() * 0.06), 0.006 * lv, bus, 0.18));
    }
    return n * gap + 2.5;
  },
  /** A pilgrim who prostrates the whole way: the long slide of the wooden hand-pads on the stones, the knock of them, the soft fall of the body, the scuff of rising; a murmur; four or five times. */
  lhsProstrate(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 2); k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.45, 1500, 0.9, 0.012 * lv, bus, 7, 0.6); this.knock(x + 0.45, 420, 0.03 * lv, bus, 0.05); });
      this.cue(w + 0.75, (x) => { this.tone(x, [[0, 120], [0.14, 55]], 0.2, 0.045 * lv, bus, 'sine'); this.burst(x, 0.09, 700, 0.8, 0.02 * lv, bus); });
      this.cue(w + 1.8, (x) => { this.rasp(x, 0.7, 900, 0.7, 0.01 * lv, bus, 5, 0.8); this.step(x + 0.5, 0.02 * lv, bus, 'cloth', 0.1); });
      if (k === 1) this.cue(w + 1.1, (x) => this.cry(x, 118, MANI.slice(0, 3), 0.016 * lv, bus, { cutoff: 1600 }));
      w += 4.1 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** Prayer flags in the wind, on a string or from a roof's pole: cloth cracking in gusts, a run of snaps and a flutter between; louder and more of them as the wind rises. */
  lhsFlags(t, bus, lv) {
    const wd = Math.min(1, 0.2 + (this.wind || 0) * 1.5), dur = 9;
    this.rasp(t, dur, 2400, 0.7, 0.007 * lv * wd, bus, 14, 0.9);
    for (let g = 0, ng = 1 + Math.floor(wd * 4); g < ng; g++) {
      const g0 = t + R() * (dur - 3);
      for (let k = 0, n = 3 + Math.floor(R() * (3 + 6 * wd)); k < n; k++) this.cue(g0 + k * (0.05 + R() * 0.09), (x) => this.burst(x, 0.025 + R() * 0.03, 2300 + R() * 2600, 1.1, 0.02 * lv * (0.3 + 0.7 * wd) * (0.5 + R()), bus));
    }
    return dur;
  },
  /** The wooden churn of a tea house: the plunger driven down and drawn up in a steady beat, the slosh under it, a knock of the staff on the rim. */
  lhsChurn(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.34, 520, 0.8, 0.02 * lv, bus, 6, 0.7); this.knock(x + 0.3, 260, 0.014 * lv, bus, 0.04); });
      this.cue(w + 0.55, (x) => this.rasp(x, 0.3, 780, 0.9, 0.012 * lv, bus, 9, 0.8));
      w += 1.1 + R() * 0.1;
    }
    return w - t + 1;
  },
  /** The tea house: wooden bowls set down and a ladle of tea poured into them, a slurp, a low murmur of two or three voices on the benches, the kettle's lid. */
  lhsTeaBowl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 330 + R() * 60, 0.018 * lv, bus, 0.05); this.burst(x + 0.1, 0.5, 1200, 0.9, 0.012 * lv, bus, 0.05); });
      this.cue(w + 0.9, (x) => this.cry(x, (k % 2 ? 190 : 118) * (0.95 + R() * 0.1), pick([[[0, 0.3, 'o'], [2, 0.3, 'a'], [0, 0.4, 'u']], [[0, 0.25, 'a'], [-2, 0.45, 'o']]]), 0.02 * lv, bus, { cutoff: 2200, fem: k % 3 === 1 }));
      w += 1.8 + R() * 1.6;
    }
    this.cue(w, (x) => this.struck(x, 640, 0.008 * lv, bus, [[1, 1, 0.2], [2.4, 0.4, 0.1]]));
    return w - t + 1.5;
  },
  /** A trading house: the beam balance's chain and pans, a handful of barley poured into a bowl, a coin on the counter, a bargaining murmur. */
  lhsScale(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 2300, 0.008 * lv, bus, [[1, 1, 0.08], [1.5, 0.5, 0.06]]); this.rasp(x + 0.1, 0.4, 3000, 1, 0.008 * lv, bus, 15, 0.7); });
    this.cue(t + 1.2, (x) => this.rasp(x, 1.1, 3400, 0.9, 0.016 * lv, bus, 12, 0.7));
    this.cue(t + 2.8, (x) => this.clink(x, 0.01 * lv, bus));
    this.cue(t + 0.6, (x) => this.cry(x, 125, [[0, 0.25, 'a'], [2, 0.3, 'o'], [0, 0.4, 'u']], 0.022 * lv, bus, { cutoff: 2400 }));
    return 5;
  },
  /** The printers of the Shöl Parkhang: at each bench the roller run over the inked block (a soft rasp), the sheet laid and whipped off (a crack of paper), set on the stack; a pair of benches out of step, the blocks knocked in their racks now and then. */
  lhsPrint(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 7 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => this.rasp(x, 0.4, 1200, 0.8, 0.011 * lv, bus, 4, 0.8));
      this.cue(w + 0.65, (x) => this.rasp(x, 0.3, 2800, 0.8, 0.014 * lv, bus, 6, 0.9));
      this.cue(w + 1.0, (x) => { this.burst(x, 0.04, 3200, 1.2, 0.026 * lv, bus); this.knock(x + 0.12, 360, 0.008 * lv, bus, 0.03); });
      w += 2.3 + R() * 0.5;
    }
    this.cue(w - 1, (x) => this.knock(x, 280, 0.02 * lv, bus, 0.07));
    return w - t + 1;
  },
  /** The juniper fire of an incense burner: a soft roar, the crackle of green sprigs and resin popping, a whoosh as a handful goes on. */
  lhsJuniper(t, bus, lv) {
    const dur = 12;
    this.rasp(t, dur, 320, 0.6, 0.012 * lv, bus, 2.2, 0.6);
    this.rasp(t, dur, 2800, 0.7, 0.005 * lv, bus, 30, 0.9);
    for (let k = 0, n = 10 + Math.floor(R() * 12); k < n; k++) this.cue(t + 0.3 + R() * (dur - 1), (x) => this.burst(x, 0.02 + R() * 0.03, 1800 + R() * 2800, 1.5, 0.03 * lv * (0.4 + R()), bus));
    this.cue(t + 2 + R() * 3, (x) => this.rasp(x, 1.4, 900, 0.5, 0.014 * lv, bus, 3, 0.6));
    return dur;
  },
  /** A yak: the low grunt, three or four short pulses on a deep note, the snort through the nose; the clank of its neck bell under it. */
  lhsYak(t, bus, lv) {
    const f = 78 + R() * 22;
    for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.45, (x) => this.tone(x, [[0, f * 1.08], [0.18, f]], 0.22, 0.05 * lv, bus, 'sawtooth', ['lowpass', 320, 1]));
    this.cue(t + 2.2, (x) => this.burst(x, 0.3, 900, 0.6, 0.02 * lv, bus, 0.04));
    for (let k = 0; k < 3; k++) this.cue(t + 0.2 + k * 0.7, (x) => this.struck(x, 420, 0.012 * lv, bus, [[1, 1, 0.3], [2.3, 0.3, 0.16]]));
    return 4;
  },
  /** A yak caravan along `f.pts` from the south gate to the foot of the palace: the dull clank of the leaders' bells at a slow pace, the heavy hooves, the driver's whistle and call now and then. */
  lhsCaravan(t, bus, lv, f) {
    const dur = f.dur, pace = 0.85, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace + R() * 0.08, (x) => {
      this.struck(x, 380 * (k % 3 ? 1 : 1.18), 0.014 * lv, bus, [[1, 1, 0.5], [2.2, 0.35, 0.25], [3.4, 0.15, 0.12]]);
      this.knock(x + 0.04, 190, 0.02 * lv, bus, 0.07); this.tone(x, [[0, 110], [0.07, 60]], 0.1, 0.03 * lv, bus, 'sine');
    });
    for (let w = t + 2; w < t + dur - 2; w += 7 + R() * 6) this.cue(w, (x) => this.cry(x, 150, pick([[[0, 0.3, 'o'], [5, 0.6, 'a'], [3, 0.4, 'o']], [[7, 0.2, 'i'], [7, 0.2, 'i'], [0, 0.6, 'a']]]), 0.036 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** A pilgrim on the circuit along `f.pts`: the soft steady step, the beads, the mantra under the breath. */
  lhsPilgrim(t, bus, lv, f) {
    const dur = f.dur, pace = 0.62, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => this.step(x, 0.026 * lv, bus, 'cloth', 0.12));
    this.rasp(t, dur, 900, 1, 0.004 * lv, bus, 1.2, 0.8);
    for (let w = t + 1; w < t + dur - 3; w += 5 + R() * 3) this.cue(w, (x) => this.cry(x, 112 + R() * 14, MANI, 0.016 * lv, bus, { cutoff: 1700 }));
    return dur;
  },
  /** The chained mastiff of a gate: a deep bark, three or four in a run, the chain rattling as it lunges, a growl after. */
  lhsMastiff(t, bus, lv) {
    const f = 118 + R() * 30;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.55 + R() * 0.15), (x) => {
      this.tone(x, [[0, f * 1.25], [0.07, f * 0.8]], 0.2, 0.06 * lv, bus, 'sawtooth', ['bandpass', 320, 1.1]);
      this.burst(x, 0.08, 800, 0.9, 0.025 * lv, bus);
      this.rasp(x + 0.1, 0.4, 3400, 1.1, 0.01 * lv, bus, 22, 0.9);
    });
    this.cue(t + 3, (x) => this.tone(x, [[0, 80], [0.8, 68]], 1.0, 0.025 * lv, bus, 'sawtooth', ['lowpass', 220, 1]));
    return 5;
  },
  /** A village dog in a lane: a run of barks, one answering from beyond. */
  lhsDogs(t, bus, lv) {
    let w = t;
    for (let d = 0, nd = 2 + Math.floor(R() * 3); d < nd; d++) {
      const f = 300 + R() * 200;
      for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(w + k * (0.36 + R() * 0.2), (x) => { this.tone(x, [[0, f], [0.05, f * 0.62]], 0.11, 0.028 * lv, bus, 'sawtooth', ['bandpass', 880, 1.2]); this.burst(x, 0.05, 1200, 1, 0.016 * lv, bus); });
      w += 1.1 + R() * 1.5;
    }
    return w - t + 2;
  },
  /** The murmur at a stall or a shop front: two voices on low wordless notes, a bowl of barley scooped, a coin on the board. */
  lhsMurmur(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const a = k % 2 === 0, f0 = a ? 118 : 215;
      this.cue(w, (x) => this.cry(x, f0 * (0.94 + R() * 0.12), pick([[[0, 0.3, 'o'], [2, 0.3, 'a'], [0, 0.4, 'u']], [[0, 0.25, 'a'], [-2, 0.4, 'o']], [[0, 0.2, 'e'], [3, 0.25, 'a'], [0, 0.45, 'o']]]), 0.026 * lv, bus, { cutoff: 2400, fem: !a }));
      w += 1.2 + R() * 1.1;
    }
    this.cue(w - 0.4, (x) => this.clink(x, 0.01 * lv, bus));
    this.cue(w + 0.3, (x) => this.rasp(x, 0.6, 3000, 0.9, 0.008 * lv, bus, 12, 0.7));
    return w - t + 1.2;
  },
  /** The damaru and the hand bell of a lay practitioner at the shrine or chapel: the little two-faced drum's quick rattle, the bell's ring, a pause. */
  lhsDamaru(t, bus, lv) {
    for (let k = 0, n = 14 + Math.floor(R() * 10); k < n; k++) this.cue(t + 0.4 + k * 0.1 * (1 + k / 40), (x) => { this.burst(x, 0.03, 1500 + (k % 2) * 300, 1.6, 0.02 * lv, bus); this.tone(x, [[0, 340], [0.04, 260]], 0.05, 0.012 * lv, bus, 'triangle'); });
    for (let k = 0; k < 6; k++) this.cue(t + 3 + k * 0.38, (x) => this.strike(x, 1560 + (k % 2) * 40, 0.006 * lv, bus, 0.3));
    return 7;
  },
  /** The wind in the narrow lanes at evening: a long soft breath over the roofs with a thin whistle at the corners. */
  lhsWind(t, bus, lv) {
    const dur = 10;
    this.rasp(t, dur, 500, 0.6, 0.012 * lv, bus, 0.3, 0.9);
    this.rasp(t + 1, dur - 2, 1900, 2, 0.004 * lv, bus, 0.5, 0.9);
    return dur;
  },
};
const GAIN = { lhsDungchen: 1.2, lhsGyaling: 1.1, lhsChant: 1.2, lhsFlags: 1.2, lhsJuniper: 1.2, lhsCaravan: 1.1, lhsMastiff: 1.1 };
addVoices('lhasa/voices.js', V, GAIN);
export const LHS_VOICES = Object.keys(V);
