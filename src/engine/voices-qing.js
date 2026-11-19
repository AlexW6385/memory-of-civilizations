// The voices of Ming–Qing Beijing that the other places do not have (docs/settlements/qing-beijing.md §40): a string of camels
// with their bronze bells, the whistled pigeons over the roofs, the barber's steel fork, the pedlars' cries with the brass cups
// and the shoemaker's awl. Methods of the audio engine's Music like the voices of voices.js (installVoices adds them), made of
// noise, oscillators and struck partials; each is `name(t, bus, lv)` and returns how long it lasts. The ones that move choose
// their own track from the place's map (`this.plc.life.map`) and aim the bus along it. Sources and what is inferred: the dossier.
const R = Math.random;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** A bus moving along `tr.pts` at `speed` from `t` (the bus' emitter is re-aimed); returns the mover's duration. */
function moveAlong(m, t, bus, tr, speed) {
  const f = m.along(tr.pts, speed);
  bus.emitter.pos = f; bus.emitter.from = m.ctx.currentTime;
  return f;
}

export const QING_VOICES = {
  /**
   * A string of five or six camels led through the street at a walker's pace (1.1 m/s): each wears a bronze bell hung under its neck that
   * clanks with its stride (the stride's period a camel's, 1.5 s, each bell its own pitch and phase, a pair of notes through the
   * stride: the bell knocking its clapper), the pads' dull thud on the earth, the pack frames creaking, the drover's low call at the head.
   */
  camelString(t, bus, lv) {
    const M = this.plc?.life?.map, l = this.lis(), tr = M?.avenueTrack?.(l.x, l.z, R);
    if (!tr) return 0.1;
    const f = moveAlong(this, t, bus, tr, 1.1), n = 5 + (R() < 0.4 ? 1 : 0), dur = f.dur;
    for (let c = 0; c < n; c++) {
      const T = 1.45 + R() * 0.2, ph = R() * T, fb = 330 + c * 38 + R() * 60;
      for (let w = ph; w < dur - 1; w += T * (1 + (R() - 0.5) * 0.06)) {
        const x = t + w + c * 0.11;
        this.cue(x, (y) => {
          // the bell: a bronze cup's partials (not a church bell's: a hollow, slightly dull clank), struck twice by its clapper through the stride
          this.struck(y, fb, 0.05 * lv, bus, [[1, 1, 0.55], [2.33, 0.55, 0.32], [3.9, 0.3, 0.18], [5.6, 0.12, 0.1]]);
          this.struck(y + 0.17, fb * 1.015, 0.03 * lv, bus, [[1, 1, 0.4], [2.33, 0.5, 0.22], [3.9, 0.2, 0.12]]);
          this.tone(y + 0.02, [[0, 78], [0.12, 52]], 0.16, 0.05 * lv, bus, 'sine');              // the soft pad on the ground
        });
      }
    }
    this.rasp(t, dur, 260, 1.4, 0.006 * lv, bus, 3.2, 0.9);                                          // the creak of the frames and ropes, a long slow breath
    for (let k = 0, m = 1 + Math.floor(R() * 2); k < m; k++) this.cue(t + dur * (0.15 + 0.6 * R()), (y) => this.cry(y, 118 * (0.94 + R() * 0.12), [[0, 0.5, 'o'], [3, 0.4, 'o'], [-2, 1.1, 'u']], 0.045 * lv, bus, { cutoff: 3200 }));
    return dur;
  },

  /**
   * Pigeons with whistles (gehao: gourd or bamboo, fixed under the tail, a different pitch on each so that a flock plays a chord): a flock
   * wheeling over the roofs, three or four whistles, each a hollow breathy tone with the flutter of the wing-beat (the pitch swinging a few
   * per cent as the bird banks), the flock's wings clapping as it takes off.
   */
  pigeonWhistle(t, bus, lv) {
    const ctx = this.ctx, dur = 6 + R() * 5, n = 3 + Math.floor(R() * 2), base = 1050 + R() * 500;
    for (let k = 0; k < 7; k++) this.cue(t + k * 0.045, (x) => this.burst(x, 0.04, 1900 + R() * 800, 1.2, 0.02 * lv, bus));    // the take-off's clatter of wings
    for (let i = 0; i < n; i++) {
      const f0 = base * [1, 1.26, 1.5, 1.89][i] * (0.99 + 0.02 * R()), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
      const lfo = ctx.createOscillator(), lg = ctx.createGain(), sw = ctx.createOscillator(), sg = ctx.createGain();
      o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f0; o2.frequency.value = f0 * 2.02;
      lfo.frequency.value = 6.5 + 2.5 * R(); lg.gain.value = f0 * 0.012; lfo.connect(lg); lg.connect(o.frequency);           // the wing-beat's wobble
      sw.frequency.value = 0.18 + 0.1 * R(); sg.gain.value = f0 * 0.035; sw.connect(sg); sg.connect(o.frequency);             // the bird banking
      bp.type = 'bandpass'; bp.frequency.value = f0 * 1.1; bp.Q.value = 2.5;
      const a = 0.014 * lv * (i ? 0.7 : 1), t0 = t + 0.25 + i * 0.4 * R();
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(a, t0 + dur * 0.4); g.gain.setValueAtTime(a, t0 + dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(bus);
      for (const s of [o, o2, lfo, sw]) { s.start(t0); s.stop(t0 + dur + 0.1); }
      this.burst(t0, dur, f0 * 1.3, 3, 0.004 * lv, bus, dur * 0.4);                                                           // the air across the mouth of the whistle
    }
    return dur + 0.4;
  },

  /**
   * The barber's fork (huantou): a pair of steel prongs a hand long, an iron rod drawn out through them with a flick: one long clear ring, a
   * thin metal shimmer (the two prongs a little apart in pitch, beating), dying in about two seconds; he rings it once as he turns into a lane.
   */
  huantou(t, bus, lv) {
    const f = 1180 + R() * 220;
    this.burst(t, 0.06, 4200, 1.5, 0.03 * lv, bus);
    for (const [r, a, d, off] of [[1, 1, 2.1, 0], [1.008, 0.9, 1.9, 0], [2.76, 0.3, 0.8, 0], [5.4, 0.1, 0.35, 0]]) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.frequency.value = f * r + off; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.032 * lv * a, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05);
    }
    return 2.4;
  },

  /**
   * The pedlars of the lanes, one walking his round: which trade is out at this hour and in this season, his cry between his instrument's
   * sounds, every ten seconds or so as he walks (a street track from the map). The trades: the roast sweet potato (cold mornings and
   * evenings), persimmons and dried fruit (autumn), the hard-bread man (deep in the night), the peanut-sweet man with his brass cup (evenings),
   * the sour-plum juice with his two pairs of brass cups (summer), the coal seller (afternoon and evening), the knife sharpener, the pedlar's rattle.
   */
  bjPeddler(t, bus, lv) {
    const M = this.plc?.life?.map, l = this.lis(), tr = M?.streetTrack?.(l.x, l.z, R, 90, 32);
    if (!tr) return 0.1;
    const hour = this.plc.hourNow ?? 12, doy = this.seasonDoy(), inH = (h, [a, b]) => (a <= b ? h >= a && h < b : h >= a || h < b);
    const cold = doy > 285 || doy < 75, fall = doy > 250 && doy < 345, summer = doy > 140 && doy < 250;
    const T = [
      ['sweetpotato', cold && (inH(hour, [6.5, 9.5]) || inH(hour, [15, 20])) ? 1.2 : 0],
      ['persimmon', fall && inH(hour, [8.5, 17]) ? 1.2 : 0],
      ['hardbread', inH(hour, [19.5, 24]) ? 1.3 : 0],
      ['peanutsweet', inH(hour, [18, 22.5]) ? 1 : 0],
      ['plumjuice', summer && inH(hour, [10, 18]) ? 1.3 : 0],
      ['coal', inH(hour, [15, 22]) ? 0.9 : 0],
      ['knife', inH(hour, [8.5, 17]) ? 0.8 : 0],
      ['rattle', inH(hour, [9, 17.5]) ? 0.8 : 0],
    ];
    const tot = T.reduce((s, [, w]) => s + w, 0);
    if (tot <= 0) return 0.1;
    let x = R() * tot, kind = T[0][0];
    for (const [k, w] of T) if ((x -= w) <= 0 && w > 0) { kind = k; break; }
    const f = moveAlong(this, t, bus, tr, 1.0), dur = f.dur;
    const CRY = {
      sweetpotato: [[0, 0.3, 'a'], [4, 0.3, 'a'], [7, 0.9, 'o'], [4, 0.5, 'a'], [2, 0.7, 'o']],
      persimmon: [[2, 0.3, 'a'], [7, 0.4, 'e'], [9, 0.9, 'i'], [4, 0.5, 'e'], [0, 0.8, 'e']],
      hardbread: [[0, 0.6, 'o'], [-2, 1.4, 'u'], [-5, 1.1, 'o']],
      peanutsweet: [[4, 0.35, 'a'], [7, 0.35, 'o'], [4, 0.9, 'a']],
      plumjuice: [[0, 0.3, 'u'], [5, 0.5, 'i'], [2, 0.9, 'a']],
      coal: [[0, 0.4, 'a'], [-3, 1.0, 'o'], [0, 0.5, 'a']],
      knife: [[7, 0.3, 'e'], [4, 0.3, 'a'], [9, 1.0, 'i'], [5, 0.5, 'a']],
    };
    let w = t;
    for (let k = 0; w < t + dur - 2.5 && k < 4; k++) {
      const x0 = w, f0 = 168 * (0.94 + R() * 0.12);
      this.cue(x0, (y) => {
        if (kind === 'rattle') return this.rattle(y, bus, lv);
        if (kind === 'plumjuice') { for (const d of [0, 0.22, 0.34]) this.struck(y + d, 1700 + d * 900, 0.03 * lv, bus, [[1, 1, 0.28], [2.4, 0.5, 0.16], [4.1, 0.2, 0.08]]); }            // two pairs of brass cups struck together
        if (kind === 'peanutsweet') { for (let c = 0; c < 4; c++) this.struck(y + c * 0.13, 2100 + (c % 2) * 120, 0.022 * lv, bus, [[1, 1, 0.3], [2.6, 0.4, 0.14]]); }                  // the clear copper cup before his call
        if (kind === 'knife') { this.struck(y, 1900, 0.04 * lv, bus, [[1, 1, 0.6], [1.5, 0.5, 0.4], [2.4, 0.3, 0.25]]); this.struck(y + 0.2, 2250, 0.03 * lv, bus, [[1, 1, 0.5], [1.6, 0.5, 0.3]]); }  // the strung iron plates
        const lead = kind === 'plumjuice' || kind === 'peanutsweet' ? 0.7 : kind === 'knife' ? 0.5 : 0;
        if (CRY[kind]) this.cry(y + lead, f0 * (kind === 'plumjuice' ? 1.1 : 1), CRY[kind], 0.05 * lv, bus, { cutoff: 4000 });
      });
      w += 9 + R() * 4;
    }
    return dur;
  },

  /** The shoemaker's awl and waxed thread: the hole pricked, the thread drawn through with a hiss, the mallet's tap on the sole; a few stitches. */
  qingAwl(t, bus, lv) {
    let w = t;
    for (let k = 0, n = 3 + Math.floor(R() * 4); k < n; k++) {
      this.cue(w, (x) => { this.burst(x, 0.02, 3200, 2, 0.03 * lv, bus); this.rasp(x + 0.06, 0.34, 3800, 1.3, 0.012 * lv, bus, 30, 0.5); });
      w += 0.55 + R() * 0.25;
    }
    this.cue(w + 0.2, (x) => { this.knock(x, 310, 0.05 * lv, bus, 0.06); this.knock(x + 0.22, 300, 0.04 * lv, bus, 0.06); });
    return w - t + 1;
  },
};
void clamp;
