import { IntermediateDocument } from '../../src/btc1/crud/interface.js';
import { DidBtc1 } from '../../../../src/did-btc1.js';
import { idTypes, networks, versions } from '../../tests/test-data.js';
const idType = idTypes.external as 'external';
const intermediateDocument = {
  '@context' : [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/multikey/v1',
    'https://github.com/dcdpr/did-btc1'
  ],
  'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'authentication' : [
    '#initialKey'
  ],
  'assertionMethod' : [
    '#initialKey'
  ],
  'capabilityInvocation' : [
    '#initialKey'
  ],
  'capabilityDelegation' : [
    '#initialKey'
  ],
  'verificationMethod' : [
    {
      'id'                 : '#initialKey',
      'type'               : 'Multikey',
      'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'publicKeyMultibase' : 'z4jKbyg1bUG6fJwYh4swsUt4YKK2oAd5MJg2tN7je1GtjX2qc'
    }
  ],
  'service' : [
    {
      'id'              : '#initialP2PKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:13Yy4wKBrJbnQWD7ddVW8hhgCm8o6xvp9n'
    },
    {
      'id'              : '#initialP2WPKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bc1qr0alxy2upt2y5e46zeaayrw04uyzsvrmrkrwa3'
    },
    {
      'id'              : '#initialP2TR',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bc1pvq4q6u937m8qx4fv4ldsc5wyykw9784y89p9xvdza28q9r3wlepq54nwvg'
    }
  ]
} as IntermediateDocument;
const results = await Promise.all(
  versions
    .flatMap(version => networks.map(network => [version, network]))
    .map(async ([version, network]) =>
      await DidBtc1.create({
        idType,
        intermediateDocument,
        options : { version, network },
      }))
);
results.map(result => console.log(JSON.stringify(result, null, 2)));