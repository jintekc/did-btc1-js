import { DidUpdatePayload, PrivateKeyBytes, ProofBytes, PublicKeyBytes } from '@did-btc1/common';
import { DidBtc1Identifier } from '../btc1/crud/create.js';
import { BeaconService } from '../interfaces/ibeacon.js';
import { Btc1DidDocument, Btc1VerificationMethod } from '../utils/btc1/did-document.js';
import { BlockV3 } from './bitcoin.js';

export type DidPlaceholder = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export type FindNextSignals = {
  block: BlockV3;
  beacons: BeaconService[]
}
export type BeaconUri = string;
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';


export type Prefix = 'x' | 'k';
export type Bech32Encoding = `${Prefix}1${string}`;
export type RecoveryOptions = {
  seed: string;
  entropy: Uint8Array;
  hd: { mnemonic: string; path: string };
}
export type InvokePayloadParams = {
  btc1Identifier: string;
  didUpdatePayload: DidUpdatePayload;
  verificationMethod: Btc1VerificationMethod;
}

export type Bytes = Uint8Array;
export type DocumentBytes = Bytes;
export type KeyPairType = {
  privateKey: PrivateKeyBytes;
  publicKey: PublicKeyBytes;
};

export interface Btc1SidecarData {
  did: DidBtc1Identifier;
};
export type Metadata = {
  updatePayload: DidUpdatePayload;
  proofs?: any;
};

export type SignalSidecarData = { [signalId: string]: Metadata; }
export type SignalsMetadata = SignalSidecarData;

export interface SingletonSidecar extends Btc1SidecarData {
  signalsMetadata: SignalSidecarData;
}
export interface CIDAggregateSidecar extends Btc1SidecarData {
  initialDocument: Btc1DidDocument;
  cidUpdates: Array<string>;
}
export interface SMTAggregateSidecar extends Btc1SidecarData {
  // SMTAggregate
  smtProof: ProofBytes;
}
export type SidecarData = SingletonSidecar | CIDAggregateSidecar | SMTAggregateSidecar;
export type UnixTimestamp = number;
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

/** Alias type for a publicKeyMultbase encoded as a Bip340 Multikey (z + base58btc(bip340Header + publicKey) */
export type Bip340Encoding = string;

export type GetSigningMethodParams = {
  didDocument: Btc1DidDocument;
  methodId?: string;
};
