// Suzhou's sounds: the hours (night watches, the temple's bell and drum) and a smoke test of the
// synthesis against a stand-in audio context (no sound is made: every node is a recorder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';

const day = (P, lat = 31) => {
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

test('Suzhou: five watches, the temple bell at dawn and the drum at dusk, Hanshan at midnight', () => {
  const ev = day(profileOf('ming-suzhou'));
  const at = (e) => ev.filter(([, x]) => x === e).map(([h]) => h);
  for (const [n, h] of [[1, 19], [2, 21], [3, 23], [4, 1], [5, 3]]) {
    const [got] = at('watch:' + n);
    assert.ok(Math.abs(got - h) < 0.05, `watch ${n} at ${got}`);
  }
  assert.equal(at('hanshan').length, 1);
  assert.ok(Math.abs(at('temple-am')[0] - 4.6) < 0.05);
  assert.ok(Math.abs(at('temple-pm')[0] - 18.5) < 0.05);
  assert.equal(ev.length, 8);
  // no watchman in the other cities of the Song or Tang, no temple bell in Edo from this list
  assert.equal(day(profileOf('edo-himeji'), 35).filter(([, e]) => /watch|temple/.test(e)).length, 0);
});

test('Suzhou has the voices of its waters and streets, riding on the animals', () => {
  const P = profileOf('ming-suzhou'), L = P.animals[LIFE];
  assert.ok(L.canal && L.oar && L.hawkers && L.market && L.teahouse && L.patrol && L.eaves);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'rooster'], 'the life is not an animal');
  assert.equal(P.roof, 'xiaoqing');
  assert.equal(profileOf('paris').animals[LIFE], undefined);
});

// a stand-in for the Web Audio API: every node and parameter accepts what is asked of it, and
// the nodes made are counted
const fake = () => {
  let nodes = 0;
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => { nodes++; return new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } }); };
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx, count: () => nodes };
};

test('Suzhou: every sound can be made, and the cues are made a few at a time', () => {
  const { ctx, count } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  const L = profileOf('ming-suzhou').animals;
  const place = (o) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'xiaoqing', ...o });
  // day, by a canal, in the market streets
  place({ water: 1, town: 1, birds: 1 });
  assert.ok(m.plc.hub, 'the hubbub is on by day in town');
  for (let i = 0; i < 400; i++) { ctx.currentTime += 0.09; m.placeEvents(); if (i % 5 === 0) place({ water: 1, town: 1, birds: 1 }); }
  // rain: the roofs, the water, the eaves
  place({ water: 1, town: 1, rain: 1 });
  assert.ok(m.plc.rw, 'rain on the canal');
  for (let i = 0; i < 200; i++) { ctx.currentTime += 0.09; m.placeEvents(); }
  // night: the watchman's rounds
  for (let i = 0; i < 600; i++) { ctx.currentTime += 0.09; place({ water: 0, town: 0.35, crickets: 1 }); m.placeEvents(); }
  // the hours
  m.far = null; m.amb = { muffle: ctx.createGain() };
  for (const ev of ['watch:1', 'watch:3', 'temple-am', 'temple-pm', 'hanshan']) { ctx.currentTime += 400; m.ringBusy = 0; m.ring(ev); }
  const before = count();
  m.ringBusy = 0; m.ring('temple-pm');
  const at = count() - before;
  const q0 = m.cues.length;
  assert.ok(q0 > 100, `the service is queued (${q0})`);
  assert.ok(at < 400, `the ring itself makes few nodes (${at})`);
  // drained in ticks of 90 ms: no tick makes a crowd of nodes
  let worst = 0;
  while (m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
  // left the town: the layers go after a while
  for (let i = 0; i < 120; i++) { ctx.currentTime += 0.5; m.place({ water: 0, town: 0, animals: {}, roof: 'tile' }); }
  assert.equal(m.plc.hub, null);
  assert.equal(m.plc.rw, null);
});
