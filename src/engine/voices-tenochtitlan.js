// The placed voices of Tenochtitlan in 1519 (docs/settlements/tenochtitlan.md §22), added to voices.js's VOICES from the map that places them
// (src/settlements/tenochtitlan/soundmap.js). Each is a method `name(t, bus, lv[, f])` making its events from `t` into a bus from `src()` and
// returning how long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock) and nothing else: no samples.
// Pitches, rhythms and contours are [inferred]: no recording of 1519 is kept; what each sound is rests on §22 (Díaz: a drum of enormous size
// and large and small trumpets on the temple; the Mexica's huehuetl, teponaztli, clay flutes and conch trumpets). Every name is prefixed `tnc`
// (VOICES is one shared table).
import { addVoices } from './voices.js';

const R = Math.random;

export const TNC_VOICES = {
  /** The huehuetl, the upright log drum with a skin, beaten at the summit: a slow figure of deep strokes and lighter ones between, over and over. */
  tncHuehuetl(t, bus, lv) {
    const pat = [[0, 1], [0.55, 0.5], [0.9, 0.5], [1.45, 1], [2.0, 0.55], [2.35, 0.55], [2.9, 1], [3.45, 0.5]], rounds = 3 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < rounds; k++) {
      for (const [d, a] of pat) this.cue(w + d, (x) => {
        this.tone(x, [[0, 160 * (0.98 + R() * 0.04)], [0.14, 92]], 0.5, 0.1 * lv * a, bus);
        this.tone(x, [[0, 320], [0.08, 200]], 0.16, 0.03 * lv * a, bus);
        this.burst(x, 0.05, 320, 1.2, 0.05 * lv * a, bus);
      });
      w += 4.1;
    }
    return w - t + 0.8;
  },
  /** The teponaztli, the slit drum of two tongues (a fourth apart), in a quick dance figure of twos and threes. */
  tncTeponaztli(t, bus, lv) {
    const hi = 310 * (0.97 + R() * 0.06), lo = hi * 0.75, fig = [0, 1, 0, 0, 1, 0, 1, 1], n = 16 + Math.floor(R() * 16);
    let w = t;
    for (let k = 0; k < n; k++) {
      const f = fig[k % fig.length] ? hi : lo, a = k % 4 === 0 ? 1 : 0.65;
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.2, f * 0.97]], 0.28, 0.045 * lv * a, bus, 'triangle'); this.burst(x, 0.02, 1400, 1.2, 0.012 * lv * a, bus); });
      w += 0.19 + (k % 4 === 3 ? 0.1 : 0);
    }
    return w - t + 0.5;
  },
  /** The conch trumpets (tecciztli): two or three long low blasts, each swelling from a slurred start, a little rough, with a pause between. */
  tncConch(t, bus, lv) {
    const f = 262 * (0.96 + R() * 0.08), n = 2 + Math.floor(R() * 2);
    let w = t;
    for (let k = 0; k < n; k++) {
      const dur = 2.4 + R() * 1.1;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * 0.88], [0.45, f]], dur, 0.05 * lv, bus, 'sawtooth', ['lowpass', 720, 0.8]);
        this.tone(x + 0.05, [[0, f * 2.02]], dur * 0.9, 0.012 * lv, bus, 'sawtooth', ['lowpass', 1500, 0.8]);
        this.burst(x, 0.3, 900, 0.8, 0.008 * lv, bus, 0.1);
      });
      w += dur + 1.2 + R() * 0.8;
    }
    return w - t;
  },
  /** A clay flute (an ocarina's thin, breathy whistle) playing a short melody on a pentatonic scale. */
  tncFlute(t, bus, lv) {
    const S = [0, 2, 4, 7, 9, 12], base = 620 * (0.95 + R() * 0.1), n = 7 + Math.floor(R() * 5);
    let w = t, deg = 2 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      deg = Math.max(0, Math.min(S.length - 1, deg + Math.floor(R() * 3) - 1));
      const f = base * Math.pow(2, S[deg] / 12), dur = 0.28 + R() * 0.5;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.985], [0.06, f]], dur, 0.022 * lv, bus, 'sine'); this.burst(x, 0.08, 3600, 1, 0.004 * lv, bus, 0.01); });
      w += dur + 0.06 + (k % 5 === 4 ? 0.4 : 0);
    }
    return w - t + 0.4;
  },
  /** The metate: the stone hand drawn over the grinding stone, one stroke after another, a knock of stone at the end of each. */
  tncMetate(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.55, 1250 + R() * 200, 0.9, 0.026 * lv, bus, 3.2, 0.9); this.knock(x + 0.52, 260, 0.012 * lv, bus, 0.04); });
      w += 0.85 + R() * 0.2;
    }
    return w - t + 0.8;
  },
  /** Tortillas patted out between the palms: soft pairs of slaps, quickening, with a pause for the comal. */
  tncTortilla(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 400 + R() * 60, 0.02 * lv, bus, 0.05); this.burst(x, 0.04, 1800, 0.8, 0.008 * lv, bus); });
      w += k % 2 ? 0.38 + R() * 0.1 : 0.27;
      if (k === Math.floor(n / 2)) w += 0.7;
    }
    return w - t + 0.6;
  },
  /** The obsidian knapper: a few sharp strikes of a hammerstone, a flake's tinkle between. */
  tncKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.struck(x, 2800 + R() * 1400, 0.03 * lv, bus, [[1, 1, 0.07], [2.4, 0.5, 0.05]]); this.burst(x + 0.05, 0.1, 5200, 1, 0.006 * lv, bus); });
      w += 0.6 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** The lapidary's polishing: a long soft rasp of sand and water on stone, twice. */
  tncPolish(t, bus, lv) {
    this.rasp(t, 2.4, 3400, 0.8, 0.014 * lv, bus, 26, 0.8);
    this.rasp(t + 3.0, 2.0, 3200, 0.8, 0.012 * lv, bus, 24, 0.8);
    return 5.5;
  },
  /** A turkey's gobble: a run of rapid, rattling pulses falling in pitch. */
  tncTurkey(t, bus, lv) {
    const n = 6 + Math.floor(R() * 5), f = 540 * (0.9 + R() * 0.2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.075, (x) => this.tone(x, [[0, f * (1 - k * 0.02)], [0.05, f * 0.7]], 0.07, 0.045 * lv, bus, 'sawtooth', ['bandpass', 720, 2]));
    return n * 0.075 + 0.5;
  },
  /** A canoe poled and paddled along the canal (or at the landing: unseen, 7 s): the dip of the blade, the drip, the knock of the shaft on the gunwale, every stroke. */
  tncCanoe(t, bus, lv, f) {
    const dur = f?.dur ?? 7;
    for (let s = 0; s < dur; s += 1.5 + R() * 0.2) this.cue(t + s, (x) => {
      this.burst(x, 0.4, 650, 0.6, 0.02 * lv, bus, 0.07);
      for (let k = 0; k < 3; k++) this.tone(x + 0.45 + k * 0.13, [[0, 1500 + R() * 600], [0.05, 900]], 0.06, 0.006 * lv, bus);
      this.knock(x + 0.2, 150, 0.025 * lv, bus, 0.07);
    });
    return dur;
  },
  /** A seller's cry in the market (wordless): a rising call that falls away, in a man's or a woman's voice. */
  tncCry(t, bus, lv) {
    const fem = R() < 0.55, f0 = (fem ? 250 : 150) * (0.93 + R() * 0.14), C = [
      [[0, 0.3, 'a'], [5, 0.3, 'a'], [9, 0.7, 'o'], [4, 0.6, 'o']],
      [[7, 0.25, 'e'], [4, 0.25, 'a'], [0, 0.9, 'o']],
      [[0, 0.4, 'o'], [3, 0.4, 'a'], [7, 0.9, 'a'], [5, 0.5, 'u']],
    ][Math.floor(R() * 3)];
    this.cry(t, f0, C, 0.05 * lv, bus, { fem, cutoff: 4000 });
    return C.reduce((s, c) => s + c[1], 0) + 0.8;
  },
  /** An owl in the night: two or three low hoots, the second after a short pause. */
  tncOwl(t, bus, lv) {
    const f = 340 * (0.93 + R() * 0.14), n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.9, (x) => { this.tone(x, [[0, f * 1.05], [0.35, f * 0.92]], 0.45, 0.03 * lv, bus, 'sine'); this.burst(x, 0.15, 900, 1, 0.004 * lv, bus, 0.05); });
    return n * 0.9 + 0.8;
  },
};
export const TNC_GAIN = {};
addVoices('voices-tenochtitlan.js', TNC_VOICES, TNC_GAIN);
