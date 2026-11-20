// The placed voices of Northern Song Bianjing (docs/settlements/song-kaifeng.md §19; src/settlements/song-kaifeng/soundmap.js says where each
// is made and when). Added to the engine's VOICES (voices.js) through addVoices, every name prefixed `kf`; the audio engine copies VOICES onto Music's
// prototype once (installVoices). Each voice is a method `name(t, bus, lv, …)` that queues its events from `t` into `bus` and returns how long it lasts,
// as the voices of voices.js do; the ones marked "walks" take a track `f` (voices.js `along`) made by the map's tracks. All synthesised, no samples.
// [inferred throughout: no recording of Song Bianjing exists. What is attested is named beside each voice (the Dongjing meng hua lu, the Qingming
// scroll); the pitches, contours and rhythms are ours.]

import { addVoices } from './voices.js';

const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const KF_VOICES = {
  // ── the hours of the monastery and the street ───────────────────────────────────
  /**
   * The dawn caller (walks). "At the fifth watch the monastery attendants strike an iron plate or a wooden fish and go from door to door announcing the dawn,
   * calling the weather" [stated: Dongjing meng hua lu, in rujiazg 14649]: three strokes of an iron plate (or the wooden fish) at a walker's pace, then a drawn
   * call on a few vowels, "fine and clear" being the call of a fine morning.
   */
  kfIronPlate(t, bus, lv, f) {
    const dur = f ? f.dur : 22, plate = R() < 0.65;
    let w = t;
    for (let rep = 0; w < t + dur - 4; rep++) {
      for (let k = 0; k < 3; k++) {
        this.cue(w + k * 0.55, (x) => {
          if (plate) { this.struck(x, 840 + R() * 60, 0.05 * lv, bus, [[1, 1, 0.55], [2.63, 0.5, 0.3], [4.9, 0.28, 0.16]]); this.burst(x, 0.02, 3000, 1.2, 0.03 * lv, bus); }
          else this.knock(x, 720, 0.05 * lv, bus, 0.1);
        });
      }
      this.cue(w + 2.4, (x) => this.cry(x, 135 * (0.94 + R() * 0.12), [[0, 0.4, 'i'], [4, 0.35, 'e'], [7, 0.45, 'i'], [4, 0.3, 'a'], [0, 1.0, 'a']], 0.045 * lv, bus, { cutoff: 3800 }));
      w += 8.5 + R() * 2;
    }
    return dur;
  },
  /** The monastery's great bell: nine slow strokes, the last two a little lower and softer (the dawn bell, and the dusk bell after the drum) [inferred: 晨钟暮鼓]. */
  kfTempleBell(t, bus, lv) {
    const n = 9;
    for (let k = 0; k < n; k++) this.cue(t + k * (5.8 + R() * 0.8), (x) => this.bonsho(x, 96 * (k > n - 3 ? 0.99 : 1), 0.05 * lv * (k > n - 3 ? 0.8 : 1), bus, 0.7 + R() * 0.3));
    return n * 6.2 + 4;
  },
  /** The drum tower's drum: two rolls, quickening and dying away, a beat of the stick on the rim between [inferred]. */
  kfTempleDrum(t, bus, lv) {
    const end = this.drumRolls(t, bus, 2);
    this.cue(t + 12, (x) => this.knock(x, 520, 0.05 * lv, bus, 0.08));
    return end - t;
  },
  /** The morning and evening service in the main hall: the chant over the wooden fish, with the little bowl-bell at the phrases' ends [inferred]. */
  kfService(t, bus, lv) {
    const end = this.chant(t, 30, 0.035 * lv, bus, true);
    for (let k = 0; k < 4; k++) this.cue(t + 6 + k * 6.2, (x) => this.struck(x, 600, 0.03 * lv, bus, [[1, 1, 1.6], [2.4, 0.4, 0.8]]));
    return end - t + 2;
  },
  /** A single stroke of the bowl-bell (qing) and a few beats of the wooden fish, in the halls between the services [inferred]. */
  kfBowl(t, bus, lv) {
    this.struck(t, 560 + R() * 40, 0.03 * lv, bus, [[1, 1, 2.2], [2.4, 0.4, 1.0]]);
    for (let k = 0; k < 4; k++) this.cue(t + 1.6 + k * 0.7, (x) => this.knock(x, 700, 0.03 * lv, bus, 0.1));
    return 5;
  },
  /**
   * The Iron Pagoda's wind bells: 104 of them hang under its eaves [stated: ancient-history-sites 133351]. In still air one now and then; a breath of wind
   * sets a scatter of small bronze bells ringing out of step, higher the higher they hang [inferred: the pitch, one note a bell].
   */
  kfWindBell(t, bus, lv) {
    const wind = clamp(this.wind || 0, 0, 1), n = 1 + Math.floor(wind * 14 + R() * 3);
    let w = t, last = 0;
    for (let k = 0; k < n; k++) {
      const f = 1250 + R() * 900;
      this.cue(w, (x) => this.struck(x, f, 0.011 * lv * (0.5 + 0.5 * R()), bus, [[1, 1, 1.5], [2.76, 0.4, 0.7], [5.4, 0.18, 0.3]]));
      last = w - t;
      w += 0.12 + R() * (wind > 0.3 ? 0.5 : 1.6);
    }
    return last + 2;
  },
  // ── beasts of burden and carts ──────────────────────────────────────────────────
  /** A train of pack donkeys passing (walks): the soft hoof-falls of four out of step, the panniers' creak, the driver's "hui, hui" [stated: the donkey trains of the scroll, rujiazg 14532]. */
  kfPackTrain(t, bus, lv, f) {
    const dur = f.dur, pace = 0.62;
    const n = Math.floor(dur / pace);
    for (let k = 0; k < n; k++) for (let a = 0; a < 4; a++) if (R() < 0.8) this.cue(t + k * pace + a * 0.14 + R() * 0.04, (x) => { this.tone(x, [[0, 160], [0.04, 80]], 0.05, 0.03 * lv, bus, 'sine'); this.burst(x, 0.025, 1900, 1.3, 0.035 * lv, bus); });
    for (let k = 0; k < Math.floor(dur / 3.4); k++) this.cue(t + 0.8 + k * 3.4 + R(), (x) => this.creak(x, 0.55 * lv, bus, R() < 0.5));
    for (let k = 0; k < 2 && dur > 6; k++) this.cue(t + 2 + k * (dur * 0.4), (x) => this.cry(x, 140 * (0.94 + R() * 0.12), [[0, 0.22, 'u'], [3, 0.22, 'i'], [0, 0.5, 'u']], 0.04 * lv, bus, { cutoff: 3600 }));
    return dur;
  },
  /** An ox cart (walks): the axle's long creaks, the wheels' low rumble on the paving, an ox's low, and the drover's call [stated: ox carts boarded under reed mats, qlwb 2022-01-21]. */
  kfCart(t, bus, lv, f) {
    const dur = f.dur;
    this.rasp(t, dur, 170, 0.7, 0.014 * lv, bus, 3.2, 0.5);
    for (let k = 0; k < Math.floor(dur / 1.5); k++) this.cue(t + k * 1.5 + R() * 0.3, (x) => this.creak(x, 0.8 * lv, bus, k % 2 === 0));
    for (let k = 0; k < Math.floor(dur / 0.8); k++) this.cue(t + k * 0.8, (x) => this.tone(x, [[0, 125], [0.06, 62]], 0.07, 0.028 * lv, bus, 'sine'));
    if (R() < 0.6) this.cue(t + dur * (0.2 + 0.5 * R()), (x) => this.tone(x, [[0, 150], [0.9, 108]], 1.2, 0.014 * lv, bus, 'sawtooth', ['lowpass', 520, 1]));   // the ox's low
    if (R() < 0.7) this.cue(t + dur * 0.4, (x) => this.cry(x, 120 * (0.94 + R() * 0.12), [[0, 0.3, 'o'], [-3, 0.5, 'o'], [-5, 0.9, 'u']], 0.04 * lv, bus, { cutoff: 3400 }));
    return dur;
  },
  /** A donkey's bray: an indrawn rising "hee" and a falling "haw", three or four pairs, ever quicker and shorter (the donkeys of the bridge-heads and the fields). */
  kfDonkey(t, bus, lv) {
    const n = 3 + Math.floor(R() * 2), f = 320 + R() * 60;
    let w = t;
    for (let k = 0; k < n; k++) {
      const s = 1 - k * 0.12;
      this.cue(w, (x) => this.tone(x, [[0, f * 0.8], [0.45 * s, f * 1.6]], 0.5 * s, 0.026 * lv, bus, 'sawtooth', ['bandpass', 1200, 1.4]));
      this.cue(w + 0.5 * s, (x) => this.tone(x, [[0, f * 1.35], [0.55 * s, f * 0.62]], 0.6 * s, 0.03 * lv, bus, 'sawtooth', ['bandpass', 800, 1.2]));
      w += 1.15 * s;
    }
    return w - t + 0.6;
  },
  /** The camel train's bells: a deep, flat clank of the big bell at the leader's neck, answered by a higher one down the line, at the camels' slow pace [inferred: camels come out of the gate, aisixiang 93358; the bells ours]. */
  kfCamelBell(t, bus, lv) {
    let w = t;
    for (let k = 0; k < 14; k++) {
      this.cue(w, (x) => this.struck(x, 410, 0.03 * lv, bus, [[1, 1, 0.5], [2.45, 0.45, 0.28], [4.2, 0.2, 0.12]]));
      this.cue(w + 0.37 + R() * 0.1, (x) => this.struck(x, 620, 0.02 * lv, bus, [[1, 1, 0.4], [2.45, 0.4, 0.2]]));
      w += 1.6 + R() * 0.25;
    }
    return w - t;
  },
  // ── the river ───────────────────────────────────────────────────────────────────
  /** The trackers hauling a boat along the towpath (rujiazg: heads down, hauling a boat to the bridge): a work-song, the leader's call and the line's answer on every pull, the rope's creak [inferred: the song]. */
  kfHaul(t, bus, lv) {
    const n = 5 + Math.floor(R() * 3);
    let w = t;
    for (let k = 0; k < n; k++) {
      this.cue(w, (x) => this.cry(x, 125 * (0.97 + R() * 0.06), [[0, 0.3, 'e'], [4, 0.55, 'o']], 0.05 * lv, bus, { cutoff: 3600 }));
      this.cue(w + 0.85, (x) => { this.cry(x, 105, [[0, 0.7, 'o']], 0.045 * lv, bus, { cutoff: 3000 }); this.cry(x + 0.02, 132, [[0, 0.7, 'u']], 0.03 * lv, bus, { cutoff: 3000 }); this.creak(x + 0.1, 0.5 * lv, bus, true); });
      w += 1.9 + R() * 0.2;
    }
    return w - t + 0.5;
  },
  /** The grain landing: porters up the planks with the sacks — the plank's hollow knock under each tread, the sack thrown down on the heap, a short call [stated: sacks unloaded at the bank, aisixiang 93358]. */
  kfLanding(t, bus, lv) {
    let w = t;
    const n = 4 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      for (let s = 0; s < 4; s++) this.cue(w + s * 0.34, (x) => { this.knock(x, 170 + R() * 30, 0.05 * lv, bus, 0.12); this.burst(x, 0.04, 700, 1, 0.025 * lv, bus); });
      this.cue(w + 2.0, (x) => { this.tone(x, [[0, 95], [0.1, 55]], 0.14, 0.05 * lv, bus, 'sine'); this.burst(x, 0.14, 420, 0.8, 0.05 * lv, bus); });
      if (R() < 0.5) this.cue(w + 1.1, (x) => this.cry(x, 130 * (0.94 + R() * 0.12), [[0, 0.25, 'a'], [3, 0.5, 'o']], 0.04 * lv, bus, { cutoff: 3600 }));
      w += 3.1 + R();
    }
    return w - t;
  },
  /** The boat before the bridge lowering its mast on the pivot at its foot (rujiazg 11895): the long groan of the timber turning, the line running through the block, the crew's calls, the mast laid down with a knock [inferred: the sounds]. */
  kfMast(t, bus, lv) {
    for (let k = 0; k < 4; k++) this.cue(t + k * 1.7, (x) => this.creak(x, 1.1 * lv, bus, false));
    this.rasp(t, 6, 900, 0.8, 0.012 * lv, bus, 7, 0.8);
    for (const d of [0.4, 2.2, 4.0]) this.cue(t + d, (x) => this.cry(x, 140 * (0.94 + R() * 0.12), [[0, 0.3, 'e'], [5, 0.7, 'o']], 0.045 * lv, bus, { cutoff: 3800 }));
    this.cue(t + 6.6, (x) => { this.knock(x, 190, 0.07 * lv, bus, 0.16); this.burst(x, 0.2, 500, 0.8, 0.04 * lv, bus); });
    return 8;
  },
  // ── the shops and the pleasure quarters ─────────────────────────────────────────
  /** A story-teller in a tea house (shuo hua): his declaiming on a low note in phrases — a run of short syllables climbing, a long falling one — and the beat of the clapper boards at the end of each [inferred: the pai ban boards and the cadence; story-telling in the capital's tea houses and pleasure quarters is stated: Dongjing meng hua lu, rujiazg 14649]. */
  kfStory(t, bus, lv) {
    let w = t;
    const V = ['a', 'o', 'e', 'i', 'u'];
    for (let ph = 0; ph < 3; ph++) {
      const n = 4 + Math.floor(R() * 4), notes = [];
      for (let k = 0; k < n; k++) notes.push([(k < n - 1 ? k : -3) + (R() < 0.3 ? 2 : 0), k < n - 1 ? 0.16 + R() * 0.1 : 0.7, V[Math.floor(R() * 5)]]);
      const end = this.cry(w, 118 * (0.96 + R() * 0.08), notes, 0.04 * lv, bus, { cutoff: 3000 });
      this.cue(end + 0.15, (x) => { this.knock(x, 620, 0.05 * lv, bus, 0.06); this.knock(x + 0.14, 560, 0.04 * lv, bus, 0.06); });
      w = end + 1.2 + R() * 1.4;
    }
    return w - t;
  },
  /** A singing girl in a wine shop: a high sung phrase and the strike of the clapper boards (pai ban) keeping time, now fast, now slow [stated: the singing girls of the wine houses, Dongjing meng hua lu; the tune ours]. */
  kfClapSong(t, bus, lv) {
    const base = 300 + R() * 40, pent = [0, 2, 4, 7, 9];
    let w = t;
    for (let ph = 0; ph < 2; ph++) {
      const notes = [];
      for (let k = 0; k < 6; k++) notes.push([pent[Math.floor(R() * 5)] + (k === 5 ? 0 : 0), k === 5 ? 1.0 : 0.3 + R() * 0.25, ['a', 'e', 'o', 'i'][Math.floor(R() * 4)]]);
      const end = this.cry(w, base, notes, 0.04 * lv, bus, { cutoff: 3600, fem: true });
      for (let b = w; b < end; b += 0.5) this.cue(b, (x) => this.knock(x, 880, 0.03 * lv, bus, 0.05));
      w = end + 0.8;
    }
    return w - t;
  },
  /** The butcher's cleaver on the block: a few quick chops, a heavy one. */
  kfChop(t, bus, lv) {
    for (let k = 0; k < 3 + Math.floor(R() * 3); k++) this.cue(t + k * 0.22, (x) => { this.knock(x, 240, 0.05 * lv, bus, 0.07); this.burst(x, 0.03, 1400, 1.5, 0.03 * lv, bus); });
    this.cue(t + 1.2, (x) => { this.knock(x, 160, 0.08 * lv, bus, 0.12); });
    return 1.8;
  },
  /** A snack seller's call in the night market (walks): "ginger and fermented-bean, crackling skin, roast pepper" were cried along the street [stated: Dongjing meng hua lu, in rujiazg 14649]; a drawn call and a dull wooden knock between. */
  kfNightCall(t, bus, lv, f) {
    const dur = f.dur;
    for (let k = 0; k < Math.floor(dur / 7); k++) {
      const w = t + 1 + k * 7 + R() * 1.5;
      this.cue(w, (x) => this.cry(x, 130 * (0.92 + R() * 0.16), [[0, 0.3, 'a'], [4, 0.3, 'i'], [7, 0.35, 'e'], [4, 0.3, 'o'], [0, 1.1, 'a']], 0.05 * lv, bus, { cutoff: 4000 }));
      this.cue(w + 2.6, (x) => { this.knock(x, 680, 0.04 * lv, bus, 0.08); this.knock(x + 0.3, 640, 0.035 * lv, bus, 0.08); });
    }
    return dur;
  },
};
export const KF_GAIN = { kfIronPlate: 1, kfTempleBell: 1, kfTempleDrum: 1, kfService: 1, kfBowl: 1, kfWindBell: 1, kfPackTrain: 1, kfCart: 1, kfDonkey: 1, kfCamelBell: 1, kfHaul: 1, kfLanding: 1, kfMast: 1, kfStory: 1, kfClapSong: 1, kfChop: 1, kfNightCall: 1 };

addVoices('voices-kaifeng.js', KF_VOICES, KF_GAIN);
