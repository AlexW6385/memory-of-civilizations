// Joseon Hanyang, c. 1888: Gyeongbokgung as rebuilt in 1865–68, the ministries, Jongno and the hanok quarters.
import '../../styles/joseon/index.js';
import palace from './plan.js';
import music from './music.js';
import { seoulWalks } from './openwalk.js';
import './streetwork.js';
import { registerNight, palaceLamps, officeGlow, lanternHalos } from './nightlight.js';
import { OFFICES } from './layout.js';
import { officePlans } from './offices.js';
import { PALACE, HISLE } from './layout.js';
// the routes into the opened places of the visitor's walk (openwalk.js, docs §19.1)
palace.walks.push(...seoulWalks());
// the hamabi before Gwanghwamun: the stone that told those on horseback to dismount
for (const s of [-1, 1]) palace.elements.push({ t: 'hamabi', at: [s * 25, PALACE[3] + 12], face: [0, 1], y: 0.03 });
// the name board of Hyangwonjeong (streetwork.js): 香遠亭, gilt on black under the upper eave, toward the bridge
palace.elements.push({ t: 'hyang_board', c: HISLE.c, y: 5.7, d: 2.9 * 0.866 + 0.07, text: '香遠亭' });
// the palace's night: silk lanterns under Gwanghwamun's vaults and the throne court's cloister, the guards' fire baskets, Geoncheonggung's electric lamps (nightlight.js)
registerNight();
{
  const { lanterns, fires } = palaceLamps();
  palace.elements.push({ t: 'seoul_lanterns', list: lanterns }, { t: 'seoul_fires', list: fires }, ...officeGlow(OFFICES));
  // the offices' lanterns (their life plan carries no halo of its own)
  palace.elements.push({ t: 'seoul_halo', list: officePlans().flatMap((p) => lanternHalos(p.elements)) });
}
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: palace, music }];
