// The voices of Florence about 1480 that no other place has (docs/settlements/florence.md §18), added to the audio engine's placed voices
// (voices.js puts them on Music's prototype): the stalls' cries of the Mercato Vecchio, the chain on the column of Abundance, a butcher's
// cleaver, the Arno's weirs. Each is a method `name(t, bus, lv)` made of the engine's own tools (rasp, cry, clink, knock, burst), as the other
// voices are; it returns how long it lasts. Wordless, as the street cries are: only vowels on a contour. [inferred throughout: no recording.]

const R = Math.random;

/** The cries of the stalls: a contour of [semitones above the voice's base, seconds, vowel], wordless; the sellers' own, each with its trade's fall or climb. */
export const MARKET_CRIES = [
  [[0, 0.3, 'a'], [4, 0.3, 'a'], [7, 0.9, 'o'], [5, 0.45, 'o']],           // the greengrocers': a climb, held, and a drop
  [[7, 0.25, 'e'], [4, 0.25, 'e'], [0, 1.0, 'a']],                        // the fishmongers': from high to low
  [[0, 0.5, 'o'], [3, 0.35, 'o'], [0, 0.35, 'o'], [-3, 1.1, 'u']],        // the butchers': low, a rock and a fall
  [[5, 0.2, 'i'], [9, 0.2, 'i'], [5, 0.2, 'i'], [9, 0.2, 'i'], [2, 0.9, 'a']], // the poultry sellers': two notes tossed to and fro
];

export const VOICES_FLORENCE = {
  /** A seller's call across the market: one of the contours, in a man's voice (a woman's now and then), now and then answered. */
  marketCry(t, bus, lv) {
    const k = Math.floor(R() * MARKET_CRIES.length), fem = R() < 0.3, base = fem ? 235 : 135 * (0.92 + R() * 0.16);
    this.cry(t, base, MARKET_CRIES[k], 0.07 * lv, bus, { cutoff: 3800, fem });
    const len = MARKET_CRIES[k].reduce((s, n) => s + n[1], 0);
    if (R() < 0.3) this.cue(t + len + 0.6 + R() * 0.8, (x) => this.cry(x, 120 * (0.95 + R() * 0.1), MARKET_CRIES[(k + 1) % MARKET_CRIES.length], 0.04 * lv, bus, { cutoff: 3400 }));
    return len + 2;
  },
  /** The chain on the column of Abundance shaken by the officer who opens the market: a rattle of links, a few ticks as it settles. */
  chainRattle(t, bus, lv) {
    for (let k = 0; k < 7; k++) this.cue(t + k * (0.055 + R() * 0.03), (x) => this.clink(x, 0.012 * lv, bus));
    this.rasp(t, 0.5, 2600, 1.2, 0.012 * lv, bus, 40, 0.9);
    for (let k = 0; k < 3; k++) this.cue(t + 0.7 + k * 0.2, (x) => this.clink(x, 0.005 * lv, bus));
    return 1.6;
  },
  /** A cleaver on a butcher's block: a heavy chop and the block's hollow answer, twice or three times. */
  floCleaver(t, bus, lv) {
    const n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) this.cue(t + k * (0.32 + R() * 0.12), (x) => { this.knock(x, 170 * (0.9 + R() * 0.2), 0.07 * lv, bus, 0.1); this.burst(x, 0.03, 1900, 0.9, 0.03 * lv, bus); });
    return n * 0.45 + 0.4;
  },
  /** The rush of water over a weir: two broad bands, slowly swelling, long enough that one overlaps the next (the emitter's gap is shorter than it lasts). */
  weir(t, bus, lv) {
    this.rasp(t, 13, 380, 0.5, 0.03 * lv, bus, 0.33, 0.5);
    this.rasp(t, 13, 1350, 0.7, 0.013 * lv, bus, 0.5, 0.6);
    return 13;
  },
};
