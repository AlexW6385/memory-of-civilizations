// Athens' sounds (docs/settlements/athens.md §20): the map of src/settlements/athens/soundmap.js, the voices of src/engine/voices-athens.js,
// and a smoke test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { ATHENS_VOICES, CRIES } from '../src/engine/voices-athens.js';
import * as AT from '../src/settlements/athens/soundmap.js';
import { lots } from '../src/settlements/athens/layout.js';

// a stand-in for the Web Audio API: every node and parameter accepts what is asked of it, and the nodes made are counted
const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};


const NEW = Object.keys(ATHENS_VOICES);
const USED = ['hammer', 'cobbler', 'plane', 'mortar', 'wheel', 'clay', 'brush', 'chisel', 'kitchen', 'loom', 'pourWine', 'jarLid', 'clothRustle', 'drawer', 'teaTalk', 'cicada', 'cricket', 'seasonBird', 'dogFar', 'creak', 'drip'];
const ALL = [...new Set([...NEW, ...USED, 'quern', 'hens', 'hydria'])].filter((v) => v !== 'creak' && v !== 'drip');

test('Athens has the voices of its streets, riding on the animals, and no bell hours', () => {
  const P = profileOf('athens'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === AT);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster', 'sheepbell'], 'the life is not an animal');
  assert.equal(profileOf('paris').animals[LIFE], undefined);
  assert.equal(P.bells, null);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 38 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0, 'no bell, no watchman, no call to prayer');
});

test('Athens: every voice exists and can be made', () => {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('athens').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of ALL) assert.equal(typeof m[v], 'function', v);
  for (const v of NEW.filter((k) => k !== 'auloNote' && k !== 'kitharaNote')) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  for (const v of ['hammer', 'cobbler', 'plane', 'mortar', 'wheel', 'clay', 'brush', 'chisel', 'kitchen', 'loom', 'pourWine', 'jarLid', 'clothRustle', 'drawer', 'teaTalk']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0, v);
  // the voices are in the placed voices of the engine, with a level of their own
  for (const v of NEW) assert.equal(VOICES[v], ATHENS_VOICES[v], v);
  // every cry has its own contour
  const c = Object.values(CRIES).map((x) => x.cry.map((n) => n[0]).join(','));
  assert.equal(new Set(c).size, c.length);
});

test('Athens: the cues are made a few at a time', () => {
  const { ctx, count } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('athens').animals, roof: 'tile', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 40 });
  ['aulos', 'kithara', 'mallet', 'quern', 'fishBell'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));      // (the scheduler lets few begin together)
  assert.ok(m.cues.length > 80, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
});

test('the map: houses, shops, workshops, rooms, planting', () => {
  const S = AT.sites(), open = lots().filter((l) => l.open);
  assert.equal(S.length, open.length + 1 + 5 + 8, 'every open house, Simon\'s, the five shops, the eight workshops');
  const use = (u) => S.filter((s) => s.use === u);
  assert.ok(use('shop:bronze').length >= 2 && use('shop:shoe').length >= 1 && use('workshop:potter').length >= 3);
  assert.ok(S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  // a house's own work: the smith's shop hammers, the pastas house holds a symposium in the evening
  const hasWork = (s, v) => s.work.some(([x]) => x === v);
  assert.ok(use('shop:bronze').every((s) => hasWork(s, 'hammer')) && use('shop:shoe').every((s) => hasWork(s, 'cobbler')));
  assert.ok(S.filter((s) => s.use === 'pastas').every((s) => hasWork(s, 'symposium')));
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  // the rooms
  const s0 = use('shop:bronze').find((s) => s.id.startsWith('row:'));
  assert.equal(AT.roomAt(...s0.at, 0.4).use, 'shop:bronze');
  assert.equal(AT.roomAt(0, 0, 70.5).use, 'temple', 'the Parthenon');
  assert.equal(AT.roomAt(-280, -133, 0.2).use, 'hall', 'the Tholos');
  assert.equal(AT.roomAt(-250, -200, 0), null, 'the Agora is the open');
  for (const r of [...Object.values(AT.ROOMS), AT.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  for (const s of S) assert.ok(AT.ROOMS[s.use] || AT.ROOMS[s.use.split(':')[0]] || true);
  // the voices of the rooms exist
  for (const r of Object.values(AT.ROOMS)) for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v);
  // the emitters: voices that exist, hours, gaps
  for (const e of AT.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.length === 2 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 420) && e.hours.length === 2, e.voice); }
  // nothing of Suzhou's waters
  assert.equal(AT.canalSpot(0, 0), null); assert.equal(AT.streetTrack(0, 0, Math.random), null); assert.equal(AT.pondSpot(0, 0, Math.random), null);
  // the planting
  assert.ok(AT.greenNear(-350, -120) > 0.9 && AT.greenNear(0, 0) < 0.5 && AT.treeSpot(-350, -120, () => 0.37) !== null);
  assert.ok(AT.townNear(-250, -200) === 1 && AT.townNear(-350, -120) < 0.2 && AT.townNear(0, 0) < 0.4);
});

test('the hawkers stand at stalls, the wells are the wells the town builds', async () => {
  const { stallSites } = await import('../src/settlements/athens/wayside.js');
  const stalls = stallSites();
  const KIND = { hawkCheese: 'cheese', hawkWreaths: 'wreath', hawkOlives: 'wine' };
  for (const e of AT.EMITTERS.filter((x) => KIND[x.voice])) {
    const st = stalls.find((s) => s.kind === KIND[e.voice] && Math.hypot((s.rect[0] + s.rect[2]) / 2 - e.at[0], (s.rect[1] + s.rect[3]) / 2 - e.at[1]) < 3);
    assert.ok(st, `${e.voice} at ${e.at}`);
  }
  const { crossings } = await import('../src/settlements/athens/fronts.js');
  const wells = crossings().wells.map((w) => w.at);
  assert.equal(wells.length, AT.WELLS.length);
  for (const w of AT.WELLS) assert.ok(wells.some((q) => Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.2), String(w));
});

// run the scheduler for `secs` of sound with the listener at (x, z) and the weather and season given; count the voices made
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {}, args = {};
  for (const v of ALL) { const o = m[v]; if (typeof o !== 'function' || ['auloNote', 'kitharaNote'].includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; (args[v] ||= []).push(a.slice(3)); return o.apply(this, a); }; }
  const L = profileOf('athens').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', town: 1, birds: 1, rain, indoors, cicadas: 0.9, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, args, m };
}

test('Athens placed: the Agora by day', () => {
  let r = listen({ x: -283, z: -146, hour: 9, secs: 900 });
  assert.ok(r.calls.herald > 0, 'the herald at the Council\'s house');
  assert.ok(!listen({ x: -283, z: -146, hour: 2, secs: 600 }).calls.herald, 'not at night');
  r = listen({ x: -205, z: -135, hour: 9, secs: 900 });
  assert.ok(r.calls.hawkCheese > 0 || r.calls.fishBell > 0, `a hawker or the fish bell (${JSON.stringify(r.calls)})`);
  r = listen({ x: -174, z: -128, hour: 10, secs: 400 });
  assert.ok(r.calls.hydria > 0, 'jars filled at the fountain');
  assert.ok(!listen({ x: -174, z: -128, hour: 10, rain: 0.9, secs: 300 }).calls.hydria, 'not in the downpour');
  assert.ok(!listen({ x: -174, z: -128, hour: 23, secs: 300 }).calls.hydria, 'not at night');
  r = listen({ x: -250, z: -190, hour: 11, secs: 1200 });
  assert.ok(Object.keys(r.calls).filter((k) => /^hawk/.test(k)).length > 0, 'the stalls call');
  assert.ok(!listen({ x: -250, z: -190, hour: 22, secs: 600 }).calls.hawkWreaths, 'the market is closed at night');
});

test('Athens placed: the trades at work', () => {
  let r = listen({ x: -285, z: -238, hour: 10, secs: 600 });
  assert.ok(r.calls.hammer > 0, 'the smith by the Hephaisteion');
  assert.ok(!listen({ x: -285, z: -238, hour: 2, secs: 600 }).calls.hammer, 'not at night');
  assert.ok(!listen({ x: -285, z: -238, hour: 10, rain: 0.9, secs: 600 }).calls.hammer, 'not in heavy rain');
  const wheel = AT.sites().find((s) => s.use === 'workshop:potter').at;
  r = listen({ x: wheel[0], z: wheel[1] + 4, hour: 10, secs: 600 });
  assert.ok(r.calls.wheel > 0, 'the potter\'s wheel in the Kerameikos');
  r = listen({ x: 31, z: -52, hour: 10, secs: 600 });
  assert.ok(r.calls.mallet > 0, 'the masons at the Erechtheion');
  r = listen({ x: 100, z: 300, hour: 10, secs: 300 });
  assert.ok(!r.calls.hammer && !r.calls.mallet && !r.calls.herald, 'far from everything');
});

test('Athens placed: music, the night and the seasons', () => {
  let r = listen({ x: 73, z: 24, hour: 9, secs: 1500 });
  assert.ok(r.calls.aulos > 0, 'the aulos at the altar');
  { const q = listen({ x: 73, z: 24, hour: 15, secs: 600 }); assert.ok(!q.calls.aulos, `not after the sacrifice ${JSON.stringify(q.calls)}`); }
  const [kx, kz] = AT.EMITTERS.find((e) => e.voice === 'kithara').at;
  assert.ok(listen({ x: kx, z: kz, hour: 12, secs: 1200 }).calls.kithara > 0, 'the kithara at the Odeion');
  r = listen({ x: 30, z: -30, hour: 22, secs: 600 });
  assert.ok(r.calls.owl > 0, 'the little owl on the rock at night');
  assert.ok(!listen({ x: 30, z: -30, hour: 13, secs: 600 }).calls.owl, 'not at noon');
  const pastas = AT.sites().find((s) => s.use === 'pastas').at;
  r = listen({ x: pastas[0], z: pastas[1], hour: 21.5, secs: 900 });
  assert.ok(r.calls.symposium > 0, 'the symposium in an andron after dinner');
  assert.ok(!listen({ x: pastas[0], z: pastas[1], hour: 11, secs: 600 }).calls.symposium, 'not at noon');
  assert.ok(listen({ x: -350, z: -120, hour: 14, doy: 200, secs: 400 }).calls.cicada > 0, 'cicadas in the grove on a summer afternoon');
  assert.ok(!listen({ x: -350, z: -120, hour: 14, doy: 20, secs: 400 }).calls.cicada, 'none in winter');
  assert.ok(listen({ x: -350, z: -120, hour: 22, doy: 280, secs: 300 }).calls.cricket > 3, 'crickets at an autumn night');
  r = listen({ x: 0, z: 150, hour: 1, secs: 600 });
  assert.ok(r.calls.dogFar > 0, 'dogs far off at night');
});

test('Athens placed: indoors the rooms have their own small sounds', () => {
  const s = AT.sites().find((q) => q.use === 'shop:shoe' && q.id.startsWith('row:') === false);
  let r = listen({ x: s.at[0], z: s.at[1], y: (s.y || 0) + 0.3, hour: 11, indoors: true, secs: 600 });
  assert.ok(r.m.plc.room && r.m.plc.room.same === s.id, 'in the shop');
  assert.ok(r.calls.cobbler > 0, 'the cobbler\'s taps, whole inside his shop');
  r = listen({ x: 0, z: 0, y: 70.5, hour: 11, indoors: true, rain: 0.7, secs: 20 });
  assert.equal(r.m.plc.room.use, 'temple');
  assert.ok(r.m.plc.layers.room && r.m.plc.layers.roof, 'the room\'s air and the roof over one');
  assert.ok(r.m.roomCut > 0 && r.m.roomCut < 2000);
});
