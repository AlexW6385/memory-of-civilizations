// The harbour's small craft and the Point's chair (docs/settlements/sydney.md §12): the cruising yachts of Port Jackson at their
// moorings and under sail, motor launches, a harbour tug, and Mrs Macquarie's Chair cut in the sandstone of the Point.
import { box, fromTriangles, rod } from '../../core/geom.js';

const both = (T, a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);

/**
 * boat: { kind ('yacht' | 'launch' | 'tug'), at, y (the water), rot (0: bow toward −z), len, sail (yacht: 'up' | 'furled' | 'down'), seed }
 * — a lofted hull with its deck and cabin; the yacht a mast, boom, mainsail and jib; the launch a flybridge; the tug a funnel.
 */
export function smallCraft(el, { bag, col }) {
  const kind = el.kind ?? 'yacht', [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const L = el.len ?? { yacht: 11, launch: 9, tug: 24 }[kind], B = { yacht: 0.31, launch: 0.34, tug: 0.3 }[kind] * L, fb = { yacht: 0.09, launch: 0.12, tug: 0.1 }[kind] * L, depth = 0.1 * L;
  const W = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  const half = (t) => { const base = kind === 'yacht' ? Math.sin(Math.PI * Math.pow(t, 1.35)) ** 0.62 : Math.sin(Math.PI * Math.pow(t, 0.8)) ** 0.5; return B / 2 * Math.max(base, 0.34 * t ** 4) * (kind === 'yacht' ? 1 : 1); };
  const n = 14, m = 4, sheer = (t) => fb + 0.35 * fb * (2 * t - 1) ** 2 - 0.1 * fb;
  const HP = (i, j, sg) => { const t = i / n, a = j / m * Math.PI / 2, hw = half(t); return W(sg * hw * Math.cos(a), sheer(t) - (sheer(t) + depth) * Math.sin(a) * (kind === 'tug' ? 0.9 : 1), -L / 2 + L * t); };
  const H = [], D = [];
  for (const sg of [-1, 1]) for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { both(H, HP(i, j, sg), HP(i + 1, j, sg), HP(i + 1, j + 1, sg)); both(H, HP(i, j, sg), HP(i + 1, j + 1, sg), HP(i, j + 1, sg)); }
  for (let i = 0; i < n; i++) { both(D, HP(i, 0, 1), HP(i + 1, 0, 1), HP(i + 1, 0, -1)); both(D, HP(i, 0, 1), HP(i + 1, 0, -1), HP(i, 0, -1)); }
  bag.add(kind === 'tug' ? 'car_black' : kind === 'yacht' ? (el.seed % 3 === 0 ? 'car_blue' : 'paint_white') : 'paint_white', fromTriangles(H));
  bag.add(kind === 'tug' ? 'planks_grey' : 'timber', fromTriangles(D));
  const bx = (m2, x0, y0, z0, x1, y1, z1) => { const a = W(x0, y0, z0), b = W(x1, y1, z1); bag.add(m2, box(Math.min(a[0], b[0]), y + y0, Math.min(a[2], b[2]), Math.max(a[0], b[0]), y + y1, Math.max(a[2], b[2]))); };
  const yd = sheer(0.5);
  if (kind === 'yacht') {
    bx('paint_white', -B * 0.3, yd, -L * 0.12, B * 0.3, yd + 0.55, L * 0.2); bx('glass_outer', -B * 0.31, yd + 0.25, -L * 0.1, B * 0.31, yd + 0.45, L * 0.18);   // the coachroof and its ports
    bx('timber', -B * 0.35, yd, L * 0.22, B * 0.35, yd + 0.04, L * 0.46);
    const mastZ = -L * 0.12, mh = L * 1.05;
    bag.add('aluminium_dull', rod(W(0, yd + 0.5, mastZ), W(0, yd + mh, mastZ), 0.06, 5));
    bag.add('aluminium_dull', rod(W(0, yd + 0.55, mastZ + 0.05), W(0, yd + 0.7, L * 0.42), 0.04, 4));             // the boom
    bag.add('steel_grey', rod(W(0, yd + mh, mastZ), W(0, yd + 0.05, -L * 0.5 + 0.3), 0.012, 3)); bag.add('steel_grey', rod(W(0, yd + mh, mastZ), W(0, yd + 0.4, L * 0.5 - 0.2), 0.012, 3));
    const sail = el.sail ?? 'furled';
    if (sail === 'up') {
      const S = [], top = W(0, yd + mh - 0.3, mastZ + 0.1), tack = W(0, yd + 0.75, mastZ + 0.1), clew = W(0.12, yd + 0.8, L * 0.4), bulge = W(B * 0.22, yd + mh * 0.5, mastZ + L * 0.2);
      both(S, top, tack, bulge); both(S, top, bulge, clew); both(S, tack, clew, bulge);
      const hd = W(0, yd + mh * 0.92, mastZ - 0.1), jt = W(0, yd + 0.35, -L * 0.5 + 0.5), jc = W(0.1, yd + 0.5, mastZ - L * 0.28), jb = W(B * 0.25, yd + mh * 0.38, mastZ - L * 0.2);
      both(S, hd, jt, jb); both(S, hd, jb, jc); both(S, jt, jc, jb);
      bag.add('cloth_white', fromTriangles(S));
    } else if (sail === 'furled') bx('cloth_white', -0.07, yd + 0.7, mastZ + 0.1, 0.07, yd + 0.84, L * 0.4);
    bx('aluminium_dull', -B * 0.38, yd + 0.04, L * 0.5 - 0.05, B * 0.38, yd + 0.5, L * 0.5);               // the pushpit's rail
    col.circle(x, z, B * 0.5, y - 1, y + 1);
  } else if (kind === 'launch') {
    bx('paint_white', -B * 0.36, yd, -L * 0.2, B * 0.36, yd + 1.1, L * 0.22); bx('glass_outer', -B * 0.37, yd + 0.55, -L * 0.18, B * 0.37, yd + 1.0, L * 0.2); bx('car_cream', -B * 0.4, yd + 1.1, -L * 0.22, B * 0.4, yd + 1.16, L * 0.24);
    bx('paint_white', -B * 0.2, yd + 1.16, -L * 0.12, B * 0.2, yd + 1.8, L * 0.06); bx('glass_outer', -B * 0.21, yd + 1.4, -L * 0.11, B * 0.21, yd + 1.75, L * 0.05);
    bag.add('aluminium_dull', rod(W(0, yd + 1.8, 0), W(0, yd + 3.0, 0), 0.025, 4));
    col.circle(x, z, B * 0.5, y - 1, y + 1);
  } else {
    bx('paint_white', -B * 0.3, yd, -L * 0.04, B * 0.3, yd + 1.7, L * 0.2); bx('glass_outer', -B * 0.31, yd + 1.0, -L * 0.02, B * 0.31, yd + 1.5, L * 0.18); bx('car_black', -B * 0.33, yd + 1.7, -L * 0.06, B * 0.33, yd + 1.78, L * 0.22);
    bx('paint_white', -B * 0.2, yd + 1.78, L * 0.0, B * 0.2, yd + 2.5, L * 0.14); bx('glass_outer', -B * 0.21, yd + 2.0, L * 0.01, B * 0.21, yd + 2.4, L * 0.13);
    bag.add('car_red', rod(W(0, yd + 1.78, L * 0.28), W(0, yd + 4.0, L * 0.28), 0.5, 10)); bx('car_black', -0.52, yd + 4.0, L * 0.28 - 0.52, 0.52, yd + 4.25, L * 0.28 + 0.52);
    bag.add('aluminium_dull', rod(W(0, yd + 1.78, -L * 0.2), W(0, yd + 4.2, -L * 0.2), 0.05, 5));
    for (const t of [0.12, 0.3, 0.5, 0.7]) for (const sg of [-1, 1]) bag.add('rubber', rod(W(sg * (half(t) + 0.02), yd - 0.5, -L / 2 + L * t), W(sg * (half(t) + 0.02), yd - 0.1, -L / 2 + L * t), 0.2, 6));   // the tyre fenders
    col.circle(x, z, B * 0.55, y - 1, y + 2);
  }
}

/** macquarie_chair: { at, y, rot (the seat faces −z at rot 0) } — the bench cut in the Point's rock, 1810, with the inscription slab over it. */
export function macquarieChair(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const bx = (m, x0, y0, z0, x1, y1, z1) => { const a = P(x0, z0), b = P(x1, z1); bag.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1]))); };
  bx('sandstone', -1.5, -0.3, -0.2, 1.5, 0.45, 1.0);                      // the rock, squared where it is cut
  bx('sandstone', -1.5, 0.45, 0.55, 1.5, 1.3, 1.0);                       // the back
  bx('sandstone', -1.5, 0.45, -0.2, -1.1, 0.95, 0.55); bx('sandstone', 1.1, 0.45, -0.2, 1.5, 0.95, 0.55);   // the arms
  bx('sandstone_dressed', -1.0, 0.45, 0.0, 1.0, 0.5, 0.55);               // the seat
  bx('sandstone_dressed', -1.0, 1.3, 0.62, 1.0, 2.1, 0.92); bx('lead', -0.85, 1.5, 0.58, 0.85, 1.9, 0.62);   // the inscription stone over it
  const a = P(-1.5, -0.2), b = P(1.5, 1.0); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y - 0.3, y + 2.1);
}
