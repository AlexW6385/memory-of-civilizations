// The rock of Ajanta seen from the gorge (docs/settlements/ajanta.md §12): the ledge's foot as a battered, stepped
// foundation of basalt flows with talus, scrub and creepers; the second stair at the ledge's south end; the cliff's
// skin above the caves (rock-cut shelves with scrub and fig trees, vertical columnar joints, the monsoon's streaks) and
// the trees along the lip. Everything is boxes and lumpy lathes in palette rock and leaf materials; small pieces are
// fine detail (drawn near only), the strata and shelves are the mass.
import { box, lathe, rod } from '../../core/geom.js';
import { XF, ROCK, ZW, ZOUT, FLOOR, LEDGE, STAIR, STAIR2, FACES, rng } from '../../settlements/ajanta/layout.js';

const STRATA = ['sandstone_carved', 'granite_rough', 'rubble', 'sandstone_green', 'tuff_moai'];
const SKINM = ['tuff_moai', 'coral_rag', 'rock_boulder', 'coral_rag'];   // ranks the strata of the slabs do not share: no coplanar fights with them
const LEAF = ['doum_leaf', 'palm_leaf', 'doum_leaf', 'cloth_green'];

/** A lumpy boulder: radius r, height h, standing at (x, y, z). */
export function boulder(bag, mat, x, y, z, r, h, seed) {
  bag.add(mat, lathe([[0.001, 0], [r * 0.85, h * 0.1], [r, h * 0.45], [r * 0.82, h * 0.85], [0.001, h]], 8, (th) => 1 + 0.2 * Math.sin(th * 3 + seed) + 0.1 * Math.sin(th * 5 + seed * 2.3), x, y, z));
}
/** A mound of scrub or a tree's crown lobe. */
export function leafMound(bag, mat, x, y, z, r, h, seed) {
  bag.add(mat, lathe([[0.001, 0], [r * 0.8, h * 0.2], [r, h * 0.55], [r * 0.7, h * 0.9], [0.001, h]], 7, (th) => 1 + 0.25 * Math.sin(th * 4 + seed) + 0.12 * Math.sin(th * 7 + seed), x, y, z));
}
/** A tree clinging to the rock or standing on the lip: a leaning trunk, a crown of three lobes. h the whole height. */
export function tree(bag, x, y, z, h, seed, lean = 0) {
  seed = Math.abs(Math.round(seed));
  const r = rng(seed * 97 + 3), a = r() * 6.28, lx = Math.cos(a) * lean, lz = Math.sin(a) * lean;
  bag.add('bark_dark', rod([x, y, z], [x + lx, y + h * 0.6, z + lz], 0.06 + h * 0.016, 5));
  const m = LEAF[seed % LEAF.length], rr = h * 0.3;
  leafMound(bag, m, x + lx, y + h * 0.42, z + lz, rr, h * 0.45, seed);
  leafMound(bag, LEAF[(seed + 1) % LEAF.length], x + lx + Math.cos(a + 2) * rr * 0.6, y + h * 0.5, z + lz + Math.sin(a + 2) * rr * 0.6, rr * 0.75, h * 0.4, seed + 3);
  leafMound(bag, m, x + lx + Math.cos(a + 4) * rr * 0.5, y + h * 0.62, z + lz + Math.sin(a + 4) * rr * 0.5, rr * 0.65, h * 0.38, seed + 5);
}

/** The ledge's foot: strata standing out in steps (the lowest furthest), buttress piers, talus, scrub and creepers; the second stair. */
export function ledgeFoot(ctx) {
  const { bag, col } = ctx, { x0, x1, z0, z1 } = LEDGE, r = rng(1234), y1 = FLOOR[1];
  const stairZone = (a, b, m = 0.6) => (b > STAIR.z0 - m && a < STAIR.z1 + m) || (b > STAIR2.z0 - m && a < STAIR2.z1 + m);
  bag.add('rubble', box(x0, -0.7, z0, x1 - 0.9, y1 - 0.06, z1));
  const YS = [-0.7, 2.4, 5.0, 7.3, y1 - 0.04], OUT = [1.6, 1.0, 0.5, 0.05], segs = [];
  for (let z = z0; z < z1 - 0.01;) {
    const w = Math.min(z1 - z, 2.2 + r() * 3.8), a = z, b = z + w; z = b;
    const flat = stairZone(a, b), faces = [], mats = [];
    for (let k = 0; k < 4; k++) {
      const face = x1 + 0.1 + (flat ? 0 : OUT[k] * (0.2 + 0.8 * r()));
      faces.push(face); mats.push(STRATA[Math.floor(r() * STRATA.length)]);
      bag.add(mats[k], box(x1 - 0.9 + 0.015 * k, YS[k], a, face, YS[k + 1], b));
      if (face > x1 + 0.2) col.rect([x1 + 0.1, a, face, b], YS[k], YS[k + 1]);
    }
    segs.push({ a, b, faces });
  }
  // the lip: a carved cap in one run, the lips of two segments chipped
  bag.add('sandstone_carved', box(x1 - 0.5, y1 - 1.0, z0 - 0.03, x1 + 0.22, y1, z1 + 0.03));
  // buttress piers: retaining blocks stepped in two lifts, with a cap
  for (const z of [-36, -14, 6, 26, 39.5]) {
    bag.add('sandstone_green', box(x1 - 1.0, -0.7, z - 1.4, x1 + 2.6, 4.2, z + 1.4)); col.rect([x1 + 0.1, z - 1.4, x1 + 2.6, z + 1.4], -0.7, 4.2);
    bag.add('granite_rough', box(x1 - 1.05, 4.2, z - 1.25, x1 + 1.9, 7.7, z + 1.25)); col.rect([x1 + 0.1, z - 1.25, x1 + 1.9, z + 1.25], 4.2, 7.7);
    bag.add('sandstone_carved', box(x1 - 1.1, 7.7, z - 1.4, x1 + 2.1, 8.2, z + 1.4));
  }
  // talus: boulders fallen from the cliff, scrub between them
  for (let k = 0; k < 64; k++) {
    const z = z0 + 1 + r() * (z1 - z0 - 2), x = x1 + 1.3 + r() * 1.7, rr = 0.3 + r() * 0.65;
    if (stairZone(z - 1, z + 1, 0.3)) continue;
    boulder(bag, STRATA[k % 5], x, -0.1, z, rr, rr * (0.7 + r() * 0.5), k);
    if (rr > 0.55) col.circle(x, z, rr * 0.8, -0.1, rr * 0.9);
  }
  for (let k = 0; k < 40; k++) {
    const z = z0 + 1 + r() * (z1 - z0 - 2), x = x1 + 1.2 + r() * 1.9, rr = 0.35 + r() * 0.5;
    if (stairZone(z - 1, z + 1, 0.3)) continue;
    leafMound(bag, LEAF[k % 4], x, -0.05, z, rr, rr * (0.9 + r() * 0.8), k + 5);
  }
  // creepers draped over the lip and down the steps: pieces following each stratum's face
  for (let k = 0; k < 46; k++) {
    const z = z0 + 0.5 + r() * (z1 - z0 - 1), len = 2 + r() * 6, top = y1 - 0.1, bot = top - len, s = segs.find((q) => z >= q.a && z < q.b);
    if (!s || stairZone(z, z + 0.3, 0.1)) continue;
    for (let q = 0; q < 4; q++) {
      const ya = Math.max(YS[q], bot), yb = Math.min(YS[q + 1], top);
      if (yb - ya > 0.05) bag.add(k % 3 ? 'palm_leaf' : 'doum_leaf', box(s.faces[q], ya, z, s.faces[q] + 0.07, yb, z + 0.14 + r() * 0.25));
    }
  }
  // the monsoon's streaks under the lip, and iron staining
  for (let k = 0; k < 34; k++) {
    const z = z0 + 1 + r() * (z1 - z0 - 2), s = segs.find((q) => z >= q.a && z < q.b);
    if (!s || stairZone(z, z + 0.5, 0.1)) continue;
    const y = 4.5 + r() * 3.5, f = s.faces[y > 7.3 ? 3 : y > 5.0 ? 2 : 1];
    bag.add(k % 2 ? 'tuff_red' : 'granite_rough', box(f, y - 1 - r() * 2.2, z, f + 0.03, Math.min(y1 - 0.05, y + r() * 1.2), z + 0.25 + r() * 0.6));
  }
  // the south stair: rises to the north from the path to the ledge (the north one is cliff.js')
  {
    const { x0: sx0, x1: sx1, z0: sz0, z1: sz1 } = STAIR2, n = Math.round((FLOOR[1] - FLOOR[0]) / 0.17), L = (sz1 - sz0) / n;
    for (let k = 0; k < n; k++) bag.add('sandstone_dressed', box(sx0, -0.65, sz1 - (k + 1) * L - 0.02, sx1, FLOOR[0] + (FLOOR[1] - FLOOR[0]) * (k + 1) / n, sz1 - k * L));
    col.ramp([sx0, sz0, sx1, sz1], FLOOR[0], FLOOR[1], 'n');
  }
}

/** The cliff's skin above the ledge on the three faces: shelves with scrub and fig trees, columnar joints, streaks, trees on the lip. */
let HOLES = {};
export function cliffSkin(ctx, holes = {}) {
  const { bag } = ctx; HOLES = holes;
  for (const F of Object.values(FACES)) {
    const r = rng(F.id === 'main' ? 61 : F.id === 'north' ? 62 : 63), s0 = F.id === 'main' ? -ZW + 1 : F.s0 + 1, s1 = F.id === 'main' ? ZW - 1 : F.s1 - 1;
    const q = (t) => Math.round((t - 0.025) / 0.1) * 0.1 + 0.025;                     // front planes off the 0.05 grid the strata's offsets lie on
    const sOk = (v) => { const f = Math.abs(v * 4 - Math.round(v * 4)); return f > 0.2 && !(HOLES[F.id] ?? []).some((h) => Math.abs(h.s0 - v) < 0.08 || Math.abs(h.s1 - v) < 0.08); };
    const nud = (v) => { let k = 0; while (!sOk(v) && k++ < 30) v += 0.03; return v; };
    const put = (d, s, y, w, h, t, mat) => {      // a box w along the face, h high, standing t out of the face (d = -t..0)
      s = nud(s); w = nud(s + w) - s;
      const [xa, za] = F.map(-q(t), s), [xb, zb] = F.map(d, s + w);
      bag.add(mat, box(Math.min(xa, xb), y, Math.min(za, zb), Math.max(xa, xb), y + h, Math.max(za, zb)));
    };
    const at = (d, s) => F.map(d, s);
    const shelves = F.id === 'main' ? [[FLOOR[2] - 0.65, 0.6, 1.4], [26.6, 0.6, 1.1]] : [[FLOOR[1] + 5.43, 0.55, 1.0], [FLOOR[2] + 5.27, 0.5, 1.0]];
    // rock-cut shelves in broken runs, with scrub on them
    shelves.forEach(([y, h, out], si) => {
      for (let s = s0; s < s1;) {
        const w = 3 + r() * 8, e = Math.min(s1, s + w); s = e + 0.8 + r() * 3.5 * (si ? 1.4 : 0.6);
        if (F.id === 'main' && si === 0 && e > 15.5 && e - w < 32.5) continue;    // Cave 19's cornice stands there
        const o = out * (0.7 + 0.6 * r());
        put(0.47 + r() * 0.5, e - w, y, w, h, o, SKINM[Math.floor(r() * 4)]);
        put(0.47 + r() * 0.5, e - w, y - 0.28, w, 0.28, o * 0.7, 'tuff_moai');
        for (let q = e - w + 0.5; q < e - 0.4; q += 1.6 + r() * 2.4) { const [x, z] = at(-o * 0.55, q); leafMound(bag, LEAF[Math.floor(r() * 4)], x, y + h - 0.05, z, 0.35 + r() * 0.5, 0.5 + r() * 0.9, Math.round(q * 7)); }
        // (no trees here: a crown over the ledge would be a roof the walker cannot pass under)
      }
    });
    // columnar joints: vertical ribs of the trap rock, the face breaking back and forward
    { const N = F.id === 'main' ? 36 : 14, slot = (s1 - s0) / N;
      for (let k = 0; k < N; k++) {
        const s = s0 + (k + 0.1 + r() * 0.4) * slot, w = 0.5 + r() * Math.min(0.9, slot * 0.4), y = 24 + r() * 5, top = F.top(s) - 0.45 - r() * 0.3 - (r() < 0.4 ? r() * 5 : 0);
        if (top - y > 2) put(0.47 + r() * 0.5, s, y, w, top - y, 0.25 + r() * 0.7, SKINM[Math.floor(r() * 4)]);
      } }
    // streaks of the monsoon down the upper face
    for (let k = 0; k < (F.id === 'main' ? 30 : 12); k++) {
      const s = s0 + r() * (s1 - s0), len = 4 + r() * 9, top = F.top(s) - 0.9 - r() * 0.5;
      put(0.47 + r() * 0.5, s, Math.max(24, top - len), 0.3 + r() * 0.8, Math.min(len, top - 24), 0.07 + r() * 0.05, k % 3 ? 'tuff_moai' : 'tuff_red');
    }
    // trees along the lip (their roots in the top slices) and a few stunted ones on the lower ledges
    for (let s = s0 + 1; s < s1; s += 4 + r() * 6) {
      const d = 0.8 + r() * 6, [x, z] = at(d, s);
      tree(bag, x, F.top(s) - 0.75, z, 6 + r() * 7, Math.round(s * 5 + 11), 0.6 + r() * 1.4);
    }
  }
  void ROCK; void ZOUT;
}
