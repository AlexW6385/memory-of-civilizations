// Khajuraho's placed sounds (src/settlements/khajuraho/soundmap.js, src/engine/voices-khajuraho.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as KH from '../src/settlements/khajuraho/soundmap.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['khaPorchBell', 'khaDrum', 'khaChant', 'khaCall', 'khaPan', 'khaCartBell', 'khaPeafowl', 'khaOwl'];

test('Khajuraho: the profile carries the map', () => {
  const P = profileOf('khajuraho'), L = P.animals[LIFE];
  assert.ok(L.map === KH);
});

test('Khajuraho: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('khajuraho').animals, roof: 'flat', at: { x: -14, z: -60, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Khajuraho: the map agrees with the settlement', () => {
  const S = KH.sites();
  assert.ok(S.length > 30, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length); assert.ok(KH.ROOMS[s.use], s.use); }
  for (const k of ['home', 'sweets', 'oil', 'flowers']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(KH.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(KH.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2), 'every emitter well formed');
  for (const v of ['khaPorchBell', 'khaDrum', 'khaChant', 'khaCall', 'khaPan', 'khaCartBell', 'khaPeafowl', 'khaOwl']) assert.ok(KH.EMITTERS.some((e) => e.voice === v), v);
  assert.equal(KH.canalTrack(0, 0, () => 0.5), null); assert.equal(KH.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(KH.townNear(100, 10) > 0.9 && KH.townNear(-70, -100) < 0.5);
  const s0 = S[0];
  assert.equal(KH.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(KH.roomAt(-14, -60, 0), null, 'the pilgrims lane is the open');
  assert.ok(KH.treeSpot(150, 120, () => 0.3, 40) !== undefined, 'tree spot answers');
  assert.ok(KH.WELLS.length >= 5);
});

test('Khajuraho: the worship is at the temples at dawn and dusk, the owlet by night, the pans by day', () => {
  const at = (v) => KH.EMITTERS.filter((e) => e.voice === v);
  for (const e of at('khaDrum')) assert.ok(e.hours[0] >= 5 && e.hours[1] <= 19.5);
  assert.ok(at('khaOwl').every((e) => e.hours[0] > 18 && e.hours[1] < 6));
  assert.ok(at('khaPan').every((e) => e.hours[0] >= 5 && e.hours[1] <= 22));
  assert.ok(at('khaDrum').length >= 10, 'five temples, two worships');
});
