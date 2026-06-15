/**
 * A stylised side-profile brain silhouette (facing left): bumpy cerebrum,
 * frontal-lobe bulge, occipital back, a cerebellum lobe and a short brain stem.
 * Shared by the static SVG fallback (BrainGraphic) and the particle sampler
 * (BrainParticles) so the cloud and the fallback are the same shape.
 */
export const BRAIN_VIEWBOX = { w: 300, h: 210 }

// Outer cerebrum + cerebellum + stem (filled).
export const BRAIN_PATH =
  'M52,150 C30,142 20,112 31,88 C39,69 55,57 73,52 C82,38 104,32 119,42 ' +
  'C128,28 152,28 162,43 C175,31 199,33 207,49 C224,42 244,54 250,74 ' +
  'C261,88 261,106 252,119 C266,121 274,136 265,150 C258,161 243,163 233,156 ' +
  'C231,171 224,185 215,184 C208,183 207,170 210,156 C195,159 178,157 166,152 ' +
  'C138,157 98,159 71,152 C62,150 56,151 52,150 Z'

// A few interior sulci (fold) strokes, for the SVG fallback's texture only.
export const BRAIN_SULCI = [
  'M70,96 C100,86 130,92 150,80 C172,68 196,74 214,70',
  'M64,118 C96,112 120,120 150,110 C182,99 210,108 236,100',
  'M96,140 C120,134 146,140 172,132 C196,125 214,130 230,128',
  'M150,80 C150,104 150,128 150,150',
]
