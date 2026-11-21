// Ubirr's placed sounds (src/settlements/kakadu/soundmap.js, src/engine/voices-kakadu.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as KA from '../src/settlements/kakadu/soundmap.js';
import { HOUSES, CAMPS, POOL } from '../src/settlements/kakadu/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['kakClap', 'kakDrone', 'kakGoose', 'kakWhistle', 'kakKite', 'kakCurlew', 'kakHowl', 'kakGrind', 'kakAxe', 'kakCrackle', 'kakLap', 'kakPlait'];
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Kakadu: the profile carries the map; no bell, no rooster, no horse (none in Arnhem Land about AD 1000)', () => {
  const P = profileOf('kakadu'), L = P.animals[LIFE];
  assert.ok(L.map === KA);
  assert.ok(!('horse' in P.animals) && !('rooster' in P.animals) && !('sheepbell' in P.animals));
});

test('Kakadu: every voice exists and can be made', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('kakadu').animals, roof: 'thatch', at: { x: -1, z: -13, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Kakadu: the map agrees with the settlement', () => {
  const S = KA.sites();
  assert.equal(S.filter((s) => s.id.startsWith('shelter:')).length, HOUSES.length);
  assert.ok(S.some((s) => s.id === 'rock:main') && S.some((s) => s.id === 'rock:small'));
  for (const s of S) { assert.ok(s.work.length); assert.ok(KA.ROOMS[s.use], s.use); }
  for (const r of Object.values(KA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(KA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.ok(KA.EMITTERS.filter((e) => e.voice === 'kakCrackle').length >= CAMPS.length, 'a crackle at every hearth');
  const h = HOUSES[0];
  assert.equal(KA.roomAt(h.at[0], h.at[1], 0.1).same, 'shelter:0');
  assert.equal(KA.roomAt(0, 40, 0), null, 'the floodplain is the open');
  assert.equal(KA.canalTrack(0, 0, () => 0.5), null); assert.equal(KA.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(KA.townNear(CAMPS[0].c[0], CAMPS[0].c[1]) > 0.7 && KA.townNear(60, 70) < 0.3);
  assert.ok(KA.treeSpot(POOL.c[0], POOL.c[1], () => 0.3, 60), 'a paperbark by the billabong');
  assert.ok(KA.pondSpot(POOL.c[0], POOL.c[1], () => 0.3, 80), 'the billabong margin');
  for (const e of KA.EMITTERS) assert.ok(Math.hypot(e.at[0], e.at[1]) < 130, e.voice + ' lies within the place');
});

function listen({ x, z, y = 0, hour, doy = 200, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake(), m = music(ctx);
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('kakadu').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Kakadu placed: the evening didgeridoo, not at midday and not in rain', () => {
  const [fx, fz] = CAMPS[0].fire;
  assert.ok(listen({ x: fx + 6, z: fz + 4, hour: 19.5, secs: 1500 }).calls.kakDrone > 0, 'the drone at dusk');
  assert.ok(!listen({ x: fx + 6, z: fz + 4, hour: 12, secs: 300 }).calls.kakDrone, 'not at midday');
  assert.ok(!listen({ x: fx + 6, z: fz + 4, hour: 19.5, rain: 0.9, secs: 300 }).calls.kakDrone, 'not in the rain');
});

test('Kakadu placed: grinding in the morning, geese at the water, a fire; no street walkers', () => {
  const [fx, fz] = CAMPS[0].fire;
  const r = listen({ x: fx + 2, z: fz + 2, hour: 8, secs: 600 });
  assert.ok(r.calls.kakGrind > 0, 'the grindstone');
  assert.ok(r.calls.kakCrackle > 0, 'the fire');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(listen({ x: POOL.c[0] - 30, z: POOL.c[1], hour: 6, secs: 400 }).calls.kakGoose > 0, 'geese at dawn on the water');
  assert.ok(!listen({ x: fx + 2, z: fz + 2, hour: 2, secs: 300 }).calls.kakGrind, 'nothing ground at night');
});

test('Kakadu placed: inside a shelter', () => {
  const h = HOUSES[0], r = listen({ x: h.at[0], z: h.at[1], y: 0.2, hour: 11, indoors: true, secs: 100 });
  assert.equal(r.m.plc.room.use, h.kind);
});
