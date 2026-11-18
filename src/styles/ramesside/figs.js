// The elements of the modelled sculpture (sculpted.js, kadesh2.js) for the plans that show them by distance (src/settlements/abu-simbel/sculpt.js):
// the fine additions of the figures within a few metres, the captives of the thrones' bases, the Battle of Kadesh. The same figures in their volumes
// are built into the temple's own plan (great.js).
import { standing, Kit } from './fig.js';
import { osiride, seatedGod, raNiche, royal, captive } from './sculpted.js';
import { kadesh } from './kadesh2.js';

export function sculptFig(el, { bag }) {
  const [x, z] = el.at, F = standing(x, el.y ?? 0, z, el.yaw ?? 0, el.k ?? 1);
  if (el.kind === 'osiride') osiride(F, el.crown, !!el.fine);
  else if (el.kind === 'god') seatedGod(F, el.god, !!el.fine);
  else if (el.kind === 'ra') raNiche(F, !!el.fine);
  else if (el.kind === 'royal') royal(F, el.who, !!el.fine);
  F.flush(bag);
}

/** The captives on the two sides of a colossus' throne (its own frame: the façade's x0, the axis z), eight to a side, Nubians and Asiatics in turn. */
export function captives(el, { bag }) {
  const { x0, zc, y = 0.62 } = el;
  for (const s of [-1, 1]) {
    // the side face of the throne at local x = s·3.5 (local → world: x0 − lz, zc + lx); the viewer's right along the face is (s, 0) in the world
    const K = (lz) => new Kit([x0 - lz, y, zc + s * 3.5], [s, 0, 0], [0, 1, 0], [0, 0, s], 1, { flat: 0.3, clip: true, jit: 0 });
    for (let i = 0; i < 8; i++) {
      const lz = -4.0 + i * 0.75, F = K(lz);
      captive(F, (i + (s > 0 ? 1 : 0)) % 2 ? 'nubian' : 'asiatic'); F.flush(bag);
    }
  }
}

/** The Battle of Kadesh on the north wall: x the wall's start (the door end), y the floor, z the wall's face. */
export function kadeshWall(el, { bag }) {
  const K = new Kit([el.x, el.y + el.v0, el.z + 0.006], [-1, 0, 0], [0, 1, 0], [0, 0, 1], 1, { clip: true, jit: 0 });
  kadesh(K, el.W, el.H); K.flush(bag);
}
