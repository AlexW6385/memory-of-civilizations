// The placed voices of Brasília about 1970 (docs/settlements/brasilia.md §14), added to voices.js's VOICES from the map that places
// them (src/settlements/brasilia/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from
// `src()` and returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock, clink) and nothing
// else: no samples. Pitches and contours are [inferred]: no recording of the capital in 1970 is kept; what each sound is rests on the
// dossier. Every name is prefixed `bra` (VOICES is one shared table).
import { VOICES, addVoices } from './voices.js';

const R = Math.random;
const PLAIN = new WeakMap();

export const BRA_VOICES = {
  /** The scheduler: the clock first, then the common one (the map's emitters, tracks, rooms). */
  braPlaced(L, t) {
    const P = this.plc, l = this.lis(), M = L.map;
    M.clock.hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1);
    let plain = PLAIN.get(M);
    if (!plain) PLAIN.set(M, plain = { ...M, schedule: undefined });
    return VOICES.placed.call(this, { ...L, map: plain }, t);
  },

  // ── the streets ──
  /** Cars on an eight-lane carriageway: the air-cooled flat-four's putter of the Beetles, tyres hissing on the asphalt, now and then a bus's diesel. */
  braTraffic(t, bus, lv, f) {
    const dur = f.dur, big = R() < 0.2;
    this.cue(t, (u) => { this.burst(u, dur, 230, 0.8, 0.03 * lv, bus, dur * 0.4); this.tone(u, [[0, big ? 60 : 110], [dur, big ? 52 : 95]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 380, 1]); });
    if (!big) for (let k = 0, n = Math.floor(dur * 14); k < n; k++) this.cue(t + k / 14, (u) => this.knock(u, 120 + 10 * (k % 3), 0.006 * lv, bus, 0.04));      // the Beetle's putter
    else for (let k = 0, n = Math.floor(dur * 9); k < n; k++) this.cue(t + k / 9, (u) => this.knock(u, 110, 0.012 * lv, bus, 0.05));
    return dur;
  },
  /** A horn: the Beetle's thin two-note beep. */
  braHorn(t, bus, lv) {
    const f0 = 420 + 40 * R();
    for (let k = 0, n = R() < 0.5 ? 1 : 2; k < n; k++) this.cue(t + k * 0.45, (u) => this.tone(u, [[0, f0], [0.28, f0 * 0.99]], 0.28, 0.03 * lv, bus, 'square', ['bandpass', 950, 1.4]));
    return 1.4;
  },
  /** The ice-lolly seller's bell: a small hand bell shaken in a loose rhythm. */
  braPicole(t, bus, lv) {
    for (let k = 0; k < 9; k++) this.cue(t + k * (0.16 + 0.05 * R()), (u) => this.struck(u, 2300 + 200 * R(), 0.012 * lv, bus, [[1, 1, 0.15], [2.7, 0.3, 0.08]]));
    return 2.6;
  },
  /** A popcorn kettle: a few soft pops, then more, the burst of a handful. */
  braPipoca(t, bus, lv) {
    for (let k = 0; k < 26; k++) { const w = t + Math.pow(k / 26, 0.7) * 5 + R() * 0.1; this.cue(w, (u) => this.knock(u, 600 + 500 * R(), 0.007 * lv, bus, 0.03)); }
    this.cue(t, (u) => this.burst(u, 5, 3500, 0.8, 0.004 * lv, bus, 1));
    return 6;
  },

  // ── birds of the lawns ──
  /** The southern lapwing (quero-quero): a loud, hard, repeated "kerr-kerr, quero-quero", the lawns' sentinel. */
  braQuero(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { const w = t + k * 0.32, f = 2000 + 150 * R(); this.cue(w, (u) => { this.tone(u, [[0, f], [0.06, f * 1.2], [0.16, f * 0.85]], 0.18, 0.016 * lv, bus, 'sawtooth', ['bandpass', 2400, 3]); }); }
    return 2.4;
  },
  /** The great kiskadee (bem-te-vi): a bright, three-note "bem-te-vi!", the middle one low, repeated. */
  braKiskadee(t, bus, lv) {
    const f = 2300 + 150 * R();
    for (let p = 0, np = 1 + Math.floor(R() * 3); p < np; p++) { const w = t + p * 1.1; [[1, 0.14, 0], [0.8, 0.12, 0.2], [1.25, 0.34, 0.38]].forEach(([k, d, o]) => this.cue(w + o, (u) => this.tone(u, [[0, f * k * 0.95], [d * 0.4, f * k * 1.08], [d, f * k]], d, 0.014 * lv, bus, 'sine'))); }
    return 3.4;
  },
  /** Green parakeets passing in a flock: a quick rain of thin, harsh screeches. */
  braParakeet(t, bus, lv) {
    for (let k = 0; k < 14; k++) this.cue(t + k * 0.13 + R() * 0.1, (u) => { const f = 3100 + 500 * R(); this.tone(u, [[0, f], [0.07, f * 1.25], [0.12, f * 1.05]], 0.13, 0.008 * lv, bus, 'sawtooth', ['bandpass', 3600, 3]); });
    return 2.8;
  },
  /** The burrowing owl on the lawn at dusk and in the night: a rattling, chattering "ti-ti-ti-ti" and a soft coo. */
  braOwl(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.09, (u) => this.tone(u, [[0, 1500], [0.05, 1750]], 0.06, 0.01 * lv, bus, 'square', ['bandpass', 1700, 4]));
    this.cue(t + 1.2, (u) => this.tone(u, [[0, 520], [0.5, 480]], 0.55, 0.012 * lv, bus, 'sine'));
    return 2.2;
  },
  /** A fountain's plume falling in a pool: a steady soft hiss of water on water. */
  braFountain(t, bus, lv) { this.cue(t, (u) => { this.burst(u, 9, 2400, 0.5, 0.012 * lv, bus, 2.5); this.burst(u, 9, 800, 0.6, 0.012 * lv, bus, 2.5); }); return 10; },
  /** The curtains of falling water of the Palace of Justice: a broad, low roar of water over stone. */
  braCascade(t, bus, lv) { this.cue(t, (u) => { this.burst(u, 12, 1500, 0.4, 0.02 * lv, bus, 3); this.burst(u, 12, 400, 0.6, 0.015 * lv, bus, 3); }); return 13; },
  /** The halyard of the great flag clinking on its mast in the wind of the Square. */
  braFlagRope(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.5 + R() * 0.4, (u) => this.struck(u, 1500 + 200 * R(), 0.01 * lv * (0.5 + R() * 0.5), bus, [[1, 1, 0.1], [2.5, 0.3, 0.05]]));
    return 5;
  },

  // ── the people ──
  /** A transistor radio: a thin band of voice and music, a few guitar notes of a samba now and then. */
  braRadio(t, bus, lv) {
    this.cue(t, (u) => { this.burst(u, 6, 1100, 0.9, 0.01 * lv, bus, 1); this.cry(u + 0.4, 135, [[0, 0.3, 'a'], [3, 0.3, 'e'], [-1, 0.4, 'o'], [2, 0.5, 'a']], 0.012 * lv, bus, { cutoff: 2200 }); });
    for (const [k, f] of [392, 330, 294, 330, 262].entries()) this.cue(t + 3 + k * 0.32, (u) => this.tone(u, [[0, f]], 0.3, 0.008 * lv, bus, 'triangle', ['bandpass', 1400, 1]));
    return 6;
  },
  /** The wordless call and laughter of children at play. */
  braShout(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.4 + 0.3 * R()), (u) => this.cry(u, 330 + 80 * R(), [[0, 0.2, 'a'], [4, 0.25, 'e'], [2, 0.3, 'a']], 0.018 * lv, bus, { cutoff: 3200, fem: true }));
    return 3;
  },
  /** A game of ball: thumps of the ball and a call or two. */
  braBall(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * (0.5 + 0.3 * R()), (u) => this.knock(u, 150 + 30 * R(), 0.02 * lv, bus, 0.09));
    this.cue(t + 2, (u) => this.cry(u, 160, [[0, 0.3, 'o'], [3, 0.4, 'a']], 0.018 * lv, bus, { cutoff: 2400 }));
    return 4;
  },
  /** The school's electric bell: a long even ring, then silence. */
  braSchoolBell(t, bus, lv) { this.cue(t, (u) => { this.tone(u, [[0, 1900]], 3.2, 0.012 * lv, bus, 'square', ['bandpass', 1900, 5]); this.tone(u, [[0, 2050]], 3.2, 0.008 * lv, bus, 'square', ['bandpass', 2050, 5]); }); return 3.5; },
  /** A class at its lesson: the teacher's even voice and a murmur of children answering together. */
  braLesson(t, bus, lv) {
    this.cue(t, (u) => this.cry(u, 230, [[0, 0.3, 'a'], [2, 0.3, 'e'], [0, 0.4, 'o'], [-2, 0.5, 'a']], 0.014 * lv, bus, { cutoff: 2000, fem: true }));
    this.cue(t + 2.4, (u) => { this.burst(u, 1.6, 1000, 0.8, 0.012 * lv, bus, 0.3); this.cry(u, 300, [[0, 0.6, 'a'], [0, 0.6, 'o']], 0.012 * lv, bus, { cutoff: 2400, fem: true }); });
    return 5;
  },
  /** A mechanical till: the bell of the drawer, then coins. */
  braTill(t, bus, lv) { this.cue(t, (u) => { this.struck(u, 2600, 0.022 * lv, bus, [[1, 1, 0.5], [2.1, 0.4, 0.3]]); this.knock(u + 0.05, 200, 0.028 * lv, bus, 0.08); }); this.cue(t + 0.5, (u) => this.clink(u, 0.008 * lv, bus)); return 1.4; },
  /** A pressure coffee machine: the steam's hiss and a cup set on its saucer. */
  braCoffee(t, bus, lv) { this.cue(t, (u) => this.burst(u, 2.6, 4800, 0.7, 0.016 * lv, bus, 0.5)); this.cue(t + 3.2, (u) => this.clink(u, 0.014 * lv, bus)); return 4; },
  /** A baker's oven door and the slide of a peel. */
  braOven(t, bus, lv) { this.cue(t, (u) => { this.knock(u, 90, 0.03 * lv, bus, 0.12); this.rasp(u + 0.2, 0.8, 700, 0.8, 0.012 * lv, bus, 40, 0.7); }); return 2; },
  /** A butcher's cleaver: two or three chops. */
  braCleaver(t, bus, lv) { for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.5, (u) => { this.knock(u, 190, 0.04 * lv, bus, 0.07); this.burst(u, 0.03, 1300, 1, 0.01 * lv, bus); }); return 2; },
  /** A shoemaker's tacks: a run of small quick taps of a hammer. */
  braTacks(t, bus, lv) { for (let k = 0; k < 8; k++) this.cue(t + k * 0.16, (u) => this.knock(u, 700 + 60 * (k % 2), 0.014 * lv, bus, 0.03)); return 1.6; },
  /** A typewriter in a press room: quick keys, the bell and the carriage's return. */
  braTypewriter(t, bus, lv) {
    for (let k = 0; k < 18; k++) this.cue(t + k * (0.09 + 0.05 * R()), (u) => this.knock(u, 900 + 200 * R(), 0.01 * lv, bus, 0.02));
    this.cue(t + 2.3, (u) => this.struck(u, 3100, 0.01 * lv, bus, [[1, 1, 0.3]])); this.cue(t + 2.6, (u) => this.rasp(u, 0.3, 1200, 0.8, 0.01 * lv, bus, 30, 0.5));
    return 3.2;
  },
  /** The presiding officer's gavel and the murmur of a plenary. */
  braGavel(t, bus, lv) {
    this.cue(t, (u) => { this.burst(u, 6, 800, 0.7, 0.01 * lv, bus, 1.5); this.cry(u + 0.5, 125, [[0, 0.4, 'a'], [2, 0.5, 'o'], [0, 0.6, 'a']], 0.014 * lv, bus, { cutoff: 1800 }); });
    this.cue(t + 4.5, (u) => { this.knock(u, 260, 0.03 * lv, bus, 0.06); this.knock(u + 0.25, 260, 0.025 * lv, bus, 0.06); });
    return 6;
  },
  /** A hammer on a plank, the camp's building: a few blows and a pause. */
  braPlank(t, bus, lv) { for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * 0.42, (u) => { this.knock(u, 420 + 40 * (k % 2), 0.03 * lv, bus, 0.06); this.burst(u, 0.02, 2200, 1, 0.006 * lv, bus); }); return 3; },
};
export const BRA_GAIN = {};
addVoices('voices-brasilia.js', BRA_VOICES, BRA_GAIN);
