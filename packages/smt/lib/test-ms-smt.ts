import { NodeFactory } from '../src/factory.js';
import { Sha256Strategy } from '../src/hashing.js';
import { initEmptyLeaf } from '../src/leaf.js';
import { SparseMerkleTree } from '../src/smt.js';


// 1) Choose a HashStrategy
const hasher = new Sha256Strategy();

// 2) Initialize the empty leaf flyweight with that strategy
initEmptyLeaf(hasher);

// 3) Create a factory
const factory = new NodeFactory(hasher);

// 4) Create our MS-SMT
const tree = new SparseMerkleTree(factory, 256);

// 5) Insert items
// We'll treat the "key" as a 32-byte array. This is just an example:
const keyA = new Uint8Array(32);
keyA[31] = 0xA0; // set last byte for uniqueness
tree.insert(keyA, new TextEncoder().encode('Hello'), 42n);

const keyB = new Uint8Array(32);
keyB[31] = 0xB0;
tree.insert(keyB, new TextEncoder().encode('World'), 100n);

// 6) Observe the new root
console.log('Root Hash:', Buffer.from(tree.getRootHash()).toString('hex'));
console.log('Root Sum:', tree.getRootSum().toString());

// 7) Delete item at keyA
tree.delete(keyA);

console.log('Root Hash after deletion:', Buffer.from(tree.getRootHash()).toString('hex'));
console.log('Root Sum after deletion:', tree.getRootSum().toString());