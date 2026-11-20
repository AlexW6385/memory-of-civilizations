// Voices of Thebes about 1250 BC (docs/settlements/thebes.md §15c), added to the placed voices of voices.js through addVoices: the sistrum and the clapping of the
// morning rite, the priests' chant in the hall, the arched harp and the double pipe of a courtyard, the adze, the quern, the shaduf, the stevedores' and the boatmen's
// calls and a boat paddled, the geese of Amun, the black kite, the laughing dove, the donkey, the jackal at night. Each is a method `name(t, bus, lv)` of Music
// returning how long it lasts; everything is synthesised, nothing sampled [inferred throughout: no recording of Waset exists; the instruments are those the UCL
// Digital Egypt list gives for the Old and New Kingdoms, the animals and the crafts the usual picture of an Egyptian town].

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** The harp's and the pipe's mode: semitones from the tonic (D E-flat… as a five-note scale with the fifth and its upper neighbour: 0 2 3 7 8), over two octaves. */
const MODE = [0, 2, 3, 7, 8];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 5) * 12 + MODE[((deg % 5) + 5) % 5]) / 12);

/** The sellers' cries at the market (wordless): [semitones above the voice's base, seconds, vowel]; each its own contour. */
export const THB_CRIES = {
  bread: [[0, 0.3, 'a'], [4, 0.4, 'o'], [7, 0.9, 'a']],
  onions: [[0, 0.3, 'o'], [7, 0.3, 'e'], [4, 1.0, 'a']],
  fish: [[7, 0.3, 'e'], [2, 0.3, 'a'], [-2, 1.1, 'o']],
  beer: [[2, 0.35, 'u'], [5, 0.35, 'o'], [9, 0.5, 'a'], [5, 0.9, 'o']],
};

export const THEBES_VOICES = {
  /** A seller's cry: one of the market's calls (THB_CRIES), a man's or a woman's, once or twice. */
  thbHawk(t, bus, lv) {
    const names = Object.keys(THB_CRIES), C = THB_CRIES[pick(names)], n = R() < 0.4 ? 2 : 1, fem = R() < 0.45;
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.cry(x, (fem ? 280 : 160) * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem, cutoff: 4000 }));
      w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2;
    }
    return w - t;
  },

  /** The sistrum: a frame of rods hung with loose discs, shaken in a steady beat — a bright, inharmonic shimmer in short rushes, a few seconds. */
  thbSistrum(t, bus, lv) {
    const dur = 2.2 + R() * 2.4, beat = 0.19 + R() * 0.05, f = 3300 + R() * 700;
    for (let k = 0; k * beat < dur; k++) {
      const a = 0.7 + 0.3 * ((k % 2) ? 1 : 0.6);
      this.cue(t + k * beat, (x) => { this.burst(x, 0.16, f, 2.2, 0.03 * lv * a, bus); this.struck(x, f * 0.9, 0.012 * lv * a, bus, [[1, 1, 0.1], [1.47, 0.6, 0.08], [2.3, 0.4, 0.06]]); });
    }
    return dur;
  },

  /** Hands clapping a rhythm with a sung call over it (the temple's staff at the morning rite; the singers' clapping): a pattern of claps, a wordless male call. */
  thbClap(t, bus, lv) {
    const pattern = pick([[0, 0.5, 1, 1.5, 2.25], [0, 0.66, 1, 1.66, 2, 2.66], [0, 0.5, 1.5, 2]]), reps = 3 + Math.floor(R() * 3), gap = 0.42 + R() * 0.1, len = pattern[pattern.length - 1] + 0.7;
    for (let r = 0; r < reps; r++) for (const p of pattern) this.cue(t + (r * len + p) * gap, (x) => { this.burst(x, 0.05, 1500 + R() * 400, 1.2, 0.05 * lv, bus); this.burst(x, 0.02, 3200, 2, 0.025 * lv, bus); });
    this.cue(t + 0.3, (x) => this.cry(x, 135 * (0.95 + R() * 0.1), [[0, 0.5, 'a'], [3, 0.7, 'o'], [7, 0.5, 'a'], [3, 0.9, 'e'], [0, 1.2, 'o']], 0.05 * lv, bus, { cutoff: 3200 }));
    return reps * len * gap + 1;
  },

  /** The priests' chant in the hall: low male voices holding a drone with a slow phrase over it, long notes, a fifth and a third. */
  thbChant(t, bus, lv) {
    const f0 = 98 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 2.4, 'o'], [0, 1.8, 'a']], 0.05 * lv, bus, { cutoff: 2200 });
    this.cry(t + 0.2, f0 * 1.5, [[0, 2.0, 'u'], [-2, 2.2, 'o']], 0.03 * lv, bus, { cutoff: 2000 });
    this.cry(t + 4.4, f0 * 2, [[0, 1.0, 'o'], [3, 0.9, 'a'], [2, 1.0, 'o'], [0, 2.2, 'a']], 0.05 * lv, bus, { cutoff: 2600 });
    this.cry(t + 4.6, f0, [[0, 5.2, 'o']], 0.035 * lv, bus, { cutoff: 1800 });
    return 10.5;
  },

  /** One string of the arched harp: a soft pluck and a ring of the first harmonics, dying in a second or two. */
  thbHarpNote(when, f, level, dest) {
    const ctx = this.ctx;
    for (const [r, a, d, ty] of [[1, 1, 1.3, 'triangle'], [2, 0.3, 0.7, 'sine'], [3.01, 0.12, 0.35, 'sine']]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ty; o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
    this.burst(when, 0.02, 2600, 1.2, level * 0.35, dest);
    return 1.3;
  },
  /** A phrase on the harp in the five-note mode: a run up and down with turns, the tonic last; a few notes of a second hand an octave under. */
  thbHarp(t, bus, lv) {
    const tonic = 293.66;
    let w = t, deg = 4 + Math.floor(R() * 3);
    for (let k = 0, n = 10 + Math.floor(R() * 9); k < n; k++) {
      const last = k === n - 1;
      this.cue(w, (x) => this.thbHarpNote(x, note(last ? 0 : deg, tonic), 0.04 * lv, bus));
      if (k % 4 === 0) this.cue(w, (x) => this.thbHarpNote(x, note(last ? -5 : deg - 5, tonic), 0.025 * lv, bus));
      w += last ? 0.8 : R() < 0.2 ? 0.6 : 0.3 + R() * 0.12;
      deg = clamp(deg + pick([-2, -1, -1, 1, 1, 2]), 0, 9);
    }
    return w - t + 1.4;
  },

  /** One note of the double pipe (a pair of reed pipes played together: a reedy square tone through two formants, the second pipe a drone a fifth under). */
  thbPipeNote(when, f, dur, level, dest) {
    const ctx = this.ctx, g = ctx.createGain(), rel = Math.min(0.1, dur * 0.4);
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + 0.03); g.gain.setValueAtTime(level * 0.9, when + dur - rel); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    for (const [fr, a] of [[1, 1], [0.667, 0.5]]) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'square'; o.frequency.value = f * fr; og.gain.value = a;
      o.connect(og);
      for (const [fc, q, fg] of [[1000, 2, 1], [2300, 2.5, 0.35]]) { const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = q; bg.gain.value = fg; og.connect(bp); bp.connect(bg); bg.connect(g); }
      o.start(when); o.stop(when + dur + 0.05);
    }
    g.connect(dest); this.burst(when, 0.06, 2200, 1.4, level * 0.4, dest);
    return dur;
  },
  thbPipes(t, bus, lv) {
    const tonic = 440 * (R() < 0.3 ? 0.5 : 1);
    let w = t, deg = 5 + Math.floor(R() * 3);
    for (let k = 0, n = 9 + Math.floor(R() * 8); k < n; k++) {
      const last = k === n - 1, d = last ? 1.5 + R() : (R() < 0.3 ? 0.6 : 0.25) + R() * 0.2;
      this.cue(w, (x) => this.thbPipeNote(x, note(last ? 0 : deg, tonic), d, 0.03 * lv, bus));
      w += d + 0.03; deg = clamp(deg + pick([-2, -1, -1, 0, 1, 1, 2]), 0, 9);
    }
    return w - t + 0.4;
  },

  /** The carpenter's adze: a run of chops into the timber — a dull knock, a splinter's tick — then a pause and the plane-like scrape of smoothing. */
  thbAdze(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 380 + R() * 60, 0.07 * lv, bus, 0.06); this.burst(x, 0.03, 2400, 1.5, 0.03 * lv, bus); });
      w += 0.36 + R() * 0.14;
    }
    this.cue(w + 0.3, (x) => this.rasp(x, 0.7, 1500, 0.9, 0.025 * lv, bus, 14, 0.7));
    return w - t + 1.2;
  },

  /** The saddle quern in the baker's: the stone dragged to and fro over the grain — a long grating rasp and a thud at each stroke's end. */
  thbQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 9 + Math.floor(R() * 9); k < n; k++) {
      this.cue(w, (x) => this.rasp(x, 0.7, 340, 0.7, 0.035 * lv, bus, 6, 0.5));
      this.cue(w + 0.78, (x) => this.knock(x, 220, 0.02 * lv, bus, 0.05));
      w += 0.95 + R() * 0.15;
    }
    return w - t + 0.3;
  },

  /** The weaver's upright loom: the shed rod lifted, the weft passed (a soft swish), the beater's dull knock; a pick every second or so. */
  thbWeave(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, 200], [0.06, 130]], 0.07, 0.015 * lv, bus); this.burst(x + 0.05, 0.12, 2000, 1.6, 0.03 * lv, bus, 0.04); });
      this.cue(w + 0.38, (x) => { this.knock(x, 460 + R() * 40, 0.07 * lv, bus, 0.06); });
      w += 0.95 + R() * 0.25;
    }
    return w - t + 0.3;
  },

  /** The tanner's scraper drawn over a stretched hide: a wet rasp, the stroke, a pause, again. */
  thbScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => this.rasp(x, 0.6, 1100, 0.8, 0.028 * lv, bus, 18, 0.7)); w += 0.8 + R() * 0.5; }
    return w - t + 0.3;
  },

  /** The shaduf: the pole's creak as the bucket is let down and swung up, the water tipped into the channel, the drops. */
  thbShaduf(t, bus, lv) {
    this.creak(t, lv * 0.8, bus, false);
    this.cue(t + 1.0, (x) => { this.burst(x, 0.18, 800, 0.8, 0.05 * lv, bus); this.tone(x, [[0, 240], [0.1, 90]], 0.14, 0.03 * lv, bus); });
    this.cue(t + 1.8, (x) => this.creak(x, lv * 0.9, bus, true));
    this.cue(t + 3.0, (x) => this.pour(x, bus, lv * 0.8));
    for (let k = 0; k < 4; k++) this.cue(t + 3.6 + k * 0.35 + R() * 0.15, (x) => this.drip(x, lv * 0.7, bus));
    return 5;
  },

  /** The stevedores at the quay: a hauled sack's thump and a drawn-out call and its answer — "hey-ho" in two voices (wordless). */
  thbStevedores(t, bus, lv) {
    const f0 = 125 * (0.94 + R() * 0.12);
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => this.cry(x, f0, [[0, 0.3, 'e'], [5, 0.7, 'o']], 0.05 * lv, bus, { cutoff: 3600 }));
      this.cue(w + 1.1, (x) => this.cry(x, f0 * 1.12, [[2, 0.3, 'e'], [4, 0.6, 'a']], 0.04 * lv, bus, { cutoff: 3400 }));
      this.cue(w + 1.9, (x) => { this.knock(x, 150, 0.06 * lv, bus, 0.12); this.burst(x, 0.1, 500, 1, 0.03 * lv, bus); });
      w += 2.6 + R() * 1.4;
    }
    return w - t;
  },

  /** A boat paddled and poled along the river (`f` is the track): a dip and a drip at every stroke, the hull's wash, the boatmen's call. */
  thbBoat(t, bus, lv, f) {
    const dur = f.dur, T = 1.5 + R() * 0.5, n = Math.floor(dur / T);
    for (let k = 0; k < n; k++) this.cue(t + k * T, (x) => { this.burst(x, 0.5, 520, 0.8, 0.03 * lv, bus, 0.12); this.knock(x + 0.28, 260, 0.03 * lv, bus, 0.05); if (R() < 0.6) this.drip(x + 0.6, lv * 0.7, bus); });
    this.rasp(t, dur, 480, 0.6, 0.012 * lv, bus, 0.7, 0.8);
    if (R() < 0.6) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 132 * (0.92 + R() * 0.16), [[0, 0.35, 'e'], [4, 0.9, 'o'], [2, 0.6, 'a'], [0, 1.0, 'u']], 0.045 * lv, bus, { cutoff: 3800 }));
    return dur;
  },

  /** The geese of Amun on the lake: a harsh honk, falling, a few of them answering with cackles. */
  thbGeese(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 6); k < n; k++) {
      const f = 520 + R() * 160;
      this.cue(w, (x) => this.tone(x, [[0, f], [0.08, f * 1.25], [0.28, f * 0.8]], 0.32, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1000, 1.4]));
      w += 0.22 + R() * 0.4;
    }
    return w - t + 0.5;
  },

  /** The black kite: a thin, quavering whistle, falling, repeated, high over the town. */
  thbKite(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 1 + Math.floor(R() * 3); k < n; k++) {
      const f = 2300 + R() * 300;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * 0.85], [0.12, f], [0.45, f * 0.82]], 0.55, 0.018 * lv, bus, 'sine');
        for (let j = 0; j < 6; j++) this.tone(x + 0.5 + j * 0.06, [[0, f * (0.85 - j * 0.02)], [0.04, f * (0.78 - j * 0.02)]], 0.05, 0.012 * lv, bus, 'sine');
      });
      w += 2.2 + R() * 1.5;
    }
    return w - t + 1;
  },

  /** The laughing dove on a roof: a soft run of coos, "cu-cu-cu-croo", low and rounded. */
  thbDove(t, bus, lv) {
    let w = t;
    for (let rep = 0, nr = 1 + Math.floor(R() * 2); rep < nr; rep++) {
      const f = 520 + R() * 60;
      for (const [d, a] of [[0, 1], [0.24, 0.9], [0.48, 0.9], [0.78, 1]]) this.cue(w + d, (x) => this.tone(x, [[0, f * 0.9], [0.05, f], [0.17, f * 0.88]], 0.2, 0.02 * lv * a, bus, 'sine', ['lowpass', 1100, 0.7]));
      w += 1.7 + R() * 0.8;
    }
    return w - t + 0.4;
  },

  /** A donkey's bray: the in-draw "hee" rising and the out-breath "haw" falling, in pulses that slow, ending in a sigh. */
  thbDonkey(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const up = k % 2 === 0, f = up ? 500 : 780, d = 0.55 + k * 0.08;
      this.cue(w, (x) => this.tone(x, up ? [[0, f], [d * 0.8, f * 2.1]] : [[0, f], [d * 0.9, f * 0.5]], d, 0.035 * lv, bus, 'sawtooth', ['bandpass', up ? 1500 : 1100, 1.2]));
      this.cue(w, (x) => this.rasp(x, d, 900, 0.8, 0.015 * lv, bus, 40, 0.6));
      w += d + 0.05;
    }
    return w - t + 0.8;
  },

  /** A jackal at the desert's edge at night: a long wavering howl climbing and falling, then a run of yips. */
  thbJackal(t, bus, lv) {
    const f = 560 + R() * 80, d = 2.4 + R() * 0.8;
    this.tone(t, [[0, f], [d * 0.4, f * 1.6], [d * 0.7, f * 1.45], [d, f * 1.2]], d, 0.035 * lv, bus, 'sawtooth', ['bandpass', 1300, 1.5]);
    for (let k = 0; k < 7; k++) this.cue(t + d + 0.35 + k * 0.17, (x) => this.tone(x, [[0, f * 1.5], [0.05, f * 1.1]], 0.08, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1500, 1.5]));
    return d + 2;
  },
};

/** How loud each is made relative to its own scale (tools/sound-render.mjs: about 4.5e-3 RMS at the source, as the older voices are). */
export const THEBES_GAIN = {
  thbSistrum: 1.4, thbClap: 1.2, thbChant: 1.0, thbHarp: 0.5, thbPipes: 0.8, thbAdze: 1.3, thbQuern: 1.6, thbWeave: 1.8, thbScrape: 2, thbShaduf: 1.2, thbStevedores: 1.2, thbBoat: 1,
  thbHawk: 2.2, thbGeese: 1.4, thbKite: 1.8, thbDove: 1.8, thbDonkey: 1.2, thbJackal: 1.1,
};
