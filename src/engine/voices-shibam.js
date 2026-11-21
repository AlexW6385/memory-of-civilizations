// The placed voices of Shibam about 1700 (docs/settlements/shibam.md §18; src/settlements/shibam/soundmap.js says where each is made and when),
// added to the engine's table from here (addVoices; every name begins `shb`). All synthesised from the engine's tools (struck partials, noise,
// oscillators, formant cries); no samples. Every cry is WORDLESS (vowel contours): no text of any language is sung. Pitches, contours, rhythms and
// levels are [inferred]: no recording of Shibam in 1700 exists; the instruments are the dossier's (§9: a lone oud and a hand drum), the mode a
// pentatonic-leaning one of the region used as a gesture, not transcribed. Levels set by measuring a render (tools/sound-render.mjs), not by ear.
import { addVoices } from './voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const hz = (root, st) => root * Math.pow(2, st / 12);
const MODE = [0, 2, 5, 7, 10, 12, 14];

export const SHB_VOICES = {
  /** A lone oud from a majlis: a phrase of plucked notes, each with its quick bloom and long decay, the tonic returned to and doubled, a slow strum at the end. */
  shbOud(t, bus, lv) {
    const root = 146.8, n = 7 + Math.floor(R() * 5);
    let w = t, k = 2;
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(MODE.length - 1, k + Math.floor(R() * 3) - 1 + (i === n - 1 ? -k : 0)));
      const f = hz(root, MODE[k]), at = w, d = 0.4 + R() * 0.45;
      this.cue(at, (x) => { this.struck(x, f, 0.034 * lv, bus, [[1, 1, 1.1], [2, 0.4, 0.6], [3, 0.2, 0.34], [4.03, 0.08, 0.2]]); if (R() < 0.5) this.struck(x + 0.025, f * 1.002, 0.02 * lv, bus, [[1, 1, 0.9], [2, 0.3, 0.4]]); });
      w += d + (i % 4 === 3 ? 0.5 : 0);
    }
    for (const [j, st] of [[0, 0], [0.05, 7], [0.1, 12]]) this.cue(w + j, (x) => this.struck(x, hz(root, st), 0.03 * lv, bus, [[1, 1, 1.6], [2, 0.35, 0.9], [3, 0.15, 0.5]]));
    return w - t + 2.2;
  },
  /** A hand drum with claps at a men's gathering in the square: a dum on the low skin, the teks on the rim, a cycle of eight repeated, the claps on the off beats. */
  shbDan(t, bus, lv) {
    const P = 'D.tTD.t.', step = 0.24 + R() * 0.05, bars = 6 + Math.floor(R() * 4);
    for (let b = 0; b < bars; b++) for (let i = 0; i < 8; i++) {
      const x = t + (b * 8 + i) * step + (R() - 0.5) * 0.012, c = P[i];
      if (c === 'D') this.cue(x, (y) => { this.knock(y, 105 + R() * 12, 0.05 * lv, bus, 0.16); this.tone(y, [[0, 135], [0.12, 88]], 0.2, 0.014 * lv, bus, 'sine'); });
      else if (c === 't' || c === 'T') this.cue(x, (y) => { this.knock(y, 330 + R() * 40, (c === 'T' ? 0.034 : 0.022) * lv, bus, 0.05); this.burst(y, 0.04, 2400, 1.2, 0.01 * lv, bus); });
      if (i === 3 || i === 7) for (let c2 = 0; c2 < 4; c2++) this.cue(x + 0.02 * c2, (y) => this.burst(y, 0.05, 1500 + R() * 600, 0.8, 0.012 * lv, bus));
    }
    return bars * 8 * step + 0.6;
  },
  /** The brick-maker: a lump of straw-and-mud thrown into the wooden mould (a wet slap), pressed, the top struck off with the edge of a board (a short scrape), the mould tapped and lifted; a worker's low wordless call between. */
  shbBrick(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.knock(y, 120 + R() * 30, 0.05 * lv, bus, 0.1); this.burst(y + 0.02, 0.2, 650 + R() * 300, 0.9, 0.028 * lv, bus, 0.02); });
      this.cue(x + 0.5, (y) => this.knock(y, 150, 0.03 * lv, bus, 0.08));
      this.cue(x + 0.85, (y) => this.rasp(y, 0.25, 1500, 0.8, 0.014 * lv, bus, 30, 0.6));
      this.cue(x + 1.3, (y) => { this.knock(y, 420, 0.026 * lv, bus, 0.04); this.knock(y + 0.1, 380, 0.02 * lv, bus, 0.04); });
      w += 1.7 + R() * 0.9;
    }
    this.cue(t + 3 + R() * 3, (y) => this.cry(y, 130 * (0.94 + R() * 0.12), [[3, 0.3, 'o'], [0, 0.7, 'a']], 0.03 * lv, bus, { cutoff: 2800 }));
    return w - t + 0.6;
  },
  /** A cry in the street, wordless: a driver to his donkeys (short, sharp, falling), a water or date seller (a long rise and fall), a woman calling a child from a window high above (high and carrying). */
  shbCall(t, bus, lv) {
    const C = [
      { f: 140, fem: false, n: [[7, 0.15, 'a'], [5, 0.2, 'o'], [0, 0.5, 'a']] },
      { f: 150, fem: false, n: [[0, 0.4, 'u'], [3, 0.5, 'o'], [7, 0.6, 'a'], [5, 0.9, 'a']] },
      { f: 245, fem: true, n: [[0, 0.3, 'a'], [5, 0.5, 'e'], [3, 0.8, 'a']] },
    ], c = pick(C);
    this.cry(t, c.f * (0.94 + R() * 0.12), c.n, 0.046 * lv, bus, { fem: c.fem, cutoff: 3400 });
    return c.n.reduce((s, q) => s + q[1], 0) + 0.6;
  },
};
export const SHB_GAIN = { shbOud: 1.3, shbDan: 1.2, shbBrick: 1.8, shbCall: 1.3 };
addVoices('voices-shibam.js', SHB_VOICES, SHB_GAIN);
