// Mughal Agra's sounds (docs/settlements/mughal-agra.md §17.3): the placed map and the Agra voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { AGRA_VOICES } from '../src/engine/voices-agra.js';
import * as AG from '../src/settlements/mughal-agra/soundmap.js';
import { RIVER_Z, GATE } from '../src/settlements/mughal-agra/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('Agra: the profile carries the map; nothing of Suzhou is asked of the streets', () => {
  const L = profileOf('mughal-agra').animals[LIFE];
  assert.equal(L.map, AG);
  for (const [r, l] of [[90, 40], [80, 30], [90, 34]]) assert.equal(AG.streetTrack(0, 250, () => 0.5, r, l), null);
  assert.equal(AG.canalTrack(0, -200, () => 0.5), null);
  assert.ok(AG.TRACKS.every((t) => t.voice.startsWith('agra')));
});

test('Agra: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('mughal-agra').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of Object.keys(AGRA_VOICES)) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...AG.EMITTERS.map((e) => e.voice), ...AG.TRACKS.map((t) => t.voice)]);
  for (const s of AG.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(AG.ROOMS), AG.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Agra: emitters are well formed, in their hours', () => {
  for (const e of AG.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 400, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const night = (v) => AG.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 19 && e.hours[1] <= 5.5);
  assert.ok(night('agraJackal') && night('agraChowkidar'));
  assert.ok(AG.EMITTERS.filter((e) => e.voice === 'agraSurna').every((e) => e.hours[0] >= 5 && e.hours[1] <= 7), 'the surna at dawn');
  assert.ok(AG.EMITTERS.filter((e) => e.voice === 'agraDhobi').every((e) => e.at[1] > RIVER_Z && e.at[1] < RIVER_Z + 15), 'the washermen at the river');
});

test('Agra: rooms, river, streets, planting', () => {
  for (const s of AG.sites()) { assert.ok(AG.ROOMS[s.use], s.use); assert.ok(AG.roomAt(...s.at, 0.3), s.id); }
  assert.equal(AG.roomAt(0, -203, 7.2).use, 'tomb');
  assert.equal(AG.roomAt(0, 0, 0), null, 'the garden is the open');
  assert.equal(AG.roomAt(0, GATE.c[1], 0).use, 'gate');
  assert.equal(AG.roomAt(-154, 0, 0.3).use, 'pavilion');
  for (const r of [...Object.values(AG.ROOMS), AG.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const rnd = () => 0.4;
  assert.ok(AG.canalSpot(0, -240).d < 40);
  assert.ok(AG.TRACKS[0].get(0, RIVER_Z - 10, rnd), 'a boat on the Yamuna');
  assert.equal(AG.TRACKS[0].get(0, 100, rnd), null, 'no river in the garden');
  const t = AG.TRACKS[1].get(0, 260, rnd);
  assert.ok(t && t.pts.every((p) => Math.abs(p[0]) < 8), 'a hawker on the axis street');
  assert.equal(AG.treeSpot(0, 0, rnd), null);
  assert.ok(AG.townNear(0, 250) > AG.townNear(0, -100));
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(AGRA_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('mughal-agra').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Agra placed: the garden, the bazaar, dawn, night', () => {
  let c = listen({ x: 0, z: 10, hour: 10, secs: 240 });
  assert.ok(c.agraFountain > 3, `fountains (${c.agraFountain})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: -154, z: 0, hour: 6.1, secs: 300 });
  assert.ok(c.agraSurna > 0, `the surna at dawn (${c.agraSurna})`);
  c = listen({ x: 0, z: 262, hour: 11, secs: 400 });
  assert.ok(c.agraBargain > 0 || c.agraHawker > 0, 'the bazaar talks');
  c = listen({ x: 0, z: 262, hour: 11, rain: 0.9, secs: 200 });
  assert.ok(!c.agraHawker, 'no cries in heavy rain');
  c = listen({ x: 0, z: GATE.c[1] + 20, hour: 23, secs: 400 });
  assert.ok(!c.agraBargain && !c.agraSurna, 'the bazaar is quiet at night');
});
