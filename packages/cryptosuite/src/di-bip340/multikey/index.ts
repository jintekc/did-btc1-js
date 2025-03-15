import { KeyPair, PrivateKey, PublicKey } from '@did-btc1/key-pair';
import { schnorr } from '@noble/curves/secp256k1';
import { DidVerificationMethod } from '@web5/dids';
import { randomBytes } from 'crypto';
import { Hex, SignatureBytes } from '../../types/shared.js';
import { MultikeyError } from '../../utils/error.js';
import { FromPrivateKey, FromPublicKey, IMultikey, MultikeyJSON, MultikeyParams } from './interface.js';

/**
 * Implements {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#multikey | 2.1.1 Multikey}
 * A Multikey is a secp256k1 compressed keypair that creates and verifies schnorr signatures.
 * The publicKeyMultibase is the Multikey public key encoded using base58btc algorithm with `z` identifier character.
 * @export
 * @class Multikey
 * @type {Multikey}
 * @implements {Multikey}
 */
export class Multikey implements IMultikey {
  /** @type {string} The verification metod type */
  public static readonly type: string = 'Multikey';

  /** @type {string} The id references which key to use for various operations in the DID Document */
  public readonly id: string;

  /** @type {string} The controller is the DID that controls the keys and information in the DID DOcument */
  public readonly controller: string;

  /** @type {PrivateKeyBytes} The private key bytes for the multikey (optional) */
  // private readonly _privateKey?: PrivateKeyBytes;
  private readonly _keyPair: KeyPair;

  /**
   * Creates an instance of Multikey.
   * @constructor
   * @param {MultikeyParams} params The parameters to create the multikey
   * @param {string} params.id The id of the multikey (required)
   * @param {string} params.controller The controller of the multikey (required)
   * @param {KeyPair} params.keypair The keypair of the multikey (optional, required if no publicKey)
   * @param {PublicKeyBytes} params.keypair.publicKey The public key of the multikey (optional, required if no privateKey)
   * @param {PrivateKeyBytes} params.keypair.privateKey The private key of the multikey (optional)
   * @throws {MultikeyError} if neither a publicKey nor a privateKey is provided
   */
  constructor({ id, controller, keyPair }: MultikeyParams) {
    // If no keypair passed, throw an error
    if (!keyPair) {
      throw new MultikeyError('Argument missing: "keyPair" required', 'MULTIKEY_CONSTRUCTOR_ERROR');
    }

    // If the keypair does not have a public key, throw an error
    if(!keyPair.publicKey) {
      throw new MultikeyError('Argument missing: "keyPair" must contain a "publicKey"', 'MULTIKEY_CONSTRUCTOR_ERROR');
    }

    // Set the class variables
    this.id = id;
    this.controller = controller;
    this._keyPair = keyPair;
  }

  /** @see IMultikey.keyPair */
  get keyPair(): KeyPair {
    // Return a copy of the keypair
    const keyPair = this._keyPair;
    return keyPair;
  }

  /** @see IMultikey.publicKey */
  get publicKey(): PublicKey {
    // Create and return a copy of the keyPair.publicKey
    const publicKey = this.keyPair.publicKey;
    return publicKey;
  }

  /** @see IMultikey.privateKey */
  get privateKey(): PrivateKey {
    // Create and return a copy of the keyPair.privateKey
    const privateKey = this.keyPair.privateKey;
    // If there is no private key, throw an error
    if(!this.isSigner) {
      throw new MultikeyError('Cannot get: no privateKey', 'MULTIKEY_PRIVATE_KEY_ERROR');
    }
    return privateKey;
  }

  /** @see IMultikey.sign */
  public sign(data: Hex): SignatureBytes {
    // If there is no private key, throw an error
    if (!this.isSigner) {
      throw new MultikeyError('Cannot sign: no privateKey', 'MULTIKEY_SIGN_ERROR');
    }
    // Sign the hashb and return it
    return schnorr.sign(data, this.privateKey.bytes, randomBytes(32));
  }

  /** @see IMultikey.verify */
  public verify(signature: SignatureBytes, data: Hex): boolean {
    // Verify the signature and return the result
    return schnorr.verify(signature, data, this.publicKey.x);
  }

  /** @see IMultikey.fullId */
  public fullId(): string {
    // If the id starts with "#", return concat(controller, id); else return id
    return this.id.startsWith('#') ? `${this.controller}${this.id}` : this.id;
  }

  /** @see IMultikey.toVerificationMethod */
  public toVerificationMethod(): DidVerificationMethod {
    // Construct and return the verification method
    return {
      id                 : this.id,
      type               : Multikey.type,
      controller         : this.controller,
      publicKeyMultibase : this.publicKey.multibase
    };
  }

  /** @see IMultikey.fromVerificationMethod */
  public fromVerificationMethod(vm: DidVerificationMethod): Multikey {
    const VM_ERROR = 'MULTIKEY_VERIFICATION_METHOD_ERROR';

    // Destructure the verification method
    const { id, controller, publicKeyMultibase, type } = vm;

    // Check if the required field id is missing
    if (!id) {
      throw new MultikeyError(`Missing key: id required in verificationMethod ${vm}`, VM_ERROR);
    }

    // Check if the required field controller is missing
    if (!controller) {
      throw new MultikeyError(`Missing key: controller required in verificationMethod ${vm}`, VM_ERROR);
    }

    // Check if the required field publicKeyMultibase is missing
    if (!publicKeyMultibase) {
      throw new MultikeyError(`Missing key: publicKeyMultibase required in verificationMethod ${vm}`, VM_ERROR);
    }

    // Check if the type is not Multikey
    if (type !== 'Multikey') {
      throw new MultikeyError(`Invalid value: verificationMethod type is invalid ${vm}`, VM_ERROR);
    }

    // Decode the public key multibase
    const multibase = this.publicKey.decode();

    // Get the 32 byte public key from the multibase
    const publicKey = multibase.slice(2, multibase.length);

    // Construct a new PublicKey from the publicKey and a new KeyPair from the PublicKey
    const keyPair = new KeyPair({ publicKey: new PublicKey(publicKey) });

    // Return a new Multikey instance
    return new Multikey({ id, controller, keyPair });
  }


  /** @see IMultikey.isSigner */
  get isSigner(): boolean {
    return !!this.keyPair.privateKey;
  }

  /** @see IMultikey.json */
  public json(): MultikeyJSON {
    return {
      id                 : this.id,
      controller         : this.controller,
      fullId             : this.fullId(),
      isSigner           : this.isSigner,
      keyPair            : this.keyPair.json(),
      verificationMethod : this.toVerificationMethod()
    };
  }
}

/**
 * A utility class for creating `Multikey` instances
 * @export
 * @class MultikeyUtils
 * @type {MultikeyUtils}
 */
export class MultikeyUtils {
  /**
   * Creates a `Multikey` instance from a private key
   * @static
   * @param {FromPublicKey} params The parameters to create the multikey
   * @param {string} params.id The id of the multikey
   * @param {string} params.controller The controller of the multikey
   * @param {PrivateKeyBytes} params.privateKeyBytes The private key bytes for the multikey
   * @returns {Multikey} The new multikey instance
   */
  public static fromPrivateKey({ id, controller, privateKeyBytes }: FromPrivateKey): Multikey {
    // Create a new PrivateKey from the private key bytes
    const privateKey = new PrivateKey(privateKeyBytes);

    // Compute the public key from the private key
    const publicKey = privateKey.computePublicKey();

    // Create a new KeyPair from the private key
    const keyPair = new KeyPair({ publicKey, privateKey });

    // Return a new Multikey instance
    return new Multikey({ id, controller, keyPair });
  }

  /**
   * Creates a `Multikey` instance from a public key
   * @static
   * @param {FromPublicKey} params The parameters to create the multikey
   * @param {string} params.id The id of the multikey
   * @param {string} params.controller The controller of the multikey
   * @param {PublicKeyBytes} params.publicKeyBytes The public key bytes for the multikey
   * @returns {Multikey} The new multikey instance
   */
  public static fromPublicKey({ id, controller, publicKeyBytes }: FromPublicKey): Multikey {
    // Create a new PublicKey from the public key bytes
    const keyPair = new KeyPair({ publicKey: new PublicKey(publicKeyBytes) });

    // Return a new Multikey instance
    return new Multikey({ id, controller, keyPair });
  }
}