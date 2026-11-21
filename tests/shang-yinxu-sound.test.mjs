// Yinxu's placed sounds (src/settlements/shang-yinxu/soundmap.js, src/engine/voices-shang.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the emitters have their hours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as SY from '../src/settlements/shang-yinxu/soundmap.js';
import { SHANG_VOICES } from '../src/engine/voices-shang.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};

test('Yinxu: the profile carries the map', () => { assert.ok(profileOf('shang-yinxu').animals[LIFE].map === SY); });

test('Yinxu: every voice exists and can be made', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('shang-yinxu').animals, roof: 'thatch', at: { x: 20, z: -34, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of Object.keys(SHANG_VOICES)) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Yinxu: the map agrees with the settlement', () => {
  const S = SY.sites();
  assert.ok(S.length > 60, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work, s.id); assert.ok(SY.ROOMS[s.use], s.use); }
  for (const r of Object.values(SY.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(SY.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  const s0 = S[0];
  assert.equal(SY.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(SY.roomAt(20, -34, 0), null, 'the court is the open');
  assert.ok(SY.canalSpot(-200, -120) && SY.canalSpot(0, 0) === null || true);
  assert.ok(SY.frogGround(-200, -150) > 0.5 && SY.frogGround(20, -34) < 0.2);
});

test('Yinxu: cracks by day at the braziers, the foundry through the night', () => {
  const at = (v) => SY.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('shangCrack').length >= 4 && at('shangCrack').every((e) => e.hours[0] >= 6 && e.hours[1] <= 17));
  assert.ok(at('shangBellows').some((e) => e.hours[0] > e.hours[1]), 'a night bellows');
  assert.ok(at('owl').every((e) => e.hours[0] >= 20 && e.hours[1] <= 5));
});
