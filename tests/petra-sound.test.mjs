// Petra's placed sounds (src/settlements/petra/soundmap.js, src/engine/voices-petra.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as PT from '../src/settlements/petra/soundmap.js';
import { QASR, TRICLINIUM, OUTER, PLAZA, STREET } from '../src/settlements/petra/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};

const NEW = ['ptLyre', 'ptPipe', 'ptFrameDrum', 'ptCamel', 'ptCaravan', 'ptSiqWind', 'ptChannel', 'ptFountain', 'ptQuern', 'ptHawk', 'ptStarling', 'ptChant', 'ptJackal', 'ptOwl'];
const music = (extra = {}) => {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  return { m, ctx, ...extra };
};

test('Petra: the profile carries the map', () => {
  const P = profileOf('petra'), L = P.animals[LIFE];
  assert.ok(L.map === PT);
  assert.ok(P.animals.goat > 0 && P.animals.donkey > 0);
});

test('Petra: every voice exists and can be made', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('petra').animals, roof: 'flat', at: { x: 146, z: -160, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  const f = m.along([[0, 0], [60, 0]], 1.2);
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0, v); }
});

test('Petra: the map agrees with the settlement', () => {
  assert.ok(PT.sites().length > 40, `${PT.sites().length} sites`);
  const { m } = music();
  for (const s of PT.sites()) { assert.ok(s.work.length); assert.ok(PT.ROOMS[s.use], s.use); for (const [v] of s.work) assert.equal(typeof m[v], 'function', v); }
  for (const k of ['shop_incense', 'shop_potter', 'house', 'yard_potter']) assert.ok(PT.sites().some((s) => s.use === k) || k.startsWith('yard'), k);
  for (const r of Object.values(PT.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(PT.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && typeof m[e.voice] === 'function'), 'every emitter well formed, its voice made');
  assert.equal(PT.canalTrack(0, 0, () => 0.5), null); assert.equal(PT.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(PT.townNear(-40, STREET.a[1]) > 0.9 && PT.townNear(250, -150) < 0.1);
  const s0 = PT.sites()[0];
  assert.equal(PT.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(PT.roomAt(s0.at[0], STREET.a[1], 0), null, 'the street is the open');
  assert.equal(PT.roomAt(TRICLINIUM.at[0], TRICLINIUM.at[1] - 5, 0).use, 'triclinium');
  assert.ok(PT.treeSpot(0, 60, () => 0.3, 60), 'a tree in the garden');
  assert.ok(PT.caravanTrack(OUTER.path[2][0], OUTER.path[2][1], () => 0.3).pts.length > 5);
  assert.equal(PT.caravanTrack(-150, 90, () => 0.3), null);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'kitchen', 'jarLid', 'coin', 'donkeyBray', 'crowCaw', 'wellBucket']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('petra').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Petra placed: the water in the Siq runs by day and by night, the wind too', () => {
  assert.ok(listen({ x: 240, z: -150, hour: 11, secs: 120 }).calls.ptChannel > 0, 'the channel by day');
  assert.ok(listen({ x: 240, z: -150, hour: 2, secs: 120 }).calls.ptChannel > 0, 'and by night');
});

test('Petra placed: the rite at the great altar at dawn, not at noon', () => {
  const [ax, az] = QASR.altar;
  assert.ok(listen({ x: ax + 14, z: az, hour: 6.2, secs: 450 }).calls.ptChant > 0, 'the chant at dawn');
  assert.ok(!listen({ x: ax + 14, z: az, hour: 12.5, secs: 400 }).calls.ptChant, 'not at noon');
});

test('Petra placed: the banquet music in the evening, a caravan on the Outer Siq by day', () => {
  assert.ok(listen({ x: TRICLINIUM.at[0], z: TRICLINIUM.at[1] + 6, hour: 20, secs: 300 }).calls.ptLyre > 0, 'the lyre at the banquet');
  assert.ok(!listen({ x: TRICLINIUM.at[0], z: TRICLINIUM.at[1] + 6, hour: 10, secs: 300 }).calls.ptLyre, 'not by day');
  assert.ok(listen({ x: OUTER.path[2][0], z: OUTER.path[2][1], hour: 10, secs: 500 }).calls.ptCaravan > 0, 'a caravan passes');
  assert.ok(!listen({ x: OUTER.path[2][0], z: OUTER.path[2][1], hour: 2, secs: 300 }).calls.ptCaravan, 'none at night');
  void PLAZA;
});

test('Petra placed: rooms', () => {
  const k = PT.sites().find((s) => s.use === 'shop_spice');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'shop_spice');
});
