// The daga houses and homesteads (docs/settlements/great-zimbabwe.md §5, §15): walled compounds, each with its
// houses round a yard, a granary raised on stones, firewood and seats; a few houses stand free in the Great Enclosure.
import { RADIUS, compounds, huts, height, inWalled, inEnclosure, onAscent, KRAAL_AT } from './layout.js';
import { people, mounds } from './life.js';
export async function town() {
  const E = [];
  for (const k of compounds()) {
    E.push({ t: 'compound', c: k.c, r: k.r, gap: k.gap, yAt: height, seed: k.seed });
    const [gx, gz] = k.granary;
    E.push({ t: 'granary', c: [gx, gz], y: height(gx, gz), rot: Math.atan2(k.c[1] - gz, k.c[0] - gx), seed: k.seed });
  }
  for (const k of compounds()) E.push({ t: 'homestead_goods', c: k.c, r: k.r, gap: k.gap, yAt: height, seed: k.seed });
  // plots of standing millet beside every second homestead, on the side away from its gate, clear of the other compounds, the walls and the kraals
  {
    const all = compounds();
    all.forEach((k, i) => {
      if (k.inner || i % 2) return;
      const a = k.gap + Math.PI + (i % 4 - 1.5) * 0.35, d = k.r + 7.5, x = k.c[0] + Math.cos(a) * d, z = k.c[1] + Math.sin(a) * d, w = 4;
      const pts = [[x, z], [x - w, z], [x + w, z], [x, z - w], [x, z + w], [x - w, z - w], [x + w, z + w], [x - w, z + w], [x + w, z - w]];
      if (pts.some(([px, pz]) => inWalled(px, pz, 3) || inEnclosure(px, pz, 4) || onAscent(px, pz, 3) || height(px, pz) > 3 || Math.hypot(px, pz) > RADIUS - 60)) return;
      if (all.some((o) => o !== k && Math.hypot(o.c[0] - x, o.c[1] - z) < o.r + w * 1.45 + 1) || KRAAL_AT.some(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) < kr + w * 1.45 + 2)) return;
      E.push({ t: 'millet_plot', rect: [x - w, z - w, x + w, z + w], yAt: height, seed: 40 + i });
    });
  }
  for (const h of huts()) E.push({ t: 'daga_hut', ...h });
  for (const m of mounds()) E.push({ t: 'termite_mound', ...m });
  const frame = { origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } };
  return [{ id: 'great-zimbabwe-huts', style: 'zimbabwe', ...frame, elements: E },
    { id: 'great-zimbabwe-life', style: 'life', ...frame, elements: people() }];
}
