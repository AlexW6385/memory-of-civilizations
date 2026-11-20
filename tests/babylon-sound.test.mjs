// Babylon's sounds (docs/settlements/babylon.md §20): the map of src/settlements/babylon/soundmap.js, the voices of src/engine/voices-babylon.js, and a smoke test of the
// synthesis against a stand-in audio context (no sound is made: every node is a recorder). Fast: the map's data, the schedule and a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { BABYLON_VOICES, BAB_CRIES } from '../src/engine/voices-babylon.js';
import * as BB from '../src/settlements/babylon/soundmap.js';
import { lots, ESAGILA, WAY, QUAY, riverX } from '../src/settlements/babylon/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(BABYLON_VOICES), NOTES = ['babLyreNote'];
const REUSED = ['hammer', 'wheel', 'kitchen', 'jarLid', 'pourWine', 'sack', 'clothRustle', 'creak', 'drip', 'pour', 'fishRise', 'dogFar', 'cricket', 'frog', 'cicada'];

test('Babylon has the voices of its streets riding on the animals, no bell, no call to prayer', () => {
  const P = profileOf('babylon'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === BB);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster'], 'the life is not an animal');
  assert.equal(P.bells, null); assert.equal(P.adhan, 0);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 32.5 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0, 'no bell, no watchman, no call to prayer');
});

test('Babylon: every voice is its own, exists and can be made', () => {
  for (const v of NEW) assert.equal(VOICE_OWNER.get(v), 'voices-babylon.js', v);
  assert.ok(NEW.every((v) => v.startsWith('bab')), 'every voice is prefixed');
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('babylon').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of [...NEW, ...REUSED]) assert.equal(typeof m[v], 'function', v);
  const track = { dur: 12, pts: [[0, 0], [0, 10]] };
  for (const v of NEW.filter((k) => !NOTES.includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1, track) > 0.5, v);
  for (const v of NEW) assert.equal(VOICES[v], BABYLON_VOICES[v], v);
  const c = Object.values(BAB_CRIES).map((x) => x.map((n) => n[0] + n[2]).join(','));
  assert.equal(new Set(c).size, c.length, 'every cry has its own contour');
});

test('the map: houses, shops, rooms, planting, water', () => {
  const S = BB.sites(), opened = lots().filter((l) => l.open || l.shop);
  assert.equal(S.length, opened.length, 'every opened lot has a site');
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  assert.ok(S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  const use = (u) => S.filter((s) => s.use === u);
  for (const t of ['smith', 'potter', 'carpenter', 'baker', 'weaver', 'brewer', 'grocer']) assert.ok(use('shop:' + t).length >= 1, t);
  assert.ok(use('house').length > 20 && use('school').length >= 1);
  const has = (s, v) => s.work.some(([x]) => x === v);
  assert.ok(use('shop:smith').every((s) => has(s, 'hammer')) && use('shop:carpenter').every((s) => has(s, 'babAdze')) && use('shop:weaver').every((s) => has(s, 'babLoom')) && use('school').every((s) => has(s, 'babRecite')));
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  // the rooms
  const w = use('shop:smith')[0];
  assert.equal(BB.roomAt(...w.at, 0.4).use, 'shop:smith');
  assert.equal(BB.roomAt(ESAGILA[0] + 13, 217, 0.4).use, 'cella');
  assert.equal(BB.roomAt(WAY.x, -370, 0), null, 'the Way is the open');
  for (const r of [...Object.values(BB.ROOMS), BB.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  for (const s of S) assert.ok(BB.ROOMS[s.use], `a room kind for ${s.use}`);
  // the emitters: voices that exist, hours, gaps, places on the map
  for (const e of BB.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.length === 2 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 420) && e.hours.length === 2, e.voice); }
  assert.equal(BB.EMITTERS.filter((e) => e.voice === 'babShaduf').length, BB.SHADUFS.length);
  assert.deepEqual(BB.WELLS, [], 'no windlass wells');
  // the river, its banks, the quay
  assert.equal(BB.streetTrack(), null); assert.equal(BB.bridgeTrack(), null);
  assert.ok(BB.canalSpot(riverX(0) + 33, 0).d < 6 && BB.canalSpot(0, 0) === null);
  assert.ok(BB.pondSpot(riverX(0) + 20, 0, () => 0.5, 20) && BB.frogGround(riverX(0), 0) > 0.8 && BB.frogGround(100, -250) < 0.1);
  let q = 7; const rnd = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  assert.ok(BB.greenNear(riverX(0) - 60, 0) > 0.8 && BB.greenNear(0, -250) < 0.3 && BB.treeSpot(riverX(0) - 60, 0, rnd) !== null);
  assert.ok(BB.townNear(-200, 30) === 1 && BB.townNear(ESAGILA[0] + 47, 217) < 0.2);
  // the river's boats and the Way's caravans come by TRACKS
  const t = BB.TRACKS.find((x) => x.key === 'quffa').get(riverX(0), 0, () => 0.3);
  assert.ok(t && t.pts.length === 2 && Math.abs(t.pts[0][0] - riverX(0)) < 60 && BB.TRACKS[0].get(200, 0, Math.random) === null);
  const c = BB.TRACKS.find((x) => x.key === 'caravan').get(WAY.x, -340, () => 0.3);
  assert.ok(c && Math.abs(c.pts[0][0] - WAY.x) < 5 && BB.TRACKS[1].get(200, 200, Math.random) === null);
  for (const x of BB.TRACKS) assert.equal(typeof VOICES[x.voice], 'function');
  void QUAY;
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
  for (const v of ['hammer', 'wheel']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('babylon').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs * SCALE / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Babylon placed: the temple at its hours', () => {
  const cella = [ESAGILA[0] + 13, 217];
  assert.ok(listen({ x: cella[0] + 10, z: cella[1], hour: 6.2, secs: 900 }).calls.babChant > 0, 'the chant of the morning rite');
  assert.ok(listen({ x: cella[0] + 10, z: cella[1], hour: 18, secs: 900 }).calls.babChant > 0, 'and in the evening');
  assert.ok(!listen({ x: cella[0] + 10, z: cella[1], hour: 2, secs: 600 }).calls.babChant, 'not at night');
  assert.ok(!listen({ x: cella[0] + 10, z: cella[1], hour: 11, secs: 600 }).calls.babChant, 'not at midday');
  assert.ok(listen({ x: ESAGILA[0] + 47, z: 217, hour: 6.3, secs: 900 }).calls.babLilissu > 0, 'the kettledrum in the court');
});

test('Babylon placed: the trades, the quay, the shadufs, the caravan', () => {
  const smith = BB.sites().find((s) => s.use === 'shop:smith').at;
  assert.ok(listen({ x: smith[0], z: smith[1] + 6, hour: 10, secs: 900 }).calls.hammer > 0, 'the smith at his anvil');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 2, secs: 600 }).calls.hammer, 'not at night');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 10, rain: 1, secs: 600 }).calls.hammer, 'not in a downpour');
  assert.ok(listen({ x: riverX(-60) + 33, z: -60, hour: 9, secs: 900 }).calls.babHaul > 0, 'the porters at the quay');
  const sh = BB.SHADUFS[0];
  assert.ok(listen({ x: sh[0], z: sh[1] + 3, hour: 9, secs: 900 }).calls.babShaduf > 0, 'a shaduf raised by day');
  assert.ok(!listen({ x: sh[0], z: sh[1] + 3, hour: 22, secs: 600 }).calls.babShaduf, 'not at night');
  assert.ok(listen({ x: riverX(0) + 10, z: 0, hour: 11, secs: 1500 }).calls.babQuffa > 0, 'a round boat poled along the river');
  assert.ok(!listen({ x: 100, z: -250, hour: 11, secs: 300 }).calls.babQuffa, 'none far from the river');
  assert.ok(listen({ x: WAY.x, z: -340, hour: 9, secs: 1800 }).calls.babCaravan > 0, 'a caravan on the Way');
});

test('Babylon placed: the night and the school', () => {
  assert.ok(listen({ x: 260, z: -320, hour: 23, secs: 900 }).calls.babJackal > 0, 'a jackal beyond the walls at night');
  assert.ok(!listen({ x: 260, z: -320, hour: 12, secs: 600 }).calls.babJackal, 'not at noon');
  assert.ok(listen({ x: 0, z: 14, hour: 22, secs: 900 }).calls.babOwl > 0, 'the owl at night');
  const school = BB.sites().find((s) => s.use === 'school').at;
  assert.ok(listen({ x: school[0], z: school[1], hour: 10, secs: 1200 }).calls.babRecite > 0, 'the pupils reciting');
  assert.ok(!listen({ x: school[0], z: school[1], hour: 22, secs: 600 }).calls.babRecite, 'not at night');
});

test('Babylon placed: indoors the rooms have their own small sounds', () => {
  const s = BB.sites().find((q) => q.use === 'house');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.3, hour: 11, indoors: true, secs: 300 });
  assert.ok(r.m.plc.room && r.m.plc.room.same === s.id, 'in the house');
  const h = listen({ x: ESAGILA[0] + 13, z: 217, y: 0.3, hour: 11, indoors: true, secs: 20 });
  assert.equal(h.m.plc.room.use, 'cella');
  assert.ok(h.m.plc.layers.room, 'the cella\'s air');
});
