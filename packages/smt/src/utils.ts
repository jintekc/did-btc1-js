// Shared utility functions: sha256, big-endian 64-bit encoding, etc.

import { createHash } from 'crypto';

/**
 * sha256 returns a 32-byte SHA-256 digest of the concatenated inputs.
 * In Go, the equivalent is sha256.New() + Write(...).
 */
export function sha256(...inputs: (Uint8Array | Buffer)[]): Uint8Array {
  const hash = createHash('sha256');
  for (const data of inputs) {
    hash.update(data);
  }
  return new Uint8Array(hash.digest());
}

/**
 * encodeBigUint64BE encodes a 64-bit unsigned bigint into an 8-byte
 * buffer in big-endian order.
 */
export function encodeBigUint64BE(value: bigint): Uint8Array {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(value);
  return buf;
}

/**
 * bufferEq returns true if both Uint8Arrays have the same length and contents.
 */
export function bufferEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * bitIndex extracts the i-th bit (0 or 1) from a 256-bit key (assuming i in [0..255]).
 * This is used in the compacted-leaf logic and typical SMT insertion/lookup code.
 *
 * - bytePos = i >>> 3     -> i / 8
 * - bitPos  = 7 - (i & 7) -> offset from the left
 */
export function bitIndex(i: number, key: Uint8Array): number {
  const bytePos = i >>> 3;
  const bitPos = 7 - (i & 0x07);
  return (key[bytePos] >> bitPos) & 0x01;
}

/**
 * makeKey creates a 32-byte key with the last 4 bytes set to the given number.
 */
export function makeKey(num: number): Uint8Array {
  const key = new Uint8Array(32);
  // Put the numeric value in the last 4 bytes, for example
  key[28] = (num >>> 24) & 0xff;
  key[29] = (num >>> 16) & 0xff;
  key[30] = (num >>> 8) & 0xff;
  key[31] = num & 0xff;
  return key;
}
