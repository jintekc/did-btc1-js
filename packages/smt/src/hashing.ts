// A simple Strategy interface for hashing. We implement a default
// Sha256Strategy here, but we could swap it out for another algorithm.

import { createHash } from 'crypto';

export interface HashStrategy {
  digest(...inputs: Uint8Array[]): Uint8Array;
}

export class Sha256Strategy implements HashStrategy {
  digest(...inputs: Uint8Array[]): Uint8Array {
    const hash = createHash('sha256');
    for (const data of inputs) {
      hash.update(data);
    }
    return new Uint8Array(hash.digest());
  }
}
