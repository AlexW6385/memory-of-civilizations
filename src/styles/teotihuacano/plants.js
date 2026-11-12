// Teotihuacan's maguey and nopal with a distance ladder (maya/plants.js is shared and read-only): the full
// plants (some 1.1 k triangles a maguey) only within ~90 m, a coarse silhouette of each out to 190 m.
// The thousands of plants of the compounds' walls and the open plots made over 6 M triangles at the arrival.
import { lathe } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { maguey, nopal } from '../maya/plants.js';

const NEAR = 90, FAR = 190;
let COARSE = null;
function coarse() {
  // a rosette: a low dome of leaves, a spiky heart; a nopal: a bushy mound of pads on a stem
  return COARSE || (COARSE = {
    maguey: lathe([[0.001, 1.3], [0.22, 1.05], [0.8, 0.75], [1.28, 0.3], [1.34, 0.12], [0.6, 0.04]], 7),
    nopal: lathe([[0.001, 1.85], [0.5, 1.55], [0.85, 1.0], [0.75, 0.45], [0.2, 0.3]], 6),
  });
}
/** The shared planters through a bag that gives their parts a short reach and leaves out the small ones (spines, fruit). */
function near(bag) {
  if (!bag.addInstance) return bag;
  return { addInstance: (mat, g, m, o) => { if (mat === 'bark_dark' || mat === 'stucco_red' || mat === 'paint_ochre') return; bag.addInstance(mat, g, m, { ...o, reach: mat === 'bark_grey' ? 50 : NEAR }); }, add: (mat, g) => bag.add(mat, g) };
}

/** meso_plants { plants: [[kind ('maguey' | 'nopal'), x, z, y, s, yaw, v]] } (the shared element's form). */
export function ttPlants(el, { bag, col }) {
  const nb = near(bag), C = bag.addInstance ? coarse() : null;
  for (const [kind, x, z, y, s, yaw, v] of el.plants) {
    (kind === 'nopal' ? nopal : maguey)(nb, el.collide === false ? null : col, x, y, z, s, yaw, v % 2);
    if (C) bag.addInstance(kind === 'nopal' ? 'palm_leaf' : 'clay_green', C[kind].clone(), new Matrix4().makeRotationY(yaw).scale(new Vector3(s, s, s)).setPosition(x, y, z), { reach: FAR });
  }
}
