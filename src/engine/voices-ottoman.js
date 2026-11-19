// Placed voices of Ottoman Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §19): the sounds the Süleymaniye's külliye and
// the timber quarter made, each a method `name(t, bus, lv)` on the audio engine's Music (installed by voices.js `installVoices`),
// and the scheduler `placedOttoman` that decides what is due where the listener stands (the place's map: src/settlements/ottoman-istanbul/soundmap.js,
// named by `schedule: 'placedOttoman'`). As Suzhou's voices (voices.js): synthesised from noise, oscillators, formant filters and struck partials,
// each event made when it is due with its own pitch and gap, nothing looped audibly; every level set by measuring a render (tools/sound-render.mjs),
// not by ear. [inferred throughout: no recording of the place at its date exists; the trades, calls and instruments are from what is known of the
// Ottoman city, the choice of where each stands is ours.]

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const inHours = (h, [a, b]) => (a <= b ? h >= a && h < b : h >= a || h < b);
/** 0…1: how much of a window of the year (day numbers a…b, wrapping the year's end) the day is in, with `fade` days of ramp at each end. */
const inSeason = (doy, a, b, fade = 14) => { const len = ((b - a) % 365.25 + 365.25) % 365.25, x = ((doy - a) % 365.25 + 365.25) % 365.25; return x > len ? 0 : clamp(Math.min(x, len - x) / fade, 0, 1); };

/** The windows of the year (days) of what is bound to a season: the swifts over the domes (April to August), the cicadas, the cold months' trades. */
export const SEASON_IST = { swift: [112, 232, 10], cicada: [165, 255, 14], sherbet: [140, 275, 14], boza: [290, 70, 14], salep: [305, 80, 14], storm: [0, 365, 1] };
export const seasonIst = (k, doy) => inSeason(doy, ...SEASON_IST[k]);

/**
 * The street trades' calls (wordless: formant vowels on the contour [semitones above the voice's base, seconds, vowel]); each its own contour, hours and season.
 * water: the saka's long call; sherbet: the cups jangling on his chain (an instrument, no cry); simit: a boy's call, two rising pairs; boza: a low call drawn out and falling, in
 * the cold months' evenings; porter: the hamal's warning cry to clear the way (destur: "by your leave").
 */
export const TRADES_IST = {
  water: { cry: [[7, 0.9, 'u'], [5, 0.5, 'u'], [0, 1.3, 'u']], fem: false, w: 1.2, hours: [6, 18], base: 165 },
  sherbet: { inst: 'cups', w: 0.8, hours: [10, 18], season: 'sherbet' },
  simit: { cry: [[4, 0.25, 'i'], [7, 0.25, 'i'], [4, 0.25, 'a'], [9, 0.9, 'a']], fem: true, w: 1.0, hours: [6, 11], base: 205 },
  boza: { cry: [[2, 0.6, 'o'], [0, 0.5, 'o'], [-3, 1.6, 'a']], fem: false, w: 1.3, hours: [17.5, 22.5], base: 128, season: 'boza' },
  porter: { cry: [[5, 0.3, 'e'], [0, 0.9, 'u']], fem: false, w: 1.0, hours: [7, 17], base: 150 },
};
/** Which trade is out at this hour and day of the year (weighted choice by rnd 0…1), or null. */
export function pickIst(hour, doy, rnd = R()) {
  const list = Object.entries(TRADES_IST).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w * (T.season ? seasonIst(T.season, doy) : 1) : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}

/** The Rast scale on G (the commonest makam of the ney, with its neutral third and sixth), in Hz from G4. [stated for the makam's intervals: general knowledge of Turkish music; used as a gesture, not a transcription] */
const RAST = [392, 440, 480, 523.3, 587.3, 641, 740, 784];

/** Levels of the voices (relative to their own scale), set by measurement. */
export const GAIN_IST = { copperBeat: 0.55, goldTap: 1.0, ladle: 0.6, recite: 1.0, fountain: 1.0, tavla: 0.8, ney: 0.55, swifts: 1.6, gull: 1.0, catCry: 1.0 };

export const OTTOMAN_VOICES = {
  // ── the work of the shops and kitchens ──────────────────────────────────────
  /** A coppersmith beating a sheet over his knee: the hammer at four or five strokes a second in rounds, a ringing copper note at each, a pause, a round again. */
  copperBeat(t, bus, lv) {
    let w = t;
    const rounds = 2 + Math.floor(R() * 2), f0 = 1050 + R() * 420;
    for (let k = 0; k < rounds; k++) {
      const n = 10 + Math.floor(R() * 12), P = 0.19 + R() * 0.05;
      for (let i = 0; i < n; i++) {
        const a = i % 5 === 0 ? 1 : 0.6, f = f0 * (0.96 + R() * 0.08);
        this.cue(w + i * P, (x) => { this.struck(x, f, 0.05 * lv * a, bus, [[1, 1, 0.2], [2.35, 0.5, 0.12], [3.9, 0.3, 0.07]]); this.burst(x, 0.015, 3200, 1, 0.03 * lv * a, bus); });
      }
      w += n * P + 0.9 + R() * 1.4;
    }
    return w - t;
  },
  /** The goldsmith's small hammer in the jewellers' lane: light taps, high and quick, in short runs. */
  goldTap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 10); k < n; k++) { const x = w; this.cue(x, (y) => this.struck(y, 2600 * (0.95 + R() * 0.1), 0.02 * lv, bus, [[1, 1, 0.08], [2.7, 0.4, 0.04]])); w += 0.13 + R() * 0.1; }
    return w - t + 0.3;
  },
  /** The cobbler's last-tap and the awl: short dull knocks at a walker's rate, a scrape of the knife. */
  lastTap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) { const x = w; this.cue(x, (y) => { this.knock(y, 340 + R() * 40, 0.05 * lv, bus, 0.05); this.burst(y, 0.02, 1800, 1, 0.02 * lv, bus); }); w += 0.28 + R() * 0.18; }
    this.cue(w + 0.3, (y) => this.rasp(y, 0.5, 2200, 0.8, 0.012 * lv, bus, 26, 0.8));
    return w - t + 1;
  },
  /** The butcher's cleaver on the block: heavy thuds in twos and threes, a bone's crack between. */
  chop(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { const x = w; this.cue(x, (y) => { this.tone(y, [[0, 170], [0.06, 85]], 0.12, 0.045 * lv, bus, 'sine'); this.burst(y, 0.03, 900, 1, 0.045 * lv, bus); }); w += 0.34 + R() * 0.2; if (k % 2) w += 0.5; }
    return w - t + 0.4;
  },
  /** The soup kitchen: a ladle struck on the great copper cauldron's rim (a low ring), the stir's scrape, the pestle thudding in a stone mortar. */
  ladle(t, bus, lv) {
    let w = t;
    this.cue(w, (x) => this.rasp(x, 2.2, 900, 0.6, 0.016 * lv, bus, 3, 0.7));
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { const x = w + 0.6 + k * (0.9 + R() * 0.7); this.cue(x, (y) => this.struck(y, 430 * (0.95 + R() * 0.1), 0.05 * lv, bus, [[1, 1, 0.55], [2.4, 0.55, 0.3], [4.1, 0.3, 0.16], [6.2, 0.15, 0.1]])); }
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { const x = w + 3.4 + k * 0.62; this.cue(x, (y) => { this.tone(y, [[0, 120], [0.09, 70]], 0.14, 0.06 * lv, bus, 'sine'); this.burst(y, 0.025, 600, 0.9, 0.03 * lv, bus); }); }
    return 7.5;
  },
  /** The baker's oven: the peel scraping over the stone floor, the loaves knocked, the fire's crackle. */
  ovenPeel(t, bus, lv) {
    this.rasp(t, 0.9, 750, 0.8, 0.022 * lv, bus, 12, 0.9);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + 1.1 + k * 0.32, (x) => this.knock(x, 210, 0.04 * lv, bus, 0.07));
    for (let k = 0; k < 14; k++) this.cue(t + R() * 3, (x) => this.burst(x, 0.012, 2800 + R() * 2000, 1.4, 0.014 * lv, bus));
    return 4;
  },
  /** Backgammon (tavla) in the coffee house: the dice rattled in the hand, thrown, and the checkers clapped down one after another. */
  tavla(t, bus, lv) {
    let w = t;
    for (let g = 0, rounds = 2 + Math.floor(R() * 3); g < rounds; g++) {
      for (let k = 0; k < 6; k++) this.cue(w + k * 0.06, (x) => this.burst(x, 0.03, 2400 + R() * 600, 2, 0.03 * lv, bus));
      this.cue(w + 0.45, (x) => { this.knock(x, 520, 0.05 * lv, bus, 0.05); this.knock(x + 0.07, 610, 0.04 * lv, bus, 0.04); });
      for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) this.cue(w + 1.1 + k * 0.4, (x) => { this.knock(x, 760, 0.05 * lv, bus, 0.04); this.burst(x, 0.015, 3000, 1.2, 0.02 * lv, bus); });
      w += 2.6 + R() * 2.4;
    }
    return w - t;
  },
  /** A tray of small cups carried: the porcelain chattering faintly. */
  trayCups(t, bus, lv) { for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.2 + R() * 0.15), (x) => this.clink(x, 0.006 * lv, bus)); return 2; },

  // ── water ───────────────────────────────────────────────────────────────────
  /** The şadırvan of the courtyard: water falling from its taps into the basin, a few seconds of broken hiss and the plink of drops under it. */
  fountain(t, bus, lv) {
    const dur = 4 + R() * 3;
    this.rasp(t, dur, 2600, 0.45, 0.014 * lv, bus, 28, 0.5);
    this.rasp(t, dur, 1100, 0.6, 0.012 * lv, bus, 9, 0.7);
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) this.cue(t + R() * dur, (x) => this.tone(x, [[0, 900 + R() * 900], [0.05, 1500 + R() * 800]], 0.06, 0.012 * lv, bus, 'sine'));
    return dur;
  },
  /** A street fountain (çeşme): a thin stream into the trough, a gurgle, a vessel filled (the pitch of the pour rising as it fills). */
  tap(t, bus, lv) {
    const dur = 3 + R() * 4;
    this.rasp(t, dur, 1900, 0.8, 0.012 * lv, bus, 21, 0.5);
    if (R() < 0.7) this.tone(t + 0.4, [[0, 300], [dur * 0.7, 700]], dur * 0.7, 0.01 * lv, bus, 'sine', ['bandpass', 600, 4]);
    return dur;
  },
  /** The hamam: drops falling from a dome into the marble basin with a long echo, the bowl (tas) scooped and its water poured over a bather. */
  hamamDrip(t, bus, lv) {
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      const x = t + k * (0.8 + R() * 1.6), f = 1100 + R() * 700;
      this.cue(x, (y) => { this.tone(y, [[0, f], [0.04, f * 1.5]], 0.07, 0.014 * lv, bus, 'sine'); this.tone(y + 0.23, [[0, f], [0.04, f * 1.5]], 0.07, 0.007 * lv, bus, 'sine'); this.tone(y + 0.51, [[0, f], [0.04, f * 1.5]], 0.07, 0.0035 * lv, bus, 'sine'); });
    }
    if (R() < 0.6) this.cue(t + 1.5 + R() * 2, (y) => { this.struck(y, 680, 0.02 * lv, bus, [[1, 1, 0.25], [2.5, 0.4, 0.12]]); this.cue(y + 0.35, (z) => this.burst(z, 0.8, 1400, 1.2, 0.025 * lv, bus, 0.1)); });
    return 6;
  },

  // ── voices ──────────────────────────────────────────────────────────────────
  /** A student reciting the Qur'an in a medrese or the tomb: a slow wordless chant on a few notes, each phrase falling to its close, a breath between. */
  recite(t, bus, lv) {
    const f0 = 120 + R() * 30, ph = [
      [[4, 0.55, 'a'], [5, 0.5, 'a'], [7, 0.9, 'i'], [5, 0.5, 'a'], [3, 0.5, 'a'], [0, 1.4, 'u']],
      [[7, 0.45, 'o'], [8, 0.4, 'o'], [7, 0.4, 'a'], [5, 0.7, 'a'], [4, 0.5, 'i'], [0, 1.8, 'a']],
    ];
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      const p = ph[Math.floor(R() * ph.length)], d = p.reduce((s, q) => s + q[1], 0);
      this.cue(w, (x) => this.cry(x, f0, p, 0.04 * lv, bus, { cutoff: 3200 }));
      w += d + 0.9 + R() * 1.4;
    }
    return w - t;
  },
  /**
   * A street trade's call, as he walks the way `f` (a track): his contour three or four times with a gap between, the sherbet seller's cups and the porter's steps between his calls.
   * trade: a key of TRADES_IST.
   */
  istVendor(t, bus, lv, f, trade) {
    const T = TRADES_IST[trade], dur = f.dur;
    let w = t;
    const gap = T.inst ? 2.5 + R() * 2 : 8 + R() * 4;
    for (let k = 0; w < t + dur - 3 && k < 5; k++) {
      const x = w, f0 = (T.base || 170) * (0.93 + R() * 0.14);
      this.cue(x, (y) => (T.inst ? this[T.inst](y, bus, lv) : this.cry(y, f0, T.cry, 0.05 * lv, bus, { fem: !!T.fem, cutoff: 4200 })));
      w += gap + R() * 3;
    }
    if (trade === 'porter') for (let s = 0; s * 0.62 < dur - 1; s++) this.cue(t + s * 0.62, (y) => { this.step(y, 0.05 * lv, bus, 'cloth', 0.2); if (s % 6 === 5) this.rasp(y + 0.1, 0.4, 600, 0.9, 0.012 * lv, bus, 4, 0.8); });   // heavy steps and the load's cord creaking
    return dur;
  },
  /** The sherbet seller's brass cups on their chain, jangling at his walking pace. */
  cups(t, bus, lv) { for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.22 + R() * 0.1), (x) => this.struck(x, 1900 + R() * 900, 0.014 * lv, bus, [[1, 1, 0.12], [2.2, 0.5, 0.07]])); return 2.5; },
  /** A night patrol: two or three men's hard soles on the paving, a staff tapped between steps, a lantern's chain; along the track `f`. */
  patrolSteps(t, bus, lv, f) {
    const dur = f.dur, T = 0.58 + R() * 0.08;
    for (let s = 0; s * T < dur; s++) this.cue(t + s * T, (x) => { this.step(x, 0.05 * lv, bus, 'clog', 0.25); if (s % 3 === 2) this.knock(x + 0.05, 330, 0.03 * lv, bus, 0.06); });
    for (let k = 0; k < dur / 1.4; k++) this.cue(t + k * 1.4 + R() * 0.3, (x) => this.struck(x, 3100 + R() * 500, 0.006 * lv, bus, [[1, 1, 0.06]]));
    return dur;
  },

  // ── music ───────────────────────────────────────────────────────────────────
  /** A phrase on the ney (end-blown reed flute) in the makam Rast on G: a breathy slide up into each note, a late vibrato, falling to the karar (G). */
  ney(t, bus, lv) {
    const contour = [4, 5, 6, 5, 4, 3, 2, 1, 0];
    let w = t;
    const n = 6 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const deg = contour[Math.min(contour.length - 1, Math.floor(k * contour.length / n))] + (R() < 0.15 ? 1 : 0), last = k === n - 1, d = last ? 4 + R() * 1.5 : 1.3 + R() * 2;
      this.xiaoNote(w, RAST[clamp(deg, 0, 7)], d, 0.05 * lv, bus, k ? -1 - R() * 2 : -3);
      w += d + 0.2 + R() * 0.6;
    }
    return w - t + 0.5;
  },

  // ── the creatures ───────────────────────────────────────────────────────────
  /** A flock of swifts screaming round the domes: shrill glides, many at once, a few seconds. */
  swifts(t, bus, lv) {
    const n = 5 + Math.floor(R() * 6);
    for (let k = 0; k < n; k++) { const x = t + R() * 3, f = 5200 + R() * 1800; this.cue(x, (y) => this.tone(y, [[0, f], [0.18, f * 1.12], [0.4, f * 0.92]], 0.45 + R() * 0.3, 0.01 * lv, bus, 'sawtooth', ['bandpass', 5800, 3])); }
    return 4.2;
  },
  /** A gull's cry from over the Golden Horn: two or three falling-rising mews. */
  gull(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { const f = 1500 + R() * 400, x = w; this.cue(x, (y) => this.tone(y, [[0, f * 1.25], [0.12, f * 0.95], [0.35, f * 1.1]], 0.42, 0.016 * lv, bus, 'triangle', ['bandpass', 2000, 2.5])); w += 0.55 + R() * 0.25; }
    return w - t + 0.4;
  },
  /** Pigeons: the wings' clatter as a flock rises, then low cooing. */
  pigeons(t, bus, lv) {
    for (let k = 0; k < 9; k++) this.cue(t + k * 0.05 + R() * 0.04, (x) => this.burst(x, 0.05, 1800 + R() * 800, 1.2, 0.03 * lv, bus));
    let w = t + 1.2;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { const f = 430 + R() * 90; this.cue(w, (x) => this.tone(x, [[0, f * 0.95], [0.18, f], [0.4, f * 0.9]], 0.4, 0.012 * lv, bus, 'sine', ['lowpass', 900])); w += 0.55 + R() * 0.3; }
    return w - t + 0.4;
  },
  /** A hooded crow's caw, two or three. */
  crowCaw(t, bus, lv) {
    const n = 2 + Math.floor(R() * 3), f = 520 + R() * 200;
    for (let k = 0; k < n; k++) this.cue(t + k * 0.5, (x) => this.tone(x, [[0, f], [0.14, f * 0.82]], 0.26, 0.02 * lv, bus, 'sawtooth', ['bandpass', 900, 1.4]));
    return n * 0.5 + 0.3;
  },
  /** A stray cat's yowl on a roof at night: a long rising-falling cry with a growl under it. */
  catCry(t, bus, lv) {
    const f = 560 + R() * 150;
    this.tone(t, [[0, f * 0.8], [0.5, f * 1.5], [1.1, f * 0.9]], 1.2, 0.02 * lv, bus, 'sawtooth', ['bandpass', 1100, 2]);
    this.rasp(t + 0.1, 1.0, 380, 1, 0.01 * lv, bus, 40, 0.6);
    return 1.6;
  },
  /** A donkey's bray: the in-drawn "hee" and the out-breathed "haw", three or four pairs, slowing. */
  donkeyBray(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) {
      const x = w; this.cue(x, (y) => { this.tone(y, [[0, 420], [0.35, 760]], 0.4, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1000, 1.5]); this.tone(y + 0.42, [[0, 330], [0.4, 230]], 0.45, 0.03 * lv, bus, 'sawtooth', ['bandpass', 700, 1.4]); });
      w += 0.95 + k * 0.12;
    }
    return w - t + 0.5;
  },

  // ── the scheduler: what is due where the listener stands ────────────────────
  /**
   * Called every tick for a place whose map says `schedule: 'placedOttoman'` (as voices.js `placed()` for Suzhou): the fixed emitters (fountains, shops, kitchens, the coffee
   * house, the medreses), the passing (street trades, porters, the night patrol), the creatures by hour and season, rain's drips, and the small sounds of the room one is in.
   */
  placedOttoman(L, t) {
    const P = this.plc, M = L.map, l = this.lis(), r = R;
    const hour = l.hour ?? (P.birds > 0.05 ? 12 : P.dawn ? 6 : 1), doy = this.seasonDoy(), rain = P.rain || 0;
    P.hourNow = hour;
    const dt = P.lastPlaced ? Math.min(2, t - P.lastPlaced) : 0;
    P.lastPlaced = t;
    P.eaveWet = Math.max(rain, (P.eaveWet || 0) * Math.exp(-dt / 70));
    const day = hour >= 5.5 && hour < 18.5, night = hour >= 19.5 || hour < 4.5, dusk = hour >= 17 && hour < 20;
    const recent = (this.recentEv ||= []);
    while (recent.length && recent[0] < t - 2.5) recent.shift();
    const busy = () => recent.length >= 5, stamp = () => recent.push(t);
    const due = (k, gap, first = 0.15) => { if (!P[k]) P[k] = t + gap * (first + 0.6 * r()); return t > P[k]; };
    const at = (k, a, b, mul = 1) => { P[k] = t + (a + (b - a) * r()) * mul; };
    const g = (v) => GAIN_IST[v] ?? 1;
    const spawn = (pos, r50, lv, voice, opt = {}) => { const bus = this.src(pos, r50, { dur: 30, ...opt }); const d = this[voice](t + 0.05, bus, lv * g(voice), ...(opt.args || [])); bus.emitter.until = t + 0.05 + (typeof d === 'number' ? d : 8) + 1.5; return bus; };
    const around = (a, b) => { const an = r() * Math.PI * 2, d = a + (b - a) * r(); return [l.x + Math.cos(an) * d, l.z + Math.sin(an) * d]; };
    const room = P.room;

    // the fixed emitters
    if (!P.stat) P.stat = M.emitters().map((e, i) => ({ ...e, id: e.id || 'e' + i }));
    for (const e of P.stat) {
      if (!inHours(hour, e.hours) || rain > (e.rainMax ?? (e.dry ? 0.2 : 0.95))) continue;
      if (e.season && seasonIst(e.season, doy) < 0.3) continue;
      if (this.gainAt(e.at, e.r50) < 0.15) continue;
      const k = 'n:' + e.id;
      if (!due(k, e.gap[1])) continue;
      if (busy()) { P[k] = t + 2; continue; }
      const same = room && e.inside && e.inside === room.same;
      at(k, e.gap[0], e.gap[1], same ? 0.6 : 1);
      const bus = spawn(e.at, e.r50, e.lv ?? 1, e.voice, { inside: e.inside });
      if (e.after) P[k] += bus.emitter.until - t;
    }

    // the passing: street trades, porters by day; the night patrol; a donkey with its load
    const track = (k, voice, speed, r50, gap, ok, get, lv = 1, extra = null) => {
      if (!ok || !due('t:' + k, gap[1])) return;
      at('t:' + k, gap[0], gap[1]);
      if (busy()) return;
      const tr = get();
      if (!tr) return;
      const f = this.along(tr.pts, speed);
      const bus = this.src(f, r50, { dur: f.dur + 2 });
      const d = this[voice](t + 0.05, bus, lv * g(voice), f, ...(extra ? [extra()] : []));
      bus.emitter.until = t + 0.05 + Math.max(f.dur, typeof d === 'number' ? d : 0) + 1.5;
      stamp();
    };
    const trade = pickIst(hour, doy);
    track('vendor', 'istVendor', 1.0, 10, [28, 70], trade && trade !== 'porter' && rain < 0.4, () => M.streetTrack(l.x, l.z, r, 80, 30), 1, () => trade);
    track('porter', 'istVendor', 0.8, 9, [45, 110], hour >= 7 && hour < 17 && rain < 0.5, () => M.streetTrack(l.x, l.z, r, 80, 30), 1, () => 'porter');
    track('patrol', 'patrolSteps', 1.1, 12, [50, 110], night && rain < 0.5, () => M.streetTrack(l.x, l.z, r, 90, 34));

    // the creatures of the hour and the season
    if (night && rain < 0.7 && due('p:nextDog', 55)) { at('p:nextDog', 25, 75); if (!busy()) spawn(around(90, 340), 70, 1, 'dogFar'); }
    if (night && rain < 0.5 && due('p:nextCat', 120)) { at('p:nextCat', 70, 190); if (!busy()) spawn(around(8, 40), 12, 1, 'catCry'); }
    const sw = seasonIst('swift', doy) * (hour >= 6 && hour < 20.5 ? (dusk ? 1 : 0.55) : 0) * (rain > 0.3 ? 0.1 : 1);
    if (sw > 0.1 && due('p:nextSwift', 18)) { at('p:nextSwift', 9, 34, 1 / sw); if (!busy()) spawn(M.skyPoint(l.x, l.z, r), 40, 0.8, 'swifts'); }
    if (day && rain < 0.7 && due('p:nextGull', 40)) { at('p:nextGull', 16, 60); if (!busy()) spawn(M.northPoint(l.x, l.z, r), 70, 0.9, 'gull'); }
    if (day && rain < 0.6 && M.courtNear(l.x, l.z) > 0.5 && due('p:nextPigeon', 40)) { at('p:nextPigeon', 22, 70); if (!busy()) spawn(around(6, 24), 14, 1, 'pigeons'); }
    if (day && rain < 0.6 && due('p:nextCrow', 50)) { at('p:nextCrow', 30, 110); if (!busy()) spawn(M.skyPoint(l.x, l.z, r), 30, 1, 'crowCaw'); }
    // the evening: a ney from the coffee house's quarter after the last prayer's call (the call itself is the engine's: soundscape.js `adhan`)
    if (rain > 0.08 && P.eaveWet > 0.08 && (!P.indoors || rain > 0.1) && due('p:nextDrip', 0.5)) { at('p:nextDrip', 0.12, 0.8, 1 / (P.eaveWet + 0.15)); spawn(around(1.5, 6), 3, 0.7 + P.eaveWet * 0.5, 'eaveDrip'); }

    // inside: the small sounds of the room (by its use)
    if (P.indoors && room) {
      const R0 = room.upper ? M.UPPER : M.ROOMS[room.use] || M.ROOMS.house;
      for (const [voice, gap] of R0.work || []) {
        const k = 'rw:' + voice;
        if (!due(k, gap)) continue;
        at(k, gap * 0.6, gap * 1.4);
        spawn(around(1.5, 4), 4, 1, voice, { inside: room.same });
      }
    }
  },
};
