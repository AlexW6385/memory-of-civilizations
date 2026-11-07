// The bas-reliefs of Angkor Wat's third gallery (docs/settlements/angkor.md §13): eight panels, two to a
// side, each told in its own composition along a band 2 m high, in low relief — as built about 1150,
// when the two panels of the north-east quadrant (the victory of Vishnu over the asuras, Krishna and
// Bana) were not yet carved (they were cut in the 16th century) and the band there is left smooth.
//
// A panel is drawn in the viewer's frame (x from the viewer's left end of the panel, 0…len; v up from
// the band's foot, 0…2) as convex outlines; the gallery's wall maps them onto its face.

const ROUND = (cu, cv, ru, rv = ru, m = 8) => Array.from({ length: m }, (_, i) => [cu + Math.cos(i / m * Math.PI * 2) * ru, cv + Math.sin(i / m * Math.PI * 2) * rv]);
/** A bar from (ax, av) to (bx, bv), w wide: a convex quad. */
function bar(ax, av, bx, bv, w) {
  const L = Math.hypot(bx - ax, bv - av) || 1, nx = -(bv - av) / L * w / 2, nv = (bx - ax) / L * w / 2;
  return [[ax + nx, av + nv], [bx + nx, bv + nv], [bx - nx, bv - nv], [ax - nx, av - nv]];
}
/** A trapezoid standing on (x, v): bottom half-width a, top half-width b, height h, leaning by dx at the top. */
const trap = (x, v, a, b, h, dx = 0) => [[x - a, v], [x + a, v], [x + dx + b, v + h], [x + dx - b, v + h]];

/**
 * A standing figure at (x, v), height s·0.62, facing dir (±1): legs, the sampot, the bare chest, the
 * head and its headdress ('crown' the tall pointed mukuta of the gods and the king's men, 'helmet' the
 * round head-dress of the asuras and the rakshasas, 'bun' a chignon); with a spear and a shield (arms).
 */
function stander(o, x, v, s, dir, { head = 'crown', arms = 'spear', lean = 0 } = {}) {
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
function puller(o, x, v, s, dir, vr, head) {
  const k = s, hip = [x - 0.04 * k * dir, v + 0.24 * k], sh = [x - 0.16 * k * dir, v + 0.42 * k];
  o.push(bar(x + 0.08 * k * dir, v, hip[0], hip[1], 0.055 * k), bar(x - 0.14 * k * dir, v, hip[0], hip[1], 0.055 * k));   // the legs braced
  o.push(bar(hip[0], hip[1], sh[0], sh[1], 0.13 * k));                                                             // the body leaning back
  o.push(ROUND(sh[0] - 0.02 * k * dir, sh[1] + 0.08 * k, 0.045 * k, 0.05 * k, 7));
  if (head === 'crown') o.push([[sh[0] - 0.06 * k * dir, sh[1] + 0.1 * k], [sh[0] + 0.01 * k * dir, sh[1] + 0.11 * k], [sh[0] - 0.05 * k * dir, sh[1] + 0.22 * k]]);
  else o.push(ROUND(sh[0] - 0.02 * k * dir, sh[1] + 0.12 * k, 0.06 * k, 0.04 * k, 7));
  o.push(bar(sh[0], sh[1] - 0.02 * k, x + 0.1 * k * dir, vr, 0.035 * k));                                          // the arms out to the rope
}
/** An apsara flying at (x, v) toward dir: the body tilted forward, the legs bent up behind, the arms raised, the crown. */
function apsara(o, x, v, s, dir) {
  const k = s;
  o.push(bar(x - 0.1 * k * dir, v - 0.02 * k, x + 0.06 * k * dir, v + 0.1 * k, 0.08 * k));                         // the body
  o.push(bar(x - 0.1 * k * dir, v - 0.02 * k, x - 0.24 * k * dir, v + 0.02 * k, 0.05 * k), bar(x - 0.24 * k * dir, v + 0.02 * k, x - 0.2 * k * dir, v + 0.14 * k, 0.04 * k));   // the leg bent up
  o.push(bar(x - 0.1 * k * dir, v - 0.04 * k, x - 0.18 * k * dir, v - 0.1 * k, 0.04 * k));
  o.push(ROUND(x + 0.11 * k * dir, v + 0.15 * k, 0.04 * k, 0.045 * k, 7), [[x + 0.08 * k * dir, v + 0.18 * k], [x + 0.14 * k * dir, v + 0.18 * k], [x + 0.11 * k * dir, v + 0.29 * k]]);
  o.push(bar(x + 0.06 * k * dir, v + 0.1 * k, x + 0.16 * k * dir, v + 0.24 * k, 0.025 * k), bar(x + 0.03 * k * dir, v + 0.08 * k, x - 0.04 * k * dir, v + 0.24 * k, 0.025 * k));
  o.push(bar(x - 0.14 * k * dir, v - 0.04 * k, x - 0.32 * k * dir, v - 0.1 * k, 0.02 * k));                         // a floating scarf
}
/** A fish at (x, v) toward dir, length s·0.3; a crocodile (croc) longer, its snout and legs. */
function fish(o, x, v, s, dir, croc = false) {
  const k = s;
  if (croc) {
    o.push(ROUND(x, v, 0.2 * k, 0.045 * k, 8), bar(x + 0.18 * k * dir, v, x + 0.34 * k * dir, v - 0.01 * k, 0.04 * k), bar(x - 0.18 * k * dir, v, x - 0.38 * k * dir, v + 0.03 * k, 0.03 * k));
    for (const d of [-0.1, 0.1]) o.push(bar(x + d * k, v - 0.02 * k, x + (d + 0.03 * dir) * k, v - 0.08 * k, 0.025 * k));
  } else o.push(ROUND(x, v, 0.12 * k, 0.05 * k, 8), [[x - 0.1 * k * dir, v], [x - 0.2 * k * dir, v + 0.06 * k], [x - 0.2 * k * dir, v - 0.06 * k]]);
}
/** An elephant at (x, v) toward dir (body s·0.9 long), a rider astride the neck and one in the howdah, with parasols above (n). */
function elephant(o, x, v, s, dir, opts = {}) { proud(o, 0.075, () => elephantParts(o, x, v, s, dir, opts)); }
function elephantParts(o, x, v, s, dir, { parasols = 2, rider = 'crown' } = {}) {
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
function horseman(o, x, v, s, dir, head = 'crown') {
  const k = s;
  o.push(ROUND(x, v + 0.3 * k, 0.22 * k, 0.08 * k, 8));
  for (const [a, b] of [[-0.16, -0.22], [-0.1, -0.06], [0.12, 0.2], [0.17, 0.24]]) o.push(bar(x + a * k * dir, v + 0.27 * k, x + b * k * dir, v, 0.035 * k));
  o.push(bar(x + 0.17 * k * dir, v + 0.32 * k, x + 0.3 * k * dir, v + 0.48 * k, 0.07 * k), ROUND(x + 0.33 * k * dir, v + 0.47 * k, 0.07 * k, 0.04 * k, 7));
  o.push(bar(x - 0.2 * k * dir, v + 0.32 * k, x - 0.28 * k * dir, v + 0.16 * k, 0.03 * k));
  stander(o, x - 0.02 * k * dir, v + 0.22 * k, s * 0.75, dir, { head, arms: 'spear' });
}
/** A monkey of Rama's army: crouched, leaping at dir, the long tail curled up behind. */
function monkey(o, x, v, s, dir) {
  const k = s;
  o.push(bar(x - 0.08 * k * dir, v + 0.05 * k, x + 0.05 * k * dir, v + 0.3 * k, 0.12 * k));
  o.push(bar(x - 0.08 * k * dir, v + 0.05 * k, x - 0.02 * k * dir, v, 0.05 * k), bar(x + 0.02 * k * dir, v + 0.1 * k, x + 0.12 * k * dir, v, 0.05 * k));
  o.push(ROUND(x + 0.09 * k * dir, v + 0.36 * k, 0.05 * k, 0.05 * k, 7), bar(x + 0.11 * k * dir, v + 0.35 * k, x + 0.16 * k * dir, v + 0.33 * k, 0.04 * k));
  o.push(bar(x + 0.04 * k * dir, v + 0.26 * k, x + 0.22 * k * dir, v + 0.42 * k, 0.03 * k), bar(x + 0.02 * k * dir, v + 0.22 * k, x + 0.2 * k * dir, v + 0.16 * k, 0.03 * k));
  o.push(bar(x - 0.1 * k * dir, v + 0.06 * k, x - 0.24 * k * dir, v + 0.2 * k, 0.025 * k), bar(x - 0.24 * k * dir, v + 0.2 * k, x - 0.2 * k * dir, v + 0.36 * k, 0.025 * k));
}
/** A many-headed hood of a naga, or a crown of heads (Ravana): heads in a fan above (x, v). */
function fanHeads(o, x, v, s, n) {
  for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.32; o.push(ROUND(x + Math.cos(a) * 0.12 * s, v + Math.sin(a) * 0.12 * s, 0.045 * s, 0.045 * s, 6)); }
}

/** Draw with fn the parts that stand out further from the band (the principal figures): thickness t. */
function proud(o, t, fn) { const n0 = o.length; fn(); for (let i = n0; i < o.length; i++) o[i].t = t; }

// ---- the panels ----------------------------------------------------------------------------------
// A panel is its unique parts (`o`: the principal figures) and repeated tiles: each tile's parts are
// drawn once (in the tile's own frame, x from its left edge) and placed at every x where it repeats,
// so that the long files of soldiers, souls and pullers cost one drawing each.

/** Two armies meeting in the middle (Kurukshetra, the gods and the asuras, Lanka): three registers of foot, chiefs on horses or elephants in the upper one; a melee where they meet. */
function battle(o, len, tile, { left = 'crown', right = 'helmet', monkeys = false, key }) {
  const mid = len / 2, W = 2.4;
  const draw = (q, dir, melee, ele, head, mk) => {
    for (let i = 0; i < 6; i++) for (const [r, vb] of [[0, 0.06], [1, 0.7]]) {
      const xx = 0.2 + i * 0.4 + r * 0.2, d = melee && (i + r) % 2 ? -dir : dir;
      if (mk) monkey(q, xx, vb, 0.95, d); else stander(q, xx, vb, 0.95, d, { head: melee && (i + r) % 2 ? (head === left ? right : left) : head, arms: (i + r) % 5 === 4 ? 'bow' : 'spear' });
    }
    if (mk && !ele) monkey(q, 1.2, 1.34, 1.3, dir);
    else if (ele) elephant(q, 1.2, 1.3, 0.62, dir, { parasols: 1, rider: head === 'crown' ? 'crown' : 'none' });
    else horseman(q, 1.2, 1.3, 1.0, dir, head);
    stander(q, 1.95, 1.34, 0.95, dir, { head }); stander(q, 0.5, 1.34, 0.95, dir, { head, arms: 'bow' });
  };
  for (let i = 0, x = (len % W) / 2; x + W <= len + 1e-6; i++, x += W) {
    const c = x + W / 2, side = c < mid ? 'L' : 'R', melee = Math.abs(c - mid) < W, ele = i % 4 === 2;
    const dir = side === 'L' ? 1 : -1, head = side === 'L' ? left : right, mk = monkeys && side === 'L';
    tile(`${key}-${side}${melee ? 'm' : ''}${ele ? 'e' : ''}`, x, (q) => draw(q, dir, melee, ele, head, mk));
  }
}
/** The procession of Suryavarman II: at its start two registers — the king seated in audience above, his court below — then one: the army in file, the chiefs on elephants under parasols, the king again on his elephant under fifteen. */
function procession(o, len, tile) {
  // the audience: the king, the largest figure, seated on a throne under parasols, his ministers kneeling before him
  const kx = 10;
  o.push(trap(kx, 1.05, 0.5, 0.45, 0.18));                                                       // the throne's base
  proud(o, 0.08, () => {
    o.push(trap(kx, 1.23, 0.24, 0.2, 0.12), trap(kx, 1.35, 0.13, 0.16, 0.28), ROUND(kx, 1.72, 0.07, 0.08, 8), [[kx - 0.06, 1.76], [kx + 0.06, 1.76], [kx, 1.98]]);
    o.push(bar(kx + 0.1, 1.55, kx + 0.28, 1.44, 0.05), bar(kx - 0.1, 1.55, kx - 0.22, 1.36, 0.05));
  });
  for (let i = 0; i < 6; i++) { const px = kx - 1.3 + i * 0.5; if (Math.abs(px - kx) < 0.35) continue; o.push(bar(px, 1.32, px, 1.86, 0.015), ROUND(px, 1.88, 0.14, 0.035, 8)); }
  for (let i = 0; i < 9; i++) { const x = kx + 0.9 + i * 0.42; o.push(trap(x, 1.05, 0.08, 0.06, 0.12), trap(x + 0.03, 1.17, 0.06, 0.07, 0.14, 0.03), ROUND(x + 0.07, 1.36, 0.04, 0.045, 7)); o.push(bar(x + 0.06, 1.27, x + 0.14, 1.3, 0.025)); }
  for (let i = 0; i < 5; i++) stander(o, kx - 1.6 - i * 0.42, 1.05, 0.9, 1, { head: 'bun', arms: 'parasol' });
  // the court ladies in palanquins below, borne on poles
  for (let i = 0; i < 4; i++) tile('pr-palanquin', 2.1 + i * 2.6, (q) => { q.push(bar(0, 0.55, 1.8, 0.55, 0.035), trap(0.9, 0.42, 0.32, 0.28, 0.12), ROUND(0.9, 0.66, 0.06, 0.07, 7)); for (const d of [0.2, 1.6]) stander(q, d, 0.05, 0.85, 1, { head: 'bun', arms: 'pray' }); });
  // then the army in file: a chief on an elephant under parasols and nine foot to each 4.7 m, banners and parasols over them
  const W = 4.7;
  for (let i = 0, x = 14; x + W <= len; i++, x += W) {
    if (i === 11) {
      // the king again, on the twelfth elephant, under fifteen parasols
      proud(o, 0.075, () => elephantParts(o, x + 0.55, 0.06, 1.25, 1, { parasols: 15 }));
      for (let j = 0; j < 7; j++) stander(o, x + 1.4 + j * 0.45, 0.06, 0.95, 1, { head: 'crown', arms: j % 3 === 1 ? 'parasol' : 'spear' });
      continue;
    }
    tile('pr-file', x, (q) => {
      elephant(q, 0.55, 0.06, 1.05, 1, { parasols: 3 });
      for (let j = 0; j < 8; j++) stander(q, 1.35 + j * 0.42, 0.06, 0.95, 1, { head: 'crown', arms: j % 4 === 1 ? 'parasol' : 'spear' });
      for (let j = 0; j < 3; j++) stander(q, 1.6 + j * 1.1, 1.1, 0.9, 1, { head: 'crown', arms: j % 2 ? 'parasol' : 'spear' });
      for (let j = 0; j < 3; j++) q.push(bar(1.3 + j * 1.35, 1.6, 1.3 + j * 1.35, 1.86, 0.014), ROUND(1.3 + j * 1.35, 1.88, 0.12, 0.03, 8));
    });
  }
}
/** The heavens and hells: three tiers — the souls walking toward Yama on his buffalo, the heavens above in their palaces borne by garudas, the hells below. */
function heavens(o, len, tile) {
  const ym = len * 0.35, W = 1.26;
  for (let x = 0.3; x + W <= len; x += W) {
    const c = x + W / 2;
    if (Math.abs(c - ym) < 1.2) continue;
    const dir = c < ym ? 1 : -1, up = c > ym + 0.6;
    tile(`hv-${dir > 0 ? 'L' : 'R'}${up ? 'u' : ''}`, x, (q) => {
      for (let j = 0; j < 3; j++) {
        const lx = 0.21 + j * 0.42;
        // the middle tier: the souls in file toward Yama
        stander(q, lx, 0.7, 0.8, dir, { head: j % 3 ? 'bun' : 'crown', arms: 'pray' });
        // the lowest: the hells — Yama's servants with clubs, the damned beaten down, thrown headlong
        if (j === 0) stander(q, lx, 0.04, 0.85, 1, { head: 'helmet', arms: 'club' });
        else if (j === 1) q.push(bar(lx, 0.42, lx + 0.02, 0.24, 0.1), bar(lx - 0.04, 0.24, lx - 0.08, 0.04, 0.045), bar(lx + 0.05, 0.24, lx + 0.1, 0.06, 0.045), ROUND(lx, 0.5, 0.045, 0.05, 7));
        else q.push(bar(lx - 0.16, 0.08, lx + 0.16, 0.12, 0.09), ROUND(lx + 0.2, 0.13, 0.045, 0.05, 7));
      }
      if (up) {
        // the heavens: a pavilion, a soul seated in it, its platform on the raised arms of two garudas
        const px = 0.63;
        q.push(bar(px - 0.5, 1.36, px + 0.5, 1.36, 0.05), bar(px - 0.42, 1.38, px - 0.42, 1.78, 0.04), bar(px + 0.42, 1.38, px + 0.42, 1.78, 0.04), [[px - 0.55, 1.78], [px + 0.55, 1.78], [px, 1.98]]);
        q.push(trap(px, 1.39, 0.12, 0.1, 0.08), trap(px, 1.47, 0.07, 0.08, 0.13), ROUND(px, 1.65, 0.045, 0.05, 7));
        for (const d of [-0.28, 0.28]) q.push(trap(px + d, 1.22, 0.07, 0.06, 0.09), ROUND(px + d, 1.31, 0.035, 0.03, 6), bar(px + d - 0.05, 1.28, px + d - 0.12, 1.34, 0.022), bar(px + d + 0.05, 1.28, px + d + 0.12, 1.34, 0.022));
      } else { stander(q, 0.3, 1.3, 0.9, 1, { head: 'crown', arms: 'parasol' }); stander(q, 0.84, 1.3, 0.9, 1, { head: 'crown' }); }
    });
  }
  // Yama, judge of the dead, on his buffalo, his many arms holding staves
  proud(o, 0.08, () => {
    o.push(ROUND(ym, 0.95, 0.42, 0.2, 10), ROUND(ym + 0.44, 1.02, 0.12, 0.1, 8), bar(ym + 0.48, 1.1, ym + 0.36, 1.3, 0.04), bar(ym + 0.56, 1.1, ym + 0.72, 1.24, 0.04));
    for (const lx of [-0.3, -0.14, 0.18, 0.32]) o.push(trap(ym + lx, 0.7, 0.05, 0.045, 0.22));
    o.push(trap(ym, 1.15, 0.12, 0.1, 0.25), ROUND(ym, 1.48, 0.07, 0.08, 8), [[ym - 0.06, 1.52], [ym + 0.06, 1.52], [ym, 1.72]]);
    for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.22, r0 = 0.08, r1 = 0.34; o.push(bar(ym + Math.cos(Math.PI / 2 + a) * r0, 1.34 + Math.sin(Math.PI / 2 + a) * r0 * 0.5, ym + Math.cos(Math.PI / 2 + a * 1.4) * r1, 1.34 + Math.sin(Math.PI / 2 + a * 1.4) * r1 * 0.7, 0.025)); }
  });
}
/**
 * The churning of the ocean of milk: the serpent Vasuki's body drawn along the panel, wound round
 * Mount Mandara in the middle; the 92 asuras on the left hold its head (their chief, many-headed, at
 * the five-headed hood), the 88 devas on the right its tail (Hanuman at the end); Vishnu before the
 * mountain directing, the turtle Kurma under it, Indra above; the apsaras born of the churning flying
 * both ways along the top; the creatures of the ocean, some cut to pieces, along the foot.
 */
function churning(o, len, tile) {
  const mid = len / 2, vr = 0.98, W = 1.84;
  // the pullers, four to a tile, under the serpent's body, the apsaras over them, the ocean's creatures below
  const draw = (q, left) => {
    const dir = left ? 1 : -1;
    q.push(bar(0, vr, W, vr, 0.08));
    for (let j = 0; j < 4; j++) puller(q, 0.23 + j * 0.46, 0.5, 1.0, dir, vr, left ? 'helmet' : 'crown');
    for (let j = 0; j < 3; j++) apsara(q, 0.3 + j * 0.62, 1.62 + (j % 2) * 0.16, 0.95, -dir);
    fish(q, 0.3, 0.2, 1.0, dir); fish(q, 0.85, 0.32, 1.0, -dir, true); q.push(ROUND(1.3, 0.16, 0.05, 0.045, 6), [[1.38, 0.21], [1.5, 0.16], [1.38, 0.11]]); fish(q, 1.62, 0.26, 1.0, dir);
  };
  let endL = 1.4, startR = len - 1.25, lastR = 1.4;
  for (let x = 1.4; x + W <= len - 1.2; x += W) {
    const c = x + W / 2;
    lastR = x + W;
    if (Math.abs(c - mid) < 1.5) continue;
    if (c < mid) endL = x + W; else startR = Math.min(startR, x);
    tile(c < mid ? 'ch-asuras' : 'ch-devas', x, (q) => draw(q, c < mid));
  }
  // the serpent's head at the left end, its tail at the right; the asuras' chief at the head, Hanuman at the tail
  o.push(bar(0.4, vr, 1.45, vr, 0.11), bar(lastR - 0.05, vr, len - 0.4, vr, 0.05));
  o.push(ROUND(0.45, vr + 0.18, 0.22, 0.26, 10)); fanHeads(o, 0.45, vr + 0.3, 1.4, 5);
  proud(o, 0.08, () => { stander(o, 1.0, 0.5, 1.5, 1, { head: 'helmet', arms: 'pray' }); fanHeads(o, 1.0, 1.32, 1.1, 5); monkey(o, len - 0.9, 0.55, 1.6, -1); });
  // the serpent's body to the mountain from the nearest tiles
  o.push(bar(endL - 0.05, vr, mid - 0.3, vr, 0.08), bar(mid + 0.3, vr, startR + 0.05, vr, 0.08));
  // the mountain as a pillar, the serpent wound about it, the turtle under, Vishnu before it, Indra above
  o.push(trap(mid, 0.55, 0.16, 0.12, 1.25));
  for (const dv of [0.15, 0.4, 0.65]) o.push(bar(mid - 0.3, 0.5 + dv, mid + 0.3, 0.62 + dv, 0.07));
  o.push(ROUND(mid, 0.42, 0.55, 0.15, 12), ROUND(mid + 0.56, 0.44, 0.08, 0.06, 7));
  proud(o, 0.1, () => {
    o.push(trap(mid, 0.56, 0.12, 0.1, 0.26), trap(mid, 0.82, 0.1, 0.14, 0.28), ROUND(mid, 1.18, 0.075, 0.085, 8), [[mid - 0.06, 1.24], [mid + 0.06, 1.24], [mid, 1.44]]);
    for (const [a, b] of [[0.13, 0.32], [-0.13, -0.32], [0.14, 0.26], [-0.14, -0.26]]) o.push(bar(mid + a, 1.02, mid + b, a > 0 && b > 0.3 ? 1.22 : 0.98, 0.04));
    o.push(ROUND(mid + 0.33, 1.25, 0.06, 0.06, 7), ROUND(mid - 0.33, 1.25, 0.05, 0.07, 7));           // the discus and the conch
    apsara(o, mid, 1.72, 1.3, 1);                                                                    // Indra flying above, steadying the mountain
  });
}

/**
 * A panel `subject`, len metres long, in the viewer's frame: { unique (outlines), tiles: [{ key, parts, xs }] },
 * or null for none (the band left smooth).
 */
export function panel(subject, len) {
  const o = [], T = new Map();
  const tile = (key, x, fn) => { let e = T.get(key); if (!e) { const parts = []; fn(parts); e = { key, parts, xs: [] }; T.set(key, e); } e.xs.push(x); };
  if (subject === 'kurukshetra') battle(o, len, tile, { left: 'crown', right: 'bun', key: 'ku' });
  else if (subject === 'gods') battle(o, len, tile, { left: 'crown', right: 'helmet', key: 'go' });
  else if (subject === 'lanka') battle(o, len, tile, { left: 'crown', right: 'helmet', monkeys: true, key: 'la' });
  else if (subject === 'procession') procession(o, len, tile);
  else if (subject === 'heavens') heavens(o, len, tile);
  else if (subject === 'churning') churning(o, len, tile);
  else return null;
  return { unique: o, tiles: [...T.values()] };
}
