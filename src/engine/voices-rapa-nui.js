// The placed voices of Rapa Nui about 1500 (docs/settlements/rapa-nui.md §10.3; src/settlements/rapa-nui/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `rap`. All synthesised, no samples. [inferred throughout: no recording of
// the island of 1500 exists; the works are those the dossier names (toki on tuff, bark cloth beaten on a basalt anvil, a statue hauled on ropes, the
// hot stones of the umu, the chant (riu) with clapping and a stamping stone) and the sea; the pu (a conch trumpet) is an addition from the island's
// ceremonial life and is marked as such; the pitches and patterns are ours.]
import { addVoices } from './voices.js';

const R = Math.random;
const FALL = [[0, 0.5, 'o'], [-2, 0.5, 'a'], [-5, 0.9, 'o'], [-7, 0.7, 'a']];

export const RAP_VOICES = {
  /** The surf on the rocky shore: a swell building, a crash of white noise on the black rock, a hiss draining back, a heavier boom under it. */
  rapSurf(t, bus, lv) {
    const d = 6 + R() * 3;
    this.rasp(t, d, 700 + R() * 250, 0.5, 0.03 * lv, bus, 0.13 + R() * 0.05, 0.85);
    this.rasp(t + d * 0.3, d * 0.6, 2400, 0.6, 0.014 * lv, bus, 0.6, 0.8);
    this.cue(t + d * 0.28, (x) => this.knock(x, 55, 0.06 * lv, bus, 0.5));
    return d + 1;
  },
  /** A basalt toki on soft tuff: a short run of sharp ticks, a chip's rattle, now and then a pause to turn the tool. */
  rapToki(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.struck(x, 1900 + R() * 700, 0.03 * lv, bus, [[1, 1, 0.035], [2.4, 0.4, 0.02]]); this.burst(x, 0.05, 2800, 1.2, 0.012 * lv, bus); });
      w += 0.32 + R() * 0.2 + (k % 5 === 4 ? 0.9 : 0);
    }
    return w - t + 0.6;
  },
  /** Bark cloth beaten on a basalt anvil with a ribbed wooden beater: a quick steady knock, a woman's hum between runs. */
  rapTapa(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 330 + (k % 2) * 40, 0.035 * lv, bus, 0.06); this.burst(x, 0.03, 1500, 1.4, 0.007 * lv, bus); });
      if (k % 8 === 5 && R() < 0.6) this.cue(w + 0.1, (x) => this.cry(x, 190 + R() * 20, [[0, 0.5, 'o'], [-2, 0.6, 'o']], 0.012 * lv, bus, { cutoff: 1500, fem: true }));
      w += 0.34 + R() * 0.03;
    }
    return w - t + 0.8;
  },
  /** Hauling the statue: a leader's call and the teams' answer on each pull, ropes groaning, the heavy stone's grind and thud as it rocks forward. */
  rapHaul(t, bus, lv) {
    let w = t;
    const f0 = 135 + R() * 20;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.cry(x, f0 * 1.3, [[0, 0.45, 'a'], [-2, 0.4, 'o']], 0.03 * lv, bus, { cutoff: 1700, fem: false }));
      this.cue(w + 0.8, (x) => { this.cry(x, f0, [[0, 0.7, 'o'], [-3, 0.6, 'a']], 0.04 * lv, bus, { cutoff: 1400, fem: false }); this.rasp(x, 1.0, 520, 1.5, 0.014 * lv, bus, 7, 0.8); });
      this.cue(w + 1.7, (x) => { this.knock(x, 62, 0.09 * lv, bus, 0.3); this.burst(x, 0.2, 400, 0.7, 0.012 * lv, bus); });
      w += 3.4 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** The umu's hot stones: stones raked and dropped into the pit, a dry clatter, then the soft hiss of leaves laid over. */
  rapStones(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => this.struck(x, 1100 + R() * 800, 0.014 * lv, bus, [[1, 1, 0.05], [1.9, 0.5, 0.03]])); w += 0.12 + R() * 0.3; }
    this.rasp(w + 0.3, 1.8, 3200, 0.7, 0.008 * lv, bus, 17, 0.9);
    return w - t + 2.4;
  },
  /** The chant (riu) of the evening on the plaza: a leader's phrase, the answer in unison on o and a, the beat of palms on thighs and a stamping stone. */
  rapRiu(t, bus, lv) {
    let w = t;
    const f0 = 150 + R() * 25, beat = 0.55 + R() * 0.1;
    for (let p = 0, np = 3 + Math.floor(R() * 3); p < np; p++) {
      this.cue(w, (x) => this.cry(x, f0 * 1.25, FALL.slice(0, 2 + Math.floor(R() * 2)), 0.03 * lv, bus, { cutoff: 1900, fem: false }));
      w += 1.7;
      this.cue(w, (x) => this.cry(x, f0, FALL, 0.04 * lv, bus, { cutoff: 1600, fem: false }));
      for (let b = 0; b < 8; b++) { const at = w + b * beat * 0.5; this.cue(at, (x) => { this.burst(x, 0.04, 1700, 1.0, (b % 2 ? 0.01 : 0.016) * lv, bus); if (b % 4 === 0) this.knock(x, 90, 0.05 * lv, bus, 0.18); }); }
      w += 2.6 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** The pu, a conch trumpet: a low rough note rising a little, held, then a second, far across the plain [inferred: the island's ceremonial shell trumpet]. */
  rapPu(t, bus, lv) {
    const f = 175 + R() * 20;
    this.cue(t, (x) => this.tone(x, [[0, f * 0.9], [0.4, f], [1.8, f * 1.02]], 2.0, 0.03 * lv, bus, 'sawtooth', ['lowpass', 520, 2]));
    this.cue(t + 2.8, (x) => this.tone(x, [[0, f * 1.15], [0.3, f * 1.22], [1.4, f * 1.18]], 1.6, 0.026 * lv, bus, 'sawtooth', ['lowpass', 560, 2]));
    return 5;
  },
  /** A rat (kiore) in the thatch at night: a quick scrabble, a pause, a squeak. */
  rapScurry(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 0.25 + R() * 0.25, 3600, 1.2, 0.007 * lv, bus, 28, 0.9); w += 0.4 + R() * 0.8; }
    this.cue(w, (x) => this.tone(x, [[0, 5200], [0.06, 6200]], 0.08, 0.004 * lv, bus, 'sine'));
    return w - t + 0.8;
  },
  /** A hen's contented talk, as the yards have it [chickens are the island's only domestic animal, §4c]. */
  rapHen(t, bus, lv) {
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) this.cue(t + k * (0.22 + R() * 0.25), (x) => this.tone(x, [[0, 420 + R() * 120], [0.05, 360 + R() * 80]], 0.07, 0.014 * lv, bus, 'triangle', ['bandpass', 900, 2]));
    return 2.4;
  },
};

addVoices('voices-rapa-nui.js', RAP_VOICES);
