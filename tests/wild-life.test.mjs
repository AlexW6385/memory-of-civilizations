// Life in the open country (src/planet/wild-*.js, travellers*.js): the animals' shapes, what lives
// where, that a herd is found at the same place every time, and that the travellers' road is the road
// the ground draws (src/planet/relief.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand } from '../src/planet/land.js';
import { initRelief, ROADS, surface, coverAt } from '../src/planet/relief.js';
import { mapEarth } from '../src/planet/warp.js';
import { unit } from '../src/planet/geo.js';
import { PLANET_RADIUS as R } from '../src/planet/sites.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), sc = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale: sc, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();

const { MODELS, beastModel, birdModel, VSTRIDE } = await import('../src/planet/wild-models.js');
const { wildlifeAt } = await import('../src/planet/wild-biome.js');
const { WildFauna, SPECIES } = await import('../src/planet/wild-fauna.js');
const { roadU, infoOf } = await import('../src/planet/travellers.js');

test('every wild model builds, with a head, legs and a modest triangle count', () => {
  for (const id of Object.keys(MODELS)) {
    const m = beastModel(id);
    assert.ok(m.tris > 300 && m.tris < 4000, `${id}: ${m.tris} triangles`);
    let head = 0, legs = 0;
    for (let i = 0; i < m.n; i++) { const part = m.data[i * VSTRIDE + 10]; if (part === 1) head++; if (part === 2) legs++; }
    assert.ok(head > 20, `${id} has no head`);
    if (id !== 'kangaroo') assert.ok(legs > 20, `${id} has no legs`);
    assert.ok(m.data.every(Number.isFinite), `${id} has a bad number`);
  }
  assert.ok(birdModel().tris < 400);
});

test('every species names a model that exists', () => {
  for (const [id, s] of Object.entries(SPECIES)) assert.ok(MODELS[s.model], `${id} → ${s.model}`);
});

test('what lives where follows the biome and the continent', () => {
  const kinds = (cls, lat, lon, extra = {}) => wildlifeAt({ cls, lat, lon, moist: 0.5, mount: 0, ...extra }).list.map((e) => e[0]);
  assert.ok(kinds('savanna', 0, 30).includes('zebra') && kinds('savanna', 0, 30).includes('giraffe') && kinds('savanna', 0, 30).includes('elephant'));
  assert.ok(kinds('steppe', -27, 134).includes('kangaroo'));
  assert.ok(kinds('steppe', 42, -100).includes('bison'));
  assert.ok(kinds('steppe', 48, 65).includes('horse'));
  assert.ok(kinds('desert', 24, 45).includes('camel') && kinds('desert', 24, 45).includes('oryx'));
  assert.ok(kinds('forest', 48, 5).includes('deer') && kinds('forest', 48, 5).includes('boar'));
  assert.ok(kinds('tundra', 70, 40).includes('reindeer') && kinds('taiga', 62, 40).includes('wolf'));
  assert.ok(kinds('forest', -15, -70, { mount: 60 }).includes('guanaco'));
  assert.ok(!kinds('forest', 48, 5).includes('giraffe'));
});

/** The herds a visitor standing at an Earth place finds, as [species, size, centre] (the world as the page makes it, but not drawn). */
function herdsAt(lat, lon) {
  const u = mapEarth(unit(lat, lon)), g = surface(u), wf = new WildFauna({ add() {} });
  const cam = u.map((v) => v * (R + g.h + 1.7));
  for (let i = 0; i < 8; i++) wf.update(0.016, cam, 1.7, { quality: 'high', time: 1 + i * 0.1 });
  wf.finish();
  return [...wf.cells.values()].filter((c) => c.herd).map((c) => [c.key, c.herd.sp.model, c.herd.animals.length, c.herd.c.map((v) => +v.toFixed(7))]).sort();
}
test('the same herd is found at the same place', () => {
  const a = herdsAt(48, 5), b2 = herdsAt(48, 5);
  assert.ok(a.length > 0, 'no herds in the temperate forest');
  assert.deepEqual(a, b2);
  // and from a place some way off, the cells they share hold the same herds
  const c = herdsAt(48.002, 5.002), shared = a.filter((x) => c.some((y) => y[0] === x[0]));
  for (const x of shared) assert.deepEqual(c.find((y) => y[0] === x[0]), x);
});

test('nothing is made high up or when off', () => {
  const u = mapEarth(unit(48, 5)), wf = new WildFauna({ add() {} }), cam = u.map((v) => v * (R + 600));
  wf.update(0.016, cam, 600, { quality: 'high', time: 1 }); wf.finish();
  assert.equal(wf.cells.size, 0);
  wf.update(0.016, cam.map((v) => v * (R + 3) / (R + 600)), 3, { quality: 'high', time: 1, off: true }); wf.finish();
  assert.equal(wf.cells.size, 0);
  for (const k of wf.beasts.kinds.values()) assert.equal(k.n, 0);
});

test('a herd keeps its distance: it runs from a visitor who comes close', () => {
  const u = mapEarth(unit(48, 5)), g = surface(u), wf = new WildFauna({ add() {} });
  const cam = u.map((v) => v * (R + g.h + 1.7));
  for (let i = 0; i < 8; i++) wf.update(0.016, cam, 1.7, { quality: 'high', time: 1 + i * 0.1 });
  const H = [...wf.cells.values()].find((c) => c.herd)?.herd;
  assert.ok(H);
  // the visitor appears 20 m from the herd's centre
  const c = H.c, v = [c[0] * (R + H.hc + 1.7), c[1] * (R + H.hc + 1.7), c[2] * (R + H.hc + 1.7)];
  const start = H.animals.map((A) => A.u.slice());
  let t = 2;
  for (let i = 0; i < 400; i++) { t += 0.05; wf.update(0.05, v, 1.7, { quality: 'high', time: t }); }
  assert.ok(['flee', 'alert', 'graze'].includes(H.mode));
  const moved = H.animals.map((A, i) => Math.hypot(...A.u.map((x, k) => (x - start[i][k]) * R)));
  assert.ok(moved.filter((d) => d > 30).length >= H.animals.length / 2, `they moved ${moved.map((d) => d.toFixed(0))}`);
});

test('the travellers walk the road the ground shows', () => {
  let tried = 0, shown = 0;
  for (const r of ROADS) {
    const I = infoOf(r);
    assert.ok(I.len > 100 && I.ids.length >= 1, `${r.ends[0].id}: ${JSON.stringify(I)}`);
    for (let m = I.ra + 30; m < I.rb - 30; m += 40) {
      const u = roadU(r, m, 0), g = surface(u);
      if (g.s || g.n.d < 8 || g.h < 1) continue;
      tried++;
      if (coverAt(g, 1, u).road > 0.3) shown++;
    }
  }
  assert.ok(tried > 50, `only ${tried} road points on land`);
  assert.ok(shown / tried > 0.6, `the road shows at ${shown} of ${tried} points`);
});
