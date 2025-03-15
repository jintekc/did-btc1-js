import { PublicKey } from '@did-btc1/key-pair';
import { strings } from '@helia/strings';
import type { DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';
import * as Digest from 'multiformats/hashes/digest';
import { DEFAULT_BLOCK_CONFIRMATIONS } from '../../bitcoin/constants.js';
import { getNetwork } from '../../bitcoin/network.js';
import BitcoinRpc from '../../bitcoin/rpc-client.js';
import { BlockHeight, BlockV2, BlockV3, RawTransactionV2, TargetBlockHeight } from '../../bitcoin/types.js';
import { GeneralUtils } from '../../utils/general.js';
import { BeaconSignal } from '../beacons/interface.js';
import { SingletonBeacon } from '../beacons/singleton/index.js';
import { ID_PLACEHOLDER_VALUE } from '../constants.js';
import { Btc1DidDocument } from '../did-document.js';
import { ReadBlockchainParams } from '../interface.js';
import { DidReadCas, DidReadDeterministic, DidReadExternal, DidReadSidecar, FindNextSignals, SidecarData, TargetDocumentParams, UnixTimestamp } from '../types.js';
import { Btc1Utils } from '../utils.js';

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#read | 4.2 Read}
 *
 * The read operation is executed by a resolver after a resolution request identifying a specific did:btc1 identifier is
 * received from a client at Resolution Time. The request MAY contain a resolutionOptions object containing additional
 * information to be used in resolution. The resolver then attempts to resolve the DID document of the identifier at a
 * specific Target Time. The Target Time is either provided in resolutionOptions or is set to the Resolution Time of the
 * request.
 *
 * To do so it executes the following algorithm:
 * 1. Let identifierComponents be the result of running the algorithm in Parse did:btc1 identifier, passing in the identifier
 * 2. Set initialDocument to the result of running Resolve Initial Document passing identifier, identifierComponents and resolutionOptions.
 * 3. Set targetDocument to the result of running the algorithm in Resolve Target Document passing in initialDocument and resolutionOptions.
 * 4. Return targetDocument.
 *
 * @export
 * @class Btc1Read
 * @type {Btc1Read}
 */
export class Btc1Read {
  /**
   * Recreates the `did:btc1` Document deterministically using the params
   * @static
   * @name deterministic
   * @param {ReadDeterministic} params Required params for calling the deterministic method
   * @param {string} params.version The did-btc1 version
   * @param {string} params.network The name of the bitcoin network (mainnet, testnet, regtest)
   * @param {Uint8Array} params.publicKey The public key bytes used for the identifier
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  static deterministic({ identifier, components }: DidReadDeterministic): Btc1DidDocument {
    // Deconstruct the components
    const { network: networkName, genesisBytes } = components;
    // Construct a new PublicKey
    const publicKey = new PublicKey(genesisBytes);
    // Get the network object from the network name
    const network = getNetwork(networkName);
    // Encode the public key as a mult
    const publicKeyMultibase = publicKey.encode();
    // Generate the beacon services from the network and public key
    const service = Btc1Utils.generateBeaconServices({ network, publicKey: publicKey.x });
    // Return the resolved DID Document object
    return {
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
        publicKeyMultibase
      }],
      service
    };
  }

  /**
   * Resolves the `did:btc1` Document externally (sidecar or cas) using the params
   * @static
   * @async
   * @name external
   * @param {DidReadExternal} params Required params for calling the external method
   * @param {string} params.identifier The DID to be resolved
   * @param {DidComponents} params.identifierComponents The components of the identifier
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document
   * @param {Btc1DidDocument} params.options.sidecarData.initialDocument The offline user-provided DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  static async external({ identifier, components, options }: DidReadExternal): Promise<Btc1DidDocument> {
    const { initialDocument } = options.sidecarData ?? {};
    return initialDocument
      ? await this.sidecar({ components, initialDocument})
      : await this.cas({ identifier, components });
  }

  /**
   * Validates a `did:btc1` identifier using sidecar data
   * @static
   * @name sidecar
   * @param {DidReadSidecar} params Required params for calling the sidecar method
   * @param {string} params.identifier The DID to be resolved
   * @param {DidComponents} params.components The components of the DID identifier
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document provided by the user
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} with {@link DidErrorCode.InvalidDidDocument} if genesisBytes !== initialDocument hashBytes
   */
  static async sidecar({ components, initialDocument }: DidReadSidecar): Promise<Btc1DidDocument> {
    // Set intermediateDocument to a copy of initialDocument
    const intermediateDocument = initialDocument;

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.id = ID_PLACEHOLDER_VALUE;

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod =
          Btc1Utils.getVerificationMethods({ didDocument: intermediateDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id }));

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const hashBytes = await GeneralUtils.sha256Canonicalize(intermediateDocument);

    // Validate the genesisBytes match the hashBytes
    if (components.genesisBytes !== hashBytes) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Genesis bytes do not match hash bytes of initial document');
    }
    return initialDocument;
  }

  /**
   *
   * Resolves DID Document in Content Addressable Storage (CAS) using `did:btc1` identifier and components.
   *
   * @static
   * @async
   * @param {DidReadCas} params Required params for calling the cas method
   * @param {string} params.identifier BTC1 DID used to resolve the DID Document
   * @param {DidComponents} params.components BTC1 DID components used to resolve the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} if an error occurs while resolving from CAS
   * @throws {DidErrorCode.InvalidDidDocument} if the DID Document content is invalid
   */
  static async cas({ identifier, components }: DidReadCas): Promise<Btc1DidDocument> {
    // Set hashBytes to genesisBytes
    const hashBytes = components.genesisBytes;
    // Create a CID from the hashBytes
    const cid = CID.create(1, 1, Digest.create(1, hashBytes));
    // Create a Helia node connection to IPFS
    const helia = strings(await createHelia());
    // Get the intermediateDocument from the Helia node
    const intermediateDocument = await helia.get(cid, {});
    // Validate the intermediateDocument is parsable JSON
    if (!JSON.parsable(intermediateDocument)) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Invalid DID Document content');
    }
    // Parse the intermediateDocument into a Btc1DidDocument object
    const initialDocument = JSON.parse(intermediateDocument) as Btc1DidDocument;
    // Set the initialDocument id and verification method controller to the identifier
    initialDocument.id = identifier;
    initialDocument.verificationMethod =
          Btc1Utils.getVerificationMethods({ didDocument: initialDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: initialDocument.id }));
    // Return the resolved initialDocument
    return initialDocument;
  }

  /**
   * @static
   *  Resolves a DID Document at a specific versionId and blockheight
   * @async
   * @name targetDoc
   * @param {TargetDocumentParams} params Required parameters for resolving the target DID Document
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document to resolve
   * @param {ResolutionOptions} params.options The options for resolving the DID Document
   * @param {?number} params.options.versionId The versionId for resolving the DID Document
   * @param {?UnixTimestamp} params.options.versionTime The versionTime for resolving the DID Document
   * @param {?BitcoinRpc} params.options.rpc BitcoinRpc client connection
   * @param {?SidecarData} params.options.sidecarData The sidecar data for resolving the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object with a validated single, canonical history
   */
  static async targetDocument({ initialDocument, options }: TargetDocumentParams): Promise<Btc1DidDocument> {
    // If options.versionId is not null, set targetVersionId to options.versionId
    const targetVersionId = options.versionId;

    // If options.versionTime is not null, set targetTime to options.versionTime
    const targetTime = options.versionTime;

    // Set the targetBlockheight to the result of passing targetTime to the algorithm Determine Target Blockheight
    const targetBlockHeight = await this.determineTargetBlockHeight(targetTime, options.rpc);

    // Set sidecarData to options.sidrcarData
    const sidecarData = options.sidecarData;

    // Set currentVersionId to 1
    const currentVersionId = 1;

    // If the targetVersionId equals currentVersionId, return initialDocument
    if(targetVersionId === currentVersionId) {
      return initialDocument;
    }

    // Set updateHashHistory to an empty array
    const updateHashHistory = new Array();

    // Set contemporaryBlockheight to 1
    const contemporaryBlockHeight = 1;

    // Set contemporaryDidDocument to initialDocument
    const contemporaryDidDocument = initialDocument;

    // Set targetDocument to the result of passing contemporaryDIDDocument, contemporaryBlockheight,
    // currentVersionId, targetVersionId, targetBlockheight, updateHashHistory, and sidecarData
    // to the Traverse Blockchain History algorithm.
    const targetDocument = this.blochchainHistory({
      targetBlockHeight,
      currentVersionId,
      targetVersionId,
      updateHashHistory,
      contemporaryBlockHeight,
      sidecarData,
      contemporaryDidDocument,
    });

    // Return targetDocument
    return targetDocument;
  }

  /**
   * Determines the target blockheight given an optional targetTime or default confirmations.
   * @static
   * @async
   * @param {?UnixTimestamp} targetTime Unix timestamp used to find highest block height < targetTime. If not provided,
   * finds the highest bitcoin block height where confirmations > {@link DEFAULT_BLOCK_CONFIRMATIONS}
   * @returns {BlockHeight} The target blockheight (number)
   * @throws {DidBtc1Error} if there is a block height mismatch
   */
  static async determineTargetBlockHeight(targetTime?: UnixTimestamp, rpc?: BitcoinRpc): Promise<number> {
    // If bitcoinClient is not defined, connect to default bitcoin node
    rpc ??= BitcoinRpc.connect();

    // Get the current block height
    const height = await rpc.getBlockCount();

    // Get the block hash at the current block height
    const hash = await rpc.getBlockHash(height);

    // Get the block at the current height
    const block = await rpc.getBlock(hash) as BlockV2;

    // Return block height response from targetBlockHeight
    return await this.targetBlockHeight({ block, rpc, targetTime });
  }

  /**
   * @static
   *  Determines the target blockheight given an optional targetTime or default confirmations
   * @async
   * @name getTargetBlockHeight
   * @param {TargetBlockHeight} params Required parameters for determining the target blockheight.
   * @param {BlockV2} params.block Starting bitcoin block.
   * @param {BitcoinRpc} params.rpc Bitcoin rpc client connection.
   * @param {?UnixTimestamp} params.targetTime Unix timestamp used to find the first block height where timestamp < targetTime.
   * @returns {Promise<BlockHeight>} Promise resolving to the target block height
   */
  static async targetBlockHeight({ block, rpc, targetTime }: TargetBlockHeight): Promise<BlockHeight> {
    if(!targetTime) {
      // Traverse Bitcoin blocks to find the largest block with confirmations >= DEFAULT_BLOCK_CONFIRMATIONS
      while (block.confirmations <= DEFAULT_BLOCK_CONFIRMATIONS) {
        block.hash = await rpc.getBlockHash(--block.height);
        block = await rpc.getBlock(block.hash) as BlockV2;
      }
      // Return the block height
      return block.height;
    }
    // Traverse Bitcoin blocks to find the largest block with timestamp < targetTime
    while (block.time > targetTime) {
      block.hash = await rpc.getBlockHash(--block.height);
      block = await rpc.getBlock(block.hash) as BlockV2;
    }
    // Return the block height
    return block.height;
  }


  /**
   * Takes as inputs a Bitcoin blockheight specified by contemporaryBlockheight and an array of beacons and returns a
   * nextSignals object, containing a blockheight the signals were found in and an array of signals. Each signal is an
   * object containing beaconId, beaconType, and tx properties.
   * {@link https://dcdpr.github.io/did-btc1/#find-next-signals | 4.2.3.3 Find Next Signals}
   *
   * @static
   * @async
   * @param {FindNextSignals} params The parameters for the findNextSignals operation.
   * @param {number} params.blockheight The blockheight to start looking for beacon signals.
   * @param {Array<BeaconService>} params.target The target blockheight at which to stop finding signals.
   * @param {Array<BeaconService>} params.beacons The beacons to look for in the block.
   * @returns {Promise<BeaconSignal[]>} An array of BeaconSignal objects with blockHeight and signals.
   */
  static async findNextSignals({ block, beacons }: FindNextSignals): Promise<BeaconSignal>{
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
    const beaconAddressMap = Btc1Utils.getBeaconAddressMap(beacons);

    //  TODO: Need to determine how to connect to a bitcoin node
    // Connect to the bitcoin node
    const rpc = BitcoinRpc.connect();

    // Create an empty array for beaconSignals
    const beaconSignal: BeaconSignal = { blockheight: block.height, signals: [] };

    // Iterate over each transaction in the block
    for (const tx of block.tx) {

      // Iterate over each input in the transaction
      for (const vin of tx.vin) {

        // If the vin is a coinbase transaction, continue ...
        if (vin.coinbase) {
          console.info(`🔗 Tx id ${tx.txid} is a coinbase tx, continuing ... `, tx);
          continue;
        }

        // If the txid from the vin is undefined, continue ...
        const { txid, vout } = vin;
        if (!txid) {
          console.info(`🔗 Tx id ${tx.txid} does not have a txid, continuing ... `, tx);
          continue;
        }

        // If the vout from the vin is undefined, continue
        if (vout === undefined) {
          console.info(`🔗 Vin txid ${txid} does not have a vout, continuing ... `, vin);
          continue;
        }

        // Get the previous output transaction data
        const prevout = await rpc.getRawTransaction(txid, 2) as RawTransactionV2;

        // Set the vout as an index
        const index = vout;

        // If the previous output vout at the vin.vout index is undefined, continue ...
        const prevvout = prevout.vout[index];
        if (!prevvout) {
          console.info(`🔗 Prevout id ${prevout.txid} does not have a vout at index ${index}, continuing ... `, prevout);
          continue;
        }

        // Get the address from the scriptPubKey from the prevvout (previous output's input at the vout index)
        const { address: beaconAddress } = prevvout.scriptPubKey;

        // If the beaconAddress is undefined, continue ...
        if(!beaconAddress) {
          console.info(`🔗 No scriptPubKey.address for vout[${index}] in prevout tx ${prevout.txid}, continuing ... `, prevvout.scriptPubKey);
          continue;
        }

        // If the beaconAddress from prevvout scriptPubKey is not a beacon service endpoint address, continue ...
        const { id: beaconId, type: beaconType } = beaconAddressMap.get(beaconAddress) ?? {};
        if (!(beaconId && beaconType)) {
          console.info(`🔗 Address ${beaconAddress} does not have a beacon signal, continuing ... `, beaconAddress);
          continue;
        }

        // Log the found txid and beaconAddress
        console.info(`🔗 Found txid ${tx.txid} spending from address: ${beaconAddress}`);

        // Push the signal object to to signals array
        beaconSignal.signals.push({ tx, beaconId, beaconType });
      };
    }

    // Return the beacon signals
    return beaconSignal;
  }


  /**
   * TODO: Need to implement the processBeaconSignal method
   *
   * @public
   * @static
   * @param {string} type
   * @param {*} tx
   * @param {*} data
   * @returns {*}
   */
  public static processBeaconSignal(type: string, tx: any, data: any): any {
    switch(type) {
      case 'SingletonBeacon':{
        const beacon = new SingletonBeacon('#singletonBeacon', '');
        console.log('tx, data', tx, data);
        return beacon;
      }
    }
  }


  /**
   * TODO: Need to implement the processBeaconSignals method
   *
   * @public
   * @static
   * @param {BeaconSignal} beaconSignal
   * @param {SidecarData} sidecarData
   * @returns {Array<Btc1DidDocument>}
   */
  public static processBeaconSignals(beaconSignal: BeaconSignal, sidecarData: SidecarData): Array<Btc1DidDocument> {
    const updates = [];

    for (let signal of beaconSignal.signals) {
      const type = signal.beaconType;
      const tx = signal.tx;
      // const signalId = signal.beaconId;
      const data = sidecarData.initialDocument.service.find(service => service.type === signal.beaconId);
      updates.push(this.processBeaconSignal(type, tx, data));
    }
    return {} as Btc1DidDocument[];
  }

  /**
   * TODO: Need to finish implementing the blochchainHistory method
   * {@link 4.2.3.2 Traverse Blockchain History | https://dcdpr.github.io/did-btc1/#traverse-blockchain-history}
   *
   * The Traverse Blockchain History algorithm iterates over Bitcoin blocks, starting from the block with the,
   * contemporaryBlockheight to find beaconSignals emitted by Beacons within the contemporaryDIDDocument. Each
   * beaconSignal is processed to retrieve a didUpdatePayload to the DID document.
   *
   * Each update is applied to the document and duplicates are ignored. If the algorithm reaches the block with the
   * blockheight specified by a targetBlockheight, the contemporaryDIDDocument at that blockheight is returned assuming
   * a single canonical history of the DID document has been constructed up to that point.
   * @public
   * @static
   * @async
   * @param {ReadBlockchainParams} params The parameters for the traverseBlockchainHistory operation
   * @param {Btc1DidDocument} params.contemporaryDidDocument The DID Document at the contemporaryBlockheight
   * @param {number} params.contemporaryBlockHeight The blockheight of the contemporaryDIDDocument
   * @param {number} params.currentVersionId The current versionId of the DID Document
   * @param {number} params.targetVersionId The target versionId of the DID Document
   * @param {number} params.targetBlockheight The target blockheight to resolve the DID Document
   * @param {boolean} params.updateHashHistory The hash history of the DID Document updates
   * @param {ResolutionOptions} params.sidecarData The sidecar data for the DID Document
   * @returns {Promise<Btc1DidDocument>} The resolved DID Document object with a validated single, canonical history
   */
  public static async blochchainHistory({
    contemporaryDidDocument,
    contemporaryBlockHeight,
    currentVersionId,
    targetVersionId,
    targetBlockHeight,
    updateHashHistory,
    sidecarData,
  }: ReadBlockchainParams): Promise<Btc1DidDocument> {
    console.log('{currentVersionId, targetVersionId, updateHashHistory}', {currentVersionId, targetVersionId, updateHashHistory});

    // Set contemporaryHash to the SHA256 hash of the contemporaryDIDDocument
    // TODO: NEED TO DEAL WITH CANONICALIZATION
    const contemporaryHash = GeneralUtils.sha256Canonicalize(contemporaryDidDocument);
    console.log('contemporaryHash', contemporaryHash);

    // Find all beacons in contemporaryDIDDocument.services
    // where service.type equals one of: "SingletonBeacon", "CIDAggregateBeacon" or "SMTAggregateBeacon".
    const beacons = Btc1Utils.getDidBeaconServices({ didDocument: contemporaryDidDocument });
    // For each beacon in beacons convert the beacon.serviceEndpoint to a Bitcoin address following BIP21. Set beacon.address to the Bitcoin address.
    // Set nextSignals to the result of calling algorithm Find Next Signals passing in contemporaryBlockheight and beacons.

    //  TODO: Need to determine how to connect to a bitcoin node
    // Connect to the bitcoin node
    const rpc = BitcoinRpc.connect();
    // Set beaconSignals to an empty array
    // const nextSignals: Array<BeaconSignal> = [];

    // Set a mutable startingBlockHeight
    let startingBlockHeight = contemporaryBlockHeight;

    // Loop from contemporaryBlockHeight to targetBlockHeight
    while(startingBlockHeight < targetBlockHeight) {
      // If nextSignal.blockheight is > targetBlockHeight
      if(startingBlockHeight > targetBlockHeight) {
        return contemporaryDidDocument;
      }

      // Get the block hash at the blockheight
      const blockhash = await rpc.getBlockHash(contemporaryBlockHeight);

      // Get the block data at the blockhash
      const block = await rpc.getBlock(blockhash, 2) as BlockV3;

      const nextSignal = await this.findNextSignals({ beacons, block });

      const updates = this.processBeaconSignals(nextSignal, sidecarData!);
      console.log('updates', updates);
      // Increment the blockheight
      startingBlockHeight++;
    }

    return contemporaryDidDocument;
  }
}