// Mamluk Cairo's sounds (docs/settlements/mamluk-cairo.md §18.3): the placed map and the Cairo voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { CAIRO_VOICES } from '../src/engine/voices-cairo.js';
import * as CA from '../src/settlements/mamluk-cairo/soundmap.js';
import { SUQ, SQUARE, HAMMAM, QAA } from '../src/settlements/mamluk-cairo/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('Cairo: the profile carries the map; nothing of Suzhou is asked of the streets', () => {
  const L = profileOf('mamluk-cairo').animals[LIFE];
  assert.equal(L.map, CA);
  assert.equal(CA.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.equal(CA.canalTrack(0, 0, () => 0.5), null);
  assert.ok(CA.TRACKS.every((t) => t.voice.startsWith('cai') || t.voice === 'patrolSteps'));
});

test('Cairo: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('mamluk-cairo').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of Object.keys(CAIRO_VOICES)) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...CA.EMITTERS.map((e) => e.voice), ...CA.TRACKS.map((t) => t.voice)]);
  for (const s of CA.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(CA.ROOMS), CA.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Cairo: emitters are well formed, in their hours; no coffee, no bells', () => {
  for (const e of CA.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 480, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const tabl = CA.EMITTERS.filter((e) => e.voice === 'caiTabl');
  assert.ok(tabl.length === 2 && tabl.every((e) => (e.hours[0] >= 5.5 && e.hours[1] <= 6.5) || (e.hours[0] >= 17.5 && e.hours[1] <= 18.5)), 'the band at dawn and dusk');
  const night = (v) => CA.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 22 || e.hours[1] <= 5);
  assert.ok(night('catCry') && night('dogFar'));
  assert.ok(CA.EMITTERS.filter((e) => e.voice === 'caiKuttab').every((e) => e.hours[1] <= 16), 'school by day');
  assert.ok(!Object.keys(CAIRO_VOICES).some((k) => /coffee|bell/i.test(k)) && !CA.EMITTERS.some((e) => /coffee|bell/i.test(e.voice)), 'no coffee house (coffee came about 1500), no church bells');
});

test('Cairo: rooms, streets, town', () => {
  for (const s of CA.sites()) { assert.ok(CA.ROOMS[s.use], s.use); assert.ok(CA.roomAt(...s.at, 0.3), s.id); }
  assert.equal(CA.roomAt(0, 64, 0).use, 'iwan');
  assert.equal(CA.roomAt(0, 90, 0.06).use, 'tomb');
  assert.equal(CA.roomAt((SUQ[0] + SUQ[2]) / 2, -60, 0).use, 'suq');
  assert.equal(CA.roomAt(0, 40, 0), null, 'the court is the open');
  assert.equal(CA.roomAt(HAMMAM[0] + 5, HAMMAM[1] + 5, 0).use, 'hammam');
  for (const r of [...Object.values(CA.ROOMS), CA.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const rnd = () => 0.4;
  const t = CA.TRACKS[1].get(-37.5, -60, rnd);
  assert.ok(t && t.pts.length === 2, 'a hawker along the covered street');
  assert.ok(CA.townNear(-37.5, -60) > CA.townNear(300, 300));
  assert.equal(CA.treeSpot(0, 0, rnd), null);
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(CAIRO_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'copperBeat', 'recite', 'patrolSteps', 'catCry', 'donkeyBray']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('mamluk-cairo').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Cairo placed: the Qasaba, the Citadel at dawn, night', () => {
  let c = listen({ x: -160, z: -185, hour: 10, secs: 400 });
  assert.ok(c.copperBeat > 0, `the coppersmiths (${c.copperBeat})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: 215, z: -65, hour: 6.0, secs: 300 });
  assert.ok(c.caiTabl > 0, `the sultan's band at dawn (${c.caiTabl})`);
  c = listen({ x: -160, z: -185, hour: 11, rain: 0.9, secs: 200 });
  assert.ok(!c.caiHawk, 'no cries in heavy rain');
  c = listen({ x: -160, z: -185, hour: 1, secs: 400 });
  assert.ok(!c.copperBeat && !c.caiHawk && !c.caiTabl, 'the market is quiet at night');
});
