import { RequireOnly } from '@web5/common';
import {
  Did,
  DidResolutionOptions,
  DidService,
  DidVerificationMethod,
  DidDocument as IDidDocument
} from '@web5/dids';
import { networks } from 'bitcoinjs-lib';
import { ClientConfig } from './bitcoind.js';

/** Classes */
export class BtcNetworks {
  public static mainnet: networks.Network = networks.bitcoin;
  public static testnet: networks.Network = networks.testnet;
  public static signet: networks.Network = networks.testnet;
  public static regtest: networks.Network = networks.regtest;

  public static get(network: string): networks.Network {
    switch (network) {
      case 'mainnet':
        return BtcNetworks.mainnet;
      case 'testnet':
        return BtcNetworks.testnet;
      case 'signet':
        return BtcNetworks.signet;
      case 'regtest':
        return BtcNetworks.regtest;
      default:
        throw new Error(`Unknown network: ${network}`);
    }
  }
}

/** Interfaces */
export interface IDidBtc1 {
    methodName: 'btc1';
    create(options: DidBtc1CreateOptions): Promise<CreateResponse>;
    resolve(identifier: string, options: DidResolutionOptions): Promise<CreateResponse>;
}
export interface DidServiceSingletonBeacon extends DidService {
    id: '#singletonBeacon';
    type: 'SingletonBeacon';
    serviceEndpoint: string;
}
export interface DidBtc1CreateOptions {
    /** DID BTC1 Version Number */
    version?: string;
    /** Bitcoin Network */
    network?: string;
    /** DID BTC1 ID Type: key or external */
    idType?: string;
}
export interface DidBtc1CreateParams {
    /** Pubkey Bytes used to generate the id required if idType = key */
    pubKeyBytes?: PublicKeyBytes;
    /** Intermediate Document supplied by user if idType = external */
    intermediateDocument?: IntermediateDocument;
    /** Options for creating a Decentralized Identifier (DID) using the DID BTC1 method */
    options?: DidBtc1CreateOptions;
}
export interface BeaconServicesParams {
    network: networks.Network
    pubKeyBytes: PublicKeyBytes;
    beaconType?: string;
}
export interface GenerateBitcoinAddrs {
    pubkey: Uint8Array;
    network: networks.Network;
}
export interface BeaconServiceParams {
    serviceId: string;
    beaconType: string;
    bitcoinAddress: string;
}
export interface CreateResponse {
    did: string;
    initialDocument: Btc1DidDocument;
};
export interface Btc1IdentifierComponents extends Did {
    hrp: string;
    genesisBytes: Uint8Array;
    version: string;
    network: string;
    idBech32: string;
};
export interface IntermediateVerificationMethod extends DidVerificationMethod {
    id: string;
    type: string;
    controller: 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    publicKeyMultibase: string;
}
export interface IntermediateDocument extends DidDocument {
    id: 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    verificationMethod: IntermediateVerificationMethod[];
}
export interface ReadExternal {
    identifier: string;
    identifierComponents: Btc1IdentifierComponents;
    options: DidResolutionOptions;
}
export interface DidBtc1ResolutionOptions extends DidResolutionOptions {
  /** Version Id */
  versionId?: string;
  /** Bitcoind gRPC client config */
  bitcoinConfig?: ClientConfig;
  /** Sidecar data for external resolution */
  sidecarData?: { initialDocument: Btc1DidDocument };
}
export interface Btc1RootCapability {
    '@context': string;
    id: `urn:zcap:root${string}`;
    controller: string;
    invocationTarget: string;
}
export interface PatchOperation {
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
    path: string;
    value?: any; // Required for add, replace, test
    from?: string; // Required for move, copy
}
export interface Btc1DocumentPatch {
    '@context': [
        'https://w3id.org/zcap/v1',
        'https://w3id.org/security/data-integrity/v2',
        'https://w3id.org/json-ld-patch/v1'
    ];
    patch: PatchOperation[];
}
export interface IDidBtc1Create {
  deterministic(params: CreateDeterministic): CreateResponse;
  external(params: CreateExternal): Promise<CreateResponse>;
  identifier(params: CreateIdentifierParams): string;
}
export interface IDidBtc1Read {
  deterministic(params: ReadDeterministic): CreateResponse;
  external(params: ReadExternal): Promise<CreateResponse>;
  sidecar(params: ReadDeterministic): string;
  cas(params: ReadCas): Promise<Btc1DidDocument>;
}
export interface IDidBtc1Utils {
    parse(identifier: string): Btc1IdentifierComponents;
    extractDidFragment(input: unknown): string | undefined;
    isDidVerificationMethod(obj: unknown): boolean;
    isDidService(obj: unknown): boolean;
    getVerificationMethods(params: { didDocument: DidDocument; }): DidVerificationMethod[];
    getDidServices(params: { didDocument: DidDocument; }): DidService[];
    generateBitcoinAddrs(params: GenerateBitcoinAddrs): Array<Array<string>>;
    generateBeaconServices(params: BeaconServicesParams): Array<DidService>;
    generateBeaconService(params: BeaconServiceParams): DidService;
}
export interface ConstructPayloadParams {
    identifier: string;
    sourceDocument: Btc1DidDocument;
    sourceVersionId: string;
    documentPatch: Btc1DocumentPatch;
}
export interface UpdateParams extends ConstructPayloadParams {
    verificationMethodId: string;
    beaconIds: string[];
    options: RecoveryOptions;
}
export interface UpdatePayload {
    '@context': string[];
    patch: Btc1DocumentPatch;
    targetHash: string;
    targetVersionId: string;
    sourceHash: string;
}
export interface TraverseBlockchainParams {
  contemporaryDidDocument: Btc1DidDocument;
  targetVersionId: string;
  targetBlockheight: number;
  sidecarData: { initialDocument: Btc1DidDocument };
  currentVersionId: number | 1;
  updateHashHistory: string[];
  contemporaryBlockheight: number | 0;
}
export interface ProofOptions {
  type: string;
  cryptosuite: string;
  verificationMethod: string;
  proofPurpose: string;
  capability: string;
  capabilityAction: string;
}

/** Types */
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';
export type CreateIdentifierParams = RequireOnly<DidBtc1CreateOptions, 'network' & 'version'> & {
    genesisBytes: Uint8Array;
}
export type ReadIdentifierParams = RequireOnly<DidBtc1CreateOptions, 'network' & 'version'> & {
  genesisBytes: Uint8Array;
}
export type CreateDeterministic = Required<Pick<DidBtc1CreateOptions, 'network' | 'version'> & Pick<DidBtc1CreateParams, 'pubKeyBytes'>>;
export type CreateExternal = Required<Pick<DidBtc1CreateOptions, 'network' | 'version'> & Pick<DidBtc1CreateParams, 'intermediateDocument'>>;
export type ReadDeterministic = CreateDeterministic;

export type Prefix = 'x' | 'k';
export type Bech32Encoding = `${Prefix}1${string}`;
export type ReadSidecar = Omit<ReadExternal, 'options'> & {
    initialDocument: Btc1DidDocument
};
export type ReadCas = Omit<ReadExternal, 'options'>
export type RecoveryOptions = {
  seed: string;
  entropy: Uint8Array;
  hd: { mnemonic: string; path: string };
}
export type InvokePayloadParams = {
  identifier: string;
  updatePayload: UpdatePayload;
  verificationMethod: DidVerificationMethod;
  options: RecoveryOptions;
}
export type Bytes = Uint8Array;
export type Signature = Bytes;
export type Hex = Bytes | string;
export type PrivKey = Hex;
export type PubKey = Hex;
export type UnixTimestamp = number;
export type TargetDocumentParams = {
  initialDocument: Btc1DidDocument;
  options: DidResolutionOptions
};
export type BroadcastPayloadParams = {
  beaconService: DidService;
  didUpdateInvocation: DidVerificationMethod;
  options: DidResolutionOptions;
}
export type BeaconServiceEndpoint = string;

/** Enums */
export enum DidBtc1IdTypes {
    key = 'key',
    external = 'external'
}
export enum Btc1Networks {
    mainnet = 'mainnet',
    testnet = 'testnet',
    signet = 'signet',
    regtest = 'regtest'
}
export type PublicKeyBytes = Uint8Array;
export type GetSigningMethod = {
  didDocument: DidDocument;
  methodId?: string;
}

/** Classes */
export class DidDocument implements IDidDocument {
  '@context'?: string | (string | Record<string, any>)[] | undefined;
  id: string;
  alsoKnownAs?: string[] | undefined;
  controller?: string | string[] | undefined;
  verificationMethod?: DidVerificationMethod[] | undefined;
  assertionMethod?: (string | DidVerificationMethod)[] | undefined;
  authentication?: (string | DidVerificationMethod)[] | undefined;
  keyAgreement?: (string | DidVerificationMethod)[] | undefined;
  capabilityDelegation?: (string | DidVerificationMethod)[] | undefined;
  capabilityInvocation?: (string | DidVerificationMethod)[] | undefined;
  service?: DidService[] | undefined;

  constructor(id: string) {
    this.id = id;
  }
}
export class Btc1DidDocument extends DidDocument {
  verificationMethod: DidVerificationMethod[];
  service: DidService[];
  constructor(id: string, verificationMethod: DidVerificationMethod[], service: DidService[]) {
    super(id);
    this.verificationMethod = verificationMethod;
    this.service = service;
  }

  public static validate(didDocument: any): { valid: boolean, errors?: string[] } {
    const errors: string[] = [];

    // 1. @context must be present and include "https://www.w3.org/ns/did/v1"
    if (!didDocument['@context']) {
      errors.push('Missing "@context" field');
    } else if (
      Array.isArray(didDocument['@context']) &&
            !didDocument['@context'].includes('https://www.w3.org/ns/did/v1')
    ) {
      errors.push('The "@context" must include "https://www.w3.org/ns/did/v1"');
    } else if (typeof didDocument['@context'] === 'string' && didDocument['@context'] !== 'https://www.w3.org/ns/did/v1') {
      errors.push('The "@context" must be "https://www.w3.org/ns/did/v1"');
    }

    // 2. id must be a valid DID
    if (!didDocument.id || typeof didDocument.id !== 'string' || !didDocument.id.startsWith('did:')) {
      errors.push('Invalid "id" field: It must be a string starting with "did:"');
    }

    // 3. Verification Methods must be valid
    if (didDocument.verificationMethod) {
      if (!Array.isArray(didDocument.verificationMethod)) {
        errors.push('"verificationMethod" must be an array.');
      } else {
        for (const method of didDocument.verificationMethod) {
          if (!method.id || !method.type || !method.controller) {
            errors.push(`Invalid verification method: ${JSON.stringify(method)}.`);
          }
        }
      }
    }

    // 4. Services must be valid
    if (didDocument.service) {
      if (!Array.isArray(didDocument.service)) {
        errors.push('"service" must be an array.');
      } else {
        for (const service of didDocument.service) {
          if (!service.id || !service.type || !service.serviceEndpoint) {
            errors.push(`Invalid service definition: ${JSON.stringify(service)}.`);
          }
        }
      }
    }

    // 5. Ensure key references are valid in authentication, assertionMethod, keyAgreement, etc.
    const keySections = [
      'authentication',
      'assertionMethod',
      'keyAgreement',
      'capabilityInvocation',
      'capabilityDelegation'
    ];

    for (const section of keySections) {
      if (didDocument[section]) {
        if (!Array.isArray(didDocument[section])) {
          errors.push(`"${section}" must be an array.`);
        } else {
          for (const entry of didDocument[section]) {
            if (typeof entry !== 'string' && typeof entry !== 'object') {
              errors.push(`Invalid entry in "${section}": ${JSON.stringify(entry)}.`);
            }
          }
        }
      }
    }

    return { valid: true };
  }
}