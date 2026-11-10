// Worker: the shapes and ways of a settlement's moving life (src/engine/movers.js), made off the
// main thread. The page sends { id }; the worker loads src/settlements/<id>/movers.js (movers-sites.js),
// builds the walkers' and the boats' sets (movers-kit.js SetBuilder), the street and canal graphs,
// the canal lanes kept clear of the boats standing in the water, and answers
// { id, sets: { walkers, boats }, walk, water, params } with transferable arrays, or { id, error }.

import { MOVER_SITES } from './movers-sites.js';
import { SetBuilder, graphFromRects } from './movers-kit.js';

self.onmessage = async (e) => {
  const { id } = e.data;
  try {
    const D = await MOVER_SITES[id]();
    const transfer = [];
    const pack = (sb) => {
      const groups = sb.finish();
      for (const g of Object.values(groups)) for (const a of Object.values(g)) transfer.push(a.buffer);
      return { groups, variants: sb.variants };
    };
    const W = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']);
    D.walkerShapes(W);
    const B = new SetBuilder(['wood', 'fibre']);
    D.boatShapes(B);
    const ww = D.walkways(), walk = graphFromRects(ww.rects, ww.links, ww.clip);
    const wa = D.waterways(), water = graphFromRects(wa.rects, [], wa.clip);
    water.bridges = wa.bridges;
    water.lanes = waterLanes(water, await D.staticBoats(), D.PARAMS.boats);
    self.postMessage({ id, sets: { walkers: pack(W), boats: pack(B) }, walk, water, params: D.PARAMS, kinds: { walkers: D.WALKERS, crew: D.CREW, boat: D.BOAT } }, transfer);
  } catch (err) {
    self.postMessage({ id, error: String(err?.stack || err) });
  }
};

/**
 * The lanes of each canal edge, kept clear of the boats that stand in it: lane offsets across
 * (m, from the middle line, to the right of a → b), sampled every metre along; a sample is blocked
 * where a moving boat there (half-length 3.5, half-beam 1.0) would touch a standing one.
 * Per edge { off: [offsets], step: 1, n (samples), blocked: Uint8Array(n × lanes) }.
 */
function waterLanes(G, statics, P) {
  const HB = P.halfBeam ?? 1.0, HL = 3.5, out = [];
  for (const e of G.edges) {
    const [ax, az] = G.nodes[e.a], [bx, bz] = G.nodes[e.b], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const u = Math.max(0, e.w - HB - 0.3), K = Math.max(1, 2 * Math.floor(u / 0.25) + 1), off = Array.from({ length: K }, (_, k) => (K === 1 ? 0 : -u + 2 * u * k / (K - 1)));
    const n = Math.floor(L) + 1, blocked = new Uint8Array(n * K);
    for (const S of statics) {
      const ds = (S.c[0] - ax) * ux + (S.c[1] - az) * uz, dO = (S.c[0] - ax) * nx + (S.c[1] - az) * nz;
      if (ds < -12 || ds > L + 12 || Math.abs(dO) > e.w + 4) continue;
      // (its extent along and across this canal: the standing boats lie along the canals)
      const along = Math.abs(S.u[0] * ux + S.u[1] * uz), sl = S.hl * along + S.hw * (1 - along), so = S.hw * along + S.hl * (1 - along);
      for (let j = 0; j < n; j++) {
        if (Math.abs(j - ds) >= sl + HL) continue;
        for (let k = 0; k < K; k++) if (Math.abs(off[k] - dO) < so + HB + 0.08) blocked[j * K + k] = 1;
      }
    }
    out.push({ off, step: 1, n, blocked });
  }
  return out;
}
