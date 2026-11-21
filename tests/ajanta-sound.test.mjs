// Ajanta's placed sounds (src/settlements/ajanta/soundmap.js, src/engine/voices-ajanta.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the emitters follow the monastic and working day. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as AJ from '../src/settlements/ajanta/soundmap.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['ajFall', 'ajRiver', 'ajGong', 'ajHandBell', 'ajChant', 'ajOxBell', 'ajBellows', 'ajWash'];

test('Ajanta: the profile carries the map', () => {
  const P = profileOf('ajanta'), L = P.animals[LIFE];
  assert.ok(L.map === AJ);
});

test('Ajanta: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('ajanta').animals, roof: 'thatch', at: { x: -21.5, z: -4, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  for (const e of AJ.EMITTERS) assert.equal(typeof m[e.voice], 'function', 'emitter voice ' + e.voice);
  for (const s of AJ.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', 'site voice ' + v);
});

test('Ajanta: the map agrees with the settlement', () => {
  const S = AJ.sites();
  assert.ok(S.length > 10, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length); assert.ok(AJ.ROOMS[s.use], s.use); }
  for (const k of ['home', 'smithy', 'potter', 'oilpress', 'weaver']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(AJ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(AJ.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2 && e.at.every(Number.isFinite)), 'every emitter well formed');
  for (const v of ['ajFall', 'ajRiver', 'ajGong', 'ajHandBell', 'ajChant', 'ajWash', 'chisel']) assert.ok(AJ.EMITTERS.some((e) => e.voice === v), v);
  assert.equal(AJ.canalTrack(0, 0, () => 0.5), null); assert.equal(AJ.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(AJ.townNear(-27, -46) > 0.9 && AJ.townNear(-80, -26) < 0.2);
  const s0 = S[0];
  assert.equal(AJ.roomAt(s0.at[0], s0.at[1], 8.5).same, s0.id);
  assert.equal(AJ.roomAt(-22, -4, 0), null, 'the east bank path is the open');
  assert.equal(AJ.roomAt(-70, -26, 9.5).use, 'vihara', 'Cave 1\'s hall'); assert.equal(AJ.roomAt(-90, -26, 9.5).use, 'sanctum');
  assert.equal(AJ.roomAt(-70, 24, 9.5).use, 'chaitya'); assert.equal(AJ.roomAt(-64, 46, 9.5).use, 'cellhall');
  assert.ok(AJ.treeSpot(-120, 0, () => 0.3, 40) !== undefined, 'tree spot answers');
});

test('Ajanta: the day is kept (the gong at dawn, noon and evening; the fall all day; the work by day)', () => {
  const inH = (h, [a, b]) => (a <= b ? h >= a && h < b : h >= a || h < b);
  const gong = AJ.EMITTERS.filter((e) => e.voice === 'ajGong');
  assert.equal(gong.length, 3);
  assert.ok(gong.some((e) => inH(5, e.hours)) && gong.some((e) => inH(10.8, e.hours)) && gong.some((e) => inH(17.7, e.hours)) && !gong.some((e) => inH(14, e.hours)));
  assert.ok(AJ.EMITTERS.filter((e) => e.voice === 'ajFall').every((e) => inH(3, e.hours) && inH(15, e.hours)));
  assert.ok(AJ.EMITTERS.filter((e) => e.voice === 'chisel').every((e) => inH(10, e.hours) && !inH(22, e.hours)));
  assert.ok(AJ.EMITTERS.filter((e) => e.voice === 'owl').every((e) => inH(23, e.hours) && !inH(12, e.hours)));
});
