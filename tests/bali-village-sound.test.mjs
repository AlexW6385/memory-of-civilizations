// The Balinese village's placed sounds (src/settlements/bali-village/soundmap.js, src/engine/voices-bali.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as BV from '../src/settlements/bali-village/soundmap.js';
import { lots, KULKUL, WANTILAN } from '../src/settlements/bali-village/layout.js';
import { compoundParts } from '../src/styles/balinese/compound.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['balGamelan', 'balGong', 'balKulkul', 'balKulkulAlarm', 'balGenta', 'balCrowd', 'balLesung', 'balTokek', 'balSpout', 'balTrickle', 'balClatter', 'balBuffaloBell', 'balDuck', 'balSeller', 'balSuling'];
const ENGINE = ['loom', 'hammer', 'chisel', 'kitchen', 'wheel', 'clay', 'splitBamboo', 'broom', 'clothRustle', 'sack', 'bowlClack', 'pour'];

test('Bali: the profile carries the map', () => {
  assert.ok(profileOf('bali-village').animals[LIFE].map === BV);
});

test('Bali: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('bali-village').animals, roof: 'thatch', at: { x: 0, z: -26, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  for (const v of ['balBaleganjur', 'balCart']) assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 10 }) > 0, v);
});

test('Bali: the map agrees with the settlement', () => {
  // the frame read here is the compound's own
  for (const l of lots()) {
    const c = compoundParts({ rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF, shop: l.shop }), p = BV.partsOf(l);
    assert.equal(!!p.house, !!c.house, 'house ' + l.seed);
    if (c.house) { assert.deepEqual(p.house.rect.map((v) => +v.toFixed(6)), c.house.rect.map((v) => +v.toFixed(6))); assert.equal(p.house.door, c.house.door); }
  }
  const n = BV.sites().length;
  assert.ok(n > 40, `${n} sites`);
  for (const s of BV.sites()) { assert.ok(s.work.length); assert.ok(BV.ROOMS[s.use], s.use); for (const [v, gap, hours] of s.work) { assert.ok(NEW.includes(v) || ENGINE.includes(v), v); assert.equal(gap.length, 2); assert.equal(hours.length, 2); } }
  for (const k of ['sleep', 'weave', 'store', 'elder', 'kitchen', 'pavilion']) assert.ok(BV.sites().some((s) => s.use === k), k);
  for (const r of Object.values(BV.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(BV.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const e of BV.EMITTERS) assert.ok(NEW.includes(e.voice) || ENGINE.includes(e.voice), e.voice);
  for (const x of BV.TRACKS) assert.equal(typeof m0()[x.voice], 'function', x.voice);
  assert.ok(BV.townNear(0, -60) > 0.9 && BV.townNear(160, 120) < 0.2);
  const s0 = BV.sites().find((s) => s.id.startsWith('house:'));
  assert.equal(BV.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(BV.roomAt(s0.at[0], s0.at[1], 0.0), null, 'under the raised floor is the open');
  assert.equal(BV.roomAt(0, -50, 0), null);
  assert.equal(BV.roomAt(23, -4, 1.0).use, 'pavilion', 'in the wantilan');
  assert.equal(BV.canalTrack(0, 0, () => 0.5), null);
  assert.ok(BV.canalSpot(-3, 40).d < 3 && BV.canalSpot(100, 40) === null);
  const F = BV.fieldSpots();
  assert.ok(F.huts.length >= 3 && F.plough.length >= 2 && F.ducks.length >= 2, JSON.stringify([F.huts.length, F.plough.length, F.ducks.length]));
});
function m0() { return Music.prototype; }

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'balBaleganjur', 'balCart', ...ENGINE, 'vendor', 'sedan', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('bali-village').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Bali placed: the kulkul calls at dawn, not at noon... of the night', () => {
  assert.ok(listen({ x: KULKUL[0] + 8, z: KULKUL[1], hour: 5.8, secs: 400 }).calls.balKulkul > 0, 'the kulkul at dawn');
  assert.ok(!listen({ x: KULKUL[0] + 8, z: KULKUL[1], hour: 23, secs: 200 }).calls.balKulkul, 'not at night');
});

test('Bali placed: the banjar\'s gamelan in the evening, not in rain', () => {
  const wx = (WANTILAN[0] + WANTILAN[2]) / 2, wz = WANTILAN[3] + 6;
  assert.ok(listen({ x: wx, z: wz, hour: 19, secs: 900 }).calls.balGamelan > 0);
  assert.ok(!listen({ x: wx, z: wz, hour: 19, rain: 0.9, secs: 300 }).calls.balGamelan, 'not in rain');
});

test('Bali placed: geckos in the houses at night, none of Suzhou\'s walkers', () => {
  const s = BV.sites().find((q) => q.work.some((w) => w[0] === 'balTokek'));
  const r = listen({ x: s.at[0], z: s.at[1] + 5, hour: 22, secs: 900 });
  assert.ok(r.calls.balTokek > 0, 'the gecko');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.boat);
});

test('Bali placed: the smith hammers by day at his stall', () => {
  const s = BV.sites().find((q) => q.work.some((w) => w[0] === 'hammer'));
  assert.ok(listen({ x: s.at[0] + 3, z: s.at[1], hour: 10, secs: 400 }).calls.hammer > 0);
});

test('Bali placed: rooms', () => {
  const s = BV.sites().find((q) => q.use === 'kitchen');
  assert.equal(listen({ x: s.at[0], z: s.at[1], y: s.y + 0.5, hour: 7, indoors: true, secs: 100 }).m.plc.room.use, 'kitchen');
});
