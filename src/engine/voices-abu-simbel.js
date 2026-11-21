// Voices of Abu Simbel about 1255 BC (docs/settlements/abu-simbel.md §20), added to the placed voices of voices.js through addVoices: the copper chisel and
// the mallet on the hard sandstone of the masons' yard (a ring where Giza's limestone gave a tick), and a slide of sand and stones down the cliff's talus.
// Each a method `name(t, bus, lv)` of Music returning how long it lasts; synthesised, nothing sampled [inferred throughout: no recording of Ramesside Nubia exists].
const R = Math.random;

export const ABU_VOICES = {
  /** The copper chisel struck by the mallet on sandstone: runs of bright ticks, each with a short ring of the chisel's steel-less copper and a dull wooden knock under it. */
  abuChisel(t, bus, lv) {
    let w = t;
    for (let g = 0, ng = 1 + Math.floor(R() * 2); g < ng; g++) {
      for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) {
        this.cue(w, (x) => {
          this.knock(x, 480 + R() * 70, 0.045 * lv, bus, 0.04);
          this.burst(x, 0.01, 4200 + R() * 700, 4, 0.05 * lv, bus);
          this.tone(x, [[0, 1750 + R() * 350]], 0.12, 0.012 * lv, bus, 'sine');
        });
        w += 0.34 + R() * 0.1;
      }
      w += 0.9 + R() * 1.0;
    }
    return w - t + 0.4;
  },
  /** A slide of sand and pebbles down the talus under the cliff: a hiss that swells and thins, a few stones knocking. */
  abuSand(t, bus, lv) {
    const d = 2.2 + R() * 1.6;
    this.cue(t, (x) => this.burst(x, d, 2600 + R() * 600, 0.9, 0.02 * lv, bus, d * 0.25));
    for (let k = 0, n = 4 + Math.floor(R() * 6); k < n; k++) this.cue(t + R() * d, (x) => this.knock(x, 260 + R() * 260, 0.025 * lv, bus, 0.05));
    return d + 0.6;
  },
};
export const ABU_GAIN = { abuChisel: 2.0, abuSand: 1.6 };
