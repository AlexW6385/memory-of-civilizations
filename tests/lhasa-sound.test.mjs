// Lhasa's sounds (docs/settlements/lhasa.md §19): the placed map and the Bhaktapur voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { LHS_VOICES } from '../src/settlements/lhasa/voices.js';
import * as LH from '../src/settlements/lhasa/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };



const profile = () => profileOf('lhasa');

test('Lhasa: the profile carries the map; the long horns are placed, not rung from the engine', () => {
  const L = profile().animals[LIFE];
  assert.equal(L.map, LH);
  assert.equal(profile().bells, null);
  assert.ok(LH.TRACKS.every((t) => t.voice.startsWith('lhs')));
  assert.equal(LH.canalSpot(0, 0), null);
});

test('Lhasa: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profile().animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of LHS_VOICES) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...LH.EMITTERS.map((e) => e.voice), ...LH.TRACKS.map((t) => t.voice)]);
  for (const s of LH.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(LH.ROOMS), LH.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Lhasa: emitters are well formed, in their hours', () => {
  for (const e of LH.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 420, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const horns = LH.EMITTERS.filter((e) => e.voice === 'lhsDungchen');
  assert.ok(horns.length === 2 && horns[0].hours[0] >= 5 && horns[0].hours[1] <= 6.5 && horns[1].hours[0] >= 18, 'the horns at dawn and dusk');
  assert.ok(LH.EMITTERS.filter((e) => e.voice === 'lhsMastiff').every((e) => e.hours[0] >= 6 || e.hours[0] >= 19), 'mastiffs by night');
  assert.ok(LH.EMITTERS.filter((e) => e.voice === 'lhsWheelRow').length === 2 && LH.EMITTERS.every((e) => e.voice !== 'lhsWheelRow' || e.at[1] < -200));
  assert.ok(LH.HALLS.east.y === 84 && LH.HALLS.tomb.y === 104.3);
});

test('Lhasa: rooms, tracks, planting', () => {
  for (const s of LH.sites()) { assert.ok(LH.ROOMS[s.use], s.use); }
  for (const s of LH.sites().filter((q) => q.use === 'trade' || q.use === 'tea' || q.use === 'print')) assert.equal(LH.roomAt(s.at[0], s.at[1], 0.3).use, s.use, s.id);
  assert.equal(LH.roomAt(76, -80, 84.3).use, 'hall');
  assert.equal(LH.roomAt(-15, -80, 104.5).use, 'tomb');
  assert.equal(LH.roomAt(-206, 23, 0.3).use, 'lhakhang');
  assert.equal(LH.roomAt(0, 100, 0), null, 'the street is the open');
  for (const r of [...Object.values(LH.ROOMS), LH.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const rnd = () => 0.4;
  const t = LH.TRACKS[0].get(0, 150, rnd);
  assert.ok(t && t.pts.length === 2, 'a caravan on the street');
  assert.ok(LH.TRACKS[1].get(-100, 225, rnd), 'a pilgrim on the circuit');
  assert.ok(LH.treeSpot(0, 45, rnd) && !LH.treeSpot(150, 150, rnd));
  assert.ok(LH.townNear(0, 120) > LH.townNear(0, -250) && LH.frogGround(0, -292) > 0.3 && LH.frogGround(0, 100) === 0);
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0.4;
  const calls = {};
  for (const v of [...LHS_VOICES, 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'wheel', 'loom']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profile().animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Lhasa placed: dawn horns, the street by day, the circuit, night', () => {
  let c = listen({ x: -4, z: 60, hour: 5.6, secs: 600 });
  assert.ok(c.lhsDungchen > 0, `the dawn horns (${c.lhsDungchen})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: 0, z: 150, hour: 11, secs: 300 });
  assert.ok((c.lhsMurmur || 0) + (c.lhsFlags || 0) + (c.lhsChurn || 0) + (c.lhsScale || 0) > 2, 'the street talks, the flags snap');
  c = listen({ x: 0, z: -205, hour: 12, secs: 240 });
  assert.ok(c.lhsWheelRow > 0, 'the wheel row behind the hill');
  c = listen({ x: 0, z: 150, hour: 23.5, secs: 400 });
  assert.ok(!c.lhsMurmur && !c.lhsChurn && !c.lhsPrint && !c.lhsDungchen, 'the market, the churn and the press are quiet at night');
  assert.ok((c.lhsMastiff || 0) + (c.lhsDogs || 0) + (c.lhsFlags || 0) > 0, 'the night has its dogs and its flags');
});
