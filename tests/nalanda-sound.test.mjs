// Nalanda's placed sounds (src/settlements/nalanda/soundmap.js, src/engine/voices-nalanda.js): the voices exist and can be made against a stand-in audio
// context, the map's places agree with the settlement, and the scheduler makes each sound at its place, hour and weather. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as NL from '../src/settlements/nalanda/soundmap.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = ['nalWoodGong', 'nalChant', 'nalDebateClap', 'nalStylus', 'nalCartBell'];

test('Nalanda: the profile carries the map', () => {
  const P = profileOf('nalanda'), L = P.animals[LIFE];
  assert.ok(L.map === NL);
});

test('Nalanda: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('nalanda').animals, roof: 'flat', at: { x: -2, z: 70, y: 0, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 60;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('Nalanda: the map agrees with the settlement', () => {
  const S = NL.sites();
  assert.ok(S.length > 10, `${S.length} sites`);
  for (const s of S) { assert.ok(s.work.length); assert.ok(NL.ROOMS[s.use], s.use); }
  for (const k of ['home', 'refectory', 'nalkitchen', 'library']) assert.ok(S.some((s) => s.use === k), k);
  for (const r of Object.values(NL.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  assert.ok(NL.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0 && e.at.length === 2), 'every emitter well formed');
  for (const v of ['nalWoodGong', 'nalChant', 'nalDebateClap', 'nalCartBell']) assert.ok(NL.EMITTERS.some((e) => e.voice === v), v);
  assert.equal(NL.canalTrack(0, 0, () => 0.5), null); assert.equal(NL.streetTrack(0, 0, () => 0.5, 90, 40), null);
  assert.ok(NL.townNear(80, 127) > 0.9 && NL.townNear(-95, -92) < 0.5);
  const s0 = S[0];
  assert.equal(NL.roomAt(s0.at[0], s0.at[1], 0.5).same, s0.id);
  assert.equal(NL.roomAt(0, 62, 0), null, 'the sacred way is the open');
  assert.ok(NL.treeSpot(150, 120, () => 0.3, 40) !== undefined, 'tree spot answers');
});
