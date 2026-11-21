// Pagan's placed sounds (src/settlements/bagan/soundmap.js, src/engine/voices-bagan.js): the voices exist and can be made against a stand-in audio context, the map's places agree
// with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as BG from '../src/settlements/bagan/soundmap.js';
import { lots } from '../src/settlements/bagan/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['bgnBell', 'bgnHtiBells', 'bgnPaliChant', 'bgnPray', 'bgnSaung', 'bgnHsaing', 'bgnCart', 'bgnPounder', 'bgnPaddle', 'bgnRiver', 'bgnGecko', 'bgnJackal', 'bgnHawker', 'bgnWatchGong'];
const mk = (extra = {}) => {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  Object.assign(m, extra);
  return { ctx, m };
};

test('Bagan: the profile carries the map', () => {
  const P = profileOf('bagan'), L = P.animals[LIFE];
  assert.ok(L.map === BG);
  assert.equal(P.roof, 'thatch');
});

test('Bagan: every voice exists and can be made', () => {
  const { ctx, m } = mk();
  m.place({ voices: {}, animals: profileOf('bagan').animals, roof: 'thatch', at: { x: 30, z: 0, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  const f = m.along([[0, 0], [30, 0]], 1);
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0, v); }
});

test('Bagan: the map agrees with the settlement', () => {
  const S = BG.sites(), shops = lots().filter((l) => l.shop).length;
  assert.ok(S.length >= 100, `${S.length} sites`);
  assert.equal(S.filter((s) => s.use.startsWith('shop_')).length, shops);
  for (const s of S) { assert.ok(s.work.length, s.id); assert.ok(BG.ROOMS[s.use], s.use); }
  for (const k of ['shop_lacquer', 'shop_tea', 'house']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(BG.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(BG.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const t of BG.TRACKS) assert.ok(typeof t.ok(12, 0) === 'boolean' && t.speed > 0, t.key);
  assert.equal(BG.canalTrack(0, 0, () => 0.5), null); assert.equal(BG.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(BG.townNear(-100, 0) > 0.9 && BG.townNear(250, 250) < 0.3);
  const s0 = S.find((s) => s.use === 'shop_betel' || s.use.startsWith('shop_'));
  assert.equal(BG.roomAt(s0.at[0], s0.at[1], 0.6).same, s0.id);
  assert.equal(BG.roomAt(-60, 0, 0), null, 'the road is the open');
  assert.equal(BG.roomAt(105, 0, 1.2).use, 'temple');
  assert.ok(BG.canalSpot(-250, 0).d < 60 && BG.canalSpot(300, 0) === null, 'the river');
  assert.ok(BG.pondSpot(-31, 177, () => 0.4) && !BG.pondSpot(150, -100, () => 0.4), 'the tank');
  assert.equal(BG.treeSpot(100, 0, () => 0.3, 40), null, 'no seasonal songbirds of the engine');
  assert.ok(BG.treeSpot(105, 20, () => 0.3, 36), 'a tree for a cicada in the precinct');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, wind = 0.3, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'clay', 'loom', 'mortar', 'brushLacquer', 'kitchen', 'wheel', 'owl', 'wellBucket', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('bagan').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Bagan placed: the bell at dawn, the hti bells all day, the chant at the hours of the monks', () => {
  const b = BG.EMITTERS.find((e) => e.voice === 'bgnBell');
  assert.ok(listen({ x: b.at[0] - 8, z: b.at[1], hour: 5.2, secs: 240 }).calls.bgnBell > 0, 'the bell at dawn');
  assert.ok(!listen({ x: b.at[0] - 8, z: b.at[1], hour: 2, secs: 150 }).calls.bgnBell, 'not at night');
  assert.ok(listen({ x: 105, z: 70, hour: 12, secs: 80 }).calls.bgnHtiBells > 0, 'the bells of the hti');
  const k = BG.EMITTERS.find((e) => e.voice === 'bgnPaliChant' && e.hours[0] === 4.5 && e.r50 === 20);
  assert.ok(listen({ x: k.at[0], z: k.at[1] + 6, hour: 5, secs: 220 }).calls.bgnPaliChant > 0, 'the chant before the alms round');
  assert.ok(!listen({ x: k.at[0], z: k.at[1] + 6, hour: 14, secs: 150 }).calls.bgnPaliChant, 'not in the afternoon heat: the monks do not eat or chant after noon here');
});

test('Bagan placed: trades at their shops, none of Suzhou\'s walkers', () => {
  const w = BG.sites().find((s) => s.use === 'shop_betel');
  const r = listen({ x: w.at[0], z: w.at[1] + (w.at[1] < 0 ? 14 : -14), hour: 10, secs: 150 });
  assert.ok(r.calls.mortar > 0, 'the betel mortar');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + (w.at[1] < 0 ? 14 : -14), hour: 2, secs: 100 }).calls.mortar, 'nothing at night');
});

test('Bagan placed: the night: the tokay in the thatch, the jackal far off', () => {
  assert.ok(listen({ x: -60, z: -4, hour: 23, secs: 200 }).calls.bgnGecko > 0, 'the tokay');
  assert.ok(!listen({ x: -60, z: -4, hour: 12, secs: 100 }).calls.bgnGecko, 'not by day');
  assert.ok(listen({ x: 240, z: -50, hour: 23, secs: 420 }).calls.bgnJackal > 0, 'the jackal on the plain');
});

test('Bagan placed: carts on the road by day, boats on the river', () => {
  assert.ok(listen({ x: -60, z: 0, hour: 9, secs: 420 }).calls.bgnCart > 0, 'an oxcart');
  assert.ok(listen({ x: -255, z: 0, hour: 9, secs: 420 }).calls.bgnPaddle > 0, 'a boat');
  assert.ok(!listen({ x: -60, z: 0, hour: 2, secs: 100 }).calls.bgnCart, 'not at night');
});

test('Bagan placed: rooms', () => {
  const k = BG.sites().find((s) => s.use === 'shop_tea');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.6, hour: 11, indoors: true, secs: 60 }).m.plc.room.use, 'shop_tea');
});
