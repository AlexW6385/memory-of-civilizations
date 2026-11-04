// Music of Tibet (docs/settlements/lhasa.md §9): long horns and the gyaling, drums and cymbals, the
// monks' deep chant (a drone, a voice and a reed stand in).
export default {
  tonic: 43,
  scale: [0, 2, 3, 7, 9],
  tempo: 44,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'reed', density: 0.12, range: [12, 24], level: 0.05 }, reverb: 0.5 },
    hall: { drone: { notes: [-24, -12, 0], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [0, 7], level: 0.06 }, reverb: 0.85 },
  },
};
