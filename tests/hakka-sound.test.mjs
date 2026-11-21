// The Hakka tulou's placed sounds (src/settlements/hakka-tulou/soundmap.js, src/engine/voices-shaolin.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as HT from '../src/settlements/hakka-tulou/soundmap.js';
import { T } from '../src/settlements/hakka-tulou/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['htSong', 'htPestle', 'htNoria', 'htBeat', 'htClapper', 'htGate', 'htChop', 'htOwl'];
const setup = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Hakka tulou: the profile carries the map', () => {
  const P = profileOf('hakka-tulou');
  assert.ok(P.animals[LIFE].map === HT);
});

test('Hakka tulou: every voice exists and can be made', () => {
  const { ctx, m } = setup();
  m.place({ voices: {}, animals: profileOf('hakka-tulou').animals, roof: 'tile', at: { x: 0, z: 72, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Hakka tulou: the map agrees with the settlement', () => {
  assert.equal(HT.sites().length, 16, 'every house of the hamlet is open');
  for (const s of HT.sites()) { assert.ok(HT.ROOMS[s.use], s.use); assert.ok(s.work.length, s.id); }
  for (const r of Object.values(HT.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(HT.EMITTERS.every((e) => typeof e.voice === 'string' && typeof m0(e.voice) && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.equal(HT.WELLS.length, T.wells.length + 4);
  assert.equal(HT.roomAt(0, 0, 0.5).use, 'hall');
  assert.equal(HT.roomAt(0, 100, 0), null);
  assert.equal(HT.roomAt(0, 28, 0).use, 'ringroom');
  assert.ok(HT.streetTrack(0, 80, () => 0.3, 90, 30), 'a track on the road');
  assert.ok(HT.bridgeTrack(0, 80, () => 0.3), 'a bridge');
  assert.ok(HT.frogGround(0, 110) > 0.9 && HT.frogGround(0, 40) < 0.2);
  assert.ok(HT.townNear(0, 45) > 0.9 && HT.townNear(150, 0) < 0.3);
  assert.ok(HT.shoreSpot(0, 75, () => 0.5), 'the stream near the arrival');
});
function m0(v) { return v; }

function listen({ x, z, y = 0, hour, doy = 200, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = setup();
  m.doyOverride = doy; m.wind = 0.4;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'pourWine', 'teaClink', 'loom', 'frog']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('hakka-tulou').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, frogs: 0.9, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Hakka tulou placed: the noria turns at any hour, near the stream', () => {
  assert.ok(listen({ x: -14, z: 76, hour: 3, secs: 120 }).calls.htNoria > 0);
});
test('Hakka tulou placed: the pestle in the barn by day, not at night', () => {
  assert.ok(listen({ x: 24, z: -44, hour: 8, secs: 300 }).calls.htPestle > 0);
  assert.ok(!listen({ x: 24, z: -44, hour: 23, secs: 200 }).calls.htPestle);
});
test('Hakka tulou placed: the gate is shut at dusk, not at noon', () => {
  assert.ok(listen({ x: 0, z: 50, hour: 19, secs: 1800 }).calls.htGate > 0);
  assert.ok(!listen({ x: 0, z: 50, hour: 12, secs: 300 }).calls.htGate);
});
test('Hakka tulou placed: the owls at night only', () => {
  assert.ok(listen({ x: 0, z: -120, hour: 23, secs: 400 }).calls.htOwl > 0);
  assert.ok(!listen({ x: 0, z: -120, hour: 12, secs: 200 }).calls.htOwl);
});
test('Hakka tulou placed: frogs of the paddy on a summer night', () => {
  assert.ok(listen({ x: 0, z: 110, hour: 22, secs: 120 }).calls.frog > 0);
});
test('Hakka tulou placed: rooms', () => {
  assert.equal(listen({ x: 0, z: 0, y: 0.8, hour: 11, indoors: true, secs: 20 }).m.plc.room.use, 'hall');
});
