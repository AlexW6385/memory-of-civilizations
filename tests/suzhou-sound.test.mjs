// Suzhou's sounds: the hours (night watches, the temple's bell and drum) and a smoke test of the
// synthesis against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { doyOf, inSeason, seasonOf, SEASON_OF, TRADES, pickTrade, inHours } from '../src/engine/voices.js';
import * as SZ from '../src/settlements/ming-suzhou/soundmap.js';
import { UP } from '../src/settlements/ming-suzhou/uphouses.js';

const day = (P, lat = 31) => {
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, L = lat * Math.PI / 180;
    const now = { hour, el: Math.asin(Math.cos(L) * Math.cos(H)) * 180 / Math.PI, lat };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  return evs;
};

test('Suzhou: five watches, the temple bell at dawn and the drum at dusk, Hanshan at midnight', () => {
  const ev = day(profileOf('ming-suzhou'));
  const at = (e) => ev.filter(([, x]) => x === e).map(([h]) => h);
  for (const [n, h] of [[1, 19], [2, 21], [3, 23], [4, 1], [5, 3]]) {
    const [got] = at('watch:' + n);
    assert.ok(Math.abs(got - h) < 0.05, `watch ${n} at ${got}`);
  }
  assert.equal(at('hanshan').length, 1);
  // the old city's towers, far off: the morning bell at the fifth watch's end, the evening drum just before the first watch
  assert.ok(Math.abs(at('tower:am')[0] - 5) < 0.05 && Math.abs(at('tower:pm')[0] - 18.75) < 0.05);
  assert.ok(Math.abs(at('temple-am')[0] - 4.6) < 0.05);
  assert.ok(Math.abs(at('temple-pm')[0] - 18.5) < 0.05);
  assert.equal(ev.length, 10);
  // no watchman in the other cities of the Song or Tang, no temple bell in Edo from this list
  assert.equal(day(profileOf('edo-himeji'), 35).filter(([, e]) => /watch|temple/.test(e)).length, 0);
});

test('Suzhou has the voices of its waters and streets, riding on the animals', () => {
  const P = profileOf('ming-suzhou'), L = P.animals[LIFE];
  assert.ok(L.canal && L.oar && L.hawkers && L.market && L.teahouse && L.patrol && L.eaves);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'rooster'], 'the life is not an animal');
  assert.equal(P.roof, 'xiaoqing');
  assert.equal(profileOf('paris').animals[LIFE], undefined);
});

// a stand-in for the Web Audio API: every node and parameter accepts what is asked of it, and
// the nodes made are counted
const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

test('Suzhou: every sound can be made, and the cues are made a few at a time', () => {
  const { ctx, count } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  const L = profileOf('ming-suzhou').animals;
  const place = (o) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'xiaoqing', ...o });
  // day, by a canal, in the market streets
  place({ water: 1, town: 1, birds: 1 });
  assert.ok(m.plc.hub, 'the hubbub is on by day in town');
  for (let i = 0; i < 400; i++) { ctx.currentTime += 0.09; m.placeEvents(); if (i % 5 === 0) place({ water: 1, town: 1, birds: 1 }); }
  // rain: the roofs, the water, the eaves
  place({ water: 1, town: 1, rain: 1 });
  assert.ok(m.plc.rw, 'rain on the canal');
  for (let i = 0; i < 200; i++) { ctx.currentTime += 0.09; m.placeEvents(); }
  // night: the watchman's rounds
  for (let i = 0; i < 600; i++) { ctx.currentTime += 0.09; place({ water: 0, town: 0.35, crickets: 1 }); m.placeEvents(); }
  // the hours
  m.far = null; m.amb = { muffle: ctx.createGain() };
  for (const ev of ['watch:1', 'watch:3', 'temple-am', 'temple-pm', 'hanshan']) { ctx.currentTime += 400; m.ringBusy = 0; m.ring(ev); }
  const before = count();
  m.ringBusy = 0; m.ring('temple-pm');
  const at = count() - before;
  const q0 = m.cues.length;
  assert.ok(q0 > 100, `the service is queued (${q0})`);
  assert.ok(at < 400, `the ring itself makes few nodes (${at})`);
  // drained in ticks of 90 ms: no tick makes a crowd of nodes
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
  // left the town: the layers go after a while
  for (let i = 0; i < 120; i++) { ctx.currentTime += 0.5; m.place({ water: 0, town: 0, animals: {}, roof: 'tile' }); }
  assert.equal(m.plc.hub, null);
  assert.equal(m.plc.rw, null);
});

// ── the placed sounds (src/engine/voices.js, src/settlements/ming-suzhou/soundmap.js) ──────────────────────

const VOICES_NEW = ['boat', 'fishRise', 'wellBucket', 'pour', 'loom', 'hammer', 'abacus', 'plane', 'grinder', 'rattle', 'clapper', 'vendor', 'teaTalk', 'teaClink', 'teaBlock',
  'scissors', 'mortar', 'chisel', 'pourWine', 'kitchen', 'wheel', 'splitBamboo', 'crossing', 'sedan', 'watchman', 'qinNote', 'qin', 'xiaoNote', 'xiao', 'cicada', 'frog', 'cricket',
  'seasonBird', 'dogFar', 'culm', 'eaveDrip', 'placed', 'placedLayers'];

test('Suzhou: every placed voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('ming-suzhou').animals, roof: 'xiaoqing' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  const f = m.along([[0, 0], [20, 0]], 1);
  for (const v of VOICES_NEW) assert.equal(typeof m[v], 'function', v);
  for (const v of ['boat', 'crossing', 'sedan', 'watchman']) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 3, v);
  for (const v of ['fishRise', 'wellBucket', 'pour', 'loom', 'hammer', 'abacus', 'plane', 'grinder', 'rattle', 'clapper', 'teaTalk', 'teaClink', 'teaBlock', 'scissors', 'mortar', 'chisel',
    'pourWine', 'kitchen', 'wheel', 'splitBamboo', 'qin', 'xiao', 'cicada', 'frog', 'cricket', 'dogFar', 'culm', 'eaveDrip']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v);
  for (const k of ['cuckoo', 'oriole', 'magpie', 'tit']) assert.ok(m.seasonBird(ctx.currentTime, bus, 1, k) > 0.3, k);
  for (const k of Object.keys(TRADES)) assert.ok(m.vendor(ctx.currentTime, bus, 1, f, k) > 0, k);
});

test('the calendar: windows of the year, and the trades by hour and season', () => {
  const D = { winter: 20, spring: 125, summer: 200, autumn: 290 };
  assert.ok(Math.abs(doyOf(1, 0) - 15) < 1 && Math.abs(doyOf(-1, 0) - 197.6) < 2, 'mid-January and mid-July');
  assert.ok(Math.abs(doyOf(0, 1) - 289) < 2, 'autumn 1 is mid-October');
  assert.equal(inSeason(10, 350, 30, 5), 1, 'wraps the year');
  const on = (k) => Object.entries(D).filter(([, d]) => seasonOf(k, d) > 0.5).map(([n]) => n);
  assert.deepEqual(on('cicada'), ['summer']);
  assert.deepEqual(on('cricket'), ['autumn']);
  assert.deepEqual(on('frog'), ['spring', 'summer', 'autumn']);
  assert.deepEqual(on('cuckoo'), ['spring']);
  assert.deepEqual(on('oriole'), ['summer']);
  assert.deepEqual(on('magpie'), ['autumn']);
  assert.deepEqual(on('tit'), ['winter']);
  // hours of the trades
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 400; k++) s.add(pickTrade(h, d, k / 400)); return s; };
  assert.ok(seen(8, D.spring).has('flowers') && !seen(15, D.spring).has('flowers'), 'flowers in the morning');
  assert.ok(seen(20, D.spring).has('soup') && seen(20, D.spring).has('clapper') && !seen(8, D.spring).has('clapper'), 'the evening: soup and the bamboo clapper');
  assert.ok(!seen(14, D.winter).has('melon') && seen(14, D.summer).has('melon'), 'melons in summer');
  assert.ok(seen(14, D.winter).has('cake') && !seen(14, D.summer).has('cake'), 'rice cake in the cold');
  assert.equal(pickTrade(3, D.spring, 0.5), null, 'nobody cries at three in the morning');
  // every cry has its own contour: no two the same
  const cries = Object.entries(TRADES).filter(([, T]) => T.cry).map(([k, T]) => [k, T.cry.map((n) => n[0]).join(',')]);
  assert.equal(new Set(cries.map(([, c]) => c)).size, cries.length, 'distinct contours');
  assert.ok(cries.length >= 7);
  assert.ok(inHours(23, [22, 4]) && inHours(2, [22, 4]) && !inHours(12, [22, 4]));
});

test('the map: houses, wells, rooms, tracks, planting', () => {
  assert.equal(SZ.sites().length, UP.length, 'a lot found for every trade house');
  for (const s of SZ.sites()) assert.ok(s.at[1] > 56 && s.at[1] < 63, s.use);
  const at = (use) => SZ.sites().find((s) => s.use === use).at;
  assert.ok(at('weaver')[0] < -75 && at('iron')[0] > 66, 'the loom west, the smith east');
  // the rooms
  assert.equal(SZ.roomAt(...at('inn'), 0.3).use, 'inn');
  assert.equal(SZ.roomAt(at('merchant')[0], 59, 4).upper, true);
  assert.equal(SZ.roomAt(0, -15, 0.8).use, 'hall', 'the Hall of Distant Fragrance');
  assert.equal(SZ.roomAt(-40, -122, 1.2).use, 'temple');
  assert.equal(SZ.roomAt(0, 66, 0), null, 'the street is the open');
  for (const r of Object.values(SZ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  // tracks near the listener
  const rnd = () => 0.4;
  const bt = SZ.canalTrack(0, 66, rnd);
  assert.ok(bt && bt.pts.every((p) => p[1] > 68 && p[1] < 76), 'a boat on the south canal');
  assert.equal(SZ.canalTrack(0, -30, rnd), null, 'no canal in the garden to hear a boat on');
  const st = SZ.streetTrack(0, 65, rnd), bg = SZ.bridgeTrack(2, 66, rnd);
  assert.ok(st && bg && Math.abs(bg.pts[0][0]) < 2);
  let seed = 0.123; const rr = () => (seed = (seed * 9301 + 0.4937) % 1);
  assert.ok(SZ.pondSpot(0, -30, rr) && SZ.shoreSpot(0, -30, rr));
  // the planting: bamboo in the hollow, lotus on the pond, none on the street
  assert.ok(SZ.bambooNear(-63, -27) > 0.9 && SZ.bambooNear(0, 150) === 0 && SZ.lotusNear(0, -36) > 0.9 && SZ.lotusNear(0, 150) === 0);
  assert.ok(SZ.greenNear(0, -20) > 0.9 && SZ.greenNear(0, 100) < 0.5);
});

test('the wells of the map are the wells the town builds', async () => {
  const { town } = await import('../src/settlements/ming-suzhou/town.js');
  const plans = await town();
  const wells = plans.flatMap((p) => p.elements).filter((e) => e.t === 'well').map((e) => e.at);
  assert.equal(wells.length, SZ.WELLS.length);
  for (const w of SZ.WELLS) assert.ok(wells.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), String(w));
});

// run the scheduler for `secs` of sound with the listener at `at` and the weather and season given; count the voices made
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {}, args = {};
  for (const v of VOICES_NEW) { const o = m[v]; if (['placed', 'placedLayers', 'qinNote', 'xiaoNote'].includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; (args[v] ||= []).push(a.slice(3)); return o.apply(this, a); }; }
  const L = profileOf('ming-suzhou').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'xiaoqing', water: 1, town: 1, birds: 1, rain, indoors, cicadas: 0.7, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, args, m };
}

test('Suzhou placed: the town by day, near its trades', () => {
  const weaver = SZ.sites().find((s) => s.use === 'weaver').at, iron = SZ.sites().find((s) => s.use === 'iron').at, inn = SZ.sites().find((s) => s.use === 'inn').at;
  let r = listen({ x: weaver[0], z: 65, hour: 10 });
  assert.ok(r.calls.loom > 0, 'the loom clacks by the weaver\'s lane by day');
  assert.ok(!r.calls.hammer, 'but not the smith, a hundred and fifty metres off');
  r = listen({ x: iron[0], z: 65, hour: 10 });
  assert.ok(r.calls.hammer > 0 && !r.calls.loom, 'the smith east');
  r = listen({ x: inn[0], z: 65, hour: 10 });
  assert.ok(r.calls.teaTalk > 0, 'the tea house murmurs');
  r = listen({ x: weaver[0], z: 65, hour: 2 });
  assert.ok(!r.calls.loom && !r.calls.vendor, 'nothing works at night');
  r = listen({ x: weaver[0], z: 65, hour: 10, rain: 0.9 });
  assert.ok(!r.calls.vendor && !r.calls.boat && !r.calls.sedan, 'no cries and no boats in heavy rain');
  r = listen({ x: 0, z: 66, hour: 8, secs: 400 });
  assert.ok(r.calls.vendor > 0 && r.calls.boat > 0 && r.calls.crossing > 0, `vendors ${r.calls.vendor}, boats ${r.calls.boat}, walkers ${r.calls.crossing}`);
  assert.ok(r.args.vendor.every(([, trade]) => ['flowers', 'veg', 'fish', 'oil', 'goods', 'rattle', 'cake', 'soup'].includes(trade)), 'morning trades');
  r = listen({ x: 122, z: 64, hour: 10, secs: 400 });
  assert.ok(r.calls.wellBucket > 0, 'the bucket at the well');
  r = listen({ x: 0, z: 150, hour: 10 });
  assert.ok(!r.calls.boat && !r.calls.loom && !r.calls.wellBucket, 'far from everything');
});

test('Suzhou placed: the garden, the hours and the seasons', () => {
  const garden = { x: 0, z: -30 };
  let r = listen({ ...garden, hour: 18.5, secs: 600 });
  assert.ok(r.calls.xiao > 0, 'a flute across the water at dusk');
  assert.ok(!listen({ ...garden, hour: 11, secs: 300 }).calls.xiao, 'not at noon');
  r = listen({ x: -47, z: 10, hour: 17, secs: 500 });
  assert.ok(r.calls.qin > 0, 'the qin from Little Canglang');
  assert.ok(!listen({ x: -47, z: 10, hour: 17, rain: 0.95, secs: 300 }).calls.qin, 'not in a downpour');
  r = listen({ ...garden, hour: 14, doy: 200, secs: 300 });
  assert.ok(r.calls.cicada > 0 && !listen({ ...garden, hour: 14, doy: 125, secs: 300 }).calls.cicada, 'cicadas in the summer afternoon only');
  assert.ok(!listen({ ...garden, hour: 23, doy: 200, secs: 300 }).calls.cicada, 'not at night');
  r = listen({ ...garden, hour: 1, doy: 140, secs: 200 });
  assert.ok(r.calls.frog > 5, 'frogs by the pond at night in the warm months');
  assert.ok(!listen({ ...garden, hour: 1, doy: 20, secs: 200 }).calls.frog, 'none in winter');
  assert.ok(listen({ ...garden, hour: 22, doy: 280, secs: 200 }).calls.cricket > 5 && !listen({ ...garden, hour: 22, doy: 125, secs: 200 }).calls.cricket, 'crickets in autumn');
  const bird = (doy) => { const b = listen({ ...garden, hour: 9, doy, secs: 600 }).args.seasonBird || []; return [...new Set(b.map((a) => a[0]))]; };
  assert.deepEqual(bird(115), ['cuckoo']); assert.deepEqual(bird(200), ['oriole']); assert.deepEqual(bird(290), ['magpie']); assert.deepEqual(bird(20), ['tit']);
  r = listen({ x: 0, z: 0, hour: 1, secs: 400 });
  assert.ok(r.calls.dogFar > 0 && r.calls.watchman > 0, 'dogs far off and the watchman at night');
  assert.ok(!listen({ x: 0, z: 0, hour: 12, secs: 400 }).calls.dogFar, 'not by day');
});

test('Suzhou placed: water and rain; eaves drip on after the rain', () => {
  const near = { x: 0, z: 66, hour: 12, secs: 120 };
  assert.ok(listen({ ...near, rain: 0.8 }).calls.eaveDrip > 20, 'drips in rain');
  const { m } = listen({ ...near, rain: 0.8, secs: 60 });
  assert.ok(m.plc.eaveWet > 0.7);
  assert.ok(!listen({ ...near, rain: 0, secs: 120 }).calls.eaveDrip, 'no rain, no drips');
  // the rain stops: the eaves go on dripping for a while, and then no more
  const a = m.plc.at, put = (rain) => m.place({ voices: {}, animals: profileOf('ming-suzhou').animals, roof: 'xiaoqing', water: 1, town: 1, rain, at: a });
  let after = 0, late = 0;
  const orig = m.eaveDrip; m.eaveDrip = function (...x) { if (m.ctx.currentTime < T1 + 60) after++; else if (m.ctx.currentTime > T1 + 400) late++; return orig.apply(this, x); };
  const T1 = m.ctx.currentTime;
  for (let i = 0; i < 6000; i++) { m.ctx.currentTime += 0.09; if (i % 5 === 0) put(0); m.placeEvents(); }
  assert.ok(after > 5, `still dripping in the minute after the rain (${after})`);
  assert.equal(late, 0, 'dry again after six minutes');
  assert.ok(listen({ x: 0, z: -30, hour: 12, secs: 600 }).calls.fishRise > 0, 'fish rise in the pond');
  assert.ok(!listen({ x: 0, z: 150, hour: 12, secs: 300 }).calls.fishRise, 'only in the garden');
});

test('Suzhou placed: indoors the rooms have their own small sounds', () => {
  const inn = SZ.sites().find((s) => s.use === 'inn').at, mer = SZ.sites().find((s) => s.use === 'merchant').at;
  let r = listen({ x: inn[0], z: inn[1], y: 0.3, hour: 11, indoors: true, secs: 300 });
  assert.ok(r.m.plc.room.use === 'inn' && (r.calls.teaClink > 0 || r.calls.teaBlock > 0), 'cups in the tea house');
  r = listen({ x: mer[0], z: 59, y: 4, hour: 11, indoors: true, secs: 300 });
  assert.ok(r.m.plc.room.use === 'merchant' && r.m.plc.room.upper);
  // rain on the tiles from inside is louder upstairs than in the hall
  r = listen({ x: mer[0], z: 59, y: 4, hour: 11, indoors: true, rain: 0.8, secs: 20 });
  assert.ok(r.m.plc.layers.roof && r.m.plc.layers.room, 'the roof and the room\'s air');
  assert.ok(r.m.roomCut > 0 && r.m.roomCut < 2000, 'a room of its own colour');
});

test('Suzhou placed: a sound is heard from where it is', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('ming-suzhou').animals, roof: 'xiaoqing', at: { x: 0, z: 0, yaw: 0, y: 0, hour: 10 } });
  const heard = (pos, r50 = 10, o = {}) => { const e = m.src(pos, r50, o).emitter; return { g: e.g.gain.value, cut: e.lp.frequency.value, pan: e.pn.pan.value }; };
  const near = heard([3, 0]), far = heard([60, 0]);
  assert.ok(near.g > far.g * 3 && near.cut > far.cut, 'louder and brighter near');
  assert.ok(near.pan > 0.5 && heard([-3, 0]).pan < -0.5, 'east is on the right, west on the left, facing north');
  assert.ok(Math.abs(heard([0, -20]).pan) < 0.1 && Math.abs(heard([0, 20]).pan) < 0.1, 'ahead and behind are in the middle');
  assert.ok(heard([0, -20]).cut > heard([0, 20]).cut, 'behind the head, duller');
  // a wall across the way (the engine's probes: eight directions, ahead first, clockwise)
  m.walls = [5, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity];
  const behindWall = heard([0, -20]), open = heard([20, 0]);
  assert.ok(behindWall.g < heard([0, -20], 10, { gain: 1 }).g + 1e-9 && behindWall.g < open.g, 'a wall ahead takes the sound of what is beyond it');
  // a workshop is heard dimmer from the lane than from its own room
  assert.ok(heard([3, 0], 7, { inside: 'up:iron' }).g < near.g * 1.0 + 0.35, 'through the walls');
  // inside: the street's sounds come through softened; the room's own do not
  m.place({ voices: {}, animals: profileOf('ming-suzhou').animals, roof: 'xiaoqing', indoors: true, at: { x: 69, z: 59, yaw: 0, y: 0.3, hour: 10 } });
  const outside = heard([69, 40], 8), mine = heard([69, 56], 8, { inside: 'up:iron' }), also = heard([69, 56], 8);
  assert.equal(m.plc.room.use, 'iron');
  assert.ok(mine.g > also.g * 1.5 && mine.g > outside.g, 'the forge in its own room is whole; the street is dimmed');
});
