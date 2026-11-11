// Music of the village (docs/settlements/sgang-gwaay.md §9): a drum and singing from the house, low and close, pentatonic-ish.
export default {
  tonic: 45,
  scale: [0, 2, 5, 7, 9],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.03, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.1, range: [5, 14], level: 0.05 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.22, range: [0, 9], level: 0.07 }, reverb: 0.3 },
  },
};
