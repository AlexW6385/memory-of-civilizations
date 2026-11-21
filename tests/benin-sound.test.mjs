// Benin City's placed sounds (src/settlements/benin-city/soundmap.js, src/engine/voices-benin.js): the voices exist and can be made against a stand-in audio context,
// the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as BN from '../src/settlements/benin-city/soundmap.js';
import { lots, GATE_X } from '../src/settlements/benin-city/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['bnLogDrum', 'bnBells', 'bnHorn', 'bnThumbPiano', 'bnPound', 'bnBellows', 'bnBrassHammer', 'bnCarve', 'bnCall', 'bnHornbill'];
const mk = () => { const { ctx } = fake(); const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Benin: the profile carries the map; thatch roofs, no flat clay roof', () => {
  const P = profileOf('benin-city');
  assert.ok(P.animals[LIFE].map === BN);
  assert.equal(P.roof, 'thatch');
});

test('Benin: every voice exists and can be made', () => {
  const { ctx, m } = mk();
  m.place({ voices: {}, animals: profileOf('benin-city').animals, roof: 'thatch', at: { x: -65, z: 24, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  for (const e of BN.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const s of BN.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
});

test('Benin: the map agrees with the settlement', () => {
  assert.ok(BN.sites().length > 40 && BN.sites().length <= lots().length, `${BN.sites().length} sites`);
  for (const s of BN.sites()) { assert.ok(s.work.length); assert.ok(BN.ROOMS[s.use], s.use); }
  for (const k of ['plain', 'chief', 'brass']) assert.ok(BN.sites().some((s) => s.use === k), k);
  for (const r of Object.values(BN.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(BN.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.every(Number.isFinite)), 'every emitter well formed');
  assert.equal(BN.canalTrack(0, 0, () => 0.5), null);
  assert.ok(BN.townNear(164, -32) > 0.9 && BN.townNear(-65, 20) > 0.7 && BN.townNear(-300, 100) < 0.3);
  const s0 = BN.sites()[0];
  assert.equal(BN.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(BN.roomAt(GATE_X, 57, 0), null, 'the great street is the open');
  assert.equal(BN.roomAt(-65, -70, 0.4).use, 'hall');
  assert.ok(BN.treeSpot(260, 0, () => 0.3, 40), 'a tree of the rim');
  assert.ok(BN.frogGround(292, 0) > 0.5 && BN.frogGround(0, 20) < 0.5, 'frogs in the ditch only');
  assert.equal(BN.WELLS.length, 4);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'coin', 'clay', 'pour', 'loom']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('benin-city').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Benin placed: the log drum on the king\'s square by day, not at night or in rain', () => {
  const x = -53, z = 18;
  assert.ok(listen({ x, z, hour: 10, secs: 600 }).calls.bnLogDrum > 0);
  assert.ok(!listen({ x, z, hour: 2, secs: 300 }).calls.bnLogDrum);
  assert.ok(!listen({ x, z, hour: 10, rain: 0.9, secs: 300 }).calls.bnLogDrum);
});
test('Benin placed: the casters work by day only', () => {
  const y = BN.EMITTERS.find((e) => e.voice === 'bnBellows');
  assert.ok(listen({ x: y.at[0], z: y.at[1], hour: 10, secs: 300 }).calls.bnBellows > 0);
  assert.ok(!listen({ x: y.at[0], z: y.at[1], hour: 2, secs: 300 }).calls.bnBellows);
});
test('Benin placed: the horn of the court at dawn, not at noon', () => {
  assert.ok(listen({ x: -65, z: -60, hour: 6, secs: 900 }).calls.bnHorn > 0);
  assert.ok(!listen({ x: -65, z: -60, hour: 12, secs: 300 }).calls.bnHorn);
});
test('Benin placed: rooms', () => {
  const s = BN.sites().find((q) => q.use === 'brass') || BN.sites()[0];
  assert.equal(listen({ x: s.at[0], z: s.at[1], y: 0.5, hour: 11, indoors: true, secs: 60 }).m.plc.room.use, s.use);
});
