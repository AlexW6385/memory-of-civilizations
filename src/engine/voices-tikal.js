// The placed voices of Classic Maya Tikal about 750 (docs/settlements/maya-tikal.md §18), added to voices.js's VOICES from the map that places them
// (src/settlements/maya-tikal/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and returning how long it
// lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock) and nothing else: no samples. What each is rests on the dossier §18: conch trumpets
// and clay flutes and ocarinas, turtle-shell drums and gourd rattles (painted on Maya vases and the Bonampak murals), the households' metate, the obsidian knappers',
// the weavers' battens, the masons' lime; the howler monkeys, macaws and ocellated turkeys of the forest. Pitches, rhythms and contours are all [inferred]: no recording
// of the eighth century exists. Every name is prefixed `tik` (VOICES is one shared table; a duplicate throws).
import { addVoices } from './voices.js';

const R = Math.random;

export const TIK_VOICES = {
  /** The conch: three long, low, rough blasts from a temple's summit, each swelling out of a slurred start, the last the longest. */
  tikConch(t, bus, lv) {
    const f = 196 * (0.96 + R() * 0.08), n = 3;
    let w = t;
    for (let k = 0; k < n; k++) {
      const dur = 2.0 + R() * 0.8 + k * 0.7;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * 0.84], [0.6, f]], dur, 0.055 * lv, bus, 'sawtooth', ['lowpass', 620, 0.8]);
        this.tone(x + 0.04, [[0, f * 1.5]], dur * 0.9, 0.014 * lv, bus, 'sawtooth', ['lowpass', 1300, 0.8]);
        this.burst(x, 0.3, 800, 0.8, 0.008 * lv, bus, 0.1);
      });
      w += dur + 1.0 + R() * 0.6;
    }
    return w - t;
  },
  /** A turtle-shell drum struck with an antler or a stick: a hollow double tone, the pair in a limping figure, rounds of it. */
  tikDrum(t, bus, lv) {
    const pat = [[0, 1], [0.5, 0.6], [1.1, 0.8], [1.5, 0.5], [2.2, 1]], rounds = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < rounds; k++) {
      for (const [d, a] of pat) this.cue(w + d, (x) => {
        this.tone(x, [[0, 190 * (0.97 + R() * 0.06)], [0.12, 120]], 0.4, 0.08 * lv * a, bus);
        this.tone(x, [[0, 330], [0.06, 240]], 0.14, 0.03 * lv * a, bus);
        this.burst(x, 0.04, 1500, 1.4, 0.04 * lv * a, bus);
      });
      w += 2.9;
    }
    return w - t + 0.8;
  },
  /** A clay flute (an ocarina's thin whistle): a slow melody on a pentatonic scale, long notes and a held one at the end. */
  tikFlute(t, bus, lv) {
    const S = [0, 3, 5, 7, 10, 12], base = 520 * (0.95 + R() * 0.1), n = 6 + Math.floor(R() * 5);
    let w = t, deg = 1 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      deg = Math.max(0, Math.min(S.length - 1, deg + Math.floor(R() * 3) - 1));
      const f = base * Math.pow(2, S[deg] / 12), dur = 0.4 + R() * 0.7 + (k === n - 1 ? 1.2 : 0);
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.98], [0.08, f]], dur, 0.022 * lv, bus, 'sine'); this.burst(x, 0.1, 3000, 1, 0.004 * lv, bus, 0.01); });
      w += dur + 0.1;
    }
    return w - t + 0.5;
  },
  /** A gourd rattle shaken in a steady pulse of twos and threes, by a priest at the rite. */
  tikRattle(t, bus, lv) {
    const n = 12 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.burst(x, 0.09, 4800, 0.9, 0.014 * lv * (k % 3 === 0 ? 1 : 0.7), bus, 0.01)); w += k % 3 === 2 ? 0.36 : 0.18; }
    return w - t + 0.4;
  },
  /** The metate: the stone hand drawn over the grinding stone, a knock of stone at the end of each stroke. */
  tikMetate(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.55, 1150 + R() * 200, 0.9, 0.026 * lv, bus, 3.2, 0.9); this.knock(x + 0.52, 250, 0.012 * lv, bus, 0.04); }); w += 0.85 + R() * 0.2; }
    return w - t + 0.8;
  },
  /** The obsidian knapper: sharp strikes of the hammerstone, a flake's tinkle after each, and the long soft scrape of pressure flaking between. */
  tikKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.struck(x, 2900 + R() * 1400, 0.03 * lv, bus, [[1, 1, 0.07], [2.4, 0.5, 0.05]]); this.burst(x + 0.05, 0.1, 5200, 1, 0.006 * lv, bus); if (k % 3 === 2) this.rasp(x + 0.4, 0.5, 3600, 0.8, 0.006 * lv, bus, 80, 0.6); });
      w += 0.6 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** The backstrap loom: the batten's dull knock on the weft, the thread drawn through, again and again. */
  tikLoom(t, bus, lv) {
    const n = 9 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.3, 2500, 0.8, 0.008 * lv, bus, 60, 0.7); this.knock(x + 0.32, 190, 0.02 * lv, bus, 0.06); }); w += 0.64 + R() * 0.2; }
    return w - t + 0.5;
  },
  /** The plasterers: lime scraped smooth in long strokes, a slap of the wet plaster between. */
  tikPlaster(t, bus, lv) {
    const n = 5 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => { this.rasp(x, 0.7, 1900 + R() * 300, 0.8, 0.012 * lv, bus, 14, 0.7); this.knock(x + 0.75, 230, 0.014 * lv, bus, 0.05); }); w += 1.1 + R() * 0.4; }
    return w - t + 0.6;
  },
  /** A seller's cry in the market (wordless): a rising call that falls away, a man's or a woman's. */
  tikCry(t, bus, lv) {
    const fem = R() < 0.6, f0 = (fem ? 240 : 140) * (0.93 + R() * 0.14), C = [
      [[0, 0.3, 'a'], [5, 0.3, 'o'], [9, 0.7, 'a'], [4, 0.6, 'o']],
      [[7, 0.25, 'o'], [4, 0.25, 'a'], [0, 0.9, 'u']],
      [[0, 0.4, 'a'], [3, 0.4, 'o'], [7, 0.9, 'a'], [5, 0.5, 'u']],
    ][Math.floor(R() * 3)];
    this.cry(t, f0, C, 0.05 * lv, bus, { fem, cutoff: 4000 });
    return C.reduce((s, c) => s + c[1], 0) + 0.8;
  },
  /** A turkey's gobble: a run of rapid, rattling pulses falling in pitch, then a soft clucking. */
  tikTurkey(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), f = 480 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.08, (x) => this.tone(x, [[0, f * (1 - k * 0.02)], [0.05, f * 0.7]], 0.07, 0.045 * lv, bus, 'sawtooth', ['bandpass', 650, 2]));
    for (let k = 0; k < 3; k++) this.cue(t + n * 0.08 + 0.4 + k * 0.22, (x) => this.tone(x, [[0, 360], [0.04, 300]], 0.05, 0.02 * lv, bus, 'triangle'));
    return n * 0.08 + 1.3;
  },
  /** A scarlet macaw's squawk: two or three harsh, falling screams from the treetops, in flight at dawn and dusk. */
  tikMacaw(t, bus, lv) {
    const n = 2 + Math.floor(R() * 2), f = 1100 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.55, (x) => { this.tone(x, [[0, f * 1.2], [0.15, f * 0.8]], 0.3, 0.032 * lv, bus, 'sawtooth', ['bandpass', 1900, 1.4]); this.burst(x, 0.25, 2600, 1, 0.01 * lv, bus, 0.02); });
    return n * 0.55 + 0.6;
  },
  /** A mottled owl of the forest at night: a low hoot, a pause, two quick lower ones. */
  tikOwl(t, bus, lv) {
    const f = 300 * (0.93 + R() * 0.14);
    for (const [d, k] of [[0, 1], [1.4, 0.9], [1.85, 0.85]]) this.cue(t + d, (x) => { this.tone(x, [[0, f * 1.04 * k], [0.3, f * 0.9 * k]], 0.4, 0.03 * lv, bus, 'sine'); this.burst(x, 0.12, 900, 1, 0.004 * lv, bus, 0.05); });
    return 3;
  },
  /** A howler monkey troop heard far off: a deep, rough, rolling roar that swells and ebbs for half a minute. */
  tikHowler(t, bus, lv) {
    const dur = 14 + R() * 8, f = 105 * (0.95 + R() * 0.1);
    this.cue(t, (x) => {
      this.tone(x, [[0, f], [dur * 0.4, f * 1.25], [dur, f * 0.9]], dur, 0.06 * lv, bus, 'sawtooth', ['lowpass', 520, 0.9]);
      this.tone(x + 0.3, [[0, f * 1.5], [dur * 0.5, f * 1.9]], dur * 0.8, 0.02 * lv, bus, 'sawtooth', ['lowpass', 900, 0.9]);
      this.burst(x, dur, 380, 0.9, 0.02 * lv, bus, 2);
    });
    return dur + 1.5;
  },
};
export const TIK_GAIN = {};
addVoices('voices-tikal.js', TIK_VOICES, TIK_GAIN);
