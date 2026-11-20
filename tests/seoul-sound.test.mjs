// Hanyang's placed sounds (src/settlements/joseon-seoul/soundmap.js, src/engine/voices-seoul.js): the voices exist and can be made against a
// stand-in audio context (no sound: every node is a recorder), the map's places agree with the town the settlement builds, and the
// scheduler makes each sound at its place, hour and weather. Says nothing of any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { SEO_VOICES, SEO_TRADES, pickSeoTrade } from '../src/engine/voices-seoul.js';
import * as SEO from '../src/settlements/joseon-seoul/soundmap.js';
import { JONGNO, AVENUE, STREAM, YANGBAN, POND, HYANG, PALACE, lots } from '../src/settlements/joseon-seoul/layout.js';
import { shopsOf, blocksOf, enterable } from '../src/settlements/joseon-seoul/openwalk.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {}) ), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = Object.keys(SEO_VOICES);
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Seoul: the profile carries the town\'s life and its map, and the great bell stays the engine\'s', () => {
  const P = profileOf('joseon-seoul'), L = P.animals[LIFE];
  assert.ok(L.map === SEO && L.eaves && L.market && L.canal);
  assert.equal(P.bells, 'bosingak');
  const day = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 37.6 }; for (const e of due(P, prev, now)) day.push(e); prev = now; }
  assert.equal(day.filter((e) => /bosingak/.test(e)).length, 2, 'the bell of Jongno at 4 and 22 h');
});

test('Seoul: every voice exists, is prefixed, and can be made', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('joseon-seoul').animals, roof: 'tile', at: { x: 0, z: 357, y: 0, yaw: 0, hour: 12 } });
  m.doyOverride = 290;
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.ok(/^seo[A-Z]/.test(v), v); assert.equal(typeof m[v], 'function', v); }
  for (const v of ['seoDadeumi', 'seoPestle']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  const contours = Object.values(SEO_TRADES).map((T) => T.cry.join(','));
  assert.equal(new Set(contours).size, contours.length, 'each trade its own contour');
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickSeoTrade(h, d, k / 300)); return s; };
  assert.ok(seen(7, 100).has('shrimp') && seen(7, 100).has('bean') && !seen(14, 100).has('bean'));
  assert.ok(seen(12, 200).has('water') && !seen(12, 30).has('water') && seen(9, 20).has('firewood') && !seen(9, 200).has('firewood'), 'water in the heat, brushwood in the cold');
  assert.equal(pickSeoTrade(3, 100, 0.5), null);
  assert.equal(Object.keys(VOICES).filter((k) => /^seo/.test(k)).length, NEW.length);
});

test('Seoul: the map agrees with the town', () => {
  const sites = SEO.sites();
  assert.ok(sites.length >= 6, `${sites.length} shops with sounds`);
  const shops = new Set(blocksOf().flatMap((b) => shopsOf(b).map((s) => 'shop:' + Math.round(s.x0))));
  for (const s of sites) { assert.ok(shops.has(s.id), s.id); assert.ok(s.work.length); assert.ok(s.rect[1] >= JONGNO[3] - 0.01 && s.rect[3] > s.rect[1]); }
  for (const w of SEO.WELLS) assert.ok(w[1] > 0 && Math.hypot(w[0], w[1]) < 400);
  assert.ok(SEO.WELLS.some((w) => w[0] === -84 && Math.abs(w[1] - (JONGNO[1] + 1.4)) < 0.01) && SEO.WELLS.some((w) => w[0] === 74), 'the two wells of Jongno');
  for (const r of Object.values(SEO.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  for (const e of SEO.EMITTERS) { assert.ok(typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0, e.voice); assert.ok(SEO_VOICES[e.voice] || VOICES[e.voice], 'unknown voice ' + e.voice); }
  for (const s of sites) for (const [voice] of s.work) assert.ok(VOICES[voice], 'site voice ' + voice);
  for (const r of Object.values(SEO.ROOMS)) for (const [voice] of r.work) assert.ok(VOICES[voice] || Music.prototype[voice], 'room voice ' + voice);
  assert.ok(lots().length > 100 && SEO.EMITTERS.filter((e) => e.voice === 'seoDadeumi').length > 3);
});

test('Seoul: the map\'s places and tracks', () => {
  const rnd = () => 0.4;
  assert.equal(SEO.canalTrack(0, 300, rnd), null);
  assert.equal(SEO.streetTrack(0, 300, rnd, 90, 40), null); assert.equal(SEO.streetTrack(0, 300, rnd, 90, 34), null); assert.equal(SEO.streetTrack(0, 300, rnd, 80, 30), null);
  const tr = SEO.pedlarTrack(60, 357, rnd, 70, 30);
  assert.ok(tr && tr.pts.length === 2, 'a pedlar finds Jongno');
  assert.ok(Math.abs(tr.pts[0][1] - (JONGNO[1] + JONGNO[3]) / 2) < 2 && Math.abs(tr.pts[0][0] - tr.pts[1][0]) > 10);
  assert.ok(SEO.treeSpot(-20, -250, () => 0.3, 40), 'a tree north of the palace: the engine\'s own seasonal birds are heard');
  const bt = SEO.bridgeTrack(0, 132, rnd);
  assert.ok(bt && Math.abs(bt.pts[0][0]) < 1.5 && Math.abs(bt.pts[1][1] - bt.pts[0][1]) > 8, 'across the Geumcheon on the axis');
  assert.equal(SEO.bridgeTrack(0, -200, rnd), null);
  let seed = 0.123; const rr = () => (seed = (seed * 9301 + 0.4937) % 1);
  const hy = [(HYANG[0] + HYANG[2]) / 2 - 20, (HYANG[1] + HYANG[3]) / 2 + 10];
  assert.ok(SEO.pondSpot(hy[0], hy[1], rr) && SEO.shoreSpot(hy[0], hy[1], rr), 'Hyangwonji');
  assert.equal(SEO.pondSpot(120, 200, rr), null, 'not in the town');
  assert.equal(SEO.canalSpot(0, (STREAM.z0 + STREAM.z1) / 2).d, 0);
  assert.ok(SEO.canalSpot(POND[0] + 4, POND[1] + 4).d < 1);
  assert.ok(SEO.townNear(0, 357) > 0.8 && SEO.townNear(0, 60) < 0.3);
  assert.ok(SEO.treeness(0, -250) > 0.6 && SEO.treeness(120, 357) < 0.2);
  assert.ok(SEO.lotusNear(hy[0], hy[1]) > 0.5 && SEO.lotusNear(0, 357) === 0);
  assert.ok(SEO.frogGround(hy[0], hy[1]) > 0.9 && SEO.frogGround(0, 20) < 0.7);
  assert.equal(SEO.roomAt(0, 357, 0), null, 'Jongno is the open');
  assert.equal(SEO.roomAt(0, 23, 3.5).use, 'hall', 'the throne hall');
  assert.equal(SEO.roomAt((YANGBAN[0] + YANGBAN[2]) / 2, (YANGBAN[1] + YANGBAN[3]) / 2, 0.3).use, 'house');
  const s0 = SEO.sites()[0];
  assert.equal(SEO.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  const hl = lots().find(enterable);
  assert.equal(SEO.roomAt((hl.rect[0] + hl.rect[2]) / 2, (hl.rect[1] + hl.rect[3]) / 2, 0.2).same, 'lot:' + hl.seed);
  assert.ok(AVENUE && PALACE);
});

function listen({ x, z, y = 0, hour, doy = 290, rain = 0, indoors = false, wind = 0, secs = 120 }) {
  const { ctx } = fake(), m = music(ctx);
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'clothRustle', 'abacus', 'paper', 'bowlClack', 'wellBucket', 'fishRise', 'eaveDrip', 'frog', 'cricket', 'cicada', 'sedan', 'watchman', 'vendor', 'boat', 'crossing', 'lap', 'seasonBird']) { const o = m[v]; if (typeof o === 'function') m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('joseon-seoul').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 1, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Seoul placed: Jongno by day, the watch by night, and none of Suzhou\'s walkers', () => {
  const day = listen({ x: 0, z: 357, hour: 8, secs: 400 });
  assert.ok(day.calls.seoPedlar > 0, 'a pedlar crying by day');
  assert.ok(!day.calls.sedan && !day.calls.vendor && !day.calls.watchman && !day.calls.boat, 'none of Suzhou\'s walkers');
  assert.ok(!listen({ x: 0, z: 357, hour: 8, rain: 0.9, secs: 300 }).calls.seoPedlar, 'not in heavy rain');
  const night = listen({ x: 0, z: 357, hour: 23.5, secs: 500 });
  assert.ok(night.calls.seoGyeongjeom > 0, 'the night watch');
  assert.ok(!night.calls.seoPedlar && !night.calls.seoGawi, 'no pedlars or taffy sellers at night');
  assert.ok(!listen({ x: 0, z: 357, hour: 12, secs: 300 }).calls.seoGyeongjeom, 'no watch at noon');
});

test('Seoul placed: the beating of cloth in the evening, the shops\' goods', () => {
  const y = SEO.EMITTERS.find((e) => e.voice === 'seoDadeumi').at;
  assert.ok(listen({ x: y[0], z: y[1] + 6, hour: 21, secs: 400 }).calls.seoDadeumi > 0, 'the cloth beaten at night');
  assert.ok(!listen({ x: y[0], z: y[1] + 6, hour: 11, secs: 300 }).calls.seoDadeumi, 'not at noon');
  const sp = SEO.sites()[0], [v, , hrs] = sp.work[0], hr = (hrs[0] + hrs[1]) / 2;
  assert.ok(listen({ x: sp.at[0], z: sp.at[1] - 3, hour: hr, secs: 500 }).calls[v] > 0, `${sp.use}: ${v}`);
  assert.ok(!listen({ x: sp.at[0], z: sp.at[1] - 3, hour: 2, secs: 200 }).calls[v], 'nothing at night');
});

test('Seoul placed: the ponds\' frogs and fish', () => {
  const w = { x: (HYANG[0] + HYANG[2]) / 2 - 20, z: (HYANG[1] + HYANG[3]) / 2 + 10 };
  assert.ok(listen({ ...w, hour: 21, doy: 140, secs: 200 }).calls.frog > 0, 'frogs at the pond on a June night');
  assert.ok(listen({ ...w, hour: 11, doy: 140, secs: 400 }).calls.fishRise > 0, 'a carp rising by day');
});
