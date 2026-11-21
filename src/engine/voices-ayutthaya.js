// Voices of Ayutthaya about 1687 (docs/settlements/ayutthaya.md §13.3), added to the placed voices of voices.js through addVoices, every name prefixed `ay`.
// Each is a method `name(t, bus, lv)` of Music returning how long it lasts; all synthesised. [inferred throughout: no recording of 17th-century Ayutthaya
// exists. The instruments are those of the piphat ensemble of the court and the wat (the ranat xylophone, the khong wong gong circle, the pi oboe, the taphon
// drum), the monks' Pali chant, the wat's big gong and drum, the paddles of the boats, the cries of the market women, the tokay gecko in the thatch and the
// royal elephants; the pitches, contours and rhythms are ours, in a five-note mode.]

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a) => a[Math.floor(R() * a.length)];
/** The mode: semitones from the tonic. */
const MODE = [0, 2, 4, 7, 9];
const note = (deg, tonic) => tonic * Math.pow(2, (Math.floor(deg / 5) * 12 + MODE[((deg % 5) + 5) % 5]) / 12);
/** The market women's cries (wordless): [semitones, seconds, vowel]. */
export const AY_CRIES = {
  fruit: [[0, 0.35, 'a'], [4, 0.3, 'o'], [2, 0.4, 'a'], [-3, 0.9, 'o']],
  pots: [[2, 0.3, 'o'], [7, 0.35, 'a'], [4, 0.45, 'o'], [0, 0.8, 'a']],
  fish: [[4, 0.3, 'e'], [0, 0.35, 'a'], [5, 0.3, 'e'], [-2, 1.0, 'o']],
  rice: [[0, 0.5, 'a'], [3, 0.4, 'o'], [0, 0.9, 'a']],
};

export const AYUTTHAYA_VOICES = {
  /** The wat's great gong: three slow strokes, each a low swell of bronze with its inharmonic partials ringing out, the last the longest. */
  ayGong(t, bus, lv) {
    const f = 132 * (0.96 + R() * 0.08);
    let w = t;
    for (let k = 0; k < 3; k++) {
      this.cue(w, (x) => { this.struck(x, f, 0.05 * lv, bus, [[1, 1, 4.2], [1.51, 0.6, 3.2], [2.02, 0.42, 2.4], [2.74, 0.28, 1.5], [3.6, 0.14, 0.9]]); this.burst(x, 0.08, 400, 1, 0.014 * lv, bus, 0.3); });
      w += 3.4 + R() * 0.8;
    }
    return w - t + 3.5;
  },
  /** The wat's big drum: a roll that quickens and stops on three slow beats, the dull skin and the wooden shell. */
  ayDrum(t, bus, lv) {
    let w = t, gap = 0.5;
    for (let k = 0; k < 14; k++) { this.cue(w, (x) => this.knock(x, 118 + R() * 8, 0.07 * lv, bus, 0.2)); w += gap; gap = Math.max(0.13, gap * 0.82); }
    w += 0.5;
    for (let k = 0; k < 3; k++) { this.cue(w, (x) => { this.knock(x, 112, 0.09 * lv, bus, 0.3); this.rasp(x, 0.2, 420, 1, 0.012 * lv, bus, 30, 0.6); }); w += 0.9; }
    return w - t + 1.2;
  },
  /** The monks' chant (Pali, wordless): low men's voices on one drone, a second line a fourth above answering, a phrase rising and falling, twelve seconds or so. */
  ayChant(t, bus, lv) {
    const f0 = 98 * (0.97 + R() * 0.06);
    this.cry(t, f0, [[0, 3.0, 'o'], [0, 2.2, 'a']], 0.05 * lv, bus, { cutoff: 2200 });
    this.cry(t + 0.4, f0 * 1.335, [[0, 2.4, 'u'], [-2, 2.6, 'o']], 0.03 * lv, bus, { cutoff: 2000 });
    this.cry(t + 5.4, f0 * 1.5, [[0, 1.0, 'o'], [2, 1.0, 'a'], [0, 1.0, 'o'], [-3, 2.8, 'a']], 0.05 * lv, bus, { cutoff: 2600 });
    this.cry(t + 5.6, f0, [[0, 5.8, 'o']], 0.034 * lv, bus, { cutoff: 1800 });
    return 12.5;
  },
  /** A note of the ranat (the xylophone): a hard, short strike on a wooden bar, a bright click and a hollow ring. */
  ayRanatNote(when, f, level, dest) {
    this.struck(when, f, level, dest, [[1, 1, 0.34], [2.76, 0.35, 0.12], [5.4, 0.12, 0.05]]);
    this.burst(when, 0.012, 3200, 1.2, level * 0.5, dest, 0.2);
    return 0.4;
  },
  /** A note of the khong wong (the gong circle): a bronze boss struck, a round ring with a soft upper partial. */
  ayKhongNote(when, f, level, dest) {
    this.struck(when, f, level, dest, [[1, 1, 1.3], [2.0, 0.4, 0.8], [3.02, 0.14, 0.4]]);
    return 1.3;
  },
  /** A phrase of the piphat: the pi's long reed notes over the ranat's running figure and the khong's slow strokes, the taphon marking the beat (about twelve seconds). */
  ayPiphat(t, bus, lv) {
    const tonic = 261.63, beat = 60 / 76 / 2;
    let deg = 5 + Math.floor(R() * 2), w = t;
    // the oboe: slow notes, each bent in from below, a little vibrato in the sustain
    const piNotes = []; for (let k = 0; k < 6; k++) { piNotes.push(deg); deg = clamp(deg + pick([-2, -1, -1, 1, 2]), 2, 9); }
    piNotes.push(5);
    let pw = t;
    for (const d of piNotes) {
      const f = note(d, tonic), dur = beat * (3 + Math.floor(R() * 3));
      this.tone(pw, [[0, f * 0.94], [0.08, f], [dur, f * 1.002]], dur, 0.022 * lv, bus, 'sawtooth', ['bandpass', 1500, 1.6]);
      pw += dur + 0.05;
    }
    const total = pw - t;
    // the ranat's figure in octaves over the same degrees, sixteenths
    for (let k = 0, n = Math.floor(total / beat); k < n; k++) { const d = piNotes[Math.min(piNotes.length - 1, Math.floor(k * beat / (total / piNotes.length)))] - 5 + (k % 2 ? 0 : 5); this.cue(t + k * beat, (x) => this.ayRanatNote(x, note(d + 5, tonic * 2), 0.03 * lv, bus)); }
    // the gong circle on the strong beats, the drum under it
    for (let k = 0; k * beat * 4 < total; k++) { const d = k % 2 ? 0 : -5; this.cue(t + k * beat * 4, (x) => { this.ayKhongNote(x, note(d + 5, tonic), 0.028 * lv, bus); this.knock(x, 120, 0.04 * lv, bus, 0.1); }); }
    for (let k = 0; k * beat * 2 < total; k++) if (k % 4 === 3) this.cue(t + k * beat * 2, (x) => this.knock(x, 200, 0.03 * lv, bus, 0.06));
    return total + 1.5;
  },
  /** A market woman's cry over the water (wordless), a few seconds. */
  ayCry(t, bus, lv) {
    const C = AY_CRIES[pick(Object.keys(AY_CRIES))], n = R() < 0.4 ? 2 : 1;
    let w = t;
    for (let k = 0; k < n; k++) { this.cue(w, (x) => this.cry(x, 300 * (0.93 + R() * 0.14), C, 0.05 * lv, bus, { fem: true, cutoff: 4000 })); w += C.reduce((s, c) => s + c[1], 0) + 1.5 + R() * 2; }
    return w - t;
  },
  /** A paddle among moored boats: soft dips, the drip from the blade, a knock on the gunwale now and then. */
  ayPaddle(t, bus, lv) {
    const n = 4 + Math.floor(R() * 4), gap = 1.3 + R() * 0.4;
    for (let k = 0; k < n; k++) this.cue(t + k * gap, (x) => { this.rasp(x, 0.45, 900, 0.7, 0.014 * lv, bus, 9, 0.5); this.burst(x + 0.4, 0.08, 2600, 1.2, 0.006 * lv, bus, 0.2); if (k % 3 === 2) this.knock(x + 0.7, 330, 0.02 * lv, bus, 0.06); });
    return n * gap + 0.6;
  },
  /** The tokay gecko in the thatch at night: a run of clicks, slowing, then the two-note call a few times. */
  ayTokay(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 8; k++) { this.cue(w, (x) => this.knock(x, 1500 - k * 40, 0.025 * lv, bus, 0.03)); w += 0.07 + k * 0.012; }
    w += 0.3;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => this.tone(x, [[0, 900], [0.12, 780]], 0.14, 0.03 * lv, bus, 'square', ['bandpass', 1200, 2]));
      this.cue(w + 0.2, (x) => this.tone(x, [[0, 640], [0.2, 540]], 0.25, 0.03 * lv, bus, 'square', ['bandpass', 900, 2]));
      w += 0.95 + R() * 0.2 - k * 0.03;
    }
    return w - t + 1;
  },
  /** An elephant of the king's stable: a rising blare on a harsh tone, a falling rumble. */
  ayElephant(t, bus, lv) {
    const f = 400 + R() * 80;
    this.tone(t, [[0, f * 0.7], [0.25, f * 1.5], [1.1, f * 1.4], [1.7, f * 0.8]], 1.8, 0.05 * lv, bus, 'sawtooth', ['bandpass', 1100, 1.4]);
    this.cue(t + 1.8, (x) => this.tone(x, [[0, 70], [1.2, 55]], 1.4, 0.04 * lv, bus, 'sawtooth', ['lowpass', 220, 0.8]));
    return 3.6;
  },
};
export const AYUTTHAYA_GAIN = { ayGong: 1.6, ayDrum: 1.5, ayChant: 1.0, ayPiphat: 0.9, ayCry: 2.2, ayPaddle: 1.6, ayTokay: 1.6, ayElephant: 1.0, ayRanatNote: 1, ayKhongNote: 1 };
import { addVoices } from './voices.js';
// (registered here, not in voices.js: this module is imported by the sound map, which the profile line in soundscape.js imports)
addVoices('voices-ayutthaya.js', AYUTTHAYA_VOICES, AYUTTHAYA_GAIN);
