// Music of Victorian London (docs/settlements/london.md §9): the Great Bell's chimes, church bells,
// the barrel organ and the brass band, hymns in the Abbey; a reed, voices and a drone stand in.
export default {
  tonic: 52,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 72,
  zones: {
    open: { drone: { notes: [-12, 0, 7], level: 0.03, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.25, range: [7, 19], level: 0.06 }, reverb: 0.4 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.06, timbre: 'sho' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.95 },
  },
};
