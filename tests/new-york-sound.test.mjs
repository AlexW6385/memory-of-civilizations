// New York's sounds (docs/settlements/new-york.md §14): the placed map (src/settlements/new-york/soundmap.js) and the voices
// (src/engine/voices-ny.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { NY_VOICES } from '../src/engine/voices-ny.js';
import * as NY from '../src/settlements/new-york/soundmap.js';
import { toCity, DINER_AT } from '../src/settlements/new-york/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const P = profileOf('new-york'), L = P.animals[LIFE];
  assert.equal(L.map, NY);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('new-york').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(NY_VOICES)) {
    assert.ok(v.startsWith('ny'), v);
    assert.equal(typeof m[v], 'function', v);
    if (v === 'nyPlaced') continue;
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...NY.EMITTERS.map((e) => e.voice), ...NY.TRACKS.map((t) => t.voice)]);
  for (const s of NY.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(NY.ROOMS), NY.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters sane, shops open by day, rooms found, the city never silent', () => {
  for (const e of NY.EMITTERS) assert.ok(Math.hypot(...e.at) < 700 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.voice);
  const shops = NY.sites().filter((s) => s.use === 'shop');
  assert.ok(shops.length >= 8);
  for (const s of shops) for (const [, , h] of s.work) assert.deepEqual(h, NY.SHOP_HOURS);
  assert.equal(NY.roomAt(...toCity(...DINER_AT), 0.3).use, 'diner');
  assert.equal(NY.roomAt(...NY.HOME, 0), null, 'the arrival is in the street');
  NY.clock.hour = 3; assert.ok(NY.townNear(0, 0) > 0, 'never silent');
  NY.clock.hour = 13; assert.ok(NY.townNear(...NY.HOME) > 0.5);
  const el = NY.TRACKS.find((t) => t.key === 'el');
  assert.ok(el.ok(10, 0) && el.get(...toCity(-200, 0), () => 0.4)?.pts.length === 2, 'the El runs on Sixth Avenue');
  assert.equal(el.get(...toCity(300, 0), () => 0.4), null, 'but not far east');
});

test('placed: horns and the El by day, a quieter night', () => {
  const run = (hour) => {
    const { m, ctx } = music();
    m.doyOverride = 150; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(NY_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('new-york').animals;
    const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x: NY.HOME[0], z: NY.HOME[1], y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 600 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const day = run(13);
  assert.ok((day.nyHorn || 0) + (day.nyTraffic || 0) + (day.nyNewsboy || 0) > 0, JSON.stringify(day));
});
