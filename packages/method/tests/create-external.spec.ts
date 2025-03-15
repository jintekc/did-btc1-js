import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { idTypes, networks, versions } from './test-data.js';
import { IntermediateDocument } from '../src/index.js';

const idType = idTypes.external;

/**
 * DidBtc1 Create External Test Cases
 *
 * idType=external, intermediateDocument
 * idType=external, intermediateDocument, version
 * idType=external, intermediateDocument, network
 * idType=external, intermediateDocument, version, network
 *
 */
describe('DidBtc1 Create External', () => {
  const intermediateDocument = {
    '@context' : [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
      'https://github.com/dcdpr/did-btc1'
    ],
    id                   : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    authentication       : [ '#initialKey' ],
    assertionMethod      : [ '#initialKey' ],
    capabilityInvocation : [ '#initialKey' ],
    capabilityDelegation : [ '#initialKey' ],
    verificationMethod   : [
      {
        id                 : '#initialKey',
        type               : 'Multikey',
        controller         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        publicKeyMultibase : 'z66Pn1kuq7yjsfn4nWfm6iy8Tsb7jyJY5qg5BBNZfdKcc8zL'
      }
    ],
    service : [
      {
        id              : '#initialP2PKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : 'bitcoin:1Dqn88JvoNBpQn4dssyJiSYpVMAjfJdHAV'
      },
      {
        id              : '#initialP2WPKH',
        type            : 'SingletonBeacon',
        serviceEndpoint : 'bitcoin:bc1q3ndjg6w5axx2ly4pex9laqnc07mqmqktppp4cq'
      },
      {
        id              : '#initialP2TR',
        type            : 'SingletonBeacon',
        serviceEndpoint : 'bitcoin:bc1p8vttvdyn6mr5hrr5ff7jklpj5f790hlwf3fk3swm4u5u33vk22rq9h7lxu'
      }
    ]
  } as IntermediateDocument;

  it('should create external identifier and DID document',
    async () => {
      const response = await DidBtc1.create({ intermediateDocument, options: { idType } });
      expect(response).to.exist;

      expect(response.did).to.exist.and.to.be.a('string');
      expect(response.did).to.equal(response.initialDocument.id);

      expect(response.initialDocument).to.exist.and.to.be.a('object');
      response.initialDocument.verificationMethod?.map(vm => expect(response.did).to.equal(vm.controller));
    }
  );

  it('should create identifier and DID document with version and intermediateDocument',
    async () => {
      const responses = await Promise.all(
        versions.map(async (version: string) =>
          await DidBtc1.create(
            {
              intermediateDocument,
              options : { idType, version },
            }
          )
        )
      );
      expect(responses.length).to.equal(5);
    }
  );

  it('should create identifier and DID document with network and intermediateDocument',
    async () => {
      const results = await Promise.all(
        networks.map(async (network: string) =>
          await DidBtc1.create(
            {
              intermediateDocument,
              options : { network, idType },
            }
          )
        )
      );
      expect(results.length).to.equal(4);
    }
  );

  it('should create identifier and DID document with version, network and intermediateDocument,',
    async () => {
      const results = await Promise.all(
        versions
          .flatMap((version: string) => networks.map((network: string) => [version, network]))
          .map(async ([version, network]: string[]) =>
            await DidBtc1.create(
              {
                intermediateDocument,
                options : { version, network, idType },
              }
            )
          )
      );
      expect(results.length).to.equal(20);
    }
  );
});