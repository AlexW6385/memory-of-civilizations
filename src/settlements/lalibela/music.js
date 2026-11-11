// Music of Zagwe Ethiopia (docs/settlements/lalibela.md §9): chant over the kebero and sistrum,
// the begena (a plucked string, a drone and the ney stand in), in a pentatonic like the tizita.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 54,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.045, timbre: 'voice' }, harp: { density: 0.22, range: [0, 14], level: 0.16, timbre: 'oud' }, reverb: 0.4 },
    hut: { drone: { notes: [-12], level: 0.015, timbre: 'voice' }, reverb: 0.12 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.07 }, reverb: 0.8 },
  },
};
