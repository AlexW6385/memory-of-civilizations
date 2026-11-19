// Rome's sounds (docs/settlements/rome.md §4.19): the placed map (src/settlements/rome/soundmap.js) and the Roman voices
// (src/engine/voices-rome.js), against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { ROMAN_VOICES } from '../src/engine/voices-rome.js';
import * as RM from '../src/settlements/rome/soundmap.js';
import { fountains, riverEdge, VIA_LATA, BATHS, PANTHEON, INN, rows, lots } from '../src/settlements/rome/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = () => { const { ctx, count } = fake(); const m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { m, ctx, count }; };

test('Rome: the profile carries the map on its animals, and Suzhou\'s watchman and vendors are not Rome\'s', () => {
  const P = profileOf('rome'), L = P.animals[LIFE];
  assert.equal(L.map, RM);
  assert.ok(L.canal && L.market && L.eaves && !L.oar && !L.hawkers && !L.teahouse && !L.patrol);
  assert.deepEqual(Object.keys(P.animals).sort(), ['donkey', 'dog', 'horse', 'rooster'].sort(), 'the life is not an animal');
  assert.equal(P.bells, null, 'no bells in Rome in 128');
});

test('Rome: every Roman voice exists and can be made, and each lasts', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('rome').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 8 });
  const f = m.along([[0, 0], [30, 0]], 1);
  assert.ok(Object.keys(ROMAN_VOICES).length >= 12);
  for (const [v] of Object.entries(ROMAN_VOICES)) {
    assert.equal(typeof m[v], 'function', v);
    const d = m[v](ctx.currentTime, bus, 1, f);
    assert.ok(d === undefined || (typeof d === 'number' && d > 0 && d < 60), `${v} lasts ${d}`);
  }
  // every voice named by the map is a function of the engine
  const names = new Set(RM.EMITTERS.map((e) => e.voice));
  for (const s of RM.sites()) for (const [v] of s.work) names.add(v);
  for (const R of [...Object.values(RM.ROOMS), RM.UPPER]) for (const [v] of R.work) names.add(v);
  for (const v of names) assert.equal(typeof m[v], 'function', 'the map names ' + v);
});

test('the map: emitters are inside the settlement and hours are well formed', () => {
  for (const e of RM.EMITTERS) {
    assert.ok(Math.hypot(...e.at) < 420, e.voice + ' at ' + e.at);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.voice);
    assert.ok(e.hours.every((h) => h >= 0 && h <= 24), e.voice);
  }
  assert.equal(RM.EMITTERS.filter((e) => e.voice === 'fountain').length, fountains().length, 'a fountain voice at each fountain');
  // the baths are open in the afternoon only, the carts and the watch by night only
  const night = (v) => RM.EMITTERS.filter((e) => e.voice === v).every((e) => e.hours[0] >= 19 && e.hours[1] <= 5.5);
  assert.ok(night('cartPass') && night('vigilesPatrol'));
  assert.ok(RM.EMITTERS.filter((e) => e.voice === 'bathNoise').every((e) => e.hours[0] >= 13 && e.hours[1] <= 18 && e.at[0] > BATHS[0] && e.at[0] < BATHS[2] && e.at[1] > BATHS[1] && e.at[1] < BATHS[3]));
  // the quay's work is at the water
  for (const e of RM.EMITTERS.filter((x) => x.voice === 'clothBeat' || x.voice === 'craneCreak')) assert.ok(RM.canalSpot(...e.at).d < 12, e.voice);
});

test('the map: sites, rooms, tracks, planting', () => {
  const S = RM.sites();
  for (const u of ['thermopolium', 'caupona', 'fullonica', 'pistrinum', 'latrine']) assert.ok(S.some((s) => s.use === u), u);
  for (const s of S) { assert.equal(RM.roomAt(...s.at, 0.3).same, s.id, s.id); assert.ok(RM.ROOMS[s.use], s.use); }
  assert.equal(RM.roomAt(0, 0, 1).use, 'temple', 'the Pantheon');
  assert.equal(RM.roomAt(0, -120, 0), null, 'the forecourt is the open');
  assert.equal(RM.roomAt(INN[0] + 2, INN[1] + 2, 0).use, 'caupona');
  const row = rows().find((r) => r.front === 'e'), c = [(row.rect[0] + row.rect[2]) / 2, (row.rect[1] + row.rect[3]) / 2];
  assert.equal(RM.roomAt(...c, 0.3).use, 'shop');
  assert.equal(RM.roomAt(...c, 4.5).upper, true);
  assert.equal(RM.roomAt(VIA_LATA.x, c[1], 0), null, 'the street');
  assert.ok(lots().length > 20);
  for (const r of [...Object.values(RM.ROOMS), RM.UPPER]) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  // the river is on the west, the streets in the east
  const rnd = () => 0.4, q = riverEdge(1)[10];
  const bt = RM.canalTrack(q[0] + 10, q[1], rnd);
  assert.ok(bt && bt.pts.every((p) => Math.abs(p[0] - q[0]) < 40), 'a barge on the Tiber');
  assert.equal(RM.canalTrack(100, 0, rnd), null, 'no river by the baths');
  assert.ok(RM.streetTrack(VIA_LATA.x + 12, 0, rnd, 90, 40), 'a litter in the Via Lata');
  assert.equal(RM.streetTrack(VIA_LATA.x + 12, 0, rnd, 80, 30), null, 'no Chinese hawker');
  assert.equal(RM.streetTrack(VIA_LATA.x + 12, 0, rnd, 90, 34), null, 'no clapper watchman');
  assert.equal(RM.bridgeTrack(), null);
  assert.ok(RM.pondSpot(q[0] - 5, q[1], () => 0.5));
  assert.ok(RM.greenNear(0, 0) < 0.3 && RM.leafNear(0, 0) <= 1 && RM.townNear(0, -120) < RM.townNear(VIA_LATA.x, 0));
  assert.equal(RM.WELLS.length, 0);
  assert.ok(PANTHEON[3] > 0);
});

// run the scheduler for `secs` of sound with the listener at `at`; count the voices made
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  const names = [...Object.keys(ROMAN_VOICES), 'vendor', 'watchman', 'sedan', 'boat', 'crossing', 'teaTalk', 'teaClink', 'wellBucket', 'qin', 'xiao', 'cicada', 'frog', 'dogFar', 'eaveDrip'];
  for (const v of names) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('rome').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', water: 0, town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Rome placed: the Via Lata by day, the fountains, the market', () => {
  const f = fountains()[0].at;
  let r = listen({ x: f[0], z: f[1], hour: 10, secs: 300 });
  assert.ok(r.calls.fountain > 5, `the lacus plays (${r.calls.fountain})`);
  r = listen({ x: VIA_LATA.x, z: -100, hour: 9, secs: 600 });
  assert.ok(r.calls.hawkerRome > 0, `a hawker cries in the Via Lata (${r.calls.hawkerRome})`);
  assert.ok(!r.calls.vendor && !r.calls.watchman && !r.calls.qin && !r.calls.xiao, 'nothing of Suzhou');
  assert.ok(!r.calls.cartPass, 'no carts by day');
  r = listen({ x: VIA_LATA.x, z: -100, hour: 9, rain: 0.9, secs: 300 });
  assert.ok(!r.calls.hawkerRome, 'no cries in heavy rain');
});

test('Rome placed: the baths in the afternoon, the quay, the night', () => {
  const bx = (BATHS[0] + BATHS[2]) / 2;
  let r = listen({ x: bx, z: BATHS[1] + 50, hour: 15, secs: 400 });
  assert.ok(r.calls.bathNoise > 0, `Seneca's noises (${r.calls.bathNoise})`);
  assert.ok(!listen({ x: bx, z: BATHS[1] + 50, hour: 9, secs: 300 }).calls.bathNoise, 'the baths are shut in the morning');
  assert.ok(!listen({ x: bx, z: BATHS[1] + 50, hour: 2, secs: 300 }).calls.bathNoise, 'and at night');
  const q = RM.EMITTERS.find((e) => e.voice === 'clothBeat').at;
  r = listen({ x: q[0], z: q[1], hour: 10, secs: 600 });
  assert.ok(r.calls.clothBeat > 0, 'laundry beaten at the landing');
  assert.ok(!listen({ x: q[0], z: q[1], hour: 2, secs: 300 }).calls.clothBeat, 'not at night');
  r = listen({ x: VIA_LATA.x, z: -100, hour: 1, secs: 900 });
  assert.ok(r.calls.cartPass > 0 || r.calls.vigilesPatrol > 0, 'carts or the watch at night in the Via Lata');
  assert.ok(!r.calls.hawkerRome && !r.calls.watchman, 'no cries at night, and not the clapper watchman');
});

test('Rome placed: indoors, the rooms and their work', () => {
  const mill = RM.sites().find((s) => s.use === 'pistrinum');
  let r = listen({ x: mill.at[0], z: mill.at[1], y: 0.3, hour: 8, indoors: true, secs: 400 });
  assert.equal(r.m.plc.room.use, 'pistrinum');
  assert.ok(r.calls.millstone > 0, `the mill grinds (${r.calls.millstone})`);
  const full = RM.sites().find((s) => s.use === 'fullonica');
  r = listen({ x: full.at[0], z: full.at[1], y: 0.3, hour: 9, indoors: true, secs: 400 });
  assert.ok(r.calls.fullerTread > 0, `the fullers tread (${r.calls.fullerTread})`);
  r = listen({ x: 0, z: 0, y: 1, hour: 11, indoors: true, rain: 0.8, secs: 20 });
  assert.equal(r.m.plc.room.use, 'temple');
  assert.ok(r.m.roomCut > 0 && r.m.roomCut < 2000, 'a room of its own colour');
});
