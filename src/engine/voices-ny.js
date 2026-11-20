// The placed voices of New York in 1931 (docs/settlements/new-york.md §14), added to voices.js's VOICES from the map that places them
// (src/settlements/new-york/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and
// returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock) and nothing else: no samples.
// Pitches and contours are [inferred]: no recording of 1931 Midtown is kept; what each sound is rests on §14 (the Sixth Avenue El, Klaxon
// horns, newsboys' cries, radios, the subway). Every name is prefixed `ny` (VOICES is one shared table).
import { VOICES, addVoices } from './voices.js';

const R = Math.random;
const PLAIN = new WeakMap();

export const NY_VOICES = {
  /** The scheduler: the clock first, then the common one (the map's emitters, tracks, rooms). */
  nyPlaced(L, t) {
    const P = this.plc, l = this.lis(), M = L.map;
    M.clock.hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1);
    let plain = PLAIN.get(M);
    if (!plain) PLAIN.set(M, plain = { ...M, schedule: undefined });
    return VOICES.placed.call(this, { ...L, map: plain }, t);
  },
  /** An elevated train passing overhead: a rising and falling roar of wheels on the joints of the steel, a steady clack of the rail joints, a screech on the curve. */
  nyElTrain(t, bus, lv, f) {
    const dur = f.dur, pace = 0.22;
    this.cue(t, (u) => this.burst(u, dur, 260, 0.6, 0.05 * lv, bus, dur * 0.35));
    for (let k = 0, n = Math.floor(dur / pace); k < n; k++) this.cue(t + k * pace, (u) => { this.knock(u, 180 + 40 * (k % 2), 0.03 * lv, bus, 0.06); this.burst(u, 0.05, 1500, 1, 0.012 * lv, bus); });
    this.cue(t + dur * 0.55, (u) => this.tone(u, [[0, 1700], [0.7, 1500]], 0.7, 0.008 * lv, bus, 'sawtooth', ['bandpass', 1800, 6]));
    return dur;
  },
  /** The El's station gong: two strokes of a hand bell as a train comes in. */
  nyElBell(t, bus, lv) { for (let k = 0; k < 4; k++) this.cue(t + k * 0.42, (u) => this.gong(u, 780, 0.03 * lv, bus, 0.5)); return 2.5; },
  /** The subway under the pavement: a low rumble swelling and fading through the ground, a faint screech. */
  nySubway(t, bus, lv) { this.cue(t, (u) => this.burst(u, 6, 70, 0.7, 0.07 * lv, bus, 2.4)); this.cue(t + 3, (u) => this.tone(u, [[0, 1100], [1.2, 900]], 1.2, 0.004 * lv, bus, 'sawtooth', ['bandpass', 1100, 5])); return 8; },
  /** A motor horn (a rubber-bulb or a Klaxon on a taxi): one or two short blasts, a second car answering. */
  nyHorn(t, bus, lv) {
    const f0 = 330 + 90 * R(), n = R() < 0.5 ? 1 : 2;
    for (let k = 0; k < n; k++) this.cue(t + k * 0.55, (u) => { this.tone(u, [[0, f0], [0.3, f0 * 0.97]], 0.32, 0.035 * lv, bus, 'sawtooth', ['bandpass', 900, 1.5]); this.tone(u, [[0, f0 * 1.26], [0.3, f0 * 1.22]], 0.32, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.5]); });
    return 1.8;
  },
  /** Cars on the avenue: an engine's drone passing, tyres hissing, now and then a rattle of a loose fender. */
  nyTraffic(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 160, 0.8, 0.035 * lv, bus, dur * 0.4); this.tone(u, [[0, 70], [dur, 64]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 320, 1]); });
    if (R() < 0.35) this.cue(t + dur * 0.5, (u) => this.knock(u, 420, 0.02 * lv, bus, 0.05));
    return dur;
  },
  /** A newsboy's cry, "Extra! Extra!": two rising shouts, hoarse. */
  nyNewsboy(t, bus, lv) {
    const b = 240 * (0.9 + 0.2 * R());
    this.cue(t, (u) => this.cry(u, b, [[0, 0.22, 'e'], [4, 0.28, 'a']], 0.05 * lv, bus, { cutoff: 3200 }));
    this.cue(t + 0.9, (u) => this.cry(u, b * 1.05, [[0, 0.22, 'e'], [5, 0.4, 'a']], 0.055 * lv, bus, { cutoff: 3200 }));
    return 2.5;
  },
  /** A wireless playing a dance band: a soft muffled stride-piano and brass figure in a narrow band, a murmur of an announcer. */
  nyRadio(t, bus, lv) {
    const notes = [262, 330, 392, 330, 294, 370, 440, 370];
    for (let k = 0; k < 16; k++) this.cue(t + k * 0.3, (u) => { const f = notes[k % 8] * (k % 2 ? 1 : 0.5); this.tone(u, [[0, f]], 0.26, 0.012 * lv, bus, 'triangle', ['bandpass', 1400, 1.2]); if (k % 4 === 0) this.tone(u, [[0, f * 0.5]], 0.3, 0.014 * lv, bus, 'sine'); });
    return 5;
  },
  /** The horse of a milk-wagon: slow hoofbeats on the paving, a harness jingle and the glass bottles clinking. */
  nyHoof(t, bus, lv, f) {
    const dur = f.dur, pace = 0.7;
    for (let k = 0, n = Math.floor(dur / pace); k < n; k++) this.cue(t + k * pace, (u) => { for (const [d, a] of [[0, 1], [0.18, 0.8]]) { this.knock(u + d, 260, 0.04 * lv * a, bus, 0.05); this.burst(u + d, 0.03, 1100, 1.3, 0.02 * lv * a, bus); } if (k % 2) this.clink(u + 0.1, 0.01 * lv, bus); });
    return dur;
  },
  /** A lift's ding and the clunk of its doors in the Empire State's lobby. */
  nyLift(t, bus, lv) { this.cue(t, (u) => this.struck(u, 1560, 0.02 * lv, bus, [[1, 1, 0.6], [2, 0.3, 0.3]])); this.cue(t + 0.7, (u) => { this.knock(u, 140, 0.04 * lv, bus, 0.12); this.rasp(u, 0.7, 900, 0.7, 0.012 * lv, bus, 30, 0.6); }); return 2; },
  /** Grand Central's announcer and a train's call: a long wordless baritone chant echoing under the vault. */
  nyTrainCall(t, bus, lv) { this.cry(t, 118, [[0, 0.5, 'o'], [-1, 0.5, 'a'], [-3, 0.5, 'o'], [0, 0.9, 'u']], 0.04 * lv, bus, { cutoff: 2400 }); return 3.5; },
  /** An automat's coin drop and the clunk of its little glass door. */
  nyAutomat(t, bus, lv) { this.cue(t, (u) => this.struck(u, 3300, 0.02 * lv, bus, [[1, 1, 0.2]])); this.cue(t + 0.5, (u) => this.knock(u, 500, 0.035 * lv, bus, 0.06)); return 1.2; },
  /** Typewriters in an office: a run of keys and the bell of the carriage return. */
  nyTypewriter(t, bus, lv) {
    for (let k = 0; k < 10; k++) this.cue(t + k * 0.11 + R() * 0.03, (u) => this.knock(u, 1500 + 400 * R(), 0.018 * lv, bus, 0.02));
    this.cue(t + 1.3, (u) => this.struck(u, 2400, 0.012 * lv, bus, [[1, 1, 0.3]]));
    return 2;
  },
};
export const NY_GAIN = {};
addVoices('voices-ny.js', NY_VOICES, NY_GAIN);
