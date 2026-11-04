// Music of the Pueblo (docs/settlements/taos.md §9): drums and voices, rattles, a cedar flute
// (a drone, a voice and the ney stand in), pentatonic.
export default {
  tonic: 50,
  scale: [0, 3, 5, 7, 10],
  tempo: 72,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.18, range: [7, 19], level: 0.07 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.07 }, reverb: 0.7 },
  },
};
