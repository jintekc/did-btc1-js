import { Multikey } from '../src/di-bip340/multikey/index.js';
import { Cryptosuite } from '../src/di-bip340/cryptosuite/index.js';
import { DataIntegrityProof } from '../src/di-bip340/data-integrity-proof/index.js';
import { ProofOptions } from '../src/types/di-proof.js';
import * as secp from '@noble/secp256k1';

// DIDUpdatePayload
const unsecuredDocument = {
  '@context' : [
    'https://www.w3.org/ns/credentials/v2',
    'https://www.w3.org/ns/credentials/examples/v2',
  ],
  'id'                : 'http://university.example/credentials/58473',
  'type'              : ['VerifiableCredential', 'ExampleAlumniCredential'],
  'validFrom'         : '2020-01-01T00:00:00Z',
  'credentialSubject' : {
    'id'       : 'did:example:ebfeb1f712ebc6f1c276e12ec21',
    'alumniOf' : {
      'id'   : 'did:example:c276e12ec21ebfeb1f712ebc6f1',
      'name' : 'Example University',
    },
  },
  'issuer' : 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65',
};
const id = '#initialKey';
const controller = 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65';
const SECRET = 52464508790539176856770556715241483442035423615466097401201513777400180778402n;
const schnorrKey = SECRET % secp.CURVE.n;
const schnorrKeyHex = schnorrKey.toString(16).padStart(64, '0');
const privateKey = new Uint8Array(
  schnorrKeyHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
);
console.log('privateKey', privateKey);

const multikey = new Multikey({ id, controller, privateKey });
console.log('multikey', multikey);

const publicKey = multikey.publicKey;
console.log('publicKey', publicKey);

const cryptosuite = new Cryptosuite({ cryptosuite: 'schnorr-secp256k1-jcs-2025', multikey });
console.log('cryptosuite', cryptosuite);

const diProof = new DataIntegrityProof(cryptosuite);
console.log('diProof', diProof);

const options: ProofOptions = {
  type               : 'DataIntegrityProof',
  cryptosuite        : 'schnorr-secp256k1-jcs-2025',
  verificationMethod : 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65#initialKey',
  proofPurpose       : 'attestationMethod'
};
const securedDocument = await diProof.addProof({ document: unsecuredDocument, options });
console.log('securedDocument', securedDocument);
const expectedPurpose = 'attestationMethod';
const mediaType = 'application/json';
const document = JSON.stringify(securedDocument);
const verifiedProof = await diProof.verifyProof({ document, expectedPurpose, mediaType });
console.log('verifiedProof', verifiedProof);
