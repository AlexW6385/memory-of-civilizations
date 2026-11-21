// Borgund's placed sounds (src/settlements/norse-borgund/soundmap.js, src/engine/voices-norse-borgund.js): the voices exist and can be made against a stand-in
// audio context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as NB from '../src/settlements/norse-borgund/soundmap.js';
import { buildings, YARD } from '../src/settlements/norse-borgund/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};

const NEW = ['nbRiver', 'nbHearth', 'nbQuern', 'nbLoom', 'nbFlail', 'nbStall', 'nbBellows', 'nbChop', 'nbWash', 'nbKulning', 'nbLur', 'nbCowBell', 'nbChant', 'nbWalkers', 'nbPack', 'nbMoor', 'nbSwallow', 'nbCrow', 'nbSparrow'];

test('Borgund: the profile carries the map', () => {
  assert.ok(profileOf('norse-borgund').animals[LIFE].map === NB);
});

test('Borgund: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('norse-borgund').animals, roof: 'shingle', at: { x: -30, z: -28, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 180;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 6 }) > 0, v); }
});

test('Borgund: the map agrees with the settlement', () => {
  const open = buildings().filter((b) => b.farm >= 0 && ['stue', 'barn', 'smithy'].includes(b.kind));
  assert.equal(NB.sites().length, open.length);
  for (const s of NB.sites()) { assert.ok(s.work.length); assert.ok(NB.ROOMS[s.use], s.use); for (const [v, gap, hrs] of s.work) { assert.equal(typeof v, 'string'); assert.equal(gap.length, 2); assert.equal(hrs.length, 2); } }
  for (const k of ['home', 'barn', 'smithy']) assert.ok(NB.sites().some((s) => s.use === k), k);
  for (const r of [...Object.values(NB.ROOMS), NB.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(NB.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.ok(NB.EMITTERS.some((e) => e.voice === 'nbChant') && NB.EMITTERS.some((e) => e.voice === 'nbKulning') && NB.EMITTERS.some((e) => e.voice === 'nbRiver'));
  assert.equal(NB.canalTrack(0, 0, () => 0.5), null); assert.equal(NB.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(NB.townNear(0, YARD[3] - 2) > 0.3 && NB.townNear(250, 0) === 0);
  const s0 = NB.sites()[0];
  assert.equal(NB.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(NB.roomAt(0, -30, 1).use, 'church');
  assert.equal(NB.roomAt(-30, -28, 0), null, 'the arrival is the open');
  const tr = NB.TRACKS[0].get(-40, 0, () => 0.3);
  assert.ok(tr && tr.pts.length === 2, 'a track from a farm to the church');
});

function listen({ x, z, y = 0, hour, doy = 180, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'kitchen', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('norse-borgund').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'shingle', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Borgund placed: the priest chants at his hour, not at night', () => {
  const c = NB.EMITTERS.find((e) => e.voice === 'nbChant');
  assert.ok(listen({ x: c.at[0] - 6, z: c.at[1], hour: 9.3, secs: 400 }).calls.nbChant > 0, 'the morning Mass');
  assert.ok(!listen({ x: c.at[0] - 6, z: c.at[1], hour: 2, secs: 300 }).calls.nbChant, 'none at night');
});

test('Borgund placed: the river is heard on its bank by night too; the smith by day only', () => {
  const b = NB.EMITTERS.find((e) => e.voice === 'nbRiver');
  assert.ok(listen({ x: b.at[0], z: b.at[1] + 6, hour: 2, secs: 120 }).calls.nbRiver > 0);
  const s = NB.sites().find((q) => q.use === 'smithy');
  assert.ok(listen({ x: s.at[0], z: s.at[1] + 10, hour: 10, secs: 600 }).calls.hammer > 0, 'the hammer by day');
  assert.ok(!listen({ x: s.at[0], z: s.at[1] + 10, hour: 2, secs: 300 }).calls.hammer, 'nothing at night');
});

test('Borgund placed: the kulning is a summer sound of the summer farms', () => {
  const e = NB.EMITTERS.find((q) => q.voice === 'nbKulning' && q.hours[0] < 6);
  assert.ok(listen({ x: e.at[0], z: e.at[1] + 8, hour: 6.5, doy: 180, secs: 400 }).calls.nbKulning > 0);
  assert.ok(!listen({ x: e.at[0], z: e.at[1] + 8, hour: 12.5, doy: 180, secs: 200 }).calls.nbKulning, 'not at midday');
});
