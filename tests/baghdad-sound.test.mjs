// Abbasid Baghdad's sounds (docs/settlements/abbasid-baghdad.md §16): the placed map and the bag voices, against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { BAGHDAD_VOICES } from '../src/engine/voices-baghdad.js';
import * as BG from '../src/settlements/abbasid-baghdad/soundmap.js';
import { C, ALL_SUQS, RIVER, riverX, CANAL, WORKSHOPS } from '../src/settlements/abbasid-baghdad/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('Baghdad: the profile carries the map; nothing of Suzhou is asked of the streets', () => {
  const P = profileOf('abbasid-baghdad'), L = P.animals[LIFE];
  assert.equal(L.map, BG);
  assert.equal(P.adhan, 1);
  assert.equal(BG.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(BG.TRACKS.every((t) => t.voice.startsWith('bag') || t.voice === 'patrolSteps'));
});

test('Baghdad: every voice named by the map exists, can be made and lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('abbasid-baghdad').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [30, 0]], 1);
  for (const v of Object.keys(BAGHDAD_VOICES)) {
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 90), `${v} lasts ${d}`);
  }
  const names = new Set([...BG.EMITTERS.map((e) => e.voice), ...BG.TRACKS.map((t) => t.voice)]);
  for (const s of BG.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(BG.ROOMS), BG.UPPER]) for (const [v] of R.work || []) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
  assert.ok(Object.keys(BAGHDAD_VOICES).every((k) => k.startsWith('bag')));
});

test('Baghdad: emitters are well formed, in their hours; no bells, no coffee, no minaret band', () => {
  for (const e of BG.EMITTERS) {
    assert.ok(Math.hypot(e.at[0], e.at[1]) < 560, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  const night = (v) => BG.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 22 || e.hours[1] <= 5);
  assert.ok(night('catCry') && night('dogFar'));
  assert.ok(BG.EMITTERS.filter((e) => e.voice === 'bagOud').every((e) => e.hours[0] >= 18.5), 'the oud is an evening sound');
  assert.ok(BG.EMITTERS.filter((e) => ['copperBeat', 'bagPen', 'mortar'].includes(e.voice)).every((e) => e.hours[0] >= 6 && e.hours[1] <= 19), 'the work is done by day');
  assert.ok(!Object.keys(BAGHDAD_VOICES).some((k) => /bell|coffee|minaret/i.test(k)));
  assert.equal(profileOf('abbasid-baghdad').bells, null);
});

test('Baghdad: rooms, waters, streets, town', () => {
  for (const s of BG.sites()) { assert.ok(BG.ROOMS[s.use], s.use); assert.ok(BG.roomAt(...s.at, 0.3), s.id); }
  assert.equal(BG.roomAt(...BG.CHAMBER.slice(0, 2).map((v, i) => v + 2 + i * 0), 0.4).use, 'chamber');
  assert.equal(BG.roomAt(C[0], C[1] + 40, 0), null, 'the esplanade is the open');
  const w = BG.canalSpot(riverX(0) + 70, 0);
  assert.ok(w.i === 0 && Math.abs(w.d - 20) < 0.5, 'the river bank 20 m off');
  assert.equal(BG.canalSpot(-200, CANAL.z).d, 0, 'in the canal');
  const rnd = () => 0.4;
  assert.ok(BG.TRACKS[0].get(C[0], C[1] + 100, rnd), 'a vendor on the road');
  assert.ok(BG.canalTrack(riverX(0) + 40, 0, rnd), 'a boat on the Tigris');
  assert.equal(BG.canalTrack(-300, 400, rnd), null, 'no boat far from the river');
  assert.ok(BG.bridgeTrack(riverX(C[1]), C[1], rnd).pts.length === 2);
  assert.ok(BG.townNear((ALL_SUQS[0].rect[0] + ALL_SUQS[0].rect[2]) / 2, ALL_SUQS[0].rect[1] + 10) > BG.townNear(-400, -380));
  assert.equal(BG.treeSpot(0, 0, rnd), null);
  assert.ok(WORKSHOPS.length && RIVER.w);
});

function listen({ x, z, y = 0, hour, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = 40; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(BAGHDAD_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'qin', 'xiao', 'teaTalk', 'copperBeat', 'recite', 'patrolSteps', 'catCry', 'donkeyBray', 'mortar', 'pigeons']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('abbasid-baghdad').animals, roof: 'flat', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return calls;
}

test('Baghdad placed: the paper suq by day, the bridge of boats, night', () => {
  const s = ALL_SUQS[0].rect;
  let c = listen({ x: (s[0] + s[2]) / 2, z: s[1] + 12, hour: 10, secs: 500 });
  assert.ok(c.bagPen > 0, `the paper-sellers' pens (${c.bagPen})`);
  assert.ok(!c.vendor && !c.watchman && !c.sedan && !c.boat && !c.qin, 'nothing of Suzhou');
  c = listen({ x: riverX(C[1]) - 30, z: C[1], hour: 11, secs: 300 });
  assert.ok(c.bagBridge > 0, `the bridge of boats (${c.bagBridge})`);
  c = listen({ x: (s[0] + s[2]) / 2, z: s[1] + 12, hour: 11, rain: 0.9, secs: 200 });
  assert.ok(!c.bagHawk, 'no cries in heavy rain');
  c = listen({ x: (s[0] + s[2]) / 2, z: s[1] + 12, hour: 1, secs: 400 });
  assert.ok(!c.bagPen && !c.copperBeat && !c.bagHawk, 'the market is quiet at night');
});
