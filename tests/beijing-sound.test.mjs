// Beijing's sounds: the hours (the Bell and Drum Towers, the night's watches), the placed voices, the map.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as BJ from '../src/settlements/qing-beijing/soundmap.js';
import { COURT_ROOMS, PAVILION_ROOMS } from '../src/settlements/qing-beijing/palace-rooms.js';
import { interiorShops, wells, AVENUE, HALLS } from '../src/settlements/qing-beijing/layout.js';

const day = (P, lat = 40) => {
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, L = lat * Math.PI / 180;
    const now = { hour, el: Math.asin(Math.cos(L) * Math.cos(H)) * 180 / Math.PI, lat };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  return evs;
};
const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return ctx;
};
const music = (hour = 12, doy = 290) => {
  const ctx = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); m.doyOverride = doy;
  m.place({ voices: {}, animals: profileOf('qing-beijing').animals, roof: 'tile', at: { x: 0, z: 262, y: 0, yaw: 0, hour } });
  return { m, ctx };
};

test('Beijing: the bell at dawn, the drum and bell at dusk, the four later watches', () => {
  const ev = day(profileOf('qing-beijing'));
  const at = (e) => ev.filter(([, x]) => x === e).map(([h]) => h);
  assert.ok(Math.abs(at('zhong')[0] - 5) < 0.05 && Math.abs(at('drum-tower')[0] - 19) < 0.05);
  for (const [n, h] of [[2, 21], [3, 23], [4, 1], [5, 3]]) assert.ok(Math.abs(at('watch:' + n)[0] - h) < 0.05, 'watch ' + n);
  assert.equal(ev.length, 6);
});

test('Beijing has its map and its life', () => {
  const L = profileOf('qing-beijing').animals[LIFE];
  assert.ok(L.map && L.market && L.patrol && L.eaves);
  assert.deepEqual(Object.keys(profileOf('qing-beijing').animals).sort(), ['dog', 'horse']);
});

test('Beijing: its own voices exist and can be made', () => {
  const { m, ctx } = music();
  const bus = m.src([5, 262], 8, { dur: 5 });
  for (const v of ['camelString', 'bjPeddler', 'huantou', 'pigeonWhistle', 'awl']) assert.equal(typeof m[v], 'function', v);
  for (const v of ['huantou', 'pigeonWhistle', 'awl']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  assert.ok(m.camelString(ctx.currentTime, bus, 1) > 20, 'a string of camels passes in half a minute or more');
  assert.ok(m.bjPeddler(ctx.currentTime, bus, 1) > 5, 'a pedlar walks his round');
});

test('Beijing: the pedlars by hour and season; the camels only by day', () => {
  const kinds = (hour, doy) => { const { m, ctx } = music(hour, doy); m.plc.hourNow = hour; const bus = m.src([5, 262], 8, { dur: 5 }); const seen = new Set(); const o = m.cry; m.cry = function (w, f0, notes) { seen.add(notes.length + ':' + notes[0].join(',')); return 0; }; m.cues = []; for (let i = 0; i < 40; i++) m.bjPeddler(ctx.currentTime, bus, 1); for (const [w, fn] of m.cues) fn(w); m.cry = o; return seen; };
  assert.equal(kinds(3, 290).size, 0, 'nobody cries at three in the morning');
  assert.ok(kinds(21, 290).size >= 1, 'the evening has its pedlars');
  const emit = BJ.EMITTERS.find((e) => e.voice === 'camelString');
  assert.ok(emit.hours[0] <= 4 && emit.hours[1] <= 18, 'camels from four, home in the afternoon');
});

test('Beijing: the scheduler runs for minutes in the lanes, at night and in the rain, without a crowd of nodes', () => {
  for (const [hour, rain] of [[10, 0], [21, 0], [14, 1]]) {
    const { m, ctx } = music(hour);
    m.plc.rain = rain;
    for (let i = 0; i < 1500; i++) { ctx.currentTime += 0.09; m.place({ voices: {}, animals: profileOf('qing-beijing').animals, roof: 'tile', rain, at: { x: 0, z: 262, y: 0, yaw: 0, hour } }); m.placeEvents(); }
  }
});

test('the map: shops, wells, rooms, tracks', () => {
  assert.equal(BJ.sites().filter((s) => s.use !== 'house').length, interiorShops().length);
  assert.equal(BJ.WELLS.length, wells().length);
  const tea = BJ.sites().find((s) => s.use === 'teahouse');
  assert.equal(BJ.roomAt(tea.at[0], tea.at[1], 0.4).use, 'teahouse');
  assert.equal(BJ.roomAt(tea.at[0], tea.at[1], 3.6).upper, true);
  assert.equal(BJ.roomAt(0, -6, 9).use, 'hall');
  assert.equal(BJ.roomAt(0, 70, 0), null, 'the great court is the open');
  assert.equal(BJ.roomAt(0, 262, 0), null, 'the avenue is the open');
  for (const r of Object.values(BJ.ROOMS)) assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1);
  const rnd = () => 0.7;
  assert.equal(BJ.canalTrack(0, 262, rnd), null, 'no moat to hear a boat on in the shop street');
  const av = BJ.avenueTrack(0, 300, () => 0.4);
  assert.ok(av && av.pts.every((p) => Math.abs(p[0]) < AVENUE[2]), 'the camels keep to the avenue');
  assert.equal(BJ.avenueTrack(-400, 0, rnd), null);
  assert.ok(BJ.streetTrack(0, 262, rnd) && BJ.canalSpot(-130, 60).d === 0);
  assert.ok(BJ.townNear(0, 262) === 1 && BJ.townNear(0, 70) < 0.2 && BJ.greenNear(0, 70) < 0.1);
  assert.ok(BJ.isWater(-127, 0) && !BJ.isWater(0, 190), 'the forecourt is dry');
});

test('the copied court rooms are those of palace-rooms.js', () => {
  assert.deepEqual(BJ.COURT_ROOMS.map((r) => r.rect), COURT_ROOMS.map((r) => r.rect));
  assert.deepEqual(BJ.COURT_ROOMS.map((r) => r.kind), COURT_ROOMS.map((r) => r.kind));
  assert.deepEqual(BJ.PAVILION_ROOMS.map((r) => r.rect), PAVILION_ROOMS.map((r) => r.rect));
  assert.ok(HALLS.taihe);
});
