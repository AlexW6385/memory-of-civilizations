// Mount Wutai's placed sounds (src/settlements/tang-wutai/soundmap.js, src/engine/voices-wutai.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE, due } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as WT from '../src/settlements/tang-wutai/soundmap.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['wtChant', 'wtEaveBell', 'wtBoard', 'wtMill', 'wtBellows', 'wtOwl', 'wtBowl'];
const setup = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Wutai: the profile carries the map and its own hours', () => {
  const P = profileOf('tang-wutai');
  assert.ok(P.animals[LIFE].map === WT);
  assert.equal(P.bells, 'tang-wutai');
  const ev = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, L = 39 * Math.PI / 180, now = { hour, el: Math.asin(Math.cos(L) * Math.cos(H)) * 180 / Math.PI, lat: 39 }; for (const e of due(P, prev, now)) ev.push([hour, e]); prev = now; }
  assert.deepEqual(ev.map(([, e]) => e), ['temple-am', 'temple-pm']);
  assert.ok(Math.abs(ev[0][0] - 4.4) < 0.05 && Math.abs(ev[1][0] - 18.4) < 0.05);
});

test('Wutai: every voice exists and can be made', () => {
  const { ctx, m } = setup();
  m.place({ voices: {}, animals: profileOf('tang-wutai').animals, roof: 'tile', at: { x: 35, z: 6, y: 13, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Wutai: the map agrees with the settlement', () => {
  const S = WT.sites();
  assert.ok(S.length > 25, 'open houses, trades, rooms');
  for (const s of S) { assert.ok(WT.ROOMS[s.use], s.use); assert.ok(Array.isArray(s.work), s.id); }
  for (const r of Object.values(WT.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(WT.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.ok(WT.TEMPLE.bell[0] > 0 && WT.TEMPLE.hall[0] > WT.TEMPLE.bell[0]);
  assert.equal(WT.roomAt(WT.TEMPLE.hall[0], WT.TEMPLE.hall[1], 14.5).same, 'temple:hall');
  assert.equal(WT.roomAt(35, 6, 13), null);
  assert.ok(WT.streetTrack(-100, 0, () => 0.3, 90, 30), 'a track on the main lane');
  assert.equal(WT.canalTrack(), null);
  assert.ok(WT.townNear(-100, 0) > 0.9 && WT.townNear(40, 0) < 0.5);
});

function listen({ x, z, y = 0, hour, doy = 200, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = setup();
  m.doyOverride = doy; m.wind = 0.4;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'loom']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('tang-wutai').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Wutai placed: the eave bells ring at any hour', () => {
  assert.ok(listen({ x: 56, z: 0, y: 13, hour: 2, secs: 200 }).calls.wtEaveBell > 0);
});

test('Wutai placed: the owls at night only', () => {
  assert.ok(listen({ x: 130, z: 40, hour: 23, secs: 300 }).calls.wtOwl > 0);
  assert.ok(!listen({ x: 130, z: 40, hour: 12, secs: 200 }).calls.wtOwl);
});

test('Wutai placed: the smith at his forge by day, not at night', () => {
  const s = WT.sites().find((q) => q.use === 'shop_smithy');
  assert.ok(listen({ x: s.at[0], z: s.at[1] + (s.at[1] > 0 ? -9 : 9), hour: 10, secs: 300 }).calls.hammer > 0);
  assert.ok(!listen({ x: s.at[0], z: s.at[1] + 9, hour: 23, secs: 200 }).calls.hammer);
});
