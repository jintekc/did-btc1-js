export type CanonicalizedProofConfig = string;
export type CryptosuiteName = 'bip340-jcs-2025' | 'bip340-rdfc-2025';
export type ContextObject = Record<string | number | symbol, any>;
export type Context = string | string[] | ContextObject | ContextObject[]

export interface PatchOperation {
    op: string; // 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
    path: string;
    value?: any; // Required for add, replace, test
    from?: string; // Required for move, copy
}
export interface DidUpdatePayload {
    '@context': string[];
    patch: PatchOperation[];
    sourceHash: string;
    targetHash: string;
    targetVersionId: number;
    proof?: Proof;
}
export interface DidUpdateInvocation extends DidUpdatePayload {
    proof: Proof;
}
export interface ProofOptions {
  type?: string;
  cryptosuite?: string;
  verificationMethod?: string;
  proofPurpose?: string;
  capability?: string;
  capabilityAction?: string;
  domain?: string[];
  challenge?: string;
  created?: string;
}
export interface Proof {
  '@context': Context;
  '@type'?: 'DataIntegrityProof';
  type?: 'DataIntegrityProof';
  created?: string;
  cryptosuite: 'jcs' | 'rdfc';
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
  domain?: string[];
  challenge?: string;
  capability?: string;
  capabilityAction?: string;
}