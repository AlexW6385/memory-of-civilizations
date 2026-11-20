// Amsterdam about 1670: the canal rings, the Dam and its Town Hall, the Westerkerk, the IJ.
import '../../styles/dutch/index.js';
import '../../styles/ming/index.js';
import { dam, canals } from './plan.js';
import music from './music.js';
import { houses, damLife, warehouses, upperWalks } from './town.js';
import { quayLife } from './quay.js';
import { damDress } from './dam-dress.js';
import { shopElements, hallWalks } from './shops.js';
import { nightPlan } from './nightlight.js';
export { music };
export const landmarks = [{ plan: { ...dam, walks: [...dam.walks, ...upperWalks(), ...hallWalks()] }, music }];
export async function town() {
  const hs = await houses();
  // the shop fronts stand in the plans of the houses they belong to (fine pieces merge with the houses': no draws of their own)
  for (const el of shopElements()) { const p = hs.find((q) => q.elements.some((e) => e.rect && e.rect[0] === el.rect[0] && e.rect[1] === el.rect[1])); if (p) p.elements.push(el); }
  // the keepers are figures of the hall-people plan (the street life's, near the visitor), not of the houses' plans: their skin and cloth merge there
  const dl = damLife(), hp = dl.find((q) => q.id === 'amsterdam-hall-people');
  if (hp) hp.elements.push(...shopElements().filter((e) => e.keeper).map((e) => e.keeper));
  return [canals, ...hs, ...warehouses(), ...dl, ...damDress(), ...quayLife(), nightPlan()];
}
