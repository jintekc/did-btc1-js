import type { DidResolutionResult, DidVerificationMethod } from '@web5/dids';
import {
  Did,
  DidError,
  DidErrorCode,
  DidMethod,
  EMPTY_DID_RESOLUTION_RESULT
} from '@web5/dids';
import Client from 'bitcoin-core';
import { initEccLib } from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';
import { DidBtc1Create } from './crud/did-btc1-create.js';
import { DidBtc1Read } from './crud/did-btc1-resolve.js';
import { DidBtc1Update } from './crud/did-btc1-update.js';
import Bitcoind from './bitcoin/bitcoin-client.js';
import { ClientConfig } from './types/bitcoind.js';
import { DidBtc1Utils } from './utils/did-btc1-utils.js';
import {
  Btc1Networks,
  CreateResponse,
  DidBtc1CreateParams,
  DidBtc1IdTypes,
  DidBtc1ResolutionOptions,
  GetSigningMethod,
  UpdateParams
} from './types/btc1.js';

/** initEccLib */
initEccLib(tinysecp);

/**
 * @class
 * @name DidBtc1
 * @implements {DidMethod}
 * @description Implementation of the `did:btc1` DID method
 * @see {@link https://dcdpr.github.io/did-btc1/}
 */
export class DidBtc1 implements DidMethod {
  /** Name of the DID method, as defined in the DID BTC1 specification */
  public static methodName = 'btc1';
  public bitcoind?: Bitcoind;

  constructor(config?: ClientConfig) {
    this.bitcoind = config
      ? new Bitcoind(new Client(config))
      : Bitcoind.connect();
  }

  /**
   * @static @async @method
   * @name create
   * @description Create a new `did:btc1` identifier from a set of parameters
   * @param {DidBtc1CreateParams} params Required parameters for the create operation
   * @param {PublicKeyBytes} params.pubKeyBytes Public key byte array used to create a btc1 "key" identifier
   * @param {IntermediateDocument} params.intermediateDocument DID Document used to create a btc1 "external" identifier
   * @param {DidBtc1CreateOptions} params.options Optional parameters for the create operation
   * @param {string} params.options.idType Type of identifier to create (key or external)
   * @param {string} params.options.version Version number of the btc1 method (1, 2, 3, etc.)
   * @param {string} params.options.network Bitcoin network name (mainnet, testnet, signet, regtest)
   * @returns {CreateResponse} Promise resolving to an object containing the created DID and DID Document
   */
  static async create({
    pubKeyBytes,
    intermediateDocument,
    options = {}
  }: DidBtc1CreateParams): Promise<CreateResponse> {
    // Set the default version and network
    options.version ??= '1';
    options.network ??= 'mainnet';

    // Options Check 1: Validate that one of pubKeyBytes or intermediateDocument is not null
    if (!pubKeyBytes && !intermediateDocument) {
      throw new Error('Invalid param: pubKeyBytes or intermediateDocument required');
    }

    // Set default idType based on data passed
    options.idType ??= pubKeyBytes ? 'key' : 'external';

    // Deconstruct optional options
    const { idType, version, network } = options;

    // Options Check 2: Validate that the idType is set to either key or external
    if (!(idType in DidBtc1IdTypes)) {
      throw new Error('Invalid option: idType required, must be key or external');
    }

    // Options Check 3: Validate pubKeybytes exists if idType = key
    if (!pubKeyBytes && idType === 'key') {
      throw new Error('Invalid param-option: pubKeyBytes required if idType is key');
    }

    // Options Check 4: Validate intermediateDocument exists if idType = external
    if (!intermediateDocument && idType === 'external') {
      throw new Error('Invalid param-option: intermediateDocument required if idType is external');
    }

    // Options Check 5: Validate network in Btc1Networks if not null
    if (!(network in Btc1Networks)) {
      throw new Error('Invalid option: network required, must be mainnet, testnet, signet or regtest');
    }

    // Options Check 6: Validate version as positive number if not null
    if (isNaN(Number(version))) {
      throw new Error('Invalid option: version required, must be positive number');
    }

    pubKeyBytes = pubKeyBytes!;
    intermediateDocument = intermediateDocument!;

    // If idType is key, call DidBtc1Create.deterministic; else call DidBtc1Create.external
    return idType === 'key'
      ? DidBtc1Create.deterministic({ version, network, pubKeyBytes })
      : await DidBtc1Create.external({ network, version, intermediateDocument });
  }

  /**
   * @static @async @method
   * @name resolve
   * @description Resolve a `did: btc1` identifier to its corresponding DID document
   * @param {string} identifier The DID to be resolved
   * @param {DidResolutionOptions} options Optional parameters for the resolution operation
   * @param {Btc1DidDocument} options.sidecarData.initialDocument User-provided, offline DID Document to resolve sidecar
   * @returns {DidResolutionResult} Promise resolving to a DID Resolution Result
   * @throws {Error} if the resolution fails for any reason
   * @throws {DidError} with {@link DidErrorCode.InvalidDid} if the identifier is invalid
   * @example
   * ```ts
   * const did = 'did:btc1:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh';
   * const resolutionResult = await DidBtc1.resolve(did);
   * ```
   */
  static async resolve(identifier: string, options: DidBtc1ResolutionOptions = {}): Promise<DidResolutionResult> {
    try {
      // Parse the identifier into its components
      const identifierComponents = DidBtc1Utils.parse(identifier);
      const { hrp, genesisBytes, version, network, } = identifierComponents;

      // Set the default resolution result
      const didResolutionResult = {
        '@context'            : 'https://w3id.org/did-resolution/v1',
        didResolutionMetadata : {},
        didDocumentMetadata   : {}
      } as DidResolutionResult;

      //  Make sure options.sidecarData is not null if hrp === x
      if (hrp === 'x' && !options.sidecarData) {
        throw new DidError(DidErrorCode.InvalidDid, 'External resolution required for non-deterministic DIDs');
      }

      // Resolve the DID Document based on the hrp
      const initialDocument = hrp === 'x'
        ? await DidBtc1Read.external({ identifier, identifierComponents, options })
        : DidBtc1Read.deterministic({ version, network, pubKeyBytes: genesisBytes });

      didResolutionResult.didDocument = await DidBtc1Read.targetDocument({ initialDocument, options });
      // Return the resolved DID Document
      return didResolutionResult;
    } catch (error: any) {
      console.error(error);
      // Rethrow any unexpected errors that are not a `DidError`.
      if (!(error instanceof DidError)) throw new Error(error);

      // Return a DID Resolution Result with the appropriate error code.
      return {
        ...EMPTY_DID_RESOLUTION_RESULT,
        didResolutionMetadata : {
          error : error.code,
          ...error.message && { errorMessage: error.message }
        }
      };
    }
  }

  /**
   * @static @async @method
   * @name update
   * @description Update a `did: btc1` DID Document with a JSON patch
   * @param {UpdateParams} params Required parameters for the update operation
   * @param {string} params.identifier The DID to be updated
   * @param {Btc1DidDocument} params.sourceDocument The source document to be updated
   * @param {string} params.sourceVersionId The versionId of the source document
   * @param {Btc1DocumentPatch} params.documentPatch The JSON patch to be applied to the source document
   * @param {string} params.verificationMethodId The verificationMethod ID to sign the update
   * @param {string[]} params.beaconIds The beacon IDs to announce the update
   * @param {ProofOptions} params.options Optional parameters for the update operation
   * @returns {Promise<void>} Promise resolving to void
   * @throws {DidError} with {@link DidErrorCode.InvalidDidDocument} if the publicKeyMultibase is malformed
   * or if the verificationMethod type is not Multikey
   */
  static async update({
    identifier,
    sourceDocument,
    sourceVersionId,
    documentPatch,
    verificationMethodId,
    beaconIds,
    options
  }: UpdateParams): Promise<void> {
    // Construct an unsigned update payload
    const updatePayload = DidBtc1Update.constructPayload({
      identifier,
      documentPatch,
      sourceDocument,
      sourceVersionId,
    });
    const didDocument = sourceDocument;
    // Get the sourceDocument verificationMethods and filter for the verificationMethodId passed
    const verificationMethod = DidBtc1Utils.getVerificationMethods({ didDocument }).filter(
      vm => vm.id === verificationMethodId
    )?.[0];
    // Validate the verificationMethod type is Multikey
    if (verificationMethod.type !== 'Multikey') {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Verification method must be of type Multikey');
    }
    // Validate the first 4 chars as z66P of the verificationMethod publicKeyMultibase
    if (verificationMethod.publicKeyMultibase?.slice(0, 4) !== 'z662') {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Malformed verification method publicKeyMultibase');
    }
    const didUpdateInvocation = DidBtc1Update.invokePayload({ identifier, updatePayload, verificationMethod, options });
    return DidBtc1Update.announcePayload({ sourceDocument, beaconIds, didUpdateInvocation });
  }

  /**
   * @static @async @method
   * @name getSigningMethod
   * @summary Given the W3C DID Document of a `did: btc1` DID, return the verification signing method used
   * @description
   * Given the W3C DID Document of a `did: btc1` DID, return the verification method that will be used
   * for signing messages and credentials. If given, the `methodId` parameter is used to select the
   * verification method. If not given, the Identity Key's verification method with an ID fragment
   * of '#initialKey' is used.
   * @param {GetSigningMethod} params The parameters for the `getSigningMethod` operation
   * @param {DidDocument} params.didDocument DID Document to get the verification method from
   * @param {string} params.methodId Optional ID of the verification method to use for signing
   * @returns {DidVerificationMethod} Promise resolving to the verification method used for signing
   * @throws {DidError} with {@link DidErrorCode.InternalError} if an error occurs during getSigningMethod
   * or with {@link DidErrorCode.MethodNotSupported} if signing method could not be determined
   */
  static async getSigningMethod({ didDocument, methodId }: GetSigningMethod): Promise<DidVerificationMethod> {
    methodId ??= '#initialKey';
    // Verify the DID method is supported.
    const parsedDid = Did.parse(didDocument.id);
    if (parsedDid && parsedDid.method !== this.methodName) {
      throw new DidError(DidErrorCode.MethodNotSupported, `Method not supported: ${parsedDid.method} `);
    }
    // Attempt to find a verification method that matches the given method ID, or if not given,
    // find the first verification method intended for signing claims.
    const verificationMethod = didDocument.verificationMethod?.find(
      vm => DidBtc1Utils.extractDidFragment(vm.id) === (DidBtc1Utils.extractDidFragment(methodId)
        ?? DidBtc1Utils.extractDidFragment(didDocument.assertionMethod?.[0]))
    );
    if (!(verificationMethod && verificationMethod.publicKeyJwk)) {
      throw new DidError(
        DidErrorCode.InternalError,
        'A verification method intended for signing could not be determined from the DID Document'
      );
    }
    return verificationMethod;
  }
}