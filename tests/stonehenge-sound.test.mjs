// Stonehenge's placed sounds (src/settlements/stonehenge/soundmap.js, src/engine/voices-stonehenge.js): the voices exist and can be made against a stand-in
// audio context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as SH from '../src/settlements/stonehenge/soundmap.js';
import { houses, OPEN } from '../src/settlements/stonehenge/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['sthMaul', 'sthKnap', 'sthQuern', 'sthScrape', 'sthPaddle', 'sthFire', 'sthDrum', 'sthSong', 'sthPipe', 'sthHaul', 'sthLark', 'sthLapwing', 'sthCurlew', 'sthPig', 'sthLow', 'sthBleat', 'sthChop'];
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Stonehenge: the profile carries the map; no bell, no horse (nothing of metal or riding yet)', () => {
  const P = profileOf('stonehenge'), L = P.animals[LIFE];
  assert.ok(L.map === SH);
  assert.ok(!('horse' in P.animals) && !('sheepbell' in P.animals) && !('rooster' in P.animals) && !P.bells);
});

test('Stonehenge: every voice exists and can be made', () => {
  const ctx = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('stonehenge').animals, roof: 'thatch', at: { x: 34, z: -16, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Stonehenge: the map agrees with the settlement', () => {
  assert.equal(SH.sites().length, houses().length);
  assert.equal(SH.sites().filter((s) => s.open).length, OPEN.length);
  for (const s of SH.sites()) { assert.ok(s.work.length); assert.ok(SH.ROOMS[s.use], s.use); }
  const o = SH.sites().find((s) => s.open);
  assert.equal(SH.roomAt(o.at[0], o.at[1], o.y + 0.2).same, o.id);
  assert.equal(SH.roomAt(0, 0, 0), null, 'the stones are the open');
  assert.ok(SH.EMITTERS.length > 20 && SH.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const v of ['sthMaul', 'sthHaul', 'sthFire', 'sthDrum', 'sthLark', 'sthCurlew']) assert.ok(SH.EMITTERS.some((e) => e.voice === v), v);
  assert.equal(SH.canalTrack(0, 0, () => 0.5), null); assert.equal(SH.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(SH.townNear(34, -16) > 0.5 && SH.townNear(-300, 200) < 0.2);
  assert.ok(SH.treeSpot(100, 100, () => 0.3, 40));
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const ctx = fake(), m = music(ctx);
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('stonehenge').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Stonehenge placed: the mauls by day at the arrival, not at night', () => {
  assert.ok(listen({ x: 34, z: -16, hour: 10, secs: 300 }).calls.sthMaul > 0, 'mauls on the sarsen');
  assert.ok(!listen({ x: 34, z: -16, hour: 2, secs: 300 }).calls.sthMaul, 'not at night');
});

test('Stonehenge placed: the evening drum at the Southern Circle, not at midday nor in rain; none of the other places\' walkers', () => {
  const [cx, cz] = [214, -165];
  assert.ok(listen({ x: cx, z: cz, hour: 19.5, secs: 1200 }).calls.sthDrum > 0, 'the drum at dusk');
  assert.ok(!listen({ x: cx, z: cz, hour: 12, secs: 300 }).calls.sthDrum, 'not at midday');
  assert.ok(!listen({ x: cx, z: cz, hour: 19.5, rain: 0.9, secs: 300 }).calls.sthDrum, 'not in the rain');
  const r = listen({ x: 34, z: -16, hour: 10, secs: 60 });
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
});
