import { CryptosuiteType } from './cryptosuite.js';
import { Btc1Identifier } from './shared.js';

/** Types */
export type DataIntegrityProofType = 'DataIntegrityProof';
export type InsecureDocument = Record<string | number | symbol, any>;
export type SecureDocument = InsecureDocument & { proof: Proof };
export type ContextObject = Record<string | number | symbol, any>;
export type Context = string | string[] | ContextObject | ContextObject[]
export type ProofOptions = Partial<Proof>;
export type AddProofParams = { document: InsecureDocument, options: ProofOptions };
export type CanonicalizedProofConfig = string;

/** Interfaces */
export interface Proof {
  '@context': Context;
  type?: DataIntegrityProofType;
  '@type'?: DataIntegrityProofType;
  cryptosuite: CryptosuiteType;
  verificationMethod: `${Btc1Identifier}#initialKey`;
  proofPurpose: string;
  proofValue: string;
  domain?: string[];
  challenge?: string;
}
export interface VerifyProofParams {
  mediaType?: string;
  document: string;
  expectedPurpose: string;
  expectedDomain?: string[];
  expectedChallenge?: string;
};
export interface VerificationResult {
  verified: boolean;
  verifiedDocument?: SecureDocument;
  mediaType?: string;
}
