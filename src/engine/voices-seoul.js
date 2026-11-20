// The placed voices of Joseon Hanyang, c. 1888 (docs/settlements/joseon-seoul.md §19.3; src/settlements/joseon-seoul/soundmap.js says where
// each is made and when). Added to the engine's VOICES (voices.js) through addVoices, every name prefixed `seo` (a name defined twice
// throws), so nothing of the existing voices is changed. Each voice is a method `name(t, bus, lv, …)` that queues its events from `t`
// into `bus` and returns how long it lasts; the ones marked "walks" make a bus of their own that moves along a street near the listener
// (the engine's fixed emitter only gives them their hour and their gap). All synthesised, no samples.
// [stated: the beating of cloth on a stone at night (dadeumi) is the sound travellers of the 1880s and 90s heard in Seoul's streets
// (the dossier §19.3 names Allen and Bird); inferred throughout else: no recording of 1888 exists; the cries, the taffy seller's shears,
// the oxen's bells and the watch's blows are from general knowledge of Joseon street life, and the pitches and contours are ours.]

import { addVoices, inSeason, doyOf, inHours } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;

/** The cries of the pedlars (wordless: [semitones above the voice's base, seconds, vowel]) [inferred: the trades are Seoul's, none of the calls is recorded]. */
export const SEO_TRADES = {
  shrimp: { cry: [[0, 0.35, 'a'], [4, 0.3, 'a'], [7, 0.3, 'u'], [4, 1.1, 'o']], base: 150, w: 1.0, hours: [6, 11] },                    // salted shrimp (saeu-jeot) from the river ports: a rise and a fall
  fish: { cry: [[7, 0.25, 'i'], [5, 0.3, 'a'], [0, 0.3, 'a'], [-4, 1.2, 'o']], base: 165, w: 0.8, hours: [6, 12] },                      // fresh fish from Mapo: high to low
  firewood: { cry: [[-3, 0.6, 'o'], [0, 0.5, 'o'], [-5, 1.5, 'u']], base: 125, w: 0.8, hours: [7, 15], season: [280, 90] },            // brushwood on an ox or a man's A-frame, in the cold months: low and long
  water: { cry: [[5, 0.3, 'i'], [9, 0.3, 'i'], [7, 0.9, 'e']], base: 235, w: 0.6, hours: [9, 17], season: [140, 250] },               // a water-carrier's boy in the heat
  bean: { cry: [[2, 0.4, 'o'], [-1, 0.4, 'o'], [4, 0.9, 'a']], base: 140, w: 0.6, hours: [5, 9] },                                     // the bean-curd seller early: a short question
};

/** A trade is out at this hour and day of the year (weighted by rnd 0…1), or null. */
export function pickSeoTrade(hour, doy, rnd = R()) {
  const list = Object.entries(SEO_TRADES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? inSeason(doy, T.season[0], T.season[1], 12) : 1) : 0]);
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

export const SEO_VOICES = {
  // ── people passing (walk) ────────────────────────────────────────────────────
  /** A pedlar crying his trade as he goes (SEO_TRADES), a call every eight to twelve seconds. Walks. */
  seoPedlar(t, bus, lv) {
    const hour = this.plc?.hourNow ?? 12, trade = pickSeoTrade(hour, this.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value));
    const wk = trade && walker(this, 0.95, 11);
    if (!wk) return 1;
    const T = SEO_TRADES[trade], { f, bus: b } = wk;
    let w = t;
    for (let k = 0; w < t + f.dur - 3 && k < 4; k++) {
      const x = w;
      this.cue(x, (y) => this.cry(y, T.base * (0.93 + R() * 0.14), T.cry, 0.05 * lv, b, { fem: false, cutoff: 3800 }));
      w += 8.5 + R() * 4;
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** The taffy seller (yeot-jangsu) with his big shears (yeot-gawi): the blades clacked together in a running rhythm, long and short, to draw the children, and the box of sweets carried on his arm. Walks. */
  seoGawi(t, bus, lv) {
    const wk = walker(this, 1.1, 10, 80, 30);
    if (!wk) return 1;
    const { f, bus: b } = wk, beat = 0.19 + R() * 0.03;
    const phrase = [1, 1, 1, 0, 1, 1, 0, 1, 0, 0];                      // clack clack clack – clack clack – clack – –
    for (let k = 0, w = t + 0.3; w < t + f.dur - 2; k++) {
      if (phrase[k % phrase.length]) this.cue(w, (x) => { this.knock(x, 2300 + (k % 2) * 260 + R() * 80, 0.045 * lv, b, 0.04); this.tone(x, [[0, 4200], [0.05, 3600]], 0.07, 0.012 * lv, b, 'sine'); });
      w += beat * (k % phrase.length === 9 ? 1.6 : 1);
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** An ox under its load, led down the street: the clapper of the wooden bell at its neck, slow and uneven with the stride, the hooves dull on the packed earth. Walks. */
  seoOxBell(t, bus, lv) {
    const wk = walker(this, 0.8, 12, 90, 40);
    if (!wk) return 1;
    const { f, bus: b } = wk;
    for (let k = 0, w = t; w < t + f.dur - 1; k++) {
      const x = w;
      this.cue(x, (y) => { this.knock(y, 520 + R() * 40, 0.05 * lv, b, 0.1); this.knock(y + 0.09, 480, 0.03 * lv, b, 0.1); });
      this.cue(x + 0.05, (y) => this.step(y, 0.04 * lv, b, 'cloth', 1));
      w += 0.85 + R() * 0.25;
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** The night watch (the patrol that walked the streets after the bell): slow single blows on a wooden clapper, three and a pause, and now and then a long falling call. Walks. [inferred] */
  seoGyeongjeom(t, bus, lv) {
    const wk = walker(this, 1.0, 14, 90, 34);
    if (!wk) return 1;
    const { f, bus: b } = wk;
    let w = t;
    for (let rep = 0; w < t + f.dur - 3; rep++) {
      for (let d = 0; d < 3; d++) this.cue(w + d * 0.95, (x) => { this.knock(x, 900, 0.06 * lv, b, 0.07); this.knock(x + 0.012, 620, 0.05 * lv, b, 0.1); this.burst(x, 0.02, 2600, 1, 0.02 * lv, b); });
      w += 4.6;
      if (rep % 3 === 2) { const x = w; this.cue(x, (y) => this.cry(y, 128 * (0.95 + R() * 0.1), [[3, 0.5, 'o'], [0, 0.4, 'o'], [-2, 1.5, 'u']], 0.05 * lv, b, { cutoff: 3400 })); w += 3.6; }
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },

  // ── work in the houses ──────────────────────────────────────────────────────
  /** The beating of cloth (dadeumi): two women, one each side of a stone, striking the damp folded cloth with their paired clubs in turn, quick and even, in rounds that end together on a held beat, then silence; it went on late at night. [stated: heard in the streets of Seoul] */
  seoDadeumi(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 3);
    for (let r = 0; r < rounds; r++) {
      const n = 8 + 2 * Math.floor(R() * 5), gap = 0.2 + R() * 0.03;
      for (let k = 0; k < n; k++) {
        const x = w, a = 0.85 + 0.15 * Math.sin(k * 1.9), hi = k % 2;
        this.cue(x, (y) => { this.knock(y, 330 + hi * 45, 0.085 * lv * a, bus, 0.1); this.burst(y, 0.035, 900, 1, 0.022 * lv * a, bus); });
        w += gap * (k === n - 2 ? 1.5 : 1);
      }
      w += 0.9 + R() * 0.8;
    }
    return w - t + 0.5;
  },
  /** The tiled mill-stone's wooden pestle (jeolgu) of the hanok yard: a dull stroke, a stroke, a pause. */
  seoPestle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) { const x = w; this.cue(x, (y) => { this.knock(y, 180, 0.09 * lv, bus, 0.14); this.burst(y, 0.06, 420, 0.8, 0.03 * lv, bus); }); w += k % 3 === 2 ? 1.3 : 0.6 + R() * 0.08; }
    return w - t + 0.6;
  },
};
export const SEO_GAIN = {};

addVoices('voices-seoul.js', SEO_VOICES, SEO_GAIN);
