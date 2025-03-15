import { Canonicalize } from '@did-btc1/cryptosuite';
import { PublicKey } from '@did-btc1/key-pair';
import { sha256 } from '@noble/hashes/sha256';
import { bech32 } from '@scure/base';
import type { DidService, DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { getNetwork } from '../../bitcoin/network.js';
import { DidBtc1 } from '../../did-btc1.js';
import { ID_PLACEHOLDER_VALUE } from '../constants.js';
import { Btc1DidDocument } from '../did-document.js';
import { DidCreateResponse, IntermediateVerificationMethod } from '../interface.js';
import { CreateIdentifierParams, DidCreateDeterministic, DidCreateExternal } from '../types.js';
import { Btc1Utils } from '../utils.js';
/**
 * Implements section {@link https://dcdpr.github.io/did-btc1/#create | 4.1 Create}
 *
 * A did:btc1 identifier and associated DID document can either be created deterministically from a cryptographic seed,
 * or it can be created from an arbitrary genesis intermediate DID document representation. In both cases, DID creation
 * can be undertaken in an offline manner, i.e., the DID controller does not need to interact with the Bitcoin network
 * to create their DID.
 *
 * @export
 * @class Btc1Create
 * @type {Btc1Create}
 */
export class Btc1Create {
  /**
     * Create a did:btc1 identifier and associated DID Document deterministically from public key bytes
     * @param {CreateDeterministic} params Required params for calling the deterministic method
     * @param {string} params.version did-btc1 identifier version
     * @param {string} params.network did-btc1 bitcoin network
     * @param {PublicKeyBytes} params.pubKeyBytes public key bytes for id creation
     * @returns {CreateResponse} object containing the created did and initial document
     */
  static deterministic({ version, network, publicKey }: DidCreateDeterministic): DidCreateResponse {
    // Create key-type identifier from genesisBytes
    const identifier = this.identifier({ idType: 'key', network, version, genesisBytes: publicKey });
    // Get xOnlyPublicKey from publicKey
    const publicKeyMultibase = new PublicKey(publicKey).multibase;
    // Generate the beacon services from the network and public key
    const service = Btc1Utils.generateBeaconServices({ network: getNetwork(network), publicKey });
    // Return did & initialDocument
    return {
      did             : identifier,
      initialDocument : {
        '@context' : [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
          'https://github.com/dcdpr/did-btc1'
        ],
        id                   : identifier,
        authentication       : ['#initialKey'],
        assertionMethod      : ['#initialKey'],
        capabilityInvocation : ['#initialKey'],
        capabilityDelegation : ['#initialKey'],
        verificationMethod   : [{
          id                 : '#initialKey',
          type               : 'Multikey',
          controller         : identifier,
          publicKeyMultibase,
        }],
        service
      }
    };
  }

  /**
   * @static @async @method
   * @name external
   * @description Create an external identifier and document
   * @param {CreateExternal} params Required params for calling the external method
   * @param {string} params.version: identifier version
   * @param {string} params.network: bitcoin network name
   * @param {PublicKeyBytes} params.pubKeyBytes: public key bytes used for the identifier
   * @param {string} params.initialDocument: Intermediate DID Document to add the deterministic DID to.
   * @returns a Promise resolving to a @see {@link CreateResponse} object
   * @throws a {@link DidError} if the verificationMethod or service objects are missing required properties
   */
  static async external({ network, version, intermediateDocument }: DidCreateExternal): Promise<DidCreateResponse> {
    // Deconstruct vm and service from intermediateDocument
    const { verificationMethod, service } = intermediateDocument ?? {};

    // Validate verificationMethod not null and contains at least one object
    if (!verificationMethod || !verificationMethod.length) {
      throw new DidError(
        DidErrorCode.InvalidDidDocument, 'At least one verificationMethod object required'
      );
    }
    // Validate the properties for each verificationMethod object in the document
    if (verificationMethod?.some((vm: DidVerificationMethod) => !(vm.id || vm.type || vm.publicKeyMultibase))) {
      throw new DidError(
        DidErrorCode.InvalidDidDocument,
        'One or more verificationMethod objects missing required properties'
      );
    }

    // TODO: more validation of Beacon Services objects
    // Validate service not null and contains at least one object
    if (!service || !service.length) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'At least one service object required');
    }

    // Validate the properties for each service
    if (service?.some((s: DidService) => !(s.id || s.type || s.serviceEndpoint))) {
      throw new DidError(
        DidErrorCode.InvalidDidDocument, 'One or more service objects missing required properties'
      );
    }

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    if (intermediateDocument.id !== ID_PLACEHOLDER_VALUE) {
      intermediateDocument.id = ID_PLACEHOLDER_VALUE;
    }

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod = verificationMethod.map(
      (vm: IntermediateVerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const genesisBytes = sha256(Buffer.from(Canonicalize.jcs(intermediateDocument)));
    // Set idType to external
    const idType = 'external';
    // Set did to result of createIdentifier
    const did = this.identifier({ idType, genesisBytes, version, network });

    // Create copy of intermediateDocument initialDocument as DidDocument
    const initialDocument = intermediateDocument as Btc1DidDocument;
    // Set initialDocument id to did.
    initialDocument.id = did;
    // Set verificationMethod.controller to did.
    initialDocument.verificationMethod = verificationMethod.map(
      (vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // Return DID & DID Document.
    return { did, initialDocument };
  }

  /**
   * @description: Create a `did:btc1` identifier from a set of parameters.
     * For required params, @see {@link CreateIdentifierParams}.
     * @param params.idType: string used to determine the type of id to create (key or external).
     * @param params.network: string bitcoin network name used for the id.
     * @param params.version: number of the btc1 method version used for the id.
     * @param params.genesisBytes: uint8array of bytes used to initialize the id.
     * @returns: string btc1 identifier.
     */
  public static identifier({ idType, network, version, genesisBytes }: CreateIdentifierParams): string {
    // Set version to 1 if not passed
    const v = Number(version) || 1;
    // Set the hrp based on idType
    const hrp = idType === 'key' ? 'k' : 'x';
    // Set the base did method prefix
    let didMethodPrefix = `did:${DidBtc1.methodName}`;
    // If version > 1, append it to the didMethodPrefix
    if (v > 1) {
      didMethodPrefix = `${didMethodPrefix}:${version}`;
    }
    // If network !== mainnet, append it to the didMethodPrefix
    if (network !== 'mainnet') {
      didMethodPrefix = `${didMethodPrefix}:${network}`;
    }
    // Create DID from method prefix and Bech32 encoded public key
    return `${didMethodPrefix}:${bech32.encodeFromBytes(hrp, genesisBytes)}`;
  }
}