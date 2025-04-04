import { PublicKeyUtils } from '@did-btc1/cryptosuite';
import { initEccLib, payments } from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BtcNetworks } from '../../src/types/btc1.js';
import { KeyPair } from '../src/utils/keypair.js';
initEccLib(ecc);

const privateKey = new Uint8Array([
  189,  38, 143, 201, 181, 132,  46, 71,
  232,  89, 206, 136, 196, 208, 94, 153,
  101, 219, 165,  94, 235, 242, 29, 164,
  176, 161, 99, 193, 209,  97,  23, 158
]);
const keys = new KeyPair(privateKey);
const publicKey = keys.publicKey!;
const network = BtcNetworks.get('mainnet');
const document = {
  pubkey               : Array.from(publicKey),
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
      publicKeyMultibase : PublicKeyUtils.encode(publicKey.slice(1, 33)),
    }],
    service : [
      {
        id              : '#initialP2PKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2pkh({ pubkey: publicKey, network }).address}`
      },
      {
        id              : '#initialP2WPKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2wpkh({ pubkey: publicKey, network }).address}`
      },
      {
        id              : '#initialP2TR',
        type            : 'SingletonBeacon',
        serviceEndpoint : `bitcoin:${payments.p2tr({ internalPubkey: publicKey.slice(1, 33), network }).address}`
      }
    ]
  }
};

console.log('document', document.intermediateDocument);
