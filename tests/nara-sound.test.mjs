// Nara's placed sounds (src/settlements/nara/soundmap.js, src/engine/voices-nara.js): the voices exist and can be made against a
// stand-in audio context (no sound: every node is a recorder), the map's places agree with the town the settlement builds, and the
// scheduler makes each sound at its place, hour, season and weather. Nothing is asserted about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { NARA_TRADES, naraTradeAt } from '../src/engine/voices-nara.js';
import * as NA from '../src/settlements/nara/soundmap.js';
import { HALL } from '../src/settlements/nara/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['naraBonshoSeries', 'naraGagaku', 'naraGateDrum', 'naraScribe', 'naraAdze', 'naraPedlar', 'naraStag'];
const USED = ['keisuChant', 'kitchen', 'hammer', 'loom', 'wheel', 'strawBeat', 'higurashi', 'uguisu', 'hototogisu', 'suzumushi', 'owl'];

test('Nara: the profile carries the capital\'s life and its map; the engine\'s own bell schedule is off', () => {
  const P = profileOf('nara'), L = P.animals[LIFE];
  assert.ok(L.map === NA && L.market);
  let n = 0;
  for (let m = 0, prev = null; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 34.7 }; n += due(P, prev, now).length; prev = now; }
  assert.equal(n, 0, 'the bell is the map\'s emitter, at its tower');
});

test('Nara: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('nara').animals, roof: 'tile', at: { x: 0, z: 20, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 280;
  for (const v of [...NEW, ...USED]) assert.equal(typeof m[v], 'function', v);
  for (const v of NEW.filter((v) => v !== 'naraPedlar')) assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v);
  assert.ok(m.naraBonshoSeries(ctx.currentTime, bus, 1) > 30, 'a series of bell strokes is long');
  const contours = Object.values(NARA_TRADES).map((T) => T.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(contours).size, contours.length);
  assert.ok(naraTradeAt(9, 0.5) && !naraTradeAt(3, 0.5));
});

test('Nara: the map agrees with the town', async () => {
  const { town } = await import('../src/settlements/nara/town.js');
  const plans = await town();
  const wells = [...new Map(plans.flatMap((p) => p.elements).filter((e) => e.t === 'well').map((e) => [e.at.join(','), e.at])).values()];   // (a well is in both its tile's levels)
  assert.equal(wells.length, NA.WELLS.length);
  for (const w of NA.WELLS) assert.ok(wells.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), String(w));
  const open = plans.flatMap((p) => p.elements).filter((e) => e.t === 'nara_house' && e.open).length;
  assert.ok(NA.sites().length > 15 && NA.sites().length <= open, `${NA.sites().length} working houses of ${open} open`);
  for (const s of NA.sites()) assert.ok(s.work.length);
  for (const u of ['scriptorium', 'kitchen', 'carpenter']) assert.ok(NA.sites().some((s) => s.use === u), u);
  for (const r of Object.values(NA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
});

test('Nara: the map\'s places and tracks', () => {
  const rnd = () => 0.4;
  assert.equal(NA.canalTrack(100, 0, rnd), null);
  assert.equal(NA.streetTrack(0, 160, rnd, 90, 40), null); assert.equal(NA.streetTrack(0, 160, rnd, 90, 34), null); assert.equal(NA.streetTrack(0, 160, rnd, 80, 30), null);
  const tr = NA.pedlarTrack(0, 190, rnd, 70, 30);
  assert.ok(tr && tr.pts.length === 2, 'a pedlar finds a street');
  assert.equal(NA.treeSpot(0, 190, rnd, 40), null, 'no Chinese seasonal birds');
  assert.ok(NA.treeSpot(0, 190, () => 0.3, 41) || NA.treeSpot(150, -150, () => 0.3, 41), 'the city\'s own birds find a tree');
  assert.ok(NA.townNear(40, 190) > 0.7 && NA.townNear(0, -60) < 0.4 && NA.treeness(0, -300) > 0.7 && NA.treeness(40, 190) < 0.4);
  assert.equal(NA.roomAt(0, 190, 0), null, 'the street is the open');
  assert.equal(NA.roomAt(0, (HALL[1] + HALL[3]) / 2, 2.4).use, 'hall');
  const s0 = NA.sites()[0];
  assert.equal(NA.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  const bells = NA.EMITTERS.filter((e) => e.voice === 'naraBonshoSeries');
  assert.equal(bells.length, 2);
  assert.ok(bells.every((e) => e.after && e.hours[1] - e.hours[0] < 0.3 && e.gap[0] > 5));
  assert.ok(NA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, ...USED, 'wellBucket', 'eaveDrip', 'frog', 'cicada', 'seasonBird', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); if (!(r === 1)) calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('nara').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}
const site = (use) => NA.sites().filter((s) => s.use === use).sort((a, b) => a.at[0] - b.at[0])[0];

test('Nara placed: the bell, the drum, the sutra and the court music, in their places', () => {
  const g = { x: NA.BELL[0] + 10, z: NA.BELL[1] };
  assert.ok(listen({ ...g, hour: 5.4, secs: 120 }).calls.naraBonshoSeries > 0, 'the dawn bell');
  assert.ok(listen({ ...g, hour: 18.1, secs: 120 }).calls.naraBonshoSeries > 0, 'the dusk bell');
  assert.ok(!listen({ ...g, hour: 12, secs: 120 }).calls.naraBonshoSeries, 'not at noon');
  assert.ok(listen({ x: NA.SOUTH_GATE[0], z: NA.SOUTH_GATE[1] + 10, hour: 18.35, secs: 120 }).calls.naraGateDrum > 0, 'the gate drum at dusk');
  assert.ok(listen({ x: 0, z: -60, y: 2.4, hour: 5.9, secs: 200, indoors: true }).calls.keisuChant > 0, 'the morning service in the hall');
  assert.ok(listen({ x: NA.STAGE[0] + 6, z: NA.STAGE[1] + 6, hour: 10, secs: 500 }).calls.naraGagaku > 0, 'court music rehearsed at the stage');
  assert.ok(!listen({ x: NA.STAGE[0] + 6, z: NA.STAGE[1] + 6, hour: 10, rain: 0.8, secs: 300 }).calls.naraGagaku, 'not in the rain');
});

test('Nara placed: the service quarter and the trades', () => {
  const sc = site('scriptorium'), ca = site('carpenter');
  assert.ok(sc && ca, 'a scriptorium and a carpenters\' shed with sounds');
  assert.ok(listen({ x: sc.at[0], z: sc.at[1] + 10, hour: 10, secs: 500 }).calls.naraScribe > 0, 'the scribes by day');
  assert.ok(!listen({ x: sc.at[0], z: sc.at[1] + 10, hour: 2, secs: 300 }).calls.naraScribe, 'nothing at night');
  assert.ok(listen({ x: ca.at[0], z: ca.at[1] + 10, hour: 10, secs: 500 }).calls.naraAdze > 0, 'the adze');
  const r = listen({ x: 0, z: 190, hour: 9, secs: 600 });
  assert.ok(r.calls.naraPedlar > 0, 'a pedlar by day in the streets');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat, 'none of Suzhou\'s walkers');
  assert.ok(!listen({ x: 0, z: 190, hour: 2, secs: 400 }).calls.naraPedlar, 'not at night');
});

test('Nara placed: the seasons and the hours of the creatures', () => {
  const g = { x: 0, z: 190 };
  const birds = (doy, hour) => listen({ ...g, hour, doy, secs: 400 }).calls;
  assert.ok(birds(100, 9).uguisu > 0 && !birds(250, 9).uguisu, 'the bush warbler in spring');
  assert.ok(!birds(100, 9).seasonBird, 'no Chinese seasonal birds');
  assert.ok(birds(160, 21).hototogisu > 0 && !birds(100, 21).hototogisu, 'the lesser cuckoo on early-summer nights');
  const hill = (doy, hour) => listen({ x: 250, z: -60, hour, doy, secs: 400 }).calls;
  assert.ok(hill(260, 22).suzumushi > 0 && !hill(100, 22).suzumushi, 'the bell cricket in autumn');
  assert.ok(listen({ x: 250, z: -60, hour: 20, doy: 280, secs: 500 }).calls.naraStag > 0 && !listen({ x: 250, z: -60, hour: 20, doy: 100, secs: 500 }).calls.naraStag, 'the stags call in the autumn only');
});

test('Nara placed: rooms', () => {
  const k = site('kitchen');
  const r = listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 200 });
  assert.equal(r.m.plc.room.use, 'kitchen');
});
