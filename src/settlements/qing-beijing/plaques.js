// The palace's plaques (docs/settlements/qing-beijing.md §42): the vertical plaque of the Hall of Supreme Harmony hung between its two eaves,
// "Manchu on the left, Chinese on the right, the Chinese written vertically" [stated: The Paper, 9707659]; the plaques of the Halls of
// Central and Preserving Harmony of the same form [inferred]. A blue board in a gilt frame with cloud-lobed head and foot, the Chinese in gilt
// raised on the right half; the left half (the Manchu) is left plain: its script is not one this writing can verify.
// Element of style `qing` (bj_plaque), registered here; index.js puts the list in the landmark plan.
import { STYLES } from '../../core/build.js';
import '../../styles/qing/index.js';
import { box, fromTriangles } from '../../core/geom.js';
import { HALLS, WALL } from './layout.js';
import { inscriptionTris, canWrite } from './writing.js';

/** The plaques: { x, y (the middle), z (the wall's plane), yaw (0: faces +z), text, w, h }. Wall planes follow qing_hall (styles/qing/index.js: the upper body set in by `inset`). */
export function palacePlaques() {
  const out = [];
  // Hall of Supreme Harmony (double eaves, H 9.2, 3 tiers of brackets 1.03 m): the upper body's south wall above the lower roof's top, under the frieze
  { const t = HALLS.taihe, inset = Math.min(64, 37) / 5.5, yb = t.y + 9.2 + 1.03; out.push({ x: 0, y: yb + 6.3, z: t.rect[3] - inset + 0.03, yaw: 0, text: '太和殿', w: 1.1, h: 1.7 }); }
  // Hall of Preserving Harmony (double eaves, H 7.6, 2 tiers 0.88 m)
  { const b = HALLS.baohe, inset = Math.min(49, 24) / 5.5, yb = b.y + 7.6 + 0.88; out.push({ x: 0, y: yb + 4.75, z: b.rect[3] - inset + 0.03, yaw: 0, text: '保和殿', w: 0.95, h: 1.7 }); }
  // Hall of Central Harmony (single eaves, H 6.4): over the door under the frieze beam
  { const z = HALLS.zhonghe; out.push({ x: 0, y: z.y + 4.7, z: z.rect[3] + 0.12, yaw: 0, text: '中和殿', w: 0.85, h: 1.4 }); }
  // Meridian Gate (docs §42): a horizontal board over the middle of the great hall's upper wall (the hall: plan.js, rect z 167.2...176.8, H 7.5, double 6, 2 tiers of brackets 0.88),
  // over the painted frieze under the upper eaves (the lower roof hides the wall below); the Chinese in the right half, the Manchu half plain
  { const wz1 = WALL.rect[3], inset = Math.min(60, 9.6) / 5.5, yb = 12.6 + 7.5 + 0.88; out.push({ x: 0, y: yb + 5.3, z: wz1 + 1.8 - inset + 0.09, yaw: 0, text: '午門', w: 3.6, h: 1.0, horizontal: true }); }
  return out.filter((p) => canWrite(p.text));
}

const rect = (x0, y0, x1, y1, z, t) => { t.push(x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z); };
/** A half-disc head (up: +1) or foot (up: -1) of cloud lobes on a plaque's edge: three little half-circles, flat at z. */
function lobes(t, w, yEdge, up, z) {
  const n = 3, r = w / (2 * n);
  for (let k = 0; k < n; k++) {
    const cx = -w / 2 + r * (2 * k + 1);
    for (let i = 0; i < 8; i++) {
      const a0 = Math.PI * i / 8, a1 = Math.PI * (i + 1) / 8;
      const p = (a) => [cx + Math.cos(a) * r, yEdge + up * Math.sin(a) * r * 0.9];
      const a = p(a0), b = p(a1);
      if (up > 0) t.push(cx, yEdge, z, a[0], a[1], z, b[0], b[1], z); else t.push(cx, yEdge, z, b[0], b[1], z, a[0], a[1], z);
    }
  }
}

function bjPlaque(el, { bag }) {
  for (const p of el.list) {
    const w = p.w, h = p.h, tb = 0.1, tris = { blue: [], gilt: [] }, parts = [];
    const y0 = -h / 2, y1 = h / 2, f = 0.06;
    parts.push(['paint_blue', box(-w / 2, y0, 0, w / 2, y1, tb)]);
    if (p.horizontal) {
      // a horizontal board: gilt frame, a middle line; the Chinese in the right half, written right to left (the first character at the right)
      for (const g of [[-w / 2, y0, w / 2, y0 + f], [-w / 2, y1 - f, w / 2, y1], [-w / 2, y0, -w / 2 + f, y1], [w / 2 - f, y0, w / 2, y1], [-0.012, y0 + f, 0.012, y1 - f]]) rect(g[0], g[1], g[2], g[3], tb + 0.012, tris.gilt);
      const n = [...p.text].length, pitch = Math.min(0.9, (w / 2 - 0.2) / n), size = Math.min(pitch * 0.92, h - 0.2);
      tris.gilt.push(...inscriptionTris(p.text, { pitch, size, z0: tb + 0.012, z1: tb + 0.03, vertical: false, thick: 1.25, cx: w / 4, cy: 0 }));
      parts.push(['gilt_bronze', fromTriangles(tris.gilt)]);
      for (const [mat, g] of parts) { g.rotateY(p.yaw); g.translate(p.x, p.y, p.z); bag.add(mat, g); }
      continue;
    }
    // the gilt frame and the cloud lobes at head and foot
    for (const g of [[-w / 2, y0, w / 2, y0 + f], [-w / 2, y1 - f, w / 2, y1 - f + f], [-w / 2, y0, -w / 2 + f, y1], [w / 2 - f, y0, w / 2, y1]]) rect(g[0], g[1], g[2], g[3], tb + 0.012, tris.gilt);
    lobes(tris.blue, w, y1, 1, tb); lobes(tris.blue, w, y0, -1, tb);
    // the middle line between the two scripts, and the Chinese text on the right half, raised
    rect(-0.012, y0 + f, 0.012, y1 - f, tb + 0.012, tris.gilt);
    const n = [...p.text].length, pitch = Math.min(0.55, (h - 0.25) / n), size = Math.min(pitch * 0.9, w / 2 * 0.8);
    tris.gilt.push(...inscriptionTris(p.text, { pitch, size, z0: tb + 0.012, z1: tb + 0.03, vertical: true, thick: 1.25, cx: w / 4, cy: 0 }));
    parts.push(['gilt_bronze', fromTriangles(tris.gilt)], ['paint_blue', fromTriangles(tris.blue)]);
    for (const [mat, g] of parts) { g.rotateY(p.yaw); g.translate(p.x, p.y, p.z); bag.add(mat, g); }
  }
}
STYLES.qing.elements.bj_plaque = bjPlaque;
