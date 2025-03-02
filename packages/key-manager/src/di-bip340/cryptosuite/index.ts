import { sha256 } from '@noble/hashes/sha256';
import * as jcs from '@web5/crypto';
import { base58btc } from 'multiformats/bases/base58';
import rdfc from 'rdf-canonize';
import {
  CanonicalizableObject,
  CryptosuiteParams,
  CryptosuiteType,
  GenerateHashParams,
  InsecureDocumentParams,
  ProofOptionsParam,
  SerializeParams,
  TransformParams,
  VerificationParams
} from '../../types/cryptosuite.js';
import {
  CanonicalizedProofConfig,
  DataIntegrityProofType,
  Proof,
  SecureDocument,
  VerificationResult
} from '../../types/di-proof.js';
import { HashHex, ProofBytes } from '../../types/shared.js';
import { CryptosuiteError } from '../../utils/error.js';
import { Multikey } from '../multikey/index.js';
import { ICryptosuite } from './interface.js';

/**
 * TODO: Test RDFC and figure out what the contexts should be
 * Implements sections
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#schnorr-secp256k1-rdfc-2025 | 3.2 schnorr-secp256k1-rdfc-2025}
 * and {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#schnorr-secp256k1-jcs-2025 | 3.3 schnorr-secp256k1-jcs-2025}
 * of {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity Schnorr secp256k1 Cryptosuite v0.1}
 * @export
 * @class Cryptosuite
 * @type {Cryptosuite}
 */
export class Cryptosuite implements ICryptosuite {
  /** @type {DataIntegrityProofType} The type of proof produced by the Cryptosuite */
  public type: DataIntegrityProofType = 'DataIntegrityProof';

  /** @type {string} The name of the cryptosuite */
  public cryptosuite: CryptosuiteType;

  /** @type {Multikey} The multikey used to sign and verify proofs */
  public multikey: Multikey;

  /** @type {string} The algorithm used for canonicalization */
  public algorithm: string;

  /**
   * Creates an instance of Cryptosuite.
   * @constructor
   * @param {Multikey} multikey The parameters to create the multikey
   */
  constructor({ cryptosuite, multikey }: CryptosuiteParams) {
    this.cryptosuite = cryptosuite;
    this.multikey = multikey;
    this.algorithm = cryptosuite.includes('rdfc') ? 'RDFC-1.0' : 'JCS-2025';
  }

  /** @see ICryptosuite.canonicalize */
  public async canonicalize(object: CanonicalizableObject): Promise<string> {
    const algorithm = this.algorithm;
    // If the cryptosuite includes 'rdfc', use RDFC canonicalization else use JCS
    return algorithm === 'RDFC-1.0'
      ? await rdfc.canonize([object], { algorithm })
      : jcs.canonicalize(object);
  }

  /** @see ICryptosuite.createProof */
  public async createProof({ document, options }: InsecureDocumentParams): Promise<Proof> {
    // Make a copy of the options as a Proof
    const proof = options as Proof;
    // Get the context from the document
    const context = document['@context'];
    // If a context exists, add it to the proof
    if (context) proof['@context'] = context;
    // Transform the document into a canonical form
    const canonicalDocument = await this.transformDocument({ document, options });
    // Create a canonical form of the proof configuration
    const canonicalProofConfig = await this.proofConfiguration({ options: proof });
    // Generate a hash of the canonical proof configuration and canonical document
    const hashData = this.generateHash({ canonicalProofConfig, canonicalDocument });
    // Serialize the proof
    const proofBytes = this.proofSerialization({ hashData, options });
    // Encode the proof bytes to base
    proof.proofValue = base58btc.encode(proofBytes);
    if(this.cryptosuite.includes('rdfc'))
      proof['@type'] = this.type;
    else
      proof.type = this.type;
    // Return the proof
    return proof;
  }

  /** @see ICryptosuite.verifyProof */
  public async verifyProof(secure: SecureDocument): Promise<VerificationResult> {
    // Create an insecure document from the secure document by removing the proof
    const insecure = { ...secure, proof: undefined };
    // Create a copy of the proof options removing the proof value
    const options = { ...secure.proof, proofValue: undefined };
    // Decode the secure document proof value from base58btc to bytes
    const proofBytes = base58btc.decode(secure.proof.proofValue);
    // Transform the newly insecured document to canonical form
    const canonicalDocument = await this.transformDocument({ document: insecure, options });
    // Canonicalize the proof options to create a proof configuration
    const canonicalProofConfig = await this.proofConfiguration({ options });
    // Generate a hash of the canonical insecured document and the canonical proof configuration`
    const hashData = this.generateHash({ canonicalProofConfig, canonicalDocument });
    // Verify the hashed data against the proof bytes
    const verified = this.proofVerification({ hashData, proofBytes, options });
    // Return the verification result
    return { verified, verifiedDocument: verified ? secure : undefined };
  }

  /** @see ICryptosuite.transformDocument */
  public async transformDocument({ document, options }: TransformParams): Promise<string> {
    // Error type for the transformDocument method
    const ERROR_TYPE = 'PROOF_TRANSFORMATION_ERROR';
    // Get the type from the options
    const type = options.type ?? options['@type'];
    // If the type does not match the cryptosuite type, throw an error
    if (type !== this.type) {
      throw new CryptosuiteError(`Options type ${type} !== cryptosuite type ${this.type}`, ERROR_TYPE);
    }
    // Get the cryptosuite from the options
    const { cryptosuite } = options;
    // If the cryptosuite does not match the cryptosuite name, throw an error
    if (cryptosuite !== this.cryptosuite) {
      throw new CryptosuiteError('Proof options cryptosuite name does not match cryptosuite name', ERROR_TYPE);
    }
    // Return the RDFC canonicalized document
    return await this.canonicalize(document);
  }

  /** @see ICryptosuite.generateHash */
  public generateHash({ canonicalProofConfig, canonicalDocument }: GenerateHashParams): HashHex {
    // Convert the canonical proof config to buffer
    const configBuffer = Buffer.from(canonicalProofConfig);
    // Convert the canonical document to buffer
    const documentBuffer = Buffer.from(canonicalDocument);
    // Concatenate the buffers and hash the result
    const bytesToHash = Buffer.concat([configBuffer, documentBuffer]);
    // Return the hash as a hex string
    return Buffer.from(sha256(bytesToHash)).toString('hex');
  }

  /** @see ICryptosuite.proofConfiguration */
  public async proofConfiguration({ options }: ProofOptionsParam): Promise<CanonicalizedProofConfig> {
    // Error type for the proofConfiguration method
    const ERROR_TYPE = 'PROOF_CONFIGURATION_ERROR';
    // Get the type from the options
    const type = options.type ?? options['@type'];
    // If the type does not match the cryptosuite type, throw
    if (type !== this.type) {
      throw new CryptosuiteError(`Options type ${type} !== ${this.type}`, ERROR_TYPE);
    }
    // Get the cryptosuite from the
    const { cryptosuite } = options;
    // If the cryptosuite does not match the cryptosuite name, throw
    if (cryptosuite !== this.cryptosuite) {
      throw new CryptosuiteError(`Options cryptosuite ${cryptosuite} !== ${this.cryptosuite}`, ERROR_TYPE);
    }
    // Return the RDFC canonicalized proof configuration
    return await this.canonicalize(options);
  }

  /** @see ICryptosuite.proofSerialization */
  public proofSerialization({ hashData, options }: SerializeParams): ProofBytes {
    // Error type for the proofSerialization method
    const ERROR_TYPE = 'PROOF_SERIALIZATION_ERROR';
    // Get the verification method from the options
    const vm = options.verificationMethod;
    // Get the multikey fullId
    const fullId = this.multikey.fullId();
    // If the verification method does not match the multikey fullId, throw an error
    if (vm !== fullId) {
      throw new CryptosuiteError(`Multikey fullId ${fullId} !== options verificationMethod ${vm}`, ERROR_TYPE);
    }
    // Return the signed hashData
    return this.multikey.sign(hashData);
  }

  /** @see ICryptosuite.proofVerification */
  public proofVerification({ hashData, proofBytes, options }: VerificationParams): boolean {
    // Error type for the proofVerification method
    const ERROR_TYPE = 'PROOF_VERIFICATION_ERROR';
    // Get the verification method from the options
    const vm = options.verificationMethod;
    // Get the multikey fullId
    const fullId = this.multikey.fullId();
    // If the verification method does not match the multikey fullId, throw an error
    if (vm !== fullId) {
      throw new CryptosuiteError(`Multikey fullId ${fullId} !== verificationMethod ${vm}`, ERROR_TYPE);
    }
    // Return the verified hashData and proofBytes
    return this.multikey.verify(hashData, proofBytes);
  }

}