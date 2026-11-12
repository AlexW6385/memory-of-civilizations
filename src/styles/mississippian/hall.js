// The chief's great house on Monks Mound, opened (docs/settlements/cahokia.md §4.2): a long hall of
// posts set in wall trenches and daubed with clay, a hipped roof of coursed thatch carried on two rows
// of great posts, its inside lined with woven cane mats on rafters; a door on the south toward the
// plaza; at the north end the dais of the paramount chief with his seat, flanked by carved posts;
// two hearths down the floor; benches and hides along the walls, jars of drink, weapons, maize hung
// from the ties. Plan after the excavated summit building (over 30 m long, a post socket a metre
// across before it) and the Southeastern chiefs' houses described by the early French and Spanish
// observers [stated: see the dossier]; the furnishing [inferred].
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';
import { WALL, TH, rng, tri, thatchHip } from './kit.js';
import { slab } from './dress.js';

/** The inside of a hip roof: woven mats lined on the slopes, facing in, the rafters and ridge beam along them. */
function lining(bag, [x0, z0, x1, z1], y, rise) {
  const m = Math.min(x1 - x0, z1 - z0) / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, long = x1 - x0 >= z1 - z0, yr = y + rise;
  const T = long ? [[x0 + m, yr, cz], [x1 - m, yr, cz]] : [[cx, yr, z0 + m], [cx, yr, z1 - m]];
  const A = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
  // each slope: the two eave corners and the ridge ends nearest them
  const top = long ? [T[0], T[1], T[1], T[0]] : [T[0], T[0], T[1], T[1]];
  const out = [];
  for (let e = 0; e < 4; e++) {
    const f = (e + 1) % 4, mid = [(A[e][0] + A[f][0]) / 2 - cx, 0, (A[e][2] + A[f][2]) / 2 - cz], l = Math.hypot(mid[0], mid[2]) || 1;
    const want = [-mid[0], -l * 0.6, -mid[2]];                    // facing in and down
    tri(out, A[e], A[f], top[f], want); tri(out, A[e], top[f], top[e], want);
  }
  bag.add('reed_mat', fromTriangles(out));
  // the rafters: poles laid along the slopes, a hand under the mats
  const R = (p, q) => bag.add('timber', rod([p[0], p[1] - 0.06, p[2]], [q[0], q[1] - 0.06, q[2]], 0.07, 6));
  const nR = Math.max(4, Math.round((long ? x1 - x0 : z1 - z0) / 2.6));
  for (let k = 0; k <= nR; k++) {
    const f = k / nR;
    if (long) { const x = x0 + m + (x1 - x0 - 2 * m) * f; R([x, y, z0], [x, yr, cz]); R([x, y, z1], [x, yr, cz]); }
    else { const z = z0 + m + (z1 - z0 - 2 * m) * f; R([x0, y, z], [cx, yr, z]); R([x1, y, z], [cx, yr, z]); }
  }
  // hips and the corner rafters
  R(A[0], top[0]); R(A[1], top[1]); R(A[2], top[2]); R(A[3], top[3]);
  if (long) { for (let k = 0; k <= 4; k++) { const f = k / 4, z = z0 + (z1 - z0) * f, tx = x0 + m * (1 - Math.abs(f - 0.5) * 2); R([x0, y, z], [tx, y + (yr - y) * (1 - Math.abs(f - 0.5) * 2), cz]); R([x1, y, z], [x1 - (tx - x0), y + (yr - y) * (1 - Math.abs(f - 0.5) * 2), cz]); } }
  bag.add('timber', rod([T[0][0], yr - 0.2, T[0][2]], [T[1][0], yr - 0.2, T[1][2]], 0.17, 8));
  return { yr };
}

/** A hearth: a clay basin, the ash, logs laid star-wise and the fire, with a light. */
function hearth(bag, col, lights, x, y, z, r = 0.8) {
  bag.add(WALL, lathe([[r, 0], [r, 0.12], [r * 0.82, 0.15], [r * 0.8, 0.05], [0.001, 0.05]], 18, null, x, y, z));
  bag.add('opening', lathe([[r * 0.8, 0], [0.001, 0.004]], 14, null, x, y + 0.055, z));
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3; bag.add('bark_dark', rod([x + Math.cos(a) * r * 0.72, y + 0.1, z + Math.sin(a) * r * 0.72], [x + Math.cos(a) * 0.06, y + 0.17, z + Math.sin(a) * 0.06], 0.045, 6)); }
  bag.add('flame', lathe([[0.2, 0], [0.16, 0.14], [0.08, 0.38], [0.001, 0.58]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), x, y + 0.1, z));
  col.circle(x, z, r, y, y + 0.16);
  if (lights) lights.push({ at: [x, y + 0.8, z], color: '#ff9a4a', intensity: 5, distance: 11 });
}

/**
 * chief_hall: { rect, y, h, rise, post } — the great house opened. The long axis is x; the door in the
 * middle of the south wall, the dais at the north end.
 */
export function chiefHall(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4.5, rise = el.rise ?? 10, t = 0.5, rand = rng(el.seed || 11);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, F = y + 0.04, dw = 2.6, dh = 3.3, L = x1 - x0, D = z1 - z0, long = L >= D;
  // the walls: the south one broken by the door; each a plastered body from the trench to the plate
  const W = [[x0, z0, x1, z0 + t], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t], [x0, z1 - t, cx - dw / 2, z1], [cx + dw / 2, z1 - t, x1, z1]];
  for (const r of W) { bag.add(WALL, box(r[0], y - 0.6, r[1], r[2], y + h, r[3])); col.rect(r, y - 0.6, y + h); }
  bag.add(WALL, box(cx - dw / 2, y + dh, z1 - t, cx + dw / 2, y + h, z1)); col.rect([cx - dw / 2, z1 - t, cx + dw / 2, z1], y + dh, y + h);
  bag.add('timber', box(x0 - 0.12, y + h - 0.34, z0 - 0.12, x1 + 0.12, y + h - 0.05, z1 + 0.12));
  // the door: two posts of cedar painted red, the lintel, the worn clay threshold
  for (const sd of [-1, 1]) {
    const px = cx + sd * (dw / 2 + 0.2);
    bag.add('timber_red', rod([px, y - 0.4, z1 + 0.08], [px, y + dh + 0.35, z1 + 0.08], 0.2, 9));
    bag.add('timber_red', lathe([[0.001, 0], [0.27, 0.08], [0.3, 0.3], [0.2, 0.5], [0.001, 0.62]], 8, null, px, y + dh + 0.35, z1 + 0.08));
  }
  bag.add('timber_red', rod([cx - dw / 2 - 0.5, y + dh + 0.15, z1 + 0.1], [cx + dw / 2 + 0.5, y + dh + 0.15, z1 + 0.1], 0.14, 8));
  bag.add(WALL, box(cx - dw / 2 - 0.3, y - 0.3, z1 - t, cx + dw / 2 + 0.3, F, z1 + 0.7)); col.floor([cx - dw / 2, z1 - t, cx + dw / 2, z1 + 0.7], F);
  // the floor of beaten clay, the mats lining the walls inside
  bag.add('earth_wall', box(x0 + t, y - 0.6, z0 + t, x1 - t, F, z1 - t)); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], F);
  const M = 0.03, top = y + h;
  for (const r of [[x0 + t, z0 + t, x1 - t, z0 + t + M], [x0 + t, z0 + t + M, x0 + t + M, z1 - t - M], [x1 - t - M, z0 + t + M, x1 - t, z1 - t - M], [x0 + t, z1 - t - M, cx - dw / 2, z1 - t], [cx + dw / 2, z1 - t - M, x1 - t, z1 - t]]) bag.add('reed_mat', box(r[0], F, r[1], r[2], top - 0.02, r[3]));
  // a painted band round the walls at the height of a man's reach, ochre and white, over the mats
  for (const r of [[x0 + t + M, z0 + t + M, x1 - t - M, z0 + t + M + 0.01], [x0 + t + M, z0 + t + M, x0 + t + M + 0.01, z1 - t - M], [x1 - t - M - 0.01, z0 + t + M, x1 - t - M, z1 - t - M]]) {
    bag.add('paint_ochre', box(r[0], F + 2.35, r[1], r[2], F + 2.75, r[3]));
    bag.add('paint_white', box(r[0], F + 2.5, r[1], r[2], F + 2.6, r[3]));
  }
  // the roof over it, the lining and the rafters under it
  const ov = Math.min(1.1, 0.06 * (L + D));
  const { a, b } = thatchHip(bag, el.rect, top - 0.1, rise, ov, Math.max(4, Math.round(rise / 1.6)));
  // the soffit: the eaves closed underneath, back to the wall plate (a walker is not under a bare shell)
  { const E = [], e = [x0 - ov, z0 - ov, x1 + ov, z1 + ov], w = [x0 - 0.12, z0 - 0.12, x1 + 0.12, z1 + 0.12], yy = top - 0.22, P = (px, pz) => [px, yy, pz], dn = [0, -1, 0];
    for (const [q0, q1, q2, q3] of [[[e[0], e[1]], [e[2], e[1]], [w[2], w[1]], [w[0], w[1]]], [[e[2], e[1]], [e[2], e[3]], [w[2], w[3]], [w[2], w[1]]], [[e[2], e[3]], [e[0], e[3]], [w[0], w[3]], [w[2], w[3]]], [[e[0], e[3]], [e[0], e[1]], [w[0], w[1]], [w[0], w[3]]]]) {
      tri(E, P(...q0), P(...q1), P(...q2), dn); tri(E, P(...q0), P(...q2), P(...q3), dn);
    }
    bag.add(TH, fromTriangles(E)); }
  for (const p of [a, b]) {
    bag.add('timber_red', rod([p[0], p[1] - 1.2, p[2]], [p[0], p[1] + 2.0, p[2]], 0.16, 8));
    bag.add('timber_red', lathe([[0.001, 0], [0.26, 0.08], [0.3, 0.3], [0.2, 0.5], [0.001, 0.62]], 8, null, p[0], p[1] + 2.0, p[2]));
  }
  lining(bag, el.rect, top, rise - 0.25);
  // the two rows of great posts that carry the roof, tied by beams along and across
  const along = long ? 'x' : 'z', len = long ? L : D, nP = Math.max(2, Math.round((len - 6) / 5.2) + 1), off = (long ? D : L) * 0.2, ph = h + 2.2, tieY = y + ph;
  const posts = [];
  for (const s of [-1, 1]) for (let k = 0; k < nP; k++) {
    const f = nP === 1 ? 0.5 : 0.1 + 0.8 * k / (nP - 1), px = long ? x0 + L * f : cx + s * off, pz = long ? cz + s * off : z0 + D * f;
    posts.push([px, pz, s]);
    bag.add('timber', rod([px, y - 0.6, pz], [px, tieY, pz], 0.28, 10));
    bag.add('timber', lathe([[0.3, 0], [0.34, 0.06], [0.34, 0.22], [0.001, 0.26]], 10, null, px, tieY, pz));
    col.circle(px, pz, 0.28, y, tieY);
  }
  for (const s of [-1, 1]) {
    const ps = posts.filter((p) => p[2] === s);
    for (let k = 0; k + 1 < ps.length; k++) bag.add('timber', rod([ps[k][0], tieY - 0.12, ps[k][1]], [ps[k + 1][0], tieY - 0.12, ps[k + 1][1]], 0.15, 8));
  }
  for (let k = 0; k < nP; k++) { const p = posts[k], q = posts[nP + k]; bag.add('timber', rod([p[0], tieY - 0.3, p[1]], [q[0], tieY - 0.3, q[1]], 0.13, 8)); }
  // maize and gourds hung from the ties in bundles
  for (let k = 1; k < nP; k += 2) for (let u = 0; u < 6; u++) {
    const p = posts[k], q = posts[nP + k], f = (u + 0.5) / 6, hx = p[0] + (q[0] - p[0]) * f, hz = p[1] + (q[1] - p[1]) * f;
    bag.add('linen', rod([hx, tieY - 0.35, hz], [hx, tieY - 0.7, hz], 0.012, 4));
    for (let e = 0; e < 4; e++) { const an = e * 1.57 + u; bag.add(e % 3 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.001, 0], [0.035, 0.04], [0.04, 0.13], [0.025, 0.2], [0.001, 0.22]], 6, null, hx + Math.cos(an) * 0.06, tieY - 0.95, hz + Math.sin(an) * 0.06)); }
  }
  // the hearths down the floor, between the rows of posts
  for (const f of [0.3, 0.7]) hearth(bag, col, lights, long ? x0 + L * f : cx, F, long ? cz : z0 + D * f, 0.85);
  // the dais at the north end (the head of the hall): a platform of clay and the chief's seat on it, carved posts either side
  const dx = long ? [cx - 4.8, z0 + t, cx + 4.8, z0 + t + 4.4] : [x0 + t, cz - 4.8, x0 + t + 4.4, cz + 4.8];
  bag.add('earth_wall', box(dx[0], F - 0.05, dx[1], dx[2], F + 0.55, dx[3])); col.rect(dx, F, F + 0.55);
  bag.add(WALL, box(dx[0] + 0.5, F + 0.55, dx[3] - 0.7, dx[2] - 0.5, F + 0.57, dx[3] - 0.1));
  const sx = (dx[0] + dx[2]) / 2, sz = dx[1] + 1.6;
  bag.add('timber', box(sx - 1.1, F + 0.55, sz - 0.4, sx + 1.1, F + 1.0, sz + 0.4)); col.rect([sx - 1.1, sz - 0.4, sx + 1.1, sz + 0.4], F + 0.55, F + 1.0);
  bag.add('hide_white', box(sx - 1.0, F + 1.0, sz - 0.34, sx + 1.0, F + 1.035, sz + 0.34));
  bag.add('hide_brown', box(sx - 0.4, F + 1.035, sz - 0.3, sx + 0.8, F + 1.06, sz + 0.2));
  bag.add('timber', box(sx - 1.1, F + 1.0, sz - 0.5, sx + 1.1, F + 1.9, sz - 0.4));
  bag.add('timber_red', box(sx - 1.0, F + 1.1, sz - 0.51, sx + 1.0, F + 1.85, sz - 0.5));
  bag.add('paint_white', box(sx - 0.75, F + 1.25, sz - 0.512, sx + 0.75, F + 1.3, sz - 0.51));
  bag.add('paint_ochre', box(sx - 0.75, F + 1.65, sz - 0.512, sx + 0.75, F + 1.7, sz - 0.51));
  for (const sd of [-1, 1]) {
    const px = sx + sd * 3.4, pz = dx[1] + 0.9;
    bag.add('timber_red', rod([px, F + 0.5, pz], [px, F + 3.4, pz], 0.17, 9));
    bag.add('timber_red', lathe([[0.001, 0], [0.24, 0.08], [0.27, 0.3], [0.18, 0.5], [0.001, 0.62]], 8, null, px, F + 3.4, pz));
    bag.add('paint_white', box(px - 0.19, F + 2.2, pz - 0.19, px + 0.19, F + 2.35, pz + 0.19));
    col.circle(px, pz, 0.17, F, F + 3.4);
  }
  // a hanging of tanned hides behind the seat
  for (let k = 0; k < 3; k++) bag.add(k === 1 ? 'hide_white' : 'hide_tan', box(sx - 2.2 + k * 1.5, F + 1.2, dx[1] + 0.05, sx - 1.0 + k * 1.5, F + 3.2, dx[1] + 0.1));
  // benches along both long walls from the dais to the door: a frame of poles, a deck of split cane, hides and robes
  const bz0 = long ? z0 + t + M : 0;
  if (long) for (const s of [-1, 1]) {
    const zA = s < 0 ? z0 + t + M : z1 - t - M - 1.0, zB = zA + 1.0;
    for (const [xa, xb] of [[x0 + t + 1.0, cx - dw / 2 - 1.5], [cx + dw / 2 + 1.5, x1 - t - 1.0]]) {
      if (s > 0) { /* the south wall: only the stretch beyond the door's reach, short */ if (xb - xa < 3) continue; }
      bag.add('timber', box(xa, F, zA, xb, F + 0.07, zB));
      for (let x = xa + 0.15; x <= xb; x += (xb - xa) / Math.max(1, Math.round((xb - xa) / 2.2))) for (const z of [zA + 0.08, zB - 0.08]) bag.add('timber', rod([x, F, z], [x, F + 0.44, z], 0.045, 6));
      bag.add('reed_mat', box(xa, F + 0.44, zA, xb, F + 0.48, zB)); col.rect([xa, zA, xb, zB], F, F + 0.48);
      for (let u = 0; u < Math.floor((xb - xa) / 2.4); u++) bag.add(rand() < 0.5 ? 'hide_tan' : 'hide_brown', box(xa + 0.3 + u * 2.4, F + 0.48, zA + 0.1, xa + 1.5 + u * 2.4, F + 0.5, zB - 0.1));
    }
  }
  // jars of drink and corn by the door, the chief's cups and the pot of black drink beside the first hearth, baskets
  const jar = (x, z, k, mat = 'pottery_dark') => bag.add(mat, lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.13], [0.21, 0.24], [0.16, 0.33], [0.15, 0.37], [0.165, 0.39], [0.14, 0.39], [0.13, 0.35], [0.001, 0.34]].map(([r, hh]) => [r * k, hh * k]), 14, null, x, F, z));
  for (const [jx, k] of [[x0 + t + 0.5, 2.4], [x0 + t + 1.5, 1.9], [x0 + t + 2.3, 1.5], [x1 - t - 0.5, 2.2], [x1 - t - 1.5, 1.8]]) { const jz = z1 - t - 0.5; jar(jx, jz, k); col.circle(jx, jz, 0.2 * k, F, F + 0.8); }
  const hx = long ? x0 + L * 0.3 : cx, hz = long ? cz : z0 + D * 0.3;
  jar(hx + 1.3, hz + 0.7, 1.1); jar(hx + 1.0, hz - 0.8, 0.9);
  for (const [cxp, czp] of [[hx - 1.1, hz + 0.5], [hx - 1.25, hz - 0.1], [hx - 1.05, hz - 0.55]]) bag.add('shell_inlay', lathe([[0.001, 0], [0.05, 0.01], [0.09, 0.07], [0.1, 0.13], [0.085, 0.13], [0.07, 0.08], [0.001, 0.025]], 10, null, cxp, F, czp));
  for (const [bx, bz, r] of [[x1 - t - 0.5, cz + 1.5, 0.3], [x1 - t - 0.6, cz + 2.3, 0.24]]) bag.add('wicker', lathe([[0.001, 0], [r * 0.8, 0.01], [r, r * 0.9], [r * 0.9, r * 0.9], [r * 0.72, 0.05], [0.001, 0.04]], 12, null, bx, F, bz));
  // weapons on the east wall: bows, arrows, a war club
  for (let k = 0; k < 3; k++) { const wz = cz - 1.5 + k * 1.1; bag.add('timber', rod([x1 - t - 0.12, F + 0.3, wz], [x1 - t - 0.2, F + 2.1, wz + 0.05], 0.028, 6)); bag.add('flagstone', box(x1 - t - 0.23, F + 2.1, wz, x1 - t - 0.17, F + 2.25, wz + 0.1)); }
  // the porch before the door: a lean-to roof of thatch on posts, a beam along its front, the door posts' paint carried on a frieze
  if (el.porch) {
    const pd = el.porch, pw = Math.min(L * 0.5, 16), px0 = cx - pw / 2, px1 = cx + pw / 2, zf = z1 + pd, yh = top - 0.9, yl = y + 2.7, n = Math.max(3, Math.round(pw / 2.8));
    for (let k = 0; k <= n; k++) {
      const x = px0 + pw * k / n;
      if (Math.abs(x - cx) < 1.7) continue;
      bag.add('timber', rod([x, y - 0.4, zf], [x, yl, zf], 0.13, 8)); col.circle(x, zf, 0.13, y, yl);
      if (k % 2 === 0) bag.add('timber_red', rod([x, yl - 1.0, zf + 0.14], [x, yl - 0.55, zf + 0.14], 0.14, 8));
    }
    bag.add('timber', rod([px0 - 0.2, yl, zf], [px1 + 0.2, yl, zf], 0.11, 8));
    for (const x of [px0 - 0.2, px1 + 0.2]) bag.add('timber', rod([x, yl, zf], [x, yh, z1 + 0.3], 0.07, 6));
    slab(bag, TH, [px0 - 0.5, yh, z1 + 0.5], [px1 + 0.5, yh, z1 + 0.5], [px1 + 0.5, yl + 0.12, zf + 0.6], [px0 - 0.5, yl + 0.12, zf + 0.6], 0.34);
    bag.add('timber', rod([px0 - 0.4, yh - 0.05, z1 + 0.3], [px1 + 0.4, yh - 0.05, z1 + 0.3], 0.1, 8));
    // the clay floor of the porch, worn
    bag.add(WALL, box(px0 - 0.3, y - 0.3, z1, px1 + 0.3, F, zf + 0.3));
    col.floor([px0 - 0.3, z1, px1 + 0.3, zf + 0.3], F);
  }
  // the great post before the door
  if (el.post) { const [px, pz] = el.post; bag.add('timber_red', lathe([[0.5, 0], [0.46, 9], [0.36, 9.6], [0.001, 9.8]], 12, null, px, y - 0.8, pz)); col.circle(px, pz, 0.5, y, y + 9); }
  void frustum; void TH; void along;
}
