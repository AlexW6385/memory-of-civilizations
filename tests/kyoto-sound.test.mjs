// Muromachi Kyoto's placed sounds (src/settlements/muromachi-kyoto/soundmap.js, src/engine/voices-kyoto.js): the voices exist and can
// be made against a stand-in audio context (no sound: every node is a recorder), the map's places agree with the town the settlement
// builds, and the scheduler makes each sound at its place, hour, season and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { KYOTO_TRADES, pickKyotoTrade } from '../src/engine/voices-kyoto.js';
import * as KY from '../src/settlements/muromachi-kyoto/soundmap.js';
import { lots, STREAM, GINKAKU, SHRINE } from '../src/settlements/muromachi-kyoto/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['bonshoSeries', 'bonshoGinkaku', 'bonshoRyoan', 'hanBoard', 'keisuChant', 'gravel', 'kettleSimmer', 'shakuhachi', 'nohDrum', 'noh', 'washCloth', 'kine', 'strawBeat', 'sukiya',
  'ogaSaw', 'vatStir', 'pedlar', 'packhorse', 'higurashi', 'uguisu', 'hototogisu', 'suzumushi', 'owl'];

test('Kyoto: the profile carries the city\'s life and its map; the engine\'s own bell schedule is off', () => {
  const P = profileOf('muromachi-kyoto'), L = P.animals[LIFE];
  assert.ok(L.map === KY && L.eaves && L.market);
  assert.deepEqual(Object.keys(P.animals).sort(), ['crow', 'dog', 'rooster']);
  let n = 0;
  for (let m = 0, prev = null; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 35 }; n += due(P, prev, now).length; prev = now; }
  assert.equal(n, 0, 'the bells are the map\'s emitters, at their towers');
});

test('Kyoto: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('muromachi-kyoto').animals, roof: 'shingle', at: { x: 100, z: 60, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) assert.equal(typeof m[v], 'function', v);
  m.doyOverride = 150;
  for (const v of NEW.filter((v) => v !== 'nohDrum')) assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v);
  m.nohDrum(ctx.currentTime, bus, 1, true, [[0, 0.2, 'a']]);
  // a bell series is long and slow, the Noh passage close to a minute
  assert.ok(m.bonshoSeries(ctx.currentTime, bus, 1) > 40);
  const d = m.noh(ctx.currentTime, bus, 1);
  assert.ok(d > 35 && d < 80, `noh lasts ${d}`);
  // the cries: each trade its own contour, hours and seasons
  const contours = Object.values(KYOTO_TRADES).map((T) => T.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(contours).size, contours.length);
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickKyotoTrade(h, d, k / 300)); return s; };
  assert.ok(seen(9, 100).has('firewood') && seen(9, 100).has('flowers') && !seen(14, 100).has('flowers'));
  assert.ok(seen(10, 20).has('rice') && !seen(10, 20).has('flowers') && !seen(10, 200).has('rice'), 'rice cakes in the cold, flowers not in winter');
  assert.equal(pickKyotoTrade(3, 100, 0.5), null);
});

test('Kyoto: the map agrees with the town', async () => {
  const { town } = await import('../src/settlements/muromachi-kyoto/town.js');
  const plans = await town();
  const wells = plans.flatMap((p) => p.elements).filter((e) => e.t === 'ido').map((e) => e.at);
  assert.equal(wells.length, KY.WELLS.length);
  for (const w of KY.WELLS) assert.ok(wells.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), String(w));
  const open = plans.flatMap((p) => p.elements).filter((e) => e.t === 'machiya_m' && e.open).length;
  assert.ok(KY.sites().length > 60 && KY.sites().length < open, `${KY.sites().length} working houses of ${open} open`);
  for (const s of KY.sites()) assert.ok(s.work.length && lots().some((l) => 'lot:' + l.seed === s.id));
  for (const r of Object.values(KY.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
});

test('Kyoto: the map\'s places and tracks', () => {
  const rnd = () => 0.4;
  assert.equal(KY.canalTrack(100, 0, rnd), null, 'no boat on the stream');
  // the engine\'s Suzhou-only walkers are answered with nothing; the city\'s own pedlars find a street
  assert.equal(KY.streetTrack(60, 40, rnd, 90, 40), null); assert.equal(KY.streetTrack(60, 40, rnd, 90, 34), null); assert.equal(KY.streetTrack(60, 40, rnd, 80, 30), null);
  const tr = KY.pedlarTrack(60, 40, rnd, 70, 30);
  assert.ok(tr && tr.pts.length === 2);
  assert.equal(KY.treeSpot(200, 10, rnd, 40), null, 'no Chinese seasonal birds');
  assert.ok(KY.treeSpot(200, 10, () => 0.3, 41) && KY.treeSpot(200, 10, () => 0.3, 36));
  const bt = KY.bridgeTrack(99, 100, rnd);
  assert.ok(bt && bt.pts.every((p) => Math.abs(p[1] - 100) < 1) && Math.abs(bt.pts[0][0] - bt.pts[1][0]) > 12);
  let seed = 0.123; const rr = () => (seed = (seed * 9301 + 0.4937) % 1);
  assert.ok(KY.pondSpot(200, 12, rr) && KY.shoreSpot(200, 12, rr), 'the pond of Ginkaku-ji');
  assert.equal(KY.pondSpot(0, 100, rr), null);
  assert.ok(KY.canalSpot(60, 0).d > 30 && KY.canalSpot(99, 0).d === 0);
  assert.ok(KY.townNear(60, 40) > 0.8 && KY.townNear(200, 0) < 0.2 && KY.treeness(200, -40) > 0.7 && KY.treeness(60, 40) < 0.4);
  assert.ok(KY.frogGround(200, 0) > 0.9 && KY.frogGround(60, 40) < 0.3 && KY.frogGround(99, 40) > 0.4);
  assert.equal(KY.roomAt(60, 40, 0), null, 'the street is the open');
  assert.equal(KY.roomAt(GINKAKU.kannon[0], GINKAKU.kannon[1], 0.9).use, 'hall');
  assert.equal(KY.roomAt(GINKAKU.kannon[0], GINKAKU.kannon[1], 4.5).upper, true);
  assert.equal(KY.roomAt(GINKAKU.togudo[0], GINKAKU.togudo[1], 0.7).use, 'togudo');
  const s0 = KY.sites()[0];
  assert.equal(KY.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  // the bells: two windows a day at each tower, dawn and dusk
  const bells = KY.EMITTERS.filter((e) => /^bonsho/.test(e.voice));
  assert.equal(bells.length, 4);
  assert.ok(bells.every((e) => e.after && e.hours[1] - e.hours[0] < 0.3 && e.gap[0] > 5));
  assert.ok(KY.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.ok(STREAM && SHRINE);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'hammer', 'loom', 'crossing', 'fishRise', 'wellBucket', 'eaveDrip', 'frog', 'cricket', 'cicada', 'kitchen', 'coin', 'plane', 'teaClink', 'lap', 'dogFar', 'seasonBird', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); if (!(r === 1)) calls[v] = (calls[v] || 0) + 1; return r; }; }   // (a voice out of its season, or finding no street, answers exactly 1)
  const L = profileOf('muromachi-kyoto').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'shingle', water: 1, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}
const site = (use) => KY.sites().filter((s) => s.use === use).sort((a, b) => a.at[0] - b.at[0])[0];

test('Kyoto placed: the bells at the hours, the board, the service, in their places', () => {
  const g = { x: 150, z: -45 };
  assert.ok(listen({ ...g, hour: 5.4, secs: 120 }).calls.bonshoGinkaku > 0, 'the dawn bell');
  assert.ok(listen({ ...g, hour: 18.1, secs: 120 }).calls.bonshoGinkaku > 0, 'the dusk bell');
  assert.ok(!listen({ ...g, hour: 12, secs: 120 }).calls.bonshoGinkaku, 'not at noon');
  assert.ok(listen({ x: -200, z: -118, hour: 5.4, secs: 120 }).calls.bonshoRyoan > 0, 'and at Ryōan-ji');
  assert.ok(listen({ ...g, hour: 5.05, secs: 120 }).calls.hanBoard > 0, 'the board before the bell');
  assert.ok(listen({ x: GINKAKU.togudo[0] + 8, z: GINKAKU.togudo[1], hour: 5.9, secs: 200 }).calls.keisuChant > 0, 'the morning service');
  assert.ok(listen({ x: GINKAKU.kannon[0], z: GINKAKU.kannon[1] + 14, hour: 7, secs: 300 }).calls.gravel > 0, 'the gravel raked');
  assert.ok(!listen({ x: GINKAKU.kannon[0], z: GINKAKU.kannon[1] + 14, hour: 7, rain: 0.9, secs: 300 }).calls.gravel, 'not in the rain');
});

test('Kyoto placed: the shrine\'s Noh, the stream, the trades', () => {
  const sh = { x: SHRINE.noh[0] - 6, z: SHRINE.noh[1] + 8 };
  assert.ok(listen({ ...sh, hour: 12, secs: 500 }).calls.noh > 0, 'a passage of Noh at midday');
  assert.ok(!listen({ ...sh, hour: 20, secs: 300 }).calls.noh && !listen({ ...sh, hour: 12, rain: 0.6, secs: 300 }).calls.noh, 'not at night, not in rain');
  assert.ok(!listen({ x: 200, z: 0, hour: 12, secs: 400 }).calls.noh, 'not heard from the pond at Ginkaku-ji');
  const wash = listen({ x: STREAM.x0 - 3, z: 40, hour: 10, secs: 300 }).calls.washCloth;
  assert.ok(wash > 0, 'the women at the steps');
  const sm = site('smith'), cl = site('cloth');
  assert.ok(sm && cl, 'a smith and a weaver\'s house with sounds');
  assert.ok(listen({ x: sm.at[0], z: sm.at[1] + 10, hour: 10, secs: 400 }).calls.hammer > 0, 'the smith by day');
  assert.ok(!listen({ x: sm.at[0], z: sm.at[1] + 10, hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
  assert.ok(listen({ x: cl.at[0], z: cl.at[1] + 10, hour: 10, secs: 400 }).calls.loom > 0, 'the loom');
  const r = listen({ x: 60, z: 40, hour: 9, secs: 600 });
  assert.ok(r.calls.pedlar > 0, 'a pedlar by day in the streets');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat, 'none of Suzhou\'s walkers');
  assert.ok(!listen({ x: 60, z: 40, hour: 2, secs: 400 }).calls.pedlar, 'not at night');
  assert.ok(listen({ x: 90, z: 100, hour: 10, secs: 600 }).calls.crossing > 0, 'walkers on the bridge');
  assert.ok(listen({ x: 200, z: 12, hour: 12, secs: 600 }).calls.fishRise > 0, 'carp rising in the pond');
});

test('Kyoto placed: the seasons and the hours of the creatures', () => {
  const g = { x: 200, z: 20 };
  const birds = (doy, hour) => listen({ ...g, hour, doy, secs: 400 }).calls;
  assert.ok(birds(100, 9).uguisu > 0 && !birds(250, 9).uguisu && !birds(20, 9).uguisu, 'the bush warbler in spring');
  assert.ok(!birds(100, 9).seasonBird, 'no Chinese seasonal birds');
  assert.ok(birds(160, 21).hototogisu > 0 && !birds(100, 21).hototogisu, 'the lesser cuckoo on early-summer nights');
  assert.ok(birds(230, 18.5).higurashi > 0 && !birds(100, 18.5).higurashi, 'the evening cicada in late summer');
  assert.ok(birds(260, 22).suzumushi > 0 && !birds(100, 22).suzumushi, 'the bell cricket in autumn');
  assert.ok(birds(140, 1).frog > 5 && !birds(20, 1).frog, 'frogs in the warm months');
  assert.ok(birds(200, 14).cicada > 0 && !birds(100, 14).cicada, 'summer cicadas');
});

test('Kyoto placed: rooms', () => {
  const sm = site('smith');
  const r = listen({ x: sm.at[0], z: sm.at[1], y: 0.5, hour: 11, indoors: true, secs: 200 });
  assert.equal(r.m.plc.room.use, 'smith');
  const t = listen({ x: KY.EMITTERS.find((e) => e.voice === 'kettleSimmer').at[0], z: KY.EMITTERS.find((e) => e.voice === 'kettleSimmer').at[1], y: 0.3, hour: 11, indoors: true, secs: 200 });
  assert.equal(t.m.plc.room.use, 'hut');
  assert.ok(t.calls.kettleSimmer > 0, 'the kettle in the tea hut');
});
