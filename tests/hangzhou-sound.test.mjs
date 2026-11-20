// Hangzhou's sounds: the map's data and hours, and a smoke test of its voices against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import * as HZ from '../src/settlements/song-hangzhou/soundmap.js';
import { HZ_VOICES } from '../src/engine/voices-hangzhou.js';

test('Hangzhou has a sound map with its water, markets and rooms', () => {
  const P = profileOf('song-hangzhou'), L = P.animals[LIFE];
  assert.ok(L.map, 'map');
  assert.ok(L.canal && L.hawkers && L.market && L.teahouse);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'rooster']);
  assert.ok(HZ.sites().length > 5 && HZ.teaHouses().length >= 3 && HZ.wineHouses().length >= 1 && HZ.WELLS.length > 3);
  for (const e of HZ.EMITTERS) assert.ok(VOICES[e.voice] || e.voice === 'xiao', e.voice);
  for (const t of HZ.TRACKS) assert.ok(VOICES[t.voice], t.voice);
  assert.ok(Object.keys(HZ_VOICES).every((k) => k.startsWith('hz')));
});

test('Hangzhou: the places and tracks lie where they should', () => {
  const r = () => 0.4;
  assert.ok(HZ.canalSpot(144, -50).d < 1 && HZ.canalTrack(144, -50, r));
  const st = HZ.streetTrack(28, -100, r); assert.ok(st && st.pts.length === 2);
  assert.ok(HZ.roomAt(-110, 10)?.use === 'temple' && HZ.roomAt(28, -100) === null);
  const tea = HZ.teaHouses()[0], rm = HZ.roomAt((tea.rect[0] + tea.rect[2]) / 2, (tea.rect[1] + tea.rect[3]) / 2);
  assert.equal(rm.use, 'tea');
  assert.ok(HZ.townNear(28, -100) > HZ.townNear(-200, -400));
  // the temple's bell sounds once at dawn and once at dusk
  const hours = HZ.EMITTERS.filter((e) => e.voice === 'hzTempleBell').map((e) => e.hours[0]);
  assert.deepEqual(hours, [4.7, 18.2]);
  assert.ok(HZ.TRACKS.find((t) => t.key === 'night').ok(22, 0) && !HZ.TRACKS.find((t) => t.key === 'night').ok(12, 0));
  void due;
});

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

test('Hangzhou: every voice can be made', () => {
  const { ctx, count } = fake();
  const m = Object.create(Music.prototype);
  m.ctx = ctx; m.cues = []; m.noiseBuf = ctx.createBuffer(1, 8000); m.wind = 0.3; m.seasonDoy = () => 270;
  const bus = ctx.createGain();
  for (const k of Object.keys(HZ_VOICES)) {
    const d = HZ_VOICES[k].call(m, 100, bus, 1, { dur: 14 });
    assert.ok(d > 0 && Number.isFinite(d), k);
  }
  assert.ok(m.cues.length > 40 && count() >= 0);
});
