// Music of the Bauhaus (docs/settlements/bauhaus-dessau.md §9): a brisk 1920s foxtrot-like tune over a major scale — the Bauhaus band's jazz in the
// Aula, the saw and the loom's beat in the workshops (the ambience), the studios and the library quiet.
export default {
  tonic: 55,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 118,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.02, timbre: 'sho' }, harp: { density: 0.3, range: [0, 14], level: 0.1, timbre: 'kithara' }, reverb: 0.25 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.18, range: [0, 12], level: 0.04 }, reverb: 0.55 },
    workshop: { harp: { density: 0.2, range: [0, 12], level: 0.08, timbre: 'kithara' }, reverb: 0.4 },
    aula: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.65, range: [-5, 12], level: 0.14, timbre: 'kithara' }, lead: { timbre: 'reed', density: 0.5, range: [2, 16], level: 0.07, rhythm: [1, 0.5, 0.5, 1] }, drum: { pattern: [1, 0, 0.5, 0, 1, 0, 0.5, 0.4], every: 1, level: 0.05 }, reverb: 0.7 },
    studio: { drone: { notes: [-12, 0], level: 0.02, timbre: 'sho' }, reverb: 0.4 },
  },
};
