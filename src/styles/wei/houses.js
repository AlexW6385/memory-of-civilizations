// The houses, offices and shop rows of Ye's wards and market (docs/settlements/wei-ye.md §6): what the Han houses of the ward lacked here — more kinds of
// house (the court house of the official under a hip roof, the court of the artisan with its workroom, the poor row-house under thatch, the watch-tower
// house, the corner granary house), rooms you can walk into and find furnished by trade (dwelling, kitchen with its stove, loom room, smithy, scribe's room,
// store), the gate dressed with its bench, its lamp-bracket, its mounting block; the front wall weathered (plaster fallen to the earth at the foot and
// corners, damp, rain streaks under the eave, patched tiles); the yard with its well, millet stack, pen, mortar and jars. The shops of the market have
// a door through the counter, a back shelf and a sign each. In a lot's frame u runs along the lane and v from the lane into the lot (the front is the
// side the door is on). The builders are the Han ones, rewritten here (src/styles/han is read-only).
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { rng, lotFrame, eaveTilesGable, hipLite, eaveTiles } from '../han/kit.js';
import { PROP_KINDS } from './props.js';

const WALLS = ['earth_wall', 'earth_wall', 'lime_plaster', 'mud_plaster', 'lime_plaster'];
const pickOf = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** A prop placed through a frame F at lane-frame (u, v): the turn so that its +z looks along the frame's v (into the lot) when `into` is true. */
function prop(F, ctx, kind, u, v, o = {}) {
  const p = F.pt(u, v), f = PROP_KINDS[kind], yaw = F.V[0] ? (F.V[0] > 0 ? Math.PI / 2 : -Math.PI / 2) : F.V[1] > 0 ? 0 : Math.PI;
  const el = { kind, at: p, y: o.y ?? 0, yaw: yaw + (o.turn ?? 0), ...o };
  void f;
  ctx.style.elements.wei_prop(el, ctx);
}

/** The foot of a front wall (face on the plane v = v0, from u0 to u1, height H): plaster fallen away to the earth, the damp, rain streaks under the eave. */
function weather(F, u0, u1, v0, H, wm, rand, P = 0.3, streaks = true) {
  const under = wm === 'earth_wall' ? 'lime_plaster' : 'earth_wall';
  const n = Math.max(2, Math.round((u1 - u0) / 2.2));
  for (let k = 0; k < n; k++) {
    const u = u0 + 0.3 + rand() * (u1 - u0 - 1.6), w = 0.5 + rand() * 1.1, h = 0.3 + rand() * 0.7;
    if (rand() < 0.55) F.b('plaster_damp', u, P, v0 - 0.025, u + w * 1.4, P + h * 0.7, v0, false);
    if (rand() < 0.5) F.b(under === 'earth_wall' && wm !== 'earth_wall' ? 'earth_wall' : 'mud_plaster', u + 0.1, P + 0.02, v0 - 0.045, u + w, P + 0.02 + h, v0 - 0.02, false);
  }
  if (streaks) for (let k = 0; k < 3; k++) { const u = u0 + 0.5 + rand() * (u1 - u0 - 1.2); F.b('plaster_streak', u, H - 1.5 - rand() * 0.8, v0 - 0.075, u + 0.14 + rand() * 0.1, H - 0.4, v0 - 0.06, false); }
  // the corner: plaster knocked off at the end of the wall
  F.b('mud_plaster', u0, P, v0 - 0.04, u0 + 0.45, P + 0.9, v0 - 0.01, false);
}

function perimeter(F, W, D, h, gateU, gateW, wm, rand, o = {}) {
  const t = 0.5, capMat = o.thatch ? 'thatch' : 'tile_grey', capH = o.thatch ? 0.42 : 0.28;
  const cap = (u0, v0, u1, v1) => F.b(capMat, u0, h, v0, u1, h + capH, v1, false);
  if (o.noFront) {
    F.b(wm, 0, 0, D - t, W, h, D); F.b(wm, 0, 0, 0.2, t, h, D - t); F.b(wm, W - t, 0, 0.2, W, h, D - t);
    cap(-0.1, D - t - 0.1, W + 0.1, D + 0.1); cap(-0.1, 0.2, t + 0.1, D - t); cap(W - t - 0.1, 0.2, W + 0.1, D - t);
    return;
  }
  F.b(wm, 0, 0, 0, gateU - gateW / 2, h, t); F.b(wm, gateU + gateW / 2, 0, 0, W, h, t);
  F.b(wm, 0, 0, D - t, W, h, D); F.b(wm, 0, 0, t, t, h, D - t); F.b(wm, W - t, 0, t, W, h, D - t);
  cap(-0.1, -0.1, gateU - gateW / 2, t + 0.1); cap(gateU + gateW / 2, -0.1, W + 0.1, t + 0.1); cap(-0.1, D - t - 0.1, W + 0.1, D + 0.1); cap(-0.1, t, t + 0.1, D - t); cap(W - t - 0.1, t, W + 0.1, D - t);
  weather(F, 0, gateU - gateW / 2, -0.0, h, wm, rand, 0);
  weather(F, gateU + gateW / 2, W, -0.0, h, wm, rand, 0);
  // the gate: two posts, a lintel, a small tiled roof; the leaves stand open (or the one shut, by the house); the gate's step
  const rich = o.rich, gh = h + (rich ? 1.0 : 0.7);
  F.b('timber_red', gateU - gateW / 2 - 0.2, 0, -0.1, gateU - gateW / 2 + 0.1, gh, t + 0.1); F.b('timber_red', gateU + gateW / 2 - 0.1, 0, -0.1, gateU + gateW / 2 + 0.2, gh, t + 0.1);
  F.b('timber_red', gateU - gateW / 2 - 0.2, gh - 0.4, -0.12, gateU + gateW / 2 + 0.2, gh, t + 0.12, false);
  F.b('lacquer_black', gateU - gateW / 2 + 0.1, 0.14, -0.25, gateU - gateW / 2 + 0.2, h - 0.25, 0.9, false);
  if (o.shut) F.b('lacquer_black', gateU + gateW / 2 - 0.9, 0.14, 0.1, gateU + gateW / 2 - 0.1, h - 0.25, 0.2, false);
  F.b('bluestone', gateU - gateW / 2 - 0.3, 0, -0.55, gateU + gateW / 2 + 0.3, 0.14, 0.0, false);
  F.roof('gable_roof_c', gateU, t / 2, gateW / 2 + 1.0, 1.7, gh + 0.02, 1.5, { mat: o.thatch ? 'thatch' : 'tile_grey', soffit: 'timber_red', noHorns: true });
  // the lamp bracket (a bronze lamp on an iron arm) and a hanging cloth over the door of the better houses; a bench and a mounting stone by the gate
  if (rand() < 0.5) F.b('iron', gateU + gateW / 2 + 0.25, h - 0.9, -0.14, gateU + gateW / 2 + 0.55, h - 0.86, -0.1, false);
  if (rand() < 0.5) prop(F, F.ctx, 'bench', Math.min(W - 1.4, gateU + gateW / 2 + 1.5), -0.45, { len: 1.6 });
  else if (rand() < 0.4) prop(F, F.ctx, 'block', Math.max(1.0, gateU - gateW / 2 - 1.0), -0.55);
}

/** A hall: plaster walls on a low platform, a door and lattice windows on the front (v0), a gabled (or hipped, or thatched) roof, the front weathered. Returns the door's u. */
function hallBlock(F, u0, u1, v0, v1, H, wm, o, rand) {
  const w = u1 - u0, t = 0.4, P = 0.3, doorW = 1.7, du = u0 + w * (0.4 + rand() * 0.2);
  F.b('brick_paving', u0 - 0.5, 0, v0 - 0.9, u1 + 0.5, P, v1 + 0.2, false);
  F.floor(u0 - 0.5, v0 - 0.9, u1 + 0.5, v1 + 0.2, P);
  F.b('wood_dark', u0 + t, P, v0 + t, u1 - t, P + 0.03, v1 - t, false);
  F.b(wm, u0, P, v1 - t, u1, H, v1); F.b(wm, u0, P, v0, u0 + t, H, v1); F.b(wm, u1 - t, P, v0, u1, H, v1);
  F.b(wm, u0, P, v0, du - doorW / 2, H, v0 + t); F.b(wm, du + doorW / 2, P, v0, u1, H, v0 + t); F.b(wm, du - doorW / 2, P + 2.2, v0, du + doorW / 2, H, v0 + t);
  F.b('timber_red', du - doorW / 2 - 0.1, P, v0 - 0.05, du - doorW / 2 + 0.06, P + 2.2, v0 + t + 0.05, false); F.b('timber_red', du + doorW / 2 - 0.06, P, v0 - 0.05, du + doorW / 2 + 0.1, P + 2.2, v0 + t + 0.05, false);
  F.b('lacquer_black', du - doorW / 2 + 0.05, P, v0 + 0.05, du - doorW / 2 + 0.1 + (o.open ? 0 : 0.8), P + 2.1, v0 + 0.1 + (o.open ? 0.8 : 0), false);
  const win = (u, v, alongU, len) => (alongU ? F.b('lattice', u - len / 2, P + 1.0, v - 0.04, u + len / 2, P + 2.1, v + 0.04, false) : F.b('lattice', u - 0.04, P + 1.0, v - len / 2, u + 0.04, P + 2.1, v + len / 2, false));
  for (const uu of [u0 + w * 0.18, u1 - w * 0.18]) if (Math.abs(uu - du) > 1.7) win(uu, v0 - 0.01, true, 1.4);
  win(u0 - 0.01, (v0 + v1) / 2, false, 1.4); win(u1 + 0.01, (v0 + v1) / 2, false, 1.4);
  for (const uu of [u0 + 0.12, u0 + w / 3, u0 + 2 * w / 3, u1 - 0.12]) F.b('timber_red', uu - 0.14, P, v0 - 0.2, uu + 0.14, H, v0 + 0.08, false);
  F.b('timber_red', u0, H - 0.4, v0 - 0.22, u1, H, v0 + 0.08, false);
  weather(F, u0 + 0.2, u1 - 0.2, v0, H, wm, rand, P);
  const ov = 1.1, A = w / 2 + 0.9, B = (v1 - v0) / 2 + ov, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, rm = o.thatch ? 'thatch' : 'tile_grey';
  let el;
  if (o.hip) { el = F.roof('hip_roof', cu, cv, A, B, H + 0.1, 2.2 + B * 0.1, { mat: rm, soffit: 'timber_red', noChiwei: true, lift: 0.4, pow: 1.15 }); }
  else {
    el = F.roof('gable_roof_c', cu, cv, A, B, H + 0.1, 1.7 + B * 0.12, { mat: rm, soffit: o.thatch ? 'timber' : 'timber_red', noHorns: true });
    if (!o.thatch && !el.alongZ) eaveTilesGable(F.bag, el.c[0], el.c[1], el.A, el.B, H + 0.1);
  }
  return du;
}

// ── the rooms: furnished by trade (hall frame: front at v0 with the door at du; the room from u0 to u1, v0 to v1) ────────────────────────────────────────
function room(F, kind, u0, u1, v0, v1, du, rand, lights, P = 0.3) {
  const y = P + 0.03, mu = (u0 + u1) / 2, put = (mat, a, b, c, d, e, f, solid = false) => F.b(mat, a, b, c, d, e, f, solid);
  const lamp = (u, v, yy) => { const p = F.pt(u, v); F.bag.add('bronze', lathe([[0.15, 0], [0.04, 0.1], [0.035, 0.7], [0.1, 0.75], [0.14, 0.8]], 8, null, p[0], yy, p[1])); if (rand() < 0.6) lights.push({ at: [p[0], yy + 1.0, p[1]], color: '#ffc98a', intensity: 3, distance: 7 }); };
  const chest = (u, v) => put('lacquer_red', u, y + 0.01, v, u + 1.5, y + 0.7, v + 1.0, true);
  if (kind === 'dwelling') {
    put('reed_mat', mu - 1.4, y, v0 + 2.0, mu + 0.4, y + 0.03, v0 + 3.8); put('lacquer_black', mu - 0.9, y + 0.03, v0 + 2.5, mu - 0.1, y + 0.4, v0 + 3.2);
    put('timber', u1 - 3.4, y, v1 - 2.6, u1 - 0.6, y + 0.4, v1 - 0.6, true); put('cloth_indigo', u1 - 3.3, y + 0.4, v1 - 2.5, u1 - 0.7, y + 0.46, v1 - 0.7);
    put('lacquer_black', u1 - 3.5, y, v1 - 0.7, u1 - 0.5, y + 1.4, v1 - 0.58); chest(u0 + 0.7, v1 - 1.6);
    for (let k = 0; k < 5; k++) put(k % 2 ? 'wood_ochre' : 'bamboo_culm', u0 + 0.8 + k * 0.22, y + 0.7, v1 - 1.5, u0 + 0.95 + k * 0.22, y + 1.0, v1 - 0.7);
    lamp(mu + 1.2, v0 + 3.0, y);
  } else if (kind === 'kitchen') {
    // the stove (zao) of mud brick with its two pot-mouths and the flue, a great jar of water, the firewood, the cutting block, a basket of millet, the grinding mill
    put('mud_plaster', u0 + 0.5, y, v1 - 2.4, u0 + 3.2, y + 0.95, v1 - 0.5, true);
    for (const k of [0.9, 2.1]) F.bag.add('iron', lathe([[0.4, 0], [0.34, 0.1], [0.001, 0.12]], 8, null, ...(() => { const p = F.pt(u0 + k + 0.4, v1 - 1.4); return [p[0], y + 0.95, p[1]]; })()));
    put('mud_plaster', u0 + 0.9, y + 0.95, v1 - 0.9, u0 + 1.5, y + 3.3, v1 - 0.5);
    { const p = F.pt(u0 + 1.2, v1 - 1.4); lights.push({ at: [p[0], y + 1.3, p[1]], color: '#ff9f50', intensity: 3.5, distance: 6 }); }
    for (let k = 0; k < 3; k++) { const p = F.pt(u1 - 1.0 - k * 0.5, v1 - 0.8); F.bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.2], [0.38, 0.45], [0.28, 0.7], [0.2, 0.75], [0.001, 0.75]], 8, null, p[0], y, p[1])); }
    for (let k = 0; k < 5; k++) put(k % 2 ? 'wood_ochre' : 'timber', u0 + 3.5, y + k * 0.14, v1 - 2.2 + (k % 2) * 0.05, u0 + 5.0, y + k * 0.14 + 0.12, v1 - 1.6, k === 0);
    put('wood_dark', mu, y, v0 + 2.0, mu + 0.7, y + 0.5, v0 + 2.7, true);
    { const p = F.pt(mu - 1.8, v0 + 2.6); F.bag.add('granite_grey', lathe([[0.55, 0], [0.55, 0.28], [0.001, 0.3]], 10, null, p[0], y, p[1])); F.col.circle(p[0], p[1], 0.55, y, y + 0.3); }
  } else if (kind === 'loom') {
    // a standing loom (the Han frame loom with its treadle), the warp, a spinning wheel, baskets of silk and hemp, a reed mat to sit
    put('wood_dark', mu - 1.2, y, v0 + 2.2, mu - 1.05, y + 1.5, v0 + 3.4); put('wood_dark', mu + 1.05, y, v0 + 2.2, mu + 1.2, y + 1.5, v0 + 3.4);
    put('wood_dark', mu - 1.2, y + 1.4, v0 + 2.2, mu + 1.2, y + 1.5, v0 + 2.3); put('wood_dark', mu - 1.2, y + 0.5, v0 + 3.3, mu + 1.2, y + 0.58, v0 + 3.4);
    for (let k = 0; k < 14; k++) put('cloth_ochre', mu - 1.0 + k * 0.15, y + 0.58, v0 + 2.35 + 0.02, mu - 0.95 + k * 0.15, y + 1.4, v0 + 2.38);
    put('wood_dark', mu - 0.5, y, v0 + 1.2, mu + 0.5, y + 0.1, v0 + 2.1); put('cloth_red', mu - 0.9, y + 0.58, v0 + 3.0, mu + 0.9, y + 0.62, v0 + 3.3);
    { const p = F.pt(u1 - 1.5, v1 - 1.6); F.bag.add('wood_dark', lathe([[0.6, 0.0], [0.6, 0.06], [0.04, 0.08], [0.04, 0.9]], 10, null, p[0], y, p[1])); F.col.circle(p[0], p[1], 0.6, y, y + 0.9); }
    for (let k = 0; k < 3; k++) { const p = F.pt(u0 + 1.0 + k * 0.7, v1 - 1.0); F.bag.add('wicker', lathe([[0.3, 0], [0.34, 0.4], [0.001, 0.4]], 8, null, p[0], y, p[1])); }
    put('cloth_white', u0 + 0.5, y + 1.0, v1 - 0.55, u0 + 3.0, y + 1.9, v1 - 0.45); chest(u1 - 3.0, v1 - 1.3 - 0.0);
    lamp(u0 + 1.0, v0 + 2.3, y);
  } else if (kind === 'smithy') {
    // the forge of clay with its bellows (a pair of leather bags on a frame), the anvil block, tongs and hammers on a rack, a quench trough, iron bars
    put('mud_plaster', u0 + 0.6, y, v1 - 2.8, u0 + 3.0, y + 0.9, v1 - 0.5, true);
    { const p = F.pt(u0 + 1.8, v1 - 1.6); F.bag.add('flame', lathe([[0.001, 0], [0.4, 0], [0.2, 0.2], [0.001, 0.35]], 7, null, p[0], y + 0.9, p[1])); lights.push({ at: [p[0], y + 1.4, p[1]], color: '#ff7a30', intensity: 5, distance: 8 }); }
    put('hide_brown', u0 + 3.1, y + 0.3, v1 - 2.6, u0 + 4.5, y + 0.9, v1 - 1.6, true); put('wood_dark', u0 + 3.0, y, v1 - 2.7, u0 + 3.1, y + 0.4, v1 - 1.5);
    put('iron', mu - 0.2, y, v0 + 2.6, mu + 0.3, y + 0.55, v0 + 3.1, true); put('wood_dark', mu - 0.25, y, v0 + 2.55, mu + 0.35, y + 0.2, v0 + 3.15);
    put('wood_dark', u1 - 3.2, y, v1 - 1.0, u1 - 0.6, y + 0.04, v1 - 0.5); put('wood_dark', u1 - 3.2, y + 1.6, v1 - 0.6, u1 - 0.6, y + 1.7, v1 - 0.5);
    for (let k = 0; k < 6; k++) put('iron', u1 - 3.0 + k * 0.4, y + 0.8, v1 - 0.58, u1 - 2.95 + k * 0.4, y + 1.6, v1 - 0.52);
    { const p = F.pt(mu + 2.0, v0 + 2.8); F.bag.add('pottery_dark', lathe([[0.001, 0], [0.5, 0.0], [0.5, 0.45], [0.001, 0.45]], 8, null, p[0], y, p[1])); F.col.circle(p[0], p[1], 0.5, y, y + 0.45); }
    for (let k = 0; k < 8; k++) put('iron', u0 + 0.6, y + k * 0.06, v0 + 1.4 + k * 0.01, u0 + 2.2, y + k * 0.06 + 0.05, v0 + 1.45 + k * 0.01);
  } else if (kind === 'scribe') {
    // a low desk, a lamp, the bundles of bamboo slips on shelves, the brush and the ink, a mat; a tablet of the household register on the wall
    put('reed_mat', mu - 1.6, y, v0 + 1.8, mu + 1.0, y + 0.03, v0 + 3.6); put('lacquer_black', mu - 1.0, y + 0.03, v0 + 2.3, mu + 0.6, y + 0.45, v0 + 3.1, true);
    put('bamboo_culm', mu - 0.8, y + 0.45, v0 + 2.45, mu - 0.2, y + 0.5, v0 + 2.85); put('slate', mu + 0.1, y + 0.45, v0 + 2.5, mu + 0.35, y + 0.5, v0 + 2.75);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) put((q + r) % 3 ? 'bamboo_culm' : 'wood_ochre', u0 + 0.5 + q * 0.3, y + 0.15 + r * 0.45, v1 - 0.95, u0 + 0.75 + q * 0.3, y + 0.55 + r * 0.45, v1 - 0.5);
    put('timber', u0 + 0.4, y, v1 - 1.0, u0 + 3.0, y + 0.05, v1 - 0.45, true); put('lacquer_red', u1 - 2.4, y, v1 - 1.5, u1 - 0.6, y + 0.8, v1 - 0.6, true);
    lamp(mu + 1.5, v0 + 2.6, y);
  } else if (kind === 'store') {
    // a store: jars of grain and oil in rows, sacks to the beam, a balance, a measure (dou), the tally sticks
    for (let r = 0; r < 2; r++) for (let q = 0; q < 6; q++) { const p = F.pt(u0 + 0.9 + q * 0.85, v1 - 1.0 - r * 0.9); F.bag.add(q % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.2, 0], [0.34, 0.3], [0.4, 0.6], [0.28, 0.95], [0.2, 1.0], [0.22, 1.06], [0.001, 1.06]], 9, null, p[0], y, p[1])); F.col.circle(p[0], p[1], 0.38, y, y + 1.0); }
    for (let k = 0; k < 6; k++) put('sacking', u1 - 3.2 + (k % 3) * 1.0, y + Math.floor(k / 3) * 0.55, v0 + 1.8 + (k % 2) * 0.4, u1 - 2.4 + (k % 3) * 1.0, y + 0.55 + Math.floor(k / 3) * 0.55, v0 + 2.4 + (k % 2) * 0.4, k < 3);
    put('wood_dark', mu - 0.9, y, v0 + 2.2, mu - 0.8, y + 1.3, v0 + 2.3); put('wood_dark', mu - 0.9, y + 1.3, v0 + 2.2, mu + 0.3, y + 1.35, v0 + 2.3);
    put('wood_ochre', mu + 0.2, y, v0 + 2.9, mu + 0.7, y + 0.28, v0 + 3.4, true);
  }
}
const ROOMS = ['dwelling', 'dwelling', 'kitchen', 'loom', 'smithy', 'scribe', 'store'];

function sideWing(F, u0, u1, v0, v1, H, wm, o) {
  const t = 0.4, P = 0.25;
  F.b('brick_paving', u0 - 0.3, 0, v0 - 0.3, u1 + 0.3, P, v1 + 0.3, false);
  F.b(wm, u0, P, v0, u1, H, v0 + t); F.b(wm, u0, P, v1 - t, u1, H, v1); F.b(wm, u0, P, v0, u0 + t, H, v1); F.b(wm, u1 - t, P, v0 + t, u1, H, v1 - t);
  F.b('lattice', u0 + 0.5, P + 1.0, v0 + t - 0.06, u1 - 0.5, P + 2.0, v0 + t + 0.02, false);
  F.roof('gable_roof_c', (u0 + u1) / 2, (v0 + v1) / 2, (u1 - u0) / 2 + 0.7, (v1 - v0) / 2 + 0.9, H + 0.05, 1.4, { mat: o.thatch ? 'thatch' : 'tile_grey', soffit: o.thatch ? 'timber' : 'timber_red', noHorns: true });
}
/** The two-storey watch-tower house (lou): plaster walls, a balcony of red rails under the upper eave, a hipped roof over a smaller upper storey. */
function louBlock(F, cu, cv, a, H1, H2, wm, rand) {
  const P = 0.3;
  F.b('brick_paving', cu - a - 0.4, 0, cv - a - 0.4, cu + a + 0.4, P, cv + a + 0.4, false);
  F.b(wm, cu - a, P, cv - a, cu + a, P + H1, cv + a);
  F.b('lime_plaster', cu - a - 0.03, P, cv - a - 0.03, cu + a + 0.03, P + 0.8, cv + a + 0.03, false);
  F.b('lattice', cu - a * 0.4, P + 1.2, cv - a - 0.05, cu + a * 0.4, P + 2.5, cv - a + 0.03, false);
  F.roof('hip_roof', cu, cv, a + 1.1, a + 1.1, P + H1, 1.1, { mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.3, pow: 1.1 });
  const y2 = P + H1 + 0.5, b = a * 0.74;
  F.b('timber_red', cu - b - 0.1, y2, cv - b - 0.1, cu + b + 0.1, y2 + 0.18, cv + b + 0.1, false);
  F.b(wm, cu - b, y2 + 0.18, cv - b, cu + b, y2 + 0.18 + H2, cv + b);
  F.b('lattice', cu - b * 0.5, y2 + 1.1, cv - b - 0.05, cu + b * 0.5, y2 + 2.1, cv - b + 0.03, false);
  F.b('lattice', cu - b - 0.05, y2 + 1.1, cv - b * 0.5, cu - b + 0.03, y2 + 2.1, cv + b * 0.5, false);
  F.roof('hip_roof', cu, cv, b + 1.3, b + 1.3, y2 + 0.18 + H2, 2.0, { mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, lift: 0.4, pow: 1.15 });
  F.b('tile_dark', cu - 0.22, y2 + 0.18 + H2 + 1.95, cv - 0.22, cu + 0.22, y2 + 0.18 + H2 + 2.7, cv + 0.22, false);
  // the beacon drum (the watch-house's) hung under the upper eave, the ladder up the side
  F.b('lacquer_red', cu + b - 0.4, y2 + 0.18 + H2 - 1.2, cv - b - 0.5, cu + b + 0.2, y2 + 0.18 + H2 - 0.5, cv - b - 0.2, false);
  for (let k = 0; k < 12; k++) F.b('wood_dark', cu - a - 0.55, P + 0.3 + k * 0.3, cv - 0.5, cu - a - 0.45, P + 0.34 + k * 0.3, cv + 0.5, false);
  void rand;
}
/** The yard: a brick path from the gate to the hall, the well, a millet stack, a pen, a mortar, jars, a hen-coop, a clothes pole — each by chance and by the lot's size. */
function yard(F, W, D, gateU, hallV0, rand, o) {
  const ctx = F.ctx;
  if (!o.noFront) F.b('brick_paving', gateU - 0.8, 0, 0.5, gateU + 0.8, 0.04, hallV0 - 0.2, false);
  const spots = [];
  const free = (u, v, r) => spots.every(([a, b, q]) => Math.hypot(a - u, b - v) > r + q + 0.3);
  const put = (kind, u, v, r, extra = {}) => { if (u < 1.0 || u > W - 1.0 || v < 1.6 || v > hallV0 - 1.2 || !free(u, v, r)) return false; spots.push([u, v, r]); prop(F, ctx, kind, u, v, extra); return true; };
  const mid = (hallV0 + 1.6) / 2;
  if (rand() < 0.65) put('well', gateU + (rand() < 0.5 ? 3.2 : -3.2), mid - 1, 1.1);
  if (rand() < 0.6) put('stack', rand() < 0.5 ? 1.9 : W - 1.9, hallV0 - 2.6, 1.3, { r: 0.9 + rand() * 0.4 });
  if (rand() < 0.55) put('jars', 1.8 + rand() * (W - 3.6), hallV0 - 1.6, 0.9, { seed: Math.floor(rand() * 99), n: 3 + Math.floor(rand() * 3) });
  if (rand() < 0.5) {
    // a pen of rough poles with a pig or a few hens (the animals are the street life's) in the corner
    const u = rand() < 0.5 ? 1.2 : W - 3.8, v = mid + 1.2;
    if (free(u + 1.3, v + 1.1, 1.8) && v + 2.2 < hallV0 - 0.8 && u > 0.8 && u + 2.6 < W - 0.8) {
      spots.push([u + 1.3, v + 1.1, 1.8]);
      for (let k = 0; k <= 4; k++) { F.b('wood_dark', u + k * 0.65 - 0.04, 0, v - 0.04, u + k * 0.65 + 0.04, 0.9, v + 0.04, false); F.b('wood_dark', u + k * 0.65 - 0.04, 0, v + 2.2 - 0.04, u + k * 0.65 + 0.04, 0.9, v + 2.2 + 0.04, false); }
      for (let k = 0; k <= 3; k++) { F.b('wood_dark', u - 0.04, 0, v + k * 0.73 - 0.04, u + 0.04, 0.9, v + k * 0.73 + 0.04, false); F.b('wood_dark', u + 2.6 - 0.04, 0, v + k * 0.73 - 0.04, u + 2.6 + 0.04, 0.9, v + k * 0.73 + 0.04, false); }
      for (const hh of [0.35, 0.7]) { F.b('wood_dark', u, hh, v - 0.03, u + 2.6, hh + 0.06, v + 0.03, false); F.b('wood_dark', u, hh, v + 2.17, u + 2.6, hh + 0.06, v + 2.23, false); }
      F.b('timber', u, 0, v, u + 2.6, 0.04, v + 2.2, false);
    }
  }
  if (rand() < 0.35) {
    // a clothes line between two poles with washing hung on it (cloth in the wind), the line along the lane
    const u0 = 2.0 + rand() * 1.5, u1 = Math.min(W - 2.0, u0 + 3.4), v = mid + 2.6 * (rand() - 0.5);
    if (free((u0 + u1) / 2, v, 1.8)) {
      spots.push([(u0 + u1) / 2, v, 1.8]);
      for (const u of [u0, u1]) F.b('wood_dark', u - 0.04, 0, v - 0.04, u + 0.04, 2.2, v + 0.04, false);
      F.b('rope_fibre', u0, 2.1, v - 0.01, u1, 2.13, v + 0.01, false);
      const cl = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_brown'];
      for (let k = 0; k < 3; k++) { const u = u0 + 0.3 + k * 1.0, a = F.pt(u, v - 0.03), b = F.pt(u + 0.75, v + 0.03), g = clothBox(Math.min(a[0], b[0]), 1.15, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 2.1, Math.max(a[1], b[1]), 0.3); addCloth(F.bag, cl[Math.floor(rand() * cl.length)], g, 2.1); }
    }
  }
  if (rand() < 0.4) put('block', gateU + (rand() < 0.5 ? 2.0 : -2.0), mid + 2.2, 0.7, { turn: 0 });
}

/** wei_house: { rect, front, kind ('court' | 'row' | 'tower'), seed, open } */
export function house(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, kind = el.kind;
  const wm = WALLS[Math.floor(rand() * WALLS.length)], H = 3.3 + rand() * 0.4, wallH = 2.2 + rand() * 0.6;
  const gateU = Math.max(1.6, Math.min(W - 1.6, W * (0.25 + 0.5 * rand()))), room0 = pickOf(rand, ROOMS);
  const poor = kind === 'row' && rand() < 0.45, rich = kind === 'court' && rand() < 0.3 && W > 11.5;
  const o = { open: el.open, thatch: poor, hip: rich, rich, shut: !el.open && rand() < 0.5 };
  if (kind === 'row') {
    // a single hall on the lane's side with a yard behind: the poorer house (under thatch in a part of them)
    perimeter(F, W, D, wallH - 0.2, gateU, 1.7, wm, rand, { ...o, noFront: true });
    const hv = 1.4, hv1 = hv + 6.4;
    hallBlock(F, 0.5, W - 0.5, hv, hv1, H - 0.2, wm, o, rand);
    if (el.open) room(F, room0, 0.5, W - 0.5, hv, hv1, 0, rand, ctx.lights);
    yard(F, W, D, W / 2, D, rand, { noFront: true });
    // the door lintel hung with a bundle of mugwort or a cloth, a lamp over it
    F.b('cloth_red', W / 2 - 0.2, H - 1.3, hv - 0.3, W / 2 + 0.2, H - 0.7, hv - 0.27, false);
    F.b('bluestone', W - 2.6, 0, D - 3.2, W - 0.9, 0.6, D - 1.5);
    return;
  }
  perimeter(F, W, D, wallH, gateU, 1.8, wm, rand, o);
  if (kind === 'tower') {
    const a = Math.min(2.8, (W - 3.4) / 2);
    louBlock(F, W - a - 1.0, 5.6 + a, a, 3.4, 3.0, wm, rand);
    hallBlock(F, 1.0, W - 1.0, D - 7.0, D - 0.9, H - 0.2, wm, o, rand);
    if (el.open) room(F, room0 === 'dwelling' ? 'store' : room0, 1.0, W - 1.0, D - 7.0, D - 0.9, 0, rand, ctx.lights);
    yard(F, W, D, gateU, D - 7.0, rand, {});
    return;
  }
  // the court house: the hall at the back across the yard, a wing along one side (a workroom), the yard furnished
  const hallV0 = D - 7.8;
  hallBlock(F, 1.0, W - 1.0, hallV0, D - 0.9, H, wm, o, rand);
  if (el.open) room(F, room0, 1.0, W - 1.0, hallV0, D - 0.9, 0, rand, ctx.lights);
  let wing = false;
  if (rand() < 0.8) { const left = rand() < 0.5; sideWing(F, left ? 0.8 : W - 4.2, left ? 4.2 : W - 0.8, 3.4, hallV0 - 1.6, H - 0.5, wm, o); wing = true; }
  yard(F, W, D, gateU, hallV0 - (wing ? 0 : 0), rand, {});
  F.b('bluestone', W / 2 - 0.6 + (rand() - 0.5) * 2, 0, hallV0 - 3.4, W / 2 + 0.6 + (rand() - 0.5) * 2, 0.6, hallV0 - 2.2);
}

/** wei_office: { rect, seed, open } — an office (shu) on the great avenue: a walled compound with its gate on the south, the board of orders, drum and halberd rack before it, a hall with desk and shelves. */
export function office(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed), W = x1 - x0, cx = (x0 + x1) / 2;
  const F = lotFrame(ctx, el.rect, 's');
  perimeter(F, W, z1 - z0, 2.6, W / 2, 4.2, 'earth_wall', rand, { rich: true, open: true });
  ctx.style.elements.han_hall({ cx, z1: z1 - 7.2, bays: 3, bayW: 4.2, depth: 2, depthW: 5.6, floor: 0.6, h: 4.2, base: 0.6, roof: 'gable', rise: 2.0, overhang: 2.2, ap: 1.0, furnish: el.open ? 'office' : undefined, seed: el.seed, open: [1, 1] }, ctx);
  // before the gate, on the avenue: the board of orders, the officers' hitching rail, a halberd rack, a drum on its stand; a lantern-less lamp bracket
  prop(F, ctx, 'board', W / 2 + 4.0, -1.0, { turn: Math.PI });
  prop(F, ctx, 'rail', W / 2 - 5.0, -1.2, { len: 3.4, turn: Math.PI / 2 });
  if (rand() < 0.5) prop(F, ctx, 'rack', W / 2 - 3.2, 0.8, { n: 6, turn: Math.PI });
  if (rand() < 0.4) prop(F, ctx, 'drum', W / 2 + 3.6, 1.4, { turn: Math.PI });
  // the yard behind the gate: a well, jars, a lamp
  prop(F, ctx, 'well', 2.0, 7.0, {});
  prop(F, ctx, 'jars', W - 2.2, 7.4, { seed: el.seed, n: 4 });
  F.b('bluestone', W / 2 - 1.0, 0, 1.0, W / 2 + 1.0, 0.05, 11.5, false);
}

// ── the shops of the market ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TRADES = ['silk', 'pottery', 'lacquer', 'bronze', 'grain', 'baskets', 'iron', 'cloth', 'wine', 'salt', 'books', 'fish'];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_green'];

/** wei_shop_row: { rect, front, n, seed } — n shops side by side under one tiled roof; the front open, a door through the counter, a shelf at the back, the trade's goods, a hanging sign. */
export function shopRow(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, n = el.n ?? Math.max(1, Math.round(W / 5.2)), sw = W / n, H = 3.2;
  F.b('brick_paving', -0.2, 0, -0.9, W + 0.2, 0.2, D, false);
  F.b('earth_wall', 0, 0.2, D - 0.4, W, H, D); F.b('earth_wall', 0, 0.2, 0, 0.4, H, D); F.b('earth_wall', W - 0.4, 0.2, 0, W, H, D);
  for (let i = 0; i <= n; i++) { const u = i * sw; F.b('timber_red', u - 0.14, 0.2, -0.3, u + 0.14, H, 0.0, false); if (i > 0 && i < n) F.b('earth_wall', u - 0.15, 0.2, 0, u + 0.15, H, D - 0.4); }
  F.b('timber_red', 0, H - 0.4, -0.32, W, H, 0.0, false);
  const el2 = F.roof('gable_roof_c', W / 2, D / 2 - 0.1, W / 2 + 0.6, D / 2 + 1.1, H + 0.05, 1.5, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
  if (!el2.alongZ) eaveTilesGable(F.bag, el2.c[0], el2.c[1], el2.A, el2.B, H + 0.05);
  weather(F, 0, W, 0.0, H, 'earth_wall', rand, 0.2, false);
  for (let i = 0; i < n; i++) {
    const u0 = i * sw, kind = TRADES[Math.floor(rand() * TRADES.length)], awn = AWN[Math.floor(rand() * AWN.length)], door = rand() < 0.5 ? 0.3 : sw - 1.5;
    // the counter, with the way in at one end of it; the awning shading the front
    if (door < 1) F.b('lacquer_black', u0 + 1.5, 0.2, 0.05, u0 + sw - 0.3, 1.05, 0.7, true); else F.b('lacquer_black', u0 + 0.3, 0.2, 0.05, u0 + sw - 1.5, 1.05, 0.7, true);
    const a = F.pt(u0 + 0.2, 0), b = F.pt(u0 + sw - 0.2, -0.9);
    addCloth(F.bag, awn, clothBox(Math.min(a[0], b[0]), H - 0.9, Math.min(a[1], b[1]), Math.max(a[0], b[0]), H - 0.3, Math.max(a[1], b[1]), 0.3), H - 0.3);
    const put = (u, v, y, fn) => { const p = F.pt(u, v); fn(p[0], y, p[1]); };
    const gu = door < 1 ? u0 + 0.3 : u0 + sw - 1.5;
    if (kind === 'silk' || kind === 'cloth') for (let k = 0; k < 5; k++) F.b(AWN[(k + i) % AWN.length], u0 + 0.5 + k * 0.7, 1.05, 0.1, u0 + 1.0 + k * 0.7, 1.2 + 0.15 * (k % 3), 0.62, false);
    else if (kind === 'pottery' || kind === 'baskets') for (let k = 0; k < 4; k++) put(u0 + 0.8 + k * 0.9, 0.4, 1.05, (x, y, z) => F.bag.add(kind === 'pottery' ? 'pottery_dark' : 'wicker', lathe([[0.001, 0], [0.2, 0.05], [0.28, 0.3], [0.2, 0.5], [0.14, 0.55], [0.001, 0.55]], 8, null, x, y, z)));
    else if (kind === 'lacquer' || kind === 'books') for (let k = 0; k < 5; k++) F.b(kind === 'books' ? (k % 2 ? 'bamboo_culm' : 'wood_ochre') : (k % 2 ? 'lacquer_red' : 'lacquer_black'), u0 + 0.5 + k * 0.75, 1.05, 0.15, u0 + 1.0 + k * 0.75, 1.3, 0.6, false);
    else if (kind === 'bronze') for (let k = 0; k < 4; k++) put(u0 + 0.8 + k * 0.9, 0.4, 1.05, (x, y, z) => F.bag.add('bronze', lathe([[0.15, 0], [0.12, 0.08], [0.22, 0.22], [0.2, 0.3], [0.001, 0.3]], 8, null, x, y, z)));
    else if (kind === 'iron') for (let k = 0; k < 5; k++) F.b('iron', u0 + 0.5 + k * 0.7, 1.05, 0.15, u0 + 0.6 + k * 0.7, 1.55, 0.2, false);
    else if (kind === 'wine' || kind === 'salt') for (let k = 0; k < 3; k++) put(u0 + 0.9 + k * 1.1, 0.4, 1.05, (x, y, z) => F.bag.add(kind === 'wine' ? 'glaze_green' : 'sacking', lathe([[0.001, 0], [0.22, 0.05], [0.3, 0.3], [0.2, 0.55], [0.1, 0.62], [0.001, 0.62]], 8, null, x, y, z)));
    else if (kind === 'fish') { F.b('wicker', u0 + 0.6, 1.05, 0.12, u0 + sw - 0.6, 1.12, 0.62, false); for (let k = 0; k < 5; k++) F.b('hide_grey', u0 + 0.8 + k * 0.6, 1.12, 0.2 + (k % 2) * 0.12, u0 + 1.2 + k * 0.6, 1.16, 0.34 + (k % 2) * 0.12, false); }
    else for (let k = 0; k < 3; k++) F.b('sacking', u0 + 0.6 + k * 1.0, 0.2, 1.2 + (k % 2) * 0.8, u0 + 1.4 + k * 1.0, 0.9, 1.8 + (k % 2) * 0.8, false);
    // inside: a shelf on the back wall with the stock, a stool and a lamp; the way in is clear
    const su0 = door < 1 ? u0 + 1.0 : u0 + 0.6;
    F.b('timber', su0, 0.2, D - 1.0, su0 + 2.8, 0.25, D - 0.45, false);
    F.b('timber', su0, 0.2, D - 0.5, su0 + 2.8, 2.2, D - 0.42, false);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) F.b(AWN[(k + r + i) % AWN.length], su0 + 0.1 + k * 0.52, 0.5 + r * 0.6, D - 0.9, su0 + 0.5 + k * 0.52, 0.85 + r * 0.6, D - 0.48, false);
    F.b('wood_dark', gu + 0.5, 0.2, 2.2, gu + 0.95, 0.6, 2.65, false);
    // the sign: a vertical board hung on a bracket at the corner, or a cloth streamer on a pole
    if (rand() < 0.7) {
      F.b('timber', u0 + 0.1, 2.2, -0.62, u0 + 0.9, 2.26, -0.58, false);
      F.b('lacquer_red', u0 + 0.3, 1.4, -0.64, u0 + 0.75, 2.2, -0.6, false); F.b('gilt_bronze', u0 + 0.4, 1.55, -0.655, u0 + 0.65, 2.05, -0.64, false);
    }
    if (rand() < 0.35) { F.b('timber', u0 + sw - 0.15, 0.2, -0.62, u0 + sw - 0.07, 4.6, -0.54, false); const a2 = F.pt(u0 + sw - 0.07, -0.6), b2 = F.pt(u0 + sw - 0.07, -0.56), g = clothBox(Math.min(a2[0], b2[0]) - 0.0, 3.0, Math.min(a2[1], b2[1]), Math.max(a2[0], b2[0]) + 0.5, 4.5, Math.max(a2[1], b2[1]) + 0.5, 0.3); void g; F.b('timber', u0 + sw - 0.15, 4.5, -0.62, u0 + sw - 0.07 + 0.01, 4.6, -0.54, false); }
    if (i === 0 && rand() < 0.5) { const p = F.pt(0.5, -1.4); ctx.style.elements.wei_prop({ kind: 'stall', at: p, yaw: 0, w: 2.4, cloth: AWN[Math.floor(rand() * AWN.length)], seed: el.seed }, ctx); }
  }
  void hipLite; void eaveTiles;
}
