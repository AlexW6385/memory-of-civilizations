// The outside of Michelangelo's block and of Maderno's nave (docs/settlements/baroque-rome.md §4, "The sides of
// the church"): one giant order of Corinthian pilasters carrying a full entablature on modillions; in each bay a tall
// arched niche, over it a window under a triangular or a segmental pediment, and over that a small square window,
// as on the walls Michelangelo left (the order and the three tiers of openings are his, 1547–64). Built in the
// frame of each wall (u along it, y up, d out) and round the apses by polar angle.
import { Matrix4 } from '../../core/three.js';
import { box } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { Local, ext, headPts, archOutline, faceFrame } from '../renaissance/face.js';

const TR = 'travertine', O = 'opening', MB = 'marble';

/** The content of one bay in a Local frame, standing at plane d = dOff: pilaster at u0 (width pw), niche, window, small window. */
function pilaster(Lc, uc, pw, yE, d) {
  const u0 = uc - pw / 2, u1 = uc + pw / 2;
  Lc.box(TR, u0 - 0.2, 0, d, u1 + 0.2, 0.7, d + 0.55);
  Lc.box(TR, u0, 0.7, d, u1, yE - 1.7, d + 0.45);
  Lc.box(TR, u0 + 0.12, 0.7, d + 0.45, u0 + 0.22, yE - 1.7, d + 0.5);                // (the flutes: two grooves' edges, as fillets)
  Lc.box(TR, u1 - 0.22, 0.7, d + 0.45, u1 - 0.12, yE - 1.7, d + 0.5);
  Lc.box(TR, u0 - 0.03, yE - 1.7, d, u1 + 0.03, yE - 1.25, d + 0.5);                 // the capital: necking, two rows of leaves, the abacus
  Lc.box(TR, u0 - 0.1, yE - 1.25, d, u1 + 0.1, yE - 0.55, d + 0.62);
  for (let k = 0; k < 4; k++) Lc.box(TR, u0 + 0.12 + k * (pw - 0.5) / 3, yE - 1.2, d + 0.62, u0 + 0.38 + k * (pw - 0.5) / 3, yE - 0.7, d + 0.7);
  Lc.box(TR, u0 - 0.3, yE - 0.55, d, u1 + 0.3, yE - 0.2, d + 0.7);
}
function bayContent(Lc, uc, bwid, yE, odd, d) {
  const ww = Math.min(2.7, bwid - 1.4), niche = Math.min(4.6, bwid - 1.5);
  // the niche: a round-headed field, a moulded ring, the sill
  const ny0 = 0.055 * yE, nys = 0.31 * yE;
  Lc.add(O, ext(archOutline(uc, ny0, niche, nys, 'round', 8), [], d, d + 0.06));
  Lc.add(TR, ext(headPts(uc, nys, niche + 0.7, 'round', 8).concat(headPts(uc, nys, niche, 'round', 8).reverse()), [], d, d + 0.28));
  Lc.box(TR, uc - niche / 2 - 0.35, ny0 - 0.35, d, uc + niche / 2 + 0.35, ny0, d + 0.5);
  for (const sg of [-1, 1]) Lc.box(TR, uc + sg * niche / 2 - (sg > 0 ? 0 : 0.35), ny0, d, uc + sg * niche / 2 + (sg > 0 ? 0.35 : 0), nys, d + 0.28);
  // the window: an opening, jambs, sill on consoles, a hood and the pediment, alternately triangular and segmental
  const wy = 0.43 * yE, wh = 0.13 * yE;
  Lc.box(O, uc - ww / 2, wy, d, uc + ww / 2, wy + wh, d + 0.06);
  for (const sg of [-1, 1]) Lc.box(TR, uc + sg * (ww / 2 + 0.18) - 0.18, wy - 0.2, d, uc + sg * (ww / 2 + 0.18) + 0.18, wy + wh + 0.2, d + 0.32);
  Lc.box(TR, uc - ww / 2 - 0.5, wy - 0.5, d, uc + ww / 2 + 0.5, wy - 0.15, d + 0.5);
  for (const sg of [-1, 1]) Lc.box(TR, uc + sg * (ww / 2 - 0.1) - 0.15, wy - 1.05, d, uc + sg * (ww / 2 - 0.1) + 0.15, wy - 0.5, d + 0.4);   // consoles
  Lc.box(TR, uc - ww / 2 - 0.55, wy + wh + 0.2, d, uc + ww / 2 + 0.55, wy + wh + 0.55, d + 0.5);
  const base = wy + wh + 0.55, pw = ww / 2 + 0.55, pts = [];
  if (!odd) pts.push([uc - pw, base], [uc + pw, base], [uc, base + 1.3]);
  else for (let i = 0; i <= 10; i++) { const t = i / 10 * Math.PI; pts.push([uc + pw * Math.cos(Math.PI - t), base + 0.03 + 0.95 * Math.sin(t)]); }
  Lc.add(TR, ext(pts, [], d, d + 0.45));
  // the small window of the upper tier, framed
  if (yE > 40) { const sy = 0.68 * yE, sw = 1.6; Lc.box(O, uc - sw / 2, sy, d, uc + sw / 2, sy + 2.0, d + 0.06); for (const sg of [-1, 1]) Lc.box(TR, uc + sg * (sw / 2 + 0.15) - 0.15, sy - 0.15, d, uc + sg * (sw / 2 + 0.15) + 0.15, sy + 2.15, d + 0.28); Lc.box(TR, uc - sw / 2 - 0.3, sy + 2.0, d, uc + sw / 2 + 0.3, sy + 2.3, d + 0.35); Lc.box(TR, uc - sw / 2 - 0.3, sy - 0.3, d, uc + sw / 2 + 0.3, sy, d + 0.35); }
}
/** The entablature along u from u0 to u1: three fasciae, the frieze, the cornice on modillions, the corona, from yE to top. */
function entablature(Lc, u0, u1, yE, top, e0 = 0, e1 = 0) {
  const k = (top - yE) / 4.9;
  for (let i = 0; i < 3; i++) Lc.box(TR, u0, yE + i * 0.4 * k, 0, u1, yE + (i + 1) * 0.4 * k, 0.6 + i * 0.08);
  Lc.box(TR, u0, yE + 1.2 * k, 0, u1, yE + 2.5 * k, 0.6);
  Lc.box(TR, u0 - 0.2 * e0, yE + 2.5 * k, 0, u1 + 0.2 * e1, yE + 2.85 * k, 0.95);
  for (let u = u0 + 0.4; u < u1 - 0.2; u += 1.1) Lc.box(TR, u - 0.22, yE + 2.85 * k, 0.5, u + 0.22, yE + 3.7 * k, 1.6);
  Lc.box(TR, u0 - 0.4 * e0, yE + 3.7 * k, 0, u1 + 0.4 * e1, top, 1.9);
}

/** One flat face: rect (a degenerate rect for the wall's line), the face f ('n' | 's' | 'e' | 'w'), the floor y, the wall's top above it. */
function dressFace(bag, rect, f, y, top, bw = 8.2) {
  const { M, L } = faceFrame(rect, f, y), Lc = new Local(), yE = top - 4.9, n = Math.max(1, Math.round(L / bw)), b = L / n;
  Lc.noBack = true; Lc.L = L;
  for (let i = 0; i <= n; i++) { const uc = i * b, pw = 2.0; const half = i === 0 || i === n; if (half) { const u0 = i === 0 ? 0 : L - pw / 2 - 0.2; const c = i === 0 ? pw / 2 + 0.2 : L - pw / 2 - 0.2; pilaster(Lc, c, pw, yE, 0); } else pilaster(Lc, uc, pw, yE, 0); }
  for (let i = 0; i < n; i++) bayContent(Lc, (i + 0.5) * b, b - 2.0, yE, i % 2 === 1, 0);
  entablature(Lc, 0, L, yE, top);
  Lc.emit(bag, M);
}

/** The apse of radius r about (ax, az), facing the angle phi0 (rad, from +x toward +z): pilasters and bays round the half circle, the entablature in segments. */
function dressApse(bag, ax, az, r, phi0, y, top, nb = 9) {
  const yE = top - 4.9, Lc = new Local();
  const place = (phi, build) => {
    const Lb = new Local(); Lb.noBack = false; build(Lb);
    const m = new Matrix4().makeRotationY(Math.PI / 2 - phi); m.setPosition(ax + Math.cos(phi) * r, y, az + Math.sin(phi) * r);
    Lb.emit(bag, m);
  };
  for (let i = 0; i <= nb; i++) { const phi = phi0 - Math.PI / 2 + i * Math.PI / nb; place(phi, (Lb) => pilaster(Lb, 0, 2.0, yE, -0.05)); }
  const bwid = Math.PI * r / nb - 2.0;
  for (let i = 0; i < nb; i++) { const phi = phi0 - Math.PI / 2 + (i + 0.5) * Math.PI / nb; place(phi, (Lb) => bayContent(Lb, 0, bwid, yE, i % 2 === 1, -0.05)); }
  // the entablature as chords of a polygon round the half circle (outer radius r + 1.9)
  const ns = nb * 3, k = (top - yE) / 4.9;
  const layers = [[0, 0.4 * k, 0.6], [0.4 * k, 0.8 * k, 0.68], [0.8 * k, 1.2 * k, 0.76], [1.2 * k, 2.5 * k, 0.6], [2.5 * k, 2.85 * k, 0.95], [2.85 * k, 3.7 * k, 0.6], [3.7 * k, 4.9 * k, 1.9]];
  for (let i = 0; i < ns; i++) {
    const p0 = phi0 - Math.PI / 2 + i * Math.PI / ns, p1 = p0 + Math.PI / ns;
    for (const [a0, a1, d] of layers) { const rm = r + d / 2, P = [ax + Math.cos(p0) * rm, az + Math.sin(p0) * rm], Q = [ax + Math.cos(p1) * rm, az + Math.sin(p1) * rm]; bag.add(TR, orientedBox(P, Q, d, y + yE + a0, y + yE + a1, d * 0.05 + 0.15)); }
  }
}

/** dressBlock: { cx, cz, y, H, arm, aw, n0, n1, W } — every wall seen from outside. */
export function dressBlock(bag, { cx, cz, y, H, arm, aw, n0, n1, W }) {
  const a2 = aw / 2, w2 = W / 2, xp = n1 - 8, cb = arm * 0.85, hc = H * 0.8;
  for (const s of [-1, 1]) {
    const f = s > 0 ? 's' : 'n', zf = cz + s * w2, za = cz + s * a2;
    dressFace(bag, [n0 + 1, zf, xp - 2.2, zf], f, y, H, 8.2);                       // the nave's side
    dressFace(bag, [cx - arm + 1, za, cx - a2, za], f, y, H, 8.0);                  // the west arm's sides
    dressFace(bag, [cx + cb, za, n0 - 1, za], f, y, H, 7.2);                        // the east arm's side between the corner chapel and the nave
    for (const dx of [-1, 1]) {
      const xs = cx + dx * cb, zc = cz + s * cb;
      dressFace(bag, s > 0 ? [Math.min(xs, cx + dx * a2), zc, Math.max(xs, cx + dx * a2), zc] : [Math.min(xs, cx + dx * a2), zc, Math.max(xs, cx + dx * a2), zc], f, y, hc, 7.8);   // the corner chapel's end
      const zs = [cz + s * a2, zc].sort((p, q) => p - q);
      dressFace(bag, [xs, zs[0], xs, zs[1]], dx > 0 ? 'e' : 'w', y, hc, 7.8);        // and its side
      const ze = [zc, cz + s * arm].sort((p, q) => p - q);
      dressFace(bag, [cx + dx * a2, ze[0], cx + dx * a2, ze[1]], dx > 0 ? 'e' : 'w', y, H, 8.3);   // the transept's side between the chapel and the apse
    }
    dressApse(bag, cx, cz + s * arm, a2, s > 0 ? Math.PI / 2 : -Math.PI / 2, y, H);
  }
  dressApse(bag, cx - arm, cz, a2, Math.PI, y, H);
}
