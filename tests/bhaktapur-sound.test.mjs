// Bhaktapur's sounds (docs/settlements/bhaktapur.md §17): the placed map and the Bhaktapur voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { BHK_VOICES } from '../src/settlements/bhaktapur/voices.js';
import * as BK from '../src/settlements/bhaktapur/soundmap.js';
import { NYA, BHA } from '../src/settlements/bhaktapur/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };


const profile = () => profileOf('bhaktapur');

test('Bhaktapur: the profile carries the map; nothing of Suzhou is asked of the streets', () => {
  const L = profile().animals[LIFE];
  assert.equal(L.map, BK);
  for (const [r, l] of [[90, 40], [80, 30], [90, 34]]) assert.equal(BK.streetTrack(0, 20, () => 0.5, r, l), null);
  assert.equal(BK.canalSpot(0, 0), null);
  assert.ok(BK.TRACKS.every((t) => t.voice.startsWith('bhk')));
  assert.equal(profile().bells, null, 'the puja is placed, not the engine\'s far bell');
});

test('Bhaktapur: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profile().animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of BHK_VOICES) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...BK.EMITTERS.map((e) => e.voice), ...BK.TRACKS.map((t) => t.voice)]);
  for (const s of BK.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(BK.ROOMS), BK.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Bhaktapur: emitters are well formed, in their hours', () => {
  for (const e of BK.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 200, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const night = (v) => BK.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 19 && e.hours[1] <= 5.5);
  assert.ok(night('bhkJackal'), 'jackals at night');
  assert.ok(BK.EMITTERS.filter((e) => e.voice === 'bhkPuja').every((e) => e.at[0] < BHA.c[0] && Math.abs(e.at[1] - BHA.c[1]) < 2), 'the puja at the Bhairabnath\'s front');
  assert.ok(BK.EMITTERS.filter((e) => e.voice === 'wheel').length === 4 && BK.EMITTERS.filter((e) => e.voice === 'bhkKiln').length === 2);
  assert.ok(BK.EMITTERS.filter((e) => e.voice === 'bhkWindBells').some((e) => e.at[0] === NYA.c[0]), 'the Nyatapola\'s bells');
});

test('Bhaktapur: rooms, lanes, planting', () => {
  for (const s of BK.sites()) { assert.ok(BK.ROOMS[s.use], s.use); assert.ok(BK.roomAt(s.at[0], s.at[1], 0.3), s.id); }
  assert.equal(BK.roomAt(19.25, 28.25, 0.3).use, 'home');
  assert.equal(BK.roomAt(BHA.c[0], BHA.c[1], 3.2).use, 'sanctum');
  assert.equal(BK.roomAt(0, 0, 0), null, 'the square is the open');
  for (const r of [...Object.values(BK.ROOMS), BK.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const rnd = () => 0.4;
  const t = BK.TRACKS[1].get(0, 30, rnd);
  assert.ok(t && t.pts.length === 2, 'a hawker on a lane');
  assert.ok(BK.treeSpot(-22, -30, rnd) && !BK.treeSpot(150, 150, rnd));
  assert.ok(BK.townNear(0, 0) > BK.townNear(170, 0) && BK.frogGround(0, 0) === 0 && BK.frogGround(180, 0) > 0.3);
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0.4;
  const calls = {};
  for (const v of [...BHK_VOICES, 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'wheel', 'loom']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profile().animals, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.2, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Bhaktapur placed: the square, dusk, Pottery Square, night', () => {
  let c = listen({ x: 0, z: 0, hour: 10, secs: 240 });
  assert.ok(c.bhkWindBells > 2, `the Nyatapola's bells (${c.bhkWindBells})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: BHA.c[0] - 8, z: BHA.c[1], hour: 18.3, secs: 300 });
  assert.ok(c.bhkPuja > 0, `the dusk puja (${c.bhkPuja})`);
  c = listen({ x: -75, z: 70, hour: 11, secs: 240 });
  assert.ok(c.wheel > 0 && c.bhkKiln > 0, 'the potters work');
  c = listen({ x: 0, z: 40, hour: 23, secs: 400 });
  assert.ok(!c.bhkMurmur && !c.wheel && !c.bhkPuja, 'the market and the kilns are quiet at night');
  assert.ok((c.bhkDogs || 0) + (c.bhkWalker || 0) + (c.bhkWindBells || 0) > 0, 'the night has its dogs, its walker and its bells');
});
