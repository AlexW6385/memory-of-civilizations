// Knossos' placed sounds (src/settlements/knossos/soundmap.js, src/engine/voices-knossos.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as KN from '../src/settlements/knossos/soundmap.js';
import { openHouses } from '../src/settlements/knossos/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['knLyre', 'knAulos', 'knSistrum', 'knQuern', 'knBowDrill', 'knLoomWeights', 'knBrook', 'knDrover'];

test('Knossos: the profile carries the map; no sheep bell, no fowl', () => {
  const P = profileOf('knossos'), L = P.animals[LIFE];
  assert.ok(L.map === KN);
  assert.ok(!('sheepbell' in P.animals) && !('rooster' in P.animals));
});

test('Knossos: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('knossos').animals, roof: 'flat', at: { x: 0, z: 22, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Knossos: the map agrees with the settlement', () => {
  const open = openHouses();
  assert.ok(KN.sites().length > 12 && KN.sites().length <= open.size + 4, `${KN.sites().length} sites`);
  for (const s of KN.sites()) { assert.ok(s.work.length); assert.ok(KN.ROOMS[s.use], s.use); }
  for (const k of ['weaver', 'shop', 'home']) assert.ok(KN.sites().some((s) => s.use === k), k);
  for (const r of Object.values(KN.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(KN.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(KN.canalTrack(0, 0, () => 0.5), null); assert.equal(KN.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(KN.townNear(-100, 0) > 0.9 && KN.townNear(0, 0) < 0.5);
  const s0 = KN.sites()[0];
  assert.equal(KN.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(KN.roomAt(0, 62, 0), null, 'the lane is the open');
  assert.ok(KN.treeSpot(205, 0, () => 0.3, 40), 'a tree by the stream');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'hammer', 'kitchen', 'jarLid', 'owl', 'wellBucket', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('knossos').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Knossos placed: the court music, by day and not in rain', () => {
  assert.ok(listen({ x: 12, z: -3, hour: 10, secs: 600 }).calls.knLyre > 0, 'the lyre in the court');
  assert.ok(!listen({ x: 12, z: -3, hour: 2, secs: 300 }).calls.knLyre, 'not at night');
  assert.ok(!listen({ x: 12, z: -3, hour: 10, rain: 0.9, secs: 300 }).calls.knLyre, 'not in the rain');
});

test('Knossos placed: the Kairatos is wetter in winter, and heard', () => {
  const b = KN.EMITTERS.find((e) => e.voice === 'knBrook');
  assert.ok(listen({ x: b.at[0] - 8, z: b.at[1], hour: 12, doy: 60, secs: 120 }).calls.knBrook > 0);
});

test('Knossos placed: trades at their houses, none of Suzhou\'s walkers', () => {
  const w = KN.sites().find((s) => s.use === 'weaver');
  const r = listen({ x: w.at[0], z: w.at[1] + 14, hour: 10, secs: 600 });
  assert.ok(r.calls.knLoomWeights > 0, 'the loom weights');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + 14, hour: 2, secs: 300 }).calls.knLoomWeights, 'nothing at night');
});

test('Knossos placed: rooms', () => {
  const k = KN.sites().find((s) => s.use === 'palacekitchen');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'palacekitchen');
});
