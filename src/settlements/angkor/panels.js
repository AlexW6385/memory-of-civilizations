// The panels of the third gallery's bas-relief, composed densely (docs/settlements/angkor.md §28): three registers of figures
// 0.64 m apart fill the 2 m band as they fill the real walls. Each panel is a list of convex outlines in the viewer's frame
// (u from his left, 0…len; v up from the band's foot, 0…2; .t = the principal figures, carved deeper). The files are rows
// of a few poses (soldier with spear, soldier with bow, horseman, elephant, puller, apsara) repeated at a fixed step.
import { ROUND, bar, trap, stander, puller, apsara, fish, elephant, elephantParts, horseman, monkey, fanHeads, proud } from './figures.js';

const REG = [0.03, 0.67, 1.31];
const row = (x0, x1, step, fn) => { let i = 0; for (let x = x0; x <= x1 + 1e-6; x += step, i++) fn(x, i); };

/** Two armies meeting in the middle: three registers of foot, chiefs on elephants and horses in the top two, a melee where they meet. */
function battle(L, { left, right, monkeys, step = 0.31 }) {
  const o = [], mid = L / 2;
  const chiefs = [];
  for (let x = 2.4; x < L - 2; x += 4.1) if (Math.abs(x - mid) > 1.5) chiefs.push({ x, reg: chiefs.length % 2 ? 1 : 2, ele: chiefs.length % 3 === 0 });
  for (let r = 0; r < 3; r++) row(0.25 + r * 0.1, L - 0.25, step, (x, i) => {
    if (chiefs.some((c) => c.reg >= r && c.reg - r <= 1 && Math.abs(c.x - x) < (c.ele ? 0.62 : 0.5) && (c.reg === r || c.ele))) return;
    const melee = Math.abs(x - mid) < 3.2, L1 = x < mid, dir = L1 ? 1 : -1, d = melee && (i + r) % 2 ? -dir : dir;
    const head = (melee && (i + r) % 2 ? !L1 : L1) ? left : right;
    if (monkeys && (melee ? (i + r) % 2 === 0 : L1)) monkey(o, x, REG[r] + 0.02, 0.95, d);
    else stander(o, x, REG[r], 1.0, d, { head, arms: (i + r) % 5 === 4 ? 'bow' : 'spear' });
  });
  for (const c of chiefs) {
    const dir = c.x < mid ? 1 : -1, head = c.x < mid ? left : right;
    if (c.ele) proud(o, 0.075, () => elephantParts(o, c.x, REG[1] + 0.05, 0.9, dir, { parasols: 1, rider: head === 'crown' ? 'crown' : 'none' }));
    else horseman(o, c.x, REG[c.reg] + 0.02, 1.15, dir, head);
  }
  return o;
}

/** The procession: the king's audience over the court ladies' palanquins at the start, then the army in file in three registers, a chief on an elephant every 4.7 m, the king on the twelfth under fifteen parasols. */
function procession(L) {
  const o = [], kx = 10;
  // the audience (two registers): the king on his throne under parasols, ministers kneeling to the one side, attendants with parasols to the other
  o.push(trap(kx, 1.05, 0.62, 0.55, 0.2), trap(kx, 1.25, 0.5, 0.45, 0.1));
  proud(o, 0.075, () => {
    o.push(trap(kx, 1.35, 0.28, 0.24, 0.14), trap(kx, 1.49, 0.16, 0.2, 0.32), ROUND(kx, 1.9, 0.085, 0.095, 8), [[kx - 0.07, 1.95], [kx + 0.07, 1.95], [kx, 2.0]]);
    o.push(bar(kx + 0.12, 1.7, kx + 0.34, 1.55, 0.06), bar(kx - 0.12, 1.7, kx - 0.26, 1.5, 0.06));
  });
  for (let i = -3; i <= 3; i++) { if (!i) continue; const px = kx + i * 0.6; o.push(bar(px, 1.5, px, 1.92, 0.02), ROUND(px, 1.95, 0.17, 0.04, 8)); }
  for (let i = 0; i < 14; i++) { const x = kx + 1.1 + i * 0.34, j = i % 2; stander(o, x, 1.07, 0.85, -1, { head: 'crown', arms: 'pray' }); stander(o, x + 0.1, 1.45 + 0 * j, 0.55, -1, { head: 'crown', arms: 'pray' }); }
  for (let i = 0; i < 12; i++) stander(o, kx - 1.1 - i * 0.4, 1.07, 0.95, 1, { head: 'bun', arms: i % 2 ? 'parasol' : 'pray' });
  for (let i = 0; i < 12; i++) stander(o, kx - 1.1 - i * 0.4 - 0.1, 1.5, 0.7, 1, { head: 'bun', arms: 'pray' });
  // the court ladies below in palanquins on poles, foot soldiers between
  for (let i = 0; i < 6; i++) {
    const x = 0.4 + i * 3.6;
    o.push(bar(x, 0.6, x + 2.2, 0.6, 0.05), trap(x + 1.1, 0.46, 0.4, 0.34, 0.16), trap(x + 1.1, 0.62, 0.1, 0.13, 0.2), ROUND(x + 1.1, 0.92, 0.065, 0.07, 7));
    for (const d of [0.2, 2.0]) stander(o, x + d, 0.03, 0.95, 1, { head: 'bun', arms: 'pray' });
    row(x + 2.55, x + 3.45, 0.3, (xx) => stander(o, xx, REG[0], 1.0, 1, { head: 'crown' }));
  }
  const x0 = kx + 7.5, W = 4.7;
  const eles = [];
  for (let i = 0, x = x0; x + W <= L; i++, x += W) eles.push({ x: x + 0.7, king: i === 11 });
  for (let r = 0; r < 3; r++) row(x0, L - 0.3, 0.32, (x, i) => {
    if (eles.some((e) => Math.abs(x - e.x) < (e.king ? 1.3 : 0.9) && (r < 2 || e.king))) return;
    if (r === 1 && i % 7 === 3) { stander(o, x, REG[r], 1.0, 1, { head: 'crown', arms: 'parasol' }); return; }
    if (r === 2 && i % 5 === 2) { o.push(bar(x, 1.75, x, 1.96, 0.016), ROUND(x, 1.97, 0.12, 0.025, 8)); return; }
    stander(o, x, REG[r], 1.0, 1, { head: 'crown', arms: i % 4 === 1 ? 'parasol' : 'spear' });
  });
  for (const e of eles) {
    if (e.king) proud(o, 0.075, () => elephantParts(o, e.x, 0.05, 1.2, 1, { parasols: 15 }));
    else proud(o, 0.075, () => elephantParts(o, e.x, 0.05, 1.0, 1, { parasols: 3 }));
  }
  return o;
}

/** The churning: asuras (left, helmets) and devas (right, crowns) pull the serpent in a rope at mid-height, in two staggered ranks; Mandara, Kurma, Vishnu in the middle; apsaras above, fish and crocodiles below. */
function churning(L) {
  const o = [], mid = L / 2, vr = 1.08, vb = 0.45;
  const step = 0.52, solids = [];
  // the pullers are modelled (sculpt.js: rounded bodies, each its own head), set out here, carved in relief.js
  let i = 0;
  row(1.9, L - 1.7, step, (x) => {
    if (Math.abs(x - mid) < 1.1) return;
    const left = x < mid;
    solids.push({ kind: left ? 'asura' : 'deva', x, v: vb, d: left ? 1 : -1, vr: vr - vb, i: i++, k: 1.15 });
  });
  o.solids = solids;
  // the serpent: a thick scaled rope (modelled), the head at the left under five hoods (modelled), the tail at the right
  o.ropes = [[0.9, mid - 0.4, vr, 0.085], [mid + 0.4, L - 0.5, vr, 0.07]];
  o.hood = { u: 0.5, v: vr + 0.3, s: 0.4, heads: 5 };
  proud(o, 0.08, () => { stander(o, 1.15, 0.4, 1.7, 1, { head: 'helmet', arms: 'pray' }); fanHeads(o, 1.15, 1.5, 1.3, 5); monkey(o, L - 1.0, 0.45, 1.8, -1); });
  // Mandara, the serpent wound round it, the turtle, Vishnu, Indra
  o.push(trap(mid, 0.55, 0.2, 0.14, 1.4));
  for (const dv of [0.1, 0.38, 0.66, 0.94]) o.push(bar(mid - 0.34, 0.52 + dv, mid + 0.34, 0.66 + dv, 0.09));
  o.push(ROUND(mid, 0.4, 0.7, 0.17, 12), ROUND(mid + 0.72, 0.43, 0.1, 0.07, 7), ROUND(mid - 0.72, 0.35, 0.05, 0.04, 6));
  proud(o, 0.1, () => {
    o.push(trap(mid + 0.55, 0.55, 0.14, 0.11, 0.3), trap(mid + 0.55, 0.85, 0.11, 0.16, 0.32), ROUND(mid + 0.55, 1.26, 0.09, 0.1, 8), [[mid + 0.49, 1.32], [mid + 0.61, 1.32], [mid + 0.55, 1.6]]);
    for (const [a, b] of [[0.15, 0.4], [-0.15, -0.4], [0.16, 0.3], [-0.16, -0.3]]) o.push(bar(mid + 0.55 + a, 1.08, mid + 0.55 + b, a > 0 && b > 0.35 ? 1.3 : 1.04, 0.05));
    o.push(ROUND(mid + 0.88, 1.32, 0.07, 0.07, 7), ROUND(mid + 0.22, 1.32, 0.06, 0.08, 7));
    apsara(o, mid, 1.78, 1.5, 1);
  });
  // apsaras flying both ways over the rope, in two ranks; the creatures of the sea below
  row(1.2, L - 1.0, 0.62, (x, i) => { if (Math.abs(x - mid) > 0.9) apsara(o, x, 1.68, 0.95, i % 2 ? -1 : 1); });
  row(1.5, L - 1.0, 0.62, (x, i) => { if (Math.abs(x - mid) > 0.9) apsara(o, x, 1.88, 0.62, i % 2 ? 1 : -1); });
  row(0.5, L - 0.6, 0.9, (x, i) => fish(o, x, 0.12 + (i % 2) * 0.12, 1.0, i % 3 ? 1 : -1, i % 4 === 1));
  return o;
}

export function composePanel(subject, L) {
  if (subject === 'kurukshetra') return battle(L, { left: 'crown', right: 'bun' });
  if (subject === 'gods') return battle(L, { left: 'crown', right: 'helmet', step: 0.46 });
  if (subject === 'lanka') return battle(L, { left: 'crown', right: 'helmet', monkeys: true });
  if (subject === 'procession') return procession(L);
  if (subject === 'churning') return churning(L);
  return null;
}
