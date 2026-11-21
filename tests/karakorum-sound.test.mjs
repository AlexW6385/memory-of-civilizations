// Karakorum's placed sounds (src/settlements/mongol-karakorum/soundmap.js, src/engine/voices-karakorum.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as KK from '../src/settlements/mongol-karakorum/soundmap.js';
import { SHOPS } from '../src/settlements/mongol-karakorum/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['kkMorin', 'kkLongSong', 'kkChurn', 'kkFeltBeat', 'kkBellows', 'kkKilnRoar', 'kkTempleDrum', 'kkBoard', 'kkCamelBell', 'kkTrumpet', 'kkHerd', 'kkBanner'];

test('Karakorum: the profile carries the map', () => {
  const P = profileOf('mongol-karakorum'), L = P.animals[LIFE];
  assert.ok(L.map === KK);
});

test('Karakorum: every voice exists and can be made', () => {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('mongol-karakorum').animals, roof: 'flat', at: { x: 70, z: -12, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Karakorum: the map agrees with the settlement', () => {
  const nBays = SHOPS.reduce((a, s) => a + s.n, 0);
  assert.ok(KK.sites().length >= nBays + 10, `${KK.sites().length} sites for ${nBays} bays`);
  for (const s of KK.sites()) { assert.ok(Array.isArray(s.work), s.id); assert.ok(KK.ROOMS[s.use], s.use); }
  for (const k of ['cloth', 'metal', 'pots', 'temple', 'palacehall']) assert.ok(KK.sites().some((s) => s.use === k), k);
  for (const r of Object.values(KK.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(KK.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(KK.canalTrack(0, 0, () => 0.5), null);
  assert.ok(KK.townNear(0, 0) > 0.9 && KK.townNear(0, 170) < 0.4);
  const s0 = KK.sites()[0];
  assert.equal(KK.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(KK.roomAt(0, 0, 0), null, 'the main street is the open');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'jarLid', 'owl', 'pour', 'clothRustle']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('mongol-karakorum').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Karakorum placed: the court\'s fiddle and trumpet by day and evening, not at dawn', () => {
  const [hx, hz] = [70, -26];
  assert.ok(listen({ x: hx, z: hz, hour: 15, secs: 600 }).calls.kkTrumpet > 0, 'the silver tree\'s trumpet');
  assert.ok(!listen({ x: hx, z: hz, hour: 3, secs: 300 }).calls.kkTrumpet, 'not at night');
});

test('Karakorum placed: the kilns burn at night, the forges are silent', () => {
  const [kx, kz] = KK.EMITTERS.find((e) => e.voice === 'kkKilnRoar').at;
  assert.ok(listen({ x: kx + 4, z: kz, hour: 2, secs: 120 }).calls.kkKilnRoar > 0, 'kiln roar at night');
  const [fx, fz] = KK.EMITTERS.find((e) => e.voice === 'kkBellows').at;
  assert.ok(!listen({ x: fx, z: fz + 3, hour: 2, secs: 200 }).calls.kkBellows, 'no bellows at night');
});

test('Karakorum placed: a smith\'s bay hammers by day; rooms', () => {
  const s = KK.sites().find((q) => q.use === 'metal');
  assert.ok(listen({ x: s.at[0], z: s.at[1] + 6, hour: 10, secs: 600 }).calls.hammer > 0, 'the hammer');
  const t = KK.sites().find((q) => q.use === 'temple');
  assert.equal(listen({ x: t.at[0], z: t.at[1], y: 1, hour: 11, indoors: true, secs: 60 }).m.plc.room.use, 'temple');
});
