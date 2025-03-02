import { Hex } from '@noble/secp256k1';
import { DidVerificationMethod } from '@web5/dids';
import { PrivateKeyBytes, PublicKeyBytes, SignatureBytes, PublicKeyMultibase } from '../../types/shared.js';
import { Multikey } from './index.js';

/**
 * Interface representing a BIP-340 Multikey.
 * @interface IMultikey
 */
export interface IMultikey {
  /** @type {string} The unique identifier of the multikey */
  id: string;

  /** @type {string} The controller of the multikey */
  controller: string;

  /** @type {PrivateKeyBytes} The private key of the multikey (optional) */
  privateKey?: PrivateKeyBytes;

  /** @type {PublicKeyBytes} The public key of the multikey (optional) */
  publicKey?: PublicKeyBytes;

  /**
   * Produce signed data with a private key
   * @param {string} data Data to be signed
   * @returns {SignatureBytes} Signature byte array
   * @throws {Btc1KeyManagerError} if no private key is provided
   */
  sign(data: Hex): SignatureBytes;

  /**
   * Verify a signature
   * @param {string} data Data for verification
   * @param {SignatureBytes} signature Signature for verification
   * @returns {boolean} If the signature is valid against the public key
   */
  verify(data: string, signature: SignatureBytes): boolean;

  /**
   * Encode the public key in SchnorrSecp256k1 Multikey Format
   * @returns {PublicKeyMultibase} The encoded public key
   */
  encode(): PublicKeyMultibase;

  /**
   * Decode the public key in SchnorrSecp256k1 Multikey Format
   * @param {PublicKeyMultibase} publicKeyMultibase The encoded public key
   * @returns {PublicKeyBytes} The encoded public key
   */
  decode(publicKeyMultibase: PublicKeyMultibase): PublicKeyBytes;

  /**
   * Get the full id of the multikey
   * @returns {string} The full id of the multikey
   */
  fullId(): string

  /**
   * Convert the multikey to a verification method
   * @returns {DidVerificationMethod} The verification method
   */
  toVerificationMethod(): DidVerificationMethod;

  /**
   * Convert a verification method to a multikey
   * @param {DidVerificationMethod} verificationMethod The verification method to convert
   * @returns {Multikey} Multikey instance
   * @throws {Btc1KeyManagerError} if the verification method is missing required fields
   * @throws {Btc1KeyManagerError} if the verification method has an invalid type
   * @throws {Btc1KeyManagerError} if the publicKeyMultibase has an invalid prefix
   */
  fromVerificationMethod(verificationMethod: DidVerificationMethod): Multikey;
}