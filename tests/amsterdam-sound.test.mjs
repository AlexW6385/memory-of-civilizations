// Amsterdam about 1670's sounds (docs/settlements/amsterdam.md §10.3): the profile and the carillon's hours, the sound map's places against the town's own data, the
// voices (made against a stand-in audio context: no sound is produced, every node is a recorder) and the scheduler listening at places. Data, schedule and a few
// voices only: the town itself is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { AMSTERDAM_VOICES, AM_CRIES, pickCry } from '../src/engine/voices-amsterdam.js';
import * as AM from '../src/settlements/amsterdam/soundmap.js';
import { dice, shopSites } from '../src/settlements/amsterdam/dice.js';
import { profile } from '../src/styles/dutch/upper.js';
import { RADIUS, lots, wet, inRect, HALL } from '../src/settlements/amsterdam/layout.js';

const day = (P, lat = 52.4) => {
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

test('Amsterdam: the carillon strikes the hours, the map rides on the profile', () => {
  const P = profileOf('amsterdam'), ev = day(P, 52.4);
  assert.equal(ev.filter(([, e]) => e.startsWith('carillon:')).length, 24, 'the hours of the carillon');
  assert.ok(P.animals[LIFE].map === AM, 'the map rides on the animals');
  assert.equal(P.roof, 'tile');
});

test('the map: shops that work, rooms, quays and canals', () => {
  const sites = AM.sites();
  assert.ok(sites.length >= 8, `${sites.length} shops and taverns that work`);
  for (const s of sites) { assert.ok(s.work.length > 0, s.use); for (const [v] of s.work) assert.equal(typeof VOICES[v], 'function', v); }
  assert.ok(sites.some((s) => s.use === 'baker' || s.use === 'cheese' || s.use === 'draper' || s.use === 'grocer'));
  const s0 = sites[0];
  assert.equal(AM.roomAt(s0.at[0], s0.at[1], 2.5).use, s0.use);
  assert.equal(AM.roomAt(s0.at[0], s0.at[1], 9).upper, true);
  assert.equal(AM.roomAt(-50, -230, 3).use, 'hall', 'the Town Hall');
  assert.equal(AM.roomAt(AM.HOME[0], AM.HOME[1], 2.5), null, 'the Dam is the open');
  for (const r of Object.values(AM.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0);
  assert.ok(AM.ROOMS.temple.roof < AM.ROOMS.inn.roof, 'rain is loud under tiles, far under the vaults');
  for (const v of Object.values(AM.ROOMS).flatMap((r) => r.work)) assert.ok(typeof VOICES[v[0]] === 'function', v[0]);
  for (const e of AM.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS, e.voice); }
  const rnd = () => 0.4;
  for (let k = 0; k < 80; k++) {
    const r = ((i) => () => ((i = (i * 1664525 + 1013904223) >>> 0) / 4294967296))(k + 1), x = (r() - 0.5) * 600, z = -350 + r() * 300;
    for (const T of AM.TRACKS) { const t = T.get(x, z, r); if (t) for (const [px, pz] of t.pts) assert.ok(Math.hypot(px, pz) < RADIUS - 55 && !inRect(HALL, px, pz), `${T.key} at ${x | 0}, ${z | 0}`); }
    const w = AM.canalWay(x, z, r, 80, 60);
    if (w) for (const [px, pz] of w.pts) assert.ok(wet(px, pz) < -1, 'a boat on the water: ' + wet(px, pz).toFixed(1));
  }
  assert.ok(AM.canalSpot(AM.HOME[0], AM.HOME[1]).d < 40 && AM.canalSpot(0, -295).d < 8);
  assert.ok(AM.townNear(10, -230) === 1 && AM.townNear(-50, -230) < 0.3 && AM.leafNear(0, 0) >= 0.1);
  assert.ok(AM.greenNear(0, 0) === 0 && AM.bambooNear(0, 0) === 0 && AM.pondSpot(0, 0) === null && lots().length > 100);
  void rnd;
});

test('the dice agree with the house builder\'s own profile', () => {
  for (const l of lots().slice(0, 120)) { const d = dice(l), p = profile(l); assert.equal(d.warehouse, p.warehouse); assert.equal(d.use, p.use); assert.equal(d.trade, p.trade); }
  for (const { lot } of shopSites()) assert.ok(!profile(lot).warehouse);
});

test('every Amsterdam voice exists and can be made; the cries are distinct and by the hour', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('amsterdam').animals, roof: 'tile', at: { x: 20, z: -210, yaw: 0, y: 2, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of Object.keys(AMSTERDAM_VOICES)) assert.equal(typeof m[v], 'function', v);
  const f = m.along([[0, 0], [30, 0]], 3);
  m.plc.hourNow = 10;
  for (const v of Object.keys(AMSTERDAM_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.05, v);
  const cries = Object.values(AM_CRIES).map((c) => c.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(cries).size, cries.length, 'distinct contours');
  const seen = (h) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickCry(h, k / 300)); return s; };
  assert.ok(seen(6).has('milk') && seen(6).has('fish') && !seen(15).has('milk'), 'the milk and the fish early');
  assert.equal(pickCry(23.5), null, 'nobody cries late');
});

function listen({ x, z, y = 2, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(AMSTERDAM_VOICES), 'lap', 'eaveDrip']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('amsterdam').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 1, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls };
}

test('Amsterdam placed: the Dam by day, the quays, night, rain', () => {
  let r = listen({ x: AM.WEIGH[0], z: AM.WEIGH[1] + 3, hour: 10, secs: 600 });
  assert.ok(r.calls.amWeigh > 0, 'the Weigh House at work');
  r = listen({ x: 100, z: -140, hour: 9, secs: 900 });
  assert.ok(r.calls.amSledge > 0 || r.calls.amPraam > 0 || r.calls.amCry > 0, 'the quays and canals by day');
  r = listen({ x: 100, z: -140, hour: 3.2, secs: 600 });
  assert.ok(!r.calls.amSledge && !r.calls.amCry && !r.calls.amWeigh, 'the small hours are quiet');
  r = listen({ x: 100, z: -140, hour: 23, secs: 1200 });
  assert.ok(r.calls.amRattle > 0, 'the watch late');
  r = listen({ x: AM.WEIGH[0], z: AM.WEIGH[1] + 3, hour: 11, rain: 0.98, secs: 300 });
  assert.ok(!r.calls.amWeigh && !r.calls.amCry, 'rain clears the Dam');
  const inn = AM.sites().find((s) => s.use === 'inn') || AM.sites().find((s) => s.use === 'craftsman');
  if (inn) { r = listen({ x: inn.at[0], z: inn.at[1] + 2, hour: 21, secs: 400 }); assert.ok(r.calls.amTavern > 0 || r.calls.amHammer > 0 || r.calls.amLute > 0, 'a house at work'); }
  const shop = AM.sites().find((s) => ['baker', 'cheese', 'draper', 'grocer', 'delft', 'tobacco'].includes(s.use));
  r = listen({ x: shop.at[0], z: shop.at[1], hour: 11, secs: 400 });
  assert.ok(Object.keys(r.calls).some((k) => ['amTray', 'amCheese', 'amShears', 'amScale', 'amCrate', 'amPlates', 'amPipe'].includes(k)), 'a trade at work by its door');
});
