// Music of the temples (docs/settlements/khajuraho.md §9): a raga on the veena
// over the drone, temple drums and bells (a plucked string, a
// drone and a reed stand in).
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 11],
  tempo: 62,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.3, range: [5, 22], level: 0.18, timbre: 'oud' }, reverb: 0.4 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.3, range: [7, 19], level: 0.08 }, reverb: 0.7 },
  },
};
