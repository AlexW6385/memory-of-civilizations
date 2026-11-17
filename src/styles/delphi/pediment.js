// The pediments and the roof figures of the Alcmaeonid temple of Apollo (docs/settlements/delphi.md §13.1). East: the arrival of Apollo — the
// forehalves of his four horses in the middle, three maidens (korai) on one side and three youths (kouroi) on the other, a pair of beasts
// (a lion with a bull, a lion with a stag) in each corner. West: a scene of the Gigantomachy. On the apex of each gable a winged Nike.
// Figures of Parian marble stand on the floor of the tympanum, each sized to the room under the raking cornice at its place.
// Elements of the style `delphi`:  delphi_pediment { x, dir, zc, half, y, rise, depth, programme ('east' | 'west') }  and
// nike_acroterion { at: [x, z], y, h, yaw }.
import { box } from '../../core/geom.js';
import { human, limb, blob, placed } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';

const STONE = 'marble_smooth';

/** The forehalf of a horse facing +z (out of the pediment), h to the tips of the ears, the barrel running back into the wall: chest, arched neck, head, mane, a foreleg raised. */
function foreHorse(h, mirror = false) {
  const sg = mirror ? -1 : 1, P = ([x, y, z]) => [sg * x * h, y * h, z * h], L = (a, b, r0, r1, n = 7) => limb(P(a), P(b), r0 * h, r1 * h, n), g = [];
  g.push(blob(P([0, 0.6, -0.2]), 0.3 * h, [0.62, 1.0, 1.15], 9));                                       // the chest and the barrel running into the wall
  g.push(L([0, 0.66, 0.0], [0, 0.9, 0.24], 0.15, 0.09), L([0, 0.9, 0.24], [0, 0.78, 0.4], 0.085, 0.045));   // the neck, arched, and the head bowed
  g.push(blob(P([0, 0.745, 0.435]), 0.052 * h, [0.85, 1.0, 1.0], 6));                                    // the muzzle
  for (const x of [-0.035, 0.035]) g.push(L([x, 0.95, 0.2], [x * 1.4, 1.0, 0.19], 0.02, 0.008, 4));      // the ears
  g.push(L([0, 0.96, 0.1], [0, 0.78, -0.05], 0.03, 0.04, 5));                                            // the mane along the neck
  g.push(L([0.085, 0.45, 0.03], [0.095, 0.4, 0.26], 0.07, 0.05), L([0.095, 0.4, 0.26], [0.1, 0.26, 0.36], 0.05, 0.035));   // the near foreleg raised and bent
  g.push(L([-0.085, 0.45, 0.03], [-0.09, 0.22, 0.12], 0.07, 0.05), L([-0.09, 0.22, 0.12], [-0.09, 0.0, 0.16], 0.05, 0.034));   // the other down to the floor
  g.push(blob(P([0.1, 0.25, 0.375]), 0.04 * h, [0.9, 0.7, 1.1], 5), blob(P([-0.09, 0.02, 0.19]), 0.04 * h, [0.9, 0.7, 1.1], 5));   // the hooves
  return { stone: g, metal: [] };
}

/** A beast lying along +x, facing +x, k its scale (a lion about 1.2 long, a bull 1.5, a stag 1.2 at k = 1): 'lion' | 'bull' | 'stag' | 'lion_up' (crouched high on the back of its prey). */
function beast(kind, k, up = 0) {
  const P = ([x, y, z]) => [x * k, (y + up) * k, z * k], L = (a, b, r0, r1, n = 6) => limb(P(a), P(b), r0 * k, r1 * k, n), B = (c, r, s, n = 7) => blob(P(c), r * k, s, n), g = [];
  if (kind === 'lion' || kind === 'lion_up') {
    g.push(B([0, 0.26, 0], 0.22, [1.55, 0.95, 0.9]), B([-0.38, 0.24, 0], 0.2, [1.05, 0.95, 0.95]));                // the barrel, the haunch
    g.push(B([0.45, 0.34, 0], 0.17, [1.0, 1.0, 1.0]), B([0.38, 0.36, 0], 0.24, [1.0, 1.0, 1.0], 8));              // the head, the mane about it
    g.push(B([0.55, 0.3, 0], 0.08, [1.3, 0.8, 0.9], 6));                                                         // the muzzle
    for (const z of [-0.14, 0.14]) g.push(L([0.28, 0.2, z], [0.56, 0.06, z * 1.2], 0.07, 0.05), L([-0.4, 0.2, z], [-0.52, 0.06, z * 1.1], 0.08, 0.05));
    g.push(L([-0.55, 0.26, 0], [-0.92, 0.12, 0.06], 0.035, 0.02, 5), B([-0.94, 0.12, 0.06], 0.045, [1, 1, 1], 5));   // the tail along the floor
  } else if (kind === 'bull') {
    g.push(B([0, 0.28, 0], 0.27, [1.6, 0.9, 0.95]), B([0.4, 0.34, 0], 0.2, [1.1, 1.05, 1.0]));                    // the body, the shoulders (hump)
    g.push(L([0.55, 0.34, 0], [0.74, 0.22, 0], 0.15, 0.1), B([0.82, 0.18, 0], 0.11, [1.25, 0.9, 0.9], 7), B([0.93, 0.15, 0], 0.06, [1, 0.8, 1], 5));   // the neck lowered, head, muzzle
    for (const z of [-0.08, 0.08]) g.push(L([0.76, 0.28, z], [0.8, 0.4, z * 1.9], 0.03, 0.012, 4));                // the horns
    for (const z of [-0.17, 0.17]) g.push(L([0.3, 0.18, z], [0.52, 0.04, z], 0.06, 0.04), L([-0.35, 0.2, z], [-0.5, 0.04, z], 0.07, 0.04));   // the legs folded under
    g.push(L([-0.62, 0.34, 0], [-0.72, 0.1, 0.05], 0.03, 0.02, 5));
  } else {
    g.push(B([0, 0.26, 0], 0.2, [1.5, 0.9, 0.85]), B([-0.3, 0.24, 0], 0.17, [1.0, 1.0, 0.95]));                   // a stag lying
    g.push(L([0.3, 0.3, 0], [0.5, 0.52, 0], 0.1, 0.06), B([0.56, 0.54, 0], 0.07, [1.35, 0.9, 0.85], 7));           // the neck raised, the head
    for (const z of [-0.04, 0.04]) { g.push(L([0.52, 0.6, z], [0.46, 0.84, z * 3], 0.016, 0.008, 4), L([0.46, 0.84, z * 3], [0.58, 0.98, z * 5], 0.012, 0.006, 4), L([0.5, 0.74, z * 2], [0.6, 0.82, z * 4], 0.01, 0.005, 4)); }   // antlers with their tines
    for (const z of [-0.12, 0.12]) g.push(L([0.22, 0.18, z], [0.42, 0.04, z], 0.05, 0.03), L([-0.28, 0.18, z], [-0.42, 0.04, z], 0.055, 0.03));
  }
  return g;
}

const avail = (el, reach) => Math.max(0.2, el.rise * (1 - reach / el.half) - 0.1);   // the height under the raking cornice at a distance from the middle

/** Where each figure is (u from the middle toward the viewer's right, m) and what it is, for the two gables. */
const EAST = (el) => {
  const out = [];
  // the four horses of the quadriga, the middle pair a little forward (their heads high), the outer pair beside
  for (const [u, hh, d] of [[-1.65, 2.05, 0.0], [-0.55, 2.4, 0.1], [0.55, 2.4, 0.1], [1.65, 2.05, 0.0]]) out.push({ kind: 'horse', u, H: Math.min(hh, avail(el, Math.abs(u) + 0.35)), d, mirror: u < 0 });
  // three maidens on the viewer's left, three youths on the right, standing in a row, growing smaller toward the corners
  for (let i = 0; i < 3; i++) {
    const um = 3.45 + i * 1.2;
    out.push({ kind: 'kore', u: -um, H: Math.min(1.85 - i * 0.12, avail(el, um + 0.3)) });
    out.push({ kind: 'kouros', u: um, H: Math.min(1.9 - i * 0.12, avail(el, um + 0.3)) });
  }
  // the corner groups: a lion seizing a bull on the left, a lion seizing a stag on the right
  for (const s of [-1, 1]) { const um = 8.55, k = Math.min(0.62, avail(el, um + 0.85) / 0.75); out.push({ kind: 'group', u: s * um, k, prey: s < 0 ? 'bull' : 'stag', s }); }
  return out;
};
const WEST = (el) => {
  const out = [], F = (f) => f * el.half;
  const add = (f, o) => { const u = F(f), top = o.top ?? 1.0, half = o.half ?? 0.2; let H = o.H; for (let k = 0; k < 3; k++) { const reach = Math.abs(u) + (o.pose === 'fallen' ? 0 : half * H * 0.8); H = Math.min(o.H, avail(el, reach) / top); } out.push({ kind: 'giant', u, ...o, H }); };
  // the gods strike toward the corners from the middle; the beaten giants lie at the feet of the gods and in the corners
  add(0.0, { pose: 'stride', drape: 'nude', H: 2.3, top: 1.5, half: 0.33, spear: 'r', spearDir: [0.25, 1, 0] });                                      // Zeus, the thunderbolt raised
  add(-0.2, { pose: 'stride', drape: 'peplos', mirror: true, helmet: true, shield: 'r', H: 2.4, top: 1.3, half: 0.33 });                              // Athena
  add(0.2, { pose: 'stride', drape: 'chiton', H: 2.3, top: 1.3, half: 0.33 });                                                                         // Apollo
  add(-0.4, { pose: 'stride', drape: 'nude', mirror: true, spear: 'r', spearDir: [0.2, 1, 0], H: 2.1, top: 1.3, half: 0.33 });                         // Herakles
  add(0.4, { pose: 'stride', drape: 'nude', trident: true, H: 2.1, top: 1.3, half: 0.33 });                                                            // Poseidon
  add(-0.62, { pose: 'fallen', drape: 'nude', mirror: true, H: 1.7, top: 0.62, half: 0.5 });
  add(0.62, { pose: 'fallen', drape: 'nude', H: 1.7, top: 0.62, half: 0.5 });
  add(-0.85, { pose: 'fallen', drape: 'nude', mirror: true, H: 1.3, top: 0.62, half: 0.5 });
  add(0.85, { pose: 'fallen', drape: 'nude', H: 1.3, top: 0.62, half: 0.5 });
  return out;
};

function pedimentFigures(el, { bag }) {
  const dir = el.dir, yaw = dir > 0 ? Math.PI / 2 : -Math.PI / 2, toZ = (u) => (dir > 0 ? el.zc - u : el.zc + u), xAt = (d) => el.x + dir * (el.depth * 0.5 + d);
  const put = (fig, d, u) => { const p = placed(fig, xAt(d), el.y, toZ(u), yaw); if (p.stone) bag.add(STONE, p.stone); if (p.metal) bag.add('bronze', p.metal); };
  const draped = (o) => human({ n: 8, ...o });
  for (const f of el.programme === 'east' ? EAST(el) : WEST(el)) {
    if (f.kind === 'horse') put(foreHorse(f.H, f.mirror), f.d, f.u);
    else if (f.kind === 'kore') put(draped({ pose: 'stand', drape: 'peplos', h: f.H, hair: 'rope', arms: { l: [[-0.15, 0.62, 0.04], [-0.17, 0.6, 0.15]], r: [[0.16, 0.66, 0.05], [0.2, 0.7, 0.12]] } }), 0.05, f.u);
    else if (f.kind === 'kouros') put(draped({ pose: 'stand', drape: 'nude', h: f.H, arms: { l: [[-0.14, 0.62, 0.02], [-0.15, 0.46, 0.04]], r: [[0.14, 0.62, 0.02], [0.15, 0.46, 0.04]] } }), 0.05, f.u);
    else if (f.kind === 'giant') put(draped({ pose: f.pose, drape: f.drape, h: f.H, mirror: f.mirror, helmet: f.helmet, shield: f.shield, spear: f.spear, spearDir: f.spearDir, trident: f.trident }), 0, f.u);
    else if (f.kind === 'group') {
      // the lion across the back of the prey, both lying along the floor and facing the middle: +x of the beast runs toward the middle
      const face = f.s < 0 ? 1 : -1;                            // direction in u the beasts face
      const zdir = dir > 0 ? -face : face;                      // the world z direction of +x
      const by = zdir > 0 ? -Math.PI / 2 : Math.PI / 2;
      const body = beast(f.prey, f.k), cat = beast('lion_up', f.k * 0.9, f.prey === 'bull' ? 0.3 : 0.12);
      const p = placed({ stone: [...body, ...cat] }, xAt(0.0), el.y, toZ(f.u), by);
      if (p.stone) bag.add(STONE, p.stone);
    }
  }
}

/** nike_acroterion: { at: [x, z], y (the foot of the plinth), h (the Nike), yaw (where she faces) } — a winged Victory running out over the gable's apex on her plinth. */
function nikeAcroterion(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, h = el.h ?? 2.0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const W = (u, v) => [x + u * c + v * s, z - u * s + v * c];                          // u across the gable, v out
  const q = [W(-0.55, -0.4), W(0.55, 0.4)], r = [Math.min(q[0][0], q[1][0]), Math.min(q[0][1], q[1][1]), Math.max(q[0][0], q[1][0]), Math.max(q[0][1], q[1][1])];
  bag.add('marble', box(r[0], y - 0.25, r[1], r[2], y + 0.5, r[3]));                    // the plinth, its foot sunk in the sima's top
  const f = human({ pose: 'ease', drape: 'chiton', h, n: 8, hair: 'rope', arms: { l: [[-0.17, 0.62, 0.06], [-0.2, 0.5, 0.2]], r: [[0.18, 0.7, 0.08], [0.24, 0.78, 0.2]] } });
  // the wings, spread to both sides behind her shoulders: long feathers fanned from the wing's root
  const wing = [];
  for (const sd of [-1, 1]) for (let k = 0; k < 7; k++) {
    const a = (0.28 + k * 0.16) * sd, len = (0.66 - k * 0.045) * h, root = [sd * 0.12 * h, 0.78 * h, -0.07 * h];
    wing.push(limb(root, [root[0] + Math.sin(a) * len, root[1] + Math.cos(a) * len * (k < 4 ? 1 : 0.7) - k * 0.02 * h, root[2] - 0.05 * h - k * 0.006 * h], 0.036 * h, 0.012 * h, 4));
    if (k < 4) wing.push(blob([root[0] + Math.sin(a) * len * 0.4, root[1] + Math.cos(a) * len * 0.4, root[2] - 0.03 * h], 0.05 * h, [1, 1.4, 0.5], 5));
  }
  f.stone.push(...wing);
  const p = placed(f, x, y + 0.5, z, yaw);
  bag.add(STONE, p.stone); if (p.metal) bag.add('gilt_bronze', p.metal);
  col.rect(r, y - 0.2, y + 0.5);
  void merge;
}

export const PEDIMENTS = { delphi_pediment: pedimentFigures, nike_acroterion: nikeAcroterion };
