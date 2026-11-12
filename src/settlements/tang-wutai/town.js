// The village in the valley (docs/settlements/tang-wutai.md §5): yards, houses of the region, the green, the yards' goods.
import { RADIUS } from './layout.js';
import { village } from './village.js';
import { fields } from './fields.js';
import { dress } from './dress.js';
import './style.js';
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-80, 0], facing: 'e' } });
export async function houses() {
  const v = village(), plans = [], N = 90;
  for (let i = 0; i < v.chinese.length; i += N) plans.push(base(`tang-wutai-yards-${i / N}`, 'wutai-site', v.chinese.slice(i, i + N)));
  const f = fields(), d = dress();
  plans.push(base('tang-wutai-yardlife', 'life', [...v.life, ...f.life, ...d.life]));
  for (let i = 0; i < f.chinese.length; i += 40) plans.push(base(`tang-wutai-fields-${i / 40}`, 'wutai-site', f.chinese.slice(i, i + 40)));
  plans.push(base('tang-wutai-dress', 'wutai-site', d.chinese));
  return plans;
}
