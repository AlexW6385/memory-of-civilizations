// Music of Ye (docs/settlements/wei-ye.md §8): the court's pentatonic music of the Jian'an era — the qin, the yu and sheng, bells and drums; on the
// terrace the lute and a low voice, the wind. Gong mode on D.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.22, range: [2, 19], level: 0.15, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.14, range: [9, 21], level: 0.06 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.07, timbre: 'sho' }, harp: { density: 0.2, range: [0, 14], level: 0.13, timbre: 'koto' }, lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.1, rhythm: [2, 1, 1, 2] }, qing: { every: 36, level: 0.2 }, reverb: 0.85 },
    market: { harp: { density: 0.3, range: [4, 20], level: 0.14, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.25, range: [9, 21], level: 0.08 }, drum: { pattern: [1, 0, 0, 0.5, 0.7, 0, 0.5, 0], every: 2, level: 0.05 }, reverb: 0.35 },
    house: { harp: { density: 0.14, range: [0, 14], level: 0.12, timbre: 'koto' }, reverb: 0.5 },
  },
};
