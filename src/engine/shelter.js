// Is the eye under a roof? A pure look-up in a site's top fields (src/core/collide.js topField: the
// highest surface over each cell): the eye is sheltered when a top lies more than HEAD metres above
// it over the eye's own cell and over RING metres round it on every side. Rooms are listed in the
// plans with gaps and a few kinds of cover (a loggia, an arcade, a porch) are no room at all, so the
// rain, which only asked the room list, fell indoors; this asks the geometry.

const HEAD = 0.5, RING = 1.5, OFFS = [[0, 0], [RING, 0], [-RING, 0], [0, RING], [0, -RING]];

/** tops: a collision world's top fields ({ x0, z0, res, w, h, data }[]); (x, y, z): the eye. */
export function underRoof(tops, x, y, z) {
  if (!tops?.length) return false;
  for (const [dx, dz] of OFFS) {
    const px = x + dx, pz = z + dz;
    if (!tops.some((T) => {
      const i = Math.floor((px - T.x0) / T.res), j = Math.floor((pz - T.z0) / T.res);
      return i >= 0 && j >= 0 && i < T.w && j < T.h && T.data[j * T.w + i] > y + HEAD;
    })) return false;
  }
  return true;
}

/** Rain, snow and dust fall on the visitor: not in a closed room, not under a roof. Asked a few times a second, not every frame. */
export function openToSky(here, tops, x, y, z) {
  return (!here.room || here.room.kind === 'open') && !underRoof(tops, x, y, z);
}
