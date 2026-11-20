// The voices of Bhaktapur about 1710 that no other place has (docs/settlements/bhaktapur.md §17): the stone spout, the Nyatapola's wind bells, the hand
// bell and the conch of the Bhairabnath's puja, a devotee's bell at a shrine, the straw fire of the potters' kilns, pots knocked together, the dhiki (the
// foot-worked rice pounder) and the quern, the curd seller's clay cups, grain poured on a tray, the dhimay band in a lane, the bhajan in the pati, the
// hawkers' cries, a porter, the late walker with his brand, the lanes' dogs, jackals from the fields, a buffalo, a goat, children, the murmur at a stall.
// Each is a method `name(t, bus, lv[, track])` made from the engine's own tools (rasp, burst, tone, knock, clink, struck, step, cry, conch, strike) as the
// other voices are, and returns how long it lasts. Wordless, as street cries are: vowels on a contour. Every name begins `bhk` (voices.js refuses a name
// defined twice). [inferred throughout: no recording of Bhaktapur in 1710 exists; what each sound is of, and when, is in the dossier §17.]
import { addVoices } from '../../engine/voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
/** The pentatonic (the scale of the town's music: music.js) in Hz above a base, for the wind bells' pitches. */
const PENTA = [0, 2, 4, 7, 9];
const hz = (base, k) => base * Math.pow(2, (PENTA[k % 5] + 12 * Math.floor(k / 5)) / 12);

/** The hawkers' calls: [semitones above the voice's base, seconds, vowel]; the curd seller's long fall, the vegetable seller's climb, a two-note call. */
export const BHK_CRIES = [
  [[7, 0.3, 'a'], [4, 0.35, 'a'], [0, 1.2, 'o'], [-2, 0.5, 'u']],                          // the curd seller's: from high to low, held
  [[0, 0.3, 'a'], [2, 0.3, 'a'], [4, 0.3, 'e'], [7, 1.0, 'i'], [4, 0.5, 'a']],             // the vegetable seller's: a climb
  [[5, 0.25, 'o'], [5, 0.25, 'o'], [0, 0.35, 'a'], [0, 0.9, 'u']],                         // two notes repeated and a fall
];
/** The bhajan's phrases (leader and answer), wordless, on the pentatonic. */
const BHAJAN = [[[0, 0.55, 'o'], [2, 0.45, 'a'], [4, 0.45, 'a'], [2, 0.5, 'o'], [0, 1.0, 'a']], [[4, 0.5, 'a'], [7, 0.5, 'a'], [9, 0.6, 'e'], [7, 0.5, 'a'], [4, 1.1, 'o']]];

const V = {
  /** A stone spout (hiti) running into its sunken basin: a steady rush with a bright top, a hollow splash under it, drops pocking the basin. Long enough that one overlaps the next. */
  bhkSpout(t, bus, lv) {
    const dur = 13;
    this.rasp(t, dur, 2300, 0.6, 0.022 * lv, bus, 19, 0.5);
    this.rasp(t, dur, 800, 0.5, 0.016 * lv, bus, 6, 0.45);
    this.rasp(t, dur, 4800, 0.8, 0.006 * lv, bus, 27, 0.5);
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) this.cue(t + 0.4 + R() * (dur - 1), (x) => this.tone(x, [[0, 600 + R() * 500], [0.05, 1300 + R() * 500]], 0.06, 0.01 * lv, bus, 'sine'));
    return dur;
  },
  /** The wind bells of a pagoda (529 on the Nyatapola's eaves): small bronze bells touched by the breeze, in handfuls, more of them and louder as the wind rises; each a bright strike with an upper partial. */
  bhkWindBells(t, bus, lv) {
    const w = Math.min(1, 0.18 + (this.wind || 0) * 1.4), dur = 9;
    const base = 1180 * (0.96 + R() * 0.08);
    for (let g = 0, ng = 1 + Math.floor(w * 4); g < ng; g++) {
      const g0 = t + R() * (dur - 3);
      for (let k = 0, n = 3 + Math.floor(R() * (4 + 8 * w)); k < n; k++) this.cue(g0 + k * (0.07 + R() * 0.2), (x) => this.struck(x, hz(base, Math.floor(R() * 10)), 0.011 * lv * (0.4 + 0.6 * w) * (0.6 + 0.4 * R()), bus, [[1, 1, 0.55 + R() * 0.5], [2.76, 0.35, 0.22], [5.4, 0.15, 0.1]]));
    }
    this.rasp(t, dur, 5200, 1.2, 0.002 * lv * w, bus, 3, 0.8);
    return dur;
  },
  /** The puja of the Bhairabnath at dawn, noon and dusk: the conch blown, then the hand bell rung through the worship in an uneven run, a few strokes of a small gong at its end. */
  bhkPuja(t, bus, lv) {
    this.conch(t, 0.02 * lv, bus);
    let w = t + 3.8;
    for (let k = 0, n = 46 + Math.floor(R() * 14); k < n; k++) { this.cue(w, (x) => this.strike(x, 1480 + (k % 2) * 36, 0.008 * lv, bus, 0.3)); w += 0.11 + R() * 0.06 + (k % 9 === 8 ? 0.25 : 0); }
    for (let k = 0; k < 3; k++) this.cue(w + 0.8 + k * 1.1, (x) => this.gong(x, 360, 0.02 * lv, bus, 0.8));
    return w + 4 - t;
  },
  /** A devotee at a shrine rings its bell (the ghanta hung from the roof): two or three strokes, struck as the worshipper passes. */
  bhkBell(t, bus, lv) {
    const n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.5 + R() * 0.25), (x) => this.templeBell(x, 740 * (0.97 + R() * 0.06), 0.014 * lv, bus, 0.35));
    return n * 0.7 + 1.5;
  },
  /** A kiln fed with straw: the low roar of the fire, a crackle of stalks and now and then a pop of the clay; a rake on the ash. */
  bhkKiln(t, bus, lv) {
    const dur = 11;
    this.rasp(t, dur, 260, 0.6, 0.02 * lv, bus, 2.5, 0.5);
    this.rasp(t, dur, 2600, 0.7, 0.006 * lv, bus, 33, 0.9);
    for (let k = 0, n = 14 + Math.floor(R() * 14); k < n; k++) this.cue(t + 0.3 + R() * (dur - 1), (x) => this.burst(x, 0.02 + R() * 0.03, 1800 + R() * 2600, 1.4, 0.03 * lv * (0.4 + R()), bus));
    for (let k = 0; k < 2; k++) this.cue(t + 1.5 + R() * (dur - 3), (x) => this.knock(x, 300 + R() * 80, 0.02 * lv, bus, 0.08));
    return dur;
  },
  /** Pots knocked and set together at the drying ground: the ring of a fired pot when it is flicked, the dull clack of two stacked, the scrape of a heap. */
  bhkPots(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      const f = 760 + R() * 520;
      this.cue(w, (x) => { this.struck(x, f, 0.02 * lv, bus, [[1, 1, 0.28], [2.1, 0.45, 0.16], [3.3, 0.2, 0.08]]); this.burst(x, 0.015, 3200, 2, 0.015 * lv, bus); });
      if (R() < 0.35) this.cue(w + 0.18, (x) => this.knock(x, 520 + R() * 80, 0.02 * lv, bus, 0.05));
      w += 0.3 + R() * 0.55;
    }
    this.cue(w + 0.2, (x) => this.rasp(x, 0.5, 1400, 0.8, 0.01 * lv, bus, 20, 0.6));
    return w - t + 1;
  },
  /** The dhiki, the foot-worked rice pounder: the lever's clack as the foot comes off it, the pestle falling into the stone mortar (a low thud, a dull ring), at a steady two seconds, a rest between the rounds. */
  bhkDhiki(t, bus, lv) {
    let w = t;
    for (let r = 0, rounds = 1 + Math.floor(R() * 2); r < rounds; r++) {
      for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) {
        this.cue(w, (x) => this.knock(x, 330, 0.03 * lv, bus, 0.06));
        this.cue(w + 0.36, (x) => { this.tone(x, [[0, 150], [0.09, 62]], 0.16, 0.05 * lv, bus, 'sine'); this.burst(x, 0.05, 700, 0.9, 0.025 * lv, bus); this.struck(x, 520, 0.008 * lv, bus, [[1, 1, 0.16]]); });
        w += 1.7 + R() * 0.4;
      }
      w += 2.5;
    }
    return w - t;
  },
  /** The quern (jato): the upper stone turned by its handle, a grinding that swells and falls with each turn, the wooden handle knocking on the stone now and then. */
  bhkQuern(t, bus, lv) {
    const dur = 7 + R() * 3, turn = 1.5 + R() * 0.4;
    this.rasp(t, dur, 420, 0.7, 0.026 * lv, bus, 1 / turn, 0.85);
    this.rasp(t, dur, 1300, 0.9, 0.01 * lv, bus, 1 / turn, 0.9);
    for (let w = t + 0.4; w < t + dur - 0.3; w += turn) this.cue(w, (x) => this.knock(x, 240, 0.014 * lv, bus, 0.05));
    return dur;
  },
  /** The curd seller's clay cups: a cup set down on the board (a dull ring), the ladle in the jar, a spoonful dropped into a cup, a coin on stone. */
  bhkCurd(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => this.struck(x, 880 + R() * 200, 0.016 * lv, bus, [[1, 1, 0.12], [2.3, 0.35, 0.07]]));
      this.cue(w + 0.35, (x) => { this.burst(x, 0.16, 900, 1, 0.022 * lv, bus, 0.02); this.tone(x, [[0, 200], [0.12, 130]], 0.14, 0.014 * lv, bus, 'sine'); });
      w += 0.9 + R() * 0.7;
    }
    this.cue(w, (x) => this.clink(x, 0.008 * lv, bus));
    return w - t + 1;
  },
  /** Grain poured on a tray and scooped: a hiss of falling seed, the scoop's knock on the winnowing tray, a shake. */
  bhkGrain(t, bus, lv) {
    this.rasp(t, 1.6, 3600, 0.9, 0.02 * lv, bus, 14, 0.7);
    this.cue(t + 1.9, (x) => { this.knock(x, 410, 0.025 * lv, bus, 0.06); this.rasp(x + 0.05, 0.9, 3000, 0.9, 0.012 * lv, bus, 10, 0.8); });
    this.cue(t + 3.2, (x) => this.rasp(x, 1.2, 2800, 0.8, 0.014 * lv, bus, 6, 0.9));
    return 5;
  },
  /** A dhimay band along `f.pts` (the large double-headed drum struck with the hand and the cane, the cymbals bhuchhyay, a gong): a cycle of eight beats, the left head's deep boom and the right head's crack, the cymbals on every beat, a gong at the cycle's head; the walkers' feet under it. */
  bhkDhimay(t, bus, lv, f) {
    const dur = f.dur, beat = 0.42 + R() * 0.05, cycle = ['D', '.', 'c', 'c', 'D', 'c', 'c', '.'];
    const n = Math.floor((dur - 1) / beat);
    for (let k = 0; k < n; k++) {
      const e = cycle[k % 8], w = t + 0.4 + k * beat;
      this.cue(w, (x) => {
        if (e === 'D') { this.tone(x, [[0, 98], [0.22, 58]], 0.5, 0.085 * lv, bus, 'sine'); this.burst(x, 0.05, 420, 1, 0.035 * lv, bus); }
        else if (e === 'c') { this.burst(x, 0.045, 1700, 1.6, 0.05 * lv, bus); this.tone(x, [[0, 360], [0.05, 280]], 0.07, 0.02 * lv, bus, 'triangle'); }
        this.struck(x + 0.005, 5200 + R() * 600, 0.006 * lv, bus, [[1, 1, 0.1], [1.7, 0.5, 0.06]]);               // the cymbals' bright tick
        if (k % 8 === 0) this.gong(x, 520, 0.012 * lv, bus, 0.5);
      });
    }
    for (let k = 0; k < n / 2; k++) this.cue(t + 0.4 + k * beat * 2, (x) => this.step(x, 0.016 * lv, bus, 'cloth', 0.1));
    this.rasp(t, dur, 800, 0.5, 0.006 * lv, bus, 2.6, 0.6);
    return dur;
  },
  /** The evening bhajan in the pati: a leader's phrase and the group's answer in unison on the pentatonic, a small drum's beat under it and the cymbals' tick on every beat. */
  bhkBhajan(t, bus, lv) {
    const f0 = 118 * (0.95 + R() * 0.1), beat = 0.55;
    let w = t + 0.5;
    for (let k = 0; k < 4; k++) {
      const a = BHAJAN[k % 2], len = a.reduce((s, n) => s + n[1], 0);
      this.cue(w, (x) => this.cry(x, f0, a, 0.04 * lv, bus, { cutoff: 2800 }));
      this.cue(w + len + 0.3, (x) => { for (const d of [0, 0.012, -0.011]) this.cry(x + 0.01, f0 * (0.99 + d * 3), BHAJAN[(k + 1) % 2], 0.026 * lv, bus, { cutoff: 2500 }); });
      w += len * 2 + 1;
    }
    for (let b = 0, nb = Math.floor((w - t) / beat); b < nb; b++) this.cue(t + 0.5 + b * beat, (x) => {
      if (b % 4 === 0) this.tone(x, [[0, 150], [0.1, 95]], 0.2, 0.03 * lv, bus, 'sine'); else if (b % 2 === 0) this.burst(x, 0.04, 1300, 1.4, 0.02 * lv, bus);
      this.struck(x, 4600 + R() * 500, 0.004 * lv, bus, [[1, 1, 0.08]]);
    });
    return w - t + 1.5;
  },
  /** A hawker's call, sung two or three times along a lane (with `f`) or from where the seller stands, a basket's creak under it. */
  bhkCry(t, bus, lv, f) {
    const c = pick(BHK_CRIES), f0 = 116 + R() * 40, n = f ? Math.max(1, Math.min(3, Math.floor(f.dur / 6))) : 1 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 5.5, (x) => this.cry(x, f0 * (1 + 0.02 * k), c, 0.05 * lv, bus, { cutoff: 3600 }));
    if (f) for (let w = t + 1; w < t + f.dur - 1; w += 1.8 + R() * 0.7) this.cue(w, (x) => this.step(x, 0.02 * lv, bus, 'cloth', 0.15));
    return f ? f.dur : n * 5.5;
  },
  /** A porter along a lane with a loaded doko basket on his back: the steady bare feet, the basket's strap creaking at each step, a breath of a call ("hai") now and then. */
  bhkPorter(t, bus, lv, f) {
    const dur = f.dur, pace = 0.55 + R() * 0.1, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.step(x, 0.035 * lv, bus, 'cloth', 0.15); if (k % 2) this.creak(x + 0.1, lv * 0.3, bus, k % 4 === 1); });
    for (let w = t + 3; w < t + dur - 2; w += 6 + R() * 5) this.cue(w, (x) => this.cry(x, 112, [[0, 0.22, 'a'], [-2, 0.4, 'i']], 0.03 * lv, bus, { cutoff: 2600 }));
    return dur;
  },
  /** A late walker along a lane with a flaming brand: slow steps, the soft crackle and flutter of the brand, a cough, the clay lamp's chink when he sets it down. */
  bhkWalker(t, bus, lv, f) {
    const dur = f.dur, pace = 0.72, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => this.step(x, 0.03 * lv, bus, 'cloth', 0.2));
    this.rasp(t, dur, 1500, 0.7, 0.006 * lv, bus, 9, 0.9);
    for (let w = t + 1; w < t + dur - 1; w += 1.3 + R() * 1.2) this.cue(w, (x) => this.burst(x, 0.02, 2200 + R() * 1500, 1.4, 0.014 * lv, bus));
    if (R() < 0.5) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 108, [[0, 0.12, 'a'], [-1, 0.2, 'o']], 0.03 * lv, bus, { cutoff: 2000 }));
    return dur;
  },
  /** The lanes' dogs at night: one barks, another answers from the next lane, and a third beyond, a run of barks each, a long note from one of them. */
  bhkDogs(t, bus, lv) {
    let w = t;
    for (let d = 0, nd = 3 + Math.floor(R() * 3); d < nd; d++) {
      const f = 330 + R() * 220;
      for (let k = 0, n = 2 + Math.floor(R() * 5); k < n; k++) this.cue(w + k * (0.38 + R() * 0.2), (x) => { this.tone(x, [[0, f], [0.05, f * 0.62]], 0.12, 0.03 * lv, bus, 'sawtooth', ['bandpass', 900, 1.2]); this.burst(x, 0.06, 1200, 1, 0.02 * lv, bus); });
      w += 1.2 + R() * 1.6;
    }
    if (R() < 0.4) this.cue(w, (x) => this.tone(x, [[0, 360], [0.5, 500], [1.8, 330]], 2, 0.022 * lv, bus, 'sawtooth', ['bandpass', 800, 1.5]));
    return w - t + 2.5;
  },
  /** Jackals in the fields beyond the town: a long rising wail that breaks into a run of yaps, answered by another; far off and thin. */
  bhkJackal(t, bus, lv) {
    let w = t;
    for (let c = 0, nc = 2 + Math.floor(R() * 2); c < nc; c++) {
      const f = 520 + R() * 160;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.9], [1.2, f * 1.35], [2.6, f * 1.1], [3.4, f * 1.25]], 3.6, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1100, 2]));
      for (let k = 0; k < 5 + Math.floor(R() * 4); k++) this.cue(w + 3.2 + k * 0.16, (x) => this.tone(x, [[0, f * 1.3], [0.07, f * 1.0]], 0.09, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1300, 2]));
      w += 4.4 + R() * 2;
    }
    return w - t + 1;
  },
  /** A water buffalo lowing in its lane: a low, hollow, long note falling a little, with the breath in it. */
  bhkBuffalo(t, bus, lv) {
    this.tone(t, [[0, 118], [0.5, 128], [2.1, 92]], 2.4, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520, 1]);
    this.burst(t, 2.2, 300, 1, 0.012 * lv, bus, 0.3);
    if (R() < 0.35) this.cue(t + 3.2, (x) => this.tone(x, [[0, 110], [1.2, 86]], 1.4, 0.035 * lv, bus, 'sawtooth', ['lowpass', 480, 1]));
    return 5;
  },
  /** A tethered goat's bleat: a nasal, wavering note with a fast tremolo, twice. */
  bhkGoat(t, bus, lv) {
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * 1.4, (x) => {
      const f = 430 + R() * 90;
      this.tone(x, [[0, f * 1.1], [0.2, f], [0.9, f * 0.85]], 1.0, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1200, 2.2]);
      this.tone(x, [[0, 38], [0.9, 30]], 1.0, 0.012 * lv, bus, 'square', ['lowpass', 90, 1]);
    });
    return 4;
  },
  /** Children at play in the square: calls and laughter on high wordless notes, running feet, a shout. */
  bhkChildren(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.6 + R() * 0.7), (x) => this.cry(x, 270 + R() * 90, pick([[[0, 0.18, 'a'], [4, 0.3, 'i']], [[2, 0.2, 'e'], [0, 0.25, 'a'], [5, 0.2, 'i']], [[5, 0.15, 'i'], [5, 0.15, 'i'], [0, 0.3, 'a']]]), 0.035 * lv, bus, { cutoff: 4200, fem: true }));
    for (let k = 0; k < 9; k++) this.cue(t + 0.3 + k * 0.22, (x) => this.step(x, 0.02 * lv, bus, 'cloth', 0.05));
    return 6;
  },
  /** The murmur at a stall: two voices bargaining on low wordless notes, a coin set down on the board, the scoop in the goods. */
  bhkMurmur(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const a = k % 2 === 0, f0 = a ? 112 : 205;
      this.cue(w, (x) => this.cry(x, f0 * (0.94 + R() * 0.12), pick([[[0, 0.3, 'o'], [2, 0.3, 'a'], [0, 0.4, 'u']], [[0, 0.25, 'a'], [-2, 0.4, 'o']], [[0, 0.2, 'e'], [3, 0.25, 'a'], [0, 0.45, 'o']]]), 0.026 * lv, bus, { cutoff: 2400, fem: !a }));
      w += 1.2 + R() * 1.1;
    }
    this.cue(w - 0.4, (x) => this.clink(x, 0.01 * lv, bus));
    this.cue(w + 0.3, (x) => this.rasp(x, 0.6, 3000, 0.9, 0.008 * lv, bus, 12, 0.7));
    return w - t + 1.2;
  },
};
const GAIN = { bhkSpout: 1.2, bhkWindBells: 1.4, bhkPuja: 1.2, bhkDhimay: 1.2, bhkKiln: 1.1, bhkDhiki: 1.2, bhkQuern: 1.1 };
addVoices('bhaktapur/voices.js', V, GAIN);
export const BHK_VOICES = Object.keys(V);
