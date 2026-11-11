// Harness for Tenochtitlan's movers data: shapes build, the street graph connects, no way runs through a house or the water.
import { SetBuilder, graphFromRects } from '../src/engine/movers-kit.js';
import * as D from '../src/settlements/tenochtitlan/movers.js';
import { inHouse, inCanal, inLake } from '../src/settlements/tenochtitlan/layout.js';
const W = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']); D.walkerShapes(W);
const B = new SetBuilder(['wood', 'fibre']); D.boatShapes(B);
console.log('walker variants', W.variants.length, 'boat variants', B.variants.length);
const ww = D.walkways(), walk = graphFromRects(ww.rects, ww.links, ww.clip);
const comp = walk.nodes.map((_, i) => i), find = (i) => (comp[i] === i ? i : (comp[i] = find(comp[i])));
for (const e of walk.edges) comp[find(e.a)] = find(e.b);
const sizes = new Map(); walk.nodes.forEach((_, i) => sizes.set(find(i), (sizes.get(find(i)) ?? 0) + 1));
console.log('walk nodes', walk.nodes.length, 'edges', walk.edges.length, 'components (sizes)', [...sizes.values()].sort((a, b) => b - a).slice(0, 8).join(' '));
let inH = 0, inW = 0;
for (const e of walk.edges) {
  if (e.kind === 'bridge') continue;
  const [ax, az] = walk.nodes[e.a], [bx, bz] = walk.nodes[e.b];
  for (let t = 0; t <= 1; t += 0.05) { const x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (inHouse(x, z, 0)) inH++; if (inCanal(x, z) || inLake(x, z)) inW++; }
}
console.log('samples in houses', inH, 'in water', inW);
const wa = D.waterways(), water = graphFromRects(wa.rects, [], wa.clip);
console.log('water edges', water.edges.length, 'static boats', (await D.staticBoats()).length);
const big = [...sizes.entries()].sort((a, b) => b[1] - a[1]);
for (const [root, n] of big.slice(1, 4)) { const ns = walk.nodes.map((p, i) => [p, i]).filter(([, i]) => find(i) === root).map(([p]) => p); const xs = ns.map((p) => p[0]), zs = ns.map((p) => p[1]); console.log('component', n, 'x', Math.min(...xs).toFixed(0), Math.max(...xs).toFixed(0), 'z', Math.min(...zs).toFixed(0), Math.max(...zs).toFixed(0)); }
