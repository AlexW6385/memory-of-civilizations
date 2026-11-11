// Music of Ayutthaya (docs/settlements/ayutthaya.md §9): the piphat of the court and the wat — the xylophone (ranat), the gong circle and the
// oboe (pi) over the drums — on a pentatonic scale; in the halls the chant of the monks over a drone.
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 76,
  zones: {
    open: {
      harp: { density: 0.45, range: [7, 26], level: 0.16, timbre: 'koto' },
      lead: { timbre: 'reed', density: 0.28, range: [12, 24], level: 0.07 },
      qing: { every: 14, level: 0.14 },
      reverb: 0.35,
    },
    hall: {
      drone: { notes: [-12, 0], level: 0.06, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.5, range: [0, 12], level: 0.1, rhythm: [1, 1, 2, 1, 1, 2] },
      qing: { every: 11, level: 0.18 },
      reverb: 0.6,
    },
  },
};
