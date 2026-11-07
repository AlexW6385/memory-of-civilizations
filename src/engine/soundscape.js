// The sounds of each place (DESIGN §5 "Sound"): which birds by its climate, its animals, the
// cicadas and frogs, what its roofs are made of (for the rain on them), and the bells, drums and
// calls that mark its hours — each only where it is sourced for the place and the period. Pure:
// the audio engine plays what `due` returns; the tests check the schedule.
//
// The planet's sun stands always at the equinox (src/engine/climate.js: declination 0), so day and
// night are twelve hours each everywhere; unequal-hour systems (Edo's koku) fall on the even hours.
//
// Sources [stated unless marked]:
// - The Angelus: three strokes thrice, then a longer peal, morning, noon and evening; documented in
//   Franciscan Italy from 1263–1295, evening bell urged by St Bonaventure 1269, the triple daily
//   recitation ordered in France by Louis XI 1472 (https://en.wikipedia.org/wiki/Angelus). So: not
//   before the 15th century in our settlements (Florence 1480 yes; Paris 1248, Conques 1120 no).
// - Monastic and cathedral bells for the canonical hours (Matins, Lauds, Prime, Terce, Sext, None,
//   Vespers, Compline) [inferred from the Rule of St Benedict's horarium]: Conques 1120, Paris 1248.
// - Venice: the Marangona of the campanile rang the start and end of the working day and rings
//   alone at midnight (https://livingveniceblog.com/2004/11/bells-of-campanile-la-marangona/).
// - Westminster: the quarter chimes (G♯4 F♯4 E4 B3, E major, five changes) and Big Ben's hour (E3),
//   the tune adopted for the Palace clock from Great St Mary's, Cambridge; Big Ben strikes from 1859
//   (https://en.wikipedia.org/wiki/Westminster_Quarters).
// - Edo: time bells struck nine at midnight and noon, then eight, seven, six (dawn and dusk), five,
//   four, then nine again, the day and the night each in six koku
//   (https://samurai-archives.com/wiki/Telling_Time); Himeji's castle town kept such a bell [inferred].
// - Joseon Hanyang: the great bell of Jongno (Bosingak, 1395/96) struck 33 times at 4 am and at
//   10 pm, opening and closing the city gates (https://en.wikipedia.org/wiki/Bosingak).
// - Beijing: at the Drum and Bell Towers the drums were always beaten before the bell was rung, at
//   the evening watch (7–9 pm), and the city gates closed (China Daily, "Bell and Drum Towers:
//   witnesses of time", https://govt.chinadaily.com.cn/s/202206/07/WS629eae9b498e6a12c122e383/bell-and-drum-towers-witnesses-of-time.html);
//   a dawn bell [inferred].
// - Suzhou: the bell of Hanshan Temple heard at midnight from the boats outside the city wall
//   (Zhang Ji, 枫桥夜泊, "姑苏城外寒山寺，夜半钟声到客船") [stated, Tang poem; kept in Ming, inferred].
// - Buddhist monasteries of China, Japan: "the morning bell and the evening drum" (晨钟暮鼓) [inferred];
//   the bonshō struck slowly with a swung log (https://www.bells.org/blog/campanology-word-day-bonsho).
// - The call to prayer: Fajr when the sun is 18° below the horizon, Dhuhr just after noon, Asr when a
//   shadow equals the object's height (twice, in the Hanafi school, as in the Ottoman and Mughal
//   lands) plus the noon shadow, Maghrib at sunset, Isha when it is 17° below (Muslim World League
//   convention; https://en.wikipedia.org/wiki/Salah_times, https://praytimes.org/docs/methods).
// - Hagia Sophia in 562 had no bells: the semantron called to the offices (bells reached
//   Constantinople in the 9th century) [inferred; the semantron is in the dossier's music].
// - Birds, animals, cicadas, frogs and roofs: from each dossier's townscape and climate [inferred].

/**
 * Per settlement: birds (voices and weights), cicadas (0…1, warm, by day), frogs (0…1, night, by
 * water), animals (voices and weights), roof (what rain falls on), bells (the schedule's kind),
 * adhan (the Asr shadow factor where the call to prayer is heard).
 */
const T = (birds, o = {}) => ({ birds, cicadas: 0, frogs: 0, animals: {}, roof: 'tile', bells: null, adhan: 0, ...o });
const EU = { warbler: 1, sparrow: 0.7, crow: 0.4 };                 // temperate Europe
const MED = { sparrow: 1, warbler: 0.5, dove: 0.5, crow: 0.2 };      // Mediterranean towns
const NEAR = { sparrow: 1, dove: 1, kite: 0.3 };                     // Near East, Egypt, Iran
const IND = { koel: 0.6, crow: 1, kite: 0.5, dove: 0.6, sparrow: 0.5 };
const EAS = { warbler: 0.8, sparrow: 0.7, crow: 0.6 };              // East Asia
const TROP = { tropic: 1, dove: 0.6, koel: 0.2 };
const AMER = { warbler: 0.8, tropic: 0.4, dove: 0.4 };
const FARM = { rooster: 1, dog: 0.6, donkey: 0.3, cattle: 0.3 };

export const PROFILES = {
  amsterdam: T({ ...EU, gull: 0.8 }, { animals: { dog: 0.3, horse: 0.3 }, roof: 'tile', bells: 'carillon' }),
  angkor: T(TROP, { cicadas: 0.8, frogs: 0.9, animals: { rooster: 1, cattle: 0.5, dog: 0.4 }, roof: 'thatch' }),
  athens: T(MED, { cicadas: 0.9, animals: { rooster: 0.6, donkey: 0.5, sheepbell: 0.4, dog: 0.3 } }),
  babylon: T({ ...NEAR, gull: 0 }, { frogs: 0.4, animals: { donkey: 0.7, dog: 0.4, rooster: 0.2 }, roof: 'flat' }),
  barcelona: T(MED, { cicadas: 0.3, animals: { dog: 0.3, horse: 0.4 }, bells: 'angelus' }),
  'baroque-rome': T(MED, { cicadas: 0.4, animals: { horse: 0.5, dog: 0.3, donkey: 0.2 }, bells: 'angelus' }),
  borobudur: T(TROP, { cicadas: 1, frogs: 1, animals: { rooster: 1, dog: 0.3, cattle: 0.3 }, roof: 'thatch' }),
  cahokia: T(AMER, { cicadas: 0.6, frogs: 0.8, animals: { dog: 0.6 }, roof: 'thatch' }),
  'chichen-itza': T(TROP, { cicadas: 1, frogs: 0.5, animals: { dog: 0.4 }, roof: 'thatch' }),
  conques: T(EU, { animals: { rooster: 0.7, cattle: 0.5, sheepbell: 0.5, dog: 0.3 }, roof: 'slate', bells: 'office' }),
  constantinople: T({ ...MED, gull: 0.7 }, { cicadas: 0.5, animals: { rooster: 0.4, donkey: 0.4, dog: 0.5 }, bells: 'semantron' }),
  djenne: T({ dove: 1, sparrow: 0.6, kite: 0.5, tropic: 0.3 }, { frogs: 0.6, animals: { goat: 0.6, donkey: 0.5, rooster: 0.6, cattle: 0.4 }, roof: 'flat', adhan: 1 }),
  edfu: T(NEAR, { frogs: 0.5, animals: { donkey: 0.7, cattle: 0.4, rooster: 0.2, dog: 0.3 }, roof: 'flat' }),
  'edo-himeji': T(EAS, { cicadas: 0.6, frogs: 0.6, animals: { rooster: 0.4, dog: 0.3, horse: 0.2 }, roof: 'tile', bells: 'toki' }),
  florence: T(MED, { cicadas: 0.3, animals: { horse: 0.4, donkey: 0.3, dog: 0.3 }, bells: 'angelus-hours' }),
  giza: T(NEAR, { animals: { donkey: 0.5, cattle: 0.4, dog: 0.3 }, roof: 'flat' }),
  granada: T(MED, { cicadas: 0.7, animals: { donkey: 0.4, rooster: 0.4, horse: 0.2 }, adhan: 1 }),
  'great-zimbabwe': T({ dove: 1, tropic: 0.7, kite: 0.3 }, { cicadas: 0.7, frogs: 0.4, animals: { cattle: 0.8, goat: 0.4, rooster: 0.3, dog: 0.3 }, roof: 'thatch' }),
  'heian-uji': T(EAS, { cicadas: 0.5, frogs: 0.8, animals: { dog: 0.2 }, roof: 'shingle', bells: 'bonsho' }),
  isfahan: T(NEAR, { cicadas: 0.4, animals: { donkey: 0.5, horse: 0.3, dog: 0.2 }, roof: 'flat', adhan: 1 }),
  jerusalem: T(NEAR, { cicadas: 0.6, animals: { donkey: 0.6, goat: 0.4, rooster: 0.4, dog: 0.3 }, roof: 'flat', adhan: 1 }),
  'joseon-seoul': T(EAS, { cicadas: 0.6, frogs: 0.5, animals: { rooster: 0.6, dog: 0.4, cattle: 0.2 }, roof: 'tile', bells: 'bosingak' }),
  khajuraho: T(IND, { cicadas: 0.6, frogs: 0.6, animals: { cattle: 0.6, rooster: 0.4, goat: 0.4, dog: 0.3 }, roof: 'tile', bells: 'puja' }),
  kilwa: T({ ...TROP, gull: 0.6 }, { cicadas: 0.6, animals: { goat: 0.5, rooster: 0.5, dog: 0.2 }, roof: 'flat', adhan: 1 }),
  knossos: T(MED, { cicadas: 0.9, animals: { goat: 0.5, sheepbell: 0.4, donkey: 0.3, dog: 0.2 }, roof: 'flat' }),
  lalibela: T({ dove: 0.8, kite: 0.6, tropic: 0.4, crow: 0.4 }, { animals: { goat: 0.5, cattle: 0.5, rooster: 0.6, dog: 0.4, donkey: 0.3 }, roof: 'thatch' }),
  lhasa: T({ crow: 1, sparrow: 0.7, kite: 0.4 }, { animals: { dog: 0.8, cattle: 0.3 }, roof: 'flat', bells: 'dungchen' }),
  london: T({ ...EU, gull: 0.5 }, { animals: { horse: 0.8, dog: 0.3 }, roof: 'slate', bells: 'westminster' }),
  'machu-picchu': T({ warbler: 0.6, tropic: 0.4, dove: 0.4 }, { animals: { dog: 0.2 }, roof: 'thatch' }),
  madurai: T(IND, { cicadas: 0.5, frogs: 0.5, animals: { cattle: 0.7, rooster: 0.4, goat: 0.4, dog: 0.3 }, roof: 'tile', bells: 'puja' }),
  'mamluk-cairo': T(NEAR, { animals: { donkey: 0.8, horse: 0.3, rooster: 0.3, dog: 0.4 }, roof: 'flat', adhan: 1 }),
  maori: T({ warbler: 1, tropic: 0.5 }, { cicadas: 0.6, animals: { dog: 0.3 }, roof: 'thatch' }),
  'ming-suzhou': T(EAS, { cicadas: 0.7, frogs: 0.8, animals: { rooster: 0.4, dog: 0.3 }, roof: 'tile', bells: 'hanshan' }),
  'mughal-agra': T(IND, { cicadas: 0.5, animals: { cattle: 0.4, horse: 0.3, rooster: 0.3, dog: 0.3 }, roof: 'flat', adhan: 2 }),
  muscovy: T({ crow: 1, sparrow: 0.8, warbler: 0.4 }, { animals: { horse: 0.7, dog: 0.4, rooster: 0.4, cattle: 0.2 }, roof: 'shingle', bells: 'zvon' }),
  nara: T(EAS, { cicadas: 0.6, frogs: 0.6, animals: { dog: 0.2 }, roof: 'tile', bells: 'bonsho' }),
  'new-york': T({ sparrow: 0.8 }, { animals: {}, roof: 'flat' }),
  'norse-borgund': T({ warbler: 1, crow: 0.5 }, { animals: { sheepbell: 0.7, cattle: 0.6, dog: 0.3, horse: 0.2 }, roof: 'shingle', bells: 'parish' }),
  'ottoman-istanbul': T({ ...MED, gull: 0.8 }, { cicadas: 0.4, animals: { dog: 0.5, donkey: 0.3, horse: 0.3 }, roof: 'tile', adhan: 2 }),
  paris: T(EU, { animals: { horse: 0.5, rooster: 0.3, dog: 0.3 }, roof: 'slate', bells: 'office' }),
  persepolis: T(NEAR, { animals: { horse: 0.5, donkey: 0.4, dog: 0.3 }, roof: 'flat' }),
  petra: T({ dove: 1, kite: 0.4, sparrow: 0.5 }, { animals: { goat: 0.6, donkey: 0.4 }, roof: 'flat' }),
  'qing-beijing': T({ ...EAS, crow: 1 }, { cicadas: 0.7, animals: { dog: 0.3, horse: 0.2 }, roof: 'tile', bells: 'drumbell' }),
  'rapa-nui': T({ gull: 1, tropic: 0.2 }, { animals: { rooster: 0.4 }, roof: 'thatch' }),
  rome: T(MED, { cicadas: 0.5, animals: { donkey: 0.4, horse: 0.3, dog: 0.3 } }),
  sanchi: T(IND, { cicadas: 0.6, frogs: 0.4, animals: { cattle: 0.6, goat: 0.4, rooster: 0.3 }, roof: 'thatch' }),
  'song-hangzhou': T(EAS, { cicadas: 0.7, frogs: 0.6, animals: { rooster: 0.4, dog: 0.3 }, roof: 'tile', bells: 'monastery' }),
  'song-kaifeng': T(EAS, { cicadas: 0.6, frogs: 0.4, animals: { donkey: 0.4, rooster: 0.3, dog: 0.3 }, roof: 'tile', bells: 'monastery' }),
  stonehenge: T({ warbler: 1, crow: 0.6 }, { animals: { cattle: 0.4, dog: 0.3 }, roof: 'thatch' }),
  sydney: T({ gull: 0.8, tropic: 0.5 }, { cicadas: 0.4, animals: {}, roof: 'flat' }),
  'tang-wutai': T({ warbler: 0.7, crow: 0.6 }, { cicadas: 0.4, animals: { dog: 0.3, cattle: 0.3 }, roof: 'tile', bells: 'monastery' }),
  taos: T({ warbler: 0.6, crow: 0.6, dove: 0.3 }, { cicadas: 0.3, animals: { dog: 0.6 }, roof: 'flat' }),
  tenochtitlan: T({ warbler: 0.8, tropic: 0.5 }, { frogs: 0.7, animals: { dog: 0.3 }, roof: 'flat' }),
  teotihuacan: T({ warbler: 0.8, dove: 0.5 }, { cicadas: 0.4, animals: { dog: 0.3 }, roof: 'flat' }),
  ur: T({ ...NEAR, gull: 0 }, { frogs: 0.5, animals: { donkey: 0.6, goat: 0.4, dog: 0.3 }, roof: 'flat' }),
  venice: T({ ...MED, gull: 1 }, { cicadas: 0.2, animals: { dog: 0.2 }, roof: 'tile', bells: 'venice' }),
  versailles: T(EU, { animals: { horse: 0.8, dog: 0.4 }, roof: 'slate', bells: 'angelus' }),
};
const DEFAULT = T({ warbler: 1, sparrow: 0.5 });
export const profileOf = (id) => PROFILES[id] || DEFAULT;

// ---------------------------------------------------------------------------------------------
// The schedule. `due(profile, prev, now)` with { hour (local, 0…24), el (sun elevation, °), lat }
// gives the events whose moment fell between two samples (a jump of more than an hour, as when the
// clock is set, rings nothing).

const HOURS = {
  angelus: [[6, 'angelus'], [12, 'angelus'], [18, 'angelus']],
  'angelus-hours': [[6, 'angelus'], [12, 'angelus'], [18, 'angelus'], ...Array.from({ length: 24 }, (_, h) => [h + 0.0001, 'strike:' + (h % 12 || 12)])],
  // the canonical hours rung by a monastery or a cathedral chapter (at the equinox) [inferred]
  office: [[2, 'office'], [5, 'office'], [6, 'office'], [9, 'office'], [12, 'office'], [15, 'office'], [17.5, 'office'], [19.5, 'office']],
  parish: [[7, 'office'], [18, 'office']],
  semantron: [[5, 'semantron'], [17.5, 'semantron']],
  venice: [[0, 'marangona'], [6, 'marangona'], [12, 'angelus'], [18, 'marangona']],
  carillon: Array.from({ length: 24 }, (_, h) => [h + 0.0001, 'carillon:' + (h % 12 || 12)]),
  westminster: Array.from({ length: 96 }, (_, q) => [q / 4 + 0.0001, (q % 4 ? 'quarter:' + (q % 4) : 'hour:' + ((q / 4) % 12 || 12))]),
  // Edo koku at the equinox: dawn and dusk six, then five, four, nine at noon and midnight, eight, seven
  toki: [[6, 'toki:6'], [8, 'toki:5'], [10, 'toki:4'], [12, 'toki:9'], [14, 'toki:8'], [16, 'toki:7'], [18, 'toki:6'], [20, 'toki:5'], [22, 'toki:4'], [0, 'toki:9'], [2, 'toki:8'], [4, 'toki:7']],
  bosingak: [[4, 'bosingak'], [22, 'bosingak']],
  drumbell: [[5, 'zhong'], [19, 'drum-tower']],
  hanshan: [[0, 'hanshan']],
  monastery: [[5, 'zhong'], [18.5, 'gu']],
  bonsho: [[5.5, 'bonsho'], [18.2, 'bonsho']],
  zvon: [[6.5, 'zvon'], [17, 'zvon']],
  dungchen: [[5.5, 'dungchen'], [18.5, 'dungchen']],
  puja: [[5, 'puja'], [12, 'puja'], [18.3, 'puja']],
};

const crossed = (a, b, t) => (a <= b ? a < t && t <= b : a < t || t <= b);    // over midnight too

export function due(P, prev, now) {
  const out = [];
  if (!prev) return out;
  let dh = now.hour - prev.hour;
  if (dh < 0) dh += 24;
  if (dh > 1 || dh === 0) return out;
  for (const [h, ev] of HOURS[P.bells] || []) if (crossed(prev.hour, now.hour, h)) out.push(ev);
  if (P.adhan) {
    const am = now.hour < 12;
    const down = (e) => !am && prev.el > e && now.el <= e, up = (e) => am && prev.el < e && now.el >= e;
    // Asr: the shadow's length is f times the object's height plus the noon shadow (cot of the noon elevation)
    const noon = Math.max(1, 90 - Math.abs(now.lat ?? 30));
    const asr = Math.atan(1 / (P.adhan + 1 / Math.tan(noon * Math.PI / 180))) * 180 / Math.PI;
    if (up(-18)) out.push('adhan:fajr');
    if (crossed(prev.hour, now.hour, 12.08)) out.push('adhan:dhuhr');
    if (down(asr)) out.push('adhan:asr');
    if (down(-0.833)) out.push('adhan:maghrib');
    if (down(-17)) out.push('adhan:isha');
  }
  return out;
}
