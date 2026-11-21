// Nan Madol's placed sounds (src/settlements/nan-madol/soundmap.js, src/engine/voices-nan-madol.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. 
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as NM from '../src/settlements/nan-madol/soundmap.js';
import { SAKAU, village } from '../src/settlements/nan-madol/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['nanSakau', 'nanBoard', 'nanAdze', 'nanGrate', 'nanPress', 'nanUmu', 'nanConch', 'nanChant', 'nanSurf', 'nanHeron'];
const mk = () => { const { ctx } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Nan Madol: the profile carries the map; no bell, no horse', () => {
  const P = profileOf('nan-madol'), L = P.animals[LIFE];
  assert.ok(L.map === NM);
  assert.ok(!('horse' in P.animals) && !('sheepbell' in P.animals));
});

test('Nan Madol: every voice exists and can be made', () => {
  const { ctx, m } = mk();
  m.place({ voices: {}, animals: profileOf('nan-madol').animals, roof: 'thatch', at: { x: -10, z: 28, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Nan Madol: the map agrees with the settlement', () => {
  const nahs = NM.sites().filter((s) => s.use === 'nah');
  assert.equal(nahs.length, village().houses.length);
  assert.ok(NM.sites().some((s) => s.use === 'hall') && NM.sites().some((s) => s.use === 'store'));
  for (const s of NM.sites()) { assert.ok(s.work.length); assert.ok(NM.ROOMS[s.use], s.use); }
  for (const r of Object.values(NM.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(NM.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const [x, z] of SAKAU) assert.ok(NM.EMITTERS.some((e) => e.voice === 'nanSakau' && e.at[0] === x && e.at[1] === z), 'a sakau stone sounds');
  assert.equal(NM.streetTrack(0, 0, () => 0.5), null); assert.equal(NM.bridgeTrack(0, 0, () => 0.5), null);
  const tr = NM.canalTrack(-10, 28, () => 0.3);
  assert.ok(tr && tr.pts.length === 2, 'a canoe track near the arrival');
  const s0 = nahs[0];
  assert.equal(NM.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(NM.roomAt(-10, 0, 0), null, 'the causeway is the open');
  assert.ok(NM.townNear(-10, 28) > 0.5 && NM.townNear(0, 300) < 0.3);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'boat', 'vendor', 'sedan', 'watchman']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('nan-madol').animals;
  const put = () => m.place({ voices: { tropic: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Nan Madol placed: the sakau in the morning, not at night; the conch at dawn', () => {
  const [sx, sz] = SAKAU[0];
  assert.ok(listen({ x: sx, z: sz + 4, hour: 8, secs: 900 }).calls.nanSakau > 0, 'the sakau');
  assert.ok(!listen({ x: sx, z: sz + 4, hour: 2, secs: 300 }).calls.nanSakau, 'not at night');
  assert.ok(listen({ x: -10, z: -30, hour: 6, secs: 1200 }).calls.nanConch > 0, 'the conch at dawn');
});

test('Nan Madol placed: surf all day, canoes on the canals, none of Suzhou\'s walkers', () => {
  const r = listen({ x: 100, z: 30, hour: 12, secs: 200 });
  assert.ok(r.calls.nanSurf > 0, 'the surf');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman);
  assert.ok(listen({ x: -10, z: 28, hour: 10, secs: 600 }).calls.boat > 0, 'a canoe passes');
});

test('Nan Madol placed: rooms', () => {
  const k = NM.sites().find((s) => s.use === 'nah');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'nah');
});
