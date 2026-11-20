// The placed voices of Nara in 752 (docs/settlements/nara.md §19.3; src/settlements/nara/soundmap.js says where each is made and
// when). Added to the engine's VOICES from here (addVoices), every name prefixed `nara`; the voices of voices-kyoto.js that suit
// (the sutra's chant, the pounding of rice, the saws, the bird and cicada voices) are used by the map as they are.
// All synthesised, no samples. [inferred throughout: no recording of 8th-century Nara exists; the instruments, hours and
// contours are from general knowledge of the sources named in the dossier, and the pitches are ours.]

import './voices-kyoto.js';
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);

/** The cries of the pedlars of the capital (wordless: [semitones above the voice's base, seconds, vowel]) [inferred from the goods of the East Market: salt, cloth, fish, vegetables, oil]. */
export const NARA_TRADES = {
  salt: { cry: [[0, 0.4, 'o'], [5, 0.3, 'o'], [2, 1.2, 'u']], fem: false, hours: [7, 16] },
  greens: { cry: [[0, 0.35, 'a'], [3, 0.3, 'e'], [7, 1.0, 'i']], fem: true, hours: [6, 11] },
  fish: { cry: [[7, 0.25, 'u'], [3, 0.3, 'u'], [-2, 1.1, 'o']], fem: true, hours: [6, 12] },
  oil: { cry: [[-4, 0.7, 'o'], [0, 0.5, 'o'], [-5, 1.5, 'u']], fem: false, hours: [8, 16] },
};
export const naraTradeAt = (hour, rnd = R()) => {
  const ks = Object.entries(NARA_TRADES).filter(([, T]) => hour >= T.hours[0] && hour < T.hours[1]).map(([k]) => k);
  return ks.length ? ks[Math.floor(rnd * ks.length) % ks.length] : null;
};

export const NARA_VOICES = {
  /** The great bell of Tōdai-ji struck slowly, five strokes of its swung log, low (about 80 Hz). */
  naraBonshoSeries(t, bus, lv) {
    const n = 5;
    for (let k = 0; k < n; k++) this.cue(t + k * (7.2 + R() * 0.8), (x) => this.bonsho(x, 80 * (1 + 0.004 * (k % 2)), 0.05 * lv * (k > n - 2 ? 0.8 : 1), bus, 0.8 + R() * 0.4));
    return n * 8 + 6;
  },
  /** A rehearsal of the court music (gagaku) at the dance stage: a long chord of mouth organ on D and G, a reed's slow line over it, a drum's slow beat. */
  naraGagaku(t, bus, lv) {
    const dur = 26 + R() * 10, root = 293.66;
    for (const [r, a] of [[1, 1], [1.5, 0.8], [2, 0.6], [2.67, 0.4]]) this.cue(t, (x) => this.tone(x, [[0, root * r], [dur, root * r]], dur, 0.0075 * lv * a, bus, 'sawtooth', ['bandpass', 900 * r, 3]));
    let w = t + 2;
    const line = [0, 2, 5, 2, 0, -3, 0, 2, 7, 5, 2, 0];
    for (const d of line) { const f = root * 2 * Math.pow(2, d / 12), len = 1.4 + R() * 1.4; if (w + len > t + dur) break; this.cue(w, (x) => this.tone(x, [[0, f * 0.98], [0.15, f], [len, f * 1.005]], len, 0.011 * lv, bus, 'sawtooth', ['bandpass', 1500, 5])); w += len + 0.2; }
    for (let k = 0; k * 4.2 < dur - 2; k++) this.cue(t + 1 + k * 4.2, (x) => this.knock(x, 110, 0.07 * lv, bus, 0.16));
    return dur + 1;
  },
  /** The drum at the gate struck slowly at dusk to close the gates of the temple and the capital. */
  naraGateDrum(t, bus, lv) {
    const n = 24;
    for (let k = 0; k < n; k++) this.cue(t + k * 1.1 * (1 - 0.01 * k), (x) => { this.knock(x, 95, 0.1 * lv, bus, 0.22); this.burst(x, 0.08, 220, 1, 0.03 * lv, bus); });
    return n * 1.0 + 2;
  },
  /** The scriptorium: a brush on paper (a dry whisper), a sheet laid on the pile, a stylus tapped on the ink-stone's edge. */
  naraScribe(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      const d = 0.7 + R() * 0.9;
      this.cue(w, (x) => this.rasp(x, d, 3200 + R() * 600, 0.8, 0.014 * lv, bus, 22, 0.9));
      if (R() < 0.35) this.cue(w + d, (x) => this.knock(x, 520, 0.025 * lv, bus, 0.04));
      w += d + 0.6 + R() * 1.6;
    }
    this.cue(w, (x) => this.rasp(x, 0.5, 1800, 0.7, 0.018 * lv, bus, 6, 0.8));
    return w - t + 1;
  },
  /** The carpenters' adze (chōna) and mallet on timber: sets of dull strokes, the chisel's tap, the log's ring. */
  naraAdze(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 2 + Math.floor(R() * 3); s < ns; s++) {
      for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) { const x0 = w; this.cue(x0, (x) => { this.knock(x, 190 + R() * 40, 0.09 * lv, bus, 0.1); this.burst(x, 0.05, 900, 1, 0.03 * lv, bus); }); w += 0.55 + R() * 0.2; }
      this.cue(w, (x) => this.knock(x, 300, 0.04 * lv, bus, 0.07));
      w += 1.4 + R() * 2;
    }
    return w - t + 0.5;
  },
  /** A pedlar crying a trade as she goes along a street near the listener. */
  naraPedlar(t, bus, lv) {
    const hour = this.plc?.hourNow ?? 12, trade = naraTradeAt(hour);
    const l = this.lis(), M = this.plc?.life?.map, tr = trade && M?.pedlarTrack ? M.pedlarTrack(l.x, l.z, R, 70, 30) : null;
    if (!tr) return 1;
    const T = NARA_TRADES[trade], f = this.along(tr.pts, 0.95), b = this.src(f, 11, { dur: f.dur + 2 });
    const base = T.fem ? 235 : 135;
    let w = t + 0.5;
    for (let k = 0; k < 2 && w - t < f.dur; k++) { this.cue(w, (x) => this.cry(x, base * (0.95 + R() * 0.1), T.cry, 0.05 * lv, b, { cutoff: 3200, fem: T.fem })); w += T.cry.reduce((s, n) => s + n[1], 0) + 3 + R() * 4; }
    return Math.max(f.dur, w - t) + 1;
  },
  /** A stag calling in the autumn rut, from the hill (the Man'yōshū's calling stags): a long rising whistle that breaks and falls. */
  naraStag(t, bus, lv) {
    if (inSeason(seasonDoy(this), 255, 310, 12) < 0.4) return 1;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + k * (3.4 + R()), (x) => this.tone(x, [[0, 520], [0.5, 900], [0.9, 760], [1.4, 420]], 1.5, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1100, 4]));
    return 14;
  },
};

addVoices('voices-nara.js', NARA_VOICES);
