import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { SparseMerkleTree } from '../src/smt.js';
import { NodeFactory } from '../src/factory.js';
import { Sha256Strategy } from '../src/hashing.js';
import { initEmptyLeaf, EMPTY_LEAF } from '../src/leaf.js';
import { makeKey } from '../src/utils.js';

describe('SparseMerkleTree', () => {
  let tree: SparseMerkleTree;
  let factory: NodeFactory;

  before(() => {
    // 1) Create a HashStrategy
    const hasher = new Sha256Strategy();

    // 2) Initialize our flyweight empty leaf
    initEmptyLeaf(hasher);
    expect(EMPTY_LEAF.isEmpty()).to.equal(true);

    // 3) Create a node factory
    factory = new NodeFactory(hasher);

    // 4) Initialize the tree
    tree = new SparseMerkleTree(factory, 256);
  });

  it('should start with an empty root', () => {
    const rootHash = tree.getRootHash();
    const rootSum = tree.getRootSum();
    // The root should be the empty leaf at first:
    expect(rootHash).to.be.instanceOf(Uint8Array);
    expect(rootHash.length).to.equal(32);
    expect(rootSum).to.equal(0n);
  });

  it('should insert a single leaf correctly', () => {
    const keyA = makeKey(100); // some unique key
    const valueA = new TextEncoder().encode('Hello, MS-SMT!');
    const sumA = 42n;

    tree.insert(keyA, valueA, sumA);

    const rootHash = tree.getRootHash();
    const rootSum = tree.getRootSum();

    expect(rootHash).to.be.instanceOf(Uint8Array);
    expect(rootHash.length).to.equal(32);
    expect(rootSum).to.equal(sumA, 'Root sum should match inserted leaf sum');
  });

  it('should insert multiple leaves and reflect correct root sum', () => {
    const keyB = makeKey(200);
    const valueB = new TextEncoder().encode('Another leaf');
    const sumB = 100n;

    // Insert second leaf
    tree.insert(keyB, valueB, sumB);

    const rootHash = tree.getRootHash();
    const rootSum = tree.getRootSum();

    expect(rootHash).to.be.instanceOf(Uint8Array);
    expect(rootHash.length).to.equal(32);
    // The total sum should now be 42 + 100 = 142
    expect(rootSum).to.equal(142n);
  });

  it('should update an existing leaf if re-inserted with new sum', () => {
    const keyB = makeKey(200); // same key as before
    const newSum = 500n;       // change sum from 100n to 500n

    // Insert same key with a new sum
    tree.insert(keyB, new TextEncoder().encode('Updated sum'), newSum);

    const rootSum = tree.getRootSum();
    // We originally had 42 + 100 = 142 from two leaves.
    // Now the second leaf's sum is updated from 100 to 500.
    // So total sum = 42 + 500 = 542
    expect(rootSum).to.equal(542n);
  });

  it('should delete a leaf and update the root sum', () => {
    const keyA = makeKey(100); // from the first insertion

    // Before deleting: the total sum is 42 + 500 = 542
    tree.delete(keyA);

    const rootHash = tree.getRootHash();
    const rootSum = tree.getRootSum();

    // Only the second leaf with sum=500 remains
    expect(rootSum).to.equal(500n);
    // Root hash should still be 32 bytes, but changed after deletion
    expect(rootHash.length).to.equal(32);
  });

  it('should handle re-inserting a deleted key', () => {
    const keyA = makeKey(100);
    const sumA2 = 99n;

    tree.insert(keyA, new TextEncoder().encode('Re-inserted'), sumA2);

    const finalRootSum = tree.getRootSum();
    // Now we have keyA(99) + keyB(500) = 599
    expect(finalRootSum).to.equal(599n);
  });
});
