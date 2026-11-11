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

test('ways: connected, none in the palace, the moat or the temple court', () => {
  const ww = D.walkways(), G = graphFromRects(ww.rects, ww.links, ww.clip);
  assert.ok(G.edges.length > 100);
  for (const [x, z] of G.nodes) {
    assert.ok(!L.inRect(L.WALL.rect, x, z, 2), `node in palace ${x},${z}`);
    assert.ok(!L.inMoat(x, z), `node in moat ${x},${z}`);
    assert.ok(!L.inTemple(x, z), `node in temple ${x},${z}`);
  }
  // one component holds nearly everything
  const adj = G.nodes.map(() => []); for (const e of G.edges) { adj[e.a].push(e.b); adj[e.b].push(e.a); }
  const seen = new Set([0]), q = [0]; while (q.length) { const n = q.pop(); for (const m of adj[n]) if (!seen.has(m)) { seen.add(m); q.push(m); } }
  assert.ok(seen.size > G.nodes.length * 0.9, `${seen.size}/${G.nodes.length} connected`);
});
