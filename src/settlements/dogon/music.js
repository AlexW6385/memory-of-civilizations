// Music of the Dogon (docs/settlements/dogon.md §10): the rattle of a rod hung with calabashes, drums, call-and-response voices over
// a pentatonic line; a voice drone and a plucked string stand in.
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 84,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.035, timbre: 'voice' }, harp: { density: 0.3, range: [7, 19], level: 0.12, timbre: 'koto' }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.045, timbre: 'voice' }, harp: { density: 0.25, range: [0, 14], level: 0.12, timbre: 'koto' }, reverb: 0.55 },
  },
};
