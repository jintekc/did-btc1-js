import { ObjectUtils } from '@did-btc1/common';
const securedDocument = {
  '@context' : [
    'https://w3id.org/security/v2',
    'https://w3id.org/zcap/v1',
    'https://w3id.org/json-ld-patch/v1'
  ],
  patch : [
    {
      op    : 'add',
      path  : '/service/3',
      value : {
        id              : '#linked-domain',
        type            : 'LinkedDomains',
        serviceEndpoint : 'https://contact-me.com'
      }
    }
  ],
  sourceHash      : '9kSA9j3z2X3a26yAdJi6nwg31qyfaHMCU1u81ZrkHirM',
  targetHash      : 'C45TsdfkLZh5zL6pFfRmK93X4EdHusbCDwvt8d7Xs3dP',
  targetVersionId : 2,
  proof           : {
    type               : 'DataIntegrityProof',
    cryptosuite        : 'bip340-jcs-2025',
    verificationMethod : 'did:btc1:regtest:k1qdh2ef3aqne63sdhq8tr7c8zv9lyl5xy4llj8uw3ejfj5xsuhcacjq98ccc#initialKey',
    proofPurpose       : 'capabilityInvocation',
    capability         : 'urn:zcap:root:did%3Abtc1%3Aregtest%3Ak1qdh2ef3aqne63sdhq8tr7c8zv9lyl5xy4llj8uw3ejfj5xsuhcacjq98ccc',
    capabilityAction   : 'Write',
    '@context'         : [
      'https://w3id.org/security/v2',
      'https://w3id.org/zcap/v1',
      'https://w3id.org/json-ld-patch/v1'
    ],
    proofValue : 'z3yfzVGdoDF4s8y4Bk8JeV9XuZw1nMeMtNW3x5brEm7DNtmWZkNBPbCLzUBJRpctBj9QJL1dydm94ZNsPxosPnkPP'
  }
};

const obj = JSON.deepCopy(securedDocument);
console.log('securedDocument', securedDocument);
console.log('obj', obj);
const unsecuredDocument = ObjectUtils.delete({ obj, key: 'proof' });
console.log('unsecuredDocument', unsecuredDocument);
console.log('securedDocument', securedDocument);