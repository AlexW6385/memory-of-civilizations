// Delphi's placed sounds (src/settlements/knossos/soundmap.js, src/engine/voices-knossos.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as DL from '../src/settlements/delphi/soundmap.js';
import { lots } from '../src/settlements/delphi/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['dlSpring', 'dlPaean', 'dlGoat', 'dlBell', 'dlChough', 'dlLoom', 'dlFire', 'dlMurmur', 'dlRunners'];

test('Delphi: the profile carries the map', () => {
  assert.ok(profileOf('delphi').animals[LIFE].map === DL);
});

test('Delphi: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('delphi').animals, roof: 'tile', at: { x: 62, z: 16, y: 20, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Delphi: the map agrees with the settlement', () => {
  const open = lots().filter((l) => l.open);
  assert.ok(DL.sites().length >= open.length && DL.sites().length <= open.length + 2, `${DL.sites().length} sites`);
  for (const s of DL.sites()) { assert.ok(s.work.length); assert.ok(DL.ROOMS[s.use], s.use); }
  for (const k of ['bronze', 'weaver', 'mason']) assert.ok(DL.sites().some((s) => s.use === k), k);
  for (const r of Object.values(DL.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(DL.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(DL.streetTrack(0, 0, () => 0.5, 90, 40), null);
  const t = DL.wayTrack(62, 100, () => 0.5, 70, 28);
  assert.ok(t && t.pts.length === 2, 'a track on the Way');
  assert.ok(DL.townNear(100, 118) > 0.9 && DL.townNear(-100, -100) < 0.5);
  const s0 = DL.sites()[0];
  assert.equal(DL.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(DL.roomAt(96, 100, 0), null, 'the Way is the open');
  assert.ok(DL.treeSpot(120, 0, () => 0.3, 40), 'a tree by the spring');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'athMallet', 'athAulos', 'athHerald', 'owl', 'athOwl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('delphi').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Delphi placed: the spring runs day and night, the paean by day only', () => {
  assert.ok(listen({ x: 128, z: 0, y: 19, hour: 12, secs: 120 }).calls.dlSpring > 0, 'the spring by day');
  assert.ok(listen({ x: 128, z: 0, y: 19, hour: 2, secs: 120 }).calls.dlSpring > 0, 'the spring at night');
  assert.ok(!listen({ x: 56, z: 0, y: 20, hour: 2, secs: 300 }).calls.dlPaean, 'no paean at night');
});

test('Delphi placed: trades at their houses, none of Suzhou\'s walkers', () => {
  const w = DL.sites().find((s) => s.use === 'weaver');
  const r = listen({ x: w.at[0], z: w.at[1] + 14, hour: 10, secs: 600 });
  assert.ok(r.calls.dlLoom > 0, 'the loom weights');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + 14, hour: 2, secs: 300 }).calls.dlLoom, 'nothing at night');
});

test('Delphi placed: rooms', () => {
  const k = DL.sites().find((s) => s.use === 'cella');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 21.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'cella');
});
