// The lamps of Mughal Agra (docs/settlements/mughal-agra.md §17.2): what the street life hangs and stands at night, as elements of the style `life` (instanced).
//   agra_lamp 'hang'     the brass oil lamp on its chain from the shop's beam (the front's `hang_lantern`, a Chinese paper lantern, is swapped for it in the
//                        Taj Ganj's fronts: see `dressFronts`)
//   agra_lamp 'stand'    the mashal: an iron stand with a cage at its head holding a torch of oil-soaked rag, at the gates (fire at night)
//   agra_lamp 'brazier'  a brass pan of coals on three feet, in the katras' courts
// The fire of each is a glow material (lamp_white: the torch's rag and the lamp's flame; lamp_paper: the coals), lit from within at night, a pale shape by day.
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { assembly, placer } from '../../objects/kit.js';
import './nightlight.js';

const U = {};
const unit = (name, build) => { U[name] = assembly(`agra-lamp|${name}`, build); };
// the hanging lamp: the hook at the origin, a chain, a ring, a bowl with a lip for the wick and the flame in it (0.75 m from hook to flame's tip)
unit('hang', (a) => {
  a('i', rod([0, 0, 0], [0, -0.42, 0], 0.006, 3));
  a('b', lathe([[0.001, -0.42], [0.04, -0.42], [0.03, -0.45], [0.001, -0.45]], 8));
  a('b', lathe([[0.001, -0.5], [0.07, -0.5], [0.12, -0.46], [0.125, -0.44], [0.11, -0.45], [0.07, -0.485], [0.001, -0.485]], 10));
  a('b', lathe([[0.12, -0.46], [0.19, -0.455], [0.17, -0.462], [0.12, -0.472]], 10, null, 0, 0, 0));
  a('l', lathe([[0.012, -0.465], [0.018, -0.44], [0.01, -0.395], [0.001, -0.37]], 6, null, 0.16, 0, 0));
});
unit('stand', (a) => {
  a('i', lathe([[0.001, 0], [0.2, 0], [0.18, 0.05], [0.04, 0.12], [0.03, 0.3], [0.001, 0.3]], 8));
  a('i', rod([0, 0.1, 0], [0, 1.95, 0], 0.025, 5));
  for (let k = 0; k < 4; k++) { const t = k * Math.PI / 2 + 0.4, c = Math.cos(t), s = Math.sin(t); a('i', rod([0, 1.9, 0], [c * 0.2, 2.2, s * 0.2], 0.012, 3)); }
  a('i', lathe([[0.001, 1.9], [0.12, 1.9], [0.12, 1.93], [0.001, 1.93]], 8));
  a('l', lathe([[0.001, 1.93], [0.1, 1.98], [0.14, 2.08], [0.1, 2.2], [0.04, 2.3], [0.001, 2.34]], 8));
});
unit('brazier', (a) => {
  a('b', lathe([[0.001, 0.12], [0.18, 0.12], [0.26, 0.22], [0.29, 0.25], [0.29, 0.27], [0.25, 0.25], [0.18, 0.15], [0.001, 0.15]], 14));
  for (let i = 0; i < 3; i++) { const t = i / 3 * Math.PI * 2; a('b', rod([Math.cos(t) * 0.14, 0.13, Math.sin(t) * 0.14], [Math.cos(t) * 0.22, 0, Math.sin(t) * 0.22], 0.014, 4)); }
  a('c', lathe([[0.001, 0.25], [0.22, 0.26], [0.18, 0.31], [0.001, 0.33]], 10));
});
// the chirag: a small clay oil lamp, a shallow bowl pinched at one lip for the wick, the flame in it (0.09 m across)
unit('chirag', (a) => {
  a('c', lathe([[0.001, 0], [0.03, 0], [0.045, 0.018], [0.05, 0.03], [0.04, 0.032], [0.03, 0.02], [0.001, 0.014]], 10));
  a('c', lathe([[0.01, 0.022], [0.03, 0.03], [0.02, 0.034], [0.01, 0.03]], 6, null, 0.055, 0, 0));
  a('l', lathe([[0.006, 0.03], [0.009, 0.045], [0.005, 0.07], [0.001, 0.085]], 6, null, 0.055, 0, 0));
});
const MAT = { chirag: { c: 'terracotta', l: 'lamp_white' }, hang: { i: 'iron', b: 'bronze', l: 'lamp_white' }, stand: { i: 'iron', l: 'lamp_white' }, brazier: { b: 'bronze', c: 'lamp_paper' } };
/** agra_lamp: { at, y, rot, kind ('hang' | 'stand' | 'brazier') }; for 'hang' y is the hook. */
function agraLamp(el, { bag, col }) {
  const put = placer(el, bag);
  for (const [role, g] of Object.entries(U[el.kind])) put(MAT[el.kind][role], g.clone());
  if (col && el.kind === 'stand') col.circle(el.at[0], el.at[1], 0.2, el.y ?? 0, (el.y ?? 0) + 2.3);
}

/**
 * The Taj Ganj's fronts with the shops' hanging lamp of brass: `mughal_front` (styles/mughal/fronts.js) hangs a `hang_lantern` of white paper from
 * every shop's beam; for the length of that call the element is the brass lamp (the swap is synchronous and undone).
 */
function dressFronts() {
  const E = STYLES.life.elements, base = E.mughal_front;
  if (!base || base.__agra) return;
  const f = (el, ctx) => {
    const orig = E.hang_lantern;
    E.hang_lantern = (o, c) => E.agra_lamp({ ...o, t: 'agra_lamp', kind: 'hang' }, c);
    try { base(el, ctx); } finally { E.hang_lantern = orig; }
  };
  f.__agra = true;
  E.mughal_front = f;
}
STYLES.life.elements.agra_lamp = agraLamp;
dressFronts();
export { agraLamp, dressFronts };
