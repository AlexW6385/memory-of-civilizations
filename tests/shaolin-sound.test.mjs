// Shaolin's placed sounds (src/settlements/shaolin/soundmap.js, src/engine/voices-shaolin.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as SL from '../src/settlements/shaolin/soundmap.js';
import { YARDS } from '../src/settlements/shaolin/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['slChant', 'slStaff', 'slStomp', 'slEaveBell', 'slBoard', 'slOwl'];
const setup = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Shaolin: the profile carries the map and its own hours', () => {
  const P = profileOf('shaolin');
  assert.ok(P.animals[LIFE].map === SL);
  assert.equal(P.bells, 'shaolin');
});

test('Shaolin: every voice exists and can be made', () => {
  const { ctx, m } = setup();
  m.place({ voices: {}, animals: profileOf('shaolin').animals, roof: 'tile', at: { x: 0, z: 160, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Shaolin: the map agrees with the settlement', () => {
  assert.ok(SL.sites().length > 14);
  for (const s of SL.sites()) { assert.ok(SL.ROOMS[s.use], s.use); assert.ok(s.work.length, s.id); }
  for (const r of Object.values(SL.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(SL.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.equal(SL.WELLS.length, YARDS.filter((_, i) => i % 3 === 0).length);
  assert.ok(SL.TEMPLE.bell[0] < 0 && SL.TEMPLE.drum[0] > 0 && SL.TEMPLE.hall[1] < SL.TEMPLE.bell[1]);
  assert.equal(SL.roomAt(0, 38, 1.5).same, 'temple:hall');
  assert.equal(SL.roomAt(0, 100, 0), null);
  assert.ok(SL.streetTrack(0, 155, () => 0.3, 90, 30), 'a track on the village street');
  assert.equal(SL.canalTrack(), null);
  assert.ok(SL.townNear(0, 150) > 0.9 && SL.townNear(0, 0) < 0.5);
});

function listen({ x, z, y = 0, hour, doy = 200, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = setup();
  m.doyOverride = doy; m.wind = 0.4;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'mortar', 'teaClink']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('shaolin').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Shaolin placed: the staff drill in the court by day, not at night', () => {
  assert.ok(listen({ x: 0, z: -62, hour: 9, secs: 400 }).calls.slStaff > 0);
  assert.ok(!listen({ x: 0, z: -62, hour: 23, secs: 200 }).calls.slStaff);
});

test('Shaolin placed: the eave bells ring at any hour', () => {
  assert.ok(listen({ x: 0, z: 38, hour: 2, secs: 200 }).calls.slEaveBell > 0);
});

test('Shaolin placed: the owls at night only', () => {
  assert.ok(listen({ x: -135, z: 70, hour: 23, secs: 300 }).calls.slOwl > 0);
  assert.ok(!listen({ x: -135, z: 70, hour: 12, secs: 200 }).calls.slOwl);
});

test('Shaolin placed: the smith at his forge by day', () => {
  const s = SL.sites().find((q) => q.use === 'shop_iron');
  if (s) assert.ok(listen({ x: s.at[0], z: s.at[1] + 10, hour: 10, secs: 300 }).calls.hammer > 0);
});

test('Shaolin placed: rooms', () => {
  assert.equal(listen({ x: 0, z: 38, y: 1.7, hour: 11, indoors: true, secs: 60 }).m.plc.room.use, 'temple');
});
