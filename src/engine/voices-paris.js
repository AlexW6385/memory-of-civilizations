// The voices of Paris about 1248 (docs/settlements/paris.md §6c), added to the placed voices of voices.js: what the Seine, the Grand Pont,
// the shops, the streets and the cathedral sounded like, in the same synthesised terms (noise, oscillators, formant filters, struck partials;
// no samples). Each is a method `name(t, bus, lv)` of the audio engine's Music, like those of voices.js, scheduled from the fixed emitters and
// the bell hours of the map (src/settlements/paris/soundmap.js). The voices that move (a boat, a crier, the watch, a cart) make their own bus
// from the listener's place, so the map's emitter for them is only the clock.
// [inferred throughout, except where a source is marked: no recording of 1248 exists; the cries are from the list of the *Crieries de Paris*
// (Guillaume de Villeneuve, 1265: some 130 cries, from the baths at dawn to the pastry sellers at the day's end; Wikipedia "Street cries";
// the product list: parisfoodhistory.blogspot.com, "What the cries of Paris tell us about Parisian food history"), but every melody is ours.]

import { VOICES, addVoices, SEASON_OF, inHours, seasonOf } from './voices.js';

const R = Math.random;
const mapOf = (m) => m.plc?.life?.map;

/** The cries of the streets: [semitones above the voice's base, seconds, vowel], wordless; `hours` as local clock hours. */
export const CRIES = {
  baths: { cry: [[0, 0.3, 'o'], [4, 0.3, 'e'], [7, 0.9, 'a'], [4, 0.35, 'a'], [0, 1.0, 'o']], fem: false, w: 1.0, hours: [4.5, 8] },      // the bath-keepers: the first cries of the day, "the baths are hot"
  water: { cry: [[0, 0.25, 'o'], [-3, 0.9, 'o'], [0, 0.3, 'o'], [-5, 1.1, 'u']], fem: false, w: 0.8, hours: [6, 18], base: 140 },        // the water porter's call
  cress: { cry: [[7, 0.2, 'e'], [9, 0.2, 'e'], [12, 0.5, 'o'], [9, 0.3, 'o'], [4, 0.8, 'a']], fem: true, w: 1.1, hours: [6, 11.5] },       // cress and greens
  fish: { cry: [[10, 0.25, 'a'], [7, 0.25, 'a'], [3, 0.3, 'e'], [0, 1.0, 'o']], fem: false, w: 1.0, hours: [6, 13] },                   // herring and eels: a fall from high to low
  milk: { cry: [[0, 0.4, 'a'], [5, 0.4, 'e'], [3, 1.0, 'u']], fem: true, w: 0.8, hours: [6, 10] },                                      // milk and cheese
  pasties: { cry: [[2, 0.3, 'o'], [2, 0.3, 'o'], [5, 0.5, 'a'], [2, 1.0, 'u']], fem: null, w: 1.0, hours: [10.5, 19] },                 // hot pasties and peas
  wine: { cry: [[0, 0.4, 'a'], [5, 0.4, 'a'], [7, 1.3, 'e']], fem: false, w: 1.0, hours: [9, 19], base: 190 },                          // the criers of the taverns' wine
  wafers: { cry: [[9, 0.25, 'u'], [9, 0.25, 'u'], [12, 0.35, 'i'], [14, 0.3, 'i'], [9, 0.3, 'a'], [5, 1.0, 'a']], fem: true, w: 1.2, hours: [16, 19.5] }, // the pastry sellers' wafers, last of the day
  bell: { inst: 'handbell', w: 0.5, hours: [8, 18] },                                                                                    // a crier with a handbell (for the dead, or to call a sale)
};
export function pickCry(hour, rnd = R()) {
  const list = Object.entries(CRIES).map(([k, T]) => [k, inHours(hour, T.hours) ? T.w : 0]);
  const tot = list.reduce((s, [, w]) => s + w, 0);
  if (tot <= 0) return null;
  let x = rnd * tot;
  for (const [k, w] of list) if ((x -= w) <= 0 && w > 0) return k;
  return list.find(([, w]) => w > 0)[0];
}
/** Notre-Dame's bells (a deep one for the hours of the night and the curfew, a middle one for the offices) and the plainsong's recitation tone. */
const ND = { deep: 117, mid: 147, high: 196 };

SEASON_OF.swift ||= [118, 238, 12];

export const PARIS_VOICES = {
  // ── the Seine ───────────────────────────────────────────────────────────────
  /**
   * A boat of the water-merchants on the arm nearest the listener: oars working in their rowlocks (the knock of the loom on its pin, the dip and
   * the drip), or a pole set on the bed, the hull's wash, a call from the stern now and then. The emitter that schedules it is only the clock.
   */
  seineBoat(t, bus, lv) {
    const M = mapOf(this), l = this.lis(), tr = M?.riverTrack(l.x, l.z, R);
    if (!tr) return 0.1;
    const speed = 0.9 + R() * 0.5, f = this.along(tr.pts, speed), b = this.src(f, 16, { dur: f.dur + 2 }), poling = R() < 0.35, T = poling ? 3.1 + R() : 1.9 + R() * 0.5;
    for (let k = 0, n = Math.floor(f.dur / T); k < n; k++) {
      const w = t + 0.05 + k * T;
      if (poling) this.cue(w, (x) => { this.knock(x, 190, 0.05 * lv, b, 0.12); this.burst(x + 0.05, 0.5, 520, 0.8, 0.03 * lv, b, 0.05); this.cue(x + 1.4, (y) => this.drip(y, lv * 0.6, b)); });
      else {
        this.cue(w, (x) => { this.knock(x, 310, 0.045 * lv, b, 0.07); this.burst(x + 0.08, 0.35, 900, 0.9, 0.035 * lv, b, 0.03); });                  // the pull: the oar leans on its thole pin, the blade bites
        this.cue(w + T * 0.55, (x) => { this.burst(x, 0.5, 1300, 0.7, 0.02 * lv, b, 0.1); if (R() < 0.6) this.drip(x + 0.3, lv * 0.7, b); });           // the recovery: the blade lifted dripping
      }
    }
    this.rasp(t, f.dur, 480, 0.6, 0.012 * lv, b, 0.6, 0.8);                                                                                              // the hull's wash
    if (R() < 0.5) this.cue(t + f.dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 150 * (0.92 + R() * 0.16), [[0, 0.3, 'o'], [5, 0.8, 'a'], [2, 0.5, 'o'], [-2, 0.9, 'u']], 0.045 * lv, b, { cutoff: 4000 }));
    b.emitter.until = t + f.dur + 2;
    return f.dur;
  },
  /** A water-mill hung under the Grand Pont: the wheel's paddles slapping the race in turn, the stones' low rumble under it, the hopper's clapper knocking. */
  mill(t, bus, lv) {
    const dur = 12 + R() * 6, p = 0.62 + R() * 0.06, n = Math.floor(dur / p);
    this.rasp(t, dur, 160, 0.7, 0.03 * lv, bus, 3.2, 0.5);                                                                                              // the millstones: a low grinding
    for (let k = 0; k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.22, 900 + R() * 300, 0.7, 0.09 * lv, bus); this.tone(x, [[0, 150], [0.1, 90]], 0.14, 0.02 * lv, bus); });   // a paddle enters the water
    for (let k = 0, m = Math.floor(dur / 0.31); k < m; k++) this.cue(t + k * 0.31, (x) => this.knock(x, 1250, 0.012 * lv, bus, 0.03));                   // the clapper on the hopper's shoe
    return dur;
  },
  /** Washerwomen's beetles on wet linen at the strand: dull wet slaps in the rhythm of two or three women out of step, the splash of a rinse. */
  washer(t, bus, lv) {
    const women = 2 + Math.floor(R() * 2);
    let end = 0;
    for (let i = 0; i < women; i++) {
      const p = 0.78 + R() * 0.3, n = 5 + Math.floor(R() * 8), t0 = t + R() * 1.2;
      for (let k = 0; k < n; k++) this.cue(t0 + k * p, (x) => { this.tone(x, [[0, 260 + R() * 40], [0.05, 130]], 0.09, 0.025 * lv, bus); this.burst(x, 0.09, 1100, 0.7, 0.07 * lv, bus); });
      this.cue(t0 + n * p + 0.4, (x) => this.burst(x, 0.5, 800, 0.8, 0.03 * lv, bus, 0.04));
      end = Math.max(end, t0 + n * p - t + 1);
    }
    return end;
  },

  // ── the shops' work ─────────────────────────────────────────────────────────
  /** A cooper driving a hoop down a barrel with his mallet on the driver: a run of hard knocks with the hollow barrel ringing under each. */
  cooperTap(t, bus, lv) {
    const n = 5 + Math.floor(R() * 6);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.38 + R() * 0.08), (x) => { this.knock(x, 520 + R() * 40, 0.07 * lv, bus, 0.06); this.tone(x, [[0, 150], [0.2, 118]], 0.3, 0.025 * lv, bus, 'sine'); });
    return n * 0.42 + 0.3;
  },
  /** A goldsmith's small hammer on a sheet and the chasing punch: a quick light tapping in groups, a bright thin ring. */
  goldTap(t, bus, lv) {
    let w = t;
    for (let g = 0, G = 2 + Math.floor(R() * 3); g < G; g++) {
      for (let k = 0, n = 4 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => this.struck(x, 2600 * (0.96 + R() * 0.08), 0.022 * lv, bus, [[1, 1, 0.09], [2.7, 0.4, 0.05]])); w += 0.16 + R() * 0.05; }
      w += 0.9 + R() * 0.8;
    }
    return w - t;
  },
  /** A butcher's cleaver through a joint and the chopping block: the thud, the knock of the blade on the block, now and then a second stroke. */
  cleaver(t, bus, lv) {
    const n = 1 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.6 + R() * 0.3), (x) => { this.tone(x, [[0, 190], [0.06, 85]], 0.12, 0.07 * lv, bus); this.knock(x, 420, 0.04 * lv, bus, 0.05); this.burst(x, 0.05, 1800, 1, 0.025 * lv, bus); });
    return n * 0.9 + 0.3;
  },
  /** A shoemaker's awl and the pull of waxed thread, with the tap of the hammer on the sole: tap tap, a draw, tap. */
  awl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.knock(x, 1050 + R() * 80, 0.035 * lv, bus, 0.04));
      this.cue(w + 0.22, (x) => this.rasp(x, 0.25, 3000, 0.9, 0.012 * lv, bus, 30, 0.8));
      this.cue(w + 0.55, (x) => { this.knock(x, 640, 0.05 * lv, bus, 0.05); this.knock(x + 0.14, 640, 0.04 * lv, bus, 0.05); });
      w += 1.2 + R() * 0.4;
    }
    return w - t;
  },
  /** A baker's oven: the iron door clashing open, the peel scraping the hearth stones, loaves set on the board, the door shut. */
  ovenDoor(t, bus, lv) {
    this.struck(t, 520, 0.05 * lv, bus, [[1, 1, 0.3], [2.3, 0.5, 0.18], [3.9, 0.3, 0.1]]);
    this.cue(t + 0.5, (x) => this.rasp(x, 0.9, 700, 0.8, 0.035 * lv, bus, 7, 0.9));
    for (let k = 0; k < 4; k++) this.cue(t + 1.6 + k * 0.5, (x) => this.knock(x, 230, 0.04 * lv, bus, 0.08));
    this.cue(t + 4, (x) => this.struck(x, 480, 0.045 * lv, bus, [[1, 1, 0.26], [2.3, 0.5, 0.15]]));
    return 4.6;
  },
  /** A chandler's tallow: the dull glug of the vat's ladle and the drip from the dipped wicks. */
  tallow(t, bus, lv) {
    this.tone(t, [[0, 190], [0.18, 130]], 0.24, 0.025 * lv, bus, 'sine', ['lowpass', 500]);
    for (let k = 0; k < 5; k++) this.cue(t + 0.5 + k * 0.4, (x) => this.drip(x, lv * 0.5, bus));
    return 3;
  },
  /** A fishmonger's slab: a fish slapped down, a bucket sloshed, the knife's scrape. */
  fishSlap(t, bus, lv) {
    this.burst(t, 0.1, 420, 0.7, 0.07 * lv, bus); this.tone(t, [[0, 210], [0.05, 120]], 0.1, 0.03 * lv, bus);
    this.cue(t + 0.7, (x) => this.burst(x, 0.5, 900, 0.8, 0.03 * lv, bus, 0.06));
    this.cue(t + 1.6, (x) => this.rasp(x, 0.5, 2400, 0.9, 0.012 * lv, bus, 26, 0.8));
    return 2.4;
  },
  /** A horse stamping at the rail, shaking its harness: a heavy hoof, a snort, the jingle of the bit-rings. */
  stamp(t, bus, lv) {
    this.tone(t, [[0, 120], [0.07, 70]], 0.12, 0.06 * lv, bus); this.burst(t, 0.06, 900, 1.5, 0.04 * lv, bus);
    this.cue(t + 0.7, (x) => { this.burst(x, 0.35, 700, 0.9, 0.02 * lv, bus, 0.05); this.tone(x, [[0, 160], [0.2, 120]], 0.3, 0.012 * lv, bus, 'sawtooth', ['bandpass', 400, 2]); });
    for (let k = 0; k < 5; k++) this.cue(t + 1.3 + k * 0.06, (x) => this.struck(x, 3400 + k * 300, 0.006 * lv, bus, [[1, 1, 0.12]]));
    return 2.2;
  },
  /** A pig grunting and rooting at the strand, a short squeal now and then. */
  pig(t, bus, lv) {
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.45 + R() * 0.3), (x) => this.tone(x, [[0, 105 + R() * 25], [0.12, 80]], 0.2, 0.03 * lv, bus, 'sawtooth', ['bandpass', 380, 2]));
    if (R() < 0.3) this.cue(t + 2.5, (x) => this.tone(x, [[0, 600], [0.15, 1250], [0.45, 700]], 0.5, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1500, 2]));
    return 4;
  },
  /** A swift or two screaming round the towers: a thin rising and falling "sree", in the months they are here (April to August). */
  swift(t, bus, lv) {
    if (seasonOf('swift', this.seasonDoy()) < 0.2) return 0.1;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) this.cue(t + k * (0.5 + R() * 0.5), (x) => this.tone(x, [[0, 4200 + R() * 500], [0.2, 5600], [0.5, 4300]], 0.55, 0.008 * lv, bus, 'sine', ['bandpass', 5000, 1.5]));
    return 3;
  },

  // ── the streets ─────────────────────────────────────────────────────────────
  /** A bell of the hand: a crier's, rung in a quick double stroke, repeated as he walks. */
  handbell(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * 0.55, (x) => { this.struck(x, 1480, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.45, 0.3], [4.1, 0.2, 0.15]]); this.struck(x + 0.11, 1560, 0.016 * lv, bus, [[1, 1, 0.45], [2.4, 0.4, 0.25]]); });
    return 3.6;
  },
  /** A crier of the streets on the rue nearest the listener, walking: his trade's cry (by the hour) every few seconds. */
  parisCry(t, bus, lv) {
    const M = mapOf(this), l = this.lis(), hour = this.plc.hourNow ?? l.hour ?? 12, k = pickCry(hour);
    const tr = k && M?.walkTrack(l.x, l.z, R, 80, 30);
    if (!tr) return 0.1;
    const T = CRIES[k], f = this.along(tr.pts, 0.95), b = this.src(f, 11, { dur: f.dur + 2 }), gap = T.inst ? 6 + R() * 3 : 8 + R() * 4;
    for (let w = t + 0.05; w < t + f.dur - 3; w += gap + R() * 3) {
      const fem = T.fem === null ? R() < 0.5 : T.fem, f0 = (T.base || (fem ? 300 : 175)) * (0.93 + R() * 0.14);
      this.cue(w, (x) => (T.inst ? this[T.inst](x, b, lv) : this.cry(x, f0, T.cry, 0.05 * lv, b, { fem, cutoff: 4200 })));
    }
    b.emitter.until = t + f.dur + 2;
    return f.dur;
  },
  /** A cart on the cobbles behind a horse: iron tyres rumbling, the hooves' pairs, the axle's creak, the carter's cluck. */
  cart(t, bus, lv) {
    const M = mapOf(this), l = this.lis(), tr = M?.walkTrack(l.x, l.z, R, 90, 40);
    if (!tr) return 0.1;
    const f = this.along(tr.pts, 1.6), b = this.src(f, 14, { dur: f.dur + 2 }), p = 0.52;
    this.rasp(t, f.dur, 240, 0.6, 0.03 * lv, b, 11, 0.8);
    for (let k = 0, n = Math.floor(f.dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.05, 1100, 2.5, 0.05 * lv, b); this.burst(x + 0.12, 0.05, 950, 2.5, 0.04 * lv, b); if (k % 3 === 0) this.tone(x, [[0, 430], [0.2, 520]], 0.25, 0.01 * lv, b, 'sawtooth', ['bandpass', 800, 3]); });
    if (R() < 0.5) this.cue(t + f.dur * 0.5, (x) => this.cry(x, 135, [[0, 0.2, 'o'], [4, 0.5, 'e']], 0.04 * lv, b, { cutoff: 3600 }));
    b.emitter.until = t + f.dur + 2;
    return f.dur;
  },
  /** The night watch, tradesmen on their rotation with staves: three men's shod steps, the staves ringing on the stones, a low challenge. [inferred: no source describes their sound] */
  parisWatch(t, bus, lv) {
    const M = mapOf(this), l = this.lis(), tr = M?.walkTrack(l.x, l.z, R, 90, 36);
    if (!tr) return 0.1;
    const f = this.along(tr.pts, 1.0), b = this.src(f, 12, { dur: f.dur + 2 }), p = 0.62;
    for (let k = 0, n = Math.floor(f.dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.step(x, 0.05 * lv, b, 'clog', 0); this.step(x + 0.07, 0.04 * lv, b, 'clog', 0); if (k % 2) this.knock(x + 0.3, 560, 0.03 * lv, b, 0.07); });
    if (R() < 0.6) this.cue(t + f.dur * (0.3 + 0.4 * R()), (x) => this.cry(x, 118, [[0, 0.35, 'a'], [-2, 0.3, 'a'], [0, 0.6, 'o']], 0.045 * lv, b, { cutoff: 3200 }));
    b.emitter.until = t + f.dur + 2;
    return f.dur;
  },

  // ── the bells and the office ────────────────────────────────────────────────
  /**
   * The bells of the hour (soundscape.js HOURS.paris → audio.js ring): Notre-Dame's north tower first, then the parish churches' small bells
   * answering one after another, each from its place (soundmap BELLS); at the offices the canons' plainsong from the choir. Returns when it ends.
   * kinds: matins (2: the night office, one slow bell), lauds (5), prime, terce, sext, none, vespers, curfew (7:30 at the equinox: the bells' daily curfew,
   * "at seven in the evening in winter and eight in summer" [stated: Wikipedia "Paris in the Middle Ages"]).
   */
  parisBells(kind, t0) {
    const M = mapOf(this);
    if (!M?.BELLS) return t0;
    const B = M.BELLS, L = { matins: [ND.deep, 9, 4.6, 0.5], lauds: [ND.mid, 9, 3.2, 0.6], curfew: [ND.deep, 22, 2.6, 0.9] }[kind] || [ND.mid, 3, 2.4, 0.7];
    const nd = this.src(B.nd, 95, { dur: 80 });
    let end = t0;
    for (let k = 0; k < L[1]; k++) { this.cue(t0 + k * L[2], (x) => this.strike(x, k % 2 && kind !== 'curfew' ? ND.high : L[0], 0.05 * L[3], nd, 1.2)); end = t0 + k * L[2] + 4; }
    nd.emitter.until = end + 2;
    // the parish bells answer: each a small bell rung in a quick run, a few seconds after the last, from its own side of the town
    if (kind !== 'matins') B.parish.forEach(([x, z, f], i) => {
      const bus = this.src([x, z], 70, { dur: 40 }), w0 = t0 + 3 + i * 3.1 + R() * 2, n = kind === 'curfew' ? 12 : 8;
      for (let k = 0; k < n; k++) this.cue(w0 + k * (0.9 + 0.05 * R()), (q) => this.strike(q, f, 0.022, bus, 0.45));
      bus.emitter.until = w0 + n + 4; end = Math.max(end, w0 + n + 3);
    });
    // the office sung in the choir (not at the night's matins, not at the curfew)
    if (!['matins', 'curfew'].includes(kind)) end = Math.max(end, this.plainsong(end + 2, B.choir, 'nd'));
    return end;
  },
  /** An office's plainsong: verses recited on one note by the choir in unison, an inflection at the middle and the end of each verse; wordless, in the Dorian mode on D. Returns the end. */
  plainsong(when, at, inside) {
    const bus = this.src(at, 26, { dur: 70, inside }), f0 = 147, tone = 0;
    let w = when;
    const syl = ['a', 'e', 'o', 'u', 'i'];
    for (let v = 0, V = 5 + Math.floor(R() * 3); v < V; v++) {
      const half = (n, last) => {
        const notes = [];
        for (let k = 0; k < n; k++) notes.push([tone, 0.2 + R() * 0.1, syl[Math.floor(R() * syl.length)]]);
        notes.push([tone + 2, 0.3, 'e'], [tone - 2, 0.5, 'o'], last ? [tone - 3, 1.0, 'u'] : [tone - 2, 0.6, 'a']);
        return notes;
      };
      for (const [n, last] of [[7 + Math.floor(R() * 3), false], [6 + Math.floor(R() * 3), true]]) {
        const notes = half(n, last), dur = notes.reduce((s, q) => s + q[1], 0);
        const x = w;
        this.cue(x, (q) => this.cry(q, f0, notes, 0.03, bus, { cutoff: 2600 }));
        this.cue(x, (q) => this.cry(q, f0 / 2, notes, 0.02, bus, { cutoff: 1800 }));       // the octave below: the basses
        w += dur + 0.7;
      }
    }
    bus.emitter.until = w + 3;
    return w + 3;
  },
};
addVoices('voices-paris.js', PARIS_VOICES);
