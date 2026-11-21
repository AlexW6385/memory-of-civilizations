// Rapa Nui's placed sounds (src/settlements/rapa-nui/soundmap.js, src/engine/voices-rapa-nui.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as RA from '../src/settlements/rapa-nui/soundmap.js';
import { village, CHIEF, PLAZA } from '../src/settlements/rapa-nui/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['rapSurf', 'rapToki', 'rapTapa', 'rapHaul', 'rapStones', 'rapRiu', 'rapPu', 'rapScurry', 'rapHen'];

test('Rapa Nui: the profile carries the map; no dog, no horse, no bell (none on the island)', () => {
  const P = profileOf('rapa-nui'), L = P.animals[LIFE];
  assert.ok(L.map === RA);
  assert.ok(!('dog' in P.animals) && !('horse' in P.animals) && !('sheepbell' in P.animals) && !('donkey' in P.animals));
});

test('Rapa Nui: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('rapa-nui').animals, roof: 'thatch', at: { x: 0, z: 60, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Rapa Nui: the map agrees with the settlement', () => {
  const S = RA.sites();
  assert.equal(S.length, village().houses.filter((h) => h.chief || h.inside).length);
  assert.ok(S.length >= 30 && S.some((s) => s.id === 'house:long'));
  for (const s of S) { assert.ok(s.work.length); assert.ok(RA.ROOMS[s.use], s.use); }
  for (const k of ['sleep', 'cook', 'tapa']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(RA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(RA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(RA.canalTrack(0, 0, () => 0.5), null); assert.equal(RA.streetTrack(0, 0, () => 0.5, 90, 40), null); assert.equal(RA.treeSpot(0, 0, () => 0.3, 40), null);
  assert.ok(RA.townNear(0, 80) > 0.9 && RA.townNear(0, 290) < 0.2);
  assert.equal(RA.roomAt(CHIEF.c[0], CHIEF.c[1]).same, 'house:long');
  assert.equal(RA.roomAt(0, 80), null, 'the plaza is the open');
  assert.ok(RA.shoreSpot(0, 150, () => 0.5), 'the shore near the water');
  assert.equal(RA.shoreSpot(0, 0, () => 0.5), null, 'none inland');
  assert.ok(PLAZA.length === 4);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('rapa-nui').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Rapa Nui placed: the evening chant on the plaza, not at midday and not in rain', () => {
  assert.ok(listen({ x: 0, z: 70, hour: 19, secs: 900 }).calls.rapRiu > 0, 'the chant at dusk');
  assert.ok(!listen({ x: 0, z: 70, hour: 12, secs: 300 }).calls.rapRiu, 'not at midday');
  assert.ok(!listen({ x: 0, z: 70, hour: 19, rain: 0.9, secs: 300 }).calls.rapRiu, 'not in the rain');
});

test('Rapa Nui placed: the surf at the shore by night too; the carvers\' toki by day only; none of Suzhou\'s walkers', () => {
  const night = listen({ x: 0, z: 140, hour: 2, secs: 120 });
  assert.ok(night.calls.rapSurf > 0, 'the surf at night');
  assert.ok(!night.calls.vendor && !night.calls.sedan && !night.calls.watchman && !night.calls.boat);
  const b = RA.EMITTERS.find((e) => e.voice === 'rapToki').at;
  assert.ok(listen({ x: b[0], z: b[1], hour: 10, secs: 600 }).calls.rapToki > 0, 'toki at the camp by day');
  assert.ok(!listen({ x: b[0], z: b[1], hour: 2, secs: 300 }).calls.rapToki, 'not at night');
});

test('Rapa Nui placed: in a house', () => {
  const k = RA.sites().find((s) => s.use === 'tapa');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.2, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'tapa');
});
