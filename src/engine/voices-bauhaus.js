// The placed voices of Bauhaus Dessau, c. 1927 (docs/settlements/bauhaus-dessau.md §15.3), added to voices.js's VOICES from the map that places them
// (src/settlements/bauhaus-dessau/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and
// returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock, clink) and nothing else: no samples. Pitches and
// contours are [inferred]: no recording of Dessau in 1927 is kept; what each sound is rests on §15.3 (the tram, bicycles, the Junkers works' siren and
// aircraft, church bells of the old town, the school's workshops, the Aula's piano and the Bauhaus band's jazz, the shops and pubs, the flats).
// Every name is prefixed `bau` (VOICES is one shared table; a duplicate throws).
import { VOICES, addVoices } from './voices.js';

const R = Math.random;
const PLAIN = new WeakMap();

export const BAU_VOICES = {
  /** The scheduler: the clock first, then the common one (the map's emitters, tracks, rooms). */
  bauPlaced(L, t) {
    const P = this.plc, l = this.lis(), M = L.map;
    M.clock.hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1);
    let plain = PLAIN.get(M);
    if (!plain) PLAIN.set(M, plain = { ...M, schedule: undefined });
    return VOICES.placed.call(this, { ...L, map: plain }, t);
  },

  // ── the streets ──
  /** A tram under way: the motors' whine rising with the car's speed, the wheels' rumble and the joints' beat, a bell at the start and a squeal at the bend. */
  bauTram(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 180, 0.7, 0.04 * lv, bus, dur * 0.4); this.tone(u, [[0, 260], [dur * 0.4, 520], [dur, 430]], dur, 0.012 * lv, bus, 'sawtooth', ['bandpass', 700, 4]); });
    for (let k = 0, n = Math.floor(dur * 2.6); k < n; k++) this.cue(t + k / 2.6, (u) => this.knock(u, 90, 0.014 * lv * Math.sin(Math.PI * (k / 2.6) / dur) ** 0.7, bus, 0.06));
    this.cue(t + 0.2, (u) => { this.struck(u, 1050, 0.02 * lv, bus, [[1, 1, 0.45], [2.4, 0.4, 0.2]]); this.struck(u + 0.22, 1050, 0.02 * lv, bus, [[1, 1, 0.45], [2.4, 0.4, 0.2]]); });
    if (R() < 0.35) this.cue(t + dur * 0.55, (u) => this.tone(u, [[0, 2900], [0.7, 2300]], 0.7, 0.006 * lv, bus, 'sawtooth', ['bandpass', 2600, 8]));
    return dur;
  },
  /** The tram's foot-gong (the driver's bell): two or three quick strokes of a flat bell. */
  bauTramBell(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.24, (u) => this.struck(u, 1000 + 40 * R(), 0.03 * lv, bus, [[1, 1, 0.5], [2.35, 0.45, 0.22], [3.9, 0.15, 0.1]]));
    return 1.6;
  },
  /** A bicycle passing: the free-wheel's ticking, a rider's bell trilled once. */
  bauBicycle(t, bus, lv, f) {
    const dur = f.dur;
    for (let k = 0, n = Math.floor(dur * 14); k < n; k++) this.cue(t + k / 14, (u) => this.knock(u, 3200 + 200 * (k % 3), 0.0045 * lv * Math.sin(Math.PI * (k / 14) / dur), bus, 0.012));
    this.cue(t, (u) => this.burst(u, dur, 1400, 0.6, 0.006 * lv, bus, dur * 0.4));
    if (R() < 0.45) { const w = t + dur * (0.2 + 0.3 * R()); for (let k = 0; k < 7; k++) this.cue(w + k * 0.045, (u) => this.struck(u, 2650, 0.012 * lv, bus, [[1, 1, 0.12], [2.7, 0.3, 0.06]])); }
    return dur;
  },
  /** A motor car of the 1920s passing: a rough four-cylinder chug swelling and fading, now and then the bulb horn. */
  bauCar(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 160, 0.8, 0.026 * lv, bus, dur * 0.4); this.tone(u, [[0, 70], [dur, 62]], dur, 0.012 * lv, bus, 'sawtooth', ['lowpass', 300, 1]); });
    for (let k = 0, n = Math.floor(dur * 11); k < n; k++) this.cue(t + k / 11, (u) => this.knock(u, 110, 0.012 * lv * Math.sin(Math.PI * (k / 11) / dur) ** 0.7, bus, 0.05));
    if (R() < 0.2) this.cue(t + dur * 0.3, (u) => this.tone(u, [[0, 330], [0.12, 410], [0.45, 395]], 0.5, 0.03 * lv, bus, 'square', ['bandpass', 800, 1.3]));
    return dur;
  },
  /** A car's bulb horn: the squeezed rubber bulb, a nasal two-tone honk once or twice. */
  bauHorn(t, bus, lv) {
    for (let k = 0, n = 1 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.7, (u) => { this.tone(u, [[0, 330], [0.1, 420], [0.38, 400]], 0.42, 0.035 * lv, bus, 'square', ['bandpass', 850, 1.3]); this.tone(u, [[0, 495], [0.1, 560]], 0.4, 0.012 * lv, bus, 'square', ['bandpass', 1200, 1.5]); });
    return 2;
  },
  /** A horse and cart at a walk: shod hooves on the setts, two beats to a step, the iron tyres' grinding rumble and the harness' jingle. */
  bauCart(t, bus, lv, f) {
    const dur = f.dur, g = Math.floor(dur * 2.2);
    this.cue(t, (u) => this.burst(u, dur, 260, 0.6, 0.016 * lv, bus, dur * 0.4));
    for (let k = 0; k < g; k++) { const a = Math.sin(Math.PI * (k / g)) ** 0.7; this.cue(t + k / 2.2, (u) => { this.knock(u, 820 + 60 * (k % 2), 0.03 * lv * a, bus, 0.035); this.knock(u + 0.17, 700, 0.02 * lv * a, bus, 0.035); }); }
    this.cue(t + dur * 0.4, (u) => this.struck(u, 3400, 0.004 * lv, bus, [[1, 1, 0.25], [1.5, 0.5, 0.2]]));
    return dur;
  },
  /** The bells of a church in the old town, far off: a deep bell struck four or five times, its hum and tierce dying away. */
  bauChurchBell(t, bus, lv) {
    const f = 196 * (0.95 + 0.1 * R()), n = 4 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 2.3, (u) => this.struck(u, f, 0.05 * lv, bus, [[0.5, 0.6, 3.6], [1, 1, 3.2], [1.2, 0.6, 2.4], [1.5, 0.35, 2], [2, 0.3, 1.4], [2.7, 0.12, 0.7]]));
    return n * 2.3 + 3;
  },
  /** The works' siren at the change of shift: a rising howl held, then falling away (the Junkers works, far to the south-west). */
  bauSiren(t, bus, lv) {
    this.cue(t, (u) => { this.tone(u, [[0, 220], [2.4, 520], [6.5, 520], [9, 250]], 9.5, 0.04 * lv, bus, 'sawtooth', ['bandpass', 650, 2.2]); this.burst(u, 9, 900, 0.5, 0.008 * lv, bus, 2); });
    return 10;
  },
  /** An aeroplane passing high over (a Junkers F 13's single engine): a steady low drone and rasp, swelling and passing, the pitch sagging as it goes. */
  bauAircraft(t, bus, lv, f) {
    const dur = f.dur;
    this.cue(t, (u) => { this.burst(u, dur, 140, 0.7, 0.03 * lv, bus, dur * 0.45); this.tone(u, [[0, 118], [dur * 0.5, 112], [dur, 100]], dur, 0.014 * lv, bus, 'sawtooth', ['lowpass', 380, 1]); this.rasp(u, dur, 520, 0.7, 0.008 * lv, bus, 64, 0.8); });
    return dur;
  },

  // ── yards, fields, the pump ──
  /** Hens in a garden: soft broken clucks, and one hen's rising cackle after an egg. */
  bauHens(t, bus, lv) {
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * 0.35 + R() * 0.2, (u) => this.tone(u, [[0, 480 + 60 * R()], [0.07, 600], [0.14, 460]], 0.16, 0.012 * lv, bus, 'sawtooth', ['bandpass', 900, 2]));
    if (R() < 0.3) for (let k = 0; k < 6; k++) this.cue(t + 3 + k * 0.13, (u) => this.tone(u, [[0, 620], [0.06, 820]], 0.1, 0.015 * lv, bus, 'sawtooth', ['bandpass', 1100, 2]));
    return 6;
  },
  /** The cast-iron street pump: the handle's squeak, a gush on each stroke, the trough filling. */
  bauPump(t, bus, lv) {
    for (let k = 0; k < 5; k++) this.cue(t + k * 0.8, (u) => { this.tone(u, [[0, 900], [0.3, 1250]], 0.32, 0.006 * lv, bus, 'sawtooth', ['bandpass', 1500, 6]); this.burst(u + 0.3, 0.45, 1800, 0.6, 0.016 * lv, bus, 0.05); });
    return 4.8;
  },
  /** A game on the sports field: the thud of a kicked ball, wordless shouts, a whistle. */
  bauBallGame(t, bus, lv) {
    for (let k = 0; k < 7; k++) { const w = t + k * (0.7 + 0.5 * R()); this.cue(w, (u) => this.knock(u, 150 + 20 * R(), 0.03 * lv, bus, 0.07)); if (R() < 0.4) this.cue(w + 0.3, (u) => this.cry(u, 160 + 30 * R(), [[0, 0.25, 'a'], [3, 0.3, 'o']], 0.016 * lv, bus, { cutoff: 2400 })); }
    if (R() < 0.3) this.cue(t + 6, (u) => this.tone(u, [[0, 2500]], 0.5, 0.01 * lv, bus, 'square', ['bandpass', 2500, 4]));
    return 7;
  },
  /** Children at play in the street: high wordless calls and laughter, a skipping rope's slap. */
  bauChildren(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * 0.6 + R() * 0.3, (u) => this.cry(u, 320 + 80 * R(), [[0, 0.2, 'a'], [4, 0.2, 'e'], [2, 0.3, 'a']], 0.02 * lv, bus, { cutoff: 3200, fem: R() < 0.5 }));
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.42, (u) => this.knock(u, 700, 0.006 * lv, bus, 0.03));
    return 4.5;
  },

  // ── shops, pubs, flats ──
  /** The shop's door bell: a spring bell over the door jangling as it opens and swinging to rest. */
  bauDoorBell(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * 0.085, (u) => this.struck(u, 3300 + 120 * (k % 2), 0.016 * lv * (1 - k * 0.12), bus, [[1, 1, 0.3], [1.9, 0.4, 0.15]]));
    return 1.4;
  },
  /** A till's bell and the clink of change. */
  bauTill(t, bus, lv) { this.cue(t, (u) => { this.struck(u, 2600, 0.022 * lv, bus, [[1, 1, 0.5], [2.1, 0.4, 0.3]]); this.knock(u + 0.05, 220, 0.028 * lv, bus, 0.08); }); this.cue(t + 0.5, (u) => this.clink(u, 0.008 * lv, bus)); return 1.4; },
  /** A butcher's cleaver on the block: two or three chops. */
  bauCleaver(t, bus, lv) { for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) this.cue(t + k * 0.5, (u) => { this.knock(u, 190, 0.045 * lv, bus, 0.07); this.burst(u, 0.03, 1300, 1, 0.012 * lv, bus); }); return 2; },
  /** A coffee mill's cranking: a ratcheting grind, a drawer shut at the end. */
  bauMill(t, bus, lv) { this.cue(t, (u) => this.rasp(u, 2.2, 900, 0.8, 0.014 * lv, bus, 7, 0.9)); this.cue(t + 2.5, (u) => this.knock(u, 160, 0.02 * lv, bus, 0.07)); return 3; },
  /** Talk in a pub: two men's wordless voices over one another, a laugh, a glass set down. */
  bauPubTalk(t, bus, lv) {
    this.cue(t, (u) => this.cry(u, 118 * (0.9 + 0.2 * R()), [[0, 0.3, 'a'], [3, 0.25, 'o'], [-2, 0.35, 'a'], [0, 0.5, 'o']], 0.03 * lv, bus, { cutoff: 2000 }));
    this.cue(t + 0.8, (u) => this.cry(u, 135 * (0.9 + 0.2 * R()), [[0, 0.25, 'e'], [4, 0.2, 'a'], [1, 0.4, 'o']], 0.026 * lv, bus, { cutoff: 2000 }));
    if (R() < 0.5) this.cue(t + 2.2, (u) => this.cry(u, 150, [[0, 0.12, 'a'], [3, 0.12, 'a'], [0, 0.12, 'a'], [3, 0.12, 'a'], [0, 0.2, 'a']], 0.03 * lv, bus, { cutoff: 2600 }));
    this.cue(t + 1.6, (u) => this.clink(u, 0.012 * lv, bus));
    return 4;
  },
  /** Beer glasses chinked: a toast, three clinks and a knock of a mug on the table. */
  bauGlasses(t, bus, lv) { for (let k = 0; k < 3; k++) this.cue(t + k * 0.22, (u) => this.clink(u, 0.012 * lv, bus)); this.cue(t + 1, (u) => this.knock(u, 260, 0.02 * lv, bus, 0.08)); return 2; },
  /** A clock on the flat's wall: a dry tick-tock for a few seconds, now and then the hour's strokes. */
  bauClock(t, bus, lv) {
    for (let k = 0; k < 8; k++) this.cue(t + k * 0.5, (u) => this.knock(u, k % 2 ? 1500 : 1750, 0.008 * lv, bus, 0.015));
    if (R() < 0.3) for (let k = 0; k < 3; k++) this.cue(t + 4.4 + k * 1.1, (u) => this.struck(u, 660, 0.014 * lv, bus, [[1, 1, 1.2], [2.3, 0.3, 0.6]]));
    return 7.5;
  },
  /** A gramophone in a flat or a studio: a thin horn-tone tune over the needle's hiss, a dance record's beat (the tune is ours). */
  bauGramophone(t, bus, lv) {
    const mel = [392, 494, 587, 494, 440, 392, 330, 392, 494, 587, 659, 587, 494, 440, 392, 330], bass = [98, 98, 123, 123, 110, 110, 147, 147];
    this.cue(t, (u) => this.burst(u, 5.2, 4200, 0.4, 0.004 * lv, bus, 0.2));
    for (let k = 0; k < 16; k++) this.cue(t + k * 0.32, (u) => {
      this.tone(u, [[0, mel[k]]], 0.28, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1300, 1.4]);
      this.tone(u, [[0, bass[k % 8]]], 0.3, 0.005 * lv, bus, 'triangle', ['lowpass', 420, 1]);
      if (k % 2) this.burst(u, 0.05, 3800, 1.4, 0.006 * lv, bus);
    });
    return 5.5;
  },

  // ── the school ──
  /** A circular saw in the carpentry workshop: the blade's rising whine as a board is fed, its drop as it comes through, the idle's hum. */
  bauSaw(t, bus, lv) {
    this.cue(t, (u) => { this.tone(u, [[0, 380], [0.5, 560], [2, 520], [2.3, 380], [3.2, 330]], 3.4, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1400, 2.5]); this.rasp(u + 0.5, 1.8, 3000, 0.6, 0.02 * lv, bus, 120, 0.9); });
    return 3.6;
  },
  /** A hammer on an anvil in the metal workshop: a few ringing blows of a smith or a coppersmith, then the file. */
  bauAnvil(t, bus, lv) {
    for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (0.4 + 0.1 * R()), (u) => { this.struck(u, 880 + 40 * (k % 2), 0.026 * lv, bus, [[1, 1, 0.5], [2.76, 0.5, 0.25], [5.4, 0.2, 0.12]]); this.knock(u, 300, 0.02 * lv, bus, 0.04); });
    this.cue(t + 3, (u) => this.rasp(u, 1.2, 4200, 0.6, 0.012 * lv, bus, 14, 0.9));
    return 4.5;
  },
  /** A typewriter in the school office: a run of keys, the carriage's bell and its return. */
  bauTypewriter(t, bus, lv) {
    for (let k = 0, n = 14 + Math.floor(R() * 8); k < n; k++) this.cue(t + k * (0.085 + 0.06 * R()), (u) => this.knock(u, 2300 + 600 * R(), 0.012 * lv, bus, 0.012));
    this.cue(t + 2.4, (u) => this.struck(u, 2200, 0.014 * lv, bus, [[1, 1, 0.6], [2.4, 0.3, 0.3]]));
    this.cue(t + 2.8, (u) => this.rasp(u, 0.35, 1800, 0.6, 0.012 * lv, bus, 40, 0.9));
    return 3.6;
  },
  /** A piano in the Aula: a short stride figure, the bass on the beat and chords off it, a run up (the tune is ours: a foxtrot-like phrase). */
  bauPiano(t, bus, lv) {
    const note = (u, f, a) => this.struck(u, f, a * lv, bus, [[1, 1, 1.1], [2, 0.5, 0.7], [3, 0.25, 0.45], [4, 0.1, 0.3]]);
    const mel = [523, 587, 659, 587, 523, 392, 440, 523, 587, 659, 784, 659, 587, 523, 440, 392], bass = [131, 196, 131, 196, 147, 220, 147, 220], tri = [[330, 392, 523], [370, 440, 587]];
    for (let k = 0; k < 16; k++) {
      const w = t + k * 0.28;
      this.cue(w, (u) => { note(u, mel[k], 0.016); if (k % 2 === 0) note(u, bass[(k / 2) % 8], 0.02); else for (const f of tri[((k - 1) / 2) % 2]) note(u, f, 0.008); });
    }
    return 4.8;
  },
  /** A lecturer's voice in a lecture room: a steady wordless voice rising and falling in phrases, chalk tapping, a chair shifting. */
  bauLecture(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 2.4, (u) => this.cry(u, 108 + 10 * R(), [[0, 0.35, 'a'], [2, 0.3, 'e'], [4, 0.3, 'o'], [0, 0.4, 'a'], [-2, 0.5, 'o']], 0.024 * lv, bus, { cutoff: 1800 }));
    this.cue(t + 1.2, (u) => { this.knock(u, 1900, 0.01 * lv, bus, 0.015); this.knock(u + 0.12, 1700, 0.008 * lv, bus, 0.015); });
    this.cue(t + 5, (u) => this.knock(u, 240, 0.012 * lv, bus, 0.09));
    return 7.5;
  },
  /** A canteen at the meal: plates and cutlery, a low murmur of voices, a chair drawn back. */
  bauCanteen(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * (0.4 + 0.3 * R()), (u) => this.clink(u, 0.01 * lv, bus));
    this.cue(t, (u) => this.cry(u, 125 * (0.9 + 0.2 * R()), [[0, 0.3, 'a'], [3, 0.3, 'o'], [-1, 0.35, 'e']], 0.022 * lv, bus, { cutoff: 1800 }));
    this.cue(t + 1.4, (u) => this.cry(u, 215 * (0.9 + 0.2 * R()), [[0, 0.25, 'a'], [2, 0.3, 'e']], 0.016 * lv, bus, { cutoff: 2200, fem: true }));
    this.cue(t + 3, (u) => this.rasp(u, 0.3, 400, 0.7, 0.01 * lv, bus, 30, 0.8));
    return 4.5;
  },
  /** The murmur of a workroom: low talk of two or three, a stool scraping, a brush tapped on a jar. */
  bauMurmur(t, bus, lv) {
    this.cue(t, (u) => this.cry(u, 120 * (0.9 + 0.2 * R()), [[0, 0.3, 'o'], [2, 0.3, 'a'], [-2, 0.4, 'o']], 0.02 * lv, bus, { cutoff: 1700 }));
    this.cue(t + 1.2, (u) => this.cry(u, 210 * (0.9 + 0.2 * R()), [[0, 0.3, 'a'], [3, 0.3, 'e']], 0.014 * lv, bus, { cutoff: 2000, fem: true }));
    this.cue(t + 2.4, (u) => this.struck(u, 1900, 0.008 * lv, bus, [[1, 1, 0.1]]));
    return 3.8;
  },
};
export const BAU_GAIN = {};
addVoices('voices-bauhaus.js', BAU_VOICES, BAU_GAIN);
