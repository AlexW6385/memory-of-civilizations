// Mycenae's placed sounds (src/settlements/mycenae/soundmap.js, src/engine/voices-mycenae.js): the voices exist and can be made against a stand-in audio context, the map's places
// agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as MY from '../src/settlements/mycenae/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['myLyre', 'myQuern', 'myBellows', 'myLoomWeights', 'myGuardCall', 'myDrover', 'myWinnow'];

test('Mycenae: the profile carries the map', () => {
  assert.ok(profileOf('mycenae').animals[LIFE].map === MY);
});

test('Mycenae: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('mycenae').animals, roof: 'flat', at: { x: -136, z: 0, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 170;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Mycenae: the map agrees with the settlement', () => {
  assert.ok(MY.sites().length >= 12, `${MY.sites().length} sites`);
  for (const s of MY.sites()) { assert.ok(s.work.length); assert.ok(MY.ROOMS[s.use], s.use); }
  for (const k of ['smith', 'potter', 'magazine', 'cult']) assert.ok(MY.sites().some((s) => s.use === k), k);
  for (const r of Object.values(MY.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(MY.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(MY.canalTrack(0, 0, () => 0.5), null);
  assert.ok(MY.townNear(-125, 0) > 0.9 && MY.townNear(-40, 20) < 0.5);
  const s0 = MY.sites()[0];
  assert.equal(MY.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(MY.roomAt(-136, 0, 3), null, 'the road is the open');
  { let q = 0.11; assert.ok(MY.treeSpot(-140, 40, () => (q = (q * 7.31 + 0.137) % 1), 60), 'a tree on the slopes'); }
});

function listen({ x, z, y = 0, hour, doy = 170, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'hammer', 'kitchen', 'jarLid', 'owl', 'wellBucket', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('mycenae').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Mycenae placed: the lyre in the court by day and not in rain or at night', () => {
  assert.ok(listen({ x: 46, z: 3, y: 22.5, hour: 10, secs: 600 }).calls.myLyre > 0, 'the lyre in the court');
  assert.ok(!listen({ x: 46, z: 3, y: 22.5, hour: 2, secs: 300 }).calls.myLyre, 'not at night');
  assert.ok(!listen({ x: 46, z: 3, y: 22.5, hour: 10, rain: 0.9, secs: 300 }).calls.myLyre, 'not in the rain');
});

test('Mycenae placed: the smith\'s bellows at his house by day, none of Suzhou\'s walkers', () => {
  const w = MY.sites().find((s) => s.use === 'smith');
  const r = listen({ x: w.at[0], z: w.at[1] + 14, hour: 10, secs: 600 });
  assert.ok(r.calls.hammer > 0, 'the hammer');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + 14, hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
});

test('Mycenae placed: rooms', () => {
  const k = MY.sites().find((s) => s.use === 'magazine');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: k.y + 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'magazine');
});
