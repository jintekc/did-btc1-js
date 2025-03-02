import { strings } from '@helia/strings';
import { sha256 } from '@noble/hashes/sha256';
import { canonicalize } from '@web5/crypto';
import type { DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';
import * as Digest from 'multiformats/hashes/digest';
import { DidBtc1Create } from './did-btc1-create.js';
import Bitcoind from '../bitcoin/bitcoin-client.js';
import { DEFAULT_BLOCK_CONFIRMATIONS } from '../constants/bitcoind.js';
import { TargetBlockHeight } from '../types/bitcoind.js';
import { ID_PLACEHOLDER_VALUE } from '../constants/btc1.js';
import { DidBtc1Utils } from '../utils/did-btc1-utils.js';
import {
  Btc1DidDocument,
  ReadCas,
  ReadDeterministic,
  ReadExternal,
  ReadSidecar,
  TargetDocumentParams,
  TraverseBlockchainParams,
  UnixTimestamp
} from '../types/btc1.js';
import { DidBtc1Error } from '../utils/did-btc1-error.js';
import { GeneralUtils } from '../utils/general.js';

/**
 * @class
 * @name DidBtc1Read
 * @description Implements the Read section of the did-btc1 spec for resolving `did:btc1` identifiers and documents
 * {@link https://dcdpr.github.io/did-btc1/#read}
 */
export class DidBtc1Read {
  /**
   * @static @method
   * @name deterministic
   * @description Recreates the `did:btc1` Document deterministically using the params
   * @param {ReadDeterministic} params Required params for calling the deterministic method
   * @param {string} params.version The did-btc1 version
   * @param {string} params.network The name of the bitcoin network (mainnet, testnet, regtest)
   * @param {Uint8Array} params.pubKeyBytes The public key bytes used for the identifier
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  static deterministic({ version, network, pubKeyBytes }: ReadDeterministic): Btc1DidDocument {
    return DidBtc1Create.deterministic({ version, network, pubKeyBytes }).initialDocument;
  }

  /**
   * @static @async @method
   * @name external
   * @description Resolves the `did:btc1` Document externally (sidecar or cas) using the params
   * @param {ReadExternal} params Required params for calling the external method
   * @param {string} params.identifier The DID to be resolved
   * @param {Btc1IdentifierComponents} params.identifierComponents The components of the identifier
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document
   * @param {Btc1DidDocument} params.options.sidecarData.initialDocument The offline user-provided DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  static async external({ identifier, identifierComponents, options }: ReadExternal): Promise<Btc1DidDocument> {
    const { initialDocument } = options.sidecarData;
    return !initialDocument
      ? await this.cas({ identifier, identifierComponents })
      : this.sidecar({ identifier, identifierComponents, initialDocument });
  }

  /**
   * @static @method
   * @name sidecar
   * @description Validates a `did:btc1` identifier using sidecar data
   * @param {ReadSidecar} params Required params for calling the sidecar method
   * @param {string} params.identifier The DID to be resolved
   * @param {Btc1IdentifierComponents} params.identifierComponents The components of the DID identifier
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document provided by the user
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} with {@link DidErrorCode.InvalidDidDocument} if genesisBytes !== initialDocument hashBytes
   */
  static sidecar({ identifierComponents, initialDocument }: ReadSidecar): Btc1DidDocument {
    // Set intermediateDocument to a copy of initialDocument
    const intermediateDocument = initialDocument;

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.id = ID_PLACEHOLDER_VALUE;

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod =
          DidBtc1Utils.getVerificationMethods({ didDocument: intermediateDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id }));

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const hashBytes = sha256(Buffer.from(canonicalize(intermediateDocument)));

    // Validate the genesisBytes match the hashBytes
    if (identifierComponents.genesisBytes !== hashBytes) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Genesis bytes do not match hash bytes of initial document');
    }
    return initialDocument;
  }

  /**
   * @static @async @method
   * @name cas
   * @description Resolves DID Document in Content Addressable Storage (CAS) using `did:btc1` identifier and components
   * @param {ReadCas} params Required params for calling the cas method
   * @param {string} params.identifier BTC1 DID used to resolve the DID Document
   * @param {Btc1IdentifierComponents} params.identifierComponents BTC1 DID components used to resolve the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} if an error occurs while resolving from CAS
   * @throws {DidErrorCode.InvalidDidDocument} if the DID Document content is invalid
   */
  static async cas({ identifier, identifierComponents }: ReadCas): Promise<Btc1DidDocument> {
    // Set hashBytes to genesisBytes
    const hashBytes = identifierComponents.genesisBytes;
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
          DidBtc1Utils.getVerificationMethods({ didDocument: initialDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: initialDocument.id }));
    // Return the resolved initialDocument
    return initialDocument;
  }

  /**
   * @static @async @method
   * @name targetDoc
   * @description Resolves a DID Document at a specific versionId and blockheight
   * @param {TargetDocumentParams} params Required parameters for resolving the target DID Document
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document to resolve
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object with a validated single, canonical history
   */
  static async targetDocument({ initialDocument, options }: TargetDocumentParams): Promise<Btc1DidDocument> {
    if (options.versionId && options.versionId === 1) {
      return initialDocument;
    }
    return this.traverseBlochchainHistory({
      contemporaryDidDocument : initialDocument,
      targetVersionId         : options.versionId,
      targetBlockheight       : await this.determineTargetBlockheight(options.targetTime, options.bitcoind),
      sidecarData             : options.sidecarData,
      currentVersionId        : options.versionId,
      updateHashHistory       : [],
      contemporaryBlockheight : 0
    });
  }

  /**
   * @static @async @method
   * @name determineTargetBlockheight
   * @description Determines the target blockheight given an optional targetTime or default confirmations
   * @param {UnixTimestamp} targetTime Optional unix timestamp used to find highest blockheight < targetTime
   * If not provided, finds the highest bitcoin blockheight where confirmations > {@link DEFAULT_BLOCK_CONFIRMATIONS}
   * @param {Bitcoind} bitcoind Optional bitcoind client instance used to connect to a bitcoin node
   * If not provided, connects to the default bitcoind node
   * If IS_TEST is also true, connects to a Polar regtest node
   * @returns {number} The target blockheight (number)
   * @throws {DidBtc1Error} if there is a block height mismatch
   */
  static async determineTargetBlockheight(targetTime?: UnixTimestamp, bitcoind?: Bitcoind): Promise<number> {
    // If bitcoind is not defined, connect to default bitcoin node
    bitcoind ??= Bitcoind.connect();
    // Get the current block height
    const height = await bitcoind.getBlockCount();
    // Get the current blockchain info blocks count
    const { blocks } = await bitcoind.getBlockchainInfo();
    // Gut check: If height is not equal to blocks, throw an error
    if (height !== blocks) {
      throw new DidBtc1Error(`Block height mismatch! ${height} !== ${blocks}`);
    }
    // Get the block hash at the current height
    const hash = await bitcoind.getBlockHash(height);
    // Get the block at the current height
    const block = await bitcoind.getBlock(hash);
    // Return block height response from getTargetBlockHeight
    return await this.getTargetBlockHeight({ block, bitcoind, targetTime });
  }

  /**
   * @static @async @method
   * @name getTargetBlockHeight
   * @description Determines the target blockheight given an optional targetTime or default confirmations
   * @param {TargetBlockHeight} params Required parameters for determining the target blockheight
   * @param {BitcoinBlock} params.block Starting bitcoin block
   * @param {Bitcoind} params.bitcoind Optional client connection to a bitcoind node (required in production)
   * @param {UnixTimestamp} params.targetTime to find the largest block with timestamp < targetTime
   * @returns {number} Promise resolving to the target blockheight
   */
  static async getTargetBlockHeight({block, bitcoind, targetTime}: TargetBlockHeight): Promise<number> {
    if(!targetTime) {
      // Traverse Bitcoin blocks to find the largest block with confirmations >= DEFAULT_BLOCK_CONFIRMATIONS
      while (block.confirmations <= DEFAULT_BLOCK_CONFIRMATIONS) {
        block.hash = await bitcoind.getBlockHash(--block.height);
        block = await bitcoind.getBlock(block.hash);
      }
      // Return the block height
      return block.height;
    }
    // Traverse Bitcoin blocks to find the largest block with timestamp < targetTime
    while (block.time > targetTime) {
      block.hash = await bitcoind.getBlockHash(--block.height);
      block = await bitcoind.getBlock(block.hash);
    }
    // Return the block height
    return block.height;
  }

  /**
   *
   * TODO: finish function once spec completed
   *
   * This algorithm traverse Bitcoin blocks, starting from the block with the
   * contemporaryBlockheight, to find beaconSignals emitted by Beacons within
   * the contemporaryDIDDocument. Each beaconSignal is processed to retrieve a
   * didUpdatePayload to the DID document. Each update is applied to the document and
   * duplicates are ignored. If the algorithm reaches the block with the blockheight
   * specified by a targetBlockheight, the contemporaryDIDDocument at that blockheight
   * is returned assuming a single canonical history of the DID document has been
   * constructed up to that point.
   *
   * @param params: The parameters for the traverseBlockchainHistory operation
   */
  static traverseBlochchainHistory({
    contemporaryDidDocument,
    contemporaryBlockheight,
    currentVersionId,
    targetVersionId,
    targetBlockheight,
    updateHashHistory,
    sidecarData,
  }: TraverseBlockchainParams): Btc1DidDocument {
    const contemporaryHash = GeneralUtils.hashedCanonical(contemporaryDidDocument);
    const beacons = DidBtc1Utils.getDidServices({ didDocument: contemporaryDidDocument });
    for (const beacon of beacons) {
      console.log('Beacon: ', beacon);
    }
    console.log(
      contemporaryHash,
      contemporaryDidDocument,
      targetVersionId,
      targetBlockheight,
      sidecarData,
      currentVersionId,
      updateHashHistory,
      contemporaryBlockheight);
    return contemporaryDidDocument;
  }
}