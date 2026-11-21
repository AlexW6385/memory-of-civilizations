// The placed voices of Great Zimbabwe about 1350 (docs/settlements/great-zimbabwe.md §19.3; src/settlements/great-zimbabwe/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `gz`; the engine's own voices that suit (the jars' lids, cloth, the kitchen, the smith's hammer,
// the clay, the far dogs, the cicadas and birds) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: no recording exists. The instruments are those the dossier's region names or later Shona practice gives: the mbira (a lamellophone: its
// ancestors are found in the Zambezi valley long before 1350; the interlocking two-hand pattern, the buzz of its resonator and the pitches are ours), the hosho (a pair
// of gourd rattles), the ngoma (a long drum) with hand-clapping and a wordless call-and-response, the pounding of grain in a wooden mortar (duri) and its grinding stone,
// the smith's goatskin bellows, a herd boy's whistle. The birds and the hyena are those of the Zimbabwean bush and are real; their calls are drawn from memory.]
import { addVoices } from './voices.js';

const R = Math.random;
const hz = (root, st) => root * Math.pow(2, st / 12);

export const GZ_VOICES = {
  /** The mbira: a repeating twelve-pulse pattern, the left thumbs on the low tines every third pulse, the right on the high ones in a shifting line; each tine rings and dies, with the buzz of the shells' rattle. */
  gzMbira(t, bus, lv) {
    const root = 196 * (R() < 0.5 ? 1 : hz(1, -2)), P = 0.17 + R() * 0.03, cycles = 3 + Math.floor(R() * 3);
    const low = [-12, -12, -17, -15], line = [0, 7, 0, 9, 7, 0, 4, 7, 5, 7, 4, 2];       // semitones over the root: the left thumbs' tines, the right thumbs' line
    let w = t;
    for (let c = 0; c < cycles; c++) {
      const hi = Math.floor(R() * 3);
      for (let k = 0; k < 12; k++) {
        const at = w + k * P;
        if (k % 3 === 0) { const f = hz(root, low[(c + k / 3) % 4]); this.cue(at, (x) => this.struck(x, f, 0.03 * lv, bus, [[1, 1, 0.9], [2.01, 0.25, 0.4], [5.4, 0.06, 0.12]])); }
        if ((k + c) % 2 === 0 || k % 4 === 1) {
          const f = hz(root, line[(k + hi) % 12]), a = 0.026 * lv * (0.7 + 0.5 * R());
          this.cue(at, (x) => { this.struck(x, f, a, bus, [[1, 1, 0.7], [2.0, 0.22, 0.3], [4.1, 0.07, 0.1]]); this.burst(x, 0.05, 3400, 1.5, a * 0.35, bus); });
        }
      }
      w += 12 * P;
    }
    return w - t + 1.2;
  },
  /** The hosho: a pair of gourd rattles, a swish on each beat of a 6/8 (long-short-short) that keeps the mbira and the voices together. */
  gzHosho(t, bus, lv) {
    const P = 0.2, n = 8 + Math.floor(R() * 8);
    let w = t;
    for (let k = 0; k < n; k++) {
      for (const [d, a] of [[0, 1], [1, 0.55], [2, 0.7]]) this.cue(w + d * P, (x) => this.burst(x, 0.09, 5200 + R() * 800, 0.8, 0.014 * lv * a, bus, 0.01));
      w += 3 * P;
    }
    return w - t + 0.6;
  },
  /** The ngoma: a long drum's low open stroke and a high slap, with the clapping of the circle on the off-beats; a few rounds. */
  gzNgoma(t, bus, lv) {
    const pat = [[0, 'lo'], [1, 'hi'], [2, 'hi'], [3, 'lo'], [4, 'hi'], [5, 'hi'], [6, 'lo'], [7, 'lo'], [8, 'hi']], P = 0.22;
    let w = t;
    for (let r = 0, n = 3 + Math.floor(R() * 3); r < n; r++) {
      for (const [d, k] of pat) this.cue(w + d * P, (x) => (k === 'lo' ? this.knock(x, 110, 0.06 * lv, bus, 0.28) : this.knock(x, 380 + R() * 40, 0.032 * lv, bus, 0.08)));
      for (let c = 0; c < 9; c++) if (c % 3 !== 0) this.cue(w + c * P + 0.02, (x) => this.burst(x, 0.04, 2100 + R() * 500, 1.2, 0.012 * lv, bus));
      w += 9 * P + 0.05;
    }
    return w - t + 1;
  },
  /** A song in the dara's circle: the clapping on the beat and a wordless call-and-response, a woman's phrase (high, falling) answered by the men's low line. */
  gzSong(t, bus, lv) {
    const P = 0.34, n = 4 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const f = 330 * (0.93 + R() * 0.14);
      this.cue(w, (x) => this.cry(x, f, [[0, 0.32, 'a'], [3, 0.22, 'o'], [-2, 0.4, 'a']], 0.022 * lv, bus, { cutoff: 2800, fem: true }));
      this.cue(w + 1.5 * P * 3, (x) => this.cry(x, 150 * (0.95 + R() * 0.1), [[0, 0.4, 'o'], [2, 0.3, 'a'], [0, 0.5, 'o']], 0.026 * lv, bus, { cutoff: 1800 }));
      for (let c = 0; c < 8; c++) this.cue(w + c * P + 0.01, (x) => this.burst(x, 0.035, 2300, 1.3, 0.011 * lv, bus));
      w += 8 * P + 0.4;
    }
    return w - t + 1;
  },
  /** The duri: grain pounded in a wooden mortar, two women's pestles in turn (a deep hollow thump and the pestle's tick), a few strokes and a rest. */
  gzPound(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 10); k < n; k++) {
      const f = k % 2 ? 128 : 150;
      this.cue(w, (x) => { this.tone(x, [[0, f * (0.95 + R() * 0.1)], [0.1, f * 0.62]], 0.14, 0.05 * lv, bus, 'sine'); this.burst(x, 0.03, 900, 1.2, 0.018 * lv, bus); });
      w += k % 5 === 4 ? 0.9 : 0.36 + R() * 0.03;
    }
    return w - t + 0.8;
  },
  /** The grinding stone (guyo): the upper stone pushed and drawn over the lower, a dry scrape each way, in a steady rhythm; a pause to sweep the meal. */
  gzGrind(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.55, 1200 + R() * 300, 0.8, 0.02 * lv, bus, 4, 0.7); w += 0.85; }
    this.rasp(w + 0.2, 0.5, 2300, 0.7, 0.012 * lv, bus, 18, 0.9);
    return w - t + 1;
  },
  /** The smith's bellows: two goatskin bags worked in turn, a breath of air and the fire's roar rising with each, now and then the tuyere's whistle. */
  gzBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.42, 520 + 120 * (k % 2), 0.6, 0.016 * lv, bus, 7, 0.4); w += 0.46; }
    this.tone(t + 1, [[0, 900], [2.5, 960]], 3, 0.003 * lv, bus, 'sine');
    return w - t + 0.6;
  },
  /** Pottery burnished with a smooth stone before it is fired: a soft, fast rub with a pause now and then. */
  gzBurnish(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.3, 3200 + R() * 500, 1.0, 0.008 * lv, bus, 22, 0.8); w += 0.35 + R() * 0.2; }
    return w - t + 0.5;
  },
  /** A herd boy's call to his cattle: two falling notes and a whistle that rises, from a distance. */
  gzHerdCall(t, bus, lv) {
    this.cry(t, 300, [[0, 0.35, 'o'], [-4, 0.45, 'a']], 0.04 * lv, bus, { cutoff: 2600 });
    this.tone(t + 1.3, [[0, 1500], [0.35, 2300]], 0.5, 0.012 * lv, bus, 'sine');
    return 2.4;
  },
  /** The southern ground hornbill's booming at dawn, heard for a mile: sets of two or three very low, rounded notes, a pause, again [real bird of the Zimbabwean bush; the call from memory]. */
  gzHornbill(t, bus, lv) {
    let w = t;
    for (let s = 0, n = 3 + Math.floor(R() * 3); s < n; s++) {
      const k = 2 + Math.floor(R() * 2);
      for (let i = 0; i < k; i++) { this.cue(w + i * 0.5, (x) => { this.tone(x, [[0, 68], [0.34, 62]], 0.36, 0.05 * lv, bus, 'sine'); this.tone(x, [[0, 136], [0.3, 124]], 0.3, 0.012 * lv, bus, 'sine'); }); }
      w += k * 0.5 + 2.2 + R() * 1.5;
    }
    return w - t + 1;
  },
  /** The fiery-necked nightjar: a plaintive, whistled phrase that falls away ("good Lord, deliver us"), repeated through the night [real bird; the notes from memory]. */
  gzNightjar(t, bus, lv) {
    let w = t;
    for (let s = 0, n = 3 + Math.floor(R() * 4); s < n; s++) {
      for (const [d, f0, f1] of [[0, 1500, 1620], [0.42, 1700, 1760], [0.8, 1420, 1500], [1.15, 1300, 1180], [1.55, 1250, 1050]]) this.cue(w + d, (x) => this.tone(x, [[0, f0], [0.32, f1]], 0.34, 0.012 * lv, bus, 'sine'));
      w += 3.2 + R() * 2;
    }
    return w - t + 1;
  },
  /** The spotted hyena's whoop in the night, far off: a rising, wavering call two or three times, a pause [real animal; the call from memory]. */
  gzHyena(t, bus, lv) {
    let w = t;
    for (let s = 0, n = 2 + Math.floor(R() * 3); s < n; s++) {
      const f = 230 + R() * 60;
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.5, f * 2.0], [0.85, f * 1.7]], 0.9, 0.035 * lv, bus, 'sawtooth', ['lowpass', 900, 1]); });
      w += 1.5 + R() * 0.6;
    }
    return w - t + 1.2;
  },
};
addVoices('voices-great-zimbabwe.js', GZ_VOICES, { gzHyena: 0.9, gzHornbill: 1.0 });
