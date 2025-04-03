import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import rdf from 'rdf-canonize';
import { HashBytes } from '../types/crypto.js';
import { CanonicalizationAlgorithm } from '../types/general.js';
import { JSONObject } from '../exts.js';
import { CanonicalizationError } from './errors.js';
import { base58btc } from 'multiformats/bases/base58';

/**
 * Class for canonicalizing objects using JCS (RFC 8785) or RDFC (RDF Canonicalization 1.0).
 * It also provides hashing (SHA-256) and hex conversion.
 *
 * @class Canonicalization
 * @type {Canonicalization}
 */
export class Canonicalization {
  private algorithm: CanonicalizationAlgorithm;

  constructor(algorithm: 'JCS' | 'RDFC-1.0' = 'RDFC-1.0') {
    this.algorithm = algorithm;
  }

  /**
   * Sets the canonicalization algorithm dynamically.
   * @param {'JCS' | 'RDFC-1.0'} algorithm Either 'JCS' or 'RDFC'.
   * @returns {void}
   */
  public setAlgorithm(algorithm: 'JCS' | 'RDFC-1.0'): void {
    this.algorithm = algorithm;
  }

  /**
   * Step 1-3: Canonicalize → Hash → Hex
   * Canonicalizes an object, hashes it and returns it as hex string.
   * @param {JSONObject} object The object to process.
   * @returns {Promise<string>} The final SHA-256 hash bytes as a hex string.
   */
  public async process(object: JSONObject, encoding: string = 'hex'): Promise<string> {
    // Step 1: Canonicalize
    const canonicalized = await this.canonicalize(object);
    // Step 2: Hash
    const hashBytes = this.hash(canonicalized);
    // Step 3: Encode
    const encoded = this.encode(hashBytes, encoding);
    // Return the final hex string
    return encoded;
  }

  /**
   * Step 1: Canonicalize an object based on the selected algorithm.
   * @param {JSONObject} object The object to canonicalize.
   * @returns {Promise<string>} The canonicalized string.
   */
  public async canonicalize(object: JSONObject): Promise<string> {
    return this.algorithm.includes('JCS')
      ? this.jcs(object)
      : await rdf.canonize([object], { algorithm: 'RDFC-1.0' });
  }

  /**
   * Step 2: Hashes a canonicalized string using SHA-256.
   * @param {string} canonicalized The canonicalized string.
   * @returns {HashBytes} The SHA-256 hash as a Uint8Array.
   */
  public hash(canonicalized: string): HashBytes {
    return sha256(canonicalized);
  }

  /**
   * Step 3: Hex. Converts a Uint8Array hash to a hex string.
   * @param {HashBytes} hashBytes The hash as a Uint8Array.
   * @returns {string} The hash as a hex string.
   */
  public hex(hashBytes: HashBytes): string {
    return bytesToHex(hashBytes);
  }


  /**
   * Step 1-2: Canonicalize → Hash.
   * Canonicalizes an object, hashes it and returns it as hash bytes.
   * @param {JSONObject} object The object to process.
   * @returns {Promise<HashBytes>} The final SHA-256 hash bytes.
   */
  public async canonicalhash(object: JSONObject): Promise<HashBytes> {
    const canonicalized = await this.canonicalize(object);
    return this.hash(canonicalized);
  }

  /**
   * Step 2-3: Hash → Hex.
   * Hashes a canonicalized string using SHA-256 and returns it as hex string.
   * @param {string} canonicalized The canonicalized string to hash.
   * @returns {string} The SHA-256 hash as a hex string.
   */
  public hashhex(canonicalized: string): string {
    return this.hex(this.hash(canonicalized));
  }


  /**
   * Encodes a canonicalized string into a specified encoding format.
   * @param {string} canonicalized The canonicalized string to encode.
   * @param {string} encoding The encoding format ('hex' or 'base58').
   * @throws {CanonicalizationError} If the encoding format is not supported.
   * @returns {string} The encoded string.
   */
  public encode(canonicalized: HashBytes, encoding: string): string {
    switch(encoding) {
      case 'hex':
        return this.hex(canonicalized);
      case 'base58':
        return base58btc.encode(canonicalized);
      default:
        throw new CanonicalizationError(`Unsupported encoding: ${encoding}`, 'ENCODING_ERROR');
    }
  }

  /**
   * Step 2-3: Hash → Base58.
   * @param {string} canonicalized The canonicalized string to hash.
   * @returns {string} The SHA-256 hash as a base58 string.
   */
  public hashbase58(canonicalized: string): string {
    return base58btc.encode(this.hash(canonicalized));
  }

  /**
   * Canonicalizes a given object according to RFC 8785 (https://tools.ietf.org/html/rfc8785),
   * which describes JSON Canonicalization Scheme (JCS). This function sorts the keys of the
   * object and its nested objects alphabetically and then returns a stringified version of it.
   * This method handles nested objects, array values, and null values appropriately.
   * @param {JSONObject} object The object to canonicalize.
   * @returns {string} The stringified version of the input object with its keys sorted alphabetically per RFC 8785.
   * @throws {Error} If the object contains NaN or Infinity values.
   */
  public jcs(object: JSONObject): string {
    if (typeof object === 'number' && isNaN(object)) {
      throw new CanonicalizationError('NaN is not allowed', 'JCS_ERROR');
    }

    if (typeof object === 'number' && !isFinite(object)) {
      throw new CanonicalizationError('Infinity is not allowed', 'JCS_ERROR');
    }

    if (object === null || typeof object !== 'object') {
      return JSON.stringify(object);
    }

    if (object.toJSON instanceof Function) {
      return this.jcs(object.toJSON());
    }

    if (Array.isArray(object)) {
      const values = object.reduce((t, cv, ci) => {
        const comma = ci === 0 ? '' : ',';
        const value = cv === undefined || typeof cv === 'symbol' ? null : cv;
        return `${t}${comma}${this.jcs(value)}`;
      }, '');
      return `[${values}]`;
    }

    const values = Object.keys(object).sort().reduce((t, cv: any) => {
      if (object[cv] === undefined ||
        typeof object[cv] === 'symbol') {
        return t;
      }
      const comma = t.length === 0 ? '' : ',';
      return `${t}${comma}${this.jcs(cv)}:${this.jcs(object[cv])}`;
    }, '');
    return `{${values}}`;
  }
}

export const canonicalization = new Canonicalization();