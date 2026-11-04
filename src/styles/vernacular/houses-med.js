// Town houses of the Mediterranean and of France (docs/settlements/{florence,baroque-rome,venice,
// granada,ottoman-istanbul,versailles}.md §5), one builder with a variant for each place:
//   tuscan   — Florence and Rome: stucco in ochres and creams, string courses, windows with stone
//              surrounds and green shutters, arched shop doors, a wide timber eave (gronda) under a
//              low tiled roof; now and then a roof loggia (altana) or a tower house.
//   venetian — red and rose stucco, Istrian-stone sills, pointed and round-headed windows, the
//              funnel chimneys (camini), the wooden altana on the roof.
//   moorish  — Granada: whitewash, few small windows, a latticed balcony, flat roofs with parapets
//              or low tiled roofs, the odd small tower (algorfa).
//   ottoman  — Istanbul: a stone ground storey, the upper storeys of painted timber boards jettied
//              out, the bay (cumba), wide eaves under a hipped tiled roof.
//   french   — Versailles: limestone and plaster, tall windows with grey shutters, a steep slate roof
//              with dormers and tall chimney stacks.
// { rect, y (floor), foot (lowest ground), storeys, front ('n'|'s'|'e'|'w'), seed, variant }

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

const V = {
  tuscan: { walls: ['stucco_pale', 'stucco_siena', 'stucco_ochre', 'stucco_cream', 'stucco_warm', 'stucco_rome'], base: 'pietra_serena', trim: 'pietra_serena', shut: ['shutter_green', 'shutter_green', 'shutter_brown'], st: [3.6, 4.2], roof: 'roof_tile', pitch: 17, eave: 1.0, win: [0.85, 1.6], arched: 0.5 },
  roman: { walls: ['stucco_rome', 'stucco_saffron', 'stucco_ochre', 'stucco_rose', 'stucco_siena', 'stucco_pale'], base: 'travertine', trim: 'travertine', shut: ['shutter_green', 'shutter_brown'], st: [3.5, 4.0], roof: 'roof_tile', pitch: 16, eave: 0.7, win: [0.85, 1.6], arched: 0.4 },
  venetian: { walls: ['stucco_venice', 'stucco_rose', 'limewash_red', 'stucco_ochre', 'stucco_cream', 'stucco_siena'], base: 'limestone', trim: 'marble', shut: ['shutter_green', 'shutter_brown'], st: [3.3, 3.8], roof: 'roof_tile', pitch: 18, eave: 0.35, win: [0.8, 1.7], pointed: 0.35 },
  moorish: { walls: ['limewash_white', 'limewash_white', 'limewash_white', 'plaster_white', 'stucco_pale'], base: 'limewash_white', trim: 'brick', shut: ['wood_painted'], st: [3.0, 3.3], roof: 'roof_tile', pitch: 20, eave: 0.3, win: [0.6, 0.9], flat: 0.45 },
  ottoman: { walls: ['wood_painted', 'wood_ochre', 'limewash_red', 'stucco_pale', 'shutter_grey', 'timber'], base: 'rubble', trim: 'timber', shut: ['timber'], st: [2.9, 3.2], roof: 'roof_tile', pitch: 22, eave: 0.9, win: [0.7, 1.3], jetty: 0.8 },
  french: { walls: ['limestone', 'plaster_white', 'stucco_pale', 'plaster_white'], base: 'limestone', trim: 'limestone', shut: ['shutter_grey', 'shutter_grey', 'shutter_green'], st: [3.4, 3.8], roof: 'slate', pitch: 48, eave: 0.25, win: [0.95, 2.0], dormers: 1 },
};

/** A hipped roof over R from height ye, the slopes at `pitch` degrees, overhang o; faces pointing up. */
function hipRoof(bag, mat, R, ye, pitch, o) {
  const ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(pitch * Math.PI / 180), t = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    t.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0, ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex1, ye, ez0, ...r1, ex1, ye, ez1);
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    t.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1, ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex0, ye, ez0, ...r0, ex1, ye, ez0, ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; } }
  bag.add(mat, fromTriangles(t));
  return rise;
}

function houseMed(el, { bag, col }) {
  const rand = rng(el.seed || 1), O = V[el.variant] ?? V.tuscan, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4;
  const simple = !!el.simple;
  const tower = !el.noTower && rand() < (el.variant === 'tuscan' ? 0.025 : el.variant === 'moorish' ? 0.03 : 0.01) && x1 - x0 < 11 && z1 - z0 < 11;
  const n = tower ? el.storeys + 3 : el.storeys, st = O.st[0] + rand() * (O.st[1] - O.st[0]), H = n * st;
  const wall = pick(rand, O.walls), shut = pick(rand, O.shut), f = el.front || 's';
  const jet = O.jetty && n > 1 ? O.jetty : 0;
  // the ground storey of stone, the rest of the house's wall
  bag.add(O.base, box(x0 - 0.06, foot - 0.6, z0 - 0.06, x1 + 0.06, y + (jet ? st : 0.6), z1 + 0.06));
  const R = [x0, z0, x1, z1];
  if (jet) {
    // the upper storeys jettied out over the street on the front, on timber brackets
    if (f === 's') R[3] += jet; else if (f === 'n') R[1] -= jet; else if (f === 'e') R[2] += jet; else R[0] -= jet;
    bag.add(wall, box(R[0], y + st, R[1], R[2], y + H, R[3]));
    bag.add('timber', box(R[0] - 0.05, y + st - 0.18, R[1] - 0.05, R[2] + 0.05, y + st, R[3] + 0.05));
  } else bag.add(wall, box(x0, y + 0.6, z0, x1, y + H, z1));
  col.rect(el.rect, foot - 0.6, y + H);
  // string courses at the floors
  if (!simple && O.trim && el.variant !== 'moorish') for (let s = 1; s < n; s++) bag.add(O.trim, box(R[0] - 0.07, y + s * st - 0.12, R[1] - 0.07, R[2] + 0.07, y + s * st + 0.04, R[3] + 0.07));
  // the openings on the street front and the back: a shop arch or door below, windows above with surrounds and shutters
  const faces = simple ? [f] : [f, { n: 's', s: 'n', e: 'w', w: 'e' }[f]];
  for (const face of faces) {
    const along = face === 'n' || face === 's', L = along ? R[2] - R[0] : R[3] - R[1], a0 = along ? R[0] : R[1];
    const fz = face === 'n' ? R[1] : face === 's' ? R[3] : face === 'w' ? R[0] : R[2], sg = face === 'n' || face === 'w' ? -1 : 1;
    const put = (mat, u0, u1, v0, v1, d0, d1) => { const p0 = fz + sg * d0, p1 = fz + sg * d1; const q = along ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
    const bays = Math.max(1, Math.round(L / (el.variant === 'moorish' ? 3.6 : 2.5)));
    const main = face === f;
    for (let s = 0; s < n; s++) {
      if (el.variant === 'moorish' && !main && s === 0) continue;
      for (let b = 0; b < bays; b++) {
        const u = (b + 0.5) * L / bays;
        if (s === 0) {
          if (!main) continue;
          if (simple) { if (b === Math.floor(bays / 2)) put('opening', u - 0.6, u + 0.6, 0.5, 2.8, jet ? -jet - 0.01 : -0.01, jet ? -jet + 0.03 : 0.03); continue; }
          if (b === Math.floor(bays / 2) || (el.variant !== 'moorish' && el.variant !== 'french' && rand() < 0.35)) {
            // a door, or a shop's arch with its stone frame
            const w = b === Math.floor(bays / 2) ? 1.2 : Math.min(2.2, L / bays - 0.5), h = Math.min(st - 0.6, 2.4 + w * 0.3);
            if (jet && main) { put('opening', u - w / 2, u + w / 2, 0.5, 0.5 + h, -jet - 0.01, -jet + 0.03); continue; }
            put(O.trim, u - w / 2 - 0.15, u + w / 2 + 0.15, 0.5, 0.65 + h, -0.01, 0.08);
            put('opening', u - w / 2, u + w / 2, 0.6, 0.6 + h, 0.07, 0.11);
            // the door leaves (or a shop's shutters), one of them a little open now and then
            if (b === Math.floor(bays / 2) || rand() < 0.5) { const open = rand() < 0.3; put(el.variant === 'french' || el.variant === 'venetian' ? 'shutter_brown' : 'wood_dark', u - w / 2 + 0.05, open ? u - 0.05 : u + w / 2 - 0.05, 0.62, 0.55 + h, 0.105, 0.13); if (open) put('wood_dark', u + w / 2 - 0.12, u + w / 2 - 0.04, 0.62, 0.55 + h, 0.13, 0.75); }
            if (O.arched && rand() < O.arched) put(O.trim, u - w / 2 - 0.05, u + w / 2 + 0.05, 0.6 + h - 0.35, 0.6 + h, 0.06, 0.12);
          } else if (el.variant !== 'moorish') put('opening', u - 0.35, u + 0.35, 1.4, 2.2, -0.01, 0.03);
          continue;
        }
        if (el.variant === 'moorish' && rand() < 0.5) continue;
        if (simple || !main) { const ww = O.win[0], wh = Math.min(st - 1.1, O.win[1]), v0 = s * st + (st - wh) * 0.45; put('opening', u - ww / 2, u + ww / 2, v0, v0 + wh, -0.01, 0.03); continue; }
        const ww = O.win[0] * (0.9 + rand() * 0.2), wh = Math.min(st - 1.1, O.win[1] * (s === 1 && el.variant !== 'moorish' ? 1.15 : 1)), v0 = s * st + (st - wh) * 0.45;
        // the stone surround, the sill, the window, its shutters (open, or closed now and then)
        if (el.variant !== 'ottoman') put(O.trim, u - ww / 2 - 0.12, u + ww / 2 + 0.12, v0 - 0.12, v0 + wh + 0.12, -0.01, 0.05);
        put(O.trim, u - ww / 2 - 0.18, u + ww / 2 + 0.18, v0 - 0.18, v0 - 0.06, -0.01, 0.16);
        const closed = rand() < 0.25;
        put(closed ? shut : 'opening', u - ww / 2, u + ww / 2, v0, v0 + wh, 0.04, 0.08);
        if (!closed && shut && el.variant !== 'moorish' && el.variant !== 'ottoman') for (const sd of [-1, 1]) put(shut, sd < 0 ? u - ww - 0.12 : u + ww / 2 + 0.12, sd < 0 ? u - ww / 2 - 0.12 : u + ww + 0.12, v0, v0 + wh, 0.03, 0.08);
        if (O.pointed && rand() < O.pointed) put(O.trim, u - 0.08, u + 0.08, v0 + wh, v0 + wh + 0.4, 0.0, 0.08);
        if (el.variant === 'venetian' && s === 1 && b === Math.floor(bays / 2) && rand() < 0.35) put('iron', u - ww, u + ww, v0 - 0.2, v0 + 0.8, 0.05, 0.75);           // a balcony
        if (el.variant === 'moorish' && main && s === 1 && rand() < 0.3) put('lattice', u - ww / 2 - 0.2, u + ww / 2 + 0.2, v0 - 0.2, v0 + wh + 0.2, 0.05, 0.6);   // the latticed balcony
      }
    }
    // the bay (cumba) of an Ottoman house on its front
    if (!simple && el.variant === 'ottoman' && main && n > 1 && rand() < 0.6) { const u = L / 2, w = Math.min(3, L * 0.45); put(wall, u - w / 2, u + w / 2, st + 0.3, st * 2 - 0.2, 0, 0.75); put('opening', u - w / 2 + 0.25, u + w / 2 - 0.25, st + 1.0, st * 2 - 0.6, 0.74, 0.78); put('timber', u - w / 2 - 0.1, u + w / 2 + 0.1, st + 0.2, st + 0.32, -0.02, 0.85); }
  }
  // the top: a cornice and a roof (low tiled, steep slate, or flat behind a parapet)
  const ye = y + H, flat = O.flat && rand() < O.flat;
  if (flat) {
    for (const [a, b, c, d] of [[R[0], R[1], R[2], R[1] + 0.25], [R[0], R[3] - 0.25, R[2], R[3]], [R[0], R[1], R[0] + 0.25, R[3]], [R[2] - 0.25, R[1], R[2], R[3]]]) bag.add(wall, box(a, ye, b, c, ye + 0.9, d));
    bag.add('brick_paving', box(R[0] + 0.25, ye - 0.05, R[1] + 0.25, R[2] - 0.25, ye + 0.02, R[3] - 0.25));
  } else {
    if (O.eave > 0.5) { bag.add('timber', box(R[0] - O.eave, ye - 0.22, R[1] - O.eave, R[2] + O.eave, ye, R[3] + O.eave)); if (!simple && (f === 'n' || f === 's')) for (let u = R[0] - O.eave + 0.3; u < R[2] + O.eave; u += 0.9) { const zz = f === 's' ? R[3] + 0.05 : R[1] - 0.17; bag.add('wood_dark', box(u, ye - 0.36, Math.min(zz, zz + (f === 's' ? 0 : 0)), u + 0.1, ye - 0.22, zz + 0.12 + (f === 's' ? O.eave - 0.2 : 0)).translate(0, 0, f === 's' ? 0 : -(O.eave - 0.2))); } }
    else bag.add(O.trim, box(R[0] - 0.25, ye - 0.3, R[1] - 0.25, R[2] + 0.25, ye, R[3] + 0.25));
    const rise = hipRoof(bag, O.roof, R, ye, O.pitch + (rand() - 0.5) * 4, Math.max(0.35, O.eave));
    // dormers in a steep roof
    if (O.dormers && !simple) { const along = f === 'n' || f === 's', L = along ? R[2] - R[0] : R[3] - R[1], nd = Math.max(1, Math.floor(L / 3.5)); for (let k = 0; k < nd; k++) { const u = (k + 0.5) * L / nd, zf = f === 's' ? R[3] - 0.6 : f === 'n' ? R[1] + 0.6 : 0, xf = f === 'e' ? R[2] - 0.6 : f === 'w' ? R[0] + 0.6 : 0; const q = along ? [R[0] + u - 0.55, zf - 0.6, R[0] + u + 0.55, zf + 0.6] : [xf - 0.6, R[1] + u - 0.55, xf + 0.6, R[1] + u + 0.55]; bag.add('plaster_white', box(q[0], ye, q[1], q[2], ye + 1.7, q[3])); hipRoof(bag, 'slate', q, ye + 1.7, 45, 0.1); } }
    // chimneys: funnel chimneys in Venice, tall stacks in France, plain stacks elsewhere
    const nc = simple ? (el.variant === 'venetian' || el.variant === 'french' ? 1 : 0) : el.variant === 'venetian' ? 1 + Math.floor(rand() * 3) : el.variant === 'french' ? 2 : rand() < 0.5 ? 1 : 0;
    for (let k = 0; k < nc; k++) {
      const cx = R[0] + 1 + rand() * (R[2] - R[0] - 2), cz = R[1] + 1 + rand() * (R[3] - R[1] - 2), ch = rise + (el.variant === 'french' ? 2.2 : 1.1);
      bag.add(el.variant === 'french' ? 'limestone' : 'brick', box(cx - 0.3, ye, cz - 0.3, cx + 0.3, ye + ch, cz + 0.3));
      if (el.variant === 'venetian') bag.add('stucco_venice', lathe([[0.25, 0], [0.55, 0.8], [0.6, 1.0], [0.001, 1.0]], 8, null, cx, ye + ch, cz));
    }
    // a roof loggia (altana) in Venice and Florence
    if (!simple && (el.variant === 'venetian' || el.variant === 'tuscan') && rand() < 0.15) {
      const ax = (R[0] + R[2]) / 2, az = (R[1] + R[3]) / 2, ay = ye + rise * 0.7;
      bag.add('timber', box(ax - 1.4, ay, az - 1.2, ax + 1.4, ay + 0.12, az + 1.2));
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(ax + dx * 1.3 - 0.05, ye, az + dz * 1.1 - 0.05, ax + dx * 1.3 + 0.05, ay + 1.1, az + dz * 1.1 + 0.05));
      bag.add('timber', box(ax - 1.4, ay + 1.0, az - 1.2, ax + 1.4, ay + 1.08, az + 1.2).translate(0, 0, 0));
    }
  }
}
STYLES.vernacular.elements.house_med = houseMed;
