// Ayutthaya's placed sounds (src/settlements/ayutthaya/soundmap.js, src/engine/voices-ayutthaya.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as AY from '../src/settlements/ayutthaya/soundmap.js';
import { lots, MARKET } from '../src/settlements/ayutthaya/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['ayGong', 'ayDrum', 'ayChant', 'ayPiphat', 'ayCry', 'ayPaddle', 'ayTokay', 'ayElephant'];

test('Ayutthaya: the profile carries the map, the canal, the market and the eaves', () => {
  const P = profileOf('ayutthaya'), L = P.animals[LIFE];
  assert.ok(L.map === AY && L.canal && L.market && L.eaves);
  assert.ok(!L.oar && !L.patrol && !L.teahouse, 'no Chinese sculling, no watchman, no tea house');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'duck', 'rooster'], 'the life is not an animal');
});

test('Ayutthaya: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('ayutthaya').animals, roof: 'thatch', at: { x: 10, z: -100, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Ayutthaya: the map agrees with the settlement', () => {
  const S = AY.sites();
  assert.ok(S.length > 60 && S.length <= lots().length, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length && AY.ROOMS[s.use], s.use); for (const [v, gap, hrs] of s.work) { assert.equal(typeof v, 'string'); assert.ok(gap[0] > 0 && gap[1] >= gap[0] && hrs.length === 2); } }
  for (const k of ['shop', 'house']) assert.ok(S.some((s) => s.use === k), k);
  assert.ok(lots().filter((l) => l.trade).every((l) => AY.sites().some((s) => s.id === 'lot:' + l.seed)), 'every shop of the walk has its sounds');
  for (const r of Object.values(AY.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(AY.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2), 'every emitter well formed');
  assert.ok(AY.townNear(MARKET[0] + 20, 0) > 0.9 && AY.townNear(10, -130) < 0.3, 'the market hums, the wat is quiet');
  assert.ok(AY.canalTrack(10, -78, () => 0.5), 'a boat can pass the canal by the gate bridge');
  assert.ok(AY.canalSpot(10, -78).d < 1 && AY.pondSpot(10, -90, () => 0.5, 24));
  assert.ok(AY.bridgeTrack(10, -78, () => 0.5) && AY.streetTrack(10, -70, () => 0.5));
  const s0 = S.find((s) => s.use === 'shop');
  assert.equal(AY.roomAt(s0.at[0], s0.at[1], 0.4).same, s0.id);
  assert.equal(AY.roomAt(10, -100, 0), null, 'the forecourt is the open');
  assert.equal(AY.roomAt(78, -140, 1.3).use, 'hall', 'the royal wihan is a hall');
  { let q = 7; const rnd = () => ((q = (q * 16807) % 2147483647) / 2147483647); assert.ok(AY.treeSpot(10, -60, rnd, 40), 'a tree among the houses'); }
  assert.equal(AY.WELLS.length, 0);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'mortar', 'abacus', 'coin', 'sack', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('ayutthaya').animals;
  const put = () => m.place({ voices: { tropic: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Ayutthaya placed: the wat\'s gong at dawn and at dusk, not at night, quieter schedule in the rain', () => {
  const g = AY.TEMPLE.gong;
  assert.ok(listen({ x: g[0], z: g[1] + 20, hour: 4.8, secs: 600 }).calls.ayGong > 0, 'dawn gong');
  assert.ok(!listen({ x: g[0], z: g[1] + 20, hour: 1.5, secs: 400 }).calls.ayGong, 'none at night');
  assert.ok(!listen({ x: g[0], z: g[1] + 20, hour: 13, secs: 400 }).calls.ayGong, 'none at midday');
});

test('Ayutthaya placed: the market\'s cries by day, the geckos by night', () => {
  const mk = [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2];
  assert.ok(listen({ x: mk[0], z: mk[1], hour: 8, secs: 400 }).calls.ayCry > 0, 'cries');
  assert.ok(!listen({ x: mk[0], z: mk[1], hour: 22, secs: 300 }).calls.ayCry, 'none at night');
  const h = AY.sites().find((s) => s.use === 'house');
  assert.ok(listen({ x: h.at[0], z: h.at[1] + 6, hour: 23, secs: 900 }).calls.ayTokay > 0, 'the tokay in the thatch at night');
});

test('Ayutthaya placed: a shopkeeper\'s noises and a house\'s kitchen', () => {
  const s = AY.sites().find((q) => q.use === 'shop' && q.work.some((w) => w[0] === 'abacus'));
  assert.ok(s, 'a Chinese store on the walk');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.4, hour: 10, indoors: true, secs: 600 });
  assert.ok(r.calls.abacus > 0, 'the abacus');
  assert.ok(!listen({ x: s.at[0], z: s.at[1], y: 0.4, hour: 2, indoors: true, secs: 300 }).calls.abacus, 'nothing at night');
});
