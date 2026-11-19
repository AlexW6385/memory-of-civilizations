// Ottoman Istanbul's placed sounds: the map's places, the voices' existence, the hours and seasons, and a smoke test against a stand-in audio context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import * as IST from '../src/settlements/ottoman-istanbul/soundmap.js';
import { OTTOMAN_VOICES, TRADES_IST, pickIst, seasonIst } from '../src/engine/voices-ottoman.js';
import { arastaShops } from '../src/styles/ottoman/index.js';
import { arastaRows, arastaShopData, COFFEE, CESMES, HAMAM, TOMB } from '../src/settlements/ottoman-istanbul/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = () => {
  const { ctx, count } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  return { m, ctx, count };
};

test('Istanbul: five calls to prayer a day, the Hanafi asr, no bells; the map rides on the animals', () => {
  const P = profileOf('ottoman-istanbul'), L = P.animals[LIFE];
  assert.equal(P.adhan, 2);
  assert.equal(P.bells, null);
  assert.ok(L.map === IST && L.market, 'the map is the place\'s');
  assert.equal(IST.schedule, 'placedOttoman');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'horse']);
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, la = 41 * Math.PI / 180;
    const now = { hour, el: Math.asin(Math.cos(la) * Math.cos(H)) * 180 / Math.PI, lat: 41 };
    for (const e of due(P, prev, now)) evs.push(e);
    prev = now;
  }
  assert.deepEqual(evs.filter((e) => e.startsWith('adhan')).sort(), ['adhan:asr', 'adhan:dhuhr', 'adhan:fajr', 'adhan:isha', 'adhan:maghrib']);
});

test('the map: the shops equal the style\'s, the emitters are inside the settlement and their voices exist', () => {
  for (const el of arastaRows()) {
    const a = arastaShops({ ...el, t: 'arasta' }), b = arastaShopData().filter((s) => s.f === el.f);
    assert.equal(a.length, b.length);
    a.forEach((s, i) => assert.ok(Math.abs(s.zc - b[i].zc) < 1e-9 && Math.abs(s.za - b[i].za) < 1e-9));
  }
  assert.equal(arastaShopData().length, 40);
  const { m } = music();
  const E = IST.emitters();
  assert.ok(E.length > 40 && E.length < 130, `${E.length} emitters`);
  for (const e of E) {
    assert.equal(typeof m[e.voice], 'function', e.voice);
    assert.ok(Math.hypot(e.at[0], e.at[1]) < 400, `${e.id} inside the settlement`);
    assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.id);
    assert.ok(e.hours[0] >= 0 && e.hours[1] <= 24, e.id);
  }
  assert.equal(new Set(E.map((e) => e.id)).size, E.length, 'ids are unique');
  // the çeşmes' taps, the bath, the coffee house and the tomb are where the layout has them
  assert.equal(IST.TAPS.length, CESMES.length);
  const at = (id) => E.find((e) => e.id === id).at;
  assert.ok(at('hamam')[0] > HAMAM[0] && at('hamam')[0] < HAMAM[2]);
  const c = COFFEE().rect;
  assert.ok(at('kahve:tavla')[0] > c[0] && at('kahve:tavla')[0] < c[2]);
  assert.ok(Math.hypot(at('recite:tomb')[0] - TOMB.c[0], at('recite:tomb')[1] - TOMB.c[1]) < 4);
  // the coppersmiths are in the east row, the cloth sellers in the west
  for (const e of E.filter((x) => x.voice === 'copperBeat' && x.id.startsWith('ar:'))) assert.ok(e.at[0] > 90, e.id);
});

test('rooms: the hall, the tomb, the shops, the coffee house, a house', () => {
  const room = (x, z, y = 22) => IST.roomAt(x, z, y);
  assert.equal(room(0, 20)?.use, 'mosque');
  assert.equal(room(TOMB.c[0], TOMB.c[1])?.use, 'tomb');
  assert.equal(room(120, 66)?.use, 'hamam');
  const s = arastaShopData()[3];
  assert.equal(room(s.xb + s.sg * 2, s.zc)?.use, 'shop');
  const c = COFFEE().rect;
  assert.equal(room((c[0] + c[2]) / 2, (c[1] + c[3]) / 2)?.use, 'kahve');
  assert.equal(room(0, -91), null, 'the court is open air');
  for (const k of Object.keys(IST.ROOMS)) { const R = IST.ROOMS[k]; assert.ok(R.tone[0] > 50 && R.hush > 0 && R.hush <= 1, k); for (const [v] of R.work) assert.equal(typeof Music.prototype[v], 'function', k + ':' + v); }
  for (const [v] of IST.UPPER.work) assert.equal(typeof Music.prototype[v], 'function', v);
  // every open shop with a sound is a room of its own
  for (const st of IST.sites()) assert.ok(IST.roomAt(st.at[0], st.at[1], 0) !== null, st.id);
});

test('the trades: each its own contour, the hours and the seasons', () => {
  const cries = Object.entries(TRADES_IST).filter(([, T]) => T.cry).map(([k, T]) => [k, JSON.stringify(T.cry)]);
  assert.equal(new Set(cries.map(([, c]) => c)).size, cries.length, 'no two cries alike');
  const D = { winter: 20, spring: 125, summer: 200, autumn: 290 };
  const seen = (h, d) => { const s = new Set(); for (let k = 0; k < 300; k++) s.add(pickIst(h, d, k / 300)); return s; };
  assert.ok(seen(8, D.summer).has('simit') && !seen(15, D.summer).has('simit'), 'simit in the morning');
  assert.ok(seen(19, D.winter).has('boza') && !seen(19, D.summer).has('boza'), 'boza on cold evenings');
  assert.ok(seen(13, D.summer).has('sherbet') && !seen(13, D.winter).has('sherbet'), 'sherbet in the warm months');
  assert.ok(seen(12, D.spring).has('water') && !seen(20, D.spring).has('water'));
  assert.equal(seasonIst('swift', 20), 0);
  assert.ok(seasonIst('swift', 180) > 0.9);
});

test('every voice can be made, with a few nodes each', () => {
  const { m, ctx, count } = music();
  m.place({ voices: {}, animals: profileOf('ottoman-istanbul').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 }), f = m.along([[0, 0], [20, 0]], 1);
  for (const v of Object.keys(OTTOMAN_VOICES)) assert.equal(typeof m[v], 'function', v);
  for (const v of ['copperBeat', 'goldTap', 'lastTap', 'chop', 'ladle', 'ovenPeel', 'tavla', 'trayCups', 'fountain', 'tap', 'hamamDrip', 'recite', 'cups', 'ney', 'swifts', 'gull', 'pigeons', 'crowCaw', 'catCry', 'donkeyBray']) {
    const c0 = count();
    assert.ok(m[v](ctx.currentTime, bus, 1) > 0.3, v);
    assert.ok(count() - c0 < 700, `${v} made ${count() - c0} nodes`);
  }
  for (const t of Object.keys(TRADES_IST)) assert.ok(m.istVendor(ctx.currentTime, bus, 1, f, t) > 3, t);
  assert.ok(m.patrolSteps(ctx.currentTime, bus, 1, f) > 3);
});

test('the scheduler: a day, a rainy hour and a night at the way in and in the avenue, a few nodes a tick', () => {
  const { m, ctx, count } = music();
  const L = profileOf('ottoman-istanbul').animals;
  const place = (o, at) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', at, ...o });
  let worst = 0, fired = 0;
  for (const [at, o] of [
    [{ x: 0, z: -91, y: 22, yaw: 0, hour: 9 }, { town: 1, birds: 1 }],
    [{ x: -84, z: -30, y: 22, yaw: 1.5, hour: 12 }, { town: 1, birds: 1 }],
    [{ x: 100, z: -30, y: 22, yaw: 0, hour: 11 }, { town: 1, birds: 1 }],
    [{ x: 0, z: -91, y: 22, yaw: 0, hour: 15 }, { town: 1, rain: 1 }],
    [{ x: -84, z: -30, y: 22, yaw: 0, hour: 1 }, { town: 0.35, crickets: 1 }],
    [{ x: 0, z: 20, y: 22, yaw: 0, hour: 12 }, { town: 0.3, indoors: true }],
  ]) {
    for (let i = 0; i < 700; i++) {
      ctx.currentTime += 0.09; place(o, at);
      const c0 = count(); m.placeEvents(); worst = Math.max(worst, count() - c0);
      fired = Math.max(fired, (m.emit || []).length);
    }
  }
  assert.ok(worst < 250, `at most ${worst} nodes in a tick`);
  assert.ok(fired > 0, 'sounds were placed');
  assert.equal(m.plc.room?.use, 'mosque', 'inside the hall');
});
