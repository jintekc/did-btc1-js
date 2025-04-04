import BitcoinRpc from '../../../../src/bitcoin/rpc-client.js';
import { BlockV3, DEFAULT_RPC_CLIENT_CONFIG } from '../../../../src/index.js';

const genesisTime = 1742996020000;
console.log(`Genesis time: ${genesisTime}`);

const targetTime = 1742996020000; // block 171
console.log(`Target time: ${targetTime}`);

const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);

const start = performance.now();
let iterations = 0;

const timespan = targetTime - genesisTime;
const blockspan = Math.floor(timespan / 600000);

let genesis = blockspan;
let tip = await rpc.getBlockCount();
let target = 0;

while (genesis <= tip) {
  iterations++;
  const mid = Math.floor((genesis + tip) / 2);

  // 3. Get the block data at "mid" height
  const block = await rpc.getBlock({ height: mid }) as BlockV3;

  // Check block's timestamp against targetTime
  if (block.time <= targetTime) {
    // This block is <= targetTime, so record it as a candidate and go higher
    target = mid;
    genesis = mid + 1;
  } else {
    // This block is after targetTime, go lower
    tip = mid - 1;
  }
}

// target is the height of the largest block with time <= targetTime
const end = performance.now();
console.log(
  `Binary Search
     Block found: ${target}
     Iterations: ${iterations}
     Elapsed time: ${(end - start).toFixed(2)} ms`
);
