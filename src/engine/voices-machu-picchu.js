// The placed voices of Machu Picchu, c. 1450–1530 (docs/settlements/machu-picchu.md §15; src/settlements/machu-picchu/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `mp`; the engine's own voices that suit (the hearth's pots, the jars' lids, pouring, sacks, cloth,
// the owl) are used by the map as they are. All synthesised, no samples.
// [inferred throughout: no recording of Inca music or work exists. The instruments are those the dossier names (the end-notched flute quena and the panpipes antara/siku on the
// pentatonic scale, the skin drum wankar, the conch trumpet pututu of the runners: Wikipedia "Chasqui"; docs §9); the foot plough (chakitaqlla) and the hoe's clods are those of
// docs §5.2; the llama's hum, the guinea pig's whistle, the stone hammer on granite and the river's roar are the animals', tools' and country's own sounds, the pitches and patterns ours.]
import { addVoices, inSeason, doyOf } from './voices.js';
import { ENV } from './env.js';

const R = Math.random;
const seasonDoy = (m) => m.seasonDoy?.() ?? doyOf(ENV.seasonWinter.value, ENV.seasonAutumn.value);
/** The wet season, November to March (the south's summer): 1 in the rains, 0 in the dry months [inferred: general, the Andes]. */
export const wetSeason = (doy) => Math.max(0, inSeason(doy, 305, 90, 25));
const SCALE = [0, 3, 5, 7, 10];                                         // the minor pentatonic over the tonic (music.js)
const hz = (root, st) => root * Math.pow(2, st / 12);
const phrase = (k, dk) => Math.max(0, Math.min(SCALE.length * 2 - 1, k + dk));
const note = (k) => SCALE[k % SCALE.length] + 12 * Math.floor(k / SCALE.length);

export const MP_VOICES = {
  /** The quena: an end-notched flute, breathy, a slow pentatonic line, each note swelling and falling, a breath of air before it. */
  mpQuena(t, bus, lv) {
    const root = 392, n = 7 + Math.floor(R() * 7);
    let w = t, k = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      k = phrase(k, Math.floor(R() * 5) - 2);
      const f = hz(root, note(k)), len = 0.5 + R() * 1.1, at = w;
      this.cue(at, (x) => {
        this.rasp(x - 0.02, len * 0.6, f * 2, 3, 0.004 * lv, bus, 6, 0.5);
        this.tone(x, [[0, f * 0.97], [0.07, f], [len, f * 1.003]], len, 0.016 * lv, bus, 'triangle', ['bandpass', f * 1.5, 1.4]);
      });
      w += len + 0.08 + R() * 0.5;
    }
    return w - t + 1;
  },
  /** The panpipes: two players trading notes (the hocket of the paired siku): short bright tones in turn, falling to the tonic. */
  mpAntara(t, bus, lv) {
    const root = 330, n = 6 + Math.floor(R() * 6);
    let w = t, k = 5;
    for (let i = 0; i < n; i++) {
      k = phrase(k, i % 2 ? -1 - Math.floor(R() * 2) : Math.floor(R() * 3));
      const f = hz(root, note(k)), len = 0.28 + R() * 0.22;
      this.cue(w, (x) => { this.rasp(x - 0.015, len * 0.5, f * 3, 3, 0.003 * lv, bus, 7, 0.5); this.tone(x, [[0, f], [len, f * 0.998]], len, 0.014 * lv, bus, 'sine', ['lowpass', f * 3, 0.7]); });
      w += 0.3 + R() * 0.25;
    }
    return w - t + 0.8;
  },
  /** The wankar: a big skin drum beaten with a padded stick, a steady two-beat with an offbeat, low and soft, dying between phrases. */
  mpWankar(t, bus, lv) {
    let w = t;
    const beats = 12 + Math.floor(R() * 12);
    for (let i = 0; i < beats; i++) {
      const strong = i % 3 === 0, f = strong ? 82 : 110;
      this.cue(w, (x) => { this.knock(x, f, (strong ? 0.07 : 0.04) * lv, bus, strong ? 0.28 : 0.16); this.burst(x, 0.05, 260, 1.2, 0.012 * lv, bus); });
      w += i % 3 === 1 ? 0.28 : 0.46;
    }
    return w - t + 0.8;
  },
  /** The pututu: the conch trumpet of the runner, one long low note swelling, a rough edge, then falling, once or twice; it carries far down the gorge. */
  mpPututu(t, bus, lv) {
    const f = 196 + R() * 20, len = 2.6 + R() * 1.4;
    for (let c = 0, n = R() < 0.4 ? 2 : 1; c < n; c++) {
      const at = t + c * (len + 0.9);
      this.cue(at, (x) => {
        this.tone(x, [[0, f * 0.9], [0.4, f], [len * 0.8, f * 1.02], [len, f * 0.93]], len, 0.04 * lv, bus, 'sawtooth', ['bandpass', f * 3, 1.2]);
        this.tone(x, [[0, f * 0.45], [0.5, f * 0.5], [len, f * 0.47]], len, 0.02 * lv, bus, 'triangle');
        this.rasp(x + 0.1, len, f * 4, 1.2, 0.006 * lv, bus, 30, 0.8);
      });
    }
    return len * 2 + 1;
  },
  /** The mason's hammer-stone on granite: sharp dry tocks of stone on stone with a short ring, in runs of dressing, a pause to turn the block. */
  mpStoneHammer(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 8); k < n; k++) {
      this.cue(w, (x) => { this.burst(x, 0.03, 2800, 2, 0.04 * lv, bus); this.struck(x, 1100 + R() * 300, 0.016 * lv, bus, [[1, 1, 0.1], [2.3, 0.4, 0.06]]); });
      w += 0.42 + R() * 0.2; if (R() < 0.1) w += 0.9;
    }
    return w - t + 0.8;
  },
  /** The foot plough: the blade driven into the soil with the foot, a dull thud and the tear of roots, then the hoe breaking clods; a man's call between. */
  mpPlough(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 90, 0.05 * lv, bus, 0.18); this.rasp(x + 0.05, 0.35, 700, 0.8, 0.012 * lv, bus, 12, 0.8); });
      if (R() < 0.6) this.cue(w + 0.8, (x) => { this.knock(x, 130, 0.03 * lv, bus, 0.1); this.burst(x, 0.08, 500, 1, 0.012 * lv, bus); });
      w += 1.6 + R() * 1.2;
    }
    return w - t + 0.8;
  },
  /** A herder's call across the terraces: wordless, two or three notes falling, a long open vowel and a short one, from a distance. */
  mpCall(t, bus, lv) {
    const f = 150 + R() * 40;
    this.cue(t, (x) => this.cry(x, f, [[0, 0.7, 'o'], [-2, 0.5, 'a'], [-5, 0.8, 'o']], 0.04 * lv, bus, { cutoff: 2200, fem: R() < 0.3 }));
    return 3;
  },
  /** A llama's hum: a soft nasal humming rising a little and falling, now and then the short alarm call (a rising rattle) when something comes near. */
  mpLlama(t, bus, lv) {
    const f = 125 + R() * 25, len = 0.9 + R() * 0.6;
    this.tone(t, [[0, f], [len * 0.4, f * 1.12], [len, f * 0.92]], len, 0.016 * lv, bus, 'sawtooth', ['bandpass', 380, 2.2]);
    if (R() < 0.3) this.tone(t + len + 0.4, [[0, f * 1.6], [0.6, f * 2.2]], 0.6, 0.012 * lv, bus, 'sawtooth', ['bandpass', 900, 3]);
    return len + 1.5;
  },
  /** The guinea pigs in their cell: a run of thin whistles (the "cuy" call) and a patter of small feet on straw. */
  mpCuy(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 6); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 2300 + R() * 500], [0.08, 3000 + R() * 600], [0.16, 2400]], 0.18, 0.006 * lv, bus, 'sine'));
      w += 0.18 + R() * 0.3;
    }
    this.rasp(t, w - t, 2600, 1.2, 0.003 * lv, bus, 40, 0.9);
    return w - t + 1;
  },
  /** The backstrap loom: the batten (a flat wooden sword) beating the weft up with a soft knock, the heddle rod's tap, the warp's whisper as the shed is opened. */
  mpLoomBatten(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 330, 0.03 * lv, bus, 0.07); this.rasp(x + 0.1, 0.35, 2200, 0.7, 0.006 * lv, bus, 20, 0.7); });
      w += 1.0 + R() * 1.5;
    }
    return w - t + 1;
  },
  /** The spindle: a stick weighted with its whorl, set spinning and dropped, a thin dry whirr that slows and stops, the thread drawn out. */
  mpSpindle(t, bus, lv) {
    const d = 3 + R() * 3;
    this.rasp(t, d, 3200, 1.5, 0.006 * lv, bus, 55, 0.9);
    this.rasp(t + d * 0.6, d * 0.5, 2000, 1, 0.004 * lv, bus, 25, 0.8);
    return d + 1;
  },
  /** The batan: the rocking stone worked to and fro over the maize on the flat stone, a grating rhythm, a pause to push the meal back. */
  mpGrind(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 10 + Math.floor(R() * 8); k < n; k++) { this.rasp(w, 0.45, 900 + R() * 250, 1, 0.016 * lv, bus, 5, 0.7); w += 0.7; }
    this.knock(w + 0.1, 260, 0.02 * lv, bus, 0.08);
    return w - t + 1;
  },
  /** A spout of the stairway of fountains: a bright jet falling into its basin, a steady fine patter with now and then a larger splash. */
  mpSpout(t, bus, lv) {
    const wet = 0.65 + 0.35 * wetSeason(seasonDoy(this)), d = 6 + R() * 4;
    this.rasp(t, d, 2600 + R() * 600, 0.7, 0.012 * lv * wet, bus, 22 + R() * 8, 0.75);
    this.rasp(t + 0.2, d - 0.5, 900, 0.6, 0.006 * lv * wet, bus, 9, 0.6);
    return d;
  },
  /** The Urubamba in its gorge far below: a long low roar of white water, much louder in the rains. */
  mpRiver(t, bus, lv) {
    const wet = 0.35 + 0.65 * wetSeason(seasonDoy(this)), d = 9 + R() * 5;
    this.rasp(t, d, 260 + R() * 80, 0.5, 0.03 * lv * wet, bus, 0.3 + R() * 0.2, 0.5);
    this.rasp(t + 0.4, d - 0.8, 900, 0.6, 0.01 * lv * wet, bus, 2 + R() * 2, 0.6);
    return d;
  },
};

addVoices('voices-machu-picchu.js', MP_VOICES);
