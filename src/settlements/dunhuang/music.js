// Music of Dunhuang (docs/settlements/dunhuang.md §9): a flute (qiang di) and the plucked lute (pipa) of the
// Silk Road in the open, in the caves a drone and a single voice chanting; zhi mode (pentatonic).
export default {
  tonic: 50,
  scale: [0, 2, 5, 7, 9],
  tempo: 66,
  zones: {
    open: {
      harp: { density: 0.22, range: [5, 20], level: 0.16, timbre: 'pipa' },
      lead: { timbre: 'ney', density: 0.2, range: [12, 26], level: 0.07 },
      reverb: 0.3,
    },
    hall: {
      drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.09, rhythm: [3, 1, 2] },
      reverb: 0.75,
    },
  },
};
