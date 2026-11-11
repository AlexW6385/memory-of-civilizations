// The settlements of their own (DESIGN §9, Phase B on): each a module under src/settlements/<id>/.
// GROUNDS: their grounds (ground.js: pure, imported everywhere, the workers included).
// MODULES: their plans, towns and music (index.js: loaded when the settlement is built).

import { withCrops } from './crops.js';
import { ground as mingSuzhou } from './ming-suzhou/ground.js';
import { ground as qingBeijing } from './qing-beijing/ground.js';
import { ground as angkor } from './angkor/ground.js';
import { ground as chichenItza } from './chichen-itza/ground.js';
import { ground as giza } from './giza/ground.js';
import { ground as djenne } from './djenne/ground.js';
import { ground as machuPicchu } from './machu-picchu/ground.js';
import { ground as mughalAgra } from './mughal-agra/ground.js';
import { ground as isfahan } from './isfahan/ground.js';
import { ground as timuridSamarkand } from './timurid-samarkand/ground.js';
import { ground as edoHimeji } from './edo-himeji/ground.js';
import { ground as songHangzhou } from './song-hangzhou/ground.js';
import { ground as borobudur } from './borobudur/ground.js';
import { ground as ur } from './ur/ground.js';
import { ground as lalibela } from './lalibela/ground.js';
import { ground as tenochtitlan } from './tenochtitlan/ground.js';
import { ground as teotihuacan } from './teotihuacan/ground.js';
import { ground as taos } from './taos/ground.js';
import { ground as shaolin } from './shaolin/ground.js';
import { ground as joseonSeoul } from './joseon-seoul/ground.js';
import { ground as songKaifeng } from './song-kaifeng/ground.js';
import { ground as lhasa } from './lhasa/ground.js';
import { ground as madurai } from './madurai/ground.js';
import { ground as persepolis } from './persepolis/ground.js';
import { ground as petra } from './petra/ground.js';
import { ground as knossos } from './knossos/ground.js';
import { ground as rapaNui } from './rapa-nui/ground.js';
import { ground as maori } from './maori/ground.js';
import { ground as athens } from './athens/ground.js';
import { ground as rome } from './rome/ground.js';
import { ground as constantinople } from './constantinople/ground.js';
import { ground as jerusalem } from './jerusalem/ground.js';
import { ground as paris } from './paris/ground.js';
import { ground as conques } from './conques/ground.js';
import { ground as tangWutai } from './tang-wutai/ground.js';
import { ground as heianUji } from './heian-uji/ground.js';
import { ground as sanchi } from './sanchi/ground.js';
import { ground as nara } from './nara/ground.js';
import { ground as muromachiKyoto } from './muromachi-kyoto/ground.js';
import { ground as khajuraho } from './khajuraho/ground.js';
import { ground as babylon } from './babylon/ground.js';
import { ground as ottomanIstanbul } from './ottoman-istanbul/ground.js';
import { ground as mamlukCairo } from './mamluk-cairo/ground.js';
import { ground as kilwa } from './kilwa/ground.js';
import { ground as greatZimbabwe } from './great-zimbabwe/ground.js';
import { ground as stonehenge } from './stonehenge/ground.js';
import { ground as granada } from './granada/ground.js';
import { ground as fez } from './fez/ground.js';
import { ground as florence } from './florence/ground.js';
import { ground as venice } from './venice/ground.js';
import { ground as amsterdam } from './amsterdam/ground.js';
import { ground as versailles } from './versailles/ground.js';
import { ground as london } from './london/ground.js';
import { ground as barcelona } from './barcelona/ground.js';
import { ground as baroqueRome } from './baroque-rome/ground.js';
import { ground as norseBorgund } from './norse-borgund/ground.js';
import { ground as muscovy } from './muscovy/ground.js';
import { ground as cahokia } from './cahokia/ground.js';
import { ground as newYork } from './new-york/ground.js';
import { ground as sydney } from './sydney/ground.js';
import { ground as dunhuang } from './dunhuang/ground.js';

import { ground as abuSimbel } from './abu-simbel/ground.js';
import { ground as thebes } from './thebes/ground.js';
import { ground as mongolKarakorum } from './mongol-karakorum/ground.js';
import { ground as catalhoyuk } from './catalhoyuk/ground.js';
import { ground as shibam } from './shibam/ground.js';
import { ground as delphi } from './delphi/ground.js';
import { ground as mycenae } from './mycenae/ground.js';
import { ground as abbasidBaghdad } from './abbasid-baghdad/ground.js';
import { ground as qinXianyang } from './qin-xianyang/ground.js';
import { ground as alexandria } from './alexandria/ground.js';
import { ground as hanChangan } from './han-changan/ground.js';
import { ground as mohenjoDaro } from './mohenjo-daro/ground.js';
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
  'timurid-samarkand': timuridSamarkand,
  'edo-himeji': edoHimeji,
  'song-hangzhou': songHangzhou,
  borobudur,
  ur,
  lalibela,
  tenochtitlan,
  teotihuacan,
  taos,
  shaolin,
  'joseon-seoul': joseonSeoul,
  'song-kaifeng': songKaifeng,
  lhasa,
  madurai,
  persepolis,
  petra,
  knossos,
  'rapa-nui': rapaNui,
  maori,
  athens,
  rome,
  constantinople,
  jerusalem,
  paris,
  conques,
  'tang-wutai': tangWutai,
  'heian-uji': heianUji,
  sanchi,
  nara,
  'muromachi-kyoto': muromachiKyoto,
  khajuraho,
  babylon,
  'ottoman-istanbul': ottomanIstanbul,
  'mamluk-cairo': mamlukCairo,
  kilwa,
  'great-zimbabwe': greatZimbabwe,
  stonehenge,
  granada,
  fez,
  florence,
  venice,
  amsterdam,
  versailles,
  london,
  barcelona,
  'baroque-rome': baroqueRome,
  'norse-borgund': norseBorgund,
  muscovy,
  cahokia,
  'new-york': newYork,
  sydney,
  dunhuang,
  'abu-simbel': abuSimbel,
  thebes,
  'mongol-karakorum': mongolKarakorum,
  catalhoyuk,
  shibam,
  delphi,
  mycenae,
  'abbasid-baghdad': abbasidBaghdad,
  'qin-xianyang': qinXianyang,
  alexandria,
  'han-changan': hanChangan,
  'mohenjo-daro': mohenjoDaro,
};

// every settlement's fields carry their crop (src/settlements/crops.js)
for (const [id, G] of Object.entries(GROUNDS)) withCrops(id, G);

const LOADERS = {
  alexandria: () => import('./alexandria/index.js'),
  'ming-suzhou': () => import('./ming-suzhou/index.js'),
  dunhuang: () => import('./dunhuang/index.js'),
  'qing-beijing': () => import('./qing-beijing/index.js'),
  angkor: () => import('./angkor/index.js'),
  'chichen-itza': () => import('./chichen-itza/index.js'),
  giza: () => import('./giza/index.js'),
  djenne: () => import('./djenne/index.js'),
  'machu-picchu': () => import('./machu-picchu/index.js'),
  'mughal-agra': () => import('./mughal-agra/index.js'),
  isfahan: () => import('./isfahan/index.js'),
  'timurid-samarkand': () => import('./timurid-samarkand/index.js'),
  'edo-himeji': () => import('./edo-himeji/index.js'),
  'song-hangzhou': () => import('./song-hangzhou/index.js'),
  borobudur: () => import('./borobudur/index.js'),
  ur: () => import('./ur/index.js'),
  lalibela: () => import('./lalibela/index.js'),
  tenochtitlan: () => import('./tenochtitlan/index.js'),
  teotihuacan: () => import('./teotihuacan/index.js'),
  taos: () => import('./taos/index.js'),
  shaolin: () => import('./shaolin/index.js'),
  'joseon-seoul': () => import('./joseon-seoul/index.js'),
  'song-kaifeng': () => import('./song-kaifeng/index.js'),
  lhasa: () => import('./lhasa/index.js'),
  madurai: () => import('./madurai/index.js'),
  persepolis: () => import('./persepolis/index.js'),
  petra: () => import('./petra/index.js'),
  knossos: () => import('./knossos/index.js'),
  'rapa-nui': () => import('./rapa-nui/index.js'),
  maori: () => import('./maori/index.js'),
  athens: () => import('./athens/index.js'),
  rome: () => import('./rome/index.js'),
  constantinople: () => import('./constantinople/index.js'),
  jerusalem: () => import('./jerusalem/index.js'),
  paris: () => import('./paris/index.js'),
  conques: () => import('./conques/index.js'),
  'tang-wutai': () => import('./tang-wutai/index.js'),
  'heian-uji': () => import('./heian-uji/index.js'),
  sanchi: () => import('./sanchi/index.js'),
  nara: () => import('./nara/index.js'),
  'muromachi-kyoto': () => import('./muromachi-kyoto/index.js'),
  khajuraho: () => import('./khajuraho/index.js'),
  babylon: () => import('./babylon/index.js'),
  'ottoman-istanbul': () => import('./ottoman-istanbul/index.js'),
  'mamluk-cairo': () => import('./mamluk-cairo/index.js'),
  kilwa: () => import('./kilwa/index.js'),
  'great-zimbabwe': () => import('./great-zimbabwe/index.js'),
  stonehenge: () => import('./stonehenge/index.js'),
  granada: () => import('./granada/index.js'),
  fez: () => import('./fez/index.js'),
  florence: () => import('./florence/index.js'),
  venice: () => import('./venice/index.js'),
  amsterdam: () => import('./amsterdam/index.js'),
  versailles: () => import('./versailles/index.js'),
  london: () => import('./london/index.js'),
  barcelona: () => import('./barcelona/index.js'),
  'baroque-rome': () => import('./baroque-rome/index.js'),
  'norse-borgund': () => import('./norse-borgund/index.js'),
  muscovy: () => import('./muscovy/index.js'),
  cahokia: () => import('./cahokia/index.js'),
  'new-york': () => import('./new-york/index.js'),
  sydney: () => import('./sydney/index.js'),
  'abu-simbel': () => import('./abu-simbel/index.js'),
  thebes: () => import('./thebes/index.js'),
  'mongol-karakorum': () => import('./mongol-karakorum/index.js'),
  catalhoyuk: () => import('./catalhoyuk/index.js'),
  shibam: () => import('./shibam/index.js'),
  delphi: () => import('./delphi/index.js'),
  mycenae: () => import('./mycenae/index.js'),
  'abbasid-baghdad': () => import('./abbasid-baghdad/index.js'),
  'qin-xianyang': () => import('./qin-xianyang/index.js'),
  'han-changan': () => import('./han-changan/index.js'),
  'mohenjo-daro': () => import('./mohenjo-daro/index.js'),
};

/** Each settlement's module, with the life of its streets added to its townscape (src/objects/life.js). */
const RADII = {};
export const MODULES = Object.fromEntries(Object.entries(LOADERS).map(([id, load]) => [id, async () => {
  const [mod, life, sites] = await Promise.all([load(), import('../objects/life.js'), import('../planet/sites.js')]);
  await import('../objects/index.js');
  RADII[id] ??= sites.SITES.find((s) => s.id === id)?.radius ?? 400;
  return life.withLife(id, mod, GROUNDS[id], RADII[id]);
}]));
