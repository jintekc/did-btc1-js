import Btc1AuxUtils from '../src/utils/aux.js';

const pubkeys = Array.from({ length: 10 }).map(_ => Btc1AuxUtils.generatePubKeyBytes());
const base58btc1Keys = pubkeys.map(pubkey => Btc1AuxUtils.base58btc1Encode(pubkey));
console.log('Base58 BTC1 Keys', base58btc1Keys);