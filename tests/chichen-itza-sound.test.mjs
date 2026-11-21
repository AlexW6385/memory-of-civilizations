// Chichén Itzá's placed sounds (src/settlements/chichen-itza/soundmap.js, src/engine/voices-chichen-itza.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as CZ from '../src/settlements/chichen-itza/soundmap.js';
import { lots } from '../src/settlements/chichen-itza/layout.js';
import { variant } from '../src/settlements/chichen-itza/house.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['chzConch', 'chzTunkul', 'chzAyotl', 'chzFlute', 'chzWhistle', 'chzRattle', 'chzMetate', 'chzTortilla', 'chzWeave', 'chzPlaster', 'chzTurkey', 'chzCry', 'chzStairChirp', 'chzBall', 'chzHiss', 'chzDrip', 'chzOwl', 'chzMotmot'];

test('Chichen Itza: the profile carries the map', () => {
  const P = profileOf('chichen-itza'), L = P.animals[LIFE];
  assert.ok(L.map === CZ);
  assert.ok(!('sheepbell' in P.animals));
});

test('Chichen Itza: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('chichen-itza').animals, roof: 'thatch', at: { x: 0, z: 62, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Chichen Itza: the map agrees with the settlement', () => {
  const n = lots().reduce((s, l) => s + l.houses.length + (l.range ? 1 : 0), 0);
  assert.equal(CZ.sites().length, n + 2, 'every house, every long house, two temples');
  for (const s of CZ.sites()) { assert.ok(s.work.length, s.id); assert.ok(CZ.ROOMS[s.use], s.use); }
  for (const k of ['home', 'weaver', 'store', 'range', 'temple']) assert.ok(CZ.sites().some((s) => s.use === k), k);
  // the use read from a house's seed is the use house.js gives it
  for (const l of lots().slice(0, 12)) for (const h of l.houses) assert.equal(CZ.sites().find((s) => s.at[0] === (s.rect[0] + s.rect[2]) / 2 && Math.abs(s.at[0] - h.c[0]) < 1e-6 && Math.abs(s.at[1] - h.c[1]) < 1e-6)?.use, variant(h).use);
  for (const r of Object.values(CZ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(CZ.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(CZ.canalTrack(0, 0, () => 0.5), null); assert.equal(CZ.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(CZ.townNear(100, 60) > 0.9 && CZ.townNear(0, 62) < 0.9 && CZ.townNear(0, 62) > CZ.townNear(300, 300));
  const s0 = CZ.sites().find((s) => s.use === 'home');
  assert.equal(CZ.roomAt(s0.at[0], s0.at[1], 0.4).same, s0.id);
  assert.equal(CZ.roomAt(0, 62, 0), null, 'the plaza is the open');
  assert.equal(CZ.roomAt(0, 0, 24.6).use, 'temple');
  assert.ok(CZ.treeSpot(200, 100, () => 0.3, 60), 'a tree of the forest');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'broom', 'clothRustle']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('chichen-itza').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Chichen Itza placed: the shell trumpets at dawn, not at night', () => {
  assert.ok(listen({ x: 0, z: 62, hour: 6, secs: 450 }).calls.chzConch > 0, 'the conch at dawn');
  assert.ok(!listen({ x: 0, z: 62, hour: 2, secs: 300 }).calls.chzConch, 'not at night');
});

test('Chichen Itza placed: the stair answers a clap by day, the ball game by day, the cenote drips', () => {
  assert.ok(listen({ x: 0, z: 56, hour: 10, secs: 420 }).calls.chzStairChirp > 0, 'the chirped echo');
  assert.ok(!listen({ x: 0, z: 56, hour: 23, secs: 300 }).calls.chzStairChirp, 'not at night');
  assert.ok(listen({ x: -115, z: -20, hour: 11, secs: 420 }).calls.chzBall > 0, 'the ball');
  assert.ok(listen({ x: 0, z: -240, hour: 15, secs: 200 }).calls.chzDrip > 0, 'the drops');
});

test('Chichen Itza placed: the owls of the night', () => {
  assert.ok(listen({ x: -240, z: -60, hour: 23, secs: 600 }).calls.chzOwl > 0);
  assert.ok(!listen({ x: -240, z: -60, hour: 12, secs: 300 }).calls.chzOwl);
});

test('Chichen Itza placed: a house\'s own work, and its room', () => {
  const s = CZ.sites().find((q) => q.use === 'weaver');
  assert.ok(listen({ x: s.at[0], z: s.at[1] + 6, hour: 10, secs: 420 }).calls.chzWeave > 0, 'the loom');
  assert.ok(!listen({ x: s.at[0], z: s.at[1] + 6, hour: 2, secs: 300 }).calls.chzWeave, 'nothing at night');
  assert.equal(listen({ x: s.at[0], z: s.at[1], y: 0.4, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'weaver');
});
