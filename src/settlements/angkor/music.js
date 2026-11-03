// Music of Angkor (docs/settlements/angkor.md §9): the pinpeat ensemble of the temple — gong
// circles and xylophones over a quadruple-reed oboe — on a pentatonic scale; in the galleries the
// chant of the Brahmins; in the village a harp (the Khmer angular harp, pin) and a flute.

export default {
  tonic: 53,                              // F3
  scale: [0, 2, 4, 7, 9],
  tempo: 80,
  zones: {
    open: {
      harp: { density: 0.4, range: [7, 26], level: 0.18, timbre: 'koto' },
      lead: { timbre: 'reed', density: 0.3, range: [12, 24], level: 0.08 },
      qing: { every: 16, level: 0.14 },
      reverb: 0.35,
    },
    hall: {
      drone: { notes: [-12, 0], level: 0.06, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.6, range: [0, 12], level: 0.12, rhythm: [1, 1, 2, 1, 1, 2] },
      qing: { every: 12, level: 0.18 },
      reverb: 0.55,
    },
  },
};
