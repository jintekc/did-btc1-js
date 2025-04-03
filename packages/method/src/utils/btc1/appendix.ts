import { bech32 } from '@scure/base';
import {
  Did,
  DidDocument,
  DidError,
  DidErrorCode,
  DidService,
  DidVerificationMethod,
  DidVerificationRelationship
} from '@web5/dids';
import { Btc1Networks } from '../../types/crud.js';
import { W3C_ZCAP_V1 } from './constants.js';
import { Btc1RootCapability } from '../../interfaces/crud.js';
import { CID } from 'multiformats';
import { create as createDigest } from 'multiformats/hashes/digest';
import { HashBytes, Logger } from '@did-btc1/common';
import { strings } from '@helia/strings';
import { createHelia } from 'helia';

export interface DidComponents extends Did {
    hrp: string;
    genesisBytes: Uint8Array;
    version: string;
    network: string;
    idBech32: string;
};

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#appendix | 9. Appendix} methods.
 *
 * @class Btc1Appendix
 * @type {Btc1Appendix}
 */
export class Btc1Appendix {
  /**
   * Parses a `did:btc1` identifier into its components
   * @param {string} identifier The BTC1 DID to be parsed
   * @returns {DidComponents} The parsed identifier components
   * @throws {DidError} if an error occurs while parsing the identifier
   * @throws {DidErrorCode.InvalidDid} if identifier is invalid
   * @throws {DidErrorCode.MethodNotSupported} if the method is not supported
   */
  static parse(identifier: string): DidComponents {
    // Split the identifier into its components
    const components = identifier.split(':') ?? [];

    // Validate the identifier has at least 3 components
    if (components.length < 3) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid did: ${identifier}`);
    }

    // Deconstruct the components of the identifier: scheme, method, fields
    // possible values in `fields`: [id], [{version|network}, id], [version, network, id]
    const [scheme, method, ...fields] = components;

    // Validate the scheme is 'did'
    if (!scheme || scheme !== 'did') {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid did scheme: ${scheme} `);
    }

    // Validate the method is 'btc1'
    if (!method || method !== 'btc1') {
      throw new DidError(DidErrorCode.MethodNotSupported, `Did Method not supported: ${method} `);
    }

    // Validate the fields are not empty
    if (fields.length < 1) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier} `);
    }

    // Regardless of the length (3-5), the id should always be the last component
    const idBech32 = fields.pop();
    // Validate the idBech32 is defined
    if (!idBech32) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier} `);
    }

    // Decode the idBech32 to bytes and hrp
    const { prefix: hrp, bytes: genesisBytes } = bech32.decodeToBytes(idBech32);

    // Validate the id is valid starting with 'x' or 'k'
    if (!['x', 'k'].includes(hrp)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${fields[0]} `);
    }

    // Set the valid idBech32 in identifierComponents object
    const identifierComponents = {
      idBech32,
      version : '1',
      network : 'mainnet',
    } as DidComponents;

    // Set the hrp and genesisBytes in identifierComponents object
    identifierComponents.hrp = hrp;
    identifierComponents.genesisBytes = genesisBytes;

    // If no fields left, set version and network to default values
    if (fields.length === 0) {
      identifierComponents.version = '1';
      identifierComponents.network = 'mainnet';
    }
    // If one field left, check if its a valid version Number and set version & network accordingly
    else if (fields.length === 1) {
      const version = Number(fields[0]);
      const fieldIsVersion = !isNaN(version);
      identifierComponents.version = fieldIsVersion ? fields[0] : '1';
      identifierComponents.network = fieldIsVersion ? 'mainnet' : fields[0];
    }
    // If two fields left, set version and network accordingly
    else if (fields.length === 2) {
      identifierComponents.version = fields[0];
      identifierComponents.network = fields[1];
    }
    // If any other length, throw InvalidDid error
    else
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier}`);

    // Validate version is a positive number after being set
    if (isNaN(Number(identifierComponents.version))) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: version must convert to a positive number`);
    }
    // Validate network is one of mainnet, testnet, signet or regtest after being set
    if (!(identifierComponents.network in Btc1Networks)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: network must be mainnet, testnet, signet or regtest`);
    }

    return identifierComponents;
  }

  /**
   * Extracts a DID fragment from a given input
   * @param {unknown} input The input to extract the DID fragment from
   * @returns {string | undefined} The extracted DID fragment or undefined if not found
   */
  public static extractDidFragment(input: unknown): string | undefined {
    if (typeof input !== 'string') return undefined;
    if (input.length === 0) return undefined;
    return input;
  }

  /**
   * Validates that the given object is a DidVerificationMethod
   * @param {unknown} obj The object to validate
   * @returns {boolean} A boolean indicating whether the object is a DidVerificationMethod
   */
  public static isDidVerificationMethod(obj: unknown): obj is DidVerificationMethod {
    // Validate that the given value is an object.
    if (!obj || typeof obj !== 'object' || obj === null) return false;

    // Validate that the object has the necessary properties of a DidVerificationMethod.
    if (!('id' in obj && 'type' in obj && 'controller' in obj)) return false;

    if (typeof obj.id !== 'string') return false;
    if (typeof obj.type !== 'string') return false;
    if (typeof obj.controller !== 'string') return false;

    return true;
  }

  /**
   * Validates that the given object is a DidService
   * @param {unknown} obj The object to validate
   * @returns {boolean} A boolean indicating whether the object is a DidService
   */
  public static isDidService(obj: unknown): obj is DidService {
    // Validate that the given value is an object.
    if (!obj || typeof obj !== 'object' || obj === null) return false;
    // Validate that the object has the necessary properties of a DidService.
    if (!('id' in obj && 'type' in obj && 'serviceEndpoint' in obj)) return false;
    if (typeof obj.id !== 'string') return false;
    if (typeof obj.type !== 'string') return false;
    if (typeof obj.serviceEndpoint !== 'string') return false;
    return true;
  }


  /**
   * Retrieves a verification method by its ID from the given DID Document.
   * @public
   * @param {{ didDocument: DidDocument; id: string; }} params The parameters for the function.
   * @param {DidDocument} params.didDocument The DID Document to search in.
   * @param {string} params.id The ID of the verification method to retrieve.
   * @returns {(DidVerificationMethod | undefined)} The verification method with the specified ID, or undefined if not found.
   */
  public static getVerificationMethodById({ didDocument, id }: {
    didDocument: DidDocument;
    id: string;
  }): DidVerificationMethod | undefined {
    // Get the verification methods from the DID Document
    const vms = Btc1Appendix.getVerificationMethods({ didDocument });
    // Find the verification method with the matching ID
    return vms.find((method) => method.id === id);
  }

  /**
   * Extracts the verification methods from a given DID Document
   * @param {DidDocument} params.didDocument The DID Document to extract the verification methods from
   * @returns {DidVerificationMethod[]} An array of DidVerificationMethod objects
   * @throws {TypeError} if the didDocument is not provided
   */
  public static getVerificationMethods({ didDocument }: { didDocument: DidDocument; }): DidVerificationMethod[] {
    if (!didDocument) throw new TypeError(`Required parameter missing: 'didDocument'`);
    const verificationMethods: DidVerificationMethod[] = [];
    // Check the 'verificationMethod' array.
    verificationMethods.push(...didDocument.verificationMethod?.filter(Btc1Appendix.isDidVerificationMethod) ?? []);
    // Check verification relationship properties for embedded verification methods.
    Object.keys(DidVerificationRelationship).forEach((relationship) => {
      verificationMethods.push(
        ...(didDocument[relationship as keyof DidDocument] as (DidVerificationMethod)[])
          ?.filter(Btc1Appendix.isDidVerificationMethod) ?? []
      );
    });
    return verificationMethods;
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#derive-root-capability-from-didbtc1-identifier | 9.4.1 Derive Root Capability from did:btc1 Identifier}.
   *
   * The Derive Root Capability algorithm deterministically generates a ZCAP-LD root capability from a given did:btc1
   * identifier. Each root capability is unique to the identifier. This root capability is defined and understood by the
   * did:btc1 specification as the root capability to authorize updates to the specific did:btc1 identifiers DID
   * document. It takes in a did:btc1 identifier and returns a rootCapability object. It returns the root capability.
   *
   * @param {string} identifier The did-btc1 identifier to derive the root capability from
   * @returns {Btc1RootCapability} The root capability object
   * @example Root capability for updating the DID document for
   * did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u
   * ```
   * {
   *  "@context": "https://w3id.org/zcap/v1",
   *  "id": "urn:zcap:root:did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *  "controller": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *  "invocationTarget": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u"
   * }
   * ```
   */
  public static deriveRootCapability(identifier: string): Btc1RootCapability {
    // 1. Define rootCapability as an empty object.
    const rootCapability = {} as Btc1RootCapability;

    // 2. Set rootCapability.@context to ‘https://w3id.org/zcap/v1’.
    rootCapability['@context'] = W3C_ZCAP_V1;

    // 3. Set encodedIdentifier to result of calling algorithm encodeURIComponent(identifier).
    const encodedIdentifier = encodeURIComponent(identifier);

    // 4. Set rootCapability.id to urn:zcap:root:${encodedIdentifier}.
    rootCapability.id = `urn:zcap:root:${encodedIdentifier}`;

    // 5. Set rootCapability.controller to identifier.
    rootCapability.controller = identifier;

    // 6. Set rootCapability.invocationTarget to identifier.
    rootCapability.invocationTarget = identifier;

    // 7. Return rootCapability.
    return rootCapability;
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#dereference-root-capability-identifier | 9.4.2 Dereference Root Capability Identifier}.
   *
   * This algorithm takes in capabilityId, a root capability identifier, and dereferences it to rootCapability, the root
   * capability object.
   *
   * @param {string} capabilityId The root capability identifier to dereference.
   * @returns {Btc1RootCapability} The root capability object.
   * @example a didUpdatePayload with an invoked ZCAP-LD capability containing a patch defining how the DID document
   * for did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u SHOULD be mutated.
   * ```
   * {
   *  "@context": [
   *   "https://w3id.org/zcap/v1",
   *   "https://w3id.org/security/data-integrity/v2",
   *   "https://w3id.org/json-ld-patch/v1"
   *  ],
   *  "patch": [
   *   {
   *    "op": "add",
   *    "path": "/service/4",
   *    "value": {
   *       "id": "#linked-domain",
   *       "type": "LinkedDomains",
   *       "serviceEndpoint": "https://contact-me.com"
   *      }
   *    }
   *  ],
   *  "proof": {
   *    "type": "DataIntegrityProof",
   *    "cryptosuite": "schnorr-secp256k1-jcs-2025",
   *    "verificationMethod": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u#initialKey",
   *    "invocationTarget": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *    "capability": "urn:zcap:root:did%3Abtc1%3Ak1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *    "capabilityAction": "Write",
   *    "proofPurpose": "assertionMethod",
   *    "proofValue": "z381yXYmxU8NudZ4HXY56DfMN6zfD8syvWcRXzT9xD9uYoQToo8QsXD7ahM3gXTzuay5WJbqTswt2BKaGWYn2hHhVFKJLXaDz"
   *   }
   * }
   */
  public static derefernceRootCapabilityIdentifier(capabilityId: string): Btc1RootCapability {
    // 1. Set rootCapability to an empty object.
    const rootCapability = {} as Btc1RootCapability;

    // 2. Set components to the result of capabilityId.split(":").
    const [urn, zcap, root, did] = capabilityId.split(':') ?? [];

    // 3. Validate components:
    //    1. Assert length of components is 4.
    if ([urn, zcap, root, did].length !== 4) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid capabilityId: ${capabilityId}`);
    }

    //    2. components[0] == urn.
    if (!urn || urn !== 'urn') {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid capabilityId: ${capabilityId}`);
    }

    //    3. components[1] == zcap.
    if (!zcap || zcap !== 'zcap') {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid capabilityId: ${capabilityId}`);
    }

    //    4. components[2] == root.
    if (!root || root !== 'root') {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid capabilityId: ${capabilityId}`);
    }

    // 4. Set uriEncodedId to components[3].
    const uriEncodedId = did;

    // 5. Set btc1Identifier the result of decodeURIComponent(uriEncodedId).
    const btc1Identifier = decodeURIComponent(uriEncodedId);

    // 6. Set rootCapability.id to capabilityId.
    rootCapability.id = capabilityId;

    // 7. Set rootCapability.controller to btc1Identifier.
    rootCapability.controller = btc1Identifier;

    // 8. Set rootCapability.invocationTarget to btc1Identifier.
    rootCapability.invocationTarget = btc1Identifier;

    // 9. Return rootCapability.
    return rootCapability;
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#fetch-content-from-addressable-storage | 9.3. Fetch Content from Addressable Storage}.
   *
   * The Fetch Content from Addressable Storage function takes in SHA256 hash of some content, hashBytes, converts these
   * bytes to a IPFS v1 Content Identifier and attempts to retrieve the identified content from Content Addressable
   * Storage (CAS). It returns the retrieved content or null.
   *
   * @param {HashBytes} hashBytes The SHA256 hash of the content to be fetched.
   * @returns {string} The fetched content or null if not found.
   */
  public static async fetchFromCas(hashBytes: HashBytes): Promise<string | undefined> {
    // 1. Set cid to the result of converting hashBytes to an IPFS v1 CID.
    const cid = CID.create(1, 1, createDigest(1, hashBytes));

    // Create a Helia node connection to IPFS
    const helia = strings(await createHelia());

    // 2. Set content to the result of fetching the cid from a CAS system. Which CAS systems checked is up to implementation.
    Logger.warn('// TODO: Is this right? Are implementations just supposed to check all CAS they trust?');
    const content = await helia.get(cid, {});

    // 3. If content for cid cannot be found, set content to null.
    // 4. Return content.
    return content;
  }
}