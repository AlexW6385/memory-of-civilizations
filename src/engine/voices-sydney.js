// The placed voices of Sydney in 1973 (docs/settlements/sydney.md §14), added to voices.js's VOICES from the map that places them
// (src/settlements/sydney/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and
// returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock, gong, clink) and nothing else: no
// samples. Pitches and contours are [inferred]: no recording of 1973 Circular Quay is kept; what each sound is rests on §14 (the ferries,
// the electric trains of the quay's station, the traffic of the Bridge and the Cahill Expressway, the harbour's gulls, the Garden's
// magpies, cockatoos and kookaburras, the Gadigal didgeridoo and clapsticks of §9, the hotel, milk bar and espresso bar, the tenants'
// television). Every name is prefixed `syd` (VOICES is one shared table).
import { VOICES, addVoices } from './voices.js';

const R = Math.random;
const PLAIN = new WeakMap();

export const SYD_VOICES = {
  /** The scheduler: the clock first, then the common one (the map's emitters, tracks, rooms). */
  sydPlaced(L, t) {
    const P = this.plc, l = this.lis(), M = L.map;
    M.clock.hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1);
    let plain = PLAIN.get(M);
    if (!plain) PLAIN.set(M, plain = { ...M, schedule: undefined });
    return VOICES.placed.call(this, { ...L, map: plain }, t);
  },

  // ── the harbour ──
  /** A ferry's horn: a deep blast, then a short one, a second note a fourth above it (the two-tone horn of the Manly ferries and the Lady class). */
  sydFerryHorn(t, bus, lv) {
    const f0 = 150 + 20 * R();
    this.cue(t, (u) => { this.tone(u, [[0, f0], [0.9, f0 * 0.99]], 0.95, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520, 1.2]); this.tone(u, [[0, f0 * 1.335], [0.9, f0 * 1.32]], 0.95, 0.03 * lv, bus, 'sawtooth', ['lowpass', 640, 1.2]); });
    if (R() < 0.6) this.cue(t + 1.4, (u) => { this.tone(u, [[0, f0], [0.35, f0 * 0.99]], 0.4, 0.045 * lv, bus, 'sawtooth', ['lowpass', 520, 1.2]); this.tone(u, [[0, f0 * 1.335]], 0.4, 0.025 * lv, bus, 'sawtooth', ['lowpass', 640, 1.2]); });
    return 2.6;
  },
  /** A ferry under way: the diesel's beat (about seven a second) and a wash of water, swelling as she passes. */
  sydFerry(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 220, 0.7, 0.03 * lv, bus, dur * 0.4); this.burst(u, dur, 1400, 0.5, 0.012 * lv, bus, dur * 0.5); });
    for (let k = 0, n = Math.floor(dur * 7); k < n; k++) this.cue(t + k / 7, (u) => this.knock(u, 70 + 8 * (k % 3), 0.016 * lv * Math.sin(Math.PI * (k / 7) / dur) ** 0.7, bus, 0.06));
    return dur;
  },
  /** A hydrofoil (the Manly service, from the mid-1960s): a higher, steadier roar with a whine of its gas turbine. */
  sydHydrofoil(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 480, 0.6, 0.04 * lv, bus, dur * 0.35); this.tone(u, [[0, 1100], [dur * 0.5, 1250], [dur, 1100]], dur, 0.008 * lv, bus, 'sawtooth', ['bandpass', 1200, 5]); });
    return dur;
  },
  /** Yachts' halyards slapping their masts in a breeze: a scatter of bright metallic pings of two or three boats, each its own pitch. */
  sydHalyards(t, bus, lv) {
    const base = [1700 + 300 * R(), 2300 + 300 * R(), 2900 + 200 * R()];
    for (let k = 0; k < 11; k++) { const f = base[Math.floor(R() * 3)], w = t + k * 0.55 + R() * 0.4; this.cue(w, (u) => this.struck(u, f, 0.012 * lv * (0.5 + R() * 0.5), bus, [[1, 1, 0.12], [2.7, 0.3, 0.06]])); }
    return 6.5;
  },
  // ── the quay, the Bridge, the streets ──
  /** An electric suburban train drawing into the quay's elevated station: the traction motors' whine rising, the rumble of the viaduct, the brakes' squeal, the air let out, the doors, the guard's whistle. */
  sydTrain(t, bus, lv) {
    this.cue(t, (u) => { this.burst(u, 7, 140, 0.6, 0.1 * lv, bus, 3); this.tone(u, [[0, 300], [3.5, 720], [5.5, 560]], 6, 0.025 * lv, bus, 'sawtooth', ['bandpass', 800, 4]); });
    this.cue(t + 4.8, (u) => this.tone(u, [[0, 2600], [1.4, 1900]], 1.4, 0.02 * lv, bus, 'sawtooth', ['bandpass', 2400, 8]));
    this.cue(t + 6.5, (u) => { this.burst(u, 1.1, 5200, 0.8, 0.014 * lv, bus, 0.1); this.knock(u + 0.9, 110, 0.03 * lv, bus, 0.1); });
    this.cue(t + 9, (u) => this.tone(u, [[0, 2800], [0.35, 2800]], 0.4, 0.01 * lv, bus, 'square', ['bandpass', 2800, 3]));
    return 10;
  },
  /** Cars passing (left-hand traffic): an engine's drone swelling and fading, tyres hissing on the bitumen; some times a bus's diesel clatter. */
  sydTraffic(t, bus, lv, f) {
    const dur = f.dur, bus_ = R() < 0.18;
    this.cue(t, (u) => { this.burst(u, dur, 190, 0.8, 0.032 * lv, bus, dur * 0.4); this.tone(u, [[0, bus_ ? 55 : 80], [dur, bus_ ? 50 : 70]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 340, 1]); });
    if (bus_) for (let k = 0, n = Math.floor(dur * 9); k < n; k++) this.cue(t + k / 9, (u) => this.knock(u, 130, 0.012 * lv, bus, 0.05));
    return dur;
  },
  /** A car's horn: one or two short flat blasts. */
  sydHorn(t, bus, lv) {
    const f0 = 360 + 50 * R(), n = R() < 0.5 ? 1 : 2;
    for (let k = 0; k < n; k++) this.cue(t + k * 0.5, (u) => this.tone(u, [[0, f0], [0.3, f0 * 0.98]], 0.3, 0.035 * lv, bus, 'square', ['bandpass', 900, 1.4]));
    return 1.6;
  },
  /** Traffic on the Harbour Bridge's steel deck: a hum of tyres on the plates and a thump at each expansion joint as the wheels cross it. */
  sydBridge(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 120, 0.8, 0.03 * lv, bus, dur * 0.4); this.tone(u, [[0, 95], [dur, 90]], dur, 0.01 * lv, bus, 'sawtooth', ['lowpass', 300, 1]); });
    for (let k = 0, n = Math.floor(dur / 0.55); k < n; k++) this.cue(t + k * 0.55, (u) => this.knock(u, 85, 0.02 * lv, bus, 0.08));
    return dur;
  },
  /** A gull's harsh falling "kwarr", three or four times, now and then a short quarrelling run. */
  sydGull(t, bus, lv) {
    const f = 1250 + 300 * R(), n = 2 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.5 + 0.15 * R()), (u) => { this.tone(u, [[0, f * 0.9], [0.08, f * 1.15], [0.4, f * 0.65]], 0.42, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1600, 2.5]); this.burst(u, 0.3, 2400, 1, 0.006 * lv, bus); });
    return n * 0.7 + 0.6;
  },

  // ── the Garden and the Point ──
  /** The Australian magpie's carolling: gurgling flute notes, glides up and down, in two or three phrases. */
  sydMagpie(t, bus, lv) {
    const f = 1050 + 120 * R();
    const phrase = [[1, 0.16], [1.5, 0.12], [1.2, 0.2], [1.7, 0.14], [1.1, 0.3], [1.6, 0.18]];
    let w = t;
    for (let p = 0, np = 2 + Math.floor(R() * 2); p < np; p++) {
      for (const [k, d] of phrase) { const a = f * k * (0.96 + 0.08 * R()); this.cue(w, (u) => this.tone(u, [[0, a * 0.92], [d * 0.5, a * 1.08], [d, a]], d, 0.014 * lv, bus, 'sine')); w += d * 0.85; }
      w += 0.5 + 0.3 * R();
    }
    return w - t + 0.5;
  },
  /** A sulphur-crested cockatoo's screech: a raw rising shriek, once or twice. */
  sydCockatoo(t, bus, lv) {
    for (let k = 0, n = 1 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.9, (u) => { this.tone(u, [[0, 1100], [0.1, 1800], [0.55, 1500]], 0.6, 0.016 * lv, bus, 'sawtooth', ['bandpass', 2200, 1.6]); this.burst(u, 0.5, 3200, 0.8, 0.01 * lv, bus, 0.05); });
    return 2.2;
  },
  /** A kookaburra's laugh: a few slow low notes, then the rolling cackle, falling away. */
  sydKookaburra(t, bus, lv) {
    const f = 900 + 80 * R();
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.42, (u) => this.tone(u, [[0, f * 0.9], [0.2, f * 1.1]], 0.25, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1500, 2]));
    for (let k = 0; k < 9; k++) { const w = t + 1.35 + k * 0.2, a = f * (1.25 - k * 0.025); this.cue(w, (u) => this.tone(u, [[0, a * 0.8], [0.06, a * 1.3], [0.16, a * 0.9]], 0.17, 0.034 * lv * (1 - k * 0.04), bus, 'sawtooth', ['bandpass', 1700, 2.5])); }
    return 3.6;
  },
  /** Rainbow lorikeets in the flowering trees: quick shrill chatter, eight or ten short squeaks. */
  sydLorikeet(t, bus, lv) {
    for (let k = 0, n = 7 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * 0.1 + R() * 0.05, (u) => this.tone(u, [[0, 3000 + 600 * R()], [0.05, 3800]], 0.07, 0.01 * lv, bus, 'sawtooth', ['bandpass', 3400, 3]));
    return 1.6;
  },
  /** A busker's didgeridoo with clapsticks (the Gadigal's own instruments, §9): a low drone over a rhythm, vocal toots above it, the sticks' sharp ticks. */
  sydDidgeridoo(t, bus, lv) {
    const f0 = 72 + 3 * R(), beat = 0.46, n = 28;
    for (let k = 0; k < n; k++) {
      const w = t + k * beat, acc = k % 4 === 0 || k % 8 === 3;
      this.cue(w, (u) => {
        this.tone(u, [[0, f0], [beat * 0.9, f0 * (acc ? 1.02 : 1)]], beat * 1.02, 0.024 * lv, bus, 'sawtooth', ['lowpass', acc ? 520 : 360, 2]);
        if (acc) this.tone(u + 0.02, [[0, 540], [0.2, 760], [0.34, 520]], 0.34, 0.008 * lv, bus, 'sawtooth', ['bandpass', 760, 3]);
        this.knock(u, 1500, 0.03 * lv, bus, 0.03); if (k % 2) this.knock(u + beat * 0.5, 1300, 0.02 * lv, bus, 0.03);
      });
    }
    return n * beat + 0.5;
  },

  // ── Sydney's rooms and works ──
  /** A building site: a pneumatic drill's rattle in bursts with pauses, or a pile-driver's slow blows with their ring. */
  sydDrill(t, bus, lv) {
    if (R() < 0.55) { for (let k = 0; k < 3; k++) this.cue(t + k * 2.1, (u) => this.rasp(u, 1.3, 260, 0.8, 0.04 * lv, bus, 30, 0.9)); return 6.5; }
    for (let k = 0; k < 6; k++) this.cue(t + k * 1.3, (u) => { this.knock(u, 62, 0.07 * lv, bus, 0.12); this.struck(u, 480, 0.012 * lv, bus, [[1, 1, 0.5], [2.4, 0.4, 0.3]]); });
    return 8;
  },
  /** The Concert Hall tuning before a performance: the oboe's A, strings taking it up, a scatter of runs and long notes. */
  sydTuning(t, bus, lv) {
    this.cue(t, (u) => this.tone(u, [[0, 440], [3.2, 440.4]], 3.4, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1100, 3]));
    for (let k = 0; k < 14; k++) { const w = t + 2.4 + k * 0.28 + R() * 0.2, f = [196, 293.7, 440, 659.3, 261.6, 392, 523.3][Math.floor(R() * 7)]; this.cue(w, (u) => this.tone(u, [[0, f * 0.995], [0.4, f]], 0.5 + 0.8 * R(), 0.014 * lv, bus, 'sawtooth', ['lowpass', 1600, 1])); }
    return 8;
  },
  /** The theatre bell before the curtain: a run of electric bell rings, three times. */
  sydTheatreBell(t, bus, lv) {
    for (let g = 0; g < 3; g++) for (let k = 0; k < 7; k++) this.cue(t + g * 2.2 + k * 0.07, (u) => this.struck(u, 2300, 0.02 * lv, bus, [[1, 1, 0.1], [2.2, 0.4, 0.06]]));
    return 7;
  },
  /** A jukebox: a thin tune out of a speaker, a walking bass and a snare's tick, at the pace of the day's pop (the tune is ours). */
  sydJukebox(t, bus, lv) {
    const mel = [392, 440, 523, 440, 392, 330, 392, 440, 523, 587, 523, 440, 392, 330, 294, 330], bass = [98, 98, 131, 131, 110, 110, 147, 147];
    for (let k = 0; k < 16; k++) this.cue(t + k * 0.3, (u) => {
      this.tone(u, [[0, mel[k]]], 0.26, 0.02 * lv, bus, 'square', ['bandpass', 1500, 1.1]);
      this.tone(u, [[0, bass[k % 8]]], 0.28, 0.007 * lv, bus, 'triangle', ['lowpass', 500, 1]);
      if (k % 2) this.burst(u, 0.05, 4200, 1.4, 0.012 * lv, bus);
    });
    return 5.3;
  },
  /** Talk in a bar: two men's wordless voices over one another, a laugh, a glass set down. */
  sydPubTalk(t, bus, lv) {
    this.cue(t, (u) => this.cry(u, 118 * (0.9 + 0.2 * R()), [[0, 0.3, 'a'], [3, 0.25, 'o'], [-2, 0.35, 'a'], [0, 0.5, 'o']], 0.03 * lv, bus, { cutoff: 2000 }));
    this.cue(t + 0.8, (u) => this.cry(u, 135 * (0.9 + 0.2 * R()), [[0, 0.25, 'e'], [4, 0.2, 'a'], [1, 0.4, 'o']], 0.026 * lv, bus, { cutoff: 2000 }));
    if (R() < 0.5) this.cue(t + 2.2, (u) => this.cry(u, 150, [[0, 0.12, 'a'], [3, 0.12, 'a'], [0, 0.12, 'a'], [3, 0.12, 'a'], [0, 0.2, 'a']], 0.03 * lv, bus, { cutoff: 2600 }));
    this.cue(t + 1.6, (u) => this.clink(u, 0.012 * lv, bus));
    return 4;
  },
  /** An espresso machine: the grinder's rasp, the steam wand's hiss, a cup set on its saucer. */
  sydEspresso(t, bus, lv) {
    this.cue(t, (u) => this.rasp(u, 1.1, 800, 0.8, 0.02 * lv, bus, 55, 0.8));
    this.cue(t + 2, (u) => this.burst(u, 3, 5200, 0.7, 0.016 * lv, bus, 0.5));
    this.cue(t + 5.5, (u) => this.clink(u, 0.014 * lv, bus));
    return 6.5;
  },
  /** A till: the ring of its bell as the drawer shoots out, then coins. */
  sydTill(t, bus, lv) { this.cue(t, (u) => { this.struck(u, 2800, 0.025 * lv, bus, [[1, 1, 0.5], [2.1, 0.4, 0.3]]); this.knock(u + 0.05, 220, 0.03 * lv, bus, 0.08); }); this.cue(t + 0.5, (u) => this.clink(u, 0.008 * lv, bus)); return 1.4; },
  /** A butcher's cleaver on the block: two or three chops. */
  sydCleaver(t, bus, lv) { for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.5, (u) => { this.knock(u, 190, 0.045 * lv, bus, 0.07); this.burst(u, 0.03, 1300, 1, 0.012 * lv, bus); }); return 2; },
  /** A television in a front room: a muffled band of voice and music, now and then a theme's few notes. */
  sydTelly(t, bus, lv) {
    this.cue(t, (u) => { this.burst(u, 5, 900, 0.7, 0.012 * lv, bus, 1); this.cry(u + 0.5, 130, [[0, 0.35, 'a'], [2, 0.3, 'o'], [-1, 0.4, 'a'], [1, 0.5, 'e']], 0.014 * lv, bus, { cutoff: 1800 }); });
    for (const [k, f] of [330, 392, 494, 392].entries()) this.cue(t + 2.6 + k * 0.25, (u) => this.tone(u, [[0, f]], 0.22, 0.01 * lv, bus, 'triangle', ['bandpass', 1500, 1]));
    return 5;
  },
  /** A kettle on the stove coming to the boil: a thin whistle rising and holding, the lid's rattle. */
  sydKettle(t, bus, lv) { this.cue(t, (u) => { this.tone(u, [[0, 1500], [2.5, 2500], [4, 2550]], 4, 0.01 * lv, bus, 'sine', ['bandpass', 2400, 4]); this.burst(u + 1, 3, 3000, 1, 0.006 * lv, bus, 1); }); return 4.5; },
  /** A fish-and-chip shop's fryer: a crackling hiss of the basket lowered in the oil. */
  sydFryer(t, bus, lv) { this.cue(t, (u) => this.rasp(u, 2.2, 3800, 0.6, 0.016 * lv, bus, 90, 0.9)); this.cue(t + 2.6, (u) => this.knock(u, 300, 0.02 * lv, bus, 0.06)); return 3; },
};
export const SYD_GAIN = {};
addVoices('voices-sydney.js', SYD_VOICES, SYD_GAIN);
