// The voices of Venice's own sounds (docs/settlements/venice.md §5f.3), added to the engine's placed voices (src/engine/voices.js VOICES) by name,
// each only where not yet defined: the gondolier's oar and his call, the walker over a bridge's steps, the hawker's cry, the pigeons of the piazza, the
// choir of San Marco, the caulkers' mallets, the Arsenal's yard heard far off, the trades of the Procuratie's shops, the night patrol. Synthesised from
// the engine's own tools (noise, oscillators, struck partials, the formant `cry`); no samples. Each is `name(t, bus, lv[, track])`, made from `t` into `bus`,
// returning how long it lasts. [inferred throughout: no recording of Venice about 1500 exists; what each sound is of is sourced in the dossier §5f.3.]
import { VOICES, GAIN } from '../../engine/voices.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

/** The hawkers' cries: [semitones above the voice's base, seconds, vowel]. The words are not sung (the engine's cry is wordless): a fall, a rise and fall, a climb. */
const CRIES = [
  [[2, 0.3, 'o'], [7, 0.45, 'e'], [4, 0.35, 'e'], [0, 1.1, 'a']],
  [[0, 0.35, 'a'], [5, 0.3, 'a'], [4, 0.9, 'i'], [0, 0.8, 'o']],
  [[4, 0.28, 'e'], [4, 0.28, 'e'], [9, 0.5, 'a'], [5, 0.3, 'o'], [0, 1.0, 'o']],
];

const V = {
  /** A gondola's forcola oar along `f.pts`: a stroke every three seconds or so (a creak of the oar in its rest, the blade's swirl, the drops off it), the bow's wash, the gondolier's call òe now and then and another's answer. */
  venGondola(t, bus, lv, f) {
    const dur = f.dur, T = 2.7 + R() * 0.7, n = Math.floor(dur / T);
    for (let k = 0; k < n; k++) {
      const w = t + k * T;
      this.cue(w, (x) => { this.creak(x, lv * 0.75, bus, true); this.burst(x + 0.15, 0.8, 360, 0.7, 0.03 * lv, bus, 0.25); this.cue(x + 0.7, (y) => { this.drip(y, lv, bus); this.drip(y + 0.12 + R() * 0.1, lv * 0.8, bus); }); });
      this.cue(w + T * 0.55, (x) => { this.burst(x, 0.5, 520, 0.8, 0.016 * lv, bus, 0.15); if (R() < 0.4) this.lap(x + 0.05, lv * 0.5, bus); });
    }
    this.rasp(t, dur, 480, 0.6, 0.01 * lv, bus, 0.6, 0.8);                  // the hull's wash, a long breath
    if (R() < 0.55) {
      const at = t + dur * (0.3 + 0.3 * R()), f0 = 135 * (0.92 + R() * 0.16);
      this.cue(at, (x) => this.cry(x, f0, [[3, 0.3, 'o'], [5, 0.25, 'o'], [0, 1.0, 'e'], [-2, 0.7, 'e']], 0.05 * lv, bus, { cutoff: 4000 }));        // òe!
      if (R() < 0.6) this.cue(at + 2.6 + R(), (x) => this.cry(x, f0 * 0.88, [[3, 0.3, 'o'], [0, 1.2, 'e']], 0.04 * lv, bus, { cutoff: 3600 }));      // answered from the next canal
    }
    return dur;
  },
  /** A walker or two over the steps of a bridge: the thump of the step with the hollow of the arch under it; a woman in her high pattens clacks. */
  venCross(t, bus, lv, f) {
    const dur = f.dur, pace = 0.5 + R() * 0.12, shoe = R() < 0.4 ? 'clog' : 'cloth', n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) this.cue(t + k * pace * (1 + (R() - 0.5) * 0.08), (x) => this.step(x, 0.05 * lv, bus, shoe, 0.7));
    return dur;
  },
  /** A hawker's cry, sung two or three times, along a street (with `f`) or from where he stands. */
  venCry(t, bus, lv, f) {
    const c = pick(CRIES), f0 = (110 + R() * 45), n = f ? Math.max(1, Math.min(3, Math.floor(f.dur / 6))) : 1 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * 5.5, (x) => this.cry(x, f0 * (1 + 0.02 * k), c, 0.05 * lv, bus, { cutoff: 3800 }));
    return f ? f.dur : n * 5.5;
  },
  /** Pigeons: a flock lifting (a clatter of wings that thins out), the cooing of the rest. */
  venPigeons(t, bus, lv) {
    const n = 10 + Math.floor(R() * 8);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.05 + R() * 0.03) * (1 + k * 0.05), (x) => this.burst(x, 0.05, 2200 + R() * 900, 1.2, 0.03 * lv * (1 - k / (n * 1.4)), bus));
    for (let k = 0, w = t + 1.2; k < 5; k++, w += 0.9 + R() * 1.4) this.cue(w, (x) => { const f0 = 420 + R() * 120; this.tone(x, [[0, f0], [0.12, f0 * 1.25], [0.32, f0 * 0.9]], 0.4, 0.014 * lv, bus, 'sine'); this.tone(x + 0.45, [[0, f0 * 0.95], [0.2, f0]], 0.26, 0.01 * lv, bus, 'sine'); });
    return 6;
  },
  /** The choir of San Marco: plainsong on a reciting tone, two voices a fifth apart, answered across the church by a second choir (polychoral, as under Willaert at St Mark's). */
  venChoir(t, bus, lv) {
    const f0 = 118 * (0.95 + R() * 0.1), line = [[0, 2.4, 'o'], [0, 1.8, 'a'], [-2, 2.2, 'a'], [-5, 3.2, 'o']], second = [[0, 2.2, 'a'], [2, 2.0, 'o'], [0, 2.6, 'a'], [-3, 3.4, 'o']];
    this.cue(t, (x) => { this.cry(x, f0, line, 0.04 * lv, bus, { cutoff: 2600 }); this.cry(x, f0 * 1.5, line, 0.022 * lv, bus, { cutoff: 2600 }); });
    this.cue(t + 8.5, (x) => { this.cry(x, f0 * 1.12, second, 0.035 * lv, bus, { cutoff: 2400 }); this.cry(x, f0 * 0.75, second, 0.03 * lv, bus, { cutoff: 2400 }); });
    return 20;
  },
  /** The squero: caulkers' mallets on their irons, a steady tok-tok with a pause. */
  venCaulk(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 8); k < n; k++) { this.cue(w, (x) => { this.knock(x, 880 + R() * 120, 0.04 * lv, bus, 0.05); this.burst(x, 0.02, 3200, 2, 0.02 * lv, bus); }); w += k % 3 === 2 ? 0.55 : 0.3 + R() * 0.04; }
    return w - t + 0.3;
  },
  /** The Arsenal's yard, far off to the east: a scatter of mallets and adzes, a saw's rasp under them. */
  venShipyard(t, bus, lv) {
    this.rasp(t, 5, 650, 0.8, 0.012 * lv, bus, 7, 0.9);
    for (let k = 0; k < 18; k++) this.cue(t + R() * 5, (x) => this.knock(x, 380 + R() * 260, 0.03 * lv, bus, 0.07));
    return 5.5;
  },
  /** The goldsmith's chasing hammer: quick small taps on the metal, a ring to end. */
  venGold(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 6 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => this.struck(x, 2500 + R() * 400, 0.018 * lv, bus, [[1, 1, 0.05], [2.7, 0.3, 0.03]])); w += 0.13 + R() * 0.05; }
    this.cue(w + 0.1, (x) => this.struck(x, 3100, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.4, 0.25]]));
    return w - t + 0.7;
  },
  /** Glass: a vessel touched against another, a long thin ring. */
  venGlass(t, bus, lv) {
    const f = 1500 + R() * 700;
    this.struck(t, f, 0.02 * lv, bus, [[1, 1, 0.9], [2.32, 0.5, 0.5], [4.1, 0.2, 0.25]]);
    this.struck(t + 0.16, f * 1.19, 0.014 * lv, bus, [[1, 1, 0.7], [2.4, 0.4, 0.3]]);
    return 1.3;
  },
  /** The shoemaker's tacks: a run of quick light hammer blows, a pause, another. */
  venCobbler(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 8 + Math.floor(R() * 6); k < n; k++) { this.cue(w, (x) => this.knock(x, 1500 + R() * 200, 0.03 * lv, bus, 0.03)); w += k % 4 === 3 ? 0.6 : 0.16 + R() * 0.03; }
    return w - t + 0.3;
  },
  /** The baker: the peel scraped over the oven's floor, loaves knocked hollow. */
  venBake(t, bus, lv) {
    this.rasp(t, 0.7, 1400, 0.8, 0.015 * lv, bus, 12, 0.7);
    for (let k = 0; k < 3; k++) this.cue(t + 1 + k * 0.4, (x) => this.knock(x, 330 + R() * 40, 0.035 * lv, bus, 0.1));
    return 2.5;
  },
  /** The night patrol along a street: two men's steps a little out of time, the clink of a ring of keys or a scabbard now and then. */
  venPatrol(t, bus, lv, f) {
    const dur = f.dur, pace = 0.62, n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) {
      this.cue(t + k * pace, (x) => { this.step(x, 0.045 * lv, bus, 'cloth', 0.1); this.step(x + 0.09 + R() * 0.05, 0.04 * lv, bus, 'cloth', 0); if (k % 3 === 2) this.clink(x + 0.05, 0.012 * lv, bus); });
    }
    return dur;
  },
};
for (const [k, v] of Object.entries(V)) if (!VOICES[k]) VOICES[k] = v;
Object.assign(GAIN, { venGondola: 1.3, venChoir: 1.1, venShipyard: 1.3 });
export const VENICE_VOICES = Object.keys(V);
