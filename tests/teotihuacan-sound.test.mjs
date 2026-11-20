// Teotihuacan's sounds (docs/settlements/teotihuacan.md §20): the placed map (src/settlements/teotihuacan/soundmap.js) and the voices
// (src/engine/voices-teotihuacan.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { TTH_VOICES } from '../src/engine/voices-teotihuacan.js';
import * as TT from '../src/settlements/teotihuacan/soundmap.js';
import { MARKET, SUN, lodges } from '../src/settlements/teotihuacan/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const P = profileOf('teotihuacan'), L = P.animals[LIFE];
  assert.equal(L.map, TT);
  assert.ok(L.market > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('teotihuacan').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(TTH_VOICES)) {
    assert.ok(v.startsWith('tth'), v);
    assert.equal(typeof m[v], 'function', v);
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...TT.EMITTERS.map((e) => e.voice), ...TT.TRACKS.map((t) => t.voice)]);
  for (const s of TT.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(TT.ROOMS), TT.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters sane, the rites at their hours, rooms found, the market loud at the market', () => {
  for (const e of TT.EMITTERS) assert.ok(Math.hypot(...e.at) < 440 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice + ' ' + e.at);
  const conch = TT.EMITTERS.filter((e) => e.voice === 'tthConch');
  assert.ok(conch.length >= 9, 'the three temples at dawn, noon and dusk');
  assert.ok(conch.some((e) => Math.hypot(e.at[0] - SUN.c[0], e.at[1] - SUN.c[1]) < 20), 'one on the Sun');
  const sites = TT.sites();
  assert.ok(sites.length >= 24, 'the houses\' rooms, the compounds\' kitchens, the chambers');
  for (const s of sites) assert.ok(TT.roomAt(...s.at, s.y + 0.4), s.id);
  const kitchens = sites.filter((s) => s.use === 'hearth');
  assert.ok(kitchens.length >= 5);
  for (const s of kitchens) assert.ok(s.work.length >= 4);
  assert.ok(sites.some((s) => s.use === 'workshop' && s.work.some(([v]) => v === 'tthKnap')), 'an obsidian workshop');
  assert.equal(TT.roomAt(...TT.HOME, 0), null, 'the arrival is in the open');
  // a platform house's room is its own only at the platform's height, not on the plaza under it
  const d = lodges()[1], r = sites.find((s) => s.id === 'lodge:1:1');
  assert.ok(r && TT.roomAt(...r.at, r.y + 0.3)?.use === 'hearth');
  assert.equal(TT.roomAt(...r.at, 0.4), null, 'nobody in the room from the plaza below');
  void d;
  const m = [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2];
  assert.equal(TT.townNear(...m), 1);
  assert.ok(TT.townNear(0, 70) > 0.2 && TT.townNear(0, 70) < 1 && TT.townNear(300, -300) < 0.25);
  assert.equal(TT.canalSpot(0, 0), null);
});

test('placed: the temples at dawn and the market by day, a quieter night with owls', () => {
  const run = (hour, at) => {
    const { m, ctx } = music();
    m.doyOverride = 150; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(TTH_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('teotihuacan').animals;
    const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x: at[0], z: at[1], y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 900 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const dawn = run(6, [60, 20]);
  assert.ok((dawn.tthConch || 0) + (dawn.tthDrum || 0) > 0, JSON.stringify(dawn));
  const day = run(10, [-100, 259]);
  assert.ok((day.tthCry || 0) + (day.tthFlute || 0) + (day.tthDrum || 0) > 0, JSON.stringify(day));
  const night = run(1, [-250, -110]);
  assert.ok(!night.tthCry && !night.tthMetate && !night.tthPlaster, 'the market, the metate and the masons are silent at night');
});
