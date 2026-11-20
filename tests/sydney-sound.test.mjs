// Sydney's sounds (docs/settlements/sydney.md §14): the placed map (src/settlements/sydney/soundmap.js) and the voices
// (src/engine/voices-sydney.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { SYD_VOICES } from '../src/engine/voices-sydney.js';
import * as SY from '../src/settlements/sydney/soundmap.js';
import { lots, height, OPERA } from '../src/settlements/sydney/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const P = profileOf('sydney'), L = P.animals[LIFE];
  assert.equal(L.map, SY);
  assert.ok(L.market > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('sydney').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(SYD_VOICES)) {
    assert.ok(v.startsWith('syd'), v);
    assert.equal(typeof m[v], 'function', v);
    if (v === 'sydPlaced') continue;
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...SY.EMITTERS.map((e) => e.voice), ...SY.TRACKS.map((t) => t.voice)]);
  for (const s of SY.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(SY.ROOMS), SY.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters sane and by hour, rooms found, the city never silent', () => {
  for (const e of SY.EMITTERS) assert.ok(Math.hypot(...e.at) < 520 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice);
  const shops = SY.sites().filter((s) => s.use !== 'terrace' && s.use !== 'concert' && s.use !== 'theatre');
  assert.ok(shops.length >= 12, 'the shops one can enter make their sounds: ' + shops.length);
  assert.ok(SY.sites().filter((s) => s.use === 'terrace').length >= 4);
  // the didgeridoo is the forecourt's, by day; the halls tune in the evening and the matinee; the trains and ferries run from early to late
  const at = (v) => SY.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('sydDidgeridoo').every((e) => e.hours[0] >= 8 && e.hours[1] <= 20));
  assert.ok(at('sydTuning').some((e) => e.hours[0] >= 18) && at('sydTuning').some((e) => e.hours[0] >= 12 && e.hours[1] <= 14));
  assert.ok(at('sydTrain').some((e) => e.hours[0] <= 5 && e.hours[1] >= 24) && at('sydFerryHorn').length === 4);
  // the first sound-making shop is found by its door's lot, and the arrival is in the open
  const s0 = SY.sites().find((s) => s.use === 'pub');
  assert.equal(SY.roomAt(s0.at[0], s0.at[1], s0.y + 1).use, 'pub');
  assert.equal(SY.roomAt(s0.at[0], s0.at[1], s0.y + 30), null, 'high above it, nothing (no open floor)');
  assert.equal(SY.roomAt(...SY.HOME, 0), null, 'the arrival is in the open');
  const hall = SY.HALLS[0], hm = [(hall.rect[0] + hall.rect[2]) / 2, (hall.rect[1] + hall.rect[3]) / 2];
  assert.equal(SY.roomAt(hm[0], hm[1], height(100, -190) + OPERA.h + 0.2)?.use, 'concert', 'inside the Concert Hall');
  assert.equal(SY.roomAt(hm[0], hm[1], 0), null, 'not under it');
  SY.clock.hour = 3; assert.ok(SY.townNear(0, 100) > 0, 'never silent');
  SY.clock.hour = 13; assert.ok(SY.townNear(0, 100) > SY.townNear(...SY.HOME), 'the streets louder than the Point');
  const rnd = () => 0.4;
  assert.ok(SY.TRACKS.find((t) => t.key === 'cars').get(-110, 100, rnd)?.pts.length === 2, 'a car on a street');
  assert.equal(SY.TRACKS.find((t) => t.key === 'bridge').get(400, 300, rnd), null, 'the Bridge is not heard from far inland');
  assert.ok(SY.TRACKS.find((t) => t.key === 'bridge').get(-150, -50, rnd)?.pts.length === 2);
  assert.equal(SY.treeSpot(300, 50, rnd, 40), null, 'no Chinese seasonal birds');
  assert.ok(SY.treeSpot(300, 50, rnd, 36), 'a tree in the Garden for a cicada');
  assert.ok(SY.shoreSpot(...SY.HOME, rnd) !== undefined);
  void lots;
});

test('placed: the quay and the streets by day, the Garden by day, a quieter night', () => {
  const run = (hour, x, z) => {
    const { m, ctx } = music();
    m.doyOverride = 290; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(SYD_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('sydney').animals;
    const put = () => m.place({ voices: { gull: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x, z, y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 240 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const quay = run(10, -10, -10), garden = run(10, 270, 40);
  assert.ok((quay.sydFerryHorn || 0) + (quay.sydTrain || 0) + (quay.sydFerry || 0) + (quay.sydTraffic || 0) + (quay.sydGull || 0) > 0, JSON.stringify(quay));
  assert.ok((garden.sydMagpie || 0) + (garden.sydCockatoo || 0) + (garden.sydLorikeet || 0) > 0, JSON.stringify(garden));
  const night = run(2, -10, -10);
  assert.ok(!(night.sydCockatoo || night.sydMagpie || night.sydDidgeridoo), 'no birdsong or busker at 2 am: ' + JSON.stringify(night));
});
