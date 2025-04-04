import { PrivateKeyUtils } from '@did-btc1/key-pair';
import { DidBtc1 } from '../../../../src/did-btc1.js';

const privateKeyBytes = new Uint8Array([
  17,  87, 168, 209,  53,  45, 195, 181,
  106, 107, 229, 214, 230, 143,  67,  92,
  253, 201,  82, 152, 224,  64, 165, 185,
  163,  67, 170,  97,  84,  52, 245, 168
]);
const { privateKey, publicKey } = PrivateKeyUtils.toKeyPair(privateKeyBytes);
const pubKeyBytes = privateKey.computePublicKey().bytes;
console.log('Creating BTC1 Identifier with { privateKey, publicKey }:', { privateKey, publicKey });

const response = await DidBtc1.create({ idType: 'key', pubKeyBytes, options: { network: 'regtest' } });
const data = JSON.stringify(response, null, 4);
console.log('Created BTC1 Identifier and Initial Document:', data);