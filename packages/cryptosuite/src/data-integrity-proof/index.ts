import { Btc1Error, DidUpdateInvocation, INVALID_CHALLENGE_ERROR, INVALID_DOMAIN_ERROR, Logger, ObjectUtils, Proof, PROOF_GENERATION_ERROR, PROOF_PARSING_ERROR, PROOF_VERIFICATION_ERROR, } from '@did-btc1/common';
import { Cryptosuite } from '../cryptosuite/index.js';
import { VerificationResult } from '../cryptosuite/interface.js';
import { AddProofParams, IDataIntegrityProof } from './interface.js';

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#dataintegrityproof | 2.2.1 DataIntegrityProof}
 * of the {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity BIP-340 Cryptosuite} spec
 * @class DataIntegrityProof
 * @type {DataIntegrityProof}
 */
export class DataIntegrityProof implements IDataIntegrityProof {
  /** @type {Cryptosuite} The cryptosuite to use for proof generation and verification. */
  public cryptosuite: Cryptosuite;

  /**
   * Creates an instance of DataIntegrityProof.
   *
   * @param {Cryptosuite} cryptosuite The cryptosuite to use for proof generation and verification.
   */
  constructor(cryptosuite: Cryptosuite) {
    this.cryptosuite = cryptosuite;
  }

  /** @see IDataIntegrityProof.addProof */
  public async addProof({ document, options }: AddProofParams): Promise<DidUpdateInvocation> {
    // Generate the proof
    const proof = await this.cryptosuite.createProof({ document, options });

    // Deconstruct the proof object
    const { type, verificationMethod, proofPurpose } = proof;

    // Check if the type, verificationMethod, and proofPurpose are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Btc1Error('Proof missing "type", "verificationMethod" and/or "proofPurpose"', PROOF_GENERATION_ERROR, proof);
    }

    // Deconstruct the domain from the proof object and check:
    // if the options domain is defined, ensure it matches the proof domain
    Logger.warn('// TODO: Adjust the domain check to match the spec (domain as a list of urls)');
    const { domain } = proof;
    if (options.domain && options.domain !== domain) {
      throw new Btc1Error('Domain mismatch between options and domain passed', PROOF_GENERATION_ERROR, proof);
    }

    // Deconstruct the challenge from the proof object and check:
    // if options challenge is defined, ensure it matches the proof challenge
    const { challenge } = proof;
    if (options.challenge && options.challenge !== challenge) {
      throw new Btc1Error('Challenge mismatch options and challenge passed', PROOF_GENERATION_ERROR, proof);
    }

    // Set the proof in the document and return as a DidUpdateInvocation
    return { ...document, proof } as DidUpdateInvocation;
  }

  /** @see IDataIntegrityProof.verifyProof */
  public async verifyProof({
    mediaType,
    document,
    expectedPurpose,
    expectedDomain,
    expectedChallenge
  }: {
    mediaType?: string;
    document: string;
    expectedPurpose: string;
    expectedDomain?: string[];
    expectedChallenge?: string;
  }): Promise<VerificationResult> {
    Logger.debug('------------ DataIntegrityProof.verifyProof ------------\n\n', { mediaType, document, expectedPurpose, expectedDomain, expectedChallenge });
    // Parse the document
    if(!JSON.parsable(document)) {
      throw new Btc1Error('Invalid document: must be parsable JSON string', PROOF_PARSING_ERROR, { document });
    }

    // Parse the document as a DidUpdateInvocation
    const invocation = JSON.parse(document) as DidUpdateInvocation;
    Logger.debug('invocation=', invocation);

    // Deconstruct the invocation object to get the proof
    const { proof }: { proof: Proof } = invocation;
    Logger.debug('proof=', proof);

    // Check if the proof object is an object
    if (typeof proof !== 'object') {
      throw new Btc1Error('Invalid proof: must be an object of type Proof', PROOF_PARSING_ERROR, proof);
    }

    // Deconstruct the proof object
    const { type, proofPurpose, verificationMethod, challenge, domain } = proof;
    // Check if the type, proofPurpose, and verificationMethod are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Btc1Error('Invalid proof: missing one of type, verificationMethod or proofPurpose',
        PROOF_VERIFICATION_ERROR,
        proof
      );
    }

    // Check if the expectedPurpose is defined and if it matches the proofPurpose
    if (expectedPurpose && expectedPurpose !== proofPurpose) {
      throw new Btc1Error(`Invalid proof: expectedPurpose ${expectedPurpose} !== proofPurpose ${proofPurpose}`,
        PROOF_VERIFICATION_ERROR,
        proof
      );
    }

    // Check if the expectedChallenge is defined and if it matches the challenge
    if (expectedChallenge && expectedChallenge !== challenge) {
      throw new Btc1Error(`Invalid proof: expectedChallenge ${expectedChallenge} !== challenge ${challenge}`,
        INVALID_CHALLENGE_ERROR,
        proof
      );
    }

    // Check if the expectedDomain length matches the proof.domain length
    if(expectedDomain && expectedDomain?.length !== domain?.length) {
      throw new Btc1Error(`Invalid proof: expectedDomain ${expectedDomain} !== domain ${domain}`,
        INVALID_DOMAIN_ERROR,
        proof
      );
    }

    // If defined, check that each entry in expectedDomain can be found in proof.domain
    if(expectedDomain && !expectedDomain?.every(url => domain?.includes(url))) {
      throw new Btc1Error(`Invalid proof: expectedDomain ${expectedDomain.join(', ')} !== domain ${domain}`,
        INVALID_DOMAIN_ERROR,
        proof
      );
    }

    // Verify the proof
    const { verified, verifiedDocument, mediaType: mt } = await this.cryptosuite.verifyProof(invocation);
    Logger.debug('{verified, verifiedDocument, mediaType: mt}=', {verified, verifiedDocument, mt});

    // Add the mediaType to the verification result
    mediaType ??= mt;

    const sansProof = ObjectUtils.delete({
      obj : verifiedDocument as Record<string, any>,
      key : 'proof'
    }) as DidUpdateInvocation;

    // Return the verification result
    return {verified, verifiedDocument: verified ? sansProof : undefined, mediaType};
  }
}