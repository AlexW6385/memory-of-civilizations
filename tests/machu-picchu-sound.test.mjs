// Machu Picchu's placed sounds (src/settlements/machu-picchu/soundmap.js, src/engine/voices-machu-picchu.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as MP from '../src/settlements/machu-picchu/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['mpQuena', 'mpAntara', 'mpWankar', 'mpPututu', 'mpStoneHammer', 'mpPlough', 'mpCall', 'mpLlama', 'mpCuy', 'mpLoomBatten', 'mpSpindle', 'mpGrind', 'mpSpout', 'mpRiver'];
const mk = () => { const { ctx } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Machu Picchu: the profile carries the map', () => { assert.ok(profileOf('machu-picchu').animals[LIFE].map === MP); });

test('Machu Picchu: every voice exists and can be made', () => {
  const { ctx, m } = mk();
  m.place({ voices: {}, animals: profileOf('machu-picchu').animals, roof: 'thatch', at: { x: 0, z: 22, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 20;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Machu Picchu: the map agrees with the settlement', () => {
  assert.ok(MP.sites().length >= 12, `${MP.sites().length} sites`);
  for (const s of MP.sites()) { assert.ok(s.work.length); assert.ok(MP.ROOMS[s.use], s.use); }
  for (const k of ['qollqa', 'kallanka', 'home']) assert.ok(MP.sites().some((s) => s.use === k), k);
  for (const r of Object.values(MP.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(MP.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.every(Number.isFinite)), 'every emitter well formed');
  assert.equal(MP.canalTrack(0, 0, () => 0.5), null);
  assert.ok(MP.townNear(2, -24) > MP.townNear(0, 300));
  const s0 = MP.sites()[0];
  assert.equal(MP.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(MP.roomAt(2, 50, 0), null, 'the road is the open');
});

function listen({ x, z, y = 0, hour, doy = 20, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'sack', 'pour', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('machu-picchu').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Machu Picchu placed: the feast\'s music in the afternoon, not at dawn nor in rain', () => {
  const p = MP.EMITTERS.find((e) => e.voice === 'mpQuena').at;
  assert.ok(listen({ x: p[0] + 6, z: p[1], hour: 17, secs: 600 }).calls.mpQuena > 0, 'the quena');
  assert.ok(!listen({ x: p[0] + 6, z: p[1], hour: 3, secs: 300 }).calls.mpQuena, 'not at night');
  assert.ok(!listen({ x: p[0] + 6, z: p[1], hour: 17, rain: 0.9, secs: 300 }).calls.mpQuena, 'not in the rain');
});

test('Machu Picchu placed: the fountains run, the masons work by day only', () => {
  const f = MP.EMITTERS.find((e) => e.voice === 'mpSpout').at;
  assert.ok(listen({ x: f[0] + 3, z: f[1], hour: 3, secs: 120 }).calls.mpSpout > 0, 'water at night');
  const q = MP.EMITTERS.find((e) => e.voice === 'mpStoneHammer').at;
  assert.ok(listen({ x: q[0] + 6, z: q[1], hour: 10, secs: 300 }).calls.mpStoneHammer > 0, 'hammers by day');
  assert.ok(!listen({ x: q[0] + 6, z: q[1], hour: 2, secs: 200 }).calls.mpStoneHammer, 'none at night');
});

test('Machu Picchu placed: none of the other places\' street voices, and a room', () => {
  const s = MP.sites().find((q) => q.use === 'qollqa');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.5, hour: 10, indoors: true, secs: 100 });
  assert.equal(r.m.plc.room.use, 'qollqa');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
});
