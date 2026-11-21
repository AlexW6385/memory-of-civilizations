// The placed voices of Cahokia about 1175 (docs/settlements/cahokia.md §10.3; src/settlements/cahokia/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `cah`; the engine's own voices that suit (the mortar, clay, cloth, baskets'
// sack, the owl) are used by the map as they are. All synthesised, no samples. [inferred throughout: no recording of 1175 exists; the instruments and
// works are those the dossier names (the cane flute, the water drum, the gourd and turtle-shell rattle, chunkey's rolled stone and thrown poles, the
// pounding of maize, the flaking of chert, the dugout's paddle, the shell-bead drill); pitches and patterns are ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
const SCALE = [0, 3, 5, 7, 10];                                        // the pentatonic of the music profile (minor)
const hz = (root, st) => root * Math.pow(2, st / 12);

export const CAH_VOICES = {
  /** The water drum: a jar half full, its hide head struck with a stick, a low round tone; groups of beats, a stronger first. */
  cahDrum(t, bus, lv) {
    let w = t;
    for (let g = 0, ng = 3 + Math.floor(R() * 4); g < ng; g++) {
      for (let i = 0; i < 4; i++) { const strong = i === 0; this.cue(w, (x) => { this.tone(x, [[0, strong ? 150 : 190], [0.12, strong ? 95 : 120]], 0.3, (strong ? 0.07 : 0.045) * lv, bus, 'sine'); this.burst(x, 0.03, 900, 1.2, 0.008 * lv, bus); }); w += 0.55 + R() * 0.05; }
      w += 0.5 + R() * 0.5;
    }
    return w - t + 0.8;
  },
  /** The gourd and turtle-shell rattle: dry, quick shakes in a steady pulse. */
  cahRattle(t, bus, lv) {
    let w = t;
    for (let s = 0, ns = 6 + Math.floor(R() * 6); s < ns; s++) {
      for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) this.cue(w + k * 0.045, (x) => this.struck(x, 3000 + R() * 1200, 0.006 * lv, bus, [[1, 1, 0.04], [1.7, 0.4, 0.03]]));
      w += 0.28 + R() * 0.04;
    }
    return w - t + 0.4;
  },
  /** Voices in unison, wordless, a falling chant of a few short phrases (heard from across the plaza). */
  cahChant(t, bus, lv) {
    const f0 = 140 + R() * 30, n = 3 + Math.floor(R() * 3);
    let w = t;
    for (let i = 0; i < n; i++) {
      const notes = [[0, 0.45, 'o'], [-3, 0.45, 'a'], [-5, 0.8, 'o'], [-8, 0.7, 'a']].slice(0, 2 + Math.floor(R() * 3));
      this.cue(w, (x) => this.cry(x, f0, notes, 0.03 * lv, bus, { cutoff: 1700, fem: false }));
      w += notes.reduce((s, c) => s + c[1], 0) + 0.6 + R();
    }
    return w - t + 1;
  },
  /** The end-blown cane flute: breathy, a slow pentatonic line, each note swelling and falling. */
  cahFlute(t, bus, lv) {
    const root = 330, n = 7 + Math.floor(R() * 6);
    let w = t, k = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = Math.max(0, Math.min(SCALE.length * 2 - 1, k + Math.floor(R() * 5) - 2));
      const f = hz(root, SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length)), len = 0.6 + R() * 1.3, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.03, len * 0.6, f * 2, 3, 0.004 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.97], [0.09, f], [len, f * 1.004]], len, 0.016 * lv, bus, 'triangle', ['bandpass', f * 1.4, 1.3]);
      });
      w += len + 0.1 + R() * 0.6;
    }
    return w - t + 1.2;
  },
  /** Chunkey: the stone rolled down the yard's clay (a rising-then-fading rumble), the two poles thrown after it, a clack of wood, and the crowd's shout. */
  cahChunkey(t, bus, lv) {
    this.rasp(t, 1.6, 420, 0.7, 0.03 * lv, bus, 14, 0.5);
    const hit = t + 1.1 + R() * 0.5;
    this.cue(hit, (x) => { this.knock(x, 300, 0.05 * lv, bus, 0.08); this.burst(x, 0.04, 2000, 1.4, 0.014 * lv, bus); });
    this.cue(hit + 0.15, (x) => this.knock(x, 380, 0.04 * lv, bus, 0.07));
    if (R() < 0.7) this.cue(hit + 0.5, (x) => this.cry(x, 190 + R() * 40, [[0, 0.6, 'a'], [3, 0.5, 'o']], 0.035 * lv, bus, { cutoff: 1800, fem: false }));
    return 3.2;
  },
  /** Maize pounded in a log mortar: a deep, hollow thud, the pestle lifted and dropped, in a steady rhythm of eight or ten. */
  cahPound(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => { this.knock(x, 110, 0.06 * lv, bus, 0.12); this.burst(x, 0.05, 700, 1.0, 0.008 * lv, bus); }); w += 0.8 + R() * 0.15; }
    return w - t + 0.8;
  },
  /** Chert flaked with an antler hammer: sharp small taps, a flake's tick, at uneven intervals. */
  cahKnap(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => { this.struck(x, 2300 + R() * 900, 0.012 * lv, bus, [[1, 1, 0.04], [2.3, 0.4, 0.02]]); this.knock(x, 500, 0.012 * lv, bus, 0.04); }); w += 0.3 + R() * 0.8; }
    return w - t + 0.6;
  },
  /** The drill turning in a shell bead: a thin, steady, high rasp, now and then a pause. */
  cahDrill(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 3); k < n; k++) { this.rasp(w, 1.2 + R() * 0.8, 3600, 0.8, 0.008 * lv, bus, 30, 0.9); w += 1.8 + R() * 1.0; }
    return w - t + 0.6;
  },
  /** A hide scraped on its frame: long dry strokes. */
  cahScrape(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 6); k < n; k++) { this.rasp(w, 0.5, 1900 + R() * 400, 0.9, 0.018 * lv, bus, 12, 0.8); w += 0.75 + R() * 0.2; }
    return w - t + 0.6;
  },
  /** A dugout's paddle: a dip and a drip, the hull's soft knock, every few seconds. */
  cahPaddle(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 0.5, 1100, 0.6, 0.012 * lv, bus, 8, 0.6); this.cue(w + 0.5, (x) => this.knock(x, 200, 0.02 * lv, bus, 0.05)); w += 1.6 + R() * 0.5; }
    return w - t + 0.8;
  },
  /** Cahokia Creek over its mud and snags: a long breath of low water noise, fuller in spring flood (March to June), thin in the late summer. */
  cahCreek(t, bus, lv) {
    const doy = seasonDoy(this), flood = 0.4 + 0.6 * Math.max(inSeason(doy, 70, 170, 20), 0), d = 7 + R() * 4;
    this.rasp(t, d, 700 + R() * 200, 0.5, 0.02 * lv * flood, bus, 9 + R() * 4, 0.5);
    this.rasp(t + 0.3, d - 0.6, 2200, 0.7, 0.006 * lv * flood, bus, 17, 0.7);
    return d;
  },
  /** A sentry's call from a bastion at night: two falling syllables, answered far off. */
  cahWatch(t, bus, lv) {
    const f = 220 + R() * 30;
    this.cue(t, (x) => this.cry(x, f, [[0, 0.5, 'o'], [-4, 0.7, 'a']], 0.04 * lv, bus, { cutoff: 1500, fem: false }));
    if (R() < 0.7) this.cue(t + 2.4, (x) => this.cry(x, f * 1.1, [[0, 0.5, 'o'], [-4, 0.7, 'a']], 0.02 * lv, bus, { cutoff: 1100, fem: false }));
    return 4;
  },
};

addVoices('voices-cahokia.js', CAH_VOICES);
