// Dunhuang and the Mogao caves, c. 850 (docs/settlements/dunhuang.md §2, §5, §6) — the layout. Pure data.
// +x east, +z south. The cliff stands in the west with its face at x = XF looking east; the rock lies behind it
// (x < XF) under the plateau and the dunes. East of it the forecourt apron, the Daquan's bed, the monks' cells,
// and beyond the river the oasis town along its main street (z ≈ 0), a gate at its east end, fields, and the
// Crescent Spring in the dunes at the south.

export const RADIUS = 190;
export const XF = -72;                               // the cliff face
export const ROCK = 44;                              // how far the rock runs back from the face (to x = XF − ROCK)
export const ZEND = 140;                             // the cliff runs z −ZEND … ZEND
export const FLOOR = [0.45, 9.6, 18.0, 25.0];        // the floors of the four tiers of caves; the apron stands at FLOOR[0]
export const APRON = [XF, -ZEND, XF + 7, ZEND];      // the stone apron along the foot
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The cliff's height at z: higher round the Nine-Storey building. */
export function cliffTop(z) { const a = Math.abs(z); return a < 13 ? 45 : a < 22 ? 38 : a < 40 ? 34 : 29 + 3 * Math.sin(z * 0.11) * Math.cos(z * 0.037); }

/**
 * The caves cut in the cliff. kind: 'great' (Cave 96, the Maitreya), 'hall' (fudou ceiling, altar), 'pillar' (central
 * pillar), 'cell' (a monk's cell with kang and stove), 'recess' (a shallow shrine, not entered). z the middle, tier 0…3.
 */
export const CAVES = [];
CAVES.push({ id: 'great', kind: 'great', z: 0, tier: 0, w: 23 });
CAVES.push({ id: 'hall', kind: 'hall', z: -52, tier: 0, w: 6.0 });
CAVES.push({ id: 'pillar', kind: 'pillar', z: -30, tier: 0, w: 7.0 });
CAVES.push({ id: 'cell', kind: 'cell', z: 45, tier: 0, w: 3.2 });
{
  const taken = (z, t, w) => CAVES.some((c) => c.tier === t && Math.abs(c.z - z) < (c.w + w) / 2 + 4);
  const r = rng(850);
  const rows = [[0, 12.5, 0], [1, 11, 5.5], [2, 14, 8], [3, 19, 3]];
  for (const [t, step, off] of rows) for (let z = -ZEND + 12 + off; z < ZEND - 10; z += step * (0.85 + 0.3 * r())) {
    const w = 2.4 + 1.2 * r();
    // the tiers over the Nine-Storey building and its neighbours are left to it; the lowest tier keeps clear of the stairs' feet
    if (Math.abs(z) < 16 || taken(z, t, w)) continue;
    CAVES.push({ id: `r${t}_${Math.round(z)}`, kind: 'recess', z: Math.round(z * 2) / 2, tier: t, w, h: 2.6 + 0.7 * r(), seed: Math.round(z * 7 + t) });
  }
}
/** The stairs from the forecourt up to the second tier's gallery: they rise to the south from the north end. */
export const STAIR = { x0: XF, x1: XF + 1.7, z0: -136, z1: -104 };
export const GALLERY = { x0: XF, x1: XF + 1.9, z0: -104, z1: 112 };      // tier 1's timber gallery (the floor FLOOR[1])

/** The Daquan: a shallow stream in a dry bed along the cliff's east. */
export const RIVER = { w: 6, bed: -0.55, water: -0.12 };
export const riverX = (z) => -42 + 5 * Math.sin(z / 41) + 2 * Math.sin(z / 17);
export const inRiver = (x, z, m = 0) => Math.abs(x - riverX(z)) < RIVER.w / 2 + m && Math.hypot(x, z) < RADIUS - 26;
export const BRIDGE = { z: 0, w: 4.4 };            // the timber bridge on the street's axis
export const bankY = (d) => (d < RIVER.w / 2 + 2 ? RIVER.bed * smooth(RIVER.w / 2 + 2, RIVER.w / 2 - 0.4, d) : 0);

/** The street and the town. */
export const STREET = { z0: -4.5, z1: 4.5, x0: -34, x1: 150 };
export const GATE = { x: 150, z: 0 };
export const CROSS = [24, 72, 118];                                // lanes across the main street (x), width 4.4
export const LANE_W = 4.4;
export const TOWN = [-30, -62, 146, 62];
export const SERAI = { x0: 84, z0: 9, x1: 124, z1: 47 };           // the caravanserai, entered from the main street
export const SPRING = { c: [42, 146], r: 15 };                    // the Crescent Spring's pool
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const onStreet = (x, z, m = 0) => (Math.abs(z) < 4.5 + m && x > STREET.x0 - m && x < STREET.x1 + m) || CROSS.some((cx) => Math.abs(x - cx) < LANE_W / 2 + m && Math.abs(z) < 62);
/** A crescent: the disc of radius r minus a disc of the same radius moved 6 m to the north-east. */
export function crescent(x, z, m = 0) { const [cx, cz] = SPRING.c; return Math.hypot(x - cx, z - cz) < SPRING.r - 6 + m + 4 && Math.hypot(x - cx - 6, z - cz + 5) > SPRING.r - 6 - m; }
