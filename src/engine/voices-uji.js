// The placed voices of Heian Uji (docs/settlements/heian-uji.md §19.3; src/settlements/heian-uji/soundmap.js says where each is made and
// when). Added to the engine's VOICES through addVoices, every name prefixed `uj`. Each voice is a method `name(t, bus, lv, …)` queuing its
// events from `t` into `bus` and returning how long it lasts; the walkers make a bus of their own along a street near the listener.
// All synthesised, no samples. [inferred throughout: no recording of 1053 exists; the sources and the reasons are in the dossier §19.3,
// and the pitches and contours are ours. No wooden fish, no shakuhachi, no clappers of the Edo watch: they came later.]

import { addVoices, inSeason, doyOf, inHours } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const inWindow = (m, a, b) => inSeason(seasonDoy(m), a, b, 12) > 0.4;

/** The cries of the pedlars (wordless: [semitones, seconds, vowel]): sweetfish of the Uji (summer, autumn), firewood, greens [inferred]. */
export const UJ_TRADES = {
  ayu: { cry: [[9, 0.25, 'i'], [7, 0.3, 'a'], [3, 0.3, 'a'], [-2, 1.0, 'o']], base: 200, w: 1.0, hours: [6, 11], season: [150, 300] },
  firewood: { cry: [[5, 0.35, 'a'], [0, 0.45, 'o'], [3, 0.35, 'o'], [0, 1.4, 'u']], base: 190, w: 1.0, hours: [7, 15] },
  greens: { cry: [[0, 0.3, 'o'], [3, 0.3, 'a'], [5, 0.3, 'a'], [9, 1.0, 'e']], base: 160, w: 0.8, hours: [6, 10] },
};
export function pickUjTrade(hour, doy, rnd = R()) {
  const list = Object.entries(UJ_TRADES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? inSeason(doy, T.season[0], T.season[1], 12) : 1) : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}
function walker(m, speed, r50, reach = 70, lead = 30) {
  const l = m.lis(), M = m.plc?.life?.map, tr = M?.pedlarTrack ? M.pedlarTrack(l.x, l.z, R, reach, lead) : null;
  if (!tr) return null;
  const f = m.along(tr.pts, speed), bus = m.src(f, r50, { dur: f.dur + 2 });
  return { bus, f };
}

export const UJ_VOICES = {
  // ── water ────────────────────────────────────────────────────────────────────
  /** The Uji's rush: a band of noise swelling and falling over nine seconds, a low rumble under it (the current over the bed). */
  ujRush(t, bus, lv) {
    const d = 9 + R() * 2;
    for (const [f, q, a] of [[260, 0.7, 0.05], [900, 0.8, 0.035], [2400, 0.9, 0.012]]) this.rasp(t, d, f * (0.9 + 0.2 * R()), q, a * lv, bus, 3 + R() * 3, 0.5);
    return d;
  },
  /** The water through the stakes of a weir: quick small gurgles and trickles. */
  ujWeir(t, bus, lv) {
    for (let k = 0, w = t, n = 10 + Math.floor(R() * 8); k < n; k++, w += 0.15 + R() * 0.3) this.cue(w, (x) => { const f = 500 + R() * 900; this.tone(x, [[0, f], [0.06, f * 1.7]], 0.09, 0.01 * lv, bus, 'sine'); this.burst(x, 0.08, 1800, 1.2, 0.015 * lv, bus); });
    return 5;
  },
  /** The kajika frog of the clear river, at night in spring and early summer: a clear, falling run of fluted notes, "ko-ro-ro-ro", answered. */
  ujKajika(t, bus, lv) {
    if (!inWindow(this, 90, 200)) return 1;
    const M = this.plc?.life?.map, l = this.lis(), p = M?.riverSpot ? M.riverSpot(l.x, l.z, R, 45) : null;
    if (!p) return 1;
    const b = this.src(p, 14, { dur: 8 });
    let w = t;
    for (let rep = 0, n = 1 + Math.floor(R() * 3); rep < n; rep++) {
      const f = 2300 + R() * 300;
      for (let k = 0, m = 5 + Math.floor(R() * 4); k < m; k++) this.cue(w + k * 0.11, (x) => this.tone(x, [[0, f * (1 - 0.02 * k)], [0.05, f * (0.93 - 0.02 * k)]], 0.07, 0.014 * lv, b, 'sine'));
      w += 1.6 + R() * 1.2;
    }
    b.emitter.until = w + 1.5;
    return w - t;
  },

  // ── the hall ─────────────────────────────────────────────────────────────────
  /** The small bronze bowl-bell (kei) struck once: a clear ring and its upper partial, long in dying. */
  ujKei(t, bus, lv) {
    this.struck(t, 520 * (0.97 + 0.06 * R()), 0.05 * lv, bus, [[1, 1, 3.2], [2.4, 0.4, 1.6], [4.1, 0.15, 0.7]]);
    return 3.4;
  },
  /** The nenbutsu: monks murmuring the name of Amida on three low notes, the voices thick and slow, the bowl-bell struck at each round's end. */
  ujNenbutsu(t, bus, lv) {
    let w = t;
    for (let rep = 0, n = 6 + Math.floor(R() * 4); rep < n; rep++) {
      const x = w;
      for (const [i, [s, v]] of [[0, 'a'], [3, 'a'], [0, 'u']].entries()) this.cue(x + i * 0.62, (y) => this.cry(y, 108 * (0.96 + 0.08 * R()), [[s, 0.55, v]], 0.04 * lv, bus, { cutoff: 1500 }));
      w += 2.3;
      if (rep % 3 === 2) this.cue(w, (y) => this.struck(y, 520, 0.04 * lv, bus, [[1, 1, 2.6], [2.4, 0.35, 1.2]]));
    }
    return w - t + 2;
  },

  // ── fires and planks ─────────────────────────────────────────────────────────
  /** A basket fire of split pine: the steady low roar, sharp cracks and the sizzle of resin, a spark's tick. */
  ujFire(t, bus, lv) {
    this.rasp(t, 5, 420, 0.6, 0.012 * lv, bus, 7, 0.7);
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) this.cue(t + R() * 4.5, (x) => { this.burst(x, 0.03, 2500 + R() * 2000, 1.2, 0.05 * lv, bus); if (R() < 0.4) this.burst(x + 0.04, 0.1, 4500, 2, 0.02 * lv, bus); });
    return 5;
  },
  /** Bare feet and straw sandals on the planks of the bridge, a hollow knock under each, three or four walkers' steps. */
  ujPlanks(t, bus, lv) {
    const n = 8 + Math.floor(R() * 8), pace = 0.5 + R() * 0.1;
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => this.step(x, 0.05 * lv, bus, 'cloth', 1.5));
    return n * pace + 0.4;
  },

  // ── people passing (walk) ────────────────────────────────────────────────────
  /** A pedlar crying her wares as she goes (UJ_TRADES). */
  ujPedlar(t, bus, lv) {
    const hour = this.plc?.hourNow ?? 12, trade = pickUjTrade(hour, seasonDoy(this));
    const wk = trade && walker(this, 0.95, 11);
    if (!wk) return 1;
    const T = UJ_TRADES[trade], { f, bus: b } = wk;
    for (let w = t, k = 0; w < t + f.dur - 3 && k < 4; k++, w += 8.5 + R() * 4) this.cue(w, (y) => this.cry(y, T.base * (0.93 + R() * 0.14), T.cry, 0.05 * lv, b, { fem: true, cutoff: 4000 }));
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** A noble's ox-carriage (gissha) on the road: the axle's creak at each turn of the wheel, the ox's slow tread, the outriders' drawn-out warning call (sakioi). */
  ujSakioi(t, bus, lv) {
    const wk = walker(this, 1.1, 14, 90, 40);
    if (!wk) return 1;
    const { f, bus: b } = wk, pace = 0.9, n = Math.floor(f.dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => { this.knock(x, 110, 0.05 * lv, b, 0.12); this.tone(x + 0.1, [[0, 380], [0.4, 330]], 0.5, 0.01 * lv, b, 'sawtooth', ['bandpass', 600, 5]); });
    for (let k = 0; k * 6 + 2 < f.dur - 2; k++) this.cue(t + 2 + k * 6, (y) => this.cry(y, 135 * (0.95 + R() * 0.1), [[0, 0.5, 'o'], [4, 0.9, 'i'], [0, 0.6, 'o']], 0.05 * lv, b, { cutoff: 3200 }));
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },

  // ── work ─────────────────────────────────────────────────────────────────────
  /** The carpenter's adze (chōna): quick glancing chops, a pause to turn the beam. */
  ujAdze(t, bus, lv) {
    let w = t;
    for (let rep = 0, n = 2 + Math.floor(R() * 2); rep < n; rep++) { for (let k = 0, m = 4 + Math.floor(R() * 3); k < m; k++, w += 0.4 + R() * 0.1) this.cue(w, (x) => { this.knock(x, 700 + R() * 90, 0.07 * lv, bus, 0.07); this.burst(x, 0.06, 2600, 1, 0.03 * lv, bus); }); w += 1.5; }
    return w - t + 0.4;
  },
  /** The woodman's axe on a billet: a heavy chop, the wood's crack, a breath between. */
  ujAxe(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++, w += 1.1 + R() * 0.5) this.cue(w, (x) => { this.knock(x, 190, 0.1 * lv, bus, 0.12); this.burst(x, 0.05, 900, 0.8, 0.05 * lv, bus); });
    return w - t + 0.6;
  },

  // ── the seasons' animals ─────────────────────────────────────────────────────
  /** Wild geese passing overhead at dusk or dawn in autumn: a chorus of nasal honks drifting across the sky. */
  ujGeese(t, bus, lv) {
    if (!inWindow(this, 270, 330)) return 1;
    const l = this.lis(), a = R() * Math.PI * 2, d = 110, b = this.src(this.along([[l.x + Math.cos(a) * d, l.z + Math.sin(a) * d], [l.x - Math.cos(a) * d, l.z - Math.sin(a) * d]], 9), 70, { dur: 16 });
    for (let k = 0, n = 7 + Math.floor(R() * 8); k < n; k++) this.cue(t + R() * 12, (x) => { const f = 700 + R() * 200; this.tone(x, [[0, f], [0.12, f * 1.25], [0.3, f * 1.05]], 0.34, 0.012 * lv, b, 'sawtooth', ['bandpass', 1400, 2]); });
    b.emitter.until = t + 16;
    return 15;
  },
  /** A stag's call from the hills beyond the river, in autumn: a thin rising whistle that breaks and falls to a groan. */
  ujStag(t, bus, lv) {
    if (!inWindow(this, 260, 320)) return 1;
    this.tone(t, [[0, 700], [0.9, 1500], [1.3, 1100], [2.0, 520]], 2.1, 0.035 * lv, bus, 'sawtooth', ['bandpass', 1100, 3]);
    this.tone(t + 2.0, [[0, 330], [0.6, 250]], 0.7, 0.02 * lv, bus, 'sawtooth', ['lowpass', 500, 1]);
    return 3.2;
  },
};
export const UJ_GAIN = {};

addVoices('voices-uji.js', UJ_VOICES, UJ_GAIN);
