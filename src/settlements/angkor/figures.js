// Figures of the bas-reliefs (outlines in a panel's frame: u along it, v up; convex), after the khmer style's own (src/styles/khmer/reliefs.js, read-only) and exported for the denser panels of relief.js. A part's .t marks a principal figure.

export const ROUND = (cu, cv, ru, rv = ru, m = 8) => Array.from({ length: m }, (_, i) => [cu + Math.cos(i / m * Math.PI * 2) * ru, cv + Math.sin(i / m * Math.PI * 2) * rv]);
/** A bar from (ax, av) to (bx, bv), w wide: a convex quad. */
export function bar(ax, av, bx, bv, w) {
  const L = Math.hypot(bx - ax, bv - av) || 1, nx = -(bv - av) / L * w / 2, nv = (bx - ax) / L * w / 2;
  return [[ax + nx, av + nv], [bx + nx, bv + nv], [bx - nx, bv - nv], [ax - nx, av - nv]];
}
/** A trapezoid standing on (x, v): bottom half-width a, top half-width b, height h, leaning by dx at the top. */
export const trap = (x, v, a, b, h, dx = 0) => [[x - a, v], [x + a, v], [x + dx + b, v + h], [x + dx - b, v + h]];

/**
 * A standing figure at (x, v), height s·0.62, facing dir (±1): legs, the sampot, the bare chest, the
 * head and its headdress ('crown' the tall pointed mukuta of the gods and the king's men, 'helmet' the
 * round head-dress of the asuras and the rakshasas, 'bun' a chignon); with a spear and a shield (arms).
 */
export function stander(o, x, v, s, dir, { head = 'crown', arms = 'spear', lean = 0 } = {}) {
  const k = s;
  o.push(bar(x - 0.05 * k * dir, v, x - 0.02 * k * dir + lean * 0.3, v + 0.22 * k, 0.05 * k), bar(x + 0.06 * k * dir, v, x + 0.02 * k * dir + lean * 0.3, v + 0.22 * k, 0.05 * k));
  o.push(trap(x + lean * 0.3, v + 0.2 * k, 0.09 * k, 0.07 * k, 0.1 * k, lean * 0.1));                // the sampot
  o.push(trap(x + lean * 0.4, v + 0.3 * k, 0.07 * k, 0.09 * k, 0.14 * k, lean * 0.2));               // the chest
  const hx = x + lean * 0.65, hv = v + 0.49 * k;
  o.push(ROUND(hx, hv, 0.045 * k, 0.05 * k, 7));
  if (head === 'crown') o.push([[hx - 0.035 * k, hv + 0.03 * k], [hx + 0.035 * k, hv + 0.03 * k], [hx, hv + 0.13 * k]]);
  else if (head === 'helmet') o.push(ROUND(hx, hv + 0.035 * k, 0.06 * k, 0.04 * k, 7));
  else if (head === 'bun') o.push(ROUND(hx - 0.03 * k * dir, hv + 0.04 * k, 0.025 * k, 0.025 * k, 6));
  const sh = [x + lean * 0.5 + 0.03 * k * dir, v + 0.42 * k];
  if (arms === 'spear') {
    o.push(bar(sh[0], sh[1], sh[0] + 0.1 * k * dir, v + 0.34 * k, 0.03 * k));
    o.push(bar(x - 0.14 * k * dir, v + 0.04 * k, x + 0.2 * k * dir, v + 0.62 * k, 0.018 * k));       // the spear, slanting forward
    o.push(ROUND(x + 0.11 * k * dir, v + 0.3 * k, 0.065 * k, 0.07 * k, 8));                         // the shield
  } else if (arms === 'bow') {
    o.push(bar(sh[0], sh[1], sh[0] + 0.16 * k * dir, sh[1] + 0.02 * k, 0.03 * k));
    o.push(bar(sh[0] + 0.17 * k * dir, sh[1] - 0.16 * k, sh[0] + 0.2 * k * dir, sh[1] + 0.18 * k, 0.02 * k));
  } else if (arms === 'club') {
    o.push(bar(sh[0], sh[1], sh[0] + 0.08 * k * dir, sh[1] + 0.16 * k, 0.03 * k), bar(sh[0] + 0.08 * k * dir, sh[1] + 0.16 * k, sh[0] - 0.02 * k * dir, sh[1] + 0.3 * k, 0.05 * k));
  } else if (arms === 'pray') {
    o.push(bar(sh[0], sh[1], sh[0] + 0.07 * k * dir, sh[1] + 0.06 * k, 0.03 * k));
  } else if (arms === 'parasol') {
    o.push(bar(sh[0], sh[1], sh[0] + 0.05 * k * dir, sh[1] + 0.1 * k, 0.03 * k));
    o.push(bar(sh[0] + 0.05 * k * dir, sh[1] - 0.05 * k, sh[0] + 0.05 * k * dir, sh[1] + 0.42 * k, 0.015 * k));
    o.push(ROUND(sh[0] + 0.05 * k * dir, sh[1] + 0.43 * k, 0.13 * k, 0.035 * k, 8));
  }
}
/** A man pulling on a rope at height vr, leaning back away from dir (he faces dir), feet braced. */
export function puller(o, x, v, s, dir, vr, head) {
  const k = s, hip = [x - 0.04 * k * dir, v + 0.24 * k], sh = [x - 0.16 * k * dir, v + 0.42 * k];
  o.push(bar(x + 0.08 * k * dir, v, hip[0], hip[1], 0.055 * k), bar(x - 0.14 * k * dir, v, hip[0], hip[1], 0.055 * k));   // the legs braced
  o.push(bar(hip[0], hip[1], sh[0], sh[1], 0.13 * k));                                                             // the body leaning back
  o.push(ROUND(sh[0] - 0.02 * k * dir, sh[1] + 0.08 * k, 0.045 * k, 0.05 * k, 7));
  if (head === 'crown') o.push([[sh[0] - 0.06 * k * dir, sh[1] + 0.1 * k], [sh[0] + 0.01 * k * dir, sh[1] + 0.11 * k], [sh[0] - 0.05 * k * dir, sh[1] + 0.22 * k]]);
  else o.push(ROUND(sh[0] - 0.02 * k * dir, sh[1] + 0.12 * k, 0.06 * k, 0.04 * k, 7));
  o.push(bar(sh[0], sh[1] - 0.02 * k, x + 0.1 * k * dir, vr, 0.035 * k));                                          // the arms out to the rope
}
/** An apsara flying at (x, v) toward dir: the body tilted forward, the legs bent up behind, the arms raised, the crown. */
export function apsara(o, x, v, s, dir) {
  const k = s;
  o.push(bar(x - 0.1 * k * dir, v - 0.02 * k, x + 0.06 * k * dir, v + 0.1 * k, 0.08 * k));                         // the body
  o.push(bar(x - 0.1 * k * dir, v - 0.02 * k, x - 0.24 * k * dir, v + 0.02 * k, 0.05 * k), bar(x - 0.24 * k * dir, v + 0.02 * k, x - 0.2 * k * dir, v + 0.14 * k, 0.04 * k));   // the leg bent up
  o.push(bar(x - 0.1 * k * dir, v - 0.04 * k, x - 0.18 * k * dir, v - 0.1 * k, 0.04 * k));
  o.push(ROUND(x + 0.11 * k * dir, v + 0.15 * k, 0.04 * k, 0.045 * k, 7), [[x + 0.08 * k * dir, v + 0.18 * k], [x + 0.14 * k * dir, v + 0.18 * k], [x + 0.11 * k * dir, v + 0.29 * k]]);
  o.push(bar(x + 0.06 * k * dir, v + 0.1 * k, x + 0.16 * k * dir, v + 0.24 * k, 0.025 * k), bar(x + 0.03 * k * dir, v + 0.08 * k, x - 0.04 * k * dir, v + 0.24 * k, 0.025 * k));
  o.push(bar(x - 0.14 * k * dir, v - 0.04 * k, x - 0.32 * k * dir, v - 0.1 * k, 0.02 * k));                         // a floating scarf
}
/** A fish at (x, v) toward dir, length s·0.3; a crocodile (croc) longer, its snout and legs. */
export function fish(o, x, v, s, dir, croc = false) {
  const k = s;
  if (croc) {
    o.push(ROUND(x, v, 0.2 * k, 0.045 * k, 8), bar(x + 0.18 * k * dir, v, x + 0.34 * k * dir, v - 0.01 * k, 0.04 * k), bar(x - 0.18 * k * dir, v, x - 0.38 * k * dir, v + 0.03 * k, 0.03 * k));
    for (const d of [-0.1, 0.1]) o.push(bar(x + d * k, v - 0.02 * k, x + (d + 0.03 * dir) * k, v - 0.08 * k, 0.025 * k));
  } else o.push(ROUND(x, v, 0.12 * k, 0.05 * k, 8), [[x - 0.1 * k * dir, v], [x - 0.2 * k * dir, v + 0.06 * k], [x - 0.2 * k * dir, v - 0.06 * k]]);
}
/** An elephant at (x, v) toward dir (body s·0.9 long), a rider astride the neck and one in the howdah, with parasols above (n). */
export function elephant(o, x, v, s, dir, opts = {}) { proud(o, 0.075, () => elephantParts(o, x, v, s, dir, opts)); }
export function elephantParts(o, x, v, s, dir, { parasols = 2, rider = 'crown' } = {}) {
  const k = s;
  o.push(ROUND(x, v + 0.42 * k, 0.33 * k, 0.2 * k, 10));                                                           // the body
  for (const [lx, w] of [[-0.24, 0.09], [-0.1, 0.09], [0.12, 0.09], [0.25, 0.09]]) o.push(trap(x + lx * k * dir, v, w * k / 2, w * k / 2 * 0.95, 0.32 * k));
  const hx = x + 0.34 * k * dir, hv = v + 0.5 * k;
  o.push(ROUND(hx, hv, 0.13 * k, 0.15 * k, 9));                                                                    // the head
  o.push(ROUND(hx - 0.08 * k * dir, hv + 0.01 * k, 0.07 * k, 0.11 * k, 7));                                       // the ear
  o.push(bar(hx + 0.1 * k * dir, hv - 0.03 * k, hx + 0.17 * k * dir, hv - 0.25 * k, 0.07 * k), bar(hx + 0.17 * k * dir, hv - 0.25 * k, hx + 0.12 * k * dir, hv - 0.42 * k, 0.05 * k));   // the trunk
  o.push(bar(hx + 0.08 * k * dir, hv - 0.08 * k, hx + 0.2 * k * dir, hv - 0.12 * k, 0.025 * k));                  // a tusk
  o.push(bar(x - 0.33 * k * dir, v + 0.48 * k, x - 0.38 * k * dir, v + 0.22 * k, 0.025 * k));                     // the tail
  o.push(trap(x - 0.02 * k * dir, v + 0.6 * k, 0.18 * k, 0.15 * k, 0.12 * k));                                     // the howdah
  // the mahout on the neck, the lord in the howdah
  o.push(ROUND(hx - 0.02 * k * dir, hv + 0.22 * k, 0.035 * k, 0.04 * k, 6), trap(hx - 0.02 * k * dir, hv + 0.1 * k, 0.05 * k, 0.04 * k, 0.1 * k));
  o.push(trap(x - 0.02 * k * dir, v + 0.72 * k, 0.07 * k, 0.08 * k, 0.17 * k), ROUND(x - 0.02 * k * dir, v + 0.95 * k, 0.05 * k, 0.055 * k, 7));
  if (rider === 'crown') o.push([[x - 0.06 * k * dir, v + 0.98 * k], [x + 0.02 * k * dir, v + 0.98 * k], [x - 0.02 * k * dir, v + 1.12 * k]]);
  for (let i = 0; i < parasols; i++) {
    const px = x + (i - (parasols - 1) / 2) * 0.22 * k, ph = v + 1.18 * k + (i % 2) * 0.1 * k;
    o.push(bar(px, v + 0.8 * k, px, ph, 0.015 * k), ROUND(px, ph, 0.11 * k, 0.03 * k, 8));
  }
}
/** A horse and its rider (the battle panels' chiefs), toward dir. */
export function horseman(o, x, v, s, dir, head = 'crown') {
  const k = s;
  o.push(ROUND(x, v + 0.3 * k, 0.22 * k, 0.08 * k, 8));
  for (const [a, b] of [[-0.16, -0.22], [-0.1, -0.06], [0.12, 0.2], [0.17, 0.24]]) o.push(bar(x + a * k * dir, v + 0.27 * k, x + b * k * dir, v, 0.035 * k));
  o.push(bar(x + 0.17 * k * dir, v + 0.32 * k, x + 0.3 * k * dir, v + 0.48 * k, 0.07 * k), ROUND(x + 0.33 * k * dir, v + 0.47 * k, 0.07 * k, 0.04 * k, 7));
  o.push(bar(x - 0.2 * k * dir, v + 0.32 * k, x - 0.28 * k * dir, v + 0.16 * k, 0.03 * k));
  stander(o, x - 0.02 * k * dir, v + 0.22 * k, s * 0.75, dir, { head, arms: 'spear' });
}
/** A monkey of Rama's army: crouched, leaping at dir, the long tail curled up behind. */
export function monkey(o, x, v, s, dir) {
  const k = s;
  o.push(bar(x - 0.08 * k * dir, v + 0.05 * k, x + 0.05 * k * dir, v + 0.3 * k, 0.12 * k));
  o.push(bar(x - 0.08 * k * dir, v + 0.05 * k, x - 0.02 * k * dir, v, 0.05 * k), bar(x + 0.02 * k * dir, v + 0.1 * k, x + 0.12 * k * dir, v, 0.05 * k));
  o.push(ROUND(x + 0.09 * k * dir, v + 0.36 * k, 0.05 * k, 0.05 * k, 7), bar(x + 0.11 * k * dir, v + 0.35 * k, x + 0.16 * k * dir, v + 0.33 * k, 0.04 * k));
  o.push(bar(x + 0.04 * k * dir, v + 0.26 * k, x + 0.22 * k * dir, v + 0.42 * k, 0.03 * k), bar(x + 0.02 * k * dir, v + 0.22 * k, x + 0.2 * k * dir, v + 0.16 * k, 0.03 * k));
  o.push(bar(x - 0.1 * k * dir, v + 0.06 * k, x - 0.24 * k * dir, v + 0.2 * k, 0.025 * k), bar(x - 0.24 * k * dir, v + 0.2 * k, x - 0.2 * k * dir, v + 0.36 * k, 0.025 * k));
}
/** A many-headed hood of a naga, or a crown of heads (Ravana): heads in a fan above (x, v). */
export function fanHeads(o, x, v, s, n) {
  for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.32; o.push(ROUND(x + Math.cos(a) * 0.12 * s, v + Math.sin(a) * 0.12 * s, 0.045 * s, 0.045 * s, 6)); }
}

/** Draw with fn the parts that stand out further from the band (the principal figures): thickness t. */
export function proud(o, t, fn) { const n0 = o.length; fn(); for (let i = n0; i < o.length; i++) o[i].t = t; }
