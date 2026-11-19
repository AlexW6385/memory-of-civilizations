// Florence's sounds (src/settlements/florence/soundmap.js, src/engine/voices-florence.js, docs/settlements/florence.md §18): the schedule of its
// bells, the voices of its market, weirs and workshops made against a stand-in audio context (no sound is made: every node is a recorder), the
// places of its emitters against the layout, and the day's scheduling by the placed-sound engine near the market, on the river and in a workshop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { inHours } from '../src/engine/voices.js';
import { MARKET_CRIES } from '../src/engine/voices-florence.js';
import * as FL from '../src/settlements/florence/soundmap.js';
import { streetPlans } from '../src/settlements/florence/streetlife.js';
import { lots, ARNO, arnoZ, MERCATO, inArno } from '../src/settlements/florence/layout.js';

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

test('Florence: the Angelus at six, noon and six, the hours struck, and its map rides on the animals', () => {
  const P = profileOf('florence'), L = P.animals[LIFE];
  assert.ok(L && L.market && L.eaves && L.map === FL, 'the life carries the map');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'horse'], 'the life is not an animal');
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, La = 44 * Math.PI / 180, now = { hour, el: Math.asin(Math.cos(La) * Math.cos(H)) * 180 / Math.PI, lat: 44 };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  assert.equal(evs.filter(([, e]) => e === 'angelus').length, 3);
  assert.equal(evs.filter(([, e]) => /^strike/.test(e)).length, 24);
  assert.equal(evs.filter(([, e]) => /watch|temple|tower/.test(e)).length, 0, 'no Chinese watch or temple');
});

test('Florence: the map\'s places lie where they should', () => {
  const S = FL.sites(), all = lots();
  assert.ok(S.length >= 18, `${S.length} workshops with sounds`);
  for (const s of S) { assert.ok(all.some((l) => l.rect === s.rect), s.id); assert.ok(s.work.length); }
  assert.ok(S.some((s) => s.use === 'smith') && S.some((s) => s.use === 'inn') && S.some((s) => s.use === 'woodwork'));
  // the wells are the ones street life stands
  const built = streetPlans().flatMap((p) => p.elements).filter((e) => e.t === 'well').map((e) => e.at);
  assert.equal(FL.WELLS.length, built.length);
  for (const w of FL.WELLS) assert.ok(built.some((b) => Math.hypot(b[0] - w[0], b[1] - w[1]) < 0.01), `well ${w}`);
  // the weirs are on the river, the cries in the market, the dyers on the north bank
  for (const e of FL.EMITTERS.filter((e) => e.voice === 'weir')) assert.ok(inArno(e.at[0], e.at[1]), 'a weir in the water');
  for (const e of FL.EMITTERS.filter((e) => e.voice === 'marketCry')) assert.ok(e.at[0] > MERCATO[0] && e.at[0] < MERCATO[2] && e.at[1] > MERCATO[1] && e.at[1] < MERCATO[3], 'a cry in the market');
  for (const e of FL.EMITTERS) { assert.ok(e.hours[0] >= 0 && e.hours[1] <= 24 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.voice); assert.ok(Math.hypot(e.at[0], e.at[1]) < 400, e.voice + ' within the city'); }
  assert.ok(inHours(9, [6.5, 13]) && !inHours(15, [6.5, 13]));
  // the market is a morning's: no cry after the closing chain
  const cries = FL.EMITTERS.filter((e) => e.voice === 'marketCry');
  assert.ok(cries.every((e) => e.hours[1] <= 13.5));
  // no canals, no street tracks (sedan, hawkers' rattle, night watchman): none in Florence
  assert.equal(FL.canalSpot(0, 0), null); assert.equal(FL.streetTrack(0, 0, Math.random), null);
  assert.ok(FL.bridgeTrack(40, arnoZ(40), Math.random)?.pts.length === 2);
  // the rooms: an open shop-house, a church, a plain house, the street
  const open = S.find((s) => s.use === 'smith');
  assert.equal(FL.roomAt(open.at[0], open.at[1])?.use, 'smith');
  assert.equal(FL.roomAt(-40, -60)?.use, 'church');
  assert.equal(FL.roomAt(-152, -108), null);
  for (const u of ['inn', 'home', 'kitchen', 'cloth', 'wine', 'bread', 'spice', 'smith', 'goldsmith', 'woodwork', 'candles', 'church', 'house']) assert.ok(FL.ROOMS[u], u);
});

test('Florence: its own voices can be made, and every voice its map names exists', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('florence').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of ['marketCry', 'chainRattle', 'floCleaver', 'weir']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.3, v);
  for (const e of FL.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const s of FL.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
  for (const R0 of [...Object.values(FL.ROOMS), FL.UPPER]) for (const [v] of R0.work) assert.equal(typeof m[v], 'function', v);
  assert.ok(MARKET_CRIES.length >= 4 && new Set(MARKET_CRIES.map((c) => c.map((n) => n[0]).join(','))).size === MARKET_CRIES.length, 'distinct contours');
});

test('Florence: the placed engine makes the market by day, the weirs always, and the smithy only in the working hours', () => {
  const { ctx, count } = fake(), m = music(ctx);
  const L = profileOf('florence').animals;
  const place = (at, o = {}) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', town: 1, birds: 1, at: { x: at[0], z: at[1], yaw: 0, y: 0, hour: o.hour ?? 9 }, ...o });
  const run = (at, hour, secs = 120, o = {}) => { const c0 = count(); for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; place(at, { hour, ...o }); m.placeEvents(); } return count() - c0; };
  const mercato = run([-50, 40], 9), mercatoNight = run([-50, 40], 2, 120, { town: 0.1, birds: 0 });
  assert.ok(mercato > mercatoNight, `the market is louder by day (${mercato} against ${mercatoNight} nodes)`);
  // by the river at night the weir still runs
  const stat = (hour, at) => { place(at, { hour }); m.placeEvents(); return m.plc.stat.filter((e) => e.voice === 'weir' && m.gainAt(e.at, e.r50) >= 0.15).length; };
  assert.ok(stat(2, [FL.WEIRS[0][0] + 10, FL.WEIRS[0][1]]) >= 1, 'a weir within hearing of the bank');
  // a smith's hammer is in the hours 6.5 to 18 only
  const sm = FL.sites().find((s) => s.use === 'smith');
  assert.ok(inHours(10, sm.work[0][2]) && !inHours(22, sm.work[0][2]));
  // the cues drain in ticks of a few nodes at a time
  let worst = 0;
  while (m.cues && m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); if (ctx.currentTime > 5000) break; }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
});

test('Florence: the river is where the weirs are', () => {
  for (const [x, z] of FL.WEIRS) assert.ok(Math.abs(z - arnoZ(x)) < 1e-9 && Math.abs(z - arnoZ(x)) < ARNO.w / 2);
});
