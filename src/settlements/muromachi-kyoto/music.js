// Music of Muromachi Kyoto (docs/settlements/muromachi-kyoto.md §8): the yo scale, the Noh flute (nōkan stands in as the ney),
// drums, the temple's sustained voices of the monks (a drone), bells.
export default {
  tonic: 52,
  scale: [0, 2, 5, 7, 9],
  tempo: 56,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.14, range: [7, 19], level: 0.06 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [0, 12], level: 0.06 }, reverb: 0.75 },
  },
};
