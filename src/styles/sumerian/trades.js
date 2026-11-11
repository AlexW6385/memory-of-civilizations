// The trades of Ur's houses and temple workshops (docs/settlements/ur.md §5.5): what stands in the room that in
// a plain house is the reception room, and in the court — the weaver's loom, the potter's wheel and kiln, the
// brewer's vats, the baker's ovens, the smith's hearth, the fisher's nets, the reed-worker's bundles, the granary's
// bins. Each is a function of the helper kit built in urHouseOpen (house.js): the local frame (u along the front,
// v in from it), boxes B, lathes L, beams, the colliders and the lights. All materials are palette names.
//
// Where a figure sits or stands for a trade (the weaver at her loom, the potter at his wheel) is TRADE_SPOT: the
// settlement's town.js puts a figure there (a plan of the 'life' style).

export const TRADES = ['weaver', 'potter', 'brewer', 'baker', 'smith', 'fisher', 'reeder', 'granary'];

/** Local (u, v) of each trade's worker and the way he faces (du, dv), relative to the reception room's frame (ra, rb, va, vb). */
export const TRADE_SPOT = {
  weaver: (r) => ({ at: [r.ra + 1.3, (r.va + r.vb) / 2 + 0.55], face: [0, -1], pose: 'sit_ground', women: true }),
  potter: (r) => ({ at: [r.ra + 1.0, (r.va + r.vb) / 2], face: [1, 0], pose: 'sit_low' }),
  brewer: (r) => ({ at: [r.rb - 1.0, r.va + 0.8], face: [-1, 0], pose: 'stand', women: true }),
  baker: (r) => ({ at: [r.ra + 1.2, r.va + 0.8], face: [0, -1], pose: 'kneel', women: true }),
  smith: (r) => ({ at: [r.ra + 1.1, (r.va + r.vb) / 2 + 0.2], face: [-1, 0], pose: 'squat' }),
  fisher: (r) => ({ at: [r.ra + 1.2, (r.va + r.vb) / 2], face: [0, 1], pose: 'sit_ground' }),
  reeder: (r) => ({ at: [r.ra + 1.3, (r.va + r.vb) / 2], face: [0, 1], pose: 'sit_ground' }),
  granary: () => null,
};

export function furnishTrade(trade, H) {
  const f = IMPL[trade]; if (f) f(H);
}

const jarP = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];
const vatP = (r, h) => [[0.001, 0], [r * 0.8, 0], [r, h * 0.35], [r * 0.92, h * 0.85], [r * 0.7, h], [r * 0.62, h * 0.97], [r * 0.82, h * 0.82], [r * 0.9, h * 0.35], [r * 0.7, 0.02], [0.001, 0.02]];

const IMPL = {
  // the weaver: a horizontal ground loom pegged to the floor — two beams, the warp stretched between, the cloth begun at
  // one end in red and white bands — baskets of wool, a spindle, loom weights of clay in a row, a bale of fleece
  weaver(H) {
    const { B, L, ra, rb, va, vb, col, R, bag } = H, h0 = 0.06, m = (va + vb) / 2;
    B('reed_mat', ra + 0.2, va + 0.2, rb - 0.2, vb - 0.2, h0, h0 + 0.012);
    const u0 = ra + 0.5, u1 = Math.min(rb - 0.5, u0 + 2.6);
    for (const u of [u0, u1]) { B('timber', u - 0.05, m - 0.62, u + 0.05, m + 0.62, h0 + 0.012, h0 + 0.1); for (const dv of [-0.55, 0.55]) B('timber', u - 0.02, m + dv - 0.02, u + 0.02, m + dv + 0.02, h0 + 0.1, h0 + 0.22); }
    B('linen', u0 + 0.05, m - 0.55, u1 - 0.05, m + 0.55, h0 + 0.1, h0 + 0.128);
    for (const [a, b, c] of [[0.05, 0.4, 'cloth_red'], [0.4, 0.5, 'cloth_white'], [0.5, 0.75, 'cloth_indigo'], [0.75, 0.82, 'cloth_white']]) B(c, u0 + 0.05 + a * 0.35, m - 0.5, u0 + 0.05 + b * 0.35, m + 0.5, h0 + 0.128, h0 + 0.15);
    for (let k = 0; k < 7; k++) L('terracotta', [[0.001, 0], [0.04, 0.0], [0.045, 0.06], [0.001, 0.07]], u1 - 0.3, m - 0.5 + k * 0.17, h0 + 0.06, 8);   // loom weights
    col.rect(R(u0 - 0.1, m - 0.65, u1 + 0.1, m + 0.65), 0, 0.2);
    for (const [u, v] of [[rb - 0.45, vb - 0.4], [rb - 0.5, va + 0.4]]) { L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], u, v, h0 + 0.012, 12); L('hide_white', [[0.001, 0.2], [0.2, 0.26], [0.17, 0.36], [0.001, 0.4]], u, v, h0 + 0.1, 10); }
    B('hide_white', ra + 0.25, vb - 0.8, ra + 0.95, vb - 0.15, h0, h0 + 0.35); col.rect(R(ra + 0.25, vb - 0.8, ra + 0.95, vb - 0.15), 0, 0.4);   // a bale of fleece
    H.lamp(ra, (va + vb) / 2 - 0.6, 1.3);
  },
  // the potter: the wheel (a disc of clay on a short pivot, on a low mud bench), a heap of clay under a damp cloth,
  // jars drying in rows on mats, a rack of finished bowls
  potter(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    B('reed_mat', ra + 0.2, va + 0.2, rb - 0.2, vb - 0.2, h0, h0 + 0.012);
    B('mud_plaster', ra + 0.55, m - 0.45, ra + 1.3, m + 0.45, h0, 0.28); col.rect(R(ra + 0.55, m - 0.45, ra + 1.3, m + 0.45), 0, 0.3);
    L('terracotta', [[0.001, 0.28], [0.3, 0.28], [0.3, 0.31], [0.001, 0.31]], ra + 0.95, m, 0, 16);
    L('mud_plaster', [[0.001, 0.31], [0.1, 0.31], [0.09, 0.4], [0.001, 0.43]], ra + 0.95, m, 0, 10);                              // the pot rising
    L('silt', [[0.001, 0], [0.34, 0.0], [0.3, 0.2], [0.14, 0.34], [0.001, 0.36]], ra + 0.55, vb - 0.45, h0, 12); L('linen', [[0.001, 0.3], [0.36, 0.1], [0.2, 0.2], [0.001, 0.36]], ra + 0.55, vb - 0.45, h0, 12);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) L('terracotta', jarP(0.8 + 0.1 * ((i + j) % 2)), rb - 0.5 - i * 0.55, va + 0.45 + j * 0.6, h0 + 0.012, 12);
    B('timber', ra + 0.3, va + 0.12, rb - 0.3, va + 0.16, 0.85, 0.9); for (const u of [ra + 0.35, rb - 0.35]) B('timber', u - 0.03, va + 0.1, u + 0.03, va + 0.18, h0, 0.9);
    for (let u = ra + 0.6; u < rb - 0.5; u += 0.34) H.bowl(u, va + 0.14, 0.9, 0.12);
  },
  // the brewer: great vats of clay sunk to the shoulder in the floor, beer jars with straws (beer was drunk through
  // reed straws from the common jar), barley sprouting on mats, a quern, loaves of bappir
  brewer(H) {
    const { B, L, ra, rb, va, vb, col, R, bag } = H, h0 = 0.06, m = (va + vb) / 2;
    for (const [u, v, r] of [[ra + 0.9, m - 0.55, 0.5], [ra + 0.9, m + 0.55, 0.45], [ra + 1.95, m, 0.5]]) { if (u + r > rb - 0.2) continue; L('terracotta', vatP(r, 0.95), u, v, h0, 16); L('bitumen', [[0.001, 0.82], [r * 0.7, 0.9], [0.001, 0.9]], u, v, h0, 14); col.circle(...H.W(u, v), r, 0, 1.0); }
    for (let k = 0; k < 3; k++) { const u = rb - 0.45, v = va + 0.45 + k * 0.7; L('terracotta', jarP(1.0), u, v, h0, 12); const a = H.LP(u + 0.02, v, h0 + 0.7), b = H.LP(u + 0.5 - k * 0.1, v + 0.1, h0 + 0.1); H.beam('reed_mat', a, b, 0.008, 0.02); }
    B('reed_mat', ra + 0.3, vb - 0.9, ra + 1.5, vb - 0.2, h0, h0 + 0.02); B('cloth_ochre', ra + 0.35, vb - 0.85, ra + 1.45, vb - 0.25, h0 + 0.02, h0 + 0.05);          // malt on a mat
    for (let k = 0; k < 5; k++) L('mud_plaster', [[0.001, 0], [0.12, 0.0], [0.13, 0.04], [0.001, 0.06]], ra + 1.9 + (k % 3) * 0.3, vb - 0.4 - (k >> 1) * 0.3, h0, 8);
    H.lamp(ra, m, 1.3);
  },
  // the baker: two clay ovens, a kneading trough of timber, a table of mud brick with loaves, flour in baskets, a stack of fuel
  baker(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    for (const u of [ra + 0.7, ra + 1.75]) { L('terracotta', [[0.38, 0], [0.37, 0.4], [0.28, 0.75], [0.16, 0.85], [0.15, 0.85], [0.26, 0.74], [0.34, 0.4], [0.35, 0.03]], u, vb - 0.5, h0, 16); col.circle(...H.W(u, vb - 0.5), 0.4, 0, 0.9); L('pottery_dark', [[0.001, 0.8], [0.14, 0.82], [0.001, 0.84]], u, vb - 0.5, h0, 8); }
    H.soot(ra + 1.2, vb, 0.6, 0.3, 1.0, 2.4);
    B('mud_plaster', rb - 1.5, va + 0.25, rb - 0.35, va + 0.9, h0, 0.7); col.rect(R(rb - 1.5, va + 0.25, rb - 0.35, va + 0.9), 0, 0.7);
    for (let k = 0; k < 7; k++) L('cloth_ochre', [[0.001, 0], [0.12, 0.0], [0.13, 0.025], [0.001, 0.035]], rb - 1.3 + (k % 4) * 0.28, va + 0.45 + (k >> 2) * 0.28, 0.7, 10);   // loaves
    B('timber', ra + 0.3, va + 0.2, ra + 1.2, va + 0.65, h0, 0.45); B('timber', ra + 0.34, va + 0.24, ra + 1.16, va + 0.61, 0.3, 0.38); col.rect(R(ra + 0.3, va + 0.2, ra + 1.2, va + 0.65), 0, 0.45);
    for (let k = 0; k < 3; k++) L('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], rb - 0.45, vb - 0.4 - k * 0.5, h0, 10);
    H.fuel(ra + 2.3, va + 0.3);
    H.lights.push({ at: H.LP(ra + 1.2, vb - 0.9, 0.7), color: '#ff8c3a', intensity: 3, distance: 5 });
  },
  // the smith (the coppersmith, who casts bronze): a hearth of brick with a pair of bellows of skin, a crucible in the
  // charcoal, clay moulds, a stone anvil, ingots and a heap of ore; soot on the walls
  smith(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    B('brick_baked', ra + 0.3, m - 0.55, ra + 1.0, m + 0.55, h0, 0.55); B('pottery_dark', ra + 0.4, m - 0.4, ra + 0.9, m + 0.4, 0.55, 0.6); col.rect(R(ra + 0.3, m - 0.55, ra + 1.0, m + 0.55), 0, 0.6);
    L('pottery_dark', [[0.001, 0], [0.1, 0.01], [0.13, 0.12], [0.1, 0.16], [0.001, 0.16]], ra + 0.65, m, 0.6, 10); B('flame', ra + 0.6, m - 0.04, ra + 0.7, m + 0.04, 0.62, 0.75);
    H.soot(ra + 0.012, m, 0.8, 0.4, 0.6, 2.8);
    L('hide_tan', [[0.001, 0], [0.14, 0.02], [0.2, 0.15], [0.12, 0.3], [0.001, 0.33]], ra + 1.5, m - 0.1, h0, 10); H.beam('timber', H.LP(ra + 1.3, m - 0.1, h0 + 0.2), H.LP(ra + 1.0, m, 0.35), 0.015, 0.03);
    B('basalt', rb - 1.6, m - 0.2, rb - 1.1, m + 0.2, h0, 0.4); col.rect(R(rb - 1.6, m - 0.2, rb - 1.1, m + 0.2), 0, 0.4);
    for (let k = 0; k < 5; k++) B('bronze', rb - 0.9 + (k % 3) * 0.12, vb - 0.5 - (k >> 1) * 0.12, h0 + (k % 2) * 0.02, rb - 0.7 + (k % 3) * 0.12, vb - 0.4 - (k >> 1) * 0.12, h0 + 0.05 + (k % 2) * 0.02);   // ingots
    for (const [u, v] of [[rb - 0.5, va + 0.4], [rb - 0.9, va + 0.45]]) B('terracotta', u - 0.12, v - 0.1, u + 0.12, v + 0.1, h0, h0 + 0.07);   // moulds
    L('limestone', [[0.001, 0], [0.2, 0.0], [0.22, 0.12], [0.1, 0.18], [0.001, 0.2]], ra + 0.5, va + 0.35, h0, 8);
    H.lights.push({ at: H.LP(ra + 0.9, m, 0.9), color: '#ff7a2a', intensity: 4, distance: 6 });
  },
  // the fisher: nets hung from poles to dry, a boat's hull of reed bundles on trestles, baskets and fish-traps of reed,
  // spears, dried fish on a rack
  fisher(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    B('reed_mat', ra + 0.2, va + 0.2, rb - 0.2, vb - 0.2, h0, h0 + 0.012);
    for (const u of [ra + 0.35, rb - 0.35]) H.beam('palm_trunk', H.LP(u, va + 0.15, 1.7), H.LP(u, vb - 0.15, 1.7), 0.03, 0.06);
    for (let k = 0; k < 9; k++) { const u = ra + 0.5 + k * ((rb - ra - 1.0) / 8); B('rope_fibre', u - 0.12, va + 0.2, u + 0.12, va + 0.26, 0.85 + (k % 3) * 0.07, 1.7); }
    for (const [u, v] of [[rb - 0.5, vb - 0.5], [rb - 0.5, va + 0.5]]) { L('wicker', [[0.001, 0], [0.16, 0.01], [0.2, 0.4], [0.1, 0.6], [0.001, 0.62]], u, v, h0 + 0.012, 10); }
    for (let k = 0; k < 6; k++) { const u = ra + 0.7 + k * 0.28; B('hide_grey', u, vb - 0.8, u + 0.22, vb - 0.77, 1.0 + (k % 2) * 0.1, 1.28 + (k % 2) * 0.1); }
    H.beam('timber', H.LP(ra + 0.5, vb - 0.82, 1.28), H.LP(ra + 2.3, vb - 0.82, 1.28), 0.015, 0.03);
    for (const dv of [0, 0.12, 0.24]) H.beam('timber', H.LP(rb - 0.2, va + 0.3 + dv, 0.05), H.LP(rb - 0.9, va + 0.4 + dv, 1.6), 0.01, 0.02);   // fish spears leaning
  },
  // the reed-worker: bundles of cut reeds in stacks, a mat half woven on the floor, the hull of a small boat being bound
  reeder(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    B('reed_mat', ra + 0.2, va + 0.2, rb - 0.2, vb - 0.2, h0, h0 + 0.012);
    for (let k = 0; k < 8; k++) { const row = k >> 2, v = va + 0.3 + (k & 3) * 0.22; H.beam('reed_mat', H.LP(rb - 0.4, v, h0 + 0.1 + row * 0.2), H.LP(rb - 2.6, v, h0 + 0.1 + row * 0.2), 0.09, 0.17); }
    B('reed_mat', ra + 0.4, m - 0.5, ra + 1.6, m + 0.5, h0 + 0.012, h0 + 0.03);
    for (let k = 0; k < 8; k++) B('wicker', ra + 0.4 + k * 0.1, m - 0.5, ra + 0.46 + k * 0.1, m + 0.5, h0 + 0.03, h0 + 0.045);
    col.rect(R(rb - 2.7, va + 0.2, rb - 0.2, va + 1.15), 0, 0.5);
    for (let k = 0; k < 3; k++) { const a = H.LP(ra + 0.3, vb - 0.3 - k * 0.12, 0.05), b = H.LP(ra + 0.1, vb - 0.3 - k * 0.12, 1.7); H.beam('reed_mat', a, b, 0.05, 0.1); }
    L('bitumen', [[0.001, 0], [0.3, 0.0], [0.34, 0.25], [0.3, 0.28], [0.001, 0.22]], rb - 0.5, vb - 0.5, h0, 12);        // a pot of bitumen
    L('rope_fibre', [[0.001, 0], [0.2, 0.0], [0.24, 0.08], [0.001, 0.1]], rb - 1.3, vb - 0.4, h0, 12);                   // a coil of cord
  },
  // the granary of the temple: bins of mud brick along the walls with grain in them, sacks stacked, a scribe's tally of
  // clay tokens on a bench, a measuring jar (the sila) and a pair of scoops
  granary(H) {
    const { B, L, ra, rb, va, vb, col, R } = H, h0 = 0.06, m = (va + vb) / 2;
    for (let u = ra + 0.2; u + 1.0 < rb - 0.1; u += 1.2) { B('mud_plaster', u, vb - 1.1, u + 1.0, vb - 0.1, h0, 0.95); B('sandstone_yellow', u + 0.1, vb - 1.0, u + 0.9, vb - 0.2, 0.9, 0.97); col.rect(R(u, vb - 1.1, u + 1.0, vb - 0.1), 0, 0.97); }
    for (let k = 0; k < 6; k++) L('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], ra + 0.5 + (k % 3) * 0.55, va + 0.4 + (k >> 2) * 0.5, k >= 3 ? 0.06 + 0.0 : h0, 10);
    B('timber', rb - 1.3, va + 0.2, rb - 0.4, va + 0.6, h0, 0.42); col.rect(R(rb - 1.3, va + 0.2, rb - 0.4, va + 0.6), 0, 0.42);
    for (let k = 0; k < 6; k++) L('mud_plaster', [[0.001, 0], [0.03, 0.0], [0.03, 0.025], [0.001, 0.03]], rb - 1.2 + k * 0.13, va + 0.4, 0.42, 6);
    L('terracotta', jarP(0.8), rb - 0.5, va + 0.8, h0, 10);
    H.lamp(ra, va + 0.9, 1.3);
  },
};

/** What each trade has in its court (placed by urHouseOpen after the generic court things). */
export function tradeCourt(trade, H) {
  const { B, L, uC0, uC1, vC0, vC1, col, R } = H, h0 = 0.06, cu = (uC0 + uC1) / 2, cv = (vC0 + vC1) / 2;
  if (trade === 'potter') {
    // the kiln: a domed firing chamber of mud brick on a stoke-hole, a stack of fuel beside it, wasters in a heap
    L('mud_plaster', [[0.9, 0], [0.9, 0.5], [0.8, 1.1], [0.5, 1.5], [0.2, 1.62], [0.001, 1.64]], uC1 - 1.1, cv, h0, 16);
    B('brick_baked', uC1 - 1.1 - 0.2, cv + 0.7, uC1 - 1.1 + 0.2, cv + 1.05, h0, 0.7); B('pottery_dark', uC1 - 1.1 - 0.15, cv + 1.0, uC1 - 1.1 + 0.15, cv + 1.04, 0.1, 0.6);
    col.circle(...H.W(uC1 - 1.1, cv), 0.95, 0, 1.6);
    for (let k = 0; k < 6; k++) L('terracotta', [[0.001, 0], [0.12, 0.0], [0.16, 0.1], [0.001, 0.14]], uC0 + 0.5 + (k % 3) * 0.2, vC1 - 0.5 - (k >> 1) * 0.17, h0, 8);
    H.fuel(uC0 + 0.4, vC0 + 0.4);
  } else if (trade === 'brewer' || trade === 'baker') {
    // a fire pit and the great pan of the brewery (or the open oven of the bakery) in the court, a stack of fuel
    L('pottery_dark', [[0.001, 0], [0.5, 0.0], [0.5, 0.2], [0.001, 0.22]], cu, cv + 0.6, h0, 14);
    L('terracotta', vatP(0.55, 0.7), cu, cv + 0.6, 0.26, 14);
    H.fuel(uC0 + 0.4, vC0 + 0.4);
    H.lights.push({ at: H.LP(cu, cv + 0.6, 0.5), color: '#ff8c3a', intensity: 2.5, distance: 5 });
  } else if (trade === 'fisher' || trade === 'reeder') {
    // racks of drying fish and reed bundles in the court
    for (let k = 0; k < 2; k++) { const v = vC0 + 0.9 + k * 0.9; H.beam('timber', H.LP(uC0 + 1.2, v, 1.15), H.LP(uC1 - 0.8, v, 1.15), 0.02, 0.04); for (const u of [uC0 + 1.2, uC1 - 0.8]) B('timber', u - 0.03, v - 0.03, u + 0.03, v + 0.03, h0, 1.18); for (let u = uC0 + 1.5; u < uC1 - 0.9; u += 0.3) B(trade === 'fisher' ? 'hide_grey' : 'reed_mat', u, v - 0.02, u + 0.2, v + 0.02, 0.7, 1.15); }
  } else if (trade === 'weaver') {
    // a standing loom for wool is not Sumerian; skeins of dyed wool hung on a line across the court
    H.beam('timber', H.LP(uC0 + 0.2, cv, 1.8), H.LP(uC1 - 0.2, cv, 1.8), 0.02, 0.05);
    for (let k = 0; k < 6; k++) B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_red'][k], uC0 + 0.5 + k * ((uC1 - uC0 - 1.0) / 5), cv - 0.03, uC0 + 0.62 + k * ((uC1 - uC0 - 1.0) / 5), cv + 0.03, 1.0, 1.8);
  } else if (trade === 'smith') {
    for (let k = 0; k < 4; k++) L('sandstone_dressed', [[0.001, 0], [0.12, 0.0], [0.13, 0.1], [0.001, 0.12]], uC0 + 0.5 + k * 0.2, vC1 - 0.5, h0, 8);   // ore
    H.fuel(uC0 + 0.4, vC0 + 0.4);
  }
}
