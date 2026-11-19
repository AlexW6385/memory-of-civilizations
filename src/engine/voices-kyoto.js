// The placed voices of Muromachi Kyoto (docs/settlements/muromachi-kyoto.md §12; src/settlements/muromachi-kyoto/soundmap.js
// says where each is made and when). Added to the engine's VOICES (voices.js) from here, so that nothing of the existing
// voices is changed: the audio engine copies VOICES onto Music's prototype once (installVoices), after every module is
// loaded. Each voice is a method `name(t, bus, lv, …)` that queues its events from `t` into `bus` and returns how long it
// lasts, as the voices of voices.js do; the ones marked "walks" make a bus of their own that moves along a street near the
// listener (the engine's fixed emitter only gives them their hour and their gap). All synthesised, no samples.
// [inferred throughout: no recording of Muromachi Kyoto exists; the instruments, calls and hours are from general knowledge
// of the Japanese sources named in the dossier, and the pitches and contours are ours.]

import { VOICES, inSeason, doyOf, inHours } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const YO = [0, 2, 5, 7, 9];                                   // the yo scale (D E G A B), as the dossier's music.js
const yo = (deg) => Math.floor(deg / 5) * 12 + YO[((deg % 5) + 5) % 5];
const hz = (base, semis) => base * Math.pow(2, semis / 12);

/** The cries of the pedlars (wordless: [semitones above the voice's base, seconds, vowel]); the trades are those of the women and men who came into the
 * city from the villages round it, the women (-me) with their loads on their heads [inferred from the 16th-c. trade-poem contests and the rakuchū rakugai screens]. */
export const KYOTO_TRADES = {
  firewood: { cry: [[5, 0.35, 'a'], [0, 0.45, 'o'], [3, 0.35, 'o'], [0, 1.5, 'u']], fem: true, w: 1.3, hours: [7, 15] },                       // the Ōhara woman: a falling, drawn-out call
  flowers: { cry: [[0, 0.3, 'i'], [4, 0.3, 'i'], [7, 0.9, 'a'], [4, 0.4, 'a'], [2, 1.0, 'o']], fem: true, w: 1.0, hours: [7, 12], season: [40, 300] },  // the Shirakawa woman
  fish: { cry: [[7, 0.25, 'u'], [4, 0.3, 'u'], [2, 0.3, 'o'], [-3, 1.0, 'o']], fem: true, w: 0.8, hours: [6, 11] },                              // sweetfish and carp from the river: a fall from high to low
  oil: { cry: [[-4, 0.7, 'o'], [0, 0.5, 'o'], [-5, 1.6, 'u']], fem: false, w: 0.7, hours: [8, 16], base: 128 },                                  // the oil seller of Yamazaki: low and long
  rice: { cry: [[0, 0.3, 'a'], [5, 0.3, 'a'], [0, 0.3, 'a'], [5, 0.3, 'a'], [2, 1.0, 'o']], fem: true, w: 0.7, hours: [7, 18], season: [320, 110] },  // pounded rice cakes in the cold months, two notes alternating
  greens: { cry: [[0, 0.35, 'a'], [2, 0.3, 'e'], [5, 0.3, 'e'], [7, 1.1, 'i']], fem: true, w: 1.0, hours: [6, 10] },                              // vegetables from the farms: a stepwise climb
};

/** A trade is out at this hour and day of the year (weighted by rnd 0…1), or null. */
export function pickKyotoTrade(hour, doy, rnd = R()) {
  const list = Object.entries(KYOTO_TRADES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? inSeason(doy, T.season[0], T.season[1], 12) : 1) : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** A moving source on a street near the listener: { bus, f } or null (the map's `streetTrack`, the engine's `along` and `src`). */
function walker(m, speed, r50, reach = 70, lead = 30) {
  const l = m.lis(), M = m.plc?.life?.map, tr = M?.pedlarTrack ? M.pedlarTrack(l.x, l.z, R, reach, lead) : null;
  if (!tr) return null;
  const f = m.along(tr.pts, speed), bus = m.src(f, r50, { dur: f.dur + 2 });
  return { bus, f };
}
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
/** Is the day of the year inside the window (days of the year from a to b, fading over 12 days at each end)? A voice out of its season makes nothing. */
const inWindow = (m, a, b) => inSeason(seasonDoy(m), a, b, 12) > 0.4;

export const KYOTO_VOICES = {
  // ── the temples ──────────────────────────────────────────────────────────────
  /** A great bonshō struck slowly with its swung log, seven strokes (a Zen temple's dawn and dusk bell); `f` its note. */
  bonshoSeries(t, bus, lv, f = 90) {
    const n = 7;
    for (let k = 0; k < n; k++) this.cue(t + k * (6.6 + R() * 0.8), (x) => this.bonsho(x, f * (1 + 0.004 * (k % 2)), 0.045 * lv * (k > n - 3 ? 0.8 : 1), bus, 0.7 + R() * 0.4));
    return n * 7 + 6;
  },
  bonshoGinkaku(t, bus, lv) { return this.bonshoSeries(t, bus, lv, 86); },
  bonshoRyoan(t, bus, lv) { return this.bonshoSeries(t, bus, lv, 96); },
  /** The han, a board hung by the kitchen and struck to call the monks: slow knocks quickening to a roll, then three slow ones. */
  hanBoard(t, bus, lv) {
    let w = t, gap = 1.3;
    for (let k = 0; k < 26; k++) {
      const x = w, a = 0.7 + 0.3 * Math.sin(k * 1.7);
      this.cue(x, (y) => { this.knock(y, 560 + R() * 40, 0.075 * lv * a, bus, 0.13); this.burst(y, 0.03, 1900, 1, 0.035 * lv * a, bus); });
      w += gap; gap = Math.max(0.09, gap * 0.86);
    }
    for (const d of [0.9, 2.1, 3.5]) this.cue(w + d, (y) => { this.knock(y, 520, 0.09 * lv, bus, 0.16); this.burst(y, 0.04, 1700, 1, 0.04 * lv, bus); });
    return w - t + 4.5;
  },
  /** Monks chanting a sutra in the hall: a low monotone in unison, the bowl-gong (keisu) struck at its start, between and at its end. */
  keisuChant(t, bus, lv) {
    this.cue(t, (x) => this.templeBell(x, 330, 0.03 * lv, bus, 0.18));
    const end = this.chant(t + 3, 34 + Math.floor(R() * 12), 0.034 * lv, bus, false);
    this.cue(t + (end - t) * 0.5, (x) => this.templeBell(x, 330, 0.025 * lv, bus, 0.15));
    this.cue(end + 0.6, (x) => this.templeBell(x, 330, 0.03 * lv, bus, 0.2));
    return end - t + 4;
  },
  /** The raking and sweeping of the gravel, early: long strokes of a bamboo rake and a besom on gravel, the pause as the rake is lifted. */
  gravel(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const d = 0.9 + R() * 0.7;
      this.cue(w, (x) => { this.rasp(x, d, 2300 + R() * 500, 0.7, 0.026 * lv, bus, 17 + R() * 6, 0.9); this.rasp(x + 0.05, d * 0.9, 5200, 0.8, 0.008 * lv, bus, 31, 0.8); });
      w += d + 0.3 + R() * 0.9;
    }
    return w - t + 0.5;
  },
  /** A tea kettle on the hearth simmering (matsukaze, the pine wind): a soft hiss that swells and falls, small ticks of the iron, the lid. */
  kettleSimmer(t, bus, lv) {
    const dur = 7 + R() * 3;
    this.rasp(t, dur, 2800, 0.5, 0.011 * lv, bus, 0.4, 0.8);
    this.rasp(t, dur, 1100, 0.6, 0.006 * lv, bus, 0.7, 0.8);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + R() * (dur - 2), (x) => this.struck(x, 2400, 0.012 * lv, bus, [[1, 1, 0.08], [2.4, 0.4, 0.05]]));
    if (R() < 0.4) this.cue(t + dur * 0.5, (x) => this.clink(x, 0.01 * lv, bus));
    return dur;
  },
  /** A shakuhachi (the komusō's end-blown flute, here the hitoyogiri's long breathy notes in the yo scale on D) at a distance. */
  shakuhachi(t, bus, lv) {
    const D = 146.8, contour = [3, 4, 2, 3, 1, 2, 0], n = 4 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const d = k === n - 1 ? 4.5 + R() * 2 : 2 + R() * 2.4, deg = contour[Math.min(contour.length - 1, Math.floor(k * contour.length / n))] + (R() < 0.15 ? 5 : 0);
      this.xiaoNote(w, hz(D, yo(deg)) * 2, d, 0.05 * lv, bus, k ? -1.2 - R() * 1.6 : -3);       // (the xiao's breathy note, an octave over D3: the shakuhachi's range)
      w += d + 0.35 + R() * 0.8;
    }
    return w - t + 0.5;
  },

  // ── the Noh at the shrine ────────────────────────────────────────────────────
  /** The hip drum ōtsuzumi's crack, the shoulder drum kotsuzumi's hollow note, and the drummers' calls (kakegoe). */
  nohDrum(when, dest, lv, big, call) {
    if (big) {
      this.burst(when, 0.035, 2700 + R() * 300, 2, 0.1 * lv, dest); this.tone(when, [[0, 560], [0.05, 280]], 0.12, 0.05 * lv, dest, 'sine'); this.knock(when, 190, 0.05 * lv, dest, 0.07);
    } else {
      this.tone(when, [[0, 720], [0.14, 430]], 0.2, 0.055 * lv, dest, 'sine', ['bandpass', 600, 1.2]); this.burst(when, 0.02, 1500, 1.5, 0.03 * lv, dest);
    }
    if (call) this.cue(when - 0.34, (x) => this.cry(x, big ? 150 : 175, call, 0.07 * lv, dest, { cutoff: 3600 }));
  },
  /** A passage of Noh: the flute's opening, the chorus's long ornamented phrases in the yo scale, the two drums answering with their calls, the flute's piercing high note. */
  noh(t, bus, lv) {
    const calls = [[[0, 0.18, 'a'], [3, 0.5, 'o']], [[2, 0.14, 'i'], [0, 0.55, 'a']], [[0, 0.3, 'o'], [-2, 0.5, 'o']]], pick = () => calls[Math.floor(R() * calls.length)];
    // the flute, alone: three long breathy notes and a run (the nōkan is high and shrill: here D5 and up)
    const F = 587;
    let w = t;
    for (const [deg, d] of [[0, 2.4], [2, 1.8], [1, 3.0]]) { this.xiaoNote(w, hz(F, yo(deg)), d, 0.045 * lv, bus, -1.5); w += d + 0.5; }
    // the chorus (jiutai): long phrases, sliding between the notes, the drums beginning under the second
    const phrases = [[0, 2, 1, 0], [2, 3, 2, 1, 0], [1, 2, 3, 4, 3, 2, 0]], V = ['o', 'a', 'u', 'e', 'o', 'a'];
    let p0 = w + 1.5, beat = 1.35;
    phrases.forEach((ph, i) => {
      const notes = ph.map((deg, j) => [yo(deg), 0.9 + (j === ph.length - 1 ? 1.3 : R() * 0.8), V[(i * 3 + j) % V.length]]);
      this.cue(p0, (x) => this.cry(x, 98, notes, 0.05 * lv, bus, { cutoff: 2700 }));
      const len = notes.reduce((s, n) => s + n[1], 0);
      if (i) for (let k = 0, q = p0 + 0.6; q < p0 + len; k++, q += beat * (k % 3 === 2 ? 1.4 : 1)) { const x = q, big = k % 2 === 0; this.cue(x, (y) => this.nohDrum(y, bus, lv, big, k % 4 === 0 ? pick() : null)); }
      p0 += len + 1.4; beat *= 0.82;
    });
    // the piercing high note of the flute (hishigi) before the drums close
    this.cue(p0, (x) => this.tone(x, [[0, 1250], [0.12, 1480], [0.9, 1400]], 0.9, 0.05 * lv, bus, 'sine', ['bandpass', 1400, 4]));
    for (const d of [1.1, 2.0, 2.7]) this.cue(p0 + d, (x) => this.nohDrum(x, bus, lv, d > 2, d > 1.5 ? pick() : null));
    return p0 + 4 - t;
  },

  // ── the town's work ──────────────────────────────────────────────────────────
  /** Women washing cloth at the steps of the stream: the wet cloth beaten on the stone, rinsed with a long swish, wrung out, splashes. */
  washCloth(t, bus, lv) {
    let w = t;
    for (let rep = 0, n = 2 + Math.floor(R() * 2); rep < n; rep++) {
      for (let k = 0, m = 3 + Math.floor(R() * 4); k < m; k++) { const x = w; this.cue(x, (y) => { this.burst(y, 0.07, 480 + R() * 150, 0.9, 0.06 * lv, bus); this.tone(y, [[0, 130], [0.06, 85]], 0.09, 0.04 * lv, bus, 'sine'); this.burst(y + 0.02, 0.18, 1900, 1.2, 0.012 * lv, bus, 0.01); }); w += 0.42 + R() * 0.2; }
      this.cue(w + 0.2, (y) => { this.rasp(y, 0.9, 1300, 0.7, 0.02 * lv, bus, 3, 0.9); for (let q = 0; q < 4; q++) this.drip(y + 0.4 + q * 0.25, lv * 0.7, bus); });
      w += 1.6 + R() * 1.2;
      if (R() < 0.5) { this.cue(w, (y) => this.tone(y, [[0, 420], [0.3, 520], [0.55, 380]], 0.55, 0.014 * lv, bus, 'sawtooth', ['bandpass', 800, 4])); w += 1.1; }
    }
    return w - t + 0.5;
  },
  /** Two women pounding rice in a mortar with wooden mallets (kine on usu), in turn: a dull knock and the slap of the hand turning the rice. */
  kine(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8), P = 0.95 + R() * 0.2;
    for (let k = 0; k < n; k++) this.cue(t + k * P / 2 + R() * 0.02, (x) => { this.knock(x, 150 + (k % 2) * 25, 0.1 * lv, bus, 0.11); this.burst(x, 0.05, 420, 1, 0.045 * lv, bus); if (k % 2) this.burst(x + 0.34, 0.06, 900, 1.2, 0.012 * lv, bus); });
    return n * P / 2 + 0.5;
  },
  /** The sandal-maker beating straw on a stone with a wooden mallet to soften it: muffled thuds, the rustle of the straw turned. */
  strawBeat(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { const x = w; this.cue(x, (y) => { this.knock(y, 210, 0.075 * lv, bus, 0.09); this.burst(y, 0.07, 700, 0.8, 0.04 * lv, bus); }); w += 0.55 + R() * 0.2; if (k % 4 === 3) { this.cue(w, (y) => this.rasp(y, 0.5, 2500, 0.6, 0.012 * lv, bus, 14, 0.9)); w += 0.8; } }
    return w - t + 0.5;
  },
  /** The paper-maker dipping the mould in the vat: a slosh, the water running off the frame in a pattering stream, the frame set down. */
  sukiya(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const x = w;
      this.cue(x, (y) => { this.rasp(y, 0.8, 700, 0.8, 0.03 * lv, bus, 2.5, 0.9); for (let q = 0; q < 7; q++) this.drip(y + 0.9 + q * 0.11, lv * 0.6, bus); });
      this.cue(x + 2.1, (y) => this.knock(y, 330, 0.03 * lv, bus, 0.07));
      w += 3.2 + R() * 1.5;
    }
    return w - t + 0.4;
  },
  /** The two-man great saw (ōga) drawn through a log: long slow rasping strokes in turn, the wood's ring at the end of each. */
  ogaSaw(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) { const d = 0.75 + R() * 0.2, x = w; this.cue(x, (y) => this.rasp(y, d, 1500 + (k % 2) * 300, 0.9, 0.04 * lv, bus, 26, 0.85)); w += d + 0.1; }
    this.cue(w, (x) => this.knock(x, 280, 0.05 * lv, bus, 0.08));
    return w - t + 0.4;
  },
  /** Beating the vat in a sake brewery: the long oar turned in the mash (a low creak and a thick slosh) and the brewers' drawn-out call. */
  vatStir(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) { const x = w; this.cue(x, (y) => { this.rasp(y, 1.3, 420, 0.7, 0.03 * lv, bus, 1.6, 0.9); this.tone(y, [[0, 180], [1.2, 150]], 1.2, 0.01 * lv, bus, 'sawtooth', ['bandpass', 600, 4]); }); w += 1.6; }
    if (R() < 0.6) this.cue(t + 1.5, (x) => this.cry(x, 125 * (0.94 + R() * 0.12), [[0, 0.5, 'o'], [4, 0.6, 'o'], [2, 1.6, 'u']], 0.04 * lv, bus, { cutoff: 3200 }));
    return w - t + 0.5;
  },

  // ── people passing (walks: each makes its own bus along a street near the listener) ──
  /** A pedlar crying her trade as she goes: the Ōhara woman's firewood, the Shirakawa woman's flowers, oil, fish, rice cakes, greens (KYOTO_TRADES). */
  pedlar(t, bus, lv) {
    const hour = this.plc?.hourNow ?? 12, trade = pickKyotoTrade(hour, seasonDoy(this));
    const wk = trade && walker(this, 0.95, 11);
    if (!wk) return 1;
    const T = KYOTO_TRADES[trade], { f, bus: b } = wk;
    let w = t;
    for (let k = 0; w < t + f.dur - 3 && k < 4; k++) {
      const x = w, f0 = (T.base || (T.fem ? 300 : 175)) * (0.93 + R() * 0.14);
      this.cue(x, (y) => this.cry(y, f0, T.cry, 0.05 * lv, b, { fem: T.fem, cutoff: 4200 }));
      w += 8.5 + R() * 4;
    }
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },
  /** A string of packhorses led through the street (the transport men, bashaku, of the Ōmi road): the hooves' steady knock, the horses' small bells, the driver's call. */
  packhorse(t, bus, lv) {
    const wk = walker(this, 1.15, 14, 90, 40);
    if (!wk) return 1;
    const { f, bus: b } = wk, pace = 0.62, n = Math.floor(f.dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace, (x) => {
      this.knock(x, 240 + R() * 40, 0.05 * lv, b, 0.06); this.burst(x, 0.04, 800, 1, 0.03 * lv, b);
      this.knock(x + 0.31, 210, 0.04 * lv, b, 0.06);
      if (k % 3 === 0) for (const [m, a] of [[1, 1], [2.3, 0.4]]) this.tone(x + 0.02, [[0, 1750 * m * (0.97 + 0.06 * R())]], 0.35, 0.012 * lv * a, b, 'sine');
    });
    for (let k = 0; k < 2 && 2 + k * 6 < f.dur - 2; k++) this.cue(t + 2 + k * 6, (x) => this.cry(x, 138 * (0.95 + R() * 0.1), [[0, 0.25, 'e'], [5, 0.5, 'o']], 0.05 * lv, b, { cutoff: 3600 }));
    b.emitter.until = t + f.dur + 1.5;
    return f.dur;
  },

  // ── creatures of Kyoto's seasons ─────────────────────────────────────────────
  /** The evening cicada (higurashi), kana-kana-kana: a train of falling, chattering notes, quickening and then slowing; walks to a tree near the listener. */
  higurashi(t, bus, lv) {
    if (!inWindow(this, 185, 270)) return 1;
    const M = this.plc?.life?.map, l = this.lis(), p = M?.treeSpot ? M.treeSpot(l.x, l.z, R, 36) : null;
    if (!p) return 1;
    const b = this.src(p, 12, { dur: 12 }), ctx = this.ctx, n = 6 + Math.floor(R() * 5), f = 4300 + R() * 700;
    let w = t, gap = 0.5;
    for (let k = 0; k < n; k++) {
      const x = w;
      this.cue(x, (y) => {
        const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), am = ctx.createGain(), pulse = ctx.createOscillator(), pg = ctx.createGain(), env = ctx.createGain();
        s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.setValueAtTime(f * 1.25, y); bp.frequency.exponentialRampToValueAtTime(f * 0.8, y + 0.4);
        am.gain.value = 0.5; pulse.type = 'square'; pulse.frequency.value = 62 + R() * 8; pg.gain.value = 0.5; pulse.connect(pg); pg.connect(am.gain);
        env.gain.setValueAtTime(0.0001, y); env.gain.exponentialRampToValueAtTime(0.03 * lv, y + 0.08); env.gain.exponentialRampToValueAtTime(0.0001, y + 0.42);
        s.connect(bp); bp.connect(am); am.connect(env); env.connect(b); s.start(y, R() * 3); s.stop(y + 0.45); pulse.start(y); pulse.stop(y + 0.45);
      });
      w += gap; gap = k < n / 2 ? Math.max(0.3, gap * 0.9) : gap * 1.12;
    }
    b.emitter.until = w + 2;
    return w - t;
  },
  /** The bush warbler (uguisu): a long steady whistle, ho, then ho-ke-kyo: two quick notes high above it, the last trilled and sliding down. */
  uguisu(t, bus, lv) {
    if (!inWindow(this, 45, 180)) return 1;
    const M = this.plc?.life?.map, l = this.lis(), p = M?.treeSpot ? M.treeSpot(l.x, l.z, R, 41) : null;
    if (!p) return 1;
    const b = this.src(p, 16, { dur: 14 }), f = 1050 + R() * 120;
    let w = t;
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) {
      const x = w;
      this.cue(x, (y) => {
        this.tone(y, [[0, f * 0.97], [0.12, f], [0.75, f * 1.02]], 0.78, 0.03 * lv, b, 'sine');                  // ho
        this.tone(y + 1.15, [[0, f * 1.04], [0.22, f * 1.04]], 0.24, 0.018 * lv, b, 'sine');                      // ho
        this.tone(y + 1.5, [[0, f * 2.7], [0.07, f * 3.1]], 0.08, 0.016 * lv, b, 'sine');                         // ke
        this.tone(y + 1.62, [[0, f * 3.3], [0.1, f * 3.6], [0.32, f * 2.9]], 0.34, 0.022 * lv, b, 'sine');        // kyo, the trill
        this.tone(y + 1.62, [[0, f * 6.6], [0.32, f * 5.8]], 0.3, 0.003 * lv, b, 'sine');
      });
      w += 3.4 + R() * 2;
    }
    b.emitter.until = w + 1;
    return w - t;
  },
  /** The lesser cuckoo (hototogisu) by night: tok-kyo-kyo-kyo-kyo-kyo, a brisk run of shrill notes. */
  hototogisu(t, bus, lv) {
    if (!inWindow(this, 125, 205)) return 1;
    const M = this.plc?.life?.map, l = this.lis(), p = M?.treeSpot ? M.treeSpot(l.x, l.z, R, 60) ?? [l.x + 90, l.z + 40] : null;
    if (!p) return 1;
    const b = this.src(p, 40, { dur: 12 }), f = 3050 + R() * 250;
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const x = w;
      this.cue(x, (y) => {
        this.tone(y, [[0, f * 0.8], [0.06, f * 0.85]], 0.07, 0.02 * lv, b, 'sine');
        for (let q = 0; q < 5; q++) this.tone(y + 0.2 + q * 0.13, [[0, f * (1 + 0.04 * q)], [0.05, f * (1.06 + 0.04 * q)], [0.1, f * (0.95 + 0.04 * q)]], 0.11, 0.024 * lv, b, 'sine');
      });
      w += 2.6 + R() * 2.4;
    }
    b.emitter.until = w + 1;
    return w - t;
  },
  /** The bell cricket (suzumushi): a ringing, bell-like rin-rin, a pulsed pure tone near 5 kHz in bursts, in the grass of an autumn night. */
  suzumushi(t, bus, lv) {
    if (!inWindow(this, 215, 300)) return 1;
    const ctx = this.ctx, M = this.plc?.life?.map, l = this.lis(), a = R() * Math.PI * 2, d = 3 + R() * 12, p = [l.x + Math.cos(a) * d, l.z + Math.sin(a) * d];
    if (M?.greenNear && M.greenNear(p[0], p[1]) < 0.3) return 1;
    const b = this.src(p, 6, { dur: 8 }), f = 5000 + R() * 450;
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) {
      const x = w, o = ctx.createOscillator(), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), env = ctx.createGain();
      o.frequency.value = f; lfo.frequency.value = 38 + R() * 6; am.gain.value = 0.5; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
      env.gain.setValueAtTime(0.0001, x); env.gain.exponentialRampToValueAtTime(0.026 * lv, x + 0.03); env.gain.setValueAtTime(0.026 * lv, x + 0.28); env.gain.exponentialRampToValueAtTime(0.0001, x + 0.4);
      o.connect(am); am.connect(env); env.connect(b); o.start(x); lfo.start(x); o.stop(x + 0.45); lfo.stop(x + 0.45);
      w += 0.55 + R() * 0.2;
    }
    b.emitter.until = w + 1;
    return w - t;
  },
  /** The Ural owl at night over the hills: two or three low hoots, the last longer and falling. */
  owl(t, bus, lv) {
    const f = 330 + R() * 40;
    for (const [d, a] of [[0, 1], [0.7, 0.8], [1.8, 1]]) this.cue(t + d, (x) => this.tone(x, [[0, f * 1.03], [0.2, f], [d > 1.5 ? 0.9 : 0.35, f * (d > 1.5 ? 0.85 : 0.97)]], d > 1.5 ? 0.9 : 0.4, 0.02 * lv * a, bus, 'sine', ['lowpass', 900, 1]));
    return 3.2;
  },
};

Object.assign(VOICES, KYOTO_VOICES);
void clamp;
