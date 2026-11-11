// Music of Abbasid Baghdad (docs/settlements/abbasid-baghdad.md §10): the oud, the ney, the rabab and the frame drum, a maqam of the
// hijaz kind over a drone; the call to prayer from the mosque's roof (a voice stands in).
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.22, range: [5, 17], level: 0.07 }, harp: { density: 0.18, range: [0, 14], level: 0.1, timbre: 'oud' }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'voice', density: 0.2, range: [7, 19], level: 0.07 }, harp: { density: 0.25, range: [0, 12], level: 0.14, timbre: 'oud' }, reverb: 0.9 },
  },
};
