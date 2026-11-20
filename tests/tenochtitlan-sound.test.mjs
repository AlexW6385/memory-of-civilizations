// Tenochtitlan's sounds (docs/settlements/tenochtitlan.md §22): the placed map (src/settlements/tenochtitlan/soundmap.js) and the voices
// (src/engine/voices-tenochtitlan.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { TNC_VOICES } from '../src/engine/voices-tenochtitlan.js';
import * as TN from '../src/settlements/tenochtitlan/soundmap.js';
import { openSet } from '../src/settlements/tenochtitlan/opened.js';
import { MARKET, TM } from '../src/settlements/tenochtitlan/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const P = profileOf('tenochtitlan'), L = P.animals[LIFE];
  assert.equal(L.map, TN);
  assert.ok(L.market > 0 && L.canal > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('tenochtitlan').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(TNC_VOICES)) {
    assert.ok(v.startsWith('tnc'), v);
    assert.equal(typeof m[v], 'function', v);
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...TN.EMITTERS.map((e) => e.voice), ...TN.TRACKS.map((t) => t.voice)]);
  for (const s of TN.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(TN.ROOMS), TN.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
  // a voice made without a track (an emitter's canoe at the landing) still lasts
  assert.ok(m.tncCanoe(ctx.currentTime, bus, 1) > 0);
});

test('the map: emitters sane, the rites at their hours, rooms found, the market loud at the market', () => {
  for (const e of TN.EMITTERS) assert.ok(Math.hypot(...e.at) < 420 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice);
  const drums = TN.EMITTERS.filter((e) => e.voice === 'tncHuehuetl');
  assert.equal(drums.length, 4, 'dawn, noon, dusk and the night watch');
  for (const d of drums) assert.ok(Math.hypot(d.at[0] - TM.c[0], d.at[1]) < 30, 'on the Templo Mayor');
  const sites = TN.sites();
  assert.equal(sites.length, openSet().size);
  assert.ok(sites.length >= 20);
  for (const s of sites) { assert.ok(s.work.length >= 4); assert.equal(TN.roomAt(...s.at, 0.5).use, 'hearth'); }
  assert.equal(TN.roomAt(...TN.HOME, 0), null, 'the arrival is in the open');
  assert.equal(TN.roomAt(127, -113, 1.5).use, 'hall', "the Eagles' main room");
  assert.equal(TN.roomAt(95, 10, 46).use, 'shrine', "Huitzilopochtli's shrine on the summit");
  const m = [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2];
  assert.equal(TN.townNear(...m), 1);
  assert.ok(TN.townNear(0, 0) > 0.2 && TN.townNear(0, 0) < 1 && TN.townNear(300, 300) < 0.2);
  const c = TN.canalSpot(-212, 0); assert.ok(c && c.d < 5, 'the lap at the west canal');
  const tr = TN.TRACKS[0].get(-200, 50, () => 0.4); assert.ok(tr && tr.pts.length === 2 && Math.abs(tr.pts[0][0] + 220) < 3, 'canoes on the west canal');
  assert.equal(TN.TRACKS[0].get(0, 0, () => 0.4), null, 'but none on the plaza');
});

test('placed: the temple at dawn and the market by day, a quieter night with owls', () => {
  const run = (hour, at) => {
    const { m, ctx } = music();
    m.doyOverride = 150; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(TNC_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('tenochtitlan').animals;
    const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x: at[0], z: at[1], y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 900 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const dawn = run(6, [40, 0]);
  assert.ok((dawn.tncHuehuetl || 0) + (dawn.tncConch || 0) > 0, JSON.stringify(dawn));
  const day = run(10, [-190, 55]);
  assert.ok((day.tncCry || 0) + (day.tncCanoe || 0) > 0, JSON.stringify(day));
  const night = run(1, [-230, -100]);
  assert.ok(!night.tncCry && !night.tncMetate, 'the market and the metate are silent at night');
});
