// Taos' placed sounds (src/settlements/taos/soundmap.js, src/engine/voices-taos.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as TA from '../src/settlements/taos/soundmap.js';
import { ROOMS, UPPER, PLAZA } from '../src/settlements/taos/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['taoDrum', 'taoSong', 'taoRattle', 'taoFlute', 'taoMetate', 'taoBatten', 'taoScrape', 'taoPolish', 'taoKnap', 'taoMudSlap', 'taoChop', 'taoGobble', 'taoCreek', 'taoCoyote'];

test('Taos: the profile carries the map; no horse, no bell, no rooster (not yet in the valley)', () => {
  const P = profileOf('taos'), L = P.animals[LIFE];
  assert.ok(L.map === TA);
  assert.ok(!('horse' in P.animals) && !('rooster' in P.animals) && !('sheepbell' in P.animals));
});

test('Taos: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('taos').animals, roof: 'flat', at: { x: -30, z: -20, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Taos: the map agrees with the settlement', () => {
  assert.equal(TA.sites().filter((x) => x.id.startsWith('room:')).length, ROOMS.length - ROOMS.filter((r) => !TA.ROOMS[r.kind]).length);
  assert.ok(TA.sites().filter((x) => x.id.startsWith('up:')).length <= UPPER.length);
  assert.ok(TA.sites().filter((s) => s.id.startsWith('room:')).length >= 12, 'the plaza rooms');
  assert.ok(TA.sites().some((s) => s.id.startsWith('up:')), 'the terraced rooms');
  for (const s of TA.sites()) { assert.ok(s.work.length); assert.ok(TA.ROOMS[s.use], s.use); }
  for (const k of ['weave', 'pottery', 'home']) assert.ok(TA.sites().some((s) => s.use === k), k);
  for (const r of Object.values(TA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(TA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(TA.canalTrack(0, 0, () => 0.5), null); assert.equal(TA.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(TA.townNear(0, 0) > 0.9 && TA.townNear(0, 290) < 0.3);
  const s0 = TA.sites().find((s) => s.id.startsWith('room:'));
  assert.equal(TA.roomAt(s0.at[0], s0.at[1], 0.2).same, s0.id);
  assert.equal(TA.roomAt(0, 0, 0), null, 'the plaza is the open');
  assert.ok(TA.treeSpot(0, 0, () => 0.3, 40), 'a cottonwood by the creek');
  assert.ok(PLAZA.length === 4);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('taos').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Taos placed: the evening drum, not at midday and not in rain', () => {
  assert.ok(listen({ x: -10, z: -30, hour: 19, secs: 900 }).calls.taoDrum > 0, 'the drum at dusk');
  assert.ok(!listen({ x: -10, z: -30, hour: 12, secs: 300 }).calls.taoDrum, 'not at midday');
  assert.ok(!listen({ x: -10, z: -30, hour: 19, rain: 0.9, secs: 300 }).calls.taoDrum, 'not in the rain');
});

test('Taos placed: grinding in the morning, the creek, turkeys; none of Suzhou\'s walkers', () => {
  const r = listen({ x: -17, z: -36, hour: 8, secs: 600 });
  assert.ok(r.calls.taoMetate > 0, 'the metate');
  assert.ok(r.calls.taoCreek > 0 || listen({ x: 0, z: 0, hour: 12, secs: 120 }).calls.taoCreek > 0, 'the creek');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: -17, z: -36, hour: 2, secs: 300 }).calls.taoMetate, 'nothing at night');
});

test('Taos placed: rooms', () => {
  const k = TA.sites().find((s) => s.use === 'weave' && s.id.startsWith('room:'));
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.2, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'weave');
});
