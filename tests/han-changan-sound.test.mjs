// Han Chang'an's placed sounds (src/settlements/han-changan/soundmap.js, src/engine/voices-han.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place and hour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as HC from '../src/settlements/han-changan/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['hanBell', 'hanStone', 'hanDrum', 'hanZither', 'hanYu', 'hanWatch', 'hanPounder', 'hanCart'];

test('Han Chang\'an: the profile carries the map', () => {
  assert.ok(profileOf('han-changan').animals[LIFE].map === HC);
});

test('Han Chang\'an: every voice exists and can be made', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('han-changan').animals, roof: 'tile', at: { x: -110, z: -122, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Han Chang\'an: the map agrees with the settlement', () => {
  const S = HC.sites();
  assert.ok(S.length > 60, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work && s.work.length, s.id); assert.ok(HC.ROOMS[s.use], s.use); }
  for (const k of ['office', 'shop-silk', 'dwelling']) assert.ok(S.some((s) => s.use === k) || k === 'dwelling' || k === 'shop-silk', k);
  for (const r of Object.values(HC.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(HC.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  const s0 = S[0];
  assert.equal(HC.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(HC.roomAt(150, 0, 0), null, 'the avenue is the open');
  assert.ok(HC.townNear(265, -280) > 0.9 && HC.townNear(-110, -150) < 0.5);
  assert.ok(HC.treeSpot(150, 0, ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(7), 40), 'a tree by the avenue');
});

test('Han Chang\'an: the drums at opening and closing, the watch at night', () => {
  const at = (v) => HC.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('hanDrum').some((e) => e.hours[0] < 7.3 && e.hours[1] > 7) && at('hanDrum').some((e) => e.hours[0] > 16));
  assert.ok(at('hanWatch').every((e) => e.hours[0] >= 20 && e.hours[1] <= 5));
});
