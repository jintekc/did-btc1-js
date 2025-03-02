import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { idTypes, networks, versions, pubKeyBytes } from './test-data.js';

const idType = idTypes.key;

/**
 * DidBtc1 Create Key Test Cases
 *
 * pubKeyBytes
 * idType, pubKeyBytes
 * idType, pubKeyBytes, version
 * idType, pubKeyBytes, network
 * idType, pubKeyBytes, version, network
 *
 */
describe('DidBtc1 Create Key Test Cases', () => {
  it('should create key-based id and document with pubKeyBytes',
    async () => {
      const result = await DidBtc1.create({ pubKeyBytes });
      expect(result).to.exist;
    });

  it('should create key-based id and document with idType and pubKeyBytes',
    async () => {
      const result = await DidBtc1.create(
        {
          pubKeyBytes,
          options : { idType }
        }
      );
      expect(result).to.exist;
    }
  );

  it('should create key-based id and document with idType, pubKeyBytes and version',
    async () => {
      const results = await Promise.all(
        versions.map(async (version: string) =>
          await DidBtc1.create(
            {
              pubKeyBytes,
              options : { idType, version }
            }
          )
        )
      );
      expect(results.length).to.equal(5);
    }
  );

  it('should create key-based id and document with idType, pubKeyBytes and network',
    async () => {
      const results = await Promise.all(
        networks.map(async (network: string) =>
          await DidBtc1.create(
            {
              pubKeyBytes,
              options : { idType, network }
            }
          )
        )
      );
      expect(results.length).to.equal(4);
    }
  );

  it('should create key-based id and document with idType, pubKeyBytes, version and network',
    async () => {
      const results = await Promise.all(
        versions
          .flatMap((version: string) => networks.map((network: string) => [version, network]))
          .map(async ([version, network]: string[]) =>
            await DidBtc1.create(
              {
                pubKeyBytes,
                options : { version, network, idType }
              }
            )
          )
      );
      expect(results.length).to.equal(20);
    });
});
