// Lalibela's placed sounds (src/settlements/lalibela/soundmap.js, src/engine/voices-lalibela.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place and hour. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as LA from '../src/settlements/lalibela/soundmap.js';
import { enterable, PITS } from '../src/settlements/lalibela/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = ['laKebero', 'laSistrum', 'laChant', 'laBegena', 'laStoneGong', 'laMortar', 'laGriddle', 'laLoom', 'laChisel', 'laWind', 'laHerder'];

test('Lalibela: the profile carries the map', () => { assert.ok(profileOf('lalibela').animals[LIFE].map === LA); });

test('Lalibela: every voice exists and can be made', () => {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('lalibela').animals, roof: 'thatch', at: { x: -236, z: 176, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Lalibela: the map agrees with the settlement', () => {
  assert.ok(LA.sites().length >= enterable().length && LA.sites().length <= enterable().length + 1);
  for (const s of LA.sites()) { assert.ok(s.work.length); assert.ok(LA.ROOMS[s.use], s.use); }
  for (const k of ['weaver', 'household', 'smith']) assert.ok(LA.sites().some((s) => s.use === k), k);
  assert.ok(LA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.equal(LA.canalTrack(0, 0, () => 0.5), null);
  const g = PITS.giyorgis.rect, c = [(g[0] + g[2]) / 2, (g[1] + g[3]) / 2];
  assert.equal(LA.roomAt(c[0], c[1], -9).use, 'church'); assert.equal(LA.roomAt(c[0], c[1], 0.5), null, 'on the roof is the open');
  const s0 = LA.sites()[0]; assert.equal(LA.roomAt(s0.at[0], s0.at[1], s0.y + 0.3).same, s0.id);
});

function listen({ x, z, y = 0, hour, rain = 0, secs = 300 }) {
  const { ctx } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = 60; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'hammer', 'jarLid', 'owl', 'pour', 'clay']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('lalibela').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors: false, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Lalibela placed: the dawn chant at a church door, not at midnight', () => {
  const c = LA.EMITTERS.find((e) => e.voice === 'laChant'), at = c.at;
  assert.ok(listen({ x: at[0] + 6, z: at[1], hour: 6, secs: 600 }).calls.laChant > 0, 'chant at dawn');
  assert.ok(!listen({ x: at[0] + 6, z: at[1], hour: 1, secs: 300 }).calls.laChant, 'not at midnight');
});
test('Lalibela placed: the weaver\'s loom by day', () => {
  const w = LA.sites().find((s) => s.use === 'weaver');
  assert.ok(listen({ x: w.at[0], z: w.at[1] + 12, hour: 10, secs: 600 }).calls.laLoom > 0, 'the loom');
  assert.ok(!listen({ x: w.at[0], z: w.at[1] + 12, hour: 2, secs: 300 }).calls.laLoom, 'nothing at night');
});
