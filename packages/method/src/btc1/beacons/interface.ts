import { PublicKeyBytes } from '@did-btc1/cryptosuite';
import { DidService as IDidService } from '@web5/dids';
import { networks } from 'bitcoinjs-lib';
import { Transaction } from '../../bitcoin/types.js';

export interface BeaconService extends IDidService {
    serviceEndpoint: string;
    casType?: string;
}

export interface BeaconServiceAddress extends BeaconService {
    address?: string;
}
export interface Signal {
  beaconId: string;
  beaconType: string;
  tx: Transaction;
}
export interface BeaconSignal {
  blockheight: number;
  signals: Array<Signal>;
}
export interface BeaconServicesParams {
    network: networks.Network
    publicKey: PublicKeyBytes;
    beaconType?: string;
}