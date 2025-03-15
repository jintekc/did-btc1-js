import { ProofBytes } from '@did-btc1/cryptosuite';
import { RequireOnly } from '@web5/common';
import { BlockV3 } from '../bitcoin/types.js';
import { Btc1DidDocument, Btc1VerificationMethod } from '../btc1/did-document.js';
import {
  DidComponents,
  DidCreateOptions,
  DidCreateParams,
  DidResolutionOptions,
  UpdatePayload
} from '../btc1/interface.js';
import { BeaconService } from './beacons/interface.js';

export type DidPlaceholder = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export type FindNextSignals = {
  block: BlockV3;
  beacons: BeaconService[]
}
export type BeaconUri = string;
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';
export type CreateIdentifierParams = RequireOnly<DidCreateOptions, 'network' & 'version'> & {
    genesisBytes: Uint8Array;
}
export type ReadIdentifierParams = RequireOnly<DidCreateOptions, 'network' & 'version'> & {
  genesisBytes: Uint8Array;
}
export type DidCreateDeterministic = Required<Pick<DidCreateOptions, 'network' | 'version'> & Pick<DidCreateParams, 'publicKey'>>;
export type DidCreateExternal = Required<Pick<DidCreateOptions, 'network' | 'version'> & Pick<DidCreateParams, 'intermediateDocument'>>;
export type DidReadDeterministic = {
    identifier: string;
    components: DidComponents;
};
export type DidReadExternal = DidReadDeterministic & {
    options: DidResolutionOptions;
}
export type DidReadSidecar = {
    components: DidComponents;
    initialDocument: Btc1DidDocument
};
export type DidReadCas = Omit<DidReadExternal, 'options'>

export type Prefix = 'x' | 'k';
export type Bech32Encoding = `${Prefix}1${string}`;
export type RecoveryOptions = {
  seed: string;
  entropy: Uint8Array;
  hd: { mnemonic: string; path: string };
}
export type InvokePayloadParams = {
  identifier: string;
  updatePayload: UpdatePayload;
  verificationMethod: Btc1VerificationMethod;
  options: RecoveryOptions;
}

export type Bytes = Uint8Array;
export type Signature = Bytes;
export type Hex = Bytes | string;
export type PrivateKey = Bytes;
export type PublicKey = Bytes;
export type KeyPairType = {
  privateKey: PrivateKey;
  publicKey: PublicKey
};
export interface SidecarData {
  // Did Document V0
  // Use beacon address to find CID in OP_RETURN. Use CID in OP_RETURN to find update payload in CAS.
  initialDocument: Btc1DidDocument
};

export interface SidecarDataCID extends SidecarData {
  // The references to a location on a CAS (IPFS) of the DID update payload objects.
  cidUpdates?: Array<string>;
}

export interface SidecarDataSMT extends SidecarData {
  // SMTAggregate
  smtProof: ProofBytes;
}
export type UnixTimestamp = number;
export type TargetDocumentParams = {
  initialDocument: Btc1DidDocument;
  options: DidResolutionOptions;
};
export type BroadcastPayloadParams = {
  beaconService: BeaconService;
  didUpdateInvocation: Btc1VerificationMethod;
  options: DidResolutionOptions;
}
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

/** Alias type for a publicKeyMultbase encoded as a Bip340 Multikey (z + base58btc(bip340Header + publicKey) */
export type Bip340Encoding = string;