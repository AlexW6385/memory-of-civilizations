// Barcelona's sounds (docs/settlements/barcelona.md §14.3): the Angelus on the profile, the sound map's places against the town's own data, the voices (made against a
// stand-in audio context: no sound is produced, every node is a recorder), and the scheduler listening at places. Data, schedule and a few voices only: the town is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { BARCELONA_VOICES, BCN_CRIES, pickCry } from '../src/engine/voices-barcelona.js';
import * as BM from '../src/settlements/barcelona/soundmap.js';
import { RADIUS, SAGRADA, MERCAT, PITCH } from '../src/settlements/barcelona/layout.js';
import { nightPlan, lights } from '../src/settlements/barcelona/nightlight.js';

const day = (P, lat = 41.4) => {
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

test('Barcelona: the Angelus at six, noon and six; the map rides on the profile', () => {
  const P = profileOf('barcelona'), ev = day(P);
  assert.equal(ev.filter(([, e]) => e === 'angelus').length, 3);
  assert.ok(P.animals[LIFE].map === BM, 'the map rides on the animals');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'horse']);
});

test('the map: its places are the town\'s places', () => {
  for (const e of BM.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.hours.length === 2); assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS, 'inside the disc: ' + e.voice); }
  for (const t of BM.TRACKS) assert.equal(typeof VOICES[t.voice], 'function', t.voice);
  // the Schools, the workshop, the yards, the market and the café stand where the plan puts them
  assert.ok(BM.SCHOOLS[0] > SAGRADA[0] - 40 && BM.SCHOOLS[2] < SAGRADA[0] + 5 && Math.abs(BM.SCHOOLS[3] - BM.SCHOOLS[1] - 8.6) < 1e-9);
  assert.ok(BM.HALL[2] - BM.HALL[0] === 60 && Math.abs((BM.HALL[0] + BM.HALL[2]) / 2 - MERCAT[0]) < 1e-9);
  for (const y of BM.YARDS) assert.ok(Math.abs(y[0] - (SAGRADA[0] + 35)) < 25, 'a stone yard inside the hoarding');
});

test('the map: shops that work, rooms, streets', () => {
  const sites = BM.sites();
  assert.ok(sites.filter((s) => BM.ROOMS[s.use] && s.id.startsWith('shop:')).length >= 100, 'the shops');
  for (const s of sites) { assert.ok(s.work.length > 0, s.use); for (const [v, , h] of s.work) { assert.equal(typeof VOICES[v], 'function', v); assert.equal(h.length, 2); } }
  assert.deepEqual(new Set(sites.filter((s) => s.id.startsWith('shop:')).map((s) => s.use)), new Set(['colmado', 'forn', 'bodega', 'ferreteria', 'draperia', 'farmacia', 'sabater', 'perruqueria']));
  const s0 = sites.find((s) => s.use === 'colmado');
  assert.equal(BM.roomAt(s0.at[0], s0.at[1], 3).use, 'colmado');
  assert.equal(BM.roomAt(s0.at[0], s0.at[1], 11).upper, true);
  assert.equal(BM.roomAt(BM.HOME[0], BM.HOME[1], 2.5), null, 'the arrival is the open');
  assert.equal(BM.roomAt((BM.SCHOOLS[0] + BM.SCHOOLS[2]) / 2, (BM.SCHOOLS[1] + BM.SCHOOLS[3]) / 2, 2.5).use, 'school');
  assert.equal(BM.roomAt(MERCAT[0], MERCAT[1], 3).use, 'market');
  for (const r of [...Object.values(BM.ROOMS), BM.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  assert.ok(BM.ROOMS.market.roof > BM.UPPER.roof, 'rain is loud under the market\'s iron and tiles');
  const rnd = () => 0.4;
  const w = BM.streetWay(240, -52, rnd, 80, 36);
  assert.ok(w && w.pts.length === 2);
  for (let k = 0; k < 60; k++) {
    const r = ((i) => () => ((i = (i * 1664525 + 1013904223) >>> 0) / 4294967296))(k + 1), x = (r() - 0.5) * 600, z = (r() - 0.5) * 600, t = BM.streetWay(x, z, r, 80, 36);
    if (t) for (const [px, pz] of t.pts) { const f = (v) => { const m = (((v - PITCH / 2) % PITCH) + PITCH) % PITCH; return Math.min(m, PITCH - m); }; assert.ok(Math.min(f(px), f(pz)) < 5, `a track in a street at ${x | 0}, ${z | 0}`); assert.ok(Math.hypot(px, pz) < RADIUS); }
  }
  const tr = BM.tramWay(240, -52, rnd);
  assert.ok(tr && tr.pts.every(([px]) => Math.abs(px - PITCH * 2.5) < 2), 'a tram on the Marina');
  assert.equal(BM.tramWay(-300, 300, rnd, 60), null, 'none heard from the far corner');
  assert.ok(BM.townNear(-138, 0) === 1 && BM.townNear(MERCAT[0], MERCAT[1]) > 0.8 && BM.greenNear(184, 0) > 0.5 && BM.greenNear(240, -52) === 0 && BM.leafNear(240, -52) > 0.5);
  assert.ok(BM.canalSpot(0, 0) === null && BM.bambooNear(0, 0) === 0 && BM.pondSpot(0, 0) === null);
  const tp = BM.treeSpot(236, 100, rnd); assert.ok(tp && Math.abs(Math.abs(tp[0] - PITCH * 2.5) - 7.65) < 1e-9);
});

test('every Barcelona voice exists and can be made; the cries are distinct and by the hour', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('barcelona').animals, roof: 'tile', at: { x: 240, z: -52, yaw: 0, y: 2, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of Object.keys(BARCELONA_VOICES)) assert.equal(typeof m[v], 'function', v);
  const f = m.along([[0, 0], [30, 0]], 3);
  m.plc.hourNow = 20;
  for (const v of Object.keys(BARCELONA_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.05, v);
  const cries = Object.values(BCN_CRIES).map((c) => c.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(cries).size, cries.length, 'distinct contours');
  const seen = (h) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickCry(h, k / 300)); return s; };
  assert.ok(seen(7).has('lleter') && !seen(14).has('lleter'), 'the milk in the morning');
  assert.ok(seen(18).has('castanyera') && !seen(9).has('castanyera'), 'the chestnuts in the evening');
  assert.equal(pickCry(3), null, 'nobody cries in the small hours');
});

function listen({ x, z, y = 2, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(BARCELONA_VOICES), 'lap', 'eaveDrip', 'boat', 'vendor', 'sedan', 'watchman', 'crossing', 'cicada', 'frog', 'pourWine', 'mortar', 'scissors', 'coin']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('barcelona').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 1, town: 1, birds: 1, rain, indoors, at: { x, z, yaw: 0, y, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls };
}

test('Barcelona placed: the Marina by day, the works, the Schools, the night, rain', () => {
  let r = listen({ x: 240, z: -52, hour: 10, secs: 300 });
  assert.ok(r.calls.bcnTram > 0 || r.calls.bcnCab > 0, 'trams or cabs on the Marina');
  assert.ok(!r.calls.boat && !r.calls.vendor && !r.calls.sedan && !r.calls.frog && !r.calls.crossing && !r.calls.watchman, 'none of Suzhou\'s voices');
  r = listen({ x: 232, z: -100, hour: 10, secs: 300 });
  assert.ok(r.calls.bcnChisel > 0 || r.calls.bcnScaffold > 0, 'the masons at the façade');
  r = listen({ x: 232, z: -100, hour: 3, secs: 300 });
  assert.ok(!r.calls.bcnChisel && !r.calls.bcnScaffold && !r.calls.bcnCab && !r.calls.bcnCry, 'the small hours are quiet');
  r = listen({ x: 240, z: -52, hour: 23.5, secs: 700 });
  assert.ok(r.calls.bcnSereno > 0 || r.calls.bcnClap > 0, 'the sereno or the call for him late');
  r = listen({ x: 240, z: -52, hour: 11, rain: 0.98, secs: 300 });
  assert.ok(!r.calls.bcnCry && !r.calls.bcnGrinder && !r.calls.bcnGoats, 'rain clears the streets of criers');
  const sc = BM.sites().find((s) => s.use === 'school');
  r = listen({ x: sc.at[0] + 11, z: sc.at[1], hour: 10, secs: 300 });
  assert.ok(r.calls.bcnChildren > 0, 'the children of the Schools in the morning');
  r = listen({ x: sc.at[0] + 11, z: sc.at[1], hour: 21, secs: 300 });
  assert.ok(!r.calls.bcnChildren, 'none at night');
  const shop = BM.sites().find((s) => s.use === 'sabater' || s.use === 'ferreteria');
  r = listen({ x: shop.at[0], z: shop.at[1] + 7, hour: 11, secs: 300 });
  assert.ok(Object.keys(r.calls).some((k) => ['bcnTack', 'bcnMetal'].includes(k)), 'a trade at work by its door');
});

test('the night plan is one plan of one material, and the lights are where the town is', () => {
  const p = nightPlan();
  assert.equal(p.elements.length, 1);
  assert.ok(p.nocollide);
  const L = lights();
  assert.ok(L.shops.length > 60 && L.windows.length > 1500 && L.lamps.length >= 10 && L.benches.length >= 20 && L.trams.length >= 5);
  for (const w of L.windows) assert.ok(w.y1 > w.y0 && Math.hypot(w.p[0], w.p[1]) < RADIUS);
});
