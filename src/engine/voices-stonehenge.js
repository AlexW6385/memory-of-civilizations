// The placed voices of Stonehenge about 2500 BC (docs/settlements/stonehenge.md §13; src/settlements/stonehenge/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `sth`. All synthesised, no samples. [inferred throughout: nothing of the sound
// of the Late Neolithic survives; the works are those the dossier names (pounding sarsens with stone mauls, flint knapping, pots, hides, saddle querns,
// pigs roasted on open fires, pigs and cattle, the hauling of stones on rollers), the instruments are the ones the period is known to have had or
// could have had (a frame drum is a guess; pipes of swan bone are known from the Bronze Age and the Neolithic of Britain has bone whistles), the
// birds the chalk down has (skylark, lapwing, stone-curlew); pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);
const SCALE = [0, 2, 5, 7, 9];

export const STH_VOICES = {
  /** A stone maul pounding a sarsen face: heavy, dull blows in an uneven rhythm of two or three men, each a thud with a bright crack of grit over it, a pause to turn the stone. */
  sthMaul(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 130 + R() * 40, 0.09 * lv, bus, 0.12); this.struck(x, 1400 + R() * 500, 0.014 * lv, bus, [[1, 1, 0.05], [2.4, 0.3, 0.03]]); this.burst(x, 0.05, 2600, 1.2, 0.012 * lv, bus); });
      w += (k % 3 === 2 ? 0.9 : 0.42) + R() * 0.25;
    }
    return w - t + 0.8;
  },
  /** Flint knapping: sharp small taps of a hammerstone and the tick of a flake falling, at uneven intervals. */
  sthKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 7); k < n; k++) { this.cue(w, (x) => { this.struck(x, 2300 + R() * 900, 0.013 * lv, bus, [[1, 1, 0.04], [2.3, 0.4, 0.02]]); this.knock(x, 560, 0.012 * lv, bus, 0.03); }); w += 0.45 + R() * 1.3; }
    return w - t + 0.6;
  },
  /** A saddle quern: the rubbing stone pushed and drawn over the slab in a steady rhythm, a dry grating each way. */
  sthQuern(t, bus, lv) {
    let w = t;
    const n = 12 + Math.floor(R() * 12), beat = 0.62 + R() * 0.12;
    for (let k = 0; k < n; k++) { this.rasp(w, beat * 0.62, 1300 + R() * 300, 0.8, 0.02 * lv, bus, 5, 0.7); w += beat; }
    this.rasp(w + 0.2, 0.4, 2300, 0.7, 0.008 * lv, bus, 20, 0.9);
    return w - t + 1;
  },
  /** A flint scraper drawn over a pegged hide: long dry strokes, five or six. */
  sthScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.55, 1800 + R() * 400, 0.9, 0.017 * lv, bus, 12, 0.8); w += 0.8 + R() * 0.25; }
    return w - t + 0.6;
  },
  /** A potter's paddle on a coil-built pot: soft flat slaps, a pause to turn it, then more. */
  sthPaddle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => { this.knock(x, 190, 0.035 * lv, bus, 0.06); this.burst(x, 0.05, 900, 0.8, 0.008 * lv, bus); }); w += (k % 4 === 3 ? 1.4 : 0.55) + R() * 0.3; }
    return w - t + 0.6;
  },
  /** An open fire of logs: a bed of soft hiss with sharp crackles and pops thrown over it, and, now and then, fat dripping on the embers. */
  sthFire(t, bus, lv) {
    const d = 5 + R() * 3;
    this.rasp(t, d, 900 + R() * 300, 0.5, 0.022 * lv, bus, 14, 0.8);
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { const at = t + R() * d; this.cue(at, (x) => this.struck(x, 1800 + R() * 2500, (0.014 + R() * 0.02) * lv, bus, [[1, 1, 0.012]])); }
    for (let k = 0; k < 2; k++) if (R() < 0.6) this.cue(t + R() * d, (x) => this.burst(x, 0.18, 3800, 0.7, 0.01 * lv, bus));
    return d;
  },
  /** A frame drum of hide struck with a padded beater: a slow, steady beat in groups, a stronger first of each; low and soft. */
  sthDrum(t, bus, lv) {
    let w = t;
    const groups = 3 + Math.floor(R() * 4), step = 0.7 + R() * 0.15;
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) { const strong = i === 0; this.cue(w, (x) => { this.knock(x, strong ? 98 : 128, (strong ? 0.07 : 0.045) * lv, bus, strong ? 0.26 : 0.16); this.burst(x, 0.04, 320, 1.2, 0.01 * lv, bus); }); w += step; }
      w += 0.6 + R() * 0.7;
    }
    return w - t + 0.8;
  },
  /** Many low wordless voices together (a crowd's chant heard across the open ground): a few long falling phrases on o and a. */
  sthSong(t, bus, lv) {
    const f0 = 140 + R() * 30, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.6, 'o'], [-2, 0.5, 'a'], [-5, 1.0, 'o'], [-7, 0.8, 'a']].slice(0, 2 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1700, fem: false }));
      this.cue(w + 0.06, (x) => this.cry(x, f0 * 1.5, notes, 0.018 * lv, bus, { cutoff: 1900, fem: true }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.8 + R() * 1.0;
    }
    return w - t + 1;
  },
  /** A pipe of bone: a thin breathy pentatonic line, each note swelling and falling, a breath before it. */
  sthPipe(t, bus, lv) {
    const root = 440, n = 6 + Math.floor(R() * 6);
    let w = t, k = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length)), len = 0.5 + R() * 1.1, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.03, len * 0.6, f * 2, 3, 0.003 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.98], [0.08, f], [len, f * 1.004]], len, 0.014 * lv, bus, 'triangle', ['bandpass', f * 1.5, 1.4]);
      });
      w += len + 0.1 + R() * 0.6;
    }
    return w - t + 1.2;
  },
  /** Men hauling a stone: a low call and answer on each pull, the rope's creak and the dull knock of the rollers, in a slow rhythm. */
  sthHaul(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => this.cry(x, 130 + R() * 20, [[0, 0.45, 'o'], [-3, 0.35, 'a']], 0.032 * lv, bus, { cutoff: 1500, fem: false }));
      this.rasp(w + 0.3, 0.9, 700 + R() * 200, 2.5, 0.01 * lv, bus, 8, 0.7);
      this.cue(w + 0.9, (x) => this.knock(x, 90, 0.06 * lv, bus, 0.2));
      w += 2.4 + R() * 0.6;
    }
    return w - t + 1;
  },
  /** A skylark over the down: a long, unbroken, rising and falling run of bright trills, high up. */
  sthLark(t, bus, lv) {
    const d = 7 + R() * 8;
    for (let k = 0, n = Math.floor(d * 14); k < n; k++) {
      const p = k / n, f = 2600 + 1600 * Math.sin(p * Math.PI) + (R() - 0.5) * 900;
      this.cue(t + k * (d / n), (x) => this.tone(x, [[0, f], [0.03, f * (0.85 + R() * 0.4)]], 0.045, 0.008 * lv, bus, 'sine'));
    }
    return d + 0.5;
  },
  /** A lapwing tumbling over the grass: a wheezy, rising "pee-wit" and its quick repeats. */
  sthLapwing(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, 1500], [0.12, 2300], [0.3, 1900]], 0.32, 0.016 * lv, bus, 'sawtooth', ['bandpass', 2100, 3]); });
      w += 0.55 + R() * 0.3;
    }
    return w - t + 0.6;
  },
  /** A stone-curlew calling on the dark down at dusk: a wild, rising wail "cur-lee", repeated, then a run of piping. */
  sthCurlew(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 900], [0.25, 1500], [0.55, 1250], [0.8, 1700]], 0.9, 0.02 * lv, bus, 'triangle', ['bandpass', 1400, 2.5]));
      w += 1.2 + R() * 0.5;
    }
    for (let k = 0; k < 7; k++) this.cue(w + k * 0.14, (x) => this.tone(x, [[0, 1900], [0.07, 1500]], 0.1, 0.012 * lv, bus, 'sine'));
    return w - t + 1.6;
  },
  /** A pig: a few low grunts and, now and then, a short squeal. */
  sthPig(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => this.tone(x, [[0, 150 + R() * 40], [0.12, 100]], 0.16, 0.05 * lv, bus, 'sawtooth', ['lowpass', 520, 1])); w += 0.35 + R() * 0.5; }
    if (R() < 0.3) this.cue(w, (x) => this.tone(x, [[0, 900], [0.1, 1500], [0.35, 800]], 0.4, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1300, 2]));
    return w - t + 1;
  },
  /** An ox lowing: a long, low, breathy note that rises a little and falls away, from the chest. */
  sthLow(t, bus, lv) {
    const f = 105 + R() * 25, d = 1.5 + R() * 0.8;
    this.cue(t, (x) => this.tone(x, [[0, f * 0.9], [0.4, f * 1.1], [d, f * 0.8]], d, 0.05 * lv, bus, 'sawtooth', ['lowpass', 380, 1.2]));
    return d + 1.5;
  },
  /** A sheep's bleat, nasal and shaking, and a lamb's higher answer. */
  sthBleat(t, bus, lv) {
    const f = 330 + R() * 80, d = 0.6 + R() * 0.3;
    this.cue(t, (x) => this.tone(x, [[0, f], [0.1, f * 1.1], [d, f * 0.9]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', 900, 2.2]));
    if (R() < 0.5) this.cue(t + d + 0.3, (x) => this.tone(x, [[0, f * 1.6], [0.5, f * 1.4]], 0.5, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1400, 2.2]));
    return d + 1.2;
  },
  /** An axe of flint or stone on a log: a dull thud and the wood's crack, two or three times. */
  sthChop(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => { this.knock(x, 170, 0.07 * lv, bus, 0.1); this.burst(x + 0.01, 0.06, 1700, 1.5, 0.02 * lv, bus); }); w += 1.1 + R() * 0.9; }
    return w - t + 0.8;
  },
};
addVoices('voices-stonehenge.js', STH_VOICES);
