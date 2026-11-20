// Tang Chang'an's sounds (docs/settlements/tang-changan.md §19): the placed map (src/settlements/tang-changan/soundmap.js) and the voices
// (src/engine/voices-tang.js), against a stand-in audio context (no sound is made: every node is a recorder). The curfew is the point:
// the market sounds from noon to the afternoon only, the streets are silent after the dusk drum, the guards ride at night.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE, due } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { TANG_VOICES } from '../src/engine/voices-tang.js';
import * as TC from '../src/settlements/tang-changan/soundmap.js';
import { MARKET, DACI_MAIN, PAGODA, TREE_ROWS } from '../src/settlements/tang-changan/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals, no Suzhou hawkers or watchman, the temple and the city drum ring', () => {
  const P = profileOf('tang-changan'), L = P.animals[LIFE];
  assert.equal(L.map, TC);
  assert.ok(L.market && L.eaves && !L.hawkers && !L.patrol && !L.teahouse && !L.oar && !L.canal);
  assert.deepEqual(Object.keys(P.animals).sort(), ['camel', 'dog', 'horse', 'rooster']);
  const ev = (a, b) => due(P, { hour: a }, { hour: b });
  assert.deepEqual(ev(4.5, 4.7), ['temple-am']);
  assert.deepEqual(ev(18.3, 18.5), ['temple-pm']);
  assert.deepEqual(ev(20, 20.5), [], 'no watchman\'s watches (the clapper is not of this city)');
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('tang-changan').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  assert.ok(Object.keys(TANG_VOICES).length >= 10);
  for (const v of Object.keys(TANG_VOICES)) {
    assert.ok(v.startsWith('tc'), v);
    assert.equal(typeof m[v], 'function', v);
    if (v === 'tcPlaced') continue;
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...TC.EMITTERS.map((e) => e.voice), ...TC.TRACKS.map((t) => t.voice)]);
  for (const s of TC.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(TC.ROOMS), TC.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the curfew: market hours, silent streets, gates, patrol', () => {
  for (const e of TC.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 420 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  // the market's work (its shops, the wine shop) sounds only while the market is open
  const shops = TC.sites().filter((s) => s.use === 'shop' || s.use === 'wineshop');
  assert.ok(shops.length >= 20);
  for (const s of shops) for (const [, , hrs] of s.work) assert.ok(hrs[0] >= 12 && hrs[1] <= 16.8, s.id);
  assert.ok(TC.MARKET_HOURS[0] === 12 && TC.MARKET_HOURS[1] < 17.5, 'noon drum, shut before dusk');
  const mid = [(MARKET.rect[0] + MARKET.rect[2]) / 2, (MARKET.rect[1] + MARKET.rect[3]) / 2];
  TC.clock.hour = 13; assert.ok(TC.townNear(...mid) > 0.9, 'the market is loud at one');
  TC.clock.hour = 10; assert.ok(TC.townNear(...mid) < 0.1, 'and quiet before noon');
  TC.clock.hour = 17.3; assert.ok(TC.townNear(...mid) < 0.1, 'shut before dusk');
  TC.clock.hour = 21; assert.equal(TC.townNear(...mid), 0, 'no night market');
  assert.equal(TC.townNear(0, 0), 0, 'no one on the avenue in the curfew');
  TC.clock.hour = 2; assert.equal(TC.townNear(...mid), 0);
  assert.equal(TC.streetTrack(0, 0, () => 0.4), null, 'no hawkers, no clapper');
  // nothing in the market sounds in the curfew hours except the street drums and the gates
  const night = (h) => h >= 18.75 || h < 4.9;
  for (const e of TC.EMITTERS.filter((x) => Math.abs(x.at[0] - mid[0]) < 100 && x.at[1] > MARKET.rect[1])) assert.ok(!(night(e.hours[0]) && night(e.hours[1])), e.voice);
  assert.ok(TC.EMITTERS.filter((e) => e.voice === 'tcGateBar').every((e) => (e.hours[0] >= 18.4 && e.hours[1] <= 19.5) || (e.hours[0] >= 4.9 && e.hours[1] <= 6)));
  assert.ok(TC.EMITTERS.some((e) => e.voice === 'tcJiegu' && e.hours[0] >= 18) && TC.EMITTERS.some((e) => e.voice === 'tcJiegu' && e.hours[1] <= 6));
  const patrol = TC.TRACKS.find((t) => t.key === 'patrol'), camels = TC.TRACKS.find((t) => t.key === 'camels');
  assert.ok(patrol.ok(23, 0) && !patrol.ok(12, 0), 'the guards ride only in the curfew');
  assert.ok(camels.ok(10, 0) && !camels.ok(23, 0) && !camels.ok(10, 0.9), 'camels by day, not in rain');
  assert.ok(patrol.get(0, 0, () => 0.4)?.pts.length === 2, 'on the avenue');
});

test('rooms: the hall, the pagoda, a shop; tracks and planting', () => {
  assert.equal(TC.roomAt(...DACI_MAIN, 0.3).use, 'hall');
  assert.equal(TC.roomAt(PAGODA[0], PAGODA[1], 10).use, 'pagoda');
  assert.equal(TC.roomAt(PAGODA[0], PAGODA[1], 20).upper, true);
  assert.equal(TC.roomAt(0, 0, 0), null, 'the avenue is the open');
  const s = TC.sites().find((x) => x.use === 'shop');
  assert.equal(TC.roomAt(...s.at, 0.3).use, 'shop');
  for (const r of [...Object.values(TC.ROOMS), TC.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.equal(TC.canalSpot(0, 0), null);
  assert.equal(TC.TEMPLE.hall, DACI_MAIN);
  assert.ok(TC.leafNear(TREE_ROWS[0], 0) > 0.5 && TC.greenNear(0, 0) <= 1);
  assert.equal(TC.WELLS.length >= 1, true);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0.3;
  const calls = {};
  const names = [...Object.keys(TANG_VOICES), 'vendor', 'watchman', 'sedan', 'dogFar', 'wellBucket', 'kitchen', 'qin', 'coin', 'tcWoodfish'];
  for (const v of names) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('tang-changan').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('placed: the market at one, the drums at dusk, the gates, the night patrol', () => {
  const mid = [(MARKET.rect[0] + MARKET.rect[2]) / 2, (MARKET.rect[1] + MARKET.rect[3]) / 2];
  let r = listen({ x: mid[0], z: mid[1], hour: 13, secs: 400 });
  assert.ok(Object.keys(r.calls).length > 0 && !r.calls.vendor && !r.calls.watchman && !r.calls.sedan, JSON.stringify(r.calls));
  r = listen({ x: mid[0], z: mid[1], hour: 22, secs: 400 });
  assert.ok(!r.calls.vendor && !r.calls.watchman && !r.calls.coin && !r.calls.tcHuMusic, 'the market is shut at night: ' + JSON.stringify(r.calls));
  r = listen({ x: 40, z: -10, hour: 18.5, secs: 300 });
  assert.ok(r.calls.tcJiegu > 0, `the dusk drums (${r.calls.tcJiegu})`);
  r = listen({ x: 40, z: -10, hour: 1, secs: 900 });
  assert.ok(r.calls.tcPatrol > 0, `the mounted guards (${r.calls.tcPatrol})`);
  assert.ok(!r.calls.tcCamelTrain && !r.calls.tcCart && !r.calls.tcJiegu, 'no camels or carts at night');
  r = listen({ x: 60, z: 0, hour: 9, secs: 900 });
  assert.ok(r.calls.tcCamelTrain > 0 || r.calls.tcCart > 0, 'a camel string or an ox-cart in the morning');
});

test('placed: indoors in the main hall', () => {
  const r = listen({ x: DACI_MAIN[0], z: DACI_MAIN[1], y: 0.3, hour: 8, indoors: true, secs: 400 });
  assert.equal(r.m.plc.room.use, 'hall');
  assert.ok(r.calls.tcWoodfish > 0, `the wooden fish (${r.calls.tcWoodfish})`);
});
