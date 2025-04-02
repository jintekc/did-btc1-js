// A high-level "Tree" class that manages an MS-SMT of 256-bit keys
// using the underlying node/branch structures. In a real design,
// we might store only changed branches in a key-value store. Here,
// we keep everything in memory for simplicity, focusing on design patterns.

import { Node } from './node.js';
import { NodeFactory } from './factory.js';
import { bitIndex } from './utils.js'; // you'd implement or import bitIndex
import { Leaf } from './leaf.js';

export class SparseMerkleTree {
  // The root node of our MS-SMT. Initially empty (flyweight).
  private root: Node;

  constructor(
    private factory: NodeFactory,
    private treeHeight = 256
  ) {
    this.root = this.factory.createEmptyLeaf();
  }

  /**
   * insert simulates placing a new leaf in the tree at the position
   * determined by the 256-bit key. We'll do a simple recursive approach:
   */
  public insert(key: Uint8Array, value: Uint8Array, sum: bigint): void {
    // Build a new leaf node:
    const newLeaf = this.factory.createLeaf(value, sum);
    this.root = this.insertNode(this.root, key, 0, newLeaf);
  }

  /**
   * delete sets a leaf to the "empty" leaf node, effectively removing it.
   */
  public delete(key: Uint8Array): void {
    const emptyLeaf = this.factory.createEmptyLeaf();
    this.root = this.insertNode(this.root, key, 0, emptyLeaf);
  }

  /**
   * getRootHash returns the MS-SMT root hash after all insertions/deletions.
   */
  public getRootHash(): Uint8Array {
    return this.root.getHash();
  }

  /**
   * getRootSum returns the sum of all leaves in the tree.
   */
  public getRootSum(): bigint {
    return this.root.getSum();
  }

  /**
   * (Recursive) insertNode:
   * If we reach the bottom (treeHeight), return the newLeaf.
   * Otherwise, decide left or right by checking bitIndex at `level`.
   */
  private insertNode(
    current: Node,
    key: Uint8Array,
    level: number,
    newLeaf: Node
  ): Node {
    // If we've reached a leaf or empty node and are at the bottom:
    if (level >= this.treeHeight) {
      return newLeaf;
    }

    // If this node is a leaf but we haven't used up all bits,
    // we effectively turn it into a branch. We'll handle it by
    // artificially building a branch with the existing leaf
    // in the correct direction.
    if (current instanceof Leaf && !current.isEmpty() && level < this.treeHeight) {
      // We'll see which side it belongs on, then create a branch.
      // const existingKey = current.getHash();
      // In practice, you'd store the actual "key" in the leaf
      // or have a separate map from "key -> leaf data" for a real design.
      // Here, let's assume `existingKey` is a placeholder or skip this step.
    }

    const direction = bitIndex(level, key);
    if (current instanceof Leaf && current.isEmpty()) {
      // If it's empty and we haven't reached the bottom, keep recursing:
      // We'll create an "empty" branch structure on the fly.
      // For simplicity, let's just treat it like a branch with empty children.
      const leftEmpty = this.factory.createEmptyLeaf();
      const rightEmpty = this.factory.createEmptyLeaf();
      current = this.factory.createBranch(leftEmpty, rightEmpty);
    }

    // If current is a BranchNode, we need to replace the correct child:
    if ('getLeftChild' in current && 'getRightChild' in current) {
      const branch = current as any;
      const leftChild = branch.getLeftChild();
      const rightChild = branch.getRightChild();
      if (direction === 0) {
        const newLeft = this.insertNode(leftChild, key, level + 1, newLeaf);
        return this.factory.createBranch(newLeft, rightChild);
      } else {
        const newRight = this.insertNode(rightChild, key, level + 1, newLeaf);
        return this.factory.createBranch(leftChild, newRight);
      }
    }

    // Fallback (shouldn't happen in typical usage):
    return newLeaf;
  }
}
