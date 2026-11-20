// Voices of Giza about 2560 BC (docs/settlements/giza.md §20), added to the placed voices of voices.js through addVoices: the mallet on the copper chisel
// and the dolerite pounder of the stone-workers, the haulers' chant over the rope and the sledge's runners on wet sand, the women's washing slapped on the quay's
// stones, the bread pots' lids and the fire under them, the beer poured and stirred. Each a method `name(t, bus, lv)` of Music returning how long it lasts;
// everything is synthesised, nothing sampled [inferred throughout: no recording of Old Kingdom Egypt exists; the crafts are those the tomb scenes and the
// excavations show, the chant and the beat are ours].
const R = Math.random;

export const GIZA_VOICES = {
  /** The mallet (wood) on the copper chisel dressing limestone: a run of sharp ticks, each with a dull wooden knock under it; a pause and another run. */
  gizMallet(t, bus, lv) {
    let w = t;
    for (let g = 0, ng = 1 + Math.floor(R() * 2); g < ng; g++) {
      for (let k = 0, n = 5 + Math.floor(R() * 7); k < n; k++) {
        this.cue(w, (x) => { this.knock(x, 520 + R() * 80, 0.05 * lv, bus, 0.04); this.burst(x, 0.012, 3600 + R() * 600, 3, 0.05 * lv, bus); });
        w += 0.3 + R() * 0.07;
      }
      w += 0.8 + R() * 0.8;
    }
    return w - t + 0.3;
  },
  /** The dolerite pounder on the quarry's rock: slow, heavy thuds with a rattle of chips after each. */
  gizPounder(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 130 + R() * 20, 0.08 * lv, bus, 0.12); this.burst(x + 0.04, 0.2, 1800, 1.2, 0.02 * lv, bus, 0.01); });
      w += 0.65 + R() * 0.15;
    }
    return w - t + 0.5;
  },
  /** The haulers on the rope: the leader's call and the gang's answer on the pull, the rope's creak and the runners' grating on wet sand, five or six pulls. */
  gizHaul(t, bus, lv) {
    const f0 = 120 * (0.94 + R() * 0.12), beat = 1.5 + R() * 0.3, n = 4 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const w = t + k * beat;
      this.cue(w, (x) => this.cry(x, f0, [[0, 0.3, 'e'], [4, 0.6, 'o']], 0.05 * lv, bus, { cutoff: 3400 }));
      this.cue(w + 0.75, (x) => { this.cry(x, f0 * 0.9, [[0, 0.25, 'a'], [0, 0.45, 'o']], 0.05 * lv, bus, { cutoff: 2600 }); this.cry(x, f0 * 1.12, [[0, 0.25, 'a'], [0, 0.45, 'o']], 0.035 * lv, bus, { cutoff: 2600 }); });
      this.cue(w + 0.7, (x) => this.rasp(x, 0.7, 420, 0.7, 0.03 * lv, bus, 9, 0.6));
    }
    this.creak(t + 0.2, lv * 0.7, bus, true);
    return n * beat + 0.8;
  },
  /** Women washing linen at the quay: wet cloth slapped on stone, a splash and the water running off, a few times. */
  gizWash(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 230 + R() * 40, 0.05 * lv, bus, 0.06); this.burst(x + 0.03, 0.25, 900, 0.8, 0.04 * lv, bus, 0.01); });
      if (R() < 0.5) this.cue(w + 0.5, (x) => this.drip(x, lv * 0.7, bus));
      w += 0.55 + R() * 0.4;
    }
    return w - t + 0.4;
  },
  /** The bread pots: a lid set down on a hot pot (a clay clink), the fire's crackle under them. */
  gizPots(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 2 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.knock(x, 880 + R() * 200, 0.04 * lv, bus, 0.03); this.burst(x, 0.04, 3400, 3, 0.03 * lv, bus); });
      this.cue(w + 0.1, (x) => this.rasp(x, 0.5, 2600, 0.6, 0.012 * lv, bus, 60, 0.9));
      w += 1.2 + R() * 1.6;
    }
    return w - t + 0.5;
  },
  /** Beer: mash stirred in the vat (a slow hollow slosh) and poured into a jar. */
  gizBrew(t, bus, lv) {
    for (let k = 0; k < 4; k++) this.cue(t + k * 0.8, (x) => this.burst(x, 0.5, 420, 0.7, 0.03 * lv, bus, 0.15));
    this.cue(t + 3.6, (x) => this.pour(x, bus, lv * 0.8));
    return 5;
  },
};
export const GIZA_GAIN = { gizMallet: 2.0, gizPounder: 1.3, gizHaul: 1.3, gizWash: 2.0, gizPots: 3.0, gizBrew: 2.4 };
