// Ur's sounds (docs/settlements/ur.md §26): the map of src/settlements/ur/soundmap.js, the voices of src/engine/voices-ur.js, and a smoke test of the synthesis against a
// stand-in audio context (no sound is made: every node is a recorder). Fast: the map's data, the schedule and a few voices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { VOICES, VOICE_OWNER } from '../src/engine/voices.js';
import { UR_VOICES, UR_CRIES } from '../src/engine/voices-ur.js';
import * as UR from '../src/settlements/ur/soundmap.js';
import { COURT, HARBOUR, BRICKYARD, MARKET } from '../src/settlements/ur/layout.js';

const fake = () => {
  const param = () => new Proxy({ value: 0 }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const node = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : (typeof k === 'string' && /^[a-z]/.test(k) && !['connect', 'start', 'stop', 'disconnect'].includes(k) ? (o[k] = param()) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const ctx = { currentTime: 100, sampleRate: 8000, state: 'running', createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }) };
  for (const k of ['Gain', 'BufferSource', 'BiquadFilter', 'Oscillator', 'StereoPanner']) ctx['create' + k] = node;
  return { ctx };
};
const NEW = Object.keys(UR_VOICES), NOTES = ['urLyreNote'];
const REUSED = ['hammer', 'wheel', 'kitchen', 'jarLid', 'pourWine', 'sack', 'clothRustle', 'creak', 'drip', 'pour', 'fishRise', 'dogFar', 'cricket', 'frog', 'cicada'];
const [hx0, hz0, hx1, hz1] = HARBOUR.rect;

test('Ur has the voices of its streets riding on the animals, no bell, no call to prayer', () => {
  const P = profileOf('ur'), L = P.animals[LIFE];
  assert.ok(L.market > 0 && L.map === UR);
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'goat'], 'the life is not an animal');
  assert.ok(!P.bells && !P.adhan);
  const ev = []; let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) { const hour = (m / 60) % 24, now = { hour, el: 0, lat: 30.9 }; ev.push(...due(P, prev, now)); prev = now; }
  assert.equal(ev.length, 0, 'no bell, no watchman, no call to prayer');
});

test('Ur: every voice is its own, exists and can be made', () => {
  for (const v of NEW) assert.equal(VOICE_OWNER.get(v), 'voices-ur.js', v);
  assert.ok(NEW.every((v) => v.startsWith('ur')), 'every voice is prefixed');
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.place({ voices: {}, animals: profileOf('ur').animals, roof: 'flat' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of [...NEW, ...REUSED]) assert.equal(typeof m[v], 'function', v);
  const track = { dur: 12, pts: [[0, 0], [0, 10]] };
  for (const v of NEW.filter((k) => !NOTES.includes(k))) assert.ok(m[v](ctx.currentTime, bus, 1, track) > 0.5, v);
  for (const v of NEW) assert.equal(VOICES[v], UR_VOICES[v], v);
  const c = Object.values(UR_CRIES).map((x) => x.map((n) => n[0] + n[2]).join(','));
  assert.equal(new Set(c).size, c.length, 'every cry has its own contour');
});

test('the map: houses, rooms, planting, water', () => {
  const S = UR.sites();
  assert.ok(S.length > 60, 'the opened houses have sites');
  assert.equal(new Set(S.map((s) => s.id)).size, S.length, 'distinct ids');
  assert.ok(S.every((s) => s.id && s.at.length === 2 && s.rect.length === 4 && Array.isArray(s.work)));
  const use = (u) => S.filter((s) => s.use === u);
  for (const t of ['smith', 'potter', 'baker', 'weaver', 'brewer', 'granary', 'fisher', 'reeder']) assert.ok(use('trade:' + t).length >= 1, t);
  assert.ok(use('house').length >= 3 && use('school').length >= 1);
  const has = (s, v) => s.work.some(([x]) => x === v);
  assert.ok(use('trade:smith').every((s) => has(s, 'hammer')) && use('trade:weaver').every((s) => has(s, 'urLoom')) && use('school').every((s) => has(s, 'urRecite')));
  for (const s of S) for (const [v, gap, hours] of s.work) assert.ok(typeof VOICES[v] === 'function' && gap[0] < gap[1] && hours.length === 2, `${s.id} ${v}`);
  const w = use('trade:smith')[0];
  assert.equal(UR.roomAt(...w.at, 0.4).use, 'trade:smith');
  assert.equal(UR.roomAt(0, -118, 0), null, 'the Court is the open');
  for (const r of [...Object.values(UR.ROOMS), UR.UPPER]) { assert.ok(r.tone[0] > 100 && r.hush > 0 && r.hush <= 1); for (const [v] of r.work) assert.equal(typeof VOICES[v], 'function', v); }
  for (const s of S) assert.ok(UR.ROOMS[s.use], `a room kind for ${s.use}`);
  for (const e of UR.EMITTERS) { assert.equal(typeof VOICES[e.voice], 'function', e.voice); assert.ok(e.gap[0] < e.gap[1] && e.r50 > 0 && e.at.length === 2 && e.at.every((v) => Number.isFinite(v) && Math.abs(v) < 420) && e.hours.length === 2, e.voice); }
  assert.equal(UR.EMITTERS.filter((e) => e.voice === 'urShaduf').length, UR.SHADUFS.length);
  assert.deepEqual(UR.WELLS, []);
  assert.equal(UR.streetTrack(), null); assert.equal(UR.bridgeTrack(), null);
  assert.ok(UR.canalSpot(hx1 - 3, 0).d < 6 && UR.canalSpot(0, 0) === null);
  let q = 7; const rnd = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  assert.ok(UR.pondSpot(hx1 - 10, 0, rnd, 20) && UR.frogGround(hx1 - 20, 0) > 0.8 && UR.frogGround(100, -250) < 0.1);
  assert.ok(UR.greenNear(hx1 + 20, 0) > 0.6 && UR.greenNear(0, -250) < 0.3 && UR.treeSpot(hx1 + 20, 0, rnd) !== null);
  assert.ok(UR.townNear(0, -200) === 1 && UR.townNear(0, -118) < 0.2);
  const t = UR.TRACKS.find((x) => x.key === 'reedboat').get(hx1 - 30, 0, () => 0.3);
  assert.ok(t && t.pts.length === 2 && t.pts[0][0] > hx0 && t.pts[0][0] < hx1 && UR.TRACKS[0].get(200, 200, Math.random) === null);
  const c = UR.TRACKS.find((x) => x.key === 'asstrain').get(0, -300, () => 0.3);
  assert.ok(c && Math.abs(c.pts[0][0]) < 5 && UR.TRACKS[1].get(300, 200, Math.random) === null);
  for (const x of UR.TRACKS) assert.equal(typeof VOICES[x.voice], 'function');
});

const SCALE = 0.4; // shorter runs keep the whole file under 30 s
function listen({ x, z, y = 0, hour, doy = 125, rain = 0, indoors = false, wind = 0, secs = 300 }) {
  const { ctx } = fake();
  const m = new Music();
  m.ctx = ctx; m.amb = { muffle: ctx.createGain() }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
  m.doyOverride = doy; m.wind = wind;
  const calls = {};
  for (const v of NEW) { const o = m[v]; if (typeof o !== 'function' || NOTES.includes(v)) continue; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  for (const v of ['hammer', 'wheel']) { const o = m[v]; m[v] = function (...a) { calls[v] = (calls[v] || 0) + 1; return o.apply(this, a); }; }
  const L = profileOf('ur').animals;
  const put = () => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'flat', town: 1, birds: 1, rain, indoors, cicadas: 0.5, at: { x, z, y, yaw: 0, hour } });
  put();
  for (let i = 0; i < secs * SCALE / 0.09; i++) { ctx.currentTime += 0.09; if (i % 5 === 0) put(); m.placeEvents(); }
  return { calls, m };
}

test('Ur placed: the rites of Nanna at their hours', () => {
  const [cx, cz] = [(COURT[0] + COURT[2]) / 2, (COURT[1] + COURT[3]) / 2];
  assert.ok(listen({ x: cx + 6, z: cz, hour: 6.2, secs: 900 }).calls.urChant > 0, 'the chant of the morning rite');
  assert.ok(listen({ x: cx + 6, z: cz, hour: 18, secs: 900 }).calls.urChant > 0, 'and in the evening');
  assert.ok(!listen({ x: cx + 6, z: cz, hour: 2, secs: 600 }).calls.urChant, 'not at night');
  assert.ok(!listen({ x: cx + 6, z: cz, hour: 11, secs: 600 }).calls.urChant, 'not at midday');
  assert.ok(listen({ x: cx - 6, z: cz + 4, hour: 6.3, secs: 900 }).calls.urLilis > 0, 'the great drum in the court');
});

test('Ur placed: the trades, the quay, the brickyard, the boats and the donkey trains', () => {
  const smith = UR.sites().find((s) => s.use === 'trade:smith').at;
  assert.ok(listen({ x: smith[0], z: smith[1] + 6, hour: 10, secs: 900 }).calls.hammer > 0, 'the smith at his anvil');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 2, secs: 600 }).calls.hammer, 'not at night');
  assert.ok(!listen({ x: smith[0], z: smith[1] + 6, hour: 10, rain: 1, secs: 600 }).calls.hammer, 'not in a downpour');
  assert.ok(listen({ x: hx1 + 3, z: -58, hour: 9, secs: 900 }).calls.urHaul > 0, 'the porters at the quay');
  assert.ok(listen({ x: BRICKYARD[0] + 10, z: BRICKYARD[1] + 12, hour: 9, secs: 900 }).calls.urTread > 0, 'the clay trodden in the bed');
  assert.ok(!listen({ x: BRICKYARD[0] + 10, z: BRICKYARD[1] + 12, hour: 23, secs: 600 }).calls.urTread, 'not at night');
  const sh = UR.SHADUFS[0];
  assert.ok(listen({ x: sh[0], z: sh[1] + 3, hour: 9, secs: 900 }).calls.urShaduf > 0, 'the shaduf raised by day');
  assert.ok(!listen({ x: sh[0], z: sh[1] + 3, hour: 22, secs: 600 }).calls.urShaduf, 'not at night');
  assert.ok(listen({ x: hx1 - 20, z: 0, hour: 11, secs: 1500 }).calls.urBoat > 0, 'a reed boat poled across the basin');
  assert.ok(!listen({ x: 100, z: -250, hour: 11, secs: 300 }).calls.urBoat, 'none far from the water');
  assert.ok(listen({ x: 0, z: -300, hour: 9, secs: 1800 }).calls.urAssTrain > 0, 'a train of donkeys on the north street');
});

test('Ur placed: the night and the school', () => {
  assert.ok(listen({ x: 300, z: -150, hour: 23, secs: 900 }).calls.urJackal > 0, 'a jackal beyond the rampart at night');
  assert.ok(!listen({ x: 300, z: -150, hour: 12, secs: 600 }).calls.urJackal, 'not at noon');
  assert.ok(listen({ x: 0, z: 40, hour: 22, secs: 900 }).calls.urOwl > 0, 'the owl at night');
  const school = UR.sites().find((s) => s.use === 'school').at;
  assert.ok(listen({ x: school[0], z: school[1], hour: 10, secs: 1200 }).calls.urRecite > 0, 'the pupils reciting');
  assert.ok(!listen({ x: school[0], z: school[1], hour: 22, secs: 600 }).calls.urRecite, 'not at night');
});

test('Ur placed: indoors the rooms have their own small sounds', () => {
  const s = UR.sites().find((q) => q.use === 'house');
  const r = listen({ x: s.at[0], z: s.at[1], y: 0.3, hour: 11, indoors: true, secs: 300 });
  assert.ok(r.m.plc.room && r.m.plc.room.same === s.id, 'in the house');
  void MARKET;
});
