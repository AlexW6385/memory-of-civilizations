// Alexandria's sounds (docs/settlements/alexandria.md §16.3): the map of src/settlements/alexandria/soundmap.js, the voices of src/engine/voices-alexandria.js,
// and a smoke test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { ALEXANDRIA_VOICES } from '../src/engine/voices-alexandria.js';
import * as AX from '../src/settlements/alexandria/soundmap.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(ALEXANDRIA_VOICES).filter((k) => k !== 'alxOrganNote');
const music = (ctx) => { const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); m.place({ voices: {}, animals: profileOf('alexandria').animals, roof: 'flat' }); return m; };

test('Alexandria has the voices of its streets riding on the animals, and no bells or calls', () => {
  const P = profileOf('alexandria'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === AX);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster'], 'the life is not an animal');
  let n = 0, prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 31 }; n += due(P, prev, now).length; prev = now; }
  assert.equal(n, 0, 'no bell, no watchman, no call to prayer');
});

test('Alexandria: every voice exists and can be made', () => {
  const { ctx } = fake(), m = music(ctx), bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.equal(VOICES[v], ALEXANDRIA_VOICES[v], v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v); }
});

test('Alexandria: the long voices queue a few cues at a time', () => {
  const { ctx, count } = fake(), m = music(ctx), bus = m.src([5, 0], 8, { dur: 40 });
  ['alxHydraulis', 'alxKeleustes', 'alxCaulk', 'alxFire', 'alxSalpinx'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));
  assert.ok(m.cues.length > 30, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
});

test('the map: sites, rooms, emitters, the harbour water, the Pharos at night', () => {
  const S = AX.sites();
  assert.ok(S.length >= 40 && S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  const shop = S.find((s) => s.use === 'shop:bronze'), r = AX.roomAt(...shop.at, shop.y + 0.4);
  assert.ok(r && r.use === 'shop:bronze');
  assert.equal(AX.roomAt(246, -24, 1.4).use, 'library');
  assert.equal(AX.roomAt(100, -86, 1.2), null, 'the quay is the open');
  for (const r2 of [...Object.values(AX.ROOMS), AX.UPPER]) { assert.ok(r2.tone[0] > 100 && r2.hush > 0 && r2.hush <= 1); for (const [v] of r2.work) assert.equal(typeof VOICES[v], 'function', v); }
  for (const e of AX.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every(Number.isFinite) && e.hours.length === 2, e.voice);
  const fire = AX.EMITTERS.find((e) => e.voice === 'alxFire');
  assert.ok(fire.hours[0] > 12 && fire.hours[1] < 12, 'the fire is a night sound');
  assert.ok(AX.EMITTERS.some((e) => e.voice === 'alxHydraulis') && AX.EMITTERS.some((e) => e.voice === 'alxSistrum'));
  const w = AX.canalSpot(100, -86);
  assert.ok(w && w.d < 12, 'the sea is near the quay'); assert.equal(AX.canalSpot(0, 150), null, 'none in the town');
  assert.equal(AX.streetTrack(0, 0), null); assert.equal(AX.pondSpot(0, 0), null);
  assert.ok(AX.townNear(100, -86) === 1 && AX.townNear(0, 0) < 1 && AX.WELLS.length === 3);
});
