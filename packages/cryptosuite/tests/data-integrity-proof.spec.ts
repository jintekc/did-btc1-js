import { expect } from 'chai';
import { Cryptosuite } from '../src/di-bip340/cryptosuite/index.js';
import { DataIntegrityProof } from '../src/di-bip340/data-integrity-proof/index.js';
import { Multikey } from '../src/di-bip340/multikey/index.js';
import { KeyPair, PrivateKeyUtils } from '@did-btc1/key-pair';
import { ProofOptions } from '../src/types/di-proof.js';

const unsecuredDocument = {
  '@context' : [
    'https://www.w3.org/ns/credentials/v2',
    'https://www.w3.org/ns/credentials/examples/v2',
  ],
  id                : 'http://university.example/credentials/58473',
  type              : ['VerifiableCredential', 'ExampleAlumniCredential'],
  validFrom         : '2020-01-01T00:00:00Z',
  issuer            : 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65',
  credentialSubject : {
    id       : 'did:example:ebfeb1f712ebc6f1c276e12ec21',
    alumniOf : {
      id   : 'did:example:c276e12ec21ebfeb1f712ebc6f1',
      name : 'Example University',
    },
  },
};
const id = '#initialKey';
const controller = 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65';
const SECRET = 52464508790539176856770556715241483442035423615466097401201513777400180778402n;
const options: ProofOptions = {
  type               : 'DataIntegrityProof',
  cryptosuite        : 'bip340-jcs-2025',
  verificationMethod : 'did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65#initialKey',
  proofPurpose       : 'attestationMethod'
};

describe('Data Integrity Proof', () => {
  const privateKey = PrivateKeyUtils.fromSecret(SECRET);
  const keyPair = new KeyPair({ privateKey });
  const multikey = new Multikey({ id, controller, keyPair });
  const cryptosuite = new Cryptosuite({ cryptosuite: 'bip340-jcs-2025', multikey });
  const diProof = new DataIntegrityProof(cryptosuite);

  describe('addProof and verifyProof', () => {
    it('should return a public key', async () => {
      const securedDocument = await diProof.addProof({ document: unsecuredDocument, options });
      expect(securedDocument).to.have.property('proof');

      const verifiedProof = await diProof.verifyProof({
        document        : JSON.stringify(securedDocument),
        expectedPurpose : 'attestationMethod',
        mediaType       : 'application/json'
      });
      expect(verifiedProof.verified).to.be.true;
    });
  });
});