// Tikal's placed sounds (src/settlements/maya-tikal/soundmap.js, src/engine/voices-tikal.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { TIK_VOICES } from '../src/engine/voices-tikal.js';
import * as TK from '../src/settlements/maya-tikal/soundmap.js';
import { groups } from '../src/settlements/maya-tikal/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const L = profileOf('maya-tikal').animals[LIFE];
  assert.equal(L.map, TK);
  assert.ok(L.market > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('maya-tikal').animals, roof: 'thatch' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(TIK_VOICES)) {
    assert.ok(v.startsWith('tik'), v);
    assert.equal(typeof m[v], 'function', v);
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...TK.EMITTERS.map((e) => e.voice), ...TK.TRACKS.map((t) => t.voice)]);
  for (const s of TK.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(TK.ROOMS), TK.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters sane, the rites at their hours, rooms found, the market loud at the market', () => {
  for (const e of TK.EMITTERS) assert.ok(Math.hypot(...e.at) < 330 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice + ' ' + e.at);
  const conch = TK.EMITTERS.filter((e) => e.voice === 'tikConch');
  assert.ok(conch.length >= 9, 'three temples at dawn, noon and dusk');
  assert.ok(conch.some((e) => Math.hypot(e.at[0] - 59, e.at[1]) < 20), 'one on Temple I');
  const sites = TK.sites();
  assert.ok(sites.length >= 40, 'the craftsmen\'s houses, the palace rooms, the hall');
  for (const s of sites) assert.ok(TK.roomAt(...s.at, s.y + 0.4), s.id);
  assert.ok(sites.filter((s) => s.use === 'workshop').some((s) => s.work.some(([v]) => v === 'tikKnap')), 'an obsidian knapper');
  assert.ok(sites.some((s) => s.use === 'hearth'), 'a cook');
  assert.equal(TK.roomAt(...TK.HOME, 0), null, 'the arrival is in the open');
  assert.equal(TK.roomAt(...sites[0].at, 8), null, 'nobody in the room from high above it');
  assert.equal(TK.townNear(110, 40), 1);
  assert.ok(TK.townNear(0, 0) > 0.4 && TK.townNear(-300, 0) < 0.2);
  assert.equal(TK.canalSpot(0, 0), null);
  assert.ok(groups().length > 20);
});

test('placed: the conch at dawn, the market by day, the howlers and the owls at their hours, a quieter night', () => {
  const run = (hour, at) => {
    const { m, ctx } = music();
    m.doyOverride = 150; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(TIK_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('maya-tikal').animals;
    const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x: at[0], z: at[1], y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 900 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const dawn = run(6, [30, 20]);
  assert.ok((dawn.tikConch || 0) + (dawn.tikDrum || 0) > 0, JSON.stringify(dawn));
  const day = run(10, [110, 40]);
  assert.ok((day.tikCry || 0) + (day.tikFlute || 0) + (day.tikDrum || 0) > 0, JSON.stringify(day));
  const night = run(1, [-250, -110]);
  assert.ok(!night.tikCry && !night.tikMetate && !night.tikPlaster, 'the market, the metate and the plasterers are silent at night');
  assert.ok((night.tikOwl || 0) > 0, JSON.stringify(night));
});
