// Çatalhöyük's placed sounds (src/settlements/catalhoyuk/soundmap.js, src/engine/voices-catal.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as CA from '../src/settlements/catalhoyuk/soundmap.js';
import { ENTER, PENS, POOLS, LANDMARK } from '../src/settlements/catalhoyuk/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['catQuern', 'catKnap', 'catPlaster', 'catCrackle', 'catScrape', 'catPlait', 'catBleat', 'catLow', 'catMurmur', 'catCall', 'catDrum', 'catFlute', 'catReeds', 'catCrane', 'catJackal'];
const place = (m, o) => m.place({ voices: { sparrow: 1 }, animals: profileOf('catalhoyuk').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, cicadas: 0, ...o });

test('Catalhoyuk: the profile carries the map; no bell, no horse, no hen (none yet at 6500 BC)', () => {
  const P = profileOf('catalhoyuk'), L = P.animals[LIFE];
  assert.ok(L.map === CA);
  assert.ok(!('horse' in P.animals) && !('rooster' in P.animals) && !('sheepbell' in P.animals) && !('donkey' in P.animals));
});

test('Catalhoyuk: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  place(m, { at: { x: 0, z: 30, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Catalhoyuk: the map agrees with the settlement', () => {
  const S = CA.sites();
  assert.equal(S.length, ENTER.length + 2, 'every opened house, the landmark room and its store');
  for (const s of S) { assert.ok(s.work.length); assert.ok(CA.ROOMS[s.use], s.use); }
  for (const k of ['home', 'knap', 'bake', 'store']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(CA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(CA.EMITTERS.length > 30 && CA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.every(Number.isFinite)), 'every emitter well formed');
  for (const e of CA.EMITTERS) assert.ok(NEW.includes(e.voice) || ['clay', 'jarLid', 'kitchen', 'owl', 'dogFar'].includes(e.voice), e.voice);
  assert.equal(CA.canalTrack(0, 0, () => 0.5), null); assert.equal(CA.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(CA.townNear(0, 0) > 0.9 && CA.townNear(0, 85) < 0.4);
  const s0 = S[2];
  assert.equal(CA.roomAt(s0.at[0], s0.at[1], 0.2).same, s0.id);
  assert.equal(CA.roomAt(s0.at[0], s0.at[1], 2.6), null, 'on the roof one is in the open');
  assert.equal(CA.roomAt(0, 100, 0), null);
  assert.ok(CA.treeSpot(POOLS[0][0], POOLS[0][1], (() => { let q = 7; return () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296); })(), 40), 'a willow by a pool');
  assert.ok(CA.frogGround(POOLS[0][0], POOLS[0][1]) > 0);
  assert.ok(PENS.length >= 2 && LANDMARK.rect.length === 4);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'owl', 'clay', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const put = () => place(m, { rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}
const court = CA.EMITTERS.find((e) => e.voice === 'catKnap'), quern = CA.EMITTERS.find((e) => e.voice === 'catQuern'), pen = CA.EMITTERS.find((e) => e.voice === 'catBleat');

test('Catalhoyuk placed: the evening drum, not at midday and not in rain', () => {
  const d = CA.EMITTERS.find((e) => e.voice === 'catDrum').at;
  assert.ok(listen({ x: d[0], z: d[1], y: 2.6, hour: 19, secs: 900 }).calls.catDrum > 0, 'the drum at dusk');
  assert.ok(!listen({ x: d[0], z: d[1], y: 2.6, hour: 12, secs: 300 }).calls.catDrum, 'not at midday');
  assert.ok(!listen({ x: d[0], z: d[1], y: 2.6, hour: 19, rain: 0.9, secs: 300 }).calls.catDrum, 'not in the rain');
});

test('Catalhoyuk placed: grinding in the morning, knapping by day, bleating at the pens; none of Suzhou\'s walkers', () => {
  const r = listen({ x: quern.at[0], z: quern.at[1], hour: 8, secs: 600 });
  assert.ok(r.calls.catQuern > 0, 'the quern');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(listen({ x: court.at[0], z: court.at[1], hour: 11, secs: 600 }).calls.catKnap > 0, 'the knapper');
  assert.ok(listen({ x: pen.at[0], z: pen.at[1], hour: 9, secs: 300 }).calls.catBleat > 0, 'the pens');
  assert.ok(!listen({ x: quern.at[0], z: quern.at[1], hour: 2, secs: 300 }).calls.catQuern, 'nothing at night');
});

test('Catalhoyuk placed: rooms', () => {
  const k = CA.sites().find((s) => s.use === 'knap');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: 0.2, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'knap');
});
