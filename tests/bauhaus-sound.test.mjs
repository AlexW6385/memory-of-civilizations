// Bauhaus Dessau's sounds (docs/settlements/bauhaus-dessau.md §15.3): the placed map (src/settlements/bauhaus-dessau/soundmap.js) and the voices
// (src/engine/voices-bauhaus.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { BAU_VOICES } from '../src/engine/voices-bauhaus.js';
import * as BD from '../src/settlements/bauhaus-dessau/soundmap.js';
import { TRAM_STOP } from '../src/settlements/bauhaus-dessau/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const L = profileOf('bauhaus-dessau').animals[LIFE];
  assert.equal(L.map, BD);
  assert.ok(L.market > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('bauhaus-dessau').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(BAU_VOICES)) {
    assert.ok(v.startsWith('bau'), v);
    assert.equal(typeof m[v], 'function', v);
    if (v === 'bauPlaced') continue;
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...BD.EMITTERS.map((e) => e.voice), ...BD.TRACKS.map((t) => t.voice)]);
  for (const s of BD.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(BD.ROOMS), BD.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
  for (const s of BD.sites()) assert.ok(BD.ROOMS[s.use], 'a room kind for ' + s.use);
});

test('the map: emitters sane and by hour, rooms found, the town never silent', () => {
  for (const e of BD.EMITTERS) assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice);
  const at = (v) => BD.EMITTERS.filter((e) => e.voice === v);
  // the works' siren at the changes of shift, the tram's gong from the first car to the last, the children after school
  assert.equal(at('bauSiren').length, 3);
  assert.ok(at('bauTramBell').every((e) => e.hours[0] <= 5.5 && e.hours[1] >= 23));
  assert.ok(at('bauChildren').every((e) => e.hours[0] >= 13 && e.hours[1] <= 19.5));
  // the school's rooms by floor: the loom on the first floor, the saw below it, the anvil above
  const k = BD.SCHOOL.find((s) => s.use === 'weaving'), [cx, cz] = [(k.rect[0] + k.rect[2]) / 2, (k.rect[1] + k.rect[3]) / 2];
  assert.equal(BD.roomAt(cx, cz, k.y + 1).use, 'weaving');
  assert.equal(BD.roomAt(cx, cz, k.y - 4.1 + 1).use, 'carpentry', 'below it');
  assert.equal(BD.roomAt(cx, cz, k.y + 4.1 + 1).use, 'metal', 'above it');
  assert.equal(BD.roomAt(...BD.HOME, 0), null, 'the arrival is in the open');
  const shops = BD.sites().filter((s) => !s.school && s.use !== 'flat');
  assert.ok(shops.length >= 8, 'the shops make their sounds: ' + shops.length);
  const s0 = shops[0];
  assert.equal(BD.roomAt(s0.at[0], s0.at[1], s0.y + 1).use, s0.use);
  BD.clock.hour = 3; assert.ok(BD.townNear(-30, 100) > 0, 'never silent');
  BD.clock.hour = 13; assert.ok(BD.townNear(-27, 100) > BD.townNear(100, 60), 'the streets louder than the grove');
  const rnd = () => 0.4;
  assert.ok(BD.TRACKS.find((t) => t.key === 'cars').get(-27, 100, rnd)?.pts.length === 2, 'a car on a street');
  const tram = BD.TRACKS.find((t) => t.key === 'tram').get(TRAM_STOP[0], -3, rnd);
  assert.ok(tram?.pts.length === 2 && Math.abs(tram.pts[0][1] - tram.pts[1][1]) < 1e-6, 'a tram runs along a track');
  assert.equal(BD.TRACKS.find((t) => t.key === 'tram').get(0, 300, rnd), null, 'not heard from far south of the line');
  assert.equal(BD.treeSpot(0, 0, rnd, 40), null, 'no Chinese seasonal birds');
});

test('placed: the street by day (tram, bicycles, bells), a quieter night', () => {
  const run = (hour, x, z) => {
    const { m, ctx } = music();
    m.doyOverride = 200; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(BAU_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('bauhaus-dessau').animals;
    const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x, z, y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 240 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const street = run(10, 40, -2);
  assert.ok((street.bauTram || 0) + (street.bauBicycle || 0) + (street.bauTramBell || 0) + (street.bauCar || 0) > 0, JSON.stringify(street));
  const night = run(2, 40, -2);
  assert.ok(!(night.bauChildren || night.bauBallGame || night.bauBicycle), 'no children, ball game or bicycles at 2 am: ' + JSON.stringify(night));
});
