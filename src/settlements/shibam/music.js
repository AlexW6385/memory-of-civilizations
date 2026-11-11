// Music of the Hadhramaut (docs/settlements/shibam.md §9): the oud and the hand drum of the Hadhrami dan, a voice calling in the
// hall (a plucked lute, a ney and a voice stand in), in a mode with a low second.
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 76,
  zones: {
    open: { harp: { density: 0.25, range: [0, 14], level: 0.14, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.16, range: [7, 19], level: 0.06 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [0, 12], level: 0.08 }, reverb: 0.75 },
  },
};
