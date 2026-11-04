// Music of Teotihuacan (docs/settlements/teotihuacan.md §9): clay flutes, drums and conch (the ney,
// a plucked string and a drone stand in), pentatonic.
export default {
  tonic: 47,
  scale: [0, 2, 5, 7, 9],
  tempo: 64,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.035, timbre: 'sho' }, harp: { density: 0.22, range: [0, 14], level: 0.13, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.22, range: [12, 24], level: 0.07 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [12, 24], level: 0.07 }, reverb: 0.6 },
  },
};
