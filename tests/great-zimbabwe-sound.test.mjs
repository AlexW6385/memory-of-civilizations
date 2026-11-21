// Great Zimbabwe's placed sounds (src/settlements/great-zimbabwe/soundmap.js, src/engine/voices-great-zimbabwe.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as GZ from '../src/settlements/great-zimbabwe/soundmap.js';
import { huts, daras } from '../src/settlements/great-zimbabwe/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['gzMbira', 'gzHosho', 'gzNgoma', 'gzSong', 'gzPound', 'gzGrind', 'gzBellows', 'gzBurnish', 'gzHerdCall', 'gzHornbill', 'gzNightjar', 'gzHyena'];

test('Great Zimbabwe: the profile carries the map', () => {
  const P = profileOf('great-zimbabwe'), L = P.animals[LIFE];
  assert.ok(L.map === GZ);
  assert.ok('cattle' in P.animals);
});

test('Great Zimbabwe: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('great-zimbabwe').animals, roof: 'thatch', at: { x: 46, z: 60, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Great Zimbabwe: the map agrees with the settlement', () => {
  const open = huts().filter((h) => h.open);
  assert.equal(GZ.sites().length, open.length);
  assert.ok(GZ.sites().length > 12);
  for (const s of GZ.sites()) { assert.ok(s.work.length); assert.ok(GZ.ROOMS[s.use], s.use); }
  for (const k of ['kitchen', 'store', 'spinner', 'sleeping']) assert.ok(GZ.sites().some((s) => s.use === k), k);
  for (const r of Object.values(GZ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(GZ.EMITTERS.length > 30);
  assert.ok(GZ.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2 && e.at.every(Number.isFinite)), 'every emitter well formed');
  for (const v of ['gzMbira', 'gzPound', 'gzGrind', 'hammer', 'gzBellows', 'gzNgoma', 'gzHerdCall', 'gzHornbill', 'gzNightjar', 'gzHyena']) assert.ok(GZ.EMITTERS.some((e) => e.voice === v), v);
  assert.equal(GZ.canalTrack(0, 0, () => 0.5), null); assert.equal(GZ.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(GZ.townNear(46, 90) > 0.7 && GZ.townNear(300, 200) < 0.4);
  const s0 = GZ.sites()[0];
  assert.equal(GZ.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(GZ.roomAt(46, 70, 0), null, 'the grass before the entrance is the open');
  assert.ok(GZ.treeSpot(300, 100, () => 0.3, 40), 'a tree near the rim');
  assert.equal(daras().length > 0, true);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'jarLid', 'chisel', 'clothRustle', 'vendor', 'sedan', 'watchman', 'boat', 'wellBucket']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('great-zimbabwe').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Great Zimbabwe placed: the grain pounded in the morning and not at night', () => {
  const e = GZ.EMITTERS.find((q) => q.voice === 'gzPound');
  assert.ok(listen({ x: e.at[0] + 4, z: e.at[1], hour: 7, secs: 300 }).calls.gzPound > 0, 'the mortar in the morning');
  assert.ok(!listen({ x: e.at[0] + 4, z: e.at[1], hour: 2, secs: 200 }).calls.gzPound, 'not at night');
});

test('Great Zimbabwe placed: the mbira at the meeting house in the evening, not by day, not in rain', () => {
  const d = GZ.EMITTERS.find((q) => q.voice === 'gzMbira' && q.hours[0] >= 16.5);
  assert.ok(listen({ x: d.at[0] + 5, z: d.at[1], hour: 20, secs: 900 }).calls.gzMbira > 0, 'the mbira at dusk');
  assert.ok(!listen({ x: d.at[0] + 5, z: d.at[1], hour: 11, secs: 300 }).calls.gzMbira, 'not at noon');
  assert.ok(!listen({ x: d.at[0] + 5, z: d.at[1], hour: 20, rain: 0.9, secs: 300 }).calls.gzMbira, 'not in the rain');
});

test('Great Zimbabwe placed: the smith in the court, the hornbill at dawn, the hyena at night; none of Suzhou\'s walkers', () => {
  const sm = GZ.EMITTERS.find((q) => q.voice === 'gzBellows');
  const r = listen({ x: sm.at[0] + 5, z: sm.at[1], hour: 10, secs: 300 });
  assert.ok(r.calls.hammer > 0 && r.calls.gzBellows > 0, 'the hammer and the bellows');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  const h = GZ.EMITTERS.find((q) => q.voice === 'gzHornbill');
  assert.ok(listen({ x: h.at[0] + 30, z: h.at[1], hour: 5.5, secs: 900 }).calls.gzHornbill > 0, 'the hornbill at dawn');
  assert.ok(!listen({ x: h.at[0] + 30, z: h.at[1], hour: 13, secs: 300 }).calls.gzHornbill, 'not at noon');
  const y = GZ.EMITTERS.find((q) => q.voice === 'gzHyena');
  assert.ok(listen({ x: y.at[0] + 30, z: y.at[1], hour: 23, secs: 900 }).calls.gzHyena > 0, 'the hyena at night');
});

test('Great Zimbabwe placed: rooms', () => {
  const k = GZ.sites().find((s) => s.use === 'kitchen');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'kitchen');
});
