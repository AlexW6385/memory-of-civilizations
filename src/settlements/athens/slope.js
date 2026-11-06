// Classical Athens about 410 BC — the south slope of the Acropolis and the summit's smaller sanctuaries
// (docs/settlements/athens.md §4e–§4f): the theatre of Dionysos with its stage building and the long stoa behind it, the
// Older Temple of Dionysos Eleuthereus and its altar; the Odeion of Pericles; on the summit, the sanctuary of Artemis
// Brauronia with Strongylion's bronze horse, the bronze store (Chalkotheke), the Lemnian Athena, the stelae, and the
// stretch of the Mycenaean wall under the Brauronion's west end. Pure data: a list of elements.

import { THEATRE, ODEION } from './layout.js';

export function southSlope() {
  const E = [], T = THEATRE, [cx, cz] = T.c;
  // ── the theatre of Dionysos: the orchestra on its terrace, the theatron of wooden benches on the earth bank ──
  E.push({ t: 'orchestra', c: T.c, y: T.y, r: T.r });
  E.push({ t: 'theatron', c: T.c, y: T.y, d0: T.d0, rows: T.rows, tread: T.tread, rise: T.rise, facets: T.facets, end: T.end });
  // the terrace south of the orchestra for the stage building, its wall of polygonal stones toward the sanctuary
  const sk = [cx - 14, cz + T.r + 2.4, cx + 14, cz + T.r + 8.4];
  E.push({ t: 'block', rect: [cx - 21, cz + 9, cx + 21, sk[3] + 0.3], y0: -0.6, y1: T.y, mat: 'ground', walk: true });
  E.push({ t: 'wall', a: [cx - 21.4, sk[3] + 0.7], b: [cx + 21.4, sk[3] + 0.7], th: 0.8, y0: -0.6, y1: T.y + 0.25, mat: 'rubble' });
  for (const s of [-1, 1]) E.push({ t: 'wall', a: [cx + s * 21.4, cz + 9], b: [cx + s * 21.4, sk[3] + 1.1], th: 0.8, y0: -0.6, y1: T.y + 0.25, mat: 'rubble' });
  E.push({ t: 'skene', rect: sk, y: T.y, h: 7.2, seed: 12 });
  // the long hall of the sanctuary south of the skene, back to back with it; its Doric front looking into the precinct
  E.push({ t: 'stoa', rect: [cx - 26, sk[3] + 1.6, cx + 26, sk[3] + 9.1], front: 's', y: 0.4, h: 4.2, d: 0.66, sp: 2.4, flutes: 0, inner: { d: 0.5, every: 2 }, mat: 'limestone', wall: 'limestone', triglyphMat: 'egyptian_blue', seed: 77 });
  // the Older Temple of Dionysos Eleuthereus (6th century) with the old wooden image, two columns between its antae;
  // the altar before it to the east
  {
    const x0 = cx - 14, x1 = x0 + 13.4, z0 = sk[3] + 13.5, z1 = z0 + 8.0, y = 0.0, st = 0.5, zc = (z0 + z1) / 2, h = 4.6;
    E.push({ t: 'krepis', rect: [x0, z0, x1, z1], y0: y, steps: 2, rise: 0.25, tread: 0.32, mat: 'limestone' });
    for (const s of [-1, 1]) E.push({ t: 'wall', a: [x0 + 0.4, zc + s * 3.55], b: [x1 - 0.45, zc + s * 3.55], th: 0.7, y0: y + st, y1: y + st + h, mat: 'limestone' });
    E.push({ t: 'wall', a: [x0 + 0.4, zc - 3.2], b: [x0 + 0.4, zc + 3.2], th: 0.7, y0: y + st, y1: y + st + h, mat: 'limestone' });
    E.push({ t: 'wall', a: [x1 - 3.3, zc - 3.2], b: [x1 - 3.3, zc + 3.2], th: 0.7, y0: y + st, y1: y + st + h, mat: 'limestone', openings: [{ at: 3.2, w: 1.9, h: 3.2, y0: y + st }] });
    for (const s of [-1, 1]) E.push({ t: 'column', at: [x1 - 0.55, zc + s * 1.25], y: y + st, h, d: 0.68, mat: 'limestone', flutes: 16 });
    E.push({ t: 'doric_entablature', axes: { x: [x0 + 0.55, x0 + 3.0, x0 + 5.5, x0 + 8.0, x0 + 10.4, x1 - 0.55], z: [zc - 3.55, zc - 1.25, zc + 1.25, zc + 3.55] }, y: y + st + h, face: 0.4, arch: 0.62, frieze: 0.62, geison: 0.28, tw: 0.4, overhang: 0.32, mat: 'limestone', triglyphMat: 'egyptian_blue' });
    E.push({ t: 'pediment_roof', rect: [x0 - 0.2, zc - 4.27, x1 + 0.2, zc + 4.27], y: y + st + h + 1.52, rise: 1.2, tympanumInset: 0.35, rakingGeison: 0.28, mat: 'limestone', tileMat: 'roof_tile' });
    E.push({ t: 'slab', rect: [x0 + 0.05, zc - 3.9, x1 - 0.2, zc + 3.9], y0: y + st + h + 1.12, y1: y + st + h + 1.24, mat: 'cedar' });
    E.push({ t: 'xoanon', at: [x0 + 2.6, zc], y: y + st, yaw: Math.PI / 2, h: 1.9, god: 'dionysos' });
    E.push({ t: 'block', rect: [x1 + 7.5, zc - 1.6, x1 + 10.0, zc + 1.6], y0: -0.3, y1: 1.15, mat: 'limestone' });
    E.push({ t: 'block', rect: [x1 + 7.35, zc - 1.75, x1 + 10.15, zc + 1.75], y0: 1.15, y1: 1.3, mat: 'limestone' });
    E.push({ t: 'block', rect: [x1 + 7.7, zc - 1.4, x1 + 9.8, zc + 1.4], y0: 1.3, y1: 1.34, mat: 'rubble', collide: false });
    E.push({ t: 'block', rect: [x1 + 6.6, zc - 2.0, x1 + 7.5, zc + 2.0], y0: -0.3, y1: 0.3, mat: 'limestone' });
  }

  // ── the Odeion of Pericles: almost square, its pyramidal roof on ninety columns in nine rows of ten ──
  {
    const [x0, z0, x1, z1] = ODEION.rect, y = ODEION.y, wt = 1.4, yW = y + 8.0, rise = 12.6, cxo = (x0 + x1) / 2, czo = (z0 + z1) / 2;
    E.push({ t: 'block', rect: [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y0: -0.8, y1: y - 0.12, mat: 'limestone', walk: true });
    E.push({ t: 'floor', rect: [x0 + wt, z0 + wt, x1 - wt, z1 - wt], y, th: 0.14, mat: 'flagstone' });
    // two steps up to the doors on the south and the west
    E.push({ t: 'stair', rect: [cxo - 3.5, z1 + 0.6, cxo + 3.5, z1 + 1.7], dir: 'n', y0: 0.0, y1: y - 0.12, riser: 0.17, base: -0.4, mat: 'limestone' });
    const win = (at) => ({ at, w: 1.3, h: 1.7, y0: y + 5.4, frame: false });
    const H = (L) => Array.from({ length: Math.floor(L / 6.24) - 1 }, (_, i) => 6.24 * (i + 1));
    E.push({ t: 'wall', a: [x0, z1 - wt / 2], b: [x1, z1 - wt / 2], th: wt, y0: y - 0.12, y1: yW, mat: 'limestone', openings: [{ at: (x1 - x0) / 2, w: 3.2, h: 5.0, y0: y }, ...H(x1 - x0).filter((u) => Math.abs(u - (x1 - x0) / 2) > 3).map((u) => win(u))] });
    E.push({ t: 'wall', a: [x0, z0 + wt / 2], b: [x1, z0 + wt / 2], th: wt, y0: y - 0.12, y1: yW, mat: 'limestone' });
    E.push({ t: 'wall', a: [x0 + wt / 2, z0 + wt], b: [x0 + wt / 2, z1 - wt], th: wt, y0: y - 0.12, y1: yW, mat: 'limestone', openings: [{ at: 20, w: 2.6, h: 4.4, y0: y }, { at: 46, w: 2.6, h: 4.4, y0: y }, ...H(z1 - z0 - 2 * wt).filter((u) => Math.abs(u - 20) > 3 && Math.abs(u - 46) > 3).map((u) => win(u))] });
    E.push({ t: 'wall', a: [x1 - wt / 2, z0 + wt], b: [x1 - wt / 2, z1 - wt], th: wt, y0: y - 0.12, y1: yW, mat: 'limestone', openings: H(z1 - z0 - 2 * wt).map((u) => win(u)) });
    for (const zz of [z0 + wt + 20, z0 + wt + 46]) E.push({ t: 'stair', rect: [x0 - 1.7, zz - 1.6, x0 - 0.6, zz + 1.6], dir: 'e', y0: 0.0, y1: y - 0.12, riser: 0.17, base: -0.4, mat: 'limestone' });
    // the columns: their heads rise with the roof
    const X = Array.from({ length: 9 }, (_, i) => x0 + (x1 - x0) * (i + 1) / 10), Z = Array.from({ length: 10 }, (_, j) => z0 + (z1 - z0) * (j + 1) / 11);
    const hx = (x1 - x0) / 2, ridge = (z1 - z0) / 2 - hx, roofAt = (x, z) => yW + rise * (1 - Math.max(Math.abs(x - cxo), Math.abs(z - czo) - ridge) / hx);
    for (const x of X) for (const z of Z) E.push({ t: 'column', at: [x, z], y, h: roofAt(x, z) - 0.55 - 0.5 - y, d: 0.95, mat: 'limestone', flutes: 0 });
    E.push({ t: 'odeion_roof', rect: ODEION.rect, y: yW, rise, cols: { x: X, z: Z } });
    // the benches: rows of planks on posts facing south, between the columns, over the northern two-thirds of the hall
    const runs = [];
    for (let z = z0 + wt + 1.2; z < czo + 10; z += 1.05) for (let i = 0; i < 10; i++) {
      const xa = (i === 0 ? x0 + wt : X[i - 1]) + 0.75, xb = (i === 9 ? x1 - wt : X[i]) - 0.75;
      if (!Z.some((zz) => Math.abs(zz - z) < 0.75 || Math.abs(zz - z - 0.36) < 0.75)) runs.push([xa, xb, z]);
    }
    E.push({ t: 'benches', runs, y, rect: [x0 + wt, z0 + wt, x1 - wt, czo + 10] });
    // the platform for the musicians and the poets in the southern part, a few steps up
    E.push({ t: 'block', rect: [cxo - 7, czo + 15, cxo + 7, czo + 21], y0: y, y1: y + 0.9, mat: 'planks_grey', walk: true });
    E.push({ t: 'stair', rect: [cxo - 2, czo + 13.6, cxo + 2, czo + 15], dir: 's', y0: y, y1: y + 0.9, riser: 0.18, base: y, mat: 'planks_grey' });
  }
  return E;
}

/** The summit's smaller sanctuaries and offerings; y is the summit's paving. */
export function summitSanctuaries(y) {
  const E = [];
  // the sanctuary of Artemis Brauronia: the stoa against the south wall facing north, its two wings at the corners
  // facing each other; the wooden image in the west wing hung with the clothes given her; the precinct's north wall with
  // the entrance at its north-east corner; Strongylion's bronze horse in the court
  const sy = y + 0.5;
  E.push({ t: 'stoa', rect: [-106, 35, -68, 41.8], front: 'n', y: sy, h: 3.9, d: 0.6, sp: 2.4, flutes: 0, wings: { depth: 9.3, width: 6.4, sp: 2.4 }, mat: 'limestone', wall: 'limestone', triglyphMat: 'egyptian_blue', seed: 31 });
  E.push({ t: 'xoanon', at: [-103.0, 29.0], y: sy, yaw: Math.PI / 2, h: 1.75, god: 'artemis', gifts: 6 });
  E.push({ t: 'wall', a: [-107.5, 19.5], b: [-72.5, 19.5], th: 0.6, y0: y, y1: y + 1.6, mat: 'limestone' });
  E.push({ t: 'wall', a: [-64.8, 19.5], b: [-64.8, 44], th: 0.6, y0: y, y1: y + 1.6, mat: 'limestone' });
  E.push({ t: 'trojan_horse', at: [-87, 27.5], y, yaw: 0, h: 3.2 });
  // the stretch of the Mycenaean wall under the Brauronion's west end, south of the Propylaia
  E.push({ t: 'cyclopean', a: [-110.5, 18.5], b: [-110.5, 41.5], th: 4.2, y0: y - 0.5, y1: y + 2.6, seed: 5 });
  // the bronze store: a long hall of poros before the south wall (its north portico is of the 4th century, not yet
  // built), the door in the middle of its north side; inside, the racks of armour, vessels and shields
  {
    const x0 = -61.5, x1 = -18.5, z0 = 44, z1 = 58, h = 6.2, w = 0.8;
    E.push({ t: 'block', rect: [x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y0: y - 0.4, y1: y + 0.35, mat: 'limestone', walk: true });
    const yf = y + 0.35, D = (at, ww, hh) => ({ at, w: ww, h: hh, y0: yf });
    E.push({ t: 'wall', a: [x0, z0 + w / 2], b: [x1, z0 + w / 2], th: w, y0: yf, y1: yf + h, mat: 'limestone', openings: [D(21.5, 2.6, 4.0), D(8, 1.6, 3.2), D(35, 1.6, 3.2)] });
    E.push({ t: 'wall', a: [x0, z1 - w / 2], b: [x1, z1 - w / 2], th: w, y0: yf, y1: yf + h, mat: 'limestone' });
    for (const x of [x0 + w / 2, x1 - w / 2]) E.push({ t: 'wall', a: [x, z0 + w], b: [x, z1 - w], th: w, y0: yf, y1: yf + h, mat: 'limestone' });
    for (const x of [x0 + 14.3, x0 + 28.6]) E.push({ t: 'column', at: [x, (z0 + z1) / 2], y: yf, h, d: 0.62, mat: 'limestone', flutes: 0 });
    E.push({ t: 'beam', a: [x0 + w, (z0 + z1) / 2], b: [x1 - w, (z0 + z1) / 2], y: yf + h, w: 0.55, h: 0.7, mat: 'cedar' });
    E.push({ t: 'coffers', rect: [x0 + w, z0 + w, x1 - w, z1 - w], y: yf + h, depth: 0.22, cell: 1.5, beam: 0.18, mat: 'cedar' });
    E.push({ t: 'pediment_roof', rect: [x0 - 0.45, z0 - 0.45, x1 + 0.45, z1 + 0.45], y: yf + h + 0.7, rise: 1.75, tympanumInset: 0.3, rakingGeison: 0.3, mat: 'limestone', tileMat: 'roof_tile' });
    for (const [a, b] of [[x0 + w + 0.2, x0 + 19.5], [x0 + 23.5, x1 - w - 1.2]]) E.push({ t: 'armoury', rect: [a, z1 - w - 0.6, b, z1 - w], y: yf, seed: Math.round(a * 13) });
    E.push({ t: 'armoury', rect: [x0 + w, z0 + w + 1.2, x0 + w + 0.6, z1 - w - 1.4], y: yf, seed: 9 });
    E.push({ t: 'votive', kind: 'stele', at: [x0 + 17.2, z0 - 1.6], y, yaw: Math.PI, h: 1.9, w: 0.6 });
  }
  // offerings along the way up from the Propylaia: the Lemnian Athena, the inscribed decrees, a bronze tripod
  E.push({ t: 'votive', kind: 'lemnian', at: [-98, -13], y, yaw: Math.PI / 2 - 0.25, h: 2.1 });
  E.push({ t: 'votive', kind: 'tripod', at: [-60, 12], y });
  for (const [x, z, h, yaw] of [[-104, 11.5, 2.4, Math.PI], [-101.5, 11.8, 1.8, Math.PI], [-48, -12.5, 3.2, 0], [-45.5, -12.2, 2.0, 0], [-43, -12.6, 2.6, 0]]) E.push({ t: 'votive', kind: 'stele', at: [x, z], y, yaw, h, w: h > 3 ? 1.05 : 0.6 });
  return E;
}
