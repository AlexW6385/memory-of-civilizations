// The body of an ordinary tower house with real recesses (docs/settlements/shibam.md §14): the four battered faces tessellated around the windows,
// each window a hole with four reveals (the dark back and the shutters stand in it, placed by the window parts of parts.js), the brown earth plaster
// below the lime line and the lime above it. One geometry per material; every triangle is oriented by the way its face looks.
import { fromTriangles } from '../../core/geom.js';

function tri(out, a, b, c, h) {
  const ux = c[0] - b[0], uy = c[1] - b[1], uz = c[2] - b[2], vx = a[0] - b[0], vy = a[1] - b[1], vz = a[2] - b[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * h[0] + ny * h[1] + nz * h[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
export const quadH = (out, a, b, c, d, h) => { tri(out, a, b, c, h); tri(out, a, c, d, h); };
export const triH = tri;

/** The depth of a window's recess, metres. */
export const RECESS = 0.2;

/**
 * { rect, k: [w, e, n, s] (the batter of each face, metres per metre of height; 0 where the house touches its neighbour), y0, y1, yA (the lime line),
 * wins: { n, s, w, e: [{ u, sy, w, h }] } (the holes: the coordinate along the face, the sill, the size), hollow (keep the bottom: a ceiling) }.
 * Returns { mud, lime } geometries (either may be null).
 */
export function houseBody({ rect, k, y0, y1, yA, wins, hollow }) {
  const [x0, z0, x1, z1] = rect, [kw, ke, kn, ks] = k;
  const base = [y0, y1];
  if (yA > y0 && yA < y1) base.push(yA);
  const mud = [], lime = [], opn = [], earth = [];
  // a face: lo(y), hi(y) the corner coordinates, P(u, y) the point, N the outward normal, B(u, y, sy) the point on the recess's back plane
  const faces = {
    n: { lo: (y) => x0 + kw * y, hi: (y) => x1 - ke * y, P: (u, y) => [u, y, z0 + kn * y], N: [0, 0, -1], B: (u, y, sy) => [u, y, z0 + kn * sy + RECESS], T: [1, 0, 0], k: kn },
    s: { lo: (y) => x0 + kw * y, hi: (y) => x1 - ke * y, P: (u, y) => [u, y, z1 - ks * y], N: [0, 0, 1], B: (u, y, sy) => [u, y, z1 - ks * sy - RECESS], T: [1, 0, 0], k: ks },
    w: { lo: (y) => z0 + kn * y, hi: (y) => z1 - ks * y, P: (u, y) => [x0 + kw * y, y, u], N: [-1, 0, 0], B: (u, y, sy) => [x0 + kw * sy + RECESS, y, u], T: [0, 0, 1], k: kw },
    e: { lo: (y) => z0 + kn * y, hi: (y) => z1 - ks * y, P: (u, y) => [x1 - ke * y, y, u], N: [1, 0, 0], B: (u, y, sy) => [x1 - ke * sy - RECESS, y, u], T: [0, 0, 1], k: ke },
  };
  for (const f of 'nsew') {
    const F = faces[f], H = (wins[f] ?? []).slice().sort((a, b) => a.u - b.u);
    const lv = new Set(base);
    for (const o of H) { lv.add(o.sy); lv.add(o.sy + o.h); }
    const Y = [...lv].sort((a, b) => a - b);
    for (let i = 0; i + 1 < Y.length; i++) {
      const ya = Y[i], yb = Y[i + 1], ym = (ya + yb) / 2, out = ym >= yA ? lime : mud;
      const cut = H.filter((o) => o.sy <= ym && o.sy + o.h >= ym);
      let ul = 'L';
      const seg = (l, r) => {
        const L = (y) => (l === 'L' ? F.lo(y) : l), R = (y) => (r === 'R' ? F.hi(y) : r);
        if ((r === 'R' || typeof r === 'number') && R(ya) - L(ya) < 1e-4 && R(yb) - L(yb) < 1e-4) return;
        quadH(out, F.P(L(ya), ya), F.P(R(ya), ya), F.P(R(yb), yb), F.P(L(yb), yb), F.N);
      };
      for (const o of cut) {
        const a = o.u - o.w / 2, b = o.u + o.w / 2;
        seg(ul, a); ul = b;
        // the reveals: the jamb on each side, the sill and the soffit, from the face back to the plane of the recess
        const sy = o.sy, tp = o.sy + o.h;
        // the recess's sides: the soffit and the left jamb dark, the right jamb of earth (kept under 80 000 triangles apiece, each its own material)
        if (yb === tp) quadH(opn, F.P(a, tp), F.P(b, tp), F.B(b, tp, sy), F.B(a, tp, sy), [0, -1, 0]);
        quadH(opn, F.P(a, ya), F.P(a, yb), F.B(a, yb, sy), F.B(a, ya, sy), F.T);
        quadH(earth, F.P(b, ya), F.P(b, yb), F.B(b, yb, sy), F.B(b, ya, sy), [-F.T[0], 0, -F.T[2]]);
      }
      seg(ul, 'R');
    }
  }
  // the roof and, for a hollowed ground storey, the ceiling
  const at = (y) => [[x0 + kw * y, z0 + kn * y], [x1 - ke * y, z0 + kn * y], [x1 - ke * y, z1 - ks * y], [x0 + kw * y, z1 - ks * y]];
  const cap = (y, out, h) => { const q = at(y).map(([x, z]) => [x, y, z]); quadH(out, q[0], q[1], q[2], q[3], h); };
  cap(y1, y1 > yA ? lime : mud, [0, 1, 0]);
  if (hollow) cap(y0, y0 >= yA ? lime : mud, [0, -1, 0]);
  const g = (t) => (t.length ? fromTriangles(t) : null);
  return { mud: g(mud), lime: g(lime), opening: g(opn), earth_wall: g(earth) };
}
