// The placed voices of Teotihuacan about 400 (docs/settlements/teotihuacan.md §20), added to voices.js's VOICES from the map that places them
// (src/settlements/teotihuacan/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and
// returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock) and nothing else: no samples.
// What each is rests on §20: the conch trumpets the murals show (the plumed felines blowing shells), clay flutes and whistles and drums
// (the dossier's §9), the household's metate and comal, the knappers' strikes, the weavers' battens, the masons' lime; the pitches,
// rhythms and contours are all [inferred]: no recording of the 5th century exists. Every name is prefixed `tth` (VOICES is one shared table).
import { addVoices } from './voices.js';

const R = Math.random;

export const TTH_VOICES = {
  /** The shell trumpet (a conch blown at its apex): two or three long, low, rough blasts, each swelling from a slurred start, a pause between. */
  tthConch(t, bus, lv) {
    const f = 247 * (0.96 + R() * 0.08), n = 2 + Math.floor(R() * 2);
    let w = t;
    for (let k = 0; k < n; k++) {
      const dur = 2.2 + R() * 1.2;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * 0.86], [0.5, f]], dur, 0.05 * lv, bus, 'sawtooth', ['lowpass', 680, 0.8]);
        this.tone(x + 0.05, [[0, f * 2.01]], dur * 0.9, 0.012 * lv, bus, 'sawtooth', ['lowpass', 1400, 0.8]);
        this.burst(x, 0.3, 850, 0.8, 0.008 * lv, bus, 0.1);
      });
      w += dur + 1.1 + R() * 0.8;
    }
    return w - t;
  },
  /** An upright drum with a skin: a slow figure of deep strokes and lighter ones between, over and over. */
  tthDrum(t, bus, lv) {
    const pat = [[0, 1], [0.6, 0.5], [1.0, 0.5], [1.6, 1], [2.2, 0.55], [2.6, 0.5]], rounds = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < rounds; k++) {
      for (const [d, a] of pat) this.cue(w + d, (x) => {
        this.tone(x, [[0, 150 * (0.98 + R() * 0.04)], [0.15, 88]], 0.5, 0.1 * lv * a, bus);
        this.tone(x, [[0, 300], [0.08, 190]], 0.16, 0.03 * lv * a, bus);
        this.burst(x, 0.05, 300, 1.2, 0.05 * lv * a, bus);
      });
      w += 3.2;
    }
    return w - t + 0.8;
  },
  /** A clay flute: a thin, breathy whistle playing a short melody on a pentatonic scale. */
  tthFlute(t, bus, lv) {
    const S = [0, 3, 5, 7, 10, 12], base = 560 * (0.95 + R() * 0.1), n = 7 + Math.floor(R() * 5);
    let w = t, deg = 2 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      deg = Math.max(0, Math.min(S.length - 1, deg + Math.floor(R() * 3) - 1));
      const f = base * Math.pow(2, S[deg] / 12), dur = 0.3 + R() * 0.5;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.985], [0.06, f]], dur, 0.022 * lv, bus, 'sine'); this.burst(x, 0.08, 3400, 1, 0.004 * lv, bus, 0.01); });
      w += dur + 0.06 + (k % 5 === 4 ? 0.4 : 0);
    }
    return w - t + 0.4;
  },
  /** A clay whistle: three or four short, shrill chirps at one pitch with a slight waver, at the pace of a child's play. */
  tthWhistle(t, bus, lv) {
    const f = 1650 * (0.9 + R() * 0.2), n = 3 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.32, (x) => { this.tone(x, [[0, f * 0.97], [0.05, f * 1.03], [0.12, f]], 0.14, 0.014 * lv, bus, 'sine'); this.burst(x, 0.06, 4200, 1, 0.003 * lv, bus, 0.01); });
    return n * 0.32 + 0.3;
  },
  /** A gourd rattle shaken in time by a priest: a hiss of seeds in a steady pulse of twos and threes. */
  tthRattle(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.burst(x, 0.09, 5200, 0.9, 0.014 * lv * (k % 3 === 0 ? 1 : 0.7), bus, 0.01)); w += k % 3 === 2 ? 0.34 : 0.17; }
    return w - t + 0.4;
  },
  /** The metate: the stone hand drawn over the grinding stone, one stroke after another, a knock of stone at the end of each. */
  tthMetate(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.55, 1200 + R() * 200, 0.9, 0.026 * lv, bus, 3.2, 0.9); this.knock(x + 0.52, 250, 0.012 * lv, bus, 0.04); });
      w += 0.85 + R() * 0.2;
    }
    return w - t + 0.8;
  },
  /** Tortillas patted out between the palms: soft pairs of slaps, quickening, with a pause for the comal. */
  tthTortilla(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 400 + R() * 60, 0.02 * lv, bus, 0.05); this.burst(x, 0.04, 1800, 0.8, 0.008 * lv, bus); });
      w += k % 2 ? 0.38 + R() * 0.1 : 0.27;
      if (k === Math.floor(n / 2)) w += 0.7;
    }
    return w - t + 0.6;
  },
  /** The obsidian knapper: a few sharp strikes of a hammerstone on the core, a flake's tinkle after each. */
  tthKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.struck(x, 2800 + R() * 1400, 0.03 * lv, bus, [[1, 1, 0.07], [2.4, 0.5, 0.05]]); this.burst(x + 0.05, 0.1, 5200, 1, 0.006 * lv, bus); });
      w += 0.55 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** The backstrap loom: the batten's dull knock against the weft, the thread drawn through, again and again at an easy pace. */
  tthWeave(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.3, 2600, 0.8, 0.008 * lv, bus, 60, 0.7); this.knock(x + 0.32, 190, 0.02 * lv, bus, 0.06); });
      w += 0.62 + R() * 0.2;
    }
    return w - t + 0.5;
  },
  /** The masons laying the plaza's floor: a trowel of lime scraped smooth in long strokes, a slap of the wet plaster between. */
  tthPlaster(t, bus, lv) {
    const n = 5 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.7, 1900 + R() * 300, 0.8, 0.012 * lv, bus, 14, 0.7); this.knock(x + 0.75, 230, 0.014 * lv, bus, 0.05); });
      w += 1.1 + R() * 0.4;
    }
    return w - t + 0.6;
  },
  /** A turkey's gobble: a run of rapid, rattling pulses falling in pitch. */
  tthTurkey(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), f = 520 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.075, (x) => this.tone(x, [[0, f * (1 - k * 0.02)], [0.05, f * 0.7]], 0.07, 0.045 * lv, bus, 'sawtooth', ['bandpass', 700, 2]));
    return n * 0.075 + 0.5;
  },
  /** A seller's cry in the market (wordless): a rising call that falls away, in a man's or a woman's voice. */
  tthCry(t, bus, lv) {
    const fem = R() < 0.6, f0 = (fem ? 245 : 145) * (0.93 + R() * 0.14), C = [
      [[0, 0.3, 'a'], [5, 0.3, 'a'], [9, 0.7, 'o'], [4, 0.6, 'o']],
      [[7, 0.25, 'e'], [4, 0.25, 'a'], [0, 0.9, 'o']],
      [[0, 0.4, 'o'], [3, 0.4, 'a'], [7, 0.9, 'a'], [5, 0.5, 'u']],
    ][Math.floor(R() * 3)];
    this.cry(t, f0, C, 0.05 * lv, bus, { fem, cutoff: 4000 });
    return C.reduce((s, c) => s + c[1], 0) + 0.8;
  },
  /** An owl in the night (the owl of the palace's pillars): two or three low hoots, the second after a short pause. */
  tthOwl(t, bus, lv) {
    const f = 330 * (0.93 + R() * 0.14), n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.9, (x) => { this.tone(x, [[0, f * 1.05], [0.35, f * 0.92]], 0.45, 0.03 * lv, bus, 'sine'); this.burst(x, 0.15, 900, 1, 0.004 * lv, bus, 0.05); });
    return n * 0.9 + 0.8;
  },
};
export const TTH_GAIN = {};
addVoices('voices-teotihuacan.js', TTH_VOICES, TTH_GAIN);
