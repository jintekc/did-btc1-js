// Contains general constants and placeholders for the MS-SMT logic.

export const HASH_SIZE = 32;

/**
 * ZeroNodeHash is a 32‑byte array of all zeroes,
 * analogous to Go’s ZeroNodeHash in mssmt.go.
 */
export const ZERO_NODE_HASH = new Uint8Array(HASH_SIZE);

/** The maximum depth for a 256-bit key (one bit per level). */
export const MAX_TREE_LEVELS = 256;
