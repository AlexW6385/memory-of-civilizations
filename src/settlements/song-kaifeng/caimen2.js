// The wine shops' colour gates (caifeng huanmen), carried further than the song style's scaffold (docs/settlements/song-kaifeng.md §17):
// the style's gate, then what gives it depth and mass — silk awnings sloping out from the upper rails with scalloped hems, the lattice wings
// closing the gate's two ends above head height, a hood of silk over the pointed lintel, and a second, taller crest over the middle bay.
import { STYLES } from '../../core/build.js';
import { lathe, rod, fromTriangles } from '../../core/geom.js';

const ball = (r, x, y, z, n = 8) => lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n, null, x, y - r, z);

export function caimenRich(el, ctx) {
  STYLES.song.elements.caimen(el, ctx);
  const { bag } = ctx;
  const [ax, az] = el.a, [bx, bz] = el.b, [nx, nz] = el.out, y = el.y ?? 0, H = el.h ?? 7.2;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  const P = (u, n, yy) => [ax + ux * u + nx * n, y + yy, az + uz * u + nz * n];
  const back = 0.25, front = 1.15, us1 = L * 0.3, us2 = L * 0.7;
  const silk = { red: [], green: [], ochre: [], white: [] }, lat = [];
  const quad = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  const tri = (out, a, b, c) => out.push(...a, ...b, ...c, ...a, ...c, ...b);
  const cols = ['red', 'green', 'ochre', 'green'];
  // awnings: a slope from the rail out and down, in strips of 0.45 m alternating in colour, a scalloped hem
  for (const [lv, out, drop] of [[6.3, 0.85, 0.42], [4.9, 0.7, 0.34]]) {
    const m = Math.max(4, Math.round(L / 0.45));
    for (let k = 0; k < m; k++) {
      const u0 = L * k / m, u1 = L * (k + 1) / m, c = cols[(k + (lv > 6 ? 0 : 1)) % 4];
      quad(silk[c], P(u0, front + 0.14, lv + 0.02), P(u1, front + 0.14, lv + 0.02), P(u1, front + 0.14 + out, lv - drop), P(u0, front + 0.14 + out, lv - drop));
      tri(silk[c], P(u0, front + 0.14 + out, lv - drop), P(u1, front + 0.14 + out, lv - drop), P((u0 + u1) / 2, front + 0.14 + out + 0.03, lv - drop - 0.2));
    }
  }
  // the wings: a lattice of split bamboo between the back and front posts at each end, from the lowest rail to the highest
  for (const u of [-0.04, L + 0.04]) {
    const g = (n0, n1, y0, y1) => quad(lat, P(u, n0, y0), P(u, n1, y0), P(u, n1, y1), P(u, n0, y1));
    const bars = [];
    for (let n = back + 0.1; n < front - 0.05; n += 0.18) bars.push(rod(P(u, n, 3.4), P(u, n, 6.3), 0.012, 4));
    for (let yy = 3.5; yy < 6.3; yy += 0.3) bars.push(rod(P(u, back, yy), P(u, front, yy), 0.012, 4));
    for (const b of bars) bag.add('bamboo_culm', b);
    void g;
    quad(silk[u < 0 ? 'red' : 'green'], P(u, back, 5.7), P(u, front, 5.7), P(u, front, 6.3), P(u, back, 6.3));
  }
  // the hood over the pointed lintel: two slopes of silk from the lintel out and down, a fringe of points
  for (const [u0, c] of [[us1, 'ochre'], [us2, 'red']]) {
    const um = L / 2, hi = (u) => 2.7 + 0.65 * (1 - Math.abs(u - um) / (um - us1));
    const a = P(u0, front, hi(u0)), b = P(um, front, hi(um)), c1 = P(um, front + 0.6, hi(um) - 0.28), d = P(u0, front + 0.6, hi(u0) - 0.28);
    quad(silk[c], a, b, c1, d);
    for (let k = 0; k < 5; k++) { const f0 = k / 5, f1 = (k + 1) / 5, u = (f) => u0 + (um - u0) * f; tri(silk.white, P(u(f0), front + 0.6, hi(u(f0)) - 0.28), P(u(f1), front + 0.6, hi(u(f1)) - 0.28), P(u((f0 + f1) / 2), front + 0.6, hi(u((f0 + f1) / 2)) - 0.5)); }
  }
  // the second crest over the middle bay: two tall poles, a pointed frame between them, three bound balls and streamers
  { const u0 = us1 + 0.25, u1 = us2 - 0.25, um = L / 2, base = H + 1.0, ty = H + 2.5;
    for (const u of [u0, u1]) bag.add('timber', rod(P(u, front, H), P(u, front, base + 0.9), 0.035, 4));
    for (const g of [rod(P(u0, front, base + 0.9), P(um, front, ty), 0.03, 4), rod(P(um, front, ty), P(u1, front, base + 0.9), 0.03, 4), rod(P(um, front, base), P(um, front, ty + 0.6), 0.03, 4)]) bag.add('bamboo_culm', g);
    [[u0, base + 0.9, 'cloth_red'], [um, ty + 0.55, 'cloth_green'], [u1, base + 0.9, 'cloth_red'], [um, base + 1.5, 'cloth_ochre']].forEach(([u, yy, m]) => { const p = P(u, front, yy); bag.add(m, ball(0.15, p[0], p[1], p[2], 8)); });
    for (const [u, c] of [[u0, 'red'], [u1, 'green']]) { const p = P(u, front, base + 0.85); tri(silk[c], p, [p[0], p[1] - 0.9, p[2]], [p[0] + ux * (u < um ? -0.3 : 0.3), p[1] - 0.7, p[2] + uz * (u < um ? -0.3 : 0.3)]); }
  }
  for (const [c, t] of Object.entries(silk)) if (t.length) bag.add(`cloth_${c}`, fromTriangles(t));
  if (lat.length) bag.add('lattice', fromTriangles(lat));
}
