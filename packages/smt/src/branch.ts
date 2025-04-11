// A Branch references left/right child Nodes, combining their
// hashes + sums in a merkle-sum manner.

import { Node } from './node.js';
import { HashStrategy } from './hashing.js';

export class Branch implements Node {
  private hashCache: Uint8Array | null = null;
  private sumCache: bigint | null = null;

  constructor(
    private leftChild: Node,
    private rightChild: Node,
    private hasher: HashStrategy
  ) {}

  public getHash(): Uint8Array {
    if (this.hashCache) {
      return this.hashCache;
    }
    const leftHash = this.leftChild.getHash();
    const rightHash = this.rightChild.getHash();

    // We'll also incorporate the sum in the final digest for the MS-SMT.
    const sumBuf = Branch.encodeBigUint64BE(this.getSum());

    const h = this.hasher.digest(leftHash, rightHash, sumBuf);
    this.hashCache = h;
    return h;
  }

  public getSum(): bigint {
    if (this.sumCache !== null) {
      return this.sumCache;
    }
    const sumVal = this.leftChild.getSum() + this.rightChild.getSum();
    this.sumCache = sumVal;
    return sumVal;
  }

  public copy(): Node {
    // If we want partial references, we could store only hash+sum
    // (a "ComputedNode" concept). For simplicity, do a full copy:
    const newLeft = this.leftChild.copy();
    const newRight = this.rightChild.copy();
    const clone = new Branch(newLeft, newRight, this.hasher);

    if (this.hashCache) {
      clone.hashCache = new Uint8Array(this.hashCache);
    }
    if (this.sumCache !== null) {
      clone.sumCache = this.sumCache;
    }
    return clone;
  }

  public getLeftChild(): Node {
    return this.leftChild;
  }

  public getRightChild(): Node {
    return this.rightChild;
  }

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
