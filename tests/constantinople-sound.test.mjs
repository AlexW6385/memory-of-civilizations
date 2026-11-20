// Constantinople's sounds (docs/settlements/constantinople.md §16.3): the map of src/settlements/constantinople/soundmap.js, the voices of
// src/engine/voices-constantinople.js, and a smoke test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { CN_VOICES, CRIES } from '../src/engine/voices-constantinople.js';
import * as CN from '../src/settlements/constantinople/soundmap.js';
import { shopRooms, shopsOf, shopFrame, TRADES } from '../src/settlements/constantinople/shops.js';
import { MESE_STOAS } from '../src/settlements/constantinople/stoas.js';
import { special, FORECOURT, HIPPODROME, inRect } from '../src/settlements/constantinople/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

const NEW = Object.keys(CN_VOICES), NOTE = ['cnOrganNote'];
const USED = ['hammer', 'plane', 'wheel', 'clay', 'brush', 'kitchen', 'loom', 'pourWine', 'jarLid', 'clothRustle', 'sack', 'teaTalk', 'pour', 'cicada', 'cricket', 'dogFar'];
const ALL = [...new Set([...NEW, ...USED])];

test('Constantinople: the voices of its streets ride on the animals; the semantron is the only hour', () => {
  const P = profileOf('constantinople'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === CN);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster'], 'the life is not an animal');
  assert.equal(P.bells, 'semantron');
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 41 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.deepEqual(ev, ['semantron', 'semantron'], 'dawn and dusk only: no bells (they came in the 9th century), no call to prayer');
});

test('Constantinople: every voice exists, is its own, and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('constantinople').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of ALL) assert.equal(typeof m[v], 'function', v);
  for (const v of NEW) assert.ok(/^cn[A-Z]/.test(v), `${v} carries the settlement's prefix`);
  const f = Object.assign(() => [0, 0], { dur: 12, len: 100 });
  for (const v of NEW.filter((k) => !NOTE.includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.5, v);
  for (const v of USED.filter((k) => !['cicada', 'cricket', 'dogFar'].includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v);
  for (const v of NEW) assert.equal(VOICES[v], CN_VOICES[v], v);
  const c = Object.values(CRIES).map((x) => x.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(c).size, c.length, 'every cry has its own contour');
});

test('Constantinople: the cues are made a few at a time', () => {
  const { ctx, count } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('constantinople').animals, roof: 'tile', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 40 });
  const f = Object.assign(() => [0, 0], { dur: 30, len: 100 });
  ['cnPsalm', 'cnOrgan', 'cnKyrie', 'cnAcclaim', 'cnChariots', 'cnMules'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1, f));
  assert.ok(m.cues.length > 60, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 200, `at most ${worst} nodes in a tick`);
});

test('the shop list: the pure frame is the style\'s frame, the same trades, every shop in a room', async () => {
  const { shopFrame: styleFrame, TRADES: styleTrades } = await import('../src/styles/byzantine/interiors.js');
  assert.deepEqual(TRADES, styleTrades);
  const S = shopsOf(), R = shopRooms();
  assert.equal(S.length, R.length);
  assert.ok(S.length >= 40, `${S.length} shops`);
  for (const s of S.slice(0, 40)) {
    const A = shopFrame(s.st, s.k, s.ns), B = styleFrame(s.st, s.k, s.ns);
    for (const [a, b] of [[0, 0], [1.2, 2], [-1, 3.8]]) assert.deepEqual(A.W(a, b).map((v) => +v.toFixed(6)), B.W(a, b).map((v) => +v.toFixed(6)));
    assert.ok(Math.abs(A.y - B.y) < 1e-9 && Math.abs(A.depth - B.depth) < 1e-9 && Math.abs(A.sw - B.sw) < 1e-9);
  }
  assert.equal(MESE_STOAS.filter((s) => s.shops).length, 6);
});

test('the map: houses, shops, rooms, the planting, the town', () => {
  const S = CN.sites(), sp = Object.keys(special()).length, shops = shopRooms().length;
  assert.equal(S.length, sp + shops);
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  assert.ok(S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  const use = (u) => S.filter((s) => s.use === u);
  assert.ok(use('smith').every((s) => s.work.some(([v]) => v === 'cnBellows')) && use('bakery').every((s) => s.work.some(([v]) => v === 'cnBakeWork')));
  assert.ok(use('shop:silver').length >= 3 && use('shop:grocer').length >= 3);
  // rooms: a shop, the church, the open forecourt
  const sh = use('shop:cloth')[0];
  assert.equal(CN.roomAt(...sh.at, sh.y + 0.4).use, 'shop:cloth');
  assert.equal(CN.roomAt(0, 0, 0.3).use, 'church');
  assert.equal(CN.roomAt(-10, 80, 0), null, 'the forecourt is the open');
  for (const r of [...Object.values(CN.ROOMS), CN.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  for (const s of S) assert.ok(CN.ROOMS[s.use], `a room for ${s.use}`);
  // the emitters
  for (const e of CN.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.length === 2 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 420) && e.hours.length === 2, e.voice); }
  for (const e of CN.EMITTERS.filter((x) => /^cnHawk/.test(x.voice))) assert.ok(inRect(FORECOURT, e.at[0], e.at[1]), `a stall on the forecourt ${e.at}`);
  assert.ok(inRect(HIPPODROME, ...CN.EMITTERS.find((e) => e.voice === 'cnOrgan').at));
  for (const [x, z] of CN.LAP) assert.ok(inRect(HIPPODROME, x, z), `the lap stays in the Hippodrome ${x},${z}`);
  // nothing of Suzhou's waters or streets
  assert.equal(CN.canalSpot(0, 0), null); assert.equal(CN.streetTrack(0, 0, Math.random), null); assert.equal(CN.pondSpot(0, 0, Math.random), null);
  // the planting and the hubbub
  assert.ok(CN.greenNear(-83, 70) > 0.9 && CN.greenNear(0, 0) < 0.5 && CN.treeSpot(-83, 70, () => 0.37) !== null);
  assert.ok(CN.townNear(-10, 80) === 1 && CN.townNear(-100, 110) === 1 && CN.townNear(350, 350) < 0.4);
  // the tracks
  for (const T of CN.TRACKS) assert.equal(typeof VOICES[T.voice], 'function', T.voice);
  assert.ok(CN.TRACKS[0].get(-242, 200) && !CN.TRACKS[0].get(300, -300), 'chariots only near the track');
  assert.ok(CN.TRACKS[1].get(-120, 108, Math.random).pts.length >= 4 && !CN.TRACKS[1].get(300, -300, Math.random));
});

// run the scheduler for `secs` of sound with the listener at (x, z) and the weather and season given; count the voices made
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of ALL) { const o = m[v]; if (typeof o !== 'function' || NOTE.includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('constantinople').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Constantinople placed: the forecourt by day, the door, the cistern head', () => {
  let r = listen({ x: -10, z: 70, hour: 9, secs: 600 });
  assert.ok(Object.keys(r.calls).filter((k) => /^cnHawk/.test(k)).length > 0, `the stalls call (${JSON.stringify(r.calls)})`);
  assert.ok(r.calls.cnKyrie > 0, 'the litany at the door');
  r = listen({ x: -20, z: 64, hour: 10, secs: 600 });
  assert.ok(r.calls.cnWindlass > 0, 'the windlass');
  assert.ok(!listen({ x: -20, z: 64, hour: 10, rain: 0.9, secs: 300 }).calls.cnWindlass, 'not in the downpour');
  assert.ok(!listen({ x: -20, z: 64, hour: 23, secs: 300 }).calls.cnWindlass, 'not at night');
  assert.ok(!listen({ x: -20, z: 40, hour: 23, secs: 600 }).calls.cnHawkBread, 'the market is closed at night');
  r = listen({ x: -10, z: 40, hour: 9.5, secs: 600 });
  assert.ok(r.calls.cnPsalm > 0, 'the psalmody at the door in the liturgy');
});

test('Constantinople placed: the Hippodrome on race days, the Mese, the trades', () => {
  let r = listen({ x: -242, z: 150, hour: 12, secs: 600 });
  assert.ok(r.calls.cnAcclaim > 0, 'the factions');
  assert.ok(!listen({ x: -242, z: 150, hour: 21, secs: 400 }).calls.cnAcclaim, 'no race at night');
  r = listen({ x: -120, z: 108, hour: 10, secs: 1200 });
  assert.ok(r.calls.cnMules > 0 || r.calls.cnChasing > 0, `a mule train or the silversmith (${JSON.stringify(r.calls)})`);
  const bake = CN.sites().find((s) => s.use === 'bakery');
  r = listen({ x: bake.at[0], z: bake.at[1], y: bake.y + 0.4, hour: 5, secs: 600, indoors: true });
  assert.ok(r.calls.cnBakeWork > 0, 'the baker before dawn');
  const sm = CN.sites().find((s) => s.use === 'smith');
  r = listen({ x: sm.at[0], z: sm.at[1], y: sm.y + 0.4, hour: 10, secs: 600, indoors: true });
  assert.ok(r.calls.hammer > 0 && r.calls.cnBellows > 0, 'the smith');
});
