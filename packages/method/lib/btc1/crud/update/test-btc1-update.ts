import { DidBtc1 } from '../src/did-btc1.js';

/*
  identifier: string;
    sourceDocument: Btc1DidDocument;
    sourceVersionId: number;
    patch: PatchOperation[];
    verificationMethodId: string;
    beaconIds: string[];
*/
const update = await DidBtc1.update({
  identifier           : 'did:btcr:xyz',
  sourceDocument       : {} as any,
  sourceVersionId      : 1,
  patch                : [],
  verificationMethodId : 'did:btcr:xyz#key-1',
  beaconIds            : ['did:btcr:xyz#key-1'],
});
console.log('Update Response:', update);