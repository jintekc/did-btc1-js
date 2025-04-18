import { PublicKey } from '@did-btc1/key-pair';
import { BeaconUtils, Btc1Identifier, DidBtc1, IntermediateDidDocument } from '../../../../src/index.js';

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
const did = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const verificationMethod = [
  {
    id                 : '#initialKey',
    type               : 'Multikey',
    controller         : did,
    publicKeyMultibase
  }
];
const intermediateDocument = new IntermediateDidDocument({ id: did, verificationMethod, service });
const response = await DidBtc1.create({
  idType  : 'EXTERNAL',
  intermediateDocument,
  options : { version: 1, network: 'bitcoin' },
});

console.log('Created BTC1 Identifier and Initial Document:', JSON.stringify(response, null, 4));
const {hrp, version, network, genesisBytes} = Btc1Identifier.decode(response.did);
console.log('decoded', {hrp, version, network, genesisBytes});
const encoded = Btc1Identifier.encode({idType: 'EXTERNAL', version, network, genesisBytes});
console.log('encoded', encoded);