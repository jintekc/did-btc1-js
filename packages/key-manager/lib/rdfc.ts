import { sha256 } from '@noble/hashes/sha256';
import { base58btc } from 'multiformats/bases/base58';
import rdfc from 'rdf-canonize';
import { ICryptosuite } from '../src/di-bip340/cryptosuite/interface.js';
import { Multikey } from '../src/di-bip340/multikey/index.js';
import {
  CanonicalizableObject,
  GenerateHashParams,
  InsecureDocumentParams,
  ProofOptionsParam,
  SerializeParams,
  TransformParams,
  VerificationParams
} from '../src/types/cryptosuite.js';
import {
  CanonicalizedProofConfig,
  DataIntegrityProofType,
  Proof,
  SecureDocument,
  VerificationResult
} from '../src/types/di-proof.js';
import { HashHex, SignatureBytes } from '../src/types/shared.js';
import { CryptosuiteError } from '../src/utils/error.js';

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#schnorr-secp256k1-rdfc-2025 | 3.3 schnorr-secp256k1-rdfc-2025}
 * of the {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity BIP-340 Cryptosuite} spec
 * @export
 * @class CryptosuiteRdfc
 * @type {CryptosuiteRdfc}
 */
export class CryptosuiteRdfc implements ICryptosuite {
  /** @type {DataIntegrityProofType} The type of proof produced by the Cryptosuite */
  public type: DataIntegrityProofType = 'DataIntegrityProof';

  /** @type {string} The name of the cryptosuite */
  public cryptosuite: string = 'schnorr-secp256k1-rdfc-2025';

  /** @type {Multikey} The multikey used to sign and verify proofs */
  public multikey: Multikey;

  /**
   * Creates an instance of CryptosuiteRdfc.
   * @constructor
   * @param {Multikey} multikey The parameters to create the multikey
   */
  constructor(multikey: Multikey) {
    this.multikey = multikey;
  }

  public async canonicalize(object: CanonicalizableObject): Promise<string> {
    return await rdfc.canonize(object, { algorithm: 'RDFC-1.0' });
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
    // Return the proof
    return { ...proof, type: this.type, };
  }

  /** @see ICryptosuite.verifyProof */
  public async verifyProof(secure: SecureDocument): Promise<VerificationResult> {
    // Get the proof from the secure document as a Proof to act as the options
    const options = secure.proof as Proof;
    // Make a copy of the options as a Proof
    const proof = secure.proof as Proof;
    // Transform the secure document into a canonical form
    const canonicalDocument = await this.transformDocument({ document: secure, options: proof });
    // Create a canonical form of the proof configuration
    const canonicalProofConfig = await this.proofConfiguration({ options });
    // Decode the proof value from base
    const proofBytes = base58btc.decode(options.proofValue);
    // Generate a hash of the canonical proof configuration and canonical document
    const hashData = this.generateHash({ canonicalProofConfig, canonicalDocument });
    // Verify the proof
    const verified = this.proofVerification({ hashData, proofBytes, options });
    // Return the verification result
    const verifiedDocument = verified ? secure : undefined;
    // Return the verification result
    return { verified, verifiedDocument };
  }

  /** @see ICryptosuite.transformDocument */
  public async transformDocument({ document, options }: TransformParams): Promise<string> {
    // Error type for the transformDocument method
    const ERROR_TYPE = 'PROOF_TRANSFORMATION_ERROR';
    // Get the type from the options
    const { type } = options;
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
    const { type } = options;
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
  public proofSerialization({ hashData, options }: SerializeParams): SignatureBytes {
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