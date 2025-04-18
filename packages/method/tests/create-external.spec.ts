import { ID_PLACEHOLDER_VALUE } from '@did-btc1/common';
import { PublicKey } from '@did-btc1/key-pair';
import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { BeaconUtils, Btc1DidDocument, IntermediateDidDocument } from '../src/index.js';

/**
 * DidBtc1 Create External Test Cases
 * idType=external, intermediateDocument
 * idType=external, intermediateDocument, version
 * idType=external, intermediateDocument, network
 * idType=external, intermediateDocument, version, network
 */
describe('DidBtc1 Create External', () => {
  const version = 1;
  const networks = ['bitcoin', 'signet', 'regtest', 'testnet3', 'testnet4' ];
  const did = 'did:btc1:x1qryscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx6z42p4y';
  const idType = 'EXTERNAL';
  const pubKeyBytes = new Uint8Array([
    3, 147,  88, 104, 169, 222, 126,
    240, 163,  35, 114, 143, 194, 209,  28,
    255,  72, 250, 175, 176, 247, 124, 245,
    215,  91, 220, 129, 191,  13,  20,  58,
    47,  32
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
      controller         : ID_PLACEHOLDER_VALUE,
      publicKeyMultibase
    }
  ];
  const intermediateDocument = new IntermediateDidDocument({ id: ID_PLACEHOLDER_VALUE, verificationMethod, service });

  it('should create external identifier and DID document',
    async () => {
      const result = await DidBtc1.create({ idType, intermediateDocument });
      expect(result.did).to.equal(did);
      expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument.verificationMethod[0].id).to.equals(intermediateDocument.verificationMethod[0].id);
      expect(result.initialDocument.verificationMethod[0].type).to.equals(intermediateDocument.verificationMethod[0].type);
      expect(result.initialDocument.verificationMethod[0].controller).to.not.equal(intermediateDocument.verificationMethod[0].controller);
      expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(intermediateDocument.verificationMethod[0].publicKeyMultibase);
      expect(result.initialDocument.service[0].id).to.equals(intermediateDocument.service[0].id);
      expect(result.initialDocument.service[0].type).to.equals(intermediateDocument.service[0].type);
      expect(result.initialDocument.service[0].serviceEndpoint).to.equals(intermediateDocument.service[0].serviceEndpoint);
    }
  );

  it('should create new DID and BTC1 DID Document using version and intermediateDocument',
    async () => {
      const result = await DidBtc1.create({ idType, intermediateDocument, options: { version }});
      expect(result.did).to.equal(did);
      expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
      expect(result.initialDocument.verificationMethod[0].id).to.equals(intermediateDocument.verificationMethod[0].id);
      expect(result.initialDocument.verificationMethod[0].type).to.equals(intermediateDocument.verificationMethod[0].type);
      expect(result.initialDocument.verificationMethod[0].controller).to.not.equal(intermediateDocument.verificationMethod[0].controller);
      expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(intermediateDocument.verificationMethod[0].publicKeyMultibase);
      expect(result.initialDocument.service[0].id).to.equals(intermediateDocument.service[0].id);
      expect(result.initialDocument.service[0].type).to.equals(intermediateDocument.service[0].type);
      expect(result.initialDocument.service[0].serviceEndpoint).to.equals(intermediateDocument.service[0].serviceEndpoint);
    }
  );

  it('should create new DID and BTC1 DID Document using network and intermediateDocument',
    async () => {
      const results = await Promise.all(
        networks.map(async (network: string) =>
          await DidBtc1.create({ idType, intermediateDocument, options: { network } })
        )
      );
      results.map(result => {
        expect(result.did).to.equal(did);
        expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
        expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
        expect(result.initialDocument).to.exist.and.to.be.instanceOf(Btc1DidDocument);
        expect(result.initialDocument.verificationMethod[0].id).to.equals(intermediateDocument.verificationMethod[0].id);
        expect(result.initialDocument.verificationMethod[0].type).to.equals(intermediateDocument.verificationMethod[0].type);
        expect(result.initialDocument.verificationMethod[0].controller).to.not.equal(intermediateDocument.verificationMethod[0].controller);
        expect(result.initialDocument.verificationMethod[0].publicKeyMultibase).to.equals(intermediateDocument.verificationMethod[0].publicKeyMultibase);
        expect(result.initialDocument.service[0].id).to.equals(intermediateDocument.service[0].id);
        expect(result.initialDocument.service[0].type).to.equals(intermediateDocument.service[0].type);
        expect(result.initialDocument.service[0].serviceEndpoint).to.equals(intermediateDocument.service[0].serviceEndpoint);
      });
    }
  );
});