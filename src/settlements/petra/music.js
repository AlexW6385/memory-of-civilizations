// Music of Nabataea (docs/settlements/petra.md §9): caravan music of Arabia — lyres, pipes, frame
// drums, little known; a lyre, a reed pipe and a drone stand in.
export default {
  tonic: 47,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [7, 22], level: 0.07 }, reverb: 0.6 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'sho' }, harp: { density: 0.25, range: [5, 19], level: 0.15, timbre: 'kithara' }, reverb: 0.85 },
  },
};
