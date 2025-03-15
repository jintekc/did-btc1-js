import { PublicKeyBytes } from '@did-btc1/cryptosuite';
import {
  Did,
  DidService,
  DidVerificationMethod,
  DidCreateOptions as IDidCreateOptions,
  DidResolutionOptions as IDidResolutionOptions
} from '@web5/dids';
import { networks } from 'bitcoinjs-lib';
import BitcoinRpc from '../bitcoin/rpc-client.js';
import { Btc1DidDocument } from './did-document.js';
import { Btc1KeyManager } from './key-manager/index.js';
import { DidPlaceholder, RecoveryOptions, SidecarDataCID, SidecarDataSMT, UnixTimestamp } from './types.js';
import { DidDocumentPatch } from '../utils/json-patch.js';
import { BeaconServicesParams } from './beacons/interface.js';


export interface DidServiceSingletonBeacon extends DidService {
    id: '#singletonBeacon';
    type: 'SingletonBeacon';
    serviceEndpoint: string;
}

export interface DidCreateOptions extends IDidCreateOptions<Btc1KeyManager> {
    /** DID BTC1 Version Number */
    version?: string;
    /** Bitcoin Network */
    network?: string;
    /** DID BTC1 ID Type: key or external */
    idType?: string;
}

export interface DidCreateParams {
    /** Pubkey Bytes used to generate the id required if idType = key */
    publicKey?: PublicKeyBytes;
    /** Intermediate Document supplied by user if idType = external */
    intermediateDocument?: IntermediateDocument;
    /** Options for creating a Decentralized Identifier (DID) using the DID BTC1 method */
    options?: DidCreateOptions;
}

export interface GenerateBitcoinAddrs {
    pubkey: Uint8Array;
    network: networks.Network;
}

export interface BeaconServiceParams {
    serviceId: string;
    beaconType: string;
    bitcoinAddress: string;
    casType?: string;
}

export interface DidCreateResponse {
    did: string;
    initialDocument: Btc1DidDocument;
};

export interface DidComponents extends Did {
    hrp: string;
    genesisBytes: Uint8Array;
    version: string;
    network: string;
    idBech32: string;
};
export interface IntermediateVerificationMethod extends DidVerificationMethod {
    id: string;
    type: string;
    controller: DidPlaceholder;
    publicKeyMultibase: string;
}

export interface IntermediateDocument extends Btc1DidDocument {
    id:  DidPlaceholder;
    verificationMethod: IntermediateVerificationMethod[];
}
export interface DidResolutionOptions extends IDidResolutionOptions {
  /** Version Id */
  versionId?: number
  /** Unix timstamp of the block height to find */
  versionTime?: UnixTimestamp;
  /** Bitcoind gRPC client config */
  rpc?: BitcoinRpc;
  /** Sidecar data for resolution */
  sidecarData?: SidecarDataCID | SidecarDataSMT;
}
export interface Btc1RootCapability {
    '@context': string;
    id: `urn:zcap:root${string}`;
    controller: string;
    invocationTarget: string;
}

// export interface IDidBtc1Create {
//   deterministic(params: CreateDeterministicParams): CreateResponse;
//   external(params: CreateExternalParams): Promise<CreateResponse>;
//   identifier(params: CreateIdentifierParams): string;
// }

// export interface IDidBtc1Read {
//   deterministic(params: ReadDeterministicParams): CreateResponse;
//   external(params: ReadExternalParams): Promise<CreateResponse>;
//   sidecar(params: ReadDeterministicParams): string;
//   cas(params: ReadCas): Promise<Btc1DidDocument>;
// }

export interface IDidBtc1Utils {
    parse(identifier: string): DidComponents;
    extractDidFragment(input: unknown): string | undefined;
    isDidVerificationMethod(obj: unknown): boolean;
    isDidService(obj: unknown): boolean;
    getVerificationMethods(params: { didDocument: Btc1DidDocument; }): DidVerificationMethod[];
    getDidServices(params: { didDocument: Btc1DidDocument; }): DidService[];
    generateBitcoinAddrs(params: GenerateBitcoinAddrs): Array<Array<string>>;
    generateBeaconServices(params: BeaconServicesParams): Array<DidService>;
    generateBeaconService(params: BeaconServiceParams): DidService;
}

export interface ConstructPayloadParams {
    identifier: string;
    sourceDocument: Btc1DidDocument;
    sourceVersionId: string;
    documentPatch: DidDocumentPatch;
}

export interface DidUpdateParams extends ConstructPayloadParams {
    verificationMethodId: string;
    beaconIds: string[];
    options: RecoveryOptions;
}

export interface UpdatePayload {
    '@context': string[];
    patch: DidDocumentPatch;
    targetHash: string;
    targetVersionId: string;
    sourceHash: string;
}

export interface ReadBlockchainParams {
  contemporaryDidDocument: Btc1DidDocument;
  contemporaryBlockHeight: number | 1;
  currentVersionId: number | 1;
  targetVersionId?: number;
  targetBlockHeight: number;
  updateHashHistory: string[];
sidecarData?: SidecarDataCID | SidecarDataSMT;
}

export interface ProofOptions {
  type: string;
  cryptosuite: string;
  verificationMethod: string;
  proofPurpose: string;
  capability: string;
  capabilityAction: string;
}