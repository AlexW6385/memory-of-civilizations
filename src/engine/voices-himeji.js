// The placed voices of Edo Himeji (docs/settlements/edo-himeji.md §10.2; src/settlements/edo-himeji/soundmap.js says where each is
// made and when). Added to the engine's VOICES (voices.js) through addVoices, every name prefixed `hj` (a name defined twice throws), so
// nothing of the existing voices is changed. Each voice is a method `name(t, bus, lv, …)` that queues its events from `t` into `bus` and
// returns how long it lasts; the ones marked "walks" make a bus of their own that moves along a street near the listener (the engine's
// fixed emitter only gives them their hour and their gap). All synthesised, no samples.
// [inferred throughout: no recording of c. 1620 exists; the instruments, calls and hours are from general knowledge of the Japanese
// sources named in the dossier, and the pitches and contours are ours.]

import { addVoices, inSeason, doyOf, inHours } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** The cries of the pedlars (wordless: [semitones above the voice's base, seconds, vowel]) [inferred from the street trades of the Edo castle towns; none is dated to Himeji]. */
export const HJ_TRADES = {
  greens: { cry: [[0, 0.3, 'o'], [3, 0.3, 'a'], [5, 0.3, 'a'], [9, 1.0, 'e']], base: 150, w: 1.0, hours: [6, 10] },                  // vegetables from the farms: a stepwise climb
  fish: { cry: [[9, 0.25, 'i'], [7, 0.3, 'a'], [3, 0.3, 'a'], [-2, 1.1, 'o']], base: 170, w: 0.9, hours: [6, 11] },                  // sardines and sea bream from the Harima coast: high to low
  oil: { cry: [[-5, 0.7, 'o'], [-1, 0.5, 'o'], [-7, 1.6, 'u']], base: 120, w: 0.6, hours: [8, 16] },                                  // lamp oil: low and long
  charcoal: { cry: [[4, 0.4, 'a'], [0, 0.5, 'o'], [2, 0.4, 'o'], [-2, 1.4, 'u']], base: 140, w: 0.8, hours: [7, 15], season: [270, 90] },  // charcoal and firewood in the cold months
  water: { cry: [[7, 0.3, 'i'], [11, 0.3, 'i'], [9, 0.8, 'e']], base: 230, w: 0.7, hours: [10, 17], season: [140, 250] },             // cold water with sweet dumplings in the heat: a boy's high call
  tofu: { horn: [392, 523], w: 0.9, hours: [6, 10] },                                                                                 // the tofu seller's small brass horn, two notes
};

/** A trade is out at this hour and day of the year (weighted by rnd 0…1), or null. */
export function pickHjTrade(hour, doy, rnd = R()) {
  const list = Object.entries(HJ_TRADES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? inSeason(doy, T.season[0], T.season[1], 12) : 1) : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** A moving source on a street near the listener: { bus, f } or null (the map's `pedlarTrack`, the engine's `along` and `src`). */
function walker(m, speed, r50, reach = 70, lead = 30) {
  const l = m.lis(), M = m.plc?.life?.map, tr = M?.pedlarTrack ? M.pedlarTrack(l.x, l.z, R, reach, lead) : null;
  if (!tr) return null;
  const f = m.along(tr.pts, speed), bus = m.src(f, r50, { dur: f.dur + 2 });
  return { bus, f };
}
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const inWindow = (m, a, b) => inSeason(seasonDoy(m), a, b, 12) > 0.4;

export const HJ_VOICES = {
  // ── people passing (walks) ───────────────────────────────────────────────────
  /** A pedlar crying his trade as he goes (HJ_TRADES); the tofu seller blows his horn instead, twice, and again. */
  hjPedlar(t, bus, lv) {
    const hour = this.plc?.hourNow ?? 12, trade = pickHjTrade(hour, seasonDoy(this));
    const wk = trade && walker(this, 0.95, 11);
    if (!wk) return 1;
    const T = HJ_TRADES[trade], { f, bus: b } = wk;
    let w = t;
    for (let k = 0; w < t + f.dur - 3 && k < 4; k++) {
      const x = w;
      if (T.horn) {
        for (const [i, fr] of T.horn.entries()) this.cue(x + i * 0.55, (y) => this.tone(y, [[0, fr * 0.97], [0.05, fr], [0.4, fr * 0.99]], 0.5, 0.05 * lv, b, 'sawtooth', ['bandpass', 1000, 3]));
      } else this.cue(x, (y) => this.cry(y, T.base * (0.93 + R() * 0.14), T.cry, 0.05 * lv, b, { fem: false, cutoff: 4000 }));
      w += 8.5 + R() * 4;
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** A palanquin (kago) carried through the street: the bearers' quick steps in straw sandals, the pole's creak, the front bearer's call "ei" answered by the rear one's "ho". */
  hjKago(t, bus, lv) {
    const wk = walker(this, 1.5, 12, 90, 40);
    if (!wk) return 1;
    const { f, bus: b } = wk, pace = 0.38, n = Math.floor(f.dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => {
      this.step(x, 0.05 * lv, b, 'cloth', 0); this.step(x + 0.04, 0.04 * lv, b, 'cloth', 0);
      if (k % 2 === 0) this.rasp(x, 0.3, 520, 1.2, 0.012 * lv, b, 4, 0.7);
    });
    for (let k = 0; k * 4.2 + 2 < f.dur - 2; k++) {
      const x = t + 2 + k * 4.2;
      this.cue(x, (y) => this.cry(y, 150 * (0.95 + R() * 0.1), [[0, 0.3, 'e'], [2, 0.45, 'i']], 0.05 * lv, b, { cutoff: 3600 }));
      this.cue(x + 0.75, (y) => this.cry(y, 118 * (0.95 + R() * 0.1), [[0, 0.5, 'o']], 0.05 * lv, b, { cutoff: 3200 }));
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** The night watch (yomawari): two blows of the wooden clappers (hyoshigi), a pause, two more, and now and then the call against fire, drawn out and falling. Walks. */
  hjHyoshigi(t, bus, lv) {
    const wk = walker(this, 1.0, 14, 90, 34);
    if (!wk) return 1;
    const { f, bus: b } = wk;
    let w = t;
    for (let rep = 0; w < t + f.dur - 3; rep++) {
      for (const d of [0, 0.7]) this.cue(w + d, (x) => { this.knock(x, 1250, 0.05 * lv, b, 0.05); this.knock(x + 0.01, 880, 0.04 * lv, b, 0.07); this.burst(x, 0.02, 3000, 1, 0.02 * lv, b); });
      w += 2.9;
      if (rep % 3 === 2) { const x = w; this.cue(x, (y) => this.cry(y, 135 * (0.95 + R() * 0.1), [[2, 0.4, 'i'], [2, 0.3, 'o'], [-1, 0.3, 'o'], [0, 0.45, 'i'], [-5, 1.3, 'o']], 0.05 * lv, b, { cutoff: 3800 })); w += 3.4; }
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },

  // ── work in the houses ──────────────────────────────────────────────────────
  /** The fulling block (kinuta) at night in the autumn, a woman beating cloth with a wooden mallet on a wooden block: a hollow knock, a pause, a pair, the rhythm slow and even. */
  hjKinuta(t, bus, lv) {
    if (!inWindow(this, 230, 330)) return 1;
    let w = t;
    for (let k = 0, n = 12 + Math.floor(R() * 8); k < n; k++) { const x = w, a = 0.8 + 0.2 * Math.sin(k * 2.1); this.cue(x, (y) => { this.knock(y, 300 + (k % 2) * 28, 0.09 * lv * a, bus, 0.13); this.burst(y, 0.04, 800, 1, 0.025 * lv * a, bus); }); w += k % 3 === 2 ? 1.25 : 0.55 + R() * 0.05; }
    return w - t + 0.6;
  },
  /** The oil press (shime-gi): the heavy mallet driving the wedges home, slow dull blows, the timber's groan between. */
  hjWedge(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 4); k < n; k++) { const x = w; this.cue(x, (y) => { this.knock(y, 140, 0.11 * lv, bus, 0.16); this.burst(y, 0.07, 380, 0.8, 0.05 * lv, bus); if (k % 3 === 2) this.tone(y + 0.15, [[0, 95], [0.8, 82]], 0.9, 0.01 * lv, bus, 'sawtooth', ['bandpass', 300, 4]); }); w += 1.1 + R() * 0.35; }
    return w - t + 0.8;
  },
  /** The cooper (oke-ya) driving a hoop of split bamboo down a tub with a mallet and a drift: quick rings, the tub's hollow, a pause to turn it. */
  hjHoop(t, bus, lv) {
    let w = t;
    for (let rep = 0, n = 2 + Math.floor(R() * 2); rep < n; rep++) {
      for (let k = 0, m = 5 + Math.floor(R() * 4); k < m; k++) { const x = w; this.cue(x, (y) => { this.knock(y, 520 + R() * 60, 0.07 * lv, bus, 0.07); this.tone(y, [[0, 210], [0.12, 190]], 0.18, 0.02 * lv, bus, 'sine'); }); w += 0.28 + R() * 0.07; }
      w += 1.4 + R();
    }
    return w - t + 0.5;
  },

  // ── the town's small ceremonies and animals ─────────────────────────────────
  /** The Inari shrine: the rope shaken so that the bell (suzu) rattles, two claps, a moment's quiet, a clap again. */
  hjSuzu(t, bus, lv) {
    this.cue(t, (x) => { for (let k = 0; k < 7; k++) this.tone(x + k * 0.05, [[0, (2100 + 150 * (k % 3)) * (0.97 + 0.06 * R())]], 0.45, 0.012 * lv, bus, 'sine'); this.rasp(x, 0.5, 700, 1, 0.01 * lv, bus, 14, 0.9); });
    for (const d of [1.2, 1.55]) this.cue(t + d, (x) => { this.burst(x, 0.05, 1800, 0.7, 0.07 * lv, bus); this.burst(x, 0.12, 700, 0.6, 0.03 * lv, bus); });
    return 3.5;
  },
  /** A horse at its post: stamping, a snort through the lips, now and then a short neigh that rises and falls. */
  hjHorse(t, bus, lv) {
    this.cue(t, (x) => { this.knock(x, 130, 0.06 * lv, bus, 0.1); this.burst(x, 0.04, 600, 1, 0.03 * lv, bus); });
    this.cue(t + 0.45, (x) => { this.knock(x, 120, 0.05 * lv, bus, 0.1); });
    this.cue(t + 1.4, (x) => this.rasp(x, 0.5, 900, 0.7, 0.02 * lv, bus, 22, 0.9));
    if (R() < 0.5) this.cue(t + 3, (x) => { this.tone(x, [[0, 520], [0.15, 880], [0.45, 700], [0.9, 380]], 1.1, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1300, 2.5]); this.rasp(x, 1.0, 2400, 1, 0.006 * lv, bus, 30, 0.8); });
    return 5;
  },
};
export const HJ_GAIN = {};

addVoices('voices-himeji.js', HJ_VOICES, HJ_GAIN);
void clamp;
