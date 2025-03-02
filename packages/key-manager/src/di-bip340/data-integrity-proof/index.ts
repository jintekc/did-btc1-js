import { AddProofParams, Proof, SecureDocument, VerificationResult, VerifyProofParams } from '../../types/di-proof.js';
import { Cryptosuite } from '../cryptosuite/index.js';
import { IDataIntegrityProof } from './interface.js';

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#dataintegrityproof | 2.2.1 DataIntegrityProof}
 * of the {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity BIP-340 Cryptosuite} spec
 * @export
 * @class DataIntegrityProof
 * @type {DataIntegrityProof}
 * @implements {IDataIntegrityProof}
 */
export class DataIntegrityProof implements IDataIntegrityProof {
  /** @type {Cryptosuite} The cryptosuite to use for proof generation and verification. */
  public cryptosuite: Cryptosuite;

  /**
   * Creates an instance of DataIntegrityProof.
   * @constructor
   * @param {Cryptosuite} cryptosuite The cryptosuite to use for proof generation and verification.
   */
  constructor(cryptosuite: Cryptosuite) {
    this.cryptosuite = cryptosuite;
  }

  /** @see IDataIntegrityProof.addProof */
  public async addProof({ document, options }: AddProofParams): Promise<SecureDocument> {
    // Create a copy of the document
    const secure = document as SecureDocument;

    // Generate the proof
    const proof = await this.cryptosuite.createProof({ document: secure, options });

    // Deconstruct the proof object
    const { type, verificationMethod, proofPurpose } = proof;

    // Check if the type, verificationMethod, and proofPurpose are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Error('PROOF_GENERATION_ERROR');
    }

    // Deconstruct the proof object
    const { domain } = proof;
    // Check if the domain is defined and if it matches the domain
    if (options.domain && options.domain !== domain) {
      throw new Error('PROOF_GENERATION_ERROR');
    }

    // Deconstruct the proof object
    const { challenge } = proof;
    // Check if the challenge is defined and if it matches the challenge
    if (options.challenge && options.challenge !== challenge) {
      throw new Error('PROOF_GENERATION_ERROR');
    }

    // Set the proof in the secure document and return it
    secure.proof = proof;
    return secure;
  }

  /** @see IDataIntegrityProof.verifyProof */
  public async verifyProof(params: VerifyProofParams): Promise<VerificationResult> {
    // Deconstruct the params object
    const { mediaType, document, expectedPurpose, expectedDomain, expectedChallenge } = params;

    // Parse the document
    const secure = JSON.parse(document) as SecureDocument;

    // Deconstruct the secure object to get the proof
    const { proof }: { proof: Proof } = secure;

    // Check if the proof object is an object
    if (typeof secure !== 'object' || typeof proof !== 'object') {
      throw new Error('PARSING_ERROR');
    }

    // Deconstruct the proof object
    const { type, proofPurpose, verificationMethod, challenge, domain } = proof;
    // Check if the type, proofPurpose, and verificationMethod are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Error('PROOF_VERIFICATION_ERROR');
    }

    // Check if the expectedPurpose is defined and if it matches the proofPurpose
    if (expectedPurpose && expectedPurpose !== proofPurpose) {
      throw new Error('PROOF_VERIFICATION_ERROR');
    }

    // Check if the expectedChallenge is defined and if it matches the challenge
    if (expectedChallenge && expectedChallenge !== challenge) {
      throw new Error('INVALID_CHALLENGE_ERROR');
    }

    // Check if the expectedDomain length matches the proof.domain length
    if(expectedDomain && expectedDomain?.length !== domain?.length) {
      throw new Error('INVALID_DOMAIN_ERROR');
    }

    // If defined, check that each entry in expectedDomain can be found in proof.domain
    if(expectedDomain && !expectedDomain?.every(url => domain?.includes(url))) {
      throw new Error('INVALID_DOMAIN_ERROR');
    }

    // Verify the proof
    const verificationResult = await this.cryptosuite.verifyProof(secure);

    // Add the mediaType to the verification result
    verificationResult.mediaType = mediaType;

    // Return the verification result
    return verificationResult;
  }
}