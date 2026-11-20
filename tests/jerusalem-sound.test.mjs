// Jerusalem's sounds (docs/settlements/jerusalem.md §12.3): the map of src/settlements/jerusalem/soundmap.js, the voices of src/engine/voices-jerusalem.js, and a smoke
// test of the synthesis against a stand-in audio context (no sound is made: every node is a recorder). Data, schedule and a few voices only; the whole town is not
// built here (a few colonnades are, to check the baked table of the shops against the style's own builder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { JERUSALEM_VOICES } from '../src/engine/voices-jerusalem.js';
import * as JE from '../src/settlements/jerusalem/soundmap.js';
import { allColonnades, colKey, shopsOf, TRADES_OF, TRADE_LIST, CODE } from '../src/settlements/jerusalem/shopline.js';
import { TRADES as OPEN_TRADES } from '../src/settlements/jerusalem/openlots.js';
import { TRADES as HOUSE_TRADES } from '../src/settlements/jerusalem/houses.js';
import { buildPlan } from '../src/core/build.js';
import { shopUnit } from '../src/styles/islamic/shops.js';
import '../src/settlements/jerusalem/index.js';
import { CARDO, SEPULCHRE, SEP_Y, HARAM } from '../src/settlements/jerusalem/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const NEW = Object.keys(JERUSALEM_VOICES);
const mk = () => { const { ctx, count } = fake(), m = new Music(); m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain(); return { ctx, count, m }; };

test('Jerusalem: the profile carries the map; the call to prayer stays (five a day); the semantron is the map\'s, not a bell hour', () => {
  const P = profileOf('jerusalem'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === JE);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'goat', 'rooster']);
  assert.equal(P.adhan, 1); assert.equal(P.bells, null);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 65 * Math.sin((hour - 6) / 12 * Math.PI), lat: 31.8 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.filter((e) => e.startsWith('adhan:')).length, 5, 'the five calls');
  assert.ok(!ev.some((e) => !e.startsWith('adhan:')), 'no bells');
});

test('Jerusalem: every voice is made by this settlement\'s file, prefixed jer, and can be made', () => {
  const { ctx } = fake(), { m } = mk();
  m.place({ voices: {}, animals: profileOf('jerusalem').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  assert.ok(NEW.length >= 16);
  for (const v of NEW) { assert.ok(v.startsWith('jer'), v); assert.equal(VOICE_OWNER.get(v), 'voices-jerusalem.js'); assert.equal(VOICES[v], JERUSALEM_VOICES[v]); assert.equal(typeof m[v], 'function', v); }
  const f = m.along([[0, 0], [30, 0]], 1);
  for (const v of NEW) assert.ok((v === 'jerDonkeyTrain' ? m[v](ctx.currentTime, bus, 1, f) : m[v](ctx.currentTime, bus, 1)) > 0.5, v);
});

test('Jerusalem: the cues are made a few at a time', () => {
  const { ctx, count, m } = mk();
  m.place({ voices: { sparrow: 1 }, animals: profileOf('jerusalem').animals, roof: 'flat', town: 1, birds: 1 });
  const bus = m.src([5, 0], 8, { dur: 60 });
  ['jerCopper', 'jerPsalm', 'jerRecite', 'jerQuern', 'jerTalk', 'jerJackal'].forEach((v, i) => m[v](ctx.currentTime + i * 9, bus, 1));
  assert.ok(m.cues.length > 40, `queued (${m.cues.length})`);
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 160, `at most ${worst} nodes in a tick`);
});

test('the shops: the baked table is what the style\'s own dice give, and the floors the builder lays are the entered shops', () => {
  // (1) the dice: the first two draws of each shop's generator, as the colonnade seeds and hands it on
  const noop = new Proxy(function () {}, { get: () => noop, apply: () => noop });
  const cols = allColonnades();
  assert.ok(cols.length >= 40);
  let shops = 0, open = 0;
  for (const el of cols) {
    const [ax, az] = el.a, [bx, bz] = el.b, side = el.side, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], ns = Math.max(1, Math.round(L / 4.5)), sw = L / ns;
    let sd = Math.floor(Math.abs(ax * 7.3 + az * 13.1)) + 17, s = '';
    const rnd = () => ((sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let k = 0; k < ns; k++) {
      const d = [], rr = () => { const v = rnd(); d.push(v); return v; };
      shopUnit({ bag: { add() {} }, col: noop, o: el.a, u, side, y: el.y, H: el.h, D: el.depth, Sd: el.shops }, k * sw, k * sw + sw, rr);
      s += d[0] < 0.1 ? '-' : CODE[TRADE_LIST[Math.floor(d[1] * TRADE_LIST.length)]];
    }
    assert.equal(TRADES_OF[colKey(el)], s, colKey(el));
    shops += ns; open += [...s].filter((c) => c !== '-').length;
  }
  assert.ok(shops >= 280 && open / shops > 0.85 && open / shops < 0.95, `${open} of ${shops} open`);
  // (2) the colliders: a floor of exactly the shop's room under an open shop and none under a shut one (a few colonnades, built)
  for (const el of [cols[3], cols[cols.length - 1 - 20], cols[cols.length - 70]].filter(Boolean)) {
    const b = buildPlan({ id: 't', style: 'jerusalem-lit', origin: [0, 0], base: 0, yaw: 0, elements: [el], rooms: [], bounds: [-400, -400, 400, 400] });
    for (const sh of shopsOf(el, TRADES_OF[colKey(el)])) {
      const has = b.colliders.floors.some((f) => f.rect.every((v, i) => Math.abs(v - sh.rect[i]) < 0.02));
      assert.equal(has, !!sh.trade, `${colKey(el)} shop ${sh.i}`);
    }
  }
});

test('the open lots and their trades are those the town builds', () => {
  assert.deepEqual(OPEN_TRADES, HOUSE_TRADES);
  const H = JE.openHouses();
  assert.ok(H.length >= 36 && H.length <= 44 && H.some((h) => h.trade === 'weaver') && H.some((h) => h.trade === 'copper') && H.some((h) => !h.trade));
});

test('the map: sites, rooms, emitters, planting, tracks', () => {
  const S = JE.sites();
  assert.ok(S.filter((s) => s.use.startsWith('shop:')).length >= 250, 'the shops that are entered');
  assert.equal(S.filter((s) => s.use.startsWith('lodge:')).length, 8);
  assert.ok(S.some((s) => s.use === 'house:weaver') && S.some((s) => s.use === 'house:oil'));
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  for (const s of S) { assert.ok(JE.ROOMS[s.use], s.use); for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`); }
  // rooms
  const sh = S.find((s) => s.use === 'shop:copper');
  assert.equal(JE.roomAt(...sh.at, sh.y + 1.7).use, 'shop:copper');
  assert.equal(JE.roomAt(CARDO.x, 100, 8), null, 'the Cardo\'s roadway is the open');
  assert.equal(JE.roomAt(0, -20, HARAM.top + 4 + 1.6).use, 'dome');
  assert.equal(JE.roomAt(0, -20, HARAM.top + 1.6), null, 'on the esplanade below the platform, in the open');
  assert.equal(JE.roomAt(0, 150, HARAM.top + 1.6).use, 'aqsa');
  assert.equal(JE.roomAt(-300, -82, SEP_Y + 1.6).use, 'church');
  assert.equal(JE.roomAt(SEPULCHRE[2] - 17 - 7, -82, SEP_Y + 1.6), null, 'the atrium is open to the sky');
  const lo = S.find((s) => s.use === 'lodge:glass'); assert.equal(JE.roomAt(...lo.at, HARAM.top + 1.6).use, 'lodge:glass');
  const wv = S.find((s) => s.use === 'house:weaver'); assert.equal(JE.roomAt(...wv.at, wv.y + 1.6).use, 'house:weaver');
  for (const r of [...Object.values(JE.ROOMS), JE.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  // emitters
  for (const e of JE.EMITTERS) assert.ok(typeof VOICES[e.voice] === 'function' && e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 440) && e.hours.length === 2, e.id || e.voice);
  assert.equal(new Set(JE.EMITTERS.map((e) => e.id)).size, JE.EMITTERS.length);
  assert.ok(JE.EMITTERS.some((e) => e.voice === 'jerSemantron') && JE.EMITTERS.some((e) => e.voice === 'jerPsalm') && JE.EMITTERS.some((e) => e.voice === 'jerJackal'));
  // nothing of the Chinese streets, no water map
  assert.equal(JE.streetTrack(0, 0), null); assert.equal(JE.canalSpot(0, 0), null); assert.equal(JE.pondSpot(0, 0), null);
  assert.ok(JE.greenNear(300, 0) > 0.6 && JE.greenNear(CARDO.x, 100) < 0.2 && JE.treeSpot(300, 0, ((q) => () => (q = (q * 1664525 + 1013904223) % 4294967296) / 4294967296)(7)) !== null);
  assert.ok(JE.townNear(CARDO.x, 0) === 1 && JE.townNear(-300, 0) === 1 && JE.townNear(0, 100) < 0.5 && JE.townNear(380, 380) < 0.3);
  const tr = JE.walkTrack(CARDO.x, 100, () => 0.3);
  assert.ok(tr && tr.pts.length === 2 && Math.abs(tr.pts[0][0] - CARDO.x) < 3);
  assert.equal(JE.walkTrack(250, 250, () => 0.3), null);
  assert.equal(JE.TRACKS[0].voice, 'jerDonkeyTrain');
});

function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx, m } = mk();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of [...NEW, 'clothRustle', 'mortar', 'donkeyBray', 'kitchen', 'wheel', 'loom', 'wellBucket', 'pour', 'broom', 'lap']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const put = () => m.place({ voices: { sparrow: 1 }, animals: profileOf('jerusalem').animals, roof: 'flat', town: 1, birds: 1, rain, indoors, cicadas: 0.4, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Jerusalem placed: the Haram by day (readers, doves, the waqf\'s water, cisterns), quiet at night', () => {
  let r = listen({ x: -33, z: -20, y: 19.6, hour: 10, secs: 900 });
  assert.ok(r.calls.jerRecite > 0 && r.calls.jerDoves > 0, JSON.stringify(r.calls));
  assert.ok(!listen({ x: -33, z: -20, y: 19.6, hour: 2, secs: 600 }).calls.jerDoves, 'doves asleep at night');
  r = listen({ x: -95, z: 70, y: 15.6, hour: 10, secs: 900 });
  assert.ok(r.calls.wellBucket > 0, 'the bucket at the cistern head');
  assert.ok(listen({ x: -60, z: -29, y: 19.6, hour: 9, secs: 900 }).calls.pour > 0, 'the waqf\'s water');
  assert.ok(!listen({ x: -60, z: -29, y: 19.6, hour: 9, rain: 0.8, secs: 600 }).calls.pour, 'dry-weather sounds stop in the rain');
});

test('Jerusalem placed: the Cardo\'s hawkers and caravans by day, the trades in the shops, the donkey trains', () => {
  let r = listen({ x: CARDO.x, z: -250, y: 9, hour: 9, secs: 900 });
  assert.ok(r.calls.jerHawkWater > 0 || r.calls.jerHawkFruit > 0 || r.calls.jerHawkBread > 0, `a hawker (${JSON.stringify(r.calls)})`);
  assert.ok(!listen({ x: CARDO.x, z: -250, y: 9, hour: 2, secs: 600 }).calls.jerHawkWater, 'not at night');
  r = listen({ x: CARDO.x, z: -296, y: 9, hour: 9, secs: 900 });
  assert.ok(r.calls.jerCamel > 0, 'a camel groans at the north gate');
  r = listen({ x: CARDO.x, z: 0, y: 9, hour: 10, secs: 1200 });
  assert.ok(r.calls.jerDonkeyTrain > 0, 'a donkey train along the Cardo');
  const s = JE.sites().find((q) => q.use === 'shop:copper');
  r = listen({ x: s.at[0], z: s.at[1], y: s.y + 1.7, hour: 11, indoors: true, secs: 600 });
  assert.equal(r.m.plc.room.same, s.id);
  assert.ok(r.calls.jerCopper > 0, 'the coppersmith beating in his shop');
});

test('Jerusalem placed: the Holy Sepulchre (plainchant at the offices, the semantron at dawn and dusk), the jackals at night', () => {
  const inside = { x: -300, z: -82, y: SEP_Y + 1.6, indoors: true };
  assert.ok(listen({ ...inside, hour: 6, secs: 900 }).calls.jerPsalm > 0, 'matins');
  assert.ok(listen({ ...inside, hour: 17.6, secs: 900 }).calls.jerPsalm > 0, 'vespers');
  assert.ok(!listen({ ...inside, hour: 14, secs: 600 }).calls.jerPsalm, 'not in the afternoon');
  assert.equal(listen({ ...inside, hour: 6, secs: 20 }).m.plc.room.use, 'church');
  const atrium = { x: SEPULCHRE[2] - 17 - 7, z: -82, y: SEP_Y + 1.6 };
  assert.ok(listen({ ...atrium, hour: 5.0, secs: 400 }).calls.jerSemantron > 0, 'the semantron at dawn');
  assert.ok(listen({ ...atrium, hour: 17.5, secs: 400 }).calls.jerSemantron > 0, 'and at dusk');
  assert.ok(!listen({ ...atrium, hour: 12, secs: 400 }).calls.jerSemantron, 'not at noon');
  assert.ok(listen({ x: 250, z: 20, y: 6, hour: 23, secs: 1500 }).calls.jerJackal > 0, 'a jackal on the Mount of Olives at night');
  assert.ok(!listen({ x: 250, z: 20, y: 6, hour: 12, secs: 600 }).calls.jerJackal, 'not by day');
});

test('Jerusalem placed: the rooms have their own small sounds', () => {
  const lo = JE.sites().find((q) => q.use === 'lodge:glass');
  const r = listen({ x: lo.at[0], z: lo.at[1], y: HARAM.top + 1.6, hour: 11, indoors: true, secs: 600 });
  assert.equal(r.m.plc.room.same, lo.id);
  assert.ok(r.calls.jerGlass > 0, 'the glass-lamp makers\' furnace');
  const rr = listen({ x: 0, z: -20, y: HARAM.top + 5.6, hour: 11, indoors: true, rain: 0.7, secs: 20 });
  assert.equal(rr.m.plc.room.use, 'dome');
  assert.ok(rr.m.plc.layers.room && rr.m.plc.layers.roof && rr.m.roomCut > 0 && rr.m.roomCut < 2000);
});
