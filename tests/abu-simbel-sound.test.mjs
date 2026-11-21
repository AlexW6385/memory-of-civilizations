// Abu Simbel's sounds (docs/settlements/abu-simbel.md §20): the map of src/settlements/abu-simbel/soundmap.js, the voices of src/engine/voices-abu-simbel.js. Fast: data, schedule, a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { ABU_VOICES } from '../src/engine/voices-abu-simbel.js';
import * as GZ from '../src/settlements/abu-simbel/soundmap.js';
import { QUAY, FX } from '../src/settlements/abu-simbel/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = Object.keys(ABU_VOICES);

test('Abu Simbel has a placed map and no bells or call to prayer', () => {
  const P = profileOf('abu-simbel'), L = P.animals[LIFE];
  assert.ok(L && L.map === GZ);
  assert.equal(P.bells, null); assert.equal(P.adhan, 0);
  let prev = null; const ev = [];
  for (let m = 0; m <= 24 * 60; m += 0.5) { const now = { hour: (m / 60) % 24, el: 0, lat: 22 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0);
});

test('Abu Simbel: its voices are prefixed, owned and can be made', () => {
  for (const v of NEW) { assert.ok(v.startsWith('abu'), v); assert.equal(VOICE_OWNER.get(v), 'voices-abu-simbel.js', v); }
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('abu-simbel').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 12 }) > 0.5, v);
});

test('the map: sites, rooms, emitters by hour', () => {
  const S = GZ.sites();
  assert.ok(S.length > 60 && new Set(S.map((s) => s.id)).size === S.length);
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  assert.ok(S.some((s) => s.use === 'bakery') && S.some((s) => s.use === 'house') && S.some((s) => s.use === 'shop') && S.some((s) => s.use === 'chapel'));
  const b = S.find((s) => s.use === 'bakery');
  assert.equal(GZ.roomAt(...b.at).use, 'bakery');
  assert.equal(GZ.roomAt(0, 0), null);
  assert.equal(GZ.roomAt(FX - 30, 0).use, 'hall');
  for (const e of GZ.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.hours.length === 2 && e.r50 > 0, e.voice);
  const hrs = (v) => GZ.EMITTERS.filter((e) => e.voice === v).map((e) => e.hours);
  assert.ok(hrs('abuChisel').every(([a, z]) => a >= 5 && z <= 18), 'stone work by day');
  assert.ok(hrs('thbJackal').every(([a, z]) => a >= 19 && z <= 5), 'jackals by night');
  assert.ok(hrs('thbChant').some(([a]) => a < 7) && hrs('thbChant').some(([a]) => a > 17), 'the chant at first light and at dusk');
  const y = GZ.EMITTERS.find((e) => e.voice === 'abuChisel').at;
  assert.ok(y[0] > GZ.YARD[0] && y[0] < GZ.YARD[2] && y[1] > GZ.YARD[1] && y[1] < GZ.YARD[3], 'the chisels are in the masons\' yard');
  assert.ok(GZ.canalSpot(QUAY[2] - 2, 0) && !GZ.canalSpot(-20, 0) && GZ.pondSpot(80, 0, Math.random) && !GZ.pondSpot(-20, 0, Math.random));
  assert.ok(GZ.townNear(-14, 40) > 0.9 && GZ.townNear(-120, 0) < 0.2);
});
