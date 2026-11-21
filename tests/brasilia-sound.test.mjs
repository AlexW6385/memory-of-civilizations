// Brasília's sounds (docs/settlements/brasilia.md §14): the placed map (src/settlements/brasilia/soundmap.js) and the voices
// (src/engine/voices-brasilia.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { BRA_VOICES } from '../src/engine/voices-brasilia.js';
import * as BR from '../src/settlements/brasilia/soundmap.js';
import { GALLERY, STRIP, SCHOOL } from '../src/settlements/brasilia/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = () => { const ctx = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx }; };

test('profile: the map rides on the animals', () => {
  const P = profileOf('brasilia'), L = P.animals[LIFE];
  assert.equal(L.map, BR);
  assert.ok(L.market > 0);
});

test('every voice exists, can be made and lasts; every name the map uses exists', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('brasilia').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 8 }), f = m.along([[0, 0], [40, 0]], 1);
  for (const v of Object.keys(BRA_VOICES)) {
    assert.ok(v.startsWith('bra'), v);
    assert.equal(typeof m[v], 'function', v);
    if (v === 'braPlaced') continue;
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(typeof d === 'number' && d > 0 && d < 60, `${v} lasts ${d}`);
  }
  const names = new Set([...BR.EMITTERS.map((e) => e.voice), ...BR.TRACKS.map((t) => t.voice)]);
  for (const s of BR.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(BR.ROOMS), BR.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters sane and by hour, rooms found, the city never silent', () => {
  for (const e of BR.EMITTERS) assert.ok(Math.hypot(...e.at) < 520 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0 && e.hours.length === 2, e.voice);
  const units = BR.sites().filter((s) => s.id.startsWith('unit:'));
  assert.equal(units.length, GALLERY.length + STRIP.length);
  assert.ok(units.length >= 20 && units.every((s) => s.work.length > 0));
  assert.equal(BR.sites().filter((s) => s.use === 'class').length, 5);
  // owls are of the night, lapwings and kiskadees of the day, the school bell rings only at the lessons' hours
  const at = (v) => BR.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('braOwl').every((e) => e.hours[0] >= 18 || e.hours[1] <= 5));
  assert.ok(at('braQuero').every((e) => e.hours[0] >= 5 && e.hours[1] <= 19) && at('braKiskadee').length >= 3);
  assert.ok(at('braSchoolBell').length === 5 && at('braSchoolBell').every((e) => e.hours[0] >= 6 && e.hours[1] <= 18));
  assert.ok(at('braFountain').length >= 4 && at('braCascade').length === 1);
  // a shop is found by its door's unit, a classroom by its desk, the arrival is in the open
  const u = units[0];
  assert.equal(BR.roomAt(u.at[0], u.at[1], 1.5)?.use, u.use);
  assert.equal(BR.roomAt(u.at[0], u.at[1], 30), null, 'high above it, nothing');
  assert.equal(BR.roomAt(SCHOOL[0] + 4, SCHOOL[1] + 4.5, 1)?.use, 'class');
  assert.equal(BR.roomAt(...BR.HOME, 0), null, 'the arrival is in the open');
  assert.equal(BR.roomAt(-175, 205 - 10, -4.5)?.use, 'nave', 'the Cathedral nave (its floor sunk 4.5 m)');
  assert.equal(BR.roomAt(-175, 195, 0), null, 'not on the plaza above it');
  BR.clock.hour = 3; assert.ok(BR.townNear(30, 300) > 0, 'never silent');
  BR.clock.hour = 13; assert.ok(BR.townNear(30, 300) > BR.townNear(...BR.HOME), 'the avenue louder than the lawn');
  const rnd = () => 0.4;
  assert.ok(BR.TRACKS.find((t) => t.key === 'cars').get(-200, 110, rnd)?.pts.length === 2, 'a car on the carriageway');
  assert.equal(BR.treeSpot(-100, 350, rnd, 40), null, 'no Chinese seasonal birds');
  assert.ok(BR.treeSpot(-100, 350, rnd, 36), 'a tree in the quadra for a cicada');
});

test('placed: the lawn by day, the avenue by day, a quieter night', () => {
  const run = (hour, x, z) => {
    const { m, ctx } = music();
    m.doyOverride = 290; m.wind = 0.2;
    const calls = {};
    for (const v of Object.keys(BRA_VOICES)) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
    const L = profileOf('brasilia').animals;
    const put = () => m.place({ voices: { dove: 1 }, animals: L, roof: 'flat', water: 0, town: 1, birds: 1, rain: 0, indoors: false, at: { x, z, y: 0, yaw: 0, hour } });
    put();
    for (let i = 0; i < 240 / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
    return calls;
  };
  const lawn = run(10, -300, 10), avenue = run(10, 31, 300);
  assert.ok((lawn.braQuero || 0) + (lawn.braKiskadee || 0) + (lawn.braTraffic || 0) + (lawn.braParakeet || 0) > 0, JSON.stringify(lawn));
  assert.ok((avenue.braTraffic || 0) + (avenue.braHorn || 0) + (avenue.braRadio || 0) + (avenue.braKiskadee || 0) > 0, JSON.stringify(avenue));
  const night = run(2, -300, 10);
  assert.ok(!(night.braQuero || night.braKiskadee || night.braSchoolBell || night.braPicole), 'no lapwing, kiskadee, bell or vendor at 2 am: ' + JSON.stringify(night));
});
