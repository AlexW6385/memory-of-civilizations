// The Swahili builder's kit (docs/settlements/kilwa.md §4, §11, §12): coral-rag walls in lime,
// plastered, cut by doorways framed in dressed porites coral and by recesses (niches, zidaka);
// barrel vaults and domes of coral concrete; flat ceilings of mangrove poles under a lime-concrete
// roof; carved coral in low relief (eight-pointed stars, dart friezes, herringbone cable, bosses).

import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { orientBy } from '../sahel/index.js';

export const C = 'coral_plaster', RAG = 'rubble', DRESSED = 'limestone', CARVED = 'limestone_carved', SMOOTH = 'lime_plaster', POLE = 'wood_dark';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A solid block, and the same as an obstacle. */
export function solid(ctx, mat, x0, y0, z0, x1, y1, z1, collide = true) {
  ctx.bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
  if (collide) ctx.col.rect([x0, z0, x1, z1], y0, y1);
}
/** A walkable slab (its top a floor). */
export function slab(ctx, mat, r, y0, y1) { ctx.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); ctx.col.floor(r, y1); }

/** The rectangle [u0, v0, u1, v1] less the holes ([a0, b0, a1, b1], may overlap): a list of rectangles. */
export function cut(u0, v0, u1, v1, holes) {
  const H = holes.map((h) => [Math.max(u0, h[0]), Math.max(v0, h[1]), Math.min(u1, h[2]), Math.min(v1, h[3])]).filter((h) => h[2] > h[0] + 1e-4 && h[3] > h[1] + 1e-4);
  const vs = [...new Set([v0, v1, ...H.flatMap((h) => [h[1], h[3]])])].sort((a, b) => a - b), out = [];
  for (let i = 0; i < vs.length - 1; i++) {
    const a = vs[i], b = vs[i + 1];
    if (b - a < 1e-4) continue;
    const m = (a + b) / 2, iv = H.filter((h) => h[1] < m && h[3] > m).map((h) => [h[0], h[2]]).sort((p, q) => p[0] - q[0]);
    let u = u0;
    for (const [p, q] of iv) { if (p > u + 1e-4) out.push([u, a, p, b]); u = Math.max(u, q); }
    if (u1 > u + 1e-4) out.push([u, a, u1, b]);
  }
  // merge pieces stacked one on another with the same span
  out.sort((p, q) => p[0] - q[0] || p[2] - q[2] || p[1] - q[1]);
  const M = [];
  for (const p of out) { const l = M[M.length - 1]; if (l && Math.abs(l[0] - p[0]) < 1e-4 && Math.abs(l[2] - p[2]) < 1e-4 && Math.abs(l[3] - p[1]) < 1e-4) l[3] = p[3]; else M.push([...p]); }
  return M;
}
/** A niche's outline as holes: the opening and its pointed head in two narrowing steps. */
export function nicheHoles(u, v, w, h) {
  return [[u - w / 2, v, u + w / 2, v + h], [u - w * 0.32, v + h - 0.01, u + w * 0.32, v + h + w * 0.22], [u - w * 0.14, v + h + w * 0.2, u + w * 0.14, v + h + w * 0.36]];
}

/**
 * A wall along x (axis 'x', its middle at z = c) or along z (axis 'z', its middle at x = c), from u0
 * to u1 and y0 to y1, t thick. holes: [{ u0, u1, v0, v1, frame }] through it (doors, windows,
 * portholes; frame 'door' or 'grand' adds jambs and lintel of dressed coral on both faces);
 * rec: [{ u0, u1, v0, v1, d, side (+1 or −1: the face it is cut into), holes (its outline, optional) }]
 * recesses (niches). Plastered coral (mat) by default; it is an obstacle where it stands.
 */
export function wall(ctx, w) {
  const { axis, c, t, y0, y1, mat = C, holes = [], rec = [], collide = true } = w;
  const u0 = Math.min(w.u0, w.u1), u1 = Math.max(w.u0, w.u1);
  const B = (m, a0, b0, a1, b1, d0, d1) => {
    if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || Math.abs(d1 - d0) < 1e-4) return;
    const p = Math.min(c + d0, c + d1), q = Math.max(c + d0, c + d1);
    ctx.bag.add(m, axis === 'x' ? box(a0, b0, p, a1, b1, q) : box(p, b0, a0, q, b1, a1));
  };
  const H = holes.map((h) => [h.u0, h.v0, h.u1, h.v1]);
  const dm = Math.max(0, ...rec.filter((r) => r.side < 0).map((r) => r.d)), dp = Math.max(0, ...rec.filter((r) => r.side > 0).map((r) => r.d));
  const lay = (side) => H.concat(...rec.filter((r) => r.side === side).map((r) => r.holes || [[r.u0, r.v0, r.u1, r.v1]]));
  for (const p of cut(u0, y0, u1, y1, H)) {
    B(mat, p[0], p[1], p[2], p[3], -t / 2 + dm, t / 2 - dp);
    if (collide) ctx.col.rect(axis === 'x' ? [p[0], c - t / 2, p[2], c + t / 2] : [c - t / 2, p[0], c + t / 2, p[2]], p[1], p[3]);
  }
  if (dm) for (const p of cut(u0, y0, u1, y1, lay(-1))) B(mat, p[0], p[1], p[2], p[3], -t / 2, -t / 2 + dm);
  if (dp) for (const p of cut(u0, y0, u1, y1, lay(1))) B(mat, p[0], p[1], p[2], p[3], t / 2 - dp, t / 2);
  // the frames of the doorways: jambs and lintel of dressed coral, proud of both faces; the grand
  // ones stepped twice, as the stepped jambs of porites at Songo Mnara and Kilwa
  for (const h of holes) {
    if (!h.frame) continue;
    const f = h.frame === 'grand' ? [[0.2, 0.035], [0.36, 0.015]] : [[0.16, 0.03]];
    for (const s of [-1, 1]) for (const [fw, fd] of f) {
      const d0 = s * t / 2, d1 = s * (t / 2 + fd);
      B(DRESSED, h.u0 - fw, h.v0, h.u0, h.v1 + fw, d0, d1);
      B(DRESSED, h.u1, h.v0, h.u1 + fw, h.v1 + fw, d0, d1);
      B(DRESSED, h.u0, h.v1, h.u1, h.v1 + fw, d0, d1);
    }
  }
}

/**
 * A barrel vault over the rectangle r, running along `along` ('x' or 'z'), springing at ys from the
 * long walls' faces: the half-cylinder seen from inside (the walls rise past it to the roof; its
 * ends are the end walls' faces, the tympana).
 */
export function vault(out, r, ys, along, N = 12) {
  const [x0, z0, x1, z1] = r, T = [];
  const span = along === 'z' ? x1 - x0 : z1 - z0, R = span / 2, m = along === 'z' ? (x0 + x1) / 2 : (z0 + z1) / 2, [a0, a1] = along === 'z' ? [z0, z1] : [x0, x1];
  const P = (k, a) => { const f = Math.PI * k / N, s = m + Math.cos(f) * R, y = ys + Math.sin(f) * R; return along === 'z' ? [s, y, a] : [a, y, s]; };
  for (let k = 0; k < N; k++) T.push(...P(k, a0), ...P(k + 1, a0), ...P(k + 1, a1), ...P(k, a0), ...P(k + 1, a1), ...P(k, a1));
  orientBy(T, (p) => (along === 'z' ? [m - p[0], ys - p[1], 0] : [0, ys - p[1], m - p[2]]));
  out.push(...T);
}

/** Push the quad (or triangle when d is omitted) a b c d turned to face along w. */
export function face(out, w, a, b, c, d) { const t = d ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...b, ...c]; out.push(...orientBy(t, () => w)); }
/** The points where rays from the centre at the given angles meet the rectangle (half sizes hx, hz). */
function rectRay(th, hx, hz) { const c = Math.cos(th), s = Math.sin(th), t = Math.min(hx / Math.max(1e-9, Math.abs(c)), hz / Math.max(1e-9, Math.abs(s))); return [c * t, s * t]; }
function bayAngles(hx, hz, N = 24) {
  const a = Array.from({ length: N }, (_, k) => (k / N) * Math.PI * 2);
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) a.push((Math.atan2(sz * hz, sx * hx) + Math.PI * 2) % (Math.PI * 2));
  return a.sort((p, q) => p - q);
}
/**
 * A domed bay over the rectangle r: inside, pendentives from the rectangle (at yT) to the dome's
 * ring (yT + pd), a drum of height `drum`, the dome (rise × its radius high: 0.82 a little
 * flattened, 1.7 the steep, nearly conical dome of the South Court's corner); outside, the flat
 * roof (yTop) round the dome, the drum and the outer dome.
 */
export function domeBay(out, r, yT, pd, yTop, drum = 0, rise = 0.82) {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, hx = (r[2] - r[0]) / 2, hz = (r[3] - r[1]) / 2, ri = Math.min(hx, hz) - 0.05, ro = ri + 0.22, A = bayAngles(hx, hz), M = 7;
  const Cp = (rr, th, yy) => [cx + Math.cos(th) * rr, yy, cz + Math.sin(th) * rr];
  const yR = yT + pd, yD = yR + drum, yO = yTop + drum;
  for (let j = 0; j < A.length; j++) {
    const a0 = A[j], a1 = j === A.length - 1 ? A[0] + Math.PI * 2 : A[j + 1], am = (a0 + a1) / 2, rad = [Math.cos(am), 0, Math.sin(am)];
    const [p0x, p0z] = rectRay(a0, hx, hz), [p1x, p1z] = rectRay(a1, hx, hz);
    face(out, [-rad[0], -0.6, -rad[2]], [cx + p0x, yT, cz + p0z], [cx + p1x, yT, cz + p1z], Cp(ri, a1, yR), Cp(ri, a0, yR));     // pendentive
    face(out, [0, 1, 0], [cx + p0x, yTop, cz + p0z], [cx + p1x, yTop, cz + p1z], Cp(ro, a1, yTop), Cp(ro, a0, yTop));             // the roof round it
    if (drum) { face(out, rad.map((v) => -v), Cp(ri, a0, yR), Cp(ri, a1, yR), Cp(ri, a1, yD), Cp(ri, a0, yD)); face(out, rad, Cp(ro, a0, yTop), Cp(ro, a1, yTop), Cp(ro, a1, yO), Cp(ro, a0, yO)); }
    for (let m = 0; m < M; m++) {
      const f0 = (m / M) * Math.PI / 2, f1 = ((m + 1) / M) * Math.PI / 2, fm = (f0 + f1) / 2, n = [Math.cos(fm) * rad[0], Math.sin(fm) / rise, Math.cos(fm) * rad[2]];
      for (const [rr, yb, sg] of [[ri, yD, -1], [ro, yO, 1]]) {
        const P = (f, th) => Cp(rr * Math.cos(f) + 0.001, th, yb + rr * rise * Math.sin(f));
        if (m === M - 1) face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a0));
        else face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a1), P(f1, a0));
      }
    }
  }
}

const POLES = new Map();
function poleGeo(L, r, k) {
  const key = `${L.toFixed(2)}/${r}/${k}`;
  if (!POLES.has(key)) {
    // a mangrove pole: a little crooked and tapering, along +x from 0 to L
    const bend = [0, 0.012, -0.01][k % 3], g = lathe([[r, 0], [r * 0.97, L * 0.33], [r * 0.92, L * 0.66], [r * 0.88, L]], 6, (th, i) => 1 + (i === 1 || i === 2 ? bend * 4 * Math.cos(th) : 0));
    g.rotateZ(-Math.PI / 2);
    POLES.set(key, g);
  }
  return POLES.get(key);
}
/**
 * A flat ceiling of mangrove poles (the boriti) laid across the rectangle r (the poles run along
 * `along` and their ends rest in the walls, `bear` into each), their tops at yc, `step` apart; over
 * them the lime-concrete roof's soffit (a slab from yc to yc + th).
 */
export function poleCeiling(ctx, r, yc, along, { step = 0.32, rad = 0.065, bear = 0.25, th = 0.28, soffit = SMOOTH, top = null } = {}) {
  const [x0, z0, x1, z1] = r, L = (along === 'x' ? x1 - x0 : z1 - z0) + 2 * bear, n = Math.max(1, Math.floor((along === 'x' ? z1 - z0 : x1 - x0) / step));
  for (let i = 0; i < n; i++) {
    const s = (along === 'x' ? z0 : x0) + ((i + 0.5) / n) * (along === 'x' ? z1 - z0 : x1 - x0), g = poleGeo(Math.round(L * 10) / 10, rad, i).clone();
    const m = new Matrix4();
    if (along === 'x') m.makeTranslation(x0 - bear, yc - rad, s);
    else m.makeRotationY(-Math.PI / 2).setPosition(s, yc - rad, z0 - bear);
    ctx.bag.addInstance(POLE, g, m);
  }
  ctx.bag.add(soffit, box(x0, yc - 0.01, z0, x1, yc + th, z1));
  if (top) ctx.bag.add(top, box(x0, yc + th, z0, x1, yc + th + 0.02, z1));
}

/** A frame in a wall face: o its origin, u along, v up, n out of the face. */
export const frameOf = (o, u, v, n) => ({ o, u, v, n });
const at = (F, a, b, d) => [F.o[0] + F.u[0] * a + F.v[0] * b + F.n[0] * d, F.o[1] + F.u[1] * a + F.v[1] * b + F.n[1] * d, F.o[2] + F.u[2] * a + F.v[2] * b + F.n[2] * d];
/** A relief: the polygon (points [a, b] in the frame, star-shaped about its first point's centre `cen`) raised from d0 to d1. */
export function prism(out, F, pts, d0, d1, cen = null) {
  const c = cen || [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length], T = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    face(T, F.n, at(F, c[0], c[1], d1), at(F, p[0], p[1], d1), at(F, q[0], q[1], d1));
    const mid = [(p[0] + q[0]) / 2 - c[0], (p[1] + q[1]) / 2 - c[1]], w = at({ o: [0, 0, 0], u: F.u, v: F.v, n: F.n }, mid[0], mid[1], 0);
    face(T, w, at(F, p[0], p[1], d0), at(F, q[0], q[1], d0), at(F, q[0], q[1], d1), at(F, p[0], p[1], d1));
  }
  out.push(...T);
}
/** The eight-pointed star of two interlaced squares (Archnet: the commonest motif at Husuni Kubwa). */
export function star8(out, F, a, b, r, d0, d1) {
  const pts = [];
  for (let k = 0; k < 16; k++) { const th = Math.PI * k / 8 + Math.PI / 8, rr = k % 2 ? r * 0.7654 : r; pts.push([a + Math.cos(th) * rr, b + Math.sin(th) * rr]); }
  prism(out, F, pts, d0, d1, [a, b]);
}
/** A boss: an octagonal rosette with a star of pinwheel blades round it. */
export function boss(out, F, a, b, r, d0, d1) {
  for (let k = 0; k < 8; k++) {
    const th = Math.PI * k / 4, t2 = th + 0.55;
    prism(out, F, [[a + Math.cos(th) * r * 0.35, b + Math.sin(th) * r * 0.35], [a + Math.cos(th) * r, b + Math.sin(th) * r], [a + Math.cos(t2) * r * 0.62, b + Math.sin(t2) * r * 0.62]], d0, d1 - 0.01);
  }
  const o = []; for (let k = 0; k < 8; k++) { const th = Math.PI * k / 4 + Math.PI / 8; o.push([a + Math.cos(th) * r * 0.36, b + Math.sin(th) * r * 0.36]); }
  prism(out, F, o, d0, d1, [a, b]);
}
/** A dart frieze: a row of triangles pointing down between a0 and a1, b0 to b1 high. */
export function darts(out, F, a0, a1, b0, b1, d0, d1) {
  const h = b1 - b0, w = h * 0.8, n = Math.max(1, Math.floor((a1 - a0) / w));
  for (let i = 0; i < n; i++) { const a = a0 + (i + 0.5) * (a1 - a0) / n, s = (a1 - a0) / n * 0.42; prism(out, F, [[a - s, b1], [a, b0], [a + s, b1]], d0, d1); }
}
/** A herringbone cable: two rows of slanted bars, leaning opposite ways, between a0 and a1. */
export function herringbone(out, F, a0, a1, b0, b1, d0, d1) {
  const h = (b1 - b0) / 2, w = h * 0.55, n = Math.max(1, Math.floor((a1 - a0) / w));
  for (let i = 0; i < n; i++) {
    const a = a0 + i * (a1 - a0) / n, s = (a1 - a0) / n * 0.55;
    prism(out, F, [[a, b0 + 0.01], [a + s, b0 + 0.01], [a + s * 1.8, b0 + h - 0.01], [a + s * 0.8, b0 + h - 0.01]], d0, d1);
    prism(out, F, [[a + s * 0.8, b0 + h + 0.01], [a + s * 1.8, b0 + h + 0.01], [a + s, b1 - 0.01], [a, b1 - 0.01]], d0, d1);
  }
}
/**
 * A carved panel of coral on a wall face: the panel (CARVED, d 0 → 0.04 out of the face) and its
 * motifs (out to 0.07): 'stars' a row of eight-pointed stars between herringbone borders,
 * 'darts' a dart frieze, 'cable' herringbone, 'boss' one boss.
 */
export function carvedPanel(ctx, F, a0, b0, a1, b1, kind = 'stars') {
  const T = [], P = [];
  prism(P, F, [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], 0, 0.04);
  const h = b1 - b0, w = a1 - a0;
  if (kind === 'stars') {
    const bh = Math.min(0.09, h * 0.18);
    herringbone(T, F, a0 + 0.03, a1 - 0.03, b0 + 0.02, b0 + 0.02 + bh, 0.04, 0.065);
    herringbone(T, F, a0 + 0.03, a1 - 0.03, b1 - 0.02 - bh, b1 - 0.02, 0.04, 0.065);
    const r = Math.min((h - 2 * bh - 0.08) / 2, 0.22), n = Math.max(1, Math.floor(w / (2.4 * r)));
    for (let i = 0; i < n; i++) star8(T, F, a0 + (i + 0.5) * w / n, (b0 + b1) / 2, r, 0.04, 0.07);
  } else if (kind === 'darts') darts(T, F, a0 + 0.02, a1 - 0.02, b0 + 0.02, b1 - 0.02, 0.04, 0.07);
  else if (kind === 'cable') herringbone(T, F, a0 + 0.02, a1 - 0.02, b0 + 0.01, b1 - 0.01, 0.04, 0.065);
  else if (kind === 'boss') boss(T, F, (a0 + a1) / 2, (b0 + b1) / 2, Math.min(w, h) / 2 - 0.03, 0.04, 0.08);
  ctx.bag.add(CARVED, fromTriangles(P));
  if (T.length) ctx.bag.add(DRESSED, fromTriangles(T));
}
/** The frame of a face of a wall along x (a = x) or z (a = z) at coordinate c, facing sign s (+1 toward +z or +x); b is height above y. */
export function wallFace(axis, c, s, y = 0) {
  return axis === 'x' ? frameOf([0, y, c], [1, 0, 0], [0, 1, 0], [0, 0, s]) : frameOf([c, y, 0], [0, 0, 1], [0, 1, 0], [s, 0, 0]);
}

/**
 * A row of rooms, the walls of coral rag plastered: rect (outside of the walls), split along `along`
 * ('x' or 'z') into n rooms (or at the given `at` cuts), walls t thick. fl the floor (a lime-plaster
 * slab), roof 'vault' (barrel vaults springing at fl + hs, the roof slab over them at yR) or 'poles'
 * (mangrove poles at fl + hs, the roof's soffit over them up to yR). Each room's door (doorW × doorH,
 * dressed frame) in the wall on side `door` ('n', 's', 'e', 'w'; null: none); more holes and recesses
 * per side in `holes` / `rec` ({ n: [...], ... } in the wall's own u, v), `cross` holes in the
 * cross walls (a door through each); skip: sides whose wall another row builds; parapet on the
 * outer sides. Returns the rooms' inner rectangles.
 */
export function rooms(ctx, o) {
  const { rect, along = 'x', n = 1, t = 0.6, fl, hs = 2.3, roof = 'vault', door = 'n', doorW = 0.95, doorH = 2.15, frame = 'door', holes = {}, rec = {}, skip = [], parapet = 0.6, mat = C, cross = false, floor = SMOOTH } = o;
  const [x0, z0, x1, z1] = rect, yB = o.yB ?? fl - 0.5;
  const span = along === 'x' ? z1 - z0 - 2 * t : x1 - x0 - 2 * t;
  const yR = o.yR ?? (roof === 'vault' ? fl + hs + span / 2 + 0.45 : fl + hs + 0.3);
  const a0 = along === 'x' ? x0 : z0, a1 = along === 'x' ? x1 : z1;
  const cuts = o.at || Array.from({ length: n - 1 }, (_, k) => a0 + (a1 - a0) * (k + 1) / n);
  const edges = [a0, ...cuts, a1], R = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const p = edges[i] + (i === 0 ? t : t / 2), q = edges[i + 1] - (i === edges.length - 2 ? t : t / 2);
    R.push(along === 'x' ? [p, z0 + t, q, z1 - t] : [x0 + t, p, x1 - t, q]);
  }
  // the long walls, with the rooms' doors in the one on the door side
  const sides = along === 'x' ? [['n', 'x', z0 + t / 2], ['s', 'x', z1 - t / 2]] : [['w', 'z', x0 + t / 2], ['e', 'z', x1 - t / 2]];
  const ends = along === 'x' ? [['w', 'z', x0 + t / 2], ['e', 'z', x1 - t / 2]] : [['n', 'x', z0 + t / 2], ['s', 'x', z1 - t / 2]];
  const yTop = (sd) => yR + (o.parapetOn ? (o.parapetOn.includes(sd) ? parapet : 0) : parapet);
  for (const [sd, ax, c] of sides) {
    if (skip.includes(sd)) continue;
    const H = (holes[sd] || []).map((h) => ({ ...h }));
    if (door === sd) for (const r of R) {
      const m = along === 'x' ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2;
      if (!H.some((h) => h.u0 < m + doorW / 2 && h.u1 > m - doorW / 2 && h.v0 < fl + doorH)) H.push({ u0: m - doorW / 2, u1: m + doorW / 2, v0: fl, v1: fl + doorH, frame });
    }
    wall(ctx, { axis: ax, c, u0: a0, u1: a1, t, y0: yB, y1: yTop(sd), holes: H, rec: rec[sd] || [], mat });
  }
  for (const [sd, ax, c] of ends) if (!skip.includes(sd)) wall(ctx, { axis: ax, c, u0: along === 'x' ? z0 + t : x0 + t, u1: along === 'x' ? z1 - t : x1 - t, t, y0: yB, y1: yTop(sd), holes: holes[sd] || [], rec: rec[sd] || [], mat });
  // the cross walls between the rooms, a door through each when asked
  for (const cc of cuts) {
    const m = along === 'x' ? (z0 + z1) / 2 : (x0 + x1) / 2;
    wall(ctx, { axis: along === 'x' ? 'z' : 'x', c: cc, u0: along === 'x' ? z0 + t : x0 + t, u1: along === 'x' ? z1 - t : x1 - t, t, y0: yB, y1: yR, holes: cross ? [{ u0: m - 0.45, u1: m + 0.45, v0: fl, v1: fl + 2.05, frame: 'door' }] : [], mat });
  }
  // floors, ceilings and the roof
  const vt = [];
  for (const r of R) {
    if (floor) slab(ctx, floor, r, Math.min(yB + 0.2, fl - 0.1), fl);
    if (roof === 'vault') vault(vt, r, fl + hs, along);
    else if (roof === 'poles') poleCeiling(ctx, r, fl + hs, along === 'x' ? 'z' : 'x', { th: yR - fl - hs });
  }
  if (roof === 'vault') {
    ctx.bag.add(C, fromTriangles(vt));
    for (const r of R) ctx.bag.add(SMOOTH, box(r[0], fl + hs + span / 2 + 0.04, r[1], r[2], yR, r[3]));
  }
  if (roof) for (const r of R) ctx.col.floor(r, yR);
  return { rooms: R, yR, yB };
}

/** A water jar of coarse pottery standing at (x, y, z), 52 cm high. */
export function lathe8(x, y, z, s = 1) {
  const T = [], prof = [[0.001, 0], [0.12, 0.02], [0.2, 0.18], [0.19, 0.36], [0.09, 0.46], [0.1, 0.52], [0.001, 0.52]].map(([r, h]) => [r * s, h * s]);
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < 8; k++) {
    const a = 2 * Math.PI * k / 8, b = 2 * Math.PI * (k + 1) / 8, [r0, y0] = prof[i], [r1, y1] = prof[i + 1], m = (a + b) / 2;
    const P = (r, th, yy) => [x + Math.cos(th) * r, y + yy, z + Math.sin(th) * r];
    face(T, [Math.cos(m), (r0 - r1) * 2 / s, Math.sin(m)], P(r0, a, y0), P(r0, b, y0), P(r1, b, y1), P(r1, a, y1));
  }
  return fromTriangles(T);
}
/** A small bowl (imported celadon or blue-and-white, set in a niche) at (x, y, z). */
export function bowl(x, y, z, r = 0.09) {
  const T = [], prof = [[0.001, 0], [r * 0.45, 0.0], [r * 0.85, r * 0.35], [r, r * 0.6], [r * 0.9, r * 0.6], [r * 0.4, r * 0.15], [0.001, r * 0.15]];
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < 10; k++) {
    const a = 2 * Math.PI * k / 10, b = 2 * Math.PI * (k + 1) / 10, [r0, y0] = prof[i], [r1, y1] = prof[i + 1], m = (a + b) / 2;
    const P = (rr, th, yy) => [x + Math.cos(th) * rr, y + yy, z + Math.sin(th) * rr];
    face(T, i < 3 ? [Math.cos(m), -0.4, Math.sin(m)] : [-Math.cos(m), 1, -Math.sin(m)], P(r0, a, y0), P(r0, b, y0), P(r1, b, y1), P(r1, a, y1));
  }
  return fromTriangles(T);
}
