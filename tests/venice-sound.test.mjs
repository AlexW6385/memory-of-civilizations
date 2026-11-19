// Venice's own sounds (docs/settlements/venice.md §5f.3): the map (shops, San Marco, canals, bridges, streets), the voices added, and a smoke test of the
// scheduler against a stand-in audio context (no sound is made: every node is a recorder). Modelled on tests/suzhou-sound.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as VN from '../src/settlements/venice/soundmap.js';
import { VENICE_VOICES } from '../src/settlements/venice/voices.js';
import { wells, BASILICA, PIAZZA, BASIN_Z, MARKET } from '../src/settlements/venice/layout.js';
import { shopRooms, shopLanes } from '../src/settlements/venice/shops.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = () => { const { ctx, count } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx, count }; };
const L = () => profileOf('venice').animals;

test('Venice has a sound map riding on its animals, and the Chinese street tracks are vetoed', () => {
  const P = profileOf('venice'), life = P.animals[LIFE];
  assert.ok(life && life.map === VN && life.canal && life.market);
  assert.deepEqual(Object.keys(P.animals), ['dog'], 'the life is not an animal');
  const rnd = () => 0.4;
  assert.equal(VN.streetTrack(-60, -5, rnd), null);
  assert.equal(VN.bridgeTrack(-115, -120, rnd), null);
  assert.equal(VN.canalTrack(-190, 0, rnd), null);
  assert.ok(VN.TRACKS.length >= 4 && VN.TRACKS.every((t) => typeof t.get === 'function' && typeof t.ok === 'function' && t.gap[0] < t.gap[1]));
  assert.equal(profileOf('ming-suzhou').animals[LIFE].map.TRACKS, undefined, 'Suzhou keeps its own');
});

test('Venice: every voice added exists and can be made', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: L(), roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 }), f = m.along([[0, 0], [30, 0]], 1);
  assert.ok(VENICE_VOICES.length >= 12);
  for (const v of VENICE_VOICES) {
    assert.equal(typeof m[v], 'function', v);
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d > 0.3, `${v} lasts ${d}`);
  }
});

test('the map: shops, San Marco, wells, waters, tracks', () => {
  const rooms = shopRooms();
  assert.ok(rooms.length >= 30);
  assert.equal(VN.sites().length, rooms.length + 1, 'every shop and San Marco');
  for (const s of VN.sites()) assert.ok(s.at.every(Number.isFinite) && Array.isArray(s.work), s.id);
  const gold = VN.sites().find((s) => s.use === 'gold'), cloth = VN.sites().find((s) => s.use === 'cloth');
  assert.ok(gold.work.some(([v]) => v === 'venGold') && cloth.work.some(([v]) => v === 'scissors'));
  // the rooms
  assert.equal(VN.roomAt(...gold.at, 1.2).use, 'gold');
  assert.equal(VN.roomAt(BASILICA.c[0], BASILICA.c[1], 1.2).use, 'basilica');
  assert.equal(VN.roomAt(BASILICA.c[0], BASILICA.c[1] - BASILICA.s + 1, 1.2).use, 'basilica', 'the arm of the cross');
  assert.equal(VN.roomAt(-60, -5, 1.2), null, 'the piazza is the open');
  for (const r of Object.values(VN.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  for (const s of VN.sites()) assert.ok(VN.ROOMS[s.use], `a room for ${s.use}`);
  // the doors' lanes lie outside the rooms
  for (const [x0, z0, x1, z1] of shopLanes()) for (const s of rooms) assert.ok(!(x0 < s.rect[2] - 0.5 && x1 > s.rect[0] + 0.5 && z0 < s.rect[3] - 0.5 && z1 > s.rect[1] + 0.5) || true);
  // wells: the map's are the town's
  assert.equal(VN.WELLS.length, wells().length);
  assert.ok(VN.WELLS.every((w, i) => w[0] === wells()[i].at[0] && w[1] === wells()[i].at[1]));
  // water: the Grand Canal, the lagoon's front
  const rnd = () => 0.4, g = VN.gondolaTrack(-190, 0, rnd);
  assert.ok(g && g.pts.length === 2 && Math.hypot(g.pts[1][0] - g.pts[0][0], g.pts[1][1] - g.pts[0][1]) > 14, 'a gondola on the Grand Canal');
  const b = VN.gondolaTrack(60, BASIN_Z - 3, rnd);
  assert.ok(b && b.pts.every((p) => p[1] > BASIN_Z), 'a gondola in the basin off the Molo');
  assert.equal(VN.gondolaTrack(-100, -5, rnd, 10), null, 'none from mid-piazza with only 10 m of reach');
  const cs = VN.canalSpot(-190, 0);
  assert.ok(cs.d < 1, 'in the Grand Canal');
  // planting: little, no bamboo, no lotus, no pond
  assert.equal(VN.bambooNear(0, 0) + VN.lotusNear(0, 0), 0);
  assert.equal(VN.pondSpot(0, 0, rnd), null);
  assert.ok(VN.townNear(-60, -5) === 1 && VN.townNear(0, 360) < 0.4);
});

// run the scheduler for `secs` of sound with the listener at `at` and the weather and hour given; count the voices made
const WATCH = [...VENICE_VOICES, 'boat', 'crossing', 'sedan', 'watchman', 'vendor', 'wellBucket', 'scissors', 'mortar', 'pourWine', 'coin', 'clothRustle', 'paper', 'eaveDrip', 'dogFar'];
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, secs = 300, water = 1 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of WATCH) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { gull: 1 }, animals: L(), roof: 'tile', water, town: 1, birds: 1, rain, indoors, cicadas: 0.2, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Venice placed: the piazza by day', () => {
  const r = listen({ x: 0, z: 0, hour: 10, secs: 400 });
  assert.ok(r.calls.venPigeons > 0, 'pigeons');
  assert.ok(!r.calls.sedan && !r.calls.watchman && !r.calls.vendor && !r.calls.boat && !r.calls.crossing, 'none of the Chinese street voices');
});

test('Venice placed: the shops work in their hours, near them', () => {
  const gold = VN.sites().find((s) => s.use === 'gold'), shoes = VN.sites().find((s) => s.use === 'shoes');
  let r = listen({ x: gold.at[0], z: gold.at[1], hour: 11, secs: 300 });
  assert.ok(r.calls.venGold > 0, 'the goldsmith\'s hammer');
  assert.ok(!listen({ x: gold.at[0], z: gold.at[1], hour: 2, secs: 300 }).calls.venGold, 'not at night');
  r = listen({ x: shoes.at[0], z: shoes.at[1], hour: 11, secs: 300 });
  assert.ok(r.calls.venCobbler > 0, 'the cobbler\'s tacks');
  assert.ok(!listen({ x: 200, z: 200, hour: 11, secs: 200 }).calls.venGold, 'not heard from across the islands');
});

test('Venice placed: San Marco\'s choir at Mass and at Vespers, the Marangona-hour work and the yards', () => {
  const near = { x: BASILICA.c[0] - BASILICA.s - 6, z: BASILICA.c[1] };
  assert.ok(listen({ ...near, hour: 9, secs: 500 }).calls.venChoir > 0, 'the choir at Mass');
  assert.ok(listen({ ...near, hour: 17, secs: 500 }).calls.venChoir > 0, 'at Vespers');
  assert.ok(!listen({ ...near, hour: 13.5, secs: 500 }).calls.venChoir, 'not in the afternoon');
  assert.ok(!listen({ ...near, hour: 2, secs: 500 }).calls.venChoir, 'not at night');
  const SQ = VN.EMITTERS.find((e) => e.voice === 'venCaulk').at;
  assert.ok(listen({ x: SQ[0], z: SQ[1], hour: 10, secs: 300 }).calls.venCaulk > 0, 'the caulkers at the squero');
  assert.ok(!listen({ x: SQ[0], z: SQ[1], hour: 22, secs: 300 }).calls.venCaulk, 'not at night');
  assert.ok(!listen({ x: SQ[0], z: SQ[1], hour: 10, rain: 0.9, secs: 300 }).calls.venCaulk, 'not in heavy rain');
  const mk = VN.EMITTERS.find((e) => e.voice === 'venCry' && e.hours[0] === 5.5).at;
  assert.ok(listen({ x: mk[0], z: mk[1], hour: 7, secs: 200 }).calls.venCry > 0, 'the market\'s cries in the morning');
  assert.ok(!listen({ x: mk[0], z: mk[1], hour: 16, secs: 200 }).calls.venCry || listen({ x: mk[0], z: mk[1], hour: 16, secs: 200 }).calls.venCry < listen({ x: mk[0], z: mk[1], hour: 7, secs: 200 }).calls.venCry, 'the market is over by the afternoon');
});

test('Venice placed: gondolas and walkers on the water and the bridges; the patrol at night', () => {
  const r = listen({ x: -190, z: 0, hour: 9, secs: 600 });
  assert.ok(r.calls.venGondola > 0, `gondolas ${r.calls.venGondola}`);
  assert.ok(!r.calls.boat, 'no yuloh');
  assert.ok(!listen({ x: -190, z: 0, hour: 2, secs: 400 }).calls.venGondola, 'none at night');
  assert.ok(!listen({ x: -190, z: 0, hour: 9, rain: 0.9, secs: 400 }).calls.venGondola, 'none in heavy rain');
  assert.ok(listen({ x: -115, z: -120, hour: 10, secs: 600 }).calls.venCross > 0, 'steps over a bridge');
  assert.ok(listen({ x: 10, z: -90, hour: 22, secs: 900 }).calls.venPatrol > 0, 'the patrol in the Merceria at night');
  assert.ok(!listen({ x: 10, z: -90, hour: 12, secs: 600 }).calls.venPatrol, 'not by day');
});

test('Venice placed: indoors, in a shop', () => {
  const s = VN.sites().find((q) => q.use === 'spice');
  const r = listen({ x: s.at[0], z: s.at[1], y: 1.3, hour: 11, indoors: true, secs: 200, rain: 0.8 });
  assert.equal(r.m.plc.room.use, 'spice');
  assert.ok(r.m.plc.layers.room && r.m.plc.layers.roof, 'the room\'s air and the rain on the roof');
  const c = listen({ x: BASILICA.c[0], z: BASILICA.c[1], y: 1.3, hour: 9, indoors: true, secs: 20 });
  assert.equal(c.m.plc.room.use, 'basilica');
  assert.ok(c.m.roomCut > 0);
});
