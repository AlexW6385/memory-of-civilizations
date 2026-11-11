// Music of New Kingdom Egypt (docs/settlements/thebes.md §9): the arched harp and the lute, the double flute, the sistrum and the
// clapping, the priests' chant in the hall (a harp, a flute and a voice stand in).

export default {
  tonic: 50,
  scale: [0, 2, 3, 7, 8],
  tempo: 76,
  zones: {
    open: { harp: { density: 0.4, range: [5, 24], level: 0.2, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.3, range: [12, 26], level: 0.09 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.45, range: [0, 12], level: 0.12 }, harp: { density: 0.12, range: [0, 14], level: 0.09, timbre: 'kithara' }, reverb: 0.85 },
  },
};
