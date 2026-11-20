// Voices of Alexandria about 250 BC (docs/settlements/alexandria.md §16.3), added to the placed voices of voices.js by one line there
// (`addVoices('voices-alexandria.js', ALEXANDRIA_VOICES, ALEXANDRIA_GAIN)`): the gulls over the harbour, the keleustes' pipe and the oars' knock, the
// porters' call, the treadwheel crane, the caulkers' mallets, the trumpet at the palace, the roar of the Pharos' fire, the sistrum and the chant of the
// temple, the shaduf, the water organ of Ctesibius, the herald and the hawkers of the agora. Each is a method `name(t, bus, lv)` of Music returning how
// long it lasts; everything is synthesised, nothing sampled [inferred throughout: no recording of Alexandria exists; the instruments and calls after the dossier §16.3].

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

/** The water organ's pipes: a Dorian-like mode on D (tonic 293.66 Hz), the semitone steps D E F G A Bb C; the hydraulis' pipes were tuned to fixed notes of the Greek scales [stated: Ctesibius' instrument; the mode inferred]. */
const MODE = [0, 2, 3, 5, 7, 8, 10];
const deg = (d, tonic) => tonic * Math.pow(2, (Math.floor(d / 7) * 12 + MODE[((d % 7) + 7) % 7]) / 12);

const CALLS = {
  grain: [[0, 0.3, 'o'], [4, 0.3, 'a'], [7, 0.9, 'e']],
  fish: [[9, 0.25, 'i'], [5, 0.25, 'a'], [0, 1.0, 'o']],
  oil: [[0, 0.4, 'e'], [3, 0.4, 'e'], [7, 0.4, 'a'], [3, 1.0, 'a']],
};
const hawkOf = (kind) => function hawk(t, bus, lv) {
  const C = CALLS[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const f0 = 165 * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C, 0.05 * lv, bus, { cutoff: 4200 }));
    w += C.reduce((s, c) => s + c[1], 0) + 1.6 + R() * 2;
  }
  return w - t;
};

export const ALEXANDRIA_VOICES = {
  alxHawkGrain: hawkOf('grain'), alxHawkFish: hawkOf('fish'), alxHawkOil: hawkOf('oil'),

  /** Gulls over the harbour: two to four cries, each a hoarse mewing that rises and falls (a saw through a band, the pitch bending). */
  alxGull(t, bus, lv) {
    const n = 2 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      const f = 1050 + R() * 350, d = 0.28 + R() * 0.25;
      this.cue(w, (x) => { this.tone(x, [[0, f * 0.9], [d * 0.35, f * 1.35], [d, f * 0.8]], d, 0.014 * lv, bus, 'sawtooth', ['bandpass', 1900, 1.4]); this.burst(x, d * 0.8, 2400, 1.2, 0.01 * lv, bus); });
      w += d + 0.18 + R() * 0.5;
    }
    return w - t;
  },

  /** The keleustes' pipe on a galley: two notes of a reed pipe alternating at the stroke of the oars, and at each stroke the knock of the looms in the thole-pins. */
  alxKeleustes(t, bus, lv) {
    const beat = 0.78 + R() * 0.12, n = 8 + Math.floor(R() * 5), f = 392 * (R() < 0.5 ? 1 : 0.75);
    for (let k = 0; k < n; k++) {
      const w = t + k * beat;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * (k % 2 ? 1 : 1.125)], [0.2, f * (k % 2 ? 1 : 1.125)]], 0.26, 0.016 * lv, bus, 'sawtooth', ['bandpass', 1300, 2]);
        this.knock(x + 0.32, 150 + R() * 20, 0.03 * lv, bus, 0.1); this.knock(x + 0.34, 170 + R() * 20, 0.025 * lv, bus, 0.1);
        this.burst(x + 0.38, 0.35, 700, 0.8, 0.012 * lv, bus, 0.05);          // the blades dipping
      });
    }
    return n * beat + 0.5;
  },

  /** The porters' call at the cargo: a two-note chant, a man's, answered by another a fourth below. */
  alxPorters(t, bus, lv) {
    const f0 = 135 * (0.95 + R() * 0.1), a = [[0, 0.35, 'a'], [5, 0.5, 'o']], b = [[-5, 0.35, 'o'], [-7, 0.6, 'u']];
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 2); k < n; k++) {
      this.cue(w, (x) => this.cry(x, f0, a, 0.06 * lv, bus, { cutoff: 2600 }));
      this.cue(w + 1.1, (x) => this.cry(x, f0 * 1.02, b, 0.05 * lv, bus, { cutoff: 2400 }));
      this.cue(w + 1.9, (x) => this.burst(x, 0.16, 300, 1.2, 0.03 * lv, bus));              // the sack set down
      w += 2.8;
    }
    return w - t;
  },

  /** The treadwheel crane: the long creak of its axle, three turns of the wheel, the clank of the blocks and the dull knock of the load set down. */
  alxCrane(t, bus, lv) {
    for (let k = 0; k < 3; k++) this.cue(t + k * 0.95, (x) => this.creak(x, 0.03 * lv, bus, k % 2 === 0));
    this.cue(t + 3.2, (x) => { this.clink(x, 0.03 * lv, bus); this.burst(x + 0.1, 0.2, 220, 1, 0.06 * lv, bus); });
    return 4;
  },

  /** The caulkers' mallets on a hull: an uneven run of hollow knocks, a pause, and again. */
  alxCaulk(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => this.knock(x, 330 + R() * 90, 0.05 * lv, bus, 0.07)); w += 0.22 + R() * 0.16 + (k % 4 === 3 ? 0.4 : 0); }
    return w - t;
  },

  /** The trumpet (salpinx) of the guard at the palace: a straight bronze tube, a call on one note and its fourth, the last held. */
  alxSalpinx(t, bus, lv) {
    const f = 233 * (R() < 0.5 ? 1 : 1.12), seq = [[0, 0.3], [0, 0.3], [5, 0.3], [5, 0.3], [0, 1.4]];
    let w = t;
    for (const [s, d] of seq) { const fr = f * Math.pow(2, s / 12); this.cue(w, (x) => { this.tone(x, [[0, fr * 0.97], [0.05, fr]], d, 0.03 * lv, bus, 'sawtooth', ['lowpass', 2200, 0.8]); this.tone(x, [[0, fr * 2], [0.05, fr * 2]], d, 0.012 * lv, bus, 'square', ['lowpass', 1800, 0.8]); }); w += d + 0.08; }
    return w - t;
  },

  /** The great fire on the Pharos: a low roar of air in the flame and a scatter of cracks and pops; a long breath that swells and falls. */
  alxFire(t, bus, lv) {
    const d = 9 + R() * 4;
    this.burst(t, d, 160, 0.6, 0.05 * lv, bus, 2.2); this.burst(t + 0.5, d - 1, 520, 0.7, 0.02 * lv, bus, 2.5);
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) this.cue(t + R() * d, (x) => this.burst(x, 0.04 + R() * 0.05, 1800 + R() * 2200, 3, 0.03 * lv * (0.4 + R()), bus));
    return d + 0.5;
  },

  /** The sistrum of Isis: the rattle shaken in short bursts, three or four, at the shrine. */
  alxSistrum(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 2); k < n; k++) {
      for (let j = 0; j < 4; j++) this.cue(w + j * 0.06, (x) => { this.burst(x, 0.12, 5600 + R() * 2500, 4, 0.016 * lv, bus); this.burst(x, 0.08, 8200, 5, 0.01 * lv, bus); });
      w += 0.55 + R() * 0.25;
    }
    return w - t + 0.4;
  },

  /** The temple's morning hymn: low voices on a drone, a few long phrases (the daily ritual of the Egyptian temples). */
  alxTempleChant(t, bus, lv) {
    const n = 6 + Math.floor(R() * 4);
    this.chant(t, n, 0.04 * lv, bus, true);
    return n * 0.8 + 2;
  },

  /** The shaduf's pole: a slow creak as the bucket is lowered, a splash, and the creak again as it comes up. */
  alxShaduf(t, bus, lv) {
    this.cue(t, (x) => this.creak(x, 0.03 * lv, bus, false));
    this.cue(t + 1.5, (x) => { this.burst(x, 0.3, 700, 1, 0.04 * lv, bus); this.lap(x, 0.5 * lv, bus); });
    this.cue(t + 2.6, (x) => this.creak(x, 0.03 * lv, bus, true));
    return 4;
  },

  /** One pipe of the water organ: steady, a little reedy, an even loudness (the wind was kept steady by the water), a soft breath at the start. */
  alxOrganNote(when, f, dur, level, dest) {
    const ctx = this.ctx, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + 0.05); g.gain.setValueAtTime(level, when + dur - 0.06); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    for (const [m, type, a] of [[1, 'square', 0.5], [2, 'sine', 0.35], [3, 'sawtooth', 0.15]]) {
      const o = ctx.createOscillator(), og = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = type; o.frequency.value = f * m; og.gain.value = a; lp.type = 'lowpass'; lp.frequency.value = 2400;
      o.connect(og); og.connect(lp); lp.connect(g); o.start(when); o.stop(when + dur + 0.05);
    }
    g.connect(dest);
    this.burst(when, 0.05, 2200, 1.5, level * 0.4, dest);
    return dur;
  },
  /** A phrase on the water organ: a held drone and a tune over it in the mode, a chord at the close. */
  alxHydraulis(t, bus, lv) {
    const tonic = 293.66, n = 8 + Math.floor(R() * 6);
    let w = t, d = 7 + Math.floor(R() * 3);
    const total = n * 0.75 + 3;
    this.cue(t, (x) => this.alxOrganNote(x, tonic / 2, total, 0.012 * lv, bus));
    for (let k = 0; k < n; k++) {
      const last = k === n - 1, dur = last ? 2.2 : 0.4 + R() * 0.5, step = pick([-1, 1, 1, 2, -2]);
      d = Math.max(3, Math.min(11, d + step));
      this.cue(w, (x) => { this.alxOrganNote(x, deg(last ? 7 : d, tonic), dur, 0.016 * lv, bus); if (last) { this.alxOrganNote(x, deg(9, tonic), dur, 0.01 * lv, bus); this.alxOrganNote(x, deg(11, tonic), dur, 0.008 * lv, bus); } });
      w += dur + 0.04;
    }
    return Math.max(total, w - t) + 0.5;
  },

  /** The herald's cry at the agora: a high held call that falls, once or twice. */
  alxHerald(t, bus, lv) {
    const f0 = 150 * (0.95 + R() * 0.1);
    this.cry(t, f0, [[7, 0.5, 'a'], [7, 1.0, 'o'], [4, 0.4, 'e'], [0, 1.5, 'a']], 0.07 * lv, bus, { cutoff: 3600 });
    if (R() < 0.5) this.cry(t + 5, f0 * 1.03, [[7, 0.4, 'e'], [7, 0.9, 'a'], [2, 0.35, 'o'], [0, 1.2, 'o']], 0.06 * lv, bus, { cutoff: 3400 });
    return 9;
  },

  /** The murmur of the Library's readers: voices reading aloud, low and wordless, rising and falling; now and then a scroll's rustle. */
  alxReaders(t, bus, lv) {
    const d = this.teaTalk(t, bus, lv * 0.7);
    if (R() < 0.6) this.cue(t + 1 + R() * 3, (x) => this.burst(x, 0.3, 4200, 0.7, 0.012 * lv, bus, 0.08));
    return Math.max(d, 5);
  },

  /** Hens and a cock in a court of Rhakotis. */
  alxHens(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) { const f = 700 + R() * 300; this.cue(w, (x) => this.tone(x, [[0, f], [0.05, f * 1.25], [0.12, f * 0.9]], 0.14, 0.014 * lv, bus, 'triangle')); w += 0.15 + R() * 0.35; }
    return w - t + 0.3;
  },
};

/** How loud each is made relative to its own scale (set by measuring the renders: tools/sound-render.mjs, as the other settlements' do). */
export const ALEXANDRIA_GAIN = {
  alxHawkGrain: 2.5, alxHawkFish: 2.5, alxHawkOil: 1.8, alxGull: 3.5, alxKeleustes: 1.9, alxPorters: 2.3, alxCrane: 3.5, alxCaulk: 1.5, alxSalpinx: 1.2, alxFire: 4.5,
  alxSistrum: 6, alxTempleChant: 0.5, alxShaduf: 1.6, alxHydraulis: 0.5, alxHerald: 1.1, alxReaders: 1.5, alxHens: 2.4,
};
