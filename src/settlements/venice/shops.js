// The opened shops of the Procuratie's arcades (docs/settlements/venice.md §5f.1): which bays are shops and of what trade, the plans that furnish
// them (shown near: a group of four shops within 40 m), the routes that walk into them, the lanes before their doors that the piazza's dressing keeps clear,
// the rooms for the sound map. Pure data from layout.js; the builders are venetian/shops.js.
import { Vector3 } from '../../core/three.js';
import { faceFrame } from '../../styles/renaissance/face.js';
import { shopSlots, TRADE_NAMES, P, FW, RD } from '../../styles/venetian/shops.js';
import { piazzaLights } from './piazzalight.js';
import { PIAZZA, CAMPANILE, CLOCK, GROUND, RADIUS, MERCERIA_ROWS } from './layout.js';

/** The Procuratie's ranges that have shops (plan.js draws them): the north range (front on the piazza, +u east) and the south range (+u west). */
export const RANGES = [
  { id: 'n', rect: [PIAZZA[0], PIAZZA[1] - 18, CLOCK[0], PIAZZA[1]], front: 's', first: 16 },      // bays 16.. : from x ≈ −100 to the Clock Tower
  { id: 's', rect: [PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16], front: 'n', first: 0, last: 32 },   // bays 0..31: from the campanile's corner west to x ≈ −100
];
const bays = (r) => Math.max(2, Math.round((r.front === 'n' || r.front === 's' ? r.rect[2] - r.rect[0] : r.rect[3] - r.rect[1]) / 3.1));
let MEMO = null;
/** [{ ...range, n, L, FM, shops: [{ i, trade, seed }] }] */
export function ranges() {
  if (MEMO) return MEMO;
  return (MEMO = RANGES.map((r, ri) => {
    const n = bays(r), { M, L } = faceFrame(r.rect, r.front, GROUND), shops = [];
    const last = Math.min(n - 1, (r.last ?? n) - 1);
    for (let i = r.first, k = 0; i + 1 <= last; i += 2, k++) shops.push({ i, trade: TRADE_NAMES[(k * 7 + ri * 3) % TRADE_NAMES.length], seed: 1500 + ri * 100 + k });
    return { ...r, n, L, FM: M, shops };
  }));
}
/** The shops of the range with this rect (for plan.js). */
export const shopsOf = (rect) => ranges().find((r) => r.rect === rect || r.rect.every((v, k) => v === rect[k]))?.shops ?? [];

const at = (R, u, d) => { const p = new Vector3(u, 0, d).applyMatrix4(R.FM); return [p.x, p.z]; };
/** The near plans: one per group of four shops. */
export function shopPlans() {
  const out = [];
  for (const R of ranges()) {
    const slots = shopSlots(R.L, R.n, R.shops);
    for (let g = 0; g < slots.length; g += 4) {
      const grp = slots.slice(g, g + 4), u0 = grp[0].u0, u1 = grp[grp.length - 1].u0 + grp[grp.length - 1].W, c = at(R, (u0 + u1) / 2, -P - FW - RD / 2 + 1.5);
      out.push({ id: `venice-shops-${R.id}-${g / 4}`, style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], entrance: { at: [-120, -5], facing: 'e' }, center: c, near: 40,
        bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], elements: [{ t: 'ven_shopfit', span: R.rect, front: R.front, y: GROUND, shops: grp.map((s) => ({ i: s.i, trade: s.trade, seed: s.seed })) }] });
    }
  }
  return out;
}
/** The night's glow of every shop (one plan, seen from the whole piazza): the pool before each door, the lit doorway and counter-window. */
export function shopGlowPlan() {
  return { id: 'venice-night-shops', style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], entrance: { at: [-120, -5], facing: 'e' }, center: [-62, -5], near: 190,
    bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], elements: RANGES.map((r) => ({ t: 'ven_shopglow', span: r.rect, front: r.front, y: GROUND, shops: shopsOf(r.rect).map((s) => ({ i: s.i, trade: s.trade, seed: s.seed })) })).concat([{ t: 'ven_halo', items: piazzaLights() }]) };
}
/** Routes into every opened shop (plan `walks`): from the arcade's floor, through the door, along the aisle to the room's back. */
export function shopWalks() {
  const out = [];
  for (const R of ranges()) for (const s of shopSlots(R.L, R.n, R.shops)) {
    out.push(Object.assign([at(R, s.uc, -1.2), at(R, s.uc, -P + 0.4), at(R, s.uc, -P - FW - 0.4), at(R, s.uc, -P - FW - 3.2), at(R, s.uc, -P - FW - 4.0)], { y0: GROUND }));
  }
  return out;
}
/** Rectangles (world) from each door out across the portico to 3 m past the columns: the dressing keeps clear of them: [[x0, z0, x1, z1]]. */
export function shopLanes() {
  const out = [];
  for (const R of ranges()) for (const s of shopSlots(R.L, R.n, R.shops)) {
    const a = at(R, s.uc - 1.4, 3.0), b = at(R, s.uc + 1.4, -P);
    out.push([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
  }
  return out;
}
/** The rooms of the shops, for the sound map: { rect, use (the trade), at }. */
export function shopRooms() {
  const out = [];
  for (const R of ranges()) for (const s of shopSlots(R.L, R.n, R.shops)) {
    const a = at(R, s.su0, -P - FW), b = at(R, s.su1, -P - FW - RD), c = at(R, (s.su0 + s.su1) / 2, -P - FW - RD / 2);
    out.push({ rect: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], use: s.trade, at: c, id: `shop:${R.id}${s.i}` });
  }
  return out;
}

// ── the Merceria's shops (docs/settlements/venice.md §5h): the rows of houses on both sides of the street, a shop to every pair of bays, the front wall on the street (P = 0) ──
const MTRADES = ['silk', 'cloth', 'hats', 'gold', 'spice', 'glass', 'silk', 'cloth'];       // [inferred] the mercers' goods: silk, cloth, caps, gold and trimmings, spices, glass
let MMEMO = null;
/** [{ id, rect, front, L, n, FM, shops: [{ i, trade, seed }] }] */
export function merceriaRows() {
  if (MMEMO) return MMEMO;
  return (MMEMO = MERCERIA_ROWS.map((r, ri) => {
    const n = Math.max(2, Math.round((r.front === 'n' || r.front === 's' ? r.rect[2] - r.rect[0] : r.rect[3] - r.rect[1]) / 3.1)), { M, L } = faceFrame(r.rect, r.front, GROUND), shops = [];
    for (let i = 0, k = 0; i + 1 <= n - 1; i += 2, k++) shops.push({ i, trade: MTRADES[(k * 3 + ri * 5) % MTRADES.length], seed: 1700 + ri * 100 + k });
    return { ...r, n, L, FM: M, shops };
  }));
}
/** The shell (always near the street: the rows' walls, floors, windows, roofs and the glow of every door) and the one plan with what stands in the shops. */
export function merceriaPlans() {
  const rows = merceriaRows(), C = [10.25, -84], base = { style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], entrance: { at: [-120, -5], facing: 'e' }, center: C, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS] };
  return [
    { ...base, id: 'venice-merceria-rows', near: 120, elements: [{ t: 'ven_mercer', y: GROUND, rows: rows.map((r) => ({ rect: r.rect, front: r.front, shops: r.shops })) },
      ...rows.map((r) => ({ t: 'ven_shopglow', span: r.rect, front: r.front, y: GROUND, P: 0, shops: r.shops }))] },
    { ...base, id: 'venice-merceria-shops', near: 62, elements: rows.map((r) => ({ t: 'ven_shopfit', span: r.rect, front: r.front, y: GROUND, P: 0, shops: r.shops })) },
  ];
}
const mat = (R, u, d) => { const p = new Vector3(u, 0, d).applyMatrix4(R.FM); return [p.x, p.z]; };
export function merceriaWalks() {
  const out = [];
  for (const R of merceriaRows()) for (const s of shopSlots(R.L, R.n, R.shops)) {
    out.push(Object.assign([mat(R, s.uc, 2.2), mat(R, s.uc, 0.4), mat(R, s.uc, -FW - 0.4), mat(R, s.uc, -FW - 3.2), mat(R, s.uc, -FW - 4.0)], { y0: GROUND }));
  }
  return out;
}
/** Rooms of the Merceria's shops for the sound map. */
export function merceriaRooms() {
  const out = [];
  for (const R of merceriaRows()) for (const s of shopSlots(R.L, R.n, R.shops)) {
    const a = mat(R, s.su0, -FW), b = mat(R, s.su1, -FW - RD), c = mat(R, (s.su0 + s.su1) / 2, -FW - RD / 2);
    out.push({ rect: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], use: s.trade, at: c, id: `shop:${R.id}${s.i}` });
  }
  return out;
}
