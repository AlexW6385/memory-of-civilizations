// Music of Muscovy (docs/settlements/muscovy.md §9): znamenny chant, the bells of Ivan the Great
// and the churches, the gusli and the skomorokhi's songs in the square; voices, a drone and a
// plucked string stand in.
export default {
  tonic: 48,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-24, -12, 0], level: 0.04, timbre: 'voice' }, harp: { density: 0.2, range: [0, 14], level: 0.12, timbre: 'oud' }, reverb: 0.5 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 9], level: 0.06 }, reverb: 0.95 },
  },
};
