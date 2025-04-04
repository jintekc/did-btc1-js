import { DEFAULT_RPC_CLIENT_CONFIG } from '../../src/bitcoin/constants.js';
import BitcoinRpc from '../../src/bitcoin/rpc-client.js';
import { BlockV3 } from '../../src/index.js';

const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);
let height = 1;
const hash = '30d6ae9e1bbcc678b9a3a90152e64df6af3fa26133e779e5b3ba27a1c8bf6e67';
while(height < 168) {
  const block = await rpc.getBlock({ height }) as BlockV3;
  console.log(`block #${height}`);

  for(let tx of block.tx) {
    // console.log(`txn w/ txid: ${tx.txid}`, tx);
    for (const vout of tx?.vout) {
      // console.log(`\nvout #${vout.n}`, vout);
      if(vout.scriptPubKey.asm.includes(hash)) {
        console.log('\nvout.scriptPubKey.asm', );
      }
    }

    for (const vin of tx.vin) {
      // console.log('\nvin', vin);
      if(vin.prevout?.scriptPubKey?.asm.includes(hash)) {
        console.log('\nvin.prevout.scriptPubKey.asm', );
      }
    }
  }
  height++;
}