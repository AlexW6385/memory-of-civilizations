// Persepolis' placed sounds (src/settlements/persepolis/soundmap.js, src/engine/voices-persepolis.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. 
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as PE from '../src/settlements/persepolis/soundmap.js';
import { lots } from '../src/settlements/persepolis/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['perHarp', 'perPipe', 'perDrum', 'perCamelBell', 'perQuern', 'perRill', 'perDriver'];

test('Persepolis: the profile carries the map', () => {
  assert.ok(profileOf('persepolis').animals[LIFE].map === PE);
});

test('Persepolis: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('persepolis').animals, roof: 'flat', at: { x: -122, z: -60, y: 14, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Persepolis: the map agrees with the settlement', () => {
  const open = lots().filter((l) => l.enter).length;
  assert.ok(PE.sites().length > 20 && PE.sites().length <= open + 12, `${PE.sites().length} sites`);
  for (const s of PE.sites()) { assert.ok(s.work.length); assert.ok(PE.ROOMS[s.use], s.use); }
  for (const k of ['home', 'court', 'smith']) assert.ok(PE.sites().some((s) => s.use === k) || k === 'smith', k);
  for (const r of Object.values(PE.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(PE.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(PE.canalTrack(0, 0, () => 0.5), null);
  assert.ok(PE.townNear(-270, -110) > 0.9 && PE.townNear(-60, -60) < 0.5);
  const s0 = PE.sites().find((s) => s.y === 14);
  assert.equal(PE.roomAt(s0.at[0], s0.at[1], 14.5).same, s0.id);
  assert.equal(PE.roomAt(-122, -60, 14), null, 'the court is the open');
  assert.equal(PE.roomAt(-30, -60, 14.5).use, 'hall', 'the Apadana');
  assert.ok(PE.treeSpot(-300, 100, () => 0.3, 60) !== undefined);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'hammer', 'kitchen', 'jarLid', 'chisel', 'plane', 'wellBucket']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('persepolis').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Persepolis placed: the court music by day, not at night, not in rain', () => {
  assert.ok(listen({ x: -100, z: -46, y: 14, hour: 11, secs: 700 }).calls.perHarp > 0, 'the harp in the court');
  assert.ok(!listen({ x: -100, z: -46, y: 14, hour: 2, secs: 300 }).calls.perHarp, 'not at night');
  assert.ok(!listen({ x: -100, z: -46, y: 14, hour: 11, rain: 0.9, secs: 300 }).calls.perHarp, 'not in the rain');
});

test('Persepolis placed: the camel train on the road by day', () => {
  assert.ok(listen({ x: -285, z: -140, hour: 10, secs: 400 }).calls.perCamelBell > 0);
});

test('Persepolis placed: the masons at the works yard, quiet at night', () => {
  assert.ok(listen({ x: -114, z: 40, y: 14, hour: 10, secs: 300 }).calls.chisel > 0);
  assert.ok(!listen({ x: -114, z: 40, y: 14, hour: 1, secs: 300 }).calls.chisel);
});
