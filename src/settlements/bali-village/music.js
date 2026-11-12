// Music of the Balinese village (docs/settlements/bali-village.md §8): the gamelan's bronze (a plucked string stands for the metallophones, a drum and bells for the
// kendang and the gongs), a bamboo flute (the ney); a pelog-like five-note scale (the engine has no seven-note one) on E.
export default {
  tonic: 52,
  scale: [0, 1, 3, 7, 8],
  tempo: 84,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.03, timbre: 'sho' }, harp: { density: 0.5, range: [5, 24], level: 0.15, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.12, range: [12, 24], level: 0.05 }, bells: { every: 8, level: 0.08 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.7, range: [5, 24], level: 0.17, timbre: 'koto' }, drum: { pattern: [1, 0, 0.5, 0.6, 0, 0.5, 0.8, 0], every: 1, level: 0.05 }, bells: { every: 4, level: 0.1 }, reverb: 0.6 },
    market: { drone: { notes: [-12, -5], level: 0.025, timbre: 'sho' }, harp: { density: 0.75, range: [5, 24], level: 0.16, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.2, range: [12, 24], level: 0.06 }, drum: { pattern: [1, 0, 0.6, 0.5, 0, 0.7, 0.4, 0.5], every: 1, level: 0.04 }, bells: { every: 4, level: 0.09 }, reverb: 0.35 },
    inner: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.12, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.1, range: [12, 22], level: 0.04 }, bells: { every: 6, level: 0.1 }, reverb: 0.55 },
    house: { harp: { density: 0.18, range: [5, 19], level: 0.1, timbre: 'koto' }, reverb: 0.4 },
  },
};
