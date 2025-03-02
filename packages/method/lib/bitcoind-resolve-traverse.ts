import Bitcoind from '../src/utils/bitcoind.js';
import { DEFAULT_CLIENT_CONFIG } from '../src/utils/bitcoind/constants.js';
import { RawTransactionVerbosity } from '../src/utils/bitcoind/types.js';
import { testKetDidDocument } from './out/test-key-did.js';

const bob = Bitcoind.connect(DEFAULT_CLIENT_CONFIG);
const contemporaryBlockheight = 1789;
const blockhash = await bob.getBlockHash(contemporaryBlockheight);
const block = await bob.getBlock(blockhash);
const txdata = await bob.getRawTransactions(block.tx, RawTransactionVerbosity.jsonext);
for (let tx of txdata) {
  for (let vout of tx.vout) {
    console.log('vout', vout);
    if(!vout.scriptPubKey?.address) continue;
    const beaconSignal = vout.scriptPubKey?.address
      .replace('addr(', '')
      .replace(/\)#([a-z0-9A-Z]*)/, '');
    const matches = testKetDidDocument.service.filter(service => `bitcoin:${service.serviceEndpoint}` === beaconSignal);
    console.log('matches', matches);
  }
}
