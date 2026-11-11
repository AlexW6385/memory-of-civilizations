// The monastery's three courts (docs/settlements/tang-wutai.md §11), second pass: the paving worn into a path of slabs
// along the axis, moss and sprouting weeds at the foot of the retaining walls and stairs, the raised beds of the old
// pines. Elements in settlement coordinates (the hall plan's origin is at x = 60).

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const COURTS = [[-52, -15, 0], [4, 17.5, 6.5], [32, 43.5, 13]];          // [x from, x to, paving y] of the axial path of each court

export const BEDS = [[-38, -22, 0], [-38, 22, 0], [-22, -22, 0], [-22, 22, 0], [9, -23, 6.5], [9, 23, 6.5], [37, -20, 13], [37, 19, 13]];   // [x, z, y]

export function courtElements() {
  const E = [], rand = rng(857), add = (o) => E.push(o);
  // the worn path: slabs of bluestone laid in three rows along the axis, each its own thickness, the joints between them
  for (const [x0, x1, y] of COURTS) {
    for (let x = x0; x < x1 - 0.6; x += 1.7) for (const row of [-1, 0, 1]) {
      const w = 1.62 - rand() * 0.2, z = row * 1.04;
      add({ t: 'block', rect: [x + 0.04, z - 0.47, x + w, z + 0.47], y0: y - 0.02, y1: y + 0.02 + rand() * 0.025, mat: rand() < 0.25 ? 'limestone' : 'bluestone', collide: false });
    }
    // the path's edge: a row of small stones
    for (const sg of [-1, 1]) for (let x = x0; x < x1 - 0.3; x += 0.55 + rand() * 0.2) add({ t: 'block', rect: [x, sg * 1.62 - 0.1, x + 0.35, sg * 1.62 + 0.1], y0: y - 0.02, y1: y + 0.05 + rand() * 0.04, mat: 'pebbles', collide: false });
  }
  // moss and grass in the courts' joints: along the foot of the retaining walls and the stairs' cheeks, the corners
  const mossy = (x0, x1, z0, z1, y, n) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0), w = 0.3 + rand() * 0.9, d = 0.2 + rand() * 0.5;
      add({ t: 'block', rect: [x, z, Math.min(x1, x + w), Math.min(z1, z + d)], y0: y - 0.01, y1: y + 0.018 + rand() * 0.02, mat: 'sod', collide: false });
    }
  };
  mossy(-3.4, -2.3, -47, 47, 0, 70); mossy(28.4, 29.4, -47, 47, 6.5, 0);                // the foot of the middle terrace's wall (courtyard side)
  mossy(-1.9, -0.9, -47, 47, 6.5, 0);                                                  // (the wall's other foot is the terrace paving's edge)
  mossy(-58, -2, -47.2, -45.6, 0, 40); mossy(-58, -2, 45.6, 47.2, 0, 40);              // under the courtyard's side walls
  mossy(-1.6, 0, -47, 47, 6.5, 22); mossy(30, 31.5, -47, 47, 13, 30);                  // the terraces' corners and the upper terrace's foot of the retaining wall
  mossy(-14, -2, -6, -3, 0, 14); mossy(-14, -2, 3, 6, 0, 14);                          // beside the courtyard stair's cheek walls
  // the raised beds of the old pines: a brick rim, the earth heaped inside, a pine standing in the middle
  BEDS.forEach(([x, z, y], i) => {
    add({ t: 'block', rect: [x - 1.7, z - 1.7, x + 1.7, z + 1.7], y0: y - 0.05, y1: y + 0.42, mat: 'brick_grey' });
    add({ t: 'block', rect: [x - 1.8, z - 1.8, x + 1.8, z + 1.8], y0: y + 0.38, y1: y + 0.46, mat: 'limestone', collide: false });
    add({ t: 'block', rect: [x - 1.5, z - 1.5, x + 1.5, z + 1.5], y0: y + 0.4, y1: y + 0.52, mat: 'sod', collide: false });
    add({ t: 'wutai_pine', at: [x + (rand() - 0.5) * 0.6, z + (rand() - 0.5) * 0.6], y: y + 0.5, h: 5.2 + rand() * 2.4, seed: i * 17 + 3 });
  });
  // the litter of the old pines on the paving round each bed: fallen needles and bark, and a few cones [inferred: what pines do over a paved court]
  BEDS.forEach(([x, z, y]) => {
    for (let i = 0; i < 26; i++) {
      const th = rand() * 6.283, r = 1.95 + Math.pow(rand(), 1.6) * 2.2, w = 0.25 + rand() * 0.7, d = 0.15 + rand() * 0.4;
      add({ t: 'block', rect: [x + Math.cos(th) * r - w / 2, z + Math.sin(th) * r - d / 2, x + Math.cos(th) * r + w / 2, z + Math.sin(th) * r + d / 2], y0: y - 0.01, y1: y + 0.012 + rand() * 0.01, mat: 'roof_bark', collide: false });
    }
    for (let i = 0; i < 5; i++) { const th = rand() * 6.283, r = 2.0 + rand() * 1.6; add({ t: 'block', rect: [x + Math.cos(th) * r - 0.04, z + Math.sin(th) * r - 0.04, x + Math.cos(th) * r + 0.04, z + Math.sin(th) * r + 0.04], y0: y, y1: y + 0.08, mat: 'bark_dark', collide: false }); }
  });
  return E;
}
