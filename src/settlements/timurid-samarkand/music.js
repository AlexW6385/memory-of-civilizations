// Music of Timurid Samarkand (docs/settlements/timurid-samarkand.md §11): a plucked long-necked lute (dutar, here the oud's
// voice) and a reed flute over a drone, in a mode of the Central Asian maqam (a lowered second and a raised seventh).
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 11],
  tempo: 62,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, harp: { density: 0.34, range: [5, 24], level: 0.16, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.2, range: [7, 19], level: 0.07 }, reverb: 0.35 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.24, range: [5, 20], level: 0.13, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.3, range: [7, 19], level: 0.09 }, reverb: 0.8 },
  },
};
