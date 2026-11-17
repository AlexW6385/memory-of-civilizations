// The monastery's gate (docs/settlements/tang-wutai.md §14): a gate hall of three bays by two spans on a low stone platform, standing in
// the precinct's west wall where the lane from the village ends. Its walls carry the plank doors of the middle bay; the two outer rows of
// columns open into a porch on each side; Tang bracket sets under a hipped roof of grey tiles. Elements of the `chinese` style (the
// `wutai-site` style extends it) in settlement coordinates (+x east, +z south). [inferred: the gate's form after the East Hall's
// forms and the Tang gate halls drawn at Dunhuang; the hall plan's earlier stand-in was four posts under a gable]

export const GATE = { x: -52, P: 0.35, H: 4.2 };             // the wall's line, the platform's top, the column height
const ROWS = [-54.6, -52, -49.4];                              // the three rows of columns (two spans of 2.6 m)
const ZL = [-4.95, -1.95, 1.95, 4.95];                         // the four column lines (bays of 3.0, 3.9 and 3.0 m)

export function gateElements() {
  const E = [], add = (o) => (E.push(o), o), { x: X, P, H } = GATE, F = P;
  const blk = (rect, y0, y1, mat, collide = false) => add({ t: 'block', rect, y0, y1, mat, collide });
  const [xw, , xe] = ROWS, zt = ZL[3], top = F + H;
  // the platform: dressed stone, 0.35 m, a step of two risers before the middle bay on the west (the lane) and on the east (the court)
  add({ t: 'block', rect: [xw - 1.3, -zt - 0.95, xe + 1.3, zt + 0.95], y0: -0.2, y1: P - 0.04, mat: 'limestone', walk: false });
  add({ t: 'floor', rect: [xw - 1.3, -zt - 0.95, xe + 1.3, zt + 0.95], y: P, mat: 'bluestone', th: 0.05 });
  add({ t: 'block', rect: [xw - 1.36, -zt - 1.01, xe + 1.36, zt + 1.01], y0: P - 0.14, y1: P - 0.04, mat: 'granite_grey', collide: false });   // the plinth's coping course
  add({ t: 'stair', rect: [xw - 2.4, -1.95, xw - 1.3, 1.95], dir: 'e', y0: 0, y1: P, riser: 0.175, base: 0, mat: 'limestone' });
  add({ t: 'stair', rect: [xe + 1.3, -1.95, xe + 2.4, 1.95], dir: 'w', y0: 0, y1: P, riser: 0.175, base: 0, mat: 'limestone' });
  // columns, three rows by four lines
  for (const x of ROWS) for (const z of ZL) add({ t: 'column', at: [x, z], y: F, h: H, d: 0.46 });
  // bracket sets: on every column of the two outer rows and the ends of the middle one (the corners turned on the diagonal), and one
  // simple set between each pair
  for (const x of [xw, xe]) for (const z of ZL) {
    const s = Math.sign(x - X), end = Math.abs(z) === zt;
    add({ t: 'tang_bracket_set', at: [x, z], y: F + H, dir: end ? [s / Math.SQRT2, Math.sign(z) / Math.SQRT2] : [s, 0], kind: end ? 'corner' : 'column' });
    if (z < zt) { const m = (z + ZL[ZL.indexOf(z) + 1]) / 2; add({ t: 'tang_bracket_set', at: [x, m], y: F + H + 0.82, dir: [s, 0], kind: 'between', post: 0.82 }); }
  }
  for (const z of [-zt, zt]) {
    add({ t: 'tang_bracket_set', at: [X, z], y: F + H, dir: [0, Math.sign(z)], kind: 'column' });
    for (const x of [(xw + X) / 2, (X + xe) / 2]) add({ t: 'tang_bracket_set', at: [x, z], y: F + H + 0.82, dir: [0, Math.sign(z)], kind: 'between', post: 0.82 });
  }
  // architraves: the ring of the outer rows, the middle row's line, and a tie beam across each column line
  for (const x of ROWS) blk([x - 0.17, -zt - 0.3, x + 0.17, zt + 0.3], top - 0.42, top, 'timber_red');
  for (const z of [-zt, zt]) blk([xw - 0.3, z - 0.17, xe + 0.3, z + 0.17], top - 0.42, top, 'timber_red');
  for (const z of ZL.slice(1, 3)) blk([xw, z - 0.12, xe, z + 0.12], top - 0.3, top - 0.0, 'timber_red');
  // the middle row's wall: red earth between the columns, the middle bay open for the doors, the plaster band over the architrave
  const C = 0.28;
  for (let i = 0; i < 3; i++) {
    const a = ZL[i] + C, b = ZL[i + 1] - C, L = b - a;
    add({ t: 'wall', a: [X, a], b: [X, b], th: 0.5, y0: F, y1: top - 0.42, openings: i === 1 ? [{ at: L / 2, w: 3.2, h: 3.5, y0: F }] : [], mat: 'wall_red' });
  }
  add({ t: 'tang_door', at: [X, 0], axis: 'z', y: F, w: 3.2, h: 3.5, th: 0.5, out: -1 });
  blk([X - 0.1, -zt - 0.1, X + 0.1, zt + 0.1], top, top + 2.2, 'paint_white');
  // the board over the doors on the lane's side: a black lacquered plaque in a gilt frame (the lettering is not recorded)
  blk([X - 0.34, -1.35, X - 0.24, 1.35], F + 3.5, F + 4.08, 'lacquer_black');
  blk([X - 0.36, -1.42, X - 0.22, -1.35], F + 3.46, F + 4.12, 'gold'); blk([X - 0.36, 1.35, X - 0.22, 1.42], F + 3.46, F + 4.12, 'gold');
  blk([X - 0.36, -1.42, X - 0.22, 1.42], F + 3.46, F + 3.5, 'gold'); blk([X - 0.36, -1.42, X - 0.22, 1.42], F + 4.08, F + 4.12, 'gold');
  // the roof: a hipped roof of grey tiles on rafters and flying rafters, chiwei at the ridge's ends (the long way along z)
  add({ t: 'hip_roof', c: [X, 0], A: zt + 2.4, B: (xe - xw) / 2 + 2.4, alongZ: true, y: F + H + 2.5, rise: 3.0, eaveSlope: 0.3, pow: 1.6, lift: 0.45, mat: 'tile_grey', soffit: 'timber_red', rafters: { out: 2.4, sp: 0.32 }, tangChiwei: 1.2 });
  // the wear of use: the way worn into the platform's slabs and a threshold dip, moss on the steps' feet and between the flags
  const rr = (s) => { let q = s; return () => ((q = (Math.imul(q, 1664525) + 1013904223) >>> 0) / 4294967296); }, rand = rr(8574);
  for (let x = xw - 1.1; x < xe + 1.1; x += 1.3) blk([x + 0.03, -0.9, Math.min(x + 1.25, xe + 1.28), 0.9], F, F + 0.012 + (Math.round(x * 5) % 3) * 0.004, 'limestone');
  for (let i = 0; i < 14; i++) { const x = (rand() < 0.5 ? xw - 2.3 : xe + 1.4) + rand() * 0.9, z = (rand() - 0.5) * 3.6; blk([x, z, x + 0.2 + rand() * 0.4, z + 0.1 + rand() * 0.3], 0, 0.018 + rand() * 0.01, 'sod'); }
  return E;
}
