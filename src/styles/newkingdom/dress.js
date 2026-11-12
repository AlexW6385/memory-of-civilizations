// The dressing of the houses and the streets of Thebes (docs/settlements/thebes.md §6.4): what is at eye level on a mudbrick front —
// the mastaba bench by the door, the painted door frame, the shade of matting over a shop, the water jars in their stand, the dung
// cakes and palm ribs for the oven, linen on its line, the protruding palm-log beam ends under the roof edge, the drain spout and its
// stain; the weathering of a dry climate (the salt and the splash at the foot, plaster that has flaked to the brick, patches of new
// whitewash, soot over the door); the rooms built on the roof; and the street furniture (wells, stands of jars, brick stacks, straw,
// a roadside chapel, tethering posts, troughs), the cargo on the quay.
// Local frame of a house: u along the street, v from the street into the lot (v < 0 is the street); F is houses.js's frame().
import { box, lathe, fromTriangles, addCloth, clothBox, place } from '../../core/geom.js';
import { rng } from './kit.js';
import { palm } from '../egyptian/objects.js';

const POT = (r, k = 1) => [[0.001, 0], [r * 0.45, 0.02], [r, r * k], [r * 0.9, r * 1.8 * k], [r * 0.5, r * 2.3 * k], [r * 0.56, r * 2.45 * k], [0.001, r * 2.45 * k]];
const WALL_MATS = ['mud_plaster', 'limewash_white', 'mudbrick'];
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** A quad (two triangles each way) in the house's frame through four [u, y, v] corners. */
function quad(F, a, b, c, d, mat) {
  const P = (p) => [F.X(p[0]), p[1], F.Z(p[2])], A = P(a), B = P(b), C = P(c), D = P(d);
  F.bag.add(mat, fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C]));
}
/** The shade of reed matting over a front, sloping down and out to a pole on each side. */
export function awning(F, u0, u1, h0, h1, proj, mat = 'reed_mat') {
  quad(F, [u0, h0, -0.05], [u1, h0, -0.05], [u1, h1, -proj], [u0, h1, -proj], mat);
  quad(F, [u0, h0 - 0.05, -0.05], [u1, h0 - 0.05, -0.05], [u1, h1 - 0.05, -proj], [u0, h1 - 0.05, -proj], 'timber');
  for (const u of [u0 + 0.05, u1 - 0.05]) F.b('timber', u - 0.045, 0, -proj - 0.045, u + 0.045, h1, -proj + 0.045, false);
  F.b('timber', u0, h1 - 0.08, -proj - 0.04, u1, h1 + 0.02, -proj + 0.04, false);
}

/**
 * The front of a house. o: { W, H, wm (the wall's material), uD (the door's centre), dw (its width), kind, lod (0–2: how much), open, shop }.
 * Everything is non-solid and within 0.6 m of the wall (the benches, the awnings' poles within the kerb).
 */
export function facade(F, rand, o) {
  const { W, H, wm, uD, dw = 0.9, lod = 1 } = o, dl = uD - dw / 2 - 0.25, dr = uD + dw / 2 + 0.25;
  const clear = (u0, u1) => u1 < dl || u0 > dr;
  // the weathering: the salt and splash band at the foot, ragged; plaster flaked to the brick; new whitewash patches; soot over the door
  for (let u = 0.1; u < W - 0.4;) {
    const w = 0.5 + rand() * 1.4, hh = 0.45 + rand() * 0.55;
    if (rand() < 0.65 && (clear(u, u + w) || true)) F.b('banco', Math.max(0, u), 0.3, -0.035, Math.min(W, u + w), hh, -0.01, false);
    u += w + rand() * 0.8;
  }
  const patches = lod >= 1 ? 2 + Math.floor(rand() * 3) : 1;
  for (let k = 0; k < patches; k++) {
    const w = 0.5 + rand() * 1.1, h = 0.4 + rand() * 0.9, u = 0.2 + rand() * (W - w - 0.4), y = 0.7 + rand() * Math.max(0.1, H - h - 1.2);
    if (!clear(u, u + w)) continue;
    const m = pick(rand, WALL_MATS.filter((x) => x !== wm));
    F.b(m, u, y, -0.02 - k * 0.003, u + w, y + h, -0.005, false);
  }
  F.b('plaster_streak', uD - dw / 2 - 0.05, H - 0.9, -0.02, uD + dw / 2 + 0.05, H - 0.1, -0.005, false);                                          // soot and drip over the door
  // the roof edge: the ends of the palm-log beams, the drain spout, the stain under it
  const step = lod >= 2 ? 0.5 : 0.75;
  for (let u = 0.35; u < W - 0.5; u += step) F.b('palm_trunk', u, H - 0.34, -0.3, u + 0.17, H - 0.14, 0, false);
  const su = clear(0.6, 1.0) ? 0.6 + rand() * (W - 1.4) : W - 0.8;
  F.b('limestone_core', su, H + 0.02, -0.5, su + 0.14, H + 0.1, 0.1, false);
  F.b('plaster_streak', su - 0.02, H - 1.7, -0.025, su + 0.16, H, -0.008, false);
  if (lod < 1) return;
  // the door's painted frame (blue posts, a red lintel band): the household's, the poorest leave the wood bare
  if (rand() < 0.7) {
    const hd = o.doorH ?? 1.95;
    for (const s of [-1, 1]) F.b('egyptian_blue', uD + s * (dw / 2 + 0.17) - 0.05, 0, -0.07, uD + s * (dw / 2 + 0.17) + 0.05, hd + 0.2, -0.05, false);
    F.b('limewash_red', uD - dw / 2 - 0.22, hd + 0.2, -0.07, uD + dw / 2 + 0.22, hd + 0.34, -0.05, false);
  }
  // the bench of mud brick beside the door, a mat on it; or the jars in their stand
  const room = (side) => (side > 0 ? W - dr : dl);
  const side = room(1) > room(-1) ? 1 : -1;
  if (room(side) > 1.9 && rand() < 0.62) {
    const b0 = side > 0 ? dr + 0.1 : dl - 1.7, b1 = b0 + 1.6;
    F.b('mud_plaster', b0, 0, -0.55, b1, 0.44, -0.0, false);
    F.b('reed_mat', b0 + 0.05, 0.44, -0.5, b1 - 0.05, 0.47, -0.05, false);
    if (rand() < 0.4) F.lathe('terracotta', POT(0.14, 0.9), b0 + 0.4, 0.47, -0.3, 8);
  }
  const jo = side > 0 ? dl - 0.45 : dr + 0.45;
  if (jo > 0.5 && jo < W - 0.5 && rand() < 0.6) {
    F.b('mud_plaster', jo - 0.34, 0, -0.62, jo + 0.34, 0.22, -0.02, false);
    F.lathe('terracotta', POT(0.24, 1.15), jo - 0.01, 0.22, -0.32, 10);
    if (rand() < 0.5) F.lathe('terracotta', POT(0.18, 0.95), jo + 0.2, 0.22, -0.5, 9);
  }
  const fo = side > 0 ? W - 0.9 : 0.7;
  const r = rand();
  if (r < 0.28 && clear(fo - 0.6, fo + 0.6)) {                                                 // the fuel: palm ribs stacked against the wall
    for (let i = 0; i < 4; i++) F.b('palm_trunk', fo - 0.5 + i * 0.01, i * 0.11, -0.55, fo + 0.5 - i * 0.02, i * 0.11 + 0.1, -0.2 - i * 0.02, false);
  } else if (r < 0.5 && clear(fo - 0.5, fo + 0.5)) {                                           // dung cakes stacked to dry
    for (let i = 0; i < 4; i++) F.b('banco_rough', fo - 0.4 + i * 0.03, i * 0.13, -0.5, fo + 0.4 - i * 0.03, i * 0.13 + 0.12, -0.15, false);
  } else if (r < 0.66 && lod >= 2) {                                                           // linen on a line from a peg to a post
    const lu = Math.min(Math.max(uD + (rand() < 0.5 ? -1 : 1) * 1.6, 0.9), W - 2.1);
    if (clear(lu, lu + 1.3)) {
      F.b('timber', lu - 0.05, 1.5, -0.4, lu + 1.35, 1.55, -0.34, false);
      for (const u of [lu - 0.05, lu + 1.3]) F.b('timber', u, 0, -0.42, u + 0.06, 2.25, -0.36, false);
      addCloth(F.bag, pick(rand, ['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo']), clothBox(F.X(lu + 0.05), 1.0, Math.min(F.Z(-0.38), F.Z(-0.4)), F.X(lu + 1.3), 1.5, Math.max(F.Z(-0.38), F.Z(-0.4)), 0.25), 1.5);
    }
  }
  // the shade over the door: a mat roof on poles at the poorer fronts that have a trade, the whole front of a shop
  if (o.shop) awning(F, Math.max(0.1, uD - 2.0), Math.min(W - 0.1, uD + 2.0), 2.55, 2.15, 1.35);
  else if (rand() < 0.22 && lod >= 2) awning(F, uD - 0.95, uD + 0.95, 2.45, 2.15, 1.0);
}

/** A room built on the roof of a house that is not entered: walls, a roof of mud, a window with its screen, the door toward the terrace. */
export function cabin(F, rand, H, wm, rect) {
  const [u0, v0, u1, v1] = rect, T = H + 0.28, h = 2.35, th = 0.3;
  F.b(wm, u0, T, v0, u1, T + h, v1);
  F.b('mud_plaster', u0 - 0.15, T + h, v0 - 0.15, u1 + 0.15, T + h + 0.25, v1 + 0.15, false);
  for (let u = u0 + 0.2; u < u1 - 0.3; u += 0.7) F.b('palm_trunk', u, T + h - 0.2, v0 - 0.4, u + 0.16, T + h, v0 - 0.15, false);
  F.b('opening', (u0 + u1) / 2 - 0.4, T + 1.4, v0 - 0.01, (u0 + u1) / 2 + 0.4, T + 2.0, v0 + 0.04, false);
  F.b('lattice', (u0 + u1) / 2 - 0.4, T + 1.4, v0 - 0.03, (u0 + u1) / 2 + 0.4, T + 2.0, v0 - 0.015, false);
  F.b('opening', u1 - 0.9, T, v0 - 0.01, u1 - 0.1, T + 1.8, v0 + 0.04, false);
  F.b('limewash_white', u0, T + h - 0.5, v0 - 0.02, u1, T + h - 0.1, v0 - 0.005, false);
  void rand; void th;
}

/** A dovecote: the mudbrick tower of the pigeon keepers, narrowing upward, with its rows of pot holes and a perch ledge at each. */
export function dovecote(F, u, v, h, r) {
  F.lathe('mud_plaster', [[r, 0], [r * 1.02, 0.3], [r * 0.82, h * 0.85], [r * 0.7, h], [r * 0.45, h + 0.4], [0.001, h + 0.7]], u, 0, v, 14);
  for (let k = 0; k < 3; k++) for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + k * 0.4, rr = r * (1.0 - 0.17 * (0.5 + k) / 3.5) + 0.02, y = 0.9 + k * h * 0.26;
    F.b('opening', u + Math.cos(a) * rr - 0.07, y, v + Math.sin(a) * rr - 0.07, u + Math.cos(a) * rr + 0.07, y + 0.16, v + Math.sin(a) * rr + 0.07, false);
  }
  F.col.circle(F.X(u), F.Z(v), r * 1.02, 0, h);
}

// ── the streets ──────────────────────────────────────────────────────────────────────────────────
/**
 * nk_props: { items: [{ k, at: [x, z], yaw, y, seed, ... }] } — the furniture of streets, the avenue, the quay and the courts.
 * Kinds: well (a shaduf over a kerbed pit), jars (a stand of water jars), bricks (mudbricks stacked to dry), straw, post (a tethering post
 * and a trough), chapel (a roadside shrine), bench, stack (grain sacks), logs, block (a dressed stone on its sledge), coil (rope), net
 * (a net drying on poles), table (an offering table), brazier, stela, statue, basin.
 */
export function props(el, ctx) {
  const { bag, col } = ctx;
  for (const it of el.items) {
    const [x, z] = it.at, y = it.y ?? 0, yaw = it.yaw ?? 0, rand = rng(it.seed ?? 7);
    const add = (mat, g) => { place(g, x, y, z, yaw); bag.add(mat, g); };
    const B = (mat, a, b, c, d, e, f) => add(mat, box(a, b, c, d, e, f));
    const L = (mat, prof, u, yy, v, seg = 10) => add(mat, lathe(prof, seg, null, u, yy, v));
    const solid = (a, b, c, d, hh) => { const cs = Math.cos(yaw), sn = Math.sin(yaw), pts = [[a, b], [c, d]].map(([u, v]) => [x + cs * u + sn * v, z - sn * u + cs * v]); col.rect([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])], y, y + hh); };
    switch (it.k) {
      case 'well':
        B('mud_plaster', -0.6, 0, -0.6, 0.6, 0.5, 0.6); solid(-0.6, -0.6, 0.6, 0.6, 0.5);
        B('timber', -0.8, 0, -0.07, -0.68, 2.3, 0.05); B('timber', 0.68, 0, -0.07, 0.8, 2.3, 0.05); B('timber', -0.8, 2.2, -0.08, 0.8, 2.34, 0.06);
        B('timber', -2.0, 2.28, -0.03, 0.9, 2.36, 0.03); L('limestone_core', [[0.001, 0], [0.2, 0.04], [0.22, 0.32], [0.001, 0.36]], -2.0, 1.95, 0, 8); L('wicker', [[0.12, 0], [0.16, 0.2], [0.001, 0.2]], 0.9, 1.0, 0, 8);
        B('mud_plaster', 0.7, -0.02, 0.4, 1.6, 0.2, 1.1);                                                       // the trough the water is poured into
        break;
      case 'jars':
        B('mud_plaster', -0.7, 0, -0.35, 0.7, 0.22, 0.35);
        for (const [u, v, r] of [[-0.4, 0, 0.26], [0.1, -0.08, 0.3], [0.5, 0.1, 0.22]]) L('terracotta', POT(r, 1.1), u, 0.22, v, 10);
        B('palm_trunk', -0.45, 1.5, -0.04, 0.6, 1.55, 0.04); B('timber', -0.45, 0, -0.05, -0.4, 1.5, 0.05); B('timber', 0.55, 0, -0.05, 0.6, 1.5, 0.05);
        B('reed_mat', -0.6, 1.55, -0.3, 0.75, 1.6, 0.5);                                                         // a little shade for the water
        break;
      case 'bricks':
        for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) B('mudbrick', -0.8 + i * 0.45 + r * 0.22, r * 0.2, -0.3, -0.8 + i * 0.45 + r * 0.22 + 0.4, r * 0.2 + 0.17, 0.0);
        for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) B('mudbrick', -0.8 + i * 0.45, r * 0.2, 0.15, -0.8 + i * 0.45 + 0.4, r * 0.2 + 0.17, 0.45);
        B('mud_plaster', 0.9, 0, -0.3, 1.5, 0.05, 0.4);                                                          // the mould's smear on the ground
        break;
      case 'straw':
        L('banco_smooth', [[0.9, 0], [0.85, 0.3], [0.6, 0.75], [0.25, 1.05], [0.001, 1.15]], 0, 0, 0, 10); solid(-0.8, -0.8, 0.8, 0.8, 1.1);
        break;
      case 'post':
        B('palm_trunk', -0.07, 0, -0.07, 0.07, 1.1, 0.07);
        B('mud_plaster', 0.45, 0, -0.25, 1.65, 0.38, 0.25); B('mud_plaster', 0.52, 0.3, -0.18, 1.58, 0.4, 0.18); B('opening', 0.58, 0.395, -0.12, 1.52, 0.405, 0.12);
        break;
      case 'chapel':
        B('mud_plaster', -0.9, 0, -0.7, 0.9, 1.6, 0.7); solid(-0.9, -0.7, 0.9, 0.7, 1.6);
        B('limewash_white', -0.92, 0.0, -0.72, 0.92, 0.35, 0.72);
        B('opening', -0.35, 0.55, -0.72, 0.35, 1.3, -0.69); B('limestone_carved', -0.12, 0.55, -0.74, 0.12, 0.95, -0.7);
        B('limewash_red', -0.38, 1.32, -0.725, 0.38, 1.42, -0.69); B('mud_plaster', -1.0, 1.6, -0.8, 1.0, 1.75, 0.8);
        B('limestone_core', -0.45, 0, -1.25, 0.45, 0.2, -0.7);                                                      // the step with its offering of bread and a lamp
        L('banco_smooth', [[0.12, 0], [0.15, 0.05], [0.001, 0.07]], -0.15, 0.2, -1.0, 8); L('pottery_dark', [[0.001, 0], [0.07, 0.01], [0.06, 0.05], [0.001, 0.05]], 0.15, 0.2, -1.0, 6);
        break;
      case 'bench':
        B('mud_plaster', -0.9, 0, -0.3, 0.9, 0.44, 0.3); B('reed_mat', -0.85, 0.44, -0.25, 0.85, 0.47, 0.25);
        break;
      case 'stack':                                                                                              // sacks of grain, in layers
        for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - (r > 1 ? 1 : 0); i++) L('sacking', [[0.001, 0], [0.34, 0.02], [0.36, 0.2], [0.3, 0.34], [0.12, 0.4], [0.001, 0.41]], -0.7 + i * 0.7 + r * 0.2, r * 0.36, (r % 2) * 0.12 - 0.1, 8);
        solid(-1.1, -0.5, 1.1, 0.5, 1.0);
        break;
      case 'logs':
        for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - (r > 2 ? 1 : 0); i++) add('palm_trunk', lathe([[0.001, 0], [0.13, 0.0], [0.13, 2.8], [0.001, 2.8]], 7, null, 0, 0, 0).rotateZ(-Math.PI / 2).translate(-1.4, 0.15 + r * 0.24, -0.5 + i * 0.27 + (r % 2) * 0.12));
        solid(-1.5, -0.7, 1.5, 0.7, 1.0);
        break;
      case 'block':                                                                                              // a dressed stone on a sledge with rollers
        B('sandstone_dressed', -1.1, 0.3, -0.6, 1.1, 1.3, 0.6); solid(-1.2, -0.7, 1.2, 0.7, 1.3);
        B('timber', -1.3, 0.12, -0.7, 1.3, 0.3, -0.5); B('timber', -1.3, 0.12, 0.5, 1.3, 0.3, 0.7);
        for (const u of [-1.0, -0.2, 0.7]) add('timber', lathe([[0.001, 0], [0.1, 0], [0.1, 1.6], [0.001, 1.6]], 7, null, 0, 0, 0).rotateX(Math.PI / 2).translate(u, 0.1, -0.8));
        B('rope_fibre', 1.1, 0.4, -0.05, 1.9, 0.46, 0.05);
        break;
      case 'coil':
        L('rope_fibre', [[0.2, 0], [0.45, 0.02], [0.5, 0.1], [0.5, 0.2], [0.42, 0.26], [0.2, 0.26]], 0, 0, 0, 10);
        break;
      case 'net':                                                                                                // a net on two poles, drying
        B('palm_trunk', -1.5, 0, -0.05, -1.4, 2.5, 0.05); B('palm_trunk', 1.4, 0, -0.05, 1.5, 2.5, 0.05); B('palm_trunk', -1.5, 2.4, -0.04, 1.5, 2.5, 0.04);
        { const g = clothBox(-1.4, 0.7, -0.02, 1.4, 2.4, 0.02, 0.25); place(g, x, y, z, yaw); addCloth(bag, 'linen', g, y + 2.4); }
        break;
      case 'table':                                                                                              // an offering table of stone: bread, a jar, lotus
        B('sandstone_dressed', -0.55, 0, -0.4, 0.55, 0.12, 0.4); B('sandstone_dressed', -0.14, 0.12, -0.14, 0.14, 0.72, 0.14); B('sandstone_dressed', -0.6, 0.72, -0.45, 0.6, 0.82, 0.45); solid(-0.55, -0.4, 0.55, 0.4, 0.82);
        for (let i = 0; i < 4; i++) L('banco_smooth', [[0.001, 0], [0.1, 0.02], [0.1, 0.06], [0.001, 0.1]], -0.4 + i * 0.22, 0.82, (i % 2) * 0.14 - 0.07, 7);
        L('terracotta', POT(0.1, 1.0), 0.35, 0.82, 0.12, 8); L('lotus_leaf', [[0.001, 0], [0.12, 0.01], [0.001, 0.02]], 0.22, 0.83, -0.25, 6);
        break;
      case 'brazier':
        L('bronze', [[0.001, 0], [0.2, 0.0], [0.14, 0.06], [0.1, 0.8], [0.3, 0.9], [0.34, 1.0], [0.001, 1.0]], 0, 0, 0, 10); col.circle(x, z, 0.32, y, y + 1.0);
        L('flame', [[0.001, 0.96], [0.14, 1.0], [0.07, 1.35], [0.001, 1.5]], 0, 0, 0, 6);
        break;
      case 'stela':
        B('sandstone_dressed', -0.65, 0, -0.35, 0.65, 0.3, 0.35); B('granite_black', -0.45, 0.3, -0.12, 0.45, 2.2, 0.12); B('granite_black', -0.42, 2.2, -0.1, 0.42, 2.3, 0.1); solid(-0.65, -0.35, 0.65, 0.35, 2.3);
        B('paint_ochre', -0.34, 1.5, -0.14, 0.34, 1.8, -0.12); B('egyptian_blue', -0.34, 0.95, -0.14, 0.34, 1.25, -0.12); B('limewash_red', -0.34, 0.5, -0.14, 0.34, 0.8, -0.12);
        break;
      case 'statue':                                                                                             // a standing statue of a priest on its plinth
        B('sandstone_dressed', -0.6, 0, -0.5, 0.6, 0.55, 0.5); B('granite_black', -0.28, 0.55, -0.15, -0.04, 1.4, 0.15); B('granite_black', 0.04, 0.55, -0.15, 0.28, 1.4, 0.15);
        B('granite_black', -0.3, 1.4, -0.16, 0.3, 2.35, 0.16); B('granite_black', -0.5, 1.6, -0.1, -0.3, 2.3, 0.1); B('granite_black', 0.3, 1.6, -0.1, 0.5, 2.3, 0.1);
        L('granite_black', [[0.001, 2.3], [0.17, 2.35], [0.2, 2.55], [0.15, 2.78], [0.001, 2.82]], 0, 0, 0, 10); solid(-0.6, -0.5, 0.6, 0.5, 2.8);
        break;
      case 'basin':                                                                                              // a stone basin of purification, filled
        B('sandstone_dressed', -1.0, 0, -0.7, 1.0, 0.5, 0.7); solid(-1.0, -0.7, 1.0, 0.7, 0.5);
        add('water', fromTriangles([-0.8, 0.42, -0.5, -0.8, 0.42, 0.5, 0.8, 0.42, 0.5, -0.8, 0.42, -0.5, 0.8, 0.42, 0.5, 0.8, 0.42, -0.5]));
        break;
      case 'palm':                                                                                               // a date palm in its ring of mud brick
        B('mud_plaster', -0.9, 0, -0.9, 0.9, 0.3, -0.7); B('mud_plaster', -0.9, 0, 0.7, 0.9, 0.3, 0.9); B('mud_plaster', -0.9, 0, -0.7, -0.7, 0.3, 0.7); B('mud_plaster', 0.7, 0, -0.7, 0.9, 0.3, 0.7);
        palm({ at: [x, z], y, h: it.h ?? 7, lean: 0.05, seed: it.seed ?? 3 }, ctx);
        break;
      default: break;
    }
    void rand;
  }
}

/** The goods of a shop on its counter (a row house's front room, along the street wall): kinds by trade. */
export function shopGoods(F, rand, uD, th, kind) {
  const u0 = th + 0.1, u1 = uD - 0.7;
  if (u1 - u0 < 1.2) return;
  F.b('mud_plaster', u0, 0, 0.55, u1, 0.95, 1.05);
  F.b('reed_mat', u0, 0.95, 0.55, u1, 0.97, 1.05, false);
  const n = Math.floor((u1 - u0) / 0.42);
  for (let i = 0; i < n; i++) {
    const u = u0 + 0.25 + i * 0.42, v = 0.8;
    if (kind === 'bread') F.lathe('banco_smooth', [[0.001, 0], [0.17, 0.02], [0.18, 0.07], [0.1, 0.13], [0.001, 0.15]], u, 0.97, v, 8);
    else if (kind === 'pots') F.lathe('terracotta', POT(0.12 + rand() * 0.04, 0.9 + rand() * 0.4), u, 0.97, v, 8);
    else if (kind === 'beer') F.lathe('pottery_dark', POT(0.15, 1.0), u, 0.97, v, 8);
    else if (kind === 'fruit') F.lathe('wicker', [[0.17, 0], [0.2, 0.12], [0.001, 0.14]], u, 0.97, v, 8);
    else if (kind === 'cloth') F.b(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_blue'][i % 4], u - 0.17, 0.97, v - 0.2, u + 0.17, 0.97 + 0.12 + (i % 3) * 0.06, v + 0.2, false);
    else F.b('hide_tan', u - 0.15, 0.97, v - 0.18, u + 0.15, 1.02, v + 0.18, false);
  }
  if (kind === 'fruit') for (let i = 0; i < n; i++) F.lathe('fresco_green', [[0.001, 0.14], [0.14, 0.16], [0.001, 0.22]], u0 + 0.25 + i * 0.42, 0.97, 0.8, 7);
  F.b('timber', u0, 1.9, 0.5, u1, 1.95, 0.56, false);                                   // the rail the wares hang from
  for (let i = 0; i < Math.floor(n / 2); i++) F.b(kind === 'cloth' ? 'cloth_ochre' : 'rope_fibre', u0 + 0.3 + i * 0.8, 1.35, 0.52, u0 + 0.45 + i * 0.8, 1.9, 0.54, false);
}
