import { HashBytes, MultikeyJSON } from '@did-btc1/cryptosuite';
import { Hex, KeyPair, PublicKey, SignatureBytes } from '@did-btc1/key-pair';
import { KeyValueStore } from '@web5/common';

export type Btc1KeyManagerOptions = {
  importKey?: boolean;
  active?: boolean
};

/** Alias type for Btc1KeyManager keyUri */
export type KeyIdentifier = string;

/** Params for initializing a Btc1KeyManager class instance. */
export type KeyManagerParams = {
  /**
   * An optional property to specify a custom `KeyValueStore` instance for key management. If not
   * provided, {@link Btc1KeyManager | `Btc1KeyManager`} uses a default `MemoryStore` instance.
   * This store is responsible for managing cryptographic keys, allowing them to be retrieved,
   * stored, and managed during cryptographic operations.
   */
  keyStore?: KeyValueStore<KeyIdentifier, KeyPair>;

  /**
   * An optional property to specify a key URI for the key manager. If not provided, the key manager
   * will generate a key URI based on the public key of the key pair.
   */
  keyUri?: KeyIdentifier;
};
export type MultikeyPair = MultikeyJSON;
export type GenerateKeyParams = {
  id: string;
  controller: string;
  options: Btc1KeyManagerOptions
};

/**
 * The interface for the Btc1KeyManager class.
 * @interface KeyManager
 * @type {KeyManager}
 */
export interface KeyManager {
    /**
     * The URI of the active key.
     * @type {KeyIdentifier}
     */
    activeKeyUri?: KeyIdentifier;

    /**
     * Returns the sha256 hash of the input data.
     * @public
     * @param {Uint8Array} data The data to hash.
     * @returns {HashBytes} The sha256 hash of the input data.
     */
    digest(data: Uint8Array): HashBytes;

    /**
     * Exports the full key pair from the key store.
     * @param {KeyIdentifier} keyUri The URI of the key to export.
     * @returns {Promise<KeyPair>} The key pair associated with the key URI.
     * @throws {Btc1KeyManagerError} If the key is not found in the key store.
     */
    exportKey(keyUri: KeyIdentifier): Promise<KeyPair>;

    /**
     * Computes the URI of a key pair.
     * @public
     * @param {KeyPair} keyPair The key pair to compute the URI for.
     * @returns {KeyIdentifier} The URI of the key pair.
     */
    computeKeyUri(keyPair: KeyPair): KeyIdentifier;

    /**
     * Gets the public key of a key pair.
     * @public
     * @param {KeyIdentifier} keyUri The URI of the key to get the public key for.
     * @returns {Promise<PublicKey>} The public key of the key pair.
     */
    getPublicKey(keyUri: KeyIdentifier): Promise<PublicKey>;

    /**
     * Imports a key pair into the key store.
     * @public
     * @param {KeyPair} keyPair The key pair to import.
     * @param {Btc1KeyManagerOptions} options The options for importing the key pair.
     * @param {boolean} options.active Whether to set the imported key as active.
     * @returns {Promise<KeyIdentifier>} The URI of the imported key pair.
     */
    importKey(keyPair: KeyPair, { active }: Btc1KeyManagerOptions): Promise<KeyIdentifier>;

    /**
     * Signs a message with a key pair.
     * @public
     * @param {KeyIdentifier} keyUri The URI of the key to use for signing.
     * @returns {Promise<SignatureBytes>} The signature of the input data.
     */
    sign(keyUri: KeyIdentifier, data: Hex): Promise<SignatureBytes>;

    /**
     * Verifies if a signature was produced by a key pair.
     * @public
     * @param {KeyIdentifier} keyUri The URI of the key to use for verification.
     * @param {SignatureBytes} signature The signature to verify.
     * @param {Hex} data The data that was signed.
     * @returns {Promise<boolean>} A promise that resolves if the signature is valid, and rejects otherwise.
     */
    verify(keyUri: KeyIdentifier, signature: SignatureBytes, data: Hex): Promise<boolean>;
}