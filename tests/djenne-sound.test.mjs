// Djenne's placed sounds (src/settlements/djenne/soundmap.js, src/engine/voices-djenne.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes a sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as DJ from '../src/settlements/djenne/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['djKora', 'djBalafon', 'djBellows', 'djPound', 'djPole', 'djRecite', 'djCall'];
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Djenne: the profile carries the map', () => { assert.ok(profileOf('djenne').animals[LIFE].map === DJ); });

test('Djenne: every voice exists and can be made', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('djenne').animals, roof: 'flat', at: { x: 95, z: 30, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Djenne: the map agrees with the settlement', () => {
  const S = DJ.sites();
  assert.ok(S.length > 20, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length); assert.ok(DJ.ROOMS[s.use], s.use); }
  for (const k of ['school', 'weaver', 'shop_smith']) assert.ok(S.some((s) => s.use === k), k);
  assert.ok(DJ.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.ok(DJ.townNear(75, 0) > 0.9 && DJ.townNear(0, 300) < 0.4);
  const s0 = S[0];
  assert.equal(DJ.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(DJ.roomAt(20, 0, 3.1).use, 'hall');
  assert.equal(DJ.roomAt(95, 30, 0), null, 'the market is the open');
  assert.ok(DJ.shoreSpot(0, 215, () => 0.5), 'the water near the landing');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, secs = 300 }) {
  const { ctx } = fake(), m = music(ctx);
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of NEW) { const o = m[v]; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('djenne').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors: false, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}
test('Djenne placed: the griot plays by day, not at night or in rain', () => {
  assert.ok(listen({ x: 100, z: -36, hour: 10, secs: 600 }).djKora > 0, 'the kora before the shops');
  assert.ok(!listen({ x: 100, z: -36, hour: 2, secs: 300 }).djKora, 'not at night');
  assert.ok(!listen({ x: 100, z: -36, hour: 10, rain: 0.9, secs: 300 }).djKora, 'not in rain');
});
