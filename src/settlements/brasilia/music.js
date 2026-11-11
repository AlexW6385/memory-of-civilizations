// Music of Brasília (docs/settlements/brasilia.md §9): the bossa nova of the 1960s — the nylon guitar's soft seventh chords, a
// light reed, a sustained voice in the Cathedral (an oud and a reed stand in for guitar and flute); a major scale with its
// seventh and sixth, the tempo of the samba's cousin.
const scale = [0, 2, 4, 7, 9, 11];
export const congressMusic = {
  tonic: 53,
  scale,
  tempo: 116,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.025, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.3, range: [4, 16], level: 0.055 }, harp: { density: 0.5, range: [-12, 6], level: 0.13, timbre: 'oud' }, reverb: 0.3 },
    hall: { drone: { notes: [-24, -12, -5], level: 0.05, timbre: 'voice' }, lead: { timbre: 'reed', density: 0.2, range: [0, 12], level: 0.05 }, reverb: 0.75 },
  },
};
export const cathedralMusic = {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.15, range: [7, 19], level: 0.05 }, reverb: 0.5 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.18, range: [0, 14], level: 0.06 }, reverb: 0.95 },
  },
};
export default congressMusic;
