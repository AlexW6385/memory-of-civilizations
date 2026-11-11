// Harness for Bianjing's movers data: shapes build (variant count), graphs connect, boats keep clear.
import { SetBuilder, graphFromRects } from '../src/engine/movers-kit.js';
import * as D from '../src/settlements/song-kaifeng/movers.js';
import * as LY from '../src/settlements/song-kaifeng/layout.js';
const W = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']); D.walkerShapes(W);
const B = new SetBuilder(['wood', 'fibre']); D.boatShapes(B);
console.log('walker variants', W.variants.length, 'boat variants', B.variants.length);
const tri = (sb) => Object.fromEntries(Object.entries(sb.finish()).map(([k, g]) => [k, g.index.length / 3]));
console.log('walker tris', tri(W), 'boat tris', tri(B));
const ww = D.walkways(), walk = graphFromRects(ww.rects, ww.links, ww.clip);
console.log('walk nodes', walk.nodes.length, 'edges', walk.edges.length);
// connectivity
const comp = walk.nodes.map((_, i) => i), find = (i) => (comp[i] === i ? i : (comp[i] = find(comp[i])));
for (const e of walk.edges) comp[find(e.a)] = find(e.b);
const roots = new Set(walk.nodes.map((_, i) => find(i)));
console.log('walk components', roots.size);
const bridge = walk.edges.filter((e) => e.kind === 'bridge'); console.log('bridge edges', bridge.length);
// edge samples in houses or river
let bad = 0;
for (const e of walk.edges) { const [ax, az] = walk.nodes[e.a], [bx, bz] = walk.nodes[e.b]; if (e.kind === 'bridge') continue; for (let t = 0; t <= 1; t += 0.05) { const x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (LY.inLot(x, z, -0.5) || LY.inRiver(x, z)) bad++; } }
console.log('street samples in lots/river', bad);
const wa = D.waterways(), water = graphFromRects(wa.rects, [], wa.clip);
console.log('water edges', water.edges.length, 'half-width', water.edges[0].w);
const statics = await D.staticBoats(); console.log('static boats', statics.length);
// lanes
const hull = D.BOAT.hull, HB = hull[0] * 0.82, HL = hull[1] * 7.4 / 7;
let blockedShare = [];
for (const e of water.edges) {
  const [ax, az] = water.nodes[e.a], [bx, bz] = water.nodes[e.b], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  const u = Math.max(0, e.w - HB - 0.3), K = Math.max(1, 2 * Math.floor(u / 0.25) + 1), off = Array.from({ length: K }, (_, k) => -u + 2 * u * k / (K - 1));
  e.off = off; e.L = L; e.ax = ax; e.az = az; e.ux = ux; e.uz = uz; e.blocked = off.map(() => new Uint8Array(Math.floor(L) + 1));
  for (const S of statics) {
    const ds = (S.c[0] - ax) * ux + (S.c[1] - az) * uz, dO = (S.c[0] - ax) * -uz + (S.c[1] - az) * ux;
    const al = Math.abs(S.u[0] * ux + S.u[1] * uz), sl = S.hl * al + S.hw * (1 - al), so = S.hw * al + S.hl * (1 - al);
    for (let j = 0; j < e.blocked[0].length; j++) { if (Math.abs(j - ds) >= sl + HL + 0.3) continue; for (let k = 0; k < K; k++) if (Math.abs(off[k] - dO) < so + HB + 0.3) e.blocked[k][j] = 1; }
  }
}
// every position along the river must have a free lane; the bridge reach must have a free central lane
let worst = 0, stuckAt = [];
for (const e of water.edges) for (let j = 0; j < e.blocked[0].length; j++) { let free = 0; e.blocked.forEach((b) => { if (!b[j]) free++; }); if (!free) stuckAt.push([e.ax + e.ux * j, e.az + e.uz * j]); }
console.log('river samples with every lane blocked', stuckAt.length, stuckAt.slice(0, 5).map((p) => p.map(Math.round).join(',')).join(' | '));
// two opposite lanes of the river (the right-hand ones, +-6 m from the middle) against the hull's beam and the bridge opening
console.log('opposite lanes: lateral gap', (12 - 2 * D.BOAT.hull[0] * 0.82).toFixed(1), 'm; arch opening', LY.BRIDGE.span, 'm, free lane offset at the bridge +-', (LY.BRIDGE.span / 2 - HB - 0.3).toFixed(1));
