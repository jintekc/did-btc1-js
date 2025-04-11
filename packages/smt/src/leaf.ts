// A leaf node that commits to a `value` (bytes) and an associated 64-bit sum.

import { Node } from './node.js';
import { HashStrategy } from './hashing.js';

// We'll also define a single "flyweight" empty leaf node:
export let EMPTY_LEAF: Leaf; // assigned at bottom

export class Leaf implements Node {
  private hashCache: Uint8Array | null = null;

  constructor(
    private value: Uint8Array,
    private sumValue: bigint,
    private hasher: HashStrategy
  ) {}

  public getHash(): Uint8Array {
    if (this.hashCache) {
      return this.hashCache;
    }
    // Encode the sum as 8 bytes (big-endian).
    const sumBuf = Leaf.encodeBigUint64BE(this.sumValue);
    const h = this.hasher.digest(this.value, sumBuf);
    this.hashCache = h;
    return h;
  }

  public getSum(): bigint {
    return this.sumValue;
  }

  public copy(): Node {
    const valueCopy = new Uint8Array(this.value);
    const clone = new Leaf(valueCopy, this.sumValue, this.hasher);
    // If we've computed hashCache, replicate it:
    if (this.hashCache) {
      clone.hashCache = new Uint8Array(this.hashCache);
    }
    return clone;
  }

  public isEmpty(): boolean {
    return this.value.length === 0 && this.sumValue === 0n;
  }

  // Big-endian encoding helper:
  private static encodeBigUint64BE(value: bigint): Uint8Array {
    const buf = new Uint8Array(8);
    let tmp = value;
    for (let i = 7; i >= 0; i--) {
      buf[i] = Number(tmp & 0xffn);
      tmp >>= 8n;
    }
    return buf;
  }
}

// Initialize and export the "flyweight" empty leaf:
export function initEmptyLeaf(hasher: HashStrategy) {
  EMPTY_LEAF = new Leaf(new Uint8Array(0), 0n, hasher);
}
