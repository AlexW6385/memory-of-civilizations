// Norse Norway — the river landing and the hay fields (docs/settlements/norse-borgund.md §1, "The landing
// and the hay racks"): a timber quay on piles with its stair down the bank, a boathouse (naust) of logs
// with a clinker boat drawn up before it, clinker-built boats afloat at the quay (a four-oared færing, a
// six-oared boat with its mast and furled sail), and the hay racks (hesje) of the meadows with the
// hay hung out to dry. Helpers come from index.js (passed in, so there is no import cycle).
import { box, lathe, fromTriangles } from '../../core/geom.js';

const W = 'tar_wood', SH = 'tar_shingle', LOG = 'log_pine', HAY = 'thatch';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function makeShore({ hexa, logRod, beam, pitched, logWalls, logGables, roofTrim, door }) {
  /** An element's local frame (x, y up, z) to the world: turned by rot about y, set at (x, y, z). */
  const put = (bag, mat, g, el, dy = 0) => { const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setXYZ(i, x * c + z * s + el.at[0], p.getY(i) + (el.y ?? 0) + dy, -x * s + z * c + el.at[1]);
      if (n) { const nx = n.getX(i), nz = n.getZ(i); n.setXYZ(i, nx * c + nz * s, n.getY(i), -nx * s + nz * c); } }
    p.needsUpdate = true; bag.add(mat, g); };
  const P3 = (c) => c; void P3;

  // ── the boats ───────────────────────────────────────────────────────────────
  /**
   * nboat: { at, y (the water's face, or the ground for a beached boat), rot, len, kind ('faering' | 'sexaering' | 'beached'), seed }
   * — a clinker-built boat, bow toward −z: strakes of tarred planks, each lapping the one below
   * (their middles stand a little proud), the stem and stern posts curling up, the gunwale, the
   * thwarts and floor boards; oars shipped along the thwarts; the six-oared boat with its
   * mast stepped and the square wool sail furled on its yard, and the steering oar at the stern.
   */
  function nboat(el, { bag, col }) {
    const kind = el.kind ?? 'faering', L = el.len ?? (kind === 'sexaering' ? 8.5 : 5.6), B = kind === 'sexaering' ? 2.1 : 1.55, D = kind === 'sexaering' ? 0.78 : 0.58;
    const n = 18, S = 5, rand = rng(el.seed || 3), loc = [];
    const keelAt = el.kind === 'beached' ? 0.12 : 0;
    const base = kind === 'beached' ? 0.0 : -0.42 * D, dy = base + keelAt;
    // a point of the hull: station t (0 bow … 1 stern), s up the section (0 keel … 1 gunwale), side ±1, bulge (the strake's proud middle)
    const sheer = (t) => D + 0.14 * (2 * t - 1) ** 2 + 0.34 * Math.abs(2 * t - 1) ** 4;
    const keel = (t) => D * 0.95 * Math.abs(2 * t - 1) ** 3.4;
    const hull = (t, s, side, bulge = 0) => {
      const half = (B / 2) * Math.pow(Math.sin(Math.PI * Math.min(0.995, Math.max(0.005, t))), 0.5), yk = keel(t), ys = sheer(t);
      const x = half * Math.pow(s, 0.62) + bulge, y = yk + (ys - yk) * Math.pow(s, 1.45);
      return [side * x, y, -L / 2 + L * t];
    };
    const T = [], tri = (a, b, c) => { T.push(...a, ...b, ...c, ...a, ...c, ...b); };
    for (const side of [-1, 1]) for (let k = 0; k < S; k++) for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, sA = k / S, sM = (k + 0.5) / S, sB = (k + 1) / S;
      for (const [s0, s1, b0, b1] of [[sA, sM, 0, 0.014], [sM, sB, 0.014, 0]]) {
        const p = hull(t0, s0, side, b0), q = hull(t1, s0, side, b0), r = hull(t1, s1, side, b1), u = hull(t0, s1, side, b1);
        tri(p, q, r); tri(p, r, u);
      }
    }
    loc.push([W, fromTriangles(T)]);
    // the keel: a plank along the bottom, the stems rising from its ends in a curl
    const keelPts = Array.from({ length: n + 1 }, (_, i) => hull(i / n, 0, 1, 0)).map(([, y, z]) => [0, y, z]);
    for (let i = 0; i < n; i++) loc.push(['timber', beam([0, keelPts[i][1] - 0.03, keelPts[i][2]], [0, keelPts[i + 1][1] - 0.03, keelPts[i + 1][2]], 0.09, 0.07)]);
    for (const e of [0, 1]) {
      const sg = e ? 1 : -1, z0 = sg * L / 2, y0 = keel(e) + 0.02, ys = sheer(e);
      const pts = [[0, y0, z0 - sg * 0.02], [0, (y0 + ys) / 2, z0 + sg * 0.01], [0, ys + 0.08, z0 - sg * 0.05], [0, ys + 0.32, z0 - sg * 0.2], [0, ys + 0.42, z0 - sg * 0.42]];
      for (let i = 0; i + 1 < pts.length; i++) loc.push(['timber', beam(pts[i], pts[i + 1], 0.08 - i * 0.012, 0.1 - i * 0.012)]);
      // the carved knob at the stem-head of the bow
      if (!e) loc.push(['timber', lathe([[0.001, 0], [0.07, 0.04], [0.06, 0.1], [0.001, 0.16]], 8, null, 0, pts[4][1] - 0.01, pts[4][2] - 0.04)]);
    }
    // the gunwale: a rail along each side of the sheer; the wale a strake below
    for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
      const a = hull(i / n, 1, side, 0.02), b = hull((i + 1) / n, 1, side, 0.02);
      loc.push(['timber', beam([a[0], a[1] + 0.015, a[2]], [b[0], b[1] + 0.015, b[2]], 0.06, 0.05)]);
      const c = hull(i / n, 0.8, side, 0.03), d = hull((i + 1) / n, 0.8, side, 0.03);
      loc.push(['timber', beam(c, d, 0.035, 0.05)]);
    }
    // the floor boards and the thwarts (each resting on a knee at either side)
    const fw = B * 0.2;
    for (let i = 0; i < 6; i++) { const z0 = -L * 0.34 + i * L * 0.68 / 6; loc.push(['timber', box(-fw, D * 0.3, z0 + 0.01, fw, D * 0.3 + 0.025, z0 + L * 0.68 / 6 - 0.01)]); }
    const nt = kind === 'sexaering' ? 6 : 4;
    for (let k = 0; k < nt; k++) {
      const t = 0.22 + 0.56 * (k + 0.5) / nt, z = -L / 2 + L * t, hb = Math.pow(Math.sin(Math.PI * t), 0.5) * B / 2 * 0.86, y = sheer(t) - 0.2;
      loc.push(['timber', box(-hb, y - 0.03, z - 0.12, hb, y + 0.03, z + 0.12)]);
      for (const sg of [-1, 1]) loc.push(['timber', box(sg * hb - 0.03, y - 0.2, z - 0.05, sg * hb + 0.03, y - 0.03, z + 0.05)]);
    }
    // oars: laid fore-and-aft along the thwarts, their looms inboard, the blades toward the stern
    const oars = kind === 'sexaering' ? 3 : 2;
    for (const side of [-1, 1]) for (let k = 0; k < oars; k++) {
      const x = side * (B * 0.2 + 0.05 * k), y = sheer(0.5) - 0.12 + 0.07 * k, z0 = -L * 0.26 - 0.15 * k;
      loc.push(['timber', logRod([x, y, z0], [x, y, z0 + L * 0.5 + 0.3], 0.028, 6)]);
      loc.push(['timber', box(x - 0.07, y - 0.012, z0 + L * 0.5 + 0.3, x + 0.07, y + 0.012, z0 + L * 0.5 + 0.95)]);
    }
    if (kind === 'sexaering') {
      // the mast stepped just forward of amidships (a stout round spar in its partner thwart), the yard across it, the sail furled and lashed on the yard
      const mz = -L * 0.08, mh = 5.2;
      loc.push(['timber', lathe([[0.001, 0], [0.09, 0], [0.085, mh * 0.9], [0.055, mh], [0.001, mh]], 8, null, 0, 0.1, mz)]);
      loc.push(['timber', logRod([-2.1, mh * 0.86, mz - 0.14], [2.1, mh * 0.86, mz - 0.14], 0.05, 6)]);
      loc.push([HAYSAIL, lathe([[0.001, -1.8], [0.15, -1.8], [0.17, -1.6], [0.17, 1.6], [0.15, 1.8], [0.001, 1.8]], 8).rotateZ(Math.PI / 2).translate(0, mh * 0.86 - 0.12, mz - 0.27)]);
      // stays fore and aft
      loc.push(['cloth_brown', logRod([0, mh * 0.95, mz], [0, sheer(0) + 0.3, -L / 2 + 0.2], 0.012, 4)]);
      loc.push(['cloth_brown', logRod([0, mh * 0.95, mz], [0, sheer(1) + 0.2, L / 2 - 0.2], 0.012, 4)]);
      // the steering oar on the starboard quarter, hung in its withy
      const sx = B / 2 * 0.62, sz = L / 2 - 0.9;
      loc.push(['timber', beam([sx + 0.18, sheer(0.9) + 0.9, sz - 0.2], [sx + 0.12, -0.3, sz + 0.5], 0.07, 0.07)]);
      loc.push(['timber', beam([sx + 0.12, -0.3, sz + 0.45], [sx + 0.1, -0.85, sz + 0.62], 0.16, 0.025)]);
    }
    if (kind === 'beached') {
      // drawn up on rollers: two logs under the keel
      for (const z of [-L * 0.25, L * 0.2]) loc.push([LOG, logRod([-0.45, -0.1, z], [0.45, -0.1, z], 0.1, 7)]);
    }
    void rand;
    for (const [m, g] of loc) put(bag, m, g, el, dy);
    const [x, z] = el.at, y = (el.y ?? 0) + dy, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
    for (const f of [-0.3, 0, 0.3]) col.circle(x + f * L * s, z + f * L * c, B * 0.5, y, y + D);
  }

  // ── the quay and the boathouse ────────────────────────────────────────────────
  /**
   * quay: { at: [x, z] (the top of the bank, middle of the way), y (the bank's height), yd (the deck's), len (down the bank and out), w, bed: fn(x, z) } —
   * a timber landing running south into the river: a stair of planks down the bank held by two
   * stringers, the deck on cross beams over piles driven into the bed (with a rail of rope-lashed
   * poles down one side of the stair, and mooring posts at the deck's end).
   */
  function quay(el, { bag, col }) {
    const [x, z0] = el.at, y0 = el.y ?? 0, yd = el.yd ?? y0 - 2.2, w = el.w ?? 2.4, ramp = el.ramp ?? 4.6, deck = el.deck ?? 11, hw = w / 2, bed = el.bed ?? (() => yd - 3);
    const zr = z0 + ramp, ze = zr + deck, steps = 10;
    // the rubble the stair's head sits on
    bag.add('rubble', box(x - hw - 0.3, y0 - 0.5, z0 - 0.7, x + hw + 0.3, y0 + 0.05, z0 + 0.3));
    // the stair: planks on two stringers laid down the slope
    const slope = (zz) => y0 + (yd - y0) * Math.min(1, Math.max(0, (zz - z0) / ramp));
    for (const sx of [-1, 1]) bag.add(W, beam([x + sx * (hw - 0.12), y0 - 0.12, z0], [x + sx * (hw - 0.12), yd - 0.12, zr], 0.18, 0.16));
    for (let k = 0; k < steps; k++) {
      const za = z0 + ramp * k / steps, zb = z0 + ramp * (k + 1) / steps, yy = y0 + (yd - y0) * (k + 1) / steps;
      bag.add(W, box(x - hw, yy - 0.07, za, x + hw, yy, zb + 0.04));
    }
    col.ramp([x - hw, z0, x + hw, zr], y0, yd, 's');
    // the deck: boards across on beams on piles, a plank edge-log along both sides
    for (let zz = zr; zz < ze - 0.1; zz += 0.24) bag.add(W, box(x - hw, yd - 0.06, zz, x + hw, yd, Math.min(ze, zz + 0.22)));
    for (const sx of [-1, 1]) bag.add(LOG, logRod([x + sx * (hw + 0.02), yd - 0.2, zr - 0.05], [x + sx * (hw + 0.02), yd - 0.2, ze + 0.05], 0.1, 7));
    col.floor([x - hw, zr, x + hw, ze], yd);
    for (let zz = zr + 0.6; zz <= ze - 0.3; zz += 2.2) {
      bag.add(W, box(x - hw - 0.2, yd - 0.3, zz - 0.09, x + hw + 0.2, yd - 0.06, zz + 0.09));
      for (const sx of [-1, 1]) {
        const px = x + sx * (hw + 0.05), b = bed(px, zz) - 0.3;
        bag.add(LOG, logRod([px, b, zz], [px, yd - 0.28, zz], 0.13, 7));
        bag.add(LOG, logRod([px, yd - 0.06, zz], [px, yd + 0.1, zz], 0.0001 + 0.001, 4));
      }
    }
    // the stair's rail: poles on posts down the east side
    const rx = x + hw - 0.05;
    for (let k = 0; k <= 3; k++) { const zz = z0 + ramp * k / 3, yy = slope(zz); bag.add(LOG, logRod([rx, yy - 0.1, zz], [rx, yy + 1.0, zz], 0.045, 6)); }
    bag.add(LOG, beam([rx, y0 + 1.0, z0], [rx, yd + 1.0, zr], 0.07, 0.06));
    // the mooring posts at the corners of the deck's end
    for (const sx of [-1, 1]) {
      bag.add(LOG, logRod([x + sx * (hw - 0.12), yd - 0.05, ze - 0.2], [x + sx * (hw - 0.12), yd + 0.75, ze - 0.2], 0.1, 7));
      bag.add(LOG, lathe([[0.001, 0], [0.12, 0], [0.12, 0.05], [0.001, 0.05]], 7, null, x + sx * (hw - 0.12), yd + 0.75, ze - 0.2));
    }
    // a coil of rope and a pair of fish crates on the deck
    bag.add('cloth_brown', lathe([[0.2, 0], [0.26, 0.04], [0.24, 0.12], [0.2, 0.16], [0.001, 0.16]], 10, null, x + hw - 0.4, yd, zr + 1.2));
    bag.add('timber', box(x - hw + 0.15, yd, ze - 1.4, x - hw + 0.75, yd + 0.28, ze - 0.8));
    col.circle(x, ze + 0.2, 0.01, yd, yd);
  }

  /**
   * naust: { c, y, w, d, rot (turned so its open end faces the water; 0 = open end south), seed } — the boathouse: log
   * walls on the long sides and the back, the water end open under a steep gable, a plank door
   * in the back gable, the roof of birch bark and sod held by eave logs, a slip of laid logs running out of it.
   */
  function naust(el, { bag, col }) {
    const [cx, cz] = el.c, y = el.y ?? 0, hw = (el.w ?? 5.2) / 2, hd = (el.d ?? 9.5) / 2, r = 0.14, d = 0.26, H = 2.4, rot = el.rot ?? 0;
    const local = [];
    const add = (m, g) => local.push([m, g]);
    // stone footing
    add('rubble', box(-hw - 0.15, -0.5, -hd - 0.15, hw + 0.15, 0.15, hd + 0.15));
    // the long walls and the back (north) wall in logs; the south end open
    const fake = { add: (m, g) => add(m, g) };
    for (let k = 0; 0.15 + r + k * d <= H - d * 0.4; k++) {
      const yy = 0.15 + r + k * d;
      for (const sx of [-1, 1]) add(LOG, logRod([sx * hw, yy, -hd - 0.25], [sx * hw, yy, hd * 0.55], r, 7));
      if (k % 2 === 0) add(LOG, logRod([-hw - 0.25, yy + d / 2, -hd], [hw + 0.25, yy + d / 2, -hd], r, 7));
    }
    // the long walls' backs
    for (const sx of [-1, 1]) add(LOG, box(sx * hw - 0.1, 0.15, -hd + 0.05, sx * hw + 0.1, H, hd * 0.55));
    add(LOG, box(-hw + 0.03, 0.15, -hd + 0.03, hw - 0.03, H, -hd + 0.3));
    // the roof: a steep gable of bark under sod, its ridge along z, over the whole length; posts at the open end
    const yt = H + 0.15, pitch = 0.9, o = 0.55, top = pitched(fake, 'sod', null, [-hw, -hd, hw, hd], yt, pitch, o, false, 0.3);
    add(W, box(-hw * 0.12, yt + 0.2, -hd, hw * 0.12, top - 0.35, hd + 0.04));    // boarded under the ridge (hidden gable fill)
    // the open south gable: two stout posts and a tie beam hold the rafters
    for (const sx of [-1, 1]) add(LOG, logRod([sx * (hw - 0.2), 0.15, hd + 0.2], [sx * (hw - 0.2), H + 0.3, hd + 0.2], 0.17, 8));
    add(LOG, logRod([-hw - 0.1, H + 0.3, hd + 0.2], [hw + 0.1, H + 0.3, hd + 0.2], 0.12, 7));
    // the back gable boarded, with a door
    const hb = (pitch * hw), bp = [[-hw, yt - 0.05], [hw, yt - 0.05], [0, yt + hb - 0.15]];
    void bp;
    add(W, hexa([[-hw, H, -hd - 0.02], [hw, H, -hd - 0.02], [hw, H, -hd + 0.03], [-hw, H, -hd + 0.03], [-0.05, yt + hb - 0.3, -hd - 0.02], [0.05, yt + hb - 0.3, -hd - 0.02], [0.05, yt + hb - 0.3, -hd + 0.03], [-0.05, yt + hb - 0.3, -hd + 0.03]]));
    door(fake, 0, -hd - 0.05, -1, 0.15, 0.9, 1.7, 0.2);
    // the slip: laid logs across the way, running out to the south
    const slip = 6;
    for (let k = 0; k < slip * 2; k++) add(LOG, logRod([-0.9, 0.0 - k * 0.012, hd + 0.4 + k * 0.5], [0.9, -0.0 - k * 0.012, hd + 0.4 + k * 0.5], 0.09, 6));
    for (const [m, g] of local) put(bag, m, g, { ...el, at: el.c, rot }, 0);
    // collision: the three walls; the open end can be walked into (rotated rect approximated by the three bars)
    const c = Math.cos(rot), s = Math.sin(rot), W2 = (u, v) => [cx + u * c + v * s, cz - u * s + v * c];
    col.segment(W2(-hw, -hd), W2(hw, -hd), 0.4, y - 0.4, y + H);
    col.segment(W2(-hw, -hd), W2(-hw, hd * 0.55), 0.35, y - 0.4, y + H);
    col.segment(W2(hw, -hd), W2(hw, hd * 0.55), 0.35, y - 0.4, y + H);
    void SH; void roofTrim; void logWalls; void logGables;
  }

  // ── the hay racks ─────────────────────────────────────────────────────────────
  /**
   * hay_rack (hesje): { pts: [[x, z], [x, z]] (the row's two ends), y: fn(x, z), h, seed } — a row of tall posts
   * with wires (here split-pole rails) strung along at three heights and the half-dried hay hung out in
   * bundles: a sheaf thick at the foot over each rail, tapering upward, the hay standing out a little
   * round the poles, the lowest bundles hanging low enough to reach.
   */
  function hayRack(el, { bag, col }) {
    const [[ax, az], [bx, bz]] = el.pts, h = el.h ?? 2.3, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, rand = rng(el.seed || 11);
    const Lr = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / Lr, uz = (bz - az) / Lr, n = Math.max(2, Math.round(Lr / 2.2)), rails = [0.75, 1.5, 2.15].map((v) => v * h / 2.3);
    const Pt = (u, o = 0) => [ax + ux * u - uz * o, az + uz * u + ux * o];
    const posts = [];
    for (let i = 0; i <= n; i++) { const [px, pz] = Pt(Lr * i / n), py = yf(px, pz); posts.push([px, pz, py]); bag.add(LOG, logRod([px, py - 0.4, pz], [px, py + h, pz], 0.06, 6)); col.circle(px, pz, 0.08, py, py + h); }
    for (const rh of rails) for (let i = 0; i < n; i++) {
      const [x0, z0, y0] = posts[i], [x1, z1, y1] = posts[i + 1];
      bag.add(LOG, beam([x0, y0 + rh, z0], [x1, y1 + rh, z1], 0.035, 0.035));
    }
    // the hay: bundles hung over each rail between the posts, as tapering sheaves
    for (let ri = 0; ri < rails.length; ri++) for (let i = 0; i < n; i++) {
      const segN = 3, [x0, z0, y0] = posts[i], [x1, z1, y1] = posts[i + 1];
      for (let k = 0; k < segN; k++) {
        const t = (k + 0.5) / segN + (rand() - 0.5) * 0.08, px = x0 + (x1 - x0) * t, pz = z0 + (z1 - z0) * t, py = y0 + (y1 - y0) * t + rails[ri], len = 0.5 + rand() * 0.16 + (ri === 0 ? 0.0 : 0.05), rr = 0.15 + rand() * 0.05;
        // the sheaf hangs from the rail: a rail-high head, the fall of the hay below it, its ends frayed (a wider hem)
        bag.add(HAY, lathe([[rr * 0.55, 0], [rr * 1.0, -0.1], [rr * 1.0, -len * 0.6], [rr * 0.85, -len * 0.9], [rr * 1.1, -len], [0.001, -len]], 8, (th) => 1 + 0.12 * Math.sin(th * 3 + k + ri), px, py + 0.1, pz));
      }
    }
  }

  return { nboat, quay, naust, hay_rack: hayRack };
}
const HAYSAIL = 'cloth_white';
