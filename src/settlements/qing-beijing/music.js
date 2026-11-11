// Music and ambience of Ming–Qing Beijing (docs/settlements/qing-beijing.md §20), by place:
//  - the palace's courts and halls: the court's ritual music (zhonghe shaoyue) — slow, on the gong
//    mode: chime bells and chime stones (bianzhong, bianqing: the engine's bell and bowl-bell), a
//    drone of mouth organs (sheng) in the halls, a flute above; no street voices;
//  - the lanes and the avenue (streetMusic): a plucked lute (sanxian/pipa) and a high flute, the
//    wooden clapper of a peddler; high, wavering flute notes stand for the pigeon whistles (gehao) of
//    the flocks over the roofs; a bowl-bell now and then for a temple beyond the roofs;
//  - the courtyard houses (zone 'house'): a plucked lute alone, soft; the tea house (zone 'tea'): the
//    storyteller's wooden block and a fiddle's voice (the engine's flute and lute stand in).
// default: the palace's score (index.js: landmarks); streetMusic: the settlement's own, for the lanes.

const COURT = {
  tonic: 50,                              // D3
  scale: [0, 2, 4, 7, 9],
  tempo: 52,
  zones: {
    open: {
      bells: { every: 32, level: 0.1 },
      qing: { every: 20, level: 0.16 },
      drone: { notes: [-12, -5], level: 0.03, timbre: 'sho' },
      lead: { timbre: 'ney', density: 0.16, range: [12, 24], level: 0.06 },
      reverb: 0.5,
    },
    hall: {
      drone: { notes: [-12, -5, 0], level: 0.07, timbre: 'sho' },
      lead: { timbre: 'ney', density: 0.35, range: [7, 19], level: 0.1, rhythm: [3, 1, 2, 2] },
      bells: { every: 24, level: 0.12 },
      qing: { every: 16, level: 0.2 },
      reverb: 0.7,
    },
    court: {
      bells: { every: 24, level: 0.11 },
      qing: { every: 16, level: 0.16 },
      drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' },
      reverb: 0.55,
    },
  },
};

export const courtMusic = COURT;

export const streetMusic = {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 66,
  zones: {
    // the lanes: lute phrases, pigeon whistles high above, a clapper's knock
    open: {
      harp: { density: 0.2, range: [0, 19], level: 0.15, timbre: 'pipa' },
      lead: { timbre: 'ney', density: 0.14, range: [26, 33], level: 0.03 },
      woodfish: { level: 0.012 },
      qing: { every: 48, level: 0.05 },
      reverb: 0.3,
    },
    house: {
      harp: { density: 0.18, range: [0, 14], level: 0.11, timbre: 'pipa' },
      reverb: 0.4,
    },
    tea: {
      harp: { density: 0.3, range: [0, 17], level: 0.13, timbre: 'pipa' },
      lead: { timbre: 'voice', density: 0.3, range: [7, 17], level: 0.07, rhythm: [2, 1, 1, 2] },
      woodfish: { level: 0.03 },
      reverb: 0.35,
    },
    hall: COURT.zones.hall,
  },
};

export default COURT;
