// Music of the Achaemenid court (docs/settlements/persepolis.md §9): harps and lyres, double pipes
// and drums of the Near East — little is known; a harp, a reed and a drone stand in.
export default {
  tonic: 45,
  scale: [0, 2, 3, 5, 7, 8, 10],
  tempo: 56,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.25, range: [5, 22], level: 0.16, timbre: 'kithara' }, reverb: 0.35 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'sho' }, lead: { timbre: 'aulos', density: 0.25, range: [7, 19], level: 0.07 }, reverb: 0.8 },
  },
};
