// Barcelona about 1910 — the layout (docs/settlements/barcelona.md §2): the Eixample's grid of blocks
// with cut corners; the Sagrada Família rising on its block in the east; the Passeig de Gràcia on
// the west with La Pedrera and Casa Batlló; the Diagonal cutting across. Blocks are compressed
// (≈ 70 m instead of 113 m). Pure data. +x east, +z south (the sea far to the south).

export const RADIUS = 420;
export const PITCH = 92;                                   // block + street
export const BLOCK = 70;
export const SAGRADA = [184, -92];
export const GRACIA_X = -138;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) { return 4 * smooth(250, -350, z) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z))); }
export const onDiagonal = (x, z, m = 0) => Math.abs(z - (-0.55 * x - 120)) < 14 + m;
/** The block centres of the grid inside the disc, without the Diagonal's cut and the special blocks. */
export function blocks() {
  const out = [];
  for (let i = -5; i <= 5; i++) for (let k = -5; k <= 5; k++) {
    const x = i * PITCH, z = k * PITCH;
    if (Math.hypot(x, z) > RADIUS - BLOCK * 0.8 || onDiagonal(x, z, 30)) continue;
    out.push({ c: [x, z], special: Math.hypot(x - SAGRADA[0], z - SAGRADA[1]) < 10 ? 'sagrada' : Math.abs(x - GRACIA_X) < 50 && (k === 0 || k === 1) ? 'gracia' : null, seed: (i + 11) * 31 + (k + 11) });
  }
  return out;
}
