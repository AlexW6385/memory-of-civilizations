// Music synthesised in the browser from each building's score (src/buildings/<id>/music.js):
// drones, plucked strings (Karplus–Strong), sistra, frame drums. Zones of a building
// (open air, halls, inner rooms, sanctum) crossfade as the visitor walks through them.

import { impulseResponse } from './acoustics.js';
import { LIFE } from './soundscape.js';

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
// the first three formants (Hz) of the vowels a male voice sings, for the street calls and chants
const VOWEL = { a: [730, 1090, 2440], i: [270, 2290, 3010], u: [300, 870, 2240], o: [570, 840, 2410], e: [530, 1840, 2480] };
// sung calls as [semitones above the voice's base, seconds, vowel] (vowels only: no words)
const CRIES = {
  flowers: [[0, 0.26, 'i'], [2, 0.26, 'i'], [4, 0.8, 'a'], [7, 0.3, 'a'], [4, 0.3, 'a'], [2, 1.0, 'a']],   // "gardenia, magnolia"
  soup: [[4, 0.3, 'u'], [7, 0.3, 'a'], [4, 0.3, 'i'], [2, 0.3, 'o'], [0, 1.1, 'a']],
  goods: [[0, 0.5, 'o'], [5, 1.2, 'e'], [3, 0.5, 'e']],
};
const BOATMAN = [[0, 0.35, 'e'], [5, 0.9, 'o'], [2, 0.6, 'o'], [0, 1.0, 'u']];                   // the boatman's "ei-yo, ho"
const FIRE_CALL = [[0, 0.35, 'a'], [2, 0.3, 'i'], [0, 0.35, 'o'], [-3, 1.0, 'u']];               // the watchman's "xiao xin huo zhu"

export class Music {
  constructor() {
    this.ctx = null;
    this.volume = 0.6;
    this.score = null;
    this.zone = null;
    this.layers = new Map();     // zone → { gain, drones: [] }
    this.harpCache = new Map();
    this.next = 0;
    this.beat = 0;
    this.phrase = { left: 0, deg: 2 };
  }

  /** Must be called from a user gesture. */
  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume?.();
    // whatever was asked for before the context existed is set up now, on the next set()
    const pending = this.score;
    this.score = null; this.zone = null;
    this.pending = pending;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    // a gentle compressor and make-up gain so quiet passages are still heard on laptop speakers
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -24; this.comp.ratio.value = 3; this.comp.attack.value = 0.02; this.comp.release.value = 0.4;
    this.makeup = ctx.createGain();
    this.makeup.gain.value = 2.2;
    this.master.connect(this.comp); this.comp.connect(this.makeup); this.makeup.connect(ctx.destination);
    this.dry = ctx.createGain();
    this.dry.connect(this.master);
    this.bus = ctx.createGain();
    this.bus.connect(this.dry);
    // the room (src/engine/acoustics.js): two convolvers, one ringing with the room one is in, the
    // other fading out the room one has left (a crossfade on every change of room); each is fed only
    // while it is heard, and cut off once its tail has died away — a convolver costs the audio
    // thread all the time it is fed, the more the longer its impulse response
    this.wetIn = ctx.createGain();
    this.bus.connect(this.wetIn);
    this.slots = [0, 1].map(() => {
      const conv = ctx.createConvolver(); conv.normalize = false;
      const gain = ctx.createGain(); gain.gain.value = 0;
      conv.connect(gain); gain.connect(this.master);
      return { conv, gain, key: null, fed: false, off: 0, rt: 0 };
    });
    this.irCache = new Map();
    this.roomKey = undefined;
    // outdoors: dry, but for the early reflections off the walls round (streets, courts): a delay
    // per direction, set from the distances to the nearest wall (surround())
    this.erIn = ctx.createGain();
    this.bus.connect(this.erIn);
    const erLP = ctx.createBiquadFilter(); erLP.type = 'lowpass'; erLP.frequency.value = 3800;
    this.erIn.connect(erLP);
    this.taps = Array.from({ length: 8 }, () => {
      const d = ctx.createDelay(0.5), g = ctx.createGain(), p = ctx.createStereoPanner();
      d.delayTime.value = 0.05; g.gain.value = 0;
      erLP.connect(d); d.connect(g); g.connect(p); p.connect(this.master);
      return { d, g, p };
    });
    this.erGain = 1;
    // a meter for the tests: RMS of what reaches the speakers
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.makeup.connect(this.analyser);
    this.timer = setInterval(() => this.tick(), 90);
  }

  /**
   * Weather you can hear: rain (filtered noise with drops) and wind (slowly swelling band noise).
   * rain, wind: 0…1; indoors muffles both.
   */
  ambience(rain, wind, indoors) {
    const ctx = this.ctx;
    if (!ctx) return;
    if (!this.amb) {
      const sr = ctx.sampleRate, n = sr * 4, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const noise = () => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
      const rainG = ctx.createGain(); rainG.gain.value = 0;
      const rHP = ctx.createBiquadFilter(); rHP.type = 'highpass'; rHP.frequency.value = 700;
      const rLP = ctx.createBiquadFilter(); rLP.type = 'lowpass'; rLP.frequency.value = 6000;
      noise().connect(rHP); rHP.connect(rLP); rLP.connect(rainG);
      const windG = ctx.createGain(); windG.gain.value = 0;
      const wBP = ctx.createBiquadFilter(); wBP.type = 'bandpass'; wBP.frequency.value = 380; wBP.Q.value = 0.7;
      const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.09; lfoG.gain.value = 220;
      lfo.connect(lfoG); lfoG.connect(wBP.frequency); lfo.start();
      noise().connect(wBP); wBP.connect(windG);
      const muffle = ctx.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 18000;
      rainG.connect(muffle); windG.connect(muffle); muffle.connect(this.makeup);
      this.amb = { rainG, windG, muffle };
    }
    const t = ctx.currentTime, a = this.amb;
    a.rainG.gain.setTargetAtTime(rain * 0.09, t, 1.5);
    a.windG.gain.setTargetAtTime(0.004 + wind * 0.05, t, 2.5);
    a.muffle.frequency.setTargetAtTime(indoors ? 900 : 18000, t, 0.8);
  }

  /**
   * The sounds of the place (DESIGN §5 "Sound"; src/engine/soundscape.js says which, where): water
   * lapping at a shore or a quay, birds by day (the voices of the place's climate), cicadas in the
   * heat, frogs and crickets at night, the animals of the place, the murmur of a town (voices, a
   * knock, a cart, hooves) or, in a modern city, the hum of traffic, and rain on the roofs. Levels
   * 0…1; indoors muffles them with the weather. voices, animals: { name: weight }.
   */
  place({ water = 0, birds = 0, crickets = 0, town = 0, traffic = 0, voices = null, cicadas = 0, frogs = 0, animals = null, dawn = 0, roof = 'tile', rain = 0, indoors = false } = {}) {
    const ctx = this.ctx;
    if (!ctx || !this.amb) return;
    if (!this.plc) {
      const sr = ctx.sampleRate, n = sr * 4, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
      const noise = () => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = Math.random() * 3; s.start(); return s; };
      const out = ctx.createGain(); out.connect(this.amb.muffle);
      // what is heard outside also reflects off the walls round, and rings in the hall one is in
      const send = ctx.createGain(); send.gain.value = 0.45;
      this.amb.muffle.connect(send); send.connect(this.wetIn); send.connect(this.erIn);
      // water: low noise swelling and ebbing like small waves
      const wG = ctx.createGain(); wG.gain.value = 0;
      const wLP = ctx.createBiquadFilter(); wLP.type = 'lowpass'; wLP.frequency.value = 520;
      const wAM = ctx.createGain(); wAM.gain.value = 0.5;
      const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.21; lfoG.gain.value = 0.45; lfo.connect(lfoG); lfoG.connect(wAM.gain); lfo.start();
      noise().connect(wLP); wLP.connect(wAM); wAM.connect(wG); wG.connect(out);
      // the town: a band of voices, its loudness wandering
      const tG = ctx.createGain(); tG.gain.value = 0;
      const tBP = ctx.createBiquadFilter(); tBP.type = 'bandpass'; tBP.frequency.value = 700; tBP.Q.value = 1.1;
      const tAM = ctx.createGain(); tAM.gain.value = 0.6;
      const l2 = ctx.createOscillator(), l2G = ctx.createGain(); l2.frequency.value = 0.37; l2G.gain.value = 0.35; l2.connect(l2G); l2G.connect(tAM.gain); l2.start();
      noise().connect(tBP); tBP.connect(tAM); tAM.connect(tG); tG.connect(out);
      // traffic: a low, steady roar
      const rG = ctx.createGain(); rG.gain.value = 0;
      const rLP = ctx.createBiquadFilter(); rLP.type = 'lowpass'; rLP.frequency.value = 260;
      noise().connect(rLP); rLP.connect(rG); rG.connect(out);
      // cicadas: a high band of noise chopped at the tymbals' rate (~80 Hz), swelling and falling
      // in choruses of several seconds
      const cG = ctx.createGain(); cG.gain.value = 0;
      const cBP = ctx.createBiquadFilter(); cBP.type = 'bandpass'; cBP.frequency.value = 5200; cBP.Q.value = 3;
      const cAM = ctx.createGain(); cAM.gain.value = 0.5;
      const pulse = ctx.createOscillator(), pG = ctx.createGain(); pulse.type = 'square'; pulse.frequency.value = 82; pG.gain.value = 0.5; pulse.connect(pG); pG.connect(cAM.gain); pulse.start();
      const swell = ctx.createGain(); swell.gain.value = 0.6;
      const sw = ctx.createOscillator(), swG = ctx.createGain(); sw.frequency.value = 0.11; swG.gain.value = 0.4; sw.connect(swG); swG.connect(swell.gain); sw.start();
      noise().connect(cBP); cBP.connect(cAM); cAM.connect(swell); swell.connect(cG); cG.connect(out);
      // rain on the roofs: a loop of drops whose sound is the roof's (made when the roof changes)
      const patG = ctx.createGain(); patG.gain.value = 0;
      patG.connect(this.amb.muffle);
      this.plc = { out, wG, tG, rG, cG, pat: null, patG, patRoof: null, birds: 0, crickets: 0, town: 0, traffic: 0, voices: null, animals: null, frogs: 0, dawn: 0,
        nextBird: 0, nextCricket: 0, nextKnock: 0, nextFrog: 0, nextAnimal: 0, nextHooves: 0 };
    }
    const t = ctx.currentTime, P = this.plc;
    P.wG.gain.setTargetAtTime(water * 0.05, t, 1.2);
    P.tG.gain.setTargetAtTime(town * 0.02, t, 2);
    P.rG.gain.setTargetAtTime(traffic * 0.06, t, 2);
    P.cG.gain.setTargetAtTime(cicadas * 0.018, t, 3);
    if (roof !== P.patRoof) {
      P.patRoof = roof;
      // a source's buffer is set once: a new roof is a new loop
      if (P.pat) try { P.pat.stop(); } catch { /* not started */ }
      P.pat = ctx.createBufferSource(); P.pat.loop = true; P.pat.buffer = this.patter(roof);
      P.pat.connect(P.patG); P.pat.start();
    }
    // under a roof one hears the rain on it above all; outside, on the roofs and the paving round
    P.patG.gain.setTargetAtTime(rain * (indoors ? 0.16 : 0.07), t, 1.5);
    Object.assign(P, { birds, crickets, town, traffic, voices, animals, frogs, dawn, water, rain, life: animals?.[LIFE] || null });
    this.lifeLayers(P.life, t);
  }

  /**
   * The always-on layers of a place's life (soundscape.js LIFE), made when first wanted and let go
   * half a minute after they are not: the market streets' hubbub by day, rain pocking the canal.
   */
  lifeLayers(L, t) {
    const ctx = this.ctx, P = this.plc;
    const day = Math.max(0, Math.min(1, (P.town - 0.4) / 0.5)), hubWant = L?.market ? L.market * day : 0;
    if (hubWant > 0.01 && !P.hub) {
      // three bands of noise, each swelling at a syllable's rate (3–6 Hz) out of step with the rest:
      // a crowd talking, with no word in it
      const g = ctx.createGain(); g.gain.value = 0; g.connect(P.out);
      const stops = [];
      for (const [f, q, rate, w] of [[420, 1.6, 3.1, 1], [950, 1.4, 4.3, 0.7], [1700, 1.8, 5.7, 0.35]]) {
        const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        s.buffer = this.noiseBuf; s.loop = true; s.loopStart = Math.random() * 3;
        bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
        am.gain.value = 0.5 * w; lfo.frequency.value = rate; lg.gain.value = 0.45 * w;
        lfo.connect(lg); lg.connect(am.gain); s.connect(bp); bp.connect(am); am.connect(g);
        s.start(); lfo.start(); stops.push(s, lfo);
      }
      P.hub = { g, stops };
    }
    if (P.hub) {
      P.hub.g.gain.setTargetAtTime(hubWant * 0.03, t, 2);
      if (hubWant > 0.01) P.hubOff = 0;
      else if (!P.hubOff) P.hubOff = t;
      else if (t - P.hubOff > 30) { for (const o of P.hub.stops) try { o.stop(); } catch { /* stopped */ } P.hub.g.disconnect(); P.hub = null; }
    }
    // rain on the canals: a loop of small bubbles, where there is water near
    const rwWant = L?.canal ? P.rain * P.water : 0;
    if (rwWant > 0.02 && !P.rw) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(this.amb.muffle);
      const s = ctx.createBufferSource(); s.loop = true; s.buffer = this.rainOnWater(); s.connect(g); s.start();
      P.rw = { g, s };
    }
    if (P.rw) {
      P.rw.g.gain.setTargetAtTime(rwWant * 0.045, t, 1.5);
      if (rwWant > 0.02) P.rwOff = 0;
      else if (!P.rwOff) P.rwOff = t;
      else if (t - P.rwOff > 30) { try { P.rw.s.stop(); } catch { /* stopped */ } P.rw.g.disconnect(); P.rw = null; }
    }
  }

  /** Two seconds of rain on still water, looped: each drop a small bubble, a chirp rising in pitch. */
  rainOnWater() {
    const ctx = this.ctx, sr = ctx.sampleRate, n = sr * 2, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    for (let k = 0; k < 520; k++) {
      const at = Math.floor(Math.random() * n), a = 0.2 + Math.random() * 0.8, f0 = 700 + Math.random() * 1600, len = Math.floor(sr * 0.04);
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        d[(at + i) % n] += a * Math.exp(-t / 0.008) * Math.sin(2 * Math.PI * f0 * (t + 14 * t * t));
      }
    }
    let m = 0;
    for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(d[i]));
    for (let i = 0; i < n; i++) d[i] /= m || 1;
    return b;
  }

  /**
   * Two seconds of rain on a roof, looped: drops at random, each a click shaped by what it falls on —
   * fired tiles a bright tick, slate a sharper one, shingles and boards a soft knock, thatch a hiss,
   * a flat earth or plaster roof a dull pat.
   */
  patter(roof) {
    const ctx = this.ctx, sr = ctx.sampleRate, n = sr * 2, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    // xiaoqing: Jiangnan's small thin grey tiles laid on a bed of lime and battens, a lighter tick
    // than a heavy fired tile's, a quarter of the drops with a hollow tock from the roof's air under
    const R = { tile: [2600, 0.0016, 900], slate: [3800, 0.001, 900], shingle: [1100, 0.004, 700], thatch: [5000, 0.0004, 2600], flat: [600, 0.006, 500], xiaoqing: [3100, 0.0012, 800, 820] }[roof] || [2600, 0.0016, 900];
    const [f, tau, count, hollow] = R;
    for (let k = 0; k < count; k++) {
      const tock = hollow && Math.random() < 0.25;
      const at = Math.floor(Math.random() * n), a = 0.2 + Math.random() * 0.8, ff = (tock ? hollow : f) * (0.7 + Math.random() * 0.6), len = Math.floor(sr * tau * (tock ? 3 : 1) * 8);
      for (let i = 0; i < len; i++) {
        const j = (at + i) % n, e = Math.exp(-i / (sr * tau * (tock ? 3 : 1)));
        d[j] += a * e * (roof === 'thatch' ? Math.random() * 2 - 1 : Math.sin(2 * Math.PI * ff * i / sr) * 0.7 + (Math.random() - 0.5) * 0.6);
      }
    }
    let m = 0;
    for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(d[i]));
    for (let i = 0; i < n; i++) d[i] /= m || 1;
    return b;
  }

  /** A short tone with a pitch contour and an envelope: f = [[t, Hz], …] from `when`; into dest. */
  tone(when, f, dur, level, dest, type = 'sine', filter = null) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f[0][1], when);
    for (const [dt, hz] of f.slice(1)) o.frequency.exponentialRampToValueAtTime(hz, when + dt);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(level, when + Math.min(0.03, dur * 0.2));
    g.gain.setValueAtTime(level, when + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    let node = o;
    if (filter) { const bq = ctx.createBiquadFilter(); bq.type = filter[0]; bq.frequency.value = filter[1]; bq.Q.value = filter[2] ?? 1; o.connect(bq); node = bq; }
    node.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + 0.05);
  }

  /** A burst of noise through a band (a bark's breath, a hoof, a knock). */
  burst(when, dur, f, q, level, dest, attack = 0) {
    const ctx = this.ctx, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    if (attack) { g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + attack); } else g.gain.setValueAtTime(level, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.connect(bp); bp.connect(g); g.connect(dest); s.start(when, Math.random() * 3); s.stop(when + dur + 0.02);
  }

  /** One bird's call, by voice. */
  bird(voice, t, lv) {
    const out = this.plc.out, r = Math.random;
    switch (voice) {
      case 'sparrow': {                       // a run of short, rough chirps
        const n = 3 + Math.floor(r() * 6), f = 3600 + r() * 1400;
        for (let k = 0; k < n; k++) this.tone(t + k * (0.13 + r() * 0.05), [[0, f], [0.05, f * 0.8]], 0.06, 0.01 * lv, out, 'triangle');
        break;
      }
      case 'dove': {                          // the soft coo of a dove: three to five low notes
        const f = 430 + r() * 140, pat = r() < 0.5 ? [0.35, 0.6, 0.3] : [0.3, 0.3, 0.55, 0.3, 0.3];
        let w = t;
        for (const d of pat) { this.tone(w, [[0, f * 0.95], [d * 0.4, f], [d, f * 0.9]], d, 0.014 * lv, out, 'sine', ['lowpass', 900]); w += d + 0.12; }
        break;
      }
      case 'crow': {                          // a harsh caw, two to four times
        const n = 2 + Math.floor(r() * 3), f = 520 + r() * 260;
        for (let k = 0; k < n; k++) this.tone(t + k * 0.55, [[0, f], [0.1, f * 1.15], [0.3, f * 0.85]], 0.32, 0.01 * lv, out, 'sawtooth', ['bandpass', 1400, 2]);
        break;
      }
      case 'gull': {                          // the gull's falling cry, repeated
        const n = 2 + Math.floor(r() * 4), f = 1500 + r() * 400;
        for (let k = 0; k < n; k++) this.tone(t + k * 0.42, [[0, f * 0.8], [0.06, f], [0.35, f * 0.6]], 0.36, 0.009 * lv, out, 'sawtooth', ['bandpass', 1800, 3]);
        break;
      }
      case 'kite': {                          // a kite's whistled, quavering fall
        const f = 2600 + r() * 500;
        this.tone(t, [[0, f], [0.2, f * 1.05], [1.1, f * 0.7]], 1.1, 0.008 * lv, out, 'sine');
        this.tone(t + 1.3, [[0, f * 0.95], [0.6, f * 0.75]], 0.6, 0.006 * lv, out, 'sine');
        break;
      }
      case 'koel': {                          // the koel's rising "ko-el", climbing with each repeat
        const n = 3 + Math.floor(r() * 4), f = 760 + r() * 80;
        for (let k = 0; k < n; k++) { const w = t + k * 0.95, ff = f * (1 + k * 0.06); this.tone(w, [[0, ff], [0.12, ff * 1.02]], 0.16, 0.012 * lv, out); this.tone(w + 0.2, [[0, ff * 1.1], [0.35, ff * 1.45]], 0.4, 0.014 * lv, out); }
        break;
      }
      case 'tropic': {                        // clear whistles gliding (bulbuls, orioles, the forest)
        const n = 2 + Math.floor(r() * 4), f = 1400 + r() * 1600;
        for (let k = 0; k < n; k++) { const a = f * (0.8 + r() * 0.5), d = 0.15 + r() * 0.3; this.tone(t + k * (d + 0.08), [[0, a], [d, a * (0.75 + r() * 0.6)]], d, 0.009 * lv, out); }
        break;
      }
      default: {                              // a songbird: a few quick falling or rising chirps
        const base = 2200 + r() * 2600, n = 2 + Math.floor(r() * 5), up = r() < 0.5;
        for (let k = 0; k < n; k++) { const w = t + 0.05 + k * (0.09 + r() * 0.05); this.tone(w, [[0, base * (up ? 0.85 : 1.15)], [0.07, base * (up ? 1.15 : 0.8)]], 0.08, 0.012 * lv, out); }
      }
    }
  }

  /** One animal's sound, by kind. */
  animal(kind, t, lv) {
    const out = this.plc.out, r = Math.random;
    switch (kind) {
      case 'rooster': {                       // cock-a-doodle-doo: four syllables, the last long and falling
        const f = 520 + r() * 120;
        [[0, 0.16, 1], [0.2, 0.14, 1.25], [0.38, 0.18, 1.35], [0.62, 0.7, 1.3]].forEach(([dt, d, k], i) =>
          this.tone(t + dt, [[0, f * k * 0.9], [d * 0.3, f * k], [d, f * k * (i === 3 ? 0.7 : 0.95)]], d, 0.012 * lv, out, 'sawtooth', ['bandpass', 1500, 1.5]));
        break;
      }
      case 'dog': {                           // a few barks
        const n = 1 + Math.floor(r() * 4), f = 380 + r() * 260;
        for (let k = 0; k < n; k++) { const w = t + k * (0.3 + r() * 0.15); this.tone(w, [[0, f], [0.04, f * 1.2], [0.14, f * 0.8]], 0.15, 0.014 * lv, out, 'sawtooth', ['bandpass', 900, 1.2]); this.burst(w, 0.1, 1200, 1, 0.02 * lv, out); }
        break;
      }
      case 'donkey': {                        // the bray: hee-haw, hee-haw
        for (let k = 0; k < 3; k++) { const w = t + k * 1.1; this.tone(w, [[0, 700], [0.35, 880]], 0.45, 0.012 * lv, out, 'sawtooth', ['bandpass', 1200, 2]); this.tone(w + 0.5, [[0, 260], [0.5, 200]], 0.55, 0.014 * lv, out, 'sawtooth', ['lowpass', 900]); }
        break;
      }
      case 'cattle': {                        // a low moo
        const f = 110 + r() * 50;
        this.tone(t, [[0, f], [0.4, f * 1.25], [1.4, f * 1.1]], 1.5, 0.02 * lv, out, 'sawtooth', ['lowpass', 520, 2]);
        break;
      }
      case 'goat': {                          // a bleat, trembling
        const f = 380 + r() * 200, o = this.ctx.createOscillator(), g = this.ctx.createGain(), v = this.ctx.createOscillator(), vg = this.ctx.createGain(), bp = this.ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = f; v.frequency.value = 7; vg.gain.value = f * 0.05; v.connect(vg); vg.connect(o.frequency);
        bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * lv, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        o.connect(bp); bp.connect(g); g.connect(out); o.start(t); v.start(t); o.stop(t + 0.75); v.stop(t + 0.75);
        break;
      }
      case 'sheepbell': {                     // the bells of a flock grazing: a few small clanks
        const n = 2 + Math.floor(r() * 5);
        for (let k = 0; k < n; k++) { const w = t + k * (0.25 + r() * 0.5), f = 1300 + r() * 900; for (const [m, a] of [[1, 1], [2.32, 0.5], [3.9, 0.25]]) this.tone(w, [[0, f * m]], 0.5, 0.004 * a * lv, out); }
        break;
      }
      case 'horse': {                         // now and then a whinny; else hooves (in hoofbeats())
        this.tone(t, [[0, 900], [0.25, 1300], [1.2, 520]], 1.2, 0.008 * lv, out, 'sawtooth', ['bandpass', 1500, 2]);
        break;
      }
      default:
    }
  }

  /** Hooves on paving, a horse or a mule passing at a walk. */
  hoofbeats(t, lv) {
    const out = this.plc.out;
    for (let k = 0; k < 10; k++) {
      const w = t + k * 0.32 + (k % 2) * 0.06;
      this.burst(w, 0.05, 900 + Math.random() * 500, 3, 0.05 * lv * (0.6 + 0.4 * Math.sin(Math.PI * k / 10)), out);
    }
  }

  /** Pick a key of { name: weight } at random by weight. */
  static pick(w) {
    let s = 0;
    for (const v of Object.values(w)) s += v;
    let x = Math.random() * s;
    for (const [k, v] of Object.entries(w)) if ((x -= v) <= 0) return k;
    return null;
  }

  /** Scheduled each tick: birds, crickets, frogs, animals, knocks and hooves. */
  placeEvents() {
    const P = this.plc, ctx = this.ctx;
    if (!P) return;
    const t = ctx.currentTime;
    if (P.birds > 0.02 && t > P.nextBird) {
      this.bird(P.voices ? Music.pick(P.voices) : 'warbler', t + 0.05, P.birds);
      P.nextBird = t + (1.5 + Math.random() * 6) / (0.3 + P.birds);
    }
    if (P.crickets > 0.02 && t > P.nextCricket) {
      const f = 4200 + Math.random() * 600;
      for (let k = 0; k < 3; k++) {
        const o = ctx.createOscillator(), g = ctx.createGain(), w = t + k * 0.06;
        o.frequency.value = f; g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(0.006 * P.crickets, w + 0.005); g.gain.linearRampToValueAtTime(0, w + 0.035);
        o.connect(g); g.connect(P.out); o.start(w); o.stop(w + 0.05);
      }
      P.nextCricket = t + 0.35 + Math.random() * 0.9;
    }
    if (P.frogs > 0.02 && t > P.nextFrog) {
      // a frog's croak: a quick train of pulses round a few hundred hertz
      const f = 220 + Math.random() * 380, n = 2 + Math.floor(Math.random() * 5);
      for (let k = 0; k < n; k++) this.tone(t + k * 0.11, [[0, f], [0.06, f * 0.85]], 0.07, 0.012 * P.frogs, P.out, 'sawtooth', ['bandpass', f * 2.5, 4]);
      P.nextFrog = t + 0.6 + Math.random() * 2.5 / (0.3 + P.frogs);
    }
    if (P.animals && t > P.nextAnimal) {
      const A = { ...P.animals };
      // the cock crows at first light above all; dogs bark more at night
      if (A.rooster) A.rooster *= 0.15 + 6 * P.dawn;
      if (A.dog) A.dog *= P.birds < 0.1 ? 1.6 : 0.8;
      const k = Music.pick(A), lv = Math.min(1, 0.35 + P.town + P.dawn);
      if (k && Object.values(A).some((v) => v > 0)) this.animal(k, t + 0.05, lv * (0.5 + Math.random() * 0.5));
      P.nextAnimal = t + 7 + Math.random() * 22 - 4 * P.dawn;
    }
    if (P.town > 0.05 && P.animals?.horse && t > P.nextHooves) {
      this.hoofbeats(t + 0.1, P.town * P.animals.horse);
      P.nextHooves = t + 15 + Math.random() * 40;
    }
    this.drainCues(t);
    if (P.life) this.lifeEvents(P.life, t);
    if (P.town > 0.05 && t > P.nextKnock) {
      // a knock: a hammer, a door, a pot set down — a short filtered click
      const sr = ctx.sampleRate, len = Math.floor(sr * 0.06), b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.008));
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = b; f.type = 'bandpass'; f.frequency.value = 500 + Math.random() * 1500; f.Q.value = 3; g.gain.value = 0.05 * P.town;
      s.connect(f); f.connect(g); g.connect(P.out); s.start(t + 0.02);
      const n = Math.random() < 0.3 ? 3 : 1;
      P.nextKnock = t + (n === 3 ? 0.4 : 2 + Math.random() * 7);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // The life of Suzhou's waters and streets (soundscape.js LIFE). Everything is made of events
  // placed in time: nothing runs per frame, and a long run (a bell's strokes, a chant's beats) is
  // queued as cues, made a few at a time, so that no tick creates more than a handful of nodes.
  // Not placed in 3D: the engine has no listener; a boat or a watchman is given a pan that drifts
  // across the stereo field while it passes, a distance by a lowpass.

  /** Queue fn(when) to be made shortly before `when`. */
  cue(when, fn) { (this.cues ||= []).push([when, fn]); }

  drainCues(t) {
    const q = this.cues;
    if (!q || !q.length) return;
    for (let i = q.length - 1; i >= 0; i--) {
      const [w, fn] = q[i];
      if (w > t + 0.3) continue;
      q[i] = q[q.length - 1]; q.pop();
      if (w > t - 1.5) fn(w);                  // whatever fell far behind (a muted tab) is let go
    }
  }

  /** The events of a place's life, by what is near and the hour (day: the town's din is up). */
  lifeEvents(L, t) {
    const P = this.plc, r = Math.random;
    const day = P.town > 0.5, night = P.crickets > 0.02 && P.town > 0.05, wet = P.water, calm = P.rain < 0.6;
    const due = (k, gap) => { if (!P[k]) P[k] = t + gap * (0.2 + 0.8 * r()); return t > P[k]; };   // the first falls soon
    if (L.canal && wet > 0.12 && due('nextLap', 0.4)) {
      this.lap(t + 0.02, wet * L.canal);
      P.nextLap = t + (0.3 + r() * 1.1) / (0.5 + wet);
    }
    if (L.eaves && P.rain > 0.12 && (P.town > 0.05 || wet > 0.1) && due('nextDrip', 0.5)) {
      this.drip(t + 0.02, P.rain * L.eaves);
      P.nextDrip = t + (0.12 + r() * 0.7) / (P.rain + 0.2);
    }
    if (L.oar && wet > 0.3 && day && calm) {
      if (due('nextOar', 40)) { this.scull(t + 0.1, wet * L.oar); P.nextOar = t + 35 + r() * 55; }
      if (due('nextCall', 80)) { this.boatman(t + 0.1, wet * L.oar); P.nextCall = t + 70 + r() * 120; }
    }
    if (L.hawkers && day && calm && due('nextHawk', 20)) { this.street(t + 0.1, L.hawkers); P.nextHawk = t + (9 + r() * 24) / L.hawkers; }
    if (L.teahouse && day && due('nextTea', 25)) { this.teahouse(t + 0.1, L.teahouse); P.nextTea = t + 14 + r() * 32; }
    if (L.patrol && night && due('nextPatrol', 20)) { this.patrol(t + 0.1, L.patrol); P.nextPatrol = t + 28 + r() * 50; }
  }

  /** A bus for something passing: gain → lowpass (its distance) → pan drifting from a to b over dur. */
  spot(dest, a, b, dur, cutoff = 3000, gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter(), p = ctx.createStereoPanner();
    g.gain.value = gain; lp.type = 'lowpass'; lp.frequency.value = cutoff;
    p.pan.setValueAtTime(a, t); p.pan.linearRampToValueAtTime(b, t + dur);
    g.connect(lp); lp.connect(p); p.connect(dest);
    return g;
  }

  /** The water slapping a stone wall: a wet slap and, often, the hollow glug of the wall's hollow. */
  lap(t, w) {
    const out = this.plc.out, r = Math.random;
    this.burst(t, 0.16 + r() * 0.12, 500 + r() * 700, 1.3, 0.05 * w * (0.5 + r() * 0.5), out);
    if (r() < 0.6) this.tone(t + 0.03, [[0, 240 + r() * 120], [0.07, 520 + r() * 200]], 0.12, 0.01 * w, out);
  }

  /** A drip from the eaves into a stone gutter or the canal: a small bright plink, or a bubble. */
  drip(t, lv) {
    const ctx = this.ctx, r = Math.random, f = 1200 + r() * 1400, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(r() < 0.35 ? f * 1.8 : f * 0.7, t + 0.05);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.011 * lv, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g); g.connect(this.plc.out); o.start(t); o.stop(t + 0.1);
  }

  /** A hollow wooden knock (a clapper, a wooden fish): the board's note, falling, and a click. */
  knock(when, f, level, dest, dur = 0.09) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f, when); o.frequency.exponentialRampToValueAtTime(f * 0.72, when + dur * 0.6);
    g.gain.setValueAtTime(level, when); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + 0.02);
    this.burst(when, 0.025, f * 2.2, 2, level * 0.5, dest);
  }

  /** A cup set down: a bright porcelain ring and its upper partial. */
  clink(when, level, dest) {
    const ctx = this.ctx, f = 2300 + Math.random() * 1200;
    for (const [r, a, d] of [[1, 1, 0.16], [1.52, 0.5, 0.09]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * r;
      g.gain.setValueAtTime(level * a, when); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.02);
    }
  }

  /** A small gong (luo): beater, then a fundamental falling a little and inharmonic partials. */
  gong(when, f, level, dest, decay = 1) {
    const ctx = this.ctx;
    this.burst(when, 0.05, 1300, 1, level * 0.6, dest);
    for (const [r, a, d] of [[1, 1, 1.6], [1.58, 0.6, 1.1], [2.31, 0.45, 0.8], [3.17, 0.3, 0.5]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), D = d * decay;
      o.frequency.setValueAtTime(f * r * 1.04, when); o.frequency.exponentialRampToValueAtTime(f * r, when + 0.25);
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, when + D);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + D + 0.05);
    }
  }

  /** A temple bell struck once (decay < 1: the strokes of a fast run are damped by the next). */
  templeBell(when, f, level, dest, decay = 1) {
    const ctx = this.ctx;
    this.burst(when, 0.1, 170, 1, level * 0.7, dest);
    for (const [r, a, d] of [[1, 1, 10], [1 + 0.8 / f, 0.8, 10], [2.4, 0.45, 5], [3.6, 0.25, 3], [5.2, 0.12, 1.6]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), D = d * decay;
      o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a, when + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, when + D);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + D + 0.05);
    }
  }

  /**
   * A voice made of formants: a buzzing source (two, a hair apart, for a chorus) through three
   * band filters tuned to a vowel, a lowpass for the distance and an envelope. Nothing is played:
   * the caller sets the pitch and vowel with vowel()/pitch() and ends it with end().
   */
  vox(dest, cutoff, pan, chorus = false) {
    const ctx = this.ctx, env = ctx.createGain(), lp = ctx.createBiquadFilter();
    env.gain.value = 0.0001; lp.type = 'lowpass'; lp.frequency.value = cutoff;
    const oscs = [ctx.createOscillator()];
    if (chorus) oscs.push(ctx.createOscillator());
    oscs.forEach((o, k) => { o.type = 'sawtooth'; o.detune.value = k * 9; });
    const bps = [0, 1, 2].map((i) => {
      const bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.Q.value = [4, 5, 6][i]; g.gain.value = [1, 0.5, 0.22][i];
      for (const o of oscs) o.connect(bp);
      bp.connect(g); g.connect(env);
      return bp;
    });
    env.connect(lp);
    if (pan === undefined || pan === null) lp.connect(dest);
    else { const p = ctx.createStereoPanner(); p.pan.value = pan; lp.connect(p); p.connect(dest); }
    return { oscs, bps, env };
  }

  /** A sung call (CRIES) from `when`: pitch glides between the notes, the vowel follows, a dip between. */
  cry(when, f0, notes, level, dest, { cutoff = 3000, pan = null, fem = false } = {}) {
    const v = this.vox(dest, cutoff, pan), k = fem ? 1.17 : 1;
    let w = when, prev = notes[0];
    const f = (n) => f0 * Math.pow(2, n[0] / 12);
    v.oscs.forEach((o) => o.frequency.setValueAtTime(f(prev), when));
    v.bps.forEach((b, i) => b.frequency.setValueAtTime(VOWEL[prev[2]][i] * k, when));
    v.env.gain.setValueAtTime(0.0001, when);
    notes.forEach((n, j) => {
      const dur = n[1], gl = Math.min(0.09, dur * 0.35);
      v.oscs.forEach((o) => { o.frequency.setValueAtTime(f(prev), w); o.frequency.linearRampToValueAtTime(f(n), w + gl); o.frequency.linearRampToValueAtTime(f(n) * 0.985, w + dur); });
      v.bps.forEach((b, i) => { b.frequency.setValueAtTime(VOWEL[prev[2]][i] * k, w); b.frequency.linearRampToValueAtTime(VOWEL[n[2]][i] * k, w + 0.08); });
      v.env.gain.exponentialRampToValueAtTime(level * (j ? 1 : 0.9), w + (j ? 0.05 : 0.07));
      if (j < notes.length - 1) v.env.gain.exponentialRampToValueAtTime(level * 0.45, w + dur);
      w += dur; prev = n;
    });
    v.env.gain.exponentialRampToValueAtTime(0.0001, w + 0.3);
    v.oscs.forEach((o) => { o.start(when); o.stop(w + 0.35); });
    return w;
  }

  /** A hawker's cry, a pedlar's rattle-drum or a snack seller's bamboo clapper, passing. */
  street(t, lv) {
    const r = Math.random, x = r(), side = (r() < 0.5 ? -1 : 1) * (0.2 + r() * 0.6), far = 0.3 + r() * 0.7;
    const bus = this.spot(this.plc.out, side, -side * 0.5, 6, 1700 + (1 - far) * 2200, 1);
    if (x < 0.5) {
      const names = Object.keys(CRIES), fem = r() < 0.4;
      this.cry(t, (fem ? 300 : 175) * (0.92 + r() * 0.16), CRIES[names[Math.floor(r() * names.length)]], 0.05 * lv * (1 - 0.5 * far), bus, { fem, cutoff: 4000 });
    } else if (x < 0.75) {
      // the rattle-drum twirled: two pellets beating the skin on either side, quick and light
      const n = 10 + Math.floor(r() * 6);
      for (let k = 0; k < n; k++) this.cue(t + k * 0.075, (w) => this.burst(w, 0.035, k % 2 ? 1500 : 1900, 2.5, 0.05 * lv * (1 - 0.5 * far), bus));
    } else {
      // the clapper of bamboo: a knock, a knock, a pause, a knock
      for (const d of [0, 0.24, 0.95]) this.cue(t + d, (w) => this.knock(w, 780, 0.03 * lv * (1 - 0.5 * far), bus, 0.1));
    }
  }

  /** A teahouse's cups, a lid rattling, now and then the storyteller's block slapped on the table. */
  teahouse(t, lv) {
    const r = Math.random, bus = this.spot(this.plc.out, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2, 4, 2600, 1);
    let w = t;
    for (let k = 0, n = 2 + Math.floor(r() * 3); k < n; k++) { this.cue(w, (x) => this.clink(x, 0.012 * lv, bus)); w += 0.12 + r() * 0.4; }
    if (r() < 0.4) for (let k = 0; k < 5; k++) this.cue(w + k * 0.045, (x) => this.clink(x, 0.005 * lv, bus));     // the lid
    if (r() < 0.25) this.cue(w + 1.5 + r(), (x) => { this.knock(x, 380, 0.05 * lv, bus, 0.07); this.burst(x, 0.05, 1600, 0.8, 0.04 * lv, bus); });
  }

  /** A boat's stern oar, sculled: bouts of creak and swish, one stroke every two seconds, the boat drifting by. */
  scull(t, w) {
    const r = Math.random, n = 4 + Math.floor(r() * 5), T = 1.7 + r() * 0.5, far = 0.3 + r() * 0.7, a = (r() < 0.5 ? -1 : 1) * (0.3 + r() * 0.6);
    const bus = this.spot(this.plc.out, a, -a * 0.8, n * T, 1100 + (1 - far) * 2400, 1), lv = w * (1 - 0.55 * far);
    for (let k = 0; k < n; k++) {
      this.cue(t + k * T, (x) => { this.creak(x, lv, bus, true); this.burst(x + 0.1, 0.9, 420, 0.7, 0.03 * lv, bus, 0.3); if (r() < 0.5) this.lap(x + 0.05, lv * 0.7); });
      this.cue(t + k * T + T / 2, (x) => { this.creak(x, lv * 0.8, bus, false); this.burst(x + 0.1, 0.9, 380, 0.7, 0.025 * lv, bus, 0.3); });
    }
  }

  /** The creak of the oar's peg in its socket: a rough, wavering squeal rising (a push) or falling (a pull). */
  creak(when, level, dest, rising) {
    const ctx = this.ctx, o = ctx.createOscillator(), am = ctx.createOscillator(), ad = ctx.createGain(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    const f = 200 + Math.random() * 40, dur = 0.55 + Math.random() * 0.25;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(rising ? f : f * 1.5, when); o.frequency.linearRampToValueAtTime(rising ? f * 1.5 : f, when + dur);
    bp.type = 'bandpass'; bp.Q.value = 4; bp.frequency.setValueAtTime(rising ? 900 : 1500, when); bp.frequency.linearRampToValueAtTime(rising ? 1500 : 900, when + dur);
    am.frequency.value = 36 + Math.random() * 12; ad.gain.value = 0.45; g.gain.value = 0.55;
    am.connect(ad); ad.connect(g.gain);                       // the roughness: the gain shivers at ~40 Hz
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when); env.gain.exponentialRampToValueAtTime(0.022 * level, when + 0.12); env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(bp); bp.connect(g); g.connect(env); env.connect(dest);
    o.start(when); am.start(when); o.stop(when + dur + 0.02); am.stop(when + dur + 0.02);
  }

  /** The boatman's call across the water. */
  boatman(t, w) {
    const r = Math.random, side = (r() < 0.5 ? -1 : 1) * (0.3 + r() * 0.5), far = 0.4 + r() * 0.6;
    const bus = this.spot(this.plc.out, side, side, 1, 1500 + (1 - far) * 2000, 1);
    this.cry(t, 150 * (0.92 + r() * 0.16), BOATMAN, 0.045 * w * (1 - 0.5 * far), bus, { cutoff: 4000 });
  }

  /** A night watchman passing in some street: clapper beats at a walker's pace, the call now and then. */
  patrol(t, lv) {
    const r = Math.random, side = (r() < 0.5 ? -1 : 1) * (0.3 + r() * 0.5), far = 0.4 + r() * 0.6;
    const bus = this.spot(this.plc.out, side, -side, 14, 1400 + (1 - far) * 2000, 1), q = 0.035 * lv * (1 - 0.5 * far);
    // 梆, 梆梆: one beat and two quick, as a watchman's rattle is struck [inferred]
    let w = t;
    for (let rep = 0; rep < 3; rep++) {
      for (const d of [0, 1.1, 1.4]) this.cue(w + d, (x) => this.knock(x, d ? 960 : 820, q, bus));
      w += 3.4;
    }
    if (r() < 0.5) this.cry(w + 0.3, 125 * (0.94 + r() * 0.12), FIRE_CALL, 0.045 * lv * (1 - 0.5 * far), bus, { cutoff: 4000 });
  }

  /**
   * The wooden fish keeping the time of a chant, and the chant: `n` syllables a beat apart sung on
   * one low note by a chorus (vowels of "na-mo-e-mi-tuo-fo"), a step up at the end of each phrase
   * of six. One voice for the whole chant, its pitch and vowel set up front; the knocks are cued.
   */
  chant(when, n, level, dest) {
    const beat = 0.8, V = ['a', 'o', 'e', 'i', 'o', 'o'], v = this.vox(dest, 1500, null, true), f0 = 112;
    v.oscs.forEach((o) => o.frequency.setValueAtTime(f0, when));
    v.bps.forEach((b, i) => b.frequency.setValueAtTime(VOWEL.a[i], when));
    v.env.gain.setValueAtTime(0.0001, when);
    for (let k = 0; k < n; k++) {
      const w = when + k * beat, ph = k % 6, f = f0 * (ph === 5 ? 1.122 : 1);
      v.oscs.forEach((o) => { o.frequency.setValueAtTime(f, w); });
      v.bps.forEach((b, i) => { b.frequency.setValueAtTime(VOWEL[V[ph]][i] * 0.97, w); });
      v.env.gain.exponentialRampToValueAtTime(level, w + 0.12);
      v.env.gain.exponentialRampToValueAtTime(level * 0.35, w + beat * 0.85);
      this.cue(w, (x) => this.knock(x, 700, level * 1.5, dest, 0.11));
    }
    const end = when + n * beat;
    v.env.gain.exponentialRampToValueAtTime(0.0001, end + 0.5);
    v.oscs.forEach((o) => { o.start(when); o.stop(end + 0.55); });
    return end;
  }

  /**
   * The bells, drums, horns and calls that mark the hours of the place (src/engine/soundscape.js
   * `due` says which, when). Heard from a tower or a minaret some way off: softened, and reflected
   * off the walls round like the rest of the place's sound. many: several mosques call at once.
   */
  ring(ev, { many = false } = {}) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.plc) return;
    const t0 = ctx.currentTime + 0.2, [kind, arg] = ev.split(':');
    if (t0 < (this.ringBusy || 0) && kind !== 'quarter' && kind !== 'watch') return;   // one thing at a time (but for the quarters and the watchman, who go their own way)
    if (!this.far) {
      this.far = ctx.createGain(); this.far.gain.value = 1;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
      this.far.connect(lp); lp.connect(this.amb.muffle);
    }
    const out = this.far, N = +arg || 0;
    let end = t0;
    const strokes = (n, every, fn) => { for (let k = 0; k < n; k++) fn(t0 + k * every, k); end = Math.max(end, t0 + n * every); };
    switch (kind) {
      case 'angelus': {                       // three strokes thrice, then the peal
        for (let g = 0; g < 3; g++) for (let k = 0; k < 3; k++) this.strike(t0 + g * 6 + k * 1.6, 233, 0.05, out);
        for (let k = 0; k < 14; k++) this.strike(t0 + 19 + k * 1.25, 233, 0.04 * (k < 12 ? 1 : 0.6), out);
        end = t0 + 38;
        break;
      }
      case 'office': strokes(22, 1.35, (w, k) => this.strike(w, k % 2 ? 196 : 197, 0.045, out)); break;
      case 'strike': strokes(N, 2.6, (w) => this.strike(w, 147, 0.05, out, 1.3)); break;
      case 'marangona': strokes(30, 1.6, (w) => this.strike(w, 110, 0.055, out, 1.6)); break;
      case 'carillon': {                      // a tune on the carillon's small bells, then the hour
        const sc = [0, 2, 4, 5, 7, 9, 11, 12, 14], base = 587;
        let deg = 4;
        for (let k = 0; k < 16; k++) { deg = Math.max(0, Math.min(8, deg + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)])); this.strike(t0 + k * 0.32 * (k % 4 === 3 ? 1.5 : 1), base * Math.pow(2, sc[deg] / 12), 0.025, out, 0.35); }
        for (let k = 0; k < N; k++) this.strike(t0 + 7 + k * 2.4, 147, 0.05, out, 1.3);
        end = t0 + 8 + N * 2.4;
        break;
      }
      case 'quarter':
      case 'hour': {                          // the Westminster quarters, and Big Ben on the hour
        const Q = [null, [68, 66, 64, 59], [64, 68, 66, 59], [64, 66, 68, 64], [68, 64, 66, 59], [59, 66, 68, 64]];
        const seq = kind === 'hour' ? [2, 3, 4, 5] : [[1], [2, 3], [4, 5, 1]][N - 1];
        let w = t0;
        for (const c of seq) { Q[c].forEach((m, i) => this.strike(w + i * 0.75 * (i === 3 ? 1.4 : 1), mtof(m), 0.035, out, 0.9)); w += 4.4; }
        if (kind === 'hour') for (let k = 0; k < N; k++) this.strike(w + 2 + k * 4.6, mtof(52), 0.07, out, 2);
        end = w + (kind === 'hour' ? 2 + N * 4.6 : 0);
        break;
      }
      case 'toki': strokes(N, 7, (w) => this.bonsho(w, 98, 0.06, out)); break;
      case 'bonsho': strokes(9, 9, (w) => this.bonsho(w, 88, 0.07, out)); break;
      case 'hanshan': strokes(12, 8, (w) => this.bonsho(w, 104, 0.04, out)); break;   // across the water, far
      case 'watch': {                         // the watchman at the watch's start: clapper beats, N strokes of the gong, the call
        const bus = this.spot(out, -0.4 + Math.random() * 0.8, 0, 12, 3200, 1);
        for (const d of [0, 1.1, 1.4, 3.4, 4.5, 4.8]) this.cue(t0 + d, (w) => this.knock(w, d % 3.4 ? 960 : 820, 0.04, bus));
        for (let k = 0; k < N; k++) this.cue(t0 + 7.5 + k * 2.4, (w) => this.gong(w, 330, 0.035, bus));
        this.cue(t0 + 8.5 + N * 2.4, (w) => this.cry(w, 125, FIRE_CALL, 0.045, bus, { cutoff: 3500 }));
        return;                               // short, and his own: not the one thing at a time
      }
      case 'temple-am':
      case 'temple-pm': {                     // 晨钟暮鼓: the bell then the drum at dawn, the drum then the bell at dusk, then the service
        // the bell's 108 strokes (18 fast, 18 slow, 18 between, twice) shortened to 6 + 6 + 6
        const bell = (at) => { let w = at; for (const [n, gap, dec] of [[6, 1.25, 0.45], [6, 4.2, 1], [6, 2.5, 0.7]]) for (let k = 0; k < n; k++) { this.cue(w, (x) => this.templeBell(x, 110, 0.06, out, dec)); w += gap; } return w; };
        const drum = (at) => {                // one roll on the great drum, quickening and dying away (as drumRolls), a beat a cue
          let w = at, gap = 0.9;
          for (let k = 0; k < 24; k++) {
            const v = 0.06 * (0.5 + 0.5 * Math.sin(Math.PI * k / 24));
            this.cue(w, (x) => { this.tone(x, [[0, 72], [0.25, 48]], 0.6, v, out); this.burst(x, 0.08, 700, 1, 0.02, out); });
            w += gap; gap = Math.max(0.12, gap * 0.88);
          }
          return w + 1.5;
        };
        const e = kind === 'temple-am' ? drum(bell(t0) + 1.5) : bell(drum(t0) + 0.5);
        end = this.chant(e + 3, 56, 0.035, out);
        break;
      }
      case 'bosingak': strokes(33, 5, (w) => this.bonsho(w, 82, 0.065, out, 0.33)); break;   // the great bell's slow beat
      case 'zhong': strokes(18, 4.5, (w) => this.bonsho(w, 110, 0.05, out)); break;
      case 'gu': end = this.drumRolls(t0, out, 3); break;
      case 'drum-tower': { const e = this.drumRolls(t0, out, 2); for (let k = 0; k < 18; k++) this.bonsho(e + 2 + k * 4.5, 92, 0.05, out); end = e + 2 + 18 * 4.5; break; }
      case 'zvon': {                          // the blagovest tolls, then all the bells together
        for (let k = 0; k < 12; k++) this.strike(t0 + k * 2.6, 98, 0.06, out, 1.8);
        const w = t0 + 33;
        for (let k = 0; k < 48; k++) {
          const beat = k * 0.36;
          if (k % 4 === 0) this.strike(w + beat, 98, 0.05, out, 1.5);
          if (k % 2 === 1) this.strike(w + beat, 294, 0.03, out, 0.6);
          this.strike(w + beat + 0.05, [587, 659, 784, 880][k % 4], 0.018, out, 0.35);
        }
        end = w + 18;
        break;
      }
      case 'semantron': for (let k = 0; k < 3; k++) this.semantron(t0 + k * 5, 0.12, out); end = t0 + 15; break;
      case 'dungchen': {                      // the long horns from the roofs, in pairs, and a conch
        for (let k = 0; k < 4; k++) this.horn(t0 + k * 7.5, k % 2 ? 62 : 58, 6.5, 0.03, out);
        this.conch(t0 + 31, 0.02, out); end = t0 + 36;
        break;
      }
      case 'puja': {                          // the hand bell rung through the worship, and the conch
        this.conch(t0, 0.02, out);
        for (let k = 0; k < 90; k++) this.strike(t0 + 3.5 + k * 0.13, 1480 + (k % 2) * 30, 0.008, out, 0.3);
        end = t0 + 16;
        break;
      }
      case 'adhan': {
        end = this.adhan(t0, arg === 'fajr', out, 0.05, 0);
        if (many) { this.adhan(t0 + 2.5 + Math.random() * 3, arg === 'fajr', out, 0.022, -2); this.adhan(t0 + 6 + Math.random() * 4, arg === 'fajr', out, 0.014, 1.5); }
        break;
      }
      default: return;
    }
    this.ringBusy = end;
  }

  /** One stroke of a western bell (hum, prime, tierce, quint, nominal…) at strike pitch f. */
  strike(when, f, level, dest, decay = 1) {
    const ctx = this.ctx;
    for (const [r, a, d] of [[0.5, 0.5, 5], [1, 0.8, 3.5], [1.19, 0.45, 2.5], [1.5, 0.3, 2], [2, 0.55, 1.6], [2.66, 0.2, 1.1], [3.0, 0.15, 0.8]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), D = d * decay;
      o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(level * a, when + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, when + D);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + D + 0.05);
    }
  }

  /**
   * A great East Asian bell struck with a swung log: the thud, then a deep hum with two close
   * partials beating slowly (the Korean bells' maeari), a few higher partials dying sooner.
   */
  bonsho(when, f, level, dest, beat = 0.9) {
    const ctx = this.ctx;
    this.burst(when, 0.12, 180, 1, level * 0.8, dest);
    for (const [r, a, d] of [[1, 1, 22], [1 + beat / f, 0.8, 22], [2.04, 0.5, 12], [2.76, 0.35, 8], [4.1, 0.2, 4], [5.4, 0.12, 2.5]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(level * a, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + d + 0.05);
    }
  }

  /** Rolls on a great drum, each quickening and dying away; returns when the last has ended. */
  drumRolls(t0, dest, n) {
    let w = t0;
    for (let r = 0; r < n; r++) {
      let gap = 0.9;
      for (let k = 0; k < 24; k++) {
        this.tone(w, [[0, 72], [0.25, 48]], 0.6, 0.06 * (0.5 + 0.5 * Math.sin(Math.PI * k / 24)), dest);
        this.burst(w, 0.08, 700, 1, 0.02, dest);
        w += gap; gap = Math.max(0.12, gap * 0.88);
      }
      w += 3;
    }
    return w;
  }

  /** A long horn (the Tibetan dungchen): a low, buzzing note swelling and fading. */
  horn(when, midi, dur, level, dest) {
    const ctx = this.ctx, f = mtof(midi - 24), o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), bg = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = 700; bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 3; bg.gain.value = 0.8;
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level, when + dur * 0.35); g.gain.setValueAtTime(level, when + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(lp); lp.connect(g); o.connect(bp); bp.connect(bg); bg.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + 0.05);
  }

  /** A conch blown: a hollow tone rising into its note, with breath. */
  conch(when, level, dest) {
    this.tone(when, [[0, 300], [0.5, 340], [3, 336]], 3.2, level, dest, 'triangle', ['lowpass', 1400]);
    this.burst(when, 3, 680, 4, level * 0.5, dest);
  }

  /**
   * The call to prayer, sung from a minaret: the phrases of the adhan (with the morning's extra
   * pair at Fajr), each a melismatic line in maqam bayati rising from the tonic and falling back,
   * with a pause between. A voice through the formants of its vowels; returns its end.
   */
  adhan(t0, fajr, dest, level, transpose) {
    const ctx = this.ctx;
    const B = [0, 1.5, 3, 5, 7, 8, 10, 12].map((s) => 62 + s + transpose);   // D bayati (E half-flat)
    const n = fajr ? 16 : 14;
    let w = t0;
    for (let p = 0; p < n; p++) {
      // a phrase: up to a peak degree, an ornament there, down to rest a degree above the tonic or on it
      const peak = Math.min(7, 2 + (p % 4) + (p > 9 ? 1 : 0)), notes = [];
      for (let d = 0; d <= peak; d += 1 + (Math.random() < 0.4 ? 1 : 0)) notes.push([B[d], 0.28 + Math.random() * 0.2]);
      notes.push([B[peak], 1.2 + Math.random() * 0.8], [B[Math.max(0, peak - 1)], 0.25], [B[peak], 0.3]);
      for (let d = peak - 1; d >= (p % 2); d--) notes.push([B[d], 0.3 + Math.random() * 0.25]);
      notes.push([B[p % 2], 1.4]);
      const dur = notes.reduce((s, [, d]) => s + d, 0);
      const o = ctx.createOscillator(), g = ctx.createGain(), v = ctx.createOscillator(), vg = ctx.createGain();
      o.type = 'sawtooth';
      let tt = w;
      o.frequency.setValueAtTime(mtof(notes[0][0] - 12), tt);
      for (const [m, d] of notes) { o.frequency.linearRampToValueAtTime(mtof(m - 12), tt + 0.09); tt += d; o.frequency.setValueAtTime(mtof(m - 12), tt); }
      v.frequency.value = 5.4; vg.gain.value = 1.6; v.connect(vg); vg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(level, w + 0.25); g.gain.setValueAtTime(level, w + dur - 0.6); g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
      const V = [[730, 1090, 2440], [570, 840, 2410], [300, 2200, 2900]][p % 3];
      V.forEach((fq, i) => { const bp = ctx.createBiquadFilter(), ag = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = 6 + i * 3; ag.gain.value = [1.8, 0.9, 0.4][i]; o.connect(bp); bp.connect(ag); ag.connect(g); });
      g.connect(dest); o.start(w); o.stop(w + dur + 0.05); v.start(w); v.stop(w + dur + 0.05);
      w += dur + 2.2 + Math.random() * 1.2;
    }
    return w;
  }

  /** Current output level (RMS, 0…1). */
  level() {
    if (!this.analyser) return 0;
    const a = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(a);
    let s = 0;
    for (const v of a) s += v * v;
    return Math.sqrt(s / a.length);
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.2);
  }

  /** Switch to a building's score and one of its zones. */
  set(score, zone) {
    if (!this.ctx) { this.score = score; this.zone = zone; return; }
    if (score !== this.score) {
      for (const [, l] of this.layers) this.fadeOut(l);
      this.layers.clear();
      this.score = score;
      this.zone = null;
    }
    if (!score || zone === this.zone) return;
    this.zone = zone;
    const t = this.ctx.currentTime;
    for (const [z, l] of this.layers) l.gain.gain.setTargetAtTime(z === zone ? 1 : 0, t, 1.2);
    if (!this.layers.has(zone)) this.layers.set(zone, this.makeLayer(score, zone));
  }

  /**
   * The room one is in: its acoustics (src/engine/acoustics.js roomAcoustics) or null outdoors.
   * The reverberation crossfades to the new room's impulse response; outdoors it is dry, with the
   * early reflections of surround().
   */
  room(A) {
    const key = A ? A.key : null;
    if (key === this.roomKey || !this.ctx) return;
    this.roomKey = key;
    if (A && !this.irCache.has(key)) {
      // the impulse response is generated in a worker: until it arrives keep the reverberation of
      // the room before (it crossfades in when ready, see irReady())
      this.irFor(A);
      return;
    }
    this.applyRoom(A);
  }

  applyRoom(A) {
    const key = A ? A.key : null;
    const ctx = this.ctx, t = ctx.currentTime;
    let target = null;
    if (A) {
      target = this.slots.find((s) => s.key === key) || this.slots.find((s) => s !== this.active) || this.slots[0];
      if (target.key !== key) { target.conv.buffer = this.irCache.get(key); target.key = key; target.rt = Math.max(A.rt[0], A.mid); }
      this.feed(target, true);
      target.gain.gain.setTargetAtTime(A.wet * 0.85, t, 0.5);
    }
    for (const s of this.slots) {
      if (s === target) continue;
      s.gain.gain.setTargetAtTime(0, t, 0.6);
      // unfed once the fade and the tail are over
      s.off = t + 3 + s.rt;
    }
    this.active = target;
    // a little less of the direct sound in a ringing hall (the music is heard partly through it)
    this.dry.gain.setTargetAtTime(A ? 1 - Math.min(0.35, A.wet * 0.3) : 1, t, 0.8);
    this.erGain = A ? 0 : 1;
    for (const p of this.taps) if (A) p.g.gain.setTargetAtTime(0, t, 0.3);
  }

  feed(s, on) {
    if (on && !s.fed) { this.wetIn.connect(s.conv); s.fed = true; s.off = 0; }
    else if (!on && s.fed) { try { this.wetIn.disconnect(s.conv); } catch { /* not connected */ } s.fed = false; }
  }

  /**
   * Make ready, a little at a time, the impulse responses of the rooms of the building one is
   * near, so that stepping into a hall does not wait for its reverberation to be generated.
   */
  prepare(list) {
    if (!this.ctx) return;
    const todo = list.filter((A, i) => A && !this.irCache.has(A.key) && !this.irPending?.has(A.key) && list.findIndex((B) => B?.key === A.key) === i).slice(0, 4);
    clearTimeout(this.prepT);
    const next = () => { const A = todo.shift(); if (!A) return; this.irFor(A); this.prepT = setTimeout(next, 400); };
    this.prepT = setTimeout(next, 400);
  }

  /**
   * The impulse response of a room: the cached buffer, or null while a worker generates it (once
   * per room, a few kept). Rooms wanted are applied when their buffer arrives (irReady).
   */
  irFor(A) {
    if (this.irCache.has(A.key)) return this.irCache.get(A.key);
    this.irPending ||= new Map();
    if (this.irPending.has(A.key)) return null;
    this.irPending.set(A.key, A);
    const sr = this.ctx.sampleRate;
    if (this.irWorker === undefined) {
      try {
        this.irWorker = new Worker(new URL('./ir-worker.js', import.meta.url), { type: 'module' });
        this.irWorker.onmessage = (e) => this.irReady(e.data.id, e.data.ch);
        this.irWorker.onerror = () => { this.irWorker = null; for (const B of [...this.irPending.values()]) this.irReady(B.key, impulseResponse(B, sr)); };
      } catch { this.irWorker = null; }
    }
    if (this.irWorker) this.irWorker.postMessage({ id: A.key, A, sr });
    else setTimeout(() => this.irReady(A.key, impulseResponse(A, sr)), 0);
    return null;
  }

  irReady(key, ch) {
    const A = this.irPending?.get(key);
    if (!A) return;
    this.irPending.delete(key);
    const ctx = this.ctx;
    const b = ctx.createBuffer(2, ch[0].length, ctx.sampleRate);
    b.getChannelData(0).set(ch[0]); b.getChannelData(1).set(ch[1]);
    if (this.irCache.size >= 5) this.irCache.delete(this.irCache.keys().next().value);
    this.irCache.set(key, b);
    // the room one is in was waiting for it: crossfade now
    if (this.roomKey === key && this.active?.key !== key) this.applyRoom(A);
  }

  /**
   * Outdoors, the walls round: dists (m) in 8 directions, the first ahead and then clockwise
   * (Infinity where nothing stands within reach). Each near wall sends back one reflection, its
   * delay the path there and back, its level falling with the distance; none when indoors.
   */
  surround(dists) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    dists.forEach((d, i) => {
      const tap = this.taps[i];
      if (!tap) return;
      const near = Number.isFinite(d) && d < 70;
      const g = near ? this.erGain * 0.55 * Math.min(1, 3 / Math.max(1, d)) ** 0.8 : 0;
      if (near) tap.d.delayTime.setTargetAtTime(Math.min(0.45, 2 * d / 343), t, 0.4);
      tap.g.gain.setTargetAtTime(g, t, 0.4);
      tap.p.pan.value = Math.sin(i * Math.PI / 4) * 0.8;
    });
  }

  fadeOut(l) {
    l.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 1.0);
    setTimeout(() => { for (const o of l.stops) try { o.stop(); } catch { /* already stopped */ } l.gain.disconnect(); }, 6000);
  }

  makeLayer(score, zone) {
    const ctx = this.ctx, Z = score.zones[zone] || {};
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
    gain.connect(this.bus);
    const stops = [];
    if (Z.drone) {
      for (const off of Z.drone.notes) {
        const f = mtof(score.tonic + off);
        const g = ctx.createGain();
        g.gain.value = Z.drone.level / Z.drone.notes.length;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        const vib = ctx.createOscillator(), vg = ctx.createGain();
        vib.frequency.value = 4.6 + Math.random(); vg.gain.value = f * 0.004;
        vib.connect(vg); vg.connect(osc.frequency);
        const breath = ctx.createOscillator(), bg = ctx.createGain();
        breath.frequency.value = 0.07 + Math.random() * 0.05; bg.gain.value = Z.drone.level / Z.drone.notes.length * 0.5;
        breath.connect(bg); bg.connect(g.gain);
        if (Z.drone.timbre === 'voice') {
          // two vowel formants ("ah")
          for (const [fq, q, a] of [[730, 6, 1], [1090, 8, 0.5]]) {
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q;
            const ag = ctx.createGain(); ag.gain.value = a * 1.6;
            osc.connect(bp); bp.connect(ag); ag.connect(g);
          }
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
          osc.connect(lp); lp.connect(g);
        } else if (Z.drone.timbre === 'sho') {
          // the shō: free reeds in bamboo pipes, a bright, still cluster that swells and fades
          osc.type = 'square'; vg.gain.value = f * 0.0008;
          bg.gain.value = Z.drone.level / Z.drone.notes.length * 0.9;
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 5; lp.Q.value = 0.5;
          const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = f * 0.8;
          osc.connect(hp); hp.connect(lp); lp.connect(g);
        } else {
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 3.2; lp.Q.value = 0.7;
          osc.connect(lp); lp.connect(g);
        }
        g.connect(gain);
        osc.start(); vib.start(); breath.start();
        stops.push(osc, vib, breath);
      }
    }
    return { gain, stops };
  }

  /** Karplus–Strong plucked string, rendered once per pitch. */
  harpBuffer(midi) {
    if (this.harpCache.has(midi)) return this.harpCache.get(midi);
    const ctx = this.ctx, sr = ctx.sampleRate, f = mtof(midi);
    const n = Math.floor(sr * 3.2), P = Math.max(2, Math.round(sr / f));
    const b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    const ring = new Float32Array(P);
    for (let i = 0; i < P; i++) ring[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(Math.PI * i / P));
    let idx = 0, prev = 0;
    const damp = 0.996 - Math.min(0.006, f / 120000);
    for (let i = 0; i < n; i++) {
      const cur = ring[idx];
      const next = ring[(idx + 1) % P];
      const v = damp * 0.5 * (cur + next);
      ring[idx] = v;
      d[i] = cur * 0.6 + prev * 0.4;
      prev = cur;
      idx = (idx + 1) % P;
    }
    this.harpCache.set(midi, b);
    return b;
  }

  pluck(midi, when, level, timbre) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.harpBuffer(midi);
    const g = ctx.createGain();
    g.gain.value = level;
    // the kithara's gut strings over a wooden box sound brighter and drier than the harp
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = timbre === 'kithara' ? 5200 : timbre === 'oud' ? 1900 : timbre === 'pipa' ? 4200 : timbre === 'koto' ? 3600 : 3200;
    src.connect(lp); lp.connect(g); g.connect(this.layers.get(this.zone).gain);
    src.start(when);
  }

  /** A reed melody note: two slightly detuned pipes (the double aulos), nasal formant, breath. */
  blow(midi, when, dur, level) {
    const ctx = this.ctx, f = mtof(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(level, when + 0.08);
    g.gain.setValueAtTime(level, when + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1250; bp.Q.value = 1.4;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 6;
    for (const det of [-4, 4]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      const v = ctx.createOscillator(), vg = ctx.createGain();
      v.frequency.value = 5.2; vg.gain.value = f * 0.006;
      v.connect(vg); vg.connect(o.frequency);
      o.connect(bp); o.start(when); o.stop(when + dur + 0.05); v.start(when); v.stop(when + dur + 0.05);
    }
    bp.connect(lp); lp.connect(g); g.connect(this.layers.get(this.zone).gain);
  }

  /** A sung note: two voices a few cents apart through the formants of a vowel. */
  sing(midi, when, dur, level) {
    const ctx = this.ctx, f = mtof(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(level, when + 0.22);
    g.gain.setValueAtTime(level, when + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const vowels = [[730, 1090, 2440], [570, 840, 2410], [530, 1840, 2480], [300, 870, 2240]];
    const V = vowels[Math.floor(Math.random() * vowels.length)];
    const mix = ctx.createGain(); mix.gain.value = 1;
    V.forEach((fq, i) => {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = 7 + i * 3;
      const ag = ctx.createGain(); ag.gain.value = [1.6, 0.8, 0.35][i];
      mix.connect(bp); bp.connect(ag); ag.connect(g);
    });
    const body = ctx.createBiquadFilter(); body.type = 'lowpass'; body.frequency.value = Math.max(400, f * 2.5);
    const bg = ctx.createGain(); bg.gain.value = 0.5;
    mix.connect(body); body.connect(bg); bg.connect(g);
    for (const det of [-7, 6]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      const v = ctx.createOscillator(), vg = ctx.createGain();
      v.frequency.value = 4.8 + Math.random() * 0.6; vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(f * 0.007, when + 0.6);
      v.connect(vg); vg.connect(o.frequency);
      if (this.ornament) {
        // melismatic ornament: slide up into the note, a turn around it before it settles
        o.detune.setValueAtTime(det - 120, when);
        o.detune.linearRampToValueAtTime(det, when + 0.12);
        if (dur > 1.2 && Math.random() < 0.6) {
          const t1 = when + dur * 0.45;
          o.detune.setValueAtTime(det, t1); o.detune.linearRampToValueAtTime(det + 150, t1 + 0.12);
          o.detune.linearRampToValueAtTime(det - 100, t1 + 0.26); o.detune.linearRampToValueAtTime(det, t1 + 0.38);
        }
      }
      o.connect(mix); o.start(when); o.stop(when + dur + 0.05); v.start(when); v.stop(when + dur + 0.05);
    }
    g.connect(this.layers.get(this.zone).gain);
  }

  /** The reed flute (ney): a breathy, nearly pure tone with a soft attack. */
  flute(midi, when, dur, level) {
    const ctx = this.ctx, f = mtof(midi), sr = ctx.sampleRate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(level, when + 0.18);
    g.gain.setValueAtTime(level * 0.85, when + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 4.2; vg.gain.value = f * 0.005;
    v.connect(vg); vg.connect(o.frequency);
    const og = ctx.createGain(); og.gain.value = 0.8; o.connect(og); og.connect(g);
    // breath: band-passed noise around the note
    const n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.floor(sr * (dur + 0.1)), sr), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 2.5;
    const ng = ctx.createGain(); ng.gain.value = 0.35;
    n.connect(bp); bp.connect(ng); ng.connect(g);
    g.connect(this.layers.get(this.zone).gain);
    o.start(when); o.stop(when + dur + 0.05); v.start(when); v.stop(when + dur + 0.05); n.start(when);
  }

  /** A peal of church bells: a few strikes of an inharmonic bell (hum, prime, tierce, quint, nominal). */
  bells(when, level) {
    const ctx = this.ctx;
    const base = [196, 233, 262][Math.floor(Math.random() * 3)];
    for (let s = 0; s < 3; s++) {
      const t0 = when + s * 1.4, f0 = base * [1, 0.89, 0.75][s];
      for (const [r, a, d] of [[0.5, 0.5, 5], [1, 0.8, 3.5], [1.19, 0.45, 2.5], [1.5, 0.3, 2], [2, 0.55, 1.6], [2.66, 0.2, 1.1], [3.0, 0.15, 0.8]]) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f0 * r;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(level * a * 0.4, t0 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(g); g.connect(this.layers.get(this.zone).gain);
        o.start(t0); o.stop(t0 + d + 0.05);
      }
    }
  }

  /** The wooden fish (muyu): a hollow knock. */
  woodfish(when, level) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(820, when); o.frequency.exponentialRampToValueAtTime(640, when + 0.05);
    g.gain.setValueAtTime(level, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.11);
    o.connect(g); g.connect(this.layers.get(this.zone).gain); o.start(when); o.stop(when + 0.13);
  }

  /** The bowl-bell (qing): a long shimmering ring, slightly beating partials. */
  qing(when, level) {
    const ctx = this.ctx;
    for (const [r, a, d] of [[1, 1, 9], [1.004, 0.6, 9], [2.71, 0.45, 5], [5.15, 0.25, 3], [8.3, 0.12, 1.6]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 523 * r;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(level * a * 0.35, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(g); g.connect(this.layers.get(this.zone).gain); o.start(when); o.stop(when + d + 0.05);
    }
  }

  /** The semantron: a wooden board struck with a mallet, in a run that quickens. */
  semantron(when, level, dest = this.layers.get(this.zone).gain) {
    const ctx = this.ctx, sr = ctx.sampleRate;
    let t = when;
    for (let i = 0; i < 9; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const pitch = i % 3 === 2 ? 520 : 690;
      o.frequency.setValueAtTime(pitch, t);
      g.gain.setValueAtTime(level, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      const n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.floor(sr * 0.03), sr), d = b.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.exp(-k / (sr * 0.004));
      n.buffer = b;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = pitch * 2.2; bp.Q.value = 3;
      const ng = ctx.createGain(); ng.gain.value = level * 0.6;
      o.connect(g); n.connect(bp); bp.connect(ng);
      g.connect(dest); ng.connect(dest);
      o.start(t); o.stop(t + 0.1); n.start(t);
      t += 0.42 - i * 0.03;
    }
  }

  sistrum(when, level) {
    const ctx = this.ctx, sr = ctx.sampleRate;
    const n = Math.floor(sr * 0.9), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    // metal discs on rods: a few shakes of inharmonic jingles
    const parts = [4200, 5600, 6900, 8300, 9700];
    for (let s = 0; s < 3; s++) {
      const off = Math.floor(s * 0.16 * sr);
      for (let i = 0; i < n - off; i++) {
        const t = i / sr, env = Math.exp(-t * 9);
        let v = 0;
        for (const p of parts) v += Math.sin(2 * Math.PI * p * t * (1 + s * 0.01)) * (Math.random() * 0.6 + 0.4);
        d[i + off] += v * env * 0.08 * (1 - s * 0.25);
      }
    }
    const src = ctx.createBufferSource(); src.buffer = b;
    const g = ctx.createGain(); g.gain.value = level;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    src.connect(hp); hp.connect(g); g.connect(this.layers.get(this.zone).gain);
    src.start(when);
  }

  drum(when, level) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(115, when);
    o.frequency.exponentialRampToValueAtTime(62, when + 0.18);
    g.gain.setValueAtTime(level, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.45);
    o.connect(g); g.connect(this.layers.get(this.zone).gain);
    o.start(when); o.stop(when + 0.5);
    // skin slap
    const n = ctx.createBufferSource(), sr = ctx.sampleRate;
    const b = ctx.createBuffer(1, Math.floor(sr * 0.06), sr), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.012));
    n.buffer = b;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.8;
    const ng = ctx.createGain(); ng.gain.value = level * 0.5;
    n.connect(bp); bp.connect(ng); ng.connect(this.layers.get(this.zone).gain);
    n.start(when);
  }

  tick() {
    if (this.ctx?.state !== 'running') return;          // muted (suspended): nothing to schedule
    for (const s of this.slots) if (s !== this.active && s.fed && s.off && this.ctx.currentTime > s.off) this.feed(s, false);
    if (this.plc) this.placeEvents();
    const ctx = this.ctx, S = this.score;
    if (!ctx || !S || !this.zone || !this.layers.has(this.zone) || this.volume <= 0) return;
    const Z = S.zones[this.zone] || {};
    const spb = 60 / S.tempo;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + 0.05;
    while (this.next < ctx.currentTime + 0.3) {
      const t = this.next, beat = this.beat++;
      // harp phrases: a few notes moving by step or leap within the mode, then rests
      if (Z.harp) {
        if (this.phrase.left <= 0 && Math.random() < Z.harp.density * 0.4) this.phrase.left = 3 + Math.floor(Math.random() * 6);
        if (this.phrase.left > 0) {
          this.phrase.left--;
          const sc = S.scale, [lo, hi] = Z.harp.range;
          this.phrase.deg += [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
          const maxDeg = Math.floor((hi / 12) * sc.length) + sc.length, minDeg = Math.floor((lo / 12) * sc.length);
          this.phrase.deg = Math.max(minDeg, Math.min(maxDeg, this.phrase.deg));
          const deg = this.phrase.deg, oct = Math.floor(deg / sc.length), st = sc[((deg % sc.length) + sc.length) % sc.length];
          const midi = S.tonic + oct * 12 + st;
          const swing = (Math.random() - 0.5) * 0.06;
          this.pluck(midi, t + swing, Z.harp.level * (0.6 + Math.random() * 0.4), Z.harp.timbre);
          if (Math.random() < 0.18) this.pluck(midi - 7, t + swing + 0.02, Z.harp.level * 0.5, Z.harp.timbre);     // a fifth below
          if (this.phrase.left === 0) this.beat += 2 + Math.floor(Math.random() * 4);           // breath between phrases
        }
      }
      // reed melody: long notes moving by step, often answering the strings
      if (Z.lead && (Z.lead.rhythm || beat % 2 === 0) && Math.random() < Z.lead.density) {
        const sc = S.scale, [lo, hi] = Z.lead.range;
        this.leadDeg = (this.leadDeg ?? Math.floor(sc.length * 1.5)) + [-1, -1, 0, 1, 1, 2, -2][Math.floor(Math.random() * 7)];
        const minDeg = Math.ceil((lo / 12) * sc.length), maxDeg = Math.floor((hi / 12) * sc.length);
        this.leadDeg = Math.max(minDeg, Math.min(maxDeg, this.leadDeg));
        const d = this.leadDeg, midi = S.tonic + Math.floor(d / sc.length) * 12 + sc[((d % sc.length) + sc.length) % sc.length];
        this.ornament = !!Z.lead.ornament;
        if (Z.lead.timbre === 'voice') this.sing(midi, t, Z.lead.rhythm ? spb * Z.lead.rhythm[beat % Z.lead.rhythm.length] * 1.05 : spb * (2 + Math.random() * 2.5), Z.lead.level);
        else if (Z.lead.timbre === 'ney') this.flute(midi, t, spb * (1.5 + Math.random() * 2.5), Z.lead.level);
        else this.blow(midi, t, spb * (1.5 + Math.random() * 2), Z.lead.level);
      }
      if (Z.semantron && beat % Z.semantron.every === 0 && Math.random() < 0.5) this.semantron(t, Z.semantron.level);
      if (Z.sistrum && beat % Z.sistrum.every === Z.sistrum.every - 1 && Math.random() < 0.7) this.sistrum(t, Z.sistrum.level);
      if (Z.drum) {
        const p = Z.drum.pattern, v = p[beat % p.length];
        if (v && Math.floor(beat / p.length) % (Z.drum.every || 1) === 0) this.drum(t, Z.drum.level * v);
      }
      if (Z.bells && beat % Z.bells.every === 0) this.bells(t, Z.bells.level);
      if (Z.woodfish) this.woodfish(t, Z.woodfish.level * (beat % 4 === 0 ? 1 : 0.7));
      if (Z.qing && beat % Z.qing.every === 0) this.qing(t, Z.qing.level);
      this.next += Z.lead?.rhythm ? spb * Z.lead.rhythm[beat % Z.lead.rhythm.length] : spb * (Math.random() < 0.2 ? 1.5 : 1);
    }
  }
}
