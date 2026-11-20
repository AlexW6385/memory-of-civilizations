// Heian Uji's placed sounds (src/settlements/heian-uji/soundmap.js, src/engine/voices-uji.js): the voices exist and can be made against a
// stand-in audio context, the map's places agree with the town, and the scheduler makes each sound at its place, hour, season and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { UJ_VOICES, UJ_TRADES, pickUjTrade } from '../src/engine/voices-uji.js';
import * as UJ from '../src/settlements/heian-uji/soundmap.js';
import { lots, RIVER, BRIDGE, POND } from '../src/settlements/heian-uji/layout.js';
import { riverX, fireSpots } from '../src/settlements/heian-uji/fires.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = Object.keys(UJ_VOICES);

function listen({ x, z, y = 0, hour, doy = 140, rain = 0, secs = 120 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kine', 'loom', 'wheel', 'chisel', 'jarLid', 'frog', 'fishRise', 'crossing', 'higurashi', 'uguisu', 'owl', 'sedan', 'watchman', 'vendor']) { const o = m[v]; if (typeof o === 'function') m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('heian-uji').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'shingle', water: 1, town: 1, birds: 1, rain, indoors: false, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Uji: the profile carries the map, the bonshō stays the engine\'s', () => {
  const P = profileOf('heian-uji'), L = P.animals[LIFE];
  assert.ok(L.map === UJ && L.eaves);
  assert.equal(P.bells, 'bonsho');
});

test('Uji: every voice exists, is prefixed, and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('heian-uji').animals, roof: 'shingle', at: { x: 6.5, z: 0, y: 0, yaw: 0, hour: 12 } });
  m.doyOverride = 290;
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.ok(/^uj[A-Z]/.test(v), v); assert.equal(typeof m[v], 'function', v); assert.equal(VOICES[v], UJ_VOICES[v]); }
  for (const v of ['ujRush', 'ujWeir', 'ujKei', 'ujNenbutsu', 'ujFire', 'ujPlanks', 'ujAdze', 'ujAxe', 'ujStag']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  { const w = new Music(); w.seasonDoy = () => 330; assert.equal(w.ujKajika(0, bus, 1), 1, 'no kajika in winter'); }
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickUjTrade(h, d, k / 300)); return s; };
  assert.ok(seen(8, 200).has('ayu') && !seen(8, 30).has('ayu') && seen(9, 100).has('greens') && !seen(13, 100).has('greens'));
  assert.equal(pickUjTrade(3, 100, 0.5), null);
  assert.equal(new Set(Object.values(UJ_TRADES).map((T) => T.cry.join())).size, 3);
});

test('Uji: the map agrees with the town', () => {
  assert.ok(UJ.sites().length > 5);
  const ids = new Set(lots().map((l) => 'lot:' + l.seed));
  for (const s of UJ.sites()) { assert.ok(ids.has(s.id)); for (const [v] of s.work) assert.ok(VOICES[v] || Music.prototype[v] || UJ_VOICES[v], v); }
  for (const e of UJ.EMITTERS) { assert.ok(e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0, e.voice); assert.ok(VOICES[e.voice] || Music.prototype[e.voice], 'unknown voice ' + e.voice); }
  for (const r of Object.values(UJ.ROOMS)) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.ok(VOICES[v] || Music.prototype[v], v); }
  assert.equal(UJ.FIRES.length, fireSpots().length);
  assert.ok(UJ.canalSpot(riverX(0), 0).d === 0 && UJ.canalSpot(-250, 0).d > 100);
  const c = POND[0]; assert.ok(UJ.canalSpot(c.c[0], c.c[1]).d === 0 && UJ.canalSpot(c.c[0] + c.r[0] + 20, c.c[1]).d > 5);
  assert.equal(UJ.canalTrack(), null);
  const rnd = () => 0.4;
  assert.equal(UJ.streetTrack(0, 106, rnd, 90, 40), null); assert.equal(UJ.streetTrack(0, 106, rnd, 80, 30), null);
  assert.ok(UJ.pedlarTrack(0, 108, rnd, 70, 30)?.pts.length === 2);
  assert.equal(UJ.treeSpot(100, 0, rnd, 40), null);
  const bt = UJ.bridgeTrack(riverX(BRIDGE.z), BRIDGE.z, rnd);
  assert.ok(bt && Math.abs(bt.pts[1][0] - bt.pts[0][0]) > RIVER.w);
  assert.ok(UJ.riverSpot(riverX(0), 0, () => 0.3) && UJ.riverSpot(-250, 0, rnd) === null);
  assert.equal(UJ.roomAt(-40, 0, 1.4).use, 'hall');
  assert.equal(UJ.roomAt(-40, 0, 0), null);
  const s0 = UJ.sites()[0]; assert.equal(UJ.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.ok(UJ.frogGround(riverX(0), 0) > 0.9 && UJ.townNear(-40, 0) < 0.2);
});

test('Uji placed: the river by day, its frogs in spring nights, the hall at dusk, the fires at night', () => {
  assert.ok(listen({ x: riverX(0) - 20, z: 0, hour: 12, secs: 60 }).ujRush > 0, 'the river\'s rush');
  assert.ok(listen({ x: riverX(0) - 20, z: 0, hour: 22, doy: 140, secs: 200 }).ujKajika > 0, 'kajika on a May night');
  const o = UJ.OFFERING;
  assert.ok(listen({ x: o[0] + 6, z: 0, hour: 18.8, secs: 400 }).ujNenbutsu > 0, 'the nenbutsu at dusk');
  assert.ok(!listen({ x: o[0] + 6, z: 0, hour: 12, secs: 300 }).ujNenbutsu, 'not at noon');
  const f = UJ.FIRES[0];
  assert.ok(listen({ x: f[0], z: f[1] + 5, hour: 22, secs: 120 }).ujFire > 0, 'the basket fire');
  assert.ok(!listen({ x: f[0], z: f[1] + 5, hour: 12, secs: 120 }).ujFire, 'cold by day');
});

test('Uji placed: the street by day with none of Suzhou\'s walkers, a trade\'s work', () => {
  const day = listen({ x: 0, z: 108, hour: 8, doy: 200, secs: 400 });
  assert.ok(day.ujPedlar > 0, 'a pedlar crying');
  assert.ok(!day.sedan && !day.vendor && !day.watchman, 'none of Suzhou\'s walkers');
  const sp = UJ.sites().find((s) => s.use === 'weaver') || UJ.sites()[0], [v, , hrs] = sp.work[0];
  assert.ok(listen({ x: sp.at[0], z: sp.at[1] + 10, hour: (hrs[0] + hrs[1]) / 2, secs: 400 })[v] > 0, `${sp.use}: ${v}`);
  assert.ok(!listen({ x: sp.at[0], z: sp.at[1] + 10, hour: 2, secs: 200 })[v], 'nothing at night');
});
