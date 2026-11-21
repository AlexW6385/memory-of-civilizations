// The placed voices of Ubirr, Kakadu, about AD 1000 (docs/settlements/kakadu.md §15.3; src/settlements/kakadu/soundmap.js says where each is made and when).
// Added to the engine's VOICES from here (addVoices), every name prefixed `kak`. All synthesised, no samples. [inferred throughout: no recording of
// Ubirr of AD 1000 exists. Stated by the dossier: didgeridoos and goose-hunting are in the Freshwater rock art (§7), magpie geese crowd the billabongs in the late dry
// season and plumed whistling-ducks with them (§13); the clapsticks, the kite's whistle, the curlew and the dingo's howl are inferred from the country; the pitches
// and patterns are ours. Nothing sung and nothing ceremonial: a man playing at the evening fire, and the sounds of work and of the water.]
import { addVoices } from './voices.js';

const R = Math.random;

export const KAK_VOICES = {
  /** Clapsticks: two hardwood sticks struck together, a steady beat in groups with a double at the end of each, dry and bright. */
  kakClap(t, bus, lv) {
    let w = t;
    const beat = 0.46 + R() * 0.08, groups = 3 + Math.floor(R() * 3);
    for (let g = 0; g < groups; g++) {
      const n = 4 + Math.floor(R() * 3);
      for (let i = 0; i < n; i++) { const a = i === 0 ? 1 : 0.7; this.cue(w, (x) => { this.struck(x, 1650 + R() * 120, 0.045 * lv * a, bus, [[1, 1, 0.05], [2.4, 0.4, 0.03]]); this.knock(x, 780, 0.012 * lv, bus, 0.04); }); w += beat; }
      this.cue(w - beat * 0.5, (x) => this.struck(x, 1700, 0.03 * lv, bus, [[1, 1, 0.04], [2.4, 0.4, 0.02]]));
      w += beat * (1 + R());
    }
    return w - t + 0.6;
  },
  /** A didgeridoo: a low droning buzz held a few seconds, a sharp overblown toot on the ends of phrases, a breath between. */
  kakDrone(t, bus, lv) {
    let w = t;
    const f = 70 + R() * 8, phrases = 3 + Math.floor(R() * 3);
    for (let p = 0; p < phrases; p++) {
      const d = 2.4 + R() * 2.6;
      this.cue(w, (x) => {
        this.tone(x, [[0, f * 0.97], [0.15, f], [d, f * 1.01]], d, 0.05 * lv, bus, 'sawtooth', ['lowpass', 480, 1.5]);
        this.tone(x, [[0, f * 2.01], [d, f * 2.03]], d, 0.014 * lv, bus, 'square', ['bandpass', 380, 3]);
        this.tone(x + d - 0.05, [[0, f * 3.3], [0.12, f * 4.1], [0.22, f * 3.6]], 0.24, 0.03 * lv, bus, 'sawtooth', ['bandpass', 520, 2.5]);
      });
      w += d + 0.5 + R() * 0.5;
    }
    return w - t + 0.8;
  },
  /** Magpie geese: a flock's honking, nasal and rough, a few voices overlapping, each a short fall in pitch. */
  kakGoose(t, bus, lv) {
    const n = 4 + Math.floor(R() * 6);
    for (let k = 0; k < n; k++) {
      const at = t + R() * 3.2, f = 460 + R() * 160, len = 0.14 + R() * 0.1;
      this.cue(at, (x) => { this.tone(x, [[0, f * 1.1], [len, f * 0.82]], len, 0.04 * lv, bus, 'sawtooth', ['bandpass', 760, 2]); this.burst(x, len, 900, 1, 0.008 * lv, bus); });
    }
    return 4;
  },
  /** Plumed whistling-ducks: a flock's thin rising whistles, 'wee-wee', many voices, high. */
  kakWhistle(t, bus, lv) {
    const n = 6 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) {
      const at = t + R() * 3.6, f = 2400 + R() * 500;
      this.cue(at, (x) => { this.tone(x, [[0, f], [0.1, f * 1.22]], 0.12, 0.012 * lv, bus, 'sine'); this.tone(x + 0.17, [[0, f * 1.02], [0.1, f * 1.25]], 0.12, 0.01 * lv, bus, 'sine'); });
    }
    return 4.5;
  },
  /** A whistling kite high over the rock: a long rising whistle that falls away, then three short ones. */
  kakKite(t, bus, lv) {
    const f = 2150 + R() * 200;
    this.cue(t, (x) => this.tone(x, [[0, f], [0.45, f * 1.32], [1.0, f * 1.1]], 1.0, 0.016 * lv, bus, 'sine', ['bandpass', 2600, 1.2]));
    for (let k = 0; k < 3; k++) this.cue(t + 1.25 + k * 0.2, (x) => this.tone(x, [[0, f * 1.3], [0.12, f * 1.15]], 0.13, 0.012 * lv, bus, 'sine'));
    return 2.4;
  },
  /** A bush stone-curlew in the night: a wailing 'wee-loo', rising, repeated faster and faster. */
  kakCurlew(t, bus, lv) {
    let w = t, gap = 0.9;
    const f = 950 + R() * 100, n = 4 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.tone(x, [[0, f], [0.35, f * 1.6], [0.55, f * 1.45]], 0.55, 0.02 * lv, bus, 'sine', ['bandpass', 1500, 2])); w += gap; gap *= 0.82; }
    return w - t + 0.8;
  },
  /** A dingo's howl far off: a long rising and falling note, a second voice a third above. */
  kakHowl(t, bus, lv) {
    const f = 400 + R() * 70, d = 2.8 + R() * 1.2;
    this.cue(t, (x) => this.tone(x, [[0, f * 0.9], [0.8, f * 1.4], [d * 0.7, f * 1.3], [d, f * 0.9]], d, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 3]));
    this.cue(t + 0.6, (x) => this.tone(x, [[0, f * 1.1], [0.8, f * 1.75], [d * 0.7, f * 1.6], [d, f * 1.1]], d - 0.4, 0.018 * lv, bus, 'sawtooth', ['bandpass', 1000, 3]));
    return d + 1.2;
  },
  /** Seed ground on a grindstone: the handstone pushed and drawn over the slab in a steady rhythm, a dry scrape each way. */
  kakGrind(t, bus, lv) {
    let w = t;
    const n = 14 + Math.floor(R() * 12), beat = 0.74 + R() * 0.12;
    for (let k = 0; k < n; k++) { this.rasp(w, beat * 0.6, 1200 + R() * 250, 0.8, 0.02 * lv, bus, 5, 0.7); w += beat; }
    return w - t + 1;
  },
  /** A stone axe on stringybark: a dull thud and the dry tear of the sheet coming away, two or three strokes. */
  kakAxe(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) { this.cue(w, (x) => { this.knock(x, 190, 0.06 * lv, bus, 0.1); this.rasp(x + 0.02, 0.3, 1600, 0.9, 0.012 * lv, bus, 30, 0.9); }); w += 1.2 + R() * 1.0; }
    return w - t + 0.8;
  },
  /** A fire: a handful of small dry cracks and ticks, now and then a pop. */
  kakCrackle(t, bus, lv) {
    const n = 6 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + R() * 2.4, (x) => this.burst(x, 0.012 + R() * 0.02, 2200 + R() * 2600, 1.5, 0.02 * lv, bus));
    if (R() < 0.4) this.cue(t + R() * 2, (x) => this.knock(x, 260, 0.03 * lv, bus, 0.05));
    return 3;
  },
  /** The billabong's edge: a small wavelet breaking among the reeds. */
  kakLap(t, bus, lv) { this.lap(t + 0.02, 0.55 * lv, bus); return 1.2; },
  /** Pandanus leaf drawn through the fingers in plaiting: soft dry rustles. */
  kakPlait(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { this.rasp(w, 0.5 + R() * 0.3, 3200, 0.7, 0.007 * lv, bus, 14, 0.8); w += 0.9 + R() * 0.8; }
    return w - t + 0.6;
  },
};

addVoices('voices-kakadu.js', KAK_VOICES);
