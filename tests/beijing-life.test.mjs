// Ming–Qing Beijing, the life: the walkers' shapes build within the engine's limits, the ways are sound.
import test from 'node:test';
import assert from 'node:assert';
import { SetBuilder, graphFromRects } from '../src/engine/movers-kit.js';

const D = await import('../src/settlements/qing-beijing/movers.js');
const L = await import('../src/settlements/qing-beijing/layout.js');

test('walker shapes: at most 36 variants, every kind has a dry variant near and far', () => {
  const W = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']);
  D.walkerShapes(W);
  assert.ok(W.variants.length <= 36, `${W.variants.length} variants`);
  for (const k of D.WALKERS) for (const f of ['near', 'far']) assert.ok(W.variants.includes(`${k.id}|dry|${f}`), `${k.id}|dry|${f}`);
  const g = W.finish();
  let tris = 0; for (const grp of Object.values(g)) tris += grp.index.length / 3;
  assert.ok(tris < 400000, `${tris} triangles`);
});

test('ways: connected, none in the palace (but its great court), the moat or the temple court', () => {
  const ww = D.walkways(), G = graphFromRects(ww.rects, ww.links, ww.clip);
  assert.ok(G.edges.length > 100);
  for (const [x, z] of G.nodes) {
    // (the great court of the Hall of Supreme Harmony has its officials' and servants' ways: movers.js)
    if (!L.inRect([-86, 46, 86, 100], x, z, 0)) assert.ok(!L.inRect(L.WALL.rect, x, z, 2), `node in palace ${x},${z}`);
    assert.ok(!L.inMoat(x, z), `node in moat ${x},${z}`);
    assert.ok(!L.inTemple(x, z), `node in temple ${x},${z}`);
  }
  // one component holds nearly everything
  const adj = G.nodes.map(() => []); for (const e of G.edges) { adj[e.a].push(e.b); adj[e.b].push(e.a); }
  const seen = new Set([0]), q = [0]; while (q.length) { const n = q.pop(); for (const m of adj[n]) if (!seen.has(m)) { seen.add(m); q.push(m); } }
  assert.ok(seen.size > G.nodes.length * 0.9, `${seen.size}/${G.nodes.length} connected`);
});

test('ways keep out of the houses and the shop rows; booths stand clear of shop fronts', async () => {
  const ww = D.walkways(), G = graphFromRects(ww.rects, ww.links, ww.clip);
  for (const [x, z] of G.nodes) { assert.ok(!L.inHouse(x, z, 0), `node in a house ${x},${z}`); assert.ok(!L.inShopRow(x, z, 0), `node in a shop ${x},${z}`); }
  const S = await import('../src/settlements/qing-beijing/shops.js');
  assert.ok(S.SHOP_SITES.length > 3);
  for (const s of S.SHOP_SITES) { assert.ok(!L.inShopStrip(s.at[0], s.at[1], 0), `booth in the shop strip ${s.at}`); assert.ok(!L.inHouse(s.at[0], s.at[1], 0)); }
});

test('the tea house, the pharmacy and the furnished trade shops lie inside real shops; furnished houses are lod-0 lots with their parts', async () => {
  const ins = L.interiorShops();
  const kinds = ins.map((s) => s.kind);
  for (const k of ['pharmacy', 'teahouse']) assert.ok(kinds.includes(k), k);
  assert.equal(kinds.filter((k) => k === 'teahouse' || k === 'pharmacy').length, 2);
  for (const s of ins) assert.ok(s.z1 - s.z0 >= 5.6 && s.side === 'w');
  const H = await import('../src/settlements/qing-beijing/houses.js');
  const f = L.furnishedHouses(5);
  assert.equal(f.length, 5);
  for (const h of f) { const P = H.houseParts(h); assert.ok(P.main[2] > P.main[0] && P.wings.length === 2, 'two wings'); for (const w of P.wings) assert.ok(w.rect[1] >= P.main[3], 'wing south of the main house'); }
});
