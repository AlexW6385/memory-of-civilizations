// Cahokia's placed sounds (src/settlements/cahokia/soundmap.js, src/engine/voices-cahokia.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as CA from '../src/settlements/cahokia/soundmap.js';
import { PLAZA, YARDS } from '../src/settlements/cahokia/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['cahDrum', 'cahRattle', 'cahChant', 'cahFlute', 'cahChunkey', 'cahPound', 'cahKnap', 'cahDrill', 'cahScrape', 'cahPaddle', 'cahCreek', 'cahWatch'];

test('Cahokia: the profile carries the map; no bell, no horse, no rooster', () => {
  const P = profileOf('cahokia'), L = P.animals[LIFE];
  assert.ok(L.map === CA);
  assert.ok(!('horse' in P.animals) && !('rooster' in P.animals) && !('sheepbell' in P.animals) && !P.bells);
});

test('Cahokia: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('cahokia').animals, roof: 'thatch', at: { x: -25, z: -18, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Cahokia: the map agrees with the settlement', () => {
  const S = CA.sites();
  assert.ok(S.filter((s) => s.id.startsWith('house:')).length >= 100, 'the opened houses');
  assert.ok(S.some((s) => s.id === 'hall:0') && S.some((s) => s.id.startsWith('mound:')), 'the halls');
  for (const s of S) { assert.ok(s.work.length); assert.ok(CA.ROOMS[s.use], s.use); }
  for (const r of Object.values(CA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(CA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2), 'every emitter well formed');
  assert.ok(CA.EMITTERS.filter((e) => e.voice === 'cahChunkey').length === YARDS.length);
  assert.equal(CA.canalTrack(0, 0, () => 0.5), null);
  assert.ok(CA.townNear(0, 60) > 0.9 && CA.townNear(0, 400) < 0.2);
  const s0 = S.find((s) => s.id.startsWith('house:'));
  assert.equal(CA.roomAt(s0.at[0], s0.at[1], s0.y + 0.2).same, s0.id);
  assert.equal(CA.roomAt(0, 60, 0), null, 'the plaza is the open');
  assert.ok(CA.treeSpot(0, -365, () => 0.3, 40), 'a tree by the creek');
  assert.ok(PLAZA.length === 4);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('cahokia').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Cahokia placed: the evening drum, not at midday and not in rain', () => {
  assert.ok(listen({ x: 0, z: 40, hour: 19, secs: 900 }).calls.cahDrum > 0, 'the drum at dusk');
  assert.ok(!listen({ x: 0, z: 40, hour: 12, secs: 300 }).calls.cahDrum, 'not at midday');
  assert.ok(!listen({ x: 0, z: 40, hour: 19, rain: 0.9, secs: 300 }).calls.cahDrum, 'not in the rain');
});

test('Cahokia placed: chunkey by day on the yards, the creek; none of Suzhou\'s walkers', () => {
  const y = YARDS[0], r = listen({ x: (y[0] + y[2]) / 2, z: (y[1] + y[3]) / 2 + 6, hour: 11, secs: 600 });
  assert.ok(r.calls.cahChunkey > 0, 'chunkey');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: (y[0] + y[2]) / 2, z: (y[1] + y[3]) / 2, hour: 2, secs: 300 }).calls.cahChunkey, 'nothing of it at night');
});

test('Cahokia placed: a hall', () => {
  const k = CA.sites().find((s) => s.use === 'hall');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: k.y + 0.3, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'hall');
});
