// Qufu's placed sounds (src/settlements/lu-qufu/soundmap.js, src/engine/voices-qufu.js): the voices exist and can be made against a stand-in audio context, the map's places
// agree with the settlement, and the emitters have their places and hours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as QF from '../src/settlements/lu-qufu/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['qfBell', 'qfChime', 'qfZither', 'qfYayue', 'qfDrum', 'qfYamen', 'qfBarrow', 'qfRoller'];

test('Qufu: the profile carries the map', () => {
  assert.ok(profileOf('lu-qufu').animals[LIFE].map === QF);
});

test('Qufu: every voice exists and can be made', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('lu-qufu').animals, roof: 'tile', at: { x: -26, z: -59, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  for (const e of QF.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const s of QF.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
  for (const r of Object.values(QF.ROOMS)) for (const [v] of r.work) assert.equal(typeof m[v], 'function', v);
});

test('Qufu: the map agrees with the settlement', () => {
  const S = QF.sites();
  assert.ok(S.length > 60, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work && s.work.length, s.id); assert.ok(QF.ROOMS[s.use], s.use); }
  assert.ok(S.some((s) => s.use.startsWith('shop-')) && S.some((s) => s.use === 'loom'));
  for (const r of Object.values(QF.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(QF.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  const s0 = S.find((s) => s.use.startsWith('shop-'));
  assert.equal(QF.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(QF.roomAt(0, 100, 0), null, 'the bridge is the open');
  assert.equal(QF.roomAt(0, -130, 2.2).use, 'hall');
  assert.ok(QF.townNear(0, 205) > 0.9 && QF.townNear(0, -150) < 0.3);
  assert.ok(QF.treeSpot(30, 30, ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(7), 40), 'a cypress in the temple');
  assert.ok(QF.streetTrack(0, 200, Math.random, 90, 30), 'a street to walk along');
});

test('Qufu: the drum at dusk and at the watches, the yamen in the morning', () => {
  const at = (v) => QF.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('qfDrum').length >= 5 && at('qfDrum').some((e) => e.hours[0] > 18 && e.hours[0] < 19));
  assert.ok(at('qfYamen').some((e) => e.hours[0] === 8));
  assert.deepEqual(QF.shopTrades(5, 4).length, 4);
});
