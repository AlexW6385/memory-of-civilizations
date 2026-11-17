// Walls with real openings: a wall layer of thickness T whose window and door holes are cut through, so that the
// jambs, sills and heads of the reveal are solid faces and the frame stands back in them (docs/settlements/amsterdam.md §5.19).

/**
 * Calls emit(ua, ub, va, vb) for the solid boxes that fill u0..u1 × v0..v1 but for the `holes` ({ u0, u1, v0, v1 }, not
 * overlapping): the wall cut into columns at the holes' sides, each column running between its holes.
 */
export function wallHoles(emit, u0, u1, v0, v1, holes) {
  const e = [...new Set([u0, u1, ...holes.flatMap((h) => [h.u0, h.u1])])].filter((u) => u >= u0 - 1e-6 && u <= u1 + 1e-6).sort((a, b) => a - b);
  for (let i = 0; i + 1 < e.length; i++) {
    const a = e[i], b = e[i + 1]; if (b - a < 1e-4) continue;
    const cov = holes.filter((h) => h.u0 <= a + 1e-4 && h.u1 >= b - 1e-4).sort((p, q) => p.v0 - q.v0);
    let cur = v0;
    for (const h of cov) { if (h.v0 > cur + 1e-4) emit(a, b, cur, h.v0); cur = Math.max(cur, h.v1); }
    if (cur < v1 - 1e-4) emit(a, b, cur, v1);
  }
}
