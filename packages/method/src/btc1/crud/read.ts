import { BitcoinNetworkNames, Btc1Error, Btc1ReadError, canonicalization, DidUpdatePayload, INVALID_DID_DOCUMENT, LATE_PUBLISHING_ERROR, Logger, UnixTimestamp } from '@did-btc1/common';
import { Cryptosuite, DataIntegrityProof, Multikey } from '@did-btc1/cryptosuite';
import { KeyPair, PublicKey } from '@did-btc1/key-pair';
import { bytesToHex } from '@noble/hashes/utils';
import type { DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { DEFAULT_BLOCK_CONFIRMATIONS, GENESIS_TX_ID, TXIN_WITNESS_COINBASE } from '../../bitcoin/constants.js';
import { getNetwork } from '../../bitcoin/network.js';
import BitcoinRpc from '../../bitcoin/rpc-client.js';
import { DidResolutionOptions } from '../../interfaces/crud.js';
import { BeaconServiceAddress, BeaconSignal, Signal } from '../../interfaces/ibeacon.js';
import { BlockHeight, BlockV3, RawTransactionV2 } from '../../types/bitcoin.js';
import { CIDAggregateSidecar, SignalsMetadata, SingletonSidecar } from '../../types/crud.js';
import { Btc1Appendix, DidComponents } from '../../utils/btc1/appendix.js';
import { BeaconUtils } from '../../utils/btc1/beacon-utils.js';
import { ID_PLACEHOLDER_VALUE, VALID_HRP } from '../../utils/btc1/constants.js';
import { Btc1DidDocument } from '../../utils/btc1/did-document.js';
import JsonPatch from '../../utils/json-patch.js';
import { BeaconFactory } from '../beacons/factory.js';

canonicalization.setAlgorithm('JCS');

export type NetworkVersion = {
  version?: string;
  network?: string;
};
export type ResolveInitialDocument = {
  identifier: string;
  components: DidComponents;
  options: DidResolutionOptions;
};

// Deterministic
export interface Btc1ReadDeterministic {
  components: DidComponents;
  identifier: string;
};

// External
export interface Btc1ReadExternal {
  components: DidComponents;
  identifier: string;
  options: DidResolutionOptions;
}
export interface Btc1ReadSidecar {
  components: DidComponents;
  initialDocument: Btc1DidDocument;
};
export interface DidReadCas {
  identifier: string;
  components: DidComponents;
}

// Methods
export interface ApplyDidUpdateParams {
  contemporaryDIDDocument: Btc1DidDocument;
  update: DidUpdatePayload;
}

export interface TargetDocumentParams {
  initialDocument: Btc1DidDocument;
  options: DidResolutionOptions;
};

export interface TargetBlockheightParams {
  network: BitcoinNetworkNames;
  targetTime?: UnixTimestamp;
}

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#read | 4.2 Read}.
 * The read operation is executed by a resolver after a resolution request identifying a specific did:btc1 identifier is
 * received from a client at Resolution Time. The request MAY contain a resolutionOptions object containing additional
 * information to be used in resolution. The resolver then attempts to resolve the DID document of the identifier at a
 * specific Target Time. The Target Time is either provided in resolutionOptions or is set to the Resolution Time of the
 * request.
 * To do so it executes the following algorithm:
 *  1. Let identifierComponents be the result of running the algorithm
 *     in Parse did:btc1 identifier, passing in the identifier.
 *  2. Set initialDocument to the result of running Resolve Initial Document
 *     passing identifier, identifierComponents and resolutionOptions.
 *  3. Set targetDocument to the result of running the algorithm in Resolve
 *     Target Document passing in initialDocument and resolutionOptions.
 *  4. Return targetDocument.
 *
 * @class Btc1Read
 * @type {Btc1Read}
 */
export class Btc1Read {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#deterministically-generate-initial-did-document | 4.2.2.1 Deterministically Generate Initial DID Document}.
   *
   * This algorithm Deterministically Generate Initial DID Document algorithm deterministically generates an initial DID
   * Document from a secp256k1 public key. It takes in a did:btc1 identifier and a identifierComponents object and
   * returns an initialDocument.
   *
   * @param {Btc1ReadDeterministic} params See {@link Btc1ReadDeterministic} for details.
   * @param {string} params.identifier The did-btc1 version.
   * @param {DidComponents} params.components The name of the bitcoin network (mainnet, testnet, regtest).
   * @returns {Btc1DidDocument} The resolved DID Document object.
   */
  public static deterministic({ identifier, components }: {
    identifier: string;
    components: DidComponents;
  }): Btc1DidDocument {
    // Deconstruct the components
    const { network: networkName, genesisBytes } = components;

    // Construct a new PublicKey
    const { x, encode } = new PublicKey(genesisBytes);

    const service = BeaconUtils.generateBeaconServices({
      network    : getNetwork(networkName),
      beaconType : 'SingletonBeacon',
      publicKey  : x
    });

    // Return the resolved DID Document object
    return new Btc1DidDocument({
      id                   : identifier,
      verificationMethod   : [{
        id                 : '#initialKey',
        type               : 'Multikey',
        controller         : identifier,
        // Encode the public key to publicKeyMultibase
        publicKeyMultibase : encode()
      }],
      // Generate the beacon services from the network and public key
      service
    });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#external-resolution | 4.2.2.2 External Resolution}.
   *
   * The External Resolution algorithm externally retrieves an intermediateDocumentRepresentation, either by retrieving
   * it from Content Addressable Storage (CAS) or from the Sidecar Data provided as part of the resolution request. It
   * takes in a did:btc1 identifier, a identifierComponents object and a resolutionOptions object. It returns an
   * initialDocument, which is a conformant DID document validated against the identifier.
   *
   * @param {Btc1ReadExternal} params Required params for calling the external method.
   * @param {string} params.identifier The DID to be resolved.
   * @param {DidComponents} params.components The components of the identifier.
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document.
   * @param {Btc1DidDocument} params.options.sidecarData The sidecar data for resolving the DID Document.
   * @param {Btc1DidDocument} params.options.sidecarData.initialDocument The offline user-provided DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  public static async external({ identifier, components, options }: {
    identifier: string;
    components: DidComponents;
    options: DidResolutionOptions;
  }): Promise<Btc1DidDocument> {
    // Deconstruct the options
    const { initialDocument } = options.sidecarData as CIDAggregateSidecar;

    // Validate the initialDocument is not null
    if(!initialDocument) {
      throw new Btc1Error(INVALID_DID_DOCUMENT, 'Initial document is required for external resolution', initialDocument);
    }

    // If initialDocument is not null, call the sidecar method, otherwise call the cas method
    return initialDocument
      ? await this.sidecar({ components, initialDocument })
      : await this.cas({ identifier, components });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#sidecar-initial-document-validation | 4.2.2.2.1 Sidecar Initial Document Validation}.
   *
   * The Sidecar Initial Document Validation algorithm validates an initialDocument against its identifier, by first
   * constructing the intermediateDocumentRepresentation and verifying the hash of this document matches the bytes
   * encoded within the identifier. It takes in a did:btc1 identifier, identifierComponents and a
   * initialDocument. It returns the initialDocument if validated, otherwise it throws an error.
   *
   * @param {Btc1ReadSidecar} params Required params for calling the sidecar method
   * @param {string} params.identifier The DID to be resolved
   * @param {DidComponents} params.components The components of the DID identifier
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document provided by the user
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} InvalidDidDocument if genesisBytes !== initialDocument hashBytes
   */
  public static async sidecar({ components, initialDocument }: Btc1ReadSidecar): Promise<Btc1DidDocument> {
    // Set intermediateDocument to a copy of initialDocument
    const intermediateDocument = initialDocument;

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.id = ID_PLACEHOLDER_VALUE;

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod =
          Btc1Appendix.getVerificationMethods({ didDocument: intermediateDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id }));

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const hashBytes = await canonicalization.process(intermediateDocument);

    // Validate the genesisBytes match the hashBytes
    const genesisBytes = bytesToHex(components.genesisBytes);
    if (genesisBytes !== hashBytes) {
      throw new Btc1Error(
        INVALID_DID_DOCUMENT,
        `Initial document mismatch: genesisBytes ${genesisBytes} !== hashBytes ${hashBytes}`
      );
    }

    return new Btc1DidDocument(initialDocument);
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#cas-retrieval | 4.2.2.2.2 CAS Retrieval}.
   *
   * The CAS Retrieval algorithm attempts to retrieve an initialDocument from a Content Addressable Storage (CAS) system
   * by converting the bytes in the identifier into a Content Identifier (CID). It takes in an identifier and
   * an identifierComponents object. It returns an initialDocument.
   *
   * @param {DidReadCas} params Required params for calling the cas method
   * @param {string} params.identifier BTC1 DID used to resolve the DID Document
   * @param {DidComponents} params.components BTC1 DID components used to resolve the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {Btc1Error} if the DID Document content is invalid
   */
  public static async cas({ identifier, components }: DidReadCas): Promise<Btc1DidDocument> {
    // Set hashBytes to genesisBytes
    const hashBytes = components.genesisBytes;

    // Fetch the intermediateDocument from the CAS using the hashBytes
    const intermediateDocument = await Btc1Appendix.fetchFromCas(hashBytes);

    // Validate the intermediateDocument is parsable JSON
    if (!intermediateDocument || !JSON.parsable(intermediateDocument)) {
      throw new Btc1Error(INVALID_DID_DOCUMENT, 'Invalid DID Document content', { intermediateDocument });
    }

    // Parse the intermediateDocument into a Btc1DidDocument object
    const initialDocument = JSON.parse(intermediateDocument) as Btc1DidDocument;

    // Set the initialDocument id and verification method controller to the identifier
    initialDocument.id = identifier;
    initialDocument.verificationMethod =
          Btc1Appendix.getVerificationMethods({ didDocument: initialDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: initialDocument.id }));

    // Return the resolved initialDocument
    return new Btc1DidDocument(initialDocument);
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#resolve-initial-document | 4.2.2 Resolve Initial Document}.
   *
   * This algorithm resolves an initial DID document and validates it against the identifier for a specific did:btc1.
   * The algorithm takes in a did:btc1 identifier, identifier components object, resolutionsOptions object and returns
   * a valid initialDocument for that identifier.
   *
   * @public
   * @param {ResolveInitialDocument} params See {@link ResolveInitialDocument} for parameter details.
   * @param {string} params.identifier The DID to be resolved.
   * @param {DidComponents} params.components The components of the identifier.
   * @param {DidResolutionOptions} params.options See {@link DidResolutionOptions} for resolving the DID Document.
   * @returns {Promise<Btc1DidDocument>} The resolved DID Document object.
   * @throws {DidError} if the DID hrp is invalid, no sidecarData passed and hrp = "x".
   */
  public static async initialDocument({ identifier, components, options }: {
      identifier: string;
      components: DidComponents;
      options: DidResolutionOptions
    }): Promise<Btc1DidDocument> {
    // Deconstruct the hrp from the components
    const hrp = components.hrp;

    // Validate the hrp is either 'k' or 'x'
    if(!VALID_HRP.includes(hrp)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid DID hrp ${hrp}`);
    }

    //  Make sure options.sidecarData is not null if hrp === x
    if (hrp === 'x' && !options.sidecarData) {
      throw new DidError(DidErrorCode.InvalidDid, 'External resolution required for non-deterministic DIDs');
    }

    return hrp === 'k'
      ? this.deterministic({ identifier, components })
      : await this.external({ identifier, components, options });

  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#resolve-target-document | 4.2.3 Resolve Target Document}.
   *
   * The Resolve Target Document algorithm resolves a DID document from an initial document by walking the Bitcoin
   * blockchain to identify Beacon Signals that announce DID Update Payloads applicable to the did:btc1 identifier being
   * resolved. It takes as inputs initialDocument, resolutionOptions and network. It returns a valid DID document.
   *
   * @public
   * @param {TargetDocumentParams} params See {@link TargetDocumentParams} for details.
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document to resolve
   * @param {ResolutionOptions} params.options See {@link DidResolutionOptions} for details.
   * @returns {Btc1DidDocument} The resolved DID Document object with a validated single, canonical history
   */
  public static async targetDocument({ initialDocument, options }: {
    initialDocument: Btc1DidDocument;
    options: DidResolutionOptions;
  }): Promise<Btc1DidDocument> {
    // Set the network from the options or default to mainnet
    const network = options.network ?? 'mainnet';

    // If options.versionId is not null, set targetVersionId to options.versionId
    const targetVersionId = options.versionId;

    // If options.versionTime is not null, set targetTime to options.versionTime
    const targetTime = options.versionTime;

    // Set the targetBlockheight to the result of passing targetTime to the algorithm Determine Target Blockheight
    const targetBlockHeight = await this.determineTargetBlockHeight({ network, targetTime });

    // Get signalsMetadata from sidecarData if it exists
    const signalsMetadata = (options.sidecarData as SingletonSidecar).signalsMetadata;

    // Set currentVersionId to 1
    const currentVersionId = 1;

    // If the targetVersionId equals currentVersionId, return initialDocument
    if(currentVersionId === targetVersionId) {
      return new Btc1DidDocument(initialDocument);
    }

    // Set updateHashHistory to an empty array
    const updateHashHistory = new Array();

    // Set contemporaryBlockheight to 0
    const contemporaryBlockHeight = 0;

    // Set contemporaryDIDDocument to initialDocument.
    const contemporaryDIDDocument = initialDocument;

    // Set targetDocument to the result of passing contemporaryDIDDocument, contemporaryBlockheight,
    // currentVersionId, targetVersionId, targetBlockheight, updateHashHistory, and sidecarData
    // to the Traverse Blockchain History algorithm.
    return this.traverseBlockchainHistory({
      contemporaryDIDDocument,
      contemporaryBlockHeight,
      currentVersionId,
      targetVersionId,
      targetBlockHeight,
      updateHashHistory,
      signalsMetadata,
      network
    });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#determine-target-blockheight | 4.2.3.1 Determine Target Blockheight}.
   *
   * The Determine Target Blockheight algorithm determines the targetted Bitcoin blockheight that the resolution
   * algorithm should traverse the blockchain history up to looking for for Beacon Signals. It takes in network and
   * targetTime. It returns a Bitcoin blockheight.
   *
   * @protected
   * @param {TargetBlockheightParams} params The parameters for the determineTargetBlockHeight operation.
   * @param {BitcoinNetworkNames} params.network The bitcoin network to connect to (mainnet, signet, testnet, regtest).
   * @param {?UnixTimestamp} params.targetTime Unix timestamp used to find highest block height < targetTime.
   * If not provided, finds the highest bitcoin block height where confirmations > {@link DEFAULT_BLOCK_CONFIRMATIONS}.
   * @returns {BlockHeight} The target blockheight.
   */
  protected static async determineTargetBlockHeight({ network, targetTime }: {
    network: BitcoinNetworkNames;
    targetTime?: UnixTimestamp;
  }): Promise<BlockHeight> {
    Logger.warn('// TODO: determineTargetBlockHeight - Use network to connect to the correct bitcoin node', network);

    // If bitcoinClient is not defined, connect to default bitcoin node
    const rpc = BitcoinRpc.connect();

    // Get the current block chain tip
    let tip = await rpc.getBlockCount();

    // Set the genesis index (left side of the search space) to 0
    let genesis = 0;

    // Set the target to 0
    let target = 0;

    // 1. If targetTime, find the Bitcoin block height where timestamp < targetTime.
    if(targetTime) {
      // Use a binary search algorithm to find the block height
      // Loop until the genesis index is less than or equal to the tip
      while (genesis <= tip) {
      // Set the mid index
        const mid = Math.floor((genesis + tip) / 2);

        // Get the block data at "mid" height
        const block = await rpc.getBlock({ height: mid }) as BlockV3;

        // Check if block.time < targetTime
        if (block.time < targetTime) {
          // Reset target to the mid index going higher
          target = mid;
          // Reset genesis to mid + 1
          genesis = mid + 1;
        } else {
        // Reset tip to mid - 1 going lower
          tip = mid - 1;
        }
      }

      // 4. Return the blockheight
      return target;
    }

    // 2. Else find the Bitcoin block with the greatest blockheight that has at least X DEFAULT_BLOCK_CONFIRMATIONS.
    Logger.warn('// TODO: determineTargetBlockHeight - TODO: what is X. Is it variable?');

    let block = await rpc.getBlock({ height: tip }) as BlockV3;
    while (block.confirmations <= DEFAULT_BLOCK_CONFIRMATIONS) {
      // block.hash = await rpc.getBlockHash();
      block = await rpc.getBlock({ height: --block.height }) as BlockV3;
    }

    // 4. Return the block height
    return block.height;

  }

  /**
   * TODO: Need to finish implementing the traverseBlockchainHistory method
   *
   * Implements {@link https://dcdpr.github.io/did-btc1/#traverse-blockchain-history | 4.2.3.2 Traverse Blockchain History}.
   *
   * The Traverse Blockchain History algorithm traverses Bitcoin blocks, starting from the block with the
   * contemporaryBlockheight, to find beaconSignals emitted by Beacons within the contemporaryDIDDocument. Each
   * beaconSignal is processed to retrieve a didUpdatePayload to the DID document. Each update is applied to the
   * document and duplicates are ignored. If the algorithm reaches the block with the blockheight specified by a
   * targetBlockheight, the contemporaryDIDDocument at that blockheight is returned assuming a single canonical history
   * of the DID document has been constructed up to that point. It takes in contemporaryDIDDocument,
   * contemporaryBlockHeight, currentVersionId, targetVersionId, targetBlockheight, updateHashHistory, signalsMetadata
   * and network. It returns the contemporaryDIDDocument once either the targetBlockheight or targetVersionId have been
   * reached.
   *
   * @protected
   * @param {ReadBlockchainParams} params The parameters for the traverseBlockchainHistory operation.
   * @param {Btc1DidDocument} params.contemporaryDIDDocument The DID Document at the contemporaryBlockheight.
   * @param {number} params.contemporaryBlockHeight The blockheight of the contemporaryDIDDocument.
   * @param {number} params.currentVersionId The current versionId of the DID Document.
   * @param {number} params.targetVersionId The target versionId of the DID Document.
   * @param {number} params.targetBlockheight The target blockheight to resolve the DID Document.
   * @param {boolean} params.updateHashHistory The hash history of the DID Document updates.
   * @param {ResolutionOptions} params.signalsMetadata See {@link SignalsMetadata} for details.
   * @param {BitcoinNetworkNames} params.network The bitcoin network to connect to (mainnet, signet, testnet, regtest).
   * @returns {Promise<Btc1DidDocument>} The resolved DID Document object with a validated single, canonical history.
   */
  protected static async traverseBlockchainHistory({
    contemporaryDIDDocument,
    contemporaryBlockHeight,
    currentVersionId,
    targetVersionId,
    targetBlockHeight,
    updateHashHistory,
    signalsMetadata,
    network
  }: {
    contemporaryDIDDocument: Btc1DidDocument;
    contemporaryBlockHeight: number;
    currentVersionId: number;
    targetVersionId?: number;
    targetBlockHeight: number;
    updateHashHistory: string[];
    signalsMetadata: SignalsMetadata,
    network: BitcoinNetworkNames
  }): Promise<Btc1DidDocument> {
    // 1. Set contemporaryHash to the SHA256 hash of the contemporaryDIDDocument
    // TODO: NEED TO DEAL WITH CANONICALIZATION
    let contemporaryHash = await canonicalization.process(contemporaryDIDDocument, 'base58');

    // 3. For each beacon in beacons convert the beacon.serviceEndpoint to a Bitcoin address following BIP21.
    //    Set beacon.address to the Bitcoin address.
    const beacons = BeaconUtils.toBeaconServiceAddress(
    // 2. Find all beacons in contemporaryDIDDocument: All service in contemporaryDIDDocument.services where
    //    service.type equals one of SingletonBeacon, CIDAggregateBeacon and SMTAggregateBeacon Beacon.
      BeaconUtils.getBeaconServices({ didDocument: contemporaryDIDDocument })
    );

    while(contemporaryBlockHeight <= targetBlockHeight) {

      // 4. Set nextSignals to the result of calling algorithm Find Next Signals passing in contemporaryBlockheight and
      //    beacons.
      const nextSignals = await this.findNextSignals({ beacons, contemporaryBlockHeight, network });
      Logger.debug('nextSignals', nextSignals);

      // 5. Set contemporaryBlockHeight to nextSignals.blockheight.
      contemporaryBlockHeight = nextSignals.blockheight;

      // 6. Set signals to nextSignals.signals.
      const signals = nextSignals.signals;

      // 7. Set updates to the result of calling algorithm Process Beacon Signals passing in signals and sidecarData.
      const updates = await this.processBeaconSignals(signals, signalsMetadata);

      // 8. Set orderedUpdates to the list of updates ordered by the targetVersionId property.
      const orderedUpdates = updates.sort((a, b) => a.targetVersionId - b.targetVersionId);

      // 9. For update in orderedUpdates:
      for (let update of orderedUpdates) {

        // 9.1. If update.targetVersionId is less than or equal to currentVersionId, run Algorithm Confirm Duplicate
        //      Update passing in update, documentHistory, and contemporaryHash.
        if (update.targetVersionId <= currentVersionId) {
          await this.confirmDuplicateUpdate({ update, updateHashHistory });

          //  9.2. If update.targetVersionId equals currentVersionId + 1:
        } else if(update.targetVersionId === currentVersionId + 1) {
          //  9.2.1. Check that update.sourceHash equals contemporaryHash, else MUST raise latePublishing error.
          if(update.sourceHash !== contemporaryHash.slice(1)) {
            throw new Btc1ReadError(
              `Hash mismatch: update.sourceHash ${update.sourceHash} !== contemporaryHash ${contemporaryHash}`,
              LATE_PUBLISHING_ERROR,
              { update, contemporaryHash }
            );
          }

          // 9.2.2. Set contemporaryDIDDocument to the result of calling Apply DID Update algorithm passing in
          //        contemporaryDIDDocument, update.
          contemporaryDIDDocument = await this.applyDidUpdate({ contemporaryDIDDocument, update });

          // 9.2.3. Increment currentVersionId.
          currentVersionId++;

          // 9.2.4. If currentVersionId equals targetVersionId return contemporaryDIDDocument.
          if(currentVersionId === targetVersionId) {
            return new Btc1DidDocument(contemporaryDIDDocument);
          }

          // 9.2.5. Set updateHash to the result of passing update into the JSON Canonicalization and Hash algorithm.
          const updateHash = await canonicalization.process(update);

          // 9.2.6. Push updateHash onto updateHashHistory.
          updateHashHistory.push(updateHash);

          // 9.2.7. Set contemporaryHash to result of passing contemporaryDIDDocument into the JSON Canonicalization
          //        and Hash algorithm.
          contemporaryHash = await canonicalization.process(contemporaryDIDDocument);

          //  9.3. If update.targetVersionId is greater than currentVersionId + 1, MUST throw a LatePublishing error.
        } else if (update.targetVersionId > currentVersionId + 1) {
          throw new Btc1ReadError(
            `Version Id Mismatch: target ${update.targetVersionId} cannot be > current+1 ${currentVersionId + 1}`,
            'LATE_PUBLISHING_ERROR'
          );
        }
      }

      // 10. If contemporaryBlockheight equals targetBlockheight, return contemporaryDIDDocument.
      if(contemporaryBlockHeight === targetBlockHeight) {
        return new Btc1DidDocument(contemporaryDIDDocument);
      }

      // 11. Increment the blockheight.
      contemporaryBlockHeight++;
    }

    // 13. Return contemporaryDIDDocument.
    return new Btc1DidDocument(contemporaryDIDDocument);
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#find-next-signals | 4.2.3.3 Find Next Signals}.
   *
   * The Find Next Signals algorithm finds the next Bitcoin block containing Beacon Signals from one or more of the
   * beacons and retuns all Beacon Signals within that block.
   *
   * It takes the following inputs:
   *  - `contemporaryBlockhieght`: The height of the block this function is looking for Beacon Signals in.
   *                               An integer greater or equal to 0.
   *  - `targetBlockheight`: The height of the Bitcoin block that the resolution algorithm searches for Beacon Signals
   *                         up to. An integer greater or equal to 0.
   *  - `beacons`: An array of Beacon services in the contemporary DID document. Each Beacon contains properties:
   *      - `id`: The id of the Beacon service in the DID document. A string.
   *      - `type`: The type of the Beacon service in the DID document. A string whose values MUST be
   *                          either SingletonBeacon, CIDAggregateBeacon or SMTAggregateBeacon.
   *      - `serviceEndpoint`: A BIP21 URI representing a Bitcoin address.
   *      - `address`: The Bitcoin address decoded from the `serviceEndpoint value.
   *  - `network`: A string identifying the Bitcoin network of the did:btc1 identifier. This algorithm MUST query the
   *               Bitcoin blockchain identified by the network.
   *
   * It returns a nextSignals struct, containing the following properties:
   *  - blockheight: The Bitcoin blockheight for the block containing the Beacon Signals.
   *  - signals: An array of signals. Each signal is a struct containing the following:
   *      - beaconId: The id for the Beacon that the signal was announced by.
   *      - beaconType: The type of the Beacon that announced the signal.
   *      - tx: The Bitcoin transaction that is the Beacon Signal.
   *
   * @public
   * @param {FindNextSignals} params The parameters for the findNextSignals operation.
   * @param {number} params.blockheight The blockheight to start looking for beacon signals.
   * @param {Array<BeaconService>} params.target The target blockheight at which to stop finding signals.
   * @param {Array<BeaconService>} params.beacons The beacons to look for in the block.
   * @returns {Promise<BeaconSignal[]>} An array of BeaconSignal objects with blockHeight and signals.
   */
  public static async findNextSignals({ contemporaryBlockHeight: height, beacons, network }: {
    contemporaryBlockHeight: number;
    beacons: Array<BeaconServiceAddress>;
    network: BitcoinNetworkNames;
  }): Promise<BeaconSignal>{
    Logger.info('// TODO: findNextSignals - Use `network` to connect to the correct bitcoin node', network);
    /**
     * Convert serviceEndpoint to bitcoin address and create mapping of address to beaconService object
     * E.g.
     * Map(1) {
     * '174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU' => {
     *    id: '#initialP2PKH',
     *    type: 'SingletonBeacon',
     *    serviceEndpoint: 'bitcoin:174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU',
     *    address: '174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU'
     *  }
     * }
     */
    const beaconAddresses = BeaconUtils.getBeaconServiceAddressMap(beacons);

    //  TODO: Need to determine how to connect to a bitcoin node
    // Connect to the bitcoin node
    const rpc = BitcoinRpc.connect();

    // Get the block data at the blockhash
    const block = (await rpc.getBlock({ height })) as BlockV3 | undefined;

    // Create an empty array for beaconSignals
    const beaconSignal: BeaconSignal = {
      blockheight : height ?? block?.height,
      signals     : new Array<Signal>()
    };

    // If the block is null, return an empty beaconSignal
    if (!block) {
      // or: return beaconSignal;  // Possibly an empty or “no signals” result
      return beaconSignal;
    }

    // Iterate over each transaction in the block
    for (const tx of block.tx) {
      // If the txid is a coinbase, continue ...
      if(tx.txid === GENESIS_TX_ID) {
        Logger.info(`Tx ${tx.txid} is a coinbase transaction, skipping ...`, tx);
        continue;
      }

      // Iterate over each input in the transaction
      for (const vin of tx.vin) {

        // If the vin is a coinbase transaction, continue ...
        if (vin.coinbase) {
          Logger.info(`Tx ${tx.txid} vin is coinbase, continuing ... `, vin);
          continue;
        }

        // If the vin txinwitness contains a coinbase identifier, continue ...
        if(vin.txinwitness && vin.txinwitness.length === 1 && vin.txinwitness[0] === TXIN_WITNESS_COINBASE) {
          Logger.info(`Tx ${tx.txid} vin.txinwitness is coinbase, continuing ... `, vin);
          continue;
        }

        // If the txid from the vin is undefined, continue ...
        if (!vin.txid) {
          Logger.info(`Tx ${tx.txid} vin.txid is undefined, continuing ... `, vin);
          continue;
        }

        // If the vout from the vin is undefined, continue ...
        if (vin.vout === undefined) {
          Logger.info(`Tx ${tx.txid} vin.vout is undefined, continuing ... `, vin);
          continue;
        }

        // Get the previous output transaction data
        const prevout = await rpc.getRawTransaction(vin.txid, 2) as RawTransactionV2;

        // If the previous output vout at the vin.vout index is undefined, continue ...
        if (!prevout.vout[vin.vout]) {
          Logger.info(`Tx ${tx.txid} prevout.vout[vin.vout] is undefined, continuing ... `, prevout);
          continue;
        }

        // Get the address from the scriptPubKey from the prevvout (previous output's input at the vout index)
        const scriptPubKey = prevout.vout[vin.vout].scriptPubKey;

        // If the beaconAddress is undefined, continue ...
        if(!scriptPubKey.address) {
          Logger.info(`Tx ${tx.txid} prevout.vout[vin.vout].scriptPubKey is undefined, continuing ...`, prevout);
          continue;
        }

        // If the beaconAddress from prevvout scriptPubKey is not a beacon service endpoint address, continue ...
        const beacon = (beaconAddresses.get(scriptPubKey.address) ?? {}) as BeaconServiceAddress;
        if (!beacon || !(beacon.id && beacon.type)) {
          Logger.info(`Tx ${tx.txid} prevout.vout[vin.vout].scriptPubKey is not a beacon address, continuing ... `, scriptPubKey);
          continue;
        }

        // Log the found txid and beacon
        Logger.info(`Tx ${tx.txid} contains a beacon signal!`, beacon);

        // Set the blockheight to the block height
        beaconSignal.blockheight = block.height;

        // Push the signal object to to signals array
        beaconSignal.signals.push({
          beaconId      : beacon.id,
          beaconType    : beacon.type,
          beaconAddress : beacon.address,
          tx
        });

        break;
      };
    }

    return beaconSignal;
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#process-beacon-signals | 4.2.3.4 Process Beacon Signals}.
   *
   * The Process Beacon Signals algorithm processes each Beacon Signal by attempting to retrieve and validate an
   * announce DID Update Payload for that signal according to the type of the Beacon.
   *
   * It takes as inputs
   *  - `beaconSignals`: An array of Beacon Signals retrieved from the Find Next Signals algorithm. Each signal contains:
   *    - `beaconId`: The id for the Beacon that the signal was announced by.
   *    - `beaconType`: The type of the Beacon that announced the signal.
   *    - `tx`: The Bitcoin transaction that is the Beacon Signal.
   *  - `signalsMetadata`: Maps Beacon Signal Bitcoin transaction ids to a SignalMetadata object containing:
   *    - `updatePayload`: A DID Update Payload which should match the update announced by the Beacon Signal.
   *                       In the case of a SMT proof of non-inclusion, no DID Update Payload may be provided.
   *    - `proofs`: Sparse Merkle Tree proof used to verify that the `updatePayload` exists as the leaf indexed by the
   *                did:btc1 identifier being resolved.
   *
   * It returns an array of {@link https://dcdpr.github.io/did-btc1/#def-did-update-payload | DID Update Payloads}.
   *
   * @public
   * @param {Array<Signal>} signals The beacon signals to process.
   * @param {SignalsMetadata} signalsMetadata The sidecar data for the DID Document.
   * @returns {DidUpdatePayload[]} The updated DID Document object.
   */
  public static async processBeaconSignals(signals: Array<Signal>, signalsMetadata: SignalsMetadata): Promise<DidUpdatePayload[]> {
    // 1. Set updates to an empty array.
    const updates = new Array<DidUpdatePayload>();

    // 2. For beaconSignal in beaconSignals:
    return await Promise.all(
      signals.map(
        async (signal) => {
          // 2.1 Set type to beaconSignal.beaconType.
          // 2.2 Set signalTx to beaconSignal.tx.
          // 2.3 Set signalId to signalTx.id.
          const {
            beaconId: id,
            beaconType: type,
            beaconAddress: address,
            tx
          } = signal;

          // 2.4 Set signalSidecarData to signalsMetadata[signalId]. TODO: formalize structure of sidecarData
          const signalSidecarData = new Map(Object.entries(signalsMetadata)).get(id);
          Logger.warn('// TODO: processBeaconSignals - formalize structure of sidecarData', signalSidecarData);

          // 2.6 If type == SingletonBeacon:
          //     2.6.1 Set didUpdatePayload to the result of passing signalTx and signalSidecarData to Process Singleton Beacon Signal algorithm.
          // 2.7 If type == CIDAggregateBeacon:
          //     2.7.1 Set didUpdatePayload to the result of passing signalTx and signalSidecarData to the Process CIDAggregate Beacon Signal algorithm.
          // 2.8 If type == SMTAggregateBeacon:
          //     2.8.1 Set didUpdatePayload to the result of passing signalTx and signalSidecarData to the Process SMTAggregate Beacon Signal algorithm.
          const beacon = BeaconFactory.establish({ id, type, serviceEndpoint: `bitcoin:${address}` });

          // 2.5 Set didUpdatePayload to null.
          const didUpdatePayload = await beacon.processSignal(tx, signalsMetadata) ?? null;

          // If the updates is null, throw an error
          if (!didUpdatePayload) {
            throw new Btc1Error('No didUpdatePayload for beacon', 'PROCESS_BEACON_SIGNALS_ERROR', { tx, signalsMetadata });
          }

          // 2.9 If didUpdatePayload is not null, push didUpdatePayload to updates.
          updates.push(didUpdatePayload);

          // 3. Return updates.
          return didUpdatePayload;
        }
      )
    );
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#confirm-duplicate-update | 4.2.3.5 Confirm Duplicate Update}.
   *
   * The Confirm Duplicate Update algorithm takes in a {@link DidUpdatePayload | DID Update Payload} and verifies that
   * the update is a duplicate against the hash history of previously applied updates. The algorithm takes in an update
   * and an array of hashes, updateHashHistory. It throws an error if the update is not a duplicate, otherwise it
   * returns.
   *
   * @public
   * @param {{ update: DidUpdatePayload; updateHashHistory: string[]; }} params Parameters for confirmDuplicateUpdate.
   * @param {DidUpdatePayload} params.update The DID Update Payload to confirm.
   * @param {Array<string>} params.updateHashHistory The history of hashes for previously applied updates.
   * @returns {Promise<void>} A promise that resolves if the update is a duplicate, otherwise throws an error.
   * @throws {DidBtc1Error} if the update hash does not match the historical hash.
   */
  public static async confirmDuplicateUpdate({ update, updateHashHistory }: {
    update: DidUpdatePayload;
    updateHashHistory: string[];
  }): Promise<void> {
    Logger.warn('// TODO: Does this algorithm need `contemporaryHash` passed in?');

    // Hash the update payload
    const updateHash = await canonicalization.process(update);

    // Get the historical update hash from the updateHashHistory
    const historicalUpdateHash = updateHashHistory[update.targetVersionId - 2];

    // Check if the updateHash matches the historical hash
    if (historicalUpdateHash !== updateHash) {
      throw new Btc1ReadError(`Invalid duplicate: ${updateHash} does not match ${historicalUpdateHash}`, 'LATE_PUBLISHING_ERROR');
    }
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#apply-did-update | 4.2.3.6 Apply DID Update}.
   *
   * This algorithm attempts to apply a DID Update to a DID document, it first verifies the proof on the update is a
   * valid capabilityInvocation of the root authority over the DID being resolved. Then it applies the JSON patch
   * transformation to the DID document, checks the transformed DID document matches the targetHash specified by the
   * update and validates it is a conformant DID document before returning it. This algorithm takes inputs
   * contemporaryDIDDocument and an update.
   *
   * @public
   * @param {ApplyDidUpdateParams} params Parameters for applyDidUpdate.
   * @param {Btc1DidDocument} params.contemporaryDIDDocument The current DID Document to update.
   * @param {DidUpdatePayload} params.update The DID Update Payload to apply.
   * @param {Bytes} params.genesisBytes The genesis bytes for the DID Document.
   * @returns {Promise<Btc1DidDocument>}
   */
  public static async applyDidUpdate({ contemporaryDIDDocument, update }: {
    contemporaryDIDDocument: Btc1DidDocument;
    update: DidUpdatePayload;
  }): Promise<Btc1DidDocument> {
    // 1. Set capabilityId to update.proof.capability.
    const capabilityId = update.proof?.capability;
    if(!capabilityId) {
      throw new Btc1ReadError('No capabilityId found in update', 'INVALID_DID_UPDATE');
    }

    // 2. Set rootCapability to the result of passing capabilityId to the Dereference Root Capability Identifier algorithm.
    const rootCapability = Btc1Appendix.derefernceRootCapabilityIdentifier(capabilityId);

    // 3. If rootCapability.invocationTarget does not equal contemporaryDIDDocument.id
    //    and rootCapability.controller does not equal contemporaryDIDDocument.id, MUST throw an invalidDidUpdate error.
    if (
      rootCapability.invocationTarget !== contemporaryDIDDocument.id &&
        rootCapability.controller !== contemporaryDIDDocument.id
    ) {
      throw new Btc1ReadError(`Invalid root capability: ${rootCapability}`, 'INVALID_DID_UPDATE');
    }

    // Deconstruct the vm and capabilityInvocation from the DID Document.
    const { verificationMethod, capabilityInvocation } = contemporaryDIDDocument;

    // Validate the verificationMethod is not null.
    if(!verificationMethod) {
      throw new Btc1ReadError('No verificationMethod found in DID Document', 'INVALID_DID_DOCUMENT');
    }

    // Validate the capabilityInvocation is not null.
    if(!capabilityInvocation) {
      throw new Btc1ReadError('No capabilityInvocation found in DID Document', 'INVALID_DID_DOCUMENT');
    }

    // Deconstruct the id and controller from the verificationMethod.
    const { id, controller } = verificationMethod[0];

    // Get the genesisBytes from the DID Document id.
    const { genesisBytes } = Btc1Appendix.parse(contemporaryDIDDocument.id);

    // Construct a new KeyPair.
    const keyPair = new KeyPair({ publicKey: genesisBytes });

    // Construct a new Multikey.
    const multikey = new Multikey({ id, controller, keyPair });
    Logger.info('// TODO: applyDidUpdate - Refactor Multikey to accept KeyPair or JSON object.');

    // 4. Instantiate a schnorr-secp256k1-2025 cryptosuite instance.
    const cryptosuite = new Cryptosuite({ cryptosuite: 'bip340-jcs-2025', multikey });
    Logger.info('// TODO: applyDidUpdate - Refactor Cryptosuite to default to RDFC.');

    // 2. Set expectedProofPurpose to capabilityInvocation.
    const expectedPurpose = capabilityInvocation[0] as string;

    // 6. Set mediaType to ????
    const mediaType = 'application/json';
    Logger.info('// TODO: applyDidUpdate - is this just application/json?');

    // 7. Set documentBytes to the bytes representation of update.
    const document  = await canonicalization.canonicalize(update);

    // 8. Set verificationResult to the result of passing mediaType, documentBytes, cryptosuite, and
    //    expectedProofPurpose into the Verify Proof algorithm defined in the VC Data Integrity specification.
    const diProof = new DataIntegrityProof(cryptosuite);
    const verificationResult = await diProof.verifyProof({ mediaType, document, expectedPurpose });

    // 9. If verificationResult.verified equals False, MUST raise a invalidUpdateProof exception.
    if(!verificationResult.verified) {
      throw new Btc1ReadError('Proof cannot be verified', 'INVALID_UPDATE_PROOF');
    }

    // 10. Set targetDIDDocument to a copy of contemporaryDIDDocument.
    let targetDIDDocument = contemporaryDIDDocument;

    // 11. Use JSON Patch to apply the update.patch to the targetDIDDOcument.
    targetDIDDocument = JsonPatch.apply(targetDIDDocument, update.patch);

    // 12. Verify that targetDIDDocument is conformant with the data model specified by the DID Core specification.
    Btc1DidDocument.validate(targetDIDDocument);

    // 13. Set targetHash to the SHA256 hash of targetDIDDocument.
    const targetHash = await canonicalization.process(targetDIDDocument);

    // 14. Check that targetHash equals update.targetHash, else raise InvalidDIDUpdate error.
    if (targetHash !== update.targetHash) {
      throw new Btc1ReadError(`Invalid update: ${targetHash} does not match ${update.targetHash}`, 'INVALID_DID_UPDATE');
    }

    // 15. Return targetDIDDocument.
    return targetDIDDocument;
  }
}