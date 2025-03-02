import { DidBtc1 } from '../src/did-btc1.js';
import { DEFAULT_CLIENT_CONFIG as bitcoindConfig } from '../src/utils/bitcoind/constants.js';
// import { versions, networks, idTypes } from '../tests/test-data.js';
// const idType = idTypes.key;
// tr
// 029e0701b3e117a7358e9e37376b9174da15bbe12b4808c092c1c9ab4639494f33
// legacy
// parent tprv: tprv8ZgxMBicQKsPemKdkJo95pEgsZ97bwdKpZDyAdzQdWy1ktyjwjzLSeVdQo8HuRSzukHPPz469jPzH7M6d9fDTAHhK8GmQTYEkvUtsMEjbka
// public key encoded: mpVSuBsLpCyeKAjbHrTxwF7sLhsdHdNo5C
// public key hex: 030a6d40df2fc34574e3eae72b10c788b53374243ba3accf0bdcee9d0fac16aec3
// private key:
const hexpubkey = [
  '02', '9e', '07', '01', 'b3',
  'e1', '17', 'a7', '35', '8e',
  '9e', '37', '37', '6b', '91',
  '74', 'da', '15', 'bb', 'e1',
  '2b', '48', '08', 'c0', '92',
  'c1', 'c9', 'ab', '46', '39',
  '49', '4f', '33'
];
const bytes = hexpubkey.map(byte => parseInt(byte, 16));
const pubKeyBytes = new Uint8Array(bytes);
console.log('Creating BTC1 Key Id with pubKeyBytes:', pubKeyBytes);

const response = await DidBtc1.create({ pubKeyBytes, options: { bitcoindConfig } });
const clean = JSON.stringify(response, null, 4);
console.log('Created BTC1 Key Id and Initial Document:', clean);

// const responses = await Promise.all(
//     versions
//         .flatMap(version => networks.map(network => [version, network]))
//         .map(async ([version, network]) =>
//             await DidBtc1.create({
//                 pubKeyBytes,
//                 options: { version, network, idType },
//             }))
// );
// console.log(`Created ${responses.length} BTC1 Key Ids with versions and networks`);
// console.log('BTC1 Key Id Creation Responses:', JSON.stringify(responses, null, 4));
