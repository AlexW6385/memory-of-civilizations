// Borobudur's placed sounds (src/settlements/borobudur/soundmap.js, src/engine/voices-borobudur.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as BO from '../src/settlements/borobudur/soundmap.js';
import { houses } from '../src/settlements/borobudur/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['borGamelan', 'borGong', 'borFlute', 'borDrum', 'borChant', 'borBell', 'borConch', 'borLesung', 'borClapper', 'borBuffaloBell', 'borGecko', 'borKoel', 'borSeller', 'borTrickle'];

test('Borobudur: the profile carries the map', () => {
  assert.ok(profileOf('borobudur').animals[LIFE].map === BO);
});

test('Borobudur: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('borobudur').animals, roof: 'thatch', at: { x: 110, z: 0, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  assert.ok(m.borCart(ctx.currentTime, bus, 1, { dur: 10 }) > 0);
});

test('Borobudur: the map agrees with the settlement', () => {
  const open = houses().filter((h) => h.interior);
  assert.ok(BO.sites().length >= open.length && BO.sites().length > 30, `${BO.sites().length} sites`);
  for (const s of BO.sites()) { assert.ok(s.work.length); assert.ok(BO.ROOMS[s.use], s.use); }
  for (const k of ['hearth', 'loom', 'shrine', 'smith']) assert.ok(BO.sites().some((s) => s.use === k), k);
  for (const r of Object.values(BO.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(BO.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const e of BO.EMITTERS) assert.ok(NEW.includes(e.voice) || ['owl'].includes(e.voice), e.voice);
  assert.ok(BO.townNear(120, 0) > 0.9 && BO.townNear(-250, 250) < 0.2);
  const s0 = BO.sites().find((s) => s.id.startsWith('house:'));
  assert.equal(BO.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(BO.roomAt(s0.at[0], s0.at[1], 0.2), null, 'under the raised floor is the open');
  assert.equal(BO.roomAt(150, 0, 0), null);
  assert.equal(BO.canalTrack(0, 0, () => 0.5), null);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'borCart', 'loom', 'hammer', 'kitchen', 'owl', 'vendor', 'sedan', 'boat']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('borobudur').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'thatch', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Borobudur placed: the offices at dawn, not at noon', () => {
  assert.ok(listen({ x: 70, z: 0, hour: 5.6, secs: 600 }).calls.borConch > 0, 'the conch at dawn');
  assert.ok(!listen({ x: 70, z: 0, hour: 12, secs: 300 }).calls.borConch, 'not at noon');
});

test('Borobudur placed: the village hall plays in the evening, not in rain', () => {
  const [hx, hz] = [230, -60];
  assert.ok(listen({ x: hx + 8, z: hz, hour: 19, secs: 900 }).calls.borGamelan > 0);
  assert.ok(!listen({ x: hx + 8, z: hz, hour: 19, rain: 0.9, secs: 300 }).calls.borGamelan, 'not in rain');
});

test('Borobudur placed: geckos in the houses at night, none of Suzhou\'s walkers', () => {
  const s = BO.sites().find((q) => q.work.some((w) => w[0] === 'borGecko'));
  const r = listen({ x: s.at[0], z: s.at[1] + 6, hour: 22, secs: 900 });
  assert.ok(r.calls.borGecko > 0, 'the gecko');
  assert.ok(!r.calls.vendor && !r.calls.sedan && !r.calls.boat);
});

test('Borobudur placed: rooms', () => {
  const s = BO.sites().find((q) => q.use === 'hearth');
  assert.equal(listen({ x: s.at[0], z: s.at[1], y: s.y + 0.5, hour: 11, indoors: true, secs: 100 }).m.plc.room.use, 'hearth');
});
