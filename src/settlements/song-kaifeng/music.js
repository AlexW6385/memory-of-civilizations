// Music of Northern Song Bianjing (docs/settlements/song-kaifeng.md §9): the guqin and the pipa, a
// dizi above, temple bells (a plucked string, the ney and a reed organ stand in), pentatonic.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.3, range: [2, 21], level: 0.18, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.16, range: [9, 21], level: 0.06 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.2, range: [0, 17], level: 0.15, timbre: 'koto' }, reverb: 0.75 },
  },
};
