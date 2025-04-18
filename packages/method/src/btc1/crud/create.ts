import { Btc1CreateIdTypes, Btc1Error, ID_PLACEHOLDER_VALUE, INVALID_DID_DOCUMENT, PublicKeyBytes } from '@did-btc1/common';
import { PublicKey } from '@did-btc1/key-pair';
import { Btc1CreateResponse } from '../../did-btc1.js';
import { Btc1Appendix } from '../../utils/appendix.js';
import { BeaconUtils } from '../../utils/beacons.js';
import { Btc1DidDocument, Btc1VerificationMethod, IntermediateDidDocument } from '../../utils/did-document.js';
import { Btc1Identifier } from '../../utils/identifier.js';

/**
 * Implements section {@link https://dcdpr.github.io/did-btc1/#create | 4.1 Create}.
 *
 * A did:btc1 identifier and associated DID document can either be created deterministically from a cryptographic seed,
 * or it can be created from an arbitrary genesis intermediate DID document representation. In both cases, DID creation
 * can be undertaken in an offline manner, i.e., the DID controller does not need to interact with the Bitcoin network
 * to create their DID.
 *
 * @class Btc1Create
 * @type {Btc1Create}
 */
export class Btc1Create {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#deterministic-key-based-creation | 4.1.1 Deterministic Key-Based Creation}.
   *
   * For deterministic key-based creation, the did:btc1 identifier encodes a secp256k1 public key. The key is then used
   * to deterministically generate the initial DID document.
   *
   * @param {Btc1CreateKeyParams} params See {@link Btc1CreateKeyParams} for details.
   * @param {number} params.version did-btc1 identifier version.
   * @param {string} params.network did-btc1 bitcoin network.
   * @param {PublicKeyBytes} params.pubKeyBytes public key bytes for id creation.
   * @returns {Btc1CreateResponse} A response object of type {@link Btc1CreateResponse}.
   * @throws {DidError} if the public key is missing or invalid.
   */
  public static key({ version, network, pubKeyBytes }: {
    version: number;
    network: string;
    pubKeyBytes: PublicKeyBytes;
  }): Btc1CreateResponse {
    // Set idType to "KEY"
    const idType = Btc1CreateIdTypes.KEY;

    // Set publicKey to genesisBytes
    const genesisBytes = pubKeyBytes;

    // Set beaconType to "SingletonBeacon"
    const beaconType = 'SingletonBeacon';

    // Call the the did:btc1 Identifier Encoding algorithm
    const did = Btc1Identifier.encode({ version, network, idType, genesisBytes, });

    // Instantiate PublicKey object and get the multibase formatted publicKey
    const publicKeyMultibase = new PublicKey(genesisBytes).multibase;

    // Generate SingletonBeacon services
    const services = BeaconUtils.generateBeaconServices({ publicKey: genesisBytes, network, beaconType, });

    // Create initialDocument ensuring conformant to spec as Btc1DidDocument
    const initialDocument = new Btc1DidDocument({
      id                 : did,
      service            : services,
      verificationMethod : [{
        id                 : '#initialKey',
        type               : 'Multikey',
        controller         : did,
        publicKeyMultibase,
      }],
    });

    // Return did & initialDocument
    return { did, initialDocument };
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#external-initial-document-creation | 4.1.2 External Initial Document Creation}.
   *
   * Creates a did:btc1 identifier from some initiating arbitrary DID document. This allows for more complex
   * initial DID documents, including the ability to include Service Endpoints and Beacons that support aggregation.
   * Inputs include `intermediateDocument`, optional version and network returning initialDidDocument. The
   * intermediateDocument should be a valid DID document except all places where the DID document requires the use of
   * the identifier (e.g. the id field). These fields should use placeholder value
   * `did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. The intermediateDocument should include at
   * least one verificationMethod and service of the type SingletonBeacon.
   *
   * @param {Btc1CreateExternalParams} params See {@link Btc1CreateExternalParams} for details.
   * @param {number} params.version Identifier version.
   * @param {string} params.network Identifier network name.
   * @param {string} params.documentBytes Intermediate DID Document bytes.
   * @returns {Btc1CreateResponse} A Promise resolving to {@link Btc1CreateResponses}.
   * @throws {DidError} if the verificationMethod or service objects are missing required properties
   */
  public static async external({ network, version, intermediateDocument }: {
    version: number;
    network: string;
    intermediateDocument: IntermediateDidDocument;
  }): Promise<Btc1CreateResponse> {
    // Deconstruct vm and service from intermediateDocument
    const { verificationMethod, service } = intermediateDocument ?? {};

    // Validate verificationMethod not null and contains at least one object
    if (!verificationMethod || !verificationMethod.length) {
      throw new Btc1Error('At least one verificationMethod object required', INVALID_DID_DOCUMENT, verificationMethod);
    }

    // Validate the properties for each verificationMethod object in the document
    if (!verificationMethod.every(Btc1Appendix.isDidVerificationMethod)) {
      throw new Btc1Error('Invalid verificationMethod object(s)', INVALID_DID_DOCUMENT, verificationMethod);
    }

    // Validate service not null and contains at least one object
    if (!service || !service.length) {
      throw new Btc1Error('At least one service object required', INVALID_DID_DOCUMENT, service);
    }

    // Validate service not null and contains at least one object
    if (!service.every(BeaconUtils.isBeaconService)) {
      throw new Btc1Error('Invalid service object(s)', INVALID_DID_DOCUMENT, service);
    }

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    if (intermediateDocument.id !== ID_PLACEHOLDER_VALUE) {
      intermediateDocument.id = ID_PLACEHOLDER_VALUE;
    }

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod = verificationMethod.map(
      (vm: Btc1VerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // 4. Set genesisBytes to the result of passing intermediateDocument into the JSON Canonicalization and Hash
    //    algorithm.
    const genesisBytes = await JSON.canonicalization.canonicalhash(intermediateDocument);

    // Set did to result of createIdentifier
    const did = Btc1Identifier.encode({ idType: Btc1CreateIdTypes.EXTERNAL, genesisBytes, version, network });

    // Set initialDocument id to did.
    intermediateDocument.id = did;

    // Set verificationMethod.controller to did.
    intermediateDocument.verificationMethod = verificationMethod.map(
      (vm: Btc1VerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // Convert intermediateDocument to Btc1DidDocument
    const initialDocument = new Btc1DidDocument(intermediateDocument);

    // Return DID & DID Document.
    return { did, initialDocument };
  }
}