// Music of the Hakka tulou (docs/settlements/hakka-tulou.md §6): Hakka mountain songs, a high voice over a
// two-stringed fiddle's drone (the ney and the voice stand in), pentatonic, unhurried.
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.03, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [7, 19], level: 0.08, rhythm: [2, 1, 1, 2] }, harp: { density: 0.12, range: [5, 17], level: 0.1, timbre: 'pipa' }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.25, range: [0, 12], level: 0.07 }, reverb: 0.75 },
  },
};
