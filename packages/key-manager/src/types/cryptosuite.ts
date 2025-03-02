import { CryptosuiteJcs } from '../../lib/jcs.js';
import { CryptosuiteRdfc } from '../../lib/rdfc.js';
import { Multikey } from '../di-bip340/index.js';
import { DataIntegrityProofType, InsecureDocument, ProofOptions, SecureDocument } from './di-proof.js';

/** Types */
export type ProofOptionsParam = { options: ProofOptions }
export type InsecureDocumentParams = ProofOptionsParam & {
  document: InsecureDocument
}
export type SecureDocumentParams = ProofOptionsParam & {
  document: SecureDocument
};
export type DocumentParams = {
  document:
    | InsecureDocument
    | SecureDocument
}
export type CanonicalizableObject = Record<string, any>;
export type TransformParams = DocumentParams & ProofOptionsParam;
export type SerializeParams = {
  hashData: string;
  options: ProofOptions;
};
export type VerificationParams = {
  hashData: string;
  proofBytes: Uint8Array;
  options: ProofOptions;
}
export type GenerateHashParams = {
  canonicalProofConfig: string;
  canonicalDocument: string
}
export type CryptosuiteType = 'schnorr-secp256k1-jcs-2025' | 'schnorr-secp256k1-rdfc-2025';
export type Cryptosuite = CryptosuiteJcs | CryptosuiteRdfc;

/** Interfaces */
export interface CryptosuiteParams {
  type?: DataIntegrityProofType;
  cryptosuite: CryptosuiteType;
  multikey: Multikey;
}