// The Dogon village's placed sounds (src/settlements/dogon/soundmap.js, src/engine/voices-dogon.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes a sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as DG from '../src/settlements/dogon/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['dgPound', 'dgSong', 'dgBellows', 'dgDrum', 'dgRattle', 'dgGourd', 'dgHoe', 'dgGreet', 'dgWell'];
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Dogon: the profile carries the map', () => { assert.ok(profileOf('dogon').animals[LIFE].map === DG); });

test('Dogon: every voice exists and can be made', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('dogon').animals, roof: 'flat', at: { x: 4.5, z: 27.5, y: 1.2, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Dogon: the map agrees with the settlement', () => {
  const S = DG.sites();
  assert.ok(S.length >= 19, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length); assert.ok(DG.ROOMS[s.use], s.use); }
  assert.ok(S.some((s) => s.use === 'smithy'));
  assert.ok(DG.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.ok(DG.townNear(4.5, 27.5) > 0.9 && DG.townNear(0, 85) < 0.4);
  const s0 = S[0];
  assert.equal(DG.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(DG.roomAt(4.5, 27.5, 1.2), null, 'the place is the open');
});

function listen({ x, z, y = 1.2, hour, doy = 300, rain = 0, secs = 300 }) {
  const { ctx } = fake(), m = music(ctx);
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of NEW) { const o = m[v]; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('dogon').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors: false, cicadas: 0.2, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}
test('Dogon placed: the pestles pound in the morning, not at night or in rain', () => {
  assert.ok(listen({ x: -19, z: 27, hour: 7, secs: 400 }).dgPound > 0, 'the mortars at dawn');
  assert.ok(!listen({ x: -19, z: 27, hour: 2, secs: 300 }).dgPound, 'not at night');
  assert.ok(!listen({ x: -19, z: 27, hour: 7, rain: 0.9, secs: 300 }).dgPound, 'not in rain');
});
