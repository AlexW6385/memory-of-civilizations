// The ancestral halls of the kings and their gate (docs/settlements/shang-yinxu.md §4): a long hall of odd bays on a rammed-earth
// platform, timber posts on stone bases, plastered wattle walls, a porch along the front, a hipped thatched roof with deep eaves;
// inside, the altar with its bronzes, the stone chime, the drum and the bells, the diviners' mats and fire. The gate on its two
// bastions of beaten earth.
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { platform, steps, thatch, vessel, KINDS } from './geo.js';

/**
 * shang_hall: { plat [x0, z0, x1, z1], h (platform height), rot (0: the hall's length along x, front on +z; 1: along z, front on +x),
 *   flip (front on the negative side), bays, bw (bay width), deep (bays deep), porch, over (eave overhang), rise, rich }.
 */
export function shangHall(el, { bag, col, lights }) {
  const [px0, pz0, px1, pz1] = el.plat, cx = (px0 + px1) / 2, cz = (pz0 + pz1) / 2, h = el.h ?? 1.2;
  const rot = !!el.rot, sv = el.flip ? -1 : 1;
  const bays = el.bays ?? 9, bw = el.bw ?? 4, D = (el.deep ?? 3) * bw, Pd = el.porch ?? 3.6, O = el.over ?? 2.6, BL = bays * bw;
  const tot = O + D + Pd + O, vb = -tot / 2 + O;        // v of the back wall's outer face; the front wall at vb + D
  const WH = 3.4, RISE = el.rise ?? 4.4, tw = 0.6;
  const M = (u, v) => (rot ? [cx + sv * v, cz + u] : [cx + u, cz + sv * v]);
  const R = (u0, v0, u1, v1) => { const a = M(u0, v0), b = M(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, y0, v0, u1, y1, v1, solid = true) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  const L = (mat, prof, u, y, v, seg = 12) => { const p = M(u, v); bag.add(mat, lathe(prof, seg, null, p[0], y, p[1])); };
  const y = h;
  platform(bag, col, el.plat, h, 0.35);
  // the stair on the front face, in the middle bay, the platform's front edge at v = tot/2 (+ margin of the platform)
  const pvFront = rot ? (sv > 0 ? px1 - cx : cx - px0) : (sv > 0 ? pz1 - cz : cz - pz0);
  { const r = R(-3.2, pvFront - 0.01, 3.2, pvFront + 0.01), run = h / 0.17 * 0.3;
    const a = M(-3.2, pvFront), b = M(3.2, pvFront + run);
    const rr = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    const dir = rot ? (sv > 0 ? 'w' : 'e') : (sv > 0 ? 'n' : 's');
    steps(bag, col, rr, 0, h, dir); void r; }
  // the floor of beaten, plastered earth
  { const r = R(-BL / 2 - 0.3, vb - 0.3, BL / 2 + 0.3, vb + D + Pd); bag.add('mud_plaster', box(r[0], y, r[1], r[2], y + 0.04, r[3])); }
  // walls: the back and the ends solid, the front wall pierced by doors in bays 2, 4, 6 (odd count: the middle bay is a door)
  const dbays = bays === 9 ? [2, 4, 6] : bays === 5 ? [2] : [Math.floor(bays / 2)];
  B('mud_plaster', -BL / 2, y, vb, BL / 2, y + WH, vb + tw);
  B('mud_plaster', -BL / 2, y, vb, -BL / 2 + tw, y + WH, vb + D); B('mud_plaster', BL / 2 - tw, y, vb, BL / 2, y + WH, vb + D);
  const vf = vb + D - tw;
  let u = -BL / 2;
  for (const k of dbays) {
    const dc = -BL / 2 + (k + 0.5) * bw, dw = 3.0;
    B('mud_plaster', u, y, vf, dc - dw / 2, y + WH, vf + tw); u = dc + dw / 2;
    B('mud_plaster', dc - dw / 2, y + 2.5, vf, dc + dw / 2, y + WH, vf + tw);
    B('timber', dc - dw / 2 - 0.12, y, vf - 0.05, dc - dw / 2 + 0.02, y + 2.5, vf + tw + 0.05, false); B('timber', dc + dw / 2 - 0.02, y, vf - 0.05, dc + dw / 2 + 0.12, y + 2.5, vf + tw + 0.05, false);
  }
  B('mud_plaster', u, y, vf, BL / 2, y + WH, vf + tw);
  // a red band at the foot of the walls outside, a white plaster above (the dado of cinnabar), window slits high in the front wall
  B('paint_ochre', -BL / 2 - 0.02, y, vb - 0.03, BL / 2 + 0.02, y + 0.7, vb, false);
  for (let k = 0; k < bays; k++) if (!dbays.includes(k)) { const c = -BL / 2 + (k + 0.5) * bw; B('opening', c - 0.5, y + 2.2, vf + tw - 0.02, c + 0.5, y + 2.9, vf + tw + 0.03, false); }
  // the front beam and the porch: posts on stone bases along the porch line, the eaves resting on them
  const vp = vb + D + Pd - 0.5;
  const post = (uu, vv, ph, r = 0.27) => {
    L('granite_grey', [[r + 0.12, 0], [r + 0.12, 0.14], [r + 0.02, 0.17]], uu, y, vv, 9);
    L('timber', [[r, 0], [r * 0.92, ph - 0.17]], uu, y + 0.17, vv, 9);
    const p = M(uu, vv); col.circle(p[0], p[1], r + 0.04, y, y + ph);
  };
  for (let k = 0; k <= bays; k++) post(-BL / 2 + k * bw, vp, WH);
  B('timber', -BL / 2 - 0.3, y + WH, vp - 0.22, BL / 2 + 0.3, y + WH + 0.4, vp + 0.22, false);
  B('timber', -BL / 2 - 0.3, y + WH, vb - 0.1, BL / 2 + 0.3, y + WH + 0.35, vb + 0.35, false);
  // inner posts: two rows down the hall
  if (el.rich) for (let k = 1; k < bays; k++) for (const vv of [vb + D * 0.33, vb + D * 0.7]) post(-BL / 2 + k * bw, vv, WH + 0.4, 0.25);
  // the roof: a hip of thatch, ends and sides, deep eaves on the porch side; the ridge carried by the posts
  { const r = R(-BL / 2, vb, BL / 2, vb + D + Pd - 0.5); thatch(bag, r, y + WH + 0.35, RISE, O, true, 'thatch'); }
  // the ends of the rafters: a row of small posts under the porch eave (bundles of reed)
  // ── inside ──
  const vi0 = vb + tw, vi1 = vf;
  const mat = (u0, v0, u1, v1, m = 'reed_mat') => B(m, u0, y + 0.04, v0, u1, y + 0.07, v1, false);
  if (el.rich) {
    // the altar along the back wall: a low lacquered table, the bronzes upon it in order
    B('lacquer_black', -10, y + 0.04, vi0 + 0.3, 10, y + 0.5, vi0 + 2.0);
    B('lacquer_red', -10, y + 0.5, vi0 + 0.3, 10, y + 0.54, vi0 + 2.0, false);
    const pos = [-8.4, -6.2, -4.2, -2.2, 0, 2.2, 4.2, 6.2, 8.4];
    pos.forEach((uu, i) => { const p = M(uu, vi0 + 1.15); vessel(i === 4 ? 'ding' : KINDS[(i * 3 + 1) % 5], bag, p[0], y + 0.54, p[1], i === 4 ? 1.5 : i % 2 ? 1.0 : 1.2); });
    // the king's mat and the diviners' mats, a bronze brazier with flame, a plastron with its tongs
    mat(-3, vi0 + 3.6, 3, vi0 + 7.0); B('lacquer_black', -0.8, y + 0.07, vi0 + 4.6, 0.8, y + 0.4, vi0 + 5.6);
    for (const s of [-1, 1]) { mat(s * 6 - 1.6, vi0 + 3.0, s * 6 + 1.6, vi0 + 6.0); const p = M(s * 6, vi0 + 4.7); bag.add('bronze', lathe([[0.001, 0.3], [0.3, 0.34], [0.34, 0.5], [0.001, 0.5]], 10, null, p[0], y + 0.07, p[1])); bag.add('flame', lathe([[0.001, 0], [0.1, 0.05], [0.001, 0.3]], 6, null, p[0], y + 0.5, p[1])); col.circle(p[0], p[1], 0.34, y, y + 0.55);
      lights.push({ at: [p[0], y + 0.9, p[1]], color: '#ffb468', intensity: 2.2, distance: 12 }); }
    // the stone chime: a frame with three tiger-engraved slabs; the great drum on its stand; the bronze bells
    { const sx = -14.5; for (const dv of [-1.6, 1.6]) B('lacquer_black', sx - 0.12, y, vi0 + 3.6 + dv - 0.12, sx + 0.12, y + 2.2, vi0 + 3.6 + dv + 0.12);
      B('lacquer_black', sx - 0.1, y + 2.1, vi0 + 1.9, sx + 0.1, y + 2.3, vi0 + 5.3, false);
      [[0.0, 1.0], [0.6, 0.75], [1.2, 0.55]].forEach(([dv, len]) => B('granite_grey', sx - 0.05, y + 2.1 - len, vi0 + 2.5 + dv - 0.28, sx + 0.05, y + 2.1, vi0 + 2.5 + dv + 0.28 + 0.4 * (len - 0.55) * 0, false)); }
    { const dx = 14.5, p = M(dx, vi0 + 3.8);
      bag.add('timber_red', lathe([[0.001, 0.5], [0.45, 0.6], [0.55, 1.0], [0.45, 1.4], [0.001, 1.45]], 14, null, p[0], y + 0.04, p[1])); col.circle(p[0], p[1], 0.55, y, y + 1.5);
      bag.add('hide_tan', lathe([[0.001, 0], [0.5, 0]], 14, null, p[0], y + 1.45, p[1])); }
    { const bx = -11, p = M(bx, vi0 + 2.2);
      for (let i = 0; i < 3; i++) { bag.add('bronze', lathe([[0.001, 0.4], [0.11 + i * 0.03, 0.43], [0.14 + i * 0.03, 0.1], [0.19 + i * 0.03, 0.0]], 8, null, p[0] + (rot ? 0 : i * 0.5), y + 0.07, p[1] + (rot ? i * 0.5 : 0))); } }
  } else {
    mat(-BL / 4, vi0 + 2, BL / 4, vi0 + 5.5);
    B('lacquer_black', -3, y + 0.04, vi0 + 0.3, 3, y + 0.45, vi0 + 1.6);
    [-2, 0, 2].forEach((uu, i) => { const p = M(uu, vi0 + 0.95); vessel(KINDS[i * 2 % 5], bag, p[0], y + 0.45, p[1], 1.0); });
    const p = M(0, vi0 + 3.5); bag.add('bronze', lathe([[0.001, 0.25], [0.28, 0.28], [0.3, 0.4], [0.001, 0.4]], 10, null, p[0], y + 0.07, p[1]));
    lights.push({ at: [p[0], y + 0.9, p[1]], color: '#ffb468', intensity: 1.6, distance: 10 });
  }

  // ── the weathering and dressing of the hall (docs §4a) ──
  // inside: the dado of cinnabar to 1.1 m, a frieze of squares in red and black high on the plaster, tie-beams across the roof, the ridge-beam
  B('kokowai', -BL / 2 + tw, y + 0.04, vi0, BL / 2 - tw, y + 1.1, vi0 + 0.03, false);
  B('kokowai', -BL / 2 + tw, y + 0.04, vf - 0.03, BL / 2 - tw, y + 1.1, vf, false);
  for (let k = 0; k < bays * 2; k++) { const c = -BL / 2 + tw + 0.8 + k * ((BL - 2 * tw - 1.6) / (bays * 2 - 1)); B(k % 2 ? 'lacquer_black' : 'kokowai', c - 0.45, y + 2.3, vi0, c + 0.45, y + 2.9, vi0 + 0.035, false); B('ivory', c - 0.25, y + 2.5, vi0 + 0.035, c + 0.25, y + 2.7, vi0 + 0.045, false); }
  for (let k = 0; k <= bays; k++) B('timber', -BL / 2 + k * bw - 0.13, y + WH + 0.05, vi0, -BL / 2 + k * bw + 0.13, y + WH + 0.38, vf, false);
  { const hv = vb + (D + Pd - 0.5) / 2, half = Math.max(2, (BL - D - Pd + 0.5) / 2 - 1); B('timber', -half, y + WH + 0.35 + RISE - 0.5, hv - 0.14, half, y + WH + 0.35 + RISE - 0.22, hv + 0.14, false); }
  // outside: the plinth of rammed earth at the foot of the wall, rain streaks under the eaves, the ridge-bundle, the crossed horns of the gable
  for (let k = 0; k < bays * 2; k++) { const c = -BL / 2 + 1 + k * (BL - 2) / (bays * 2 - 1); B('plaster_streak', c, y + WH - 1.1, vb - 0.035, c + 0.2, y + WH, vb, false); }
  { const hv = vb + (D + Pd - 0.5) / 2, top = y + WH + 0.35 + RISE, hlen = Math.abs((BL + 2 * O) / 2 - (D + Pd - 0.5 + 2 * O) / 2);
    B('roof_ridge', -hlen - 0.3, top - 0.1, hv - 0.2, hlen + 0.3, top + 0.2, hv + 0.2, false);
    for (const s of [-1, 1]) { const p = M(s * (hlen + 0.3), hv); for (const t of [-1, 1]) { const q = M(s * (hlen + 0.3) + s * 0.9, hv + t * 0.55); bag.add('timber', rod([p[0], top + 0.1, p[1]], [q[0], top + 1.1, q[1]], 0.05, 5)); } } }
  // the porch: lamps (bronze tripods with a flame) between the posts, banners hung from the front beam, offerings on low stands before the doors
  if (el.rich) {
    for (const k of [1, 3, 5, 7]) { const p = M(-BL / 2 + (k + 0.5) * bw, vp + 0.8); bag.add('bronze', lathe([[0.001, 0], [0.15, 0.02], [0.04, 0.5], [0.04, 0.9], [0.14, 1.0], [0.001, 1.02]], 8, null, p[0], y + 0.17, p[1])); bag.add('flame', lathe([[0.001, 0], [0.07, 0.04], [0.001, 0.26]], 6, null, p[0], y + 1.17, p[1])); }
    for (const k of [0, 2, 4, 6, 8]) B('cloth_red', -BL / 2 + (k + 0.5) * bw - 0.35, y + WH - 1.5, vp + 0.24, -BL / 2 + (k + 0.5) * bw + 0.35, y + WH + 0.02, vp + 0.28, false);
    for (const k of [2, 6]) { const p = M(-BL / 2 + (k + 0.5) * bw, vp + 2.2); bag.add('granite_grey', lathe([[0.4, 0], [0.36, 0.45], [0.001, 0.46]], 10, null, p[0], y + 0.17, p[1])); vessel('ding', bag, p[0], y + 0.6, p[1], 1.0); col.circle(p[0], p[1], 0.42, y, y + 0.7); }
    // inside: two rows of mats for the officials, tablets of the ancestors on the altar, wine jars on stands, a second row of tables bearing food vessels
    for (const s of [-1, 1]) for (let r = 0; r < 3; r++) mat(s * (8 + r * 3.4) - 1.2, vi0 + 8.0, s * (8 + r * 3.4) + 1.2, vi0 + 9.4);
    for (let k = 0; k < 7; k++) { const uu = -9 + k * 3; B('timber_red', uu - 0.12, y + 0.54, vi0 + 1.7, uu + 0.12, y + 1.15, vi0 + 1.78, false); }
    for (const s of [-1, 1]) { B('lacquer_black', s * 3.0 - 1.0, y + 0.04, vi0 + 8.4, s * 3.0 + 1.0, y + 0.42, vi0 + 9.2); for (let k = 0; k < 3; k++) { const p = M(s * 3.0 - 0.6 + k * 0.6, vi0 + 8.8); vessel(KINDS[(k + (s > 0 ? 2 : 0)) % 5], bag, p[0], y + 0.42, p[1], 0.9); } }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const p = M(s * (BL / 2 - 1.6), vi0 + 2.0 + k * 1.1); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.3], [0.22, 0.55], [0.12, 0.62], [0.001, 0.62]], 9, null, p[0], y + 0.04, p[1])); col.circle(p[0], p[1], 0.3, y, y + 0.6); }
    for (let k = 1; k < bays; k += 2) for (const vv of [vb + D * 0.33, vb + D * 0.7]) B('cloth_red', -BL / 2 + k * bw - 0.3, y + 1.4, vv - 0.31, -BL / 2 + k * bw + 0.3, y + 3.3, vv - 0.28, false);
  } else {
    for (const s of [-1, 1]) { const p = M(s * 6, vi0 + 3.5); bag.add('bronze', lathe([[0.001, 0.3], [0.3, 0.34], [0.34, 0.5], [0.001, 0.5]], 10, null, p[0], y + 0.04, p[1])); bag.add('flame', lathe([[0.001, 0], [0.1, 0.05], [0.001, 0.3]], 6, null, p[0], y + 0.54, p[1])); col.circle(p[0], p[1], 0.34, y, y + 0.55); }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const p = M(s * (BL / 2 - 1.4), vi0 + 1.8 + k * 1.0); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.3], [0.22, 0.55], [0.001, 0.62]], 9, null, p[0], y + 0.04, p[1])); col.circle(p[0], p[1], 0.3, y, y + 0.6); }
    for (let k = 0; k <= bays; k++) B('timber', -BL / 2 + k * bw - 0.12, y + WH + 0.05, vi0, -BL / 2 + k * bw + 0.12, y + WH + 0.35, vf, false);
    B('kokowai', -BL / 2 + tw, y + 0.04, vi0, BL / 2 - tw, y + 1.0, vi0 + 0.03, false);
    for (let k = 0; k < 4; k++) B('cloth_ochre', -BL / 2 + 2 + k * 3.4, y + 1.6, vi0 + 0.03, -BL / 2 + 3.2 + k * 3.4, y + 2.8, vi0 + 0.06, false);
    mat(-BL / 4 - 1, vi0 + 6.2, BL / 4 + 1, vi0 + 7.6);
  }
  void frustum; void rod;
}

/** shang_gate: { plat [x0, z0, x1, z1], axis, h } — two bastions of beaten earth with a timber pavilion on each, a lintel over the passage, low rammed walls running out. */
export function shangGate(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.plat, a = el.axis, pw = 2.4, H = 3.2;
  for (const r of [[x0, z0, a - pw, z1], [a + pw, z0, x1, z1]]) {
    bag.add('earth_wall', frustum(r, 0, H, 0.5, 0.5, 0.5, 0.5, { noBottom: true })); col.rect(r, 0, H);
    col.floor([r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], H);
    const cxp = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    for (const dx of [-3.2, 3.2]) for (const dz of [-2.4, 2.4]) { bag.add('timber', lathe([[0.2, 0], [0.18, 2.4]], 8, null, cxp + dx, H, cz + dz)); col.circle(cxp + dx, cz + dz, 0.22, H, H + 2.4); }
    bag.add('timber', box(cxp - 3.5, H + 2.4, cz - 2.7, cxp + 3.5, H + 2.7, cz + 2.7));
    thatch(bag, [cxp - 3.2, cz - 2.4, cxp + 3.2, cz + 2.4], H + 2.7, 2.2, 0.9, true);
  }
  bag.add('timber', box(a - pw - 0.3, 2.6, z0 + 1.2, a + pw + 0.3, 3.1, z0 + 2.0));
  for (const s of [-1, 1]) bag.add('timber', box(a + s * pw - 0.15, 0, z0 + 1.2, a + s * pw + 0.15, 2.6, z0 + 2.0));
  // the low rammed walls of the zone, running out to either side
  for (const r of [[x0 - 22, z0 + 3, x0, z0 + 4.6], [x1, z0 + 3, x1 + 22, z0 + 4.6]]) { bag.add('earth_wall', frustum(r, 0, 2.2, 0.2, 0.2, 0.2, 0.2, { noBottom: true })); col.rect(r, 0, 2.2); bag.add('thatch', box(r[0], 2.2, r[1] - 0.15, r[2], 2.45, r[3] + 0.15)); }
}
