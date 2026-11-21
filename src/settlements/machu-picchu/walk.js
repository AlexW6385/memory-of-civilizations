// Machu Picchu — the visitor's walk (docs/settlements/machu-picchu.md §13). Pure data and one distance function (layout.js reads nothing from here;
// town.js and walkroutes.js read it to open the places on it). From the Guardhouse's knoll down its stair, along the way in (the fields, the dry ditch,
// the main gate, the flagged road) to the Main Plaza, then west to the Sacred Plaza and east to the kallanka.
export const ARRIVAL = [-21, 129.8];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-21, 129.8], [-24, 127], [-24, 104], [2, 104]],      // down the knoll's stair, across the fields to the road
  [[2, 124], [2, 14]],                                   // the way in: the fields, the ditch's stairs, the main gate, the flagged road
  [[2, 14], [2, -26], [22, -24]],                        // the Main Plaza, across to the kallanka's middle door
  [[2, -24], [-14, -24], [-40, -36]],                    // west to the Sacred Plaza's temples
  [[-12, 12], [-21, 15.5]],                              // the Torreon's stair
];
/** How far from the walk a place's gate may lie to be opened. */
export const WALK_REACH = 25;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The measures of a door opened for the visitor: 1.7 m wide, 2.2 m to the lintel's underside (the walker is 1.6 m clear and a head's height under it). */
export const OPEN_DOOR = { w: 1.7, h: 2.2 };
/** Open houses stand at least this high, so the lintel stone fits over the taller door. */
export const OPEN_WALL_H = 2.8;

/** The fires of the night (nightlight.js; docs §14): torches at the gates of the state's buildings, braziers at the shrine and the runners' post. { at: [x, z], kind, y? (the floor, if not the ground) } */
export const FIRES = [
  { at: [-0.5, 79.8] }, { at: [4.5, 79.8] },                              // the main gate, behind the guards
  { at: [-0.3, 9.6] }, { at: [4.3, 9.6] },                                // the head of the road, at the plaza's stair
  { at: [-47.3, -40.4] }, { at: [-36.7, -40.4] }, { at: [-38.6, -50.6], kind: 'brazier', y: 0.6 },   // the Main Temple's front, its altar's brazier
  { at: [-40.4, 0.2] }, { at: [-40.4, 4.2] },                             // the royal residence's door
  { at: [23.9, -28.7] }, { at: [23.9, -21.9] },                           // the kallanka's front, between its doors
  { at: [4.3, 118.4], kind: 'brazier' },                                  // the chaski's post
];
/** The plaza's feast: its centre and floor; the knoll's brazier (x, z, floor): the positions of the fires in dress.js. */
export const FEAST = [4, -24, -3];
export const GUARD_BRAZIER = [-24 + 2.2, 138 - 1.8, 17.6];
/** A house with its hearth lit (and its doorway glowing at night): within 140 m of the arrival or 45 m of the walk. */
export const litHouse = (h) => { const c = [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2]; return Math.hypot(c[0] - ARRIVAL[0], c[1] - ARRIVAL[1]) < 140 || walkDistance(c) < 45; };
