import { PublicKey } from '@did-btc1/key-pair';
import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { BeaconUtils, Btc1DidDocument } from '../src/index.js';

/**
 * DidBtc1 Create Key Test Cases
 * publicKey
 * idType=key, publicKey
 * idType=key, publicKey, version
 * idType=key, publicKey, network
 * idType=key, publicKey, version, network
 */
describe('DidBtc1 Create Deterministic', () => {
  const version = 1;
  const networks = ['bitcoin', 'signet', 'regtest', 'testnet3', 'testnet4' ];
  const did = 'did:btc1:k1qqpexkrg4808au9rydeglsk3rnl53740krmheawht0wgr0cdzsaz7gq3dnzlj';
  const idType = 'KEY';
  const pubKeyBytes = new Uint8Array([
    3, 147,  88, 104, 169, 222, 126, 240,
    163,  35, 114, 143, 194, 209,  28, 255,
    72, 250, 175, 176, 247, 124, 245, 215,
    91, 220, 129, 191,  13,  20,  58,  47,
    32
  ]);
  const publicKey = new PublicKey(pubKeyBytes);
  const publicKeyMultibase = publicKey.multibase;
  const service = BeaconUtils.generateBeaconServices({
    network    : 'bitcoin',
    beaconType : 'SingletonBeacon',
    publicKey  : publicKey.bytes
  });
  const verificationMethod = [
    {
      id                 : '#initialKey',
      type               : 'Multikey',
      controller         : did,
      publicKeyMultibase
    }
  ];
  const didDocument = new Btc1DidDocument({ id: did, verificationMethod, service });

  it('should create a deterministic key identifier and DID document from a publicKey',
    async () => {
      const result = await DidBtc1.create({ idType, pubKeyBytes });
      expect(result.did).to.equal(did);
      expect(result.initialDocument).to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument.verificationMethod[0].id).to.equals(didDocument.verificationMethod[0].id);
      expect(result.initialDocument.verificationMethod[0].type).to.equals(didDocument.verificationMethod[0].type);
      expect(result.initialDocument.verificationMethod[0].controller).to.equals(didDocument.verificationMethod[0].controller);
      expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(didDocument.verificationMethod[0].publicKeyMultibase);
      expect(result.initialDocument.service[0].id).to.equals(didDocument.service[0].id);
      expect(result.initialDocument.service[0].type).to.equals(didDocument.service[0].type);
      expect(result.initialDocument.service[0].serviceEndpoint).to.equals(didDocument.service[0].serviceEndpoint);
    });

  it('should create a deterministic key identifier and DID document from a publicKey and version',
    async () => {
      const result = await DidBtc1.create({ idType, pubKeyBytes, options: { version } });
      expect(result.did).to.equal(did);
      expect(result.initialDocument).to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument).to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument.verificationMethod[0].id).to.equals(didDocument.verificationMethod[0].id);
      expect(result.initialDocument.verificationMethod[0].type).to.equals(didDocument.verificationMethod[0].type);
      expect(result.initialDocument.verificationMethod[0].controller).to.equals(didDocument.verificationMethod[0].controller);
      expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(didDocument.verificationMethod[0].publicKeyMultibase);
      expect(result.initialDocument.service[0].id).to.equals(didDocument.service[0].id);
      expect(result.initialDocument.service[0].type).to.equals(didDocument.service[0].type);
      expect(result.initialDocument.service[0].serviceEndpoint).to.equals(didDocument.service[0].serviceEndpoint);
    });

  it('should create a deterministic key identifier and DID document from a publicKey and network',
    async () => {
      const results = await Promise.all(
        networks.map(
          async (network: string) =>
            await DidBtc1.create({ idType, pubKeyBytes, options: { network } })
        )
      );
      results.map(result => {
        expect(result.did).to.equal(did);
        expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
        expect(result.initialDocument).to.be.instanceOf(Btc1DidDocument);
        expect(result.initialDocument.verificationMethod[0].id).to.equals(didDocument.verificationMethod[0].id);
        expect(result.initialDocument.verificationMethod[0].type).to.equals(didDocument.verificationMethod[0].type);
        expect(result.initialDocument.verificationMethod[0].controller).to.equals(didDocument.verificationMethod[0].controller);
        expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(didDocument.verificationMethod[0].publicKeyMultibase);
        expect(result.initialDocument.service[0].id).to.equals(didDocument.service[0].id);
        expect(result.initialDocument.service[0].type).to.equals(didDocument.service[0].type);
        expect(result.initialDocument.service[0].serviceEndpoint).to.equals(didDocument.service[0].serviceEndpoint);
      });
    });
});
