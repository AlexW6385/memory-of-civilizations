// Madurai's sounds (docs/settlements/madurai.md §18): the placed map and the Madurai voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { MDU_VOICES } from '../src/engine/voices-madurai.js';
import * as MD from '../src/settlements/madurai/soundmap.js';
import { WALL } from '../src/settlements/madurai/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };


test('Madurai: the profile carries the map; nothing of Suzhou is asked of the streets', () => {
  const L = profileOf('madurai').animals[LIFE];
  assert.equal(L.map, MD);
  for (const [r, l] of [[90, 40], [80, 30], [90, 34]]) assert.equal(MD.streetTrack(0, 250, () => 0.5, r, l), null);
  assert.ok(MD.TRACKS.every((t) => t.voice.startsWith('mdu')));
});

test('Madurai: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('madurai').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of Object.keys(MDU_VOICES)) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...MD.EMITTERS.map((e) => e.voice), ...MD.TRACKS.map((t) => t.voice)]);
  for (const R of [...Object.values(MD.ROOMS), MD.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Madurai: emitters are well formed, in their hours', () => {
  for (const e of MD.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 400, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const reed = MD.EMITTERS.filter((e) => e.voice === 'mduNadaswaram');
  assert.ok(reed.length >= 4 && reed.every((e) => e.hours[1] - e.hours[0] < 3), 'the reed at the services only');
  assert.ok(MD.EMITTERS.filter((e) => e.voice === 'mduCowBell').every((e) => e.hours[0] >= 19), 'the cows lie out at night');
  assert.ok(MD.EMITTERS.filter((e) => e.voice === 'mduBathe').every((e) => e.at[1] > 30 && e.at[1] < 40 && e.hours[1] <= 18), 'bathers on the steps by day');
});

test('Madurai: rooms, streets, town', () => {
  for (const r of [...Object.values(MD.ROOMS), MD.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.equal(MD.roomAt(103 - 40, -5, 0), null, 'the court is the open');
  assert.equal(MD.roomAt(100, -80, 0).use, 'hall', 'the Thousand-Pillar Hall');
  const rnd = () => 0.4;
  const t = MD.TRACKS[0].get(-20, 170, rnd);
  assert.ok(t && t.pts.length === 2, 'a cart on the south street');
  assert.equal(MD.TRACKS[0].get(0, 0, rnd), null, 'no cart in the inner court');
  assert.ok(MD.townNear(-20, 150) > MD.townNear(0, 0) && MD.townNear(0, 0) > 0);
  void WALL;
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(MDU_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'hammer']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('madurai').animals, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Madurai placed: the court at dawn, the tank, the street, night', () => {
  let c = listen({ x: 70, z: -20, hour: 5.5, secs: 400 });
  assert.ok(c.mduNadaswaram > 0 || c.mduTavil > 0 || c.mduChant > 0, 'the temple wakes with its reed and drum');
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: -71, z: 38, hour: 9, secs: 300 });
  assert.ok(c.mduBathe > 0, `bathers (${c.mduBathe})`);
  c = listen({ x: -26, z: 134, hour: 9, secs: 300 });
  assert.ok(c.mduFlowers > 0, 'the jasmine sellers call');
  c = listen({ x: -26, z: 134, hour: 23, secs: 300 });
  assert.ok(!c.mduFlowers && !c.mduBathe && !c.mduNadaswaram, 'the street is quiet at night');
});
