// Ming–Qing Beijing — placed copies of a few built shapes. The dressing of the lanes and of the court was built per place, as geometry of
// its own merged into the tile's meshes; here a shape is built once per variant (a Parts, one geometry per material) and put in each place
// as an instance (GeoBag.addInstance), so the engine holds one prototype, gathers the copies settlement-wide and draws them by distance
// (src/engine/life-instances.js). Elements of the style 'life' only (the bag draws them as instances always); in other bags the copies
// are merged as before.
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { Parts } from '../../styles/qing/carving.js';
import { merge } from '../../objects/kit.js';

const SHAPES = new Map();
const _q = new Quaternion(), _up = new Vector3(0, 1, 0), _p = new Vector3(), _s = new Vector3();

/** The shape of this key: [[material, geometry]…], built once by build(Parts) at its own origin (y up, facing +z). */
export function shape(key, build) {
  let e = SHAPES.get(key);
  if (!e) {
    const P = new Parts();
    build(P);
    e = [...P.m].map(([mat, list]) => [mat, merge(list)]);
    SHAPES.set(key, e);
  }
  return e;
}

/** Put a copy of the shape at (x, y, z), turned yaw about y (as Parts.emit); `reach` (m): how far off it is still drawn. */
export function put(bag, e, x, y, z, yaw = 0, reach = 130, s = 1) {
  const M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, yaw), _s.set(s, s, s));
  for (const [mat, g] of e) {
    if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach });
    else bag.add(mat, g.clone().applyMatrix4(M));
  }
}
