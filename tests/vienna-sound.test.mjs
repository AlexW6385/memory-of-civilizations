// Vienna's sounds in spring 1902 (docs/settlements/vienna.md §15.2): the sound map's places against the town's own data, the voices (made against a stand-in
// audio context: no sound is produced, every node is a recorder), and the scheduler listening at places. Data, schedule and a few voices only: the town
// itself is not built here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES } from '../src/engine/voices.js';
import { VIENNA_VOICES } from '../src/engine/voices-vienna.js';
import * as VM from '../src/settlements/vienna/soundmap.js';
import { RADIUS, KARLSKIRCHE, lots, yards, inRect, EW, NS, OPERA, SEC, CAFE, RING_TRACKS, TRAIN } from '../src/settlements/vienna/layout.js';

const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};
const music = () => {
  const { ctx, count } = fake(), m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  return { m, ctx, count };
};
const lcg = (i) => () => ((i = (Math.imul(i, 1664525) + 1013904223) >>> 0) / 4294967296);

test('Vienna: the profile carries the map, the Angelus is the map\'s and not the engine\'s', () => {
  const P = profileOf('vienna');
  assert.ok(P.animals[LIFE].map === VM, 'the map rides on the animals');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'horse']);
  assert.equal(P.roof, 'slate');
  assert.equal(P.bells, null, 'the global Angelus would ring twice');
});

test('the map: its places are the town\'s places', async () => {
  const { town } = await import('../src/settlements/vienna/town.js');
  const plans = await town();
  const els = plans.flatMap((p) => p.elements);
  const near = (list, a, what, m = 1.5) => assert.ok(list.some((e) => (e.at ? Math.hypot(e.at[0] - a[0], e.at[1] - a[1]) : Math.hypot((e.rect[0] + e.rect[2]) / 2 - a[0], (e.rect[1] + e.rect[3]) / 2 - a[1])) < m), what);
  near(els.filter((e) => e.t === 'fountain'), VM.FOUNTAIN, 'the drinking fountain');
  near(els.filter((e) => e.t === 'maroni'), VM.MARONI, 'the Maroni roaster');
  assert.ok(els.some((e) => e.t === 'karlskirche' && Math.hypot(e.at[0] - KARLSKIRCHE[0], e.at[1] - KARLSKIRCHE[1]) < 1), 'the Karlskirche');
  assert.ok(els.filter((e) => e.t === 'tram_rails').some((e) => e.tracks[0] === RING_TRACKS[0]), 'the tram tracks');
  assert.ok(els.some((e) => e.t === 'stadtbahn_train' && Math.abs(e.z - TRAIN.z) < 0.1), 'the Stadtbahn ledge');
  assert.ok(els.filter((e) => e.t === 'naschmarkt_stall').length > 20, 'the market');
  for (const e of VM.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.hours.length === 2); assert.ok(Math.hypot(e.at[0], e.at[1]) < RADIUS, 'inside the disc: ' + e.voice); }
  for (const t of VM.TRACKS) assert.equal(typeof VOICES[t.voice], 'function', t.voice);
  assert.ok(VM.hofs().length >= 2, 'yards with a way in');
  assert.ok(VM.EMITTERS.filter((e) => e.voice === 'vieWerkelmann').every((e) => yards().some((y) => inRect(y.rect, e.at[0], e.at[1]))), 'the Werkelmann is in a Hof');
  assert.ok(VM.EMITTERS.filter((e) => e.voice === 'vieCarpet').every((e) => yards().some((y) => inRect(y.rect, e.at[0], e.at[1]))), 'the carpets are beaten in a Hof');
  assert.equal(VM.EMITTERS.filter((e) => e.voice === 'vieAngelus').length, 3, 'six, noon and six');
});

test('the map: shops that work, rooms, streets, the Wien', () => {
  const sites = VM.sites();
  assert.ok(sites.length >= 40, `${sites.length} shops and coffee houses that work`);
  for (const s of sites) { assert.ok(s.work.length > 0, s.use); for (const [v] of s.work) assert.equal(typeof VOICES[v], 'function', v); }
  assert.ok(sites.some((s) => s.id === 'cafe-museum') && sites.some((s) => s.use === 'fleischhauer'));
  const s0 = sites.find((s) => s.use === 'baeckerei');
  assert.equal(VM.roomAt(s0.at[0], s0.at[1], 1).use, 'baeckerei');
  assert.equal(VM.roomAt(s0.at[0], s0.at[1], 9).upper, true);
  const cafe = sites.find((s) => s.use === 'kaffeehaus' && s.id !== 'cafe-museum');
  assert.equal(VM.roomAt(cafe.at[0], cafe.at[1], 1).use, 'cafe');
  assert.equal(VM.roomAt(0, -26, 1).use, 'secession');
  assert.equal(VM.roomAt((OPERA[0] + OPERA[2]) / 2, (OPERA[1] + OPERA[3]) / 2, 1).use, 'opera');
  assert.equal(VM.roomAt((CAFE[0] + CAFE[2]) / 2, (CAFE[1] + CAFE[3]) / 2, 1).use, 'cafe');
  assert.equal(VM.roomAt(VM.HOME[0], VM.HOME[1], 1), null, 'the arrival is the open street');
  for (const r of [...Object.values(VM.ROOMS), VM.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1 && r.roof > 0); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  assert.ok(VM.ROOMS.church.roof < VM.ROOMS.house.roof && VM.UPPER.roof > VM.ROOMS.house.roof, 'rain is far under the vault, near under the slate');
  const rnd = () => 0.4;
  const w = VM.streetWay(0, -58, rnd, 60, 40);
  assert.ok(w && w.pts.every((p) => Math.abs(p[1] + 60) < 4), 'a Fiaker in Friedrichstraße');
  for (let k = 0; k < 60; k++) {
    const r = lcg(k + 1), x = (r() - 0.5) * 560, z = (r() - 0.5) * 560, t = VM.streetWay(x, z, r, 80, 36, 0);
    if (t) for (const [px, pz] of t.pts) assert.ok(Math.hypot(px, pz) < RADIUS && (t.ew ? EW.some((s) => Math.abs(s.z - pz) < s.w / 2) : NS.some((s) => Math.abs(s.x - px) < s.w / 2)), `a track in a street at ${x | 0}, ${z | 0}`);
  }
  const tr = VM.ringTrack(0, -150, rnd);
  assert.ok(tr && tr.pts.every((p) => RING_TRACKS.includes(p[1])), 'the tram on its track');
  assert.equal(VM.ringTrack(0, 150, rnd), null, 'none heard from the Naschmarkt');
  const tn = VM.trainTrack(0, 40, rnd);
  assert.ok(tn && tn.pts.every((p) => Math.abs(p[1] - TRAIN.z) < 0.1), 'the train on the ledge');
  const cs = VM.canalSpot(0, 40);
  assert.ok(cs && cs.d > 15 && VM.canalSpot(0, 70).d === 0, 'the Wien');
  assert.ok(VM.townNear(-150, 55) === 1 && VM.townNear(0, -26) < 0.3 && VM.leafNear(0, -230) > 0.7 && VM.leafNear(0, 200) < 0.3);
  assert.ok(lots().length > 100 && inRect(SEC, 0, -26));
});

test('every Vienna voice exists and can be made; the cries are distinct', () => {
  const { m, ctx } = music();
  m.place({ voices: {}, animals: profileOf('vienna').animals, roof: 'slate', at: { x: 0, z: -66, yaw: 0, y: 2, hour: 10 } });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of Object.keys(VIENNA_VOICES)) assert.equal(typeof m[v], 'function', v);
  const f = m.along([[0, 0], [30, 0]], 3);
  m.plc.hourNow = 10;
  for (const v of Object.keys(VIENNA_VOICES)) assert.ok(m[v](ctx.currentTime, bus, 1, f) > 0.05, v);
  assert.ok(m.vieAngelus(ctx.currentTime, bus, 1) > 30, 'the Angelus: nine strokes and the peal');
  assert.ok(!Object.keys(VIENNA_VOICES).some((k) => !k.startsWith('vie')), 'every name is prefixed');
});

function listen({ x, z, y = 2, hour, doy = 105, rain = 0, indoors = false, secs = 300 }) {
  const { m, ctx } = music();
  m.doyOverride = doy; m.wind = 0;
  const calls = {};
  for (const v of [...Object.keys(VIENNA_VOICES), 'lap', 'eaveDrip', 'boat', 'vendor', 'sedan', 'watchman', 'crossing', 'cicada', 'frog']) { const o = m[v]; if (typeof o !== 'function') continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('vienna').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'slate', water: 1, town: 1, birds: 1, rain, indoors, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls };
}

test('Vienna placed: the Ring by day, the Wien, the market, the Karlsplatz, night, rain', () => {
  let r = listen({ x: 0, z: -222, hour: 11, secs: 900 });
  assert.ok(r.calls.vieTram > 0, 'the electric on the Ring');
  assert.ok(!r.calls.boat && !r.calls.vendor && !r.calls.sedan && !r.calls.cicada && !r.calls.crossing, 'none of Suzhou\'s voices');
  r = listen({ x: 0, z: -58, hour: 14, secs: 600 });
  assert.ok(r.calls.vieFiaker > 0, 'Fiaker in the street');
  r = listen({ x: -150, z: 56, hour: 10, secs: 600 });
  assert.ok(r.calls.vieMarkt > 0, 'the Marktfrauen call');
  r = listen({ x: 112, z: -4, hour: 13, secs: 600 });
  assert.ok(r.calls.vieMaroni > 0, 'the Maroni seller');
  r = listen({ x: 100, z: 60, hour: 13, secs: 900 });
  assert.ok(r.calls.vieTrain > 0, 'the Stadtbahn on its ledge');
  r = listen({ x: 200, z: -10, hour: 12.0, secs: 400 });
  assert.ok(r.calls.vieAngelus > 0, 'the Angelus at noon');
  r = listen({ x: 200, z: -10, hour: 15, secs: 400 });
  assert.ok(!r.calls.vieAngelus, 'only at the three hours');
  r = listen({ x: 0, z: -58, hour: 3, secs: 600 });
  assert.ok(!r.calls.vieFiaker && !r.calls.vieNews && !r.calls.vieTram, 'the small hours are quiet');
  r = listen({ x: 0, z: -58, hour: 23, secs: 900 });
  assert.ok(r.calls.vieBeat > 0 || r.calls.vieFiaker > 0, 'a policeman or a late Fiaker');
  r = listen({ x: 0, z: -222, hour: 11, rain: 0.99, secs: 300 });
  assert.ok(!r.calls.vieNews && !r.calls.vieMaroni && !r.calls.vieWerkelmann, 'rain clears the criers and the organ');
  const cafe = VM.sites().find((s) => s.use === 'kaffeehaus');
  r = listen({ x: cafe.at[0], z: cafe.at[1], y: 0.2, hour: 15, secs: 400, indoors: true });
  assert.ok(r.calls.vieCafe > 0, 'the coffee house murmurs');
  const shop = VM.sites().find((s) => s.use === 'fleischhauer' || s.use === 'schuster' || s.use === 'greissler');
  r = listen({ x: shop.at[0], z: shop.at[1] + 7, hour: 11, secs: 500 });
  assert.ok(Object.keys(r.calls).some((k) => ['vieCleaver', 'vieLast', 'vieScale'].includes(k)), 'a trade at work by its door');
  r = listen({ x: 0, z: -26, y: 0.4, hour: 12, secs: 500, indoors: true });
  assert.ok(r.calls.vieHallSteps > 0 || r.calls.vieHallMurmur > 0, 'visitors in the Secession');
});
