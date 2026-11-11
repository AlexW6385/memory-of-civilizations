// Harness for Paris's movers data: shapes build, the street graph connects and keeps out of the houses, the river's lanes are free.
import { SetBuilder, graphFromRects } from '../src/engine/movers-kit.js';
import * as D from '../src/settlements/kilwa/movers.js';
import * as LY from '../src/settlements/kilwa/layout.js';
const W = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']); D.walkerShapes(W);
const B = new SetBuilder(['wood', 'fibre']); D.boatShapes(B);
console.log('walker variants', W.variants.length, 'boat variants', B.variants.length);
const ww = D.walkways(), walk = graphFromRects(ww.rects, ww.links, ww.clip);
console.log('walk nodes', walk.nodes.length, 'edges', walk.edges.length);
const comp = walk.nodes.map((_, i) => i), find = (i) => (comp[i] === i ? i : (comp[i] = find(comp[i])));
for (const e of walk.edges) comp[find(e.a)] = find(e.b);
const sizes = new Map(); walk.nodes.forEach((_, i) => sizes.set(find(i), (sizes.get(find(i)) || 0) + 1));
console.log('walk components', [...sizes.values()].sort((a, b) => b - a).slice(0, 8).join(','));
let bad = 0;
for (const e of walk.edges) { const [ax, az] = walk.nodes[e.a], [bx, bz] = walk.nodes[e.b]; for (let t = 0; t <= 1; t += 0.05) { const x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (LY.inLot(x, z, -0.2) && Math.hypot(x, z) < LY.RADIUS) bad++; } }
console.log('street samples inside houses', bad);
const wa = D.waterways(), water = graphFromRects(wa.rects, [], wa.clip);
console.log('water edges', water.edges.length, 'half-width', water.edges[0]?.w, 'static boats', (await D.staticBoats()).length);
