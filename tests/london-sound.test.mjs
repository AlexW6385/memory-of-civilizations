// Victorian London's sounds (docs/settlements/london.md §10.2): the Great Clock's quarters, the sound map's places against the town's own data, the voices
// (made against a stand-in audio context: no sound is produced, every node is a recorder), and the scheduler listening at places. Data, schedule and a few
// voices only: the town itself is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { LONDON_VOICES, LON_CRIES, pickCry } from '../src/engine/voices-london.js';
import * as LM from '../src/settlements/london/soundmap.js';
import { RADIUS, BRIDGE, RIVER, bank, blocked, lots, inRect } from '../src/settlements/london/layout.js';

const day = (P, lat = 51.5) => {
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

test('London: the Great Clock strikes the quarters and the hours, the map rides on the profile', () => {
  const P = profileOf('london'), ev = day(P);
  assert.equal(ev.length, 96, 'four a hour');
  assert.equal(ev.filter(([, e]) => e.startsWith('hour:')).length, 24);
  assert.ok(P.animals[LIFE].map === LM, 'the map rides on the animals');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'horse']);
  assert.equal(P.roof, 'slate');
});

test('the map: its places are the town\'s places', async () => {
  const { westminster } = await import('../src/settlements/london/plan.js');
  const { houses } = await import('../src/settlements/london/town.js');
  const plans = await houses();
  const els = plans.flatMap((p) => p.elements);
  const near = (list, a, what) => assert.ok(list.some((e) => Math.hypot(e.at[0] - a[0], e.at[1] - a[1]) < 0.7), what);
  near(els.filter((e) => e.t === 'barrel_organ'), LM.ORGAN, 'the organ');
  near(els.filter((e) => e.t === 'punch_booth'), LM.PUNCH, 'the booth');
  for (const f of LM.FOUNTAINS) near(els.filter((e) => e.t === 'drinking_fountain'), f, 'a fountain at ' + f);
  near(els.filter((e) => e.t === 'grindstone_barrow'), LM.GRINDER, 'the knife-grinder');
  assert.ok(els.some((e) => e.t === 'steamboat_pier' && LM.PIER[1] > e.z0 && LM.PIER[1] < e.z1), 'the pier');
  for (const e of LM.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.hours.length === 2); assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS, 'inside the disc: ' + e.voice); }
  for (const t of LM.TRACKS) assert.equal(typeof VOICES[t.voice], 'function', t.voice);
  assert.ok(westminster.rooms.some((r) => r.id === 'abbey nave'));
});

test('the map: shops that work, rooms, streets and the river', () => {
  const sites = LM.sites();
  assert.ok(sites.length >= 20, `${sites.length} shops and pubs that work`);
  for (const s of sites) { assert.ok(s.work.length > 0, s.use); for (const [v] of s.work) assert.equal(typeof VOICES[v], 'function', v); }
  assert.ok(sites.some((s) => s.use === 'pub') && sites.some((s) => s.use === 'butcher' || s.use === 'grocer'));
  const s0 = sites.find((s) => s.use !== 'pub');
  assert.equal(LM.roomAt(s0.at[0], s0.at[1], 2.5).use, s0.use);
  assert.equal(LM.roomAt(s0.at[0], s0.at[1], 9).upper, true);
  assert.equal(LM.roomAt(-140, 41, 3).use, 'temple', 'the Abbey');
  assert.equal(LM.roomAt(LM.HOME[0], LM.HOME[1], 2.5), null, 'the bridge is the open');
  for (const r of Object.values(LM.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0);
  assert.ok(LM.ROOMS.temple.roof < LM.ROOMS.pub.roof, 'rain is loud under slate, far under the Abbey\'s vaults');
  for (const v of Object.values(LM.ROOMS).flatMap((r) => r.work)) assert.ok(typeof VOICES[v[0]] === 'function', v[0]);
  const rnd = () => 0.4;
  const w = LM.streetWay(100, -165, rnd, 80, 40, 1);
  assert.ok(w && Math.abs(w.zc - BRIDGE.z) < 1 && w.pts.every((p) => Math.abs(p[1] - BRIDGE.z) < 4), 'a cab on Bridge Street');
  for (let k = 0; k < 60; k++) {
    const r = ((i) => () => ((i = (i * 1664525 + 1013904223) >>> 0) / 4294967296))(k + 1), x = (r() - 0.5) * 600, z = (r() - 0.5) * 600, t = LM.streetWay(x, z, r, 80, 36, 0.4);
    if (t) for (const [px, pz] of t.pts) assert.ok(Math.abs(pz - t.zc) < 4 && (Math.abs(t.zc - BRIDGE.z) < 1 || !blocked(px, t.zc, -3)), `a track of the streets at ${x | 0}, ${z | 0}`);
  }
  const rt = LM.riverTrack(190, -60, rnd);
  assert.ok(rt && rt.pts.every(([px, pz]) => px > bank(pz)[0] && px < bank(pz)[1]), 'a steamer in the channel');
  assert.equal(LM.riverTrack(-300, 0, rnd, 60), null, 'none heard from the Abbey');
  assert.ok(LM.canalSpot(LM.HOME[0], LM.HOME[1]).d < 12);
  assert.ok(LM.townNear(120, BRIDGE.z) === 1 && LM.townNear(-130, 41) < 0.3 && LM.leafNear(-10, -180) > 0.7 && LM.leafNear(300, 200) < 0.2);
  assert.ok(LM.greenNear(0, 0) === 0 && LM.bambooNear(0, 0) === 0 && LM.pondSpot(0, 0) === null);
  assert.ok(inRect([RIVER.x0, -RADIUS, RIVER.x1, RADIUS], LM.PIER[0], LM.PIER[1], 40) && lots().length > 100);
});

test('every London voice exists and can be made; the cries are distinct and by the hour', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('london').animals, roof: 'slate', at: { x: 100, z: -165, yaw: 0, y: 2, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of Object.keys(LONDON_VOICES)) assert.equal(typeof m[v], 'function', v);
  const f = m.along([[0, 0], [30, 0]], 3);
  m.plc.hourNow = 10;
  for (const v of Object.keys(LONDON_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.05, v);
  const cries = Object.values(LON_CRIES).filter((c) => c.cry).map((c) => c.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(cries).size, cries.length, 'distinct contours');
  const seen = (h) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickCry(h, k / 300)); return s; };
  assert.ok(seen(6).has('milk') && seen(6).has('cress') && !seen(14).has('milk'), 'the milk and the cress at the day\'s start');
  assert.ok(seen(17).has('newsboy') && seen(17).has('muffin') && !seen(9).has('muffin'), 'muffins at tea-time and the papers in the evening');
  assert.equal(pickCry(23.5), null, 'nobody cries late');
  assert.equal(pickCry(3), null);
});

function listen({ x, z, y = 2, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(LONDON_VOICES), 'lap', 'eaveDrip', 'boat', 'vendor', 'sedan', 'watchman', 'crossing', 'cicada', 'frog']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('london').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'slate', water: 1, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls };
}

test('London placed: Bridge Street by day, the river, the square, night, rain', () => {
  let r = listen({ x: 100, z: -166, hour: 10, secs: 600 });
  assert.ok(r.calls.lonCab > 0, 'cabs on Bridge Street');
  assert.ok(!r.calls.boat && !r.calls.vendor && !r.calls.sedan && !r.calls.cicada && !r.calls.frog && !r.calls.crossing, 'none of Suzhou\'s voices');
  r = listen({ x: 180, z: -150, hour: 11, secs: 900 });
  assert.ok(r.calls.lonSteamer > 0 || r.calls.lonLighter > 0, 'craft on the river');
  r = listen({ x: -12, z: -176, hour: 14, secs: 900 });
  assert.ok(r.calls.lonBarrel > 0 || r.calls.lonPunch > 0, 'the organ or Punch in the square');
  r = listen({ x: 100, z: -166, hour: 3, secs: 600 });
  assert.ok(!r.calls.lonCab && !r.calls.lonCry && !r.calls.lonGrind, 'the small hours are quiet');
  r = listen({ x: 100, z: -166, hour: 23, secs: 900 });
  assert.ok(r.calls.lonBeat > 0, 'the beat of a policeman late');
  r = listen({ x: 100, z: -166, hour: 11, rain: 0.98, secs: 300 });
  assert.ok(!r.calls.lonCry && !r.calls.lonBarrel && !r.calls.lonGrind, 'rain clears the streets of criers');
  const pub = LM.sites().find((s) => s.use === 'pub');
  r = listen({ x: pub.at[0], z: pub.at[1] + 7, hour: 21, secs: 400 });
  assert.ok(r.calls.lonPubTalk > 0, 'the pub in the evening');
  const shop = LM.sites().find((s) => s.use === 'butcher' || s.use === 'bootmaker' || s.use === 'grocer');
  r = listen({ x: shop.at[0], z: shop.at[1] + 7, hour: 11, secs: 400 });
  assert.ok(Object.keys(r.calls).some((k) => ['lonCleaver', 'lonHammer', 'lonScale'].includes(k)), 'a trade at work by its door');
});
