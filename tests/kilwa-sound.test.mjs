// Kilwa' placed sounds (src/settlements/kilwa/soundmap.js, src/engine/voices-kilwa.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as KW from '../src/settlements/kilwa/soundmap.js';
import { lots, isOpen } from '../src/settlements/kilwa/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['kwNgoma', 'kwZumari', 'kwLute', 'kwRecite', 'kwMortar', 'kwAdze', 'kwShanty', 'kwSurf'];
const mk = () => { const { ctx } = fake(); const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, m }; };

test('Kilwa: the profile carries the map', () => {
  assert.ok(profileOf('kilwa').animals[LIFE].map === KW);
});

test('Kilwa: every voice exists and can be made', () => {
  const { ctx, m } = mk();
  m.place({ voices: {}, animals: profileOf('kilwa').animals, roof: 'flat', at: { x: -10, z: 32, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
  for (const e of KW.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const s of KW.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
});

test('Kilwa: the map agrees with the settlement', () => {
  const open = lots().filter(isOpen).length;
  assert.ok(KW.sites().length > 30 && KW.sites().length <= open + 1, `${KW.sites().length} sites`);
  for (const s of KW.sites()) { assert.ok(s.work.length); assert.ok(KW.ROOMS[s.use], s.use); }
  for (const r of Object.values(KW.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(KW.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0));
  assert.equal(KW.canalTrack(0, 0, () => 0.5), null);
  assert.ok(KW.townNear(-45, -40) > 0.9 && KW.townNear(300, 100) < 0.3);
  const s0 = KW.sites()[0];
  assert.equal(KW.roomAt(s0.at[0], s0.at[1], s0.y + 0.5).same, s0.id);
  assert.equal(KW.roomAt(-30, -84, 0), null, 'the market street is the open');
  assert.ok(KW.shoreSpot(-40, -125, () => 0.5)); assert.equal(KW.shoreSpot(0, 200, () => 0.5), null);
});

function listen({ x, z, y = 0, hour, doy = 60, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'kitchen', 'jarLid', 'coin', 'clay', 'pour']) { const o = m[v]; if (!o) continue; m[v] = function (...a) { const r = o.apply(this, a); calls[v] = (calls[v] || 0) + 1; return r; }; }
  const L = profileOf('kilwa').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Kilwa placed: the surf is heard at the beach, all day', () => {
  assert.ok(listen({ x: -40, z: -128, hour: 12, secs: 120 }).calls.kwSurf > 0);
});
test('Kilwa placed: the drum before the mosque in the evening, not at night or in rain', () => {
  const x = -24, z = -15;
  assert.ok(listen({ x, z, hour: 18.5, secs: 600 }).calls.kwNgoma > 0);
  assert.ok(!listen({ x, z, hour: 3, secs: 300 }).calls.kwNgoma);
  assert.ok(!listen({ x, z, hour: 18.5, rain: 0.9, secs: 300 }).calls.kwNgoma);
});
test('Kilwa placed: the shipwright works by day only', () => {
  const x = -150, z = -120 - 15 * Math.sin(-150 / 60) + 12;
  assert.ok(listen({ x, z, hour: 10, secs: 600 }).calls.kwAdze > 0);
  assert.ok(!listen({ x, z, hour: 2, secs: 300 }).calls.kwAdze);
});
test('Kilwa placed: rooms', () => {
  const s = KW.sites().find((q) => q.use === 'hall');
  assert.equal(listen({ x: s.at[0], z: s.at[1], y: s.y + 0.5, hour: 11, indoors: true, secs: 60 }).m.plc.room.use, 'hall');
});
