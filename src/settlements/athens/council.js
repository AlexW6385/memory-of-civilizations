// The Council house of the Agora (docs/settlements/athens.md §24): the hall in which the Council of Five Hundred sat, opened to the visitor.
// Elements of the greek style only (wall, column, beam, coffers, pediment_roof, block, stair); returned as plain elements for plan.js.

export const COUNCIL = [-271, -186, -253, -166];                // x0, z0, x1, z1: 18 m east–west, 20 m north–south; the door in the east wall, to the Agora
export const COUNCIL_DOOR = [-250, -176];                      // the walker's start before the door (the route of walk.js)

export function council() {
  const E = [], [x0, z0, x1, z1] = COUNCIL, y = 0, yf = y + 0.35, h = 6.4, w = 0.8, zc = (z0 + z1) / 2;
  E.push({ t: 'block', rect: [x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y0: y - 0.4, y1: yf, mat: 'limestone', walk: true });
  E.push({ t: 'stair', rect: [x1 + 0.5, zc - 1.6, x1 + 1.5, zc + 1.6], dir: 'w', y0: y, y1: yf, riser: 0.175, base: y - 0.3, mat: 'limestone' });
  E.push({ t: 'athens_stairwear', rect: [x1 + 0.5, zc - 1.6, x1 + 1.5, zc + 1.6], dir: 'w', y0: y, y1: yf, riser: 0.175, wear: 'sandstone_white' });
  // the walls: mud-brick on a stone course, plastered [inferred]; the door 2.4 m wide, 3.6 m high, in the middle of the east wall
  const mat = 'mud_plaster', D = { at: (z1 - z0) / 2, w: 2.4, h: 3.6, y0: yf };
  E.push({ t: 'wall', a: [x1 - w / 2, z0], b: [x1 - w / 2, z1], th: w, y0: yf, y1: yf + h, mat, openings: [D] });
  E.push({ t: 'wall', a: [x0 + w / 2, z0], b: [x0 + w / 2, z1], th: w, y0: yf, y1: yf + h, mat });
  for (const z of [z0 + w / 2, z1 - w / 2]) E.push({ t: 'wall', a: [x0 + w, z], b: [x1 - w, z], th: w, y0: yf, y1: yf + h, mat });
  for (const [a, b] of [[[x0, z0 + w / 2], [x1, z0 + w / 2]], [[x0, z1 - w / 2], [x1, z1 - w / 2]]]) E.push({ t: 'wall', a, b, th: w + 0.02, y0: yf, y1: yf + 0.6, mat: 'limestone' });   // the stone course
  // the benches of the Five Hundred: rows of wooden tiers rising to the wall on the north, west and south (the east is the door), 0.3 m a row [inferred]
  const R = 4, rw = 0.85, o = (j) => w + rw * j;
  for (let j = 0; j < R; j++) {
    const top = yf + 0.3 * (R - j), a = o(j), b = o(j + 1);
    E.push({ t: 'block', rect: [x0 + a, z0 + a, x1 - w, z0 + b], y0: yf, y1: top, mat: 'cedar', walk: true });
    E.push({ t: 'block', rect: [x0 + a, z1 - b, x1 - w, z1 - a], y0: yf, y1: top, mat: 'cedar', walk: true });
    E.push({ t: 'block', rect: [x0 + a, z0 + b, x0 + b, z1 - b], y0: yf, y1: top, mat: 'cedar', walk: true });
  }
  // four timber columns carry the roof beams [inferred: after the New Bouleuterion's four]
  for (const cx of [x0 + 8.2, x0 + 13.6]) for (const s of [-1, 1]) E.push({ t: 'column', at: [cx, zc + s * 3.9], y: yf, h, d: 0.55, mat: 'cedar', flutes: 0 });
  for (const s of [-1, 1]) E.push({ t: 'beam', a: [x0 + w, zc + s * 3.9], b: [x1 - w, zc + s * 3.9], y: yf + h - 0.2, w: 0.5, h: 0.7, mat: 'cedar' });
  E.push({ t: 'coffers', rect: [x0 + w, z0 + w, x1 - w, z1 - w], y: yf + h + 0.5, depth: 0.22, cell: 1.5, beam: 0.18, mat: 'cedar' });
  E.push({ t: 'pediment_roof', rect: [x0 - 0.45, z0 - 0.45, x1 + 0.45, z1 + 0.45], y: yf + h + 1.2, rise: 2.6, tympanumInset: 0.3, rakingGeison: 0.3, mat: 'mud_plaster', tileMat: 'roof_tile', ridge: 'x' });
  // the altar of Hestia of the Council, with its fire, on the floor before the tiers; a table of the prytaneis [inferred from the Council's cults; docs §24]
  const ax = x0 + 11.0;
  E.push({ t: 'block', rect: [ax - 0.6, zc - 0.6, ax + 0.6, zc + 0.6], y0: yf, y1: yf + 0.7, mat: 'limestone' });
  E.push({ t: 'block', rect: [ax - 0.72, zc - 0.72, ax + 0.72, zc + 0.72], y0: yf + 0.7, y1: yf + 0.78, mat: 'limestone' });
  E.push({ t: 'athens_flame', at: [ax, yf + 1.0, zc], floor: yf, intensity: 2.6, distance: 9 });
  return E;
}
