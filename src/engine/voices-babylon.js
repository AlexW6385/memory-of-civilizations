// Voices of Babylon about 570 BC (docs/settlements/babylon.md §20), added to the placed voices of voices.js through addVoices. Each is a method `name(t, bus, lv)` of Music
// returning how long it lasts; everything is synthesised, nothing sampled [inferred throughout: no recording of Babylon exists, and the sources name the instruments and the
// crafts, not their sound]. What they stand for: the lamenters' and singers' chant in Esagila (lamenters and singers "who performed prayers and hymns" are among the
// ritual specialists: ancient-history-sites.com "Babylonian Worship, Household Religion and Festivals"), the great kettledrum (lilissu) of the temple's rites, the lyre of a
// rich house's evening, the sellers' cries, the quern, the warp-weighted loom, the carpenter's adze, the pupils reciting in the school, the shaduf on the river's bank, the
// porters' calls on the quay and the round boats poled on the river (Herodotus 1.194), the geese of the yards, the doves of the roofs, the donkeys and camels of the
// caravans, the sheep at the altar, the jackals beyond the walls and the owl in the town at night, a caravan passing.

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** The lyre's and the chant's scale: semitones from the tonic, the seven-note scale of music.js (0 2 3 5 7 8 10), over two octaves. */
const MODE = [0, 2, 3, 5, 7, 8, 10];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 7) * 12 + MODE[((deg % 7) + 7) % 7]) / 12);

/** The sellers' cries (wordless): [semitones above the voice's base, seconds, vowel]; each its own contour. */
export const BAB_CRIES = {
  dates: [[0, 0.3, 'a'], [3, 0.35, 'o'], [7, 0.9, 'a']],
  fish: [[7, 0.3, 'e'], [3, 0.3, 'a'], [-2, 1.1, 'o']],
  bread: [[2, 0.3, 'o'], [5, 0.3, 'a'], [9, 0.4, 'o'], [5, 0.9, 'a']],
  pots: [[0, 0.25, 'u'], [5, 0.25, 'o'], [3, 1.0, 'a']],
};

export const BABYLON_VOICES = {
  /** A seller's cry by the Way's walls or in the market. */
  babHawk(t, bus, lv) {
    const C = BAB_CRIES[pick(Object.keys(BAB_CRIES))], n = R() < 0.4 ? 2 : 1, fem = R() < 0.4;
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.cry(x, (fem ? 270 : 150) * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem, cutoff: 3800 }));
      w += C.reduce((s, c) => s + c[1], 0) + 1.4 + R() * 2;
    }
    return w - t;
  },

  /** The lamenters' and singers' chant in the temple: low male voices on a long drone, a slow phrase a fourth and a minor third above it, ending on the drone. */
  babChant(t, bus, lv) {
    const f0 = 92 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 2.8, 'o'], [0, 2.0, 'a']], 0.05 * lv, bus, { cutoff: 2000 });
    this.cry(t + 0.3, f0 * 1.5, [[0, 2.4, 'u'], [-2, 2.4, 'o']], 0.03 * lv, bus, { cutoff: 1900 });
    this.cry(t + 5.2, f0 * 2, [[0, 1.2, 'a'], [-2, 1.0, 'o'], [-4, 1.2, 'a'], [-2, 1.0, 'o'], [-4, 2.4, 'u']], 0.05 * lv, bus, { cutoff: 2400 });
    this.cry(t + 5.4, f0, [[0, 6.0, 'o']], 0.035 * lv, bus, { cutoff: 1700 });
    return 12;
  },

  /** The great kettledrum of the rites (the lilissu: a copper bowl under a bull's hide): slow deep strokes, a roll swelling and a last stroke. */
  babLilissu(t, bus, lv) {
    let w = t;
    const f = 96 + R() * 8;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, f * 1.5], [0.18, f]], 0.7, 0.07 * lv, bus, 'sine', ['lowpass', 400]); this.knock(x, 110, 0.05 * lv, bus, 0.12); this.burst(x, 0.08, 900, 1.2, 0.012 * lv, bus); });
      w += 1.3 + R() * 0.5;
    }
    for (let k = 0; k < 9; k++) this.cue(w + k * (0.12 - k * 0.006), (x) => this.knock(x, 100 + k * 3, (0.02 + k * 0.004) * lv, bus, 0.1));
    this.cue(w + 1.1, (x) => this.tone(x, [[0, f * 1.6], [0.25, f * 0.9]], 1.4, 0.08 * lv, bus, 'sine', ['lowpass', 380]));
    return w - t + 2.6;
  },

  /** One string of the lyre: a bright pluck, the first harmonics ringing a second or two. */
  babLyreNote(when, f, level, dest) {
    const ctx = this.ctx;
    for (const [r, a, d, ty] of [[1, 1, 1.5, 'triangle'], [2, 0.35, 0.8, 'sine'], [3.02, 0.14, 0.4, 'sine'], [4.05, 0.06, 0.25, 'sine']]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ty; o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
    this.burst(when, 0.015, 3000, 1.2, level * 0.3, dest);
    return 1.5;
  },
  /** A phrase on the lyre in the seven-note scale: a run up with turns, a fall, a held note, the tonic last; the lower strings under it in fifths. */
  babLyre(t, bus, lv) {
    const tonic = 146.83;
    let w = t, deg = 3 + Math.floor(R() * 3);
    for (let k = 0, n = 11 + Math.floor(R() * 8); k < n; k++) {
      const last = k === n - 1;
      this.cue(w, (x) => this.babLyreNote(x, note(last ? 0 : deg, tonic), 0.04 * lv, bus));
      if (k % 3 === 0) this.cue(w, (x) => this.babLyreNote(x, note(last ? -3 : deg - 4, tonic), 0.022 * lv, bus));
      w += last ? 0.9 : R() < 0.18 ? 0.7 : 0.28 + R() * 0.12;
      deg = clamp(deg + pick([-2, -1, -1, 1, 1, 2]), 0, 11);
    }
    return w - t + 1.5;
  },

  /** The saddle quern: the stone dragged to and fro over the grain, a thud at each stroke's end. */
  babQuern(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 9 + Math.floor(R() * 9); k < n; k++) {
      this.cue(w, (x) => this.rasp(x, 0.7, 330, 0.7, 0.035 * lv, bus, 6, 0.5));
      this.cue(w + 0.76, (x) => this.knock(x, 210, 0.02 * lv, bus, 0.05));
      w += 0.95 + R() * 0.15;
    }
    return w - t + 0.3;
  },

  /** The warp-weighted loom: the clay weights clicking against each other as the shed is changed, the weft beaten up with a dull knock; a pick every second or so. */
  babLoom(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 10); k < n; k++) {
      this.cue(w, (x) => { for (let j = 0; j < 4; j++) this.knock(x + j * 0.035, 1300 + R() * 500, 0.018 * lv, bus, 0.025); this.burst(x + 0.1, 0.12, 2000, 1.6, 0.025 * lv, bus, 0.04); });
      this.cue(w + 0.4, (x) => this.knock(x, 440 + R() * 40, 0.065 * lv, bus, 0.06));
      w += 1.0 + R() * 0.3;
    }
    return w - t + 0.3;
  },

  /** The carpenter's adze: a run of chops, a splinter's tick, then the scrape of smoothing. */
  babAdze(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 370 + R() * 60, 0.07 * lv, bus, 0.06); this.burst(x, 0.03, 2300, 1.5, 0.03 * lv, bus); });
      w += 0.38 + R() * 0.14;
    }
    this.cue(w + 0.3, (x) => this.rasp(x, 0.7, 1500, 0.9, 0.025 * lv, bus, 14, 0.7));
    return w - t + 1.2;
  },

  /** Pupils reciting in the school: a boy's voice calling the line, the others answering together on one pitch, over and over, wordless. */
  babRecite(t, bus, lv) {
    let w = t;
    const f = 230 * (0.95 + R() * 0.1);
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => this.cry(x, f, [[0, 0.3, 'a'], [2, 0.3, 'e'], [3, 0.4, 'o'], [0, 0.5, 'a']], 0.04 * lv, bus, { cutoff: 3500 }));
      for (let j = 0; j < 3; j++) this.cue(w + 1.8 + j * 0.03, (x) => this.cry(x, f * (0.96 + 0.04 * j), [[0, 0.3, 'a'], [2, 0.3, 'e'], [3, 0.4, 'o'], [0, 0.5, 'a']], 0.022 * lv, bus, { cutoff: 3300 }));
      w += 4.2 + R() * 1.5;
    }
    return w - t + 0.5;
  },

  /** The shaduf: the pole's creak as the bucket is let down and swung up, the water tipped into the channel. */
  babShaduf(t, bus, lv) {
    this.creak(t, lv * 0.8, bus, false);
    this.cue(t + 1.0, (x) => { this.burst(x, 0.18, 800, 0.8, 0.05 * lv, bus); this.tone(x, [[0, 240], [0.1, 90]], 0.14, 0.03 * lv, bus); });
    this.cue(t + 1.9, (x) => this.creak(x, lv * 0.9, bus, true));
    this.cue(t + 3.0, (x) => this.pour(x, bus, lv * 0.8));
    for (let k = 0; k < 3; k++) this.cue(t + 3.6 + k * 0.4 + R() * 0.15, (x) => this.drip(x, lv * 0.7, bus));
    return 5;
  },

  /** Porters at the quay: a sack's thump on the stones, a drawn-out call and its answer. */
  babHaul(t, bus, lv) {
    const f0 = 118 * (0.94 + R() * 0.12);
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      this.cue(w, (x) => this.cry(x, f0, [[0, 0.3, 'o'], [5, 0.8, 'a']], 0.05 * lv, bus, { cutoff: 3500 }));
      this.cue(w + 1.2, (x) => this.cry(x, f0 * 1.1, [[2, 0.3, 'e'], [4, 0.6, 'o']], 0.04 * lv, bus, { cutoff: 3300 }));
      this.cue(w + 2.0, (x) => { this.knock(x, 140, 0.06 * lv, bus, 0.12); this.burst(x, 0.1, 480, 1, 0.03 * lv, bus); });
      w += 2.8 + R() * 1.4;
    }
    return w - t;
  },

  /** A round hide boat poled along the river (`f` is the track): a slow pole's plunge and drip at each push, the water at the hide, a boatman's call. */
  babQuffa(t, bus, lv, f) {
    const dur = f.dur, T = 2.2 + R() * 0.6, n = Math.floor(dur / T);
    for (let k = 0; k < n; k++) this.cue(t + k * T, (x) => { this.burst(x, 0.6, 480, 0.8, 0.03 * lv, bus, 0.15); this.knock(x + 0.3, 200, 0.03 * lv, bus, 0.06); if (R() < 0.6) this.drip(x + 0.7, lv * 0.7, bus); });
    this.rasp(t, dur, 420, 0.6, 0.01 * lv, bus, 0.6, 0.8);
    if (R() < 0.6) this.cue(t + dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 128 * (0.92 + R() * 0.16), [[0, 0.35, 'o'], [5, 0.9, 'a'], [3, 0.6, 'e'], [0, 1.0, 'u']], 0.045 * lv, bus, { cutoff: 3600 }));
    return dur;
  },

  /** The geese of a yard: a loud honk, falling, answered by cackles. */
  babGeese(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) {
      const f = 500 + R() * 170;
      this.cue(w, (x) => this.tone(x, [[0, f], [0.08, f * 1.25], [0.28, f * 0.8]], 0.3, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1000, 1.4]));
      w += 0.22 + R() * 0.4;
    }
    return w - t + 0.5;
  },

  /** A dove on a roof: a soft run of coos, low and rounded. */
  babDove(t, bus, lv) {
    let w = t;
    for (let rep = 0, nr = 1 + Math.floor(R() * 2); rep < nr; rep++) {
      const f = 500 + R() * 70;
      for (const [d, a] of [[0, 1], [0.26, 0.9], [0.52, 0.9], [0.84, 1]]) this.cue(w + d, (x) => this.tone(x, [[0, f * 0.9], [0.05, f], [0.17, f * 0.88]], 0.2, 0.02 * lv * a, bus, 'sine', ['lowpass', 1100, 0.7]));
      w += 1.8 + R() * 0.8;
    }
    return w - t + 0.4;
  },

  /** A donkey's bray: the in-draw rising and the out-breath falling, in pulses that slow. */
  babDonkey(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) {
      const up = k % 2 === 0, f = up ? 490 : 770, d = 0.55 + k * 0.08;
      this.cue(w, (x) => this.tone(x, up ? [[0, f], [d * 0.8, f * 2.1]] : [[0, f], [d * 0.9, f * 0.5]], d, 0.035 * lv, bus, 'sawtooth', ['bandpass', up ? 1500 : 1100, 1.2]));
      this.cue(w, (x) => this.rasp(x, d, 900, 0.8, 0.015 * lv, bus, 40, 0.6));
      w += d + 0.05;
    }
    return w - t + 0.8;
  },

  /** A camel's groan: a long bubbling roar, low, with the gurgle of the throat, and a grunt. */
  babCamel(t, bus, lv) {
    const f = 120 + R() * 25, d = 1.6 + R() * 0.9;
    this.tone(t, [[0, f * 1.3], [d * 0.3, f * 1.8], [d * 0.7, f * 1.1], [d, f * 0.7]], d, 0.045 * lv, bus, 'sawtooth', ['bandpass', 520, 1.1]);
    this.rasp(t, d, 700, 0.8, 0.02 * lv, bus, 26, 0.8);
    this.cue(t + d + 0.2, (x) => this.tone(x, [[0, f], [0.25, f * 0.7]], 0.3, 0.035 * lv, bus, 'sawtooth', ['lowpass', 500]));
    return d + 1;
  },

  /** A sheep's bleat, and another's answer: a nasal rising "meh" with a flutter. */
  babSheep(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      const f = 340 + R() * 120, d = 0.5 + R() * 0.3;
      this.cue(w, (x) => { this.tone(x, [[0, f], [d * 0.25, f * 1.25], [d, f * 0.95]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1200, 1.6]); this.rasp(x, d, 1200, 1, 0.01 * lv, bus, 38, 0.7); });
      w += d + 0.3 + R() * 0.8;
    }
    return w - t + 0.4;
  },

  /** A jackal beyond the walls at night: a long wavering howl climbing and falling, then a run of yips. */
  babJackal(t, bus, lv) {
    const f = 540 + R() * 80, d = 2.4 + R() * 0.8;
    this.tone(t, [[0, f], [d * 0.4, f * 1.6], [d * 0.7, f * 1.45], [d, f * 1.2]], d, 0.035 * lv, bus, 'sawtooth', ['bandpass', 1300, 1.5]);
    for (let k = 0; k < 7; k++) this.cue(t + d + 0.35 + k * 0.17, (x) => this.tone(x, [[0, f * 1.5], [0.05, f * 1.1]], 0.08, 0.03 * lv, bus, 'sawtooth', ['bandpass', 1500, 1.5]));
    return d + 2;
  },

  /** The little owl at night in the town: a sharp, rising "kiew", repeated, each a little lower. */
  babOwl(t, bus, lv) {
    let w = t;
    const f = 760 + R() * 120;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, f * 0.8], [0.12, f * 1.15], [0.3, f * 1.0]], 0.34, 0.03 * lv, bus, 'sine', ['bandpass', 1500, 2]));
      w += 0.85 + R() * 0.4;
    }
    return w - t + 0.5;
  },

  /** A caravan passing (`f` is the track): the padding of many feet, a copper bell on the leader's neck, a driver's call. */
  babCaravan(t, bus, lv, f) {
    const dur = f.dur, T = 0.62 + R() * 0.08, n = Math.floor(dur / T);
    for (let k = 0; k < n; k++) this.cue(t + k * T + R() * 0.15, (x) => { this.knock(x, 90 + R() * 30, 0.03 * lv, bus, 0.08); this.burst(x, 0.08, 400, 1, 0.015 * lv, bus); });
    for (let k = 0, m = Math.floor(dur / 1.3); k < m; k++) this.cue(t + k * 1.3 + R() * 0.2, (x) => this.struck(x, 640 + R() * 40, 0.018 * lv, bus, [[1, 1, 0.5], [2.3, 0.4, 0.3]]));
    if (R() < 0.7) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.cry(x, 135 * (0.93 + R() * 0.14), [[0, 0.3, 'e'], [5, 0.9, 'o'], [3, 0.5, 'a']], 0.045 * lv, bus, { cutoff: 3400 }));
    return dur;
  },
};

/** How loud each is made relative to its own scale (tools/sound-render.mjs: about 4.5e-3 RMS at the source, as the older voices are). */
export const BABYLON_GAIN = {
  babHawk: 2.2, babChant: 1.0, babLilissu: 0.3, babLyre: 0.4, babQuern: 1.6, babLoom: 1.8, babAdze: 1.3, babRecite: 1.6, babShaduf: 1.2, babHaul: 1.2, babQuffa: 1, babGeese: 1.4,
  babDove: 1.8, babDonkey: 1.2, babCamel: 0.8, babSheep: 1.4, babJackal: 1.1, babOwl: 1.5, babCaravan: 1.2,
};
