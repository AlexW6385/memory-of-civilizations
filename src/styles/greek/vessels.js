// The Attic vases and the things of clay (docs/settlements/athens.md §11a): the shapes of the potters of the Kerameikos
// as profiles turned on the lathe — the neck-amphora, the hydria, the bell krater, the kylix, the lekythos, the
// oinochoe, the pithos — in the black of the slip with a reserved panel of clay's own red (the black-figure vase) or the
// reverse; the roof tiles (pan and cover) the tile-makers stacked; the kiln of the potter's yard.

import { box, lathe, rod } from '../../core/geom.js';

/** Profiles [r, y] from the foot up (metres, the usual size), the lip, then back in to the axis; `band` the body's reserved panel (indices i0…i1). */
export const SHAPES = {
  amphora: { p: [[0.001, 0], [0.07, 0], [0.072, 0.03], [0.1, 0.08], [0.17, 0.2], [0.2, 0.3], [0.19, 0.4], [0.12, 0.5], [0.08, 0.55], [0.074, 0.65], [0.098, 0.7], [0.1, 0.725], [0.07, 0.725], [0.065, 0.68], [0.001, 0.68]], band: [4, 6], handles: [[0.08, 0.64, 0.19, 0.5]] },
  hydria: { p: [[0.001, 0], [0.08, 0], [0.09, 0.04], [0.16, 0.15], [0.2, 0.28], [0.19, 0.36], [0.13, 0.41], [0.09, 0.45], [0.09, 0.5], [0.125, 0.55], [0.128, 0.565], [0.08, 0.565], [0.075, 0.53], [0.001, 0.53]], band: [3, 5], handles: [[0.2, 0.28, 0.27, 0.28], [0.09, 0.5, 0.2, 0.4]] },
  krater: { p: [[0.001, 0], [0.13, 0], [0.13, 0.05], [0.08, 0.08], [0.1, 0.12], [0.16, 0.2], [0.2, 0.32], [0.24, 0.46], [0.28, 0.52], [0.27, 0.535], [0.22, 0.48], [0.001, 0.46]], band: [5, 7], handles: [] },
  kylix: { p: [[0.001, 0], [0.035, 0], [0.035, 0.008], [0.01, 0.02], [0.009, 0.045], [0.06, 0.06], [0.1, 0.085], [0.095, 0.088], [0.055, 0.066], [0.001, 0.06]], band: null, handles: [] },
  lekythos: { p: [[0.001, 0], [0.04, 0], [0.045, 0.02], [0.048, 0.2], [0.04, 0.24], [0.02, 0.27], [0.02, 0.32], [0.045, 0.34], [0.001, 0.34]], band: null, handles: [[0.02, 0.31, 0.06, 0.22]], white: true },
  oinochoe: { p: [[0.001, 0], [0.05, 0], [0.09, 0.08], [0.1, 0.16], [0.06, 0.22], [0.04, 0.27], [0.06, 0.3], [0.001, 0.29]], band: [2, 3], handles: [[0.045, 0.28, 0.1, 0.12]] },
  pithos: { p: [[0.001, 0], [0.2, 0], [0.3, 0.2], [0.38, 0.5], [0.36, 0.8], [0.28, 1.0], [0.22, 1.05], [0.25, 1.09], [0.22, 1.1], [0.2, 1.06], [0.001, 1.05]], band: null, handles: [] },
  psykter: { p: [[0.001, 0], [0.07, 0], [0.12, 0.06], [0.19, 0.18], [0.2, 0.28], [0.12, 0.34], [0.09, 0.38], [0.11, 0.4], [0.001, 0.4]], band: [3, 4], handles: [] },
};

/**
 * One vase into the bag: x, y, z the foot's middle; o: { s (scale), dark (black body with the red panel; else the clay's red with a black panel),
 * tilt (about x), rot (yaw of the tilt), seg (turning segments) }. The panel is a thin ring of the other colour standing 4 mm clear of the body.
 */
export function vase(bag, name, x, y, z, o = {}) {
  const S = SHAPES[name], s = o.s ?? 1, dark = o.dark ?? (name !== 'pithos'), seg = o.seg ?? 12;
  const body = o.mat ?? (S.white ? 'plaster_white' : dark ? 'pottery_dark' : 'terracotta'), pan = dark ? 'terracotta' : 'pottery_dark';
  const prof = S.p.map(([r, h]) => [r * s, h * s]);
  const place = (g) => { if (o.tilt) { g.rotateX(o.tilt); if (o.rot) g.rotateY(o.rot); } return g.translate(x, y, z); };
  bag.add(body, place(lathe(prof, seg)));
  if (S.band && !o.mat) {
    const [i0, i1] = S.band, ring = [];
    for (let i = i0; i <= i1; i++) ring.push([prof[i][0] + 0.004 * s, prof[i][1]]);
    bag.add(pan, place(lathe(ring, seg)));
  }
  for (const [r0, h0, r1, h1] of S.handles) {
    const a = [r0 * s, h0 * s, 0], b = [r1 * s, h1 * s, 0];
    for (const sg of name === 'hydria' && h0 < 0.4 ? [1, -1] : name === 'lekythos' || name === 'oinochoe' ? [1] : [1, -1]) {
      const m = [((a[0] + b[0]) / 2 + 0.035 * s) * sg, (a[1] + b[1]) / 2, 0], rr = 0.011 * s + 0.003;
      bag.add(body, place(rod([a[0] * sg, a[1], 0], m, rr, 4))); bag.add(body, place(rod(m, [b[0] * sg, b[1], 0], rr, 4)));
    }
  }
}
/** A leaning stack: a row of amphorae against a wall (the neck up), at x along z or x. */
export function leaning(bag, x, y, z, n, dx, dz, o = {}) {
  for (let k = 0; k < n; k++) vase(bag, o.name ?? 'amphora', x + dx * k, y, z + dz * k, { s: o.s ?? 1, dark: o.dark ?? false, tilt: o.tilt ?? 0, rot: o.rot ?? 0, seg: o.seg ?? 10 });
}
/** A pan tile (flat, with raised edges) and a cover tile (a narrow arch), lying along z: length 0.62 m, width 0.55 m. */
export function roofTiles(bag, x, y, z, along = 'z', pairs = 6) {
  for (let k = 0; k < pairs; k++) {
    const u = k * 0.5, pan = along === 'z' ? box(x + u, y, z, x + u + 0.44, y + 0.025, z + 0.62) : box(x, y, z + u, x + 0.62, y + 0.025, z + u + 0.44);
    bag.add('roof_tile', pan);
    bag.add('roof_tile', along === 'z' ? box(x + u + 0.15, y + 0.025, z, x + u + 0.29, y + 0.06, z + 0.62) : box(x, y + 0.025, z + u + 0.15, x + 0.62, y + 0.06, z + u + 0.29));
  }
}
/**
 * The potter's updraught kiln: a firing chamber of clay-plastered brick on a ring of rubble, a domed top with its vent and
 * a clay-stopped peep-hole, the stoking tunnel (the praefurnium) on one side with its arched mouth blackened, an ash heap
 * and a stack of firewood beside it. (x, z) the centre, rot the way the mouth looks, one of the four axes (0: +x, π/2: +z, π: −x, −π/2: −z).
 */
export function kiln(ctx, x, y, z, rot, { glow = false } = {}) {
  const { bag, col, lights } = ctx, c = Math.cos(rot), s = Math.sin(rot);
  bag.add('rubble', lathe([[1.38, 0], [1.38, 0.35], [1.28, 0.38], [0.001, 0.38]], 16, null, x, y - 0.2, z));
  // the dome, laid in courses, its top left open as the vent
  bag.add('mud_plaster', lathe([[1.22, 0.18], [1.24, 0.9], [1.12, 1.35], [0.88, 1.72], [0.55, 1.98], [0.3, 2.1], [0.26, 2.1], [0.26, 2.04], [0.5, 1.9]], 18, null, x, y, z));
  bag.add('brick', lathe([[1.255, 0.2], [1.265, 0.55], [1.235, 0.9], [1.14, 1.34]], 18, null, x, y, z));
  bag.add('lacquer_black', lathe([[0.31, 2.09], [0.3, 2.12], [0.27, 2.115], [0.26, 2.1]], 12, null, x, y, z));
  // the stoking tunnel: a vaulted block with the black mouth
  const alongX = Math.abs(c) > 0.7;
  if (alongX) {
    const sx = Math.sign(c), x0 = x + sx * 0.9, x1 = x + sx * 2.7;
    bag.add('mud_plaster', box(Math.min(x0, x1), y, z - 0.62, Math.max(x0, x1), y + 0.95, z + 0.62));
    bag.add('rubble', box(Math.min(x0, x1), y - 0.2, z - 0.7, Math.max(x0, x1), y, z + 0.7));
    bag.add('lacquer_black', box(sx > 0 ? x1 : x1 - 0.01, y + 0.02, z - 0.3, sx > 0 ? x1 + 0.01 : x1, y + 0.62, z + 0.3));
    bag.add('timber', box(sx > 0 ? x1 : x1 - 0.05, y + 0.62, z - 0.4, sx > 0 ? x1 + 0.05 : x1, y + 0.7, z + 0.4));
    bag.add('lacquer_black', box(Math.min(x1, x1 + sx * 1.1), y - 0.01, z - 0.7, Math.max(x1, x1 + sx * 1.1), y + 0.01, z + 0.7));   // the sooted ground before the mouth
    col.rect([Math.min(x0, x1), z - 0.7, Math.max(x0, x1), z + 0.7], y, y + 0.95);
    if (glow) bag.add('flame', lathe([[0.001, 0], [0.14, 0.03], [0.04, 0.3], [0.001, 0.4]], 6, null, x1 - sx * 0.1, y + 0.05, z));
    if (glow && lights) lights.push({ at: [x1 + sx * 0.4, y + 0.5, z], color: '#ff7a2a', intensity: 2.4, distance: 7 });
    // the firewood and the ash
    for (let k = 0; k < 5; k++) for (let j = 0; j < 4 - (k > 2 ? 1 : 0); j++) bag.add('log_pine', rod([x + sx * 4.2 - 0.55, y + 0.1 + k * 0.17, z + 1.5 + j * 0.2 - k * 0.04], [x + sx * 4.2 + 0.55, y + 0.1 + k * 0.17, z + 1.5 + j * 0.2 - k * 0.04], 0.085, 6));
    bag.add('lacquer_black', lathe([[0.7, 0], [0.55, 0.06], [0.001, 0.1]], 10, null, x1 + sx * 0.7, y, z - 1.1));
    col.rect([x + sx * 3.6, z + 1.4, x + sx * 4.8, z + 2.3], y, y + 1.0);
  } else {
    const sz = Math.sign(s), z0 = z + sz * 0.9, z1 = z + sz * 2.7;
    bag.add('mud_plaster', box(x - 0.62, y, Math.min(z0, z1), x + 0.62, y + 0.95, Math.max(z0, z1)));
    bag.add('rubble', box(x - 0.7, y - 0.2, Math.min(z0, z1), x + 0.7, y, Math.max(z0, z1)));
    bag.add('lacquer_black', box(x - 0.3, y + 0.02, sz > 0 ? z1 : z1 - 0.01, x + 0.3, y + 0.62, sz > 0 ? z1 + 0.01 : z1));
    bag.add('timber', box(x - 0.4, y + 0.62, sz > 0 ? z1 : z1 - 0.05, x + 0.4, y + 0.7, sz > 0 ? z1 + 0.05 : z1));
    bag.add('lacquer_black', box(x - 0.7, y - 0.01, Math.min(z1, z1 + sz * 1.1), x + 0.7, y + 0.01, Math.max(z1, z1 + sz * 1.1)));
    col.rect([x - 0.7, Math.min(z0, z1), x + 0.7, Math.max(z0, z1)], y, y + 0.95);
    if (glow) bag.add('flame', lathe([[0.001, 0], [0.14, 0.03], [0.04, 0.3], [0.001, 0.4]], 6, null, x, y + 0.05, z1 - sz * 0.1));
    if (glow && lights) lights.push({ at: [x, y + 0.5, z1 + sz * 0.4], color: '#ff7a2a', intensity: 2.4, distance: 7 });
    for (let k = 0; k < 5; k++) for (let j = 0; j < 4 - (k > 2 ? 1 : 0); j++) bag.add('log_pine', rod([x + 1.5 + j * 0.2 - k * 0.04, y + 0.1 + k * 0.17, z + sz * 4.2 - 0.55], [x + 1.5 + j * 0.2 - k * 0.04, y + 0.1 + k * 0.17, z + sz * 4.2 + 0.55], 0.085, 6));
    bag.add('lacquer_black', lathe([[0.7, 0], [0.55, 0.06], [0.001, 0.1]], 10, null, x - 1.1, y, z1 + sz * 0.7));
    col.rect([x + 1.4, z + sz * 3.6, x + 2.3, z + sz * 4.8], y, y + 1.0);
  }
  col.circle(x, z, 1.4, y, y + 2.1);
}
