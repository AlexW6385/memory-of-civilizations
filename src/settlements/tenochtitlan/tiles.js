// The houses in tiles of `size` metres, each built twice (in full, and the simple far form): src/settlements/lod.js, with the tile size
// a parameter (docs/settlements/tenochtitlan.md §20: 150 m tiles hold the mesh count; lod.js's 100 m tiles made thirty near plans of
// fifty materials each). A tile is shown in full while the visitor is within `near` of its middle, in the far form beyond.

/** Plans for `elements` (each with a rect or at/c) of `style`, tiled by `size` and in two levels; `near` in metres. `extra(k, i, j)` may give more elements for a tile's full form only. */
export function tiles(id, style, elements, { size = 150, near = 190, R = 400, entrance = { at: [0, 0], facing: 'n' }, extra = null } = {}) {
  const by = new Map(), key = (x, z) => `${Math.floor(x / size)},${Math.floor(z / size)}`;
  for (const e of elements) {
    const [x, z] = e.rect ? [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2] : (e.at ?? e.c);
    const k = key(x, z);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(e);
  }
  if (extra) for (const [k, list] of extra(key)) { if (!by.has(k)) by.set(k, []); by.get(k).push(...list.map((e) => ({ ...e, only: true }))); }
  const plans = [];
  for (const [k, list] of by) {
    const [i, j] = k.split(',').map(Number), center = [(i + 0.5) * size, (j + 0.5) * size];
    const base = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-R, -R, R, R], entrance, center };
    plans.push({ ...base, id: `${id}-${k}`, near, elements: list.map(({ only, ...e }) => e) });
    const far = list.filter((e) => !e.only);
    if (far.length) plans.push({ ...base, id: `${id}-${k}-far`, far: near, elements: far.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
