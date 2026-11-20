// Samarkand's sounds (docs/settlements/timurid-samarkand.md §20.3): the map of src/settlements/timurid-samarkand/soundmap.js, the voices of
// src/engine/voices-timurid.js, and a smoke test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder).
// Data, schedule and a few voices only; the town is not built (layout.js is pure data).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { TIMURID_VOICES } from '../src/engine/voices-timurid.js';
import * as SM from '../src/settlements/timurid-samarkand/soundmap.js';
import { TAPCHANS, ARYK_X, houses, SQUARE } from '../src/settlements/timurid-samarkand/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(TIMURID_VOICES);
const mk = () => { const { ctx, count } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, count, m }; };
const day = (P, lat = 39.65) => {
  const evs = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, L = lat * Math.PI / 180;
    const now = { hour, el: Math.asin(Math.cos(L) * Math.cos(H)) * 180 / Math.PI, lat };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  return evs;
};

test('Samarkand: the profile carries the map, the five calls to prayer stay, no bells', () => {
  const P = profileOf('timurid-samarkand'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === SM);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'horse']);
  assert.equal(P.bells, null);
  const ev = day(P).filter(([, e]) => e.startsWith('adhan'));
  assert.equal(ev.length, 5);
});

test('Samarkand: every voice is made by this settlement\'s file, prefixed tim, and can be made', () => {
  const { ctx } = fake(), { m } = mk();
  m.place({ voices: {}, animals: profileOf('timurid-samarkand').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 }), path = m.along([[0, 0], [20, 0]], 1.1);
  assert.ok(NEW.length >= 12);
  for (const v of NEW) { assert.ok(v.startsWith('tim'), v); assert.equal(VOICE_OWNER.get(v), 'voices-timurid.js'); assert.equal(VOICES[v], TIMURID_VOICES[v]); assert.equal(typeof m[v], 'function', v); }
  for (const v of NEW) assert.ok(m[v](ctx.currentTime, bus, 1, path) > 0.5, v);
});

test('Samarkand: the cues are made a few at a time', () => {
  const { ctx, count, m } = mk();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('timurid-samarkand').animals, roof: 'flat', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 60 });
  ['timNawbat', 'timDutar', 'timDoira', 'timCopper', 'timLecture'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));
  assert.ok(m.cues.length > 60, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 160, `at most ${worst} nodes in a tick`);
});

test('the map: the rooms are those of the plans, sites, emitters, planting, water', () => {
  const S = SM.sites();
  assert.equal(SM.ENTERED.length, 10, 'the ten entered shops of the rows');
  assert.ok(S.filter((s) => s.use.startsWith('trade:')).length >= 60, 'the trade rooms of the houses');
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  for (const t of ['potter', 'baker', 'smith', 'weaver', 'carpenter', 'grocer', 'papermaker']) assert.ok(SM.ROOMS['trade:' + t] && S.some((s) => s.use === 'trade:' + t), t);
  for (const r of [...Object.values(SM.ROOMS), SM.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  // the rooms
  assert.equal(SM.roomAt(-52, -22, 0.2).use, 'classroom');
  assert.equal(SM.roomAt(-115, 0, 0.2).use, 'mosque');
  assert.equal(SM.roomAt(0, 0, 0), null, 'the Registan is the open');
  const sh = SM.ENTERED[0]; assert.equal(SM.roomAt(...sh.at, 0.5).use, 'shop');
  const tr = S.find((s) => s.use === 'trade:smith'); assert.equal(SM.roomAt(...tr.at, 0.3).same, tr.id);
  assert.equal(SM.roomAt(...tr.at, 8).upper, true);
  // emitters
  for (const e of SM.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 440) && e.hours.length === 2, e.id || e.voice);
  assert.equal(new Set(SM.EMITTERS.map((e) => e.id)).size, SM.EMITTERS.length, 'distinct ids');
  assert.ok(SM.EMITTERS.filter((e) => e.voice === 'timAryk').length >= 20 && SM.EMITTERS.filter((e) => e.voice.startsWith('timHawk')).length >= 6);
  assert.equal(SM.EMITTERS.filter((e) => e.voice === 'teaTalk').length, TAPCHANS.length);
  for (const t of SM.TRACKS) assert.ok(typeof VOICES[t.voice] === 'function' && t.gap[0] < t.gap[1] && typeof t.ok(12, 0) === 'boolean', t.key);
  // water, planting, the town
  assert.equal(SM.pondSpot(0, 0), null); assert.equal(SM.streetTrack(0, 0), null);
  const ax = ARYK_X.find((a) => SM.canalSpot(a, 100)); assert.ok(ax !== undefined && SM.canalSpot(0, 0) === null || SM.canalSpot(ax, 100).d < 5);
  assert.ok(SM.greenNear(0, 300) > 0.8 && SM.greenNear(0, 0) < 0.2 && SM.treeSpot(0, 290, () => 0.37) !== null);
  assert.ok(SM.townNear(0, 0) === 1 && SM.townNear(100, 58) === 1 && SM.townNear(300, 100) < 0.3);
  assert.ok(houses().length > 100 && SQUARE[2] > 0);
  // the tracks on the lanes
  const rnd = (() => { let s = 7; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const lt = SM.TRACKS.find((t) => t.key === 'carrier').get(10, 100, rnd), bt = SM.TRACKS.find((t) => t.key === 'caravan').get(100, 40, rnd);
  assert.ok(lt && lt.pts.length === 2 && bt && bt.pts.length === 2);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...NEW, 'teaTalk', 'donkeyBray', 'kitchen', 'hammer', 'wheel', 'loom', 'paper', 'lap']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('timurid-samarkand').animals, roof: 'flat', town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Samarkand placed: the dusk nawbat, the hawkers by day, the tea-house evening music', () => {
  assert.ok(listen({ x: 14, z: 0, hour: 18.1, secs: 300 }).calls.timNawbat > 0, 'the nawbat at dusk, heard from the Registan');
  assert.ok(!listen({ x: 14, z: 0, hour: 12, secs: 300 }).calls.timNawbat, 'not at noon');
  assert.ok(!listen({ x: 14, z: 0, hour: 18.1, rain: 0.95, secs: 300 }).calls.timNawbat, 'not in a downpour');
  const r = listen({ x: -20, z: -16, hour: 9, secs: 600 });
  assert.ok(r.calls.timHawkMelon > 0 || r.calls.timHawkBread > 0 || r.calls.timHawkCloth > 0, `a hawker (${JSON.stringify(r.calls)})`);
  assert.ok(!listen({ x: -20, z: -16, hour: 23, secs: 400 }).calls.timHawkCloth, 'not at night');
  const t = TAPCHANS[4];
  assert.ok(listen({ x: t[0], z: t[1], hour: 19, secs: 900 }).calls.timDutar > 0, 'the dutar at evening');
  assert.ok(!listen({ x: t[0], z: t[1], hour: 9, secs: 600 }).calls.timDutar, 'not at nine');
});

test('Samarkand placed: the madrasa, a trade room, the camp', () => {
  const r = listen({ x: -52, z: -22, y: 0.2, hour: 10, indoors: true, secs: 900 });
  assert.equal(r.m.plc.room.same, 'classroom');
  assert.ok(r.calls.timLecture > 0, 'the lecture');
  const s = SM.sites().find((q) => q.use === 'trade:smith');
  const q = listen({ x: s.at[0], z: s.at[1], y: 0.3, hour: 11, indoors: true, secs: 600 });
  assert.equal(q.m.plc.room.same, s.id);
  assert.ok(q.calls.hammer > 0, 'the smith at his anvil');
  assert.ok(listen({ x: 33, z: -12, hour: 9, secs: 700 }).calls.timCamel > 0, 'a camel groans at the camp');
});

test('the map\'s rooms are the rooms of the plans', async () => {
  const { default: registan } = await import('../src/settlements/timurid-samarkand/plan.js');
  const by = Object.fromEntries(registan.rooms.map((r) => [r.id, r.rect]));
  assert.deepEqual(by.classroom, SM.CLASSROOM); assert.deepEqual(by.library, SM.LIBRARY); assert.deepEqual(by['lecture hall'], SM.LECTURE);
  assert.deepEqual(by['hall of the sciences'], SM.SCIENCES); assert.deepEqual(by.mosque, SM.MADRASA_MOSQUE); assert.deepEqual(by['khanqah hall'], SM.KHANQAH_HALL);
  assert.deepEqual(by['pishtaq passage'], SM.PASSAGE);
});
