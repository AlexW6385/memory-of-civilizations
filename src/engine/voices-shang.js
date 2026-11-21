// The placed voices of Yinxu about 1200 BC (docs/settlements/shang-yinxu.md §11; src/settlements/shang-yinxu/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `shang`; the engine's own voices that suit (the smith's hammer with its bellows, the kitchen, the
// loom, the grinder, cloth, the well's bucket, the owl, the dogs) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of Shang music or work exists; the instruments are those the finds and the dossier name (the bronze nao
// bells, the stone chime, the crocodile-skin drum, the clay ocarina xun); the sounds of work are those of the tools and crafts the dossier's §5 describes; pitches and
// patterns are ours. The oracle bone's own sound is the crack ("bu") of the heated shell.]
import { addVoices } from './voices.js';

const R = Math.random;
const PENTA = [0, 3, 5, 7, 10];                                        // the music.js mode (gong over the tonic: 0 3 5 7 10)
const hz = (root, st) => root * Math.pow(2, st / 12);

export const SHANG_VOICES = {
  /** The crack of a heated plastron ("bu"): a dry tick as the shell splits, a fine crackle after it, now and then a second crack; the diviner's fire ticking under it. */
  shangCrack(t, bus, lv) {
    this.knock(t, 2300 + R() * 500, 0.05 * lv, bus, 0.035);
    this.burst(t + 0.02, 0.35, 4200, 1.4, 0.02 * lv, bus);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 0.12 + k * (0.05 + R() * 0.08), (x) => this.burst(x, 0.012, 3000 + R() * 2500, 2, 0.018 * lv, bus));
    if (R() < 0.35) this.cue(t + 0.7 + R() * 0.5, (x) => this.knock(x, 2000 + R() * 400, 0.04 * lv, bus, 0.03));
    return 1.6;
  },
  /** The saw through a plastron's bridge (a bronze saw in bone): strokes of a dry scrape, a rest between runs. */
  shangSaw(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.32, 2300 + R() * 300, 0.9, 0.016 * lv, bus, 38, 0.8); w += 0.42 + R() * 0.12; }
    this.cue(w + 0.2, (x) => this.knock(x, 900, 0.025 * lv, bus, 0.04));
    return w - t + 0.8;
  },
  /** The bronze drill twirled in a shell (the hollow bored in the back of a plastron): a thin rising whirr and a soft scrape, a tick when it breaks through. */
  shangDrill(t, bus, lv) {
    const d = 1.2 + R() * 0.8;
    this.rasp(t, d, 3400, 1.2, 0.012 * lv, bus, 55, 0.9);
    this.tone(t, [[0, 1700], [d, 2100]], d, 0.004 * lv, bus, 'triangle', ['bandpass', 2000, 5]);
    this.cue(t + d, (x) => this.knock(x, 1500, 0.03 * lv, bus, 0.03));
    return d + 0.6;
  },
  /** The foundry's furnace: the hide bellows breathing in pairs, the charcoal's roar under the draught, ticks of cracking coals. */
  shangBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.rasp(w, 0.9, 480 + R() * 80, 0.6, 0.026 * lv, bus, 2.4, 0.9);
      this.cue(w + 0.3, (x) => this.burst(x, 0.012, 3200 + R() * 1600, 2, 0.02 * lv, bus));
      w += 1.35 + R() * 0.2;
    }
    this.tone(t, [[0, 62], [w - t, 58]], w - t, 0.012 * lv, bus, 'sawtooth', ['lowpass', 180, 1]);
    return w - t + 0.6;
  },
  /** The pour: the call of the master, then the long hiss of bronze running into the mould's cup, the spit of the vents, the settling ticks. */
  shangPour(t, bus, lv) {
    this.cue(t, (x) => this.cry(x, 150 * (0.95 + R() * 0.1), [[0, 0.35, 'a'], [3, 0.5, 'o']], 0.045 * lv, bus, { cutoff: 2600, fem: false }));
    const s = t + 1.1, d = 2.2 + R() * 0.8;
    this.rasp(s, d, 5200, 0.7, 0.03 * lv, bus, 120, 0.7);
    this.burst(s, d, 2400, 0.6, 0.02 * lv, bus, 0.2);
    for (let k = 0; k < 6; k++) this.cue(s + 0.3 + k * (d / 6) + R() * 0.2, (x) => this.burst(x, 0.02, 3500 + R() * 2000, 2, 0.03 * lv, bus));
    for (let k = 0; k < 5; k++) this.cue(s + d + 0.5 + k * (0.8 + R() * 1.2), (x) => this.struck(x, 2400 + R() * 600, 0.012 * lv, bus, [[1, 1, 0.12], [2.7, 0.4, 0.07]]));     // the casting cooling and ticking
    return d + 7;
  },
  /** Fettling a cast vessel: the stone file's strokes on bronze, a ring from the vessel under them, a knock of the knocking-out of a mould section. */
  shangFettle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.26, 3100 + R() * 500, 1.1, 0.014 * lv, bus, 50, 0.9); this.cue(w + 0.05, (x) => this.struck(x, 1250 + R() * 150, 0.008 * lv, bus, [[1, 1, 0.5], [2.4, 0.4, 0.3]])); w += 0.34 + R() * 0.1; }
    this.cue(w + 0.4, (x) => this.knock(x, 520, 0.04 * lv, bus, 0.08));
    return w - t + 1;
  },
  /** The nao (a bronze bell with its mouth up, struck): three or four notes of the set, each a short bright ring with the inharmonic partials of a flat bell. */
  shangNao(t, bus, lv) {
    const root = 262 * (R() < 0.5 ? 1 : 1.5), n = 3 + Math.floor(R() * 2);
    let w = t, k = Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(4, k + Math.floor(R() * 3) - 1));
      const f = hz(root, PENTA[k]), at = w;
      this.cue(at, (x) => this.struck(x, f, 0.05 * lv, bus, [[1, 1, 1.6], [1.5, 0.45, 1.1], [2.4, 0.3, 0.7], [3.3, 0.14, 0.4]]));
      w += 0.9 + R() * 0.9;
    }
    return w - t + 2;
  },
  /** The stone chime (qing, the tiger-patterned stone of Wuguancun): a dry, clear, high knock of the stone, singly or in a run, a short shimmer after it. */
  shangChime(t, bus, lv) {
    let w = t;
    for (let i = 0, n = 1 + Math.floor(R() * 4); i < n; i++) { const f = hz(523, PENTA[Math.floor(R() * 5)]); this.cue(w, (x) => this.struck(x, f, 0.034 * lv, bus, [[1, 1, 0.9], [2.76, 0.3, 0.35], [5.4, 0.1, 0.15]])); w += 0.8 + R() * 1.3; }
    return w - t + 1.2;
  },
  /** The drum with the crocodile-skin head, struck with a stick: deep slow strokes, an accent, a slap of the skin; the court's rite. */
  shangDrum(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const acc = k % 4 === 0;
      this.cue(w, (x) => { this.tone(x, [[0, 112 * (0.97 + R() * 0.06)], [0.18, 66]], acc ? 0.5 : 0.36, (acc ? 0.11 : 0.07) * lv, bus); this.burst(x, 0.03, 900, 1.2, (acc ? 0.05 : 0.03) * lv, bus); });
      w += acc ? 0.95 : 0.62 + R() * 0.12;
    }
    return w - t + 1;
  },
  /** The ocarina (xun): a few soft hollow notes of the mode, each with a breath of air before it, a slow slide down at the end. */
  shangXun(t, bus, lv) {
    const root = 392, n = 4 + Math.floor(R() * 4);
    let w = t, k = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(9, k + Math.floor(R() * 5) - 2));
      const f = hz(root, PENTA[k % 5] + 12 * Math.floor(k / 5)), d = 0.5 + R() * 0.7, last = i === n - 1;
      this.cue(w, (x) => { this.burst(x, 0.09, 3000, 1, 0.006 * lv, bus); this.tone(x + 0.03, last ? [[0, f], [d, f * 0.89]] : [[0, f], [d, f * 1.004]], d, 0.014 * lv, bus, 'sine', ['lowpass', 1800, 0.7]); });
      w += d + 0.15 + R() * 0.4;
    }
    return w - t + 1;
  },
  /** Two women pounding grain in a mortar with stone pestles, alternating: a dull knock with a hollow ring, a pause between runs. */
  shangPestle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 150 + (k % 2) * 14, 0.05 * lv, bus, 0.1); this.rasp(x + 0.03, 0.15, 1200, 0.8, 0.008 * lv, bus, 30, 0.5); }); w += 0.55 + (k % 2 ? 0.1 : 0) + R() * 0.05; }
    return w - t + 1;
  },
  /** The saddle quern: a stone rubbed back and forth on a stone, slow strokes with the grit of the meal. */
  shangQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.7, 640 + R() * 120, 0.5, 0.018 * lv, bus, 4.5, 0.9); w += 0.8 + R() * 0.15; }
    return w - t + 0.6;
  },
  /** Cloth beaten and wrung at the river's stone: three or four slaps, a splash and the wring's creak. */
  shangWash(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.knock(x, 320, 0.04 * lv, bus, 0.07); this.rasp(x + 0.02, 0.4, 2200, 0.5, 0.014 * lv, bus, 14, 0.9); }); w += 0.7 + R() * 0.4; }
    this.rasp(w, 0.8, 900, 1.4, 0.008 * lv, bus, 7, 0.9);
    return w - t + 1.2;
  },
  /** A pig in its pen: two or three short grunts, now and then a squeal. */
  shangPig(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.tone(w, [[0, 130 + R() * 20], [0.1, 88]], 0.14, 0.03 * lv, bus, 'sawtooth', ['lowpass', 520, 1]); this.burst(w, 0.08, 700, 1, 0.012 * lv, bus); w += 0.28 + R() * 0.3; }
    if (R() < 0.25) this.tone(w + 0.2, [[0, 700], [0.25, 1100], [0.5, 800]], 0.5, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1200, 3]);
    return w - t + 1.2;
  },
  /** A chariot trundling over the court's earth: the wooden wheels' rumble and creak, two horses' hooves in a trot, the bronze fittings of the harness ringing. */
  shangChariot(t, bus, lv) {
    const d = 7 + R() * 3;
    this.rasp(t, d, 260, 0.6, 0.02 * lv, bus, 9, 0.7);
    this.rasp(t, d, 900, 2.2, 0.006 * lv, bus, 3, 0.8);
    for (let k = 0; k < Math.floor(d / 0.34); k++) this.cue(t + k * 0.34 + (k % 2) * 0.05, (x) => { this.knock(x, 130 + R() * 20, 0.035 * lv, bus, 0.05); this.burst(x, 0.02, 1400, 1, 0.012 * lv, bus); });
    for (let k = 0; k < Math.floor(d / 0.5); k++) this.cue(t + k * 0.5 + R() * 0.1, (x) => this.struck(x, 3200 + R() * 500, 0.006 * lv, bus, [[1, 1, 0.1], [2.1, 0.4, 0.06]]));
    return d + 1;
  },
  /** A keeper's or a herdsman's call across the yards: a long wordless call that rises, then falls. */
  shangCall(t, bus, lv) {
    const f = (R() < 0.35 ? 270 : 165) * (0.94 + R() * 0.12), fem = f > 220;
    this.cry(t, f, [[0, 0.35, 'a'], [5, 0.8, 'o'], [0, 0.6, 'a']], 0.035 * lv, bus, { cutoff: 2800, fem });
    return 3;
  },
  /** The murmur of people gathered (the court's petitioners, the lane's neighbours): a few low wordless voices, overlapping, going up and down. */
  shangMurmur(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const f = 130 + R() * 90; this.cue(w, (x) => this.cry(x, f, [[0, 0.3 + R() * 0.2, R() < 0.5 ? 'o' : 'e'], [-2 + Math.floor(R() * 5), 0.4 + R() * 0.3, 'a']], 0.012 * lv, bus, { cutoff: 2200, fem: f > 190 })); w += 0.5 + R() * 1.2; }
    return w - t + 2;
  },
};
export const SHANG_GAIN = {};

addVoices('voices-shang.js', SHANG_VOICES, SHANG_GAIN);
