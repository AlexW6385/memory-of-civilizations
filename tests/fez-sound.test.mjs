// Marinid Fez's sounds (docs/settlements/fez.md §16): the placed map and the Fez voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { FEZ_VOICES } from '../src/engine/voices-fez.js';
import * as FZ from '../src/settlements/fez/soundmap.js';
import { SITES, K } from '../src/settlements/fez/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('Fez: the profile carries the map; nothing of Suzhou is asked of the lanes', () => {
  const L = profileOf('fez').animals[LIFE];
  assert.equal(L.map, FZ);
  assert.equal(FZ.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.equal(FZ.canalTrack(0, 0, () => 0.5), null);
  assert.ok(FZ.TRACKS.every((t) => t.voice.startsWith('fez') || t.voice === 'patrolSteps'));
  assert.equal(profileOf('fez').adhan, 1);
});

test('Fez: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('fez').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of Object.keys(FEZ_VOICES)) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...FZ.EMITTERS.map((e) => e.voice), ...FZ.TRACKS.map((t) => t.voice)]);
  for (const s of FZ.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(FZ.ROOMS), FZ.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('Fez: emitters are well formed, in their hours; no bells, no church, no coffee', () => {
  for (const e of FZ.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 330, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const night = (v) => FZ.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 22 || e.hours[1] <= 5);
  assert.ok(night('catCry') && night('dogFar'));
  const by = (v) => FZ.EMITTERS.filter((e) => e.voice === v);
  assert.ok(by('fezRabab').every((e) => e.hours[0] >= 19), 'the rebab at evening');
  assert.ok(by('copperBeat').every((e) => e.hours[0] >= 7 && e.hours[1] <= 18), 'the coppersmiths by day');
  assert.ok(by('fezWeir').length >= 4 && by('fezWash').length > 3, 'the river and its wash-places');
  assert.ok(by('fezSwift').every((e) => e.hours[0] >= 16), 'swifts at dusk');
  assert.ok(!Object.keys(FEZ_VOICES).some((k) => /coffee|bell|church/i.test(k)) && !FZ.EMITTERS.some((e) => /coffee|bell/i.test(e.voice)), 'no coffee house, no church bells');
  // every voice is distinct: the calls of the hawkers and the services' own
  assert.ok(new Set(Object.keys(FEZ_VOICES)).size === Object.keys(FEZ_VOICES).length);
});

test('Fez: rooms, lanes, town, the river', () => {
  const rnd = () => 0.4;
  for (const s of FZ.sites()) { assert.ok(FZ.ROOMS[s.use], s.use); assert.ok(FZ.roomAt(...s.at, 0.3), s.id); }
  const q = SITES.qar;
  assert.equal(FZ.roomAt((q[0] + q[2]) / 2, q[3] - 8, 0).use, 'hall');
  assert.equal(FZ.roomAt(-132.5, -4, 0), null, 'the madrasa court is the open');
  assert.equal(FZ.roomAt(80, K.z, 0).use, 'souk');
  for (const r of [...Object.values(FZ.ROOMS), FZ.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const t = FZ.TRACKS[2].get(-60, K.z, rnd);
  assert.ok(t && t.pts.length === 2, 'a hawker along the Talaa Kebira');
  assert.ok(FZ.townNear(80, K.z) > FZ.townNear(-300, 200));
  assert.equal(FZ.treeSpot(0, 0, rnd), null);
  const c = FZ.canalSpot(0, 60);
  assert.ok(c && c.d > 0 && c.d < 80, 'the river is found from the Talaa Seghira');
  assert.ok(FZ.bridgeTrack(56, 90, rnd) && !FZ.bridgeTrack(-300, -300, rnd));
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(FEZ_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'copperBeat', 'recite', 'patrolSteps', 'catCry', 'donkeyBray', 'ottFountain']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('fez').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Fez placed: the Seffarine and the river by day, the tannery, dusk, night', () => {
  let c = listen({ x: 100, z: 38, hour: 10, secs: 300 });
  assert.ok(c.copperBeat > 0, `the coppersmiths (${c.copperBeat})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: 56, z: 100, hour: 11, secs: 200 });
  assert.ok(c.fezWeir > 0, `the river's weir (${c.fezWeir})`);
  c = listen({ x: 240, z: 75, hour: 10, secs: 200 });
  assert.ok(c.fezTannery > 0, `the tannery (${c.fezTannery})`);
  c = listen({ x: 160, z: -10, hour: 17.8, secs: 200 });
  assert.ok(c.fezSwift > 0, `swifts at dusk (${c.fezSwift})`);
  c = listen({ x: 100, z: 38, hour: 11, rain: 0.9, secs: 200 });
  assert.ok(!c.copperBeat && !c.fezHawk, 'nothing worked in heavy rain');
  c = listen({ x: 100, z: 38, hour: 1, secs: 300 });
  assert.ok(!c.copperBeat && !c.fezHawk && !c.fezTannery, 'the lanes are quiet at night');
});
