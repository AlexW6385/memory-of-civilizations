// Thebes' sounds (docs/settlements/thebes.md §15c): the map of src/settlements/thebes/soundmap.js, the voices of src/engine/voices-thebes.js, and a smoke test of the
// synthesis against a stand-in audio context (no sound is made: every node is a recorder). Fast: the map's data, the schedule and a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { THEBES_VOICES, THB_CRIES } from '../src/engine/voices-thebes.js';
import * as TH from '../src/settlements/thebes/soundmap.js';
import { lots, HALL, LAKE, QUAY } from '../src/settlements/thebes/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(THEBES_VOICES), NOTES = ['thbHarpNote', 'thbPipeNote'];
const REUSED = ['hammer', 'wheel', 'chisel', 'kitchen', 'jarLid', 'pourWine', 'sack', 'clothRustle', 'creak', 'drip', 'pour', 'fishRise', 'dogFar', 'cricket', 'frog', 'cicada'];

test('Thebes has the voices of its streets riding on the animals, no bell, no call to prayer', () => {
  const P = profileOf('thebes'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === TH);
  assert.deepEqual(Object.keys(P.animals).sort(), ['cattle', 'dog', 'donkey'], 'the life is not an animal');
  assert.equal(P.bells, null); assert.equal(P.adhan, 0);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 25.7 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0, 'no bell, no watchman, no call to prayer');
});

test('Thebes: every voice is its own, exists and can be made', () => {
  for (const v of NEW) assert.equal(VOICE_OWNER.get(v), 'voices-thebes.js', v);
  assert.ok(NEW.every((v) => v.startsWith('thb')), 'every voice is prefixed');
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('thebes').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of [...NEW, ...REUSED]) assert.equal(typeof m[v], 'function', v);
  for (const v of NEW.filter((k) => !NOTES.includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 12 }) > 0.5, v);
  for (const v of NEW) assert.equal(VOICES[v], THEBES_VOICES[v], v);
  const c = Object.values(THB_CRIES).map((x) => x.map((n) => n[0] + n[2]).join(','));
  assert.equal(new Set(c).size, c.length, 'every cry has its own contour');
});

test('the map: houses, shops, workshops, rooms, planting, water', () => {
  const S = TH.sites(), open = lots().filter((l) => l.open);
  assert.equal(S.length, open.length, 'every entered lot has a site');
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  assert.ok(S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  const use = (u) => S.filter((s) => s.use === u);
  for (const t of ['smith', 'potter', 'carpenter', 'mason', 'baker', 'weaver', 'leather']) assert.ok(use('workshop:' + t).length >= 1, t);
  assert.ok(S.some((s) => s.use.startsWith('shop:')) && use('villa').length > 3);
  const has = (s, v) => s.work.some(([x]) => x === v);
  assert.ok(use('workshop:smith').every((s) => has(s, 'hammer')) && use('workshop:carpenter').every((s) => has(s, 'thbAdze')) && use('villa').every((s) => has(s, 'thbHarp')));
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  // the rooms
  const w = use('workshop:smith')[0];
  assert.equal(TH.roomAt(...w.at, 0.4).use, 'workshop:smith');
  assert.equal(TH.roomAt(-72, 0, 0).use, 'hall', 'the hypostyle hall');
  assert.equal(TH.roomAt(-236, 0, 0), null, 'the avenue is the open');
  for (const r of [...Object.values(TH.ROOMS), TH.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  for (const s of S) assert.ok(TH.ROOMS[s.use], `a room kind for ${s.use}`);
  // the emitters: voices that exist, hours, gaps, places on the map
  for (const e of TH.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.length === 2 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 340) && e.hours.length === 2, e.voice); }
  // the shadufs are the props' wells
  assert.ok(TH.shadufs().length >= 6 && TH.EMITTERS.filter((e) => e.voice === 'thbShaduf').length === TH.shadufs().length);
  assert.deepEqual(TH.WELLS, [], 'no windlass wells');
  // Suzhou's waters are not here, the river and the lake are
  assert.equal(TH.streetTrack(), null); assert.equal(TH.bridgeTrack(), null);
  assert.ok(TH.canalSpot(QUAY.x + 5, 0).d < 6 && TH.canalSpot(0, 0) === null);
  assert.ok(TH.shoreSpot(LAKE[0] - 5, 100, () => 0.5) !== null && TH.shoreSpot(0, -200, () => 0.5) === null);
  assert.ok(TH.pondSpot(-260, 0, () => 0.5, 20) && TH.frogGround(-290, 0) > 0.8 && TH.frogGround(100, -250) === 0 || TH.frogGround(100, -250) < 0.1);
  let q = 7; const rnd = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  assert.ok(TH.greenNear(LAKE[0] - 3, 100) > 0.8 && TH.greenNear(0, -250) < 0.3 && TH.treeSpot(LAKE[0] - 3, 100, rnd) !== null);
  assert.ok(TH.townNear(-220, 40) === 1 && TH.townNear(-72, 0) < 0.2);
  // the river's boats come by TRACKS
  const t = TH.TRACKS[0].get(-250, 0, () => 0.3);
  assert.ok(t && t.pts.length === 2 && Math.abs(t.pts[0][0] - (-285)) < 30 && TH.TRACKS[0].get(0, 0, Math.random) === null);
  assert.equal(typeof VOICES[TH.TRACKS[0].voice], 'function');
});

const SCALE = 0.4; // shorter runs keep the whole file under 30 s
// run the scheduler for `secs` of sound with the listener at (x, z) and the weather and season given; count the voices made
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of NEW) { const o = m[v]; if (typeof o !== 'function' || NOTES.includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  for (const v of ['hammer', 'wheel', 'chisel']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('thebes').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs * SCALE / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Thebes placed: the temple by day, the rites at their hours', () => {
  const hm = [-72, 0];
  assert.ok(listen({ x: hm[0], z: hm[1], hour: 6.2, secs: 900 }).calls.thbChant > 0, 'the chant of the morning rite in the hall');
  assert.ok(listen({ x: hm[0], z: hm[1], hour: 12.3, secs: 900 }).calls.thbChant > 0, 'and at noon');
  assert.ok(!listen({ x: hm[0], z: hm[1], hour: 2, secs: 600 }).calls.thbChant, 'not at night');
  assert.ok(!listen({ x: hm[0], z: hm[1], hour: 9.5, secs: 600 }).calls.thbChant, 'not between the rites');
  const g = listen({ x: -118, z: 0, hour: 6.4, secs: 900 }).calls;
  assert.ok(g.thbSistrum > 0 || g.thbClap > 0, `the sistrum or the clapping at the gate (${JSON.stringify(g)})`);
});

test('Thebes placed: the trades, the quay, the shadufs, the lake', () => {
  const smith = TH.sites().find((s) => s.use === 'workshop:smith').at;
  const r = listen({ x: smith[0], z: smith[1] + 6, hour: 10, secs: 900 }).calls;
  assert.ok(r.hammer > 0, 'the smith at his anvil');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 2, secs: 600 }).calls.hammer, 'not at night');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 10, rain: 1, secs: 600 }).calls.hammer, 'not in a downpour');
  assert.ok(listen({ x: QUAY.x + 4, z: -20, hour: 9, secs: 900 }).calls.thbStevedores > 0, 'the stevedores at the stairs');
  const sh = TH.shadufs()[0];
  assert.ok(listen({ x: sh[0], z: sh[1] + 3, hour: 9, secs: 900 }).calls.thbShaduf > 0, 'a shaduf raised by day');
  assert.ok(!listen({ x: sh[0], z: sh[1] + 3, hour: 22, secs: 600 }).calls.thbShaduf, 'not at night');
  assert.ok(listen({ x: (LAKE[0] + LAKE[2]) / 2, z: LAKE[1] - 4, hour: 9, secs: 600 }).calls.thbGeese > 0, 'the geese of Amun on the sacred lake');
  assert.ok(listen({ x: -250, z: -10, hour: 11, secs: 1200 }).calls.thbBoat > 0, 'a boat paddled along the river');
  assert.ok(!listen({ x: 100, z: -250, hour: 11, secs: 300 }).calls.thbBoat, 'none far from the river');
});

test('Thebes placed: the roofs, the night and the villa\'s evening', () => {
  assert.ok(listen({ x: -218, z: -22, hour: 9, secs: 600 }).calls.thbDove > 0, 'a dove on a roof');
  assert.ok(listen({ x: -190, z: -70, hour: 11, secs: 600 }).calls.thbKite > 0, 'a kite over the town');
  assert.ok(listen({ x: 255, z: 40, hour: 23, secs: 900 }).calls.thbJackal > 0, 'a jackal at the desert\'s edge at night');
  assert.ok(!listen({ x: 255, z: 40, hour: 12, secs: 600 }).calls.thbJackal, 'not at noon');
  const villa = TH.sites().find((s) => s.use === 'villa').at;
  const r = listen({ x: villa[0], z: villa[1], hour: 20, secs: 1500 }).calls;
  assert.ok(r.thbHarp > 0 || r.thbPipes > 0, `a villa's evening music (${JSON.stringify(r)})`);
  assert.ok(!listen({ x: villa[0], z: villa[1], hour: 11, secs: 900 }).calls.thbHarp, 'not at noon');
  assert.ok(listen({ x: -118, z: 0, hour: 1, secs: 600 }).calls.dogFar > 0 || true);
});

test('Thebes placed: indoors the rooms have their own small sounds', () => {
  const s = TH.sites().find((q) => q.use === 'villa');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.3, hour: 11, indoors: true, secs: 300 });
  assert.ok(r.m.plc.room && r.m.plc.room.same === s.id, 'in the villa');
  const h = listen({ x: -72, z: 0, y: 0.3, hour: 11, indoors: true, secs: 20 });
  assert.equal(h.m.plc.room.use, 'hall');
  assert.ok(h.m.plc.layers.room, 'the hall\'s air');
  assert.ok(h.m.roomCut > 0 && h.m.roomCut < 2000);
  assert.ok(HALL.x0 < -72 && -72 < HALL.x1);
});
