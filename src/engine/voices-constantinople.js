// Voices of Constantinople about 562 (docs/settlements/constantinople.md §16.3), added to the placed voices of voices.js through addVoices: the
// pilgrims' market's wordless cries, the beggars' litany at the church door, the clergy's psalmody over the ison, the factions' acclamation and the
// water organ in the Hippodrome, a chariot team on the track, a mule train on the Mese, the windlass at the cistern head, fountains, the baker's
// oven, the smith's bellows, the silversmith's chasing hammer, doves, a family's supper. Each is a method `name(t, bus, lv)` of Music returning how
// long it lasts, made of the engine's tools (burst, tone, struck, rasp, cry, cue, knock, creak) and nothing else: no samples. Every name begins `cn`.
// [inferred throughout: no recording of the city exists; what each sound is and where rests on the dossier §16.3.]

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];

/** The market's cries (wordless): [semitones above the voice's base, seconds, vowel]; each has its own contour. */
export const CRIES = {
  candles: { cry: [[0, 0.25, 'e'], [5, 0.25, 'e'], [3, 0.7, 'a']], fem: true },
  bread: { cry: [[7, 0.3, 'o'], [4, 0.3, 'a'], [0, 1.0, 'o']], fem: false },
  water: { cry: [[0, 0.4, 'u'], [7, 0.5, 'o'], [5, 0.9, 'o']], fem: false },
  fruit: { cry: [[4, 0.3, 'i'], [9, 0.3, 'a'], [7, 0.5, 'a'], [2, 0.8, 'e']], fem: null },
  cloth: { cry: [[0, 0.3, 'a'], [3, 0.3, 'a'], [7, 0.3, 'o'], [3, 0.8, 'o']], fem: false },
};
const hawkOf = (kind) => function hawk(t, bus, lv) {
  const C = CRIES[kind], n = R() < 0.4 ? 2 : 1;
  let w = t;
  for (let k = 0; k < n; k++) {
    const fem = C.fem === null ? R() < 0.5 : C.fem, f0 = (fem ? 280 : 160) * (0.93 + R() * 0.14);
    this.cue(w, (x) => this.cry(x, f0, C.cry, 0.05 * lv, bus, { fem, cutoff: 4200 }));
    w += C.cry.reduce((s, c) => s + c[1], 0) + 1.8 + R() * 2;
  }
  return w - t;
};

/** The D mode, first tone (the dossier's music): semitones from the tonic D. */
const MODE = [0, 2, 3, 5, 7, 9, 10];
const degSemi = (d) => Math.floor(d / 7) * 12 + MODE[((d % 7) + 7) % 7];

export const CN_VOICES = {
  cnHawkCandles: hawkOf('candles'), cnHawkBread: hawkOf('bread'), cnHawkWater: hawkOf('water'), cnHawkFruit: hawkOf('fruit'), cnHawkCloth: hawkOf('cloth'),

  /** The beggars' and pilgrims' litany at the church door: "Kyrie eleison" on a falling line, one voice and then a second a little behind it, three to five times over. */
  cnKyrie(t, bus, lv) {
    const line = [[0, 0.4, 'i'], [-2, 0.3, 'i'], [0, 0.5, 'e'], [-2, 0.35, 'e'], [-5, 0.3, 'e'], [-3, 0.3, 'i'], [-5, 1.1, 'o']];
    const len = line.reduce((s, c) => s + c[1], 0), n = 3 + Math.floor(R() * 3), f0 = 128 * (0.94 + R() * 0.12);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.cry(x, f0, line, 0.04 * lv, bus, { cutoff: 2600 }));
      if (R() < 0.7) this.cue(w + 0.35 + R() * 0.2, (x) => this.cry(x, f0 * 1.19, line, 0.025 * lv, bus, { cutoff: 2400, fem: true }));
      w += len + 0.6 + R() * 0.8;
    }
    return w - t + 0.5;
  },

  /** Psalmody: the ison (a held low D sung on 'o') and over it a unison line in the first mode, phrases of four to six notes that fall to the tonic. */
  cnPsalm(t, bus, lv) {
    const base = 146.83 * (R() < 0.5 ? 1 : 0.5), np = 2 + Math.floor(R() * 2);
    let w = t + 0.8, deg = 4;
    const phrases = [];
    for (let p = 0; p < np; p++) {
      const notes = [];
      for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) {
        deg = k === n - 1 ? 0 : clamp(deg + pick([-2, -1, -1, 0, 1, 1]), 0, 6);
        notes.push([degSemi(deg), k === n - 1 ? 1.6 : 0.6 + R() * 0.5, k === n - 1 ? 'o' : pick(['a', 'e', 'o'])]);
      }
      phrases.push({ at: w, notes });
      w += notes.reduce((s, c) => s + c[1], 0) + 1.2;
    }
    const total = w - t;
    this.cry(t, base / 2, [[0, total, 'o']], 0.035 * lv, bus, { cutoff: 1800 });
    for (const { at, notes } of phrases) {
      this.cue(at, (x) => { this.cry(x, base, notes, 0.04 * lv, bus, { cutoff: 2600 }); this.cry(x, base * 1.005, notes, 0.025 * lv, bus, { cutoff: 2400 }); });
    }
    return total + 0.6;
  },

  /** The factions' acclamation in the Hippodrome: a swell of the crowd, then "Ni-ka, ni-ka" shouted in a falling third by many voices, ragged, and a roar to close. */
  cnAcclaim(t, bus, lv) {
    const dur = 9 + R() * 5;
    this.rasp(t, dur, 900, 0.6, 0.03 * lv, bus, 6, 0.5);
    this.rasp(t, dur, 2300, 0.7, 0.012 * lv, bus, 9, 0.7);
    const reps = 5 + Math.floor(R() * 4);
    for (let r = 0; r < reps; r++) {
      for (let v = 0; v < 4; v++) {
        const f0 = 100 + R() * 70, at = t + 1.2 + r * 1.05 + R() * 0.18;
        this.cue(at, (x) => this.cry(x, f0, [[0, 0.2, 'i'], [-3, 0.4, 'a']], 0.03 * lv, bus, { cutoff: 3000 }));
      }
    }
    return dur + 1.5;
  },

  /** The water organ (hydraulis) played at the games: a bright, reedy sound of fifths and fourths over a drone, a run of notes, a held close. */
  cnOrganNote(when, f, dur, level, dest) {
    const ctx = this.ctx, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + 0.05); g.gain.setValueAtTime(level, when + dur - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; g.connect(lp); lp.connect(dest);
    for (const [r, a] of [[1, 1], [2.003, 0.5], [3, 0.35]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f * r; og.gain.value = a; o.connect(og); og.connect(g); o.start(when); o.stop(when + dur + 0.05); }
    return dur;
  },
  cnOrgan(t, bus, lv) {
    const tonic = 196, n = 8 + Math.floor(R() * 6);
    let w = t, deg = 4;
    this.cue(w, (x) => { this.cnOrganNote(x, tonic / 2, n * 0.4 + 2, 0.02 * lv, bus); });
    for (let k = 0; k < n; k++) {
      const last = k === n - 1, d = last ? 2 : 0.25 + R() * 0.25;
      this.cue(w, (x) => this.cnOrganNote(x, tonic * Math.pow(2, degSemi(last ? 0 : deg) / 12), d, 0.025 * lv, bus));
      w += d; deg = clamp(deg + pick([-2, -1, 1, 1, 2]), 0, 8);
    }
    return w - t + 0.5;
  },

  /** A team of four at the gallop passing along `f` (a bus moving with the team): four hoofbeats to the stride on the sand, the wheels' rumble, the crowd's swell as they go by. */
  cnChariots(t, bus, lv, f) {
    const dur = Math.min(40, f?.dur ?? 20), stride = 0.34;
    this.rasp(t, dur, 260, 0.8, 0.012 * lv, bus, 9, 0.6);
    for (let w = t; w < t + dur; w += stride) {
      for (let h = 0; h < 4; h++) this.cue(w + h * 0.07 + R() * 0.03, (x) => { this.tone(x, [[0, 150], [0.05, 70]], 0.07, 0.01 * lv, bus, 'sine'); this.knock(x, 480 + R() * 120, 0.025 * lv, bus, 0.04); });
      this.cue(w + 0.02, (x) => this.burst(x, 0.06, 900, 1.1, 0.02 * lv, bus));
    }
    this.rasp(t + 1, dur - 2, 1100, 0.5, 0.012 * lv, bus, 5, 0.8);
    return dur + 1;
  },

  /** A mule train on the paving, passing along `f`: the unshod-to-iron clop in a loose four, a small bronze bell on the leader, a cart axle creaking now and then. */
  cnMules(t, bus, lv, f) {
    const dur = Math.min(40, f?.dur ?? 20);
    let k = 0;
    for (let w = t; w < t + dur; w += 0.48 + R() * 0.04, k++) {
      this.cue(w, (x) => { this.knock(x, 620 + R() * 120, 0.04 * lv, bus, 0.05); this.burst(x, 0.03, 1700, 1.2, 0.012 * lv, bus); });
      if (k % 2 === 0) this.cue(w + 0.24, (x) => this.knock(x, 520 + R() * 80, 0.03 * lv, bus, 0.05));
      if (k % 3 === 0) this.cue(w + 0.1, (x) => this.struck(x, 1380, 0.015 * lv, bus, [[1, 1, 0.5], [2.7, 0.4, 0.3]]));
    }
    for (let w = t + 1.5; w < t + dur - 1; w += 3 + R() * 2) this.cue(w, (x) => this.creak(x, lv * 0.5, bus, R() < 0.5));
    return dur + 0.8;
  },

  /** The windlass at a cistern head: the crank creaking round, the rope running, the bucket knocking on the rim, the water poured into a jar. */
  cnWindlass(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => this.creak(x, lv * 0.7, bus, true)); w += 0.8 + R() * 0.2; }
    this.cue(w, (x) => { this.knock(x, 280, 0.05 * lv, bus, 0.1); this.burst(x + 0.1, 0.5, 1400, 0.9, 0.025 * lv, bus, 0.05); });
    this.cue(w + 0.7, (x) => this.pour(x, bus, lv));
    return w - t + 3;
  },

  /** A fountain's spout running into its basin: a steady fall of water with a flutter, and now and then a drop. */
  cnFountain(t, bus, lv) {
    const dur = 6 + R() * 3;
    this.rasp(t, dur, 2200, 0.9, 0.022 * lv, bus, 17, 0.5);
    this.rasp(t, dur, 850, 0.7, 0.012 * lv, bus, 5, 0.6);
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + 0.5 + R() * (dur - 1), (x) => this.tone(x, [[0, 900 + R() * 600], [0.05, 1700 + R() * 500]], 0.06, 0.012 * lv, bus, 'sine'));
    return dur;
  },

  /** The baker's oven: the fire's crackle, the dough slapped on the board, the long peel scraped across the oven's floor, a loaf knocked hollow. */
  cnBakeWork(t, bus, lv) {
    const dur = 7 + R() * 4;
    this.rasp(t, dur, 3200, 0.8, 0.012 * lv, bus, 40, 0.9);
    let w = t + 0.4;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.knock(x, 200, 0.05 * lv, bus, 0.08); this.burst(x, 0.08, 700, 0.8, 0.02 * lv, bus); }); w += 0.55 + R() * 0.3; }
    this.cue(w + 0.3, (x) => this.rasp(x, 0.9, 1300, 0.7, 0.025 * lv, bus, 12, 0.6));
    this.cue(w + 1.6, (x) => this.knock(x, 340, 0.04 * lv, bus, 0.09));
    return dur;
  },

  /** The smith's bellows: breath in and out of the leather, a soft roar each time as the fire takes it. */
  cnBellows(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 4); k < n; k++) { this.burst(w, 0.55, 420, 0.7, 0.035 * lv, bus, 0.18); this.burst(w + 0.7, 0.3, 700, 0.8, 0.012 * lv, bus, 0.05); w += 1.5 + R() * 0.2; }
    return w - t + 0.4;
  },

  /** The silversmith's small hammer chasing a vessel: light quick taps with a ring of silver, in runs. */
  cnChasing(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 1700 + R() * 300, 0.03 * lv, bus, 0.03); this.struck(x, 3100 + R() * 500, 0.012 * lv, bus, [[1, 1, 0.12], [2.3, 0.4, 0.08]]); });
      w += R() < 0.2 ? 0.55 : 0.2 + R() * 0.08;
    }
    return w - t + 0.3;
  },

  /** Doves on a cornice: the soft rolling coo, three notes with the middle one high, over and over. */
  cnDove(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) {
      for (const [dt, f, d] of [[0, 380, 0.22], [0.26, 470, 0.3], [0.62, 400, 0.4]]) this.cue(w + dt, (x) => this.tone(x, [[0, f], [d, f * 0.92]], d, 0.02 * lv, bus, 'sine', ['bandpass', 420, 1.2]));
      w += 1.5 + R() * 0.6;
    }
    return w - t + 0.5;
  },

  /** A family's supper in the evening: the murmur at the table, cups and a dish set down, a laugh. */
  cnSupper(t, bus, lv) {
    const d = this.teaTalk(t, bus, lv * 0.9);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + 1 + k * (1.5 + R()), (x) => { this.clink(x, 0.012 * lv, bus); this.knock(x + 0.2, 320, 0.02 * lv, bus, 0.06); });
    return Math.max(d, 7);
  },
};

/** How loud each is made relative to its own scale (tools/sound-render.mjs: about 4.5e-3 RMS at the source, as the voices of voices.js). */
export const CN_GAIN = {
  cnHawkCandles: 3.2, cnHawkBread: 3.3, cnHawkWater: 3.3, cnHawkFruit: 3.2, cnHawkCloth: 3.3, cnKyrie: 1.3, cnPsalm: 1.7, cnAcclaim: 1.5, cnOrgan: 0.33, cnChariots: 0.9, cnMules: 1.3,
  cnWindlass: 2.3, cnFountain: 2.1, cnBakeWork: 2.0, cnBellows: 5.4, cnChasing: 3.1, cnDove: 1.1, cnSupper: 2.7,
};
