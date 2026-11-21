// The placed voices of the pā by Lake Rotorua, later 18th century (docs/settlements/maori.md §4j; src/settlements/maori/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `mao`; the engine's own voices that suit (the kitchen's clatter, cloth, an owl) are used by the
// map as they are. All synthesised, no samples. [inferred throughout: no recording of the pā of the 1770s exists; the instruments and works are those the dossier names
// (waiata, the kōauau and pūtōrino flutes, the pūkāea trumpet, the karanga, adzes and the canoe, the weaving, pounding fern root, the hot pools and steam of Rotorua) and the
// birds Te Ara names for Aotearoa before the Europeans (tūī, korimako/bellbird, ruru/morepork, kiwi); the pitches and patterns are ours. No sacred chant or named song is imitated.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 2, 3, 5, 7];                                         // the pentatonic of the dossier's music (music.js)
const hz = (root, st) => root * Math.pow(2, st / 12);

export const MAO_VOICES = {
  /** The karanga: a woman's long call of welcome, wordless, rising on 'a' and falling away over four or five seconds, a second shorter call answering. */
  maoKaranga(t, bus, lv) {
    const f0 = 330 + R() * 40;
    this.cue(t, (x) => this.cry(x, f0, [[0, 0.8, 'a'], [5, 1.6, 'a'], [7, 1.4, 'a'], [3, 0.9, 'o'], [0, 1.0, 'o']], 0.04 * lv, bus, { cutoff: 3200, fem: true }));
    const w = t + 6.4 + R() * 1.5;
    this.cue(w, (x) => this.cry(x, f0 * 1.06, [[0, 0.6, 'a'], [4, 1.2, 'a'], [2, 1.0, 'o'], [-1, 1.0, 'o']], 0.03 * lv, bus, { cutoff: 3000, fem: true }));
    return w - t + 3.4;
  },
  /** A waiata: voices in unison, wordless as heard from across the marae, a few short phrases on a falling line, ending on a long note. */
  maoWaiata(t, bus, lv) {
    const f0 = 170 + R() * 30, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.4, 'a'], [2, 0.4, 'o'], [0, 0.5, 'a'], [-3, 0.9, 'o'], [-5, 0.7, 'a']].slice(0, 3 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 2000, fem: i % 2 === 1 }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.5 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** The kōauau, a small flute held to the nose or mouth: a soft breathy line of a few notes on the pentatonic, each swelling and falling. */
  maoKoauau(t, bus, lv) {
    const root = 392, n = 5 + Math.floor(R() * 5);
    let w = t, k = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length)), len = 0.5 + R() * 1.1, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.03, len * 0.5, f * 2, 3, 0.003 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.98], [0.1, f], [len, f * 1.003]], len, 0.013 * lv, bus, 'triangle', ['bandpass', f * 1.3, 1.4]);
      });
      w += len + 0.15 + R() * 0.7;
    }
    return w - t + 1.2;
  },
  /** The pūtōrino: a low flute with a reedy, trumpet-like voice, a slow wail up and down a fourth. */
  maoPutorino(t, bus, lv) {
    const f = 196 * (0.95 + R() * 0.1);
    let w = t;
    for (let i = 0, n = 2 + Math.floor(R() * 3); i < n; i++) {
      const len = 1.3 + R() * 1.0;
      this.cue(w, (x) => this.tone(x, [[0, f], [0.3, f * 1.19], [len * 0.7, f * 1.33], [len, f * 1.12]], len, 0.02 * lv, bus, 'sawtooth', ['bandpass', f * 2.1, 1.6]));
      w += len + 0.6 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** The pūkāea, the long wooden trumpet: one deep blast, swelling and held, answered by a shorter one. */
  maoPukaea(t, bus, lv) {
    const f = 98 * (0.97 + R() * 0.06);
    this.cue(t, (x) => this.tone(x, [[0, f * 0.96], [0.4, f], [2.2, f * 1.01], [2.8, f * 0.9]], 2.8, 0.035 * lv, bus, 'sawtooth', ['lowpass', 520, 1.2]));
    this.cue(t + 3.6, (x) => this.tone(x, [[0, f * 1.12], [0.3, f * 1.19], [1.2, f * 1.15], [1.6, f]], 1.6, 0.03 * lv, bus, 'sawtooth', ['lowpass', 560, 1.2]));
    return 6;
  },
  /** A stone adze (toki) chipping the hollow of a canoe: a dull knock and the wood's crack at each stroke, in a steady swing, two or three men out of step. */
  maoToki(t, bus, lv) {
    let w = t;
    const n = 6 + Math.floor(R() * 6), beat = 0.8 + R() * 0.25;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 190, 0.05 * lv, bus, 0.08); this.burst(x + 0.005, 0.04, 2300, 1.4, 0.012 * lv, bus); });
      if (k % 2) this.cue(w + beat * 0.45, (x) => { this.knock(x, 230, 0.035 * lv, bus, 0.07); this.burst(x, 0.03, 2000, 1.4, 0.008 * lv, bus); });
      w += beat;
    }
    return w - t + 0.8;
  },
  /** Fern root (aruhe) pounded on a log with a wooden beater: a steady, dull, wet thud, a small slap between. */
  maoPatu(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 140, 0.05 * lv, bus, 0.1); this.burst(x, 0.07, 700, 0.8, 0.012 * lv, bus); }); w += 0.55 + R() * 0.12; }
    return w - t + 0.6;
  },
  /** Flax stripped with a shell and plaited: long soft strokes of a dry edge on leaf, now and then the tug of a strand. */
  maoRaranga(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.rasp(w, 0.45 + R() * 0.3, 2600 + R() * 600, 0.7, 0.011 * lv, bus, 14, 0.8); w += 0.9 + R() * 0.7; }
    this.rasp(w, 0.5, 1400, 0.9, 0.008 * lv, bus, 6, 0.5);
    return w - t + 0.8;
  },
  /** A hearth: embers settling, small pops and a log's tick, a long soft hiss of burning damp wood between. */
  maoHearth(t, bus, lv) {
    this.rasp(t, 3 + R() * 2, 3400, 0.5, 0.006 * lv, bus, 30, 0.9);
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => this.struck(x, 2400 + R() * 1400, 0.008 * lv, bus, [[1, 1, 0.03], [1.9, 0.3, 0.02]])); w += 0.4 + R() * 1.0; }
    return w - t + 1.2;
  },
  /** The steam vent: a long breath of high noise in surges, dry in the cold dawn and the same all year (the ground's own heat). */
  maoSteam(t, bus, lv) {
    const d = 6 + R() * 4;
    this.rasp(t, d, 4200 + R() * 800, 0.45, 0.012 * lv, bus, 3 + R() * 2, 0.7);
    this.rasp(t + 0.4, d - 0.8, 1800, 0.6, 0.006 * lv, bus, 5, 0.6);
    return d;
  },
  /** The boiling pool: a run of soft bubbles bursting, each a short falling pop, with the low simmer under them. */
  maoPool(t, bus, lv) {
    const d = 5 + R() * 3;
    this.rasp(t, d, 520, 0.7, 0.012 * lv, bus, 9, 0.6);
    for (let k = 0, n = 8 + Math.floor(R() * 10); k < n; k++) { const at = t + R() * (d - 0.4), f = 260 + R() * 220; this.cue(at, (x) => this.tone(x, [[0, f * 1.5], [0.05, f * 0.8]], 0.07, 0.018 * lv, bus, 'sine')); }
    return d;
  },
  /** A canoe's paddles at night or by day: a stroke every second, a knock on the gunwale and the plash, a man calling the time now and then. */
  maoPaddle(t, bus, lv) {
    let w = t;
    const n = 8 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 330, 0.03 * lv, bus, 0.05); this.burst(x + 0.05, 0.22, 1200, 0.6, 0.014 * lv, bus); });
      if (k % 4 === 3 && R() < 0.5) this.cue(w + 0.2, (x) => this.cry(x, 150 + R() * 20, [[0, 0.35, 'o'], [3, 0.3, 'a']], 0.018 * lv, bus, { cutoff: 1500 }));
      w += 0.95 + R() * 0.08;
    }
    return w - t + 0.8;
  },
  /** Children at a string game: short high wordless cries and laughter, three or four voices overlapping, a squeal now and then. */
  maoChildren(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) {
      const f = 420 + R() * 200;
      this.cue(w, (x) => this.cry(x, f, [[0, 0.16, 'a'], [3, 0.14, 'a'], [-2, 0.2, 'o']], 0.016 * lv, bus, { cutoff: 3500, fem: true }));
      w += 0.25 + R() * 0.7;
    }
    return w - t + 0.6;
  },
  /** The tūī: a few clear bell notes, then the wheeze and the gurgle that follow them, a second run after a pause. */
  maoTui(t, bus, lv) {
    let w = t;
    for (let r = 0; r < 2; r++) {
      const f = 1500 + R() * 500;
      for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { const ff = f * (1 + R() * 0.5); this.cue(w, (x) => this.tone(x, [[0, ff], [0.12, ff * 0.8]], 0.16, 0.016 * lv, bus, 'sine')); w += 0.2 + R() * 0.15; }
      this.cue(w, (x) => this.rasp(x, 0.4, 3300, 2, 0.007 * lv, bus, 40, 0.9));
      w += 0.6 + R() * 1.4;
    }
    return w - t + 0.8;
  },
  /** The korimako (bellbird): a few pure, ringing notes close together in a falling chime. */
  maoKorimako(t, bus, lv) {
    let w = t;
    const f = 2000 + R() * 400;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { const ff = f * (1 - k * 0.04 + (R() - 0.5) * 0.06); this.cue(w, (x) => this.tone(x, [[0, ff], [0.1, ff * 1.01]], 0.13, 0.013 * lv, bus, 'sine')); w += 0.11 + R() * 0.07; }
    return w - t + 0.6;
  },
  /** The ruru (morepork): two soft notes, the second lower, repeated a few times by night. */
  maoRuru(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.tone(x, [[0, 760], [0.18, 740]], 0.22, 0.03 * lv, bus, 'triangle', ['bandpass', 800, 3]); this.tone(x + 0.34, [[0, 620], [0.2, 590]], 0.26, 0.03 * lv, bus, 'triangle', ['bandpass', 640, 3]); });
      w += 1.5 + R() * 0.8;
    }
    return w - t + 1;
  },
  /** The kiwi far off at night: a run of shrill rising whistles, the same note again and again. */
  maoKiwi(t, bus, lv) {
    const f = 1150 + R() * 150, n = 8 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.42, (x) => this.tone(x, [[0, f], [0.3, f * 1.35]], 0.32, 0.018 * lv, bus, 'triangle', ['bandpass', 1500, 2]));
    return n * 0.42 + 1;
  },
  /** The lake against its shingle in a breeze: a long hush with the slap of small waves in it. */
  maoLake(t, bus, lv) {
    const d = 7 + R() * 4, doy = seasonDoy(this), s = 0.8 + 0.2 * inSeason(doy, 300, 60, 40);
    this.rasp(t, d, 800 + R() * 300, 0.5, 0.016 * lv * s, bus, 4 + R() * 2, 0.5);
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) this.cue(t + R() * d, (x) => this.burst(x, 0.2, 1500, 0.8, 0.01 * lv, bus));
    return d;
  },
};

addVoices('voices-maori.js', MAO_VOICES);
