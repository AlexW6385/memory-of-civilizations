// The rotunda's lower wall as faced in marble (docs/buildings/pantheon.md §8g): between each aedicula and the niche or door
// beside it a strip of wall in panels — a white skirting; a tall panel of pavonazzetto in a giallo frame; a square with a
// porphyry roundel; a second tall panel; and over every aedicula a long panel of porphyry between its entablature and the
// first cornice. [stated: the interior walls were revetted in coloured marbles, pavonazzetto, giallo antico, porphyry —
// Wikipedia, pantheon.museum (dossier §7); the layout of the panels inferred]
//
// revetment_panels { c, R, y (the floor), top (the underside of the first cornice), aed: [bearings], gaps: [{ b, w }] }

import { fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const D2R = Math.PI / 180;

export function revetmentPanels(el, { bag }) {
  const { c, R, y, top } = el, wh = [], gy = [], pv = [], pr = [];
  const arc = (out, b, u0, u1, ya, yb, d0, d1) => {
    const n = Math.max(1, Math.ceil((u1 - u0) / 0.5));
    for (let i = 0; i < n; i++) {
      const t0 = (b - 90) * D2R + (u0 + (u1 - u0) * i / n) / R, t1 = (b - 90) * D2R + (u0 + (u1 - u0) * (i + 1) / n) / R;
      const P = (d, t, yy) => [c[0] + (R - d) * Math.cos(t), yy, c[1] + (R - d) * Math.sin(t)];
      hexa(out, [P(d0, t0, ya), P(d1, t0, ya), P(d1, t1, ya), P(d0, t1, ya)], [P(d0, t0, yb), P(d1, t0, yb), P(d1, t1, yb), P(d0, t1, yb)]);
    }
  };
  const near = (b) => el.gaps.reduce((m, g) => (Math.abs(((g.b - b + 540) % 360) - 180) < Math.abs(((m.b - b + 540) % 360) - 180) ? g : m));
  const strips = [];
  for (const ba of el.aed) {
    // over the aedicula: a long porphyry panel framed in giallo
    const hw = 2.1;
    arc(gy, ba, -hw, hw, top - 1.75, top - 0.2, -0.05, 0.035);
    arc(pr, ba, -hw + 0.14, hw - 0.14, top - 1.61, top - 0.34, -0.05, 0.06);
    arc(wh, ba, -hw - 0.12, hw + 0.12, top - 1.83, top - 1.75, -0.05, 0.07);
    for (const s of [-1, 1]) {
      // the strip of wall to the next niche or door
      const g = el.gaps.filter((q) => Math.abs((((q.b - ba + 540) % 360) - 180)) < 30).find((q) => (((q.b - ba + 540) % 360) - 180) * s > 0);
      if (!g) continue;
      const half = Math.asin(g.w / 2 / R) / D2R, gc = ba + s * Math.abs((((g.b - ba + 540) % 360) - 180));
      const u0 = (ba + s * 5.6) , u1 = gc - s * (half + 0.8);
      const a = Math.min(u0, u1), b = Math.max(u0, u1);
      const width = (b - a) * D2R * R;
      if (width < 0.9) continue;
      strips.push({ b: (a + b) / 2, hw: width / 2 - 0.12 });
    }
  }
  for (const { b, hw } of strips) {
    const y0 = y + 0.95, y1 = top - 0.3, hh = (y1 - y0);
    arc(wh, b, -hw - 0.1, hw + 0.1, y + 0.0, y + 0.95, -0.05, 0.1);                 // skirting
    arc(wh, b, -hw - 0.14, hw + 0.14, y + 0.95, y + 1.05, -0.05, 0.13);             // its cap
    const pH = hh * 0.36, rH = Math.min(2 * hw, hh * 0.18);
    const panel = (ya, yb) => {
      arc(gy, b, -hw, hw, ya, yb, -0.05, 0.04);
      arc(pv, b, -hw + 0.13, hw - 0.13, ya + 0.13, yb - 0.13, -0.05, 0.07);
    };
    panel(y0 + 0.1, y0 + 0.1 + pH);
    const ry = y0 + 0.1 + pH + 0.25;
    arc(wh, b, -rH / 2 - 0.08, rH / 2 + 0.08, ry, ry + rH + 0.16, -0.05, 0.05);      // a square with a roundel
    arc(pr, b, -rH / 2, rH / 2, ry + 0.08, ry + rH + 0.08, -0.05, 0.075);
    arc(gy, b, -rH * 0.22, rH * 0.22, ry + 0.08 + rH * 0.28, ry + 0.08 + rH * 0.72, -0.05, 0.095);
    panel(ry + rH + 0.41, y1);
    arc(wh, b, -hw - 0.1, hw + 0.1, y1 + 0.0, y1 + 0.1, -0.05, 0.1);
  }
  bag.add('marble', fromTriangles(wh));
  bag.add('giallo', fromTriangles(gy));
  bag.add('pavonazzetto', fromTriangles(pv));
  bag.add('porphyry', fromTriangles(pr));
}
