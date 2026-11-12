// The rooms of Han Chang'an's houses and shops (docs/settlements/han-changan.md §6b): a hall furnished as a dwelling, a kitchen, a weaver's room, a
// scholar's, a granary or a workshop, by the household's seed. Built in a frame F (src/styles/han/kit.js Fr: u along the front, v into the room from the
// front wall) — each prop at the frame's points, turned so that it faces the front (the door's side).
import { box, lathe } from '../../core/geom.js';
import { rngOf, couch, lowTable, chest, slips, stove, loom, pounder, vat, strings, woodpile, qbox } from './props.js';

const vatq = (b, x, y, z, q, s, m) => vat(b, x, y, z, s, m);
export const KINDS = ['dwelling', 'kitchen', 'weaver', 'scholar', 'granary', 'workshop', 'dwelling', 'kitchen'];
const lampAt = (F, u, v, y, lights, lit) => {
  const p = F.pt(u, v);
  F.bag.add('bronze', lathe([[0.15, 0], [0.04, 0.1], [0.035, 0.6], [0.1, 0.66], [0.14, 0.72]], 8, null, p[0], y, p[1]));
  if (lit) lights.push({ at: [p[0], y + 0.9, p[1]], color: '#ffc98a', intensity: 3, distance: 7 });
};
/** The frame's quarter turn so that props' local −v faces the front wall (the door): the frame runs along the lot's x with v into the lot. */
const qOf = (F) => (F.V[1] > 0 ? 0 : 2);
/** Furnish a room u0..u1 × v0..v1 (the walls inside it), floor at y. */
export function furnish(F, kind, u0, u1, v0, v1, y, seed, lights, lit = false) {
  const r = rngOf(seed), bag = F.bag, q = qOf(F), at = (u, v) => F.pt(u, v), w = u1 - u0, d = v1 - v0;
  const U = (k) => u0 + w * k;
  const place = (fn, u, v, ...a) => { const p = at(u, v); fn(bag, p[0], y, p[1], q, ...a); };
  const mat = (u, v, a, b) => { const p = at(u, v), s = q & 1; void s; qbox(bag, 'reed_mat', p[0], p[1], q, -a / 2, y, -b / 2, a / 2, y + 0.03, b / 2); };
  const hang = (u, v, h, n) => { const p = at(u, v); void h; strings(bag, p[0], y + 3.0, p[1], q, n, seed + (u * 7 | 0)); };
  if (kind === 'dwelling' || kind === 'scholar') {
    place(couch, U(0.2), v1 - 0.8, 2.0, 1.1);
    if (w > 8) place(couch, U(0.8), v1 - 0.8, 1.8, 1.0);
    mat(U(0.5), v0 + d * 0.5, 2.6, 1.8); place(lowTable, U(0.5), v0 + d * 0.5 - 0.1, 1.1, 0.6);
    place(chest, U(0.06) + 0.4, v0 + 0.8);
    place(slips, U(0.94) - 0.6, v1 - 0.35, 9);
    if (kind === 'scholar') { place(slips, U(0.6), v1 - 0.35, 11); place(lowTable, U(0.4), v0 + d * 0.5 + 1.2, 1.2, 0.6, true); }
    else { place(vatq, U(0.9), v0 + 0.7, 0.9); mat(U(0.25), v0 + d * 0.45, 1.4, 1.1); }
    lampAt(F, U(0.5) + 1.2, v0 + d * 0.5, y + 0.3, lights, lit);
    hang(U(0.3), v0 + d * 0.5, 3.0, 3);
  } else if (kind === 'kitchen') {
    place(stove, U(0.82), v1 - 0.8);
    place(woodpile, U(0.62), v1 - 0.55, 1.6, 1.0);
    for (let k = 0; k < 3; k++) place(vatq, U(0.08) + 0.5, v0 + 0.9 + k * 1.0, 1.0 - k * 0.08, k === 1 ? 'terracotta' : 'pottery_dark');
    place(lowTable, U(0.45), v0 + d * 0.55, 1.4, 0.8);
    place(pounder, U(0.25), v1 - 1.5);
    mat(U(0.6), v0 + d * 0.4, 1.3, 1.0);
    lampAt(F, U(0.45) + 0.2, v0 + d * 0.55, y + 0.36, lights, lit);
    hang(U(0.5), v1 - 1.5, 3.0, 4); hang(U(0.25), v0 + d * 0.5, 3.0, 3);
  } else if (kind === 'weaver') {
    place(loom, U(0.28), v0 + d * 0.5);
    if (w > 9) place(loom, U(0.65), v0 + d * 0.5);
    place(couch, U(0.88), v1 - 0.8, 1.8, 1.0);
    for (let k = 0; k < 3; k++) { const p = at(U(0.12) + k * 0.55, v1 - 0.7); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.28], [0.22, 0.3], [0.001, 0.05]], 8, null, p[0], y, p[1])); }
    place(chest, U(0.5), v1 - 0.5);
    lampAt(F, U(0.45), v0 + d * 0.5 + 1.2, y, lights, lit);
    hang(U(0.45), v0 + d * 0.35, 3.0, 3);
  } else if (kind === 'granary') {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) place(vatq, U(0.12) + i * (w * 0.2), v1 - 0.9 - j * 1.1, 1.1 + 0.1 * ((i + j) & 1));
    for (let k = 0; k < 5; k++) { const p = at(U(0.15) + k * 0.7, v0 + 1.0 + (k & 1) * 0.5); bag.add('sacking', lathe([[0.001, 0], [0.3, 0.05], [0.34, 0.3], [0.2, 0.62], [0.001, 0.66]], 7, null, p[0], y, p[1])); }
    place(pounder, U(0.85), v0 + d * 0.5);
    hang(U(0.5), v0 + d * 0.5, 3.0, 4);
  } else {
    // a workshop: the forge (a clay hearth with its bellows and glowing coals), the anvil on a log, tools on the wall, a stack of finished goods
    const p = at(U(0.2), v1 - 0.8);
    qbox(bag, 'mud_plaster', p[0], p[1], q, -0.8, y, -0.5, 0.8, y + 0.8, 0.5);
    qbox(bag, 'flame', p[0], p[1], q, -0.5, y + 0.8, -0.3, 0.5, y + 0.84, 0.3);
    qbox(bag, 'timber', p[0], p[1], q, 0.9, y + 0.3, -0.25, 1.6, y + 0.7, 0.25);
    const a = at(U(0.5), v0 + d * 0.5);
    bag.add('timber', lathe([[0.3, 0], [0.26, 0.45]], 8, null, a[0], y, a[1]));
    qbox(bag, 'iron', a[0], a[1], q, -0.25, y + 0.45, -0.14, 0.25, y + 0.6, 0.14);
    for (let k = 0; k < 6; k++) { const t = at(U(0.7) + k * 0.2, v1 - 0.3); qbox(bag, 'iron', t[0], t[1], q, 0, y + 1.0, 0, 0.05, y + 1.8 - (k % 3) * 0.2, 0.05); }
    place(vatq, U(0.82), v0 + 0.8, 0.9, 'terracotta');
    if (lit) lights.push({ at: [p[0], y + 1.4, p[1]], color: '#ff9a4a', intensity: 2.5, distance: 6 });
  }
  void r; void box; void lowTable; void chest;
}
