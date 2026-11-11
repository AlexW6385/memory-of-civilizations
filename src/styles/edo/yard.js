// The parts of a samurai compound (yashiki) as pure data: the gate-house, the main house, the storehouse, the
// retainers' row house (nagaya), the garden spot; shared by the style (which builds them) and the settlement's ground
// (which plants the free yard). docs/settlements/edo-himeji.md §5.7.
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** { gate, house, roof ('xieshan'|'hip'), kura (rect|null), garden [x, z], nagaya, well: [x, z]|null } of a compound { rect, seed, gate }. */
export function yashikiParts(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, g = el.gate || 's', W = x1 - x0, D = z1 - z0;
  const gl = Math.min(18, (g === 'n' || g === 's' ? W : D) * 0.55), gd = 4.5, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const gate = g === 's' ? [cx - gl / 2, z1 - gd, cx + gl / 2, z1] : g === 'n' ? [cx - gl / 2, z0, cx + gl / 2, z0 + gd] : g === 'e' ? [x1 - gd, cz - gl / 2, x1, cz + gl / 2] : [x0, cz - gl / 2, x0 + gd, cz + gl / 2];
  const m = 5;
  const house = g === 's' ? [x0 + m, z0 + m, x1 - m - (W > 30 ? 8 : 0), z0 + m + D * 0.42] : g === 'n' ? [x0 + m + (W > 30 ? 8 : 0), z1 - m - D * 0.42, x1 - m, z1 - m]
    : g === 'e' ? [x0 + m, z0 + m, x0 + m + W * 0.45, z1 - m - 6] : [x1 - m - W * 0.45, z0 + m + 6, x1 - m, z1 - m];
  const roof = rand() < 0.75 ? 'xieshan' : 'hip';
  const kr = g === 's' ? [x1 - 9, z0 + 4, x1 - 3, z0 + 11] : g === 'n' ? [x0 + 3, z1 - 11, x0 + 9, z1 - 4] : g === 'e' ? [x1 - 11, z0 + 3, x1 - 4, z0 + 9] : [x0 + 4, z1 - 9, x0 + 11, z1 - 3];
  const kura = rand() < 0.8 ? kr : null;
  const garden = g === 's' ? [x0 + 7, z1 - 10.5] : g === 'n' ? [x0 + 7, z0 + 10.5] : g === 'e' ? [x1 - 8, z1 - 7] : [x0 + 8, z0 + 8];
  const nagaya = g === 's' ? [x1 - 4.4, z0 + 12.5, x1 - 1.3, z1 - 5.5] : g === 'n' ? [x1 - 4.4, z0 + 6, x1 - 1.3, z1 - 1.5] : g === 'e' ? [x0 + 2, z1 - 4.4, x1 - 14, z1 - 1.3] : [x0 + 14, z0 + 1.3, x1 - 2, z0 + 4.4];
  return { gate, house, roof, kura, garden, nagaya, g, gw: 1.7 + (rng((el.seed || 1) + 17)() * 0.3) };
}

/** Is (x, z) free yard in a compound (clear of every part and 1.4 m in from the walls)? */
export function yardFree(el, x, z) {
  const [x0, z0, x1, z1] = el.rect;
  if (x < x0 + 1.6 || x > x1 - 1.6 || z < z0 + 1.6 || z > z1 - 1.6) return false;
  const P = yashikiParts(el), hit = (r, mg) => r && x > r[0] - mg && x < r[2] + mg && z > r[1] - mg && z < r[3] + mg;
  if (hit(P.gate, 2.5) || hit(P.house, 3.2) || hit(P.kura, 2) || hit(P.nagaya, 1.5)) return false;
  if (Math.hypot(x - P.garden[0], z - P.garden[1]) < 5.5) return false;
  return true;
}
