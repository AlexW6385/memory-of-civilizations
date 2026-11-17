// The Athena Parthenos redrawn with the figure kit (docs/buildings/parthenon.md §8, docs/settlements/athens.md §4g):
// the goddess of gold and ivory about 10.6 m to the crown of her hair, on a pedestal 8.043 × 4.096 m carrying the birth of
// Pandora in gilt relief. She stands in the peplos with the long overfold, a belt, the scaly aegis with the gorgoneion and
// its fringe of snakes, the Attic helmet with its three crests (a sphinx between two winged horses); on her right hand,
// over a column, a Nike with a wreath; her left hand on the rim of the shield that stands at her side, the Amazonomachy in
// gilt relief round the gorgon's head, the serpent coiled within it; the spear against her left shoulder. Registered as the
// object `athena_parthenos_rich` of the greek style. Local: facing +z, pedestal centred at the origin.
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/greek/index.js';
import { relief } from '../../styles/greek/sculpture.js';
import { merge } from '../../styles/greek/columns.js';
import { peplosFigure, placeFigure, loft, limb, blob } from './figures.js';

const UP = new Vector3(0, 1, 0);
const row = (y, cx, cz, rx, rz = rx) => ({ y, cx, cz, rx, rz });

/** A Nike, 1.9 m, winged, holding a wreath out in her right hand (the pieces at the origin, facing +z). */
function nike(h) {
  const fig = peplosFigure({ weight: 'l', hair: 'bun', n: 10, folds: 12, arms: { r: [[-0.15, 0.66, 0.05], [-0.1, 0.72, 0.2]], l: [[0.14, 0.6, 0.02], [0.13, 0.5, 0.09]] } });
  const feathers = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 8; k++) {
      const a = 0.25 + k * 0.17, L = 0.36 - k * 0.02;
      feathers.push(limb([s * 0.07, 0.72, -0.06], [s * (0.07 + Math.sin(a) * L), 0.72 + Math.cos(a) * L * 0.95 + 0.06, -0.1 - k * 0.006], 0.026, 0.012, 4));
    }
    feathers.push(blob([s * 0.11, 0.74, -0.07], 0.045, [1, 1.4, 0.55], 6));
  }
  fig.cloth.push(...feathers);
  // the wreath: leaves on a ring, held in the right hand
  const hand = [-0.1, 0.72, 0.2];
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    fig.trim.push(blob([hand[0] + Math.cos(a) * 0.09, hand[1] + 0.06 + Math.sin(a) * 0.09, hand[2] + 0.02], 0.022, [1.3, 0.5, 0.8], 4));
  }
  return fig;
}

/** The scaly aegis: a cape over the breast and shoulders, a fringe of snakes at its lower edge. */
function aegis(F, H) {
  const gold = [], ivory = [];
  gold.push(loft([row(0.805, 0, 0, 0.115, 0.07), row(0.78, 0, 0.004, 0.136, 0.07), row(0.735, 0, 0.012, 0.126, 0.084), row(0.69, 0, 0.018, 0.12, 0.09), row(0.665, 0, 0.02, 0.116, 0.092)], 72,
    (th, y) => 1.0 + 0.016 * (Math.cos(34 * th + 60 * y) + Math.cos(34 * th - 60 * y)) * 0.5, 2));
  for (let k = 0; k < 28; k++) {                                         // the snakes of the fringe
    const th = Math.PI * (0.05 + 1.9 * k / 28), x = Math.cos(th) * 0.12, z = Math.sin(th) * 0.09 + 0.02;
    if (Math.sin(th) < -0.1) continue;
    gold.push(limb([x, 0.668, z], [x * 1.06 + Math.cos(k) * 0.008, 0.635 - (k % 3) * 0.008, z * 1.05], 0.0065, 0.004, 4));
  }
  // the gorgoneion in ivory: a face with a wide mouth, the snake hair about it
  const c = [0, 0.73, 0.108];
  ivory.push(blob(c, 0.036, [1, 1.05, 0.5], 10));
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; gold.push(limb([c[0] + Math.cos(a) * 0.03, c[1] + Math.sin(a) * 0.03, c[2]], [c[0] + Math.cos(a) * 0.062, c[1] + Math.sin(a) * 0.062, c[2] + 0.004], 0.008, 0.005, 4)); }
  return { gold, ivory };
}

function athenaParthenosRich(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const PW = 8.043, PD = 4.096, PH = el.pedestal ?? 1.2, H = 10.6, F = PH;
  const gold = [], ivory = [], stone = [], dark = [], eye = [], bronze = [];
  // ── the pedestal: a plinth, a moulded base, the die with its crown moulding; the birth of Pandora across the front
  stone.push(box(-PW / 2 - 0.1, 0, -PD / 2 - 0.1, PW / 2 + 0.1, 0.16, PD / 2 + 0.1));
  stone.push(box(-PW / 2, 0.16, -PD / 2, PW / 2, 0.3, PD / 2));
  stone.push(box(-PW / 2 + 0.1, 0.3, -PD / 2 + 0.1, PW / 2 - 0.1, PH - 0.2, PD / 2 - 0.1));
  stone.push(box(-PW / 2 + 0.03, PH - 0.2, -PD / 2 + 0.03, PW / 2 - 0.03, PH - 0.1, PD / 2 - 0.03));
  stone.push(box(-PW / 2 - 0.03, PH - 0.1, -PD / 2 - 0.03, PW / 2 + 0.03, PH, PD / 2 + 0.03));
  dark.push(box(-PW / 2 + 0.12, 0.32, PD / 2 - 0.12, PW / 2 - 0.12, PH - 0.22, PD / 2 - 0.1));         // the ground of the frieze (dark blue)
  for (let i = 0; i < 20; i++) {
    const kind = i === 10 ? 'maiden' : ['walker', 'maiden', 'god', 'maiden'][i % 4];
    gold.push(relief(kind, i, { p: [-PW / 2 + 0.45 + i * (PW - 0.9) / 19, 0.34, PD / 2 - 0.1 + 0.002], u: [1, 0, 0], o: [0, 0, 1], s: 0.6, d: 0.045, flip: i > 10 }));
  }
  // ── the goddess
  const fig = peplosFigure({ weight: 'r', hair: 'long', helmet: true, n: 18, folds: 18,
    arms: { r: [[-0.152, 0.63, 0.06], [-0.17, 0.6, 0.215]], l: [[0.15, 0.625, 0.025], [0.2, 0.495, 0.09]] } });
  const g = aegis(F, H);
  const body = placeFigure(fig, H, 0, F, 0);
  const put = (list, geom) => { if (geom) list.push(geom); };
  put(gold, body.cloth); put(ivory, body.skin); put(gold, body.hair); put(gold, body.trim); put(eye, body.dark); put(gold, body.metal);
  const ag = placeFigure({ gold: g.gold, ivory: g.ivory }, H, 0, F, 0);
  put(gold, ag.gold); put(ivory, ag.ivory);
  // the helmet's three crests: a sphinx between two winged horses (the horses as profile blobs on arcs)
  const hy = F + 0.918 * H, hz = 0.012 * H;
  for (const [cx, hh] of [[0, 1.0], [-0.34, 0.65], [0.34, 0.65]]) {
    gold.push(limb([cx, hy + 0.62, hz - 0.9], [cx, hy + 0.62 + hh * 0.5, hz + 0.2], 0.06, 0.08, 6));            // the ridge's rise
    gold.push(blob([cx, hy + 0.7 + hh * 0.75, hz - 0.15], 0.28 * hh + 0.1, [0.5, 0.75, 1.5], 8));            // the body of the crest animal
    gold.push(limb([cx, hy + 0.7 + hh * 0.9, hz + 0.2], [cx, hy + 1.05 + hh * 0.95, hz + 0.5], 0.09 * hh + 0.03, 0.05, 5), blob([cx, hy + 1.1 + hh * 0.95, hz + 0.58], 0.09 * hh + 0.05, [0.6, 0.8, 1.2], 6));
    gold.push(limb([cx, hy + 0.85 + hh * 0.7, hz - 0.5], [cx, hy + 0.7 + hh * 0.2, hz - 1.15], 0.05, 0.015, 4));    // the tail
    gold.push(limb([cx, hy + 0.9 + hh * 0.7, hz - 0.15], [cx + (cx >= 0 ? 0.28 : -0.28), hy + 1.45 + hh * 0.6, hz - 0.45], 0.07 * hh + 0.02, 0.02, 5));   // the wing
  }
  // ── the Nike on her right hand, and the column under it
  const hand = [-0.17 * H, F + 0.6 * H, 0.215 * H];
  const nk = placeFigure(nike(1.9), 1.9, hand[0] - 0.05, hand[1] + 0.06, hand[2] + 0.15);
  put(gold, nk.cloth); put(ivory, nk.skin); put(gold, nk.hair); put(gold, nk.trim); put(eye, nk.dark);
  stone.push(lathe([[0.34, 0], [0.34, 0.22], [0.27, 0.28], [0.25, 0.5], [0.255, hand[1] - F - 0.4], [0.33, hand[1] - F - 0.2], [0.35, hand[1] - F - 0.1], [0.001, hand[1] - F - 0.1]], 24, (th, i) => (i >= 3 && i <= 4 ? 1 + 0.03 * Math.cos(th * 16) : 1), hand[0], F, hand[2]));
  // ── the shield: leaning at her left, her hand on its rim; the outer face turned forward, the Amazonomachy in relief about the gorgon's head
  const R = 2.4, n = new Vector3(0.34, 0.2, 0.92).normalize();
  const topDir = UP.clone().sub(n.clone().multiplyScalar(n.y)).normalize();             // the shield's highest rim point, from its centre
  const handL = new Vector3(0.2 * H, F + 0.495 * H - 0.08, 0.09 * H);                    // her left hand, resting on the rim
  const centre = handL.clone().sub(topDir.clone().multiplyScalar(R * 0.995));
  const place = new Matrix4().compose(centre, new Quaternion().setFromUnitVectors(UP, n), new Vector3(1, 1, 1));
  const shield = [], shieldRim = [], shieldRel = [], shieldBoss = [];
  shield.push(lathe([[0.001, 0.2], [0.3, 0.19], [0.65, 0.14], [R * 0.45, 0.1], [R * 0.52, 0.06], [R * 0.9, 0.03], [R * 0.99, 0.0], [R * 0.99, -0.1], [R * 0.85, -0.06], [0.001, 0.0]], 64));
  shieldRim.push(lathe([[R * 0.9, 0.03], [R * 0.99, 0.0], [R, 0.0], [R, 0.08], [R * 0.985, 0.13], [R * 0.9, 0.09]], 64));
  shieldRim.push(lathe([[R * 0.5, 0.082], [R * 0.52, 0.12], [R * 0.54, 0.12], [R * 0.56, 0.082]], 48));
  for (let k = 0; k < 11; k++) {                                            // the fighters round the field
    const a = (k / 11) * Math.PI * 2, kind = k % 3 === 0 ? 'centaurR' : k % 2 ? 'foe' : 'fighter';
    const r = relief(kind, k, { p: [0, 0, 0], u: [1, 0, 0], o: [0, 0, 1], s: 0.78, d: 0.12 });
    // into the shield's frame (its axis y): the relief's depth up the axis, its height outward along −z, then round the ring
    r.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2).premultiply(new Matrix4().makeTranslation(0, 0.05, -1.3)).premultiply(new Matrix4().makeRotationY(a)));
    shieldRel.push(r);
  }
  // the gorgon's head as the boss: a face, the staring eyes, the snakes
  shieldBoss.push(blob([0, 0.3, 0], 0.42, [1, 0.42, 1], 12));
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; shieldBoss.push(limb([Math.cos(a) * 0.36, 0.3, Math.sin(a) * 0.36], [Math.cos(a) * 0.62, 0.32 + 0.03 * (k % 2), Math.sin(a) * 0.62], 0.05, 0.025, 4)); }
  for (const s of [-1, 1]) eye.push(blob([s * 0.14, 0.52, 0.12], 0.06, [1, 0.6, 1], 6));
  const placeAll = (list) => list.map((q) => q.applyMatrix4(place));
  gold.push(...placeAll(shieldRim), ...placeAll(shieldRel));
  bronze.push(...placeAll(shield));
  ivory.push(...placeAll(shieldBoss));
  // the serpent coiled inside the shield beside her: a spiral of rods behind the shield's lower edge
  for (let k = 0; k < 28; k++) {
    const a = k * 0.45, r = 0.45 + k * 0.022;
    const p = (a2, r2, kk) => new Vector3(Math.cos(a2) * r2 * 0.9, -0.22 - kk * 0.002, Math.sin(a2) * r2).applyMatrix4(place);
    const A = p(a, r, k), B = p(a + 0.45, r + 0.022, k + 1);
    gold.push(rod([A.x, A.y - 0.5, A.z], [B.x, B.y - 0.5, B.z], 0.1, 6));
  }
  // the spear against her left shoulder, its head above her helmet
  gold.push(rod([0.27 * H, F, -0.18], [0.145 * H, F + 1.18 * H, -0.12], 0.07, 8), limb([0.145 * H, F + 1.18 * H, -0.12], [0.143 * H, F + 1.26 * H, -0.12], 0.1, 0.01, 6));
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (const [list, mat] of [[gold, 'gold'], [ivory, 'ivory'], [bronze, 'bronze'], [dark, 'egyptian_blue'], [eye, 'egyptian_blue'], [stone, el.pedestalMat || 'marble_dark']]) {
    if (!list.length) continue;
    const gg = merge(list);
    gg.applyMatrix4(m);
    bag.add(mat, gg);
  }
  const q = Math.round(yaw / (Math.PI / 2)) % 2 !== 0;
  const hw = (q ? PD : PW) / 2 + 0.1, hd = (q ? PW : PD) / 2 + 0.1;
  col.rect([x - hw, z - hd, x + hw, z + hd], y, y + PH + 10);
}

STYLES.greek.objects.athena_parthenos_rich = athenaParthenosRich;
export default athenaParthenosRich;
