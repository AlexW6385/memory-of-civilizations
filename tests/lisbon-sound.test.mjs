// Lisbon's sounds (src/settlements/manueline-lisbon/soundmap.js, src/engine/voices-lisbon.js, docs/settlements/manueline-lisbon.md §13.2):
// the schedule of its bells, the voices made against a stand-in audio context (no sound is made: every node is a recorder), the places
// of its emitters against the layout, and the day's scheduling by the placed-sound engine on the yard, the Terreiro and in a shop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileOf, due, LIFE } from '../src/engine/soundscape.js';
import { Music } from '../src/engine/audio.js';
import { inHours } from '../src/engine/voices.js';
import { LSB_CRIES } from '../src/engine/voices-lisbon.js';
import * as LS from '../src/settlements/manueline-lisbon/soundmap.js';
import { lots, inRect, YARD, TERREIRO, CHURCH, SE, SLIPS, wet } from '../src/settlements/manueline-lisbon/layout.js';

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

test('Lisbon: the Angelus three times a day, no Chinese watch or temple, and the map rides on the animals', () => {
  const P = profileOf('manueline-lisbon'), L = P.animals[LIFE];
  assert.ok(L && L.market && L.eaves && L.map === LS, 'the life carries the map');
  assert.deepEqual(Object.keys(P.animals).sort(), ['dog', 'donkey', 'rooster'], 'the life is not an animal');
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, La = 38.7 * Math.PI / 180, now = { hour, el: Math.asin(Math.cos(La) * Math.cos(H)) * 180 / Math.PI, lat: 38.7 };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  assert.equal(evs.filter(([, e]) => e === 'angelus').length, 3);
  assert.equal(evs.filter(([, e]) => /watch|temple|tower|zhong|adhan/.test(e)).length, 0);
});

test('Lisbon: the places lie where they should', () => {
  const S = LS.sites(), all = lots();
  assert.ok(S.length >= 20, `${S.length} open houses with sounds`);
  for (const s of S) { assert.ok(all.some((l) => l.rect === s.rect && l.open), s.id); assert.ok(s.work.length); for (const [, gap, hours] of s.work) assert.ok(gap[0] > 0 && gap[1] >= gap[0] && hours[0] < hours[1]); }
  assert.ok(S.some((s) => s.use === 'tavern') && S.some((s) => s.use === 'apothecary') && S.some((s) => s.use === 'parrots'));
  // the yard's work is in the yard, on the slips; the cries are on the Terreiro; the fountains are on dry land; the bells within the town
  for (const e of LS.EMITTERS.filter((e) => /^lsb(Mallet|Adze|Saw|Pitch|Crane|Rope)$/.test(e.voice))) assert.ok(inRect([YARD[0] - 16, YARD[1], YARD[2] + 16, YARD[3]], e.at[0], e.at[1]), `${e.voice} in the yard`);
  assert.equal(LS.EMITTERS.filter((e) => e.voice === 'lsbMallet').length, SLIPS.length, 'a caulker at each hull');
  for (const e of LS.EMITTERS.filter((e) => e.voice === 'lsbCry' && e.hours[1] === 13)) assert.ok(inRect(TERREIRO, e.at[0], e.at[1]), 'a fishwife in the market');
  for (const e of LS.EMITTERS.filter((e) => e.voice === 'lsbFountain')) assert.ok(wet(e.at[0], e.at[1]) > 1, 'a fountain on land');
  for (const e of LS.EMITTERS) { assert.ok(e.hours[0] >= -0.1 && e.hours[1] <= 24 && e.gap[0] > 0 && e.gap[1] >= e.gap[0] && e.r50 > 0, e.voice); assert.ok(Math.hypot(e.at[0], e.at[1]) < 400, e.voice + ' within the city'); }
  // the monastery's bell is over the church, the curfew from the Sé at nine in the evening
  for (const e of LS.EMITTERS.filter((e) => e.voice === 'lsbToll')) assert.ok(inRect(CHURCH, e.at[0], e.at[1]));
  const cur = LS.EMITTERS.find((e) => e.voice === 'lsbCurfew');
  assert.ok(inRect(SE, cur.at[0], cur.at[1]) && inHours(21.2, cur.hours) && !inHours(12, cur.hours));
  // the market is a morning's; the mallets stop at dusk and are silent at night
  assert.ok(LS.EMITTERS.filter((e) => e.voice === 'lsbCry' && e.hours[1] === 13).every((e) => !inHours(15, e.hours)));
  assert.ok(LS.EMITTERS.filter((e) => e.voice === 'lsbMallet').every((e) => inHours(10, e.hours) && !inHours(22, e.hours) && !inHours(3, e.hours)));
  // no canals, no engine street tracks; the tracks keep to streets
  assert.equal(LS.canalSpot(0, 0), null); assert.equal(LS.streetTrack(0, 0, Math.random), null);
  for (const T of LS.TRACKS) { const t = T.get(-20, 5, Math.random, 90, 40); assert.ok(!t || t.pts.length === 2); }
  assert.ok(LS.shoreSpot(60, 90, Math.random)[1] > 80);
  // the rooms: an open shop, the church, the Sé, a plain house, the street
  const open = S.find((s) => s.use === 'tavern');
  assert.equal(LS.roomAt(open.at[0], open.at[1])?.use, 'tavern');
  assert.equal(LS.roomAt((CHURCH[0] + CHURCH[2]) / 2, (CHURCH[1] + CHURCH[3]) / 2)?.use, 'church');
  assert.equal(LS.roomAt((SE[0] + SE[2]) / 2, (SE[1] + SE[3]) / 2)?.use, 'church');
  assert.equal(LS.roomAt(-206, 117), null);
  for (const u of ['spice', 'porcelain', 'cloth', 'jeweller', 'parrots', 'chandler', 'grocer', 'apothecary', 'tavern', 'baker', 'sailmaker', 'scribe', 'cooper', 'smith', 'home', 'house', 'church', 'cloister', 'hall']) assert.ok(LS.ROOMS[u], u);
});

test('Lisbon: its own voices can be made, and every voice its map names exists', () => {
  const { ctx } = fake(), m = music(ctx);
  m.place({ voices: {}, animals: profileOf('manueline-lisbon').animals, roof: 'tile' });
  const bus = m.src([5, 0], 8, { dur: 5 });
  for (const v of ['lsbToll', 'lsbCurfew', 'lsbMallet', 'lsbSaw', 'lsbAdze', 'lsbPitch', 'lsbCrane', 'lsbRope', 'lsbFountain', 'lsbHaul', 'lsbCry', 'lsbMurmur', 'lsbScales', 'lsbParrot', 'lsbBlock', 'lsbCooper']) assert.ok(m[v](ctx.currentTime, bus, 1) > 0.3, v);
  assert.ok(m.lsbCart(ctx.currentTime, bus, 1, { dur: 8 }) >= 8);
  for (const e of LS.EMITTERS) assert.equal(typeof m[e.voice], 'function', e.voice);
  for (const T of LS.TRACKS) assert.equal(typeof m[T.voice], 'function', T.voice);
  for (const s of LS.sites()) for (const [v] of s.work) assert.equal(typeof m[v], 'function', v);
  for (const R0 of [...Object.values(LS.ROOMS), LS.UPPER]) for (const [v] of R0.work) assert.equal(typeof m[v], 'function', v);
  assert.ok(LSB_CRIES.length >= 4 && new Set(LSB_CRIES.map((c) => c.map((n) => n[0]).join(','))).size === LSB_CRIES.length, 'distinct contours');
});

test('Lisbon: the placed engine makes the yard by day and not at night, the fountains always', () => {
  const { ctx, count } = fake(), m = music(ctx);
  const L = profileOf('manueline-lisbon').animals;
  const place = (at, o = {}) => m.place({ voices: { sparrow: 1 }, animals: L, roof: 'tile', town: 1, birds: 1, at: { x: at[0], z: at[1], yaw: 0, y: 0, hour: o.hour ?? 9 }, ...o });
  const run = (at, hour, secs = 120, o = {}) => { const c0 = count(); for (let i = 0; i < secs / 0.09; i++) { ctx.currentTime += 0.09; place(at, { hour, ...o }); m.placeEvents(); } return count() - c0; };
  const yard = run([200, 70], 9), yardNight = run([200, 70], 2, 120, { town: 0.1, birds: 0 });
  assert.ok(yard > yardNight, `the yard is louder by day (${yard} against ${yardNight} nodes)`);
  const heard = (hour, at, voice) => { place(at, { hour }); m.placeEvents(); return m.plc.stat.filter((e) => e.voice === voice && m.gainAt(e.at, e.r50) >= 0.15).length; };
  assert.ok(heard(2, [105, 66], 'lsbFountain') >= 1, 'a fountain heard at night');
  assert.equal(m.plc.stat.filter((e) => e.voice === 'lsbMallet' && inHours(2, e.hours)).length, 0, 'no mallet in the hours of the night');
  let worst = 0;
  while (m.cues && m.cues.length) { ctx.currentTime += 0.09; const c = count(); m.placeEvents(); worst = Math.max(worst, count() - c); if (ctx.currentTime > 5000) break; }
  assert.ok(worst < 150, `at most ${worst} nodes in a tick`);
});
