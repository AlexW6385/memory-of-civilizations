// Shibam's placed sounds (src/settlements/shibam/soundmap.js, src/engine/voices-shibam.js): the voices exist and can be made against a stand-in audio
// context, the map agrees with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as SB from '../src/settlements/shibam/soundmap.js';
import { shops } from '../src/settlements/shibam/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['shbOud', 'shbDan', 'shbBrick', 'shbCall'];

test('Shibam: the profile carries the map and the call to prayer', () => {
  const P = profileOf('shibam');
  assert.ok(P.animals[LIFE].map === SB);
  assert.ok(P.adhan > 0);
});

test('Shibam: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('shibam').animals, roof: 'flat', at: { x: -6, z: -8, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Shibam: the map agrees with the settlement', () => {
  const S = shops();
  assert.ok(SB.sites().length >= S.length + 2, `${SB.sites().length} sites`);
  for (const s of SB.sites()) { assert.ok(s.work.length); assert.ok(SB.ROOMS[s.use], s.use); }
  for (const k of ['shop:smith', 'shop:qahwa', 'shop:weaver', 'palace', 'mosque']) assert.ok(SB.sites().some((s) => s.use === k), k);
  for (const r of Object.values(SB.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(SB.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.ok(SB.EMITTERS.every((e) => Math.hypot(...e.at) < SB.EMITTERS.length * 400), 'places are numbers');
  assert.equal(SB.canalTrack(0, 0, () => 0.5), null);
  assert.ok(SB.townNear(0, -10) > 0.9 && SB.townNear(-9.5, 50) > 0.6 && SB.townNear(0, 170) < 0.3);
  assert.ok(SB.greenNear(0, 0) < 0.1 && SB.greenNear(0, 135) > 0.5, 'no green inside the wall, palms outside');
  const s0 = SB.sites()[0];
  assert.equal(SB.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(SB.roomAt(0, -10, 0), null, 'the square is the open');
  assert.ok(SB.treeSpot(0, 130, () => 0.3, 40), 'a palm');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wellBucket', 'donkeyBray', 'hammer', 'loom', 'recite', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('shibam').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Shibam placed: the brickyard by day, not at night, none in heavy rain', () => {
  assert.ok(listen({ x: 26, z: 118, hour: 9, secs: 300 }).calls.shbBrick > 0, 'bricks pressed');
  assert.ok(!listen({ x: 26, z: 118, hour: 2, secs: 200 }).calls.shbBrick, 'not at night');
});

test('Shibam placed: the evening drum in the square', () => {
  assert.ok(listen({ x: 18, z: -6, hour: 20, secs: 900 }).calls.shbDan > 0, 'the drum');
  assert.ok(!listen({ x: 18, z: -6, hour: 10, secs: 300 }).calls.shbDan, 'not by day');
});

test('Shibam placed: trades at their rooms, none of Suzhou\'s walkers', () => {
  const w = SB.sites().find((s) => s.use === 'shop:smith');
  const r = listen({ x: w.at[0], z: w.at[1] + 6, hour: 10, secs: 600 });
  assert.ok(r.calls.hammer > 0, 'the smith');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + 6, hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
});

test('Shibam placed: rooms', () => {
  const k = SB.sites().find((s) => s.use === 'shop:qahwa');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'shop:qahwa');
});
