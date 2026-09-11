/**
 * The toy-world palette: sun-bleached sand, whitewashed plaster, terracotta.
 *
 * Every surface in the game is flat-shaded MeshLambertMaterial — no textures,
 * no normal maps. On flat-faced low-poly geometry it looks like painted wood,
 * and it is about as cheap as lit rendering gets on a phone.
 *
 * Sky, fog and sand all sit within a few percent of each other. That's
 * deliberate: it lets smoke and scorch marks fade by lerping toward the haze
 * instead of by alpha, which keeps hundreds of particles out of the
 * transparency sort.
 */
export const PALETTE = {
  sky: 0xe9dcbd,
  fog: 0xe4d3b0,
  sand: 0xd9c39a,
  road: 0xc0a87f,
  plaza: 0xcfba92,

  wall: [0xefe3c7, 0xe3d4b1, 0xd4c19d, 0xc7b28b],
  /** Four clay roof tones. Seen from near top-down on a phone the roofs are
   *  most of what you look at, so they carry the variation. */
  roof: [0xc08256, 0xb0704a, 0xc8946a, 0xa96c48],
  rubble: 0xa1917a,

  palmTrunk: 0x8a6a45,
  palmFrond: [0x6f8f4a, 0x7e9b52, 0x5f7f42],
  stallCanopy: [0xb7553f, 0x46707d, 0xc58a3d, 0x7a6a9a],

  /** Civilians vary slightly so a crowd doesn't look cloned. */
  civilianAlt: [0xf0ece1, 0xe4dccb, 0xd9cfbb, 0xeae2d0],
  terroristBody: 0x4b4239,
  rifle: 0x24211d,
  corpse: 0x9c9184,
  /** Flash colour when a mourner stands up radicalised. */
  blood: 0x8e3a2c,

  crater: 0x6f6047,
  fireCore: 0xfff3c4,
  fireMid: 0xff9a3c,
  fireEdge: 0xd4502a,
  smoke: 0x6f6558,

  crosshair: 0x2b2520,
  crosshairArmed: 0xa8321f,
} as const
