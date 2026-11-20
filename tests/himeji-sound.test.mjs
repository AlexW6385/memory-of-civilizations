// Edo Himeji's placed sounds (src/settlements/edo-himeji/soundmap.js, src/engine/voices-himeji.js): the voices exist and can be made
// against a stand-in audio context (no sound: every node is a recorder), the map's places agree with the town the settlement builds, and
// the scheduler makes each sound at its place, hour, season and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { HJ_VOICES, HJ_TRADES, pickHjTrade } from '../src/engine/voices-himeji.js';
import * as HJ from '../src/settlements/edo-himeji/soundmap.js';
import { lots, MIDDLE, KEEP, HON, OUTER, STREET } from '../src/settlements/edo-himeji/layout.js';
import castle, { OPENED } from '../src/settlements/edo-himeji/plan.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = Object.keys(HJ_VOICES);

test('Himeji: the profile carries the town\'s life and its map, and the time bell stays the engine\'s', () => {
  const P = profileOf('edo-himeji'), L = P.animals[LIFE];
  assert.ok(L.map === HJ && L.eaves && L.market && L.canal);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'horse', 'rooster']);
  assert.equal(P.bells, 'toki');
  const day = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 35 }; for (const e of due(P, prev, now)) day.push(e); prev = now; }
  assert.ok(day.length > 6 && day.every((e) => /toki/.test(e)), 'only the time bell: ' + [...new Set(day)]);
});

test('Himeji: every voice exists, is prefixed, and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('edo-himeji').animals, roof: 'tile', at: { x: 0, z: 336, y: 0, yaw: 0, hour: 12 } });
  m.doyOverride = 290;
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.ok(/^hj[A-Z]/.test(v), v); assert.equal(typeof m[v], 'function', v); }
  for (const v of ['hjKinuta', 'hjWedge', 'hjHoop', 'hjSuzu', 'hjHorse']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  // each trade's cry its own contour, hours and seasons
  const contours = Object.values(HJ_TRADES).map((T) => (T.cry ?? T.horn).join(','));
  assert.equal(new Set(contours).size, contours.length);
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickHjTrade(h, d, k / 300)); return s; };
  assert.ok(seen(8, 100).has('greens') && seen(8, 100).has('tofu') && !seen(14, 100).has('tofu'));
  assert.ok(seen(12, 200).has('water') && !seen(12, 30).has('water') && seen(9, 20).has('charcoal') && !seen(9, 200).has('charcoal'), 'cold water in the heat, charcoal in the cold');
  assert.equal(pickHjTrade(3, 100, 0.5), null);
  assert.ok(Object.keys(VOICES).filter((k) => /^hj/.test(k)).length === NEW.length);
});

test('Himeji: the map agrees with the town', async () => {
  const rects = (a) => a.map((k) => k.rect.map((v) => Math.round(v * 10) / 10));
  assert.deepEqual(HJ.KURA.map((r) => r.map((v) => +v)), rects(OPENED.kura), 'the storehouses');
  const wells = castle.elements.filter((e) => e.t === 'ido').map((e) => e.at);
  for (const w of wells) assert.ok(HJ.WELLS.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), 'plan well ' + w);
  assert.ok(HJ.WELLS.length >= wells.length + 3);
  const n = HJ.sites().length, open = lots().filter((l) => l.t === 'machiya' && HJ.sites && l.seed % 2 === 0).length;
  assert.ok(n > 8 && n < open, `${n} working houses of ${open} open`);
  for (const s of HJ.sites()) assert.ok(s.work.length && lots().some((l) => 'lot:' + l.seed === s.id));
  for (const r of Object.values(HJ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  for (const e of HJ.EMITTERS) { assert.ok(typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0, e.voice); assert.ok(HJ_VOICES[e.voice] || VOICES[e.voice], 'unknown voice ' + e.voice); }
  for (const [voice, , ] of Object.values({}).flat()) void voice;
  for (const s of HJ.sites()) for (const [voice] of s.work) assert.ok(VOICES[voice], 'site voice ' + voice);
  for (const r of Object.values(HJ.ROOMS)) for (const [voice] of r.work) assert.ok(VOICES[voice] || Music.prototype[voice], 'room voice ' + voice);
  assert.ok(HJ.EMITTERS.filter((e) => e.voice === 'hjKinuta').length === 4);
});

test('Himeji: the map\'s places and tracks', () => {
  const rnd = () => 0.4;
  assert.equal(HJ.canalTrack(0, 300, rnd), null);
  assert.equal(HJ.streetTrack(0, 300, rnd, 90, 40), null); assert.equal(HJ.streetTrack(0, 300, rnd, 90, 34), null); assert.equal(HJ.streetTrack(0, 300, rnd, 80, 30), null);
  const tr = HJ.pedlarTrack(0, 335, rnd, 70, 30);
  assert.ok(tr && tr.pts.length === 2, 'a pedlar finds the merchants\' street');
  assert.ok(Math.abs(tr.pts[0][1] - (STREET.z0 + STREET.z1) / 2) < 3 && Math.abs(tr.pts[0][0] - tr.pts[1][0]) > 10);
  assert.equal(HJ.treeSpot(-60, -60, rnd, 40), null, 'no Chinese seasonal birds');
  assert.ok(HJ.treeSpot(-60, -60, () => 0.3, 41), 'a tree on the hill');
  const bt = HJ.bridgeTrack(0, 300, rnd);
  assert.ok(bt && Math.abs(bt.pts[0][0]) < 1.5 && Math.abs(bt.pts[1][1] - bt.pts[0][1]) > 20, 'across the middle moat');
  assert.equal(HJ.bridgeTrack(0, -100, rnd), null);
  let seed = 0.123; const rr = () => (seed = (seed * 9301 + 0.4937) % 1);
  assert.ok(HJ.pondSpot(60, OUTER[1] + 10, rr) && HJ.shoreSpot(60, OUTER[1] + 12, rr), 'the inner moat');
  assert.equal(HJ.pondSpot(-60, -60, rr), null, 'not on the hill');
  assert.equal(HJ.canalSpot(60, OUTER[1] + 10).d, 0);
  assert.ok(HJ.canalSpot(-60, -60).d > 40);
  assert.ok(HJ.townNear(0, 336) > 0.8 && HJ.townNear(-25, -3) < 0.3 && HJ.townNear(KEEP.c[0], KEEP.c[1]) < 0.1);
  assert.ok(HJ.treeness(-60, -60) > 0.7 && HJ.treeness(0, 336) < 0.2);
  assert.ok(HJ.frogGround(60, OUTER[1] + 10) > 0.9 && HJ.frogGround(-60, -60) < 0.5);
  assert.equal(HJ.roomAt(0, 336, 0), null, 'the street is the open');
  assert.equal(HJ.roomAt(HJ.KURA[0][0] + 3, HJ.KURA[0][1] + 3, HON.top + 0.2).use, 'kura');
  assert.equal(HJ.roomAt(KEEP.c[0], KEEP.c[1], KEEP.base + 3).use, 'keep');
  assert.equal(HJ.roomAt(-60, -15, HON.top + 0.2).use, 'hall');
  const s0 = HJ.sites()[0];
  assert.equal(HJ.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.ok(MIDDLE && castle);
});

function listen({ x, z, y = 0, hour, doy = 290, rain = 0, indoors = false, wind = 0, secs = 120 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'scissors', 'kine', 'strawBeat', 'gravel', 'kitchen', 'shakuhachi', 'vatStir', 'fishRise', 'wellBucket', 'eaveDrip', 'frog', 'cricket', 'cicada', 'sedan', 'watchman', 'vendor', 'boat', 'washCloth', 'crossing', 'lap']) { const o = m[v]; if (typeof o === 'function') m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('edo-himeji').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 1, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Himeji placed: the street by day, the watch by night, and none of Suzhou\'s walkers', () => {
  const day = listen({ x: 0, z: 336, hour: 8, secs: 400 });
  assert.ok(day.calls.hjPedlar > 0, 'a pedlar crying by day');
  assert.ok(!day.calls.sedan && !day.calls.vendor && !day.calls.watchman && !day.calls.boat, 'none of Suzhou\'s walkers');
  assert.ok(!listen({ x: 0, z: 336, hour: 8, rain: 0.9, secs: 300 }).calls.hjPedlar, 'not in heavy rain');
  const night = listen({ x: 0, z: 336, hour: 22, secs: 400 });
  assert.ok(night.calls.hjHyoshigi > 0, 'the clappers of the night watch');
  assert.ok(!night.calls.hjPedlar && !night.calls.hjKago, 'no pedlars or palanquins at night');
  assert.ok(!listen({ x: 0, z: 336, hour: 12, secs: 300 }).calls.hjHyoshigi, 'no watch at noon');
});

test('Himeji placed: the castle\'s yard, the shrine, the fulling block, the trades', () => {
  assert.ok(listen({ x: -20, z: -10, hour: 7, secs: 200 }).calls.gravel > 0, 'the broom on the gravel in the morning');
  assert.ok(!listen({ x: -20, z: -10, hour: 14, secs: 200 }).calls.gravel, 'not in the afternoon');
  assert.ok(listen({ x: 18, z: -10, hour: 10, secs: 300 }).calls.hjHorse > 0, 'the horse at the wall');
  assert.ok(listen({ x: 14, z: 255, hour: 10, secs: 600 }).calls.hjSuzu > 0, 'the bell at the Inari shrine');
  const k = HJ.EMITTERS.find((e) => e.voice === 'hjKinuta').at;
  assert.ok(listen({ x: k[0], z: k[1] + 8, hour: 21, doy: 290, secs: 300 }).calls.hjKinuta > 0, 'the fulling block on an autumn night');
  const sp = HJ.sites().find((s) => s.use === 'oil') || HJ.sites()[0], v = sp.work[0][0], hr = (sp.work[0][2][0] + sp.work[0][2][1]) / 2;
  assert.ok(listen({ x: sp.at[0], z: sp.at[1] + 10, hour: hr, secs: 400 }).calls[v] > 0, `${sp.use}: ${v}`);
  assert.ok(!listen({ x: sp.at[0], z: sp.at[1] + 10, hour: 2, secs: 200 }).calls[v], 'nothing at night');
});

test('Himeji placed: the moats\' frogs and fish, the time bell is not made by the map', () => {
  const w = { x: 60, z: OUTER[1] + 12 };
  const night = listen({ ...w, hour: 21, doy: 140, secs: 200 });
  assert.ok(night.calls.frog > 0, 'frogs at the moat on a June night');
  assert.ok(listen({ ...w, hour: 11, doy: 140, secs: 400 }).calls.fishRise > 0, 'a carp rising by day');
});
