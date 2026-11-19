// Voices of Athens about 410 BC (docs/settlements/athens.md §20), added to the placed voices of voices.js by one line there
// (`Object.assign(VOICES, ATHENS_VOICES)`): the hawkers' wordless calls, the herald, the fish-market's bell, the aulos and the
// kithara in the Dorian mode, the cobbler's taps, the mason's mallet, the hand-mill, a jar filled at the spout, hens, the little
// owl, the symposium. Each is a method `name(t, bus, lv)` of Music (as voices.js's) returning how long it lasts; everything is
// synthesised, nothing sampled [inferred throughout: no recording of Athens exists; the instruments and calls after the dossier §20].

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];

/** The ancient Dorian species on E: semitone steps from the tonic (E F G A B C D), as music.js. */
const DORIAN = [0, 1, 3, 5, 7, 8, 10];
const dorian = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 7) * 12 + DORIAN[((deg % 7) + 7) % 7]) / 12);

/** The hawkers' cries (wordless): [semitones above the voice's base, seconds, vowel]; each has its own contour. */
export const CRIES = {
  greens: { cry: [[0, 0.3, 'o'], [4, 0.3, 'a'], [7, 0.9, 'e']], fem: false },
  fish: { cry: [[9, 0.25, 'i'], [5, 0.25, 'a'], [0, 1.0, 'o']], fem: false },
  olives: { cry: [[0, 0.4, 'e'], [3, 0.4, 'e'], [7, 0.4, 'a'], [3, 1.0, 'a']], fem: null },
  wreaths: { cry: [[4, 0.25, 'i'], [7, 0.25, 'i'], [11, 0.6, 'a'], [7, 0.8, 'a']], fem: true },
  cheese: { cry: [[7, 0.3, 'o'], [4, 0.3, 'o'], [0, 1.2, 'u']], fem: false },
};

const hawkOf = (kind) => function hawk(t, bus, lv) {
  const C = CRIES[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const fem = C.fem === null ? R() < 0.5 : C.fem, f0 = (fem ? 290 : 168) * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C.cry, 0.05 * lv, bus, { fem, cutoff: 4200 }));
    w += C.cry.reduce((s, c) => s + c[1], 0) + 1.6 + R() * 2;
  }
  return w - t;
};

export const ATHENS_VOICES = {
  athHawkGreens: hawkOf('greens'), athHawkFish: hawkOf('fish'), athHawkOlives: hawkOf('olives'), athHawkWreaths: hawkOf('wreaths'), athHawkCheese: hawkOf('cheese'),

  /** The herald's cry from the Council's house: a high held call that falls (the proclamation), once or twice, with a pause between. */
  athHerald(t, bus, lv) {
    const f0 = 150 * (0.95 + R() * 0.1);
    this.cry(t, f0, [[7, 0.5, 'a'], [7, 1.0, 'o'], [4, 0.4, 'e'], [0, 1.5, 'a']], 0.07 * lv, bus, { cutoff: 3600 });
    if (R() < 0.6) this.cry(t + 5, f0 * 1.03, [[7, 0.4, 'e'], [7, 0.9, 'a'], [2, 0.35, 'o'], [0, 1.2, 'o']], 0.06 * lv, bus, { cutoff: 3400 });
    return 9;
  },

  /** The fish-market's hand bell, shaken: a run of bright rings, uneven, quickening and then dying away. */
  athFishBell(t, bus, lv) {
    const f = 1150 * (0.95 + R() * 0.1), n = 14 + Math.floor(R() * 8);
    let w = t, gap = 0.2;
    for (let k = 0; k < n; k++) {
      const a = 1 - k / (n * 1.3);
      this.cue(w, (x) => this.struck(x, f * (1 + 0.01 * (k % 3)), 0.035 * lv * a, bus, [[1, 1, 0.45], [2.4, 0.55, 0.3], [4.1, 0.3, 0.18], [6.2, 0.15, 0.1]]));
      w += gap * (0.7 + R() * 0.6); gap = Math.max(0.09, gap * 0.95);
    }
    return w - t + 0.6;
  },

  /** One note of the aulos: a double reed, rich and nasal (a saw through two formants, a second pipe a hair off), a breath at the start. */
  athAuloNote(when, f, dur, level, dest) {
    const ctx = this.ctx, g = ctx.createGain(), rel = Math.min(0.12, dur * 0.4);
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + 0.04); g.gain.setValueAtTime(level * 0.92, when + dur - rel); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    for (const [det, a] of [[1, 1], [1.007, 0.7]]) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f * det; og.gain.value = a;
      o.connect(og);
      for (const [fc, q, fg] of [[1150, 2.2, 1], [2500, 2.8, 0.45]]) { const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = q; bg.gain.value = fg; og.connect(bp); bp.connect(bg); bg.connect(g); }
      o.start(when); o.stop(when + dur + 0.05);
    }
    g.connect(dest);
    this.burst(when, 0.07, 2600, 1.5, level * 0.5, dest);
    return dur;
  },
  /** A phrase on the aulos in the Dorian species: quick turns about the middle, longer notes at the cadence, the last on the tonic. */
  athAulos(t, bus, lv) {
    const tonic = 329.63 * (R() < 0.3 ? 0.5 : 1), n = 10 + Math.floor(R() * 8);
    let w = t, deg = 7 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const last = k === n - 1, d = last ? 1.6 + R() : (R() < 0.3 ? 0.55 : 0.22) + R() * 0.2;
      this.cue(w, (x) => this.athAuloNote(x, dorian(last ? 7 : deg, tonic), d, 0.035 * lv, bus));
      w += d + 0.03;
      deg = clamp(deg + pick([-2, -1, -1, 0, 1, 1, 2]), 4, 13);
    }
    return w - t + 0.4;
  },

  /** One plucked string of the kithara: a bright attack and a long ring of the first harmonics. */
  athKitharaNote(when, f, level, dest) {
    const ctx = this.ctx;
    for (const [r, a, d, ty] of [[1, 1, 1.6, 'triangle'], [2, 0.45, 0.9, 'sine'], [3, 0.22, 0.5, 'sine'], [4.02, 0.1, 0.25, 'sine']]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ty; o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
    this.burst(when, 0.025, 3200, 1.2, level * 0.5, dest);
    return 1.6;
  },
  /** A phrase on the kithara: a strummed chord of the species (tonic, fifth, octave), then a run up and down and the chord again. */
  athKithara(t, bus, lv) {
    const tonic = 164.81;
    let w = t;
    const chord = (at) => [0, 4, 7, 11].forEach((d, i) => this.cue(at + i * 0.045, (x) => this.athKitharaNote(x, dorian(d, tonic), 0.04 * lv, bus)));
    chord(w); w += 1.4 + R() * 0.8;
    let deg = 7;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => this.athKitharaNote(x, dorian(deg, tonic), 0.045 * lv, bus));
      w += R() < 0.25 ? 0.5 : 0.24 + R() * 0.12;
      deg = clamp(deg + pick([-2, -1, -1, 1, 1, 2]), 3, 14);
    }
    w += 0.6; chord(w);
    return w - t + 2;
  },

  /** The cobbler's taps: the small hammer on the last, the awl drawn through the leather. */
  athCobbler(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 900 + R() * 120, 0.05 * lv, bus, 0.05); this.burst(x, 0.02, 3000, 2, 0.02 * lv, bus); });
      w += R() < 0.25 ? 0.7 : 0.26 + R() * 0.1;
      if (R() < 0.12) { this.cue(w, (x) => this.rasp(x, 0.4, 1800, 1.2, 0.02 * lv, bus, 30, 0.5)); w += 0.6; }
    }
    return w - t + 0.3;
  },

  /** The mason's mallet on the point chisel: bursts of quick blows, a sharp tink on the stone and the dull knock of the mallet, then a pause. */
  athMallet(t, bus, lv) {
    let w = t;
    for (let b = 0, nb = 2 + Math.floor(R() * 3); b < nb; b++) {
      const f = 2300 + R() * 500;
      for (let k = 0, n = 5 + Math.floor(R() * 7); k < n; k++) {
        this.cue(w, (x) => { this.knock(x, 520, 0.045 * lv, bus, 0.04); this.struck(x + 0.005, f * (0.97 + R() * 0.06), 0.03 * lv, bus, [[1, 1, 0.07], [2.6, 0.4, 0.05]]); });
        w += 0.17 + R() * 0.05;
      }
      w += 1.2 + R() * 1.4;
    }
    return w - t;
  },

  /** The women at the hand-mill (the saddle quern): the stone dragged to and fro over the grain, a long grating rasp and a thud at the end of each stroke. */
  athQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.rasp(x, 0.7, 380, 0.7, 0.035 * lv, bus, 6, 0.5); });
      this.cue(w + 0.78, (x) => this.knock(x, 240, 0.02 * lv, bus, 0.05));
      w += 0.95 + R() * 0.15;
    }
    return w - t + 0.3;
  },

  /** A jar (hydria) set under a spout and filled: the clay set down, the stream into it with the bubbles climbing, the jar lifted away. */
  athHydria(t, bus, lv) {
    const n = 14 + Math.floor(R() * 8);
    this.knock(t, 260, 0.05 * lv, bus, 0.1);
    this.burst(t + 0.25, n * 0.2, 1500, 1.2, 0.035 * lv, bus, 0.1);
    for (let k = 0; k < n; k++) this.cue(t + 0.3 + k * 0.2 + R() * 0.06, (x) => this.tone(x, [[0, 220 + k * 22], [0.05, 470 + k * 30]], 0.06, 0.018 * lv, bus, 'sine'));
    this.cue(t + 0.6 + n * 0.2, (x) => { this.knock(x, 230, 0.04 * lv, bus, 0.08); this.drip(x + 0.15, lv * 0.8, bus); });
    return n * 0.2 + 1.2;
  },

  /** Hens in a court: a few soft clucks, now and then a rising cackle. */
  athHens(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) {
      const f = 420 + R() * 120;
      this.cue(w, (x) => { this.tone(x, [[0, f], [0.05, f * 1.25], [0.12, f * 0.85]], 0.14, 0.02 * lv, bus, 'sawtooth', ['bandpass', 900, 1.5]); });
      w += 0.25 + R() * 0.5;
    }
    if (R() < 0.25) for (let k = 0; k < 4; k++) this.cue(w + k * 0.13, (x) => this.tone(x, [[0, 520 + k * 40], [0.07, 640 + k * 50]], 0.09, 0.022 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.5]));
    return w - t + 1;
  },

  /** The little owl (Athene noctua), Athena's bird: a sharp, plaintive "kiew", repeated, a second answering from further off. */
  athOwl(t, bus, lv) {
    const n = 3 + Math.floor(R() * 4);
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.tone(x, [[0, 640], [0.09, 940], [0.3, 590]], 0.3, 0.03 * lv, bus, 'sine', ['bandpass', 800, 1.2])); w += 2 + R() * 1.5; }
    if (R() < 0.5) this.cue(t + 1.2, (x) => this.tone(x, [[0, 600], [0.1, 850], [0.3, 560]], 0.28, 0.015 * lv, bus, 'sine', ['bandpass', 760, 1.2]));
    return w - t + 0.5;
  },

  /** After dinner in the andron: the murmur of the men at the couches, laughter, the aulos-girl's tune now and then. */
  athSymposium(t, bus, lv) {
    const d = this.teaTalk(t, bus, lv * 0.9);
    let w = t + 0.5;
    if (R() < 0.6) { this.cue(w, (x) => this.athAulos(x, bus, lv * 0.8)); w += 6; }
    if (R() < 0.5) for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) this.cue(t + 1 + k * 0.17 + R() * 0.05, (x) => this.tone(x, [[0, 280 + R() * 60], [0.08, 230]], 0.1, 0.02 * lv, bus, 'sawtooth', ['bandpass', 900, 1.2]));
    return Math.max(d, w - t);
  },
};

/** How loud each is made relative to its own scale: set so that each renders at about 4.5e-3 RMS at the source (tools/sound-render.mjs, as the hammer and the loom of voices.js do). */
export const ATHENS_GAIN = {
  athHawkGreens: 2.5, athHawkFish: 2.5, athHawkOlives: 1.8, athHawkWreaths: 2, athHawkCheese: 2, athHerald: 1.1, athFishBell: 0.95, athAulos: 0.8, athKithara: 0.4, athCobbler: 2.4, athMallet: 1.05,
  athQuern: 1.6, athHydria: 1.3, athHens: 2.4, athOwl: 0.8, athSymposium: 1.8,
};
