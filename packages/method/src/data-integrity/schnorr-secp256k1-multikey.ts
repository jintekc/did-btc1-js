import { schnorr } from '@noble/curves/secp256k1';
import { DidVerificationMethod } from '@web5/dids';
import { randomBytes } from 'crypto';
import { base58btc } from 'multiformats/bases/base58';
import { SECP256K1_XONLY_PUBLIC_KEY_PREFIX } from '../constants/btc1.js';
import { PrivKey, PubKey, Signature, Bytes } from '../types/btc1.js';

interface SchnorrSecp256k1MultikeyParams {
    id: string;
    controller: string;
    privateKey?: PrivKey;
    publicKey?: PubKey;
}

interface ISchnorrSecp256k1Multikey {
    id: string;
    controller: string;
    privateKey?: PrivKey;
    publicKey: PubKey;
    sign(data: string): Signature;
    verify(data: string, signature: Bytes): boolean;
    toVerificationMethod(): DidVerificationMethod;
    fromVerificationMethod(verificationMethod: DidVerificationMethod): SchnorrSecp256k1Multikey;
}

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#multikey | 2.1.1 Multikey} of the
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity Schnorr secp256k1 Cryptosuite} spec
 *
 * @export
 * @class SchnorrSecp256k1Multikey
 * @type {SchnorrSecp256k1Multikey}
 */
export default class SchnorrSecp256k1Multikey implements ISchnorrSecp256k1Multikey {
  id: string;
  controller: string;
  privateKey?: PrivKey;
  publicKey: PubKey;

  /**
   * Creates an instance of SchnorrSecp256k1Multikey.
   *
   * @constructor
   * @param {SchnorrSecp256k1MultikeyParams} params The parameters to create the multikey
   * @param {string} params.id The id of the multikey (required)
   * @param {string} params.controller The controller of the multikey (required)
   * @param {PrivKey} params.privateKey The private key of the multikey (optional, required if publicKey is not provided)
   * @param {PubKey} params.publicKey The public key of the multikey (optional, required if privateKey is not provided)
   */
  constructor({ id, controller, privateKey, publicKey }: SchnorrSecp256k1MultikeyParams) {
    this.id = id;
    this.controller = controller;
    if (!privateKey || !publicKey) {
      throw new Error('Must pass public or private key');
    }
    if (privateKey) {
      this.privateKey = privateKey;
    }
    this.publicKey = !!privateKey && !publicKey
      ? schnorr.getPublicKey(privateKey)
      : publicKey;
  }

  public static encode(publicKey: PubKey): string {
    // Encode the public key as a multibase base58btc string
    const xOnlyKeyBytes = new Uint8Array(SECP256K1_XONLY_PUBLIC_KEY_PREFIX.length + publicKey.length);
    // Set the prefix
    xOnlyKeyBytes.set(SECP256K1_XONLY_PUBLIC_KEY_PREFIX, 0);
    // If the public key is a string, convert it to a buffer
    const bytes = typeof publicKey === 'string'
      ? Buffer.from(publicKey, 'hex')
      : publicKey;
    // Set the public key
    xOnlyKeyBytes.set(bytes, SECP256K1_XONLY_PUBLIC_KEY_PREFIX.length);
    return base58btc.encode(xOnlyKeyBytes);
  }

  /**
     *
     * Produce signed data with a private key
     *
     * @param data: Data to be signed
     *
     * @returns: Signature as a Uint8Array
     *
     * @throws: Error if no private key is provided
     */
  public sign(data: string): Signature {
    // If there is no private key, throw an error
    if (!this.privateKey) {
      throw new Error('No private key');
    }
    // Sign the data and return it
    return schnorr.sign(data, this.privateKey, randomBytes(32));
  }

  /**
     *
     * Verify a signature
     *
     * @param data: Data to be verified
     * @param signature: Signature to be verified
     *
     * @returns: If the signature is valid against the public key
     */
  public verify(data: string, signature: Bytes): boolean {
    return schnorr.verify(signature, data, this.publicKey);
  }

  public fullId() {
    if (this.id.startsWith('#')) {
      return `${this.controller}#${this.id}`;
    }
    return this.id;
  }


  /**
   * Convert the multikey to a verification method
   *
   * @public
   * @returns {DidVerificationMethod}
   */
  public toVerificationMethod(): DidVerificationMethod {
    return {
      id                 : this.id,
      type               : 'Multikey',
      controller         : this.controller,
      publicKeyMultibase : SchnorrSecp256k1Multikey.encode(this.publicKey)
    };
  }

  /**
   *
   * Convert a verification method to a multikey
   *
   * @param verificationMethod: The verification method to convert
   *
   * @returns: A new SchnorrSecp256k1Multikey instance
   *
   * @throws: Error if the verification method is missing required fields
   * @throws: Error if the verification method has an invalid type
   * @throws: Error if the publicKeyMultibase has an invalid prefix
   */
  public fromVerificationMethod(verificationMethod: DidVerificationMethod) {
    // Destructure the verification method
    const { id, type, controller, publicKeyMultibase } = verificationMethod;
    // Check if the required field id is missing
    if (!id) {
      throw new Error('Verification method missing id');
    }
    // Check if the required field controller is missing
    if (!controller) {
      throw new Error('Verification method missing controller');
    }
    // Check if the required field publicKeyMultibase is missing
    if (!publicKeyMultibase) {
      throw new Error('Verification method missing publicKeyMultibase');
    }
    // Check if the type is not Multikey
    if (type !== 'Multikey') {
      throw new Error('Verification method has an invalid type');
    }
    const publicKeyBytes = base58btc.decode(publicKeyMultibase);
    const prefix = publicKeyBytes.slice(0, SECP256K1_XONLY_PUBLIC_KEY_PREFIX.length);
    if (prefix !== SECP256K1_XONLY_PUBLIC_KEY_PREFIX) {
      throw new Error('Invalid publicKeyMultibase prefix');
    }
    const publicKey = publicKeyBytes.slice(SECP256K1_XONLY_PUBLIC_KEY_PREFIX.length);
    return new SchnorrSecp256k1Multikey({ id, controller, publicKey });
  }
}