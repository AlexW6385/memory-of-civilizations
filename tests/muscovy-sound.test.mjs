// Muscovy's sounds: the bells' hours in the map, the shops' work, and a smoke test of the synthesis against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { inHours } from '../src/engine/voices.js';
import { LIFE } from '../src/engine/soundscape.js';
import * as MS from '../src/settlements/muscovy/soundmap.js';
import { mosPickCry, MOS_VOICES } from '../src/engine/voices-muscovy.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};


test('Muscovy: bells before the liturgy and vespers, trezvon after the blagovest, chant inside', () => {
  const P = profileOf('muscovy'), L = P.animals[LIFE];
  assert.ok(L.map && L.market, 'the map is wired');
  assert.equal(P.bells, null, 'the engine\'s own bell schedule is off: the map rings');
  const em = (v) => MS.EMITTERS.filter((e) => e.voice === v);
  const bl = em('mosBlagovest'), tr = em('mosTrezvon');
  assert.equal(bl.length, 2); assert.equal(tr.length, 2);
  for (const [b, t] of [[bl[0], tr[0]], [bl[1], tr[1]]]) assert.ok(t.hours[0] >= b.hours[1] && t.hours[0] - b.hours[0] <= 0.6, 'the trezvon follows the blagovest');
  assert.ok(inHours(6.1, bl[0].hours) && !inHours(12, bl[0].hours));
  assert.ok(em('mosChant').every((e) => e.inside));
  assert.equal(MS.EMITTERS.filter((e) => e.voice === 'mosSmallBell').length, 12, 'six parish churches, morning and evening');
});

test('Muscovy: the opened shops of the rows make their trades heard and have rooms', () => {
  const S = MS.sites();
  assert.ok(S.length >= 40);
  for (const s of S) { assert.ok(s.work.length, s.use); assert.ok(MS.ROOMS[s.use], s.use); }
  assert.equal(MS.roomAt(S[0].at[0], S[0].at[1], 0)?.use, S[0].use);
  assert.equal(MS.roomAt(0, 0, 0), null);
  assert.equal(MS.streetTrack(), null, 'no Chinese walkers');
  assert.ok(MS.TRACKS.every((t) => typeof t.get === 'function' && t.gap[0] < t.gap[1]));
  assert.ok(mosPickCry(9, 0.3) && !mosPickCry(2, 0.3));
  assert.ok(MS.WELLS.length > 0);
});

test('Muscovy: every voice can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('muscovy').animals, roof: 'shingle' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  const f = m.along([[0, 0], [20, 0]], 1);
  for (const v of Object.keys(MOS_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.5, v);
});
