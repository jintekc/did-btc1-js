// The base "Component" of our Composite pattern. Both leaves and branches
// will implement MsSmtNode.

export interface Node {
    /** getHash returns the Merkle hash of this node. */
    getHash(): Uint8Array;

    /** getSum returns the 64-bit sum that this node contributes upward. */
    getSum(): bigint;

    /**
     * copy performs a deep copy (or "computed" reference).
     * In real usage, you might store partial subtrees or do a shallow copy.
     */
    copy(): Node;
  }
