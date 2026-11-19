// Where Paris's sounds are (docs/settlements/paris.md §6c): the places of its emitters and the geometry the audio engine needs to put each
// sound where it comes from — the river's two arms, the island's streets, the Grand Pont's boards and mills, the bells' towers, the
// shops that work, the rooms one can be inside. Pure data and functions of layout.js, openwalk.js and court-lots.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and src/engine/voices-paris.js.
// Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).
// [inferred throughout: no recording of 1248 exists. What the sources give is marked [stated] beside it; the rest is the dossier's reasoning.]

import { NORTH_ARM, SOUTH_ARM, GARDEN, PALACE, CATHEDRAL, PARVIS, CHAPEL, CHATELETS, RADIUS, lots, inRect, streets, inRiver } from './layout.js';
import { openMap, rich } from './openwalk.js';
import { courtLots } from './court-lots.js';

/** Where the audio puts the listener when the engine gives none: the arrival in the palace court. */
export const HOME = [-250, -10];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

// ── the trades' work, heard from the shops that are open ─────────────────────
/** The ten trades of the fronts in the order of styles/gothic/houses.js TRADES (a test compares them): the trade of a lot is (seed >>> 3) % 10. */
export const TRADE_IDS = ['baker', 'draper', 'butcher', 'tavern', 'goldsmith', 'shoemaker', 'cooper', 'chandler', 'scribe', 'fishmonger'];
export const tradeOfSeed = (seed) => TRADE_IDS[(seed >>> 3) % TRADE_IDS.length];
/**
 * What each trade sounds like at work: [voice, gap in seconds [min, max], hours [from, to]]. Hours are [inferred] from the trades (a
 * baker's oven is lit in the small hours: bread was the staple, so the ovens' work began before dawn).
 */
const WORK = {
  baker: [['ovenDoor', [16, 38], [3.5, 12.5]]],
  draper: [['scissors', [26, 60], [7.5, 17.5]]],
  butcher: [['cleaver', [11, 28], [6, 16.5]]],
  tavern: [['teaTalk', [9, 20], [10, 19.5]], ['teaClink', [14, 34], [10, 19.5]], ['pourWine', [30, 70], [10, 19.5]]],
  goldsmith: [['goldTap', [9, 22], [8, 17.5]]],
  shoemaker: [['awl', [12, 30], [7, 17.5]]],
  cooper: [['cooperTap', [12, 30], [6.5, 17.5]]],
  chandler: [['tallow', [26, 60], [7, 17.5]]],
  scribe: [['brush', [24, 60], [8, 17]]],
  fishmonger: [['fishSlap', [10, 26], [5.5, 14]]],
};
let SITES = null;
/** The shops that make sound: { use (the trade), rect, at, id, work } — the court's row of lodgings and the core's open shops near the walk and the Grand Pont. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const seen = new Set();
  const add = (rect, seed, tag) => {
    const use = tradeOfSeed(seed), id = `${tag}:${Math.round(rect[0] * 10)},${Math.round(rect[1] * 10)}`;
    if (seen.has(id)) return;
    seen.add(id);
    SITES.push({ use, rect, at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2], id, work: WORK[use] || [] });
  };
  for (const l of courtLots()) add(l.rect, l.seed, 'court');
  for (const [l] of openMap()) if (rich(l)) add(l.rect, l.seed, 'lot');
  return SITES;
}

// ── fixed places ──────────────────────────────────────────────────────────────
/** The wells (a windlass): the palace court's (court.js) and the king's garden's (plan.js). */
export const WELLS = [[-229, -28.5], [-288, 20]];
/** The Grand Pont's money-changers' and goldsmiths' boards (plan.js streetLife: x = ±2 from the bridge's axis, z by board). */
export const CHANGERS = [[-2, -158], [-2, -122], [-2, -114], [2, -160], [2, -150], [2, -138], [2, -126], [2, -116]];
/** The mills hung on the Grand Pont's downstream (west) face (plan.js PONTS: mills at z −148 and −130.7, x = the deck's edge − 9). */
export const MILLS = [[-9, -148], [-9, -130.7]];
/** The strands where the washerwomen kneel (life.js: at the water's edge of both arms, off the bridges' feet). */
export const STRANDS = [[-60, -166.4], [30, -166.4], [95, -166.4], [-30, 151.4], [60, 151.4], [140, 151.4]];
/** The palace court's hitching rails with the grooms' horses (court.js). */
export const RAILS = [[-232, 15.6], [-176, 15.4]];
/** The bells (their towers): Notre-Dame's north tower holds all the bells of 1248, the south tower stood empty [stated: Wikipedia "Bells of Notre-Dame de Paris", "all initially housed in the north tower … the south tower had remained empty since its construction in 1250"; the earliest verified bell, Guillaume, 1230]; the parish churches' small bells at their churches' sides of the town [inferred positions: Saint-Julien-le-Pauvre and Saint-Séverin on the Left Bank, Saint-Jacques-de-la-Boucherie and Saint-Merri on the Right, Saint-Germain-l'Auxerrois to the west, Saint-Landry and Saint-Denis-de-la-Châtre on the island; our frame is the island's own, so the places are bearings, not surveys]. */
export const BELLS = {
  nd: [160, -15.5],
  parish: [[118, 192, 392], [70, 222, 349], [8, -222, 415], [52, -310, 330], [-170, -232, 372], [188, -46, 440], [196, 50, 311]],
  // the cathedral's choir (the canons sang the hours there), the palace chapel (its chaplains)
  choir: [236, 0], chapel: [-200, -10],
};
/** Work in the open: Notre-Dame's chapels were still being built between the buttresses [stated: dossier §1a, "built about 1235–50"], so masons and a treadwheel crane at the nave's north side [inferred]. */
export const WORKS = { masons: [215, -34] };

export const EMITTERS = [
  { voice: 'mill', at: MILLS[0], r50: 13, gap: [2, 6], hours: [4.5, 19.5], after: true },
  { voice: 'mill', at: MILLS[1], r50: 13, gap: [2, 6], hours: [4.5, 19.5], after: true },
  ...CHANGERS.map((at) => ({ voice: 'coin', at, r50: 6, gap: [7, 19], hours: [7, 17.5], dry: true })),
  ...STRANDS.map((at) => ({ voice: 'washer', at, r50: 9, gap: [12, 30], hours: [7, 16], dry: true })),
  { voice: 'kitchen', at: [-176, 31], r50: 9, gap: [10, 22], hours: [4.5, 19] },
  ...RAILS.map((at) => ({ voice: 'stamp', at, r50: 8, gap: [16, 40], hours: [6, 19], dry: true })),
  { voice: 'chisel', at: WORKS.masons, r50: 14, gap: [12, 28], hours: [6.5, 17.5], dry: true },
  { voice: 'wellBucket', at: WELLS[0], r50: 8, gap: [45, 110], hours: [6, 19], dry: true },
  { voice: 'wellBucket', at: WELLS[1], r50: 8, gap: [70, 160], hours: [6, 19], dry: true },
  { voice: 'pig', at: [-80, -180], r50: 10, gap: [18, 50], hours: [5.5, 19], dry: true },
  { voice: 'pig', at: [60, 168], r50: 10, gap: [18, 50], hours: [5.5, 19], dry: true },
  // the swifts and swallows round the cathedral's towers and the palace's roofs, in their months (the voice checks the season)
  { voice: 'swift', at: [165, 0], r50: 60, gap: [9, 24], hours: [5.5, 20] },
  { voice: 'swift', at: [-190, -40], r50: 50, gap: [14, 34], hours: [5.5, 20] },
  // the moving sounds, made by the voices themselves from the listener's place: boats on the arms, cries in the streets, the watch, a cart
  { voice: 'seineBoat', at: [0, -135], r50: 4000, gap: [30, 75], hours: [5.5, 20], rainMax: 0.6 },
  { voice: 'parisCry', at: [0, 0], r50: 4000, gap: [26, 62], hours: [4.5, 19.5], rainMax: 0.45 },
  { voice: 'cart', at: [0, 0], r50: 4000, gap: [60, 150], hours: [6, 18.5], rainMax: 0.5 },
  { voice: 'parisWatch', at: [0, 0], r50: 4000, gap: [45, 110], hours: [19.8, 4.2], rainMax: 0.5 },
];

// ── geometry of the waters and the streets ────────────────────────────────────
const ARMS = [[-RADIUS + 72, NORTH_ARM[1] + 2, RADIUS - 72, NORTH_ARM[3] - 2], [-RADIUS + 72, SOUTH_ARM[1] + 2, RADIUS - 72, SOUTH_ARM[3] - 2]];
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
/** The nearest point of the Seine's water (the quay wall's or the strand's foot) to (x, z), the distance and the arm's index. */
export function canalSpot(x, z) {
  let best = null;
  ARMS.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}
/** A boat's track on the arm nearest to (x, z): the centre line, a pass by the nearest point, starting `lead` metres before it; null if the river is beyond `reach`. The arms are 60 and 40 m wide: the boats keep to the middle. */
export function riverTrack(x, z, rnd, reach = 90, lead = 45) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  const r = ARMS[c.i], mid = (r[1] + r[3]) / 2 + (rnd() - 0.5) * (r[3] - r[1]) * 0.4, lo = r[0] + 8, hi = r[2] - 8, near = Math.max(lo, Math.min(hi, x));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 16) return null;
  return { pts: [[a, mid], [b, mid]] };
}
/** The rues as rectangles (layout.js streets()) for the walkers: the island's and the banks'. */
let ST = null;
const lanes = () => (ST ||= streets().filter((r) => r[3] - r[1] > 3 && r[3] - r[1] < 9 && r[2] - r[0] > 12));
/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. (Paris's own voices ask for this one: voices.js's built-in vendors, sedan chairs and watchman are Suzhou's and ask for `streetTrack`, which Paris answers with none.) */
export function walkTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  for (const r of lanes()) { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, r }; }
  if (!best) return null;
  const r = best.r, mid = (r[1] + r[3]) / 2, lo = r[0] + 1, hi = r[2] - 1, near = Math.max(lo, Math.min(hi, x));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return { pts: [[a, mid + off], [b, mid + off]] };
}
/** The Grand Pont's and the Petit Pont's street: a walker's track along it nearest to (x, z) (the bridges run north–south), or null. */
export function bridgeTrack(x, z, rnd, reach = 70) {
  let best = null;
  for (const bx of [0, 110]) {
    const arm = bx === 0 ? NORTH_ARM : SOUTH_ARM, zc = (arm[1] + arm[3]) / 2, d = Math.hypot(bx - x, zc - z);
    if (d < reach && (!best || d < best.d)) best = { bx, arm, d };
  }
  if (!best) return null;
  const s = rnd() < 0.5 ? 1 : -1, h = (best.arm[3] - best.arm[1]) / 2 + 6, zc = (best.arm[1] + best.arm[3]) / 2;
  return { pts: [[best.bx + (rnd() - 0.5) * 2, zc - s * h], [best.bx + (rnd() - 0.5) * 2, zc + s * h]], d: best.d };
}
// the built-in boat (a yuloh), vendors (Chinese trades), sedan chairs and watchman of voices.js are Suzhou's: none here; Paris has its own (voices-paris.js)
export const canalTrack = () => null;
export const streetTrack = () => null;
// no pond, no lotus, no bamboo in the Cité; the Seine is the water (canalSpot)
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Cicadas are not heard in Paris's region [inferred: they live in the south of France]; the engine asks for a tree to put a bird or a cicada in with a different reach (36 and 40): only the birds get one. */
const TREES = [[-200, -40], [-300, 8], [-290, 30], [-306, 40], [-282, -30]];
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach < 38) return null;
  for (let k = 0; k < 8; k++) {
    const px = GARDEN[0] + 4 + rnd() * (GARDEN[2] - GARDEN[0] - 8), pz = GARDEN[1] + 4 + rnd() * (GARDEN[3] - GARDEN[1] - 8);
    if (Math.hypot(px - x, pz - z) < reach + 10) return [px, pz];
  }
  for (const t of TREES) if (Math.hypot(t[0] - x, t[1] - z) < reach) return t;
  return null;
}
/** 0…1: how much broad-leaved tree is round: the king's garden and its orchard, the May tree in the court. */
export function leafNear(x, z) {
  const g = inRect(GARDEN, x, z) ? 1 : 1 - sm(0, 24, rectDist(GARDEN, x, z));
  return Math.min(1, Math.max(0.8 * g, 0.18 * (1 - sm(2, 20, Math.hypot(x + 200, z - 8)))));
}
/** 0…1: how much green round (the crickets): the garden and the orchard, a little on the strands. */
export function greenNear(x, z) {
  const g = inRect(GARDEN, x, z) ? 1 : 1 - sm(0, 30, rectDist(GARDEN, x, z));
  const d = Math.min(Math.abs(z - NORTH_ARM[1]), Math.abs(z - SOUTH_ARM[3]));
  return Math.max(g, 0.12, d < 30 && Math.hypot(x, z) < RADIUS - 20 ? 0.3 * (1 - sm(0, 30, d)) : 0);
}
/** 0…1: how much of the town's hubbub reaches (x, z): the parvis (the early market) and the Grand Pont's street, the rues, less in the palace court, the garden and inside the cathedral. */
export function townNear(x, z) {
  if (inRect(GARDEN, x, z)) return 0.1;
  if (inRect(CATHEDRAL, x, z)) return 0.18;
  if (inRect(PARVIS, x, z, 18)) return 1;
  if (Math.abs(x) < 14 && z < 100 && z > -215) return 1;            // the Grand Pont's street
  if (inRect(PALACE, x, z)) return 0.4;
  return Math.max(0.15, 0.85 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z))));
}
/** 0…1: wet ground for the frogs: none made (the engine's frogs are for ponds); the Seine's banks are left to the water sounds. */
export const frogGround = () => 0;

// ── the rooms ─────────────────────────────────────────────────────────────────
const UPPER_Y = 4.4;           // above the shop's stone storey (3.3 m) from the ground (1 m)
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a trade's shop (the ten trades),
 * temple (the cathedral's nave and choir: stone, high, long-lived), hall (the Grand-Salle, the Sainte-Chapelle: its upper chapel),
 * court (the Châtelet's court room), house (any other that can be entered).
 */
export function roomAt(x, z, y = 0) {
  const upper = y > UPPER_Y;
  if (inRect(CATHEDRAL, x, z)) return { use: 'temple', at: [(CATHEDRAL[0] + CATHEDRAL[2]) / 2, 0], upper: false, same: 'nd' };
  if (inRect([CHAPEL.origin[0] - 34, CHAPEL.origin[1] - 11, CHAPEL.origin[0] + 4, CHAPEL.origin[1] + 11], x, z)) return { use: y > 4 ? 'hall' : 'temple', at: BELLS.chapel, upper: false, same: 'sc' };
  if (inRect([-265, -72, -199, -44], x, z)) return { use: 'hall', at: [-232, -58], upper: false, same: 'salle' };
  if (inRect(CHATELETS.grand, x, z, 0) || inRect(CHATELETS.petit, x, z, 0)) return { use: 'court', at: [(CHATELETS.grand[0] + CHATELETS.grand[2]) / 2, (CHATELETS.grand[1] + CHATELETS.grand[3]) / 2], upper, same: 'chatelet' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  return null;
}

/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the
 * roof is from inside (slate and tile over timber: loud; the vault of stone: far), `work` the small voices made in the room now and then
 * [voice, gap s] (the trade's own noise is the shop's emitter in WORK, heard whole inside it), `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  baker: { tone: [380, 0.4], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  draper: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 26]] },
  butcher: { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['drawer', 60]] },
  tavern: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 8], ['bowlClack', 20]] },
  goldsmith: { tone: [240, 0.2], roof: 1.0, hush: 0.6, work: [['coin', 34]] },
  shoemaker: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 60]] },
  cooper: { tone: [330, 0.3], roof: 1.0, hush: 0.9, work: [['jarLid', 50]] },
  chandler: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['paper', 50]] },
  scribe: { tone: [240, 0.15], roof: 1.0, hush: 0.7, work: [['paper', 22], ['brush', 30]] },
  fishmonger: { tone: [400, 0.4], roof: 1.0, hush: 1.0, work: [['clay', 14]] },
  temple: { tone: [130, 0.3], roof: 0.25, hush: 0.4, work: [['woodfish', 90]] },       // the nave: stone vaults under a lead roof, far above
  hall: { tone: [160, 0.22], roof: 0.6, hush: 0.5, work: [['paper', 70]] },            // the Grand-Salle's timber vaults, the chapel's upper floor
  court: { tone: [260, 0.25], roof: 0.7, hush: 0.7, work: [['paper', 40]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The upper floors: close under the roof (the rain loud), nearly silent. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30], ['broom', 80]] };
void inRiver;
