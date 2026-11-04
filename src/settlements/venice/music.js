// Music of Venice (docs/settlements/venice.md §9): polychoral music in San Marco, the lute and the
// viol in the palaces, the gondoliers' songs; voices, a plucked string and a reed stand in.
export default {
  tonic: 50,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 64,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.15, timbre: 'oud' }, reverb: 0.35 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.95 },
  },
};
