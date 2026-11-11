// The Kannon-den of Jishō-ji (docs/settlements/muromachi-kyoto.md §3): two storeys — the lower in the manner of a
// shoin house, the upper a Zen hall with cusped windows — a pent roof between them, a hip roof of cypress bark with a
// bronze phoenix on the ridge. Bare dark timber: the silver foil was planned and never laid. Built facing +z.
import { STYLES } from '../../core/build.js';
import { local, eaveRing, WD, PL, BARK, TM } from './kit.js';

/** A cusped window (katōmado) on the face z = zf, facing +z (s = 1) or −z: a black frame, the paper within. */
export function katomado(T, x, y, zf, w, h, s = 1) {
  const pts = (k) => { const hw = w / 2 * k, o = (1 - k) * h / 2; return [[-hw, o], [hw, o], [hw, o + h * k * 0.55], [hw * 0.55, o + h * k * 0.78], [0, o + h * k], [-hw * 0.55, o + h * k * 0.78], [-hw, o + h * k * 0.55]]; };
  const draw = (mat, k, dz) => { const p = pts(k), t = []; for (let i = 1; i < p.length - 1; i++) { const A = [x + p[0][0], y + p[0][1], zf + s * dz], Bq = [x + p[i][0], y + p[i][1], zf + s * dz], C = [x + p[i + 1][0], y + p[i + 1][1], zf + s * dz]; t.push(...A, ...Bq, ...C, ...A, ...C, ...Bq); } T(mat, t); };
  draw('lacquer_black', 1, 0.05); draw('shoji', 0.8, 0.07);
}

function kannonDen(el, ctx) {
  local(el, ctx, ({ bag, col, B, T, L }, y0) => {
    const W = 10.5, D = 8.4, hw = W / 2, hd = D / 2, F = 0.9, H1 = 3.4, H2 = 3.6, yT = y0 + F + H1, yU = yT + H2;
    // the footing: stones under every post, the floor on its joists, the platform closed by a skirt board
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 4; j++) {
      const x = -hw + i * 2.1, z = -hd + j * 2.1;
      B('granite_block', x - 0.24, y0, z - 0.24, x + 0.24, y0 + 0.38, z + 0.24);
      B(WD, x - 0.11, y0 + 0.38, z - 0.11, x + 0.11, y0 + F + H1, z + 0.11);
    }
    B(TM, -hw - 0.1, y0 + F - 0.3, -hd - 0.1, hw + 0.1, y0 + F, hd + 0.1);
    B(WD, -hw - 0.12, y0 + 0.45, -hd - 0.12, hw + 0.12, y0 + F - 0.3, -hd + 0.01);
    // the walls of the lower floor: plaster between the posts at the back and the sides, lattice shutters on the front
    const y1 = y0 + F;
    B(PL, -hw + 0.1, y1, -hd + 0.04, hw - 0.1, yT - 0.25, -hd + 0.14);
    for (const sx of [-1, 1]) B(PL, sx > 0 ? hw - 0.14 : -hw + 0.04, y1, -hd + 0.1, sx > 0 ? hw - 0.04 : -hw + 0.14, yT - 0.25, hd - 0.1);
    for (let i = 0; i < 5; i++) {
      const xa = -hw + i * 2.1 + 0.12, xb = xa + 1.86, open = i > 0 && i < 4 && i !== 2;
      if (open) B('opening', xa, y1 + 0.1, hd - 0.2, xb, yT - 0.7, hd - 0.12);
      else B('koshi', xa, y1 + 0.12, hd - 0.1, xb, yT - 0.7, hd - 0.05);
      B(PL, xa, yT - 0.7, hd - 0.1, xb, yT - 0.25, hd - 0.03);                       // the transom
      B(WD, xa, yT - 0.75, hd - 0.08, xb, yT - 0.7, hd + 0.04);
      B(WD, xa, y1 + 0.08, hd - 0.08, xb, y1 + 0.16, hd + 0.04);                     // the sill rail
    }
    for (let i = 0; i <= 5; i++) B('lacquer_black', -hw + i * 2.1 - 0.13, y1, hd - 0.14, -hw + i * 2.1 + 0.13, yT, hd + 0.02);
    B(WD, -hw - 0.2, yT - 0.25, -hd - 0.2, hw + 0.2, yT, hd + 0.2);                  // the head beam, round
    B(WD, -hw - 0.1, y1 + 2.45, hd - 0.05, hw + 0.1, y1 + 2.52, hd + 0.08);          // the tie beam
    // the verandah along the front, its rail, the steps of three stones
    B(TM, -hw - 0.3, y1 - 0.12, hd, hw + 0.3, y1, hd + 1.5);
    for (let i = 0; i <= 6; i++) { const x = -hw - 0.2 + i * (W + 0.4) / 6; B(WD, x - 0.07, y0 + 0.4, hd + 1.35, x + 0.07, y1 - 0.12, hd + 1.48); }
    for (const [a, b] of [[-hw - 0.3, -1.4], [1.4, hw + 0.3]]) { B('lacquer_black', a, y1 + 0.78, hd + 1.4, b, y1 + 0.86, hd + 1.5); B('lacquer_black', a, y1 + 0.38, hd + 1.42, b, y1 + 0.42, hd + 1.48); for (let x = a + 0.1; x < b; x += 1.0) B('lacquer_black', x - 0.04, y1, hd + 1.4, x + 0.04, y1 + 0.8, hd + 1.48); col.rect([a, hd + 1.38, b, hd + 1.52], y1, y1 + 0.9); }
    for (let k = 0; k < 3; k++) B('granite_block', -1.3, y0 + k * 0.3, hd + 1.5 + (2 - k) * 0.4, 1.3, y0 + (k + 1) * 0.3, hd + 1.5 + (3 - k) * 0.4 + (k === 2 ? 0 : 0));
    col.ramp([-1.3, hd + 1.5, 1.3, hd + 2.7], y0, y1 - 0.12, 'n');
    col.floor([-hw - 0.3, hd, hw + 0.3, hd + 1.5], y1);
    col.rect([-hw, -hd, hw, hd], y0, yU + 4);
    // the pent roof between the floors, the upper floor of 3 × 2 bays on the lower ceiling
    const ux = 3.15, uz = 2.1;
    eaveRing(T, BARK, TM, [-hw - 1.3, -hd - 1.3, hw + 1.3, hd + 1.3], [-ux - 0.15, -uz - 0.15, ux + 0.15, uz + 0.15], yT + 0.05, yT + 1.35);
    B(BARK, -hw - 1.3, yT - 0.0, hd + 1.3 - 0.02, hw + 1.3, yT + 0.05, hd + 1.3);
    // (rafter ends along the eave)
    for (let x = -hw - 1.1; x <= hw + 1.1; x += 0.55) { B(WD, x - 0.05, yT - 0.22, hd + 1.0, x + 0.05, yT - 0.04, hd + 1.3); B(WD, x - 0.05, yT - 0.22, -hd - 1.3, x + 0.05, yT - 0.04, -hd - 1.0); }
    for (let z = -hd - 1.1; z <= hd + 1.1; z += 0.55) for (const sx of [-1, 1]) B(WD, sx > 0 ? hw + 1.0 : -hw - 1.3, yT - 0.22, z - 0.05, sx > 0 ? hw + 1.3 : -hw - 1.0, yT - 0.04, z + 0.05);
    B(WD, -ux, yT, -uz, ux, yU, uz);
    for (let i = 0; i <= 3; i++) B('lacquer_black', -ux + i * 2.1 - 0.1, yT, uz - 0.02, -ux + i * 2.1 + 0.1, yU, uz + 0.06);
    for (const sx of [-1, 1]) for (let j = 0; j <= 2; j++) B('lacquer_black', sx * ux - 0.1 + (sx > 0 ? 0.06 : -0.06), yT, -uz + j * 2.1 - 0.1, sx * ux + 0.1 + (sx > 0 ? 0.06 : -0.06), yU, -uz + j * 2.1 + 0.1);
    B(PL, -ux + 0.1, yT + 1.1, uz, ux - 0.1, yU - 0.3, uz + 0.04);
    B(PL, -ux + 0.1, yT + 1.1, -uz - 0.04, ux - 0.1, yU - 0.3, -uz);
    B(WD, -ux - 0.12, yU - 0.3, -uz - 0.12, ux + 0.12, yU, uz + 0.12);
    // the cusped windows: three on the front, one at each side
    for (const x of [-2.1, 0, 2.1]) katomado(T, x, yT + 1.35, uz + 0.04, 1.1, 1.7);
    katomado(T, 0, yT + 1.35, -uz - 0.04, 1.1, 1.7, -1);
    // the upper hip roof, its eave a hand above the head beam, the phoenix on the ridge
    const R = 3.2;
    STYLES.japanese.elements.irimoya({ c: [0, 0], A: ux + 1.25, B: uz + 1.25, y: yU + 0.1, rise: R, lift: 0.75, gable: 1, mat: BARK, soffit: TM }, { bag, col });
    const phx = STYLES.japanese.objects?.phoenix;
    B('gilt_bronze', -0.3, yU + 0.1 + R - 0.05, -0.3, 0.3, yU + 0.1 + R + 0.25, 0.3);
    phx?.({ at: [0, 0], y: yU + 0.1 + R + 0.25, dir: [0, 1] }, { bag, col });
  });
}
export const ginkakuElements = { kannon_den: kannonDen };
