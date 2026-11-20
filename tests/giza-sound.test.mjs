// Giza's sounds (docs/settlements/giza.md §20): the map of src/settlements/giza/soundmap.js, the voices of src/engine/voices-giza.js. Fast: data, schedule, a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { GIZA_VOICES } from '../src/engine/voices-giza.js';
import * as GZ from '../src/settlements/giza/soundmap.js';
import { TEMPLE, QUARRY } from '../src/settlements/giza/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = Object.keys(GIZA_VOICES);

test('Giza has a placed map and no bells or call to prayer', () => {
  const P = profileOf('giza'), L = P.animals[LIFE];
  assert.ok(L && L.map === GZ);
  assert.equal(P.bells, null); assert.equal(P.adhan, 0);
  let prev = null; const ev = [];
  for (let m = 0; m <= 24 * 60; m += 0.5) { const now = { hour: (m / 60) % 24, el: 0, lat: 30 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0);
});

test('Giza: its voices are prefixed, owned and can be made', () => {
  for (const v of NEW) { assert.ok(v.startsWith('giz'), v); assert.equal(VOICE_OWNER.get(v), 'voices-giza.js', v); }
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('giza').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 12 }) > 0.5, v);
});

test('the map: sites, rooms, emitters by hour', () => {
  const S = GZ.sites();
  assert.ok(S.length > 100 && new Set(S.map((s) => s.id)).size === S.length);
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  assert.ok(S.some((s) => s.use === 'bakery') && S.some((s) => s.use === 'house') && S.some((s) => s.use === 'gallery'));
  const b = S.find((s) => s.use === 'bakery');
  assert.equal(GZ.roomAt(...b.at).use, 'bakery');
  assert.equal(GZ.roomAt(0, 0), null);
  assert.equal(GZ.roomAt((TEMPLE[0] + TEMPLE[2]) / 2, (TEMPLE[1] + TEMPLE[3]) / 2).use, 'hall');
  for (const e of GZ.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.hours.length === 2 && e.r50 > 0, e.voice);
  const hrs = (v) => GZ.EMITTERS.filter((e) => e.voice === v).map((e) => e.hours);
  assert.ok(hrs('gizPounder').every(([a, z]) => a >= 5 && z <= 18), 'stone work by day');
  assert.ok(hrs('thbJackal').every(([a, z]) => a >= 19 && z <= 5), 'jackals by night');
  const q = GZ.EMITTERS.find((e) => e.voice === 'gizPounder').at;
  assert.ok(q[0] > QUARRY[0] && q[0] < QUARRY[2] && q[1] > QUARRY[1] && q[1] < QUARRY[3], 'the pounders are in the quarry');
  assert.ok(GZ.canalSpot(350, 50) && !GZ.canalSpot(0, 0) && GZ.pondSpot(360, 50, Math.random) && !GZ.pondSpot(0, 0, Math.random));
});
