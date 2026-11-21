// The pā's placed sounds (src/settlements/maori/soundmap.js, src/engine/voices-maori.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as MA from '../src/settlements/maori/soundmap.js';
import { village, HILL } from '../src/settlements/maori/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = ['maoKaranga', 'maoWaiata', 'maoKoauau', 'maoPutorino', 'maoPukaea', 'maoToki', 'maoPatu', 'maoRaranga', 'maoHearth', 'maoSteam', 'maoPool', 'maoPaddle', 'maoChildren', 'maoTui', 'maoKorimako', 'maoRuru', 'maoKiwi', 'maoLake'];

test('Maori: the profile carries the map; no rooster, no bell, no horse (not yet in Aotearoa)', () => {
  const P = profileOf('maori'), L = P.animals[LIFE];
  assert.ok(L.map === MA);
  assert.ok(!('horse' in P.animals) && !('rooster' in P.animals) && !('sheepbell' in P.animals));
});

test('Maori: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('maori').animals, roof: 'thatch', at: { x: 0, z: 30, y: 40, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Maori: the map agrees with the settlement', () => {
  const v = village();
  assert.ok(MA.sites().length >= 100, 'the furnished houses');
  assert.ok(MA.sites().some((s) => s.use === 'hall'), 'the chief\'s house');
  for (const s of MA.sites()) { assert.ok(s.work.length); assert.ok(MA.ROOMS[s.use], s.use); }
  for (const k of ['weaver', 'carver', 'cook']) assert.ok(MA.sites().some((s) => s.use === k), k);
  for (const r of Object.values(MA.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(MA.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  assert.equal(MA.canalTrack(0, 0, () => 0.5), null); assert.equal(MA.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(MA.townNear(0, 30) > 0.9 && MA.townNear(0, 320) < 0.3);
  const s0 = MA.sites().find((s) => s.use === 'weaver');
  assert.equal(MA.roomAt(s0.at[0], s0.at[1], s0.y + 0.2).same, s0.id);
  assert.equal(MA.roomAt(0, 33, HILL.top), null, 'the marae is the open');
  assert.ok(MA.treeSpot(0, 190, () => 0.3, 40), 'a cabbage tree on the way in');
  assert.ok(MA.shoreSpot(0, -170, () => 0.5), 'the shingle');
  assert.ok(v.houses.length > 100);
});

function listen({ x, z, y = 0, hour, doy = 120, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'owl', 'vendor', 'sedan', 'watchman', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('maori').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Maori placed: the karanga on the marae by day, not at night and not in rain', () => {
  assert.ok(listen({ x: 0, z: 30, y: 40, hour: 10, secs: 900 }).calls.maoKaranga > 0, 'the call of welcome');
  assert.ok(!listen({ x: 0, z: 30, y: 40, hour: 2, secs: 300 }).calls.maoKaranga, 'not at night');
  assert.ok(!listen({ x: 0, z: 30, y: 40, hour: 10, rain: 0.9, secs: 300 }).calls.maoKaranga, 'not in the rain');
});

test('Maori placed: the adze at the canoe, the hot ground, the night birds; none of Suzhou\'s walkers', () => {
  const [cx, cz] = MA.CANOE_YARD;
  const r = listen({ x: cx, z: cz, hour: 9, secs: 600 });
  assert.ok(r.calls.maoToki > 0, 'the adzes');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.watchman && !r.calls.boat);
  assert.ok(!listen({ x: cx, z: cz, hour: 2, secs: 300 }).calls.maoToki, 'nothing at night');
  assert.ok(listen({ x: -150, z: -126, hour: 3, secs: 300 }).calls.maoSteam > 0, 'the vents steam at any hour');
  assert.ok(listen({ x: -60, z: -55, hour: 23, secs: 900 }).calls.maoRuru > 0, 'the ruru at night');
});

test('Maori placed: rooms', () => {
  const k = MA.sites().find((s) => s.use === 'weaver');
  assert.equal(listen({ x: k.at[0], z: k.at[1], y: k.y + 0.2, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'weaver');
});
