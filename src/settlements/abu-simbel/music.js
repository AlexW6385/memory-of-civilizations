// Music of New Kingdom Egypt in the Nubian temple (docs/settlements/abu-simbel.md §9): the harp and the end-blown flute, the singer, the sistra
// of Hathor's temple, the hymn to the rising sun at the great façade (a plucked harp, a flute, a voice stand in). In the halls the voice over a low drone;
// on the terrace and the town the harp and the ney, with the clapping of the lanes.

export default {
  tonic: 50,
  scale: [0, 2, 3, 7, 8],
  tempo: 66,
  zones: {
    open: { harp: { density: 0.3, range: [5, 22], level: 0.2, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.25, range: [12, 24], level: 0.08 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.5, range: [0, 12], level: 0.12 }, harp: { density: 0.2, range: [0, 10], level: 0.08, timbre: 'kithara' }, reverb: 0.75 },
  },
};
