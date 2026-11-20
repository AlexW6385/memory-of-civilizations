// The placed voices of Southern Song Lin'an (docs/settlements/song-hangzhou.md §31; src/settlements/song-hangzhou/soundmap.js says where each is made
// and when). Added to the engine's VOICES through addVoices, every name prefixed `hz`. Each is a method `name(t, bus, lv, f?)` that queues its events from
// `t` into `bus` and returns how long it lasts; those marked "walks" take a track `f` (voices.js `along`). All synthesised, no samples.
// [inferred throughout: no recording of Song Lin'an exists; what is attested is named beside each voice; pitches, contours and rhythms are ours.]

import { addVoices, inSeason } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const V = ['a', 'o', 'e', 'i', 'u'];

export const HZ_VOICES = {
  /** Kaihua Temple's great bell at the dawn and the dusk: seven slow strokes, the last two softer [inferred: the monastery's hours]. */
  hzTempleBell(t, bus, lv) {
    const n = 7;
    for (let k = 0; k < n; k++) this.cue(t + k * (6 + R() * 0.7), (x) => this.bonsho(x, 92 * (k > n - 3 ? 0.99 : 1), 0.05 * lv * (k > n - 3 ? 0.8 : 1), bus, 0.7 + R() * 0.3));
    return n * 6.4 + 4;
  },
  /** The drum before the evening bell: a roll quickening and fading [inferred]. */
  hzTempleDrum(t, bus, lv) { return this.drumRolls(t, bus, 2) - t; },
  /** The Liuhe Pagoda's iron wind bells (104 hang under its eaves today [stated: trip.com; aroundus]): a few in still air, a scatter in wind [inferred: the pitches]. */
  hzWindBell(t, bus, lv) {
    const wind = clamp(this.wind || 0, 0, 1), n = 1 + Math.floor(wind * 12 + R() * 3);
    let w = t, last = 0;
    for (let k = 0; k < n; k++) {
      const f = 1050 + R() * 800;
      this.cue(w, (x) => this.struck(x, f, 0.011 * lv * (0.5 + 0.5 * R()), bus, [[1, 1, 1.6], [2.7, 0.4, 0.7], [5.3, 0.18, 0.3]]));
      last = w - t; w += 0.14 + R() * (wind > 0.3 ? 0.5 : 1.8);
    }
    return last + 2;
  },
  /**
   * The Qiantang bore: a low murmur far downstream that swells to a long roar of broken water, then falls back over half a minute. Strongest in the eighth
   * month [stated: the 18th of the eighth month, the tide-watching, hznews citing Wulin jiushi]; the sound itself [inferred].
   */
  hzBore(t, bus, lv) {
    const big = 0.45 + 0.55 * inSeason(this.seasonDoy ? this.seasonDoy() : 260, 240, 285, 6), dur = 34;
    this.rasp(t, dur, 140, 0.6, 0.06 * lv * big, bus, 1.1, 0.7);
    this.cue(t + 8, (x) => this.burst(x, 22, 520, 0.5, 0.09 * lv * big, bus, 12));
    this.cue(t + 14, (x) => this.burst(x, 14, 1500, 0.6, 0.05 * lv * big, bus, 9));
    return dur + 4;
  },
  /** The canal's lock: the windlass's ratchet, the gate boards' groan, then water pouring through the gap [inferred: a pound lock's work]. */
  hzLock(t, bus, lv) {
    for (let k = 0; k < 14; k++) this.cue(t + k * 0.55, (x) => { this.knock(x, 900, 0.04 * lv, bus, 0.03); this.knock(x + 0.07, 640, 0.03 * lv, bus, 0.03); });
    this.cue(t + 3, (x) => this.creak(x, 0.7 * lv, bus, true));
    this.cue(t + 6, (x) => this.creak(x, 0.6 * lv, bus, false));
    this.cue(t + 8, (x) => this.burst(x, 12, 900, 0.7, 0.03 * lv, bus, 3));
    return 22;
  },
  /** A hawker with his shoulder pole (walks): the pole's creak at each step, a long drawn cry on a rising and falling line [stated: vendors cried toys, stationery and flowers along the streets, aisixiang 121268; the cry ours]. */
  hzHawker(t, bus, lv, f) {
    const dur = f ? f.dur : 20, base = 118 * (0.94 + R() * 0.14);
    for (let k = 0; k < Math.floor(dur / 0.75); k++) this.cue(t + k * 0.75, (x) => { this.creak(x, 0.25 * lv, bus, k % 2 === 0); this.knock(x, 150, 0.02 * lv, bus, 0.06); });
    for (let w = t + 1 + R() * 2; w < t + dur - 3; w += 7 + R() * 4) {
      const notes = [[0, 0.3, V[Math.floor(R() * 5)]], [4, 0.3, 'a'], [7, 0.4, 'a'], [4, 0.3, 'o'], [2, 1.0, 'a']];
      this.cue(w, (x) => this.cry(x, base, notes, 0.045 * lv, bus, { cutoff: 3800 }));
    }
    return dur;
  },
  /** The night market's calls (walks): a call, the clapper of a seller of sweets, a second voice answering, until late [stated: the night markets of the Imperial Way ran through the night, hznews 2024-07-05; the calls ours]. */
  hzNightCall(t, bus, lv, f) {
    const dur = f ? f.dur : 20;
    for (let k = 0; k < Math.floor(dur / 6.5); k++) {
      const w = t + 1 + k * 6.5 + R() * 1.5;
      this.cue(w, (x) => this.cry(x, 122 * (0.92 + R() * 0.16), [[0, 0.3, 'a'], [5, 0.3, 'e'], [7, 0.4, 'a'], [4, 0.3, 'o'], [0, 1.0, 'a']], 0.045 * lv, bus, { cutoff: 4000 }));
      this.cue(w + 2.4, (x) => { this.knock(x, 780, 0.035 * lv, bus, 0.06); this.knock(x + 0.22, 740, 0.03 * lv, bus, 0.06); this.knock(x + 0.44, 780, 0.03 * lv, bus, 0.06); });
    }
    return dur;
  },
  /** A tea house's story-teller at his long table: a run of speech on a few vowels and the strike of the wooden block at the phrase's end [stated: storytellers at a long table, hznews citing Mengliang lu; the speech wordless]. */
  hzStory(t, bus, lv) {
    let w = t;
    for (let ph = 0; ph < 3; ph++) {
      const n = 4 + Math.floor(R() * 4), notes = [];
      for (let k = 0; k < n; k++) notes.push([(k < n - 1 ? k % 3 : -3) + (R() < 0.3 ? 2 : 0), k < n - 1 ? 0.15 + R() * 0.1 : 0.7, V[Math.floor(R() * 5)]]);
      const end = this.cry(w, 114 * (0.96 + R() * 0.08), notes, 0.04 * lv, bus, { cutoff: 3000 });
      this.cue(end + 0.12, (x) => { this.knock(x, 560, 0.06 * lv, bus, 0.05); });
      w = end + 1.3 + R() * 1.4;
    }
    return w - t;
  },
  /** A singing girl in a wine house: a plucked pipa figure under a high sung phrase, the clapper board keeping time [stated: the singing girls of the wine houses, Wulin jiushi; the tune ours]. */
  hzSong(t, bus, lv) {
    const base = 300 + R() * 40, pent = [0, 2, 4, 7, 9];
    let w = t;
    for (let ph = 0; ph < 2; ph++) {
      const notes = [];
      for (let k = 0; k < 6; k++) notes.push([pent[Math.floor(R() * 5)], k === 5 ? 1.0 : 0.3 + R() * 0.25, ['a', 'e', 'o', 'i'][Math.floor(R() * 4)]]);
      const end = this.cry(w, base, notes, 0.04 * lv, bus, { cutoff: 3600, fem: true });
      for (let b = w; b < end; b += 0.45) this.cue(b, (x) => { this.knock(x, 880, 0.03 * lv, bus, 0.05); this.tone(x + 0.05, [[0, 440 * Math.pow(2, pent[Math.floor(R() * 5)] / 12)]], 0.25, 0.01 * lv, bus, 'triangle'); });
      w = end + 0.8;
    }
    return w - t;
  },
  /** The wazi's stage (勾栏) at its show: gong, drum and clappers in a quick flourish, a ripple of laughter from the benches after [stated: theatres in the wazi, aisixiang 121268; the music ours]. */
  hzStage(t, bus, lv) {
    for (let k = 0; k < 10; k++) this.cue(t + k * 0.28, (x) => { this.knock(x, 200, 0.05 * lv, bus, 0.08); if (k % 3 === 0) this.knock(x + 0.14, 900, 0.04 * lv, bus, 0.04); });
    this.cue(t + 3, (x) => this.gong(x, 330, 0.05 * lv, bus, 1.4));
    for (let k = 0; k < 6; k++) this.cue(t + 5 + k * 0.2 + R() * 0.1, (x) => this.cry(x, 150 * (0.8 + R() * 0.5), [[0, 0.2, 'a'], [2, 0.2, 'a']], 0.025 * lv, bus, { cutoff: 3200 }));
    return 9;
  },
  /** Oar-songs of the river boatmen: a call and the answer on each stroke [inferred]. */
  hzBoatSong(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 5; k++) {
      this.cue(w, (x) => this.cry(x, 118, [[0, 0.3, 'e'], [4, 0.6, 'o']], 0.045 * lv, bus, { cutoff: 3400 }));
      this.cue(w + 0.9, (x) => this.cry(x, 100, [[0, 0.7, 'o']], 0.04 * lv, bus, { cutoff: 3000 }));
      w += 2.1;
    }
    return w - t;
  },
};
export const HZ_GAIN = { hzTempleBell: 1, hzTempleDrum: 1, hzWindBell: 1, hzBore: 1, hzLock: 1, hzHawker: 1, hzNightCall: 1, hzStory: 1, hzSong: 1, hzStage: 1, hzBoatSong: 1 };

addVoices('voices-hangzhou.js', HZ_VOICES, HZ_GAIN);
