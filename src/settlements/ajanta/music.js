// Music of Ajanta (docs/settlements/ajanta.md §9): in the open a plucked lute and a bamboo flute over a drone, in the
// caves a low drone and a chanting voice; a Bhupali-like pentatonic mode [inferred].
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 62,
  zones: {
    open: {
      drone: { notes: [0, 7, 12], level: 0.04 },
      harp: { density: 0.22, range: [7, 22], level: 0.15, timbre: 'pipa' },
      lead: { timbre: 'ney', density: 0.18, range: [12, 26], level: 0.06 },
      reverb: 0.3,
    },
    hall: {
      drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.4, range: [0, 12], level: 0.1, rhythm: [3, 1, 2] },
      reverb: 0.8,
    },
  },
};
