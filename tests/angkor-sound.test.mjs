// Angkor's sounds (docs/settlements/angkor.md §33): the map of src/settlements/angkor/soundmap.js, the voices of src/engine/voices-angkor.js, and a smoke test of
// the synthesis against a stand-in audio context (every node a recorder). Fast: the map's data, the schedule and a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { ANGKOR_VOICES, AK_CRIES } from '../src/engine/voices-angkor.js';
import * as AK from '../src/settlements/angkor/soundmap.js';
import { CX, MARKET } from '../src/settlements/angkor/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = Object.keys(ANGKOR_VOICES), NOTES = ['akHarpNote'];

test('Angkor: its map rides on the profile, the voices are its own and can be made', () => {
  const P = profileOf('angkor'), L = P.animals[LIFE];
  assert.ok(L && L.map === AK && L.market > 0);
  for (const v of NEW) { assert.equal(VOICE_OWNER.get(v), 'voices-angkor.js', v); assert.ok(v.startsWith('ak'), v); assert.equal(VOICES[v], ANGKOR_VOICES[v]); }
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: P.animals, roof: 'thatch' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW.filter((k) => !NOTES.includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1, { dur: 12 }) > 0.5, v);
  const c = Object.values(AK_CRIES).map((x) => x.map((n) => n[0] + n[2]).join(','));
  assert.equal(new Set(c).size, c.length, 'every cry has its own contour');
});

test('the map: houses, workshops, rooms, water, the schedule', () => {
  const S = AK.sites();
  assert.ok(S.length > 200 && new Set(S.map((s) => s.id)).size === S.length);
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  for (const s of S) assert.ok(AK.ROOMS[s.use], `a room kind for ${s.use}`);
  for (const r of [...Object.values(AK.ROOMS), AK.UPPER]) for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v);
  const h = S.find((s) => s.use === 'house');
  assert.equal(AK.roomAt(...h.at, h.y + 0.5).use, 'house'); assert.equal(AK.roomAt(...h.at, 0), null, 'under the floor is the open');
  assert.equal(AK.roomAt(CX, 0, 21.5).use, 'sanctuary');
  assert.equal(AK.roomAt(...AK.HOME, 1), null);
  for (const e of AK.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every(Number.isFinite) && e.hours.length === 2, e.voice); }
  const at = (v) => AK.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('akConch').length >= 2 && at('akChant').length >= 3 && at('akHawk').every((e) => e.hours[0] === 6 && e.hours[1] === 12), 'the market 6 to 12');
  assert.ok(at('akGecko').every((e) => e.hours[0] > 18 && e.hours[1] < 6), 'geckos by night');
  assert.ok(AK.canalSpot(-178, 0).d < 6 && AK.canalSpot(0, 0) === null);
  assert.ok(AK.frogGround(-190, 60) > 0.5 && AK.frogGround(0, 0) < 0.2 + 1);
  assert.ok(AK.townNear(MARKET[0] + 5, MARKET[1] + 5) === 1 && AK.townNear(CX, 0) < 0.2);
  const t = AK.TRACKS[0].get(-190, 0, () => 0.3);
  assert.ok(t && t.pts.length === 2 && AK.TRACKS[0].get(0, 0, Math.random) === null);
  let q = 7; const rnd = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  assert.ok(AK.treeSpot(-250, 100, rnd) !== null);
});
