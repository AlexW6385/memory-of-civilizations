// Dunhuang's placed sounds (src/settlements/dunhuang/soundmap.js, src/engine/voices-dunhuang.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as DH from '../src/settlements/dunhuang/soundmap.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['dhFengling', 'dhPipa', 'dhQiangdi', 'dhStream', 'dhBellows', 'dhOvenSlap', 'dhShaduf', 'dhMallet', 'dhMurmur'];
const mk = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return m; };

test('Dunhuang: the profile carries the map', () => {
  assert.ok(profileOf('dunhuang').animals[LIFE].map === DH);
});

test('Dunhuang: every voice exists and can be made', () => {
  const { ctx } = fake(), m = mk(ctx);
  m.place({ voices: {}, animals: profileOf('dunhuang').animals, roof: 'flat', at: { x: 14, z: 0, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Dunhuang: the map agrees with the settlement', () => {
  assert.ok(DH.sites().length > 12, `${DH.sites().length} sites`);
  for (const s of DH.sites()) { assert.ok(s.work.length, s.id); assert.ok(DH.ROOMS[s.use], s.use); }
  for (const k of ['home', 'smith', 'bake', 'greathall', 'cell']) assert.ok(DH.sites().some((s) => s.use === k), k);
  for (const r of Object.values(DH.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(DH.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(DH.canalTrack(0, 0, () => 0.5), null);
  assert.ok(DH.townNear(60, 0) > 0.9 && DH.townNear(-70, 0) < 0.3);
  const s0 = DH.sites()[0];
  assert.equal(DH.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(DH.roomAt(14, 0, 0), null, 'the street is the open');
  assert.ok(DH.treeSpot(160, 0, () => 0.3, 40), 'a tree in the fields');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake(), m = mk(ctx);
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'wheel', 'hammer', 'kitchen', 'jarLid', 'owl', 'camelString', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('dunhuang').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Dunhuang placed: the eave bells by day and night, not the market at night', () => {
  assert.ok(listen({ x: -62, z: 0, hour: 12, secs: 200 }).calls.dhFengling > 0, 'bells by day');
  assert.ok(listen({ x: -62, z: 0, hour: 2, secs: 200 }).calls.dhFengling > 0, 'bells by night');
});

test('Dunhuang placed: the smith at his forge by day, silent at night', () => {
  const s = DH.sites().find((q) => q.use === 'smith');
  assert.ok(listen({ x: s.at[0], z: s.at[1] + (s.at[1] > 0 ? -9 : 9), hour: 10, secs: 600 }).calls.hammer > 0, 'the hammer');
  assert.ok(!listen({ x: s.at[0], z: s.at[1] + (s.at[1] > 0 ? -9 : 9), hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
});

test('Dunhuang placed: none of Suzhou\'s walkers', () => {
  const r = listen({ x: 60, z: 0, hour: 11, secs: 300 });
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
});

test('Dunhuang placed: rooms', () => {
  const k = DH.sites().find((s) => s.use === 'cell');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.9, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'cell');
});
