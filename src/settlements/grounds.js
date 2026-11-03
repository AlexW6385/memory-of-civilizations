// The settlements of their own (DESIGN §9, Phase B on): each a module under src/settlements/<id>/.
// GROUNDS: their grounds (ground.js: pure, imported everywhere, the workers included).
// MODULES: their plans, towns and music (index.js: loaded when the settlement is built).

import { ground as mingSuzhou } from './ming-suzhou/ground.js';
import { ground as qingBeijing } from './qing-beijing/ground.js';
import { ground as angkor } from './angkor/ground.js';

export const GROUNDS = {
  'ming-suzhou': mingSuzhou,
  'qing-beijing': qingBeijing,
  angkor,
};

export const MODULES = {
  'ming-suzhou': () => import('./ming-suzhou/index.js'),
  'qing-beijing': () => import('./qing-beijing/index.js'),
  angkor: () => import('./angkor/index.js'),
};
