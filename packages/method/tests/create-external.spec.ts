import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { idTypes, networks, versions, intermediateDocument as testDoc } from './test-data.js';

const idType = idTypes.external;

/**
 * DidBtc1 Create External Test Cases
 *
 * external, intermediateDocument
 * external, intermediateDocument, version
 * external, intermediateDocument, network
 * external, intermediateDocument, version, network
 *
 */
describe('DidBtc1 Create External Test Cases', () => {
  it('should create external id and document',
    async () => {
      const response = await DidBtc1.create(
        {
          options              : { idType },
          intermediateDocument : JSON.parse(JSON.stringify(testDoc)),
        }
      );
      expect(response).to.exist;

      expect(response.did).to.exist.and.to.be.a('string');
      expect(response.did).to.equal(response.initialDocument.id);

      expect(response.initialDocument).to.exist.and.to.be.a('object');
      response.initialDocument.verificationMethod?.map(vm => expect(response.did).to.equal(vm.controller));
    }
  );

  it('should create external id and document with version and intermediateDocument',
    async () => {
      const responses = await Promise.all(
        versions.map(async (version: string) =>
          await DidBtc1.create(
            {
              options              : { idType, version },
              intermediateDocument : JSON.parse(JSON.stringify(testDoc)),
            }
          )
        )
      );
      expect(responses.length).to.equal(5);
    }
  );

  it('should create external id and document with network and intermediateDocument',
    async () => {
      const results = await Promise.all(
        networks.map(async (network: string) =>
          await DidBtc1.create(
            {
              options              : { network, idType },
              intermediateDocument : JSON.parse(JSON.stringify(testDoc)),
            }
          )
        )
      );
      expect(results.length).to.equal(4);
    }
  );

  it('should create external id and document with version, network and intermediateDocument,',
    async () => {
      const results = await Promise.all(
        versions
          .flatMap((version: string) => networks.map((network: string) => [version, network]))
          .map(async ([version, network]: string[]) =>
            await DidBtc1.create(
              {
                options              : { version, network, idType },
                intermediateDocument : JSON.parse(JSON.stringify(testDoc)),
              }
            )
          )
      );
      expect(results.length).to.equal(20);
    }
  );
});