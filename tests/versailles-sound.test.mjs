// Versailles 1690's sounds: the sound map's places against the town's own data, the voices (made against a stand-in audio context: no sound is
// produced, every node is a recorder), and the scheduler listening at places by the hour and the weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { VERSAILLES_VOICES, CRIES, pickCry } from '../src/engine/voices-versailles.js';
import * as VM from '../src/settlements/versailles/soundmap.js';
import { RADIUS, LATONA, APOLLO, RISE, YARD_Y, lots, inRect } from '../src/settlements/versailles/layout.js';
import { SERVICE } from '../src/settlements/versailles/service.js';
import { wellElements } from '../src/settlements/versailles/keepers.js';

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

test('Versailles: the profile carries the map, its own voices all start with ver, none of another settlement\'s', () => {
  const P = profileOf('versailles');
  assert.ok(P.animals[LIFE].map === VM, 'the map rides on the animals');
  assert.equal(P.roof, 'slate');
  for (const k of Object.keys(VERSAILLES_VOICES)) { assert.ok(k.startsWith('ver'), k); assert.equal(typeof VOICES[k], 'function', k); }
});

test('the map: its places are the settlement\'s places', () => {
  const w = wellElements().map((e) => e.at);
  assert.deepEqual(VM.WELLS, w);
  for (const e of VM.EMITTERS) {
    assert.equal(typeof VOICES[e.voice], 'function', e.voice);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.hours.length === 2, e.voice);
    assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS + 20, 'inside the disc: ' + e.voice);
  }
  assert.ok(VM.EMITTERS.some((e) => e.voice === 'verFountain' && e.at === LATONA) && VM.EMITTERS.some((e) => e.voice === 'verFountain' && e.at === APOLLO), 'both great fountains play');
  const tr = new Set(lots().filter((l) => l.trade).map((l) => l.trade));
  for (const t of tr) assert.ok(VM.TRADE_IDS.includes(t) && VM.WORK[t]?.length && VM.ROOMS[t], 'the trade ' + t);
  for (const b of SERVICE) assert.ok(b.use in VM.WORK && VM.ROOMS[b.use], 'the lodging ' + b.use);
  for (const s of VM.sites()) for (const [voice, gap, hours] of s.work) { assert.equal(typeof VOICES[voice], 'function', voice); assert.ok(gap[0] > 0 && hours.length === 2); }
  for (const t of VM.TRACKS) assert.equal(typeof VOICES[t.voice], 'function', t.voice);
  for (const r of Object.values(VM.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0);
  assert.ok(VM.ROOMS.hall.roof < VM.ROOMS.house.roof && VM.ROOMS.chapel.roof < VM.ROOMS.house.roof, 'rain is loud under slate over timber, far under a vault');
});

test('the map: rooms, tracks, planting', () => {
  const sites = VM.sites();
  assert.ok(sites.length >= 20, `${sites.length} places that work`);
  const yard = sites.find((s) => s.id === 'yard:gardener'), lot = sites.find((s) => s.id.startsWith('lot:'));
  assert.equal(VM.roomAt(yard.at[0], yard.at[1], YARD_Y + 1.7).use, 'gardener');
  assert.equal(VM.roomAt(yard.at[0], yard.at[1], YARD_Y + 6).upper, true);
  assert.equal(VM.roomAt(lot.at[0], lot.at[1], RISE + 1.7).use, lot.use);
  assert.equal(VM.roomAt(5, 0, 16).same, 'mirrors', 'the Hall of Mirrors on its floor');
  assert.equal(VM.roomAt(5, 0, 2), null, 'the ground under it is no room');
  assert.equal(VM.roomAt(-60, 0, 1.7), null, 'the parterre is the open');
  const rnd = () => 0.4;
  const t = VM.walkTrack(260, 3, rnd);
  assert.ok(t && t.pts.every((p) => Math.abs(p[1]) < 4), 'a walker on the avenue de Paris');
  assert.equal(VM.walkTrack(-60, 0, rnd), null, 'none on the parterre');
  assert.equal(VM.streetTrack(260, 3, rnd), null, 'the built-in sedans and vendors are Suzhou\'s: none');
  assert.equal(VM.canalTrack(), null);
  const g = VM.gondolaTrack(-380, 40, rnd);
  assert.ok(g && g.pts.every((p) => Math.abs(p[0] - -390) < 4), 'a gondola in the cross-arm');
  assert.equal(VM.gondolaTrack(-60, 0, rnd), null, 'none heard from the parterre');
  assert.ok(VM.canalSpot(-345, 0).d < 6);
  assert.equal(VM.treeSpot(-230, -60, rnd, 36), null, 'no cicadas\' tree');
  assert.ok(VM.treeSpot(-230, -60, rnd, 40), 'a bird\'s tree in the bosquets');
  assert.ok(VM.leafNear(-200, 80) > 0.3 && VM.leafNear(260, 0) < 0.2);
  assert.ok(VM.townNear(250, 0) > 0.8 && VM.townNear(-200, 0) < 0.1 && VM.townNear(60, 0) < 0.5);
  assert.ok(VM.pondSpot() === null && VM.bambooNear() === 0 && VM.frogGround() === 0);
  assert.ok(inRect([-70, -55, -4, 55], VM.HOME[0], VM.HOME[1]), 'home is on the parterre');
});

test('every Versailles voice exists and can be made; the cries are distinct and by the hour', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('versailles').animals, roof: 'slate', at: { x: 260, z: 3, yaw: 0, y: RISE + 1.7, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  const f = m.along([[200, 2], [320, 2]], 4);
  for (const v of Object.keys(VERSAILLES_VOICES)) assert.equal(typeof m[v], 'function', v);
  m.plc.hourNow = 10;
  for (const v of Object.keys(VERSAILLES_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.05, v);
  const cries = Object.values(CRIES).map((c) => c.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(cries).size, cries.length, 'distinct contours');
  const seen = (h) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickCry(h, k / 300)); return s; };
  assert.ok(seen(7).has('milk') && !seen(14).has('milk'), 'the milk early');
  assert.ok(seen(11).has('clothes') && !seen(7).has('clothes'));
  assert.equal(pickCry(21), null, 'no cries at night');
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy;
  const calls = {};
  const names = [...Object.keys(VERSAILLES_VOICES), 'teaTalk', 'scissors', 'wellBucket', 'kitchen', 'boat', 'vendor', 'sedan', 'watchman', 'cicada', 'frog'];
  for (const v of names) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('versailles').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'slate', water: 1, town: 1, birds: 1, rain, indoors: false, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls };
}

test('Versailles placed: the parterre by day, the avenue at noon, the gate, the Hall at night, rain', () => {
  let r = listen({ x: -100, z: 5, y: 1.7, hour: 11, secs: 240 });
  assert.ok(r.calls.verFountain > 0, 'Latona\'s water');
  assert.ok(!r.calls.boat && !r.calls.vendor && !r.calls.sedan && !r.calls.cicada && !r.calls.frog, 'none of Suzhou\'s voices');
  r = listen({ x: -100, z: 5, y: 1.7, hour: 23, secs: 240 });
  assert.ok(!r.calls.verFountain && !r.calls.verRake, 'the fountains are shut at night');
  r = listen({ x: 140, z: 4, y: RISE + 1.7, hour: 12, secs: 600 });
  assert.ok(r.calls.verDrum > 0 || r.calls.verCoach > 0, 'the gate and the Place are busy');
  r = listen({ x: 6, z: 0, y: 16, hour: 20.5, secs: 400 });
  assert.ok(r.calls.verStrings > 0, 'violins in the Hall of Mirrors on an evening of the apartment');
  r = listen({ x: 62, z: -85, y: 1.7, hour: 10.2, secs: 300 });
  assert.ok(r.calls.verMass > 0, 'the King\'s Mass at ten');
  r = listen({ x: -100, z: 5, y: 1.7, hour: 12, rain: 0.9, secs: 200 });
  assert.ok(!r.calls.verRake && !r.calls.verHoe && !r.calls.verCry, 'rain keeps the gardeners in');
  const sm = VM.sites().find((s) => s.use === 'baker');
  if (sm) { r = listen({ x: sm.at[0], z: sm.at[1] + 6, y: RISE + 1.7, hour: 5, secs: 300 }); assert.ok(r.calls.verBake > 0, 'the oven before dawn'); }
});
