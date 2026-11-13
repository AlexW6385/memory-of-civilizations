// Who is at home and what lights the room (docs/settlements/thebes.md §6.5): the clay oil lamp on its stand with its small flame and
// the point of light it gives, and the people of an entered house — the woman kneeling at the oven or the quern, the man sitting on
// his mat, the shopkeeper behind his counter, the master of a villa on the raised seat of his hall. Local frame of a house: u along the
// street, v from the street into the lot (houses.js frame()).
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';

/**
 * A lamp on a stand: a clay foot, a thin shaft, a shallow bowl with its wick and flame, and one light (a warm orange point, 7 m).
 * (u, v, y) is where the foot stands; h the stand's height (0 for a lamp set on a bench or a platform).
 */
export function lamp(F, ctx, u, y, v, h = 0.9, intensity = 2.4) {
  const x = F.X(u), z = F.Z(v);
  if (h > 0.2) {
    F.bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.01], [0.13, 0.06], [0.05, 0.14], [0.035, h - 0.1], [0.07, h - 0.04], [0.09, h]], 9, null, x, y, z));
    F.col.circle(x, z, 0.13, y, y + h);
  }
  F.bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.04], [0.095, 0.06], [0.001, 0.05]], 9, null, x, y + h, z));
  F.bag.add('flame', lathe([[0.001, 0.05], [0.025, 0.07], [0.001, 0.14]], 6, null, x + 0.06, y + h, z));
  ctx.lights.push({ at: [x, y + h + 0.3, z], color: '#ffb46b', intensity, distance: 7 });
}

/**
 * A person at home. o: { u, v (the place in the house's frame), face: [du, dv] (the direction looked in, in the same frame), who ('man' | 'woman' | 'child' | 'elder'),
 * pose, y, seed, carry }. The dress is the Thebans': the white kilt of the man, the long sheath and hair of the woman.
 */
export function person(F, ctx, o) {
  const [du, dv] = o.face ?? [0, -1], dx = du, dz = F.sg * dv, who = o.who ?? 'man', woman = who === 'woman', kid = who === 'child';
  STYLES.life.elements.figure({
    t: 'figure', at: [F.X(o.u), F.Z(o.v)], y: o.y ?? 0.03, rot: Math.atan2(-dx, -dz), seed: o.seed ?? 1, child: kid,
    dress: woman ? 'sheath' : kid ? 'wrap' : 'shendyt', top: 'bare', over: woman || kid ? 'none' : who === 'elder' ? 'shawl' : 'none',
    cloth: o.cloth ?? (woman ? 'cloth_white' : 'linen'), cloth2: 'cloth_ochre', skin: 'skin_medium', hat: 'none',
    hair: woman ? 'long' : who === 'elder' ? 'shaven' : 'short', hairMat: 'hair_dark', feet: 'bare', carry: o.carry ?? 'none', pose: o.pose ?? 'stand', h: woman ? 1.52 : undefined,
  }, ctx);
}
