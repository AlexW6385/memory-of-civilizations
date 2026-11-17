// The floors and the floodplain at Ubirr, deepened (docs/settlements/kakadu.md §13): the things people worked with on the shelters' earth
// floors and at the camps' fires (shell middens, earth ovens, grinding places, ochre workplaces, bark beds, fibre work), the magpie geese
// and whistling ducks of the water, spike-rush on the shallows, and the paperbark sheets that fall under the trees. Sizes [inferred].
// Every piece is an instance of a cached shape (assembly), so that dozens cost a few draws; nothing here collides (all below knee height).
import { box, rod, fromTriangles } from '../../core/geom.js';
import { placer, assembly, tube, slathe, ball, rng } from '../../objects/kit.js';

const mv = (g, x, y, z) => { g.translate(x, y, z); return g; };
/** A ball (centre at the origin) stretched to semi-axes (sx, sy, sz), set at (x, y, z). */
const blob = (sx, sy, sz, x, y, z) => { const g = ball(1, 9, 7); g.translate(0, -1, 0); g.scale(sx, sy, sz); g.translate(x, y, z); return g; };

/** One valve of a freshwater mussel shell, lying convex side up: 7 to 9 cm long. */
const valve = () => slathe([[0.001, 0], [0.034, 0.003], [0.04, 0.012], [0.022, 0.02], [0.001, 0.023]], 6).scale(1.9, 1, 1);

const KINDS = {
  /** A shell midden: a low heap of dark ashy earth thick with mussel valves, turtle plates and the bones of geese, a few charred sticks. */
  shells(a, v) {
    const r = rng(2100 + v * 7), prof = (d) => 0.3 * Math.max(0, 1 - (d / 1.0) ** 2) + 0.012;
    a('ash', slathe([[0.001, 0], [1.3, 0], [1.25, 0.02], [0.001, 0.024]], 10, (th) => 1 + 0.14 * Math.sin(3 * th + v)));
    a('heap', slathe([[0.001, 0.31], [0.3, 0.28], [0.6, 0.19], [0.85, 0.08], [1.0, 0.02], [1.02, 0]], 10, (th) => 1 + 0.12 * Math.sin(2 * th + v * 2)));
    for (let k = 0; k < 64; k++) {
      const d = Math.sqrt(r()) * 1.0, th = r() * 6.28, g = valve(), s = 0.8 + r() * 0.5;
      g.scale(s, s, s); g.rotateX((r() - 0.5) * 0.5); g.rotateZ((r() - 0.5) * 0.5); g.rotateY(r() * 6.28);
      a('shell', mv(g, Math.cos(th) * d, prof(d) - 0.004, Math.sin(th) * d));
    }
    for (let k = 0; k < 4; k++) {                                                      // plates of a long-necked turtle's shell
      const d = 0.2 + r() * 0.6, th = r() * 6.28, g = slathe([[0.001, 0.02], [0.07, 0.012], [0.09, 0], [0.07, 0], [0.001, 0.0]], 6).scale(1.2, 1, 0.8);
      g.rotateY(r() * 6.28); a('plate', mv(g, Math.cos(th) * d, prof(d) + 0.006, Math.sin(th) * d));
    }
    for (let k = 0; k < 5; k++) { const d = 0.25 + r() * 0.65, th = r() * 6.28, x = Math.cos(th) * d, z = Math.sin(th) * d, t = r() * 6.28; a('bone', rod([x, prof(d) + 0.01, z], [x + Math.cos(t) * 0.16, prof(d) + 0.02, z + Math.sin(t) * 0.16], 0.008, 3)); }
    for (let k = 0; k < 3; k++) { const th = r() * 6.28, d = 1.1 + r() * 0.2, x = Math.cos(th) * d, z = Math.sin(th) * d, t = r() * 6.28; a('char', rod([x, 0.03, z], [x + Math.cos(t) * 0.3, 0.035, z + Math.sin(t) * 0.3], 0.02, 4)); }
  },
  /** An earth oven: a shallow pit with a raised rim, heated stones, paperbark parcels laid on them, or (v 1) closed under leaves and a mound of earth. */
  oven(a, v) {
    const r = rng(2200 + v * 5);
    a('rim', slathe([[0.5, 0], [0.64, 0.02], [0.7, 0.07], [0.6, 0.12], [0.47, 0.08], [0.42, 0.0]], 12, (th) => 1 + 0.08 * Math.sin(2 * th + v)));
    a('ash', slathe([[0.001, 0.004], [0.44, 0.004], [0.44, 0.002], [0.001, 0.002]], 10));
    if (v === 0) {
      for (let k = 0; k < 9; k++) { const t = k / 9 * 6.28 + r() * 0.5, d = 0.08 + r() * 0.3; a(k % 3 ? 'stone' : 'hot', mv(slathe([[0.001, 0], [0.09, 0.02], [0.08, 0.085], [0.001, 0.1]], 6).scale(1, 0.8 + r() * 0.4, 1), Math.cos(t) * d, 0.01, Math.sin(t) * d)); }
      for (let k = 0; k < 3; k++) { const t = k * 1.9 + 0.4, d = 0.12 + (k % 2) * 0.12, x = Math.cos(t) * d, z = Math.sin(t) * d; a('parcel', rod([x - 0.22, 0.16, z - 0.05 * k], [x + 0.22, 0.17, z + 0.05 * k + 0.04], 0.065, 6)); a('tie', mv(slathe([[0.075, 0], [0.075, 0.025], [0.001, 0.025]], 6), x, 0.12, z)); }
      a('leaf', mv(slathe([[0.001, 0], [0.34, 0.0], [0.3, 0.02], [0.001, 0.022]], 8).scale(1, 1, 0.6), -0.2, 0.2, -0.38));
    } else {
      a('leaf', mv(slathe([[0.001, 0.2], [0.3, 0.16], [0.46, 0.05], [0.46, 0.0]], 10), 0, 0, 0));
      a('mound', mv(slathe([[0.001, 0.3], [0.2, 0.28], [0.45, 0.17], [0.6, 0.06], [0.64, 0.0]], 10, (th) => 1 + 0.07 * Math.sin(3 * th)), 0, 0.04, 0));
      a('hot', mv(slathe([[0.001, 0], [0.07, 0.02], [0.06, 0.07], [0.001, 0.08]], 6), 0.62, 0.0, 0.5));
    }
    a('stick', rod([0.8, 0.03, 0.45], [2.0, 0.03, 0.95], 0.02, 4));                  // the digging stick that opens it
    a('stick', rod([0.85, 0.03, 0.6], [1.7, 0.03, 1.2], 0.016, 4));
  },
  /** A grinding place: the grindstone with its worn dish and the handstone, seed and flour on bark, cycad nut halves drying, a pounding stone. */
  grind(a, v) {
    const r = rng(2300 + v * 5);
    a('slab', box(-0.4, 0, -0.24, 0.4, 0.09, 0.24)); a('slab', box(-0.42, 0, -0.1, -0.4, 0.07, 0.12));
    a('dish', mv(slathe([[0.22, 0], [0.2, 0.003], [0.001, 0.003]], 10).scale(1.3, 1, 0.8), -0.02, 0.09, 0));
    a('muller', blob(0.16, 0.025, 0.065, 0.03 - v * 0.08, 0.1, 0.02 - v * 0.03)); a('muller', blob(0.14, 0.03, 0.05, 0.06, 0.04, -0.4 - v * 0.1));
    a('sheet', box(0.55, 0, -0.2, 1.15, 0.014, 0.25));                              // the bark tray the flour falls to
    a('flour', mv(slathe([[0.001, 0.07], [0.12, 0.05], [0.2, 0.012], [0.2, 0.0]], 9), 0.82, 0.014, 0.02));
    for (let k = 0; k < 8; k++) a('half', blob(0.04, 0.015, 0.028, 0.6 + (k % 4) * 0.12, 0.012 + 0.012, -0.12 + Math.floor(k / 4) * 0.12 + r() * 0.03));
    a('sheet', mv(slathe([[0.001, 0], [0.16, 0], [0.2, 0.05], [0.18, 0.055], [0.14, 0.012], [0.001, 0.012]], 9), -0.55, 0, 0.45));   // a bark dish of seed
    for (let k = 0; k < 14; k++) { const t = r() * 6.28, d = r() * 0.11; a('seed', blob(0.011, 0.01, 0.011, -0.55 + Math.cos(t) * d, 0.014, 0.45 + Math.sin(t) * d)); }
  },
  /** An ochre workplace: a slab with its stains, lumps of red, yellow and white, a mussel-shell cup of paste, brushes and a bark roll of pigments. */
  ochre(a, v) {
    const r = rng(2400 + v * 5);
    a('slab', box(-0.3, 0, -0.22, 0.3, 0.05, 0.22));
    a('red', mv(slathe([[0.001, 0], [0.11, 0], [0.1, 0.003], [0.001, 0.003]], 8).scale(1.2, 1, 0.9), -0.1, 0.05, 0.02));
    a('yel', mv(slathe([[0.001, 0], [0.08, 0], [0.07, 0.003], [0.001, 0.003]], 8), 0.12, 0.05, -0.07));
    a('wht', mv(slathe([[0.001, 0], [0.07, 0], [0.06, 0.003], [0.001, 0.003]], 8), 0.13, 0.05, 0.1));
    for (const [m, n] of [['red', 3], ['yel', 2], ['wht', 2]]) for (let k = 0; k < n; k++) { const t = r() * 6.28, d = 0.42 + r() * 0.2; a(m + 'L', blob(0.04 + r() * 0.03, 0.025, 0.035, Math.cos(t) * d, 0.012, Math.sin(t) * d)); }
    a('cup', mv(slathe([[0.001, 0], [0.07, 0.004], [0.08, 0.03], [0.06, 0.036], [0.05, 0.01], [0.001, 0.008]], 8), 0.5, 0, -0.1));
    a('redL', mv(slathe([[0.05, 0.012], [0.001, 0.012]], 8), 0.5, 0.0, -0.1));
    for (let k = 0; k < 4; k++) { a('brush', rod([-0.55 - k * 0.05, 0.012, 0.42], [-0.15 - k * 0.04, 0.016, 0.5 + k * 0.02], 0.007, 4)); a('tuft', rod([-0.17 - k * 0.04, 0.016, 0.49 + k * 0.02], [-0.1 - k * 0.04, 0.017, 0.5 + k * 0.02], 0.011, 4)); }
    a('roll', rod([-0.5, 0.07, -0.4], [-0.1, 0.07, -0.46], 0.07, 7)); a('lash', mv(slathe([[0.08, 0], [0.08, 0.03], [0.001, 0.03]], 7), -0.5, 0.0, -0.4).rotateZ(0)); a('lash', rod([-0.3, 0.07, -0.43], [-0.28, 0.07, -0.43], 0.078, 7));
  },
  /** A bed of stringybark on a low frame of forked poles, a paperbark roll for the head, a folded mat. Long axis along x. */
  bedframe(a) {
    for (const sx of [-0.85, 0.85]) for (const sz of [-0.36, 0.36]) a('pole', rod([sx, 0, sz], [sx, 0.4, sz], 0.035, 5));
    for (const sz of [-0.36, 0.36]) a('pole', rod([-1.0, 0.38, sz], [1.0, 0.38, sz], 0.03, 5));
    for (let k = 0; k < 5; k++) a('pole', rod([-0.8 + k * 0.4, 0.42, -0.42], [-0.8 + k * 0.4, 0.42, 0.42], 0.022, 4));
    a('sheet', box(-0.95, 0.435, -0.4, 0.95, 0.455, 0.4));
    a('paper', rod([-0.72, 0.53, -0.28], [-0.72, 0.53, 0.28], 0.075, 7)); a('lash', rod([-0.72, 0.53, -0.1], [-0.72, 0.53, -0.07], 0.08, 7));
    a('mat', box(-0.1, 0.455, -0.3, 0.55, 0.49, 0.3));
  },
  /** Fibre work: a bark sheet with teased bark fibre, a coil of finished string, strips soaking-ready, a half-made dilly bag hung on a stick. */
  string(a, v) {
    const r = rng(2500 + v * 5);
    a('sheet', box(-0.55, 0, -0.38, 0.55, 0.014, 0.38));
    for (let k = 0; k < 7; k++) a('fibre', rod([-0.4 + r() * 0.1, 0.02 + k * 0.006, -0.3 + k * 0.08], [0.3 + r() * 0.15, 0.022 + k * 0.006, -0.28 + k * 0.08], 0.011, 3));
    for (let k = 0; k < 7; k++) { const t = k / 7 * 6.28; a('coil', rod([0.65 + Math.cos(t) * 0.1, 0.03, 0.15 + Math.sin(t) * 0.1], [0.65 + Math.cos(t + 0.9) * 0.1, 0.03, 0.15 + Math.sin(t + 0.9) * 0.1], 0.016, 4)); }
    a('coil', mv(slathe([[0.001, 0.03], [0.07, 0.03], [0.07, 0.045], [0.001, 0.05]], 7), 0.65, 0, 0.15));
    for (let k = 0; k < 3; k++) a('strip', rod([-0.8, 0.02 + k * 0.012, -0.2 + k * 0.1], [-0.2, 0.022 + k * 0.012, -0.1 + k * 0.1], 0.016, 4));
    for (const s of [-1, 1]) a('pole', rod([s * 0.3, 0, 0.62], [s * 0.3, 0.5, 0.62], 0.02, 4));
    a('pole', rod([-0.34, 0.5, 0.62], [0.34, 0.5, 0.62], 0.016, 4));
    a('bag', mv(slathe([[0.001, -0.2], [0.07, -0.17], [0.1, -0.08], [0.09, 0.0], [0.001, 0.02]], 8, (t, i) => 1 + (i % 2 ? 0.05 : 0)), 0, 0.46, 0.62));
    a('cord', rod([0, 0.5, 0.62], [0, 0.46, 0.62], 0.008, 3));
  },
};
const MAT = { ash: 'hide_grey', heap: 'pottery_dark', shell: 'chalk', plate: 'hide_tan', bone: 'chalk', char: 'bark_dark', rim: 'earth_wall', stone: 'rock_boulder', hot: 'clay_robe', parcel: 'bark_birch', tie: 'rope_fibre', leaf: 'palm_leaf', mound: 'earth_wall', stick: 'wood_dark',
  slab: 'sandstone_yellow', dish: 'rock_boulder', muller: 'sandstone_white', sheet: 'roof_bark', flour: 'chalk', half: 'hide_tan', seed: 'hide_black',
  red: 'paint_minoan_red', yel: 'paint_ochre', wht: 'paint_white', redL: 'paint_minoan_red', yelL: 'paint_ochre', whtL: 'paint_white', cup: 'chalk', brush: 'wood_dark', tuft: 'hide_brown', roll: 'bark_birch', lash: 'rope_fibre',
  pole: 'wood_dark', paper: 'bark_birch', mat: 'reed_mat', fibre: 'rope_fibre', coil: 'rope_fibre', strip: 'wicker', bag: 'rope_fibre', cord: 'rope_fibre' };
/** el.kind: shells | oven | grind | ochre | bedframe | string; el.seed picks the variant (0–2; the oven 0 open, 1 closed). */
export function use(el, { bag }) {
  const put = placer(el, bag), kind = el.kind, v = (el.seed ?? 0) % 3;
  const A = assembly(`ka_use|${kind}|${v}`, (a) => KINDS[kind](a, v));
  for (const [role, g] of Object.entries(A)) put(MAT[role] ?? 'wood_dark', g.clone());
}

// ── the water's birds ──
/** A magpie goose (front along −z), 0.9 m at the head: white breast, belly and back, black head, neck, wings and tail, a hooked bill under a bony dome, orange legs. pose 0 stands, 1 grazes, 2 holds its neck up. */
function gooseShape(pose) {
  return assembly(`ka_goose|${pose}`, (a) => {
    a('w', blob(0.15, 0.15, 0.3, 0, 0.4, 0.0)); a('w', blob(0.1, 0.1, 0.12, 0, 0.43, -0.16));
    for (const s of [-1, 1]) { const g = blob(0.05, 0.085, 0.25, s * 0.125, 0.47, 0.06); g.rotateZ(s * 0.1); a('k', g); }
    a('k', blob(0.06, 0.03, 0.13, 0, 0.45, 0.31));
    const neck = pose === 1 ? [[0, 0.47, -0.2, 0.05], [0, 0.36, -0.34, 0.032], [0, 0.18, -0.46, 0.026], [0, 0.07, -0.5, 0.024]] : pose === 2 ? [[0, 0.5, -0.2, 0.05], [0, 0.72, -0.23, 0.032], [0, 0.95, -0.24, 0.026], [0, 1.02, -0.25, 0.024]] : [[0, 0.5, -0.2, 0.05], [0, 0.68, -0.27, 0.032], [0, 0.84, -0.3, 0.026], [0, 0.9, -0.31, 0.024]];
    const h = neck[neck.length - 1];
    a('k', tube(neck, 7)); a('k', blob(0.032, 0.034, 0.04, h[0], h[1], h[2] - 0.01)); a('k', blob(0.018, 0.022, 0.026, h[0], h[1] + 0.03, h[2] + 0.0));
    const dir = pose === 1 ? [0, -0.5, -0.86] : [0, -0.1, -0.99];
    a('b', tube([[h[0], h[1] - 0.005, h[2] - 0.03, 0.016, 0.014], [h[0] + dir[0] * 0.06, h[1] + dir[1] * 0.06 - 0.005, h[2] + dir[2] * 0.06 - 0.03, 0.014], [h[0] + dir[0] * 0.1, h[1] + dir[1] * 0.1 - 0.02, h[2] + dir[2] * 0.1 - 0.03, 0.004]], 6));
    for (const s of [-1, 1]) { a('l', rod([s * 0.05, 0.3, 0.02], [s * 0.055, 0.015, -0.02], 0.013, 5)); a('l', box(s * 0.055 - 0.04, 0, -0.1, s * 0.055 + 0.04, 0.012, 0.02)); }
  });
}
/** el.list: [x, z, y, rot, pose, s]. */
export function geese(el, { bag }) {
  const S = [gooseShape(0), gooseShape(1), gooseShape(2)];
  for (const [x, z, y, rot, pose, s] of el.list) {
    const put = placer({ t: 'ka_goose', at: [x, z], y, rot, s: s ?? 1 }, bag), A = S[pose ?? 0];
    put('hide_white', A.w.clone()); put('hide_black', A.k.clone()); put('hide_grey', A.b.clone()); put('terracotta', A.l.clone());
  }
}
/** A plumed whistling duck (front along −z), 0.55 m at the head: tan, a brown back, long pale plumes on the flanks, a long neck held up, grey legs; pose 1 sits low, its head turned back. */
function whistlerShape(pose) {
  return assembly(`ka_whistler|${pose}`, (a) => {
    const y = pose ? 0.1 : 0.27;
    a('t', blob(0.1, 0.1, 0.19, 0, y, 0)); a('t', blob(0.075, 0.08, 0.09, 0, y + 0.02, -0.13));
    a('d', blob(0.085, 0.045, 0.16, 0, y + 0.075, 0.03));
    for (const s of [-1, 1]) a('p', blob(0.012, 0.055, 0.15, s * 0.098, y + 0.03, 0.02));
    if (pose) { a('t', tube([[0, y + 0.08, -0.12, 0.034], [0, y + 0.15, -0.15, 0.026], [0.04, y + 0.17, -0.02, 0.026]], 6)); a('t', blob(0.03, 0.03, 0.035, 0.05, y + 0.17, 0.02)); a('g', rod([0.05, y + 0.165, 0.045], [0.05, y + 0.16, 0.085], 0.013, 4)); }
    else { a('t', tube([[0, y + 0.1, -0.13, 0.036], [0, y + 0.24, -0.17, 0.026], [0, y + 0.32, -0.18, 0.022]], 6)); a('t', blob(0.03, 0.03, 0.036, 0, y + 0.32, -0.2)); a('g', rod([0, y + 0.31, -0.23], [0, y + 0.3, -0.28], 0.014, 4)); for (const s of [-1, 1]) a('g', rod([s * 0.045, y - 0.05, 0.0], [s * 0.05, 0.012, -0.01], 0.011, 4)); }
  });
}
/** el.list: [x, z, y, rot, pose, s]. */
export function whistlers(el, { bag }) {
  const S = [whistlerShape(0), whistlerShape(1)];
  for (const [x, z, y, rot, pose, s] of el.list) {
    const put = placer({ t: 'ka_whistler', at: [x, z], y, rot, s: s ?? 1 }, bag), A = S[pose ? 1 : 0];
    put('hide_tan', A.t.clone()); put('hide_brown', A.d.clone()); put('hide_white', A.p.clone()); put('hide_grey', A.g?.clone() ?? rod([0, 0, 0], [0, 0.001, 0], 0.001, 3));
  }
}

// ── plants of the water's edge ──
const sedgeShape = (v) => assembly(`ka_sedge|${v}`, (a) => {
  const r = rng(2600 + v * 13);
  for (let k = 0; k < 24; k++) { const t = r() * 6.28, d = 0.03 + r() * 0.14, h = 0.55 + r() * 0.65, lean = 0.1 + r() * 0.25, x = Math.cos(t) * d, z = Math.sin(t) * d; a(k % 7 === 0 ? 'seed' : 'stem', rod([x, 0, z], [x + Math.cos(t) * lean * h, h, z + Math.sin(t) * lean * h], 0.006, 3)); }
});
/** Spike-rush and sedge standing in the shallows: list [x, z, y, s, rot]. */
export function sedge(el, { bag }) {
  for (const [x, z, y, s, rot] of el.list) {
    const put = placer({ t: 'ka_sedge', at: [x, z], y, rot, s }, bag), A = sedgeShape(Math.floor(rot * 5) % 3);
    put('papyrus', A.stem.clone()); if (A.seed) put('wicker', A.seed.clone());
  }
}
/** A sheet of paperbark come away and curled into a scroll on the ground: list [x, z, y, rot, s]. */
const scrollShape = () => assembly('ka_scroll', (a) => {
  const t = [], L = 0.5, R = 0.07, N = 8, P = (x, th, rr) => [x, rr * Math.sin(th) + 0.075, rr * Math.cos(th)];
  for (let i = 0; i < N; i++) {
    const t0 = 0.5 + i * 0.5, t1 = t0 + 0.5;
    for (const rr of [R, R - 0.007]) { const q = [P(-L / 2, t0, rr), P(L / 2, t0, rr), P(L / 2, t1, rr), P(-L / 2, t1, rr)]; for (const k of [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]) for (const j of k) t.push(...q[j]); }
  }
  a('s', fromTriangles(t));
});
export function barklitter(el, { bag }) {
  const A = scrollShape();
  for (const [x, z, y, rot, s] of el.list) placer({ t: 'ka_scroll', at: [x, z], y, rot, s }, bag)('bark_birch', A.s.clone());
}
