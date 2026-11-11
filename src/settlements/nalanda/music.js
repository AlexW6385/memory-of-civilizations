// Music of Nalanda (docs/settlements/nalanda.md §10): a drone of tonic and fifth, a plucked string in a slow pentatonic
// mode, the recited chant of the monks near the shrines, a wooden gong.
export default {
  tonic: 47,
  scale: [0, 2, 4, 7, 9],
  tempo: 56,
  zones: {
    open: {
      drone: { notes: [0, 7, 12], level: 0.05 },
      harp: { density: 0.25, range: [7, 24], level: 0.18, timbre: 'pipa' },
      reverb: 0.3,
    },
    hall: {
      drone: { notes: [-12, 0, 7], level: 0.06, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.7, range: [0, 12], level: 0.12, rhythm: [1, 1, 2, 1, 1, 2] },
      qing: { every: 36, level: 0.1 },
      reverb: 0.55,
    },
  },
};
