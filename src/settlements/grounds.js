// The settlements of their own (DESIGN §9, Phase B on): each a module under src/settlements/<id>/.
// GROUNDS: their grounds (ground.js: pure, imported everywhere, the workers included).
// MODULES: their plans, towns and music (index.js: loaded when the settlement is built).

import { ground as mingSuzhou } from './ming-suzhou/ground.js';
import { ground as qingBeijing } from './qing-beijing/ground.js';
import { ground as angkor } from './angkor/ground.js';
import { ground as chichenItza } from './chichen-itza/ground.js';
import { ground as giza } from './giza/ground.js';
import { ground as djenne } from './djenne/ground.js';
import { ground as machuPicchu } from './machu-picchu/ground.js';
import { ground as mughalAgra } from './mughal-agra/ground.js';
import { ground as isfahan } from './isfahan/ground.js';
import { ground as edoHimeji } from './edo-himeji/ground.js';
import { ground as songHangzhou } from './song-hangzhou/ground.js';
import { ground as borobudur } from './borobudur/ground.js';
import { ground as ur } from './ur/ground.js';
import { ground as lalibela } from './lalibela/ground.js';
import { ground as tenochtitlan } from './tenochtitlan/ground.js';
import { ground as teotihuacan } from './teotihuacan/ground.js';
import { ground as taos } from './taos/ground.js';

export const GROUNDS = {
  'ming-suzhou': mingSuzhou,
  'qing-beijing': qingBeijing,
  angkor,
  'chichen-itza': chichenItza,
  giza,
  djenne,
  'machu-picchu': machuPicchu,
  'mughal-agra': mughalAgra,
  isfahan,
  'edo-himeji': edoHimeji,
  'song-hangzhou': songHangzhou,
  borobudur,
  ur,
  lalibela,
  tenochtitlan,
  teotihuacan,
  taos,
};

export const MODULES = {
  'ming-suzhou': () => import('./ming-suzhou/index.js'),
  'qing-beijing': () => import('./qing-beijing/index.js'),
  angkor: () => import('./angkor/index.js'),
  'chichen-itza': () => import('./chichen-itza/index.js'),
  giza: () => import('./giza/index.js'),
  djenne: () => import('./djenne/index.js'),
  'machu-picchu': () => import('./machu-picchu/index.js'),
  'mughal-agra': () => import('./mughal-agra/index.js'),
  isfahan: () => import('./isfahan/index.js'),
  'edo-himeji': () => import('./edo-himeji/index.js'),
  'song-hangzhou': () => import('./song-hangzhou/index.js'),
  borobudur: () => import('./borobudur/index.js'),
  ur: () => import('./ur/index.js'),
  lalibela: () => import('./lalibela/index.js'),
  tenochtitlan: () => import('./tenochtitlan/index.js'),
  teotihuacan: () => import('./teotihuacan/index.js'),
  taos: () => import('./taos/index.js'),
};
