// Music of Northern Song Bianjing (docs/settlements/song-kaifeng.md §9 and §11, "Sound"). The score's
// zones are the room kinds of the plans: in the open, the street and the river, the pipa of the
// street singers and a dizi above; in the monastery's halls, the chanted sutra over a drone, the
// wooden fish and the bowl-bell; in a tea house the pipa and a voice, a clapper keeping time; in a
// tavern the singing girls' pipa and voice over a hand drum, livelier; in an inn a low drone and a
// few notes; in a shop little but a clapper now and then; in a house the guqin alone, slow, sparse.
// Stand-ins in the engine: a plucked string (pipa, koto for the guqin), the ney for the dizi, a reed
// organ (sho) for the sheng's drone, the voice formants for song and chant. Pentatonic (gong mode).
export default {
  tonic: 50,                              // D3
  scale: [0, 2, 4, 7, 9],
  tempo: 58,
  zones: {
    // the street and the river: the pipa of the wandering singers, a dizi above, a breath of sheng below
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.3, range: [2, 21], level: 0.18, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.16, range: [9, 21], level: 0.06 }, reverb: 0.45 },
    // the halls (the monastery's gate hall and main hall): the chant, the wooden fish, the bowl-bell
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.8, range: [0, 12], level: 0.12, rhythm: [1, 1, 1, 1, 2] }, woodfish: { level: 0.14 }, qing: { every: 40, level: 0.18 }, reverb: 0.75 },
    // the tea house: a story-singer's voice over the pipa, the clapper; the better houses were quiet and elegant
    tea: { harp: { density: 0.3, range: [3, 17], level: 0.15, timbre: 'pipa' }, lead: { timbre: 'voice', density: 0.4, range: [7, 17], level: 0.09, rhythm: [2, 1, 1, 2, 1] }, drum: { pattern: [1, 0, 0, 0, 0.5, 0, 0, 0], every: 2, level: 0.05 }, reverb: 0.4 },
    // the tavern: the singing girls' pipa and voice, a hand drum, a brighter run of notes
    tavern: { harp: { density: 0.5, range: [5, 22], level: 0.17, timbre: 'pipa' }, lead: { timbre: 'voice', density: 0.5, range: [9, 19], level: 0.1, rhythm: [1, 1, 2, 1, 1] }, drum: { pattern: [1, 0, 0.5, 0, 0.7, 0, 0.5, 0.4], every: 1, level: 0.07 }, reverb: 0.4 },
    // the inn: a low drone, now and then a string
    inn: { drone: { notes: [-12, -5], level: 0.03, timbre: 'sho' }, harp: { density: 0.12, range: [0, 12], level: 0.12, timbre: 'koto' }, reverb: 0.5 },
    // the shop: hardly music; the clapper of the next street
    shop: { harp: { density: 0.08, range: [5, 17], level: 0.08, timbre: 'pipa' }, drum: { pattern: [0, 0, 0, 0, 0.6, 0, 0, 0], every: 4, level: 0.03 }, reverb: 0.35 },
    // the house: the guqin, slow and sparse
    house: { harp: { density: 0.16, range: [0, 14], level: 0.14, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.06, range: [7, 17], level: 0.04 }, reverb: 0.5 },
  },
};
