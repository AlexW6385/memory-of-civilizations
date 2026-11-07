// Render layers: what the camera sees and what each sun shadow cascade draws (src/engine/renderer.js).
// Shadow casters are chosen by size per cascade (DESIGN §8): the small things in the first cascade
// only, the middle-sized in the first two, only the big masses in the third, whose texels are a
// third of a metre wide and whose shadows lie 120–320 m off.

/** Small things (street life, fine detail, rods and bars): the camera, and the first cascade. */
export const SMALL = 2;

/** (Unused: a mask of layer 0 alone would be taken by three for "unset" and replaced by the camera's.) */
export const SPARE = 3;

/** Shadow casters the camera does not see, drawn into every cascade. */
export const SHADOW = 4;

/** Middle-sized pieces (under MID_SIZE, src/core/geom.js), and meshes holding some: the camera,
 *  and the first two cascades. A merged mesh's big pieces cast into the third through a sibling
 *  on FAR_SHADOW (src/engine/merge.js). */
export const MID = 5;

/** Shadow casters the camera does not see, drawn into the first two cascades (the coarse copies of
 *  fine pieces, merge.js LodSet). */
export const NEAR_SHADOW = 6;

/** Shadow casters the camera does not see, drawn into the third cascade only: the big pieces of a
 *  merged mesh on MID (the same vertices and index, a shorter draw range). */
export const FAR_SHADOW = 7;

/** The layers the camera sees. */
export const CAMERA_MASK = 1 | (1 << SMALL) | (1 << MID);

/** The layers cascade i of n draws (with fewer than three cascades the last one draws the middle
 *  things too, and FAR_SHADOW is never drawn: the mesh on MID holds every piece). */
export function cascadeMask(i, n = 3) {
  if (i === 0) return 1 | (1 << SMALL) | (1 << SHADOW) | (1 << MID) | (1 << NEAR_SHADOW);
  if (i === 1 || n < 3) return 1 | (1 << SPARE) | (1 << SHADOW) | (1 << MID) | (1 << NEAR_SHADOW);
  return 1 | (1 << SPARE) | (1 << SHADOW) | (1 << FAR_SHADOW);
}
