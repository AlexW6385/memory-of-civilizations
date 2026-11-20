// Baroque Rome's sounds (src/settlements/baroque-rome/soundmap.js, voices.js, docs/settlements/baroque-rome.md §6): the places of its emitters against the layout,
// its voices made against a stand-in audio context (no sound is made: every node is a recorder), and the day's scheduling by the placed-sound engine at the
// fountains, on the river and in a shop. The town is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { inHours, VOICE_OWNER } from '../src/engine/voices.js';
import * as BR from '../src/settlements/baroque-rome/soundmap.js';
import { BRM_VOICES, BRM_CRIES } from '../src/settlements/baroque-rome/voices.js';
import { OVAL, TIBER, tiberX, inTiber } from '../src/settlements/baroque-rome/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = (ctx) => {
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  return m;
};

test('Baroque Rome: the profile carries the map on the animals, as a life and not an animal', () => {
  const P = profileOf('baroque-rome'), L = P.animals[LIFE];
  assert.ok(L && L.market && L.eaves && L.map === BR);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'horse']);
});

test('Baroque Rome: the places of the emitters lie where they should', () => {
  const S = BR.sites();
  assert.ok(S.length >= 14, `${S.length} houses with sounds`);
  for (const s of S) { assert.ok(s.work.length && s.rect[2] > s.rect[0] && s.rect[3] > s.rect[1], s.id); }
  assert.ok(S.some((s) => s.use === 'baker') && S.some((s) => s.use === 'osteria') && S.some((s) => s.use === 'devotional'));
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'ids are unique');
  for (const [x, z] of BR.MILLS) assert.ok(Math.abs(x - tiberX(z)) < TIBER.w / 2, 'a mill in the stream');
  assert.ok(inTiber(BR.MILLS[0][0], BR.MILLS[0][1]), 'the first stands in the water proper');
  for (const e of BR.EMITTERS.filter((e) => e.voice === 'brmMill')) assert.ok(Math.abs(e.at[0] - tiberX(e.at[1])) < TIBER.w / 2);
  for (const e of BR.EMITTERS.filter((e) => e.voice === 'brmFountain')) assert.ok(Math.abs(e.at[0] - OVAL.c[0]) < 1 && Math.abs(Math.abs(e.at[1]) - 42) < 1, 'a fountain on the oval\'s long axis');
  for (const e of BR.EMITTERS) { assert.ok(e.hours[0] >= 0 && e.hours[1] <= 24 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.voice); assert.ok(Math.hypot(e.at[0], e.at[1]) < 400, e.voice + ' within the town'); }
  // the market is a morning's; the bakers' work is before noon
  assert.ok(BR.EMITTERS.filter((e) => e.voice === 'marketCry').every((e) => e.hours[1] <= 13.5));
  const bk = S.find((s) => s.use === 'baker');
  assert.ok(inHours(5, bk.work[0][2]) && !inHours(15, bk.work[0][2]));
  // no canals, no Chinese street tracks; the bridge track crosses the river
  assert.equal(BR.canalSpot(0, 0), null); assert.equal(BR.streetTrack(0, 0, Math.random), null);
  const bt = BR.bridgeTrack(tiberX(-60), -60, Math.random);
  assert.ok(bt && bt.pts.length === 2 && Math.abs(bt.pts[1][0] - bt.pts[0][0]) > TIBER.w * 0.8);
  // the rooms: an open shop, the basilica, the Sistine Chapel, the street
  const sh = S.find((s) => s.use === 'baker');
  assert.equal(BR.roomAt(sh.at[0], sh.at[1])?.use, 'baker');
  assert.equal(BR.roomAt(-150, 0)?.use, 'church');
  assert.equal(BR.roomAt(-185, -128)?.use, 'sistina');
  assert.equal(BR.roomAt(40, 0), null);
  for (const u of ['inn', 'home', 'grocer', 'baker', 'cloth', 'wine', 'apothecary', 'osteria', 'cobbler', 'devotional', 'church', 'sistina', 'house']) assert.ok(BR.ROOMS[u], u);
  // townNear is full in the Borgo and less at the rim
  assert.ok(BR.townNear(150, 0) > BR.townNear(-360, 0));
  // the ways of the tracks exist near the arrival
  for (const T of BR.TRACKS) { const tr = T.get(150, -19, () => 0.3); assert.ok(tr && tr.pts.length === 2, T.key); }
});

test('Baroque Rome: its own voices can be made, are prefixed, and every voice its map names exists', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('baroque-rome').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 }), f = m.along([[0, 0], [30, 0]], 1.2);
  for (const v of BRM_VOICES) { assert.ok(v.startsWith('brm'), v); assert.equal(VOICE_OWNER.get(v), 'baroque-rome/voices.js'); assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.3, v); }
  for (const e of BR.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const s of BR.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
  for (const T of BR.TRACKS) assert.equal(typeof m[T.voice], 'function', T.voice);
  for (const R0 of [...Object.values(BR.ROOMS), BR.UPPER]) for (const [v] of R0.work) assert.equal(typeof m[v], 'function', v);
  assert.ok(BRM_CRIES.length >= 4 && new Set(BRM_CRIES.map((c) => c.map((n) => n[0]).join(','))).size === BRM_CRIES.length, 'distinct contours');
});

test('Baroque Rome: the fountains run always, the market is by day, a shop works only in its hours', () => {
  const { ctx, count } = fake(), m = music(ctx);
  const L = profileOf('baroque-rome').animals;
  const place = (at, o = {}) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', town: 1, birds: 1, at: { x: at[0], z: at[1], yaw: 0, y: 0, hour: o.hour ?? 9 }, ...o });
  const run = (at, hour, secs = 120, o = {}) => { const c0 = count(); for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; place(at, { hour, ...o }); m.placeEvents(); } return count() - c0; };
  const market = run([112, 0], 9), marketNight = run([112, 0], 2, 120, { town: 0.1, birds: 0 });
  assert.ok(market > marketNight, `the Borgo's mouth is louder by day (${market} against ${marketNight} nodes)`);
  const near = (hour, at, voice) => { place(at, { hour }); m.placeEvents(); return m.plc.stat.filter((e) => e.voice === voice && m.gainAt(e.at, e.r50) >= 0.15).length; };
  assert.ok(near(2, [OVAL.c[0] + 8, -38], 'brmFountain') >= 1, 'a fountain heard at night');
  const mill = BR.MILLS[1];
  assert.ok(near(2, [mill[0] - 12, mill[1]], 'brmMill') >= 1, 'a mill heard from the bank');
  let worst = 0;
  while (m.cues && m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); if (ctx.currentTime > 5000) break; }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
});
