// Northern Song Bianjing's placed sounds (src/settlements/song-kaifeng/soundmap.js, src/engine/voices-kaifeng.js): the voices exist and can be made against
// a stand-in audio context (no sound: every node is a recorder), the map's places agree with the town, and the scheduler makes each sound at its place, hour
// and weather. Data, schedule and a few voices only: the town is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { KF_VOICES } from '../src/engine/voices-kaifeng.js';
import * as KF from '../src/settlements/song-kaifeng/soundmap.js';
import { lots, RIVER, BRIDGE, PAGODA, MONASTERY } from '../src/settlements/song-kaifeng/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = Object.keys(KF_VOICES);
const TRACK = new Set(['kfIronPlate', 'kfPackTrain', 'kfCart', 'kfNightCall']);

test('Kaifeng: the profile carries the city\'s map; the engine\'s bell schedule is off (the bells are emitters)', () => {
  const P = profileOf('song-kaifeng'), L = P.animals[LIFE];
  assert.ok(L.map === KF && L.market && L.eaves && L.canal);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster']);
  let n = 0;
  for (let m = 0, prev = null; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 35 }; n += due(P, prev, now).length; prev = now; }
  assert.equal(n, 0);
});

test('Kaifeng: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('song-kaifeng').animals, roof: 'tile', at: { x: 100, z: 60, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.wind = 0.6;
  const f = m.along([[0, 0], [40, 0]], 1.1);
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1, TRACK.has(v) ? f : undefined) > 0, v); }
  assert.ok(m.kfTempleBell(ctx.currentTime, bus, 1) > 50, 'nine slow strokes');
  m.wind = 0; const calm = m.kfWindBell(ctx.currentTime, bus, 1); m.wind = 1; const gale = m.kfWindBell(ctx.currentTime, bus, 1);
  assert.ok(calm > 0 && gale > calm * 0.5);
});

test('Kaifeng: the map agrees with the town', () => {
  const L = lots();
  assert.ok(KF.sites().length > 50 && KF.sites().length < 600, `${KF.sites().length} working houses`);
  for (const s of KF.sites()) assert.ok(s.work.length && L.some((l) => 'lot:' + l.seed === s.id));
  assert.ok(KF.WELLS.length > 5);
  for (const w of KF.WELLS) assert.ok(L.some((l) => l.well && l.well[0] === w[0] && l.well[1] === w[1]));
  for (const r of Object.values(KF.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  for (const s of KF.sites()) assert.ok(KF.ROOMS[s.use], s.use);
  assert.ok(KF.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(KF.EMITTERS.filter((e) => e.voice === 'kfStory').length, 2, 'the two tea houses');
  assert.equal(KF.EMITTERS.filter((e) => e.voice === 'kfClapSong').length, 5, 'the five wine shops');
  for (const e of KF.EMITTERS) if (e.inside) assert.ok(/^(lot|temple):/.test(e.inside));
});

test('Kaifeng: places and tracks', () => {
  const rnd = () => 0.4;
  const bt = KF.bridgeTrack(0, 70, rnd);
  assert.ok(bt && Math.abs(bt.pts[0][1] - bt.pts[1][1]) > 20 && KF.bridgeTrack(300, 0, rnd) === null);
  const ct = KF.canalTrack(40, 100, rnd);
  assert.ok(ct && ct.pts[0][1] > RIVER.z0 && ct.pts[0][1] < RIVER.z1 && Math.abs(ct.pts[0][0] - ct.pts[1][0]) > 14, 'a boat on the river');
  assert.equal(KF.canalTrack(0, -200, rnd), null);
  const st = KF.streetTrack(0, -20, rnd);
  assert.ok(st && st.pts.length === 2);
  assert.ok(KF.canalSpot(0, 40).d > 15 && KF.canalSpot(0, 70).d === 0);
  let seed = 0.123; const rr = () => (seed = (seed * 9301 + 0.4937) % 1);
  assert.ok(KF.pondSpot(40, 100, rr), 'fish in the river'); assert.equal(KF.pondSpot(0, -200, rr), null);
  assert.ok(KF.shoreSpot(200, 68, rr));
  assert.ok(KF.townNear(0, 40) > 0.8 && KF.townNear(PAGODA[0], PAGODA[1] + 20) < 0.5 && KF.townNear(400, 300) < 0.3);
  assert.ok(KF.treeness(PAGODA[0] + 20, -150) > 0.5 && KF.treeSpot(PAGODA[0], -150, () => 0.3));
  assert.ok(KF.frogGround(300, 64) > 0.4 && KF.frogGround(0, -20) < 0.3);
  assert.equal(KF.roomAt(0, -20, 0), null, 'the street is the open');
  assert.equal(KF.roomAt(KF.TEMPLE.hall[0], KF.TEMPLE.hall[1], 0.9).use, 'temple');
  const s0 = KF.sites()[0];
  assert.equal(KF.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(KF.TRACKS.length, 4);
  assert.ok(KF.TRACKS[0].ok(5, 0) && !KF.TRACKS[0].ok(12, 0) && KF.TRACKS[3].ok(21, 0) && !KF.TRACKS[3].ok(12, 0));
  assert.ok(MONASTERY && BRIDGE);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'abacus', 'crossing', 'fishRise', 'wellBucket', 'frog', 'cricket', 'cicada', 'teaClink', 'sedan', 'watchman', 'boat', 'vendor', 'xiao']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); if (!(r === 1)) calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('song-kaifeng').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 1, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Kaifeng placed: the bell, the drum, the service, the wind bells, in their hours', () => {
  const g = { x: KF.TEMPLE.bell[0] + 6, z: KF.TEMPLE.bell[1] + 10 };
  assert.ok(listen({ ...g, hour: 4.8, secs: 60 }).calls.kfTempleBell > 0, 'the dawn bell');
  assert.ok(!listen({ ...g, hour: 12, secs: 60 }).calls.kfTempleBell, 'not at noon');
  assert.ok(listen({ x: KF.TEMPLE.drum[0], z: KF.TEMPLE.drum[1] + 8, hour: 18, secs: 60 }).calls.kfTempleDrum > 0, 'the dusk drum');
  assert.ok(listen({ ...g, hour: 18.3, secs: 60 }).calls.kfTempleBell > 0, 'and then the dusk bell');
  assert.ok(listen({ x: KF.TEMPLE.hall[0], z: KF.TEMPLE.hall[1] + 3, y: 1, hour: 5.4, indoors: true, secs: 120 }).calls.kfService > 0, 'the morning service');
  assert.ok(listen({ x: PAGODA[0] + 8, z: PAGODA[1] + 12, hour: 12, wind: 0.5, secs: 60 }).calls.kfWindBell > 0, 'the pagoda\'s wind bells');
});

test('Kaifeng placed: the dawn caller, the river, the streets', () => {
  assert.ok(listen({ x: 0, z: -20, hour: 5, secs: 200 }).calls.kfIronPlate > 0, 'the attendants at the fifth watch');
  assert.ok(!listen({ x: 0, z: -20, hour: 12, secs: 200 }).calls.kfIronPlate, 'not at noon');
  const r = listen({ x: 0, z: 40, hour: 10, secs: 500 });
  assert.ok(r.calls.crossing > 0 && r.calls.boat > 0, 'walkers on the bridge, boats on the river');
  assert.ok(listen({ x: 0, z: -20, hour: 21, secs: 400 }).calls.kfNightCall > 0, 'the night market\'s calls');
  assert.ok(listen({ x: 112, z: 50, hour: 10, secs: 600 }).calls.kfHaul > 0, 'the trackers');
  assert.ok(listen({ x: 60, z: 85, hour: 10, secs: 600 }).calls.kfLanding > 0, 'the landing');
  assert.ok(!listen({ x: 112, z: 50, hour: 3, secs: 300 }).calls.kfHaul, 'nothing at night');
});

test('Kaifeng placed: rooms', () => {
  const tea = KF.EMITTERS.find((e) => e.voice === 'kfStory');
  const t = listen({ x: tea.at[0], z: tea.at[1], y: 0.5, hour: 11, indoors: true, secs: 200 });
  assert.equal(t.m.plc.room.use, 'tea');
  assert.ok(t.calls.kfStory > 0, 'the story-teller in the tea house');
});
