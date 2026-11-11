// The dimensions of the two rock-cut temples of Abu Simbel (docs/settlements/abu-simbel.md §3–§4) as pure data, shared by the
// style's builders and by the settlement's layout and plan. Plan frame: +x east (the façade faces east, toward the Nile), +z south;
// a room's "depth" d is the distance into the rock from the façade's foot, x = fx − d. Floors rise a little toward the sanctuary.

export const FLOOR = 0.04;
const R = (name, d0, d1, zh, y0, y1, kind = 'hall') => ({ name, d0, d1, zh, y0, y1, kind });

/** The Great Temple's rooms (all axial rooms centred on z = zc): the door passage and the pillared halls, to the sanctuary. */
export function greatRooms() {
  const F0 = FLOOR, F1 = F0 + 0.4, F2 = F0 + 0.8, F3 = F0 + 1.2;
  return [
    R('door', 0, 8, 1.8, F0, 6.9, 'pass'),
    R('hall of the Osiride pillars', 8, 26, 8.35, F0, 9.9),
    R('passage to the second hall', 26, 30, 1.8, F0, 5.8, 'pass'),
    R('second pillared hall', 30, 41, 3.5, F1, 7.4),
    R('passage to the vestibule', 41, 45, 1.8, F1, 5.6, 'pass'),
    R('vestibule', 45, 49.5, 4.6, F2, 6.4),
    R('passage to the sanctuary', 49.5, 54.5, 1.7, F2, 5.0, 'pass'),
    R('sanctuary', 54.5, 61.7, 2.0, F3, 4.6),
  ];
}
/** The side chambers: { d0, d1, z0, z1 (distance from the axis, both sides), y0, y1, door: [d0, d1, h] } — four off the first hall, two off the vestibule. */
export function greatChambers() {
  const F0 = FLOOR, F2 = F0 + 0.8;
  return [
    { d0: 9.5, d1: 12.5, z0: 9.25, z1: 13.45, y0: F0, y1: 4.1, door: [10.1, 11.9, 2.9], from: 8.35 },
    { d0: 21.5, d1: 24.5, z0: 9.25, z1: 13.45, y0: F0, y1: 4.1, door: [22.1, 23.9, 2.9], from: 8.35 },
    { d0: 45.8, d1: 48.8, z0: 5.5, z1: 8.9, y0: F2, y1: 3.6, door: [46.5, 48.1, 2.7], from: 4.6 },
  ];
}
/** Hall 1's pillars (d of their centres) and their size; hall 2's. */
export const HALL1 = { pillars: [10.7, 14.8, 18.9, 23.0], w: 2.0, z0: 3.8, z1: 5.8, statueZ: 4.0, H: 9.9 };
export const HALL2 = { pillars: [33.5, 37.5], w: 1.1, z: 1.9, H: 7.4 };

/** The Small Temple's rooms. */
export function smallRooms() {
  const F0 = FLOOR;
  return [
    R('door', 0, 5, 1.1, F0, 4.6, 'pass'),
    R('hall of the Hathor pillars', 5, 14.8, 4.1, F0, 5.4),
    R('passage to the vestibule', 14.8, 16.8, 1.1, F0, 4.2, 'pass'),
    R('vestibule', 16.8, 20, 3.6, F0 + 0.2, 4.6),
    R('passage to the sanctuary', 20, 21.5, 1.0, F0 + 0.4, 3.8, 'pass'),
    R('sanctuary of Hathor', 21.5, 25.2, 1.8, F0 + 0.4, 3.8),
  ];
}
export const SMALL_PILLARS = { d: [6.2, 8.6, 11.0], z: 2.1, w: 1.0 };
export const SMALL_CHAMBERS = [{ d0: 17.2, d1: 19.6, z0: 4.4, z1: 7.0, y0: FLOOR + 0.2, y1: 3.4, door: [17.9, 18.9, 2.6], from: 3.6 }];
/** Façade of the Small Temple: half-width, the niches [centre z, kind, crown], the buttress and niche widths. */
export const SMALL_FACADE = { half: 14.1, H: 12.4, lean: 0.9, niche: 2.6, top: 11.4, niches: [[3.75, 'king'], [7.95, 'queen'], [12.15, 'king']], nw: 3.1, bw: 1.1, door: 1.1 };
export const GREAT_FACADE = { half: 19.1, H: 31, lean: 2.4, door: 1.8, doorH: 6.9, cornice: 1.4, colossi: [-13.7, -5.9, 5.9, 13.7] };

// ── the cliff along the west bank (docs/settlements/abu-simbel.md §2) ──
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const FX = -40, FXS = -34, ZS = -112;
/** x of the cliff's face at z: along the Great Temple's front at FX, standing out to FXS by the Small Temple. */
export const cliffFace = (z) => FX + (FXS - FX) * sm(-170, -135, z) * (1 - sm(-89, -55, z));
const PROFILE = [[-200, 0], [-165, 6], [-140, 24], [-128, 36], [-96, 34], [-60, 44], [-30, 54], [-20, 58], [20, 58], [40, 54], [80, 40], [110, 18], [135, 5], [190, 0]];
/** Height of the cliff's top above the temple terrace at z (m). */
export function cliffTop(z) {
  for (let i = 0; i + 1 < PROFILE.length; i++) {
    const [z0, h0] = PROFILE[i], [z1, h1] = PROFILE[i + 1];
    if (z <= z1) return h0 + (h1 - h0) * (z - z0) / (z1 - z0);
  }
  return 0;
}
