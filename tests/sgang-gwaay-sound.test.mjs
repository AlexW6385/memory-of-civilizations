// SG̱ang Gwaay's placed sounds (src/settlements/sgang-gwaay/soundmap.js, src/engine/voices-sgang.js): the voices exist and can be made against a stand-in audio
// context, and the map's places agree with the settlement. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as SG from '../src/settlements/sgang-gwaay/soundmap.js';
import { houses, LANDMARK, G } from '../src/settlements/sgang-gwaay/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const NEW = ['sgaSurf', 'sgaDrip', 'sgaFire', 'sgaDrum', 'sgaSong', 'sgaAdze', 'sgaBark', 'sgaKnife', 'sgaScrape', 'sgaSplit', 'sgaPaddle', 'sgaWeave', 'sgaSteam', 'sgaRaven', 'sgaEagle', 'sgaSeal', 'sgaPlay'];

test('SG̱ang Gwaay: the profile carries the map; no bell, no horse', () => {
  const P = profileOf('sgang-gwaay'), L = P.animals[LIFE];
  assert.ok(L.map === SG);
  assert.ok(!('horse' in P.animals) && !P.bells);
});

test('SG̱ang Gwaay: every voice exists and can be made', () => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('sgang-gwaay').animals, roof: 'shingle', at: { x: 43, z: 5, y: 1, yaw: 0, hour: 12 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  m.doyOverride = 120;
  for (const v of NEW) { assert.equal(typeof m[v], 'function', v); assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v); }
});

test('SG̱ang Gwaay: the map agrees with the settlement', () => {
  assert.equal(SG.sites().length, houses().length);
  for (const s of SG.sites()) { assert.ok(s.work.length); assert.ok(SG.ROOMS[s.use], s.use); }
  assert.equal(SG.sites()[LANDMARK].use, 'hall');
  const s0 = SG.sites()[5];
  assert.equal(SG.roomAt(s0.at[0], s0.at[1], G - 1).same, s0.id, 'inside a house');
  assert.equal(SG.roomAt(SG.HOME[0], SG.HOME[1], G), null, 'the beach top is the open');
  assert.ok(SG.EMITTERS.length > 25);
  assert.ok(SG.EMITTERS.every((e) => typeof e.voice === 'string' && e.gap.length === 2 && e.hours.length === 2 && e.r50 > 0), 'every emitter well formed');
  for (const e of SG.EMITTERS) assert.ok(typeof NEW.concat(['owl']).find((v) => v === e.voice) === 'string', e.voice);
  assert.ok(SG.EMITTERS.some((e) => e.voice === 'sgaDrum' && e.after && e.hours[0] >= 17), 'the evening drum');
  assert.ok(SG.townNear(30, 0) > 0.9 && SG.townNear(-150, 0) < 0.3);
  assert.equal(SG.canalTrack(0, 0, () => 0.5), null);
  assert.ok(SG.treeSpot(-60, 0, () => 0.3, 40), 'a cedar behind the row');
});
