// Music of Safavid Persia (docs/settlements/isfahan.md §10): the santur and the tar over a drone,
// the ney leading, in a mode near Homayun (a bright plucked string, a drone and the ney stand in).
export default {
  tonic: 52,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, harp: { density: 0.36, range: [5, 24], level: 0.17, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.2, range: [7, 19], level: 0.07 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.25, range: [5, 20], level: 0.14, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.3, range: [7, 19], level: 0.09 }, reverb: 0.75 },
  },
};
