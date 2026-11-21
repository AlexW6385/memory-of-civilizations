// Ye's placed sounds (src/settlements/wei-ye/soundmap.js, src/engine/voices-wei.js): the voices exist and can be made against a stand-in audio context, the map's
// places agree with the settlement, and the emitters keep their hours (drums at the closings, the horn at dawn and dusk, the watch at night, the ice in the day).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as WY from '../src/settlements/wei-ye/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['weiIce', 'weiHorn', 'weiClank', 'hanBell', 'hanStone', 'hanDrum', 'hanZither', 'hanYu', 'hanWatch', 'hanPounder', 'hanCart'];

test('Ye: the profile carries the map', () => {
  assert.ok(profileOf('wei-ye').animals[LIFE].map === WY);
});

test('Ye: every voice exists and can be made (the ice only in winter)', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('wei-ye').animals, roof: 'tile', at: { x: -119, z: -91.5, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 20;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  m.doyOverride = 200;
  assert.ok(m.weiIce(ctx.currentTime, bus, 1) < 1, 'no ice cut in summer');
});

test('Ye: the map agrees with the settlement', () => {
  const S = WY.sites();
  assert.ok(S.length > 150, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work && s.work.length, s.id + ' ' + s.use); assert.ok(WY.ROOMS[s.use], s.use); }
  for (const k of ['office', 'barracks', 'smithy', 'music']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(WY.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(WY.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  const s0 = S[0];
  assert.equal(WY.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(WY.roomAt(0, 25, 0), null, 'the avenue is the open');
  assert.ok(WY.townNear(182, 104) > 0.9 && WY.townNear(-190, -140) < 0.3);
  assert.ok(WY.treeSpot(-150, -100, ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(7), 40), 'a tree in the garden');
});

test('Ye: the drums at the closings, the horn at dawn and dusk, the watch at night', () => {
  const at = (v) => WY.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('hanDrum').some((e) => e.hours[0] < 7.3 && e.hours[1] > 7) && at('hanDrum').some((e) => e.hours[0] > 16));
  assert.ok(at('weiHorn').some((e) => e.hours[0] < 6) && at('weiHorn').some((e) => e.hours[0] > 18));
  assert.ok(at('hanWatch').every((e) => e.hours[0] >= 20 && e.hours[1] <= 5));
  assert.ok(at('weiIce').every((e) => e.hours[0] >= 7 && e.hours[1] <= 17));
});
