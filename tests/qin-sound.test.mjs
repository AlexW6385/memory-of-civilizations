// Qin Xianyang's placed sounds (src/settlements/qin-xianyang/soundmap.js, src/engine/voices-qin.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the emitters are well formed and keep their hours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as QX from '../src/settlements/qin-xianyang/soundmap.js';
import { lots, PIT, HALL, TOWER } from '../src/settlements/qin-xianyang/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['qinChime', 'qinDrum', 'qinWatch', 'qinRammer', 'qinKiln', 'qinSledge', 'qinGate', 'qinCart', 'qinLamp'];

test('Qin Xianyang: the profile carries the map', () => {
  assert.ok(profileOf('qin-xianyang').animals[LIFE].map === QX);
});

test('Qin Xianyang: every voice exists and can be made', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('qin-xianyang').animals, roof: 'tile', at: { x: 126, z: -121, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Qin Xianyang: the map agrees with the settlement', () => {
  const S = QX.sites();
  assert.ok(S.length > 20, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work && s.work.length, s.id); assert.ok(QX.ROOMS[s.use], s.use); }
  for (const k of ['work-clay', 'work-kiln', 'row']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(QX.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(QX.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  const s0 = S[0];
  assert.equal(QX.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(QX.roomAt(0, 0, 0), null, 'the imperial road is the open');
  assert.equal(QX.roomAt((PIT.x0 + PIT.x1) / 2, (PIT.z0 + PIT.z1) / 2, -4).use, 'pit');
  assert.equal(QX.roomAt((HALL.x0 + HALL.x1) / 2, (HALL.z0 + HALL.z1) / 2, 7.5).use, 'hall');
  assert.ok(QX.townNear(TOWER.x, TOWER.z) > 0.9 && QX.townNear(60, -121) < 0.2);
  assert.ok(lots().some((l) => l.open), 'lots are open');
  const rnd = ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  assert.ok(QX.treeSpot(0, 0, rnd, 40), 'a pine by the road');
});

test('Qin Xianyang: the drum at opening and closing, the clapper at night', () => {
  const at = (v) => QX.EMITTERS.filter((e) => e.voice === v);
  assert.ok(at('qinDrum').some((e) => e.hours[0] < 7.3 && e.hours[1] > 7) && at('qinDrum').some((e) => e.hours[0] > 16));
  assert.ok(at('qinWatch').length && at('qinWatch').every((e) => e.hours[0] >= 20 && e.hours[1] <= 5));
  assert.ok(at('qinGate').some((e) => e.hours[0] > 17) && at('qinGate').some((e) => e.hours[1] < 7));
});
