// The voices of Vienna in spring 1902 (docs/settlements/vienna.md §15.2), added to the placed voices of voices.js through addVoices: the electric tram of the
// Ring, the Fiaker on the setts, the Stadtbahn's steam train, the Angelus from the Karlskirche, the Werkelmann in the courtyard, the Maroni seller, the Naschmarkt,
// the coffee house with its billiard and its piano, the Heuriger's Schrammelmusik, the shops at work, the Opera's tuning, the Secession's hall.
// Each is a method `name(t, bus, lv)` of the audio engine's Music, scheduled from the fixed emitters and the passing tracks of the map
// (src/settlements/vienna/soundmap.js); the tracks' voices get the moving path as a fourth argument. Every name carries the prefix `vie`.
// All synthesised (noise, oscillators, formant filters, struck partials): no samples, nothing to credit. [inferred throughout: no recording of 1902 is used; the
// trades, instruments and calls are general knowledge of Vienna and every melody is ours, no word is sung.]

import { addVoices, inHours } from './voices.js';

const R = Math.random;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** One horse's pair of shoes on the setts: the iron's tick and the ring of it. */
function hoof(m, x, bus, lv, heavy) {
  m.burst(x, 0.045, heavy ? 1500 : 2300, 2.2, 0.09 * lv, bus);
  m.tone(x, [[0, heavy ? 520 : 780], [0.06, heavy ? 430 : 650]], 0.09, 0.012 * lv, bus, 'triangle');
}
/** The bell's struck partials (hum, prime, tierce, quint, nominal): a church bell of base frequency f. */
const BELL = [[0.5, 0.5, 5], [1, 0.8, 3.5], [1.19, 0.45, 2.5], [1.5, 0.3, 2], [2, 0.55, 1.6]];

export const VIENNA_VOICES = {
  // ── the traffic ─────────────────────────────────────────────────────────────
  /** The electric tram of the Ring: the motor's whine rising as it takes up speed, the joints of the rail clacking under the two bogies, the trolley's hiss, the driver's foot gong. */
  vieTram(t, bus, lv, f) {
    const dur = f?.dur ?? 12, p = 0.8 + R() * 0.15;
    this.tone(t, [[0, 330], [dur * 0.35, 520], [dur, 470]], dur, 0.004 * lv, bus, 'sawtooth', ['lowpass', 1300]);                      // the motor
    this.rasp(t, dur, 150, 0.5, 0.013 * lv, bus, 11, 0.7);                                                                           // the wheels' rumble
    this.rasp(t, dur, 4600, 0.8, 0.004 * lv, bus, 3.1, 0.8);                                                                         // the trolley wheel on the wire
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { this.burst(x, 0.05, 1900, 1.6, 0.06 * lv, bus); this.burst(x + 0.32, 0.05, 1700, 1.6, 0.05 * lv, bus); });   // a joint, front bogie then rear
    for (const d of [0.34, 0.52]) this.cue(t + dur * d, (x) => { this.struck(x, 1180, 0.02 * lv, bus, [[1, 1, 0.5], [2.4, 0.45, 0.3], [3.9, 0.2, 0.15]]); this.struck(x + 0.15, 1240, 0.018 * lv, bus, [[1, 1, 0.45], [2.4, 0.4, 0.25]]); });   // ding-ding
    return dur;
  },
  /** A Fiaker at the trot: two horses' four-beat on the setts, the harness bells, the rubber tyres' hush; a click of the coachman's tongue now and then. */
  vieFiaker(t, bus, lv, f) {
    const dur = f?.dur ?? 6, p = 0.36 + R() * 0.04;
    this.rasp(t, dur, 260, 0.5, 0.007 * lv, bus, 14, 0.6);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => {
      hoof(this, x, bus, lv, false); hoof(this, x + 0.09 + R() * 0.03, bus, lv * 0.8, false);
      if (k % 2 === 0) this.struck(x, 3300 + R() * 900, 0.0035 * lv, bus, [[1, 1, 0.14], [1.7, 0.5, 0.09]]);
    });
    if (R() < 0.4) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.burst(x, 0.05, 1900, 3, 0.03 * lv, bus));
    return dur;
  },
  /** A brewery dray behind two heavy horses: slow hoofs, the iron tyres' rumble, the casks knocking together, the chain. */
  vieDray(t, bus, lv, f) {
    const dur = f?.dur ?? 10, p = 0.66;
    this.rasp(t, dur, 190, 0.5, 0.028 * lv, bus, 9, 0.8);
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => { hoof(this, x, bus, lv, true); hoof(this, x + 0.33, bus, lv * 0.8, true); if (k % 2) { this.knock(x + 0.1, 150, 0.03 * lv, bus, 0.12); this.struck(x, 2200, 0.004 * lv, bus, [[1, 1, 0.15], [2.3, 0.5, 0.1]]); } });
    if (R() < 0.4) this.cue(t + dur * 0.5, (x) => this.cry(x, 118, [[0, 0.3, 'o'], [-2, 0.5, 'o']], 0.04 * lv, bus, { cutoff: 3000 }));
    return dur;
  },
  /** The Stadtbahn's steam train on its ledge by the Wien: the chuff of the engine, the clatter of the carriages, the steam, and a whistle. */
  vieTrain(t, bus, lv, f) {
    const dur = f?.dur ?? 20;
    this.rasp(t, dur, 600, 0.5, 0.012 * lv, bus, 17, 0.8);
    this.rasp(t, dur, 120, 0.5, 0.02 * lv, bus, 6, 0.7);
    for (let w = 0, p = 0.5; w < dur - 1; w += p, p = Math.max(0.24, p - 0.012)) this.cue(t + w, (x) => this.burst(x, 0.14, 300, 0.7, 0.06 * lv, bus));                    // the chuff, quickening as it pulls away
    this.rasp(t, 2.5, 3000, 0.7, 0.008 * lv, bus, 0.8, 0.5);                                                                                                           // steam let off
    if (R() < 0.6) this.cue(t + dur * (0.15 + 0.3 * R()), (x) => this.tone(x, [[0, 760], [1.0, 740]], 1.1, 0.012 * lv, bus, 'sawtooth', ['lowpass', 2000]));   // the whistle
    return dur;
  },
  /** A policeman of the Sicherheitswache on his beat at night: a slow, measured tread in nailed boots; now and then a low cough. */
  vieBeat(t, bus, lv, f) {
    const dur = f?.dur ?? 20, p = 0.64;
    for (let k = 0, n = Math.floor(dur / p); k < n; k++) this.cue(t + k * p, (x) => this.step(x, 0.05 * lv, bus, 'clog', 0.2));
    if (R() < 0.3) this.cue(t + dur * 0.5, (x) => this.cry(x, 118, [[0, 0.3, 'o'], [-2, 0.6, 'o']], 0.025 * lv, bus, { cutoff: 2600 }));
    return dur;
  },
  /** A newspaper boy walking the pavement: the paper's name as a high call, over and over. */
  vieNews(t, bus, lv, f) {
    const dur = f?.dur ?? 20;
    for (let w = t + 0.05; w < t + dur - 3; w += 6 + R() * 4) {
      const f0 = 255 * (0.93 + R() * 0.14);
      this.cue(w, (x) => this.cry(x, f0, [[7, 0.25, 'e'], [12, 0.25, 'a'], [9, 0.35, 'a'], [5, 0.8, 'o']], 0.05 * lv, bus, { cutoff: 4200 }));
    }
    return dur;
  },

  // ── the bells, the courtyard, the market ───────────────────────────────────────
  /** The Angelus from the Karlskirche: three strokes, a pause, three, a pause, three, then the bell rung on for a while. */
  vieAngelus(t, bus, lv) {
    const f = 196 * (0.99 + R() * 0.02);
    let w = t;
    const stroke = (x, k) => this.struck(x, f, 0.05 * lv, bus, BELL.map(([r, a, d]) => [r, a, d * (k ? 0.85 : 1)]));
    for (let g = 0; g < 3; g++) { for (let k = 0; k < 3; k++) { this.cue(w, (x) => stroke(x, 0)); w += 1.7; } w += 2.6; }
    for (let k = 0; k < 14; k++) { this.cue(w, (x) => stroke(x, 1)); w += 1.15 - k * 0.01; }
    return w - t + 4;
  },
  /** The Werkelmann's barrel organ in the Hof: a waltz in three-quarter time on reed pipes, a little sharp, the crank's tick under it, the bass on the first beat. */
  vieWerkelmann(t, bus, lv) {
    const base = 62 + Math.floor(R() * 3), scale = [0, 2, 4, 5, 7, 9, 11], beat = 0.34, bars = 14;
    const pat = [0, 2, 4, 2, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 0];                         // a figure of scale degrees (our own)
    let d = 4;
    for (let b = 0; b < bars; b++) {
      const w = t + b * 3 * beat, bass = b % 4 === 3 ? 7 : 0;
      this.cue(w, (x) => this.tone(x, [[0, mtof(base - 24 + bass) * 1.01]], beat * 1.6, 0.016 * lv, bus, 'sawtooth', ['lowpass', 500]));
      for (const k of [1, 2]) this.cue(w + k * beat, (x) => { for (const n of [4, 7]) this.tone(x, [[0, mtof(base - 12 + n + bass) * 1.01]], beat * 0.8, 0.007 * lv, bus, 'square', ['lowpass', 1400]); });
      for (let k = 0; k < 3; k++) {
        d = Math.max(0, Math.min(pat.length - 1, d + [1, -1, 2, -2, 1, 0][Math.floor(R() * 6)]));
        const n = scale[pat[d] % 7] + (pat[d] >= 7 ? 12 : 0), len = k === 0 && R() < 0.4 ? beat * 1.8 : beat * 0.9;
        if (k === 1 && len > beat) continue;
        this.cue(w + k * beat, (x) => this.tone(x, [[0, mtof(base + 12 + n) * 1.012]], len, 0.014 * lv, bus, 'square', ['lowpass', 2000]));
      }
    }
    const n = Math.floor(bars * 3 * beat / 0.19);
    for (let k = 0; k < n; k++) this.cue(t + k * 0.19, (x) => this.burst(x, 0.012, 900, 2, 0.01 * lv, bus));
    return bars * 3 * beat + 1.5;
  },
  /** A carpet beaten over the frame of the Hof: the cane's thwack and the dull puff of the dust, in runs. */
  vieCarpet(t, bus, lv) {
    let w = t;
    for (let run = 0, n = 1 + Math.floor(R() * 2); run < n; run++) {
      for (let k = 0, m = 4 + Math.floor(R() * 5); k < m; k++) {
        this.cue(w, (x) => { this.burst(x, 0.08, 420, 0.7, 0.1 * lv, bus); this.burst(x, 0.03, 2400, 1.5, 0.03 * lv, bus); this.tone(x, [[0, 120], [0.08, 70]], 0.12, 0.04 * lv, bus, 'sine'); });
        w += 0.5 + R() * 0.2;
      }
      w += 1.5 + R() * 2;
    }
    return w - t + 0.3;
  },
  /** The Maroni seller at his brazier: the call ("Heiße Maroni"), then the chestnuts popping and the scoop on the iron. */
  vieMaroni(t, bus, lv) {
    const f0 = 150 * (0.94 + R() * 0.12);
    this.cue(t, (x) => this.cry(x, f0, [[0, 0.22, 'o'], [4, 0.28, 'e'], [7, 0.3, 'a'], [4, 0.75, 'a']], 0.05 * lv, bus, { cutoff: 3600 }));
    for (let k = 0, n = 5 + Math.floor(R() * 6); k < n; k++) this.cue(t + 1.4 + R() * 2.5, (x) => { this.burst(x, 0.02, 2600 + R() * 1500, 2, 0.03 * lv, bus); if (R() < 0.3) this.knock(x, 700, 0.02 * lv, bus, 0.05); });
    this.cue(t + 4.2, (x) => { this.rasp(x, 0.4, 2400, 0.8, 0.02 * lv, bus, 30, 0.6); this.struck(x + 0.3, 1400, 0.008 * lv, bus, [[1, 1, 0.1]]); });
    return 5.3;
  },
  /** A Marktfrau of the Naschmarkt calling her goods (a falling contour, wordless), a crate set down, the scale's brass, coins. */
  vieMarkt(t, bus, lv) {
    const f0 = 270 * (0.93 + R() * 0.14), kind = Math.floor(R() * 3);
    const contour = [[[9, 0.25, 'a'], [12, 0.2, 'a'], [7, 0.3, 'e'], [4, 0.7, 'a']], [[7, 0.3, 'e'], [7, 0.2, 'e'], [4, 0.5, 'a'], [0, 0.8, 'o']], [[12, 0.2, 'a'], [9, 0.25, 'a'], [9, 0.25, 'e'], [5, 0.9, 'a']]][kind];
    this.cue(t, (x) => this.cry(x, f0, contour, 0.05 * lv, bus, { fem: true, cutoff: 4000 }));
    this.cue(t + 2.2, (x) => { this.knock(x, 190, 0.05 * lv, bus, 0.1); this.rasp(x, 0.2, 1100, 0.9, 0.015 * lv, bus, 30, 0.5); });
    this.cue(t + 3.2, (x) => this.struck(x, 3000, 0.01 * lv, bus, [[1, 1, 0.18], [2.2, 0.5, 0.1]]));
    if (R() < 0.6 && typeof this.coin === 'function') this.cue(t + 4.2, (x) => this.coin(x, bus, lv * 0.8));
    return 5.4;
  },
  /** The drinking fountain: water falling into its basin, a few plinks. */
  vieFountain(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 1900, 0.8, 0.012 * lv, bus, 2.2, 0.5);
    for (let k = 0, n = Math.floor(dur * 2); k < n; k++) this.cue(t + R() * dur, (x) => this.tone(x, [[0, 900 + R() * 700], [0.05, 1500 + R() * 600]], 0.06, 0.006 * lv, bus, 'sine'));
    return dur;
  },
  /** The Haustor shut for the night: the key, the bolt shot home, the leaf of the gate swung to. */
  vieGate(t, bus, lv) {
    this.cue(t, (x) => { this.creak(x, lv * 0.7, bus, false); this.struck(x + 0.7, 2300, 0.012 * lv, bus, [[1, 1, 0.08], [1.5, 0.5, 0.06]]); });
    this.cue(t + 1.3, (x) => { this.struck(x, 3100, 0.01 * lv, bus, [[1, 1, 0.05]]); this.struck(x + 0.12, 2700, 0.01 * lv, bus, [[1, 1, 0.05]]); });
    this.cue(t + 2.0, (x) => { this.knock(x, 110, 0.09 * lv, bus, 0.14); this.burst(x, 0.05, 1200, 1, 0.05 * lv, bus); });
    return 3.2;
  },

  // ── the coffee house ────────────────────────────────────────────────────────
  /** The Kaffeehaus murmur: voices run together, a laugh, cups on saucers, a spoon, the glass of water set down on the marble. */
  vieCafe(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 480 + R() * 160, 0.7, 0.02 * lv, bus, 4.2, 0.8);
    this.rasp(t, dur, 1100, 0.9, 0.008 * lv, bus, 5.8, 0.9);
    for (let k = 0, n = 2 + Math.floor(R() * 3); k < n; k++) this.cue(t + R() * dur, (x) => { this.struck(x, 3300 + R() * 700, 0.006 * lv, bus, [[1, 1, 0.1], [1.6, 0.5, 0.07], [2.9, 0.25, 0.05]]); if (R() < 0.5) this.struck(x + 0.08, 4600, 0.003 * lv, bus, [[1, 1, 0.05]]); });
    if (R() < 0.5) this.cue(t + R() * dur, (x) => { this.knock(x, 240, 0.012 * lv, bus, 0.04); this.struck(x, 1900, 0.004 * lv, bus, [[1, 1, 0.12]]); });     // the glass on the marble
    return dur + 0.5;
  },
  /** Billiard balls: the cue's tick, the two balls' click, one rolling on and dropping into the cushion's thud. */
  vieBilliard(t, bus, lv) {
    this.cue(t, (x) => this.burst(x, 0.012, 2600, 3, 0.03 * lv, bus));
    this.cue(t + 0.5, (x) => { this.burst(x, 0.015, 3600, 4, 0.06 * lv, bus); this.struck(x, 5200, 0.006 * lv, bus, [[1, 1, 0.06], [1.5, 0.4, 0.04]]); });
    if (R() < 0.6) this.cue(t + 1.3, (x) => this.burst(x, 0.015, 3300, 4, 0.04 * lv, bus));
    this.cue(t + 0.8, (x) => this.rasp(x, 1.2, 700, 0.8, 0.008 * lv, bus, 1.2, 0.4));
    this.cue(t + 2.0, (x) => this.knock(x, 220, 0.02 * lv, bus, 0.05));
    return 3;
  },
  /** The coffee house piano in the evening: a waltz's chords and a tune over them, a little tired. */
  viePiano(t, bus, lv) {
    const base = 52 + Math.floor(R() * 4), ch = [[0, 4, 7], [7, 11, 14], [5, 9, 12], [0, 4, 7]], tune = [12, 14, 16, 14, 12, 11, 9, 7];
    let w = t;
    for (let b = 0; b < 4; b++) {
      this.cue(w, (x) => this.tone(x, [[0, mtof(base + ch[b][0] - 12)]], 1.1, 0.014 * lv, bus, 'triangle', ['lowpass', 900]));
      for (const k of [1, 2]) for (const n of ch[b]) this.cue(w + k * 0.45, (x) => this.tone(x, [[0, mtof(base + n)]], 0.55, 0.006 * lv, bus, 'triangle', ['lowpass', 2200]));
      for (let k = 0; k < 2; k++) { const nn = tune[(b * 2 + k) % tune.length]; this.cue(w + 0.45 * k * 1.5, (x) => this.tone(x, [[0, mtof(base + nn) * 1.004]], 0.7, 0.012 * lv, bus, 'triangle', ['lowpass', 3000])); }
      w += 1.35;
    }
    return w - t + 1;
  },
  /** Schrammelmusik at the Heuriger: two violins in thirds, a guitar's strum, the accordion's chord. */
  vieSchrammel(t, bus, lv) {
    const base = 62, line = [0, 2, 4, 5, 4, 2, 0, -3, 0, 4, 7, 5, 4, 2, 0], beat = 0.38;
    let w = t;
    for (let k = 0; k < line.length; k++) {
      const n = line[k], len = k % 3 === 2 ? beat * 1.8 : beat * 0.9, vib = 5.5;
      this.cue(w, (x) => {
        for (const [dn, a] of [[0, 1], [-4, 0.6]]) this.tone(x, [[0, mtof(base + n + dn)], [len * 0.5, mtof(base + n + dn) * 1.004], [len, mtof(base + n + dn)]], len, 0.007 * a * lv, bus, 'sawtooth', ['bandpass', 1800, 0.8]);
        if (k % 3 === 0) { for (const c of [0, 4, 7]) this.tone(x, [[0, mtof(base - 12 + c)]], beat * 2.6, 0.004 * lv, bus, 'sawtooth', ['lowpass', 900]); this.burst(x, 0.05, 700, 1.2, 0.014 * lv, bus); }
      });
      void vib;
      w += k % 3 === 2 ? beat * 1.8 : beat * 0.9 + (k % 3 === 0 ? beat * 0.1 : 0);
    }
    return w - t + 1;
  },

  // ── the shops at work ───────────────────────────────────────────────────────
  /** The baker: the oven's iron door, a tray of rolls slid out on the peel. */
  vieOven(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 340, 0.03 * lv, bus, [[1, 1, 0.3], [2.4, 0.5, 0.18]]); this.knock(x, 200, 0.03 * lv, bus, 0.08); });
    this.cue(t + 0.8, (x) => this.rasp(x, 0.7, 1500, 0.8, 0.02 * lv, bus, 16, 0.8));
    this.cue(t + 1.7, (x) => this.knock(x, 460, 0.03 * lv, bus, 0.07));
    return 2.6;
  },
  /** The tobacconist's (and every shop's) cash drawer: the till's bell, the drawer run out, coins. */
  vieTill(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 2100, 0.018 * lv, bus, [[1, 1, 0.5], [1.6, 0.5, 0.35], [2.7, 0.25, 0.2]]); this.rasp(x, 0.25, 1200, 0.9, 0.012 * lv, bus, 25, 0.6); });
    this.cue(t + 0.5, (x) => { for (let k = 0; k < 3; k++) this.struck(x + k * 0.04, 3600 + R() * 1200, 0.006 * lv, bus, [[1, 1, 0.07]]); });
    return 1.3;
  },
  /** The grocer's brass scale: the pan set down, the weights clinking, the sack's rustle. */
  vieScale(t, bus, lv) {
    this.cue(t, (x) => { this.struck(x, 2900, 0.012 * lv, bus, [[1, 1, 0.2], [2.1, 0.4, 0.12]]); this.struck(x + 0.1, 3500, 0.008 * lv, bus, [[1, 1, 0.1]]); });
    this.cue(t + 0.7, (x) => this.rasp(x, 0.5, 1900, 0.8, 0.012 * lv, bus, 22, 0.8));
    return 1.6;
  },
  /** The Fleischhauer's cleaver on the block: two chops and the heavy thud. */
  vieCleaver(t, bus, lv) {
    for (const [d, a] of [[0, 1], [0.55, 0.8], [1.5, 1]]) this.cue(t + d, (x) => { this.knock(x, 170, 0.07 * lv * a, bus, 0.12); this.burst(x, 0.03, 1400, 1.5, 0.05 * lv * a, bus); });
    return 2.2;
  },
  /** The tailor's treadle sewing machine in runs and the shears. */
  vieSewing(t, bus, lv) {
    let w = t;
    for (let run = 0; run < 2; run++) { const d = 1 + R() * 1.5; this.cue(w, (x) => this.rasp(x, d, 1900, 1.2, 0.02 * lv, bus, 17, 0.9)); w += d + 0.6 + R() * 0.8; }
    this.cue(w, (x) => { this.burst(x, 0.05, 3300, 3, 0.03 * lv, bus); this.burst(x + 0.13, 0.05, 3000, 3, 0.025 * lv, bus); });
    return w - t + 0.8;
  },
  /** The watchmaker's room: a chorus of ticks, and one clock striking on its gong. */
  vieClocks(t, bus, lv) {
    for (let k = 0; k < 9; k++) this.cue(t + k * 0.5 + (k % 2) * 0.02, (x) => this.burst(x, 0.008, 4300 + (k % 3) * 300, 6, 0.012 * lv, bus));
    this.cue(t + 4.8, (x) => { for (let k = 0; k < 3; k++) this.struck(x + k * 0.8, 1750, 0.012 * lv, bus, [[1, 1, 0.9], [2.4, 0.4, 0.5]]); });
    return 8.5;
  },
  /** The cobbler's tack hammer on the last: runs of light blows, then one heavy. */
  vieLast(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 5 + Math.floor(R() * 5); k < n; k++) { this.cue(w, (x) => { this.knock(x, 560 + R() * 80, 0.04 * lv, bus, 0.05); this.burst(x, 0.015, 3000, 3, 0.03 * lv, bus); }); w += 0.16 + R() * 0.06; }
    this.cue(w + 0.3, (x) => this.knock(x, 300, 0.05 * lv, bus, 0.09));
    return w - t + 1;
  },
  /** The barber stropping his razor: long swishes, alternately. */
  vieStrop(t, bus, lv) {
    for (let k = 0; k < 6; k++) this.cue(t + k * 0.42, (x) => this.rasp(x, 0.34, k % 2 ? 4800 : 5400, 1.1, 0.012 * lv, bus, 3, 0.4));
    return 3;
  },
  /** The dairy's milk cans: iron on stone, the lid, milk poured into a measure. */
  vieCans(t, bus, lv) {
    this.cue(t, (x) => this.struck(x, 520 * (0.95 + R() * 0.1), 0.03 * lv, bus, [[1, 1, 0.35], [2.7, 0.5, 0.2], [4.4, 0.25, 0.12]]));
    this.cue(t + 0.9, (x) => this.burst(x, 1.0, 1700, 1.6, 0.02 * lv, bus, 0.05));
    return 2.4;
  },
  /** The hatter's steam: a kettle's hiss as a felt is shaped, a brush over the brim. */
  vieSteam(t, bus, lv) {
    this.rasp(t, 2.4, 6200, 1.0, 0.008 * lv, bus, 2, 0.4);
    this.cue(t + 2.2, (x) => this.rasp(x, 0.9, 2300, 0.9, 0.014 * lv, bus, 12, 0.8));
    return 3.4;
  },
  /** The chemist's mortar: the pestle turned in the porcelain, a drawer. */
  viePestle(t, bus, lv) {
    for (let k = 0; k < 5; k++) this.cue(t + k * 0.5, (x) => this.rasp(x, 0.4, 1300, 0.9, 0.012 * lv, bus, 9, 0.6));
    this.cue(t + 3.0, (x) => this.struck(x, 2200, 0.008 * lv, bus, [[1, 1, 0.15], [2.4, 0.4, 0.1]]));
    return 3.6;
  },

  // ── the great rooms ─────────────────────────────────────────────────────────
  /** The Opera before the performance: the oboe's A, then the strings tuning to it, a little flat and sharp against each other, and a run of the horns. */
  vieTune(t, bus, lv) {
    const A = 435;
    this.tone(t, [[0, A]], 2.4, 0.012 * lv, bus, 'sawtooth', ['bandpass', 1300, 1.2]);
    for (let k = 0; k < 5; k++) this.cue(t + 2.6 + k * 0.05, (x) => { for (const [r, a] of [[1, 1], [0.667, 0.7], [0.5, 0.8], [0.75, 0.5]]) this.tone(x + R() * 0.3, [[0, A * r * (0.995 + R() * 0.01)]], 2.0, 0.005 * a * lv, bus, 'sawtooth', ['lowpass', 1500]); });
    this.cue(t + 6.2, (x) => { for (let k = 0; k < 6; k++) this.tone(x + k * 0.09, [[0, A * 0.5 * Math.pow(2, [0, 2, 4, 7, 9, 12][k] / 12)]], 0.3, 0.007 * lv, bus, 'sawtooth', ['lowpass', 1100]); });
    return 8.4;
  },
  /** A soprano warming up on a vocalise, one vowel. */
  vieSoprano(t, bus, lv) {
    this.cue(t, (x) => this.cry(x, 330, [[0, 0.8, 'a'], [4, 0.7, 'a'], [7, 0.9, 'a'], [12, 1.2, 'a'], [9, 0.6, 'e'], [4, 0.7, 'a'], [0, 1.4, 'o']], 0.04 * lv, bus, { fem: true, cutoff: 4500 }));
    return 7.2;
  },
  /** The organ of the Karlskirche: a chord swelling on its reeds and sinking away. */
  vieOrgan(t, bus, lv) {
    const base = 43 + Math.floor(R() * 3) * 2, ch = R() < 0.5 ? [0, 7, 12, 16] : [0, 7, 12, 15];
    for (const n of ch) this.tone(t, [[0, mtof(base + n)], [6, mtof(base + n) * 1.001]], 7, 0.007 * lv, bus, 'sawtooth', ['lowpass', 800]);
    this.tone(t, [[0, mtof(base - 12)]], 7, 0.012 * lv, bus, 'sine');
    return 8;
  },
  /** Steps on the Secession's floor, a few visitors crossing the hall, their sounds hollow under the glass roof. */
  vieHallSteps(t, bus, lv) {
    let w = t;
    for (let g = 0; g < 2; g++) { for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) { this.cue(w, (x) => this.step(x, 0.035 * lv, bus, 'cloth', 0.9)); w += 0.62 + R() * 0.12; } w += 1.5 + R() * 1.5; }
    return w - t + 0.5;
  },
  /** The murmur of visitors before the Beethoven frieze: a few low voices, a cough, a catalogue's page. */
  vieHallMurmur(t, bus, lv) {
    const dur = 5 + R() * 3;
    this.rasp(t, dur, 420 + R() * 120, 0.8, 0.014 * lv, bus, 3.4, 0.8);
    if (R() < 0.5) this.cue(t + R() * dur, (x) => this.cry(x, 112, [[0, 0.25, 'o'], [-2, 0.3, 'o']], 0.012 * lv, bus, { cutoff: 2200 }));
    if (R() < 0.5 && typeof this.paper === 'function') this.cue(t + R() * dur, (x) => this.paper(x, bus, lv * 0.6));
    return dur + 0.5;
  },
};

export const VIENNA_GAIN = { vieAngelus: 0.5, vieFountain: 1.4, vieWerkelmann: 0.9, vieCafe: 1.1, vieMarkt: 1.0, vieSchrammel: 1.0 };
addVoices('voices-vienna.js', VIENNA_VOICES, VIENNA_GAIN);
void inHours;
