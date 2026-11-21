// Paris 1248's sounds: the hours (the canonical hours and the curfew, from the cathedral's north tower), the sound map's places against the town's own
// data, the voices (made against a stand-in audio context: no sound is produced, every node is a recorder), and the scheduler listening at places.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { PARIS_VOICES, CRIES, pickCry } from '../src/engine/voices-paris.js';
import * as PM from '../src/settlements/paris/soundmap.js';
import { RADIUS, NORTH_ARM, SOUTH_ARM, lots } from '../src/settlements/paris/layout.js';
import { openMap, frontOf, walkSet, walkDist, frontAt } from '../src/settlements/paris/openwalk.js';
import { courtLots } from '../src/settlements/paris/court-lots.js';

const day = (P, lat = 48.85) => {
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
const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = () => {
  const { ctx, count } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  return { m, ctx, count };
};

test('Paris: the canonical hours and the curfew, eight rings a day, no other settlement\'s', () => {
  const ev = day(profileOf('paris'));
  const at = (e) => ev.filter(([, x]) => x === e).map(([h]) => h);
  for (const [k, h] of [['matins', 2], ['lauds', 5], ['prime', 6], ['terce', 9], ['sext', 12], ['none', 15], ['vespers', 17.5], ['curfew', 19.5]]) {
    const [got] = at('paris:' + k);
    assert.ok(got !== undefined && Math.abs(got - h) < 0.05, `${k} at ${got}`);
  }
  assert.equal(ev.length, 8);
  assert.equal(profileOf('paris').bells, 'paris');
  assert.ok(profileOf('paris').animals[LIFE].map === PM, 'the map rides on the animals');
  assert.deepEqual(Object.keys(profileOf('paris').animals).sort(), ['dog', 'horse', 'rooster']);
  assert.equal(profileOf('paris').roof, 'slate');
});

test('the map: its places are the town\'s places', async () => {
  const { streetLife, bridges } = await import('../src/settlements/paris/plan.js');
  const T = streetLife().flatMap((p) => p.elements).filter((e) => e.t === 'changer_table').map((e) => e.at);
  assert.equal(T.length, PM.CHANGERS.length);
  for (const c of PM.CHANGERS) assert.ok(T.some((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) < 0.2), 'a board at ' + c);
  const mills = bridges[0].elements.filter((e) => e.t === 'mill_pendant').map((e) => e.at);
  assert.equal(mills.length, PM.MILLS.length);
  for (const w of PM.MILLS) assert.ok(mills.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), 'a mill at ' + w);
  const { tradeOfSeed, frontKind } = await import('../src/styles/gothic/houses.js');
  for (let seed = 0; seed < 4000; seed += 7) {
    assert.equal(PM.tradeOfSeed(seed), tradeOfSeed(seed), 'trade of ' + seed);
    for (const front of ['s', 'n']) for (const w of [5.4, 6.6]) assert.equal(frontOf({ seed, front, rect: [0, 0, w, 10] }), frontKind({ seed, front, rect: [0, 0, w, 10] }), 'front of ' + seed);
  }
  const wells = (await import('../src/settlements/paris/court.js')).courtLife?.().elements?.filter((e) => e.t === 'well').map((e) => e.at) || [];
  assert.ok(wells.some((q) => Math.hypot(q[0] - PM.WELLS[0][0], q[1] - PM.WELLS[0][1]) < 0.2), 'the court\'s well');
  for (const a of [...PM.EMITTERS.map((e) => e.at), ...PM.BELLS.parish, PM.BELLS.nd, PM.BELLS.choir]) assert.ok(Math.hypot(a[0], a[1]) < 4000, 'a place');
  for (const e of PM.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.hours.length === 2); }
  for (const e of PM.EMITTERS.filter((e) => e.r50 < 100)) assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS + 20, 'inside the disc: ' + e.voice);
});

test('the map: rooms, shops that work, the river, planting', () => {
  // every open shop and every lodging of the court row has its trade's work
  const sites = PM.sites();
  assert.ok(sites.length >= courtLots().length + 100, `${sites.length} shops that work`);
  for (const s of sites) assert.ok(s.work.length > 0, s.use);
  const court = sites.find((s) => s.id.startsWith('court:'));
  assert.equal(PM.roomAt(court.at[0], court.at[1], 1.2).use, court.use);
  assert.equal(PM.roomAt(court.at[0], court.at[1], 6).upper, true);
  assert.equal(PM.roomAt(200, 0, 1).use, 'temple', 'the nave');
  assert.equal(PM.roomAt(-232, -58, 8).use, 'hall', 'the Grand-Salle');
  assert.equal(PM.roomAt(-250, -10, 1), null, 'the court is the open');
  for (const r of Object.values(PM.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0);
  assert.ok(PM.ROOMS.temple.roof < PM.ROOMS.tavern.roof, 'rain is loud under a roof of slate, far under a stone vault');
  const rnd = () => 0.4;
  const bt = PM.riverTrack(0, -100, rnd);
  assert.ok(bt && bt.pts.every((p) => p[1] > NORTH_ARM[1] && p[1] < NORTH_ARM[3]), 'a boat in the north arm');
  const bs = PM.riverTrack(30, 120, rnd);
  assert.ok(bs && bs.pts.every((p) => p[1] > SOUTH_ARM[1] && p[1] < SOUTH_ARM[3]), 'a boat in the south arm');
  assert.equal(PM.riverTrack(0, 0, rnd, 60), null, 'none heard from the island\'s middle at 60 m');
  assert.ok(PM.canalSpot(0, -100).d < 10);
  const st = PM.walkTrack(-100, 2, rnd);
  assert.ok(st && st.pts.every((p) => Math.abs(p[1] - 2.4) < 1.5), 'a walker on the main street');
  const bg = PM.bridgeTrack(0, -100, rnd);
  assert.ok(bg && Math.abs(bg.pts[0][0]) < 2);
  assert.equal(PM.treeSpot(-290, 10, rnd, 36), null, 'no cicadas\' tree');
  assert.ok(PM.treeSpot(-290, 10, rnd, 40), 'a bird\'s tree in the orchard');
  assert.ok(PM.leafNear(-300, 0) > 0.7 && PM.leafNear(100, 100) < 0.2);
  assert.ok(PM.bambooNear(0, 0) === 0 && PM.lotusNear(0, 0) === 0 && PM.frogGround(-290, 0) === 0);
  assert.ok(PM.townNear(125, 0) === 1 && PM.townNear(-300, 0) < 0.2 && PM.townNear(200, 0) < 0.3);
});

test('the walk: the lots on the streets are opened, as shops, near the way in first', () => {
  const w = walkSet(), open = openMap();
  assert.ok(w.length >= 40 && w.length <= 64, `${w.length} lots on the walk`);
  for (const l of w) { assert.ok(open.has(l), 'opened'); assert.equal(frontOf(l), 'shop'); assert.ok(walkDist(frontAt(l)) <= 7.5 + 1e-6); }
  // along the island's main street, from the palace gate east, the opened share of the shop fronts is high
  const street = lots().filter((l) => walkDist(frontAt(l)) < 3.2 && frontOf(l) === 'shop' && l.rect[0] > -112 && l.rect[2] < 100 && l.rect[2] - l.rect[0] >= 5);
  const share = street.filter((l) => open.has(l)).length / street.length;
  assert.ok(share > 0.85, `${(share * 100).toFixed(0)} % of the shop fronts on the main street open`);
});

test('every Paris voice exists and can be made; the cries are distinct and by the hour', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('paris').animals, roof: 'slate', at: { x: -100, z: 2, yaw: 0, y: 1, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of Object.keys(PARIS_VOICES)) assert.equal(typeof m[v], 'function', v);
  for (const v of ['mill', 'washer', 'cooperTap', 'goldTap', 'cleaver', 'awl', 'ovenDoor', 'tallow', 'fishSlap', 'stamp', 'pig', 'handbell']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  m.plc.hourNow = 10;
  for (const v of ['seineBoat', 'parisCry', 'cart', 'parisWatch']) assert.ok(m[v](ctx.currentTime, bus, 1) >= 0, v);
  m.doyOverride = 150;
  assert.ok(m.swift(ctx.currentTime, bus, 1) > 1, 'swifts in May');
  m.doyOverride = 20;
  assert.ok(m.swift(ctx.currentTime, bus, 1) < 1, 'none in January');
  const cries = Object.values(CRIES).filter((c) => c.cry).map((c) => c.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(cries).size, cries.length, 'distinct contours');
  const seen = (h) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickCry(h, k / 300)); return s; };
  assert.ok(seen(5).has('baths') && !seen(12).has('baths'), 'the baths first, at dawn');
  assert.ok(seen(17.5).has('wafers') && !seen(9).has('wafers'), 'the wafers at the day\'s end');
  assert.ok(seen(8).has('cress') && seen(8).has('milk') && !seen(15).has('milk'));
  assert.equal(pickCry(21), null, 'nobody cries after the curfew');
  assert.equal(pickCry(3), null);
});

test('the bells: each hour rings from the north tower, the parish churches answer, the office is sung; made a few nodes a tick', () => {
  const { m, ctx, count } = music();
  m.place({ voices: {}, animals: profileOf('paris').animals, roof: 'slate', at: { x: 100, z: 20, yaw: 0, y: 1, hour: 12 } });
  for (const kind of ['matins', 'lauds', 'prime', 'terce', 'sext', 'none', 'vespers', 'curfew']) {
    ctx.currentTime += 600; m.ringBusy = 0;
    const t0 = ctx.currentTime + 0.2, before = count();
    m.ring('paris:' + kind);
    assert.ok(m.ringBusy > t0 + 15, `${kind} rings for ${(m.ringBusy - t0).toFixed(0)} s`);
    assert.ok(count() - before < 400, `${kind} makes few nodes at once`);
    let worst = 0;
    // the ring's own cues are drained in its length (the placed life of the place keeps queueing its own, so 'until none are left' never ends)
    for (const end = m.ringBusy + 3; ctx.currentTime < end;) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
    assert.ok(worst < 220, `${kind}: at most ${worst} nodes in a tick`);
  }
  // the curfew is the longest and the deepest; the night's matins is bells only
  ctx.currentTime += 600; m.ringBusy = 0; const a = ctx.currentTime; m.ring('paris:curfew'); const cur = m.ringBusy - a;
  ctx.currentTime += 600; m.ringBusy = 0; const b = ctx.currentTime; m.ring('paris:matins'); const mat = m.ringBusy - b;
  assert.ok(cur > 45 && mat > 30 && cur > mat * 0.8);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = wind;
  const calls = {}, names = [...Object.keys(PARIS_VOICES), 'coin', 'teaTalk', 'teaClink', 'pourWine', 'scissors', 'brush', 'kitchen', 'chisel', 'wellBucket', 'lap', 'eaveDrip', 'crossing', 'boat', 'vendor', 'sedan', 'watchman', 'cicada', 'frog', 'seasonBird', 'cricket', 'dogFar', 'culm'];
  for (const v of names) { const o = m[v]; if (typeof o !== 'function' || ['plainsong', 'parisBells'].includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('paris').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'slate', water: 1, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Paris placed: the Grand Pont by day, the quay at dawn, the court at night, rain', () => {
  let r = listen({ x: 0, z: -135, hour: 10, secs: 420 });
  assert.ok(r.calls.coin > 0, 'the changers\' coins');
  assert.ok(r.calls.mill > 0, 'the mills\' wheels');
  assert.ok(!r.calls.boat && !r.calls.vendor && !r.calls.sedan && !r.calls.cicada && !r.calls.frog, 'none of Suzhou\'s voices');
  r = listen({ x: 60, z: -150, hour: 9, secs: 900 });
  assert.ok(r.calls.seineBoat > 0, 'a boat on the river');
  r = listen({ x: -90, z: 3, hour: 5.2, secs: 700 });
  assert.ok(r.calls.parisCry > 0, 'the bath-keepers\' cry at dawn on the main street');
  r = listen({ x: -90, z: 3, hour: 21, secs: 600 });
  assert.ok(!r.calls.parisCry && !r.calls.coin && !r.calls.cooperTap, 'after the curfew the street is quiet');
  r = listen({ x: -90, z: 3, hour: 22.5, secs: 900 });
  assert.ok(r.calls.parisWatch > 0, 'the watch walks');
  r = listen({ x: -90, z: 3, hour: 11, rain: 0.9, secs: 300 });
  assert.ok(!r.calls.seineBoat && !r.calls.parisCry && !r.calls.coin, 'rain keeps the trades indoors');
  // the shops that work are heard by their doors, the cooper and the baker by their own hours
  const baker = PM.sites().find((s) => s.use === 'baker'), cooper = PM.sites().find((s) => s.use === 'cooper');
  r = listen({ x: baker.at[0], z: baker.at[1] + 6, hour: 4.5, secs: 400 });
  assert.ok(r.calls.ovenDoor > 0, 'the oven door before dawn');
  r = listen({ x: cooper.at[0], z: cooper.at[1] + 6, hour: 10, secs: 400 });
  assert.ok(r.calls.cooperTap > 0, 'the cooper at his hoops');
});
