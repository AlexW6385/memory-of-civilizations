// Granada's sounds (docs/settlements/granada.md §22): the map of src/settlements/granada/soundmap.js, the voices of src/engine/voices-granada.js, and a smoke
// test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder). Data, schedule and a few voices only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { GRANADA_VOICES } from '../src/engine/voices-granada.js';
import * as GR from '../src/settlements/granada/soundmap.js';
import { HILL, LIONS, ALCAZABA, DARRO, SOUK } from '../src/settlements/granada/layout.js';
import { TRADES, HOUSE_USES } from '../src/styles/nasrid/houses.js';

const T = HILL.top;
const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(GRANADA_VOICES);
const mk = () => { const { ctx, count } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, count, m }; };

test('Granada: the profile carries the map, the call to prayer stays', () => {
  const P = profileOf('granada'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === GR);
  assert.equal(P.adhan, 1);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 60 * Math.sin((hour - 6) / 12 * Math.PI), lat: 37 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.ok(ev.filter((e) => e.startsWith('adhan:')).length >= 4, 'the five calls');
});

test('Granada: every voice is made by this settlement\'s file, prefixed gran, and can be made', () => {
  const { ctx } = fake(), { m } = mk();
  m.place({ voices: {}, animals: profileOf('granada').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  assert.ok(NEW.length >= 15);
  m.doyOverride = 150;
  for (const v of NEW) { assert.ok(v.startsWith('gran'), v); assert.equal(VOICE_OWNER.get(v), 'voices-granada.js'); assert.equal(VOICES[v], GRANADA_VOICES[v]); assert.equal(typeof m[v], 'function', v); }
  for (const v of NEW) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
  m.doyOverride = 330;
  assert.ok(m.granSwifts(ctx.currentTime, bus, 1) < 1, 'no swifts in winter');
});

test('Granada: the cues are made a few at a time', () => {
  const { ctx, count, m } = mk();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('granada').animals, roof: 'tile', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 60 });
  ['granAnafil', 'granCopper', 'granMules', 'granDoves', 'granWheel'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));
  assert.ok(m.cues.length > 60, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 160, `at most ${worst} nodes in a tick`);
});

test('the map: sites, rooms, emitters, planting, water', () => {
  const S = GR.sites();
  assert.ok(S.filter((s) => s.use.startsWith('shop:')).length >= 8 && S.filter((s) => s.use.startsWith('house:')).length >= 20 && S.some((s) => s.use === 'bath'));
  for (const t of TRADES) assert.ok(S.some((s) => s.use === 'shop:' + t), t);
  for (const u of HOUSE_USES) assert.ok(S.some((s) => s.use === 'house:' + u), u);
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  for (const t of TRADES) assert.ok(GR.ROOMS['shop:' + t], t);
  for (const u of HOUSE_USES) assert.ok(GR.ROOMS['house:' + u], u);
  // rooms
  const sh = S.find((s) => s.use === 'shop:smith');
  assert.equal(GR.roomAt(...sh.at, T + 0.4).use, sh.use);
  assert.equal(GR.roomAt(sh.at[0], sh.at[1], T + 4.6).upper, true);
  const hh = GR.HALLS.find((h) => h.id === 'hall:sisters'), hc = [(hh.rect[0] + hh.rect[2]) / 2, (hh.rect[1] + hh.rect[3]) / 2];
  assert.equal(GR.roomAt(...hc, T + 0.4).use, 'hall');
  assert.equal(GR.roomAt(58, -14, T + 0.4), null, 'the Court of the Lions is the open');
  assert.equal(GR.roomAt(19.5, 3, T + 0.4), null, 'so is the Court of the Myrtles');
  assert.equal(GR.roomAt(...GR.PRAYER[0].rect.slice(0, 2).map((v, i) => v + (i ? 5 : 5)), 0.4).use, 'mosque');
  for (const r of [...Object.values(GR.ROOMS), GR.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  // emitters
  for (const e of GR.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 440) && e.hours.length === 2, e.id || e.voice);
  assert.equal(new Set(GR.EMITTERS.map((e) => e.id)).size, GR.EMITTERS.length);
  for (const e of GR.EMITTERS) if (e.inside) assert.ok(GR.PRAYER.some((p) => p.id === e.inside) || GR.HALLS.some((h) => h.id === e.inside), e.id);
  // no pond, no boats, no bamboo; the Darro and the Acequia court's channel are the water
  assert.equal(GR.pondSpot(0, 0), null); assert.equal(GR.streetTrack(0, 0), null);
  assert.ok(GR.canalSpot(50, DARRO.z).d < 1 && GR.canalSpot(287, -10).d < 1 && GR.canalSpot(-100, 100) === null);
  assert.ok(GR.greenNear(300, 0) > 0.85 && GR.greenNear(-300, 300) < 0.2 && GR.treeSpot(300, 0, () => 0.37) !== null);
  assert.ok(GR.townNear(-50, 1) === 1 && GR.townNear(300, 0) < 0.3);
  const tr = GR.TRACKS[0], pts = tr.get(-50, 1, () => 0.2);
  assert.ok(pts && pts.pts.length === 2 && tr.get(300, 300, () => 0.2) === null);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'clothRustle', 'mortar', 'kitchen', 'recite', 'lap', 'clay']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('granada').animals, roof: 'tile', town: 1, birds: 1, rain, indoors, cicadas: 0.4, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Granada placed: the Lions\' fountain all day and night, the Darro by the river', () => {
  assert.ok(listen({ x: 58, z: -14, y: T, hour: 3, secs: 200 }).calls.granFountain > 0, 'the fountain at night');
  assert.ok(listen({ x: 58, z: -14, y: T, hour: 12, secs: 200 }).calls.granFountain > 0, 'and by day');
  assert.ok(listen({ x: 50, z: DARRO.z + 6, y: 0, hour: 12, secs: 200 }).calls.granDarro > 0, 'the river');
  assert.ok(!listen({ x: -300, z: 330, y: 0, hour: 12, secs: 120 }).calls.granFountain, 'no fountain at the far rim');
});

test('Granada placed: the guard\'s drums at dawn and dusk, not at noon; swifts only in summer', () => {
  const at = { x: (ALCAZABA[0] + ALCAZABA[2]) / 2 + 40, z: 0, y: T };
  assert.ok(listen({ ...at, hour: 5.8, secs: 500 }).calls.granAnafil > 0, 'dawn');
  assert.ok(listen({ ...at, hour: 18.3, secs: 500 }).calls.granAnafil > 0, 'dusk');
  assert.ok(!listen({ ...at, hour: 12, secs: 500 }).calls.granAnafil, 'not at noon');
  assert.ok(!listen({ ...at, hour: 5.8, rain: 0.95, secs: 300 }).calls.granAnafil, 'not in a downpour');
});

test('Granada placed: the mule string and the water carrier in the lanes by day, not at night', () => {
  const r = listen({ x: -50, z: 1.25, y: T, hour: 10, secs: 600 });
  assert.ok(r.calls.granMules > 0 || r.calls.granCry_water > 0 || r.calls.granCry_mule > 0, `in the lane ${JSON.stringify(r.calls)}`);
  const n = listen({ x: -50, z: 1.25, y: T, hour: 2, secs: 400 });
  assert.ok(!n.calls.granMules && !n.calls.granCry_water, 'asleep at night');
});

test('Granada placed: the rooms have their own small sounds', () => {
  const s = GR.sites().find((q) => q.use === 'shop:smith');
  const r = listen({ x: s.at[0], z: s.at[1], y: T + 0.5, hour: 11, indoors: true, secs: 600 });
  assert.equal(r.m.plc.room.same, s.id);
  assert.ok(r.calls.granCopper > 0, 'the coppersmith beating in his shop');
  const b = GR.sites().find((q) => q.use === 'shop:baker');
  assert.ok(listen({ x: b.at[0], z: b.at[1], y: T + 0.5, hour: 6, indoors: true, secs: 600 }).calls.granOven > 0, 'the baker\'s oven at dawn');
  const hh = GR.HALLS[0], hc = [(hh.rect[0] + hh.rect[2]) / 2, (hh.rect[1] + hh.rect[3]) / 2];
  const rr = listen({ x: hc[0], z: hc[1], y: T + 0.5, hour: 11, indoors: true, rain: 0.7, secs: 20 });
  assert.equal(rr.m.plc.room.use, 'hall');
  assert.ok(rr.m.plc.layers.room && rr.m.plc.layers.roof && rr.m.roomCut > 0 && rr.m.roomCut < 2000);
});
