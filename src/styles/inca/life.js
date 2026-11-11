// The things of the Inca house and town (docs/settlements/machu-picchu.md §4.4, §5.1): the urpu (the
// "aryballos") and the cooking pots, the clay stove, the mats and blankets of the bare floor, the grinding
// stone; the foot plough (chakitaqlla); the quarry's broken granite; the Funerary Rock.

import { box, lathe, frustum, rod, fromTriangles, orientOutward } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * The urpu at (x, y, z), height h, turned by `yaw`: the pointed base (set a little into the earth floor),
 * the big globular chamber, the tall neck flaring to the rim; two strap handles low on the body and the
 * lug on the shoulder round which the carrying rope was tied [stated: Met Museum, "Urpu (jar)"]; cream
 * slip with its bands of red and black [stated: same] — the body terracotta, a dark band at the neck.
 */
export function urpu(bag, x, y, z, h, yaw = 0) {
  const k = h / 0.8;
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.03], [0.15, 0.13], [0.22, 0.27], [0.235, 0.38], [0.2, 0.5], [0.12, 0.57], [0.075, 0.6], [0.07, 0.68], [0.085, 0.75], [0.11, 0.8], [0.1, 0.805], [0.06, 0.77], [0.05, 0.7], [0.001, 0.7]].map(([r, v]) => [r * k, v * k]), 16, null, x, y, z));
  bag.add('pottery_dark', lathe([[0.072 * k, 0.6 * k], [0.074 * k, 0.64 * k], [0.072 * k, 0.645 * k]], 16, null, x, y, z));
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v, w) => [x + (u * c + w * s) * k, y + v * k, z + (-u * s + w * c) * k];
  for (const sd of [-1, 1]) bag.add('terracotta', rod(P(sd * 0.2, 0.18, 0.06), P(sd * 0.23, 0.29, 0.07), 0.018 * k, 6));
  bag.add('terracotta', rod(P(0, 0.47, -0.17), P(0, 0.47, -0.235), 0.03 * k, 7));
}
/** A cooking pot (olla): globular, a short neck, a flat base; or a shallow bowl. */
function olla(bag, x, y, z, r, mat = 'pottery_dark') {
  bag.add(mat, lathe([[0.001, 0], [r * 0.6, 0], [r * 0.95, r * 0.45], [r, r * 0.8], [r * 0.75, r * 1.25], [r * 0.62, r * 1.35], [r * 0.68, r * 1.45], [r * 0.58, r * 1.42], [r * 0.5, r * 1.3], [0.001, r * 1.25]], 12, null, x, y, z));
}
function bowl(bag, x, y, z, r, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [r * 0.45, 0], [r * 0.85, r * 0.22], [r, r * 0.42], [r * 0.93, r * 0.44], [r * 0.78, r * 0.25], [0.001, r * 0.12]], 12, null, x, y, z));
}

/**
 * The house's furnishings, after the colonial accounts of the Andean house: "textiles and mats furnished
 * spaces that would otherwise have been bare floors", blankets, "clay cooking installations, earthenware
 * pots and wooden utensils", jars for liquids and provisions, grinding stones for the maize [stated:
 * ancient-history-sites, "Housing and Living Conditions in the Inca World"]. Built: the clay stove (q'uncha)
 * in a back corner — a low horseshoe of clay with two pot holes on top, the mouth for the fuel on the room's
 * side, a pot on it, sticks beside it; the batán and its rocking stone by the stove; the sleeping mats along
 * a side wall with blankets folded on them; an urpu by the door; in the niches cooking pots and bowls [inferred:
 * the places, after the q'uncha of Andean houses today].
 * walls: the house's walls by side { F, off }; niches: by side, the niche openings; f: the front.
 */
export function houseInterior(bag, col, el, walls, niches, f) {
  const rand = rng((el.seed || 1) * 31 + 7), [x0, z0, x1, z1] = el.rect, y = (el.y ?? 0) + 0.04, m = (el.th ?? 0.7) / 2 + 0.08;
  const I = [x0 + m, z0 + m, x1 - m, z1 - m];
  // the house's own frame: `in` from the front wall to the back, `side` across, both unit, and a point at (a, b)
  const inV = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] }[f], sideV = [-inV[1], inV[0]];
  const cx = (I[0] + I[2]) / 2, cz = (I[1] + I[3]) / 2, depth = Math.abs(inV[0]) ? I[2] - I[0] : I[3] - I[1], width = Math.abs(inV[0]) ? I[3] - I[1] : I[2] - I[0];
  const at = (a, b) => [cx + inV[0] * a + sideV[0] * b, cz + inV[1] * a + sideV[1] * b];
  const rectAt = (a, b, da, db) => { const p = at(a, b), hx = Math.abs(inV[0]) * da + Math.abs(sideV[0]) * db, hz = Math.abs(inV[1]) * da + Math.abs(sideV[1]) * db; return [p[0] - hx, p[1] - hz, p[0] + hx, p[1] + hz]; };
  const sd = rand() < 0.5 ? -1 : 1;                       // the stove's side
  // the stove in the back corner
  {
    const a = depth / 2 - 0.33, b = sd * (width / 2 - 0.4), R = rectAt(a, b, 0.3, 0.38);
    bag.add('mud_plaster', frustum(R, y - 0.02, y + 0.42, 0.04, 0.04, 0.04, 0.04));
    col.rect(R, y, y + 0.42);
    // the fuel mouth: a dark recess on the room's side; two pot holes, a pot in one, the other with its rim of soot
    const mo = at(a - 0.31, b);
    bag.add('pottery_dark', box(mo[0] - 0.09 - Math.abs(inV[0]) * 0.01, y, mo[1] - 0.09 - Math.abs(inV[1]) * 0.01, mo[0] + 0.09 + Math.abs(inV[0]) * 0.01, y + 0.2, mo[1] + 0.09 + Math.abs(inV[1]) * 0.01));
    const h1 = at(a, b - 0.17), h2 = at(a, b + 0.17);
    olla(bag, h1[0], y + 0.33, h1[1], 0.15);
    bag.add('pottery_dark', lathe([[0.1, 0], [0.11, 0.005], [0.001, 0.005]], 12, null, h2[0], y + 0.42, h2[1]));
    // sticks for the fire, laid by
    for (let i = 0; i < 4; i++) { const p = at(a - 0.25 - rand() * 0.1, b - sd * (0.55 + i * 0.07)); const q = at(a - 0.75 - rand() * 0.2, b - sd * (0.5 + i * 0.08)); bag.add('timber', rod([p[0], y + 0.03 + (i % 2) * 0.04, p[1]], [q[0], y + 0.03, q[1]], 0.022, 5)); }
    // the batán: a flat stone, the rocking stone on it, a bowl of meal
    const g = rectAt(a - 1.0, b, 0.22, 0.32);
    bag.add('granite_rough', frustum(g, y - 0.02, y + 0.09, 0.03, 0.03, 0.03, 0.03));
    const gc = at(a - 1.0, b - sd * 0.05);
    bag.add('granite_rough', lathe([[0.001, 0], [0.09, 0.01], [0.12, 0.06], [0.1, 0.11], [0.001, 0.13]], 9, null, gc[0], y + 0.09, gc[1]));
    const bc = at(a - 1.0, b - sd * 0.5);
    bowl(bag, bc[0], y, bc[1], 0.13);
  }
  // the sleeping mats along the other side wall, blankets folded on them
  {
    const b = -sd * (width / 2 - 0.5), len = Math.min(2.0, depth - 1.6), a = depth / 2 - 0.2 - len / 2;
    const R = rectAt(a, b, len / 2, 0.45);
    bag.add('reed_mat', box(R[0], y, R[1], R[2], y + 0.025, R[3]));
    const cloths = ['cloth_brown', 'cloth_red', 'cloth_ochre', 'cloth_black'];
    for (let i = 0; i < 2; i++) {
      const B = rectAt(a + len / 2 - 0.35 - i * 0.02, b, 0.22, 0.32 - i * 0.03);
      bag.add(cloths[Math.floor(rand() * 4)], frustum(B, y + 0.025 + i * 0.07, y + 0.025 + (i + 1) * 0.07, 0.015, 0.015, 0.015, 0.015));
    }
  }
  // the urpu by the door, on the side away from the mats
  { const p = at(-depth / 2 + 0.35, sd * (width / 2 - 0.35)); urpu(bag, p[0], y - 0.05, p[1], 0.62 + rand() * 0.18, rand() * 6.28); col.circle(p[0], p[1], 0.2, y, y + 0.6); }
  // the niches: a pot, a bowl or two, or nothing
  for (const [k, list] of Object.entries(niches)) {
    const { F, off } = walls[k];
    for (const op of list) {
      if (op.kind !== 'niche') continue;
      const r = rand();
      if (r < 0.3) continue;
      const kk = off(op.sill) - op.depth / 2 - 0.02, p = F.at(op.at), n = F.n(op.at), q = [p[0] + n[0] * kk, p[1] + n[1] * kk], yy = (el.y ?? 0) + op.sill;
      if (r < 0.65) olla(bag, q[0], yy, q[1], 0.085 + rand() * 0.03, rand() < 0.5 ? 'pottery_dark' : 'terracotta');
      else { bowl(bag, q[0] - n[1] * 0.08, yy, q[1] + n[0] * 0.08, 0.1); bowl(bag, q[0] - n[1] * 0.08, yy + 0.04, q[1] + n[0] * 0.08, 0.09); if (rand() < 0.5) olla(bag, q[0] + n[1] * 0.1, yy, q[1] - n[0] * 0.1, 0.07); }
    }
  }
}

/**
 * A kallanka's furnishing (el.doors > 1): a single undivided hall [stated: Wikipedia, "Kallanka"] used for gatherings
 * and shelter in bad weather; for the feasts of maize beer (aqha, chicha) a row of tall jars (urpu) stands along the back
 * wall under the windows [inferred: after the urpu of the Inca state's feasts], between them bundles of mats and folded
 * blankets where the guests sleep, a ring of stones for a fire in the middle of the floor, bowls by the jars. The
 * floor before every door is left clear.
 */
export function hallInterior(bag, col, el, f) {
  const rand = rng((el.seed || 1) * 17 + 3), [x0, z0, x1, z1] = el.rect, y = (el.y ?? 0) + 0.04, m = (el.th ?? 0.7) / 2 + 0.08;
  const I = [x0 + m, z0 + m, x1 - m, z1 - m];
  const inV = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] }[f], sideV = [-inV[1], inV[0]];
  const cx = (I[0] + I[2]) / 2, cz = (I[1] + I[3]) / 2, depth = Math.abs(inV[0]) ? I[2] - I[0] : I[3] - I[1], length = Math.abs(inV[0]) ? I[3] - I[1] : I[2] - I[0];
  const at = (a, b) => [cx + inV[0] * a + sideV[0] * b, cz + inV[1] * a + sideV[1] * b];
  const rectAt = (a, b, da, db) => { const p = at(a, b), hx = Math.abs(inV[0]) * da + Math.abs(sideV[0]) * db, hz = Math.abs(inV[1]) * da + Math.abs(sideV[1]) * db; return [p[0] - hx, p[1] - hz, p[0] + hx, p[1] + hz]; };
  const n = el.doors, door = (i) => -length / 2 + (i + 0.5) * length / n + (sideV[0] + sideV[1] < 0 ? 0 : 0);
  const cloths = ['cloth_brown', 'cloth_red', 'cloth_ochre', 'cloth_black', 'cloth_white'];
  const back = depth / 2 - 0.45;
  // the jars along the back wall: one or two between each pair of doors' lines, clear of the doors' own lines
  for (let i = 0; i < n; i++) {
    const b0 = door(i);
    for (const d of [-1.55, 1.55]) {
      if (Math.abs(b0 + d) > length / 2 - 0.9 || rand() < 0.2) continue;
      const p = at(back, b0 + d + (rand() - 0.5) * 0.3);
      urpu(bag, p[0], y - 0.05, p[1], 0.75 + rand() * 0.2, rand() * 6.28); col.circle(p[0], p[1], 0.22, y, y + 0.8);
      if (rand() < 0.55) { const q = at(back - 0.55, b0 + d + (rand() - 0.5) * 0.4); bowl(bag, q[0], y, q[1], 0.12, rand() < 0.5 ? 'terracotta' : 'pottery_dark'); }
    }
    // a mat with its blankets, along the back wall at the door's line
    if (rand() < 0.6) {
      const R = rectAt(back - 0.1, b0 + (rand() - 0.5) * 0.4, 0.45, 0.95);
      bag.add('reed_mat', box(R[0], y, R[1], R[2], y + 0.025, R[3]));
      for (let k = 0; k < 2; k++) { const B = rectAt(back - 0.1, b0 - 0.5 + k * 0.85, 0.3, 0.3); bag.add(cloths[Math.floor(rand() * 5)], frustum(B, y + 0.025, y + 0.11, 0.015, 0.015, 0.015, 0.015)); }
    }
  }
  // the hearth in the middle of the hall: a ring of stones round the ashes, between two doors' lines
  const hb = (door(Math.floor(n / 2)) + door(Math.floor(n / 2) - 1)) / 2, hc = at(0.1, hb);
  bag.add('granite_rough', lathe([[0.42, 0.005], [0.5, 0.005], [0.5, 0.1], [0.42, 0.1], [0.42, 0.005]], 14, null, hc[0], y, hc[1]));
  bag.add('pottery_dark', lathe([[0.001, 0.012], [0.4, 0.012], [0.4, 0.02], [0.001, 0.025]], 12, null, hc[0], y, hc[1]));
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + rand(), p = [hc[0] + Math.cos(a) * 0.1, hc[1] + Math.sin(a) * 0.1], q = [hc[0] + Math.cos(a + 0.5) * 0.3, hc[1] + Math.sin(a + 0.5) * 0.3]; bag.add('timber', rod([p[0], y + 0.04, p[1]], [q[0], y + 0.03, q[1]], 0.02, 5)); }
}

/**
 * chakitaqlla: the foot plough { at: [x, z] (where the blade bites), y, yaw (the way the plough leans,
 * from the blade up to the handle), lean (radians from upright) }: a shaft about 1.45 m long and 6 cm
 * thick; a footrest of two short pegs lashed on about 45 cm up; a handle lashed on near the top; the
 * blade 40 cm long and 7–10 cm wide in a socket at the foot [stated: Museum of Old Techniques (MOT),
 * "chaquitaclla"] — the blade of bronze or fire-hardened wood [stated: same; ancient-history-sites, "Work
 * and Household Production in the Inca World": "a hard-wood or bronze point"].
 */
function chakitaqlla(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, lean = el.lean ?? 0.35;
  const d = [Math.sin(lean) * -Math.sin(yaw), Math.cos(lean), Math.sin(lean) * -Math.cos(yaw)], P = (t) => [x + d[0] * t, y + d[1] * t, z + d[2] * t];
  const sx = Math.cos(yaw), sz = -Math.sin(yaw);
  bag.add('bronze', rod(P(-0.12), P(0.3), 0.032, 6));
  bag.add('bronze', frustum([x - 0.04, z - 0.04, x + 0.04, z + 0.04], y - 0.14, y - 0.1, 0, 0, 0, 0));
  bag.add('wood_dark', rod(P(0.28), P(1.45), 0.03, 7));
  // the footrest: two short pegs lashed on, standing out to one side of the shaft
  const f = P(0.45);
  for (const dy of [0, 0.035]) bag.add('wood_dark', rod([f[0], f[1] + dy, f[2]], [f[0] + sx * 0.2, f[1] + dy - 0.01, f[2] + sz * 0.2], 0.02, 5));
  bag.add('cloth_brown', rod(P(0.42), P(0.5), 0.037, 7));
  // the handle, lashed across near the top
  const h = P(1.32);
  bag.add('wood_dark', rod([h[0] - sx * 0.16, h[1], h[2] - sz * 0.16], [h[0] + sx * 0.16, h[1], h[2] + sz * 0.16], 0.022, 6));
  bag.add('cloth_brown', rod(P(1.29), P(1.35), 0.036, 7));
}

/**
 * quarry: the granite quarry on the ridge's top { rect, y, seed }: "the Inca quarried the rock for Machu
 * Picchu from the mountain ridge itself", built on fault lines that gave "a ready supply of fractured
 * stone"; stones lined up and shaped where they lay, some left with the knobs by which they were levered
 * [stated: michaelstephenwills, "Quarry on the Machu Picchu Ridge"]. Built: a field of fractured boulders,
 * angular and lichened, two great outcrops split along their joints; blocks squared on one or two faces
 * lined up for dressing, one with its knobs; river cobbles of harder stone used as hammers [inferred: the
 * hammerstones, the arrangement].
 */
function quarry(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 41);
  const rock = (x, z, r, hh, sq = 0) => {
    // an angular boulder: a coarse lathe, its sides cut in planes (few segments), squashed and turned
    const n = 5 + Math.floor(rand() * 3), ph = rand() * 6.28, kx = 0.75 + rand() * 0.5;
    const g = lathe([[r * 0.85, -0.25], [r, hh * 0.25], [r * 0.95, hh * 0.6], [r * (0.55 + sq * 0.4), hh * 0.95], [r * (0.2 + sq * 0.7), hh], [0.001, hh]], n, (t, i) => (1 + 0.14 * Math.sin(t * 3 + ph + i)) * (Math.abs(Math.cos(t + ph)) * (kx - 1) + 1));
    g.rotateY(ph); g.translate(x, y, z);
    bag.add('granite_rough', g);
    col.circle(x, z, r * 0.8, y, y + hh);
  };
  // the two split outcrops: each a pair of halves with the fresh joint between
  for (const [fx, fz, r] of [[0.25, 0.35, 2.2], [0.72, 0.62, 1.8]]) {
    const cx = x0 + (x1 - x0) * fx, cz = z0 + (z1 - z0) * fz;
    rock(cx - r * 0.55, cz, r * 0.62, r * 0.95);
    rock(cx + r * 0.6, cz + 0.2, r * 0.58, r * 0.85);
  }
  // the scatter of fractured stones
  for (let i = 0; i < 26; i++) {
    const x = x0 + 1 + rand() * (x1 - x0 - 2), z = z0 + 1 + rand() * (z1 - z0 - 2), r = 0.25 + rand() * rand() * 1.1;
    if (Math.hypot(x - (x0 + (x1 - x0) * 0.25), z - (z0 + (z1 - z0) * 0.35)) < 3.2 || Math.hypot(x - (x0 + (x1 - x0) * 0.72), z - (z0 + (z1 - z0) * 0.62)) < 2.8) continue;
    rock(x, z, r, r * (0.6 + rand() * 0.5));
  }
  // blocks squared on their faces, lined up along the quarry's east side for dressing; one with two knobs
  for (let i = 0; i < 5; i++) {
    const w = 0.9 + rand() * 0.7, d = 0.6 + rand() * 0.3, h = 0.5 + rand() * 0.35, cx = x1 - 1.6, cz = z0 + 2 + i * 1.9;
    if (cz + d > z1 - 0.5) break;
    bag.add('granite_inca', frustum([cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2], y - 0.05, y + h, 0.04, 0.04, 0.04, 0.04));
    col.rect([cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2], y, y + h);
    if (i === 2) for (const sg of [-1, 1]) bag.add('granite_inca', lathe([[0.09, -0.03], [0.085, 0.07], [0.045, 0.11], [0.001, 0.115]], 8).rotateZ(-sg * Math.PI / 2).translate(cx + sg * (w / 2 - 0.03), y + h * 0.55, cz));
  }
  // hammerstones: rounded cobbles of a darker, harder stone
  for (let i = 0; i < 6; i++) { const x = x1 - 2.8 - rand() * 1.2, z = z0 + 2 + rand() * (z1 - z0 - 4), r = 0.07 + rand() * 0.05; bag.add('basalt', lathe([[0.001, 0], [r * 0.8, r * 0.15], [r, r * 0.7], [r * 0.7, r * 1.3], [0.001, r * 1.45]], 8, null, x, y - 0.01, z)); }
}

/**
 * funerary_rock: "a capriciously carved stone monolith in the shape of a square", with a small stair "formed
 * in the same rock", a few steps behind the guardian's house [stated: imachupicchu, "The guardian's house"]
 * { c, y, yaw }: the boulder, its top cut flat and square, three steps cut down one side, a lower ledge.
 */
function funeraryRock(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const R = (u0, w0, u1, w1) => { const p = [[u0, w0], [u1, w0], [u1, w1], [u0, w1]].map(([u, w]) => [cx + u * c + w * s, cz - u * s + w * c]); return p; };
  // the rough boulder under the carving
  bag.add('granite_rough', lathe([[1.55, -0.3], [1.6, 0.2], [1.45, 0.62], [1.2, 0.8], [0.001, 0.8]], 11, (t, i) => 1 + 0.08 * Math.sin(t * 3 + 1) + 0.05 * Math.sin(t * 5 + i), cx, y, cz));
  // the cut planes: the square top, a ledge, three steps (each a turned block)
  const blocks = [[-0.75, -0.7, 0.75, 0.7, 0.75, 1.15], [0.75, -0.55, 1.35, 0.25, 0.5, 0.86], [-0.5, 0.7, 0.1, 1.05, 0.3, 0.95], [-0.5, 1.05, 0.1, 1.35, 0.1, 0.64], [-0.5, 1.35, 0.1, 1.6, -0.1, 0.33]];
  for (const [u0, w0, u1, w1, y0, y1] of blocks) {
    const p = R(u0, w0, u1, w1), t = [];
    const top = p.map(([x, z]) => [x, y + y1, z]), bot = p.map(([x, z]) => [x, y + y0, z]);
    t.push(...top[0], ...top[2], ...top[1], ...top[0], ...top[3], ...top[2]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...bot[i], ...top[i], ...top[j], ...bot[i], ...top[j], ...bot[j]); }
    bag.add('granite_inca', fromTriangles(orientOutward(t)));
  }
  col.circle(cx, cz, 1.3, y, y + 1.15);
}

/**
 * backstrap_loom: the backstrap loom { a (the near bar, at the kneeling weaver's waist: [x, y, z]), b (where
 * the far bar is tied: [x, y, z]), cloth } — the warp stretched between two bars, the far one tied to a post,
 * the near one held by the strap round the weaver's back, who kneels and leans to tension it; the heddle rod
 * and the shed rod across the warp, the batten in the open shed, the cloth woven so far wound at the near end
 * [stated: the Andean backstrap loom — Wikipedia, "Backstrap loom"; Andean textiles]. The post: a peeled pole
 * set in the patio's earth [inferred].
 */
function backstrapLoom(el, { bag, col }) {
  const [ax, ay, az] = el.a, [bx, by, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, px = -uz, pz = ux, w = 0.34;
  const at = (t, s = 0) => [ax + (bx - ax) * t + px * s, ay + (by - ay) * t, az + (bz - az) * t + pz * s];
  // the post and the cord to the far bar
  bag.add('wood_dark', rod([bx + ux * 0.25, -0.3, bz + uz * 0.25], [bx + ux * 0.25, by + 0.35, bz + uz * 0.25], 0.045, 7));
  col.circle(bx + ux * 0.25, bz + uz * 0.25, 0.06, 0, by + 0.35);
  for (const sd of [-1, 1]) bag.add('cloth_brown', rod(at(1, sd * w * 0.5), [bx + ux * 0.25, by + 0.02, bz + uz * 0.25], 0.008, 3));
  // the bars across the warp at each end, the heddle and shed rods, the batten
  for (const [t, r, len] of [[1, 0.02, w + 0.14], [0, 0.024, w + 0.12], [0.62, 0.012, w + 0.08], [0.78, 0.022, w + 0.06], [0.42, 0.015, w + 0.16]]) bag.add('wood_dark', rod(at(t, -len / 2), at(t, len / 2), r, 6));
  // the warp: two thin layers (the open shed) from the woven cloth to the far bar; the cloth woven so far, thicker, in bands
  const sheet = (t0, t1, dy0, dy1, th, mat) => { const p = [at(t0, -w / 2), at(t1, -w / 2), at(t1, w / 2), at(t0, w / 2)]; const t = []; const lo = (q, dy) => [q[0], q[1] + dy, q[2]];
    const top = p.map((q, i) => lo(q, (i === 0 || i === 3 ? dy0 : dy1) + th)), bot = p.map((q, i) => lo(q, i === 0 || i === 3 ? dy0 : dy1));
    t.push(...top[0], ...top[1], ...top[2], ...top[0], ...top[2], ...top[3], ...bot[0], ...bot[2], ...bot[1], ...bot[0], ...bot[3], ...bot[2]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...bot[i], ...bot[j], ...top[j], ...bot[i], ...top[j], ...top[i]); }
    bag.add(mat, fromTriangles(orientOutward(t))); };
  const C = el.cloth ?? 'cloth_red', C2 = C === 'cloth_ochre' ? 'cloth_red' : 'cloth_ochre';
  for (let i = 0; i < 4; i++) sheet(0.02 + i * 0.09, 0.02 + (i + 1) * 0.09, 0, 0, 0.012, i % 2 ? C2 : C);
  sheet(0.38, 1, 0.012, 0.02, 0.004, 'linen');
  sheet(0.38, 0.78, 0.012, -0.045, 0.004, 'linen');
  sheet(0.78, 1, -0.045, 0.012, 0.004, 'linen');
}

/**
 * chaski_bench: the bench of a chaski's post (chaskiwasi) beside the road { at, y, rot (the bench's length along
 * (sin rot, cos rot)) }: a slab of granite on two stones, on it the pututu — the conch trumpet that warned the next
 * runner — and a quipu laid out, its main cord with the pendant cords knotted [stated: each chaski carried a quipu
 * and a pututu; Wikipedia, "Chasqui"; Guaman Poma's "churu mullu chaski", the runner with the shell].
 */
function chaskiBench(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), sn = Math.sin(r);
  const P = (u, v, w) => [x + u * c + w * sn, y + v, z - u * sn + w * c];    // u across, w along the bench
  const blk = (mat, u0, u1, v0, v1, w0, w1) => { const t = [], A = [P(u0, v0, w0), P(u1, v0, w0), P(u1, v0, w1), P(u0, v0, w1), P(u0, v1, w0), P(u1, v1, w0), P(u1, v1, w1), P(u0, v1, w1)];
    const q = (a, b, cc, d) => t.push(...A[a], ...A[b], ...A[cc], ...A[a], ...A[cc], ...A[d]); q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7); bag.add(mat, fromTriangles(orientOutward(t))); };
  for (const w of [-0.5, 0.5]) blk('granite_rough', -0.18, 0.18, -0.1, 0.34, w - 0.15, w + 0.15);
  blk('granite_inca', -0.22, 0.22, 0.34, 0.45, -0.75, 0.75);
  col.rect([Math.min(P(-0.22, 0, -0.75)[0], P(0.22, 0, 0.75)[0]), Math.min(P(-0.22, 0, -0.75)[2], P(0.22, 0, 0.75)[2]), Math.max(P(-0.22, 0, -0.75)[0], P(0.22, 0, 0.75)[0]), Math.max(P(-0.22, 0, -0.75)[2], P(0.22, 0, 0.75)[2])], y, y + 0.45);
  // the pututu lying on the slab: the conch's body tapering to its spire, the lip, the mouthpiece at the spire
  const pu = lathe([[0.001, 0], [0.05, 0.02], [0.085, 0.09], [0.08, 0.17], [0.05, 0.24], [0.02, 0.29], [0.012, 0.31], [0.001, 0.31]], 10);
  pu.rotateZ(Math.PI / 2); pu.rotateY(r + Math.PI / 2); const pp = P(0.02, 0.45 + 0.075, 0.38); pu.translate(pp[0], pp[1], pp[2]); bag.add('plaster_white', pu);
  // the quipu: the main cord along the slab, ten pendant cords hanging across it, knots on them
  const top = 0.452, cords = ['cloth_white', 'cloth_brown', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_black'];
  bag.add('cloth_brown', rod(P(-0.12, top + 0.008, -0.55), P(-0.12, top + 0.008, 0.05), 0.008, 4));
  for (let i = 0; i < 10; i++) { const w = -0.52 + i * 0.06; bag.add(cords[i % 6], rod(P(-0.12, top + 0.006, w), P(0.18, top + 0.006, w + 0.01), 0.005, 3));
    for (let k = 0; k < 1 + (i * 7) % 3; k++) bag.add(cords[i % 6], lathe([[0.001, -0.009], [0.011, 0], [0.001, 0.009]], 6, null, ...P(-0.02 + k * 0.07, top + 0.009, w + 0.003 * k))); }
}
export const INCA_LIFE = { chakitaqlla, quarry, funerary_rock: funeraryRock, backstrap_loom: backstrapLoom, chaski_bench: chaskiBench };
