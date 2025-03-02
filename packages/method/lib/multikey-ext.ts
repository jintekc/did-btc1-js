import { initEccLib, payments } from 'bitcoinjs-lib';
import { writeFile } from 'fs/promises';
import * as ecc from 'tiny-secp256k1';
import { BtcNetworks } from '../src/types.js';
import Btc1AuxUtils from '../src/utils/aux.js';
initEccLib(ecc);

const pubkeys = Array.from({ length: 10 }).map(_ => Btc1AuxUtils.generatePubKeyBytes());
const network = BtcNetworks.get('mainnet');
const initialDocs = pubkeys.map(pubkey => ({
  pubkey               : Array.from(pubkey),
  intermediateDocument : {
    '@context' : [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
      'https://github.com/dcdpr/did-btc1'
    ],
    id                   : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    authentication       : ['#initialKey'],
    assertionMethod      : ['#initialKey'],
    capabilityInvocation : ['#initialKey'],
    capabilityDelegation : ['#initialKey'],
    verificationMethod   : [{
      id                 : '#initialKey',
      type               : 'Multikey',
      controller         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      publicKeyMultibase : Btc1AuxUtils.base58btc1Encode(pubkey),
    }],
    service : [
      {
        id              : '#initialP2PKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2pkh({ pubkey, network }).address}`
      },
      {
        id              : '#initialP2WPKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2wpkh({ pubkey, network }).address}`
      },
      {
        id              : '#initialP2TR',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2tr({ internalPubkey: pubkey.slice(1, 33), network }).address}`
      }
    ]
  }
}));
await writeFile('./lib/out/initialExternalDocs.json', JSON.stringify(initialDocs, null, 2));
console.log('Initial Docs', JSON.stringify(initialDocs, null, 2));