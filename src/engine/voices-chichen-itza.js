// The placed voices of Chichén Itzá about 1000 (docs/settlements/chichen-itza.md §19.3; src/settlements/chichen-itza/soundmap.js says where each is made and when).
// Added to voices.js's VOICES from here (addVoices), every name prefixed `chz`; the engine's own voices that suit (the broom, the kitchen's pots, the hubbub) are used by the map as they
// are. All synthesised, no samples. [inferred throughout: no recording of Toltec-Maya music or work exists; what each sound is rests on the dossier §19.3 — the shell trumpet, the slit drum
// (tunkul), the turtle-shell drum struck with an antler, clay flutes and bird whistles, the gourd rattle (the instruments of Maya murals and burials), the metate and tortilla,
// the backstrap loom's batten, the masons' lime; the pitches, rhythms and contours are ours. The two sounds of the place that are measured, not guessed, are the chirped echo of a clap
// at the foot of the Castillo's stair, falling like the quetzal's call [stated: Declercq, Degrieck, Briers and Leroy 2004, "Acoustic diffraction by the staircase of El Castillo"; Lubman 1998],
// and the Great Ball Court's long echo, which sends a voice or a clap down the alley and back [stated: widely reported; the number of its echoes is ours].]
import { addVoices } from './voices.js';

const R = Math.random;

export const CHZ_VOICES = {
  /** The shell trumpet blown from a temple's top: two or three long, rough, slurred blasts, the second a little higher, a pause between. */
  chzConch(t, bus, lv) {
    const f = 233 * (0.95 + R() * 0.1), n = 2 + Math.floor(R() * 2);
    let w = t;
    for (let k = 0; k < n; k++) {
      const dur = 2.4 + R() * 1.0, g = f * (k === 1 ? 1.12 : 1);
      this.cue(w, (x) => {
        this.tone(x, [[0, g * 0.82], [0.45, g], [dur, g * 0.97]], dur, 0.05 * lv, bus, 'sawtooth', ['lowpass', 640, 0.8]);
        this.tone(x + 0.04, [[0, g * 2.02]], dur * 0.85, 0.011 * lv, bus, 'sawtooth', ['lowpass', 1300, 0.8]);
        this.burst(x, 0.35, 800, 0.8, 0.008 * lv, bus, 0.1);
      });
      w += dur + 1.0 + R() * 0.8;
    }
    return w - t;
  },
  /** The tunkul, the slit drum: a hollowed log struck with rubber-tipped sticks, two notes (the two lips of the slit), in a slow figure that repeats. */
  chzTunkul(t, bus, lv) {
    const hi = 330 * (0.97 + R() * 0.06), lo = hi * 0.74, pat = [[0, lo, 1], [0.5, hi, 0.7], [0.75, lo, 0.6], [1.5, hi, 0.8], [2.0, lo, 1], [2.5, hi, 0.6]], rounds = 3 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < rounds; k++) { for (const [d, f, a] of pat) this.cue(w + d, (x) => { this.struck(x, f, 0.07 * lv * a, bus, [[1, 1, 0.35], [2.76, 0.3, 0.18], [5.4, 0.1, 0.1]]); this.knock(x, 180, 0.03 * lv * a, bus, 0.04); }); w += 3.1; }
    return w - t + 0.8;
  },
  /** The turtle-shell drum (ayotl) struck with an antler: a dull, hollow note with a short ring, an offbeat figure. */
  chzAyotl(t, bus, lv) {
    const pat = [[0, 1], [0.7, 0.55], [1.1, 0.8], [2.0, 1], [2.7, 0.5]], rounds = 3 + Math.floor(R() * 3), f = 150 * (0.95 + R() * 0.1);
    let w = t;
    for (let k = 0; k < rounds; k++) { for (const [d, a] of pat) this.cue(w + d, (x) => { this.tone(x, [[0, f * 1.25], [0.12, f]], 0.35, 0.09 * lv * a, bus); this.burst(x, 0.04, 2200, 1, 0.03 * lv * a, bus); }); w += 3.3; }
    return w - t + 0.7;
  },
  /** A clay flute (a bird-bone or clay tube, a few holes): a breathy, hooting pentatonic phrase that settles on its low note. */
  chzFlute(t, bus, lv) {
    const S = [0, 2, 5, 7, 9, 12], base = 523 * (0.94 + R() * 0.12), n = 6 + Math.floor(R() * 5);
    let w = t, deg = 3;
    for (let k = 0; k < n; k++) {
      deg = k === n - 1 ? 0 : Math.max(0, Math.min(S.length - 1, deg + Math.floor(R() * 3) - 1));
      const f = base * Math.pow(2, S[deg] / 12), dur = 0.35 + R() * 0.55;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.98], [0.07, f], [dur, f * 1.003]], dur, 0.02 * lv, bus, 'sine'); this.burst(x, 0.1, 3000, 1, 0.0045 * lv, bus, 0.01); });
      w += dur + 0.08 + (k % 4 === 3 ? 0.45 : 0);
    }
    return w - t + 0.6;
  },
  /** A bird whistle of clay (the whistling jars and bird-shaped whistles of the Maya): a warbling, trilled call, a few repeats. */
  chzWhistle(t, bus, lv) {
    const f = 1500 * (0.9 + R() * 0.25), n = 3 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.36, (x) => { this.tone(x, [[0, f * 0.95], [0.04, f * 1.12], [0.08, f * 0.98], [0.13, f * 1.1]], 0.16, 0.014 * lv, bus, 'sine'); this.burst(x, 0.07, 4300, 1, 0.003 * lv, bus, 0.01); });
    return n * 0.36 + 0.3;
  },
  /** A gourd rattle shaken by a priest at the rites: a hiss of seeds in a steady pulse. */
  chzRattle(t, bus, lv) {
    const n = 12 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.burst(x, 0.09, 5000, 0.9, 0.014 * lv * (k % 3 === 0 ? 1 : 0.7), bus, 0.01)); w += k % 3 === 2 ? 0.33 : 0.17; }
    return w - t + 0.4;
  },
  /** The metate: the stone hand drawn over the grinding stone, a stroke after stroke, a knock of stone at the end of each. */
  chzMetate(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.55, 1200 + R() * 200, 0.9, 0.026 * lv, bus, 3.2, 0.9); this.knock(x + 0.52, 250, 0.012 * lv, bus, 0.04); }); w += 0.85 + R() * 0.2; }
    return w - t + 0.8;
  },
  /** Tortillas patted out between the palms: soft pairs of slaps, a pause for the comal. */
  chzTortilla(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.knock(x, 400 + R() * 60, 0.02 * lv, bus, 0.05); this.burst(x, 0.04, 1800, 0.8, 0.008 * lv, bus); }); w += k % 2 ? 0.38 + R() * 0.1 : 0.27; if (k === Math.floor(n / 2)) w += 0.7; }
    return w - t + 0.6;
  },
  /** The backstrap loom: the batten's dull knock against the weft, the thread drawn through, again and again at an easy pace. */
  chzWeave(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.3, 2600, 0.8, 0.008 * lv, bus, 60, 0.7); this.knock(x + 0.32, 190, 0.02 * lv, bus, 0.06); }); w += 0.62 + R() * 0.2; }
    return w - t + 0.5;
  },
  /** The masons renewing the plaster of the Castillo's terraces: a trowel of lime drawn in long strokes, a slap of the wet plaster between, a hammer's tap on a block. */
  chzPlaster(t, bus, lv) {
    const n = 5 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.7, 1900 + R() * 300, 0.8, 0.012 * lv, bus, 14, 0.7); this.knock(x + 0.75, 230, 0.014 * lv, bus, 0.05); }); if (k % 3 === 2) this.cue(w + 1.1, (x) => this.struck(x, 2300 + R() * 600, 0.02 * lv, bus, [[1, 1, 0.07], [2.4, 0.4, 0.05]])); w += 1.1 + R() * 0.4; }
    return w - t + 0.6;
  },
  /** A turkey's gobble: a run of rapid, rattling pulses falling in pitch. */
  chzTurkey(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), f = 520 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.075, (x) => this.tone(x, [[0, f * (1 - k * 0.02)], [0.05, f * 0.7]], 0.07, 0.045 * lv, bus, 'sawtooth', ['bandpass', 700, 2]));
    return n * 0.075 + 0.5;
  },
  /** A seller's cry in the market (wordless): a call that rises and falls away, in a man's or a woman's voice. */
  chzCry(t, bus, lv) {
    const fem = R() < 0.6, f0 = (fem ? 240 : 140) * (0.93 + R() * 0.14), C = [
      [[0, 0.3, 'a'], [5, 0.3, 'o'], [9, 0.7, 'a'], [3, 0.6, 'o']],
      [[7, 0.25, 'e'], [4, 0.25, 'a'], [0, 0.9, 'o']],
      [[0, 0.4, 'o'], [4, 0.4, 'a'], [7, 0.9, 'a'], [2, 0.5, 'u']],
    ][Math.floor(R() * 3)];
    this.cry(t, f0, C, 0.05 * lv, bus, { fem, cutoff: 4000 });
    return C.reduce((s, c) => s + c[1], 0) + 0.8;
  },
  /** A clap (a pilgrim's, at the foot of the Castillo's stair) and the chirped echo the stair sends back, a falling tone like the quetzal's call, repeating fainter. */
  chzStairChirp(t, bus, lv) {
    this.burst(t, 0.05, 2600, 0.8, 0.06 * lv, bus, 0.005);
    let w = t + 0.16, a = 1;
    for (let k = 0; k < 3; k++) { const at = w; this.cue(at, (x) => this.tone(x, [[0, 2900], [0.1, 1800], [0.22, 1250]], 0.24, 0.02 * lv * a, bus, 'sine')); w += 0.3; a *= 0.55; }
    return w - t + 0.5;
  },
  /** The rubber ball of the game on stone: its hard bounces on the alley's floor and a wall, a hip's slap, a shout, and the long echo of the court. */
  chzBall(t, bus, lv) {
    let w = t, g = 1;
    const n = 4 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, 175], [0.09, 105]], 0.2, 0.07 * lv * g, bus); this.burst(x, 0.03, 1500, 1, 0.025 * lv * g, bus); });
      w += 0.5 * g + 0.12; g *= 0.82;
    }
    this.cue(t + 0.3, (x) => this.burst(x, 0.08, 900, 0.9, 0.04 * lv, bus, 0.01));                           // a hip's slap
    this.cry(t + 1.3 + R() * 1.0, 150 * (0.93 + R() * 0.14), [[0, 0.3, 'a'], [5, 0.5, 'o']], 0.045 * lv, bus, { fem: false, cutoff: 3600 });
    return w - t + 1.2;
  },
  /** Water poured on the hot stones of the sweat bath: a long hiss that swells and dies. */
  chzHiss(t, bus, lv) {
    const dur = 3 + R() * 2;
    this.burst(t, dur, 5200, 0.6, 0.025 * lv, bus, 0.3);
    return dur + 0.6;
  },
  /** Drops falling into the water 20 m down the cenote, each a small tick with its long, hollow echo off the walls. */
  chzDrip(t, bus, lv) {
    const n = 2 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.struck(x, 900 + R() * 400, 0.016 * lv, bus, [[1, 1, 0.12], [2.1, 0.3, 0.08]]); this.struck(x + 0.55, 800 + R() * 300, 0.006 * lv, bus, [[1, 1, 0.3]]); }); w += 0.9 + R() * 1.3; }
    return w - t + 1.0;
  },
  /** An owl in the night (the owl, a bird of the underworld in Maya belief): two or three low hoots, the second after a short pause. */
  chzOwl(t, bus, lv) {
    const f = 320 * (0.93 + R() * 0.14), n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.95, (x) => { this.tone(x, [[0, f * 1.05], [0.35, f * 0.92]], 0.45, 0.03 * lv, bus, 'sine'); this.burst(x, 0.15, 900, 1, 0.004 * lv, bus, 0.05); });
    return n * 0.95 + 0.8;
  },
  /** The motmot's low, hollow double hoot ('toh'), at the forest's edge at dawn and dusk. */
  chzMotmot(t, bus, lv) {
    const f = 410 * (0.95 + R() * 0.1);
    for (let k = 0; k < 2; k++) this.cue(t + k * 0.55, (x) => this.tone(x, [[0, f * 0.95], [0.1, f], [0.3, f * 0.9]], 0.34, 0.03 * lv, bus, 'sine', ['bandpass', 650, 2]));
    return 1.6;
  },
};
export const CHZ_GAIN = {};
addVoices('voices-chichen-itza.js', CHZ_VOICES, CHZ_GAIN);
