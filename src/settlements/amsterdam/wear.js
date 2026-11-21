// Wear on the Town Hall's front and the Dam before it (docs/settlements/amsterdam.md §11.4): the paving trodden dark where the feet go to the seven arches,
// and the rising damp and splash of the Dam's wet on the plinth between them. Geometry in materials the landmark plan already holds (bluestone), a hash of
// each bay's own place varying it; no collision (the patches lie 1.5 cm over the paving). Registered into the dutch style from here (nightlight.js's way).
import { STYLES } from '../../core/build.js';
import '../../styles/dutch/index.js';
import { faceFrame, prism } from '../../styles/dutch/facade.js';
import { fromTriangles } from '../../core/geom.js';
import { GROUND, HALL } from './layout.js';
import { hash } from './nightlight.js';

/** The Town Hall's east bays as townHall lays them: { n, bw, c0 } (c0: the first of the seven central bays). */
export function hallBays() {
  const F = faceFrame(HALL, 'e'), L = F.w;
  let n = Math.round(L / 3.6); if ((n - 7) % 2) n += n * 3.6 > L ? -1 : 1;
  return { F, n, bw: L / n, c0: (n - 7) / 2 };
}

/** A trodden patch on the paving: a ragged ellipse of 10 points at (cx, cz), semi-axes a (along x) and b, its rim moved by a hash; flat, 1 cm thick. */
function patch(out, cx, cz, a, b, y, seed) {
  const N = 10, pt = [];
  for (let k = 0; k < N; k++) { const t = k / N * Math.PI * 2, r = 0.82 + 0.3 * hash(seed, k, 5); pt.push([cx + Math.cos(t) * a * r, cz + Math.sin(t) * b * r]); }
  for (let k = 0; k < N; k++) {
    const p = pt[k], q = pt[(k + 1) % N];
    out.push(cx, y + 0.01, cz, q[0], y + 0.01, q[1], p[0], y + 0.01, p[1]);                       // top (up)
    out.push(cx, y, cz, p[0], y, p[1], q[0], y, q[1]);                                            // underside
    out.push(p[0], y, p[1], q[0], y, q[1], q[0], y + 0.01, q[1], p[0], y, p[1], q[0], y + 0.01, q[1], p[0], y + 0.01, p[1]);
  }
}

function amWear(el, { bag }) {
  const { F, n, bw, c0 } = hallBays(), top = GROUND + 0.05 + 0.015, tris = [], splash = [];
  for (let i = 0; i < n; i++) {
    const um = (i + 0.5) * bw, entry = i >= c0 && i < c0 + 7;
    if (entry) {
      // before each arch the feet have worn the setts dark: a long patch, broadest at the arch, and a second smaller one beyond it
      const [x, z] = F.at(um, 0);
      patch(tris, x + 1.7, z, 1.9, 0.95, top, i * 7 + 1);
      patch(tris, x + 4.6, z + (hash(i, 2, 9) - 0.5) * 0.8, 1.0, 0.55, top + 0.002, i * 7 + 2);
    } else {
      // the splash and rising damp on the plinth's foot between the arches: ragged dark tongues of different height
      for (let k = 0; k < 3; k++) {
        const u0 = (i + 0.08 + k * 0.3) * bw, u1 = u0 + bw * (0.18 + 0.12 * hash(i, k, 3)), h = 0.2 + 0.35 * hash(i, k, 4), p = i < 3 || i >= n - 3 ? 0.7 : (i >= c0 - 0 && i < c0 + 7 ? 1.4 : 0);
        void p;
        splash.push(prism(F, GROUND, [[u0, 0.02], [u1, 0.02], [u1 - 0.05, h * 0.7], [(u0 + u1) / 2, h], [u0 + 0.05, h * 0.6]], 0.6, 0.612));
      }
    }
  }
  if (tris.length) bag.add('bluestone', fromTriangles(tris));
  for (const g of splash) bag.add('bluestone', g);
}
Object.assign(STYLES.dutch.elements, { am_wear: amWear });
