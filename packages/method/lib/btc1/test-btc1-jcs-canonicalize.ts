import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import canonicalize from 'canonicalize';
import { canonicalize as jcs } from '@web5/crypto';
import { canonicalization } from '@did-btc1/common';

const updatePayload = {
  '@context' : [
    'https://w3id.org/security/v2',
    'https://w3id.org/zcap/v1',
    'https://w3id.org/json-ld-patch/v1'
  ],
  'patch' : [
    {
      'op'    : 'add',
      'path'  : '/service/3',
      'value' : {
        'id'              : '#linked-domain',
        'type'            : 'LinkedDomains',
        'serviceEndpoint' : 'https://contact-me.com'
      }
    }
  ],
  'sourceHash'      : '9EUnJwoNB1DZF4yUmb8iFsBjXkUkSg9Hjq2P1NS96AX7',
  'targetHash'      : 'BZ4n8wiDWFRBV4Zu6aDV4WFsRPn3Jmu2Nb4xW9ebW8fj',
  'targetVersionId' : 2,
  'proof'           : {
    'type'               : 'DataIntegrityProof',
    'cryptosuite'        : 'schnorr-secp256k1-jcs-2025',
    'verificationMethod' : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf#initialKey',
    'proofPurpose'       : 'capabilityInvocation',
    'capability'         : 'urn:zcap:root:did%3Abtc1%3Aregtest%3Ak1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
    'capabilityAction'   : 'Write',
    '@context'           : [
      'https://w3id.org/security/v2',
      'https://w3id.org/zcap/v1',
      'https://w3id.org/json-ld-patch/v1'
    ],
    'proofValue' : 'z5xYgTCPgBW7ZAYywGkhznBXKKtjMX4cudM3Zc29GdHWe1QvV4hLmzuL2vYcb3gzc5ZyAm1KezfbYXHU6TuDaChCm'
  }
};
const canonicalizePayload = canonicalize(updatePayload);
const canonicalizeWeb5 = jcs(updatePayload);
const canonicalizeCryptosuite = canonicalization.jcs(updatePayload);
console.log('pkg: canonicalize', canonicalizePayload);
console.log('pkg: @web5/crypto', canonicalizeWeb5);
console.log('pkg: packages/cryptosuite', canonicalizeCryptosuite);

const canonicalizePayloadBytes = sha256(canonicalizePayload!);
const canonicalizeWeb5Bytes = sha256(canonicalizeWeb5!);
const canonicalizeCryptosuiteBytes = sha256(canonicalizeCryptosuite!);
console.log('pkg: canonicalize - sha256', canonicalizePayloadBytes);
console.log('pkg: @web5/crypto - sha256', canonicalizeWeb5Bytes);
console.log('pkg: packages/cryptosuite - sha256', canonicalizeCryptosuiteBytes);

console.log('pkg: canonicalize - sha256 - hex', bytesToHex(canonicalizePayloadBytes));
console.log('pkg: @web5/crypto - sha256 - hex', bytesToHex(canonicalizeWeb5Bytes));
console.log('pkg: packages/cryptosuite - sha256 - hex', bytesToHex(canonicalizeCryptosuiteBytes));