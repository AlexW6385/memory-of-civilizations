// Townscapes in two levels of detail (DESIGN §3.3, §8): the houses of a settlement cut into 100 m
// tiles, each tile built twice — in full (windows with their surrounds and shutters, eaves on their
// brackets, chimneys) for when one is near, and simple (walls, roof, the main openings) for when one
// is far. The world shows one or the other by the distance to the tile (src/engine/world.js).

/** Plans for `elements` (each with a rect or at/c) of `style`, tiled and in two levels; `near` in metres. */
export function lodTiles(id, style, elements, { near = 220, R = 460, entrance = { at: [0, 0], facing: 'n' } } = {}) {
  const tiles = new Map();
  for (const e of elements) {
    const [x, z] = e.rect ? [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2] : (e.at ?? e.c);
    const k = `${Math.floor(x / 100)},${Math.floor(z / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), center = [i * 100 + 50, j * 100 + 50];
    const base = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-R, -R, R, R], entrance, center };
    plans.push({ ...base, id: `${id}-${k}`, near, elements: list });
    plans.push({ ...base, id: `${id}-${k}-far`, far: near, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
