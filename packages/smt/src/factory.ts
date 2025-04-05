// Simple factory that helps us create Nodes in a uniform way.
// We might also create "computed" nodes or specialized variants.

import { Node } from './node.js';
import { Leaf, EMPTY_LEAF } from './leaf.js';
import { Branch } from './branch.js';
import { HashStrategy } from './hashing.js';

export class NodeFactory {
  constructor(private hasher: HashStrategy) {}

  public createLeaf(value: Uint8Array, sum: bigint): Leaf {
    return new Leaf(value, sum, this.hasher);
  }

  public createEmptyLeaf(): Leaf {
    // Return the flyweight empty leaf.
    return EMPTY_LEAF;
  }

  public createBranch(left: Node, right: Node): Branch {
    return new Branch(left, right, this.hasher);
  }
}
