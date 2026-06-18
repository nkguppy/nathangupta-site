// Baked-mesh metadata for the WebGL surface brain (SurfaceBrain.tsx).
// The geometry is the binary at /brain_lo.bin (public/), fetched lazily at runtime
// — NEVER inlined. This is a vertex-clustered decimation of the full FreeSurfer
// pial mesh (290k→62k verts) baked by /tmp/brainlab/decimate.mjs: 1.5 MB instead
// of 9.4 MB (~6.5x smaller → fast load + GPU upload + first frame), visually
// identical at hero scale + bloom. Indices are Uint16 (verts < 65536).
//
// Layout of brain_lo.bin:
//   [Int16  pos  3*V]  @ off.pos    — normalized → [-1,1]
//   [Int8   nrm  3*V]  @ off.nrm    — normalized → [-1,1]
//   [Int8   curv 1*V]  @ off.curv   — normalized → [-1,1] (+gyrus / -sulcus)
//   [pad to 2]
//   [Uint16 idx  3*F]  @ off.idx
export const BRAIN_MESH = {
  url: '/brain_lo.bin',
  V: 61590,
  F: 160548,
  idxType: 'uint16' as const,
  off: { pos: 0, nrm: 369540, curv: 554310, idx: 615900 },
  bytes: 1579188,
} as const
