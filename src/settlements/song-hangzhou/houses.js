// Southern Song Lin'an — the houses (docs/settlements/song-hangzhou.md §5, §10): the shop house of the
// Imperial Way and the canal streets, built here and not with Ming Suzhou's `house_jiangnan`.
//
// hz_house { rect, y, front, storeys, shop, seed, kind ('row' | 'court'), roof ('gable' | 'hip'), detail (0–2),
//   overhang, where ('imperial' | 'canal' | 'lane'), pal { plaster, plinth, roof }, simple }.
// Local frame: u along the front, v from the street (0) back to D. A timber frame on a granite plinth
// (the floor 0.45 m over the street), walls of lime-washed bamboo-lath and plaster between the posts, the
// lower metre darkened by damp; the shop's front is a row of bays, each its own kind by the house's seed — the
// removable boards of the shop front (shang ban men), the open bay with its counter and blind, the door under
// its transom, the lattice window over a dado — under a lintel on bracket blocks, a pent eave (yao yan) or
// the upper floor jutting over the street on its beam ends; the upper floor of framed windows with lattice
// and open shutters, blinds, drying poles, a balcony with a rail (lan gan) on some; a grey tile roof along the
// street on a concave profile, hipped at the ends of a row, party walls stepped above the roof (the
// fire walls Lin'an's fires taught it) on some. Weathered by rule: the damp band, rain streaks under the sills and
// the eaves, patches where the plaster fell and the brick shows, slipped tiles and moss on the roof.
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, clothBox, addCloth } from '../../core/geom.js';
import '../../styles/song/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Triangles (9 numbers each) turned to face `dir`. */
function facing(a, dir) {
  const o = [];
  for (let i = 0; i < a.length; i += 9) {
    const ux = a[i + 3] - a[i], uy = a[i + 4] - a[i + 1], uz = a[i + 5] - a[i + 2], vx = a[i + 6] - a[i], vy = a[i + 7] - a[i + 1], vz = a[i + 8] - a[i + 2];
    const d = (uy * vz - uz * vy) * dir[0] + (uz * vx - ux * vz) * dir[1] + (ux * vy - uy * vx) * dir[2];
    if (d < 0) o.push(a[i], a[i + 1], a[i + 2], a[i + 6], a[i + 7], a[i + 8], a[i + 3], a[i + 4], a[i + 5]); else for (let k = 0; k < 9; k++) o.push(a[i + k]);
  }
  return o;
}
const SHUT = ['timber', 'wood_dark', 'timber'];
const LAT = ['lattice', 'lattice', 'lattice_ice', 'lattice', 'lattice_lantern'];
const CLOTHS = ['cloth_white', 'cloth_indigo', 'cloth_blue', 'cloth_white', 'cloth_brown', 'cloth_grey'];
const FLAGS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'];

function houseSong(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's';
  const along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const det = el.simple ? 0 : (el.detail ?? 2), imperial = el.where === 'imperial', canal = el.where === 'canal';
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1], v = [-u[1], u[0]];
  const W = (a, b, yy) => [ox + u[0] * a + v[0] * b, yy, oz + u[1] * a + v[1] * b];
  const B = (a0, b0, a1, b1, ya, yb, mat) => {
    const p = W(a0, b0, 0), q = W(a1, b1, 0);
    bag.add(mat, box(Math.min(p[0], q[0]), ya, Math.min(p[2], q[2]), Math.max(p[0], q[0]), yb, Math.max(p[2], q[2])));
  };
  const acc = new Map();
  const put = (mat, arr) => { let A = acc.get(mat); if (!A) acc.set(mat, A = []); for (let i = 0; i < arr.length; i++) A.push(arr[i]); };
  const dirV = (s) => [s * v[0], 0, s * v[1]], dirU = (s) => [s * u[0], 0, s * u[1]];
  const tri4 = (P) => [...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]];
  /** A vertical quad in the plane v = b, facing the street (−1) or the back (+1). */
  const qF = (mat, a0, a1, ya, yb, b, side = -1) => put(mat, facing(tri4([W(a0, b, ya), W(a1, b, ya), W(a1, b, yb), W(a0, b, yb)]), dirV(side)));
  const qU = (mat, b0, b1, ya, yb, a, side) => put(mat, facing(tri4([W(a, b0, ya), W(a, b1, ya), W(a, b1, yb), W(a, b0, yb)]), dirU(side)));
  const qA = (mat, P, dir) => put(mat, facing(tri4(P), dir));
  const cloth = (mat, a0, a1, ya, yb, b0, b1, row = 0.25) => {
    const p = W(a0, b0, 0), q = W(a1, b1, 0);
    addCloth(bag, mat, clothBox(Math.min(p[0], q[0]), ya, Math.min(p[2], q[2]), Math.max(p[0], q[0]), yb, Math.max(p[2], q[2]), row), yb);
  };

  const st = Math.min(2, el.storeys || 1), shop = !!el.shop, ovh = !!el.overhang && st > 1 && shop;
  const pal = el.pal || {};
  const wallMat = pal.plaster || 'plaster_white', bandMat = pal.plinth === 'brick_grey' ? 'brick_grey' : 'plaster_damp', roofMat = pal.roof || 'tile_dark';
  const y0 = y + 0.45;
  const h1 = (shop ? 3.4 : 3.0) + rand() * 0.35, h2 = 2.55 + rand() * 0.35, yf = y0 + h1, yE = st > 1 ? yf + h2 : yf;
  const wall = (a0, b0, a1, b1, ya, yb) => { const m = Math.min(yb - 0.03, ya + 0.95); B(a0, b0, a1, b1, ya, yb, wallMat); B(a0 <= 0 ? 0.02 : a0 - 0.03, b0 - 0.03, a1 >= L ? L - 0.02 : a1 + 0.03, b1 + 0.03, ya - 0.04, m, bandMat); };

  // ── the plan: the main hall on the street; behind it, on deep lots, a court and a rear hall, else a walled yard ──
  const v0 = ovh ? 1.1 : 0.75, uf = st > 1 ? (ovh ? v0 - 0.5 : v0 + 0.2) : v0;
  let vb = Math.min(D - 0.15, v0 + (st > 1 ? 6.4 : 5.4) + rand() * 1.4);
  if (D - vb < 3) vb = D - 0.15;
  const rear = el.kind === 'court' && D - vb > 8.5 && !el.simple;
  const vf = uf - (st > 1 ? 0.8 : 0.85), vbE = vb + 0.65, vm = (vf + vbE) / 2, rise = Math.min(1.9, (vbE - vf) * 0.3);
  const hip = el.roof === 'hip', yEv = yE - 0.1;          // the eave's edge a little under the wall's head
  const hipIn = Math.min(L / 2 - 0.3, (vbE - vf) / 2 - 0.2);
  const tProf = (vv) => { const t = vv <= vm ? (vv - vf) / (vm - vf) : (vbE - vv) / (vbE - vm); return Math.pow(Math.max(0, Math.min(1, t)), 1.35); };
  const prof = (vv) => yEv + rise * tProf(vv);

  // plinth, party walls, back wall, with the damp band
  B(0, v0 - 0.12, L, vb, y - 0.4, y0, 'granite_block');
  if (det) B(-0.01, v0 - 0.15, L + 0.01, vb + 0.01, y0 - 0.12, y0 + 0.04, 'granite_grey');
  const sideTop = hip ? yEv : yE;
  for (const [a0, a1] of [[0, 0.25], [L - 0.25, L]]) { wall(a0, v0, a1, vb, y0 + 0.04, Math.min(yf, sideTop)); if (st > 1) B(a0, uf, a1, vb, yf, sideTop, wallMat); }
  wall(0.25, vb - 0.25, L - 0.25, vb, y0 + 0.04, yf); if (st > 1) B(0.25, vb - 0.25, L - 0.25, vb, yf, yE, wallMat);
  // the back wall's head up to the roof, under the eave
  B(0.25, vb - 0.25, L - 0.25, vb, yE, prof(vb) - 0.01, wallMat);

  // ── the roof ──
  const roofPanel = (E0, E1, R0, R1, nt) => {
    const P = (s, t) => { const ea = E0[0] + (E1[0] - E0[0]) * s, eb = E0[1] + (E1[1] - E0[1]) * s, ra = R0[0] + (R1[0] - R0[0]) * s, rb = R0[1] + (R1[1] - R0[1]) * s, k = Math.pow(t, 1.35); return W(ea + (ra - ea) * t, eb + (rb - eb) * t, yEv + rise * k); };
    const T = [];
    for (let i = 0; i < nt; i++) { const t0 = i / nt, t1 = (i + 1) / nt; T.push(...tri4([P(0, t0), P(1, t0), P(1, t1), P(0, t1)])); }
    put(roofMat, facing(T, [0, 1, 0]));
    return P;
  };
  const ra0 = hip ? hipIn : 0, ra1 = hip ? L - hipIn : L, ea0 = hip ? -0.3 : 0, ea1 = hip ? L + 0.3 : L, nt = det ? 3 : 2;
  const pF = roofPanel([ea0, vf], [ea1, vf], [ra0, vm], [ra1, vm], nt), pB = roofPanel([ea1, vbE], [ea0, vbE], [ra1, vm], [ra0, vm], nt);
  if (hip) { roofPanel([ea0, vbE], [ea0, vf], [ra0, vm], [ra0, vm], nt); roofPanel([ea1, vf], [ea1, vbE], [ra1, vm], [ra1, vm], nt); }
  // the eave's fascia and the sloping soffit under it
  for (const [b, s, wallV] of [[vf, -1, uf], [vbE, 1, vb]]) {
    qF(roofMat, ea0, ea1, yEv - 0.15, yEv + 0.03, b, s);
    const yw = prof(wallV) - 0.1, a = [W(ea0, b, yEv - 0.15), W(ea1, b, yEv - 0.15), W(ea1, wallV, yw), W(ea0, wallV, yw)];
    qA('timber', a, [0, -1, 0]);
  }
  if (hip) for (const [a, s] of [[-0.3, -1], [L + 0.3, 1]]) { qU(roofMat, vf, vbE, yEv - 0.15, yEv + 0.03, a, s); qA('timber', [W(a, vf, yEv - 0.15), W(a, vbE, yEv - 0.15), W(s < 0 ? 0 : L, vb, yEv - 0.05), W(s < 0 ? 0 : L, vf + 0.8, yEv - 0.05)], [0, -1, 0]); }
  // the ridge with its upturned ends (gable), the hips' ridges
  { const yR = yEv + rise, rd = (aa, bb) => B(aa, vm - 0.1, bb, vm + 0.1, yR - 0.02, yR + 0.2, roofMat); rd(ra0 + (hip ? 0 : 0.0), ra1);
    if (!hip) { for (const [a, s] of [[0, 1], [L - 0.3, 1]]) B(a, vm - 0.07, a + 0.3, vm + 0.07, yR + 0.2, yR + 0.36, roofMat); void 0; } }
  // the gable ends filled to the roof's line (above the walls' heads), plain or stepped as a fire wall
  const fire = !hip && st > 1 && (el.seed % 3 === 0 || imperial && el.seed % 3 === 1) && det > 0;
  if (!hip) for (const [a, s] of [[0, -1], [L, 1]]) {
    const N = 6, T = [];
    for (let i = 0; i < N; i++) for (const [p, q] of [[vf + 0.9 + (vm - vf - 0.9) * i / N, vf + 0.9 + (vm - vf - 0.9) * (i + 1) / N], [vbE - 0.7 - (vbE - 0.7 - vm) * i / N, vbE - 0.7 - (vbE - 0.7 - vm) * (i + 1) / N]]) T.push(...tri4([W(a, p, yE - 0.02), W(a, q, yE - 0.02), W(a, q, Math.max(yE, prof(q)) - 0.02), W(a, p, Math.max(yE, prof(p)) - 0.02)]));
    put(wallMat, facing(T, dirU(s)));
    if (fire) {
      // steps from the eave toward the ridge, each with a tiled coping, the highest over the ridge
      const wa = s < 0 ? 0 : L - 0.25, vs = [uf + 0.2, uf + (vm - uf) * 0.45, vm, vb - (vb - vm) * 0.45, vb - 0.2];
      for (let k = 0; k + 1 < vs.length; k++) { const top = prof(k < 2 ? vs[k + 1] : vs[k]) + 0.28 + (k === 1 || k === 2 ? 0.25 : 0); const p = Math.min(vs[k], vs[k + 1]), q = Math.max(vs[k], vs[k + 1]); B(wa, p, wa + 0.25, q, yE - 0.1, top, wallMat); B(wa - 0.04, p - 0.02, wa + 0.29, q + 0.02, top, top + 0.09, 'tile_dark'); }
    } else if (det) { for (const [p, q] of [[vf + 0.9, vm], [vm, vbE - 0.7]]) { const t = []; const A = W(a, p, prof(p) + 0.02), Bq = W(a, q, prof(q) + 0.02); t.push(...A, ...Bq, A[0], A[1] + 0.09, A[2], ...Bq, Bq[0], Bq[1] + 0.09, Bq[2], A[0], A[1] + 0.09, A[2]); put(roofMat, facing(t, dirU(s))); } }
  }
  // wear on the roof: slipped tiles, patches, moss on the cool side
  if (det) for (let k = 0, n = det > 1 ? 5 : 2; k < n; k++) {
    const s0 = 0.1 + rand() * 0.75, t0 = 0.15 + rand() * 0.6, ds = 0.05 + rand() * 0.09, dt = 0.08 + rand() * 0.1, P = rand() < 0.65 ? pF : pB, r = rand();
    const c = [P(s0, t0), P(s0 + ds, t0), P(s0 + ds, t0 + dt), P(s0, t0 + dt)].map((p) => [p[0], p[1] + 0.03, p[2]]);
    qA(r < 0.25 ? 'wood_dark' : r < 0.6 ? 'tile_grey' : 'plaster_damp', c, [0, 1, 0]);
  }

  // ── the ground floor's front ──
  const sill = (a0, a1) => B(a0, v0 - 0.05, a1, v0 + 0.25, y0, y0 + 0.18, 'granite_grey');
  const step = (a0, a1) => { B(a0, v0 - 0.4, a1, v0 - 0.02, y + 0.03, y0 - 0.1, 'granite_block'); if (v0 > 0.9) B(a0 - 0.05, v0 - 0.75, a1 + 0.05, v0 - 0.4, y + 0.03, y0 - 0.32, 'granite_block'); };
  const frontSimple = det === 0;
  if (shop && !frontSimple) {
    const nb = Math.max(1, Math.round(L / (imperial ? 3.0 : 3.3))), bw = (L - 0.5) / nb;
    const lint = yf - 0.4;
    B(0, v0 - 0.05, L, v0 + 0.22, lint, yf, 'wood_dark');                             // the lintel
    for (let k = 0; k <= nb; k++) { const a = 0.25 + bw * k, a0 = Math.max(0, a - 0.11), a1 = Math.min(L, a + 0.11); B(a0, v0 - 0.02, a1, v0 + 0.21, y0, lint, 'timber'); B(a0 - 0.06, v0 - 0.12, a1 + 0.06, v0 + 0.21, lint - 0.2, lint, 'wood_dark'); B(a0 - 0.02, v0 - 0.02, a1 + 0.02, v0 + 0.23, y0, y0 + 0.14, 'granite_grey'); }   // posts on their stone feet, the bracket blocks
    const kinds = []; let openAt = Math.floor(rand() * nb);
    for (let k = 0; k < nb; k++) { const r = rand(); kinds.push(k === openAt ? 'open' : r < 0.5 ? 'boards' : r < 0.68 ? 'open' : r < 0.84 ? 'lattice' : 'door'); }
    if (nb > 2 && !kinds.includes('door')) kinds[(openAt + 1) % nb] = rand() < 0.5 ? 'door' : kinds[(openAt + 1) % nb];
    step(0.25, L - 0.25);
    for (let k = 0; k < nb; k++) {
      const a0 = 0.25 + bw * k + 0.11, a1 = 0.25 + bw * (k + 1) - 0.11, kind = kinds[k], hb = lint - y0, hole = rand();
      sill(a0, a1);
      if (kind === 'boards') {
        // the removable boards (shang ban), stood in their groove; a few taken out, showing the dark inside, the stack leaning at the end
        qF('wood_dark', a0, a1, y0 + 0.18, lint, v0 + 0.14, -1);
        const np = Math.max(3, Math.round((a1 - a0) / 0.3)), pw = (a1 - a0) / np, gone = hole < 0.35 ? 1 + Math.floor(rand() * 2) : 0, g0 = Math.floor(rand() * (np - gone));
        for (let p = 0; p < np; p++) { if (p >= g0 && p < g0 + gone) continue; B(a0 + p * pw + 0.012, v0 + 0.03, a0 + (p + 1) * pw - 0.012, v0 + 0.1, y0 + 0.18, lint, SHUT[(p + k) % 3]); }
        if (gone) B(a0 + g0 * pw, v0 - 0.2, a0 + g0 * pw + 0.3, v0 - 0.12, y0 + 0.2, lint - 0.3, 'timber');
      } else if (kind === 'open') {
        qF('wood_dark', a0, a1, y0 + 0.18, lint, v0 + 0.5, -1);
        B(a0, v0 - 0.12, a1, v0 + 0.5, y0 + 0.18, y0 + 0.92, 'timber'); B(a0 - 0.04, v0 - 0.16, a1 + 0.04, v0 + 0.5, y0 + 0.92, y0 + 0.98, 'wood_dark');   // the counter and its top
        for (let p = 0; p < 3; p++) { const aa = a0 + (a1 - a0) * (0.2 + 0.3 * p); B(aa, v0 + 0.1, aa + 0.4, v0 + 0.4, y0 + 0.98, y0 + 1.1 + rand() * 0.25, ['timber', 'cloth_brown', 'pottery_dark', 'cloth_red', 'plaster_white'][Math.floor(rand() * 5)]); }
        if (hole < 0.55) cloth('reed_mat', a0 + 0.05, a1 - 0.05, lint - 0.55 - rand() * 0.4, lint - 0.02, v0 - 0.09, v0 - 0.05);       // a blind half let down
        else if (hole < 0.8) cloth(FLAGS[Math.floor(rand() * 5)], a0 + 0.1, a1 - 0.1, lint - 0.5, lint - 0.02, v0 - 0.1, v0 - 0.07, 0.2);   // a cloth valance
      } else if (kind === 'lattice') {
        B(a0, v0 - 0.02, a1, v0 + 0.12, y0 + 0.18, y0 + 1.0, 'timber');                   // the dado
        for (let p = 0; p < 2; p++) B(a0 + 0.1 + (a1 - a0 - 0.2) * p / 2, v0 - 0.04, a0 + 0.1 + (a1 - a0 - 0.2) * (p + 1) / 2 - 0.04, v0 - 0.0, y0 + 0.28, y0 + 0.9, 'wood_dark');
        B(a0, v0 - 0.02, a1, v0 + 0.1, y0 + 1.0, lint + 0.02, LAT[Math.floor(rand() * LAT.length)]);
        B(a0, v0 - 0.06, a1, v0 + 0.0, y0 + 0.97, y0 + 1.04, 'wood_dark');
      } else {
        const dw = Math.min(1.5, a1 - a0 - 0.5), da = (a0 + a1) / 2 - dw / 2;
        B(a0, v0 + 0.0, a1, v0 + 0.12, y0 + 0.18, lint, 'wood_dark');
        B(da - 0.08, v0 - 0.06, da + dw + 0.08, v0 + 0.16, y0 + 0.14, y0 + 2.45, 'timber');   // the frame
        B(da, v0 - 0.0, da + dw / 2 - 0.02, v0 + 0.1, y0 + 0.14, y0 + 2.4, 'lacquer_black'); B(da + dw / 2 + 0.02, v0 - 0.0, da + dw, v0 + 0.1, y0 + 0.14, y0 + 2.4, 'lacquer_black');
        B(da - 0.1, v0 - 0.02, da + dw + 0.1, v0 + 0.1, y0 + 2.45, lint + 0.02, LAT[Math.floor(rand() * 3)]);                     // the transom
        for (const s of [0.18, dw - 0.18]) B(da + s - 0.04, v0 - 0.04, da + s + 0.04, v0, y0 + 1.0, y0 + 1.08, 'iron');      // the door rings
      }
    }
    // the sign bracket: a post-arm with a hanging board or a wine flag, on the corner bay
    if (rand() < (imperial ? 0.85 : 0.55)) {
      const a = rand() < 0.5 ? 0.12 : L - 0.12, s = a < L / 2 ? 1 : -1, hh = yf + 0.2;
      B(a - 0.04, v0 - 0.9, a + 0.04, v0 - 0.02, hh, hh + 0.08, 'iron'); B(a - 0.03, v0 - 0.9, a + 0.03, v0 - 0.84, hh - 1.5, hh + 0.08, 'iron');
      if (rand() < 0.5) { B(a - 0.01 + s * 0, v0 - 1.2, a + 0.2 * s, v0 - 0.84, hh - 1.3, hh - 0.35, 'lacquer_black'); }     // a hanging signboard
      else cloth(FLAGS[Math.floor(rand() * 5)], a - 0.03, a + 0.03, hh - 1.7, hh - 0.05, v0 - 1.55, v0 - 0.88, 0.25);    // the flag
    }
    // the pent eave over the ground floor (when the upper floor does not jut): its tiles, the timber beneath
    if (st > 1 && !ovh) {
      const yb = yf + 0.28, a = [W(-0.15, uf, yb + 0.4), W(L + 0.15, uf, yb + 0.4), W(L + 0.15, v0 - 0.8, yb - 0.1), W(-0.15, v0 - 0.8, yb - 0.1)];
      qA(roofMat, a, [0, 1, 0]); qA('timber', a.map((p) => [p[0], p[1] - 0.1, p[2]]), [0, -1, 0]);
      qF(roofMat, -0.15, L + 0.15, yb - 0.24, yb - 0.08, v0 - 0.8, -1);
    }
    if (ovh) {
      // the upper floor jutting out over the street: the beam ends under it, boards under them
      const nbm = Math.max(3, Math.round(L / 0.9));
      B(0, uf, L, v0 + 0.1, yf, yf + 0.3, 'wood_dark');
      for (let k = 0; k < nbm; k++) { const a = 0.15 + (L - 0.45) * k / (nbm - 1); B(a, uf, a + 0.14, v0, yf - 0.2, yf, 'timber'); }
      qA('timber', [W(0.1, uf, yf - 0.2), W(L - 0.1, uf, yf - 0.2), W(L - 0.1, v0, yf - 0.2), W(0.1, v0, yf - 0.2)], [0, -1, 0]);
    }
  } else if (!frontSimple) {
    // a house: a plaster wall with its door under a little tiled hood, windows with a stone sill
    wall(0.25, v0, L - 0.25, v0 + 0.22, y0 + 0.04, yf);
    const dc = L * (0.22 + 0.56 * rand()), dw = 1.0;
    B(dc - dw / 2 - 0.14, v0 - 0.08, dc - dw / 2, v0 + 0.22, y0, y0 + 2.3, 'granite_grey'); B(dc + dw / 2, v0 - 0.08, dc + dw / 2 + 0.14, v0 + 0.22, y0, y0 + 2.3, 'granite_grey');
    B(dc - dw / 2 - 0.18, v0 - 0.1, dc + dw / 2 + 0.18, v0 + 0.22, y0 + 2.3, y0 + 2.5, 'granite_grey');
    B(dc - dw / 2, v0 - 0.03, dc + dw / 2, v0 + 0.1, y0, y0 + 2.3, 'lacquer_black');
    step(dc - dw / 2 - 0.1, dc + dw / 2 + 0.1);
    const hp = [W(dc - 0.95, v0 + 0.12, y0 + 3.0), W(dc + 0.95, v0 + 0.12, y0 + 3.0), W(dc + 0.95, v0 - 0.55, y0 + 2.65), W(dc - 0.95, v0 - 0.55, y0 + 2.65)];
    qA(roofMat, hp, [0, 1, 0]); qA('timber', hp, [0, -1, 0]);
    const nw = L > 6 ? 2 : 1;
    for (let k = 0; k < nw; k++) {
      const wc = dc < L / 2 ? L * (0.66 + 0.2 * k) : L * (0.2 + 0.2 * k) + 0.3;
      if (Math.abs(wc - dc) < 1.5 || wc < 0.9 || wc > L - 0.9) continue;
      B(wc - 0.45, v0 - 0.05, wc + 0.45, v0 + 0.03, y0 + 1.4, y0 + 2.15, 'wood_dark'); B(wc - 0.38, v0 - 0.1, wc + 0.38, v0 - 0.0, y0 + 1.46, y0 + 2.09, LAT[Math.floor(rand() * 4)]);
      B(wc - 0.52, v0 - 0.12, wc + 0.52, v0 + 0.04, y0 + 1.28, y0 + 1.4, 'granite_grey');
    }
    if (st > 1) { const yb = yf + 0.28, a = [W(-0.1, uf, yb + 0.4), W(L + 0.1, uf, yb + 0.4), W(L + 0.1, v0 - 0.6, yb - 0.1), W(-0.1, v0 - 0.6, yb - 0.1)]; qA(roofMat, a, [0, 1, 0]); qA('timber', a.map((p) => [p[0], p[1] - 0.1, p[2]]), [0, -1, 0]); }
  } else {
    // the far houses: boards and a door, as plain as that
    wall(0.25, v0, L - 0.25, v0 + 0.2, y0 + 0.04, yf);
    if (shop) B(0.25, v0 - 0.04, L - 0.25, v0 + 0.1, y0 + 0.2, yf - 0.4, 'timber'); else B(L / 2 - 0.5, v0 - 0.03, L / 2 + 0.5, v0 + 0.1, y0, y0 + 2.2, 'lacquer_black');
    if (st > 1 && !ovh) { const yb = yf + 0.28, a = [W(0, uf, yb + 0.4), W(L, uf, yb + 0.4), W(L, v0 - 0.8, yb - 0.1), W(0, v0 - 0.8, yb - 0.1)]; qA(roofMat, a, [0, 1, 0]); qA('timber', a.map((p) => [p[0], p[1] - 0.1, p[2]]), [0, -1, 0]); }
    if (ovh) { B(0, uf, L, v0 + 0.1, yf - 0.2, yf + 0.3, 'wood_dark'); }
  }

  // ── the upper floor ──
  if (st > 1) {
    B(0.25, uf, L - 0.25, uf + 0.22, yf, yE, wallMat);
    const balcony = det > 1 && shop && rand() < (imperial ? 0.4 : 0.22) && L > 5, nb = Math.max(2, Math.round(L / (det > 1 ? 1.6 : 2.0))), bw = (L - 0.5) / nb;
    if (det) {
      // the frame shows: posts at the bays' lines, a tie beam under the eave and a sill beam over the floor
      B(0.25, uf - 0.04, L - 0.25, uf + 0.04, yf, yf + 0.14, 'timber'); B(0.25, uf - 0.05, L - 0.25, uf + 0.05, yE - 0.3, yE - 0.1 + 0.0, 'wood_dark');
      for (let k = 0; k <= nb; k++) { const a = 0.25 + bw * k; B(Math.max(0, a - 0.07), uf - 0.04, Math.min(L, a + 0.07), uf + 0.05, yf + 0.14, yE - 0.3, 'timber'); }
    }
    const lo = yf + 0.6, hi = yE - 0.45;
    const balcA = 0.5, balcB = L - 0.5;
    for (let k = 0; k < nb; k++) {
      const wc = 0.25 + bw * (k + 0.5), ww = Math.min(1.25, bw - 0.4), a0 = wc - ww / 2, a1 = wc + ww / 2, lat = LAT[Math.floor(rand() * LAT.length)], r = rand();
      const door = balcony && wc > balcA && wc < balcB;
      const ya = door ? yf + 0.14 : lo, yb = door ? hi + 0.05 : hi;
      B(a0 - 0.08, uf - 0.06, a1 + 0.08, uf + 0.02, ya - 0.08, yb + 0.1, 'wood_dark');                                  // the frame
      B(a0, uf - 0.1, a1, uf, ya, yb, lat);
      if (!door) B(a0 - 0.12, uf - 0.12, a1 + 0.12, uf + 0.03, lo - 0.14, lo - 0.06, 'timber');                          // the sill
      // shutters: one leaf open against the wall, a blind, or a lit lattice alone
      if (r < 0.4) { B(a1 + 0.08, uf - 0.13, a1 + 0.08 + ww * 0.5, uf - 0.09, ya, yb, SHUT[k % 3]); }
      else if (r < 0.58 && !door) cloth('reed_mat', a0 - 0.05, a1 + 0.05, ya + 0.1 + rand() * 0.5, yb + 0.12, uf - 0.13, uf - 0.09);
      if (det > 1 && !door && rand() < 0.5) { qF('plaster_damp', wc - 0.2 + rand() * 0.15, wc + 0.15, lo - 1.3 - rand() * 0.2, lo - 0.14, uf - 0.03, -1); }   // the rain's streak under the sill
    }
    // the balcony: a deck on bracket beams, a rail of posts, the lacquered top rail
    if (balcony) {
      const bb = uf - 1.0;
      B(balcA, bb, balcB, uf, yf - 0.08, yf + 0.1, 'wood_dark');
      for (let k = 0; k < 6; k++) { const a = balcA + (balcB - balcA) * k / 5; B(a - 0.06, bb + 0.2, a + 0.06, uf, yf - 0.5, yf - 0.08, 'timber'); }
      for (let k = 0; k <= Math.round((balcB - balcA) / 0.45); k++) { const a = balcA + k * 0.45; if (a > balcB) break; B(a - 0.03, bb, a + 0.03, bb + 0.06, yf + 0.1, yf + 1.0, 'lacquer_red'); }
      B(balcA, bb - 0.04, balcB, bb + 0.1, yf + 1.0, yf + 1.1, 'lacquer_red'); B(balcA, bb - 0.01, balcB, bb + 0.04, yf + 0.5, yf + 0.56, 'lacquer_red');
      for (const a of [balcA, balcB]) { B(a - 0.04, bb - 0.01, a + 0.04, bb + 0.05, yf + 0.1, yf + 1.1, 'lacquer_red'); B(a - 0.03, bb, a + 0.03, uf, yf + 0.5, yf + 0.56, 'lacquer_red'); B(a - 0.04, bb, a + 0.04, uf, yf + 1.0, yf + 1.1, 'lacquer_red'); }
    }
    // weathering of the wall: patches where the plaster fell and the brick shows, the stain under the eave
    if (det) {
      B(0.25, uf - 0.0, L - 0.25, uf + 0.0, yE - 0.0, yE, wallMat);
      qF('plaster_damp', 0.3, L - 0.3, yE - 0.62, yE - 0.3, uf - 0.03, -1);
      for (let k = 0, n = det > 1 ? 2 : 1; k < n; k++) { const a = 0.4 + rand() * (L - 1.4), w2 = 0.35 + rand() * 0.5; qF(rand() < 0.6 ? 'brick_grey' : 'plaster_grey', a, a + w2, yf + 0.3 + rand() * 0.8, yf + 0.8 + rand() * 0.9, uf - 0.035, -1); }
    }
    // a pole out from a window with washing hung on it
    if (det > 1 && rand() < 0.32) {
      const a = 0.3 + bw * (Math.floor(rand() * nb) + 0.5), hh = yf + 1.9;
      B(a - 0.9, uf - 0.9, a + 0.9, uf - 0.86, hh, hh + 0.04, 'timber');
      B(a - 0.9, uf - 0.9, a - 0.86, uf - 0.01, hh, hh + 0.04, 'timber'); B(a + 0.86, uf - 0.9, a + 0.9, uf - 0.01, hh, hh + 0.04, 'timber');
      cloth(CLOTHS[Math.floor(rand() * 6)], a - 0.8, a - 0.1, hh - 0.85, hh, uf - 0.89, uf - 0.87, 0.3); cloth(CLOTHS[Math.floor(rand() * 6)], a + 0.05, a + 0.7, hh - 0.7, hh, uf - 0.89, uf - 0.87, 0.3);
    }
  } else if (det) {
    // a one-storey front: the stain under the eave, a patch or two
    qF('plaster_damp', 0.3, L - 0.3, yf - 0.55, yf - 0.2, v0 - 0.03, -1);
  }
  // the lower band's rain-splashed top, ragged tongues of damp up the front (ground floor)
  if (det && !shop) for (let k = 0; k < 3; k++) { const a = 0.4 + rand() * (L - 1.2); qF(bandMat, a, a + 0.3 + rand() * 0.5, y0 + 0.95, y0 + 1.25 + rand() * 0.6, v0 - 0.03, -1); }
  if (det && st > 1 && canal) for (let k = 0; k < 2; k++) { const a = 0.4 + rand() * (L - 1.0); qF('plaster_damp', a, a + 0.3 + rand() * 0.4, y0 + 1.0, y0 + 1.6 + rand() * 0.8, uf - 0.035, -1); }

  // ── behind the hall: a rear hall with its court, or the walled yard; the lane's wall at the back ──
  const rb = D - 0.15;
  if (rear) {
    const bd2 = 4.2 + rand() * 0.6, vr0 = rb - bd2, h = 3.0, yEr = y0 + h + 0.3;
    B(0, vb, L, vr0, y0 - 0.45, y0 - 0.37, 'brick_grey');                                                       // the court's bricks
    for (const [a0, a1] of [[0, 0.24], [L - 0.24, L]]) { wall(a0, vb, a1, vr0, y0 - 0.45, y0 + 2.7); B(a0 - 0.03, vb, a1 + 0.03, vr0, y0 + 2.7, y0 + 2.8, 'tile_dark'); }
    B(0, vr0, L, rb, y - 0.4, y0, 'granite_block');
    wall(0, vr0, L, rb, y0, y0 + h);
    B(0.3, vr0 - 0.03, L - 0.3, vr0, y0 + 0.2, y0 + 2.4, 'lattice');
    for (let k = 0; k <= 4; k++) { const a = 0.3 + (L - 0.6) * k / 4; B(a - 0.07, vr0 - 0.1, a + 0.07, vr0 + 0.1, y0, y0 + 2.5, 'timber'); }
    const r2 = (E0, E1, R0, R1) => { const T = []; const P = (s, t) => W(E0[0] + (E1[0] - E0[0]) * s + (R0[0] - E0[0]) * t, E0[1] + (E1[1] - E0[1]) * s + (R0[1] - E0[1]) * t, yEr + 1.1 * Math.pow(t, 1.35)); T.push(...tri4([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])); put(roofMat, facing(T, [0, 1, 0])); };
    const m2 = (vr0 - 0.8 + rb + 0.5) / 2;
    r2([-0.0, vr0 - 0.8], [L, vr0 - 0.8], [0, m2], [L, m2]); r2([L, rb + 0.5], [0, rb + 0.5], [L, m2], [0, m2]);
    qF(roofMat, 0, L, yEr - 0.15, yEr + 0.03, vr0 - 0.8, -1);
    col.rect(el.rect, y - 0.4, yE + rise);
    return flush();
  }
  if (vb < rb - 0.5) {
    // the yard: walls on the lane's side and between the neighbours, the gate in the street-side wall of a lane
    const wh = 2.9 + rand() * 0.4;
    for (const [a0, a1] of [[0, 0.24], [L - 0.24, L]]) { wall(a0, vb, a1, rb, y0 - 0.1, y0 + wh); B(a0 - 0.03, vb, a1 + 0.03, rb, y0 + wh, y0 + wh + 0.1, 'tile_dark'); }
    wall(0.24, rb - 0.24, L - 0.24, rb, y0 - 0.1, y0 + wh); B(0.21, rb - 0.27, L - 0.21, rb + 0.03, y0 + wh, y0 + wh + 0.1, 'tile_dark');
    B(0.24, vb, L - 0.24, rb - 0.24, y - 0.4, y0 - 0.3, 'brick_grey');
    if (det) {   // the yard's things: a water jar, firewood and a stack of boards leaned on the back wall
      const cx = 0.6 + rand() * (L - 1.4);
      bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.14], [0.4, 0.4], [0.3, 0.7], [0.18, 0.78], [0.001, 0.78]], 8, null, ...W(cx, vb + 1.0, y0 - 0.3)));
      B(cx + 0.9, rb - 0.8, cx + 2.0, rb - 0.26, y0 - 0.3, y0 + 0.5, 'timber');
    }
  }
  col.rect(el.rect, y - 0.4, yE + rise);
  flush();

  function flush() { for (const [mat, arr] of acc) if (arr.length) bag.add(mat, fromTriangles(arr)); }
}

STYLES.song.elements.hz_house = houseSong;

// ── the streets' edges: the gutters along the fronts, the mooring stones on the canal's bank ──
/**
 * hz_gutter { a: [x, z0], b: [x, z1] (a street's frontage line, running north–south), side (+1 the street lies east of the line, −1 west), y, seed }: the open
 * drain along the foot of the fronts, a slate-lined channel with granite cover slabs across it before each door every few metres; the water runs to the canal.
 * hz_mooring { at: [x, z], y, rot }: a mooring stone (xi chuan shi) of granite on the bank, its rope-worn ring.
 */
function gutter(el, { bag }) {
  const rand = rng(el.seed || 7), [x, za] = el.a, zb = el.b[1], s = el.side || 1, y = el.y ?? 0.04, w = 0.34, x0 = s > 0 ? x + 0.06 : x - 0.06 - w;
  bag.add('slate', box(x0, y, za, x0 + w, y + 0.03, zb));
  bag.add('granite_grey', box(x0 + (s > 0 ? w : -0.07), y, za, x0 + (s > 0 ? w + 0.07 : 0), y + 0.07, zb));     // the kerb on the street side
  for (let z = za + 1 + rand() * 2; z < zb - 1.5; z += 2.2 + rand() * 4) { const L2 = 0.8 + rand() * 1.4; bag.add('granite_grey', box(x0 - 0.04, y, z, x0 + w + 0.1, y + 0.08, Math.min(zb, z + L2))); }
}
function mooring(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0.04;
  bag.add('granite_grey', lathe([[0.001, 0], [0.2, 0], [0.19, 0.1], [0.14, 0.5], [0.15, 0.58], [0.1, 0.66], [0.001, 0.68]], 8, null, x, y, z));
  bag.add('iron', box(x - 0.07 + (el.rot ? 0.0 : 0), y + 0.32, z - 0.17, x + 0.07, y + 0.4, z - 0.12));
  col.circle(x, z, 0.22, y, y + 0.7);
}
STYLES.song.elements.hz_gutter = gutter;
STYLES.song.elements.hz_mooring = mooring;

/** The elements of the streets' edges (one plan): gutters along the Imperial Way's and the canal streets' fronts, mooring stones along the canal's two banks. */
export function streetsideElements(L) {
  const E = [], rand = rng(404), street = L.LEVEL.street + 0.04;
  const zs = L.CITY.zs, zn = L.CITY.zn, th = L.CITY.th;
  const spans = [[L.CANAL.z0 + 10, zn - th / 2 - 6], [zn + th / 2 + 6, zs - th / 2 - 6], [zs + th / 2 + 6, L.ROAD.z0 - 18]];
  const lines = [[L.IMPERIAL[0], -1], [L.IMPERIAL[2], 1], [L.CANAL_STREETS[0][0], 1], [L.CANAL_STREETS[1][2], -1]];
  for (const [x, side] of lines) for (const [za, zb] of spans) {
    // cut by the lanes' mouths
    let segs = [[za, zb]];
    for (const r of L.streets().filter((q) => q.kind !== 'imperial').map((q) => q.r)) if (r[0] <= x + 0.1 && r[2] >= x - 0.1) segs = segs.flatMap(([p, q]) => (r[3] <= p || r[1] >= q ? [[p, q]] : [[p, r[1] - 0.3], [r[3] + 0.3, q]].filter(([m, n]) => n - m > 3)));
    for (const [p, q] of segs) if (!(x < 60 && p < zs + th / 2 && q > zs - th / 2)) E.push({ t: 'hz_gutter', a: [x, p], b: [x, q], side, y: street, seed: Math.floor(rand() * 1e6) });
  }
  // the canal streets' own paving (the lanes' ends abut it)
  for (const r of L.CANAL_STREETS) for (const [za, zb] of spans) E.push({ t: 'paving', rect: [r[0], za - 6, r[2], zb + 6 > L.ROAD.z0 ? L.ROAD.z0 : zb + 6], y: street, th: 0.3 });
  for (const r of L.CANAL_STREETS) for (const [za, zb] of spans) E.push({ t: 'hz_slabs', rect: [r[0], za - 6, r[2], Math.min(zb + 6, L.ROAD.z0 - 6)], y: street + 0.02, seed: Math.round(r[0] + za), side: r[0] < L.CANAL.x0 ? 'w' : 'e' });
  // the mooring stones, on the street side of the canal's edge, between the landings
  for (const [x, dir] of [[L.CANAL.x0 - 0.9, -1], [L.CANAL.x1 + 0.9, 1]]) for (const [za, zb] of spans) {
    for (let z = za + 6 + rand() * 6; z < zb - 6; z += 11 + rand() * 9) {
      if (L.CANAL_BRIDGES.some((bz) => Math.abs(bz - z) < 9)) continue;
      E.push({ t: 'hz_mooring', at: [x, z], y: street, rot: dir > 0 ? 1 : 0 });
    }
  }
  return E;
}
