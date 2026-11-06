// Sika deer (Cervus nippon; docs/settlements/nara.md §6), as still figures: about 0.8 m at the
// shoulder; the summer coat chestnut with rows of white spots along the flanks, the white rump
// patch edged in black, the short white tail with a dark line; slender legs, large ears; the stag
// with antlers of up to four points a side, the hind without. Standing, grazing, or lying folded
// on the grass as the deer of the hills do.

import { rng, placer, assembly, tube, ball } from '../../objects/kit.js';

const sphere = (r, p, k) => { const g = ball(r, 8, 6); g.translate(0, -r, 0); g.scale(...k); g.translate(...p); return g; };

/** shika { at, y, rot, seed, sex ('stag' | 'hind'), pose ('stand' | 'graze' | 'lie') } */
export function shika(el, { bag, col }) {
  const rand = rng(el.seed || 1), sex = el.sex ?? (rand() < 0.35 ? 'stag' : 'hind'), pose = el.pose ?? ['stand', 'graze', 'lie'][Math.floor(rand() * 3)];
  const k = (sex === 'stag' ? 1.08 : 0.95) * (0.92 + rand() * 0.12), shade = 0.85 + rand() * 0.25;
  const P = assembly(`shika|${sex}|${pose}`, (a) => build(a, sex, pose));
  const put = placer(el, bag, k);
  put('hide_brown', P.coat.clone(), [shade * 1.05, shade, shade * 0.9]);
  put('hide_white', P.pale.clone(), 1);
  put('hide_black', P.dark.clone(), 0.7);
  if (P.antler) put('hide_tan', P.antler.clone(), 0.8);
  if (pose !== 'lie') { const [x, z] = el.at, y = el.y ?? 0; col.circle(x, z, 0.32 * k, y, y + 0.9 * k); }
}

function build(a, sex, pose) {
  const lie = pose === 'lie', graze = pose === 'graze', by = lie ? 0.3 : 0.6;
  // the body: deeper at the chest, the rump rounded
  a('coat', tube([[0, by + 0.04, -0.46, 0.07, 0.08], [0, by + 0.03, -0.38, 0.14, 0.16], [0, by, -0.15, 0.16, 0.19], [0, by - 0.01, 0.1, 0.16, 0.2], [0, by + 0.02, 0.3, 0.14, 0.18], [0, by + 0.06, 0.42, 0.08, 0.1]], 10));
  // the white rump patch and its black edge, the tail
  a('pale', sphere(0.11, [0, by - 0.06, -0.43], [1.1, 1.2, 0.5]));
  a('dark', tube([[-0.1, by + 0.08, -0.42, 0.012], [0, by + 0.12, -0.45, 0.012], [0.1, by + 0.08, -0.42, 0.012]], 5));
  a('pale', tube([[0, by + 0.07, -0.47, 0.03, 0.02], [0, by - 0.02, -0.52, 0.03, 0.02], [0, by - 0.08, -0.52, 0.015]], 6));
  a('dark', tube([[0, by + 0.07, -0.49, 0.008], [0, by - 0.06, -0.535, 0.006]], 4));
  // the belly paler; the spots in rows along the flanks
  a('pale', tube([[0, by - 0.14, -0.2, 0.09, 0.04], [0, by - 0.16, 0.05, 0.1, 0.045], [0, by - 0.13, 0.25, 0.08, 0.04]], 8));
  for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = 0; i < 7 - r; i++) {
    const z = -0.32 + i * 0.1 + r * 0.04, yy = by + 0.1 - r * 0.07, rr = 0.155 - r * 0.012;
    a('pale', sphere(0.014, [sx * (rr + 0.012), yy, z], [0.4, 1, 1.2]));
  }
  // the legs (folded under the body when lying), the hooves
  for (const [sx, fr] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const x = sx * 0.08, z = fr > 0 ? 0.28 : -0.32;
    if (lie) {
      if (fr > 0) { a('coat', tube([[x, by - 0.05, z, 0.04], [x * 1.4, 0.06, z + 0.05, 0.03], [x * 1.2, 0.04, z + 0.28, 0.022]], 6)); a('dark', sphere(0.022, [x * 1.2, 0.022, z + 0.3], [1, 1, 1.4])); }
      else a('coat', tube([[x, by - 0.02, z, 0.07], [sx * 0.19, 0.1, z + 0.08, 0.06], [sx * 0.17, 0.05, z + 0.3, 0.03]], 7));
      continue;
    }
    const pts = fr > 0
      ? [[x, by - 0.05, z, 0.05], [x, by - 0.25, z - 0.01, 0.032], [x, 0.24, z - 0.02, 0.02], [x, 0.04, z, 0.016]]
      : [[x, by, z, 0.07], [x, by - 0.2, z + 0.06, 0.04], [x, 0.3, z - 0.07, 0.022], [x, 0.04, z - 0.03, 0.016]];
    a('coat', tube(pts, 7));
    a('dark', tube([[x, 0.045, pts[3][2], 0.018], [x, 0.0, pts[3][2] + 0.02, 0.02, 0.016]], 6));
  }
  // the neck and the head
  const nb = [0, by + 0.08, 0.36], hd = graze ? [0, 0.16, 0.7] : lie ? [0, by + 0.42, 0.52] : [0, by + 0.42, 0.56];
  a('coat', tube([[...nb, 0.08, 0.1], [(nb[0] + hd[0]) / 2, (nb[1] + hd[1]) / 2 + (graze ? 0.06 : 0), (nb[2] + hd[2]) / 2, 0.06, 0.075], [...hd, 0.05, 0.06]], 8));
  const fwd = graze ? [0, -0.85, 0.5] : [0, -0.35, 0.94], L = 0.24, H = (t) => [hd[0] + fwd[0] * L * t, hd[1] + fwd[1] * L * t, hd[2] + fwd[2] * L * t];
  a('coat', tube([[...H(-0.15), 0.055, 0.06], [...H(0.25), 0.055, 0.06], [...H(0.75), 0.035, 0.04], [...H(1.0), 0.026, 0.03]], 8));
  a('dark', sphere(0.022, H(1.02), [1.1, 0.9, 0.8]));
  a('pale', tube([[...H(0.55).map((v, i) => v - (i === 1 ? 0.03 : 0)), 0.03, 0.015], [...H(0.95).map((v, i) => v - (i === 1 ? 0.02 : 0)), 0.02, 0.01]], 6));
  const up = graze ? [0, 0.5, 0.85] : [0, 0.94, 0.35];
  for (const sx of [-1, 1]) {
    const e = H(0.15);
    a('dark', sphere(0.012, [e[0] + sx * 0.05, e[1] + up[1] * 0.02, e[2] + up[2] * 0.02], [0.6, 1, 1]));
    // the ears, large, held out
    const eb = [sx * 0.04, e[1] + up[1] * 0.05, e[2] - 0.06 + up[2] * 0.03], et = [sx * 0.16, eb[1] + up[1] * 0.07, eb[2] - 0.04 + up[2] * 0.05];
    a('coat', tube([[...eb, 0.02, 0.012], [(eb[0] + et[0]) / 2, (eb[1] + et[1]) / 2, (eb[2] + et[2]) / 2, 0.035, 0.01], [...et, 0.004]], 6));
    // the antlers: a beam rising and sweeping back, a brow tine forward, two tines along it
    if (sex === 'stag') {
      const b0 = [sx * 0.035, e[1] + up[1] * 0.08, e[2] - 0.03 + up[2] * 0.06], U = (k, o, f) => [b0[0] + sx * o, b0[1] + up[1] * k, b0[2] + up[2] * k - f];
      a('antler', tube([[...b0, 0.018], [...U(0.14, 0.05, 0.04), 0.015], [...U(0.3, 0.1, 0.12), 0.012], [...U(0.42, 0.11, 0.2), 0.009], [...U(0.5, 0.1, 0.28), 0.004]], 5));
      a('antler', tube([[...U(0.05, 0.02, 0.0), 0.012], [...U(0.1, 0.04, -0.12), 0.004]], 5));
      a('antler', tube([[...U(0.3, 0.1, 0.12), 0.01], [...U(0.44, 0.14, 0.06), 0.004]], 5));
      a('antler', tube([[...U(0.42, 0.11, 0.2), 0.008], [...U(0.5, 0.16, 0.16), 0.003]], 5));
    }
  }
  if (!lie) return;
  void 0;
}
