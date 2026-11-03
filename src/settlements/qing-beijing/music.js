// Music of Ming–Qing Beijing (docs/settlements/qing-beijing.md §9): in the palace, the court's
// ceremonial music (zhonghe shaoyue) — bell chimes and stone chimes, slow, on the gong mode; in
// the halls a drone of mouth organs (sheng) under a flute; in the lanes, the erhu-like voice of a
// fiddle and the clappers of street sellers (a plucked lute stands in for them here).

export default {
  tonic: 50,                              // D3
  scale: [0, 2, 4, 7, 9],
  tempo: 54,
  zones: {
    open: {
      harp: { density: 0.22, range: [0, 19], level: 0.18, timbre: 'pipa' },
      lead: { timbre: 'ney', density: 0.2, range: [12, 24], level: 0.07 },
      qing: { every: 24, level: 0.16 },
      reverb: 0.4,
    },
    hall: {
      drone: { notes: [-12, -5, 0], level: 0.07, timbre: 'sho' },
      lead: { timbre: 'ney', density: 0.35, range: [7, 19], level: 0.1, rhythm: [3, 1, 2, 2] },
      qing: { every: 16, level: 0.2 },
      reverb: 0.6,
    },
  },
};
