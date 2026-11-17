// The prayer hall's outside (docs/settlements/ottoman-istanbul.md §4.11): the outer walls' windows with their
// frames — a lower row of rectangular windows in marble frames behind iron grilles, each under a pointed relieving
// lunette with an inscription panel; an upper row of windows with pointed heads in a stone ring — the pilasters
// between the bays, the string course and the corbelled cornice at the top; the weight towers with their blind
// pointed niches, cornice and lead caps; and the portal of the great door (jambs, tympanum, a hood of stepped
// bands with muqarnas teeth, the inscription, the leaves of the door standing open against the reveals).
// Pure plates and boxes; every plate stands off its wall (no coplanar faces).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { dblT, pointedArc } from './index.js';

/** A frame for one face of a rectangle: u along the face from its first corner, o out from it. */
function faceMap(f, [hx0, hz0, hx1, hz1]) {
  if (f === 'n') return { L: hx1 - hx0, P: (u, y, o) => [hx0 + u, y, hz0 - o], R: (u0, u1, o0, o1) => [hx0 + u0, hz0 - o1, hx0 + u1, hz0 - o0] };
  if (f === 's') return { L: hx1 - hx0, P: (u, y, o) => [hx0 + u, y, hz1 + o], R: (u0, u1, o0, o1) => [hx0 + u0, hz1 + o0, hx0 + u1, hz1 + o1] };
  if (f === 'w') return { L: hz1 - hz0, P: (u, y, o) => [hx0 - o, y, hz0 + u], R: (u0, u1, o0, o1) => [hx0 - o1, hz0 + u0, hx0 - o0, hz0 + u1] };
  return { L: hz1 - hz0, P: (u, y, o) => [hx1 + o, y, hz0 + u], R: (u0, u1, o0, o1) => [hx1 + o0, hz0 + u0, hx1 + o1, hz0 + u1] };
}
const tri = (out, P, o, ...pts) => { for (const [u, y] of pts) out.push(...P(u, y, o)); };
/** The flat plate of a pointed arch over [s0, s1] springing at ys, as a fan from the middle of its base. */
function headPlate(out, P, o, s0, s1, ys) {
  const a = pointedArc(s0, s1, ys), c = [(s0 + s1) / 2, ys];
  for (let k = 0; k + 1 < a.length; k++) tri(out, P, o, c, a[k], a[k + 1]);
}
/** The band between two pointed arches (the inner over [s0, s1], the outer wider by b each side and b higher at the spring). */
function headBand(out, P, o, s0, s1, ys, b) {
  const i = pointedArc(s0, s1, ys), e = pointedArc(s0 - b, s1 + b, ys);
  for (let k = 0; k + 1 < i.length; k++) tri(out, P, o, i[k], i[k + 1], e[k + 1], i[k], e[k + 1], e[k]);
}

/** The windows, pilasters, string course and cornice of the hall's walls: hall = [x0, z0, x1, z1] (outer faces). */
export function hallExterior(bag, col, { hall, y, T, wallH, cx, dw }) {
  const out = { opening: [], daylight: [], band: [], lunette: [], panel: [] };
  for (const f of 'newS') {
    const { L, P, R } = faceMap(f, hall), B = (mat, u0, u1, y0, y1, o0, o1) => { const r = R(u0, u1, o0, o1); bag.add(mat, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
    const n = Math.floor(L / 4), pitch = L / n;
    // the windows (the south wall's are the qibla wall's own, in prayerhall.js)
    if (f !== 'S') for (let i = 1; i < n; i++) {
      const u = i * pitch; if (f === 'n' && Math.abs(hall[0] + u - cx) < dw + 1) continue;
      for (const [yy, lower] of [[3, true], [12.2, false]]) {
        B('opening', u - 0.8, u + 0.8, yy, yy + 2.6, -0.02, 0.06); B('daylight', u - 0.8, u + 0.8, yy, yy + 2.6, -T - 0.02, -T + 0.02);
        B('marble_smooth', u - 1.0, u + 1.0, yy - 0.2, yy - 0.03, 0.0, 0.2);                                  // the sill
        for (const s of [-1, 1]) B('marble_smooth', s < 0 ? u - 1.0 : u + 0.8, s < 0 ? u - 0.8 : u + 1.0, yy - 0.03, yy + 2.6, 0.0, 0.12);   // the jambs
        const ys = y + yy + 2.6, Pp = (a, b, o) => P(u + a, b, o);
        if (lower) {
          B('marble_smooth', u - 1.0, u + 1.0, yy + 2.6, yy + 2.8, 0.0, 0.14);                                // the lintel
          for (let k = -3; k <= 3; k++) B('iron', u + k * 0.24 - 0.012, u + k * 0.24 + 0.012, yy, yy + 2.6, 0.06, 0.1);   // the grille
          for (const q of [0.9, 1.7]) B('iron', u - 0.8, u + 0.8, yy + q, yy + q + 0.03, 0.06, 0.1);
          // the relieving lunette over it with its inscription panel
          headPlate(out.lunette, Pp, 0.1, -0.95, 0.95, ys + 0.2); headPlate(out.panel, Pp, 0.13, -0.62, 0.62, ys + 0.3);
        } else {
          // the pointed head of the window and the ring of stone round it
          headPlate(out.opening, Pp, 0.065, -0.8, 0.8, ys); headPlate(out.daylight, (a, b, o) => P(u + a, b, o), -T - 0.025, -0.8, 0.8, ys);
          headBand(out.band, Pp, 0.12, -0.8, 0.8, ys, 0.2);
        }
      }
    }
    // the pilasters between the bays (not on the court side, where the gallery stands), their plinths and capitals
    if (f !== 'n') for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * pitch;
      B('limestone_carved', u - 0.45, u + 0.45, -0.5, wallH - 0.9, 0.0, 0.3); B('limestone', u - 0.55, u + 0.55, -0.5, 0.7, 0.0, 0.4); B('limestone', u - 0.55, u + 0.55, wallH - 1.5, wallH - 0.9, 0.0, 0.4);
      const r = R(u - 0.55, u + 0.55, 0, 0.4); col.rect(r, y, y + 1.0);
    }
    // the string course between the two rows, and under the top the cornice on corbels
    const a = f === 'n' || f === 'S' ? -0.5 : 0, b = f === 'n' || f === 'S' ? L + 0.5 : L;
    if (f !== 'n') B('limestone_carved', a, b, 9.0, 9.3, 0.0, 0.14);
    B('limestone_carved', a, b, wallH - 0.28, wallH, 0.0, 0.55);
    for (let u = 0.3; u < L - 0.1; u += 0.9) B('limestone_carved', u, u + 0.4, wallH - 0.9, wallH - 0.28, 0.0, 0.4);
  }
  bag.add('opening', fromTriangles(out.opening)); bag.add('daylight', fromTriangles(out.daylight));
  bag.add('marble_smooth', dblT(out.band)); bag.add('limestone_carved', dblT(out.lunette)); bag.add('marble_dark', dblT(out.panel));
}

/** One of the four weight towers (docs/settlements/ottoman-istanbul.md §4.11): blind pointed niches on its faces, a stone cornice, a lead cap and a gilt finial. y0 is the wall's top, y1 the tower's top. */
export function weightTower(bag, tx, tz, y0, y1) {
  const r = [tx - 2, tz - 2, tx + 2, tz + 2], blank = [], rim = [], s = y0 + 3, rise = Math.min(4.2, (y1 - y0) * 0.35);
  for (const f of 'nswe') {
    const { P } = faceMap(f, r), Q = (u, yy, o) => P(u + 2, yy, o);
    headPlate(blank, Q, 0.05, -0.8, 0.8, s + rise); headBand(rim, Q, 0.09, -0.8, 0.8, s + rise, 0.2);
  }
  bag.add('opening', dblT(blank)); bag.add('marble_smooth', dblT(rim));
  bag.add('limestone_carved', box(tx - 2.35, y1, tz - 2.35, tx + 2.35, y1 + 0.45, tz + 2.35));
  bag.add('lead', lathe([[2.2, 0], [1.6, 1.3], [0.9, 2.6], [0.001, 3.4]], 8, null, tx, y1 + 0.45, tz));
  bag.add('gilt_bronze', lathe([[0.1, 0], [0.06, 0.5], [0.001, 0.7]], 6, null, tx, y1 + 3.85, tz));
}

/** The great door's portal on the hall's north wall (the court's side), centred on cx: reveals, tympanum, hood, inscription, open leaves. */
export function portal(bag, { cx, hz0, T, y, dw, dh }) {
  const g = dw, ja = 2.15, js = 3.8, wTop = y + dh;
  // reveals of white marble through the wall's depth (a clear opening 4.3 m wide) up to the springing of the arch
  for (const s of [-1, 1]) {
    const a = s < 0 ? cx - g : cx + ja, b = s < 0 ? cx - ja : cx + g;
    bag.add('marble_smooth', box(a, y, hz0, b, y + js, hz0 + T - 0.1));
  }
  // the tympanum: a flat plate in the wall's middle from the arch to the lintel
  const mid = hz0 + T / 2, pts = pointedArc(-ja, ja, y + js), t = [];
  for (let k = 0; k + 1 < pts.length; k++) { const [a0, b0] = pts[k], [a1, b1] = pts[k + 1]; t.push(cx + a0, b0, mid, cx + a1, b1, mid, cx + a1, wTop, mid, cx + a0, b0, mid, cx + a1, wTop, mid, cx + a0, wTop, mid); }
  for (const s of [-1, 1]) { const a = s < 0 ? cx - g : cx + ja, b = s < 0 ? cx - ja : cx + g; t.push(a, y + js, mid, b, y + js, mid, b, wTop, mid, a, y + js, mid, b, wTop, mid, a, wTop, mid); }
  bag.add('limestone_carved', dblT(t));
  // the hood on the porch side: three stepped bands round the arch standing out 0.1, 0.22 and 0.34, then the teeth of the muqarnas
  const P = (u, yy, o) => [cx + u, yy, hz0 - o], bands = [];
  for (let k = 0; k < 3; k++) headBand(bands, P, 0.04 + k * 0.1, -ja - k * 0.16, ja + k * 0.16, y + js + k * 0.0, 0.16);
  bag.add('marble_smooth', dblT(bands));
  const teeth = pointedArc(-ja, ja, y + js);
  for (let k = 1; k + 1 < teeth.length; k++) { const [a, b] = teeth[k]; bag.add('gilt_bronze', box(cx + a - 0.07, b - 0.3, hz0 - 0.05 - 0.2, cx + a + 0.07, b - 0.04, hz0 - 0.05)); }
  // the inscription: a marble panel over the door with a band of script in dark bars
  bag.add('marble_smooth', box(cx - 1.9, y + dh + 0.5, hz0 - 0.12, cx + 1.9, y + dh + 1.5, hz0 - 0.0));
  for (let u = -1.7; u < 1.7; u += 0.14) bag.add('marble_dark', box(cx + u, y + dh + 0.72, hz0 - 0.15, cx + u + 0.06, y + dh + 1.28 - ((Math.round(u * 7) % 3) * 0.08), hz0 - 0.12));
  // the leaves, open against the reveals: panelled walnut with bronze studs and a ring
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? cx - ja : cx + ja - 0.14, x1 = x0 + 0.14;
    bag.add('wood_dark', box(x0, y, hz0 + 0.3, x1, y + js - 0.1, hz0 + T - 0.3));
    const xo = s < 0 ? x1 : x0 - 0.03, xe = s < 0 ? x1 + 0.03 : x0;
    for (let q = 0; q < 2; q++) for (let r = 0; r < 3; r++) bag.add('bronze', box(xo, y + 0.5 + r * 1.1, hz0 + 0.55 + q * 0.95, xe, y + 1.2 + r * 1.1, hz0 + 1.3 + q * 0.95));
  }
  // the step before the threshold
  bag.add('marble_smooth', box(cx - g - 0.2, y, hz0 - 0.7, cx + g + 0.2, y + 0.12, hz0));
}
