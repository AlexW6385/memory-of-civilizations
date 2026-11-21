// The placed voices of the Hakka tulou, c. 1710 (docs/settlements/hakka-tulou.md §11; src/settlements/hakka-tulou/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `ht`; the engine's own voices that suit (kitchen, the loom, the tea clink, the well's
// bucket, rice-wine pouring, the sack, the lid of a jar, the lap of water, frogs, crickets, cicadas, bamboo and leaves) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of an eighteenth-century Hakka village exists; each sound rests on the dossier — the
// mountain songs (客家山歌), the foot-lever pestle of the barn, the bamboo noria of the stream, the washing beaten on the granite steps, the buffalo's
// wooden clapper-bell in the paddy, the great gate shut at dusk and opened at dawn, the cutting of tobacco in the shop-house; the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
/** The notes of a Hakka mountain song's pentatonic (D E G A B, over two octaves from D4): Hz. */
const PENT = [293.66, 329.63, 392, 440, 493.88, 587.33, 659.25, 783.99];

export const HT_VOICES = {
  /** A mountain song from the tea terraces, far off and wordless: a woman's high voice in unhurried phrases that glide from note to note and end on a long held one. */
  htSong(t, bus, lv) {
    let w = t, prev = 3 + Math.floor(R() * 2);
    for (let ph = 0, np = 2 + Math.floor(R() * 2); ph < np; ph++) {
      for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
        const last = k === n - 1, step = Math.floor(R() * 5) - 2, i = Math.max(0, Math.min(PENT.length - 1, prev + step)), f0 = PENT[prev], f1 = PENT[i], d = last ? 1.6 + R() * 0.8 : 0.3 + R() * 0.5, x = w;
        this.cue(x, (y) => {
          this.tone(y, [[0, f0], [0.12, f1], [d, f1 * (last ? 0.985 : 1)]], d + 0.15, 0.026 * lv, bus, 'sawtooth', ['bandpass', 1100, 2.2]);
          this.tone(y, [[0, f0 * 2], [0.12, f1 * 2], [d, f1 * 2]], d + 0.1, 0.008 * lv, bus, 'sine');
        });
        w += d + 0.06; prev = i;
      }
      w += 1.2 + R() * 1.4;
    }
    return w - t + 2;
  },
  /** The foot-lever pestle in the barn: the beam's tread, the heavy head falling in the stone mortar, the hollow of the stone, the swish of grain, in pairs. */
  htPestle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.knock(y, 210, 0.025 * lv, bus, 0.09); this.tone(y + 0.28, [[0, 120], [0.12, 55]], 0.3, 0.055 * lv, bus, 'sine'); this.knock(y + 0.28, 700, 0.03 * lv, bus, 0.04); this.burst(y + 0.4, 0.25, 1500, 0.7, 0.009 * lv, bus, 0.03); });
      w += 1.5 + R() * 0.4;
    }
    return w - t + 1;
  },
  /** The bamboo noria turning: the axle's long creak on its wooden bearings, the tubes tipping one after another into the trough. */
  htNoria(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const x = w, f = 150 + R() * 40;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.5, f * 1.4], [1.1, f * 1.1]], 1.3, 0.013 * lv, bus, 'sawtooth', ['bandpass', 520, 5]); for (let q = 0; q < 3; q++) this.burst(y + 0.2 + q * 0.38, 0.3, 2200 + R() * 700, 0.6, 0.009 * lv, bus, 0.04); });
      w += 1.7 + R() * 0.6;
    }
    return w - t + 1;
  },
  /** Washing beaten on the granite steps: the flat paddle's slap on wet cloth, a pause, the splash of the rinse. */
  htBeat(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.knock(y, 480 + R() * 120, 0.04 * lv, bus, 0.06); this.burst(y + 0.02, 0.12, 1800, 0.7, 0.012 * lv, bus, 0.01); });
      w += 0.6 + R() * 0.3 + (k % 3 === 2 ? 0.9 : 0);
    }
    this.cue(w, (y) => this.burst(y, 0.8, 1200, 0.6, 0.012 * lv, bus, 0.05));
    return w - t + 1.5;
  },
  /** The buffalo's wooden clapper-bell as it walks in the paddy: dull uneven double knocks of two bamboo-wood tongues. */
  htClapper(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      const x = w, f = 380 + R() * 60;
      this.cue(x, (y) => { this.knock(y, f, 0.026 * lv, bus, 0.09); this.knock(y + 0.17, f * 1.18, 0.02 * lv, bus, 0.08); });
      w += 1.0 + R() * 0.7;
    }
    return w - t + 1;
  },
  /** The great gate: the plank leaves' long groan on their pivots, the boom as they meet, the bar dropped into its socket in the granite. */
  htGate(t, bus, lv) {
    this.tone(t, [[0, 95], [0.9, 140], [1.8, 110]], 2.0, 0.03 * lv, bus, 'sawtooth', ['bandpass', 320, 4]);
    this.cue(t + 2.0, (y) => { this.tone(y, [[0, 70], [0.35, 38]], 0.55, 0.12 * lv, bus, 'sine'); this.burst(y, 0.2, 260, 0.8, 0.05 * lv, bus, 0.01); });
    this.cue(t + 3.0, (y) => { this.rasp(y, 0.5, 600, 0.9, 0.02 * lv, bus, 8, 0.9); this.knock(y + 0.5, 150, 0.09 * lv, bus, 0.18); });
    return 4.5;
  },
  /** A little owl on the hill at night: a low double hoot, a pause, again. */
  htOwl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { const x = w, f = 420 + R() * 40; this.cue(x, (y) => { this.tone(y, [[0, f], [0.25, f * 0.93]], 0.3, 0.028 * lv, bus, 'sine'); this.tone(y + 0.5, [[0, f * 0.9], [0.3, f * 0.8]], 0.4, 0.024 * lv, bus, 'sine'); }); w += 3 + R() * 2; }
    return w - t + 1;
  },
  /** Tobacco cut in the shop-house: the long knife drawn through the pressed block, one shaving after another, even and unhurried. */
  htChop(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) { const x = w; this.cue(x, (y) => { this.burst(y, 0.07, 3600, 0.8, 0.012 * lv, bus, 0.005); this.knock(y + 0.05, 900 + R() * 100, 0.02 * lv, bus, 0.03); }); w += 0.42 + R() * 0.1; }
    return w - t + 1;
  },
};

addVoices('voices-hakka.js', HT_VOICES);
