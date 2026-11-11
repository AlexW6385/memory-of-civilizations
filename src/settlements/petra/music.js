// Music of Nabataea (docs/settlements/petra.md §9): caravan music of Arabia — lyres, pipes, frame
// drums, little known; a lyre, a reed pipe and a drone stand in.
export default {
  tonic: 47,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [7, 22], level: 0.07 }, reverb: 0.6 },
    // the shops: hardly more than a lyre's few notes from the next stall
    shop: { harp: { density: 0.1, range: [5, 17], level: 0.1, timbre: 'kithara' }, reverb: 0.5 },
    // the houses: a lone lyre, slow and soft
    house: { harp: { density: 0.14, range: [0, 12], level: 0.12, timbre: 'kithara' }, drone: { notes: [-12], level: 0.03, timbre: 'sho' }, reverb: 0.7 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'sho' }, harp: { density: 0.25, range: [5, 19], level: 0.15, timbre: 'kithara' }, reverb: 0.85 },
  },
};
