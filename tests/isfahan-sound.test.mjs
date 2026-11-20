// Isfahan's sounds (docs/settlements/isfahan.md §26.3): the map of src/settlements/isfahan/soundmap.js, the voices of src/engine/voices-isfahan.js, and a smoke
// test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder). Data, schedule and a few voices only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { ISFAHAN_VOICES } from '../src/engine/voices-isfahan.js';
import * as IS from '../src/settlements/isfahan/soundmap.js';
import { SQUARE, TEAHOUSE, BAZAAR, DOVECOTES, openHouses, arcadeBays } from '../src/settlements/isfahan/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(ISFAHAN_VOICES);
const mk = () => { const { ctx, count } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, count, m }; };

test('Isfahan: the profile carries the map, the call to prayer stays, no bell hours', () => {
  const P = profileOf('isfahan'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === IS);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'horse']);
  assert.equal(P.adhan, 1); assert.equal(P.bells, null);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 60 * Math.sin((hour - 6) / 12 * Math.PI), lat: 33 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.ok(ev.filter((e) => e.startsWith('adhan:')).length >= 4, 'the five calls');
});

test('Isfahan: every voice is made by this settlement\'s file, prefixed isf, and can be made', () => {
  const { ctx } = fake(), { m } = mk();
  m.place({ voices: {}, animals: profileOf('isfahan').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  assert.ok(NEW.length >= 15);
  for (const v of NEW) { assert.ok(v.startsWith('isf'), v); assert.equal(VOICE_OWNER.get(v), 'voices-isfahan.js'); assert.equal(VOICES[v], ISFAHAN_VOICES[v]); assert.equal(typeof m[v], 'function', v); }
  for (const v of NEW) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.5, v);
});

test('Isfahan: the cues are made a few at a time', () => {
  const { ctx, count, m } = mk();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('isfahan').animals, roof: 'flat', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 60 });
  ['isfNaqqareh', 'isfPolo', 'isfDaf', 'isfSantur', 'isfNaqqal'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));
  assert.ok(m.cues.length > 60, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 160, `at most ${worst} nodes in a tick`);
});

test('the map: sites, rooms, emitters, planting, water', () => {
  const S = IS.sites(), open = arcadeBays().filter((b) => b.open);
  assert.ok(S.filter((s) => s.use.startsWith('shop:')).length === open.length && open.length >= 6, 'every arcade shop that is entered');
  assert.ok(S.some((s) => s.use === 'kitchen') && S.some((s) => s.use === 'store' || s.use === 'kitchen'));
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  for (const t of ['cloth', 'carpet', 'copper', 'spice', 'pottery']) assert.ok(IS.ROOMS['shop:' + t], t);
  // the bazaar's trades are the style's: both sides, five trades, in the order the builder lays them
  const bs = IS.bazaarShops();
  assert.ok(bs.length >= 20 && new Set(bs.map((b) => b.trade)).size === 5);
  assert.equal(IS.bazaarTrade(0, 1), 'cloth'); assert.equal(IS.bazaarTrade(0, -1), 'copper');
  // rooms
  const sh = S.find((s) => s.use.startsWith('shop:'));
  assert.equal(IS.roomAt(...sh.at, 0.4).use, sh.use);
  assert.equal(IS.roomAt(sh.at[0], sh.at[1], 4.6).upper, true);
  assert.equal(IS.roomAt(...[(TEAHOUSE[0] + TEAHOUSE[2]) / 2, (TEAHOUSE[1] + TEAHOUSE[3]) / 2], 0.4).use, 'qahveh');
  assert.equal(IS.roomAt(BAZAAR.x, -340, 0.1).use, 'bazaar');
  assert.equal(IS.roomAt(-98, -42, 32.5).use, 'music');
  assert.equal(IS.roomAt(0, 100, 0), null, 'the square is the open');
  const k = S.find((s) => s.use === 'kitchen'); assert.equal(IS.roomAt(...k.at, 0.5).use, 'kitchen');
  for (const r of [...Object.values(IS.ROOMS), IS.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  // emitters
  for (const e of IS.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 440) && e.hours.length === 2, e.id || e.voice);
  assert.equal(IS.EMITTERS.filter((e) => e.voice === 'isfPigeons').length, DOVECOTES.length);
  assert.equal(new Set(IS.EMITTERS.map((e) => e.id)).size, IS.EMITTERS.length);
  // no pond, no boats, no bamboo; water at the canal, the avenue
  assert.equal(IS.pondSpot(0, 0), null); assert.equal(IS.streetTrack(0, 0), null);
  assert.ok(IS.canalSpot(-67, 0).d < 1 && IS.canalSpot(-361, 0).d < 1 && IS.canalSpot(0, 100) === null);
  assert.ok(IS.greenNear(-221, -100) > 0.85 && IS.greenNear(300, 300) < 0.2 && IS.treeSpot(-221, -100, () => 0.37) !== null);
  assert.ok(IS.townNear(0, 100) === 1 && IS.townNear(0, -340) === 1 && IS.townNear(-221, -100) < 0.3);
  assert.ok(openHouses().length >= 20);
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'isfNaqqareh', 'clothRustle', 'mortar', 'teaTalk', 'donkeyBray', 'kitchen', 'recite', 'lap']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('isfahan').animals, roof: 'flat', town: 1, birds: 1, rain, indoors, cicadas: 0.4, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Isfahan placed: the naqqareh-khaneh at sunset, midnight and sunrise, not at noon', () => {
  const at = { x: 0, z: -280 };
  assert.ok(listen({ ...at, hour: 18.0, secs: 400 }).calls.isfNaqqareh > 0, 'sunset');
  assert.ok(listen({ ...at, hour: 23.9, secs: 400 }).calls.isfNaqqareh > 0, 'midnight');
  assert.ok(listen({ ...at, hour: 6.0, secs: 400 }).calls.isfNaqqareh > 0, 'sunrise');
  assert.ok(!listen({ ...at, hour: 12, secs: 400 }).calls.isfNaqqareh, 'not at noon');
  assert.ok(!listen({ ...at, hour: 18.0, rain: 0.95, secs: 300 }).calls.isfNaqqareh, 'not in a downpour');
  assert.ok(listen({ x: 0, z: 250, hour: 18.0, secs: 400 }).calls.isfNaqqareh > 0, 'heard through the whole city (Tavernier), even at the Shah Mosque');
  assert.ok(!listen({ x: 380, z: 380, hour: 18.0, secs: 300 }).calls.isfNaqqareh, 'not at the far rim');
});

test('Isfahan placed: the bazaar, the square, the trades by day and not at night', () => {
  let r = listen({ x: 0, z: -330, hour: 11, secs: 900 });
  assert.ok(r.calls.isfNeyAnban > 0 || r.calls.isfDaf > 0, `pipe or drum in the bazaar (${JSON.stringify(r.calls)})`);
  assert.ok(!listen({ x: 0, z: -330, hour: 2, secs: 600 }).calls.isfDaf, 'not at night');
  r = listen({ x: -24, z: 200, hour: 9, secs: 900 });
  assert.ok(r.calls.isfHawkMelon > 0, 'the melon seller');
  assert.ok(!listen({ x: -24, z: 200, hour: 22, secs: 600 }).calls.isfHawkMelon, 'not at night');
  const cu = IS.bazaarShops().find((b) => b.trade === 'copper'); void cu;
  r = listen({ x: 0, z: 100, hour: 17.2, secs: 900 });
  assert.ok(r.calls.isfPolo > 0, 'polo at evening');
  assert.ok(!listen({ x: 0, z: 100, hour: 10, secs: 600 }).calls.isfPolo, 'not at ten');
  r = listen({ x: -67, z: -120, hour: 10, secs: 600 });
  assert.ok(r.calls.isfSaqqa > 0 || r.calls.isfChannel > 0 || r.calls.lap > 0, 'water at the canal');
});

test('Isfahan placed: the coffeehouse, the music hall, the pigeons, the caravan', () => {
  const [tx, tz] = [(TEAHOUSE[0] + TEAHOUSE[2]) / 2, (TEAHOUSE[1] + TEAHOUSE[3]) / 2];
  let r = listen({ x: tx, z: tz, y: 0.3, hour: 19, indoors: true, secs: 700 });
  assert.equal(r.m.plc.room.same, 'qahveh');
  assert.ok(r.calls.teaTalk > 0 && r.calls.isfGhalyan > 0, `talk and the water pipe ${JSON.stringify(r.calls)}`);
  assert.ok(listen({ x: tx, z: tz, y: 0.3, hour: 19, indoors: true, secs: 1500 }).calls.isfNaqqal > 0, 'the reciter');
  assert.ok(listen({ x: -98, z: -42, y: 32.5, hour: 18, indoors: true, secs: 1500 }).calls.isfSantur > 0, 'the santur in the music hall');
  const d = DOVECOTES[0].c;
  assert.ok(listen({ x: d[0], z: d[1], hour: 10, secs: 600 }).calls.isfPigeons > 0, 'pigeons at the tower');
  assert.ok(!listen({ x: d[0], z: d[1], hour: 23, secs: 400 }).calls.isfPigeons, 'asleep at night');
  r = listen({ x: 0, z: BAZAAR.z1 - 9, hour: 9, secs: 700 });
  assert.ok(r.calls.isfCamel > 0, 'a camel groans at the caravan');
});

test('Isfahan placed: the rooms have their own small sounds', () => {
  const s = IS.sites().find((q) => q.use === 'shop:copper');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.5, hour: 11, indoors: true, secs: 600 });
  assert.equal(r.m.plc.room.same, s.id);
  assert.ok(r.calls.isfCopper > 0, 'the coppersmith beating in his shop');
  const rr = listen({ x: -98, z: -42, y: 32.5, hour: 11, indoors: true, rain: 0.7, secs: 20 });
  assert.equal(rr.m.plc.room.use, 'music');
  assert.ok(rr.m.plc.layers.room && rr.m.plc.layers.roof && rr.m.roomCut > 0 && rr.m.roomCut < 2000);
});
