// Conques' placed sounds (src/settlements/conques/soundmap.js, src/engine/voices-conques.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as CQ from '../src/settlements/conques/soundmap.js';
import { lots, FOUNTAINS } from '../src/settlements/conques/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};

const NEW = ['cqRiver', 'cqSpout', 'cqMillwheel', 'cqHide', 'cqBeetle', 'cqLoom', 'cqBread', 'cqTavern', 'cqHearth', 'cqChant', 'cqPilgrims', 'cqMule', 'cqCock', 'cqDonkey', 'cqDog', 'cqSheepBell', 'cqSwallow', 'cqCrow', 'cqSparrow'];

test('Conques: the profile carries the map', () => {
  const P = profileOf('conques'), L = P.animals[LIFE];
  assert.ok(L.map === CQ);
});

test('Conques: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('conques').animals, roof: 'slate', at: { x: -47, z: 12, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 6 }) > 0, v); }
});

test('Conques: the map agrees with the settlement', () => {
  const open = lots().filter((l) => l.open);
  assert.equal(CQ.sites().length, open.length);
  for (const s of CQ.sites()) { assert.ok(s.work.length); assert.ok(CQ.ROOMS[s.use], s.use); for (const [v, gap, hrs] of s.work) { assert.equal(typeof v, 'string'); assert.equal(gap.length, 2); assert.equal(hrs.length, 2); } }
  for (const k of ['shop', 'home', 'hostel']) assert.ok(CQ.sites().some((s) => s.use === k), k);
  for (const r of [...Object.values(CQ.ROOMS), CQ.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(CQ.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(CQ.WELLS.length, FOUNTAINS.length);
  assert.equal(CQ.OFFICES.length, 8, 'the eight Offices');
  assert.equal(CQ.canalTrack(0, 0, () => 0.5), null); assert.equal(CQ.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(CQ.townNear(-40, 10) > 0.9 && CQ.townNear(300, 300) < 0.3);
  const s0 = CQ.sites()[0];
  assert.equal(CQ.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(CQ.roomAt(-5, 0, 0).use, 'church');
  assert.equal(CQ.roomAt(-47, 12, 0), null, 'the terrace is the open');
  const tr = CQ.TRACKS[0].get(-80, 20, () => 0.3);
  assert.ok(tr && tr.pts.length === 2, 'a track on the pilgrims\' way');
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('conques').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'slate', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Conques placed: the Office is sung at its hour, not at noon without one, not at night after compline', () => {
  const c = CQ.EMITTERS.find((e) => e.voice === 'cqChant');
  assert.ok(listen({ x: c.at[0] - 6, z: 0, hour: 9.3, secs: 400 }).calls.cqChant > 0, 'terce');
  assert.ok(!listen({ x: c.at[0] - 6, z: 0, hour: 22.5, secs: 300 }).calls.cqChant, 'the great silence');
  assert.ok(!listen({ x: c.at[0] - 6, z: 0, hour: 10.5, secs: 300 }).calls.cqChant, 'between the offices');
});

test('Conques placed: the Dourdou is heard at the bridge, by night too', () => {
  const b = CQ.EMITTERS.find((e) => e.voice === 'cqRiver');
  assert.ok(listen({ x: b.at[0], z: b.at[1] + 6, hour: 2, secs: 120 }).calls.cqRiver > 0);
});

test('Conques placed: the smith at his forge by day, none of Suzhou\'s walkers', () => {
  const s = CQ.sites().find((q) => q.use === 'smith');
  if (!s) return;
  const r = listen({ x: s.at[0], z: s.at[1] + 10, hour: 10, secs: 600 });
  assert.ok(r.calls.hammer > 0, 'the hammer');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: s.at[0], z: s.at[1] + 10, hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
});

test('Conques placed: rooms', () => {
  const h = CQ.sites().find((s) => s.use === 'hostel');
  assert.equal(listen({ x: h.at[0], z: h.at[1], y: h.y + 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'hostel');
});
